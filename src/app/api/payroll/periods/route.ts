import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";

const sb = () => createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(req: NextRequest) {
  const orgId = req.nextUrl.searchParams.get("orgId");
  const year  = req.nextUrl.searchParams.get("year");
  if (!orgId) return NextResponse.json({ error: "orgId required" }, { status: 400 });

  let q = sb().from("payroll_periods").select("*").eq("org_id", orgId).order("period_end", { ascending: false });
  if (year) q = q.eq("year", parseInt(year));

  const { data, error } = await q;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ periods: data });
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { org_id, period_start, period_end, year, label } = body;
  if (!org_id || !period_start || !period_end) return NextResponse.json({ error: "Missing fields" }, { status: 400 });

  const { data, error } = await sb().from("payroll_periods")
    .insert({ org_id, period_start, period_end, year, label, status: "draft" })
    .select().single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ period: data });
}

export async function PATCH(req: NextRequest) {
  const body = await req.json();
  const { id, ...updates } = body;
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });

  const { data, error } = await sb().from("payroll_periods")
    .update(updates).eq("id", id).select().single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ period: data });
}
