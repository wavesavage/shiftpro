export const dynamic = "force-dynamic";

import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";

const sb = () => createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const NO_CACHE = { headers: { "Cache-Control": "no-store, no-cache, must-revalidate" } };

// GET — list documents for a user (or all for an org if owner)
export async function GET(req: NextRequest) {
  const userId = req.nextUrl.searchParams.get("userId");
  const orgId = req.nextUrl.searchParams.get("orgId");
  const action = req.nextUrl.searchParams.get("action");
  const docId = req.nextUrl.searchParams.get("docId");

  if (!userId) return NextResponse.json({ error: "userId required" }, { status: 400 });
  const client = sb();

  // Download — generate signed URL
  if (action === "download" && docId) {
    const { data: doc } = await client.from("employee_documents").select("*").eq("id", docId).single();
    if (!doc) return NextResponse.json({ error: "Document not found" }, { status: 404 });
    const { data } = await client.storage.from("employee-documents").createSignedUrl(doc.storage_path, 300);
    return NextResponse.json({ url: data?.signedUrl || null }, NO_CACHE);
  }

  // List — get all docs for this user
  const { data: docs, error } = await client
    .from("employee_documents")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ documents: docs || [] }, NO_CACHE);
}

// POST — upload a document
export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;
    const userId = formData.get("userId") as string;
    const orgId = formData.get("orgId") as string;
    const name = formData.get("name") as string;
    const category = formData.get("category") as string;
    const notes = formData.get("notes") as string;

    if (!file || !userId || !name || !category) {
      return NextResponse.json({ error: "file, userId, name, category required" }, { status: 400 });
    }

    const client = sb();
    const ext = file.name.split(".").pop() || "bin";
    const path = `${userId}/${Date.now()}_${file.name.replace(/[^a-zA-Z0-9._-]/g, "_")}`;

    // Upload to storage
    const bytes = await file.arrayBuffer();
    const { error: uploadError } = await client.storage
      .from("employee-documents")
      .upload(path, bytes, { contentType: file.type, upsert: false });

    if (uploadError) return NextResponse.json({ error: uploadError.message }, { status: 500 });

    // Save metadata
    const { data: doc, error: dbError } = await client.from("employee_documents").insert({
      user_id: userId,
      org_id: orgId || null,
      name,
      category,
      file_name: file.name,
      file_size: file.size,
      file_type: file.type,
      storage_path: path,
      uploaded_by: userId,
      notes: notes || null,
    }).select().single();

    if (dbError) return NextResponse.json({ error: dbError.message }, { status: 500 });
    return NextResponse.json({ document: doc });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

// DELETE — remove a document
export async function DELETE(req: NextRequest) {
  const docId = req.nextUrl.searchParams.get("docId");
  if (!docId) return NextResponse.json({ error: "docId required" }, { status: 400 });

  const client = sb();
  const { data: doc } = await client.from("employee_documents").select("*").eq("id", docId).single();
  if (!doc) return NextResponse.json({ error: "Not found" }, { status: 404 });

  await client.storage.from("employee-documents").remove([doc.storage_path]);
  await client.from("employee_documents").delete().eq("id", docId);
  return NextResponse.json({ ok: true });
}
