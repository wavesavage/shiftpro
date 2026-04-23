// src/app/api/vault1/route.ts
export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { svcClient } from "@/lib/auth";

const NO_CACHE = { headers: { "Cache-Control": "no-store, no-cache, must-revalidate" } };

// GET — Load encrypted vault data by owner hash
export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const ownerHash = url.searchParams.get("owner");
    if (!ownerHash || ownerHash.length !== 64) {
      return NextResponse.json({ error: "Invalid request" }, { status: 400, ...NO_CACHE });
    }

    const { data, error } = await svcClient
      .from("vault1_store")
      .select("encrypted_data, updated_at")
      .eq("owner_hash", ownerHash)
      .single();

    if (error && error.code === "PGRST116") {
      return NextResponse.json({ data: null }, NO_CACHE);
    }
    if (error) {
      return NextResponse.json({ error: "Load failed" }, { status: 500, ...NO_CACHE });
    }

    return NextResponse.json({ data: data.encrypted_data, updatedAt: data.updated_at }, NO_CACHE);
  } catch (e) {
    return NextResponse.json({ error: "Server error" }, { status: 500, ...NO_CACHE });
  }
}

// POST — Save encrypted vault data
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const ownerHash = body.owner;
    const encryptedData = body.data;

    if (!ownerHash || ownerHash.length !== 64 || !encryptedData) {
      return NextResponse.json({ error: "Invalid request" }, { status: 400, ...NO_CACHE });
    }

    const { error } = await svcClient
      .from("vault1_store")
      .upsert(
        { owner_hash: ownerHash, encrypted_data: encryptedData, updated_at: new Date().toISOString() },
        { onConflict: "owner_hash" }
      );

    if (error) {
      return NextResponse.json({ error: "Save failed" }, { status: 500, ...NO_CACHE });
    }

    return NextResponse.json({ success: true }, NO_CACHE);
  } catch (e) {
    return NextResponse.json({ error: "Server error" }, { status: 500, ...NO_CACHE });
  }
}
