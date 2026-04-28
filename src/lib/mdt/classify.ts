// src/lib/mdt/classify.ts
// ════════════════════════════════════════════════════════════════
//  AI CLASSIFICATION — reads an inbound message, returns
//  { category, intent, urgency, extracted entities }
//  Used by /api/mdt/ingest before creating a ticket.
// ════════════════════════════════════════════════════════════════

import Anthropic from "@anthropic-ai/sdk";

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
});

export type ClassificationResult = {
  category: "sea_life_cruise" | "private_group" | "school_group" | "sport_fishing" | "wedding" | "ashes_at_sea" | "other";
  intent: "new_booking" | "modify_booking" | "question" | "cancellation" | "complaint" | "thank_you" | "spam" | "other";
  urgency: "high" | "normal" | "low";
  subject_summary: string;       // short subject for the ticket if original is missing
  extracted: {
    party_size?: number;
    requested_date?: string;     // YYYY-MM-DD
    requested_time?: string;     // HH:MM (24h)
    budget_hint?: string;
    special_requests?: string;
    has_kids?: boolean;
    ages_mentioned?: number[];
    competitor_mentioned?: boolean;
    has_specific_date?: boolean;
    has_payment_question?: boolean;
    has_explicit_cta?: boolean;
    word_count?: number;
  };
  classification_notes: string;  // 1-2 sentence reasoning
};

// ────────────────────────────────────────────────────────────────
//  System prompt — embeds MDT business knowledge so Claude
//  classifies accurately. Update this when categories change.
// ────────────────────────────────────────────────────────────────
const SYSTEM_PROMPT = `You are a classification engine for Marine Discovery Tours (MDT), a Newport, Oregon-based marine tour operator. Your job is to read an inbound customer message (from email, voicemail transcript, or web form) and extract structured data.

═══ MDT BUSINESS CONTEXT ═══
- Vessel: 65-foot DISCOVERY, capacity 49 passengers
- Location: Newport, Oregon bayfront
- Season: Sea Life Cruises Mar-Oct daily; private charters year-round
- Tour types and price hints:
  • Sea Life Cruise (public 2-hr): Adults $50, Children $35, Infants free
  • Private Group Tour: Charters from $599
  • School Field Trip: Pre-K through 12, curriculum-aligned
  • Sport Fishing: Charter rates vary
  • Wedding: Premium ceremony/reception charters
  • Ashes at Sea: Private memorial scattering, year-round, sensitive

═══ CLASSIFICATION RULES ═══

CATEGORY (pick exactly one):
- "sea_life_cruise"  — public 2-hour bay tour, individuals/small families, "tickets", "cruise tomorrow", general whale-watching inquiries
- "private_group"    — corporate groups, family reunions, birthday parties, custom charters NOT in other categories
- "school_group"     — schools, teachers, principals, field trips, "students", "class trip", grade levels mentioned
- "sport_fishing"    — fishing charters, "fishing trip", "tuna", "salmon", "halibut", rod/reel mentions
- "wedding"          — weddings, ceremonies, receptions, marriage vows, "we're getting married"
- "ashes_at_sea"     — memorial, ash scattering, "we lost...", "scatter ashes", funeral, deceased
- "other"            — when category truly cannot be determined or is unrelated

INTENT (pick exactly one):
- "new_booking"      — wants to book / inquire about availability for a new tour
- "modify_booking"   — has existing booking, wants to change date/party size/etc.
- "question"         — just asking about something (hours, what to wear, parking, etc.)
- "cancellation"     — wants to cancel
- "complaint"        — unhappy about something
- "thank_you"        — post-tour thanks, no action needed
- "spam"             — sales pitch, irrelevant marketing, clear spam
- "other"            — doesn't fit above

URGENCY:
- "high"   — wants tour within next 7 days, OR explicitly says "ASAP", "urgent", "today"
- "normal" — typical inquiry, planning weeks ahead
- "low"    — far-future planning, vague timeline, casual question

EXTRACTED ENTITIES (omit any field if not present in message):
- party_size: integer count of people. "Family of 4" = 4. "30 students" = 30. "My wife and I" = 2.
- requested_date: YYYY-MM-DD format. Convert "this Saturday" or "June 15th 2026" to actual date if year inferable; otherwise omit. Today's date is provided in the user message.
- requested_time: HH:MM in 24-hour. "10am" = "10:00". Omit if not specified.
- budget_hint: free-text snippet if they mention budget ("around $1000", "budget about $500/person")
- special_requests: any special needs (wheelchair, dietary, accessibility, surprise birthday)
- has_kids: true if children/kids/students/grandkids mentioned
- ages_mentioned: array of integers if specific ages stated. "8 and 12 year olds" = [8, 12]
- competitor_mentioned: true if they mention any other Newport tour operator, FareHarbor, Yelp shopping, "we're also looking at..."
- has_specific_date: true if a specific date or short window is mentioned
- has_payment_question: true if they ask about payment, deposit, refund policy, methods
- has_explicit_cta: true if they directly request action: "send me a quote", "book me", "what's your availability", "reserve us"
- word_count: count of words in the message body

═══ OUTPUT FORMAT ═══
You MUST respond with VALID JSON only. No prose, no markdown fences, no commentary. Just the JSON object.

Schema:
{
  "category": "...",
  "intent": "...",
  "urgency": "...",
  "subject_summary": "Short subject line if original is missing (max 60 chars)",
  "extracted": { ... },
  "classification_notes": "1-2 sentence reasoning"
}

═══ EDGE CASES ═══
- For ashes_at_sea inquiries, set urgency="high" by default — these are emotionally sensitive and deserve fast care.
- If a message mentions BOTH wedding AND tour, classify as "wedding".
- If a message has no clear category but mentions Newport/Oregon coast/ocean, default to "sea_life_cruise" with low urgency.
- If a message is clearly automated/marketing (mentions SEO, "boost your business", crypto, etc.), category="other", intent="spam".
`;

// ────────────────────────────────────────────────────────────────
//  classify(): main entry point
// ────────────────────────────────────────────────────────────────
export async function classify(args: {
  fromEmail?: string;
  fromName?: string;
  subject?: string;
  bodyText: string;
  channel?: "email" | "voicemail" | "web_form" | "fareharbor";
  receivedAt?: Date;
}): Promise<ClassificationResult> {
  const {
    fromEmail = "(unknown)",
    fromName = "(unknown)",
    subject = "(no subject)",
    bodyText,
    channel = "email",
    receivedAt = new Date(),
  } = args;

  const userPrompt = [
    `═══ INBOUND MESSAGE ═══`,
    `Channel: ${channel}`,
    `Received: ${receivedAt.toISOString()}  (today's date is ${receivedAt.toISOString().split("T")[0]})`,
    `From: ${fromName} <${fromEmail}>`,
    `Subject: ${subject}`,
    ``,
    `Body:`,
    bodyText,
    ``,
    `═══ TASK ═══`,
    `Classify this message. Respond with valid JSON only, no prose.`,
  ].join("\n");

  const response = await anthropic.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 1024,
    system: SYSTEM_PROMPT,
    messages: [{ role: "user", content: userPrompt }],
  });

  // Extract text from response
  const text = response.content
    .map((block: any) => (block.type === "text" ? block.text : ""))
    .join("")
    .trim();

  // Strip markdown fences if Claude added them
  const cleaned = text.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/i, "").trim();

  let parsed: ClassificationResult;
  try {
    parsed = JSON.parse(cleaned);
  } catch (e) {
    console.error("[classify] JSON parse failed:", e, "Raw text:", text);
    // Safe fallback: dump it in 'other' so a human can triage
    return {
      category: "other",
      intent: "other",
      urgency: "normal",
      subject_summary: subject || "Unclassified inquiry",
      extracted: { word_count: bodyText.split(/\s+/).filter(Boolean).length },
      classification_notes: "AI classification failed — manual triage required.",
    };
  }

  // Defensive defaults
  parsed.category = parsed.category || "other";
  parsed.intent = parsed.intent || "other";
  parsed.urgency = parsed.urgency || "normal";
  parsed.extracted = parsed.extracted || {};
  parsed.subject_summary = parsed.subject_summary || subject || "Inquiry";
  if (!parsed.extracted.word_count) {
    parsed.extracted.word_count = bodyText.split(/\s+/).filter(Boolean).length;
  }

  return parsed;
}
