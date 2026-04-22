// src/lib/auth.ts
// ─────────────────────────────────────────────────────────────
// Shared auth helper for API routes.
// Verifies Supabase JWT from Authorization header, returns the
// authenticated user + their profile (role, org_id).
//
// Use in every API route handler BEFORE any DB write.
// ─────────────────────────────────────────────────────────────

import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;

export type AuthedUser = {
  id: string;           // Supabase auth user id
  email: string;
  role: string;         // app_role from users table: 'owner' | 'manager' | 'employee'
  orgId: string | null;
  locationId: string | null;
};

/**
 * Extract + verify the bearer token. Returns the authed user profile on success.
 * Throws on missing/invalid/expired tokens.
 */
export async function requireAuth(req: NextRequest): Promise<AuthedUser> {
  const authHeader = req.headers.get("authorization") || req.headers.get("Authorization") || "";
  const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7).trim() : "";

  if (!token) {
    throw new AuthError("Missing authorization token", 401);
  }

  // Verify the token with Supabase (uses anon key, but getUser(token) validates it)
  const anonClient = createClient(SUPABASE_URL, ANON_KEY);
  const { data: userData, error: userErr } = await anonClient.auth.getUser(token);

  if (userErr || !userData?.user) {
    throw new AuthError("Invalid or expired token", 401);
  }

  const user = userData.user;

  // Fetch the user's profile (role + org) using the service client (bypasses RLS)
  const svcClient = createClient(SUPABASE_URL, SERVICE_KEY);
  const { data: profile, error: profileErr } = await svcClient
    .from("users")
    .select("app_role, org_id, location_id")
    .eq("id", user.id)
    .single();

  if (profileErr || !profile) {
    throw new AuthError("User profile not found", 403);
  }

  return {
    id: user.id,
    email: user.email || "",
    role: profile.app_role || "employee",
    orgId: profile.org_id || null,
    locationId: profile.location_id || null,
  };
}

/**
 * Wraps requireAuth with a clean Response on failure.
 * Use like:
 *   const authed = await requireAuthOr401(req);
 *   if (authed instanceof NextResponse) return authed;
 *   // ...continue with authed.id, authed.role, authed.orgId
 */
export async function requireAuthOr401(req: NextRequest): Promise<AuthedUser | NextResponse> {
  try {
    return await requireAuth(req);
  } catch (e: any) {
    const status = e instanceof AuthError ? e.status : 401;
    return NextResponse.json({ error: e.message || "Unauthorized" }, { status });
  }
}

/**
 * Checks if the authed user is allowed to act on behalf of targetUserId.
 * - Users can always act on their own data.
 * - Owners/managers of the same org can act on their employees.
 * Throws if not allowed.
 */
export async function requireCanActOn(
  authed: AuthedUser,
  targetUserId: string,
  targetOrgId: string | null
): Promise<void> {
  // Self-action always allowed
  if (authed.id === targetUserId) return;

  // Cross-user action requires owner/manager role + same org
  if (authed.role !== "owner" && authed.role !== "manager") {
    throw new AuthError("Forbidden: can only act on your own data", 403);
  }

  if (targetOrgId && authed.orgId !== targetOrgId) {
    throw new AuthError("Forbidden: different organization", 403);
  }

  // If we don't have a targetOrgId, verify via DB lookup
  if (!targetOrgId) {
    const svc = createClient(SUPABASE_URL, SERVICE_KEY);
    const { data: target } = await svc.from("users").select("org_id").eq("id", targetUserId).single();
    if (!target || target.org_id !== authed.orgId) {
      throw new AuthError("Forbidden: user not in your organization", 403);
    }
  }
}

/**
 * Owner-only gate. Use for settings changes, billing, destructive ops.
 */
export function requireOwner(authed: AuthedUser): void {
  if (authed.role !== "owner") {
    throw new AuthError("Owner access required", 403);
  }
}

/**
 * Manager-or-owner gate. Use for schedule edits, approvals.
 */
export function requireManager(authed: AuthedUser): void {
  if (authed.role !== "owner" && authed.role !== "manager") {
    throw new AuthError("Manager or owner access required", 403);
  }
}

export class AuthError extends Error {
  status: number;
  constructor(message: string, status: number = 401) {
    super(message);
    this.status = status;
    this.name = "AuthError";
  }
}

/**
 * Service client — use AFTER auth passes, for DB writes that need to bypass RLS.
 * Never expose this to an unauthenticated caller.
 */
export function svcClient() {
  return createClient(SUPABASE_URL, SERVICE_KEY);
}
