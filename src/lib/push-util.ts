// Shared push utility — import this in any API route to send push notifications
import { createClient } from "@supabase/supabase-js";

const sb = () => createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

let webpushModule: any = null;
let vapidConfigured = false;

async function getWebPush() {
  if (!webpushModule) {
    try {
      webpushModule = await import("web-push");
    } catch (e) {
      console.error("[push-util] web-push not installed");
      return null;
    }
  }
  if (!vapidConfigured && process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY && process.env.VAPID_PRIVATE_KEY) {
    webpushModule.setVapidDetails(
      "mailto:support@shiftpro.ai",
      process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY,
      process.env.VAPID_PRIVATE_KEY
    );
    vapidConfigured = true;
  }
  return vapidConfigured ? webpushModule : null;
}

// Send push to a specific user
export async function pushToUser(userId: string, title: string, message: string, url?: string, tag?: string) {
  const wp = await getWebPush();
  if (!wp) return { sent: 0, failed: 0 };

  const client = sb();
  const { data: subs } = await client
    .from("push_subscriptions")
    .select("*")
    .eq("user_id", userId);

  if (!subs || subs.length === 0) return { sent: 0, failed: 0 };

  const payload = JSON.stringify({
    title, body: message,
    icon: "/icon-192.png", badge: "/icon-badge.png",
    tag: tag || "shiftpro-" + Date.now(),
    data: { url: url || "/" },
  });

  let sent = 0, failed = 0;
  const stale: string[] = [];

  for (const sub of subs) {
    try {
      await wp.sendNotification(sub.subscription, payload);
      sent++;
    } catch (e: any) {
      failed++;
      if (e.statusCode === 410 || e.statusCode === 404) stale.push(sub.endpoint);
    }
  }

  if (stale.length > 0) await client.from("push_subscriptions").delete().in("endpoint", stale);
  return { sent, failed };
}

// Send push to all users in an org (optionally filtered by role)
export async function pushToOrg(orgId: string, title: string, message: string, url?: string, tag?: string, excludeUserId?: string) {
  const wp = await getWebPush();
  if (!wp) return { sent: 0, failed: 0 };

  const client = sb();

  // Get all user IDs in this org
  const { data: orgUsers } = await client
    .from("users")
    .select("id")
    .eq("org_id", orgId)
    .eq("status", "active");

  if (!orgUsers || orgUsers.length === 0) return { sent: 0, failed: 0 };

  let userIds = orgUsers.map(u => u.id);
  if (excludeUserId) userIds = userIds.filter(id => id !== excludeUserId);
  if (userIds.length === 0) return { sent: 0, failed: 0 };

  const { data: subs } = await client
    .from("push_subscriptions")
    .select("*")
    .in("user_id", userIds);

  if (!subs || subs.length === 0) return { sent: 0, failed: 0 };

  const payload = JSON.stringify({
    title, body: message,
    icon: "/icon-192.png", badge: "/icon-badge.png",
    tag: tag || "shiftpro-" + Date.now(),
    data: { url: url || "/" },
  });

  let sent = 0, failed = 0;
  const stale: string[] = [];

  for (const sub of subs) {
    try {
      await wp.sendNotification(sub.subscription, payload);
      sent++;
    } catch (e: any) {
      failed++;
      if (e.statusCode === 410 || e.statusCode === 404) stale.push(sub.endpoint);
    }
  }

  if (stale.length > 0) await client.from("push_subscriptions").delete().in("endpoint", stale);
  return { sent, failed };
}

// Send push to all owners/managers in an org
export async function pushToManagers(orgId: string, title: string, message: string, url?: string, tag?: string) {
  const wp = await getWebPush();
  if (!wp) return { sent: 0, failed: 0 };

  const client = sb();

  const { data: managers } = await client
    .from("users")
    .select("id")
    .eq("org_id", orgId)
    .in("app_role", ["owner", "manager"]);

  if (!managers || managers.length === 0) return { sent: 0, failed: 0 };

  const { data: subs } = await client
    .from("push_subscriptions")
    .select("*")
    .in("user_id", managers.map(m => m.id));

  if (!subs || subs.length === 0) return { sent: 0, failed: 0 };

  const payload = JSON.stringify({
    title, body: message,
    icon: "/icon-192.png", badge: "/icon-badge.png",
    tag: tag || "shiftpro-" + Date.now(),
    data: { url: url || "/" },
  });

  let sent = 0, failed = 0;
  const stale: string[] = [];

  for (const sub of subs) {
    try {
      await wp.sendNotification(sub.subscription, payload);
      sent++;
    } catch (e: any) {
      failed++;
      if (e.statusCode === 410 || e.statusCode === 404) stale.push(sub.endpoint);
    }
  }

  if (stale.length > 0) await client.from("push_subscriptions").delete().in("endpoint", stale);
  return { sent, failed };
}
