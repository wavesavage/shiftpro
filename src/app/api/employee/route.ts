export const dynamic = "force-dynamic";

import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";
import { pushToOrg, pushToUser, pushToManagers } from "@/lib/push-util";
import { emailOrg, emailUser, emailManagers } from "@/lib/email-util";

const sb = () => createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const NO_CACHE = { headers: { "Cache-Control": "no-store, no-cache, must-revalidate" } };

export async function GET(req: NextRequest) {
  const type = req.nextUrl.searchParams.get("type");
  const userId = req.nextUrl.searchParams.get("userId");
  const orgId = req.nextUrl.searchParams.get("orgId");
  if (!userId) return NextResponse.json({ error: "userId required" }, { status: 400 });
  const client = sb();

  if (type === "shifts") {
    const today = new Date().toISOString().split("T")[0];
    const { data: shifts } = await client.from("shifts").select("*, locations(name)")
      .eq("user_id", userId).gte("shift_date", today)
      .in("status", ["scheduled", "published", "confirmed"]).order("shift_date");
    let openShifts: any[] = [];
    if (orgId) {
      const { data: open } = await client.from("shifts").select("*, locations(name)")
        .eq("org_id", orgId).eq("status", "open").gte("shift_date", today).order("shift_date").limit(20);
      openShifts = open || [];
    }
    return NextResponse.json({ shifts: shifts || [], openShifts }, NO_CACHE);
  }

  if (type === "clock") {
    const monthStart = new Date(); monthStart.setDate(1); monthStart.setHours(0, 0, 0, 0);
    const today = new Date().toISOString().split("T")[0];
    const { data: monthEvents } = await client.from("clock_events").select("*")
      .eq("user_id", userId).gte("occurred_at", monthStart.toISOString()).order("occurred_at");
    const { data: todayEvents } = await client.from("clock_events").select("*")
      .eq("user_id", userId).gte("occurred_at", today).order("occurred_at", { ascending: false }).limit(10);
    return NextResponse.json({ monthEvents: monthEvents || [], todayEvents: todayEvents || [] }, NO_CACHE);
  }

  return NextResponse.json({ error: "unknown type" }, { status: 400 });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const client = sb();

    if (body._action === "clock") {
      const { error } = await client.from("clock_events").insert({
        user_id: body.userId, org_id: body.orgId || null, location_id: body.locId || null,
        event_type: body.eventType, occurred_at: new Date().toISOString(),
      });
      if (error) return NextResponse.json({ error: error.message }, { status: 500 });
      return NextResponse.json({ ok: true });
    }

    if (body._action === "swap_request") {
      const { error } = await client.from("shift_swap_requests").insert({
        user_id: body.userId, org_id: body.orgId || null,
        reason: body.reason, shift_date: body.shiftDate || null,
        shift_id: body.shiftId || null, poster_name: body.posterName || null,
        start_hour: body.startHour ?? null, end_hour: body.endHour ?? null,
        day_of_week: body.dayOfWeek || null, status: "open",
        created_at: new Date().toISOString(),
      });
      if (error) return NextResponse.json({ error: error.message }, { status: 500 });

      if (body.orgId) {
        const fH = (h: number) => h === 0 ? "12am" : h < 12 ? h + "am" : h === 12 ? "12pm" : (h - 12) + "pm";
        const timeStr = body.startHour != null && body.endHour != null ? " " + fH(body.startHour) + "–" + fH(body.endHour) : "";
        const dateStr = body.shiftDate ? new Date(body.shiftDate + "T12:00:00").toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" }) : "";
        const name = body.posterName || "A coworker";

        // 🔔 Push
        pushToOrg(body.orgId, "🔄 Shift Available", name + " needs " + dateStr + timeStr + " covered!", "/", "swap-" + Date.now(), body.userId).catch(() => {});
        // 📧 Email
        emailOrg(body.orgId, "Shift Available for Swap", "🔄 Shift Available",
          name + " needs their <strong>" + dateStr + timeStr + "</strong> shift covered.<br><br>Open ShiftPro to claim it before someone else does!",
          "View Available Swaps", "https://shiftpro.ai", body.userId
        ).catch(() => {});
      }
      return NextResponse.json({ ok: true });
    }

    if (body._action === "claim_swap") {
      const { data: swap, error: fetchErr } = await client
        .from("shift_swap_requests").select("*").eq("id", body.swapId).single();
      if (fetchErr || !swap) return NextResponse.json({ error: "Swap not found" }, { status: 404 });
      if (swap.status !== "open") return NextResponse.json({ error: "Already claimed" }, { status: 400 });
      if (swap.user_id === body.userId) return NextResponse.json({ error: "Can't claim your own swap" }, { status: 400 });

      const { error: updateErr } = await client.from("shift_swap_requests")
        .update({ claimed_by_id: body.userId, claimed_by_name: body.userName || "Employee", status: "claimed", updated_at: new Date().toISOString() })
        .eq("id", body.swapId);
      if (updateErr) return NextResponse.json({ error: updateErr.message }, { status: 500 });

      const claimer = body.userName || "A coworker";

      // 🔔 Push poster
      pushToUser(swap.user_id, "✅ Your Shift Was Claimed!", claimer + " wants to take your shift. Waiting for manager approval.", "/", "swap-claimed-" + body.swapId).catch(() => {});
      // 📧 Email poster
      emailUser(swap.user_id, "Your Shift Was Claimed", "✅ Shift Claimed!",
        "<strong>" + claimer + "</strong> wants to take your shift. A manager will review and approve the swap shortly.",
        "Open ShiftPro", "https://shiftpro.ai"
      ).catch(() => {});

      // 🔔 Push managers
      if (swap.org_id) {
        pushToManagers(swap.org_id, "📋 Swap Ready to Approve", claimer + " wants to take " + (swap.poster_name || "a coworker") + "'s shift.", "/", "swap-review-" + body.swapId).catch(() => {});
        // 📧 Email managers
        emailManagers(swap.org_id, "Shift Swap Ready for Approval", "📋 Swap Ready to Approve",
          "<strong>" + claimer + "</strong> wants to take <strong>" + (swap.poster_name || "an employee") + "</strong>'s shift.<br><br>Log in to approve or deny this swap.",
          "Review Swap", "https://shiftpro.ai"
        ).catch(() => {});
      }
      return NextResponse.json({ ok: true });
    }

    if (body._action === "time_off") {
      const { error } = await client.from("time_off_requests").insert({
        user_id: body.userId, org_id: body.orgId || null,
        start_date: body.startDate, end_date: body.endDate,
        reason: body.reason || "", status: "pending", created_at: new Date().toISOString(),
      });
      if (error) return NextResponse.json({ error: error.message }, { status: 500 });

      if (body.orgId) {
        const { data: user } = await client.from("users").select("first_name, last_name").eq("id", body.userId).single();
        const name = user ? ((user.first_name || "") + " " + (user.last_name || "")).trim() : "An employee";
        const dateRange = body.startDate === body.endDate ? body.startDate : body.startDate + " to " + body.endDate;
        pushToManagers(body.orgId, "📆 Time Off Request", name + " requested " + dateRange + " off.", "/", "timeoff-" + Date.now()).catch(() => {});
        emailManagers(body.orgId, "Time Off Request", "📆 Time Off Request",
          "<strong>" + name + "</strong> requested <strong>" + dateRange + "</strong> off." + (body.reason ? "<br><br>Reason: " + body.reason : ""),
          "Review Request", "https://shiftpro.ai"
        ).catch(() => {});
      }
      return NextResponse.json({ ok: true });
    }

    if (body._action === "claim_shift") {
      const { error } = await client.from("shifts")
        .update({ user_id: body.userId, status: "confirmed" }).eq("id", body.shiftId);
      if (error) return NextResponse.json({ error: error.message }, { status: 500 });
      return NextResponse.json({ ok: true });
    }

    if (body._action === "mark_read") {
      await client.from("messages").update({ read: true }).eq("id", body.messageId);
      return NextResponse.json({ ok: true });
    }

    return NextResponse.json({ error: "unknown action" }, { status: 400 });
  } catch (e: any) {
    console.error("[employee POST]", e.message);
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
