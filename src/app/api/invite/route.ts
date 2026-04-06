import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { email, firstName, lastName, orgId, locationId, role, department, hourlyRate } = await req.json();
    if (!email || !orgId) return NextResponse.json({ error: "email and orgId required" }, { status: 400 });
    const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);
    const { data, error } = await sb.auth.admin.inviteUserByEmail(email, {
      data: { first_name: firstName, last_name: lastName, org_id: orgId, location_id: locationId, role, department, hourly_rate: hourlyRate }
    });
    if (error) throw error;
    await sb.from("users").upsert({
      id: data.user.id, email, first_name: firstName, last_name: lastName,
      org_id: orgId, location_id: locationId || null, role: role || "Employee",
      department: department || "", hourly_rate: parseFloat(hourlyRate) || 15,
      app_role: "employee", status: "invited",
      avatar_initials: (firstName[0] + lastName[0]).toUpperCase()
    }, { onConflict: "id" });
    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Invite failed" }, { status: 500 });
  }
}
