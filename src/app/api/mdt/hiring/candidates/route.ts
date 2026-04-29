// src/app/api/mdt/hiring/candidates/route.ts
export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const sb = () => createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const MDT_ORG_ID = "a1d2c3e4-0001-4000-8000-000000000001";
const NO_CACHE = { headers: { "Cache-Control": "no-store, no-cache, must-revalidate" } };

// GET /api/mdt/hiring/candidates → list with positions + interviews summary
export async function GET(req: NextRequest) {
  const client = sb();

  const positionsP = client
    .from("ld_hiring_positions")
    .select("id, slug, display_name, emoji, description, default_pay_rate_cents, default_pay_unit, default_employment_type, interview_questions")
    .eq("org_id", MDT_ORG_ID)
    .eq("active", true)
    .order("display_order", { ascending: true });

  const candidatesP = client
    .from("ld_candidates")
    .select("*")
    .eq("org_id", MDT_ORG_ID)
    .order("created_at", { ascending: false })
    .limit(500);

  const [posRes, canRes] = await Promise.all([positionsP, candidatesP]);

  if (posRes.error) {
    console.warn("[hiring positions]", posRes.error.message);
    return NextResponse.json({ error: posRes.error.message }, { status: 500 });
  }
  if (canRes.error) {
    console.warn("[hiring candidates]", canRes.error.message);
    return NextResponse.json({ error: canRes.error.message }, { status: 500 });
  }

  return NextResponse.json({
    positions: posRes.data || [],
    candidates: canRes.data || [],
  }, NO_CACHE);
}

// POST /api/mdt/hiring/candidates → create
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      full_name,
      email,
      phone,
      position_slug,
      years_experience,
      certifications,
      source,
      source_notes,
      internal_notes,
      added_by_name,
    } = body;

    if (!full_name?.trim()) {
      return NextResponse.json({ error: "full_name required" }, { status: 400 });
    }
    if (!position_slug) {
      return NextResponse.json({ error: "position_slug required" }, { status: 400 });
    }

    const client = sb();

    // Look up position
    const { data: position, error: posErr } = await client
      .from("ld_hiring_positions")
      .select("id, slug")
      .eq("org_id", MDT_ORG_ID)
      .eq("slug", position_slug)
      .single();
    if (posErr || !position) {
      return NextResponse.json({ error: "Invalid position_slug" }, { status: 400 });
    }

    const { data: candidate, error } = await client
      .from("ld_candidates")
      .insert({
        org_id: MDT_ORG_ID,
        full_name: full_name.trim(),
        email: email?.trim() || null,
        phone: phone?.trim() || null,
        position_id: position.id,
        position_slug: position.slug,
        years_experience: years_experience ? parseInt(years_experience, 10) : null,
        certifications: Array.isArray(certifications) ? certifications : null,
        source: source || "manual",
        source_notes: source_notes?.trim() || null,
        internal_notes: internal_notes?.trim() || null,
        added_by_name: added_by_name?.trim() || null,
        status: "applied",
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    await client.from("ld_audit_log").insert({
      org_id: MDT_ORG_ID,
      actor_type: "user",
      action: "candidate.created",
      details: { candidate_id: candidate.id, position: position.slug, added_by: added_by_name },
    });

    return NextResponse.json({ ok: true, candidate });
  } catch (e: any) {
    console.error("[hiring POST]", e?.message);
    return NextResponse.json({ error: e?.message || "Server error" }, { status: 500 });
  }
}

// PATCH /api/mdt/hiring/candidates?id=... → update
export async function PATCH(req: NextRequest) {
  try {
    const id = req.nextUrl.searchParams.get("id");
    if (!id) return NextResponse.json({ error: "id query param required" }, { status: 400 });

    const body = await req.json();
    const allowedKeys = [
      "full_name", "email", "phone",
      "position_slug",
      "years_experience", "certifications", "references_provided",
      "source", "source_notes",
      "status", "internal_notes",
      "interview_score", "interview_score_max", "interview_pct", "interview_tier",
      "hire_pay_rate_cents", "hire_pay_unit", "hire_start_date", "hire_employment_type",
    ];

    const updates: any = {};
    for (const k of allowedKeys) {
      if (k in body) updates[k] = body[k];
    }
    if (Object.keys(updates).length === 0) {
      return NextResponse.json({ error: "No valid fields" }, { status: 400 });
    }

    if (updates.status) {
      const valid = ["applied", "phone_screen", "interview_scheduled", "interviewed", "offer_sent", "hired", "hold", "pass"];
      if (!valid.includes(updates.status)) {
        return NextResponse.json({ error: "Invalid status" }, { status: 400 });
      }
    }

    updates.updated_at = new Date().toISOString();

    const client = sb();

    // If position_slug changed, also update position_id
    if (updates.position_slug) {
      const { data: pos } = await client
        .from("ld_hiring_positions")
        .select("id")
        .eq("org_id", MDT_ORG_ID)
        .eq("slug", updates.position_slug)
        .single();
      if (pos) updates.position_id = pos.id;
    }

    const { data: candidate, error } = await client
      .from("ld_candidates")
      .update(updates)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    await client.from("ld_audit_log").insert({
      org_id: MDT_ORG_ID,
      actor_type: "user",
      action: "candidate.updated",
      details: { candidate_id: id, updates },
    });

    return NextResponse.json({ ok: true, candidate });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "Server error" }, { status: 500 });
  }
}

// DELETE /api/mdt/hiring/candidates?id=... → delete (cascade removes interviews + docs records)
export async function DELETE(req: NextRequest) {
  const id = req.nextUrl.searchParams.get("id");
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });

  const client = sb();
  const { error } = await client
    .from("ld_candidates")
    .delete()
    .eq("id", id)
    .eq("org_id", MDT_ORG_ID);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  await client.from("ld_audit_log").insert({
    org_id: MDT_ORG_ID,
    actor_type: "user",
    action: "candidate.deleted",
    details: { candidate_id: id },
  });

  return NextResponse.json({ ok: true });
}
