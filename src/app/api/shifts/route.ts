export const dynamic = "force-dynamic";

import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";

const sb = () => createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const NO_CACHE = { headers: { "Cache-Control": "no-store, no-cache, must-revalidate" } };

export async function GET(req: NextRequest) {
  const orgId = req.nextUrl.searchParams.get("orgId");
  const weekStart = req.nextUrl.searchParams.get("weekStart");
  const locId = req.nextUrl.searchParams.get("locId");
  if (!orgId || !weekStart) return NextResponse.json({ error: "orgId and weekStart required" }, { status: 400 });

  // Select shifts only — no users join (avoids ambiguous FK error)
  let q = sb().from("shifts").select("*").eq("org_id", orgId).eq("week_start", weekStart).order("start_hour");
  if (locId && locId !== "null" && locId !== "undefined") q = q.eq("location_id", locId);

  const { data, error } = await q;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 }, );
  return NextResponse.json({ shifts: data || [] }, NO_CACHE);
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const client = sb();
    if (body._action === "delete") {
      const { error } = await client.from("shifts").delete().eq("id", body.id);
      if (error) return NextResponse.json({ error: error.message }, { status: 500 });
      return NextResponse.json({ ok: true });
    }
    if (body._action === "publish") {
      const { error } = await client.from("shifts").update({ status: "published" }).eq("org_id", body.orgId).eq("week_start", body.weekStart);
      if (error) return NextResponse.json({ error: error.message }, { status: 500 });
      return NextResponse.json({ ok: true });
    }
    if (body._action === "copyLastWeek") {
      const { error } = await client.from("shifts").insert(body.shifts);
      if (error) return NextResponse.json({ error: error.message }, { status: 500 });
      return NextResponse.json({ ok: true });
    }
    // Plain insert
    const { data, error } = await client.from("shifts").insert(body).select();
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ shift: data?.[0] || null });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
