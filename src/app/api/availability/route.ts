// src/app/api/availability/route.ts
export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { requireAuthOr401, requireCanActOn, svcClient } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const authed = await requireAuthOr401(req);
  if (authed instanceof NextResponse) return authed;

  const userId = req.nextUrl.searchParams.get("userId");
  if (!userId) return NextResponse.json({ error: "userId required" }, { status: 400 });

  // Self or manager/owner of same org
  try {
    await requireCanActOn(authed, userId, authed.orgId);
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: e.status || 403 });
  }

  const { data, error } = await svcClient().from("availability").select("*").eq("user_id", userId);
  if (error) {
    console.warn("[availability GET]", error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ availability: data || [] });
}

export async function POST(req: NextRequest) {
  const authed = await requireAuthOr401(req);
  if (authed instanceof NextResponse) return authed;

  try {
    const { userId, orgId, rows } = await req.json();
    if (!userId || !rows) return NextResponse.json({ error: "userId and rows required" }, { status: 400 });

    // Users can only update their own availability (not others')
    if (userId !== authed.id) {
      return NextResponse.json({ error: "Can only update your own availability" }, { status: 403 });
    }

    const client = svcClient();
    // Delete all existing rows for this user first, then reinsert
    await client.from("availability").delete().eq("user_id", userId);
    if (rows.length > 0) {
      const validDays = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
      const toInsert = rows.filter((r: any) => validDays.includes(r.day_of_week)).map((r: any) => ({
        user_id: userId,
        org_id: orgId || authed.orgId || null,
        day_of_week: r.day_of_week,
        status: r.status,
        recurring: r.recurring ?? true,
        avail_from: r.avail_from ?? null,
        avail_to: r.avail_to ?? null,
      }));
      if (toInsert.length > 0) {
        const { error } = await client.from("availability").insert(toInsert);
        if (error) {
          console.warn("[availability POST]", error.message);
          return NextResponse.json({ error: error.message }, { status: 500 });
        }
      }
    }
    return NextResponse.json({ ok: true });
  } catch (e: any) {
    console.error("[availability POST]", e?.message || e);
    return NextResponse.json({ error: e?.message || "Server error" }, { status: 500 });
  }
}
