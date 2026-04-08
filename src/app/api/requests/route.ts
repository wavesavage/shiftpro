export const dynamic = "force-dynamic";
import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";

const sb = () => createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);
const NO_CACHE = { headers: { "Cache-Control": "no-store, no-cache, must-revalidate" } };

export async function GET(req: NextRequest) {
  const type  = req.nextUrl.searchParams.get("type");
  const orgId = req.nextUrl.searchParams.get("orgId");
  if (!orgId) return NextResponse.json({ error: "orgId required" }, { status: 400 });

  const client = sb();

  if (type === "swaps") {
    // Simple query — no FK joins that might fail with wrong constraint name
    const { data: swaps, error: swapsErr } = await client
      .from("shift_swap_requests")
      .select("*")
      .eq("org_id", orgId)
      .eq("status", "pending")
      .order("created_at", { ascending: false })
      .limit(20);

    if (swapsErr) {
      console.error("[requests GET swaps]", swapsErr.message);
      return NextResponse.json({ error: swapsErr.message }, { status: 500 });
    }

    // Enrich with user names in a separate query
    const userIds: string[] = Array.from(new Set((swaps || []).map((s: any) => s.user_id).filter(Boolean)));
    const userMap: Record<string, any> = {};
    if (userIds.length > 0) {
      const { data: users } = await client
        .from("users")
        .select("id, first_name, last_name, avatar_color")
        .in("id", userIds);
      (users || []).forEach(u => { userMap[u.id] = u; });
    }

    const enriched = (swaps || []).map(s => ({
      ...s,
      users: userMap[s.user_id] || null,
    }));

    return NextResponse.json({ swaps: enriched }, NO_CACHE);
  }

  if (type === "timeoff") {
    const { data: timeoff, error: toErr } = await client
      .from("time_off_requests")
      .select("*")
      .eq("org_id", orgId)
      .eq("status", "pending")
      .order("created_at", { ascending: false })
      .limit(20);

    if (toErr) {
      console.error("[requests GET timeoff]", toErr.message);
      return NextResponse.json({ error: toErr.message }, { status: 500 });
    }

    const userIds: string[] = Array.from(new Set((timeoff || []).map((t: any) => t.user_id).filter(Boolean)));
    const userMap: Record<string, any> = {};
    if (userIds.length > 0) {
      const { data: users } = await client
        .from("users")
        .select("id, first_name, last_name, avatar_color")
        .in("id", userIds);
      (users || []).forEach(u => { userMap[u.id] = u; });
    }

    const enriched = (timeoff || []).map(t => ({
      ...t,
      users: userMap[t.user_id] || null,
    }));

    return NextResponse.json({ timeoff: enriched }, NO_CACHE);
  }

  return NextResponse.json({ error: "type must be swaps or timeoff" }, { status: 400 });
}

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
