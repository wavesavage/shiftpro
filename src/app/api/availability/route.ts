import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";

const sb = () => createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(req: NextRequest) {
  const userId = req.nextUrl.searchParams.get("userId");
  if (!userId) return NextResponse.json({ error: "userId required" }, { status: 400 });
  const { data, error } = await sb().from("availability").select("*").eq("user_id", userId);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ availability: data || [] });
}

export async function POST(req: NextRequest) {
  try {
    const { userId, orgId, rows } = await req.json();
    if (!userId || !rows) return NextResponse.json({ error: "userId and rows required" }, { status: 400 });
    const client = sb();
    // Delete all existing rows for this user first, then reinsert
    await client.from("availability").delete().eq("user_id", userId);
    if (rows.length > 0) {
      const toInsert = rows.map((r: any) => ({
        user_id: userId,
        org_id: orgId || null,
        day_of_week: r.day_of_week,
        status: r.status,
        recurring: r.recurring ?? true,
        avail_from: r.avail_from ?? null,
        avail_to: r.avail_to ?? null,
      }));
      const { error } = await client.from("availability").insert(toInsert);
      if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
