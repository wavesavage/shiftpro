import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";

const sb = () => createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(req: NextRequest) {
  const periodId = req.nextUrl.searchParams.get("periodId");
  if (!periodId) return NextResponse.json({ error: "periodId required" }, { status: 400 });

  const [{ data: entries, error: e1 }, { data: tips, error: e2 }] = await Promise.all([
    sb().from("payroll_entries")
      .select("*, employee:payroll_employees(first_name,last_name,employee_type,pay_rate)")
      .eq("period_id", periodId)
      .order("company").order("employee_id"),
    sb().from("payroll_tips_pools").select("*").eq("period_id", periodId),
  ]);

  if (e1) return NextResponse.json({ error: e1.message }, { status: 500 });
  if (e2) return NextResponse.json({ error: e2.message }, { status: 500 });
  return NextResponse.json({ entries, tips });
}

export async function POST(req: NextRequest) {
  const { entries, tips, periodId } = await req.json();
  if (!periodId) return NextResponse.json({ error: "periodId required" }, { status: 400 });

  const results: Record<string, unknown> = {};

  if (entries?.length) {
    const { error } = await sb().from("payroll_entries")
      .upsert(entries, { onConflict: "period_id,employee_id,company" });
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    results.entries = entries.length;
  }

  if (tips?.length) {
    const { error } = await sb().from("payroll_tips_pools")
      .upsert(tips, { onConflict: "period_id,company" });
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    results.tips = tips.length;
  }

  return NextResponse.json({ ok: true, ...results });
}

export async function DELETE(req: NextRequest) {
  const { id } = await req.json();
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });
  const { error } = await sb().from("payroll_entries").delete().eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
