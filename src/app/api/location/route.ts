import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";

const getServiceClient = () =>
  createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

// GET: Fetch all locations for an org
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const orgId = searchParams.get("orgId");
    if (!orgId) return NextResponse.json({ error: "orgId required" }, { status: 400 });

    // Verify user is authenticated
    const authHeader = req.headers.get("Authorization");
    const token = authHeader?.replace("Bearer ", "");
    const sb = getServiceClient();
    const { data: { user } } = await sb.auth.getUser(token!);
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    // Service role bypasses RLS — returns ALL locations for this org
    const { data: locations, error } = await sb
      .from("locations")
      .select("*")
      .eq("org_id", orgId)
      .eq("active", true)
      .order("created_at");

    if (error) throw error;
    return NextResponse.json({ locations: locations || [] });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to fetch locations" }, { status: 500 });
  }
}

// POST: Create a new location
export async function POST(req: NextRequest) {
  try {
    const { orgId, name, address, timezone } = await req.json();
    if (!orgId || !name) return NextResponse.json({ error: "orgId and name required" }, { status: 400 });

    const authHeader = req.headers.get("Authorization");
    const token = authHeader?.replace("Bearer ", "");
    const sb = getServiceClient();

    // Verify user is authenticated
    const { data: { user } } = await sb.auth.getUser(token!);
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    // Service role bypasses RLS — insert directly
    const { data: location, error } = await sb
      .from("locations")
      .insert({
        org_id: orgId,
        name,
        address: address || "",
        timezone: timezone || "America/Los_Angeles",
        active: true,
      })
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json({ location });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to create location" }, { status: 500 });
  }
}
