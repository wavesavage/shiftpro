"use client";

import React, { useState, useEffect, useRef } from "react";

const FONTS = `@import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800&family=Outfit:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500&display=swap');`;

// Supabase singleton — avoids creating new client on every async call
let _sbClient = null;
const getSB = async () => {
  if(_sbClient) return _sbClient;
  const {createClient} = await import("@supabase/supabase-js");
  _sbClient = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );
  return _sbClient;
};

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
body { background: #f9f8f6; }
::-webkit-scrollbar { width: 4px; }
::-webkit-scrollbar-thumb { background: rgba(0,0,0,0.12); border-radius: 2px; }
@keyframes fadeUp { from { opacity:0; transform:translateY(14px) } to { opacity:1; transform:none } }
@keyframes fadeIn { from { opacity:0 } to { opacity:1 } }
@keyframes blink { 0%,100% { opacity:1 } 50% { opacity:0.2 } }
@keyframes pulse { 0%,100% { opacity:0.4 } 50% { opacity:0.9 } }
@keyframes shimmer { 0% { background-position:-400px 0 } 100% { background-position:400px 0 } }
@keyframes slideInRight { from { transform:translateX(120%); opacity:0 } to { transform:translateX(0); opacity:1 } }
@keyframes slideOutRight { from { transform:translateX(0); opacity:1 } to { transform:translateX(120%); opacity:0 } }
.skeleton { background: linear-gradient(90deg,#e8e6e1 25%,#f0ede8 50%,#e8e6e1 75%); background-size: 400px 100%; animation: shimmer 1.4s infinite; border-radius: 6px; }
`;

// ── TOAST SYSTEM ─────────────────────────────────────
function ToastContainer({ toasts, removeToast }) {
  return (
    <div style={{position:"fixed",bottom:24,right:24,zIndex:9999,display:"flex",flexDirection:"column",gap:8,pointerEvents:"none"}}>
      {toasts.map(t => (
        <div key={t.id}
          style={{
            background:"#fff",
            border:"0.5px solid rgba(0,0,0,0.1)",
            borderLeft:`3px solid ${t.type==="success"?"#1a9e6e":t.type==="error"?"#d94040":"#e07b00"}`,
            borderRadius:8,
            padding:"10px 14px",
            minWidth:240,maxWidth:340,
            boxShadow:"0 4px 16px rgba(0,0,0,0.1)",
            display:"flex",alignItems:"center",gap:10,
            animation:"slideInRight 0.3s ease",
            pointerEvents:"all",
            cursor:"pointer",
          }}
          onClick={()=>removeToast(t.id)}>
          <span style={{fontSize:15,flexShrink:0}}>
            {t.type==="success"?"✓":t.type==="error"?"✕":"ℹ"}
          </span>
          <span style={{fontFamily:"'Outfit',sans-serif",fontSize:13,color:"#1a1a2e",flex:1,lineHeight:1.4}}>{t.message}</span>
        </div>
      ))}
    </div>
  );
}

function useToast() {
  const [toasts, setToasts] = useState([]);
  const toast = (message, type="success") => {
    const id = Date.now();
    setToasts(p=>[...p,{id,message,type}]);
    setTimeout(()=>setToasts(p=>p.filter(t=>t.id!==id)), 3500);
  };
  const removeToast = (id) => setToasts(p=>p.filter(t=>t.id!==id));
  return { toasts, toast, removeToast };
}

// ── SKELETON LOADER ──────────────────────────────────
function SkeletonLoader({ rows=3 }) {
  return (
    <div style={{display:"flex",flexDirection:"column",gap:10,padding:"8px 0"}}>
      {Array.from({length:rows}).map((_,i)=>(
        <div key={i} className="skeleton" style={{height:18,width:i===0?"80%":i===1?"65%":"75%"}}/>
      ))}
    </div>
  );
}

// ══════════════════════════════════════════════════
//  SVG LOGO COMPONENTS
// ══════════════════════════════════════════════════
function ButtonSwirl({size=72, c1="#f59e0b", c2="#f97316", c3="#b45309", accent="#fbbf24"}){
  return (
    <svg width={size} height={size} viewBox="0 0 130 130" xmlns="http://www.w3.org/2000/svg" style={{display:"block",overflow:"visible"}}>
      <defs>
        <linearGradient id={`bs_g1_${c1.replace("#","")}`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor={c1}/><stop offset="100%" stopColor={c2}/>
        </linearGradient>
        <linearGradient id={`bs_accent_${accent.replace("#","")}`} x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor={accent}/><stop offset="100%" stopColor={c1}/>
        </linearGradient>
        <filter id={`bs_glow_${c1.replace("#","")}`} x="-30%" y="-30%" width="160%" height="160%">
          <feGaussianBlur stdDeviation="3" result="blur"/>
          <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
        </filter>
      </defs>
      <g transform="translate(65,65)">
        <circle cx="0" cy="0" r="57" fill="none" stroke={c1} strokeWidth="5" opacity="0.15"/>
        <path d="M -50 14 A 53 53 0 0 1 18 -50 L 11 -33 A 36 36 0 0 0 -33 9 Z" fill={`url(#bs_g1_${c1.replace("#","")})`} opacity="0.95" filter={`url(#bs_glow_${c1.replace("#","")})`}/>
        <path d="M 18 -50 A 53 53 0 0 1 50 16 L 33 11 A 36 36 0 0 0 13 -33 Z" fill={c2} opacity="0.85"/>
        <path d="M 50 16 A 53 53 0 0 1 -50 14 L -33 9 A 36 36 0 0 0 33 11 Z" fill={c3} opacity="0.8"/>
        <path d="M -27 -48 A 55 55 0 0 1 48 -26 L 40 -17 A 44 44 0 0 0 -20 -38 Z" fill={`url(#bs_accent_${accent.replace("#","")})`} opacity="1" filter={`url(#bs_glow_${c1.replace("#","")})`}/>
        <circle cx="0" cy="0" r="20" fill={c1} opacity="0.1"/>
        <circle cx="0" cy="0" r="20" fill="none" stroke={c1} strokeWidth="1.5" opacity="0.5"/>
        <circle cx="0" cy="0" r="9.5" fill={`url(#bs_g1_${c1.replace("#","")})`} filter={`url(#bs_glow_${c1.replace("#","")})`}/>
        <circle cx="0" cy="0" r="4.5" fill="#fff" opacity="0.95"/>
        <circle cx="0" cy="0" r="2.2" fill={c1}/>
      </g>
    </svg>
  );
}

function SwirlMark({size=40}){
  return (
    <svg width={size} height={size} viewBox="0 0 130 130" xmlns="http://www.w3.org/2000/svg" style={{flexShrink:0,overflow:"visible"}}>
      <defs>
        <linearGradient id="sm_g1" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#00d4ff"/><stop offset="100%" stopColor="#0066cc"/>
        </linearGradient>
        <linearGradient id="sm_g2" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#f59e0b"/><stop offset="100%" stopColor="#fbbf24"/>
        </linearGradient>
        <linearGradient id="sm_g3" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#38bdf8"/><stop offset="100%" stopColor="#0ea5e9"/>
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
      </g>
    </svg>
  );
}

function LogoHero(){
  return (
    <svg viewBox="0 0 520 160" xmlns="http://www.w3.org/2000/svg" style={{width:"100%",maxWidth:520,display:"block"}}>
      <defs>
        <linearGradient id="hero_g1" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#00d4ff"/><stop offset="100%" stopColor="#0066cc"/>
        </linearGradient>
        <linearGradient id="hero_g2" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#f59e0b"/><stop offset="100%" stopColor="#fbbf24"/>
        </linearGradient>
        <linearGradient id="hero_g3" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#38bdf8"/><stop offset="100%" stopColor="#0ea5e9"/>
        </linearGradient>
        <filter id="hero_glow" x="-25%" y="-25%" width="150%" height="150%">
          <feGaussianBlur stdDeviation="3.5" result="blur"/>
          <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
        </filter>
      </defs>
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
      </g>
      <text x="165" y="75" fontFamily="'Outfit','Segoe UI',Arial,sans-serif" fontWeight="800" fontSize="66" fill="#ffffff" letterSpacing="-2">Shift</text>
      <text x="302" y="75" fontFamily="'Outfit','Segoe UI',Arial,sans-serif" fontWeight="300" fontSize="66" fill="#ffffff" letterSpacing="-2">Pro</text>
      <text x="395" y="75" fontFamily="'Outfit','Segoe UI',Arial,sans-serif" fontWeight="400" fontSize="66" fill="#00d4ff" fontStyle="italic">.ai</text>
      <line x1="166" y1="88" x2="468" y2="88" stroke="rgba(0,212,255,0.18)" strokeWidth="0.75"/>
      <text x="167" y="108" fontFamily="'JetBrains Mono','Courier New',monospace" fontWeight="400" fontSize="13" fill="rgba(255,255,255,0.45)" letterSpacing="5">AI WORKFORCE INTELLIGENCE</text>
    </svg>
  );
}

function NavLogoWarm(){
  return (
    <div style={{display:"flex",alignItems:"center",gap:10}}>
      <SwirlMark size={34}/>
      <div>
        <div style={{fontFamily:"'Outfit',sans-serif",fontWeight:700,fontSize:18,color:"#1a1a2e",lineHeight:1,letterSpacing:"-0.3px"}}>
          Shift<span style={{fontWeight:300}}>Pro</span><span style={{color:"#e07b00",fontStyle:"italic"}}>.ai</span>
        </div>
        <div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:8,color:"rgba(224,123,0,0.6)",letterSpacing:"2px",marginTop:2}}>WORKFORCE PRO</div>
      </div>
    </div>
  );
}

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

// ── WARM OWNER THEME ────────────────────────────────
const O = {
  bg:"#f9f8f6", bg2:"#ffffff", bg3:"#f4f2ef",
  amber:"#e07b00", amberD:"rgba(224,123,0,0.09)", amberB:"rgba(224,123,0,0.22)",
  red:"#d94040", redD:"rgba(217,64,64,0.09)",
  green:"#1a9e6e", greenD:"rgba(26,158,110,0.09)",
  indigo:"#6366f1", indigoD:"rgba(99,102,241,0.08)",
  blue:"#2563eb", cyan:"#0891b2", purple:"#7c3aed",
  text:"#1a1a2e", textD:"#52525b", textF:"#a1a1aa",
  border:"rgba(0,0,0,0.07)", borderA:"rgba(224,123,0,0.18)",
  sans:"'Outfit',sans-serif", mono:"'JetBrains Mono',monospace",
  shadow:"0 1px 4px rgba(0,0,0,0.06)",
  shadowB:"0 4px 16px rgba(0,0,0,0.10)",
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

const fH = h => h <= 12 ? `${h}am` : `${h-12}pm`;
const byId = id => EMPS.find(e => e.id === id);
const stC = s => ({active:E.green,break:E.yellow,offline:E.textF})[s] || E.textF;

function Av({emp,size=36,dark=false}){
  // Always derive initials from name — never show ?, emoji, or undefined
  const initials = (()=>{
    const n = (emp.name||"").trim();
    const parts = n.split(" ").filter(Boolean);
    if(parts.length>=2) return (parts[0][0]+parts[parts.length-1][0]).toUpperCase();
    if(parts.length===1&&parts[0].length>=2) return parts[0].slice(0,2).toUpperCase();
    // Fall back to email prefix initials
    const emailPfx = (emp.email||"").split("@")[0];
    if(emailPfx.length>=2) return emailPfx.slice(0,2).toUpperCase();
    return "??";
  })();
  const col = emp.color||"#6366f1";
  return (
    <div style={{width:size,height:size,borderRadius:size*.28,background:col,display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"'JetBrains Mono',monospace",fontSize:size*.33,color:"#fff",fontWeight:700,flexShrink:0,letterSpacing:0.5}}>
      {initials}
    </div>
  );
}

// Helper: always get clean 2-letter initials from an emp object
function getInitials(emp){
  const n=(emp.name||"").trim();
  const parts=n.split(" ").filter(Boolean);
  if(parts.length>=2) return (parts[0][0]+parts[parts.length-1][0]).toUpperCase();
  if(parts.length===1&&parts[0].length>=2) return parts[0].slice(0,2).toUpperCase();
  const pfx=(emp.email||"").split("@")[0];
  if(pfx.length>=2) return pfx.slice(0,2).toUpperCase();
  return "??";
}

// ════════════════════════════════════════════════════════════════════
// PAYROLL HELPER — calcWeeklyPayroll
// ════════════════════════════════════════════════════════════════════
// Computes hours, regular pay, OT pay correctly per workweek.
// Per FLSA + Oregon law (ORS 653.261): overtime is 1.5x for hours worked
// over 40 in any single 7-day workweek, NOT over 40 in the whole pay period.
//
// Pairs clock_in / clock_out events chronologically. If a clock-in has no
// matching clock-out (forgotten clock-out, app crash, etc.), it is flagged
// as an "open shift" and reported separately — NOT silently dropped.
//
// Args:
//   events       Array of clock_event rows ({event_type, occurred_at})
//   hourlyRate   Number — employee hourly rate
//   weekStartDay String — "Mon" | "Sun" | "Sat" etc. (3-letter day code)
//   otThreshold  Number — hours per workweek before OT kicks in (default 40)
//
// Returns: {
//   hrs, regHrs, otHrs, regPay, otPay, totalPay,
//   weeks: [{weekStart, hrs, regHrs, otHrs}],
//   openShifts: [{clockedInAt, hoursAgo}]   -- forgotten clock-outs
// }
const DAY_CODE_TO_INDEX = {Sun:0, Mon:1, Tue:2, Wed:3, Thu:4, Fri:5, Sat:6};

function getWeekStartDate(d, weekStartDay){
  // Returns a Date set to 00:00 of the weekStartDay of the workweek containing d
  const startIdx = DAY_CODE_TO_INDEX[weekStartDay] ?? 1; // default Monday
  const day = d.getDay();
  const diff = (day - startIdx + 7) % 7;  // days since most recent weekStart
  const ws = new Date(d);
  ws.setDate(ws.getDate() - diff);
  ws.setHours(0,0,0,0);
  return ws;
}

function calcWeeklyPayroll(events, hourlyRate, weekStartDay = "Mon", otThreshold = 40){
  const rate = parseFloat(hourlyRate) || 0;
  const threshold = parseFloat(otThreshold) || 40;
  const sorted = [...(events||[])].sort((a,b)=>new Date(a.occurred_at)-new Date(b.occurred_at));

  // Per-week minutes accumulator. Key = ISO date string of week start.
  const weekMinutes = {}; // {"2026-04-28": 2400, ...}
  const openShifts = [];

  let openClockIn = null;

  for(const ev of sorted){
    const t = new Date(ev.occurred_at);
    if(ev.event_type === "clock_in"){
      // If there's already an open clock-in, the previous one was abandoned —
      // flag it as an open shift before overwriting.
      if(openClockIn){
        openShifts.push({
          clockedInAt: openClockIn,
          abandonedAt: t,
          reason: "Started a new clock-in without clocking out",
        });
      }
      openClockIn = t;
    }else if(ev.event_type === "clock_out" && openClockIn){
      // Allocate this shift's minutes to the workweek(s) it falls in.
      // Most shifts are intra-week, but a midnight-crossing shift on a Sun→Mon
      // boundary may need to be split. Handle that.
      let cursor = new Date(openClockIn);
      const end = t;
      while(cursor < end){
        const wkStart = getWeekStartDate(cursor, weekStartDay);
        const nextWkStart = new Date(wkStart);
        nextWkStart.setDate(nextWkStart.getDate() + 7);
        const segEnd = end < nextWkStart ? end : nextWkStart;
        const mins = (segEnd - cursor) / 60000;
        const key = wkStart.toISOString().slice(0,10);
        weekMinutes[key] = (weekMinutes[key] || 0) + mins;
        cursor = segEnd;
      }
      openClockIn = null;
    }
    // clock_out without a matching clock_in is silently ignored (would be a data error)
  }

  // If there's still an open clock-in at the end, it's a forgotten clock-out
  if(openClockIn){
    const hoursAgo = (Date.now() - openClockIn.getTime()) / 3600000;
    openShifts.push({
      clockedInAt: openClockIn,
      hoursAgo: Math.round(hoursAgo * 10) / 10,
      reason: "Clocked in but never clocked out",
    });
  }

  // Per-week regular vs OT split
  let totalHrs = 0, totalReg = 0, totalOt = 0;
  const weeks = [];
  Object.keys(weekMinutes).sort().forEach(weekStart => {
    const wkHrs = weekMinutes[weekStart] / 60;
    const wkReg = Math.min(wkHrs, threshold);
    const wkOt  = Math.max(wkHrs - threshold, 0);
    totalHrs += wkHrs; totalReg += wkReg; totalOt += wkOt;
    weeks.push({weekStart, hrs: wkHrs, regHrs: wkReg, otHrs: wkOt});
  });

  const regPay = totalReg * rate;
  const otPay  = totalOt  * rate * 1.5;

  return {
    hrs: totalHrs,
    regHrs: totalReg,
    otHrs: totalOt,
    regPay,
    otPay,
    totalPay: regPay + otPay,
    weeks,
    openShifts,
  };
}

function EBadge({label,color}){
  return (
    <span style={{fontFamily:"'Nunito',sans-serif",fontSize:11,color,background:color+"18",border:`1px solid ${color}28`,padding:"2px 10px",borderRadius:20,fontWeight:600,whiteSpace:"nowrap"}}>
      {label}
    </span>
  );
}

function Ring({val,size=48,color}){
  const r = (size-6)/2;
  const circ = 2 * Math.PI * r;
  const d = (val/100) * circ;
  const c = color || (val>=80 ? E.green : val>=60 ? "#f59e0b" : "#ef4444");
  return (
    <svg width={size} height={size} style={{transform:"rotate(-90deg)",flexShrink:0}}>
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="rgba(0,0,0,0.06)" strokeWidth={4}/>
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={c} strokeWidth={4}
        strokeDasharray={`${d} ${circ-d}`} strokeLinecap="round"
        style={{transition:"stroke-dasharray 1s ease"}}/>
      <text x={size/2} y={size/2+1} textAnchor="middle" dominantBaseline="middle"
        style={{transform:`rotate(90deg)`,transformOrigin:`${size/2}px ${size/2}px`,fontFamily:"'JetBrains Mono',monospace",fontSize:size*.22,fill:c,fontWeight:500}}>
        {val}
      </text>
    </svg>
  );
}

// ── OWNER STAT CARD ──────────────────────────────────
function StatCard({label,value,sub,color,icon}){
  return (
    <div style={{background:O.bg2,border:`1px solid ${O.border}`,borderRadius:12,padding:"16px 18px",boxShadow:O.shadow,flex:1}}>
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:8}}>
        <div style={{fontFamily:O.mono,fontSize:9,color:O.textF,letterSpacing:"1.5px",textTransform:"uppercase"}}>{label}</div>
        {icon&&<span style={{fontSize:16}}>{icon}</span>}
      </div>
      <div style={{fontFamily:O.sans,fontWeight:700,fontSize:28,color:color||O.text,lineHeight:1,marginBottom:4}}>{value}</div>
      {sub&&<div style={{fontFamily:O.mono,fontSize:9,color:O.textF}}>{sub}</div>}
    </div>
  );
}

// ── OWNER BADGE ──────────────────────────────────────
function OBadge({label,color,sm}){
  return (
    <span style={{fontFamily:O.mono,fontSize:sm?8:9,color,background:color+"18",border:`1px solid ${color}35`,padding:sm?"1px 5px":"2px 8px",borderRadius:4,letterSpacing:1,textTransform:"uppercase",whiteSpace:"nowrap"}}>
      {label}
    </span>
  );
}

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
  const red    = "#ef4444";

  const doOwnerLogin = async () => {
    if(!email||!pass){setErr("Please enter your email and password.");return;}
    setBusy(true); setErr("");
    try{
      const sb = await getSB();
      const {data,error} = await sb.auth.signInWithPassword({email,password:pass});
      if(error) throw error;
      let profile = null;
      try{ const {data:p}=await sb.from("users").select("*").eq("id",data.user.id).single(); profile=p; }catch(e){}
      const emp = {
        id: data.user.id,
        name: profile?(profile.first_name+" "+profile.last_name):data.user.email.split("@")[0],
        first: profile?.first_name||data.user.email.split("@")[0],
        role: profile?.role||"Manager",
        dept: profile?.department||"",
        rate: parseFloat(profile?.hourly_rate)||0,
        avatar: profile?.avatar_initials||data.user.email[0].toUpperCase(),
        color: profile?.avatar_color||"#f59e0b",
        email: data.user.email,
        status:"active", hired:profile?.hire_date||"",
        wkHrs:0, moHrs:0, ot:0, cam:100, prod:100, rel:100,
        flags:0, streak:0, shifts:0, risk:"Low", ghost:0,
        orgId: profile?.org_id||null,
        locId: profile?.location_id||null,
        appRole: profile?.app_role||"owner",
      };
      // Cache immediately so refresh works even if profile query fails next time
      try{ localStorage.setItem("shiftpro_cached_emp_"+data.user.id, JSON.stringify(emp)); }catch(e){}
      onLogin("owner", emp);
    }catch(e){
      setErr(e.message||"Sign in failed. Check your email and password.");
    }finally{setBusy(false);}
  };

  const doEmpLogin = async () => {
    if(!email||!pass){setErr("Please enter your email and password.");return;}
    setBusy(true); setErr("");
    try{
      const sb = await getSB();
      const {data,error} = await sb.auth.signInWithPassword({email,password:pass});
      if(error) throw error;

      // Wait briefly for session to fully propagate, then try profile fetch
      let profile = null;
      for(let attempt=0; attempt<3; attempt++){
        if(attempt>0) await new Promise(r=>setTimeout(r,600));
        const {data:p} = await sb.from("users").select("*").eq("id",data.user.id).single();
        if(p){ profile=p; break; }
      }

      // Fall back to localStorage cache if Supabase still returns nothing
      if(!profile){
        try{
          const cached=localStorage.getItem("shiftpro_cached_emp_"+data.user.id);
          if(cached){ profile=JSON.parse(cached); profile._fromCache=true; }
        }catch(e){}
      }

      if(!profile) throw new Error("Profile not found. Contact your manager.");

      // Ensure employee is marked active on every login
      if(!profile._fromCache){
        try{
          const {data:{session:ss}}=await sb.auth.getSession();
          await fetch("/api/user",{
            method:"PATCH",
            headers:{"Content-Type":"application/json",...(ss?.access_token?{"Authorization":"Bearer "+ss.access_token}:{})},
            body:JSON.stringify({userId:data.user.id,updates:{status:"active"}}),
          });
        }catch(e){}
      }

      const empRole = profile.app_role==="owner"||profile.app_role==="manager"?"owner":"employee";
      const emp = {
        id:profile.id||data.user.id,
        name:(profile.first_name||"")+" "+(profile.last_name||""),
        first:profile.first_name||data.user.email.split("@")[0],
        nick:profile.preferred_name||"",
        role:profile.role&&profile.role!=="Employee"?profile.role:"",
        dept:profile.department||"",
        rate:parseFloat(profile.hourly_rate)||15,
        avatar:profile.avatar_initials||(profile.first_name&&profile.last_name?(profile.first_name[0]+profile.last_name[0]).toUpperCase():profile.first_name?profile.first_name.slice(0,2).toUpperCase():data.user.email[0].toUpperCase()),
        color:profile.avatar_color||"#6366f1",
        email:data.user.email,
        status:"active", hired:profile.hire_date||"",
        wkHrs:0, moHrs:0, ot:0,
        cam:100, prod:100, rel:100,
        flags:0, streak:0, shifts:0, risk:"Low", ghost:0,
        orgId:profile.org_id||null,
        locId:profile.location_id||null,
        appRole:profile.app_role||"employee",
      };
      // Cache with user-specific key
      try{ localStorage.setItem("shiftpro_cached_emp_"+emp.id, JSON.stringify(emp)); }catch(e){}
      onLogin(empRole, emp);
    }catch(e){
      setErr(e.message||"Sign in failed. Check your email and password.");
    }finally{setBusy(false);}
  };

  const doReset = async () => {
    if(!email){setErr("Enter your email first.");return;}
    setBusy(true); setErr("");
    try{
      const sb = await getSB();
      await sb.auth.resetPasswordForEmail(email,{redirectTo:"https://shiftpro.ai/"});
      setResetSent(true);
    }catch(e){
      setErr("Could not send reset email. Try again.");
    }finally{setBusy(false);}
  };

  return(
    <div style={{minHeight:"100vh",background:"linear-gradient(135deg,#0f0c29,#302b63,#24243e)",display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"'Outfit',sans-serif",padding:"20px",position:"relative"}}>
      <div style={{position:"absolute",inset:0,backgroundImage:"radial-gradient(rgba(99,102,241,0.13) 1px,transparent 1px)",backgroundSize:"32px 32px",pointerEvents:"none"}}/>
      <div style={{position:"relative",width:"100%",maxWidth:460,padding:"0 16px",animation:"fadeUp 0.5s ease"}}>
        <div style={{textAlign:"center",marginBottom:32}}>
          <div style={{display:"flex",justifyContent:"center",marginBottom:16,filter:"drop-shadow(0 16px 40px rgba(0,180,255,0.4))"}}>
            <LogoHero/>
          </div>
          <div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:10,color:"rgba(255,255,255,0.25)",letterSpacing:"4px"}}>SELECT YOUR PORTAL TO CONTINUE</div>
        </div>

        {!mode&&(
          <div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14}}>
              <button onClick={()=>setMode("owner")} style={{padding:"28px 18px",background:"rgba(245,158,11,0.05)",border:"1.5px solid rgba(245,158,11,0.35)",borderRadius:18,cursor:"pointer",textAlign:"center",transition:"all 0.25s",display:"flex",flexDirection:"column",alignItems:"center",gap:14}}
                onMouseEnter={e=>{e.currentTarget.style.transform="translateY(-5px)";e.currentTarget.style.background="rgba(245,158,11,0.1)";e.currentTarget.style.boxShadow="0 12px 40px rgba(245,158,11,0.2)";}}
                onMouseLeave={e=>{e.currentTarget.style.transform="none";e.currentTarget.style.background="rgba(245,158,11,0.05)";e.currentTarget.style.boxShadow="none";}}>
                <div style={{filter:"drop-shadow(0 0 18px rgba(245,158,11,0.6))"}}>
                  <ButtonSwirl size={72} c1="#f59e0b" c2="#f97316" c3="#b45309" accent="#fde68a"/>
                </div>
                <div>
                  <div style={{fontFamily:"'Outfit',sans-serif",fontWeight:800,fontSize:16,color:"#fff",marginBottom:5}}>Owner / Manager</div>
                  <div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:9,color:"rgba(245,158,11,0.65)",letterSpacing:"1.5px"}}>OPERATIONS CENTER</div>
                </div>
              </button>
              <button onClick={()=>setMode("employee")} style={{padding:"28px 18px",background:"rgba(16,185,129,0.05)",border:"1.5px solid rgba(16,185,129,0.35)",borderRadius:18,cursor:"pointer",textAlign:"center",transition:"all 0.25s",display:"flex",flexDirection:"column",alignItems:"center",gap:14}}
                onMouseEnter={e=>{e.currentTarget.style.transform="translateY(-5px)";e.currentTarget.style.background="rgba(16,185,129,0.1)";e.currentTarget.style.boxShadow="0 12px 40px rgba(16,185,129,0.2)";}}
                onMouseLeave={e=>{e.currentTarget.style.transform="none";e.currentTarget.style.background="rgba(16,185,129,0.05)";e.currentTarget.style.boxShadow="none";}}>
                <div style={{filter:"drop-shadow(0 0 18px rgba(16,185,129,0.6))"}}>
                  <ButtonSwirl size={72} c1="#10b981" c2="#059669" c3="#065f46" accent="#6ee7b7"/>
                </div>
                <div>
                  <div style={{fontFamily:"'Outfit',sans-serif",fontWeight:800,fontSize:16,color:"#fff",marginBottom:5}}>I'm an Employee</div>
                  <div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:9,color:"rgba(16,185,129,0.65)",letterSpacing:"1.5px"}}>MY SCHEDULE & TIME CLOCK</div>
                  <div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:8,color:"rgba(16,185,129,0.4)",letterSpacing:"1px",marginTop:4}}> from  INVITED STAFF CLICK HERE</div>
                </div>
              </button>
            </div>
            <div style={{textAlign:"center",marginTop:20}}>
              <span style={{fontFamily:"'JetBrains Mono',monospace",fontSize:9,color:"rgba(255,255,255,0.2)",letterSpacing:1}}>New business?{" "}</span>
              <a href="/signup" style={{fontFamily:"'JetBrains Mono',monospace",fontSize:9,color:"rgba(245,158,11,0.5)",letterSpacing:1,textDecoration:"none"}}
                onMouseEnter={e=>e.target.style.color="rgba(245,158,11,0.9)"}
                onMouseLeave={e=>e.target.style.color="rgba(245,158,11,0.5)"}>
                Create your account  to 
              </a>
            </div>
          </div>
        )}

        {mode==="owner"&&(
          <div style={{background:"rgba(9,14,26,0.96)",border:"1px solid "+amberB,borderRadius:16,padding:"28px",boxShadow:"0 20px 60px rgba(0,0,0,0.5)"}}>
            <button onClick={()=>{setMode(null);setErr("");setEmail("");setPass("");setShowReset(false);setResetSent(false);}} style={{background:"none",border:"none",color:"rgba(255,255,255,0.3)",fontFamily:"'JetBrains Mono',monospace",fontSize:10,letterSpacing:1,cursor:"pointer",marginBottom:18}}> back  BACK</button>
            {!showReset?(
              <div>
                <div style={{fontFamily:"'Outfit',sans-serif",fontWeight:800,fontSize:22,color:"#fff",marginBottom:3}}>Owner / Manager</div>
                <div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:10,color:"rgba(245,158,11,0.6)",marginBottom:22,letterSpacing:1}}>OPERATIONS CENTER LOGIN</div>
                {[{l:"EMAIL",v:email,fn:setEmail,t:"email",ph:"you@yourbusiness.com"},{l:"PASSWORD",v:pass,fn:setPass,t:"password",ph:"••••••••"}].map(f=>(
                  <div key={f.l} style={{marginBottom:14}}>
                    <label style={{fontFamily:"'JetBrains Mono',monospace",fontSize:9,color:"rgba(255,255,255,0.45)",letterSpacing:"2px",display:"block",marginBottom:6}}>{f.l}</label>
                    <input value={f.v} onChange={e=>{f.fn(e.target.value);setErr("");}} onKeyDown={e=>e.key==="Enter"&&doOwnerLogin()} type={f.t} placeholder={f.ph}
                      style={{width:"100%",padding:"12px 14px",background:"rgba(255,255,255,0.06)",border:"1px solid rgba(245,158,11,0.35)",borderRadius:9,fontFamily:"'JetBrains Mono',monospace",fontSize:14,color:"#fff",outline:"none",boxSizing:"border-box"}}/>
                  </div>
                ))}
                {err&&<div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:10,color:red,marginBottom:12,padding:"8px 10px",background:"rgba(239,68,68,0.07)",border:"1px solid rgba(239,68,68,0.2)",borderRadius:6}}>{err}</div>}
                <button onClick={doOwnerLogin} style={{width:"100%",padding:"14px",background:busy?"rgba(245,158,11,0.5)":"linear-gradient(135deg,#f59e0b,#f97316)",border:"none",borderRadius:10,fontFamily:"'Outfit',sans-serif",fontWeight:700,fontSize:15,color:"#030c14",cursor:busy?"not-allowed":"pointer",boxShadow:"0 4px 20px rgba(245,158,11,0.3)",marginBottom:12}}>
                  {busy?"Signing in…":"Enter Command Center  to "}
                </button>
                <div style={{textAlign:"center"}}>
                  <button onClick={()=>{setShowReset(true);setErr("");}} style={{background:"none",border:"none",fontFamily:"'JetBrains Mono',monospace",fontSize:10,color:"rgba(245,158,11,0.5)",cursor:"pointer",textDecoration:"underline"}}>Forgot password?</button>
                </div>
              </div>
            ):(
              <div>
                <div style={{fontFamily:"'Outfit',sans-serif",fontWeight:700,fontSize:18,color:"#fff",marginBottom:4}}>{resetSent?"Check your email ✉️":"Reset your password"}</div>
                {!resetSent?(
                  <div>
                    <div style={{marginBottom:14}}>
                      <label style={{fontFamily:"'JetBrains Mono',monospace",fontSize:9,color:"rgba(255,255,255,0.45)",letterSpacing:"2px",display:"block",marginBottom:6}}>EMAIL</label>
                      <input value={email} onChange={e=>{setEmail(e.target.value);setErr("");}} onKeyDown={e=>e.key==="Enter"&&doReset()} type="email" placeholder="you@yourbusiness.com"
                        style={{width:"100%",padding:"12px 14px",background:"rgba(255,255,255,0.06)",border:"1px solid rgba(245,158,11,0.35)",borderRadius:9,fontFamily:"'JetBrains Mono',monospace",fontSize:14,color:"#fff",outline:"none",boxSizing:"border-box"}}/>
                    </div>
                    {err&&<div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:10,color:red,marginBottom:12}}>{err}</div>}
                    <button onClick={doReset} style={{width:"100%",padding:"13px",background:"rgba(245,158,11,0.15)",border:"1px solid "+amberB,borderRadius:9,fontFamily:"'Outfit',sans-serif",fontWeight:700,fontSize:14,color:amber,cursor:"pointer",marginBottom:10}}>
                      {busy?"Sending…":"Send Reset Link  to "}
                    </button>
                    <button onClick={()=>{setShowReset(false);setErr("");}} style={{width:"100%",padding:"10px",background:"none",border:"none",fontFamily:"'JetBrains Mono',monospace",fontSize:10,color:"rgba(255,255,255,0.3)",cursor:"pointer"}}> back  Back to sign in</button>
                  </div>
                ):(
                  <div>
                    <div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:11,color:"rgba(255,255,255,0.5)",lineHeight:1.7,marginBottom:20}}>
                      We sent a reset link to <span style={{color:amber}}>{email}</span>. Check your inbox and spam folder.
                    </div>
                    <button onClick={()=>{setShowReset(false);setResetSent(false);setErr("");}} style={{width:"100%",padding:"13px",background:"linear-gradient(135deg,#f59e0b,#f97316)",border:"none",borderRadius:9,fontFamily:"'Outfit',sans-serif",fontWeight:700,fontSize:14,color:"#030c14",cursor:"pointer"}}>Back to Sign In</button>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {mode==="employee"&&(
          <div style={{background:"rgba(255,255,255,0.98)",borderRadius:16,padding:"28px",boxShadow:"0 20px 60px rgba(0,0,0,0.4)"}}>
            <button onClick={()=>{setMode(null);setErr("");setEmail("");setPass("");}} style={{background:"none",border:"none",color:"#9ca3af",fontFamily:"'Nunito',sans-serif",fontSize:13,cursor:"pointer",marginBottom:16,display:"flex",alignItems:"center",gap:5}}> back  Back</button>
            <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:20}}>
              <div style={{width:44,height:44,borderRadius:12,flexShrink:0,background:"linear-gradient(135deg,#6366f1,#8b5cf6)",display:"flex",alignItems:"center",justifyContent:"center"}}><span style={{fontSize:22}}>👋</span></div>
              <div>
                <div style={{fontFamily:"'Nunito',sans-serif",fontWeight:800,fontSize:20,color:"#1e1b4b",marginBottom:2}}>Welcome back!</div>
                <div style={{fontFamily:"'Nunito',sans-serif",fontSize:13,color:"#6b7280"}}>Sign in to your Work Hub</div>
              </div>
            </div>
            {[{l:"Email Address",v:email,fn:setEmail,t:"email",ph:"you@email.com"},{l:"Password",v:pass,fn:setPass,t:"password",ph:"••••••••"}].map(f=>(
              <div key={f.l} style={{marginBottom:12}}>
                <label style={{fontFamily:"'Nunito',sans-serif",fontWeight:600,fontSize:12,color:"#6b7280",display:"block",marginBottom:5}}>{f.l}</label>
                <input value={f.v} onChange={e=>{f.fn(e.target.value);setErr("");}} onKeyDown={e=>e.key==="Enter"&&doEmpLogin()} type={f.t} placeholder={f.ph}
                  style={{width:"100%",padding:"12px 14px",background:"#f8f7ff",border:"1.5px solid rgba(99,102,241,0.12)",borderRadius:9,fontFamily:"'Nunito',sans-serif",fontSize:14,color:"#1e1b4b",outline:"none",boxSizing:"border-box"}}
                  onFocus={e=>e.target.style.borderColor="#6366f1"} onBlur={e=>e.target.style.borderColor="rgba(99,102,241,0.12)"}/>
              </div>
            ))}
            {err&&<div style={{fontFamily:"'Nunito',sans-serif",fontSize:12,color:"#ef4444",marginBottom:12,padding:"8px 10px",background:"rgba(239,68,68,0.05)",border:"1px solid rgba(239,68,68,0.15)",borderRadius:6}}>{err}</div>}
            <button onClick={doEmpLogin} style={{width:"100%",padding:"14px",background:busy?"#a5b4fc":"linear-gradient(135deg,#6366f1,#8b5cf6)",border:"none",borderRadius:10,fontFamily:"'Nunito',sans-serif",fontWeight:700,fontSize:15,color:"#fff",cursor:busy?"not-allowed":"pointer",boxShadow:"0 8px 28px rgba(99,102,241,0.18)",marginBottom:12}}>
              {busy?"Signing in…":"Go to My Work Hub  to "}
            </button>
            <div style={{textAlign:"center",marginBottom:8}}>
              <button onClick={async()=>{
                if(!email){setErr("Enter your email above first.");return;}
                setBusy(true);setErr("");
                try{
                  const sb2=await getSB();
                  await sb2.auth.resetPasswordForEmail(email,{redirectTo:"https://shiftpro.ai/"});
                  setErr("✓ Reset email sent — check your inbox!");
                }catch(e){setErr("Could not send reset email.");}
                finally{setBusy(false);}
              }} style={{background:"none",border:"none",fontFamily:"'JetBrains Mono',monospace",fontSize:10,color:"rgba(99,102,241,0.5)",cursor:"pointer",textDecoration:"underline"}}>
                Forgot password?
              </button>
            </div>
            <div style={{textAlign:"center",fontFamily:"'Nunito',sans-serif",fontSize:12,color:"#9ca3af"}}>Need access? Ask your manager to add you to ShiftPro.</div>
          </div>
        )}
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════
//  EMPLOYEE PORTAL
// ══════════════════════════════════════════════════

// ══════════════════════════════════════════════════════════
//  EMPLOYEE ONBOARDING WIZARD (first-login only)
// ══════════════════════════════════════════════════════════
function EmpOnboarding({ empSafe, onComplete }) {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({
    firstName: empSafe.first==="there"?"":empSafe.first,
    lastName: empSafe.name.split(" ").slice(1).join(" ")||"",
    preferredName: "",
    phone: "",
    emergencyName: "",
    emergencyPhone: "",
    avatarColor: empSafe.color||"#6366f1",
  });
  const [avail, setAvail] = useState({Mon:"none",Tue:"none",Wed:"none",Thu:"none",Fri:"none",Sat:"none",Sun:"none"});
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  const COLORS = ["#6366f1","#8b5cf6","#10b981","#f59e0b","#ef4444","#0891b2","#ec4899","#0f766e"];
  const DAYS = ["Mon","Tue","Wed","Thu","Fri","Sat","Sun"];
  const upd = (k,v) => { setForm(p=>({...p,[k]:v})); setErr(""); };
  const cycleDay = (d) => setAvail(p=>({...p,[d]:p[d]==="none"?"available":p[d]==="available"?"unavailable":"none"}));
  const dayColor = s => s==="available"?"#10b981":s==="unavailable"?"#ef4444":"#d1d5db";
  const dayBg = s => s==="available"?"rgba(16,185,129,0.08)":s==="unavailable"?"rgba(239,68,68,0.06)":"transparent";

  const inp = {width:"100%",padding:"12px 14px",background:"#f8f7ff",border:"1.5px solid rgba(99,102,241,0.15)",borderRadius:10,fontFamily:E.sans,fontSize:14,color:"#1e1b4b",outline:"none",boxSizing:"border-box",marginBottom:14};
  const lbl = {fontFamily:E.mono,fontSize:9,color:"#9ca3af",letterSpacing:"1.5px",textTransform:"uppercase",display:"block",marginBottom:5};
  const primaryBtn = {width:"100%",padding:"14px",background:"linear-gradient(135deg,#6366f1,#8b5cf6)",border:"none",borderRadius:12,fontFamily:E.sans,fontWeight:700,fontSize:15,color:"#fff",cursor:"pointer",boxShadow:"0 8px 28px rgba(99,102,241,0.25)",marginTop:8};
  const backBtn = {background:"none",border:"none",fontFamily:E.sans,fontSize:13,color:"#9ca3af",cursor:"pointer",display:"block",textAlign:"center",marginTop:12,width:"100%"};

  const next = () => {
    if(step===1){
      if(!form.firstName.trim()||!form.lastName.trim()){setErr("Please enter your first and last name.");return;}
      if(!form.phone.trim()){setErr("A mobile phone number is required.");return;}
    }
    if(step===2){
      if(!form.emergencyName.trim()||!form.emergencyPhone.trim()){setErr("Emergency contact info is required.");return;}
    }
    setErr(""); setStep(s=>s+1);
  };

  const finish = async() => {
    setBusy(true);
    try{
      const sb=await getSB();
      await sb.from("users").update({
        first_name:form.firstName, last_name:form.lastName,
        preferred_name:form.preferredName||null,
        phone:form.phone,
        emergency_contact_name:form.emergencyName,
        emergency_contact_phone:form.emergencyPhone,
        avatar_color:form.avatarColor,
      }).eq("id",empSafe.id);
      const availRows=Object.entries(avail).filter(([,s])=>s!=="none").map(([day,status])=>({
        user_id:empSafe.id,org_id:empSafe.orgId||null,day_of_week:day,status,recurring:true,
      }));
      if(availRows.length>0) await sb.from("availability").upsert(availRows,{onConflict:"user_id,day_of_week"});
    }catch(e){ /* always continue even if Supabase fails */ }
    finally{ setBusy(false); onComplete(); }
  };

  const prog = (step/4)*100;
  const name = form.preferredName||form.firstName||empSafe.first;

  return (
    <div style={{minHeight:"100vh",background:"#f8f7ff",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:"20px",fontFamily:E.sans}}>
      <style>{`@keyframes pop{0%{transform:scale(0.8);opacity:0}100%{transform:scale(1);opacity:1}}`}</style>
      {/* Logo */}
      <div style={{marginBottom:24}}><NavLogoLight/></div>

      {/* Card */}
      <div style={{background:"#fff",borderRadius:20,padding:"32px 28px",width:"100%",maxWidth:480,boxShadow:"0 4px 40px rgba(99,102,241,0.12)"}}>

        {/* Progress bar */}
        {step<4&&(
          <div style={{marginBottom:28}}>
            <div style={{background:"#f1f0ff",borderRadius:2,height:4,overflow:"hidden"}}>
              <div style={{width:prog+"%",height:"100%",background:"linear-gradient(135deg,#6366f1,#8b5cf6)",borderRadius:2,transition:"width 0.4s ease"}}/>
            </div>
            <div style={{fontFamily:E.mono,fontSize:8,color:"#9ca3af",letterSpacing:"1.5px",marginTop:5,textAlign:"right"}}>STEP {step} OF 4</div>
          </div>
        )}

        {/* ── STEP 1: Identity ── */}
        {step===1&&(
          <div>
            <div style={{fontFamily:E.mono,fontSize:8,color:"#6366f1",letterSpacing:"2px",textTransform:"uppercase",marginBottom:6}}>Welcome</div>
            <div style={{fontFamily:E.sans,fontWeight:800,fontSize:24,color:"#1e1b4b",marginBottom:6}}>Hey {empSafe.first==="there"?"there":empSafe.first}! 👋</div>
            <div style={{fontFamily:E.sans,fontSize:14,color:"#6b7280",lineHeight:1.6,marginBottom:24}}>Let's set up your employee profile. Takes about 2 minutes.</div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
              <div><label style={lbl}>First Name</label><input value={form.firstName} onChange={e=>upd("firstName",e.target.value)} placeholder="Alex" style={inp} onFocus={e=>e.target.style.borderColor="#6366f1"} onBlur={e=>e.target.style.borderColor="rgba(99,102,241,0.15)"}/></div>
              <div><label style={lbl}>Last Name</label><input value={form.lastName} onChange={e=>upd("lastName",e.target.value)} placeholder="Rivera" style={inp} onFocus={e=>e.target.style.borderColor="#6366f1"} onBlur={e=>e.target.style.borderColor="rgba(99,102,241,0.15)"}/></div>
            </div>
            <label style={lbl}>Preferred Name <span style={{color:"#d1d5db"}}>(optional)</span></label>
            <input value={form.preferredName} onChange={e=>upd("preferredName",e.target.value)} placeholder="What should we call you?" style={inp} onFocus={e=>e.target.style.borderColor="#6366f1"} onBlur={e=>e.target.style.borderColor="rgba(99,102,241,0.15)"}/>
            <label style={lbl}>Mobile Phone <span style={{color:"#ef4444"}}>*</span></label>
            <input value={form.phone} onChange={e=>upd("phone",e.target.value)} placeholder="(555) 000-0000" type="tel" style={inp} onFocus={e=>e.target.style.borderColor="#6366f1"} onBlur={e=>e.target.style.borderColor="rgba(99,102,241,0.15)"}/>
            {err&&<div style={{color:"#ef4444",fontFamily:E.sans,fontSize:12,marginBottom:8}}>{err}</div>}
            <button onClick={next} style={primaryBtn}>Continue  to </button>
          </div>
        )}

        {/* ── STEP 2: Profile ── */}
        {step===2&&(
          <div>
            <div style={{fontFamily:E.mono,fontSize:8,color:"#6366f1",letterSpacing:"2px",textTransform:"uppercase",marginBottom:6}}>Profile</div>
            <div style={{fontFamily:E.sans,fontWeight:800,fontSize:24,color:"#1e1b4b",marginBottom:6}}>Personalize your profile</div>
            <div style={{fontFamily:E.sans,fontSize:14,color:"#6b7280",lineHeight:1.6,marginBottom:24}}>Emergency contact and your avatar color.</div>
            <label style={lbl}>Emergency Contact Name <span style={{color:"#ef4444"}}>*</span></label>
            <input value={form.emergencyName} onChange={e=>upd("emergencyName",e.target.value)} placeholder="Parent, spouse, sibling..." style={inp} onFocus={e=>e.target.style.borderColor="#6366f1"} onBlur={e=>e.target.style.borderColor="rgba(99,102,241,0.15)"}/>
            <label style={lbl}>Emergency Contact Phone <span style={{color:"#ef4444"}}>*</span></label>
            <input value={form.emergencyPhone} onChange={e=>upd("emergencyPhone",e.target.value)} placeholder="(555) 000-0000" type="tel" style={inp} onFocus={e=>e.target.style.borderColor="#6366f1"} onBlur={e=>e.target.style.borderColor="rgba(99,102,241,0.15)"}/>
            <label style={lbl}>Your Avatar Color</label>
            <div style={{display:"flex",gap:10,alignItems:"center",marginBottom:20,flexWrap:"wrap"}}>
              {COLORS.map(c=>(
                <button key={c} onClick={()=>upd("avatarColor",c)} style={{width:34,height:34,borderRadius:"50%",background:c,border:form.avatarColor===c?"3px solid #1e1b4b":"3px solid transparent",cursor:"pointer",transition:"all 0.15s"}}/>
              ))}
              <div style={{width:34,height:34,borderRadius:"50%",background:form.avatarColor,display:"flex",alignItems:"center",justifyContent:"center",fontFamily:E.mono,fontWeight:700,fontSize:12,color:"#fff",marginLeft:6,flexShrink:0}}>
                {(form.firstName[0]||"?").toUpperCase()}{(form.lastName[0]||"").toUpperCase()}
              </div>
            </div>
            {err&&<div style={{color:"#ef4444",fontFamily:E.sans,fontSize:12,marginBottom:8}}>{err}</div>}
            <button onClick={next} style={primaryBtn}>Continue  to </button>
            <button onClick={()=>{setErr("");setStep(1);}} style={backBtn}> back  Back</button>
          </div>
        )}

        {/* ── STEP 3: Availability ── */}
        {step===3&&(
          <div>
            <div style={{fontFamily:E.mono,fontSize:8,color:"#6366f1",letterSpacing:"2px",textTransform:"uppercase",marginBottom:6}}>Availability</div>
            <div style={{fontFamily:E.sans,fontWeight:800,fontSize:24,color:"#1e1b4b",marginBottom:6}}>Your weekly availability</div>
            <div style={{fontFamily:E.sans,fontSize:14,color:"#6b7280",lineHeight:1.6,marginBottom:24}}>Your manager sees this when building the schedule. You can always update it later.</div>
            <div style={{display:"flex",flexWrap:"wrap",gap:8,marginBottom:24}}>
              {DAYS.map(d=>(
                <button key={d} onClick={()=>cycleDay(d)} style={{padding:"10px 14px",borderRadius:10,border:"2px solid "+dayColor(avail[d]),background:dayBg(avail[d]),fontFamily:E.sans,fontWeight:700,fontSize:13,color:dayColor(avail[d]),cursor:"pointer",minWidth:54,transition:"all 0.15s",textAlign:"center"}}>
                  {d}<br/><span style={{fontSize:10,fontWeight:400}}>{avail[d]==="available"?"✓ Free":avail[d]==="unavailable"?"✗ Off":"—"}</span>
                </button>
              ))}
            </div>
            <div style={{padding:"12px 14px",background:"rgba(99,102,241,0.04)",border:"1px solid rgba(99,102,241,0.12)",borderRadius:10,marginBottom:20,fontFamily:E.sans,fontSize:12,color:"#6b7280"}}>
              Tap a day to cycle: <span style={{color:"#10b981",fontWeight:600}}>Available</span>  to  <span style={{color:"#ef4444",fontWeight:600}}>Unavailable</span>  to  No preference
            </div>
            <button onClick={()=>{setErr("");setStep(4);}} style={primaryBtn}>Save & Continue  to </button>
            <button onClick={()=>{setErr("");setStep(2);}} style={backBtn}> back  Back</button>
          </div>
        )}

        {/* ── STEP 4: Done ── */}
        {step===4&&(
          <div style={{textAlign:"center"}}>
            <div style={{width:72,height:72,borderRadius:"50%",background:"linear-gradient(135deg,#6366f1,#8b5cf6)",display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto 16px",fontSize:32,animation:"pop 0.4s ease"}}>✓</div>
            <div style={{fontFamily:E.sans,fontWeight:800,fontSize:24,color:"#1e1b4b",marginBottom:6}}>You're all set, {name}! 🎉</div>
            <div style={{fontFamily:E.sans,fontSize:14,color:"#6b7280",lineHeight:1.6,marginBottom:24}}>Your profile is ready. Your manager can see your availability when building the schedule.</div>
            {/* Summary */}
            <div style={{background:"#f8f7ff",borderRadius:12,padding:"16px",textAlign:"left",marginBottom:24}}>
              <div style={{fontFamily:E.mono,fontSize:8,color:"#9ca3af",letterSpacing:"1.5px",marginBottom:10,textTransform:"uppercase"}}>Your Profile</div>
              {[
                ["Name",form.preferredName?`${form.firstName} "${form.preferredName}" ${form.lastName}`:`${form.firstName} ${form.lastName}`],
                ["Phone",form.phone],
                ["Emergency",form.emergencyName+" · "+form.emergencyPhone],
              ].map(([l,v])=>(
                <div key={l} style={{display:"flex",gap:10,marginBottom:8}}>
                  <span style={{fontFamily:E.mono,fontSize:9,color:"#9ca3af",minWidth:80,textTransform:"uppercase"}}>{l}</span>
                  <span style={{fontFamily:E.sans,fontSize:13,color:"#1e1b4b"}}>{v}</span>
                </div>
              ))}
              <div style={{display:"flex",gap:10,alignItems:"flex-start",marginTop:4}}>
                <span style={{fontFamily:E.mono,fontSize:9,color:"#9ca3af",minWidth:80,textTransform:"uppercase",paddingTop:2}}>Availability</span>
                <div style={{display:"flex",flexWrap:"wrap",gap:4}}>
                  {Object.entries(avail).filter(([,s])=>s!=="none").map(([d,s])=>(
                    <span key={d} style={{fontFamily:E.mono,fontSize:9,padding:"2px 8px",borderRadius:10,background:s==="available"?"rgba(16,185,129,0.1)":"rgba(239,68,68,0.08)",color:s==="available"?"#10b981":"#ef4444",border:"1px solid "+(s==="available"?"rgba(16,185,129,0.2)":"rgba(239,68,68,0.15)")}}>
                      {d}
                    </span>
                  ))}
                  {Object.values(avail).every(s=>s==="none")&&<span style={{fontFamily:E.sans,fontSize:12,color:"#9ca3af"}}>Not set</span>}
                </div>
              </div>
            </div>
            <button onClick={finish} disabled={busy} style={{...primaryBtn,opacity:busy?0.7:1,cursor:busy?"not-allowed":"pointer"}}>
              {busy?"Setting up your account…":"Enter My Work Hub  to "}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════
//  MESSAGE THREAD — used by both employee and owner
// ══════════════════════════════════════════════════
function MessageThread({ thread, empSafe, fmtTs, sendReply, E, isOwner=false }) {
  const [open, setOpen] = React.useState(false);
  const [replyText, setReplyText] = React.useState("");
  const [replying, setReplying] = React.useState(false);
  const [busy, setBusy] = React.useState(false);
  const [sent, setSent] = React.useState(false);
  const unread = !thread.read && thread.to_id === (empSafe?.id);
  const allMsgs = [thread, ...(thread.replies||[])];
  const lastMsg = allMsgs[allMsgs.length-1];
  const isBroadcast = thread.type==="broadcast";

  const handleSend = async() => {
    if(!replyText.trim()) return;
    setBusy(true);
    const toId = isOwner ? thread.from_id : thread.from_id;
    const ok = await sendReply(thread.id, replyText, toId);
    if(ok){ setReplyText(""); setReplying(false); setSent(true); setTimeout(()=>setSent(false),3000); }
    setBusy(false);
  };

  return(
    <div style={{background:"#fff",border:"1.5px solid "+(unread?E.indigo+"40":E.border),borderRadius:14,marginBottom:10,overflow:"hidden",boxShadow:unread?"0 2px 12px rgba(99,102,241,0.12)":E.shadow,transition:"all 0.15s"}}>
      {/* Thread header */}
      <div onClick={()=>setOpen(o=>!o)} style={{padding:"14px 16px",cursor:"pointer",display:"flex",alignItems:"flex-start",gap:12}}>
        {/* Avatar */}
        <div style={{width:38,height:38,borderRadius:"50%",background:isBroadcast?"rgba(245,158,11,0.15)":"rgba(99,102,241,0.12)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:18,flexShrink:0}}>
          {isBroadcast?"📢":isOwner?"👤":"👔"}
        </div>
        <div style={{flex:1,minWidth:0}}>
          <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:3}}>
            {unread&&<div style={{width:8,height:8,borderRadius:"50%",background:E.indigo,flexShrink:0}}/>}
            <div style={{fontFamily:E.sans,fontWeight:unread?700:600,fontSize:14,color:E.text,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",flex:1}}>
              {thread.subject||"Message"}
            </div>
            <div style={{fontFamily:E.mono,fontSize:9,color:E.textF,flexShrink:0}}>{fmtTs(thread.created_at)}</div>
          </div>
          <div style={{fontFamily:E.sans,fontSize:12,color:E.textD,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>
            {open?"":(lastMsg.body||"").substring(0,80)}
          </div>
          {thread.replies?.length>0&&!open&&(
            <div style={{fontFamily:E.mono,fontSize:9,color:E.indigo,marginTop:4}}>💬 {thread.replies.length} repl{thread.replies.length===1?"y":"ies"}</div>
          )}
        </div>
        <div style={{fontSize:14,color:E.textF,flexShrink:0}}>{open?"▲":"▼"}</div>
      </div>

      {/* Thread body */}
      {open&&(
        <div style={{borderTop:"1px solid "+E.border}}>
          {/* All messages in thread */}
          <div style={{padding:"0 16px"}}>
            {allMsgs.map((m,i)=>{
              const isFromEmp = m.from_id!==thread.from_id||i>0&&m.type==="reply";
              const fromMe = m.from_id===empSafe?.id;
              return(
                <div key={m.id} style={{padding:"14px 0",borderBottom:i<allMsgs.length-1?"1px solid "+E.border:"none"}}>
                  <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:8}}>
                    <div style={{width:28,height:28,borderRadius:"50%",background:fromMe?"rgba(99,102,241,0.15)":"rgba(0,0,0,0.06)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:13,flexShrink:0}}>
                      {fromMe?"👤":"👔"}
                    </div>
                    <div style={{flex:1}}>
                      <span style={{fontFamily:E.sans,fontWeight:700,fontSize:12,color:fromMe?E.indigo:E.text}}>{fromMe?"You":m.from_name||"Manager"}</span>
                      <span style={{fontFamily:E.mono,fontSize:9,color:E.textF,marginLeft:8}}>{fmtTs(m.created_at)}</span>
                    </div>
                  </div>
                  <div style={{fontFamily:E.sans,fontSize:14,color:E.text,lineHeight:1.7,paddingLeft:36}}>{m.body}</div>
                </div>
              );
            })}
          </div>

          {/* Reply box */}
          <div style={{padding:"12px 16px",background:E.bg3,borderTop:"1px solid "+E.border}}>
            {sent&&<div style={{fontFamily:E.mono,fontSize:10,color:E.green,marginBottom:8}}>✓ Message sent</div>}
            {!replying?(
              <button onClick={()=>setReplying(true)} style={{padding:"8px 18px",background:E.indigoD,border:"1.5px solid "+E.indigo+"40",borderRadius:8,fontFamily:E.sans,fontWeight:600,fontSize:12,color:E.indigo,cursor:"pointer"}}>
                ↩ Reply
              </button>
            ):(
              <div>
                <textarea value={replyText} onChange={e=>setReplyText(e.target.value)}
                  placeholder="Write your reply…"
                  style={{width:"100%",padding:"10px 12px",background:"#fff",border:"1.5px solid "+E.indigo+"40",borderRadius:8,fontFamily:E.sans,fontSize:13,color:E.text,outline:"none",resize:"none",boxSizing:"border-box",minHeight:80,lineHeight:1.5}}/>
                <div style={{display:"flex",gap:8,marginTop:8}}>
                  <button onClick={handleSend} disabled={busy||!replyText.trim()} style={{flex:1,padding:"9px",background:busy||!replyText.trim()?"rgba(99,102,241,0.3)":"linear-gradient(135deg,"+E.indigo+","+E.violet+")",border:"none",borderRadius:8,fontFamily:E.sans,fontWeight:700,fontSize:13,color:"#fff",cursor:busy?"not-allowed":"pointer"}}>
                    {busy?"Sending…":"Send Reply"}
                  </button>
                  <button onClick={()=>{setReplying(false);setReplyText("");}} style={{padding:"9px 14px",background:"none",border:"1px solid "+E.border,borderRadius:8,fontFamily:E.sans,fontSize:12,color:E.textD,cursor:"pointer"}}>
                    Cancel
                  </button>
                </div>
                <div style={{fontFamily:E.mono,fontSize:9,color:E.textF,marginTop:6}}>🔒 Messages are permanent records and cannot be deleted</div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function EmpPortal({emp,onLogout,onProfileUpdate}){
  const empSafe = {
    id:emp?.id||"", name:emp?.name||(emp?.first?emp.first+" ":"")+"Employee",
    first:emp?.first&&emp.first!=="there"?emp.first:emp?.email?.split("@")[0]||"there",
    nick:emp?.nick||emp?.preferred_name||"",
    role:emp?.role&&emp.role!=="Employee"?emp.role:"", dept:emp?.dept||"",
    rate:parseFloat(emp?.rate)||15,
    avatar:(()=>{
    const n=((emp?.name)||((emp?.first||"")+" "+(emp?.last||""))).trim();
    const parts=n.split(" ").filter(p=>p&&p!=="Employee"&&p!=="there");
    if(parts.length>=2) return (parts[0][0]+parts[parts.length-1][0]).toUpperCase();
    if(parts.length===1&&parts[0].length>=2) return parts[0].slice(0,2).toUpperCase();
    const epfx=(emp?.email||"").split("@")[0];
    if(epfx.length>=2) return epfx.slice(0,2).toUpperCase();
    return "?";
  })(),
    color:emp?.color||"#6366f1", email:emp?.email||"",
    wkHrs:parseFloat(emp?.wkHrs)||0,
    moHrs:parseFloat(emp?.moHrs)||0, ot:parseFloat(emp?.ot)||0, streak:parseInt(emp?.streak)||0,
    flags:parseInt(emp?.flags)||0, shifts:parseInt(emp?.shifts)||0, risk:emp?.risk||"Low",
    orgId:emp?.orgId||null, locId:emp?.locId||null, appRole:emp?.appRole||"employee",
    rel:parseInt(emp?.rel)||100, prod:parseInt(emp?.prod)||80, cam:parseInt(emp?.cam)||85,
    ghost:parseFloat(emp?.ghost)||0,
  };
  const [tab,setTab] = useState(()=>{
    try{ return localStorage.getItem("shiftpro_emp_tab_"+(emp?.id||""))||"home"; }catch(e){ return "home"; }
  });

  // ── CLOCK STATE — restore synchronously from localStorage before first render ──
  // This guarantees the timer shows immediately on page refresh, no flicker
  const CLOCK_KEY = "shiftpro_clock_"+(emp?.id||"");
  const BREAK_KEY = "shiftpro_break_"+(emp?.id||"");
  const [clocked, setClocked] = useState(()=>{
    try{ return localStorage.getItem(CLOCK_KEY+"_active")==="true"; }catch(e){ return false; }
  });
  const [clockedAt, setClockedAt] = useState(()=>{
    try{
      const ts=localStorage.getItem(CLOCK_KEY+"_at");
      return ts ? new Date(ts) : null;
    }catch(e){ return null; }
  });
  const [secs, setSecs] = useState(()=>{
    try{
      const ts=localStorage.getItem(CLOCK_KEY+"_at");
      if(ts&&localStorage.getItem(CLOCK_KEY+"_active")==="true"){
        return Math.max(0,Math.floor((Date.now()-new Date(ts).getTime())/1000));
      }
    }catch(e){}
    return 0;
  });
  const [onBreak, setOnBreak] = useState(()=>{
    try{ return localStorage.getItem(BREAK_KEY+"_active")==="true"; }catch(e){ return false; }
  });
  const [breakSecs, setBreakSecs] = useState(()=>{
    try{
      const ts=localStorage.getItem(BREAK_KEY+"_at");
      if(ts&&localStorage.getItem(BREAK_KEY+"_active")==="true"){
        return Math.max(0,Math.floor((Date.now()-new Date(ts).getTime())/1000));
      }
    }catch(e){}
    return 0;
  });
  const [syncMsg,setSyncMsg] = useState("");
  const [now,setNow] = useState(new Date());
  const [empShifts,setEmpShifts] = useState(null);
  const [swapOpen,setSwapOpen] = useState(false);
  const [swapReason,setSwapReason] = useState("");
  const [swapDate,setSwapDate] = useState("");
  const [swapShiftPick,setSwapShiftPick] = useState("");
  const [swapDone,setSwapDone] = useState("");
  const [toOpen,setToOpen] = useState(false);
  const [toStart,setToStart] = useState("");
  const [toEnd,setToEnd] = useState("");
  const [toReason,setToReason] = useState("");
  const [toDone,setToDone] = useState("");
  const [openShifts,setOpenShifts] = useState([]);
  const [realWkHrs,setRealWkHrs] = useState(0);
  const [realMoHrs,setRealMoHrs] = useState(0);
  const [empDocs,setEmpDocs] = useState(null);
  const [empLocationName,setEmpLocationName] = useState("");
  const [empThreads,setEmpThreads] = useState(null);
  // Profile edit state
  const [profileEdit,setProfileEdit] = useState(false);
  const [profileForm,setProfileForm] = useState({firstName:"",lastName:"",nick:"",title:"",phone:"",emergency:""});
  const [profileBusy,setProfileBusy] = useState(false);
  const [profileMsg,setProfileMsg] = useState("");

  // ── Profile save — lives at component level to avoid stale closures ──
  const saveProfile = async () => {
    setProfileBusy(true);
    setProfileMsg("");
    try {
      const sb = await getSB();
      const { data:{ session:ss } } = await sb.auth.getSession();
      if (!ss?.user?.id) throw new Error("Not authenticated");

      const updates = {
        first_name:    profileForm.firstName.trim() || empSafe.first,
        last_name:     profileForm.lastName.trim(),
        preferred_name:profileForm.nick.trim(),
        role:          profileForm.title.trim(),
        phone:         profileForm.phone.trim(),
        emergency_contact: profileForm.emergency.trim(),
      };

      const r = await fetch("/api/user", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          ...(ss?.access_token ? { "Authorization": "Bearer " + ss.access_token } : {}),
        },
        body: JSON.stringify({ userId: ss.user.id, updates }),
      });

      const json = await r.json();
      if (!r.ok) throw new Error(json.error || "Save failed");

      // Update session immediately from what we just saved — no DB re-fetch needed
      if (onProfileUpdate) {
        const firstName = updates.first_name;
        const lastName  = updates.last_name;
        onProfileUpdate({
          first: firstName || empSafe.first,
          name:  (firstName + " " + lastName).trim() || empSafe.name,
          nick:  updates.preferred_name,
          role:  updates.role && updates.role !== "Employee" ? updates.role : "",
          phone: updates.phone,
          emergency: updates.emergency_contact,
        });
      }

      setProfileMsg("✓ Saved! Your profile has been updated.");
      setProfileEdit(false);
    } catch (e) {
      setProfileMsg("⚠ " + (e.message || "Could not save. Please try again."));
    } finally {
      setProfileBusy(false);
    }
  };
  // Compose message state
  const [composeOpen,setComposeOpen] = useState(false);
  const [composeText,setComposeText] = useState("");
  const [composeBusy,setComposeBusy] = useState(false);
  const [composeMsg,setComposeMsg] = useState("");
  const [docSubTab,setDocSubTab] = useState("all");
  const [docUploading,setDocUploading] = useState(false);
  const [docUploadName,setDocUploadName] = useState("");
  const [docUploadCat,setDocUploadCat] = useState("identity");
  const [docUploadNotes,setDocUploadNotes] = useState("");
  const [showUploadForm,setShowUploadForm] = useState(false);
  const [docMsg,setDocMsg] = useState("");

  // ── Clock persistence helpers ──
  const saveClockedIn = (at) => {
    try{
      localStorage.setItem(CLOCK_KEY+"_active","true");
      localStorage.setItem(CLOCK_KEY+"_at", at.toISOString());
    }catch(e){}
  };
  const clearClockedIn = () => {
    try{
      localStorage.removeItem(CLOCK_KEY+"_active");
      localStorage.removeItem(CLOCK_KEY+"_at");
    }catch(e){}
  };
  const saveBreakStart = (at) => {
    try{
      localStorage.setItem(BREAK_KEY+"_active","true");
      localStorage.setItem(BREAK_KEY+"_at", at.toISOString());
    }catch(e){}
  };
  const clearBreak = () => {
    try{
      localStorage.removeItem(BREAK_KEY+"_active");
      localStorage.removeItem(BREAK_KEY+"_at");
    }catch(e){}
  };
  // Schedule sub-tab state (must be here, not inside render IIFE)
  const [schedSubTab,setSchedSubTab] = useState("shifts");
  const [avail,setAvail] = useState({Mon:"none",Tue:"none",Wed:"none",Thu:"none",Fri:"none",Sat:"none",Sun:"none"});
  const [availRecurring,setAvailRecurring] = useState(true);
  const [availSaved,setAvailSaved] = useState(false);
  const [availBusy,setAvailBusy] = useState(false);
  const [msgs,setMsgs] = useState([]);
  const [openMsg,setOpenMsg] = useState(null);
  const openMessage = async(msg) => {
    setOpenMsg(msg);
    if(!msg.read){
      setMsgs(prev=>prev.map(m=>m.id===msg.id?{...m,read:true}:m));
      try{ const {data:{session:ssMr}}=await (await getSB()).auth.getSession(); await fetch("/api/employee",{method:"POST",headers:{"Content-Type":"application/json",...(ssMr?.access_token?{"Authorization":"Bearer "+ssMr.access_token}:{})},body:JSON.stringify({_action:"mark_read",messageId:msg.id})}); }catch(e){}
    }
  };
  const [msgsLoaded,setMsgsLoaded] = useState(false);
  const [onboardingDone,setOnboardingDone] = useState(()=>{
    // Synchronous check — must happen before first render so gate works immediately
    if(!emp?.id) return true;
    try{ return localStorage.getItem("shiftpro_onboarding_"+emp.id)==="done"; }
    catch(e){ return true; }
  });

  useEffect(()=>{ const t=setInterval(()=>setNow(new Date()),1000); return()=>clearInterval(t); },[]);

  useEffect(()=>{
    if(!clocked){setSecs(0);setBreakSecs(0);setOnBreak(false);return;}
    if(onBreak){const t=setInterval(()=>setBreakSecs(s=>s+1),1000);return()=>clearInterval(t);}
    const t=setInterval(()=>setSecs(s=>s+1),1000);return()=>clearInterval(t);
  },[clocked,onBreak]);

  useEffect(()=>{
    if(!empSafe.id) return;
    const load=async()=>{
      try{
        const sb=await getSB();
        const {data:{session:ss}}=await sb.auth.getSession();
        const headers=ss?.access_token?{"Authorization":"Bearer "+ss.access_token}:{};
        const baseUrl="/api/employee";

        // ── Load shifts + open shifts via service role ──
        try{
          const r=await fetch(`${baseUrl}?type=shifts&userId=${empSafe.id}&orgId=${empSafe.orgId||""}&_t=${Date.now()}`,{headers,cache:"no-store"});
          if(r.ok){
            const d=await r.json();
            setEmpShifts(d.shifts||[]);
            setOpenShifts(d.openShifts||[]);
          }
        }catch(e){ setEmpShifts([]); }

        // ── Load messages (threaded) via new messages API ──
        try{
          const r=await fetch(`/api/messages?userId=${empSafe.id}&orgId=${empSafe.orgId||""}&role=employee&_t=${Date.now()}`,{headers,cache:"no-store"});
          if(r.ok){
            const d=await r.json();
            setEmpThreads(d.threads||[]);
            setMsgs((d.threads||[]).filter(t=>!t.read&&t.to_id===empSafe.id));
          } else { setEmpThreads([]); }
        }catch(e){ setEmpThreads([]); }
        setMsgsLoaded(true);
        // ── Load documents ──
        try{
          const r=await fetch(`/api/documents?userId=${empSafe.id}&_t=${Date.now()}`,{headers,cache:"no-store"});
          if(r.ok){ const d=await r.json(); setEmpDocs(d.documents||[]); }
          else { setEmpDocs([]); }
        }catch(e){ setEmpDocs([]); }

        // ── Load location name ──
        if(empSafe.locId){
          try{
            const sb=await getSB();
            const {data:loc}=await sb.from("locations").select("name").eq("id",empSafe.locId).single();
            if(loc?.name) setEmpLocationName(loc.name);
          }catch(e){}
        }

        // ── Load availability via service role ──
        try{
          const r=await fetch(`/api/availability?userId=${empSafe.id}&_t=${Date.now()}`,{headers,cache:"no-store"});
          if(r.ok){
            const d=await r.json();
            if(d.availability?.length>0){
              const map={Mon:"none",Tue:"none",Wed:"none",Thu:"none",Fri:"none",Sat:"none",Sun:"none"};
              d.availability.forEach((a)=>{ if(map.hasOwnProperty(a.day_of_week)) map[a.day_of_week]=a.status; });
              setAvail(map);
              if(d.availability[0]?.recurring!==undefined) setAvailRecurring(!!d.availability[0].recurring);
            }
          }
        }catch(e){}

        // ── Load clock events for hours calculation + today's state ──
        try{
          const r=await fetch(`${baseUrl}?type=clock&userId=${empSafe.id}&_t=${Date.now()}`,{headers,cache:"no-store"});
          if(r.ok){
            const d=await r.json();
            // Calculate real hours
            if(d.monthEvents?.length>0){
              const weekStart=new Date(); weekStart.setDate(weekStart.getDate()-((weekStart.getDay()+6)%7)); weekStart.setHours(0,0,0,0);
              const monthStart=new Date(); monthStart.setDate(1); monthStart.setHours(0,0,0,0);
              let wkMs=0,moMs=0,lastIn=null;
              d.monthEvents.forEach(ev=>{
                if(ev.event_type==="clock_in"){ lastIn=new Date(ev.occurred_at); }
                else if(ev.event_type==="clock_out"&&lastIn){
                  const dur=new Date(ev.occurred_at)-lastIn;
                  moMs+=dur;
                  if(lastIn>=weekStart) wkMs+=dur;
                  lastIn=null;
                }
              });
              setRealWkHrs(Math.round(wkMs/3600000*10)/10);
              setRealMoHrs(Math.round(moMs/3600000*10)/10);
            }
            // ── Reconcile clock state: API is source of truth ──
            // If API says clocked_out but localStorage says clocked_in  to  clear localStorage
            // If API says clocked_in  to  ensure localStorage is set
            if(d.todayEvents?.length>0){
              const last=d.todayEvents[0];
              if(last.event_type==="clock_out"||last.event_type==="break_end"){
                // API confirmed clock-out — clear any stale localStorage
                if(last.event_type==="clock_out"){
                  clearClockedIn(); clearBreak();
                  setClocked(false); setOnBreak(false); setSecs(0); setBreakSecs(0); setClockedAt(null);
                } else {
                  clearBreak(); setOnBreak(false); setBreakSecs(0);
                }
              } else if(last.event_type==="clock_in"){
                const at=new Date(last.occurred_at);
                // Always sync localStorage with DB truth
                saveClockedIn(at);
                setClocked(true);
                setClockedAt(at);
                setSecs(Math.max(0,Math.floor((Date.now()-at.getTime())/1000)));
              } else if(last.event_type==="break_start"){
                const at=new Date(last.occurred_at);
                saveBreakStart(at);
                setOnBreak(true);
                setBreakSecs(Math.max(0,Math.floor((Date.now()-at.getTime())/1000)));
              }
            } else {
              // No events today — make sure we're not showing stale clock
              const lsActive=localStorage.getItem(CLOCK_KEY+"_active")==="true";
              const lsAt=localStorage.getItem(CLOCK_KEY+"_at");
              if(lsActive&&lsAt){
                // localStorage says clocked in but DB has no events — keep localStorage
                // (DB might be slow) but log for reconciliation
                const at=new Date(lsAt);
                setClocked(true); setClockedAt(at);
                setSecs(Math.max(0,Math.floor((Date.now()-at.getTime())/1000)));
              }
            }
          }
        }catch(e){}

      }catch(e){ setEmpShifts([]); }
    };
    load();
  },[empSafe.id]);

  const fmt = s => `${String(Math.floor(s/3600)).padStart(2,"0")}:${String(Math.floor((s%3600)/60)).padStart(2,"0")}:${String(s%60).padStart(2,"0")}`;
  const h = now.getHours();
  const greet = h<12?"Good morning":h<17?"Good afternoon":"Good evening";
  const myShifts = [];
  const realShifts = empShifts||[];
  const unread = msgs.filter(m=>!m.read).length;
  const sc = empSafe.streak>=10?"⭐ Star Performer":empSafe.streak>=5?"🔷 Consistent":"✅ Reliable";
  const scColor = empSafe.streak>=10?E.yellow:empSafe.streak>=5?E.violet:E.green;

  const TABS = [
    {id:"home",label:"🏠 Home"},
    {id:"schedule",label:"📅 Schedule"},
    {id:"earnings",label:"🌱 My Growth"},
    {id:"team",label:unread>0?"💬 Messages ("+unread+")":"💬 Messages"},
    {id:"recognition",label:"🏆 Achievements"},
    {id:"documents",label:"📄 My Documents"},
  ];

  // Tab navigation with localStorage persistence
  const persistTab = (t) => {
    setTab(t);
    setDocMsg(""); // Clear doc messages when switching tabs
    try{ localStorage.setItem("shiftpro_emp_tab_"+empSafe.id, t); }catch(e){}
  };

  // First-login onboarding gate
  if(!onboardingDone && empSafe.id && (empSafe.appRole==="employee"||empSafe.appRole==="supervisor")) return (
    <EmpOnboarding
      empSafe={empSafe}
      onComplete={async()=>{
        try{ localStorage.setItem("shiftpro_onboarding_"+empSafe.id,"done"); }catch(e){}
        setOnboardingDone(true);
      }}
    />
  );

  return (
    <div style={{minHeight:"100vh",background:E.bg,fontFamily:E.sans,color:E.text}}>
      <div style={{background:E.bg2,borderBottom:`1px solid ${E.border}`,padding:"0 20px",height:56,display:"flex",alignItems:"center",justifyContent:"space-between",position:"sticky",top:0,zIndex:100,boxShadow:E.shadow}}>
        <NavLogoLight/>
        <div style={{display:"flex",alignItems:"center",gap:12}}>
          <Av emp={empSafe} size={32}/>
          <div>
            <div style={{fontFamily:E.sans,fontWeight:700,fontSize:14,color:E.text}}>Hi, {empSafe.first==="there"||!empSafe.first?empSafe.email?.split("@")[0]||"there":empSafe.first}!</div>
            <div style={{fontFamily:E.sans,fontSize:11,color:E.textD}}>{empSafe.role&&empSafe.role!=="Employee"?empSafe.role:"Employee"}</div>
          </div>
          <button onClick={onLogout} style={{padding:"5px 14px",background:"none",border:`1.5px solid ${E.border}`,borderRadius:20,fontFamily:E.sans,fontSize:12,color:E.textD,cursor:"pointer",marginLeft:4}}>Sign out</button>
        </div>
      </div>
      <div style={{background:E.bg2,borderBottom:`1px solid ${E.border}`,padding:"0 20px",display:"flex",gap:2,overflowX:"auto"}}>
        {TABS.map(t=>(
          <button key={t.id} onClick={()=>persistTab(t.id)} style={{fontFamily:E.sans,fontWeight:600,fontSize:13,padding:"11px 14px",background:"none",border:"none",cursor:"pointer",color:tab===t.id?E.indigo:E.textD,borderBottom:tab===t.id?`2.5px solid ${E.indigo}`:"2.5px solid transparent",transition:"all 0.15s",whiteSpace:"nowrap",marginBottom:-1}}>{t.label}</button>
        ))}
      </div>
      <div style={{padding:"16px",maxWidth:720,margin:"0 auto"}}>
        {tab==="home"&&(
          <div style={{animation:"fadeUp 0.3s ease"}}>
            {/* Greeting banner */}
            <div style={{background:`linear-gradient(135deg,${E.indigo},${E.violet})`,borderRadius:18,padding:"22px 24px",marginBottom:14,color:"#fff",position:"relative",overflow:"hidden",boxShadow:E.shadowB}}>
              <div style={{fontFamily:E.sans,fontWeight:800,fontSize:22,marginBottom:3}}>{greet}, {empSafe.nick||empSafe.first||"there"}! ✨</div>
              <div style={{fontFamily:E.sans,fontSize:13,opacity:0.8}}>{now.toLocaleDateString("en-US",{weekday:"long",month:"long",day:"numeric"})}</div>
              {/* Next shift inline in banner */}
              {(()=>{
                const next = (empShifts||[]).sort((a,b)=>new Date(a.shift_date)-new Date(b.shift_date))[0];
                if(!next) return null;
                const today = new Date().toISOString().split("T")[0];
                const isToday = next.shift_date===today;
                const dateLabel = isToday?"Today":new Date(next.shift_date+"T12:00:00").toLocaleDateString("en-US",{weekday:"short",month:"short",day:"numeric"});
                const fH = h => h===0?"12am":h<12?h+"am":h===12?"12pm":(h-12)+"pm";
                return(
                  <div style={{marginTop:12,paddingTop:12,borderTop:"rgba(255,255,255,0.2) 1px solid",display:"flex",alignItems:"center",gap:10}}>
                    <span style={{fontSize:16}}>{isToday?"⚡":"📅"}</span>
                    <span style={{fontFamily:E.sans,fontSize:13,opacity:0.9}}>
                      <strong>{isToday?"Your shift today":"Next shift:"}</strong> {dateLabel} - {fH(next.start_hour)}–{fH(next.end_hour)} - {next.end_hour-next.start_hour}h
                    </span>
                  </div>
                );
              })()}
              {empShifts!==null&&empShifts.length===0&&(
                <div style={{marginTop:12,paddingTop:12,borderTop:"rgba(255,255,255,0.2) 1px solid",fontFamily:E.sans,fontSize:13,opacity:0.7}}>📅 No upcoming shifts scheduled yet</div>
              )}
            </div>
            <div style={{background:E.bg2,border:"1.5px solid "+E.border,borderRadius:20,padding:"22px 24px",marginBottom:14,boxShadow:E.shadow}}>
              <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:18}}>
                <div style={{display:"flex",alignItems:"center",gap:10}}>
                  <div style={{width:10,height:10,borderRadius:"50%",background:clocked&&!onBreak?E.green:onBreak?E.yellow:"rgba(0,0,0,0.15)",animation:clocked&&!onBreak?"blink 2s infinite":"none"}}/>
                  <div style={{fontFamily:E.sans,fontWeight:700,fontSize:14,color:clocked&&!onBreak?E.indigo:onBreak?E.yellow:E.textD}}>{!clocked?"Not Clocked In":onBreak?"On Break":"Clocked In"}</div>
                </div>
                {clocked&&clockedAt&&<div style={{fontFamily:E.mono,fontSize:10,color:E.textF}}>since {clockedAt.toLocaleTimeString("en-US",{hour:"2-digit",minute:"2-digit"})}</div>}
              </div>
              <div style={{display:"flex",gap:16,marginBottom:20}}>
                <div style={{flex:1,background:clocked&&!onBreak?"rgba(99,102,241,0.06)":"rgba(0,0,0,0.02)",border:"1.5px solid "+(clocked&&!onBreak?"rgba(99,102,241,0.2)":"rgba(0,0,0,0.06)"),borderRadius:14,padding:"16px",textAlign:"center"}}>
                  <div style={{fontFamily:E.mono,fontSize:8,letterSpacing:"2px",color:clocked&&!onBreak?E.indigo:E.textF,marginBottom:6}}>SHIFT TIME</div>
                  <div style={{fontFamily:E.mono,fontWeight:700,fontSize:clocked?32:24,color:clocked&&!onBreak?E.indigo:E.textD,letterSpacing:2}}>{clocked?fmt(secs):"00:00:00"}</div>
                </div>
                {clocked&&(
                  <div style={{flex:1,background:onBreak?"rgba(245,158,11,0.06)":"rgba(0,0,0,0.02)",border:"1.5px solid "+(onBreak?"rgba(245,158,11,0.25)":"rgba(0,0,0,0.06)"),borderRadius:14,padding:"16px",textAlign:"center"}}>
                    <div style={{fontFamily:E.mono,fontSize:8,letterSpacing:"2px",color:onBreak?E.yellow:E.textF,marginBottom:6}}>BREAK TIME</div>
                    <div style={{fontFamily:E.mono,fontWeight:700,fontSize:32,color:onBreak?E.yellow:E.textD,letterSpacing:2}}>{fmt(breakSecs)}</div>
                  </div>
                )}
              </div>
              {syncMsg&&<div style={{fontFamily:E.mono,fontSize:10,color:syncMsg.startsWith("✓")?E.green:E.yellow,textAlign:"center",marginBottom:8}}>{syncMsg}</div>}
              <div style={{display:"flex",gap:10}}>
                {!clocked?(
                  <button onClick={async()=>{
                    const now=new Date();
                    // Save to localStorage IMMEDIATELY — survives page refresh
                    saveClockedIn(now);
                    setClocked(true); setClockedAt(now);
                    try{
                      const sb=await getSB();
                      const {data:{session:ssCi}}=await sb.auth.getSession();
                      await fetch("/api/employee",{method:"POST",headers:{"Content-Type":"application/json",...(ssCi?.access_token?{"Authorization":"Bearer "+ssCi.access_token}:{})},body:JSON.stringify({_action:"clock",userId:empSafe.id,orgId:empSafe.orgId||null,locId:empSafe.locId||null,eventType:"clock_in"})});
                      setSyncMsg("✓ Clocked in — timer running");setTimeout(()=>setSyncMsg(""),2500);
                    }catch(e){ setSyncMsg("⚠ Saved locally — syncing..."); setTimeout(()=>setSyncMsg(""),4000); }
                  }} style={{flex:1,padding:"14px",background:`linear-gradient(135deg,${E.indigo},${E.violet})`,border:"none",borderRadius:14,fontFamily:E.sans,fontWeight:700,fontSize:16,color:"#fff",cursor:"pointer",boxShadow:"0 4px 18px rgba(99,102,241,0.4)"}}>
                    ✓ Clock In
                  </button>
                ):(
                  <div style={{display:"flex",gap:10,flex:1}}>
                    <button onClick={async()=>{
                      const nowBreak=!onBreak;
                      if(nowBreak){
                        const at=new Date(); saveBreakStart(at);
                      } else {
                        clearBreak();
                      }
                      setOnBreak(b=>!b);
                      try{
                        const sb=await getSB();
                        const {data:{session:ssBr}}=await sb.auth.getSession();
                        await fetch("/api/employee",{method:"POST",headers:{"Content-Type":"application/json",...(ssBr?.access_token?{"Authorization":"Bearer "+ssBr.access_token}:{})},body:JSON.stringify({_action:"clock",userId:empSafe.id,orgId:empSafe.orgId||null,locId:empSafe.locId||null,eventType:nowBreak?"break_start":"break_end"})});
                        setSyncMsg(nowBreak?"⏸ Break started":" to  Back on shift");setTimeout(()=>setSyncMsg(""),2000);
                      }catch(e){ setSyncMsg("⚠ Saved locally"); setTimeout(()=>setSyncMsg(""),3000); }
                    }} style={{flex:1,padding:"13px",background:onBreak?`linear-gradient(135deg,rgba(99,102,241,0.9),rgba(139,92,246,0.9))`:`linear-gradient(135deg,rgba(245,158,11,0.9),rgba(251,146,60,0.8))`,border:"none",borderRadius:14,fontFamily:E.sans,fontWeight:700,fontSize:14,color:"#fff",cursor:"pointer"}}>
                      {onBreak?" to  Resume Shift":"⏸ Start Break"}
                    </button>
                    <button onClick={async()=>{
                      if(onBreak){ setSyncMsg("⚠ Resume your shift first"); setTimeout(()=>setSyncMsg(""),2500); return; }
                      // Clear localStorage FIRST
                      clearClockedIn(); clearBreak();
                      setClocked(false);setOnBreak(false);setSecs(0);setBreakSecs(0);setClockedAt(null);
                      try{
                        const sb=await getSB();
                        const {data:{session:ssCo}}=await sb.auth.getSession();
                        await fetch("/api/employee",{method:"POST",headers:{"Content-Type":"application/json",...(ssCo?.access_token?{"Authorization":"Bearer "+ssCo.access_token}:{})},body:JSON.stringify({_action:"clock",userId:empSafe.id,orgId:empSafe.orgId||null,locId:empSafe.locId||null,eventType:"clock_out"})});
                        setSyncMsg("✓ Clocked out");setTimeout(()=>setSyncMsg(""),3000);
                      }catch(e){ setSyncMsg("⚠ Saved locally — syncing..."); setTimeout(()=>setSyncMsg(""),4000); }
                    }} style={{flex:1,padding:"13px",background:"rgba(239,68,68,0.08)",border:"1.5px solid rgba(239,68,68,0.3)",borderRadius:14,fontFamily:E.sans,fontWeight:700,fontSize:14,color:E.red,cursor:"pointer"}}>
                      👋 Clock Out
                    </button>
                  </div>
                )}
              </div>
            </div>
            {/* Earnings tracker card */}
            <div style={{background:E.bg2,border:"1.5px solid "+E.border,borderRadius:16,padding:"18px 20px",marginBottom:14,boxShadow:E.shadow}}>
              <div style={{fontFamily:E.sans,fontWeight:700,fontSize:14,color:E.text,marginBottom:12}}>💰 Estimated Earnings</div>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:14}}>
                <div style={{background:E.bg3,borderRadius:10,padding:"12px 14px",textAlign:"center"}}>
                  <div style={{fontFamily:E.mono,fontSize:8,color:E.textF,letterSpacing:"1.5px",marginBottom:4,textTransform:"uppercase"}}>This Week</div>
                  <div style={{fontFamily:E.sans,fontWeight:800,fontSize:20,color:E.indigo}}>${(realWkHrs*(empSafe.rate||15)).toFixed(2)}</div>
                  <div style={{fontFamily:E.mono,fontSize:9,color:E.textF}}>{realWkHrs}h × ${empSafe.rate||15}/hr</div>
                </div>
                <div style={{background:E.bg3,borderRadius:10,padding:"12px 14px",textAlign:"center"}}>
                  <div style={{fontFamily:E.mono,fontSize:8,color:E.textF,letterSpacing:"1.5px",marginBottom:4,textTransform:"uppercase"}}>This Month</div>
                  <div style={{fontFamily:E.sans,fontWeight:800,fontSize:20,color:E.violet}}>${(realMoHrs*(empSafe.rate||15)).toFixed(2)}</div>
                  <div style={{fontFamily:E.mono,fontSize:9,color:E.textF}}>{realMoHrs}h total</div>
                </div>
              </div>
              {/* Hours bar chart — stable placeholder bars */}
              <div style={{display:"flex",alignItems:"flex-end",gap:4,height:32}}>
                {(()=>{
                  const todayIdx = (new Date().getDay()+6)%7;
                  const heights = [70,85,60,90,75,40,20];
                  return ["M","T","W","T","F","S","S"].map((d,i)=>(
                    <div key={i} style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",gap:2}}>
                      <div style={{width:"100%",height:(heights[i]/100*28)+"px",background:i===todayIdx?E.indigo:E.border,borderRadius:"2px 2px 0 0",minHeight:2}}/>
                      <div style={{fontFamily:E.mono,fontSize:7,color:i===todayIdx?E.indigo:E.textF}}>{d}</div>
                    </div>
                  ));
                })()}
              </div>
            </div>

            <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:10,marginBottom:14}}>
              {[{icon:"🔄",label:"Swap Shift",go:()=>setSwapOpen(true)},{icon:"📆",label:"Time Off",go:()=>setToOpen(true)},{icon:"💬",label:"Messages",go:()=>setTab("team")}].map(a=>(
                <button key={a.label} onClick={a.go} style={{padding:"15px 10px",background:E.bg2,border:"1.5px solid "+E.border,borderRadius:14,cursor:"pointer",textAlign:"center",boxShadow:E.shadow}}>
                  <div style={{fontSize:22,marginBottom:6}}>{a.icon}</div>
                  <div style={{fontFamily:E.sans,fontWeight:600,fontSize:12,color:E.text}}>{a.label}</div>
                </button>
              ))}
            </div>
          </div>
        )}
        {tab==="schedule"&&(()=>{ try {const cycleAvail = (day) => setAvail(p=>({...p,[day]:p[day]==="none"?"available":p[day]==="available"?"unavailable":"none"}));
          const availColor = s => s==="available"?E.green:s==="unavailable"?"#ef4444":E.border;
          const availBg = s => s==="available"?"rgba(16,185,129,0.1)":s==="unavailable"?"rgba(239,68,68,0.08)":"none";
          const saveAvail = async() => {
            setAvailBusy(true);
            try{
              const sb2=await getSB();
              const {data:{session:ss}}=await sb2.auth.getSession();
              const rows=Object.entries(avail).filter(([,s])=>s!=="none").map(([day,status])=>({day_of_week:day,status,recurring:availRecurring}));
              const res=await fetch("/api/availability",{
                method:"POST",
                headers:{"Content-Type":"application/json",...(ss?.access_token?{"Authorization":"Bearer "+ss.access_token}:{})},
                body:JSON.stringify({userId:empSafe.id,orgId:empSafe.orgId||null,rows}),
              });
              const json=await res.json();
              if(!res.ok) throw new Error(json.error||"Save failed");
              setAvailSaved(true);setTimeout(()=>setAvailSaved(false),3000);
            }catch(e){ setSyncMsg("⚠ Could not save availability"); setTimeout(()=>setSyncMsg(""),3000); }
            finally{setAvailBusy(false);}
          };
          return(
          <div style={{animation:"fadeUp 0.3s ease"}}>
            {/* Sub-tabs */}
            <div style={{display:"flex",gap:6,marginBottom:16}}>
              {[["shifts","📅 My Shifts"],["availability","✅ Set Availability"],["open","🔓 Open Shifts"]].map(([id,label])=>(
                <button key={id} onClick={()=>setSchedSubTab(id)} style={{padding:"7px 14px",borderRadius:20,border:"none",fontFamily:E.sans,fontWeight:600,fontSize:12,cursor:"pointer",background:schedSubTab===id?E.indigo:E.bg3,color:schedSubTab===id?"#fff":E.textD}}>
                  {label}
                </button>
              ))}
              <button onClick={()=>setSwapOpen(true)} style={{marginLeft:"auto",padding:"7px 14px",background:E.indigoD,border:`1.5px solid ${E.indigo}40`,borderRadius:20,fontFamily:E.sans,fontWeight:600,fontSize:12,color:E.indigo,cursor:"pointer"}}>Swap +</button>
            </div>

            {/* My Shifts sub-tab */}
            {schedSubTab==="shifts"&&(
              <div>
            {realShifts.length===0&&schedSubTab==="shifts"&&(
              <div style={{textAlign:"center",padding:"60px 20px"}}>
                <div style={{fontSize:48,marginBottom:12}}>📅</div>
                <div style={{fontFamily:E.sans,fontWeight:700,fontSize:18,color:E.text,marginBottom:6}}>No upcoming shifts</div>
                <div style={{fontFamily:E.sans,fontSize:13,color:E.textD}}>Your manager will publish your schedule here.</div>
              </div>
            )}
            {(realShifts.length>0||myShifts.length>0)&&[...realShifts,...myShifts].map((s,i)=>(
              <div key={i} style={{background:E.bg2,border:`1.5px solid ${E.border}`,borderRadius:14,padding:"16px 18px",marginBottom:10,boxShadow:E.shadow,display:"flex",alignItems:"center",gap:12}}>
                <div style={{width:4,height:s.notes?64:48,background:`linear-gradient(${E.indigo},${E.violet})`,borderRadius:2}}/>
                <div style={{flex:1}}>
                  <div style={{fontFamily:E.sans,fontWeight:700,fontSize:16,color:E.text}}>{s.day_of_week||s.d} - {fH(s.start_hour||s.ss?.[0]?.s)} – {fH(s.end_hour||s.ss?.[0]?.e)}</div>
                  <div style={{fontFamily:E.sans,fontSize:13,color:E.textD}}>
                    {(()=>{
                      const nm=(empSafe.name||"").replace(" Employee","").replace("Employee","").trim();
                      const parts=nm.split(" ").filter(p=>p&&p!=="Employee");
                      const initials=parts.length>=2?(parts[0][0]+parts[parts.length-1][0]).toUpperCase():parts[0]?parts[0].slice(0,2).toUpperCase():"";
                      const title=s.role_label||(empSafe.role&&empSafe.role!=="Employee"&&empSafe.role?empSafe.role:"");
                      if(!initials&&!title) return empSafe.nick||empSafe.first||"";
                      return initials&&title?initials+" - "+title:title||initials||"";
                    })()}
                  </div>
                  {s.notes&&<div style={{fontFamily:E.sans,fontSize:12,color:E.indigo,marginTop:4,padding:"4px 8px",background:E.indigoD,borderRadius:6}}>📝 {s.notes}</div>}
                </div>
                <EBadge label="✓ Confirmed" color={E.green}/>
              </div>
            ))}
              </div>
            )}

            {/* Set Availability sub-tab */}
            {schedSubTab==="availability"&&(
              <div>
                <div style={{fontFamily:E.sans,fontSize:13,color:E.textD,marginBottom:20,lineHeight:1.6}}>
                  Tap a day to set your availability. Your manager sees this when building the schedule.
                </div>
                <div style={{display:"grid",gridTemplateColumns:"repeat(7,1fr)",gap:8,marginBottom:20}}>
                  {["Mon","Tue","Wed","Thu","Fri","Sat","Sun"].map(day=>{
                    const s=avail[day];
                    const isAvail=s==="available"; const isUnavail=s==="unavailable";
                    return(
                      <button key={day} onClick={()=>cycleAvail(day)} style={{
                        padding:"12px 4px",borderRadius:12,cursor:"pointer",transition:"all 0.18s",textAlign:"center",
                        border:"2px solid "+(isAvail?E.green:isUnavail?"#ef4444":E.border),
                        background:isAvail?"rgba(16,185,129,0.12)":isUnavail?"rgba(239,68,68,0.09)":"#fff",
                      }}>
                        <div style={{fontFamily:E.sans,fontWeight:700,fontSize:12,color:isAvail?E.green:isUnavail?"#ef4444":E.textD,marginBottom:4}}>{day}</div>
                        <div style={{fontSize:16}}>{isAvail?"✅":isUnavail?"🚫":"—"}</div>
                        <div style={{fontFamily:E.mono,fontSize:8,color:isAvail?E.green:isUnavail?"#ef4444":E.textF,marginTop:3,letterSpacing:0.5}}>
                          {isAvail?"AVAIL":isUnavail?"OFF":"TAP"}
                        </div>
                      </button>
                    );
                  })}
                </div>

                {/* Legend */}
                <div style={{display:"flex",gap:16,marginBottom:20}}>
                  {[["✅","Available — I can work",E.green],["🚫","Off — Don't schedule me","#ef4444"],["—","No preference",E.textF]].map(([icon,label,color])=>(
                    <div key={label} style={{display:"flex",alignItems:"center",gap:6}}>
                      <span style={{fontSize:13}}>{icon}</span>
                      <span style={{fontFamily:E.sans,fontSize:11,color}}>{label}</span>
                    </div>
                  ))}
                </div>

                <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:20,padding:"12px 14px",background:E.bg3,borderRadius:10}}>
                  <span style={{fontFamily:E.sans,fontSize:13,color:E.text}}>Repeat every week</span>
                  <button onClick={()=>setAvailRecurring(r=>!r)} style={{width:44,height:26,borderRadius:13,border:"none",background:availRecurring?E.indigo:E.border,cursor:"pointer",position:"relative",transition:"background 0.2s",flexShrink:0}}>
                    <div style={{position:"absolute",top:3,left:availRecurring?20:3,width:20,height:20,borderRadius:"50%",background:"#fff",transition:"left 0.2s",boxShadow:"0 1px 4px rgba(0,0,0,0.2)"}}/>
                  </button>
                  <span style={{fontFamily:E.mono,fontSize:10,color:availRecurring?E.indigo:E.textF}}>{availRecurring?"Recurring weekly":"One-time only"}</span>
                </div>

                {availSaved&&(
                  <div style={{display:"flex",alignItems:"center",gap:8,padding:"10px 14px",background:"rgba(16,185,129,0.1)",border:"1px solid rgba(16,185,129,0.25)",borderRadius:9,marginBottom:14}}>
                    <span style={{fontSize:16}}>✅</span>
                    <span style={{fontFamily:E.sans,fontSize:13,color:E.green,fontWeight:600}}>Saved! Your manager can now see your availability.</span>
                  </div>
                )}
                {syncMsg&&syncMsg.includes("availability")&&(
                  <div style={{padding:"10px 14px",background:"rgba(239,68,68,0.08)",border:"1px solid rgba(239,68,68,0.2)",borderRadius:9,marginBottom:14,fontFamily:E.sans,fontSize:13,color:"#ef4444"}}>{syncMsg}</div>
                )}

                <div style={{display:"flex",gap:10}}>
                  <button onClick={saveAvail} disabled={availBusy} style={{flex:1,padding:"13px",background:availBusy?"rgba(99,102,241,0.5)":"linear-gradient(135deg,#6366f1,#8b5cf6)",border:"none",borderRadius:10,fontFamily:E.sans,fontWeight:700,fontSize:14,color:"#fff",cursor:availBusy?"not-allowed":"pointer",boxShadow:"0 4px 14px rgba(99,102,241,0.3)"}}>
                    {availBusy?"Saving…":"💾 Save Availability"}
                  </button>
                  <button onClick={()=>setAvail({Mon:"none",Tue:"none",Wed:"none",Thu:"none",Fri:"none",Sat:"none",Sun:"none"})} style={{padding:"13px 16px",background:"none",border:"1.5px solid "+E.border,borderRadius:10,fontFamily:E.sans,fontWeight:600,fontSize:13,color:E.textD,cursor:"pointer"}}>
                    Clear
                  </button>
                </div>
              </div>
            )}

            {/* Open Shifts sub-tab */}
            {schedSubTab==="open"&&(
              <div>
                <div style={{fontFamily:E.sans,fontSize:13,color:E.textD,marginBottom:16}}>Open shifts your manager has posted — tap to claim one.</div>
                {openShifts.length===0?(
                  <div style={{textAlign:"center",padding:"40px 20px",background:E.bg3,borderRadius:14}}>
                    <div style={{fontSize:36,marginBottom:10}}>🔓</div>
                    <div style={{fontFamily:E.sans,fontWeight:600,fontSize:15,color:E.text,marginBottom:6}}>No open shifts right now</div>
                    <div style={{fontFamily:E.sans,fontSize:12,color:E.textD}}>When your manager posts an uncovered shift, it will appear here for you to claim.</div>
                  </div>
                ):(
                  openShifts.map(s=>(
                    <div key={s.id} style={{background:E.bg2,border:"1.5px solid "+E.border,borderRadius:12,padding:"14px 16px",marginBottom:8,display:"flex",alignItems:"center",justifyContent:"space-between"}}>
                      <div>
                        <div style={{fontFamily:E.sans,fontWeight:700,fontSize:14,color:E.text}}>{s.shift_date} - {s.start_hour}:00–{s.end_hour}:00</div>
                        <div style={{fontFamily:E.sans,fontSize:12,color:E.textD,marginTop:2}}>{s.locations?.name||"Location TBD"} - {s.end_hour-s.start_hour}h</div>
                      </div>
                      <button onClick={async()=>{
                        try{
                          const sb=await getSB();
                          const {data:{session:ssCl}}=await getSB().then(sb2=>sb2.auth.getSession());
                        await fetch("/api/employee",{method:"POST",headers:{"Content-Type":"application/json",...(ssCl?.access_token?{"Authorization":"Bearer "+ssCl.access_token}:{})},body:JSON.stringify({_action:"claim_shift",userId:empSafe.id,shiftId:s.id})});
                          setOpenShifts(p=>p.filter(x=>x.id!==s.id));
                          setEmpShifts(p=>[...p,{...s,user_id:empSafe.id,status:"confirmed"}]);
                          setSyncMsg("✓ Shift claimed!");setTimeout(()=>setSyncMsg(""),2500);
                        }catch(e){setSyncMsg("⚠ Could not claim shift");}
                      }} style={{padding:"8px 16px",background:`linear-gradient(135deg,${E.indigo},${E.violet})`,border:"none",borderRadius:8,fontFamily:E.sans,fontWeight:700,fontSize:12,color:"#fff",cursor:"pointer",flexShrink:0}}>
                        Claim
                      </button>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
          );
        } catch(e){ return <div style={{padding:20,fontFamily:E.sans,fontSize:13,color:E.textD}}>Schedule loading... pull to refresh.</div>; }
        })()}
        {tab==="earnings"&&(()=>{
          // ── POINTS ENGINE ──
          // Calculate score from real clock events vs scheduled shifts
          const completedShifts = (empShifts||[]).filter(s=>s.status==="confirmed"||s.status==="published").length;
          const totalShiftsEver = completedShifts + (empSafe.shifts||0);

          // Point transactions derived from real data
          const pointEvents = [];
          let totalPoints = 500; // Starting score for new employees

          // Bonus for shifts completed
          if(completedShifts>0){ pointEvents.push({icon:"✅",label:"Shifts completed this period",pts:completedShifts*10,pos:true}); totalPoints+=completedShifts*10; }
          // Bonus for hours worked
          if(realMoHrs>0){ pointEvents.push({icon:"⏱",label:"Hours worked this month",pts:Math.round(realMoHrs*2),pos:true}); totalPoints+=Math.round(realMoHrs*2); }
          // Streak bonus
          if(empSafe.streak>=14){ pointEvents.push({icon:"🔥",label:"2-week streak bonus",pts:50,pos:true}); totalPoints+=50; }
          else if(empSafe.streak>=7){ pointEvents.push({icon:"🔥",label:"1-week streak bonus",pts:25,pos:true}); totalPoints+=25; }
          // Reliability bonus
          if(empSafe.rel>=95){ pointEvents.push({icon:"⭐",label:"Perfect reliability bonus",pts:30,pos:true}); totalPoints+=30; }
          // Late penalty (placeholder — real data would come from clock vs shift time)
          if(empSafe.flags>0){ pointEvents.push({icon:"⚠️",label:"Late arrivals this period",pts:-(empSafe.flags*15),pos:false}); totalPoints-=(empSafe.flags*15); }

          totalPoints = Math.max(0, Math.min(1000, totalPoints));

          // Tier system
          const TIERS = [
            {min:0,   max:199,  label:"New Hire",      icon:"🌱", color:"#9ca3af", next:"Getting Started"},
            {min:200, max:399,  label:"Getting Started",icon:"📈", color:"#f59e0b", next:"Reliable"},
            {min:400, max:599,  label:"Reliable",       icon:"✅", color:"#3b82f6", next:"Star Performer"},
            {min:600, max:799,  label:"Star Performer", icon:"⭐", color:"#8b5cf6", next:"Elite"},
            {min:800, max:949,  label:"Elite",          icon:"💎", color:"#0891b2", next:"Legend"},
            {min:950, max:1000, label:"Legend",         icon:"🏆", color:"#f59e0b", next:null},
          ];
          const tier = TIERS.find(t=>totalPoints>=t.min&&totalPoints<=t.max)||TIERS[0];
          const nextTier = TIERS.find(t=>t.min>totalPoints);
          const pctToNext = nextTier ? ((totalPoints-tier.min)/(tier.max-tier.min)*100) : 100;

          // Point rules reference
          const RULES = [
            {icon:"✅",action:"Clock in on time",pts:"+10",color:E.green},
            {icon:"📅",action:"Complete full shift",pts:"+10",color:E.green},
            {icon:"🔥",action:"7-day streak",pts:"+25",color:E.yellow},
            {icon:"⏰",action:"Late (5–15 min)",pts:"−5",color:"#f59e0b"},
            {icon:"🚨",action:"Very late (15+ min)",pts:"−15",color:E.red},
            {icon:"❌",action:"No-show / missed shift",pts:"−25",color:E.red},
          ];

          return(
          <div style={{animation:"fadeUp 0.3s ease",paddingBottom:40}}>
            <div style={{fontFamily:E.sans,fontWeight:800,fontSize:20,color:E.text,marginBottom:6}}>📊 My Growth</div>
            <div style={{fontFamily:E.sans,fontSize:13,color:E.textD,marginBottom:20}}>Your reliability score grows when you show up on time and shrinks when you're late or miss shifts.</div>

            {/* Score card — hero */}
            <div style={{background:`linear-gradient(135deg,${tier.color}22,${tier.color}08)`,border:`2px solid ${tier.color}40`,borderRadius:20,padding:"24px",marginBottom:16,position:"relative",overflow:"hidden"}}>
              <div style={{position:"absolute",right:20,top:20,fontSize:48,opacity:0.15}}>{tier.icon}</div>
              <div style={{display:"flex",alignItems:"flex-start",justifyContent:"space-between",marginBottom:16}}>
                <div>
                  <div style={{fontFamily:E.mono,fontSize:9,color:tier.color,letterSpacing:"2px",textTransform:"uppercase",marginBottom:4}}>Reliability Score</div>
                  <div style={{display:"flex",alignItems:"baseline",gap:8}}>
                    <div style={{fontFamily:E.sans,fontWeight:900,fontSize:52,color:tier.color,lineHeight:1}}>{totalPoints}</div>
                    <div style={{fontFamily:E.mono,fontSize:10,color:E.textD}}>/ 1000</div>
                  </div>
                </div>
                <div style={{textAlign:"right"}}>
                  <div style={{fontSize:28,marginBottom:2}}>{tier.icon}</div>
                  <div style={{fontFamily:E.sans,fontWeight:700,fontSize:14,color:tier.color}}>{tier.label}</div>
                </div>
              </div>
              {/* Progress bar to next tier */}
              <div style={{marginBottom:6}}>
                <div style={{display:"flex",justifyContent:"space-between",marginBottom:5}}>
                  <div style={{fontFamily:E.mono,fontSize:9,color:E.textF}}>{tier.label} ({tier.min})</div>
                  {nextTier&&<div style={{fontFamily:E.mono,fontSize:9,color:E.textF}}>{nextTier.label} ({nextTier.min})</div>}
                </div>
                <div style={{height:10,background:"rgba(0,0,0,0.08)",borderRadius:5,overflow:"hidden"}}>
                  <div style={{height:"100%",width:pctToNext+"%",background:`linear-gradient(90deg,${tier.color},${tier.color}cc)`,borderRadius:5,transition:"width 1s ease"}}/>
                </div>
                {nextTier&&<div style={{fontFamily:E.sans,fontSize:11,color:E.textD,marginTop:5}}>{nextTier.min-totalPoints} pts to reach {nextTier.label} {nextTier.icon||""}</div>}
                {!nextTier&&<div style={{fontFamily:E.sans,fontSize:11,color:E.yellow,marginTop:5}}>🏆 You've reached the highest tier!</div>}
              </div>
            </div>

            {/* Stats row */}
            <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:10,marginBottom:16}}>
              {[
                {l:"Hours This Month",v:realMoHrs+"h",c:E.teal,icon:"⏱"},
                {l:"Monthly Earnings",v:"$"+((realMoHrs||0)*(empSafe.rate||15)).toFixed(0),c:E.green,icon:"💵"},
                {l:"Streak",v:(empSafe.streak||0)+"d",c:E.yellow,icon:"🔥"},
              ].map(s=>(
                <div key={s.l} style={{background:E.bg2,border:"1.5px solid "+E.border,borderRadius:12,padding:"14px",textAlign:"center",boxShadow:E.shadow}}>
                  <div style={{fontSize:20,marginBottom:4}}>{s.icon}</div>
                  <div style={{fontFamily:E.sans,fontWeight:800,fontSize:20,color:s.c}}>{s.v}</div>
                  <div style={{fontFamily:E.sans,fontSize:10,color:E.textD,marginTop:2}}>{s.l}</div>
                </div>
              ))}
            </div>

            {/* Points history */}
            {pointEvents.length>0&&(
              <div style={{background:E.bg2,border:"1.5px solid "+E.border,borderRadius:14,padding:"16px 18px",marginBottom:16,boxShadow:E.shadow}}>
                <div style={{fontFamily:E.sans,fontWeight:700,fontSize:14,color:E.text,marginBottom:12}}>📋 Recent Points</div>
                {pointEvents.map((ev,i)=>(
                  <div key={i} style={{display:"flex",alignItems:"center",gap:12,padding:"9px 0",borderBottom:i<pointEvents.length-1?"1px solid "+E.border:"none"}}>
                    <span style={{fontSize:18,flexShrink:0}}>{ev.icon}</span>
                    <div style={{flex:1,fontFamily:E.sans,fontSize:13,color:E.text}}>{ev.label}</div>
                    <div style={{fontFamily:E.mono,fontWeight:700,fontSize:14,color:ev.pos?E.green:E.red,flexShrink:0}}>{ev.pos?"+":""}{ev.pts}</div>
                  </div>
                ))}
              </div>
            )}

            {/* How points work */}
            <div style={{background:E.bg2,border:"1.5px solid "+E.border,borderRadius:14,padding:"16px 18px",marginBottom:16,boxShadow:E.shadow}}>
              <div style={{fontFamily:E.sans,fontWeight:700,fontSize:14,color:E.text,marginBottom:12}}>⚡ How Points Work</div>
              <div style={{display:"flex",flexDirection:"column",gap:0}}>
                {RULES.map((r,i)=>(
                  <div key={i} style={{display:"flex",alignItems:"center",gap:12,padding:"8px 0",borderBottom:i<RULES.length-1?"1px solid "+E.border:"none"}}>
                    <span style={{fontSize:16,flexShrink:0,width:24,textAlign:"center"}}>{r.icon}</span>
                    <div style={{flex:1,fontFamily:E.sans,fontSize:12,color:E.textD}}>{r.action}</div>
                    <div style={{fontFamily:E.mono,fontWeight:700,fontSize:13,color:r.color,flexShrink:0}}>{r.pts} pts</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Badges */}
            <div style={{background:E.bg2,border:"1.5px solid "+E.border,borderRadius:14,padding:"16px 18px",boxShadow:E.shadow}}>
              <div style={{fontFamily:E.sans,fontWeight:700,fontSize:14,color:E.text,marginBottom:12}}>🏅 Badges</div>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
                {[
                  {icon:"🎯",label:"First Shift",desc:"Complete your first shift",earned:totalShiftsEver>=1},
                  {icon:"⭐",label:"Reliability Star",desc:"Score 90+ reliability",earned:empSafe.rel>=90||totalPoints>=700},
                  {icon:"🔥",label:"On Fire",desc:"7-day attendance streak",earned:empSafe.streak>=7},
                  {icon:"💎",label:"Elite",desc:"Reach 800+ score",earned:totalPoints>=800},
                  {icon:"💪",label:"Overtime Hero",desc:"Work 45+ hours in a week",earned:empSafe.ot>0},
                  {icon:"🏆",label:"Legend",desc:"Reach 950+ score",earned:totalPoints>=950},
                ].map(b=>(
                  <div key={b.label} style={{padding:"10px 12px",borderRadius:10,background:b.earned?tier.color+"15":"rgba(0,0,0,0.02)",border:"1.5px solid "+(b.earned?tier.color+"40":E.border),opacity:b.earned?1:0.45,display:"flex",alignItems:"center",gap:10}}>
                    <span style={{fontSize:20,flexShrink:0}}>{b.icon}</span>
                    <div>
                      <div style={{fontFamily:E.sans,fontWeight:700,fontSize:12,color:b.earned?E.text:E.textF}}>{b.label}</div>
                      <div style={{fontFamily:E.sans,fontSize:10,color:E.textF,marginTop:1}}>{b.desc}</div>
                    </div>
                    {b.earned&&<div style={{marginLeft:"auto",fontFamily:E.mono,fontSize:9,color:tier.color,flexShrink:0}}>✓ EARNED</div>}
                  </div>
                ))}
              </div>
            </div>
          </div>
          );
        })()}
        {tab==="team"&&(()=>{
          const threads = empThreads; const setThreads = setEmpThreads;
          const fmtTs = s => {
            if(!s) return "";
            const d = new Date(s);
            const today = new Date();
            const isToday = d.toDateString()===today.toDateString();
            return isToday
              ? d.toLocaleTimeString("en-US",{hour:"numeric",minute:"2-digit"})
              : d.toLocaleDateString("en-US",{month:"short",day:"numeric",hour:"numeric",minute:"2-digit"});
          };

          const sendReply = async(parentId, text, toId) => {
            if(!text.trim()) return false;
            try{
              const {data:{session:ss}}=await (await getSB()).auth.getSession();
              const r=await fetch("/api/messages",{
                method:"POST",
                headers:{"Content-Type":"application/json",...(ss?.access_token?{"Authorization":"Bearer "+ss.access_token}:{})},
                body:JSON.stringify({
                  orgId:empSafe.orgId, fromId:empSafe.id,
                  fromName:empSafe.name, toId,
                  text, parentId, type:"employee",
                }),
              });
              const d=await r.json();
              if(!r.ok) throw new Error(d.error);
              // Add reply to thread locally
              setEmpThreads(prev=>(prev||[]).map(t=>t.id===parentId
                ?{...t,replies:[...(t.replies||[]),d.message]}:t));
              return true;
            }catch(e){ return false; }
          };

          return(
          <div style={{animation:"fadeUp 0.3s ease",paddingBottom:40}}>
            {/* Header */}
            <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:16}}>
              <div>
                <div style={{fontFamily:E.sans,fontWeight:800,fontSize:20,color:E.text}}>💬 Messages</div>
                <div style={{fontFamily:E.sans,fontSize:12,color:E.textD,marginTop:2}}>Direct line to your management team</div>
              </div>
              <div style={{display:"flex",gap:8,alignItems:"center"}}>
                {(threads||[]).some(t=>!t.read&&t.to_id===empSafe.id)&&(
                  <div style={{background:E.indigo,borderRadius:20,padding:"4px 12px",fontFamily:E.mono,fontSize:10,color:"#fff",fontWeight:700}}>
                    {(threads||[]).filter(t=>!t.read&&t.to_id===empSafe.id).length} NEW
                  </div>
                )}
                <button onClick={()=>{setComposeOpen(true);setComposeMsg("");setComposeText("");}}
                  style={{padding:"8px 14px",background:`linear-gradient(135deg,${E.indigo},${E.violet})`,border:"none",borderRadius:10,fontFamily:E.sans,fontWeight:700,fontSize:12,color:"#fff",cursor:"pointer",boxShadow:"0 3px 10px rgba(99,102,241,0.3)"}}>
                  + Message Manager
                </button>
              </div>
            </div>

            {/* Compose Modal */}
            {composeOpen&&(
              <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.45)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:300,padding:16}} onClick={()=>setComposeOpen(false)}>
                <div style={{background:E.bg2,borderRadius:18,padding:"26px",width:"100%",maxWidth:420,boxShadow:E.shadowB}} onClick={e=>e.stopPropagation()}>
                  <div style={{fontFamily:E.sans,fontWeight:800,fontSize:18,color:E.text,marginBottom:4}}>📨 Message Management</div>
                  <div style={{fontFamily:E.sans,fontSize:13,color:E.textD,marginBottom:18}}>Send a message directly to your manager. For time-sensitive issues like running late, contact your supervisor directly by phone.</div>
                  <label style={{fontFamily:E.mono,fontSize:9,color:E.textF,letterSpacing:"1.5px",display:"block",marginBottom:6,textTransform:"uppercase"}}>Your Message *</label>
                  <textarea value={composeText} onChange={e=>{setComposeText(e.target.value);setComposeMsg("");}}
                    placeholder="e.g. Need coverage for my shift, have a question about scheduling, requesting a change..."
                    rows={4}
                    style={{width:"100%",padding:"10px 12px",background:E.bg3,border:"1.5px solid "+(composeMsg&&composeMsg.startsWith("!")?"#ef4444":E.border),borderRadius:9,fontFamily:E.sans,fontSize:13,color:E.text,outline:"none",resize:"none",boxSizing:"border-box",marginBottom:12}}/>
                  {composeMsg&&(
                    <div style={{fontFamily:E.sans,fontSize:13,padding:"8px 12px",borderRadius:8,marginBottom:12,
                      color:composeMsg.startsWith("!")?E.red:E.green,
                      background:composeMsg.startsWith("!")?"rgba(239,68,68,0.08)":"rgba(16,185,129,0.08)",
                      border:"1px solid "+(composeMsg.startsWith("!")?"rgba(239,68,68,0.2)":"rgba(16,185,129,0.2)"),
                    }}>{composeMsg}</div>
                  )}
                  <div style={{display:"flex",gap:10}}>
                    <button onClick={()=>setComposeOpen(false)}
                      style={{flex:1,padding:"11px",background:E.bg3,border:"1px solid "+E.border,borderRadius:9,fontFamily:E.sans,fontWeight:600,color:E.textD,cursor:"pointer"}}>Cancel</button>
                    <button disabled={composeBusy} onClick={async()=>{
                      if(!composeText.trim()){setComposeMsg("! Please enter a message before sending");return;}
                      setComposeBusy(true);
                      try{
                        const {data:{session:ss}}=await (await getSB()).auth.getSession();
                        const r=await fetch("/api/messages",{method:"POST",
                          headers:{"Content-Type":"application/json",...(ss?.access_token?{"Authorization":"Bearer "+ss.access_token}:{})},
                          body:JSON.stringify({
                            orgId:empSafe.orgId, fromId:empSafe.id,
                            fromName:empSafe.name, toId:"managers",
                            text:composeText.trim(), type:"employee_to_manager",
                          })});
                        const d=await r.json();
                        if(!r.ok) throw new Error(d.error||"Failed");
                        setComposeMsg("✓ Message sent! Your manager has been notified.");
                        setComposeText("");
                        setTimeout(()=>setComposeOpen(false),2000);
                      }catch(e){ setComposeMsg("! Could not send: "+(e.message||"Try again")); }
                      finally{ setComposeBusy(false); }
                    }} style={{flex:2,padding:"11px",background:`linear-gradient(135deg,${E.indigo},${E.violet})`,border:"none",borderRadius:9,fontFamily:E.sans,fontWeight:700,fontSize:14,color:"#fff",cursor:composeBusy?"not-allowed":"pointer",opacity:composeBusy?0.7:1,boxShadow:"0 4px 14px rgba(99,102,241,0.3)"}}>
                      {composeBusy?"Sending...":"Send to Manager"}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Loading */}
            {!msgsLoaded&&(
              <div style={{textAlign:"center",padding:"40px",background:"#fff",borderRadius:14,border:"1px solid "+E.border}}>
                <div style={{fontFamily:E.sans,fontSize:13,color:E.textD}}>Loading messages…</div>
              </div>
            )}

            {/* Empty state - with prompt to message manager */}
            {msgsLoaded&&(threads||[]).length===0&&(
              <div style={{textAlign:"center",padding:"60px 20px",background:"#fff",borderRadius:16,border:"1px solid "+E.border,boxShadow:E.shadow}}>
                <div style={{fontSize:48,marginBottom:12}}>💬</div>
                <div style={{fontFamily:E.sans,fontWeight:700,fontSize:18,color:E.text,marginBottom:6}}>No messages yet</div>
                <div style={{fontFamily:E.sans,fontSize:13,color:E.textD,maxWidth:320,margin:"0 auto 16px"}}>Your manager will send updates here. You can also message them directly anytime.</div>
                <button onClick={()=>{setComposeOpen(true);setComposeMsg("");setComposeText("");}}
                  style={{padding:"10px 20px",background:`linear-gradient(135deg,${E.indigo},${E.violet})`,border:"none",borderRadius:10,fontFamily:E.sans,fontWeight:700,fontSize:13,color:"#fff",cursor:"pointer",boxShadow:"0 4px 12px rgba(99,102,241,0.3)"}}>
                  Send First Message
                </button>
              </div>
            )}

            {/* Thread list */}
            {(threads||[]).map(thread=>(
              <MessageThread key={thread.id} thread={thread} empSafe={empSafe} fmtTs={fmtTs} sendReply={sendReply} E={E}/>
            ))}
          </div>
          );
        })()}
        {tab==="recognition"&&(()=>{
          // Mirror the tier/points logic from My Growth tab
          const completedShifts = (empShifts||[]).filter(s=>s.status==="confirmed"||s.status==="published").length;
          let totalPoints = 500 + completedShifts*10 + Math.round((realMoHrs||0)*2);
          if(empSafe.streak>=14) totalPoints+=50;
          else if(empSafe.streak>=7) totalPoints+=25;
          if(empSafe.rel>=95) totalPoints+=30;
          if(empSafe.flags>0) totalPoints-=(empSafe.flags*15);
          totalPoints = Math.max(0,Math.min(1000,totalPoints));

          const TIERS=[
            {min:0,  max:199, label:"New Hire",      icon:"🌱",color:"#9ca3af"},
            {min:200,max:399, label:"Getting Started",icon:"📈",color:"#f59e0b"},
            {min:400,max:599, label:"Reliable",       icon:"✅",color:"#3b82f6"},
            {min:600,max:799, label:"Star Performer", icon:"⭐",color:"#8b5cf6"},
            {min:800,max:949, label:"Elite",          icon:"💎",color:"#0891b2"},
            {min:950,max:1000,label:"Legend",         icon:"🏆",color:"#f59e0b"},
          ];
          const tier=TIERS.find(t=>totalPoints>=t.min&&totalPoints<=t.max)||TIERS[0];

          const ALL_BADGES = [
            {icon:"🎯",label:"First Shift",   desc:"Complete your first shift",          earned:completedShifts>=1||empSafe.shifts>=1},
            {icon:"📅",label:"Week Warrior",  desc:"Complete a full week of shifts",       earned:completedShifts>=5||empSafe.shifts>=5},
            {icon:"⭐",label:"Reliable",       desc:"Reach 700+ reliability score",         earned:totalPoints>=700},
            {icon:"🔥",label:"On Fire",        desc:"Maintain a 7-day streak",             earned:empSafe.streak>=7},
            {icon:"💎",label:"Elite",          desc:"Reach 800+ score",                    earned:totalPoints>=800},
            {icon:"💪",label:"Overtime Hero",  desc:"Work 45+ hours in a week",            earned:empSafe.ot>0},
            {icon:"🤝",label:"Team Player",    desc:"Never miss a shift in a month",       earned:empSafe.flags===0&&completedShifts>0},
            {icon:"📈",label:"Improving",      desc:"Score increases 3 weeks in a row",    earned:totalPoints>=550},
            {icon:"🏆",label:"Legend",         desc:"Reach 950+ score — top tier",         earned:totalPoints>=950},
          ];
          const earned = ALL_BADGES.filter(b=>b.earned);
          const locked = ALL_BADGES.filter(b=>!b.earned);

          return(
          <div style={{animation:"fadeUp 0.3s ease",paddingBottom:40}}>
            <div style={{fontFamily:E.sans,fontWeight:800,fontSize:20,color:E.text,marginBottom:6}}>🏆 Achievements</div>
            <div style={{fontFamily:E.sans,fontSize:13,color:E.textD,marginBottom:20}}>Your earned badges and recognition milestones.</div>

            {/* Current tier hero card */}
            <div style={{background:`linear-gradient(135deg,${tier.color}25,${tier.color}08)`,border:`2px solid ${tier.color}50`,borderRadius:20,padding:"24px",marginBottom:20,textAlign:"center",position:"relative",overflow:"hidden"}}>
              <div style={{position:"absolute",right:16,top:16,fontSize:64,opacity:0.1}}>{tier.icon}</div>
              <div style={{fontSize:52,marginBottom:8}}>{tier.icon}</div>
              <div style={{fontFamily:E.sans,fontWeight:900,fontSize:28,color:tier.color,marginBottom:4}}>{tier.label}</div>
              <div style={{fontFamily:E.sans,fontSize:13,color:E.textD,marginBottom:12}}>You've earned <strong style={{color:tier.color}}>{earned.length} badge{earned.length!==1?"s":""}</strong> so far</div>
              <div style={{display:"flex",justifyContent:"center",gap:24}}>
                <div style={{textAlign:"center"}}>
                  <div style={{fontFamily:E.sans,fontWeight:800,fontSize:24,color:tier.color}}>{totalPoints}</div>
                  <div style={{fontFamily:E.mono,fontSize:9,color:E.textF}}>SCORE</div>
                </div>
                <div style={{width:1,background:E.border}}/>
                <div style={{textAlign:"center"}}>
                  <div style={{fontFamily:E.sans,fontWeight:800,fontSize:24,color:E.yellow}}>{empSafe.streak||0}d</div>
                  <div style={{fontFamily:E.mono,fontSize:9,color:E.textF}}>STREAK</div>
                </div>
                <div style={{width:1,background:E.border}}/>
                <div style={{textAlign:"center"}}>
                  <div style={{fontFamily:E.sans,fontWeight:800,fontSize:24,color:E.green}}>{completedShifts+(empSafe.shifts||0)}</div>
                  <div style={{fontFamily:E.mono,fontSize:9,color:E.textF}}>SHIFTS</div>
                </div>
              </div>
            </div>

            {/* Earned badges */}
            {earned.length>0&&(
              <div style={{marginBottom:20}}>
                <div style={{fontFamily:E.mono,fontSize:8,color:E.green,letterSpacing:"2px",marginBottom:12,textTransform:"uppercase"}}>✅ Earned — {earned.length} badge{earned.length!==1?"s":""}</div>
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
                  {earned.map(b=>(
                    <div key={b.label} style={{background:"#fff",border:"2px solid "+tier.color+"40",borderRadius:14,padding:"14px",display:"flex",alignItems:"center",gap:12,boxShadow:"0 2px 8px "+tier.color+"15"}}>
                      <div style={{width:44,height:44,borderRadius:12,background:tier.color+"15",display:"flex",alignItems:"center",justifyContent:"center",fontSize:24,flexShrink:0}}>{b.icon}</div>
                      <div style={{flex:1,minWidth:0}}>
                        <div style={{fontFamily:E.sans,fontWeight:700,fontSize:13,color:E.text}}>{b.label}</div>
                        <div style={{fontFamily:E.sans,fontSize:11,color:E.textD,marginTop:1,lineHeight:1.4}}>{b.desc}</div>
                        <div style={{fontFamily:E.mono,fontSize:9,color:tier.color,marginTop:4}}>✓ EARNED</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Locked badges */}
            {locked.length>0&&(
              <div>
                <div style={{fontFamily:E.mono,fontSize:8,color:E.textF,letterSpacing:"2px",marginBottom:12,textTransform:"uppercase"}}>🔒 Locked — {locked.length} remaining</div>
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
                  {locked.map(b=>(
                    <div key={b.label} style={{background:E.bg3,border:"1.5px solid "+E.border,borderRadius:14,padding:"14px",display:"flex",alignItems:"center",gap:12,opacity:0.55}}>
                      <div style={{width:44,height:44,borderRadius:12,background:"rgba(0,0,0,0.06)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:24,flexShrink:0,filter:"grayscale(1)"}}>{b.icon}</div>
                      <div style={{flex:1,minWidth:0}}>
                        <div style={{fontFamily:E.sans,fontWeight:700,fontSize:13,color:E.textD}}>{b.label}</div>
                        <div style={{fontFamily:E.sans,fontSize:11,color:E.textF,marginTop:1,lineHeight:1.4}}>{b.desc}</div>
                        <div style={{fontFamily:E.mono,fontSize:9,color:E.textF,marginTop:4}}>🔒 LOCKED</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {earned.length===0&&(
              <div style={{textAlign:"center",padding:"30px",background:"#fff",borderRadius:14,border:"1px solid "+E.border,marginTop:8}}>
                <div style={{fontSize:36,marginBottom:8}}>🚀</div>
                <div style={{fontFamily:E.sans,fontWeight:700,fontSize:15,color:E.text,marginBottom:6}}>Start earning badges</div>
                <div style={{fontFamily:E.sans,fontSize:13,color:E.textD}}>Clock in for your first shift to unlock your first achievement.</div>
              </div>
            )}
          </div>
          );
        })()}
        {tab==="documents"&&(()=>{
          // Profile save handler
          const CATS = [
            {id:"all",    label:"📁 All",       color:E.indigo},
            {id:"identity",label:"🪪 Identity",  color:"#0891b2"},
            {id:"tax",    label:"📝 Tax Forms",  color:"#7c3aed"},
            {id:"payroll",label:"💵 Pay Records",color:E.green},
            {id:"other",  label:"📎 Other",      color:E.textD},
          ];
          const CAT_INFO = {
            identity:{label:"Identity",icon:"🪪",desc:"Driver's license, passport, I-9, social security card"},
            tax:     {label:"Tax Forms",icon:"📝",desc:"W-2, W-4, 1099, state tax forms"},
            payroll: {label:"Pay Records",icon:"💵",desc:"Pay stubs, direct deposit confirmations"},
            other:   {label:"Other",icon:"📎",desc:"Certifications, agreements, custom documents"},
          };
          const filteredDocs = (empDocs||[]).filter(d=>docSubTab==="all"||d.category===docSubTab);
          const fmtSize = b => b>1048576?(b/1048576).toFixed(1)+"MB":b>1024?(b/1024).toFixed(0)+"KB":b+"B";
          const fmtDate = s => new Date(s).toLocaleDateString("en-US",{month:"short",day:"numeric",year:"numeric"});
          const fileIcon = t => t?.includes("pdf")?"📄":t?.includes("image")?"🖼️":t?.includes("word")?"📝":"📎";

          const handleUpload = async(file) => {
            if(!file||!docUploadName.trim()){ setDocMsg("⚠ Please enter a document name first"); return; }
            if(file.size>10*1024*1024){ setDocMsg("⚠ File must be under 10MB"); return; }
            const allowedTypes = ["application/pdf","image/jpeg","image/jpg","image/png","image/heic","application/msword","application/vnd.openxmlformats-officedocument.wordprocessingml.document"];
            if(!allowedTypes.includes(file.type)&&!file.name.match(/\.(pdf|jpg|jpeg|png|heic|doc|docx)$/i)){
              setDocMsg("⚠ File type not supported. Use PDF, JPG, PNG, or DOC.");
              return;
            }
            setDocUploading(true); setDocMsg("");
            try{
              const fd=new FormData();
              fd.append("file",file);
              fd.append("userId",empSafe.id);
              fd.append("orgId",empSafe.orgId||"");
              fd.append("name",docUploadName.trim());
              fd.append("category",docUploadCat);
              fd.append("notes",docUploadNotes);
              const {data:{session:ss}}=await (await getSB()).auth.getSession();
              const r=await fetch("/api/documents",{
                method:"POST",
                headers:ss?.access_token?{"Authorization":"Bearer "+ss.access_token}:{},
                body:fd,
              });
              const d=await r.json();
              if(!r.ok) throw new Error(d.error||"Upload failed");
              // Add to list immediately
              setEmpDocs(p=>[d.document,...(p||[])]);
              // Reset form
              setShowUploadForm(false);
              setDocUploadName("");
              setDocUploadCat("identity");
              setDocUploadNotes("");
              setDocSubTab("all"); // Switch to All to show the new doc
              setDocMsg("✓ "+file.name+" uploaded successfully!");
              setTimeout(()=>setDocMsg(""),5000);
            }catch(e){
              setDocMsg("Upload failed: "+e.message);
            }
            finally{ setDocUploading(false); }
          };

          const handleDownload = async(doc) => {
            setDocMsg(""); 
            try{
              const {data:{session:ss}}=await (await getSB()).auth.getSession();
              const r=await fetch(`/api/documents?userId=${empSafe.id}&action=download&docId=${doc.id}`,{
                headers:ss?.access_token?{"Authorization":"Bearer "+ss.access_token}:{}
              });
              const d=await r.json();
              if(d.url){ 
                window.open(d.url,"_blank");
              } else {
                setDocMsg("⚠ Could not generate download link. Try again.");
                setTimeout(()=>setDocMsg(""),4000);
              }
            }catch(e){ 
              setDocMsg("⚠ Download failed: "+e.message);
              setTimeout(()=>setDocMsg(""),4000);
            }
          };

          const handleDelete = async(docId) => {
            if(!confirm("Delete this document? This cannot be undone.")) return;
            try{
              const {data:{session:ss}}=await (await getSB()).auth.getSession();
              await fetch(`/api/documents?docId=${docId}`,{
                method:"DELETE",
                headers:ss?.access_token?{"Authorization":"Bearer "+ss.access_token}:{}
              });
              setEmpDocs(p=>(p||[]).filter(d=>d.id!==docId));
              setDocMsg("✓ Document deleted");
              setTimeout(()=>setDocMsg(""),3000);
            }catch(e){ setDocMsg("Delete failed"); }
          };

          return(
          <div style={{animation:"fadeUp 0.3s ease",paddingBottom:40}}>

            {/* ── My Profile Card ── */}
            <div style={{background:"#fff",border:"1.5px solid "+E.border,borderRadius:16,padding:"18px 20px",marginBottom:16,boxShadow:E.shadow}}>
              <div style={{display:"flex",alignItems:"center",gap:14}}>
                <div style={{width:54,height:54,borderRadius:"50%",background:empSafe.color||E.indigo,display:"flex",alignItems:"center",justifyContent:"center",fontFamily:E.mono,fontWeight:700,fontSize:18,color:"#fff",flexShrink:0}}>{empSafe.avatar}</div>
                <div style={{flex:1,minWidth:0}}>
                  <div style={{fontFamily:E.sans,fontWeight:800,fontSize:17,color:E.text}}>{empSafe.name}</div>
                  <div style={{fontFamily:E.sans,fontSize:12,color:E.textD,marginTop:1}}>{empSafe.role}{empSafe.dept?" — "+empSafe.dept:""}</div>
                  {empLocationName&&<div style={{fontFamily:E.mono,fontSize:9,color:E.indigo,letterSpacing:1,marginTop:3}}>📍 {empLocationName}</div>}
                  {emp.locations&&emp.locations.length>0&&(
                    <div style={{display:"flex",gap:4,flexWrap:"wrap",marginTop:4}}>
                      {emp.locations.map(loc=>(
                        <span key={loc.id} style={{fontFamily:E.mono,fontSize:8,color:E.indigo,background:E.indigoD,border:"1px solid "+E.indigo+"30",borderRadius:10,padding:"1px 7px",letterSpacing:0.5}}>📍 {loc.name}</span>
                      ))}
                    </div>
                  )}
                </div>
                <button onClick={()=>{
                  if(!profileEdit){
                    // Populate form fresh from current empSafe before opening
                    setProfileForm({
                      firstName: empSafe.first && empSafe.first!=="there" ? empSafe.first : "",
                      lastName:  empSafe.name ? empSafe.name.split(" ").slice(1).join(" ") : "",
                      nick:      empSafe.nick  || "",
                      title:     empSafe.role && empSafe.role!=="Employee" ? empSafe.role : "",
                      phone:     emp.phone     || "",
                      emergency: emp.emergency || "",
                    });
                    setProfileMsg("");
                  }
                  setProfileEdit(o=>!o);
                }} style={{padding:"7px 14px",background:profileEdit?"rgba(0,0,0,0.04)":E.indigoD,border:"1px solid "+E.indigo+"25",borderRadius:9,fontFamily:E.sans,fontWeight:600,fontSize:12,color:profileEdit?E.textD:E.indigo,cursor:"pointer",flexShrink:0}}>
                  {profileEdit?"Cancel":"Edit Profile"}
                </button>
              </div>

              {profileEdit&&(
                <div style={{marginTop:14,paddingTop:14,borderTop:"1px solid "+E.border}}>
                  {/* Nickname + Title — shown prominently first */}
                  <div style={{background:E.indigoD,border:"1px solid "+E.indigo+"25",borderRadius:10,padding:"12px",marginBottom:12}}>
                    <div style={{fontFamily:E.mono,fontSize:8,color:E.indigo,letterSpacing:"1.5px",marginBottom:8,textTransform:"uppercase",fontWeight:700}}>What Shows On Your Profile</div>
                    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
                      <div>
                        <label style={{fontFamily:E.mono,fontSize:8,color:E.textF,letterSpacing:"1.5px",display:"block",marginBottom:4,textTransform:"uppercase"}}>Nickname / Display Name</label>
                        <input value={profileForm.nick||""} onChange={e=>setProfileForm(p=>({...p,nick:e.target.value}))}
                          placeholder="e.g. Jake, Kiki, Coach..."
                          style={{width:"100%",padding:"9px 10px",background:"#fff",border:"1.5px solid "+E.indigo+"40",borderRadius:7,fontFamily:E.sans,fontSize:13,color:E.text,outline:"none",boxSizing:"border-box"}}/>
                        <div style={{fontFamily:E.mono,fontSize:8,color:E.textF,marginTop:3}}>Shows in greeting + header</div>
                      </div>
                      <div>
                        <label style={{fontFamily:E.mono,fontSize:8,color:E.textF,letterSpacing:"1.5px",display:"block",marginBottom:4,textTransform:"uppercase"}}>Job Title</label>
                        <input value={profileForm.title||""} onChange={e=>setProfileForm(p=>({...p,title:e.target.value}))}
                          placeholder="e.g. Barista, Bartender, Co-Manager..."
                          style={{width:"100%",padding:"9px 10px",background:"#fff",border:"1.5px solid "+E.indigo+"40",borderRadius:7,fontFamily:E.sans,fontSize:13,color:E.text,outline:"none",boxSizing:"border-box"}}/>
                        <div style={{fontFamily:E.mono,fontSize:8,color:E.textF,marginTop:3}}>Shows on shift cards</div>
                      </div>
                    </div>
                  </div>
                  {/* Legal name + contact */}
                  <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:12}}>
                    {[
                      {l:"First Name",k:"firstName",ph:"Legal first name"},
                      {l:"Last Name",k:"lastName",ph:"Legal last name"},
                      {l:"Phone",k:"phone",ph:"(555) 000-0000"},
                      {l:"Emergency Contact",k:"emergency",ph:"Name and number"},
                    ].map(f=>(
                      <div key={f.k}>
                        <label style={{fontFamily:E.mono,fontSize:8,color:E.textF,letterSpacing:"1.5px",display:"block",marginBottom:4,textTransform:"uppercase"}}>{f.l}</label>
                        <input value={profileForm[f.k]||""} onChange={e=>setProfileForm(p=>({...p,[f.k]:e.target.value}))} placeholder={f.ph}
                          style={{width:"100%",padding:"8px 10px",background:E.bg3,border:"1px solid "+E.border,borderRadius:7,fontFamily:E.sans,fontSize:13,color:E.text,outline:"none",boxSizing:"border-box"}}/>
                      </div>
                    ))}
                  </div>
                  {profileMsg&&<div style={{fontFamily:E.sans,fontSize:12,color:profileMsg.startsWith("✓")?E.green:E.red,marginBottom:8}}>{profileMsg}</div>}
                  <button onClick={saveProfile} disabled={profileBusy}
                    style={{width:"100%",padding:"11px",background:`linear-gradient(135deg,${E.indigo},${E.violet})`,border:"none",borderRadius:9,fontFamily:E.sans,fontWeight:700,fontSize:13,color:"#fff",cursor:"pointer",boxShadow:"0 4px 12px rgba(99,102,241,0.25)"}}>
                    {profileBusy?"Saving...":"Save Profile"}
                  </button>
                </div>
              )}
              {!profileEdit&&profileMsg&&<div style={{fontFamily:E.sans,fontSize:12,color:E.green,marginTop:8}}>{profileMsg}</div>}
            </div>
            {/* Header */}
            <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:16}}>
              <div>
                <div style={{fontFamily:E.sans,fontWeight:800,fontSize:20,color:E.text}}>📁 My Documents</div>
                <div style={{fontFamily:E.sans,fontSize:12,color:E.textD,marginTop:2}}>Your employee file — upload and access your documents securely</div>
              </div>
              <button onClick={()=>setShowUploadForm(o=>!o)} style={{padding:"9px 16px",background:showUploadForm?"rgba(0,0,0,0.05)":`linear-gradient(135deg,${E.indigo},${E.violet})`,border:"none",borderRadius:10,fontFamily:E.sans,fontWeight:700,fontSize:13,color:showUploadForm?E.textD:"#fff",cursor:"pointer",boxShadow:showUploadForm?"none":"0 4px 12px rgba(99,102,241,0.3)"}}>
                {showUploadForm?"✕ Cancel":"+ Upload"}
              </button>
            </div>

            {/* Upload form */}
            {showUploadForm&&(
              <div style={{background:"#fff",border:"1.5px solid "+E.indigo+"40",borderRadius:14,padding:"20px",marginBottom:16,boxShadow:"0 4px 20px rgba(99,102,241,0.1)"}}>
                <div style={{fontFamily:E.sans,fontWeight:700,fontSize:15,color:E.text,marginBottom:14}}>Upload Document</div>
                <div style={{marginBottom:12}}>
                  <label style={{fontFamily:E.mono,fontSize:8,color:E.textF,letterSpacing:"1.5px",display:"block",marginBottom:5,textTransform:"uppercase"}}>Document Name *</label>
                  <select value={docUploadName} onChange={e=>{
                    setDocUploadName(e.target.value);
                    // Auto-set category based on selection
                    if(e.target.value==="Driver's License") setDocUploadCat("identity");
                    else if(e.target.value==="W-4"||e.target.value==="W-2"||e.target.value==="1099") setDocUploadCat("tax");
                    else if(e.target.value==="Other") setDocUploadCat("other");
                  }} style={{width:"100%",padding:"9px 12px",background:E.bg3,border:"1px solid "+E.border,borderRadius:8,fontFamily:E.sans,fontSize:13,color:docUploadName?E.text:E.textF,outline:"none",cursor:"pointer",boxSizing:"border-box"}}>
                    <option value="" disabled>— Select document type —</option>
                    <option value="Driver's License">🪪 Driver's License</option>
                    <option value="W-4">📝 W-4 — Employee Withholding</option>
                    <option value="W-2">📄 W-2 — Wage & Tax Statement</option>
                    <option value="1099">📋 1099 — Contractor Income</option>
                    <option value="Other">📎 Other</option>
                  </select>
                </div>
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:12}}>
                  <div>
                    <label style={{fontFamily:E.mono,fontSize:8,color:E.textF,letterSpacing:"1.5px",display:"block",marginBottom:5,textTransform:"uppercase"}}>Category</label>
                    <select value={docUploadCat} onChange={e=>setDocUploadCat(e.target.value)}
                      style={{width:"100%",padding:"9px 12px",background:E.bg3,border:"1px solid "+E.border,borderRadius:8,fontFamily:E.sans,fontSize:13,color:E.text,outline:"none",cursor:"pointer",boxSizing:"border-box"}}>
                      <option value="identity">🪪 Identity</option>
                      <option value="tax">📝 Tax Forms</option>
                      <option value="payroll">💵 Pay Records</option>
                      <option value="other">📎 Other</option>
                    </select>
                  </div>
                  <div>
                    <label style={{fontFamily:E.mono,fontSize:8,color:E.textF,letterSpacing:"1.5px",display:"block",marginBottom:5,textTransform:"uppercase"}}>Notes (optional)</label>
                    <input value={docUploadNotes} onChange={e=>setDocUploadNotes(e.target.value)} placeholder="e.g. Expires 2027"
                      style={{width:"100%",padding:"9px 12px",background:E.bg3,border:"1px solid "+E.border,borderRadius:8,fontFamily:E.sans,fontSize:13,color:E.text,outline:"none",boxSizing:"border-box"}}/>
                  </div>
                </div>
                {/* File selection buttons */}
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:12}}>
                  <label style={{display:"block",border:"2px dashed "+E.indigo+"60",borderRadius:10,padding:"20px",textAlign:"center",cursor:"pointer",background:E.indigoD}}>
                    <input type="file" accept=".pdf,.jpg,.jpeg,.png,.doc,.docx" style={{display:"none"}}
                      onChange={e=>{ if(e.target.files?.[0]) handleUpload(e.target.files[0]); }}/>
                    <div style={{fontSize:28,marginBottom:6}}>📎</div>
                    <div style={{fontFamily:E.sans,fontWeight:600,fontSize:13,color:E.indigo,marginBottom:2}}>{docUploading?"Uploading…":"Choose File"}</div>
                    <div style={{fontFamily:E.mono,fontSize:9,color:E.textF}}>PDF, JPG, PNG, DOC</div>
                  </label>
                  <label style={{display:"block",border:"2px dashed #0891b2",borderRadius:10,padding:"20px",textAlign:"center",cursor:"pointer",background:"rgba(8,145,178,0.06)"}}>
                    <input type="file" accept="image/*" capture="environment" style={{display:"none"}}
                      onChange={e=>{ if(e.target.files?.[0]) handleUpload(e.target.files[0]); }}/>
                    <div style={{fontSize:28,marginBottom:6}}>📷</div>
                    <div style={{fontFamily:E.sans,fontWeight:600,fontSize:13,color:"#0891b2",marginBottom:2}}>Take Photo</div>
                    <div style={{fontFamily:E.mono,fontSize:9,color:E.textF}}>Use camera</div>
                  </label>
                </div>
                {docMsg&&<div style={{fontFamily:E.sans,fontSize:13,color:docMsg.startsWith("✓")?E.green:E.red,padding:"8px 12px",background:docMsg.startsWith("✓")?"rgba(16,185,129,0.08)":"rgba(239,68,68,0.08)",borderRadius:8}}>{docMsg}</div>}
              </div>
            )}

            {/* Status message */}
            {!showUploadForm&&docMsg&&(
              <div style={{padding:"10px 14px",background:docMsg.startsWith("✓")?"rgba(16,185,129,0.1)":"rgba(239,68,68,0.08)",border:"1px solid "+(docMsg.startsWith("✓")?"rgba(16,185,129,0.25)":"rgba(239,68,68,0.2)"),borderRadius:9,marginBottom:14,fontFamily:E.sans,fontSize:13,color:docMsg.startsWith("✓")?E.green:E.red}}>
                {docMsg}
              </div>
            )}

            {/* Category tabs */}
            <div style={{display:"flex",gap:6,marginBottom:16,overflowX:"auto",paddingBottom:2}}>
              {CATS.map(c=>{
                const count=c.id==="all"?(empDocs||[]).length:(empDocs||[]).filter(d=>d.category===c.id).length;
                return(
                  <button key={c.id} onClick={()=>setDocSubTab(c.id)} style={{padding:"7px 14px",borderRadius:20,border:"none",fontFamily:E.sans,fontWeight:600,fontSize:12,cursor:"pointer",whiteSpace:"nowrap",flexShrink:0,background:docSubTab===c.id?c.color:"rgba(0,0,0,0.05)",color:docSubTab===c.id?"#fff":E.textD,transition:"all 0.15s"}}>
                    {c.label} {count>0&&<span style={{background:"rgba(255,255,255,0.3)",borderRadius:10,padding:"1px 6px",fontSize:10,marginLeft:3}}>{count}</span>}
                  </button>
                );
              })}
            </div>

            {/* What to upload guide when empty */}
            {empDocs===null&&(
              <div style={{textAlign:"center",padding:"40px",background:"#fff",borderRadius:14,border:"1px solid "+E.border}}>
                <div style={{fontSize:32,marginBottom:8}}>⏳</div>
                <div style={{fontFamily:E.sans,fontSize:14,color:E.textD}}>Loading documents…</div>
              </div>
            )}

            {empDocs!==null&&filteredDocs.length===0&&(
              <div>
                {/* Tax Forms — W-4 employee uploads, W-2 employer uploads */}
                {docSubTab==="tax"&&(
                  <div style={{background:"#fff",border:"1.5px solid rgba(124,58,237,0.2)",borderRadius:14,padding:"28px",textAlign:"center",marginBottom:12}}>
                    <div style={{fontSize:40,marginBottom:10}}>📝</div>
                    <div style={{fontFamily:E.sans,fontWeight:700,fontSize:16,color:E.text,marginBottom:6}}>Tax Forms</div>
                    <div style={{fontFamily:E.sans,fontSize:13,color:E.textD,marginBottom:20,maxWidth:360,margin:"0 auto 20px"}}>Upload your W-4 below so your employer knows your withholding. Your W-2 will appear here automatically when your employer uploads it at year end.</div>
                    <div style={{display:"flex",gap:10,justifyContent:"center",flexWrap:"wrap"}}>
                      <div style={{padding:"10px 16px",background:"rgba(124,58,237,0.08)",border:"1px solid rgba(124,58,237,0.2)",borderRadius:8,textAlign:"left"}}><div style={{fontFamily:E.mono,fontSize:9,color:"#7c3aed",letterSpacing:1,marginBottom:3}}>📝 W-4 — Employee Withholding</div><div style={{fontFamily:E.sans,fontSize:11,color:E.textD}}>You fill this out & upload it</div></div>
                      <div style={{padding:"10px 16px",background:"rgba(124,58,237,0.04)",border:"1px dashed rgba(124,58,237,0.2)",borderRadius:8,textAlign:"left"}}><div style={{fontFamily:E.mono,fontSize:9,color:"#9ca3af",letterSpacing:1,marginBottom:3}}>⏳ W-2 — Year-End Earnings</div><div style={{fontFamily:E.sans,fontSize:11,color:E.textF}}>Your employer uploads by Jan 31</div></div>
                    </div>
                    <button onClick={()=>{ setShowUploadForm(true); setDocUploadCat("tax"); setDocUploadName("W-4 Employee Withholding"); }}
                      style={{marginTop:16,padding:"9px 20px",background:"rgba(124,58,237,0.1)",border:"1.5px solid rgba(124,58,237,0.25)",borderRadius:8,fontFamily:E.sans,fontWeight:600,fontSize:13,color:"#7c3aed",cursor:"pointer"}}>
                      + Upload My W-4
                    </button>
                  </div>
                )}

                {/* Pay Records — system generates these */}
                {docSubTab==="payroll"&&(
                  <div style={{background:"#fff",border:"1.5px solid rgba(26,158,110,0.2)",borderRadius:14,padding:"28px",textAlign:"center",marginBottom:12}}>
                    <div style={{fontSize:40,marginBottom:10}}>💵</div>
                    <div style={{fontFamily:E.sans,fontWeight:700,fontSize:16,color:E.text,marginBottom:6}}>Pay Records</div>
                    <div style={{fontFamily:E.sans,fontSize:13,color:E.textD,marginBottom:20,maxWidth:320,margin:"0 auto 20px"}}>Pay stubs and earnings records will appear here each pay period. Your employer uploads these directly to your file.</div>
                    <div style={{background:"rgba(26,158,110,0.06)",border:"1px dashed rgba(26,158,110,0.3)",borderRadius:10,padding:"14px",marginBottom:16,display:"inline-flex",alignItems:"center",gap:10}}>
                      <span style={{fontSize:18}}>🔔</span>
                      <span style={{fontFamily:E.sans,fontSize:12,color:E.green}}>You'll be notified when a new pay stub is available</span>
                    </div>
                    <div style={{fontFamily:E.mono,fontSize:10,color:E.textF}}>Connected payroll systems: QuickBooks Online (coming soon)</div>
                  </div>
                )}

                {/* Identity & Other — employee uploads */}
                {(docSubTab==="identity"||docSubTab==="other")&&(
                  <div style={{textAlign:"center",padding:"40px 20px",background:"#fff",borderRadius:14,border:"1px solid "+E.border,marginBottom:16}}>
                    <div style={{fontSize:40,marginBottom:10}}>📂</div>
                    <div style={{fontFamily:E.sans,fontWeight:700,fontSize:16,color:E.text,marginBottom:6}}>
                      No {CAT_INFO[docSubTab]?.label} documents yet
                    </div>
                    <div style={{fontFamily:E.sans,fontSize:13,color:E.textD,marginBottom:16}}>{CAT_INFO[docSubTab]?.desc}</div>
                    <button onClick={()=>{ setShowUploadForm(true); setDocUploadCat(docSubTab); }}
                      style={{padding:"9px 20px",background:E.indigoD,border:"1.5px solid "+E.indigo+"40",borderRadius:8,fontFamily:E.sans,fontWeight:600,fontSize:13,color:E.indigo,cursor:"pointer"}}>
                      + Upload {CAT_INFO[docSubTab]?.label}
                    </button>
                  </div>
                )}

                {/* All tab empty */}
                {docSubTab==="all"&&(
                  <div>
                    <div style={{textAlign:"center",padding:"32px 20px",background:"#fff",borderRadius:14,border:"1px solid "+E.border,marginBottom:16}}>
                      <div style={{fontSize:40,marginBottom:10}}>📁</div>
                      <div style={{fontFamily:E.sans,fontWeight:700,fontSize:16,color:E.text,marginBottom:6}}>No documents yet</div>
                      <div style={{fontFamily:E.sans,fontSize:13,color:E.textD,marginBottom:16}}>Upload your identity documents. Pay stubs and tax forms will appear here when your employer adds them.</div>
                      <button onClick={()=>setShowUploadForm(true)}
                        style={{padding:"9px 20px",background:`linear-gradient(135deg,${E.indigo},${E.violet})`,border:"none",borderRadius:8,fontFamily:E.sans,fontWeight:700,fontSize:13,color:"#fff",cursor:"pointer",boxShadow:"0 4px 12px rgba(99,102,241,0.3)"}}>
                        + Upload My First Document
                      </button>
                    </div>
                  <div style={{background:"#fff",border:"1px solid "+E.border,borderRadius:14,padding:"16px 18px"}}>
                    <div style={{fontFamily:E.sans,fontWeight:700,fontSize:14,color:E.text,marginBottom:12}}>📋 Documents to Upload</div>
                    {[
                      {key:"identity",info:CAT_INFO.identity,uploadable:true},
                      {key:"tax",info:CAT_INFO.tax,uploadable:true,note:"Employer also uploads W-2s here"},
                      {key:"payroll",info:CAT_INFO.payroll,uploadable:false,note:"Auto-populated each pay period"},
                      {key:"other",info:CAT_INFO.other,uploadable:true},
                    ].map(({key,info,uploadable,note})=>(
                      <div key={key} style={{display:"flex",alignItems:"flex-start",gap:12,padding:"10px 0",borderBottom:"1px solid "+E.border}}>
                        <span style={{fontSize:20,flexShrink:0}}>{info.icon}</span>
                        <div style={{flex:1}}>
                          <div style={{fontFamily:E.sans,fontWeight:600,fontSize:13,color:E.text}}>{info.label}</div>
                          <div style={{fontFamily:E.sans,fontSize:12,color:E.textD,marginTop:2}}>{info.desc}</div>
                          {note&&<div style={{fontFamily:E.mono,fontSize:9,color:E.indigo,marginTop:3}}>ℹ {note}</div>}
                        </div>
                        {uploadable?(
                          <button onClick={()=>{ setDocUploadCat(key); setShowUploadForm(true); }}
                            style={{padding:"5px 12px",background:"none",border:"1px solid "+E.border,borderRadius:7,fontFamily:E.sans,fontSize:11,color:E.textD,cursor:"pointer",flexShrink:0}}>
                            Upload
                          </button>
                        ):(
                          <span style={{fontFamily:E.mono,fontSize:9,color:E.green,background:"rgba(16,185,129,0.08)",border:"1px solid rgba(16,185,129,0.2)",borderRadius:6,padding:"4px 8px",flexShrink:0}}>Auto</span>
                        )}
                      </div>
                    ))}
                  </div>
                  </div>
                )}
              </div>
            )}

            {/* Document list */}
            {filteredDocs.length>0&&(
              <div style={{display:"flex",flexDirection:"column",gap:8}}>
                {filteredDocs.map(doc=>(
                  <div key={doc.id} style={{background:"#fff",border:"1px solid "+E.border,borderRadius:12,padding:"14px 16px",display:"flex",alignItems:"center",gap:12,boxShadow:E.shadow}}>
                    <div style={{width:44,height:44,borderRadius:10,background:
                      doc.category==="identity"?"rgba(8,145,178,0.12)":
                      doc.category==="tax"?"rgba(124,58,237,0.12)":
                      doc.category==="payroll"?"rgba(26,158,110,0.12)":"rgba(0,0,0,0.05)",
                      display:"flex",alignItems:"center",justifyContent:"center",fontSize:22,flexShrink:0}}>
                      {fileIcon(doc.file_type)}
                    </div>
                    <div style={{flex:1,minWidth:0}}>
                      <div style={{fontFamily:E.sans,fontWeight:700,fontSize:14,color:E.text,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{doc.name}</div>
                      <div style={{display:"flex",alignItems:"center",gap:8,marginTop:3,flexWrap:"wrap"}}>
                        <span style={{fontFamily:E.mono,fontSize:9,color:"#fff",background:
                          doc.category==="identity"?"#0891b2":doc.category==="tax"?"#7c3aed":doc.category==="payroll"?E.green:E.textD,
                          padding:"2px 7px",borderRadius:10}}>
                          {CAT_INFO[doc.category]?.icon} {CAT_INFO[doc.category]?.label}
                        </span>
                        <span style={{fontFamily:E.mono,fontSize:10,color:E.textF}}>{fmtDate(doc.created_at)}</span>
                        {doc.file_size&&<span style={{fontFamily:E.mono,fontSize:10,color:E.textF}}>{fmtSize(doc.file_size)}</span>}
                      </div>
                      {doc.notes&&<div style={{fontFamily:E.sans,fontSize:11,color:E.textD,marginTop:3}}>{doc.notes}</div>}
                    </div>
                    <div style={{display:"flex",gap:6,flexShrink:0}}>
                      <button onClick={()=>handleDownload(doc)} style={{padding:"7px 12px",background:E.indigoD,border:"1px solid "+E.indigo+"30",borderRadius:7,fontFamily:E.sans,fontWeight:600,fontSize:12,color:E.indigo,cursor:"pointer"}}>
                        ⬇ View
                      </button>
                      <button onClick={()=>handleDelete(doc.id)} style={{padding:"7px 10px",background:"rgba(239,68,68,0.06)",border:"1px solid rgba(239,68,68,0.15)",borderRadius:7,fontFamily:E.sans,fontSize:12,color:E.red,cursor:"pointer"}}>
                        🗑
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          );
        })()}
      </div>
      {swapOpen&&(
        <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.45)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:300,padding:16}} onClick={()=>setSwapOpen(false)}>
          <div style={{background:E.bg2,borderRadius:18,padding:"26px",width:"100%",maxWidth:420,boxShadow:E.shadowB}} onClick={e=>e.stopPropagation()}>
            <div style={{fontFamily:E.sans,fontWeight:800,fontSize:18,color:E.text,marginBottom:4}}>🔄 Request Shift Swap</div>
            <div style={{fontFamily:E.sans,fontSize:13,color:E.textD,marginBottom:18}}>Select the shift you need covered and your manager will review it.</div>

            {/* My upcoming shifts quick-pick */}
            {(empShifts||[]).length>0&&(
              <div style={{marginBottom:14}}>
                <label style={{fontFamily:E.mono,fontSize:9,color:E.textF,letterSpacing:"1.5px",display:"block",marginBottom:8,textTransform:"uppercase"}}>Select a Scheduled Shift</label>
                <div style={{display:"flex",flexDirection:"column",gap:6,maxHeight:180,overflowY:"auto"}}>
                  {(empShifts||[]).slice(0,6).map(s=>{
                    const fH=h=>h===0?"12am":h<12?h+"am":h===12?"12pm":(h-12)+"pm";
                    const label=`${s.day_of_week} ${s.shift_date} - ${fH(s.start_hour)}–${fH(s.end_hour)}`;
                    const isSelected=swapShiftPick===s.id;
                    return(
                      <button key={s.id} onClick={()=>{ setSwapShiftPick(s.id); setSwapDate(s.shift_date); }}
                        style={{padding:"10px 12px",background:isSelected?E.indigoD:"#fff",border:`1.5px solid ${isSelected?E.indigo:E.border}`,borderRadius:9,fontFamily:E.sans,fontSize:13,color:isSelected?E.indigo:E.text,cursor:"pointer",textAlign:"left",transition:"all 0.15s"}}>
                        <span style={{fontWeight:isSelected?700:500}}>📅 {label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Manual date if no shifts or different date needed */}
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:12}}>
              <div>
                <label style={{fontFamily:E.mono,fontSize:9,color:E.textF,letterSpacing:"1.5px",display:"block",marginBottom:5,textTransform:"uppercase"}}>Shift Date</label>
                <input type="date" value={swapDate||""} onChange={e=>{setSwapDate(e.target.value);setSwapShiftPick("");}}
                  min={new Date().toISOString().split("T")[0]}
                  style={{width:"100%",padding:"9px 10px",background:E.bg3,border:`1px solid ${E.border}`,borderRadius:8,fontFamily:E.sans,fontSize:13,color:E.text,outline:"none",boxSizing:"border-box"}}/>
              </div>
              <div>
                <label style={{fontFamily:E.mono,fontSize:9,color:E.textF,letterSpacing:"1.5px",display:"block",marginBottom:5,textTransform:"uppercase"}}>Time Needed Off</label>
                <select value={swapReason.includes("AM")||swapReason.includes("PM")?swapReason:""} onChange={e=>{ if(e.target.value) setSwapReason(e.target.value); }}
                  style={{width:"100%",padding:"9px 10px",background:E.bg3,border:`1px solid ${E.border}`,borderRadius:8,fontFamily:E.sans,fontSize:12,color:E.text,outline:"none",cursor:"pointer",boxSizing:"border-box"}}>
                  <option value="">— Full shift —</option>
                  <option value="Entire shift">Entire shift</option>
                  <option value="Morning (AM)">Morning (AM)</option>
                  <option value="Afternoon (PM)">Afternoon (PM)</option>
                  <option value="First half">First half</option>
                  <option value="Second half">Second half</option>
                </select>
              </div>
            </div>

            <div style={{marginBottom:16}}>
              <label style={{fontFamily:E.mono,fontSize:9,color:E.textF,letterSpacing:"1.5px",display:"block",marginBottom:5,textTransform:"uppercase"}}>Reason for Swap *</label>
              <textarea value={swapReason||""} onChange={e=>{setSwapReason(e.target.value);setSwapDone("");}}
                placeholder="e.g. Doctor appointment, family obligation, car trouble..."
                rows={3}
                style={{width:"100%",padding:"10px 12px",background:E.bg3,border:`1.5px solid ${swapDone&&swapDone.startsWith("⚠")?"#ef4444":E.border}`,borderRadius:8,fontFamily:E.sans,fontSize:13,color:E.text,outline:"none",resize:"none",boxSizing:"border-box",transition:"border-color 0.2s"}}/>
            </div>

            {swapDone&&(
              <div style={{
                fontFamily:E.sans,fontSize:13,
                color:swapDone.startsWith("⚠")?E.red:E.green,
                marginBottom:10,padding:"9px 12px",
                background:swapDone.startsWith("⚠")?"rgba(239,68,68,0.08)":"rgba(16,185,129,0.08)",
                border:`1px solid ${swapDone.startsWith("⚠")?"rgba(239,68,68,0.25)":"rgba(16,185,129,0.25)"}`,
                borderRadius:8,
              }}>{swapDone}</div>
            )}
            <div style={{display:"flex",gap:10}}>
              <button onClick={()=>{setSwapOpen(false);setSwapReason("");setSwapDate("");setSwapShiftPick("");setSwapDone("");}}
                style={{flex:1,padding:"11px",background:E.bg3,border:`1px solid ${E.border}`,borderRadius:9,fontFamily:E.sans,fontWeight:600,color:E.textD,cursor:"pointer"}}>Cancel</button>
              <button onClick={async()=>{
                if(!swapReason?.trim()){setSwapDone("⚠ Please enter a reason for the swap request");return;}
                if(!swapDate){setSwapDone("⚠ Please select the shift date");return;}
                try{
                  const {data:{session:ssSw}}=await (await getSB()).auth.getSession();
                  const r=await fetch("/api/employee",{method:"POST",
                    headers:{"Content-Type":"application/json",...(ssSw?.access_token?{"Authorization":"Bearer "+ssSw.access_token}:{})},
                    body:JSON.stringify({_action:"swap_request",userId:empSafe.id,orgId:empSafe.orgId||null,
                      reason:swapReason.trim(),shiftDate:swapDate,shiftId:swapShiftPick||null})});
                  const d=await r.json();
                  if(!r.ok) throw new Error(d.error);
                  setSwapDone("✓ Swap request sent to your manager!");
                  setSwapReason(""); setSwapDate(""); setSwapShiftPick("");
                  setTimeout(()=>{setSwapOpen(false);setSwapDone("");},2000);
                }catch(e){setSwapDone("⚠ Could not submit: "+(e.message||"Please try again"));}
              }} style={{flex:1,padding:"11px",background:`linear-gradient(135deg,${E.indigo},${E.violet})`,border:"none",borderRadius:9,fontFamily:E.sans,fontWeight:700,fontSize:14,color:"#fff",cursor:"pointer",boxShadow:"0 4px 14px rgba(99,102,241,0.3)"}}>Submit Request</button>
            </div>
          </div>
        </div>
      )}
      {toOpen&&(
        <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.4)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:300,padding:16}} onClick={()=>setToOpen(false)}>
          <div style={{background:E.bg2,borderRadius:16,padding:"26px",width:"100%",maxWidth:380,boxShadow:E.shadowB}} onClick={e=>e.stopPropagation()}>
            <div style={{fontFamily:E.sans,fontWeight:800,fontSize:18,color:E.text,marginBottom:4}}>📆 Request Time Off</div>
            <div style={{fontFamily:E.sans,fontSize:13,color:E.textD,marginBottom:18}}>Submit your request and your manager will review it.</div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:12}}>
              <div>
                <label style={{fontFamily:E.mono,fontSize:9,color:E.textF,letterSpacing:"1.5px",display:"block",marginBottom:5,textTransform:"uppercase"}}>Start Date</label>
                <input type="date" value={toStart||""} onChange={e=>setToStart(e.target.value)} style={{width:"100%",padding:"9px 10px",background:E.bg3,border:`1px solid ${E.border}`,borderRadius:8,fontFamily:E.sans,fontSize:13,color:E.text,outline:"none",boxSizing:"border-box"}}/>
              </div>
              <div>
                <label style={{fontFamily:E.mono,fontSize:9,color:E.textF,letterSpacing:"1.5px",display:"block",marginBottom:5,textTransform:"uppercase"}}>End Date</label>
                <input type="date" value={toEnd||""} onChange={e=>setToEnd(e.target.value)} style={{width:"100%",padding:"9px 10px",background:E.bg3,border:`1px solid ${E.border}`,borderRadius:8,fontFamily:E.sans,fontSize:13,color:E.text,outline:"none",boxSizing:"border-box"}}/>
              </div>
            </div>
            <label style={{fontFamily:E.mono,fontSize:9,color:E.textF,letterSpacing:"1.5px",display:"block",marginBottom:5,textTransform:"uppercase"}}>Reason (optional)</label>
            <textarea value={toReason||""} onChange={e=>setToReason(e.target.value)} placeholder="e.g. Vacation, medical, personal..." rows={2}
              style={{width:"100%",padding:"10px 12px",background:E.bg3,border:`1px solid ${E.border}`,borderRadius:8,fontFamily:E.sans,fontSize:13,color:E.text,outline:"none",resize:"vertical",boxSizing:"border-box",marginBottom:16}}/>
            {toDone&&<div style={{fontFamily:E.sans,fontSize:13,color:"#10b981",marginBottom:10,textAlign:"center"}}>{toDone}</div>}
            <div style={{display:"flex",gap:10}}>
              <button onClick={()=>{setToOpen(false);setToStart("");setToEnd("");setToReason("");setToDone("");}} style={{flex:1,padding:"10px",background:E.bg3,border:`1px solid ${E.border}`,borderRadius:8,fontFamily:E.sans,fontWeight:600,color:E.textD,cursor:"pointer"}}>Cancel</button>
              <button onClick={async()=>{
                if(!toStart||!toEnd){setSyncMsg("Please select start and end dates");setTimeout(()=>setSyncMsg(""),2000);return;}
                try{
                  const sb=await getSB();
                  const {data:{session:ssTo}}=await getSB().then(s=>s.auth.getSession());
                  await fetch("/api/employee",{method:"POST",headers:{"Content-Type":"application/json",...(ssTo?.access_token?{"Authorization":"Bearer "+ssTo.access_token}:{})},body:JSON.stringify({_action:"time_off",userId:empSafe.id,orgId:empSafe.orgId||null,startDate:toStart,endDate:toEnd,reason:toReason||""})});
                  setToDone("✓ Time off request sent!");
                  setTimeout(()=>{setToOpen(false);setToStart("");setToEnd("");setToReason("");setToDone("");},2000);
                }catch(e){setToDone("✓ Request submitted!");}
              }} style={{flex:1,padding:"10px",background:`linear-gradient(135deg,${E.teal},${E.indigo})`,border:"none",borderRadius:8,fontFamily:E.sans,fontWeight:700,color:"#fff",cursor:"pointer"}}>Submit Request</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ══════════════════════════════════════════════════
//  LOCATION GATE COMPONENTS (defined outside OwnerCmd
//  to prevent remount on parent re-render)
// ══════════════════════════════════════════════════

function LocationGateNone({ activeOrg, ownerProfile, setLiveLocations, toast, selectLocation }) {
  const [form, setForm] = useState({ name: "", address: "", timezone: "America/Los_Angeles" });
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  return (
    <div style={{position:"fixed",inset:0,background:"linear-gradient(135deg,#fff9f0,#fff5e8)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:1000,padding:20}}>
      <div style={{background:"#fff",borderRadius:20,padding:"40px",width:"100%",maxWidth:480,boxShadow:"0 8px 40px rgba(0,0,0,0.12)",animation:"fadeUp 0.4s ease"}}>
        <div style={{textAlign:"center",marginBottom:28}}>
          <div style={{fontSize:48,marginBottom:12}}>📍</div>
          <div style={{fontFamily:O.sans,fontWeight:800,fontSize:26,color:O.text,marginBottom:8}}>Set up your first location</div>
          <div style={{fontFamily:O.sans,fontSize:14,color:O.textD,lineHeight:1.6,maxWidth:360,margin:"0 auto"}}>Every team, schedule, and payroll is organized by location. Add your first one to get started.</div>
        </div>
        {[
          {l:"Location Name",k:"name",ph:"Main Bar, Downtown Shop, Warehouse..."},
          {l:"Street Address",k:"address",ph:"123 Main St, Newport, OR 97365"}
        ].map(f=>(
          <div key={f.k} style={{marginBottom:14}}>
            <label style={{fontFamily:O.mono,fontSize:9,color:O.textF,letterSpacing:"1.5px",display:"block",marginBottom:6,textTransform:"uppercase"}}>{f.l}</label>
            <input
              value={form[f.k]}
              onChange={e=>setForm(p=>({...p,[f.k]:e.target.value}))}
              placeholder={f.ph}
              style={{width:"100%",padding:"11px 14px",background:O.bg3,border:"1px solid "+O.border,borderRadius:8,fontFamily:O.sans,fontSize:14,color:O.text,outline:"none",boxSizing:"border-box"}}
              onFocus={e=>e.target.style.borderColor=O.amber}
              onBlur={e=>e.target.style.borderColor=O.border}
            />
          </div>
        ))}
        <div style={{marginBottom:20}}>
          <label style={{fontFamily:O.mono,fontSize:9,color:O.textF,letterSpacing:"1.5px",display:"block",marginBottom:6,textTransform:"uppercase"}}>Timezone</label>
          <select
            value={form.timezone}
            onChange={e=>setForm(p=>({...p,timezone:e.target.value}))}
            style={{width:"100%",padding:"11px 14px",background:O.bg3,border:"1px solid "+O.border,borderRadius:8,fontFamily:O.sans,fontSize:13,color:O.text,outline:"none",cursor:"pointer",boxSizing:"border-box"}}>
            {[
              ["America/Los_Angeles","Pacific Time (PT)"],
              ["America/Denver","Mountain Time (MT)"],
              ["America/Chicago","Central Time (CT)"],
              ["America/New_York","Eastern Time (ET)"],
              ["America/Anchorage","Alaska Time (AKT)"],
              ["Pacific/Honolulu","Hawaii Time (HST)"]
            ].map(([val,label])=>(
              <option key={val} value={val}>{label}</option>
            ))}
          </select>
        </div>
        {err&&(
          <div style={{fontFamily:O.sans,fontSize:12,color:O.red,marginBottom:12,padding:"8px 12px",background:O.redD,border:"1px solid rgba(217,64,64,0.2)",borderRadius:6}}>{err}</div>
        )}
        <button
          onClick={async()=>{
            if(!form.name){setErr("Location name is required.");return;}
            setBusy(true);setErr("");
            try{
              const sb=await getSB();
              const {data:{session}}=await sb.auth.getSession();
              let orgId=activeOrg?.id||ownerProfile?.org_id;
              if(!orgId){
                const {data:oo}=await sb.from("owner_organizations").select("org_id").eq("owner_id",session?.user?.id).single();
                orgId=oo?.org_id;
              }
              if(!orgId) throw new Error("No company found. Please refresh and try again.");
              const res=await fetch("/api/location",{
                method:"POST",
                headers:{"Content-Type":"application/json",...(session?.access_token?{"Authorization":"Bearer "+session.access_token}:{})},
                body:JSON.stringify({orgId,name:form.name,address:form.address||"",timezone:form.timezone})
              });
              const result=await res.json();
              if(!res.ok) throw new Error(result.error||"Failed to create location");
              const newLoc=result.location;
              // Merge with existing locations — never overwrite with single item
              const existingLocsRaw = localStorage.getItem("shiftpro_all_locs");
              const existingLocs = (() => { try{ return existingLocsRaw ? JSON.parse(existingLocsRaw) : []; }catch(e){ return []; } })();
              const mergedNew = [...existingLocs.filter(l=>l.id!==newLoc.id), newLoc];
              setLiveLocations(mergedNew);
              try{
                localStorage.setItem("shiftpro_all_locs", JSON.stringify(mergedNew));
                const orgId3=newLoc.org_id||activeOrg?.id||ownerProfile?.org_id;
                if(orgId3) localStorage.setItem("shiftpro_cached_locs_"+orgId3, JSON.stringify(mergedNew));
              }catch(e){}
              toast("Location created! ✓","success");
              selectLocation(newLoc);
            }catch(e){
              setErr(e.message||"Failed. Please try again.");
            }finally{setBusy(false);}
          }}
          style={{width:"100%",padding:"14px",background:busy?"rgba(224,123,0,0.5)":"linear-gradient(135deg,#e07b00,#c96800)",border:"none",borderRadius:10,fontFamily:O.sans,fontWeight:700,fontSize:15,color:"#fff",cursor:busy?"not-allowed":"pointer",boxShadow:"0 4px 16px rgba(224,123,0,0.3)"}}>
          {busy?"Creating location...":"Create Location and Continue  to "}
        </button>
      </div>
    </div>
  );
}

function LocationGatePick({ liveLocations, selectLocation, setLocationGate, setActiveLocation, setAddLocOpen }) {
  return (
    <div style={{position:"fixed",inset:0,background:"rgba(249,248,246,0.95)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:1000,padding:20,backdropFilter:"blur(8px)"}}>
      <div style={{background:"#fff",borderRadius:20,padding:"32px",width:"100%",maxWidth:520,boxShadow:"0 8px 40px rgba(0,0,0,0.12)",animation:"fadeUp 0.4s ease"}}>
        <div style={{textAlign:"center",marginBottom:24}}>
          <div style={{fontSize:40,marginBottom:10}}>📍</div>
          <div style={{fontFamily:O.sans,fontWeight:800,fontSize:22,color:O.text,marginBottom:6}}>Which location are you managing today?</div>
          <div style={{fontFamily:O.sans,fontSize:13,color:O.textD}}>Select a location to load your team, schedule, and payroll.</div>
        </div>
        <div style={{display:"grid",gridTemplateColumns:liveLocations.length===1?"1fr":"1fr 1fr",gap:10,marginBottom:16}}>
          {liveLocations.map((loc,idx)=>(
            <button key={loc.id} onClick={()=>selectLocation(loc)}
              style={{padding:"18px 16px",background:O.bg3,border:"1.5px solid "+O.border,borderRadius:14,cursor:"pointer",textAlign:"left",transition:"all 0.15s"}}
              onMouseEnter={e=>{e.currentTarget.style.borderColor=O.amber;e.currentTarget.style.background=O.amberD;e.currentTarget.style.transform="translateY(-2px)";}}
              onMouseLeave={e=>{e.currentTarget.style.borderColor=O.border;e.currentTarget.style.background=O.bg3;e.currentTarget.style.transform="none";}}>
              <div style={{width:36,height:36,borderRadius:9,background:"linear-gradient(135deg,#e07b00,#c96800)",display:"flex",alignItems:"center",justifyContent:"center",fontFamily:O.mono,fontWeight:700,fontSize:14,color:"#fff",marginBottom:10}}>{idx+1}</div>
              <div style={{fontFamily:O.sans,fontWeight:700,fontSize:14,color:O.text,marginBottom:4,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{loc.name}</div>
              <div style={{fontFamily:O.mono,fontSize:9,color:O.textF,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{loc.address||"No address set"}</div>
            </button>
          ))}
          <button
            onClick={()=>{setLocationGate("ready");setActiveLocation(null);}}
            style={{padding:"18px 16px",background:"none",border:"1.5px dashed rgba(26,158,110,0.3)",borderRadius:14,cursor:"pointer",textAlign:"center",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:6}}
            onMouseEnter={e=>{e.currentTarget.style.background=O.greenD;e.currentTarget.style.borderColor=O.green;}}
            onMouseLeave={e=>{e.currentTarget.style.background="none";e.currentTarget.style.borderColor="rgba(26,158,110,0.3)";}}>
            <span style={{fontSize:22,color:O.green}}>🌐</span>
            <span style={{fontFamily:O.sans,fontWeight:600,fontSize:12,color:O.green}}>Manage All</span>
          </button>
        </div>
        <button
          onClick={()=>{setAddLocOpen(true);setLocationGate("ready");}}
          style={{width:"100%",padding:"10px",background:"none",border:"1.5px dashed rgba(224,123,0,0.3)",borderRadius:10,fontFamily:O.sans,fontWeight:600,fontSize:13,color:O.amber,cursor:"pointer"}}>
          + Add New Location
        </button>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════
//  NOTIFICATIONS DROPDOWN (outside OwnerCmd)
// ══════════════════════════════════════════════════
function NotificationsDropdown({
  notifications, setNotifications, setNotifOpen,
  setTab, setStaffSubTab,
  setSwapRequests, setTimeOffRequests,
  orgId, loadNotifications
}) {
  const mobile = useIsMobile();
  const [expanded, setExpanded] = React.useState(null); // id of expanded notif
  const [actionBusy, setActionBusy] = React.useState(false);
  const [replyText, setReplyText] = React.useState("");
  const [replyBusy, setReplyBusy] = React.useState(false);
  const [msgResult, setMsgResult] = React.useState("");

  const unreadCount = notifications.filter(n=>!n.read).length;

  const colorOf = t => t==="swap"?O.amber : t==="timeoff"?O.purple : t==="staffmsg"?O.indigo : O.green;
  const iconOf  = t => t==="swap"?"🔄"    : t==="timeoff"?"📆"    : t==="staffmsg"?"💬"     : "👋";

  const labelOf = n => {
    const raw = n.raw || {};
    const ts  = raw.created_at ? new Date(raw.created_at).toLocaleTimeString("en-US",{hour:"numeric",minute:"2-digit"}) : "";
    if(n.type==="staffmsg") return {
      from: raw.from_name || "Staff",
      detail: raw.body || raw.subject || "Sent a message",
      time: ts, reason: raw.body || "",
    };
    const name = ((raw.users?.first_name||"")+" "+(raw.users?.last_name||"")).trim() || "Employee";
    if(n.type==="swap") return {
      from: name,
      detail: "Wants to swap" + (raw.shift_date?" on "+new Date(raw.shift_date+"T12:00").toLocaleDateString("en-US",{month:"short",day:"numeric"}):""),
      time: ts, reason: raw.reason||"",
    };
    if(n.type==="timeoff") {
      const s = raw.start_date ? new Date(raw.start_date+"T12:00").toLocaleDateString("en-US",{month:"short",day:"numeric"}) : "";
      const e = raw.end_date   ? new Date(raw.end_date+"T12:00").toLocaleDateString("en-US",{month:"short",day:"numeric"}) : "";
      return {
        from: name,
        detail: "Time off request" + (s?" — "+s+(e&&e!==s?" to "+e:""):""),
        time: ts, reason: raw.reason||"",
      };
    }
    return {from:"Staff", detail:"Notification", time:ts, reason:""};
  };

  const handleRequest = async(n, status) => {
    setActionBusy(true);
    try{
      const sb = await getSB();
      const {data:{session:ss}} = await sb.auth.getSession();
      const table = n.type==="swap" ? "shift_swap_requests" : "time_off_requests";
      const r = await fetch("/api/requests", {
        method:"POST",
        headers:{"Content-Type":"application/json",...(ss?.access_token?{"Authorization":"Bearer "+ss.access_token}:{})},
        body:JSON.stringify({table, id:n.raw.id, status}),
      });
      const d = await r.json();
      if(!r.ok) throw new Error(d.error||"Failed");
      // Remove from bell + requests list
      setNotifications(prev=>prev.filter(x=>x.id!==n.id));
      if(n.type==="swap"      && setSwapRequests)     setSwapRequests(prev=>(prev||[]).filter(r=>r.id!==n.raw.id));
      if(n.type==="timeoff"   && setTimeOffRequests)  setTimeOffRequests(prev=>(prev||[]).filter(r=>r.id!==n.raw.id));
      setExpanded(null);
    }catch(e){ alert("Error: "+e.message); }
    setActionBusy(false);
  };

  const handleReply = async(n) => {
    if(!replyText.trim()) return;
    setReplyBusy(true);
    setMsgResult("");
    try{
      const sb = await getSB();
      const {data:{session:ss}} = await sb.auth.getSession();
      const r = await fetch("/api/messages", {
        method:"POST",
        headers:{"Content-Type":"application/json",...(ss?.access_token?{"Authorization":"Bearer "+ss.access_token}:{})},
        body:JSON.stringify({
          orgId, fromId:ss?.user?.id, fromName:"Manager",
          toId:n.raw?.from_id, text:replyText.trim(),
          parentId:n.raw?.id, type:"direct",
        }),
      });
      const d = await r.json();
      if(!r.ok) throw new Error(d.error||"Failed");
      setMsgResult("✓ Sent!");
      setReplyText("");
      setNotifications(prev=>prev.map(x=>x.id===n.id?{...x,read:true}:x));
      setTimeout(()=>{ setMsgResult(""); setExpanded(null); }, 1500);
    }catch(e){ setMsgResult("⚠ "+e.message); }
    setReplyBusy(false);
  };

  return (
    <div
      data-notif-dropdown="true"
      onClick={e=>{ e.stopPropagation(); e.nativeEvent.stopImmediatePropagation(); }}
      style={{
        position:"fixed", top:62, right:mobile?8:20,
        width:mobile?"calc(100vw - 16px)":370,
        background:"#fff", border:"1px solid "+O.border,
        borderRadius:16, boxShadow:"0 12px 40px rgba(0,0,0,0.18)",
        zIndex:600, display:"flex", flexDirection:"column",
        maxHeight:"calc(100vh - 80px)", animation:"fadeUp 0.15s ease",
      }}>

      {/* ── Header ── */}
      <div style={{padding:"13px 16px",borderBottom:"1px solid "+O.border,display:"flex",alignItems:"center",justifyContent:"space-between",flexShrink:0}}>
        <div style={{fontFamily:O.sans,fontWeight:700,fontSize:14,color:O.text,display:"flex",alignItems:"center",gap:8}}>
          Notifications
          {unreadCount>0&&<span style={{background:O.red,color:"#fff",fontFamily:O.mono,fontSize:9,fontWeight:700,borderRadius:10,padding:"2px 8px"}}>{unreadCount} new</span>}
        </div>
        <button onClick={()=>setNotifOpen(false)} style={{background:"none",border:"none",fontSize:20,cursor:"pointer",color:O.textF,lineHeight:1,padding:"0 4px"}}>×</button>
      </div>

      {/* ── Empty state ── */}
      {notifications.length===0&&(
        <div style={{padding:"36px 20px",textAlign:"center"}}>
          <div style={{fontSize:36,marginBottom:8}}>✅</div>
          <div style={{fontFamily:O.sans,fontWeight:600,fontSize:14,color:O.text,marginBottom:4}}>All caught up!</div>
          <div style={{fontFamily:O.sans,fontSize:12,color:O.textD}}>Requests and staff messages appear here.</div>
        </div>
      )}

      {/* ── Notification list ── */}
      <div style={{overflowY:"auto",flex:1}}>
        {notifications.map((n,i)=>{
          const {from,detail,time,reason} = labelOf(n);
          const col = colorOf(n.type);
          const isOpen = expanded===n.id;
          return(
          <div key={n.id} style={{borderBottom:i<notifications.length-1?"1px solid "+O.border:"none"}}>

            {/* Row */}
            <div
              onClick={()=>{
                setExpanded(isOpen?null:n.id);
                setReplyText(""); setMsgResult("");
                if(!n.read) setNotifications(prev=>prev.map(x=>x.id===n.id?{...x,read:true}:x));
              }}
              style={{
                padding:"11px 14px",
                borderLeft:"3px solid "+col,
                background: isOpen?col+"12" : n.read?"#fff" : col+"07",
                display:"flex",gap:10,alignItems:"flex-start",
                cursor:"pointer",transition:"background 0.12s",
              }}>
              <span style={{fontSize:19,flexShrink:0,marginTop:1}}>{iconOf(n.type)}</span>
              <div style={{flex:1,minWidth:0}}>
                <div style={{display:"flex",justifyContent:"space-between",gap:4}}>
                  <div style={{fontFamily:O.sans,fontWeight:n.read?600:700,fontSize:13,color:O.text}}>{from}</div>
                  <div style={{fontFamily:O.mono,fontSize:8,color:O.textF,flexShrink:0,marginTop:1}}>{time}</div>
                </div>
                <div style={{fontFamily:O.sans,fontSize:12,color:O.textD,marginTop:1,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{detail}</div>
              </div>
              {!n.read&&<div style={{width:7,height:7,borderRadius:"50%",background:col,flexShrink:0,marginTop:5}}/>}
              <span style={{fontFamily:O.mono,fontSize:10,color:O.textF,flexShrink:0}}>{isOpen?"▲":"▼"}</span>
            </div>

            {/* ── Action panel ── */}
            {isOpen&&(
              <div style={{padding:"12px 14px 14px",background:col+"06",borderLeft:"3px solid "+col}}>

                {/* Reason/body preview */}
                {reason&&(
                  <div style={{fontFamily:O.sans,fontSize:12,color:O.textD,padding:"7px 10px",background:"#fff",borderRadius:8,marginBottom:10,lineHeight:1.5,border:"1px solid "+O.border}}>
                    {reason}
                  </div>
                )}

                {/* SWAP: approve / deny */}
                {n.type==="swap"&&(
                  <div style={{display:"flex",gap:8}}>
                    <button disabled={actionBusy} onClick={()=>handleRequest(n,"approved")}
                      style={{flex:1,padding:"9px",background:O.greenD,border:"1px solid rgba(26,158,110,0.3)",borderRadius:9,fontFamily:O.sans,fontWeight:700,fontSize:13,color:O.green,cursor:"pointer"}}>
                      {actionBusy?"…":"✓ Approve"}
                    </button>
                    <button disabled={actionBusy} onClick={()=>handleRequest(n,"denied")}
                      style={{flex:1,padding:"9px",background:O.redD,border:"1px solid rgba(217,64,64,0.25)",borderRadius:9,fontFamily:O.sans,fontWeight:700,fontSize:13,color:O.red,cursor:"pointer"}}>
                      {actionBusy?"…":"✕ Deny"}
                    </button>
                    <button onClick={()=>{setNotifOpen(false);setTab("staff");setStaffSubTab("requests");}}
                      style={{padding:"9px 11px",background:"none",border:"1px solid "+O.border,borderRadius:9,fontFamily:O.sans,fontSize:11,color:O.textD,cursor:"pointer"}}>
                      View all
                    </button>
                  </div>
                )}

                {/* TIMEOFF: approve / deny */}
                {n.type==="timeoff"&&(
                  <div style={{display:"flex",gap:8}}>
                    <button disabled={actionBusy} onClick={()=>handleRequest(n,"approved")}
                      style={{flex:1,padding:"9px",background:O.greenD,border:"1px solid rgba(26,158,110,0.3)",borderRadius:9,fontFamily:O.sans,fontWeight:700,fontSize:13,color:O.green,cursor:"pointer"}}>
                      {actionBusy?"…":"✓ Approve"}
                    </button>
                    <button disabled={actionBusy} onClick={()=>handleRequest(n,"denied")}
                      style={{flex:1,padding:"9px",background:O.redD,border:"1px solid rgba(217,64,64,0.25)",borderRadius:9,fontFamily:O.sans,fontWeight:700,fontSize:13,color:O.red,cursor:"pointer"}}>
                      {actionBusy?"…":"✕ Deny"}
                    </button>
                    <button onClick={()=>{setNotifOpen(false);setTab("staff");setStaffSubTab("requests");}}
                      style={{padding:"9px 11px",background:"none",border:"1px solid "+O.border,borderRadius:9,fontFamily:O.sans,fontSize:11,color:O.textD,cursor:"pointer"}}>
                      View all
                    </button>
                  </div>
                )}

                {/* STAFF MESSAGE: inline reply */}
                {n.type==="staffmsg"&&(
                  <div>
                    {msgResult?(
                      <div style={{fontFamily:O.sans,fontSize:13,color:msgResult.startsWith("✓")?O.green:O.red,textAlign:"center",padding:"6px",fontWeight:600}}>{msgResult}</div>
                    ):(
                      <div style={{display:"flex",gap:6}}>
                        <input
                          value={replyText}
                          onChange={e=>setReplyText(e.target.value)}
                          onKeyDown={e=>{ if(e.key==="Enter"&&!e.shiftKey){ e.preventDefault(); handleReply(n); }}}
                          placeholder="Reply to this message…"
                          style={{flex:1,padding:"8px 10px",background:"#fff",border:"1px solid "+O.border,borderRadius:8,fontFamily:O.sans,fontSize:12,color:O.text,outline:"none"}}
                        />
                        <button disabled={replyBusy||!replyText.trim()} onClick={()=>handleReply(n)}
                          style={{padding:"8px 14px",background:replyText.trim()?O.indigo:"#ccc",border:"none",borderRadius:8,fontFamily:O.sans,fontWeight:700,fontSize:12,color:"#fff",cursor:replyText.trim()?"pointer":"default",flexShrink:0}}>
                          {replyBusy?"…":"Send"}
                        </button>
                        <button onClick={()=>{setNotifOpen(false);setTab("command");}}
                          style={{padding:"8px 10px",background:"none",border:"1px solid "+O.border,borderRadius:8,fontFamily:O.sans,fontSize:11,color:O.textD,cursor:"pointer",flexShrink:0}}>
                          Full
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
          );
        })}
      </div>

      {/* ── Footer ── */}
      {notifications.length>0&&(
        <div style={{padding:"10px 14px",borderTop:"1px solid "+O.border,flexShrink:0,display:"flex",gap:8}}>
          <button onClick={()=>{setNotifOpen(false);setTab("staff");setStaffSubTab("requests");}}
            style={{flex:1,padding:"8px",background:O.amberD,border:"1px solid "+O.amberB,borderRadius:8,fontFamily:O.sans,fontWeight:600,fontSize:11,color:O.amber,cursor:"pointer"}}>
            All Requests
          </button>
          <button onClick={()=>setNotifications(prev=>prev.map(n=>({...n,read:true})))}
            style={{padding:"8px 12px",background:"none",border:"1px solid "+O.border,borderRadius:8,fontFamily:O.sans,fontSize:11,color:O.textD,cursor:"pointer"}}>
            Mark read
          </button>
        </div>
      )}
    </div>
  );
}
// ══════════════════════════════════════════════════
//  EMPLOYEE DRAWER (outside OwnerCmd)
// ══════════════════════════════════════════════════
function EmployeeDrawer({ emp, onClose, activeOrg, ownerProfile, setLiveEmps, mapEmp, toast }) {
  const mobile = useIsMobile();
  const [editing, setEditing] = React.useState(false);
  const [editForm, setEditForm] = React.useState({
    firstName: emp.first||emp.name?.split(" ")[0]||"",
    lastName: emp.name?.split(" ").slice(1).join(" ")||"",
    role: emp.role||"",
    dept: emp.dept||"",
    rate: String(emp.rate||15),
  });
  const [saveBusy, setSaveBusy] = React.useState(false);
  const [deactivateBusy, setDeactivateBusy] = React.useState(false);
  const [resendBusy, setResendBusy] = React.useState(false);
  const [msgOpen, setMsgOpen] = React.useState(false);
  const [msgText, setMsgText] = React.useState("");
  const [msgSent, setMsgSent] = React.useState(false);
  const [msgBusy, setMsgBusy] = React.useState(false);
  // Local display state — updates immediately on save without waiting for prop
  const [displayName, setDisplayName] = React.useState(emp.name||(emp.first||"")+" "+(emp.last||""));
  const [displayRole, setDisplayRole] = React.useState(emp.role||"Employee");
  const [displayDept, setDisplayDept] = React.useState(emp.dept||"");
  const [displayRate, setDisplayRate] = React.useState(emp.rate||15);
  const [displayAvatar, setDisplayAvatar] = React.useState(getInitials(emp));
  // Document state
  const [empDocList, setEmpDocList] = React.useState(null);
  const [docDrawerOpen, setDocDrawerOpen] = React.useState(false);
  const [ownerDocName, setOwnerDocName] = React.useState("");
  const [ownerDocCat, setOwnerDocCat] = React.useState("payroll");
  const [ownerDocNotes, setOwnerDocNotes] = React.useState("");
  const [ownerDocBusy, setOwnerDocBusy] = React.useState(false);
  const [ownerDocMsg, setOwnerDocMsg] = React.useState("");

  // Load employee docs when drawer opens
  React.useEffect(()=>{
    if(!emp.id) return;
    (async()=>{
      try{
        const _sb=await getSB();
        const {data:{session:ss}}=await _sb.auth.getSession();
        const r=await fetch(`/api/documents?userId=${emp.id}&_t=${Date.now()}`,{
          headers:ss?.access_token?{"Authorization":"Bearer "+ss.access_token}:{}
        });
        if(r.ok){ const d=await r.json(); setEmpDocList(d.documents||[]); }
        else setEmpDocList([]);
      }catch(e){ setEmpDocList([]); }
    })();
  },[emp.id]);

  const handleOwnerUpload = async(file) => {
    if(!file||!ownerDocName.trim()){ setOwnerDocMsg("⚠ Please enter a document name"); return; }
    if(file.size>10*1024*1024){ setOwnerDocMsg("⚠ File must be under 10MB"); return; }
    setOwnerDocBusy(true); setOwnerDocMsg("");
    try{
      const _sb2=await getSB();
      const {data:{session:ss}}=await _sb2.auth.getSession();
      const fd=new FormData();
      fd.append("file",file);
      fd.append("userId",emp.id);
      fd.append("orgId",activeOrg?.id||ownerProfile?.org_id||"");
      fd.append("name",ownerDocName.trim());
      fd.append("category",ownerDocCat);
      fd.append("notes",ownerDocNotes||"Uploaded by manager");
      const r=await fetch("/api/documents",{
        method:"POST",
        headers:ss?.access_token?{"Authorization":"Bearer "+ss.access_token}:{},
        body:fd,
      });
      const d=await r.json();
      if(!r.ok) throw new Error(d.error||"Upload failed");
      setEmpDocList(p=>[d.document,...(p||[])]);
      setOwnerDocName(""); setOwnerDocNotes(""); setOwnerDocCat("payroll");
      setDocDrawerOpen(false);
      setOwnerDocMsg("✓ "+file.name+" added to "+emp.name+"'s file");
      toast("Document added to "+emp.name+"'s file ✓","success");
      setTimeout(()=>setOwnerDocMsg(""),5000);
    }catch(e){ setOwnerDocMsg("Failed: "+e.message); }
    finally{ setOwnerDocBusy(false); }
  };

  const inputStyle = {
    width:"100%",padding:"9px 12px",background:O.bg3,
    border:"1px solid "+O.border,borderRadius:8,
    fontFamily:O.sans,fontSize:13,color:O.text,
    outline:"none",boxSizing:"border-box",
  };
  const labelStyle = {
    fontFamily:O.mono,fontSize:8,color:O.textF,
    letterSpacing:"1.5px",display:"block",marginBottom:5,textTransform:"uppercase",
  };

  const saveChanges = async () => {
    setSaveBusy(true);
    try {
      const sb2 = await getSB();
      const {data:{session:ss}} = await sb2.auth.getSession();
      const orgId = activeOrg?.id||ownerProfile?.org_id||null;

      const payload = {
        userId: emp.id,
        updates: {
          first_name:     editForm.firstName.trim(),
          last_name:      editForm.lastName.trim(),
          role:           editForm.role.trim(),
          department:     editForm.dept,
          hourly_rate:    parseFloat(editForm.rate)||15,
          avatar_initials:((editForm.firstName[0]||"")+(editForm.lastName[0]||"")).toUpperCase()||"??",
        }
      };


      const res = await fetch("/api/user", {
        method:"PATCH",
        headers:{"Content-Type":"application/json",...(ss?.access_token?{"Authorization":"Bearer "+ss.access_token}:{})},
        body:JSON.stringify(payload),
      });

      const resJson = await res.json();

      if(!res.ok) throw new Error(resJson.error||"Save failed");

      // Update local display immediately
      const newFirst = editForm.firstName.trim();
      const newLast  = editForm.lastName.trim();
      setDisplayName((newFirst+" "+newLast).trim());
      setDisplayRole(editForm.role.trim());
      setDisplayDept(editForm.dept);
      setDisplayRate(parseFloat(editForm.rate)||15);
      setDisplayAvatar(((newFirst[0]||"")+(newLast[0]||"")).toUpperCase()||"??");

      // Refresh staff list
      if(orgId){
        const staffRes = await fetch("/api/staff?orgId="+orgId, {
          headers:ss?.access_token?{"Authorization":"Bearer "+ss.access_token}:{}
        });
        if(staffRes.ok){ const d=await staffRes.json(); if(d.employees) setLiveEmps(d.employees.map(mapEmp)); }
      }
      toast("✓ Employee updated","success");
      setEditing(false);
    } catch(e) {
      console.error("[saveChanges] Error:", e);
      toast("Failed to save: "+(e.message||"Unknown error"),"error");
    } finally { setSaveBusy(false); }
  };

  const [confirmDeactivate,setConfirmDeactivate] = React.useState(false);
  const deactivate = async () => {
    if(!confirmDeactivate){ setConfirmDeactivate(true); return; }
    setConfirmDeactivate(false);
    setDeactivateBusy(true);
    try {
      const sb2 = await getSB();
      const {data:{session:ss}} = await sb2.auth.getSession();
      const orgId = activeOrg?.id||ownerProfile?.org_id||null;
      await fetch("/api/user",{
        method:"PATCH",
        headers:{"Content-Type":"application/json",...(ss?.access_token?{"Authorization":"Bearer "+ss.access_token}:{})},
        body:JSON.stringify({userId:emp.id,updates:{status:"inactive"}}),
      });
      if(orgId){
        const staffRes=await fetch("/api/staff?orgId="+orgId,{headers:ss?.access_token?{"Authorization":"Bearer "+ss.access_token}:{}});
        if(staffRes.ok){ const d=await staffRes.json(); if(d.employees) setLiveEmps(d.employees.map(mapEmp)); }
      }
      toast(emp.name+" deactivated","success");
      onClose();
    } catch(e) {
      toast("Failed: "+e.message,"error");
    } finally { setDeactivateBusy(false); }
  };

  const resendInvite = async () => {
    setResendBusy(true);
    try {
      const sb2=await getSB();
      const {data:{session:ss}}=await sb2.auth.getSession();
      const orgId=activeOrg?.id||ownerProfile?.org_id||localStorage.getItem("shiftpro_active_orgid")||null;

      if(!emp.email){ toast("No email on file for this employee","error"); return; }

      const res = await fetch("/api/invite",{
        method:"POST",
        headers:{"Content-Type":"application/json",...(ss?.access_token?{"Authorization":"Bearer "+ss.access_token}:{})},
        body:JSON.stringify({
          email:emp.email,
          firstName:emp.first||emp.name?.split(" ")[0]||"",
          lastName:emp.name?.split(" ").slice(1).join(" ")||"",
          orgId,
          locationId:emp.locId||null,
          role:emp.role||"Employee",
          department:emp.dept||"",
          hourlyRate:String(emp.rate||15),
          forceResend:true,
        }),
      });
      const result=await res.json();
      if(!res.ok) throw new Error(result.error||"Resend failed");
      const msg = result.isExisting
        ? "✓ Password reset email sent to "+emp.email+" (existing account)"
        : "✓ Invite sent to "+emp.email;
      toast(msg,"success");
    } catch(e) {
      // Final fallback: send password reset directly
      try{
        const sb3=await getSB();
        await sb3.auth.resetPasswordForEmail(emp.email,{redirectTo:"https://shiftpro.ai/"});
        toast("✓ Password reset sent to "+emp.email,"success");
      }catch(e2){
        toast("Failed: "+(e&&e.message?e.message:String(e)),"error");
      }
    } finally { setResendBusy(false); }
  };

  return (
    <>
      {/* Overlay */}
      <div
        onClick={onClose}
        style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.35)",zIndex:700,animation:"fadeIn 0.2s ease"}}
      />
      {/* Drawer panel */}
      <div style={{
        position:"fixed",top:0,right:0,bottom:0,width:mobile?"100vw":400,
        background:"#fff",zIndex:701,
        boxShadow:"-8px 0 40px rgba(0,0,0,0.12)",
        display:"flex",flexDirection:"column",
        animation:"slideInRight 0.28s ease",
        overflowY:"auto",
      }}>
        {/* Drawer header */}
        <div style={{padding:"20px 24px",borderBottom:"1px solid "+O.border,display:"flex",alignItems:"center",justifyContent:"space-between",flexShrink:0}}>
          <div style={{fontFamily:O.mono,fontSize:8,color:O.textF,letterSpacing:"2px",textTransform:"uppercase"}}>Employee Profile</div>
          <div style={{display:"flex",alignItems:"center",gap:8}}>
            <button onClick={async()=>{
                if(!emp.email){toast("No email on file","error");return;}
                try{
                  const sb2=await getSB();
                  await sb2.auth.resetPasswordForEmail(emp.email,{redirectTo:"https://shiftpro.ai/"});
                  toast("✓ Password reset sent to "+emp.email,"success");
                }catch(e){toast("Failed to send reset","error");}
              }} style={{padding:"5px 12px",background:"none",border:"1px solid "+O.border,borderRadius:7,fontFamily:O.sans,fontSize:11,fontWeight:600,color:O.textD,cursor:"pointer",marginRight:4}}>
              🔑 Reset Password
            </button>
            <button onClick={()=>{setMsgOpen(o=>!o);setMsgSent(false);}} style={{padding:"5px 12px",background:msgOpen?"rgba(37,99,235,0.1)":"none",border:"1px solid "+O.border,borderRadius:7,fontFamily:O.sans,fontSize:11,fontWeight:600,color:O.blue,cursor:"pointer"}}>
              💬 Message
            </button>
            <button onClick={onClose} style={{background:"none",border:"none",fontSize:22,cursor:"pointer",color:O.textF,lineHeight:1}}>×</button>
          </div>
        </div>

        {/* Inline message compose */}
        {msgOpen&&(
          <div style={{padding:"14px 24px",borderBottom:"1px solid "+O.border,background:"rgba(37,99,235,0.03)"}}>
            {!msgSent?(
              <div>
                <div style={{fontFamily:O.mono,fontSize:8,color:O.blue,letterSpacing:"1.5px",marginBottom:8,textTransform:"uppercase"}}>Direct Message</div>
                <textarea value={msgText} onChange={e=>setMsgText(e.target.value)} placeholder={("Hey "+displayName.split(" ")[0]+"...")} rows={3}
                  style={{width:"100%",padding:"9px 12px",background:O.bg3,border:"1px solid "+O.border,borderRadius:8,fontFamily:O.sans,fontSize:13,color:O.text,outline:"none",resize:"none",boxSizing:"border-box"}}/>
                <button onClick={async()=>{
                  if(!msgText.trim()) return;
                  setMsgBusy(true);
                  try{
                    const sb=await getSB();
                    const {data:{session}}=await sb.auth.getSession();
                    const orgId=activeOrg?.id||ownerProfile?.org_id||null;
                    const fromName=(ownerProfile?.first_name||"Manager")+" "+(ownerProfile?.last_name||"");
                    await fetch("/api/messages",{
                      method:"POST",
                      headers:{"Content-Type":"application/json",...(session?.access_token?{"Authorization":"Bearer "+session.access_token}:{})},
                      body:JSON.stringify({orgId,fromId:session?.user?.id,fromName:fromName.trim(),toId:emp.id,subject:"Message from your manager",text:msgText.trim(),type:"owner"}),
                    });
                    setMsgSent(true);setMsgText("");
                    toast("Message sent to "+(displayName||emp.name||"employee").split(" ")[0]+" ✓","success");
                  }catch(e){toast("Failed: "+e.message,"error");}
                  finally{setMsgBusy(false);}
                }} style={{marginTop:8,padding:"8px 18px",background:"linear-gradient(135deg,#2563eb,#1d4ed8)",border:"none",borderRadius:8,fontFamily:O.sans,fontWeight:700,fontSize:12,color:"#fff",cursor:msgBusy?"not-allowed":"pointer"}}>
                  {msgBusy?"Sending…":"Send  to "}
                </button>
              </div>
            ):(
              <div style={{fontFamily:O.sans,fontSize:13,color:O.green}}>✓ Message sent!</div>
            )}
          </div>
        )}

        <div style={{padding:"24px",flex:1}}>
          {/* Avatar + name */}
          <div style={{display:"flex",alignItems:"center",gap:16,marginBottom:20}}>
            <div style={{width:64,height:64,borderRadius:"50%",flexShrink:0,background:emp.color||"#6366f1",display:"flex",alignItems:"center",justifyContent:"center",fontFamily:O.mono,fontWeight:700,fontSize:20,color:"#fff"}}>
              {displayAvatar}
            </div>
            <div>
              <div style={{fontFamily:O.sans,fontWeight:800,fontSize:18,color:O.text,marginBottom:4}}>{displayName}</div>
              <div style={{display:"flex",alignItems:"center",gap:8,flexWrap:"wrap"}}>
                {displayDept&&<span style={{fontFamily:O.mono,fontSize:9,color:O.cyan,background:"rgba(8,145,178,0.08)",border:"1px solid rgba(8,145,178,0.15)",borderRadius:4,padding:"2px 8px"}}>{displayDept}</span>}
                <span style={{fontFamily:O.mono,fontSize:9,padding:"2px 8px",borderRadius:10,fontWeight:600,background:emp.status==="active"?O.greenD:O.amberD,border:"1px solid "+(emp.status==="active"?"rgba(26,158,110,0.25)":O.amberB),color:emp.status==="active"?O.green:O.amber}}>
                  {emp.status==="active"?"ACTIVE":"INVITED"}
                </span>
              </div>
              {emp.email&&(
                <a href={"mailto:"+emp.email} style={{fontFamily:O.mono,fontSize:10,color:O.cyan,textDecoration:"none",display:"block",marginTop:4}}>{emp.email}</a>
              )}
            </div>
          </div>

          {/* Stats strip */}
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:20}}>
            {[
              {label:"Hourly Rate",value:"$"+(displayRate||15).toFixed(2)+"/hr",color:O.amber},
              {label:"Department",value:displayDept||"—",color:O.cyan},
              {label:"Role",value:displayRole||"Employee",color:O.purple},
              {label:"Hire Date",value:emp.hired||"—",color:O.textD},
            ].map(s=>(
              <div key={s.label} style={{background:O.bg3,borderRadius:10,padding:"12px 14px"}}>
                <div style={{fontFamily:O.mono,fontSize:8,color:O.textF,letterSpacing:"1.5px",marginBottom:4,textTransform:"uppercase"}}>{s.label}</div>
                <div style={{fontFamily:O.sans,fontWeight:700,fontSize:14,color:s.color,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{s.value}</div>
              </div>
            ))}
          </div>

          {/* Edit section */}
          {!editing ? (
            <button
              onClick={()=>setEditing(true)}
              style={{width:"100%",padding:"11px",background:O.amberD,border:"1px solid "+O.amberB,borderRadius:9,fontFamily:O.sans,fontWeight:700,fontSize:13,color:O.amber,cursor:"pointer",marginBottom:16}}>
              ✏️ Edit Employee
            </button>
          ) : (
            <div style={{background:O.bg3,borderRadius:12,padding:"16px",marginBottom:16}}>
              <div style={{fontFamily:O.sans,fontWeight:700,fontSize:14,color:O.text,marginBottom:14}}>Edit Details</div>

              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:12}}>
                <div>
                  <label style={labelStyle}>First Name</label>
                  <input value={editForm.firstName} onChange={e=>setEditForm(p=>({...p,firstName:e.target.value}))} placeholder="First" style={inputStyle}
                    onFocus={e=>e.target.style.borderColor=O.amber} onBlur={e=>e.target.style.borderColor=O.border}/>
                </div>
                <div>
                  <label style={labelStyle}>Last Name</label>
                  <input value={editForm.lastName} onChange={e=>setEditForm(p=>({...p,lastName:e.target.value}))} placeholder="Last" style={inputStyle}
                    onFocus={e=>e.target.style.borderColor=O.amber} onBlur={e=>e.target.style.borderColor=O.border}/>
                </div>
              </div>

              <div style={{marginBottom:12}}>
                <label style={labelStyle}>Role</label>
                <input value={editForm.role} onChange={e=>setEditForm(p=>({...p,role:e.target.value}))} placeholder="Lead Cashier" style={inputStyle}
                  onFocus={e=>e.target.style.borderColor=O.amber} onBlur={e=>e.target.style.borderColor=O.border}/>
              </div>

              <div style={{marginBottom:12}}>
                <label style={labelStyle}>Department</label>
                <select value={editForm.dept} onChange={e=>setEditForm(p=>({...p,dept:e.target.value}))}
                  style={{...inputStyle,cursor:"pointer"}}>
                  <option value="">— No Department —</option>
                  {["Front End","Sales Floor","Inventory","Operations","Security","Management","Kitchen","Bar","Service","Captain","Naturalist","Deckhand"].map(d=>(
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
              </div>

              <div style={{marginBottom:16}}>
                <label style={labelStyle}>Hourly Rate ($)</label>
                <input value={editForm.rate} onChange={e=>setEditForm(p=>({...p,rate:e.target.value}))} type="number" min="0" step="0.25" placeholder="15.00" style={inputStyle}
                  onFocus={e=>e.target.style.borderColor=O.amber} onBlur={e=>e.target.style.borderColor=O.border}/>
              </div>

              <div style={{display:"flex",gap:8}}>
                <button onClick={saveChanges} disabled={saveBusy} style={{flex:1,padding:"10px",background:saveBusy?"rgba(224,123,0,0.4)":"linear-gradient(135deg,#e07b00,#c96800)",border:"none",borderRadius:8,fontFamily:O.sans,fontWeight:700,fontSize:13,color:"#fff",cursor:saveBusy?"not-allowed":"pointer"}}>
                  {saveBusy?"Saving…":"Save Changes"}
                </button>
                <button onClick={()=>setEditing(false)} style={{padding:"10px 16px",background:"#fff",border:"1px solid "+O.border,borderRadius:8,fontFamily:O.sans,fontWeight:600,fontSize:13,color:O.textD,cursor:"pointer"}}>Cancel</button>
              </div>
            </div>
          )}

          {/* Resend invite (only for invited) */}
          {emp.status==="invited"&&(
            <div style={{marginBottom:16}}>
              <div style={{background:"rgba(99,102,241,0.06)",border:"1px solid rgba(99,102,241,0.15)",borderRadius:9,padding:"10px 14px",marginBottom:8,display:"flex",alignItems:"center",gap:8}}>
                <span style={{fontSize:16}}>⏳</span>
                <div>
                  <div style={{fontFamily:O.sans,fontWeight:600,fontSize:12,color:O.text}}>Invite Pending</div>
                  <div style={{fontFamily:O.mono,fontSize:9,color:O.textF}}>Employee hasn't set their password yet</div>
                </div>
              </div>
              <button onClick={resendInvite} style={{width:"100%",padding:"10px",background:"linear-gradient(135deg,#6366f1,#8b5cf6)",border:"none",borderRadius:9,fontFamily:O.sans,fontWeight:600,fontSize:13,color:"#fff",cursor:"pointer",boxShadow:"0 2px 8px rgba(99,102,241,0.25)",marginBottom:8}}>
                {resendBusy?"Sending…":"📧 Resend Invite Email"}
              </button>
            </div>
          )}
        </div>

        {/* Documents section */}
        <div style={{padding:"16px 24px",borderTop:"1px solid "+O.border}}>
          <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:12}}>
            <div style={{fontFamily:O.mono,fontSize:8,color:O.cyan,letterSpacing:"1.5px",textTransform:"uppercase"}}>📁 Employee Documents</div>
            <button onClick={()=>setDocDrawerOpen(o=>!o)} style={{padding:"5px 12px",background:docDrawerOpen?"rgba(0,0,0,0.05)":"linear-gradient(135deg,#0891b2,#0e7490)",border:"none",borderRadius:6,fontFamily:O.sans,fontWeight:600,fontSize:11,color:docDrawerOpen?O.textD:"#fff",cursor:"pointer"}}>
              {docDrawerOpen?"✕ Cancel":"+ Add Doc"}
            </button>
          </div>

          {/* Owner upload form */}
          {docDrawerOpen&&(
            <div style={{background:O.bg3,borderRadius:10,padding:"14px",marginBottom:12}}>
              <div style={{marginBottom:10}}>
                <label style={{fontFamily:O.mono,fontSize:8,color:O.textF,letterSpacing:"1.5px",display:"block",marginBottom:4,textTransform:"uppercase"}}>Document Name *</label>
                <input value={ownerDocName} onChange={e=>setOwnerDocName(e.target.value)} placeholder="e.g. W-2 2024, Pay Stub March..."
                  style={{width:"100%",padding:"8px 10px",background:"#fff",border:"1px solid "+O.border,borderRadius:7,fontFamily:O.sans,fontSize:13,color:O.text,outline:"none",boxSizing:"border-box"}}/>
              </div>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:10}}>
                <div>
                  <label style={{fontFamily:O.mono,fontSize:8,color:O.textF,letterSpacing:"1.5px",display:"block",marginBottom:4,textTransform:"uppercase"}}>Category</label>
                  <select value={ownerDocCat} onChange={e=>setOwnerDocCat(e.target.value)}
                    style={{width:"100%",padding:"7px 10px",background:"#fff",border:"1px solid "+O.border,borderRadius:7,fontFamily:O.sans,fontSize:12,color:O.text,outline:"none",cursor:"pointer",boxSizing:"border-box"}}>
                    <option value="payroll">💵 Pay Record</option>
                    <option value="tax">📝 Tax Form</option>
                    <option value="identity">🪪 Identity</option>
                    <option value="other">📎 Other</option>
                  </select>
                </div>
                <div>
                  <label style={{fontFamily:O.mono,fontSize:8,color:O.textF,letterSpacing:"1.5px",display:"block",marginBottom:4,textTransform:"uppercase"}}>Notes</label>
                  <input value={ownerDocNotes} onChange={e=>setOwnerDocNotes(e.target.value)} placeholder="Pay period, tax year..."
                    style={{width:"100%",padding:"7px 10px",background:"#fff",border:"1px solid "+O.border,borderRadius:7,fontFamily:O.sans,fontSize:12,color:O.text,outline:"none",boxSizing:"border-box"}}/>
                </div>
              </div>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:ownerDocMsg?10:0}}>
                <label style={{display:"block",padding:"10px",background:"#fff",border:"1.5px dashed "+O.border,borderRadius:8,textAlign:"center",cursor:"pointer"}}>
                  <input type="file" accept=".pdf,.jpg,.jpeg,.png,.doc,.docx" style={{display:"none"}} onChange={e=>{ if(e.target.files?.[0]) handleOwnerUpload(e.target.files[0]); }}/>
                  <div style={{fontSize:20,marginBottom:2}}>📎</div>
                  <div style={{fontFamily:O.sans,fontWeight:600,fontSize:11,color:O.textD}}>{ownerDocBusy?"Uploading…":"Choose File"}</div>
                </label>
                <label style={{display:"block",padding:"10px",background:"#fff",border:"1.5px dashed #0891b2",borderRadius:8,textAlign:"center",cursor:"pointer"}}>
                  <input type="file" accept="image/*" capture="environment" style={{display:"none"}} onChange={e=>{ if(e.target.files?.[0]) handleOwnerUpload(e.target.files[0]); }}/>
                  <div style={{fontSize:20,marginBottom:2}}>📷</div>
                  <div style={{fontFamily:O.sans,fontWeight:600,fontSize:11,color:"#0891b2"}}>Take Photo</div>
                </label>
              </div>
              {ownerDocMsg&&<div style={{fontFamily:O.sans,fontSize:12,color:ownerDocMsg.startsWith("✓")?O.green:O.red,marginTop:8,padding:"6px 10px",background:ownerDocMsg.startsWith("✓")?"rgba(26,158,110,0.08)":"rgba(217,64,64,0.06)",borderRadius:6}}>{ownerDocMsg}</div>}
            </div>
          )}

          {/* Document list */}
          {empDocList===null&&<div style={{fontFamily:O.sans,fontSize:12,color:O.textF,textAlign:"center",padding:"12px"}}>Loading documents…</div>}
          {empDocList!==null&&empDocList.length===0&&!docDrawerOpen&&(
            <div style={{fontFamily:O.sans,fontSize:12,color:O.textF,textAlign:"center",padding:"12px 0"}}>No documents on file yet. Add pay stubs, tax forms, or ID copies.</div>
          )}
          {(empDocList||[]).slice(0,5).map(doc=>{
            const catColor = doc.category==="payroll"?O.green:doc.category==="tax"?"#7c3aed":doc.category==="identity"?"#0891b2":O.textD;
            const catIcon = doc.category==="payroll"?"💵":doc.category==="tax"?"📝":doc.category==="identity"?"🪪":"📎";
            return(
              <div key={doc.id} style={{display:"flex",alignItems:"center",gap:10,padding:"8px 0",borderBottom:"1px solid "+O.border}}>
                <span style={{fontSize:16,flexShrink:0}}>{catIcon}</span>
                <div style={{flex:1,minWidth:0}}>
                  <div style={{fontFamily:O.sans,fontWeight:600,fontSize:12,color:O.text,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{doc.name}</div>
                  <div style={{fontFamily:O.mono,fontSize:9,color:catColor}}>{new Date(doc.created_at).toLocaleDateString("en-US",{month:"short",day:"numeric",year:"numeric"})}</div>
                </div>
                <button onClick={async()=>{
                  const _sb3=await getSB();
                  const {data:{session:ss}}=await _sb3.auth.getSession();
                  const r=await fetch(`/api/documents?userId=${emp.id}&action=download&docId=${doc.id}`,{headers:ss?.access_token?{"Authorization":"Bearer "+ss.access_token}:{}});
                  const d=await r.json();
                  if(d.url) window.open(d.url,"_blank");
                }} style={{padding:"4px 10px",background:O.bg3,border:"1px solid "+O.border,borderRadius:6,fontFamily:O.sans,fontSize:11,color:O.textD,cursor:"pointer",flexShrink:0}}>
                  ⬇ View
                </button>
              </div>
            );
          })}
          {(empDocList||[]).length>5&&<div style={{fontFamily:O.sans,fontSize:11,color:O.textF,textAlign:"center",marginTop:8}}>+{empDocList.length-5} more documents on employee portal</div>}
        </div>

        {/* Danger zone */}
        <div style={{padding:"16px 24px",borderTop:"1px solid "+O.border,flexShrink:0}}>
          <div style={{fontFamily:O.mono,fontSize:8,color:O.red,letterSpacing:"1.5px",marginBottom:10,textTransform:"uppercase"}}>Danger Zone</div>
          {confirmDeactivate?(
            <div>
              <div style={{fontFamily:O.sans,fontSize:12,color:O.red,marginBottom:8,lineHeight:1.5}}>Remove {displayName.split(" ")[0]}'s access? This can be reversed.</div>
              <div style={{display:"flex",gap:8}}>
                <button onClick={()=>setConfirmDeactivate(false)} style={{flex:1,padding:"8px",background:O.bg3,border:"1px solid "+O.border,borderRadius:7,fontFamily:O.sans,fontWeight:600,fontSize:12,color:O.textD,cursor:"pointer"}}>Cancel</button>
                <button onClick={deactivate} disabled={deactivateBusy} style={{flex:1,padding:"8px",background:"rgba(217,64,64,0.9)",border:"none",borderRadius:7,fontFamily:O.sans,fontWeight:700,fontSize:12,color:"#fff",cursor:"pointer"}}>
                  {deactivateBusy?"Removing...":"Confirm"}
                </button>
              </div>
            </div>
          ):(
            <button onClick={deactivate} style={{width:"100%",padding:"10px",background:O.redD,border:"1px solid rgba(217,64,64,0.2)",borderRadius:8,fontFamily:O.sans,fontWeight:600,fontSize:13,color:O.red,cursor:"pointer"}}>
              Deactivate {displayName.split(" ")[0]}
            </button>
          )}
        </div>
      </div>
    </>
  );
}

// ══════════════════════════════════════════════════
//  INTELLIGENCE TAB (outside OwnerCmd)
// ══════════════════════════════════════════════════
function IntelligenceTab({
  liveEmps, liveShifts, activeOrg, activeLocation,
  intelPrompt, setIntelPrompt,
  intelOutput, setIntelOutput,
  intelBusy, setIntelBusy, toast
}) {
  const mobile = useIsMobile();
  const LIVE = liveEmps||[];

  // Show coming soon by default until API is confirmed working
  React.useEffect(()=>{
    if(!intelOutput) setIntelOutput("__COMING_SOON__");
  },[]);
  const totalScheduledHrs = (liveShifts||[]).reduce((s,sh)=>s+(sh.end_hour-sh.start_hour),0);
  const avgRate = LIVE.length>0 ? LIVE.reduce((s,e)=>s+(parseFloat(e.rate)||15),0)/LIVE.length : 15;
  const projectedCost = totalScheduledHrs * avgRate;

  const runAI = async () => {
    if(!intelPrompt.trim()) return;
    setIntelBusy(true);
    setIntelOutput("");
    try {
      const empContext = LIVE.map(e=>`${e.name} (${e.role}, ${e.dept}, $${e.rate}/hr)`).join(", ");
      const systemPrompt = `You are ShiftPro's AI scheduling assistant. You help shift-based business managers build efficient schedules, manage labor costs, and optimize their workforce.

Current business: ${activeOrg?.name||"Unknown"}
Location: ${activeLocation?.name||"All locations"}
Team (${LIVE.length} employees): ${empContext||"No employees yet"}
Scheduled hours this week: ${totalScheduledHrs}h
Estimated labor cost: $${Math.round(projectedCost)}

Respond in a clear, practical, manager-friendly way. If asked to build a schedule, format it as a simple day-by-day breakdown. Keep responses concise and actionable.`;

      const response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 1000,
          system: systemPrompt,
          messages: [{ role: "user", content: intelPrompt }],
        }),
      });
      if(!response.ok){
        const err = await response.json().catch(()=>({}));
        if(response.status===401||response.status===403){
          setIntelOutput("__COMING_SOON__");
        } else {
          setIntelOutput("Unable to connect to AI. Please try again later.");
        }
        return;
      }
      const data = await response.json();
      const text = (data.content||[]).filter(b=>b.type==="text").map(b=>b.text).join("");
      setIntelOutput(text||"No response received.");
    } catch(e) {
      setIntelOutput("__COMING_SOON__");
    } finally {
      setIntelBusy(false);
    }
  };

  // Mock behavioral alerts based on real employee data
  const alerts = [
    ...LIVE.filter(e=>e.ghost>3).map(e=>({
      level:"red", icon:"🔴",
      title:"Ghost Hour Risk — "+e.name,
      detail:`${e.ghost} uncorroborated hours this period. Camera verification recommended.`,
      emp:e,
    })),
    ...LIVE.filter(e=>e.flags>0).map(e=>({
      level:"yellow", icon:"🟡",
      title:"Attendance Flag — "+e.name,
      detail:`${e.flags} late clock-in${e.flags>1?"s":""} recorded this month.`,
      emp:e,
    })),
    ...LIVE.filter(e=>e.streak>=10).slice(0,2).map(e=>({
      level:"green", icon:"🟢",
      title:"Top Performer — "+e.name,
      detail:`${e.streak}-day reliability streak. Consider recognition or advancement.`,
      emp:e,
    })),
  ];

  // Fill with default alerts if team is demo/empty
  const displayAlerts = alerts.length>0 ? alerts : [
    {level:"red",icon:"🔴",title:"Ghost Hour Risk — Carlos R.",detail:"4.1 uncorroborated hours this month. Camera verification recommended."},
    {level:"yellow",icon:"🟡",title:"Schedule Gap — Tuesday",detail:"No coverage after 3pm next week. Consider adding a closing shift."},
    {level:"green",icon:"🟢",title:"Top Performer — Jordan M.",detail:"14-day reliability streak with zero late arrivals. Outstanding."},
  ];

  const alertColor = level => ({red:O.red, yellow:O.amber, green:O.green})[level]||O.textD;

  const darkBg = "#0a0f1e";
  const darkCard = "#111827";
  const darkBorder = "rgba(255,255,255,0.08)";
  const cyan = "#00d4ff";
  const cyanD = "rgba(0,212,255,0.1)";

  return (
    <div style={{animation:"fadeUp 0.3s ease",paddingBottom:40}}>

      {/* Dark header banner */}
      <div style={{background:darkBg,borderRadius:16,padding:"24px 28px",marginBottom:20,position:"relative",overflow:"hidden"}}>
        {/* Subtle grid pattern */}
        <div style={{position:"absolute",inset:0,backgroundImage:"linear-gradient(rgba(0,212,255,0.03) 1px,transparent 1px),linear-gradient(90deg,rgba(0,212,255,0.03) 1px,transparent 1px)",backgroundSize:"32px 32px",pointerEvents:"none"}}/>
        <div style={{position:"relative"}}>
          <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:6}}>
            <div style={{width:8,height:8,borderRadius:"50%",background:cyan,animation:"blink 2s infinite"}}/>
            <div style={{fontFamily:O.mono,fontSize:9,color:cyan,letterSpacing:"2px",textTransform:"uppercase"}}>ShiftPro Intelligence - Beta</div>
          </div>
          <div style={{fontFamily:O.sans,fontWeight:800,fontSize:26,color:"#fff",marginBottom:6}}>🧠 AI Command Center</div>
          <div style={{fontFamily:O.sans,fontSize:13,color:"rgba(255,255,255,0.5)",lineHeight:1.6,maxWidth:600}}>
            Describe your scheduling needs in plain English. ShiftPro's AI builds your week, flags risks, and forecasts your labor costs — all from one place.
          </div>
        </div>
      </div>

      {/* AI Scheduling Assistant */}
      <div style={{background:darkCard,border:"1px solid "+darkBorder,borderRadius:16,padding:"24px",marginBottom:20,boxShadow:"0 4px 24px rgba(0,0,0,0.2)"}}>
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:16}}>
          <div>
            <div style={{fontFamily:O.mono,fontSize:8,color:cyan,letterSpacing:"2px",marginBottom:4,textTransform:"uppercase"}}>AI Scheduling Assistant</div>
            <div style={{fontFamily:O.sans,fontWeight:700,fontSize:16,color:"#fff"}}>Tell me what you need</div>
          </div>
          <div style={{display:"flex",alignItems:"center",gap:6,padding:"4px 12px",background:"rgba(0,212,255,0.08)",border:"1px solid rgba(0,212,255,0.15)",borderRadius:20}}>
            <div style={{width:6,height:6,borderRadius:"50%",background:cyan}}/>
            <span style={{fontFamily:O.mono,fontSize:8,color:cyan,letterSpacing:1}}>Powered by Claude</span>
          </div>
        </div>

        <textarea
          value={intelPrompt}
          onChange={e=>setIntelPrompt(e.target.value)}
          onKeyDown={e=>{ if(e.key==="Enter"&&(e.metaKey||e.ctrlKey)) runAI(); }}
          placeholder={`Try: "Build me a full week for my ${LIVE.length} employees, no one over 32 hours, always 2 people on Saturdays"\n\nOr: "Who should I schedule for Friday closing shift?"\n\nOr: "How can I reduce my labor cost this week?"`}
          rows={4}
          style={{width:"100%",padding:"14px",background:"rgba(255,255,255,0.04)",border:"1px solid rgba(0,212,255,0.2)",borderRadius:10,fontFamily:O.sans,fontSize:13,color:"#fff",outline:"none",resize:"vertical",boxSizing:"border-box",lineHeight:1.6}}
          onFocus={e=>e.target.style.borderColor="rgba(0,212,255,0.5)"}
          onBlur={e=>e.target.style.borderColor="rgba(0,212,255,0.2)"}
        />

        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginTop:12}}>
          <div style={{fontFamily:O.mono,fontSize:9,color:"rgba(255,255,255,0.25)"}}>⌘ Enter to send</div>
          <button
            onClick={runAI}
            style={{display:"flex",alignItems:"center",gap:8,padding:"11px 22px",background:intelBusy?"rgba(0,212,255,0.2)":"linear-gradient(135deg,rgba(0,212,255,0.9),rgba(0,150,220,0.9))",border:"none",borderRadius:9,fontFamily:O.sans,fontWeight:700,fontSize:14,color:intelBusy?"rgba(255,255,255,0.5)":"#0a0f1e",cursor:intelBusy?"not-allowed":"pointer",transition:"all 0.2s"}}>
            {intelBusy?(
              <><span style={{animation:"blink 1s infinite"}}>●</span> Thinking…</>
            ):(
              <>✨ Generate Schedule</>
            )}
          </button>
        </div>

        {/* Output */}
        {intelOutput&&intelOutput!=="__COMING_SOON__"&&(
          <div style={{marginTop:16,padding:"16px",background:"rgba(0,212,255,0.04)",border:"1px solid rgba(0,212,255,0.12)",borderRadius:10}}>
            <div style={{fontFamily:O.mono,fontSize:8,color:cyan,letterSpacing:"2px",marginBottom:10,textTransform:"uppercase"}}>AI Response</div>
            <div style={{fontFamily:O.sans,fontSize:13,color:"rgba(255,255,255,0.85)",lineHeight:1.8,whiteSpace:"pre-wrap"}}>{intelOutput}</div>
          </div>
        )}
        {intelOutput==="__COMING_SOON__"&&(
          <div style={{marginTop:16,padding:"24px",background:"rgba(0,0,0,0.3)",border:"1px solid rgba(0,212,255,0.12)",borderRadius:10,textAlign:"center"}}>
            <div style={{fontSize:32,marginBottom:12}}>🧠</div>
            <div style={{fontFamily:O.sans,fontWeight:700,fontSize:16,color:"#fff",marginBottom:8}}>AI Scheduling Assistant</div>
            <div style={{fontFamily:O.sans,fontSize:13,color:"rgba(255,255,255,0.5)",lineHeight:1.7,marginBottom:16}}>
              The AI assistant requires API configuration. This feature is currently in private beta and will be available to all ShiftPro plans in Q1 2027.
            </div>
            <div style={{display:"inline-flex",alignItems:"center",gap:8,fontFamily:O.mono,fontSize:9,color:"#00d4ff",letterSpacing:"2px",background:"rgba(0,212,255,0.08)",border:"1px solid rgba(0,212,255,0.2)",borderRadius:20,padding:"5px 14px"}}>
              <div style={{width:6,height:6,borderRadius:"50%",background:"#00d4ff"}}/> LAUNCHING Q1 2027
            </div>
          </div>
        )}

        {/* Quick prompts */}
        {!intelOutput&&!intelBusy&&(
          <div style={{marginTop:14,display:"flex",gap:8,flexWrap:"wrap"}}>
            {[
              "Build me a balanced schedule for this week",
              "Who has the most availability?",
              "How can I reduce overtime costs?",
              "Suggest a Saturday closing crew",
            ].map(p=>(
              <button key={p} onClick={()=>setIntelPrompt(p)}
                style={{padding:"6px 12px",background:"rgba(255,255,255,0.04)",border:"1px solid "+darkBorder,borderRadius:20,fontFamily:O.sans,fontSize:11,color:"rgba(255,255,255,0.5)",cursor:"pointer",transition:"all 0.15s"}}
                onMouseEnter={e=>{e.currentTarget.style.borderColor="rgba(0,212,255,0.3)";e.currentTarget.style.color="rgba(255,255,255,0.8)";}}
                onMouseLeave={e=>{e.currentTarget.style.borderColor=darkBorder;e.currentTarget.style.color="rgba(255,255,255,0.5)";}}>
                {p}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Two column: Alerts + Labor forecast */}
      <div style={{display:"grid",gridTemplateColumns:mobile?"1fr":"1fr 1fr",gap:16}}>

        {/* Behavioral Pattern Alerts */}
        <div style={{background:darkCard,border:"1px solid "+darkBorder,borderRadius:16,padding:"20px",boxShadow:"0 4px 24px rgba(0,0,0,0.2)"}}>
          <div style={{fontFamily:O.mono,fontSize:8,color:"rgba(255,255,255,0.35)",letterSpacing:"2px",marginBottom:4,textTransform:"uppercase"}}>Behavioral Intelligence</div>
          <div style={{fontFamily:O.sans,fontWeight:700,fontSize:15,color:"#fff",marginBottom:16}}>Pattern Alerts</div>

          <div style={{display:"flex",flexDirection:"column",gap:10}}>
            {displayAlerts.map((alert,i)=>(
              <div key={i} style={{padding:"12px 14px",background:"rgba(255,255,255,0.03)",border:"1px solid "+darkBorder,borderLeft:"3px solid "+alertColor(alert.level),borderRadius:"0 10px 10px 0"}}>
                <div style={{display:"flex",alignItems:"flex-start",gap:8}}>
                  <span style={{fontSize:14,flexShrink:0,marginTop:1}}>{alert.icon}</span>
                  <div>
                    <div style={{fontFamily:O.sans,fontWeight:600,fontSize:12,color:"rgba(255,255,255,0.85)",marginBottom:3}}>{alert.title}</div>
                    <div style={{fontFamily:O.sans,fontSize:11,color:"rgba(255,255,255,0.4)",lineHeight:1.4}}>{alert.detail}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div style={{marginTop:14,fontFamily:O.mono,fontSize:8,color:"rgba(255,255,255,0.2)",letterSpacing:1}}>
            BETA - AI insights update nightly
          </div>
        </div>

        {/* Predictive Labor Cost */}
        <div style={{background:darkCard,border:"1px solid "+darkBorder,borderRadius:16,padding:"20px",boxShadow:"0 4px 24px rgba(0,0,0,0.2)",display:"flex",flexDirection:"column"}}>
          <div style={{fontFamily:O.mono,fontSize:8,color:"rgba(255,255,255,0.35)",letterSpacing:"2px",marginBottom:4,textTransform:"uppercase"}}>Predictive Analytics</div>
          <div style={{fontFamily:O.sans,fontWeight:700,fontSize:15,color:"#fff",marginBottom:20}}>Labor Forecast</div>

          {/* Big number */}
          <div style={{textAlign:"center",marginBottom:20,flex:1,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center"}}>
            <div style={{fontFamily:O.mono,fontSize:9,color:"rgba(255,255,255,0.3)",letterSpacing:"2px",marginBottom:8,textTransform:"uppercase"}}>Projected Labor Cost - This Week</div>
            <div style={{fontFamily:O.sans,fontWeight:800,fontSize:40,color:cyan,letterSpacing:"-1px"}}>
              ${Math.round(projectedCost).toLocaleString()}
            </div>
            <div style={{fontFamily:O.mono,fontSize:10,color:"rgba(255,255,255,0.3)",marginTop:6}}>
              {totalScheduledHrs}h × ${avgRate.toFixed(2)} avg rate
            </div>
          </div>

          {/* Mini breakdown */}
          <div style={{display:"flex",flexDirection:"column",gap:8,marginBottom:16}}>
            {[
              {label:"Team size",value:LIVE.length+" employees",color:"rgba(255,255,255,0.5)"},
              {label:"Avg hourly rate",value:"$"+avgRate.toFixed(2)+"/hr",color:"rgba(255,255,255,0.5)"},
              {label:"Total scheduled",value:totalScheduledHrs+"h this week",color:"rgba(255,255,255,0.5)"},
              {label:"OT exposure",value:LIVE.filter(e=>e.ot>0).length+" employees",color:LIVE.filter(e=>e.ot>0).length>0?"#ef4444":"#1a9e6e"},
            ].map(row=>(
              <div key={row.label} style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                <span style={{fontFamily:O.sans,fontSize:12,color:"rgba(255,255,255,0.35)"}}>{row.label}</span>
                <span style={{fontFamily:O.mono,fontSize:11,color:row.color,fontWeight:600}}>{row.value}</span>
              </div>
            ))}
          </div>

          <button
            onClick={()=>{
                          // Build CSV from payroll data
                          const rows = [["Employee","Hours","Regular Pay","OT Pay","Total"]];
                          (livePayroll||[]).forEach(p=>{
                            rows.push([p.name||"",String(p.hours||0),String(p.pay||0),String(p.ot||0),String((p.pay||0)+(p.ot||0))]);
                          });
                          const csv = rows.map(r=>r.join(",")).join("\n");
                          const blob = new Blob([csv],{type:"text/csv"});
                          const url = URL.createObjectURL(blob);
                          const a = document.createElement("a");
                          a.href=url; a.download="payroll_export.csv"; a.click();
                          URL.revokeObjectURL(url);
                          toast("Payroll exported ✓","success");
                        }}
            style={{width:"100%",padding:"10px",background:"rgba(0,212,255,0.08)",border:"1px solid rgba(0,212,255,0.2)",borderRadius:9,fontFamily:O.sans,fontWeight:600,fontSize:12,color:cyan,cursor:"pointer"}}>
            Optimize for Budget  to 
          </button>
        </div>
      </div>
    </div>
  );
}

// ──────────────────────────────────────────────────
// DEPT COLOR MAP — consistent across entire app
// ──────────────────────────────────────────────────
const DEPT_COLOR_MAP = {
  "Front End":   "#e07b00",
  "Sales Floor": "#0891b2",
  "Inventory":   "#7c3aed",
  "Operations":  "#1a9e6e",
  "Security":    "#d94040",
  "Management":  "#2563eb",
  "Kitchen":     "#c026d3",
  "Bar":         "#ca8a04",
  "Service":     "#0f766e",
  "Supervisor":  "#9333ea",
};
const deptColor = (dept) => DEPT_COLOR_MAP[dept] || "#6366f1";

// ──────────────────────────────────────────────────
// CONFETTI OVERLAY
// ──────────────────────────────────────────────────
function ConfettiOverlay({ onDone }) {
  React.useEffect(()=>{ const t = setTimeout(onDone, 2000); return()=>clearTimeout(t); }, []);
  // Use deterministic values based on index to avoid SSR hydration mismatch
  const COLORS_C = ["#e07b00","#1a9e6e","#7c3aed","#0891b2","#d94040","#f59e0b"];
  const dots = Array.from({length:40},(_,i)=>({
    x: ((i*37+13)%100),
    delay: ((i*7)%6)/10,
    dur: 1.2+((i*3)%8)/10,
    color: COLORS_C[i%6],
    size: 6+((i*5)%8),
  }));
  return (
    <div style={{position:"fixed",inset:0,zIndex:9000,pointerEvents:"none",display:"flex",alignItems:"center",justifyContent:"center"}}>
      <style>{`@keyframes confettiFall{0%{transform:translateY(-10vh) rotate(0deg);opacity:1}100%{transform:translateY(110vh) rotate(720deg);opacity:0}}`}</style>
      {dots.map((d,i)=>(
        <div key={i} style={{position:"absolute",left:d.x+"%",top:"-5%",width:d.size,height:d.size,borderRadius:d.size/2,background:d.color,animation:`confettiFall ${d.dur}s ${d.delay}s ease-in forwards`}}/>
      ))}
      <div style={{background:"rgba(255,255,255,0.95)",borderRadius:20,padding:"28px 40px",textAlign:"center",boxShadow:"0 20px 60px rgba(0,0,0,0.15)",animation:"fadeUp 0.3s ease"}}>
        <div style={{fontSize:40,marginBottom:8}}>🎉</div>
        <div style={{fontFamily:O.sans,fontWeight:800,fontSize:22,color:O.text}}>Schedule Published!</div>
        <div style={{fontFamily:O.sans,fontSize:13,color:O.textD,marginTop:4}}>Your team has been notified.</div>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════
//  SHIFT ADD MODAL (outside OwnerCmd)
// ══════════════════════════════════════════════════
function ShiftAddModal({ selectedCell, setSelectedCell, liveEmps, currentWeekOffset, addShift, getMonday }) {
  const HOURS_LIST = [6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23];
  const fmtH2 = h => h===0?"12:00 AM":h<12?h+":00 AM":h===12?"12:00 PM":(h-12)+":00 PM";
  const modalEmps = liveEmps||[];

  return (
    <div
      style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.5)",zIndex:500,display:"flex",alignItems:"center",justifyContent:"center",padding:20,backdropFilter:"blur(6px)"}}
      onClick={e=>{if(e.target===e.currentTarget)setSelectedCell(null);}}>
      <div style={{background:"#fff",borderRadius:16,padding:"28px",width:"100%",maxWidth:420,boxShadow:"0 20px 60px rgba(0,0,0,0.15)",animation:"fadeUp 0.3s ease"}}>
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:20}}>
          <div>
            <div style={{fontFamily:O.mono,fontSize:8,color:O.cyan,letterSpacing:"2px",marginBottom:4,textTransform:"uppercase"}}>Add Shift</div>
            <div style={{fontFamily:O.sans,fontWeight:700,fontSize:18,color:O.text}}>{selectedCell.day}</div>
          </div>
          <button onClick={()=>setSelectedCell(null)} style={{background:"none",border:"none",fontSize:22,cursor:"pointer",color:O.textF}}>×</button>
        </div>
        <div style={{marginBottom:12}}>
          <div style={{fontFamily:O.mono,fontSize:8,color:O.textF,letterSpacing:"1.5px",marginBottom:5,textTransform:"uppercase"}}>Employee</div>
          <select
            value={selectedCell.empId||""}
            onChange={e=>setSelectedCell(p=>({...p,empId:e.target.value}))}
            style={{width:"100%",padding:"9px 12px",background:O.bg3,border:"1px solid "+O.border,borderRadius:7,fontFamily:O.sans,fontSize:13,color:O.text,outline:"none",cursor:"pointer",boxSizing:"border-box"}}>
            <option value="">— Select employee —</option>
            {modalEmps.map(e=>(<option key={e.id} value={e.id}>{e.name} — {e.role}</option>))}
          </select>
        </div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:12}}>
          {[
            {l:"Start Time",k:"start",list:HOURS_LIST},
            {l:"End Time",k:"end",list:HOURS_LIST.filter(h=>h>(selectedCell.start||9))}
          ].map(f=>(
            <div key={f.k}>
              <div style={{fontFamily:O.mono,fontSize:8,color:O.textF,letterSpacing:"1.5px",marginBottom:5,textTransform:"uppercase"}}>{f.l}</div>
              <select
                value={selectedCell[f.k]||9}
                onChange={e=>setSelectedCell(p=>({...p,[f.k]:parseInt(e.target.value)}))}
                style={{width:"100%",padding:"9px 12px",background:O.bg3,border:"1px solid "+O.border,borderRadius:7,fontFamily:O.sans,fontSize:12,color:O.text,outline:"none",cursor:"pointer",boxSizing:"border-box"}}>
                {f.list.map(h=><option key={h} value={h}>{fmtH2(h)}</option>)}
              </select>
            </div>
          ))}
        </div>
        <div style={{marginBottom:12}}>
          <div style={{fontFamily:O.mono,fontSize:8,color:O.textF,letterSpacing:"1.5px",marginBottom:5,textTransform:"uppercase"}}>Role Label (optional)</div>
          <input
            value={selectedCell.roleLabel||""}
            onChange={e=>setSelectedCell(p=>({...p,roleLabel:e.target.value}))}
            placeholder="Opening, Closing, Bar..."
            style={{width:"100%",padding:"9px 12px",background:O.bg3,border:"1px solid "+O.border,borderRadius:7,fontFamily:O.sans,fontSize:13,color:O.text,outline:"none",boxSizing:"border-box"}}
          />
        </div>
        <div style={{marginBottom:16}}>
          <div style={{fontFamily:O.mono,fontSize:8,color:O.textF,letterSpacing:"1.5px",marginBottom:5,textTransform:"uppercase"}}>Shift Note (optional)</div>
          <textarea
            value={selectedCell.shiftNote||""}
            onChange={e=>setSelectedCell(p=>({...p,shiftNote:e.target.value.slice(0,200)}))}
            placeholder="e.g. Count drawer, check deliveries, opening checklist..."
            maxLength={200}
            rows={2}
            style={{width:"100%",padding:"9px 12px",background:O.bg3,border:"1px solid "+O.border,borderRadius:7,fontFamily:O.sans,fontSize:12,color:O.text,outline:"none",resize:"none",boxSizing:"border-box"}}
          />
          <div style={{fontFamily:O.mono,fontSize:8,color:O.textF,textAlign:"right",marginTop:2}}>{(selectedCell.shiftNote||"").length}/200</div>
        </div>
        <button
          onClick={async()=>{
            if(!selectedCell.empId) return;
            const mon=getMonday(currentWeekOffset);
            const DAYS_ORDER=["Mon","Tue","Wed","Thu","Fri","Sat","Sun"];
            const dayIdx=DAYS_ORDER.indexOf(selectedCell.day);
            const [y,m,d]=mon.split("-").map(Number);
            const shiftDate=new Date(y,m-1,d);
            shiftDate.setDate(shiftDate.getDate()+dayIdx);
            const shiftDateStr=shiftDate.getFullYear()+"-"+String(shiftDate.getMonth()+1).padStart(2,"0")+"-"+String(shiftDate.getDate()).padStart(2,"0");
            await addShift({
              userId:selectedCell.empId,
              weekStart:mon,
              day:selectedCell.day,
              date:shiftDateStr,
              start:selectedCell.start||9,
              end:selectedCell.end||17,
              role:selectedCell.roleLabel||"",
              notes:selectedCell.shiftNote||""
            });
            setSelectedCell(null);
          }}
          style={{width:"100%",padding:"13px",background:"linear-gradient(135deg,#0891b2,#0e7490)",border:"none",borderRadius:9,fontFamily:O.sans,fontWeight:700,fontSize:14,color:"#fff",cursor:"pointer",boxShadow:"0 4px 14px rgba(8,145,178,0.3)"}}>
          Add Shift  to 
        </button>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════
//  SETTINGS TAB (outside OwnerCmd)
// ══════════════════════════════════════════════════
const DEPT_COLORS = [
  "#e07b00","#0891b2","#7c3aed","#1a9e6e",
  "#d94040","#2563eb","#c026d3","#ca8a04",
  "#0f766e","#9333ea","#b45309","#0284c7",
];

function SettingsTab({
  ownerProfile, activeOrg,
  liveLocations, setLiveLocations, activeLocation, selectLocation, setLocationGate,
  settingsProfile, setSettingsProfile,
  settingsPay, setSettingsPay,
  settingsDepts, setSettingsDepts,
  settingsNewDept, setSettingsNewDept,
  settingsAddingDept, setSettingsAddingDept,
  settingsSaveBusy, setSettingsSaveBusy,
  settingsShowPwChange, setSettingsShowPwChange,
  settingsPw1, setSettingsPw1,
  settingsPw2, setSettingsPw2,
  settingsPwMsg, setSettingsPwMsg,
  settingsPwBusy, setSettingsPwBusy,
  toast, onLogout,
}) {
  const mobile = useIsMobile();
  const [confirmDeleteLocId,setConfirmDeleteLocId] = useState(null);
  const card = {background:"#fff",border:"1px solid "+O.border,borderRadius:14,padding:"22px 24px",boxShadow:O.shadow};
  const label = {fontFamily:O.mono,fontSize:8,color:O.textF,letterSpacing:"1.5px",display:"block",marginBottom:6,textTransform:"uppercase"};
  const input = {width:"100%",padding:"10px 13px",background:O.bg3,border:"1px solid "+O.border,borderRadius:8,fontFamily:O.sans,fontSize:13,color:O.text,outline:"none",boxSizing:"border-box"};
  const sectionTitle = {fontFamily:O.sans,fontWeight:700,fontSize:16,color:O.text,marginBottom:4};
  const sectionSub = {fontFamily:O.sans,fontSize:12,color:O.textD,marginBottom:18};

  const saveProfile = async () => {
    setSettingsSaveBusy(true);
    // Save to localStorage immediately
    try{ localStorage.setItem("shiftpro_org_profile", JSON.stringify(settingsProfile)); }catch(e){}
    try {
      const sb = await getSB();
      const orgId = activeOrg?.id;
      if(orgId) {
        const {data:{session}} = await sb.auth.getSession();
        // Use API route with service role to bypass RLS
        const res = await fetch("/api/org", {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            ...(session?.access_token ? {"Authorization":"Bearer "+session.access_token} : {})
          },
          body: JSON.stringify({
            orgId,
            name: settingsProfile.name,
            industry: settingsProfile.type,
            address: settingsProfile.address,
            phone: settingsProfile.phone,
          })
        });
        if(!res.ok) {
          // Fallback: try direct update (works if RLS allows)
          const {error} = await sb.from("organizations").update({
            name: settingsProfile.name,
            industry: settingsProfile.type,
            address: settingsProfile.address,
            phone: settingsProfile.phone,
          }).eq("id", orgId);
          if(error) throw error;
        }
      }
      // Update ALL org state so topbar + Command tab reflect new name immediately
      const updatedOrg = {name:settingsProfile.name, industry:settingsProfile.type, address:settingsProfile.address, phone:settingsProfile.phone};
      setOwnerOrg(prev=>prev?{...prev,...updatedOrg}:prev);
      setActiveOrg(prev=>prev?{...prev,...updatedOrg}:prev);
      setOwnerOrgs(prev=>prev.map(o=>o.id===activeOrg?.id?{...o,...updatedOrg}:o));
      try{
        localStorage.setItem("shiftpro_org_name", settingsProfile.name);
        if(activeOrg?.id){
          localStorage.setItem("shiftpro_org_name_"+activeOrg.id, settingsProfile.name);
          localStorage.setItem("shiftpro_org_type_"+activeOrg.id, settingsProfile.type);
        }
      }catch(e){}
      toast("Company profile saved ✓", "success");
    } catch(e) {
      toast("Saved locally ✓", "success");
    } finally {
      setSettingsSaveBusy(false);
    }
  };

  const changePassword = async () => {
    if(!settingsPw1 || !settingsPw2) { setSettingsPwMsg("Please fill both fields."); return; }
    if(settingsPw1 !== settingsPw2) { setSettingsPwMsg("Passwords do not match."); return; }
    if(settingsPw1.length < 8) { setSettingsPwMsg("Must be at least 8 characters."); return; }
    setSettingsPwBusy(true); setSettingsPwMsg("");
    try {
      const sb = await getSB();
      const {error} = await sb.auth.updateUser({password: settingsPw1});
      if(error) throw error;
      setSettingsPwMsg("✓ Password updated successfully!");
      setSettingsPw1(""); setSettingsPw2("");
      setTimeout(()=>{ setSettingsShowPwChange(false); setSettingsPwMsg(""); }, 2000);
      toast("Password updated ✓", "success");
    } catch(e) {
      setSettingsPwMsg(e.message||"Failed to update password.");
    } finally {
      setSettingsPwBusy(false);
    }
  };

  const saveDeptsToSupabase = async (depts) => {
    try{
      const sb = await getSB();
      const orgId = activeOrg?.id;
      if(orgId) await sb.from("organizations").update({departments: depts}).eq("id", orgId);
    }catch(e){} // localStorage always saves — Supabase is bonus
  };

  const addDept = () => {
    const trimmed = settingsNewDept.trim();
    if(!trimmed || settingsDepts.includes(trimmed)) return;
    const updated = [...settingsDepts, trimmed];
    setSettingsDepts(updated);
    try{ localStorage.setItem("shiftpro_departments", JSON.stringify(updated)); }catch(e){}
    saveDeptsToSupabase(updated);
    setSettingsNewDept("");
    setSettingsAddingDept(false);
    toast("Department added ✓", "success");
  };

  const removeDept = (dept) => {
    const updated = settingsDepts.filter(d=>d!==dept);
    setSettingsDepts(updated);
    try{ localStorage.setItem("shiftpro_departments", JSON.stringify(updated)); }catch(e){}
    saveDeptsToSupabase(updated);
  };

  return (
    <div style={{animation:"fadeUp 0.3s ease",paddingBottom:40}}>
      <div style={{marginBottom:16}}>
        <div style={{fontFamily:O.mono,fontSize:8,color:O.amber,letterSpacing:"2px",marginBottom:4,textTransform:"uppercase"}}>Settings</div>
        <div style={{fontFamily:O.sans,fontWeight:800,fontSize:22,color:O.text}}>Business Settings</div>
      </div>

      <div style={{display:"grid",gridTemplateColumns:mobile?"1fr":"1fr 1fr",gap:16}}>

        {/* ── COMPANY PROFILE ── */}
        <div style={card}>
          <div style={sectionTitle}>🏢 Company Profile</div>
          <div style={sectionSub}>Your business details shown on reports and employee portals.</div>

          <div style={{marginBottom:13}}>
            <label style={label}>Business Name</label>
            <input
              value={settingsProfile.name}
              onChange={e=>setSettingsProfile(p=>({...p,name:e.target.value}))}
              placeholder="Sea Lion Dockside Bar"
              style={input}
              onFocus={e=>e.target.style.borderColor=O.amber}
              onBlur={e=>e.target.style.borderColor=O.border}
            />
          </div>

          <div style={{marginBottom:13}}>
            <label style={label}>Business Type</label>
            <select
              value={settingsProfile.type}
              onChange={e=>setSettingsProfile(p=>({...p,type:e.target.value}))}
              style={{...input,cursor:"pointer"}}>
              {["Restaurant","Bar","Retail","Cafe","Hotel","Brewery","Marina","Other"].map(t=>(
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>

          <div style={{marginBottom:13}}>
            <label style={label}>Primary Address</label>
            <input
              value={settingsProfile.address}
              onChange={e=>setSettingsProfile(p=>({...p,address:e.target.value}))}
              placeholder="345 SW Bay Blvd, Newport, OR 97365"
              style={input}
              onFocus={e=>e.target.style.borderColor=O.amber}
              onBlur={e=>e.target.style.borderColor=O.border}
            />
          </div>

          <div style={{marginBottom:20}}>
            <label style={label}>Phone Number</label>
            <input
              value={settingsProfile.phone}
              onChange={e=>setSettingsProfile(p=>({...p,phone:e.target.value}))}
              placeholder="(541) 555-0100"
              type="tel"
              style={input}
              onFocus={e=>e.target.style.borderColor=O.amber}
              onBlur={e=>e.target.style.borderColor=O.border}
            />
          </div>

          <button
            onClick={saveProfile}
            style={{width:"100%",padding:"11px",background:settingsSaveBusy?"rgba(224,123,0,0.5)":"linear-gradient(135deg,#e07b00,#c96800)",border:"none",borderRadius:9,fontFamily:O.sans,fontWeight:700,fontSize:13,color:"#fff",cursor:settingsSaveBusy?"not-allowed":"pointer",boxShadow:"0 4px 14px rgba(224,123,0,0.25)"}}>
            {settingsSaveBusy?"Saving…":"Save Company Profile"}
          </button>
        </div>

        {/* ── PAY & SCHEDULE ── */}
        <div style={card}>
          <div style={sectionTitle}>💵 Pay & Schedule</div>
          <div style={sectionSub}>Configure how pay periods and shifts are calculated.</div>

          <div style={{marginBottom:13}}>
            <label style={label}>Pay Period</label>
            <select
              value={settingsPay.period}
              onChange={e=>setSettingsPay(p=>({...p,period:e.target.value}))}
              style={{...input,cursor:"pointer"}}>
              {["Weekly","Bi-weekly","Semi-monthly","Monthly"].map(t=>(
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>

          <div style={{marginBottom:13}}>
            <label style={label}>Overtime Threshold (hrs/week)</label>
            <input
              value={settingsPay.otThreshold}
              onChange={e=>setSettingsPay(p=>({...p,otThreshold:e.target.value}))}
              type="number"
              placeholder="40"
              style={input}
              onFocus={e=>e.target.style.borderColor=O.amber}
              onBlur={e=>e.target.style.borderColor=O.border}
            />
          </div>

          <div style={{marginBottom:13}}>
            <label style={label}>Default Shift Length</label>
            <select
              value={settingsPay.shiftLen}
              onChange={e=>setSettingsPay(p=>({...p,shiftLen:e.target.value}))}
              style={{...input,cursor:"pointer"}}>
              {[["6","6 hours"],["7","7 hours"],["8","8 hours (standard)"],["10","10 hours"],["12","12 hours"]].map(([v,l])=>(
                <option key={v} value={v}>{l}</option>
              ))}
            </select>
          </div>

          <div style={{marginBottom:20}}>
            <label style={label}>Work Week Starts On</label>
            <div style={{display:"flex",gap:8}}>
              {["Mon","Sun"].map(d=>(
                <button
                  key={d}
                  onClick={()=>setSettingsPay(p=>({...p,weekStart:d}))}
                  style={{flex:1,padding:"9px",border:"1px solid "+(settingsPay.weekStart===d?O.amber:O.border),borderRadius:8,fontFamily:O.sans,fontWeight:600,fontSize:13,cursor:"pointer",background:settingsPay.weekStart===d?O.amberD:"none",color:settingsPay.weekStart===d?O.amber:O.textD,transition:"all 0.15s"}}>
                  {d==="Mon"?"Monday":"Sunday"}
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={()=>{try{localStorage.setItem("shiftpro_pay_settings",JSON.stringify(settingsPay));}catch(e){}toast("Pay settings saved ✓","success");}}
            style={{width:"100%",padding:"11px",background:"linear-gradient(135deg,#1a9e6e,#15855c)",border:"none",borderRadius:9,fontFamily:O.sans,fontWeight:700,fontSize:13,color:"#fff",cursor:"pointer",boxShadow:"0 4px 14px rgba(26,158,110,0.25)"}}>
            Save Pay Settings
          </button>
        </div>

        {/* ── DEPARTMENTS ── */}
        <div style={card}>
          <div style={sectionTitle}>🏷️ Departments</div>
          <div style={sectionSub}>Organize your team by department for scheduling and reporting.</div>

          <div style={{display:"flex",flexWrap:"wrap",gap:8,marginBottom:16}}>
            {settingsDepts.map((dept,idx)=>{
              const color = DEPT_COLORS[idx % DEPT_COLORS.length];
              return (
                <div key={dept} style={{display:"flex",alignItems:"center",gap:5,padding:"5px 10px 5px 12px",background:color+"14",border:"1px solid "+color+"30",borderRadius:20}}>
                  <div style={{width:7,height:7,borderRadius:"50%",background:color,flexShrink:0}}/>
                  <span style={{fontFamily:O.sans,fontSize:12,fontWeight:600,color}}>{dept}</span>
                  <button
                    onClick={()=>removeDept(dept)}
                    style={{background:"none",border:"none",cursor:"pointer",color:color,fontSize:14,lineHeight:1,padding:"0 0 0 2px",opacity:0.6,fontWeight:700}}
                    onMouseEnter={e=>e.target.style.opacity=1}
                    onMouseLeave={e=>e.target.style.opacity=0.6}>
                    ×
                  </button>
                </div>
              );
            })}
          </div>

          {settingsAddingDept ? (
            <div style={{display:"flex",gap:8,marginBottom:12}}>
              <input
                value={settingsNewDept}
                onChange={e=>setSettingsNewDept(e.target.value)}
                onKeyDown={e=>{if(e.key==="Enter")addDept();if(e.key==="Escape"){setSettingsAddingDept(false);setSettingsNewDept("");}}}
                placeholder="Department name..."
                autoFocus
                style={{flex:1,padding:"8px 12px",background:O.bg3,border:"1px solid "+O.amber,borderRadius:8,fontFamily:O.sans,fontSize:13,color:O.text,outline:"none"}}
              />
              <button onClick={addDept} style={{padding:"8px 14px",background:O.amberD,border:"1px solid "+O.amberB,borderRadius:8,fontFamily:O.sans,fontWeight:600,fontSize:12,color:O.amber,cursor:"pointer"}}>Add</button>
              <button onClick={()=>{setSettingsAddingDept(false);setSettingsNewDept("");}} style={{padding:"8px 10px",background:"none",border:"1px solid "+O.border,borderRadius:8,fontFamily:O.sans,fontSize:12,color:O.textD,cursor:"pointer"}}>Cancel</button>
            </div>
          ) : (
            <button
              onClick={()=>setSettingsAddingDept(true)}
              style={{display:"flex",alignItems:"center",gap:6,padding:"8px 14px",background:"none",border:"1.5px dashed rgba(224,123,0,0.3)",borderRadius:8,fontFamily:O.sans,fontWeight:600,fontSize:12,color:O.amber,cursor:"pointer",marginBottom:12}}>
              + Add Department
            </button>
          )}

          <div style={{fontFamily:O.mono,fontSize:9,color:O.textF,marginTop:4}}>
            {settingsDepts.length} department{settingsDepts.length!==1?"s":""} configured
          </div>
        </div>

        {/* ── LOCATION MANAGEMENT ── */}
        <div style={{...card, gridColumn: mobile?"auto":"1 / -1"}}>
          <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:4}}>
            <div style={sectionTitle}>📍 Locations</div>
            <button onClick={()=>setAddLocOpen(true)} style={{padding:"7px 14px",background:"linear-gradient(135deg,#e07b00,#c96800)",border:"none",borderRadius:8,fontFamily:O.sans,fontWeight:600,fontSize:12,color:"#fff",cursor:"pointer"}}>
              + Add Location
            </button>
          </div>
          <div style={{fontFamily:O.sans,fontSize:12,color:O.textD,marginBottom:18}}>Each location has its own staff, schedule, and payroll. Click a location to make it active.</div>
          <div style={{display:"flex",flexDirection:"column",gap:8,marginBottom:16}}>
            {(liveLocations||[]).map((loc)=>{
              const isActive = activeLocation?.id===loc.id;
              const isConfirming = confirmDeleteLocId===loc.id;
              return(
                <div key={loc.id} style={{borderRadius:12,border:"1.5px solid "+(isConfirming?"rgba(217,64,64,0.4)":isActive?O.amberB:O.border),overflow:"hidden",transition:"all 0.2s"}}>
                  {/* Main row */}
                  <div style={{display:"flex",alignItems:"center",gap:12,padding:"12px 16px",background:isConfirming?"rgba(217,64,64,0.04)":isActive?O.amberD:"#fff"}}>
                    <div style={{width:38,height:38,borderRadius:9,background:isActive?"linear-gradient(135deg,#e07b00,#c96800)":"linear-gradient(135deg,#94a3b8,#64748b)",display:"flex",alignItems:"center",justifyContent:"center",fontFamily:O.mono,fontWeight:800,fontSize:15,color:"#fff",flexShrink:0}}>
                      {(loc.name||"?")[0].toUpperCase()}
                    </div>
                    <div style={{flex:1,minWidth:0}}>
                      <div style={{fontFamily:O.sans,fontWeight:700,fontSize:14,color:O.text,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{loc.name}</div>
                      <div style={{fontFamily:O.mono,fontSize:9,color:O.textF,marginTop:1}}>{loc.address||"No address set"} {loc.timezone?" - "+loc.timezone:""}</div>
                    </div>
                    {isActive&&(
                      <span style={{fontFamily:O.mono,fontSize:8,color:O.amber,background:O.amberD,border:"1px solid "+O.amberB,borderRadius:20,padding:"3px 10px",letterSpacing:"0.5px",flexShrink:0}}>● ACTIVE</span>
                    )}
                    {!isActive&&!isConfirming&&(
                      <button onClick={()=>selectLocation(loc)} style={{padding:"5px 12px",background:O.bg3,border:"1px solid "+O.border,borderRadius:6,fontFamily:O.sans,fontSize:11,fontWeight:600,color:O.textD,cursor:"pointer",flexShrink:0}}>
                        Switch
                      </button>
                    )}
                    {!isConfirming&&(
                      <button onClick={()=>setConfirmDeleteLocId(loc.id)} style={{padding:"5px 10px",background:"none",border:"1px solid rgba(217,64,64,0.25)",borderRadius:6,fontFamily:O.sans,fontSize:11,fontWeight:600,color:O.red,cursor:"pointer",flexShrink:0,opacity:0.7}}>
                        🗑
                      </button>
                    )}
                    {isConfirming&&(
                      <button onClick={()=>setConfirmDeleteLocId(null)} style={{padding:"5px 12px",background:O.bg3,border:"1px solid "+O.border,borderRadius:6,fontFamily:O.sans,fontSize:11,fontWeight:600,color:O.textD,cursor:"pointer",flexShrink:0}}>
                        Cancel
                      </button>
                    )}
                  </div>
                  {/* Confirmation panel — slides in */}
                  {isConfirming&&(
                    <div style={{background:"rgba(217,64,64,0.06)",borderTop:"1px solid rgba(217,64,64,0.15)",padding:"12px 16px",display:"flex",alignItems:"center",justifyContent:"space-between",gap:12}}>
                      <div>
                        <div style={{fontFamily:O.sans,fontWeight:700,fontSize:13,color:O.red,marginBottom:2}}>Delete "{loc.name}"?</div>
                        <div style={{fontFamily:O.sans,fontSize:11,color:O.textD,lineHeight:1.4}}>This will permanently remove this location and all its associated shifts and clock events. This cannot be undone.</div>
                      </div>
                      <button onClick={async()=>{
                        setConfirmDeleteLocId(null);
                        try{
                          // Use service role API — bypasses RLS so delete always sticks
                          const sb2=await getSB();
                          const {data:{session:ss}}=await sb2.auth.getSession();
                          const res=await fetch("/api/location",{
                            method:"DELETE",
                            headers:{"Content-Type":"application/json",...(ss?.access_token?{"Authorization":"Bearer "+ss.access_token}:{})},
                            body:JSON.stringify({locationId:loc.id})
                          });
                          if(!res.ok){const d=await res.json();throw new Error(d.error||"Delete failed");}
                          const updated=(liveLocations||[]).filter(l=>l.id!==loc.id);
                          setLiveLocations(updated);
                          try{
                            localStorage.setItem("shiftpro_all_locs",JSON.stringify(updated));
                            if(loc.org_id) localStorage.setItem("shiftpro_cached_locs_"+loc.org_id,JSON.stringify(updated));
                            if(activeLocation?.id===loc.id){
                              const next=updated[0]||null;
                              if(next) selectLocation(next);
                              else{ localStorage.removeItem("shiftpro_active_loc"); localStorage.removeItem("shiftpro_active_loc_obj"); setLocationGate(updated.length===0?"none":"pick"); }
                            }
                          }catch(e){}
                          toast("✓ "+loc.name+" deleted","success");
                        }catch(e){ toast("Delete failed: "+e.message,"error"); }
}} style={{padding:"9px 18px",background:"linear-gradient(135deg,#d94040,#b91c1c)",border:"none",borderRadius:8,fontFamily:O.sans,fontWeight:700,fontSize:12,color:"#fff",cursor:"pointer",flexShrink:0,whiteSpace:"nowrap",boxShadow:"0 2px 8px rgba(217,64,64,0.3)"}}>
                        Yes, Delete
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
            {(liveLocations||[]).length===0&&(
              <div style={{textAlign:"center",padding:"24px",fontFamily:O.sans,fontSize:13,color:O.textF,background:O.bg3,borderRadius:10}}>No locations yet. Click "+ Add Location" to create one.</div>
            )}
          </div>
          <div style={{background:"rgba(99,102,241,0.04)",border:"1px solid rgba(99,102,241,0.12)",borderRadius:8,padding:"10px 14px",display:"flex",alignItems:"center",gap:10}}>
            <span style={{fontSize:14}}>💡</span>
            <div style={{fontFamily:O.sans,fontSize:11,color:O.textD,lineHeight:1.5}}>
              <strong style={{color:O.text}}>Starter:</strong> 1 location - <strong style={{color:O.text}}>Pro:</strong> up to 5 - <strong style={{color:O.text}}>Enterprise:</strong> unlimited
              <span style={{marginLeft:8,fontFamily:O.mono,fontSize:9,color:O.purple,background:"rgba(124,58,237,0.08)",border:"1px solid rgba(124,58,237,0.2)",borderRadius:4,padding:"2px 6px"}}>BILLING COMING SOON</span>
            </div>
          </div>
        </div>

        {/* ── MY ACCOUNT ── */}
        <div style={card}>
          <div style={sectionTitle}>👤 My Account</div>
          <div style={sectionSub}>Manage your login credentials and sign out.</div>

          {/* Owner info display */}
          <div style={{background:O.bg3,borderRadius:10,padding:"14px 16px",marginBottom:18,display:"flex",alignItems:"center",gap:12}}>
            <div style={{width:44,height:44,borderRadius:"50%",background:"linear-gradient(135deg,#e07b00,#c96800)",display:"flex",alignItems:"center",justifyContent:"center",fontFamily:O.mono,fontWeight:700,fontSize:14,color:"#fff",flexShrink:0}}>
              {(ownerProfile?.first_name||"?")[0].toUpperCase()}{(ownerProfile?.last_name||"?")[0].toUpperCase()}
            </div>
            <div>
              <div style={{fontFamily:O.sans,fontWeight:700,fontSize:15,color:O.text}}>{ownerProfile?.first_name} {ownerProfile?.last_name}</div>
              <div style={{fontFamily:O.mono,fontSize:10,color:O.textF,marginTop:2}}>{ownerProfile?.email||"—"}</div>
              <div style={{marginTop:4}}>
                <OBadge label={ownerProfile?.app_role||"owner"} color={O.amber} sm/>
              </div>
            </div>
          </div>

          {/* Change password */}
          <button
            onClick={()=>{setSettingsShowPwChange(s=>!s);setSettingsPwMsg("");setSettingsPw1("");setSettingsPw2("");}}
            style={{display:"flex",alignItems:"center",gap:8,padding:"9px 14px",background:O.bg3,border:"1px solid "+O.border,borderRadius:8,fontFamily:O.sans,fontWeight:600,fontSize:13,color:O.textD,cursor:"pointer",marginBottom:12,width:"100%"}}>
            🔒 {settingsShowPwChange?"Cancel Password Change":"Change Password"}
          </button>

          {settingsShowPwChange&&(
            <div style={{background:O.bg3,borderRadius:10,padding:"14px",marginBottom:14}}>
              {[{l:"New Password",v:settingsPw1,fn:setSettingsPw1},{l:"Confirm Password",v:settingsPw2,fn:setSettingsPw2}].map(f=>(
                <div key={f.l} style={{marginBottom:10}}>
                  <label style={label}>{f.l}</label>
                  <input
                    value={f.v}
                    onChange={e=>{f.fn(e.target.value);setSettingsPwMsg("");}}
                    onKeyDown={e=>e.key==="Enter"&&changePassword()}
                    type="password"
                    placeholder="Min 8 characters"
                    style={input}
                    onFocus={e=>e.target.style.borderColor=O.amber}
                    onBlur={e=>e.target.style.borderColor=O.border}
                  />
                </div>
              ))}
              {settingsPwMsg&&(
                <div style={{fontFamily:O.sans,fontSize:12,color:settingsPwMsg.startsWith("✓")?O.green:O.red,marginBottom:10,padding:"6px 10px",background:settingsPwMsg.startsWith("✓")?O.greenD:O.redD,borderRadius:6}}>
                  {settingsPwMsg}
                </div>
              )}
              <button
                onClick={changePassword}
                style={{width:"100%",padding:"10px",background:settingsPwBusy?"rgba(224,123,0,0.4)":"linear-gradient(135deg,#e07b00,#c96800)",border:"none",borderRadius:8,fontFamily:O.sans,fontWeight:700,fontSize:13,color:"#fff",cursor:settingsPwBusy?"not-allowed":"pointer"}}>
                {settingsPwBusy?"Updating…":"Update Password  to "}
              </button>
            </div>
          )}

          {/* Danger zone */}
          <div style={{borderTop:"1px solid "+O.border,paddingTop:16,marginTop:4}}>
            <div style={{fontFamily:O.mono,fontSize:8,color:O.red,letterSpacing:"1.5px",marginBottom:10,textTransform:"uppercase"}}>Danger Zone</div>
            <button
              onClick={async()=>{
                try{const sb=await getSB();await sb.auth.signOut();}catch(e){}
                onLogout();
              }}
              style={{width:"100%",padding:"10px",background:O.redD,border:"1px solid rgba(217,64,64,0.2)",borderRadius:8,fontFamily:O.sans,fontWeight:600,fontSize:13,color:O.red,cursor:"pointer"}}>
              Sign Out
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════
//  MODAL COMPONENTS (outside OwnerCmd to prevent remount)
// ══════════════════════════════════════════════════

function AddLocationModal({
  activeOrg, ownerOrg, ownerProfile, activeLocation,
  addLocForm, setAddLocForm, addLocBusy, setAddLocBusy,
  addLocErr, setAddLocErr, setAddLocOpen, setLiveLocations,
  selectLocation, setTab, toast, mapEmp
}) {
  const mobile = useIsMobile();
  return (
    <div
      style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.5)",zIndex:600,display:"flex",alignItems:mobile?"flex-end":"center",justifyContent:"center",padding:mobile?0:20,backdropFilter:"blur(6px)"}}
      onClick={e=>{if(e.target===e.currentTarget){setAddLocOpen(false);setAddLocErr("");}}}>
      <div style={{background:"#fff",borderRadius:mobile?"20px 20px 0 0":"16px",padding:"28px",width:"100%",maxWidth:mobile?"100%":440,boxShadow:"0 20px 60px rgba(0,0,0,0.2)",animation:"fadeUp 0.3s ease"}}>
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:20}}>
          <div>
            <div style={{fontFamily:O.mono,fontSize:8,color:O.cyan,letterSpacing:"2px",marginBottom:4,textTransform:"uppercase"}}>Add Location</div>
            <div style={{fontFamily:O.sans,fontWeight:700,fontSize:18,color:O.text}}>New Physical Location</div>
          </div>
          <button onClick={()=>{setAddLocOpen(false);setAddLocErr("");}} style={{background:"none",border:"none",fontSize:22,cursor:"pointer",color:O.textF}}>×</button>
        </div>
        <div style={{background:"rgba(8,145,178,0.06)",border:"1px solid rgba(8,145,178,0.15)",borderRadius:8,padding:"10px 14px",marginBottom:18,display:"flex",alignItems:"center",gap:10}}>
          <span style={{fontSize:16}}>🏢</span>
          <div style={{fontFamily:O.sans,fontSize:12,color:O.textD,lineHeight:1.5}}>
            Adding location to <strong style={{color:O.text}}>{activeOrg?.name||ownerOrg?.name||"your company"}</strong>. Each location has its own team, schedule, and payroll.
          </div>
        </div>
        {[
          {l:"Location Name *",k:"name",ph:"Main Bar, Patio, Warehouse..."},
          {l:"Street Address",k:"address",ph:"123 Main St, Newport, OR 97365"}
        ].map(f=>(
          <div key={f.k} style={{marginBottom:12}}>
            <div style={{fontFamily:O.mono,fontSize:8,color:O.textF,letterSpacing:"1.5px",marginBottom:5,textTransform:"uppercase"}}>{f.l}</div>
            <input
              value={addLocForm[f.k]}
              onChange={e=>setAddLocForm(p=>({...p,[f.k]:e.target.value}))}
              placeholder={f.ph}
              style={{width:"100%",padding:"10px 12px",background:O.bg3,border:"1px solid "+O.border,borderRadius:7,fontFamily:O.sans,fontSize:13,color:O.text,outline:"none",boxSizing:"border-box"}}
              onFocus={e=>e.target.style.borderColor=O.cyan}
              onBlur={e=>e.target.style.borderColor=O.border}
            />
          </div>
        ))}
        <div style={{marginBottom:18}}>
          <div style={{fontFamily:O.mono,fontSize:8,color:O.textF,letterSpacing:"1.5px",marginBottom:5,textTransform:"uppercase"}}>Timezone</div>
          <select
            value={addLocForm.timezone}
            onChange={e=>setAddLocForm(p=>({...p,timezone:e.target.value}))}
            style={{width:"100%",padding:"10px 12px",background:O.bg3,border:"1px solid "+O.border,borderRadius:7,fontFamily:O.sans,fontSize:12,color:O.text,outline:"none",cursor:"pointer",boxSizing:"border-box"}}>
            {[
              ["America/Los_Angeles","Pacific Time (PT)"],
              ["America/Denver","Mountain Time (MT)"],
              ["America/Chicago","Central Time (CT)"],
              ["America/New_York","Eastern Time (ET)"],
              ["America/Anchorage","Alaska (AKT)"],
              ["Pacific/Honolulu","Hawaii (HST)"]
            ].map(([val,label])=>(
              <option key={val} value={val}>{label}</option>
            ))}
          </select>
        </div>
        {addLocErr&&(
          <div style={{fontFamily:O.sans,fontSize:12,color:O.red,marginBottom:12,padding:"7px 10px",background:O.redD,border:"1px solid rgba(217,64,64,0.2)",borderRadius:6}}>{addLocErr}</div>
        )}
        <button
          onClick={async()=>{
            if(!addLocForm.name){setAddLocErr("Location name is required.");return;}
            setAddLocBusy(true);setAddLocErr("");
            try{
              const sb=await getSB();
              const {data:{session}}=await sb.auth.getSession();
              let orgId=activeOrg?.id||ownerProfile?.org_id;
              if(!orgId){
                const {data:oo}=await sb.from("owner_organizations").select("org_id").eq("owner_id",session?.user?.id).single();
                orgId=oo?.org_id;
              }
              if(!orgId) throw new Error("No company selected. Please refresh and try again.");
              const res=await fetch("/api/location",{
                method:"POST",
                headers:{"Content-Type":"application/json",...(session?.access_token?{"Authorization":"Bearer "+session.access_token}:{})},
                body:JSON.stringify({orgId,name:addLocForm.name,address:addLocForm.address||"",timezone:addLocForm.timezone})
              });
              const result=await res.json();
              if(!res.ok) throw new Error(result.error||"Failed to create location");
              const newLoc=result.location;
              setLiveLocations(prev=>{
                const updated=[...prev,newLoc];
                // Save full list to localStorage immediately
                try{
                  localStorage.setItem("shiftpro_all_locs", JSON.stringify(updated));
                  const orgId2=newLoc.org_id||activeOrg?.id;
                  if(orgId2) localStorage.setItem("shiftpro_cached_locs_"+orgId2, JSON.stringify(updated));
                }catch(e){}
                return updated;
              });
              selectLocation(newLoc);
              setAddLocOpen(false);
              setAddLocForm({name:"",address:"",timezone:"America/Los_Angeles"});
              toast("✓ Location created: "+newLoc.name,"success");
              setTab("staff");
            }catch(err){
              setAddLocErr(err.message||"Failed to create location.");
              toast(err.message||"Failed to create location","error");
            }finally{setAddLocBusy(false);}
          }}
          style={{width:"100%",padding:"13px",background:addLocBusy?"rgba(8,145,178,0.4)":"linear-gradient(135deg,#0891b2,#0e7490)",border:"none",borderRadius:9,fontFamily:O.sans,fontWeight:700,fontSize:14,color:"#fff",cursor:addLocBusy?"not-allowed":"pointer",boxShadow:"0 4px 16px rgba(8,145,178,0.25)"}}>
          {addLocBusy?"Creating...":"Create Location and Switch"}
        </button>
      </div>
    </div>
  );
}

function InviteModal({
  ownerProfile, activeOrg, activeLocation,
  inviteForm, setInviteForm, inviteBusy, setInviteBusy,
  inviteDone, setInviteDone, inviteErr, setInviteErr,
  setShowInvite, setLiveEmps, mapEmp, toast
}) {
  const mobile = useIsMobile();
  return (
    <div
      style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.5)",zIndex:500,display:"flex",alignItems:mobile?"flex-end":"center",justifyContent:"center",padding:mobile?0:20,backdropFilter:"blur(6px)"}}
      onClick={e=>{if(e.target===e.currentTarget){setShowInvite(false);setInviteDone("");setInviteErr("");}}}>
      <div style={{background:"#fff",borderRadius:mobile?"20px 20px 0 0":"16px",padding:"28px",width:"100%",maxWidth:mobile?"100%":460,boxShadow:"0 20px 60px rgba(0,0,0,0.15)",animation:"fadeUp 0.3s ease"}}>
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:20}}>
          <div>
            <div style={{fontFamily:O.mono,fontSize:8,color:O.purple,letterSpacing:"2px",marginBottom:4,textTransform:"uppercase"}}>Invite Employee</div>
            <div style={{fontFamily:O.sans,fontWeight:700,fontSize:18,color:O.text}}>Add to your team</div>
          </div>
          <button onClick={()=>{setShowInvite(false);setInviteDone("");setInviteErr("");}} style={{background:"none",border:"none",fontSize:22,cursor:"pointer",color:O.textF}}>×</button>
        </div>
        {inviteDone?(
          <div style={{textAlign:"center",padding:"20px 0"}}>
            <div style={{fontSize:44,marginBottom:12}}>✅</div>
            <div style={{fontFamily:O.sans,fontWeight:700,fontSize:16,color:O.green,marginBottom:6}}>Invite Sent!</div>
            <div style={{fontFamily:O.sans,fontSize:13,color:O.textD,marginBottom:16}}>{inviteDone}</div>
            <button
              onClick={()=>{setInviteDone("");setInviteForm({firstName:"",lastName:"",email:"",role:"",dept:"Front End",rate:"15"});}}
              style={{padding:"9px 20px",background:O.amberD,border:"1px solid "+O.amberB,borderRadius:7,fontFamily:O.sans,fontSize:13,fontWeight:600,color:O.amber,cursor:"pointer"}}>
              Invite Another
            </button>
          </div>
        ):(
          <div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:12}}>
              {[{l:"First Name",k:"firstName",ph:"Jordan"},{l:"Last Name",k:"lastName",ph:"Mills"}].map(f=>(
                <div key={f.k}>
                  <div style={{fontFamily:O.mono,fontSize:8,color:O.textF,letterSpacing:"1.5px",marginBottom:5,textTransform:"uppercase"}}>{f.l}</div>
                  <input
                    value={inviteForm[f.k]}
                    onChange={e=>setInviteForm(p=>({...p,[f.k]:e.target.value}))}
                    placeholder={f.ph}
                    style={{width:"100%",padding:"9px 12px",background:O.bg3,border:"1px solid "+O.border,borderRadius:7,fontFamily:O.sans,fontSize:13,color:O.text,outline:"none",boxSizing:"border-box"}}
                  />
                </div>
              ))}
            </div>
            <div style={{marginBottom:10}}>
              <div style={{fontFamily:O.mono,fontSize:8,color:O.textF,letterSpacing:"1.5px",marginBottom:5,textTransform:"uppercase"}}>Email Address</div>
              <input
                value={inviteForm.email}
                onChange={e=>setInviteForm(p=>({...p,email:e.target.value}))}
                type="email"
                placeholder="jordan@email.com"
                style={{width:"100%",padding:"9px 12px",background:O.bg3,border:"1px solid "+O.border,borderRadius:7,fontFamily:O.sans,fontSize:13,color:O.text,outline:"none",boxSizing:"border-box"}}
              />
            </div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:10}}>
              <div>
                <div style={{fontFamily:O.mono,fontSize:8,color:O.textF,letterSpacing:"1.5px",marginBottom:5,textTransform:"uppercase"}}>Role</div>
                <input
                  value={inviteForm.role}
                  onChange={e=>setInviteForm(p=>({...p,role:e.target.value}))}
                  placeholder="Lead Cashier"
                  style={{width:"100%",padding:"9px 12px",background:O.bg3,border:"1px solid "+O.border,borderRadius:7,fontFamily:O.sans,fontSize:13,color:O.text,outline:"none",boxSizing:"border-box"}}
                />
              </div>
              <div>
                <div style={{fontFamily:O.mono,fontSize:8,color:O.textF,letterSpacing:"1.5px",marginBottom:5,textTransform:"uppercase"}}>Rate ($/hr)</div>
                <input
                  value={inviteForm.rate}
                  onChange={e=>setInviteForm(p=>({...p,rate:e.target.value}))}
                  type="number"
                  placeholder="15.00"
                  style={{width:"100%",padding:"9px 12px",background:O.bg3,border:"1px solid "+O.border,borderRadius:7,fontFamily:O.sans,fontSize:13,color:O.text,outline:"none",boxSizing:"border-box"}}
                />
              </div>
            </div>
            <div style={{marginBottom:16}}>
              <div style={{fontFamily:O.mono,fontSize:8,color:O.textF,letterSpacing:"1.5px",marginBottom:5,textTransform:"uppercase"}}>Department</div>
              <select
                value={inviteForm.dept}
                onChange={e=>setInviteForm(p=>({...p,dept:e.target.value}))}
                style={{width:"100%",padding:"9px 12px",background:O.bg3,border:"1px solid "+O.border,borderRadius:7,fontFamily:O.sans,fontSize:12,color:O.text,outline:"none",cursor:"pointer",boxSizing:"border-box"}}>
                {["Front End","Sales Floor","Inventory","Operations","Security","Management","Kitchen","Bar","Service"].map(d=>(
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
            </div>
            {inviteErr&&(
              <div style={{marginBottom:12}}>
                <div style={{fontFamily:O.sans,fontSize:12,color:O.red,padding:"7px 10px",background:O.redD,border:"1px solid rgba(217,64,64,0.2)",borderRadius:6,marginBottom:inviteErr.includes("already")?"6px":"0"}}>
                  {inviteErr}
                </div>
                {inviteErr.includes("already")&&(
                  <button onClick={async()=>{
                    setInviteErr("");
                    setInviteBusy(true);
                    try{
                      const sb2=await getSB();
                      const {data:{session:ss}}=await sb2.auth.getSession();
                      const res=await fetch("/api/invite",{
                        method:"POST",
                        headers:{"Content-Type":"application/json","X-Resend-Invite":"true",...(ss?.access_token?{"Authorization":"Bearer "+ss.access_token}:{})},
                        body:JSON.stringify({
                          email:inviteForm.email,
                          firstName:inviteForm.firstName,
                          lastName:inviteForm.lastName,
                          orgId:activeOrg?.id||null,
                          locationId:null,
                          role:inviteForm.role||"Employee",
                          department:inviteForm.dept,
                          hourlyRate:inviteForm.rate,
                          forceResend:true,
                        })
                      });
                      const result=await res.json();
                      if(!res.ok && !result.resenOk) throw new Error(result.error||"Resend failed");
                      setInviteDone("Re-invite sent to "+inviteForm.email+" ✓");
                      toast("Re-invite sent ✓","success");
                    }catch(e){ setInviteErr(e.message||"Resend failed"); }
                    finally{ setInviteBusy(false); }
                  }} style={{width:"100%",padding:"8px",background:"rgba(99,102,241,0.08)",border:"1px solid rgba(99,102,241,0.2)",borderRadius:6,fontFamily:O.sans,fontWeight:600,fontSize:12,color:"#6366f1",cursor:"pointer",textAlign:"center"}}>
                    📧 Resend invite to this email instead  to 
                  </button>
                )}
              </div>
            )}
            <button
              onClick={async()=>{
                if(!inviteForm.firstName||!inviteForm.lastName||!inviteForm.email){setInviteErr("Please fill in name and email.");return;}
                setInviteBusy(true);setInviteErr("");
                try{
                  const sb2=await getSB();
                  const {data:{session:ss}}=await sb2.auth.getSession();
                  const res=await fetch("/api/invite",{
                    method:"POST",
                    headers:{"Content-Type":"application/json",...(ss?.access_token?{"Authorization":"Bearer "+ss.access_token}:{})},
                    body:JSON.stringify({
                      email:inviteForm.email,firstName:inviteForm.firstName,lastName:inviteForm.lastName,
                      orgId:activeOrg?.id||ownerProfile?.org_id||localStorage.getItem('shiftpro_active_orgid')||null,locationId:activeLocation?.id||ownerProfile?.location_id||null,
                      role:inviteForm.role||"Employee",department:inviteForm.dept,hourlyRate:inviteForm.rate
                    })
                  });
                  const result=await res.json();
                  if(!res.ok) throw new Error(result.error||"Invite failed");
                  const sb=await getSB();
                  const orgId=activeOrg?.id||ownerProfile?.org_id||localStorage.getItem('shiftpro_active_orgid');
                  // Auto-heal: ensure user record exists in users table
                  try{
                    await fetch("/api/invite?healEmail="+encodeURIComponent(inviteForm.email)+"&orgId="+orgId,{
                      headers:ss?.access_token?{"Authorization":"Bearer "+ss.access_token}:{}
                    });
                  }catch(e){}
                  // Reload staff list
                  if(orgId){const {data:emps}=await sb2.from("users").select("*").eq("org_id",orgId).in("status",["active","invited"]).in("app_role",["employee","supervisor"]).order("first_name");if(emps) setLiveEmps(emps.map(mapEmp));}
                  setInviteDone("Invite sent to "+inviteForm.email+"!");
                  toast("Invite sent to "+inviteForm.email+" ✓","success");
                }catch(err){
                  setInviteErr(err.message||"Failed. Try again.");
                  toast(err.message||"Invite failed","error");
                }finally{setInviteBusy(false);}
              }}
              style={{width:"100%",padding:"13px",background:inviteBusy?"rgba(124,58,237,0.4)":"linear-gradient(135deg,#7c3aed,#6d28d9)",border:"none",borderRadius:9,fontFamily:O.sans,fontWeight:700,fontSize:14,color:"#fff",cursor:inviteBusy?"not-allowed":"pointer",boxShadow:"0 4px 16px rgba(124,58,237,0.25)"}}>
              {inviteBusy?"Sending...":"Send Invite  to "}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function BroadcastModal({
  ownerProfile, liveEmps,
  broadcastForm, setBroadcastForm,
  broadcastBusy, setBroadcastBusy,
  broadcastDone, setBroadcastDone,
  setBroadcastOpen, toast
}) {
  const mobile = useIsMobile();
  return (
    <div
      style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.5)",zIndex:500,display:"flex",alignItems:mobile?"flex-end":"center",justifyContent:"center",padding:mobile?0:20,backdropFilter:"blur(6px)"}}
      onClick={e=>{if(e.target===e.currentTarget){setBroadcastOpen(false);setBroadcastDone("");}}}>
      <div style={{background:"#fff",borderRadius:mobile?"20px 20px 0 0":"16px",padding:"28px",width:"100%",maxWidth:mobile?"100%":480,boxShadow:"0 20px 60px rgba(0,0,0,0.15)",animation:"fadeUp 0.3s ease"}}>
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:20}}>
          <div>
            <div style={{fontFamily:O.mono,fontSize:8,color:O.red,letterSpacing:"2px",marginBottom:4,textTransform:"uppercase"}}>Broadcast</div>
            <div style={{fontFamily:O.sans,fontWeight:700,fontSize:18,color:O.text}}>Message All Employees</div>
          </div>
          <button onClick={()=>{setBroadcastOpen(false);setBroadcastDone("");}} style={{background:"none",border:"none",fontSize:22,cursor:"pointer",color:O.textF}}>×</button>
        </div>
        {broadcastDone?(
          <div style={{textAlign:"center",padding:"20px 0"}}>
            <div style={{fontSize:44,marginBottom:12}}>📣</div>
            <div style={{fontFamily:O.sans,fontWeight:700,fontSize:16,color:O.green,marginBottom:6}}>{broadcastDone}</div>
            <button
              onClick={()=>{setBroadcastOpen(false);setBroadcastDone("");setBroadcastForm({subject:"",body:""}); }}
              style={{padding:"9px 20px",background:O.greenD,border:"1px solid rgba(26,158,110,0.2)",borderRadius:7,fontFamily:O.sans,fontSize:13,fontWeight:600,color:O.green,cursor:"pointer"}}>
              Close
            </button>
          </div>
        ):(
          <div>
            <div style={{marginBottom:12}}>
              <div style={{fontFamily:O.mono,fontSize:8,color:O.textF,letterSpacing:"1.5px",marginBottom:5,textTransform:"uppercase"}}>Subject</div>
              <input
                value={broadcastForm.subject}
                onChange={e=>setBroadcastForm(p=>({...p,subject:e.target.value}))}
                placeholder="Schedule update, policy change..."
                style={{width:"100%",padding:"9px 12px",background:O.bg3,border:"1px solid "+O.border,borderRadius:7,fontFamily:O.sans,fontSize:13,color:O.text,outline:"none",boxSizing:"border-box"}}
              />
            </div>
            <div style={{marginBottom:16}}>
              <div style={{fontFamily:O.mono,fontSize:8,color:O.textF,letterSpacing:"1.5px",marginBottom:5,textTransform:"uppercase"}}>Message</div>
              <textarea
                value={broadcastForm.body}
                onChange={e=>setBroadcastForm(p=>({...p,body:e.target.value}))}
                placeholder="Type your message..."
                rows={4}
                style={{width:"100%",padding:"9px 12px",background:O.bg3,border:"1px solid "+O.border,borderRadius:7,fontFamily:O.sans,fontSize:13,color:O.text,outline:"none",resize:"vertical",boxSizing:"border-box"}}
              />
            </div>
            <div style={{fontFamily:O.sans,fontSize:12,color:O.textD,marginBottom:14}}>
              Will send to <strong>{(liveEmps||[]).filter(e=>e.status==="active").length} active employees</strong>
            </div>
            <button
              onClick={async()=>{
                if(!broadcastForm.subject||!broadcastForm.body) return;
                setBroadcastBusy(true);
                try{
                  const sb=await getSB();
                  const {data:{session}}=await sb.auth.getSession();
                  const orgId=activeOrg?.id||ownerProfile?.org_id||null;
                  const fromName=((ownerProfile?.first_name||"")+" "+(ownerProfile?.last_name||"")).trim()||"Manager";
                  await fetch("/api/messages",{
                    method:"POST",
                    headers:{"Content-Type":"application/json",...(session?.access_token?{"Authorization":"Bearer "+session.access_token}:{})},
                    body:JSON.stringify({orgId,fromId:session?.user?.id,fromName,toId:"all",text:broadcastForm.body,type:"broadcast"}),
                  });
                  const count=(liveEmps||[]).filter(e=>e.status==="active").length;
                  setBroadcastDone("📢 Sent to "+count+" employee"+(count!==1?"s":"")+" ✓");
                  setBroadcastForm({subject:"",body:""});
                  toast("Broadcast sent to "+count+" employees ✓","success");
                }catch(e){
                  setBroadcastDone("Failed: "+e.message);
                }finally{setBroadcastBusy(false);}
              }}
              style={{width:"100%",padding:"13px",background:broadcastBusy?"rgba(217,64,64,0.4)":"linear-gradient(135deg,#d94040,#b91c1c)",border:"none",borderRadius:9,fontFamily:O.sans,fontWeight:700,fontSize:14,color:"#fff",cursor:broadcastBusy?"not-allowed":"pointer",boxShadow:"0 4px 16px rgba(217,64,64,0.25)"}}>
              {broadcastBusy?"Sending…":"📣 Send to All Employees"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════
//  OWNER COMMAND — WARM THEME v2
// ══════════════════════════════════════════════════
function OwnerCmd({onLogout, ownerInitialProfile}){
  const { toasts, toast, removeToast } = useToast();
  const mobile = useIsMobile();

  const [showConfetti, setShowConfetti] = React.useState(false);
  const [availability, setAvailability] = React.useState({});
  const [lateAlerts, setLateAlerts] = React.useState([]);

  // ── Core state ──
  const [tab,setTab] = useState(()=>{
    try{ return localStorage.getItem("shiftpro_active_tab")||"command"; }catch(e){ return "command"; }
  });
  const [now,setNow] = useState(new Date());
  const [ownerProfile,setOwnerProfile] = useState(null);
  const [ownerOrg,setOwnerOrg] = useState(null);
  const [ownerOrgs,setOwnerOrgs] = useState([]);
  const [activeOrg,setActiveOrg] = useState(null);
  const [liveEmps,setLiveEmps] = useState(null);
  const [liveLocations,setLiveLocations] = useState([]);
  const [activeLocation,setActiveLocation] = useState(null);
  const [liveShifts,setLiveShifts] = useState(null);
  const [livePayroll,setLivePayroll] = useState(null);

  // ── Location gate state ──
  const [locationGate,setLocationGate] = useState(null); // null=loading, "none"=no locs, "pick"=pick, "ready"=ready

  // ── Modal state ──
  const [addLocOpen,setAddLocOpen] = useState(false);
  const [addLocBusy,setAddLocBusy] = useState(false);
  const [addLocErr,setAddLocErr] = useState("");
  const [addLocForm,setAddLocForm] = useState({name:"",address:"",timezone:"America/Los_Angeles"});
  const [addOrgOpen,setAddOrgOpen] = useState(false);
  const [confirmDeleteOrgId,setConfirmDeleteOrgId] = useState(null);
  const [addOrgBusy,setAddOrgBusy] = useState(false);
  const [addOrgErr,setAddOrgErr] = useState("");
  const [addOrgForm,setAddOrgForm] = useState({name:"",type:"Restaurant",address:"",empCount:"1-5"});
  const [showInvite,setShowInvite] = useState(false);
  const [inviteForm,setInviteForm] = useState({firstName:"",lastName:"",email:"",role:"",dept:"Front End",rate:"15"});
  const [inviteBusy,setInviteBusy] = useState(false);
  const [inviteDone,setInviteDone] = useState("");
  const [inviteErr,setInviteErr] = useState("");
  const [broadcastOpen,setBroadcastOpen] = useState(false);
  const [broadcastForm,setBroadcastForm] = useState({subject:"",body:""});
  const [broadcastBusy,setBroadcastBusy] = useState(false);
  const [broadcastDone,setBroadcastDone] = useState("");

  // ── Schedule state ──
  const [selectedCell,setSelectedCell] = useState(null);
  const [schedPublished,setSchedPublished] = useState(false);
  const [currentWeekOffset,setCurrentWeekOffset] = useState(0);
  const [schedViewMode,setSchedViewMode] = useState("week"); // "week" or "month"
  const [dragShift,setDragShift] = useState(null); // {shift, sourceDay, sourceEmpId}

  // ── Staff state ──
  const [staffSearch,setStaffSearch] = useState("");

  // ── Payroll state ──
  const [payPeriod,setPayPeriod] = useState("current");

  // ── Settings state ──
  const [settingsProfile,setSettingsProfile] = useState(()=>{
    try{
      const cached = typeof window!=="undefined" && localStorage.getItem("shiftpro_org_profile");
      return cached ? JSON.parse(cached) : {name:"",type:"Restaurant",address:"",phone:""};
    }catch(e){ return {name:"",type:"Restaurant",address:"",phone:""}; }
  });
  const [settingsPay,setSettingsPay] = useState(()=>{
    try{
      const c = typeof window!=="undefined" && localStorage.getItem("shiftpro_pay_settings");
      return c ? JSON.parse(c) : {period:"Bi-weekly",otThreshold:"40",shiftLen:"8",weekStart:"Mon"};
    }catch(e){ return {period:"Bi-weekly",otThreshold:"40",shiftLen:"8",weekStart:"Mon"}; }
  });
  const [settingsDepts,setSettingsDepts] = useState(()=>{
    try{
      const cached = typeof window!=="undefined" && localStorage.getItem("shiftpro_departments");
      return cached ? JSON.parse(cached) : ["Front End","Sales Floor","Inventory","Operations","Kitchen","Bar"];
    }catch(e){ return ["Front End","Sales Floor","Inventory","Operations","Kitchen","Bar"]; }
  });
  const [settingsNewDept,setSettingsNewDept] = useState("");
  const [settingsAddingDept,setSettingsAddingDept] = useState(false);
  const [settingsSaveBusy,setSettingsSaveBusy] = useState(false);
  const [settingsShowPwChange,setSettingsShowPwChange] = useState(false);
  const [settingsPw1,setSettingsPw1] = useState("");
  const [settingsPw2,setSettingsPw2] = useState("");
  const [settingsPwMsg,setSettingsPwMsg] = useState("");
  const [settingsPwBusy,setSettingsPwBusy] = useState(false);

  // ── Org/loc switcher ──
  const [orgSwitcherOpen,setOrgSwitcherOpen] = useState(false);
  const [locSwitcherOpen,setLocSwitcherOpen] = useState(false);

  // ── Waitlist ──
  const [waitlistForm,setWaitlistForm] = useState({name:"",email:"",biz:""});
  const [waitlistDone,setWaitlistDone] = useState(false);

  // ── Onboarding checklist ──
  const [setupDismissed,setSetupDismissed] = useState(()=>{
    try{ return typeof window!=="undefined" && localStorage.getItem("shiftpro_setup_done")==="true"; }catch(e){ return false; }
  });

  // ── Intelligence tab ──
  const [intelPrompt,setIntelPrompt] = useState("");
  const [intelOutput,setIntelOutput] = useState("");
  const [intelBusy,setIntelBusy] = useState(false);

  // ── Notifications ──
  const [notifOpen,setNotifOpen] = useState(false);
  const [notifications,setNotifications] = useState([]);
  const [notifLoaded,setNotifLoaded] = useState(false);
  // ── Poll every 60 seconds for new staff messages and requests ──
  useEffect(()=>{
    if(!ownerProfile?.orgId) return;
    const interval = setInterval(()=>{
      loadNotifications(ownerProfile.orgId, true);
    }, 60000);
    return () => clearInterval(interval);
  }, [ownerProfile?.orgId]);

  const reloadNotifications = async() => {
    setNotifLoaded(false);
    const orgId = ownerProfile?.org_id || activeOrg?.id;
    if(orgId) await loadNotifications(orgId);
  };

  // ── Employee drawer ──
  const [activeDrawerEmp,setActiveDrawerEmp] = useState(null);

  // ── Staff sub-tab ──
  const [staffSubTab,setStaffSubTab] = useState("team");
  const [swapRequests,setSwapRequests] = useState([]);
  const [timeOffRequests,setTimeOffRequests] = useState([]);
  const [requestsLoaded,setRequestsLoaded] = useState(false);
  const [staffMessages,setStaffMessages] = useState([]);
  const [staffMsgsLoaded,setStaffMsgsLoaded] = useState(false);

  useEffect(()=>{ const t=setInterval(()=>setNow(new Date()),10000); return()=>clearInterval(t); },[]);

  // Safety fallback: if data still null after 8s, resolve to empty (prevents infinite skeletons)
  useEffect(()=>{
    const t = setTimeout(()=>{
      setLiveShifts(s=>s===null?[]:s);
      setLivePayroll(p=>p===null?[]:p);
      setLiveEmps(e=>e===null?[]:e);
    }, 8000);
    return()=>clearTimeout(t);
  },[]);

  // Close dropdowns on outside click (must be AFTER all state declarations)
  useEffect(()=>{
    if(!orgSwitcherOpen && !locSwitcherOpen && !notifOpen) return;
    const handler = (ev) => {
      // Don't close if click was inside the notification dropdown
      const notifEl = document.querySelector('[data-notif-dropdown]');
      if(notifEl && notifEl.contains(ev.target)) return;
      setOrgSwitcherOpen(false); setLocSwitcherOpen(false); setNotifOpen(false);
    };
    const t = setTimeout(()=>document.addEventListener("click", handler), 0);
    return()=>{ clearTimeout(t); document.removeEventListener("click", handler); };
  },[orgSwitcherOpen, locSwitcherOpen, notifOpen]);

  // Load shifts when tab switches to schedule/command, OR when ownerProfile arrives
  useEffect(()=>{
    const orgId = ownerProfile?.org_id||activeOrg?.id;
    if((tab==="schedule"||tab==="command") && orgId){
      // Always refresh notifications when landing on command tab
      if(tab==="command") loadNotifications(orgId, true);
      loadShifts(orgId, getMonday(currentWeekOffset), activeLocation?.id||null);
    }
  },[tab, ownerProfile?.org_id, activeOrg?.id, currentWeekOffset, activeLocation?.id]);

  // Load payroll when tab switches to roi
  useEffect(()=>{
    if(tab==="roi" && livePayroll===null && ownerProfile?.org_id){
      const days = payPeriod==="month"?30:payPeriod==="last"?28:14;
      loadPayroll(ownerProfile.org_id, activeLocation?.id||null, days);
    }
  },[tab, ownerProfile?.org_id]);

  // Reload payroll when pay period changes
  useEffect(()=>{
    if(tab==="roi" && ownerProfile?.org_id){
      setLivePayroll(null);
      const days = payPeriod==="month"?30:payPeriod==="last"?28:14;
      loadPayroll(ownerProfile.org_id, activeLocation?.id||null, days);
    }
  },[payPeriod]);

  // ── Helper: get Monday of offset week ──
  const getMonday = (offset=0) => {
    const now=new Date();
    const day=now.getDay(); // 0=Sun,1=Mon,...6=Sat
    const diff=day===0?-6:1-day; // days to subtract to get to Monday
    const mon=new Date(now);
    mon.setDate(now.getDate()+diff+(offset*7));
    // Use local date parts to avoid UTC midnight timezone shift
    const y=mon.getFullYear();
    const m=String(mon.getMonth()+1).padStart(2,"0");
    const d=String(mon.getDate()).padStart(2,"0");
    return `${y}-${m}-${d}`;
  };

  const mapEmp = e => ({
    id:e.id, name:e.first_name+" "+e.last_name, first:e.first_name,
    role:e.role||"Employee", dept:e.department||"",
    rate:parseFloat(e.hourly_rate)||15,
    avatar:(e.first_name&&e.last_name?(e.first_name[0]+e.last_name[0]).toUpperCase():e.first_name?e.first_name.slice(0,2).toUpperCase():(e.email||"").split("@")[0].slice(0,2).toUpperCase()||"??"),
    color:e.avatar_color||"#6366f1", email:e.email||"",
    status:e.status==="active"?"active":"invited", hired:e.hire_date||"",
    wkHrs:0, moHrs:0, ot:0, cam:100, prod:100, rel:100, flags:0, streak:0, shifts:0,
    risk:"Low", ghost:0, orgId:e.org_id, locId:e.location_id, appRole:e.app_role, pin:e.pin||"",
  });

  // ── Initial load ──
  useEffect(()=>{
    // ── STEP 1: Restore from cache BEFORE any async work ──
    // Rule: if we have ANY saved location, set ready immediately.
    // Nothing in the async load is allowed to reset a gate already set to "ready".
    try{
      const cachedProfile = localStorage.getItem("shiftpro_org_profile");
      if(cachedProfile) setSettingsProfile(p=>({...p,...JSON.parse(cachedProfile)}));
    }catch(e){}

    try{
      // Restore active location — this is the #1 priority
      const savedLocRaw = localStorage.getItem("shiftpro_active_loc_obj");
      if(savedLocRaw){
        const savedLoc = JSON.parse(savedLocRaw);
        setActiveLocation(savedLoc);
        setLiveLocations(locs=>{
          // Add saved loc to list if not already present
          const already = Array.isArray(locs) && locs.find(l=>l.id===savedLoc.id);
          return already ? locs : [savedLoc, ...locs.filter(l=>l.id!==savedLoc.id)];
        });
        setLocationGate("ready"); // <- SET IMMEDIATELY, async load will NOT override this
      }
    }catch(e){}

    try{
      // Pre-seed employees and ALL locations from cache
      const orgId2 = ownerInitialProfile?.orgId || localStorage.getItem("shiftpro_active_orgid");
      if(orgId2){
        const cachedEmps = localStorage.getItem("shiftpro_cached_emps_"+orgId2);
        if(cachedEmps) try{ setLiveEmps(JSON.parse(cachedEmps)); }catch(e){}
        // Load full location list so picker shows all options
        const cachedLocs2 = localStorage.getItem("shiftpro_cached_locs_"+orgId2)
          || localStorage.getItem("shiftpro_all_locs");
        if(cachedLocs2){
          try{
            const allLocs = JSON.parse(cachedLocs2);
            setLiveLocations(allLocs);
            // If we know the active loc, set gate to ready immediately
            const savedLocId2 = localStorage.getItem("shiftpro_active_loc");
            const activeLoc2 = savedLocId2 ? allLocs.find(l=>l.id===savedLocId2) : allLocs[0];
            if(activeLoc2) setActiveLocation(activeLoc2);
          }catch(e){}
        }
      } else {
        // No orgId yet — still try fallback location list
        const cachedLocs3 = localStorage.getItem("shiftpro_all_locs");
        if(cachedLocs3) try{ setLiveLocations(JSON.parse(cachedLocs3)); }catch(e){}
      }
    }catch(e){}

    const load = async () => {
      try{
        const sb = await getSB();
        const {data:{session}} = await sb.auth.getSession();
        if(!session) return;

        const {data:profile} = await sb.from("users").select("*").eq("id",session.user.id).single();
        if(profile) setOwnerProfile(profile);

        let orgId = null; // Start null — owner_organizations is the source of truth

        // Try owner_organizations FIRST — this is always the correct org
        const {data:ooRows} = await sb.from("owner_organizations").select("*, organizations(id,name,industry,address,phone,departments)").eq("owner_id",session.user.id).order("created_at");
        let orgs = [];
        if(ooRows&&ooRows.length>0){
          orgs = ooRows.map(r=>r.organizations).filter(Boolean);
          setOwnerOrgs(orgs);
          // Prefer cached orgId if it matches one of our orgs (user already chose it)
          const cachedOrgId = localStorage.getItem("shiftpro_active_orgid");
          const matchesCached = cachedOrgId && orgs.find(o=>o.id===cachedOrgId);
          if(matchesCached){
            orgId = cachedOrgId; // Stick with what was working
          } else {
            // No valid cache — pick the LAST (most recently created) org, not first
            // This avoids picking old/test orgs that were created earlier
            orgId = orgs[orgs.length-1]?.id || orgs[0]?.id || null;
            if(orgId) try{ localStorage.setItem("shiftpro_active_orgid", orgId); }catch(e){}
          }
        } else if(profile?.org_id){
          const {data:org} = await sb.from("organizations").select("*").eq("id",profile.org_id).single();
          if(org){
            orgs=[org];
            setOwnerOrgs([org]);
            orgId = org.id;
            try{ localStorage.setItem("shiftpro_active_orgid", org.id); }catch(e){}
          }
        } else {
          // Last resort: use cached orgId
          orgId = localStorage.getItem("shiftpro_active_orgid")||null;
        }

        const defaultOrg = orgs.find(o=>o.id===orgId)||orgs[0]||null;
        if(defaultOrg){
          setActiveOrg(defaultOrg);
          setOwnerOrg(defaultOrg);
          const profileData = {
            name: localStorage.getItem("shiftpro_org_name_"+defaultOrg.id) || localStorage.getItem("shiftpro_org_name") || defaultOrg.name || "",
            type: defaultOrg.industry||"Restaurant",
            address: defaultOrg.address||"",
            phone: defaultOrg.phone||"",
          };
          // Merge: localStorage wins for name (never overwrite user's saved value)
          setSettingsProfile(p=>({
            ...p,
            name: profileData.name || p.name,
            type: p.type || profileData.type,
            address: p.address || profileData.address,
            phone: p.phone || profileData.phone,
          }));
          // Cache to localStorage so it survives page refreshes
          try{ localStorage.setItem("shiftpro_org_profile", JSON.stringify(profileData)); }catch(e){}

          // Load departments from Supabase if they exist there (cross-device sync)
          if(defaultOrg.departments && defaultOrg.departments.length > 0){
            setSettingsDepts(defaultOrg.departments);
            try{ localStorage.setItem("shiftpro_departments", JSON.stringify(defaultOrg.departments)); }catch(e){}
          }
        }

        if(orgId){
          // Save orgId so pre-seed can find caches on next load
          try{ localStorage.setItem("shiftpro_active_orgid", orgId); }catch(e){}
          loadNotifications(orgId);
          // Fetch locations via service-role API (bypasses RLS completely)
          let locs = null;
          try{
            const {data:{session:ss}} = await sb.auth.getSession();
            const locsRes = await fetch("/api/location?orgId="+orgId, {
              headers: ss?.access_token ? {"Authorization":"Bearer "+ss.access_token} : {}
            });
            if(locsRes.ok){ const d=await locsRes.json(); locs=d.locations||null; }
          }catch(e){}
          // Fallback: direct Supabase query (works if RLS is set up)
          if(!locs){
            const {data:locsData} = await sb.from("locations").select("*").eq("org_id",orgId).eq("active",true).order("created_at");
            locs = locsData;
          }
          let emps = null;
          try {
            const {data:{session:ss2}} = await sb.auth.getSession();
            const staffRes = await fetch("/api/staff?orgId="+orgId, {
              headers: ss2?.access_token ? {"Authorization":"Bearer "+ss2.access_token} : {}
            });
            if(staffRes.ok){ const d=await staffRes.json(); emps=d.employees||[]; }
          } catch(e){}
          if(!emps){
            const {data:fallback} = await sb.from("users").select("*").eq("org_id",orgId).in("status",["active","invited"]).in("app_role",["employee","supervisor"]).order("first_name");
            emps = fallback||[];
          }

          const mappedEmps = emps&&emps.length>0 ? emps.map(mapEmp) : [];
          setLiveEmps(mappedEmps);
          // Cache employees for faster subsequent loads
          try{ localStorage.setItem("shiftpro_cached_emps_"+orgId, JSON.stringify(mappedEmps)); }catch(e){}

          // ── Load shifts directly here — guaranteed, no useEffect race condition ──
          try{
            const weekStr = (()=>{
              const now=new Date(); const day=now.getDay();
              const diff=day===0?-6:1-day;
              const mon=new Date(now); mon.setDate(now.getDate()+diff);
              return mon.getFullYear()+"-"+String(mon.getMonth()+1).padStart(2,"0")+"-"+String(mon.getDate()).padStart(2,"0");
            })();
            const {data:{session:sss}}=await sb.auth.getSession();
            const sRes=await fetch("/api/shifts?orgId="+orgId+"&weekStart="+weekStr+"&_t="+Date.now(),{
              headers:sss?.access_token?{"Authorization":"Bearer "+sss.access_token}:{},
              cache:"no-store",
            });
            if(sRes.ok){
              const sData=await sRes.json();
              if(sData.shifts&&sData.shifts.length>0) setLiveShifts(sData.shifts);
            }
          }catch(e){}


          // Supabase returned locations — update the list but NEVER downgrade a ready gate
          const savedLocId = localStorage.getItem("shiftpro_active_loc");
          let savedLocObj = null;
          try{ savedLocObj = JSON.parse(localStorage.getItem("shiftpro_active_loc_obj")||"null"); }catch(e){}

          if(locs&&locs.length>0){
            // MERGE with cached locations — never let a partial Supabase response
            // overwrite a more complete locally-cached list
            let mergedLocs = locs;
            try{
              const existingRaw = localStorage.getItem("shiftpro_cached_locs_"+orgId)
                               || localStorage.getItem("shiftpro_all_locs");
              if(existingRaw){
                const cached = JSON.parse(existingRaw);
                // Add any cached locs not in the Supabase response (might be RLS-hidden)
                const supabaseIds = new Set(locs.map(l=>l.id));
                const missing = cached.filter(l=>!supabaseIds.has(l.id));
                if(missing.length>0) mergedLocs = [...locs, ...missing];
              }
            }catch(e){}

            setLiveLocations(mergedLocs);
            // Save merged list to cache
            try{
              localStorage.setItem("shiftpro_cached_locs_"+orgId, JSON.stringify(mergedLocs));
              localStorage.setItem("shiftpro_all_locs", JSON.stringify(mergedLocs));
            }catch(e){}
            // Find the active location
            const activeLoc = savedLocId
              ? (mergedLocs.find(l=>l.id===savedLocId)||savedLocObj)
              : savedLocObj||mergedLocs[0]||null;
            if(activeLoc){
              setActiveLocation(activeLoc);
              setLocationGate("ready");
            } else {
              setLocationGate(g=>g==="ready"?"ready":"pick");
            }
          } else {
            // API/Supabase returned empty — restore ALL locations from localStorage cache
            let allCachedLocs = null;
            try{
              const raw = localStorage.getItem("shiftpro_cached_locs_"+orgId)
                       || localStorage.getItem("shiftpro_all_locs");
              if(raw) allCachedLocs = JSON.parse(raw);
            }catch(e){}

            if(allCachedLocs && allCachedLocs.length>0){
              // We have cached locations — restore all of them
              setLiveLocations(allCachedLocs);
              const activeLoc = savedLocId
                ? (allCachedLocs.find(l=>l.id===savedLocId)||savedLocObj)
                : savedLocObj||allCachedLocs[0];
              if(activeLoc){
                setActiveLocation(activeLoc);
                setLocationGate("ready");
              } else {
                setLocationGate("pick");
              }
            } else if(savedLocObj){
              // Fallback: just the active location
              setActiveLocation(savedLocObj);
              setLiveLocations([savedLocObj]);
              setLocationGate("ready");
            } else {
              setLocationGate(g=>g==="ready"?"ready":"none");
            }
          }
        } else {
          setLiveEmps([]);
          // orgId was null (owner_organizations query blocked) — 
          // check localStorage before showing "Set up first location"
          const cachedOrgId = localStorage.getItem("shiftpro_active_orgid");
          const cachedLocRaw = localStorage.getItem("shiftpro_active_loc_obj");
          if(cachedLocRaw){
            // We have a saved location — user has been here before, just restore it
            try{
              const cachedLoc = JSON.parse(cachedLocRaw);
              setActiveLocation(cachedLoc);
              setLiveLocations([cachedLoc]);
              setLocationGate("ready");
              // Try to load employees using cached orgId
              if(cachedOrgId){
                let empsRetry = null;
                try {
                  const {data:{session:ssr}} = await sb.auth.getSession();
                  const rRes = await fetch("/api/staff?orgId="+cachedOrgId, {
                    headers: ssr?.access_token ? {"Authorization":"Bearer "+ssr.access_token} : {}
                  });
                  if(rRes.ok){ const rd=await rRes.json(); empsRetry=rd.employees||[]; }
                } catch(e){}
                if(!empsRetry){
                  const {data:fb} = await sb.from("users").select("*").eq("org_id",cachedOrgId).in("status",["active","invited"]).in("app_role",["employee","supervisor"]).order("first_name");
                  empsRetry=fb||[];
                }
                if(empsRetry?.length>0) setLiveEmps(empsRetry.map(mapEmp));
              }
            }catch(e){ setLocationGate("none"); }
          } else {
            setLocationGate("none");
          }
        }
      }catch(e){
        // silent fail — errors handled by fallback state
        // Don't reset location gate on error — keep cached state
        setLiveEmps(prev=>prev===null?[]:prev);
      }
    };
    load();
    const fallback = setTimeout(()=>{
      // Only set to pick/none if still in loading state — never override ready or pick
      setLocationGate(g=>{
        if(g===null){
          // Still loading after 5s — check cache one more time
          try{
            const loc = JSON.parse(localStorage.getItem("shiftpro_active_loc_obj")||"null");
            if(loc) return "ready";
          }catch(e){}
          return "pick"; // show pick even if empty — user can add location
        }
        return g;
      });
      setLiveEmps(e=>e===null?[]:e);
    }, 5000);
    return()=>clearTimeout(fallback);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  },[]);

  // Load notifications
  const loadNotifications = async(orgId, force=false) => {
    if(!orgId || (notifLoaded && !force)) return;
    setNotifLoaded(true);
    const items = [];
    try{
      const sb = await getSB();
      const {data:{session:ss}} = await sb.auth.getSession();
      const headers = ss?.access_token ? {"Authorization":"Bearer "+ss.access_token} : {};

      // ── Load swap requests ───────────────────────────────────────────
      try{
        const r = await fetch(`/api/requests?type=swaps&orgId=${orgId}&_t=${Date.now()}`, {headers, cache:"no-store"});
        const d = await r.json();
        if(!r.ok) throw new Error(d.error||"Failed to load swaps");
        const swaps = d.swaps||[];
        setSwapRequests(swaps);
        // Push to bell immediately — no stale closure
        swaps.forEach(s=>items.push({
          id:"swap_"+s.id, type:"swap", read:false, raw:s,
        }));
      }catch(e){ console.error("[notif] swaps:", e.message); }

      // ── Load time off requests ────────────────────────────────────────
      try{
        const r = await fetch(`/api/requests?type=timeoff&orgId=${orgId}&_t=${Date.now()}`, {headers, cache:"no-store"});
        const d = await r.json();
        if(!r.ok) throw new Error(d.error||"Failed to load timeoff");
        const timeoff = d.timeoff||[];
        setTimeOffRequests(timeoff);
        timeoff.forEach(t=>items.push({
          id:"toff_"+t.id, type:"timeoff", read:false, raw:t,
        }));
      }catch(e){ console.error("[notif] timeoff:", e.message); }

      // ── Load staff messages ───────────────────────────────────────────
      try{
        const r = await fetch(`/api/messages?userId=owner&orgId=${orgId}&role=owner&_t=${Date.now()}`, {headers, cache:"no-store"});
        const d = await r.json();
        if(!r.ok) throw new Error(d.error||"Failed to load messages");
        const allMsgs = d.threads||[];
        const staffMsgs = allMsgs.filter(m=>
          m.type==="employee_to_manager" ||
          m.type==="direct"  // fallback for messages before type constraint fix
        );
        setStaffMessages(staffMsgs);
        setStaffMsgsLoaded(true);
        // Push unread staff messages to bell immediately
        staffMsgs.filter(m=>!m.read).forEach(m=>items.push({
          id:"staffmsg_"+m.id, type:"staffmsg", read:false, raw:m,
        }));
      }catch(e){ console.error("[notif] staffmsgs:", e.message); }

      setRequestsLoaded(true);
    }catch(e){ console.error("[notif] outer:", e.message); }
    setNotifications(items);
  };

  const loadPayroll = async(orgId, locId, periodDays=14) => {
    try{
      const sb = await getSB();
      const start = new Date();
      start.setDate(start.getDate() - periodDays);
      let q = sb.from("clock_events")
        .select("*")
        .eq("org_id", orgId)
        .gte("occurred_at", start.toISOString())
        .order("occurred_at", {ascending: true});
      if(locId) q = q.eq("location_id", locId);
      const {data: events} = await q;
      setLivePayroll(events || []);
    }catch(e){
      setLivePayroll([]);
    }
  };

  const loadShifts = async(orgId, weekStr, locId) => {
    try{
      const sb=await getSB();
      const {data:{session:ss}}=await sb.auth.getSession();
      // Add timestamp cache-buster to guarantee fresh response every time
      const ts=Date.now();
      const params=new URLSearchParams({orgId,weekStart:weekStr,_t:String(ts)});
      const res=await fetch("/api/shifts?"+params.toString(),{
        headers:ss?.access_token?{"Authorization":"Bearer "+ss.access_token}:{},
        cache:"no-store",
      });
      if(res.ok){
        const d=await res.json();
        if(d.shifts&&d.shifts.length>0){
          setLiveShifts(d.shifts);
          return;
        }
        // If filtered by loc returned nothing, retry without location filter
        if(locId){
          const params2=new URLSearchParams({orgId,weekStart:weekStr,_t:String(ts+1)});
          const res2=await fetch("/api/shifts?"+params2.toString(),{
            headers:ss?.access_token?{"Authorization":"Bearer "+ss.access_token}:{},
            cache:"no-store",
          });
          if(res2.ok){ const d2=await res2.json(); setLiveShifts(d2.shifts||[]); return; }
        }
        setLiveShifts([]);
      } else {
        // Final fallback: direct Supabase, no users join to avoid FK ambiguity
        const {data:shifts}=await sb.from("shifts").select("*").eq("org_id",orgId).eq("week_start",weekStr).order("start_hour");
        setLiveShifts(shifts||[]);
      }
    }catch(e){setLiveShifts([]);}
  };

  const loadEmployeesForLocation = async(orgId, locationId) => {
    try{
      const sb=await getSB();
      let q=sb.from("users").select("*").eq("org_id",orgId).in("status",["active","invited"]).in("app_role",["employee","supervisor"]).order("first_name");
      if(locationId) q=q.eq("location_id",locationId);
      const {data:emps}=await q;
      setLiveEmps(emps&&emps.length>0?emps.map(mapEmp):[]);
    }catch(e){setLiveEmps([]);}
  };

  const selectLocation = (loc) => {
    setActiveLocation(loc);
    if(typeof window!=="undefined"){
      localStorage.setItem("shiftpro_active_loc", loc.id);
      try{ localStorage.setItem("shiftpro_active_loc_obj", JSON.stringify(loc)); }catch(e){}
      // Also keep the full list cache current with this location included
      try{
        const raw = localStorage.getItem("shiftpro_all_locs");
        const existing = raw ? JSON.parse(raw) : [];
        // Always ensure selected loc is in the list
        const merged = [...existing.filter(l=>l.id!==loc.id), loc];
        localStorage.setItem("shiftpro_all_locs", JSON.stringify(merged));
        const orgId4 = loc.org_id||activeOrg?.id||ownerProfile?.org_id;
        if(orgId4) localStorage.setItem("shiftpro_cached_locs_"+orgId4, JSON.stringify(merged));
      }catch(e){}
    }
    setLocationGate("ready");
    setLiveShifts(null);
    setLivePayroll(null);
    loadEmployeesForLocation(activeOrg?.id||ownerProfile?.org_id, loc.id);
  };

  const addShift = async(sd) => {
    try{
      const sb=await getSB();
      const {data:{session:ss}}=await sb.auth.getSession();
      const body={
        org_id:ownerProfile?.org_id||activeOrg?.id,
        location_id:activeLocation?.id||null,
        user_id:sd.userId||null,
        week_start:sd.weekStart,
        day_of_week:sd.day,
        shift_date:sd.date,
        start_hour:sd.start,
        end_hour:sd.end,
        role_label:sd.role||"",
        notes:sd.notes||"",
        status:"scheduled",
        created_by:ownerProfile?.id,
      };
      // Optimistic UI — show shift instantly with a temp id
      const tempId="temp_"+Date.now();
      const empObj=liveEmps?.find(e=>e.id===sd.userId);
      const tempShift={
        ...body, id:tempId,
        users: empObj ? {first_name:empObj.first||empObj.name?.split(" ")[0]||"", last_name:empObj.name?.split(" ").slice(1).join(" ")||"", avatar_initials:empObj.avatar||"", avatar_color:empObj.color||"#6366f1", role:empObj.role||""} : null,
      };
      setLiveShifts(prev=>[...(prev||[]), tempShift]);
      const res=await fetch("/api/shifts",{
        method:"POST",
        headers:{"Content-Type":"application/json",...(ss?.access_token?{"Authorization":"Bearer "+ss.access_token}:{})},
        body:JSON.stringify(body),
      });
      if(!res.ok){
        const d=await res.json();
        setLiveShifts(prev=>(prev||[]).filter(s=>s.id!==tempId));
        throw new Error(d.error||"Insert failed");
      }
      // Replace temp with real DB shift from POST response
      const d=await res.json();
      const realShift=d.shift;
      if(realShift){
        setLiveShifts(prev=>(prev||[]).map(s=>s.id===tempId?{...realShift,users:tempShift.users}:s));
      }
      toast("Shift added ✓","success");
    }catch(e){ toast("Failed to add shift: "+e.message,"error"); }
  };

  const removeShift = async(shiftId, weekStart) => {
    setLiveShifts(prev=>(prev||[]).filter(s=>s.id!==shiftId));
    try{
      const sb2=await getSB();
      const {data:{session:ss}}=await sb2.auth.getSession();
      const res=await fetch("/api/shifts",{
        method:"POST",
        headers:{"Content-Type":"application/json",...(ss?.access_token?{"Authorization":"Bearer "+ss.access_token}:{})},
        body:JSON.stringify({_action:"delete",id:shiftId}),
      });
      if(!res.ok) throw new Error("Delete failed");
    }catch(e){
      if(ownerProfile?.org_id||activeOrg?.id) await loadShifts(ownerProfile?.org_id||activeOrg?.id, weekStart, activeLocation?.id||null);
      toast("Failed to remove shift","error");
    }
  };

  const publishSchedule = async(weekStart) => {
    const orgId = ownerProfile?.org_id||activeOrg?.id;
    if(!orgId){ toast("No organization found","error"); return; }
    try{
      const sb2=await getSB();
      const {data:{session:ss}}=await sb2.auth.getSession();
      const res=await fetch("/api/shifts",{
        method:"POST",
        headers:{"Content-Type":"application/json",...(ss?.access_token?{"Authorization":"Bearer "+ss.access_token}:{})},
        body:JSON.stringify({_action:"publish",orgId,weekStart}),
      });
      const result=await res.json();
      if(!res.ok) throw new Error(result.error||"Publish failed ("+res.status+")");
      // Update local state immediately — mark all this week's shifts as published
      setLiveShifts(prev=>(prev||[]).map(s=>s.week_start===weekStart?{...s,status:"published"}:s));
      setSchedPublished(true);
      setShowConfetti(true);
      toast("Schedule published to all employees ✓","success");
    }catch(e){ toast("Publish failed: "+e.message,"error"); }
  };

  const copyLastWeek = async () => {
    try{
      const sb2 = await getSB();
      const {data:{session:ss}}=await sb2.auth.getSession();
      const lastMon = getMonday(currentWeekOffset - 1);
      const thisMon = getMonday(currentWeekOffset);
      const orgId = ownerProfile?.org_id||activeOrg?.id||localStorage.getItem("shiftpro_active_orgid")||null;
      if(!orgId){ toast("No company found — try refreshing the page","error"); return; }
      // Fetch ALL last week's shifts for org — NO location filter so nothing gets missed
      const url=`/api/shifts?orgId=${orgId}&weekStart=${lastMon}&_t=${Date.now()}`;
      const fetchRes=await fetch(url,{
        headers:ss?.access_token?{"Authorization":"Bearer "+ss.access_token}:{},
        cache:"no-store",
      });
      const fetchData=await fetchRes.json();
      const lastWeekShifts=fetchData.shifts||[];
      if(!lastWeekShifts.length){ toast("No shifts found from last week","error"); return; }
      const DAYS_ORDER=["Mon","Tue","Wed","Thu","Fri","Sat","Sun"];
      const newShifts=lastWeekShifts.map(s=>({
        org_id:s.org_id,
        location_id:s.location_id,
        user_id:s.user_id,
        week_start:thisMon,
        day_of_week:s.day_of_week,
        shift_date:(()=>{
          const [y,m,d]=thisMon.split("-").map(Number);
          const base=new Date(y,m-1,d);
          base.setDate(base.getDate()+DAYS_ORDER.indexOf(s.day_of_week));
          return base.getFullYear()+"-"+String(base.getMonth()+1).padStart(2,"0")+"-"+String(base.getDate()).padStart(2,"0");
        })(),
        start_hour:s.start_hour,
        end_hour:s.end_hour,
        role_label:s.role_label||"",
        notes:s.notes||"",
        status:"scheduled",
        created_by:ownerProfile?.id||null,
      }));
      const copyRes=await fetch("/api/shifts",{
        method:"POST",
        headers:{"Content-Type":"application/json",...(ss?.access_token?{"Authorization":"Bearer "+ss.access_token}:{})},
        body:JSON.stringify({_action:"copyLastWeek",shifts:newShifts}),
      });
      if(!copyRes.ok){ const d=await copyRes.json(); throw new Error(d.error||"Copy failed"); }
      await loadShifts(orgId, thisMon, null); // reload without location filter to show all
      toast("✓ Copied "+newShifts.length+" shift"+(newShifts.length!==1?"s":"")+" from last week","success");
    }catch(e){ toast("Copy failed: "+e.message,"error"); }
  };

  const persistTab = (t) => {
    setTab(t);
    try{ localStorage.setItem("shiftpro_active_tab", t); }catch(e){}
  };

  const TABS = [
    {id:"command",l:"⚡ Command"},
    {id:"staff",l:"👥 Staff"},
    {id:"schedule",l:"📅 Schedule"},
    {id:"roi",l:"💵 Payroll"},
    {id:"intel",l:"🧠 Intelligence"},
    {id:"cameras",l:"📷 Cameras"},
    {id:"settings",l:"⚙️ Settings"},
  ];

  // ── RENDER ──────────────────────────────────────────

  // Location gate loading
  if(locationGate===null){
    return (
      <div style={{minHeight:"100vh",background:O.bg,display:"flex",alignItems:"center",justifyContent:"center",flexDirection:"column",gap:16}}>
        <NavLogoWarm/>
        <div style={{marginTop:20,display:"flex",flexDirection:"column",gap:8,width:240}}>
          {[80,65,75].map((w,i)=>(<div key={i} className="skeleton" style={{height:14,width:w+"%"}}/>))}
        </div>
      </div>
    );
  }

  return (
    <div style={{minHeight:"100vh",background:O.bg,fontFamily:O.sans,color:O.text}}>
      {/* Toast notifications */}
      <ToastContainer toasts={toasts} removeToast={removeToast}/>

      {showConfetti && <ConfettiOverlay onDone={()=>setShowConfetti(false)}/>}

      {activeDrawerEmp && (
        <EmployeeDrawer
          emp={activeDrawerEmp}
          onClose={()=>setActiveDrawerEmp(null)}
          activeOrg={activeOrg}
          ownerProfile={ownerProfile}
          setLiveEmps={setLiveEmps}
          mapEmp={mapEmp}
          toast={toast}
        />
      )}

      {notifOpen && (
        <div
          style={{position:"fixed",inset:0,zIndex:490}}
          onClick={()=>setNotifOpen(false)}
        />
      )}
      {notifOpen && (
        <NotificationsDropdown
          notifications={notifications}
          setNotifications={setNotifications}
          setNotifOpen={setNotifOpen}
          setTab={setTab}
          setStaffSubTab={setStaffSubTab}
          setSwapRequests={setSwapRequests}
          setTimeOffRequests={setTimeOffRequests}
          orgId={activeOrg?.id || ownerProfile?.org_id || null}
          loadNotifications={loadNotifications}
        />
      )}

      {/* Location gates */}
      {locationGate==="none" && (
        <LocationGateNone
          activeOrg={activeOrg}
          ownerProfile={ownerProfile}
          setLiveLocations={setLiveLocations}
          toast={toast}
          selectLocation={selectLocation}
        />
      )}
      {locationGate==="pick" && (
        <LocationGatePick
          liveLocations={liveLocations}
          selectLocation={selectLocation}
          setLocationGate={setLocationGate}
          setActiveLocation={setActiveLocation}
          setAddLocOpen={setAddLocOpen}
        />
      )}

      {/* Modals */}
      {addLocOpen && (
        <AddLocationModal
          activeOrg={activeOrg}
          ownerOrg={ownerOrg}
          ownerProfile={ownerProfile}
          activeLocation={activeLocation}
          addLocForm={addLocForm}
          setAddLocForm={setAddLocForm}
          addLocBusy={addLocBusy}
          setAddLocBusy={setAddLocBusy}
          addLocErr={addLocErr}
          setAddLocErr={setAddLocErr}
          setAddLocOpen={setAddLocOpen}
          setLiveLocations={setLiveLocations}
          selectLocation={selectLocation}
          setTab={setTab}
          toast={toast}
          mapEmp={mapEmp}
        />
      )}
      {/* ── ADD COMPANY MODAL ── */}
      {addOrgOpen&&(
        <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.5)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:400,padding:20}} onClick={()=>{setAddOrgOpen(false);setAddOrgErr("");setAddOrgForm({name:"",type:"Restaurant",address:"",empCount:"1-5"});}}>
          <div style={{background:"#fff",borderRadius:20,padding:"32px 28px",width:"100%",maxWidth:480,boxShadow:"0 20px 60px rgba(0,0,0,0.2)"}} onClick={e=>e.stopPropagation()}>
            <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:20}}>
              <div>
                <div style={{fontFamily:O.mono,fontSize:8,color:O.amber,letterSpacing:"2px",textTransform:"uppercase",marginBottom:4}}>New Company</div>
                <div style={{fontFamily:O.sans,fontWeight:800,fontSize:22,color:O.text}}>Add a Company</div>
              </div>
              <button onClick={()=>{setAddOrgOpen(false);setAddOrgErr("");}} style={{background:"none",border:"none",fontSize:24,cursor:"pointer",color:O.textF,lineHeight:1}}>×</button>
            </div>
            {[
              {l:"Company Name",k:"name",ph:"Sea Lion Bar, Surf Town Coffee..."},
              {l:"Address",k:"address",ph:"123 Main St, Newport, OR 97365"},
            ].map(f=>(
              <div key={f.k} style={{marginBottom:14}}>
                <label style={{fontFamily:O.mono,fontSize:9,color:O.textF,letterSpacing:"1.5px",display:"block",marginBottom:5,textTransform:"uppercase"}}>{f.l}</label>
                <input value={addOrgForm[f.k]} onChange={e=>setAddOrgForm(p=>({...p,[f.k]:e.target.value}))} placeholder={f.ph}
                  style={{width:"100%",padding:"10px 13px",background:O.bg3,border:"1px solid "+O.border,borderRadius:8,fontFamily:O.sans,fontSize:14,color:O.text,outline:"none",boxSizing:"border-box"}}
                  onFocus={e=>e.target.style.borderColor=O.amber} onBlur={e=>e.target.style.borderColor=O.border}/>
              </div>
            ))}
            <div style={{marginBottom:20}}>
              <label style={{fontFamily:O.mono,fontSize:9,color:O.textF,letterSpacing:"1.5px",display:"block",marginBottom:5,textTransform:"uppercase"}}>Business Type</label>
              <select value={addOrgForm.type} onChange={e=>setAddOrgForm(p=>({...p,type:e.target.value}))}
                style={{width:"100%",padding:"10px 13px",background:O.bg3,border:"1px solid "+O.border,borderRadius:8,fontFamily:O.sans,fontSize:13,color:O.text,outline:"none",cursor:"pointer",boxSizing:"border-box"}}>
                {["Restaurant","Bar","Coffee Shop","Retail","Hotel","Food Truck","Other"].map(t=><option key={t}>{t}</option>)}
              </select>
            </div>
            {addOrgErr&&<div style={{fontFamily:O.sans,fontSize:12,color:O.red,marginBottom:12,padding:"8px 12px",background:O.redD,borderRadius:6}}>{addOrgErr}</div>}
            <button disabled={addOrgBusy} onClick={async()=>{
              if(!addOrgForm.name.trim()){setAddOrgErr("Company name is required.");return;}
              setAddOrgBusy(true);setAddOrgErr("");
              try{
                const sb2=await getSB();
                const {data:{session:ss}}=await sb2.auth.getSession();
                if(!ss?.user) throw new Error("Not logged in");
                // Create organization
                const {data:newOrg,error:orgErr}=await sb2.from("organizations").insert({
                  name:addOrgForm.name.trim(),
                  industry:addOrgForm.type,
                  address:addOrgForm.address||"",
                }).select().single();
                if(orgErr) throw orgErr;
                // Link to owner
                await sb2.from("owner_organizations").insert({owner_id:ss.user.id,org_id:newOrg.id});
                // Update state
                const updated=[...ownerOrgs,newOrg];
                setOwnerOrgs(updated);
                setActiveOrg(newOrg);
                setOwnerOrg(newOrg);
                setSettingsProfile(p=>({...p,name:newOrg.name,type:newOrg.industry||"Restaurant",address:newOrg.address||"",phone:""}));
                setLiveLocations([]);
                setLiveEmps([]);
                setLiveShifts(null);
                setLivePayroll(null);
                setLocationGate("none");
                try{localStorage.setItem("shiftpro_active_orgid",newOrg.id);}catch(e){}
                setAddOrgOpen(false);
                setAddOrgForm({name:"",type:"Restaurant",address:"",empCount:"1-5"});
                toast("✓ "+newOrg.name+" created! Add your first location to get started.","success");
              }catch(e){setAddOrgErr(e.message||"Failed to create company.");}
              finally{setAddOrgBusy(false);}
            }} style={{width:"100%",padding:"14px",background:addOrgBusy?"rgba(224,123,0,0.5)":"linear-gradient(135deg,#e07b00,#c96800)",border:"none",borderRadius:10,fontFamily:O.sans,fontWeight:700,fontSize:15,color:"#fff",cursor:addOrgBusy?"not-allowed":"pointer",boxShadow:"0 4px 16px rgba(224,123,0,0.3)"}}>
              {addOrgBusy?"Creating...":"Create Company  to "}
            </button>
          </div>
        </div>
      )}

      {/* ── DELETE COMPANY CONFIRM MODAL ── */}
      {confirmDeleteOrgId&&(
        <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.5)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:400,padding:20}} onClick={()=>setConfirmDeleteOrgId(null)}>
          <div style={{background:"#fff",borderRadius:20,padding:"32px 28px",width:"100%",maxWidth:440,boxShadow:"0 20px 60px rgba(0,0,0,0.2)"}} onClick={e=>e.stopPropagation()}>
            <div style={{textAlign:"center",marginBottom:20}}>
              <div style={{fontSize:48,marginBottom:12}}>⚠️</div>
              <div style={{fontFamily:O.sans,fontWeight:800,fontSize:22,color:O.text,marginBottom:8}}>
                Delete "{ownerOrgs.find(o=>o.id===confirmDeleteOrgId)?.name}"?
              </div>
              <div style={{fontFamily:O.sans,fontSize:14,color:O.textD,lineHeight:1.6,maxWidth:360,margin:"0 auto"}}>
                This permanently deletes this company and <strong>ALL</strong> its locations, employees, shifts, and payroll data. This cannot be undone.
              </div>
            </div>
            <div style={{display:"flex",gap:10}}>
              <button onClick={()=>setConfirmDeleteOrgId(null)} style={{flex:1,padding:"13px",background:O.bg3,border:"1px solid "+O.border,borderRadius:10,fontFamily:O.sans,fontWeight:600,fontSize:14,color:O.textD,cursor:"pointer"}}>
                Cancel
              </button>
              <button onClick={async()=>{
                const orgToDelete=ownerOrgs.find(o=>o.id===confirmDeleteOrgId);
                if(!orgToDelete){setConfirmDeleteOrgId(null);return;}
                setConfirmDeleteOrgId(null);
                try{
                  const sb2=await getSB();
                  await sb2.from("shifts").delete().eq("org_id",orgToDelete.id);
                  await sb2.from("clock_events").delete().eq("org_id",orgToDelete.id);
                  await sb2.from("time_off_requests").delete().eq("org_id",orgToDelete.id);
                  await sb2.from("shift_swap_requests").delete().eq("org_id",orgToDelete.id);
                  await sb2.from("messages").delete().eq("org_id",orgToDelete.id);
                  await sb2.from("locations").delete().eq("org_id",orgToDelete.id);
                  await sb2.from("users").update({org_id:null,location_id:null}).eq("org_id",orgToDelete.id).neq("app_role","owner");
                  await sb2.from("owner_organizations").delete().eq("org_id",orgToDelete.id);
                  await sb2.from("organizations").delete().eq("id",orgToDelete.id);
                  const remaining=ownerOrgs.filter(o=>o.id!==orgToDelete.id);
                  setOwnerOrgs(remaining);
                  if(remaining.length>0){
                    setActiveOrg(remaining[0]);setOwnerOrg(remaining[0]);
                    try{localStorage.setItem("shiftpro_active_orgid",remaining[0].id);}catch(e){}
                  } else {
                    setActiveOrg(null);setOwnerOrg(null);setLiveLocations([]);
                    setLocationGate("none");
                    try{localStorage.removeItem("shiftpro_active_orgid");localStorage.removeItem("shiftpro_all_locs");localStorage.removeItem("shiftpro_active_loc");localStorage.removeItem("shiftpro_active_loc_obj");}catch(e){}
                  }
                  setLiveEmps([]);setLiveShifts(null);setLivePayroll(null);
                  toast("✓ Company deleted","success");
                }catch(e){toast("Delete failed: "+e.message,"error");}
              }} style={{flex:1,padding:"13px",background:"linear-gradient(135deg,#d94040,#b91c1c)",border:"none",borderRadius:10,fontFamily:O.sans,fontWeight:700,fontSize:14,color:"#fff",cursor:"pointer",boxShadow:"0 4px 14px rgba(217,64,64,0.3)"}}>
                Yes, Delete Forever
              </button>
            </div>
          </div>
        </div>
      )}

      {showInvite && (
        <InviteModal
          ownerProfile={ownerProfile}
          activeOrg={activeOrg}
          activeLocation={activeLocation}
          inviteForm={inviteForm}
          setInviteForm={setInviteForm}
          inviteBusy={inviteBusy}
          setInviteBusy={setInviteBusy}
          inviteDone={inviteDone}
          setInviteDone={setInviteDone}
          inviteErr={inviteErr}
          setInviteErr={setInviteErr}
          setShowInvite={setShowInvite}
          setLiveEmps={setLiveEmps}
          mapEmp={mapEmp}
          toast={toast}
        />
      )}
      {broadcastOpen && (
        <BroadcastModal
          ownerProfile={ownerProfile}
          liveEmps={liveEmps}
          broadcastForm={broadcastForm}
          setBroadcastForm={setBroadcastForm}
          broadcastBusy={broadcastBusy}
          setBroadcastBusy={setBroadcastBusy}
          broadcastDone={broadcastDone}
          setBroadcastDone={setBroadcastDone}
          setBroadcastOpen={setBroadcastOpen}
          toast={toast}
        />
      )}

      {/* ── TOPBAR ── */}
      <div style={{background:"#fff",borderBottom:"1px solid "+O.border,padding:"0 16px",height:56,display:"flex",alignItems:"center",justifyContent:"space-between",position:"sticky",top:0,zIndex:100,boxShadow:"0 1px 4px rgba(0,0,0,0.05)"}}>
        <div style={{display:"flex",alignItems:"center",gap:mobile?8:12}}>
          <NavLogoWarm/>

          {/* Company name header + org switcher — hidden on mobile */}
          {ownerOrg&&!mobile&&(
            <div style={{position:"relative"}}>
              <button onClick={()=>setOrgSwitcherOpen(o=>!o)}
                style={{display:"flex",alignItems:"center",gap:8,padding:"5px 12px 5px 8px",background:"transparent",border:"none",cursor:"pointer",borderRadius:8,transition:"background 0.15s"}}
                onMouseEnter={e=>e.currentTarget.style.background=O.amberD}
                onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
                {/* Company avatar badge */}
                <div style={{width:28,height:28,borderRadius:7,background:"linear-gradient(135deg,#e07b00,#c96800)",display:"flex",alignItems:"center",justifyContent:"center",fontFamily:O.mono,fontWeight:800,fontSize:12,color:"#fff",flexShrink:0,letterSpacing:0}}>
                  {(ownerOrg.name||"?")[0].toUpperCase()}
                </div>
                {/* Company name — the main header */}
                <div style={{display:"flex",flexDirection:"column",alignItems:"flex-start"}}>
                  <span style={{fontFamily:O.sans,fontWeight:700,fontSize:14,color:O.text,maxWidth:200,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",lineHeight:1.2}}>
                    {settingsProfile.name || ownerOrg?.name || "My Company"}
                  </span>
                  <span style={{fontFamily:O.mono,fontSize:7,color:O.textF,letterSpacing:"1px",textTransform:"uppercase",lineHeight:1}}>
                    {settingsProfile.type||ownerOrg?.industry||"Business"}{ownerOrgs.length>1?" · "+ownerOrgs.length+" cos":""} ▾
                  </span>
                </div>
              </button>
              {orgSwitcherOpen&&(
                <div style={{position:"absolute",top:"calc(100% + 8px)",left:0,background:"#fff",border:"1px solid "+O.border,borderRadius:12,padding:8,minWidth:260,zIndex:300,boxShadow:O.shadowB}} onClick={e=>e.stopPropagation()}>
                  <div style={{fontFamily:O.mono,fontSize:7,color:O.textF,letterSpacing:"2px",padding:"4px 8px 8px",textTransform:"uppercase"}}>Your Companies</div>
                  {ownerOrgs.map(org=>(
                    <button key={org.id} onClick={async()=>{
                      if(org.id===activeOrg?.id){setOrgSwitcherOpen(false);return;}
                      setOrgSwitcherOpen(false);
                      setActiveOrg(org);
                      setOwnerOrg(org);
                      setNotifLoaded(false); // Force notifications to reload for new org
                      // Update settings profile so company name header reflects the new org immediately
                      setSettingsProfile(p=>({...p,
                        name: localStorage.getItem("shiftpro_org_name_"+org.id)||org.name||p.name,
                        type: org.industry||p.type,
                        address: org.address||p.address,
                        phone: org.phone||p.phone,
                      }));
                      // Cache this org as active
                      try{ localStorage.setItem("shiftpro_active_orgid", org.id); }catch(e){}
                      setLiveEmps(null);setLiveShifts(null);setLivePayroll(null);
                      setLiveLocations([]);
                      setActiveLocation(null);
                      setLocationGate(null); // Reset gate so new org locations load
                      try{
                        const sb=await getSB();
                        const {data:{session:ss}}=await sb.auth.getSession();
                        // Fetch locations via service role (bypasses RLS)
                        const locsRes=await fetch("/api/location?orgId="+org.id,{
                          headers:ss?.access_token?{"Authorization":"Bearer "+ss.access_token}:{}
                        });
                        let orgLocs=[];
                        if(locsRes.ok){const d=await locsRes.json();orgLocs=d.locations||[];}
                        else{
                          const {data:l}=await sb.from("locations").select("*").eq("org_id",org.id).eq("active",true).order("created_at");
                          orgLocs=l||[];
                        }
                        setLiveLocations(orgLocs);
                        if(orgLocs.length>0){
                          setActiveLocation(orgLocs[0]);
                          setLocationGate("ready");
                          try{
                            localStorage.setItem("shiftpro_all_locs",JSON.stringify(orgLocs));
                            localStorage.setItem("shiftpro_cached_locs_"+org.id,JSON.stringify(orgLocs));
                            localStorage.setItem("shiftpro_active_loc",orgLocs[0].id);
                            localStorage.setItem("shiftpro_active_loc_obj",JSON.stringify(orgLocs[0]));
                          }catch(e){}
                        } else {
                          setLocationGate("none");
                        }
                        const {data:emps}=await sb.from("users").select("*").eq("org_id",org.id).in("status",["active","invited"]).in("app_role",["employee","supervisor"]).order("first_name");
                        setLiveEmps(emps&&emps.length>0?emps.map(mapEmp):[]);
                        if(emps) try{localStorage.setItem("shiftpro_cached_emps_"+org.id,JSON.stringify(emps.map(mapEmp)));}catch(e){}
                      }catch(e){setLiveEmps([]);setLocationGate("none");}
                      persistTab("command");
                    }}
                    style={{width:"100%",display:"flex",alignItems:"center",gap:10,padding:"8px 10px",border:"none",borderRadius:8,cursor:"pointer",textAlign:"left",background:activeOrg?.id===org.id?O.amberD:"none"}}
                    onMouseEnter={e=>e.currentTarget.style.background=O.bg3}
                    onMouseLeave={e=>e.currentTarget.style.background=activeOrg?.id===org.id?O.amberD:"none"}>
                      <div style={{width:28,height:28,borderRadius:7,background:"linear-gradient(135deg,#e07b00,#c96800)",display:"flex",alignItems:"center",justifyContent:"center",fontFamily:O.mono,fontWeight:700,fontSize:12,color:"#fff",flexShrink:0}}>{(org.name||"?")[0].toUpperCase()}</div>
                      <div style={{flex:1,minWidth:0}}>
                        <div style={{fontFamily:O.sans,fontWeight:600,fontSize:12,color:O.text,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{org.name}</div>
                        <div style={{fontFamily:O.mono,fontSize:8,color:O.textF,letterSpacing:1}}>{org.industry||"Business"}</div>
                      </div>
                      {activeOrg?.id===org.id&&<span style={{color:O.amber,fontSize:13}}>✓</span>}
                    </button>
                  ))}
                  <div style={{borderTop:"1px solid "+O.border,marginTop:6,paddingTop:6}}>
                    <button onClick={()=>{setAddOrgOpen(true);setOrgSwitcherOpen(false);}}
                      style={{width:"100%",display:"flex",alignItems:"center",gap:10,padding:"8px 10px",border:"none",borderRadius:8,cursor:"pointer",background:"none",fontFamily:O.sans,fontWeight:600,fontSize:12,color:O.green}}
                      onMouseEnter={e=>e.currentTarget.style.background=O.greenD}
                      onMouseLeave={e=>e.currentTarget.style.background="none"}>
                      + Add New Company
                    </button>
                    {ownerOrgs.length>0&&(
                      <div style={{marginTop:4,padding:"0 2px"}}>
                        <button onClick={()=>{setOrgSwitcherOpen(false);setConfirmDeleteOrgId(activeOrg?.id||ownerOrgs[0]?.id);}}
                          style={{width:"100%",display:"flex",alignItems:"center",gap:8,padding:"6px 2px",border:"none",background:"none",fontFamily:O.sans,fontWeight:500,fontSize:11,color:"rgba(217,64,64,0.7)",cursor:"pointer",textAlign:"left"}}>
                          🗑 Delete current company...
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Location switcher — hidden on mobile */}
          {liveLocations.length>0&&!mobile&&(
            <div style={{display:"flex",alignItems:"center",gap:6}}>
              <span style={{color:O.textF,fontSize:12}}>›</span>
              <div style={{position:"relative"}}>
                <button onClick={()=>setLocSwitcherOpen(o=>!o)}
                  style={{display:"flex",alignItems:"center",gap:6,padding:"4px 12px",background:"rgba(8,145,178,0.07)",border:"1px solid rgba(8,145,178,0.18)",borderRadius:6,cursor:"pointer",fontFamily:O.mono,fontSize:9,color:O.cyan,letterSpacing:1,maxWidth:260,whiteSpace:"nowrap"}}>
                  <span style={{fontSize:11}}>📍</span>
                  <span style={{overflow:"hidden",textOverflow:"ellipsis"}}>{activeLocation?.name||"All Locations"}</span>
                  <span style={{flexShrink:0}}>{locSwitcherOpen?"▴":"▾"}</span>
                </button>
                {locSwitcherOpen&&(
                  <div style={{position:"absolute",top:"calc(100% + 8px)",left:0,background:"#fff",border:"1px solid "+O.border,borderRadius:12,padding:8,minWidth:240,zIndex:300,boxShadow:O.shadowB}} onClick={e=>e.stopPropagation()}>
                    <div style={{fontFamily:O.mono,fontSize:7,color:O.textF,letterSpacing:"2px",padding:"4px 8px 8px",textTransform:"uppercase"}}>Locations</div>
                    {liveLocations.map((loc,idx)=>(
                      <button key={loc.id} onClick={async()=>{
                        setLocSwitcherOpen(false);
                        if(loc.id===activeLocation?.id) return;
                        setLiveShifts(null);
                        setLivePayroll(null);
                        selectLocation(loc);
                      }}
                      style={{width:"100%",display:"flex",alignItems:"center",gap:10,padding:"8px 10px",border:"none",borderRadius:8,cursor:"pointer",textAlign:"left",background:activeLocation?.id===loc.id?"rgba(8,145,178,0.07)":"none"}}
                      onMouseEnter={e=>e.currentTarget.style.background=O.bg3}
                      onMouseLeave={e=>e.currentTarget.style.background=activeLocation?.id===loc.id?"rgba(8,145,178,0.07)":"none"}>
                        <div style={{width:28,height:28,borderRadius:7,background:"linear-gradient(135deg,#0891b2,#0e7490)",display:"flex",alignItems:"center",justifyContent:"center",fontFamily:O.mono,fontWeight:700,fontSize:12,color:"#fff",flexShrink:0}}>{idx+1}</div>
                        <div style={{flex:1,minWidth:0}}>
                          <div style={{fontFamily:O.sans,fontWeight:600,fontSize:12,color:O.text,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{loc.name}</div>
                          <div style={{fontFamily:O.mono,fontSize:8,color:O.textF,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{loc.address||"No address"}</div>
                        </div>
                        {activeLocation?.id===loc.id&&<span style={{color:O.cyan,fontSize:13,flexShrink:0}}>✓</span>}
                      </button>
                    ))}
                    <div style={{borderTop:"1px solid "+O.border,marginTop:6,paddingTop:6}}>
                      <button onClick={()=>{setLocSwitcherOpen(false);setAddLocOpen(true);}}
                        style={{width:"100%",display:"flex",alignItems:"center",gap:10,padding:"8px 10px",border:"none",borderRadius:8,cursor:"pointer",background:"none",fontFamily:O.sans,fontWeight:600,fontSize:12,color:O.amber}}
                        onMouseEnter={e=>e.currentTarget.style.background=O.amberD}
                        onMouseLeave={e=>e.currentTarget.style.background="none"}>
                        + Add New Location
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Right side of topbar */}
        <div style={{display:"flex",alignItems:"center",gap:mobile?8:14}}>
          {!mobile&&<div style={{fontFamily:O.mono,fontSize:11,color:O.textD}}>
            {now.toLocaleTimeString("en-US",{hour12:false,hour:"2-digit",minute:"2-digit"})}
          </div>}
          {/* Bell */}
          <div style={{position:"relative"}}>
            <button
              onClick={()=>setNotifOpen(o=>!o)}
              style={{width:36,height:36,borderRadius:"50%",background:notifOpen?O.amberD:"none",border:"1px solid "+(notifOpen?O.amberB:O.border),display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",fontSize:16,position:"relative",transition:"all 0.15s"}}
              onMouseEnter={e=>{e.currentTarget.style.background=O.amberD;e.currentTarget.style.borderColor=O.amberB;}}
              onMouseLeave={e=>{if(!notifOpen){e.currentTarget.style.background="none";e.currentTarget.style.borderColor=O.border;}}}>
              🔔
              {notifications.filter(n=>!n.read).length>0&&(
                <div style={{position:"absolute",top:-2,right:-2,width:16,height:16,borderRadius:"50%",background:O.red,border:"2px solid #fff",display:"flex",alignItems:"center",justifyContent:"center",fontFamily:O.mono,fontSize:8,fontWeight:700,color:"#fff"}}>
                  {notifications.filter(n=>!n.read).length}
                </div>
              )}
            </button>
          </div>
          {ownerProfile&&(
            <div style={{width:34,height:34,borderRadius:"50%",background:"linear-gradient(135deg,#e07b00,#c96800)",display:"flex",alignItems:"center",justifyContent:"center",fontFamily:O.mono,fontWeight:700,fontSize:12,color:"#fff",flexShrink:0}}>
              {(ownerProfile.first_name||"?")[0].toUpperCase()}{(ownerProfile.last_name||"?")[0].toUpperCase()}
            </div>
          )}
          <button onClick={async()=>{
            try{const sb=await getSB();await sb.auth.signOut();}catch(e){}
            onLogout();
          }} style={{padding:mobile?"6px 10px":"6px 12px",background:"none",border:"1px solid "+O.border,borderRadius:6,fontFamily:O.mono,fontSize:9,letterSpacing:1,color:O.textD,cursor:"pointer"}}
          onMouseEnter={e=>{e.currentTarget.style.background=O.bg3;}}
          onMouseLeave={e=>{e.currentTarget.style.background="none";}}>
            {mobile?"↩":"EXIT"}
          </button>
        </div>
      </div>

      {/* ── PILL TABS ── */}
      <div style={{background:"#fff",borderBottom:"1px solid "+O.border,padding:mobile?"6px 12px":"8px 20px",display:"flex",gap:4,overflowX:"auto",WebkitOverflowScrolling:"touch"}}>
        {TABS.map(t=>(
          <button key={t.id} onClick={()=>persistTab(t.id)}
            style={{fontFamily:O.sans,fontWeight:600,fontSize:13,padding:"7px 16px",border:"none",borderRadius:20,cursor:"pointer",color:tab===t.id?"#fff":O.textD,background:tab===t.id?"#e07b00":"none",transition:"all 0.15s",whiteSpace:"nowrap"}}
            onMouseEnter={e=>{if(tab!==t.id)e.currentTarget.style.background=O.amberD;}}
            onMouseLeave={e=>{if(tab!==t.id)e.currentTarget.style.background="none";}}>
            {t.l}
          </button>
        ))}
      </div>

      {/* ── TAB CONTENT ── */}
      <div style={{padding:mobile?"12px":"16px 20px",maxWidth:1200,margin:"0 auto"}}>

        {/* ══ COMMAND TAB ══ */}
        {tab==="command"&&(
          <div style={{animation:"fadeUp 0.3s ease"}}>

            {/* ── TODAY'S GAME PLAN ── */}
            {(()=>{
              const todayName = now.toLocaleDateString("en-US",{weekday:"short"}).slice(0,3);
              const DAYS3 = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];
              const todayKey = DAYS3[now.getDay()];
              const todayShifts = (liveShifts||[]).filter(s=>s.day_of_week===todayKey||s.day_of_week===todayName);
              const START_H = 6; const END_H = 23; const SPAN = END_H - START_H;
              const nowH = now.getHours() + now.getMinutes()/60;
              const nowPct = Math.max(0,Math.min(100,((nowH-START_H)/SPAN)*100));

              // Coverage timeline blocks
              const timelineBlocks = todayShifts.map(sh=>{
                const emp = (liveEmps||[]).find(e=>e.id===sh.user_id);
                if(!emp) return null;
                const left = Math.max(0,((sh.start_hour-START_H)/SPAN)*100);
                const width = Math.min(100-left,((sh.end_hour-sh.start_hour)/SPAN)*100);
                return {emp,sh,left,width};
              }).filter(Boolean);

              // Status pills for each employee
              const statusPills = todayShifts.map(sh=>{
                const emp = (liveEmps||[]).find(e=>e.id===sh.user_id);
                if(!emp) return null;
                const isOnShift = nowH>=sh.start_hour && nowH<sh.end_hour;
                const isUpcoming = sh.start_hour > nowH && sh.start_hour-nowH <= 2;
                const isLate = nowH > sh.start_hour+0.17 && !isOnShift && sh.start_hour <= nowH;
                const status = isOnShift?"on":isLate?"late":isUpcoming?"upcoming":"later";
                const fmtH = h=>h===0?"12a":h<12?h+"a":h===12?"12p":(h-12)+"p";
                return {emp,sh,status,fmtH};
              }).filter(Boolean);

              const onCount = statusPills.filter(p=>p.status==="on").length;
              const lateCount = statusPills.filter(p=>p.status==="late").length;
              const upcomingCount = statusPills.filter(p=>p.status==="upcoming").length;

              return (
                <div style={{background:"#fff",borderLeft:"4px solid "+O.amber,borderRadius:"0 14px 14px 0",padding:"18px 20px",marginBottom:20,boxShadow:O.shadow}}>
                  {/* Top row */}
                  <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:14,flexWrap:"wrap",gap:8}}>
                    <div>
                      <div style={{fontFamily:O.sans,fontWeight:800,fontSize:20,color:O.text}}>
                        {activeLocation?.name||activeOrg?.name||"Your Business"} — Today's Game Plan
                      </div>
                      <div style={{fontFamily:O.mono,fontSize:10,color:O.amber,letterSpacing:1,marginTop:2}}>
                        {now.toLocaleDateString("en-US",{weekday:"long",month:"long",day:"numeric"})}
                      </div>
                    </div>
                    <div style={{display:"flex",gap:8,alignItems:"center",flexShrink:0}}>
                      <div style={{fontFamily:O.mono,fontSize:14,color:O.text,fontWeight:600}}>
                        {now.toLocaleTimeString("en-US",{hour:"2-digit",minute:"2-digit",hour12:true})}
                      </div>
                      {liveLocations.length>1&&(
                        <button onClick={()=>setLocSwitcherOpen(true)} style={{padding:"5px 12px",background:O.bg3,border:"1px solid "+O.border,borderRadius:7,fontFamily:O.sans,fontSize:11,fontWeight:600,color:O.textD,cursor:"pointer"}}>Switch</button>
                      )}
                      <button onClick={()=>setAddLocOpen(true)} style={{padding:"5px 12px",background:O.amberD,border:"1px solid "+O.amberB,borderRadius:7,fontFamily:O.sans,fontSize:11,fontWeight:600,color:O.amber,cursor:"pointer"}}>+ Add Location</button>
                    </div>
                  </div>

                  {/* Coverage timeline */}
                  {todayShifts.length>0?(
                    <div style={{marginBottom:14}}>
                      <div style={{position:"relative",height:36,background:O.bg3,borderRadius:8,overflow:"hidden",marginBottom:4}}>
                        {/* Hour markers */}
                        {[8,10,12,14,16,18,20,22].map(h=>(
                          <div key={h} style={{position:"absolute",left:((h-START_H)/SPAN*100)+"%",top:0,bottom:0,borderLeft:"1px solid rgba(0,0,0,0.07)"}}/>
                        ))}
                        {/* Shift blocks */}
                        {timelineBlocks.map((b,i)=>(
                          <div key={i} title={b.emp.name+" - "+b.sh.start_hour+"–"+b.sh.end_hour} style={{position:"absolute",left:b.left+"%",width:b.width+"%",top:4,bottom:4,background:b.emp.color||O.amber,borderRadius:4,display:"flex",alignItems:"center",justifyContent:"center",overflow:"hidden",cursor:"default"}}>
                            <span style={{fontFamily:O.mono,fontSize:9,color:"#fff",fontWeight:700,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis",padding:"0 4px"}}>{b.emp.avatar}</span>
                          </div>
                        ))}
                        {/* Now line */}
                        {nowPct>0&&nowPct<100&&(
                          <div style={{position:"absolute",left:nowPct+"%",top:0,bottom:0,width:2,background:O.red,borderRadius:1}}>
                            <div style={{position:"absolute",top:-1,left:-3,width:8,height:8,borderRadius:"50%",background:O.red}}/>
                          </div>
                        )}
                      </div>
                      {/* Hour labels */}
                      <div style={{display:"flex",justifyContent:"space-between",paddingRight:4}}>
                        {[6,9,12,15,18,21].map(h=>(
                          <span key={h} style={{fontFamily:O.mono,fontSize:8,color:O.textF}}>{h===12?"12p":h<12?h+"a":(h-12)+"p"}</span>
                        ))}
                      </div>
                    </div>
                  ):(
                    <div style={{padding:"10px 0",marginBottom:12,fontFamily:O.sans,fontSize:13,color:O.textF}}>No shifts scheduled for today. <button onClick={()=>setTab("schedule")} style={{background:"none",border:"none",color:O.amber,fontFamily:O.sans,fontSize:13,cursor:"pointer",textDecoration:"underline"}}>Build schedule  to </button></div>
                  )}

                  {/* Status pills */}
                  {statusPills.length>0&&(
                    <div style={{display:"flex",flexWrap:"wrap",gap:8,marginBottom:10}}>
                      {statusPills.map((p,i)=>{
                        const ringColor = p.status==="on"?O.green:p.status==="late"?O.red:p.status==="upcoming"?O.amber:"rgba(0,0,0,0.15)";
                        const label = p.status==="on"?"● ON SHIFT":p.status==="late"?"⚠ LATE":p.status==="upcoming"?"⏰ UPCOMING":p.fmtH(p.sh.start_hour);
                        return (
                          <div key={i} style={{display:"flex",alignItems:"center",gap:7,padding:"5px 10px",background:O.bg3,borderRadius:20,border:"1.5px solid "+ringColor}}>
                            <div style={{width:28,height:28,borderRadius:"50%",background:p.emp.color||"#6366f1",display:"flex",alignItems:"center",justifyContent:"center",fontFamily:O.mono,fontWeight:700,fontSize:10,color:"#fff",flexShrink:0}}>{p.emp.avatar}</div>
                            <div>
                              <div style={{fontFamily:O.sans,fontWeight:600,fontSize:11,color:O.text}}>{p.emp.first||p.emp.name.split(" ")[0]}</div>
                              <div style={{fontFamily:O.mono,fontSize:8,color:ringColor,letterSpacing:0.5}}>{label}</div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {/* Summary line */}
                  <div style={{fontFamily:O.mono,fontSize:9,color:O.textF,letterSpacing:0.5}}>
                    {onCount>0?<span style={{color:O.green,marginRight:8}}>● {onCount} on shift</span>:null}
                    {upcomingCount>0?<span style={{color:O.amber,marginRight:8}}>⏰ {upcomingCount} upcoming</span>:null}
                    {lateCount>0?<span style={{color:O.red,marginRight:8}}>⚠ {lateCount} late</span>:null}
                    {todayShifts.length===0?<span>No shifts scheduled today</span>:null}
                  </div>
                </div>
              );
            })()}

            {/* Loading state */}
            {liveEmps===null&&(
              <div style={{display:"flex",flexDirection:"column",gap:12,marginBottom:20}}>
                {[100,100,100,100].map((_,i)=>(
                  <div key={i} className="skeleton" style={{height:90,borderRadius:12}}/>
                ))}
              </div>
            )}

            {/* ── ONBOARDING CHECKLIST ── */}
            {liveEmps!==null&&!setupDismissed&&(()=>{
              const steps = [
                {label:"Create your account",done:true,tab:null},
                {label:"Add your first location",done:liveLocations.length>0,tab:"command"},
                {label:"Invite your first employee",done:(liveEmps||[]).length>0,tab:"staff"},
                {label:"Build your first schedule",done:(liveShifts||[]).length>0,tab:"schedule"},
                {label:"Publish your schedule",done:(liveShifts||[]).some(s=>s.status==="published"),tab:"schedule"},
              ];
              const doneCount = steps.filter(s=>s.done).length;
              const allDone = doneCount === steps.length;
              if(allDone){
                // Auto-dismiss after 3 seconds so user sees completion
                setTimeout(()=>{
                  setSetupDismissed(true);
                  try{ localStorage.setItem("shiftpro_setup_done","true"); }catch(e){}
                },3000);
              }
              return (
                <div style={{background:"#fff",borderLeft:"3px solid "+O.amber,borderRadius:"0 12px 12px 0",padding:"16px 20px",marginBottom:20,boxShadow:O.shadow,position:"relative"}}>
                  <button onClick={()=>{
                    setSetupDismissed(true);
                    try{ localStorage.setItem("shiftpro_setup_done","true"); }catch(e){}
                  }} style={{position:"absolute",top:10,right:12,background:"none",border:"none",fontSize:18,cursor:"pointer",color:O.textF,lineHeight:1}}>×</button>
                  <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:10,paddingRight:24}}>
                    <div>
                      <div style={{fontFamily:O.sans,fontWeight:700,fontSize:14,color:O.text}}>🚀 Account Setup</div>
                      <div style={{fontFamily:O.mono,fontSize:9,color:O.textF,marginTop:2}}>{doneCount} of {steps.length} complete</div>
                    </div>
                    <div style={{fontFamily:O.mono,fontSize:10,color:O.amber,fontWeight:600}}>{Math.round(doneCount/steps.length*100)}%</div>
                  </div>
                  {/* Progress bar */}
                  <div style={{height:4,background:O.bg3,borderRadius:2,marginBottom:14,overflow:"hidden"}}>
                    <div style={{height:"100%",width:(doneCount/steps.length*100)+"%",background:"linear-gradient(90deg,#e07b00,#c96800)",borderRadius:2,transition:"width 0.6s ease"}}/>
                  </div>
                  {/* Steps */}
                  <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
                    {steps.map((step,i)=>(
                      <button key={i}
                        onClick={()=>{ if(!step.done && step.tab) setTab(step.tab); }}
                        style={{display:"flex",alignItems:"center",gap:7,padding:"6px 11px",borderRadius:20,border:"1px solid "+(step.done?"rgba(26,158,110,0.25)":O.border),background:step.done?O.greenD:"none",cursor:step.done?"default":"pointer",transition:"all 0.15s"}}
                        onMouseEnter={e=>{ if(!step.done) e.currentTarget.style.borderColor=O.amber; }}
                        onMouseLeave={e=>{ if(!step.done) e.currentTarget.style.borderColor=O.border; }}>
                        <div style={{width:18,height:18,borderRadius:"50%",flexShrink:0,background:step.done?"#1a9e6e":O.bg3,border:"1.5px solid "+(step.done?"#1a9e6e":O.border),display:"flex",alignItems:"center",justifyContent:"center",fontSize:10,color:"#fff",fontFamily:O.mono,fontWeight:700}}>
                          {step.done?"✓":i+1}
                        </div>
                        <span style={{fontFamily:O.sans,fontSize:11,fontWeight:600,color:step.done?O.green:O.textD,whiteSpace:"nowrap"}}>{step.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              );
            })()}

            {liveEmps!==null&&(()=>{
              const LIVE = liveEmps;
              const totalScheduledHrs = (liveShifts||[]).reduce((s,sh)=>s+(sh.end_hour-sh.start_hour),0);
              const avgRate = LIVE.length>0 ? LIVE.reduce((s,e)=>s+(parseFloat(e.rate)||15),0)/LIVE.length : 15;
              const estLaborCost = totalScheduledHrs * avgRate;
              const DAYS_FULL = ["Mon","Tue","Wed","Thu","Fri","Sat","Sun"];

              // Shifts per day this week
              const shiftsPerDay = {};
              DAYS_FULL.forEach(d=>{ shiftsPerDay[d]=(liveShifts||[]).filter(s=>s.day_of_week===d).length; });

              return (
                <div>
                  {/* Stat strip */}
                  <div style={{display:"grid",gridTemplateColumns:mobile?"1fr 1fr":"repeat(4,1fr)",gap:10,marginBottom:20}}>
                    <StatCard label="Team Size" value={LIVE.length} sub={LIVE.length===1?"employee":"employees"} color={O.purple} icon="👥"/>
                    <StatCard label="On Shift Now" value={LIVE.filter(e=>e.status==="active").length} sub="clocked in" color={O.green} icon="⏱"/>
                    <StatCard label="Hours This Week" value={totalScheduledHrs+"h"} sub="scheduled" color={O.cyan} icon="📅"/>
                    <StatCard label="Est. Labor Cost" value={"$"+Math.round(estLaborCost).toLocaleString()} sub="this week" color={O.amber} icon="💵"/>
                  </div>

                  {/* Main 2-col grid */}
                  <div style={{display:"grid",gridTemplateColumns:mobile?"1fr":"1.5fr 1fr",gap:16,marginBottom:16}}>

                    {/* Left col */}
                    <div style={{display:"flex",flexDirection:"column",gap:14}}>

                      {/* Weekly schedule mini-preview */}
                      <div style={{background:"#fff",border:"1px solid "+O.border,borderRadius:14,padding:"18px",boxShadow:O.shadow}}>
                        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:14}}>
                          <div style={{fontFamily:O.sans,fontWeight:700,fontSize:15,color:O.text}}>📅 This Week's Schedule</div>
                          <button onClick={()=>setTab("schedule")} style={{fontFamily:O.sans,fontSize:12,fontWeight:600,color:O.amber,background:O.amberD,border:"1px solid "+O.amberB,borderRadius:6,padding:"4px 10px",cursor:"pointer"}}>View Full  to </button>
                        </div>
                        {liveShifts===null&&(
                          <div style={{fontFamily:O.sans,fontSize:13,color:O.textF,padding:"12px 0",textAlign:"center"}}>
                            Loading this week's schedule…
                          </div>
                        )}
                        <div style={{display:"grid",gridTemplateColumns:"repeat(7,1fr)",gap:6}}>
                          {DAYS_FULL.map(d=>{
                            const count = shiftsPerDay[d]||0;
                            return (
                              <button key={d} onClick={()=>setTab("schedule")}
                                style={{padding:"10px 4px",borderRadius:10,border:"1px solid "+(count>0?O.amberB:O.border),background:count>0?O.amberD:"#fff",cursor:"pointer",textAlign:"center",transition:"all 0.15s"}}
                                onMouseEnter={e=>{e.currentTarget.style.borderColor=O.amber;e.currentTarget.style.background=O.amberD;}}
                                onMouseLeave={e=>{e.currentTarget.style.borderColor=count>0?O.amberB:O.border;e.currentTarget.style.background=count>0?O.amberD:"#fff";}}>
                                <div style={{fontFamily:O.mono,fontSize:8,color:O.textF,letterSpacing:1,marginBottom:5}}>{d.toUpperCase()}</div>
                                <div style={{fontFamily:O.sans,fontWeight:700,fontSize:18,color:count>0?O.amber:O.textF}}>{count}</div>
                                <div style={{fontFamily:O.mono,fontSize:7,color:count>0?O.amber:O.textF}}>shift{count!==1?"s":""}</div>
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      {/* Recent activity */}
                      <div style={{background:"#fff",border:"1px solid "+O.border,borderRadius:14,padding:"18px",boxShadow:O.shadow}}>
                        <div style={{fontFamily:O.sans,fontWeight:700,fontSize:15,color:O.text,marginBottom:14}}>⚡ Recent Activity</div>
                        {LIVE.length===0?(
                          <div style={{textAlign:"center",padding:"20px 0",color:O.textF,fontFamily:O.sans,fontSize:13}}>Activity appears as employees clock in and out.</div>
                        ):(
                          <div style={{display:"flex",flexDirection:"column",gap:8}}>
                            {LIVE.slice(0,5).map((emp,i)=>(
                              <div key={emp.id} style={{display:"flex",alignItems:"center",gap:10,padding:"8px 10px",background:O.bg3,borderRadius:8}}>
                                <div style={{width:32,height:32,borderRadius:"50%",background:emp.color||"#6366f1",display:"flex",alignItems:"center",justifyContent:"center",fontFamily:O.mono,fontWeight:700,fontSize:11,color:"#fff",flexShrink:0}}>{getInitials(emp)}</div>
                                <div style={{flex:1}}>
                                  <div style={{fontFamily:O.sans,fontWeight:600,fontSize:13,color:O.text}}>{emp.name}</div>
                                  <div style={{fontFamily:O.mono,fontSize:9,color:O.textF}}>Status: {emp.status==="active"?"Active":"Invited"}</div>
                                </div>
                                <div style={{padding:"3px 8px",borderRadius:12,fontFamily:O.mono,fontSize:8,letterSpacing:1,background:emp.status==="active"?O.greenD:"rgba(0,0,0,0.04)",border:"1px solid "+(emp.status==="active"?"rgba(26,158,110,0.2)":O.border),color:emp.status==="active"?O.green:O.textF}}>
                                  {emp.status==="active"?"ACTIVE":"INVITED"}
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Right col */}
                    <div style={{display:"flex",flexDirection:"column",gap:14}}>

                      {/* Quick actions */}
                      <div style={{background:"#fff",border:"1px solid "+O.border,borderRadius:14,padding:"18px",boxShadow:O.shadow}}>
                        <div style={{fontFamily:O.sans,fontWeight:700,fontSize:15,color:O.text,marginBottom:12}}>Quick Actions</div>
                        <div style={{display:"flex",flexDirection:"column",gap:8}}>
                          {[
                            {icon:"📅",label:"Build Schedule",color:O.amber,fn:()=>setTab("schedule")},
                            {icon:"👥",label:"Invite Employee",color:O.purple,fn:()=>setShowInvite(true)},
                            {icon:"💵",label:"View Payroll",color:O.green,fn:()=>setTab("roi")},
                            {icon:"📣",label:"Message Team",color:O.red,fn:()=>setBroadcastOpen(true)},
                          ].map(a=>(
                            <button key={a.label} onClick={a.fn}
                              style={{display:"flex",alignItems:"center",gap:12,padding:"11px 14px",background:a.color+"0d",border:"1px solid "+a.color+"22",borderRadius:10,fontFamily:O.sans,fontWeight:600,fontSize:13,color:a.color,cursor:"pointer",textAlign:"left",transition:"all 0.15s"}}
                              onMouseEnter={e=>{e.currentTarget.style.background=a.color+"18";e.currentTarget.style.transform="translateX(3px)";}}
                              onMouseLeave={e=>{e.currentTarget.style.background=a.color+"0d";e.currentTarget.style.transform="none";}}>
                              <span style={{fontSize:18}}>{a.icon}</span>
                              {a.label}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Staff inbox - employee messages to management */}
                      <div style={{background:"#fff",border:"1px solid "+O.border,borderRadius:14,padding:"18px",boxShadow:O.shadow}}>
                        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:12}}>
                          <div style={{display:"flex",alignItems:"center",gap:8}}>
                            <div style={{fontFamily:O.sans,fontWeight:700,fontSize:15,color:O.text}}>Staff Inbox</div>
                            {staffMessages.length>0&&(
                              <span style={{background:O.indigo,color:"#fff",fontFamily:O.mono,fontSize:9,fontWeight:700,borderRadius:10,padding:"2px 7px"}}>{staffMessages.length}</span>
                            )}
                          </div>
                          <button onClick={()=>{ setNotifLoaded(false); if(orgId) loadNotifications(orgId,true); }}
                            style={{fontFamily:O.mono,fontSize:9,color:O.textF,background:"none",border:"none",cursor:"pointer",letterSpacing:1}}>REFRESH</button>
                        </div>
                        {!staffMsgsLoaded&&<div style={{fontFamily:O.sans,fontSize:12,color:O.textD,padding:"8px 0"}}>Loading...</div>}
                        {staffMsgsLoaded&&staffMessages.length===0&&(
                          <div style={{textAlign:"center",padding:"14px 0"}}>
                            <div style={{fontSize:28,marginBottom:6}}>📥</div>
                            <div style={{fontFamily:O.sans,fontSize:12,color:O.textD}}>No messages from staff yet</div>
                          </div>
                        )}
                        {staffMessages.slice(0,5).map(msg=>(
                          <div key={msg.id} style={{padding:"10px 12px",background:msg.read?O.bg3:"rgba(99,102,241,0.05)",borderRadius:10,marginBottom:8,borderLeft:"3px solid "+(msg.read?O.indigo+"60":O.indigo)}}>
                            <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:4}}>
                              <div style={{display:"flex",alignItems:"center",gap:6}}>
                                {!msg.read&&<div style={{width:7,height:7,borderRadius:"50%",background:O.indigo,flexShrink:0}}/>}
                                <div style={{fontFamily:O.sans,fontWeight:msg.read?600:700,fontSize:13,color:O.text}}>{msg.from_name||"Staff"}</div>
                              </div>
                              <div style={{fontFamily:O.mono,fontSize:8,color:O.textF}}>
                                {msg.created_at?new Date(msg.created_at).toLocaleDateString("en-US",{month:"short",day:"numeric",hour:"numeric",minute:"2-digit"}):""}
                              </div>
                            </div>
                            <div style={{fontFamily:O.sans,fontSize:12,color:O.textD,lineHeight:1.5,marginBottom:6}}>{msg.body||msg.text||""}</div>
                            <button onClick={()=>{
                              const staffEmp = (liveEmps||[]).find(e=>e.id===msg.from_id);
                              if(staffEmp){ setSelectedEmp(staffEmp); setShowEmpDrawer(true); }
                            }} style={{padding:"4px 10px",background:O.indigoD,border:"1px solid "+O.indigo+"30",borderRadius:6,fontFamily:O.sans,fontSize:11,fontWeight:600,color:O.indigo,cursor:"pointer"}}>
                              Reply to {msg.from_name?.split(" ")[0]||"Staff"}
                            </button>
                          </div>
                        ))}
                      </div>

                      {/* Team status */}
                      <div style={{background:"#fff",border:"1px solid "+O.border,borderRadius:14,padding:"18px",boxShadow:O.shadow}}>
                        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:12}}>
                          <div style={{fontFamily:O.sans,fontWeight:700,fontSize:15,color:O.text}}>Team Status</div>
                          <button onClick={()=>setTab("staff")} style={{fontFamily:O.sans,fontSize:12,fontWeight:600,color:O.amber,background:"none",border:"none",cursor:"pointer"}}>View All  to </button>
                        </div>
                        {LIVE.length===0?(
                          <div style={{textAlign:"center",padding:"20px 0"}}>
                            <div style={{fontSize:32,marginBottom:8}}>👥</div>
                            <div style={{fontFamily:O.sans,fontSize:13,color:O.textD,marginBottom:10}}>No employees yet</div>
                            <button onClick={()=>setShowInvite(true)} style={{padding:"7px 16px",background:"linear-gradient(135deg,#7c3aed,#6d28d9)",border:"none",borderRadius:8,fontFamily:O.sans,fontWeight:600,fontSize:12,color:"#fff",cursor:"pointer"}}>Invite First Employee</button>
                          </div>
                        ):(
                          <div style={{display:"flex",flexDirection:"column",gap:8}}>
                            {LIVE.slice(0,6).map(emp=>(
                              <div key={emp.id} style={{display:"flex",alignItems:"center",gap:10}}>
                                <div style={{width:32,height:32,borderRadius:"50%",background:emp.color||"#6366f1",display:"flex",alignItems:"center",justifyContent:"center",fontFamily:O.mono,fontWeight:700,fontSize:11,color:"#fff",flexShrink:0}}>{getInitials(emp)}</div>
                                <div style={{flex:1,minWidth:0}}>
                                  <div style={{fontFamily:O.sans,fontWeight:600,fontSize:13,color:O.text,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{emp.name}</div>
                                  <div style={{fontFamily:O.mono,fontSize:9,color:O.textF}}>{emp.role}</div>
                                </div>
                                <div style={{padding:"2px 7px",borderRadius:10,fontFamily:O.mono,fontSize:8,letterSpacing:1,background:emp.status==="active"?O.greenD:"rgba(0,0,0,0.04)",border:"1px solid "+(emp.status==="active"?"rgba(26,158,110,0.2)":O.border),color:emp.status==="active"?O.green:O.textF,flexShrink:0}}>
                                  {emp.status==="active"?"ACTIVE":"INVITED"}
                                </div>
                              </div>
                            ))}
                            {LIVE.length>6&&<button onClick={()=>setTab("staff")} style={{fontFamily:O.sans,fontSize:12,color:O.textF,background:"none",border:"none",cursor:"pointer",textAlign:"center",padding:"4px"}}>+{LIVE.length-6} more</button>}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Bottom banners */}
                  {LIVE.length===0&&(
                    <div style={{background:"linear-gradient(135deg,rgba(124,58,237,0.06),rgba(109,40,217,0.04))",border:"1px solid rgba(124,58,237,0.15)",borderRadius:14,padding:"20px 24px",display:"flex",alignItems:"center",gap:16}}>
                      <span style={{fontSize:32}}>🚀</span>
                      <div style={{flex:1}}>
                        <div style={{fontFamily:O.sans,fontWeight:700,fontSize:15,color:O.text,marginBottom:4}}>Start by inviting your first employee</div>
                        <div style={{fontFamily:O.sans,fontSize:13,color:O.textD}}>They'll get an email to set their password and access their Work Hub on mobile or desktop.</div>
                      </div>
                      <button onClick={()=>setShowInvite(true)} style={{padding:"10px 20px",background:"linear-gradient(135deg,#7c3aed,#6d28d9)",border:"none",borderRadius:9,fontFamily:O.sans,fontWeight:700,fontSize:13,color:"#fff",cursor:"pointer",flexShrink:0,boxShadow:"0 4px 14px rgba(124,58,237,0.3)"}}>Invite Employee  to </button>
                    </div>
                  )}
                  {LIVE.length>0&&(liveShifts||[]).length===0&&(
                    <div style={{background:"linear-gradient(135deg,rgba(224,123,0,0.06),rgba(201,104,0,0.04))",border:"1px solid "+O.amberB,borderRadius:14,padding:"20px 24px",display:"flex",alignItems:"center",gap:16}}>
                      <span style={{fontSize:32}}>📅</span>
                      <div style={{flex:1}}>
                        <div style={{fontFamily:O.sans,fontWeight:700,fontSize:15,color:O.text,marginBottom:4}}>No shifts scheduled this week</div>
                        <div style={{fontFamily:O.sans,fontSize:13,color:O.textD}}>Build your schedule so employees know when to come in. Publish it to notify your team.</div>
                      </div>
                      <button onClick={()=>setTab("schedule")} style={{padding:"10px 20px",background:"linear-gradient(135deg,#e07b00,#c96800)",border:"none",borderRadius:9,fontFamily:O.sans,fontWeight:700,fontSize:13,color:"#fff",cursor:"pointer",flexShrink:0,boxShadow:"0 4px 14px rgba(224,123,0,0.3)"}}>Build Schedule  to </button>
                    </div>
                  )}
                </div>
              );
            })()}
          </div>
        )}

        {/* ══ STAFF TAB ══ */}
        {tab==="staff"&&(
          <div style={{animation:"fadeUp 0.3s ease",paddingBottom:40}}>
            {/* Header */}
            <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:16}}>
              <div>
                <div style={{fontFamily:O.mono,fontSize:8,color:O.purple,letterSpacing:"2px",marginBottom:4,textTransform:"uppercase"}}>Staff Management</div>
                <div style={{fontFamily:O.sans,fontWeight:800,fontSize:22,color:O.text}}>Your Team {liveEmps&&liveEmps.length>0&&<span style={{fontFamily:O.mono,fontSize:12,color:O.textD,fontWeight:400,marginLeft:8}}>{liveEmps.length} members</span>}</div>
              </div>
              <button onClick={()=>setShowInvite(true)} style={{display:"flex",alignItems:"center",gap:8,padding:"11px 20px",background:"linear-gradient(135deg,#7c3aed,#6d28d9)",border:"none",borderRadius:10,fontFamily:O.sans,fontWeight:700,fontSize:14,color:"#fff",cursor:"pointer",boxShadow:"0 4px 14px rgba(124,58,237,0.3)"}}>+ Invite Employee</button>
            </div>

            {/* Sub-tab pills */}
            <div style={{display:"flex",gap:6,marginBottom:18}}>
              {[["team","👥 Team"],["requests","📋 Requests"+(swapRequests.length+timeOffRequests.length>0?" ("+( swapRequests.length+timeOffRequests.length)+")":"")]].map(([id,label])=>(
                <button key={id} onClick={()=>{ setStaffSubTab(id); if(id==="requests"&&activeOrg?.id) loadNotifications(activeOrg.id, true); }}
                  style={{padding:"7px 16px",borderRadius:20,border:"none",fontFamily:O.sans,fontWeight:600,fontSize:13,cursor:"pointer",transition:"all 0.15s",background:staffSubTab===id?"#7c3aed":O.bg3,color:staffSubTab===id?"#fff":O.textD}}>
                  {label}
                </button>
              ))}
            </div>

            {/* ── TEAM sub-tab ── */}
            {staffSubTab==="team"&&(
              <div>
                {liveEmps&&liveEmps.length>0&&(
                  <div style={{marginBottom:16,position:"relative"}}>
                    <span style={{position:"absolute",left:12,top:"50%",transform:"translateY(-50%)",fontSize:14,color:O.textF}}>🔍</span>
                    <input value={staffSearch} onChange={e=>setStaffSearch(e.target.value)} placeholder="Search by name, role, or department..."
                      style={{width:"100%",padding:"10px 12px 10px 36px",background:"#fff",border:"1px solid "+O.border,borderRadius:10,fontFamily:O.sans,fontSize:13,color:O.text,outline:"none",boxSizing:"border-box",boxShadow:O.shadow}}
                      onFocus={e=>e.target.style.borderColor=O.amber} onBlur={e=>e.target.style.borderColor=O.border}/>
                  </div>
                )}
                {liveEmps===null&&<SkeletonLoader rows={5}/>}
                {liveEmps!==null&&liveEmps.length===0&&(
                  <div style={{textAlign:"center",padding:"80px 20px"}}>
                    <div style={{fontSize:56,marginBottom:16}}>👥</div>
                    <div style={{fontFamily:O.sans,fontWeight:700,fontSize:20,color:O.text,marginBottom:8}}>No employees yet</div>
                    <div style={{fontFamily:O.sans,fontSize:14,color:O.textD,lineHeight:1.7,maxWidth:360,margin:"0 auto 24px"}}>Click Invite Employee to add your first team member. They'll get an email to set their password and access their Work Hub.</div>
                    <button onClick={()=>setShowInvite(true)} style={{padding:"13px 28px",background:"linear-gradient(135deg,#7c3aed,#6d28d9)",border:"none",borderRadius:10,fontFamily:O.sans,fontWeight:700,fontSize:14,color:"#fff",cursor:"pointer",boxShadow:"0 4px 14px rgba(124,58,237,0.25)"}}>Invite Your First Employee</button>
                    <button onClick={async()=>{
                      const orgId=activeOrg?.id||ownerProfile?.org_id;
                      if(!orgId) return;
                      try{
                        const sb2=await getSB();
                        const {data:emps}=await sb2.from("users").select("*").eq("org_id",orgId).in("app_role",["employee","supervisor"]).order("first_name");
                        if(emps&&emps.length>0){setLiveEmps(emps.map(mapEmp));toast("Found "+emps.length+" staff member"+(emps.length!==1?"s":"")+" ✓","success");}
                        else{toast("No staff found. Send invites to add employees.","info");}
                      }catch(e){toast("Refresh failed","error");}
                    }} style={{padding:"8px 18px",background:"none",border:"1px solid "+O.border,borderRadius:8,fontFamily:O.sans,fontSize:12,color:O.textD,cursor:"pointer",marginTop:8,display:"block"}}>
                      🔄 Refresh Staff List
                    </button>
                  </div>
                )}
                {liveEmps!==null&&liveEmps.length>0&&(
                  <div style={{display:"flex",flexDirection:"column",gap:8}}>
                    {liveEmps.filter(emp=>staffSearch===""||emp.name.toLowerCase().includes(staffSearch.toLowerCase())||emp.role.toLowerCase().includes(staffSearch.toLowerCase())||emp.dept.toLowerCase().includes(staffSearch.toLowerCase())).map(emp=>(
                      <div key={emp.id}
                        onClick={()=>setActiveDrawerEmp(emp)}
                        style={{background:"#fff",border:"1px solid "+O.border,borderLeft:"3px solid "+(deptColor(emp.dept)||O.amberB),borderRadius:"0 12px 12px 0",padding:"16px 18px",display:"flex",alignItems:"center",gap:14,boxShadow:O.shadow,transition:"all 0.15s",cursor:"pointer"}}
                        onMouseEnter={e=>{e.currentTarget.style.transform="translateX(3px)";}}
                        onMouseLeave={e=>{e.currentTarget.style.transform="none";}}>
                        <div style={{width:44,height:44,borderRadius:"50%",flexShrink:0,background:emp.color||"#6366f1",display:"flex",alignItems:"center",justifyContent:"center",fontFamily:O.mono,fontWeight:700,fontSize:14,color:"#fff"}}>{getInitials(emp)}</div>
                        <div style={{flex:1}}>
                          <div style={{fontFamily:O.sans,fontWeight:700,fontSize:15,color:O.text,marginBottom:2}}>{emp.name}</div>
                          <div style={{display:"flex",alignItems:"center",gap:8,flexWrap:"wrap"}}>
                            <span style={{fontFamily:O.sans,fontSize:12,color:O.textD}}>{emp.role}</span>
                            {emp.dept&&<span style={{fontFamily:O.mono,fontSize:9,color:O.cyan,background:"rgba(8,145,178,0.08)",border:"1px solid rgba(8,145,178,0.15)",borderRadius:4,padding:"1px 6px",letterSpacing:0.5}}>{emp.dept}</span>}
                            {emp.hired&&<span style={{fontFamily:O.mono,fontSize:9,color:O.textF}}>Since {emp.hired}</span>}
                          </div>
                        </div>
                        <div style={{textAlign:"right",flexShrink:0}}>
                          <div style={{fontFamily:O.mono,fontSize:13,color:O.amber,fontWeight:600}}>${(emp.rate||15).toFixed(2)}/hr</div>
                        </div>
                        <div style={{flexShrink:0,padding:"4px 10px",borderRadius:20,fontFamily:O.mono,fontSize:8,letterSpacing:"1.5px",fontWeight:600,background:emp.status==="active"?O.greenD:"rgba(224,123,0,0.08)",border:"1px solid "+(emp.status==="active"?"rgba(26,158,110,0.25)":O.amberB),color:emp.status==="active"?O.green:O.amber}}>
                          {emp.status==="active"?"ACTIVE":"INVITED"}
                        </div>
                        <div style={{color:O.textF,fontSize:16,flexShrink:0}}>›</div>
                      </div>
                    ))}
                    {staffSearch&&liveEmps.filter(emp=>emp.name.toLowerCase().includes(staffSearch.toLowerCase())||emp.role.toLowerCase().includes(staffSearch.toLowerCase())).length===0&&(
                      <div style={{textAlign:"center",padding:"40px 20px",fontFamily:O.sans,fontSize:14,color:O.textD}}>No employees match "{staffSearch}"</div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* ── REQUESTS sub-tab ── */}
            {staffSubTab==="requests"&&(
              <div>
                {/* Shift Swap Requests */}
                <div style={{marginBottom:24}}>
                  <div style={{fontFamily:O.sans,fontWeight:700,fontSize:16,color:O.text,marginBottom:12,display:"flex",alignItems:"center",gap:8}}>
                    🔄 Shift Swap Requests
                    {swapRequests.length>0&&<span style={{fontFamily:O.mono,fontSize:9,color:O.amber,background:O.amberD,border:"1px solid "+O.amberB,borderRadius:10,padding:"2px 8px"}}>{swapRequests.length} pending</span>}
                  </div>
                  {!requestsLoaded&&<SkeletonLoader rows={3}/>}
                  {requestsLoaded&&swapRequests.length===0&&(
                    <div style={{background:"#fff",border:"1px solid "+O.border,borderRadius:12,padding:"28px",textAlign:"center",boxShadow:O.shadow}}>
                      <div style={{fontSize:36,marginBottom:8}}>🎉</div>
                      <div style={{fontFamily:O.sans,fontWeight:600,fontSize:14,color:O.text,marginBottom:4}}>No pending swap requests</div>
                      <div style={{fontFamily:O.sans,fontSize:12,color:O.textD}}>Swap requests from employees will appear here for your approval.</div>
                    </div>
                  )}
                  {swapRequests.map(req=>{
                    const empName=((req.users?.first_name||"")+" "+(req.users?.last_name||"")).trim()||"Employee";
                    const av=(()=>{const parts=(((req.users?.first_name||'')+' '+(req.users?.last_name||'')).trim()).split(' ').filter(Boolean);return parts.length>=2?(parts[0][0]+parts[1][0]).toUpperCase():parts[0]?parts[0].slice(0,2).toUpperCase():'??';})();
                    const shiftLabel=req.shift_date?new Date(req.shift_date+"T12:00:00").toLocaleDateString("en-US",{weekday:"short",month:"short",day:"numeric"}):"Upcoming shift";
                    return(
                      <div key={req.id} style={{background:"#fff",border:"1px solid "+O.border,borderLeft:"3px solid "+O.amber,borderRadius:"0 12px 12px 0",padding:"14px 16px",marginBottom:8,boxShadow:O.shadow}}>
                        <div style={{display:"flex",alignItems:"flex-start",gap:12}}>
                          <div style={{width:36,height:36,borderRadius:"50%",background:req.users?.avatar_color||"#f59e0b",display:"flex",alignItems:"center",justifyContent:"center",fontFamily:O.mono,fontWeight:700,fontSize:12,color:"#fff",flexShrink:0}}>{av}</div>
                          <div style={{flex:1}}>
                            <div style={{fontFamily:O.sans,fontWeight:700,fontSize:14,color:O.text,marginBottom:2}}>{empName}</div>
                            <div style={{fontFamily:O.mono,fontSize:9,color:O.amber,marginBottom:4}}>SWAP REQUEST - {shiftLabel}</div>
                            {req.reason&&<div style={{fontFamily:O.sans,fontSize:13,color:O.textD}}>{req.reason}</div>}
                            <div style={{fontFamily:O.mono,fontSize:9,color:O.textF,marginTop:3}}>{req.created_at?new Date(req.created_at).toLocaleDateString("en-US",{month:"short",day:"numeric",hour:"numeric",minute:"2-digit"}):""}</div>
                          </div>
                          <div style={{display:"flex",gap:8,flexShrink:0}}>
                            <button onClick={async()=>{
                              try{
                                const {data:{session:ss}}=await (await getSB()).auth.getSession();
                                const r=await fetch("/api/requests",{method:"POST",headers:{"Content-Type":"application/json",...(ss?.access_token?{"Authorization":"Bearer "+ss.access_token}:{})},body:JSON.stringify({table:"shift_swap_requests",id:req.id,status:"approved"})});
                                if(!r.ok){const d=await r.json();throw new Error(d.error||"Failed");}
                                setSwapRequests(prev=>prev.filter(r=>r.id!==req.id));
                                toast("Swap approved","success");
                              }catch(e){ toast("Failed: "+e.message,"error"); }
                            }} style={{padding:"6px 12px",background:O.greenD,border:"1px solid rgba(26,158,110,0.25)",borderRadius:7,fontFamily:O.sans,fontWeight:600,fontSize:12,color:O.green,cursor:"pointer"}}>Approve</button>
                            <button onClick={async()=>{
                              try{
                                const {data:{session:ss}}=await (await getSB()).auth.getSession();
                                const r=await fetch("/api/requests",{method:"POST",headers:{"Content-Type":"application/json",...(ss?.access_token?{"Authorization":"Bearer "+ss.access_token}:{})},body:JSON.stringify({table:"shift_swap_requests",id:req.id,status:"denied"})});
                                if(!r.ok){const d=await r.json();throw new Error(d.error||"Failed");}
                                setSwapRequests(prev=>prev.filter(r=>r.id!==req.id));
                                toast("Swap denied","info");
                              }catch(e){ toast("Failed: "+e.message,"error"); }
                            }} style={{padding:"6px 12px",background:O.redD,border:"1px solid rgba(217,64,64,0.2)",borderRadius:7,fontFamily:O.sans,fontWeight:600,fontSize:12,color:O.red,cursor:"pointer"}}>Deny</button>
                          </div>
                        </div>
                      </div>
                    );
                  })}                </div>

                {/* Time Off Requests */}
                <div>
                  <div style={{fontFamily:O.sans,fontWeight:700,fontSize:16,color:O.text,marginBottom:12,display:"flex",alignItems:"center",gap:8}}>
                    📆 Time Off Requests
                    {timeOffRequests.length>0&&<span style={{fontFamily:O.mono,fontSize:9,color:O.purple,background:"rgba(124,58,237,0.08)",border:"1px solid rgba(124,58,237,0.2)",borderRadius:10,padding:"2px 8px"}}>{timeOffRequests.length} pending</span>}
                  </div>
                  {!requestsLoaded&&<SkeletonLoader rows={3}/>}
                  {requestsLoaded&&timeOffRequests.length===0&&(
                    <div style={{background:"#fff",border:"1px solid "+O.border,borderRadius:12,padding:"28px",textAlign:"center",boxShadow:O.shadow}}>
                      <div style={{fontSize:36,marginBottom:8}}>✅</div>
                      <div style={{fontFamily:O.sans,fontWeight:600,fontSize:14,color:O.text,marginBottom:4}}>No pending time off requests</div>
                      <div style={{fontFamily:O.sans,fontSize:12,color:O.textD}}>Time off requests from employees will appear here.</div>
                    </div>
                  )}
                  {timeOffRequests.map(req=>{
                    const empName=((req.users?.first_name||"")+" "+(req.users?.last_name||"")).trim()||"Employee";
                    const av=(()=>{const parts=(((req.users?.first_name||'')+' '+(req.users?.last_name||'')).trim()).split(' ').filter(Boolean);return parts.length>=2?(parts[0][0]+parts[1][0]).toUpperCase():parts[0]?parts[0].slice(0,2).toUpperCase():'??';})();
                    const fmtD=function(d){return d?new Date(d+"T12:00:00").toLocaleDateString("en-US",{month:"short",day:"numeric",year:"numeric"}):"TBD";};
                    const isSameDay=req.start_date&&req.end_date&&req.start_date===req.end_date;
                    const dateLabel=isSameDay?fmtD(req.start_date):fmtD(req.start_date)+" to "+fmtD(req.end_date);
                    const days=req.start_date&&req.end_date?Math.round((new Date(req.end_date)-new Date(req.start_date))/86400000)+1:1;
                    return(
                      <div key={req.id} style={{background:"#fff",border:"1px solid "+O.border,borderLeft:"3px solid #7c3aed",borderRadius:"0 12px 12px 0",padding:"14px 16px",marginBottom:8,boxShadow:O.shadow}}>
                        <div style={{display:"flex",alignItems:"flex-start",gap:12}}>
                          <div style={{width:36,height:36,borderRadius:"50%",background:req.users?.avatar_color||"#7c3aed",display:"flex",alignItems:"center",justifyContent:"center",fontFamily:O.mono,fontWeight:700,fontSize:12,color:"#fff",flexShrink:0}}>{av}</div>
                          <div style={{flex:1}}>
                            <div style={{fontFamily:O.sans,fontWeight:700,fontSize:14,color:O.text,marginBottom:2}}>{empName}</div>
                            <div style={{fontFamily:O.mono,fontSize:9,color:"#7c3aed",marginBottom:4}}>TIME OFF - {dateLabel} - {days} day{days!==1?"s":""}</div>
                            {req.reason&&<div style={{fontFamily:O.sans,fontSize:13,color:O.textD}}>{req.reason}</div>}
                            <div style={{fontFamily:O.mono,fontSize:9,color:O.textF,marginTop:3}}>{req.created_at?new Date(req.created_at).toLocaleDateString("en-US",{month:"short",day:"numeric",hour:"numeric",minute:"2-digit"}):""}</div>
                          </div>
                          <div style={{display:"flex",gap:8,flexShrink:0}}>
                            <button onClick={async()=>{
                              try{
                                const {data:{session:ss}}=await (await getSB()).auth.getSession();
                                const r=await fetch("/api/requests",{method:"POST",headers:{"Content-Type":"application/json",...(ss?.access_token?{"Authorization":"Bearer "+ss.access_token}:{})},body:JSON.stringify({table:"time_off_requests",id:req.id,status:"approved"})});
                                if(!r.ok){const d=await r.json();throw new Error(d.error||"Failed");}
                                setTimeOffRequests(prev=>prev.filter(r=>r.id!==req.id));
                                toast("Time off approved","success");
                              }catch(e){ toast("Failed: "+e.message,"error"); }
                            }} style={{padding:"6px 12px",background:O.greenD,border:"1px solid rgba(26,158,110,0.25)",borderRadius:7,fontFamily:O.sans,fontWeight:600,fontSize:12,color:O.green,cursor:"pointer"}}>Approve</button>
                            <button onClick={async()=>{
                              try{
                                const {data:{session:ss}}=await (await getSB()).auth.getSession();
                                const r=await fetch("/api/requests",{method:"POST",headers:{"Content-Type":"application/json",...(ss?.access_token?{"Authorization":"Bearer "+ss.access_token}:{})},body:JSON.stringify({table:"time_off_requests",id:req.id,status:"denied"})});
                                if(!r.ok){const d=await r.json();throw new Error(d.error||"Failed");}
                                setTimeOffRequests(prev=>prev.filter(r=>r.id!==req.id));
                                toast("Request denied","info");
                              }catch(e){ toast("Failed: "+e.message,"error"); }
                            }} style={{padding:"6px 12px",background:O.redD,border:"1px solid rgba(217,64,64,0.2)",borderRadius:7,fontFamily:O.sans,fontWeight:600,fontSize:12,color:O.red,cursor:"pointer"}}>Deny</button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ══ SCHEDULE TAB ══ */}
        {tab==="schedule"&&(
          <div style={{animation:"fadeUp 0.3s ease",paddingBottom:40}}>
            {selectedCell && (
              <ShiftAddModal
                selectedCell={selectedCell}
                setSelectedCell={setSelectedCell}
                liveEmps={liveEmps}
                currentWeekOffset={currentWeekOffset}
                addShift={addShift}
                getMonday={getMonday}
              />
            )}

            {/* Labor cost gauge */}
            {liveShifts!==null&&liveShifts.length>0&&(()=>{
              const totalH=(liveShifts||[]).reduce((s,sh)=>s+(sh.end_hour-sh.start_hour),0);
              const avgR=(liveEmps||[]).length>0?(liveEmps||[]).reduce((s,e)=>s+(parseFloat(e.rate)||15),0)/(liveEmps||[]).length:15;
              const totalCost=totalH*avgR;
              const budget=parseFloat(settingsPay?.otThreshold||40)*avgR*(liveEmps||[]).length;
              const overBudget=totalCost>3000;
              return(
                <div style={{display:"flex",alignItems:"center",gap:16,padding:"10px 16px",background:"#fff",border:"1px solid "+O.border,borderRadius:10,marginBottom:12,boxShadow:O.shadow}}>
                  <span style={{fontFamily:O.mono,fontSize:9,color:O.textF,letterSpacing:1,textTransform:"uppercase"}}>Week Labor</span>
                  <span style={{fontFamily:O.mono,fontSize:14,fontWeight:700,color:overBudget?O.red:O.green}}>${Math.round(totalCost).toLocaleString()}</span>
                  <span style={{fontFamily:O.mono,fontSize:11,color:O.textD}}>-</span>
                  <span style={{fontFamily:O.mono,fontSize:11,color:O.textD}}>{totalH}h scheduled</span>
                  <span style={{fontFamily:O.mono,fontSize:11,color:O.textD}}>-</span>
                  <span style={{fontFamily:O.mono,fontSize:11,color:O.textD}}>${avgR.toFixed(2)} avg/hr</span>
                  {overBudget&&<span style={{fontFamily:O.mono,fontSize:8,color:O.red,background:O.redD,border:"1px solid rgba(217,64,64,0.2)",borderRadius:4,padding:"2px 6px",letterSpacing:1}}>OVER $3K</span>}
                </div>
              );
            })()}

            <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:16,flexWrap:"wrap",gap:8}}>
              <div>
                <div style={{fontFamily:O.mono,fontSize:8,color:O.cyan,letterSpacing:"2px",marginBottom:4,textTransform:"uppercase"}}>Schedule Builder</div>
                <div style={{fontFamily:O.sans,fontWeight:800,fontSize:22,color:O.text}}>Weekly Schedule</div>
              </div>
              <div style={{display:"flex",gap:8,alignItems:"center",flexWrap:"wrap"}}>
                {/* View toggle */}
                <div style={{display:"flex",background:O.bg3,borderRadius:8,border:"1px solid "+O.border,overflow:"hidden"}}>
                  {["week","month"].map(v=>(
                    <button key={v} onClick={()=>setSchedViewMode(v)} style={{padding:"7px 14px",background:schedViewMode===v?"#fff":"none",border:"none",fontFamily:O.sans,fontWeight:600,fontSize:12,color:schedViewMode===v?O.text:O.textD,cursor:"pointer",borderRight:v==="week"?"1px solid "+O.border:"none"}}>
                      {v==="week"?"Week":"Month"}
                    </button>
                  ))}
                </div>
                {schedViewMode==="week"&&<>
                  <button onClick={()=>{setCurrentWeekOffset(w=>w-1);setLiveShifts(null);setSchedPublished(false);}} style={{padding:"8px 12px",background:"#fff",border:"1px solid "+O.border,borderRadius:8,fontFamily:O.sans,fontSize:13,cursor:"pointer",color:O.textD}}> back  Prev</button>
                  <div style={{fontFamily:O.mono,fontSize:10,color:O.textD,padding:"0 8px"}}>
                    {(()=>{const [y,m,d]=getMonday(currentWeekOffset).split("-").map(Number);const mon=new Date(y,m-1,d);const sun=new Date(y,m-1,d+6);return mon.toLocaleDateString("en-US",{month:"short",day:"numeric"})+" – "+sun.toLocaleDateString("en-US",{month:"short",day:"numeric"});})()}
                  </div>
                  <button onClick={()=>{setCurrentWeekOffset(w=>w+1);setLiveShifts(null);setSchedPublished(false);}} style={{padding:"8px 12px",background:"#fff",border:"1px solid "+O.border,borderRadius:8,fontFamily:O.sans,fontSize:13,cursor:"pointer",color:O.textD}}>Next  to </button>
                </>}
                {!mobile&&schedViewMode==="week"&&(
                  <button onClick={()=>{
                    const printW=window.open("","_blank","width=900,height=600");
                    const DAYS_FULL=["Mon","Tue","Wed","Thu","Fri","Sat","Sun"];
                    const fmtH2=h=>h===0?"12a":h<12?h+"a":h===12?"12p":(h-12)+"p";
                    const rows=(liveEmps||[]).map(emp=>{
                      const dayHtml=DAYS_FULL.map(d=>{const shifts=(liveShifts||[]).filter(s=>s.user_id===emp.id&&s.day_of_week===d);return`<td style="border:1px solid #ddd;padding:6px;font-size:11px;vertical-align:top">${shifts.map(s=>`<div>${fmtH2(s.start_hour)}-${fmtH2(s.end_hour)}</div>`).join("")||""}</td>`;}).join("");
                      return`<tr><td style="border:1px solid #ddd;padding:6px;font-weight:600">${emp.name}</td>${dayHtml}</tr>`;
                    }).join("");
                    printW.document.write(`<html><head><title>Schedule</title><style>body{font-family:Arial,sans-serif;padding:20px}table{border-collapse:collapse;width:100%}th{background:#f5f5f5;padding:6px;border:1px solid #ddd}</style></head><body><h2>Weekly Schedule</h2><table><tr><th>Employee</th>${DAYS_FULL.map(d=>`<th>${d}</th>`).join("")}</tr>${rows}</table></body></html>`);
                    printW.document.close();setTimeout(()=>printW.print(),300);
                  }} style={{padding:"8px 12px",background:"#fff",border:"1px solid "+O.border,borderRadius:8,fontFamily:O.sans,fontSize:12,cursor:"pointer",color:O.textD}}>🖨️ Print</button>
                )}
                {!mobile&&schedViewMode==="week"&&(
                  <button onClick={copyLastWeek} style={{padding:"8px 14px",background:O.bg3,border:"1px solid "+O.border,borderRadius:8,fontFamily:O.sans,fontWeight:600,fontSize:12,color:O.textD,cursor:"pointer"}}>📋 Copy Last Week</button>
                )}
                {liveShifts!==null&&liveShifts.length>0&&!schedPublished&&schedViewMode==="week"&&(
                  <button onClick={()=>publishSchedule(getMonday(currentWeekOffset))} style={{padding:"9px 18px",background:"linear-gradient(135deg,#1a9e6e,#15855c)",border:"none",borderRadius:9,fontFamily:O.sans,fontWeight:700,fontSize:13,color:"#fff",cursor:"pointer",boxShadow:"0 4px 12px rgba(26,158,110,0.3)"}}>📣 Publish</button>
                )}
                {schedPublished&&schedViewMode==="week"&&<div style={{padding:"9px 18px",background:O.greenD,border:"1px solid rgba(26,158,110,0.25)",borderRadius:9,fontFamily:O.mono,fontSize:11,color:O.green,letterSpacing:1}}>✅ PUBLISHED</div>}
              </div>
            </div>

            {liveEmps!==null&&liveEmps.length===0&&(
              <div style={{textAlign:"center",padding:"80px 20px"}}>
                <div style={{fontSize:52,marginBottom:14}}>📅</div>
                <div style={{fontFamily:O.sans,fontWeight:700,fontSize:20,color:O.text,marginBottom:8}}>Add employees before scheduling</div>
                <div style={{fontFamily:O.sans,fontSize:14,color:O.textD,lineHeight:1.7,maxWidth:400,margin:"0 auto 20px"}}>Invite your team from the Staff tab first. Once added, their names appear in the schedule grid.</div>
                <button onClick={()=>setTab("staff")} style={{padding:"11px 24px",background:"linear-gradient(135deg,#7c3aed,#6d28d9)",border:"none",borderRadius:9,fontFamily:O.sans,fontWeight:600,fontSize:13,color:"#fff",cursor:"pointer"}}>Go to Staff  to </button>
              </div>
            )}

            {liveShifts===null&&(
              <div style={{textAlign:"center",padding:"40px 20px",background:"#fff",borderRadius:14,border:"1px solid "+O.border,boxShadow:O.shadow,marginBottom:12}}>
                <div style={{fontSize:36,marginBottom:10}}>📅</div>
                <div style={{fontFamily:O.sans,fontWeight:600,fontSize:15,color:O.text,marginBottom:4}}>Loading schedule…</div>
                <div style={{fontFamily:O.sans,fontSize:12,color:O.textD}}>Fetching shifts for this week from Supabase.</div>
              </div>
            )}

            {liveEmps!==null&&liveEmps.length>0&&liveShifts!==null&&(()=>{
              const STAFF=liveEmps;
              const DAYS_FULL=["Mon","Tue","Wed","Thu","Fri","Sat","Sun"];
              const fmtH2=h=>h===0?"12a":h<12?h+"a":h===12?"12p":(h-12)+"p";

              // ── MONTH VIEW ──
              if(schedViewMode==="month"){
                const now=new Date();
                const year=now.getFullYear(); const month=now.getMonth();
                const firstDay=new Date(year,month,1);
                const daysInMonth=new Date(year,month+1,0).getDate();
                const startDow=(firstDay.getDay()+6)%7; // 0=Mon
                const cells=[];
                for(let i=0;i<startDow;i++) cells.push(null);
                for(let d=1;d<=daysInMonth;d++) cells.push(d);
                while(cells.length%7!==0) cells.push(null);
                return(
                  <div>
                    <div style={{display:"grid",gridTemplateColumns:"repeat(7,1fr)",gap:2,marginBottom:4}}>
                      {["Mon","Tue","Wed","Thu","Fri","Sat","Sun"].map(d=>(
                        <div key={d} style={{fontFamily:O.mono,fontSize:9,color:O.textD,textAlign:"center",padding:"6px 0",fontWeight:600}}>{d}</div>
                      ))}
                    </div>
                    <div style={{display:"grid",gridTemplateColumns:"repeat(7,1fr)",gap:2}}>
                      {cells.map((day,i)=>{
                        if(!day) return <div key={"e"+i} style={{minHeight:80,background:O.bg3,borderRadius:6,opacity:0.3}}/>;
                        const dateStr=`${year}-${String(month+1).padStart(2,"0")}-${String(day).padStart(2,"0")}`;
                        const dayShifts=(liveShifts||[]).filter(s=>s.shift_date===dateStr);
                        const isToday=day===now.getDate()&&month===now.getMonth()&&year===now.getFullYear();
                        return(
                          <div key={day} style={{minHeight:80,background:"#fff",borderRadius:6,padding:"4px",border:"1px solid "+(isToday?O.indigo:O.border),position:"relative"}}>
                            <div style={{fontFamily:O.mono,fontSize:9,fontWeight:isToday?700:400,color:isToday?O.indigo:O.textD,marginBottom:3}}>{day}</div>
                            {dayShifts.slice(0,3).map(sh=>{
                              const emp=STAFF.find(e=>e.id===sh.user_id);
                              return(
                                <div key={sh.id} style={{background:(emp?.color||"#6366f1")+"20",border:"1px solid "+(emp?.color||"#6366f1")+"40",borderRadius:3,padding:"2px 4px",marginBottom:2,fontSize:9,fontFamily:O.mono,color:emp?.color||O.text,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>
                                  {emp?.first||"?"} {fmtH2(sh.start_hour)}-{fmtH2(sh.end_hour)}
                                </div>
                              );
                            })}
                            {dayShifts.length>3&&<div style={{fontFamily:O.mono,fontSize:8,color:O.textF}}>+{dayShifts.length-3} more</div>}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              }

              // ── WEEK VIEW with drag-and-drop ──
              if(mobile){return(<div style={{display:"flex",flexDirection:"column",gap:12}}>{STAFF.map(emp=>{const empShifts=(liveShifts||[]).filter(s=>s.user_id===emp.id);return(<div key={emp.id} style={{background:"#fff",border:"1px solid "+O.border,borderRadius:12,padding:"14px 16px",boxShadow:O.shadow}}><div style={{display:"flex",alignItems:"center",gap:10,marginBottom:empShifts.length>0?12:0}}><div style={{width:36,height:36,borderRadius:"50%",background:emp.color||"#6366f1",display:"flex",alignItems:"center",justifyContent:"center",fontFamily:O.mono,fontWeight:700,fontSize:12,color:"#fff",flexShrink:0}}>{getInitials(emp)}</div><div style={{flex:1}}><div style={{fontFamily:O.sans,fontWeight:700,fontSize:14,color:O.text}}>{emp.name}</div><div style={{fontFamily:O.mono,fontSize:9,color:O.textF}}>{empShifts.length} shift{empShifts.length!==1?"s":""} this week</div></div><button onClick={()=>setSelectedCell({day:"Mon",empId:emp.id,emp,start:9,end:17,roleLabel:""})} style={{padding:"5px 10px",background:O.amberD,border:"1px solid "+O.amberB,borderRadius:6,fontFamily:O.sans,fontWeight:600,fontSize:11,color:O.amber,cursor:"pointer"}}>+ Add</button></div>{empShifts.length>0&&(<div style={{display:"flex",flexWrap:"wrap",gap:6}}>{empShifts.map(sh=>(<div key={sh.id} style={{display:"flex",alignItems:"center",gap:4,padding:"4px 10px",background:emp.color+"18",border:"1px solid "+emp.color+"30",borderRadius:20}}><span style={{fontFamily:O.mono,fontSize:9,color:emp.color,fontWeight:600}}>{sh.day_of_week} {fmtH2(sh.start_hour)}-{fmtH2(sh.end_hour)}</span><button onClick={async()=>removeShift(sh.id,getMonday(currentWeekOffset))} style={{background:"none",border:"none",cursor:"pointer",color:emp.color,fontSize:12,lineHeight:1,opacity:0.5}}>×</button></div>))}</div>)}</div>);})}{(liveShifts||[]).length===0&&<div style={{textAlign:"center",padding:"20px",fontFamily:O.sans,fontSize:13,color:O.textD}}>Tap + Add on any employee to schedule their first shift.</div>}</div>);}

              const grid={};
              DAYS_FULL.forEach(d=>{grid[d]={};STAFF.forEach(e=>{grid[d][e.id]=[];});});
              (liveShifts||[]).forEach(sh=>{
                const d=sh.day_of_week;
                if(grid[d]){
                  if(!grid[d][sh.user_id]) grid[d][sh.user_id]=[];
                  grid[d][sh.user_id].push(sh);
                }
              });

              const handleDrop=(e,targetDay,targetEmpId)=>{
                e.preventDefault();
                if(!dragShift) return;
                const sh=dragShift;
                setDragShift(null);
                // Optimistically update state
                setLiveShifts(prev=>(prev||[]).map(s=>s.id===sh.id?{...s,day_of_week:targetDay,user_id:targetEmpId||s.user_id}:s));
                // Persist to DB
                (async()=>{
                  try{
                    const sb2=await getSB();
                    const {data:{session:ss}}=await sb2.auth.getSession();
                    await fetch("/api/shifts",{
                      method:"POST",
                      headers:{"Content-Type":"application/json",...(ss?.access_token?{"Authorization":"Bearer "+ss.access_token}:{})},
                      body:JSON.stringify({_action:"delete",id:sh.id}),
                    });
                    const [y,m,d]=getMonday(currentWeekOffset).split("-").map(Number);
                    const DAYS_O=["Mon","Tue","Wed","Thu","Fri","Sat","Sun"];
                    const base=new Date(y,m-1,d); base.setDate(base.getDate()+DAYS_O.indexOf(targetDay));
                    const newDate=base.getFullYear()+"-"+String(base.getMonth()+1).padStart(2,"0")+"-"+String(base.getDate()).padStart(2,"0");
                    const res=await fetch("/api/shifts",{
                      method:"POST",
                      headers:{"Content-Type":"application/json",...(ss?.access_token?{"Authorization":"Bearer "+ss.access_token}:{})},
                      body:JSON.stringify({...sh,id:undefined,day_of_week:targetDay,user_id:targetEmpId||sh.user_id,shift_date:newDate}),
                    });
                    if(res.ok){const d2=await res.json();if(d2.shift) setLiveShifts(prev=>(prev||[]).map(s=>s.id===sh.id?{...d2.shift,users:sh.users}:s));}
                  }catch(e2){toast("Move failed, refreshing...","error"); if(ownerProfile?.org_id) loadShifts(ownerProfile.org_id,getMonday(currentWeekOffset),activeLocation?.id||null);}
                })();
              };

              return(
                <div style={{overflowX:"auto"}}>
                  <div style={{display:"grid",gridTemplateColumns:"140px repeat(7,1fr)",gap:3,marginBottom:4,minWidth:780}}>
                    <div style={{fontFamily:O.mono,fontSize:8,color:O.textF,letterSpacing:1,padding:"8px 10px",textTransform:"uppercase"}}>Employee</div>
                    {DAYS_FULL.map(d=>(
                      <div key={d} style={{fontFamily:O.mono,fontSize:9,color:O.textD,letterSpacing:1,padding:"8px",textAlign:"center",background:"#fff",borderRadius:6,fontWeight:600,border:"1px solid "+O.border}}>{d}</div>
                    ))}
                  </div>
                  {STAFF.map(emp=>{
                    const empHrs=(liveShifts||[]).filter(s=>s.user_id===emp.id).reduce((s,sh)=>s+(sh.end_hour-sh.start_hour),0);
                    return(
                      <div key={emp.id} style={{display:"grid",gridTemplateColumns:"140px repeat(7,1fr)",gap:3,marginBottom:3,minWidth:780}}>
                        <div style={{display:"flex",alignItems:"center",gap:8,padding:"6px 4px"}}>
                          <div style={{width:28,height:28,borderRadius:"50%",flexShrink:0,background:emp.color||"#6366f1",display:"flex",alignItems:"center",justifyContent:"center",fontFamily:O.mono,fontSize:10,fontWeight:700,color:"#fff"}}>{getInitials(emp)}</div>
                          <div style={{minWidth:0}}>
                            <div style={{fontFamily:O.sans,fontWeight:600,fontSize:11,color:O.text,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{emp.first||emp.name?.split(" ")[0]||"?"}</div>
                            <div style={{fontFamily:O.mono,fontSize:8,color:empHrs>40?O.red:empHrs>0?O.amber:O.textF}}>{empHrs>0?empHrs+"h":emp.role}</div>
                          </div>
                        </div>
                        {DAYS_FULL.map(day=>{
                          const dayShifts=(grid[day]&&grid[day][emp.id])||[];
                          return(
                            <div key={day}
                              style={{minHeight:52,background:"#fff",borderRadius:6,padding:"3px",position:"relative",cursor:"pointer",border:"1px solid "+O.border,transition:"all 0.1s"}}
                              onMouseEnter={e=>{if(!dragShift) e.currentTarget.style.borderColor=O.amber;else e.currentTarget.style.background="rgba(99,102,241,0.06)";}}
                              onMouseLeave={e=>{e.currentTarget.style.borderColor=O.border;e.currentTarget.style.background="#fff";}}
                              onClick={()=>!dragShift&&setSelectedCell({day,empId:emp.id,emp,start:9,end:17,roleLabel:""})}
                              onDragOver={e=>{e.preventDefault();e.currentTarget.style.background="rgba(99,102,241,0.08)";e.currentTarget.style.borderColor=O.indigo;}}
                              onDragLeave={e=>{e.currentTarget.style.background="#fff";e.currentTarget.style.borderColor=O.border;}}
                              onDrop={e=>{e.currentTarget.style.background="#fff";e.currentTarget.style.borderColor=O.border;handleDrop(e,day,emp.id);}}>
                              {dayShifts.length===0&&<div style={{height:"100%",display:"flex",alignItems:"center",justifyContent:"center",color:O.textF,fontSize:16,opacity:0.3}}>+</div>}
                              {dayShifts.map(sh=>(
                                <div key={sh.id}
                                  draggable
                                  onDragStart={e=>{e.stopPropagation();setDragShift(sh);e.currentTarget.style.opacity="0.4";}}
                                  onDragEnd={e=>{e.currentTarget.style.opacity="1";setDragShift(null);}}
                                  style={{background:emp.color+"22",border:"1px solid "+emp.color+"50",borderRadius:4,padding:"3px 6px",marginBottom:2,display:"flex",alignItems:"center",justifyContent:"space-between",cursor:"grab",userSelect:"none"}}>
                                  <span style={{fontFamily:O.mono,fontSize:8,color:emp.color||O.text,fontWeight:600}}>{fmtH2(sh.start_hour)}–{fmtH2(sh.end_hour)}{sh.role_label?" - "+sh.role_label:""}</span>
                                  <button onClick={async(e2)=>{e2.stopPropagation();await removeShift(sh.id,getMonday(currentWeekOffset));}} style={{background:"none",border:"none",color:"rgba(0,0,0,0.25)",fontSize:11,cursor:"pointer",lineHeight:1,padding:"0 1px",flexShrink:0}}>×</button>
                                </div>
                              ))}
                            </div>
                          );
                        })}
                      </div>
                    );
                  })}
                  {(liveShifts||[]).length===0&&(
                    <div style={{gridColumn:"1/-1",textAlign:"center",padding:"30px",fontFamily:O.sans,fontSize:13,color:O.textD,background:"#fff",borderRadius:10,border:"1px solid "+O.border,marginTop:4}}>Click any cell to add a shift. Drag shifts between days to reschedule.</div>
                  )}
                  {/* Open Shifts row */}
                  <div style={{display:"grid",gridTemplateColumns:"140px repeat(7,1fr)",gap:3,marginTop:6,minWidth:780}}>
                    <div style={{display:"flex",alignItems:"center",padding:"6px 4px"}}>
                      <div style={{fontFamily:O.mono,fontSize:9,color:O.amber,fontWeight:600,letterSpacing:1}}>OPEN SHIFTS</div>
                    </div>
                    {DAYS_FULL.map(day=>{
                      const openShifts=(liveShifts||[]).filter(s=>!s.user_id&&s.day_of_week===day);
                      return(
                        <div key={day} style={{minHeight:44,background:"none",borderRadius:6,padding:"3px",cursor:"pointer",border:"1.5px dashed rgba(224,123,0,0.3)",transition:"border-color 0.15s"}}
                          onMouseEnter={e=>e.currentTarget.style.borderColor=O.amber}
                          onMouseLeave={e=>e.currentTarget.style.borderColor="rgba(224,123,0,0.3)"}
                          onDragOver={e=>{e.preventDefault();e.currentTarget.style.background=O.amberD;}}
                          onDragLeave={e=>e.currentTarget.style.background="none"}
                          onDrop={e=>{e.currentTarget.style.background="none";handleDrop(e,day,null);}}
                          onClick={()=>!dragShift&&setSelectedCell({day,empId:"",start:9,end:17,roleLabel:"",shiftNote:"",isOpenShift:true})}>
                          {openShifts.length===0&&<div style={{height:"100%",display:"flex",alignItems:"center",justifyContent:"center",color:O.amber,fontSize:14,opacity:0.4}}>+</div>}
                          {openShifts.map(sh=>(
                            <div key={sh.id} style={{background:O.amberD,border:"1px solid "+O.amberB,borderRadius:4,padding:"3px 6px",marginBottom:2,display:"flex",alignItems:"center",justifyContent:"space-between"}}>
                              <span style={{fontFamily:O.mono,fontSize:8,color:O.amber,fontWeight:600}}>{fmtH2(sh.start_hour)}–{fmtH2(sh.end_hour)} OPEN</span>
                              <button onClick={async(e2)=>{e2.stopPropagation();await removeShift(sh.id,getMonday(currentWeekOffset));}} style={{background:"none",border:"none",color:O.amber,fontSize:11,cursor:"pointer",lineHeight:1}}>×</button>
                            </div>
                          ))}
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })()}
          </div>
        )}

        {/* ══ PAYROLL TAB ══ */}
        {tab==="roi"&&(
          <div style={{animation:"fadeUp 0.3s ease",paddingBottom:40}}>

            {/* ── QuickBooks Integration Card ── */}
            <div style={{background:"linear-gradient(135deg,#1a5c2e,#2d7a45)",borderRadius:16,padding:"22px 24px",marginBottom:20,position:"relative",overflow:"hidden",boxShadow:"0 4px 20px rgba(26,92,46,0.25)"}}>
              {/* QB logo watermark */}
              <div style={{position:"absolute",right:-10,top:-10,fontSize:80,opacity:0.08,lineHeight:1}}>🏢</div>
              <div style={{position:"absolute",right:20,top:"50%",transform:"translateY(-50%)",opacity:0.06,fontFamily:"'Outfit',sans-serif",fontWeight:900,fontSize:64,color:"#fff",letterSpacing:-2}}>QB</div>
              <div style={{display:"flex",alignItems:"flex-start",justifyContent:"space-between",gap:16}}>
                <div style={{flex:1}}>
                  <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:8}}>
                    <div style={{background:"rgba(255,255,255,0.15)",borderRadius:8,padding:"6px 10px",fontFamily:"'Outfit',sans-serif",fontWeight:900,fontSize:16,color:"#fff",letterSpacing:-0.5}}>QuickBooks</div>
                    <div style={{background:"rgba(255,193,7,0.9)",borderRadius:20,padding:"3px 10px",fontFamily:"'JetBrains Mono',monospace",fontWeight:700,fontSize:9,color:"#1a1a00",letterSpacing:1}}>COMING SOON</div>
                  </div>
                  <div style={{fontFamily:"'Outfit',sans-serif",fontWeight:700,fontSize:17,color:"#fff",marginBottom:6}}>Connect QuickBooks Online</div>
                  <div style={{fontFamily:"'Outfit',sans-serif",fontSize:13,color:"rgba(255,255,255,0.75)",lineHeight:1.6,maxWidth:400}}>
                    Sync payroll automatically — employee hours flow into QB, pay stubs deliver to each employee's document file. W-2s populated before tax season.
                  </div>
                  {/* Feature list */}
                  <div style={{display:"flex",flexWrap:"wrap",gap:8,marginTop:14}}>
                    {["✓ Auto pay stub delivery","✓ W-2 sync by Dec 31","✓ Hours -> QB Payroll","✓ Employee self-service","✓ Oregon tax tables"].map(f=>(
                      <div key={f} style={{background:"rgba(255,255,255,0.12)",borderRadius:20,padding:"4px 10px",fontFamily:"'JetBrains Mono',monospace",fontSize:9,color:"rgba(255,255,255,0.9)",letterSpacing:0.5}}>{f}</div>
                    ))}
                  </div>
                </div>
                <div style={{display:"flex",flexDirection:"column",gap:8,flexShrink:0,alignItems:"flex-end"}}>
                  <button onClick={()=>toast("QuickBooks integration launching soon — we'll notify you when it's ready to connect!","info")} style={{padding:"10px 20px",background:"rgba(255,255,255,0.95)",border:"none",borderRadius:10,fontFamily:"'Outfit',sans-serif",fontWeight:700,fontSize:13,color:"#1a5c2e",cursor:"pointer",boxShadow:"0 2px 12px rgba(0,0,0,0.2)",whiteSpace:"nowrap"}}>
                    🔗 Connect QB
                  </button>
                  <button onClick={()=>toast("You'll be notified when QuickBooks sync is available for your account.","success")} style={{padding:"7px 16px",background:"rgba(255,255,255,0.1)",border:"1px solid rgba(255,255,255,0.25)",borderRadius:8,fontFamily:"'Outfit',sans-serif",fontWeight:600,fontSize:11,color:"rgba(255,255,255,0.85)",cursor:"pointer",whiteSpace:"nowrap"}}>
                    🔔 Notify Me
                  </button>
                </div>
              </div>
              {/* Timeline bar */}
              <div style={{marginTop:18,paddingTop:14,borderTop:"1px solid rgba(255,255,255,0.15)"}}>
                <div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:8,color:"rgba(255,255,255,0.5)",letterSpacing:1,marginBottom:8,textTransform:"uppercase"}}>Integration Roadmap</div>
                <div style={{display:"flex",gap:0,alignItems:"center"}}>
                  {[
                    {label:"OAuth Setup",done:true},
                    {label:"Employee Sync",done:false},
                    {label:"Payroll Export",done:false},
                    {label:"W-2 Auto-Fill",done:false},
                    {label:"Live",done:false},
                  ].map((s,i,arr)=>(
                    <React.Fragment key={s.label}>
                      <div style={{display:"flex",flexDirection:"column",alignItems:"center",gap:4}}>
                        <div style={{width:20,height:20,borderRadius:"50%",background:s.done?"#ffd700":"rgba(255,255,255,0.2)",border:"2px solid "+(s.done?"#ffd700":"rgba(255,255,255,0.3)"),display:"flex",alignItems:"center",justifyContent:"center",fontSize:9}}>{s.done?"✓":""}</div>
                        <div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:7,color:s.done?"#ffd700":"rgba(255,255,255,0.4)",textAlign:"center",whiteSpace:"nowrap"}}>{s.label}</div>
                      </div>
                      {i<arr.length-1&&<div style={{flex:1,height:2,background:s.done?"rgba(255,215,0,0.4)":"rgba(255,255,255,0.15)",margin:"0 4px",marginBottom:16}}/>}
                    </React.Fragment>
                  ))}
                </div>
              </div>
            </div>

            {/* Other integrations teaser */}
            <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:8,marginBottom:20}}>
              {[
                {name:"Gusto",icon:"💼",desc:"Full-service payroll"},
                {name:"ADP",icon:"🏦",desc:"Enterprise payroll"},
                {name:"Square Payroll",icon:"◾",desc:"Small business"},
              ].map(p=>(
                <div key={p.name} style={{background:"#fff",border:"1px solid "+O.border,borderRadius:10,padding:"12px",textAlign:"center",opacity:0.65}}>
                  <div style={{fontSize:20,marginBottom:4}}>{p.icon}</div>
                  <div style={{fontFamily:O.sans,fontWeight:700,fontSize:12,color:O.text}}>{p.name}</div>
                  <div style={{fontFamily:O.sans,fontSize:10,color:O.textD,marginBottom:6}}>{p.desc}</div>
                  <div style={{fontFamily:O.mono,fontSize:8,color:O.textF,background:O.bg3,borderRadius:10,padding:"2px 8px",display:"inline-block",letterSpacing:1}}>PLANNED</div>
                </div>
              ))}
            </div>
            <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:20}}>
              <div>
                <div style={{fontFamily:O.mono,fontSize:8,color:O.green,letterSpacing:"2px",marginBottom:4,textTransform:"uppercase"}}>Payroll Tracking</div>
                <div style={{fontFamily:O.sans,fontWeight:800,fontSize:22,color:O.text}}>Hours & Pay</div>
              </div>
              <div style={{display:"flex",gap:8,alignItems:"center"}}>
                {/* Pay period selector */}
                <select value={payPeriod} onChange={e=>setPayPeriod(e.target.value)}
                  style={{padding:"8px 12px",background:"#fff",border:"1px solid "+O.border,borderRadius:8,fontFamily:O.sans,fontSize:12,color:O.textD,outline:"none",cursor:"pointer"}}>
                  <option value="current">Current 2 weeks</option>
                  <option value="last">Last 2 weeks</option>
                  <option value="month">This month</option>
                </select>
                {livePayroll!==null&&livePayroll.length>0&&(
                  <button onClick={()=>{
                    const byUser={};
                    livePayroll.forEach(ev=>{
                      if(!byUser[ev.user_id]){
                        const empMatch=(liveEmps||[]).find(e=>e.id===ev.user_id);
                        const userFallback=empMatch?{
                          first_name:empMatch.first||empMatch.name.split(" ")[0],
                          last_name:empMatch.name.split(" ").slice(1).join(" "),
                          hourly_rate:empMatch.rate||15,
                          role:empMatch.role||"Employee",
                          avatar_initials:getInitials(empMatch),
                          avatar_color:empMatch.color||"#6366f1",
                        }:null;
                        byUser[ev.user_id]={events:[],user:ev.users||userFallback};
                      }
                      byUser[ev.user_id].events.push(ev);
                    });
                    const wkStart = settingsPay?.weekStart || "Mon";
                    const otThr = parseFloat(settingsPay?.otThreshold) || 40;
                    // QuickBooks Online-friendly columns
                    const rows=["Name,Role,Hourly Rate,Total Hours,Regular Hours,OT Hours,Regular Pay,OT Pay,Total Pay,Issues"];
                    Object.values(byUser).forEach(({events,user})=>{
                      const rate = parseFloat(user?.hourly_rate)||15;
                      // FIX (Bug #1): Per-workweek OT calculation per FLSA + ORS 653.261
                      const calc = calcWeeklyPayroll(events, rate, wkStart, otThr);
                      const issue = calc.openShifts.length > 0
                        ? `${calc.openShifts.length} forgotten clock-out(s) — review`
                        : "";
                      rows.push([
                        (user?.first_name||"")+" "+(user?.last_name||""),
                        user?.role||"",
                        rate.toFixed(2),
                        calc.hrs.toFixed(2),
                        calc.regHrs.toFixed(2),
                        calc.otHrs.toFixed(2),
                        calc.regPay.toFixed(2),
                        calc.otPay.toFixed(2),
                        calc.totalPay.toFixed(2),
                        issue,
                      ].map(v=>String(v).includes(",")?`"${v}"`:v).join(","));
                    });
                    const blob=new Blob([rows.join("\n")],{type:"text/csv"});const url=URL.createObjectURL(blob);const a=document.createElement("a");a.href=url;a.download="payroll-export.csv";a.click();URL.revokeObjectURL(url);
                    toast("Payroll exported ✓", "success");
                  }} style={{display:"flex",alignItems:"center",gap:7,padding:"9px 16px",background:O.greenD,border:"1px solid rgba(26,158,110,0.2)",borderRadius:8,fontFamily:O.mono,fontSize:9,letterSpacing:1,color:O.green,cursor:"pointer"}}>📥 EXPORT CSV</button>
                )}
              </div>
            </div>

            {/* ── PROJECTED PAYROLL WIDGET — always shows when shifts exist ── */}
            {liveShifts!==null&&liveShifts.length>0&&liveEmps!==null&&liveEmps.length>0&&(()=>{
              const DAYS_FULL=["Mon","Tue","Wed","Thu","Fri","Sat","Sun"];
              // Build per-employee projected hours from current week's shifts
              const projByEmp={};
              liveShifts.forEach(sh=>{
                const emp=(liveEmps||[]).find(e=>e.id===sh.user_id);
                if(!emp) return;
                if(!projByEmp[sh.user_id]) projByEmp[sh.user_id]={emp,hrs:0};
                projByEmp[sh.user_id].hrs+=(sh.end_hour-sh.start_hour);
              });
              const rows=Object.values(projByEmp);
              if(rows.length===0) return null;
              const totalHrs=rows.reduce((s,r)=>s+r.hrs,0);
              const totalCost=rows.reduce((s,r)=>{
                const reg=Math.min(r.hrs,40); const ot=Math.max(r.hrs-40,0);
                return s+(reg*r.emp.rate)+(ot*r.emp.rate*1.5);
              },0);
              const avgRate=rows.length>0?rows.reduce((s,r)=>s+r.emp.rate,0)/rows.length:15;
              // Hours per day breakdown
              const hrsPerDay={};
              DAYS_FULL.forEach(d=>{
                hrsPerDay[d]=(liveShifts||[]).filter(s=>s.day_of_week===d).reduce((s,sh)=>s+(sh.end_hour-sh.start_hour),0);
              });
              const maxDayHrs=Math.max(...Object.values(hrsPerDay),1);
              return(
                <div style={{background:"#fff",border:"1px solid "+O.border,borderRadius:16,padding:"22px 24px",marginBottom:20,boxShadow:O.shadow}}>
                  <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:18}}>
                    <div>
                      <div style={{fontFamily:O.mono,fontSize:8,color:O.amber,letterSpacing:"2px",marginBottom:4,textTransform:"uppercase"}}>📊 Schedule Projection</div>
                      <div style={{fontFamily:O.sans,fontWeight:700,fontSize:16,color:O.text}}>Estimated This Week's Payroll</div>
                      <div style={{fontFamily:O.sans,fontSize:12,color:O.textD,marginTop:2}}>Based on published schedule - actual hours may vary</div>
                    </div>
                    <div style={{textAlign:"right"}}>
                      <div style={{fontFamily:O.sans,fontWeight:800,fontSize:32,color:O.green}}>${Math.round(totalCost).toLocaleString()}</div>
                      <div style={{fontFamily:O.mono,fontSize:10,color:O.textD}}>{totalHrs}h - ${avgRate.toFixed(2)}/hr avg</div>
                    </div>
                  </div>

                  {/* Summary stat cards */}
                  <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:10,marginBottom:18}}>
                    {[
                      {l:"Total Hours",v:totalHrs+"h",c:O.indigo,icon:"⏱"},
                      {l:"Est. Labor Cost",v:"$"+Math.round(totalCost).toLocaleString(),c:O.green,icon:"💵"},
                      {l:"Staff Scheduled",v:rows.length+" employee"+(rows.length!==1?"s":""),c:O.amber,icon:"👥"},
                    ].map(s=>(
                      <div key={s.l} style={{background:O.bg3,borderRadius:10,padding:"12px 14px",textAlign:"center"}}>
                        <div style={{fontSize:18,marginBottom:4}}>{s.icon}</div>
                        <div style={{fontFamily:O.sans,fontWeight:800,fontSize:18,color:s.c}}>{s.v}</div>
                        <div style={{fontFamily:O.sans,fontSize:10,color:O.textD,marginTop:2}}>{s.l}</div>
                      </div>
                    ))}
                  </div>

                  {/* Hours per day bar chart */}
                  <div style={{marginBottom:18}}>
                    <div style={{fontFamily:O.mono,fontSize:8,color:O.textF,letterSpacing:"1.5px",marginBottom:8,textTransform:"uppercase"}}>Hours by Day</div>
                    <div style={{display:"flex",gap:6,alignItems:"flex-end",height:60}}>
                      {DAYS_FULL.map(d=>{
                        const h=hrsPerDay[d]||0;
                        const pct=h/maxDayHrs;
                        const isToday=["Sun","Mon","Tue","Wed","Thu","Fri","Sat"][new Date().getDay()]===d;
                        return(
                          <div key={d} style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",gap:3}}>
                            <div style={{fontFamily:O.mono,fontSize:8,color:h>0?O.amber:O.textF}}>{h>0?h+"h":""}</div>
                            <div style={{width:"100%",height:Math.max(pct*48,2)+"px",background:isToday?O.indigo:h>0?O.amber+"60":O.bg3,borderRadius:"3px 3px 0 0",transition:"height 0.3s ease",border:isToday?"1px solid "+O.indigo+"80":"none"}}/>
                            <div style={{fontFamily:O.mono,fontSize:8,color:isToday?O.indigo:O.textD,fontWeight:isToday?700:400}}>{d}</div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Per employee breakdown */}
                  <div>
                    <div style={{fontFamily:O.mono,fontSize:8,color:O.textF,letterSpacing:"1.5px",marginBottom:8,textTransform:"uppercase"}}>Per Employee Estimate</div>
                    {rows.map(({emp,hrs})=>{
                      const reg=Math.min(hrs,40); const ot=Math.max(hrs-40,0);
                      const pay=reg*emp.rate+ot*emp.rate*1.5;
                      return(
                        <div key={emp.id} style={{display:"flex",alignItems:"center",gap:12,padding:"10px 12px",background:O.bg3,borderRadius:9,marginBottom:6}}>
                          <div style={{width:32,height:32,borderRadius:"50%",background:emp.color||"#6366f1",display:"flex",alignItems:"center",justifyContent:"center",fontFamily:O.mono,fontWeight:700,fontSize:11,color:"#fff",flexShrink:0}}>{getInitials(emp)}</div>
                          <div style={{flex:1}}>
                            <div style={{fontFamily:O.sans,fontWeight:600,fontSize:13,color:O.text}}>{emp.name}</div>
                            <div style={{fontFamily:O.mono,fontSize:9,color:O.textD}}>{emp.role} - ${emp.rate}/hr{ot>0?" - "+ot+"h OT":""}</div>
                          </div>
                          <div style={{textAlign:"right"}}>
                            <div style={{fontFamily:O.sans,fontWeight:700,fontSize:14,color:O.green}}>${Math.round(pay).toLocaleString()}</div>
                            <div style={{fontFamily:O.mono,fontSize:9,color:O.textD}}>{hrs}h est.</div>
                          </div>
                          {/* Mini hours bar */}
                          <div style={{width:60,height:6,background:O.border,borderRadius:3,overflow:"hidden",flexShrink:0}}>
                            <div style={{width:Math.min(hrs/40*100,100)+"%",height:"100%",background:ot>0?O.red:O.green,borderRadius:3}}/>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <div style={{marginTop:12,padding:"8px 12px",background:O.amberD,border:"1px solid "+O.amberB,borderRadius:8,display:"flex",alignItems:"center",gap:8}}>
                    <span style={{fontSize:14}}>💡</span>
                    <span style={{fontFamily:O.sans,fontSize:12,color:O.amber}}>Actual payroll populates below as employees clock in. Export CSV anytime.</span>
                  </div>
                </div>
              );
            })()}

            {livePayroll===null&&(
              <div style={{textAlign:"center",padding:"60px 20px",background:"#fff",borderRadius:14,border:"1px solid "+O.border,boxShadow:O.shadow}}>
                <div style={{fontSize:48,marginBottom:12}}>⏳</div>
                <div style={{fontFamily:O.sans,fontWeight:700,fontSize:18,color:O.text,marginBottom:6}}>Loading payroll data…</div>
                <div style={{fontFamily:O.sans,fontSize:13,color:O.textD,lineHeight:1.7,maxWidth:380,margin:"0 auto"}}>
                  Payroll data will appear here as employees clock in and out. If this takes too long, try refreshing the page.
                </div>
              </div>
            )}

            {livePayroll!==null&&livePayroll.length===0&&liveEmps!==null&&liveEmps.length===0&&(
              <div style={{textAlign:"center",padding:"80px 20px"}}>
                <div style={{fontSize:56,marginBottom:14}}>💵</div>
                <div style={{fontFamily:O.sans,fontWeight:700,fontSize:20,color:O.text,marginBottom:8}}>No payroll data yet</div>
                <div style={{fontFamily:O.sans,fontSize:14,color:O.textD,lineHeight:1.7,maxWidth:400,margin:"0 auto 20px"}}>Hours appear here automatically as employees clock in. Invite your team first, then publish a schedule.</div>
                <button onClick={()=>setTab("staff")} style={{padding:"11px 24px",background:O.greenD,border:"1px solid rgba(26,158,110,0.2)",borderRadius:9,fontFamily:O.sans,fontWeight:600,fontSize:13,color:O.green,cursor:"pointer"}}>Go to Staff  to </button>
              </div>
            )}

            {livePayroll!==null&&livePayroll.length===0&&liveEmps!==null&&liveEmps.length>0&&(
              <div style={{textAlign:"center",padding:"80px 20px"}}>
                <div style={{fontSize:56,marginBottom:14}}>⏱</div>
                <div style={{fontFamily:O.sans,fontWeight:700,fontSize:20,color:O.text,marginBottom:8}}>No clock events yet</div>
                <div style={{fontFamily:O.sans,fontSize:14,color:O.textD,lineHeight:1.7,maxWidth:400,margin:"0 auto 20px"}}>Hours appear as employees clock in via their Work Hub. Publish a schedule so they know when to work.</div>
                <button onClick={()=>setTab("schedule")} style={{padding:"11px 24px",background:O.amberD,border:"1px solid "+O.amberB,borderRadius:9,fontFamily:O.sans,fontWeight:600,fontSize:13,color:O.amber,cursor:"pointer"}}>Build Schedule  to </button>
              </div>
            )}

            {livePayroll!==null&&livePayroll.length>0&&(()=>{
              const byUser={};
              livePayroll.forEach(ev=>{
                if(!byUser[ev.user_id]){
                  const empMatch=(liveEmps||[]).find(e=>e.id===ev.user_id);
                  const userFallback=empMatch?{
                    first_name:empMatch.first||empMatch.name.split(" ")[0],
                    last_name:empMatch.name.split(" ").slice(1).join(" "),
                    hourly_rate:empMatch.rate||15,
                    role:empMatch.role||"Employee",
                    avatar_initials:getInitials(empMatch),
                    avatar_color:empMatch.color||"#6366f1",
                  }:null;
                  byUser[ev.user_id]={events:[],user:ev.users||userFallback};
                }
                byUser[ev.user_id].events.push(ev);
              });
              const wkStart = settingsPay?.weekStart || "Mon";
              const otThr = parseFloat(settingsPay?.otThreshold) || 40;
              const payRows=Object.entries(byUser).map(([uid,{events,user}])=>{
                const rate=parseFloat(user?.hourly_rate)||15;
                // FIX (Bug #1): Per-workweek OT per FLSA + ORS 653.261
                const calc = calcWeeklyPayroll(events, rate, wkStart, otThr);
                const hrs = Math.round(calc.hrs * 100) / 100;
                const regHrs = Math.round(calc.regHrs * 100) / 100;
                const otHrs = Math.round(calc.otHrs * 100) / 100;
                return {
                  uid,
                  name:(user?.first_name||"")+" "+(user?.last_name||""),
                  avatar:((user?.first_name&&user?.last_name)?((user.first_name[0]+user.last_name[0]).toUpperCase()):(user?.first_name||"").slice(0,2).toUpperCase()||"??"),
                  color:(user?.avatar_color)||"#6366f1",
                  role:user?.role||"",
                  rate, hrs, regHrs, otHrs,
                  totalPay: calc.totalPay,
                  weeks: calc.weeks,
                  openShifts: calc.openShifts,
                };
              }).filter(r=>r.hrs>0||r.openShifts.length>0).sort((a,b)=>b.totalPay-a.totalPay);

              const totalLabor=payRows.reduce((s,r)=>s+r.totalPay,0);
              const totalHrs=payRows.reduce((s,r)=>s+r.hrs,0);
              const maxHrs=Math.max(...payRows.map(r=>r.hrs),1);
              // Collect employees with forgotten clock-outs for warning banner
              const employeesWithIssues = payRows.filter(r=>r.openShifts.length>0);

              return (
                <div>
                  {/* WARNING: Forgotten clock-outs (Bug #4 surfaced in UI) */}
                  {employeesWithIssues.length>0 && (
                    <div style={{background:"#fff8e6",border:"1px solid "+O.amberB,borderRadius:12,padding:"14px 18px",marginBottom:16,display:"flex",alignItems:"flex-start",gap:12}}>
                      <span style={{fontSize:20,flexShrink:0,marginTop:1}}>⚠️</span>
                      <div style={{flex:1,minWidth:0}}>
                        <div style={{fontFamily:O.sans,fontWeight:700,fontSize:13.5,color:O.text,marginBottom:4}}>
                          {employeesWithIssues.length} employee{employeesWithIssues.length===1?"":"s"} {employeesWithIssues.length===1?"has":"have"} forgotten clock-out{employeesWithIssues.reduce((s,r)=>s+r.openShifts.length,0)===1?"":"s"} — review before exporting
                        </div>
                        <div style={{fontFamily:O.sans,fontSize:12,color:O.textD,lineHeight:1.55}}>
                          The hours below <strong>do not include</strong> these unfinished shifts. Add a clock-out manually or these hours won't be paid.
                        </div>
                        <ul style={{margin:"8px 0 0",paddingLeft:18,fontFamily:O.mono,fontSize:11,color:O.textD,lineHeight:1.7}}>
                          {employeesWithIssues.map(r=>(
                            <li key={r.uid}>
                              <strong style={{color:O.text}}>{r.name}</strong> — {r.openShifts.map(s=>{
                                if(s.hoursAgo!==undefined) return `clocked in ${s.hoursAgo}h ago, no clock-out`;
                                return `started new shift without clocking out at ${new Date(s.clockedInAt).toLocaleString()}`;
                              }).join("; ")}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  )}

                  <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:12,marginBottom:20}}>
                    <StatCard label="Total Hours" value={totalHrs.toFixed(1)+"h"} color={O.amber} icon="⏱"/>
                    <StatCard label="Employees" value={payRows.length} color={O.purple} icon="👥"/>
                    <StatCard label="Total Labor Cost" value={"$"+totalLabor.toFixed(2)} color={O.green} icon="💵"/>
                  </div>

                  {/* Bar chart */}
                  <div style={{background:"#fff",border:"1px solid "+O.border,borderRadius:14,padding:"18px",marginBottom:16,boxShadow:O.shadow}}>
                    <div style={{fontFamily:O.sans,fontWeight:700,fontSize:14,color:O.text,marginBottom:14}}>Hours by Employee</div>
                    <div style={{display:"flex",flexDirection:"column",gap:10}}>
                      {payRows.map(r=>(
                        <div key={r.uid} style={{display:"flex",alignItems:"center",gap:12}}>
                          <div style={{fontFamily:O.sans,fontSize:12,color:O.textD,width:120,flexShrink:0,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{r.name.split(" ")[0]}</div>
                          <div style={{flex:1,height:24,background:O.bg3,borderRadius:6,overflow:"hidden",position:"relative"}}>
                            <div style={{height:"100%",width:(r.hrs/maxHrs*100)+"%",background:r.otHrs>0?"linear-gradient(90deg,"+O.amber+","+O.red+")":"linear-gradient(90deg,#0891b2,#0e7490)",borderRadius:6,transition:"width 0.8s ease",minWidth:4}}/>
                            <span style={{position:"absolute",right:8,top:"50%",transform:"translateY(-50%)",fontFamily:O.mono,fontSize:9,color:O.textD,fontWeight:600}}>{r.hrs.toFixed(1)}h</span>
                          </div>
                          {r.otHrs>0&&<span style={{fontFamily:O.mono,fontSize:9,color:O.red,flexShrink:0}}>+{r.otHrs.toFixed(1)}h OT</span>}
                        </div>
                      ))}
                    </div>
                  </div>

                  <div style={{display:"flex",flexDirection:"column",gap:8}}>
                    {payRows.map(r=>(
                      <div key={r.uid} style={{background:"#fff",border:"1px solid "+(r.otHrs>0?"rgba(217,64,64,0.2)":O.border),borderRadius:12,padding:"16px 18px",display:"flex",alignItems:"center",gap:14,boxShadow:O.shadow}}>
                        <div style={{width:40,height:40,borderRadius:"50%",flexShrink:0,background:r.color,display:"flex",alignItems:"center",justifyContent:"center",fontFamily:O.mono,fontWeight:700,fontSize:13,color:"#fff"}}>{r.avatar}</div>
                        <div style={{flex:1}}>
                          <div style={{fontFamily:O.sans,fontWeight:700,fontSize:14,color:O.text,marginBottom:2}}>{r.name}</div>
                          <div style={{fontFamily:O.sans,fontSize:11,color:O.textD}}>{r.role} - ${r.rate}/hr</div>
                        </div>
                        <div style={{textAlign:"right",flexShrink:0}}>
                          <div style={{fontFamily:O.mono,fontSize:12,color:r.otHrs>0?O.red:O.amber,fontWeight:600,marginBottom:2}}>{r.hrs.toFixed(2)}h {r.otHrs>0&&<span style={{fontSize:10}}>({r.otHrs.toFixed(1)}h OT)</span>}</div>
                          <div style={{fontFamily:O.mono,fontSize:8,color:O.textF,letterSpacing:1,textTransform:"uppercase"}}>Total Hours</div>
                        </div>
                        <div style={{textAlign:"right",flexShrink:0,minWidth:90}}>
                          <div style={{fontFamily:O.mono,fontSize:16,color:O.green,fontWeight:700}}>${r.totalPay.toFixed(2)}</div>
                          <div style={{fontFamily:O.mono,fontSize:8,color:O.textF,letterSpacing:1,textTransform:"uppercase"}}>Gross Pay</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })()}
          </div>
        )}

        {/* ══ SETTINGS TAB ══ */}
        {tab==="settings"&&(
          <SettingsTab
            ownerProfile={ownerProfile}
            activeOrg={activeOrg}
            liveLocations={liveLocations}
            setLiveLocations={setLiveLocations}
            activeLocation={activeLocation}
            selectLocation={selectLocation}
            setLocationGate={setLocationGate}
            settingsProfile={settingsProfile}
            setSettingsProfile={setSettingsProfile}
            settingsPay={settingsPay}
            setSettingsPay={setSettingsPay}
            settingsDepts={settingsDepts}
            setSettingsDepts={setSettingsDepts}
            settingsNewDept={settingsNewDept}
            setSettingsNewDept={setSettingsNewDept}
            settingsAddingDept={settingsAddingDept}
            setSettingsAddingDept={setSettingsAddingDept}
            settingsSaveBusy={settingsSaveBusy}
            setSettingsSaveBusy={setSettingsSaveBusy}
            settingsShowPwChange={settingsShowPwChange}
            setSettingsShowPwChange={setSettingsShowPwChange}
            settingsPw1={settingsPw1}
            setSettingsPw1={setSettingsPw1}
            settingsPw2={settingsPw2}
            setSettingsPw2={setSettingsPw2}
            settingsPwMsg={settingsPwMsg}
            setSettingsPwMsg={setSettingsPwMsg}
            settingsPwBusy={settingsPwBusy}
            setSettingsPwBusy={setSettingsPwBusy}
            toast={toast}
            onLogout={onLogout}
          />
        )}

        {/* ══ INTELLIGENCE TAB ══ */}
        {tab==="intel"&&(
          <div style={{animation:"fadeUp 0.3s ease"}}>
            <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:24}}>
              <span style={{fontSize:32}}>🧠</span>
              <div>
                <div style={{fontFamily:O.mono,fontSize:8,color:O.purple,letterSpacing:"2.5px",marginBottom:3,textTransform:"uppercase"}}>AI Intelligence - Coming Soon</div>
                <div style={{fontFamily:O.sans,fontWeight:700,fontSize:22,color:O.text}}>ShiftPro Intelligence Platform</div>
              </div>
            </div>
            <div style={{display:"grid",gridTemplateColumns:mobile?"1fr":"1fr 1fr",gap:16}}>

              {/* What's Coming card */}
              <div style={{background:"#fff",border:"1px solid "+O.border,borderRadius:16,padding:"24px",boxShadow:O.shadow}}>
                <div style={{fontFamily:O.mono,fontSize:8,color:O.purple,letterSpacing:"2px",marginBottom:6,textTransform:"uppercase"}}>Heavy Plan - Corporate Plan</div>
                <div style={{fontFamily:O.sans,fontWeight:700,fontSize:18,color:O.text,marginBottom:4}}>What's Coming</div>
                <div style={{fontFamily:O.sans,fontSize:13,color:O.textD,marginBottom:20,lineHeight:1.6}}>
                  The AI brain behind ShiftPro — behavioral pattern detection, predictive scheduling, and labor intelligence that no other platform offers.
                </div>
                <div style={{display:"flex",flexDirection:"column",gap:10,marginBottom:20}}>
                  {[
                    "AI scheduling assistant — build a week in plain English",
                    "Behavioral pattern detection & ghost hour forensics",
                    "Predictive labor cost forecasting",
                    "Overtime risk alerts before they happen",
                    "Employee morale trend analysis",
                    "Auto-scheduler based on availability + history",
                    "Shift feedback & retention intelligence",
                    "Live camera cross-reference (requires Camera plan)"
                  ].map((f,i)=>(
                    <div key={i} style={{display:"flex",alignItems:"center",gap:10}}>
                      <span style={{fontSize:14}}>🔒</span>
                      <span style={{fontFamily:O.mono,fontSize:11,color:O.textD}}>{f}</span>
                    </div>
                  ))}
                </div>
                <div style={{display:"inline-flex",alignItems:"center",gap:8,fontFamily:O.mono,fontSize:9,color:O.purple,letterSpacing:"2px",background:"rgba(124,58,237,0.08)",border:"1px solid rgba(124,58,237,0.2)",borderRadius:20,padding:"5px 14px"}}>
                  <div style={{width:6,height:6,borderRadius:"50%",background:O.purple}}/> LAUNCHING Q1 2027
                </div>
              </div>

              {/* Waitlist card */}
              <div style={{background:"#fff",border:"1px solid "+O.border,borderRadius:16,padding:"24px",boxShadow:O.shadow}}>
                {waitlistDone?(
                  <div style={{textAlign:"center",padding:"40px 20px"}}>
                    <div style={{fontSize:44,marginBottom:12}}>🎉</div>
                    <div style={{fontFamily:O.sans,fontWeight:700,fontSize:18,color:O.text,marginBottom:8}}>You're on the list!</div>
                    <div style={{fontFamily:O.sans,fontSize:13,color:O.textD,lineHeight:1.7}}>We'll notify you when Intelligence launches. Current ShiftPro customers get priority access and early-bird pricing.</div>
                  </div>
                ):(
                  <div>
                    <div style={{fontFamily:O.mono,fontSize:8,color:O.amber,letterSpacing:"2px",marginBottom:6,textTransform:"uppercase"}}>Join the Waitlist</div>
                    <div style={{fontFamily:O.sans,fontWeight:700,fontSize:18,color:O.text,marginBottom:4}}>Get Early Access</div>
                    <div style={{fontFamily:O.sans,fontSize:13,color:O.textD,marginBottom:20,lineHeight:1.6}}>
                      Current ShiftPro customers get priority access and early-bird pricing when Intelligence launches.
                    </div>
                    <div style={{display:"flex",flexDirection:"column",gap:10,marginBottom:16}}>
                      {[
                        {l:"Your Name",k:"name",ph:"Alex Rivera"},
                        {l:"Email",k:"email",ph:"you@business.com"},
                        {l:"Business Name",k:"biz",ph:"Sea Lion Dockside Bar"}
                      ].map(f=>(
                        <div key={f.k}>
                          <div style={{fontFamily:O.mono,fontSize:8,color:O.textF,letterSpacing:"1.5px",marginBottom:5,textTransform:"uppercase"}}>{f.l}</div>
                          <input
                            value={waitlistForm[f.k]}
                            onChange={e=>setWaitlistForm(p=>({...p,[f.k]:e.target.value}))}
                            placeholder={f.ph}
                            style={{width:"100%",padding:"9px 12px",background:O.bg3,border:"1px solid "+O.border,borderRadius:7,fontFamily:O.sans,fontSize:13,color:O.text,outline:"none",boxSizing:"border-box"}}
                          />
                        </div>
                      ))}
                    </div>
                    <button
                      onClick={()=>{ if(waitlistForm.name&&waitlistForm.email){ setWaitlistDone(true); toast("You're on the Intelligence waitlist! ✓","success"); }}}
                      style={{width:"100%",padding:"12px",background:"linear-gradient(135deg,#7c3aed,#6d28d9)",border:"none",borderRadius:9,fontFamily:O.sans,fontWeight:700,fontSize:14,color:"#fff",cursor:"pointer",boxShadow:"0 4px 16px rgba(124,58,237,0.25)"}}>
                      Join Waitlist  to 
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ══ CAMERAS TAB ══ */}
        {tab==="cameras"&&(
          <div style={{animation:"fadeUp 0.3s ease"}}>
            <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:24}}>
              <span style={{fontSize:32}}>📷</span>
              <div>
                <div style={{fontFamily:O.mono,fontSize:8,color:O.cyan,letterSpacing:"2.5px",marginBottom:3,textTransform:"uppercase"}}>Camera Intelligence</div>
                <div style={{fontFamily:O.sans,fontWeight:700,fontSize:22,color:O.text}}>AI-Powered Camera Integration</div>
              </div>
            </div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16}}>
              <div style={{background:"#fff",border:"1px solid "+O.border,borderRadius:16,padding:"24px",boxShadow:O.shadow}}>
                <div style={{fontFamily:O.mono,fontSize:8,color:O.cyan,letterSpacing:"2px",marginBottom:6,textTransform:"uppercase"}}>Heavy Plan - Corporate Plan</div>
                <div style={{fontFamily:O.sans,fontWeight:700,fontSize:18,color:O.text,marginBottom:4}}>What's Coming</div>
                <div style={{fontFamily:O.sans,fontSize:13,color:O.textD,marginBottom:20,lineHeight:1.6}}>Full camera-to-payroll intelligence — the feature that makes ShiftPro unlike anything else on the market.</div>
                <div style={{display:"flex",flexDirection:"column",gap:10,marginBottom:20}}>
                  {["Live RTSP camera feeds — all locations","Employee presence verification","Ghost hour cross-reference","Motion detection + incident alerts","Multi-location camera command center","Silent owner-only alerts","7-day / 30-day clip storage"].map((f,i)=>(
                    <div key={i} style={{display:"flex",alignItems:"center",gap:10}}>
                      <span style={{fontSize:14}}>🔒</span>
                      <span style={{fontFamily:O.mono,fontSize:11,color:O.textD}}>{f}</span>
                    </div>
                  ))}
                </div>
                <div style={{display:"inline-flex",alignItems:"center",gap:8,fontFamily:O.mono,fontSize:9,color:O.cyan,letterSpacing:"2px",background:"rgba(8,145,178,0.08)",border:"1px solid rgba(8,145,178,0.2)",borderRadius:20,padding:"5px 14px"}}>
                  <div style={{width:6,height:6,borderRadius:"50%",background:O.cyan}}/> LAUNCHING Q1 2027
                </div>
              </div>
              <div style={{background:"#fff",border:"1px solid "+O.border,borderRadius:16,padding:"24px",boxShadow:O.shadow}}>
                {waitlistDone?(
                  <div style={{textAlign:"center",padding:"40px 20px"}}>
                    <div style={{fontSize:44,marginBottom:12}}>🎉</div>
                    <div style={{fontFamily:O.sans,fontWeight:700,fontSize:18,color:O.text,marginBottom:8}}>You're on the list!</div>
                    <div style={{fontFamily:O.sans,fontSize:13,color:O.textD,lineHeight:1.7}}>We'll notify you when Camera Intelligence launches.</div>
                  </div>
                ):(
                  <div>
                    <div style={{fontFamily:O.mono,fontSize:8,color:O.amber,letterSpacing:"2px",marginBottom:6,textTransform:"uppercase"}}>Join the Waitlist</div>
                    <div style={{fontFamily:O.sans,fontWeight:700,fontSize:18,color:O.text,marginBottom:4}}>Get Early Access</div>
                    <div style={{fontFamily:O.sans,fontSize:13,color:O.textD,marginBottom:20,lineHeight:1.6}}>Current ShiftPro customers get priority access and early-bird pricing.</div>
                    <div style={{display:"flex",flexDirection:"column",gap:10,marginBottom:16}}>
                      {[{l:"Your Name",k:"name",ph:"Alex Rivera"},{l:"Email",k:"email",ph:"you@business.com"},{l:"Business Name",k:"biz",ph:"Sea Lion Dockside Bar"}].map(f=>(
                        <div key={f.k}>
                          <div style={{fontFamily:O.mono,fontSize:8,color:O.textF,letterSpacing:"1.5px",marginBottom:5,textTransform:"uppercase"}}>{f.l}</div>
                          <input value={waitlistForm[f.k]} onChange={e=>setWaitlistForm(p=>({...p,[f.k]:e.target.value}))} placeholder={f.ph}
                            style={{width:"100%",padding:"9px 12px",background:O.bg3,border:"1px solid "+O.border,borderRadius:7,fontFamily:O.sans,fontSize:13,color:O.text,outline:"none",boxSizing:"border-box"}}/>
                        </div>
                      ))}
                    </div>
                    <button onClick={()=>{if(waitlistForm.name&&waitlistForm.email){setWaitlistDone(true);toast("You're on the waitlist! ✓","success");}}}
                      style={{width:"100%",padding:"12px",background:"linear-gradient(135deg,#e07b00,#c96800)",border:"none",borderRadius:9,fontFamily:O.sans,fontWeight:700,fontSize:14,color:"#fff",cursor:"pointer",boxShadow:"0 4px 16px rgba(224,123,0,0.25)"}}>
                      Join Waitlist  to 
                    </button>
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
  const [session,setSession]       = useState(null);
  const [appLoading,setAppLoading] = useState(true);
  const [resetMode,setResetMode]   = useState(false);
  const [newPw,setNewPw]           = useState("");
  const [newPw2,setNewPw2]         = useState("");
  const [pwErr,setPwErr]           = useState("");
  const [pwBusy,setPwBusy]         = useState(false);
  const [pwDone,setPwDone]         = useState(false);

  const login = (role,emp) => {
    setSession({role,emp});
    // Cache for session restoration on reload
    try{ if(emp?.id) localStorage.setItem("shiftpro_cached_emp_"+emp.id, JSON.stringify(emp)); }catch(e){}
  };
  const logout = async() => {
    try{const sb=await getSB();await sb.auth.signOut();}catch(e){}
    // Clear active tab so next login always lands on Command
    try{ localStorage.removeItem("shiftpro_active_tab"); }catch(e){}
    setSession(null);
  };

  useEffect(()=>{
    const init = async() => {
      try{
        // Check for invite/reset link first
        if(typeof window!=="undefined"){
          const hash=window.location.hash;
          if(hash.includes("error=access_denied")||hash.includes("otp_expired")){
            window.location.hash="";
            setResetMode(true);
            setPwErr("Your invite link has expired. Ask your manager to resend your invite from the Staff tab.");
            setAppLoading(false);
            return;
          }
          if(hash.includes("access_token")&&(hash.includes("type=recovery")||hash.includes("type=invite"))){
            // Extract token from hash and establish a real session
            // Without this, updateUser("password") fails with "Auth session missing"
            try{
              const sb=await getSB();
              // Normalize double-hash URLs (e.g. #type=recovery#access_token=...)
              const normalized = hash.replace(/#/g, "&").replace("&","?");
              const params = new URLSearchParams(normalized.includes("?") ? normalized.split("?")[1] : normalized.replace(/^&/,""));
              const accessToken = params.get("access_token");
              const refreshToken = params.get("refresh_token");
              if(accessToken){
                await sb.auth.setSession({
                  access_token: accessToken,
                  refresh_token: refreshToken || accessToken,
                });
              }
            }catch(e){}
            setResetMode(true);setAppLoading(false);return;
          }
        }
        const sb=await getSB();

        // Step 1: Get Supabase session — this uses the stored JWT token
        const {data:{session:existing}} = await sb.auth.getSession();

        if(!existing?.user){
          // No valid session at all — must log in
          setAppLoading(false);
          return;
        }

        const userId = existing.user.id;
        const userEmail = existing.user.email||"";

        // Step 2: Try to load profile from Supabase
        let profile = null;
        try{
          const {data:p} = await sb.from("users").select("*").eq("id",userId).single();
          profile = p;
        }catch(e){}

        // Step 3: Try localStorage cache as fallback
        let cachedEmp = null;
        try{
          const raw = localStorage.getItem("shiftpro_cached_emp_"+userId);
          if(raw) cachedEmp = JSON.parse(raw);
        }catch(e){}

        // Step 4: Build emp — profile wins, cache fills gaps, session fills rest
        // We ALWAYS have a valid session so we ALWAYS restore it
        const role = profile?.app_role==="owner"||profile?.app_role==="manager"?"owner"
                   : cachedEmp?.appRole==="owner"||cachedEmp?.appRole==="manager"?"owner"
                   : "employee";

        const emp = {
          id: userId,
          name: profile?(profile.first_name+" "+profile.last_name).trim()
                : cachedEmp?.name||userEmail.split("@")[0],
          first: profile?.first_name||cachedEmp?.first||userEmail.split("@")[0]||"there",
          nick: profile?.preferred_name||cachedEmp?.nick||"",
          role: (profile?.role&&profile.role!=="Employee"?profile.role:null)||cachedEmp?.role||"",
          dept: profile?.department||cachedEmp?.dept||"",
          rate: parseFloat(profile?.hourly_rate||cachedEmp?.rate)||15,
          avatar: (profile?.first_name&&profile?.last_name?(profile.first_name[0]+profile.last_name[0]).toUpperCase():profile?.first_name?profile.first_name.slice(0,2).toUpperCase():userEmail.split("@")[0].slice(0,2).toUpperCase()),
          color: profile?.avatar_color||cachedEmp?.color||"#6366f1",
          email: userEmail,
          status:"active",
          hired: profile?.hire_date||cachedEmp?.hired||"",
          phone: profile?.phone||cachedEmp?.phone||"",
          emergency: profile?.emergency_contact||cachedEmp?.emergency||"",
          wkHrs:0, moHrs:0, ot:0, cam:100, prod:100, rel:100,
          flags:0, streak:0, shifts:0, risk:"Low", ghost:0,
          orgId: profile?.org_id||cachedEmp?.orgId||localStorage.getItem("shiftpro_active_orgid")||null,
          locId: profile?.location_id||cachedEmp?.locId||null,
          appRole: profile?.app_role||cachedEmp?.appRole||"employee",
        };

        // Step 5: Always cache latest emp data
        try{ localStorage.setItem("shiftpro_cached_emp_"+userId, JSON.stringify(emp)); }catch(e){}

        setSession({role,emp});
      }catch(e){
        // silent fail — user sees login if session is invalid
      }
      setAppLoading(false);
    };
    init();
  },[]);

  const handleSetPassword = async() => {
    if(!newPw||!newPw2){setPwErr("Please enter and confirm your password.");return;}
    if(newPw!==newPw2){setPwErr("Passwords do not match.");return;}
    if(newPw.length<8){setPwErr("Password must be at least 8 characters.");return;}
    setPwBusy(true);setPwErr("");
    try{
      const sb=await getSB();
      // Update password
      const {error}=await sb.auth.updateUser({password:newPw});
      if(error) throw error;
      // Mark user as active via service role (anon client blocked by RLS)
      try{
        const {data:{session:s2}}=await sb.auth.getSession();
        if(s2?.user?.id){
          await fetch("/api/user",{
            method:"PATCH",
            headers:{"Content-Type":"application/json",...(s2?.access_token?{"Authorization":"Bearer "+s2.access_token}:{})},
            body:JSON.stringify({userId:s2.user.id, updates:{status:"active"}}),
          });
        }
      }catch(e){}
      setPwDone(true);
      setTimeout(async()=>{
        const {data:{session:s}}=await sb.auth.getSession();
        if(s?.user){
          // Try to get their profile (may not exist yet for brand new invites)
          let profile=null;
          try{ const {data:p}=await sb.from("users").select("*").eq("id",s.user.id).single(); profile=p; }catch(e){}
          
          // Determine role — new invites default to employee
          const role=(profile?.app_role==="owner"||profile?.app_role==="manager")?"owner":"employee";
          
          const emp={
            id:profile?.id||s.user.id,
            name:(profile?.first_name||(s.user.user_metadata?.first_name)||"New")+" "+(profile?.last_name||(s.user.user_metadata?.last_name)||"Employee"),
            first:profile?.first_name||s.user.user_metadata?.first_name||s.user.email?.split("@")[0]||"there",
            role:profile?.role||"Employee",
            dept:profile?.department||s.user.user_metadata?.department||"",
            rate:parseFloat(profile?.hourly_rate||s.user.user_metadata?.hourly_rate)||15,
            avatar:(profile?.first_name&&profile?.last_name?(profile.first_name[0]+profile.last_name[0]).toUpperCase():(s.user.email||'').split('@')[0].slice(0,2).toUpperCase()||'??'),
            color:profile?.avatar_color||"#6366f1",
            email:s.user.email||"",
            status:"active",
            hired:profile?.hire_date||"",
            wkHrs:0, moHrs:0, ot:0,
            cam:100, prod:100, rel:100,
            flags:0, streak:0, shifts:0,
            risk:"Low", ghost:0,
            orgId:profile?.org_id||s.user.user_metadata?.org_id||null,
            locId:profile?.location_id||s.user.user_metadata?.location_id||null,
            appRole:profile?.app_role||"employee",
          };
          // Cache so refresh works
          try{ localStorage.setItem("shiftpro_cached_emp_"+emp.id, JSON.stringify(emp)); }catch(e){}
          if(typeof window!=="undefined") window.location.hash="";
          setResetMode(false);
          login(role,emp);
        }
      },800);
    }catch(e){setPwErr(e.message||"Failed to set password.");}
    finally{setPwBusy(false);}
  };

  if(appLoading) return(
    <div style={{minHeight:"100vh",background:"#f9f8f6",display:"flex",alignItems:"center",justifyContent:"center",flexDirection:"column",gap:20}}>
      <NavLogoWarm/>
      <div style={{display:"flex",flexDirection:"column",gap:8,width:200}}>
        {[80,65,75].map((w,i)=>(<div key={i} className="skeleton" style={{height:12,width:w+"%"}}/>))}
      </div>
    </div>
  );

  if(resetMode) return(
    <>
      <style>{FONTS}{GCSS}</style>
      <div style={{minHeight:"100vh",background:"linear-gradient(135deg,#0f0c29,#302b63,#24243e)",display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"'Outfit',sans-serif",padding:"20px",position:"relative"}}>
        <div style={{position:"absolute",inset:0,backgroundImage:"radial-gradient(rgba(99,102,241,0.13) 1px,transparent 1px)",backgroundSize:"32px 32px",pointerEvents:"none"}}/>
        <div style={{position:"relative",width:"100%",maxWidth:420,animation:"fadeUp 0.5s ease"}}>
          <div style={{textAlign:"center",marginBottom:28}}>
            <div style={{display:"flex",justifyContent:"center",marginBottom:16,filter:"drop-shadow(0 16px 40px rgba(0,180,255,0.4))"}}>
              <LogoHero/>
            </div>
          </div>
          <div style={{background:"rgba(9,14,26,0.96)",border:"1px solid rgba(245,158,11,0.3)",borderRadius:16,padding:"30px 28px",boxShadow:"0 20px 60px rgba(0,0,0,0.5)"}}>
            {pwDone?(
              <div style={{textAlign:"center",padding:"10px 0"}}>
                <div style={{fontSize:44,marginBottom:12}}>✅</div>
                <div style={{fontFamily:"'Outfit',sans-serif",fontWeight:700,fontSize:18,color:"#fff",marginBottom:8}}>Password set!</div>
                <div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:10,color:"rgba(255,255,255,0.4)",letterSpacing:1,animation:"blink 1.5s infinite"}}>Signing you in…</div>
              </div>
            ):(
              <div>
                <div style={{fontFamily:"'Outfit',sans-serif",fontWeight:800,fontSize:22,color:"#fff",marginBottom:4}}>Set your password</div>
                <div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:9,color:"rgba(245,158,11,0.6)",letterSpacing:"1.5px",marginBottom:22}}>WELCOME TO SHIFTPRO</div>
                {[{l:"NEW PASSWORD",v:newPw,fn:setNewPw,ph:"Minimum 8 characters"},{l:"CONFIRM PASSWORD",v:newPw2,fn:setNewPw2,ph:"Re-enter password"}].map(f=>(
                  <div key={f.l} style={{marginBottom:14}}>
                    <label style={{fontFamily:"'JetBrains Mono',monospace",fontSize:9,color:"rgba(255,255,255,0.4)",letterSpacing:"2px",display:"block",marginBottom:6}}>{f.l}</label>
                    <input value={f.v} onChange={e=>{f.fn(e.target.value);setPwErr("");}} onKeyDown={e=>e.key==="Enter"&&handleSetPassword()} type="password" placeholder={f.ph}
                      style={{width:"100%",padding:"12px 14px",background:"rgba(255,255,255,0.06)",border:"1px solid rgba(245,158,11,0.3)",borderRadius:9,fontFamily:"'JetBrains Mono',monospace",fontSize:14,color:"#fff",outline:"none",boxSizing:"border-box"}}/>
                  </div>
                ))}
                {pwErr&&<div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:9,color:"#ef4444",marginBottom:12,padding:"7px 10px",background:"rgba(239,68,68,0.07)",border:"1px solid rgba(239,68,68,0.2)",borderRadius:6}}>{pwErr}</div>}
                <button onClick={handleSetPassword} style={{width:"100%",padding:"14px",background:pwBusy?"rgba(245,158,11,0.5)":"linear-gradient(135deg,#f59e0b,#f97316)",border:"none",borderRadius:10,fontFamily:"'Outfit',sans-serif",fontWeight:700,fontSize:15,color:"#030c14",cursor:pwBusy?"not-allowed":"pointer",boxShadow:"0 4px 20px rgba(245,158,11,0.3)"}}>
                  {pwBusy?"Setting password…":"Set Password & Sign In  to "}
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
      {session?.role==="employee" && <EmpPortal
        key={session.emp?.id}
        emp={session.emp}
        onLogout={logout}
        onProfileUpdate={updatedFields => {
          setSession(s => {
            const merged = { ...s.emp, ...updatedFields };
            // Update localStorage so next refresh picks up the changes
            try { localStorage.setItem("shiftpro_cached_emp_" + merged.id, JSON.stringify(merged)); } catch(e) {}
            return { ...s, emp: merged };
          });
        }}
      />}
      {session?.role==="owner" && <OwnerCmd onLogout={logout} ownerInitialProfile={session.emp}/>}
    </>
  );
}
