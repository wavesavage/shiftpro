import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, firstName, lastName, orgId, locationId, role, department, hourlyRate } = body;

    if (!email || !orgId) {
      return NextResponse.json({ 
        error: `Missing required fields: ${!email ? "email" : ""}${!orgId ? " orgId" : ""}`.trim()
      }, { status: 400 });
    }

    if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
      return NextResponse.json({ 
        error: "Server configuration error: SUPABASE_SERVICE_ROLE_KEY not set in Vercel environment variables" 
      }, { status: 500 });
    }

    const sb = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const { data: org } = await sb.from("organizations").select("id,name").eq("id", orgId).single();
    if (!org) return NextResponse.json({ error: "Organization not found" }, { status: 404 });

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

    if (error) {
      if (error.message?.includes("already been registered")) {
        return NextResponse.json({ 
          error: "This email already has a ShiftPro account. Use Resend Invite in their employee drawer." 
        }, { status: 409 });
      }
      throw error;
    }

    const initials = ((firstName?.[0] || "?") + (lastName?.[0] || "?")).toUpperCase();
    await sb.from("users").upsert({
      id: data.user.id, email,
      first_name: firstName || "", last_name: lastName || "",
      org_id: orgId, location_id: locationId || null,
      role: role || "Employee", department: department || "",
      hourly_rate: parseFloat(hourlyRate) || 15,
      app_role: "employee", status: "invited",
      avatar_initials: initials, avatar_color: "#6366f1",
    }, { onConflict: "id" });

    return NextResponse.json({ success: true, userId: data.user.id });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Invite failed" }, { status: 500 });
  }
}
