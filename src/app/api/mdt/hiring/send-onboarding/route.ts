// src/app/api/mdt/hiring/send-onboarding/route.ts
export const dynamic = "force-dynamic";
export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import crypto from "crypto";

const sb = () => createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const MDT_ORG_ID = "a1d2c3e4-0001-4000-8000-000000000001";

// ────────────────────────────────────────────────────────────────
//  Build the welcome email
// ────────────────────────────────────────────────────────────────
function buildWelcomeEmail(args: {
  candidateName: string;
  positionName: string;
  link: string;
  expiresInDays: number;
  customSubject?: string;
  customBody?: string;
  fromOrgName: string;
}): { subject: string; body_text: string; body_html: string } {
  const subject = args.customSubject || `Welcome aboard — let's get you set up at ${args.fromOrgName}`;

  const intro = args.customBody
    || `Welcome to the team! We're excited to have you joining us as a ${args.positionName}.\n\nTo finish your onboarding, please complete a few short forms — should take 10-15 minutes. Have your bank info handy if you'd like direct deposit.`;

  const body_text = [
    `Hi ${args.candidateName.split(" ")[0]},`,
    ``,
    intro,
    ``,
    `Click here to start: ${args.link}`,
    ``,
    `This link is unique to you and expires in ${args.expiresInDays} days. You can save your progress and come back anytime — no login required.`,
    ``,
    `If you have questions, just reply to this email.`,
    ``,
    `Welcome aboard.`,
    ``,
    `— ${args.fromOrgName}`,
  ].join("\n");

  const body_html = `
<!DOCTYPE html><html><body style="margin:0;padding:0;background:#f0f6fa;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;color:#1e293b">
  <div style="max-width:640px;margin:0 auto;padding:32px 16px">
    <div style="background:#fff;border-radius:14px;overflow:hidden;box-shadow:0 4px 14px rgba(8,18,32,0.06)">
      <div style="background:linear-gradient(135deg,#0891b2,#0e7490);color:#fff;padding:32px 32px 28px">
        <div style="font-family:Georgia,serif;font-size:24px;font-weight:700;letter-spacing:-0.01em;margin-bottom:6px">Welcome aboard.</div>
        <div style="font-size:13px;opacity:0.85;letter-spacing:0.3px">${args.fromOrgName}</div>
      </div>
      <div style="padding:32px">
        <p style="font-size:15px;line-height:1.65;margin:0 0 18px">Hi ${args.candidateName.split(" ")[0]},</p>
        <p style="font-size:15px;line-height:1.65;margin:0 0 22px;white-space:pre-wrap">${escapeHtml(intro)}</p>

        <div style="text-align:center;margin:28px 0">
          <a href="${args.link}" style="display:inline-block;padding:14px 32px;background:linear-gradient(135deg,#0891b2,#0e7490);color:#fff;text-decoration:none;border-radius:10px;font-weight:700;font-size:15px;box-shadow:0 6px 18px rgba(8,145,178,0.25);letter-spacing:-0.01em">
            Start Onboarding →
          </a>
        </div>

        <div style="background:#f0f6fa;border:1px solid #dce8f0;border-radius:10px;padding:14px 16px;margin:22px 0;font-size:13px;color:#3b475c;line-height:1.55">
          <strong style="color:#0c1220">⏱ Takes about 10-15 minutes.</strong> Your progress saves automatically — close the tab anytime and come back. The link expires in ${args.expiresInDays} days.
        </div>

        <p style="font-size:13.5px;line-height:1.6;color:#3b475c;margin:0 0 8px">Bring with you:</p>
        <ul style="font-size:13.5px;line-height:1.7;margin:0 0 22px;color:#3b475c;padding-left:22px">
          <li>Your Social Security number</li>
          <li>Bank routing & account numbers (if direct deposit)</li>
          <li>An emergency contact's name and phone</li>
        </ul>

        <p style="font-size:13px;color:#64748b;line-height:1.5;margin:0">If anything's unclear, just reply to this email and we'll help.</p>

        <div style="margin-top:24px;padding-top:18px;border-top:1px solid #dce8f0;font-size:13px;color:#3b475c">
          Welcome aboard,<br>
          <strong style="color:#0c1220">${args.fromOrgName}</strong>
        </div>
      </div>
    </div>
    <div style="text-align:center;padding:20px;font-size:11px;color:#94a3b8;letter-spacing:0.5px">
      Powered by ShiftPro · <a href="${args.link}" style="color:#94a3b8">View in browser</a>
    </div>
  </div>
</body></html>`.trim();

  return { subject, body_text, body_html };
}

function escapeHtml(s: string): string {
  return (s || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

// POST /api/mdt/hiring/send-onboarding
// Body: { candidate_id, packet_id?, custom_subject?, custom_body?, send: bool }
//   send=false → preview
//   send=true  → create invitation + email + return { token, link }
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { candidate_id, packet_id, custom_subject, custom_body, send, sent_by_name } = body;
    if (!candidate_id) return NextResponse.json({ error: "candidate_id required" }, { status: 400 });

    const client = sb();

    // Load candidate + position + org
    const { data: candidate, error: cErr } = await client
      .from("ld_candidates")
      .select("*, ld_hiring_positions(slug, display_name)")
      .eq("id", candidate_id)
      .eq("org_id", MDT_ORG_ID)
      .single();
    if (cErr || !candidate) return NextResponse.json({ error: "Candidate not found" }, { status: 404 });
    if (!candidate.email) return NextResponse.json({ error: "Candidate has no email — add one first." }, { status: 400 });

    const position = (candidate as any).ld_hiring_positions;
    const positionName = position?.display_name || "team member";
    const positionSlug = position?.slug || null;

    const { data: org } = await client
      .from("ld_organizations")
      .select("name, default_from_email, default_from_name")
      .eq("id", MDT_ORG_ID)
      .single();

    // Resolve packet — either explicit packet_id, or position-matching packet, or default
    let resolvedPacketId = packet_id || null;
    if (!resolvedPacketId) {
      const { data: posPacket } = await client
        .from("ld_onboarding_packets")
        .select("id, template_ids")
        .eq("org_id", MDT_ORG_ID)
        .eq("active", true)
        .eq("position_slug", positionSlug)
        .maybeSingle();
      if (posPacket) {
        resolvedPacketId = posPacket.id;
      } else {
        const { data: defaultPacket } = await client
          .from("ld_onboarding_packets")
          .select("id, template_ids")
          .eq("org_id", MDT_ORG_ID)
          .eq("active", true)
          .is("position_slug", null)
          .maybeSingle();
        resolvedPacketId = defaultPacket?.id || null;
      }
    }
    if (!resolvedPacketId) {
      return NextResponse.json({
        error: "No onboarding packet found. Create one in the onboarding settings first.",
      }, { status: 400 });
    }

    const { data: packet, error: pErr } = await client
      .from("ld_onboarding_packets")
      .select("*")
      .eq("id", resolvedPacketId)
      .single();
    if (pErr || !packet) return NextResponse.json({ error: "Packet not found" }, { status: 404 });

    if (!packet.template_ids || packet.template_ids.length === 0) {
      return NextResponse.json({ error: "Packet has no forms attached." }, { status: 400 });
    }

    // Generate magic-link token (32 bytes → 43 chars urlsafe base64)
    const token = crypto.randomBytes(32).toString("base64url");
    const expiresInDays = 14;
    const expiresAt = new Date(Date.now() + expiresInDays * 86400000);
    const origin = req.nextUrl.origin || "https://shiftpro.ai";
    const link = `${origin}/onboard/${token}`;

    const subjectFinal = custom_subject || packet.welcome_subject || undefined;
    const bodyFinal = custom_body || packet.welcome_body || undefined;
    const fromOrgName = org?.name || "ShiftPro";

    const email = buildWelcomeEmail({
      candidateName: candidate.full_name,
      positionName,
      link,
      expiresInDays,
      customSubject: subjectFinal,
      customBody: bodyFinal,
      fromOrgName,
    });

    // Preview mode
    if (!send) {
      return NextResponse.json({
        ok: true,
        preview: {
          subject: email.subject,
          body_text: email.body_text,
          body_html: email.body_html,
          link,
          packet_name: packet.name,
          form_count: packet.template_ids.length,
        },
      });
    }

    // Create invitation
    const { data: invitation, error: iErr } = await client
      .from("ld_onboarding_invitations")
      .insert({
        org_id: MDT_ORG_ID,
        candidate_id,
        packet_id: resolvedPacketId,
        candidate_name: candidate.full_name,
        candidate_email: candidate.email,
        position_name: positionName,
        position_slug: positionSlug,
        token,
        expires_at: expiresAt.toISOString(),
        template_ids: packet.template_ids,
        status: "invited",
        sent_by_name: sent_by_name || null,
      })
      .select()
      .single();

    if (iErr || !invitation) {
      return NextResponse.json({ error: iErr?.message || "Failed to create invitation" }, { status: 500 });
    }

    // Try SMTP send via Captain@ mailbox
    const { data: mailbox } = await client
      .from("ld_mailboxes")
      .select("*")
      .eq("org_id", MDT_ORG_ID)
      .eq("email", "Captain@marinediscovery.com")
      .maybeSingle();

    let sent = false;
    let messageId: string | null = null;
    let queueReason = "";

    if (mailbox) {
      const smtpPassword = process.env.MDT_SMTP_PASSWORD_CAPTAIN || "";
      const smtpReady = mailbox.smtp_host && mailbox.smtp_user && smtpPassword;

      if (smtpReady) {
        try {
          const nodemailer = await import("nodemailer");
          const transporter = nodemailer.createTransport({
            host: mailbox.smtp_host,
            port: mailbox.smtp_port || 465,
            secure: (mailbox.smtp_port || 465) === 465,
            auth: { user: mailbox.smtp_user, pass: smtpPassword },
          });
          const info = await transporter.sendMail({
            from: `"${mailbox.display_name || fromOrgName}" <${mailbox.email}>`,
            to: candidate.email,
            subject: email.subject,
            text: email.body_text,
            html: email.body_html,
          });
          messageId = info.messageId;
          sent = true;
        } catch (e: any) {
          queueReason = "SMTP send failed: " + (e?.message || "unknown");
        }
      } else {
        queueReason = "SMTP credentials not configured — invitation created but email not sent.";
      }
    } else {
      queueReason = "Captain@ mailbox not configured.";
    }

    // Update invitation with send status
    if (sent) {
      await client.from("ld_onboarding_invitations").update({
        email_sent_at: new Date().toISOString(),
        email_sent_to: candidate.email,
        email_message_id: messageId,
      }).eq("id", invitation.id);
    }

    // Update candidate row
    await client.from("ld_candidates").update({
      onboarding_invitation_id: invitation.id,
      onboarding_status: "invited",
      onboarding_sent_at: sent ? new Date().toISOString() : null,
      updated_at: new Date().toISOString(),
    }).eq("id", candidate_id);

    // Audit
    await client.from("ld_onboarding_events").insert({
      org_id: MDT_ORG_ID,
      invitation_id: invitation.id,
      event_type: sent ? "email.sent" : "invitation.created",
      details: { token_preview: token.slice(0, 8), to: candidate.email, queue_reason: queueReason || undefined },
    });

    await client.from("ld_audit_log").insert({
      org_id: MDT_ORG_ID,
      actor_type: "user",
      action: sent ? "onboarding.sent" : "onboarding.queued",
      details: { candidate_id, invitation_id: invitation.id, packet_id: resolvedPacketId, queue_reason: queueReason || undefined },
    });

    return NextResponse.json({
      ok: true,
      sent,
      message_id: messageId,
      queue_reason: queueReason || undefined,
      invitation: {
        id: invitation.id,
        token,
        link,
        expires_at: expiresAt.toISOString(),
        candidate_email: candidate.email,
      },
      preview: {
        subject: email.subject,
        body_text: email.body_text,
      },
    });
  } catch (e: any) {
    console.error("[send-onboarding]", e?.message);
    return NextResponse.json({ error: e?.message || "Server error" }, { status: 500 });
  }
}
