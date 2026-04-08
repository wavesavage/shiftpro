export const dynamic = "force-dynamic";

import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";

const sb = () => createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const NO_CACHE = { headers: { "Cache-Control": "no-store, no-cache, must-revalidate" } };

// GET /api/employee?type=shifts&userId=...&orgId=...
// GET /api/employee?type=messages&userId=...&orgId=...
// GET /api/employee?type=clock&userId=...
export async function GET(req: NextRequest) {
  const type = req.nextUrl.searchParams.get("type");
  const userId = req.nextUrl.searchParams.get("userId");
  const orgId = req.nextUrl.searchParams.get("orgId");

  if (!userId) return NextResponse.json({ error: "userId required" }, { status: 400 });

  const client = sb();

  if (type === "shifts") {
    const today = new Date().toISOString().split("T")[0];
    // Load employee's assigned shifts
    const { data: shifts } = await client
      .from("shifts").select("*, locations(name)")
      .eq("user_id", userId)
      .gte("shift_date", today)
      .in("status", ["scheduled", "published", "confirmed"])
      .order("shift_date");

    // Load open shifts for their org
    let openShifts: any[] = [];
    if (orgId) {
      const { data: open } = await client
        .from("shifts").select("*, locations(name)")
        .eq("org_id", orgId)
        .eq("status", "open")
        .gte("shift_date", today)
        .order("shift_date")
        .limit(20);
      openShifts = open || [];
    }

    return NextResponse.json({ shifts: shifts || [], openShifts }, NO_CACHE);
  }

  if (type === "messages") {
    if (!orgId) return NextResponse.json({ messages: [] }, NO_CACHE);
    const { data } = await client
      .from("messages").select("*")
      .or(`to_id.eq.${userId},broadcast.eq.true`)
      .eq("org_id", orgId)
      .order("created_at", { ascending: false })
      .limit(30);
    return NextResponse.json({ messages: data || [] }, NO_CACHE);
  }

  if (type === "clock") {
    const monthStart = new Date();
    monthStart.setDate(1); monthStart.setHours(0, 0, 0, 0);
    const today = new Date().toISOString().split("T")[0];

    const { data: monthEvents } = await client
      .from("clock_events").select("*")
      .eq("user_id", userId)
      .gte("occurred_at", monthStart.toISOString())
      .order("occurred_at");

    const { data: todayEvents } = await client
      .from("clock_events").select("*")
      .eq("user_id", userId)
      .gte("occurred_at", today)
      .order("occurred_at", { ascending: false })
      .limit(10);

    return NextResponse.json({
      monthEvents: monthEvents || [],
      todayEvents: todayEvents || []
    }, NO_CACHE);
  }

  return NextResponse.json({ error: "unknown type" }, { status: 400 });
}

// POST /api/employee — insert clock event, swap request, time-off, claim shift
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const client = sb();

    if (body._action === "clock") {
      const { error } = await client.from("clock_events").insert({
        user_id: body.userId,
        org_id: body.orgId || null,
        location_id: body.locId || null,
        event_type: body.eventType,
        occurred_at: new Date().toISOString(),
      });
      if (error) return NextResponse.json({ error: error.message }, { status: 500 });
      return NextResponse.json({ ok: true });
    }

    if (body._action === "swap_request") {
      const { error } = await client.from("shift_swap_requests").insert({
        user_id: body.userId,
        org_id: body.orgId || null,
        reason: body.reason,
        status: "pending",
        created_at: new Date().toISOString(),
      });
      if (error) return NextResponse.json({ error: error.message }, { status: 500 });
      return NextResponse.json({ ok: true });
    }

    if (body._action === "time_off") {
      const { error } = await client.from("time_off_requests").insert({
        user_id: body.userId,
        org_id: body.orgId || null,
        start_date: body.startDate,
        end_date: body.endDate,
        reason: body.reason || "",
        status: "pending",
        created_at: new Date().toISOString(),
      });
      if (error) return NextResponse.json({ error: error.message }, { status: 500 });
      return NextResponse.json({ ok: true });
    }

    if (body._action === "claim_shift") {
      const { error } = await client.from("shifts")
        .update({ user_id: body.userId, status: "confirmed" })
        .eq("id", body.shiftId);
      if (error) return NextResponse.json({ error: error.message }, { status: 500 });
      return NextResponse.json({ ok: true });
    }

    if (body._action === "mark_read") {
      await client.from("messages").update({ read: true }).eq("id", body.messageId);
      return NextResponse.json({ ok: true });
    }

    return NextResponse.json({ error: "unknown action" }, { status: 400 });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
