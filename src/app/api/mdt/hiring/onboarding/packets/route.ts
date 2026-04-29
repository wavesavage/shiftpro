// src/app/api/mdt/hiring/onboarding/packets/route.ts
export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const sb = () => createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const MDT_ORG_ID = "a1d2c3e4-0001-4000-8000-000000000001";

// GET → list packets
export async function GET() {
  const client = sb();
  const { data, error } = await client
    .from("ld_onboarding_packets")
    .select("*")
    .eq("org_id", MDT_ORG_ID)
    .order("name", { ascending: true });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ packets: data || [] });
}

// POST → create
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, description, position_slug, template_ids, welcome_subject, welcome_body } = body;
    if (!name?.trim()) return NextResponse.json({ error: "name required" }, { status: 400 });

    const client = sb();
    const { data, error } = await client
      .from("ld_onboarding_packets")
      .insert({
        org_id: MDT_ORG_ID,
        name: name.trim(),
        description: description?.trim() || null,
        position_slug: position_slug || null,
        template_ids: Array.isArray(template_ids) ? template_ids : [],
        welcome_subject: welcome_subject?.trim() || null,
        welcome_body: welcome_body?.trim() || null,
      })
      .select()
      .single();
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ ok: true, packet: data });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "Server error" }, { status: 500 });
  }
}

// PATCH ?id=... → update
export async function PATCH(req: NextRequest) {
  const id = req.nextUrl.searchParams.get("id");
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });
  const body = await req.json();
  const allowedKeys = ["name", "description", "position_slug", "template_ids", "welcome_subject", "welcome_body", "active"];
  const updates: any = {};
  for (const k of allowedKeys) if (k in body) updates[k] = body[k];
  if (Object.keys(updates).length === 0) return NextResponse.json({ error: "No fields" }, { status: 400 });
  updates.updated_at = new Date().toISOString();

  const client = sb();
  const { data, error } = await client
    .from("ld_onboarding_packets")
    .update(updates).eq("id", id).eq("org_id", MDT_ORG_ID)
    .select().single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true, packet: data });
}

// DELETE ?id=...
export async function DELETE(req: NextRequest) {
  const id = req.nextUrl.searchParams.get("id");
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });
  const client = sb();
  const { error } = await client
    .from("ld_onboarding_packets")
    .delete().eq("id", id).eq("org_id", MDT_ORG_ID);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
