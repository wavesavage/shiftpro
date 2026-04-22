// src/app/api/employee/route.ts
export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { pushToOrg, pushToUser, pushToManagers } from "@/lib/push-util";
import { emailOrg, emailUser, emailManagers } from "@/lib/email-util";
import { requireAuthOr401, requireCanActOn, svcClient } from "@/lib/auth";

const NO_CACHE = { headers: { "Cache-Control": "no-store, no-cache, must-revalidate" } };

// ─────────────────────────────────────────────────────────────
// GET: fetch shifts or clock events for an employee
// Auth: user must be self OR manager/owner of the target's org
// ─────────────────────────────────────────────────────────────
export async function GET(req: NextRequest) {
  const authed = await requireAuthOr401(req);
  if (authed instanceof NextResponse) return authed;

  const type = req.nextUrl.searchParams.get("type");
  const userId = req.nextUrl.searchParams.get("userId");
  const orgId = req.nextUrl.searchParams.get("orgId");
  if (!userId) return NextResponse.json({ error: "userId required" }, { status: 400 });

  // Authz: can only read data for self OR as owner/manager of same org
  try {
    await requireCanActOn(authed, userId, orgId);
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: e.status || 403 });
  }

  const client = svcClient();

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

// ─────────────────────────────────────────────────────────────
// POST: employee actions (clock, swap_request, claim_swap, time_off, claim_shift, mark_read)
// Auth required — every action verifies the target userId matches the authed user
// OR that the authed user is a manager/owner acting on someone in their org.
// ─────────────────────────────────────────────────────────────
export async function POST(req: NextRequest) {
  const authed = await requireAuthOr401(req);
  if (authed instanceof NextResponse) return authed;

  try {
    const body = await req.json();
    const client = svcClient();

    // ───── CLOCK ─────
    if (body._action === "clock") {
      if (!body.userId) return NextResponse.json({ error: "userId required" }, { status: 400 });

      // Only self can clock in/out (managers use separate admin endpoint)
      if (authed.id !== body.userId) {
        return NextResponse.json({ error: "Can only clock in/out for yourself" }, { status: 403 });
      }

      const validEvents = ["clock_in", "clock_out", "break_start", "break_end"];
      if (!validEvents.includes(body.eventType)) {
        return NextResponse.json({ error: "Invalid event type" }, { status: 400 });
      }

      const { error } = await client.from("clock_events").insert({
        user_id: body.userId,
        org_id: body.orgId || authed.orgId || null,
        location_id: body.locId || authed.locationId || null,
        event_type: body.eventType,
        occurred_at: new Date().toISOString(),
        gps_lat: body.gpsLat || null,
        gps_lng: body.gpsLng || null,
        gps_accuracy: body.gpsAccuracy || null,
      });
      if (error) {
        console.warn("[clock_events insert]", error.message);
        return NextResponse.json({ error: error.message }, { status: 500 });
      }
      return NextResponse.json({ ok: true });
    }

    // ───── SWAP REQUEST ─────
    if (body._action === "swap_request") {
      if (!body.userId) return NextResponse.json({ error: "userId required" }, { status: 400 });
      if (authed.id !== body.userId) {
        return NextResponse.json({ error: "Can only post swaps for your own shifts" }, { status: 403 });
      }

      // Validate shiftDate format if provided
      if (body.shiftDate && !/^\d{4}-\d{2}-\d{2}$/.test(body.shiftDate)) {
        return NextResponse.json({ error: "Invalid shiftDate format (expected YYYY-MM-DD)" }, { status: 400 });
      }

      const { error } = await client.from("shift_swap_requests").insert({
        user_id: body.userId,
        org_id: body.orgId || authed.orgId || null,
        reason: body.reason,
        shift_date: body.shiftDate || null,
        shift_id: body.shiftId || null,
        poster_name: body.posterName || null,
        start_hour: body.startHour ?? null,
        end_hour: body.endHour ?? null,
        day_of_week: body.dayOfWeek || null,
        status: "open",
        created_at: new Date().toISOString(),
      });
      if (error) {
        console.warn("[swap_request insert]", error.message);
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      if (body.orgId) {
        const fH = (h: number) => h === 0 ? "12am" : h < 12 ? h + "am" : h === 12 ? "12pm" : (h - 12) + "pm";
        const timeStr = body.startHour != null && body.endHour != null ? " " + fH(body.startHour) + "–" + fH(body.endHour) : "";
        const dateStr = body.shiftDate ? new Date(body.shiftDate + "T12:00:00").toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" }) : "";
        const name = body.posterName || "A coworker";

        pushToOrg(body.orgId, "Shift Available", name + " needs " + dateStr + timeStr + " covered!", "/", "swap-" + Date.now(), body.userId)
          .catch((e: any) => console.warn("[push swap_request]", e?.message));
        emailOrg(body.orgId, "Shift Available for Swap", "Shift Available",
          name + " needs their <strong>" + dateStr + timeStr + "</strong> shift covered.<br><br>Open ShiftPro to claim it before someone else does.",
          "View Available Swaps", "https://shiftpro.ai", body.userId
        ).catch((e: any) => console.warn("[email swap_request]", e?.message));
      }
      return NextResponse.json({ ok: true });
    }

    // ───── CLAIM SWAP ─────
    if (body._action === "claim_swap") {
      if (!body.userId) return NextResponse.json({ error: "userId required" }, { status: 400 });
      if (authed.id !== body.userId) {
        return NextResponse.json({ error: "Can only claim swaps as yourself" }, { status: 403 });
      }

      const { data: swap, error: fetchErr } = await client
        .from("shift_swap_requests").select("*").eq("id", body.swapId).single();
      if (fetchErr || !swap) return NextResponse.json({ error: "Swap not found" }, { status: 404 });
      if (swap.status !== "open") return NextResponse.json({ error: "Already claimed" }, { status: 400 });
      if (swap.user_id === body.userId) return NextResponse.json({ error: "Can't claim your own swap" }, { status: 400 });
      if (swap.org_id && swap.org_id !== authed.orgId) {
        return NextResponse.json({ error: "Swap belongs to a different organization" }, { status: 403 });
      }

      const { error: updateErr } = await client.from("shift_swap_requests")
        .update({
          claimed_by_id: body.userId,
          claimed_by_name: body.userName || "Employee",
          status: "claimed",
          updated_at: new Date().toISOString()
        })
        .eq("id", body.swapId)
        .eq("status", "open"); // Optimistic concurrency: only update if still open
      if (updateErr) {
        console.warn("[claim_swap update]", updateErr.message);
        return NextResponse.json({ error: updateErr.message }, { status: 500 });
      }

      const claimer = body.userName || "A coworker";

      pushToUser(swap.user_id, "Your Shift Was Claimed", claimer + " wants to take your shift. Waiting for manager approval.", "/", "swap-claimed-" + body.swapId)
        .catch((e: any) => console.warn("[push claim poster]", e?.message));
      emailUser(swap.user_id, "Your Shift Was Claimed", "Shift Claimed",
        "<strong>" + claimer + "</strong> wants to take your shift. A manager will review and approve the swap shortly.",
        "Open ShiftPro", "https://shiftpro.ai"
      ).catch((e: any) => console.warn("[email claim poster]", e?.message));

      if (swap.org_id) {
        pushToManagers(swap.org_id, "Swap Ready to Approve", claimer + " wants to take " + (swap.poster_name || "a coworker") + "'s shift.", "/", "swap-review-" + body.swapId)
          .catch((e: any) => console.warn("[push managers]", e?.message));
        emailManagers(swap.org_id, "Shift Swap Ready for Approval", "Swap Ready to Approve",
          "<strong>" + claimer + "</strong> wants to take <strong>" + (swap.poster_name || "an employee") + "</strong>'s shift.<br><br>Log in to approve or deny this swap.",
          "Review Swap", "https://shiftpro.ai"
        ).catch((e: any) => console.warn("[email managers]", e?.message));
      }
      return NextResponse.json({ ok: true });
    }

    // ───── TIME OFF ─────
    if (body._action === "time_off") {
      if (!body.userId) return NextResponse.json({ error: "userId required" }, { status: 400 });
      if (authed.id !== body.userId) {
        return NextResponse.json({ error: "Can only request time off for yourself" }, { status: 403 });
      }

      // Date format validation
      const dateRx = /^\d{4}-\d{2}-\d{2}$/;
      if (!dateRx.test(body.startDate || "") || !dateRx.test(body.endDate || "")) {
        return NextResponse.json({ error: "Invalid date format (expected YYYY-MM-DD)" }, { status: 400 });
      }

      const { error } = await client.from("time_off_requests").insert({
        user_id: body.userId,
        org_id: body.orgId || authed.orgId || null,
        start_date: body.startDate,
        end_date: body.endDate,
        reason: body.reason || "",
        status: "pending",
        created_at: new Date().toISOString(),
      });
      if (error) {
        console.warn("[time_off insert]", error.message);
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      if (body.orgId) {
        const name = (body.userName || "").trim() || "An employee";
        const dateRange = body.startDate === body.endDate ? body.startDate : body.startDate + " to " + body.endDate;
        pushToManagers(body.orgId, "Time Off Request", name + " requested " + dateRange + " off.", "/", "timeoff-" + Date.now())
          .catch((e: any) => console.warn("[push time_off]", e?.message));
        emailManagers(body.orgId, "Time Off Request", "Time Off Request",
          "<strong>" + name + "</strong> requested <strong>" + dateRange + "</strong> off." + (body.reason ? "<br><br>Reason: " + body.reason : ""),
          "Review Request", "https://shiftpro.ai"
        ).catch((e: any) => console.warn("[email time_off]", e?.message));
      }
      return NextResponse.json({ ok: true });
    }

    // ───── CLAIM SHIFT (taking an open shift) ─────
    if (body._action === "claim_shift") {
      if (!body.userId) return NextResponse.json({ error: "userId required" }, { status: 400 });
      if (authed.id !== body.userId) {
        return NextResponse.json({ error: "Can only claim shifts as yourself" }, { status: 403 });
      }

      // Verify the shift is open and belongs to the authed user's org
      const { data: shift, error: shiftErr } = await client
        .from("shifts").select("org_id, status").eq("id", body.shiftId).single();
      if (shiftErr || !shift) return NextResponse.json({ error: "Shift not found" }, { status: 404 });
      if (shift.status !== "open") return NextResponse.json({ error: "Shift no longer open" }, { status: 400 });
      if (shift.org_id && shift.org_id !== authed.orgId) {
        return NextResponse.json({ error: "Shift belongs to a different organization" }, { status: 403 });
      }

      const { error } = await client.from("shifts")
        .update({ user_id: body.userId, status: "confirmed" })
        .eq("id", body.shiftId)
        .eq("status", "open"); // optimistic concurrency
      if (error) {
        console.warn("[claim_shift update]", error.message);
        return NextResponse.json({ error: error.message }, { status: 500 });
      }
      return NextResponse.json({ ok: true });
    }

    // ───── MARK MESSAGE READ ─────
    if (body._action === "mark_read") {
      // Users can only mark their OWN messages read. Verify the message is addressed to them.
      const { data: msg } = await client.from("messages").select("to_id, org_id").eq("id", body.messageId).single();
      if (!msg) return NextResponse.json({ error: "Message not found" }, { status: 404 });
      if (msg.to_id && msg.to_id !== authed.id) {
        return NextResponse.json({ error: "Not authorized for this message" }, { status: 403 });
      }
      if (msg.org_id && msg.org_id !== authed.orgId) {
        return NextResponse.json({ error: "Different organization" }, { status: 403 });
      }

      const { error } = await client.from("messages").update({ read: true }).eq("id", body.messageId);
      if (error) return NextResponse.json({ error: error.message }, { status: 500 });
      return NextResponse.json({ ok: true });
    }

    return NextResponse.json({ error: "unknown action" }, { status: 400 });
  } catch (e: any) {
    console.error("[employee POST]", e?.message || e);
    return NextResponse.json({ error: e?.message || "Server error" }, { status: 500 });
  }
}
