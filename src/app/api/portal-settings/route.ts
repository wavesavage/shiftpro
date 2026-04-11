export const dynamic = "force-dynamic";
import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";

const sb = () => createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(req: NextRequest) {
  const orgId = req.nextUrl.searchParams.get("orgId");
  if (!orgId) return NextResponse.json({ error: "orgId required" }, { status: 400 });

  const { data, error } = await sb()
    .from("organizations")
    .select("portal_settings")
    .eq("id", orgId)
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ portalSettings: data?.portal_settings || {} });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { orgId, portalSettings } = body;
    if (!orgId || !portalSettings) {
      return NextResponse.json({ error: "orgId and portalSettings required" }, { status: 400 });
    }

    const { error } = await sb()
      .from("organizations")
      .update({ portal_settings: portalSettings })
      .eq("id", orgId);

    if (error) {
      console.error("[portal-settings POST]", error.message);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
