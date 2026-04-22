// src/app/api/push/route.ts
export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { requireAuthOr401, requireManager, svcClient } from "@/lib/auth";

const VAPID_PUBLIC = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || "";
const VAPID_PRIVATE = process.env.VAPID_PRIVATE_KEY || "";

// GET — public: return VAPID public key (needed before subscription)
// This is NOT sensitive data (it's literally the "public" key) — no auth needed.
export async function GET(req: NextRequest) {
  const action = req.nextUrl.searchParams.get("action");
  if (action === "vapid") {
    return NextResponse.json({ publicKey: VAPID_PUBLIC });
  }
  return NextResponse.json({ error: "unknown action" }, { status: 400 });
}

export async function POST(req: NextRequest) {
  const authed = await requireAuthOr401(req);
  if (authed instanceof NextResponse) return authed;

  try {
    const body = await req.json();
    const client = svcClient();

    // ── SUBSCRIBE — user registers their own push subscription ──
    if (body.action === "subscribe") {
      const { userId, subscription, role } = body;
      if (!userId || !subscription) {
        return NextResponse.json({ error: "userId and subscription required" }, { status: 400 });
      }
      // Users can only subscribe themselves
      if (userId !== authed.id) {
        return NextResponse.json({ error: "Can only subscribe for yourself" }, { status: 403 });
      }

      const endpoint = subscription.endpoint;
      const { error } = await client
        .from("push_subscriptions")
        .upsert({
          user_id: userId,
          endpoint,
          subscription: subscription,
          role: role || authed.role || "employee",
          updated_at: new Date().toISOString(),
        }, { onConflict: "endpoint" });

      if (error) {
        console.warn("[push subscribe]", error.message);
        return NextResponse.json({ error: error.message }, { status: 500 });
      }
      return NextResponse.json({ ok: true });
    }

    // ── UNSUBSCRIBE — remove push subscription by endpoint ──
    if (body.action === "unsubscribe") {
      const { endpoint } = body;
      if (!endpoint) return NextResponse.json({ error: "endpoint required" }, { status: 400 });

      // Users can only unsubscribe their own endpoints
      const { data: sub } = await client.from("push_subscriptions")
        .select("user_id").eq("endpoint", endpoint).single();
      if (sub && sub.user_id !== authed.id && authed.role !== "owner") {
        return NextResponse.json({ error: "Cannot unsubscribe others" }, { status: 403 });
      }

      await client.from("push_subscriptions").delete().eq("endpoint", endpoint);
      return NextResponse.json({ ok: true });
    }

    // ── SEND — manager/owner can send test push; server-side send is via push-util ──
    if (body.action === "send") {
      try { requireManager(authed); }
      catch (e: any) { return NextResponse.json({ error: e.message }, { status: e.status || 403 }); }

      const { targetUserId, targetOrgId, targetRole, title, message, url, tag } = body;

      // Verify target org matches authed user's org
      if (targetOrgId && targetOrgId !== authed.orgId) {
        return NextResponse.json({ error: "Cannot send to a different organization" }, { status: 403 });
      }

      if (!VAPID_PUBLIC || !VAPID_PRIVATE) {
        return NextResponse.json({ error: "VAPID keys not configured" }, { status: 500 });
      }

      let webpush: any;
      try {
        webpush = await import("web-push");
      } catch (e) {
        console.warn("[push] web-push not installed");
        return NextResponse.json({ error: "web-push not installed" }, { status: 500 });
      }

      webpush.setVapidDetails("mailto:support@shiftpro.ai", VAPID_PUBLIC, VAPID_PRIVATE);

      let q = client.from("push_subscriptions").select("*");
      if (targetUserId) q = q.eq("user_id", targetUserId);
      if (targetRole) q = q.eq("role", targetRole);

      if (targetOrgId && !targetUserId) {
        const { data: orgUsers } = await client
          .from("users").select("id").eq("org_id", targetOrgId);
        if (orgUsers && orgUsers.length > 0) {
          q = q.in("user_id", orgUsers.map(u => u.id));
        }
      }

      const { data: subs, error: subErr } = await q;
      if (subErr) {
        console.warn("[push send query]", subErr.message);
        return NextResponse.json({ error: subErr.message }, { status: 500 });
      }

      if (!subs || subs.length === 0) {
        return NextResponse.json({ ok: true, sent: 0, message: "No subscribers found" });
      }

      const payload = JSON.stringify({
        title: title || "ShiftPro",
        body: message || "You have a new notification",
        icon: "/icon-192.png",
        badge: "/icon-badge.png",
        tag: tag || "shiftpro-" + Date.now(),
        data: { url: url || "/" },
      });

      let sent = 0;
      let failed = 0;
      const staleEndpoints: string[] = [];

      for (const sub of subs) {
        try {
          await webpush.sendNotification(sub.subscription, payload);
          sent++;
        } catch (e: any) {
          failed++;
          if (e.statusCode === 410 || e.statusCode === 404) {
            staleEndpoints.push(sub.endpoint);
          }
          console.warn("[push send failed]", sub.user_id, ":", e.statusCode || e.message);
        }
      }

      if (staleEndpoints.length > 0) {
        await client.from("push_subscriptions").delete().in("endpoint", staleEndpoints);
      }

      return NextResponse.json({ ok: true, sent, failed });
    }

    return NextResponse.json({ error: "unknown action" }, { status: 400 });
  } catch (e: any) {
    console.error("[push POST]", e?.message || e);
    return NextResponse.json({ error: e?.message || "Server error" }, { status: 500 });
  }
}
