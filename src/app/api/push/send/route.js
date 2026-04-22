import { Redis } from '@upstash/redis';
import webPush from 'web-push';
import { NextResponse } from 'next/server';

const redis = new Redis({ url: process.env.KV_REST_API_URL, token: process.env.KV_REST_API_TOKEN });

webPush.setVapidDetails(
  process.env.VAPID_MAILTO,
  process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY,
  process.env.VAPID_PRIVATE_KEY
);

export async function POST(req) {
  try {
    const { orgId, userId, title, body, url, tag } = await req.json();
    if (!orgId || !title) return NextResponse.json({ error: 'Missing orgId or title' }, { status: 400 });

    const payload = JSON.stringify({ title, body, url, tag });
    const results = [];

    if (userId) {
      const key = `push:${orgId}:${userId}`;
      const sub = await redis.get(key);
      if (sub) {
        try {
          await webPush.sendNotification(typeof sub === 'string' ? JSON.parse(sub) : sub, payload);
          results.push({ userId, status: 'sent' });
        } catch (err) {
          if (err.statusCode === 410) { await redis.del(key); await redis.srem(`push:org:${orgId}`, key); }
          results.push({ userId, status: 'failed', error: err.message });
        }
      }
    } else {
      const keys = await redis.smembers(`push:org:${orgId}`);
      for (const key of keys) {
        const sub = await redis.get(key);
        if (!sub) continue;
        try {
          await webPush.sendNotification(typeof sub === 'string' ? JSON.parse(sub) : sub, payload);
          results.push({ key, status: 'sent' });
        } catch (err) {
          if (err.statusCode === 410) { await redis.del(key); await redis.srem(`push:org:${orgId}`, key); }
          results.push({ key, status: 'failed', error: err.message });
        }
      }
    }

    return NextResponse.json({ success: true, results });
  } catch (err) {
    return NextResponse.json({ error: 'Failed to send notification' }, { status: 500 });
  }
}
