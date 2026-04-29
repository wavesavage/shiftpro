// src/app/api/mdt/hiring/documents/route.ts
export const dynamic = "force-dynamic";
export const runtime = "nodejs"; // need Node runtime for FormData binary

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const sb = () => createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const MDT_ORG_ID = "a1d2c3e4-0001-4000-8000-000000000001";
const BUCKET = "candidate-documents";
const MAX_SIZE = 25 * 1024 * 1024; // 25 MB
const ALLOWED_TYPES = [
  "application/pdf",
  "image/jpeg", "image/png", "image/webp", "image/heic",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "text/plain", "text/csv",
];

// GET /api/mdt/hiring/documents?candidate_id=...
export async function GET(req: NextRequest) {
  const candidateId = req.nextUrl.searchParams.get("candidate_id");
  if (!candidateId) return NextResponse.json({ error: "candidate_id required" }, { status: 400 });

  const client = sb();
  const { data, error } = await client
    .from("ld_candidate_documents")
    .select("*")
    .eq("candidate_id", candidateId)
    .order("created_at", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Sign URLs for download (24h expiry)
  const withUrls = await Promise.all((data || []).map(async (doc) => {
    if (!doc.storage_path) return doc;
    const { data: signed } = await client.storage
      .from(BUCKET)
      .createSignedUrl(doc.storage_path, 86400);
    return { ...doc, download_url: signed?.signedUrl || null };
  }));

  return NextResponse.json({ documents: withUrls });
}

// POST /api/mdt/hiring/documents → upload (multipart/form-data)
// Form fields: file, candidate_id, name, category, notes?, uploaded_by_name?
export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const candidateId = formData.get("candidate_id") as string;
    const name = formData.get("name") as string;
    const category = (formData.get("category") as string) || "other";
    const notes = formData.get("notes") as string | null;
    const uploadedBy = formData.get("uploaded_by_name") as string | null;

    if (!file) return NextResponse.json({ error: "file required" }, { status: 400 });
    if (!candidateId) return NextResponse.json({ error: "candidate_id required" }, { status: 400 });
    if (file.size > MAX_SIZE) {
      return NextResponse.json({ error: `File too large (${Math.round(file.size / 1024 / 1024)}MB > 25MB max)` }, { status: 400 });
    }
    if (file.type && !ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json({ error: `Unsupported file type: ${file.type}` }, { status: 400 });
    }

    const validCategories = ["resume", "cover_letter", "license", "certification", "id", "reference", "offer_letter", "other"];
    const finalCategory = validCategories.includes(category) ? category : "other";

    const client = sb();

    // Verify candidate exists
    const { data: candidate, error: candErr } = await client
      .from("ld_candidates")
      .select("id, full_name")
      .eq("id", candidateId)
      .eq("org_id", MDT_ORG_ID)
      .single();
    if (candErr || !candidate) return NextResponse.json({ error: "Candidate not found" }, { status: 404 });

    // Build a safe storage path
    const ext = (file.name.split(".").pop() || "bin").toLowerCase().replace(/[^a-z0-9]/g, "");
    const safeName = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
    const storagePath = `${MDT_ORG_ID}/${candidateId}/${safeName}`;

    // Convert File to ArrayBuffer for Supabase upload
    const arrayBuffer = await file.arrayBuffer();
    const buf = Buffer.from(arrayBuffer);

    const { error: uploadErr } = await client.storage
      .from(BUCKET)
      .upload(storagePath, buf, {
        contentType: file.type || "application/octet-stream",
        upsert: false,
      });

    if (uploadErr) {
      console.error("[doc upload]", uploadErr.message);
      return NextResponse.json({
        error: "Upload failed: " + uploadErr.message,
        hint: uploadErr.message.includes("Bucket not found")
          ? `Create the '${BUCKET}' bucket in Supabase Storage (private, 25MB limit).`
          : undefined,
      }, { status: 500 });
    }

    // Record DB row
    const { data: doc, error: dbErr } = await client
      .from("ld_candidate_documents")
      .insert({
        org_id: MDT_ORG_ID,
        candidate_id: candidateId,
        name: name?.trim() || file.name,
        category: finalCategory,
        file_name: file.name,
        file_size: file.size,
        file_type: file.type || null,
        storage_path: storagePath,
        notes: notes?.trim() || null,
        uploaded_by_name: uploadedBy?.trim() || null,
      })
      .select()
      .single();

    if (dbErr) {
      // Clean up the uploaded file if DB insert fails
      await client.storage.from(BUCKET).remove([storagePath]);
      return NextResponse.json({ error: dbErr.message }, { status: 500 });
    }

    await client.from("ld_audit_log").insert({
      org_id: MDT_ORG_ID,
      actor_type: "user",
      action: "document.uploaded",
      details: { candidate_id: candidateId, document_id: doc.id, category: finalCategory, name: doc.name },
    });

    return NextResponse.json({ ok: true, document: doc });
  } catch (e: any) {
    console.error("[doc POST]", e?.message);
    return NextResponse.json({ error: e?.message || "Server error" }, { status: 500 });
  }
}

// DELETE /api/mdt/hiring/documents?id=...
export async function DELETE(req: NextRequest) {
  const id = req.nextUrl.searchParams.get("id");
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });

  const client = sb();
  const { data: doc } = await client
    .from("ld_candidate_documents")
    .select("storage_path")
    .eq("id", id)
    .eq("org_id", MDT_ORG_ID)
    .single();

  if (doc?.storage_path) {
    await client.storage.from(BUCKET).remove([doc.storage_path]);
  }

  const { error } = await client
    .from("ld_candidate_documents")
    .delete()
    .eq("id", id)
    .eq("org_id", MDT_ORG_ID);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  await client.from("ld_audit_log").insert({
    org_id: MDT_ORG_ID,
    actor_type: "user",
    action: "document.deleted",
    details: { document_id: id },
  });

  return NextResponse.json({ ok: true });
}
