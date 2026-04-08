export const dynamic = "force-dynamic";
import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";

const sb = () => createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);
const NO_CACHE = { headers: { "Cache-Control": "no-store" } };

export async function GET(req: NextRequest) {
  const userId = req.nextUrl.searchParams.get("userId");
  const orgId  = req.nextUrl.searchParams.get("orgId");
  const role   = req.nextUrl.searchParams.get("role"); // "employee" | "owner"

  if (!userId || !orgId) return NextResponse.json({ error: "userId and orgId required" }, { status: 400 });
  const client = sb();

  if (role === "owner") {
    // Owner sees: broadcasts + employee-to-manager messages for their org
    const { data } = await client.from("messages").select("*")
      .eq("org_id", orgId)
      .or("broadcast.eq.true,type.eq.employee_to_manager")
      .order("created_at", { ascending: false }).limit(50);

    const threads = buildThreads(data || []);
    return NextResponse.json({ threads }, NO_CACHE);
  }

  // Employee sees: messages to them + broadcasts + their own sent messages
  const { data } = await client.from("messages").select("*")
    .eq("org_id", orgId)
    .or(`to_id.eq.${userId},broadcast.eq.true,from_id.eq.${userId}`)
    .order("created_at", { ascending: false }).limit(50);

  const threads = buildThreads(data || []);
  return NextResponse.json({ threads }, NO_CACHE);
}

function buildThreads(messages: any[]) {
  const roots = messages.filter(m => !m.parent_id);
  return roots.map(root => ({
    ...root,
    replies: messages.filter(m => m.parent_id === root.id)
      .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()),
  }));
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const client = sb();
    const { orgId, fromId, fromName, toId, text, parentId, type } = body;

    if (!orgId || !fromId || !text) {
      return NextResponse.json({ error: "orgId, fromId, text required" }, { status: 400 });
    }

    const isBroadcast = toId === "all";
    const isToManagers = toId === "managers";
    const msgType = type || (isBroadcast ? "broadcast" : isToManagers ? "employee_to_manager" : "direct");

    const { data: msg, error } = await client.from("messages").insert({
      org_id: orgId,
      from_id: fromId,
      from_name: fromName || "Staff",
      to_id: isToManagers || isBroadcast ? null : toId,
      text: text.trim(),
      parent_id: parentId || null,
      type: msgType,
      broadcast: isBroadcast,
      read: false,
      created_at: new Date().toISOString(),
    }).select().single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    // For employee_to_manager: mark unread for all owners/managers in org
    if (isToManagers) {
      const { data: managers } = await client.from("users")
        .select("id").eq("org_id", orgId)
        .in("app_role", ["owner", "manager"]);
      // Insert notification records if needed (future: push notifications)
      // For now the message itself is flagged as employee_to_manager
    }

    return NextResponse.json({ ok: true, message: msg });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
