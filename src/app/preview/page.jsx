"use client";
import React, { useState, useEffect, useRef, useCallback } from "react";

// ═══ DESIGN TOKENS ═══
const C = {
  bg: "#07090f", bgCard: "#0c1220", bgCard2: "#111827", bgHover: "#151b2e",
  gold: "#e8b84b", goldDark: "#c49a34", goldGlow: "rgba(232,184,75,0.15)",
  teal: "#2dd4bf", tealGlow: "rgba(45,212,191,0.12)",
  violet: "#8b5cf6", indigo: "#6366f1",
  text: "#f1f0ed", textMuted: "#94a3b8", textDim: "#64748b", textFaint: "#475569",
  border: "rgba(255,255,255,0.06)", borderGold: "rgba(232,184,75,0.2)",
  red: "#ef4444", green: "#10b981",
};

const FONTS = `
@import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,300;0,9..144,400;0,9..144,500;0,9..144,600;0,9..144,700;0,9..144,800;0,9..144,900;1,9..144,300;1,9..144,400;1,9..144,500;1,9..144,700&family=IBM+Plex+Sans:wght@300;400;500;600;700&family=IBM+Plex+Mono:wght@400;500;600;700&display=swap');
*{box-sizing:border-box;margin:0;padding:0;}
html{scroll-behavior:smooth;-webkit-font-smoothing:antialiased;}
body{background:${C.bg};color:${C.text};overflow-x:hidden;}
input,select,textarea,button{font-size:16px;font-family:inherit;}
::-webkit-scrollbar{width:5px;background:${C.bg};}
::-webkit-scrollbar-thumb{background:rgba(232,184,75,0.15);border-radius:3px;}
a{text-decoration:none;color:inherit;}
@keyframes fadeUp{from{opacity:0;transform:translateY(32px)}to{opacity:1;transform:none}}
@keyframes fadeIn{from{opacity:0}to{opacity:1}}
@keyframes pulse2{0%,100%{opacity:.3}50%{opacity:1}}
@keyframes drift{0%,100%{transform:translate(0,0)}50%{transform:translate(12px,-8px)}}
@keyframes tickScroll{0%{transform:translateX(0)}100%{transform:translateX(-50%)}}
@keyframes countUp{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:none}}
@keyframes blink2{0%,100%{opacity:1}50%{opacity:0}}
@keyframes feedSlide{from{opacity:0;transform:translateY(-14px)}to{opacity:1;transform:none}}
.reveal2{opacity:0;transform:translateY(44px);transition:opacity .85s cubic-bezier(.22,1,.36,1),transform .85s cubic-bezier(.22,1,.36,1);}
.reveal2.vis{opacity:1;transform:none;}
`;

const ff = { display: "'Fraunces', serif", body: "'IBM Plex Sans', sans-serif", mono: "'IBM Plex Mono', monospace" };

// ═══ LIVE FEED DATA ═══
const FEED_EVENTS = [
  { icon: "⏱", text: "Jake M. clocked in", loc: "Sea Lion Bar", color: C.teal },
  { icon: "🔄", text: "Sarah posted Sat for swap", loc: "Surf Town Coffee", color: C.gold },
  { icon: "✅", text: "Manager approved swap", loc: "Sea Lion Bar", color: C.green },
  { icon: "💬", text: "Priya messaged manager", loc: "Marine Discovery", color: C.violet },
  { icon: "📅", text: "Schedule published — 12 notified", loc: "Sea Lion Bar", color: C.indigo },
  { icon: "📆", text: "Carlos requested time off", loc: "Surf Town Coffee", color: C.gold },
  { icon: "⏱", text: "Anya T. clocked out", loc: "Sea Lion Bar", color: C.red },
  { icon: "🔔", text: "New shift available: Sun 8am", loc: "Marine Discovery", color: C.teal },
  { icon: "⏱", text: "Marcus B. started break", loc: "Sea Lion Bar", color: C.gold },
  { icon: "✅", text: "Time off approved — Carlos", loc: "Surf Town Coffee", color: C.green },
];

// ═══ LOGIN MODAL ═══
function LoginModal({ open, onClose }) {
  const [role, setRole] = useState("owner");
  const [email, setEmail] = useState("");
  const [pw, setPw] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  useEffect(() => { if (!open) { setEmail(""); setPw(""); setErr(""); } }, [open]);

  const submit = async (e) => {
    if (e) e.preventDefault();
    setBusy(true); setErr("");
    try {
      const { createClient } = await import("@supabase/supabase-js");
      const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
      const { error } = await sb.auth.signInWithPassword({ email, password: pw });
      if (error) throw error;
      window.location.href = "/";
    } catch (e2) { setErr(e2.message || "Invalid credentials"); }
    finally { setBusy(false); }
  };

  if (!open) return null;
  return (
    <div onClick={onClose} style={{ position: "fixed", inset: 0, background: "rgba(4,6,12,0.88)", backdropFilter: "blur(16px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, padding: 20, animation: "fadeIn 0.2s" }}>
      <div onClick={e => e.stopPropagation()} style={{ width: "100%", maxWidth: 420, background: C.bgCard, borderRadius: 22, border: "1px solid " + C.border, padding: "36px 32px", animation: "fadeUp 0.35s cubic-bezier(.22,1,.36,1)", boxShadow: "0 40px 100px rgba(0,0,0,0.6)", position: "relative" }}>
        <button onClick={onClose} style={{ position: "absolute", top: 16, right: 16, background: "none", border: "none", color: C.textDim, fontSize: 22, lineHeight: 1 }}>×</button>
        <div style={{ textAlign: "center", marginBottom: 26 }}>
          <div style={{ fontFamily: ff.mono, fontSize: 9, letterSpacing: 4, color: C.gold, marginBottom: 6 }}>WELCOME BACK</div>
          <div style={{ fontFamily: ff.display, fontSize: 28, fontWeight: 700, fontStyle: "italic", color: C.text }}>Sign in</div>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 4, background: C.bg, padding: 4, borderRadius: 12, marginBottom: 20 }}>
          {["owner", "employee"].map(r => (
            <button key={r} onClick={() => setRole(r)} style={{ padding: "10px", borderRadius: 9, border: "none", background: role === r ? C.gold : "transparent", color: role === r ? C.bg : C.textMuted, fontFamily: ff.body, fontWeight: 600, fontSize: 13, transition: "all 0.2s" }}>
              {r === "owner" ? "I'm an Owner" : "I'm an Employee"}
            </button>
          ))}
        </div>
        <form onSubmit={submit}>
          <label style={{ display: "block", fontFamily: ff.mono, fontSize: 9, letterSpacing: 1.5, color: C.textDim, marginBottom: 5, textTransform: "uppercase" }}>Email</label>
          <input type="email" value={email} onChange={e => setEmail(e.target.value)} required placeholder="you@business.com" style={{ width: "100%", padding: "12px 14px", background: C.bg, border: "1px solid " + C.border, borderRadius: 10, color: C.text, outline: "none", fontSize: 14, fontFamily: ff.body, marginBottom: 14 }} />
          <label style={{ display: "block", fontFamily: ff.mono, fontSize: 9, letterSpacing: 1.5, color: C.textDim, marginBottom: 5, textTransform: "uppercase" }}>Password</label>
          <input type="password" value={pw} onChange={e => setPw(e.target.value)} required placeholder="••••••••" style={{ width: "100%", padding: "12px 14px", background: C.bg, border: "1px solid " + C.border, borderRadius: 10, color: C.text, outline: "none", fontSize: 14, fontFamily: ff.body, marginBottom: 18 }} />
          {err && <div style={{ padding: "10px 12px", background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.2)", borderRadius: 8, fontSize: 12, color: "#fca5a5", marginBottom: 14, fontFamily: ff.body }}>⚠ {err}</div>}
          <button type="submit" disabled={busy} style={{ width: "100%", padding: "13px", borderRadius: 10, border: "none", background: busy ? "rgba(232,184,75,0.4)" : "linear-gradient(135deg," + C.gold + "," + C.goldDark + ")", color: C.bg, fontFamily: ff.body, fontWeight: 700, fontSize: 14, marginBottom: 14, transition: "all 0.2s" }}>
            {busy ? "Signing in…" : "Sign In →"}
          </button>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, fontFamily: ff.body }}>
            <a href="/forgot" style={{ color: C.textMuted }}>Forgot password?</a>
            <a href="/final" style={{ color: C.gold, fontWeight: 600 }}>Create account →</a>
          </div>
        </form>
      </div>
    </div>
  );
}

// ═══ ANIMATED COUNTER ═══
function AnimCounter({ end, duration = 2000, prefix = "", suffix = "" }) {
  const [val, setVal] = useState(0);
  const [started, setStarted] = useState(false);
  const ref = useRef(null);
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setStarted(true); }, { threshold: 0.3 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);
  useEffect(() => {
    if (!started) return;
    const start = Date.now();
    const tick = () => {
      const p = Math.min(1, (Date.now() - start) / duration);
      const eased = 1 - Math.pow(1 - p, 3);
      setVal(Math.round(eased * end));
      if (p < 1) requestAnimationFrame(tick);
    };
    tick();
  }, [started, end, duration]);
  return <span ref={ref}>{prefix}{val.toLocaleString()}{suffix}</span>;
}

// ═══ MAIN PAGE ═══
export default function LandingPage() {
  const [scrolled, setScrolled] = useState(false);
  const [loginOpen, setLoginOpen] = useState(false);
  const [vis, setVis] = useState(new Set());
  const [vw, setVw] = useState(1200);
  const [feedIdx, setFeedIdx] = useState(0);
  const [howStep, setHowStep] = useState(0);
  const [faqOpen, setFaqOpen] = useState(-1);
  const [roiHours, setRoiHours] = useState(6);
  const [roiRate, setRoiRate] = useState(25);
  const [roiTeam, setRoiTeam] = useState(12);
  const [trialEmail, setTrialEmail] = useState("");
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    setVw(window.innerWidth);
    const resize = () => setVw(window.innerWidth);
    const scroll = () => setScrolled(window.scrollY > 50);
    const mouse = (e) => setMousePos({ x: e.clientX, y: e.clientY });
    window.addEventListener("resize", resize);
    window.addEventListener("scroll", scroll);
    window.addEventListener("mousemove", mouse);
    return () => { window.removeEventListener("resize", resize); window.removeEventListener("scroll", scroll); window.removeEventListener("mousemove", mouse); };
  }, []);

  useEffect(() => {
    const obs = new IntersectionObserver((entries) => {
      entries.forEach(e => { if (e.isIntersecting) setVis(p => new Set([...p, e.target.id])); });
    }, { threshold: 0.12, rootMargin: "0px 0px -60px 0px" });
    document.querySelectorAll("[data-reveal]").forEach(el => obs.observe(el));
    return () => obs.disconnect();
  }, []);

  // Live feed rotation
  useEffect(() => {
    const iv = setInterval(() => setFeedIdx(p => (p + 1) % FEED_EVENTS.length), 2800);
    return () => clearInterval(iv);
  }, []);

  const isMobile = vw < 768;
  const isTablet = vw < 1024;
  const openLogin = () => setLoginOpen(true);

  // ROI calculations
  const roiYearlySaved = roiHours * 50 * roiRate;
  const roiShiftProCost = roiTeam * 4 * 12;
  const roiWIWCost = roiTeam * 7 * 12; // WIW Pro + time tracking
  const roiNetSaved = roiYearlySaved - roiShiftProCost;

  const currentFeed = FEED_EVENTS[feedIdx];

  return (
    <>
      <style>{FONTS}</style>
      <LoginModal open={loginOpen} onClose={() => setLoginOpen(false)} />

      {/* Cursor gradient — desktop only */}
      {!isMobile && (
        <div style={{ position: "fixed", pointerEvents: "none", zIndex: 1, width: 600, height: 600, borderRadius: "50%", background: "radial-gradient(circle, rgba(232,184,75,0.04) 0%, transparent 70%)", left: mousePos.x - 300, top: mousePos.y - 300, transition: "left 0.3s ease-out, top 0.3s ease-out", filter: "blur(30px)" }} />
      )}

      {/* ═══════ NAV ═══════ */}
      <nav style={{ position: "fixed", top: 0, left: 0, right: 0, zIndex: 100, padding: "0 24px", background: scrolled ? "rgba(7,9,15,0.88)" : "transparent", borderBottom: scrolled ? "1px solid " + C.border : "1px solid transparent", backdropFilter: scrolled ? "blur(24px) saturate(180%)" : "none", transition: "all 0.35s" }}>
        <div style={{ maxWidth: 1280, margin: "0 auto", height: 64, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <a href="/" style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 32, height: 32, borderRadius: 8, background: "linear-gradient(135deg," + C.gold + "," + C.goldDark + ")", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: ff.mono, fontWeight: 700, fontSize: 16, color: C.bg }}>S</div>
            <span style={{ fontFamily: ff.mono, fontWeight: 600, fontSize: 12, letterSpacing: 2.5, color: C.text }}>SHIFTPRO</span>
          </a>
          {!isMobile && (
            <div style={{ display: "flex", gap: 28, fontFamily: ff.body, fontSize: 13.5, fontWeight: 500 }}>
              {[["Features", "#features"], ["How it works", "#tour"], ["Pricing", "#pricing"], ["FAQ", "#faq"]].map(([l, h]) => (
                <a key={l} href={h} style={{ color: C.textMuted, transition: "color 0.2s" }}>{l}</a>
              ))}
            </div>
          )}
          <div style={{ display: "flex", gap: 8 }}>
            <button onClick={openLogin} style={{ padding: "8px 16px", borderRadius: 8, border: "1px solid " + C.border, background: "transparent", color: C.text, fontFamily: ff.body, fontWeight: 600, fontSize: 13 }}>Sign In</button>
            <a href="/final" style={{ padding: "8px 18px", borderRadius: 8, background: "linear-gradient(135deg," + C.gold + "," + C.goldDark + ")", color: C.bg, fontFamily: ff.body, fontWeight: 700, fontSize: 13 }}>Start Free →</a>
          </div>
        </div>
      </nav>

      {/* ═══════ HERO — COMMAND CENTER ═══════ */}
      <section style={{ position: "relative", minHeight: "100vh", padding: isMobile ? "110px 20px 60px" : "130px 24px 80px", overflow: "hidden", display: "flex", alignItems: "center" }}>
        {/* Background dot grid */}
        <div style={{ position: "absolute", inset: 0, backgroundImage: "radial-gradient(rgba(255,255,255,0.025) 1px, transparent 1px)", backgroundSize: "40px 40px", maskImage: "radial-gradient(ellipse at 40% 50%, black 30%, transparent 75%)", WebkitMaskImage: "radial-gradient(ellipse at 40% 50%, black 30%, transparent 75%)", pointerEvents: "none" }} />
        {/* Gradient orbs */}
        <div style={{ position: "absolute", top: "10%", left: "5%", width: 500, height: 500, background: "radial-gradient(circle," + C.goldGlow + " 0%,transparent 70%)", animation: "drift 20s ease-in-out infinite", filter: "blur(60px)", pointerEvents: "none" }} />
        <div style={{ position: "absolute", bottom: "5%", right: "0%", width: 450, height: 450, background: "radial-gradient(circle," + C.tealGlow + " 0%,transparent 70%)", animation: "drift 25s ease-in-out infinite reverse", filter: "blur(60px)", pointerEvents: "none" }} />

        <div style={{ position: "relative", maxWidth: 1280, width: "100%", margin: "0 auto", display: "grid", gridTemplateColumns: isTablet ? "1fr" : "1.15fr 1fr", gap: isMobile ? 40 : 60, alignItems: "center" }}>
          {/* LEFT */}
          <div style={{ animation: "fadeUp 1s cubic-bezier(.22,1,.36,1)" }}>
            {/* Live badge */}
            <div style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "6px 14px", background: "rgba(45,212,191,0.06)", border: "1px solid rgba(45,212,191,0.2)", borderRadius: 30, marginBottom: 28 }}>
              <span style={{ width: 7, height: 7, borderRadius: "50%", background: C.teal, animation: "pulse2 1.8s infinite" }} />
              <span style={{ fontFamily: ff.mono, fontSize: 10, letterSpacing: 1.5, color: C.teal, fontWeight: 600 }}>LIVE PLATFORM · SHIPS INSTANTLY</span>
            </div>

            <h1 style={{ fontFamily: ff.display, fontSize: isMobile ? 42 : "clamp(52px,7.5vw,92px)", lineHeight: 0.92, fontWeight: 800, letterSpacing: "-0.035em", marginBottom: 24, color: C.text }}>
              Your team.<br />
              <span style={{ fontFamily: ff.display, fontStyle: "italic", fontWeight: 300, color: C.gold }}>On autopilot.</span>
            </h1>

            <p style={{ fontFamily: ff.body, fontSize: isMobile ? 16 : 18, color: C.textMuted, lineHeight: 1.65, marginBottom: 34, maxWidth: 480, fontWeight: 400 }}>
              ShiftPro is the workforce platform that replaces your spreadsheets, group texts, and paper timesheets — with one thing that actually works.
            </p>

            <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 28 }}>
              <a href="/final" style={{ padding: "15px 30px", borderRadius: 11, background: "linear-gradient(135deg," + C.gold + "," + C.goldDark + ")", color: C.bg, fontFamily: ff.body, fontWeight: 700, fontSize: 15, boxShadow: "0 8px 30px rgba(232,184,75,0.25)", transition: "transform 0.15s" }}>
                Start 14-Day Free Trial
              </a>
              <button onClick={openLogin} style={{ padding: "15px 24px", borderRadius: 11, border: "1px solid " + C.border, background: "rgba(255,255,255,0.02)", color: C.text, fontFamily: ff.body, fontWeight: 600, fontSize: 15 }}>
                Sign In
              </button>
            </div>

            {/* Stats */}
            <div style={{ display: "flex", gap: isMobile ? 20 : 36, fontFamily: ff.mono, fontSize: 11, color: C.textDim }}>
              <div><span style={{ color: C.teal }}>✓</span> No credit card</div>
              <div><span style={{ color: C.teal }}>✓</span> 5-min setup</div>
              <div><span style={{ color: C.teal }}>✓</span> Cancel anytime</div>
            </div>
          </div>

          {/* RIGHT — Live command center */}
          {!isTablet && (
            <div style={{ animation: "fadeUp 1.2s cubic-bezier(.22,1,.36,1)", perspective: 1600 }}>
              <div style={{ background: "linear-gradient(160deg," + C.bgCard + " 0%," + C.bg + " 100%)", borderRadius: 20, padding: 20, border: "1px solid " + C.border, boxShadow: "0 40px 80px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.04)", transform: "rotateY(-6deg) rotateX(3deg)", transformStyle: "preserve-3d" }}>
                {/* Chrome */}
                <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 14, paddingBottom: 12, borderBottom: "1px solid " + C.border }}>
                  <div style={{ width: 9, height: 9, borderRadius: "50%", background: "#ef4444" }} />
                  <div style={{ width: 9, height: 9, borderRadius: "50%", background: C.gold }} />
                  <div style={{ width: 9, height: 9, borderRadius: "50%", background: C.green }} />
                  <div style={{ marginLeft: 10, fontFamily: ff.mono, fontSize: 9, color: C.textDim, letterSpacing: 0.5 }}>shiftpro.ai · Command Center</div>
                  <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 4 }}>
                    <span style={{ width: 6, height: 6, borderRadius: "50%", background: C.teal, animation: "pulse2 2s infinite" }} />
                    <span style={{ fontFamily: ff.mono, fontSize: 8, color: C.teal }}>LIVE</span>
                  </div>
                </div>

                {/* Stat cards */}
                <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 8, marginBottom: 12 }}>
                  {[
                    { label: "TEAM", val: "23", color: C.indigo },
                    { label: "ON SHIFT", val: "8", color: C.teal },
                    { label: "CLOCKED", val: "187h", color: C.gold },
                    { label: "COVERAGE", val: "94%", color: C.green },
                  ].map(s => (
                    <div key={s.label} style={{ padding: "10px 8px", background: "rgba(255,255,255,0.02)", borderRadius: 8, border: "1px solid " + C.border }}>
                      <div style={{ fontFamily: ff.mono, fontSize: 7, color: C.textDim, letterSpacing: 1, marginBottom: 3 }}>{s.label}</div>
                      <div style={{ fontFamily: ff.display, fontSize: 20, fontWeight: 800, color: s.color }}>{s.val}</div>
                    </div>
                  ))}
                </div>

                {/* Timeline bar */}
                <div style={{ padding: 12, background: "rgba(0,0,0,0.3)", borderRadius: 10, marginBottom: 12 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                    <span style={{ fontFamily: ff.body, fontSize: 10, color: C.text, fontWeight: 600 }}>Today's Coverage</span>
                    <span style={{ fontFamily: ff.mono, fontSize: 8, color: C.teal, letterSpacing: 1 }}>● LIVE</span>
                  </div>
                  <div style={{ height: 24, background: "rgba(255,255,255,0.03)", borderRadius: 5, position: "relative", overflow: "hidden" }}>
                    <div style={{ position: "absolute", left: "8%", top: 2, width: "20%", height: 20, background: C.indigo + "bb", borderRadius: 3 }} />
                    <div style={{ position: "absolute", left: "30%", top: 2, width: "25%", height: 20, background: C.teal + "bb", borderRadius: 3 }} />
                    <div style={{ position: "absolute", left: "57%", top: 2, width: "20%", height: 20, background: C.gold + "bb", borderRadius: 3 }} />
                    <div style={{ position: "absolute", left: "80%", top: 2, width: "12%", height: 20, background: C.violet + "88", borderRadius: 3 }} />
                    <div style={{ position: "absolute", left: "48%", top: 0, bottom: 0, width: 2, background: C.gold, boxShadow: "0 0 8px " + C.gold }} />
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", marginTop: 6 }}>
                    {["6a", "9a", "12p", "3p", "6p", "9p", "12a"].map(t => <span key={t} style={{ fontFamily: ff.mono, fontSize: 7, color: C.textFaint }}>{t}</span>)}
                  </div>
                </div>

                {/* Live feed */}
                <div style={{ padding: "10px 12px", background: "rgba(255,255,255,0.02)", borderRadius: 8, border: "1px solid " + C.border }}>
                  <div key={feedIdx} style={{ display: "flex", alignItems: "center", gap: 10, animation: "feedSlide 0.4s ease" }}>
                    <div style={{ width: 28, height: 28, borderRadius: 8, background: currentFeed.color + "18", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, flexShrink: 0 }}>{currentFeed.icon}</div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontFamily: ff.body, fontSize: 11, color: C.text, fontWeight: 500 }}>{currentFeed.text}</div>
                      <div style={{ fontFamily: ff.mono, fontSize: 8, color: C.textDim }}>{currentFeed.loc} · just now</div>
                    </div>
                    <div style={{ width: 6, height: 6, borderRadius: "50%", background: currentFeed.color, animation: "pulse2 1.5s infinite", flexShrink: 0 }} />
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* ═══════ ANIMATED COUNTERS BAR ═══════ */}
      <section style={{ padding: "40px 24px", borderTop: "1px solid " + C.border, borderBottom: "1px solid " + C.border, background: C.bgCard }}>
        <div style={{ maxWidth: 900, margin: "0 auto", display: "grid", gridTemplateColumns: isMobile ? "1fr 1fr" : "repeat(4,1fr)", gap: 20, textAlign: "center" }}>
          {[
            { val: 247, suffix: "+", label: "Businesses", color: C.gold },
            { val: 3847, suffix: "", label: "Employees managed", color: C.teal },
            { val: 12480, suffix: "", label: "Hours tracked this month", color: C.indigo },
            { val: 98, suffix: "%", label: "Uptime SLA", color: C.green },
          ].map(s => (
            <div key={s.label}>
              <div style={{ fontFamily: ff.display, fontSize: isMobile ? 32 : 40, fontWeight: 900, color: s.color, letterSpacing: "-0.03em" }}>
                <AnimCounter end={s.val} suffix={s.suffix} duration={2200} />
              </div>
              <div style={{ fontFamily: ff.mono, fontSize: 9, letterSpacing: 1.5, color: C.textDim, marginTop: 4 }}>{s.label.toUpperCase()}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ═══════ PROBLEM/SOLUTION ═══════ */}
      <section id="problem" data-reveal className={"reveal2 " + (vis.has("problem") ? "vis" : "")} style={{ padding: isMobile ? "80px 20px" : "120px 24px" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 56 }}>
            <div style={{ fontFamily: ff.mono, fontSize: 9, letterSpacing: 3, color: C.gold, marginBottom: 10 }}>THE PROBLEM</div>
            <h2 style={{ fontFamily: ff.display, fontSize: isMobile ? 32 : "clamp(38px,5vw,60px)", fontWeight: 800, letterSpacing: "-0.025em", color: C.text, lineHeight: 1.05, marginBottom: 14 }}>
              You didn't open a restaurant to<br /><span style={{ fontFamily: ff.display, fontStyle: "italic", fontWeight: 300, color: C.gold }}>manage spreadsheets</span>.
            </h2>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: isTablet ? "1fr" : "1fr 1fr", gap: 24 }}>
            {/* Before */}
            <div style={{ background: "rgba(239,68,68,0.03)", border: "1px solid rgba(239,68,68,0.12)", borderRadius: 20, padding: isMobile ? 24 : 32 }}>
              <div style={{ fontFamily: ff.mono, fontSize: 9, letterSpacing: 2, color: C.red, marginBottom: 14 }}>WITHOUT SHIFTPRO</div>
              <div style={{ fontFamily: ff.display, fontSize: 24, fontWeight: 700, color: C.text, marginBottom: 18, lineHeight: 1.15, fontStyle: "italic" }}>"Who's working Saturday?"</div>
              <div style={{ fontFamily: ff.mono, fontSize: 11, color: C.textMuted, lineHeight: 2.2, padding: 16, background: "rgba(0,0,0,0.3)", borderRadius: 10, border: "1px dashed rgba(239,68,68,0.15)" }}>
                <div>📱 15 unread group texts</div>
                <div>📧 3 swap request emails</div>
                <div>📊 schedule_v4_FINAL_USE_THIS.xlsx</div>
                <div>📝 Missing paper timesheet</div>
                <div>☎️ Kayla calling in — voicemail</div>
                <div style={{ color: C.red, marginTop: 6 }}>⚠ 2 no-shows this week</div>
                <div style={{ color: C.red }}>⚠ Payroll due in 4 hours</div>
              </div>
            </div>
            {/* After */}
            <div style={{ background: "rgba(45,212,191,0.03)", border: "1px solid rgba(45,212,191,0.12)", borderRadius: 20, padding: isMobile ? 24 : 32 }}>
              <div style={{ fontFamily: ff.mono, fontSize: 9, letterSpacing: 2, color: C.teal, marginBottom: 14 }}>WITH SHIFTPRO</div>
              <div style={{ fontFamily: ff.display, fontSize: 24, fontWeight: 700, color: C.text, marginBottom: 18, lineHeight: 1.15, fontStyle: "italic" }}>Everything just works.</div>
              <div style={{ fontFamily: ff.body, fontSize: 13, color: C.textMuted, lineHeight: 2.4, padding: 16, background: "rgba(0,0,0,0.3)", borderRadius: 10, border: "1px solid rgba(45,212,191,0.1)" }}>
                <div style={{ color: C.teal }}>✓ Schedule built in 10 minutes</div>
                <div style={{ color: C.teal }}>✓ Team notified instantly — push + email</div>
                <div style={{ color: C.teal }}>✓ Jake posted Sat for swap → Sarah claimed it</div>
                <div style={{ color: C.teal }}>✓ You approved in one tap from your phone</div>
                <div style={{ color: C.teal }}>✓ GPS clock-in verified</div>
                <div style={{ color: C.teal }}>✓ Hours auto-tallied for payroll</div>
                <div style={{ color: C.teal }}>✓ Zero no-shows</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════ FEATURES ═══════ */}
      <section id="features" data-reveal className={"reveal2 " + (vis.has("features") ? "vis" : "")} style={{ padding: isMobile ? "80px 20px" : "100px 24px", background: C.bgCard, borderTop: "1px solid " + C.border }}>
        <div style={{ maxWidth: 1280, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 56 }}>
            <div style={{ fontFamily: ff.mono, fontSize: 9, letterSpacing: 3, color: C.gold, marginBottom: 10 }}>FEATURES</div>
            <h2 style={{ fontFamily: ff.display, fontSize: isMobile ? 32 : "clamp(38px,5vw,56px)", fontWeight: 800, letterSpacing: "-0.025em", color: C.text, marginBottom: 12 }}>
              Eight modules.<br /><span style={{ fontStyle: "italic", fontWeight: 300, color: C.gold }}>One platform.</span>
            </h2>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : isTablet ? "1fr 1fr" : "repeat(4,1fr)", gap: 14 }}>
            {[
              { icon: "📅", title: "Scheduling", desc: "Drag-and-drop weekly + monthly. One-click publish.", color: C.indigo },
              { icon: "⏱", title: "GPS Time Clock", desc: "Clock in from any phone. Geofencing verifies location.", color: C.teal },
              { icon: "🔄", title: "Shift Swaps", desc: "Employees post, coworkers claim, you approve. Done.", color: C.gold },
              { icon: "💬", title: "Messaging", desc: "Threaded chats. Broadcasts. Push + email alerts.", color: C.violet },
              { icon: "📁", title: "Documents", desc: "W-4s, IDs, certifications. Secure cloud storage.", color: "#0891b2" },
              { icon: "🔔", title: "Notifications", desc: "Push to phones. Email on every event that matters.", color: C.red },
              { icon: "📍", title: "Multi-Location", desc: "All your spots. One dashboard. Switch in one click.", color: "#f59e0b" },
              { icon: "👤", title: "Employee Portal", desc: "Self-serve: shifts, clock, messages, docs, availability.", color: C.green },
            ].map(f => (
              <div key={f.title} style={{ padding: isMobile ? 22 : 26, background: C.bg, border: "1px solid " + C.border, borderRadius: 16, transition: "all 0.25s", cursor: "default" }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = f.color + "50"; e.currentTarget.style.transform = "translateY(-3px)"; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = C.border; e.currentTarget.style.transform = "none"; }}>
                <div style={{ fontSize: 28, marginBottom: 12 }}>{f.icon}</div>
                <div style={{ fontFamily: ff.display, fontSize: 16, fontWeight: 700, color: C.text, marginBottom: 6, letterSpacing: "-0.01em" }}>{f.title}</div>
                <div style={{ fontFamily: ff.body, fontSize: 12.5, color: C.textMuted, lineHeight: 1.5 }}>{f.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════ ROI CALCULATOR ═══════ */}
      <section id="roi" data-reveal className={"reveal2 " + (vis.has("roi") ? "vis" : "")} style={{ padding: isMobile ? "80px 20px" : "100px 24px" }}>
        <div style={{ maxWidth: 900, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 48 }}>
            <div style={{ fontFamily: ff.mono, fontSize: 9, letterSpacing: 3, color: C.gold, marginBottom: 10 }}>SAVINGS CALCULATOR</div>
            <h2 style={{ fontFamily: ff.display, fontSize: isMobile ? 32 : 48, fontWeight: 800, letterSpacing: "-0.025em", color: C.text, marginBottom: 12 }}>
              How much is scheduling <span style={{ fontStyle: "italic", fontWeight: 300, color: C.gold }}>costing you</span>?
            </h2>
          </div>

          <div style={{ background: C.bgCard, border: "1px solid " + C.border, borderRadius: 22, padding: isMobile ? 24 : 40, boxShadow: "0 20px 60px rgba(0,0,0,0.3)" }}>
            <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr 1fr", gap: 20, marginBottom: 32 }}>
              <div>
                <label style={{ fontFamily: ff.mono, fontSize: 9, letterSpacing: 1.5, color: C.textDim, display: "block", marginBottom: 8 }}>HOURS/WEEK ON SCHEDULING</label>
                <input type="range" min={1} max={20} value={roiHours} onChange={e => setRoiHours(+e.target.value)} style={{ width: "100%", accentColor: C.gold }} />
                <div style={{ fontFamily: ff.display, fontSize: 32, fontWeight: 800, color: C.gold, marginTop: 6 }}>{roiHours}h</div>
              </div>
              <div>
                <label style={{ fontFamily: ff.mono, fontSize: 9, letterSpacing: 1.5, color: C.textDim, display: "block", marginBottom: 8 }}>YOUR HOURLY VALUE ($)</label>
                <input type="range" min={15} max={75} step={5} value={roiRate} onChange={e => setRoiRate(+e.target.value)} style={{ width: "100%", accentColor: C.gold }} />
                <div style={{ fontFamily: ff.display, fontSize: 32, fontWeight: 800, color: C.gold, marginTop: 6 }}>${roiRate}</div>
              </div>
              <div>
                <label style={{ fontFamily: ff.mono, fontSize: 9, letterSpacing: 1.5, color: C.textDim, display: "block", marginBottom: 8 }}>TEAM SIZE</label>
                <input type="range" min={3} max={50} value={roiTeam} onChange={e => setRoiTeam(+e.target.value)} style={{ width: "100%", accentColor: C.gold }} />
                <div style={{ fontFamily: ff.display, fontSize: 32, fontWeight: 800, color: C.gold, marginTop: 6 }}>{roiTeam}</div>
              </div>
            </div>

            <div style={{ borderTop: "1px solid " + C.border, paddingTop: 28 }}>
              <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr 1fr", gap: 20, textAlign: "center" }}>
                <div>
                  <div style={{ fontFamily: ff.mono, fontSize: 9, letterSpacing: 1.5, color: C.textDim, marginBottom: 6 }}>TIME SAVED PER YEAR</div>
                  <div style={{ fontFamily: ff.display, fontSize: 36, fontWeight: 900, color: C.teal }}>{roiHours * 50}h</div>
                </div>
                <div>
                  <div style={{ fontFamily: ff.mono, fontSize: 9, letterSpacing: 1.5, color: C.textDim, marginBottom: 6 }}>VALUE OF TIME SAVED</div>
                  <div style={{ fontFamily: ff.display, fontSize: 36, fontWeight: 900, color: C.green }}>${roiYearlySaved.toLocaleString()}</div>
                </div>
                <div>
                  <div style={{ fontFamily: ff.mono, fontSize: 9, letterSpacing: 1.5, color: C.textDim, marginBottom: 6 }}>SHIFTPRO COSTS YOU</div>
                  <div style={{ fontFamily: ff.display, fontSize: 36, fontWeight: 900, color: C.text }}>${roiShiftProCost.toLocaleString()}<span style={{ fontSize: 14, color: C.textDim }}>/yr</span></div>
                </div>
              </div>
              <div style={{ marginTop: 24, padding: 20, background: "rgba(45,212,191,0.06)", border: "1px solid rgba(45,212,191,0.2)", borderRadius: 14, textAlign: "center" }}>
                <div style={{ fontFamily: ff.mono, fontSize: 10, letterSpacing: 2, color: C.teal, marginBottom: 8 }}>NET SAVINGS PER YEAR</div>
                <div style={{ fontFamily: ff.display, fontSize: isMobile ? 40 : 56, fontWeight: 900, color: C.teal, letterSpacing: "-0.03em" }}>${roiNetSaved.toLocaleString()}</div>
                <div style={{ fontFamily: ff.body, fontSize: 13, color: C.textMuted, marginTop: 6 }}>vs ${(roiWIWCost).toLocaleString()}/yr on When I Work (Pro + time tracking)</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════ FOUNDER NOTE ═══════ */}
      <section id="founder" data-reveal className={"reveal2 " + (vis.has("founder") ? "vis" : "")} style={{ padding: isMobile ? "80px 20px" : "100px 24px", background: C.bgCard, borderTop: "1px solid " + C.border, borderBottom: "1px solid " + C.border }}>
        <div style={{ maxWidth: 680, margin: "0 auto", textAlign: "center" }}>
          <div style={{ width: 64, height: 64, borderRadius: "50%", background: "linear-gradient(135deg," + C.gold + "," + C.goldDark + ")", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px", fontFamily: ff.display, fontSize: 28, fontWeight: 800, color: C.bg }}>B</div>
          <div style={{ fontFamily: ff.display, fontStyle: "italic", fontSize: isMobile ? 22 : 28, fontWeight: 400, color: C.text, lineHeight: 1.5, marginBottom: 24, letterSpacing: "-0.01em" }}>
            "I own a bar, a coffee shop, and a tour company in Newport, Oregon. I built ShiftPro because I was drowning in spreadsheets and group texts. It solved my problem — and now I'm sharing it with you."
          </div>
          <div style={{ fontFamily: ff.body, fontWeight: 700, fontSize: 15, color: C.gold }}>Brendan</div>
          <div style={{ fontFamily: ff.mono, fontSize: 10, color: C.textDim, letterSpacing: 1, marginTop: 4 }}>FOUNDER · BAYSCAPES MANAGEMENT ENTERPRISES</div>
        </div>
      </section>

      {/* ═══════ PRICING ═══════ */}
      <section id="pricing" data-reveal className={"reveal2 " + (vis.has("pricing") ? "vis" : "")} style={{ padding: isMobile ? "80px 20px" : "100px 24px" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 48 }}>
            <div style={{ fontFamily: ff.mono, fontSize: 9, letterSpacing: 3, color: C.gold, marginBottom: 10 }}>PRICING</div>
            <h2 style={{ fontFamily: ff.display, fontSize: isMobile ? 32 : 48, fontWeight: 800, letterSpacing: "-0.025em", color: C.text, marginBottom: 10 }}>
              Simpler. <span style={{ fontStyle: "italic", fontWeight: 300, color: C.gold }}>Cheaper.</span>
            </h2>
            <p style={{ fontFamily: ff.body, color: C.textMuted, fontSize: 15, marginBottom: 6 }}>14-day free trial on all plans. No credit card required.</p>
            <p style={{ fontFamily: ff.mono, color: C.teal, fontSize: 11, fontWeight: 600, letterSpacing: 1 }}>★ TIME TRACKING INCLUDED IN EVERY PLAN — COMPETITORS CHARGE EXTRA</p>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "repeat(3,1fr)", gap: 16 }}>
            {[
              { name: "Essentials", price: "$2.50", per: "/user/mo", desc: "Single-location teams", features: ["Scheduling + time clock", "Team messaging", "Availability management", "Time-off requests", "Mobile PWA", "1 location"], popular: false },
              { name: "Pro", price: "$4", per: "/user/mo", desc: "Growing teams", features: ["Everything in Essentials", "Unlimited locations", "Shift swaps", "Push + email alerts", "Document management", "GPS geofencing", "Priority support"], popular: true },
              { name: "Enterprise", price: "Custom", per: "", desc: "Large operations", features: ["Everything in Pro", "QuickBooks integration", "Custom branding", "API + webhooks", "Dedicated account manager", "SLA guarantee", "SSO / SAML"], popular: false },
            ].map(p => (
              <div key={p.name} style={{ padding: isMobile ? 28 : 32, background: p.popular ? "linear-gradient(160deg, rgba(232,184,75,0.06), rgba(232,184,75,0.01))" : C.bgCard, border: "1px solid " + (p.popular ? C.borderGold : C.border), borderRadius: 20, position: "relative", transition: "all 0.25s" }}
                onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-4px)"; }}
                onMouseLeave={e => { e.currentTarget.style.transform = "none"; }}>
                {p.popular && <div style={{ position: "absolute", top: -11, right: 20, padding: "4px 14px", background: "linear-gradient(135deg," + C.gold + "," + C.goldDark + ")", borderRadius: 20, fontFamily: ff.mono, fontSize: 8, fontWeight: 700, color: C.bg, letterSpacing: 1.5 }}>MOST POPULAR</div>}
                <div style={{ fontFamily: ff.display, fontSize: 18, fontWeight: 700, color: p.popular ? C.gold : C.text, marginBottom: 4 }}>{p.name}</div>
                <div style={{ fontFamily: ff.body, fontSize: 12, color: C.textDim, marginBottom: 16 }}>{p.desc}</div>
                <div style={{ display: "flex", alignItems: "baseline", gap: 3, marginBottom: 22 }}>
                  <span style={{ fontFamily: ff.display, fontSize: 44, fontWeight: 900, color: C.text, letterSpacing: "-0.03em" }}>{p.price}</span>
                  {p.per && <span style={{ fontFamily: ff.mono, fontSize: 12, color: C.textDim }}>{p.per}</span>}
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 24 }}>
                  {p.features.map(f => (
                    <div key={f} style={{ display: "flex", gap: 8, alignItems: "center" }}>
                      <span style={{ color: p.popular ? C.gold : C.teal, fontSize: 11 }}>✓</span>
                      <span style={{ fontFamily: ff.body, fontSize: 13, color: C.text }}>{f}</span>
                    </div>
                  ))}
                </div>
                <a href="/final" style={{ display: "block", textAlign: "center", padding: "13px", borderRadius: 10, background: p.popular ? "linear-gradient(135deg," + C.gold + "," + C.goldDark + ")" : "rgba(255,255,255,0.04)", border: p.popular ? "none" : "1px solid " + C.border, color: p.popular ? C.bg : C.text, fontFamily: ff.body, fontWeight: 700, fontSize: 14 }}>
                  {p.name === "Enterprise" ? "Contact Sales" : "Start Free Trial →"}
                </a>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════ FAQ ═══════ */}
      <section id="faq" data-reveal className={"reveal2 " + (vis.has("faq") ? "vis" : "")} style={{ padding: isMobile ? "80px 20px" : "100px 24px", background: C.bgCard, borderTop: "1px solid " + C.border }}>
        <div style={{ maxWidth: 780, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 48 }}>
            <div style={{ fontFamily: ff.mono, fontSize: 9, letterSpacing: 3, color: C.gold, marginBottom: 10 }}>FAQ</div>
            <h2 style={{ fontFamily: ff.display, fontSize: isMobile ? 32 : 48, fontWeight: 800, letterSpacing: "-0.025em", color: C.text }}>
              Questions? <span style={{ fontStyle: "italic", fontWeight: 300, color: C.gold }}>Answered.</span>
            </h2>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {[
              { q: "Do my employees need to download an app?", a: "No. ShiftPro is a Progressive Web App — employees open shiftpro.ai on their phone, tap 'Add to Home Screen,' and it works like a native app. No app store, no updates." },
              { q: "How long does setup take?", a: "Under 5 minutes. Create your account, add a location, invite your team by email. That's it. Most businesses publish their first schedule the same day." },
              { q: "What happens after the 14-day trial?", a: "You choose a plan. If you don't, your account goes read-only — you never lose your data. We never auto-charge." },
              { q: "Can I cancel anytime?", a: "Yes. One click in settings. No contracts, no cancellation fees. Access continues through the end of your billing period." },
              { q: "Is my data secure?", a: "Yes. TLS encryption in transit, AES-256 at rest. Row-Level Security on every table. Rate limiting. XSS protection. SOC2-grade infrastructure via Supabase." },
              { q: "Do you integrate with QuickBooks?", a: "Coming Q2 2026 on Pro and Enterprise. For now, export payroll as CSV — imports into any accounting tool in seconds." },
              { q: "Why is time tracking included when competitors charge extra?", a: "Because scheduling without time tracking is half a product. We don't believe in nickel-and-diming you for features that should be standard." },
              { q: "What if I have multiple locations?", a: "Pro plan includes unlimited locations. Switch between them with one click. Each gets its own staff, schedule, and geofence." },
            ].map((item, i) => (
              <div key={i} style={{ border: "1px solid " + C.border, borderRadius: 14, overflow: "hidden", background: faqOpen === i ? "rgba(232,184,75,0.02)" : "transparent", transition: "all 0.2s" }}>
                <button onClick={() => setFaqOpen(faqOpen === i ? -1 : i)} style={{ width: "100%", padding: "18px 20px", background: "none", border: "none", display: "flex", justifyContent: "space-between", alignItems: "center", textAlign: "left" }}>
                  <span style={{ fontFamily: ff.body, fontSize: 14, fontWeight: 600, color: C.text }}>{item.q}</span>
                  <span style={{ color: C.gold, fontSize: 20, transition: "transform 0.2s", transform: faqOpen === i ? "rotate(45deg)" : "none", flexShrink: 0, marginLeft: 12 }}>+</span>
                </button>
                {faqOpen === i && (
                  <div style={{ padding: "0 20px 20px", fontFamily: ff.body, fontSize: 13.5, color: C.textMuted, lineHeight: 1.65, animation: "fadeIn 0.2s" }}>{item.a}</div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════ FINAL CTA — INLINE SIGNUP ═══════ */}
      <section style={{ padding: isMobile ? "80px 20px" : "120px 24px" }}>
        <div style={{ maxWidth: 800, margin: "0 auto", padding: isMobile ? "48px 24px" : "64px 48px", background: "linear-gradient(145deg," + C.gold + "," + C.goldDark + ")", borderRadius: 28, textAlign: "center", position: "relative", overflow: "hidden" }}>
          <div style={{ position: "absolute", inset: 0, backgroundImage: "radial-gradient(rgba(7,9,15,0.1) 1.5px, transparent 1.5px)", backgroundSize: "24px 24px", pointerEvents: "none" }} />
          <div style={{ position: "relative" }}>
            <h2 style={{ fontFamily: ff.display, fontSize: isMobile ? 30 : 48, fontWeight: 900, color: C.bg, letterSpacing: "-0.03em", lineHeight: 1, marginBottom: 14 }}>
              This is where your team<br />starts working smarter.
            </h2>
            <p style={{ fontFamily: ff.body, color: "rgba(7,9,15,0.65)", fontSize: 16, marginBottom: 28, fontWeight: 500 }}>Join the businesses that ditched the spreadsheet.</p>

            {/* Inline signup */}
            <form onSubmit={(e) => { e.preventDefault(); window.location.href = "/final?email=" + encodeURIComponent(trialEmail); }} style={{ display: "flex", gap: 8, maxWidth: 460, margin: "0 auto 16px", flexWrap: "wrap", justifyContent: "center" }}>
              <input type="email" value={trialEmail} onChange={e => setTrialEmail(e.target.value)} placeholder="Your work email" required
                style={{ flex: 1, minWidth: 200, padding: "14px 18px", borderRadius: 10, border: "2px solid rgba(7,9,15,0.15)", background: "rgba(255,255,255,0.9)", color: C.bg, fontFamily: ff.body, fontSize: 14, outline: "none" }} />
              <button type="submit" style={{ padding: "14px 28px", borderRadius: 10, background: C.bg, color: C.gold, fontFamily: ff.body, fontWeight: 700, fontSize: 14, border: "none", boxShadow: "0 6px 20px rgba(7,9,15,0.2)", whiteSpace: "nowrap" }}>
                Start 14-Day Trial →
              </button>
            </form>
            <div style={{ fontFamily: ff.mono, fontSize: 10, color: "rgba(7,9,15,0.45)", letterSpacing: 0.5 }}>No credit card. Cancel in 2 clicks. Keep your data forever.</div>
          </div>
        </div>
      </section>

      {/* ═══════ FOOTER ═══════ */}
      <footer style={{ padding: "48px 24px 28px", borderTop: "1px solid " + C.border, background: C.bg }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1.5fr 1fr 1fr 1fr", gap: 32, marginBottom: 36 }}>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
                <div style={{ width: 28, height: 28, borderRadius: 7, background: "linear-gradient(135deg," + C.gold + "," + C.goldDark + ")", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: ff.mono, fontWeight: 700, fontSize: 14, color: C.bg }}>S</div>
                <span style={{ fontFamily: ff.mono, fontWeight: 600, fontSize: 12, letterSpacing: 2, color: C.text }}>SHIFTPRO</span>
              </div>
              <p style={{ fontFamily: ff.body, fontSize: 13, color: C.textMuted, lineHeight: 1.6, maxWidth: 260 }}>Workforce management for shift-based businesses. Built in Newport, Oregon.</p>
            </div>
            <div>
              <div style={{ fontFamily: ff.mono, fontSize: 9, letterSpacing: 2, color: C.textDim, marginBottom: 12 }}>PRODUCT</div>
              {["Features|#features", "Pricing|#pricing", "How it works|#tour", "Start free|/final"].map(s => { const [l, h] = s.split("|"); return <a key={l} href={h} style={{ display: "block", fontFamily: ff.body, fontSize: 13, color: C.textMuted, marginBottom: 8 }}>{l}</a>; })}
            </div>
            <div>
              <div style={{ fontFamily: ff.mono, fontSize: 9, letterSpacing: 2, color: C.textDim, marginBottom: 12 }}>LEGAL</div>
              {["Terms|/terms", "Privacy|/privacy", "Contact|mailto:support@shiftpro.ai"].map(s => { const [l, h] = s.split("|"); return <a key={l} href={h} style={{ display: "block", fontFamily: ff.body, fontSize: 13, color: C.textMuted, marginBottom: 8 }}>{l}</a>; })}
            </div>
            <div>
              <div style={{ fontFamily: ff.mono, fontSize: 9, letterSpacing: 2, color: C.textDim, marginBottom: 12 }}>ACCOUNT</div>
              <button onClick={openLogin} style={{ display: "block", padding: 0, background: "none", border: "none", fontFamily: ff.body, fontSize: 13, color: C.textMuted, marginBottom: 8, textAlign: "left" }}>Sign In</button>
              <a href="/final" style={{ display: "block", fontFamily: ff.body, fontSize: 13, color: C.gold, fontWeight: 600 }}>Create account →</a>
            </div>
          </div>
          <div style={{ paddingTop: 20, borderTop: "1px solid " + C.border, display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 10 }}>
            <span style={{ fontFamily: ff.mono, fontSize: 9, color: C.textFaint, letterSpacing: 0.5 }}>© 2026 BAYSCAPES MANAGEMENT ENTERPRISES · NEWPORT, OR</span>
            <span style={{ fontFamily: ff.mono, fontSize: 9, color: C.textFaint }}>MADE WITH ☕ ON THE OREGON COAST</span>
          </div>
        </div>
      </footer>
    </>
  );
}
