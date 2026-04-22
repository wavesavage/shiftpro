"use client";
import React, { useState, useEffect, useRef } from "react";
import ShiftProAppContent from "@/components/ShiftProAppContent";

// ═══════════════════════════════════════════════════════════════
// SESSION-AWARE ROOT
// ═══════════════════════════════════════════════════════════════
// If a Supabase session exists → show the app.
// If not → show the public landing page.
// A tiny loading flash is shown while we check (prevents hydration mismatch
// and the landing-then-app flash on authed page loads).
// ═══════════════════════════════════════════════════════════════
export default function Page() {
  const [status, setStatus] = useState("checking"); // "checking" | "authed" | "anon"

  useEffect(() => {
    let cancelled = false;
    let unsub = null;
    (async () => {
      try {
        const { createClient } = await import("@supabase/supabase-js");
        const sb = createClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL,
          process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
        );
        const { data: { session } } = await sb.auth.getSession();
        if (cancelled) return;
        setStatus(session ? "authed" : "anon");

        // Listen for login/logout changes so the view swaps live
        const { data: sub } = sb.auth.onAuthStateChange((_event, s) => {
          if (!cancelled) setStatus(s ? "authed" : "anon");
        });
        unsub = sub?.subscription;
      } catch (e) {
        console.warn("[root session check]", e?.message);
        if (!cancelled) setStatus("anon");
      }
    })();
    return () => { cancelled = true; try { unsub?.unsubscribe?.(); } catch (e) {} };
  }, []);

  // Brief loading flash — matches landing page ocean-100 bg so there's no harsh flash
  if (status === "checking") {
    return (
      <div style={{minHeight:"100vh",background:"#e8f1f7",display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"'Inter',system-ui,sans-serif"}}>
        <div style={{width:24,height:24,border:"2px solid rgba(12,18,32,0.1)",borderTopColor:"#e07b00",borderRadius:"50%",animation:"spin 0.9s linear infinite"}}/>
        <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      </div>
    );
  }

  return status === "authed" ? <ShiftProAppContent /> : <LandingPage />;
}

// ═══════════════════════════════════════════════════════════════
// COLOR TOKENS — exact hex, strict usage rules
// ═══════════════════════════════════════════════════════════════
const C = {
  // Ocean
  ocean50: "#f4f9fc",
  ocean100: "#e8f1f7",
  ocean200: "#d8e6ef",
  ocean300: "#bed2e0",
  ocean700: "#1e3a5f",
  ocean900: "#0c1220",
  ocean950: "#070d18",

  // Amber (brand)
  amber50: "#fff6e8",
  amber100: "#feeacf",
  amber400: "#f5a623",
  amber500: "#e07b00",
  amber600: "#c96800",
  amber700: "#a55400",

  // Accents (sparingly)
  teal500: "#14b8a6",
  teal600: "#0d9488",
  coral500: "#f97316",
  rose500: "#ec4899",
  violet500: "#8b5cf6",
  violet600: "#7c3aed",
  sky500: "#0ea5e9",
  sky700: "#0369a1",
  indigo700: "#1e7fd4",

  // Semantic
  success: "#10b981",
  danger: "#ef4444",

  // Text
  t1: "#0c1220",
  t2: "#334155",
  t3: "#64748b",
  t4: "#94a3b8",

  // Dividers
  border: "rgba(12,18,32,0.06)",
  borderSoft: "rgba(12,18,32,0.04)",
};

const ff = {
  display: "'Fraunces', Georgia, serif",
  body: "'Inter', system-ui, sans-serif",
  mono: "'JetBrains Mono', ui-monospace, monospace",
};

// ═══════════════════════════════════════════════════════════════
// GLOBAL STYLES
// ═══════════════════════════════════════════════════════════════
const GCSS = `
@import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,300;0,9..144,400;0,9..144,600;0,9..144,700;0,9..144,800;0,9..144,900;1,9..144,300;1,9..144,400;1,9..144,600;1,9..144,700;1,9..144,800&family=Inter:wght@300;400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600;700&display=swap');

*{box-sizing:border-box;margin:0;padding:0;}
html{scroll-behavior:smooth;-webkit-font-smoothing:antialiased;-moz-osx-font-smoothing:grayscale;}
body{background:${C.ocean100};color:${C.t1};overflow-x:hidden;font-family:${ff.body};font-feature-settings:"kern","liga","calt","ss01";}
input,select,textarea,button{font-size:16px;font-family:inherit;}
a{text-decoration:none;color:inherit;}

/* tabular nums helper */
.tn{font-variant-numeric:tabular-nums;}

/* scrollbar */
::-webkit-scrollbar{width:8px;height:8px;background:${C.ocean100};}
::-webkit-scrollbar-thumb{background:${C.ocean300};border-radius:4px;}
::-webkit-scrollbar-thumb:hover{background:${C.ocean700}33;}

/* selection */
::selection{background:${C.amber500};color:#fff;}

/* reveals */
.rv{opacity:0;transform:translateY(36px);transition:opacity .85s cubic-bezier(.22,1,.36,1),transform .85s cubic-bezier(.22,1,.36,1);}
.rv.vis{opacity:1;transform:none;}
.rv-d1{transition-delay:.08s;}
.rv-d2{transition-delay:.16s;}
.rv-d3{transition-delay:.24s;}
.rv-d4{transition-delay:.32s;}

/* keyframes */
@keyframes fadeUp{from{opacity:0;transform:translateY(28px)}to{opacity:1;transform:none}}
@keyframes fadeIn{from{opacity:0}to{opacity:1}}
@keyframes pulse{0%,100%{opacity:.4;transform:scale(1)}50%{opacity:1;transform:scale(1.1)}}
@keyframes drift{0%,100%{transform:translate(0,0)}50%{transform:translate(18px,-12px)}}
@keyframes drift2{0%,100%{transform:translate(0,0)}50%{transform:translate(-22px,14px)}}
@keyframes marquee{0%{transform:translateX(0)}100%{transform:translateX(-50%)}}
@keyframes feedIn{from{opacity:0;transform:translateY(-10px)}to{opacity:1;transform:none}}
@keyframes tilt{0%{transform:perspective(1800px) rotateY(-5deg) rotateX(3deg)}100%{transform:perspective(1800px) rotateY(-1deg) rotateX(6deg)}}
@keyframes float{0%,100%{transform:translateY(0)}50%{transform:translateY(-6px)}}
@keyframes sheen{0%{background-position:-200% 0}100%{background-position:200% 0}}

/* range inputs */
input[type="range"]{-webkit-appearance:none;appearance:none;height:4px;background:${C.ocean200};border-radius:2px;outline:none;cursor:pointer;}
input[type="range"]::-webkit-slider-thumb{-webkit-appearance:none;appearance:none;width:22px;height:22px;background:${C.amber500};border-radius:50%;cursor:pointer;box-shadow:0 4px 12px rgba(224,123,0,.4),0 0 0 4px rgba(224,123,0,.08);border:2px solid #fff;}
input[type="range"]::-moz-range-thumb{width:22px;height:22px;background:${C.amber500};border-radius:50%;cursor:pointer;border:2px solid #fff;box-shadow:0 4px 12px rgba(224,123,0,.4);}

/* button hover arrow */
.arrow{display:inline-block;margin-left:4px;transition:transform .2s cubic-bezier(.22,1,.36,1);}
.btn-primary:hover .arrow{transform:translateX(5px);}

/* link underline grow */
.ul-grow{position:relative;display:inline-block;}
.ul-grow::after{content:"";position:absolute;left:0;bottom:-2px;width:0;height:1px;background:currentColor;transition:width .24s cubic-bezier(.22,1,.36,1);}
.ul-grow:hover::after{width:100%;}
`;

// ═══════════════════════════════════════════════════════════════
// SWIRLMARK — ShiftPro logo (ocean + amber swirl)
// ═══════════════════════════════════════════════════════════════
function SwirlMark({ size = 36 }) {
  const uid = "sm";
  return (
    <svg width={size} height={size} viewBox="0 0 130 130" xmlns="http://www.w3.org/2000/svg" style={{ flexShrink: 0, overflow: "visible" }}>
      <defs>
        <linearGradient id={uid + "g1"} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#00d4ff" /><stop offset="100%" stopColor="#0066cc" />
        </linearGradient>
        <linearGradient id={uid + "g2"} x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#f59e0b" /><stop offset="100%" stopColor="#fbbf24" />
        </linearGradient>
        <linearGradient id={uid + "g3"} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#38bdf8" /><stop offset="100%" stopColor="#0ea5e9" />
        </linearGradient>
        <filter id={uid + "gl"}><feGaussianBlur stdDeviation="2" result="b" /><feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge></filter>
      </defs>
      <g transform="translate(65,65)">
        <circle cx="0" cy="0" r="57" fill="none" stroke="rgba(0,212,255,0.15)" strokeWidth="7" />
        <path d="M -50 14 A 53 53 0 0 1 18 -50 L 11 -33 A 36 36 0 0 0 -33 9 Z" fill={"url(#" + uid + "g1)"} opacity="0.95" filter={"url(#" + uid + "gl)"} />
        <path d="M 18 -50 A 53 53 0 0 1 50 16 L 33 11 A 36 36 0 0 0 13 -33 Z" fill="#1e7fd4" opacity="0.9" />
        <path d="M 50 16 A 53 53 0 0 1 -50 14 L -33 9 A 36 36 0 0 0 33 11 Z" fill="#0c4fa0" opacity="0.85" />
        <path d="M -27 -48 A 55 55 0 0 1 48 -26 L 40 -17 A 44 44 0 0 0 -20 -38 Z" fill={"url(#" + uid + "g2)"} opacity="1" filter={"url(#" + uid + "gl)"} />
        <circle cx="0" cy="0" r="20" fill="rgba(14,165,233,0.12)" />
        <circle cx="0" cy="0" r="20" fill="none" stroke={"url(#" + uid + "g3)"} strokeWidth="1.5" opacity="0.65" />
        <circle cx="0" cy="0" r="9.5" fill={"url(#" + uid + "g1)"} filter={"url(#" + uid + "gl)"} />
        <circle cx="0" cy="0" r="4.5" fill="#fff" opacity="0.92" />
        <circle cx="0" cy="0" r="2.2" fill="#00d4ff" />
      </g>
    </svg>
  );
}

// ═══════════════════════════════════════════════════════════════
// INLINE SVG ICON LIBRARY (no external deps)
// ═══════════════════════════════════════════════════════════════
const SVG = {
  check: (s = 14, col = "currentColor") => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={col} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>,
  arrowRight: (s = 14) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" /></svg>,
  arrowDown: (s = 14) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19" /><polyline points="19 12 12 19 5 12" /></svg>,
  shieldCheck: (s = 28, col = "currentColor") => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={col} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /><path d="M9 12l2 2 4-4" /></svg>,
  zap: (s = 28, col = "currentColor") => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={col} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" /></svg>,
  phone: (s = 28, col = "currentColor") => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={col} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><rect x="5" y="2" width="14" height="20" rx="2.5" /><circle cx="12" cy="18" r="0.6" fill={col} /></svg>,
  compass: (s = 28, col = "currentColor") => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={col} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76" /></svg>,
  close: (s = 22) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>,
  user: (s = 24, col = "#fff") => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={col} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>,
  menu: (s = 20) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="4" y1="7" x2="20" y2="7" /><line x1="4" y1="12" x2="20" y2="12" /><line x1="4" y1="17" x2="20" y2="17" /></svg>,
  plus: (s = 18) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>,
  // Industry icons
  beer: (s = 20, col = "currentColor") => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={col} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M17 11h1a3 3 0 0 1 0 6h-1" /><path d="M9 12v6" /><path d="M13 12v6" /><path d="M14 7.5c-1 0-1.44.5-3 .5s-2-.5-3-.5S5.5 8 5 8.5v13a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-13c-.5-.5-1-1-3-1z" /><path d="M5 8v13a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V8" /></svg>,
  coffee: (s = 20, col = "currentColor") => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={col} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M17 8h1a4 4 0 1 1 0 8h-1" /><path d="M3 8h14v9a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4V8z" /><line x1="6" y1="2" x2="6" y2="4" /><line x1="10" y1="2" x2="10" y2="4" /><line x1="14" y1="2" x2="14" y2="4" /></svg>,
  utensils: (s = 20, col = "currentColor") => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={col} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2" /><line x1="7" y1="2" x2="7" y2="22" /><path d="M21 15V2v0a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3z" /></svg>,
  hotel: (s = 20, col = "currentColor") => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={col} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M10 22v-6.57" /><path d="M12 11h.01" /><path d="M12 7h.01" /><path d="M14 15.43V22" /><path d="M15 16a5 5 0 0 0-6 0" /><path d="M16 11h.01" /><path d="M16 7h.01" /><path d="M8 11h.01" /><path d="M8 7h.01" /><rect x="4" y="2" width="16" height="20" rx="2" /></svg>,
  ship: (s = 20, col = "currentColor") => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={col} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M2 21c.6.5 1.2 1 2.5 1 2.5 0 2.5-2 5-2s2.5 2 5 2 2.5-2 5-2c1.3 0 1.9.5 2.5 1" /><path d="M19.38 20A11.6 11.6 0 0 0 21 14l-9-4-9 4c0 2.9.94 5.34 2.81 7.76" /><path d="M19 13V7a2 2 0 0 0-2-2H7a2 2 0 0 0-2 2v6" /><path d="M12 10v4" /><path d="M12 2v3" /></svg>,
  store: (s = 20, col = "currentColor") => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={col} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="m2 7 4.41-4.41A2 2 0 0 1 7.83 2h8.34a2 2 0 0 1 1.42.59L22 7" /><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" /><path d="M15 22v-4a2 2 0 0 0-2-2h-2a2 2 0 0 0-2 2v4" /><path d="M2 7h20" /><path d="M22 7v3a2 2 0 0 1-2 2v0a2.7 2.7 0 0 1-1.59-.63.7.7 0 0 0-.82 0A2.7 2.7 0 0 1 16 12a2.7 2.7 0 0 1-1.59-.63.7.7 0 0 0-.82 0A2.7 2.7 0 0 1 12 12a2.7 2.7 0 0 1-1.59-.63.7.7 0 0 0-.82 0A2.7 2.7 0 0 1 8 12a2.7 2.7 0 0 1-1.59-.63.7.7 0 0 0-.82 0A2.7 2.7 0 0 1 4 12v0a2 2 0 0 1-2-2V7" /></svg>,
  stethoscope: (s = 20, col = "currentColor") => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={col} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M4.8 2.3A.3.3 0 1 0 5 2H4a2 2 0 0 0-2 2v5a6 6 0 0 0 6 6v0a6 6 0 0 0 6-6V4a2 2 0 0 0-2-2h-1a.2.2 0 1 0 .3.3" /><path d="M8 15v1a6 6 0 0 0 6 6v0a6 6 0 0 0 6-6v-4" /><circle cx="20" cy="10" r="2" /></svg>,
  landmark: (s = 20, col = "currentColor") => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={col} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="22" x2="21" y2="22" /><line x1="6" y1="18" x2="6" y2="11" /><line x1="10" y1="18" x2="10" y2="11" /><line x1="14" y1="18" x2="14" y2="11" /><line x1="18" y1="18" x2="18" y2="11" /><polygon points="12 2 20 7 4 7" /></svg>,
  building: (s = 20, col = "currentColor") => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={col} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M6 22V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v18Z" /><path d="M6 12H4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h2" /><path d="M18 9h2a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2h-2" /><path d="M10 6h4" /><path d="M10 10h4" /><path d="M10 14h4" /><path d="M10 18h4" /></svg>,
  tent: (s = 20, col = "currentColor") => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={col} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3.5 21 14 3" /><path d="M20.5 21 10 3" /><path d="M15.5 21 12 15l-3.5 6" /><path d="M2 21h20" /></svg>,
  // Feed icons
  clockIn: (s = 14, col = "currentColor") => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={col} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="9" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="12" x2="15" y2="15" /></svg>,
  swap: (s = 14, col = "currentColor") => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={col} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M7 10h13" /><path d="m17 7 3 3-3 3" /><path d="M17 14H4" /><path d="m7 11-3 3 3 3" /></svg>,
  checkCircle: (s = 14, col = "currentColor") => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={col} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="9" /><polyline points="9 12 11 14 15 9" /></svg>,
  message: (s = 14, col = "currentColor") => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={col} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" /></svg>,
  grid: (s = 14, col = "currentColor") => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={col} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" /><rect x="3" y="14" width="7" height="7" /><rect x="14" y="14" width="7" height="7" /></svg>,
  calendar: (s = 14, col = "currentColor") => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={col} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="5" width="18" height="16" rx="2" /><line x1="3" y1="10" x2="21" y2="10" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="16" y1="2" x2="16" y2="6" /></svg>,
  clockOut: (s = 14, col = "currentColor") => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={col} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="9" /><line x1="8" y1="12" x2="16" y2="12" /></svg>,
  // Problem-panel icons
  msgSq: (s = 13, col = "currentColor") => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={col} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" /></svg>,
  mail: (s = 13, col = "currentColor") => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={col} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" /><polyline points="22,6 12,13 2,6" /></svg>,
  sheet: (s = 13, col = "currentColor") => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={col} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="8" y1="13" x2="16" y2="13" /><line x1="8" y1="17" x2="16" y2="17" /></svg>,
  fileTxt: (s = 13, col = "currentColor") => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={col} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /></svg>,
  phoneMissed: (s = 13, col = "currentColor") => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={col} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="16" y2="8" /><line x1="16" y1="2" x2="22" y2="8" /><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" /></svg>,
  warn: (s = 13, col = "currentColor") => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={col} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" /><line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" /></svg>,
  clockRed: (s = 13, col = "currentColor") => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={col} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>,
  // Clock big icon
  clockBig: (s = 72, col = "currentColor") => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={col} strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>,
};

// ═══════════════════════════════════════════════════════════════
// LIVE FEED DATA — cycles in hero command center
// ═══════════════════════════════════════════════════════════════
const FEED = [
  { icon: SVG.clockIn, text: "Jake Mendoza clocked in", loc: "Sea Lion · Bartender", color: C.teal500 },
  { icon: SVG.swap, text: "Sarah posted Sat shift for swap", loc: "Surf Town · Barista", color: C.coral500 },
  { icon: SVG.checkCircle, text: "Manager approved Sarah's swap", loc: "Surf Town", color: C.success },
  { icon: SVG.message, text: "Priya sent message to manager", loc: "Marine Discovery", color: C.violet500 },
  { icon: SVG.grid, text: "Schedule published · 12 notified", loc: "Sea Lion", color: C.sky500 },
  { icon: SVG.calendar, text: "Carlos requested June 14–18 off", loc: "Surf Town", color: C.rose500 },
  { icon: SVG.clockOut, text: "Anya clocked out · 8.25h logged", loc: "Sea Lion · Server", color: C.amber500 },
];

// ═══════════════════════════════════════════════════════════════
// LOGIN MODAL — equal dignity for owner/employee
// ═══════════════════════════════════════════════════════════════
function LoginModal({ open, role, onClose }) {
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
  const isOwner = role === "owner";
  const a1 = isOwner ? C.amber500 : C.sky500;
  const a2 = isOwner ? C.amber700 : C.sky700;
  const label = isOwner ? "Owner" : "Employee";

  return (
    <div onClick={onClose} style={{ position: "fixed", inset: 0, background: "rgba(12,18,32,0.58)", backdropFilter: "blur(14px)", WebkitBackdropFilter: "blur(14px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, padding: 20, animation: "fadeIn 0.24s" }}>
      <div onClick={(e) => e.stopPropagation()} style={{ width: "100%", maxWidth: 420, background: "#fff", borderRadius: 22, border: "1px solid " + C.border, padding: "36px 32px", animation: "fadeUp 0.4s cubic-bezier(.22,1,.36,1)", boxShadow: "0 40px 100px rgba(12,18,32,0.25), 0 0 0 1px rgba(255,255,255,0.7)", position: "relative" }}>
        <button onClick={onClose} aria-label="Close" style={{ position: "absolute", top: 14, right: 14, width: 34, height: 34, borderRadius: 10, background: "transparent", border: "none", color: C.t3, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", transition: "all .15s" }} onMouseEnter={(e) => { e.currentTarget.style.background = C.ocean100; e.currentTarget.style.color = C.t1; }} onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = C.t3; }}>
          {SVG.close(20)}
        </button>
        <div style={{ textAlign: "center", marginBottom: 26 }}>
          <div style={{ width: 56, height: 56, borderRadius: 16, background: "linear-gradient(135deg," + a1 + "," + a2 + ")", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 18px", boxShadow: "0 8px 24px " + a1 + "55, inset 0 1px 0 rgba(255,255,255,0.2)" }}>
            {SVG.user(26, "#fff")}
          </div>
          <div style={{ fontFamily: ff.mono, fontSize: 10, letterSpacing: 3, color: a1, marginBottom: 8, fontWeight: 600, textTransform: "uppercase" }}>{label} · Sign In</div>
          <div style={{ fontFamily: ff.display, fontSize: 30, fontWeight: 600, fontStyle: "italic", color: C.t1, letterSpacing: "-0.02em", lineHeight: 1 }}>Welcome back.</div>
        </div>
        <form onSubmit={submit}>
          <label style={{ display: "block", fontFamily: ff.mono, fontSize: 9, letterSpacing: 1.8, color: C.t3, marginBottom: 6, textTransform: "uppercase", fontWeight: 600 }}>Email</label>
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required placeholder="you@business.com"
            style={{ width: "100%", padding: "13px 14px", background: C.ocean100, border: "1px solid " + C.ocean200, borderRadius: 10, color: C.t1, outline: "none", fontSize: 14, fontFamily: ff.body, marginBottom: 14, transition: "all .15s" }}
            onFocus={(e) => { e.currentTarget.style.borderColor = a1; e.currentTarget.style.background = "#fff"; }}
            onBlur={(e) => { e.currentTarget.style.borderColor = C.ocean200; e.currentTarget.style.background = C.ocean100; }} />
          <label style={{ display: "block", fontFamily: ff.mono, fontSize: 9, letterSpacing: 1.8, color: C.t3, marginBottom: 6, textTransform: "uppercase", fontWeight: 600 }}>Password</label>
          <input type="password" value={pw} onChange={(e) => setPw(e.target.value)} required placeholder="••••••••••"
            style={{ width: "100%", padding: "13px 14px", background: C.ocean100, border: "1px solid " + C.ocean200, borderRadius: 10, color: C.t1, outline: "none", fontSize: 14, fontFamily: ff.body, marginBottom: 18, transition: "all .15s" }}
            onFocus={(e) => { e.currentTarget.style.borderColor = a1; e.currentTarget.style.background = "#fff"; }}
            onBlur={(e) => { e.currentTarget.style.borderColor = C.ocean200; e.currentTarget.style.background = C.ocean100; }} />
          {err && <div style={{ padding: "10px 12px", background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)", borderRadius: 8, fontSize: 12.5, color: C.danger, marginBottom: 14, fontFamily: ff.body, fontWeight: 500 }}>{err}</div>}
          <button type="submit" disabled={busy} style={{ width: "100%", padding: "14px", borderRadius: 11, border: "none", background: busy ? C.ocean300 : "linear-gradient(135deg," + a1 + "," + a2 + ")", color: "#fff", fontFamily: ff.body, fontWeight: 700, fontSize: 14.5, marginBottom: 14, cursor: busy ? "wait" : "pointer", boxShadow: busy ? "none" : "0 4px 18px " + a1 + "55", transition: "all .2s", letterSpacing: "-0.01em" }}>
            {busy ? "Signing in…" : "Sign In"}
          </button>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12.5, fontFamily: ff.body }}>
            <a href="/forgot" className="ul-grow" style={{ color: C.t3 }}>Forgot password?</a>
            <a href="/final" className="ul-grow" style={{ color: a1, fontWeight: 600 }}>Create account</a>
          </div>
        </form>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// MAIN PAGE
// ═══════════════════════════════════════════════════════════════
function LandingPage() {
  const [scrolled, setScrolled] = useState(false);
  const [loginOpen, setLoginOpen] = useState(false);
  const [loginRole, setLoginRole] = useState("owner");
  const [vis, setVis] = useState(new Set());
  const [vw, setVw] = useState(1200);
  const [feedIdx, setFeedIdx] = useState(0);
  const [tourStep, setTourStep] = useState(0);
  const [faqOpen, setFaqOpen] = useState(-1);
  const [roiHours, setRoiHours] = useState(6);
  const [roiRate, setRoiRate] = useState(25);
  const [roiTeam, setRoiTeam] = useState(12);
  const [trialEmail, setTrialEmail] = useState("");
  const [mobileNav, setMobileNav] = useState(false);

  useEffect(() => {
    setVw(window.innerWidth);
    const resize = () => setVw(window.innerWidth);
    const scroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("resize", resize);
    window.addEventListener("scroll", scroll);
    return () => { window.removeEventListener("resize", resize); window.removeEventListener("scroll", scroll); };
  }, []);

  useEffect(() => {
    const obs = new IntersectionObserver((entries) => {
      entries.forEach(e => { if (e.isIntersecting) setVis(p => new Set([...p, e.target.getAttribute("data-rv")])); });
    }, { threshold: 0.1, rootMargin: "0px 0px -50px 0px" });
    document.querySelectorAll("[data-rv]").forEach(el => obs.observe(el));
    return () => obs.disconnect();
  }, []);

  useEffect(() => {
    const iv = setInterval(() => setFeedIdx(p => (p + 1) % FEED.length), 3000);
    return () => clearInterval(iv);
  }, []);

  const isMobile = vw < 768;
  const isTablet = vw < 1024;
  const openLogin = (role) => { setLoginRole(role); setLoginOpen(true); setMobileNav(false); };
  const shown = (id) => vis.has(id);

  // ROI derived
  const roiYearlyTimeSaved = roiHours * 50;
  const roiValueSaved = roiYearlyTimeSaved * roiRate;
  const roiShiftProCost = roiTeam * 4 * 12;
  const roiWIWCost = roiTeam * 7 * 12;
  const roiNet = roiValueSaved - roiShiftProCost;

  const feed = FEED[feedIdx];

  return (
    <>
      <style>{GCSS}</style>
      <LoginModal open={loginOpen} role={loginRole} onClose={() => setLoginOpen(false)} />

      {/* ═══════════════════════════════════════════════════════════
          NAVIGATION
          ═══════════════════════════════════════════════════════════ */}
      <nav style={{ position: "fixed", top: 0, left: 0, right: 0, zIndex: 100, padding: "0 24px", background: scrolled ? "rgba(232,241,247,0.78)" : "transparent", borderBottom: "1px solid " + (scrolled ? C.border : "transparent"), backdropFilter: scrolled ? "blur(20px) saturate(180%)" : "none", WebkitBackdropFilter: scrolled ? "blur(20px) saturate(180%)" : "none", transition: "all 0.35s cubic-bezier(.22,1,.36,1)" }}>
        <div style={{ maxWidth: 1280, margin: "0 auto", height: isMobile ? 60 : 68, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16 }}>
          <a href="/" style={{ display: "flex", alignItems: "center", gap: 11, flexShrink: 0 }}>
            <SwirlMark size={36} />
            <div style={{ display: "flex", flexDirection: "column", lineHeight: 1 }}>
              <span style={{ fontFamily: ff.display, fontWeight: 700, fontSize: 20, color: C.t1, letterSpacing: "-0.03em" }}>ShiftPro<span style={{ color: C.amber500 }}>.ai</span></span>
              <span style={{ fontFamily: ff.mono, fontSize: 8, color: C.amber500, letterSpacing: 2.5, marginTop: 3, opacity: 0.72, fontWeight: 600 }}>WORKFORCE PRO</span>
            </div>
          </a>

          {!isMobile && (
            <div style={{ display: "flex", gap: 1, padding: 3, background: "#fff", border: "1px solid " + C.ocean200, borderRadius: 11, boxShadow: "0 1px 3px rgba(12,18,32,0.04)" }}>
              <button onClick={() => openLogin("owner")} style={{ padding: "8px 20px", borderRadius: 8, border: "none", background: "transparent", color: C.t2, fontFamily: ff.body, fontWeight: 600, fontSize: 13, cursor: "pointer", transition: "all 0.15s", letterSpacing: "-0.005em" }} onMouseEnter={(e) => { e.currentTarget.style.background = C.amber50; e.currentTarget.style.color = C.amber500; }} onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = C.t2; }}>
                Owner Login
              </button>
              <div style={{ width: 1, background: C.ocean200, margin: "5px 0" }} />
              <button onClick={() => openLogin("employee")} style={{ padding: "8px 20px", borderRadius: 8, border: "none", background: "transparent", color: C.t2, fontFamily: ff.body, fontWeight: 600, fontSize: 13, cursor: "pointer", transition: "all 0.15s", letterSpacing: "-0.005em" }} onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(14,165,233,0.08)"; e.currentTarget.style.color = C.sky700; }} onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = C.t2; }}>
                Employee Login
              </button>
            </div>
          )}

          <div style={{ display: "flex", gap: 8, flexShrink: 0, alignItems: "center" }}>
            {!isMobile && (
              <a href="#tour" style={{ padding: "10px 18px", borderRadius: 10, border: "1px solid " + C.ocean200, background: "#fff", color: C.t1, fontFamily: ff.body, fontWeight: 600, fontSize: 13, transition: "all .15s" }} onMouseEnter={(e) => { e.currentTarget.style.borderColor = C.amber500; e.currentTarget.style.background = C.amber50; }} onMouseLeave={(e) => { e.currentTarget.style.borderColor = C.ocean200; e.currentTarget.style.background = "#fff"; }}>
                See Demo
              </a>
            )}
            <a href="/final" className="btn-primary" style={{ padding: "10px 22px", borderRadius: 10, background: "linear-gradient(135deg," + C.amber500 + "," + C.amber600 + ")", color: "#fff", fontFamily: ff.body, fontWeight: 700, fontSize: 13, boxShadow: "0 4px 14px rgba(224,123,0,0.28)", transition: "all .2s", letterSpacing: "-0.005em", display: "inline-flex", alignItems: "center" }} onMouseEnter={(e) => { e.currentTarget.style.transform = "translateY(-1px)"; e.currentTarget.style.boxShadow = "0 6px 20px rgba(224,123,0,0.4)"; }} onMouseLeave={(e) => { e.currentTarget.style.transform = "none"; e.currentTarget.style.boxShadow = "0 4px 14px rgba(224,123,0,0.28)"; }}>
              Create Account<span className="arrow">{SVG.arrowRight(13)}</span>
            </a>
            {isMobile && (
              <button onClick={() => setMobileNav(!mobileNav)} style={{ padding: 10, borderRadius: 9, border: "1px solid " + C.ocean200, background: "#fff", color: C.t1, cursor: "pointer", display: "flex" }}>
                {mobileNav ? SVG.close(20) : SVG.menu(20)}
              </button>
            )}
          </div>
        </div>

        {isMobile && mobileNav && (
          <div style={{ borderTop: "1px solid " + C.border, padding: "16px 20px", background: "#fff", display: "flex", flexDirection: "column", gap: 10, animation: "fadeIn .2s" }}>
            <button onClick={() => openLogin("owner")} style={{ padding: "13px", borderRadius: 10, border: "1px solid rgba(224,123,0,0.22)", background: C.amber50, color: C.amber600, fontFamily: ff.body, fontWeight: 600, fontSize: 14, cursor: "pointer" }}>Owner Login</button>
            <button onClick={() => openLogin("employee")} style={{ padding: "13px", borderRadius: 10, border: "1px solid rgba(14,165,233,0.22)", background: "rgba(14,165,233,0.06)", color: C.sky700, fontFamily: ff.body, fontWeight: 600, fontSize: 14, cursor: "pointer" }}>Employee Login</button>
            <a href="#tour" onClick={() => setMobileNav(false)} style={{ padding: "13px", borderRadius: 10, border: "1px solid " + C.ocean200, background: C.ocean100, color: C.t1, fontFamily: ff.body, fontWeight: 600, fontSize: 14, textAlign: "center" }}>See Demo</a>
          </div>
        )}
      </nav>

      {/* ═══════════════════════════════════════════════════════════
          HERO — establishing shot with live command center
          ═══════════════════════════════════════════════════════════ */}
      <section style={{ position: "relative", minHeight: "100vh", padding: isMobile ? "128px 20px 72px" : (isTablet ? "140px 32px 88px" : "144px 24px 96px"), overflow: "hidden", display: "flex", alignItems: "center" }}>
        {/* Atmospheric gradient orbs */}
        <div aria-hidden style={{ position: "absolute", top: "8%", left: "-5%", width: 640, height: 640, background: "radial-gradient(circle, rgba(224,123,0,0.14) 0%,transparent 62%)", animation: "drift 22s ease-in-out infinite", filter: "blur(80px)", pointerEvents: "none" }} />
        <div aria-hidden style={{ position: "absolute", top: "30%", right: "-8%", width: 620, height: 620, background: "radial-gradient(circle, rgba(30,127,212,0.11) 0%,transparent 62%)", animation: "drift2 28s ease-in-out infinite", filter: "blur(80px)", pointerEvents: "none" }} />
        <div aria-hidden style={{ position: "absolute", bottom: "-10%", left: "35%", width: 520, height: 520, background: "radial-gradient(circle, rgba(139,92,246,0.09) 0%,transparent 62%)", animation: "drift 32s ease-in-out infinite reverse", filter: "blur(80px)", pointerEvents: "none" }} />
        {/* Dot grid */}
        <div aria-hidden style={{ position: "absolute", inset: 0, backgroundImage: "radial-gradient(rgba(12,18,32,0.045) 1px, transparent 1px)", backgroundSize: "44px 44px", maskImage: "radial-gradient(ellipse 80% 70% at 50% 50%, black 20%, transparent 75%)", WebkitMaskImage: "radial-gradient(ellipse 80% 70% at 50% 50%, black 20%, transparent 75%)", pointerEvents: "none" }} />

        <div style={{ position: "relative", maxWidth: 1280, width: "100%", margin: "0 auto", display: "grid", gridTemplateColumns: isTablet ? "1fr" : "1.05fr 1fr", gap: isMobile ? 56 : 64, alignItems: "center" }}>
          {/* LEFT */}
          <div>
            <div style={{ display: "inline-flex", alignItems: "center", gap: 10, padding: "7px 16px 7px 8px", background: "#fff", border: "1px solid " + C.ocean200, borderRadius: 40, marginBottom: 32, boxShadow: "0 1px 3px rgba(12,18,32,0.04)", animation: "fadeUp 0.7s cubic-bezier(.22,1,.36,1) both" }}>
              <span style={{ width: 22, height: 22, borderRadius: "50%", background: "rgba(20,184,166,0.14)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <span style={{ width: 7, height: 7, borderRadius: "50%", background: C.teal500, animation: "pulse 1.8s infinite" }} />
              </span>
              <span style={{ fontFamily: ff.mono, fontSize: 10, letterSpacing: 1.8, color: C.teal600, fontWeight: 600, textTransform: "uppercase" }}>Now Live · Built by a Business Owner to create daily Scheduling and Management solutions!</span>
            </div>

            <h1 style={{ fontFamily: ff.display, fontSize: isMobile ? 52 : "clamp(64px,9vw,128px)", lineHeight: 0.88, fontWeight: 800, letterSpacing: "-0.04em", marginBottom: 26, color: C.t1, animation: "fadeUp 0.85s cubic-bezier(.22,1,.36,1) 0.1s both" }}>
              Your team.<br />
              <span style={{ fontFamily: ff.display, fontStyle: "italic", fontWeight: 300, color: C.amber500 }}>On autopilot.</span>
            </h1>

            <p style={{ fontFamily: ff.body, fontSize: isMobile ? 17 : 19, color: C.t2, lineHeight: 1.55, marginBottom: 38, maxWidth: 520, fontWeight: 400, animation: "fadeUp 0.85s cubic-bezier(.22,1,.36,1) 0.22s both" }}>
              ShiftPro replaces your spreadsheets, group texts, and paper timesheets with one platform your team will actually open.
            </p>

            <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginBottom: 32, animation: "fadeUp 0.85s cubic-bezier(.22,1,.36,1) 0.34s both" }}>
              <a href="/final" className="btn-primary" style={{ padding: "16px 28px", borderRadius: 12, background: "linear-gradient(135deg," + C.amber500 + "," + C.amber600 + ")", color: "#fff", fontFamily: ff.body, fontWeight: 700, fontSize: 15, boxShadow: "0 10px 30px rgba(224,123,0,0.32)", display: "inline-flex", alignItems: "center", letterSpacing: "-0.01em", transition: "all .2s" }} onMouseEnter={(e) => { e.currentTarget.style.transform = "translateY(-1px)"; e.currentTarget.style.boxShadow = "0 12px 36px rgba(224,123,0,0.4)"; }} onMouseLeave={(e) => { e.currentTarget.style.transform = "none"; e.currentTarget.style.boxShadow = "0 10px 30px rgba(224,123,0,0.32)"; }}>
                Start 7-Day Free Trial<span className="arrow">{SVG.arrowRight(14)}</span>
              </a>
              <a href="#tour" style={{ padding: "16px 24px", borderRadius: 12, border: "1px solid " + C.ocean300, background: "#fff", color: C.t1, fontFamily: ff.body, fontWeight: 600, fontSize: 15, display: "inline-flex", alignItems: "center", gap: 6, letterSpacing: "-0.01em", transition: "all .2s" }} onMouseEnter={(e) => { e.currentTarget.style.borderColor = C.amber500; e.currentTarget.style.background = C.amber50; }} onMouseLeave={(e) => { e.currentTarget.style.borderColor = C.ocean300; e.currentTarget.style.background = "#fff"; }}>
                Watch How It Works{SVG.arrowDown(14)}
              </a>
            </div>

            <div style={{ display: "flex", gap: isMobile ? 16 : 28, fontFamily: ff.mono, fontSize: 11, color: C.t3, flexWrap: "wrap", fontWeight: 500, animation: "fadeUp 0.85s cubic-bezier(.22,1,.36,1) 0.46s both" }}>
              <div style={{ display: "inline-flex", alignItems: "center", gap: 6 }}><span style={{ color: C.teal500 }}>{SVG.check(12, C.teal500)}</span>No credit card</div>
              <div style={{ display: "inline-flex", alignItems: "center", gap: 6 }}><span style={{ color: C.teal500 }}>{SVG.check(12, C.teal500)}</span>5-min setup</div>
              <div style={{ display: "inline-flex", alignItems: "center", gap: 6 }}><span style={{ color: C.teal500 }}>{SVG.check(12, C.teal500)}</span>Cancel anytime</div>
            </div>
          </div>

          {/* RIGHT — Live command center */}
          {!isTablet && (
            <div style={{ perspective: 1800, animation: "fadeUp 1s cubic-bezier(.22,1,.36,1) 0.3s both" }}>
              <div style={{ background: "linear-gradient(160deg," + C.ocean950 + " 0%,#0e1628 100%)", borderRadius: 24, padding: 22, border: "1px solid rgba(255,255,255,0.06)", boxShadow: "0 60px 120px -24px rgba(12,18,32,0.4), 0 0 0 1px rgba(224,123,0,0.06), inset 0 1px 0 rgba(255,255,255,0.04)", animation: "tilt 7s ease-in-out infinite alternate", transformStyle: "preserve-3d", transformOrigin: "center" }}>
                {/* Window chrome */}
                <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 16, paddingBottom: 14, borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
                  <div style={{ width: 9, height: 9, borderRadius: "50%", background: "#ef4444" }} />
                  <div style={{ width: 9, height: 9, borderRadius: "50%", background: "#f59e0b" }} />
                  <div style={{ width: 9, height: 9, borderRadius: "50%", background: "#10b981" }} />
                  <div style={{ marginLeft: 12, padding: "3px 10px", background: "rgba(255,255,255,0.04)", borderRadius: 20, fontFamily: ff.mono, fontSize: 10, color: "#94a3b8", letterSpacing: 0.5 }}>shiftpro.ai/command</div>
                  <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 5 }}>
                    <span style={{ width: 6, height: 6, borderRadius: "50%", background: C.teal500, animation: "pulse 2s infinite" }} />
                    <span style={{ fontFamily: ff.mono, fontSize: 8, color: C.teal500, letterSpacing: 1.5, fontWeight: 600 }}>LIVE</span>
                  </div>
                </div>

                {/* Stat tiles */}
                <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 8, marginBottom: 12 }}>
                  {[
                    { label: "TEAM", val: "23", color: C.violet500 },
                    { label: "ON SHIFT", val: "8", color: C.teal500 },
                    { label: "HOURS", val: "187h", color: C.amber400 },
                    { label: "COVERAGE", val: "94%", color: C.success },
                  ].map(s => (
                    <div key={s.label} style={{ padding: "12px 10px", background: "rgba(255,255,255,0.025)", borderRadius: 9, border: "1px solid rgba(255,255,255,0.05)" }}>
                      <div style={{ fontFamily: ff.mono, fontSize: 7.5, color: "#64748b", letterSpacing: 1.2, marginBottom: 4, fontWeight: 600 }}>{s.label}</div>
                      <div style={{ fontFamily: ff.display, fontSize: 24, fontWeight: 800, color: s.color, letterSpacing: "-0.03em", fontVariantNumeric: "tabular-nums", lineHeight: 1 }}>{s.val}</div>
                    </div>
                  ))}
                </div>

                {/* Coverage timeline */}
                <div style={{ padding: 13, background: "rgba(0,0,0,0.3)", borderRadius: 10, marginBottom: 12, border: "1px solid rgba(255,255,255,0.04)" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                    <span style={{ fontFamily: ff.body, fontSize: 11, color: "#f1f5f9", fontWeight: 600 }}>Today's Coverage</span>
                    <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                      <span style={{ width: 5, height: 5, borderRadius: "50%", background: C.teal500 }} />
                      <span style={{ fontFamily: ff.mono, fontSize: 8, color: C.teal500, letterSpacing: 1.5, fontWeight: 600 }}>LIVE</span>
                    </div>
                  </div>
                  <div style={{ height: 26, background: "rgba(255,255,255,0.03)", borderRadius: 5, position: "relative", overflow: "hidden" }}>
                    <div style={{ position: "absolute", left: "8%", top: 2, width: "20%", height: 22, background: C.violet500, opacity: 0.85, borderRadius: 3 }} />
                    <div style={{ position: "absolute", left: "30%", top: 2, width: "25%", height: 22, background: C.teal500, opacity: 0.85, borderRadius: 3 }} />
                    <div style={{ position: "absolute", left: "57%", top: 2, width: "20%", height: 22, background: C.amber500, opacity: 0.85, borderRadius: 3 }} />
                    <div style={{ position: "absolute", left: "80%", top: 2, width: "12%", height: 22, background: C.rose500, opacity: 0.7, borderRadius: 3 }} />
                    <div style={{ position: "absolute", left: "48%", top: 0, bottom: 0, width: 2, background: C.amber400, boxShadow: "0 0 10px " + C.amber400 }} />
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", marginTop: 7 }}>
                    {["6a", "9a", "12p", "3p", "6p", "9p", "12a"].map(t => <span key={t} style={{ fontFamily: ff.mono, fontSize: 7, color: "#475569", letterSpacing: 0.5 }}>{t}</span>)}
                  </div>
                </div>

                {/* Live event feed */}
                <div style={{ padding: "11px 12px", background: "rgba(255,255,255,0.025)", borderRadius: 9, border: "1px solid rgba(255,255,255,0.05)" }}>
                  <div key={feedIdx} style={{ display: "flex", alignItems: "center", gap: 11, animation: "feedIn 0.4s cubic-bezier(.22,1,.36,1)" }}>
                    <div style={{ width: 30, height: 30, borderRadius: 8, background: feed.color + "22", display: "flex", alignItems: "center", justifyContent: "center", color: feed.color, flexShrink: 0 }}>
                      {feed.icon(14, feed.color)}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontFamily: ff.body, fontSize: 11.5, color: "#f1f5f9", fontWeight: 500, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{feed.text}</div>
                      <div style={{ fontFamily: ff.mono, fontSize: 8, color: "#64748b", letterSpacing: 0.5, marginTop: 2 }}>{feed.loc} · just now</div>
                    </div>
                    <div style={{ width: 6, height: 6, borderRadius: "50%", background: feed.color, animation: "pulse 1.5s infinite", flexShrink: 0 }} />
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          INDUSTRIES MARQUEE
          ═══════════════════════════════════════════════════════════ */}
      <section style={{ padding: "36px 0", borderTop: "1px solid " + C.border, borderBottom: "1px solid " + C.border, background: "#fff", overflow: "hidden" }}>
        <div style={{ textAlign: "center", marginBottom: 20 }}>
          <span style={{ fontFamily: ff.mono, fontSize: 10, letterSpacing: 3, color: C.t3, fontWeight: 600, textTransform: "uppercase" }}>Built for shift-based businesses</span>
        </div>
        <div style={{ overflow: "hidden", maskImage: "linear-gradient(90deg, transparent, black 8%, black 92%, transparent)", WebkitMaskImage: "linear-gradient(90deg, transparent, black 8%, black 92%, transparent)" }}>
          <div style={{ display: "flex", gap: 56, animation: "marquee 48s linear infinite", whiteSpace: "nowrap", width: "max-content" }}>
            {[...Array(2)].map((_, rd) => (
              <React.Fragment key={rd}>
                {[
                  { icon: SVG.beer, label: "Bars & Breweries" },
                  { icon: SVG.coffee, label: "Coffee Shops" },
                  { icon: SVG.utensils, label: "Restaurants" },
                  { icon: SVG.hotel, label: "Hotels" },
                  { icon: SVG.ship, label: "Tour Companies" },
                  { icon: SVG.store, label: "Retail" },
                  { icon: SVG.stethoscope, label: "Clinics" },
                  { icon: SVG.landmark, label: "Government" },
                  { icon: SVG.building, label: "Corporations" },
                  { icon: SVG.tent, label: "Event Venues" },
                ].map((b, i) => (
                  <span key={rd + "-" + i} style={{ display: "inline-flex", alignItems: "center", gap: 10, fontFamily: ff.mono, fontSize: 13, color: C.t3, letterSpacing: 1.2, fontWeight: 500, textTransform: "uppercase" }}>
                    <span style={{ color: C.t3 }}>{b.icon(20, C.t3)}</span>{b.label}
                  </span>
                ))}
              </React.Fragment>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          WHY SHIFTPRO — four promises
          ═══════════════════════════════════════════════════════════ */}
      <section data-rv="why" style={{ padding: isMobile ? "96px 20px" : (isTablet ? "112px 32px" : "128px 40px"), background: C.ocean100 }}>
        <div style={{ maxWidth: 1120, margin: "0 auto" }}>
          <div data-rv="why-h" className={"rv " + (shown("why-h") ? "vis" : "")} style={{ textAlign: "center", marginBottom: 56 }}>
            <div style={{ display: "inline-flex", alignItems: "center", gap: 14, marginBottom: 18 }}>
              <span style={{ width: 32, height: 1, background: C.amber500, opacity: 0.5 }} />
              <span style={{ fontFamily: ff.mono, fontSize: 10, letterSpacing: 3, color: C.amber500, fontWeight: 600, textTransform: "uppercase" }}>Why ShiftPro</span>
              <span style={{ width: 32, height: 1, background: C.amber500, opacity: 0.5 }} />
            </div>
            <h2 style={{ fontFamily: ff.display, fontSize: isMobile ? 34 : "clamp(44px,5.5vw,72px)", fontWeight: 700, letterSpacing: "-0.032em", color: C.t1, lineHeight: 0.98 }}>
              Four promises.<br /><span style={{ fontStyle: "italic", fontWeight: 300, color: C.amber500 }}>Zero fine print.</span>
            </h2>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr 1fr" : "repeat(4,1fr)", gap: 16 }}>
            {[
              {
                icon: SVG.shieldCheck, color: C.ocean700,
                title: "Encrypted end-to-end", detail: "TLS · AES-256 · RLS",
                body: "Row-level security on every table. Rate limiting. XSS protection. Your data is as safe as it would be inside a bank.",
              },
              {
                icon: SVG.zap, color: C.amber500,
                title: "Live in 5 minutes", detail: "No sales call",
                body: "Create account, add a location, invite your team. Most businesses publish their first schedule the same afternoon.",
              },
              {
                icon: SVG.phone, color: C.teal600,
                title: "Works on any phone", detail: "No app store",
                body: "Progressive Web App. Open shiftpro.ai, tap 'Add to Home Screen.' That's installation. No updates to push, ever.",
              },
              {
                icon: SVG.compass, color: C.violet500,
                title: "Built in Oregon", detail: "By a real owner",
                body: "Designed by someone who runs a bar, a coffee shop, and a tour company. Every feature solves a problem we had.",
              },
            ].map((s, i) => (
              <div key={s.title} data-rv={"why-" + i} className={"rv rv-d" + (i + 1) + " " + (shown("why-" + i) ? "vis" : "")} style={{ padding: "28px 24px", background: "#fff", border: "1px solid " + C.border, borderRadius: 18, boxShadow: "0 1px 2px rgba(12,18,32,0.04)", transition: "all 0.3s cubic-bezier(.22,1,.36,1)", cursor: "default" }}
                onMouseEnter={(e) => { e.currentTarget.style.transform = "translateY(-3px)"; e.currentTarget.style.boxShadow = "0 12px 32px rgba(12,18,32,0.08)"; e.currentTarget.style.borderColor = s.color + "66"; }}
                onMouseLeave={(e) => { e.currentTarget.style.transform = "none"; e.currentTarget.style.boxShadow = "0 1px 2px rgba(12,18,32,0.04)"; e.currentTarget.style.borderColor = C.border; }}>
                <div style={{ width: 48, height: 48, borderRadius: 13, background: s.color + "16", display: "flex", alignItems: "center", justifyContent: "center", color: s.color, marginBottom: 20 }}>{s.icon(26, s.color)}</div>
                <div style={{ fontFamily: ff.body, fontWeight: 600, fontSize: 15, color: C.t1, marginBottom: 4, letterSpacing: "-0.015em" }}>{s.title}</div>
                <div style={{ fontFamily: ff.mono, fontSize: 10, color: C.t3, letterSpacing: 1, textTransform: "uppercase", fontWeight: 500, marginBottom: 14 }}>{s.detail}</div>
                <div style={{ fontFamily: ff.body, fontSize: 13.5, color: C.t2, lineHeight: 1.55 }}>{s.body}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          PROBLEM — editorial asymmetric split
          ═══════════════════════════════════════════════════════════ */}
      <section data-rv="prob" style={{ padding: isMobile ? "96px 20px" : (isTablet ? "112px 32px" : "128px 40px"), background: "#fff", position: "relative", overflow: "hidden" }}>
        <div style={{ maxWidth: 1120, margin: "0 auto" }}>
          <div data-rv="prob-h" className={"rv " + (shown("prob-h") ? "vis" : "")} style={{ textAlign: "center", marginBottom: 64 }}>
            <div style={{ fontFamily: ff.mono, fontSize: 11, letterSpacing: 2.5, color: C.amber500, marginBottom: 16, fontWeight: 600, textTransform: "uppercase" }}>The Problem</div>
            <h2 style={{ fontFamily: ff.display, fontSize: isMobile ? 34 : "clamp(44px,5.5vw,72px)", fontWeight: 700, letterSpacing: "-0.032em", color: C.t1, lineHeight: 0.98 }}>
              You didn't open a business<br />to <span style={{ fontStyle: "italic", fontWeight: 300, color: C.amber500 }}>manage spreadsheets.</span>
            </h2>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: isTablet ? "1fr" : "44fr 56fr", gap: isTablet ? 24 : 40, alignItems: "start" }}>
            {/* WITHOUT — narrower, slightly lower */}
            <div data-rv="prob-l" className={"rv rv-d1 " + (shown("prob-l") ? "vis" : "")} style={{ background: "linear-gradient(158deg, rgba(239,68,68,0.05), rgba(249,115,22,0.015))", border: "1px solid rgba(239,68,68,0.15)", borderRadius: 22, padding: isMobile ? 26 : 36, marginTop: isTablet ? 0 : 32 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 18 }}>
                <span style={{ width: 20, height: 1, background: C.danger, opacity: 0.5 }} />
                <span style={{ fontFamily: ff.mono, fontSize: 10, letterSpacing: 2, color: C.danger, fontWeight: 600, textTransform: "uppercase" }}>Without ShiftPro</span>
              </div>
              <div style={{ fontFamily: ff.display, fontStyle: "italic", fontSize: isMobile ? 26 : 32, fontWeight: 400, color: C.t1, marginBottom: 26, lineHeight: 1.1, letterSpacing: "-0.015em" }}>"Who's working Saturday?"</div>
              <div style={{ padding: 18, background: C.ocean50, borderRadius: 12, border: "1px dashed rgba(239,68,68,0.18)" }}>
                {[
                  { icon: SVG.msgSq, col: C.t2, txt: "15 unread group texts" },
                  { icon: SVG.mail, col: C.t2, txt: "3 swap request emails" },
                  { icon: SVG.sheet, col: C.t2, txt: "schedule_v4_FINAL_USE_THIS.xlsx" },
                  { icon: SVG.fileTxt, col: C.t2, txt: "Missing paper timesheet" },
                  { icon: SVG.phoneMissed, col: C.t2, txt: "Kayla calling in — voicemail" },
                  { icon: SVG.warn, col: C.danger, txt: "2 no-shows this week" },
                  { icon: SVG.clockRed, col: C.danger, txt: "Payroll due in 4 hours" },
                ].map((row, i) => (
                  <div key={i} style={{ display: "flex", alignItems: "center", gap: 11, padding: "7px 0", borderBottom: i < 6 ? "1px dotted rgba(12,18,32,0.06)" : "none" }}>
                    <span style={{ color: row.col, display: "flex", flexShrink: 0 }}>{row.icon(14, row.col)}</span>
                    <span style={{ fontFamily: ff.mono, fontSize: 12, color: row.col, fontWeight: row.col === C.danger ? 600 : 400 }}>{row.txt}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Vertical divider (desktop) */}
            {!isTablet && (
              <div aria-hidden style={{ position: "relative", gridColumn: "unset", display: "none" }} />
            )}

            {/* WITH — wider, slightly higher (asymmetric) */}
            <div data-rv="prob-r" className={"rv rv-d2 " + (shown("prob-r") ? "vis" : "")} style={{ background: "linear-gradient(158deg, rgba(20,184,166,0.06), rgba(139,92,246,0.03))", border: "1px solid rgba(20,184,166,0.22)", borderRadius: 22, padding: isMobile ? 26 : 40 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 18 }}>
                <span style={{ width: 20, height: 1, background: C.teal600, opacity: 0.6 }} />
                <span style={{ fontFamily: ff.mono, fontSize: 10, letterSpacing: 2, color: C.teal600, fontWeight: 600, textTransform: "uppercase" }}>With ShiftPro</span>
              </div>
              <div style={{ fontFamily: ff.display, fontStyle: "italic", fontSize: isMobile ? 26 : 32, fontWeight: 400, color: C.t1, marginBottom: 26, lineHeight: 1.1, letterSpacing: "-0.015em" }}>"Everything just works."</div>
              <div style={{ padding: 20, background: C.ocean50, borderRadius: 12, border: "1px solid rgba(20,184,166,0.14)" }}>
                {[
                  "Schedule built in 10 minutes",
                  "Team notified instantly — push + email",
                  "Jake posted Sat → Sarah claimed it",
                  "You approved in one tap",
                  "GPS clock-in verified",
                  "Hours auto-tallied for payroll",
                  "Zero no-shows",
                ].map((txt, i) => (
                  <div key={i} style={{ display: "flex", alignItems: "center", gap: 12, padding: "9px 0", borderBottom: i < 6 ? "1px solid rgba(12,18,32,0.04)" : "none" }}>
                    <span style={{ width: 18, height: 18, borderRadius: "50%", background: C.teal500 + "22", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, color: C.teal600 }}>{SVG.check(10, C.teal600)}</span>
                    <span style={{ fontFamily: ff.body, fontSize: 13.5, color: C.t1, fontWeight: 500 }}>{txt}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          PRODUCT TOUR — the centerpiece
          ═══════════════════════════════════════════════════════════ */}
      <section id="tour" data-rv="tour" style={{ padding: isMobile ? "96px 20px" : (isTablet ? "128px 32px" : "144px 40px"), background: C.ocean100 }}>
        <div style={{ maxWidth: 1280, margin: "0 auto" }}>
          <div data-rv="tour-h" className={"rv " + (shown("tour-h") ? "vis" : "")} style={{ textAlign: "center", marginBottom: 56 }}>
            <div style={{ fontFamily: ff.mono, fontSize: 11, letterSpacing: 2.5, color: C.amber500, marginBottom: 16, fontWeight: 600, textTransform: "uppercase" }}>The Product</div>
            <h2 style={{ fontFamily: ff.display, fontSize: isMobile ? 34 : "clamp(44px,5.5vw,72px)", fontWeight: 700, letterSpacing: "-0.032em", color: C.t1, lineHeight: 0.98, marginBottom: 16 }}>
              See it in <span style={{ fontStyle: "italic", fontWeight: 300, color: C.amber500 }}>action.</span>
            </h2>
            <p style={{ fontFamily: ff.body, fontSize: 17, color: C.t2, maxWidth: 560, margin: "0 auto", lineHeight: 1.55 }}>
              Five views. Click through. Everything you see here is real, shipping software.
            </p>
          </div>

          {/* Progress track */}
          <div style={{ marginBottom: 32 }}>
            <div style={{ height: 3, background: C.ocean200, borderRadius: 3, marginBottom: 20, overflow: "hidden", maxWidth: 640, margin: "0 auto 20px" }}>
              <div style={{ width: ((tourStep + 1) / 5) * 100 + "%", height: "100%", background: C.amber500, transition: "width 0.5s cubic-bezier(.22,1,.36,1)", borderRadius: 3 }} />
            </div>

            {/* Tab pills */}
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap", justifyContent: "center" }}>
              {[
                { num: "01", title: "Build a Schedule", color: C.amber500 },
                { num: "02", title: "Employee Portal", color: C.violet500 },
                { num: "03", title: "GPS Clock In", color: C.teal600 },
                { num: "04", title: "Shift Swaps", color: C.coral500 },
                { num: "05", title: "Payroll Ready", color: C.indigo700 },
              ].map((t, i) => {
                const active = tourStep === i;
                return (
                  <button key={t.title} onClick={() => setTourStep(i)}
                    style={{ padding: "11px 20px", borderRadius: 40, border: "1.5px solid " + (active ? t.color : C.ocean200), background: active ? t.color + "12" : "#fff", color: active ? t.color : C.t3, fontFamily: ff.body, fontWeight: 600, fontSize: 13, cursor: "pointer", transition: "all 0.2s cubic-bezier(.22,1,.36,1)", boxShadow: active ? "0 4px 14px " + t.color + "33" : "none", display: "inline-flex", alignItems: "center", gap: 8, letterSpacing: "-0.005em" }}
                    onMouseEnter={(e) => { if (!active) { e.currentTarget.style.borderColor = t.color + "66"; e.currentTarget.style.color = C.t1; } }}
                    onMouseLeave={(e) => { if (!active) { e.currentTarget.style.borderColor = C.ocean200; e.currentTarget.style.color = C.t3; } }}>
                    <span style={{ fontFamily: ff.mono, fontSize: 10, opacity: 0.6, fontWeight: 600 }}>{t.num}</span>
                    <span>{t.title}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Tab content card */}
          <div data-rv="tour-content" className={"rv " + (shown("tour-content") ? "vis" : "")} style={{ background: "#fff", border: "1px solid " + C.ocean200, borderRadius: 24, padding: isMobile ? 28 : 56, minHeight: 440, display: "grid", gridTemplateColumns: isTablet ? "1fr" : "1fr 1fr", gap: isMobile ? 32 : 48, alignItems: "center", boxShadow: "0 24px 60px -16px rgba(12,18,32,0.08)" }}>

            {/* ───── TAB 1: SCHEDULE ───── */}
            {tourStep === 0 && (
              <>
                <div style={{ animation: "fadeUp 0.45s cubic-bezier(.22,1,.36,1)" }}>
                  <div style={{ fontFamily: ff.mono, fontSize: 10, letterSpacing: 2, color: C.amber500, marginBottom: 14, fontWeight: 600, textTransform: "uppercase" }}>Schedule Builder</div>
                  <h3 style={{ fontFamily: ff.display, fontSize: isMobile ? 28 : 36, fontWeight: 600, color: C.t1, marginBottom: 16, letterSpacing: "-0.025em", lineHeight: 1.05 }}>
                    Build a week <span style={{ fontStyle: "italic", fontWeight: 300, color: C.amber500 }}>in minutes.</span>
                  </h3>
                  <p style={{ fontFamily: ff.body, fontSize: 15.5, color: C.t2, lineHeight: 1.65, marginBottom: 24 }}>Drag and drop across the grid. See everyone's availability in real time. Publish once — everyone gets a push and email.</p>
                  <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                    {["Weekly grid + monthly calendar", "Availability-aware auto-fill", "Lunch breaks & shift notes", "One-click publish to the whole team"].map(f => (
                      <div key={f} style={{ display: "flex", gap: 10, alignItems: "center" }}>
                        <span style={{ color: C.amber500, flexShrink: 0 }}>{SVG.check(14, C.amber500)}</span>
                        <span style={{ fontFamily: ff.body, fontSize: 14, color: C.t1 }}>{f}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div style={{ background: C.ocean50, borderRadius: 16, padding: 20, border: "1px solid " + C.ocean200, animation: "fadeUp 0.55s cubic-bezier(.22,1,.36,1) 0.08s both" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
                    <div style={{ fontFamily: ff.body, fontSize: 12, color: C.t1, fontWeight: 600 }}>Week of Apr 14</div>
                    <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                      <span style={{ width: 6, height: 6, borderRadius: "50%", background: C.amber500 }} />
                      <span style={{ fontFamily: ff.mono, fontSize: 9, color: C.amber500, fontWeight: 600, letterSpacing: 1, textTransform: "uppercase" }}>Today</span>
                    </div>
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "70px repeat(7,1fr)", gap: 5 }}>
                    <div />
                    {["M", "T", "W", "T", "F", "S", "S"].map((d, i) => (
                      <div key={i} style={{ fontFamily: ff.mono, fontSize: 10, textAlign: "center", color: i === 3 ? C.amber500 : C.t3, fontWeight: 700, paddingBottom: 4 }}>{d}</div>
                    ))}
                    {[
                      { name: "Jake", initials: "JM", color: C.violet500, days: [1, 2, 0, 1, 0, 2, 0] },
                      { name: "Priya", initials: "PK", color: C.teal500, days: [0, 1, 1, 0, 2, 1, 0] },
                      { name: "Carlos", initials: "CR", color: C.amber500, days: [2, 0, 0, 2, 1, 0, 1] },
                      { name: "Anya", initials: "AT", color: C.rose500, days: [0, 0, 2, 0, 0, 1, 2] },
                    ].map(emp => (
                      <React.Fragment key={emp.name}>
                        <div style={{ display: "flex", alignItems: "center", gap: 6, paddingRight: 4 }}>
                          <div style={{ width: 22, height: 22, borderRadius: "50%", background: emp.color, color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: ff.body, fontSize: 9, fontWeight: 700, flexShrink: 0 }}>{emp.initials}</div>
                          <span style={{ fontFamily: ff.body, fontSize: 11, color: C.t1, fontWeight: 500 }}>{emp.name}</span>
                        </div>
                        {emp.days.map((v, di) => (
                          <div key={di} style={{ height: 30, borderRadius: 5, background: v === 0 ? "#fff" : v === 1 ? emp.color + "35" : emp.color, border: v === 0 ? "1px dashed " + C.ocean300 : "1px solid " + emp.color + "80", boxShadow: v === 2 ? "0 2px 4px " + emp.color + "22" : "none" }} />
                        ))}
                      </React.Fragment>
                    ))}
                  </div>
                  <div style={{ marginTop: 14, paddingTop: 12, borderTop: "1px solid " + C.ocean200, display: "flex", gap: 12, flexWrap: "wrap" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 5 }}><span style={{ width: 10, height: 10, borderRadius: 2, background: C.violet500 }} /><span style={{ fontFamily: ff.mono, fontSize: 9, color: C.t3 }}>Full shift</span></div>
                    <div style={{ display: "flex", alignItems: "center", gap: 5 }}><span style={{ width: 10, height: 10, borderRadius: 2, background: C.violet500 + "35", border: "1px solid " + C.violet500 + "80" }} /><span style={{ fontFamily: ff.mono, fontSize: 9, color: C.t3 }}>Half</span></div>
                  </div>
                </div>
              </>
            )}

            {/* ───── TAB 2: EMPLOYEE PORTAL ───── */}
            {tourStep === 1 && (
              <>
                <div style={{ animation: "fadeUp 0.45s cubic-bezier(.22,1,.36,1)" }}>
                  <div style={{ fontFamily: ff.mono, fontSize: 10, letterSpacing: 2, color: C.violet500, marginBottom: 14, fontWeight: 600, textTransform: "uppercase" }}>Employee Portal</div>
                  <h3 style={{ fontFamily: ff.display, fontSize: isMobile ? 28 : 36, fontWeight: 600, color: C.t1, marginBottom: 16, letterSpacing: "-0.025em", lineHeight: 1.05 }}>
                    The team's daily <span style={{ fontStyle: "italic", fontWeight: 300, color: C.violet500 }}>command center.</span>
                  </h3>
                  <p style={{ fontFamily: ff.body, fontSize: 15.5, color: C.t2, lineHeight: 1.65, marginBottom: 24 }}>Every employee gets their own portal. Self-serve shifts, clock, messages, documents, availability. Works on any phone.</p>
                  <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                    {["Push notifications on schedule publish", "Set availability (All Day or custom hours)", "Time-off requests with one tap", "Dark mode + 24-hour time options"].map(f => (
                      <div key={f} style={{ display: "flex", gap: 10, alignItems: "center" }}>
                        <span style={{ color: C.violet500, flexShrink: 0 }}>{SVG.check(14, C.violet500)}</span>
                        <span style={{ fontFamily: ff.body, fontSize: 14, color: C.t1 }}>{f}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div style={{ animation: "fadeUp 0.55s cubic-bezier(.22,1,.36,1) 0.08s both" }}>
                  <div style={{ background: "linear-gradient(145deg," + C.violet500 + " 0%," + C.violet600 + " 100%)", borderRadius: 18, padding: 30, color: "#fff", boxShadow: "0 24px 60px rgba(139,92,246,0.32)", position: "relative", overflow: "hidden" }}>
                    <div aria-hidden style={{ position: "absolute", top: -40, right: -40, width: 160, height: 160, borderRadius: "50%", background: "rgba(255,255,255,0.08)" }} />
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 22, position: "relative" }}>
                      <div>
                        <div style={{ fontFamily: ff.body, fontSize: 14, opacity: 0.88, fontWeight: 500 }}>Good evening, Jake.</div>
                        <div style={{ fontFamily: ff.mono, fontSize: 10, opacity: 0.7, marginTop: 3, letterSpacing: 0.5 }}>Saturday, April 18</div>
                      </div>
                      <div style={{ width: 36, height: 36, borderRadius: 10, background: "rgba(255,255,255,0.15)", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: ff.body, fontSize: 12, fontWeight: 700 }}>JM</div>
                    </div>
                    <div style={{ paddingTop: 20, borderTop: "1px solid rgba(255,255,255,0.18)", position: "relative" }}>
                      <div style={{ fontFamily: ff.mono, fontSize: 10, opacity: 0.9, marginBottom: 8, letterSpacing: 1.5, fontWeight: 600, textTransform: "uppercase" }}>Your shift today</div>
                      <div style={{ fontFamily: ff.display, fontSize: 24, fontWeight: 700, letterSpacing: "-0.02em", marginBottom: 4 }}>5:00 PM – 11:00 PM</div>
                      <div style={{ fontFamily: ff.body, fontSize: 13, opacity: 0.88 }}>Sea Lion Dockside Bar · Bartender</div>
                    </div>
                    <div style={{ marginTop: 22, display: "flex", gap: 10, position: "relative" }}>
                      <button style={{ flex: 1, padding: "12px", background: "rgba(255,255,255,0.18)", border: "1px solid rgba(255,255,255,0.25)", borderRadius: 10, color: "#fff", fontFamily: ff.body, fontWeight: 600, fontSize: 12.5, cursor: "pointer", backdropFilter: "blur(10px)" }}>Clock In</button>
                      <button style={{ flex: 1, padding: "12px", background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.15)", borderRadius: 10, color: "#fff", fontFamily: ff.body, fontSize: 12.5, cursor: "pointer" }}>Request Swap</button>
                    </div>
                  </div>
                </div>
              </>
            )}

            {/* ───── TAB 3: GPS CLOCK ───── */}
            {tourStep === 2 && (
              <>
                <div style={{ animation: "fadeUp 0.45s cubic-bezier(.22,1,.36,1)" }}>
                  <div style={{ fontFamily: ff.mono, fontSize: 10, letterSpacing: 2, color: C.teal600, marginBottom: 14, fontWeight: 600, textTransform: "uppercase" }}>GPS Time Clock</div>
                  <h3 style={{ fontFamily: ff.display, fontSize: isMobile ? 28 : 36, fontWeight: 600, color: C.t1, marginBottom: 16, letterSpacing: "-0.025em", lineHeight: 1.05 }}>
                    One-tap clock in. <span style={{ fontStyle: "italic", fontWeight: 300, color: C.teal600 }}>Verified by GPS.</span>
                  </h3>
                  <p style={{ fontFamily: ff.body, fontSize: 15.5, color: C.t2, lineHeight: 1.65, marginBottom: 24 }}>Geofencing confirms employees are actually on-site. No more buddy punching. No more fuzzy hours.</p>
                  <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                    {["Per-location geofence radius", "Break tracking with lunch periods", "Real-time 'who's clocked in' dashboard", "Automatic overtime calculations"].map(f => (
                      <div key={f} style={{ display: "flex", gap: 10, alignItems: "center" }}>
                        <span style={{ color: C.teal600, flexShrink: 0 }}>{SVG.check(14, C.teal600)}</span>
                        <span style={{ fontFamily: ff.body, fontSize: 14, color: C.t1 }}>{f}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div style={{ animation: "fadeUp 0.55s cubic-bezier(.22,1,.36,1) 0.08s both" }}>
                  <div style={{ background: "linear-gradient(155deg, rgba(20,184,166,0.08), rgba(20,184,166,0.02))", borderRadius: 18, padding: 44, border: "1px solid rgba(20,184,166,0.2)", textAlign: "center", position: "relative", overflow: "hidden" }}>
                    <div aria-hidden style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)", width: 220, height: 220, borderRadius: "50%", border: "1px dashed rgba(20,184,166,0.25)", pointerEvents: "none" }} />
                    <div aria-hidden style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)", width: 160, height: 160, borderRadius: "50%", border: "1px dashed rgba(20,184,166,0.2)", pointerEvents: "none" }} />
                    <div style={{ position: "relative", display: "flex", flexDirection: "column", alignItems: "center" }}>
                      <div style={{ color: C.teal600, marginBottom: 22, animation: "float 3s ease-in-out infinite" }}>{SVG.clockBig(68, C.teal600)}</div>
                      <div style={{ fontFamily: ff.mono, fontSize: 44, color: C.teal600, fontWeight: 700, marginBottom: 8, letterSpacing: "-0.02em", fontVariantNumeric: "tabular-nums" }}>04:23:17</div>
                      <div style={{ fontFamily: ff.mono, fontSize: 10, color: C.t3, letterSpacing: 2, marginBottom: 26, fontWeight: 600, textTransform: "uppercase" }}>Clocked in · Sea Lion Bar</div>
                      <button style={{ padding: "13px 36px", background: "#fff", border: "1px solid rgba(239,68,68,0.3)", color: C.danger, borderRadius: 12, fontFamily: ff.body, fontSize: 13, fontWeight: 600, cursor: "pointer", boxShadow: "0 4px 14px rgba(239,68,68,0.12)", letterSpacing: "-0.005em" }}>Clock Out</button>
                    </div>
                  </div>
                </div>
              </>
            )}

            {/* ───── TAB 4: SHIFT SWAPS ───── */}
            {tourStep === 3 && (
              <>
                <div style={{ animation: "fadeUp 0.45s cubic-bezier(.22,1,.36,1)" }}>
                  <div style={{ fontFamily: ff.mono, fontSize: 10, letterSpacing: 2, color: C.coral500, marginBottom: 14, fontWeight: 600, textTransform: "uppercase" }}>Shift Swaps</div>
                  <h3 style={{ fontFamily: ff.display, fontSize: isMobile ? 28 : 36, fontWeight: 600, color: C.t1, marginBottom: 16, letterSpacing: "-0.025em", lineHeight: 1.05 }}>
                    Swap shifts <span style={{ fontStyle: "italic", fontWeight: 300, color: C.coral500 }}>without the drama.</span>
                  </h3>
                  <p style={{ fontFamily: ff.body, fontSize: 15.5, color: C.t2, lineHeight: 1.65, marginBottom: 24 }}>Can't work? Post it. Coworker claims it. You approve with one tap. Shift reassigns automatically.</p>
                  <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                    {["Push + email alerts to coworkers", "First-come-first-served claiming", "One-tap manager approval", "Zero manual shift reassignment"].map(f => (
                      <div key={f} style={{ display: "flex", gap: 10, alignItems: "center" }}>
                        <span style={{ color: C.coral500, flexShrink: 0 }}>{SVG.check(14, C.coral500)}</span>
                        <span style={{ fontFamily: ff.body, fontSize: 14, color: C.t1 }}>{f}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 12, animation: "fadeUp 0.55s cubic-bezier(.22,1,.36,1) 0.08s both" }}>
                  <div style={{ padding: 18, background: "linear-gradient(140deg, rgba(249,115,22,0.08), rgba(224,123,0,0.02))", border: "1px solid rgba(249,115,22,0.25)", borderRadius: 14 }}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8, fontFamily: ff.mono, fontSize: 10, color: C.coral500, letterSpacing: 1.2, fontWeight: 700, textTransform: "uppercase" }}>
                        <span style={{ color: C.coral500 }}>{SVG.swap(12, C.coral500)}</span>Available Swap
                      </div>
                      <span style={{ fontFamily: ff.mono, fontSize: 9, color: C.t3, letterSpacing: 0.5 }}>2 MIN AGO</span>
                    </div>
                    <div style={{ fontFamily: ff.body, fontSize: 14, color: C.t1, fontWeight: 600, marginBottom: 4, letterSpacing: "-0.01em" }}>Jake → Saturday, April 25</div>
                    <div style={{ fontFamily: ff.body, fontSize: 12, color: C.t2, marginBottom: 14 }}>5:00 PM – 11:00 PM · 6h shift · Sea Lion Bar</div>
                    <button style={{ padding: "9px 18px", background: "linear-gradient(135deg," + C.coral500 + "," + C.amber600 + ")", color: "#fff", border: "none", borderRadius: 8, fontFamily: ff.body, fontSize: 12, fontWeight: 700, cursor: "pointer", boxShadow: "0 4px 12px rgba(249,115,22,0.3)", letterSpacing: "-0.005em" }}>I'll Take It</button>
                  </div>
                  <div style={{ padding: 18, background: "linear-gradient(140deg, rgba(20,184,166,0.08), rgba(20,184,166,0.02))", border: "1px solid rgba(20,184,166,0.25)", borderRadius: 14 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, fontFamily: ff.mono, fontSize: 10, color: C.teal600, letterSpacing: 1.2, fontWeight: 700, marginBottom: 10, textTransform: "uppercase" }}>
                      <span style={{ color: C.teal600 }}>{SVG.check(12, C.teal600)}</span>Claimed · Ready to Approve
                    </div>
                    <div style={{ fontFamily: ff.body, fontSize: 13, color: C.t1, marginBottom: 12 }}>Sarah wants Jake's Saturday shift.</div>
                    <div style={{ display: "flex", gap: 8 }}>
                      <button style={{ flex: 1, padding: "8px", background: C.teal600, color: "#fff", border: "none", borderRadius: 8, fontFamily: ff.body, fontSize: 12, fontWeight: 600, cursor: "pointer" }}>Approve</button>
                      <button style={{ flex: 1, padding: "8px", background: "transparent", color: C.t2, border: "1px solid " + C.ocean300, borderRadius: 8, fontFamily: ff.body, fontSize: 12, fontWeight: 600, cursor: "pointer" }}>Deny</button>
                    </div>
                  </div>
                </div>
              </>
            )}

            {/* ───── TAB 5: PAYROLL ───── */}
            {tourStep === 4 && (
              <>
                <div style={{ animation: "fadeUp 0.45s cubic-bezier(.22,1,.36,1)" }}>
                  <div style={{ fontFamily: ff.mono, fontSize: 10, letterSpacing: 2, color: C.indigo700, marginBottom: 14, fontWeight: 600, textTransform: "uppercase" }}>Payroll Ready</div>
                  <h3 style={{ fontFamily: ff.display, fontSize: isMobile ? 28 : 36, fontWeight: 600, color: C.t1, marginBottom: 16, letterSpacing: "-0.025em", lineHeight: 1.05 }}>
                    Every hour adds up. <span style={{ fontStyle: "italic", fontWeight: 300, color: C.indigo700 }}>Automatically.</span>
                  </h3>
                  <p style={{ fontFamily: ff.body, fontSize: 15.5, color: C.t2, lineHeight: 1.65, marginBottom: 24 }}>Clock events roll up into weekly and monthly reports. Export for any payroll provider. QuickBooks coming Q2.</p>
                  <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                    {["Auto-calculated regular + OT hours", "Adjustable pay periods", "Export to CSV · QuickBooks · Gusto", "Per-employee pay rate management"].map(f => (
                      <div key={f} style={{ display: "flex", gap: 10, alignItems: "center" }}>
                        <span style={{ color: C.indigo700, flexShrink: 0 }}>{SVG.check(14, C.indigo700)}</span>
                        <span style={{ fontFamily: ff.body, fontSize: 14, color: C.t1 }}>{f}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div style={{ background: "#fff", border: "1px solid " + C.ocean200, borderRadius: 16, padding: 24, animation: "fadeUp 0.55s cubic-bezier(.22,1,.36,1) 0.08s both", boxShadow: "0 1px 3px rgba(12,18,32,0.04)" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingBottom: 12, borderBottom: "1px solid " + C.ocean200, marginBottom: 12 }}>
                    <div style={{ fontFamily: ff.mono, fontSize: 10, color: C.t3, letterSpacing: 1.5, fontWeight: 600, textTransform: "uppercase" }}>Pay Period · Apr 14–20</div>
                    <div style={{ fontFamily: ff.mono, fontSize: 9, color: C.indigo700, letterSpacing: 1, fontWeight: 700, padding: "3px 8px", background: C.indigo700 + "14", borderRadius: 4 }}>READY</div>
                  </div>
                  {[
                    { n: "Jake Mendoza", h: "38.5h", p: "$693.00" },
                    { n: "Priya Kapoor", h: "32.0h", p: "$576.00" },
                    { n: "Carlos Reyes", h: "41.25h", p: "$639.00", ot: true },
                    { n: "Anya Thompson", h: "28.0h", p: "$420.00" },
                  ].map((r, i) => (
                    <div key={r.n} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "11px 0", borderBottom: i < 3 ? "1px solid " + C.ocean100 : "none" }}>
                      <div>
                        <div style={{ fontFamily: ff.body, fontSize: 13, color: C.t1, fontWeight: 500 }}>{r.n}</div>
                        {r.ot && <div style={{ fontFamily: ff.mono, fontSize: 9, color: C.amber500, letterSpacing: 1, marginTop: 2, fontWeight: 600 }}>+ 1.25h OT</div>}
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
                        <span style={{ fontFamily: ff.mono, fontSize: 12, color: C.t2, fontVariantNumeric: "tabular-nums" }}>{r.h}</span>
                        <span style={{ fontFamily: ff.mono, fontSize: 12.5, color: C.indigo700, fontWeight: 700, fontVariantNumeric: "tabular-nums" }}>{r.p}</span>
                      </div>
                    </div>
                  ))}
                  <div style={{ marginTop: 14, paddingTop: 14, borderTop: "2px solid " + C.indigo700, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ fontFamily: ff.body, fontSize: 13.5, fontWeight: 700, color: C.t1 }}>Total</span>
                    <span style={{ fontFamily: ff.mono, fontSize: 15, color: C.indigo700, fontWeight: 700, fontVariantNumeric: "tabular-nums" }}>$2,328.00</span>
                  </div>
                </div>
              </>
            )}
          </div>

          <div style={{ textAlign: "center", marginTop: 32 }}>
            <a href="/final" className="btn-primary" style={{ padding: "14px 32px", borderRadius: 12, background: "linear-gradient(135deg," + C.amber500 + "," + C.amber600 + ")", color: "#fff", fontFamily: ff.body, fontWeight: 700, fontSize: 14.5, display: "inline-flex", alignItems: "center", boxShadow: "0 10px 28px rgba(224,123,0,0.3)", letterSpacing: "-0.01em", transition: "all .2s" }} onMouseEnter={(e) => { e.currentTarget.style.transform = "translateY(-1px)"; e.currentTarget.style.boxShadow = "0 12px 32px rgba(224,123,0,0.4)"; }} onMouseLeave={(e) => { e.currentTarget.style.transform = "none"; e.currentTarget.style.boxShadow = "0 10px 28px rgba(224,123,0,0.3)"; }}>Try it free for 7 days<span className="arrow">{SVG.arrowRight(14)}</span></a>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          ROI CALCULATOR
          ═══════════════════════════════════════════════════════════ */}
      <section data-rv="roi" style={{ padding: isMobile ? "96px 20px" : (isTablet ? "120px 32px" : "144px 40px"), background: "#fff" }}>
        <div style={{ maxWidth: 920, margin: "0 auto" }}>
          <div data-rv="roi-h" className={"rv " + (shown("roi-h") ? "vis" : "")} style={{ textAlign: "center", marginBottom: 48 }}>
            <div style={{ fontFamily: ff.mono, fontSize: 11, letterSpacing: 2.5, color: C.amber500, marginBottom: 16, fontWeight: 600, textTransform: "uppercase" }}>The Math</div>
            <h2 style={{ fontFamily: ff.display, fontSize: isMobile ? 34 : "clamp(44px,5.5vw,68px)", fontWeight: 700, letterSpacing: "-0.032em", color: C.t1, lineHeight: 0.98 }}>
              How much is scheduling<br /><span style={{ fontStyle: "italic", fontWeight: 300, color: C.amber500 }}>costing you?</span>
            </h2>
          </div>

          <div data-rv="roi-card" className={"rv " + (shown("roi-card") ? "vis" : "")} style={{ background: C.ocean100, border: "1px solid " + C.ocean200, borderRadius: 24, padding: isMobile ? 28 : 48, boxShadow: "0 24px 60px rgba(12,18,32,0.06)" }}>
            <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr 1fr", gap: isMobile ? 28 : 36, marginBottom: 36 }}>
              {[
                { label: "Hours/Week on Scheduling", val: roiHours + "h", min: 1, max: 20, step: 1, raw: roiHours, setter: setRoiHours },
                { label: "Your Hourly Value", val: "$" + roiRate, min: 15, max: 75, step: 5, raw: roiRate, setter: setRoiRate },
                { label: "Team Size", val: roiTeam + "", min: 3, max: 50, step: 1, raw: roiTeam, setter: setRoiTeam },
              ].map(s => (
                <div key={s.label}>
                  <label style={{ fontFamily: ff.mono, fontSize: 10, letterSpacing: 1.8, color: C.t3, display: "block", marginBottom: 12, fontWeight: 600, textTransform: "uppercase" }}>{s.label}</label>
                  <input type="range" min={s.min} max={s.max} step={s.step} value={s.raw} onChange={(e) => s.setter(+e.target.value)} style={{ width: "100%" }} />
                  <div style={{ fontFamily: ff.display, fontSize: 48, fontWeight: 800, color: C.amber500, marginTop: 10, letterSpacing: "-0.035em", fontVariantNumeric: "tabular-nums", lineHeight: 1 }}>{s.val}</div>
                </div>
              ))}
            </div>

            <div style={{ borderTop: "1px solid " + C.ocean200, paddingTop: 32 }}>
              <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "repeat(3,1fr)", gap: 20, textAlign: "center", marginBottom: 28 }}>
                {[
                  { label: "Time Saved / Year", val: roiYearlyTimeSaved + "h", color: C.violet500 },
                  { label: "Value of Time Saved", val: "$" + roiValueSaved.toLocaleString(), color: C.success },
                  { label: "ShiftPro Costs You", val: "$" + roiShiftProCost.toLocaleString() + "/yr", color: C.t1 },
                ].map((r, i) => (
                  <div key={r.label} style={{ padding: isMobile ? 0 : "0 16px", borderLeft: !isMobile && i > 0 ? "1px solid " + C.ocean200 : "none" }}>
                    <div style={{ fontFamily: ff.mono, fontSize: 10, letterSpacing: 1.8, color: C.t3, marginBottom: 10, fontWeight: 600, textTransform: "uppercase" }}>{r.label}</div>
                    <div style={{ fontFamily: ff.display, fontSize: isMobile ? 34 : 40, fontWeight: 900, color: r.color, letterSpacing: "-0.035em", fontVariantNumeric: "tabular-nums", lineHeight: 1 }}>{r.val}</div>
                  </div>
                ))}
              </div>

              <div style={{ padding: isMobile ? 28 : 40, background: "linear-gradient(135deg," + C.teal500 + "," + C.teal600 + ")", borderRadius: 20, textAlign: "center", boxShadow: "0 24px 60px rgba(20,184,166,0.28)", position: "relative", overflow: "hidden" }}>
                <div aria-hidden style={{ position: "absolute", inset: 0, backgroundImage: "radial-gradient(rgba(255,255,255,0.12) 1px, transparent 1px)", backgroundSize: "24px 24px", opacity: 0.6 }} />
                <div style={{ position: "relative" }}>
                  <div style={{ fontFamily: ff.mono, fontSize: 11, letterSpacing: 2.5, color: "rgba(255,255,255,0.88)", marginBottom: 12, fontWeight: 600, textTransform: "uppercase" }}>Net Savings Per Year</div>
                  <div style={{ fontFamily: ff.display, fontSize: isMobile ? 54 : "clamp(68px,10vw,104px)", fontWeight: 900, color: "#fff", letterSpacing: "-0.045em", lineHeight: 0.95, fontVariantNumeric: "tabular-nums" }}>${roiNet.toLocaleString()}</div>
                  <div style={{ fontFamily: ff.body, fontSize: 13.5, color: "rgba(255,255,255,0.88)", marginTop: 14, fontWeight: 500 }}>vs ${roiWIWCost.toLocaleString()}/yr on When I Work (Pro + time tracking)</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          COMPARISON TABLE
          ═══════════════════════════════════════════════════════════ */}
      <section data-rv="cmp" style={{ padding: isMobile ? "96px 20px" : (isTablet ? "120px 32px" : "144px 40px"), background: C.ocean100 }}>
        <div style={{ maxWidth: 1120, margin: "0 auto" }}>
          <div data-rv="cmp-h" className={"rv " + (shown("cmp-h") ? "vis" : "")} style={{ textAlign: "center", marginBottom: 48 }}>
            <div style={{ fontFamily: ff.mono, fontSize: 11, letterSpacing: 2.5, color: C.amber500, marginBottom: 16, fontWeight: 600, textTransform: "uppercase" }}>The Comparison</div>
            <h2 style={{ fontFamily: ff.display, fontSize: isMobile ? 32 : "clamp(40px,5vw,60px)", fontWeight: 700, letterSpacing: "-0.032em", color: C.t1, lineHeight: 1.02, marginBottom: 14 }}>
              More features. <span style={{ fontStyle: "italic", fontWeight: 300, color: C.amber500 }}>Better price.</span>
            </h2>
            <p style={{ fontFamily: ff.body, fontSize: 16, color: C.t2, maxWidth: 540, margin: "0 auto", lineHeight: 1.55 }}>Four tools everyone in our space uses. Here's how we stack up.</p>
          </div>

          <div data-rv="cmp-t" className={"rv " + (shown("cmp-t") ? "vis" : "")} style={{ overflowX: "auto", background: "#fff", borderRadius: 20, border: "1px solid " + C.ocean200, boxShadow: "0 24px 60px rgba(12,18,32,0.05)" }}>
            <table style={{ width: "100%", minWidth: 720, borderCollapse: "collapse", fontFamily: ff.body }}>
              <thead>
                <tr>
                  <th style={{ padding: "20px 20px", textAlign: "left", borderBottom: "1px solid " + C.ocean200 }}></th>
                  <th style={{ padding: "20px 16px", textAlign: "center", borderBottom: "3px solid " + C.amber500, color: C.amber500, fontFamily: ff.display, fontSize: 18, fontWeight: 700, background: "linear-gradient(180deg, rgba(224,123,0,0.08), transparent)", letterSpacing: "-0.02em" }}>ShiftPro</th>
                  <th style={{ padding: "20px 16px", textAlign: "center", borderBottom: "1px solid " + C.ocean200, color: C.t3, fontSize: 12, fontWeight: 600, textTransform: "uppercase", letterSpacing: 1 }}>When I Work</th>
                  <th style={{ padding: "20px 16px", textAlign: "center", borderBottom: "1px solid " + C.ocean200, color: C.t3, fontSize: 12, fontWeight: 600, textTransform: "uppercase", letterSpacing: 1 }}>Homebase</th>
                  <th style={{ padding: "20px 16px", textAlign: "center", borderBottom: "1px solid " + C.ocean200, color: C.t3, fontSize: 12, fontWeight: 600, textTransform: "uppercase", letterSpacing: 1 }}>7shifts</th>
                </tr>
              </thead>
              <tbody>
                {[
                  ["Starting Price", "$2.50/user", "$2.50/user", "Free (limited)", "$29.99 flat"],
                  ["Time Tracking Included", "YES", "+$1.50–$2 extra", "YES", "+$5/mo extra"],
                  ["GPS Geofencing", "YES", "Premium only", "YES", "YES"],
                  ["Shift Swaps", "YES", "YES", "YES", "YES"],
                  ["Document Management", "YES", "Premium only", "—", "YES"],
                  ["Push Notifications", "YES", "YES", "YES", "YES"],
                  ["Multi-Location", "Pro plan", "Pro only", "YES", "YES"],
                  ["Setup Time", "5 minutes", "30 minutes", "15 minutes", "30 minutes"],
                ].map((row, i) => (
                  <tr key={i}>
                    <td style={{ padding: "15px 20px", color: C.t1, fontWeight: 500, fontSize: 14, borderBottom: i < 7 ? "1px solid " + C.borderSoft : "none" }}>{row[0]}</td>
                    <td style={{ padding: "15px 16px", textAlign: "center", color: C.teal600, fontWeight: 700, fontSize: 13.5, background: "rgba(224,123,0,0.03)", borderBottom: i < 7 ? "1px solid " + C.borderSoft : "none", borderLeft: "1px solid rgba(224,123,0,0.08)", borderRight: "1px solid rgba(224,123,0,0.08)" }}>
                      {row[1] === "YES" ? <span style={{ display: "inline-flex", color: C.teal600 }}>{SVG.check(16, C.teal600)}</span> : row[1]}
                    </td>
                    <td style={{ padding: "15px 16px", textAlign: "center", color: C.t2, fontSize: 13, borderBottom: i < 7 ? "1px solid " + C.borderSoft : "none" }}>
                      {row[2] === "YES" ? <span style={{ display: "inline-flex", color: C.t2, opacity: 0.6 }}>{SVG.check(14, C.t2)}</span> : row[2]}
                    </td>
                    <td style={{ padding: "15px 16px", textAlign: "center", color: C.t2, fontSize: 13, borderBottom: i < 7 ? "1px solid " + C.borderSoft : "none" }}>
                      {row[3] === "YES" ? <span style={{ display: "inline-flex", color: C.t2, opacity: 0.6 }}>{SVG.check(14, C.t2)}</span> : row[3]}
                    </td>
                    <td style={{ padding: "15px 16px", textAlign: "center", color: C.t2, fontSize: 13, borderBottom: i < 7 ? "1px solid " + C.borderSoft : "none" }}>
                      {row[4] === "YES" ? <span style={{ display: "inline-flex", color: C.t2, opacity: 0.6 }}>{SVG.check(14, C.t2)}</span> : row[4]}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          FOUNDER — quiet, personal
          ═══════════════════════════════════════════════════════════ */}
      <section data-rv="fnd" style={{ padding: isMobile ? "96px 20px" : "128px 40px", background: "#fff" }}>
        <div style={{ maxWidth: 720, margin: "0 auto", textAlign: "center" }}>
          <div data-rv="fnd-a" className={"rv " + (shown("fnd-a") ? "vis" : "")} style={{ width: 80, height: 80, borderRadius: "50%", background: "linear-gradient(135deg," + C.amber500 + "," + C.amber700 + ")", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 28px", fontFamily: ff.display, fontSize: 36, fontWeight: 800, color: "#fff", boxShadow: "0 16px 40px rgba(224,123,0,0.32), inset 0 1px 0 rgba(255,255,255,0.25)" }}>B</div>
          <div data-rv="fnd-q" className={"rv rv-d1 " + (shown("fnd-q") ? "vis" : "")} style={{ fontFamily: ff.display, fontStyle: "italic", fontSize: isMobile ? 22 : "clamp(26px,3vw,34px)", fontWeight: 400, color: C.t1, lineHeight: 1.35, marginBottom: 32, letterSpacing: "-0.018em" }}>
            "I run a bar, a coffee shop, and a tour company in Oregon. I built ShiftPro because I was drowning in spreadsheets and group texts. It solved my problem — and now I'm sharing it with you."
          </div>
          <div data-rv="fnd-n" className={"rv rv-d2 " + (shown("fnd-n") ? "vis" : "")}>
            <div style={{ fontFamily: ff.body, fontWeight: 700, fontSize: 16, color: C.amber500, marginBottom: 5, letterSpacing: "-0.01em" }}>Brendan</div>
            <div style={{ fontFamily: ff.mono, fontSize: 10, color: C.t3, letterSpacing: 2.5, fontWeight: 600, textTransform: "uppercase" }}>Founder · Shift Pro Enterprises</div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          PRICING — middle card elevated
          ═══════════════════════════════════════════════════════════ */}
      <section id="pricing" data-rv="pr" style={{ padding: isMobile ? "96px 20px" : (isTablet ? "120px 32px" : "144px 40px"), background: C.ocean100 }}>
        <div style={{ maxWidth: 1120, margin: "0 auto" }}>
          <div data-rv="pr-h" className={"rv " + (shown("pr-h") ? "vis" : "")} style={{ textAlign: "center", marginBottom: 48 }}>
            <div style={{ fontFamily: ff.mono, fontSize: 11, letterSpacing: 2.5, color: C.amber500, marginBottom: 16, fontWeight: 600, textTransform: "uppercase" }}>Pricing</div>
            <h2 style={{ fontFamily: ff.display, fontSize: isMobile ? 34 : "clamp(44px,5.5vw,68px)", fontWeight: 700, letterSpacing: "-0.032em", color: C.t1, lineHeight: 0.98, marginBottom: 14 }}>
              Simpler. <span style={{ fontStyle: "italic", fontWeight: 300, color: C.amber500 }}>Cheaper.</span>
            </h2>
            <p style={{ fontFamily: ff.body, fontSize: 16, color: C.t2, maxWidth: 540, margin: "0 auto 20px", lineHeight: 1.55 }}>7-day free trial on every plan. Cancel in two clicks.</p>
            <div style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "8px 18px", background: "linear-gradient(135deg, rgba(20,184,166,0.1), rgba(139,92,246,0.08))", border: "1px solid rgba(20,184,166,0.25)", borderRadius: 30 }}>
              <span style={{ color: C.teal600 }}>{SVG.check(12, C.teal600)}</span>
              <span style={{ fontFamily: ff.mono, fontSize: 10, color: C.teal600, fontWeight: 700, letterSpacing: 1, textTransform: "uppercase" }}>Time tracking included in every plan</span>
            </div>
          </div>

          <div data-rv="pr-cards" className={"rv " + (shown("pr-cards") ? "vis" : "")} style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "repeat(3,1fr)", gap: 20, alignItems: "start" }}>
            {[
              { name: "Essentials", desc: "Single-location teams", price: "$2.50", per: "/user/mo", color: C.teal500, features: ["Scheduling + time clock", "Team messaging", "Availability management", "Time-off requests", "Mobile PWA", "1 location"], pop: false },
              { name: "Pro", desc: "Growing teams", price: "$4", per: "/user/mo", color: C.amber500, features: ["Everything in Essentials", "Unlimited locations", "Shift swaps", "Push + email alerts", "Document management", "GPS geofencing", "Priority support"], pop: true },
              { name: "Enterprise", desc: "Large operations", price: "Custom", per: "", color: C.violet500, features: ["Everything in Pro", "QuickBooks integration", "Custom branding", "API + webhooks", "Dedicated account manager", "SLA guarantee", "SSO / SAML"], pop: false },
            ].map((p, i) => (
              <div key={p.name} style={{ padding: isMobile ? 28 : 36, background: p.pop ? "linear-gradient(170deg, #fff 0%, rgba(224,123,0,0.04) 100%)" : "#fff", border: "1px solid " + (p.pop ? "rgba(224,123,0,0.28)" : C.ocean200), borderRadius: 22, position: "relative", marginTop: !isMobile && p.pop ? -8 : 0, boxShadow: p.pop ? "0 24px 56px rgba(224,123,0,0.14)" : "0 2px 6px rgba(12,18,32,0.04)", transition: "all 0.3s cubic-bezier(.22,1,.36,1)" }}
                onMouseEnter={(e) => { e.currentTarget.style.transform = "translateY(-4px)"; e.currentTarget.style.boxShadow = p.pop ? "0 32px 68px rgba(224,123,0,0.22)" : "0 16px 36px rgba(12,18,32,0.1)"; }}
                onMouseLeave={(e) => { e.currentTarget.style.transform = !isMobile && p.pop ? "translateY(-8px)" : "none"; e.currentTarget.style.boxShadow = p.pop ? "0 24px 56px rgba(224,123,0,0.14)" : "0 2px 6px rgba(12,18,32,0.04)"; }}>
                {p.pop && (
                  <div style={{ position: "absolute", top: -12, left: "50%", transform: "translateX(-50%)", padding: "5px 14px", background: "linear-gradient(135deg," + C.amber500 + "," + C.amber700 + ")", borderRadius: 20, fontFamily: ff.mono, fontSize: 9, fontWeight: 700, color: "#fff", letterSpacing: 1.8, boxShadow: "0 6px 16px rgba(224,123,0,0.4)", textTransform: "uppercase" }}>Most Popular</div>
                )}
                <div style={{ fontFamily: ff.display, fontSize: 22, fontWeight: 700, color: p.color, marginBottom: 6, letterSpacing: "-0.015em" }}>{p.name}</div>
                <div style={{ fontFamily: ff.body, fontSize: 13, color: C.t3, marginBottom: 22 }}>{p.desc}</div>
                <div style={{ display: "flex", alignItems: "baseline", gap: 5, marginBottom: 28 }}>
                  <span style={{ fontFamily: ff.display, fontSize: 52, fontWeight: 900, color: C.t1, letterSpacing: "-0.04em", fontVariantNumeric: "tabular-nums", lineHeight: 1 }}>{p.price}</span>
                  {p.per && <span style={{ fontFamily: ff.mono, fontSize: 12, color: C.t3, fontWeight: 500 }}>{p.per}</span>}
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 30 }}>
                  {p.features.map(f => (
                    <div key={f} style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
                      <span style={{ color: p.color, flexShrink: 0, marginTop: 2 }}>{SVG.check(14, p.color)}</span>
                      <span style={{ fontFamily: ff.body, fontSize: 13.5, color: C.t1, lineHeight: 1.45 }}>{f}</span>
                    </div>
                  ))}
                </div>
                <a href="/final" style={{ display: "block", textAlign: "center", padding: "14px", borderRadius: 11, background: p.pop ? "linear-gradient(135deg," + C.amber500 + "," + C.amber600 + ")" : "transparent", border: p.pop ? "none" : "1px solid " + C.ocean300, color: p.pop ? "#fff" : C.t1, fontFamily: ff.body, fontWeight: 700, fontSize: 14, boxShadow: p.pop ? "0 6px 18px rgba(224,123,0,0.3)" : "none", letterSpacing: "-0.01em", transition: "all .2s" }}>
                  {p.name === "Enterprise" ? "Contact Sales" : "Start Free Trial"}
                </a>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          FAQ
          ═══════════════════════════════════════════════════════════ */}
      <section data-rv="faq" style={{ padding: isMobile ? "96px 20px" : "128px 40px", background: "#fff" }}>
        <div style={{ maxWidth: 780, margin: "0 auto" }}>
          <div data-rv="faq-h" className={"rv " + (shown("faq-h") ? "vis" : "")} style={{ textAlign: "center", marginBottom: 48 }}>
            <div style={{ fontFamily: ff.mono, fontSize: 11, letterSpacing: 2.5, color: C.amber500, marginBottom: 16, fontWeight: 600, textTransform: "uppercase" }}>Answers</div>
            <h2 style={{ fontFamily: ff.display, fontSize: isMobile ? 34 : "clamp(44px,5.5vw,68px)", fontWeight: 700, letterSpacing: "-0.032em", color: C.t1, lineHeight: 0.98 }}>
              Questions? <span style={{ fontStyle: "italic", fontWeight: 300, color: C.amber500 }}>Answered.</span>
            </h2>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {[
              { q: "Do my employees need to download an app?", a: "No. ShiftPro is a Progressive Web App — employees open shiftpro.ai on their phone, tap 'Add to Home Screen,' and it works like a native app. No app store, no updates to push." },
              { q: "How long does setup take?", a: "Under 5 minutes. Create your account, add a location, invite your team by email. That's it. Most businesses publish their first schedule the same afternoon." },
              { q: "What happens after the 7-day trial?", a: "You choose a plan. If you don't, your account goes read-only — you never lose your data. We never auto-charge without a card on file." },
              { q: "Can I cancel anytime?", a: "Yes. One click in settings. No contracts, no cancellation fees. Access continues through the end of your billing period." },
              { q: "Is my data secure?", a: "Yes. TLS encryption in transit, AES-256 at rest. Row-Level Security on every table. Rate limiting. XSS protection. SOC2-grade infrastructure via Supabase." },
              { q: "Do you integrate with QuickBooks?", a: "Coming Q2 2026 on Pro and Enterprise. For now, export payroll as CSV — imports into any accounting tool in seconds." },
              { q: "Why is time tracking included when competitors charge extra?", a: "Because scheduling without time tracking is half a product. We don't believe in nickel-and-diming you for features that should be standard." },
              { q: "What if I have multiple locations?", a: "Pro plan includes unlimited locations. Switch between them with one click. Each gets its own staff, schedule, and geofence." },
            ].map((item, i) => {
              const open = faqOpen === i;
              return (
                <div key={i} data-rv={"faq-" + i} className={"rv " + (shown("faq-" + i) ? "vis" : "")} style={{ border: "1px solid " + (open ? "rgba(224,123,0,0.25)" : C.ocean200), borderRadius: 14, overflow: "hidden", background: open ? C.amber50 : "#fff", transition: "all 0.24s cubic-bezier(.22,1,.36,1)" }}>
                  <button onClick={() => setFaqOpen(open ? -1 : i)} style={{ width: "100%", padding: "20px 22px", background: "none", border: "none", display: "flex", justifyContent: "space-between", alignItems: "center", textAlign: "left", cursor: "pointer", gap: 16 }}>
                    <span style={{ fontFamily: ff.body, fontSize: 14.5, fontWeight: 600, color: C.t1, letterSpacing: "-0.01em" }}>{item.q}</span>
                    <span style={{ color: C.amber500, display: "flex", transform: open ? "rotate(45deg)" : "none", transition: "transform 0.22s cubic-bezier(.22,1,.36,1)", flexShrink: 0 }}>{SVG.plus(18)}</span>
                  </button>
                  {open && (
                    <div style={{ padding: "0 22px 22px", fontFamily: ff.body, fontSize: 14, color: C.t2, lineHeight: 1.65, animation: "fadeIn 0.22s" }}>{item.a}</div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          FINAL CTA — dramatic closer
          ═══════════════════════════════════════════════════════════ */}
      <section data-rv="cta" style={{ padding: isMobile ? "96px 20px" : "160px 40px", background: C.ocean100 }}>
        <div data-rv="cta-c" className={"rv " + (shown("cta-c") ? "vis" : "")} style={{ maxWidth: 900, margin: "0 auto", padding: isMobile ? "56px 28px" : "80px 60px", background: "linear-gradient(135deg," + C.amber500 + " 0%," + C.coral500 + " 55%," + C.rose500 + " 100%)", borderRadius: 32, textAlign: "center", position: "relative", overflow: "hidden", boxShadow: "0 60px 100px rgba(224,123,0,0.32)" }}>
          <div aria-hidden style={{ position: "absolute", inset: 0, backgroundImage: "radial-gradient(rgba(255,255,255,0.15) 1.5px, transparent 1.5px)", backgroundSize: "26px 26px", opacity: 0.7, pointerEvents: "none" }} />
          <div aria-hidden style={{ position: "absolute", top: -120, right: -120, width: 380, height: 380, borderRadius: "50%", background: "radial-gradient(circle, rgba(255,255,255,0.22) 0%, transparent 65%)", pointerEvents: "none" }} />
          <div aria-hidden style={{ position: "absolute", bottom: -140, left: -100, width: 340, height: 340, borderRadius: "50%", background: "radial-gradient(circle, rgba(12,18,32,0.14) 0%, transparent 65%)", pointerEvents: "none" }} />

          <div style={{ position: "relative" }}>
            <div style={{ fontFamily: ff.mono, fontSize: 11, letterSpacing: 3, color: "rgba(255,255,255,0.88)", marginBottom: 20, fontWeight: 600, textTransform: "uppercase" }}>— The Next Step —</div>
            <h2 style={{ fontFamily: ff.display, fontSize: isMobile ? 38 : "clamp(48px,6vw,80px)", fontWeight: 900, color: "#fff", letterSpacing: "-0.04em", lineHeight: 0.95, marginBottom: 18 }}>
              Where your team<br />starts working <span style={{ fontStyle: "italic", fontWeight: 400 }}>smarter.</span>
            </h2>
            <p style={{ fontFamily: ff.body, color: "rgba(255,255,255,0.92)", fontSize: isMobile ? 15 : 17, marginBottom: 38, fontWeight: 500, maxWidth: 520, margin: "0 auto 38px", lineHeight: 1.5 }}>Replace your spreadsheet with one platform your team will actually open.</p>

            <form onSubmit={(e) => { e.preventDefault(); window.location.href = "/final?email=" + encodeURIComponent(trialEmail); }} style={{ display: "flex", gap: 10, maxWidth: 520, margin: "0 auto 18px", flexWrap: "wrap", justifyContent: "center" }}>
              <input type="email" value={trialEmail} onChange={(e) => setTrialEmail(e.target.value)} placeholder="your work email" required
                style={{ flex: 1, minWidth: 220, padding: "16px 20px", borderRadius: 12, border: "2px solid rgba(255,255,255,0.28)", background: "rgba(255,255,255,0.96)", color: C.t1, fontFamily: ff.body, fontSize: 14.5, outline: "none", fontWeight: 500 }}
                onFocus={(e) => { e.currentTarget.style.borderColor = "#fff"; e.currentTarget.style.background = "#fff"; }} />
              <button type="submit" className="btn-primary" style={{ padding: "16px 30px", borderRadius: 12, background: C.ocean950, color: C.amber400, fontFamily: ff.body, fontWeight: 700, fontSize: 14.5, border: "none", boxShadow: "0 10px 28px rgba(12,18,32,0.35)", whiteSpace: "nowrap", cursor: "pointer", display: "inline-flex", alignItems: "center", letterSpacing: "-0.01em", transition: "all .2s" }}>
                Start 7-Day Trial<span className="arrow">{SVG.arrowRight(14)}</span>
              </button>
            </form>
            <div style={{ fontFamily: ff.mono, fontSize: 10, color: "rgba(255,255,255,0.8)", letterSpacing: 1.2, marginBottom: 24, fontWeight: 500, textTransform: "uppercase" }}>7 days free · cancel in 2 clicks · keep your data forever</div>
            <button onClick={() => openLogin("owner")} style={{ padding: "11px 26px", borderRadius: 10, background: "rgba(255,255,255,0.18)", border: "1px solid rgba(255,255,255,0.32)", color: "#fff", fontFamily: ff.body, fontWeight: 600, fontSize: 13, cursor: "pointer", backdropFilter: "blur(12px)", WebkitBackdropFilter: "blur(12px)", letterSpacing: "-0.005em", transition: "all .15s" }}
              onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(255,255,255,0.26)"; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = "rgba(255,255,255,0.18)"; }}>
              Already have an account? Sign in →
            </button>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          FOOTER
          ═══════════════════════════════════════════════════════════ */}
      <footer style={{ padding: "64px 24px 32px", background: C.ocean950 }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1.6fr 1fr 1fr 1fr", gap: 36, marginBottom: 44 }}>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 11, marginBottom: 16 }}>
                <SwirlMark size={34} />
                <div style={{ display: "flex", flexDirection: "column", lineHeight: 1 }}>
                  <span style={{ fontFamily: ff.display, fontWeight: 700, fontSize: 18, color: "#f1f5f9", letterSpacing: "-0.025em" }}>ShiftPro<span style={{ color: C.amber400 }}>.ai</span></span>
                  <span style={{ fontFamily: ff.mono, fontSize: 8, color: C.amber400, letterSpacing: 2.5, marginTop: 3, opacity: 0.75, fontWeight: 600 }}>WORKFORCE PRO</span>
                </div>
              </div>
              <p style={{ fontFamily: ff.body, fontSize: 13.5, color: "#94a3b8", lineHeight: 1.6, maxWidth: 320 }}>
                Workforce management for shift-based businesses. Built in Oregon by a real business owner.
              </p>
            </div>

            {[
              { title: "Product", items: [["Features", "#tour"], ["Pricing", "#pricing"], ["How it works", "#tour"], ["Start free", "/final"]] },
              { title: "Legal", items: [["Terms", "/terms"], ["Privacy", "/privacy"], ["Contact", "mailto:support@shiftpro.ai"]] },
            ].map(col => (
              <div key={col.title}>
                <div style={{ fontFamily: ff.mono, fontSize: 10, letterSpacing: 2.5, color: "#64748b", marginBottom: 16, fontWeight: 600, textTransform: "uppercase" }}>{col.title}</div>
                {col.items.map(([l, h]) => (
                  <a key={l} href={h} className="ul-grow" style={{ display: "block", fontFamily: ff.body, fontSize: 13.5, color: "#94a3b8", marginBottom: 10, width: "fit-content", transition: "color .15s" }} onMouseEnter={(e) => e.currentTarget.style.color = "#f1f5f9"} onMouseLeave={(e) => e.currentTarget.style.color = "#94a3b8"}>{l}</a>
                ))}
              </div>
            ))}

            <div>
              <div style={{ fontFamily: ff.mono, fontSize: 10, letterSpacing: 2.5, color: "#64748b", marginBottom: 16, fontWeight: 600, textTransform: "uppercase" }}>Account</div>
              <button onClick={() => openLogin("owner")} className="ul-grow" style={{ display: "block", padding: 0, background: "none", border: "none", fontFamily: ff.body, fontSize: 13.5, color: "#94a3b8", marginBottom: 10, textAlign: "left", cursor: "pointer", transition: "color .15s" }} onMouseEnter={(e) => e.currentTarget.style.color = "#f1f5f9"} onMouseLeave={(e) => e.currentTarget.style.color = "#94a3b8"}>Owner Sign In</button>
              <button onClick={() => openLogin("employee")} className="ul-grow" style={{ display: "block", padding: 0, background: "none", border: "none", fontFamily: ff.body, fontSize: 13.5, color: "#94a3b8", marginBottom: 10, textAlign: "left", cursor: "pointer", transition: "color .15s" }} onMouseEnter={(e) => e.currentTarget.style.color = "#f1f5f9"} onMouseLeave={(e) => e.currentTarget.style.color = "#94a3b8"}>Employee Sign In</button>
              <a href="/final" className="ul-grow" style={{ display: "block", fontFamily: ff.body, fontSize: 13.5, color: C.amber400, fontWeight: 600, width: "fit-content" }}>Create Account</a>
            </div>
          </div>

          <div style={{ paddingTop: 28, borderTop: "1px solid rgba(255,255,255,0.06)", display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 14 }}>
            <span style={{ fontFamily: ff.mono, fontSize: 10, color: "#64748b", letterSpacing: 1.5, textTransform: "uppercase", fontWeight: 500 }}>© 2026 Shift Pro Enterprises · Oregon</span>
            <span style={{ fontFamily: ff.mono, fontSize: 10, color: "#64748b", letterSpacing: 1.5, textTransform: "uppercase", fontWeight: 500 }}>Designed & engineered in Oregon</span>
          </div>
        </div>
      </footer>
    </>
  );
}
