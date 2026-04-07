import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";

const sb = () => createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: NextRequest) {
  try {
    const { table, id, status, updates } = await req.json();
    if (!table || !id) return NextResponse.json({ error: "table and id required" }, { status: 400 });

    const allowed = ["shift_swap_requests", "time_off_requests", "messages", "clock_events"];
    if (!allowed.includes(table)) return NextResponse.json({ error: "table not allowed" }, { status: 403 });

    const payload = updates || { status };
    const { error } = await sb().from(table).update(payload).eq("id", id);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
