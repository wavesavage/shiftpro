// src/app/api/mdt/reply/route.ts
// ════════════════════════════════════════════════════════════════
//  OUTBOUND REPLY SENDER
//  POST /api/mdt/reply  { ticketId, draftId?, subject, body_text, fromMailboxId? }
//  Sends an email via SMTP (using nodemailer), records in ld_messages,
//  updates ticket status, optionally consumes a draft.
// ════════════════════════════════════════════════════════════════

export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const sb = () => createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// ────────────────────────────────────────────────────────────────
//  sendViaSmtp — wraps nodemailer with the right credentials
//  for the chosen mailbox.
// ────────────────────────────────────────────────────────────────
async function sendViaSmtp(args: {
  smtp_host: string;
  smtp_port: number;
  smtp_user: string;
  smtp_password: string;
  from_email: string;
  from_name: string;
  to_email: string;
  subject: string;
  body_text: string;
  body_html?: string;
  in_reply_to?: string;
  references?: string;
}): Promise<{ messageId: string }> {
  // Lazy import — keeps cold-start fast for routes that don't send mail
  const nodemailer = await import("nodemailer");

  const transporter = nodemailer.createTransport({
    host: args.smtp_host,
    port: args.smtp_port,
    secure: args.smtp_port === 465, // 465 = TLS, 587 = STARTTLS
    auth: { user: args.smtp_user, pass: args.smtp_password },
  });

  const info = await transporter.sendMail({
    from: `"${args.from_name}" <${args.from_email}>`,
    to: args.to_email,
    subject: args.subject,
    text: args.body_text,
    html: args.body_html,
    inReplyTo: args.in_reply_to,
    references: args.references,
  });

  return { messageId: info.messageId };
}

// Plain-text → very simple HTML (safe — no markdown rendering, just paragraphs + linkify)
function textToHtml(text: string): string {
  const escaped = text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
  const linked = escaped.replace(/(https?:\/\/[^\s]+)/g, '<a href="$1" style="color:#0891b2">$1</a>');
  const paras = linked.split(/\n\n+/).map(p => `<p style="margin:0 0 12px 0">${p.replace(/\n/g, "<br>")}</p>`).join("");
  return `<div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;font-size:15px;line-height:1.55;color:#1e293b">${paras}</div>`;
}

// ────────────────────────────────────────────────────────────────
//  POST /api/mdt/reply
// ────────────────────────────────────────────────────────────────
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { ticketId, draftId, subject, body_text, fromMailboxId } = body;

    if (!ticketId || !subject || !body_text) {
      return NextResponse.json({ error: "ticketId, subject, body_text required" }, { status: 400 });
    }

    const client = sb();

    // Load ticket + contact
    const { data: ticket, error: tErr } = await client
      .from("ld_tickets")
      .select("*, ld_contacts(email, full_name)")
      .eq("id", ticketId)
      .single();
    if (tErr || !ticket) return NextResponse.json({ error: "Ticket not found" }, { status: 404 });

    const toEmail = (ticket as any).ld_contacts?.email;
    if (!toEmail || toEmail.endsWith("@voicemail.local")) {
      return NextResponse.json({ error: "No valid customer email on this ticket. Reply manually via phone or another channel." }, { status: 400 });
    }

    // Decide which mailbox to send from
    const mailboxId = fromMailboxId || ticket.outbound_mailbox_id;
    if (!mailboxId) {
      return NextResponse.json({ error: "No outbound mailbox set for this ticket. Pick one and try again." }, { status: 400 });
    }

    const { data: mailbox, error: mErr } = await client
      .from("ld_mailboxes")
      .select("*")
      .eq("id", mailboxId)
      .single();
    if (mErr || !mailbox) return NextResponse.json({ error: "Mailbox not found" }, { status: 404 });

    // Get the SMTP password from env (we map mailbox.email → env var name)
    // Convention: SMTP password for Captain@marinediscovery.com is in env MDT_SMTP_PASSWORD_CAPTAIN
    //             SMTP password for Groups@marinediscovery.com  is in env MDT_SMTP_PASSWORD_GROUPS
    // (Until we have proper Supabase Vault wiring this is the simplest secure path.)
    const localPart = (mailbox.email || "").split("@")[0].toUpperCase();
    const envVarName = `MDT_SMTP_PASSWORD_${localPart}`;
    const smtpPassword = process.env[envVarName] || mailbox.smtp_password_encrypted || "";

    if (!mailbox.smtp_host || !mailbox.smtp_user || !smtpPassword) {
      return NextResponse.json({
        error: `SMTP not configured for ${mailbox.email}. Set smtp_host, smtp_user on the mailbox and ${envVarName} env var.`,
      }, { status: 503 });
    }

    // Get the most recent inbound message to thread the reply correctly
    const { data: lastInbound } = await client
      .from("ld_messages")
      .select("external_id, subject")
      .eq("ticket_id", ticketId)
      .eq("direction", "inbound")
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    // Send
    let sent: { messageId: string };
    try {
      sent = await sendViaSmtp({
        smtp_host: mailbox.smtp_host,
        smtp_port: mailbox.smtp_port || 465,
        smtp_user: mailbox.smtp_user,
        smtp_password: smtpPassword,
        from_email: mailbox.email,
        from_name: mailbox.display_name || mailbox.email,
        to_email: toEmail,
        subject,
        body_text,
        body_html: textToHtml(body_text),
        in_reply_to: lastInbound?.external_id || undefined,
        references: lastInbound?.external_id || undefined,
      });
    } catch (e: any) {
      console.error("[reply] SMTP send failed:", e?.message);
      // Update mailbox last_error
      await client.from("ld_mailboxes").update({
        last_error: e?.message || "send failed",
        last_check_at: new Date().toISOString(),
      }).eq("id", mailbox.id);
      return NextResponse.json({ error: "Send failed: " + (e?.message || "unknown") }, { status: 502 });
    }

    // Record outbound message
    await client.from("ld_messages").insert({
      ticket_id: ticketId,
      org_id: ticket.org_id,
      direction: "outbound",
      from_email: mailbox.email,
      from_name: mailbox.display_name,
      to_email: toEmail,
      subject,
      body_text,
      body_html: textToHtml(body_text),
      channel: "email",
      external_id: sent.messageId,
      delivery_status: "sent",
      delivered_at: new Date().toISOString(),
    });

    // If this came from a draft, mark it sent
    if (draftId) {
      await client.from("ld_drafts")
        .update({ status: "sent", sent_at: new Date().toISOString() })
        .eq("id", draftId);
    }

    // Update ticket status + first_response_at
    const updates: any = {
      status: ticket.status === "new" ? "awaiting_reply" : ticket.status,
      updated_at: new Date().toISOString(),
    };
    if (!ticket.first_response_at) updates.first_response_at = new Date().toISOString();
    await client.from("ld_tickets").update(updates).eq("id", ticketId);

    // Mark mailbox healthy
    await client.from("ld_mailboxes").update({
      status: "active",
      last_check_at: new Date().toISOString(),
      last_error: null,
    }).eq("id", mailbox.id);

    // Audit
    await client.from("ld_audit_log").insert({
      org_id: ticket.org_id,
      ticket_id: ticketId,
      actor_type: "user",
      action: "reply.sent",
      details: { from_mailbox: mailbox.email, to: toEmail, message_id: sent.messageId },
    });

    return NextResponse.json({ ok: true, message_id: sent.messageId });
  } catch (e: any) {
    console.error("[reply]", e?.message);
    return NextResponse.json({ error: e?.message || "Server error" }, { status: 500 });
  }
}
