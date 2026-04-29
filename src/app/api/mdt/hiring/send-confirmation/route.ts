// src/app/api/mdt/hiring/send-confirmation/route.ts
export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const sb = () => createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const MDT_ORG_ID = "a1d2c3e4-0001-4000-8000-000000000001";

// ────────────────────────────────────────────────────────────────
//  Builds the interview confirmation email body
// ────────────────────────────────────────────────────────────────
function buildConfirmationBody(args: {
  candidateName: string;
  positionName: string;
  scheduledAt: string;
  location: string;
  duration: number;
  conductedBy: string;
}): { subject: string; body_text: string } {
  const dt = new Date(args.scheduledAt);
  const dateStr = dt.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" });
  const timeStr = dt.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });

  const subject = `Interview Confirmation — ${args.positionName} at Marine Discovery Tours`;

  const body_text = [
    `Hi ${args.candidateName.split(" ")[0]},`,
    ``,
    `Thank you for your interest in the ${args.positionName} position at Marine Discovery Tours. We'd like to confirm your interview:`,
    ``,
    `📅 ${dateStr}`,
    `🕐 ${timeStr}  (${args.duration} minutes)`,
    `📍 ${args.location}`,
    args.conductedBy ? `👤 With: ${args.conductedBy}` : "",
    ``,
    `Please bring:`,
    `• A copy of your resume`,
    `• Any relevant certifications or licenses (USCG, CPR, etc., if applicable)`,
    `• Two professional references with phone numbers`,
    ``,
    `If you need to reschedule, just reply to this email and we'll find another time.`,
    ``,
    `Looking forward to meeting you.`,
    ``,
    `— Marine Discovery Tours`,
    `345 SW Bay Blvd, Newport, OR 97365`,
  ].filter(Boolean).join("\n");

  return { subject, body_text };
}

// POST /api/mdt/hiring/send-confirmation
// Body: { interview_id, candidate_id }
//
// Marks the confirmation as sent (or queued, if SMTP not yet configured).
// Reuses the same SMTP infrastructure as MDT replies.
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { interview_id, candidate_id } = body;
    if (!interview_id || !candidate_id) {
      return NextResponse.json({ error: "interview_id and candidate_id required" }, { status: 400 });
    }

    const client = sb();

    // Load interview + candidate + position
    const { data: interview, error: iErr } = await client
      .from("ld_interviews")
      .select("*, ld_candidates(full_name, email, position_slug, position_id)")
      .eq("id", interview_id)
      .single();
    if (iErr || !interview) return NextResponse.json({ error: "Interview not found" }, { status: 404 });

    const candidate = (interview as any).ld_candidates;
    if (!candidate?.email) {
      return NextResponse.json({ error: "Candidate has no email — cannot send confirmation. Add an email or call the candidate directly." }, { status: 400 });
    }
    if (!interview.scheduled_at || !interview.scheduled_location) {
      return NextResponse.json({ error: "Interview not fully scheduled — set date/time and location first." }, { status: 400 });
    }

    // Look up position
    const { data: position } = await client
      .from("ld_hiring_positions")
      .select("display_name")
      .eq("id", candidate.position_id)
      .single();

    const { subject, body_text } = buildConfirmationBody({
      candidateName: candidate.full_name,
      positionName: position?.display_name || "Crew",
      scheduledAt: interview.scheduled_at,
      location: interview.scheduled_location,
      duration: interview.scheduled_duration_minutes || 45,
      conductedBy: interview.conducted_by_name || "",
    });

    // Find Captain@ mailbox (used for hiring outbound regardless of MDT category)
    const { data: mailbox } = await client
      .from("ld_mailboxes")
      .select("*")
      .eq("org_id", MDT_ORG_ID)
      .eq("email", "Captain@marinediscovery.com")
      .maybeSingle();

    if (!mailbox) {
      return NextResponse.json({
        error: "Captain@ mailbox not configured. Run the MDT schema migration first.",
      }, { status: 500 });
    }

    // Try to send via SMTP — if creds aren't wired, mark as queued and tell the user
    const localPart = "CAPTAIN";
    const envVarName = `MDT_SMTP_PASSWORD_${localPart}`;
    const smtpPassword = process.env[envVarName] || "";
    const smtpReady = mailbox.smtp_host && mailbox.smtp_user && smtpPassword;

    let sent = false;
    let messageId: string | null = null;
    let queueReason = "";

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
          from: `"${mailbox.display_name || "Marine Discovery Tours"}" <${mailbox.email}>`,
          to: candidate.email,
          subject,
          text: body_text,
        });
        messageId = info.messageId;
        sent = true;
      } catch (e: any) {
        queueReason = "SMTP send failed: " + (e?.message || "unknown");
      }
    } else {
      queueReason = "SMTP credentials not configured — confirmation will be queued.";
    }

    // Record on the interview
    if (sent) {
      await client.from("ld_interviews").update({
        confirmation_sent_at: new Date().toISOString(),
        confirmation_sent_to: candidate.email,
      }).eq("id", interview_id);
    }

    // Advance candidate status if relevant
    await client.from("ld_candidates").update({
      status: "interview_scheduled",
      updated_at: new Date().toISOString(),
    }).eq("id", candidate_id).in("status", ["applied", "phone_screen"]);

    await client.from("ld_audit_log").insert({
      org_id: MDT_ORG_ID,
      actor_type: "user",
      action: sent ? "confirmation.sent" : "confirmation.queued",
      details: { candidate_id, interview_id, to: candidate.email, queue_reason: queueReason || undefined },
    });

    return NextResponse.json({
      ok: true,
      sent,
      message_id: messageId,
      queue_reason: queueReason || undefined,
      preview: { subject, body_text },
    });
  } catch (e: any) {
    console.error("[send-confirmation]", e?.message);
    return NextResponse.json({ error: e?.message || "Server error" }, { status: 500 });
  }
}
