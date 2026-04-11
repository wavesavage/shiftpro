export const dynamic = "force-dynamic";
import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";

const sb = () => createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// VAPID keys for Web Push — generate once with: npx web-push generate-vapid-keys
const VAPID_PUBLIC = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || "";
const VAPID_PRIVATE = process.env.VAPID_PRIVATE_KEY || "";

// GET — return the public VAPID key so frontend can subscribe
export async function GET(req: NextRequest) {
  const action = req.nextUrl.searchParams.get("action");

  if (action === "vapid") {
    return NextResponse.json({ publicKey: VAPID_PUBLIC });
  }

  return NextResponse.json({ error: "unknown action" }, { status: 400 });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const client = sb();

    // ── SUBSCRIBE — store push subscription ──
    if (body.action === "subscribe") {
      const { userId, subscription, role } = body;
      if (!userId || !subscription) {
        return NextResponse.json({ error: "userId and subscription required" }, { status: 400 });
      }

      // Upsert — one subscription per user per endpoint
      const endpoint = subscription.endpoint;
      const { error } = await client
        .from("push_subscriptions")
        .upsert({
          user_id: userId,
          endpoint,
          subscription: subscription,
          role: role || "employee",
          updated_at: new Date().toISOString(),
        }, { onConflict: "endpoint" });

      if (error) {
        console.error("[push subscribe]", error.message);
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      console.log("[push] subscribed:", userId, role);
      return NextResponse.json({ ok: true });
    }

    // ── UNSUBSCRIBE — remove push subscription ──
    if (body.action === "unsubscribe") {
      const { endpoint } = body;
      if (!endpoint) return NextResponse.json({ error: "endpoint required" }, { status: 400 });

      await client.from("push_subscriptions").delete().eq("endpoint", endpoint);
      return NextResponse.json({ ok: true });
    }

    // ── SEND — send push to specific user(s) or org ──
    if (body.action === "send") {
      const { targetUserId, targetOrgId, targetRole, title, message, url, tag } = body;

      if (!VAPID_PUBLIC || !VAPID_PRIVATE) {
        return NextResponse.json({ error: "VAPID keys not configured" }, { status: 500 });
      }

      // Dynamic import web-push
      let webpush: any;
      try {
        webpush = await import("web-push");
      } catch (e) {
        console.error("[push] web-push not installed. Run: npm install web-push");
        return NextResponse.json({ error: "web-push not installed" }, { status: 500 });
      }

      webpush.setVapidDetails(
        "mailto:support@shiftpro.ai",
        VAPID_PUBLIC,
        VAPID_PRIVATE
      );

      // Build query for target subscriptions
      let q = client.from("push_subscriptions").select("*");
      if (targetUserId) q = q.eq("user_id", targetUserId);
      if (targetRole) q = q.eq("role", targetRole);

      // If targeting by org, get user IDs in that org first
      if (targetOrgId && !targetUserId) {
        const { data: orgUsers } = await client
          .from("users")
          .select("id")
          .eq("org_id", targetOrgId);
        if (orgUsers && orgUsers.length > 0) {
          q = q.in("user_id", orgUsers.map(u => u.id));
        }
      }

      const { data: subs, error: subErr } = await q;
      if (subErr) {
        console.error("[push send] query error:", subErr.message);
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
          // If subscription expired (410 Gone or 404), mark for cleanup
          if (e.statusCode === 410 || e.statusCode === 404) {
            staleEndpoints.push(sub.endpoint);
          }
          console.error("[push send] failed for", sub.user_id, ":", e.statusCode || e.message);
        }
      }

      // Clean up stale subscriptions
      if (staleEndpoints.length > 0) {
        await client.from("push_subscriptions").delete().in("endpoint", staleEndpoints);
        console.log("[push] cleaned", staleEndpoints.length, "stale subscriptions");
      }

      console.log("[push] sent:", sent, "failed:", failed);
      return NextResponse.json({ ok: true, sent, failed });
    }

    return NextResponse.json({ error: "unknown action" }, { status: 400 });
  } catch (e: any) {
    console.error("[push POST]", e.message);
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
