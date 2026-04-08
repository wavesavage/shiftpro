export const dynamic = "force-dynamic";
import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";

const sb = () => createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);
const NO_CACHE = { headers: { "Cache-Control": "no-store, no-cache, must-revalidate" } };

// messages table columns:
//   id, org_id, to_id, from_id, subject, body, read, created_at  (original)
//   from_name, parent_id, type                                    (added via ALTER TABLE)
// type CHECK constraint was dropped — all values allowed

export async function GET(req: NextRequest) {
  const userId = req.nextUrl.searchParams.get("userId");
  const orgId  = req.nextUrl.searchParams.get("orgId");
  const role   = req.nextUrl.searchParams.get("role");

  if (!orgId) return NextResponse.json({ error: "orgId required" }, { status: 400 });
  const client = sb();

  let data: any[] | null = null;
  let error: any = null;

  if (role === "owner") {
    ({ data, error } = await client
      .from("messages")
      .select("*")
      .eq("org_id", orgId)
      .order("created_at", { ascending: false })
      .limit(100));
  } else {
    if (!userId) return NextResponse.json({ error: "userId required" }, { status: 400 });
    ({ data, error } = await client
      .from("messages")
      .select("*")
      .eq("org_id", orgId)
      .or(`to_id.eq.${userId},from_id.eq.${userId},type.eq.broadcast,type.eq.employee_to_manager`)
      .order("created_at", { ascending: false })
      .limit(100));
  }

  if (error) {
    console.error("[messages GET]", error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const threads = buildThreads(data || []);
  return NextResponse.json({ threads }, NO_CACHE);
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
  try {
    const body = await req.json();
    const client = sb();
    const { orgId, fromId, fromName, toId, text, subject, parentId, type } = body;

    if (!orgId || !fromId || !text?.trim()) {
      return NextResponse.json({ error: "orgId, fromId, and text are required" }, { status: 400 });
    }

    const isBroadcast  = toId === "all"      || type === "broadcast";
    const isToManagers = toId === "managers" || type === "employee_to_manager";

    // employee_to_manager is the correct type — constraint was dropped via SQL
    const msgType = isBroadcast  ? "broadcast"
                  : isToManagers ? "employee_to_manager"
                  : parentId     ? "reply"
                  : "direct";

    const msgSubject = subject?.trim()
      || (isBroadcast  ? "Team Announcement"
        : isToManagers ? `Message from ${fromName || "Staff"}`
        : parentId     ? "Reply"
        : "Message");

    const { data: msg, error } = await client
      .from("messages")
      .insert({
        org_id:     orgId,
        from_id:    fromId,
        from_name:  fromName || "Staff",
        to_id:      isBroadcast || isToManagers ? null : (toId || null),
        subject:    msgSubject,
        body:       text.trim(),
        type:       msgType,
        parent_id:  parentId || null,
        read:       false,
        created_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      console.error("[messages POST]", error.message, { orgId, fromId, msgType });
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ ok: true, message: msg });
  } catch (e: any) {
    console.error("[messages POST exception]", e.message);
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
