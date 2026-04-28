// src/app/api/mdt/tickets/[id]/route.ts
export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const sb = () => createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const NO_CACHE = { headers: { "Cache-Control": "no-store, no-cache, must-revalidate" } };

// GET /api/mdt/tickets/:id  →  ticket + thread + drafts
// Next.js 15+: params is async (a Promise). Must `await` it.
export async function GET(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  const client = sb();
  const { data: ticket, error } = await client
    .from("ld_tickets")
    .select("*, ld_contacts(id, full_name, email, phone, booking_count, party_type, tags)")
    .eq("id", id)
    .single();

  if (error || !ticket) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const { data: messages } = await client
    .from("ld_messages")
    .select("id, direction, from_email, from_name, to_email, subject, body_text, channel, voicemail_url, voicemail_transcript, voicemail_duration_seconds, delivery_status, delivered_at, created_at")
    .eq("ticket_id", id)
    .order("created_at", { ascending: true });

  const { data: drafts } = await client
    .from("ld_drafts")
    .select("id, subject, body_text, confidence_score, generation_notes, status, created_at")
    .eq("ticket_id", id)
    .order("created_at", { ascending: false });

  return NextResponse.json({ ticket, messages: messages || [], drafts: drafts || [] }, NO_CACHE);
}

// PATCH /api/mdt/tickets/:id  →  update status, assignment, etc.
export async function PATCH(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  const body = await req.json();
  const allowedKeys = ["status", "assigned_to", "category", "intent", "urgency", "outbound_mailbox_id"];
  const updates: any = {};
  for (const k of allowedKeys) {
    if (k in body) updates[k] = body[k];
  }

  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ error: "No valid fields to update" }, { status: 400 });
  }

  if (updates.status) {
    const valid = ["new", "awaiting_reply", "quoted", "booked", "completed", "closed", "spam"];
    if (!valid.includes(updates.status)) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 });
    }
    if (updates.status === "completed" || updates.status === "closed") {
      updates.resolved_at = new Date().toISOString();
    }
  }

  updates.updated_at = new Date().toISOString();

  const client = sb();
  const { data: ticket, error } = await client
    .from("ld_tickets")
    .update(updates)
    .eq("id", id)
    .select("*, ld_contacts(id, full_name, email, phone, booking_count)")
    .single();

  if (error) {
    console.warn("[ticket PATCH]", error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  await client.from("ld_audit_log").insert({
    org_id: ticket.org_id,
    ticket_id: id,
    actor_type: "user",
    action: "ticket.updated",
    details: updates,
  });

  return NextResponse.json({ ticket });
}
