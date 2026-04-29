// src/app/api/mdt/hiring/onboarding/templates/route.ts
export const dynamic = "force-dynamic";
export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const sb = () => createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const MDT_ORG_ID = "a1d2c3e4-0001-4000-8000-000000000001";
const BUCKET = "onboarding-documents";

// GET → list all templates
export async function GET() {
  const client = sb();
  const { data, error } = await client
    .from("ld_onboarding_templates")
    .select("*")
    .eq("org_id", MDT_ORG_ID)
    .order("display_order", { ascending: true });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Sign URLs for any attachments
  const withUrls = await Promise.all((data || []).map(async (t: any) => {
    if (t.storage_path) {
      const { data: signed } = await client.storage.from(BUCKET).createSignedUrl(t.storage_path, 86400);
      return { ...t, download_url: signed?.signedUrl || null };
    }
    return t;
  }));
  return NextResponse.json({ templates: withUrls });
}

// POST → upload an attachment template (multipart) OR create a non-file template (JSON)
export async function POST(req: NextRequest) {
  try {
    const ct = req.headers.get("content-type") || "";

    if (ct.includes("multipart/form-data")) {
      // File upload path
      const fd = await req.formData();
      const file = fd.get("file") as File | null;
      const name = (fd.get("name") as string)?.trim();
      const description = (fd.get("description") as string)?.trim() || null;
      const kind = ((fd.get("kind") as string) || "attachment").trim();

      if (!file) return NextResponse.json({ error: "file required" }, { status: 400 });
      if (!name) return NextResponse.json({ error: "name required" }, { status: 400 });
      if (file.size > 25 * 1024 * 1024) return NextResponse.json({ error: "File too large (>25MB)" }, { status: 400 });

      const client = sb();
      const ext = (file.name.split(".").pop() || "bin").toLowerCase().replace(/[^a-z0-9]/g, "");
      const safeName = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
      const storagePath = `${MDT_ORG_ID}/templates/${safeName}`;

      const arrayBuffer = await file.arrayBuffer();
      const { error: uploadErr } = await client.storage.from(BUCKET).upload(
        storagePath,
        Buffer.from(arrayBuffer),
        { contentType: file.type || "application/octet-stream", upsert: false }
      );
      if (uploadErr) {
        return NextResponse.json({
          error: "Upload failed: " + uploadErr.message,
          hint: uploadErr.message.includes("Bucket not found")
            ? `Create the '${BUCKET}' bucket in Supabase Storage (private, 25MB).`
            : undefined,
        }, { status: 500 });
      }

      const { data: tpl, error } = await client
        .from("ld_onboarding_templates")
        .insert({
          org_id: MDT_ORG_ID,
          name,
          description,
          kind,
          file_name: file.name,
          file_size: file.size,
          file_type: file.type || null,
          storage_path: storagePath,
        })
        .select()
        .single();
      if (error) {
        await client.storage.from(BUCKET).remove([storagePath]);
        return NextResponse.json({ error: error.message }, { status: 500 });
      }
      return NextResponse.json({ ok: true, template: tpl });
    }

    // JSON path — non-file template (built-in form)
    const body = await req.json();
    const { name, description, kind, form_key, custom_schema, display_order } = body;
    if (!name?.trim() || !kind) return NextResponse.json({ error: "name and kind required" }, { status: 400 });

    const client = sb();
    const { data: tpl, error } = await client
      .from("ld_onboarding_templates")
      .insert({
        org_id: MDT_ORG_ID,
        name: name.trim(),
        description: description?.trim() || null,
        kind,
        form_key: form_key || null,
        custom_schema: custom_schema || [],
        display_order: display_order || 100,
      })
      .select()
      .single();
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ ok: true, template: tpl });
  } catch (e: any) {
    console.error("[templates POST]", e?.message);
    return NextResponse.json({ error: e?.message || "Server error" }, { status: 500 });
  }
}

// PATCH ?id=... → update name/description/active
export async function PATCH(req: NextRequest) {
  const id = req.nextUrl.searchParams.get("id");
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });
  const body = await req.json();
  const allowedKeys = ["name", "description", "active", "display_order", "custom_schema"];
  const updates: any = {};
  for (const k of allowedKeys) if (k in body) updates[k] = body[k];
  if (Object.keys(updates).length === 0) return NextResponse.json({ error: "No fields" }, { status: 400 });
  updates.updated_at = new Date().toISOString();

  const client = sb();
  const { data, error } = await client
    .from("ld_onboarding_templates")
    .update(updates).eq("id", id).eq("org_id", MDT_ORG_ID)
    .select().single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true, template: data });
}

// DELETE ?id=... — soft-protect: reject if used by an active packet
export async function DELETE(req: NextRequest) {
  const id = req.nextUrl.searchParams.get("id");
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });

  const client = sb();
  const { data: packetsUsing } = await client
    .from("ld_onboarding_packets")
    .select("id, name")
    .eq("org_id", MDT_ORG_ID)
    .contains("template_ids", [id]);

  if (packetsUsing && packetsUsing.length > 0) {
    return NextResponse.json({
      error: `Cannot delete — used by packet(s): ${packetsUsing.map((p: any) => p.name).join(", ")}. Remove from packets first.`,
    }, { status: 400 });
  }

  const { data: tpl } = await client
    .from("ld_onboarding_templates")
    .select("storage_path")
    .eq("id", id)
    .eq("org_id", MDT_ORG_ID)
    .single();

  if (tpl?.storage_path) {
    await client.storage.from(BUCKET).remove([tpl.storage_path]);
  }

  const { error } = await client
    .from("ld_onboarding_templates")
    .delete().eq("id", id).eq("org_id", MDT_ORG_ID);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
