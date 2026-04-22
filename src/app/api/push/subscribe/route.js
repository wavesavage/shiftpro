import { Redis } from '@upstash/redis';
import { NextResponse } from 'next/server';

const redis = new Redis({ url: process.env.KV_REST_API_URL, token: process.env.KV_REST_API_TOKEN });

export async function POST(req) {
  try {
    const { subscription, userId, orgId } = await req.json();
    if (!subscription || !userId || !orgId) return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
    const key = `push:${orgId}:${userId}`;
    await redis.set(key, JSON.stringify(subscription));
    await redis.sadd(`push:org:${orgId}`, key);
    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ error: 'Failed to save subscription' }, { status: 500 });
  }
}

export async function DELETE(req) {
  try {
    const { userId, orgId } = await req.json();
    const key = `push:${orgId}:${userId}`;
    await redis.del(key);
    await redis.srem(`push:org:${orgId}`, key);
    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ error: 'Failed to remove subscription' }, { status: 500 });
  }
}
