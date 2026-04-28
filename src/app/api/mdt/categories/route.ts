// src/app/api/mdt/categories/route.ts
export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const sb = () => createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const MDT_ORG_ID = "a1d2c3e4-0001-4000-8000-000000000001";

export async function GET(req: NextRequest) {
  const client = sb();
  const { data, error } = await client
    .from("ld_categories")
    .select("slug, display_name, description, emoji, color, baseline_value_score, default_mailbox_id")
    .eq("org_id", MDT_ORG_ID)
    .eq("active", true)
    .order("display_order", { ascending: true });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ categories: data || [] });
}
