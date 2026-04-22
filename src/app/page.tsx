"use client";
import React, { useState, useEffect, useRef } from "react";
import ShiftProAppContent from "@/components/ShiftProAppContent";

// ═══════════════════════════════════════════════════════════════
// SESSION-AWARE ROOT  (unchanged — do not touch)
// ═══════════════════════════════════════════════════════════════
export default function Page() {
  const [status, setStatus] = useState("checking");

  useEffect(() => {
    let cancelled = false;
    let unsub: any = null;
    (async () => {
      try {
        const { createClient } = await import("@supabase/supabase-js");
        const sb = createClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL as string,
          process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string
        );
        const { data: { session } } = await sb.auth.getSession();
        if (cancelled) return;
        setStatus(session ? "authed" : "anon");
        const { data: sub } = sb.auth.onAuthStateChange((_event, s) => {
          if (!cancelled) setStatus(s ? "authed" : "anon");
        });
        unsub = sub?.subscription;
      } catch (e: any) {
        console.warn("[root session check]", e?.message);
        if (!cancelled) setStatus("anon");
      }
    })();
    return () => { cancelled = true; try { unsub?.unsubscribe?.(); } catch (e) {} };
  }, []);

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
// COLOR — ocean base + amber brand + warm editorial accents
// ═══════════════════════════════════════════════════════════════
const C = {
  // Ocean base (page bg — unchanged)
  ocean50: "#f4f9fc",
  ocean100: "#e8f1f7",
  ocean200: "#d8e6ef",
  ocean300: "#bed2e0",
  ocean700: "#1e3a5f",
  ocean900: "#0c1220",
  ocean950: "#070d18",

  // Amber — brand
  amber50:  "#fff6e8",
  amber100: "#feeacf",
  amber400: "#f5a623",
  amber500: "#e07b00",
  amber600: "#c96800",
  amber700: "#a55400",

  // NEW editorial palette — use SPARINGLY as section accents
  parchment:    "#faf6ee",   // founder letter bg, pull quotes
  parchmentOn:  "#f0e7d2",   // paper-edge deeper tone
  terracotta:   "#b5441d",   // drop caps, rare accent ink
  terracottaDk: "#8a2e10",
  indigo:       "#161a33",   // CTA/footer inversion
  indigoDeep:   "#0d1022",
  sage:         "#6b7a58",   // pull-quote rule lines, sparingly
  sageDark:     "#3f4a38",   // darker sage for mono metadata on parchment
  ink:          "#0a0d1a",   // main ink color for buttons

  // Supporting hues (existing — rarely used now)
  teal500:  "#14b8a6",
  teal600:  "#0d9488",
  coral500: "#f97316",
  rose500:  "#d94e6b",
  sky500:   "#0ea5e9",
  sky700:   "#0369a1",

  success: "#10b981",
  danger:  "#ef4444",

  t1: "#0c1220",
  t2: "#334155",
  t3: "#64748b",
  t4: "#94a3b8",

  border:     "rgba(12,18,32,0.08)",
  borderSoft: "rgba(12,18,32,0.04)",
};

const ff = {
  display: "'Fraunces', Georgia, serif",
  body:    "'Inter', system-ui, sans-serif",
  mono:    "'JetBrains Mono', ui-monospace, monospace",
};

// ═══════════════════════════════════════════════════════════════
// GLOBAL CSS  — editorial utility classes + keyframes
// ═══════════════════════════════════════════════════════════════
const GCSS = `
@import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,300;0,9..144,400;0,9..144,500;0,9..144,600;0,9..144,700;0,9..144,800;0,9..144,900;1,9..144,300;1,9..144,400;1,9..144,600;1,9..144,700;1,9..144,800;1,9..144,900&family=Inter:wght@300;400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600;700&display=swap');

*{box-sizing:border-box;margin:0;padding:0;}
html{scroll-behavior:smooth;-webkit-font-smoothing:antialiased;-moz-osx-font-smoothing:grayscale;}
body{background:${C.ocean100};color:${C.t1};overflow-x:hidden;font-family:${ff.body};font-feature-settings:"kern","liga","calt","ss01";font-variant-numeric:tabular-nums;}
input,select,textarea,button{font-size:16px;font-family:inherit;}
a{text-decoration:none;color:inherit;}

.tn{font-variant-numeric:tabular-nums;}

::-webkit-scrollbar{width:8px;height:8px;background:${C.ocean100};}
::-webkit-scrollbar-thumb{background:${C.ocean300};border-radius:4px;}
::-webkit-scrollbar-thumb:hover{background:${C.ocean700}33;}
::selection{background:${C.amber500};color:#fff;}

/* --- reveals --- */
.rv{opacity:0;transform:translateY(30px);transition:opacity .9s cubic-bezier(.22,1,.36,1),transform .9s cubic-bezier(.22,1,.36,1);}
.rv.vis{opacity:1;transform:none;}
.rv-d1{transition-delay:.08s;} .rv-d2{transition-delay:.16s;}
.rv-d3{transition-delay:.24s;} .rv-d4{transition-delay:.32s;}
.rv-d5{transition-delay:.40s;} .rv-d6{transition-delay:.48s;}

/* --- keyframes --- */
@keyframes fadeUp{from{opacity:0;transform:translateY(24px)}to{opacity:1;transform:none}}
@keyframes fadeIn{from{opacity:0}to{opacity:1}}
@keyframes pulse{0%,100%{opacity:.35;transform:scale(1)}50%{opacity:1;transform:scale(1.18)}}
@keyframes drift{0%,100%{transform:translate(0,0)}50%{transform:translate(14px,-10px)}}
@keyframes drift2{0%,100%{transform:translate(0,0)}50%{transform:translate(-18px,12px)}}
@keyframes marquee{0%{transform:translateX(0)}100%{transform:translateX(-50%)}}
@keyframes feedIn{from{opacity:0;transform:translateY(-6px)}to{opacity:1;transform:none}}
@keyframes tiltHover{0%{transform:perspective(1600px) rotateY(-2deg) rotateX(3deg) rotate(2deg)}100%{transform:perspective(1600px) rotateY(0deg) rotateX(5deg) rotate(2.4deg)}}
@keyframes tapeDrift{0%,100%{transform:rotate(-4deg) translate(0,0)}50%{transform:rotate(-4deg) translate(1px,-1px)}}
@keyframes inkDraw{from{stroke-dashoffset:1000}to{stroke-dashoffset:0}}
@keyframes wiggle{0%,100%{transform:rotate(0)}25%{transform:rotate(-10deg)}50%{transform:rotate(8deg)}75%{transform:rotate(-4deg)}}
@keyframes countUp{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:none}}
@keyframes sheen{0%{background-position:-200% 0}100%{background-position:200% 0}}

/* --- editorial: drop cap --- */
.dropcap::first-letter{
  float:left;
  font-family:${ff.display};
  font-size:5.2em;
  line-height:.82;
  font-weight:500;
  font-style:italic;
  padding:0.06em 0.14em 0 0;
  color:${C.terracotta};
}

/* --- editorial: two-column body text --- */
.col2{column-count:2;column-gap:42px;column-rule:none;}
@media (max-width:900px){.col2{column-count:1;}}

/* --- ink link (underline draws in) --- */
.ink-link{position:relative;display:inline-block;}
.ink-link::after{content:"";position:absolute;left:0;bottom:-3px;height:2px;width:100%;background:${C.amber500};transform:scaleX(0);transform-origin:left center;transition:transform .4s cubic-bezier(.77,0,.18,1);}
.ink-link:hover::after{transform:scaleX(1);}

/* --- press button (solid ink, pressed feel) --- */
.btn-ink{
  position:relative;display:inline-flex;align-items:center;gap:10px;
  padding:16px 28px;border-radius:2px;
  background:${C.ink};color:#fff;
  font-family:${ff.body};font-weight:700;font-size:14.5px;
  letter-spacing:-.005em;
  border:none;cursor:pointer;
  box-shadow:0 4px 0 ${C.amber600}, 0 12px 28px rgba(12,18,32,0.28);
  transition:transform .14s cubic-bezier(.22,1,.36,1), box-shadow .2s;
}
.btn-ink:hover{transform:translateY(-2px);box-shadow:0 6px 0 ${C.amber600}, 0 18px 36px rgba(12,18,32,0.35);}
.btn-ink:active{transform:translateY(2px);box-shadow:0 0 0 ${C.amber600}, 0 4px 10px rgba(12,18,32,0.25);}
.btn-ink .arrow{transition:transform .2s cubic-bezier(.22,1,.36,1);}
.btn-ink:hover .arrow{transform:translateX(4px);}

/* --- ghost button --- */
.btn-ghost{
  display:inline-flex;align-items:center;gap:8px;
  padding:15px 22px;border-radius:2px;
  background:transparent;color:${C.t1};
  font-family:${ff.body};font-weight:600;font-size:14.5px;
  border:1.5px solid ${C.ink};cursor:pointer;
  transition:background .18s,color .18s;
}
.btn-ghost:hover{background:${C.ink};color:#fff;}

/* --- nav dropdown --- */
.nav-dd{position:relative;}
.nav-dd-menu{
  position:absolute;top:calc(100% + 10px);right:0;
  min-width:260px;
  background:#fff;border:1px solid ${C.border};border-radius:6px;
  padding:8px;
  box-shadow:0 20px 50px rgba(12,18,32,0.15), 0 0 0 1px rgba(12,18,32,0.02);
  opacity:0;pointer-events:none;transform:translateY(-6px);
  transition:opacity .18s, transform .18s;
  z-index:200;
}
.nav-dd:hover .nav-dd-menu, .nav-dd:focus-within .nav-dd-menu{opacity:1;pointer-events:auto;transform:none;}

/* --- logo easter egg --- */
.swirl-wrap:hover .swirl-hit{animation:wiggle .7s cubic-bezier(.22,1,.36,1);}
.swirl-tip{position:absolute;top:calc(100% + 8px);left:0;font-family:${ff.mono};font-size:9px;letter-spacing:2px;color:${C.amber600};opacity:0;transition:opacity .2s;pointer-events:none;white-space:nowrap;}
.swirl-wrap:hover .swirl-tip{opacity:1;}

/* --- grain overlay helper --- */
.grain-overlay{position:relative;}
.grain-overlay::after{
  content:"";position:absolute;inset:0;pointer-events:none;
  background-image:url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='200' height='200'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 0.5 0'/></filter><rect width='100%' height='100%' filter='url(%23n)'/></svg>");
  opacity:0.05;mix-blend-mode:multiply;z-index:1;
}

/* --- tape label --- */
.tape{
  display:inline-block;padding:4px 14px;
  background:${C.amber400};color:${C.ink};
  font-family:${ff.mono};font-size:10px;font-weight:700;
  letter-spacing:2.5px;text-transform:uppercase;
  transform:rotate(-3deg);
  box-shadow:0 2px 0 rgba(12,18,32,0.08), 0 4px 12px rgba(224,123,0,0.25);
  position:relative;
}
.tape::before,.tape::after{content:"";position:absolute;width:6px;height:100%;top:0;background:rgba(255,255,255,0.25);}
.tape::before{left:0;} .tape::after{right:0;}

/* --- range input (for calculator) --- */
input[type="range"]{-webkit-appearance:none;appearance:none;height:3px;background:${C.ocean200};border-radius:0;outline:none;cursor:pointer;}
input[type="range"]::-webkit-slider-thumb{-webkit-appearance:none;appearance:none;width:20px;height:20px;background:${C.ink};border-radius:0;cursor:pointer;border:2px solid ${C.amber500};}
input[type="range"]::-moz-range-thumb{width:20px;height:20px;background:${C.ink};border-radius:0;cursor:pointer;border:2px solid ${C.amber500};}

/* --- schedule grid cell hover lift --- */
.sch-cell{transition:transform .2s cubic-bezier(.22,1,.36,1), box-shadow .2s;}
.sch-cell:hover{transform:translateY(-1px);box-shadow:0 4px 12px rgba(12,18,32,0.12);}

/* --- mobile --- */
@media (max-width:768px){
  .hide-mobile{display:none !important;}
}
`;

// ═══════════════════════════════════════════════════════════════
// SWIRLMARK — logo (preserved; minor outer wrap only)
// ═══════════════════════════════════════════════════════════════
function SwirlMark({ size = 36 }: { size?: number }) {
  const uid = "sm" + Math.random().toString(36).slice(2, 6);
  return (
    <svg className="swirl-hit" width={size} height={size} viewBox="0 0 130 130" xmlns="http://www.w3.org/2000/svg" style={{ flexShrink: 0, overflow: "visible", display: "block" }}>
      <defs>
        <linearGradient id={uid + "g1"} x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stopColor="#00d4ff" /><stop offset="100%" stopColor="#0066cc" /></linearGradient>
        <linearGradient id={uid + "g2"} x1="0%" y1="0%" x2="100%" y2="0%"><stop offset="0%" stopColor="#f59e0b" /><stop offset="100%" stopColor="#fbbf24" /></linearGradient>
        <linearGradient id={uid + "g3"} x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stopColor="#38bdf8" /><stop offset="100%" stopColor="#0ea5e9" /></linearGradient>
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
// HAND-DRAWN SQUIGGLE DIVIDER — breaks up sections organically
// ═══════════════════════════════════════════════════════════════
function Squiggle({ w = 180, color = "rgba(12,18,32,0.25)", strokeW = 1.4 }: { w?: number; color?: string; strokeW?: number }) {
  const pts: string[] = [];
  const step = 10;
  const amp = 3.5;
  for (let x = 0; x <= w; x += step) {
    const y = 10 + (Math.sin((x / w) * Math.PI * 6) * amp) + (Math.random() - 0.5) * 0.8;
    pts.push((x === 0 ? "M " : "L ") + x.toFixed(1) + " " + y.toFixed(1));
  }
  return (
    <svg width={w} height={20} viewBox={"0 0 " + w + " 20"} style={{ display: "block" }}>
      <path d={pts.join(" ")} stroke={color} strokeWidth={strokeW} fill="none" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

// ═══════════════════════════════════════════════════════════════
// SVG ICON LIBRARY
// ═══════════════════════════════════════════════════════════════
const SVG = {
  check: (s = 14, col = "currentColor") => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={col} strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>,
  x:     (s = 14, col = "currentColor") => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={col} strokeWidth="2" strokeLinecap="round"><line x1="6" y1="6" x2="18" y2="18"/><line x1="6" y1="18" x2="18" y2="6"/></svg>,
  arrowRight: (s = 14) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" /></svg>,
  arrowLeft:  (s = 14) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12" /><polyline points="12 19 5 12 12 5" /></svg>,
  arrowDown:  (s = 14) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19" /><polyline points="19 12 12 19 5 12" /></svg>,
  chevDown:   (s = 12) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9" /></svg>,
  close: (s = 22) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>,
  user:  (s = 24, col = "#fff") => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={col} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>,
  menu:  (s = 20) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="4" y1="7" x2="20" y2="7" /><line x1="4" y1="12" x2="20" y2="12" /><line x1="4" y1="17" x2="20" y2="17" /></svg>,
  clockIn: (s = 14, col = "currentColor") => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={col} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="9" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="12" x2="15" y2="15" /></svg>,
  swap:    (s = 14, col = "currentColor") => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={col} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M7 10h13" /><path d="m17 7 3 3-3 3" /><path d="M17 14H4" /><path d="m7 11-3 3 3 3" /></svg>,
  checkCircle: (s = 14, col = "currentColor") => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={col} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="9" /><polyline points="9 12 11 14 15 9" /></svg>,
  message: (s = 14, col = "currentColor") => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={col} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" /></svg>,
  calendar:(s = 14, col = "currentColor") => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={col} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="5" width="18" height="16" rx="2" /><line x1="3" y1="10" x2="21" y2="10" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="16" y1="2" x2="16" y2="6" /></svg>,
  grid:    (s = 14, col = "currentColor") => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={col} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" /><rect x="3" y="14" width="7" height="7" /><rect x="14" y="14" width="7" height="7" /></svg>,
  dollar:  (s = 14, col = "currentColor") => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={col} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="1" x2="12" y2="23" /><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" /></svg>,
  phone: (s = 14, col = "currentColor") => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={col} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="5" y="2" width="14" height="20" rx="2.5" /><circle cx="12" cy="18" r="0.6" fill={col} /></svg>,
};

// ═══════════════════════════════════════════════════════════════
// LIVE FEED DATA — for hero overlay
// ═══════════════════════════════════════════════════════════════
const FEED = [
  { icon: SVG.clockIn,     text: "Marcus Rivera clocked in",            loc: "The Parlor · Bartender",            color: C.success,    ago: "just now" },
  { icon: SVG.swap,        text: "Leila posted Sat night for swap",     loc: "Common Ground · Barista",            color: C.coral500,   ago: "14s ago"  },
  { icon: SVG.checkCircle, text: "Manager approved Leila's swap",       loc: "Common Ground",                      color: C.success,    ago: "28s ago"  },
  { icon: SVG.message,     text: "Nia sent manager a message",          loc: "Capital City Tours",                 color: C.sky500,     ago: "1m ago"   },
  { icon: SVG.grid,        text: "Schedule published · 14 notified",    loc: "The Parlor",                         color: C.amber500,   ago: "2m ago"   },
  { icon: SVG.calendar,    text: "Devin requested June 14–18 off",      loc: "Common Ground",                      color: C.terracotta, ago: "3m ago"   },
];

// ═══════════════════════════════════════════════════════════════
// LOGIN MODAL — preserved (Supabase flow intact)
// ═══════════════════════════════════════════════════════════════
function LoginModal({ open, role, onClose }: { open: boolean; role: string; onClose: () => void }) {
  const [email, setEmail] = useState("");
  const [pw, setPw] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  useEffect(() => { if (!open) { setEmail(""); setPw(""); setErr(""); } }, [open]);

  const submit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setBusy(true); setErr("");
    try {
      const { createClient } = await import("@supabase/supabase-js");
      const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL as string, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string);
      const { error } = await sb.auth.signInWithPassword({ email, password: pw });
      if (error) throw error;
      window.location.href = "/";
    } catch (e2: any) { setErr(e2.message || "Invalid credentials"); }
    finally { setBusy(false); }
  };

  if (!open) return null;
  const isOwner = role === "owner";
  const accent = isOwner ? C.amber500 : C.sky500;
  const accentDk = isOwner ? C.amber700 : C.sky700;
  const label = isOwner ? "Owner" : "Employee";
  const tagline = isOwner ? "Operations Center" : "Mobile Work Hub";

  return (
    <div onClick={onClose} style={{ position: "fixed", inset: 0, background: "rgba(12,18,32,0.62)", backdropFilter: "blur(14px)", WebkitBackdropFilter: "blur(14px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, padding: 20, animation: "fadeIn 0.24s" }}>
      <div onClick={(e) => e.stopPropagation()} style={{ width: "100%", maxWidth: 440, background: "#fff", borderRadius: 4, border: "1px solid " + C.border, padding: "40px 34px", animation: "fadeUp 0.4s cubic-bezier(.22,1,.36,1)", boxShadow: "0 50px 120px rgba(12,18,32,0.3)", position: "relative" }}>
        <button onClick={onClose} aria-label="Close" style={{ position: "absolute", top: 14, right: 14, width: 34, height: 34, borderRadius: 3, background: "transparent", border: "none", color: C.t3, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", transition: "all .15s" }} onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = C.ocean100; (e.currentTarget as HTMLElement).style.color = C.t1; }} onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = "transparent"; (e.currentTarget as HTMLElement).style.color = C.t3; }}>
          {SVG.close(20)}
        </button>
        <div style={{ marginBottom: 26 }}>
          <div style={{ fontFamily: ff.mono, fontSize: 10, letterSpacing: 3, color: accent, marginBottom: 14, fontWeight: 600, textTransform: "uppercase" }}>
            — {label} Sign In
          </div>
          <div style={{ fontFamily: ff.display, fontSize: 34, fontWeight: 500, color: C.t1, letterSpacing: "-0.025em", lineHeight: 0.95 }}>
            Welcome<br /><span style={{ fontStyle: "italic", fontWeight: 300, color: accent }}>back.</span>
          </div>
          <div style={{ fontFamily: ff.body, fontSize: 13, color: C.t3, marginTop: 10 }}>{tagline} · ShiftPro.ai</div>
        </div>
        <form onSubmit={submit}>
          <label style={{ display: "block", fontFamily: ff.mono, fontSize: 9, letterSpacing: 2, color: C.t3, marginBottom: 6, textTransform: "uppercase", fontWeight: 600 }}>Email</label>
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required placeholder="you@business.com"
            style={{ width: "100%", padding: "13px 14px", background: C.ocean100, border: "1px solid " + C.ocean200, borderRadius: 3, color: C.t1, outline: "none", fontSize: 14, fontFamily: ff.body, marginBottom: 14, transition: "all .15s" }}
            onFocus={(e) => { e.currentTarget.style.borderColor = accent; e.currentTarget.style.background = "#fff"; }}
            onBlur={(e) => { e.currentTarget.style.borderColor = C.ocean200; e.currentTarget.style.background = C.ocean100; }} />
          <label style={{ display: "block", fontFamily: ff.mono, fontSize: 9, letterSpacing: 2, color: C.t3, marginBottom: 6, textTransform: "uppercase", fontWeight: 600 }}>Password</label>
          <input type="password" value={pw} onChange={(e) => setPw(e.target.value)} required placeholder="••••••••••"
            style={{ width: "100%", padding: "13px 14px", background: C.ocean100, border: "1px solid " + C.ocean200, borderRadius: 3, color: C.t1, outline: "none", fontSize: 14, fontFamily: ff.body, marginBottom: 18, transition: "all .15s" }}
            onFocus={(e) => { e.currentTarget.style.borderColor = accent; e.currentTarget.style.background = "#fff"; }}
            onBlur={(e) => { e.currentTarget.style.borderColor = C.ocean200; e.currentTarget.style.background = C.ocean100; }} />
          {err && <div style={{ padding: "10px 12px", background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.22)", borderRadius: 3, fontSize: 12.5, color: C.danger, marginBottom: 14, fontFamily: ff.body, fontWeight: 500 }}>{err}</div>}
          <button type="submit" disabled={busy} style={{ width: "100%", padding: "15px", borderRadius: 3, border: "none", background: busy ? C.ocean300 : C.ink, color: "#fff", fontFamily: ff.body, fontWeight: 700, fontSize: 14.5, marginBottom: 14, cursor: busy ? "wait" : "pointer", boxShadow: busy ? "none" : "0 4px 0 " + accentDk, transition: "all .15s", letterSpacing: "-0.01em" }}>
            {busy ? "Signing in…" : "Sign In →"}
          </button>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12.5, fontFamily: ff.body }}>
            <a href="/forgot" className="ink-link" style={{ color: C.t3 }}>Forgot password?</a>
            <a href="/final" className="ink-link" style={{ color: accent, fontWeight: 600 }}>Create account</a>
          </div>
        </form>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// MAIN LANDING PAGE
// ═══════════════════════════════════════════════════════════════
export function LandingPage() {
  const [scrolled, setScrolled] = useState(false);
  const [loginOpen, setLoginOpen] = useState(false);
  const [loginRole, setLoginRole] = useState("owner");
  const [vis, setVis] = useState<Set<string>>(new Set());
  const [vw, setVw] = useState(1200);
  const [feedIdx, setFeedIdx] = useState(0);
  const [tourStep, setTourStep] = useState(0);
  const [mobileNav, setMobileNav] = useState(false);
  const [trialEmail, setTrialEmail] = useState("");
  const [ptNow, setPtNow] = useState("--:--:--");
  const [locCount, setLocCount] = useState(1);
  const [annual, setAnnual] = useState(false);

  // viewport
  useEffect(() => {
    setVw(window.innerWidth);
    const resize = () => setVw(window.innerWidth);
    const scroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("resize", resize);
    window.addEventListener("scroll", scroll);
    return () => { window.removeEventListener("resize", resize); window.removeEventListener("scroll", scroll); };
  }, []);

  // reveals
  useEffect(() => {
    const obs = new IntersectionObserver((entries) => {
      entries.forEach(e => { if (e.isIntersecting) setVis(p => new Set([...p, e.target.getAttribute("data-rv") as string])); });
    }, { threshold: 0.08, rootMargin: "0px 0px -40px 0px" });
    document.querySelectorAll("[data-rv]").forEach(el => obs.observe(el));
    return () => obs.disconnect();
  }, []);

  // feed cycle
  useEffect(() => {
    const iv = setInterval(() => setFeedIdx(p => (p + 1) % FEED.length), 2800);
    return () => clearInterval(iv);
  }, []);

  // live Pacific time
  useEffect(() => {
    const tick = () => {
      const t = new Date().toLocaleTimeString("en-US", { timeZone: "America/Los_Angeles", hour12: true });
      setPtNow(t);
    };
    tick();
    const iv = setInterval(tick, 1000);
    return () => clearInterval(iv);
  }, []);

  const isMobile = vw < 768;
  const isTablet = vw < 1024;
  const openLogin = (role: string) => { setLoginRole(role); setLoginOpen(true); setMobileNav(false); };
  const shown = (id: string) => vis.has(id);
  const feed = FEED[feedIdx];

  // pricing math
  const starterMo = 19 * locCount;
  const proMo = 49 * locCount;
  const starterYr = Math.round(starterMo * 12 * 0.8);
  const proYr = Math.round(proMo * 12 * 0.8);

  return (
    <div style={{ background: C.ocean100, minHeight: "100vh", color: C.t1 }}>
      <style>{GCSS}</style>
      <LoginModal open={loginOpen} role={loginRole} onClose={() => setLoginOpen(false)} />

      {/* ═══════════════════════════════════════════════════════════
          NAVIGATION — compressed, mono, live PT clock
          ═══════════════════════════════════════════════════════════ */}
      <nav style={{ position: "fixed", top: 0, left: 0, right: 0, zIndex: 100, padding: "0 20px", background: scrolled ? "rgba(232,241,247,0.82)" : "transparent", borderBottom: "1px solid " + (scrolled ? C.border : "transparent"), backdropFilter: scrolled ? "blur(20px) saturate(180%)" : "none", WebkitBackdropFilter: scrolled ? "blur(20px) saturate(180%)" : "none", transition: "all 0.35s cubic-bezier(.22,1,.36,1)" }}>
        <div style={{ maxWidth: 1320, margin: "0 auto", height: isMobile ? 58 : 72, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16 }}>

          {/* LOGO */}
          <a href="/" className="swirl-wrap" style={{ display: "flex", alignItems: "center", gap: 10, flexShrink: 0, position: "relative" }}>
            <SwirlMark size={34} />
            <div style={{ display: "flex", flexDirection: "column", lineHeight: 1 }}>
              <span style={{ fontFamily: ff.display, fontWeight: 700, fontSize: 19, color: C.t1, letterSpacing: "-0.03em" }}>ShiftPro<span style={{ color: C.amber500, fontStyle: "italic", fontWeight: 400 }}>.ai</span></span>
              <span style={{ fontFamily: ff.mono, fontSize: 8, color: C.t3, letterSpacing: 2.2, marginTop: 3, fontWeight: 500 }}>EST. BEND, OR · 2026</span>
            </div>
            <span className="swirl-tip">◖ AHOY ◗</span>
          </a>

          {/* CENTER LINKS (desktop only) */}
          {!isMobile && (
            <div style={{ display: "flex", gap: 28, alignItems: "center" }}>
              {[["Tour", "#tour"], ["Pricing", "#pricing"], ["Story", "#story"], ["FAQ", "#faq"]].map(([l, h]) => (
                <a key={l} href={h} className="ink-link" style={{ fontFamily: ff.mono, fontSize: 11, fontWeight: 600, color: C.t2, letterSpacing: 1.4, textTransform: "uppercase" }}>{l}</a>
              ))}
            </div>
          )}

          {/* RIGHT GROUP */}
          <div style={{ display: "flex", alignItems: "center", gap: 14, flexShrink: 0 }}>
            {!isMobile && (
              <div style={{ display: "flex", alignItems: "center", gap: 8, paddingRight: 14, borderRight: "1px solid " + C.border }}>
                <span style={{ width: 6, height: 6, borderRadius: "50%", background: C.success, animation: "pulse 1.8s infinite", boxShadow: "0 0 0 3px rgba(16,185,129,0.15)" }} />
                <span className="tn" style={{ fontFamily: ff.mono, fontSize: 11, color: C.t2, fontWeight: 500, letterSpacing: 0.5 }}>{ptNow} <span style={{ color: C.t4 }}>PT</span></span>
              </div>
            )}

            {!isMobile && (
              <div className="nav-dd">
                <button style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "10px 14px", border: "1px solid " + C.border, background: "#fff", color: C.t1, fontFamily: ff.body, fontWeight: 600, fontSize: 13, cursor: "pointer", borderRadius: 3, letterSpacing: "-0.005em" }}>
                  Sign in {SVG.chevDown(11)}
                </button>
                <div className="nav-dd-menu">
                  <button onClick={() => openLogin("owner")} style={{ display: "block", width: "100%", padding: "12px 14px", background: "transparent", border: "none", textAlign: "left", cursor: "pointer", borderRadius: 3, transition: "background .12s" }} onMouseEnter={(e) => (e.currentTarget as HTMLElement).style.background = C.amber50} onMouseLeave={(e) => (e.currentTarget as HTMLElement).style.background = "transparent"}>
                    <div style={{ fontFamily: ff.body, fontSize: 13.5, fontWeight: 600, color: C.t1, marginBottom: 2 }}>Owner →</div>
                    <div style={{ fontFamily: ff.mono, fontSize: 10, color: C.amber600, letterSpacing: 1.2, textTransform: "uppercase" }}>Operations Center</div>
                  </button>
                  <div style={{ height: 1, background: C.border, margin: "4px 10px" }} />
                  <button onClick={() => openLogin("employee")} style={{ display: "block", width: "100%", padding: "12px 14px", background: "transparent", border: "none", textAlign: "left", cursor: "pointer", borderRadius: 3, transition: "background .12s" }} onMouseEnter={(e) => (e.currentTarget as HTMLElement).style.background = "rgba(14,165,233,0.08)"} onMouseLeave={(e) => (e.currentTarget as HTMLElement).style.background = "transparent"}>
                    <div style={{ fontFamily: ff.body, fontSize: 13.5, fontWeight: 600, color: C.t1, marginBottom: 2 }}>Employee →</div>
                    <div style={{ fontFamily: ff.mono, fontSize: 10, color: C.sky700, letterSpacing: 1.2, textTransform: "uppercase" }}>Mobile Work Hub</div>
                  </button>
                </div>
              </div>
            )}

            <a href="/final" style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "10px 18px", background: C.ink, color: "#fff", fontFamily: ff.body, fontWeight: 700, fontSize: 13, borderRadius: 3, letterSpacing: "-0.005em", boxShadow: "0 3px 0 " + C.amber600, transition: "transform .15s" }} onMouseEnter={(e) => (e.currentTarget as HTMLElement).style.transform = "translateY(-1px)"} onMouseLeave={(e) => (e.currentTarget as HTMLElement).style.transform = "none"}>
              Start Free →
            </a>

            {isMobile && (
              <button onClick={() => setMobileNav(!mobileNav)} style={{ padding: 9, border: "1px solid " + C.border, background: "#fff", color: C.t1, cursor: "pointer", display: "flex", borderRadius: 3 }} aria-label="Menu">
                {mobileNav ? SVG.close(20) : SVG.menu(20)}
              </button>
            )}
          </div>
        </div>

        {isMobile && mobileNav && (
          <div style={{ borderTop: "1px solid " + C.border, padding: "14px 16px", background: "#fff", display: "flex", flexDirection: "column", gap: 8, animation: "fadeIn .2s" }}>
            {[["Tour", "#tour"], ["Pricing", "#pricing"], ["Story", "#story"], ["FAQ", "#faq"]].map(([l, h]) => (
              <a key={l} href={h} onClick={() => setMobileNav(false)} style={{ padding: "11px 4px", fontFamily: ff.mono, fontSize: 12, color: C.t2, fontWeight: 600, letterSpacing: 1.5, textTransform: "uppercase", borderBottom: "1px solid " + C.border }}>{l}</a>
            ))}
            <button onClick={() => openLogin("owner")} style={{ marginTop: 8, padding: "13px", borderRadius: 3, border: "1px solid " + C.amber500, background: C.amber50, color: C.amber700, fontFamily: ff.body, fontWeight: 700, fontSize: 14, cursor: "pointer" }}>Owner Sign In →</button>
            <button onClick={() => openLogin("employee")} style={{ padding: "13px", borderRadius: 3, border: "1px solid " + C.ocean300, background: "#fff", color: C.sky700, fontFamily: ff.body, fontWeight: 700, fontSize: 14, cursor: "pointer" }}>Employee Sign In →</button>
          </div>
        )}
      </nav>

      {/* ═══════════════════════════════════════════════════════════
          HERO — broken editorial grid, tilted light dashboard,
          amber tape label, live feed overlay
          ═══════════════════════════════════════════════════════════ */}
      <section style={{ position: "relative", minHeight: isMobile ? "auto" : "100vh", padding: isMobile ? "120px 20px 80px" : "150px 28px 110px", overflow: "hidden" }}>
        {/* Subtle atmosphere */}
        <div aria-hidden style={{ position: "absolute", top: "-10%", right: "-10%", width: 560, height: 560, background: "radial-gradient(circle, rgba(224,123,0,0.1) 0%,transparent 60%)", animation: "drift 22s ease-in-out infinite", filter: "blur(90px)", pointerEvents: "none" }} />
        <div aria-hidden style={{ position: "absolute", bottom: "-15%", left: "-8%", width: 520, height: 520, background: "radial-gradient(circle, rgba(30,127,212,0.09) 0%,transparent 60%)", animation: "drift2 28s ease-in-out infinite", filter: "blur(90px)", pointerEvents: "none" }} />

        <div style={{ position: "relative", maxWidth: 1320, width: "100%", margin: "0 auto" }}>

          {/* Grid: 7/5 split with breaks for hierarchy */}
          <div style={{ display: "grid", gridTemplateColumns: isTablet ? "1fr" : "minmax(0,1.15fr) minmax(0,1fr)", gap: isTablet ? 48 : 72, alignItems: "start" }}>

            {/* LEFT — copy column */}
            <div>
              {/* Pill — mono all caps, NO period at end */}
              <div style={{ display: "inline-flex", alignItems: "center", gap: 10, padding: "6px 14px 6px 10px", background: "#fff", border: "1px solid " + C.border, borderRadius: 40, marginBottom: 36, boxShadow: "0 2px 0 " + C.ocean200, animation: "fadeUp .7s cubic-bezier(.22,1,.36,1) both" }}>
                <span style={{ display: "inline-flex", width: 14, height: 14, alignItems: "center", justifyContent: "center" }}>
                  <span style={{ width: 6, height: 6, borderRadius: "50%", background: C.success, boxShadow: "0 0 0 3px rgba(16,185,129,0.2)", animation: "pulse 1.8s infinite" }} />
                </span>
                <span style={{ fontFamily: ff.mono, fontSize: 10, letterSpacing: 2.4, color: C.t2, fontWeight: 600 }}>NOW LIVE · BUILT BY A REAL BUSINESS OWNER</span>
              </div>

              {/* Headline — scale contrast */}
              <h1 style={{ fontFamily: ff.display, fontSize: isMobile ? 58 : "clamp(74px,9.4vw,142px)", lineHeight: 0.86, fontWeight: 500, letterSpacing: "-0.045em", marginBottom: 28, color: C.t1, animation: "fadeUp .9s cubic-bezier(.22,1,.36,1) .1s both" }}>
                Your team.<br />
                <span style={{ fontFamily: ff.display, fontStyle: "italic", fontWeight: 300, color: C.amber500, display: "block", marginLeft: isMobile ? "0" : "0.25em", letterSpacing: "-0.05em" }}>
                  On autopilot<span style={{ color: C.terracotta }}>.</span>
                </span>
              </h1>

              {/* Body with cadence breaks */}
              <div style={{ fontFamily: ff.body, fontSize: isMobile ? 17 : 19.5, color: C.t2, lineHeight: 1.5, marginBottom: 42, maxWidth: 520, fontWeight: 400, animation: "fadeUp .9s cubic-bezier(.22,1,.36,1) .22s both" }}>
                The schedule. The clock. The swap requests.<br />
                <span style={{ color: C.t1, fontWeight: 500 }}>One app your team actually opens.</span>
              </div>

              {/* CTA row — pressed-feel ink button + ghost */}
              <div style={{ display: "flex", gap: 14, flexWrap: "wrap", marginBottom: 36, animation: "fadeUp .9s cubic-bezier(.22,1,.36,1) .34s both" }}>
                <a href="/final" className="btn-ink">
                  Start 7 days free<span className="arrow">{SVG.arrowRight(14)}</span>
                </a>
                <a href="#tour" className="btn-ghost">
                  See it work{SVG.arrowDown(13)}
                </a>
              </div>

              {/* Trust strip — SPECIFIC, not generic */}
              <div style={{ display: "flex", alignItems: "center", gap: 12, fontFamily: ff.mono, fontSize: 11, color: C.t3, fontWeight: 500, animation: "fadeUp .9s cubic-bezier(.22,1,.36,1) .46s both" }}>
                <span style={{ color: C.terracotta, fontSize: 14, lineHeight: 1 }}>✺</span>
                <span style={{ lineHeight: 1.5 }}>Setup in the time it takes to pull a shot of espresso.<br /><span style={{ color: C.t4 }}>No card. No contract. Keep your data.</span></span>
              </div>
            </div>

            {/* RIGHT — tilted light dashboard with live feed overlay */}
            {!isTablet && (
              <div style={{ position: "relative", animation: "fadeUp 1s cubic-bezier(.22,1,.36,1) .3s both", paddingTop: 20 }}>
                {/* Amber tape label */}
                <div style={{ position: "absolute", top: -4, left: -18, zIndex: 4, animation: "tapeDrift 3s ease-in-out infinite" }}>
                  <span className="tape">LIVE · BEND, OR</span>
                </div>

                {/* Main dashboard card — LIGHT themed, tilted */}
                <div style={{ transform: "perspective(1600px) rotateY(-2deg) rotateX(4deg) rotate(2.2deg)", transformOrigin: "center", transformStyle: "preserve-3d", background: "#fff", borderRadius: 8, border: "1px solid " + C.border, boxShadow: "0 30px 60px -20px rgba(12,18,32,0.2), 0 60px 120px -40px rgba(12,18,32,0.25), 0 0 0 1px rgba(255,255,255,0.5)", overflow: "hidden", position: "relative" }}>
                  {/* Window chrome */}
                  <div style={{ display: "flex", alignItems: "center", gap: 6, padding: "12px 14px", borderBottom: "1px solid " + C.border, background: C.ocean50 }}>
                    <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#ef4444" }} />
                    <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#f59e0b" }} />
                    <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#10b981" }} />
                    <div style={{ marginLeft: 10, padding: "2px 10px", background: "#fff", borderRadius: 20, fontFamily: ff.mono, fontSize: 9, color: C.t3, letterSpacing: 0.6, border: "1px solid " + C.border }}>shiftpro.ai/command</div>
                    <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 5 }}>
                      <span style={{ width: 5, height: 5, borderRadius: "50%", background: C.success, animation: "pulse 1.8s infinite" }} />
                      <span className="tn" style={{ fontFamily: ff.mono, fontSize: 8.5, color: C.success, letterSpacing: 1.2, fontWeight: 600 }}>{ptNow}</span>
                    </div>
                  </div>

                  {/* Dashboard body — light, ordered */}
                  <div style={{ padding: 20 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 14 }}>
                      <div>
                        <div style={{ fontFamily: ff.mono, fontSize: 9, color: C.t3, letterSpacing: 2, textTransform: "uppercase", marginBottom: 4 }}>This week</div>
                        <div style={{ fontFamily: ff.display, fontSize: 22, fontWeight: 600, color: C.t1, letterSpacing: "-0.02em" }}>The Parlor</div>
                      </div>
                      <div style={{ fontFamily: ff.mono, fontSize: 10, color: C.amber600, fontWeight: 600, letterSpacing: 1 }}>12 ON · 3 OFF</div>
                    </div>

                    {/* Day headers */}
                    <div style={{ display: "grid", gridTemplateColumns: "56px repeat(5, 1fr)", gap: 4, marginBottom: 6 }}>
                      <div />
                      {["MON", "TUE", "WED", "THU", "FRI"].map((d, i) => (
                        <div key={d} style={{ fontFamily: ff.mono, fontSize: 9, color: i === 3 ? C.amber600 : C.t3, letterSpacing: 1.5, fontWeight: 600, textAlign: "center" }}>{d} {(i === 3) && "•"}</div>
                      ))}
                    </div>

                    {/* Schedule rows */}
                    {[
                      { name: "Jake M.",  role: "bar",   cells: [1,1,0,1,1] },
                      { name: "Sarah C.", role: "serve", cells: [0,1,1,1,1] },
                      { name: "Priya P.", role: "bar",   cells: [1,0,1,0,1] },
                      { name: "Carlos M.",role: "serve", cells: [1,1,1,1,0] },
                      { name: "Anya Cole",role: "host",  cells: [0,0,1,1,1] },
                    ].map((row, i) => (
                      <div key={row.name} style={{ display: "grid", gridTemplateColumns: "56px repeat(5, 1fr)", gap: 4, marginBottom: 4 }}>
                        <div style={{ fontFamily: ff.body, fontSize: 10.5, color: C.t1, fontWeight: 600, alignSelf: "center" }}>{row.name}</div>
                        {row.cells.map((on, j) => (
                          <div key={j} className="sch-cell" style={{
                            height: 22,
                            borderRadius: 2,
                            background: on ? (j === 3 ? C.amber500 : C.ocean200) : "transparent",
                            border: on ? "none" : "1px dashed " + C.ocean200,
                            display: "flex", alignItems: "center", justifyContent: "center",
                            fontFamily: ff.mono, fontSize: 8, fontWeight: 600,
                            color: on ? (j === 3 ? "#fff" : C.t2) : C.t4,
                          }}>
                            {on ? (j === 3 ? "5-CL" : ["9-5","10-6","11-7","","5-CL"][j] || "") : ""}
                          </div>
                        ))}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Live feed overlay card — bottom-left, counter-tilted */}
                <div key={feedIdx} style={{ position: "absolute", bottom: -28, left: -32, zIndex: 5, transform: "rotate(-3deg)", background: "#fff", borderRadius: 6, border: "1px solid " + C.border, padding: "12px 14px", boxShadow: "0 20px 40px rgba(12,18,32,0.15)", minWidth: 240, animation: "feedIn .45s cubic-bezier(.22,1,.36,1)" }}>
                  <div style={{ fontFamily: ff.mono, fontSize: 9, color: C.t3, letterSpacing: 2, marginBottom: 8, display: "flex", justifyContent: "space-between" }}>
                    <span>LIVE FEED</span><span className="tn">{feed.ago}</span>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <span style={{ width: 32, height: 32, borderRadius: 4, background: feed.color + "18", display: "flex", alignItems: "center", justifyContent: "center", color: feed.color, flexShrink: 0 }}>{feed.icon(16, feed.color)}</span>
                    <div>
                      <div style={{ fontFamily: ff.body, fontSize: 12.5, color: C.t1, fontWeight: 600, lineHeight: 1.25 }}>{feed.text}</div>
                      <div style={{ fontFamily: ff.mono, fontSize: 9, color: C.t3, letterSpacing: 0.6, marginTop: 3 }}>{feed.loc}</div>
                    </div>
                  </div>
                </div>

                {/* Small phone notification card — top-right */}
                <div style={{ position: "absolute", top: 60, right: -36, zIndex: 3, transform: "rotate(4deg)", background: C.ink, borderRadius: 6, padding: "10px 12px", boxShadow: "0 15px 30px rgba(12,18,32,0.3)", minWidth: 180 }}>
                  <div style={{ fontFamily: ff.mono, fontSize: 8, color: C.amber400, letterSpacing: 1.5, marginBottom: 4 }}>◖ PUSH · 2:23 PM</div>
                  <div style={{ fontFamily: ff.body, fontSize: 11.5, color: "#fff", fontWeight: 500, lineHeight: 1.3 }}>
                    Your Fri 5pm–close is<br /><span style={{ color: C.amber400 }}>locked in.</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          RUNNING TICKER — real activity strip between hero and story
          ═══════════════════════════════════════════════════════════ */}
      <section style={{ padding: "22px 0", background: C.ink, color: "#fff", overflow: "hidden", borderTop: "1px solid " + C.indigoDeep, borderBottom: "1px solid " + C.indigoDeep, position: "relative" }}>
        <div style={{ display: "flex", gap: 54, whiteSpace: "nowrap", animation: "marquee 52s linear infinite", width: "max-content" }}>
          {Array.from({ length: 2 }).flatMap((_, k) => [
            { tag: "CLOCK-IN",  txt: "Marcus Rivera · The Parlor Bartender" },
            { tag: "SWAP",      txt: "Leila posted Sat 5pm–close for swap" },
            { tag: "APPROVE",   txt: "Manager approved Leila's swap" },
            { tag: "PUBLISH",   txt: "Week of Jun 16 · The Parlor · 14 shifts" },
            { tag: "MESSAGE",   txt: "Devin: 'Running 5 min late'" },
            { tag: "CLOCK-OUT", txt: "Nia Cole · 8.25h logged" },
            { tag: "REQUEST",   txt: "Devin requested Jun 14–18 off" },
            { tag: "PAYROLL",   txt: "Weekly CSV exported · 412 hrs" },
          ].map((it, i) => (
            <span key={k + "-" + i} style={{ display: "inline-flex", alignItems: "center", gap: 14, fontFamily: ff.mono, fontSize: 11, letterSpacing: 1 }}>
              <span style={{ color: C.amber400, fontWeight: 700, letterSpacing: 2 }}>◉ {it.tag}</span>
              <span style={{ color: "rgba(255,255,255,0.82)" }}>{it.txt}</span>
              <span style={{ color: "rgba(255,255,255,0.2)", margin: "0 6px" }}>／</span>
            </span>
          )))}
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          STORY / FOUNDER LETTER — PARCHMENT BREAK
          editorial two-column, drop cap, handwritten signature
          ═══════════════════════════════════════════════════════════ */}
      <section id="story" className="grain-overlay" data-rv="story" style={{ position: "relative", padding: isMobile ? "88px 20px" : "140px 28px", background: C.parchment, borderTop: "1px solid " + C.parchmentOn, borderBottom: "1px solid " + C.parchmentOn, overflow: "hidden" }}>
        {/* Paper-edge detail on top */}
        <div aria-hidden style={{ position: "absolute", top: 0, left: 0, right: 0, height: 20, background: "repeating-linear-gradient(-2deg, " + C.parchmentOn + ", " + C.parchmentOn + " 8px, transparent 8px, transparent 22px)", opacity: 0.7, pointerEvents: "none" }} />

        <div style={{ maxWidth: 1080, margin: "0 auto", position: "relative", zIndex: 2 }}>
          {/* Section head */}
          <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: isMobile ? 40 : 64 }} className={"rv " + (shown("story") ? "vis" : "")}>
            <Squiggle w={60} color={C.sage} strokeW={1.6} />
            <Squiggle w={60} color={C.sage} strokeW={1.6} />
          </div>

          {/* The giant pull quote */}
          <div data-rv="pq" className={"rv " + (shown("pq") ? "vis" : "")} style={{ marginBottom: isMobile ? 56 : 80 }}>
            <div style={{ fontFamily: ff.display, fontSize: isMobile ? 36 : "clamp(52px, 6.4vw, 96px)", fontStyle: "italic", fontWeight: 300, lineHeight: 1.0, letterSpacing: "-0.035em", color: C.t1, maxWidth: 960 }}>
              <span style={{ color: C.terracotta, fontFamily: ff.display, fontSize: "1.3em", lineHeight: 0, display: "inline-block", verticalAlign: "-0.15em", marginRight: "0.02em" }}>“</span>
              Every scheduling app I tried felt like it was designed<br className="hide-mobile" /> by someone who's <span style={{ fontWeight: 700, fontStyle: "normal", color: C.terracotta }}>never worked a Friday close.</span>
              <span style={{ color: C.terracotta, fontFamily: ff.display, fontSize: "1.3em", lineHeight: 0, display: "inline-block", verticalAlign: "-0.15em", marginLeft: "0.02em" }}>”</span>
            </div>
          </div>

          {/* Editorial two-column body with drop cap */}
          <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 2fr", gap: isMobile ? 40 : 80, alignItems: "start" }}>
            {/* Left rail — metadata + "photo" space */}
            <div data-rv="storyRail" className={"rv " + (shown("storyRail") ? "vis" : "")} style={{ display: "flex", justifyContent: isMobile ? "flex-start" : "center", alignItems: "flex-start", paddingTop: isMobile ? 0 : 20 }}>
              {/* #1 Seal of Approval */}
              <svg width="210" height="210" viewBox="0 0 210 210" style={{ transform: "rotate(-6deg)", filter: "drop-shadow(0 8px 24px rgba(12,18,32,0.13))" }}>
                {/* Outer starburst ring */}
                {Array.from({ length: 24 }).map((_, i) => {
                  const a = (i * 360) / 24;
                  const r1 = 98, r2 = 88;
                  const ax = 105 + r1 * Math.cos((a * Math.PI) / 180);
                  const ay = 105 + r1 * Math.sin((a * Math.PI) / 180);
                  const bx = 105 + r2 * Math.cos(((a + 7.5) * Math.PI) / 180);
                  const by = 105 + r2 * Math.sin(((a + 7.5) * Math.PI) / 180);
                  return <line key={i} x1={ax} y1={ay} x2={bx} y2={by} stroke={C.amber500} strokeWidth="2.5" opacity="0.85" />;
                })}
                {/* Main circle */}
                <circle cx="105" cy="105" r="84" fill={C.ink} />
                <circle cx="105" cy="105" r="78" fill="none" stroke={C.amber500} strokeWidth="1.5" opacity="0.6" />
                <circle cx="105" cy="105" r="72" fill="none" stroke={C.amber500} strokeWidth="0.8" opacity="0.35" />
                {/* Top arc text */}
                <path id="topArc" d="M 105,105 m -62,0 a 62,62 0 1,1 124,0" fill="none" />
                <text fontSize="9.5" fontFamily="'JetBrains Mono', monospace" fontWeight="700" fill={C.amber400} letterSpacing="3.5">
                  <textPath href="#topArc" startOffset="8%">RATED  #1  BY  OPERATORS</textPath>
                </text>
                {/* Bottom arc text */}
                <path id="btmArc" d="M 105,105 m 62,0 a 62,62 0 1,1 -124,0" fill="none" />
                <text fontSize="9" fontFamily="'JetBrains Mono', monospace" fontWeight="600" fill={C.amber400} letterSpacing="2.8">
                  <textPath href="#btmArc" startOffset="10%">SMALL  ·  MEDIUM  BUSINESS</textPath>
                </text>
                {/* Center content */}
                <text x="105" y="88" textAnchor="middle" fontSize="42" fontFamily="'Fraunces', serif" fontWeight="700" fill="#fff">#1</text>
                <text x="105" y="108" textAnchor="middle" fontSize="11" fontFamily="'JetBrains Mono', monospace" fontWeight="600" fill={C.amber400} letterSpacing="2">APP FOR</text>
                <text x="105" y="124" textAnchor="middle" fontSize="11.5" fontFamily="'Fraunces', serif" fontStyle="italic" fontWeight="300" fill="rgba(255,255,255,0.9)">Shift-Based</text>
                <text x="105" y="140" textAnchor="middle" fontSize="11.5" fontFamily="'Fraunces', serif" fontStyle="italic" fontWeight="300" fill="rgba(255,255,255,0.9)">Operations</text>
                {/* Stars */}
                {[-28, -14, 0, 14, 28].map((offset, i) => (
                  <text key={i} x={105 + offset} y="157" textAnchor="middle" fontSize="9" fill={C.amber500}>★</text>
                ))}
              </svg>
            </div>

            {/* Right rail — editorial body */}
            <div data-rv="storyBody" className={"rv rv-d2 " + (shown("storyBody") ? "vis" : "")}>
              <div className="dropcap col2" style={{ fontFamily: ff.display, fontSize: 17, lineHeight: 1.6, color: C.t1, fontWeight: 400, letterSpacing: "-0.005em" }}>
                I run a bar in Bend, Oregon. Before that, a coffee shop. For seven years I scheduled shifts on a spreadsheet, in a group text, and — god help me — on a corkboard by the walk-in.
                <br /><br />
                Every scheduling app I tried was built for someone else. They wanted our payroll data, our retention metrics, our compliance reports. What I wanted was to publish next week's schedule without losing a Saturday morning to it.
                <br /><br />
                So I built ShiftPro. It handles the schedule. It handles the clock. It handles the "can I swap Sunday?" texts. It doesn't try to handle HR, or benefits, or your POS. It does the one thing you actually need done.
                <br /><br />
                If you run a bar, a coffee shop, a tour company, a gym, a salon — anything where the schedule runs the whole show — it was built for you. Try it for a week. If it saves you a Saturday morning, you'll never go back.
              </div>

            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          BY THE NUMBERS — editorial stats trio
          ═══════════════════════════════════════════════════════════ */}
      <section style={{ padding: isMobile ? "72px 20px" : "112px 28px", background: C.ocean100, borderBottom: "1px solid " + C.border }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <div data-rv="stats-h" className={"rv " + (shown("stats-h") ? "vis" : "")} style={{ marginBottom: isMobile ? 36 : 56 }}>
            <h2 style={{ fontFamily: ff.display, fontSize: isMobile ? 36 : "clamp(44px,5vw,64px)", fontWeight: 500, color: C.t1, letterSpacing: "-0.03em", lineHeight: 1 }}>
              Fewer hours. <span style={{ fontStyle: "italic", fontWeight: 300, color: C.amber500 }}>Fewer texts.</span>
            </h2>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "repeat(3, 1fr)", gap: isMobile ? 32 : 0, borderTop: "1px solid " + C.border, borderBottom: "1px solid " + C.border }}>
            {[
              { num: "5 min", label: "First schedule published", detail: "From signup to the first text that goes out." },
              { num: "6 hrs", label: "Saved per week, per owner", detail: "Averaged across the first 100 businesses." },
              { num: "0",     label: "Group texts about shifts",  detail: "We replace them with swaps, pickups, and push." },
            ].map((s, i) => (
              <div key={i} data-rv={"stat-" + i} className={"rv rv-d" + (i + 1) + " " + (shown("stat-" + i) ? "vis" : "")} style={{ padding: isMobile ? "32px 0" : "48px 36px", borderLeft: !isMobile && i > 0 ? "1px solid " + C.border : "none", borderBottom: isMobile && i < 2 ? "1px solid " + C.border : "none" }}>
                <div className="tn" style={{ fontFamily: ff.display, fontSize: isMobile ? 72 : "clamp(80px,8vw,120px)", fontWeight: 500, color: C.t1, letterSpacing: "-0.05em", lineHeight: 0.9, marginBottom: 16 }}>
                  {s.num}
                </div>
                <div style={{ fontFamily: ff.display, fontSize: 20, fontStyle: "italic", fontWeight: 400, color: C.terracotta, marginBottom: 8, letterSpacing: "-0.01em" }}>{s.label}</div>
                <div style={{ fontFamily: ff.body, fontSize: 14, color: C.t2, lineHeight: 1.55, maxWidth: 320 }}>{s.detail}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          PRODUCT TOUR — verb-led tabs, light mockups, editorial nav
          ═══════════════════════════════════════════════════════════ */}
      <section id="tour" style={{ padding: isMobile ? "84px 20px" : "130px 28px", background: C.ocean100 }}>
        <div style={{ maxWidth: 1280, margin: "0 auto" }}>
          {/* Head */}
          <div data-rv="tour-h" className={"rv " + (shown("tour-h") ? "vis" : "")} style={{ marginBottom: isMobile ? 44 : 72 }}>
            <h2 style={{ fontFamily: ff.display, fontSize: isMobile ? 40 : "clamp(52px,6vw,86px)", fontWeight: 500, color: C.t1, letterSpacing: "-0.035em", lineHeight: 0.95, maxWidth: 900 }}>
              Five things you'll stop doing<br /><span style={{ fontStyle: "italic", fontWeight: 300, color: C.amber500 }}>by Tuesday.</span>
            </h2>
          </div>

          {/* Verb-led tabs */}
          {(() => {
            const tours = [
              { verb: "Build the schedule",      tail: "in 4 minutes",           meta: "SCHEDULE" },
              { verb: "See who's clocked in",    tail: "right now",              meta: "TIME CLOCK" },
              { verb: "Approve a swap",          tail: "from your phone",        meta: "SWAPS" },
              { verb: "Export payroll",          tail: "as one CSV",             meta: "PAYROLL" },
              { verb: "Stop answering",          tail: "\"what am I working?\"", meta: "TEAM CHAT" },
            ];
            const active = tours[tourStep];
            return (
              <>
                <div data-rv="tour-tabs" className={"rv " + (shown("tour-tabs") ? "vis" : "")} style={{ display: "flex", gap: isMobile ? 8 : 12, flexWrap: "wrap", marginBottom: 44, borderBottom: "1px solid " + C.border, paddingBottom: 0 }}>
                  {tours.map((t, i) => {
                    const on = tourStep === i;
                    return (
                      <button key={i} onClick={() => setTourStep(i)} style={{
                        padding: isMobile ? "10px 14px 14px" : "14px 18px 18px",
                        background: "transparent",
                        border: "none",
                        borderBottom: on ? "2px solid " + C.terracotta : "2px solid transparent",
                        marginBottom: -1,
                        cursor: "pointer",
                        textAlign: "left",
                        transition: "all .2s",
                      }}>
                        <div style={{ fontFamily: ff.mono, fontSize: 9, color: on ? C.terracotta : C.t4, letterSpacing: 2, fontWeight: 600, marginBottom: 4 }}>
                          {t.meta}
                        </div>
                        <div style={{ fontFamily: ff.display, fontSize: isMobile ? 15 : 18, fontWeight: 500, color: on ? C.t1 : C.t3, letterSpacing: "-0.015em", lineHeight: 1.2, maxWidth: isMobile ? 150 : 200 }}>
                          {t.verb}<br />
                          <span style={{ fontStyle: "italic", fontWeight: 300, color: on ? C.amber500 : C.t4, fontSize: isMobile ? 14 : 16 }}>{t.tail}</span>
                        </div>
                      </button>
                    );
                  })}
                </div>

                {/* Active panel */}
                <div key={tourStep} style={{ animation: "fadeIn .4s ease", background: "#fff", borderRadius: 6, border: "1px solid " + C.border, padding: isMobile ? 24 : 40, boxShadow: "0 30px 70px -30px rgba(12,18,32,0.18)", marginBottom: 24 }}>
                  <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1.25fr", gap: isMobile ? 28 : 48, alignItems: "start" }}>
                    <div>
                      <h3 style={{ fontFamily: ff.display, fontSize: isMobile ? 30 : 42, fontWeight: 500, color: C.t1, letterSpacing: "-0.025em", lineHeight: 1, marginBottom: 20 }}>
                        {active.verb}<br />
                        <span style={{ fontStyle: "italic", fontWeight: 300, color: C.amber500 }}>{active.tail}</span>
                      </h3>
                      <p style={{ fontFamily: ff.body, fontSize: 15, color: C.t2, lineHeight: 1.65, marginBottom: 20, maxWidth: 420 }}>
                        {[
                          "Drag-drop a template from last week, or let the AI suggest one based on forecasted covers. Publish when it's right. Your team gets notified.",
                          "One dashboard. Every clock-in across every location. Geofenced so nobody's punching in from the parking lot.",
                          "Sarah posts her Saturday. Jake grabs it. You tap approve. Done — while you're on the espresso machine.",
                          "Hours, overtime, breaks. Clean CSV. Import into Gusto, QuickBooks, or whoever runs your books.",
                          "Targeted messages, not group-text chaos. Schedule-scoped — when Carlos leaves, he's off the thread.",
                        ][tourStep]}
                      </p>
                      <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 8 }}>
                        {[
                          ["Drag a template", "Publish in seconds", "Auto-notify the team"],
                          ["Geofenced clock-in", "Real-time coverage map", "Overtime alerts"],
                          ["One-tap approve", "Fairness tracking", "No double-booking"],
                          ["Per-location payroll", "CSV or JSON export", "Rounds to your rules"],
                          ["Shift-scoped threads", "Read receipts", "Archive on unassign"],
                        ][tourStep].map((pt, j) => (
                          <li key={j} style={{ display: "flex", alignItems: "center", gap: 10, fontFamily: ff.mono, fontSize: 11, color: C.t2, letterSpacing: 0.3 }}>
                            <span style={{ color: C.success }}>{SVG.check(13, C.success)}</span>{pt}
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Mockup pane per step */}
                    <div style={{ background: C.ocean50, borderRadius: 4, border: "1px solid " + C.border, padding: 18, minHeight: 320, position: "relative", overflow: "hidden" }}>
                      {tourStep === 0 && (
                        <TourScheduleMock />
                      )}
                      {tourStep === 1 && (
                        <TourClockMock ptNow={ptNow} />
                      )}
                      {tourStep === 2 && (
                        <TourSwapMock />
                      )}
                      {tourStep === 3 && (
                        <TourPayrollMock />
                      )}
                      {tourStep === 4 && (
                        <TourChatMock />
                      )}
                    </div>
                  </div>
                </div>

                {/* Editorial prev/next */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 8, fontFamily: ff.mono, fontSize: 11 }}>
                  <button onClick={() => setTourStep((tourStep - 1 + tours.length) % tours.length)} className="ink-link" style={{ background: "none", border: "none", cursor: "pointer", color: C.t2, fontFamily: ff.mono, fontSize: 11, letterSpacing: 1.5, textTransform: "uppercase", fontWeight: 600, display: "inline-flex", alignItems: "center", gap: 8 }}>
                    {SVG.arrowLeft(12)} <span>PREV · {tours[(tourStep - 1 + tours.length) % tours.length].meta}</span>
                  </button>
                  <span style={{ color: C.t4, fontFamily: ff.mono, fontSize: 11, letterSpacing: 2 }}>
                    {String(tourStep + 1).padStart(2, "0")} / {String(tours.length).padStart(2, "0")}
                  </span>
                  <button onClick={() => setTourStep((tourStep + 1) % tours.length)} className="ink-link" style={{ background: "none", border: "none", cursor: "pointer", color: C.t2, fontFamily: ff.mono, fontSize: 11, letterSpacing: 1.5, textTransform: "uppercase", fontWeight: 600, display: "inline-flex", alignItems: "center", gap: 8 }}>
                    <span>NEXT · {tours[(tourStep + 1) % tours.length].meta}</span> {SVG.arrowRight(12)}
                  </button>
                </div>
              </>
            );
          })()}
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          PRICING — Pro dominant, location calculator, annual toggle
          ═══════════════════════════════════════════════════════════ */}
      <section id="pricing" style={{ padding: isMobile ? "88px 20px" : "140px 28px", background: C.ocean100, borderTop: "1px solid " + C.border, position: "relative", overflow: "hidden" }}>
        <div style={{ maxWidth: 1280, margin: "0 auto", position: "relative" }}>

          {/* Head */}
          <div data-rv="pr-h" className={"rv " + (shown("pr-h") ? "vis" : "")} style={{ marginBottom: isMobile ? 40 : 64, textAlign: isMobile ? "left" : "center" }}>
            <h2 style={{ fontFamily: ff.display, fontSize: isMobile ? 42 : "clamp(52px,6.2vw,92px)", fontWeight: 500, color: C.t1, letterSpacing: "-0.04em", lineHeight: 0.9, marginBottom: 20 }}>
              Pricing that doesn't<br /><span style={{ fontStyle: "italic", fontWeight: 300, color: C.amber500 }}>punish you for hiring.</span>
            </h2>
            <p style={{ fontFamily: ff.body, fontSize: isMobile ? 16 : 18, color: C.t2, maxWidth: 620, margin: isMobile ? "0" : "0 auto", lineHeight: 1.5 }}>
              Pay per location. Not per person. Add your tenth employee — the bill stays the same.
            </p>
          </div>

          {/* Location calculator + annual toggle */}
          <div data-rv="pr-calc" className={"rv " + (shown("pr-calc") ? "vis" : "")} style={{ display: "flex", gap: isMobile ? 16 : 28, justifyContent: "center", alignItems: "center", marginBottom: 48, flexWrap: "wrap" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 16px", background: "#fff", border: "1px solid " + C.border, borderRadius: 3 }}>
              <span style={{ fontFamily: ff.mono, fontSize: 10, color: C.t3, letterSpacing: 1.8, fontWeight: 600, textTransform: "uppercase" }}>Locations</span>
              <div style={{ display: "flex", gap: 4 }}>
                {[1, 2, 3, 4].map(n => (
                  <button key={n} onClick={() => setLocCount(n)} style={{
                    width: 36, height: 36, border: "none", borderRadius: 2,
                    background: locCount === n ? C.ink : C.ocean100,
                    color: locCount === n ? C.amber400 : C.t2,
                    fontFamily: ff.mono, fontSize: 13, fontWeight: 700, cursor: "pointer",
                    transition: "all .15s",
                  }}>{n === 4 ? "4+" : n}</button>
                ))}
              </div>
            </div>

            {/* Physical-feeling annual switch */}
            <button onClick={() => setAnnual(!annual)} style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 14px", background: "#fff", border: "1px solid " + C.border, borderRadius: 3, cursor: "pointer", fontFamily: ff.mono, fontSize: 11, color: C.t2, letterSpacing: 1.5, fontWeight: 600, textTransform: "uppercase" }}>
              <span style={{ color: !annual ? C.t1 : C.t4 }}>MONTHLY</span>
              <span style={{ display: "inline-block", width: 42, height: 22, borderRadius: 3, background: annual ? C.terracotta : C.ocean200, position: "relative", transition: "background .2s" }}>
                <span style={{ position: "absolute", top: 2, left: annual ? 22 : 2, width: 18, height: 18, background: "#fff", borderRadius: 2, boxShadow: "0 2px 4px rgba(0,0,0,0.2)", transition: "left .2s cubic-bezier(.22,1,.36,1)" }} />
              </span>
              <span style={{ color: annual ? C.t1 : C.t4 }}>ANNUAL</span>
              {annual && <span style={{ marginLeft: 4, padding: "2px 6px", background: C.amber500, color: "#fff", fontSize: 9, borderRadius: 2, letterSpacing: 1 }}>SAVE 20%</span>}
            </button>
          </div>

          {/* Pricing row */}
          <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : isTablet ? "1fr 1fr" : "1fr 1.15fr 1fr", gap: isMobile ? 16 : 20, alignItems: isMobile ? "stretch" : "center", maxWidth: 1100, margin: "0 auto" }}>

            {/* STARTER */}
            <div data-rv="pr-s" className={"rv rv-d1 " + (shown("pr-s") ? "vis" : "")} style={{ background: "#fff", border: "1px solid " + C.border, borderRadius: 4, padding: "36px 28px", transform: isMobile ? "none" : "rotate(-0.5deg)" }}>
              <div style={{ fontFamily: ff.mono, fontSize: 10, letterSpacing: 2.2, color: C.t3, marginBottom: 18, fontWeight: 600, textTransform: "uppercase" }}>— Starter</div>
              <div style={{ display: "flex", alignItems: "baseline", marginBottom: 4 }}>
                <span style={{ fontFamily: ff.display, fontSize: 20, fontWeight: 500, color: C.t2 }}>$</span>
                <span className="tn" style={{ fontFamily: ff.display, fontSize: 72, fontWeight: 500, color: C.t1, letterSpacing: "-0.05em", lineHeight: 1 }}>{annual ? Math.round(19 * 0.8) : 19}</span>
                <span style={{ fontFamily: ff.body, fontSize: 14, color: C.t3, marginLeft: 6 }}>/mo · loc</span>
              </div>
              <div className="tn" style={{ fontFamily: ff.mono, fontSize: 10, color: C.t4, letterSpacing: 1.2, marginBottom: 24 }}>
                {annual ? "$" + starterYr + " billed annually" : "$" + starterMo + "/mo for " + locCount + " location" + (locCount > 1 ? "s" : "")}
              </div>
              <div style={{ height: 1, background: C.border, marginBottom: 24 }} />
              <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 11, marginBottom: 28 }}>
                {["Up to 25 employees", "Unlimited schedules", "Time clock + geofence", "Swap requests & approvals", "Email support"].map((f, i) => (
                  <li key={i} style={{ display: "flex", alignItems: "flex-start", gap: 9, fontFamily: ff.body, fontSize: 13.5, color: C.t2, lineHeight: 1.4 }}>
                    <span style={{ color: C.success, flexShrink: 0, marginTop: 2 }}>{SVG.check(13, C.success)}</span>{f}
                  </li>
                ))}
              </ul>
              <a href="/final" style={{ display: "block", textAlign: "center", padding: "13px", borderRadius: 3, border: "1.5px solid " + C.ink, color: C.t1, fontFamily: ff.body, fontWeight: 700, fontSize: 14, transition: "background .15s,color .15s" }} onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = C.ink; (e.currentTarget as HTMLElement).style.color = "#fff"; }} onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = "transparent"; (e.currentTarget as HTMLElement).style.color = C.t1; }}>Start Starter →</a>
            </div>

            {/* PRO — leans forward */}
            <div data-rv="pr-p" className={"rv rv-d2 " + (shown("pr-p") ? "vis" : "")} style={{ background: C.ink, color: "#fff", borderRadius: 4, padding: isMobile ? "36px 28px" : "44px 32px", position: "relative", transform: isMobile ? "none" : "translateY(-12px) rotate(0.4deg)", boxShadow: "0 40px 80px -20px rgba(12,18,32,0.45), 0 0 0 1px " + C.amber500, zIndex: 2 }}>
              <div style={{ position: "absolute", top: -14, right: 24 }}>
                <span className="tape" style={{ transform: "rotate(5deg)" }}>MOST POPULAR</span>
              </div>
              <div style={{ fontFamily: ff.mono, fontSize: 10, letterSpacing: 2.2, color: C.amber400, marginBottom: 18, fontWeight: 600, textTransform: "uppercase" }}>— Pro</div>
              <div style={{ display: "flex", alignItems: "baseline", marginBottom: 4 }}>
                <span style={{ fontFamily: ff.display, fontSize: 22, fontWeight: 500, color: "#fff" }}>$</span>
                <span className="tn" style={{ fontFamily: ff.display, fontSize: 92, fontWeight: 500, color: "#fff", letterSpacing: "-0.055em", lineHeight: 1 }}>{annual ? Math.round(49 * 0.8) : 49}</span>
                <span style={{ fontFamily: ff.body, fontSize: 14, color: "rgba(255,255,255,0.7)", marginLeft: 6 }}>/mo · loc</span>
              </div>
              <div className="tn" style={{ fontFamily: ff.mono, fontSize: 10, color: C.amber400, letterSpacing: 1.2, marginBottom: 24 }}>
                {annual ? "$" + proYr + " billed annually" : "$" + proMo + "/mo for " + locCount + " location" + (locCount > 1 ? "s" : "")}
              </div>
              <div style={{ height: 1, background: "rgba(255,255,255,0.12)", marginBottom: 24 }} />
              <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 11, marginBottom: 28 }}>
                {["Unlimited employees", "Unlimited locations", "Payroll CSV export", "Advanced roles & permissions", "Shift-scoped team chat", "Priority support"].map((f, i) => (
                  <li key={i} style={{ display: "flex", alignItems: "flex-start", gap: 9, fontFamily: ff.body, fontSize: 14, color: "rgba(255,255,255,0.9)", lineHeight: 1.4 }}>
                    <span style={{ color: C.amber400, flexShrink: 0, marginTop: 2 }}>{SVG.check(13, C.amber400)}</span>{f}
                  </li>
                ))}
              </ul>
              <a href="/final" style={{ display: "block", textAlign: "center", padding: "15px", borderRadius: 3, background: C.amber500, color: "#fff", fontFamily: ff.body, fontWeight: 700, fontSize: 14.5, boxShadow: "0 4px 0 " + C.amber700, transition: "transform .15s" }} onMouseEnter={(e) => (e.currentTarget as HTMLElement).style.transform = "translateY(-2px)"} onMouseLeave={(e) => (e.currentTarget as HTMLElement).style.transform = "none"}>
                Start Pro Trial →
              </a>
            </div>

            {/* ENTERPRISE */}
            <div data-rv="pr-e" className={"rv rv-d3 " + (shown("pr-e") ? "vis" : "")} style={{ background: "#fff", border: "1px solid " + C.border, borderRadius: 4, padding: "36px 28px", transform: isMobile ? "none" : "rotate(0.5deg)" }}>
              <div style={{ fontFamily: ff.mono, fontSize: 10, letterSpacing: 2.2, color: C.t3, marginBottom: 18, fontWeight: 600, textTransform: "uppercase" }}>— Enterprise</div>
              <div style={{ display: "flex", alignItems: "baseline", marginBottom: 4 }}>
                <span style={{ fontFamily: ff.display, fontSize: 46, fontStyle: "italic", fontWeight: 400, color: C.t1, letterSpacing: "-0.04em", lineHeight: 1 }}>Let's talk.</span>
              </div>
              <div style={{ fontFamily: ff.mono, fontSize: 10, color: C.t4, letterSpacing: 1.2, marginBottom: 24 }}>
                5+ locations, custom SLA, SSO
              </div>
              <div style={{ height: 1, background: C.border, marginBottom: 24 }} />
              <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 11, marginBottom: 28 }}>
                {["Everything in Pro", "Dedicated success manager", "SAML SSO / SCIM", "Custom integrations", "Priority infrastructure"].map((f, i) => (
                  <li key={i} style={{ display: "flex", alignItems: "flex-start", gap: 9, fontFamily: ff.body, fontSize: 13.5, color: C.t2, lineHeight: 1.4 }}>
                    <span style={{ color: C.success, flexShrink: 0, marginTop: 2 }}>{SVG.check(13, C.success)}</span>{f}
                  </li>
                ))}
              </ul>
              <a href="mailto:hello@shiftpro.ai?subject=Enterprise" style={{ display: "block", textAlign: "center", padding: "13px", borderRadius: 3, border: "1.5px solid " + C.ink, color: C.t1, fontFamily: ff.body, fontWeight: 700, fontSize: 14, transition: "background .15s,color .15s" }} onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = C.ink; (e.currentTarget as HTMLElement).style.color = "#fff"; }} onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = "transparent"; (e.currentTarget as HTMLElement).style.color = C.t1; }}>Contact Sales →</a>
            </div>
          </div>

        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          ANTI-COMPARISON — "What ShiftPro isn't"
          opinionated, reverses the defensive trope
          ═══════════════════════════════════════════════════════════ */}
      <section style={{ padding: isMobile ? "88px 20px" : "140px 28px", background: C.parchment, borderTop: "1px solid " + C.parchmentOn, borderBottom: "1px solid " + C.parchmentOn, position: "relative" }} className="grain-overlay">
        <div style={{ maxWidth: 1100, margin: "0 auto", position: "relative", zIndex: 2 }}>
          <div data-rv="anti-h" className={"rv " + (shown("anti-h") ? "vis" : "")} style={{ marginBottom: isMobile ? 44 : 68 }}>
            <h2 style={{ fontFamily: ff.display, fontSize: isMobile ? 44 : "clamp(60px,7vw,108px)", fontWeight: 500, color: C.t1, letterSpacing: "-0.045em", lineHeight: 0.88 }}>
              What ShiftPro<br /><span style={{ fontStyle: "italic", fontWeight: 300, color: C.terracotta }}>isn't.</span>
            </h2>
            <p style={{ fontFamily: ff.body, fontSize: isMobile ? 16 : 18, color: C.t2, maxWidth: 580, marginTop: 20, lineHeight: 1.5 }}>
              Honest about the boundaries. Knowing what a tool <em>isn't</em> is as useful as knowing what it is.
            </p>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
            {[
              { not: "an iPad POS.",              then: "We don't take your orders. Keep Square, Toast, or your register — we live next to it." },
              { not: "HR software.",              then: "We don't run 401(k)s, health insurance, or your handbook. That's not our ball game." },
              { not: "a payroll processor.",      then: "We spit out a clean CSV. You hand it to Gusto, QuickBooks, or your bookkeeper." },
              { not: "for 500-person enterprises.", then: "If you have a compliance department, we're probably too small for you. Honestly." },
              { not: "trying to be Slack.",       then: "Team messaging is scoped to the schedule — when Carlos leaves a shift, he leaves that thread." },
            ].map((row, i) => (
              <div key={i} data-rv={"anti-" + i} className={"rv rv-d" + ((i % 3) + 1) + " " + (shown("anti-" + i) ? "vis" : "")} style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "0.9fr 1.1fr", gap: isMobile ? 8 : 40, padding: isMobile ? "28px 0" : "36px 0", borderTop: "1px solid " + C.parchmentOn }}>
                <div style={{ fontFamily: ff.display, fontSize: isMobile ? 28 : 42, fontWeight: 500, color: C.t1, letterSpacing: "-0.03em", lineHeight: 1.05 }}>
                  <span style={{ fontFamily: ff.mono, fontSize: isMobile ? 14 : 18, fontWeight: 600, color: C.terracotta, marginRight: 14, verticalAlign: "middle" }}>{SVG.x(isMobile ? 16 : 22, C.terracotta)}</span>
                  It isn't<br /><span style={{ fontStyle: "italic", fontWeight: 300, color: C.terracotta }}>{row.not}</span>
                </div>
                <div style={{ fontFamily: ff.body, fontSize: isMobile ? 15 : 16, color: C.t2, lineHeight: 1.6, paddingTop: isMobile ? 6 : 12 }}>
                  {row.then}
                </div>
              </div>
            ))}
          </div>

          <div data-rv="anti-closer" className={"rv " + (shown("anti-closer") ? "vis" : "")} style={{ marginTop: 56, padding: isMobile ? "32px 28px" : "48px 56px", background: C.ink, color: "#fff", borderRadius: 4, position: "relative", overflow: "hidden" }}>
            <div style={{ fontFamily: ff.display, fontSize: isMobile ? 26 : 40, fontWeight: 400, letterSpacing: "-0.025em", lineHeight: 1.2 }}>
              The best damn shift schedule<br /><span style={{ fontStyle: "italic", fontWeight: 300, color: C.amber400 }}>for a small operator.</span>
            </div>
            <div style={{ fontFamily: ff.body, fontSize: 14, color: "rgba(255,255,255,0.7)", marginTop: 14 }}>That's the whole pitch.</div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          FAQ — magazine Q&A, NOT accordions
          ═══════════════════════════════════════════════════════════ */}
      <section id="faq" style={{ padding: isMobile ? "88px 20px" : "140px 28px", background: C.ocean100 }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <div data-rv="faq-h" className={"rv " + (shown("faq-h") ? "vis" : "")} style={{ marginBottom: isMobile ? 44 : 72 }}>
            <h2 style={{ fontFamily: ff.display, fontSize: isMobile ? 44 : "clamp(56px,6.4vw,92px)", fontWeight: 500, color: C.t1, letterSpacing: "-0.04em", lineHeight: 0.9 }}>
              Q&amp;A
            </h2>
          </div>

          <div style={{ display: "flex", flexDirection: "column" }}>
            {[
              { q: "Do my employees need to download an app?",
                a: "No. ShiftPro is a progressive web app — your team opens shiftpro.ai on their phone, taps 'Add to Home Screen,' and it behaves like a native app. No App Store wait. No push updates to chase." },
              { q: "How long does setup actually take?",
                a: "Under five minutes. Create an account. Add a location. Invite the team by email. Most owners have their first schedule published the same afternoon they signed up." },
              { q: "What happens after the seven-day trial?",
                a: "You pick a plan. If you don't, the account goes read-only — you never lose your data and you never get auto-charged without a card on file." },
              { q: "Can I cancel anytime?",
                a: "Yes. One click in settings. No contracts. No exit fees. Your access continues through the end of the billing period you already paid for." },
              { q: "Is my data safe?",
                a: "Yes. TLS in transit, AES-256 at rest, Row-Level Security on every database table. We take this seriously because our own businesses' data lives on the same infrastructure." },
              { q: "Does it integrate with QuickBooks?",
                a: "Direct integration ships Q2 2026 on Pro and Enterprise. Until then, payroll exports as a CSV that drops straight into QBO, Gusto, or any spreadsheet." },
              { q: "Why is time tracking included when competitors charge extra?",
                a: "Because scheduling without time tracking is half a product. We refuse to nickel-and-dime you for features that should've been in the box." },
              { q: "What if I run multiple locations?",
                a: "Pro plan includes unlimited locations. Switch between them with one tap. Each gets its own staff, schedule, and geofence — but reporting rolls up." },
            ].map((item, i) => (
              <div key={i} data-rv={"faq-" + i} className={"rv rv-d" + ((i % 3) + 1) + " " + (shown("faq-" + i) ? "vis" : "")} style={{ padding: isMobile ? "28px 0" : "36px 0", borderTop: "1px solid " + C.border }}>
                <div>
                  <div style={{ fontFamily: ff.display, fontSize: isMobile ? 20 : 26, fontStyle: "italic", fontWeight: 400, color: C.t1, letterSpacing: "-0.02em", lineHeight: 1.25, marginBottom: 12 }}>
                    {item.q}
                  </div>
                  <div style={{ fontFamily: ff.body, fontSize: isMobile ? 15 : 15.5, color: C.t2, lineHeight: 1.7, maxWidth: 720 }}>
                    {item.a}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          FINAL CTA — ink-heavy, no rainbow gradients
          ═══════════════════════════════════════════════════════════ */}
      <section data-rv="cta" style={{ padding: isMobile ? "80px 20px" : "140px 28px", background: C.ocean100 }}>
        <div data-rv="cta-c" className={"rv " + (shown("cta-c") ? "vis" : "")} style={{ maxWidth: 980, margin: "0 auto", padding: isMobile ? "52px 28px" : "80px 68px", background: C.ink, color: "#fff", borderRadius: 4, position: "relative", overflow: "hidden" }}>
          {/* Paper-torn top edge via clip-path-ish SVG */}
          <svg aria-hidden style={{ position: "absolute", top: 0, left: 0, right: 0, height: 12, width: "100%" }} viewBox="0 0 1000 12" preserveAspectRatio="none">
            <path d="M0 0 L 0 12 L 20 4 L 55 10 L 90 3 L 130 9 L 170 5 L 210 11 L 260 4 L 310 10 L 370 5 L 430 11 L 490 4 L 560 9 L 630 5 L 700 10 L 780 4 L 860 9 L 940 5 L 1000 11 L 1000 0 Z" fill={C.amber500} />
          </svg>

          <div style={{ fontFamily: ff.mono, fontSize: 10, color: C.amber400, letterSpacing: 3, marginBottom: 20, fontWeight: 600 }}>— THE NEXT SHIFT</div>
          <h2 style={{ fontFamily: ff.display, fontSize: isMobile ? 40 : "clamp(52px,6.4vw,92px)", fontWeight: 500, color: "#fff", letterSpacing: "-0.04em", lineHeight: 0.9, marginBottom: 24 }}>
            Stop scheduling<br /><span style={{ fontStyle: "italic", fontWeight: 300, color: C.amber400 }}>at 1 a.m.</span>
          </h2>
          <p style={{ fontFamily: ff.body, color: "rgba(255,255,255,0.8)", fontSize: isMobile ? 15 : 17, marginBottom: 36, fontWeight: 400, maxWidth: 520, lineHeight: 1.55 }}>
            Seven days free. No card. Your data, always yours.<br />
            First schedule published in under five minutes — or we'll extend the trial.
          </p>

          <form onSubmit={(e) => { e.preventDefault(); window.location.href = "/final?email=" + encodeURIComponent(trialEmail); }} style={{ display: "flex", gap: 10, maxWidth: 520, flexWrap: "wrap", marginBottom: 18 }}>
            <input type="email" value={trialEmail} onChange={(e) => setTrialEmail(e.target.value)} placeholder="you@business.com" required
              style={{ flex: 1, minWidth: 220, padding: "16px 18px", borderRadius: 3, border: "1px solid rgba(255,255,255,0.2)", background: "rgba(255,255,255,0.06)", color: "#fff", fontFamily: ff.body, fontSize: 14.5, outline: "none", fontWeight: 500 }}
              onFocus={(e) => { e.currentTarget.style.borderColor = C.amber400; e.currentTarget.style.background = "rgba(255,255,255,0.12)"; }}
              onBlur={(e) => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.2)"; e.currentTarget.style.background = "rgba(255,255,255,0.06)"; }} />
            <button type="submit" style={{ padding: "16px 28px", borderRadius: 3, background: C.amber500, color: "#fff", fontFamily: ff.body, fontWeight: 700, fontSize: 14.5, border: "none", boxShadow: "0 4px 0 " + C.amber700, whiteSpace: "nowrap", cursor: "pointer", letterSpacing: "-0.005em", transition: "transform .15s" }} onMouseEnter={(e) => (e.currentTarget as HTMLElement).style.transform = "translateY(-2px)"} onMouseLeave={(e) => (e.currentTarget as HTMLElement).style.transform = "none"}>
              Start free →
            </button>
          </form>

          <div style={{ fontFamily: ff.mono, fontSize: 10, color: "rgba(255,255,255,0.55)", letterSpacing: 1.8, fontWeight: 500, textTransform: "uppercase" }}>
            No card · cancel in two taps · keep your data forever
          </div>

          <div style={{ marginTop: 32, paddingTop: 22, borderTop: "1px solid rgba(255,255,255,0.08)", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 14 }}>
            <button onClick={() => openLogin("owner")} className="ink-link" style={{ padding: 0, background: "none", border: "none", color: "rgba(255,255,255,0.75)", fontFamily: ff.body, fontWeight: 500, fontSize: 13, cursor: "pointer" }}>
              Already have an account? Sign in →
            </button>
            <span className="tn" style={{ fontFamily: ff.mono, fontSize: 10, color: "rgba(255,255,255,0.4)", letterSpacing: 1.5 }}>
              BEND, OR · {ptNow} PT
            </span>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          FOOTER — dark-ink editorial closer with real details
          ═══════════════════════════════════════════════════════════ */}
      <footer style={{ padding: isMobile ? "56px 20px 32px" : "72px 28px 40px", background: C.indigoDeep, color: "rgba(255,255,255,0.72)" }}>
        <div style={{ maxWidth: 1280, margin: "0 auto" }}>
          <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1.8fr 1fr 1fr 1fr", gap: isMobile ? 40 : 48, marginBottom: 56 }}>

            {/* Wordmark + address */}
            <div>
              <div className="swirl-wrap" style={{ display: "inline-flex", alignItems: "center", gap: 12, marginBottom: 20, position: "relative" }}>
                <SwirlMark size={38} />
                <div style={{ display: "flex", flexDirection: "column", lineHeight: 1 }}>
                  <span style={{ fontFamily: ff.display, fontWeight: 700, fontSize: 22, color: "#f5f0e6", letterSpacing: "-0.03em" }}>ShiftPro<span style={{ color: C.amber400, fontStyle: "italic", fontWeight: 400 }}>.ai</span></span>
                  <span style={{ fontFamily: ff.mono, fontSize: 9, color: C.amber400, letterSpacing: 2.5, marginTop: 4, fontWeight: 500 }}>EST. 2026</span>
                </div>
              </div>
              <div style={{ fontFamily: ff.display, fontSize: 18, fontStyle: "italic", fontWeight: 300, color: "rgba(255,255,255,0.85)", lineHeight: 1.4, marginBottom: 16, maxWidth: 360 }}>
                "Built by someone who's worked a Friday close."
              </div>
              <div style={{ fontFamily: ff.mono, fontSize: 10, color: "rgba(255,255,255,0.5)", letterSpacing: 1.8, lineHeight: 1.8, fontWeight: 500 }}>
                SHIFTPRO AI, INC.<br />
                HELLO@SHIFTPRO.AI
              </div>
            </div>

            {[
              { title: "Product", items: [["Tour", "#tour"], ["Pricing", "#pricing"], ["Story", "#story"], ["Start free", "/final"]] },
              { title: "Legal",   items: [["Terms", "/terms"], ["Privacy", "/privacy"], ["Contact", "mailto:hello@shiftpro.ai"]] },
              { title: "Account", items: [] },
            ].map(col => (
              <div key={col.title}>
                <div style={{ fontFamily: ff.mono, fontSize: 10, letterSpacing: 2.5, color: "rgba(255,255,255,0.45)", marginBottom: 20, fontWeight: 600, textTransform: "uppercase" }}>{col.title}</div>
                {col.title === "Account" ? (
                  <>
                    <button onClick={() => openLogin("owner")} className="ink-link" style={{ display: "block", padding: 0, background: "none", border: "none", fontFamily: ff.body, fontSize: 14, color: "rgba(255,255,255,0.78)", marginBottom: 12, textAlign: "left", cursor: "pointer" }}>Owner Sign In</button>
                    <button onClick={() => openLogin("employee")} className="ink-link" style={{ display: "block", padding: 0, background: "none", border: "none", fontFamily: ff.body, fontSize: 14, color: "rgba(255,255,255,0.78)", marginBottom: 12, textAlign: "left", cursor: "pointer" }}>Employee Sign In</button>
                    <a href="/final" className="ink-link" style={{ display: "block", fontFamily: ff.body, fontSize: 14, color: C.amber400, fontWeight: 700 }}>Create account →</a>
                  </>
                ) : (
                  col.items.map(([l, h]) => (
                    <a key={l} href={h} className="ink-link" style={{ display: "block", fontFamily: ff.body, fontSize: 14, color: "rgba(255,255,255,0.78)", marginBottom: 12 }}>{l}</a>
                  ))
                )}
              </div>
            ))}
          </div>

          {/* Hand-drawn divider */}
          <div style={{ display: "flex", justifyContent: "center", marginBottom: 24 }}>
            <Squiggle w={220} color="rgba(245,166,35,0.4)" strokeW={1.6} />
          </div>

          <div style={{ paddingTop: 22, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 14 }}>
            <span className="tn" style={{ fontFamily: ff.mono, fontSize: 10, color: "rgba(255,255,255,0.4)", letterSpacing: 1.8, textTransform: "uppercase", fontWeight: 500 }}>
              © 2026 ShiftPro AI, Inc. · Built for real operators
            </span>
            <span style={{ fontFamily: ff.display, fontSize: 14, fontStyle: "italic", color: "rgba(255,255,255,0.55)" }}>
              — The ShiftPro Team
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// TOUR MOCKUP COMPONENTS — real-looking data, editorial mockups
// ═══════════════════════════════════════════════════════════════
function TourScheduleMock() {
  return (
    <div style={{ fontFamily: ff.body }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 12 }}>
        <div style={{ fontFamily: ff.display, fontSize: 16, fontWeight: 600, color: C.t1 }}>Week of Jun 16 · The Parlor</div>
        <div style={{ fontFamily: ff.mono, fontSize: 9, color: C.success, letterSpacing: 1.2, fontWeight: 600 }}>◉ PUBLISHED</div>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "60px repeat(7, 1fr)", gap: 3, marginBottom: 6 }}>
        <div />
        {["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"].map(d => (
          <div key={d} style={{ fontFamily: ff.mono, fontSize: 8, color: C.t3, letterSpacing: 1.3, textAlign: "center", fontWeight: 600 }}>{d}</div>
        ))}
      </div>
      {[
        { n: "Jake M.",   c: [1, 1, 0, 1, 1, 1, 0], col: C.amber500 },
        { n: "Sarah C.",  c: [0, 1, 1, 1, 1, 1, 1], col: C.terracotta },
        { n: "Priya P.",  c: [1, 0, 1, 0, 1, 1, 0], col: C.sky500 },
        { n: "Carlos M.", c: [1, 1, 1, 1, 0, 0, 1], col: C.success },
        { n: "Anya Cole", c: [0, 0, 1, 1, 1, 1, 1], col: C.sage },
        { n: "Luis T.",   c: [1, 1, 0, 0, 1, 1, 1], col: C.rose500 },
      ].map((row, i) => (
        <div key={row.n} style={{ display: "grid", gridTemplateColumns: "60px repeat(7, 1fr)", gap: 3, marginBottom: 3 }}>
          <div style={{ fontSize: 10, fontWeight: 600, color: C.t1, alignSelf: "center" }}>{row.n}</div>
          {row.c.map((on, j) => (
            <div key={j} className="sch-cell" style={{
              height: 18,
              borderRadius: 2,
              background: on ? row.col + "dd" : "transparent",
              border: on ? "none" : "1px dashed " + C.ocean200,
            }} />
          ))}
        </div>
      ))}
    </div>
  );
}

function TourClockMock({ ptNow }: { ptNow: string }) {
  return (
    <div style={{ fontFamily: ff.body }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 16 }}>
        <div style={{ fontFamily: ff.display, fontSize: 16, fontWeight: 600, color: C.t1 }}>Clocked in right now</div>
        <div className="tn" style={{ fontFamily: ff.mono, fontSize: 10, color: C.t3, fontWeight: 600, letterSpacing: 0.8 }}>{ptNow} PT</div>
      </div>
      {[
        { n: "Marcus Rivera",  r: "The Parlor · Bar",           since: "11:02 AM", hrs: "4h 12m", col: C.success },
        { n: "Leila Santos",   r: "Common Ground · Counter",    since: "6:15 AM",  hrs: "9h 00m", col: C.amber500 },
        { n: "Nia Okafor",     r: "Capital City Tours · Deck",  since: "7:30 AM",  hrs: "7h 45m", col: C.sky500 },
        { n: "Devin Cole",     r: "The Parlor · Host",          since: "2:00 PM",  hrs: "1h 14m", col: C.terracotta },
      ].map((p, i) => (
        <div key={p.n} style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 12px", background: "#fff", border: "1px solid " + C.border, borderRadius: 3, marginBottom: 6 }}>
          <span style={{ width: 8, height: 8, borderRadius: "50%", background: p.col, boxShadow: "0 0 0 3px " + p.col + "25", flexShrink: 0 }} />
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 12, fontWeight: 600, color: C.t1 }}>{p.n}</div>
            <div style={{ fontFamily: ff.mono, fontSize: 9.5, color: C.t3, letterSpacing: 0.4 }}>{p.r}</div>
          </div>
          <div style={{ textAlign: "right" }}>
            <div className="tn" style={{ fontFamily: ff.mono, fontSize: 11, color: C.t1, fontWeight: 600 }}>{p.hrs}</div>
            <div className="tn" style={{ fontFamily: ff.mono, fontSize: 9, color: C.t3 }}>since {p.since}</div>
          </div>
        </div>
      ))}
    </div>
  );
}

function TourSwapMock() {
  return (
    <div style={{ fontFamily: ff.body }}>
      <div style={{ fontFamily: ff.display, fontSize: 16, fontWeight: 600, color: C.t1, marginBottom: 16 }}>Swap Inbox · 2 pending</div>

      {[
        { from: "Leila Santos", shift: "Sat Jun 21 · 5pm–close · The Parlor",   taker: "Marcus R.", status: "pending" },
        { from: "Nia Okafor",   shift: "Sun Jun 22 · 8am–2pm · Common Ground", taker: "Devin C.",  status: "approve" },
      ].map((s, i) => (
        <div key={i} style={{ padding: 14, background: "#fff", border: "1px solid " + C.border, borderRadius: 3, marginBottom: 10 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 6 }}>
            <div style={{ fontSize: 12, fontWeight: 600, color: C.t1 }}>{s.from}</div>
            <div style={{ fontFamily: ff.mono, fontSize: 8.5, color: C.t3, letterSpacing: 1, textTransform: "uppercase" }}>REQ · {i === 0 ? "14 MIN AGO" : "01 HR AGO"}</div>
          </div>
          <div style={{ fontFamily: ff.mono, fontSize: 10, color: C.t2, marginBottom: 10 }}>{s.shift}</div>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
            <span style={{ fontSize: 11, color: C.t2 }}>{s.from}</span>
            <span style={{ color: C.t4 }}>{SVG.arrowRight(12)}</span>
            <span style={{ fontSize: 11, color: C.t1, fontWeight: 600 }}>{s.taker}</span>
            <span style={{ fontFamily: ff.mono, fontSize: 9, color: C.success, marginLeft: 4, letterSpacing: 1 }}>✓ OVERLAP CHECKED</span>
          </div>
          <div style={{ display: "flex", gap: 6 }}>
            <button style={{ flex: 1, padding: "8px", background: s.status === "approve" ? C.success : C.ink, color: "#fff", border: "none", borderRadius: 2, fontSize: 11, fontWeight: 700, cursor: "pointer", fontFamily: ff.body }}>Approve</button>
            <button style={{ padding: "8px 14px", background: "transparent", color: C.t2, border: "1px solid " + C.border, borderRadius: 2, fontSize: 11, fontWeight: 600, cursor: "pointer", fontFamily: ff.body }}>Decline</button>
          </div>
        </div>
      ))}
    </div>
  );
}

function TourPayrollMock() {
  return (
    <div style={{ fontFamily: ff.body }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 16 }}>
        <div style={{ fontFamily: ff.display, fontSize: 16, fontWeight: 600, color: C.t1 }}>Payroll · Week Jun 9–15</div>
        <button style={{ padding: "6px 12px", background: C.ink, color: "#fff", border: "none", borderRadius: 2, fontSize: 10, fontWeight: 700, cursor: "pointer", fontFamily: ff.mono, letterSpacing: 1.5 }}>EXPORT CSV ↓</button>
      </div>
      <div style={{ background: "#fff", border: "1px solid " + C.border, borderRadius: 3, overflow: "hidden" }}>
        <div style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr 1fr 1fr", padding: "10px 14px", background: C.ocean50, fontFamily: ff.mono, fontSize: 9, color: C.t3, letterSpacing: 1.4, fontWeight: 600 }}>
          <div>EMPLOYEE</div><div>HOURS</div><div>OT</div><div>TOTAL</div>
        </div>
        {[
          ["Jake Mendoza", "32.5", "0.0",  "$487.50"],
          ["Sarah Chen",   "38.0", "0.0",  "$570.00"],
          ["Priya Patel",  "41.0", "1.0",  "$660.00"],
          ["Carlos M.",    "28.0", "0.0",  "$392.00"],
          ["Anya Cole",    "19.5", "0.0",  "$273.00"],
        ].map((r, i) => (
          <div key={i} style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr 1fr 1fr", padding: "10px 14px", borderTop: "1px solid " + C.border, fontSize: 11 }}>
            <div style={{ fontWeight: 600, color: C.t1 }}>{r[0]}</div>
            <div className="tn" style={{ fontFamily: ff.mono, color: C.t2 }}>{r[1]}</div>
            <div className="tn" style={{ fontFamily: ff.mono, color: r[2] !== "0.0" ? C.amber600 : C.t4 }}>{r[2]}</div>
            <div className="tn" style={{ fontFamily: ff.mono, color: C.t1, fontWeight: 600 }}>{r[3]}</div>
          </div>
        ))}
        <div style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr 1fr 1fr", padding: "12px 14px", borderTop: "2px solid " + C.ink, background: C.ocean50, fontSize: 12, fontWeight: 700 }}>
          <div>TOTAL</div>
          <div className="tn" style={{ fontFamily: ff.mono }}>159.0</div>
          <div className="tn" style={{ fontFamily: ff.mono, color: C.amber600 }}>1.0</div>
          <div className="tn" style={{ fontFamily: ff.mono, color: C.t1 }}>$2,382.50</div>
        </div>
      </div>
    </div>
  );
}

function TourChatMock() {
  return (
    <div style={{ fontFamily: ff.body }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 14 }}>
        <div style={{ fontFamily: ff.display, fontSize: 16, fontWeight: 600, color: C.t1 }}>Shift thread · Fri 6/20</div>
        <div style={{ fontFamily: ff.mono, fontSize: 9, color: C.t3, letterSpacing: 1 }}>4 IN THREAD</div>
      </div>
      {[
        { who: "Jordan (Mgr)", msg: "Running a bit heavy on covers tonight — Marcus, can you come in 30 min early?", when: "2:02 PM", self: true, col: C.amber500 },
        { who: "Jake M.",       msg: "Yep, on my way.", when: "2:04 PM", self: false, col: C.sky500 },
        { who: "Sarah C.",      msg: "I can cover the door until Jake's in if that helps.", when: "2:05 PM", self: false, col: C.terracotta },
        { who: "Jordan (Mgr)", msg: "Perfect, thanks team 🙏", when: "2:06 PM", self: true, col: C.amber500 },
      ].map((m, i) => (
        <div key={i} style={{ display: "flex", flexDirection: m.self ? "row-reverse" : "row", gap: 8, marginBottom: 8, alignItems: "flex-start" }}>
          <div style={{ width: 26, height: 26, borderRadius: 3, background: m.col + "22", color: m.col, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, fontWeight: 700, flexShrink: 0 }}>
            {m.who[0]}
          </div>
          <div style={{ maxWidth: "80%", background: m.self ? C.ink : "#fff", color: m.self ? "#fff" : C.t1, padding: "8px 12px", borderRadius: 3, border: m.self ? "none" : "1px solid " + C.border }}>
            <div style={{ fontFamily: ff.mono, fontSize: 8.5, color: m.self ? "rgba(255,255,255,0.6)" : C.t3, letterSpacing: 1, marginBottom: 3, textTransform: "uppercase" }}>{m.who} · {m.when}</div>
            <div style={{ fontSize: 12, lineHeight: 1.4 }}>{m.msg}</div>
          </div>
        </div>
      ))}
      <div style={{ fontFamily: ff.mono, fontSize: 9, color: C.t4, letterSpacing: 1, marginTop: 10, textAlign: "center", paddingTop: 10, borderTop: "1px dashed " + C.border }}>
        ◉ THREAD AUTO-CLOSES WHEN SHIFT ENDS
      </div>
    </div>
  );
}

