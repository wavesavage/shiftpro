import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

var supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// GET — Load encrypted vault data by owner hash
export async function GET(request) {
  try {
    var url = new URL(request.url);
    var ownerHash = url.searchParams.get('owner');
    if (!ownerHash || ownerHash.length !== 64) {
      return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
    }

    var result = await supabase
      .from('vault1_store')
      .select('encrypted_data, updated_at')
      .eq('owner_hash', ownerHash)
      .single();

    if (result.error && result.error.code === 'PGRST116') {
      // No data yet — first time user
      return NextResponse.json({ data: null });
    }
    if (result.error) {
      return NextResponse.json({ error: 'Load failed' }, { status: 500 });
    }

    return NextResponse.json({ data: result.data.encrypted_data, updatedAt: result.data.updated_at });
  } catch (e) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

// POST — Save encrypted vault data
export async function POST(request) {
  try {
    var body = await request.json();
    var ownerHash = body.owner;
    var encryptedData = body.data;

    if (!ownerHash || ownerHash.length !== 64 || !encryptedData) {
      return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
    }

    // Upsert — create or update
    var result = await supabase
      .from('vault1_store')
      .upsert(
        { owner_hash: ownerHash, encrypted_data: encryptedData, updated_at: new Date().toISOString() },
        { onConflict: 'owner_hash' }
      );

    if (result.error) {
      return NextResponse.json({ error: 'Save failed' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (e) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
