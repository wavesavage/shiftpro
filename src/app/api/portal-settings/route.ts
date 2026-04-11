export const dynamic = "force-dynamic";
import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";

// Uses service role key — bypasses ALL RLS
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
  if (!orgId) {
    console.log("[portal-settings GET] no orgId");
    return NextResponse.json({ portalSettings: DEFAULTS });
  }

  try {
    const client = sb();

    // First try: portal_settings column on organizations table
    const { data, error } = await client
      .from("organizations")
      .select("portal_settings")
      .eq("id", orgId)
      .single();

    if (!error && data && data.portal_settings) {
      console.log("[portal-settings GET] found:", JSON.stringify(data.portal_settings));
      return NextResponse.json({ portalSettings: { ...DEFAULTS, ...data.portal_settings } });
    }

    if (error) {
      console.error("[portal-settings GET] org query error:", error.message);

      // The column might not exist — try selecting just id to confirm table works
      const { data: orgCheck, error: orgErr } = await client
        .from("organizations")
        .select("id")
        .eq("id", orgId)
        .single();

      if (orgErr) {
        console.error("[portal-settings GET] org not found:", orgErr.message);
      } else {
        console.log("[portal-settings GET] org exists but portal_settings column may not exist. Run: ALTER TABLE organizations ADD COLUMN IF NOT EXISTS portal_settings jsonb;");
      }
    }
  } catch (e: any) {
    console.error("[portal-settings GET] exception:", e.message);
  }

  return NextResponse.json({ portalSettings: DEFAULTS });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { orgId, portalSettings } = body;

    console.log("[portal-settings POST] orgId:", orgId, "settings:", JSON.stringify(portalSettings));

    if (!orgId || !portalSettings) {
      return NextResponse.json({ error: "orgId and portalSettings required" }, { status: 400 });
    }

    const client = sb();

    // Update the organizations table directly
    const { data, error } = await client
      .from("organizations")
      .update({ portal_settings: portalSettings })
      .eq("id", orgId)
      .select("id, portal_settings")
      .single();

    if (error) {
      console.error("[portal-settings POST] update error:", error.message, error.details, error.hint);

      // If portal_settings column doesn't exist, the error will say so
      if (error.message.includes("column") || error.message.includes("portal_settings")) {
        return NextResponse.json({
          error: "portal_settings column does not exist. Please run SQL: ALTER TABLE organizations ADD COLUMN IF NOT EXISTS portal_settings jsonb;",
          sqlNeeded: true,
        }, { status: 500 });
      }

      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    console.log("[portal-settings POST] saved successfully:", JSON.stringify(data?.portal_settings));
    return NextResponse.json({ ok: true, saved: data?.portal_settings || portalSettings });
  } catch (e: any) {
    console.error("[portal-settings POST] exception:", e.message);
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
