// src/app/api/mdt/tickets/route.ts
export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const sb = () => createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const MDT_ORG_ID = "a1d2c3e4-0001-4000-8000-000000000001";

const NO_CACHE = { headers: { "Cache-Control": "no-store, no-cache, must-revalidate" } };

// GET /api/mdt/tickets
// Returns all open tickets (status not in closed/completed/spam) with contact joined
// TODO: when we add operator login, add auth check here. For now this page is a private utility.
export async function GET(req: NextRequest) {
  const client = sb();
  const { data, error } = await client
    .from("ld_tickets")
    .select("id, ticket_number, subject, category, intent, urgency, status, source, tide_score, tide_heat, tide_value, tide_risk, extracted, created_at, updated_at, ld_contacts(id, full_name, email, phone, booking_count)")
    .eq("org_id", MDT_ORG_ID)
    .not("status", "in", "(closed,completed,spam)")
    .order("tide_score", { ascending: false })
    .order("created_at", { ascending: false })
    .limit(200);

  if (error) {
    console.warn("[tickets GET]", error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ tickets: data || [] }, NO_CACHE);
}
