import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { orgId, name, address, timezone } = await req.json();
    if (!orgId || !name) {
      return NextResponse.json({ error: "orgId and name are required" }, { status: 400 });
    }

    const authHeader = req.headers.get("Authorization");
    const token = authHeader?.replace("Bearer ", "");

    const sb = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // Verify the user owns this org
    const { data: { user } } = await sb.auth.getUser(token!);
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { data: ownership } = await sb
      .from("owner_organizations")
      .select("org_id")
      .eq("owner_id", user.id)
      .eq("org_id", orgId)
      .single();

    if (!ownership) return NextResponse.json({ error: "Unauthorized" }, { status: 403 });

    const { data: location, error } = await sb
      .from("locations")
      .insert({ org_id: orgId, name, address: address || "", timezone: timezone || "America/Los_Angeles", active: true })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ location });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to create location" }, { status: 500 });
  }
}
