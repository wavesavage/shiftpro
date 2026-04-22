// src/app/api/messages/route.ts
export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { pushToUser, pushToManagers } from "@/lib/push-util";
import { emailUser, emailManagers } from "@/lib/email-util";
import { requireAuthOr401, svcClient } from "@/lib/auth";

const NO_CACHE = { headers: { "Cache-Control": "no-store, no-cache, must-revalidate" } };

export async function GET(req: NextRequest) {
  const authed = await requireAuthOr401(req);
  if (authed instanceof NextResponse) return authed;

  const userId = req.nextUrl.searchParams.get("userId");
  const orgId  = req.nextUrl.searchParams.get("orgId");
  const role   = req.nextUrl.searchParams.get("role");

  if (!orgId) return NextResponse.json({ error: "orgId required" }, { status: 400 });

  // Must be a member of the requested org
  if (authed.orgId !== orgId) {
    return NextResponse.json({ error: "Different organization" }, { status: 403 });
  }

  const client = svcClient();
  let data: any[] | null = null;
  let error: any = null;

  // Owner role requested: verify the authed user IS owner/manager
  const useOwnerView = role === "owner" && (authed.role === "owner" || authed.role === "manager");

  if (useOwnerView) {
    ({ data, error } = await client
      .from("messages").select("*").eq("org_id", orgId)
      .order("created_at", { ascending: false }).limit(100));
  } else {
    // Employee view — only messages involving the authed user
    const queryUserId = authed.id;
    ({ data, error } = await client
      .from("messages").select("*").eq("org_id", orgId)
      .or(`to_id.eq.${queryUserId},from_id.eq.${queryUserId},type.eq.broadcast,type.eq.employee_to_manager`)
      .order("created_at", { ascending: false }).limit(100));
  }

  if (error) {
    console.warn("[messages GET]", error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ threads: buildThreads(data || []) }, NO_CACHE);
}

function buildThreads(messages: any[]) {
  const roots = messages.filter(m => !m.parent_id);
  const replies: Record<string, any[]> = {};
  messages.forEach(m => {
    if (m.parent_id) {
      if (!replies[m.parent_id]) replies[m.parent_id] = [];
      replies[m.parent_id].push(m);
    }
  });
  return roots.map(root => ({
    ...root,
    replies: (replies[root.id] || []).sort(
      (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
    ),
  }));
}

export async function POST(req: NextRequest) {
  const authed = await requireAuthOr401(req);
  if (authed instanceof NextResponse) return authed;

  try {
    const body = await req.json();
    const { orgId, fromId, fromName, toId, text, subject, parentId, type } = body;

    if (!orgId || !fromId || !text?.trim()) {
      return NextResponse.json({ error: "orgId, fromId, and text are required" }, { status: 400 });
    }

    // Authz: fromId must be the authed user (can't send as someone else)
    if (fromId !== authed.id) {
      return NextResponse.json({ error: "Cannot send messages on behalf of another user" }, { status: 403 });
    }
    // Authz: must belong to the target org
    if (authed.orgId !== orgId) {
      return NextResponse.json({ error: "Different organization" }, { status: 403 });
    }

    const isBroadcast  = toId === "all" || type === "broadcast";
    const isToManagers = toId === "managers" || type === "employee_to_manager";

    // Only owners/managers can broadcast
    if (isBroadcast && authed.role !== "owner" && authed.role !== "manager") {
      return NextResponse.json({ error: "Only managers can broadcast to the team" }, { status: 403 });
    }

    const msgType = isBroadcast ? "broadcast" : isToManagers ? "employee_to_manager" : parentId ? "reply" : "direct";

    const msgSubject = subject?.trim()
      || (isBroadcast ? "Team Announcement" : isToManagers ? "Message from " + (fromName || "Staff") : parentId ? "Reply" : "Message");

    const client = svcClient();
    const { data: msg, error } = await client.from("messages").insert({
      org_id: orgId, from_id: fromId, from_name: fromName || "Staff",
      to_id: isBroadcast || isToManagers ? null : (toId || null),
      subject: msgSubject, body: text.trim(), type: msgType,
      parent_id: parentId || null, read: false, created_at: new Date().toISOString(),
    }).select().single();

    if (error) {
      console.warn("[messages POST insert]", error.message);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const preview = text.trim().length > 80 ? text.trim().slice(0, 77) + "..." : text.trim();
    const sender = fromName || "Someone";

    if (isToManagers) {
      pushToManagers(orgId, sender, preview, "/", "msg-" + (msg?.id || Date.now()))
        .catch((e: any) => console.warn("[push to managers]", e?.message));
      emailManagers(orgId, "New message from " + sender, "New Message from " + sender,
        "<strong>" + sender + "</strong> sent you a message:<br><br><em>" + preview + "</em>",
        "Reply in ShiftPro", "https://shiftpro.ai"
      ).catch((e: any) => console.warn("[email to managers]", e?.message));
    } else if (toId && toId !== "all" && toId !== "managers") {
      pushToUser(toId, sender, preview, "/", "msg-" + (msg?.id || Date.now()))
        .catch((e: any) => console.warn("[push to user]", e?.message));
      emailUser(toId, "New message from " + sender, "New Message from " + sender,
        "<strong>" + sender + "</strong> sent you a message:<br><br><em>" + preview + "</em>",
        "Reply in ShiftPro", "https://shiftpro.ai"
      ).catch((e: any) => console.warn("[email to user]", e?.message));
    }

    return NextResponse.json({ ok: true, message: msg });
  } catch (e: any) {
    console.error("[messages POST]", e?.message || e);
    return NextResponse.json({ error: e?.message || "Server error" }, { status: 500 });
  }
}
