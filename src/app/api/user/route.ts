export const dynamic = "force-dynamic";

import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";

const sb = () => createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function PATCH(req: NextRequest) {
  try {
    const { userId, updates } = await req.json();
    if (!userId) return NextResponse.json({ error: "userId required" }, { status: 400 });

    const client = sb();

    const allowed: Record<string, any> = {};
    if (updates.first_name         !== undefined) allowed.first_name         = String(updates.first_name).trim();
    if (updates.last_name          !== undefined) allowed.last_name          = String(updates.last_name).trim();
    if (updates.preferred_name     !== undefined) allowed.preferred_name     = String(updates.preferred_name).trim();
    if (updates.role               !== undefined) allowed.role               = String(updates.role).trim();
    if (updates.department         !== undefined) allowed.department         = updates.department ?? "";
    if (updates.hourly_rate        !== undefined) allowed.hourly_rate        = parseFloat(updates.hourly_rate) || 15;
    if (updates.avatar_initials    !== undefined) allowed.avatar_initials    = String(updates.avatar_initials);
    if (updates.avatar_color       !== undefined) allowed.avatar_color       = String(updates.avatar_color);
    if (updates.status             !== undefined) allowed.status             = updates.status;
    if (updates.location_id        !== undefined) allowed.location_id        = updates.location_id || null;
    if (updates.pin                !== undefined) allowed.pin                = updates.pin;
    if (updates.phone              !== undefined) allowed.phone              = String(updates.phone).trim();
    if (updates.emergency_contact  !== undefined) allowed.emergency_contact  = String(updates.emergency_contact).trim();

    if (Object.keys(allowed).length === 0) {
      return NextResponse.json({ error: "No valid fields to update" }, { status: 400 });
    }

    const { data, error } = await client
      .from("users").update(allowed).eq("id", userId).select().single();

    if (error) {
      console.error("[user PATCH] DB error:", JSON.stringify(error));
      return NextResponse.json({ error: error.message, details: error }, { status: 500 });
    }

    return NextResponse.json({ ok: true, user: data });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
