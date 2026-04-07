import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, firstName, lastName, orgId, locationId, role, department, hourlyRate, forceResend } = body;

    if (!email || !orgId) {
      return NextResponse.json({ 
        error: `Missing: ${!email ? "email " : ""}${!orgId ? "orgId" : ""}`.trim()
      }, { status: 400 });
    }

    if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
      return NextResponse.json({ error: "SUPABASE_SERVICE_ROLE_KEY not set in Vercel env vars" }, { status: 500 });
    }

    // Always use service role — bypasses ALL RLS
    const sb = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { auth: { autoRefreshToken: false, persistSession: false } }
    );

    const initials = ((firstName?.[0] || "?") + (lastName?.[0] || "?")).toUpperCase();
    const userRecord = {
      email,
      first_name: firstName || "",
      last_name: lastName || "",
      org_id: orgId,
      location_id: locationId || null,
      role: role || "Employee",
      department: department || "",
      hourly_rate: parseFloat(hourlyRate) || 15,
      app_role: "employee",
      status: "invited",
      avatar_initials: initials,
      avatar_color: "#6366f1",
    };

    // If forceResend — find existing user and resend
    if (forceResend) {
      const { data: { users: allUsers } } = await sb.auth.admin.listUsers({ perPage: 1000 });
      const existing = allUsers?.find((u: any) => u.email === email);
      
      if (existing) {
        // Update their profile to ensure org_id is correct
        await sb.from("users").upsert({ id: existing.id, ...userRecord }, { onConflict: "id" });
        
        // Generate new invite link
        await sb.auth.admin.inviteUserByEmail(email, {
          data: { first_name: firstName, last_name: lastName, org_id: orgId },
          redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || "https://shiftpro.ai"}/#type=invite`,
        });

        return NextResponse.json({ success: true, resenOk: true });
      }
    }

    // Send invite
    const { data, error } = await sb.auth.admin.inviteUserByEmail(email, {
      data: { first_name: firstName, last_name: lastName, org_id: orgId, location_id: locationId },
      redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || "https://shiftpro.ai"}/#type=invite`,
    });

    if (error) {
      if (error.message?.includes("already been registered")) {
        return NextResponse.json({ 
          error: "This email already has a ShiftPro account. Use Resend Invite in their employee drawer."
        }, { status: 409 });
      }
      throw error;
    }

    // Upsert user record with service role — guaranteed to succeed
    const { error: upsertErr } = await sb.from("users").upsert(
      { id: data.user.id, ...userRecord },
      { onConflict: "id" }
    );

    if (upsertErr) {
      console.error("User upsert failed:", upsertErr.message);
      // Don't fail the whole invite — auth user was created
    }

    return NextResponse.json({ success: true, userId: data.user.id });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Invite failed" }, { status: 500 });
  }
}

// GET: Check and auto-heal an orphaned user (exists in auth but missing from users table)
export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const healEmail = url.searchParams.get("healEmail");
    const orgId = url.searchParams.get("orgId");

    if (!healEmail || !orgId) {
      return NextResponse.json({ error: "healEmail and orgId required" }, { status: 400 });
    }

    if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
      return NextResponse.json({ error: "Service key not configured" }, { status: 500 });
    }

    const sb = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { auth: { autoRefreshToken: false, persistSession: false } }
    );

    // Find auth user by email
    const { data: { users: allUsers } } = await sb.auth.admin.listUsers({ perPage: 1000 });
    const authUser = allUsers?.find((u: any) => u.email === healEmail);

    if (!authUser) {
      return NextResponse.json({ found: false, message: "No auth account found for this email" });
    }

    // Check if users table row exists
    const { data: existing } = await sb.from("users").select("id, org_id, status").eq("id", authUser.id).single();

    if (existing && existing.org_id) {
      return NextResponse.json({ found: true, healed: false, message: "User record already exists and is linked" });
    }

    // Create or fix the users table row
    const meta = authUser.user_metadata || {};
    await sb.from("users").upsert({
      id: authUser.id,
      first_name: meta.first_name || healEmail.split("@")[0],
      last_name: meta.last_name || "",
      org_id: orgId,
      location_id: meta.location_id || null,
      role: meta.role || "Employee",
      department: meta.department || "",
      hourly_rate: parseFloat(meta.hourly_rate) || 15,
      app_role: "employee",
      status: authUser.email_confirmed_at ? "active" : "invited",
      avatar_initials: ((meta.first_name?.[0] || healEmail[0]) + (meta.last_name?.[0] || "")).toUpperCase(),
      avatar_color: "#6366f1",
    }, { onConflict: "id" });

    return NextResponse.json({ found: true, healed: true, userId: authUser.id });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
