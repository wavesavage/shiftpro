import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";

const sb = () => createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const getUser = async (req: NextRequest) => {
  const token = req.headers.get("Authorization")?.replace("Bearer ", "");
  const { data: { user } } = await sb().auth.getUser(token!);
  return user;
};

// GET: Fetch all locations for an org
export async function GET(req: NextRequest) {
  try {
    const orgId = new URL(req.url).searchParams.get("orgId");
    if (!orgId) return NextResponse.json({ error: "orgId required" }, { status: 400 });
    const user = await getUser(req);
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const { data: locations, error } = await sb()
      .from("locations").select("*").eq("org_id", orgId).eq("active", true).order("created_at");
    if (error) throw error;
    return NextResponse.json({ locations: locations || [] });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// POST: Create a location
export async function POST(req: NextRequest) {
  try {
    const { orgId, name, address, timezone } = await req.json();
    if (!orgId || !name) return NextResponse.json({ error: "orgId and name required" }, { status: 400 });
    const user = await getUser(req);
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const { data: location, error } = await sb()
      .from("locations")
      .insert({ org_id: orgId, name, address: address || "", timezone: timezone || "America/Los_Angeles", active: true })
      .select().single();
    if (error) throw error;
    return NextResponse.json({ location });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// DELETE: Delete a location and all its data
export async function DELETE(req: NextRequest) {
  try {
    const { locationId } = await req.json();
    if (!locationId) return NextResponse.json({ error: "locationId required" }, { status: 400 });
    const user = await getUser(req);
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const client = sb();
    // Delete all related data first (service role bypasses RLS on all tables)
    await client.from("shifts").delete().eq("location_id", locationId);
    await client.from("clock_events").delete().eq("location_id", locationId);
    await client.from("users").update({ location_id: null }).eq("location_id", locationId);
    await client.from("locations").delete().eq("id", locationId);

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
