export const dynamic = "force-dynamic";
import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";
import { pushToUser } from "@/lib/push-util";
import { emailUser } from "@/lib/email-util";

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

  if (type === "open_swaps") {
    const excludeUser = req.nextUrl.searchParams.get("excludeUser");
    const { data: swaps, error } = await client
      .from("shift_swap_requests").select("*")
      .eq("org_id", orgId).eq("status", "open")
      .order("created_at", { ascending: false }).limit(30);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    const filtered = excludeUser ? (swaps || []).filter((s: any) => s.user_id !== excludeUser) : (swaps || []);
    return NextResponse.json({ swaps: filtered }, NO_CACHE);
  }

  if (type === "swaps") {
    const { data: swaps, error } = await client
      .from("shift_swap_requests").select("*")
      .eq("org_id", orgId).in("status", ["open", "claimed", "pending"])
      .order("created_at", { ascending: false }).limit(30);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    const allUserIds: string[] = Array.from(new Set(
      (swaps || []).flatMap((s: any) => [s.user_id, s.claimed_by_id].filter(Boolean))
    ));
    const userMap: Record<string, any> = {};
    if (allUserIds.length > 0) {
      const { data: users } = await client.from("users").select("id, first_name, last_name, avatar_color").in("id", allUserIds);
      (users || []).forEach(u => { userMap[u.id] = u; });
    }
    const enriched = (swaps || []).map(s => ({ ...s, users: userMap[s.user_id] || null, claimer: s.claimed_by_id ? userMap[s.claimed_by_id] || null : null }));
    return NextResponse.json({ swaps: enriched }, NO_CACHE);
  }

  if (type === "timeoff") {
    const { data: timeoff, error } = await client
      .from("time_off_requests").select("*")
      .eq("org_id", orgId).eq("status", "pending")
      .order("created_at", { ascending: false }).limit(20);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    const userIds: string[] = Array.from(new Set((timeoff || []).map((t: any) => t.user_id).filter(Boolean)));
    const userMap: Record<string, any> = {};
    if (userIds.length > 0) {
      const { data: users } = await client.from("users").select("id, first_name, last_name, avatar_color").in("id", userIds);
      (users || []).forEach(u => { userMap[u.id] = u; });
    }
    const enriched = (timeoff || []).map(t => ({ ...t, users: userMap[t.user_id] || null }));
    return NextResponse.json({ timeoff: enriched }, NO_CACHE);
  }

  return NextResponse.json({ error: "type must be swaps, open_swaps, or timeoff" }, { status: 400 });
}

export async function POST(req: NextRequest) {
  try {
    const { table, id, status } = await req.json();
    if (!table || !id || !status) return NextResponse.json({ error: "table, id, status required" }, { status: 400 });
    const allowed = ["shift_swap_requests", "time_off_requests"];
    if (!allowed.includes(table)) return NextResponse.json({ error: "Invalid table" }, { status: 400 });

    const client = sb();

    // ── SWAP APPROVAL/DENIAL ──
    if (table === "shift_swap_requests" && (status === "approved" || status === "denied")) {
      const { data: swap, error: fetchErr } = await client
        .from("shift_swap_requests").select("*").eq("id", id).single();
      if (fetchErr || !swap) return NextResponse.json({ error: "Swap not found" }, { status: 404 });

      const fH = (h: number) => h === 0 ? "12am" : h < 12 ? h + "am" : h === 12 ? "12pm" : (h - 12) + "pm";
      const timeStr = swap.start_hour != null && swap.end_hour != null ? " " + fH(swap.start_hour) + "–" + fH(swap.end_hour) : "";
      const dateStr = swap.shift_date || "";

      if (status === "approved") {
        if (swap.claimed_by_id && swap.shift_id) {
          const { error: shiftErr } = await client.from("shifts")
            .update({ user_id: swap.claimed_by_id }).eq("id", swap.shift_id);
          if (shiftErr) console.error("[requests] shift reassign failed:", shiftErr.message);
        }

        // 🔔📧 Notify poster
        pushToUser(swap.user_id, "✅ Swap Approved", "Your shift has been reassigned. You're off the hook!", "/", "swap-approved-" + id).catch(() => {});
        emailUser(swap.user_id, "Shift Swap Approved", "✅ Swap Approved!",
          "Your shift on <strong>" + dateStr + timeStr + "</strong> has been covered. You're off the hook!",
          "Open ShiftPro", "https://shiftpro.ai"
        ).catch(() => {});

        // 🔔📧 Notify claimer
        if (swap.claimed_by_id) {
          pushToUser(swap.claimed_by_id, "📅 New Shift Assigned", "You've been assigned " + dateStr + timeStr + ". Check your schedule!", "/", "swap-assigned-" + id).catch(() => {});
          emailUser(swap.claimed_by_id, "New Shift Assigned to You", "📅 New Shift Assigned",
            "You've been assigned the shift on <strong>" + dateStr + timeStr + "</strong>.<br><br>This shift has been added to your schedule.",
            "View My Schedule", "https://shiftpro.ai"
          ).catch(() => {});
        }
      }

      if (status === "denied") {
        pushToUser(swap.user_id, "❌ Swap Denied", "Your swap request was denied. You're still on for your original shift.", "/", "swap-denied-" + id).catch(() => {});
        emailUser(swap.user_id, "Shift Swap Denied", "❌ Swap Denied",
          "Your shift swap request for <strong>" + dateStr + timeStr + "</strong> was denied. You're still scheduled for your original shift.",
          "Open ShiftPro", "https://shiftpro.ai"
        ).catch(() => {});

        if (swap.claimed_by_id) {
          pushToUser(swap.claimed_by_id, "❌ Swap Denied", "The shift swap you claimed was denied by management.", "/", "swap-denied-claimer-" + id).catch(() => {});
          emailUser(swap.claimed_by_id, "Shift Swap Denied", "❌ Swap Denied",
            "The shift swap you claimed was denied by management. No changes have been made to your schedule.",
            "Open ShiftPro", "https://shiftpro.ai"
          ).catch(() => {});
        }
      }

      const { error } = await client.from("shift_swap_requests")
        .update({ status, updated_at: new Date().toISOString() }).eq("id", id);
      if (error) return NextResponse.json({ error: error.message }, { status: 500 });
      return NextResponse.json({ ok: true, shiftReassigned: status === "approved" && !!(swap.claimed_by_id && swap.shift_id) });
    }

    // ── TIME OFF APPROVAL/DENIAL ──
    if (table === "time_off_requests" && (status === "approved" || status === "denied")) {
      const { data: req2 } = await client.from("time_off_requests").select("*").eq("id", id).single();

      const { error } = await client.from(table)
        .update({ status, updated_at: new Date().toISOString() }).eq("id", id);
      if (error) return NextResponse.json({ error: error.message }, { status: 500 });

      if (req2?.user_id) {
        const emoji = status === "approved" ? "✅" : "❌";
        const dateRange = req2.start_date === req2.end_date ? req2.start_date : req2.start_date + " to " + req2.end_date;

        pushToUser(req2.user_id, emoji + " Time Off " + (status === "approved" ? "Approved" : "Denied"),
          "Your request for " + dateRange + " was " + status + ".", "/", "timeoff-" + status + "-" + id).catch(() => {});
        emailUser(req2.user_id,
          "Time Off " + (status === "approved" ? "Approved" : "Denied"),
          emoji + " Time Off " + (status === "approved" ? "Approved" : "Denied"),
          "Your time off request for <strong>" + dateRange + "</strong> has been <strong>" + status + "</strong>." +
          (status === "approved" ? "<br><br>Enjoy your time off!" : "<br><br>Please speak with your manager if you have questions."),
          "Open ShiftPro", "https://shiftpro.ai"
        ).catch(() => {});
      }
      return NextResponse.json({ ok: true });
    }

    // ── GENERIC STATUS UPDATE ──
    const { error } = await client.from(table)
      .update({ status, updated_at: new Date().toISOString() }).eq("id", id);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ ok: true });
  } catch (e: any) {
    console.error("[requests POST]", e.message);
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
