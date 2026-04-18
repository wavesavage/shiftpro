export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const sb = () => createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

function getStripe() {
  const Stripe = require("stripe");
  return new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: "2026-03-25.dahlia" });
}

export async function POST(req: NextRequest) {
  const body = await req.text();
  const sig = req.headers.get("stripe-signature") || "";
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET || "";
  const stripe = getStripe();

  let event: any;

  try {
    if (webhookSecret) {
      event = stripe.webhooks.constructEvent(body, sig, webhookSecret);
    } else {
      event = JSON.parse(body);
    }
  } catch (e: any) {
    console.error("[stripe webhook] signature verification failed:", e.message);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  const client = sb();

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object;
        const orgId = session.metadata?.shiftpro_org_id;
        const plan = session.metadata?.shiftpro_plan;
        if (orgId) {
          await client.from("organizations").update({
            stripe_customer_id: session.customer,
            subscription_status: "trialing",
            subscription_plan: plan || "essentials",
          }).eq("id", orgId);
          console.log("[stripe] checkout completed for org:", orgId, "plan:", plan);
        }
        break;
      }

      case "customer.subscription.created":
      case "customer.subscription.updated": {
        const sub = event.data.object;
        const orgId = sub.metadata?.shiftpro_org_id;
        if (orgId) {
          const seats = sub.items?.data?.[0]?.quantity || 0;
          await client.from("organizations").update({
            subscription_status: sub.status,
            subscription_plan: sub.metadata?.shiftpro_plan || null,
            subscription_seats: seats,
            trial_ends_at: sub.trial_end ? new Date(sub.trial_end * 1000).toISOString() : null,
          }).eq("id", orgId);
          console.log("[stripe] subscription", event.type, "org:", orgId, "status:", sub.status);
        }
        break;
      }

      case "customer.subscription.deleted": {
        const sub = event.data.object;
        const orgId = sub.metadata?.shiftpro_org_id;
        if (orgId) {
          await client.from("organizations").update({
            subscription_status: "canceled",
            subscription_plan: null,
            subscription_seats: 0,
          }).eq("id", orgId);
          console.log("[stripe] subscription canceled for org:", orgId);
        }
        break;
      }

      case "invoice.payment_succeeded": {
        console.log("[stripe] payment succeeded:", event.data.object.id);
        break;
      }

      case "invoice.payment_failed": {
        const invoice = event.data.object;
        const customerId = invoice.customer;
        const { data: org } = await client
          .from("organizations")
          .select("id")
          .eq("stripe_customer_id", customerId)
          .single();
        if (org) {
          await client.from("organizations").update({
            subscription_status: "past_due",
          }).eq("id", org.id);
          console.log("[stripe] payment failed for org:", org.id);
        }
        break;
      }

      default:
        console.log("[stripe webhook] unhandled event:", event.type);
    }
  } catch (e: any) {
    console.error("[stripe webhook] processing error:", e.message);
  }

  return NextResponse.json({ received: true });
}
