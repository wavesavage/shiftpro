import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { email, firstName, lastName, orgId, locationId, role, department, hourlyRate } = await req.json();
    if (!email || !orgId) {
      return NextResponse.json({ error: "email and orgId are required" }, { status: 400 });
    }

    const sb = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // Send invite email via Supabase Auth admin
    const { data, error } = await sb.auth.admin.inviteUserByEmail(email, {
      data: {
        first_name: firstName || "",
        last_name: lastName || "",
        org_id: orgId,
        location_id: locationId || null,
        role: role || "Employee",
        department: department || "",
        hourly_rate: hourlyRate || "15",
      },
      redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || "https://shiftpro.ai"}/#type=invite`,
    });

    if (error) throw error;

    // Upsert user record in users table
    const initials = ((firstName||"?")[0] + (lastName||"?")[0]).toUpperCase();
    await sb.from("users").upsert({
      id: data.user.id,
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
    }, { onConflict: "id" });

    return NextResponse.json({ success: true, userId: data.user.id });
  } catch (err: any) {
    // If user already exists, return friendly message
    if (err.message?.includes("already been registered")) {
      return NextResponse.json({ error: "This email already has an account. Use Resend Invite instead." }, { status: 409 });
    }
    return NextResponse.json({ error: err.message || "Invite failed" }, { status: 500 });
  }
}
