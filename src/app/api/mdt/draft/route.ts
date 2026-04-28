// src/app/api/mdt/draft/route.ts
// ════════════════════════════════════════════════════════════════
//  AI REPLY DRAFTER
//  POST /api/mdt/draft  { ticketId }
//  Reads the full ticket thread + extracted entities, drafts a
//  reply in Captain/Groups voice. Stores in ld_drafts pending review.
// ════════════════════════════════════════════════════════════════

export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import Anthropic from "@anthropic-ai/sdk";

const sb = () => createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);
const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY! });

// ────────────────────────────────────────────────────────────────
//  Voice / persona prompt — embeds MDT business policies + voice.
//  This is the heart of the "speaks like a real human" experience.
// ────────────────────────────────────────────────────────────────
const VOICE_PROMPT = `You are drafting an email reply on behalf of Marine Discovery Tours (MDT) in Newport, Oregon. The reply will be reviewed by an operator before sending — your job is to give them an excellent first draft.

═══ VOICE ═══
- Warm, conversational, never corporate
- Confident — you know the tours and the bay
- Concise — 3-5 short paragraphs MAX. Aim for < 150 words unless the customer asked something complex
- Use plain language. No jargon, no marketing-speak ("delight", "synergy", "leverage" are banned)
- Sign off as "Captain" or "Marine Discovery Tours" depending on which mailbox
- NEVER include a phone number — always direct people to email or online booking

═══ BUSINESS FACTS (use these in replies, never invent prices/dates) ═══
- Vessel: 65-foot DISCOVERY, 49 passenger capacity
- Location: 345 SW Bay Blvd, Newport OR 97365 (Historic Bayfront)
- Sea Life Cruise prices: Adults $50, Children 3-12 $35, Infants 0-2 FREE
- Sea Life Cruise: 2-hour narrated tour, daily Mar-Oct, online booking at https://fareharbor.com/embeds/book/marinediscoverytours/?full-items=yes
- Private Charters: from $599
- School Field Trips: curriculum-aligned, 7000+ students/year. Year-round.
- Ashes at Sea: Private memorial charters, year-round
- Wheelchair accessible (vessel has ramp)
- Heated cabin with seating for all guests
- Complimentary coffee and tea aboard

═══ REPLY GUIDELINES BY CATEGORY ═══

[sea_life_cruise] — General public tickets
- Direct them to book online: https://fareharbor.com/embeds/book/marinediscoverytours/?full-items=yes
- Mention prices only if they ask
- Keep it punchy — they want to book, not read

[private_group / wedding] — Custom charters
- Acknowledge their party size and timing if mentioned
- Note that private charters start at $599 and can be customized
- Ask 2-3 clarifying questions to scope the trip (date, party size, special requests)
- Promise a follow-up with quote within 24 hours

[school_group] — Educational
- Warm and enthusiastic — these are passionate teachers
- Mention the curriculum-aligned programs and 7000+ students/year
- Ask: school name, grade level, target date, party size
- Mention bus parking nearby and 49 capacity
- Promise a teacher-friendly proposal within 24 hours

[sport_fishing] — Charters
- Ask: target species, party size, requested date, experience level
- Note that rates depend on trip length and target
- Promise a quote with available dates within 24 hours

[ashes_at_sea] — Memorial
- TONE IS CRITICAL: warm, gentle, dignified, never sales-y
- Acknowledge their loss simply ("I'm so sorry for your loss")
- Briefly note we handle these with care, year-round
- Ask only what's truly needed: preferred timing window, party size
- Promise to call/email back personally within the day
- Do NOT mention pricing in the first reply unless they directly asked

[other / unclear] — Don't guess
- Politely ask for clarification
- Suggest the most likely tour types

═══ THINGS TO NEVER DO ═══
- Never make up prices, dates, or capacity numbers
- Never include a phone number (we operate digital-first)
- Never apologize excessively — one acknowledgment is enough
- Never close with "let me know if you have questions" — be more specific
- Never use exclamation points more than once per reply
- Never start with "Thank you for reaching out" — too generic. Start with something specific to their message.

═══ OUTPUT FORMAT ═══
Respond with valid JSON only. No markdown, no prose.

{
  "subject": "Re: original subject (or your fresh subject if missing)",
  "body_text": "Plain-text reply body. Use \\n\\n for paragraphs.",
  "confidence_score": 0-100 integer (how confident are you the customer will accept this draft as-is?),
  "generation_notes": "1-2 sentences explaining your reasoning"
}`;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const ticketId = body.ticketId;
    if (!ticketId) {
      return NextResponse.json({ error: "ticketId required" }, { status: 400 });
    }

    const client = sb();

    // Fetch ticket + thread
    const { data: ticket, error: tErr } = await client
      .from("ld_tickets")
      .select("*, ld_contacts(full_name, email, booking_count)")
      .eq("id", ticketId)
      .single();
    if (tErr || !ticket) {
      return NextResponse.json({ error: "Ticket not found" }, { status: 404 });
    }

    const { data: messages } = await client
      .from("ld_messages")
      .select("direction, from_name, body_text, created_at")
      .eq("ticket_id", ticketId)
      .order("created_at", { ascending: true });

    // Build a thread summary for context
    const thread = (messages || [])
      .map((m: any) => `[${m.direction.toUpperCase()} from ${m.from_name || "?"}]\n${m.body_text}`)
      .join("\n\n---\n\n");

    // Get the outbound mailbox info (Captain vs Groups)
    let mailboxInfo = "";
    if (ticket.outbound_mailbox_id) {
      const { data: mb } = await client
        .from("ld_mailboxes")
        .select("email, display_name")
        .eq("id", ticket.outbound_mailbox_id)
        .single();
      if (mb) mailboxInfo = `\n\nThis reply will be sent FROM: ${mb.display_name} <${mb.email}>`;
    }

    const userPrompt = [
      `═══ TICKET CONTEXT ═══`,
      `Ticket: ${ticket.ticket_number}`,
      `Category: ${ticket.category}`,
      `Intent: ${ticket.intent}`,
      `Urgency: ${ticket.urgency}`,
      `Customer: ${(ticket as any).ld_contacts?.full_name || "(unknown)"} <${(ticket as any).ld_contacts?.email || "?"}>`,
      `Repeat customer: ${((ticket as any).ld_contacts?.booking_count || 0) > 0 ? "YES" : "no"}`,
      `Tide Score: ${ticket.tide_score} (Heat ${ticket.tide_heat} / Value ${ticket.tide_value} / Risk ${ticket.tide_risk})`,
      `Extracted: ${JSON.stringify(ticket.extracted)}`,
      mailboxInfo,
      ``,
      `═══ FULL THREAD ═══`,
      thread || "(no messages yet)",
      ``,
      `═══ TASK ═══`,
      `Draft a reply to the most recent INBOUND message. Respond with valid JSON only.`,
    ].join("\n");

    const response = await anthropic.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 1024,
      system: VOICE_PROMPT,
      messages: [{ role: "user", content: userPrompt }],
    });

    const text = response.content
      .map((b: any) => (b.type === "text" ? b.text : ""))
      .join("")
      .trim()
      .replace(/^```(?:json)?\s*/i, "")
      .replace(/\s*```$/i, "")
      .trim();

    let parsed: { subject: string; body_text: string; confidence_score: number; generation_notes: string };
    try {
      parsed = JSON.parse(text);
    } catch (e) {
      console.error("[draft] JSON parse failed. Raw:", text);
      return NextResponse.json({ error: "Draft generation failed (invalid JSON)" }, { status: 500 });
    }

    // Save draft
    const { data: draft, error: dErr } = await client
      .from("ld_drafts")
      .insert({
        ticket_id: ticketId,
        org_id: ticket.org_id,
        subject: parsed.subject,
        body_text: parsed.body_text,
        proposed_from_mailbox_id: ticket.outbound_mailbox_id,
        generated_by: "claude",
        generation_notes: parsed.generation_notes,
        confidence_score: parsed.confidence_score,
        status: "pending",
      })
      .select()
      .single();

    if (dErr) {
      return NextResponse.json({ error: dErr.message }, { status: 500 });
    }

    await client.from("ld_audit_log").insert({
      org_id: ticket.org_id,
      ticket_id: ticketId,
      actor_type: "ai",
      action: "draft.generated",
      details: { confidence_score: parsed.confidence_score, generation_notes: parsed.generation_notes },
    });

    return NextResponse.json({ ok: true, draft });
  } catch (e: any) {
    console.error("[draft]", e?.message);
    return NextResponse.json({ error: e?.message || "Server error" }, { status: 500 });
  }
}
