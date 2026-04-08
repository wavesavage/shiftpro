export const dynamic = "force-dynamic";

import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";

const getServiceClient = () => createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: NextRequest) {
  try {
    const { email, firstName, lastName, orgId, locationId, role, department, hourlyRate, forceResend } = await req.json();
    if (!email || !orgId) return NextResponse.json({ error: "email and orgId required" }, { status: 400 });

    const sb = getServiceClient();
    const redirectTo = "https://shiftpro.ai/";

    // Check if user already exists in auth
    const { data: { users: existingUsers } } = await sb.auth.admin.listUsers({ perPage: 1000 });
    const existingAuthUser = existingUsers?.find(u => u.email?.toLowerCase() === email.toLowerCase());

    let userId: string;

    if (existingAuthUser) {
      // User exists in auth — send password reset (works as re-invite)
      userId = existingAuthUser.id;
      const { error: resetError } = await sb.auth.resetPasswordForEmail(email, { redirectTo });
      if (resetError) return NextResponse.json({ error: resetError.message }, { status: 500 });
    } else {
      // Brand new user — use inviteUserByEmail
      const { data: invited, error: inviteError } = await sb.auth.admin.inviteUserByEmail(email, {
        redirectTo,
        data: { first_name: firstName, last_name: lastName },
      });
      if (inviteError) return NextResponse.json({ error: inviteError.message }, { status: 500 });
      userId = invited.user.id;
    }

    // Upsert the users table row
    const avatarInitials = ((firstName?.[0] || "?") + (lastName?.[0] || "?")).toUpperCase();
    const COLORS = ["#6366f1","#8b5cf6","#0891b2","#1a9e6e","#e07b00","#d94040"];
    const avatarColor = COLORS[Math.floor(Math.random() * COLORS.length)];

    await sb.from("users").upsert({
      id: userId,
      first_name: firstName || "",
      last_name: lastName || "",
      org_id: orgId,
      location_id: locationId || null,
      app_role: "employee",
      status: "invited",
      role: role || "Employee",
      department: department || "",
      hourly_rate: parseFloat(hourlyRate || "15") || 15,
      avatar_initials: avatarInitials,
      avatar_color: avatarColor,
      hire_date: new Date().toISOString().split("T")[0],
    }, { onConflict: "id" });

    return NextResponse.json({ ok: true, userId, isExisting: !!existingAuthUser });

  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

// GET — heal orphaned account by email
export async function GET(req: NextRequest) {
  const healEmail = req.nextUrl.searchParams.get("healEmail");
  const orgId = req.nextUrl.searchParams.get("orgId");
  if (!healEmail || !orgId) return NextResponse.json({ error: "healEmail and orgId required" }, { status: 400 });

  const sb = getServiceClient();
  const { data: { users } } = await sb.auth.admin.listUsers({ perPage: 1000 });
  const user = users?.find(u => u.email?.toLowerCase() === healEmail.toLowerCase());
  if (!user) return NextResponse.json({ error: "User not found in auth" }, { status: 404 });

  await sb.from("users").upsert({
    id: user.id,
    org_id: orgId,
    app_role: "employee",
    status: "invited",
  }, { onConflict: "id" });

  return NextResponse.json({ ok: true, userId: user.id });
}
