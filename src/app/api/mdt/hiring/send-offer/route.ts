// src/app/api/mdt/hiring/send-offer/route.ts
export const dynamic = "force-dynamic";
export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const sb = () => createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const MDT_ORG_ID = "a1d2c3e4-0001-4000-8000-000000000001";

// ────────────────────────────────────────────────────────────────
//  Builds plain-text + HTML offer letter content
// ────────────────────────────────────────────────────────────────
function buildOfferText(args: {
  candidateName: string;
  positionName: string;
  payRateCents: number;
  payUnit: string;
  startDate: string;
  employmentType: string;
}): string {
  const startStr = args.startDate
    ? new Date(args.startDate + "T12:00:00").toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })
    : "to be determined";
  const todayStr = new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
  const dollars = (args.payRateCents / 100).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  const employmentLabel = (args.employmentType || "seasonal").replace(/_/g, " ");

  return [
    `MARINE DISCOVERY TOURS`,
    `345 SW Bay Boulevard, Newport, Oregon 97365`,
    ``,
    `${todayStr}`,
    ``,
    `Dear ${args.candidateName},`,
    ``,
    `We are delighted to offer you the position of ${args.positionName} with Marine Discovery Tours.`,
    ``,
    `POSITION DETAILS`,
    `Position:        ${args.positionName}`,
    `Employment:      ${employmentLabel}`,
    `Compensation:    $${dollars} per ${args.payUnit}`,
    `Start Date:      ${startStr}`,
    `Reports To:      Captain / Owner`,
    `Location:        345 SW Bay Boulevard, Newport, OR 97365`,
    ``,
    `Your role will involve the duties outlined during your interview, which may include hands-on guest engagement, vessel duties, ticket sales, and contributing to a safe and memorable experience for our guests.`,
    ``,
    `EMPLOYMENT TERMS`,
    `This offer is contingent upon:`,
    `• Successful completion of background check (where applicable)`,
    `• Verification of any required licenses and certifications`,
    `• Valid documentation establishing your right to work in the United States`,
    ``,
    `Marine Discovery Tours is an at-will employer. Either you or the company may terminate the employment relationship at any time, with or without cause or notice.`,
    ``,
    `ACCEPTANCE`,
    `To accept this offer, please reply to this email confirming your acceptance and proposed start date. We will follow up with onboarding paperwork.`,
    ``,
    `We are excited to welcome you aboard the DISCOVERY.`,
    ``,
    `Sincerely,`,
    ``,
    ``,
    `Marine Discovery Tours`,
    `Captain@marinediscovery.com`,
    ``,
    `————————————————————————————————`,
    `CANDIDATE ACCEPTANCE`,
    ``,
    `I, ${args.candidateName}, accept the position of ${args.positionName} under the terms outlined above.`,
    ``,
    `Signed: __________________________   Date: ________________`,
  ].join("\n");
}

// HTML version with styling for nicer email rendering
function buildOfferHtml(args: {
  candidateName: string;
  positionName: string;
  payRateCents: number;
  payUnit: string;
  startDate: string;
  employmentType: string;
}): string {
  const startStr = args.startDate
    ? new Date(args.startDate + "T12:00:00").toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })
    : "to be determined";
  const todayStr = new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
  const dollars = (args.payRateCents / 100).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  const employmentLabel = (args.employmentType || "seasonal").replace(/_/g, " ");

  return `
<!DOCTYPE html><html><body style="margin:0;padding:0;background:#f0f6fa;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;color:#1e293b">
  <div style="max-width:640px;margin:0 auto;padding:32px 16px">
    <div style="background:#fff;border-radius:14px;overflow:hidden;box-shadow:0 4px 14px rgba(8,18,32,0.06)">
      <div style="background:linear-gradient(135deg,#0891b2,#0e7490);color:#fff;padding:28px 32px">
        <div style="font-family:Georgia,serif;font-size:22px;font-weight:700;letter-spacing:-0.01em">Marine Discovery Tours</div>
        <div style="font-size:12px;opacity:0.85;margin-top:4px;letter-spacing:0.5px">345 SW Bay Boulevard · Newport, Oregon 97365</div>
      </div>
      <div style="padding:32px">
        <div style="font-size:13px;color:#64748b;margin-bottom:20px">${todayStr}</div>
        <div style="font-size:16px;line-height:1.6;margin-bottom:20px">Dear ${args.candidateName},</div>
        <p style="font-size:15px;line-height:1.65;margin:0 0 24px">We are delighted to offer you the position of <strong>${args.positionName}</strong> with Marine Discovery Tours.</p>

        <div style="background:#f0f6fa;border:1px solid #dce8f0;border-radius:10px;padding:18px 20px;margin-bottom:20px">
          <div style="font-family:'Courier New',monospace;font-size:10px;color:#64748b;letter-spacing:1.5px;text-transform:uppercase;margin-bottom:10px;font-weight:700">Position Details</div>
          <table style="width:100%;font-size:14px;border-collapse:collapse">
            <tr><td style="padding:4px 0;color:#3b475c;width:140px">Position</td><td style="padding:4px 0;color:#0c1220;font-weight:600">${args.positionName}</td></tr>
            <tr><td style="padding:4px 0;color:#3b475c">Employment Type</td><td style="padding:4px 0;color:#0c1220;font-weight:600;text-transform:capitalize">${employmentLabel}</td></tr>
            <tr><td style="padding:4px 0;color:#3b475c">Compensation</td><td style="padding:4px 0;color:#0c1220;font-weight:600">$${dollars} per ${args.payUnit}</td></tr>
            <tr><td style="padding:4px 0;color:#3b475c">Start Date</td><td style="padding:4px 0;color:#0c1220;font-weight:600">${startStr}</td></tr>
            <tr><td style="padding:4px 0;color:#3b475c">Location</td><td style="padding:4px 0;color:#0c1220;font-weight:600">345 SW Bay Blvd, Newport, OR</td></tr>
          </table>
        </div>

        <p style="font-size:14px;line-height:1.6;margin:0 0 18px;color:#3b475c">Your role will involve the duties outlined during your interview, which may include hands-on guest engagement, vessel duties, ticket sales, and contributing to a safe and memorable experience for our guests.</p>

        <div style="font-size:13px;color:#64748b;margin-bottom:8px;font-weight:700;letter-spacing:0.5px;text-transform:uppercase">Employment Terms</div>
        <p style="font-size:14px;line-height:1.6;margin:0 0 8px;color:#3b475c">This offer is contingent upon:</p>
        <ul style="font-size:14px;line-height:1.7;margin:0 0 18px;color:#3b475c;padding-left:22px">
          <li>Successful completion of background check (where applicable)</li>
          <li>Verification of any required licenses and certifications</li>
          <li>Valid documentation establishing your right to work in the United States</li>
        </ul>

        <p style="font-size:13px;line-height:1.6;color:#64748b;margin:0 0 22px">Marine Discovery Tours is an at-will employer. Either you or the company may terminate the employment relationship at any time, with or without cause or notice.</p>

        <div style="background:linear-gradient(135deg,rgba(224,123,0,0.06),rgba(224,123,0,0.02));border:1px solid rgba(224,123,0,0.2);border-radius:10px;padding:16px 18px;margin-bottom:24px">
          <div style="font-size:14px;font-weight:700;color:#0c1220;margin-bottom:6px">Ready to come aboard?</div>
          <div style="font-size:13px;color:#3b475c;line-height:1.55">Just reply to this email confirming your acceptance and proposed start date. We'll follow up with onboarding paperwork.</div>
        </div>

        <p style="font-size:14px;line-height:1.6;margin:0 0 8px">We are excited to welcome you aboard the <em>DISCOVERY</em>.</p>

        <div style="margin-top:28px;padding-top:18px;border-top:1px solid #dce8f0;font-size:14px;color:#3b475c">
          Sincerely,<br><br>
          <strong style="color:#0c1220">Marine Discovery Tours</strong><br>
          <a href="mailto:Captain@marinediscovery.com" style="color:#0891b2;text-decoration:none">Captain@marinediscovery.com</a>
        </div>
      </div>
    </div>
  </div>
</body></html>
  `.trim();
}

// POST /api/mdt/hiring/send-offer
// Body: { candidate_id, pay_rate?, pay_unit?, start_date?, employment_type?, send: bool }
//   • send=false → preview only (returns subject + body)
//   • send=true  → actually email + record
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { candidate_id, send } = body;
    if (!candidate_id) return NextResponse.json({ error: "candidate_id required" }, { status: 400 });

    const client = sb();

    const { data: candidate, error: cErr } = await client
      .from("ld_candidates")
      .select("*, ld_hiring_positions(display_name, default_pay_rate_cents, default_pay_unit, default_employment_type)")
      .eq("id", candidate_id)
      .eq("org_id", MDT_ORG_ID)
      .single();
    if (cErr || !candidate) return NextResponse.json({ error: "Candidate not found" }, { status: 404 });

    if (!candidate.email) {
      return NextResponse.json({ error: "Candidate has no email — cannot send offer." }, { status: 400 });
    }

    const position = (candidate as any).ld_hiring_positions;
    const positionName = position?.display_name || "Crew";

    // Resolve final fields — request body wins over candidate row wins over position default
    const pay_rate_cents = body.pay_rate
      ? Math.round(parseFloat(body.pay_rate) * 100)
      : candidate.hire_pay_rate_cents || position?.default_pay_rate_cents || 2000;
    const pay_unit = body.pay_unit || candidate.hire_pay_unit || position?.default_pay_unit || "hour";
    const start_date = body.start_date || candidate.hire_start_date || "";
    const employment_type = body.employment_type || candidate.hire_employment_type || position?.default_employment_type || "seasonal";

    const subject = `Offer of Employment — ${positionName} — Marine Discovery Tours`;
    const body_text = buildOfferText({
      candidateName: candidate.full_name,
      positionName,
      payRateCents: pay_rate_cents,
      payUnit: pay_unit,
      startDate: start_date,
      employmentType: employment_type,
    });
    const body_html = buildOfferHtml({
      candidateName: candidate.full_name,
      positionName,
      payRateCents: pay_rate_cents,
      payUnit: pay_unit,
      startDate: start_date,
      employmentType: employment_type,
    });

    // Preview mode
    if (!send) {
      return NextResponse.json({ ok: true, preview: { subject, body_text, body_html, pay_rate_cents, pay_unit, start_date, employment_type } });
    }

    // Send mode — try SMTP via Captain@ mailbox
    const { data: mailbox } = await client
      .from("ld_mailboxes")
      .select("*")
      .eq("org_id", MDT_ORG_ID)
      .eq("email", "Captain@marinediscovery.com")
      .maybeSingle();
    if (!mailbox) {
      return NextResponse.json({ error: "Captain@ mailbox not configured." }, { status: 500 });
    }

    const smtpPassword = process.env.MDT_SMTP_PASSWORD_CAPTAIN || "";
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
          html: body_html,
        });
        messageId = info.messageId;
        sent = true;
      } catch (e: any) {
        queueReason = "SMTP send failed: " + (e?.message || "unknown");
      }
    } else {
      queueReason = "SMTP credentials not configured — offer letter generated but not sent.";
    }

    // Update candidate with hire details + status
    await client.from("ld_candidates").update({
      status: "offer_sent",
      hire_pay_rate_cents: pay_rate_cents,
      hire_pay_unit: pay_unit,
      hire_start_date: start_date || null,
      hire_employment_type: employment_type,
      updated_at: new Date().toISOString(),
    }).eq("id", candidate_id);

    await client.from("ld_audit_log").insert({
      org_id: MDT_ORG_ID,
      actor_type: "user",
      action: sent ? "offer.sent" : "offer.queued",
      details: { candidate_id, to: candidate.email, pay_rate_cents, pay_unit, start_date, employment_type, queue_reason: queueReason || undefined },
    });

    return NextResponse.json({
      ok: true,
      sent,
      message_id: messageId,
      queue_reason: queueReason || undefined,
      preview: { subject, body_text, body_html, pay_rate_cents, pay_unit, start_date, employment_type },
    });
  } catch (e: any) {
    console.error("[send-offer]", e?.message);
    return NextResponse.json({ error: e?.message || "Server error" }, { status: 500 });
  }
}
