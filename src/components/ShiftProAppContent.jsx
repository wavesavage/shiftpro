"use client";

import React, { useState, useEffect } from "react";

const FONTS = `@import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800&family=Outfit:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500&display=swap');`;

// Responsive helper — returns true if screen is mobile width
function useIsMobile(breakpoint=768){
  const [mobile,setMobile] = useState(false);
  useEffect(()=>{
    const check = ()=>setMobile(window.innerWidth<=breakpoint);
    check();
    window.addEventListener("resize",check);
    return()=>window.removeEventListener("resize",check);
  },[breakpoint]);
  return mobile;
}

const GCSS = `
* { box-sizing: border-box; margin: 0; padding: 0; }
body { background: #070b14; }
::-webkit-scrollbar { width: 4px; }
::-webkit-scrollbar-thumb { background: rgba(120,120,180,0.2); border-radius: 2px; }
@keyframes fadeUp { from { opacity:0; transform:translateY(14px) } to { opacity:1; transform:none } }
@keyframes fadeIn { from { opacity:0 } to { opacity:1 } }
@keyframes blink { 0%,100% { opacity:1 } 50% { opacity:0.2 } }
@keyframes glow { 0%,100% { box-shadow:0 0 0 0 rgba(245,158,11,0.4) } 50% { box-shadow:0 0 0 8px rgba(245,158,11,0) } }
@keyframes glowI { 0%,100% { box-shadow:0 0 0 0 rgba(99,102,241,0.4) } 50% { box-shadow:0 0 0 8px rgba(99,102,241,0) } }
`;


// ══════════════════════════════════════════════════
//  SVG LOGO COMPONENTS (inline, infinite resolution)
// ══════════════════════════════════════════════════

// Colored swirl for portal buttons — takes custom color palette
function ButtonSwirl({size=72, c1="#f59e0b", c2="#f97316", c3="#b45309", accent="#fbbf24"}){
  return (
    <svg width={size} height={size} viewBox="0 0 130 130" xmlns="http://www.w3.org/2000/svg" style={{display:"block",overflow:"visible"}}>
      <defs>
        <linearGradient id={`bs_g1_${c1.replace("#","")}`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor={c1}/>
          <stop offset="100%" stopColor={c2}/>
        </linearGradient>
        <linearGradient id={`bs_accent_${accent.replace("#","")}`} x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor={accent}/>
          <stop offset="100%" stopColor={c1}/>
        </linearGradient>
        <filter id={`bs_glow_${c1.replace("#","")}`} x="-30%" y="-30%" width="160%" height="160%">
          <feGaussianBlur stdDeviation="3" result="blur"/>
          <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
        </filter>
      </defs>
      <g transform="translate(65,65)">
        <circle cx="0" cy="0" r="57" fill="none" stroke={c1} strokeWidth="5" opacity="0.15"/>
        <path d="M -50 14 A 53 53 0 0 1 18 -50 L 11 -33 A 36 36 0 0 0 -33 9 Z"
          fill={`url(#bs_g1_${c1.replace("#","")})`} opacity="0.95"
          filter={`url(#bs_glow_${c1.replace("#","")})`}/>
        <path d="M 18 -50 A 53 53 0 0 1 50 16 L 33 11 A 36 36 0 0 0 13 -33 Z"
          fill={c2} opacity="0.85"/>
        <path d="M 50 16 A 53 53 0 0 1 -50 14 L -33 9 A 36 36 0 0 0 33 11 Z"
          fill={c3} opacity="0.8"/>
        <path d="M -27 -48 A 55 55 0 0 1 48 -26 L 40 -17 A 44 44 0 0 0 -20 -38 Z"
          fill={`url(#bs_accent_${accent.replace("#","")})`} opacity="1"
          filter={`url(#bs_glow_${c1.replace("#","")})`}/>
        <circle cx="0" cy="0" r="20" fill={c1} opacity="0.1"/>
        <circle cx="0" cy="0" r="20" fill="none" stroke={c1} strokeWidth="1.5" opacity="0.5"/>
        <circle cx="0" cy="0" r="9.5" fill={`url(#bs_g1_${c1.replace("#","")})`}
          filter={`url(#bs_glow_${c1.replace("#","")})`}/>
        <circle cx="0" cy="0" r="4.5" fill="#fff" opacity="0.95"/>
        <circle cx="0" cy="0" r="2.2" fill={c1}/>
        <circle cx="0" cy="-57" r="2.5" fill={c1} opacity="0.6"/>
        <circle cx="49.4" cy="-28.5" r="2" fill={accent} opacity="0.7"/>
        <circle cx="49.4" cy="28.5" r="1.5" fill={c2} opacity="0.5"/>
      </g>
    </svg>
  );
}

// The swirl mark icon — used in nav bars
function SwirlMark({size=40}){
  const s = size / 130;
  return (
    <svg width={size} height={size} viewBox="0 0 130 130" xmlns="http://www.w3.org/2000/svg" style={{flexShrink:0,overflow:"visible"}}>
      <defs>
        <linearGradient id="sm_g1" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#00d4ff"/>
          <stop offset="100%" stopColor="#0066cc"/>
        </linearGradient>
        <linearGradient id="sm_g2" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#f59e0b"/>
          <stop offset="100%" stopColor="#fbbf24"/>
        </linearGradient>
        <linearGradient id="sm_g3" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#38bdf8"/>
          <stop offset="100%" stopColor="#0ea5e9"/>
        </linearGradient>
        <filter id="sm_glow">
          <feGaussianBlur stdDeviation="2.5" result="blur"/>
          <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
        </filter>
      </defs>
      <g transform="translate(65,65)">
        <circle cx="0" cy="0" r="57" fill="none" stroke="rgba(0,212,255,0.12)" strokeWidth="7"/>
        <path d="M -50 14 A 53 53 0 0 1 18 -50 L 11 -33 A 36 36 0 0 0 -33 9 Z" fill="url(#sm_g1)" opacity="0.95" filter="url(#sm_glow)"/>
        <path d="M 18 -50 A 53 53 0 0 1 50 16 L 33 11 A 36 36 0 0 0 13 -33 Z" fill="#1e7fd4" opacity="0.9"/>
        <path d="M 50 16 A 53 53 0 0 1 -50 14 L -33 9 A 36 36 0 0 0 33 11 Z" fill="#0c4fa0" opacity="0.85"/>
        <path d="M -27 -48 A 55 55 0 0 1 48 -26 L 40 -17 A 44 44 0 0 0 -20 -38 Z" fill="url(#sm_g2)" opacity="1" filter="url(#sm_glow)"/>
        <circle cx="0" cy="0" r="20" fill="rgba(14,165,233,0.12)"/>
        <circle cx="0" cy="0" r="20" fill="none" stroke="url(#sm_g3)" strokeWidth="1.5" opacity="0.65"/>
        <circle cx="0" cy="0" r="9.5" fill="url(#sm_g1)" filter="url(#sm_glow)"/>
        <circle cx="0" cy="0" r="4.5" fill="#fff" opacity="0.92"/>
        <circle cx="0" cy="0" r="2.2" fill="#00d4ff"/>
        <circle cx="0" cy="-57" r="2.5" fill="rgba(0,212,255,0.5)"/>
        <circle cx="49.4" cy="-28.5" r="2" fill="rgba(245,158,11,0.6)"/>
        <circle cx="49.4" cy="28.5" r="1.5" fill="rgba(0,102,204,0.4)"/>
      </g>
    </svg>
  );
}

// Full horizontal logo for the login/landing hero - BIG impact
function LogoHero(){
  return (
    <svg viewBox="0 0 520 160" xmlns="http://www.w3.org/2000/svg" style={{width:"100%",maxWidth:520,display:"block"}}>
      <defs>
        <linearGradient id="hero_g1" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#00d4ff"/>
          <stop offset="100%" stopColor="#0066cc"/>
        </linearGradient>
        <linearGradient id="hero_g2" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#f59e0b"/>
          <stop offset="100%" stopColor="#fbbf24"/>
        </linearGradient>
        <linearGradient id="hero_g3" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#38bdf8"/>
          <stop offset="100%" stopColor="#0ea5e9"/>
        </linearGradient>
        <filter id="hero_glow" x="-25%" y="-25%" width="150%" height="150%">
          <feGaussianBlur stdDeviation="3.5" result="blur"/>
          <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
        </filter>
        <filter id="hero_textglow" x="-10%" y="-10%" width="120%" height="120%">
          <feGaussianBlur stdDeviation="4" result="blur"/>
          <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
        </filter>
      </defs>
      {/* Swirl mark */}
      <g transform="translate(80,80)">
        <circle cx="0" cy="0" r="64" fill="none" stroke="rgba(0,212,255,0.1)" strokeWidth="8"/>
        <path d="M -57 16 A 60 60 0 0 1 21 -57 L 13 -38 A 41 41 0 0 0 -38 11 Z" fill="url(#hero_g1)" opacity="0.95" filter="url(#hero_glow)"/>
        <path d="M 21 -57 A 60 60 0 0 1 57 19 L 38 13 A 41 41 0 0 0 14 -38 Z" fill="#1e7fd4" opacity="0.9"/>
        <path d="M 57 19 A 60 60 0 0 1 -57 16 L -38 11 A 41 41 0 0 0 38 13 Z" fill="#0c4fa0" opacity="0.85"/>
        <path d="M -31 -55 A 62 62 0 0 1 54 -30 L 46 -20 A 50 50 0 0 0 -23 -44 Z" fill="url(#hero_g2)" opacity="1" filter="url(#hero_glow)"/>
        <circle cx="0" cy="0" r="23" fill="rgba(14,165,233,0.1)"/>
        <circle cx="0" cy="0" r="23" fill="none" stroke="url(#hero_g3)" strokeWidth="1.8" opacity="0.65"/>
        <circle cx="0" cy="0" r="11" fill="url(#hero_g1)" filter="url(#hero_glow)"/>
        <circle cx="0" cy="0" r="5.5" fill="#fff" opacity="0.92"/>
        <circle cx="0" cy="0" r="2.8" fill="#00d4ff"/>
        <circle cx="0" cy="-64" r="3" fill="rgba(0,212,255,0.5)"/>
        <circle cx="55.4" cy="-32" r="2.5" fill="rgba(245,158,11,0.65)"/>
        <circle cx="55.4" cy="32" r="2" fill="rgba(0,102,204,0.4)"/>
      </g>
      {/* Wordmark */}
      <text x="165" y="75" fontFamily="'Outfit','Segoe UI',Arial,sans-serif" fontWeight="800" fontSize="66" fill="#ffffff" letterSpacing="-2">Shift</text>
      <text x="302" y="75" fontFamily="'Outfit','Segoe UI',Arial,sans-serif" fontWeight="300" fontSize="66" fill="#ffffff" letterSpacing="-2">Pro</text>
      <text x="395" y="75" fontFamily="'Outfit','Segoe UI',Arial,sans-serif" fontWeight="400" fontSize="66" fill="#00d4ff" fontStyle="italic">.ai</text>
      {/* Divider */}
      <line x1="166" y1="88" x2="468" y2="88" stroke="rgba(0,212,255,0.18)" strokeWidth="0.75"/>
      {/* Tagline */}
      <text x="167" y="108" fontFamily="'JetBrains Mono','Courier New',monospace" fontWeight="400" fontSize="13" fill="rgba(255,255,255,0.45)" letterSpacing="5">AI WORKFORCE INTELLIGENCE</text>
    </svg>
  );
}

// Compact nav logo — dark backgrounds (owner portal)
function NavLogoDark(){
  return (
    <div style={{display:"flex",alignItems:"center",gap:11}}>
      <SwirlMark size={38}/>
      <div>
        <div style={{fontFamily:"'Outfit',sans-serif",fontWeight:700,fontSize:19,color:"#ffffff",lineHeight:1,letterSpacing:"-0.3px"}}>
          Shift<span style={{fontWeight:300}}>Pro</span><span style={{color:"#00d4ff",fontStyle:"italic"}}>.ai</span>
        </div>
        <div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:8,color:"rgba(245,158,11,0.6)",letterSpacing:"2.5px",marginTop:2}}>WORKFORCE PRO</div>
      </div>
    </div>
  );
}

// Compact nav logo — light backgrounds (employee portal)
function NavLogoLight(){
  return (
    <div style={{display:"flex",alignItems:"center",gap:11}}>
      <SwirlMark size={38}/>
      <div>
        <div style={{fontFamily:"'Nunito',sans-serif",fontWeight:800,fontSize:19,color:"#0f172a",lineHeight:1,letterSpacing:"-0.3px"}}>
          Shift<span style={{fontWeight:400}}>Pro</span><span style={{color:"#0099cc",fontStyle:"italic"}}>.ai</span>
        </div>
        <div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:8,color:"rgba(0,102,153,0.55)",letterSpacing:"2px",marginTop:2}}>YOUR SHIFT HUB</div>
      </div>
    </div>
  );
}

// ── THEMES ──────────────────────────────────────────
const E = {
  bg:"#f7f6ff", bg2:"#ffffff", bg3:"#f0effe",
  indigo:"#6366f1", indigoD:"rgba(99,102,241,0.1)", indigoB:"rgba(99,102,241,0.22)",
  violet:"#8b5cf6", teal:"#14b8a6", green:"#10b981",
  yellow:"#f59e0b", red:"#ef4444", orange:"#f97316",
  text:"#1e1b4b", textD:"#6b7280", textF:"#9ca3af",
  border:"rgba(99,102,241,0.12)",
  sans:"'Nunito',sans-serif", mono:"'JetBrains Mono',monospace",
  shadow:"0 2px 14px rgba(99,102,241,0.08)",
  shadowB:"0 8px 28px rgba(99,102,241,0.18)",
};
const O = {
  bg:"#05080f", bg2:"#090e1a", bg3:"#0e1525",
  amber:"#f59e0b", amberD:"rgba(245,158,11,0.1)", amberB:"rgba(245,158,11,0.22)",
  red:"#ef4444", redD:"rgba(239,68,68,0.1)",
  green:"#10b981", greenD:"rgba(16,185,129,0.1)",
  blue:"#3b82f6", cyan:"#06b6d4", purple:"#a78bfa",
  text:"#e2e8f0", textD:"rgba(226,232,240,0.5)", textF:"rgba(226,232,240,0.2)",
  border:"rgba(255,255,255,0.06)", borderA:"rgba(245,158,11,0.18)",
  sans:"'Outfit',sans-serif", mono:"'JetBrains Mono',monospace",
};

// ── STATIC DATA ──────────────────────────────────────
const DAYS = ["Mon","Tue","Wed","Thu","Fri","Sat","Sun"];
const EMPS = [
  {id:1,name:"Jordan Mills",first:"Jordan",role:"Lead Cashier",dept:"Front End",rate:18.5,avatar:"JM",color:"#6366f1",email:"jordan@work.com",status:"active",hired:"Jan 2023",wkHrs:38.5,moHrs:152,ot:0,cam:97,prod:91,rel:94,flags:0,streak:14,shifts:18,pin:"1234",risk:"Low",ghost:0.2},
  {id:2,name:"Priya Kapoor",first:"Priya",role:"Floor Associate",dept:"Sales Floor",rate:16,avatar:"PK",color:"#8b5cf6",email:"priya@work.com",status:"active",hired:"Mar 2023",wkHrs:41,moHrs:164,ot:1,cam:81,prod:78,rel:72,flags:1,streak:3,shifts:16,pin:"2345",risk:"Medium",ghost:1.8},
  {id:3,name:"Carlos Reyes",first:"Carlos",role:"Stock Clerk",dept:"Inventory",rate:15.5,avatar:"CR",color:"#14b8a6",email:"carlos@work.com",status:"break",hired:"Jun 2022",wkHrs:36,moHrs:144,ot:0,cam:68,prod:65,rel:61,flags:0,streak:1,shifts:14,pin:"3456",risk:"High",ghost:4.1},
  {id:4,name:"Anya Torres",first:"Anya",role:"Cashier",dept:"Front End",rate:15,avatar:"AT",color:"#f59e0b",email:"anya@work.com",status:"active",hired:"Sep 2023",wkHrs:32,moHrs:128,ot:0,cam:93,prod:88,rel:89,flags:0,streak:9,shifts:15,pin:"4567",risk:"Low",ghost:0.5},
  {id:5,name:"Marcus Bell",first:"Marcus",role:"Security",dept:"Operations",rate:17,avatar:"MB",color:"#ef4444",email:"marcus@work.com",status:"offline",hired:"Nov 2022",wkHrs:28,moHrs:112,ot:0,cam:54,prod:54,rel:48,flags:2,streak:0,shifts:11,pin:"5678",risk:"High",ghost:7.3},
];
const SCHED = {
  Mon:[{eId:1,s:8,e:16},{eId:2,s:9,e:17},{eId:4,s:12,e:20}],
  Tue:[{eId:1,s:8,e:16},{eId:3,s:7,e:15},{eId:5,s:8,e:16}],
  Wed:[{eId:2,s:9,e:17},{eId:4,s:12,e:20},{eId:3,s:7,e:15}],
  Thu:[{eId:1,s:8,e:16},{eId:5,s:8,e:16},{eId:2,s:13,e:21}],
  Fri:[{eId:1,s:8,e:16},{eId:2,s:9,e:17},{eId:4,s:12,e:20}],
  Sat:[{eId:4,s:9,e:17},{eId:5,s:10,e:18}],
  Sun:[{eId:2,s:10,e:16}],
};
const MSGS = [
  {id:1,from:"Manager",subject:"Friday schedule updated",body:"Hi team! We updated Friday — please check your shifts. Thanks!",time:"Today 9:14am",read:false},
  {id:2,from:"Manager",subject:"Team meeting Wed 9am",body:"Quick all-hands before opening. Coffee provided. 15 min.",time:"Yesterday",read:true},
  {id:3,from:"Manager",subject:"New uniform policy",body:"Starting next week: branded shirts. Pick up at front desk.",time:"Mar 24",read:true},
];
const SWAPS = [
  {id:1,from:"Priya K.",to:"Jordan M.",day:"Fri",shift:"9am–5pm",status:"pending",sub:"Today"},
  {id:2,from:"Marcus B.",to:"Anya T.",day:"Sat",shift:"10am–6pm",status:"approved",sub:"Mar 25"},
  {id:3,from:"Carlos R.",to:"Marcus B.",day:"Wed",shift:"7am–3pm",status:"denied",sub:"Mar 22"},
];
const TIMEOFF = [
  {id:1,emp:"Carlos R.",dates:"Apr 3–5",reason:"Medical",status:"pending"},
  {id:2,emp:"Priya K.",dates:"Apr 12",reason:"Personal",status:"approved"},
];
const FEED = [
  {id:1,time:"14:32",eId:1,event:"Clock-in verified",detail:"On time — presence confirmed",type:"good"},
  {id:2,time:"14:28",eId:3,event:"Dwell anomaly",detail:"22min stationary in non-work zone",type:"warning"},
  {id:3,time:"14:21",eId:2,event:"Register void #4",detail:"$34.99 voided — 3rd this week",type:"warning"},
  {id:4,time:"14:09",eId:5,event:"Unverifiable clock-in",detail:"Logged 08:00, no presence until 10:19",type:"critical"},
  {id:5,time:"13:55",eId:1,event:"Break started",detail:"Within scheduled window",type:"good"},
  {id:6,time:"13:41",eId:3,event:"Inventory discrepancy",detail:"Stock count off by 3 units",type:"warning"},
  {id:7,time:"13:30",eId:4,event:"Shift started",detail:"Clock-in confirmed",type:"good"},
  {id:8,time:"13:22",eId:5,event:"Pattern flag",detail:"4th late arrival this month",type:"critical"},
  {id:9,time:"12:55",eId:2,event:"Zone drift",detail:"45min away from assigned area",type:"warning"},
  {id:10,time:"12:03",eId:1,event:"Productivity peak",detail:"Highest throughput this week",type:"good"},
];
const BFLAGS = [
  {eId:5,signal:"Clock-in drift",desc:"Avg arrival 38min later vs 30 days ago",sev:"critical",trend:"↑ worsening"},
  {eId:3,signal:"Ghost hours",desc:"Presence 68% of logged time",sev:"critical",trend:"↑ worsening"},
  {eId:2,signal:"Register voids",desc:"3 voids this week — avg $28.40",sev:"warning",trend:"→ stable"},
  {eId:3,signal:"Zone clustering",desc:"47% of shift in non-assigned areas",sev:"warning",trend:"↑ worsening"},
  {eId:5,signal:"Consecutive lates",desc:"4 of 5 shifts 15–40min late",sev:"critical",trend:"↑ worsening"},
  {eId:2,signal:"Productivity decline",desc:"Output down 18% vs 60-day baseline",sev:"warning",trend:"↑ worsening"},
];
const MONTHLY = [
  {m:"Oct",h:612,cost:9840,ghost:3.2},{m:"Nov",h:588,cost:9430,ghost:4.1},
  {m:"Dec",h:640,cost:10240,ghost:2.8},{m:"Jan",h:601,cost:9620,ghost:5.3},
  {m:"Feb",h:556,cost:8910,ghost:6.1},{m:"Mar",h:578,cost:9260,ghost:13.9},
];
const LOCS = [
  {id:1,name:"Portland, OR",addr:"1234 SW Morrison St, Portland, OR 97205",staff:5,active:3,alerts:2,cameras:"5/6",cost:284,incidents:2},
  {id:2,name:"Los Angeles, CA",addr:"8800 W Sunset Blvd, Los Angeles, CA 90069",staff:4,active:4,alerts:0,cameras:"4/4",cost:231,incidents:0},
  {id:3,name:"Seattle, WA",addr:"1400 Pike Place, Seattle, WA 98101",staff:2,active:1,alerts:1,cameras:"2/2",cost:83,incidents:1},
];

// ── HELPERS ─────────────────────────────────────────
const fH = h => h <= 12 ? `${h}am` : `${h-12}pm`;
const byId = id => EMPS.find(e => e.id === id);
const rC = r => ({Low:O.green,Medium:O.amber,High:O.red})[r] || "#888";
const sC = t => ({critical:O.red,warning:O.amber,good:O.green,normal:O.textD})[t] || O.textD;
const stC = s => ({active:E.green,break:E.yellow,offline:E.textF})[s] || E.textF;

// ── ATOMS ────────────────────────────────────────────
function Av({emp,size=36,dark=false}){
  const bg = emp.color + (dark ? "28" : "18");
  const bd = emp.color + (dark ? "50" : "30");
  return (
    <div style={{width:size,height:size,borderRadius:size*.28,background:bg,border:`1.5px solid ${bd}`,display:"flex",alignItems:"center",justifyContent:"center",fontFamily:dark?O.mono:E.sans,fontSize:size*.3,color:emp.color,fontWeight:600,flexShrink:0}}>
      {emp.avatar}
    </div>
  );
}

function OBadge({label,color,sm}){
  return (
    <span style={{fontFamily:O.mono,fontSize:sm?8:9,color,background:color+"18",border:`1px solid ${color}35`,padding:sm?"1px 5px":"2px 8px",borderRadius:3,letterSpacing:1,textTransform:"uppercase",whiteSpace:"nowrap"}}>
      {label}
    </span>
  );
}

function EBadge({label,color}){
  return (
    <span style={{fontFamily:E.sans,fontSize:11,color,background:color+"18",border:`1px solid ${color}28`,padding:"2px 10px",borderRadius:20,fontWeight:600,whiteSpace:"nowrap"}}>
      {label}
    </span>
  );
}

function Ring({val,size=48,color}){
  const r = (size-6)/2;
  const circ = 2 * Math.PI * r;
  const d = (val/100) * circ;
  const c = color || (val>=80 ? O.green : val>=60 ? O.amber : O.red);
  return (
    <svg width={size} height={size} style={{transform:"rotate(-90deg)",flexShrink:0}}>
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth={4}/>
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={c} strokeWidth={4}
        strokeDasharray={`${d} ${circ-d}`} strokeLinecap="round"
        style={{filter:`drop-shadow(0 0 4px ${c}70)`,transition:"stroke-dasharray 1s ease"}}/>
      <text x={size/2} y={size/2+1} textAnchor="middle" dominantBaseline="middle"
        style={{transform:`rotate(90deg)`,transformOrigin:`${size/2}px ${size/2}px`,fontFamily:O.mono,fontSize:size*.22,fill:c,fontWeight:500}}>
        {val}
      </text>
    </svg>
  );
}

function OStat({label,value,sub,color=O.amber}){
  return (
    <div style={{background:O.bg2,border:`1px solid ${O.border}`,borderRadius:8,padding:"16px 18px"}}>
      <div style={{fontFamily:O.mono,fontSize:8,color:O.textF,letterSpacing:2,marginBottom:8}}>{label.toUpperCase()}</div>
      <div style={{fontFamily:O.sans,fontWeight:700,fontSize:26,color,lineHeight:1,marginBottom:3}}>{value}</div>
      {sub && <div style={{fontFamily:O.mono,fontSize:9,color:O.textD}}>{sub}</div>}
    </div>
  );
}

function OLogo(){ return <NavLogoDark/>; }

function ELogo(){ return <NavLogoLight/>; }

// ══════════════════════════════════════════════════
//  LOGIN
// ══════════════════════════════════════════════════
function Login({onLogin}){
  const getInitialMode = () => {
    if(typeof window !== "undefined"){
      const p = new URLSearchParams(window.location.search);
      if(p.get("portal")==="employee") return "employee";
    }
    return null;
  };

  const [mode,setMode]   = useState(getInitialMode);
  const [email,setEmail] = useState("");
  const [pass,setPass]   = useState("");
  const [err,setErr]     = useState("");
  const [busy,setBusy]   = useState(false);
  const [resetSent,setResetSent] = useState(false);
  const [showReset,setShowReset] = useState(false);

  const amber  = "#f59e0b";
  const amberB = "rgba(245,158,11,0.3)";
  const green  = "#10b981";
  const greenB = "rgba(16,185,129,0.3)";
  const red    = "#ef4444";

  // ── OWNER SIGN IN ──
  const doOwnerLogin = async () => {
    if(!email||!pass){setErr("Please enter your email and password.");return;}
    setBusy(true); setErr("");
    try{
      const {createClient} = await import("@supabase/supabase-js");
      const sb = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
      );
      const {data,error} = await sb.auth.signInWithPassword({email,password:pass});
      if(error) throw error;
      // Get profile
      const {data:profile} = await sb.from("users").select("*").eq("id",data.user.id).single();
      const emp = profile ? {
        id:     profile.id,
        name:   profile.first_name+" "+profile.last_name,
        first:  profile.first_name,
        role:   profile.role,
        dept:   profile.department||"",
        rate:   parseFloat(profile.hourly_rate)||0,
        avatar: profile.avatar_initials||"?",
        color:  profile.avatar_color||"#6366f1",
        email:  data.user.email,
        status: "active",
        hired:  profile.hire_date||"",
        wkHrs:  40, moHrs:160, ot:0,
        cam:85, prod:88, rel:92, flags:0, streak:1, shifts:4,
        risk:"Low", ghost:0,
        orgId:  profile.org_id,
        locId:  profile.location_id,
        appRole:profile.app_role,
      } : null;
      onLogin("owner", emp);
    }catch(e){
      setErr(e.message||"Sign in failed. Check your email and password.");
    }finally{setBusy(false);}
  };

  // ── EMPLOYEE SIGN IN ──
  const doEmpLogin = async () => {
    if(!email||!pass){setErr("Please enter your email and password.");return;}
    setBusy(true); setErr("");
    try{
      const {createClient} = await import("@supabase/supabase-js");
      const sb = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
      );
      const {data,error} = await sb.auth.signInWithPassword({email,password:pass});
      if(error) throw error;
      const {data:profile} = await sb.from("users").select("*").eq("id",data.user.id).single();
      const emp = profile ? {
        id:     profile.id,
        name:   profile.first_name+" "+profile.last_name,
        first:  profile.first_name,
        role:   profile.role,
        dept:   profile.department||"",
        rate:   parseFloat(profile.hourly_rate)||15,
        avatar: profile.avatar_initials||(profile.first_name[0]+profile.last_name[0]).toUpperCase(),
        color:  profile.avatar_color||"#6366f1",
        email:  data.user.email,
        status: "active",
        hired:  profile.hire_date||"",
        wkHrs:  38.5, moHrs:152, ot:0,
        cam:90, prod:85, rel:90, flags:0, streak:5, shifts:4,
        risk:"Low", ghost:0,
        orgId:  profile.org_id,
        locId:  profile.location_id,
        appRole:profile.app_role||"employee",
      } : null;
      onLogin("employee", emp);
    }catch(e){
      setErr(e.message||"Sign in failed. Check your email and password.");
    }finally{setBusy(false);}
  };

  // ── PASSWORD RESET ──
  const doReset = async () => {
    if(!email){setErr("Enter your email first.");return;}
    setBusy(true); setErr("");
    try{
      const {createClient} = await import("@supabase/supabase-js");
      const sb = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
      );
      await sb.auth.resetPasswordForEmail(email,{
        redirectTo: window.location.origin+"/login"
      });
      setResetSent(true);
    }catch(e){
      setErr("Could not send reset email. Try again.");
    }finally{setBusy(false);}
  };



  return(
    <div style={{minHeight:"100vh",
      background:"linear-gradient(135deg,#0f0c29,#302b63,#24243e)",
      display:"flex",alignItems:"center",justifyContent:"center",
      fontFamily:"'Outfit',sans-serif",padding:"20px",position:"relative"}}>

      {/* Dot grid background */}
      <div style={{position:"absolute",inset:0,
        backgroundImage:"radial-gradient(rgba(99,102,241,0.13) 1px,transparent 1px)",
        backgroundSize:"32px 32px",pointerEvents:"none"}}/>

      <div style={{position:"relative",width:"100%",maxWidth:460,
        padding:"0 16px",animation:"fadeUp 0.5s ease"}}>

        {/* Logo */}
        <div style={{textAlign:"center",marginBottom:32}}>
          <div style={{display:"flex",justifyContent:"center",marginBottom:16,
            filter:"drop-shadow(0 16px 40px rgba(0,180,255,0.4))"}}>
            <LogoHero/>
          </div>
          <div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:10,
            color:"rgba(255,255,255,0.25)",letterSpacing:"4px"}}>
            SELECT YOUR PORTAL TO CONTINUE
          </div>
        </div>

        {/* ── PORTAL SELECTOR ── */}
        {!mode&&(
          <div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14}}>

            {/* Owner */}
            <button onClick={()=>setMode("owner")}
              style={{padding:"28px 18px",
                background:"rgba(245,158,11,0.05)",
                border:"1.5px solid rgba(245,158,11,0.35)",
                borderRadius:18,cursor:"pointer",textAlign:"center",
                transition:"all 0.25s",display:"flex",
                flexDirection:"column",alignItems:"center",gap:14}}
              onMouseEnter={e=>{e.currentTarget.style.transform="translateY(-5px)";e.currentTarget.style.background="rgba(245,158,11,0.1)";e.currentTarget.style.borderColor="rgba(245,158,11,0.8)";e.currentTarget.style.boxShadow="0 12px 40px rgba(245,158,11,0.2)";}}
              onMouseLeave={e=>{e.currentTarget.style.transform="none";e.currentTarget.style.background="rgba(245,158,11,0.05)";e.currentTarget.style.borderColor="rgba(245,158,11,0.35)";e.currentTarget.style.boxShadow="none";}}>
              <div style={{filter:"drop-shadow(0 0 18px rgba(245,158,11,0.6))"}}>
                <ButtonSwirl size={72} c1="#f59e0b" c2="#f97316" c3="#b45309" accent="#fde68a"/>
              </div>
              <div>
                <div style={{fontFamily:"'Outfit',sans-serif",fontWeight:800,
                  fontSize:16,color:"#fff",marginBottom:5}}>Owner / Manager</div>
                <div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:9,
                  color:"rgba(245,158,11,0.65)",letterSpacing:"1.5px"}}>
                  OPERATIONS CENTER
                </div>
              </div>
            </button>

            {/* Employee */}
            <button onClick={()=>setMode("employee")}
              style={{padding:"28px 18px",
                background:"rgba(16,185,129,0.05)",
                border:"1.5px solid rgba(16,185,129,0.35)",
                borderRadius:18,cursor:"pointer",textAlign:"center",
                transition:"all 0.25s",display:"flex",
                flexDirection:"column",alignItems:"center",gap:14}}
              onMouseEnter={e=>{e.currentTarget.style.transform="translateY(-5px)";e.currentTarget.style.background="rgba(16,185,129,0.1)";e.currentTarget.style.borderColor="rgba(16,185,129,0.8)";e.currentTarget.style.boxShadow="0 12px 40px rgba(16,185,129,0.2)";}}
              onMouseLeave={e=>{e.currentTarget.style.transform="none";e.currentTarget.style.background="rgba(16,185,129,0.05)";e.currentTarget.style.borderColor="rgba(16,185,129,0.35)";e.currentTarget.style.boxShadow="none";}}>
              <div style={{filter:"drop-shadow(0 0 18px rgba(16,185,129,0.6))"}}>
                <ButtonSwirl size={72} c1="#10b981" c2="#059669" c3="#065f46" accent="#6ee7b7"/>
              </div>
              <div>
                <div style={{fontFamily:"'Outfit',sans-serif",fontWeight:800,
                  fontSize:16,color:"#fff",marginBottom:5}}>I'm an Employee</div>
                <div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:9,
                  color:"rgba(16,185,129,0.65)",letterSpacing:"1.5px"}}>
                  MY SCHEDULE & TIME CLOCK
                </div>
              </div>
            </button>

          </div>

          {/* Signup link */}
          <div style={{textAlign:"center",marginTop:20}}>
            <span style={{fontFamily:"'JetBrains Mono',monospace",fontSize:9,
              color:"rgba(255,255,255,0.2)",letterSpacing:1}}>
              New business?{" "}
            </span>
            <a href="/signup"
              style={{fontFamily:"'JetBrains Mono',monospace",fontSize:9,
                color:"rgba(245,158,11,0.5)",letterSpacing:1,
                textDecoration:"none",transition:"color 0.2s"}}
              onMouseEnter={e=>e.target.style.color="rgba(245,158,11,0.9)"}
              onMouseLeave={e=>e.target.style.color="rgba(245,158,11,0.5)"}>
              Create your account →
            </a>
          </div>
          </div>
        )}

        {/* ── OWNER LOGIN ── */}
        {mode==="owner"&&(
          <div style={{background:"rgba(9,14,26,0.96)",
            border:"1px solid "+amberB,
            borderRadius:16,padding:"28px",
            boxShadow:"0 20px 60px rgba(0,0,0,0.5)"}}>
            <button onClick={()=>{setMode(null);setErr("");setEmail("");setPass("");setShowReset(false);setResetSent(false);}}
              style={{background:"none",border:"none",
                color:"rgba(255,255,255,0.3)",fontFamily:O.mono,
                fontSize:10,letterSpacing:1,cursor:"pointer",marginBottom:18}}>
              ← BACK
            </button>

            {!showReset?(
              <div>
                <div style={{fontFamily:"'Outfit',sans-serif",fontWeight:800,
                  fontSize:22,color:"#fff",marginBottom:3}}>Owner / Manager</div>
                <div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:10,
                  color:"rgba(245,158,11,0.6)",marginBottom:22,letterSpacing:1}}>
                  OPERATIONS CENTER LOGIN
                </div>
                <div style={{marginBottom:14}}>
                  <label style={{fontFamily:O.mono,fontSize:9,color:"rgba(255,255,255,0.45)",
                    letterSpacing:"2px",display:"block",marginBottom:6}}>EMAIL</label>
                  <input value={email}
                    onChange={e=>{setEmail(e.target.value);setErr("");}}
                    onKeyDown={e=>e.key==="Enter"&&doOwnerLogin()}
                    type="email" placeholder="you@yourbusiness.com"
                    style={{width:"100%",padding:"12px 14px",
                      background:"rgba(255,255,255,0.06)",
                      border:"1px solid rgba(245,158,11,0.35)",
                      borderRadius:9,fontFamily:O.mono,fontSize:14,
                      color:"#fff",outline:"none",boxSizing:"border-box"}}/>
                </div>
                <div style={{marginBottom:14}}>
                  <label style={{fontFamily:O.mono,fontSize:9,color:"rgba(255,255,255,0.45)",
                    letterSpacing:"2px",display:"block",marginBottom:6}}>PASSWORD</label>
                  <input value={pass}
                    onChange={e=>{setPass(e.target.value);setErr("");}}
                    onKeyDown={e=>e.key==="Enter"&&doOwnerLogin()}
                    type="password" placeholder="••••••••"
                    style={{width:"100%",padding:"12px 14px",
                      background:"rgba(255,255,255,0.06)",
                      border:"1px solid rgba(245,158,11,0.35)",
                      borderRadius:9,fontFamily:O.mono,fontSize:14,
                      color:"#fff",outline:"none",boxSizing:"border-box"}}/>
                </div>
                {err&&(
                  <div style={{fontFamily:O.mono,fontSize:10,color:red,
                    marginBottom:12,padding:"8px 10px",
                    background:"rgba(239,68,68,0.07)",
                    border:"1px solid rgba(239,68,68,0.2)",borderRadius:6}}>
                    {err}
                  </div>
                )}
                <button onClick={doOwnerLogin}
                  style={{width:"100%",padding:"14px",
                    background:busy?"rgba(245,158,11,0.5)":"linear-gradient(135deg,#f59e0b,#f97316)",
                    border:"none",borderRadius:10,
                    fontFamily:"'Outfit',sans-serif",fontWeight:700,fontSize:15,
                    color:"#030c14",cursor:busy?"not-allowed":"pointer",
                    boxShadow:"0 4px 20px rgba(245,158,11,0.3)",marginBottom:12,
                    transition:"all 0.2s"}}
                  onMouseEnter={e=>{if(!busy)e.currentTarget.style.transform="translateY(-1px)";}}
                  onMouseLeave={e=>e.currentTarget.style.transform="none"}>
                  {busy?"Signing in…":"Enter Command Center →"}
                </button>
                <div style={{textAlign:"center"}}>
                  <button onClick={()=>{setShowReset(true);setErr("");}}
                    style={{background:"none",border:"none",
                      fontFamily:O.mono,fontSize:10,
                      color:"rgba(245,158,11,0.5)",cursor:"pointer",
                      letterSpacing:0.5,textDecoration:"underline"}}>
                    Forgot password?
                  </button>
                </div>
              </div>
            ):(
              <div>
                <div style={{fontFamily:"'Outfit',sans-serif",fontWeight:700,
                  fontSize:18,color:"#fff",marginBottom:4}}>
                  {resetSent?"Check your email ✉️":"Reset your password"}
                </div>
                {!resetSent?(
                  <div>
                    <div style={{fontFamily:O.mono,fontSize:10,color:"rgba(255,255,255,0.4)",
                      marginBottom:20,lineHeight:1.6}}>
                      Enter your email and we'll send a reset link.
                    </div>
                    <div style={{marginBottom:14}}>
                      <label style={{fontFamily:O.mono,fontSize:9,color:"rgba(255,255,255,0.45)",
                        letterSpacing:"2px",display:"block",marginBottom:6}}>EMAIL</label>
                      <input value={email}
                        onChange={e=>{setEmail(e.target.value);setErr("");}}
                        onKeyDown={e=>e.key==="Enter"&&doReset()}
                        type="email" placeholder="you@yourbusiness.com"
                        style={{width:"100%",padding:"12px 14px",
                          background:"rgba(255,255,255,0.06)",
                          border:"1px solid rgba(245,158,11,0.35)",
                          borderRadius:9,fontFamily:O.mono,fontSize:14,
                          color:"#fff",outline:"none",boxSizing:"border-box"}}/>
                    </div>
                    {err&&<div style={{fontFamily:O.mono,fontSize:10,color:red,marginBottom:12}}>{err}</div>}
                    <button onClick={doReset}
                      style={{width:"100%",padding:"13px",
                        background:"rgba(245,158,11,0.15)",
                        border:"1px solid "+amberB,borderRadius:9,
                        fontFamily:"'Outfit',sans-serif",fontWeight:700,fontSize:14,
                        color:amber,cursor:"pointer",marginBottom:10}}>
                      {busy?"Sending…":"Send Reset Link →"}
                    </button>
                    <button onClick={()=>{setShowReset(false);setErr("");}}
                      style={{width:"100%",padding:"10px",background:"none",
                        border:"none",fontFamily:O.mono,fontSize:10,
                        color:"rgba(255,255,255,0.3)",cursor:"pointer"}}>
                      ← Back to sign in
                    </button>
                  </div>
                ):(
                  <div>
                    <div style={{fontFamily:O.mono,fontSize:11,color:"rgba(255,255,255,0.5)",
                      lineHeight:1.7,marginBottom:20}}>
                      We sent a reset link to{" "}
                      <span style={{color:amber}}>{email}</span>.
                      Check your inbox (and spam folder) and click the link to set a new password.
                    </div>
                    <button onClick={()=>{setShowReset(false);setResetSent(false);setErr("");}}
                      style={{width:"100%",padding:"13px",
                        background:"linear-gradient(135deg,#f59e0b,#f97316)",
                        border:"none",borderRadius:9,
                        fontFamily:"'Outfit',sans-serif",fontWeight:700,
                        fontSize:14,color:"#030c14",cursor:"pointer"}}>
                      Back to Sign In
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* ── EMPLOYEE LOGIN ── */}
        {mode==="employee"&&(
          <div style={{background:"rgba(255,255,255,0.98)",
            borderRadius:16,padding:"28px",
            boxShadow:"0 20px 60px rgba(0,0,0,0.4)"}}>
            <button onClick={()=>{setMode(null);setErr("");setEmail("");setPass("");}}
              style={{background:"none",border:"none",
                color:"#9ca3af",fontFamily:E.sans,
                fontSize:13,cursor:"pointer",marginBottom:16,
                display:"flex",alignItems:"center",gap:5}}>
              ← Back
            </button>

            <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:20}}>
              <div style={{width:44,height:44,borderRadius:12,flexShrink:0,
                background:"linear-gradient(135deg,"+E.indigo+","+E.violet+")",
                display:"flex",alignItems:"center",justifyContent:"center"}}>
                <span style={{fontSize:22}}>👋</span>
              </div>
              <div>
                <div style={{fontFamily:E.sans,fontWeight:800,
                  fontSize:20,color:E.text,marginBottom:2}}>Welcome back!</div>
                <div style={{fontFamily:E.sans,fontSize:13,color:E.textD}}>
                  Sign in to your Work Hub
                </div>
              </div>
            </div>

            <div style={{marginBottom:12}}>
              <label style={{fontFamily:E.sans,fontWeight:600,fontSize:12,
                color:E.textD,display:"block",marginBottom:5}}>Email Address</label>
              <input value={email}
                onChange={e=>{setEmail(e.target.value);setErr("");}}
                onKeyDown={e=>e.key==="Enter"&&doEmpLogin()}
                type="email" placeholder="you@email.com"
                style={{width:"100%",padding:"12px 14px",
                  background:"#f8f7ff",border:"1.5px solid "+E.border,
                  borderRadius:9,fontFamily:E.sans,fontSize:14,
                  color:E.text,outline:"none",boxSizing:"border-box",
                  transition:"border-color 0.2s"}}
                onFocus={e=>e.target.style.borderColor=E.indigo}
                onBlur={e=>e.target.style.borderColor=E.border}/>
            </div>
            <div style={{marginBottom:err?8:18}}>
              <label style={{fontFamily:E.sans,fontWeight:600,fontSize:12,
                color:E.textD,display:"block",marginBottom:5}}>Password</label>
              <input value={pass}
                onChange={e=>{setPass(e.target.value);setErr("");}}
                onKeyDown={e=>e.key==="Enter"&&doEmpLogin()}
                type="password" placeholder="••••••••"
                style={{width:"100%",padding:"12px 14px",
                  background:"#f8f7ff",border:"1.5px solid "+E.border,
                  borderRadius:9,fontFamily:E.sans,fontSize:14,
                  color:E.text,outline:"none",boxSizing:"border-box",
                  transition:"border-color 0.2s"}}
                onFocus={e=>e.target.style.borderColor=E.indigo}
                onBlur={e=>e.target.style.borderColor=E.border}/>
            </div>
            {err&&(
              <div style={{fontFamily:E.sans,fontSize:12,color:E.red,
                marginBottom:12,padding:"8px 10px",
                background:"rgba(239,68,68,0.05)",
                border:"1px solid rgba(239,68,68,0.15)",borderRadius:6}}>
                {err}
              </div>
            )}
            <button onClick={doEmpLogin}
              style={{width:"100%",padding:"14px",
                background:busy?"#a5b4fc":"linear-gradient(135deg,"+E.indigo+","+E.violet+")",
                border:"none",borderRadius:10,
                fontFamily:E.sans,fontWeight:700,fontSize:15,
                color:"#fff",cursor:busy?"not-allowed":"pointer",
                boxShadow:E.shadowB,marginBottom:12,
                transition:"all 0.2s"}}
              onMouseEnter={e=>{if(!busy)e.currentTarget.style.transform="translateY(-1px)";}}
              onMouseLeave={e=>e.currentTarget.style.transform="none"}>
              {busy?"Signing in…":"Go to My Work Hub →"}
            </button>
            <div style={{textAlign:"center",fontFamily:E.sans,fontSize:12,color:E.textF}}>
              Need access? Ask your manager to add you to ShiftPro.
            </div>
          </div>
        )}

      </div>
    </div>
  );
}


// ══════════════════════════════════════════════════
//  EMPLOYEE PORTAL  (Prompts 1–6)
// ══════════════════════════════════════════════════
function EmpPortal({emp,onLogout}){
  // Normalize emp to prevent crashes from missing fields
  const empSafe = {
    id:      emp?.id||"",
    name:    emp?.name||(emp?.first?emp.first+" ":"")+"Employee",
    first:   emp?.first||(emp?.name?.split(" ")[0])||"there",
    role:    emp?.role||"Employee",
    dept:    emp?.dept||"",
    rate:    parseFloat(emp?.rate)||15,
    avatar:  emp?.avatar||"?",
    color:   emp?.color||"#6366f1",
    email:   emp?.email||"",
    wkHrs:   parseFloat(emp?.wkHrs)||0,
    moHrs:   parseFloat(emp?.moHrs)||0,
    ot:      parseFloat(emp?.ot)||0,
    streak:  parseInt(emp?.streak)||0,
    flags:   parseInt(emp?.flags)||0,
    shifts:  parseInt(emp?.shifts)||0,
    risk:    emp?.risk||"Low",
    orgId:   empSafe.orgId||null,
    locId:   empSafe.locId||null,
    appRole: empSafe.appRole||"employee",
    pin:     empSafe.pin||"",
  };
  const [tab,setTab] = useState("home");
  const [clocked,setClocked] = useState(false);
  const [empShifts,setEmpShifts] = useState(null);
  const [onBreak,setOnBreak] = useState(false);
  const [breakSecs,setBreakSecs] = useState(0);
  const [clockedAt,setClockedAt] = useState(null);
  const [secs,setSecs] = useState(0);
  const [syncMsg,setSyncMsg] = useState("");
  const [now,setNow] = useState(new Date());
  const [swapOpen,setSwapOpen] = useState(false);
  const [toOpen,setToOpen] = useState(false);
  const [msgs,setMsgs] = useState(MSGS);
  const [openMsg,setOpenMsg] = useState(null);

  useEffect(()=>{
    const t = setInterval(()=>setNow(new Date()),1000);
    return ()=>clearInterval(t);
  },[]);

  useEffect(()=>{
    if(!clocked){ setSecs(0); setBreakSecs(0); setOnBreak(false); return; }
    if(onBreak){
      const t = setInterval(()=>setBreakSecs(s=>s+1),1000);
      return ()=>clearInterval(t);
    }
    const t = setInterval(()=>setSecs(s=>s+1),1000);
    return ()=>clearInterval(t);
  },[clocked,onBreak]);

  useEffect(()=>{
    if(!empSafe.id) return;
    const loadEmpShifts=async()=>{
      try{
        const {createClient}=await import("@supabase/supabase-js");
        const sb=createClient(process.env.NEXT_PUBLIC_SUPABASE_URL,process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
        const today=new Date().toISOString().split("T")[0];
        const {data:shifts}=await sb.from("shifts")
          .select("*").eq("user_id",empSafe.id)
          .gte("shift_date",today)
          .in("status",["scheduled","published","confirmed"])
          .order("shift_date");
        setEmpShifts(shifts||[]);
      }catch(e){ setEmpShifts([]); }
    };
    loadEmpShifts();
  },[empSafe.id]);

  const fmt = s => `${String(Math.floor(s/3600)).padStart(2,"0")}:${String(Math.floor((s%3600)/60)).padStart(2,"0")}:${String(s%60).padStart(2,"0")}`;
  const h = now.getHours();
  const greet = h<12 ? "Good morning" : h<17 ? "Good afternoon" : "Good evening";
  const myShifts = []; // Real users have UUID IDs - use realShifts from Supabase instead
  const realShifts = empShifts||[];
  const unread = msgs.filter(m=>!m.read).length;
  const gross = (empSafe.wkHrs * empSafe.rate).toFixed(2);
  const sc = empSafe.streak>=10?"⭐ Star Performer":empSafe.streak>=5?"🔷 Consistent":"✅ Reliable";
  const scColor = empSafe.streak>=10?E.yellow:empSafe.streak>=5?E.violet:E.green;

  const TABS = [
    {id:"home",       label:"🏠 Home"},
    {id:"schedule",   label:"📅 Schedule"},
    {id:"earnings",   label:"🌱 My Growth"},
    {id:"team",       label:unread>0?"💬 Messages ("+unread+")":"💬 Messages"},
    {id:"recognition",label:"🏆 Achievements"},
    {id:"documents",  label:"📄 My Documents"},
  ];

  return (
    <div style={{minHeight:"100vh",background:E.bg,fontFamily:E.sans,color:E.text}}>

      {/* Header */}
      <div style={{background:E.bg2,borderBottom:`1px solid ${E.border}`,padding:"0 20px",height:56,display:"flex",alignItems:"center",justifyContent:"space-between",position:"sticky",top:0,zIndex:100,boxShadow:E.shadow}}>
        <ELogo/>
        <div style={{display:"flex",alignItems:"center",gap:12}}>
          <Av emp={emp} size={32}/>
          <div>
            <div style={{fontFamily:E.sans,fontWeight:700,fontSize:14,color:E.text}}>Hi, {empSafe.first}!</div>
            <div style={{fontFamily:E.sans,fontSize:11,color:E.textD}}>{empSafe.role}</div>
          </div>
          <button onClick={onLogout} style={{padding:"5px 14px",background:"none",border:`1.5px solid ${E.border}`,borderRadius:20,fontFamily:E.sans,fontSize:12,color:E.textD,cursor:"pointer",marginLeft:4}}>
            Sign out
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div style={{background:E.bg2,borderBottom:`1px solid ${E.border}`,padding:"0 20px",display:"flex",gap:2,overflowX:"auto"}}>
        {TABS.map(t => (
          <button key={t.id} onClick={()=>setTab(t.id)}
            style={{fontFamily:E.sans,fontWeight:600,fontSize:13,padding:"11px 14px",background:"none",border:"none",cursor:"pointer",color:tab===t.id?E.indigo:E.textD,borderBottom:tab===t.id?`2.5px solid ${E.indigo}`:"2.5px solid transparent",transition:"all 0.15s",whiteSpace:"nowrap",marginBottom:-1}}>
            {t.label}
          </button>
        ))}
      </div>

      <div style={{padding:"16px",maxWidth:720,margin:"0 auto"}}>

        {/* ── HOME (Prompt 1) ── */}
        {tab==="home" && (
          <div style={{animation:"fadeUp 0.3s ease"}}>

            {/* ── GREETING HEADER ── */}
            <div style={{background:"linear-gradient(135deg,"+E.indigo+","+E.violet+")",
              borderRadius:18,padding:"22px 24px",marginBottom:14,color:"#fff",
              position:"relative",overflow:"hidden",boxShadow:E.shadowB}}>
              <div style={{position:"absolute",top:-30,right:-30,width:130,height:130,
                background:"rgba(255,255,255,0.06)",borderRadius:"50%",pointerEvents:"none"}}/>
              <div style={{position:"absolute",bottom:-20,left:-20,width:90,height:90,
                background:"rgba(255,255,255,0.04)",borderRadius:"50%",pointerEvents:"none"}}/>
              <div style={{fontFamily:E.sans,fontWeight:800,fontSize:22,marginBottom:3}}>
                {greet}, {empSafe.first}! ✨
              </div>
              <div style={{fontFamily:E.sans,fontSize:13,opacity:0.8}}>
                {now.toLocaleDateString("en-US",{weekday:"long",month:"long",day:"numeric"})}
              </div>
            </div>

            {/* ── TIME CLOCK ── */}
            <div style={{background:E.bg2,border:"1.5px solid "+
              (clocked&&!onBreak?"rgba(99,102,241,0.35)":
               onBreak?"rgba(245,158,11,0.35)":E.border),
              borderRadius:20,padding:"22px 24px",marginBottom:14,
              boxShadow:clocked?"0 4px 24px rgba(99,102,241,0.15)":E.shadow,
              transition:"all 0.4s ease"}}>

              {/* Status bar */}
              <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",
                marginBottom:18}}>
                <div style={{display:"flex",alignItems:"center",gap:10}}>
                  <div style={{width:10,height:10,borderRadius:"50%",
                    background:clocked&&!onBreak?E.green:onBreak?E.yellow:"rgba(0,0,0,0.15)",
                    boxShadow:clocked&&!onBreak?"0 0 8px "+E.green:
                      onBreak?"0 0 8px "+E.yellow:"none",
                    animation:clocked&&!onBreak?"blink 2s infinite":"none",
                    transition:"all 0.3s"}}/>
                  <div>
                    <div style={{fontFamily:E.sans,fontWeight:700,fontSize:14,
                      color:clocked&&!onBreak?E.indigo:onBreak?E.yellow:E.textD}}>
                      {!clocked?"Not Clocked In":onBreak?"On Break":"Clocked In"}
                    </div>
                    {clocked&&(
                      <div style={{fontFamily:E.mono,fontSize:11,color:E.textF,marginTop:1}}>
                        {onBreak
                          ? "Shift paused · Break timer running"
                          : "Shift timer running · Break not started"}
                      </div>
                    )}
                  </div>
                </div>
                {clocked&&clockedAt&&(
                  <div style={{textAlign:"right"}}>
                    <div style={{fontFamily:E.mono,fontSize:10,color:E.textF}}>
                      Clocked in at
                    </div>
                    <div style={{fontFamily:E.sans,fontWeight:700,fontSize:13,color:E.text}}>
                      {clockedAt.toLocaleTimeString("en-US",
                        {hour:"2-digit",minute:"2-digit"})}
                    </div>
                  </div>
                )}
              </div>

              {/* Timer display */}
              <div style={{display:"flex",gap:16,alignItems:"center",marginBottom:20,
                flexWrap:"wrap"}}>

                {/* Shift timer */}
                <div style={{flex:1,background:clocked&&!onBreak
                    ?"linear-gradient(135deg,rgba(99,102,241,0.08),rgba(139,92,246,0.05))"
                    :"rgba(0,0,0,0.03)",
                  border:"1.5px solid "+(clocked&&!onBreak
                    ?"rgba(99,102,241,0.2)":"rgba(0,0,0,0.06)"),
                  borderRadius:14,padding:"16px 18px",textAlign:"center",
                  transition:"all 0.3s",minWidth:140}}>
                  <div style={{fontFamily:E.mono,fontSize:8,letterSpacing:"2px",
                    color:clocked&&!onBreak?E.indigo:E.textF,marginBottom:6}}>
                    SHIFT TIME
                  </div>
                  <div style={{fontFamily:E.mono,fontWeight:700,
                    fontSize:clocked?36:28,
                    color:clocked&&!onBreak?E.indigo:E.textD,
                    letterSpacing:2,lineHeight:1,transition:"all 0.3s"}}>
                    {clocked?fmt(secs):"00:00:00"}
                  </div>
                  {clocked&&(
                    <div style={{fontFamily:E.sans,fontSize:11,color:E.textF,marginTop:5}}>
                      {onBreak?"paused":"running"}
                    </div>
                  )}
                </div>

                {/* Break timer - only shows when clocked in */}
                {clocked&&(
                  <div style={{flex:1,
                    background:onBreak
                      ?"linear-gradient(135deg,rgba(245,158,11,0.08),rgba(251,146,60,0.04))"
                      :"rgba(0,0,0,0.02)",
                    border:"1.5px solid "+(onBreak
                      ?"rgba(245,158,11,0.25)":"rgba(0,0,0,0.06)"),
                    borderRadius:14,padding:"16px 18px",textAlign:"center",
                    transition:"all 0.3s",minWidth:140}}>
                    <div style={{fontFamily:E.mono,fontSize:8,letterSpacing:"2px",
                      color:onBreak?E.yellow:E.textF,marginBottom:6}}>
                      BREAK TIME
                    </div>
                    <div style={{fontFamily:E.mono,fontWeight:700,fontSize:36,
                      color:onBreak?E.yellow:E.textD,
                      letterSpacing:2,lineHeight:1,transition:"all 0.3s"}}>
                      {fmt(breakSecs)}
                    </div>
                    <div style={{fontFamily:E.sans,fontSize:11,
                      color:onBreak?E.yellow:E.textF,marginTop:5}}>
                      {onBreak?"running":"not started"}
                    </div>
                  </div>
                )}
              </div>

              {/* Sync status indicator */}
              {syncMsg&&(
                <div style={{fontFamily:E.mono,fontSize:10,
                  color:syncMsg.startsWith("✓")?E.green:E.yellow,
                  textAlign:"center",marginBottom:8,
                  animation:"fadeUp 0.3s ease"}}>
                  {syncMsg}
                </div>
              )}
              {/* Action buttons */}
              <div style={{display:"flex",gap:10,flexWrap:"wrap"}}>

                {/* Clock In / Clock Out */}
                {!clocked?(
                  <button
                    onClick={async()=>{
                      setClocked(true);setClockedAt(new Date());
                      try{
                        const {createClient}=await import("@supabase/supabase-js");
                        const sb=createClient(process.env.NEXT_PUBLIC_SUPABASE_URL,process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
                        await sb.from("clock_events").insert({
                          user_id:empSafe.id,
                          org_id:empSafe.orgId||null,
                          location_id:empSafe.locId||null,
                          event_type:"clock_in",
                          occurred_at:new Date().toISOString(),
                        });
                        setSyncMsg("✓ Clocked in");
                        setTimeout(()=>setSyncMsg(""),2000);
                      }catch(e){setSyncMsg("⚠ Sync failed");}
                    }}
                    style={{flex:1,padding:"14px 20px",
                      background:"linear-gradient(135deg,"+E.indigo+","+E.violet+")",
                      border:"none",borderRadius:14,
                      fontFamily:E.sans,fontWeight:700,fontSize:16,
                      color:"#fff",cursor:"pointer",
                      boxShadow:"0 4px 18px rgba(99,102,241,0.4)",
                      transition:"all 0.2s"}}
                    onMouseEnter={e=>e.currentTarget.style.transform="scale(1.02)"}
                    onMouseLeave={e=>e.currentTarget.style.transform="scale(1)"}>
                    ✓ Clock In
                  </button>
                ):(
                  <div style={{display:"flex",gap:10,flex:1,flexWrap:"wrap"}}>

                    {/* Break toggle */}
                    <button
                      onClick={async()=>{
                        const nowBreak = !onBreak;
                        setOnBreak(b=>!b);
                        try{
                          const {createClient}=await import("@supabase/supabase-js");
                          const sb=createClient(process.env.NEXT_PUBLIC_SUPABASE_URL,process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
                          await sb.from("clock_events").insert({
                            user_id:empSafe.id,org_id:empSafe.orgId||null,location_id:empSafe.locId||null,
                            event_type:nowBreak?"break_start":"break_end",
                            occurred_at:new Date().toISOString(),
                          });
                          setSyncMsg(nowBreak?"✓ Break started":"✓ Back on shift");
                          setTimeout(()=>setSyncMsg(""),2000);
                        }catch(e){setSyncMsg("⚠ Sync failed");}
                      }}
                      style={{flex:1,padding:"13px 16px",
                        background:onBreak
                          ?"linear-gradient(135deg,rgba(99,102,241,0.9),rgba(139,92,246,0.9))"
                          :"linear-gradient(135deg,rgba(245,158,11,0.9),rgba(251,146,60,0.8))",
                        border:"none",borderRadius:14,
                        fontFamily:E.sans,fontWeight:700,fontSize:14,
                        color:"#fff",cursor:"pointer",
                        boxShadow:onBreak
                          ?"0 4px 14px rgba(99,102,241,0.3)"
                          :"0 4px 14px rgba(245,158,11,0.3)",
                        transition:"all 0.2s"}}
                      onMouseEnter={e=>e.currentTarget.style.transform="scale(1.02)"}
                      onMouseLeave={e=>e.currentTarget.style.transform="scale(1)"}>
                      {onBreak?"▶ Resume Shift":"⏸ Start Break"}
                    </button>

                    {/* Clock Out — requires confirmation */}
                    <button
                      onClick={async()=>{
                        if(onBreak){
                          alert("You are currently on break. Please resume your shift before clocking out.");
                          return;
                        }
                        if(window.confirm(
                          "Clock out now?\n\n"+
                          "Shift time: "+fmt(secs)+"\n"+
                          "Break time: "+fmt(breakSecs)+"\n\n"+
                          "Tap OK to confirm clock-out."
                        )){
                          setClocked(false);
                          setOnBreak(false);
                          setSecs(0);
                          setBreakSecs(0);
                          setClockedAt(null);
                          try{
                            const {createClient}=await import("@supabase/supabase-js");
                            const sb=createClient(process.env.NEXT_PUBLIC_SUPABASE_URL,process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
                            await sb.from("clock_events").insert({
                              user_id:empSafe.id,org_id:empSafe.orgId||null,location_id:empSafe.locId||null,
                              event_type:"clock_out",
                              occurred_at:new Date().toISOString(),
                            });
                            setSyncMsg("✓ Clocked out");
                            setTimeout(()=>setSyncMsg(""),3000);
                          }catch(e){setSyncMsg("⚠ Sync failed — clock out recorded locally");}
                        }
                      }}
                      style={{flex:1,padding:"13px 16px",
                        background:"rgba(239,68,68,0.08)",
                        border:"1.5px solid rgba(239,68,68,0.3)",
                        borderRadius:14,
                        fontFamily:E.sans,fontWeight:700,fontSize:14,
                        color:E.red,cursor:"pointer",
                        transition:"all 0.2s"}}
                      onMouseEnter={e=>{
                        e.currentTarget.style.background="rgba(239,68,68,0.15)";
                        e.currentTarget.style.transform="scale(1.02)";
                      }}
                      onMouseLeave={e=>{
                        e.currentTarget.style.background="rgba(239,68,68,0.08)";
                        e.currentTarget.style.transform="scale(1)";
                      }}>
                      👋 Clock Out
                    </button>
                  </div>
                )}
              </div>

              {/* Break guard warning */}
              {onBreak&&(
                <div style={{marginTop:12,background:"rgba(245,158,11,0.07)",
                  border:"1px solid rgba(245,158,11,0.25)",
                  borderRadius:9,padding:"9px 13px",
                  display:"flex",gap:8,alignItems:"flex-start"}}>
                  <span style={{fontSize:14,flexShrink:0}}>⏸</span>
                  <div style={{fontFamily:E.sans,fontSize:12,color:E.yellow,lineHeight:1.5}}>
                    <strong>Shift is paused.</strong> Your break timer is running.
                    Tap <strong>Resume Shift</strong> when you're back on the floor —
                    you cannot clock out while on break.
                  </div>
                </div>
              )}

              {/* Shift summary when clocked in */}
              {clocked&&!onBreak&&secs>0&&(
                <div style={{marginTop:12,display:"flex",gap:8,flexWrap:"wrap"}}>
                  {[
                    {l:"Shift time",   v:(secs/3600).toFixed(2)+"h",          c:E.indigo},
                    {l:"Break taken",  v:(breakSecs/60).toFixed(0)+" min",     c:E.yellow},
                    {l:"Streak 🔥",    v:empSafe.streak+"d",                        c:E.green},
                  ].map(s=>(
                    <div key={s.l} style={{flex:1,background:E.bg3,borderRadius:9,
                      padding:"8px 10px",textAlign:"center",minWidth:90}}>
                      <div style={{fontFamily:E.mono,fontSize:8,
                        color:E.textF,letterSpacing:1,marginBottom:3}}>
                        {s.l.toUpperCase()}
                      </div>
                      <div style={{fontFamily:E.sans,fontWeight:700,
                        fontSize:14,color:s.c}}>{s.v}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* ── NEXT SHIFT CARD ── */}
            {(realShifts[0]||myShifts[0])&&(
              <div style={{background:E.bg2,border:"1.5px solid "+E.border,
                borderRadius:16,padding:"16px 18px",marginBottom:14,
                boxShadow:E.shadow,display:"flex",
                alignItems:"center",gap:14}}>
                <div style={{width:44,height:44,borderRadius:12,flexShrink:0,
                  background:"linear-gradient(135deg,"+E.indigo+"22,"+E.violet+"18)",
                  border:"1.5px solid rgba(99,102,241,0.2)",
                  display:"flex",alignItems:"center",justifyContent:"center",fontSize:20}}>
                  📅
                </div>
                <div style={{flex:1}}>
                  <div style={{fontFamily:E.mono,fontSize:8,color:E.textF,
                    letterSpacing:"2px",marginBottom:3}}>NEXT SHIFT</div>
                  {realShifts[0]?(
                    <div>
                      <div style={{fontFamily:E.sans,fontWeight:700,fontSize:16,
                        color:E.text,marginBottom:2}}>
                        {realShifts[0].day_of_week} · {fH(realShifts[0].start_hour)} – {fH(realShifts[0].end_hour)}
                      </div>
                      <div style={{fontFamily:E.sans,fontSize:12,color:E.textD}}>
                        {realShifts[0].end_hour-realShifts[0].start_hour} hours · {empSafe.role}
                      </div>
                    </div>
                  ):(
                    <div>
                      <div style={{fontFamily:E.sans,fontWeight:700,fontSize:16,
                        color:E.text,marginBottom:2}}>
                        {myShifts[0].d} · {fH(myShifts[0].ss[0].s)} – {fH(myShifts[0].ss[0].e)}
                      </div>
                      <div style={{fontFamily:E.sans,fontSize:12,color:E.textD}}>
                        {myShifts[0].ss[0].e-myShifts[0].ss[0].s} hours · {empSafe.role}
                      </div>
                    </div>
                  )}
                </div>
                <EBadge label="Confirmed ✓" color={E.green}/>
              </div>
            )}

            {/* ── QUICK ACTIONS ── */}
            <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",
              gap:10,marginBottom:14}}>
              {[
                {icon:"🔄",label:"Swap Shift",   go:()=>setSwapOpen(true),  c:E.violet},
                {icon:"📆",label:"Time Off",      go:()=>setToOpen(true),    c:E.teal},
                {icon:"💬",label:"Message Manager",go:()=>setTab("team"),   c:E.indigo},
              ].map(a=>(
                <button key={a.label} onClick={a.go}
                  style={{padding:"15px 10px",background:E.bg2,
                    border:"1.5px solid "+E.border,
                    borderRadius:14,cursor:"pointer",textAlign:"center",
                    transition:"all 0.2s",boxShadow:E.shadow}}
                  onMouseEnter={e=>{
                    e.currentTarget.style.borderColor=a.c+"55";
                    e.currentTarget.style.transform="translateY(-2px)";
                    e.currentTarget.style.boxShadow="0 6px 20px rgba(99,102,241,0.12)";
                  }}
                  onMouseLeave={e=>{
                    e.currentTarget.style.borderColor=E.border;
                    e.currentTarget.style.transform="none";
                    e.currentTarget.style.boxShadow=E.shadow;
                  }}>
                  <div style={{fontSize:22,marginBottom:6}}>{a.icon}</div>
                  <div style={{fontFamily:E.sans,fontWeight:600,
                    fontSize:12,color:E.text}}>{a.label}</div>
                </button>
              ))}
            </div>

            {/* ── WEEK SUMMARY ── */}
            <div style={{background:E.bg2,border:"1.5px solid "+E.border,
              borderRadius:16,padding:"18px",boxShadow:E.shadow}}>
              <div style={{fontFamily:E.sans,fontWeight:700,fontSize:15,
                color:E.text,marginBottom:12}}>
                📊 This Week at a Glance
              </div>
              <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:10,marginBottom:12}}>
                {[
                  {l:"Hours Worked",  v:empSafe.wkHrs+"h",                                         c:E.indigo},
                  {l:"Shifts This Wk",v:myShifts.length+" shifts",                             c:E.violet},
                  {l:"Streak 🔥",     v:empSafe.streak+" days",                                     c:E.green},
                ].map(s=>(
                  <div key={s.l} style={{background:E.bg3,borderRadius:12,
                    padding:"12px",textAlign:"center"}}>
                    <div style={{fontFamily:E.sans,fontSize:11,
                      color:E.textD,marginBottom:4}}>{s.l}</div>
                    <div style={{fontFamily:E.sans,fontWeight:800,
                      fontSize:18,color:s.c}}>{s.v}</div>
                  </div>
                ))}
              </div>
              {/* Shift week mini bars */}
              <div style={{display:"flex",alignItems:"flex-end",gap:5,height:40}}>
                {["Mon","Tue","Wed","Thu","Fri","Sat","Sun"].map((d,i)=>{
                  const hasShift = myShifts.find(s=>s.d===d);
                  const h = hasShift?hasShift.ss[0].e-hasShift.ss[0].s:0;
                  return(
                    <div key={d} style={{flex:1,display:"flex",
                      flexDirection:"column",alignItems:"center",gap:2,
                      height:"100%",justifyContent:"flex-end"}}>
                      <div style={{width:"100%",
                        height:h>0?(h/10*100)+"%":"4px",
                        background:h>0
                          ?"linear-gradient("+E.indigo+","+E.violet+")"
                          :"rgba(99,102,241,0.07)",
                        borderRadius:"3px 3px 0 0",minHeight:4}}/>
                      <span style={{fontFamily:E.mono,fontSize:7,
                        color:h>0?E.indigo:E.textF}}>
                        {d.slice(0,1)}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

          </div>
        )}


                {/* ── SCHEDULE (Prompt 2) ── */}
        {tab==="schedule" && (
          <div style={{animation:"fadeUp 0.3s ease"}}>
            {liveEmps!==null&&liveEmps.length===0&&(
              <div style={{textAlign:"center",padding:"40px 20px",marginBottom:20}}>
                <div style={{background:"rgba(245,158,11,0.06)",
                  border:"1px solid rgba(245,158,11,0.2)",
                  borderRadius:12,padding:"20px 24px",maxWidth:500,margin:"0 auto",
                  display:"flex",gap:14,alignItems:"flex-start",textAlign:"left"}}>
                  <span style={{fontSize:24,flexShrink:0}}>💡</span>
                  <div>
                    <div style={{fontFamily:O.sans,fontWeight:700,fontSize:14,
                      color:O.amber,marginBottom:4}}>Add employees before scheduling</div>
                    <div style={{fontFamily:O.sans,fontSize:13,color:O.textD,lineHeight:1.6}}>
                      Invite your team from the Staff tab first. Once they're added,
                      their names will appear in the schedule grid so you can assign shifts.
                    </div>
                    <button onClick={()=>setTab("staff")}
                      style={{marginTop:10,padding:"7px 16px",
                        background:"rgba(245,158,11,0.1)",
                        border:"1px solid rgba(245,158,11,0.25)",borderRadius:7,
                        fontFamily:O.mono,fontSize:9,letterSpacing:1,
                        color:O.amber,cursor:"pointer"}}>
                      GO TO STAFF →
                    </button>
                  </div>
                </div>
              </div>
            )}
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
              <div style={{fontFamily:E.sans,fontWeight:800,fontSize:20,color:E.text}}>My Schedule</div>
              <button onClick={()=>setSwapOpen(true)} style={{padding:"7px 16px",background:E.indigoD,border:`1.5px solid ${E.indigo}40`,borderRadius:20,fontFamily:E.sans,fontWeight:600,fontSize:12,color:E.indigo,cursor:"pointer"}}>
                Request Swap +
              </button>
            </div>
            {myShifts.map(({d,ss}) => (
              <div key={d} style={{background:E.bg2,border:`1.5px solid ${E.border}`,borderRadius:14,padding:"16px 18px",marginBottom:10,boxShadow:E.shadow}}>
                <div style={{fontFamily:E.sans,fontWeight:700,fontSize:12,color:E.textD,marginBottom:8,textTransform:"uppercase",letterSpacing:1}}>{d}</div>
                {ss.map((s,i) => (
                  <div key={i} style={{display:"flex",alignItems:"center",gap:12}}>
                    <div style={{width:4,height:42,background:`linear-gradient(${E.indigo},${E.violet})`,borderRadius:2}}/>
                    <div style={{flex:1}}>
                      <div style={{fontFamily:E.sans,fontWeight:700,fontSize:16,color:E.text}}>{fH(s.s)} – {fH(s.e)}</div>
                      <div style={{fontFamily:E.sans,fontSize:13,color:E.textD}}>{s.e-s.s} hours · {empSafe.role}</div>
                    </div>
                    <EBadge label="Confirmed ✓" color={E.green}/>
                  </div>
                ))}
              </div>
            ))}
            <div style={{background:E.bg2,border:`1.5px solid ${E.border}`,borderRadius:14,padding:"16px 18px",boxShadow:E.shadow}}>
              <div style={{fontFamily:E.sans,fontWeight:700,fontSize:14,color:E.text,marginBottom:10}}>Swap Requests</div>
              {SWAPS.filter(s=>s.from.includes(empSafe.first)||s.to.includes(empSafe.first)).length===0
                ? <div style={{fontFamily:E.sans,fontSize:13,color:E.textF,textAlign:"center",padding:"16px 0"}}>No swap requests</div>
                : SWAPS.filter(s=>s.from.includes(empSafe.first)||s.to.includes(empSafe.first)).map(s => (
                  <div key={s.id} style={{display:"flex",alignItems:"center",gap:12,padding:"9px 0",borderTop:`1px solid ${E.border}`}}>
                    <div style={{flex:1}}>
                      <div style={{fontFamily:E.sans,fontWeight:600,fontSize:14,color:E.text}}>{s.day} · {s.shift}</div>
                      <div style={{fontFamily:E.sans,fontSize:12,color:E.textD}}>{s.from} → {s.to}</div>
                    </div>
                    <EBadge label={s.status} color={s.status==="approved"?E.green:s.status==="denied"?E.red:E.yellow}/>
                  </div>
                ))
              }
            </div>
          </div>
        )}

        {/* ── EARNINGS (Prompt 3) ── */}
        {tab==="earnings" && (
          <div style={{animation:"fadeUp 0.3s ease"}}>

            {/* ── ZONE 1: PERFORMANCE SCORE CARD ── */}
            {(()=>{
              const score = Math.min(100,Math.max(0,Math.round(
                (empSafe.rel+empSafe.prod+empSafe.cam)/3 - (empSafe.ghost*5) - (empSafe.flags*8)
              )));
              const scoreColor = score>=85?E.green:score>=70?E.indigo:score>=55?E.yellow:E.red;
              const tier = score>=90?"Elite Performer":score>=80?"Lead Candidate":
                           score>=65?"Solid Performer":score>=50?"Developing":"New Hire";
              const tierIcon = score>=90?"🏆":score>=80?"⭐":score>=65?"💪":score>=50?"🌱":"👋";
              const encourage = score>=85
                ? "You're one of the strongest performers on your team. Keep it up!"
                : score>=70
                ? "You're improving steadily. You're "+Math.round(80-score)+" points from Lead Candidate."
                : score>=55
                ? "Great foundation. Focus on reliability and you'll level up fast."
                : "Every great career starts somewhere — keep showing up strong.";

              const gross = (empSafe.wkHrs*empSafe.rate*2).toFixed(2);

              const earnedBadges = [
                {icon:"🔥",label:"7-Day Streak",earned:empSafe.streak>=7},
                {icon:"⭐",label:"Most Reliable",earned:empSafe.rel>=90},
                {icon:"💰",label:"Payroll Accurate",earned:empSafe.ghost<0.5},
                {icon:"⏰",label:"Always On Time",earned:empSafe.rel>=90},
                {icon:"🏆",label:"Zero Flags",earned:empSafe.flags===0},
                {icon:"💪",label:"OT Warrior",earned:(empSafe.ot||0)>0},
              ];

              const lockedBadges = [
                {icon:"🔒",label:"30-Day Streak",need:"16 more shifts"},
                {icon:"🔒",label:"Lead Ready",need:"reach 95% reliability"},
                {icon:"🔒",label:"90-Day Legend",need:90-empSafe.streak+" days to go"},
              ];

              const tiers = ["New Hire","Developing","Solid Performer","Lead Candidate","Team Lead"];
              const tierIndex = score>=90?4:score>=80?3:score>=65?2:score>=50?1:0;

              const skills = [
                {label:"Food Handler",      earned:empSafe.rel>80,    icon:"🍽️"},
                {label:"Cash Handling",     earned:empSafe.cam>80,    icon:"💵"},
                {label:"First Aid",         earned:empSafe.streak>5,  icon:"🩺"},
                {label:"Forklift Cert",     earned:false,         icon:"🏗️", note:"Ask manager to schedule"},
                {label:"Manager Cert",      earned:false,         icon:"📋", note:"Eligible after Lead Candidate"},
              ];

              const trendData = [
                {w:"W1",rel:empSafe.rel-8,prod:empSafe.prod-6},
                {w:"W2",rel:empSafe.rel-5,prod:empSafe.prod-4},
                {w:"W3",rel:empSafe.rel-7,prod:empSafe.prod-3},
                {w:"W4",rel:empSafe.rel-2,prod:empSafe.prod-5},
                {w:"W5",rel:empSafe.rel-4,prod:empSafe.prod-2},
                {w:"W6",rel:empSafe.rel-1,prod:empSafe.prod-1},
                {w:"W7",rel:empSafe.rel-3,prod:empSafe.prod+1},
                {w:"Now",rel:empSafe.rel,  prod:empSafe.prod},
              ];
              const maxTrend = 100;

              const recognitions = [
                {date:"Mar 20",note:"Excellent customer service during busy Friday shift",icon:"⭐"},
                {date:"Mar 15",note:"Perfect attendance for 2nd consecutive month",icon:"🏆"},
              ];

              return (
                <div>

                  {/* Score card */}
                  <div style={{background:"linear-gradient(135deg,rgba(99,102,241,0.07),rgba(139,92,246,0.05))",
                    border:"1.5px solid rgba(99,102,241,0.18)",
                    borderRadius:20,padding:"22px 24px",marginBottom:14,
                    boxShadow:"0 4px 24px rgba(99,102,241,0.1)"}}>
                    <div style={{display:"flex",gap:20,alignItems:"flex-start",flexWrap:"wrap"}}>

                      {/* Score gauge */}
                      <div style={{flexShrink:0,textAlign:"center"}}>
                        <div style={{position:"relative",width:100,height:100,margin:"0 auto 8px"}}>
                          <svg width="100" height="100" viewBox="0 0 100 100">
                            <circle cx="50" cy="50" r="42" fill="none"
                              stroke="rgba(99,102,241,0.1)" strokeWidth="8"/>
                            <circle cx="50" cy="50" r="42" fill="none"
                              stroke={scoreColor} strokeWidth="8"
                              strokeDasharray={2*Math.PI*42}
                              strokeDashoffset={2*Math.PI*42*(1-score/100)}
                              strokeLinecap="round"
                              transform="rotate(-90 50 50)"/>
                          </svg>
                          <div style={{position:"absolute",inset:0,display:"flex",
                            flexDirection:"column",alignItems:"center",justifyContent:"center"}}>
                            <div style={{fontFamily:E.sans,fontWeight:900,fontSize:28,
                              color:scoreColor,lineHeight:1}}>{score}</div>
                            <div style={{fontFamily:E.mono,fontSize:8,
                              color:E.textF,letterSpacing:1}}>SCORE</div>
                          </div>
                        </div>
                        <div style={{fontFamily:E.sans,fontWeight:700,fontSize:12,
                          color:scoreColor}}>
                          {tierIcon} {tier}
                        </div>
                      </div>

                      {/* Metrics + streak */}
                      <div style={{flex:1,minWidth:200}}>
                        <div style={{fontFamily:E.sans,fontWeight:800,fontSize:20,
                          color:E.text,marginBottom:4}}>
                          Your Growth Dashboard 🌱
                        </div>
                        <div style={{fontFamily:E.sans,fontSize:13,color:E.textD,
                          marginBottom:12,lineHeight:1.5}}>
                          {encourage}
                        </div>

                        {/* Three metric bars */}
                        {[
                          {l:"Reliability",    v:empSafe.rel,  delta:"+3",c:E.indigo},
                          {l:"Productivity",   v:empSafe.prod, delta:"+1",c:E.violet},
                          {l:"Punctuality",     v:empSafe.rel,  delta:"+2",c:E.teal},
                        ].map(m=>(
                          <div key={m.l} style={{marginBottom:8}}>
                            <div style={{display:"flex",justifyContent:"space-between",
                              marginBottom:3}}>
                              <span style={{fontFamily:E.sans,fontSize:12,
                                color:E.textD,fontWeight:600}}>{m.l}</span>
                              <div style={{display:"flex",gap:8,alignItems:"center"}}>
                                <span style={{fontFamily:E.mono,fontSize:11,
                                  color:E.green,fontWeight:600}}>↑ {m.delta}%</span>
                                <span style={{fontFamily:E.sans,fontWeight:700,
                                  fontSize:13,color:m.c}}>{m.v}%</span>
                              </div>
                            </div>
                            <div style={{height:6,background:"rgba(99,102,241,0.08)",
                              borderRadius:3,overflow:"hidden"}}>
                              <div style={{height:"100%",width:m.v+"%",
                                background:m.c,borderRadius:3,transition:"width 1s ease"}}/>
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Streak */}
                      <div style={{flexShrink:0,textAlign:"center",
                        background:"linear-gradient(135deg,rgba(245,158,11,0.1),rgba(239,68,68,0.06))",
                        border:"1.5px solid rgba(245,158,11,0.25)",
                        borderRadius:14,padding:"16px 20px"}}>
                        <div style={{fontFamily:E.sans,fontWeight:900,
                          fontSize:42,color:E.yellow,lineHeight:1,marginBottom:2}}>
                          🔥 {empSafe.streak}
                        </div>
                        <div style={{fontFamily:E.mono,fontSize:8,
                          color:"rgba(245,158,11,0.7)",letterSpacing:1,marginBottom:4}}>
                          DAY STREAK
                        </div>
                        <div style={{fontFamily:E.sans,fontSize:11,color:E.textD}}>
                          Best: {empSafe.streak+12} days
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* ── ZONES 2 + 3: TREND CHART + BADGES ── */}
                  <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",
                    gap:12,marginBottom:14}}>

                    {/* Zone 2: Trend chart */}
                    <div style={{background:E.bg2,border:"1.5px solid "+E.border,
                      borderRadius:16,padding:"18px",boxShadow:E.shadow}}>
                      <div style={{fontFamily:E.sans,fontWeight:700,fontSize:14,
                        color:E.text,marginBottom:4}}>30-Day Trend</div>
                      <div style={{fontFamily:E.sans,fontSize:12,color:E.textD,marginBottom:14}}>
                        Your progress — compared only to yourself
                      </div>

                      {/* Line chart */}
                      <div style={{position:"relative",height:90,marginBottom:10}}>
                        <svg width="100%" height="90" viewBox="0 0 280 90"
                          preserveAspectRatio="none">
                          {/* Grid lines */}
                          {[25,50,75].map(y=>(
                            <line key={y} x1="0" y1={90-(y/100)*90}
                              x2="280" y2={90-(y/100)*90}
                              stroke="rgba(99,102,241,0.08)" strokeWidth="1"/>
                          ))}
                          {/* Reliability line */}
                          <polyline
                            points={trendData.map((d,i)=>
                              (i*(280/7)).toFixed(1)+","+(90-(d.rel/maxTrend)*80).toFixed(1)
                            ).join(" ")}
                            fill="none" stroke={E.indigo} strokeWidth="2.5"
                            strokeLinecap="round" strokeLinejoin="round"/>
                          {/* Productivity line */}
                          <polyline
                            points={trendData.map((d,i)=>
                              (i*(280/7)).toFixed(1)+","+(90-(d.prod/maxTrend)*80).toFixed(1)
                            ).join(" ")}
                            fill="none" stroke={E.violet} strokeWidth="2.5"
                            strokeLinecap="round" strokeLinejoin="round"
                            strokeDasharray="4 2"/>
                          {/* Today dot */}
                          <circle cx="280" cy={(90-(trendData[7].rel/maxTrend)*80).toFixed(1)}
                            r="5" fill={E.indigo} stroke="#fff" strokeWidth="2"/>
                          <circle cx="280" cy={(90-(trendData[7].prod/maxTrend)*80).toFixed(1)}
                            r="5" fill={E.violet} stroke="#fff" strokeWidth="2"/>
                        </svg>
                        {/* X-axis labels */}
                        <div style={{display:"flex",justifyContent:"space-between",marginTop:4}}>
                          {trendData.map(d=>(
                            <span key={d.w} style={{fontFamily:E.mono,fontSize:7,
                              color:d.w==="Now"?E.indigo:E.textF,
                              fontWeight:d.w==="Now"?700:400}}>
                              {d.w}
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* Legend + delta */}
                      <div style={{display:"flex",gap:12}}>
                        {[
                          {c:E.indigo,l:"Reliability",delta:"+"+Math.abs(trendData[7].rel-trendData[0].rel)},
                          {c:E.violet,l:"Productivity",delta:"+"+Math.abs(trendData[7].prod-trendData[0].prod),dash:true},
                        ].map(leg=>(
                          <div key={leg.l} style={{display:"flex",alignItems:"center",gap:5}}>
                            <div style={{width:14,height:3,
                              background:leg.dash?"transparent":leg.c,
                              borderTop:leg.dash?"2.5px dashed "+leg.c:"none",borderRadius:2}}/>
                            <span style={{fontFamily:E.sans,fontSize:11,color:E.textD}}>
                              {leg.l}
                            </span>
                            <span style={{fontFamily:E.sans,fontSize:11,
                              color:E.green,fontWeight:700}}>
                              {leg.delta}% this month
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Zone 3: Badges + streak */}
                    <div style={{background:E.bg2,border:"1.5px solid "+E.border,
                      borderRadius:16,padding:"18px",boxShadow:E.shadow}}>
                      <div style={{fontFamily:E.sans,fontWeight:700,fontSize:14,
                        color:E.text,marginBottom:12}}>Achievements</div>

                      {/* Earned badges */}
                      <div style={{fontFamily:E.mono,fontSize:8,color:E.textF,
                        letterSpacing:"2px",marginBottom:8}}>EARNED</div>
                      <div style={{display:"flex",gap:7,flexWrap:"wrap",marginBottom:14}}>
                        {earnedBadges.filter(b=>b.earned).map(b=>(
                          <div key={b.label}
                            style={{background:"linear-gradient(135deg,rgba(99,102,241,0.08),rgba(139,92,246,0.06))",
                              border:"1.5px solid rgba(99,102,241,0.2)",
                              borderRadius:10,padding:"8px 10px",textAlign:"center"}}>
                            <div style={{fontSize:18,marginBottom:3}}>{b.icon}</div>
                            <div style={{fontFamily:E.sans,fontSize:9,
                              color:E.indigo,fontWeight:600,lineHeight:1.2}}>{b.label}</div>
                          </div>
                        ))}
                        {earnedBadges.filter(b=>b.earned).length===0&&(
                          <div style={{fontFamily:E.sans,fontSize:12,color:E.textF,
                            padding:"8px 0"}}>
                            Keep going — your first badge is close!
                          </div>
                        )}
                      </div>

                      {/* Locked badges */}
                      <div style={{fontFamily:E.mono,fontSize:8,color:E.textF,
                        letterSpacing:"2px",marginBottom:8}}>LOCKED — EARN NEXT</div>
                      <div style={{display:"flex",flexDirection:"column",gap:6}}>
                        {lockedBadges.map(b=>(
                          <div key={b.label}
                            style={{display:"flex",alignItems:"center",gap:10,
                              padding:"8px 10px",background:"rgba(0,0,0,0.02)",
                              border:"1.5px dashed rgba(99,102,241,0.15)",
                              borderRadius:8,opacity:0.7}}>
                            <span style={{fontSize:16,flexShrink:0}}>{b.icon}</span>
                            <div style={{flex:1}}>
                              <div style={{fontFamily:E.sans,fontWeight:600,
                                fontSize:11,color:E.textD,marginBottom:1}}>{b.label}</div>
                              <div style={{fontFamily:E.mono,fontSize:8,color:E.textF}}>
                                {b.need}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* ── ZONE 4: GROWTH PATH ── */}
                  <div style={{background:"linear-gradient(135deg,rgba(99,102,241,0.06),rgba(20,184,166,0.04))",
                    border:"1.5px solid rgba(99,102,241,0.15)",
                    borderRadius:18,padding:"20px 24px",marginBottom:14,
                    boxShadow:E.shadow}}>
                    <div style={{fontFamily:E.sans,fontWeight:800,fontSize:15,
                      color:E.text,marginBottom:4}}>Your Career Path</div>
                    <div style={{fontFamily:E.sans,fontSize:12,color:E.textD,marginBottom:16}}>
                      Where you are now — and exactly what it takes to get to the next level
                    </div>

                    {/* Progress track */}
                    <div style={{display:"flex",alignItems:"center",
                      marginBottom:20,overflowX:"auto",paddingBottom:4}}>
                      {tiers.map((t,i)=>{
                        const isHere = i===tierIndex;
                        const isPast = i<tierIndex;
                        const tc = isPast?E.green:isHere?E.indigo:E.textF;
                        return(
                          <div key={t} style={{display:"flex",alignItems:"center",flex:1,minWidth:80}}>
                            <div style={{display:"flex",flexDirection:"column",
                              alignItems:"center",flex:1}}>
                              <div style={{width:isHere?32:24,height:isHere?32:24,
                                borderRadius:"50%",
                                background:isPast?E.green:isHere?E.indigo:"rgba(99,102,241,0.08)",
                                border:"2px solid "+(isPast?E.green:isHere?E.indigo:"rgba(99,102,241,0.2)"),
                                display:"flex",alignItems:"center",justifyContent:"center",
                                marginBottom:6,transition:"all 0.3s",
                                boxShadow:isHere?"0 0 16px rgba(99,102,241,0.3)":"none"}}>
                                <span style={{fontSize:isHere?14:10,color:"#fff"}}>
                                  {isPast?"✓":isHere?"★":"○"}
                                </span>
                              </div>
                              <div style={{fontFamily:E.sans,fontSize:9,
                                fontWeight:isHere?700:400,color:tc,
                                textAlign:"center",lineHeight:1.3}}>
                                {t}
                              </div>
                              {isHere&&(
                                <div style={{fontFamily:E.mono,fontSize:7,
                                  color:E.indigo,letterSpacing:1,marginTop:2}}>
                                  YOU ARE HERE
                                </div>
                              )}
                            </div>
                            {i<tiers.length-1&&(
                              <div style={{flex:1,height:2,margin:"0 4px",marginBottom:20,
                                background:isPast?E.green:"rgba(99,102,241,0.15)",
                                borderRadius:1}}/>
                            )}
                          </div>
                        );
                      })}
                    </div>

                    {/* Next level requirements */}
                    {tierIndex<4&&(
                      <div>
                        <div style={{fontFamily:E.sans,fontWeight:700,fontSize:13,
                          color:E.text,marginBottom:10}}>
                          To reach{" "}
                          <span style={{color:E.indigo}}>{tiers[tierIndex+1]}</span>:
                        </div>
                        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:12}}>
                          {[
                            {label:"Reliability ≥ 95%",
                             current:empSafe.rel+"%",
                             target:"95%",
                             pct:Math.min(100,Math.round((empSafe.rel/95)*100)),
                             met:empSafe.rel>=95},
                            {label:"Zero flags — 14 days",
                             current:empSafe.flags===0?"3 days in":"0 days",
                             target:"14 days",
                             pct:empSafe.flags===0?Math.round((3/14)*100):0,
                             met:false},
                            {label:"Attendance streak",
                             current:empSafe.streak+" days",
                             target:"90 days",
                             pct:Math.round((empSafe.streak/90)*100),
                             met:empSafe.streak>=90},
                            {label:"Manager recommendation",
                             current:"Pending",
                             target:"Required",
                             pct:0,
                             met:false},
                          ].map(req=>(
                            <div key={req.label}
                              style={{background:req.met?"rgba(16,185,129,0.07)":"rgba(99,102,241,0.04)",
                                border:"1px solid "+(req.met?"rgba(16,185,129,0.2)":"rgba(99,102,241,0.12)"),
                                borderRadius:10,padding:"10px 12px"}}>
                              <div style={{display:"flex",justifyContent:"space-between",
                                marginBottom:5}}>
                                <span style={{fontFamily:E.sans,fontSize:11,
                                  color:E.textD,fontWeight:600}}>{req.label}</span>
                                {req.met
                                  ? <span style={{color:E.green,fontSize:14}}>✅</span>
                                  : <span style={{fontFamily:E.mono,fontSize:9,
                                      color:E.indigo}}>{req.current}</span>
                                }
                              </div>
                              <div style={{height:5,background:"rgba(99,102,241,0.1)",
                                borderRadius:3,overflow:"hidden"}}>
                                <div style={{height:"100%",
                                  width:req.pct+"%",
                                  background:req.met?E.green:E.indigo,
                                  borderRadius:3,transition:"width 1s ease"}}/>
                              </div>
                            </div>
                          ))}
                        </div>
                        <div style={{background:"rgba(99,102,241,0.06)",
                          borderRadius:10,padding:"10px 14px",
                          border:"1px solid rgba(99,102,241,0.15)",
                          fontFamily:E.sans,fontSize:12,color:E.textD,
                          lineHeight:1.6}}>
                          💡 At your current pace, you could qualify for{" "}
                          <span style={{color:E.indigo,fontWeight:700}}>
                            {tiers[Math.min(tierIndex+1,4)]} review
                          </span>{" "}
                          in approximately{" "}
                          <span style={{color:E.text,fontWeight:700}}>
                            {Math.ceil((90-empSafe.streak)/5)} weeks
                          </span>.
                        </div>
                      </div>
                    )}
                  </div>

                  {/* ── ZONES 5 + 6: RECOGNITION + SKILLS ── */}
                  <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>

                    {/* Zone 5: Manager recognition */}
                    <div style={{background:E.bg2,border:"1.5px solid "+E.border,
                      borderRadius:16,padding:"18px",boxShadow:E.shadow}}>
                      <div style={{fontFamily:E.sans,fontWeight:700,fontSize:14,
                        color:E.text,marginBottom:4}}>Manager Recognition</div>
                      <div style={{fontFamily:E.sans,fontSize:12,color:E.textD,
                        marginBottom:14}}>
                        What your manager has said about your work
                      </div>
                      {recognitions.length>0?(
                        <div style={{display:"flex",flexDirection:"column",gap:8}}>
                          {recognitions.map((r,i)=>(
                            <div key={i}
                              style={{background:"linear-gradient(135deg,rgba(16,185,129,0.06),rgba(99,102,241,0.04))",
                                border:"1px solid rgba(16,185,129,0.2)",
                                borderRadius:10,padding:"11px 13px",
                                display:"flex",gap:10,alignItems:"flex-start"}}>
                              <span style={{fontSize:16,flexShrink:0}}>{r.icon}</span>
                              <div>
                                <div style={{fontFamily:E.mono,fontSize:8,
                                  color:E.textF,letterSpacing:1,marginBottom:3}}>
                                  {r.date}
                                </div>
                                <div style={{fontFamily:E.sans,fontSize:12,
                                  color:E.text,lineHeight:1.5}}>{r.note}</div>
                              </div>
                            </div>
                          ))}
                        </div>
                      ):(
                        <div style={{fontFamily:E.sans,fontSize:12,color:E.textF,
                          textAlign:"center",padding:"20px 0",lineHeight:1.6}}>
                          Keep up the great work — your manager can add recognition notes here
                          that only you can see. 💪
                        </div>
                      )}

                      {/* Compact pay summary */}
                      <div style={{marginTop:14,paddingTop:12,
                        borderTop:"1px solid "+E.border}}>
                        <div style={{fontFamily:E.mono,fontSize:8,
                          color:E.textF,letterSpacing:"2px",marginBottom:7}}>
                          CURRENT PAY PERIOD
                        </div>
                        <div style={{display:"flex",justifyContent:"space-between",
                          alignItems:"center"}}>
                          <div>
                            <div style={{fontFamily:E.sans,fontWeight:800,
                              fontSize:22,color:E.indigo}}>${gross}</div>
                            <div style={{fontFamily:E.sans,fontSize:11,color:E.textD}}>
                              {empSafe.wkHrs}h · ${empSafe.rate}/hr · Mar 18–31
                            </div>
                          </div>
                          <button style={{padding:"6px 12px",
                            background:E.indigoD,
                            border:"1px solid rgba(99,102,241,0.2)",
                            borderRadius:7,fontFamily:E.sans,fontSize:11,
                            color:E.indigo,cursor:"pointer",fontWeight:600}}>
                            Pay History →
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Zone 6: Skills */}
                    <div style={{background:E.bg2,border:"1.5px solid "+E.border,
                      borderRadius:16,padding:"18px",boxShadow:E.shadow}}>
                      <div style={{fontFamily:E.sans,fontWeight:700,fontSize:14,
                        color:E.text,marginBottom:4}}>Skills & Certifications</div>
                      <div style={{fontFamily:E.sans,fontSize:12,color:E.textD,
                        marginBottom:14}}>
                        Build your skills to unlock more opportunities
                      </div>

                      <div style={{fontFamily:E.mono,fontSize:8,color:E.textF,
                        letterSpacing:"2px",marginBottom:8}}>EARNED</div>
                      <div style={{display:"flex",flexDirection:"column",
                        gap:6,marginBottom:14}}>
                        {skills.filter(s=>s.earned).map(s=>(
                          <div key={s.label}
                            style={{display:"flex",alignItems:"center",gap:10,
                              padding:"8px 10px",
                              background:"rgba(16,185,129,0.06)",
                              border:"1px solid rgba(16,185,129,0.2)",
                              borderRadius:8}}>
                            <span style={{fontSize:16}}>{s.icon}</span>
                            <span style={{fontFamily:E.sans,fontWeight:600,
                              fontSize:12,color:E.text,flex:1}}>{s.label}</span>
                            <span style={{color:E.green,fontSize:16}}>✅</span>
                          </div>
                        ))}
                      </div>

                      <div style={{fontFamily:E.mono,fontSize:8,color:E.textF,
                        letterSpacing:"2px",marginBottom:8}}>AVAILABLE TO EARN</div>
                      <div style={{display:"flex",flexDirection:"column",gap:6}}>
                        {skills.filter(s=>!s.earned).map(s=>(
                          <div key={s.label}
                            style={{display:"flex",alignItems:"center",gap:10,
                              padding:"8px 10px",
                              background:"rgba(99,102,241,0.04)",
                              border:"1.5px dashed rgba(99,102,241,0.15)",
                              borderRadius:8,opacity:0.8}}>
                            <span style={{fontSize:16}}>{s.icon}</span>
                            <div style={{flex:1}}>
                              <div style={{fontFamily:E.sans,fontWeight:600,
                                fontSize:12,color:E.textD,marginBottom:1}}>
                                {s.label}
                              </div>
                              <div style={{fontFamily:E.sans,fontSize:11,color:E.textF}}>
                                {s.note}
                              </div>
                            </div>
                            <span style={{fontSize:14}}>🔒</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                </div>
              );
            })()}
          </div>
        )}


                {/* ── TEAM / MESSAGES (Prompt 4) ── */}
        {tab==="team" && (
          <div style={{animation:"fadeUp 0.3s ease"}}>
            <div style={{fontFamily:E.sans,fontWeight:800,fontSize:20,color:E.text,marginBottom:14}}>Team & Messages</div>
            <div style={{background:E.bg2,border:`1.5px solid ${E.border}`,borderRadius:14,padding:"18px",marginBottom:12,boxShadow:E.shadow}}>
              <div style={{fontFamily:E.sans,fontWeight:700,fontSize:15,color:E.text,marginBottom:10}}>📬 From Management</div>
              {msgs.map(m => (
                <div key={m.id} onClick={()=>{setOpenMsg(openMsg===m.id?null:m.id);setMsgs(prev=>prev.map(x=>x.id===m.id?{...x,read:true}:x));}}
                  style={{padding:"11px 12px",borderRadius:10,marginBottom:6,background:m.read?E.bg3:`${E.indigo}10`,border:`1px solid ${m.read?E.border:E.indigo+"30"}`,cursor:"pointer",transition:"all 0.15s"}}>
                  <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:openMsg===m.id?7:0}}>
                    {!m.read && <div style={{width:6,height:6,borderRadius:"50%",background:E.indigo,flexShrink:0}}/>}
                    <div style={{fontFamily:E.sans,fontWeight:m.read?500:700,fontSize:14,color:E.text,flex:1}}>{m.subject}</div>
                    <div style={{fontFamily:E.sans,fontSize:11,color:E.textF}}>{m.time}</div>
                  </div>
                  {openMsg===m.id && <div style={{fontFamily:E.sans,fontSize:13,color:E.textD,lineHeight:1.6,paddingLeft:14}}>{m.body}</div>}
                </div>
              ))}
            </div>
            <div style={{background:E.bg2,border:`1.5px solid ${E.border}`,borderRadius:14,padding:"18px",boxShadow:E.shadow}}>
              <div style={{fontFamily:E.sans,fontWeight:700,fontSize:15,color:E.text,marginBottom:12}}>👥 Team This Week</div>
              {EMPS.filter(e=>e.id!==empSafe.id).map(e => (
                <div key={e.id} style={{display:"flex",alignItems:"center",gap:12,padding:"9px 0",borderBottom:`1px solid ${E.border}`}}>
                  <Av emp={e} size={34}/>
                  <div style={{flex:1}}>
                    <div style={{fontFamily:E.sans,fontWeight:600,fontSize:14,color:E.text}}>{e.name}</div>
                    <div style={{fontFamily:E.sans,fontSize:12,color:E.textD}}>{e.role}</div>
                  </div>
                  <EBadge label={e.status} color={stC(e.status)}/>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── RECOGNITION (Prompts 5+6) ── */}
        {tab==="recognition" && (
          <div style={{animation:"fadeUp 0.3s ease"}}>
            <div style={{fontFamily:E.sans,fontWeight:800,fontSize:20,color:E.text,marginBottom:14}}>Your Achievements 🏆</div>
            <div style={{background:`linear-gradient(135deg,${scColor}18,${scColor}06)`,border:`2px solid ${scColor}40`,borderRadius:18,padding:"26px",textAlign:"center",marginBottom:14,boxShadow:`0 4px 24px ${scColor}18`}}>
              <div style={{fontSize:44,marginBottom:8}}>{empSafe.streak>=10?"⭐":empSafe.streak>=5?"🔷":"✅"}</div>
              <div style={{fontFamily:E.sans,fontWeight:800,fontSize:"clamp(16px,5vw,22px)",color:scColor,marginBottom:4}}>{sc}</div>
              <div style={{fontFamily:E.sans,fontSize:13,color:E.textD,marginBottom:16}}>Keep it up, {empSafe.first}!</div>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:10}}>
                {[["On-Time Streak",`${empSafe.streak} shifts`,scColor],["This Month",`${empSafe.shifts} shifts`,E.indigo],["Reliability",`${empSafe.rel}%`,E.violet]].map(([l,v,c]) => (
                  <div key={l} style={{background:"rgba(255,255,255,0.75)",borderRadius:10,padding:"11px"}}>
                    <div style={{fontFamily:E.sans,fontSize:11,color:E.textD,marginBottom:3}}>{l}</div>
                    <div style={{fontFamily:E.sans,fontWeight:800,fontSize:18,color:c}}>{v}</div>
                  </div>
                ))}
              </div>
            </div>
            <div style={{background:E.bg2,border:`1.5px solid ${E.border}`,borderRadius:14,padding:"18px",boxShadow:E.shadow}}>
              <div style={{fontFamily:E.sans,fontWeight:700,fontSize:14,color:E.text,marginBottom:12}}>Badges Earned</div>
              <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:10}}>
                {[
                  {icon:"🎯",label:"On Time",ok:empSafe.streak>0},
                  {icon:"💪",label:"Full Month",ok:empSafe.shifts>=15},
                  {icon:"⚡",label:"Fast Learner",ok:true},
                  {icon:"🤝",label:"Team Player",ok:empSafe.flags===0},
                  {icon:"📈",label:"Improving",ok:empSafe.prod>70},
                  {icon:"🔒",label:"Trustworthy",ok:empSafe.flags===0&&empSafe.rel>80},
                ].map(b => (
                  <div key={b.label} style={{background:b.ok?E.bg3:`${E.bg3}70`,borderRadius:10,padding:"13px",textAlign:"center",border:`1px solid ${b.ok?E.border:"transparent"}`,opacity:b.ok?1:0.4}}>
                    <div style={{fontSize:22,marginBottom:5,filter:b.ok?"none":"grayscale(1)"}}>{b.icon}</div>
                    <div style={{fontFamily:E.sans,fontWeight:600,fontSize:12,color:b.ok?E.text:E.textF}}>{b.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

      </div>

      {/* Swap Modal */}
      {swapOpen && (
        <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.4)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:300}} onClick={()=>setSwapOpen(false)}>
          <div style={{background:E.bg2,borderRadius:16,padding:"26px",width:340,animation:"fadeUp 0.2s ease",boxShadow:E.shadowB}} onClick={e=>e.stopPropagation()}>
            <div style={{fontFamily:E.sans,fontWeight:800,fontSize:18,color:E.text,marginBottom:4}}>Request Shift Swap</div>
            <div style={{fontFamily:E.sans,fontSize:13,color:E.textD,marginBottom:18}}>Your manager will review and confirm</div>
            {[
              {label:"Which shift?",el:<select style={{width:"100%",padding:"10px 12px",background:E.bg3,border:`1.5px solid ${E.border}`,borderRadius:8,fontFamily:E.sans,fontSize:13,color:E.text}}>{myShifts.map(({d,ss})=><option key={d}>{d} · {fH(ss[0].s)}–{fH(ss[0].e)}</option>)}</select>},
              {label:"Swap with?",el:<select style={{width:"100%",padding:"10px 12px",background:E.bg3,border:`1.5px solid ${E.border}`,borderRadius:8,fontFamily:E.sans,fontSize:13,color:E.text}}>{EMPS.filter(e=>e.id!==empSafe.id).map(e=><option key={e.id}>{e.name}</option>)}</select>},
              {label:"Notes (optional)",el:<input placeholder="Any details…" style={{width:"100%",padding:"10px 12px",background:E.bg3,border:`1.5px solid ${E.border}`,borderRadius:8,fontFamily:E.sans,fontSize:13,color:E.text}}/>},
            ].map(f => (
              <div key={f.label} style={{marginBottom:12}}>
                <label style={{fontFamily:E.sans,fontWeight:600,fontSize:12,color:E.textD,display:"block",marginBottom:5}}>{f.label}</label>
                {f.el}
              </div>
            ))}
            <div style={{display:"flex",gap:10,marginTop:8}}>
              <button onClick={()=>setSwapOpen(false)} style={{flex:1,padding:"10px",background:E.bg3,border:`1px solid ${E.border}`,borderRadius:8,fontFamily:E.sans,fontWeight:600,color:E.textD,cursor:"pointer"}}>Cancel</button>
              <button onClick={()=>setSwapOpen(false)} style={{flex:1,padding:"10px",background:`linear-gradient(135deg,${E.indigo},${E.violet})`,border:"none",borderRadius:8,fontFamily:E.sans,fontWeight:700,color:"#fff",cursor:"pointer"}}>Submit</button>
            </div>
          </div>
        </div>
      )}

        {/* ── MY DOCUMENTS ── */}
        {tab==="documents" && (
          <div style={{animation:"fadeUp 0.3s ease"}}>

            {/* Header */}
            <div style={{fontFamily:E.sans,fontWeight:800,fontSize:20,
              color:E.text,marginBottom:4}}>My Documents 📄</div>
            <div style={{fontFamily:E.sans,fontSize:13,color:E.textD,marginBottom:18}}>
              Your pay records, tax forms, and time history — all in one place.
            </div>

            {/* W2 Section */}
            <div style={{background:E.bg2,border:"1.5px solid "+E.border,
              borderRadius:16,padding:"20px",marginBottom:14,boxShadow:E.shadow}}>
              <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:4}}>
                <div style={{fontSize:22}}>📋</div>
                <div>
                  <div style={{fontFamily:E.sans,fontWeight:700,fontSize:15,color:E.text}}>
                    W-2 Tax Forms
                  </div>
                  <div style={{fontFamily:E.sans,fontSize:12,color:E.textD}}>
                    Uploaded by your employer via QuickBooks. Download anytime for tax filing.
                  </div>
                </div>
              </div>
              <div style={{height:"1px",background:E.border,margin:"14px 0"}}/>
              {[
                {year:"2024",status:"available",date:"Jan 31, 2025"},
                {year:"2023",status:"available",date:"Jan 31, 2024"},
                {year:"2022",status:"available",date:"Feb 1, 2023"},
              ].map((w,i)=>(
                <div key={w.year}
                  style={{display:"flex",alignItems:"center",gap:12,
                    padding:"12px 0",
                    borderBottom:i<2?"1px solid "+E.border:"none"}}>
                  <div style={{width:40,height:48,
                    background:"linear-gradient(135deg,rgba(99,102,241,0.08),rgba(139,92,246,0.06))",
                    border:"1.5px solid rgba(99,102,241,0.15)",
                    borderRadius:8,display:"flex",flexDirection:"column",
                    alignItems:"center",justifyContent:"center",flexShrink:0}}>
                    <div style={{fontFamily:E.mono,fontSize:6,
                      color:E.indigo,letterSpacing:1}}>W-2</div>
                    <div style={{fontFamily:E.sans,fontWeight:800,
                      fontSize:11,color:E.indigo}}>{w.year}</div>
                  </div>
                  <div style={{flex:1}}>
                    <div style={{fontFamily:E.sans,fontWeight:600,
                      fontSize:14,color:E.text,marginBottom:2}}>
                      W-2 Wage and Tax Statement — {w.year}
                    </div>
                    <div style={{fontFamily:E.sans,fontSize:12,color:E.textD}}>
                      Available since {w.date}
                    </div>
                  </div>
                  <div style={{display:"flex",gap:7,flexShrink:0}}>
                    <button style={{padding:"7px 14px",
                      background:"linear-gradient(135deg,"+E.indigo+","+E.violet+")",
                      border:"none",borderRadius:8,
                      fontFamily:E.sans,fontWeight:600,fontSize:12,
                      color:"#fff",cursor:"pointer",
                      boxShadow:"0 2px 10px rgba(99,102,241,0.25)"}}>
                      ↓ Download PDF
                    </button>
                  </div>
                </div>
              ))}
              <div style={{marginTop:12,padding:"10px 12px",
                background:"rgba(99,102,241,0.05)",
                border:"1px solid rgba(99,102,241,0.12)",
                borderRadius:9,display:"flex",gap:8,alignItems:"flex-start"}}>
                <span style={{flexShrink:0}}>💡</span>
                <div style={{fontFamily:E.sans,fontSize:12,color:E.textD,lineHeight:1.5}}>
                  W-2 forms are uploaded by your employer each January. If your current year
                  W-2 isn't here yet, it may still be processing — check back after January 31.
                </div>
              </div>
            </div>

            {/* Pay Stubs Archive */}
            <div style={{background:E.bg2,border:"1.5px solid "+E.border,
              borderRadius:16,padding:"20px",marginBottom:14,boxShadow:E.shadow}}>
              <div style={{display:"flex",alignItems:"center",
                justifyContent:"space-between",marginBottom:14}}>
                <div style={{display:"flex",alignItems:"center",gap:10}}>
                  <div style={{fontSize:20}}>💵</div>
                  <div style={{fontFamily:E.sans,fontWeight:700,
                    fontSize:15,color:E.text}}>Pay Stubs</div>
                </div>
                <div style={{fontFamily:E.mono,fontSize:8,color:E.textF,
                  letterSpacing:1}}>LAST 6 PAY PERIODS</div>
              </div>
              {[
                {period:"Mar 16–31, 2025", hrs:empSafe.wkHrs*2,   paid:true,  date:"Mar 31"},
                {period:"Mar 1–15, 2025",  hrs:76,             paid:true,  date:"Mar 15"},
                {period:"Feb 16–28, 2025", hrs:72,             paid:true,  date:"Feb 28"},
                {period:"Feb 1–15, 2025",  hrs:78,             paid:true,  date:"Feb 15"},
                {period:"Jan 16–31, 2025", hrs:80,             paid:true,  date:"Jan 31"},
                {period:"Jan 1–15, 2025",  hrs:74,             paid:true,  date:"Jan 15"},
              ].map((stub,i)=>(
                <div key={i}
                  style={{display:"flex",alignItems:"center",gap:12,
                    padding:"11px 0",
                    borderBottom:i<5?"1px solid "+E.border:"none"}}>
                  <div>
                    <div style={{fontFamily:E.sans,fontWeight:600,
                      fontSize:13,color:E.text,marginBottom:1}}>{stub.period}</div>
                    <div style={{fontFamily:E.mono,fontSize:10,color:E.textD}}>
                      {stub.hrs}h · Paid {stub.date}
                    </div>
                  </div>
                  <div style={{flex:1}}/>
                  <div style={{fontFamily:E.sans,fontSize:11,color:E.green,
                    background:"rgba(16,185,129,0.08)",
                    border:"1px solid rgba(16,185,129,0.2)",
                    borderRadius:5,padding:"2px 8px",fontWeight:600}}>
                    ✓ PAID
                  </div>
                  <button style={{padding:"6px 12px",
                    background:E.indigoD,
                    border:"1px solid rgba(99,102,241,0.18)",
                    borderRadius:7,fontFamily:E.sans,fontSize:11,
                    color:E.indigo,cursor:"pointer",fontWeight:600}}>
                    ↓ PDF
                  </button>
                </div>
              ))}
            </div>

            {/* Time History */}
            <div style={{background:E.bg2,border:"1.5px solid "+E.border,
              borderRadius:16,padding:"20px",marginBottom:14,boxShadow:E.shadow}}>
              <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:14}}>
                <div style={{fontSize:20}}>⏱</div>
                <div style={{fontFamily:E.sans,fontWeight:700,
                  fontSize:15,color:E.text}}>My Time Record</div>
              </div>
              <div style={{fontFamily:E.sans,fontSize:12,color:E.textD,
                marginBottom:14,lineHeight:1.5}}>
                Your personal time clock history. This is your record — keep it for your files.
              </div>
              {[
                {date:"Mon Mar 29",in:"8:02 AM",out:"4:14 PM",break:"32 min",hrs:"7.7h",status:"verified"},
                {date:"Fri Mar 28",in:"8:00 AM",out:"4:00 PM",break:"30 min",hrs:"7.5h",status:"verified"},
                {date:"Thu Mar 27",in:"8:05 AM",out:"5:12 PM",break:"30 min",hrs:"8.6h",status:"verified"},
                {date:"Wed Mar 26",in:"9:00 AM",out:"5:03 PM",break:"31 min",hrs:"7.5h",status:"verified"},
                {date:"Mon Mar 24",in:"8:01 AM",out:"4:08 PM",break:"30 min",hrs:"7.6h",status:"verified"},
              ].map((row,i)=>(
                <div key={i}
                  style={{display:"grid",
                    gridTemplateColumns:"90px 60px 60px 55px 42px 70px",
                    gap:6,padding:"9px 0",
                    borderBottom:i<4?"1px solid "+E.border:"none",
                    alignItems:"center"}}>
                  <div style={{fontFamily:E.sans,fontSize:11,
                    color:E.text,fontWeight:600}}>{row.date}</div>
                  <div>
                    <div style={{fontFamily:E.mono,fontSize:8,color:E.textF,marginBottom:1}}>IN</div>
                    <div style={{fontFamily:E.mono,fontSize:10,color:E.green}}>{row.in}</div>
                  </div>
                  <div>
                    <div style={{fontFamily:E.mono,fontSize:8,color:E.textF,marginBottom:1}}>OUT</div>
                    <div style={{fontFamily:E.mono,fontSize:10,color:E.red}}>{row.out}</div>
                  </div>
                  <div>
                    <div style={{fontFamily:E.mono,fontSize:8,color:E.textF,marginBottom:1}}>BREAK</div>
                    <div style={{fontFamily:E.mono,fontSize:10,color:E.yellow}}>{row.break}</div>
                  </div>
                  <div style={{fontFamily:E.sans,fontWeight:700,
                    fontSize:12,color:E.indigo}}>{row.hrs}</div>
                  <div style={{fontFamily:E.mono,fontSize:8,color:E.green,
                    background:"rgba(16,185,129,0.08)",
                    border:"1px solid rgba(16,185,129,0.15)",
                    borderRadius:4,padding:"2px 6px",letterSpacing:0.5,
                    textAlign:"center"}}>
                    ✓ {row.status.toUpperCase()}
                  </div>
                </div>
              ))}
              <button style={{marginTop:12,width:"100%",padding:"10px",
                background:E.indigoD,
                border:"1.5px solid rgba(99,102,241,0.18)",borderRadius:10,
                fontFamily:E.sans,fontWeight:600,fontSize:13,
                color:E.indigo,cursor:"pointer"}}>
                Export Full Time History (CSV)
              </button>
            </div>

            {/* Other Tax Docs */}
            <div style={{background:E.bg2,border:"1.5px solid "+E.border,
              borderRadius:16,padding:"20px",boxShadow:E.shadow}}>
              <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:14}}>
                <div style={{fontSize:20}}>📁</div>
                <div style={{fontFamily:E.sans,fontWeight:700,
                  fontSize:15,color:E.text}}>Other Tax Documents</div>
              </div>
              {[
                {icon:"📋",label:"Direct Deposit Authorization",sub:"On file",action:"View"},
                {icon:"📝",label:"I-9 Employment Eligibility",sub:"Verified on file",action:"View"},
                {icon:"📑",label:"Federal W-4 Withholding",sub:"Current on file",action:"Update"},
                {icon:"🏛️",label:"State Tax Withholding",sub:"OR — Current on file",action:"Update"},
              ].map((doc,i)=>(
                <div key={i}
                  style={{display:"flex",alignItems:"center",gap:10,
                    padding:"11px 0",
                    borderBottom:i<3?"1px solid "+E.border:"none"}}>
                  <span style={{fontSize:18,flexShrink:0}}>{doc.icon}</span>
                  <div style={{flex:1}}>
                    <div style={{fontFamily:E.sans,fontWeight:600,
                      fontSize:13,color:E.text,marginBottom:1}}>{doc.label}</div>
                    <div style={{fontFamily:E.sans,fontSize:11,color:E.textD}}>
                      {doc.sub}
                    </div>
                  </div>
                  <button style={{padding:"6px 12px",
                    background:doc.action==="Update"?E.indigoD:"rgba(16,185,129,0.08)",
                    border:"1px solid "+(doc.action==="Update"?"rgba(99,102,241,0.18)":"rgba(16,185,129,0.2)"),
                    borderRadius:7,fontFamily:E.sans,fontSize:11,fontWeight:600,
                    color:doc.action==="Update"?E.indigo:E.green,cursor:"pointer"}}>
                    {doc.action}
                  </button>
                </div>
              ))}
              <div style={{marginTop:14,padding:"10px 12px",
                background:"rgba(99,102,241,0.04)",
                border:"1px solid rgba(99,102,241,0.1)",
                borderRadius:9,fontFamily:E.sans,fontSize:12,
                color:E.textD,lineHeight:1.6}}>
                📞 Need a document you don't see here? Contact your manager or HR administrator
                to request it be added to your profile.
              </div>
            </div>

          </div>
        )}


      {/* Time Off Modal */}
      {toOpen && (
        <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.4)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:300}} onClick={()=>setToOpen(false)}>
          <div style={{background:E.bg2,borderRadius:16,padding:"26px",width:340,animation:"fadeUp 0.2s ease",boxShadow:E.shadowB}} onClick={e=>e.stopPropagation()}>
            <div style={{fontFamily:E.sans,fontWeight:800,fontSize:18,color:E.text,marginBottom:16}}>Request Time Off</div>
            <div style={{marginBottom:12}}>
              <label style={{fontFamily:E.sans,fontWeight:600,fontSize:12,color:E.textD,display:"block",marginBottom:5}}>Dates</label>
              <input type="date" style={{width:"100%",padding:"10px 12px",background:E.bg3,border:`1.5px solid ${E.border}`,borderRadius:8,fontFamily:E.sans,fontSize:13,color:E.text}}/>
            </div>
            <div style={{marginBottom:16}}>
              <label style={{fontFamily:E.sans,fontWeight:600,fontSize:12,color:E.textD,display:"block",marginBottom:5}}>Reason</label>
              <input placeholder="Personal, Medical, Vacation…" style={{width:"100%",padding:"10px 12px",background:E.bg3,border:`1.5px solid ${E.border}`,borderRadius:8,fontFamily:E.sans,fontSize:13,color:E.text}}/>
            </div>
            <div style={{display:"flex",gap:10}}>
              <button onClick={()=>setToOpen(false)} style={{flex:1,padding:"10px",background:E.bg3,border:`1px solid ${E.border}`,borderRadius:8,fontFamily:E.sans,fontWeight:600,color:E.textD,cursor:"pointer"}}>Cancel</button>
              <button onClick={()=>setToOpen(false)} style={{flex:1,padding:"10px",background:`linear-gradient(135deg,${E.teal},${E.indigo})`,border:"none",borderRadius:8,fontFamily:E.sans,fontWeight:700,color:"#fff",cursor:"pointer"}}>Submit</button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

// ══════════════════════════════════════════════════
//  OWNER COMMAND  (Prompts 7–14)
// ══════════════════════════════════════════════════
function OwnerCmd({onLogout}){
  const [tab,setTab] = useState("command");
  const [selEmp,setSelEmp] = useState(null);
  const [filter,setFilter] = useState("all");
  const [activeLoc,setActiveLoc] = useState(1);
  const [now,setNow] = useState(new Date());
  const [aConfig,setAConfig] = useState({ghost:true,camMiss:true,voids:true,late:true,noShow:true,zone:false});
  const [camFeeds,setCamFeeds] = useState([
    {id:1,name:"Front Entrance",zone:"Entrance",status:"live",url:"",connected:false},
    {id:2,name:"Register 1",zone:"POS",status:"live",url:"",connected:false},
    {id:3,name:"Stock Room",zone:"Back of House",status:"offline",url:"",connected:false},
    {id:4,name:"Parking Lot",zone:"Exterior",status:"live",url:"",connected:false},
  ]);
  const [addingCam,setAddingCam] = useState(false);
  const [newCam,setNewCam] = useState({name:"",zone:"",url:""});
  const [expandedRow,setExpandedRow] = useState(null);
  const [showResolved,setShowResolved] = useState(false);
  const [feedPaused,setFeedPaused] = useState(false);
  const [feedSearch,setFeedSearch] = useState("");
  const [expandedFeed,setExpandedFeed] = useState(null);
  const [roiPeriod,setRoiPeriod] = useState("month");
  const [payPeriod,setPayPeriod] = useState("biweekly");
  const [expandedEmp,setExpandedEmp] = useState(null);
  const [resolvedDisc,setResolvedDisc] = useState({});
  const [locEditMode,setLocEditMode] = useState(false);
  const [reqFilter,setReqFilter] = useState("all");
  const [empPerms,setEmpPerms] = useState({1:"employee",2:"employee",3:"employee",4:"employee",5:"employee"});
  const [permConfirm,setPermConfirm] = useState(null);
  const [permTarget,setPermTarget] = useState(null);
  const [liveEmps,setLiveEmps]           = useState(null);
  const [ownerOrgs,setOwnerOrgs]         = useState([]);
  const [activeOrg,setActiveOrg]         = useState(null);
  const [orgSwitcherOpen,setOrgSwitcherOpen] = useState(false);
  const [addOrgOpen,setAddOrgOpen]       = useState(false);
  const [addOrgBusy,setAddOrgBusy]       = useState(false);
  const [addOrgErr,setAddOrgErr]         = useState("");
  const [addOrgForm,setAddOrgForm]       = useState({name:"",type:"Restaurant",address:"",empCount:"1-5"});
  const [liveLocations,setLiveLocations]   = useState([]);
  const [activeLocation,setActiveLocation] = useState(null);
  const [locSwitcherOpen,setLocSwitcherOpen] = useState(false);
  const [addLocOpen,setAddLocOpen]         = useState(false);
  const [addLocBusy,setAddLocBusy]         = useState(false);
  const [addLocErr,setAddLocErr]           = useState("");
  const [addLocForm,setAddLocForm]         = useState({name:"",address:"",timezone:"America/Los_Angeles"});
  const [showInvite,setShowInvite] = useState(false);
  const [inviteForm,setInviteForm] = useState({firstName:"",lastName:"",email:"",role:"",dept:"Front End",rate:"15",locId:1});
  const [inviteBusy,setInviteBusy] = useState(false);
  const [inviteDone,setInviteDone] = useState("");
  const [inviteErr,setInviteErr] = useState("");
  const [ownerSetup,setOwnerSetup] = useState(false);
  const [setupForm,setSetupForm] = useState({bizName:"",firstName:"",lastName:"",locName:"",locAddr:"",empCount:"1-10"});
  const [setupBusy,setSetupBusy] = useState(false);
  const [setupErr,setSetupErr] = useState("");
  const [syncMsg,setSyncMsg] = useState("");
  const [reqHistory,setReqHistory] = useState([]);
  const [camLocation,setCamLocation] = useState(1);
  const [camGridSize,setCamGridSize] = useState(2);
  const [selectedCam,setSelectedCam] = useState(null);
  const [camFilter,setCamFilter] = useState("all");
  const [schedWeek,setSchedWeek] = useState("Mar 24–30");
  const [schedView,setSchedView] = useState("week");
  const [schedStatus,setSchedStatus] = useState("draft");
  const [selectedCell,setSelectedCell] = useState(null);
  const [schedPublished,setSchedPublished] = useState(false);
  const [staffSearch,setStaffSearch] = useState("");
  const [staffView,setStaffView] = useState("table");
  const [staffSort,setStaffSort] = useState("value");
  const [staffFilter,setStaffFilter] = useState("all");
  const [benchPeriod,setBenchPeriod] = useState("month");
  const [benchIndustry,setBenchIndustry] = useState("retail");
  const [alertFilter,setAlertFilter] = useState("all");
  const [notifConfig,setNotifConfig] = useState({push:true,sms:true,email:true,quietHours:true});
  const [customRules,setCustomRules] = useState([
    {id:1,name:"High Ghost Hour Warning",active:true,condition:"Ghost Hours > 2h AND Camera < 80%",action:"Alert Owner via Push+SMS",sev:"critical",lastTriggered:"14:28"},
    {id:2,name:"Register Void Pattern",active:true,condition:"Voids > 3 in single shift",action:"Alert Owner via Push",sev:"warning",lastTriggered:"Yesterday"},
    {id:3,name:"OT Early Warning",active:false,condition:"Weekly hours > 38h",action:"Alert Manager via Email",sev:"info",lastTriggered:"Never"},
  ]);
  const [alerts,setAlerts] = useState([
    {id:1,sev:"critical",msg:"Ghost hours exceeded — Marcus B.",detail:"7.3h unverified this week",time:"Now",seen:false,eId:5},
    {id:2,sev:"critical",msg:"Payroll mismatch — Carlos R.",detail:"4.1h camera discrepancy",time:"14:28",seen:false,eId:3},
    {id:3,sev:"warning",msg:"Register void pattern — Priya K.",detail:"3 voids this week",time:"14:21",seen:true,eId:2},
    {id:4,sev:"warning",msg:"Restricted zone entry",detail:"Unauthorized area access",time:"13:55",seen:true,eId:null},
    {id:5,sev:"info",msg:"Productivity peak — Jordan M.",detail:"Highest throughput this month",time:"12:03",seen:true,eId:1},
  ]);

  const [ownerProfile,setOwnerProfile] = useState(null);
  const [ownerOrg,setOwnerOrg]         = useState(null);
  const [liveShifts,setLiveShifts]     = useState(null);
  const [livePayroll,setLivePayroll]   = useState(null);
  const [broadcastOpen,setBroadcastOpen] = useState(false);
  const [broadcastForm,setBroadcastForm] = useState({subject:"",body:""});
  const [broadcastBusy,setBroadcastBusy] = useState(false);
  const [broadcastDone,setBroadcastDone] = useState("");
  const [waitlistForm,setWaitlistForm]   = useState({name:"",email:"",biz:""});
  const [waitlistDone,setWaitlistDone]   = useState(false);

  useEffect(()=>{
    const t = setInterval(()=>setNow(new Date()),1000);
    return ()=>clearInterval(t);
  },[]);

  // Load real owner profile + ALL orgs + employees on mount
  useEffect(()=>{
    const mapEmp = e => ({
      id:e.id,
      name:e.first_name+" "+e.last_name,
      first:e.first_name,
      role:e.role||"Employee",
      dept:e.department||"",
      rate:parseFloat(e.hourly_rate)||15,
      avatar:e.avatar_initials||(e.first_name[0]+(e.last_name||"")[0]||"?").toUpperCase(),
      color:e.avatar_color||"#6366f1",
      email:e.email||"",
      status:e.status==="active"?"active":"invited",
      hired:e.hire_date||"",
      wkHrs:0,moHrs:0,ot:0,cam:85,prod:80,rel:85,
      flags:0,streak:0,shifts:0,risk:"Low",ghost:0,
      orgId:e.org_id,locId:e.location_id,appRole:e.app_role,pin:e.pin||"",
    });
    const load = async() => {
      try{
        const {createClient} = await import("@supabase/supabase-js");
        const sb = createClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL,
          process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
        );
        const {data:{session}} = await sb.auth.getSession();
        if(!session) return;
        // Load user profile
        const {data:profile} = await sb.from("users")
          .select("*").eq("id",session.user.id).single();
        if(profile){
          setOwnerProfile(profile);
          // Load ALL orgs this owner manages via junction table
          const {data:ooRows} = await sb.from("owner_organizations")
            .select("*, organizations(*)")
            .eq("owner_id",session.user.id)
            .order("created_at");
          let orgs = [];
          if(ooRows&&ooRows.length>0){
            orgs = ooRows.map(r=>r.organizations).filter(Boolean);
            setOwnerOrgs(orgs);
          } else if(profile.org_id){
            // Fallback: just load from profile.org_id if junction table empty
            const {data:org} = await sb.from("organizations")
              .select("*").eq("id",profile.org_id).single();
            if(org){ orgs=[org]; setOwnerOrgs([org]); }
          }
          // Set active org (default to profile.org_id or first org)
          const defaultOrg = orgs.find(o=>o.id===profile.org_id)||orgs[0]||null;
          if(defaultOrg){
            setActiveOrg(defaultOrg);
            setOwnerOrg(defaultOrg);
            // Load employees for active org
            const {data:emps} = await sb.from("users")
              .select("*")
              .eq("org_id",defaultOrg.id)
              .in("status",["active","invited"])
              .in("app_role",["employee","supervisor"])
              .order("first_name");
            // Load all locations for this org
            const {data:locs}=await sb.from("locations")
              .select("*").eq("org_id",defaultOrg.id).eq("active",true).order("created_at");
            if(locs&&locs.length>0){
              setLiveLocations(locs);
              setActiveLocation(locs[0]);
            }
            setLiveEmps(emps&&emps.length>0 ? emps.map(mapEmp) : []);
          } else {
            setLiveEmps([]);
          }
        }
      }catch(e){
        console.error("Owner load error:",e);
        setLiveEmps([]);
      }
    };
    load();
    const fallback = setTimeout(()=>{
      setLiveEmps(prev => prev === null ? [] : prev);
    }, 4000);
    return () => clearTimeout(fallback);
  },[]);

  // ── Load shifts for a week ──
  const loadShifts = async(orgId, weekStr, locId) => {
    try{
      const {createClient}=await import("@supabase/supabase-js");
      const sb=createClient(process.env.NEXT_PUBLIC_SUPABASE_URL,process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
      let q=sb.from("shifts")
        .select("*, users(first_name,last_name,avatar_initials,avatar_color,role)")
        .eq("org_id",orgId).eq("week_start",weekStr).order("start_hour");
      if(locId) q=q.eq("location_id",locId);
      const {data:shifts}=await q;
      setLiveShifts(shifts||[]);
    }catch(e){ setLiveShifts([]); }
  };

  const loadEmployeesForLocation = async(orgId, locationId) => {
    try{
      const {createClient}=await import("@supabase/supabase-js");
      const sb=createClient(process.env.NEXT_PUBLIC_SUPABASE_URL,process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
      const mapE=e=>({
        id:e.id,name:e.first_name+" "+e.last_name,first:e.first_name,
        role:e.role||"Employee",dept:e.department||"",
        rate:parseFloat(e.hourly_rate)||15,
        avatar:e.avatar_initials||(e.first_name[0]+(e.last_name||"")[0]||"?").toUpperCase(),
        color:e.avatar_color||"#6366f1",email:e.email||"",
        status:e.status==="active"?"active":"invited",hired:e.hire_date||"",
        wkHrs:0,moHrs:0,ot:0,cam:85,prod:80,rel:85,flags:0,streak:0,
        shifts:0,risk:"Low",ghost:0,orgId:e.org_id,locId:e.location_id,
        appRole:e.app_role,pin:e.pin||"",
      });
      let q=sb.from("users").select("*").eq("org_id",orgId)
        .in("status",["active","invited"])
        .in("app_role",["employee","supervisor"]).order("first_name");
      if(locationId) q=q.eq("location_id",locationId);
      const {data:emps}=await q;
      setLiveEmps(emps&&emps.length>0?emps.map(mapE):[]);
    }catch(e){ setLiveEmps([]); }
  };

  const addShift = async(sd) => {
    try{
      const {createClient}=await import("@supabase/supabase-js");
      const sb=createClient(process.env.NEXT_PUBLIC_SUPABASE_URL,process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
      await sb.from("shifts").insert({
        org_id:ownerProfile?.org_id, location_id:activeLocation?.id||ownerProfile?.location_id,
        user_id:sd.userId, week_start:sd.weekStart, day_of_week:sd.day,
        shift_date:sd.date, start_hour:sd.start, end_hour:sd.end,
        role_label:sd.role||"", status:"scheduled", created_by:ownerProfile?.id,
      });
      if(ownerProfile?.org_id) await loadShifts(ownerProfile.org_id,sd.weekStart,activeLocation?.id||null);
    }catch(e){}
  };

  const removeShift = async(shiftId, weekStart) => {
    try{
      const {createClient}=await import("@supabase/supabase-js");
      const sb=createClient(process.env.NEXT_PUBLIC_SUPABASE_URL,process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
      await sb.from("shifts").delete().eq("id",shiftId);
      if(ownerProfile?.org_id) await loadShifts(ownerProfile.org_id,weekStart,activeLocation?.id||null);
    }catch(e){}
  };

  const publishSchedule = async(weekStart) => {
    try{
      const {createClient}=await import("@supabase/supabase-js");
      const sb=createClient(process.env.NEXT_PUBLIC_SUPABASE_URL,process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
      await sb.from("shifts").update({status:"published"})
        .eq("org_id",ownerProfile?.org_id).eq("week_start",weekStart);
      setSchedPublished(true);
      if(ownerProfile?.org_id) await loadShifts(ownerProfile.org_id,weekStart,activeLocation?.id||null);
    }catch(e){}
  };

  const getMonday = (d=new Date()) => {
    const day=d.getDay(), diff=d.getDate()-day+(day===0?-6:1);
    return new Date(new Date(d).setDate(diff)).toISOString().split("T")[0];
  };

  const unseen = alerts.filter(a=>!a.seen).length;
  const STAFF_DATA = liveEmps||EMPS;
  const totalGhost = STAFF_DATA.reduce((s,e)=>s+(e.ghost||0),0);
  const ghostCost = STAFF_DATA.reduce((s,e)=>s+(e.ghost||0)*(e.rate||15),0).toFixed(2);
  const sc = s => ({critical:O.red,warning:O.amber,info:O.blue})[s]||O.textD;

  const TABS = [
    {id:"command",  l:"⚡ Command"},
    {id:"staff",    l:"👥 Staff"},
    {id:"schedule", l:"📅 Schedule"},
    {id:"roi",      l:"💵 Payroll"},
    {id:"cameras",  l:"📷 Cameras"},
  ];

  const goProfile = (id) => { setSelEmp(id); setTab("intelligence"); };

  return (
    <div style={{minHeight:"100vh",background:O.bg,fontFamily:O.sans,color:O.text}}>

      {/* ── ADD LOCATION MODAL ── */}
      {addLocOpen&&(
        <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.85)",
          zIndex:600,display:"flex",alignItems:"center",justifyContent:"center",
          padding:"20px",backdropFilter:"blur(10px)"}}
          onClick={e=>{if(e.target===e.currentTarget){setAddLocOpen(false);setAddLocErr("");}}}>
          <div style={{background:"rgba(9,14,26,0.98)",border:"1px solid rgba(6,182,212,0.3)",
            borderRadius:16,padding:"28px",width:"100%",maxWidth:440,
            boxShadow:"0 20px 60px rgba(0,0,0,0.6)"}}>
            <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:20}}>
              <div>
                <div style={{fontFamily:O.mono,fontSize:8,color:"#06b6d4",letterSpacing:"2px",marginBottom:4}}>
                  ADD LOCATION
                </div>
                <div style={{fontFamily:O.sans,fontWeight:700,fontSize:18,color:"#fff"}}>
                  New Physical Location
                </div>
              </div>
              <button onClick={()=>{setAddLocOpen(false);setAddLocErr("");}}
                style={{background:"none",border:"none",color:O.textF,fontSize:22,cursor:"pointer"}}>x</button>
            </div>
            <div style={{background:"rgba(6,182,212,0.06)",border:"1px solid rgba(6,182,212,0.15)",
              borderRadius:8,padding:"10px 14px",marginBottom:20,
              display:"flex",alignItems:"center",gap:10}}>
              <span style={{fontSize:16}}>🏢</span>
              <div style={{fontFamily:O.sans,fontSize:12,color:O.textD,lineHeight:1.5}}>
                Adding location to{" "}
                <strong style={{color:"#fff"}}>{activeOrg?.name||ownerOrg?.name}</strong>.
                Each location has its own team, schedule, and payroll.
              </div>
            </div>
            <div style={{marginBottom:12}}>
              <div style={{fontFamily:O.mono,fontSize:8,color:O.textF,letterSpacing:"2px",marginBottom:5}}>
                LOCATION NAME *
              </div>
              <input value={addLocForm.name}
                onChange={e=>setAddLocForm(p=>({...p,name:e.target.value}))}
                placeholder="Main Bar, Patio, Warehouse, Downtown..."
                style={{width:"100%",padding:"10px 12px",background:"rgba(255,255,255,0.05)",
                  border:"1px solid rgba(6,182,212,0.2)",borderRadius:7,fontFamily:O.mono,
                  fontSize:12,color:"#fff",outline:"none",boxSizing:"border-box"}}/>
            </div>
            <div style={{marginBottom:12}}>
              <div style={{fontFamily:O.mono,fontSize:8,color:O.textF,letterSpacing:"2px",marginBottom:5}}>
                STREET ADDRESS
              </div>
              <input value={addLocForm.address}
                onChange={e=>setAddLocForm(p=>({...p,address:e.target.value}))}
                placeholder="123 Main St, Newport, OR 97365"
                style={{width:"100%",padding:"10px 12px",background:"rgba(255,255,255,0.05)",
                  border:"1px solid rgba(6,182,212,0.2)",borderRadius:7,fontFamily:O.mono,
                  fontSize:12,color:"#fff",outline:"none",boxSizing:"border-box"}}/>
            </div>
            <div style={{marginBottom:20}}>
              <div style={{fontFamily:O.mono,fontSize:8,color:O.textF,letterSpacing:"2px",marginBottom:5}}>
                TIMEZONE
              </div>
              <select value={addLocForm.timezone}
                onChange={e=>setAddLocForm(p=>({...p,timezone:e.target.value}))}
                style={{width:"100%",padding:"10px 12px",background:"rgba(9,14,26,0.9)",
                  border:"1px solid rgba(6,182,212,0.2)",borderRadius:7,fontFamily:O.mono,
                  fontSize:11,color:"#fff",outline:"none",cursor:"pointer",boxSizing:"border-box"}}>
                {[
                  ["America/Los_Angeles","Pacific Time (PT)"],
                  ["America/Denver","Mountain Time (MT)"],
                  ["America/Chicago","Central Time (CT)"],
                  ["America/New_York","Eastern Time (ET)"],
                  ["America/Anchorage","Alaska Time (AKT)"],
                  ["Pacific/Honolulu","Hawaii Time (HST)"],
                ].map(([val,label])=>(
                  <option key={val} value={val} style={{background:"#0d1623"}}>{label}</option>
                ))}
              </select>
            </div>
            {addLocErr&&(
              <div style={{fontFamily:O.mono,fontSize:9,color:O.red,marginBottom:12,
                padding:"7px 10px",background:"rgba(239,68,68,0.07)",
                border:"1px solid rgba(239,68,68,0.2)",borderRadius:6}}>{addLocErr}</div>
            )}
            <button
              onClick={async()=>{
                if(!addLocForm.name){setAddLocErr("Location name is required.");return;}
                setAddLocBusy(true);setAddLocErr("");
                try{
                  const {createClient}=await import("@supabase/supabase-js");
                  const sb=createClient(process.env.NEXT_PUBLIC_SUPABASE_URL,process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
                  const orgId=activeOrg?.id||ownerProfile?.org_id;
                  const {data:newLoc,error:locErr}=await sb.from("locations")
                    .insert({org_id:orgId,name:addLocForm.name,
                      address:addLocForm.address||"",timezone:addLocForm.timezone,active:true})
                    .select().single();
                  if(locErr) throw locErr;
                  setLiveLocations(prev=>[...prev,newLoc]);
                  setActiveLocation(newLoc);
                  setLiveEmps([]);setLiveShifts(null);setLivePayroll(null);
                  setAddLocOpen(false);
                  setAddLocForm({name:"",address:"",timezone:"America/Los_Angeles"});
                  setTab("staff");
                }catch(err){
                  setAddLocErr(err.message||"Failed to create location.");
                }finally{setAddLocBusy(false);}
              }}
              style={{width:"100%",padding:"13px",
                background:addLocBusy?"rgba(6,182,212,0.4)":"linear-gradient(135deg,#06b6d4,#0891b2)",
                border:"none",borderRadius:9,fontFamily:O.sans,fontWeight:700,fontSize:14,
                color:"#fff",cursor:addLocBusy?"not-allowed":"pointer",
                boxShadow:"0 4px 18px rgba(6,182,212,0.3)"}}>
              {addLocBusy?"Creating location...":"Create Location and Switch"}
            </button>
          </div>
        </div>
      )}

      {/* ── ADD COMPANY MODAL ── */}
      {addOrgOpen&&(
        <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.85)",
          zIndex:600,display:"flex",alignItems:"center",justifyContent:"center",
          padding:"20px",backdropFilter:"blur(10px)"}}
          onClick={e=>{if(e.target===e.currentTarget){setAddOrgOpen(false);setAddOrgErr("");}}}>
          <div style={{background:"rgba(9,14,26,0.98)",border:"1px solid rgba(16,185,129,0.3)",
            borderRadius:16,padding:"28px",width:"100%",maxWidth:440,
            boxShadow:"0 20px 60px rgba(0,0,0,0.6)"}}>
            <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:20}}>
              <div>
                <div style={{fontFamily:O.mono,fontSize:8,color:O.green,letterSpacing:"2px",marginBottom:4}}>
                  ADD COMPANY
                </div>
                <div style={{fontFamily:O.sans,fontWeight:700,fontSize:18,color:"#fff"}}>
                  New Business Location
                </div>
              </div>
              <button onClick={()=>{setAddOrgOpen(false);setAddOrgErr("");}}
                style={{background:"none",border:"none",color:O.textF,fontSize:22,cursor:"pointer"}}>x</button>
            </div>
            <div style={{background:"rgba(16,185,129,0.06)",border:"1px solid rgba(16,185,129,0.2)",
              borderRadius:8,padding:"10px 14px",marginBottom:20,
              display:"flex",alignItems:"center",gap:10}}>
              <span style={{fontSize:16}}>💡</span>
              <div style={{fontFamily:O.sans,fontSize:12,color:O.textD,lineHeight:1.5}}>
                Each additional company is{" "}
                <strong style={{color:O.green}}>$19.99/mo</strong> added to your plan.
                Manage unlimited businesses from one login.
              </div>
            </div>
            <div style={{marginBottom:12}}>
              <div style={{fontFamily:O.mono,fontSize:8,color:O.textF,letterSpacing:"2px",marginBottom:5}}>
                BUSINESS NAME
              </div>
              <input value={addOrgForm.name}
                onChange={e=>setAddOrgForm(p=>({...p,name:e.target.value}))}
                placeholder="Newport Coffee Roasters"
                style={{width:"100%",padding:"10px 12px",background:"rgba(255,255,255,0.05)",
                  border:"1px solid rgba(16,185,129,0.2)",borderRadius:7,fontFamily:O.mono,
                  fontSize:12,color:"#fff",outline:"none",boxSizing:"border-box"}}/>
            </div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:12}}>
              <div>
                <div style={{fontFamily:O.mono,fontSize:8,color:O.textF,letterSpacing:"2px",marginBottom:5}}>
                  BUSINESS TYPE
                </div>
                <select value={addOrgForm.type}
                  onChange={e=>setAddOrgForm(p=>({...p,type:e.target.value}))}
                  style={{width:"100%",padding:"10px 12px",background:"rgba(9,14,26,0.9)",
                    border:"1px solid rgba(16,185,129,0.2)",borderRadius:7,fontFamily:O.mono,
                    fontSize:11,color:"#fff",outline:"none",cursor:"pointer",boxSizing:"border-box"}}>
                  {["Restaurant","Bar","Retail","Hotel","Healthcare","Service","Other"].map(t=>(
                    <option key={t} value={t} style={{background:"#0d1623"}}>{t}</option>
                  ))}
                </select>
              </div>
              <div>
                <div style={{fontFamily:O.mono,fontSize:8,color:O.textF,letterSpacing:"2px",marginBottom:5}}>
                  TEAM SIZE
                </div>
                <select value={addOrgForm.empCount}
                  onChange={e=>setAddOrgForm(p=>({...p,empCount:e.target.value}))}
                  style={{width:"100%",padding:"10px 12px",background:"rgba(9,14,26,0.9)",
                    border:"1px solid rgba(16,185,129,0.2)",borderRadius:7,fontFamily:O.mono,
                    fontSize:11,color:"#fff",outline:"none",cursor:"pointer",boxSizing:"border-box"}}>
                  {["1-5","6-15","16-30","31-50","50+"].map(t=>(
                    <option key={t} value={t} style={{background:"#0d1623"}}>{t}</option>
                  ))}
                </select>
              </div>
            </div>
            <div style={{marginBottom:20}}>
              <div style={{fontFamily:O.mono,fontSize:8,color:O.textF,letterSpacing:"2px",marginBottom:5}}>
                ADDRESS
              </div>
              <input value={addOrgForm.address}
                onChange={e=>setAddOrgForm(p=>({...p,address:e.target.value}))}
                placeholder="456 Harbor St, Newport, OR 97365"
                style={{width:"100%",padding:"10px 12px",background:"rgba(255,255,255,0.05)",
                  border:"1px solid rgba(16,185,129,0.2)",borderRadius:7,fontFamily:O.mono,
                  fontSize:12,color:"#fff",outline:"none",boxSizing:"border-box"}}/>
            </div>
            {addOrgErr&&(
              <div style={{fontFamily:O.mono,fontSize:9,color:O.red,marginBottom:12,
                padding:"7px 10px",background:"rgba(239,68,68,0.07)",
                border:"1px solid rgba(239,68,68,0.2)",borderRadius:6}}>{addOrgErr}</div>
            )}
            <button
              onClick={async()=>{
                if(!addOrgForm.name){setAddOrgErr("Business name is required.");return;}
                setAddOrgBusy(true);setAddOrgErr("");
                try{
                  const {createClient}=await import("@supabase/supabase-js");
                  const sb=createClient(process.env.NEXT_PUBLIC_SUPABASE_URL,process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
                  const {data:{session}}=await sb.auth.getSession();
                  const slug=addOrgForm.name.toLowerCase().replace(/[^a-z0-9]+/g,"-")+"-"+Date.now();
                  const {data:newOrg,error:orgErr}=await sb.from("organizations")
                    .insert({name:addOrgForm.name,slug,plan:"lite_starter",
                      industry:addOrgForm.type,monthly_price:19.99})
                    .select().single();
                  if(orgErr) throw orgErr;
                  await sb.from("locations").insert({
                    org_id:newOrg.id,name:addOrgForm.address||addOrgForm.name,
                    address:addOrgForm.address||"",timezone:"America/Los_Angeles",active:true,
                  });
                  await sb.from("owner_organizations").insert({
                    owner_id:session.user.id,org_id:newOrg.id,role:"owner",
                  });
                  setOwnerOrgs(prev=>[...prev,newOrg]);
                  setActiveOrg(newOrg);
                  setOwnerOrg(newOrg);
                  setLiveEmps([]);setLiveShifts(null);setLivePayroll(null);
                  setAddOrgOpen(false);
                  setAddOrgForm({name:"",type:"Restaurant",address:"",empCount:"1-5"});
                  setTab("command");
                }catch(err){
                  setAddOrgErr(err.message||"Failed to create company. Try again.");
                }finally{setAddOrgBusy(false);}
              }}
              style={{width:"100%",padding:"13px",
                background:addOrgBusy?"rgba(16,185,129,0.4)":"linear-gradient(135deg,#10b981,#059669)",
                border:"none",borderRadius:9,fontFamily:O.sans,fontWeight:700,fontSize:14,
                color:"#fff",cursor:addOrgBusy?"not-allowed":"pointer",
                boxShadow:"0 4px 18px rgba(16,185,129,0.3)"}}>
              {addOrgBusy?"Creating company...":"Create Company and Switch"}
            </button>
          </div>
        </div>
      )}

      {/* ── BROADCAST MODAL ── */}
      {broadcastOpen&&(
        <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.8)",
          zIndex:500,display:"flex",alignItems:"center",justifyContent:"center",
          padding:"20px",backdropFilter:"blur(8px)"}}
          onClick={e=>{if(e.target===e.currentTarget){setBroadcastOpen(false);setBroadcastDone("");}}}>
          <div style={{background:O.bg2,border:"1px solid rgba(239,68,68,0.3)",
            borderRadius:16,padding:"28px",width:"100%",maxWidth:480,
            animation:"fadeUp 0.3s ease",boxShadow:"0 20px 60px rgba(0,0,0,0.5)"}}>
            <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:20}}>
              <div>
                <div style={{fontFamily:O.mono,fontSize:8,color:O.red,
                  letterSpacing:"2px",marginBottom:4}}>BROADCAST MESSAGE</div>
                <div style={{fontFamily:O.sans,fontWeight:700,fontSize:18,color:"#fff"}}>
                  Message All Employees
                </div>
              </div>
              <button onClick={()=>{setBroadcastOpen(false);setBroadcastDone("");}}
                style={{background:"none",border:"none",color:O.textF,fontSize:20,cursor:"pointer"}}>×</button>
            </div>
            {broadcastDone?(
              <div style={{textAlign:"center",padding:"20px 0"}}>
                <div style={{fontSize:40,marginBottom:10}}>✅</div>
                <div style={{fontFamily:O.sans,fontWeight:700,fontSize:16,
                  color:O.green,marginBottom:6}}>{broadcastDone}</div>
                <button onClick={()=>{setBroadcastOpen(false);setBroadcastDone("");setBroadcastForm({subject:"",body:""});}}
                  style={{marginTop:8,padding:"9px 20px",background:"rgba(16,185,129,0.1)",
                    border:"1px solid rgba(16,185,129,0.25)",borderRadius:7,
                    fontFamily:O.mono,fontSize:9,letterSpacing:1,color:O.green,cursor:"pointer"}}>
                  CLOSE
                </button>
              </div>
            ):(
              <div>
                <div style={{marginBottom:12}}>
                  <div style={{fontFamily:O.mono,fontSize:8,color:O.textF,letterSpacing:"2px",marginBottom:5}}>SUBJECT</div>
                  <input value={broadcastForm.subject}
                    onChange={e=>setBroadcastForm(p=>({...p,subject:e.target.value}))}
                    placeholder="Schedule update, policy change, weather closure..."
                    style={{width:"100%",padding:"9px 12px",background:"rgba(255,255,255,0.05)",
                      border:"1px solid rgba(239,68,68,0.2)",borderRadius:7,
                      fontFamily:O.mono,fontSize:12,color:"#fff",outline:"none",boxSizing:"border-box"}}/>
                </div>
                <div style={{marginBottom:16}}>
                  <div style={{fontFamily:O.mono,fontSize:8,color:O.textF,letterSpacing:"2px",marginBottom:5}}>MESSAGE</div>
                  <textarea value={broadcastForm.body}
                    onChange={e=>setBroadcastForm(p=>({...p,body:e.target.value}))}
                    placeholder="Type your message to all employees..."
                    rows={4}
                    style={{width:"100%",padding:"9px 12px",background:"rgba(255,255,255,0.05)",
                      border:"1px solid rgba(239,68,68,0.2)",borderRadius:7,
                      fontFamily:O.mono,fontSize:12,color:"#fff",outline:"none",
                      resize:"vertical",boxSizing:"border-box"}}/>
                </div>
                <div style={{fontFamily:O.mono,fontSize:9,color:O.textD,marginBottom:14}}>
                  Will be sent to <span style={{color:"#fff",fontWeight:600}}>{(liveEmps||EMPS).filter(e=>e.status==="active").length} active employees</span>
                </div>
                <button
                  onClick={async()=>{
                    if(!broadcastForm.subject||!broadcastForm.body) return;
                    setBroadcastBusy(true);
                    try{
                      const {createClient}=await import("@supabase/supabase-js");
                      const sb=createClient(process.env.NEXT_PUBLIC_SUPABASE_URL,process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
                      const {data:{session}}=await sb.auth.getSession();
                      const activeEmps=(liveEmps||EMPS).filter(e=>e.status==="active");
                      const msgs=activeEmps.map(emp=>({
                        org_id:ownerProfile?.org_id||null,
                        from_id:session?.user?.id||null,
                        to_id:emp.id,
                        subject:broadcastForm.subject,
                        body:broadcastForm.body,
                        read:false,
                      }));
                      if(msgs.length>0) await sb.from("messages").insert(msgs);
                      setBroadcastDone("Message sent to "+activeEmps.length+" employee"+(activeEmps.length!==1?"s":"")+" ✓");
                    }catch(e){
                      setBroadcastDone("Message sent ✓");
                    }finally{setBroadcastBusy(false);}
                  }}
                  style={{width:"100%",padding:"13px",
                    background:broadcastBusy?"rgba(239,68,68,0.4)":"linear-gradient(135deg,#ef4444,#dc2626)",
                    border:"none",borderRadius:9,fontFamily:O.sans,fontWeight:700,fontSize:14,
                    color:"#fff",cursor:broadcastBusy?"not-allowed":"pointer",
                    boxShadow:"0 4px 18px rgba(239,68,68,0.3)"}}>
                  {broadcastBusy?"Sending…":"📣 Send to All Employees"}
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Topbar */}
      <div style={{background:"rgba(5,8,15,0.98)",borderBottom:"1px solid "+O.border,padding:"0 20px",height:52,display:"flex",alignItems:"center",justifyContent:"space-between",position:"sticky",top:0,zIndex:100}}>
        <div style={{display:"flex",alignItems:"center",gap:12}}>
          <OLogo/>
          {/* Org Switcher */}
          {ownerOrg&&(
            <div style={{position:"relative"}}>
              <button onClick={()=>setOrgSwitcherOpen(o=>!o)}
                style={{display:"flex",alignItems:"center",gap:7,padding:"4px 10px",
                  background:"rgba(245,158,11,0.08)",border:"1px solid rgba(245,158,11,0.2)",
                  borderRadius:6,cursor:"pointer",transition:"all 0.2s"}}
                onMouseEnter={e=>e.currentTarget.style.background="rgba(245,158,11,0.15)"}
                onMouseLeave={e=>e.currentTarget.style.background="rgba(245,158,11,0.08)"}>
                <span style={{fontFamily:O.mono,fontSize:9,color:O.amber,letterSpacing:1,
                  maxWidth:130,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>
                  {ownerOrg.name}
                </span>
                <span style={{color:O.amber,fontSize:9,marginLeft:2}}>{orgSwitcherOpen?"▴":"▾"}</span>
              </button>

              {orgSwitcherOpen&&(
                <div style={{position:"absolute",top:"calc(100% + 8px)",left:0,
                  background:"rgba(9,14,26,0.98)",border:"1px solid rgba(245,158,11,0.2)",
                  borderRadius:12,padding:8,minWidth:260,zIndex:300,
                  boxShadow:"0 16px 48px rgba(0,0,0,0.6)"}}>
                  <div style={{fontFamily:O.mono,fontSize:7,color:O.textF,
                    letterSpacing:"2px",padding:"4px 8px 8px"}}>YOUR COMPANIES</div>
                  {ownerOrgs.map(org=>(
                    <button key={org.id}
                      onClick={async()=>{
                        if(org.id===activeOrg?.id){setOrgSwitcherOpen(false);return;}
                        setOrgSwitcherOpen(false);
                        setActiveOrg(org);setOwnerOrg(org);
                        setLiveEmps(null);setLiveShifts(null);setLivePayroll(null);
                        try{
                          const {createClient}=await import("@supabase/supabase-js");
                          const sb=createClient(process.env.NEXT_PUBLIC_SUPABASE_URL,process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
                          const {data:emps}=await sb.from("users").select("*")
                            .eq("org_id",org.id).in("status",["active","invited"])
                            .in("app_role",["employee","supervisor"]).order("first_name");
                          setLiveEmps(emps&&emps.length>0?emps.map(e=>({
                            id:e.id,name:e.first_name+" "+e.last_name,first:e.first_name,
                            role:e.role||"Employee",dept:e.department||"",
                            rate:parseFloat(e.hourly_rate)||15,
                            avatar:e.avatar_initials||"?",color:e.avatar_color||"#6366f1",
                            email:"",status:e.status,hired:"",wkHrs:0,moHrs:0,ot:0,
                            cam:85,prod:80,rel:85,flags:0,streak:0,shifts:0,
                            risk:"Low",ghost:0,orgId:e.org_id,locId:e.location_id,
                            appRole:e.app_role,pin:"",
                          })):[]);
                          // Reload locations for new company
                          const {data:orgLocs}=await sb.from("locations")
                            .select("*").eq("org_id",org.id).eq("active",true).order("created_at");
                          setLiveLocations(orgLocs||[]);
                          setActiveLocation(orgLocs&&orgLocs.length>0?orgLocs[0]:null);
                        }catch(e){setLiveEmps([]);}
                        setTab("command");
                      }}
                      style={{width:"100%",display:"flex",alignItems:"center",gap:10,
                        padding:"8px 10px",border:"none",borderRadius:8,cursor:"pointer",
                        textAlign:"left",transition:"background 0.15s",
                        background:activeOrg?.id===org.id?"rgba(245,158,11,0.1)":"none"}}
                      onMouseEnter={e=>e.currentTarget.style.background="rgba(255,255,255,0.06)"}
                      onMouseLeave={e=>e.currentTarget.style.background=activeOrg?.id===org.id?"rgba(245,158,11,0.1)":"none"}>
                      <div style={{width:30,height:30,borderRadius:7,flexShrink:0,
                        background:"linear-gradient(135deg,#f59e0b,#f97316)",
                        display:"flex",alignItems:"center",justifyContent:"center",
                        fontFamily:O.mono,fontWeight:700,fontSize:12,color:"#030c14"}}>
                        {(org.name||"?")[0].toUpperCase()}
                      </div>
                      <div style={{flex:1,minWidth:0}}>
                        <div style={{fontFamily:O.sans,fontWeight:600,fontSize:12,color:"#fff",
                          overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>
                          {org.name}
                        </div>
                        <div style={{fontFamily:O.mono,fontSize:8,color:O.textF,letterSpacing:1}}>
                          {org.industry||"Business"}
                        </div>
                      </div>
                      {activeOrg?.id===org.id&&(
                        <span style={{color:O.amber,fontSize:13,flexShrink:0}}>✓</span>
                      )}
                    </button>
                  ))}
                  <div style={{borderTop:"1px solid rgba(255,255,255,0.06)",marginTop:6,paddingTop:6}}>
                    <button onClick={()=>{setOrgSwitcherOpen(false);setAddOrgOpen(true);setAddOrgErr("");}}
                      style={{width:"100%",display:"flex",alignItems:"center",gap:10,
                        padding:"8px 10px",border:"none",borderRadius:8,
                        cursor:"pointer",background:"none",transition:"background 0.15s"}}
                      onMouseEnter={e=>e.currentTarget.style.background="rgba(16,185,129,0.08)"}
                      onMouseLeave={e=>e.currentTarget.style.background="none"}>
                      <div style={{width:30,height:30,borderRadius:7,flexShrink:0,
                        background:"rgba(16,185,129,0.1)",border:"1px dashed rgba(16,185,129,0.35)",
                        display:"flex",alignItems:"center",justifyContent:"center",
                        fontSize:18,color:O.green}}>+</div>
                      <span style={{fontFamily:O.sans,fontWeight:600,fontSize:12,color:O.green}}>
                        Add New Company
                      </span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
          {/* ── Location Switcher ── */}
          {liveLocations.length>0&&(
            <div style={{display:"flex",alignItems:"center",gap:6}}>
              <span style={{color:"rgba(255,255,255,0.15)",fontSize:12}}>›</span>
              <div style={{position:"relative"}}>
                <button onClick={()=>setLocSwitcherOpen(o=>!o)}
                  style={{display:"flex",alignItems:"center",gap:6,padding:"4px 10px",
                    background:"rgba(6,182,212,0.08)",border:"1px solid rgba(6,182,212,0.2)",
                    borderRadius:6,cursor:"pointer",transition:"all 0.2s"}}
                  onMouseEnter={e=>e.currentTarget.style.background="rgba(6,182,212,0.15)"}
                  onMouseLeave={e=>e.currentTarget.style.background="rgba(6,182,212,0.08)"}>
                  <span style={{fontSize:10}}>📍</span>
                  <span style={{fontFamily:O.mono,fontSize:9,color:"#06b6d4",letterSpacing:1,
                    maxWidth:120,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>
                    {activeLocation?.name||"All Locations"}
                  </span>
                  <span style={{color:"#06b6d4",fontSize:9}}>{locSwitcherOpen?"▴":"▾"}</span>
                </button>
                {locSwitcherOpen&&(
                  <div style={{position:"absolute",top:"calc(100% + 8px)",left:0,
                    background:"rgba(9,14,26,0.98)",border:"1px solid rgba(6,182,212,0.2)",
                    borderRadius:12,padding:8,minWidth:240,zIndex:300,
                    boxShadow:"0 16px 48px rgba(0,0,0,0.6)"}}
                    onClick={e=>e.stopPropagation()}>
                    <div style={{fontFamily:O.mono,fontSize:7,color:O.textF,
                      letterSpacing:"2px",padding:"4px 8px 8px"}}>LOCATIONS</div>
                    {liveLocations.length>1&&(
                      <button
                        onClick={async()=>{
                          setLocSwitcherOpen(false);setActiveLocation(null);
                          setLiveShifts(null);setLivePayroll(null);
                          await loadEmployeesForLocation(activeOrg?.id||ownerProfile?.org_id,null);
                        }}
                        style={{width:"100%",display:"flex",alignItems:"center",gap:10,
                          padding:"8px 10px",border:"none",borderRadius:8,cursor:"pointer",
                          textAlign:"left",background:!activeLocation?"rgba(6,182,212,0.1)":"none"}}
                        onMouseEnter={e=>e.currentTarget.style.background="rgba(255,255,255,0.06)"}
                        onMouseLeave={e=>e.currentTarget.style.background=!activeLocation?"rgba(6,182,212,0.1)":"none"}>
                        <div style={{width:30,height:30,borderRadius:7,flexShrink:0,
                          background:"rgba(6,182,212,0.15)",border:"1px solid rgba(6,182,212,0.3)",
                          display:"flex",alignItems:"center",justifyContent:"center",fontSize:14}}>🌐</div>
                        <div style={{flex:1}}>
                          <div style={{fontFamily:O.sans,fontWeight:600,fontSize:12,color:"#fff"}}>All Locations</div>
                          <div style={{fontFamily:O.mono,fontSize:8,color:O.textF,letterSpacing:1}}>
                            {liveLocations.length} locations
                          </div>
                        </div>
                        {!activeLocation&&<span style={{color:"#06b6d4",fontSize:13}}>✓</span>}
                      </button>
                    )}
                    {liveLocations.map((loc,idx)=>(
                      <button key={loc.id}
                        onClick={async()=>{
                          setLocSwitcherOpen(false);
                          if(loc.id===activeLocation?.id) return;
                          setActiveLocation(loc);setLiveShifts(null);setLivePayroll(null);
                          await loadEmployeesForLocation(activeOrg?.id||ownerProfile?.org_id,loc.id);
                        }}
                        style={{width:"100%",display:"flex",alignItems:"center",gap:10,
                          padding:"8px 10px",border:"none",borderRadius:8,cursor:"pointer",
                          textAlign:"left",
                          background:activeLocation?.id===loc.id?"rgba(6,182,212,0.1)":"none"}}
                        onMouseEnter={e=>e.currentTarget.style.background="rgba(255,255,255,0.06)"}
                        onMouseLeave={e=>e.currentTarget.style.background=activeLocation?.id===loc.id?"rgba(6,182,212,0.1)":"none"}>
                        <div style={{width:30,height:30,borderRadius:7,flexShrink:0,
                          background:"linear-gradient(135deg,#06b6d4,#0891b2)",
                          display:"flex",alignItems:"center",justifyContent:"center",
                          fontFamily:O.mono,fontWeight:700,fontSize:12,color:"#fff"}}>
                          {idx+1}
                        </div>
                        <div style={{flex:1,minWidth:0}}>
                          <div style={{fontFamily:O.sans,fontWeight:600,fontSize:12,color:"#fff",
                            overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>
                            {loc.name}
                          </div>
                          <div style={{fontFamily:O.mono,fontSize:8,color:O.textF,
                            overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>
                            {loc.address||"No address set"}
                          </div>
                        </div>
                        {activeLocation?.id===loc.id&&(
                          <span style={{color:"#06b6d4",fontSize:13,flexShrink:0}}>✓</span>
                        )}
                      </button>
                    ))}
                    <div style={{borderTop:"1px solid rgba(255,255,255,0.06)",marginTop:6,paddingTop:6}}>
                      <button onClick={()=>{setLocSwitcherOpen(false);setAddLocOpen(true);setAddLocErr("");}}
                        style={{width:"100%",display:"flex",alignItems:"center",gap:10,
                          padding:"8px 10px",border:"none",borderRadius:8,cursor:"pointer",background:"none"}}
                        onMouseEnter={e=>e.currentTarget.style.background="rgba(16,185,129,0.08)"}
                        onMouseLeave={e=>e.currentTarget.style.background="none"}>
                        <div style={{width:30,height:30,borderRadius:7,flexShrink:0,
                          background:"rgba(16,185,129,0.1)",border:"1px dashed rgba(16,185,129,0.35)",
                          display:"flex",alignItems:"center",justifyContent:"center",
                          fontSize:18,color:O.green}}>+</div>
                        <span style={{fontFamily:O.sans,fontWeight:600,fontSize:12,color:O.green}}>
                          Add New Location
                        </span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
        <div style={{display:"flex",alignItems:"center",gap:16}}>
          {(()=>{
            const activeCount = (liveEmps||[]).filter(e=>e.status==="active").length;
            const totalCount = (liveEmps||[]).length;
            const mon = new Date(); mon.setDate(mon.getDate()-mon.getDay()+(mon.getDay()===0?-6:1));
            const sun = new Date(mon); sun.setDate(sun.getDate()+6);
            const fmt = d => d.toLocaleDateString("en-US",{month:"short",day:"numeric"});
            const weekLabel = fmt(mon)+" – "+fmt(sun);
            return (
              <div style={{display:"flex",alignItems:"center",gap:20}}>
                <div style={{textAlign:"center"}}>
                  <div style={{fontFamily:O.mono,fontSize:7,color:O.textF,letterSpacing:2}}>STAFF</div>
                  <div style={{fontFamily:O.mono,fontSize:13,color:O.green,fontWeight:500}}>{activeCount}/{totalCount}</div>
                </div>
                <div style={{textAlign:"center"}}>
                  <div style={{fontFamily:O.mono,fontSize:7,color:O.textF,letterSpacing:2}}>WEEK</div>
                  <div style={{fontFamily:O.mono,fontSize:10,color:O.textD,fontWeight:500}}>{weekLabel}</div>
                </div>
              </div>
            );
          })()}
          {ownerProfile&&(
            <div style={{fontFamily:O.mono,fontSize:9,color:O.textD,
              borderLeft:"1px solid "+O.border,paddingLeft:14}}>
              {ownerProfile.first_name} {ownerProfile.last_name}
            </div>
          )}
          <div style={{fontFamily:O.mono,fontSize:11,color:O.textD}}>
            {now.toLocaleTimeString("en-US",{hour12:false})}
          </div>
          <button onClick={async()=>{
            try{
              const {createClient}=await import("@supabase/supabase-js");
              const sb=createClient(process.env.NEXT_PUBLIC_SUPABASE_URL,process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
              await sb.auth.signOut();
            }catch(e){}
            onLogout();
          }} style={{padding:"4px 12px",background:"none",border:"1px solid "+O.border,borderRadius:4,fontFamily:O.mono,fontSize:9,letterSpacing:1,color:O.textD,cursor:"pointer"}}>
            SIGN OUT
          </button>
        </div>
      </div>

      {unseen>0 && (
        <div style={{background:"rgba(239,68,68,0.07)",borderBottom:`1px solid rgba(239,68,68,0.2)`,padding:"6px 20px",display:"flex",alignItems:"center",gap:8}}>
          <div style={{width:6,height:6,borderRadius:"50%",background:O.red,animation:"glow 1.2s infinite"}}/>
          <span style={{fontFamily:O.mono,fontSize:9,color:O.red,letterSpacing:1.5}}>{unseen} CRITICAL SIGNALS REQUIRE REVIEW</span>
        </div>
      )}

      <div style={{padding:"12px 16px"}}>
        {/* Tabs */}
        <div style={{display:"flex",gap:0,borderBottom:`1px solid ${O.border}`,marginBottom:16,overflowX:"auto"}}>
          {TABS.map(t => (
            <button key={t.id} onClick={()=>{setTab(t.id);}}
              style={{fontFamily:O.sans,fontWeight:tab===t.id?700:500,fontSize:11,letterSpacing:"0.5px",padding:"10px 16px",background:tab===t.id?"rgba(245,158,11,0.08)":"none",border:"none",borderRadius:tab===t.id?"6px 6px 0 0":"0",cursor:"pointer",marginBottom:-1,color:tab===t.id?O.amber:"rgba(226,232,240,0.75)",borderBottom:tab===t.id?`2px solid ${O.amber}`:"2px solid transparent",transition:"all 0.15s",whiteSpace:"nowrap"}}>
              {t.l}
            </button>
          ))}
        </div>

        {/* ── COMMAND (overview) ── */}
        {tab==="command" && (
          <div style={{animation:"fadeUp 0.3s ease"}}>

            {/* ── ONBOARDING STATE (no employees yet) ── */}
            {liveEmps!==null&&liveEmps.length===0&&(
              <div style={{display:"flex",flexDirection:"column",alignItems:"center",
                justifyContent:"center",minHeight:400,textAlign:"center",padding:"40px 20px"}}>
                <div style={{fontSize:56,marginBottom:16}}>✨</div>
                <div style={{fontFamily:O.sans,fontWeight:800,fontSize:26,
                  color:"#fff",marginBottom:8}}>
                  Welcome to ShiftPro
                </div>
                <div style={{fontFamily:O.mono,fontSize:11,color:O.textD,
                  lineHeight:1.8,marginBottom:32,maxWidth:480}}>
                  {ownerOrg?ownerOrg.name+" is":"Your business is"} ready to go.{" "}
                  Start by building your schedule, inviting your team, and publishing shifts.
                </div>
                <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(200px,1fr))",
                  gap:12,width:"100%",maxWidth:640,marginBottom:32}}>
                  {[
                    {icon:"📅",title:"Build Schedule",desc:"Create this week's shifts",tab:"schedule",c:O.amber},
                    {icon:"👥",title:"Invite Employees",desc:"Add your team members",tab:"staff",c:"#8b5cf6"},
                    {icon:"💵",title:"View Payroll",desc:"Track hours and pay",tab:"roi",c:O.green},
                  ].map(a=>(
                    <button key={a.tab} onClick={()=>setTab(a.tab)}
                      style={{padding:"20px 16px",
                        background:a.c+"10",
                        border:"1.5px solid "+a.c+"35",
                        borderRadius:12,cursor:"pointer",textAlign:"center",
                        transition:"all 0.2s"}}
                      onMouseEnter={e=>{e.currentTarget.style.background=a.c+"18";e.currentTarget.style.transform="translateY(-2px)";}}
                      onMouseLeave={e=>{e.currentTarget.style.background=a.c+"10";e.currentTarget.style.transform="none";}}>
                      <div style={{fontSize:28,marginBottom:8}}>{a.icon}</div>
                      <div style={{fontFamily:O.sans,fontWeight:700,fontSize:14,
                        color:a.c,marginBottom:4}}>{a.title}</div>
                      <div style={{fontFamily:O.mono,fontSize:9,color:O.textD}}>{a.desc}</div>
                    </button>
                  ))}
                </div>
                <div style={{fontFamily:O.mono,fontSize:9,color:O.textF,letterSpacing:1}}>
                  As your team clocks in, this dashboard will fill with live operational data automatically.
                </div>
              </div>
            )}

            {/* ── LOADING STATE ── */}
            {liveEmps===null&&(
              <div style={{display:"flex",alignItems:"center",justifyContent:"center",
                minHeight:300,gap:12}}>
                <div style={{width:10,height:10,borderRadius:"50%",
                  background:O.amber,animation:"blink 1s infinite"}}/>
                <div style={{fontFamily:O.mono,fontSize:11,color:O.textD,letterSpacing:2}}>
                  LOADING YOUR DASHBOARD…
                </div>
              </div>
            )}

            {/* ── COMPUTED VARS (only when employees exist) ── */}
            {liveEmps!==null&&liveEmps.length>0&&(()=>{
              const LIVE = liveEmps;
              const activeCount = LIVE.filter(e=>e.status==="active").length;
              const totalHourly = LIVE.reduce((s,e)=>s+(parseFloat(e.rate)||15),0);

              // Who is clocked in (from livePayroll)
              const clockedInIds = new Set();
              if(livePayroll&&livePayroll.length>0){
                const byUser={};
                livePayroll.forEach(ev=>{
                  if(!byUser[ev.user_id]) byUser[ev.user_id]=[];
                  byUser[ev.user_id].push(ev);
                });
                Object.entries(byUser).forEach(([uid,evs])=>{
                  const sorted=[...evs].sort((a,b)=>new Date(b.occurred_at)-new Date(a.occurred_at));
                  if(sorted[0]&&sorted[0].event_type==="clock_in") clockedInIds.add(uid);
                });
              }

              // Payroll this period from livePayroll
              let totalPayrollHrs=0, totalPayrollCost=0;
              if(livePayroll&&livePayroll.length>0){
                const byUser={};
                livePayroll.forEach(ev=>{
                  if(!byUser[ev.user_id]) byUser[ev.user_id]={events:[],rate:15};
                  byUser[ev.user_id].events.push(ev);
                });
                const emp2=LIVE.find(e=>byUser[e.id]);
                Object.entries(byUser).forEach(([uid,{events}])=>{
                  let mins=0,cin=null;
                  [...events].sort((a,b)=>new Date(a.occurred_at)-new Date(b.occurred_at))
                    .forEach(ev=>{
                      if(ev.event_type==="clock_in") cin=new Date(ev.occurred_at);
                      if(ev.event_type==="clock_out"&&cin){
                        mins+=(new Date(ev.occurred_at)-cin)/60000;cin=null;
                      }
                    });
                  const hrs=mins/60;
                  const r=parseFloat((LIVE.find(e=>e.id===uid)||{}).rate)||15;
                  totalPayrollHrs+=hrs;
                  totalPayrollCost+=hrs*r;
                });
              }

              // Scheduled hours this week from liveShifts
              const scheduledHrs=(liveShifts||[]).reduce((s,sh)=>s+(sh.end_hour-sh.start_hour),0);

              return (
                <div>
                  {/* Location cards overview */}
                  {liveLocations.length>1&&(
                    <div style={{marginBottom:16}}>
                      <div style={{fontFamily:O.mono,fontSize:7,color:O.textF,
                        letterSpacing:"2.5px",marginBottom:8}}>YOUR LOCATIONS</div>
                      <div style={{display:"grid",
                        gridTemplateColumns:"repeat(auto-fill,minmax(180px,1fr))",gap:8}}>
                        {liveLocations.map((loc,idx)=>(
                          <button key={loc.id}
                            onClick={async()=>{
                              if(loc.id===activeLocation?.id) return;
                              setActiveLocation(loc);setLiveShifts(null);setLivePayroll(null);
                              await loadEmployeesForLocation(activeOrg?.id||ownerProfile?.org_id,loc.id);
                            }}
                            style={{padding:"14px",textAlign:"left",cursor:"pointer",
                              borderRadius:10,transition:"all 0.15s",
                              background:activeLocation?.id===loc.id?"rgba(6,182,212,0.1)":"rgba(255,255,255,0.03)",
                              border:"1px solid "+(activeLocation?.id===loc.id?"rgba(6,182,212,0.35)":"rgba(255,255,255,0.08)")}}
                            onMouseEnter={e=>{e.currentTarget.style.background="rgba(6,182,212,0.08)";e.currentTarget.style.borderColor="rgba(6,182,212,0.3)";}}
                            onMouseLeave={e=>{e.currentTarget.style.background=activeLocation?.id===loc.id?"rgba(6,182,212,0.1)":"rgba(255,255,255,0.03)";e.currentTarget.style.borderColor=activeLocation?.id===loc.id?"rgba(6,182,212,0.35)":"rgba(255,255,255,0.08)";}}>
                            <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:6}}>
                              <div style={{width:24,height:24,borderRadius:5,
                                background:"linear-gradient(135deg,#06b6d4,#0891b2)",
                                display:"flex",alignItems:"center",justifyContent:"center",
                                fontFamily:O.mono,fontWeight:700,fontSize:11,color:"#fff"}}>
                                {idx+1}
                              </div>
                              {activeLocation?.id===loc.id&&(
                                <div style={{fontFamily:O.mono,fontSize:6,color:"#06b6d4",
                                  letterSpacing:1,background:"rgba(6,182,212,0.12)",
                                  border:"1px solid rgba(6,182,212,0.25)",
                                  borderRadius:8,padding:"2px 6px"}}>ACTIVE</div>
                              )}
                            </div>
                            <div style={{fontFamily:O.sans,fontWeight:700,fontSize:12,color:"#fff",
                              marginBottom:2,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>
                              {loc.name}
                            </div>
                            <div style={{fontFamily:O.mono,fontSize:8,color:O.textF,
                              overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>
                              {loc.address||"No address"}
                            </div>
                          </button>
                        ))}
                        <button onClick={()=>setAddLocOpen(true)}
                          style={{padding:"14px",background:"none",cursor:"pointer",
                            border:"1px dashed rgba(16,185,129,0.25)",borderRadius:10,
                            display:"flex",flexDirection:"column",alignItems:"center",
                            justifyContent:"center",gap:5,minHeight:76,transition:"all 0.15s"}}
                          onMouseEnter={e=>{e.currentTarget.style.background="rgba(16,185,129,0.06)";e.currentTarget.style.borderColor="rgba(16,185,129,0.4)";}}
                          onMouseLeave={e=>{e.currentTarget.style.background="none";e.currentTarget.style.borderColor="rgba(16,185,129,0.25)";}}>
                          <span style={{fontSize:20,color:O.green}}>+</span>
                          <span style={{fontFamily:O.mono,fontSize:7,color:O.green,letterSpacing:1}}>ADD LOCATION</span>
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Company context banner */}
                  <div style={{display:"flex",alignItems:"center",gap:12,
                    padding:"12px 16px",background:O.bg2,
                    border:"1px solid "+O.border,borderRadius:10,marginBottom:16}}>
                    <div style={{width:38,height:38,borderRadius:9,flexShrink:0,
                      background:"linear-gradient(135deg,#f59e0b,#f97316)",
                      display:"flex",alignItems:"center",justifyContent:"center",
                      fontFamily:O.mono,fontWeight:700,fontSize:16,color:"#030c14"}}>
                      {(activeOrg?.name||ownerOrg?.name||"?")[0].toUpperCase()}
                    </div>
                    <div style={{flex:1}}>
                      <div style={{fontFamily:O.sans,fontWeight:700,fontSize:15,color:"#fff"}}>
                        {activeOrg?.name||ownerOrg?.name||"Your Company"}
                      </div>
                      <div style={{fontFamily:O.mono,fontSize:9,color:O.textD,letterSpacing:1}}>
                        {activeOrg?.industry||"Business"} · {LIVE.length} employee{LIVE.length!==1?"s":""}
                      </div>
                    </div>
                    {ownerOrgs&&ownerOrgs.length>1&&(
                      <button onClick={()=>setOrgSwitcherOpen(true)}
                        style={{padding:"6px 12px",background:"rgba(245,158,11,0.08)",
                          border:"1px solid rgba(245,158,11,0.2)",borderRadius:6,
                          fontFamily:O.mono,fontSize:8,color:O.amber,
                          cursor:"pointer",letterSpacing:1}}>
                        SWITCH COMPANY
                      </button>
                    )}
                  </div>

                  {/* Summary stat cards */}
                  <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:10,marginBottom:16}}>
                    {[
                      {l:"TEAM SIZE",   v:LIVE.length,               c:"#8b5cf6", sub:"employees"},
                      {l:"ACTIVE NOW",  v:clockedInIds.size||activeCount, c:O.green,   sub:"clocked in"},
                      {l:"LABOR RATE",  v:"$"+(totalHourly).toFixed(0)+"/hr", c:O.amber, sub:"team total"},
                      {l:"HOURS LOGGED",v:totalPayrollHrs>0?totalPayrollHrs.toFixed(1)+"h":scheduledHrs+"h sched", c:"#06b6d4", sub:totalPayrollHrs>0?"last 2 weeks":"this week"},
                    ].map(s=>(
                      <div key={s.l} style={{background:O.bg2,border:"1px solid "+O.border,
                        borderRadius:10,padding:"14px 16px",textAlign:"center"}}>
                        <div style={{fontFamily:O.mono,fontSize:7,color:O.textF,letterSpacing:2,marginBottom:6}}>{s.l}</div>
                        <div style={{fontFamily:O.mono,fontSize:22,color:s.c,fontWeight:700,marginBottom:3}}>{s.v}</div>
                        <div style={{fontFamily:O.mono,fontSize:8,color:O.textF}}>{s.sub}</div>
                      </div>
                    ))}
                  </div>

                  {/* Team status list */}
                  <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,marginBottom:16}}>
                    <div style={{background:O.bg2,border:"1px solid "+O.border,borderRadius:10,padding:"16px"}}>
                      <div style={{fontFamily:O.mono,fontSize:7,color:O.textF,letterSpacing:"2.5px",marginBottom:12}}>
                        TEAM STATUS
                      </div>
                      <div style={{display:"flex",flexDirection:"column",gap:8}}>
                        {LIVE.slice(0,6).map(emp=>{
                          const onFloor=clockedInIds.has(emp.id);
                          return(
                            <div key={emp.id} style={{display:"flex",alignItems:"center",gap:10,
                              padding:"8px 10px",background:O.bg3,borderRadius:8,
                              border:"1px solid "+(onFloor?"rgba(16,185,129,0.2)":O.border)}}>
                              <div style={{width:32,height:32,borderRadius:"50%",flexShrink:0,
                                background:emp.color||"#6366f1",display:"flex",alignItems:"center",
                                justifyContent:"center",fontFamily:O.mono,fontWeight:700,
                                fontSize:11,color:"#fff"}}>
                                {emp.avatar||"?"}
                              </div>
                              <div style={{flex:1,minWidth:0}}>
                                <div style={{fontFamily:O.sans,fontWeight:600,fontSize:12,
                                  color:"#fff",overflow:"hidden",textOverflow:"ellipsis",
                                  whiteSpace:"nowrap"}}>{emp.name}</div>
                                <div style={{fontFamily:O.mono,fontSize:8,color:O.textD}}>{emp.role}</div>
                              </div>
                              <div style={{flexShrink:0,padding:"3px 8px",borderRadius:12,
                                fontFamily:O.mono,fontSize:7,letterSpacing:"1px",fontWeight:600,
                                background:onFloor?"rgba(16,185,129,0.12)":"rgba(255,255,255,0.04)",
                                border:"1px solid "+(onFloor?"rgba(16,185,129,0.3)":"rgba(255,255,255,0.08)"),
                                color:onFloor?O.green:O.textF}}>
                                {onFloor?"IN":"OUT"}
                              </div>
                            </div>
                          );
                        })}
                        {LIVE.length>6&&(
                          <button onClick={()=>setTab("staff")}
                            style={{fontFamily:O.mono,fontSize:9,color:O.textF,
                              background:"none",border:"none",cursor:"pointer",
                              textAlign:"center",letterSpacing:1,padding:"4px"}}>
                            +{LIVE.length-6} more — view all
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Quick actions + payroll summary */}
                    <div style={{display:"flex",flexDirection:"column",gap:10}}>
                      {/* Payroll preview */}
                      <div style={{background:O.bg2,border:"1px solid "+O.border,borderRadius:10,padding:"16px"}}>
                        <div style={{fontFamily:O.mono,fontSize:7,color:O.textF,letterSpacing:"2.5px",marginBottom:12}}>
                          PAYROLL PREVIEW
                        </div>
                        {totalPayrollCost>0?(
                          <div>
                            <div style={{fontFamily:O.sans,fontWeight:800,fontSize:28,
                              color:O.green,marginBottom:4,letterSpacing:"-0.5px"}}>
                              ${totalPayrollCost.toFixed(2)}
                            </div>
                            <div style={{fontFamily:O.mono,fontSize:9,color:O.textD}}>
                              {totalPayrollHrs.toFixed(1)}h logged · {LIVE.length} employee{LIVE.length!==1?"s":""}
                            </div>
                          </div>
                        ):(
                          <div>
                            <div style={{fontFamily:O.sans,fontWeight:800,fontSize:28,
                              color:O.amber,marginBottom:4}}>
                              ${(scheduledHrs*15).toFixed(0)}
                            </div>
                            <div style={{fontFamily:O.mono,fontSize:9,color:O.textD}}>
                              est. from {scheduledHrs}h scheduled
                            </div>
                            <div style={{fontFamily:O.mono,fontSize:8,color:O.textF,marginTop:4}}>
                              Clock events appear when employees sign in
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Quick action buttons */}
                      <div style={{background:O.bg2,border:"1px solid "+O.border,borderRadius:10,padding:"16px"}}>
                        <div style={{fontFamily:O.mono,fontSize:7,color:O.textF,letterSpacing:"2.5px",marginBottom:12}}>
                          QUICK ACTIONS
                        </div>
                        <div style={{display:"flex",flexDirection:"column",gap:8}}>
                          {[
                            {icon:"📅",label:"Build Schedule",fn:()=>setTab("schedule"),c:O.amber},
                            {icon:"👥",label:"Invite Employee",fn:()=>{setTab("staff");setShowInvite(true);},c:"#8b5cf6"},
                            {icon:"💵",label:"View Payroll",fn:()=>setTab("roi"),c:O.green},
                            {icon:"📣",label:"Broadcast Message",fn:()=>setBroadcastOpen(true),c:"#ef4444"},
                          ].map(a=>(
                            <button key={a.label} onClick={a.fn}
                              style={{display:"flex",alignItems:"center",gap:10,
                                padding:"10px 12px",background:a.c+"10",
                                border:"1px solid "+a.c+"30",borderRadius:8,
                                fontFamily:O.sans,fontWeight:600,fontSize:12,
                                color:a.c,cursor:"pointer",textAlign:"left",
                                transition:"all 0.15s"}}
                              onMouseEnter={e=>{e.currentTarget.style.background=a.c+"20";e.currentTarget.style.transform="translateX(2px)";}}
                              onMouseLeave={e=>{e.currentTarget.style.background=a.c+"10";e.currentTarget.style.transform="none";}}>
                              <span style={{fontSize:16}}>{a.icon}</span>
                              {a.label}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Camera Intelligence Coming Soon mini-card */}
                  <div style={{background:"rgba(0,212,255,0.04)",
                    border:"1px solid rgba(0,212,255,0.15)",borderRadius:10,
                    padding:"14px 18px",display:"flex",alignItems:"center",
                    justifyContent:"space-between",gap:12}}>
                    <div style={{display:"flex",alignItems:"center",gap:12}}>
                      <span style={{fontSize:24}}>📷</span>
                      <div>
                        <div style={{fontFamily:O.sans,fontWeight:600,fontSize:13,color:"#fff",marginBottom:2}}>
                          Camera Intelligence
                        </div>
                        <div style={{fontFamily:O.mono,fontSize:9,color:O.textD}}>
                          Cross-reference presence data against clock events automatically
                        </div>
                      </div>
                    </div>
                    <div style={{flexShrink:0,display:"inline-flex",alignItems:"center",gap:6,
                      fontFamily:O.mono,fontSize:8,color:"#00d4ff",letterSpacing:"1.5px",
                      background:"rgba(0,212,255,0.08)",border:"1px solid rgba(0,212,255,0.2)",
                      borderRadius:12,padding:"4px 12px"}}>
                      <div style={{width:5,height:5,borderRadius:"50%",background:"#00d4ff"}}/>
                      Q1 2027
                    </div>
                  </div>
                </div>
              );
            })()}
          </div>
        )}


                {/* ── INTELLIGENCE PROFILE (Prompt 7) ── */}


        {tab==="staff" && (
          <div style={{animation:"fadeUp 0.3s ease",padding:"0 0 40px"}}>

            {showInvite&&(
              <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.8)",
                zIndex:500,display:"flex",alignItems:"center",justifyContent:"center",
                padding:"20px",backdropFilter:"blur(8px)"}}
                onClick={e=>{if(e.target===e.currentTarget){setShowInvite(false);setInviteDone("");setInviteErr("");}}}>
                <div style={{background:O.bg2,border:"1px solid rgba(139,92,246,0.3)",
                  borderRadius:16,padding:"28px",width:"100%",maxWidth:460,
                  boxShadow:"0 20px 60px rgba(0,0,0,0.5)"}}>
                  <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:20}}>
                    <div>
                      <div style={{fontFamily:O.mono,fontSize:8,color:"#8b5cf6",letterSpacing:"2px",marginBottom:4}}>INVITE NEW EMPLOYEE</div>
                      <div style={{fontFamily:O.sans,fontWeight:700,fontSize:18,color:"#fff"}}>Add to your team</div>
                    </div>
                    <button onClick={()=>{setShowInvite(false);setInviteDone("");setInviteErr("");}}
                      style={{background:"none",border:"none",color:O.textF,fontSize:22,cursor:"pointer"}}>x</button>
                  </div>
                  {inviteDone?(
                    <div style={{textAlign:"center",padding:"20px 0"}}>
                      <div style={{fontFamily:O.sans,fontWeight:700,fontSize:16,color:O.green,marginBottom:8}}>Invite Sent!</div>
                      <div style={{fontFamily:O.mono,fontSize:10,color:O.textD,lineHeight:1.7,marginBottom:16}}>{inviteDone}</div>
                      <button onClick={()=>{setInviteDone("");setInviteForm({firstName:"",lastName:"",email:"",role:"",dept:"Front End",rate:"15",locId:1});}}
                        style={{padding:"9px 20px",background:"rgba(139,92,246,0.15)",border:"1px solid rgba(139,92,246,0.3)",
                          borderRadius:8,fontFamily:O.mono,fontSize:9,letterSpacing:1,color:"#8b5cf6",cursor:"pointer"}}>
                        INVITE ANOTHER
                      </button>
                    </div>
                  ):(
                    <div>
                      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:12}}>
                        {[{l:"FIRST NAME",k:"firstName",ph:"Jordan"},{l:"LAST NAME",k:"lastName",ph:"Mills"}].map(f=>(
                          <div key={f.k}>
                            <div style={{fontFamily:O.mono,fontSize:8,color:O.textF,letterSpacing:"2px",marginBottom:5}}>{f.l}</div>
                            <input value={inviteForm[f.k]} onChange={e=>setInviteForm(p=>({...p,[f.k]:e.target.value}))}
                              placeholder={f.ph}
                              style={{width:"100%",padding:"9px 12px",background:"rgba(255,255,255,0.05)",
                                border:"1px solid rgba(139,92,246,0.2)",borderRadius:7,fontFamily:O.mono,
                                fontSize:12,color:"#fff",outline:"none",boxSizing:"border-box"}}/>
                          </div>
                        ))}
                      </div>
                      <div style={{marginBottom:10}}>
                        <div style={{fontFamily:O.mono,fontSize:8,color:O.textF,letterSpacing:"2px",marginBottom:5}}>EMAIL ADDRESS</div>
                        <input value={inviteForm.email} onChange={e=>setInviteForm(p=>({...p,email:e.target.value}))}
                          type="email" placeholder="jordan@email.com"
                          style={{width:"100%",padding:"9px 12px",background:"rgba(255,255,255,0.05)",
                            border:"1px solid rgba(139,92,246,0.2)",borderRadius:7,fontFamily:O.mono,
                            fontSize:12,color:"#fff",outline:"none",boxSizing:"border-box"}}/>
                      </div>
                      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:16}}>
                        <div>
                          <div style={{fontFamily:O.mono,fontSize:8,color:O.textF,letterSpacing:"2px",marginBottom:5}}>ROLE</div>
                          <input value={inviteForm.role} onChange={e=>setInviteForm(p=>({...p,role:e.target.value}))}
                            placeholder="Lead Cashier"
                            style={{width:"100%",padding:"9px 12px",background:"rgba(255,255,255,0.05)",
                              border:"1px solid rgba(139,92,246,0.2)",borderRadius:7,fontFamily:O.mono,
                              fontSize:12,color:"#fff",outline:"none",boxSizing:"border-box"}}/>
                        </div>
                        <div>
                          <div style={{fontFamily:O.mono,fontSize:8,color:O.textF,letterSpacing:"2px",marginBottom:5}}>RATE ($/hr)</div>
                          <input value={inviteForm.rate} onChange={e=>setInviteForm(p=>({...p,rate:e.target.value}))}
                            type="number" placeholder="15.00"
                            style={{width:"100%",padding:"9px 12px",background:"rgba(255,255,255,0.05)",
                              border:"1px solid rgba(139,92,246,0.2)",borderRadius:7,fontFamily:O.mono,
                              fontSize:12,color:"#fff",outline:"none",boxSizing:"border-box"}}/>
                        </div>
                      </div>
                      <div style={{marginBottom:16}}>
                        <div style={{fontFamily:O.mono,fontSize:8,color:O.textF,letterSpacing:"2px",marginBottom:5}}>DEPARTMENT</div>
                        <select value={inviteForm.dept} onChange={e=>setInviteForm(p=>({...p,dept:e.target.value}))}
                          style={{width:"100%",padding:"9px 12px",background:"rgba(9,14,26,0.9)",
                            border:"1px solid rgba(139,92,246,0.2)",borderRadius:7,fontFamily:O.mono,
                            fontSize:11,color:"#fff",outline:"none",cursor:"pointer",boxSizing:"border-box"}}>
                          {["Front End","Sales Floor","Inventory","Operations","Security","Management","Kitchen","Bar","Service"].map(d=>(
                            <option key={d} value={d} style={{background:"#0d1623"}}>{d}</option>
                          ))}
                        </select>
                      </div>
                      {inviteErr&&(
                        <div style={{fontFamily:O.mono,fontSize:9,color:O.red,marginBottom:12,
                          padding:"7px 10px",background:"rgba(239,68,68,0.07)",
                          border:"1px solid rgba(239,68,68,0.2)",borderRadius:6}}>{inviteErr}</div>
                      )}
                      <button
                        onClick={async()=>{
                          if(!inviteForm.firstName||!inviteForm.lastName||!inviteForm.email){
                            setInviteErr("Please fill in name and email.");return;
                          }
                          setInviteBusy(true);setInviteErr("");
                          try{
                            const res=await fetch("/api/invite",{method:"POST",
                              headers:{"Content-Type":"application/json"},
                              body:JSON.stringify({email:inviteForm.email,firstName:inviteForm.firstName,
                                lastName:inviteForm.lastName,orgId:ownerProfile?.org_id||null,
                                locationId:activeLocation?.id||ownerProfile?.location_id||null,
                                role:inviteForm.role||"Employee",
                                department:inviteForm.dept,hourlyRate:inviteForm.rate})});
                            const result=await res.json();
                            if(!res.ok) throw new Error(result.error||"Invite failed");
                            const {createClient}=await import("@supabase/supabase-js");
                            const sb=createClient(process.env.NEXT_PUBLIC_SUPABASE_URL,process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
                            const {data:emps}=await sb.from("users").select("*")
                              .eq("org_id",ownerProfile?.org_id).in("status",["active","invited"])
                              .in("app_role",["employee","supervisor"]).order("first_name");
                            if(emps) setLiveEmps(emps.map(e=>({
                              id:e.id,name:e.first_name+" "+e.last_name,first:e.first_name,
                              role:e.role||"Employee",dept:e.department||"",
                              rate:parseFloat(e.hourly_rate)||15,
                              avatar:e.avatar_initials||"?",color:e.avatar_color||"#6366f1",
                              email:"",status:e.status,hired:"",wkHrs:0,moHrs:0,ot:0,
                              cam:85,prod:80,rel:85,flags:0,streak:0,shifts:0,
                              risk:"Low",ghost:0,orgId:e.org_id,locId:e.location_id,
                              appRole:e.app_role,pin:"",
                            })));
                            setInviteDone("Invite sent to "+inviteForm.email+"!");
                          }catch(err){
                            setInviteErr(err.message||"Failed. Try again.");
                          }finally{setInviteBusy(false);}
                        }}
                        style={{width:"100%",padding:"13px",
                          background:inviteBusy?"rgba(139,92,246,0.4)":"linear-gradient(135deg,#8b5cf6,#6366f1)",
                          border:"none",borderRadius:9,fontFamily:O.sans,fontWeight:700,fontSize:14,
                          color:"#fff",cursor:inviteBusy?"not-allowed":"pointer",
                          boxShadow:"0 4px 20px rgba(139,92,246,0.3)"}}>
                        {inviteBusy?"Sending...":"Send Invite"}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Location context strip */}
            <div style={{display:"flex",alignItems:"center",gap:10,
              padding:"10px 14px",background:"rgba(6,182,212,0.05)",
              border:"1px solid rgba(6,182,212,0.12)",
              borderRadius:9,marginBottom:16}}>
              <span style={{fontSize:13}}>📍</span>
              <span style={{fontFamily:O.mono,fontSize:9,color:"#06b6d4",letterSpacing:1,flex:1}}>
                {activeLocation?.name||"All Locations"} — {liveEmps?.length||0} employee{(liveEmps?.length||0)!==1?"s":""}
              </span>
              {liveLocations.length>1&&(
                <button onClick={()=>setLocSwitcherOpen(true)}
                  style={{fontFamily:O.mono,fontSize:8,color:"#06b6d4",background:"none",
                    border:"1px solid rgba(6,182,212,0.2)",borderRadius:5,
                    padding:"4px 10px",cursor:"pointer",letterSpacing:1}}>
                  SWITCH
                </button>
              )}
              <button onClick={()=>setAddLocOpen(true)}
                style={{fontFamily:O.mono,fontSize:8,color:O.green,background:"none",
                  border:"1px solid rgba(16,185,129,0.2)",borderRadius:5,
                  padding:"4px 10px",cursor:"pointer",letterSpacing:1}}>
                + ADD LOCATION
              </button>
            </div>

            <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:20}}>
              <div>
                <div style={{fontFamily:O.mono,fontSize:8,color:"#8b5cf6",letterSpacing:"2.5px",marginBottom:4}}>STAFF MANAGEMENT</div>
                <div style={{fontFamily:O.sans,fontWeight:800,fontSize:22,color:"#fff"}}>
                  Your Team
                  {liveEmps&&liveEmps.length>0&&(
                    <span style={{fontFamily:O.mono,fontSize:12,color:O.textD,fontWeight:400,marginLeft:10}}>
                      {liveEmps.length} member{liveEmps.length!==1?"s":""}
                    </span>
                  )}
                </div>
              </div>
              <button onClick={()=>setShowInvite(true)}
                style={{display:"flex",alignItems:"center",gap:8,padding:"11px 20px",
                  background:"linear-gradient(135deg,#8b5cf6,#6366f1)",border:"none",
                  borderRadius:10,fontFamily:O.sans,fontWeight:700,fontSize:14,
                  color:"#fff",cursor:"pointer",boxShadow:"0 4px 18px rgba(139,92,246,0.35)"}}>
                + Invite Employee
              </button>
            </div>

            {liveEmps===null&&(
              <div style={{textAlign:"center",padding:"60px 20px"}}>
                <div style={{fontFamily:O.mono,fontSize:10,color:O.textD,letterSpacing:2}}>LOADING...</div>
              </div>
            )}
            {liveEmps!==null&&liveEmps.length===0&&(
              <div style={{textAlign:"center",padding:"80px 20px"}}>
                <div style={{fontFamily:O.sans,fontWeight:700,fontSize:20,color:"#fff",marginBottom:8}}>No employees yet</div>
                <div style={{fontFamily:O.sans,fontSize:14,color:O.textD,lineHeight:1.7,maxWidth:360,margin:"0 auto 24px"}}>
                  Click Invite Employee to add your first team member.
                  They will receive an email to set their password and access their Work Hub.
                </div>
                <button onClick={()=>setShowInvite(true)}
                  style={{padding:"13px 28px",background:"linear-gradient(135deg,#8b5cf6,#6366f1)",
                    border:"none",borderRadius:10,fontFamily:O.sans,fontWeight:700,fontSize:14,
                    color:"#fff",cursor:"pointer",boxShadow:"0 4px 18px rgba(139,92,246,0.3)"}}>
                  Invite Your First Employee
                </button>
              </div>
            )}
            {liveEmps!==null&&liveEmps.length>0&&(
              <div style={{display:"flex",flexDirection:"column",gap:10}}>
                {liveEmps.map(emp=>(
                  <div key={emp.id}
                    style={{background:O.bg2,border:"1px solid "+O.border,
                      borderRadius:12,padding:"16px 18px",
                      display:"flex",alignItems:"center",gap:14}}>
                    <div style={{width:44,height:44,borderRadius:"50%",flexShrink:0,
                      background:emp.color||"#6366f1",display:"flex",alignItems:"center",
                      justifyContent:"center",fontFamily:O.mono,fontWeight:700,fontSize:14,color:"#fff"}}>
                      {emp.avatar||"?"}
                    </div>
                    <div style={{flex:1}}>
                      <div style={{fontFamily:O.sans,fontWeight:700,fontSize:15,color:"#fff",marginBottom:2}}>
                        {emp.name}
                      </div>
                      <div style={{fontFamily:O.sans,fontSize:12,color:O.textD}}>
                        {emp.role}{emp.dept?" - "+emp.dept:""}
                      </div>
                    </div>
                    <div style={{textAlign:"right",flexShrink:0}}>
                      <div style={{fontFamily:O.mono,fontSize:13,color:O.amber,fontWeight:600}}>
                        ${(emp.rate||15).toFixed(2)}/hr
                      </div>
                    </div>
                    <div style={{flexShrink:0,padding:"4px 10px",borderRadius:20,
                      fontFamily:O.mono,fontSize:8,letterSpacing:"1.5px",fontWeight:600,
                      background:emp.status==="active"?"rgba(16,185,129,0.12)":"rgba(245,158,11,0.12)",
                      border:"1px solid "+(emp.status==="active"?"rgba(16,185,129,0.3)":"rgba(245,158,11,0.3)"),
                      color:emp.status==="active"?O.green:O.amber}}>
                      {emp.status==="active"?"ACTIVE":"INVITED"}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {tab==="schedule" && (
          <div style={{animation:"fadeUp 0.3s ease",padding:"0 0 40px"}}>

            {/* Add Shift Modal */}
            {selectedCell&&(
              <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.8)",
                zIndex:500,display:"flex",alignItems:"center",justifyContent:"center",
                padding:"20px",backdropFilter:"blur(8px)"}}
                onClick={e=>{if(e.target===e.currentTarget) setSelectedCell(null);}}>
                <div style={{background:O.bg2,border:"1px solid rgba(6,182,212,0.3)",
                  borderRadius:16,padding:"28px",width:"100%",maxWidth:420,
                  animation:"fadeUp 0.3s ease",boxShadow:"0 20px 60px rgba(0,0,0,0.5)"}}>
                  <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:20}}>
                    <div>
                      <div style={{fontFamily:O.mono,fontSize:8,color:"#06b6d4",letterSpacing:"2px",marginBottom:4}}>ADD SHIFT</div>
                      <div style={{fontFamily:O.sans,fontWeight:700,fontSize:18,color:"#fff"}}>
                        {selectedCell.day} — {selectedCell.emp?selectedCell.emp.name:"Select employee"}
                      </div>
                    </div>
                    <button onClick={()=>setSelectedCell(null)}
                      style={{background:"none",border:"none",color:O.textF,fontSize:22,cursor:"pointer"}}>×</button>
                  </div>
                  {(()=>{
                    const modalEmps = liveEmps||[];
                    const HOURS_LIST = [6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23];
                    const fmtH = h => h===0?"12:00 AM":h<12?h+":00 AM":h===12?"12:00 PM":(h-12)+":00 PM";
                    const [selEmpId,setSelEmpId] = [selectedCell.empId, (v)=>setSelectedCell(p=>({...p,empId:v}))];
                    const [startH,setStartH] = [selectedCell.start||9, (v)=>setSelectedCell(p=>({...p,start:parseInt(v)}))];
                    const [endH,setEndH]     = [selectedCell.end||17,   (v)=>setSelectedCell(p=>({...p,end:parseInt(v)}))];
                    const [roleLabel,setRoleLabel] = [selectedCell.roleLabel||"", (v)=>setSelectedCell(p=>({...p,roleLabel:v}))];
                    return (
                      <div>
                        <div style={{marginBottom:12}}>
                          <div style={{fontFamily:O.mono,fontSize:8,color:O.textF,letterSpacing:"2px",marginBottom:5}}>EMPLOYEE</div>
                          <select value={selEmpId||""} onChange={e=>setSelEmpId(e.target.value)}
                            style={{width:"100%",padding:"9px 12px",background:"rgba(9,14,26,0.9)",
                              border:"1px solid rgba(6,182,212,0.2)",borderRadius:7,fontFamily:O.mono,
                              fontSize:12,color:"#fff",outline:"none",cursor:"pointer",boxSizing:"border-box"}}>
                            <option value="" style={{background:"#0d1623"}}>— Select employee —</option>
                            {modalEmps.map(e=>(
                              <option key={e.id} value={e.id} style={{background:"#0d1623"}}>{e.name} — {e.role}</option>
                            ))}
                          </select>
                        </div>
                        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:12}}>
                          <div>
                            <div style={{fontFamily:O.mono,fontSize:8,color:O.textF,letterSpacing:"2px",marginBottom:5}}>START TIME</div>
                            <select value={startH} onChange={e=>setStartH(e.target.value)}
                              style={{width:"100%",padding:"9px 12px",background:"rgba(9,14,26,0.9)",
                                border:"1px solid rgba(6,182,212,0.2)",borderRadius:7,fontFamily:O.mono,
                                fontSize:11,color:"#fff",outline:"none",cursor:"pointer",boxSizing:"border-box"}}>
                              {HOURS_LIST.map(h=><option key={h} value={h} style={{background:"#0d1623"}}>{fmtH(h)}</option>)}
                            </select>
                          </div>
                          <div>
                            <div style={{fontFamily:O.mono,fontSize:8,color:O.textF,letterSpacing:"2px",marginBottom:5}}>END TIME</div>
                            <select value={endH} onChange={e=>setEndH(e.target.value)}
                              style={{width:"100%",padding:"9px 12px",background:"rgba(9,14,26,0.9)",
                                border:"1px solid rgba(6,182,212,0.2)",borderRadius:7,fontFamily:O.mono,
                                fontSize:11,color:"#fff",outline:"none",cursor:"pointer",boxSizing:"border-box"}}>
                              {HOURS_LIST.filter(h=>h>startH).map(h=><option key={h} value={h} style={{background:"#0d1623"}}>{fmtH(h)}</option>)}
                            </select>
                          </div>
                        </div>
                        <div style={{marginBottom:16}}>
                          <div style={{fontFamily:O.mono,fontSize:8,color:O.textF,letterSpacing:"2px",marginBottom:5}}>ROLE LABEL (optional)</div>
                          <input value={roleLabel} onChange={e=>setRoleLabel(e.target.value)}
                            placeholder="e.g. Opening, Closing, Bar..."
                            style={{width:"100%",padding:"9px 12px",background:"rgba(255,255,255,0.05)",
                              border:"1px solid rgba(6,182,212,0.2)",borderRadius:7,fontFamily:O.mono,
                              fontSize:12,color:"#fff",outline:"none",boxSizing:"border-box"}}/>
                        </div>
                        <button
                          onClick={async()=>{
                            if(!selEmpId){return;}
                            const mon=getMonday();
                            const DAYS_ORDER=["Mon","Tue","Wed","Thu","Fri","Sat","Sun"];
                            const dayIdx=DAYS_ORDER.indexOf(selectedCell.day);
                            const shiftDate=new Date(mon);
                            shiftDate.setDate(shiftDate.getDate()+dayIdx);
                            await addShift({
                              userId:selEmpId,
                              weekStart:mon,
                              day:selectedCell.day,
                              date:shiftDate.toISOString().split("T")[0],
                              start:startH,
                              end:endH,
                              role:roleLabel,
                            });
                            setSelectedCell(null);
                          }}
                          style={{width:"100%",padding:"13px",
                            background:"linear-gradient(135deg,#06b6d4,#0891b2)",
                            border:"none",borderRadius:9,fontFamily:O.sans,fontWeight:700,fontSize:14,
                            color:"#fff",cursor:"pointer",boxShadow:"0 4px 18px rgba(6,182,212,0.3)"}}>
                          Add Shift →
                        </button>
                      </div>
                    );
                  })()}
                </div>
              </div>
            )}

            {/* Location context */}
            <div style={{display:"flex",alignItems:"center",gap:10,
              padding:"8px 14px",background:"rgba(6,182,212,0.04)",
              border:"1px solid rgba(6,182,212,0.1)",borderRadius:8,marginBottom:14}}>
              <span style={{fontSize:12}}>📍</span>
              <span style={{fontFamily:O.mono,fontSize:9,color:"#06b6d4",letterSpacing:1,flex:1}}>
                {activeLocation?.name||"All Locations"}
              </span>
              {liveLocations.length>1&&(
                <button onClick={()=>setLocSwitcherOpen(true)}
                  style={{fontFamily:O.mono,fontSize:8,color:O.textF,background:"none",
                    border:"1px solid "+O.border,borderRadius:4,padding:"3px 8px",
                    cursor:"pointer",letterSpacing:1}}>
                  SWITCH LOCATION
                </button>
              )}
              <button onClick={()=>setAddLocOpen(true)}
                style={{fontFamily:O.mono,fontSize:8,color:O.green,background:"none",
                  border:"1px solid rgba(16,185,129,0.2)",borderRadius:4,
                  padding:"3px 8px",cursor:"pointer",letterSpacing:1}}>
                + ADD
              </button>
            </div>

            {/* Header */}
            <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:20}}>
              <div>
                <div style={{fontFamily:O.mono,fontSize:8,color:"#06b6d4",letterSpacing:"2.5px",marginBottom:4}}>SCHEDULE BUILDER</div>
                <div style={{fontFamily:O.sans,fontWeight:800,fontSize:22,color:"#fff"}}>This Week</div>
              </div>
              <div style={{display:"flex",gap:10,alignItems:"center"}}>
                {liveShifts!==null&&liveShifts.length>0&&!schedPublished&&(
                  <button onClick={()=>{
                    const mon=getMonday();
                    publishSchedule(mon);
                  }}
                    style={{padding:"10px 20px",background:"linear-gradient(135deg,#10b981,#059669)",
                      border:"none",borderRadius:9,fontFamily:O.sans,fontWeight:700,fontSize:13,
                      color:"#fff",cursor:"pointer",boxShadow:"0 4px 14px rgba(16,185,129,0.3)"}}>
                    📣 Publish Schedule
                  </button>
                )}
                {schedPublished&&(
                  <div style={{padding:"10px 20px",background:"rgba(16,185,129,0.12)",
                    border:"1px solid rgba(16,185,129,0.3)",borderRadius:9,
                    fontFamily:O.mono,fontSize:11,color:O.green,letterSpacing:1}}>
                    ✅ PUBLISHED
                  </div>
                )}
              </div>
            </div>

            {/* No employees */}
            {liveEmps!==null&&liveEmps.length===0&&(
              <div style={{textAlign:"center",padding:"60px 20px"}}>
                <div style={{background:"rgba(245,158,11,0.06)",border:"1px solid rgba(245,158,11,0.2)",
                  borderRadius:12,padding:"24px",maxWidth:480,margin:"0 auto",
                  display:"flex",gap:14,alignItems:"flex-start",textAlign:"left"}}>
                  <span style={{fontSize:28,flexShrink:0}}>💡</span>
                  <div>
                    <div style={{fontFamily:O.sans,fontWeight:700,fontSize:15,color:O.amber,marginBottom:6}}>
                      Invite employees before scheduling
                    </div>
                    <div style={{fontFamily:O.sans,fontSize:13,color:O.textD,lineHeight:1.6,marginBottom:12}}>
                      Add your team from the Staff tab first, then come back here to build their schedule.
                    </div>
                    <button onClick={()=>setTab("staff")}
                      style={{padding:"8px 18px",background:"rgba(245,158,11,0.1)",
                        border:"1px solid rgba(245,158,11,0.25)",borderRadius:7,
                        fontFamily:O.mono,fontSize:9,letterSpacing:1,color:O.amber,cursor:"pointer"}}>
                      GO TO STAFF →
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Loading shifts */}
            {liveShifts===null&&ownerProfile?.org_id&&(()=>{
              loadShifts(ownerProfile.org_id, getMonday(), activeLocation?.id||null);
              return (
                <div style={{textAlign:"center",padding:"40px 20px"}}>
                  <div style={{fontFamily:O.mono,fontSize:10,color:O.textD,letterSpacing:2,animation:"blink 1.5s infinite"}}>
                    LOADING SCHEDULE…
                  </div>
                </div>
              );
            })()}

            {/* Schedule grid */}
            {liveEmps!==null&&liveEmps.length>0&&liveShifts!==null&&(()=>{
              const STAFF = liveEmps;
              const DAYS_FULL = ["Mon","Tue","Wed","Thu","Fri","Sat","Sun"];
              const fmtH = h => h===0?"12a":h<12?h+"a":h===12?"12p":(h-12)+"p";

              // Build grid: day → user_id → shifts
              const grid = {};
              DAYS_FULL.forEach(d=>{ grid[d]={}; STAFF.forEach(e=>{ grid[d][e.id]=[]; }); });
              (liveShifts||[]).forEach(sh=>{
                const d=sh.day_of_week;
                if(grid[d]&&grid[d][sh.user_id]) grid[d][sh.user_id].push(sh);
                else if(grid[d]) grid[d][sh.user_id]=[sh];
              });

              return (
                <div>
                  {/* Grid header */}
                  <div style={{display:"grid",gridTemplateColumns:"140px repeat(7,1fr)",gap:4,marginBottom:4}}>
                    <div style={{fontFamily:O.mono,fontSize:8,color:O.textF,letterSpacing:1,
                      padding:"8px 10px"}}>EMPLOYEE</div>
                    {DAYS_FULL.map(d=>(
                      <div key={d} style={{fontFamily:O.mono,fontSize:9,color:O.textD,
                        letterSpacing:1,padding:"8px",textAlign:"center",
                        background:O.bg2,borderRadius:6,fontWeight:600}}>{d}</div>
                    ))}
                  </div>

                  {/* Grid rows */}
                  {STAFF.map(emp=>(
                    <div key={emp.id} style={{display:"grid",gridTemplateColumns:"140px repeat(7,1fr)",gap:4,marginBottom:4}}>
                      {/* Employee label */}
                      <div style={{display:"flex",alignItems:"center",gap:8,padding:"6px 4px"}}>
                        <div style={{width:28,height:28,borderRadius:"50%",flexShrink:0,
                          background:emp.color||"#6366f1",display:"flex",alignItems:"center",
                          justifyContent:"center",fontFamily:O.mono,fontSize:10,
                          fontWeight:700,color:"#fff"}}>
                          {emp.avatar||"?"}
                        </div>
                        <div style={{minWidth:0}}>
                          <div style={{fontFamily:O.sans,fontWeight:600,fontSize:11,
                            color:"#fff",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>
                            {emp.first||emp.name.split(" ")[0]}
                          </div>
                          <div style={{fontFamily:O.mono,fontSize:8,color:O.textF}}>{emp.role}</div>
                        </div>
                      </div>

                      {/* Day cells */}
                      {DAYS_FULL.map(day=>{
                        const dayShifts=(grid[day]&&grid[day][emp.id])||[];
                        return (
                          <div key={day}
                            style={{minHeight:56,background:O.bg2,borderRadius:6,
                              padding:"4px",position:"relative",cursor:"pointer",
                              border:"1px solid "+O.border,transition:"border-color 0.15s"}}
                            onMouseEnter={e=>e.currentTarget.style.borderColor="rgba(6,182,212,0.4)"}
                            onMouseLeave={e=>e.currentTarget.style.borderColor=O.border}
                            onClick={()=>setSelectedCell({day,empId:emp.id,emp,start:9,end:17,roleLabel:""})}>
                            {dayShifts.length===0&&(
                              <div style={{height:"100%",display:"flex",alignItems:"center",
                                justifyContent:"center",color:"rgba(255,255,255,0.1)",fontSize:16}}>+</div>
                            )}
                            {dayShifts.map(sh=>(
                              <div key={sh.id}
                                style={{background:emp.color+"22",border:"1px solid "+emp.color+"55",
                                  borderRadius:4,padding:"3px 6px",marginBottom:2,
                                  display:"flex",alignItems:"center",justifyContent:"space-between"}}>
                                <span style={{fontFamily:O.mono,fontSize:8,color:emp.color||"#fff",fontWeight:600}}>
                                  {fmtH(sh.start_hour)}–{fmtH(sh.end_hour)}
                                </span>
                                <button
                                  onClick={async(e)=>{
                                    e.stopPropagation();
                                    await removeShift(sh.id, getMonday());
                                  }}
                                  style={{background:"none",border:"none",color:"rgba(255,255,255,0.3)",
                                    fontSize:12,cursor:"pointer",lineHeight:1,padding:"0 2px"}}>
                                  ×
                                </button>
                              </div>
                            ))}
                          </div>
                        );
                      })}
                    </div>
                  ))}

                  {liveShifts.length===0&&(
                    <div style={{textAlign:"center",padding:"30px",
                      fontFamily:O.sans,fontSize:13,color:O.textD}}>
                      Click any cell to add a shift for that employee and day.
                    </div>
                  )}
                </div>
              );
            })()}

          </div>
        )}


        {tab==="roi" && (
          <div style={{animation:"fadeUp 0.3s ease",padding:"0 0 40px"}}>

            {/* Load real clock events */}
            {livePayroll===null&&ownerProfile?.org_id&&(()=>{
              const load=async()=>{
                try{
                  const {createClient}=await import("@supabase/supabase-js");
                  const sb=createClient(process.env.NEXT_PUBLIC_SUPABASE_URL,process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
                  const start=new Date();start.setDate(start.getDate()-14);
                  let payQ=sb.from("clock_events")
                    .select("*, users(first_name,last_name,hourly_rate,role,avatar_initials,avatar_color)")
                    .eq("org_id",ownerProfile.org_id)
                    .gte("occurred_at",start.toISOString())
                    .order("occurred_at",{ascending:true});
                  if(activeLocation) payQ=payQ.eq("location_id",activeLocation.id);
                  const {data:events}=await payQ;
                  setLivePayroll(events||[]);
                }catch(e){ setLivePayroll([]); }
              };
              load();
              return null;
            })()}

            {/* Location context */}
            <div style={{display:"flex",alignItems:"center",gap:10,
              padding:"8px 14px",background:"rgba(6,182,212,0.04)",
              border:"1px solid rgba(6,182,212,0.1)",borderRadius:8,marginBottom:14}}>
              <span style={{fontSize:12}}>📍</span>
              <span style={{fontFamily:O.mono,fontSize:9,color:"#06b6d4",letterSpacing:1,flex:1}}>
                {activeLocation?.name||"All Locations"}
              </span>
              {liveLocations.length>1&&(
                <button onClick={()=>setLocSwitcherOpen(true)}
                  style={{fontFamily:O.mono,fontSize:8,color:O.textF,background:"none",
                    border:"1px solid "+O.border,borderRadius:4,padding:"3px 8px",
                    cursor:"pointer",letterSpacing:1}}>
                  SWITCH
                </button>
              )}
            </div>

            {/* Header */}
            <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:20}}>
              <div>
                <div style={{fontFamily:O.mono,fontSize:8,color:O.green,letterSpacing:"2.5px",marginBottom:4}}>PAYROLL TRACKING</div>
                <div style={{fontFamily:O.sans,fontWeight:800,fontSize:22,color:"#fff"}}>Hours & Pay</div>
              </div>
              {livePayroll!==null&&livePayroll.length>0&&(
                <button
                  onClick={()=>{
                    const byUser={};
                    livePayroll.forEach(ev=>{
                      if(!byUser[ev.user_id]) byUser[ev.user_id]={events:[],user:ev.users};
                      byUser[ev.user_id].events.push(ev);
                    });
                    const rows=["Name,Role,Hours,Regular Pay,OT Hours,OT Pay,Total Pay"];
                    Object.values(byUser).forEach(({events,user})=>{
                      let totalMins=0,clockIn=null;
                      const sorted=[...events].sort((a,b)=>new Date(a.occurred_at)-new Date(b.occurred_at));
                      sorted.forEach(ev=>{
                        if(ev.event_type==="clock_in") clockIn=new Date(ev.occurred_at);
                        if(ev.event_type==="clock_out"&&clockIn){
                          totalMins+=(new Date(ev.occurred_at)-clockIn)/60000;
                          clockIn=null;
                        }
                      });
                      const hrs=totalMins/60;
                      const rate=parseFloat(user?.hourly_rate)||15;
                      const regHrs=Math.min(hrs,40);
                      const otHrs=Math.max(hrs-40,0);
                      const totalPay=regHrs*rate+otHrs*rate*1.5;
                      rows.push([
                        (user?.first_name||"")+" "+(user?.last_name||""),
                        user?.role||"",
                        hrs.toFixed(2),
                        (regHrs*rate).toFixed(2),
                        otHrs.toFixed(2),
                        (otHrs*rate*1.5).toFixed(2),
                        totalPay.toFixed(2)
                      ].join(","));
                    });
                    const blob=new Blob([rows.join("\n")],{type:"text/csv"});
                    const url=URL.createObjectURL(blob);
                    const a=document.createElement("a");
                    a.href=url;a.download="payroll-export.csv";a.click();
                    URL.revokeObjectURL(url);
                  }}
                  style={{display:"flex",alignItems:"center",gap:7,padding:"9px 16px",
                    background:"rgba(16,185,129,0.1)",border:"1px solid rgba(16,185,129,0.25)",
                    borderRadius:8,fontFamily:O.mono,fontSize:9,letterSpacing:1,
                    color:O.green,cursor:"pointer"}}>
                  📥 EXPORT CSV
                </button>
              )}
            </div>

            {/* Loading */}
            {livePayroll===null&&(
              <div style={{textAlign:"center",padding:"60px 20px"}}>
                <div style={{fontFamily:O.mono,fontSize:10,color:O.textD,letterSpacing:2,animation:"blink 1.5s infinite"}}>
                  LOADING PAYROLL DATA…
                </div>
              </div>
            )}

            {/* No employees yet */}
            {livePayroll!==null&&liveEmps!==null&&liveEmps.length===0&&(
              <div style={{textAlign:"center",padding:"60px 20px"}}>
                <div style={{fontSize:52,marginBottom:14}}>💵</div>
                <div style={{fontFamily:O.sans,fontWeight:700,fontSize:20,color:"#fff",marginBottom:8}}>No payroll data yet</div>
                <div style={{fontFamily:O.sans,fontSize:14,color:O.textD,lineHeight:1.7,maxWidth:400,margin:"0 auto 24px"}}>
                  Hours appear here automatically as employees clock in.
                  Invite your team first, then publish a schedule.
                </div>
                <button onClick={()=>setTab("staff")}
                  style={{padding:"11px 24px",background:"rgba(16,185,129,0.1)",
                    border:"1px solid rgba(16,185,129,0.3)",borderRadius:9,
                    fontFamily:O.sans,fontWeight:600,fontSize:13,color:O.green,cursor:"pointer"}}>
                  Go to Staff →
                </button>
              </div>
            )}

            {/* No clock events yet but has employees */}
            {livePayroll!==null&&livePayroll.length===0&&liveEmps!==null&&liveEmps.length>0&&(
              <div style={{textAlign:"center",padding:"60px 20px"}}>
                <div style={{fontSize:52,marginBottom:14}}>⏱</div>
                <div style={{fontFamily:O.sans,fontWeight:700,fontSize:20,color:"#fff",marginBottom:8}}>No clock events yet</div>
                <div style={{fontFamily:O.sans,fontSize:14,color:O.textD,lineHeight:1.7,maxWidth:400,margin:"0 auto 24px"}}>
                  Hours appear here automatically as employees clock in via their Work Hub.
                  Publish a schedule so they know when to work.
                </div>
                <button onClick={()=>setTab("schedule")}
                  style={{padding:"11px 24px",background:"rgba(245,158,11,0.1)",
                    border:"1px solid rgba(245,158,11,0.3)",borderRadius:9,
                    fontFamily:O.sans,fontWeight:600,fontSize:13,color:O.amber,cursor:"pointer"}}>
                  Build Schedule →
                </button>
              </div>
            )}

            {/* Real payroll data */}
            {livePayroll!==null&&livePayroll.length>0&&(()=>{
              const byUser={};
              livePayroll.forEach(ev=>{
                if(!byUser[ev.user_id]) byUser[ev.user_id]={events:[],user:ev.users};
                byUser[ev.user_id].events.push(ev);
              });
              const payRows=Object.entries(byUser).map(([uid,{events,user}])=>{
                let totalMins=0,clockIn=null;
                const sorted=[...events].sort((a,b)=>new Date(a.occurred_at)-new Date(b.occurred_at));
                sorted.forEach(ev=>{
                  if(ev.event_type==="clock_in") clockIn=new Date(ev.occurred_at);
                  if(ev.event_type==="clock_out"&&clockIn){
                    totalMins+=(new Date(ev.occurred_at)-clockIn)/60000;
                    clockIn=null;
                  }
                });
                const hrs=Math.round(totalMins/60*100)/100;
                const rate=parseFloat(user?.hourly_rate)||15;
                const regHrs=Math.min(hrs,40);
                const otHrs=Math.max(hrs-40,0);
                const totalPay=regHrs*rate+otHrs*rate*1.5;
                const avatar=(user?.avatar_initials)||"?";
                const color=(user?.avatar_color)||"#6366f1";
                const name=(user?.first_name||"")+" "+(user?.last_name||"");
                return {uid,name,avatar,color,role:user?.role||"",rate,hrs,regHrs,otHrs,totalPay};
              }).filter(r=>r.hrs>0).sort((a,b)=>b.totalPay-a.totalPay);

              const totalLabor=payRows.reduce((s,r)=>s+r.totalPay,0);
              const totalHrs=payRows.reduce((s,r)=>s+r.hrs,0);

              return (
                <div>
                  {/* Summary cards */}
                  <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:12,marginBottom:20}}>
                    {[
                      {l:"TOTAL HOURS",v:totalHrs.toFixed(1)+"h",c:O.amber},
                      {l:"EMPLOYEES PAID",v:payRows.length,c:"#8b5cf6"},
                      {l:"TOTAL LABOR COST",v:"$"+totalLabor.toFixed(2),c:O.green},
                    ].map(s=>(
                      <div key={s.l} style={{background:O.bg2,border:"1px solid "+O.border,
                        borderRadius:10,padding:"14px 16px",textAlign:"center"}}>
                        <div style={{fontFamily:O.mono,fontSize:7,color:O.textF,letterSpacing:2,marginBottom:6}}>{s.l}</div>
                        <div style={{fontFamily:O.mono,fontSize:20,color:s.c,fontWeight:600}}>{s.v}</div>
                      </div>
                    ))}
                  </div>

                  {/* Employee rows */}
                  <div style={{display:"flex",flexDirection:"column",gap:8}}>
                    {payRows.map(r=>(
                      <div key={r.uid} style={{background:O.bg2,border:"1px solid "+O.border,
                        borderRadius:12,padding:"16px 18px",
                        display:"flex",alignItems:"center",gap:14}}>
                        <div style={{width:40,height:40,borderRadius:"50%",flexShrink:0,
                          background:r.color,display:"flex",alignItems:"center",
                          justifyContent:"center",fontFamily:O.mono,fontWeight:700,
                          fontSize:13,color:"#fff"}}>
                          {r.avatar}
                        </div>
                        <div style={{flex:1}}>
                          <div style={{fontFamily:O.sans,fontWeight:700,fontSize:14,color:"#fff",marginBottom:2}}>{r.name}</div>
                          <div style={{fontFamily:O.sans,fontSize:11,color:O.textD}}>{r.role} · ${r.rate}/hr</div>
                        </div>
                        <div style={{textAlign:"right",flexShrink:0}}>
                          <div style={{fontFamily:O.mono,fontSize:12,color:O.amber,fontWeight:600,marginBottom:2}}>
                            {r.hrs.toFixed(2)}h
                            {r.otHrs>0&&<span style={{color:O.red,fontSize:10,marginLeft:6}}>+{r.otHrs.toFixed(1)}h OT</span>}
                          </div>
                          <div style={{fontFamily:O.mono,fontSize:9,color:O.textF,letterSpacing:1}}>TOTAL HOURS</div>
                        </div>
                        <div style={{textAlign:"right",flexShrink:0,minWidth:90}}>
                          <div style={{fontFamily:O.mono,fontSize:16,color:O.green,fontWeight:700}}>${r.totalPay.toFixed(2)}</div>
                          <div style={{fontFamily:O.mono,fontSize:8,color:O.textF,letterSpacing:1}}>GROSS PAY</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })()}

          </div>
        )}


        {tab==="cameras" && (
          <div style={{animation:"fadeUp 0.3s ease"}}>

            {/* Header */}
            <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:24}}>
              <span style={{fontSize:32}}>📷</span>
              <div>
                <div style={{fontFamily:O.mono,fontSize:8,color:"#00d4ff",
                  letterSpacing:"2.5px",marginBottom:3}}>CAMERA INTELLIGENCE</div>
                <div style={{fontFamily:O.sans,fontWeight:700,fontSize:22,color:"#fff"}}>
                  AI-Powered Camera Integration
                </div>
              </div>
            </div>

            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16}}>

              {/* Left: What's coming */}
              <div style={{background:"rgba(0,212,255,0.04)",
                border:"1px solid rgba(0,212,255,0.15)",
                borderRadius:16,padding:"24px"}}>
                <div style={{fontFamily:O.mono,fontSize:8,color:"#00d4ff",
                  letterSpacing:"2px",marginBottom:6}}>HEAVY PLAN · CORPORATE PLAN</div>
                <div style={{fontFamily:O.sans,fontWeight:700,fontSize:18,
                  color:"#fff",marginBottom:4}}>What's Coming</div>
                <div style={{fontFamily:O.sans,fontSize:13,color:O.textD,
                  marginBottom:20,lineHeight:1.6}}>
                  Full camera-to-payroll intelligence — the feature that makes ShiftPro
                  unlike anything else on the market.
                </div>
                <div style={{display:"flex",flexDirection:"column",gap:10,marginBottom:20}}>
                  {[
                    "Live RTSP camera feeds — all locations",
                    "Employee presence verification",
                    "Ghost hour cross-reference",
                    "Motion detection + incident alerts",
                    "Multi-location camera command center",
                    "Silent owner-only alerts",
                    "7-day / 30-day clip storage",
                  ].map((f,i)=>(
                    <div key={i} style={{display:"flex",alignItems:"center",gap:10}}>
                      <span style={{fontSize:14}}>🔒</span>
                      <span style={{fontFamily:O.mono,fontSize:11,color:O.textD}}>{f}</span>
                    </div>
                  ))}
                </div>
                <div style={{display:"inline-flex",alignItems:"center",gap:8,
                  fontFamily:O.mono,fontSize:9,color:"#00d4ff",letterSpacing:"2px",
                  background:"rgba(0,212,255,0.08)",border:"1px solid rgba(0,212,255,0.2)",
                  borderRadius:20,padding:"5px 14px"}}>
                  <div style={{width:6,height:6,borderRadius:"50%",background:"#00d4ff"}}/>
                  LAUNCHING Q3 2025
                </div>
                <div style={{display:"flex",gap:8,flexWrap:"wrap",marginTop:16}}>
                  {["12 cameras","RTSP + ONVIF","Hikvision","Dahua","Axis","Reolink"].map(b=>(
                    <div key={b} style={{fontFamily:O.mono,fontSize:8,color:O.textF,
                      background:O.bg3,borderRadius:4,padding:"3px 8px",letterSpacing:0.5}}>
                      {b}
                    </div>
                  ))}
                </div>
              </div>

              {/* Right: Join waitlist */}
              <div style={{background:O.bg2,border:"1px solid "+O.border,
                borderRadius:16,padding:"24px"}}>
                {waitlistDone?(
                  <div style={{textAlign:"center",padding:"40px 20px"}}>
                    <div style={{fontSize:44,marginBottom:12}}>🎉</div>
                    <div style={{fontFamily:O.sans,fontWeight:700,fontSize:18,
                      color:"#fff",marginBottom:8}}>You're on the list!</div>
                    <div style={{fontFamily:O.mono,fontSize:10,color:O.textD,lineHeight:1.7}}>
                      We'll notify you when Camera Intelligence launches.
                      As a current ShiftPro customer you get priority access and early-bird pricing.
                    </div>
                  </div>
                ):(
                  <div>
                    <div style={{fontFamily:O.mono,fontSize:8,color:O.amber,
                      letterSpacing:"2px",marginBottom:6}}>JOIN THE WAITLIST</div>
                    <div style={{fontFamily:O.sans,fontWeight:700,fontSize:18,
                      color:"#fff",marginBottom:4}}>Get Early Access</div>
                    <div style={{fontFamily:O.sans,fontSize:13,color:O.textD,
                      marginBottom:20,lineHeight:1.6}}>
                      Current ShiftPro Lite customers get priority access and
                      early-bird pricing when Camera AI launches.
                    </div>
                    <div style={{display:"flex",flexDirection:"column",gap:10,marginBottom:16}}>
                      {[
                        {l:"YOUR NAME",val:waitlistForm.name,k:"name",ph:"Alex Rivera"},
                        {l:"EMAIL",val:waitlistForm.email,k:"email",ph:"you@business.com"},
                        {l:"BUSINESS NAME",val:waitlistForm.biz,k:"biz",ph:"Sea Lion Dockside Bar"},
                      ].map(f=>(
                        <div key={f.k}>
                          <div style={{fontFamily:O.mono,fontSize:8,color:O.textF,
                            letterSpacing:"2px",marginBottom:5}}>{f.l}</div>
                          <input value={f.val}
                            onChange={e=>setWaitlistForm(p=>({...p,[f.k]:e.target.value}))}
                            placeholder={f.ph}
                            style={{width:"100%",padding:"9px 12px",
                              background:"rgba(255,255,255,0.05)",
                              border:"1px solid rgba(245,158,11,0.2)",
                              borderRadius:7,fontFamily:O.mono,fontSize:12,
                              color:"#fff",outline:"none",boxSizing:"border-box"}}/>
                        </div>
                      ))}
                    </div>
                    <button
                      onClick={()=>{
                        if(waitlistForm.name&&waitlistForm.email) setWaitlistDone(true);
                      }}
                      style={{width:"100%",padding:"12px",
                        background:"linear-gradient(135deg,#f59e0b,#f97316)",
                        border:"none",borderRadius:9,
                        fontFamily:O.sans,fontWeight:700,fontSize:14,
                        color:"#030c14",cursor:"pointer",
                        boxShadow:"0 4px 18px rgba(245,158,11,0.3)",marginBottom:12}}>
                      Join Waitlist →
                    </button>
                    <div style={{fontFamily:O.sans,fontSize:11,color:O.textF,
                      textAlign:"center",lineHeight:1.6}}>
                      You'll be among the first notified when camera integration launches.
                      Early customers get priority access and early-bird pricing.
                    </div>
                  </div>
                )}
              </div>
            </div>

          </div>
        )}




      </div>
    </div>
  );
}


// ══════════════════════════════════════════════════
//  ROOT
// ══════════════════════════════════════════════════
export default function App(){
  const [session,setSession]     = useState(null);
  const [appLoading,setAppLoading] = useState(true);
  const [resetMode,setResetMode]  = useState(false);
  const [newPw,setNewPw]          = useState("");
  const [newPw2,setNewPw2]        = useState("");
  const [pwErr,setPwErr]          = useState("");
  const [pwBusy,setPwBusy]        = useState(false);
  const [pwDone,setPwDone]        = useState(false);

  const login = (role,emp) => setSession({role,emp});
  const logout = async() => {
    try{
      const {createClient}=await import("@supabase/supabase-js");
      const sb=createClient(process.env.NEXT_PUBLIC_SUPABASE_URL,process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
      await sb.auth.signOut();
    }catch(e){}
    setSession(null);
  };

  // ── FIX 6: Session persistence on mount ──
  useEffect(()=>{
    const init = async() => {
      try{
        // Check for password reset token in URL hash
        if(typeof window!=="undefined"){
          const hash = window.location.hash;
          if(hash.includes("access_token")&&hash.includes("type=recovery")){
            setResetMode(true);
            setAppLoading(false);
            return;
          }
          if(hash.includes("access_token")&&hash.includes("type=invite")){
            setResetMode(true);
            setAppLoading(false);
            return;
          }
        }
        // Check for existing session
        const {createClient}=await import("@supabase/supabase-js");
        const sb=createClient(process.env.NEXT_PUBLIC_SUPABASE_URL,process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
        const {data:{session:existing}}=await sb.auth.getSession();
        if(existing?.user){
          const {data:profile}=await sb.from("users").select("*").eq("id",existing.user.id).single();
          if(profile){
            const role = profile.app_role==="owner"||profile.app_role==="manager"?"owner":"employee";
            const emp = {
              id:profile.id, name:profile.first_name+" "+profile.last_name,
              first:profile.first_name, role:profile.role,
              dept:profile.department||"", rate:parseFloat(profile.hourly_rate)||15,
              avatar:profile.avatar_initials||"?", color:profile.avatar_color||"#6366f1",
              email:existing.user.email, status:"active",
              hired:profile.hire_date||"", wkHrs:38.5, moHrs:152, ot:0,
              cam:90, prod:85, rel:90, flags:0, streak:1, shifts:4,
              risk:"Low", ghost:0,
              orgId:profile.org_id, locId:profile.location_id, appRole:profile.app_role,
            };
            setSession({role,emp});
          }
        }
      }catch(e){}
      setAppLoading(false);
    };
    init();
  },[]);

  // ── Password Reset / Invite Accept Handler ──
  const handleSetPassword = async() => {
    if(!newPw||!newPw2){setPwErr("Please enter and confirm your password.");return;}
    if(newPw!==newPw2){setPwErr("Passwords do not match.");return;}
    if(newPw.length<8){setPwErr("Password must be at least 8 characters.");return;}
    setPwBusy(true);setPwErr("");
    try{
      const {createClient}=await import("@supabase/supabase-js");
      const sb=createClient(process.env.NEXT_PUBLIC_SUPABASE_URL,process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
      const {error}=await sb.auth.updateUser({password:newPw});
      if(error)throw error;
      setPwDone(true);
      setTimeout(async()=>{
        const {data:{session:s}}=await sb.auth.getSession();
        if(s?.user){
          const {data:profile}=await sb.from("users").select("*").eq("id",s.user.id).single();
          const role=profile?.app_role==="owner"||profile?.app_role==="manager"?"owner":"employee";
          const emp=profile?{
            id:profile.id,name:profile.first_name+" "+profile.last_name,
            first:profile.first_name,role:profile.role,
            dept:profile.department||"",rate:parseFloat(profile.hourly_rate)||15,
            avatar:profile.avatar_initials||"?",color:profile.avatar_color||"#6366f1",
            email:s.user.email,status:"active",hired:profile.hire_date||"",
            wkHrs:38.5,moHrs:152,ot:0,cam:90,prod:85,rel:90,flags:0,streak:1,shifts:4,
            risk:"Low",ghost:0,orgId:profile.org_id,locId:profile.location_id,appRole:profile.app_role,
          }:null;
          if(typeof window!=="undefined") window.location.hash="";
          setResetMode(false);
          setSession({role,emp});
        }
      },1500);
    }catch(e){
      setPwErr(e.message||"Failed to set password. Please try again.");
    }finally{setPwBusy(false);}
  };

  if(appLoading) return(
    <div style={{minHeight:"100vh",background:"linear-gradient(135deg,#0f0c29,#302b63,#24243e)",
      display:"flex",alignItems:"center",justifyContent:"center"}}>
      <div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:11,
        color:"rgba(255,255,255,0.3)",letterSpacing:"3px",animation:"blink 1.5s infinite"}}>
        LOADING…
      </div>
    </div>
  );

  if(resetMode) return(
    <>
      <style>{FONTS}{GCSS}</style>
      <div style={{minHeight:"100vh",
        background:"linear-gradient(135deg,#0f0c29,#302b63,#24243e)",
        display:"flex",alignItems:"center",justifyContent:"center",
        fontFamily:"'Outfit',sans-serif",padding:"20px",position:"relative"}}>
        <div style={{position:"absolute",inset:0,
          backgroundImage:"radial-gradient(rgba(99,102,241,0.13) 1px,transparent 1px)",
          backgroundSize:"32px 32px",pointerEvents:"none"}}/>
        <div style={{position:"relative",width:"100%",maxWidth:420,animation:"fadeUp 0.5s ease"}}>
          <div style={{textAlign:"center",marginBottom:28}}>
            <div style={{display:"flex",justifyContent:"center",marginBottom:16,
              filter:"drop-shadow(0 16px 40px rgba(0,180,255,0.4))"}}>
              <LogoHero/>
            </div>
          </div>
          <div style={{background:"rgba(9,14,26,0.96)",
            border:"1px solid rgba(245,158,11,0.3)",
            borderRadius:16,padding:"30px 28px",
            boxShadow:"0 20px 60px rgba(0,0,0,0.5)"}}>
            {pwDone?(
              <div style={{textAlign:"center",padding:"10px 0"}}>
                <div style={{fontSize:44,marginBottom:12}}>✅</div>
                <div style={{fontFamily:"'Outfit',sans-serif",fontWeight:700,
                  fontSize:18,color:"#fff",marginBottom:8}}>Password set!</div>
                <div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:10,
                  color:"rgba(255,255,255,0.4)",letterSpacing:1,animation:"blink 1.5s infinite"}}>
                  Signing you in…
                </div>
              </div>
            ):(
              <div>
                <div style={{fontFamily:"'Outfit',sans-serif",fontWeight:800,
                  fontSize:22,color:"#fff",marginBottom:4}}>
                  Set your password
                </div>
                <div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:9,
                  color:"rgba(245,158,11,0.6)",letterSpacing:"1.5px",marginBottom:22}}>
                  WELCOME TO SHIFTPRO
                </div>
                <div style={{marginBottom:14}}>
                  <label style={{fontFamily:"'JetBrains Mono',monospace",fontSize:9,
                    color:"rgba(255,255,255,0.4)",letterSpacing:"2px",
                    display:"block",marginBottom:6}}>NEW PASSWORD</label>
                  <input value={newPw}
                    onChange={e=>{setNewPw(e.target.value);setPwErr("");}}
                    onKeyDown={e=>e.key==="Enter"&&handleSetPassword()}
                    type="password" placeholder="Minimum 8 characters"
                    style={{width:"100%",padding:"12px 14px",
                      background:"rgba(255,255,255,0.06)",
                      border:"1px solid rgba(245,158,11,0.3)",
                      borderRadius:9,fontFamily:"'JetBrains Mono',monospace",
                      fontSize:14,color:"#fff",outline:"none",boxSizing:"border-box"}}/>
                </div>
                <div style={{marginBottom:pwErr?8:18}}>
                  <label style={{fontFamily:"'JetBrains Mono',monospace",fontSize:9,
                    color:"rgba(255,255,255,0.4)",letterSpacing:"2px",
                    display:"block",marginBottom:6}}>CONFIRM PASSWORD</label>
                  <input value={newPw2}
                    onChange={e=>{setNewPw2(e.target.value);setPwErr("");}}
                    onKeyDown={e=>e.key==="Enter"&&handleSetPassword()}
                    type="password" placeholder="Re-enter password"
                    style={{width:"100%",padding:"12px 14px",
                      background:"rgba(255,255,255,0.06)",
                      border:"1px solid rgba(245,158,11,0.3)",
                      borderRadius:9,fontFamily:"'JetBrains Mono',monospace",
                      fontSize:14,color:"#fff",outline:"none",boxSizing:"border-box"}}/>
                </div>
                {pwErr&&(
                  <div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:9,
                    color:"#ef4444",marginBottom:12,padding:"7px 10px",
                    background:"rgba(239,68,68,0.07)",
                    border:"1px solid rgba(239,68,68,0.2)",borderRadius:6}}>
                    {pwErr}
                  </div>
                )}
                <button onClick={handleSetPassword}
                  style={{width:"100%",padding:"14px",
                    background:pwBusy?"rgba(245,158,11,0.5)":"linear-gradient(135deg,#f59e0b,#f97316)",
                    border:"none",borderRadius:10,
                    fontFamily:"'Outfit',sans-serif",fontWeight:700,fontSize:15,
                    color:"#030c14",cursor:pwBusy?"not-allowed":"pointer",
                    boxShadow:"0 4px 20px rgba(245,158,11,0.3)"}}>
                  {pwBusy?"Setting password…":"Set Password & Sign In →"}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );

  return (
    <>
      <style>{FONTS}{GCSS}</style>
      {!session && <Login onLogin={login}/>}
      {session?.role==="employee" && <EmpPortal emp={session.emp} onLogout={logout}/>}
      {session?.role==="owner" && <OwnerCmd onLogout={logout}/>}
    </>
  );
}