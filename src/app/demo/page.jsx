"use client";
import React, { useState, useEffect } from "react";

const FEATURES = [
  {
    id: "scheduling",
    icon: "📅",
    title: "Smart Scheduling",
    subtitle: "Build schedules in minutes, not hours",
    color: "#6366f1",
    items: [
      "Drag-and-drop weekly + monthly schedule builder",
      "Employee availability awareness — see who's free before you schedule",
      "One-click publish — employees get instant push + email alerts",
      "Blackout calendar for holidays and closures",
      "Copy last week or build from templates",
    ],
    screenshot: "schedule",
  },
  {
    id: "timeclock",
    icon: "⏱",
    title: "GPS Time Clock",
    subtitle: "Accurate hours, verified locations",
    color: "#10b981",
    items: [
      "One-tap clock in/out from any phone",
      "Geofencing ensures employees are on-site",
      "Break tracking with configurable lunch periods",
      "Real-time dashboard shows who's clocked in right now",
      "Automatic overtime calculations",
    ],
    screenshot: "clock",
  },
  {
    id: "swaps",
    icon: "🔄",
    title: "Shift Swaps",
    subtitle: "Employees handle coverage, you just approve",
    color: "#e07b00",
    items: [
      "Employee posts a shift they need covered",
      "Coworkers see it instantly and claim it",
      "Manager gets one-tap approve/deny",
      "Shift automatically reassigned — zero manual work",
      "Push + email notifications at every step",
    ],
    screenshot: "swaps",
  },
  {
    id: "messaging",
    icon: "💬",
    title: "Team Messaging",
    subtitle: "Keep your team connected",
    color: "#8b5cf6",
    items: [
      "Threaded conversations between staff and managers",
      "Employee-to-manager direct messaging",
      "Broadcast announcements to entire team",
      "Push notifications on new messages",
      "Full message history — nothing gets lost",
    ],
    screenshot: "messaging",
  },
  {
    id: "documents",
    icon: "📁",
    title: "Document Management",
    subtitle: "Digital employee files, always organized",
    color: "#0891b2",
    items: [
      "Upload W-4s, IDs, certifications, training docs",
      "Employees access their own files anytime",
      "Managers upload directly to employee profiles",
      "Permanent records — documents can't be accidentally deleted",
      "10MB file support with secure cloud storage",
    ],
    screenshot: "documents",
  },
  {
    id: "notifications",
    icon: "🔔",
    title: "Real-Time Alerts",
    subtitle: "Nobody misses a thing",
    color: "#ef4444",
    items: [
      "Push notifications to phones (PWA installable)",
      "Email alerts for schedule changes and approvals",
      "In-app notification center with dismiss/persist",
      "Managers alerted on time-off requests and swap claims",
      "Employees notified instantly when schedules are published",
    ],
    screenshot: "notifications",
  },
  {
    id: "multilocation",
    icon: "📍",
    title: "Multi-Location",
    subtitle: "Manage all your spots from one dashboard",
    color: "#f59e0b",
    items: [
      "Switch between locations with one click",
      "Each location has its own staff, schedule, and settings",
      "Add unlimited locations on Pro plan",
      "Location-specific geofence zones",
      "Cross-location employee visibility",
    ],
    screenshot: "locations",
  },
  {
    id: "employee",
    icon: "👤",
    title: "Employee Portal",
    subtitle: "Your team's daily command center",
    color: "#14b8a6",
    items: [
      "Personal dashboard with next shift, clock status, and messages",
      "Set availability with All Day or custom hours",
      "Request time off with one tap",
      "View and download personal documents",
      "Dark mode, 24-hour time, and display name preferences",
    ],
    screenshot: "employee",
  },
];

const PRICING = [
  {
    name: "Starter",
    price: "Free",
    per: "forever",
    color: "#52525b",
    features: ["1 location", "Up to 5 employees", "Basic scheduling", "Time clock", "Messaging"],
    cta: "Get Started Free",
    popular: false,
  },
  {
    name: "Pro",
    price: "$39.99",
    per: "/month",
    color: "#e07b00",
    features: ["Unlimited locations", "Unlimited employees", "Shift swaps", "Push + email alerts", "Document management", "Geofencing", "Priority support"],
    cta: "Start Pro Trial",
    popular: true,
  },
  {
    name: "Enterprise",
    price: "Custom",
    per: "pricing",
    color: "#6366f1",
    features: ["Everything in Pro", "QuickBooks integration", "Custom branding", "API access", "Dedicated account manager", "SLA guarantee"],
    cta: "Contact Sales",
    popular: false,
  },
];

export default function DemoPage() {
  const [activeFeature, setActiveFeature] = useState("scheduling");
  const [scrolled, setScrolled] = useState(false);
  const [visibleSections, setVisibleSections] = useState(new Set());

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (e.isIntersecting) setVisibleSections(p => new Set([...p, e.target.id]));
      });
    }, { threshold: 0.15 });
    document.querySelectorAll("[data-reveal]").forEach(el => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  const active = FEATURES.find(f => f.id === activeFeature);

  return (
    <div style={{ minHeight: "100vh", background: "#0a0e1a", color: "#e2e8f0", fontFamily: "'Outfit', system-ui, sans-serif", overflowX: "hidden" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800;900&family=JetBrains+Mono:wght@400;600;700&display=swap');
        @keyframes fadeUp { from { opacity:0; transform:translateY(30px) } to { opacity:1; transform:none } }
        @keyframes float { 0%,100% { transform:translateY(0) } 50% { transform:translateY(-8px) } }
        @keyframes pulse { 0%,100% { opacity:0.4 } 50% { opacity:1 } }
        @keyframes slideIn { from { opacity:0; transform:translateX(-20px) } to { opacity:1; transform:none } }
        .reveal { opacity:0; transform:translateY(30px); transition:all 0.7s cubic-bezier(0.22,1,0.36,1); }
        .reveal.visible { opacity:1; transform:none; }
        .feature-btn:hover { transform:translateY(-2px); box-shadow:0 8px 25px rgba(0,0,0,0.3); }
        .pricing-card:hover { transform:translateY(-4px); box-shadow:0 20px 50px rgba(0,0,0,0.4); }
        .cta-btn:hover { transform:translateY(-1px); box-shadow:0 8px 30px rgba(224,123,0,0.4); }
      `}</style>

      {/* ── STICKY NAV ── */}
      <nav style={{ position: "fixed", top: 0, left: 0, right: 0, zIndex: 200, padding: "0 24px", background: scrolled ? "rgba(10,14,26,0.95)" : "transparent", borderBottom: scrolled ? "1px solid rgba(255,255,255,0.06)" : "none", backdropFilter: scrolled ? "blur(20px)" : "none", transition: "all 0.3s" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", height: 64, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 32, height: 32, borderRadius: 8, background: "linear-gradient(135deg,#e07b00,#e8b84b)", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'JetBrains Mono',monospace", fontWeight: 800, fontSize: 16, color: "#0a0e1a" }}>S</div>
            <span style={{ fontFamily: "'JetBrains Mono',monospace", fontWeight: 700, fontSize: 14, letterSpacing: 2, color: "#e8b84b" }}>SHIFTPRO.AI</span>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <a href="/" style={{ padding: "8px 18px", borderRadius: 8, border: "1px solid rgba(255,255,255,0.1)", color: "#e2e8f0", textDecoration: "none", fontSize: 13, fontWeight: 600, transition: "all 0.2s" }}>Sign In</a>
            <a href="/final" className="cta-btn" style={{ padding: "8px 18px", borderRadius: 8, background: "linear-gradient(135deg,#e07b00,#c96800)", color: "#fff", textDecoration: "none", fontSize: 13, fontWeight: 700, transition: "all 0.2s" }}>Get Started Free</a>
          </div>
        </div>
      </nav>

      {/* ── HERO ── */}
      <section style={{ padding: "120px 24px 80px", textAlign: "center", position: "relative", overflow: "hidden" }}>
        {/* Background grid */}
        <div style={{ position: "absolute", inset: 0, backgroundImage: "radial-gradient(rgba(99,102,241,0.08) 1px, transparent 1px)", backgroundSize: "32px 32px", pointerEvents: "none" }} />
        {/* Glow */}
        <div style={{ position: "absolute", top: -200, left: "50%", transform: "translateX(-50%)", width: 800, height: 600, background: "radial-gradient(ellipse at center, rgba(224,123,0,0.12) 0%, transparent 70%)", pointerEvents: "none" }} />

        <div style={{ position: "relative", maxWidth: 800, margin: "0 auto", animation: "fadeUp 0.8s ease" }}>
          <div style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 11, letterSpacing: 4, color: "#e8b84b", marginBottom: 16, textTransform: "uppercase" }}>Workforce Management for Shift-Based Businesses</div>
          <h1 style={{ fontSize: "clamp(36px,5vw,64px)", fontWeight: 900, lineHeight: 1.1, marginBottom: 20, background: "linear-gradient(135deg,#fff 30%,#e8b84b)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
            Schedule. Track. Pay.<br />All in One Place.
          </h1>
          <p style={{ fontSize: "clamp(16px,2vw,20px)", color: "#94a3b8", lineHeight: 1.7, maxWidth: 600, margin: "0 auto 32px", fontWeight: 400 }}>
            ShiftPro replaces spreadsheets, group texts, and paper timesheets with one clean platform your whole team actually uses.
          </p>
          <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
            <a href="/final" className="cta-btn" style={{ padding: "14px 32px", borderRadius: 10, background: "linear-gradient(135deg,#e07b00,#c96800)", color: "#fff", textDecoration: "none", fontSize: 16, fontWeight: 700, transition: "all 0.2s" }}>Start Free — No Card Required</a>
            <a href="#features" style={{ padding: "14px 32px", borderRadius: 10, border: "1.5px solid rgba(255,255,255,0.15)", color: "#e2e8f0", textDecoration: "none", fontSize: 16, fontWeight: 600 }}>See Features ↓</a>
          </div>

          {/* Trust badges */}
          <div style={{ display: "flex", gap: 24, justifyContent: "center", marginTop: 40, flexWrap: "wrap" }}>
            {["🔒 256-bit encryption", "📱 Works on any phone", "⚡ Setup in 5 minutes", "🏢 Multi-location ready"].map(b => (
              <div key={b} style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 11, color: "#64748b", letterSpacing: 0.5 }}>{b}</div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FEATURES SHOWCASE ── */}
      <section id="features" data-reveal style={{ padding: "60px 24px 80px", maxWidth: 1200, margin: "0 auto" }} className={`reveal ${visibleSections.has("features") ? "visible" : ""}`}>
        <div style={{ textAlign: "center", marginBottom: 48 }}>
          <div style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 10, letterSpacing: 4, color: "#e8b84b", marginBottom: 8, textTransform: "uppercase" }}>Everything You Need</div>
          <h2 style={{ fontSize: "clamp(28px,4vw,44px)", fontWeight: 800, color: "#fff", marginBottom: 12 }}>Built for How You Actually Work</h2>
          <p style={{ color: "#94a3b8", fontSize: 16, maxWidth: 500, margin: "0 auto" }}>Every feature designed for restaurants, bars, cafes, and hospitality teams.</p>
        </div>

        {/* Feature tabs */}
        <div style={{ display: "flex", gap: 8, justifyContent: "center", flexWrap: "wrap", marginBottom: 40 }}>
          {FEATURES.map(f => (
            <button key={f.id} className="feature-btn" onClick={() => setActiveFeature(f.id)}
              style={{ padding: "10px 18px", borderRadius: 10, border: activeFeature === f.id ? "2px solid " + f.color : "1.5px solid rgba(255,255,255,0.08)", background: activeFeature === f.id ? f.color + "15" : "rgba(255,255,255,0.03)", color: activeFeature === f.id ? f.color : "#94a3b8", fontFamily: "'Outfit',sans-serif", fontWeight: 600, fontSize: 13, cursor: "pointer", transition: "all 0.2s", whiteSpace: "nowrap" }}>
              {f.icon} {f.title}
            </button>
          ))}
        </div>

        {/* Active feature detail */}
        {active && (
          <div key={active.id} style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 40, alignItems: "center", animation: "slideIn 0.4s ease" }}>
            {/* Left — info */}
            <div style={{ padding: "0 20px" }}>
              <div style={{ fontSize: 56, marginBottom: 16 }}>{active.icon}</div>
              <h3 style={{ fontSize: 32, fontWeight: 800, color: "#fff", marginBottom: 8 }}>{active.title}</h3>
              <p style={{ fontSize: 16, color: "#94a3b8", marginBottom: 24 }}>{active.subtitle}</p>
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {active.items.map((item, i) => (
                  <div key={i} style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
                    <div style={{ width: 22, height: 22, borderRadius: 6, background: active.color + "20", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, color: active.color, fontWeight: 800, flexShrink: 0, marginTop: 1 }}>✓</div>
                    <span style={{ fontSize: 14, color: "#cbd5e1", lineHeight: 1.5 }}>{item}</span>
                  </div>
                ))}
              </div>
            </div>
            {/* Right — visual mock */}
            <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 20, padding: 32, display: "flex", alignItems: "center", justifyContent: "center", minHeight: 400, position: "relative", overflow: "hidden" }}>
              <div style={{ position: "absolute", inset: 0, background: `radial-gradient(ellipse at center, ${active.color}10 0%, transparent 70%)` }} />
              <div style={{ position: "relative", textAlign: "center" }}>
                <div style={{ fontSize: 80, marginBottom: 16, animation: "float 3s ease-in-out infinite" }}>{active.icon}</div>
                <div style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 12, color: active.color, letterSpacing: 2, textTransform: "uppercase" }}>{active.title}</div>
                <div style={{ marginTop: 20, display: "flex", gap: 8, justifyContent: "center", flexWrap: "wrap" }}>
                  {active.items.slice(0, 3).map((item, i) => (
                    <div key={i} style={{ padding: "6px 14px", background: "rgba(255,255,255,0.05)", borderRadius: 20, fontSize: 11, color: "#94a3b8" }}>{item.split(" ").slice(0, 3).join(" ")}</div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </section>

      {/* ── HOW IT WORKS ── */}
      <section id="how" data-reveal style={{ padding: "80px 24px", background: "rgba(255,255,255,0.02)" }} className={`reveal ${visibleSections.has("how") ? "visible" : ""}`}>
        <div style={{ maxWidth: 1000, margin: "0 auto", textAlign: "center" }}>
          <div style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 10, letterSpacing: 4, color: "#e8b84b", marginBottom: 8, textTransform: "uppercase" }}>Simple Setup</div>
          <h2 style={{ fontSize: "clamp(28px,4vw,40px)", fontWeight: 800, color: "#fff", marginBottom: 48 }}>Live in 5 Minutes</h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 32 }}>
            {[
              { step: "01", icon: "🏢", title: "Create Your Org", desc: "Sign up, name your business, add your first location." },
              { step: "02", icon: "👥", title: "Invite Your Team", desc: "Add employees by email. They get a secure setup link." },
              { step: "03", icon: "📅", title: "Build a Schedule", desc: "Drag and drop shifts. Hit publish. Everyone gets notified." },
              { step: "04", icon: "⏱", title: "Track Hours", desc: "Employees clock in from their phones. You see it live." },
            ].map(s => (
              <div key={s.step} style={{ padding: 28, background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 16, textAlign: "left" }}>
                <div style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 10, color: "#e8b84b", letterSpacing: 2, marginBottom: 12 }}>STEP {s.step}</div>
                <div style={{ fontSize: 36, marginBottom: 12 }}>{s.icon}</div>
                <div style={{ fontWeight: 700, fontSize: 17, color: "#fff", marginBottom: 6 }}>{s.title}</div>
                <div style={{ fontSize: 13, color: "#94a3b8", lineHeight: 1.6 }}>{s.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── PRICING ── */}
      <section id="pricing" data-reveal style={{ padding: "80px 24px" }} className={`reveal ${visibleSections.has("pricing") ? "visible" : ""}`}>
        <div style={{ maxWidth: 1000, margin: "0 auto", textAlign: "center" }}>
          <div style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 10, letterSpacing: 4, color: "#e8b84b", marginBottom: 8, textTransform: "uppercase" }}>Pricing</div>
          <h2 style={{ fontSize: "clamp(28px,4vw,40px)", fontWeight: 800, color: "#fff", marginBottom: 12 }}>Simple, Honest Pricing</h2>
          <p style={{ color: "#94a3b8", fontSize: 15, marginBottom: 48 }}>Start free. Upgrade when you need more.</p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 20 }}>
            {PRICING.map(plan => (
              <div key={plan.name} className="pricing-card" style={{ padding: 32, background: plan.popular ? "rgba(224,123,0,0.06)" : "rgba(255,255,255,0.03)", border: plan.popular ? "2px solid rgba(224,123,0,0.3)" : "1px solid rgba(255,255,255,0.06)", borderRadius: 20, textAlign: "left", position: "relative", transition: "all 0.3s" }}>
                {plan.popular && (
                  <div style={{ position: "absolute", top: -12, right: 20, padding: "4px 14px", background: "linear-gradient(135deg,#e07b00,#c96800)", borderRadius: 20, fontFamily: "'JetBrains Mono',monospace", fontSize: 9, fontWeight: 700, color: "#fff", letterSpacing: 1 }}>MOST POPULAR</div>
                )}
                <div style={{ fontWeight: 700, fontSize: 18, color: plan.color, marginBottom: 4 }}>{plan.name}</div>
                <div style={{ display: "flex", alignItems: "baseline", gap: 4, marginBottom: 20 }}>
                  <span style={{ fontSize: 40, fontWeight: 900, color: "#fff" }}>{plan.price}</span>
                  <span style={{ fontSize: 14, color: "#64748b" }}>{plan.per}</span>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 28 }}>
                  {plan.features.map(f => (
                    <div key={f} style={{ display: "flex", gap: 8, alignItems: "center" }}>
                      <span style={{ color: plan.color, fontSize: 12 }}>✓</span>
                      <span style={{ fontSize: 13, color: "#cbd5e1" }}>{f}</span>
                    </div>
                  ))}
                </div>
                <a href="/final" style={{ display: "block", textAlign: "center", padding: "12px 24px", borderRadius: 10, background: plan.popular ? "linear-gradient(135deg,#e07b00,#c96800)" : "rgba(255,255,255,0.06)", border: plan.popular ? "none" : "1px solid rgba(255,255,255,0.1)", color: "#fff", textDecoration: "none", fontWeight: 700, fontSize: 14, transition: "all 0.2s" }}>{plan.cta}</a>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── BUILT FOR ── */}
      <section data-reveal id="builtfor" style={{ padding: "80px 24px", background: "rgba(255,255,255,0.02)" }} className={`reveal ${visibleSections.has("builtfor") ? "visible" : ""}`}>
        <div style={{ maxWidth: 800, margin: "0 auto", textAlign: "center" }}>
          <div style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 10, letterSpacing: 4, color: "#e8b84b", marginBottom: 8, textTransform: "uppercase" }}>Built For</div>
          <h2 style={{ fontSize: "clamp(28px,4vw,40px)", fontWeight: 800, color: "#fff", marginBottom: 40 }}>If You Run Shifts, We Run With You</h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: 16 }}>
            {["🍺 Bars & Breweries", "☕ Coffee Shops", "🍽️ Restaurants", "🏨 Hotels", "🛥️ Tour Companies", "🏪 Retail Stores", "🏥 Clinics", "🎪 Event Venues"].map(b => (
              <div key={b} style={{ padding: "18px 14px", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 12, fontSize: 14, fontWeight: 600, color: "#cbd5e1" }}>{b}</div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FINAL CTA ── */}
      <section style={{ padding: "80px 24px", textAlign: "center" }}>
        <div style={{ maxWidth: 600, margin: "0 auto" }}>
          <h2 style={{ fontSize: "clamp(28px,4vw,40px)", fontWeight: 900, color: "#fff", marginBottom: 16 }}>Ready to Ditch the Spreadsheet?</h2>
          <p style={{ color: "#94a3b8", fontSize: 16, lineHeight: 1.7, marginBottom: 32 }}>Join hundreds of shift-based businesses who switched to ShiftPro. Free to start, no credit card required.</p>
          <a href="/final" className="cta-btn" style={{ display: "inline-block", padding: "16px 40px", borderRadius: 12, background: "linear-gradient(135deg,#e07b00,#c96800)", color: "#fff", textDecoration: "none", fontSize: 18, fontWeight: 800, transition: "all 0.2s", boxShadow: "0 8px 30px rgba(224,123,0,0.25)" }}>Get Started Free →</a>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer style={{ padding: "40px 24px", borderTop: "1px solid rgba(255,255,255,0.06)" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 16 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{ width: 24, height: 24, borderRadius: 6, background: "linear-gradient(135deg,#e07b00,#e8b84b)", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'JetBrains Mono',monospace", fontWeight: 800, fontSize: 12, color: "#0a0e1a" }}>S</div>
            <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 11, color: "#64748b", letterSpacing: 1 }}>SHIFTPRO.AI</span>
          </div>
          <div style={{ display: "flex", gap: 24 }}>
            <a href="/terms" style={{ color: "#64748b", textDecoration: "none", fontSize: 12 }}>Terms</a>
            <a href="/privacy" style={{ color: "#64748b", textDecoration: "none", fontSize: 12 }}>Privacy</a>
            <a href="mailto:support@shiftpro.ai" style={{ color: "#64748b", textDecoration: "none", fontSize: 12 }}>Contact</a>
          </div>
          <div style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 10, color: "#475569" }}>© 2026 Bayscapes Management Enterprises</div>
        </div>
      </footer>
    </div>
  );
}
