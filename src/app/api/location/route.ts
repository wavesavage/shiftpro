// src/app/api/location/route.ts
export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { requireAuthOr401, requireOwner, svcClient } from "@/lib/auth";

const NO_CACHE = { headers: { "Cache-Control": "no-store, no-cache, must-revalidate" } };

// ─────────────────────────────────────────────────────────────
// GEOCODING — uses OpenStreetMap Nominatim (free, no API key)
// Fallback: if Nominatim fails or times out, location is still created
// without coordinates. Operator can add them later via edit UI.
// ─────────────────────────────────────────────────────────────
async function geocode(address: string): Promise<{ lat: number; lng: number } | null> {
  if (!address || !address.trim()) return null;
  try {
    const url = "https://nominatim.openstreetmap.org/search?format=json&limit=1&q=" + encodeURIComponent(address.trim());
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);
    const res = await fetch(url, {
      headers: {
        // Nominatim usage policy requires a real User-Agent identifying the app
        "User-Agent": "ShiftPro/1.0 (support@shiftpro.ai)",
        "Accept": "application/json",
      },
      signal: controller.signal,
    });
    clearTimeout(timeoutId);
    if (!res.ok) {
      console.warn("[geocode] HTTP", res.status);
      return null;
    }
    const data = await res.json();
    if (!Array.isArray(data) || data.length === 0) return null;
    const { lat, lon } = data[0];
    const latNum = parseFloat(lat);
    const lngNum = parseFloat(lon);
    if (isNaN(latNum) || isNaN(lngNum)) return null;
    return { lat: latNum, lng: lngNum };
  } catch (e: any) {
    console.warn("[geocode] error:", e?.message || e);
    return null;
  }
}

// ─────────────────────────────────────────────────────────────
// GET — list locations for an org
// ─────────────────────────────────────────────────────────────
export async function GET(req: NextRequest) {
  const authed = await requireAuthOr401(req);
  if (authed instanceof NextResponse) return authed;

  const orgId = req.nextUrl.searchParams.get("orgId");
  if (!orgId) return NextResponse.json({ error: "orgId required" }, { status: 400 });
  if (authed.orgId !== orgId) {
    return NextResponse.json({ error: "Different organization" }, { status: 403 });
  }

  const client = svcClient();
  const { data, error } = await client
    .from("locations")
    .select("*")
    .eq("org_id", orgId)
    .order("created_at", { ascending: true });

  if (error) {
    console.warn("[locations GET]", error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ locations: data || [] }, NO_CACHE);
}

// ─────────────────────────────────────────────────────────────
// POST — create a new location (geocodes address if provided)
// Owner-only.
// ─────────────────────────────────────────────────────────────
export async function POST(req: NextRequest) {
  const authed = await requireAuthOr401(req);
  if (authed instanceof NextResponse) return authed;

  try {
    requireOwner(authed);
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: e.status || 403 });
  }

  try {
    const body = await req.json();
    const { orgId, name, address, timezone, geofence_radius_m } = body;

    if (!orgId || !name) {
      return NextResponse.json({ error: "orgId and name required" }, { status: 400 });
    }
    if (authed.orgId !== orgId) {
      return NextResponse.json({ error: "Different organization" }, { status: 403 });
    }

    // Attempt geocoding if address provided (non-blocking on failure)
    let coords: { lat: number; lng: number } | null = null;
    if (address && address.trim()) {
      coords = await geocode(address.trim());
    }

    const client = svcClient();
    const { data: loc, error } = await client
      .from("locations")
      .insert({
        org_id: orgId,
        name: name.trim(),
        address: (address || "").trim() || null,
        timezone: timezone || "America/Los_Angeles",
        lat: coords?.lat ?? null,
        lng: coords?.lng ?? null,
        geofence_radius_m: geofence_radius_m ?? 150,
      })
      .select()
      .single();

    if (error) {
      console.warn("[locations POST]", error.message);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      location: loc,
      geocoded: !!coords,
      message: coords
        ? "Location created with GPS coordinates from address."
        : address
          ? "Location created — address couldn't be geocoded. You can set coordinates manually."
          : "Location created. Add an address to enable GPS geofencing.",
    });
  } catch (e: any) {
    console.error("[locations POST]", e?.message || e);
    return NextResponse.json({ error: e?.message || "Server error" }, { status: 500 });
  }
}

// ─────────────────────────────────────────────────────────────
// PATCH — update an existing location (re-geocodes if address changed)
// Owner-only.
// ─────────────────────────────────────────────────────────────
export async function PATCH(req: NextRequest) {
  const authed = await requireAuthOr401(req);
  if (authed instanceof NextResponse) return authed;

  try {
    requireOwner(authed);
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: e.status || 403 });
  }

  try {
    const body = await req.json();
    const { locationId, name, address, timezone, geofence_radius_m, lat, lng, regeocode } = body;

    if (!locationId) {
      return NextResponse.json({ error: "locationId required" }, { status: 400 });
    }

    const client = svcClient();

    // Verify this location belongs to the authed user's org
    const { data: existing, error: fetchErr } = await client
      .from("locations")
      .select("id, org_id, address")
      .eq("id", locationId)
      .single();

    if (fetchErr || !existing) {
      return NextResponse.json({ error: "Location not found" }, { status: 404 });
    }
    if (existing.org_id !== authed.orgId) {
      return NextResponse.json({ error: "Different organization" }, { status: 403 });
    }

    const updates: any = {};
    if (name !== undefined) updates.name = name.trim();
    if (timezone !== undefined) updates.timezone = timezone;
    if (geofence_radius_m !== undefined) updates.geofence_radius_m = geofence_radius_m;

    // Handle coordinates:
    // - If caller sends explicit lat/lng, use those (manual override)
    // - Else if address changed OR caller explicitly requested regeocode, try geocoding
    // - Else leave coords alone
    if (lat !== undefined && lng !== undefined) {
      updates.lat = lat;
      updates.lng = lng;
    }

    let geocoded = false;
    if (address !== undefined) {
      updates.address = address.trim() || null;
      const addressChanged = (address || "").trim() !== (existing.address || "").trim();
      if ((addressChanged || regeocode) && address && address.trim() && lat === undefined) {
        const coords = await geocode(address.trim());
        if (coords) {
          updates.lat = coords.lat;
          updates.lng = coords.lng;
          geocoded = true;
        }
      }
    }

    if (Object.keys(updates).length === 0) {
      return NextResponse.json({ error: "No fields to update" }, { status: 400 });
    }

    const { data: updated, error } = await client
      .from("locations")
      .update(updates)
      .eq("id", locationId)
      .select()
      .single();

    if (error) {
      console.warn("[locations PATCH]", error.message);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ location: updated, geocoded });
  } catch (e: any) {
    console.error("[locations PATCH]", e?.message || e);
    return NextResponse.json({ error: e?.message || "Server error" }, { status: 500 });
  }
}

// ─────────────────────────────────────────────────────────────
// DELETE — archive a location
// Owner-only. Blocked if there are active shifts on this location.
// ─────────────────────────────────────────────────────────────
export async function DELETE(req: NextRequest) {
  const authed = await requireAuthOr401(req);
  if (authed instanceof NextResponse) return authed;

  try {
    requireOwner(authed);
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: e.status || 403 });
  }

  const locationId = req.nextUrl.searchParams.get("locationId");
  if (!locationId) return NextResponse.json({ error: "locationId required" }, { status: 400 });

  const client = svcClient();

  // Verify ownership
  const { data: existing } = await client
    .from("locations")
    .select("id, org_id")
    .eq("id", locationId)
    .single();

  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (existing.org_id !== authed.orgId) {
    return NextResponse.json({ error: "Different organization" }, { status: 403 });
  }

  // Check for active shifts
  const today = new Date().toISOString().split("T")[0];
  const { count } = await client
    .from("shifts")
    .select("*", { count: "exact", head: true })
    .eq("location_id", locationId)
    .gte("shift_date", today)
    .in("status", ["scheduled", "published", "confirmed"]);

  if ((count || 0) > 0) {
    return NextResponse.json({
      error: "Cannot delete: location has " + count + " active or upcoming shift(s). Move or delete those shifts first."
    }, { status: 400 });
  }

  const { error } = await client.from("locations").delete().eq("id", locationId);
  if (error) {
    console.warn("[locations DELETE]", error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
