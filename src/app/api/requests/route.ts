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

  // ── OPEN SWAPS — for employees to see available swaps from coworkers ──
  if (type === "open_swaps") {
    const excludeUser = req.nextUrl.searchParams.get("excludeUser");
    let q = client
      .from("shift_swap_requests")
      .select("*")
      .eq("org_id", orgId)
      .eq("status", "open")
      .order("created_at", { ascending: false })
      .limit(30);

    const { data: swaps, error } = await q;
    if (error) {
      console.error("[requests GET open_swaps]", error.message);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Filter out the requesting user's own swaps (can't claim your own)
    const filtered = excludeUser
      ? (swaps || []).filter((s: any) => s.user_id !== excludeUser)
      : (swaps || []);

    return NextResponse.json({ swaps: filtered }, NO_CACHE);
  }

  // ── MANAGER VIEW — all swaps needing attention ──
  if (type === "swaps") {
    const { data: swaps, error: swapsErr } = await client
      .from("shift_swap_requests")
      .select("*")
      .eq("org_id", orgId)
      .in("status", ["open", "claimed", "pending"])  // Show all active swaps
      .order("created_at", { ascending: false })
      .limit(30);

    if (swapsErr) {
      console.error("[requests GET swaps]", swapsErr.message);
      return NextResponse.json({ error: swapsErr.message }, { status: 500 });
    }

    // Enrich with user names
    const allUserIds: string[] = Array.from(new Set(
      (swaps || []).flatMap((s: any) => [s.user_id, s.claimed_by_id].filter(Boolean))
    ));
    const userMap: Record<string, any> = {};
    if (allUserIds.length > 0) {
      const { data: users } = await client
        .from("users")
        .select("id, first_name, last_name, avatar_color")
        .in("id", allUserIds);
      (users || []).forEach(u => { userMap[u.id] = u; });
    }

    const enriched = (swaps || []).map(s => ({
      ...s,
      users: userMap[s.user_id] || null,
      claimer: s.claimed_by_id ? userMap[s.claimed_by_id] || null : null,
    }));

    return NextResponse.json({ swaps: enriched }, NO_CACHE);
  }

  // ── TIME OFF REQUESTS ──
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

  return NextResponse.json({ error: "type must be swaps, open_swaps, or timeoff" }, { status: 400 });
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

    const client = sb();

    // ── SWAP APPROVAL — reassign the shift ──
    if (table === "shift_swap_requests" && status === "approved") {
      // Get the swap request details
      const { data: swap, error: fetchErr } = await client
        .from("shift_swap_requests")
        .select("*")
        .eq("id", id)
        .single();

      if (fetchErr || !swap) {
        return NextResponse.json({ error: "Swap not found" }, { status: 404 });
      }

      // If someone has claimed this swap, reassign the shift
      if (swap.claimed_by_id && swap.shift_id) {
        const { error: shiftErr } = await client
          .from("shifts")
          .update({ user_id: swap.claimed_by_id })
          .eq("id", swap.shift_id);

        if (shiftErr) {
          console.error("[requests] shift reassignment failed:", shiftErr.message);
          // Don't block approval — shift might have been deleted
        } else {
          console.log("[requests] shift", swap.shift_id, "reassigned from", swap.user_id, "to", swap.claimed_by_id);
        }
      }

      // Update swap status to approved
      const { error } = await client
        .from("shift_swap_requests")
        .update({ status: "approved", updated_at: new Date().toISOString() })
        .eq("id", id);

      if (error) return NextResponse.json({ error: error.message }, { status: 500 });
      return NextResponse.json({ ok: true, shiftReassigned: !!(swap.claimed_by_id && swap.shift_id) });
    }

    // ── STANDARD STATUS UPDATE (deny, etc.) ──
    const { error } = await client
      .from(table)
      .update({ status, updated_at: new Date().toISOString() })
      .eq("id", id);

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ ok: true });
  } catch (e: any) {
    console.error("[requests POST]", e.message);
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
