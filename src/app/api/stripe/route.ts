export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

function getStripe() {
  const Stripe = require("stripe");
  return new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: "2026-03-25.dahlia" });
}

const sb = () => createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || "https://shiftpro.ai";

// Price IDs — create these in Stripe Dashboard first, then paste here
// Or we auto-create them below
const PLAN_CONFIG = {
  essentials: {
    name: "ShiftPro Essentials",
    unitAmount: 250, // $2.50 in cents
    description: "Scheduling, time clock, messaging — 1 location",
  },
  pro: {
    name: "ShiftPro Pro",
    unitAmount: 400, // $4.00 in cents
    description: "Unlimited locations, shift swaps, documents, geofencing",
  },
};

// Find or create a Stripe product + price for a plan
async function getOrCreatePrice(planId: string) {
  const config = PLAN_CONFIG[planId as keyof typeof PLAN_CONFIG];
  if (!config) throw new Error("Unknown plan: " + planId);
  const stripe = getStripe();

  // Search for existing product by metadata
  const products = await stripe.products.search({
    query: "metadata['shiftpro_plan']:'" + planId + "'",
  });

  if (products.data.length > 0) {
    // Find recurring price for this product
    const prices = await stripe.prices.list({
      product: products.data[0].id,
      type: "recurring",
      active: true,
      limit: 1,
    });
    if (prices.data.length > 0) return prices.data[0].id;
  }

  // Create product + price
  const product = await stripe.products.create({
    name: config.name,
    description: config.description,
    metadata: { shiftpro_plan: planId },
  });

  const price = await stripe.prices.create({
    product: product.id,
    unit_amount: config.unitAmount,
    currency: "usd",
    recurring: {
      interval: "month",
      usage_type: "licensed", // per-seat
    },
    metadata: { shiftpro_plan: planId },
  });

  return price.id;
}

// Find or create Stripe customer for an org
async function getOrCreateCustomer(orgId: string, email: string, orgName: string) {
  const client = sb();
  const stripe = getStripe();

  // Check if org already has a stripe_customer_id
  const { data: org } = await client
    .from("organizations")
    .select("stripe_customer_id")
    .eq("id", orgId)
    .single();

  if (org?.stripe_customer_id) {
    return org.stripe_customer_id;
  }

  // Create Stripe customer
  const customer = await stripe.customers.create({
    email,
    name: orgName,
    metadata: { shiftpro_org_id: orgId },
  });

  // Save to org
  await client
    .from("organizations")
    .update({ stripe_customer_id: customer.id })
    .eq("id", orgId);

  return customer.id;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const stripe = getStripe();

    // ── CREATE CHECKOUT SESSION ──
    if (body.action === "checkout") {
      const { orgId, email, orgName, planId, seats } = body;
      if (!orgId || !email || !planId) {
        return NextResponse.json({ error: "orgId, email, planId required" }, { status: 400 });
      }

      const priceId = await getOrCreatePrice(planId);
      const customerId = await getOrCreateCustomer(orgId, email, orgName || "Business");

      const session = await stripe.checkout.sessions.create({
        customer: customerId,
        mode: "subscription",
        payment_method_types: ["card"],
        line_items: [{
          price: priceId,
          quantity: seats || 1,
        }],
        subscription_data: {
          trial_period_days: 7,
          metadata: {
            shiftpro_org_id: orgId,
            shiftpro_plan: planId,
          },
        },
        success_url: BASE_URL + "/?billing=success",
        cancel_url: BASE_URL + "/?billing=cancelled",
        metadata: {
          shiftpro_org_id: orgId,
          shiftpro_plan: planId,
        },
      });

      return NextResponse.json({ url: session.url });
    }

    // ── CUSTOMER PORTAL (manage billing, cancel, update card) ──
    if (body.action === "portal") {
      const { orgId, email, orgName } = body;
      if (!orgId) return NextResponse.json({ error: "orgId required" }, { status: 400 });

      const customerId = await getOrCreateCustomer(orgId, email || "", orgName || "");

      const session = await stripe.billingPortal.sessions.create({
        customer: customerId,
        return_url: BASE_URL + "/",
      });

      return NextResponse.json({ url: session.url });
    }

    // ── GET SUBSCRIPTION STATUS ──
    if (body.action === "status") {
      const { orgId } = body;
      if (!orgId) return NextResponse.json({ error: "orgId required" }, { status: 400 });

      const client = sb();
      const { data: org } = await client
        .from("organizations")
        .select("stripe_customer_id, subscription_status, subscription_plan, subscription_seats, trial_ends_at")
        .eq("id", orgId)
        .single();

      if (!org?.stripe_customer_id) {
        return NextResponse.json({
          status: "none",
          plan: null,
          seats: 0,
          trialEndsAt: null,
        });
      }

      // Get latest subscription from Stripe
      const subs = await stripe.subscriptions.list({
        customer: org.stripe_customer_id,
        status: "all",
        limit: 1,
      });

      if (subs.data.length === 0) {
        return NextResponse.json({
          status: "none",
          plan: null,
          seats: 0,
          trialEndsAt: null,
        });
      }

      const sub = subs.data[0];
      const planMeta = sub.metadata?.shiftpro_plan || null;
      const seats = sub.items.data[0]?.quantity || 0;

      return NextResponse.json({
        status: sub.status,
        plan: planMeta,
        seats,
        trialEndsAt: sub.trial_end ? new Date(sub.trial_end * 1000).toISOString() : null,
      });
    }

    // ── UPDATE SEAT COUNT ──
    if (body.action === "update_seats") {
      const { orgId, seats } = body;
      if (!orgId || !seats) return NextResponse.json({ error: "orgId and seats required" }, { status: 400 });

      const client = sb();
      const { data: org } = await client
        .from("organizations")
        .select("stripe_customer_id")
        .eq("id", orgId)
        .single();

      if (!org?.stripe_customer_id) {
        return NextResponse.json({ error: "No billing setup" }, { status: 400 });
      }

      const subs = await stripe.subscriptions.list({
        customer: org.stripe_customer_id,
        status: "active",
        limit: 1,
      });

      if (subs.data.length === 0) {
        return NextResponse.json({ error: "No active subscription" }, { status: 400 });
      }

      const sub = subs.data[0];
      const itemId = sub.items.data[0].id;

      await stripe.subscriptionItems.update(itemId, { quantity: seats });

      return NextResponse.json({ ok: true, seats });
    }

    return NextResponse.json({ error: "Unknown action" }, { status: 400 });
  } catch (e: any) {
    console.error("[stripe]", e.message);
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
