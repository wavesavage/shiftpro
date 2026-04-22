// src/app/api/portal-settings/route.ts
export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { requireAuthOr401, requireOwner, svcClient } from "@/lib/auth";

const DEFAULTS = {
  showEarnings: true,
  showGrowth: true,
  showAchievements: true,
  showSwapShift: true,
  showTimeOff: true,
};

export async function GET(req: NextRequest) {
  const authed = await requireAuthOr401(req);
  if (authed instanceof NextResponse) return authed;

  const orgId = req.nextUrl.searchParams.get("orgId");
  if (!orgId) {
    return NextResponse.json({ portalSettings: DEFAULTS });
  }

  // Must be a member of this org to read its settings
  if (authed.orgId !== orgId) {
    return NextResponse.json({ error: "Different organization" }, { status: 403 });
  }

  try {
    const client = svcClient();
    const { data, error } = await client
      .from("organizations")
      .select("portal_settings")
      .eq("id", orgId)
      .single();

    if (!error && data && data.portal_settings) {
      return NextResponse.json({ portalSettings: { ...DEFAULTS, ...data.portal_settings } });
    }

    if (error) {
      // Server-side log only — do NOT leak SQL hints to clients
      console.warn("[portal-settings GET] error:", error.message);
    }
  } catch (e: any) {
    console.warn("[portal-settings GET]", e?.message || e);
  }

  return NextResponse.json({ portalSettings: DEFAULTS });
}

export async function POST(req: NextRequest) {
  const authed = await requireAuthOr401(req);
  if (authed instanceof NextResponse) return authed;

  // Only owners can change portal settings
  try {
    requireOwner(authed);
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: e.status || 403 });
  }

  try {
    const body = await req.json();
    const { orgId, portalSettings } = body;

    if (!orgId || !portalSettings) {
      return NextResponse.json({ error: "orgId and portalSettings required" }, { status: 400 });
    }

    // Owner must own THIS org
    if (authed.orgId !== orgId) {
      return NextResponse.json({ error: "Different organization" }, { status: 403 });
    }

    const client = svcClient();

    const { data, error } = await client
      .from("organizations")
      .update({ portal_settings: portalSettings })
      .eq("id", orgId)
      .select("id, portal_settings")
      .single();

    if (error) {
      // Log the schema hint server-side for operators; return generic message to client
      console.error("[portal-settings POST]", error.message, error.details, error.hint);
      if (error.message.includes("column") || error.message.includes("portal_settings")) {
        console.error("[portal-settings] migration needed: ALTER TABLE organizations ADD COLUMN IF NOT EXISTS portal_settings jsonb;");
        return NextResponse.json(
          { error: "Settings storage unavailable. Contact support." },
          { status: 500 }
        );
      }
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ ok: true, saved: data?.portal_settings || portalSettings });
  } catch (e: any) {
    console.error("[portal-settings POST]", e?.message || e);
    return NextResponse.json({ error: e?.message || "Server error" }, { status: 500 });
  }
}
