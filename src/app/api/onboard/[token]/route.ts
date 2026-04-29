// src/app/api/onboard/[token]/route.ts
//
// PUBLIC token-gated onboarding API.
// No auth header required — possession of the token IS the auth.
// All operations validate token + expiry + status before doing anything.

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const sb = () => createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const NO_CACHE = { headers: { "Cache-Control": "no-store, no-cache, must-revalidate" } };

// Helper: validate token, return invitation or null
async function loadInvitation(client: any, token: string) {
  const { data, error } = await client
    .from("ld_onboarding_invitations")
    .select("*")
    .eq("token", token)
    .maybeSingle();
  if (error || !data) return null;
  return data;
}

function getClientMeta(req: NextRequest): { ip: string; ua: string } {
  const ua = req.headers.get("user-agent") || "";
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0].trim()
    || req.headers.get("x-real-ip")
    || "";
  return { ip, ua };
}

// ────────────────────────────────────────────────────────────────
//  GET /api/onboard/:token
//  Returns full onboarding state: invitation, org branding, templates, submissions
// ────────────────────────────────────────────────────────────────
export async function GET(req: NextRequest, ctx: { params: Promise<{ token: string }> }) {
  try {
    const { token } = await ctx.params;
    if (!token) return NextResponse.json({ error: "Missing token" }, { status: 400 });

    const client = sb();
    const invitation = await loadInvitation(client, token);
    if (!invitation) return NextResponse.json({ error: "Invitation not found" }, { status: 404 });

    // Expiry check
    const expired = new Date(invitation.expires_at) < new Date();
    if (expired && invitation.status !== "expired") {
      await client.from("ld_onboarding_invitations").update({
        status: "expired",
        updated_at: new Date().toISOString(),
      }).eq("id", invitation.id);
      invitation.status = "expired";
    }
    if (invitation.status === "expired") {
      return NextResponse.json({ error: "This onboarding link has expired. Contact your employer to request a new one.", expired: true }, { status: 410 });
    }
    if (invitation.status === "revoked") {
      return NextResponse.json({ error: "This onboarding link has been revoked." }, { status: 410 });
    }

    // First-open tracking
    const meta = getClientMeta(req);
    const updates: any = { last_opened_at: new Date().toISOString(), open_count: (invitation.open_count || 0) + 1 };
    if (!invitation.first_opened_at) {
      updates.first_opened_at = new Date().toISOString();
      if (invitation.status === "invited") updates.status = "in_progress";
      await client.from("ld_onboarding_events").insert({
        org_id: invitation.org_id,
        invitation_id: invitation.id,
        event_type: "link.opened",
        ip_address: meta.ip,
        user_agent: meta.ua,
      });
    }
    await client.from("ld_onboarding_invitations").update(updates).eq("id", invitation.id);

    // Load templates in the order specified by template_ids array
    const { data: allTemplates } = await client
      .from("ld_onboarding_templates")
      .select("id, name, description, kind, form_key, file_name, custom_schema, storage_path")
      .in("id", invitation.template_ids || []);

    const orderedTemplates = (invitation.template_ids || [])
      .map((id: string) => (allTemplates || []).find((t: any) => t.id === id))
      .filter(Boolean);

    // Sign URLs for any attachment templates (e.g. handbook PDF)
    const templatesWithUrls = await Promise.all(
      orderedTemplates.map(async (t: any) => {
        if (t.storage_path) {
          const { data: signed } = await client.storage
            .from("onboarding-documents")
            .createSignedUrl(t.storage_path, 86400);
          return { ...t, download_url: signed?.signedUrl || null };
        }
        return t;
      })
    );

    // Load existing submissions
    const { data: submissions } = await client
      .from("ld_onboarding_submissions")
      .select("id, template_id, data, status, completed_at, updated_at")
      .eq("invitation_id", invitation.id);

    // Org branding
    const { data: org } = await client
      .from("ld_organizations")
      .select("name, brand_color, logo_url")
      .eq("id", invitation.org_id)
      .single();

    // Recompute completion %
    const total = invitation.template_ids?.length || 0;
    const completed = (submissions || []).filter((s: any) => s.status === "completed").length;
    const pct = total > 0 ? Math.round((completed / total) * 100) : 0;
    if (pct !== invitation.completion_pct) {
      await client.from("ld_onboarding_invitations").update({ completion_pct: pct }).eq("id", invitation.id);
      invitation.completion_pct = pct;
    }

    return NextResponse.json({
      invitation: {
        id: invitation.id,
        candidate_name: invitation.candidate_name,
        candidate_email: invitation.candidate_email,
        position_name: invitation.position_name,
        status: invitation.status,
        completion_pct: pct,
        completed_at: invitation.completed_at,
        expires_at: invitation.expires_at,
      },
      org: {
        name: org?.name || "Your employer",
        brand_color: org?.brand_color || "#0891b2",
        logo_url: org?.logo_url || null,
      },
      templates: templatesWithUrls,
      submissions: submissions || [],
    }, NO_CACHE);
  } catch (e: any) {
    console.error("[onboard GET]", e?.message);
    return NextResponse.json({ error: e?.message || "Server error" }, { status: 500 });
  }
}

// ────────────────────────────────────────────────────────────────
//  PATCH /api/onboard/:token
//  Body: { template_id, data, status: 'in_progress' | 'completed' }
//  Saves form data for one template.
// ────────────────────────────────────────────────────────────────
export async function PATCH(req: NextRequest, ctx: { params: Promise<{ token: string }> }) {
  try {
    const { token } = await ctx.params;
    if (!token) return NextResponse.json({ error: "Missing token" }, { status: 400 });

    const body = await req.json();
    const { template_id, data, status } = body;
    if (!template_id) return NextResponse.json({ error: "template_id required" }, { status: 400 });

    const client = sb();
    const invitation = await loadInvitation(client, token);
    if (!invitation) return NextResponse.json({ error: "Invitation not found" }, { status: 404 });
    if (invitation.status === "expired" || invitation.status === "revoked") {
      return NextResponse.json({ error: "Invitation no longer valid" }, { status: 410 });
    }
    if (invitation.status === "completed") {
      return NextResponse.json({ error: "Onboarding already completed" }, { status: 410 });
    }

    if (!(invitation.template_ids || []).includes(template_id)) {
      return NextResponse.json({ error: "Template not part of this packet" }, { status: 400 });
    }

    const meta = getClientMeta(req);
    const finalStatus = status === "completed" ? "completed" : "in_progress";

    // Detect sensitive fields (SSN, account numbers)
    const sensitiveKeys = ["ssn", "account_number", "routing_number", "bank_account"];
    let containsSensitive = false;
    if (data && typeof data === "object") {
      for (const k of Object.keys(data)) {
        if (sensitiveKeys.some(s => k.toLowerCase().includes(s))) {
          containsSensitive = true;
          break;
        }
      }
    }

    // Upsert
    const { data: existing } = await client
      .from("ld_onboarding_submissions")
      .select("id")
      .eq("invitation_id", invitation.id)
      .eq("template_id", template_id)
      .maybeSingle();

    let submission;
    if (existing) {
      const { data: updated, error } = await client
        .from("ld_onboarding_submissions")
        .update({
          data: data || {},
          status: finalStatus,
          contains_sensitive: containsSensitive,
          completed_at: finalStatus === "completed" ? new Date().toISOString() : null,
          ip_address: meta.ip,
          user_agent: meta.ua,
          updated_at: new Date().toISOString(),
        })
        .eq("id", existing.id)
        .select()
        .single();
      if (error) return NextResponse.json({ error: error.message }, { status: 500 });
      submission = updated;
    } else {
      const { data: created, error } = await client
        .from("ld_onboarding_submissions")
        .insert({
          org_id: invitation.org_id,
          invitation_id: invitation.id,
          template_id,
          data: data || {},
          status: finalStatus,
          contains_sensitive: containsSensitive,
          completed_at: finalStatus === "completed" ? new Date().toISOString() : null,
          ip_address: meta.ip,
          user_agent: meta.ua,
        })
        .select()
        .single();
      if (error) return NextResponse.json({ error: error.message }, { status: 500 });
      submission = created;
    }

    // Bump invitation status to in_progress + recompute completion %
    const { data: allSubs } = await client
      .from("ld_onboarding_submissions")
      .select("status")
      .eq("invitation_id", invitation.id);
    const total = invitation.template_ids?.length || 0;
    const completedCount = (allSubs || []).filter((s: any) => s.status === "completed").length;
    const pct = total > 0 ? Math.round((completedCount / total) * 100) : 0;

    const invUpdate: any = {
      completion_pct: pct,
      updated_at: new Date().toISOString(),
    };
    if (invitation.status === "invited") invUpdate.status = "in_progress";

    await client.from("ld_onboarding_invitations").update(invUpdate).eq("id", invitation.id);

    // Mirror onto candidate row
    if (invitation.candidate_id) {
      await client.from("ld_candidates").update({
        onboarding_status: pct === 100 ? "in_progress" : "in_progress", // 100% but not yet finalized
        onboarding_pct: pct,
        updated_at: new Date().toISOString(),
      }).eq("id", invitation.candidate_id);
    }

    // Event
    await client.from("ld_onboarding_events").insert({
      org_id: invitation.org_id,
      invitation_id: invitation.id,
      event_type: finalStatus === "completed" ? "form.completed" : "form.saved",
      details: { template_id },
      ip_address: meta.ip,
      user_agent: meta.ua,
    });

    return NextResponse.json({ ok: true, submission, completion_pct: pct });
  } catch (e: any) {
    console.error("[onboard PATCH]", e?.message);
    return NextResponse.json({ error: e?.message || "Server error" }, { status: 500 });
  }
}

// ────────────────────────────────────────────────────────────────
//  POST /api/onboard/:token
//  Final submit + sign. Body: { typed_name, signature_image_data, consent_text }
//  Creates signature audit row, marks invitation completed.
// ────────────────────────────────────────────────────────────────
export async function POST(req: NextRequest, ctx: { params: Promise<{ token: string }> }) {
  try {
    const { token } = await ctx.params;
    if (!token) return NextResponse.json({ error: "Missing token" }, { status: 400 });

    const body = await req.json();
    const { typed_name, signature_image_data, consent_text } = body;
    if (!typed_name?.trim()) return NextResponse.json({ error: "typed_name required" }, { status: 400 });
    if (!consent_text?.trim()) return NextResponse.json({ error: "consent_text required" }, { status: 400 });

    const client = sb();
    const invitation = await loadInvitation(client, token);
    if (!invitation) return NextResponse.json({ error: "Invitation not found" }, { status: 404 });
    if (invitation.status === "expired" || invitation.status === "revoked") {
      return NextResponse.json({ error: "Invitation no longer valid" }, { status: 410 });
    }
    if (invitation.status === "completed") {
      return NextResponse.json({ error: "Already completed" }, { status: 410 });
    }

    // Verify all templates have completed submissions
    const { data: allSubs } = await client
      .from("ld_onboarding_submissions")
      .select("template_id, status")
      .eq("invitation_id", invitation.id);
    const completedTemplateIds = new Set((allSubs || []).filter((s: any) => s.status === "completed").map((s: any) => s.template_id));
    const missing = (invitation.template_ids || []).filter((id: string) => !completedTemplateIds.has(id));
    if (missing.length > 0) {
      return NextResponse.json({
        error: `${missing.length} form(s) still need to be completed before signing.`,
        missing_template_ids: missing,
      }, { status: 400 });
    }

    const meta = getClientMeta(req);
    const now = new Date().toISOString();

    // Capture signature
    const { data: signature, error: sErr } = await client
      .from("ld_onboarding_signatures")
      .insert({
        org_id: invitation.org_id,
        invitation_id: invitation.id,
        document_label: "Onboarding packet — final acknowledgment",
        typed_name: typed_name.trim(),
        signature_image_data: signature_image_data || null,
        consent_text: consent_text.trim(),
        ip_address: meta.ip,
        user_agent: meta.ua,
        candidate_name: invitation.candidate_name,
        candidate_email: invitation.candidate_email,
      })
      .select()
      .single();

    if (sErr) return NextResponse.json({ error: sErr.message }, { status: 500 });

    // Mark invitation completed
    await client.from("ld_onboarding_invitations").update({
      status: "completed",
      completed_at: now,
      completion_pct: 100,
      updated_at: now,
    }).eq("id", invitation.id);

    // Mirror onto candidate
    if (invitation.candidate_id) {
      await client.from("ld_candidates").update({
        onboarding_status: "completed",
        onboarding_completed_at: now,
        onboarding_pct: 100,
        updated_at: now,
      }).eq("id", invitation.candidate_id);
    }

    // Audit
    await client.from("ld_onboarding_events").insert({
      org_id: invitation.org_id,
      invitation_id: invitation.id,
      event_type: "packet.submitted",
      details: { signature_id: signature.id, typed_name },
      ip_address: meta.ip,
      user_agent: meta.ua,
    });

    return NextResponse.json({ ok: true, completed_at: now });
  } catch (e: any) {
    console.error("[onboard POST]", e?.message);
    return NextResponse.json({ error: e?.message || "Server error" }, { status: 500 });
  }
}
