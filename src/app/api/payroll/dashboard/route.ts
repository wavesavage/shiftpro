import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";

const sb = () => createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(req: NextRequest) {
  const orgId = req.nextUrl.searchParams.get("orgId");
  const year  = parseInt(req.nextUrl.searchParams.get("year") || "2026");
  if (!orgId) return NextResponse.json({ error: "orgId required" }, { status: 400 });

  const { data: periods } = await sb().from("payroll_periods")
    .select("id,period_end,label,status,year").eq("org_id", orgId).eq("year", year).order("period_end");

  const periodIds = (periods || []).map((p: { id: string }) => p.id);

  const [{ data: entries }, { data: tips }, { data: employees }] = await Promise.all([
    periodIds.length
      ? sb().from("payroll_entries").select("period_id,company,total_calc,wage_calc,mileage,mile_reimb_calc,hrs_tips,ot_tips,hrs_no_tips").in("period_id", periodIds)
      : Promise.resolve({ data: [] }),
    periodIds.length
      ? sb().from("payroll_tips_pools").select("period_id,company,stc_tips,bsc_tips,slb_tips").in("period_id", periodIds)
      : Promise.resolve({ data: [] }),
    sb().from("payroll_employees").select("id,first_name,last_name,default_company,active,employee_type").eq("org_id", orgId),
  ]);

  type Entry = { period_id: string; company: string; total_calc: number; wage_calc: number; mileage: number; mile_reimb_calc: number; hrs_tips: number; ot_tips: number; hrs_no_tips: number };
  type TipsPool = { period_id: string; company: string; stc_tips: number; bsc_tips: number; slb_tips: number };
  type Period = { id: string; period_end: string; label: string; status: string; year: number };
  type Employee = { id: string; first_name: string; last_name: string; default_company: string; active: boolean; employee_type: string };

  const entryList: Entry[] = (entries || []) as Entry[];
  const tipsList: TipsPool[] = (tips || []) as TipsPool[];
  const empList: Employee[] = (employees || []) as Employee[];
  const periodList: Period[] = (periods || []) as Period[];

  const ytd = { stc: 0, bsc: 0, apg: 0, total: 0, wages: 0, miles: 0, tips: 0 };
  entryList.forEach(e => {
    const t = Number(e.total_calc) || 0;
    ytd.total += t;
    ytd.wages += Number(e.wage_calc) || 0;
    ytd.miles += Number(e.mile_reimb_calc) || 0;
    if (e.company === 'stc') ytd.stc += t;
    else if (e.company === 'bsc') ytd.bsc += t;
    else if (e.company === 'apg') ytd.apg += t;
  });
  tipsList.forEach(t => {
    ytd.tips += Number(t.stc_tips) + Number(t.bsc_tips) + Number(t.slb_tips);
  });

  const byPeriod = periodList.map(p => {
    const pEntries = entryList.filter(e => e.period_id === p.id);
    return {
      id: p.id,
      label: p.label,
      period_end: p.period_end,
      status: p.status,
      stc: pEntries.filter(e => e.company === 'stc').reduce((s, e) => s + Number(e.total_calc), 0),
      bsc: pEntries.filter(e => e.company === 'bsc').reduce((s, e) => s + Number(e.total_calc), 0),
      apg: pEntries.filter(e => e.company === 'apg').reduce((s, e) => s + Number(e.total_calc), 0),
      total: pEntries.reduce((s, e) => s + Number(e.total_calc), 0),
    };
  });

  const headcount = {
    stc: empList.filter(e => e.default_company === 'stc' && e.active).length,
    bsc: empList.filter(e => e.default_company === 'bsc' && e.active).length,
    apg: empList.filter(e => e.default_company === 'apg' && e.active).length,
    total: empList.filter(e => e.active).length,
  };

  const totals = byPeriod.map(p => p.total);
  const highPeriod = byPeriod.reduce((a, b) => b.total > a.total ? b : a, byPeriod[0] || { label: '—', total: 0 });
  const lowPeriod  = byPeriod.filter(p => p.total > 0).reduce((a, b) => b.total < a.total ? b : a, byPeriod[0] || { label: '—', total: 0 });

  return NextResponse.json({ ytd, byPeriod, headcount, highPeriod, lowPeriod, years: [2025, 2026, 2027] });
}
