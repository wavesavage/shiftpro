export const dynamic = "force-dynamic";
import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";

const sb = () => createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);
const NO_CACHE = { headers: { "Cache-Control": "no-store, no-cache, must-revalidate" } };

// ── GET ─────────────────────────────────────────────────────────────────────
export async function GET(req: NextRequest) {
  const userId = req.nextUrl.searchParams.get("userId");
  const orgId  = req.nextUrl.searchParams.get("orgId");
  const role   = req.nextUrl.searchParams.get("role"); // "employee" | "owner"

  if (!orgId) return NextResponse.json({ error: "orgId required" }, { status: 400 });

  const client = sb();

  let query = client
    .from("messages")
    .select("*")
    .eq("org_id", orgId)
    .order("created_at", { ascending: false })
    .limit(100);

  if (role === "owner") {
    // Owner sees: all messages in org (broadcasts, direct, employee-to-manager)
    // No extra filter needed — org_id scopes to their org
  } else {
    // Employee sees: messages sent to them, broadcasts, and their own sent messages
    if (!userId) return NextResponse.json({ error: "userId required for employee" }, { status: 400 });
    query = query.or(
      `to_id.eq.${userId},type.eq.broadcast,from_id.eq.${userId},type.eq.employee_to_manager`
    );
  }

  const { data, error } = await query;
  if (error) {
    console.error("[messages GET]", error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const threads = buildThreads(data || []);
  return NextResponse.json({ threads }, NO_CACHE);
}

// ── Build threaded structure ─────────────────────────────────────────────────
function buildThreads(messages: any[]) {
  const roots = messages.filter(m => !m.parent_id);
  const byParent: Record<string, any[]> = {};
  messages.forEach(m => {
    if (m.parent_id) {
      if (!byParent[m.parent_id]) byParent[m.parent_id] = [];
      byParent[m.parent_id].push(m);
    }
  });
  return roots.map(root => ({
    ...root,
    replies: (byParent[root.id] || []).sort(
      (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
    ),
  }));
}

// ── POST ─────────────────────────────────────────────────────────────────────
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const client = sb();
    const { orgId, fromId, fromName, toId, text, subject, parentId, type } = body;

    if (!orgId || !fromId || !text?.trim()) {
      return NextResponse.json(
        { error: "orgId, fromId, and text are required" },
        { status: 400 }
      );
    }

    // Determine message type from toId/type hints
    const isBroadcast    = toId === "all"      || type === "broadcast";
    const isToManagers   = toId === "managers" || type === "employee_to_manager";
    const msgType = isBroadcast
      ? "broadcast"
      : isToManagers
      ? "employee_to_manager"
      : parentId
      ? "reply"
      : type || "direct";

    const insertPayload: Record<string, any> = {
      org_id:     orgId,
      from_id:    fromId,
      from_name:  fromName || "Staff",
      to_id:      isBroadcast || isToManagers ? null : (toId || null),
      text:       text.trim(),
      type:       msgType,
      parent_id:  parentId || null,
      read:       false,
      created_at: new Date().toISOString(),
    };

    // Add subject only if the column exists (graceful — will be ignored by DB if missing)
    if (subject) insertPayload.subject = subject;

    const { data: msg, error } = await client
      .from("messages")
      .insert(insertPayload)
      .select()
      .single();

    if (error) {
      // If subject column doesn't exist, retry without it
      if (error.message.includes("subject") && subject) {
        delete insertPayload.subject;
        const { data: msg2, error: err2 } = await client
          .from("messages").insert(insertPayload).select().single();
        if (err2) return NextResponse.json({ error: err2.message }, { status: 500 });
        return NextResponse.json({ ok: true, message: msg2 });
      }
      console.error("[messages POST]", error.message, insertPayload);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ ok: true, message: msg });
  } catch (e: any) {
    console.error("[messages POST exception]", e.message);
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
