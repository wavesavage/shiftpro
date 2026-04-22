// src/app/api/documents/route.ts
export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { requireAuthOr401, requireCanActOn, requireManager, svcClient } from "@/lib/auth";

const NO_CACHE = { headers: { "Cache-Control": "no-store, no-cache, must-revalidate" } };

// GET — list docs for a user, or download signed URL
export async function GET(req: NextRequest) {
  const authed = await requireAuthOr401(req);
  if (authed instanceof NextResponse) return authed;

  const userId = req.nextUrl.searchParams.get("userId");
  const action = req.nextUrl.searchParams.get("action");
  const docId = req.nextUrl.searchParams.get("docId");

  if (!userId) return NextResponse.json({ error: "userId required" }, { status: 400 });

  // Self or owner/manager of same org
  try {
    await requireCanActOn(authed, userId, authed.orgId);
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: e.status || 403 });
  }

  const client = svcClient();

  if (action === "download" && docId) {
    const { data: doc, error: docErr } = await client
      .from("employee_documents").select("*").eq("id", docId).single();
    if (docErr || !doc) return NextResponse.json({ error: "Document not found" }, { status: 404 });

    // Extra authz: verify this doc belongs to the requested userId's org
    if (doc.user_id !== userId && authed.role !== "owner" && authed.role !== "manager") {
      return NextResponse.json({ error: "Not authorized" }, { status: 403 });
    }

    const { data, error: urlErr } = await client.storage
      .from("employee-documents").createSignedUrl(doc.storage_path, 600);
    if (urlErr) {
      console.warn("[documents download]", urlErr.message);
      return NextResponse.json({ error: urlErr.message }, { status: 500 });
    }
    return NextResponse.json({ url: data?.signedUrl || null }, NO_CACHE);
  }

  const { data: docs, error } = await client
    .from("employee_documents").select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) {
    console.warn("[documents GET]", error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ documents: docs || [] }, NO_CACHE);
}

// POST — upload document (manager/owner only, for files assigned to team members)
export async function POST(req: NextRequest) {
  const authed = await requireAuthOr401(req);
  if (authed instanceof NextResponse) return authed;

  try {
    requireManager(authed);
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: e.status || 403 });
  }

  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;
    const userId = formData.get("userId") as string;
    const orgId = formData.get("orgId") as string;
    const name = formData.get("name") as string;
    const category = formData.get("category") as string;
    const notes = formData.get("notes") as string;
    const uploadedByName = formData.get("uploadedByName") as string;

    if (!file || !userId || !name || !category) {
      return NextResponse.json({ error: "file, userId, name, category required" }, { status: 400 });
    }

    // Authz: target user must be in authed user's org
    if (orgId && authed.orgId !== orgId) {
      return NextResponse.json({ error: "Different organization" }, { status: 403 });
    }

    // Size + type validation
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json({ error: "File must be under 10MB" }, { status: 400 });
    }

    const allowedTypes = [
      "application/pdf", "image/jpeg", "image/png", "image/gif", "image/webp",
      "application/msword", "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "application/vnd.ms-excel", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "text/plain", "text/csv",
    ];
    if (file.type && !allowedTypes.includes(file.type)) {
      return NextResponse.json({ error: "File type not allowed. PDF, DOC, JPG, PNG, XLS, CSV, TXT only." }, { status: 400 });
    }

    const client = svcClient();
    const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
    const path = `${userId}/${Date.now()}_${safeName}`;

    const bytes = await file.arrayBuffer();
    const { error: uploadError } = await client.storage
      .from("employee-documents")
      .upload(path, bytes, {
        contentType: file.type || "application/octet-stream",
        upsert: false
      });

    if (uploadError) {
      console.warn("[documents POST storage]", uploadError.message);
      return NextResponse.json({ error: "Storage error: " + uploadError.message }, { status: 500 });
    }

    const { data: doc, error: dbError } = await client.from("employee_documents").insert({
      user_id: userId,
      org_id: orgId || authed.orgId || null,
      name,
      category,
      file_name: file.name,
      file_size: file.size,
      file_type: file.type || "application/octet-stream",
      storage_path: path,
      uploaded_by: authed.id,
      uploaded_by_name: uploadedByName || null,
      notes: notes || null,
    }).select().single();

    if (dbError) {
      console.warn("[documents POST db]", dbError.message);
      await client.storage.from("employee-documents").remove([path]);
      return NextResponse.json({ error: "DB error: " + dbError.message }, { status: 500 });
    }

    return NextResponse.json({ document: doc });
  } catch (e: any) {
    console.error("[documents POST]", e?.message || e);
    return NextResponse.json({ error: e?.message || "Server error" }, { status: 500 });
  }
}

// DELETE — owner/manager only
export async function DELETE(req: NextRequest) {
  const authed = await requireAuthOr401(req);
  if (authed instanceof NextResponse) return authed;

  try {
    requireManager(authed);
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: e.status || 403 });
  }

  const docId = req.nextUrl.searchParams.get("docId");
  if (!docId) return NextResponse.json({ error: "docId required" }, { status: 400 });

  const client = svcClient();
  const { data: doc } = await client.from("employee_documents").select("*").eq("id", docId).single();
  if (!doc) return NextResponse.json({ error: "Not found" }, { status: 404 });

  // Authz: doc must belong to authed user's org
  if (doc.org_id && doc.org_id !== authed.orgId) {
    return NextResponse.json({ error: "Different organization" }, { status: 403 });
  }

  const { error: storageErr } = await client.storage.from("employee-documents").remove([doc.storage_path]);
  if (storageErr) console.warn("[documents DELETE storage]", storageErr.message);

  const { error: dbErr } = await client.from("employee_documents").delete().eq("id", docId);
  if (dbErr) {
    console.warn("[documents DELETE db]", dbErr.message);
    return NextResponse.json({ error: dbErr.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
