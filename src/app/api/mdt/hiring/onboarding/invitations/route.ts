// src/app/api/mdt/hiring/onboarding/invitations/route.ts
export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const sb = () => createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const MDT_ORG_ID = "a1d2c3e4-0001-4000-8000-000000000001";

// GET ?candidate_id=... or ?id=... → load one (or list all)
export async function GET(req: NextRequest) {
  const id = req.nextUrl.searchParams.get("id");
  const candidateId = req.nextUrl.searchParams.get("candidate_id");
  const client = sb();

  let q = client
    .from("ld_onboarding_invitations")
    .select("*")
    .eq("org_id", MDT_ORG_ID);

  if (id) q = q.eq("id", id);
  else if (candidateId) q = q.eq("candidate_id", candidateId);

  const { data, error } = await q.order("created_at", { ascending: false }).limit(50);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // For single-result queries, also include submissions + signature for the owner view
  if ((id || candidateId) && data && data.length > 0) {
    const inv = data[0];
    const [subRes, sigRes, eventRes] = await Promise.all([
      client.from("ld_onboarding_submissions").select("*").eq("invitation_id", inv.id),
      client.from("ld_onboarding_signatures").select("*").eq("invitation_id", inv.id).order("signed_at", { ascending: false }),
      client.from("ld_onboarding_events").select("*").eq("invitation_id", inv.id).order("created_at", { ascending: false }).limit(50),
    ]);
    return NextResponse.json({
      invitation: inv,
      submissions: subRes.data || [],
      signatures: sigRes.data || [],
      events: eventRes.data || [],
    });
  }

  return NextResponse.json({ invitations: data || [] });
}

// PATCH ?id=... → revoke / extend
export async function PATCH(req: NextRequest) {
  const id = req.nextUrl.searchParams.get("id");
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });
  const body = await req.json();

  const client = sb();
  const updates: any = { updated_at: new Date().toISOString() };

  if (body.action === "revoke") {
    updates.status = "revoked";
  } else if (body.action === "extend") {
    const days = parseInt(body.days, 10) || 14;
    updates.expires_at = new Date(Date.now() + days * 86400000).toISOString();
    updates.status = "in_progress"; // un-expire if needed
  } else {
    return NextResponse.json({ error: "Invalid action. Use 'revoke' or 'extend'." }, { status: 400 });
  }

  const { data, error } = await client
    .from("ld_onboarding_invitations")
    .update(updates).eq("id", id).eq("org_id", MDT_ORG_ID)
    .select().single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  if (body.action === "revoke" && data?.candidate_id) {
    await client.from("ld_candidates").update({
      onboarding_status: "not_started",
      onboarding_invitation_id: null,
    }).eq("id", data.candidate_id);
  }

  await client.from("ld_onboarding_events").insert({
    org_id: MDT_ORG_ID,
    invitation_id: id,
    event_type: body.action === "revoke" ? "invitation.revoked" : "invitation.extended",
    details: { ...body },
  });

  return NextResponse.json({ ok: true, invitation: data });
}
