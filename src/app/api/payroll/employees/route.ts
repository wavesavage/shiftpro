import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";

const sb = () => createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(req: NextRequest) {
  const orgId   = req.nextUrl.searchParams.get("orgId");
  const company = req.nextUrl.searchParams.get("company");
  const all     = req.nextUrl.searchParams.get("all");
  if (!orgId) return NextResponse.json({ error: "orgId required" }, { status: 400 });

  let q = sb().from("payroll_employees").select("*").eq("org_id", orgId).order("last_name");
  if (!all) q = q.eq("active", true);
  if (company) q = q.eq("default_company", company);

  const { data, error } = await q;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ employees: data });
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { data, error } = await sb().from("payroll_employees").insert(body).select().single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ employee: data });
}

export async function PATCH(req: NextRequest) {
  const body = await req.json();
  const { id, ...updates } = body;
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });
  const { data, error } = await sb().from("payroll_employees").update(updates).eq("id", id).select().single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ employee: data });
}
