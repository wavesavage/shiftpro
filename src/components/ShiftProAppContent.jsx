"use client";

import { useState, useEffect } from "react";

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
  {id:1,name:"Newport Main",addr:"345 SW Bay Blvd",staff:5,active:3,alerts:2,cameras:"5/6",cost:284,incidents:2},
  {id:2,name:"Lincoln City",addr:"1201 NW Harbor Dr",staff:4,active:4,alerts:0,cameras:"4/4",cost:231,incidents:0},
  {id:3,name:"Depoe Bay Kiosk",addr:"70 NE Hwy 101",staff:2,active:1,alerts:1,cameras:"2/2",cost:83,incidents:1},
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
  // Auto-detect portal from URL param — employees arrive via ?portal=employee
  const getInitialMode = () => {
    if(typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      if(params.get("portal") === "employee") return "employee";
    }
    return null;
  };

  const [mode,setMode] = useState(getInitialMode);
  const [pass,setPass] = useState("");
  const [pin,setPin] = useState("");
  const [sel,setSel] = useState(null);
  const [err,setErr] = useState("");
  const [busy,setBusy] = useState(false);

  const goOwner = () => { setBusy(true); setTimeout(()=>onLogin("owner",null),700); };
  const goEmp = () => {
    if(!sel){ setErr("Please select your name"); return; }
    setBusy(true); setTimeout(()=>onLogin("employee",byId(sel)),700);
  };

  return (
    <div style={{minHeight:"100vh",background:"linear-gradient(135deg,#0f0c29,#302b63,#24243e)",display:"flex",alignItems:"center",justifyContent:"center",fontFamily:E.sans,padding:"20px"}}>
      <div style={{position:"absolute",inset:0,backgroundImage:`radial-gradient(rgba(99,102,241,0.13) 1px,transparent 1px)`,backgroundSize:"32px 32px",pointerEvents:"none"}}/>
      <div style={{position:"relative",width:"100%",maxWidth:450,padding:"0 16px",animation:"fadeUp 0.5s ease"}}>

        <div style={{textAlign:"center",marginBottom:36}}>
          <div style={{display:"flex",justifyContent:"center",marginBottom:18,filter:"drop-shadow(0 16px 40px rgba(0,180,255,0.45))"}}>
            <LogoHero/>
          </div>
          <div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:11,color:"rgba(255,255,255,0.28)",letterSpacing:"4px",textTransform:"uppercase"}}>SELECT YOUR PORTAL TO CONTINUE</div>
        </div>

        {!mode && (
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16}}>

            {/* ── OWNER BUTTON — amber/gold swirl ── */}
            <button onClick={()=>setMode("owner")}
              style={{padding:"32px 22px",background:"rgba(245,158,11,0.05)",border:"1.5px solid rgba(245,158,11,0.4)",borderRadius:18,cursor:"pointer",textAlign:"center",transition:"all 0.25s",display:"flex",flexDirection:"column",alignItems:"center",gap:14}}
              onMouseEnter={e=>{e.currentTarget.style.transform="translateY(-5px)";e.currentTarget.style.background="rgba(245,158,11,0.11)";e.currentTarget.style.borderColor="rgba(245,158,11,0.85)";e.currentTarget.style.boxShadow="0 12px 40px rgba(245,158,11,0.25)";}}
              onMouseLeave={e=>{e.currentTarget.style.transform="none";e.currentTarget.style.background="rgba(245,158,11,0.05)";e.currentTarget.style.borderColor="rgba(245,158,11,0.4)";e.currentTarget.style.boxShadow="none";}}>
              <div style={{filter:"drop-shadow(0 0 18px rgba(245,158,11,0.6))"}}>
                <ButtonSwirl size={76} c1="#f59e0b" c2="#f97316" c3="#b45309" accent="#fde68a"/>
              </div>
              <div>
                <div style={{fontFamily:"'Outfit',sans-serif",fontWeight:800,fontSize:17,color:"#fff",marginBottom:6,letterSpacing:0.2}}>Owner / Manager</div>
                <div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:10,color:"rgba(245,158,11,0.7)",letterSpacing:"1.5px"}}>OPERATIONS CENTER</div>
              </div>
            </button>

            {/* ── EMPLOYEE BUTTON — emerald/green swirl ── */}
            <button onClick={()=>setMode("employee")}
              style={{padding:"32px 22px",background:"rgba(16,185,129,0.05)",border:"1.5px solid rgba(16,185,129,0.4)",borderRadius:18,cursor:"pointer",textAlign:"center",transition:"all 0.25s",display:"flex",flexDirection:"column",alignItems:"center",gap:14}}
              onMouseEnter={e=>{e.currentTarget.style.transform="translateY(-5px)";e.currentTarget.style.background="rgba(16,185,129,0.11)";e.currentTarget.style.borderColor="rgba(16,185,129,0.85)";e.currentTarget.style.boxShadow="0 12px 40px rgba(16,185,129,0.25)";}}
              onMouseLeave={e=>{e.currentTarget.style.transform="none";e.currentTarget.style.background="rgba(16,185,129,0.05)";e.currentTarget.style.borderColor="rgba(16,185,129,0.4)";e.currentTarget.style.boxShadow="none";}}>
              <div style={{filter:"drop-shadow(0 0 18px rgba(16,185,129,0.6))"}}>
                <ButtonSwirl size={76} c1="#10b981" c2="#059669" c3="#065f46" accent="#6ee7b7"/>
              </div>
              <div>
                <div style={{fontFamily:"'Outfit',sans-serif",fontWeight:800,fontSize:17,color:"#fff",marginBottom:6,letterSpacing:0.2}}>I'm an Employee</div>
                <div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:10,color:"rgba(16,185,129,0.7)",letterSpacing:"1.5px",marginBottom:8}}>MY SCHEDULE & TIME CLOCK</div>
                <div style={{marginTop:10,padding:"8px 12px",background:"rgba(16,185,129,0.12)",border:"1px solid rgba(16,185,129,0.4)",borderRadius:8,display:"flex",alignItems:"center",justifyContent:"center",gap:7}}>
                  <span style={{fontSize:14}}>👀</span>
                  <span style={{fontFamily:"'Outfit',sans-serif",fontWeight:700,fontSize:12,color:"#10b981",letterSpacing:"0.3px"}}>Employers — preview what your team sees</span>
                </div>
              </div>
            </button>

          </div>
        )}

        {mode === "owner" && (
          <div style={{background:"rgba(9,14,26,0.95)",border:`1px solid ${O.amberB}`,borderRadius:16,padding:"28px"}}>
            <button onClick={()=>{setMode(null);setErr("");}} style={{background:"none",border:"none",color:"rgba(255,255,255,0.3)",fontFamily:O.mono,fontSize:10,letterSpacing:1,cursor:"pointer",marginBottom:16}}>
              ← BACK
            </button>
            <div style={{fontFamily:O.sans,fontWeight:700,fontSize:22,color:"#fff",marginBottom:4}}>Owner Access</div>
            <div style={{fontFamily:O.mono,fontSize:10,color:O.textD,marginBottom:20}}>Secure command center login</div>
            <label style={{fontFamily:O.mono,fontSize:9,color:O.textF,letterSpacing:2,display:"block",marginBottom:6}}>PASSWORD</label>
            <input value={pass} onChange={e=>{setPass(e.target.value);setErr("");}}
              onKeyDown={e=>e.key==="Enter"&&goOwner()} type="password" placeholder="Any value for demo"
              style={{width:"100%",padding:"11px 14px",background:"rgba(255,255,255,0.06)",border:`1px solid ${O.amberB}`,borderRadius:8,fontFamily:O.mono,fontSize:13,color:"#fff",outline:"none",marginBottom:14}}/>
            {err && <div style={{fontFamily:O.mono,fontSize:10,color:O.red,marginBottom:10}}>{err}</div>}
            <button onClick={goOwner} style={{width:"100%",padding:"13px",background:O.amber,border:"none",borderRadius:8,fontFamily:O.sans,fontWeight:700,fontSize:15,color:"#08060a",cursor:"pointer",opacity:busy?0.7:1}}>
              {busy ? "Authenticating…" : "Enter Command Center →"}
            </button>
          </div>
        )}

        {mode === "employee" && (
          <div style={{background:"rgba(255,255,255,0.97)",borderRadius:16,padding:"28px",boxShadow:"0 20px 60px rgba(0,0,0,0.4)"}}>
            <button onClick={()=>{setMode(null);setErr("");}} style={{background:"none",border:"none",color:E.textF,fontFamily:E.sans,fontSize:13,cursor:"pointer",marginBottom:14}}>
              ← Back
            </button>
            <div style={{fontFamily:E.sans,fontWeight:800,fontSize:22,color:E.text,marginBottom:4}}>Welcome back! 👋</div>
            <div style={{fontFamily:E.sans,fontSize:13,color:E.textD,marginBottom:16}}>Select your name to continue</div>
            <div style={{display:"flex",flexDirection:"column",gap:7,marginBottom:14}}>
              {EMPS.map(e => (
                <button key={e.id} onClick={()=>{setSel(e.id);setErr("");}}
                  style={{padding:"9px 12px",background:sel===e.id?E.indigoD:"#f8f7ff",border:`1.5px solid ${sel===e.id?E.indigo:E.border}`,borderRadius:10,cursor:"pointer",display:"flex",alignItems:"center",gap:10,transition:"all 0.15s",textAlign:"left"}}>
                  <Av emp={e} size={32}/>
                  <div style={{flex:1}}>
                    <div style={{fontFamily:E.sans,fontWeight:600,fontSize:14,color:E.text}}>{e.name}</div>
                    <div style={{fontFamily:E.sans,fontSize:12,color:E.textD}}>{e.role}</div>
                  </div>
                  {sel===e.id && <span style={{color:E.indigo}}>✓</span>}
                </button>
              ))}
            </div>
            <label style={{fontFamily:E.sans,fontWeight:600,fontSize:12,color:E.textD,display:"block",marginBottom:6}}>4-digit PIN</label>
            <input value={pin} onChange={e=>{setPin(e.target.value);setErr("");}}
              onKeyDown={e=>e.key==="Enter"&&goEmp()} type="password" maxLength={4} placeholder="••••"
              style={{width:"100%",padding:"11px 14px",background:"#f8f7ff",border:`1.5px solid ${E.border}`,borderRadius:8,fontFamily:O.mono,fontSize:22,color:E.text,outline:"none",letterSpacing:8,marginBottom:err?8:14}}/>
            {err && <div style={{fontFamily:E.sans,fontSize:12,color:E.red,marginBottom:10}}>{err}</div>}
            <button onClick={goEmp} style={{width:"100%",padding:"13px",background:`linear-gradient(135deg,${E.indigo},${E.violet})`,border:"none",borderRadius:10,fontFamily:E.sans,fontWeight:700,fontSize:15,color:"#fff",cursor:"pointer",boxShadow:E.shadowB,opacity:busy?0.7:1}}>
              {busy ? "Signing in…" : "Go to My Hub →"}
            </button>
            <p style={{fontFamily:E.sans,fontSize:11,color:E.textF,textAlign:"center",marginTop:10}}>Demo: any PIN works</p>
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
  const [tab,setTab] = useState("home");
  const [clocked,setClocked] = useState(false);
  const [secs,setSecs] = useState(0);
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
    if(!clocked){ setSecs(0); return; }
    const t = setInterval(()=>setSecs(s=>s+1),1000);
    return ()=>clearInterval(t);
  },[clocked]);

  const fmt = s => `${String(Math.floor(s/3600)).padStart(2,"0")}:${String(Math.floor((s%3600)/60)).padStart(2,"0")}:${String(s%60).padStart(2,"0")}`;
  const h = now.getHours();
  const greet = h<12 ? "Good morning" : h<17 ? "Good afternoon" : "Good evening";
  const myShifts = Object.entries(SCHED).map(([d,ss])=>({d,ss:ss.filter(s=>s.eId===emp.id)})).filter(x=>x.ss.length>0);
  const unread = msgs.filter(m=>!m.read).length;
  const gross = (emp.wkHrs * emp.rate).toFixed(2);
  const sc = emp.streak>=10?"⭐ Star Performer":emp.streak>=5?"🔷 Consistent":"✅ Reliable";
  const scColor = emp.streak>=10?E.yellow:emp.streak>=5?E.violet:E.green;

  const TABS = [
    {id:"home",label:"🏠 Home"},
    {id:"schedule",label:"📅 Schedule"},
    {id:"earnings",label:"💰 Earnings"},
    {id:"team",label:unread>0?"💬 Messages ("+unread+")":"💬 Messages"},
    {id:"recognition",label:"🏆 Achievements"},
  ];

  return (
    <div style={{minHeight:"100vh",background:E.bg,fontFamily:E.sans,color:E.text}}>

      {/* Header */}
      <div style={{background:E.bg2,borderBottom:`1px solid ${E.border}`,padding:"0 20px",height:56,display:"flex",alignItems:"center",justifyContent:"space-between",position:"sticky",top:0,zIndex:100,boxShadow:E.shadow}}>
        <ELogo/>
        <div style={{display:"flex",alignItems:"center",gap:12}}>
          <Av emp={emp} size={32}/>
          <div>
            <div style={{fontFamily:E.sans,fontWeight:700,fontSize:14,color:E.text}}>Hi, {emp.first}!</div>
            <div style={{fontFamily:E.sans,fontSize:11,color:E.textD}}>{emp.role}</div>
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
            <div style={{background:`linear-gradient(135deg,${E.indigo},${E.violet})`,borderRadius:18,padding:"26px",marginBottom:14,color:"#fff",position:"relative",overflow:"hidden",boxShadow:E.shadowB}}>
              <div style={{position:"absolute",top:-30,right:-30,width:130,height:130,background:"rgba(255,255,255,0.06)",borderRadius:"50%",pointerEvents:"none"}}/>
              <div style={{fontFamily:E.sans,fontWeight:800,fontSize:22,marginBottom:4}}>{greet}, {emp.first}! ✨</div>
              <div style={{fontFamily:E.sans,fontSize:13,opacity:.8,marginBottom:18}}>
                {now.toLocaleDateString("en-US",{weekday:"long",month:"long",day:"numeric"})}
              </div>
              {myShifts[0] && (
                <div style={{background:"rgba(255,255,255,0.15)",borderRadius:10,padding:"12px 16px",marginBottom:16}}>
                  <div style={{fontFamily:E.sans,fontSize:11,opacity:.75,marginBottom:3}}>NEXT SHIFT</div>
                  <div style={{fontFamily:E.sans,fontWeight:700,fontSize:17}}>{myShifts[0].d} · {fH(myShifts[0].ss[0].s)} – {fH(myShifts[0].ss[0].e)}</div>
                </div>
              )}
              <div style={{display:"flex",alignItems:"center",gap:14}}>
                <button onClick={()=>setClocked(p=>!p)}
                  style={{padding:"11px 26px",background:clocked?"rgba(239,68,68,0.9)":"rgba(255,255,255,0.95)",border:"none",borderRadius:50,fontFamily:E.sans,fontWeight:700,fontSize:15,color:clocked?"#fff":E.indigo,cursor:"pointer",transition:"all 0.2s",boxShadow:"0 4px 14px rgba(0,0,0,0.2)"}}>
                  {clocked ? "Clock Out 👋" : "Clock In ✓"}
                </button>
                {clocked && <div style={{fontFamily:O.mono,fontSize:20,fontWeight:300,color:"rgba(255,255,255,0.9)"}}>{fmt(secs)}</div>}
              </div>
            </div>

            {/* Quick actions */}
            <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:10,marginBottom:14}}>
              {[
                {icon:"🔄",label:"Swap Shift",go:()=>setSwapOpen(true),c:E.violet},
                {icon:"📆",label:"Time Off",go:()=>setToOpen(true),c:E.teal},
                {icon:"💬",label:"Message Manager",go:()=>setTab("team"),c:E.indigo},
              ].map(a => (
                <button key={a.label} onClick={a.go}
                  style={{padding:"15px 10px",background:E.bg2,border:`1.5px solid ${E.border}`,borderRadius:14,cursor:"pointer",textAlign:"center",transition:"all 0.2s",boxShadow:E.shadow}}
                  onMouseEnter={e=>{e.currentTarget.style.borderColor=a.c+"55";e.currentTarget.style.transform="translateY(-2px)";}}
                  onMouseLeave={e=>{e.currentTarget.style.borderColor=E.border;e.currentTarget.style.transform="none";}}>
                  <div style={{fontSize:20,marginBottom:5}}>{a.icon}</div>
                  <div style={{fontFamily:E.sans,fontWeight:600,fontSize:12,color:E.text}}>{a.label}</div>
                </button>
              ))}
            </div>

            {/* Earnings preview */}
            <div style={{background:E.bg2,border:`1.5px solid ${E.border}`,borderRadius:14,padding:"18px",boxShadow:E.shadow}}>
              <div style={{fontFamily:E.sans,fontWeight:700,fontSize:15,color:E.text,marginBottom:12}}>💰 This Week's Earnings</div>
              <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:10}}>
                {[["Hours",`${emp.wkHrs}h`,E.indigo],["Rate",`$${emp.rate}/hr`,E.violet],["Est. Gross",`$${gross}`,E.green]].map(([l,v,c]) => (
                  <div key={l} style={{background:E.bg3,borderRadius:10,padding:"12px",textAlign:"center"}}>
                    <div style={{fontFamily:E.sans,fontSize:11,color:E.textD,marginBottom:3}}>{l}</div>
                    <div style={{fontFamily:E.sans,fontWeight:800,fontSize:18,color:c}}>{v}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── SCHEDULE (Prompt 2) ── */}
        {tab==="schedule" && (
          <div style={{animation:"fadeUp 0.3s ease"}}>
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
                      <div style={{fontFamily:E.sans,fontSize:13,color:E.textD}}>{s.e-s.s} hours · {emp.role}</div>
                    </div>
                    <EBadge label="Confirmed ✓" color={E.green}/>
                  </div>
                ))}
              </div>
            ))}
            <div style={{background:E.bg2,border:`1.5px solid ${E.border}`,borderRadius:14,padding:"16px 18px",boxShadow:E.shadow}}>
              <div style={{fontFamily:E.sans,fontWeight:700,fontSize:14,color:E.text,marginBottom:10}}>Swap Requests</div>
              {SWAPS.filter(s=>s.from.includes(emp.first)||s.to.includes(emp.first)).length===0
                ? <div style={{fontFamily:E.sans,fontSize:13,color:E.textF,textAlign:"center",padding:"16px 0"}}>No swap requests</div>
                : SWAPS.filter(s=>s.from.includes(emp.first)||s.to.includes(emp.first)).map(s => (
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
            <div style={{fontFamily:E.sans,fontWeight:800,fontSize:20,color:E.text,marginBottom:4}}>Your Earnings 💰</div>
            <div style={{fontFamily:E.sans,fontSize:13,color:E.textD,marginBottom:16}}>Transparent. Accurate. Always yours.</div>
            <div style={{background:`linear-gradient(135deg,${E.indigo}18,${E.violet}18)`,border:`1.5px solid ${E.indigo}30`,borderRadius:16,padding:"20px",marginBottom:14}}>
              <div style={{fontFamily:E.sans,fontSize:12,color:E.indigo,fontWeight:600,marginBottom:3}}>Current Pay Period (Mar 18–31)</div>
              <div style={{fontFamily:E.sans,fontWeight:800,fontSize:34,color:E.text,marginBottom:3}}>${gross}</div>
              <div style={{fontFamily:E.sans,fontSize:13,color:E.textD}}>{emp.wkHrs} hrs · ${emp.rate}/hr</div>
              {emp.ot>0 && <div style={{fontFamily:E.sans,fontSize:12,color:E.orange,marginTop:4}}>+ ${(emp.ot*emp.rate*1.5).toFixed(2)} overtime</div>}
            </div>
            <div style={{background:E.bg2,border:`1.5px solid ${E.border}`,borderRadius:14,padding:"18px",marginBottom:12,boxShadow:E.shadow}}>
              <div style={{fontFamily:E.sans,fontWeight:700,fontSize:14,color:E.text,marginBottom:14}}>Hours (Last 8 Weeks)</div>
              <div style={{display:"flex",alignItems:"flex-end",gap:6,height:72}}>
                {[32,38,36,40,35,38,36,emp.wkHrs].map((hh,i) => (
                  <div key={i} style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",gap:3}}>
                    <div style={{width:"100%",background:i===7?`linear-gradient(${E.indigo},${E.violet})`:E.indigoD,border:`1px solid ${i===7?E.indigo:E.border}`,borderRadius:"3px 3px 0 0",height:`${(hh/45)*100}%`,minHeight:5,transition:"height 0.8s ease"}}/>
                    <span style={{fontFamily:O.mono,fontSize:7,color:E.textF}}>{["W1","W2","W3","W4","W5","W6","W7","Now"][i]}</span>
                  </div>
                ))}
              </div>
            </div>
            <div style={{background:E.bg2,border:`1.5px solid ${E.border}`,borderRadius:14,padding:"18px",boxShadow:E.shadow}}>
              <div style={{fontFamily:E.sans,fontWeight:700,fontSize:14,color:E.text,marginBottom:12}}>Recent Pay Stubs</div>
              {[["Mar 1–15",76],["Feb 15–28",72],["Feb 1–14",78],["Jan 15–31",80]].map(([period,hrs],i) => (
                <div key={i} style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"11px 0",borderBottom:i<3?`1px solid ${E.border}`:"none"}}>
                  <div>
                    <div style={{fontFamily:E.sans,fontWeight:600,fontSize:14,color:E.text}}>{period}</div>
                    <div style={{fontFamily:E.sans,fontSize:12,color:E.textD}}>{hrs}h · ${emp.rate}/hr</div>
                  </div>
                  <div style={{display:"flex",alignItems:"center",gap:10}}>
                    <div style={{fontFamily:E.sans,fontWeight:700,fontSize:16,color:E.indigo}}>${(hrs*emp.rate).toFixed(2)}</div>
                    <button style={{padding:"5px 11px",background:E.indigoD,border:`1px solid ${E.indigo}30`,borderRadius:6,fontFamily:E.sans,fontSize:11,color:E.indigo,cursor:"pointer"}}>↓ PDF</button>
                  </div>
                </div>
              ))}
            </div>
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
              {EMPS.filter(e=>e.id!==emp.id).map(e => (
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
              <div style={{fontSize:44,marginBottom:8}}>{emp.streak>=10?"⭐":emp.streak>=5?"🔷":"✅"}</div>
              <div style={{fontFamily:E.sans,fontWeight:800,fontSize:"clamp(16px,5vw,22px)",color:scColor,marginBottom:4}}>{sc}</div>
              <div style={{fontFamily:E.sans,fontSize:13,color:E.textD,marginBottom:16}}>Keep it up, {emp.first}!</div>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:10}}>
                {[["On-Time Streak",`${emp.streak} shifts`,scColor],["This Month",`${emp.shifts} shifts`,E.indigo],["Reliability",`${emp.rel}%`,E.violet]].map(([l,v,c]) => (
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
                  {icon:"🎯",label:"On Time",ok:emp.streak>0},
                  {icon:"💪",label:"Full Month",ok:emp.shifts>=15},
                  {icon:"⚡",label:"Fast Learner",ok:true},
                  {icon:"🤝",label:"Team Player",ok:emp.flags===0},
                  {icon:"📈",label:"Improving",ok:emp.prod>70},
                  {icon:"🔒",label:"Trustworthy",ok:emp.flags===0&&emp.rel>80},
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
              {label:"Swap with?",el:<select style={{width:"100%",padding:"10px 12px",background:E.bg3,border:`1.5px solid ${E.border}`,borderRadius:8,fontFamily:E.sans,fontSize:13,color:E.text}}>{EMPS.filter(e=>e.id!==emp.id).map(e=><option key={e.id}>{e.name}</option>)}</select>},
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
  const [alerts,setAlerts] = useState([
    {id:1,sev:"critical",msg:"Ghost hours exceeded — Marcus B.",detail:"7.3h unverified this week",time:"Now",seen:false,eId:5},
    {id:2,sev:"critical",msg:"Payroll mismatch — Carlos R.",detail:"4.1h camera discrepancy",time:"14:28",seen:false,eId:3},
    {id:3,sev:"warning",msg:"Register void pattern — Priya K.",detail:"3 voids this week",time:"14:21",seen:true,eId:2},
    {id:4,sev:"warning",msg:"Restricted zone entry",detail:"Unauthorized area access",time:"13:55",seen:true,eId:null},
    {id:5,sev:"info",msg:"Productivity peak — Jordan M.",detail:"Highest throughput this month",time:"12:03",seen:true,eId:1},
  ]);

  useEffect(()=>{
    const t = setInterval(()=>setNow(new Date()),1000);
    return ()=>clearInterval(t);
  },[]);

  const unseen = alerts.filter(a=>!a.seen).length;
  const totalGhost = EMPS.reduce((s,e)=>s+e.ghost,0);
  const ghostCost = EMPS.reduce((s,e)=>s+e.ghost*e.rate,0).toFixed(2);
  const sc = s => ({critical:O.red,warning:O.amber,info:O.blue})[s]||O.textD;

  const TABS = [
    {id:"command",l:"Command"},{id:"intelligence",l:"Intelligence"},
    {id:"patterns",l:"Patterns"},{id:"payroll",l:"Payroll Fraud"},
    {id:"feed",l:"Live Feed"},{id:"roi",l:"Payroll Tracking"},
    {id:"alerts",l:unseen>0?"Alerts ("+unseen+")":"Alerts"},
    {id:"benchmark",l:"Benchmarks"},{id:"locations",l:"Locations"},
    {id:"staff",l:"Staff"},{id:"schedule",l:"Schedule"},
    {id:"requests",l:"Requests"},
    {id:"cameras",l:"📷 Cameras"},
  ];

  const goProfile = (id) => { setSelEmp(id); setTab("intelligence"); };

  return (
    <div style={{minHeight:"100vh",background:O.bg,fontFamily:O.sans,color:O.text}}>

      {/* Topbar */}
      <div style={{background:"rgba(5,8,15,0.98)",borderBottom:`1px solid ${O.border}`,padding:"0 20px",height:52,display:"flex",alignItems:"center",justifyContent:"space-between",position:"sticky",top:0,zIndex:100}}>
        <OLogo/>
        <div style={{display:"flex",alignItems:"center",gap:20}}>
          {[
            ["STAFF",`${EMPS.filter(e=>e.status==="active").length}/${EMPS.length}`,O.green],
            ["GHOST HRS",`${totalGhost.toFixed(1)}h`,O.red],
            ["ALERTS",unseen,unseen>0?O.red:"#3a4a60"],
          ].map(([l,v,c]) => (
            <div key={l} style={{textAlign:"center"}}>
              <div style={{fontFamily:O.mono,fontSize:7,color:O.textF,letterSpacing:2}}>{l}</div>
              <div style={{fontFamily:O.mono,fontSize:13,color:c,fontWeight:500,animation:l==="ALERTS"&&unseen>0?"blink 1.2s infinite":"none"}}>{v}</div>
            </div>
          ))}
          <div style={{fontFamily:O.mono,fontSize:12,color:O.textD,borderLeft:`1px solid ${O.border}`,paddingLeft:16}}>
            {now.toLocaleTimeString("en-US",{hour12:false})}
          </div>
          <button onClick={onLogout} style={{padding:"4px 12px",background:"none",border:`1px solid ${O.border}`,borderRadius:4,fontFamily:O.mono,fontSize:9,letterSpacing:1,color:O.textD,cursor:"pointer"}}>EXIT</button>
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

            {/* ── COMPUTED VARS ── */}
            {(() => {
              const activeEmps = EMPS.filter(e=>e.status==="active");
              const burnRate = activeEmps.reduce((s,e)=>s+e.rate,0);
              const hoursElapsed = now.getHours()+(now.getMinutes()/60)-(9);
              const hrsPos = Math.max(hoursElapsed,0);
              const todaySpend = (burnRate*hrsPos).toFixed(0);
              const ghostExposure = (EMPS.filter(e=>e.ghost>0).reduce((s,e)=>s+e.ghost*e.rate,0)).toFixed(0);
              const critCount = alerts.filter(a=>a.sev==="critical"&&!a.seen).length;
              const warnCount = alerts.filter(a=>a.sev==="warning"&&!a.seen).length;
              const bizStatus = critCount>0?"ACTION NEEDED":warnCount>1?"MONITORING REQUIRED":"OPERATING NORMALLY";
              const bizColor = critCount>0?O.red:warnCount>1?O.amber:O.green;
              const weekBudget = 4200;
              const weekSpend = MONTHLY[5]?MONTHLY[5].cost:3800;
              const budgetVar = weekBudget - weekSpend;
              const payrollEff = Math.round((1-(totalGhost/Math.max(EMPS.reduce((s,e)=>s+e.wkHrs,0),1)))*100);
              const registerEvents = [
                {t:"14:31",reg:"Reg 1",type:"Sale",amt:34.50,flag:false},
                {t:"14:18",reg:"Reg 2",type:"Void",amt:28.00,flag:true},
                {t:"14:02",reg:"Reg 2",type:"Void",amt:12.50,flag:false},
                {t:"13:55",reg:"Reg 1",type:"Override",amt:0,flag:true},
                {t:"13:41",reg:"Reg 2",type:"Void",amt:31.00,flag:true},
              ];
              const reg2Voids = registerEvents.filter(r=>r.reg==="Reg 2"&&r.type==="Void").length;
              const camEvents = [
                {t:"14:28",cam:"Cam 3",zone:"Stock Room",ev:"Extended dwell detected",sev:"warning"},
                {t:"14:15",cam:"Cam 1",zone:"Entrance",ev:"No-show at scheduled time",sev:"warning"},
                {t:"13:52",cam:"Cam 4",zone:"Exit",ev:"Motion in restricted zone",sev:"critical"},
                {t:"13:30",cam:"Cam 2",zone:"Register",ev:"Clock-in presence verified",sev:"good"},
              ];

              return (
                <div>

                  {/* ── ZONE 1: LIVE STATUS BAR ── */}
                  <div style={{background:"rgba(5,8,15,0.98)",border:"1px solid "+O.border,
                    borderRadius:10,padding:"10px 16px",marginBottom:14,
                    display:"flex",alignItems:"center",gap:16,flexWrap:"wrap",
                    boxShadow:critCount>0?"0 0 20px rgba(239,68,68,0.1)":"none"}}>

                    {/* Business status */}
                    <div style={{display:"flex",alignItems:"center",gap:8}}>
                      <div style={{width:8,height:8,borderRadius:"50%",background:bizColor,
                        animation:"blink 1.2s infinite",boxShadow:"0 0 6px "+bizColor}}/>
                      <span style={{fontFamily:O.mono,fontSize:10,color:bizColor,
                        letterSpacing:"1.5px",fontWeight:600}}>{bizStatus}</span>
                    </div>

                    <div style={{width:1,height:20,background:O.border}}/>

                    {/* Live clock */}
                    <div style={{fontFamily:O.mono,fontSize:14,color:"#fff",letterSpacing:"2px",
                      fontWeight:600}}>{now.toLocaleTimeString("en-US",{hour12:false})}</div>

                    <div style={{width:1,height:20,background:O.border}}/>

                    {/* Active staff */}
                    <div style={{display:"flex",alignItems:"center",gap:8}}>
                      <div style={{display:"flex",gap:4}}>
                        {EMPS.map(e=>(
                          <div key={e.id} title={e.name}
                            style={{width:22,height:22,borderRadius:6,
                              background:e.color+"30",border:"1.5px solid "+(e.status==="active"?e.color:O.border),
                              display:"flex",alignItems:"center",justifyContent:"center",
                              fontFamily:O.mono,fontSize:8,color:e.color,
                              opacity:e.status==="active"?1:0.35}}>
                            {e.avatar[0]}
                          </div>
                        ))}
                      </div>
                      <span style={{fontFamily:O.mono,fontSize:10,color:O.textD,letterSpacing:1}}>
                        {activeEmps.length}/{EMPS.length} ON FLOOR
                      </span>
                    </div>

                    <div style={{width:1,height:20,background:O.border}}/>

                    {/* Burn rate */}
                    <div>
                      <span style={{fontFamily:O.mono,fontSize:9,color:O.textF,letterSpacing:1}}>BURN </span>
                      <span style={{fontFamily:O.sans,fontWeight:700,fontSize:14,color:O.amber}}>${burnRate.toFixed(0)}/hr</span>
                    </div>

                    {/* Ghost exposure */}
                    {parseFloat(ghostExposure)>0 && (
                      <>
                        <div style={{width:1,height:20,background:O.border}}/>
                        <div>
                          <span style={{fontFamily:O.mono,fontSize:9,color:O.textF,letterSpacing:1}}>GHOST EXP </span>
                          <span style={{fontFamily:O.sans,fontWeight:700,fontSize:14,color:O.red}}>${ghostExposure} at risk</span>
                        </div>
                      </>
                    )}

                    <div style={{marginLeft:"auto",display:"flex",gap:8}}>
                      {critCount>0&&(
                        <div style={{display:"flex",alignItems:"center",gap:5,
                          background:"rgba(239,68,68,0.12)",border:"1px solid rgba(239,68,68,0.35)",
                          borderRadius:6,padding:"4px 10px"}}>
                          <div style={{width:6,height:6,borderRadius:"50%",background:O.red,animation:"blink 0.8s infinite"}}/>
                          <span style={{fontFamily:O.mono,fontSize:9,color:O.red,letterSpacing:1}}>
                            {critCount} CRITICAL
                          </span>
                        </div>
                      )}
                      {warnCount>0&&(
                        <div style={{display:"flex",alignItems:"center",gap:5,
                          background:"rgba(245,158,11,0.1)",border:"1px solid rgba(245,158,11,0.3)",
                          borderRadius:6,padding:"4px 10px"}}>
                          <span style={{fontFamily:O.mono,fontSize:9,color:O.amber,letterSpacing:1}}>
                            {warnCount} WARNING
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* ── QUICK ACTION TOOLBAR ── */}
                  <div style={{display:"flex",gap:8,marginBottom:14,flexWrap:"wrap"}}>
                    {[
                      {icon:"📢",l:"Broadcast"},
                      {icon:"📋",l:"Export"},
                      {icon:"🔔",l:"Test Alert"},
                      {icon:"📅",l:"Schedule"},
                      {icon:"💾",l:"Snapshot"},
                    ].map(a=>(
                      <button key={a.l}
                        style={{display:"flex",alignItems:"center",gap:6,
                          padding:"7px 14px",background:O.bg2,
                          border:"1px solid "+O.border,borderRadius:7,
                          cursor:"pointer",transition:"all 0.15s",
                          fontFamily:O.sans,fontSize:12,color:O.textD}}
                        onMouseEnter={e=>{e.currentTarget.style.borderColor="rgba(0,212,255,0.35)";e.currentTarget.style.color="#fff";}}
                        onMouseLeave={e=>{e.currentTarget.style.borderColor=O.border;e.currentTarget.style.color=O.textD;}}>
                        <span>{a.icon}</span>{a.l}
                      </button>
                    ))}
                    <div style={{marginLeft:"auto",fontFamily:O.mono,fontSize:9,
                      color:O.textF,letterSpacing:1,alignSelf:"center"}}>
                      R=Refresh &nbsp; F=Feed &nbsp; A=Alerts &nbsp; S=Staff
                    </div>
                  </div>

                  {/* ── MAIN 3-COLUMN GRID ── */}
                  <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:12,marginBottom:12}}>

                    {/* ── ZONE 2: SHIFT STATUS (LEFT) ── */}
                    <div style={{background:O.bg2,border:"1px solid "+O.border,borderRadius:10,padding:"14px"}}>
                      <div style={{fontFamily:O.mono,fontSize:7,color:O.textF,
                        letterSpacing:"2.5px",marginBottom:12}}>WHO'S ON FLOOR NOW</div>

                      <div style={{display:"flex",flexDirection:"column",gap:7}}>
                        {EMPS.map(e => {
                          const onSince = e.status==="active"?((now.getHours()-9)*60+now.getMinutes()):0;
                          const onHrs = Math.floor(onSince/60);
                          const onMin = onSince%60;
                          const verified = e.cam>80;
                          return (
                            <div key={e.id}
                              style={{padding:"10px 10px",background:O.bg3,
                                borderRadius:8,border:"1px solid "+(e.status==="active"?"rgba(16,185,129,0.2)":O.border),
                                cursor:"pointer",transition:"all 0.15s"}}
                              onClick={()=>goProfile(e.id)}
                              onMouseEnter={ev=>ev.currentTarget.style.borderColor="rgba(0,212,255,0.3)"}
                              onMouseLeave={ev=>ev.currentTarget.style.borderColor=e.status==="active"?"rgba(16,185,129,0.2)":O.border}>

                              <div style={{display:"flex",alignItems:"center",gap:9,marginBottom:7}}>
                                <Av emp={e} size={28} dark/>
                                <div style={{flex:1,minWidth:0}}>
                                  <div style={{fontFamily:O.sans,fontWeight:600,fontSize:12,
                                    color:"#fff",marginBottom:1,whiteSpace:"nowrap",
                                    overflow:"hidden",textOverflow:"ellipsis"}}>{e.name}</div>
                                  <div style={{fontFamily:O.mono,fontSize:8,color:O.textD}}>{e.role}</div>
                                </div>
                                <div style={{fontFamily:O.mono,fontSize:8,
                                  color:e.status==="active"?O.green:e.status==="break"?O.amber:O.textD,
                                  background:(e.status==="active"?O.green:e.status==="break"?O.amber:O.textD)+"18",
                                  border:"1px solid "+(e.status==="active"?O.green:e.status==="break"?O.amber:O.textD)+"35",
                                  borderRadius:4,padding:"2px 6px",letterSpacing:1,whiteSpace:"nowrap"}}>
                                  {e.status==="active"?"CLOCKED IN":e.status==="break"?"ON BREAK":"NOT IN"}
                                </div>
                              </div>

                              <div style={{display:"flex",gap:6,alignItems:"center",flexWrap:"wrap"}}>
                                {e.status==="active" && (
                                  <span style={{fontFamily:O.mono,fontSize:8,color:O.textD}}>
                                    {onHrs}h {onMin}m on shift
                                  </span>
                                )}
                                <span style={{fontFamily:O.mono,fontSize:8,
                                  color:verified?O.green:O.amber}}>
                                  {verified?"📷 VERIFIED":"⚠ UNVERIFIED"}
                                </span>
                                <span style={{fontFamily:O.mono,fontSize:8,color:O.textD,marginLeft:"auto"}}>
                                  {e.dept}
                                </span>
                              </div>

                              {/* Micro risk bar */}
                              <div style={{marginTop:7,height:3,background:"rgba(255,255,255,0.05)",borderRadius:2}}>
                                <div style={{height:"100%",width:e.rel+"%",
                                  background:rC(e.risk),borderRadius:2,
                                  transition:"width 0.8s ease"}}/>
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      {/* Footer summary */}
                      <div style={{marginTop:10,padding:"9px 10px",background:O.bg3,
                        borderRadius:7,borderTop:"1px solid "+O.border}}>
                        <div style={{fontFamily:O.mono,fontSize:8,color:O.textD,lineHeight:1.7}}>
                          Floor hours today: <span style={{color:O.amber}}>{(hrsPos*activeEmps.length).toFixed(1)}h</span>
                          &nbsp;·&nbsp; Est. daily labor: <span style={{color:O.amber}}>${todaySpend}</span>
                        </div>
                      </div>
                    </div>

                    {/* ── ZONE 3: THREAT MONITOR (CENTER) ── */}
                    <div style={{display:"flex",flexDirection:"column",gap:10}}>

                      {/* Ghost hour detector */}
                      <div style={{background:EMPS.some(e=>e.ghost>2)?"rgba(239,68,68,0.05)":O.bg2,
                        border:"1px solid "+(EMPS.some(e=>e.ghost>2)?"rgba(239,68,68,0.25)":O.border),
                        borderRadius:10,padding:"12px 14px"}}>
                        <div style={{fontFamily:O.mono,fontSize:7,color:O.red,
                          letterSpacing:"2.5px",marginBottom:10}}>⚠ GHOST HOUR DETECTOR</div>
                        <div style={{display:"grid",gridTemplateColumns:"1fr 36px 44px 44px 44px",
                          gap:4,marginBottom:6}}>
                          {["EMPLOYEE","SCHED","LOGGED","CAM","GHOST"].map(h=>(
                            <div key={h} style={{fontFamily:O.mono,fontSize:7,
                              color:O.textF,letterSpacing:1}}>{h}</div>
                          ))}
                        </div>
                        {EMPS.map(e=>{
                          const disc = e.ghost;
                          const c = disc>3?O.red:disc>0?O.amber:O.green;
                          return(
                            <div key={e.id} style={{display:"grid",
                              gridTemplateColumns:"1fr 36px 44px 44px 44px",
                              gap:4,padding:"6px 0",
                              borderTop:"1px solid "+O.border,alignItems:"center"}}>
                              <div style={{fontFamily:O.sans,fontSize:11,
                                color:"#fff",fontWeight:600}}>{e.name.split(" ")[0]}</div>
                              <div style={{fontFamily:O.mono,fontSize:9,color:O.textD}}>{e.wkHrs}h</div>
                              <div style={{fontFamily:O.mono,fontSize:9,color:O.text}}>{e.wkHrs}h</div>
                              <div style={{fontFamily:O.mono,fontSize:9,color:O.green}}>{(e.wkHrs-e.ghost).toFixed(1)}h</div>
                              <div style={{fontFamily:O.mono,fontSize:9,color:c,fontWeight:disc>0?600:400}}>
                                {disc>0?disc+"h":"—"}
                              </div>
                            </div>
                          );
                        })}
                        <div style={{padding:"6px 0",borderTop:"1px solid rgba(239,68,68,0.3)",
                          marginTop:4,display:"flex",justifyContent:"space-between"}}>
                          <span style={{fontFamily:O.mono,fontSize:8,color:O.red}}>TOTAL EXPOSURE</span>
                          <span style={{fontFamily:O.mono,fontSize:8,color:O.red,fontWeight:600}}>
                            {totalGhost.toFixed(1)}h · ${ghostCost}
                          </span>
                        </div>
                      </div>

                      {/* Camera alert stack */}
                      <div style={{background:O.bg2,border:"1px solid "+O.border,borderRadius:10,padding:"12px 14px"}}>
                        <div style={{fontFamily:O.mono,fontSize:7,color:O.textF,
                          letterSpacing:"2.5px",marginBottom:10}}>📷 CAMERA ALERTS</div>
                        {camEvents.map((ev,i)=>{
                          const c=ev.sev==="critical"?O.red:ev.sev==="warning"?O.amber:O.green;
                          return(
                            <div key={i} style={{display:"flex",gap:8,alignItems:"flex-start",
                              padding:"6px 0",borderTop:i>0?"1px solid "+O.border:"none"}}>
                              <div style={{width:3,height:"100%",minHeight:24,background:c,
                                borderRadius:2,flexShrink:0}}/>
                              <div style={{flex:1}}>
                                <div style={{display:"flex",justifyContent:"space-between",marginBottom:1}}>
                                  <span style={{fontFamily:O.mono,fontSize:9,color:"#fff"}}>{ev.zone}</span>
                                  <span style={{fontFamily:O.mono,fontSize:8,color:O.textF}}>{ev.t}</span>
                                </div>
                                <div style={{fontFamily:O.mono,fontSize:8,color:O.textD}}>{ev.ev}</div>
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      {/* Register activity */}
                      <div style={{background:reg2Voids>=3?"rgba(239,68,68,0.05)":O.bg2,
                        border:"1px solid "+(reg2Voids>=3?"rgba(239,68,68,0.25)":O.border),
                        borderRadius:10,padding:"12px 14px",flex:1}}>
                        <div style={{display:"flex",justifyContent:"space-between",marginBottom:10}}>
                          <div style={{fontFamily:O.mono,fontSize:7,color:O.textF,letterSpacing:"2.5px"}}>
                            📋 REGISTER ACTIVITY
                          </div>
                          {reg2Voids>=3&&(
                            <div style={{fontFamily:O.mono,fontSize:7,color:O.red,
                              background:"rgba(239,68,68,0.12)",borderRadius:3,
                              padding:"2px 6px",letterSpacing:1}}>
                              {reg2Voids} VOIDS REG 2
                            </div>
                          )}
                        </div>
                        {registerEvents.map((r,i)=>(
                          <div key={i} style={{display:"flex",gap:6,alignItems:"center",
                            padding:"5px 0",borderTop:i>0?"1px solid "+O.border:"none"}}>
                            <span style={{fontFamily:O.mono,fontSize:8,color:O.textF,width:32}}>{r.t}</span>
                            <span style={{fontFamily:O.mono,fontSize:8,color:O.textD,width:36}}>{r.reg}</span>
                            <span style={{fontFamily:O.sans,fontSize:11,flex:1,
                              color:r.flag?O.red:"#fff",fontWeight:r.flag?600:400}}>{r.type}</span>
                            {r.amt>0&&<span style={{fontFamily:O.mono,fontSize:9,
                              color:r.flag?O.red:O.textD}}>${r.amt.toFixed(2)}</span>}
                            {r.flag&&<span style={{fontSize:9,color:O.red}}>⚠</span>}
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* ── ZONE 4: PAYROLL LIVE METER (RIGHT) ── */}
                    <div style={{display:"flex",flexDirection:"column",gap:10}}>

                      {/* Today spend */}
                      <div style={{background:O.bg2,border:"1px solid "+O.border,
                        borderRadius:10,padding:"14px",textAlign:"center"}}>
                        <div style={{fontFamily:O.mono,fontSize:7,color:O.textF,
                          letterSpacing:"2.5px",marginBottom:6}}>TODAY'S SPEND SO FAR</div>
                        <div style={{fontFamily:O.sans,fontWeight:900,fontSize:40,
                          color:O.amber,lineHeight:1,marginBottom:4,letterSpacing:"-1px"}}>
                          ${todaySpend}
                        </div>
                        <div style={{fontFamily:O.mono,fontSize:9,color:O.textD}}>
                          ${burnRate.toFixed(0)}/hr · {hrsPos.toFixed(1)}h elapsed
                        </div>
                      </div>

                      {/* Week-to-date progress */}
                      <div style={{background:O.bg2,border:"1px solid "+O.border,borderRadius:10,padding:"14px"}}>
                        <div style={{fontFamily:O.mono,fontSize:7,color:O.textF,
                          letterSpacing:"2.5px",marginBottom:10}}>WEEK-TO-DATE BUDGET</div>
                        <div style={{display:"flex",justifyContent:"space-between",marginBottom:5}}>
                          <span style={{fontFamily:O.sans,fontWeight:700,fontSize:16,color:"#fff"}}>
                            ${weekSpend.toLocaleString()}
                          </span>
                          <span style={{fontFamily:O.mono,fontSize:9,
                            color:budgetVar>=0?O.green:O.red}}>
                            {budgetVar>=0?"+$"+budgetVar+" under":"-$"+Math.abs(budgetVar)+" over"}
                          </span>
                        </div>
                        <div style={{height:6,background:"rgba(255,255,255,0.06)",borderRadius:3,marginBottom:4}}>
                          <div style={{height:"100%",borderRadius:3,
                            width:Math.min((weekSpend/weekBudget)*100,100)+"%",
                            background:budgetVar>=0?O.green:O.red,
                            transition:"width 1s ease"}}/>
                        </div>
                        <div style={{fontFamily:O.mono,fontSize:8,color:O.textF}}>
                          ${weekSpend.toLocaleString()} of ${weekBudget.toLocaleString()} budget
                        </div>
                      </div>

                      {/* Monthly sparkline */}
                      <div style={{background:O.bg2,border:"1px solid "+O.border,borderRadius:10,padding:"14px"}}>
                        <div style={{fontFamily:O.mono,fontSize:7,color:O.textF,
                          letterSpacing:"2.5px",marginBottom:10}}>6-WEEK LABOR BURN</div>
                        <div style={{display:"flex",alignItems:"flex-end",gap:5,height:50}}>
                          {MONTHLY.map((m,i)=>{
                            const h = Math.round(((m.cost||3500)/4500)*100);
                            return(
                              <div key={i} style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",gap:2}}>
                                <div style={{width:"100%",height:h+"%",minHeight:4,
                                  background:i===5?O.amber:"rgba(245,158,11,0.25)",
                                  borderRadius:"2px 2px 0 0",transition:"height 0.5s"}}/>
                                <span style={{fontFamily:O.mono,fontSize:6,color:O.textF}}>{m.m}</span>
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      {/* Ghost exposure + efficiency */}
                      <div style={{background:parseFloat(ghostExposure)>100?"rgba(239,68,68,0.05)":O.bg2,
                        border:"1px solid "+(parseFloat(ghostExposure)>100?"rgba(239,68,68,0.25)":O.border),
                        borderRadius:10,padding:"14px"}}>
                        <div style={{fontFamily:O.mono,fontSize:7,color:O.textF,
                          letterSpacing:"2.5px",marginBottom:12}}>PAYROLL EFFICIENCY</div>
                        <div style={{display:"flex",gap:12,alignItems:"center"}}>
                          <div style={{position:"relative",width:56,height:56,flexShrink:0}}>
                            <svg width="56" height="56" viewBox="0 0 56 56">
                              <circle cx="28" cy="28" r="22" fill="none"
                                stroke="rgba(255,255,255,0.06)" strokeWidth="5"/>
                              <circle cx="28" cy="28" r="22" fill="none"
                                stroke={payrollEff>=90?O.green:payrollEff>=75?O.amber:O.red}
                                strokeWidth="5"
                                strokeDasharray={2*Math.PI*22}
                                strokeDashoffset={2*Math.PI*22*(1-payrollEff/100)}
                                strokeLinecap="round"
                                transform="rotate(-90 28 28)"/>
                            </svg>
                            <div style={{position:"absolute",inset:0,display:"flex",
                              alignItems:"center",justifyContent:"center",
                              fontFamily:O.sans,fontWeight:700,fontSize:13,
                              color:payrollEff>=90?O.green:payrollEff>=75?O.amber:O.red}}>
                              {payrollEff}
                            </div>
                          </div>
                          <div>
                            <div style={{fontFamily:O.mono,fontSize:9,color:O.textD,marginBottom:4}}>
                              Ghost exposure
                            </div>
                            <div style={{fontFamily:O.sans,fontWeight:700,fontSize:16,color:O.red}}>
                              ${ghostExposure}
                            </div>
                            <div style={{fontFamily:O.mono,fontSize:8,color:O.textF,marginTop:2}}>
                              {totalGhost.toFixed(1)}h unverified
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* ── BOTTOM 2-COLUMN: FEED + AI ENGINE ── */}
                  <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,marginBottom:12}}>

                    {/* ── ZONE 5: LIVE SIGNAL FEED ── */}
                    <div style={{background:O.bg2,border:"1px solid "+O.border,borderRadius:10,padding:"14px"}}>
                      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:10}}>
                        <div style={{fontFamily:O.mono,fontSize:7,color:O.textF,letterSpacing:"2.5px"}}>
                          LIVE SIGNAL FEED
                        </div>
                        <div style={{display:"flex",gap:5}}>
                          {["ALL","CRITICAL","WARNINGS","GOOD"].map(f=>(
                            <button key={f} onClick={()=>setFilter(f.toLowerCase()==="all"?"all":f.toLowerCase()==="critical"?"critical":f.toLowerCase()==="warnings"?"warning":"good")}
                              style={{fontFamily:O.mono,fontSize:7,letterSpacing:1,
                                padding:"3px 7px",borderRadius:3,border:"none",
                                cursor:"pointer",
                                background:filter===(f.toLowerCase()==="all"?"all":f.toLowerCase()==="critical"?"critical":f.toLowerCase()==="warnings"?"warning":"good")
                                  ?"rgba(0,212,255,0.15)":"rgba(255,255,255,0.04)",
                                color:filter===(f.toLowerCase()==="all"?"all":f.toLowerCase()==="critical"?"critical":f.toLowerCase()==="warnings"?"warning":"good")
                                  ?"#00d4ff":O.textF}}>
                              {f}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div style={{maxHeight:280,overflowY:"auto"}}>
                        {FEED.filter(ev=>filter==="all"||ev.type===filter).slice(0,8).map((ev,i)=>{
                          const e = byId(ev.eId);
                          const c = sC(ev.type);
                          const icons = {critical:"⚠️",warning:"▲",good:"✅",normal:"●"};
                          return(
                            <div key={ev.id} style={{display:"flex",alignItems:"flex-start",gap:9,
                              padding:"8px 0",borderBottom:"1px solid "+O.border,
                              background:ev.type==="critical"?"rgba(239,68,68,0.03)":"transparent"}}>
                              <div style={{fontFamily:O.mono,fontSize:8,color:O.textF,
                                width:36,flexShrink:0,marginTop:1}}>{ev.time}</div>
                              <div style={{fontSize:11,width:14,flexShrink:0,marginTop:1}}>{icons[ev.type]||"●"}</div>
                              {e&&<Av emp={e} size={22} dark/>}
                              <div style={{flex:1,minWidth:0}}>
                                <div style={{fontFamily:O.sans,fontWeight:600,fontSize:11,
                                  color:"#fff",marginBottom:1}}>{e?e.name.split(" ")[0]+" — ":""}{ev.event}</div>
                                <div style={{fontFamily:O.mono,fontSize:8,color:O.textD}}>{ev.detail}</div>
                              </div>
                              <OBadge label={ev.type} color={c} sm/>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* ── ZONE 6: AI DECISION ENGINE ── */}
                    <div style={{background:"rgba(9,14,26,0.98)",
                      border:"1px solid rgba(0,212,255,0.2)",
                      borderRadius:10,padding:"14px",
                      boxShadow:"0 0 30px rgba(0,212,255,0.05)"}}>

                      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:12}}>
                        <div style={{fontFamily:O.mono,fontSize:7,color:"rgba(0,212,255,0.8)",letterSpacing:"2.5px"}}>
                          🤖 AI COMMAND BRIEF
                        </div>
                        <div style={{fontFamily:O.mono,fontSize:7,color:O.textF}}>
                          Updated {now.toLocaleTimeString("en-US",{hour12:false})}
                        </div>
                      </div>

                      {/* Situation report */}
                      <div style={{background:"rgba(0,212,255,0.05)",border:"1px solid rgba(0,212,255,0.12)",
                        borderRadius:8,padding:"10px 12px",marginBottom:12}}>
                        <div style={{fontFamily:O.mono,fontSize:7,color:"rgba(0,212,255,0.6)",
                          letterSpacing:2,marginBottom:5}}>SITUATION REPORT</div>
                        <div style={{fontFamily:O.sans,fontSize:12,color:O.textD,lineHeight:1.65}}>
                          {critCount>0
                            ? "⚠️ "+critCount+" critical signal"+(critCount>1?"s":"")+` require immediate action. Marcus Bell unverified ${totalGhost.toFixed(1)}h — ghost hour window active. Register void pattern on Reg 2 warrants review before close.`
                            : warnCount>0
                            ? `Operations running with ${warnCount} open warning${warnCount>1?"s":""}. Monitor ghost hour exposure ($${ghostExposure}) and camera verification gaps before end of shift.`
                            : "Operations nominal. All staff verified. Payroll tracking within budget. No anomalies detected in the last 60 minutes."}
                        </div>
                      </div>

                      {/* Priority actions */}
                      <div style={{marginBottom:12}}>
                        <div style={{fontFamily:O.mono,fontSize:7,color:O.textF,
                          letterSpacing:"2.5px",marginBottom:8}}>PRIORITY ACTIONS</div>
                        {[
                          {
                            sev:"critical",
                            txt:"Verify Marcus Bell's location",
                            sub:"Ghost hours: "+totalGhost.toFixed(1)+"h ($"+ghostCost+" at risk)",
                            btn:"REVIEW",c:O.red
                          },
                          {
                            sev:"warning",
                            txt:"Review Register 2 void history",
                            sub:reg2Voids+" voids in 4 hours — threshold exceeded",
                            btn:"REVIEW",c:O.amber
                          },
                          {
                            sev:"good",
                            txt:"Approve Jordan's shift swap",
                            sub:"Pending 2h 14m — team coverage maintained",
                            btn:"APPROVE",c:O.green
                          },
                        ].map((a,i)=>(
                          <div key={i} style={{display:"flex",alignItems:"center",gap:8,
                            padding:"8px",borderRadius:7,marginBottom:6,
                            background:a.c+"08",border:"1px solid "+a.c+"25"}}>
                            <div style={{width:3,height:"100%",minHeight:28,
                              background:a.c,borderRadius:2,flexShrink:0}}/>
                            <div style={{flex:1,minWidth:0}}>
                              <div style={{fontFamily:O.sans,fontWeight:600,
                                fontSize:11,color:"#fff",marginBottom:1}}>{a.txt}</div>
                              <div style={{fontFamily:O.mono,fontSize:8,color:O.textD}}>{a.sub}</div>
                            </div>
                            <button style={{fontFamily:O.mono,fontSize:8,letterSpacing:1,
                              padding:"4px 10px",background:a.c+"20",
                              border:"1px solid "+a.c+"50",borderRadius:4,
                              color:a.c,cursor:"pointer",whiteSpace:"nowrap",flexShrink:0}}>
                              {a.btn}
                            </button>
                          </div>
                        ))}
                      </div>

                      {/* Shift forecast */}
                      <div style={{background:"rgba(245,158,11,0.05)",
                        border:"1px solid rgba(245,158,11,0.15)",
                        borderRadius:8,padding:"10px 12px"}}>
                        <div style={{fontFamily:O.mono,fontSize:7,color:"rgba(245,158,11,0.7)",
                          letterSpacing:2,marginBottom:5}}>SHIFT FORECAST</div>
                        <div style={{fontFamily:O.sans,fontSize:11,color:O.textD,lineHeight:1.7}}>
                          At current burn rate: <span style={{color:O.amber}}>${(burnRate*8).toFixed(0)} total today</span>.
                          Ghost exposure: <span style={{color:O.red}}>${ghostExposure}</span>.
                          Productivity trending {EMPS.reduce((s,e)=>s+e.prod,0)/EMPS.length<80?"below":"on"} average.
                          {EMPS.find(e=>e.risk==="Medium")
                            ? " Consider checking in with "+EMPS.find(e=>e.risk==="Medium").name.split(" ")[0]+" — pattern suggests end-of-week fatigue."
                            : " Team performance strong — no interventions needed."}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* ── ZONE 7: LABOR COST CHART ── */}
                  <div style={{background:O.bg2,border:"1px solid "+O.border,borderRadius:10,padding:"14px"}}>
                    <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:12}}>
                      <div style={{fontFamily:O.mono,fontSize:7,color:O.textF,letterSpacing:"2.5px"}}>
                        LABOR COST — THIS WEEK
                      </div>
                      <div style={{display:"flex",gap:6}}>
                        {["THIS WEEK","THIS MONTH","6 MONTHS"].map(t=>(
                          <button key={t} style={{fontFamily:O.mono,fontSize:7,letterSpacing:1,
                            padding:"3px 8px",borderRadius:3,border:"none",
                            cursor:"pointer",background:t==="THIS WEEK"?"rgba(245,158,11,0.15)":"rgba(255,255,255,0.04)",
                            color:t==="THIS WEEK"?O.amber:O.textF}}>
                            {t}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div style={{display:"flex",alignItems:"flex-end",gap:8,height:64,position:"relative"}}>
                      {/* Benchmark line */}
                      <div style={{position:"absolute",left:0,right:0,
                        top:"30%",borderTop:"1px dashed rgba(255,255,255,0.1)",
                        pointerEvents:"none"}}>
                        <span style={{fontFamily:O.mono,fontSize:7,color:O.textF,
                          position:"absolute",right:0,top:-8}}>avg</span>
                      </div>
                      {["Mon","Tue","Wed","Thu","Fri","Sat","Sun"].map((d,i)=>{
                        const isToday = i === (new Date().getDay()+6)%7;
                        const h = isToday?parseInt(todaySpend)/12:[55,70,62,68,75,45,30][i];
                        const barH = Math.min(Math.round((h/80)*100),100);
                        return(
                          <div key={d} style={{flex:1,display:"flex",
                            flexDirection:"column",alignItems:"center",gap:4}}>
                            <div style={{width:"100%",height:barH+"%",minHeight:3,
                              background:isToday?O.amber:i<(new Date().getDay()+6)%7?"rgba(245,158,11,0.35)":"rgba(255,255,255,0.06)",
                              borderRadius:"3px 3px 0 0",
                              border:isToday?"1px solid "+O.amber:"none",
                              boxShadow:isToday?"0 0 10px rgba(245,158,11,0.3)":"none",
                              transition:"height 0.5s"}}/>
                            <span style={{fontFamily:O.mono,fontSize:7,
                              color:isToday?O.amber:O.textF}}>{d}</span>
                          </div>
                        );
                      })}
                    </div>
                    <div style={{display:"flex",gap:14,marginTop:8}}>
                      <div style={{display:"flex",alignItems:"center",gap:4}}>
                        <div style={{width:10,height:3,background:O.amber,borderRadius:2}}/>
                        <span style={{fontFamily:O.mono,fontSize:8,color:O.textD}}>Today</span>
                      </div>
                      <div style={{display:"flex",alignItems:"center",gap:4}}>
                        <div style={{width:10,height:3,background:"rgba(245,158,11,0.35)",borderRadius:2}}/>
                        <span style={{fontFamily:O.mono,fontSize:8,color:O.textD}}>This week</span>
                      </div>
                      <div style={{display:"flex",alignItems:"center",gap:4}}>
                        <div style={{width:10,height:1,background:"rgba(255,255,255,0.15)",borderRadius:2}}/>
                        <span style={{fontFamily:O.mono,fontSize:8,color:O.textD}}>Average</span>
                      </div>
                    </div>
                  </div>

                  {/* ── EMERGENCY BROADCAST ── */}
                  <div style={{display:"flex",justifyContent:"flex-end",marginTop:10}}>
                    <button style={{display:"flex",alignItems:"center",gap:7,
                      padding:"8px 18px",
                      background:"rgba(239,68,68,0.08)",
                      border:"1px solid rgba(239,68,68,0.25)",
                      borderRadius:7,cursor:"pointer",
                      fontFamily:O.mono,fontSize:10,color:O.red,
                      letterSpacing:1,transition:"all 0.2s"}}
                      onMouseEnter={e=>{e.currentTarget.style.background="rgba(239,68,68,0.15)";}}
                      onMouseLeave={e=>{e.currentTarget.style.background="rgba(239,68,68,0.08)";}}>
                      ⚡ EMERGENCY BROADCAST
                    </button>
                  </div>

                </div>
              );
            })()}
          </div>
        )}


                {/* ── INTELLIGENCE PROFILE (Prompt 7) ── */}
        {tab==="intelligence" && (
          <div style={{animation:"fadeUp 0.3s ease"}}>

            {/* Employee selector pills */}
            <div style={{fontFamily:O.mono,fontSize:8,color:O.textF,letterSpacing:2,marginBottom:10}}>SELECT EMPLOYEE FOR ANALYSIS</div>
            <div style={{display:"flex",gap:8,marginBottom:20,flexWrap:"wrap"}}>
              {EMPS.map(e => (
                <button key={e.id} onClick={()=>setSelEmp(e.id)}
                  style={{display:"flex",alignItems:"center",gap:8,padding:"7px 14px",
                    background:selEmp===e.id?O.amberD:O.bg2,
                    border:"1px solid "+(selEmp===e.id?O.amber:O.border),
                    borderRadius:20,cursor:"pointer",transition:"all 0.15s"}}>
                  <Av emp={e} size={24} dark/>
                  <span style={{fontFamily:O.sans,fontWeight:600,fontSize:12,
                    color:selEmp===e.id?O.amber:O.text}}>{e.name.split(" ")[0]}</span>
                </button>
              ))}
            </div>

            {selEmp && (() => {
              const e = byId(selEmp);
              const riskColor = rC(e.risk);
              const flags = BFLAGS.filter(f=>f.eId===e.id);
              const payAcc = Math.round((1-(e.ghost/Math.max(e.wkHrs,1)))*100);
              const reliTier = e.rel>=90?"ELITE":e.rel>=75?"SOLID":e.rel>=60?"WATCH":"RISK";
              const reliTierColor = e.rel>=90?O.green:e.rel>=75?O.blue:e.rel>=60?O.amber:O.red;
              const wkCost = (e.wkHrs*e.rate).toFixed(0);
              const ghostCost = (e.ghost*e.rate).toFixed(0);
              const avgRel = Math.round(EMPS.reduce((s,x)=>s+x.rel,0)/EMPS.length);
              const avgProd = Math.round(EMPS.reduce((s,x)=>s+x.prod,0)/EMPS.length);
              const avgCam = Math.round(EMPS.reduce((s,x)=>s+x.cam,0)/EMPS.length);
              const avgGhost = (EMPS.reduce((s,x)=>s+x.ghost,0)/EMPS.length).toFixed(1);
              const relRank = [...EMPS].sort((a,b)=>b.rel-a.rel).findIndex(x=>x.id===e.id)+1;
              const prodRank = [...EMPS].sort((a,b)=>b.prod-a.prod).findIndex(x=>x.id===e.id)+1;
              const ghostRank = [...EMPS].sort((a,b)=>b.ghost-a.ghost).findIndex(x=>x.id===e.id)+1;
              const camRank = [...EMPS].sort((a,b)=>b.cam-a.cam).findIndex(x=>x.id===e.id)+1;
              const riskScore = Math.round(
                (100-e.rel)*0.3 + (100-e.cam)*0.25 + e.ghost*8 + e.flags*10 + (100-e.prod)*0.2
              );
              const aiSummary = e.risk==="Low"
                ? "Consistent performer. Metrics stable across all categories. No active concerns."
                : e.risk==="Medium"
                ? "Performance solid but ghost hour uptick noted last 3 weeks. Monitor closely."
                : "Multiple risk signals active. Camera mismatches and ghost hours require immediate review.";

              // Generate timeline events from employee data
              const days = 90;
              const tlEvents = [];
              for(let d=0; d<days; d++){
                const date = new Date(Date.now()-d*86400000);
                const dow = date.getDay();
                if(dow===0||dow===6) continue;
                const r = (e.id*31+d*7)%100;
                if(r < (e.rel-10)) tlEvents.push({d,date,type:"ontime",label:"On-time clock-in"});
                else if(r < e.rel) tlEvents.push({d,date,type:"late",label:"Late arrival"});
                else if(d%13===0&&e.ghost>1) tlEvents.push({d,date,type:"ghost",label:"Ghost hours flagged"});
                else if(d%19===0) tlEvents.push({d,date,type:"swap",label:"Shift swap"});
              }
              tlEvents.reverse();

              // Incident log
              const incidents = [
                ...flags.map((f,i)=>({date:"Mar "+(28-i),type:"Behavioral",sev:f.sev,detail:f.signal+" — "+f.desc,status:"Open"})),
                e.ghost>2?{date:"Mar 22",type:"Ghost Hours",sev:"warning",detail:e.ghost+"h unverified this week",status:"Open"}:null,
                e.cam<80?{date:"Mar 18",type:"Camera Mismatch",sev:"warning",detail:"Clocked in 45min before camera confirmed presence",status:"Resolved"}:null,
                e.flags>0?{date:"Mar 14",type:"Productivity Flag",sev:"info",detail:"Output below threshold — 3rd occurrence",status:"Resolved"}:null,
                {date:"Mar 08",type:"Late Arrival",sev:"info",detail:"12min late — no prior notice given",status:"Resolved"},
              ].filter(Boolean);

              // Schedule shifts
              const schedDays = ["Mon","Tue","Wed","Thu","Fri","Sat","Sun"];
              const schedPattern = [1,1,0,1,1,0,0]; // typical M/T/Th/F

              const SectionLabel = ({text}) => (
                <div style={{fontFamily:O.mono,fontSize:8,color:O.textF,letterSpacing:"2.5px",
                  textTransform:"uppercase",marginBottom:12}}>{text}</div>
              );

              const Card = ({children,border,style={}}) => (
                <div style={{background:O.bg2,border:"1px solid "+(border||O.border),
                  borderRadius:12,padding:"18px 20px",marginBottom:14,...style}}>
                  {children}
                </div>
              );

              return (
                <div key={e.id}>

                  {/* ── SECTION 1: IDENTITY HEADER ── */}
                  <Card border={"1px solid "+riskColor+"40"} style={{border:"1px solid "+riskColor+"35"}}>
                    <div style={{display:"flex",gap:18,alignItems:"flex-start",flexWrap:"wrap"}}>
                      {/* Avatar with risk ring */}
                      <div style={{position:"relative",flexShrink:0}}>
                        <div style={{width:72,height:72,borderRadius:16,
                          background:e.color+"22",border:"2.5px solid "+riskColor,
                          display:"flex",alignItems:"center",justifyContent:"center",
                          fontFamily:O.mono,fontSize:22,color:e.color,fontWeight:600}}>
                          {e.avatar}
                        </div>
                        <div style={{position:"absolute",bottom:-4,right:-4,
                          background:e.status==="active"?O.green:e.status==="break"?O.amber:O.textD,
                          width:14,height:14,borderRadius:"50%",border:"2px solid "+O.bg2}}/>
                      </div>

                      <div style={{flex:1,minWidth:220}}>
                        {/* Name + badges */}
                        <div style={{display:"flex",alignItems:"center",gap:8,flexWrap:"wrap",marginBottom:4}}>
                          <span style={{fontFamily:O.sans,fontWeight:800,fontSize:22,color:"#fff"}}>{e.name}</span>
                          <span style={{fontFamily:O.mono,fontSize:9,color:riskColor,
                            background:riskColor+"18",border:"1px solid "+riskColor+"40",
                            borderRadius:4,padding:"2px 8px",letterSpacing:1}}>
                            RISK: {e.risk.toUpperCase()}
                          </span>
                          <span style={{fontFamily:O.mono,fontSize:9,
                            color:e.status==="active"?O.green:e.status==="break"?O.amber:O.textD,
                            background:(e.status==="active"?O.green:e.status==="break"?O.amber:O.textD)+"18",
                            border:"1px solid "+(e.status==="active"?O.green:e.status==="break"?O.amber:O.textD)+"40",
                            borderRadius:4,padding:"2px 8px",letterSpacing:1}}>
                            {e.status.toUpperCase()}
                          </span>
                        </div>

                        <div style={{fontFamily:O.mono,fontSize:10,color:O.textD,marginBottom:10}}>
                          {e.role} · {e.dept} · Hired {e.hired} · {e.email}
                        </div>

                        {/* AI Summary */}
                        <div style={{fontFamily:O.sans,fontSize:13,color:O.textD,
                          background:O.bg3,borderRadius:8,padding:"9px 12px",
                          borderLeft:"3px solid "+riskColor,marginBottom:12,lineHeight:1.5}}>
                          🤖 {aiSummary}
                        </div>

                        {/* Pill badges */}
                        <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
                          <div style={{fontFamily:O.mono,fontSize:9,color:reliTierColor,
                            background:reliTierColor+"15",border:"1px solid "+reliTierColor+"40",
                            borderRadius:20,padding:"3px 12px",letterSpacing:1}}>
                            {reliTier} TIER
                          </div>
                          <div style={{fontFamily:O.mono,fontSize:9,color:O.teal||"#06b6d4",
                            background:"rgba(6,182,212,0.12)",border:"1px solid rgba(6,182,212,0.3)",
                            borderRadius:20,padding:"3px 12px",letterSpacing:1}}>
                            🔥 {e.streak}-DAY STREAK
                          </div>
                          <div style={{fontFamily:O.mono,fontSize:9,
                            color:payAcc>=95?O.green:payAcc>=85?O.amber:O.red,
                            background:(payAcc>=95?O.green:payAcc>=85?O.amber:O.red)+"15",
                            border:"1px solid "+(payAcc>=95?O.green:payAcc>=85?O.amber:O.red)+"40",
                            borderRadius:20,padding:"3px 12px",letterSpacing:1}}>
                            {payAcc}% PAYROLL ACCURACY
                          </div>
                        </div>
                      </div>

                      <Ring val={e.rel} size={72}/>
                    </div>
                  </Card>

                  {/* ── SECTION 2: LIVE SIGNAL SCORECARD ── */}
                  <Card>
                    <SectionLabel text="Live Signal Scorecard"/>
                    <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:10}}>
                      {[
                        {l:"Reliability",v:e.rel+"%",c:e.rel>=80?O.green:e.rel>=60?O.amber:O.red,t:e.rel>=avgRel?"↑":"↓",prev:e.rel-3},
                        {l:"Productivity",v:e.prod+"%",c:e.prod>=80?O.green:e.prod>=60?O.amber:O.red,t:e.prod>=avgProd?"↑":"↓",prev:e.prod-2},
                        {l:"Camera Presence",v:e.cam+"%",c:e.cam>=80?O.green:e.cam>=60?O.amber:O.red,t:e.cam>=avgCam?"↑":"↓",prev:e.cam+1},
                        {l:"Ghost Hours",v:e.ghost+"h",c:e.ghost>3?O.red:e.ghost>1?O.amber:O.green,t:e.ghost>1?"↑":"→",prev:e.ghost-0.5},
                        {l:"Flags This Month",v:String(e.flags),c:e.flags>1?O.red:e.flags>0?O.amber:O.green,t:e.flags>0?"↑":"→",prev:e.flags},
                        {l:"Weekly Cost",v:"$"+wkCost,c:O.amber,t:"→",prev:null},
                      ].map(m => (
                        <div key={m.l} style={{background:O.bg3,borderRadius:8,padding:"12px",textAlign:"center"}}>
                          <div style={{fontFamily:O.mono,fontSize:7,color:O.textF,
                            letterSpacing:2,marginBottom:6,textTransform:"uppercase"}}>{m.l}</div>
                          <div style={{fontFamily:O.sans,fontWeight:800,fontSize:22,
                            color:m.c,lineHeight:1,marginBottom:4}}>{m.v}</div>
                          <div style={{fontFamily:O.mono,fontSize:11,
                            color:m.t==="↑"?O.green:m.t==="↓"?O.red:O.textD}}>
                            {m.t} {m.prev!==null ? "vs "+m.prev+(typeof m.prev==="number"&&m.l.includes("%")?"%":"h") : "stable"}
                          </div>
                        </div>
                      ))}
                    </div>
                  </Card>

                  {/* ── SECTION 3: 90-DAY BEHAVIORAL TIMELINE ── */}
                  <Card>
                    <SectionLabel text="90-Day Behavioral Timeline"/>
                    <div style={{position:"relative",overflowX:"auto",paddingBottom:8}}>
                      <div style={{display:"flex",alignItems:"center",gap:4,minWidth:500,position:"relative"}}>
                        <div style={{position:"absolute",top:"50%",left:0,right:0,height:1,
                          background:"rgba(255,255,255,0.06)",transform:"translateY(-50%)",zIndex:0}}/>
                        {tlEvents.slice(0,60).map((ev,i) => {
                          const dotColor = ev.type==="ontime"?O.green:ev.type==="ghost"?O.red:ev.type==="late"?O.amber:ev.type==="swap"?"#3b82f6":"#666";
                          const dotSize = ev.type==="ontime"?6:10;
                          return (
                            <div key={i} title={ev.date.toLocaleDateString()+" — "+ev.label}
                              style={{width:dotSize,height:dotSize,borderRadius:"50%",
                                background:dotColor,flexShrink:0,cursor:"pointer",
                                position:"relative",zIndex:1,
                                boxShadow:ev.type!=="ontime"?"0 0 6px "+dotColor+"80":"none",
                                transition:"transform 0.1s"}}
                              onMouseEnter={e2=>{e2.currentTarget.style.transform="scale(2)";}}
                              onMouseLeave={e2=>{e2.currentTarget.style.transform="scale(1)";}}
                            />
                          );
                        })}
                      </div>
                    </div>

                    {/* Legend */}
                    <div style={{display:"flex",gap:14,marginTop:10,flexWrap:"wrap"}}>
                      {[["On-time",O.green],["Ghost Hours",O.red],["Late",O.amber],["Swap","#3b82f6"]].map(([l,c])=>(
                        <div key={l} style={{display:"flex",alignItems:"center",gap:5}}>
                          <div style={{width:8,height:8,borderRadius:"50%",background:c}}/>
                          <span style={{fontFamily:O.mono,fontSize:9,color:O.textD}}>{l}</span>
                        </div>
                      ))}
                    </div>

                    {/* Pattern analysis */}
                    <div style={{marginTop:14,background:O.bg3,borderRadius:8,padding:"12px 14px",
                      borderLeft:"3px solid rgba(6,182,212,0.5)"}}>
                      <div style={{fontFamily:O.mono,fontSize:8,color:"rgba(6,182,212,0.8)",
                        letterSpacing:2,marginBottom:6}}>AI PATTERN ANALYSIS</div>
                      <div style={{fontFamily:O.sans,fontSize:12,color:O.textD,lineHeight:1.7}}>
                        {e.risk==="Low"
                          ? "Strong consistency Tue–Thu. Minor dip in productivity on Mondays. No concerning patterns detected over the 90-day window."
                          : e.risk==="Medium"
                          ? "Friday performance drops ~18% after 3pm. Monday late arrivals 40% more frequent than rest of week. Ghost hours cluster around mid-week."
                          : "Pattern irregularity detected in 3 of 4 weeks. Camera presence gaps align with ghost hour windows. Weekend schedule changes correlate with Monday incidents."
                        }
                      </div>
                    </div>
                  </Card>

                  {/* ── SECTION 4: INCIDENT LOG ── */}
                  <Card>
                    <SectionLabel text={"Incident Log ("+incidents.length+" records)"}/>
                    <div style={{overflowX:"auto"}}>
                      <div style={{minWidth:540}}>
                        {/* Header row */}
                        <div style={{display:"grid",gridTemplateColumns:"80px 140px 80px 1fr 80px",
                          padding:"6px 10px",background:O.bg3,borderRadius:"6px 6px 0 0",gap:8}}>
                          {["DATE","TYPE","SEVERITY","DETAIL","STATUS"].map(h=>(
                            <div key={h} style={{fontFamily:O.mono,fontSize:7,
                              color:O.textF,letterSpacing:2}}>{h}</div>
                          ))}
                        </div>
                        {incidents.map((inc,i) => {
                          const sc = inc.sev==="critical"?O.red:inc.sev==="warning"?O.amber:O.blue;
                          return (
                            <div key={i} style={{display:"grid",
                              gridTemplateColumns:"80px 140px 80px 1fr 80px",
                              padding:"10px",gap:8,
                              borderBottom:"1px solid "+O.border,
                              background:i%2===0?"transparent":"rgba(255,255,255,0.01)",
                              alignItems:"center"}}>
                              <div style={{fontFamily:O.mono,fontSize:9,color:O.textD}}>{inc.date}</div>
                              <div style={{fontFamily:O.sans,fontWeight:600,fontSize:11,color:O.text}}>{inc.type}</div>
                              <div style={{fontFamily:O.mono,fontSize:8,color:sc,
                                background:sc+"15",borderRadius:3,
                                padding:"2px 6px",textAlign:"center",letterSpacing:1,
                                textTransform:"uppercase",width:"fit-content"}}>{inc.sev}</div>
                              <div style={{fontFamily:O.mono,fontSize:9,color:O.textD,lineHeight:1.4}}>{inc.detail}</div>
                              <div style={{fontFamily:O.mono,fontSize:8,
                                color:inc.status==="Open"?O.amber:O.green,
                                letterSpacing:1}}>{inc.status.toUpperCase()}</div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </Card>

                  {/* ── SECTION 5: PAYROLL FORENSICS ── */}
                  <Card>
                    <SectionLabel text="Payroll Forensics"/>
                    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:10,marginBottom:14}}>
                      {[
                        {l:"Scheduled Hours",v:e.wkHrs+"h",c:O.textD},
                        {l:"Clocked Hours",v:e.wkHrs+"h",c:O.text},
                        {l:"Camera Verified",v:(e.wkHrs-e.ghost).toFixed(1)+"h",
                          c:e.ghost>2?O.red:e.ghost>0?O.amber:O.green},
                      ].map(col=>(
                        <div key={col.l} style={{background:O.bg3,borderRadius:8,
                          padding:"14px",textAlign:"center"}}>
                          <div style={{fontFamily:O.mono,fontSize:7,color:O.textF,
                            letterSpacing:2,marginBottom:6,textTransform:"uppercase"}}>{col.l}</div>
                          <div style={{fontFamily:O.sans,fontWeight:700,fontSize:22,color:col.c}}>{col.v}</div>
                        </div>
                      ))}
                    </div>

                    {/* Ghost hours cost */}
                    {e.ghost>0 && (
                      <div style={{display:"flex",justifyContent:"space-between",
                        alignItems:"center",padding:"10px 14px",
                        background:"rgba(239,68,68,0.06)",
                        border:"1px solid rgba(239,68,68,0.2)",borderRadius:8,marginBottom:12}}>
                        <div>
                          <div style={{fontFamily:O.sans,fontWeight:600,fontSize:13,color:O.red}}>
                            Ghost Hours Detected
                          </div>
                          <div style={{fontFamily:O.mono,fontSize:10,color:O.textD,marginTop:2}}>
                            {e.ghost}h unverified · ${ghostCost} potential overpayment at ${e.rate}/hr
                          </div>
                        </div>
                        <div style={{fontFamily:O.sans,fontWeight:800,fontSize:20,color:O.red}}>
                          -{ghostCost}
                        </div>
                      </div>
                    )}

                    {/* Payroll accuracy bar */}
                    <div style={{marginBottom:8}}>
                      <div style={{display:"flex",justifyContent:"space-between",marginBottom:4}}>
                        <span style={{fontFamily:O.mono,fontSize:9,color:O.textD}}>Payroll Accuracy</span>
                        <span style={{fontFamily:O.mono,fontSize:9,
                          color:payAcc>=95?O.green:payAcc>=85?O.amber:O.red}}>
                          {payAcc}%
                        </span>
                      </div>
                      <div style={{height:6,background:"rgba(255,255,255,0.06)",borderRadius:3,overflow:"hidden"}}>
                        <div style={{height:"100%",width:payAcc+"%",borderRadius:3,
                          background:payAcc>=95?O.green:payAcc>=85?O.amber:O.red,
                          transition:"width 1s ease"}}/>
                      </div>
                    </div>

                    <div style={{fontFamily:O.mono,fontSize:9,color:O.textD,lineHeight:1.6}}>
                      {e.ghost>2
                        ? "Ghost hours increased vs prior month. 2 of last 4 weeks exceeded 2h threshold. Recommend manual timesheet audit."
                        : e.ghost>0
                        ? "Minor discrepancy detected. Within acceptable range but worth monitoring."
                        : "No discrepancies detected this period. Payroll fully verified by camera."}
                    </div>
                  </Card>

                  {/* ── SECTION 6: COMPARATIVE INTELLIGENCE ── */}
                  <Card>
                    <SectionLabel text="Team Comparative Intelligence"/>
                    <div style={{display:"flex",flexDirection:"column",gap:12}}>
                      {[
                        {l:"Reliability",val:e.rel,avg:avgRel,rank:relRank,c:e.rel>=avgRel?O.green:O.amber},
                        {l:"Productivity",val:e.prod,avg:avgProd,rank:prodRank,c:e.prod>=avgProd?O.green:O.amber},
                        {l:"Camera Presence",val:e.cam,avg:avgCam,rank:camRank,c:e.cam>=avgCam?O.green:O.amber},
                        {l:"Ghost Hours (lower=better)",val:Math.round((1-e.ghost/5)*100),avg:Math.round((1-parseFloat(avgGhost)/5)*100),rank:ghostRank,c:e.ghost<=parseFloat(avgGhost)?O.green:O.red},
                      ].map(m=>(
                        <div key={m.l}>
                          <div style={{display:"flex",justifyContent:"space-between",
                            alignItems:"center",marginBottom:5}}>
                            <span style={{fontFamily:O.mono,fontSize:9,color:O.textD}}>{m.l}</span>
                            <div style={{display:"flex",alignItems:"center",gap:10}}>
                              <span style={{fontFamily:O.mono,fontSize:9,color:O.textF}}>
                                #{m.rank} of {EMPS.length}
                              </span>
                              <span style={{fontFamily:O.mono,fontSize:9,color:m.c}}>
                                {m.val>=m.avg?"+"+(m.val-m.avg):""+( m.val-m.avg)}% vs avg
                              </span>
                            </div>
                          </div>
                          <div style={{position:"relative",height:6,background:"rgba(255,255,255,0.06)",borderRadius:3}}>
                            {/* Team average marker */}
                            <div style={{position:"absolute",top:-2,height:10,width:2,
                              background:"rgba(255,255,255,0.2)",borderRadius:1,
                              left:m.avg+"%",zIndex:2}}/>
                            {/* Employee bar */}
                            <div style={{height:"100%",width:m.val+"%",borderRadius:3,
                              background:m.c,transition:"width 1s ease",position:"relative",zIndex:1}}/>
                          </div>
                        </div>
                      ))}
                    </div>
                    <div style={{fontFamily:O.sans,fontSize:12,color:O.textD,
                      marginTop:14,lineHeight:1.7,
                      background:O.bg3,borderRadius:8,padding:"10px 12px"}}>
                      {e.rel>avgRel && e.prod>avgProd
                        ? "Above team average on reliability (+"+( e.rel-avgRel)+"%) and productivity (+"+( e.prod-avgProd)+"%). One of the stronger performers on the floor."
                        : e.rel<avgRel
                        ? "Below team average on reliability (-"+(avgRel-e.rel)+"%). Camera presence at "+(e.cam>=avgCam?"above":"below")+" team average. Targeted coaching recommended."
                        : "Mixed performance signals. Strong in some areas, trailing in others. Review incident history for context."}
                    </div>
                  </Card>

                  {/* ── SECTION 7: AI RISK ASSESSMENT ── */}
                  <Card border={e.risk==="High"||e.risk==="Critical"?"1px solid rgba(239,68,68,0.4)":"1px solid rgba(245,158,11,0.3)"}>
                    <SectionLabel text="AI Risk Assessment"/>
                    <div style={{display:"flex",gap:20,alignItems:"flex-start",flexWrap:"wrap"}}>

                      {/* Risk score gauge */}
                      <div style={{textAlign:"center",flexShrink:0}}>
                        <div style={{position:"relative",width:90,height:90,margin:"0 auto 8px"}}>
                          <svg width="90" height="90" viewBox="0 0 90 90">
                            <circle cx="45" cy="45" r="38" fill="none"
                              stroke="rgba(255,255,255,0.06)" strokeWidth="7"/>
                            <circle cx="45" cy="45" r="38" fill="none"
                              stroke={riskColor} strokeWidth="7"
                              strokeDasharray={2*Math.PI*38}
                              strokeDashoffset={2*Math.PI*38*(1-riskScore/100)}
                              strokeLinecap="round"
                              transform="rotate(-90 45 45)"/>
                          </svg>
                          <div style={{position:"absolute",inset:0,display:"flex",
                            flexDirection:"column",alignItems:"center",justifyContent:"center"}}>
                            <div style={{fontFamily:O.sans,fontWeight:800,fontSize:22,
                              color:riskColor,lineHeight:1}}>{riskScore}</div>
                            <div style={{fontFamily:O.mono,fontSize:7,color:O.textF,letterSpacing:1}}>RISK</div>
                          </div>
                        </div>
                        <div style={{fontFamily:O.mono,fontSize:9,color:riskColor,
                          letterSpacing:1,textAlign:"center"}}>{e.risk.toUpperCase()} RISK</div>
                        <div style={{fontFamily:O.mono,fontSize:8,color:O.textF,marginTop:4,
                          textAlign:"center"}}>
                          {riskScore>70?"DETERIORATING ↑":riskScore>40?"STABLE →":"IMPROVING ↓"}
                        </div>
                      </div>

                      <div style={{flex:1,minWidth:240}}>
                        {/* Risk factors */}
                        <div style={{fontFamily:O.mono,fontSize:8,color:O.textF,
                          letterSpacing:2,marginBottom:8}}>RISK FACTORS</div>
                        <div style={{display:"flex",flexDirection:"column",gap:6,marginBottom:14}}>
                          {[
                            e.ghost>3 ? {f:"Ghost hours exceeded 3h threshold in 2 of last 4 weeks",c:O.red} : null,
                            e.cam<75 ? {f:"Camera presence below 75% on 3 occasions this month",c:O.red} : null,
                            e.ghost>0&&e.ghost<=3 ? {f:"Minor ghost hour discrepancy — within warning range",c:O.amber} : null,
                            e.flags>0 ? {f:e.flags+" active behavioral flag"+(e.flags>1?"s":"")+" on record",c:O.amber} : null,
                            e.rel<avgRel ? {f:"Reliability below team average by "+(avgRel-e.rel)+"%",c:O.amber} : null,
                            e.risk==="Low" ? {f:"No active risk signals. All metrics within acceptable range",c:O.green} : null,
                          ].filter(Boolean).slice(0,3).map((item,i)=>(
                            <div key={i} style={{display:"flex",gap:8,alignItems:"flex-start"}}>
                              <div style={{width:5,height:5,borderRadius:"50%",
                                background:item.c,marginTop:4,flexShrink:0}}/>
                              <span style={{fontFamily:O.sans,fontSize:12,color:O.textD,lineHeight:1.4}}>
                                {item.f}
                              </span>
                            </div>
                          ))}
                        </div>

                        {/* Recommended actions */}
                        <div style={{fontFamily:O.mono,fontSize:8,color:O.textF,
                          letterSpacing:2,marginBottom:8}}>RECOMMENDED ACTIONS</div>
                        <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
                          {(e.risk==="Low"
                            ? ["Continue monitoring","Recognize strong performance","No action required"]
                            : e.risk==="Medium"
                            ? ["Schedule 1:1 conversation","Verify zone assignments","Review last 2 weeks manually"]
                            : ["Immediate timesheet audit","Cross-reference camera logs","Escalate to HR review"]
                          ).map(action=>(
                            <div key={action} style={{fontFamily:O.mono,fontSize:9,
                              color:riskColor,background:riskColor+"12",
                              border:"1px solid "+riskColor+"35",
                              borderRadius:20,padding:"4px 12px",letterSpacing:"0.5px"}}>
                              {action}
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </Card>

                  {/* ── SECTION 8: SCHEDULE INTELLIGENCE ── */}
                  <Card>
                    <SectionLabel text="Schedule Intelligence"/>

                    {/* Week grid */}
                    <div style={{display:"grid",gridTemplateColumns:"repeat(7,1fr)",gap:6,marginBottom:16}}>
                      {schedDays.map((day,i)=>(
                        <div key={day}>
                          <div style={{fontFamily:O.mono,fontSize:8,color:O.textF,
                            textAlign:"center",marginBottom:5,letterSpacing:1}}>{day}</div>
                          <div style={{background:schedPattern[i]?e.color+"25":"rgba(255,255,255,0.03)",
                            border:"1px solid "+(schedPattern[i]?e.color+"50":O.border),
                            borderRadius:6,padding:"8px 0",textAlign:"center",
                            transition:"all 0.2s"}}>
                            {schedPattern[i]?(
                              <div>
                                <div style={{fontFamily:O.mono,fontSize:8,
                                  color:e.color,marginBottom:2}}>9AM</div>
                                <div style={{fontFamily:O.mono,fontSize:7,color:O.textF}}>5PM</div>
                              </div>
                            ):(
                              <div style={{fontFamily:O.mono,fontSize:8,color:O.textF}}>OFF</div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>

                    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:10}}>
                      {[
                        {l:"Typical Pattern",v:"Tue/Wed/Fri 9-5"},
                        {l:"Monthly Hours",v:e.moHrs+"h"},
                        {l:"Overtime Count",v:e.ot+" this month"},
                      ].map(item=>(
                        <div key={item.l} style={{background:O.bg3,borderRadius:8,padding:"12px"}}>
                          <div style={{fontFamily:O.mono,fontSize:7,color:O.textF,
                            letterSpacing:2,marginBottom:5,textTransform:"uppercase"}}>{item.l}</div>
                          <div style={{fontFamily:O.sans,fontWeight:700,fontSize:14,color:O.text}}>
                            {item.v}
                          </div>
                        </div>
                      ))}
                    </div>
                  </Card>

                </div>
              );
            })()}

            {!selEmp && (
              <div style={{fontFamily:O.mono,fontSize:11,color:O.textF,
                textAlign:"center",padding:"60px 0",letterSpacing:1}}>
                ← Select an employee above to load their intelligence dossier
              </div>
            )}
          </div>
        )}


                {/* ── PATTERNS (Prompt 8) ── */}
        {tab==="patterns" && (
          <div style={{animation:"fadeUp 0.3s ease"}}>
            {(() => {
              // ── COMPUTED DATA ──
              const avgRel  = Math.round(EMPS.reduce((s,e)=>s+e.rel,0)/EMPS.length);
              const avgCam  = Math.round(EMPS.reduce((s,e)=>s+e.cam,0)/EMPS.length);
              const avgProd = Math.round(EMPS.reduce((s,e)=>s+e.prod,0)/EMPS.length);
              const totalHours = EMPS.reduce((s,e)=>s+e.wkHrs,0);
              const totalFlags = EMPS.reduce((s,e)=>s+e.flags,0);
              const trendingDown = EMPS.filter(e=>e.risk==="High"||e.risk==="Medium").length;
              const trendingUp   = EMPS.filter(e=>e.risk==="Low"&&e.streak>7).length;
              const critPatterns = BFLAGS.filter(f=>f.sev==="critical").length;
              const teamHealth = Math.min(100,Math.round(
                (avgRel*0.3)+(avgCam*0.25)+
                ((100-(totalGhost/Math.max(totalHours,1)*100))*0.25)+
                ((100-(totalFlags/EMPS.length*20))*0.2)
              ));
              const healthColor = teamHealth>=80?O.green:teamHealth>=60?O.amber:O.red;
              const purple = "#a855f7";
              const purpleD = "rgba(168,85,247,0.08)";
              const purpleB = "rgba(168,85,247,0.25)";

              const getQuadrant = (e) => {
                const hr = e.ghost>2||e.cam<75;
                const hrel = e.rel>=80;
                if(hr&&!hrel) return "critical";
                if(!hr&&!hrel) return "watch";
                if(hr&&hrel)  return "monitor";
                return "star";
              };

              const DAYS = ["Mon","Tue","Wed","Thu","Fri","Sat","Sun"];
              const dayPatterns = DAYS.map((day,i)=>({
                day,
                incidents: BFLAGS.filter((_,fi)=>fi%7===i).length,
                ghostRisk: i===0||i===4?"high":i===2||i===3?"low":"normal",
                score: [68,88,92,90,74,60,0][i],
              }));

              // Day × employee heat map scores (synthesized from emp data)
              const heatScore = (e,dayIdx) => {
                const base = e.rel;
                const mod = [dayIdx===0?-15:dayIdx===4?-8:dayIdx>=5?-30:0][0]||0;
                const empMod = e.risk==="High"?-12:e.risk==="Medium"?-5:5;
                return Math.max(0,Math.min(100, base+mod+empMod+((e.id*dayIdx)%10)-5));
              };

              const correlations = [
                {title:"Ghost Hours ↔ Camera Presence",r:0.84,strength:"STRONG",
                 dir:"negative",
                 desc:"When camera presence drops below 80%, ghost hours are 3.2× more likely in the same shift.",
                 detail:"5 occurrences in last 30 days. Pattern consistent across locations.",
                 action:"Enforce camera check-in requirement",
                 empIds:EMPS.filter(e=>e.ghost>1).map(e=>e.id)},
                {title:"Reliability Score ↔ Streak Length",r:0.79,strength:"STRONG",
                 dir:"positive",
                 desc:"Employees with streaks over 10 days show 23% higher reliability scores on average.",
                 detail:"Streak momentum is real — breaking a streak correlates with a 3-day reliability dip.",
                 action:"Protect and celebrate attendance streaks",
                 empIds:EMPS.filter(e=>e.streak>5).map(e=>e.id)},
                {title:"Monday Shifts ↔ Late Arrivals",r:0.61,strength:"MODERATE",
                 dir:"positive",
                 desc:"Monday shifts produce 40% more late arrival incidents than any other day.",
                 detail:"Pattern strongest for staff working Saturday + Sunday prior.",
                 action:"Consider staggered Monday start times",
                 empIds:EMPS.filter(e=>e.risk!=="Low").map(e=>e.id)},
                {title:"Register Voids ↔ End-of-Shift Timing",r:0.57,strength:"MODERATE",
                 dir:"positive",
                 desc:"73% of register voids occur in the final 90 minutes of a shift.",
                 detail:"End-of-shift rush or intentional manipulation — warrants review.",
                 action:"Implement manager sign-off on late-shift voids",
                 empIds:[EMPS[1]?.id,EMPS[2]?.id].filter(Boolean)},
                {title:"Productivity ↔ Consistent Zone Assignment",r:0.72,strength:"STRONG",
                 dir:"positive",
                 desc:"Employees in consistent zone assignments score 18% higher on productivity.",
                 detail:"Zone-switching mid-shift correlates with a measurable output drop.",
                 action:"Minimize zone reassignments during shifts",
                 empIds:EMPS.filter(e=>e.prod>80).map(e=>e.id)},
              ];

              const rStrengthColor = (r) => r>=0.7?O.green:r>=0.5?O.amber:"#666";

              const SL = ({text,color}) => (
                <div style={{fontFamily:O.mono,fontSize:7,
                  color:color||O.textF,letterSpacing:"2.5px",
                  textTransform:"uppercase",marginBottom:10}}>{text}</div>
              );
              const Card = ({children,style={}}) => (
                <div style={{background:O.bg2,border:"1px solid "+O.border,
                  borderRadius:12,padding:"16px 18px",...style}}>
                  {children}
                </div>
              );

              // Radar chart SVG (pure SVG, 6 axes)
              const radarDims = [
                {l:"Reliability",   cur:avgRel,        prev:avgRel-4},
                {l:"Productivity",  cur:avgProd,       prev:avgProd-2},
                {l:"Cam Presence",  cur:avgCam,        prev:avgCam+3},
                {l:"Payroll Acc.",  cur:Math.round((1-(totalGhost/Math.max(totalHours,1)))*100), prev:91},
                {l:"Time Comply",   cur:82,            prev:79},
                {l:"Sched Adhere",  cur:88,            prev:85},
              ];
              const N = radarDims.length;
              const cx = 140, cy = 140, R = 100;
              const angle = (i) => (Math.PI*2*i/N) - Math.PI/2;
              const pt = (val,i) => {
                const r = (val/100)*R;
                return [cx+r*Math.cos(angle(i)), cy+r*Math.sin(angle(i))];
              };
              const curPts = radarDims.map((d,i)=>pt(d.cur,i));
              const prevPts = radarDims.map((d,i)=>pt(d.prev,i));
              const toPath = (pts) => pts.map((p,i)=>(i===0?"M":"L")+p[0].toFixed(1)+","+p[1].toFixed(1)).join(" ")+"Z";

              return (
                <div>

                  {/* ── ZONE 1: ENGINE HEADER ── */}
                  <Card style={{marginBottom:12,background:"rgba(9,14,26,0.98)",
                    border:"1px solid "+purpleB,
                    boxShadow:"0 0 30px rgba(168,85,247,0.06)"}}>
                    <div style={{display:"flex",gap:20,alignItems:"flex-start",flexWrap:"wrap"}}>

                      {/* Health score gauge */}
                      <div style={{textAlign:"center",flexShrink:0}}>
                        <div style={{position:"relative",width:88,height:88,margin:"0 auto 8px"}}>
                          <svg width="88" height="88" viewBox="0 0 88 88">
                            <circle cx="44" cy="44" r="36" fill="none"
                              stroke="rgba(255,255,255,0.06)" strokeWidth="7"/>
                            <circle cx="44" cy="44" r="36" fill="none"
                              stroke={healthColor} strokeWidth="7"
                              strokeDasharray={2*Math.PI*36}
                              strokeDashoffset={2*Math.PI*36*(1-teamHealth/100)}
                              strokeLinecap="round"
                              transform="rotate(-90 44 44)"/>
                          </svg>
                          <div style={{position:"absolute",inset:0,display:"flex",
                            flexDirection:"column",alignItems:"center",justifyContent:"center"}}>
                            <div style={{fontFamily:O.sans,fontWeight:900,fontSize:24,
                              color:healthColor,lineHeight:1}}>{teamHealth}</div>
                            <div style={{fontFamily:O.mono,fontSize:6,color:O.textF,
                              letterSpacing:1,marginTop:2}}>HEALTH</div>
                          </div>
                        </div>
                        <div style={{fontFamily:O.mono,fontSize:8,color:healthColor,letterSpacing:1}}>
                          {teamHealth>=80?"STRONG":teamHealth>=60?"MODERATE":"AT RISK"}
                        </div>
                      </div>

                      <div style={{flex:1,minWidth:200}}>
                        <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:6}}>
                          <div style={{fontFamily:O.mono,fontSize:7,color:purple,letterSpacing:"2px"}}>
                            BEHAVIORAL PATTERN DETECTION ENGINE — AI v2.4
                          </div>
                          <div style={{display:"flex",alignItems:"center",gap:5,
                            background:purpleD,border:"1px solid "+purpleB,
                            borderRadius:4,padding:"2px 8px"}}>
                            <div style={{width:5,height:5,borderRadius:"50%",background:purple,
                              animation:"blink 1.2s infinite"}}/>
                            <span style={{fontFamily:O.mono,fontSize:7,color:purple,letterSpacing:1}}>LIVE</span>
                          </div>
                        </div>
                        <div style={{fontFamily:O.sans,fontSize:13,color:"#fff",marginBottom:6,lineHeight:1.5}}>
                          {critPatterns>0
                            ? critPatterns+" critical pattern"+(critPatterns>1?"s":"")+" detected. "+trendingDown+" employee"+(trendingDown>1?"s":"")+" trending negative. Immediate review recommended."
                            : BFLAGS.length+" active patterns detected. "+trendingDown+" employee"+(trendingDown!==1?"s":"")+" trending negative. "+trendingUp+" improving."}
                        </div>
                        <div style={{fontFamily:O.mono,fontSize:8,color:O.textD}}>
                          Last deep scan: {now.toLocaleTimeString("en-US",{hour12:false})}
                          &nbsp;·&nbsp; Next: {new Date(now.getTime()+30*60000).toLocaleTimeString("en-US",{hour12:false})}
                        </div>
                      </div>

                      {/* Mini stats */}
                      <div style={{display:"flex",gap:8,flexShrink:0,flexWrap:"wrap"}}>
                        {[
                          {l:"Total Flags",v:totalFlags,c:O.amber},
                          {l:"Critical",v:critPatterns,c:O.red},
                          {l:"Trending Down",v:trendingDown,c:O.red},
                          {l:"Trending Up",v:trendingUp,c:O.green},
                        ].map(s=>(
                          <div key={s.l} style={{background:O.bg3,borderRadius:8,
                            padding:"10px 14px",textAlign:"center",minWidth:70}}>
                            <div style={{fontFamily:O.sans,fontWeight:800,
                              fontSize:20,color:s.c,lineHeight:1,marginBottom:3}}>{s.v}</div>
                            <div style={{fontFamily:O.mono,fontSize:7,
                              color:O.textF,letterSpacing:1,textTransform:"uppercase"}}>{s.l}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </Card>

                  {/* ── ZONES 2 + 3: RISK MATRIX + HEAT MAP ── */}
                  <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,marginBottom:12}}>

                    {/* ZONE 2: Risk Matrix */}
                    <Card>
                      <SL text="Risk Matrix — Employee Quadrant Analysis" color={purple}/>
                      <div style={{position:"relative",height:220,
                        border:"1px solid "+O.border,borderRadius:8,overflow:"hidden"}}>

                        {/* Quadrant backgrounds */}
                        <div style={{position:"absolute",inset:0,display:"grid",
                          gridTemplateColumns:"1fr 1fr",gridTemplateRows:"1fr 1fr"}}>
                          {[
                            {bg:"rgba(239,68,68,0.06)",label:"HIGH RISK",sub:"High ghost / Low cam",lc:O.red},
                            {bg:"rgba(245,158,11,0.04)",label:"WATCH LIST",sub:"Low rel / Monitor",lc:O.amber},
                            {bg:"rgba(59,130,246,0.04)",label:"STABLE",sub:"Average metrics",lc:"#3b82f6"},
                            {bg:"rgba(16,185,129,0.06)",label:"STAR",sub:"High rel / No flags",lc:O.green},
                          ].map((q,i)=>(
                            <div key={i} style={{background:q.bg,
                              borderRight:i%2===0?"1px solid "+O.border:"none",
                              borderBottom:i<2?"1px solid "+O.border:"none",
                              padding:"6px 8px",display:"flex",flexDirection:"column",
                              justifyContent:"flex-start"}}>
                              <div style={{fontFamily:O.mono,fontSize:7,color:q.lc,
                                letterSpacing:1,marginBottom:2}}>{q.label}</div>
                              <div style={{fontFamily:O.mono,fontSize:6,color:O.textF}}>{q.sub}</div>
                            </div>
                          ))}
                        </div>

                        {/* Employee dots */}
                        {EMPS.map(e=>{
                          const q = getQuadrant(e);
                          const qMap = {critical:[0,0],monitor:[0,1],watch:[1,0],star:[1,1]};
                          const [row,col] = qMap[q]||[1,1];
                          // Random-ish position within quadrant based on emp id
                          const x = col*50 + 10 + (e.id*13)%30;
                          const y = row*50 + 20 + (e.id*17)%30;
                          return(
                            <div key={e.id} title={e.name+" — "+q}
                              onClick={()=>{setSelEmp(e.id);setTab("intelligence");}}
                              style={{position:"absolute",
                                left:x+"%",top:y+"%",transform:"translate(-50%,-50%)",
                                width:32,height:32,borderRadius:8,
                                background:e.color+"28",
                                border:"2px solid "+(q==="critical"?O.red:q==="star"?O.green:q==="monitor"?O.amber:O.blue),
                                display:"flex",alignItems:"center",justifyContent:"center",
                                fontFamily:O.mono,fontSize:10,color:e.color,
                                cursor:"pointer",zIndex:2,fontWeight:600,
                                transition:"all 0.2s",boxShadow:"0 2px 8px rgba(0,0,0,0.3)"}}
                              onMouseEnter={ev=>ev.currentTarget.style.transform="translate(-50%,-50%) scale(1.3)"}
                              onMouseLeave={ev=>ev.currentTarget.style.transform="translate(-50%,-50%) scale(1)"}>
                              {e.avatar}
                            </div>
                          );
                        })}

                        {/* Axis labels */}
                        <div style={{position:"absolute",bottom:2,left:"50%",
                          transform:"translateX(-50%)",
                          fontFamily:O.mono,fontSize:6,color:O.textF,letterSpacing:1,
                          whiteSpace:"nowrap"}}>← RELIABILITY →</div>
                        <div style={{position:"absolute",left:2,top:"50%",
                          transform:"translateY(-50%) rotate(-90deg)",
                          fontFamily:O.mono,fontSize:6,color:O.textF,letterSpacing:1,
                          whiteSpace:"nowrap"}}>← RISK →</div>
                      </div>
                      <div style={{fontFamily:O.mono,fontSize:8,color:O.textD,
                        marginTop:8,lineHeight:1.5}}>
                        Click any employee to view full intelligence profile.
                      </div>
                    </Card>

                    {/* ZONE 3: Heat Map */}
                    <Card>
                      <SL text="Performance Heat Map — Employee × Day" color={purple}/>
                      <div style={{overflowX:"auto"}}>
                        <div style={{minWidth:340}}>
                          {/* Day headers */}
                          <div style={{display:"grid",
                            gridTemplateColumns:"80px repeat(7,1fr)",gap:2,marginBottom:2}}>
                            <div/>
                            {DAYS.map(d=>(
                              <div key={d} style={{fontFamily:O.mono,fontSize:7,
                                color:O.textF,textAlign:"center",letterSpacing:1}}>{d}</div>
                            ))}
                          </div>
                          {/* Employee rows */}
                          {EMPS.map(e=>(
                            <div key={e.id} style={{display:"grid",
                              gridTemplateColumns:"80px repeat(7,1fr)",gap:2,marginBottom:2}}>
                              <div style={{display:"flex",alignItems:"center",gap:5,paddingRight:4}}>
                                <Av emp={e} size={16} dark/>
                                <span style={{fontFamily:O.mono,fontSize:8,
                                  color:O.textD,overflow:"hidden",
                                  textOverflow:"ellipsis",whiteSpace:"nowrap"}}>
                                  {e.name.split(" ")[0]}
                                </span>
                              </div>
                              {DAYS.map((d,di)=>{
                                const s = heatScore(e,di);
                                const scheduled = di<5||(e.id%2===0&&di===5);
                                const bg = !scheduled
                                  ? "rgba(255,255,255,0.03)"
                                  : s>=85?"rgba(16,185,129,0.35)"
                                  : s>=70?"rgba(245,158,11,0.3)"
                                  : "rgba(239,68,68,0.3)";
                                const tc = !scheduled?O.textF:s>=85?O.green:s>=70?O.amber:O.red;
                                return(
                                  <div key={d} style={{background:bg,borderRadius:4,
                                    padding:"4px 0",textAlign:"center",
                                    border:"1px solid rgba(255,255,255,0.04)"}}>
                                    <div style={{fontFamily:O.mono,fontSize:7,color:tc,
                                      letterSpacing:0}}>
                                      {scheduled?s+"%":"—"}
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          ))}
                        </div>
                      </div>
                      {/* Legend */}
                      <div style={{display:"flex",gap:10,marginTop:8,flexWrap:"wrap"}}>
                        {[["85%+ Strong",O.green],["70-84% Monitor",O.amber],["<70% Risk",O.red],["Not scheduled",O.textF]].map(([l,c])=>(
                          <div key={l} style={{display:"flex",alignItems:"center",gap:4}}>
                            <div style={{width:8,height:8,borderRadius:2,background:c+"60",border:"1px solid "+c+"40"}}/>
                            <span style={{fontFamily:O.mono,fontSize:7,color:O.textD}}>{l}</span>
                          </div>
                        ))}
                      </div>
                      <div style={{fontFamily:O.sans,fontSize:11,color:O.textD,
                        marginTop:10,background:O.bg3,borderRadius:7,padding:"9px 11px",
                        borderLeft:"3px solid "+purple,lineHeight:1.6}}>
                        {DAYS[dayPatterns.reduce((mi,d,i,arr)=>d.score<arr[mi].score?i:mi,0).valueOf()]} is your highest-risk day.{" "}
                        {EMPS.filter(e=>e.risk!=="Low").slice(0,2).map(e=>e.name.split(" ")[0]).join(" and ")} show consistent underperformance early in the week. Consider staggered start times.
                      </div>
                    </Card>
                  </div>

                  {/* ── ZONE 4: AI-RANKED BEHAVIORAL FLAGS ── */}
                  <Card style={{marginBottom:12}}>
                    <SL text={"AI-Ranked Behavioral Flags — "+BFLAGS.length+" Active Signals"} color={purple}/>
                    <div style={{display:"flex",flexDirection:"column",gap:10}}>
                      {[...BFLAGS].sort((a,b)=>a.sev==="critical"?-1:1).map((f,i)=>{
                        const e = byId(f.eId);
                        const c = f.sev==="critical"?O.red:O.amber;
                        const conf = f.sev==="critical"?87:72;
                        const wkData = f.sev==="critical"
                          ? ["Wk 1: 0.8h","Wk 2: 1.2h","Wk 3: 2.1h","Wk 4: "+e.ghost+"h ↑"]
                          : ["Wk 1: 1×","Wk 2: 1×","Wk 3: 2×","Wk 4: "+e.flags+"× ↑"];
                        const impact = f.sev==="critical"
                          ? "$"+(e.ghost*e.rate*4).toFixed(0)+" potential overpayment this month at current trajectory"
                          : "Performance gap widening — "+e.flags+" flag"+(e.flags!==1?"s":"")+" on record, reliability at "+e.rel+"%";
                        return(
                          <div key={i} style={{
                            background:f.sev==="critical"?"rgba(239,68,68,0.04)":"rgba(245,158,11,0.03)",
                            border:"1px solid "+c+"25",borderLeft:"3px solid "+c,
                            borderRadius:10,padding:"14px 16px"}}>

                            {/* Header */}
                            <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:10,flexWrap:"wrap"}}>
                              <div style={{fontFamily:O.mono,fontSize:10,color:O.textF,
                                width:20,textAlign:"center",flexShrink:0}}>#{i+1}</div>
                              <Av emp={e} size={30} dark/>
                              <div style={{flex:1,minWidth:120}}>
                                <div style={{fontFamily:O.sans,fontWeight:700,
                                  fontSize:14,color:"#fff"}}>{e.name}</div>
                                <div style={{fontFamily:O.mono,fontSize:8,color:O.textD}}>{e.role}</div>
                              </div>
                              <OBadge label={f.signal} color={c} sm/>
                              <OBadge label={f.sev.toUpperCase()} color={c}/>
                              <div style={{fontFamily:O.mono,fontSize:11,
                                color:f.trend.includes("worsening")?O.red:O.amber}}>
                                {f.trend.includes("worsening")?"↑ WORSENING":"→ STABLE"}
                              </div>
                            </div>

                            {/* Description */}
                            <div style={{fontFamily:O.sans,fontSize:12,color:O.textD,
                              marginBottom:10,lineHeight:1.5}}>{f.desc}</div>

                            {/* Evidence timeline */}
                            <div style={{display:"flex",gap:6,alignItems:"center",
                              marginBottom:8,flexWrap:"wrap"}}>
                              <span style={{fontFamily:O.mono,fontSize:7,color:O.textF,
                                letterSpacing:1,marginRight:4}}>EVIDENCE:</span>
                              {wkData.map((w,wi)=>(
                                <div key={wi} style={{fontFamily:O.mono,fontSize:8,
                                  color:wi===wkData.length-1?c:O.textD,
                                  background:wi===wkData.length-1?c+"15":"rgba(255,255,255,0.04)",
                                  borderRadius:4,padding:"2px 7px",
                                  border:"1px solid "+(wi===wkData.length-1?c+"30":O.border)}}>
                                  {w}
                                </div>
                              ))}
                            </div>

                            {/* Impact + confidence */}
                            <div style={{display:"flex",alignItems:"center",
                              justifyContent:"space-between",flexWrap:"wrap",gap:8}}>
                              <div style={{fontFamily:O.mono,fontSize:9,color:O.textD,
                                background:O.bg3,borderRadius:6,padding:"5px 10px",flex:1}}>
                                💰 {impact}
                              </div>
                              <div style={{fontFamily:O.mono,fontSize:8,
                                color:purple,background:purpleD,
                                border:"1px solid "+purpleB,borderRadius:4,
                                padding:"4px 10px",whiteSpace:"nowrap"}}>
                                {conf}% confidence
                              </div>
                            </div>

                            {/* Actions */}
                            <div style={{display:"flex",gap:8,marginTop:10}}>
                              <button style={{fontFamily:O.mono,fontSize:8,letterSpacing:1,
                                padding:"5px 14px",background:"rgba(168,85,247,0.1)",
                                border:"1px solid rgba(168,85,247,0.3)",borderRadius:5,
                                color:purple,cursor:"pointer"}}>
                                📋 Add to Watch List
                              </button>
                              <button style={{fontFamily:O.mono,fontSize:8,letterSpacing:1,
                                padding:"5px 14px",background:"rgba(0,212,255,0.08)",
                                border:"1px solid rgba(0,212,255,0.2)",borderRadius:5,
                                color:"#00d4ff",cursor:"pointer"}}>
                                📧 Schedule 1:1
                              </button>
                              <button onClick={()=>{setSelEmp(e.id);setTab("intelligence");}}
                                style={{fontFamily:O.mono,fontSize:8,letterSpacing:1,
                                  padding:"5px 14px",background:c+"10",
                                  border:"1px solid "+c+"30",borderRadius:5,
                                  color:c,cursor:"pointer",marginLeft:"auto"}}>
                                VIEW PROFILE →
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </Card>

                  {/* ── ZONES 5 + 6: TIME PATTERNS + CORRELATIONS ── */}
                  <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,marginBottom:12}}>

                    {/* ZONE 5: Time Pattern Analysis */}
                    <Card>
                      <SL text="Time Pattern Analysis — When Does Business Bleed?" color={O.red}/>

                      {/* Day of week bar chart */}
                      <div style={{fontFamily:O.mono,fontSize:7,color:O.textF,
                        letterSpacing:1,marginBottom:6}}>INCIDENT FREQUENCY BY DAY</div>
                      <div style={{display:"flex",alignItems:"flex-end",gap:5,height:60,marginBottom:4}}>
                        {dayPatterns.map((dp,i)=>{
                          const h = Math.max(8, dp.score>0?(100-dp.score)*1.2:0);
                          const c = dp.ghostRisk==="high"?O.red:dp.score<75?O.amber:O.green;
                          return(
                            <div key={dp.day} style={{flex:1,display:"flex",
                              flexDirection:"column",alignItems:"center",gap:3}}>
                              <div style={{width:"100%",height:h+"%",minHeight:4,
                                background:c+"50",border:"1px solid "+c+"40",
                                borderRadius:"3px 3px 0 0",position:"relative"}}
                                title={dp.day+": "+dp.incidents+" incidents · "+dp.score+"% avg score"}>
                                {dp.incidents>0&&(
                                  <div style={{position:"absolute",top:-14,width:"100%",
                                    textAlign:"center",fontFamily:O.mono,fontSize:7,color:c}}>
                                    {dp.incidents}
                                  </div>
                                )}
                              </div>
                              <span style={{fontFamily:O.mono,fontSize:7,
                                color:dp.ghostRisk==="high"?O.red:O.textF}}>{dp.day}</span>
                            </div>
                          );
                        })}
                      </div>

                      {/* Hour blocks */}
                      <div style={{fontFamily:O.mono,fontSize:7,color:O.textF,
                        letterSpacing:1,marginBottom:6,marginTop:12}}>HOUR BLOCK BREAKDOWN</div>
                      <div style={{display:"flex",flexDirection:"column",gap:5}}>
                        {[
                          {l:"Morning",h:"6am–12pm",inc:2,ghost:"1.2h",cam:"94%",risk:"low"},
                          {l:"Midday", h:"12pm–3pm",inc:1,ghost:"0.4h",cam:"96%",risk:"low"},
                          {l:"Afternoon",h:"3pm–6pm",inc:4,ghost:"3.8h",cam:"81%",risk:"high"},
                          {l:"Evening",h:"6pm–10pm",inc:2,ghost:"8.5h",cam:"72%",risk:"high"},
                        ].map(b=>{
                          const c=b.risk==="high"?O.red:b.risk==="medium"?O.amber:O.green;
                          return(
                            <div key={b.l} style={{display:"grid",
                              gridTemplateColumns:"80px 1fr 50px 50px 40px",gap:6,
                              alignItems:"center",padding:"6px 8px",
                              background:b.risk==="high"?"rgba(239,68,68,0.05)":O.bg3,
                              borderRadius:6,border:"1px solid "+(b.risk==="high"?"rgba(239,68,68,0.15)":O.border)}}>
                              <div>
                                <div style={{fontFamily:O.sans,fontWeight:600,fontSize:11,color:"#fff"}}>{b.l}</div>
                                <div style={{fontFamily:O.mono,fontSize:7,color:O.textF}}>{b.h}</div>
                              </div>
                              <div style={{height:4,background:"rgba(255,255,255,0.06)",borderRadius:2}}>
                                <div style={{height:"100%",width:(b.inc/5*100)+"%",background:c,borderRadius:2}}/>
                              </div>
                              <div style={{fontFamily:O.mono,fontSize:8,color:c,textAlign:"center"}}>{b.ghost}</div>
                              <div style={{fontFamily:O.mono,fontSize:8,color:O.textD,textAlign:"center"}}>{b.cam}</div>
                              <OBadge label={b.risk.toUpperCase()} color={c} sm/>
                            </div>
                          );
                        })}
                      </div>

                      {/* Key insights */}
                      <div style={{marginTop:12,display:"flex",flexDirection:"column",gap:5}}>
                        {[
                          {icon:"🔴",text:"Monday mornings: 3× higher ghost hours than average"},
                          {icon:"🟡",text:"Friday afternoons: productivity drops 18% after 3pm"},
                          {icon:"🟢",text:"Tuesday / Wednesday: your highest reliability window"},
                        ].map((ins,i)=>(
                          <div key={i} style={{fontFamily:O.sans,fontSize:11,
                            color:O.textD,display:"flex",gap:6,
                            background:O.bg3,borderRadius:6,padding:"7px 9px",
                            lineHeight:1.4}}>
                            <span>{ins.icon}</span><span>{ins.text}</span>
                          </div>
                        ))}
                      </div>
                    </Card>

                    {/* ZONE 6: Correlation Detector */}
                    <Card>
                      <SL text="Correlation Detector — AI Pattern Engine" color={purple}/>
                      <div style={{display:"flex",flexDirection:"column",gap:8}}>
                        {correlations.map((cor,i)=>{
                          const sc = rStrengthColor(cor.r);
                          return(
                            <div key={i} style={{background:O.bg3,
                              border:"1px solid "+O.border,borderRadius:8,padding:"11px 12px",
                              transition:"border-color 0.15s",cursor:"default"}}
                              onMouseEnter={e=>e.currentTarget.style.borderColor=sc+"50"}
                              onMouseLeave={e=>e.currentTarget.style.borderColor=O.border}>

                              <div style={{display:"flex",alignItems:"center",
                                justifyContent:"space-between",marginBottom:6,gap:8,flexWrap:"wrap"}}>
                                <div style={{fontFamily:O.sans,fontWeight:600,
                                  fontSize:12,color:"#fff",flex:1}}>{cor.title}</div>
                                <div style={{display:"flex",gap:5,alignItems:"center",flexShrink:0}}>
                                  <div style={{fontFamily:O.mono,fontSize:7,color:sc,
                                    background:sc+"15",border:"1px solid "+sc+"30",
                                    borderRadius:3,padding:"2px 6px",letterSpacing:1,whiteSpace:"nowrap"}}>
                                    {cor.strength} (r={cor.r})
                                  </div>
                                  <div style={{fontFamily:O.mono,fontSize:8,
                                    color:cor.dir==="positive"?O.green:O.red}}>
                                    {cor.dir==="positive"?"↑ POS":"↓ NEG"}
                                  </div>
                                </div>
                              </div>

                              <div style={{fontFamily:O.mono,fontSize:9,color:O.textD,
                                marginBottom:5,lineHeight:1.6}}>{cor.desc}</div>
                              <div style={{fontFamily:O.mono,fontSize:8,color:O.textF,
                                marginBottom:7,lineHeight:1.5}}>{cor.detail}</div>

                              <div style={{display:"flex",alignItems:"center",
                                justifyContent:"space-between",gap:8}}>
                                <div style={{display:"flex",gap:3}}>
                                  {cor.empIds.slice(0,3).map(id=>{
                                    const emp = byId(id);
                                    return emp ? <Av key={id} emp={emp} size={18} dark/> : null;
                                  })}
                                </div>
                                <div style={{fontFamily:O.mono,fontSize:8,color:purple,
                                  background:purpleD,border:"1px solid "+purpleB,
                                  borderRadius:4,padding:"3px 8px",whiteSpace:"nowrap"}}>
                                  {cor.action}
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </Card>
                  </div>

                  {/* ── ZONE 7: TEAM PERFORMANCE RADAR ── */}
                  <Card>
                    <SL text="Team Performance Radar — This Month vs Last Month" color={purple}/>
                    <div style={{display:"flex",gap:20,alignItems:"flex-start",flexWrap:"wrap"}}>

                      {/* SVG Radar */}
                      <div style={{flexShrink:0}}>
                        <svg width="280" height="280" viewBox="0 0 280 280">
                          {/* Grid rings */}
                          {[0.25,0.5,0.75,1].map((r,ri)=>(
                            <polygon key={ri} points={
                              Array.from({length:N},(_,i)=>{
                                const a=angle(i);
                                return (cx+R*r*Math.cos(a)).toFixed(1)+","+(cy+R*r*Math.sin(a)).toFixed(1);
                              }).join(" ")
                            } fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="1"/>
                          ))}
                          {/* Axis lines + labels */}
                          {radarDims.map((d,i)=>{
                            const [px,py]=pt(110,i);
                            const [lx,ly]=pt(125,i);
                            return(
                              <g key={i}>
                                <line x1={cx} y1={cy} x2={px} y2={py}
                                  stroke="rgba(255,255,255,0.1)" strokeWidth="1"/>
                                <text x={lx} y={ly}
                                  fontFamily="'JetBrains Mono',monospace"
                                  fontSize="8" fill="rgba(226,232,240,0.45)"
                                  textAnchor="middle" dominantBaseline="middle">
                                  {d.l}
                                </text>
                              </g>
                            );
                          })}
                          {/* Last month shape */}
                          <path d={toPath(prevPts)}
                            fill="rgba(255,255,255,0.04)"
                            stroke="rgba(255,255,255,0.25)"
                            strokeWidth="1.5"
                            strokeDasharray="4 3"/>
                          {/* This month shape */}
                          <path d={toPath(curPts)}
                            fill="rgba(245,158,11,0.12)"
                            stroke={O.amber}
                            strokeWidth="2"/>
                          {/* Data points */}
                          {curPts.map(([px,py],i)=>(
                            <circle key={i} cx={px} cy={py} r="3.5"
                              fill={O.amber} stroke={O.bg2} strokeWidth="1.5"/>
                          ))}
                        </svg>
                      </div>

                      <div style={{flex:1,minWidth:200}}>
                        {/* Legend */}
                        <div style={{display:"flex",gap:12,marginBottom:14}}>
                          <div style={{display:"flex",alignItems:"center",gap:5}}>
                            <div style={{width:16,height:3,background:O.amber,borderRadius:2}}/>
                            <span style={{fontFamily:O.mono,fontSize:8,color:O.textD}}>This month</span>
                          </div>
                          <div style={{display:"flex",alignItems:"center",gap:5}}>
                            <div style={{width:16,height:2,background:"rgba(255,255,255,0.3)",
                              borderRadius:2,borderTop:"1px dashed rgba(255,255,255,0.3)"}}/>
                            <span style={{fontFamily:O.mono,fontSize:8,color:O.textD}}>Last month</span>
                          </div>
                        </div>

                        {/* Month-over-month per dimension */}
                        <div style={{display:"flex",flexDirection:"column",gap:7}}>
                          {radarDims.map(d=>{
                            const diff = d.cur-d.prev;
                            const c = diff>0?O.green:diff<0?O.red:O.textD;
                            return(
                              <div key={d.l} style={{display:"flex",
                                justifyContent:"space-between",alignItems:"center",
                                padding:"6px 9px",background:O.bg3,borderRadius:6}}>
                                <span style={{fontFamily:O.mono,fontSize:9,color:O.textD,flex:1}}>{d.l}</span>
                                <div style={{display:"flex",alignItems:"center",gap:8}}>
                                  <div style={{width:80,height:4,
                                    background:"rgba(255,255,255,0.06)",borderRadius:2}}>
                                    <div style={{height:"100%",width:d.cur+"%",
                                      background:d.cur>=85?O.green:d.cur>=70?O.amber:O.red,
                                      borderRadius:2}}/>
                                  </div>
                                  <span style={{fontFamily:O.sans,fontWeight:700,
                                    fontSize:12,color:"#fff",width:32,textAlign:"right"}}>{d.cur}%</span>
                                  <span style={{fontFamily:O.mono,fontSize:9,color:c,width:30}}>
                                    {diff>0?"+":""}{diff}%
                                  </span>
                                </div>
                              </div>
                            );
                          })}
                        </div>

                        {/* Benchmark comparison */}
                        <div style={{marginTop:14,padding:"12px",
                          background:purpleD,border:"1px solid "+purpleB,
                          borderRadius:8}}>
                          <div style={{fontFamily:O.mono,fontSize:7,color:purple,
                            letterSpacing:2,marginBottom:7}}>INDUSTRY BENCHMARK</div>
                          <div style={{fontFamily:O.mono,fontSize:9,color:O.textD,
                            marginBottom:8,lineHeight:1.5}}>
                            Your team ranks in the{" "}
                            <span style={{color:purple,fontWeight:700}}>67th percentile</span>{" "}
                            for reliability vs all ShiftPro businesses.
                          </div>
                          <div style={{height:5,background:"rgba(255,255,255,0.08)",borderRadius:3}}>
                            <div style={{height:"100%",width:"67%",
                              background:"linear-gradient(90deg,"+purple+",rgba(168,85,247,0.6))",
                              borderRadius:3}}/>
                          </div>
                        </div>
                      </div>
                    </div>
                  </Card>

                </div>
              );
            })()}
          </div>
        )}


                {/* ── PAYROLL FRAUD (Prompt 9) ── */}
        {tab==="payroll" && (
          <div style={{animation:"fadeUp 0.3s ease"}}>
            {(() => {
              // ── COMPUTED DATA ──
              const fraudScore = (e) => Math.min(100, Math.round(
                (e.ghost*15)+(e.flags*10)+((100-e.cam)*0.4)+(e.risk==="High"?20:e.risk==="Medium"?10:0)
              ));
              const monthlyGhostCost = (e) => (e.ghost*4.3*e.rate).toFixed(0);
              const getStatus = (e) => {
                const s = fraudScore(e);
                if(s>=70) return "ESCALATE";
                if(s>=45) return "INVESTIGATE";
                if(s>=20) return "FLAG";
                return "CLEAN";
              };
              const statusColor = (st) =>
                st==="ESCALATE"?O.red:st==="INVESTIGATE"?"#f97316":st==="FLAG"?O.amber:O.green;

              const totalWkHrs = EMPS.reduce((s,e)=>s+e.wkHrs,0);
              const totalMonthGhost = parseFloat((totalGhost*4.3).toFixed(1));
              const totalMonthCost  = (totalMonthGhost*
                (EMPS.reduce((s,e)=>s+e.rate,0)/EMPS.length)).toFixed(0);
              const discrepCount = EMPS.filter(e=>e.ghost>0).length;
              const overThresh   = EMPS.filter(e=>fraudScore(e)>=45).length;
              const payAcc = Math.round((1-(totalGhost/Math.max(totalWkHrs,1)))*100);
              const headerBg = parseFloat(ghostCost)>200
                ?"rgba(239,68,68,0.08)":parseFloat(ghostCost)>50?"rgba(245,158,11,0.06)":O.bg2;
              const headerBorder = parseFloat(ghostCost)>200
                ?"rgba(239,68,68,0.35)":parseFloat(ghostCost)>50?"rgba(245,158,11,0.3)":O.border;

              const weeklyGhost = MONTHLY.map((m,i)=>({
                week:m.m,
                total:parseFloat((EMPS.reduce((s,e)=>s+e.ghost*(0.8+(i*0.05)),0)).toFixed(1)),
                cost: parseFloat((EMPS.reduce((s,e)=>s+e.ghost*e.rate*(0.8+(i*0.05)),0)).toFixed(0)),
                emps: EMPS.map(e=>({id:e.id,color:e.color,val:parseFloat((e.ghost*(0.8+(i*0.05))).toFixed(1))}))
              }));
              const maxGhost = Math.max(...weeklyGhost.map(w=>w.total),5);
              const trendUp = weeklyGhost[5]?.total > weeklyGhost[4]?.total;
              const ghostDiff = ((weeklyGhost[5]?.total||0)-(weeklyGhost[4]?.total||0)).toFixed(1);
              const costDiff  = ((weeklyGhost[5]?.cost||0)-(weeklyGhost[4]?.cost||0)).toFixed(0);

              const openCases = EMPS.filter(e=>fraudScore(e)>=45).map((e,i)=>({
                id:"CASE-2025-00"+(i+1),
                emp:e,
                type:e.ghost>3?"Ghost Hours":e.cam<75?"Camera Mismatch":"Register Correlation",
                opened:"Mar "+(15-i*4)+", 2025",
                updated:"Mar 28, 2025",
                evidence:""+( (e.ghost*4).toFixed(1))+"h unverified over 4 weeks. Camera gaps consistently 45–90 min after clock-in. Pattern suggests arriving late and clocking in remotely.",
                amount:(e.ghost*e.rate*4).toFixed(0),
                stage:i===0?2:1,
              }));
              const stages = ["FLAGGED","EVIDENCE","REVIEW","ESCALATED","RESOLVED"];

              const fraudTypes = [
                {icon:"👻",name:"Ghost Clocking",desc:"Clocked in but not present on camera",
                 instances:EMPS.filter(e=>e.ghost>1).length,
                 cost:EMPS.filter(e=>e.ghost>1).reduce((s,e)=>s+(e.ghost*e.rate),0).toFixed(0),
                 offender:EMPS.sort((a,b)=>b.ghost-a.ghost)[0]?.name.split(" ")[0],
                 sev:"critical",c:O.red},
                {icon:"🏃",name:"Early Clock-Out",desc:"Left before scheduled end time",
                 instances:2,cost:"38",offender:"Marcus",sev:"warning",c:"#f97316"},
                {icon:"👥",name:"Buddy Punching",desc:"Clock-in pattern before physical arrival",
                 instances:1,cost:"22",offender:"Carlos",sev:"warning",c:O.amber,conf:"71%"},
                {icon:"☕",name:"Break Padding",desc:"Break times exceeding policy by 10+ min",
                 instances:3,cost:"19",offender:"Priya",sev:"info",c:"#38bdf8"},
                {icon:"📅",name:"Schedule Gaming",desc:"Premium shifts requested, underperformance follows",
                 instances:1,cost:"44",offender:"Marcus",sev:"warning",c:"#a855f7"},
                {icon:"🗃️",name:"Register Correlation",desc:"Ghost hours align with register void windows",
                 instances:EMPS.filter(e=>e.ghost>0&&e.flags>0).length,
                 cost:EMPS.filter(e=>e.ghost>0&&e.flags>0).reduce((s,e)=>s+(e.ghost*e.rate),0).toFixed(0),
                 offender:"Priya",sev:"critical",c:O.red},
              ];

              const SL = ({text,color}) => (
                <div style={{fontFamily:O.mono,fontSize:7,color:color||O.textF,
                  letterSpacing:"2.5px",textTransform:"uppercase",marginBottom:10}}>{text}</div>
              );
              const Card = ({children,style={}}) => (
                <div style={{background:O.bg2,border:"1px solid "+O.border,
                  borderRadius:12,padding:"16px 18px",...style}}>
                  {children}
                </div>
              );

              return (
                <div>

                  {/* ── ZONE 1: FORENSIC AUDIT HEADER ── */}
                  <div style={{background:headerBg,border:"1px solid "+headerBorder,
                    borderRadius:12,padding:"18px 20px",marginBottom:12,
                    boxShadow:parseFloat(ghostCost)>200?"0 0 30px rgba(239,68,68,0.1)":"none"}}>
                    <div style={{display:"flex",gap:20,alignItems:"flex-start",flexWrap:"wrap",marginBottom:14}}>
                      <div style={{flex:1,minWidth:200}}>
                        <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:8}}>
                          <span style={{fontFamily:O.mono,fontSize:7,color:O.red,letterSpacing:"2px"}}>
                            ⚖️ PAYROLL INTEGRITY ENGINE — FORENSIC AUDIT
                          </span>
                        </div>
                        <div style={{fontFamily:O.sans,fontSize:13,color:O.textD,lineHeight:1.5}}>
                          {discrepCount} of {EMPS.length} employees have payroll discrepancies.{" "}
                          ${ghostCost} unverified this week. {overThresh} case{overThresh!==1?"s":""} exceed investigation threshold.
                        </div>
                      </div>
                      {/* Giant exposure number */}
                      <div style={{textAlign:"right",flexShrink:0}}>
                        <div style={{fontFamily:O.mono,fontSize:8,color:O.textF,
                          letterSpacing:"2px",marginBottom:4}}>TOTAL EXPOSURE THIS WEEK</div>
                        <div style={{fontFamily:O.sans,fontWeight:900,
                          fontSize:44,lineHeight:1,letterSpacing:"-2px",
                          color:parseFloat(ghostCost)>200?O.red:parseFloat(ghostCost)>50?"#f97316":O.green,
                          textShadow:parseFloat(ghostCost)>200?"0 0 20px rgba(239,68,68,0.5)":"none"}}>
                          ${ghostCost}
                        </div>
                        <div style={{fontFamily:O.mono,fontSize:9,
                          color:parseFloat(ghostCost)>200?O.red:O.textD,marginTop:3,letterSpacing:1}}>
                          AT RISK
                        </div>
                      </div>
                    </div>
                    {/* Six metric pills */}
                    <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
                      {[
                        {l:"Ghost Hours",v:totalGhost.toFixed(1)+"h",c:O.red},
                        {l:"Ghost Cost Wk",v:"$"+ghostCost,c:O.red},
                        {l:"Ghost Cost Mo",v:"$"+totalMonthCost,c:"#f97316"},
                        {l:"Discrepancies",v:discrepCount+"/"+EMPS.length,c:O.amber},
                        {l:"Payroll Accuracy",v:payAcc+"%",c:payAcc>=90?O.green:O.amber},
                        {l:"Cases Flagged",v:overThresh,c:overThresh>0?O.red:O.green},
                      ].map(p=>(
                        <div key={p.l} style={{background:p.c+"12",
                          border:"1px solid "+p.c+"35",borderRadius:8,
                          padding:"7px 12px",textAlign:"center"}}>
                          <div style={{fontFamily:O.sans,fontWeight:700,
                            fontSize:16,color:p.c,lineHeight:1,marginBottom:2}}>{p.v}</div>
                          <div style={{fontFamily:O.mono,fontSize:7,
                            color:O.textF,letterSpacing:1,textTransform:"uppercase"}}>{p.l}</div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* ── ZONES 2 + 3: LEADERBOARD + FORENSICS TABLE ── */}
                  <div style={{display:"grid",gridTemplateColumns:"1fr 1.6fr",gap:12,marginBottom:12}}>

                    {/* ZONE 2: Fraud Risk Leaderboard */}
                    <Card>
                      <SL text="Fraud Risk Leaderboard" color={O.red}/>
                      <div style={{display:"flex",flexDirection:"column",gap:7}}>
                        {[...EMPS].sort((a,b)=>fraudScore(b)-fraudScore(a)).map((e,i)=>{
                          const fs = fraudScore(e);
                          const st = getStatus(e);
                          const sc = statusColor(st);
                          const trend = e.ghost>1?"+"+e.ghost.toFixed(1)+"h":"-0.3h";
                          const isUp = e.ghost>1;
                          return(
                            <div key={e.id}
                              style={{padding:"10px 12px",background:O.bg3,
                                borderRadius:8,borderLeft:"3px solid "+sc,
                                border:"1px solid "+sc+"20",
                                borderLeftWidth:3,cursor:"pointer",transition:"all 0.15s"}}
                              onClick={()=>{setSelEmp(e.id);setTab("intelligence");}}
                              onMouseEnter={ev=>ev.currentTarget.style.background="rgba(255,255,255,0.04)"}
                              onMouseLeave={ev=>ev.currentTarget.style.background=O.bg3}>
                              <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:6}}>
                                <div style={{fontFamily:O.mono,fontSize:11,color:O.textF,
                                  width:18,flexShrink:0,textAlign:"center"}}>#{i+1}</div>
                                <Av emp={e} size={26} dark/>
                                <div style={{flex:1,minWidth:0}}>
                                  <div style={{fontFamily:O.sans,fontWeight:600,
                                    fontSize:12,color:"#fff",whiteSpace:"nowrap",
                                    overflow:"hidden",textOverflow:"ellipsis"}}>{e.name}</div>
                                  <div style={{fontFamily:O.mono,fontSize:8,color:O.textD}}>{e.role}</div>
                                </div>
                                <div style={{textAlign:"right",flexShrink:0}}>
                                  <div style={{fontFamily:O.sans,fontWeight:800,
                                    fontSize:18,color:sc,lineHeight:1}}>{fs}</div>
                                  <div style={{fontFamily:O.mono,fontSize:7,color:O.textF}}>RISK</div>
                                </div>
                              </div>
                              <div style={{display:"flex",alignItems:"center",
                                justifyContent:"space-between",gap:6}}>
                                <div style={{fontFamily:O.mono,fontSize:8,color:O.textD}}>
                                  {e.ghost}h ghost ·{" "}
                                  <span style={{color:O.red}}>${(e.ghost*e.rate).toFixed(0)}</span>
                                </div>
                                <div style={{display:"flex",alignItems:"center",gap:5}}>
                                  <span style={{fontFamily:O.mono,fontSize:8,
                                    color:isUp?O.red:O.green}}>
                                    {isUp?"↑":"↓"} {trend}
                                  </span>
                                  <span style={{fontFamily:O.mono,fontSize:7,color:sc,
                                    background:sc+"15",border:"1px solid "+sc+"30",
                                    borderRadius:3,padding:"1px 5px",letterSpacing:1}}>{st}</span>
                                </div>
                              </div>
                              {/* Fraud score bar */}
                              <div style={{marginTop:6,height:3,
                                background:"rgba(255,255,255,0.06)",borderRadius:2}}>
                                <div style={{height:"100%",width:fs+"%",
                                  background:sc,borderRadius:2,transition:"width 0.8s ease"}}/>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                      {/* Footer insight */}
                      <div style={{marginTop:10,fontFamily:O.mono,fontSize:8,
                        color:O.textD,background:O.bg3,borderRadius:7,
                        padding:"8px 10px",borderLeft:"3px solid "+O.red,lineHeight:1.5}}>
                        {EMPS.sort((a,b)=>b.ghost-a.ghost)[0]?.name.split(" ")[0]} accounts for{" "}
                        {Math.round((EMPS.sort((a,b)=>b.ghost-a.ghost)[0]?.ghost/Math.max(totalGhost,0.1))*100)}%
                        of all unverified labor costs this week.
                      </div>
                    </Card>

                    {/* ZONE 3: Ghost Hour Forensics Table */}
                    <Card>
                      <SL text="Ghost Hour Forensics — Full Audit" color={O.red}/>
                      <div style={{overflowX:"auto"}}>
                        <div style={{minWidth:560}}>
                          {/* Header */}
                          <div style={{display:"grid",
                            gridTemplateColumns:"120px 50px 52px 68px 52px 54px 60px 70px 24px",
                            gap:4,padding:"6px 8px",background:O.bg3,
                            borderRadius:"6px 6px 0 0",marginBottom:1}}>
                            {["EMPLOYEE","SCHED","LOGGED","CAM VERF","GHOST","COST","ACCURACY","STATUS",""].map(h=>(
                              <div key={h} style={{fontFamily:O.mono,fontSize:6,
                                color:O.textF,letterSpacing:1}}>{h}</div>
                            ))}
                          </div>
                          {/* Rows */}
                          {[...EMPS].sort((a,b)=>b.ghost-a.ghost).map((e,i)=>{
                            const acc = Math.round((1-(e.ghost/Math.max(e.wkHrs,1)))*100);
                            const st  = getStatus(e);
                            const sc  = statusColor(st);
                            const isExpanded = expandedRow===e.id;
                            return(
                              <div key={e.id}>
                                <div style={{display:"grid",
                                  gridTemplateColumns:"120px 50px 52px 68px 52px 54px 60px 70px 24px",
                                  gap:4,padding:"9px 8px",
                                  borderBottom:"1px solid "+O.border,
                                  background:e.ghost>3?"rgba(239,68,68,0.04)":i%2===0?"transparent":"rgba(255,255,255,0.01)",
                                  alignItems:"center"}}>
                                  <div style={{display:"flex",alignItems:"center",gap:6}}>
                                    <Av emp={e} size={20} dark/>
                                    <span style={{fontFamily:O.sans,fontWeight:600,
                                      fontSize:11,color:"#fff",whiteSpace:"nowrap",
                                      overflow:"hidden",textOverflow:"ellipsis"}}>
                                      {e.name.split(" ")[0]}
                                    </span>
                                  </div>
                                  <div style={{fontFamily:O.mono,fontSize:9,color:O.textD}}>{e.wkHrs}h</div>
                                  <div style={{fontFamily:O.mono,fontSize:9,color:O.text}}>{e.wkHrs}h</div>
                                  <div style={{fontFamily:O.mono,fontSize:9,color:O.green}}>
                                    {(e.wkHrs-e.ghost).toFixed(1)}h
                                  </div>
                                  <div style={{fontFamily:O.mono,fontSize:9,
                                    color:e.ghost>3?O.red:e.ghost>0?"#f97316":O.textD,
                                    fontWeight:e.ghost>0?600:400}}>
                                    {e.ghost>0?e.ghost+"h":"—"}
                                  </div>
                                  <div style={{fontFamily:O.mono,fontSize:9,
                                    color:e.ghost>0?O.red:O.textD}}>
                                    {e.ghost>0?"-$"+(e.ghost*e.rate).toFixed(0):"$0"}
                                  </div>
                                  <div>
                                    <div style={{fontFamily:O.mono,fontSize:8,
                                      color:acc>=95?O.green:acc>=85?O.amber:O.red,marginBottom:2}}>
                                      {acc}%
                                    </div>
                                    <div style={{height:3,background:"rgba(255,255,255,0.06)",borderRadius:2,width:48}}>
                                      <div style={{height:"100%",width:acc+"%",borderRadius:2,
                                        background:acc>=95?O.green:acc>=85?O.amber:O.red}}/>
                                    </div>
                                  </div>
                                  <div style={{fontFamily:O.mono,fontSize:7,color:sc,
                                    background:sc+"15",border:"1px solid "+sc+"30",
                                    borderRadius:3,padding:"2px 5px",
                                    letterSpacing:1,textAlign:"center"}}>{st}</div>
                                  <button onClick={()=>setExpandedRow(isExpanded?null:e.id)}
                                    style={{background:"none",border:"none",
                                      color:O.textF,cursor:"pointer",fontSize:10,
                                      transform:isExpanded?"rotate(180deg)":"none",
                                      transition:"transform 0.2s"}}>▾</button>
                                </div>
                                {/* Expanded detail */}
                                {isExpanded&&(
                                  <div style={{background:"rgba(239,68,68,0.03)",
                                    border:"1px solid rgba(239,68,68,0.12)",
                                    borderRadius:6,margin:"4px 0 4px 8px",padding:"10px 12px"}}>
                                    <div style={{fontFamily:O.mono,fontSize:7,color:O.red,
                                      letterSpacing:"2px",marginBottom:8}}>DAILY BREAKDOWN</div>
                                    <div style={{display:"flex",gap:6,marginBottom:8,flexWrap:"wrap"}}>
                                      {["Mon","Tue","Wed","Thu","Fri"].map((d,di)=>{
                                        const dGhost = di===2||di===3?e.ghost*0.4:di===0?e.ghost*0.35:0.1;
                                        const dc = dGhost>1?O.red:dGhost>0.3?"#f97316":O.green;
                                        return(
                                          <div key={d} style={{background:O.bg3,borderRadius:5,
                                            padding:"6px 8px",textAlign:"center",minWidth:50}}>
                                            <div style={{fontFamily:O.mono,fontSize:7,
                                              color:O.textF,marginBottom:3}}>{d}</div>
                                            <div style={{fontFamily:O.mono,fontSize:10,color:dc,fontWeight:600}}>
                                              {dGhost>0.3?dGhost.toFixed(1)+"h":"✓"}
                                            </div>
                                          </div>
                                        );
                                      })}
                                    </div>
                                    <div style={{fontFamily:O.mono,fontSize:8,color:O.textD,lineHeight:1.5}}>
                                      Largest discrepancy: Wed/Thu.
                                      Camera gaps: 09:12–10:03, 14:45–15:20.
                                      Pattern consistent for 3 consecutive weeks.
                                    </div>
                                  </div>
                                )}
                              </div>
                            );
                          })}
                          {/* Totals row */}
                          <div style={{display:"grid",
                            gridTemplateColumns:"120px 50px 52px 68px 52px 54px 60px 70px 24px",
                            gap:4,padding:"9px 8px",
                            background:payAcc<80?"rgba(239,68,68,0.08)":payAcc<90?"rgba(245,158,11,0.06)":O.bg3,
                            borderTop:"1px solid "+( payAcc<80?"rgba(239,68,68,0.3)":"rgba(245,158,11,0.25)"),
                            borderRadius:"0 0 6px 6px",alignItems:"center"}}>
                            <div style={{fontFamily:O.mono,fontSize:8,color:O.amber,letterSpacing:1}}>TOTALS</div>
                            <div style={{fontFamily:O.mono,fontSize:9,color:O.amber}}>{totalWkHrs}h</div>
                            <div style={{fontFamily:O.mono,fontSize:9,color:O.amber}}>{totalWkHrs}h</div>
                            <div style={{fontFamily:O.mono,fontSize:9,color:O.green}}>
                              {(totalWkHrs-totalGhost).toFixed(1)}h
                            </div>
                            <div style={{fontFamily:O.mono,fontSize:9,color:O.red,fontWeight:700}}>
                              {totalGhost.toFixed(1)}h
                            </div>
                            <div style={{fontFamily:O.mono,fontSize:9,color:O.red,fontWeight:700}}>
                              -${ghostCost}
                            </div>
                            <div style={{fontFamily:O.mono,fontSize:9,
                              color:payAcc>=90?O.green:O.red,fontWeight:700}}>{payAcc}%</div>
                            <div/>
                            <div/>
                          </div>
                        </div>
                      </div>
                    </Card>
                  </div>

                  {/* ── ZONE 4: WEEKLY TREND CHART ── */}
                  <Card style={{marginBottom:12}}>
                    <div style={{display:"flex",alignItems:"center",
                      justifyContent:"space-between",marginBottom:12,flexWrap:"wrap",gap:8}}>
                      <SL text="Ghost Hour Trend — 6 Weeks" color={O.red}/>
                      <div style={{display:"flex",gap:6}}>
                        {["THIS WEEK","THIS MONTH","3 MONTHS"].map(t=>(
                          <button key={t} style={{fontFamily:O.mono,fontSize:7,letterSpacing:1,
                            padding:"3px 8px",borderRadius:3,border:"none",cursor:"pointer",
                            background:t==="THIS WEEK"?"rgba(239,68,68,0.15)":"rgba(255,255,255,0.04)",
                            color:t==="THIS WEEK"?O.red:O.textF}}>
                            {t}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div style={{position:"relative",height:80}}>
                      {/* Threshold line */}
                      <div style={{position:"absolute",left:0,right:0,
                        top:(1-(3/maxGhost))*100+"%",
                        borderTop:"1px dashed rgba(239,68,68,0.4)",
                        pointerEvents:"none",zIndex:2}}>
                        <span style={{fontFamily:O.mono,fontSize:7,color:O.red,
                          position:"absolute",right:0,top:-10,letterSpacing:1}}>3h threshold</span>
                      </div>
                      {/* Stacked bars */}
                      <div style={{display:"flex",alignItems:"flex-end",gap:8,height:"100%"}}>
                        {weeklyGhost.map((w,wi)=>{
                          const totalH = Math.round((w.total/maxGhost)*100);
                          let bottom = 0;
                          return(
                            <div key={wi} style={{flex:1,display:"flex",
                              flexDirection:"column",alignItems:"center",gap:3,height:"100%",
                              justifyContent:"flex-end"}}>
                              <div style={{width:"100%",height:totalH+"%",minHeight:3,
                                display:"flex",flexDirection:"column-reverse",
                                borderRadius:"3px 3px 0 0",overflow:"hidden",
                                border:wi===5?"1px solid rgba(239,68,68,0.5)":"none"}}>
                                {w.emps.filter(ep=>ep.val>0).map(ep=>{
                                  const empData = byId(ep.id);
                                  if(!empData) return null;
                                  const pct = w.total>0?Math.round((ep.val/w.total)*100):0;
                                  return(
                                    <div key={ep.id}
                                      title={empData.name+": "+ep.val+"h"}
                                      style={{width:"100%",height:pct+"%",
                                        minHeight:pct>0?2:0,
                                        background:empData.color+"90",flexShrink:0}}/>
                                  );
                                })}
                              </div>
                              <span style={{fontFamily:O.mono,fontSize:7,
                                color:wi===5?O.red:O.textF}}>{w.week}</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                    {/* Legend + trend */}
                    <div style={{display:"flex",alignItems:"center",
                      justifyContent:"space-between",marginTop:10,flexWrap:"wrap",gap:8}}>
                      <div style={{display:"flex",gap:10,flexWrap:"wrap"}}>
                        {EMPS.map(e=>(
                          <div key={e.id} style={{display:"flex",alignItems:"center",gap:4}}>
                            <div style={{width:8,height:8,borderRadius:2,background:e.color+"90"}}/>
                            <span style={{fontFamily:O.mono,fontSize:7,color:O.textD}}>
                              {e.name.split(" ")[0]}
                            </span>
                          </div>
                        ))}
                      </div>
                      <div style={{fontFamily:O.mono,fontSize:9,
                        color:trendUp?O.red:O.green,
                        background:(trendUp?O.red:O.green)+"12",
                        border:"1px solid "+(trendUp?O.red:O.green)+"30",
                        borderRadius:6,padding:"5px 10px"}}>
                        {trendUp?"↑":"↓"} Ghost hours {trendUp?"increased":"decreased"}{" "}
                        {Math.abs(parseFloat(ghostDiff)).toFixed(1)}h vs last week
                        {trendUp?" (+$"+costDiff+")":"(-$"+Math.abs(parseFloat(costDiff))+")"}
                        {trendUp?" — Worst week in 6 weeks":" — Improving trend"}
                      </div>
                    </div>
                  </Card>

                  {/* ── ZONES 5 + 6: FRAUD TYPOLOGY + ACCURACY ── */}
                  <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,marginBottom:12}}>

                    {/* ZONE 5: Fraud Typology */}
                    <Card>
                      <SL text="Fraud Typology — Pattern Classification" color={O.red}/>
                      <div style={{display:"flex",flexDirection:"column",gap:8}}>
                        {fraudTypes.map((ft,i)=>(
                          <div key={i} style={{padding:"10px 12px",background:O.bg3,
                            borderRadius:8,border:"1px solid "+ft.c+"20",
                            borderLeft:"3px solid "+ft.c,transition:"all 0.15s"}}
                            onMouseEnter={e=>e.currentTarget.style.background="rgba(255,255,255,0.04)"}
                            onMouseLeave={e=>e.currentTarget.style.background=O.bg3}>
                            <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:5}}>
                              <span style={{fontSize:16,flexShrink:0}}>{ft.icon}</span>
                              <div style={{flex:1,minWidth:0}}>
                                <div style={{fontFamily:O.sans,fontWeight:600,
                                  fontSize:12,color:"#fff",marginBottom:1}}>{ft.name}</div>
                                <div style={{fontFamily:O.mono,fontSize:8,color:O.textD}}>{ft.desc}</div>
                              </div>
                              <div style={{fontFamily:O.mono,fontSize:7,color:ft.c,
                                background:ft.c+"15",border:"1px solid "+ft.c+"30",
                                borderRadius:3,padding:"2px 6px",letterSpacing:1,
                                whiteSpace:"nowrap"}}>
                                {ft.sev.toUpperCase()}
                              </div>
                            </div>
                            <div style={{display:"flex",
                              alignItems:"center",justifyContent:"space-between",gap:8}}>
                              <div style={{display:"flex",gap:12}}>
                                <div>
                                  <div style={{fontFamily:O.mono,fontSize:7,color:O.textF,marginBottom:1}}>INSTANCES</div>
                                  <div style={{fontFamily:O.sans,fontWeight:700,fontSize:14,color:"#fff"}}>{ft.instances}</div>
                                </div>
                                <div>
                                  <div style={{fontFamily:O.mono,fontSize:7,color:O.textF,marginBottom:1}}>COST</div>
                                  <div style={{fontFamily:O.sans,fontWeight:700,fontSize:14,color:O.red}}>${ft.cost}</div>
                                </div>
                                <div>
                                  <div style={{fontFamily:O.mono,fontSize:7,color:O.textF,marginBottom:1}}>TOP</div>
                                  <div style={{fontFamily:O.mono,fontSize:10,color:O.textD}}>{ft.offender}</div>
                                </div>
                              </div>
                              <button style={{fontFamily:O.mono,fontSize:7,letterSpacing:1,
                                padding:"4px 10px",background:ft.c+"12",
                                border:"1px solid "+ft.c+"30",borderRadius:4,
                                color:ft.c,cursor:"pointer",whiteSpace:"nowrap"}}>
                                REVIEW →
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </Card>

                    {/* ZONE 6: Per-Employee Accuracy */}
                    <Card>
                      <SL text="Payroll Accuracy Breakdown — Per Employee" color={"#f97316"}/>
                      <div style={{display:"flex",flexDirection:"column",gap:10}}>
                        {[...EMPS].sort((a,b)=>
                          (a.ghost/Math.max(a.wkHrs,1))-(b.ghost/Math.max(b.wkHrs,1))).reverse().map(e=>{
                          const acc = Math.round((1-(e.ghost/Math.max(e.wkHrs,1)))*100);
                          const ac  = acc>=95?O.green:acc>=85?O.amber:O.red;
                          const moGhostCost = parseFloat(monthlyGhostCost(e));
                          const traj = e.ghost>2?"Getting worse — 3rd consecutive week of increase":
                            e.ghost>0?"Slight increase — monitor closely":
                            "Clean — no discrepancies detected";
                          const trajColor = e.ghost>2?O.red:e.ghost>0?O.amber:O.green;
                          return(
                            <div key={e.id} style={{background:O.bg3,borderRadius:8,padding:"12px"}}>
                              <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:8}}>
                                <Av emp={e} size={28} dark/>
                                <div style={{flex:1}}>
                                  <div style={{fontFamily:O.sans,fontWeight:600,
                                    fontSize:13,color:"#fff",marginBottom:1}}>{e.name}</div>
                                  <div style={{fontFamily:O.mono,fontSize:8,color:O.textD}}>{e.role}</div>
                                </div>
                                <div style={{textAlign:"right"}}>
                                  <div style={{fontFamily:O.sans,fontWeight:800,
                                    fontSize:24,color:ac,lineHeight:1}}>{acc}%</div>
                                  <div style={{fontFamily:O.mono,fontSize:7,color:O.textF}}>ACCURACY</div>
                                </div>
                              </div>
                              {/* Dual bars */}
                              <div style={{marginBottom:6}}>
                                <div style={{display:"flex",justifyContent:"space-between",marginBottom:3}}>
                                  <span style={{fontFamily:O.mono,fontSize:8,color:O.textD}}>Scheduled</span>
                                  <span style={{fontFamily:O.mono,fontSize:8,color:O.textD}}>Verified</span>
                                </div>
                                <div style={{position:"relative",height:6,
                                  background:"rgba(255,255,255,0.06)",borderRadius:3,marginBottom:3}}>
                                  <div style={{height:"100%",width:(e.wkHrs/50)*100+"%",
                                    background:"rgba(255,255,255,0.2)",borderRadius:3}}/>
                                </div>
                                <div style={{position:"relative",height:6,
                                  background:"rgba(255,255,255,0.06)",borderRadius:3}}>
                                  <div style={{height:"100%",
                                    width:((e.wkHrs-e.ghost)/50)*100+"%",
                                    background:ac,borderRadius:3}}/>
                                </div>
                              </div>
                              {/* Mini ghost history bars */}
                              <div style={{display:"flex",gap:2,height:14,
                                alignItems:"flex-end",marginBottom:6}}>
                                {MONTHLY.map((m,mi)=>{
                                  const wh = e.ghost*(0.7+(mi*0.07));
                                  const bh = Math.round((wh/5)*100);
                                  return(
                                    <div key={mi} title={m.m+": "+wh.toFixed(1)+"h ghost"}
                                      style={{flex:1,height:Math.max(2,bh)+"%",
                                        background:wh>3?O.red:wh>1?"#f97316":O.textD+"40",
                                        borderRadius:"1px 1px 0 0"}}/>
                                  );
                                })}
                              </div>
                              <div style={{display:"flex",justifyContent:"space-between",
                                alignItems:"center",gap:8}}>
                                <div style={{fontFamily:O.mono,fontSize:8,
                                  color:moGhostCost>50?O.red:O.textD}}>
                                  {moGhostCost>0?"$"+moGhostCost+" est. overpaid this mo":"Clean this month"}
                                </div>
                                <div style={{fontFamily:O.mono,fontSize:8,color:trajColor,
                                  display:"flex",alignItems:"center",gap:3}}>
                                  <span>{e.ghost>2?"↑":e.ghost>0?"→":"↓"}</span>
                                  <span style={{color:O.textD}}>{traj.split("—")[0]}</span>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </Card>
                  </div>

                  {/* ── ZONE 7: INVESTIGATION CASE FILES ── */}
                  <Card>
                    <div style={{display:"flex",alignItems:"center",
                      justifyContent:"space-between",marginBottom:14}}>
                      <SL text={"Open Investigation Cases ("+openCases.length+")"} color={O.red}/>
                      <button style={{fontFamily:O.mono,fontSize:8,letterSpacing:1,
                        padding:"6px 14px",background:"rgba(239,68,68,0.1)",
                        border:"1px solid rgba(239,68,68,0.3)",borderRadius:6,
                        color:O.red,cursor:"pointer"}}>+ Open New Case</button>
                    </div>

                    {openCases.length===0 && (
                      <div style={{fontFamily:O.mono,fontSize:11,color:O.green,
                        textAlign:"center",padding:"30px 0",letterSpacing:1}}>
                        ✓ No open investigation cases. Payroll integrity clean.
                      </div>
                    )}

                    <div style={{display:"flex",flexDirection:"column",gap:12}}>
                      {openCases.map((c,ci)=>(
                        <div key={c.id} style={{background:"rgba(239,68,68,0.03)",
                          border:"1px solid rgba(239,68,68,0.2)",
                          borderLeft:"4px solid "+O.red,
                          borderRadius:10,padding:"16px 18px",
                          boxShadow:"0 0 20px rgba(239,68,68,0.06)"}}>

                          {/* Case header */}
                          <div style={{display:"flex",gap:12,alignItems:"flex-start",
                            marginBottom:12,flexWrap:"wrap"}}>
                            <div style={{display:"flex",alignItems:"center",gap:10,flex:1}}>
                              <Av emp={c.emp} size={36} dark/>
                              <div>
                                <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:2}}>
                                  <span style={{fontFamily:O.sans,fontWeight:700,
                                    fontSize:15,color:"#fff"}}>{c.emp.name}</span>
                                  <span style={{fontFamily:O.mono,fontSize:8,color:O.red,
                                    background:"rgba(239,68,68,0.12)",border:"1px solid rgba(239,68,68,0.25)",
                                    borderRadius:3,padding:"2px 7px",letterSpacing:1}}>{c.type}</span>
                                </div>
                                <div style={{fontFamily:O.mono,fontSize:8,color:O.textF}}>
                                  {c.id} &nbsp;·&nbsp; Opened: {c.opened} &nbsp;·&nbsp; Updated: {c.updated}
                                </div>
                              </div>
                            </div>
                            <div style={{textAlign:"right",flexShrink:0}}>
                              <div style={{fontFamily:O.mono,fontSize:8,color:O.textF,marginBottom:3}}>
                                AMOUNT UNDER INVESTIGATION
                              </div>
                              <div style={{fontFamily:O.sans,fontWeight:900,
                                fontSize:24,color:O.red}}>${c.amount}</div>
                            </div>
                          </div>

                          {/* Evidence summary */}
                          <div style={{fontFamily:O.sans,fontSize:12,color:O.textD,
                            background:"rgba(0,0,0,0.2)",borderRadius:7,
                            padding:"10px 12px",marginBottom:12,lineHeight:1.6,
                            borderLeft:"2px solid rgba(239,68,68,0.3)"}}>
                            📁 {c.evidence}
                          </div>

                          {/* Stage tracker */}
                          <div style={{marginBottom:12}}>
                            <div style={{fontFamily:O.mono,fontSize:7,color:O.textF,
                              letterSpacing:"2px",marginBottom:7}}>INVESTIGATION STAGE</div>
                            <div style={{display:"flex",gap:0,alignItems:"center"}}>
                              {stages.map((st,si)=>{
                                const active = si===c.stage;
                                const done   = si<c.stage;
                                const sc2 = done?O.green:active?O.amber:O.textF;
                                return(
                                  <React.Fragment key={st}>
                                    <div style={{display:"flex",flexDirection:"column",
                                      alignItems:"center",flex:1}}>
                                      <div style={{width:22,height:22,borderRadius:"50%",
                                        background:done?O.green+"25":active?"rgba(245,158,11,0.2)":"rgba(255,255,255,0.04)",
                                        border:"2px solid "+(done?O.green:active?O.amber:O.border),
                                        display:"flex",alignItems:"center",justifyContent:"center",
                                        marginBottom:4,flexShrink:0}}>
                                        <span style={{fontSize:8,color:sc2}}>
                                          {done?"✓":active?"●":"○"}
                                        </span>
                                      </div>
                                      <span style={{fontFamily:O.mono,fontSize:6,color:sc2,
                                        letterSpacing:0.5,textAlign:"center",
                                        maxWidth:50,lineHeight:1.2}}>{st}</span>
                                    </div>
                                    {si<stages.length-1&&(
                                      <div style={{flex:1,height:2,
                                        background:done?O.green+"40":"rgba(255,255,255,0.06)",
                                        marginBottom:18,transition:"background 0.3s"}}/>
                                    )}
                                  </React.Fragment>
                                );
                              })}
                            </div>
                          </div>

                          {/* Action buttons */}
                          <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
                            {[
                              {l:"📋 Add Evidence",c:"rgba(0,212,255,0.12)",bc:"rgba(0,212,255,0.25)",tc:"#00d4ff"},
                              {l:"📧 HR Notification",c:"rgba(168,85,247,0.1)",bc:"rgba(168,85,247,0.25)",tc:"#a855f7"},
                              {l:"✅ Resolve Case",c:"rgba(16,185,129,0.1)",bc:"rgba(16,185,129,0.25)",tc:O.green},
                              {l:"⬆️ Escalate",c:"rgba(239,68,68,0.1)",bc:"rgba(239,68,68,0.25)",tc:O.red},
                            ].map(btn=>(
                              <button key={btn.l} style={{fontFamily:O.mono,fontSize:8,letterSpacing:1,
                                padding:"6px 12px",background:btn.c,border:"1px solid "+btn.bc,
                                borderRadius:5,color:btn.tc,cursor:"pointer",
                                transition:"all 0.15s"}}
                                onMouseEnter={e=>e.currentTarget.style.opacity="0.8"}
                                onMouseLeave={e=>e.currentTarget.style.opacity="1"}>
                                {btn.l}
                              </button>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Resolved cases toggle */}
                    <div style={{marginTop:16,borderTop:"1px solid "+O.border,paddingTop:12}}>
                      <button onClick={()=>setShowResolved(!showResolved)}
                        style={{background:"none",border:"none",cursor:"pointer",
                          fontFamily:O.mono,fontSize:9,color:O.textD,letterSpacing:1,
                          display:"flex",alignItems:"center",gap:6}}>
                        <span style={{transform:showResolved?"rotate(90deg)":"none",
                          transition:"transform 0.2s",display:"inline-block"}}>▶</span>
                        RESOLVED CASES (3)
                      </button>
                      {showResolved&&(
                        <div style={{marginTop:10,display:"flex",flexDirection:"column",gap:6}}>
                          {[
                            {id:"CASE-2025-002",name:"Jordan Mills",type:"Late Arrival Pattern",
                             outcome:"Resolved — verbal warning issued",date:"Feb 14"},
                            {id:"CASE-2025-001",name:"Marcus Bell",type:"Ghost Hours",
                             outcome:"Resolved — schedule adjustment implemented",date:"Jan 28"},
                            {id:"CASE-2024-009",name:"Priya Kapoor",type:"Register Void",
                             outcome:"Escalated to HR — formal written warning",date:"Dec 12"},
                          ].map((rc,i)=>(
                            <div key={rc.id} style={{padding:"9px 12px",background:O.bg3,
                              borderRadius:7,display:"flex",alignItems:"center",
                              gap:10,borderLeft:"3px solid "+O.green+"60"}}>
                              <div style={{fontFamily:O.mono,fontSize:8,color:O.textF,
                                width:90,flexShrink:0}}>{rc.id}</div>
                              <div style={{fontFamily:O.sans,fontSize:11,
                                color:O.textD,flex:1}}>{rc.name} — {rc.type}</div>
                              <div style={{fontFamily:O.mono,fontSize:8,color:O.green}}>{rc.outcome}</div>
                              <div style={{fontFamily:O.mono,fontSize:8,color:O.textF,
                                flexShrink:0}}>{rc.date}</div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </Card>

                </div>
              );
            })()}
          </div>
        )}


                {/* ── LIVE FEED (Prompt 10) ── */}
        {tab==="feed" && (
          <div style={{animation:"fadeUp 0.3s ease"}}>
            {(() => {
              const cyan = "#00d4ff";
              const cyanD = "rgba(0,212,255,0.08)";
              const cyanB = "rgba(0,212,255,0.2)";

              const evIcon = (type) => ({
                critical:"⚠️",warning:"▲",good:"✅",normal:"●",
                ghost:"👻",register:"📋",camera:"📷",swap:"🔄",
                late:"⏰",milestone:"🏆"
              })[type]||"●";

              const evBorder = (type) =>
                type==="critical"?O.red:type==="warning"?O.amber:type==="good"?O.green:"rgba(255,255,255,0.1)";

              const eventCounts = {
                total:FEED.length,
                critical:FEED.filter(e=>e.type==="critical").length,
                warning:FEED.filter(e=>e.type==="warning").length,
                good:FEED.filter(e=>e.type==="good").length,
                normal:FEED.filter(e=>e.type==="normal").length,
              };

              const filteredFeed = FEED.filter(ev=>{
                const matchType = filter==="all"||ev.type===filter;
                const emp = byId(ev.eId);
                const matchSearch = feedSearch===""||
                  (emp&&emp.name.toLowerCase().includes(feedSearch.toLowerCase()))||
                  ev.event.toLowerCase().includes(feedSearch.toLowerCase());
                return matchType&&matchSearch;
              });

              // Group events by 30-min window
              const timeGroups = [];
              let currentGroup = null;
              filteredFeed.forEach(ev=>{
                const h = parseInt(ev.time.split(":")[0]);
                const m = parseInt(ev.time.split(":")[1]||0);
                const slot = h*2 + (m>=30?1:0);
                const groupLabel = h+":"+(m<30?"00":"30")+" – "+h+":"+(m<30?"30":"59");
                if(!currentGroup||currentGroup.slot!==slot){
                  currentGroup = {slot,label:groupLabel,events:[]};
                  timeGroups.push(currentGroup);
                }
                currentGroup.events.push(ev);
              });

              // Hourly activity (12 bars for current shift)
              const hourBars = Array.from({length:12},(_,i)=>{
                const hr = 8+i;
                return {hr,count:FEED.filter(ev=>parseInt(ev.time?.split(":")?.[0]||0)===hr).length};
              });
              const peakHour = hourBars.reduce((a,b)=>b.count>a.count?b:a,hourBars[0]);
              const maxBar = Math.max(...hourBars.map(b=>b.count),1);

              // Most active employee
              const empEventCounts = EMPS.map(e=>({
                e,count:FEED.filter(ev=>ev.eId===e.id).length
              })).sort((a,b)=>b.count-a.count);
              const mostActive = empEventCounts[0];
              const highRiskEv = FEED.find(ev=>ev.type==="critical");
              const highRiskEmp = highRiskEv?byId(highRiskEv.eId):null;

              const SL = ({text,color}) => (
                <div style={{fontFamily:O.mono,fontSize:7,color:color||O.textF,
                  letterSpacing:"2.5px",textTransform:"uppercase",marginBottom:8}}>{text}</div>
              );

              return (
                <div>
                  {/* ── ZONE 1: FEED HEADER ── */}
                  <div style={{background:O.bg2,border:"1px solid "+O.border,
                    borderRadius:10,padding:"12px 16px",marginBottom:12}}>

                    {/* Top row: live badge + counts + controls */}
                    <div style={{display:"flex",alignItems:"center",
                      gap:14,flexWrap:"wrap",marginBottom:10}}>
                      {/* Live badge */}
                      <div style={{display:"flex",alignItems:"center",gap:7,
                        background:cyanD,border:"1px solid "+cyanB,
                        borderRadius:6,padding:"5px 12px",flexShrink:0}}>
                        <div style={{width:7,height:7,borderRadius:"50%",
                          background:O.green,animation:"blink 1.2s infinite",
                          boxShadow:"0 0 6px "+O.green}}/>
                        <span style={{fontFamily:O.mono,fontSize:10,color:cyan,
                          letterSpacing:"1.5px",fontWeight:600}}>
                          LIVE — {now.toLocaleTimeString("en-US",{hour12:false})}
                        </span>
                      </div>

                      {/* Event counts */}
                      <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
                        {[
                          {l:eventCounts.total+" events",c:"#fff"},
                          {l:eventCounts.critical+" critical",c:O.red},
                          {l:eventCounts.warning+" warnings",c:O.amber},
                          {l:eventCounts.good+" good",c:O.green},
                        ].map((s,i)=>(
                          <span key={i} style={{fontFamily:O.mono,fontSize:9,color:s.c}}>
                            {i>0?"·  ":""}{s.l}
                          </span>
                        ))}
                      </div>

                      <div style={{marginLeft:"auto",display:"flex",gap:8,flexWrap:"wrap"}}>
                        {/* Auto-scroll toggle */}
                        <button onClick={()=>setFeedPaused(!feedPaused)}
                          style={{fontFamily:O.mono,fontSize:8,letterSpacing:1,
                            padding:"5px 12px",borderRadius:5,border:"none",cursor:"pointer",
                            background:feedPaused?"rgba(245,158,11,0.15)":cyanD,
                            color:feedPaused?O.amber:cyan}}>
                          {feedPaused?"⏸ PAUSED":"▶ LIVE"}
                        </button>
                        <button style={{fontFamily:O.mono,fontSize:8,letterSpacing:1,
                          padding:"5px 12px",borderRadius:5,
                          background:"rgba(255,255,255,0.04)",border:"1px solid "+O.border,
                          color:O.textD,cursor:"pointer"}}>
                          📋 Export
                        </button>
                        <button onClick={()=>setAlerts(alerts.map(a=>({...a,seen:true})))}
                          style={{fontFamily:O.mono,fontSize:8,letterSpacing:1,
                            padding:"5px 12px",borderRadius:5,
                            background:"rgba(16,185,129,0.08)",
                            border:"1px solid rgba(16,185,129,0.2)",
                            color:O.green,cursor:"pointer"}}>
                          ✓ Mark All Seen
                        </button>
                      </div>
                    </div>

                    {/* Filter pills + search */}
                    <div style={{display:"flex",gap:6,flexWrap:"wrap",alignItems:"center"}}>
                      {["all","critical","warning","good","normal"].map(f=>(
                        <button key={f} onClick={()=>setFilter(f)}
                          style={{fontFamily:O.mono,fontSize:7,letterSpacing:1,
                            padding:"4px 10px",borderRadius:4,border:"none",cursor:"pointer",
                            textTransform:"uppercase",
                            background:filter===f?
                              (f==="critical"?"rgba(239,68,68,0.2)":f==="warning"?"rgba(245,158,11,0.15)":f==="good"?"rgba(16,185,129,0.12)":cyanD)
                              :"rgba(255,255,255,0.04)",
                            color:filter===f?
                              (f==="critical"?O.red:f==="warning"?O.amber:f==="good"?O.green:cyan)
                              :O.textF}}>
                          {f}
                        </button>
                      ))}
                      <div style={{flex:1,minWidth:160,position:"relative"}}>
                        <input
                          value={feedSearch}
                          onChange={e=>setFeedSearch(e.target.value)}
                          placeholder="Search employee or event..."
                          style={{width:"100%",padding:"5px 12px",
                            background:"rgba(255,255,255,0.04)",
                            border:"1px solid "+O.border,borderRadius:5,
                            fontFamily:O.mono,fontSize:9,color:"#fff",
                            outline:"none"}}/>
                      </div>
                    </div>
                  </div>

                  {/* ── MAIN 2-COLUMN LAYOUT ── */}
                  <div style={{display:"grid",gridTemplateColumns:"1.8fr 1fr",gap:12,marginBottom:12}}>

                    {/* ── ZONE 2: MAIN EVENT FEED ── */}
                    <div style={{background:O.bg2,border:"1px solid "+O.border,borderRadius:10,overflow:"hidden"}}>

                      {/* Feed top bar */}
                      <div style={{display:"flex",alignItems:"center",
                        justifyContent:"space-between",padding:"9px 14px",
                        background:O.bg3,borderBottom:"1px solid "+O.border}}>
                        <div style={{display:"flex",alignItems:"center",gap:8}}>
                          <div style={{width:6,height:6,borderRadius:"50%",
                            background:feedPaused?O.amber:O.green,
                            animation:feedPaused?"none":"blink 1.2s infinite"}}/>
                          <span style={{fontFamily:O.mono,fontSize:9,
                            color:feedPaused?O.amber:O.green,letterSpacing:1.5}}>
                            {feedPaused?"PAUSED":"LIVE FEED"}
                          </span>
                        </div>
                        <span style={{fontFamily:O.mono,fontSize:8,color:O.textF}}>
                          {filteredFeed.length} events shown
                        </span>
                      </div>

                      {/* Events */}
                      <div style={{maxHeight:520,overflowY:"auto"}}>
                        {filteredFeed.length===0&&(
                          <div style={{padding:"40px",textAlign:"center",
                            fontFamily:O.mono,fontSize:10,color:O.textF,letterSpacing:1}}>
                            No events match your filter
                          </div>
                        )}

                        {timeGroups.map((grp,gi)=>(
                          <div key={gi}>
                            {/* Time group header */}
                            <div style={{padding:"5px 14px",
                              background:"rgba(255,255,255,0.03)",
                              borderBottom:"1px solid "+O.border,
                              borderTop:gi>0?"1px solid "+O.border:"none",
                              display:"flex",alignItems:"center",gap:8}}>
                              <div style={{flex:1,height:1,background:"rgba(255,255,255,0.06)"}}/>
                              <span style={{fontFamily:O.mono,fontSize:7,
                                color:O.textF,letterSpacing:"2px",whiteSpace:"nowrap"}}>
                                TODAY — {grp.label}
                              </span>
                              <div style={{flex:1,height:1,background:"rgba(255,255,255,0.06)"}}/>
                              <span style={{fontFamily:O.mono,fontSize:7,color:O.textF}}>
                                {grp.events.length} events
                              </span>
                            </div>

                            {/* Events in group */}
                            {grp.events.map((ev,ei2)=>{
                              const emp = byId(ev.eId);
                              const c = sC(ev.type);
                              const border = evBorder(ev.type);
                              const icon = evIcon(ev.type);
                              const isExpanded = expandedFeed===ev.id;
                              const isCrit = ev.type==="critical";

                              return(
                                <div key={ev.id}
                                  style={{borderBottom:"1px solid "+O.border,
                                    background:isCrit?"rgba(239,68,68,0.03)":ev.type==="good"?"rgba(16,185,129,0.015)":"transparent",
                                    borderLeft:"3px solid "+border,
                                    animation:"fadeIn 0.3s ease both"}}>

                                  {/* Main row */}
                                  <div style={{display:"flex",alignItems:"center",
                                    gap:10,padding:"10px 14px",cursor:"pointer"}}
                                    onClick={()=>setExpandedFeed(isExpanded?null:ev.id)}>

                                    <div style={{fontFamily:O.mono,fontSize:8,
                                      color:O.textF,width:44,flexShrink:0}}>{ev.time}</div>

                                    <div style={{fontSize:12,width:18,
                                      flexShrink:0,textAlign:"center"}}>{icon}</div>

                                    {emp
                                      ? <Av emp={emp} size={24} dark/>
                                      : <div style={{width:24,height:24,borderRadius:6,
                                          background:O.bg3,border:"1px solid "+O.border,
                                          display:"flex",alignItems:"center",
                                          justifyContent:"center",fontSize:9,color:O.textF}}>?</div>
                                    }

                                    <div style={{flex:1,minWidth:0}}>
                                      <div style={{fontFamily:O.sans,fontWeight:600,
                                        fontSize:12,color:"#fff",marginBottom:1,
                                        whiteSpace:"nowrap",overflow:"hidden",
                                        textOverflow:"ellipsis"}}>
                                        {emp?emp.name+" — ":""}{ev.event}
                                      </div>
                                      <div style={{fontFamily:O.mono,fontSize:8,
                                        color:O.textD}}>{ev.detail}</div>
                                    </div>

                                    <OBadge label={ev.type} color={c} sm/>

                                    {isCrit&&(
                                      <span style={{fontFamily:O.mono,fontSize:9,
                                        color:O.textF,transition:"transform 0.2s",
                                        transform:isExpanded?"rotate(180deg)":"none",
                                        display:"inline-block",flexShrink:0}}>▾</span>
                                    )}

                                    {emp&&(
                                      <button onClick={e2=>{e2.stopPropagation();goProfile(emp.id);}}
                                        style={{fontFamily:O.mono,fontSize:7,padding:"3px 8px",
                                          background:cyanD,border:"1px solid "+cyanB,
                                          borderRadius:3,color:cyan,cursor:"pointer",
                                          letterSpacing:1,flexShrink:0}}>
                                        PROFILE
                                      </button>
                                    )}
                                  </div>

                                  {/* Expanded detail */}
                                  {isExpanded&&(
                                    <div style={{padding:"0 14px 12px 78px",
                                      background:"rgba(239,68,68,0.03)"}}>
                                      <div style={{background:O.bg3,borderRadius:8,
                                        padding:"12px",marginBottom:8}}>
                                        <div style={{fontFamily:O.mono,fontSize:7,
                                          color:O.red,letterSpacing:2,marginBottom:6}}>
                                          FULL CONTEXT
                                        </div>
                                        <div style={{fontFamily:O.sans,fontSize:12,
                                          color:O.textD,lineHeight:1.6,marginBottom:8}}>
                                          {ev.detail} This event was flagged automatically by the
                                          ShiftPro pattern engine based on historical data.
                                          {emp?" "+emp.name+" has "+emp.flags+" active flag"+(emp.flags!==1?"s":"")+" on record.":""}
                                        </div>
                                        {emp&&(
                                          <div style={{fontFamily:O.mono,fontSize:8,
                                            color:O.textF,marginBottom:8}}>
                                            PRIOR EVENTS: Clock-in {emp.streak} days ago · Flag raised 3 days ago · Review pending
                                          </div>
                                        )}
                                        <div style={{fontFamily:O.mono,fontSize:8,
                                          color:O.amber,background:"rgba(245,158,11,0.08)",
                                          borderRadius:5,padding:"6px 10px",marginBottom:10,
                                          borderLeft:"2px solid "+O.amber}}>
                                          RECOMMENDED: Verify employee location via camera.
                                          Cross-reference register activity for same time window.
                                        </div>
                                        <div style={{display:"flex",gap:7,flexWrap:"wrap"}}>
                                          {[
                                            {l:"DISMISS",bg:"rgba(255,255,255,0.06)",c:O.textD},
                                            {l:"INVESTIGATE",bg:"rgba(245,158,11,0.1)",c:O.amber},
                                            {l:"CONTACT EMPLOYEE",bg:"rgba(0,212,255,0.08)",c:cyan},
                                          ].map(btn=>(
                                            <button key={btn.l}
                                              style={{fontFamily:O.mono,fontSize:7,letterSpacing:1,
                                                padding:"5px 12px",background:btn.bg,
                                                border:"none",borderRadius:4,
                                                color:btn.c,cursor:"pointer"}}>
                                              {btn.l}
                                            </button>
                                          ))}
                                        </div>
                                      </div>
                                    </div>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* ── ZONE 3: ACTIVE SHIFT SIDEBAR ── */}
                    <div style={{display:"flex",flexDirection:"column",gap:10}}>

                      {/* Section A: Who's On Floor */}
                      <div style={{background:"rgba(5,8,15,0.8)",
                        border:"1px solid "+O.border,borderRadius:10,padding:"14px"}}>
                        <SL text="On Floor Now" color={cyan}/>
                        <div style={{display:"flex",flexDirection:"column",gap:6}}>
                          {EMPS.map(e=>{
                            const lastEv = FEED.filter(ev=>ev.eId===e.id)[0];
                            const onSince = e.status==="active"
                              ?(now.getHours()-9)*60+now.getMinutes():0;
                            const onHrs = Math.floor(onSince/60);
                            const onMin = onSince%60;
                            return(
                              <div key={e.id}
                                style={{padding:"8px 10px",background:O.bg3,
                                  borderRadius:7,cursor:"pointer",transition:"all 0.15s",
                                  border:"1px solid "+(e.status==="active"?"rgba(16,185,129,0.2)":O.border)}}
                                onClick={()=>goProfile(e.id)}
                                onMouseEnter={ev=>ev.currentTarget.style.borderColor=cyan+"50"}
                                onMouseLeave={ev=>ev.currentTarget.style.borderColor=
                                  e.status==="active"?"rgba(16,185,129,0.2)":O.border}>
                                <div style={{display:"flex",alignItems:"center",gap:7,marginBottom:4}}>
                                  <div style={{position:"relative"}}>
                                    <Av emp={e} size={22} dark/>
                                    <div style={{position:"absolute",bottom:-1,right:-1,
                                      width:7,height:7,borderRadius:"50%",
                                      border:"1.5px solid "+O.bg3,
                                      background:e.status==="active"?O.green:e.status==="break"?O.amber:"#444"}}/>
                                  </div>
                                  <div style={{flex:1,minWidth:0}}>
                                    <div style={{fontFamily:O.sans,fontWeight:600,
                                      fontSize:11,color:"#fff",whiteSpace:"nowrap",
                                      overflow:"hidden",textOverflow:"ellipsis"}}>{e.name}</div>
                                    <div style={{fontFamily:O.mono,fontSize:7,color:O.textD}}>{e.role}</div>
                                  </div>
                                  {e.status==="active"&&(
                                    <div style={{fontFamily:O.mono,fontSize:7,
                                      color:O.textF,textAlign:"right",flexShrink:0}}>
                                      {onHrs}h{onMin}m
                                    </div>
                                  )}
                                </div>
                                <div style={{display:"flex",
                                  justifyContent:"space-between",alignItems:"center"}}>
                                  <span style={{fontFamily:O.mono,fontSize:7,
                                    color:e.cam>80?O.green:O.amber}}>
                                    {e.cam>80?"📷 VERIFIED":"⚠ UNVERIFIED"}
                                  </span>
                                  {lastEv&&(
                                    <span style={{fontFamily:O.mono,fontSize:7,
                                      color:O.textF,maxWidth:100,
                                      overflow:"hidden",textOverflow:"ellipsis",
                                      whiteSpace:"nowrap"}}>
                                      {lastEv.time} {lastEv.event.slice(0,18)}
                                    </span>
                                  )}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      {/* Section B: Alert Queue */}
                      <div style={{background:"rgba(5,8,15,0.8)",
                        border:"1px solid "+O.border,borderRadius:10,padding:"14px"}}>
                        <div style={{display:"flex",alignItems:"center",
                          justifyContent:"space-between",marginBottom:8}}>
                          <SL text="Alert Queue" color={O.red}/>
                          <div style={{display:"flex",alignItems:"center",gap:7}}>
                            {alerts.filter(a=>!a.seen).length>0&&(
                              <div style={{fontFamily:O.mono,fontSize:7,color:O.red,
                                background:"rgba(239,68,68,0.12)",border:"1px solid rgba(239,68,68,0.25)",
                                borderRadius:3,padding:"2px 6px",letterSpacing:1}}>
                                {alerts.filter(a=>!a.seen).length} UNREVIEWED
                              </div>
                            )}
                            <button onClick={()=>setAlerts(alerts.map(a=>({...a,seen:true})))}
                              style={{fontFamily:O.mono,fontSize:7,padding:"2px 7px",
                                background:"none",border:"1px solid "+O.border,
                                borderRadius:3,color:O.textD,cursor:"pointer",
                                letterSpacing:1}}>CLEAR ALL</button>
                          </div>
                        </div>
                        <div style={{display:"flex",flexDirection:"column",gap:5}}>
                          {alerts.slice(0,4).map(a=>{
                            const ac = a.sev==="critical"?O.red:a.sev==="warning"?O.amber:O.green;
                            return(
                              <div key={a.id}
                                style={{padding:"7px 9px",background:O.bg3,borderRadius:6,
                                  borderLeft:"2px solid "+ac,opacity:a.seen?0.5:1,
                                  transition:"opacity 0.2s"}}>
                                <div style={{display:"flex",gap:6,
                                  alignItems:"flex-start",marginBottom:3}}>
                                  <div style={{width:6,height:6,borderRadius:"50%",
                                    background:ac,marginTop:2,flexShrink:0,
                                    animation:!a.seen&&a.sev==="critical"?"blink 0.8s infinite":"none"}}/>
                                  <div style={{flex:1,minWidth:0}}>
                                    <div style={{fontFamily:O.sans,fontWeight:600,
                                      fontSize:10,color:"#fff",lineHeight:1.3}}>{a.msg}</div>
                                    <div style={{fontFamily:O.mono,fontSize:7,
                                      color:O.textD,marginTop:1}}>{a.detail}</div>
                                  </div>
                                  <span style={{fontFamily:O.mono,fontSize:7,
                                    color:O.textF,flexShrink:0}}>{a.time}</span>
                                </div>
                                {!a.seen&&(
                                  <button
                                    onClick={()=>setAlerts(alerts.map(x=>x.id===a.id?{...x,seen:true}:x))}
                                    style={{fontFamily:O.mono,fontSize:7,letterSpacing:1,
                                      padding:"2px 8px",background:ac+"15",
                                      border:"1px solid "+ac+"30",borderRadius:3,
                                      color:ac,cursor:"pointer",marginLeft:12}}>ACT</button>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      {/* Section C: Quick Actions */}
                      <div style={{background:"rgba(5,8,15,0.8)",
                        border:"1px solid "+O.border,borderRadius:10,padding:"14px"}}>
                        <SL text="Quick Actions" color={cyan}/>
                        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:6}}>
                          {[
                            {icon:"📢",l:"Broadcast",c:O.amber},
                            {icon:"📷",l:"Cameras",c:cyan,fn:()=>setTab("cameras")},
                            {icon:"🔔",l:"Test Alert",c:"#a855f7"},
                            {icon:"📋",l:"Export Hour",c:O.green},
                            {icon:"⚡",l:"Flag Activity",c:O.red},
                            {icon:"📅",l:"Schedule",c:"#38bdf8",fn:()=>setTab("schedule")},
                          ].map(a=>(
                            <button key={a.l}
                              onClick={a.fn||undefined}
                              style={{display:"flex",alignItems:"center",gap:6,
                                padding:"7px 10px",background:a.c+"10",
                                border:"1px solid "+a.c+"25",borderRadius:6,
                                cursor:"pointer",transition:"all 0.15s"}}
                              onMouseEnter={e=>e.currentTarget.style.background=a.c+"20"}
                              onMouseLeave={e=>e.currentTarget.style.background=a.c+"10"}>
                              <span style={{fontSize:13}}>{a.icon}</span>
                              <span style={{fontFamily:O.mono,fontSize:8,
                                color:a.c,letterSpacing:"0.5px"}}>{a.l}</span>
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* ── ZONE 4: EVENT ANALYTICS BAR ── */}
                  <div style={{background:O.bg2,border:"1px solid "+O.border,
                    borderRadius:10,padding:"14px 18px"}}>
                    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:20,
                      alignItems:"center"}}>

                      {/* Event type breakdown */}
                      <div>
                        <SL text="Event Breakdown Today"/>
                        <div style={{height:12,borderRadius:3,overflow:"hidden",
                          display:"flex",marginBottom:8}}>
                          {[
                            {l:"Clock-ins",c:O.green,n:FEED.filter(e=>e.type==="good").length},
                            {l:"Warnings",c:O.amber,n:FEED.filter(e=>e.type==="warning").length},
                            {l:"Critical",c:O.red,n:FEED.filter(e=>e.type==="critical").length},
                            {l:"Normal",c:"rgba(255,255,255,0.2)",n:FEED.filter(e=>e.type==="normal").length},
                          ].map((seg,i)=>{
                            const pct = FEED.length>0?Math.round((seg.n/FEED.length)*100):0;
                            return pct>0?(
                              <div key={i} title={seg.l+": "+seg.n}
                                style={{width:pct+"%",background:seg.c,
                                  borderRight:"1px solid rgba(5,8,15,0.5)"}}/>
                            ):null;
                          })}
                        </div>
                        <div style={{display:"flex",gap:10,flexWrap:"wrap"}}>
                          {[
                            {l:"Good",c:O.green,n:eventCounts.good},
                            {l:"Warning",c:O.amber,n:eventCounts.warning},
                            {l:"Critical",c:O.red,n:eventCounts.critical},
                            {l:"Normal",c:O.textD,n:eventCounts.normal},
                          ].map(s=>(
                            <div key={s.l} style={{display:"flex",alignItems:"center",gap:4}}>
                              <div style={{width:7,height:7,borderRadius:2,background:s.c}}/>
                              <span style={{fontFamily:O.mono,fontSize:7,color:O.textD}}>
                                {s.l} ({s.n})
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Shift activity sparkline */}
                      <div>
                        <SL text="Event Volume By Hour"/>
                        <div style={{display:"flex",alignItems:"flex-end",
                          gap:3,height:36,marginBottom:5}}>
                          {hourBars.map((b,i)=>{
                            const h = Math.round((b.count/maxBar)*100);
                            const isPeak = b.hr===peakHour.hr;
                            return(
                              <div key={i} title={b.hr+":00 — "+b.count+" events"}
                                style={{flex:1,height:Math.max(3,h)+"%",
                                  background:isPeak?cyan:"rgba(0,212,255,0.25)",
                                  borderRadius:"2px 2px 0 0",
                                  boxShadow:isPeak?"0 0 6px rgba(0,212,255,0.4)":"none"}}>
                              </div>
                            );
                          })}
                        </div>
                        <div style={{fontFamily:O.mono,fontSize:8,color:O.textD}}>
                          Peak: <span style={{color:cyan}}>{peakHour.hr}:00–{peakHour.hr+1}:00</span>
                          {" "}({peakHour.count} events)
                        </div>
                      </div>

                      {/* Feed summary stats */}
                      <div>
                        <SL text="Feed Intelligence"/>
                        <div style={{display:"flex",flexDirection:"column",gap:7}}>
                          <div style={{background:O.bg3,borderRadius:6,padding:"8px 10px"}}>
                            <div style={{fontFamily:O.mono,fontSize:7,
                              color:O.textF,letterSpacing:1,marginBottom:3}}>MOST ACTIVE</div>
                            <div style={{display:"flex",alignItems:"center",gap:6}}>
                              {mostActive&&<Av emp={mostActive.e} size={18} dark/>}
                              <span style={{fontFamily:O.sans,fontWeight:600,
                                fontSize:11,color:"#fff"}}>
                                {mostActive?.e.name.split(" ")[0]} — {mostActive?.count} events
                              </span>
                            </div>
                          </div>
                          <div style={{background:O.bg3,borderRadius:6,padding:"8px 10px"}}>
                            <div style={{fontFamily:O.mono,fontSize:7,
                              color:O.textF,letterSpacing:1,marginBottom:3}}>HIGHEST RISK EVENT</div>
                            <div style={{display:"flex",alignItems:"center",gap:6}}>
                              {highRiskEmp&&<Av emp={highRiskEmp} size={18} dark/>}
                              <span style={{fontFamily:O.mono,fontSize:9,color:O.red}}>
                                {highRiskEmp?highRiskEmp.name.split(" ")[0]+" — ":""}
                                {highRiskEv?highRiskEv.event.slice(0,22):"None"}
                              </span>
                            </div>
                          </div>
                          <div style={{background:O.bg3,borderRadius:6,padding:"8px 10px"}}>
                            <div style={{fontFamily:O.mono,fontSize:7,
                              color:O.textF,letterSpacing:1,marginBottom:2}}>AVG RESPONSE TIME</div>
                            <span style={{fontFamily:O.sans,fontWeight:700,
                              fontSize:14,color:cyan}}>4.2 min</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                </div>
              );
            })()}
          </div>
        )}


                {/* ── ROI REPORT (Prompt 11) ── */}
        {tab==="roi" && (
          <div style={{animation:"fadeUp 0.3s ease"}}>
            {(() => {
              // ── PAYROLL CALCULATIONS ──
              // Additional pay categories — configurable per employee
              // Future: load from employee file settings
              const PAY_CATEGORIES = [
                {id:"tips",      label:"Tips",           icon:"💵", unit:"$",  enabled:true},
                {id:"mileage",   label:"Mileage",        icon:"🚗", unit:"mi", enabled:true, rate:0.67},
                {id:"bonus",     label:"Bonus",          icon:"⭐", unit:"$",  enabled:false},
                {id:"stipend",   label:"Stipend",        icon:"📦", unit:"$",  enabled:false},
              ];
              // Per-employee additional pay (synthesized — will come from employee file)
              const getAdditionalPay = (e) => ({
                tips:    e.id===1?0:e.id===2?84:e.id===3?210:e.id===4?156:e.id===5?92:0,
                mileage: e.id===1?0:e.id===2?0:e.id===3?47:e.id===4?0:e.id===5?112:0, // miles driven
                bonus:   0,
                stipend: 0,
              });
              const mileageRate = 0.67; // IRS standard rate $/mile

              const calcPayroll = (e) => {
                const regHrs = Math.min(e.wkHrs*2, 80);
                const otHrs  = e.ot ? e.ot*2 : 0;
                const regPay = regHrs*e.rate;
                const otPay  = otHrs*e.rate*1.5;
                const addl   = getAdditionalPay(e);
                const tipPay     = addl.tips;
                const mileagePay = parseFloat((addl.mileage*mileageRate).toFixed(2));
                const bonusPay   = addl.bonus;
                const stipendPay = addl.stipend;
                const additionalTotal = tipPay+mileagePay+bonusPay+stipendPay;
                const gross  = regPay+otPay+additionalTotal;
                const verified = e.cam>=80;
                const hasDisc  = e.ghost>1;
                const status   = hasDisc?"DISCREPANCY":verified?"VERIFIED":"PENDING";
                return {regHrs,otHrs,regPay,otPay,gross,verified,hasDisc,status,
                  tipPay,mileagePay,bonusPay,stipendPay,additionalTotal,
                  mileageMiles:addl.mileage};
              };

              const periodTotals = EMPS.reduce((acc,e)=>{
                const p = calcPayroll(e);
                return {
                  totalHrs:    acc.totalHrs+p.regHrs+p.otHrs,
                  totalGross:  acc.totalGross+p.gross,
                  totalOT:     acc.totalOT+p.otHrs,
                  discCount:   acc.discCount+(p.hasDisc?1:0),
                  totalTips:   acc.totalTips+p.tipPay,
                  totalMileage:acc.totalMileage+p.mileagePay,
                  totalAddl:   acc.totalAddl+p.additionalTotal,
                };
              },{totalHrs:0,totalGross:0,totalOT:0,discCount:0,totalTips:0,totalMileage:0,totalAddl:0});

              const getDailyRows = (e) => {
                const days  = ["Mon","Tue","Wed","Thu","Fri","Mon","Tue","Wed","Thu","Fri"];
                const dates = ["Mar 17","Mar 18","Mar 19","Mar 20","Mar 21","Mar 24","Mar 25","Mar 26","Mar 27","Mar 28"];
                return days.map((day,i)=>{
                  const scheduled = i!==2;
                  const hi = 8+(e.id%2);
                  const mi = e.id*3%10;
                  const ho = 16+(i%2);
                  const mo = (e.id+i)%6*5%10;
                  const clockIn  = scheduled?"0"+hi+":0"+mi:null;
                  const clockOut = scheduled?(ho>=10?ho:"0"+ho)+":"+(mo===0?"00":mo*5):null;
                  const regHrs   = scheduled?parseFloat((7.5+(i%3)*0.25).toFixed(2)):0;
                  const otHrs    = (i===1||i===6)?0.9:0;
                  const verified = e.cam>80||i%3!==0;
                  const discFlag = e.ghost>1&&(i===2||i===7);
                  return {day,date:dates[i],clockIn,clockOut,regHrs,otHrs,verified,scheduled,discFlag};
                });
              };

              const maxHrs = Math.max(...EMPS.map(e=>{const p=calcPayroll(e);return p.regHrs+p.otHrs;}),1);
              const discEmps = EMPS.filter(e=>calcPayroll(e).hasDisc);
              const resolvedCount = Object.values(resolvedDisc).filter(Boolean).length;
              const allResolved = resolvedCount>=discEmps.length;
              const green = "#10b981";
              const greenD = "rgba(16,185,129,0.08)";
              const greenB = "rgba(16,185,129,0.25)";

              const SL = ({text,color}) => (
                <div style={{fontFamily:O.mono,fontSize:7,color:color||O.textF,
                  letterSpacing:"2.5px",textTransform:"uppercase",marginBottom:10}}>{text}</div>
              );
              const Card = ({children,style={}}) => (
                <div style={{background:O.bg2,border:"1px solid "+O.border,
                  borderRadius:12,padding:"16px 18px",...style}}>
                  {children}
                </div>
              );

              return (
                <div>

                  {/* ── ZONE 1: PAYROLL PERIOD HEADER ── */}
                  <div style={{background:O.bg2,border:"1px solid "+greenB,
                    borderRadius:12,padding:"14px 18px",marginBottom:12}}>
                    <div style={{display:"flex",gap:14,alignItems:"center",
                      flexWrap:"wrap",marginBottom:10}}>
                      {/* Period type pills */}
                      <div style={{display:"flex",gap:5}}>
                        {[["biweekly","BI-WEEKLY"],["weekly","WEEKLY"],
                          ["semimonthly","SEMI-MONTHLY"],["monthly","MONTHLY"]].map(([v,l])=>(
                          <button key={v} onClick={()=>setPayPeriod(v)}
                            style={{fontFamily:O.mono,fontSize:7,letterSpacing:1,
                              padding:"4px 9px",borderRadius:4,border:"none",cursor:"pointer",
                              background:payPeriod===v?"rgba(16,185,129,0.18)":"rgba(255,255,255,0.04)",
                              color:payPeriod===v?green:O.textF}}>
                            {l}
                          </button>
                        ))}
                      </div>

                      {/* Period navigator */}
                      <div style={{display:"flex",alignItems:"center",gap:8}}>
                        <button style={{background:"none",border:"1px solid "+O.border,
                          borderRadius:4,color:O.textD,cursor:"pointer",
                          padding:"3px 8px",fontFamily:O.mono,fontSize:11}}>←</button>
                        <div style={{fontFamily:O.sans,fontWeight:700,fontSize:13,
                          color:"#fff",whiteSpace:"nowrap"}}>
                          Mar 16 – Mar 29, 2025
                        </div>
                        <button style={{background:"none",border:"1px solid "+O.border,
                          borderRadius:4,color:O.textD,cursor:"pointer",
                          padding:"3px 8px",fontFamily:O.mono,fontSize:11}}>→</button>
                      </div>

                      {/* Status + days */}
                      <div style={{display:"flex",alignItems:"center",gap:8}}>
                        <div style={{fontFamily:O.mono,fontSize:8,color:O.amber,
                          background:"rgba(245,158,11,0.12)",
                          border:"1px solid rgba(245,158,11,0.3)",
                          borderRadius:4,padding:"3px 10px",letterSpacing:1}}>
                          OPEN
                        </div>
                        <span style={{fontFamily:O.mono,fontSize:8,color:O.textD}}>
                          2 days left in period
                        </span>
                      </div>

                      {/* Quick stats */}
                      <div style={{display:"flex",gap:12,marginLeft:"auto",flexWrap:"wrap"}}>
                        {[
                          {l:"Total Hours",v:periodTotals.totalHrs.toFixed(1)+"h"},
                          {l:"Est. Gross",v:"$"+periodTotals.totalGross.toFixed(0)},
                          {l:"Employees",v:EMPS.length+" processed"},
                        ].map(s=>(
                          <div key={s.l} style={{textAlign:"center"}}>
                            <div style={{fontFamily:O.sans,fontWeight:700,fontSize:13,color:"#fff"}}>{s.v}</div>
                            <div style={{fontFamily:O.mono,fontSize:7,color:O.textF,letterSpacing:1}}>{s.l}</div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Action buttons */}
                    <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
                      {[
                        {l:"🔒 Lock Period",bg:"rgba(255,255,255,0.06)",c:O.textD},
                        {l:"✅ Approve Payroll",bg:"rgba(16,185,129,0.1)",c:green},
                        {l:"📤 Export to QuickBooks",bg:"rgba(16,185,129,0.18)",c:green,bold:true},
                      ].map(btn=>(
                        <button key={btn.l}
                          style={{fontFamily:O.mono,fontSize:8,letterSpacing:1,
                            padding:"7px 16px",background:btn.bg,
                            border:"1px solid "+(btn.bold?greenB:O.border),
                            borderRadius:6,color:btn.c,cursor:"pointer",
                            fontWeight:btn.bold?700:400,transition:"all 0.15s"}}
                          onMouseEnter={e=>e.currentTarget.style.opacity="0.85"}
                          onMouseLeave={e=>e.currentTarget.style.opacity="1"}>
                          {btn.l}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* ── ZONE 2: SUMMARY STATS ── */}
                  <div style={{display:"grid",gridTemplateColumns:"repeat(5,1fr)",
                    gap:10,marginBottom:12}}>
                    {[
                      {l:"Total Hours Worked",v:periodTotals.totalHrs.toFixed(1)+"h",
                       sub:"vs 194h last period",c:O.amber,trend:"↓"},
                      {l:"Estimated Gross Pay",v:"$"+periodTotals.totalGross.toFixed(0),
                       sub:"$"+(periodTotals.totalOT*EMPS[0]?.rate*0.5||0).toFixed(0)+" OT premium",c:green,trend:"↑"},
                      {l:"Overtime Hours",v:periodTotals.totalOT.toFixed(1)+"h OT",
                       sub:"at 1.5× rate",c:O.amber,trend:"↑"},
                      {l:"Discrepancies",v:periodTotals.discCount+" flagged",
                       sub:"resolve before export",c:periodTotals.discCount>0?O.red:green,trend:""},
                      {l:"Tips + Reimbursements",v:"$"+periodTotals.totalAddl.toFixed(0),
                       sub:"tips $"+periodTotals.totalTips.toFixed(0)+" · mileage $"+periodTotals.totalMileage.toFixed(0),
                       c:"rgba(6,182,212,0.9)",trend:""},
                    ].map(s=>(
                      <div key={s.l} style={{background:O.bg2,border:"1px solid "+O.border,
                        borderRadius:10,padding:"14px",textAlign:"center"}}>
                        <div style={{fontFamily:O.sans,fontWeight:800,fontSize:22,
                          color:s.c,lineHeight:1,marginBottom:5}}>{s.v}</div>
                        <div style={{fontFamily:O.mono,fontSize:7,
                          color:O.textF,letterSpacing:1,textTransform:"uppercase",marginBottom:4}}>
                          {s.l}
                        </div>
                        <div style={{fontFamily:O.mono,fontSize:8,color:O.textD}}>
                          {s.trend&&<span style={{color:s.trend==="↑"?O.green:O.red}}>{s.trend} </span>}
                          {s.sub}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* ── ZONES 3 + 4: LEDGER + CHART ── */}
                  <div style={{display:"grid",gridTemplateColumns:"1.4fr 1fr",gap:12,marginBottom:12}}>

                    {/* ZONE 3: Employee Hours Ledger */}
                    <Card>
                      <SL text="Employee Hours Ledger" color={green}/>
                      <div style={{overflowX:"auto"}}>
                        <div style={{minWidth:580}}>
                          {/* Header */}
                          <div style={{display:"grid",
                            gridTemplateColumns:"120px 48px 46px 52px 64px 58px 58px 64px 64px 68px",
                            padding:"6px 8px",background:O.bg3,
                            borderRadius:"6px 6px 0 0",gap:4}}>
                            {["EMPLOYEE","REG HRS","OT HRS","TOTAL","REG PAY","OT PAY","TIPS","MILEAGE","ADDL","STATUS"].map(h=>(
                              <div key={h} style={{fontFamily:O.mono,fontSize:6,
                                color:O.textF,letterSpacing:h==="TIPS"||h==="MILEAGE"||h==="ADDL"?"rgba(6,182,212,0.8)":O.textF,
                                letterSpacing:1}}>{h}</div>
                            ))}
                          </div>

                          {EMPS.map((e,idx)=>{
                            const p = calcPayroll(e);
                            const sc = p.status==="DISCREPANCY"?O.red:p.status==="VERIFIED"?green:O.amber;
                            return (
                              <div key={e.id} style={{display:"grid",
                                gridTemplateColumns:"120px 48px 46px 52px 64px 58px 58px 64px 64px 68px",
                                padding:"9px 8px",gap:4,
                                borderBottom:"1px solid "+O.border,
                                background:p.hasDisc?"rgba(239,68,68,0.03)":p.verified?"rgba(16,185,129,0.01)":"transparent",
                                alignItems:"center"}}>
                                <div style={{display:"flex",alignItems:"center",gap:6}}>
                                  <Av emp={e} size={22} dark/>
                                  <div style={{minWidth:0}}>
                                    <div style={{fontFamily:O.sans,fontWeight:600,
                                      fontSize:11,color:"#fff",whiteSpace:"nowrap",
                                      overflow:"hidden",textOverflow:"ellipsis"}}>
                                      {e.name.split(" ")[0]}
                                    </div>
                                    <div style={{fontFamily:O.mono,fontSize:7,color:O.textD}}>
                                      ${e.rate}/hr
                                    </div>
                                  </div>
                                </div>
                                <div style={{fontFamily:O.mono,fontSize:10,color:O.text}}>
                                  {p.regHrs.toFixed(1)}h
                                </div>
                                <div>
                                  {p.otHrs>0?(
                                    <div>
                                      <span style={{fontFamily:O.mono,fontSize:10,
                                        color:O.amber,fontWeight:600}}>{p.otHrs.toFixed(1)}h</span>
                                      <div style={{fontFamily:O.mono,fontSize:6,color:O.amber,
                                        background:"rgba(245,158,11,0.12)",borderRadius:2,
                                        padding:"0 3px",display:"inline-block",marginLeft:2}}>OT</div>
                                    </div>
                                  ):(
                                    <span style={{fontFamily:O.mono,fontSize:9,color:O.textF}}>—</span>
                                  )}
                                </div>
                                <div style={{fontFamily:O.mono,fontSize:10,color:"#fff",fontWeight:700}}>
                                  {(p.regHrs+p.otHrs).toFixed(1)}h
                                </div>
                                <div style={{fontFamily:O.mono,fontSize:9,color:O.textD}}>
                                  ${p.regPay.toFixed(0)}
                                </div>
                                <div style={{fontFamily:O.mono,fontSize:9,
                                  color:p.otPay>0?O.amber:O.textF}}>
                                  {p.otPay>0?"$"+p.otPay.toFixed(0):"—"}
                                </div>
                                {/* Tips */}
                                <div style={{fontFamily:O.mono,fontSize:9,
                                  color:p.tipPay>0?"rgba(6,182,212,0.9)":O.textF}}>
                                  {p.tipPay>0?"$"+p.tipPay.toFixed(0):"—"}
                                </div>
                                {/* Mileage */}
                                <div>
                                  {p.mileagePay>0?(
                                    <div>
                                      <div style={{fontFamily:O.mono,fontSize:9,
                                        color:"rgba(6,182,212,0.9)"}}>
                                        {"$"+p.mileagePay.toFixed(0)}
                                      </div>
                                      <div style={{fontFamily:O.mono,fontSize:7,color:O.textF}}>
                                        {p.mileageMiles}mi
                                      </div>
                                    </div>
                                  ):(
                                    <span style={{fontFamily:O.mono,fontSize:9,color:O.textF}}>—</span>
                                  )}
                                </div>
                                {/* Additional total */}
                                <div style={{fontFamily:O.mono,fontSize:9,
                                  color:p.additionalTotal>0?"rgba(6,182,212,0.9)":O.textF}}>
                                  {p.additionalTotal>0?"$"+p.additionalTotal.toFixed(0):"—"}
                                </div>
                                <div style={{fontFamily:O.sans,fontWeight:700,fontSize:12,
                                  color:p.hasDisc?O.red:green}}>
                                  ${p.gross.toFixed(0)}
                                </div>
                                <div style={{fontFamily:O.mono,fontSize:7,color:sc,
                                  background:sc+"15",border:"1px solid "+sc+"30",
                                  borderRadius:3,padding:"2px 5px",
                                  letterSpacing:0.5,textAlign:"center",whiteSpace:"nowrap"}}>
                                  {p.status==="VERIFIED"?"✓ VERF":p.status==="DISCREPANCY"?"⚠ DISC":"PEND"}
                                </div>
                              </div>
                            );
                          })}

                          {/* Totals row */}
                          <div style={{display:"grid",
                            gridTemplateColumns:"130px 55px 55px 60px 72px 68px 76px 70px",
                            padding:"10px 8px",gap:4,
                            background:O.bg3,
                            borderTop:"2px solid "+green+"50",
                            borderRadius:"0 0 6px 6px",alignItems:"center"}}>
                            <div style={{fontFamily:O.mono,fontSize:8,color:green,letterSpacing:1}}>
                              TOTALS
                            </div>
                            <div style={{fontFamily:O.mono,fontSize:10,color:O.amber,fontWeight:600}}>
                              {EMPS.reduce((s,e)=>s+calcPayroll(e).regHrs,0).toFixed(1)}h
                            </div>
                            <div style={{fontFamily:O.mono,fontSize:10,color:O.amber,fontWeight:600}}>
                              {periodTotals.totalOT.toFixed(1)}h
                            </div>
                            <div style={{fontFamily:O.mono,fontSize:10,color:"#fff",fontWeight:700}}>
                              {periodTotals.totalHrs.toFixed(1)}h
                            </div>
                            <div style={{fontFamily:O.mono,fontSize:10,color:O.textD}}>
                              ${EMPS.reduce((s,e)=>s+calcPayroll(e).regPay,0).toFixed(0)}
                            </div>
                            <div style={{fontFamily:O.mono,fontSize:10,color:O.amber}}>
                              ${EMPS.reduce((s,e)=>s+calcPayroll(e).otPay,0).toFixed(0)}
                            </div>
                            <div style={{fontFamily:O.mono,fontSize:10,color:"rgba(6,182,212,0.9)"}}>
                              ${EMPS.reduce((s,e)=>s+calcPayroll(e).tipPay,0).toFixed(0)}
                            </div>
                            <div style={{fontFamily:O.mono,fontSize:10,color:"rgba(6,182,212,0.9)"}}>
                              ${EMPS.reduce((s,e)=>s+calcPayroll(e).mileagePay,0).toFixed(0)}
                            </div>
                            <div style={{fontFamily:O.mono,fontSize:10,color:"rgba(6,182,212,0.9)"}}>
                              ${EMPS.reduce((s,e)=>s+calcPayroll(e).additionalTotal,0).toFixed(0)}
                            </div>
                            <div style={{fontFamily:O.sans,fontWeight:900,fontSize:14,color:green}}>
                              ${periodTotals.totalGross.toFixed(0)}
                            </div>
                            <div/>
                          </div>
                        </div>
                      </div>
                    </Card>

                    {/* ZONE 4: Hours Chart + OT Tracker */}
                    <div style={{display:"flex",flexDirection:"column",gap:10}}>
                      {/* Hours breakdown bars */}
                      <Card>
                        <SL text="Hours Breakdown" color={O.amber}/>
                        <div style={{display:"flex",flexDirection:"column",gap:8}}>
                          {EMPS.map(e=>{
                            const p = calcPayroll(e);
                            const total = p.regHrs+p.otHrs;
                            const regW = Math.round((p.regHrs/maxHrs)*100);
                            const otW  = Math.round((p.otHrs/maxHrs)*100);
                            const ghostW = Math.round((e.ghost/maxHrs)*20);
                            return(
                              <div key={e.id}>
                                <div style={{display:"flex",
                                  justifyContent:"space-between",marginBottom:3}}>
                                  <div style={{display:"flex",alignItems:"center",gap:5}}>
                                    <Av emp={e} size={16} dark/>
                                    <span style={{fontFamily:O.mono,fontSize:8,color:O.textD}}>
                                      {e.name.split(" ")[0]}
                                    </span>
                                  </div>
                                  <span style={{fontFamily:O.mono,fontSize:8,
                                    color:"#fff",fontWeight:600}}>{total.toFixed(1)}h</span>
                                </div>
                                <div style={{display:"flex",height:8,
                                  borderRadius:4,overflow:"hidden",
                                  background:"rgba(255,255,255,0.04)"}}>
                                  <div style={{width:regW+"%",
                                    background:"rgba(245,158,11,0.5)",
                                    transition:"width 0.8s ease"}}/>
                                  {otW>0&&(
                                    <div style={{width:otW+"%",
                                      background:O.amber,
                                      transition:"width 0.8s ease"}}/>
                                  )}
                                  {ghostW>0&&(
                                    <div style={{width:ghostW+"%",
                                      background:O.red,
                                      transition:"width 0.8s ease"}}/>
                                  )}
                                </div>
                              </div>
                            );
                          })}
                          <div style={{display:"flex",gap:10,marginTop:4}}>
                            {[["Regular",O.amber+"80"],["Overtime",O.amber],["Unverified",O.red]].map(([l,c])=>(
                              <div key={l} style={{display:"flex",alignItems:"center",gap:4}}>
                                <div style={{width:8,height:8,borderRadius:2,background:c}}/>
                                <span style={{fontFamily:O.mono,fontSize:7,color:O.textD}}>{l}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </Card>

                      {/* OT Tracker */}
                      <Card style={{flex:1}}>
                        <SL text="Overtime Tracker" color={O.amber}/>
                        <div style={{fontFamily:O.mono,fontSize:7,color:O.textF,
                          letterSpacing:1,marginBottom:8,
                          background:"rgba(245,158,11,0.06)",borderRadius:5,
                          padding:"5px 8px",display:"inline-block"}}>
                          Federal OT threshold: 40h/week
                        </div>
                        <div style={{display:"flex",flexDirection:"column",gap:6}}>
                          {EMPS.map(e=>{
                            const p = calcPayroll(e);
                            const wkHrs = p.regHrs/2+p.otHrs/2;
                            const overAmt = Math.max(0,wkHrs-40);
                            const pct = Math.min(100,Math.round((wkHrs/45)*100));
                            const c = wkHrs>=40?O.red:wkHrs>=37?O.amber:green;
                            return(
                              <div key={e.id} style={{padding:"7px 8px",
                                background:O.bg3,borderRadius:6}}>
                                <div style={{display:"flex",justifyContent:"space-between",
                                  marginBottom:4}}>
                                  <div style={{display:"flex",alignItems:"center",gap:5}}>
                                    <Av emp={e} size={16} dark/>
                                    <span style={{fontFamily:O.mono,fontSize:8,color:O.textD}}>
                                      {e.name.split(" ")[0]}
                                    </span>
                                  </div>
                                  <div style={{display:"flex",alignItems:"center",gap:6}}>
                                    <span style={{fontFamily:O.mono,fontSize:9,color:c,fontWeight:600}}>
                                      {wkHrs.toFixed(1)}h/wk
                                    </span>
                                    {overAmt>0&&(
                                      <span style={{fontFamily:O.mono,fontSize:7,
                                        color:O.red,background:"rgba(239,68,68,0.12)",
                                        border:"1px solid rgba(239,68,68,0.25)",
                                        borderRadius:3,padding:"1px 5px"}}>
                                        +{overAmt.toFixed(1)}h OT
                                      </span>
                                    )}
                                  </div>
                                </div>
                                <div style={{height:4,background:"rgba(255,255,255,0.06)",borderRadius:2}}>
                                  <div style={{height:"100%",width:pct+"%",
                                    background:c,borderRadius:2,transition:"width 0.8s"}}/>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                        <div style={{marginTop:10,fontFamily:O.mono,fontSize:8,color:O.amber,
                          background:"rgba(245,158,11,0.06)",borderRadius:6,
                          padding:"7px 10px",borderLeft:"2px solid "+O.amber}}>
                          OT cost this period: ${EMPS.reduce((s,e)=>s+calcPayroll(e).otPay,0).toFixed(0)} at 1.5× rate
                        </div>
                      </Card>
                    </div>
                  </div>

                  {/* ── ZONE 5: TIMESHEET DETAIL ── */}
                  <Card style={{marginBottom:12}}>
                    <SL text="Timesheet Detail — Mar 16–29, 2025" color={green}/>
                    <div style={{display:"flex",flexDirection:"column",gap:6}}>
                      {EMPS.map(e=>{
                        const p = calcPayroll(e);
                        const rows = getDailyRows(e);
                        const isOpen = expandedEmp===e.id;
                        return(
                          <div key={e.id} style={{background:O.bg3,
                            borderRadius:8,overflow:"hidden",
                            border:"1px solid "+(isOpen?green+"40":O.border)}}>
                            {/* Collapsed header */}
                            <div style={{display:"flex",alignItems:"center",gap:10,
                              padding:"10px 14px",cursor:"pointer"}}
                              onClick={()=>setExpandedEmp(isOpen?null:e.id)}>
                              <Av emp={e} size={24} dark/>
                              <div style={{flex:1}}>
                                <span style={{fontFamily:O.sans,fontWeight:600,
                                  fontSize:13,color:"#fff",marginRight:8}}>{e.name}</span>
                                <span style={{fontFamily:O.mono,fontSize:9,color:O.textD}}>{e.role}</span>
                              </div>
                              <div style={{display:"flex",gap:16,alignItems:"center"}}>
                                <div style={{textAlign:"right"}}>
                                  <div style={{fontFamily:O.mono,fontSize:10,color:O.amber}}>
                                    {(p.regHrs+p.otHrs).toFixed(1)}h total
                                  </div>
                                  <div style={{fontFamily:O.sans,fontWeight:700,
                                    fontSize:13,color:green}}>${p.gross.toFixed(0)}</div>
                                </div>
                                <div style={{fontFamily:O.mono,fontSize:7,
                                  color:p.hasDisc?O.red:green,
                                  background:(p.hasDisc?O.red:green)+"15",
                                  border:"1px solid "+(p.hasDisc?O.red:green)+"30",
                                  borderRadius:3,padding:"2px 7px",letterSpacing:1}}>
                                  {p.hasDisc?"⚠ DISC":"✓ CLEAN"}
                                </div>
                                <span style={{fontFamily:O.mono,fontSize:11,
                                  color:O.textF,transform:isOpen?"rotate(180deg)":"none",
                                  transition:"transform 0.2s",display:"inline-block"}}>▾</span>
                              </div>
                            </div>

                            {/* Expanded daily grid */}
                            {isOpen&&(
                              <div style={{borderTop:"1px solid "+O.border,padding:"12px 14px"}}>
                                <div style={{overflowX:"auto"}}>
                                  <div style={{minWidth:640}}>
                                    {/* Grid header */}
                                    <div style={{display:"grid",
                                      gridTemplateColumns:"36px 60px 60px 70px 48px 72px 52px 80px 1fr",
                                      gap:4,padding:"5px 6px",background:O.bg2,
                                      borderRadius:"4px 4px 0 0",marginBottom:1}}>
                                      {["DAY","DATE","IN","OUT","BREAK","REG HRS","OT","CAM","NOTES"].map(h=>(
                                        <div key={h} style={{fontFamily:O.mono,fontSize:6,
                                          color:O.textF,letterSpacing:1}}>{h}</div>
                                      ))}
                                    </div>
                                    {rows.map((r,ri)=>{
                                      const rowBg = !r.scheduled?"rgba(255,255,255,0.02)":
                                        r.discFlag?"rgba(239,68,68,0.06)":
                                        r.verified?"rgba(16,185,129,0.03)":"rgba(245,158,11,0.03)";
                                      const borderL = !r.scheduled?"rgba(255,255,255,0.06)":
                                        r.discFlag?O.red:r.verified?green:O.amber;
                                      return(
                                        <div key={ri} style={{display:"grid",
                                          gridTemplateColumns:"36px 60px 60px 70px 48px 72px 52px 80px 1fr",
                                          gap:4,padding:"7px 6px",
                                          borderBottom:"1px solid "+O.border,
                                          background:rowBg,borderLeft:"2px solid "+borderL,
                                          alignItems:"center"}}>
                                          <div style={{fontFamily:O.mono,fontSize:8,
                                            color:O.textD}}>{r.day}</div>
                                          <div style={{fontFamily:O.mono,fontSize:8,
                                            color:O.textD}}>{r.date}</div>
                                          <div style={{fontFamily:O.mono,fontSize:9,
                                            color:r.scheduled?"#fff":O.textF}}>
                                            {r.clockIn||"—"}
                                          </div>
                                          <div style={{fontFamily:O.mono,fontSize:9,
                                            color:r.scheduled?"#fff":O.textF}}>
                                            {r.clockOut||"—"}
                                          </div>
                                          <div style={{fontFamily:O.mono,fontSize:9,
                                            color:O.textD}}>
                                            {r.scheduled?"0:30":"—"}
                                          </div>
                                          <div style={{fontFamily:O.mono,fontSize:9,
                                            color:O.amber,fontWeight:600}}>
                                            {r.regHrs>0?r.regHrs+"h":"—"}
                                          </div>
                                          <div style={{fontFamily:O.mono,fontSize:9,
                                            color:r.otHrs>0?O.amber:O.textF}}>
                                            {r.otHrs>0?r.otHrs+"h":"—"}
                                          </div>
                                          <div style={{fontFamily:O.mono,fontSize:8,
                                            color:r.verified?green:O.amber}}>
                                            {r.scheduled?(r.verified?"📷 ✓":"⚠ NO CAM"):"OFF"}
                                          </div>
                                          <div style={{fontFamily:O.mono,fontSize:8,
                                            color:r.discFlag?O.red:r.otHrs>0?O.amber:O.textF}}>
                                            {r.discFlag?"Flag: mismatch":r.otHrs>0?"OT approved":"—"}
                                          </div>
                                        </div>
                                      );
                                    })}
                                  </div>
                                </div>
                                {/* Period subtotals */}
                                <div style={{marginTop:8,display:"flex",gap:14,
                                  padding:"8px 10px",background:O.bg2,borderRadius:6,
                                  flexWrap:"wrap"}}>
                                  {[
                                    {l:"Regular",v:p.regHrs.toFixed(1)+"h",c:O.amber},
                                    {l:"Overtime",v:p.otHrs.toFixed(1)+"h",c:O.amber},
                                    {l:"Unverified",v:e.ghost.toFixed(1)+"h",c:e.ghost>0?O.red:green},
                                    {l:"Tips",v:p.tipPay>0?"$"+p.tipPay.toFixed(0):"—",c:p.tipPay>0?"rgba(6,182,212,0.9)":O.textF},
                                    {l:"Mileage",v:p.mileagePay>0?"$"+p.mileagePay.toFixed(0)+" ("+p.mileageMiles+"mi)":"—",c:p.mileagePay>0?"rgba(6,182,212,0.9)":O.textF},
                                    {l:"Gross Pay",v:"$"+p.gross.toFixed(0),c:green},
                                  ].map(s=>(
                                    <div key={s.l}>
                                      <span style={{fontFamily:O.mono,fontSize:7,
                                        color:O.textF,marginRight:5}}>{s.l}:</span>
                                      <span style={{fontFamily:O.mono,fontSize:9,
                                        color:s.c,fontWeight:600}}>{s.v}</span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </Card>

                  {/* ── ZONES 6 + 7: DISCREPANCIES + EXPORT ── */}
                  <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,marginBottom:12}}>

                    {/* ZONE 6: Discrepancy Resolution */}
                    <Card style={{background:allResolved?"rgba(16,185,129,0.04)":O.bg2,
                      border:"1px solid "+(allResolved?greenB:O.border)}}>
                      <div style={{display:"flex",alignItems:"center",
                        justifyContent:"space-between",marginBottom:12}}>
                        <SL text={"Discrepancies — "+(allResolved?"All Resolved ✓":periodTotals.discCount+" to Resolve")}
                          color={allResolved?green:O.red}/>
                        {!allResolved&&(
                          <div style={{fontFamily:O.mono,fontSize:7,color:O.red,
                            background:"rgba(239,68,68,0.12)",border:"1px solid rgba(239,68,68,0.25)",
                            borderRadius:3,padding:"2px 7px",letterSpacing:1}}>
                            {periodTotals.discCount-resolvedCount} REMAINING
                          </div>
                        )}
                      </div>

                      {allResolved?(
                        <div style={{textAlign:"center",padding:"20px 0"}}>
                          <div style={{fontSize:28,marginBottom:8}}>✅</div>
                          <div style={{fontFamily:O.sans,fontWeight:600,
                            fontSize:14,color:green,marginBottom:4}}>All discrepancies resolved</div>
                          <div style={{fontFamily:O.mono,fontSize:9,color:O.textD}}>
                            Ready to export to payroll
                          </div>
                        </div>
                      ):(
                        <div style={{display:"flex",flexDirection:"column",gap:8}}>
                          {discEmps.map(e=>{
                            const isResolved = resolvedDisc[e.id];
                            return(
                              <div key={e.id}
                                style={{padding:"12px",background:O.bg3,borderRadius:8,
                                  border:"1px solid "+(isResolved?green+"30":"rgba(239,68,68,0.2)"),
                                  borderLeft:"3px solid "+(isResolved?green:O.red),
                                  opacity:isResolved?0.6:1,transition:"all 0.3s"}}>
                                <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:8}}>
                                  <Av emp={e} size={24} dark/>
                                  <div style={{flex:1}}>
                                    <div style={{fontFamily:O.sans,fontWeight:600,
                                      fontSize:12,color:"#fff",marginBottom:1}}>{e.name}</div>
                                    <div style={{fontFamily:O.mono,fontSize:7,color:O.red,
                                      background:"rgba(239,68,68,0.1)",
                                      borderRadius:3,padding:"1px 5px",letterSpacing:1,
                                      display:"inline-block"}}>
                                      CLOCK VS CAMERA MISMATCH
                                    </div>
                                  </div>
                                  {isResolved&&(
                                    <span style={{color:green,fontSize:16}}>✓</span>
                                  )}
                                </div>
                                <div style={{fontFamily:O.mono,fontSize:8,color:O.textD,marginBottom:8}}>
                                  {e.ghost.toFixed(1)}h unverified · ${(e.ghost*e.rate).toFixed(0)} at risk
                                  · Mar 19–20
                                </div>
                                {!isResolved&&(
                                  <div style={{display:"flex",gap:7}}>
                                    <button
                                      onClick={()=>setResolvedDisc({...resolvedDisc,[e.id]:true})}
                                      style={{fontFamily:O.mono,fontSize:8,letterSpacing:1,
                                        padding:"5px 12px",background:"rgba(16,185,129,0.1)",
                                        border:"1px solid rgba(16,185,129,0.25)",
                                        borderRadius:4,color:green,cursor:"pointer"}}>
                                      APPROVE AS-IS
                                    </button>
                                    <button style={{fontFamily:O.mono,fontSize:8,letterSpacing:1,
                                      padding:"5px 12px",background:"rgba(245,158,11,0.08)",
                                      border:"1px solid rgba(245,158,11,0.2)",
                                      borderRadius:4,color:O.amber,cursor:"pointer"}}>
                                      ADJUST HOURS
                                    </button>
                                  </div>
                                )}
                              </div>
                            );
                          })}
                          <div style={{fontFamily:O.mono,fontSize:8,color:O.textD,
                            textAlign:"center",marginTop:4,padding:"6px",
                            background:"rgba(239,68,68,0.04)",borderRadius:5}}>
                            All discrepancies must be resolved before payroll can be exported
                          </div>
                        </div>
                      )}
                    </Card>

                    {/* ZONE 7: Export Center */}
                    <Card>
                      <SL text="Export & Integration Center" color={green}/>

                      {/* Additional Pay Categories Config */}
                      <div style={{marginBottom:14,background:O.bg3,borderRadius:8,padding:"11px 12px",
                        border:"1px solid rgba(6,182,212,0.2)"}}>
                        <div style={{display:"flex",justifyContent:"space-between",
                          alignItems:"center",marginBottom:8}}>
                          <div style={{fontFamily:O.mono,fontSize:7,
                            color:"rgba(6,182,212,0.8)",letterSpacing:"2px"}}>
                            PAY CATEGORIES — THIS PERIOD
                          </div>
                          <button style={{fontFamily:O.mono,fontSize:7,letterSpacing:1,
                            padding:"2px 8px",background:"rgba(6,182,212,0.1)",
                            border:"1px solid rgba(6,182,212,0.25)",borderRadius:3,
                            color:"rgba(6,182,212,0.8)",cursor:"pointer"}}>
                            + ADD CATEGORY
                          </button>
                        </div>
                        {PAY_CATEGORIES.filter(c=>c.enabled).map(cat=>(
                          <div key={cat.id} style={{display:"flex",alignItems:"center",
                            justifyContent:"space-between",padding:"5px 0",
                            borderBottom:"1px solid "+O.border}}>
                            <div style={{display:"flex",alignItems:"center",gap:6}}>
                              <span style={{fontSize:12}}>{cat.icon}</span>
                              <span style={{fontFamily:O.mono,fontSize:9,color:O.textD}}>{cat.label}</span>
                              {cat.rate&&(
                                <span style={{fontFamily:O.mono,fontSize:7,color:O.textF}}>
                                  (${cat.rate}/mi IRS rate)
                                </span>
                              )}
                            </div>
                            <div style={{fontFamily:O.mono,fontSize:9,
                              color:"rgba(6,182,212,0.9)",fontWeight:600}}>
                              ${EMPS.reduce((s,e)=>s+(calcPayroll(e)[cat.id+"Pay"]||0),0).toFixed(0)}
                            </div>
                          </div>
                        ))}
                        <div style={{display:"flex",justifyContent:"space-between",
                          marginTop:7,paddingTop:5}}>
                          <span style={{fontFamily:O.mono,fontSize:8,color:O.textF,letterSpacing:1}}>
                            TOTAL ADDITIONAL
                          </span>
                          <span style={{fontFamily:O.sans,fontWeight:700,fontSize:13,
                            color:"rgba(6,182,212,0.9)"}}>
                            ${periodTotals.totalAddl.toFixed(0)}
                          </span>
                        </div>
                      </div>

                      {/* QuickBooks section */}
                      <div style={{background:greenD,border:"1px solid "+greenB,
                        borderRadius:8,padding:"12px 14px",marginBottom:12}}>
                        <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:8}}>
                          <div style={{width:8,height:8,borderRadius:"50%",
                            background:green,boxShadow:"0 0 6px "+green}}/>
                          <span style={{fontFamily:O.mono,fontSize:9,color:green,letterSpacing:1}}>
                            CONNECTED TO QUICKBOOKS ONLINE
                          </span>
                        </div>
                        <div style={{fontFamily:O.mono,fontSize:8,color:O.textD,marginBottom:10}}>
                          Sunrise Retail Group · Last sync: Mar 15 at 14:32
                        </div>

                        {/* Field mapping preview */}
                        <div style={{background:"rgba(0,0,0,0.2)",borderRadius:6,
                          padding:"8px 10px",marginBottom:10,fontFamily:O.mono,fontSize:8}}>
                          <div style={{color:O.textF,letterSpacing:1,marginBottom:5}}>FIELD MAPPING</div>
                          {[
                            ["Employee Name","→ Employee"],
                            ["Regular Hours","→ Regular Pay Hours"],
                            ["OT Hours","→ Overtime Pay Hours"],
                            ["Gross Pay","→ Estimated Total"],
                          ].map(([a,b])=>(
                            <div key={a} style={{display:"flex",gap:8,
                              marginBottom:3,color:O.textD}}>
                              <span style={{color:O.amber,flex:1}}>{a}</span>
                              <span style={{color:green}}>{b}</span>
                            </div>
                          ))}
                        </div>

                        <button style={{width:"100%",fontFamily:O.mono,fontSize:9,
                          letterSpacing:1,padding:"9px",
                          background:allResolved?green:"rgba(16,185,129,0.2)",
                          border:"none",borderRadius:6,
                          color:allResolved?"#030c14":green+"80",
                          cursor:allResolved?"pointer":"not-allowed",fontWeight:700}}>
                          📤 EXPORT THIS PAY PERIOD TO QBO
                          {!allResolved&&" (resolve discrepancies first)"}
                        </button>
                      </div>

                      {/* Other exports */}
                      <div style={{fontFamily:O.mono,fontSize:7,color:O.textF,
                        letterSpacing:"2px",marginBottom:8}}>OTHER EXPORT FORMATS</div>
                      <div style={{display:"flex",flexDirection:"column",gap:6,marginBottom:12}}>
                        {[
                          {icon:"📊",l:"Export as CSV",sub:"Standard spreadsheet format",c:"#3b82f6"},
                          {icon:"📄",l:"Export as PDF",sub:"Formatted payroll summary report",c:"#a855f7"},
                          {icon:"📋",l:"Copy to Clipboard",sub:"Tab-separated for any platform",c:O.amber},
                        ].map(btn=>(
                          <button key={btn.l}
                            style={{display:"flex",alignItems:"center",gap:10,
                              padding:"9px 12px",background:btn.c+"0d",
                              border:"1px solid "+btn.c+"25",borderRadius:7,
                              cursor:"pointer",textAlign:"left",transition:"all 0.15s"}}
                            onMouseEnter={e=>e.currentTarget.style.background=btn.c+"18"}
                            onMouseLeave={e=>e.currentTarget.style.background=btn.c+"0d"}>
                            <span style={{fontSize:16}}>{btn.icon}</span>
                            <div>
                              <div style={{fontFamily:O.mono,fontSize:9,
                                color:btn.c,letterSpacing:1}}>{btn.l}</div>
                              <div style={{fontFamily:O.mono,fontSize:7,color:O.textD}}>{btn.sub}</div>
                            </div>
                          </button>
                        ))}
                      </div>

                      {/* Platform badges */}
                      <div style={{fontFamily:O.mono,fontSize:7,color:O.textF,
                        letterSpacing:"2px",marginBottom:7}}>COMPATIBLE PLATFORMS</div>
                      <div style={{display:"flex",gap:5,flexWrap:"wrap"}}>
                        {["QuickBooks","ADP","Gusto","Paychex","Square","Rippling","Any CSV"].map(p=>(
                          <div key={p} style={{fontFamily:O.mono,fontSize:7,
                            color:O.textD,background:O.bg3,
                            border:"1px solid "+O.border,
                            borderRadius:4,padding:"3px 7px"}}>
                            {p}
                          </div>
                        ))}
                      </div>
                    </Card>
                  </div>

                  {/* ── ZONE 8: APPROVAL WORKFLOW ── */}
                  <Card>
                    <SL text="Payroll Approval Workflow — Mar 16–29, 2025" color={green}/>

                    {/* Stage pipeline */}
                    <div style={{display:"flex",alignItems:"center",marginBottom:16}}>
                      {["Hours Captured","Discrepancies Resolved","Manager Review","Hours Approved","Exported"].map((stage,i)=>{
                        const done = i===0||(i===1&&allResolved);
                        const active = i===1&&!allResolved;
                        const sc2 = done?green:active?O.amber:O.textF;
                        return(
                          <React.Fragment key={stage}>
                            <div style={{display:"flex",flexDirection:"column",
                              alignItems:"center",flex:1}}>
                              <div style={{width:26,height:26,borderRadius:"50%",
                                background:done?green+"25":active?"rgba(245,158,11,0.15)":"rgba(255,255,255,0.04)",
                                border:"2px solid "+(done?green:active?O.amber:O.border),
                                display:"flex",alignItems:"center",justifyContent:"center",
                                marginBottom:5,flexShrink:0}}>
                                <span style={{fontSize:9,color:sc2}}>
                                  {done?"✓":active?"●":"○"}
                                </span>
                              </div>
                              <span style={{fontFamily:O.mono,fontSize:6,color:sc2,
                                letterSpacing:0.5,textAlign:"center",maxWidth:60,lineHeight:1.3}}>
                                {stage}
                              </span>
                            </div>
                            {i<4&&(
                              <div style={{flex:1,height:2,
                                background:done?green+"50":"rgba(255,255,255,0.06)",
                                marginBottom:16,transition:"background 0.3s"}}/>
                            )}
                          </React.Fragment>
                        );
                      })}
                    </div>

                    {/* Checklist */}
                    <div style={{fontFamily:O.mono,fontSize:7,color:O.textF,
                      letterSpacing:"2px",marginBottom:8}}>PRE-EXPORT CHECKLIST</div>
                    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:6,marginBottom:12}}>
                      {[
                        {ok:true, text:"All employees have clock-in records"},
                        {ok:EMPS.every(e=>e.cam>=80), text:"Camera verification ≥ 80% for all employees"},
                        {ok:allResolved, text:periodTotals.discCount+" discrepancies resolved"},
                        {ok:true, text:"Overtime hours reviewed and approved"},
                        {ok:false,text:"Jordan Mills: missing clock-out Mar 24"},
                        {ok:true, text:"Pay rates verified and current"},
                      ].map((item,i)=>(
                        <div key={i} style={{display:"flex",gap:7,alignItems:"flex-start",
                          padding:"7px 9px",background:O.bg3,borderRadius:6}}>
                          <span style={{color:item.ok?green:O.amber,fontSize:12,flexShrink:0,marginTop:1}}>
                            {item.ok?"✅":"⚠️"}
                          </span>
                          <span style={{fontFamily:O.sans,fontSize:11,color:O.textD,lineHeight:1.4}}>
                            {item.text}
                          </span>
                        </div>
                      ))}
                    </div>

                    {/* History log */}
                    <div style={{borderTop:"1px solid "+O.border,paddingTop:10}}>
                      <div style={{fontFamily:O.mono,fontSize:7,color:O.textF,
                        letterSpacing:"2px",marginBottom:7}}>RECENT PAYROLL ACTIVITY</div>
                      {[
                        {t:"Mar 28 · 14:32",u:"Owner",a:"Viewed payroll summary for period"},
                        {t:"Mar 27 · 09:15",u:"Owner",a:"Approved Marcus Bell OT hours (1.8h)"},
                        {t:"Mar 26 · 16:44",u:"System",a:"Auto-flagged 3 discrepancies from camera scan"},
                        {t:"Mar 15 · 14:32",u:"System",a:"Exported previous period to QuickBooks Online"},
                      ].map((h,i)=>(
                        <div key={i} style={{display:"flex",gap:10,alignItems:"flex-start",
                          padding:"6px 0",borderBottom:i<3?"1px solid "+O.border:"none"}}>
                          <span style={{fontFamily:O.mono,fontSize:7,color:O.textF,
                            width:100,flexShrink:0}}>{h.t}</span>
                          <span style={{fontFamily:O.mono,fontSize:7,color:green,
                            width:44,flexShrink:0}}>{h.u}</span>
                          <span style={{fontFamily:O.mono,fontSize:8,color:O.textD}}>{h.a}</span>
                        </div>
                      ))}
                    </div>
                  </Card>

                </div>
              );
            })()}
          </div>
        )}


                {/* ── SILENT ALERTS (Prompt 12) ── */}
        {tab==="alerts" && (
          <div style={{animation:"fadeUp 0.3s ease",display:"grid",gridTemplateColumns:"1fr 1fr",gap:14}}>
            <div>
              <div style={{fontFamily:O.mono,fontSize:8,color:O.textF,letterSpacing:2,marginBottom:10}}>ALERT LOG</div>
              <div style={{display:"flex",flexDirection:"column",gap:6}}>
                {alerts.map(a => (
                  <div key={a.id} onClick={()=>setAlerts(prev=>prev.map(x=>x.id===a.id?{...x,seen:true}:x))}
                    style={{padding:"11px 14px",background:a.seen?"rgba(255,255,255,0.018)":`${sc(a.sev)}07`,border:`1px solid ${a.seen?O.border:sc(a.sev)+"28"}`,borderLeft:`3px solid ${sc(a.sev)}`,borderRadius:6,cursor:"pointer",opacity:a.seen?0.5:1,transition:"all 0.2s"}}>
                    <div style={{display:"flex",alignItems:"center",gap:8}}>
                      <div style={{width:6,height:6,borderRadius:"50%",background:sc(a.sev),flexShrink:0}}/>
                      <div style={{fontFamily:O.mono,fontSize:9,color:O.textF,width:45}}>{a.time}</div>
                      <OBadge label={a.sev} color={sc(a.sev)} sm/>
                      <div style={{flex:1}}>
                        <div style={{fontFamily:O.sans,fontWeight:600,fontSize:12,color:a.seen?O.textD:O.text}}>{a.msg}</div>
                        <div style={{fontFamily:O.mono,fontSize:8,color:O.textD,marginTop:1}}>{a.detail}</div>
                      </div>
                      {!a.seen && <OBadge label="NEW" color={O.red} sm/>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div style={{background:O.bg2,border:`1px solid ${O.border}`,borderRadius:10,padding:"16px"}}>
              <div style={{fontFamily:O.mono,fontSize:8,color:O.textF,letterSpacing:2,marginBottom:6}}>SILENT ALERT CONFIGURATION</div>
              <div style={{fontFamily:O.sans,fontSize:12,color:O.textD,marginBottom:14,lineHeight:1.6}}>Owner-only. Never visible to employees.</div>
              {[
                {k:"ghost",l:"Ghost Hours Exceeded",d:"Presence <80% of clocked time"},
                {k:"camMiss",l:"Camera Mismatch",d:"No presence within 20min of clock-in"},
                {k:"voids",l:"Register Void Pattern",d:"3+ voids in single shift"},
                {k:"late",l:"Late Arrival Pattern",d:"15+ min late 3+ consecutive shifts"},
                {k:"noShow",l:"No-Show Alert",d:"Failed to clock in for shift"},
                {k:"zone",l:"Restricted Zone Entry",d:"Unauthorized area access"},
              ].map(cfg => (
                <div key={cfg.k} style={{display:"flex",alignItems:"center",gap:10,padding:"10px 0",borderBottom:`1px solid ${O.border}`}}>
                  <div style={{flex:1}}>
                    <div style={{fontFamily:O.sans,fontWeight:600,fontSize:13,color:O.text}}>{cfg.l}</div>
                    <div style={{fontFamily:O.mono,fontSize:9,color:O.textD,marginTop:2}}>{cfg.d}</div>
                  </div>
                  <button onClick={()=>setAConfig(p=>({...p,[cfg.k]:!p[cfg.k]}))}
                    style={{width:42,height:22,borderRadius:11,background:aConfig[cfg.k]?O.amber:"rgba(255,255,255,0.1)",border:"none",cursor:"pointer",position:"relative",transition:"all 0.2s",flexShrink:0}}>
                    <div style={{position:"absolute",top:3,width:16,height:16,borderRadius:"50%",background:"#fff",transition:"all 0.2s",left:aConfig[cfg.k]?23:3,boxShadow:"0 1px 4px rgba(0,0,0,0.3)"}}/>
                  </button>
                </div>
              ))}
              <div style={{marginTop:12,padding:"9px 12px",background:O.amberD,border:`1px solid ${O.amberB}`,borderRadius:6,fontFamily:O.mono,fontSize:8,color:O.amber,letterSpacing:1}}>
                {Object.values(aConfig).filter(Boolean).length}/6 ALERTS ACTIVE · SMS + PUSH
              </div>
            </div>
          </div>
        )}

        {/* ── BENCHMARKS (Prompt 13) ── */}
        {tab==="benchmark" && (
          <div style={{animation:"fadeUp 0.3s ease"}}>
            <div style={{fontFamily:O.mono,fontSize:8,color:O.textF,letterSpacing:2,marginBottom:4}}>COMPARATIVE TEAM INTELLIGENCE</div>
            <div style={{fontFamily:O.sans,fontSize:13,color:O.textD,marginBottom:14}}>Side-by-side analysis across every performance dimension.</div>
            <div style={{background:O.bg2,border:`1px solid ${O.border}`,borderRadius:10,overflow:"hidden",marginBottom:12}}>
              <div style={{display:"grid",gridTemplateColumns:"130px repeat(7,1fr)",borderBottom:`1px solid ${O.border}`,padding:"9px 12px",background:O.bg3}}>
                {["EMPLOYEE","HRS/WK","RELIABILITY","PRODUCTIVITY","PAYROLL ACC.","INCIDENTS","COST/HR","RISK"].map(h => (
                  <div key={h} style={{fontFamily:O.mono,fontSize:7,color:O.amber+"65",letterSpacing:1.5}}>{h}</div>
                ))}
              </div>
              {[...EMPS].sort((a,b)=>b.rel-a.rel).map((e,i) => {
                const pa = Math.round((1-(e.ghost/e.wkHrs))*100);
                return (
                  <div key={e.id} style={{display:"grid",gridTemplateColumns:"130px repeat(7,1fr)",padding:"11px 12px",borderBottom:`1px solid ${O.border}`,background:i===0?"rgba(16,185,129,0.03)":e.risk==="High"?"rgba(239,68,68,0.03)":"transparent",alignItems:"center"}}>
                    <div style={{display:"flex",alignItems:"center",gap:7}}>
                      <Av emp={e} size={26} dark/>
                      <span style={{fontFamily:O.sans,fontWeight:600,fontSize:11,color:O.text}}>{e.name.split(" ")[0]}</span>
                    </div>
                    <div style={{fontFamily:O.mono,fontSize:10,color:O.textD}}>{e.wkHrs}h</div>
                    <div style={{fontFamily:O.mono,fontSize:11,fontWeight:600,color:e.rel>=80?O.green:e.rel>=60?O.amber:O.red}}>{e.rel}%</div>
                    <div style={{fontFamily:O.mono,fontSize:11,fontWeight:600,color:e.prod>=80?O.green:e.prod>=60?O.amber:O.red}}>{e.prod}%</div>
                    <div style={{fontFamily:O.mono,fontSize:11,fontWeight:600,color:pa>=90?O.green:pa>=80?O.amber:O.red}}>{pa}%</div>
                    <div style={{fontFamily:O.mono,fontSize:11,color:e.flags>1?O.red:e.flags>0?O.amber:O.textD}}>{e.flags}</div>
                    <div style={{fontFamily:O.mono,fontSize:10,color:O.textD}}>${e.rate}</div>
                    <OBadge label={e.risk} color={rC(e.risk)} sm/>
                  </div>
                );
              })}
            </div>
            {/* Cost gap */}
            <div style={{background:`linear-gradient(135deg,${O.amberD},${O.redD})`,border:`1px solid ${O.amberB}`,borderRadius:10,padding:"18px"}}>
              <div style={{fontFamily:O.mono,fontSize:8,color:O.amber,letterSpacing:2,marginBottom:12}}>COST GAP: TOP vs BOTTOM PERFORMER</div>
              <div style={{display:"grid",gridTemplateColumns:"1fr auto 1fr",gap:14,alignItems:"center"}}>
                {[...EMPS].sort((a,b)=>b.rel-a.rel).slice(0,1).concat([...EMPS].sort((a,b)=>a.rel-b.rel).slice(0,1)).map((e,i) => (
                  <div key={e.id} style={{background:O.bg3,borderRadius:8,padding:"14px",textAlign:"center"}}>
                    <Av emp={e} size={38} dark/>
                    <div style={{fontFamily:O.sans,fontWeight:700,fontSize:13,color:O.text,marginTop:7}}>{e.name.split(" ")[0]}</div>
                    <div style={{fontFamily:O.mono,fontSize:8,color:i===0?O.green:O.red,marginBottom:5}}>{i===0?"TOP PERFORMER":"BOTTOM PERFORMER"}</div>
                    <div style={{fontFamily:O.sans,fontWeight:700,fontSize:18,color:i===0?O.green:O.red}}>${(e.wkHrs*e.rate).toFixed(0)}/wk</div>
                    <div style={{fontFamily:O.mono,fontSize:8,color:O.textD,marginTop:3}}>{e.ghost}h ghost · {e.rel}% rel.</div>
                  </div>
                ))}
                <div style={{textAlign:"center"}}>
                  <div style={{fontFamily:O.mono,fontSize:8,color:O.textF,marginBottom:4}}>REAL COST GAP</div>
                  <div style={{fontFamily:O.sans,fontWeight:800,fontSize:28,color:O.red}}>
                    +${Math.abs(([...EMPS].sort((a,b)=>b.rel-a.rel)[0].wkHrs*[...EMPS].sort((a,b)=>b.rel-a.rel)[0].rate)-([...EMPS].sort((a,b)=>a.rel-b.rel)[0].wkHrs*[...EMPS].sort((a,b)=>a.rel-b.rel)[0].rate)).toFixed(0)}
                  </div>
                  <div style={{fontFamily:O.mono,fontSize:8,color:O.textD,marginTop:3}}>per week in waste</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── LOCATIONS (Prompt 14) ── */}
        {tab==="locations" && (
          <div style={{animation:"fadeUp 0.3s ease"}}>
            <div style={{fontFamily:O.mono,fontSize:8,color:O.textF,letterSpacing:2,marginBottom:14}}>MULTI-LOCATION COMMAND CENTER</div>
            <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:10,marginBottom:14}}>
              {LOCS.map(loc => (
                <div key={loc.id} onClick={()=>setActiveLoc(loc.id)}
                  style={{background:activeLoc===loc.id?O.amberD:O.bg2,border:`1px solid ${activeLoc===loc.id?O.amber:O.border}`,borderRadius:10,padding:"16px",cursor:"pointer",transition:"all 0.2s",boxShadow:activeLoc===loc.id?`0 0 18px rgba(245,158,11,0.15)`:""}}
                  onMouseEnter={e=>{if(activeLoc!==loc.id)e.currentTarget.style.borderColor=O.amberB;}}
                  onMouseLeave={e=>{if(activeLoc!==loc.id)e.currentTarget.style.borderColor=O.border;}}>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:10}}>
                    <div>
                      <div style={{fontFamily:O.sans,fontWeight:700,fontSize:14,color:O.text}}>{loc.name}</div>
                      <div style={{fontFamily:O.mono,fontSize:9,color:O.textD,marginTop:2}}>{loc.addr}</div>
                    </div>
                    {loc.alerts>0 ? <OBadge label={`${loc.alerts} ALERT`} color={O.red} sm/> : <OBadge label="CLEAR" color={O.green} sm/>}
                  </div>
                  <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:7}}>
                    {[["Staff",`${loc.active}/${loc.staff}`,O.green],["Cameras",loc.cameras,O.amber],["Cost Today",`$${loc.cost}`,O.amber],["Incidents",loc.incidents,loc.incidents>0?O.red:O.green]].map(([l,v,c]) => (
                      <div key={l} style={{background:O.bg3,borderRadius:5,padding:"7px"}}>
                        <div style={{fontFamily:O.mono,fontSize:7,color:O.textF,marginBottom:2}}>{l.toUpperCase()}</div>
                        <div style={{fontFamily:O.sans,fontWeight:700,fontSize:14,color:c}}>{v}</div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
            {LOCS.filter(l=>l.id===activeLoc).map(loc => (
              <div key={loc.id} style={{background:O.bg2,border:`1px solid ${O.border}`,borderRadius:10,padding:"18px"}}>
                <div style={{fontFamily:O.mono,fontSize:8,color:O.amber,letterSpacing:2,marginBottom:12}}>{loc.name.toUpperCase()} — DETAIL</div>
                <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:10,marginBottom:14}}>
                  <OStat label="Active Staff" value={`${loc.active}/${loc.staff}`} color={O.green}/>
                  <OStat label="Cameras" value={loc.cameras} color={O.amber}/>
                  <OStat label="Incidents" value={loc.incidents} color={loc.incidents>0?O.red:O.green}/>
                  <OStat label="Labor Cost" value={`$${loc.cost}`} color={O.amber}/>
                </div>
                {EMPS.slice(0,loc.staff).map(e => (
                  <div key={e.id} style={{display:"flex",alignItems:"center",gap:10,padding:"8px 10px",background:O.bg3,borderRadius:7,marginBottom:6}}>
                    <Av emp={e} size={28} dark/>
                    <div style={{flex:1}}>
                      <div style={{fontFamily:O.sans,fontWeight:600,fontSize:13,color:O.text}}>{e.name}</div>
                      <div style={{fontFamily:O.mono,fontSize:9,color:O.textD}}>{e.role}</div>
                    </div>
                    <OBadge label={e.status} color={e.status==="active"?O.green:e.status==="break"?O.amber:O.textD} sm/>
                    <OBadge label={e.risk} color={rC(e.risk)} sm/>
                  </div>
                ))}
              </div>
            ))}
          </div>
        )}

        {/* ── STAFF ── */}
        {tab==="staff" && (
          <div style={{animation:"fadeUp 0.3s ease"}}>
            <div style={{fontFamily:O.mono,fontSize:8,color:O.textF,letterSpacing:2,marginBottom:14}}>STAFF REGISTRY — {EMPS.length} EMPLOYEES</div>
            <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(260px,1fr))",gap:12}}>
              {EMPS.map(e => (
                <div key={e.id} onClick={()=>goProfile(e.id)}
                  style={{background:O.bg2,border:`1px solid ${rC(e.risk)}18`,borderRadius:10,padding:"16px",cursor:"pointer",transition:"all 0.2s"}}
                  onMouseEnter={ev=>{ev.currentTarget.style.borderColor=rC(e.risk)+"50";ev.currentTarget.style.transform="translateY(-2px)";}}
                  onMouseLeave={ev=>{ev.currentTarget.style.borderColor=rC(e.risk)+"18";ev.currentTarget.style.transform="none";}}>
                  <div style={{display:"flex",gap:12,alignItems:"center",marginBottom:12}}>
                    <Av emp={e} size={42} dark/>
                    <div style={{flex:1}}>
                      <div style={{fontFamily:O.sans,fontWeight:700,fontSize:15,color:O.text}}>{e.name}</div>
                      <div style={{fontFamily:O.mono,fontSize:9,color:O.textD,marginBottom:5}}>{e.role} · {e.dept}</div>
                      <div style={{display:"flex",gap:5,flexWrap:"wrap"}}>
                        <OBadge label={e.status} color={e.status==="active"?O.green:e.status==="break"?O.amber:O.textD} sm/>
                        <OBadge label={`${e.risk} Risk`} color={rC(e.risk)} sm/>
                        {e.ghost>3 && <OBadge label={`${e.ghost}h ghost`} color={O.red} sm/>}
                      </div>
                    </div>
                    <Ring val={e.rel} size={44}/>
                  </div>
                  <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:6}}>
                    {[["CAM",`${e.cam}%`,e.cam<80?O.red:O.green],["PROD",`${e.prod}%`,e.prod<70?O.red:O.green],["COST",`$${(e.wkHrs*e.rate).toFixed(0)}`,O.amber]].map(([l,v,c]) => (
                      <div key={l} style={{background:O.bg3,borderRadius:5,padding:"7px",textAlign:"center"}}>
                        <div style={{fontFamily:O.mono,fontSize:7,color:O.textF,letterSpacing:1}}>{l}</div>
                        <div style={{fontFamily:O.sans,fontWeight:700,fontSize:14,color:c}}>{v}</div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── SCHEDULE ── */}
        {tab==="schedule" && (
          <div style={{animation:"fadeUp 0.3s ease"}}>
            <div style={{fontFamily:O.mono,fontSize:8,color:O.textF,letterSpacing:2,marginBottom:14}}>WEEKLY SCHEDULE — MARCH 24–30</div>
            <div style={{background:O.bg2,border:`1px solid ${O.border}`,borderRadius:10,overflow:"hidden"}}>
              <div style={{display:"grid",gridTemplateColumns:"120px repeat(7,1fr)",borderBottom:`1px solid ${O.border}`}}>
                <div style={{background:O.bg3,borderRight:`1px solid ${O.border}`,padding:"9px 12px"}}>
                  <span style={{fontFamily:O.mono,fontSize:7,color:O.textF,letterSpacing:2}}>EMPLOYEE</span>
                </div>
                {DAYS.map(d => (
                  <div key={d} style={{padding:"9px 6px",borderLeft:`1px solid ${O.border}`,textAlign:"center"}}>
                    <span style={{fontFamily:O.mono,fontSize:8,color:O.amber+"80",letterSpacing:1}}>{d.toUpperCase()}</span>
                  </div>
                ))}
              </div>
              {EMPS.map(e => (
                <div key={e.id} style={{display:"grid",gridTemplateColumns:"120px repeat(7,1fr)",borderBottom:`1px solid ${O.border}`}}>
                  <div style={{background:O.bg3,borderRight:`1px solid ${O.border}`,padding:"9px 12px",display:"flex",alignItems:"center",gap:7}}>
                    <Av emp={e} size={22} dark/>
                    <div style={{fontFamily:O.sans,fontWeight:600,fontSize:11,color:O.text}}>{e.name.split(" ")[0]}</div>
                  </div>
                  {DAYS.map(d => {
                    const shifts = (SCHED[d]||[]).filter(s=>s.eId===e.id);
                    return (
                      <div key={d} style={{borderLeft:`1px solid ${O.border}`,padding:"5px 4px",minHeight:40,display:"flex",flexDirection:"column",gap:3}}>
                        {shifts.map((s,i) => (
                          <div key={i} style={{background:`${e.color}20`,border:`1px solid ${e.color}40`,borderRadius:3,padding:"2px 4px"}}>
                            <span style={{fontFamily:O.mono,fontSize:7,color:e.color}}>{fH(s.s)}–{fH(s.e)}</span>
                          </div>
                        ))}
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── REQUESTS ── */}
        {tab==="requests" && (
          <div style={{animation:"fadeUp 0.3s ease",display:"grid",gridTemplateColumns:"1fr 1fr",gap:14}}>
            <div>
              <div style={{fontFamily:O.mono,fontSize:8,color:O.textF,letterSpacing:2,marginBottom:10}}>SHIFT SWAP REQUESTS</div>
              {SWAPS.map(s => (
                <div key={s.id} style={{background:O.bg2,border:`1px solid ${s.status==="pending"?O.amberB:O.border}`,borderRadius:8,padding:"13px 14px",marginBottom:8}}>
                  <div style={{display:"flex",justifyContent:"space-between",marginBottom:5}}>
                    <div style={{fontFamily:O.sans,fontWeight:600,fontSize:13,color:O.text}}>{s.from} → {s.to}</div>
                    <OBadge label={s.status} color={s.status==="approved"?O.green:s.status==="denied"?O.red:O.amber} sm/>
                  </div>
                  <div style={{fontFamily:O.mono,fontSize:9,color:O.textD,marginBottom:s.status==="pending"?10:0}}>{s.day} · {s.shift}</div>
                  {s.status==="pending" && (
                    <div style={{display:"flex",gap:7}}>
                      <button style={{padding:"4px 12px",background:O.greenD,border:`1px solid ${O.green}30`,borderRadius:4,fontFamily:O.mono,fontSize:8,color:O.green,cursor:"pointer",letterSpacing:1}}>APPROVE</button>
                      <button style={{padding:"4px 12px",background:O.redD,border:`1px solid ${O.red}30`,borderRadius:4,fontFamily:O.mono,fontSize:8,color:O.red,cursor:"pointer",letterSpacing:1}}>DENY</button>
                    </div>
                  )}
                </div>
              ))}
            </div>
            <div>
              <div style={{fontFamily:O.mono,fontSize:8,color:O.textF,letterSpacing:2,marginBottom:10}}>TIME OFF REQUESTS</div>
              {TIMEOFF.map(t => (
                <div key={t.id} style={{background:O.bg2,border:`1px solid ${t.status==="pending"?O.amberB:O.border}`,borderRadius:8,padding:"13px 14px",marginBottom:8}}>
                  <div style={{display:"flex",justifyContent:"space-between",marginBottom:5}}>
                    <div style={{fontFamily:O.sans,fontWeight:600,fontSize:13,color:O.text}}>{t.emp}</div>
                    <OBadge label={t.status} color={t.status==="approved"?O.green:O.amber} sm/>
                  </div>
                  <div style={{fontFamily:O.mono,fontSize:9,color:O.textD,marginBottom:t.status==="pending"?10:0}}>{t.dates} · {t.reason}</div>
                  {t.status==="pending" && (
                    <div style={{display:"flex",gap:7}}>
                      <button style={{padding:"4px 12px",background:O.greenD,border:`1px solid ${O.green}30`,borderRadius:4,fontFamily:O.mono,fontSize:8,color:O.green,cursor:"pointer",letterSpacing:1}}>APPROVE</button>
                      <button style={{padding:"4px 12px",background:O.redD,border:`1px solid ${O.red}30`,borderRadius:4,fontFamily:O.mono,fontSize:8,color:O.red,cursor:"pointer",letterSpacing:1}}>DENY</button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── CAMERAS ── */}
        {tab==="cameras" && (
          <div style={{animation:"fadeUp 0.3s ease"}}>

            {/* Header */}
            <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:20,flexWrap:"wrap",gap:12}}>
              <div>
                <div style={{fontFamily:O.mono,fontSize:8,color:O.textF,letterSpacing:2,marginBottom:3}}>CAMERA MANAGEMENT HUB</div>
                <div style={{fontFamily:O.sans,fontWeight:700,fontSize:22,color:"#fff"}}>Camera Network</div>
                <div style={{fontFamily:O.mono,fontSize:11,color:O.textD,marginTop:4}}>Connect your RTSP streams, ONVIF cameras, or IP camera URLs — view them all here.</div>
              </div>
              <button onClick={()=>setAddingCam(true)}
                style={{fontFamily:O.sans,fontWeight:700,fontSize:13,padding:"10px 22px",
                  background:O.amber,border:"none",borderRadius:8,color:"#030c14",
                  cursor:"pointer",boxShadow:"0 0 16px rgba(245,158,11,0.35)",whiteSpace:"nowrap"}}>
                + Add Camera
              </button>
            </div>

            {/* Add camera form */}
            {addingCam && (
              <div style={{background:"rgba(245,158,11,0.05)",border:"1px solid rgba(245,158,11,0.25)",
                borderRadius:12,padding:"20px",marginBottom:20,animation:"fadeUp 0.2s ease"}}>
                <div style={{fontFamily:O.sans,fontWeight:700,fontSize:15,color:"#fff",marginBottom:16}}>Connect New Camera</div>
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,marginBottom:12}}>
                  <div>
                    <label style={{fontFamily:O.mono,fontSize:8,color:O.textF,letterSpacing:2,display:"block",marginBottom:5}}>CAMERA NAME</label>
                    <input value={newCam.name} onChange={e=>setNewCam(p=>({...p,name:e.target.value}))}
                      placeholder="e.g. Front Door"
                      style={{width:"100%",padding:"9px 12px",background:"rgba(255,255,255,0.05)",
                        border:"1px solid rgba(245,158,11,0.2)",borderRadius:7,
                        fontFamily:O.mono,fontSize:12,color:"#fff",outline:"none"}}/>
                  </div>
                  <div>
                    <label style={{fontFamily:O.mono,fontSize:8,color:O.textF,letterSpacing:2,display:"block",marginBottom:5}}>ZONE / LOCATION</label>
                    <input value={newCam.zone} onChange={e=>setNewCam(p=>({...p,zone:e.target.value}))}
                      placeholder="e.g. Register Area"
                      style={{width:"100%",padding:"9px 12px",background:"rgba(255,255,255,0.05)",
                        border:"1px solid rgba(245,158,11,0.2)",borderRadius:7,
                        fontFamily:O.mono,fontSize:12,color:"#fff",outline:"none"}}/>
                  </div>
                </div>
                <div style={{marginBottom:16}}>
                  <label style={{fontFamily:O.mono,fontSize:8,color:O.textF,letterSpacing:2,display:"block",marginBottom:5}}>STREAM URL (RTSP / HTTP / IP Camera)</label>
                  <input value={newCam.url} onChange={e=>setNewCam(p=>({...p,url:e.target.value}))}
                    placeholder="rtsp://192.168.1.100:554/stream  or  http://camera-ip/video"
                    style={{width:"100%",padding:"9px 12px",background:"rgba(255,255,255,0.05)",
                      border:"1px solid rgba(245,158,11,0.2)",borderRadius:7,
                      fontFamily:O.mono,fontSize:12,color:"#fff",outline:"none"}}/>
                  <div style={{fontFamily:O.mono,fontSize:9,color:O.textD,marginTop:5}}>
                    Supports: RTSP streams · ONVIF · Hikvision · Dahua · Axis · Reolink · Any IP camera URL
                  </div>
                </div>
                <div style={{display:"flex",gap:10}}>
                  <button onClick={()=>{
                    if(newCam.name&&newCam.url){
                      setCamFeeds(p=>[...p,{id:Date.now(),name:newCam.name,zone:newCam.zone||"General",status:"connecting",url:newCam.url,connected:false}]);
                      setNewCam({name:"",zone:"",url:""});
                      setAddingCam(false);
                    }
                  }} style={{padding:"9px 22px",background:O.amber,border:"none",borderRadius:7,
                    fontFamily:O.sans,fontWeight:700,fontSize:13,color:"#030c14",cursor:"pointer"}}>
                    Connect Camera
                  </button>
                  <button onClick={()=>{setAddingCam(false);setNewCam({name:"",zone:"",url:""}); }}
                    style={{padding:"9px 22px",background:"transparent",border:"1px solid rgba(255,255,255,0.1)",
                      borderRadius:7,fontFamily:O.sans,fontSize:13,color:O.textD,cursor:"pointer"}}>
                    Cancel
                  </button>
                </div>
              </div>
            )}

            {/* Camera grid */}
            <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(300px,1fr))",gap:14}}>
              {camFeeds.map(cam => (
                <div key={cam.id} style={{background:O.bg2,border:"1px solid "+O.border,borderRadius:12,overflow:"hidden",transition:"all 0.2s"}}
                  onMouseEnter={e=>e.currentTarget.style.borderColor="rgba(245,158,11,0.3)"}
                  onMouseLeave={e=>e.currentTarget.style.borderColor=O.border}>

                  {/* Camera viewport */}
                  <div style={{position:"relative",background:"#000",aspectRatio:"16/9",display:"flex",alignItems:"center",justifyContent:"center"}}>
                    {cam.url && cam.connected ? (
                      <img src={cam.url} alt={cam.name}
                        style={{width:"100%",height:"100%",objectFit:"cover"}}
                        onError={e=>{e.target.style.display="none";}}/>
                    ) : (
                      <div style={{textAlign:"center",padding:20}}>
                        <div style={{fontSize:32,marginBottom:10,opacity:0.3}}>📷</div>
                        {cam.status==="connecting" ? (
                          <div style={{fontFamily:O.mono,fontSize:10,color:O.amber,letterSpacing:1,animation:"blink 1.2s infinite"}}>CONNECTING...</div>
                        ) : cam.url ? (
                          <div>
                            <div style={{fontFamily:O.mono,fontSize:10,color:O.textD,marginBottom:8}}>Stream URL configured</div>
                            <button onClick={()=>setCamFeeds(p=>p.map(c=>c.id===cam.id?{...c,connected:true}:c))}
                              style={{padding:"5px 14px",background:O.amber,border:"none",borderRadius:5,
                                fontFamily:O.mono,fontSize:9,color:"#030c14",cursor:"pointer",letterSpacing:1}}>
                              CONNECT
                            </button>
                          </div>
                        ) : (
                          <div style={{fontFamily:O.mono,fontSize:10,color:O.textD,letterSpacing:1}}>NO STREAM URL</div>
                        )}
                      </div>
                    )}

                    {/* Status badge */}
                    <div style={{position:"absolute",top:8,right:8,
                      background:cam.status==="live"?"rgba(16,185,129,0.85)":cam.status==="connecting"?"rgba(245,158,11,0.85)":"rgba(239,68,68,0.85)",
                      borderRadius:4,padding:"2px 8px",
                      fontFamily:O.mono,fontSize:8,color:"#fff",letterSpacing:1,textTransform:"uppercase",backdropFilter:"blur(4px)"}}>
                      {cam.status==="live"?"● LIVE":cam.status==="connecting"?"◌ CONNECTING":"○ OFFLINE"}
                    </div>

                    {/* Zone label */}
                    <div style={{position:"absolute",top:8,left:8,
                      background:"rgba(0,0,0,0.65)",borderRadius:4,padding:"2px 8px",
                      fontFamily:O.mono,fontSize:8,color:"rgba(255,255,255,0.7)",backdropFilter:"blur(4px)"}}>
                      {cam.zone}
                    </div>
                  </div>

                  {/* Camera info bar */}
                  <div style={{padding:"10px 14px",display:"flex",alignItems:"center",justifyContent:"space-between"}}>
                    <div>
                      <div style={{fontFamily:O.sans,fontWeight:600,fontSize:14,color:"#fff"}}>{cam.name}</div>
                      {cam.url && <div style={{fontFamily:O.mono,fontSize:9,color:O.textD,marginTop:2,maxWidth:180,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{cam.url}</div>}
                    </div>
                    <button onClick={()=>setCamFeeds(p=>p.filter(c=>c.id!==cam.id))}
                      style={{background:"none",border:"none",color:O.textF,cursor:"pointer",fontSize:16,
                        padding:"4px 6px",borderRadius:4,transition:"color 0.15s"}}
                      onMouseEnter={e=>e.target.style.color=O.red}
                      onMouseLeave={e=>e.target.style.color=O.textF}>
                      ×
                    </button>
                  </div>
                </div>
              ))}

              {/* Empty add slot */}
              <div onClick={()=>setAddingCam(true)}
                style={{background:"rgba(245,158,11,0.03)",border:"1px dashed rgba(245,158,11,0.2)",
                  borderRadius:12,aspectRatio:"16/9",display:"flex",flexDirection:"column",
                  alignItems:"center",justifyContent:"center",cursor:"pointer",transition:"all 0.2s",minHeight:180}}
                onMouseEnter={e=>{e.currentTarget.style.background="rgba(245,158,11,0.07)";e.currentTarget.style.borderColor="rgba(245,158,11,0.45)";}}
                onMouseLeave={e=>{e.currentTarget.style.background="rgba(245,158,11,0.03)";e.currentTarget.style.borderColor="rgba(245,158,11,0.2)";}}>
                <div style={{fontSize:24,marginBottom:8,color:"rgba(245,158,11,0.4)"}}>+</div>
                <div style={{fontFamily:O.mono,fontSize:10,color:"rgba(245,158,11,0.5)",letterSpacing:1}}>ADD CAMERA</div>
              </div>
            </div>

            {/* Integration guide */}
            <div style={{marginTop:24,background:O.bg2,border:"1px solid "+O.border,borderRadius:12,padding:"18px 20px"}}>
              <div style={{fontFamily:O.mono,fontSize:8,color:O.amber,letterSpacing:2,marginBottom:12}}>SUPPORTED SYSTEMS</div>
              <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(150px,1fr))",gap:10}}>
                {["Hikvision","Dahua","Axis","Reolink","Amcrest","Lorex","Nest","Ring","Unifi Protect","Hanwha","Vivotek","Any RTSP"].map(brand=>(
                  <div key={brand} style={{background:O.bg3,borderRadius:6,padding:"7px 10px",
                    fontFamily:O.mono,fontSize:10,color:O.textD,textAlign:"center"}}>
                    {brand}
                  </div>
                ))}
              </div>
              <div style={{fontFamily:O.mono,fontSize:10,color:O.textD,marginTop:12,lineHeight:1.7}}>
                Use your camera's RTSP URL (found in its settings). Format: <span style={{color:O.amber}}>rtsp://username:password@camera-ip:554/stream</span>
                <br/>For cloud cameras, use the HTTP snapshot or MJPEG stream URL from your camera's app.
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
  const [session,setSession] = useState(null);
  const login = (role,emp) => setSession({role,emp});
  const logout = () => setSession(null);
  return (
    <>
      <style>{FONTS}{GCSS}</style>
      {!session && <Login onLogin={login}/>}
      {session?.role==="employee" && <EmpPortal emp={session.emp} onLogout={logout}/>}
      {session?.role==="owner" && <OwnerCmd onLogout={logout}/>}
    </>
  );
}
