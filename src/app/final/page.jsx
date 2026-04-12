"use client";
import React, { useState } from "react";

const FONTS = `@import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700;800;900&family=JetBrains+Mono:wght@400;500;600&display=swap');`;

const C = {
  bg: "#0a0a0f",
  bg2: "#12121a",
  bg3: "#1a1a28",
  card: "#16161f",
  amber: "#e07b00",
  amberL: "#f5a623",
  purple: "#7c3aed",
  indigo: "#6366f1",
  cyan: "#06b6d4",
  green: "#10b981",
  red: "#ef4444",
  text: "#f0f0f5",
  textD: "#9ca3af",
  textF: "#6b7280",
  border: "rgba(255,255,255,0.08)",
  sans: "'Outfit',sans-serif",
  mono: "'JetBrains Mono',monospace",
};

const plans = [
  {
    id: "starter",
    name: "Starter",
    price: 0,
    period: "forever",
    desc: "Try ShiftPro with 1 location",
    color: C.textD,
    features: [
      "1 location",
      "Up to 5 employees",
      "Basic scheduling",
      "Employee portal",
      "Clock in / out",
      "Messages",
    ],
    cta: "Start Free",
    popular: false,
  },
  {
    id: "pro",
    name: "Pro",
    price: 39.99,
    period: "/mo",
    desc: "Everything you need to run your team",
    color: C.amber,
    features: [
      "1 location included",
      "Unlimited employees",
      "Advanced scheduling + lunch breaks",
      "Payroll tracking & exports",
      "Employee documents & onboarding",
      "Staff messaging center",
      "Swap & time-off requests",
      "Priority support",
    ],
    cta: "Start 14-Day Free Trial",
    popular: true,
    addon: "+$19.99/mo per additional location",
  },
  {
    id: "enterprise",
    name: "Enterprise",
    price: null,
    period: "",
    desc: "For multi-location operations",
    color: C.purple,
    features: [
      "Unlimited locations",
      "Unlimited employees",
      "Everything in Pro",
      "AI Intelligence suite",
      "Camera integration",
      "QuickBooks sync",
      "Custom integrations",
      "Dedicated account manager",
    ],
    cta: "Contact Sales",
    popular: false,
  },
];

function Logo() {
  return (
    <div style={{display:"flex",alignItems:"center",gap:10}}>
      <div style={{width:36,height:36,borderRadius:10,background:"linear-gradient(135deg,#e07b00,#c96800)",display:"flex",alignItems:"center",justifyContent:"center"}}>
        <span style={{fontFamily:C.mono,fontWeight:800,fontSize:14,color:"#fff"}}>S</span>
      </div>
      <div>
        <div style={{fontFamily:C.sans,fontWeight:800,fontSize:18,color:C.text,letterSpacing:"-0.5px"}}>
          ShiftPro<span style={{color:C.amber}}>.ai</span>
        </div>
        <div style={{fontFamily:C.mono,fontSize:7,color:C.amber,letterSpacing:"3px",textTransform:"uppercase",marginTop:-2}}>Workforce Pro</div>
      </div>
    </div>
  );
}

function PricingCard({ plan, onSelect }) {
  const [hover, setHover] = useState(false);
  return (
    <div
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        position: "relative",
        background: plan.popular
          ? "linear-gradient(165deg, #1a1a28 0%, #1f1520 50%, #1a1828 100%)"
          : C.card,
        border: plan.popular
          ? "1.5px solid " + C.amber + "60"
          : "1px solid " + C.border,
        borderRadius: 20,
        padding: "32px 28px",
        display: "flex",
        flexDirection: "column",
        transform: hover ? "translateY(-4px)" : "none",
        transition: "all 0.25s ease",
        boxShadow: plan.popular
          ? "0 8px 40px rgba(224,123,0,0.15)"
          : hover
          ? "0 8px 30px rgba(0,0,0,0.3)"
          : "none",
      }}
    >
      {plan.popular && (
        <div
          style={{
            position: "absolute",
            top: -12,
            left: "50%",
            transform: "translateX(-50%)",
            background: "linear-gradient(135deg,#e07b00,#c96800)",
            padding: "4px 16px",
            borderRadius: 20,
            fontFamily: C.mono,
            fontSize: 9,
            fontWeight: 700,
            color: "#fff",
            letterSpacing: "2px",
            textTransform: "uppercase",
            whiteSpace: "nowrap",
          }}
        >
          Most Popular
        </div>
      )}
      <div
        style={{
          fontFamily: C.mono,
          fontSize: 9,
          color: plan.color,
          letterSpacing: "2.5px",
          textTransform: "uppercase",
          marginBottom: 8,
        }}
      >
        {plan.name}
      </div>
      <div style={{ marginBottom: 6 }}>
        {plan.price === null ? (
          <span
            style={{
              fontFamily: C.sans,
              fontWeight: 900,
              fontSize: 32,
              color: C.text,
            }}
          >
            Custom
          </span>
        ) : plan.price === 0 ? (
          <span
            style={{
              fontFamily: C.sans,
              fontWeight: 900,
              fontSize: 32,
              color: C.text,
            }}
          >
            Free
          </span>
        ) : (
          <span>
            <span
              style={{
                fontFamily: C.sans,
                fontWeight: 900,
                fontSize: 32,
                color: C.text,
              }}
            >
              ${plan.price}
            </span>
            <span
              style={{
                fontFamily: C.mono,
                fontSize: 12,
                color: C.textD,
              }}
            >
              {plan.period}
            </span>
          </span>
        )}
      </div>
      <div
        style={{
          fontFamily: C.sans,
          fontSize: 13,
          color: C.textD,
          lineHeight: 1.5,
          marginBottom: 20,
          minHeight: 40,
        }}
      >
        {plan.desc}
      </div>
      <div style={{ flex: 1, marginBottom: 24 }}>
        {plan.features.map((f, i) => (
          <div
            key={i}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              padding: "6px 0",
              fontFamily: C.sans,
              fontSize: 13,
              color: C.text,
            }}
          >
            <span style={{ color: plan.color, fontSize: 12, flexShrink: 0 }}>
              ✓
            </span>
            {f}
          </div>
        ))}
        {plan.addon && (
          <div
            style={{
              marginTop: 10,
              padding: "8px 10px",
              background: "rgba(224,123,0,0.08)",
              border: "1px solid rgba(224,123,0,0.15)",
              borderRadius: 8,
              fontFamily: C.mono,
              fontSize: 10,
              color: C.amber,
            }}
          >
            {plan.addon}
          </div>
        )}
      </div>
      <button
        onClick={() => onSelect(plan)}
        style={{
          width: "100%",
          padding: "14px",
          background: plan.popular
            ? "linear-gradient(135deg,#e07b00,#c96800)"
            : "rgba(255,255,255,0.06)",
          border: plan.popular ? "none" : "1px solid " + C.border,
          borderRadius: 12,
          fontFamily: C.sans,
          fontWeight: 700,
          fontSize: 14,
          color: plan.popular ? "#fff" : C.text,
          cursor: "pointer",
          transition: "all 0.2s",
        }}
      >
        {plan.cta}
      </button>
    </div>
  );
}

function SignupForm({ plan, onBack }) {
  const [form, setForm] = useState({
    businessName: "",
    firstName: "",
    lastName: "",
    email: "",
    password: "",
  });
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");
  const [done, setDone] = useState(false);

  const handleSignup = async () => {
    if (!form.businessName.trim() || !form.firstName.trim() || !form.email.trim() || !form.password.trim()) {
      setMsg("Please fill in all required fields.");
      return;
    }
    if (form.password.length < 8) {
      setMsg("Password must be at least 8 characters.");
      return;
    }
    setBusy(true);
    setMsg("");
    try {
      const { createClient } = await import("@supabase/supabase-js");
      const sb = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
      );
      const { data, error } = await sb.auth.signUp({
        email: form.email.trim(),
        password: form.password,
      });
      if (error) throw error;
      // Create org + user profile via API
      const r = await fetch("/api/org", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          _action: "setup",
          userId: data.user?.id,
          email: form.email.trim(),
          firstName: form.firstName.trim(),
          lastName: form.lastName.trim(),
          businessName: form.businessName.trim(),
          plan: plan.id,
        }),
      });
      if (!r.ok) {
        const d = await r.json();
        throw new Error(d.error || "Setup failed");
      }
      setDone(true);
    } catch (e) {
      setMsg(e.message || "Something went wrong. Please try again.");
    }
    setBusy(false);
  };

  if (done) {
    return (
      <div style={{ textAlign: "center", padding: "60px 20px" }}>
        <div style={{ fontSize: 64, marginBottom: 20 }}>🎉</div>
        <div style={{ fontFamily: C.sans, fontWeight: 800, fontSize: 28, color: C.text, marginBottom: 12 }}>
          Welcome to ShiftPro!
        </div>
        <div style={{ fontFamily: C.sans, fontSize: 15, color: C.textD, marginBottom: 8, lineHeight: 1.6 }}>
          Check your email to confirm your account, then sign in to start managing your team.
        </div>
        <div style={{ fontFamily: C.mono, fontSize: 11, color: C.amber, marginBottom: 28 }}>
          Plan: {plan.name} {plan.price > 0 ? `— $${plan.price}${plan.period}` : "— Free"}
        </div>
        <a
          href="/"
          style={{
            display: "inline-block",
            padding: "14px 32px",
            background: "linear-gradient(135deg,#e07b00,#c96800)",
            borderRadius: 12,
            fontFamily: C.sans,
            fontWeight: 700,
            fontSize: 15,
            color: "#fff",
            textDecoration: "none",
          }}
        >
          Go to Sign In →
        </a>
      </div>
    );
  }

  const fieldStyle = {
    width: "100%",
    padding: "12px 14px",
    background: C.bg3,
    border: "1px solid " + C.border,
    borderRadius: 10,
    fontFamily: C.sans,
    fontSize: 14,
    color: C.text,
    outline: "none",
    boxSizing: "border-box",
  };
  const labelStyle = {
    fontFamily: C.mono,
    fontSize: 9,
    color: C.textF,
    letterSpacing: "1.5px",
    display: "block",
    marginBottom: 6,
    textTransform: "uppercase",
  };

  return (
    <div style={{ maxWidth: 440, margin: "0 auto" }}>
      <button
        onClick={onBack}
        style={{
          background: "none",
          border: "none",
          fontFamily: C.sans,
          fontSize: 13,
          color: C.textD,
          cursor: "pointer",
          marginBottom: 20,
          padding: 0,
        }}
      >
        ← Back to pricing
      </button>
      <div style={{ fontFamily: C.sans, fontWeight: 800, fontSize: 28, color: C.text, marginBottom: 4 }}>
        Create your account
      </div>
      <div style={{ fontFamily: C.sans, fontSize: 14, color: C.textD, marginBottom: 6 }}>
        {plan.name} plan {plan.price > 0 ? `— $${plan.price}${plan.period}` : "— Free"}
      </div>
      {plan.price > 0 && (
        <div style={{ fontFamily: C.mono, fontSize: 10, color: C.green, marginBottom: 24 }}>
          ✓ 14-day free trial — no card required
        </div>
      )}
      <div style={{ background: C.card, border: "1px solid " + C.border, borderRadius: 16, padding: "28px" }}>
        <div style={{ marginBottom: 14 }}>
          <label style={labelStyle}>Business Name *</label>
          <input
            value={form.businessName}
            onChange={(e) => setForm((p) => ({ ...p, businessName: e.target.value }))}
            placeholder="e.g. Sea Lion Dockside Bar"
            style={fieldStyle}
          />
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 14 }}>
          <div>
            <label style={labelStyle}>First Name *</label>
            <input
              value={form.firstName}
              onChange={(e) => setForm((p) => ({ ...p, firstName: e.target.value }))}
              placeholder="First"
              style={fieldStyle}
            />
          </div>
          <div>
            <label style={labelStyle}>Last Name</label>
            <input
              value={form.lastName}
              onChange={(e) => setForm((p) => ({ ...p, lastName: e.target.value }))}
              placeholder="Last"
              style={fieldStyle}
            />
          </div>
        </div>
        <div style={{ marginBottom: 14 }}>
          <label style={labelStyle}>Email *</label>
          <input
            value={form.email}
            onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
            placeholder="you@business.com"
            type="email"
            style={fieldStyle}
          />
        </div>
        <div style={{ marginBottom: 18 }}>
          <label style={labelStyle}>Password *</label>
          <input
            value={form.password}
            onChange={(e) => setForm((p) => ({ ...p, password: e.target.value }))}
            placeholder="Min 8 characters"
            type="password"
            style={fieldStyle}
          />
        </div>
        {msg && (
          <div
            style={{
              fontFamily: C.sans,
              fontSize: 13,
              color: C.red,
              padding: "8px 12px",
              background: "rgba(239,68,68,0.1)",
              borderRadius: 8,
              marginBottom: 14,
            }}
          >
            {msg}
          </div>
        )}
        <button
          disabled={busy}
          onClick={handleSignup}
          style={{
            width: "100%",
            padding: "14px",
            background: busy ? "rgba(224,123,0,0.4)" : "linear-gradient(135deg,#e07b00,#c96800)",
            border: "none",
            borderRadius: 12,
            fontFamily: C.sans,
            fontWeight: 700,
            fontSize: 15,
            color: "#fff",
            cursor: busy ? "not-allowed" : "pointer",
            boxShadow: "0 4px 20px rgba(224,123,0,0.3)",
          }}
        >
          {busy ? "Creating account…" : "Create Account & Start Free"}
        </button>
        <div style={{ fontFamily: C.mono, fontSize: 9, color: C.textF, textAlign: "center", marginTop: 12, lineHeight: 1.6 }}>
          By creating an account you agree to our{" "}
          <a href="/terms" style={{ color: C.amber, textDecoration: "none" }}>Terms of Service</a> and{" "}
          <a href="/privacy" style={{ color: C.amber, textDecoration: "none" }}>Privacy Policy</a>.
        </div>
      </div>
      <div style={{ textAlign: "center", marginTop: 20 }}>
        <span style={{ fontFamily: C.sans, fontSize: 13, color: C.textD }}>Already have an account? </span>
        <a href="/" style={{ fontFamily: C.sans, fontSize: 13, color: C.amber, fontWeight: 600, textDecoration: "none" }}>
          Sign In
        </a>
      </div>
    </div>
  );
}

export default function FinalPage() {
  const [step, setStep] = useState("pricing");
  const [selectedPlan, setSelectedPlan] = useState(null);

  const handleSelect = (plan) => {
    if (plan.id === "enterprise") {
      window.location.href = "mailto:hello@shiftpro.ai?subject=Enterprise Inquiry";
      return;
    }
    setSelectedPlan(plan);
    setStep("signup");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div style={{ minHeight: "100vh", background: C.bg, color: C.text }}>
      <style dangerouslySetInnerHTML={{ __html: FONTS + `
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: ${C.bg}; }
        @keyframes fadeUp { from { opacity:0; transform:translateY(16px); } to { opacity:1; transform:none; } }
        @keyframes glow { 0%,100% { opacity:0.4; } 50% { opacity:0.8; } }
        ::selection { background: ${C.amber}40; color: #fff; }
      `}} />

      {/* Nav */}
      <nav style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "16px 32px", maxWidth: 1200, margin: "0 auto",
        borderBottom: "1px solid " + C.border,
      }}>
        <Logo />
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <a href="/" style={{ fontFamily: C.sans, fontSize: 13, color: C.textD, textDecoration: "none", fontWeight: 600 }}>
            Sign In
          </a>
          <button
            onClick={() => { setStep("pricing"); setSelectedPlan(null); }}
            style={{
              padding: "8px 18px",
              background: "linear-gradient(135deg,#e07b00,#c96800)",
              border: "none", borderRadius: 8,
              fontFamily: C.sans, fontWeight: 700, fontSize: 12, color: "#fff", cursor: "pointer",
            }}
          >
            Get Started
          </button>
        </div>
      </nav>

      {/* Hero */}
      {step === "pricing" && (
        <div style={{ animation: "fadeUp 0.5s ease" }}>
          <div style={{ textAlign: "center", padding: "60px 20px 40px", maxWidth: 700, margin: "0 auto" }}>
            <div style={{ fontFamily: C.mono, fontSize: 10, color: C.amber, letterSpacing: "3px", textTransform: "uppercase", marginBottom: 16 }}>
              AI-Powered Workforce Management
            </div>
            <h1 style={{
              fontFamily: C.sans, fontWeight: 900, fontSize: "clamp(32px, 5vw, 52px)",
              color: C.text, lineHeight: 1.15, marginBottom: 16, letterSpacing: "-1px",
            }}>
              Schedule smarter.<br />
              <span style={{ color: C.amber }}>Manage easier.</span>
            </h1>
            <p style={{ fontFamily: C.sans, fontSize: 17, color: C.textD, lineHeight: 1.7, maxWidth: 500, margin: "0 auto 32px" }}>
              The all-in-one platform for shift-based businesses. Scheduling, messaging, payroll tracking, and employee management — beautifully simple.
            </p>
            <div style={{ display: "flex", justifyContent: "center", gap: 24, flexWrap: "wrap", fontFamily: C.mono, fontSize: 11, color: C.textF }}>
              {["No credit card required", "14-day free trial", "Cancel anytime"].map((t, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <span style={{ color: C.green }}>✓</span> {t}
                </div>
              ))}
            </div>
          </div>

          {/* Pricing cards */}
          <div style={{
            display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
            gap: 20, maxWidth: 1000, margin: "0 auto", padding: "20px 24px 60px",
          }}>
            {plans.map((p) => (
              <PricingCard key={p.id} plan={p} onSelect={handleSelect} />
            ))}
          </div>

          {/* Social proof */}
          <div style={{
            textAlign: "center", padding: "40px 20px 60px",
            borderTop: "1px solid " + C.border,
          }}>
            <div style={{ fontFamily: C.mono, fontSize: 9, color: C.textF, letterSpacing: "2px", textTransform: "uppercase", marginBottom: 16 }}>
              Built for
            </div>
            <div style={{ display: "flex", justifyContent: "center", gap: 32, flexWrap: "wrap" }}>
              {["🍺 Bars & Restaurants", "☕ Coffee Shops", "🛍️ Retail", "🏨 Hotels", "🎯 Events", "🏥 Healthcare"].map((t, i) => (
                <div key={i} style={{ fontFamily: C.sans, fontSize: 14, color: C.textD, fontWeight: 500 }}>
                  {t}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Signup form */}
      {step === "signup" && selectedPlan && (
        <div style={{ padding: "40px 20px 80px", animation: "fadeUp 0.4s ease" }}>
          <SignupForm
            plan={selectedPlan}
            onBack={() => { setStep("pricing"); setSelectedPlan(null); }}
          />
        </div>
      )}

      {/* Footer */}
      <footer style={{
        borderTop: "1px solid " + C.border, padding: "24px 32px",
        display: "flex", alignItems: "center", justifyContent: "space-between",
        maxWidth: 1200, margin: "0 auto",
      }}>
        <div style={{ fontFamily: C.mono, fontSize: 10, color: C.textF }}>
          © 2025 ShiftPro.ai — All rights reserved.
        </div>
        <div style={{ display: "flex", gap: 20 }}>
          {["Privacy", "Terms", "Support"].map((t) => (
            <a key={t} href="#" style={{ fontFamily: C.sans, fontSize: 12, color: C.textF, textDecoration: "none" }}>
              {t}
            </a>
          ))}
        </div>
      </footer>
    </div>
  );
}
