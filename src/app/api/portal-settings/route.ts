export const dynamic = "force-dynamic";
import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";

const sb = () => createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const DEFAULTS = {
  showEarnings: true,
  showGrowth: true,
  showAchievements: true,
  showSwapShift: true,
  showTimeOff: true,
};

export async function GET(req: NextRequest) {
  const orgId = req.nextUrl.searchParams.get("orgId");
  if (!orgId) return NextResponse.json({ portalSettings: DEFAULTS });

  const client = sb();

  // Try portal_settings table
  const { data, error } = await client
    .from("portal_settings")
    .select("settings")
    .eq("org_id", orgId)
    .maybeSingle();

  if (data?.settings) {
    return NextResponse.json({ portalSettings: { ...DEFAULTS, ...data.settings } });
  }

  if (error) {
    console.error("[portal-settings GET]", error.message);
  }

  return NextResponse.json({ portalSettings: DEFAULTS });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { orgId, portalSettings } = body;
    if (!orgId || !portalSettings) {
      return NextResponse.json({ error: "orgId and portalSettings required" }, { status: 400 });
    }

    const client = sb();
    const { data, error } = await client
      .from("portal_settings")
      .upsert(
        { org_id: orgId, settings: portalSettings, updated_at: new Date().toISOString() },
        { onConflict: "org_id" }
      )
      .select()
      .single();

    if (error) {
      console.error("[portal-settings POST]", error.message);
      return NextResponse.json({ error: error.message, hint: "Run the SQL to create the portal_settings table" }, { status: 500 });
    }

    return NextResponse.json({ ok: true, portalSettings });
  } catch (e: any) {
    console.error("[portal-settings POST]", e.message);
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
