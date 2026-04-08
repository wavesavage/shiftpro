export const dynamic = "force-dynamic";

import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";

const sb = () => createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const NO_CACHE = { headers: { "Cache-Control": "no-store" } };

// GET — load pending requests for owner
export async function GET(req: NextRequest) {
  const type = req.nextUrl.searchParams.get("type");
  const orgId = req.nextUrl.searchParams.get("orgId");
  if (!orgId) return NextResponse.json({ error: "orgId required" }, { status: 400 });

  const client = sb();

  if (type === "swaps") {
    const { data, error } = await client
      .from("shift_swap_requests")
      .select("*, users!shift_swap_requests_user_id_fkey(first_name,last_name,avatar_initials,avatar_color)")
      .eq("org_id", orgId)
      .eq("status", "pending")
      .order("created_at", { ascending: false })
      .limit(20);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ swaps: data || [] }, NO_CACHE);
  }

  if (type === "timeoff") {
    const { data, error } = await client
      .from("time_off_requests")
      .select("*, users!time_off_requests_user_id_fkey(first_name,last_name,avatar_initials,avatar_color)")
      .eq("org_id", orgId)
      .eq("status", "pending")
      .order("created_at", { ascending: false })
      .limit(20);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ timeoff: data || [] }, NO_CACHE);
  }

  return NextResponse.json({ error: "type must be swaps or timeoff" }, { status: 400 });
}

// POST — approve or deny a request
export async function POST(req: NextRequest) {
  try {
    const { table, id, status } = await req.json();
    if (!table || !id || !status) {
      return NextResponse.json({ error: "table, id, status required" }, { status: 400 });
    }
    const allowed = ["shift_swap_requests", "time_off_requests"];
    if (!allowed.includes(table)) {
      return NextResponse.json({ error: "Invalid table" }, { status: 400 });
    }
    const { error } = await sb()
      .from(table)
      .update({ status, updated_at: new Date().toISOString() })
      .eq("id", id);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
