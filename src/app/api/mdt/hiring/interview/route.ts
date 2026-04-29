// src/app/api/mdt/hiring/interview/route.ts
export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const sb = () => createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const MDT_ORG_ID = "a1d2c3e4-0001-4000-8000-000000000001";
const NO_CACHE = { headers: { "Cache-Control": "no-store, no-cache, must-revalidate" } };

// ────────────────────────────────────────────────────────────────
//  Weighted scoring — pulled into a helper for clarity
//  Each question has weight 1-3. Each rating is 0-3.
//  Score = sum(rating * weight) / sum(3 * weight) * 100
// ────────────────────────────────────────────────────────────────
function scoreInterview(answers: any[], questions: any[]): { total: number; max: number; pct: number; tier: string } {
  let total = 0;
  let max = 0;
  for (const q of questions || []) {
    const a = (answers || []).find((x: any) => x.questionId === q.id);
    const rating = a?.rating ? parseInt(a.rating, 10) : 0;
    const weight = q.weight || 1;
    if (rating > 0) total += rating * weight;
    max += 3 * weight;
  }
  const pct = max > 0 ? Math.round((total / max) * 100) : 0;
  let tier = "pass";
  if (pct >= 80) tier = "top";
  else if (pct >= 55) tier = "consider";
  return { total, max, pct, tier };
}

// GET /api/mdt/hiring/interview?candidate_id=... → list interviews for a candidate
export async function GET(req: NextRequest) {
  const candidateId = req.nextUrl.searchParams.get("candidate_id");
  if (!candidateId) return NextResponse.json({ error: "candidate_id required" }, { status: 400 });

  const client = sb();
  const { data, error } = await client
    .from("ld_interviews")
    .select("*")
    .eq("candidate_id", candidateId)
    .order("created_at", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ interviews: data || [] }, NO_CACHE);
}

// POST /api/mdt/hiring/interview → create OR update interview
// Body: { id?, candidate_id, scheduled_at?, scheduled_location?, conducted_by_name?,
//         answers: [{questionId, rating, notes}], wrapup: [{id, label, checked}],
//         final_notes?, status?: 'draft'|'completed' }
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      id,
      candidate_id,
      scheduled_at,
      scheduled_location,
      scheduled_duration_minutes,
      conducted_by_name,
      answers,
      wrapup,
      final_notes,
      status,
    } = body;

    if (!candidate_id) {
      return NextResponse.json({ error: "candidate_id required" }, { status: 400 });
    }

    const client = sb();

    // Pull the candidate's position to get question template
    const { data: candidate, error: candErr } = await client
      .from("ld_candidates")
      .select("id, full_name, position_id, position_slug, status")
      .eq("id", candidate_id)
      .single();
    if (candErr || !candidate) return NextResponse.json({ error: "Candidate not found" }, { status: 404 });

    const { data: position } = await client
      .from("ld_hiring_positions")
      .select("interview_questions")
      .eq("id", candidate.position_id)
      .single();
    const questions = position?.interview_questions || [];

    // Score the interview
    const { total, max, pct, tier } = scoreInterview(answers || [], questions);

    const payload: any = {
      org_id: MDT_ORG_ID,
      candidate_id,
      scheduled_at: scheduled_at || null,
      scheduled_location: scheduled_location || null,
      scheduled_duration_minutes: scheduled_duration_minutes || 45,
      conducted_by_name: conducted_by_name || null,
      answers: answers || [],
      wrapup: wrapup || [],
      final_notes: final_notes || null,
      score_total: total,
      score_max: max,
      score_pct: pct,
      tier,
      status: status || "draft",
      updated_at: new Date().toISOString(),
    };

    if (status === "completed" && !payload.conducted_at) {
      payload.conducted_at = new Date().toISOString();
    }

    let interview;
    if (id) {
      const { data, error } = await client
        .from("ld_interviews")
        .update(payload)
        .eq("id", id)
        .select()
        .single();
      if (error) return NextResponse.json({ error: error.message }, { status: 500 });
      interview = data;
    } else {
      const { data, error } = await client
        .from("ld_interviews")
        .insert(payload)
        .select()
        .single();
      if (error) return NextResponse.json({ error: error.message }, { status: 500 });
      interview = data;
    }

    // Denormalize score onto candidate row + advance status if completed
    const candidateUpdate: any = {
      interview_score: total,
      interview_score_max: max,
      interview_pct: pct,
      interview_tier: tier,
      updated_at: new Date().toISOString(),
    };
    if (status === "completed" && candidate.status !== "hired" && candidate.status !== "pass" && candidate.status !== "hold") {
      candidateUpdate.status = "interviewed";
    }
    await client.from("ld_candidates").update(candidateUpdate).eq("id", candidate_id);

    await client.from("ld_audit_log").insert({
      org_id: MDT_ORG_ID,
      actor_type: "user",
      action: status === "completed" ? "interview.completed" : "interview.saved",
      details: { candidate_id, interview_id: interview.id, score_pct: pct, tier },
    });

    return NextResponse.json({ ok: true, interview, score: { total, max, pct, tier } });
  } catch (e: any) {
    console.error("[interview POST]", e?.message);
    return NextResponse.json({ error: e?.message || "Server error" }, { status: 500 });
  }
}
