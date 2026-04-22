// src/app/api/stripe/webhook/route.ts
export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { emailUser } from "@/lib/email-util";

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
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  // ─────────────────────────────────────────────────────────────
  // SECURITY: signature verification is MANDATORY.
  // If STRIPE_WEBHOOK_SECRET is not set, fail closed (never fall through
  // to unverified JSON parsing — an attacker could forge events).
  // ─────────────────────────────────────────────────────────────
  if (!webhookSecret) {
    console.error("[stripe webhook] STRIPE_WEBHOOK_SECRET not configured — refusing to process");
    return NextResponse.json({ error: "Webhook misconfigured" }, { status: 500 });
  }

  const stripe = getStripe();
  let event: any;

  try {
    event = stripe.webhooks.constructEvent(body, sig, webhookSecret);
  } catch (e: any) {
    console.error("[stripe webhook] signature verification failed:", e.message);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  const client = sb();

  // ─────────────────────────────────────────────────────────────
  // PROCESS EVENT — on any failure, return 500 so Stripe retries.
  // ─────────────────────────────────────────────────────────────
  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object;
        const orgId = session.metadata?.shiftpro_org_id;
        const plan = session.metadata?.shiftpro_plan;
        if (!orgId) {
          console.warn("[stripe] checkout.session.completed missing shiftpro_org_id metadata");
          break;
        }
        const { error } = await client.from("organizations").update({
          stripe_customer_id: session.customer,
          subscription_status: "trialing",
          subscription_plan: plan || "essentials",
        }).eq("id", orgId);
        if (error) throw new Error("DB update failed: " + error.message);
        console.log("[stripe] checkout completed for org:", orgId, "plan:", plan);
        break;
      }

      case "customer.subscription.created":
      case "customer.subscription.updated": {
        const sub = event.data.object;
        const orgId = sub.metadata?.shiftpro_org_id;
        if (!orgId) break;
        const seats = sub.items?.data?.[0]?.quantity || 0;
        const { error } = await client.from("organizations").update({
          subscription_status: sub.status,
          subscription_plan: sub.metadata?.shiftpro_plan || null,
          subscription_seats: seats,
          trial_ends_at: sub.trial_end ? new Date(sub.trial_end * 1000).toISOString() : null,
        }).eq("id", orgId);
        if (error) throw new Error("DB update failed: " + error.message);
        console.log("[stripe] subscription", event.type, "org:", orgId, "status:", sub.status);
        break;
      }

      case "customer.subscription.trial_will_end": {
        // Fires 3 days before trial ends — send warning email
        const sub = event.data.object;
        const orgId = sub.metadata?.shiftpro_org_id;
        if (!orgId) break;
        const { data: org } = await client.from("organizations")
          .select("id, name").eq("id", orgId).single();
        if (!org) break;
        // Find the org owner and send a heads-up
        const { data: owner } = await client.from("users")
          .select("id, first_name, email")
          .eq("org_id", orgId)
          .eq("app_role", "owner")
          .limit(1)
          .single();
        if (owner) {
          await emailUser(
            owner.id,
            "Your ShiftPro Trial Ends Soon",
            "Trial Ending in 3 Days",
            "Hi " + (owner.first_name || "there") + ",<br><br>Your ShiftPro trial for <strong>" + (org.name || "your organization") + "</strong> ends in 3 days. Your card on file will be charged automatically — no action needed to continue.<br><br>Want to make changes? Open Billing in your ShiftPro settings.",
            "Open ShiftPro",
            "https://shiftpro.ai"
          ).catch((e: any) => console.warn("[stripe trial_will_end email]", e?.message));
        }
        break;
      }

      case "customer.subscription.deleted": {
        const sub = event.data.object;
        const orgId = sub.metadata?.shiftpro_org_id;
        if (!orgId) break;
        const { error } = await client.from("organizations").update({
          subscription_status: "canceled",
          subscription_plan: null,
          subscription_seats: 0,
        }).eq("id", orgId);
        if (error) throw new Error("DB update failed: " + error.message);
        console.log("[stripe] subscription canceled for org:", orgId);
        break;
      }

      case "invoice.payment_succeeded": {
        console.log("[stripe] payment succeeded:", event.data.object.id);
        break;
      }

      case "invoice.payment_failed": {
        const invoice = event.data.object;
        const customerId = invoice.customer;
        const { data: org, error } = await client
          .from("organizations")
          .select("id")
          .eq("stripe_customer_id", customerId)
          .single();
        if (error || !org) {
          console.warn("[stripe payment_failed] org not found for customer:", customerId);
          break;
        }
        const { error: updErr } = await client.from("organizations").update({
          subscription_status: "past_due",
        }).eq("id", org.id);
        if (updErr) throw new Error("DB update failed: " + updErr.message);
        console.log("[stripe] payment failed for org:", org.id);
        break;
      }

      default:
        console.log("[stripe webhook] unhandled event:", event.type);
    }

    return NextResponse.json({ received: true });
  } catch (e: any) {
    // CRITICAL: Return 500 so Stripe retries the webhook.
    // Previous version silently returned 200 and lost the event.
    console.error("[stripe webhook] processing error:", e?.message || e);
    return NextResponse.json(
      { error: "Processing failed, retry requested" },
      { status: 500 }
    );
  }
}
