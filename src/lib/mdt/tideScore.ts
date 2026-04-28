// src/lib/mdt/tideScore.ts
// ════════════════════════════════════════════════════════════════
//  TIDE SCORE™ — Lead prioritization engine for MDT / LaserDesk
// ════════════════════════════════════════════════════════════════
//  Every inbound ticket gets three sub-scores 0-100:
//    HEAT  — likelihood to book (urgency, specificity, intent signals)
//    VALUE — estimated revenue size (party size × category baseline)
//    RISK  — chance of going cold without action (delay × vagueness)
//
//  Composite score sorts the kanban so the right ticket bubbles up.
//
//  Why this matters: FareHarbor's inbox is chronological. You answer
//  the loudest, not the most valuable. Tide Score flips that.
// ════════════════════════════════════════════════════════════════

export type Extracted = {
  party_size?: number;
  requested_date?: string;       // YYYY-MM-DD
  requested_time?: string;       // HH:MM
  budget_hint?: string;
  special_requests?: string;
  has_kids?: boolean;
  ages_mentioned?: number[];
  competitor_mentioned?: boolean;
  has_specific_date?: boolean;
  has_payment_question?: boolean;
  has_explicit_cta?: boolean;    // "how do I book?", "send me a quote", "what's the price"
  is_repeat_sender?: boolean;
  word_count?: number;
};

export type ScoreInputs = {
  category: string;              // 'sea_life_cruise' | 'wedding' | etc.
  baselineValueScore: number;    // from ld_categories.baseline_value_score (0-100)
  intent: string;                // 'new_booking' | 'question' | etc.
  urgency: string;               // 'high' | 'normal' | 'low'
  extracted: Extracted;
  // Time signals
  receivedAt: Date;              // when message arrived
  contactCreatedAt?: Date;       // when contact first reached out (for repeat detection)
  contactBookingCount?: number;  // 0 = never booked, 1+ = repeat customer
};

export type TideScore = {
  heat: number;                  // 0-100
  value: number;                 // 0-100
  risk: number;                  // 0-100
  composite: number;             // weighted: 40% heat + 35% value + 25% risk
  reasons: string[];             // human-readable explanation, useful for UI tooltip
};

// ────────────────────────────────────────────────────────────────
//  HEAT — how likely is this person to book?
// ────────────────────────────────────────────────────────────────
//  Signals that increase heat:
//    • Specific date mentioned → they're planning, not browsing
//    • Specific party size → they've thought it through
//    • Direct payment question ("how do I pay?", "do you take credit card?")
//    • Explicit CTA ("send me a quote", "book me", "reserve")
//    • Repeat sender (they came back)
//    • Existing customer (already booked once)
//    • Intent = 'new_booking' (vs. 'question')
//  Signals that decrease heat:
//    • Vague language, very short message
//    • Mentions of competitors ("we're also looking at...")
//    • Intent = 'spam' or 'thank_you' (no action needed)
// ────────────────────────────────────────────────────────────────
function computeHeat(i: ScoreInputs, reasons: string[]): number {
  let score = 30; // baseline

  if (i.intent === "new_booking") { score += 25; reasons.push("Wants to book (+25)"); }
  if (i.intent === "modify_booking") { score += 15; reasons.push("Existing booking (+15)"); }
  if (i.intent === "spam") { return 0; }
  if (i.intent === "thank_you") { score = Math.max(score - 20, 5); reasons.push("Thank-you note (-20)"); }

  if (i.extracted.has_specific_date) { score += 15; reasons.push("Has specific date (+15)"); }
  if (i.extracted.party_size && i.extracted.party_size > 0) { score += 8; reasons.push(`Party of ${i.extracted.party_size} (+8)`); }
  if (i.extracted.has_payment_question) { score += 12; reasons.push("Asking about payment (+12)"); }
  if (i.extracted.has_explicit_cta) { score += 10; reasons.push("Direct booking ask (+10)"); }

  if (i.extracted.competitor_mentioned) { score -= 8; reasons.push("Mentions competitors (-8)"); }
  if (i.extracted.word_count && i.extracted.word_count < 15) { score -= 5; reasons.push("Very short message (-5)"); }

  if (i.contactBookingCount && i.contactBookingCount > 0) { score += 15; reasons.push("Repeat customer (+15)"); }
  if (i.extracted.is_repeat_sender) { score += 10; reasons.push("Following up (+10)"); }

  if (i.urgency === "high") { score += 8; }

  return Math.max(0, Math.min(100, score));
}

// ────────────────────────────────────────────────────────────────
//  VALUE — estimated revenue size
// ────────────────────────────────────────────────────────────────
//  Built from category baseline × party-size multiplier.
//  E.g. school group baseline 80 + 30-kid party = high value
//       single sea life cruise baseline 30 + 2-person = low value
//       wedding baseline 95 (always high)
// ────────────────────────────────────────────────────────────────
function computeValue(i: ScoreInputs, reasons: string[]): number {
  let score = i.baselineValueScore;
  reasons.push(`${i.category} baseline (${score})`);

  const partySize = i.extracted.party_size || 0;

  // Party-size multiplier — bigger parties scale value (capped)
  if (partySize >= 30) { score += 15; reasons.push(`Large group ${partySize}+ (+15)`); }
  else if (partySize >= 15) { score += 10; reasons.push(`Mid group ${partySize} (+10)`); }
  else if (partySize >= 8) { score += 5; reasons.push(`Small group ${partySize} (+5)`); }

  // Budget hints — if they mention a real number, that's strong signal
  if (i.extracted.budget_hint && /[\$\d]/.test(i.extracted.budget_hint)) {
    score += 5; reasons.push("Mentions budget (+5)");
  }

  // Existing customer with booking history is more valuable
  if (i.contactBookingCount && i.contactBookingCount >= 2) {
    score += 8; reasons.push("Loyal repeat customer (+8)");
  }

  return Math.max(0, Math.min(100, score));
}

// ────────────────────────────────────────────────────────────────
//  RISK — chance of going cold without action
// ────────────────────────────────────────────────────────────────
//  High-risk tickets need fast response or they evaporate.
//  Signals:
//    • Tight requested date (booking THIS weekend) → must reply fast
//    • Long delay since received (already sat for hours)
//    • Vague — needs clarification before they'll commit
//    • High urgency from sender's tone
//    • Competitor mentioned — they're shopping, time-sensitive
// ────────────────────────────────────────────────────────────────
function computeRisk(i: ScoreInputs, reasons: string[]): number {
  let score = 20;

  // How tight is their requested date?
  if (i.extracted.requested_date) {
    const reqDate = new Date(i.extracted.requested_date + "T12:00:00");
    const daysOut = Math.round((reqDate.getTime() - i.receivedAt.getTime()) / 86400000);
    if (daysOut <= 3 && daysOut >= 0) { score += 35; reasons.push(`Requested in ${daysOut} day(s) — urgent (+35)`); }
    else if (daysOut <= 7) { score += 20; reasons.push("Within a week (+20)"); }
    else if (daysOut <= 30) { score += 8; reasons.push("This month (+8)"); }
  }

  // How long has it been sitting?
  const hoursOld = (Date.now() - i.receivedAt.getTime()) / 3600000;
  if (hoursOld > 24) { score += 25; reasons.push(`Aged ${Math.round(hoursOld)}h (+25)`); }
  else if (hoursOld > 8) { score += 15; reasons.push(`Aged ${Math.round(hoursOld)}h (+15)`); }
  else if (hoursOld > 2) { score += 5; reasons.push(`Aged ${Math.round(hoursOld)}h (+5)`); }

  if (i.extracted.competitor_mentioned) { score += 15; reasons.push("Comparing competitors (+15)"); }
  if (i.urgency === "high") { score += 10; }

  // Vague messages risk going cold because they need a clarifying reply
  if (i.extracted.word_count && i.extracted.word_count < 10) { score += 8; reasons.push("Vague — needs clarifying reply (+8)"); }

  return Math.max(0, Math.min(100, score));
}

// ────────────────────────────────────────────────────────────────
//  COMPOSITE — weighted final score
// ────────────────────────────────────────────────────────────────
export function computeTideScore(inputs: ScoreInputs): TideScore {
  const reasons: string[] = [];

  const heat  = computeHeat(inputs, reasons);
  const value = computeValue(inputs, reasons);
  const risk  = computeRisk(inputs, reasons);

  // Weighted composite — heat matters most, then value, risk modulates
  const composite = Math.round(heat * 0.40 + value * 0.35 + risk * 0.25);

  return {
    heat,
    value,
    risk,
    composite: Math.max(0, Math.min(100, composite)),
    reasons,
  };
}

// ────────────────────────────────────────────────────────────────
//  Helper — bucket for UI labels
// ────────────────────────────────────────────────────────────────
export function tideScoreLabel(composite: number): { label: string; color: string } {
  if (composite >= 80) return { label: "🔥 Hot", color: "#dc2626" };
  if (composite >= 65) return { label: "↑ Strong", color: "#ea580c" };
  if (composite >= 50) return { label: "→ Steady", color: "#0891b2" };
  if (composite >= 35) return { label: "↓ Cool", color: "#64748b" };
  return { label: "○ Cold", color: "#94a3b8" };
}
