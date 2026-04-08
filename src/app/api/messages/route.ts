export const dynamic = "force-dynamic";

import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";

const sb = () => createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const NO_CACHE = { headers: { "Cache-Control": "no-store, no-cache, must-revalidate" } };

// GET /api/messages?orgId=...&userId=...&role=employee|owner
export async function GET(req: NextRequest) {
  const orgId = req.nextUrl.searchParams.get("orgId");
  const userId = req.nextUrl.searchParams.get("userId");
  const role = req.nextUrl.searchParams.get("role") || "employee";

  if (!orgId || !userId) return NextResponse.json({ error: "orgId and userId required" }, { status: 400 });

  const client = sb();

  if (role === "owner") {
    // Owner sees ALL messages in org — full log
    const { data: messages, error } = await client
      .from("messages")
      .select("*")
      .eq("org_id", orgId)
      .order("created_at", { ascending: false })
      .limit(200);

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    // Build threads: group replies under their parent
    const roots = (messages || []).filter(m => !m.parent_id);
    const threads = roots.map(root => ({
      ...root,
      replies: (messages || []).filter(m => m.parent_id === root.id)
        .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
    }));

    return NextResponse.json({ threads, total: messages?.length || 0 }, NO_CACHE);
  }

  // Employee sees messages sent to them + their own sent messages
  const { data: received } = await client
    .from("messages")
    .select("*")
    .eq("org_id", orgId)
    .or(`to_id.eq.${userId},broadcast.eq.true`)
    .is("parent_id", null)
    .order("created_at", { ascending: false })
    .limit(100);

  const { data: sent } = await client
    .from("messages")
    .select("*")
    .eq("org_id", orgId)
    .eq("from_id", userId)
    .order("created_at", { ascending: false })
    .limit(50);

  // Get all replies for received threads
  const rootIds = (received || []).map(m => m.id);
  let replies: any[] = [];
  if (rootIds.length > 0) {
    const { data: r } = await client
      .from("messages")
      .select("*")
      .in("parent_id", rootIds)
      .order("created_at", { ascending: true });
    replies = r || [];
  }

  const threads = (received || []).map(root => ({
    ...root,
    replies: replies.filter(r => r.parent_id === root.id)
  }));

  // Mark all unread messages as read
  const unreadIds = (received || []).filter(m => !m.read && m.to_id === userId).map(m => m.id);
  if (unreadIds.length > 0) {
    await client.from("messages").update({ read: true }).in("id", unreadIds);
  }

  return NextResponse.json({ threads, sent: sent || [] }, NO_CACHE);
}

// POST /api/messages — send a new message or reply
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { orgId, fromId, fromName, toId, subject, text, broadcast, parentId, type } = body;

    if (!orgId || !fromId || !text?.trim()) {
      return NextResponse.json({ error: "orgId, fromId, text required" }, { status: 400 });
    }

    const client = sb();
    const msgType = parentId ? "reply" : broadcast ? "broadcast" : "direct";

    if (broadcast && !parentId) {
      // Broadcast to all active employees in org
      const { data: employees } = await client
        .from("users")
        .select("id")
        .eq("org_id", orgId)
        .eq("app_role", "employee")
        .neq("id", fromId);

      const msgs = (employees || []).map(emp => ({
        org_id: orgId,
        from_id: fromId,
        from_name: fromName || "Manager",
        to_id: emp.id,
        subject: subject || "Team Announcement",
        body: text.trim(),
        read: false,
        broadcast: true,
        type: "broadcast",
        created_at: new Date().toISOString(),
      }));

      if (msgs.length > 0) {
        const { error } = await client.from("messages").insert(msgs);
        if (error) return NextResponse.json({ error: error.message }, { status: 500 });
      }
      return NextResponse.json({ ok: true, count: msgs.length });
    }

    // Single message or reply
    const { data: msg, error } = await client.from("messages").insert({
      org_id: orgId,
      from_id: fromId,
      from_name: fromName || (type === "employee" ? "Employee" : "Manager"),
      to_id: toId || null,
      subject: subject || (parentId ? "Re: Message" : "Message from " + (fromName || "Manager")),
      body: text.trim(),
      read: false,
      broadcast: false,
      parent_id: parentId || null,
      type: msgType,
      created_at: new Date().toISOString(),
    }).select().single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ ok: true, message: msg });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

// DELETE is intentionally NOT implemented — messages are permanent records
// This protects HR/tax/legal records even after employee departure
