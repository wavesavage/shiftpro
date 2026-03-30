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
    {id:"feed",l:"Live Feed"},{id:"roi",l:"ROI Report"},
    {id:"alerts",l:unseen>0?"Alerts ("+unseen+")":"Alerts"},
    {id:"benchmark",l:"Benchmarks"},{id:"locations",l:"Locations"},
    {id:"staff",l:"Staff"},{id:"schedule",l:"Schedule"},
    {id:"requests",l:"Requests"},
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
              style={{fontFamily:O.mono,fontSize:9,letterSpacing:1.5,padding:"7px 12px",background:"none",border:"none",cursor:"pointer",marginBottom:-1,color:tab===t.id?O.amber:O.textF,borderBottom:tab===t.id?`2px solid ${O.amber}`:"2px solid transparent",transition:"all 0.15s",whiteSpace:"nowrap",textTransform:"uppercase"}}>
              {t.l}
            </button>
          ))}
        </div>

        {/* ── COMMAND (overview) ── */}
        {tab==="command" && (
          <div style={{animation:"fadeUp 0.3s ease"}}>
            <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:12,marginBottom:14}}>
              <OStat label="Today's Labor Cost" value={`$${EMPS.reduce((s,e)=>s+e.rate*8,0).toFixed(0)}`} sub="Est. 8hr shifts" color={O.amber}/>
              <OStat label="Ghost Hours (Week)" value={`${totalGhost.toFixed(1)}h`} sub={`$${ghostCost} at risk`} color={O.red}/>
              <OStat label="Avg Reliability" value={`${Math.round(EMPS.reduce((s,e)=>s+e.rel,0)/EMPS.length)}%`} color={O.green}/>
              <OStat label="High Risk Staff" value={EMPS.filter(e=>e.risk==="High").length} sub="Need review" color={O.red}/>
            </div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14,marginBottom:12}}>
              {/* Risk board */}
              <div style={{background:O.bg2,border:`1px solid ${O.border}`,borderRadius:10,padding:"16px"}}>
                <div style={{fontFamily:O.mono,fontSize:8,color:O.textF,letterSpacing:2,marginBottom:12}}>EMPLOYEE RISK BOARD</div>
                {[...EMPS].sort((a,b)=>({High:0,Medium:1,Low:2})[a.risk]-({High:0,Medium:1,Low:2})[b.risk]).map(e => (
                  <div key={e.id} onClick={()=>goProfile(e.id)}
                    style={{display:"flex",alignItems:"center",gap:10,padding:"9px 10px",background:O.bg3,borderRadius:7,marginBottom:6,cursor:"pointer",border:`1px solid ${rC(e.risk)}18`,transition:"all 0.15s"}}
                    onMouseEnter={ev=>ev.currentTarget.style.borderColor=rC(e.risk)+"50"}
                    onMouseLeave={ev=>ev.currentTarget.style.borderColor=rC(e.risk)+"18"}>
                    <Av emp={e} size={30} dark/>
                    <div style={{flex:1}}>
                      <div style={{fontFamily:O.sans,fontWeight:600,fontSize:13,color:O.text}}>{e.name}</div>
                      <div style={{fontFamily:O.mono,fontSize:9,color:O.textD}}>{e.role}</div>
                    </div>
                    <Ring val={e.rel} size={36}/>
                    <OBadge label={e.risk} color={rC(e.risk)} sm/>
                  </div>
                ))}
              </div>
              {/* Monthly chart */}
              <div style={{background:O.bg2,border:`1px solid ${O.border}`,borderRadius:10,padding:"16px"}}>
                <div style={{fontFamily:O.mono,fontSize:8,color:O.textF,letterSpacing:2,marginBottom:12}}>LABOR vs GHOST HOURS (6mo)</div>
                <div style={{display:"flex",alignItems:"flex-end",gap:5,height:88,marginBottom:10}}>
                  {MONTHLY.map((m,i) => {
                    const hP = ((m.h-500)/200)*100;
                    const gP = Math.min((m.ghost/10)*100,100);
                    return (
                      <div key={i} style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",gap:3}}>
                        <div style={{width:"100%",position:"relative",height:`${hP}%`,minHeight:8}}>
                          <div style={{width:"100%",height:"100%",background:i===5?O.amber:O.amberD,border:`1px solid ${i===5?O.amber:O.amberB}`,borderRadius:"3px 3px 0 0"}}/>
                          <div style={{position:"absolute",bottom:0,width:"100%",height:`${gP}%`,background:"rgba(239,68,68,0.45)",borderRadius:"3px 3px 0 0"}}/>
                        </div>
                        <span style={{fontFamily:O.mono,fontSize:7,color:O.textF}}>{m.m}</span>
                      </div>
                    );
                  })}
                </div>
                <div style={{display:"flex",gap:10,fontFamily:O.mono,fontSize:8,color:O.textD,marginBottom:10}}>
                  <span style={{color:O.amber}}>■</span> Labor &nbsp;<span style={{color:O.red}}>■</span> Ghost hrs
                </div>
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
                  {[["This Month","578h",O.amber],["Ghost Cost",`$${(13.9*17).toFixed(0)}`,O.red]].map(([l,v,c]) => (
                    <div key={l} style={{background:O.bg3,borderRadius:6,padding:"10px",textAlign:"center"}}>
                      <div style={{fontFamily:O.mono,fontSize:7,color:O.textF,letterSpacing:1,marginBottom:2}}>{l.toUpperCase()}</div>
                      <div style={{fontFamily:O.sans,fontWeight:700,fontSize:16,color:c}}>{v}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            {/* Mini feed */}
            <div style={{background:O.bg2,border:`1px solid ${O.border}`,borderRadius:10,padding:"16px"}}>
              <div style={{fontFamily:O.mono,fontSize:8,color:O.textF,letterSpacing:2,marginBottom:10}}>LIVE SIGNAL FEED — RECENT</div>
              {FEED.slice(0,4).map(ev => {
                const e = byId(ev.eId);
                return (
                  <div key={ev.id} style={{display:"flex",alignItems:"center",gap:10,padding:"8px 0",borderBottom:`1px solid ${O.border}`}}>
                    <div style={{fontFamily:O.mono,fontSize:9,color:O.textF,width:52}}>{ev.time}</div>
                    <div style={{fontSize:11,color:sC(ev.type),width:14}}>{ev.type==="critical"?"⚠":ev.type==="warning"?"▲":ev.type==="good"?"✓":"●"}</div>
                    {e && <Av emp={e} size={24} dark/>}
                    <div style={{flex:1}}>
                      <span style={{fontFamily:O.sans,fontWeight:600,fontSize:12,color:O.text}}>{e?e.name+" — ":""}{ev.event}</span>
                      <div style={{fontFamily:O.mono,fontSize:9,color:O.textD,marginTop:1}}>{ev.detail}</div>
                    </div>
                    <OBadge label={ev.type} color={sC(ev.type)} sm/>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ── INTELLIGENCE PROFILE (Prompt 7) ── */}
        {tab==="intelligence" && (
          <div style={{animation:"fadeUp 0.3s ease"}}>
            <div style={{fontFamily:O.mono,fontSize:8,color:O.textF,letterSpacing:2,marginBottom:10}}>SELECT EMPLOYEE FOR ANALYSIS</div>
            <div style={{display:"flex",gap:8,marginBottom:16,flexWrap:"wrap"}}>
              {EMPS.map(e => (
                <button key={e.id} onClick={()=>setSelEmp(e.id)}
                  style={{display:"flex",alignItems:"center",gap:8,padding:"7px 12px",background:selEmp===e.id?O.amberD:O.bg2,border:`1px solid ${selEmp===e.id?O.amber:O.border}`,borderRadius:6,cursor:"pointer",transition:"all 0.15s"}}>
                  <Av emp={e} size={24} dark/>
                  <span style={{fontFamily:O.sans,fontWeight:600,fontSize:12,color:selEmp===e.id?O.amber:O.text}}>{e.name.split(" ")[0]}</span>
                </button>
              ))}
            </div>
            {selEmp && (() => {
              const e = byId(selEmp);
              const flags = BFLAGS.filter(f=>f.eId===e.id);
              return (
                <div>
                  <div style={{background:O.bg2,border:`1px solid ${rC(e.risk)}28`,borderRadius:10,padding:"18px",marginBottom:10,display:"flex",gap:16,alignItems:"flex-start"}}>
                    <Av emp={e} size={52} dark/>
                    <div style={{flex:1}}>
                      <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:5,flexWrap:"wrap"}}>
                        <div style={{fontFamily:O.sans,fontWeight:700,fontSize:20,color:O.text}}>{e.name}</div>
                        <OBadge label={`RISK: ${e.risk}`} color={rC(e.risk)}/>
                        <OBadge label={e.status} color={e.status==="active"?O.green:e.status==="break"?O.amber:O.textD}/>
                      </div>
                      <div style={{fontFamily:O.mono,fontSize:9,color:O.textD,marginBottom:12}}>{e.role} · {e.dept} · Hired {e.hired}</div>
                      <div style={{display:"grid",gridTemplateColumns:"repeat(6,1fr)",gap:6}}>
                        {[["Reliability",`${e.rel}%`,e.rel>=80?O.green:e.rel>=60?O.amber:O.red],["Productivity",`${e.prod}%`,e.prod>=80?O.green:e.prod>=60?O.amber:O.red],["Cam Presence",`${e.cam}%`,e.cam>=80?O.green:e.cam>=60?O.amber:O.red],["Ghost Hrs",`${e.ghost}h`,e.ghost>3?O.red:e.ghost>1?O.amber:O.green],["Flags",e.flags,e.flags>1?O.red:e.flags>0?O.amber:O.green],["Wk Cost",`$${(e.wkHrs*e.rate).toFixed(0)}`,O.amber]].map(([l,v,c]) => (
                          <div key={l} style={{background:O.bg3,borderRadius:5,padding:"8px",textAlign:"center"}}>
                            <div style={{fontFamily:O.mono,fontSize:7,color:O.textF,letterSpacing:1,marginBottom:3}}>{l.toUpperCase()}</div>
                            <div style={{fontFamily:O.sans,fontWeight:700,fontSize:14,color:c}}>{v}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                    <Ring val={e.rel} size={60}/>
                  </div>
                  <div style={{background:O.bg2,border:`1px solid ${O.border}`,borderRadius:10,padding:"16px",marginBottom:10}}>
                    <div style={{fontFamily:O.mono,fontSize:8,color:O.textF,letterSpacing:2,marginBottom:12}}>90-DAY BEHAVIORAL METRICS</div>
                    {[["Reliability",e.rel],["Camera Presence",e.cam],["Productivity",e.prod]].map(([label,val]) => (
                      <div key={label} style={{marginBottom:10}}>
                        <div style={{display:"flex",justifyContent:"space-between",marginBottom:4}}>
                          <span style={{fontFamily:O.mono,fontSize:9,color:O.textD}}>{label}</span>
                          <span style={{fontFamily:O.mono,fontSize:9,color:val>=80?O.green:val>=60?O.amber:O.red}}>{val}%</span>
                        </div>
                        <div style={{height:4,background:"rgba(255,255,255,0.05)",borderRadius:2,overflow:"hidden"}}>
                          <div style={{height:"100%",width:`${val}%`,background:val>=80?O.green:val>=60?O.amber:O.red,borderRadius:2,transition:"width 1s ease"}}/>
                        </div>
                      </div>
                    ))}
                  </div>
                  {flags.length>0 && (
                    <div style={{background:O.bg2,border:`1px solid rgba(239,68,68,0.2)`,borderRadius:10,padding:"16px"}}>
                      <div style={{fontFamily:O.mono,fontSize:8,color:O.red,letterSpacing:2,marginBottom:10}}>⚠ BEHAVIORAL FLAGS ({flags.length})</div>
                      {flags.map((f,i) => (
                        <div key={i} style={{display:"flex",gap:10,padding:"9px 0",borderTop:i>0?`1px solid ${O.border}`:"none",alignItems:"flex-start"}}>
                          <div style={{width:3,height:36,background:f.sev==="critical"?O.red:O.amber,borderRadius:2,flexShrink:0,marginTop:3}}/>
                          <div style={{flex:1}}>
                            <div style={{fontFamily:O.sans,fontWeight:600,fontSize:13,color:O.text,marginBottom:2}}>{f.signal}</div>
                            <div style={{fontFamily:O.mono,fontSize:9,color:O.textD}}>{f.desc}</div>
                          </div>
                          <div style={{textAlign:"right"}}>
                            <OBadge label={f.sev} color={f.sev==="critical"?O.red:O.amber} sm/>
                            <div style={{fontFamily:O.mono,fontSize:8,color:f.trend.includes("worsening")?O.red:O.amber,marginTop:3}}>{f.trend}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })()}
            {!selEmp && <div style={{fontFamily:O.mono,fontSize:11,color:O.textF,textAlign:"center",padding:"50px 0"}}>← Select an employee above to view their intelligence profile</div>}
          </div>
        )}

        {/* ── PATTERNS (Prompt 8) ── */}
        {tab==="patterns" && (
          <div style={{animation:"fadeUp 0.3s ease"}}>
            <div style={{fontFamily:O.mono,fontSize:8,color:O.textF,letterSpacing:2,marginBottom:4}}>BEHAVIORAL PATTERN DETECTION ENGINE</div>
            <div style={{fontFamily:O.sans,fontSize:13,color:O.textD,marginBottom:14}}>AI-ranked risk signals across your team, updated every shift.</div>
            <div style={{display:"flex",flexDirection:"column",gap:7,marginBottom:14}}>
              {[...BFLAGS].sort((a,b)=>a.sev==="critical"?-1:1).map((f,i) => {
                const e = byId(f.eId);
                const c = f.sev==="critical"?O.red:O.amber;
                return (
                  <div key={i} style={{background:O.bg2,border:`1px solid ${c}22`,borderLeft:`3px solid ${c}`,borderRadius:8,padding:"13px 16px",display:"flex",alignItems:"center",gap:12}}>
                    <div style={{fontFamily:O.mono,fontSize:10,color:O.textF,width:20,textAlign:"center"}}>{i+1}</div>
                    <Av emp={e} size={32} dark/>
                    <div style={{flex:1}}>
                      <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:3}}>
                        <span style={{fontFamily:O.sans,fontWeight:700,fontSize:13,color:O.text}}>{e.name}</span>
                        <OBadge label={f.signal} color={c} sm/>
                      </div>
                      <div style={{fontFamily:O.mono,fontSize:9,color:O.textD}}>{f.desc}</div>
                    </div>
                    <div style={{textAlign:"right",flexShrink:0}}>
                      <OBadge label={f.sev} color={c}/>
                      <div style={{fontFamily:O.mono,fontSize:8,color:f.trend.includes("worsening")?O.red:O.amber,marginTop:4}}>{f.trend}</div>
                    </div>
                  </div>
                );
              })}
            </div>
            <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:10}}>
              <OStat label="Clock Drift Flags" value={BFLAGS.filter(f=>f.signal.includes("drift")).length} color={O.amber}/>
              <OStat label="Ghost Hour Violators" value={EMPS.filter(e=>e.cam<80).length} color={O.red}/>
              <OStat label="Repeat Offenders" value={EMPS.filter(e=>e.flags>=2).length} color={O.red}/>
            </div>
          </div>
        )}

        {/* ── PAYROLL FRAUD (Prompt 9) ── */}
        {tab==="payroll" && (
          <div style={{animation:"fadeUp 0.3s ease"}}>
            <div style={{fontFamily:O.mono,fontSize:8,color:O.textF,letterSpacing:2,marginBottom:4}}>PAYROLL INTEGRITY ENGINE — FORENSIC AUDIT</div>
            <div style={{fontFamily:O.sans,fontSize:13,color:O.textD,marginBottom:14}}>Clock vs camera verification. Every hour accounted for.</div>
            <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:12,marginBottom:14}}>
              <OStat label="Total Ghost Hrs" value={`${totalGhost.toFixed(1)}h`} sub="Unverified" color={O.red}/>
              <OStat label="Ghost Cost" value={`$${ghostCost}`} sub="Potential overpay" color={O.red}/>
              <OStat label="Payroll Accuracy" value={`${Math.round(100-(totalGhost/EMPS.reduce((s,e)=>s+e.wkHrs,0))*100)}%`} color={O.green}/>
              <OStat label="Staff Flagged" value={EMPS.filter(e=>e.ghost>1).length} sub=">1h unverified" color={O.amber}/>
            </div>
            <div style={{background:O.bg2,border:`1px solid ${O.border}`,borderRadius:10,overflow:"hidden",marginBottom:12}}>
              <div style={{display:"grid",gridTemplateColumns:"140px 70px 70px 70px 80px 70px",borderBottom:`1px solid ${O.border}`,padding:"9px 14px",background:O.bg3}}>
                {["EMPLOYEE","SCHED","CLOCKED","VERIFIED","GHOST","ACCURACY"].map(h => (
                  <div key={h} style={{fontFamily:O.mono,fontSize:7,color:O.amber+"60",letterSpacing:1.5}}>{h}</div>
                ))}
              </div>
              {[...EMPS].sort((a,b)=>b.ghost-a.ghost).map((e) => {
                const acc = Math.round((1-(e.ghost/e.wkHrs))*100);
                return (
                  <div key={e.id} style={{display:"grid",gridTemplateColumns:"140px 70px 70px 70px 80px 70px",padding:"11px 14px",borderBottom:`1px solid ${O.border}`,background:e.ghost>3?"rgba(239,68,68,0.03)":"transparent",alignItems:"center"}}>
                    <div style={{display:"flex",alignItems:"center",gap:7}}>
                      <Av emp={e} size={24} dark/>
                      <span style={{fontFamily:O.sans,fontWeight:600,fontSize:11,color:O.text}}>{e.name.split(" ")[0]}</span>
                    </div>
                    <div style={{fontFamily:O.mono,fontSize:9,color:O.textD}}>{e.wkHrs}h</div>
                    <div style={{fontFamily:O.mono,fontSize:9,color:O.text}}>{e.wkHrs}h</div>
                    <div style={{fontFamily:O.mono,fontSize:9,color:O.green}}>{(e.wkHrs-e.ghost).toFixed(1)}h</div>
                    <div>
                      <div style={{fontFamily:O.mono,fontSize:9,color:e.ghost>3?O.red:e.ghost>1?O.amber:O.textD,fontWeight:e.ghost>3?600:400}}>{e.ghost}h {e.ghost>3&&"⚠"}</div>
                      {e.ghost>0 && <div style={{fontFamily:O.mono,fontSize:8,color:O.textF}}>-${(e.ghost*e.rate).toFixed(0)}</div>}
                    </div>
                    <div>
                      <div style={{fontFamily:O.mono,fontSize:9,color:acc>=90?O.green:acc>=80?O.amber:O.red}}>{acc}%</div>
                      <div style={{height:3,background:"rgba(255,255,255,0.05)",borderRadius:2,overflow:"hidden",width:50,marginTop:2}}>
                        <div style={{height:"100%",width:`${acc}%`,background:acc>=90?O.green:acc>=80?O.amber:O.red,borderRadius:2}}/>
                      </div>
                    </div>
                  </div>
                );
              })}
              <div style={{display:"grid",gridTemplateColumns:"140px 70px 70px 70px 80px 70px",padding:"10px 14px",background:O.bg3,borderTop:`1px solid ${O.amberB}`}}>
                <div style={{fontFamily:O.mono,fontSize:8,color:O.amber,letterSpacing:1}}>TOTALS</div>
                <div style={{fontFamily:O.mono,fontSize:9,color:O.amber}}>{EMPS.reduce((s,e)=>s+e.wkHrs,0)}h</div>
                <div style={{fontFamily:O.mono,fontSize:9,color:O.amber}}>{EMPS.reduce((s,e)=>s+e.wkHrs,0)}h</div>
                <div style={{fontFamily:O.mono,fontSize:9,color:O.green}}>{(EMPS.reduce((s,e)=>s+e.wkHrs,0)-totalGhost).toFixed(1)}h</div>
                <div style={{fontFamily:O.mono,fontSize:9,color:O.red,fontWeight:600}}>{totalGhost.toFixed(1)}h · -${ghostCost}</div>
                <div/>
              </div>
            </div>
          </div>
        )}

        {/* ── LIVE FEED (Prompt 10) ── */}
        {tab==="feed" && (
          <div style={{animation:"fadeUp 0.3s ease"}}>
            <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:12,flexWrap:"wrap",gap:8}}>
              <div>
                <div style={{fontFamily:O.mono,fontSize:8,color:O.textF,letterSpacing:2,marginBottom:2}}>REAL-TIME SHIFT INTELLIGENCE FEED</div>
                <div style={{fontFamily:O.sans,fontSize:13,color:O.textD}}>Every meaningful business event, as it happens.</div>
              </div>
              <div style={{display:"flex",gap:6}}>
                {["all","critical","warning","good"].map(f => (
                  <button key={f} onClick={()=>setFilter(f)}
                    style={{fontFamily:O.mono,fontSize:8,letterSpacing:1,padding:"4px 10px",borderRadius:4,border:`1px solid ${filter===f?O.amberB:O.border}`,background:filter===f?O.amberD:"none",color:filter===f?O.amber:O.textD,cursor:"pointer",textTransform:"uppercase"}}>
                    {f}
                  </button>
                ))}
              </div>
            </div>
            <div style={{background:O.bg2,border:`1px solid ${O.border}`,borderRadius:10,overflow:"hidden"}}>
              <div style={{display:"flex",alignItems:"center",gap:8,padding:"9px 14px",borderBottom:`1px solid ${O.border}`,background:O.bg3}}>
                <div style={{width:6,height:6,borderRadius:"50%",background:O.green}}/>
                <span style={{fontFamily:O.mono,fontSize:9,color:O.green,letterSpacing:1.5}}>LIVE — {now.toLocaleTimeString("en-US",{hour12:false})}</span>
              </div>
              {FEED.filter(ev=>filter==="all"||ev.type===filter).map((ev,i) => {
                const e = byId(ev.eId);
                const c = sC(ev.type);
                return (
                  <div key={ev.id} style={{display:"flex",alignItems:"center",gap:10,padding:"10px 14px",borderBottom:`1px solid ${O.border}`,background:ev.type==="critical"?"rgba(239,68,68,0.03)":ev.type==="good"?"rgba(16,185,129,0.02)":"transparent",animation:`fadeIn 0.3s ease ${i*0.04}s both`}}>
                    <div style={{fontFamily:O.mono,fontSize:9,color:O.textF,width:55,flexShrink:0}}>{ev.time}</div>
                    <div style={{fontSize:11,color:c,width:14}}>{ev.type==="critical"?"⚠":ev.type==="warning"?"▲":ev.type==="good"?"✓":"●"}</div>
                    {e ? <Av emp={e} size={26} dark/> : <div style={{width:26,height:26,borderRadius:6,background:O.bg3,border:`1px solid ${O.border}`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:9,color:O.textF}}>?</div>}
                    <div style={{flex:1}}>
                      <span style={{fontFamily:O.sans,fontWeight:600,fontSize:13,color:O.text}}>{e?e.name+" — ":""}{ev.event}</span>
                      <div style={{fontFamily:O.mono,fontSize:9,color:O.textD,marginTop:2}}>{ev.detail}</div>
                    </div>
                    <OBadge label={ev.type} color={c} sm/>
                    {e && <button onClick={()=>goProfile(e.id)} style={{fontFamily:O.mono,fontSize:7,padding:"3px 8px",background:O.amberD,border:`1px solid ${O.amberB}`,borderRadius:3,color:O.amber,cursor:"pointer",letterSpacing:1}}>PROFILE</button>}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ── ROI REPORT (Prompt 11) ── */}
        {tab==="roi" && (
          <div style={{animation:"fadeUp 0.3s ease"}}>
            <div style={{fontFamily:O.mono,fontSize:8,color:O.textF,letterSpacing:2,marginBottom:14}}>WEEKLY BUSINESS INTELLIGENCE REPORT</div>
            <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:12,marginBottom:14}}>
              <OStat label="Labor Cost Week" value={`$${MONTHLY[5].cost.toLocaleString()}`} sub="vs $9,620 prior wk" color={O.amber}/>
              <OStat label="Ghost Hrs Caught" value="6.2h" sub="$104 recovered" color={O.green}/>
              <OStat label="Incidents Flagged" value={BFLAGS.length} color={O.red}/>
              <OStat label="ShiftPro ROI" value="11×" sub="vs $129/mo sub" color={O.green}/>
            </div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,marginBottom:12}}>
              <div style={{background:O.bg2,border:`1px solid ${O.greenD}`,borderRadius:10,padding:"16px"}}>
                <div style={{fontFamily:O.mono,fontSize:8,color:O.green,letterSpacing:2,marginBottom:10}}>TOP 3 — RELIABILITY</div>
                {[...EMPS].sort((a,b)=>b.rel-a.rel).slice(0,3).map((e,i) => (
                  <div key={e.id} style={{display:"flex",alignItems:"center",gap:10,padding:"8px 0",borderBottom:i<2?`1px solid ${O.border}`:"none"}}>
                    <div style={{fontFamily:O.mono,fontSize:10,color:O.green,width:20}}>#{i+1}</div>
                    <Av emp={e} size={28} dark/>
                    <div style={{flex:1}}>
                      <div style={{fontFamily:O.sans,fontWeight:600,fontSize:13,color:O.text}}>{e.name.split(" ")[0]}</div>
                    </div>
                    <Ring val={e.rel} size={34}/>
                  </div>
                ))}
              </div>
              <div style={{background:O.bg2,border:`1px solid ${O.redD}`,borderRadius:10,padding:"16px"}}>
                <div style={{fontFamily:O.mono,fontSize:8,color:O.red,letterSpacing:2,marginBottom:10}}>FLAGGED FOR REVIEW</div>
                {[...EMPS].sort((a,b)=>a.rel-b.rel).slice(0,3).map((e,i) => (
                  <div key={e.id} style={{display:"flex",alignItems:"center",gap:10,padding:"8px 0",borderBottom:i<2?`1px solid ${O.border}`:"none"}}>
                    <Av emp={e} size={28} dark/>
                    <div style={{flex:1}}>
                      <div style={{fontFamily:O.sans,fontWeight:600,fontSize:13,color:O.text}}>{e.name.split(" ")[0]}</div>
                      <div style={{fontFamily:O.mono,fontSize:9,color:O.textD}}>{e.ghost}h ghost · {e.rel}% rel.</div>
                    </div>
                    <OBadge label={e.risk} color={rC(e.risk)} sm/>
                  </div>
                ))}
              </div>
            </div>
            <div style={{background:`linear-gradient(135deg,${O.amberD},rgba(245,158,11,0.03))`,border:`1px solid ${O.amberB}`,borderRadius:10,padding:"18px"}}>
              <div style={{fontFamily:O.mono,fontSize:8,color:O.amber,letterSpacing:2,marginBottom:12}}>ROI CALCULATOR — THIS MONTH</div>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr 1fr",gap:10,marginBottom:12}}>
                {[["Ghost Hrs Found",`${totalGhost.toFixed(1)}h`,O.amber],["Payroll Saved",`$${ghostCost}`,O.green],["Incidents Caught",alerts.filter(a=>a.sev==="critical").length,O.red],["Subscription","-$129",O.textD]].map(([l,v,c]) => (
                  <div key={l} style={{background:O.bg3,borderRadius:8,padding:"13px",textAlign:"center"}}>
                    <div style={{fontFamily:O.mono,fontSize:7,color:O.textF,letterSpacing:1.5,marginBottom:5}}>{l.toUpperCase()}</div>
                    <div style={{fontFamily:O.sans,fontWeight:800,fontSize:20,color:c}}>{v}</div>
                  </div>
                ))}
              </div>
              <div style={{padding:"11px 14px",background:O.bg3,borderRadius:8,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                <div style={{fontFamily:O.sans,fontWeight:600,fontSize:14,color:O.text}}>Net Monthly Savings</div>
                <div style={{fontFamily:O.sans,fontWeight:800,fontSize:26,color:O.green}}>+${(Number(ghostCost)-129).toFixed(2)}</div>
              </div>
            </div>
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
