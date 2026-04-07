import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";

const sb = () => createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(req: NextRequest) {
  const orgId = req.nextUrl.searchParams.get("orgId");
  const weekStart = req.nextUrl.searchParams.get("weekStart");
  const locId = req.nextUrl.searchParams.get("locId");
  if (!orgId || !weekStart) return NextResponse.json({ error: "orgId and weekStart required" }, { status: 400 });

  let q = sb()
    .from("shifts")
    .select("*, users(first_name,last_name,avatar_initials,avatar_color,role)")
    .eq("org_id", orgId)
    .eq("week_start", weekStart)
    .order("start_hour");

  if (locId && locId !== "null") q = q.eq("location_id", locId);

  const { data, error } = await q;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ shifts: data || [] });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { data, error } = await sb().from("shifts").insert(body).select();
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ shift: data?.[0] || null });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
