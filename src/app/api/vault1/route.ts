// src/app/api/vault1/route.ts
export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { svcClient } from "@/lib/auth";

const NO_CACHE = { headers: { "Cache-Control": "no-store, no-cache, must-revalidate" } };

// GET — Load encrypted vault data by vault_id or owner_hash
export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const vaultId = url.searchParams.get("vault_id");
    const ownerHash = url.searchParams.get("owner");

    if (!vaultId && !ownerHash) {
      return NextResponse.json({ error: "Invalid request" }, { status: 400, ...NO_CACHE });
    }

    let query = svcClient().from("vault1_store").select("encrypted_data, owner_hash, updated_at, vault_id");

    if (vaultId) {
      query = query.eq("vault_id", vaultId);
    } else {
      query = query.eq("owner_hash", ownerHash);
    }

    const { data, error } = await query.single();

    if (error && error.code === "PGRST116") {
      return NextResponse.json({ data: null }, NO_CACHE);
    }
    if (error) {
      return NextResponse.json({ error: "Load failed" }, { status: 500, ...NO_CACHE });
    }

    return NextResponse.json({
      data: data.encrypted_data,
      ownerHash: data.owner_hash,
      updatedAt: data.updated_at,
      vaultId: data.vault_id,
    }, NO_CACHE);
  } catch (e) {
    return NextResponse.json({ error: "Server error" }, { status: 500, ...NO_CACHE });
  }
}

// POST — Save encrypted vault data (create or update)
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const vaultId = body.vault_id;
    const ownerHash = body.owner;
    const encryptedData = body.data;

    if (!ownerHash || !encryptedData) {
      return NextResponse.json({ error: "Invalid request" }, { status: 400, ...NO_CACHE });
    }

    if (vaultId) {
      // Upsert by vault_id
      const { error } = await svcClient()
        .from("vault1_store")
        .upsert(
          {
            vault_id: vaultId,
            owner_hash: ownerHash,
            encrypted_data: encryptedData,
            updated_at: new Date().toISOString(),
          },
          { onConflict: "vault_id" }
        );

      if (error) {
        return NextResponse.json({ error: "Save failed" }, { status: 500, ...NO_CACHE });
      }
    } else {
      // Legacy: upsert by owner_hash
      const { error } = await svcClient()
        .from("vault1_store")
        .upsert(
          {
            owner_hash: ownerHash,
            encrypted_data: encryptedData,
            updated_at: new Date().toISOString(),
          },
          { onConflict: "owner_hash" }
        );

      if (error) {
        return NextResponse.json({ error: "Save failed" }, { status: 500, ...NO_CACHE });
      }
    }

    return NextResponse.json({ success: true }, NO_CACHE);
  } catch (e) {
    return NextResponse.json({ error: "Server error" }, { status: 500, ...NO_CACHE });
  }
}

// PUT — Change password (update hash + re-encrypted data)
export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const vaultId = body.vault_id;
    const oldHash = body.old_hash;
    const newHash = body.new_hash;
    const encryptedData = body.data;

    if (!vaultId || !oldHash || !newHash || !encryptedData) {
      return NextResponse.json({ error: "Invalid request" }, { status: 400, ...NO_CACHE });
    }

    // Verify old hash matches
    const { data: existing, error: fetchErr } = await svcClient()
      .from("vault1_store")
      .select("owner_hash")
      .eq("vault_id", vaultId)
      .single();

    if (fetchErr || !existing) {
      return NextResponse.json({ error: "Vault not found" }, { status: 404, ...NO_CACHE });
    }

    if (existing.owner_hash !== oldHash) {
      return NextResponse.json({ error: "Current password incorrect" }, { status: 403, ...NO_CACHE });
    }

    // Update with new hash and re-encrypted data
    const { error } = await svcClient()
      .from("vault1_store")
      .update({
        owner_hash: newHash,
        encrypted_data: encryptedData,
        updated_at: new Date().toISOString(),
      })
      .eq("vault_id", vaultId);

    if (error) {
      return NextResponse.json({ error: "Update failed" }, { status: 500, ...NO_CACHE });
    }

    return NextResponse.json({ success: true }, NO_CACHE);
  } catch (e) {
    return NextResponse.json({ error: "Server error" }, { status: 500, ...NO_CACHE });
  }
}
