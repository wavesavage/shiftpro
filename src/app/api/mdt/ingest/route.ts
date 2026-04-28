// src/app/api/mdt/ingest/route.ts
// ════════════════════════════════════════════════════════════════
//  UNIVERSAL INBOUND ENDPOINT
//  Accepts: email forwards, voicemail transcriptions, FareHarbor webhooks
//  POST /api/mdt/ingest
// ════════════════════════════════════════════════════════════════

export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { classify } from "@/lib/mdt/classify";
import { computeTideScore } from "@/lib/mdt/tideScore";

const sb = () => createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// MDT org id — hardcoded for now since MDT is the first instance
const MDT_ORG_ID = "a1d2c3e4-0001-4000-8000-000000000001";

// Shared secret — every inbound source must include this
// Set INBOUND_WEBHOOK_SECRET in Vercel env vars
function verifySecret(req: NextRequest): boolean {
  const provided = req.headers.get("x-mdt-secret") || req.nextUrl.searchParams.get("secret") || "";
  const expected = process.env.INBOUND_WEBHOOK_SECRET || "";
  if (!expected) {
    console.warn("[ingest] INBOUND_WEBHOOK_SECRET not configured — rejecting");
    return false;
  }
  return provided === expected;
}

// ────────────────────────────────────────────────────────────────
//  Normalize the payload from any inbound source into a common shape
// ────────────────────────────────────────────────────────────────
type Normalized = {
  from_email: string;
  from_name: string;
  to_email?: string;
  subject: string;
  body_text: string;
  body_html?: string;
  channel: "email" | "voicemail" | "fareharbor" | "web_form";
  external_id?: string;
  voicemail_url?: string;
  voicemail_duration_seconds?: number;
  voicemail_transcript?: string;
  received_at: Date;
};

function normalize(payload: any): Normalized | { error: string } {
  // VOICEMAIL — generic shape from any VOIP provider
  // Expected: { source: "voicemail", from_phone, from_name?, transcript, recording_url, duration_seconds, received_at? }
  if (payload.source === "voicemail") {
    return {
      from_email: payload.from_phone ? `${payload.from_phone}@voicemail.local` : "unknown@voicemail.local",
      from_name: payload.from_name || payload.from_phone || "Voicemail Caller",
      subject: `Voicemail from ${payload.from_name || payload.from_phone || "unknown"}`,
      body_text: payload.transcript || "(transcript unavailable)",
      channel: "voicemail",
      external_id: payload.external_id || null,
      voicemail_url: payload.recording_url,
      voicemail_duration_seconds: payload.duration_seconds,
      voicemail_transcript: payload.transcript,
      received_at: payload.received_at ? new Date(payload.received_at) : new Date(),
    };
  }

  // FAREHARBOR — webhook payload
  // Expected: { source: "fareharbor", booking_id, customer_name, customer_email, customer_phone?, message?, item_name?, ... }
  if (payload.source === "fareharbor") {
    const bodyParts: string[] = [];
    if (payload.item_name) bodyParts.push(`Tour: ${payload.item_name}`);
    if (payload.party_size) bodyParts.push(`Party size: ${payload.party_size}`);
    if (payload.requested_date) bodyParts.push(`Requested date: ${payload.requested_date}`);
    if (payload.message) bodyParts.push(`Customer message:\n${payload.message}`);
    if (payload.customer_phone) bodyParts.push(`Phone: ${payload.customer_phone}`);

    return {
      from_email: payload.customer_email || "fareharbor@unknown.local",
      from_name: payload.customer_name || "FareHarbor Customer",
      subject: payload.subject || `FareHarbor inquiry: ${payload.item_name || "Tour"}`,
      body_text: bodyParts.join("\n\n") || "(no message body)",
      channel: "fareharbor",
      external_id: payload.booking_id || payload.external_id || null,
      received_at: payload.received_at ? new Date(payload.received_at) : new Date(),
    };
  }

  // EMAIL — generic forwarded email payload
  // Expected: { source: "email", from_email, from_name?, to_email?, subject, body_text, body_html?, message_id?, received_at? }
  // Or, when sourced from Resend's inbound webhook, it has its own shape we map here.
  if (payload.source === "email" || payload.from_email) {
    if (!payload.from_email && !payload.from?.address) {
      return { error: "from_email required for email source" };
    }
    return {
      from_email: payload.from_email || payload.from?.address || "",
      from_name:  payload.from_name  || payload.from?.name    || payload.from_email || "",
      to_email:   payload.to_email   || payload.to?.[0]?.address || undefined,
      subject:    payload.subject    || "(no subject)",
      body_text:  payload.body_text  || payload.text || stripHtml(payload.body_html || payload.html || ""),
      body_html:  payload.body_html  || payload.html || undefined,
      channel:    "email",
      external_id: payload.message_id || payload.external_id || null,
      received_at: payload.received_at ? new Date(payload.received_at) : new Date(),
    };
  }

  // WEB FORM — from a future contact form
  if (payload.source === "web_form") {
    return {
      from_email: payload.email || "anon@webform.local",
      from_name: payload.name || "Web visitor",
      subject: payload.subject || `Web form inquiry from ${payload.name || "visitor"}`,
      body_text: payload.message || "(no message)",
      channel: "web_form",
      received_at: new Date(),
    };
  }

  return { error: "Unknown source. Set source to 'email', 'voicemail', 'fareharbor', or 'web_form'." };
}

function stripHtml(html: string): string {
  return html.replace(/<style[\s\S]*?<\/style>/gi, "")
             .replace(/<script[\s\S]*?<\/script>/gi, "")
             .replace(/<[^>]+>/g, " ")
             .replace(/\s+/g, " ")
             .trim();
}

// ────────────────────────────────────────────────────────────────
//  POST /api/mdt/ingest
// ────────────────────────────────────────────────────────────────
export async function POST(req: NextRequest) {
  // Auth: shared secret
  if (!verifySecret(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let payload: any;
  try {
    payload = await req.json();
  } catch (e) {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  // Normalize from any source
  const norm = normalize(payload);
  if ("error" in norm) {
    return NextResponse.json({ error: norm.error }, { status: 400 });
  }

  const client = sb();

  // ─────────────────────────────────────────────────────────────
  // Step 1: Find or create contact
  // ─────────────────────────────────────────────────────────────
  let contactId: string | null = null;
  let contactBookingCount = 0;
  let contactCreatedAt: Date | undefined;

  if (norm.from_email) {
    const { data: existing } = await client
      .from("ld_contacts")
      .select("id, booking_count, created_at")
      .eq("org_id", MDT_ORG_ID)
      .eq("email", norm.from_email)
      .maybeSingle();

    if (existing) {
      contactId = existing.id;
      contactBookingCount = existing.booking_count || 0;
      contactCreatedAt = new Date(existing.created_at);
    } else {
      const { data: created, error: createErr } = await client
        .from("ld_contacts")
        .insert({
          org_id: MDT_ORG_ID,
          email: norm.from_email,
          full_name: norm.from_name,
        })
        .select("id, created_at")
        .single();
      if (!createErr && created) {
        contactId = created.id;
        contactCreatedAt = new Date(created.created_at);
      } else if (createErr) {
        console.warn("[ingest] contact create failed:", createErr.message);
      }
    }
  }

  // ─────────────────────────────────────────────────────────────
  // Step 2: AI classification
  // ─────────────────────────────────────────────────────────────
  let classification;
  try {
    classification = await classify({
      fromEmail: norm.from_email,
      fromName: norm.from_name,
      subject: norm.subject,
      bodyText: norm.body_text,
      channel: norm.channel,
      receivedAt: norm.received_at,
    });
  } catch (e: any) {
    console.error("[ingest] classification failed:", e?.message);
    // Fall through with safe defaults so we don't drop the message
    classification = {
      category: "other" as const,
      intent: "other" as const,
      urgency: "normal" as const,
      subject_summary: norm.subject,
      extracted: { word_count: norm.body_text.split(/\s+/).filter(Boolean).length },
      classification_notes: "Classification engine error — manual triage needed.",
    };
  }

  // ─────────────────────────────────────────────────────────────
  // Step 3: Look up category to get baseline value + default mailbox
  // ─────────────────────────────────────────────────────────────
  const { data: catRow } = await client
    .from("ld_categories")
    .select("baseline_value_score, default_mailbox_id")
    .eq("org_id", MDT_ORG_ID)
    .eq("slug", classification.category)
    .single();

  const baselineValue = catRow?.baseline_value_score ?? 50;
  const outboundMailboxId = catRow?.default_mailbox_id ?? null;

  // ─────────────────────────────────────────────────────────────
  // Step 4: Compute Tide Score
  // ─────────────────────────────────────────────────────────────
  const tide = computeTideScore({
    category: classification.category,
    baselineValueScore: baselineValue,
    intent: classification.intent,
    urgency: classification.urgency,
    extracted: classification.extracted,
    receivedAt: norm.received_at,
    contactCreatedAt,
    contactBookingCount,
  });

  // ─────────────────────────────────────────────────────────────
  // Step 5: Create the ticket
  // ─────────────────────────────────────────────────────────────
  const { data: ticket, error: ticketErr } = await client
    .from("ld_tickets")
    .insert({
      org_id: MDT_ORG_ID,
      contact_id: contactId,
      subject: norm.subject || classification.subject_summary,
      source: norm.channel,
      source_ref: norm.external_id || null,
      category: classification.category,
      intent: classification.intent,
      urgency: classification.urgency,
      extracted: classification.extracted,
      tide_heat: tide.heat,
      tide_value: tide.value,
      tide_risk: tide.risk,
      tide_score: tide.composite,
      status: classification.intent === "spam" ? "spam" : "new",
      outbound_mailbox_id: outboundMailboxId,
    })
    .select("id, ticket_number, status, tide_score")
    .single();

  if (ticketErr || !ticket) {
    console.error("[ingest] ticket insert failed:", ticketErr?.message);
    return NextResponse.json({ error: ticketErr?.message || "Ticket creation failed" }, { status: 500 });
  }

  // ─────────────────────────────────────────────────────────────
  // Step 6: Insert the inbound message
  // ─────────────────────────────────────────────────────────────
  const { error: msgErr } = await client.from("ld_messages").insert({
    ticket_id: ticket.id,
    org_id: MDT_ORG_ID,
    direction: "inbound",
    from_email: norm.from_email,
    from_name: norm.from_name,
    to_email: norm.to_email,
    subject: norm.subject,
    body_text: norm.body_text,
    body_html: norm.body_html,
    channel: norm.channel,
    external_id: norm.external_id,
    voicemail_url: norm.voicemail_url,
    voicemail_duration_seconds: norm.voicemail_duration_seconds,
    voicemail_transcript: norm.voicemail_transcript,
  });

  if (msgErr) {
    console.warn("[ingest] message insert failed:", msgErr.message);
  }

  // ─────────────────────────────────────────────────────────────
  // Step 7: Audit log
  // ─────────────────────────────────────────────────────────────
  await client.from("ld_audit_log").insert({
    org_id: MDT_ORG_ID,
    ticket_id: ticket.id,
    actor_type: "system",
    action: "ticket.ingested",
    details: {
      source: norm.channel,
      classification,
      tide_reasons: tide.reasons,
    },
  });

  return NextResponse.json({
    ok: true,
    ticket: {
      id: ticket.id,
      ticket_number: ticket.ticket_number,
      status: ticket.status,
      category: classification.category,
      intent: classification.intent,
      tide_score: tide.composite,
    },
  });
}

// Helpful for manual smoke-testing
export async function GET(req: NextRequest) {
  return NextResponse.json({
    ok: true,
    note: "POST a JSON payload to this endpoint. See /api/mdt/ingest source for accepted shapes.",
    sources: ["email", "voicemail", "fareharbor", "web_form"],
  });
}
