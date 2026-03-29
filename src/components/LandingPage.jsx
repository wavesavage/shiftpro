"use client";
import { useState, useEffect, useRef } from "react";

// ─── FONTS ───────────────────────────────────────────
const FONTS = `@import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800;900&family=JetBrains+Mono:wght@400;500&display=swap');`;

const GCSS = `
*{box-sizing:border-box;margin:0;padding:0;}
html{scroll-behavior:smooth;}
body{background:#05080f;font-family:'Outfit',sans-serif;color:#e2e8f0;overflow-x:hidden;}
::-webkit-scrollbar{width:4px;}
::-webkit-scrollbar-thumb{background:rgba(0,212,255,0.2);border-radius:2px;}
@keyframes fadeUp{from{opacity:0;transform:translateY(24px)}to{opacity:1;transform:none}}
@keyframes fadeIn{from{opacity:0}to{opacity:1}}
@keyframes float{0%,100%{transform:translateY(0)}50%{transform:translateY(-12px)}}
@keyframes pulse{0%,100%{box-shadow:0 0 0 0 rgba(0,212,255,0.5)}50%{box-shadow:0 0 0 16px rgba(0,212,255,0)}}
@keyframes spin{from{transform:rotate(0)}to{transform:rotate(360deg)}}
@keyframes shimmer{0%{opacity:0.5}50%{opacity:1}100%{opacity:0.5}}
@keyframes scan{from{top:0}to{top:100%}}
@keyframes gradientShift{0%{background-position:0% 50%}50%{background-position:100% 50%}100%{background-position:0% 50%}}
`;

// ─── COLORS ──────────────────────────────────────────
const C = {
  bg:"#05080f", bg2:"#090e1a", bg3:"#0e1525",
  teal:"#00d4ff", amber:"#f59e0b", green:"#10b981",
  red:"#ef4444", purple:"#a78bfa",
  text:"#e2e8f0", textD:"rgba(226,232,240,0.55)", textF:"rgba(226,232,240,0.25)",
  border:"rgba(255,255,255,0.06)", borderT:"rgba(0,212,255,0.18)",
  mono:"'JetBrains Mono',monospace",
};

// ─── SVG LOGO COMPONENTS ────────────────────────────
function SwirlMark({size=44}){
  return(
    <svg width={size} height={size} viewBox="0 0 130 130" style={{display:"block",overflow:"visible",flexShrink:0}}>
      <defs>
        <linearGradient id="nav_g1" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#00d4ff"/><stop offset="100%" stopColor="#0066cc"/>
        </linearGradient>
        <linearGradient id="nav_g2" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#f59e0b"/><stop offset="100%" stopColor="#fbbf24"/>
        </linearGradient>
        <filter id="nav_glow"><feGaussianBlur stdDeviation="2.5" result="blur"/>
          <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
        </filter>
      </defs>
      <g transform="translate(65,65)">
        <circle cx="0" cy="0" r="57" fill="none" stroke="rgba(0,212,255,0.1)" strokeWidth="6"/>
        <path d="M -50 14 A 53 53 0 0 1 18 -50 L 11 -33 A 36 36 0 0 0 -33 9 Z" fill="url(#nav_g1)" opacity="0.95" filter="url(#nav_glow)"/>
        <path d="M 18 -50 A 53 53 0 0 1 50 16 L 33 11 A 36 36 0 0 0 13 -33 Z" fill="#1e7fd4" opacity="0.9"/>
        <path d="M 50 16 A 53 53 0 0 1 -50 14 L -33 9 A 36 36 0 0 0 33 11 Z" fill="#0c4fa0" opacity="0.85"/>
        <path d="M -27 -48 A 55 55 0 0 1 48 -26 L 40 -17 A 44 44 0 0 0 -20 -38 Z" fill="url(#nav_g2)" opacity="1" filter="url(#nav_glow)"/>
        <circle cx="0" cy="0" r="20" fill="rgba(14,165,233,0.1)"/>
        <circle cx="0" cy="0" r="20" fill="none" stroke="#38bdf8" strokeWidth="1.5" opacity="0.6"/>
        <circle cx="0" cy="0" r="9.5" fill="url(#nav_g1)" filter="url(#nav_glow)"/>
        <circle cx="0" cy="0" r="4.5" fill="#fff" opacity="0.92"/>
        <circle cx="0" cy="0" r="2.2" fill="#00d4ff"/>
        <circle cx="0" cy="-57" r="2.5" fill="rgba(0,212,255,0.5)"/>
        <circle cx="49.4" cy="-28.5" r="2" fill="rgba(245,158,11,0.65)"/>
      </g>
    </svg>
  );
}

function HeroLogo(){
  return(
    <svg viewBox="0 0 560 160" style={{width:"100%",maxWidth:560,display:"block"}}>
      <defs>
        <linearGradient id="h_g1" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#00d4ff"/><stop offset="100%" stopColor="#0066cc"/>
        </linearGradient>
        <linearGradient id="h_g2" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#f59e0b"/><stop offset="100%" stopColor="#fbbf24"/>
        </linearGradient>
        <linearGradient id="h_g3" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#38bdf8"/><stop offset="100%" stopColor="#0ea5e9"/>
        </linearGradient>
        <filter id="h_glow" x="-25%" y="-25%" width="150%" height="150%">
          <feGaussianBlur stdDeviation="4" result="blur"/>
          <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
        </filter>
      </defs>
      <g transform="translate(80,80)">
        <circle cx="0" cy="0" r="64" fill="none" stroke="rgba(0,212,255,0.08)" strokeWidth="8"/>
        <path d="M -57 16 A 60 60 0 0 1 21 -57 L 13 -38 A 41 41 0 0 0 -38 11 Z" fill="url(#h_g1)" opacity="0.95" filter="url(#h_glow)"/>
        <path d="M 21 -57 A 60 60 0 0 1 57 19 L 38 13 A 41 41 0 0 0 14 -38 Z" fill="#1e7fd4" opacity="0.9"/>
        <path d="M 57 19 A 60 60 0 0 1 -57 16 L -38 11 A 41 41 0 0 0 38 13 Z" fill="#0c4fa0" opacity="0.85"/>
        <path d="M -31 -55 A 62 62 0 0 1 54 -30 L 46 -20 A 50 50 0 0 0 -23 -44 Z" fill="url(#h_g2)" opacity="1" filter="url(#h_glow)"/>
        <circle cx="0" cy="0" r="23" fill="rgba(14,165,233,0.08)"/>
        <circle cx="0" cy="0" r="23" fill="none" stroke="url(#h_g3)" strokeWidth="1.8" opacity="0.6"/>
        <circle cx="0" cy="0" r="11" fill="url(#h_g1)" filter="url(#h_glow)"/>
        <circle cx="0" cy="0" r="5.5" fill="#fff" opacity="0.92"/>
        <circle cx="0" cy="0" r="2.8" fill="#00d4ff"/>
        <circle cx="0" cy="-64" r="3" fill="rgba(0,212,255,0.5)"/>
        <circle cx="55.4" cy="-32" r="2.5" fill="rgba(245,158,11,0.65)"/>
      </g>
      <text x="172" y="76" fontFamily="'Outfit',sans-serif" fontWeight="900" fontSize="70" fill="#ffffff" letterSpacing="-2">Shift</text>
      <text x="316" y="76" fontFamily="'Outfit',sans-serif" fontWeight="300" fontSize="70" fill="#ffffff" letterSpacing="-2">Pro</text>
      <text x="412" y="76" fontFamily="'Outfit',sans-serif" fontWeight="400" fontSize="70" fill="#00d4ff" fontStyle="italic">.ai</text>
      <line x1="173" y1="90" x2="500" y2="90" stroke="rgba(0,212,255,0.16)" strokeWidth="0.75"/>
      <text x="174" y="112" fontFamily="'JetBrains Mono',monospace" fontWeight="400" fontSize="13" fill="rgba(255,255,255,0.38)" letterSpacing="5">AI WORKFORCE INTELLIGENCE</text>
    </svg>
  );
}

// ─── DATA ────────────────────────────────────────────
const FEATURES = [
  {icon:"👁️", title:"Always-On Intelligence", desc:"AI monitors your business 24/7, detecting anomalies, behavioral patterns, and incidents the moment they happen — not the next morning.", color:C.teal},
  {icon:"⏱️", title:"Verified Time Tracking", desc:"Every clock-in is cross-referenced with your camera system. Ghost hours, early departures, and payroll fraud get caught automatically.", color:C.amber},
  {icon:"📅", title:"Smart Scheduling", desc:"Build weekly schedules in minutes with a drag-and-drop builder. Daily, weekly, and monthly views. Shift swaps and time-off requests built in.", color:C.green},
  {icon:"📊", title:"Productivity Ratings", desc:"Every employee gets an AI-generated reliability score based on attendance, zone presence, and output — updated every shift.", color:C.purple},
  {icon:"🔔", title:"Silent Owner Alerts", desc:"Critical alerts go straight to your phone. Ghost hours, camera mismatches, register voids, no-shows. Invisible to employees.", color:C.red},
  {icon:"📍", title:"Multi-Location Command", desc:"Own 3 stores or 30 — see every location in one dashboard. Drill into any site in seconds. Built for operators who run empires.", color:"#38bdf8"},
];

const STATS = [
  {value:"99.7%", label:"Uptime SLA"},
  {value:"< 2s", label:"Alert Latency"},
  {value:"Any Camera", label:"RTSP / ONVIF"},
  {value:"SOC 2", label:"Compliant"},
];

const PRICING = [
  {name:"Starter", price:49, cameras:"Up to 4 cameras", locations:"1 location",
    features:["Live camera dashboard","Shift scheduling","Time tracking","Email alerts","7-day clip storage"],
    color:C.teal, highlight:false},
  {name:"Business", price:129, cameras:"Up to 16 cameras", locations:"3 locations",
    features:["Everything in Starter","AI theft detection","Productivity ratings","SMS + push alerts","30-day clip storage","Payroll fraud detection"],
    color:C.amber, highlight:true},
  {name:"Enterprise", price:299, cameras:"Unlimited cameras", locations:"Unlimited locations",
    features:["Everything in Business","Custom AI training","Unlimited clip storage","API access","Priority support","White-label option"],
    color:C.purple, highlight:false},
];

const HOW = [
  {n:"01", title:"Connect Your Cameras", desc:"Point ShiftPro to any RTSP stream or ONVIF device on your network. Works with Hikvision, Dahua, Axis, Reolink — anything you already own."},
  {n:"02", title:"Add Your Team", desc:"Invite employees. They see a friendly scheduling app. You see the full intelligence layer behind it. Same platform, two very different views."},
  {n:"03", title:"Define Your Zones", desc:"Tag areas as registers, stock rooms, exits. The AI learns what normal looks like — and alerts you the instant something isn't."},
  {n:"04", title:"Watch & Act", desc:"Real-time alerts on your phone. Review clips, check timesheets, approve schedules. Run your business from anywhere."},
];

// ─── COMPONENTS ──────────────────────────────────────
function Chip({label}){
  return(
    <span style={{fontFamily:C.mono,fontSize:9,color:C.teal,background:"rgba(0,212,255,0.08)",border:"1px solid rgba(0,212,255,0.2)",padding:"3px 10px",borderRadius:20,letterSpacing:"2px",textTransform:"uppercase",whiteSpace:"nowrap"}}>
      {label}
    </span>
  );
}

function FeatureCard({f, i}){
  const [hov,setHov]=useState(false);
  return(
    <div onMouseEnter={()=>setHov(true)} onMouseLeave={()=>setHov(false)}
      style={{background:hov?C.bg3:C.bg2,border:`1px solid ${hov?f.color+"40":C.border}`,borderRadius:14,padding:"28px 26px",
        transition:"all 0.25s",transform:hov?"translateY(-4px)":"none",
        boxShadow:hov?`0 12px 40px rgba(0,0,0,0.3)`:"none",
        animation:`fadeUp 0.5s ease ${i*0.08}s both`,cursor:"default"}}>
      <div style={{fontSize:32,marginBottom:16}}>{f.icon}</div>
      <div style={{fontFamily:"'Outfit',sans-serif",fontWeight:700,fontSize:18,color:"#fff",marginBottom:10}}>{f.title}</div>
      <div style={{fontFamily:C.mono,fontSize:12,color:C.textD,lineHeight:1.8}}>{f.desc}</div>
    </div>
  );
}

// ─── MAIN LANDING PAGE ────────────────────────────────
export default function LandingPage(){
  const [scrollY,setScrollY]=useState(0);
  const [navSolid,setNavSolid]=useState(false);
  const [email,setEmail]=useState("");
  const [submitted,setSubmitted]=useState(false);

  useEffect(()=>{
    const h=()=>{setScrollY(window.scrollY);setNavSolid(window.scrollY>60);};
    window.addEventListener("scroll",h);
    return()=>window.removeEventListener("scroll",h);
  },[]);

  const goToApp=()=>window.location.href="/login";

  return(
    <>
      <style>{FONTS}{GCSS}</style>

      {/* ── NAV ── */}
      <nav style={{position:"fixed",top:0,left:0,right:0,zIndex:200,
        background:navSolid?"rgba(5,8,15,0.97)":"transparent",
        borderBottom:navSolid?`1px solid ${C.border}`:"none",
        backdropFilter:navSolid?"blur(20px)":"none",
        transition:"all 0.3s",padding:"0 40px",height:66,
        display:"flex",alignItems:"center",justifyContent:"space-between"}}>
        <div style={{display:"flex",alignItems:"center",gap:12}}>
          <SwirlMark size={38}/>
          <div>
            <div style={{fontFamily:"'Outfit',sans-serif",fontWeight:800,fontSize:20,color:"#fff",lineHeight:1}}>
              ShiftPro<span style={{color:C.teal,fontStyle:"italic"}}>.ai</span>
            </div>
            <div style={{fontFamily:C.mono,fontSize:8,color:C.teal+"55",letterSpacing:"2.5px"}}>WORKFORCE INTELLIGENCE</div>
          </div>
        </div>
        <div style={{display:"flex",alignItems:"center",gap:32}}>
          {["Features","How It Works","Pricing"].map(item=>(
            <a key={item} href={`#${item.toLowerCase().replace(/ /g,"-")}`}
              style={{fontFamily:C.mono,fontSize:11,color:C.textD,textDecoration:"none",letterSpacing:"1.5px",
                transition:"color 0.2s",textTransform:"uppercase"}}
              onMouseEnter={e=>e.target.style.color=C.teal}
              onMouseLeave={e=>e.target.style.color=C.textD}>
              {item}
            </a>
          ))}
          <button onClick={goToApp} style={{fontFamily:"'Outfit',sans-serif",fontWeight:700,fontSize:14,
            padding:"9px 24px",background:C.teal,border:"none",borderRadius:8,
            color:"#030c14",cursor:"pointer",transition:"all 0.2s",
            boxShadow:"0 0 20px rgba(0,212,255,0.35)"}}
            onMouseEnter={e=>{e.currentTarget.style.transform="translateY(-2px)";e.currentTarget.style.boxShadow="0 4px 28px rgba(0,212,255,0.5)";}}
            onMouseLeave={e=>{e.currentTarget.style.transform="none";e.currentTarget.style.boxShadow="0 0 20px rgba(0,212,255,0.35)";}}>
            Sign In →
          </button>
        </div>
      </nav>

      {/* ── HERO ── */}
      <section style={{minHeight:"100vh",display:"flex",alignItems:"center",justifyContent:"center",
        position:"relative",overflow:"hidden",padding:"120px 40px 80px"}}>
        {/* Grid bg */}
        <div style={{position:"absolute",inset:0,opacity:0.03,
          backgroundImage:`linear-gradient(${C.teal} 1px,transparent 1px),linear-gradient(90deg,${C.teal} 1px,transparent 1px)`,
          backgroundSize:"52px 52px",pointerEvents:"none"}}/>
        {/* Radial glow */}
        <div style={{position:"absolute",top:"35%",left:"50%",transform:"translate(-50%,-50%)",
          width:900,height:600,borderRadius:"50%",
          background:"radial-gradient(ellipse,rgba(0,212,255,0.07) 0%,transparent 70%)",
          pointerEvents:"none"}}/>
        {/* Amber glow top right */}
        <div style={{position:"absolute",top:"-10%",right:"-5%",
          width:500,height:500,borderRadius:"50%",
          background:"radial-gradient(ellipse,rgba(245,158,11,0.06) 0%,transparent 70%)",
          pointerEvents:"none"}}/>

        <div style={{position:"relative",textAlign:"center",maxWidth:900,animation:"fadeUp 0.8s ease"}}>
          {/* Live badge */}
          <div style={{display:"inline-flex",alignItems:"center",gap:10,marginBottom:32,
            fontFamily:C.mono,fontSize:10,color:C.teal,letterSpacing:"2px",
            background:"rgba(0,212,255,0.08)",border:"1px solid rgba(0,212,255,0.2)",
            borderRadius:20,padding:"6px 18px"}}>
            <div style={{width:7,height:7,borderRadius:"50%",background:C.teal,animation:"pulse 2s infinite"}}/>
            NOW IN BETA — APPLY FOR EARLY ACCESS
          </div>

          {/* Hero logo */}
          <div style={{display:"flex",justifyContent:"center",marginBottom:28,
            filter:"drop-shadow(0 20px 50px rgba(0,212,255,0.4))",animation:"float 6s ease-in-out infinite"}}>
            <HeroLogo/>
          </div>

          {/* Headline */}
          <h1 style={{fontFamily:"'Outfit',sans-serif",fontWeight:900,
            fontSize:"clamp(38px,6vw,72px)",lineHeight:1.08,letterSpacing:"-2px",
            color:"#fff",marginBottom:24}}>
            Your business,{" "}
            <span style={{background:"linear-gradient(135deg,#00d4ff,#0066cc)",
              WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent",backgroundClip:"text"}}>
              watched 24/7
            </span>
            {" "}by AI.
          </h1>

          {/* Subheadline */}
          <p style={{fontFamily:C.mono,fontSize:15,lineHeight:1.85,color:C.textD,
            maxWidth:580,margin:"0 auto 48px",letterSpacing:"0.2px"}}>
            ShiftPro turns any camera system into an intelligent operations layer —
            detecting theft, verifying time, scheduling shifts, and alerting you
            the moment something goes wrong.
          </p>

          {/* CTAs */}
          <div style={{display:"flex",gap:14,justifyContent:"center",flexWrap:"wrap",marginBottom:72}}>
            <button onClick={goToApp} style={{fontFamily:"'Outfit',sans-serif",fontWeight:800,fontSize:16,
              padding:"16px 44px",background:C.teal,border:"none",borderRadius:10,
              color:"#030c14",cursor:"pointer",transition:"all 0.2s",
              boxShadow:"0 0 36px rgba(0,212,255,0.4)"}}
              onMouseEnter={e=>{e.currentTarget.style.transform="translateY(-3px)";e.currentTarget.style.boxShadow="0 8px 48px rgba(0,212,255,0.55)";}}
              onMouseLeave={e=>{e.currentTarget.style.transform="none";e.currentTarget.style.boxShadow="0 0 36px rgba(0,212,255,0.4)";}}>
              Launch Demo →
            </button>
            <a href="#pricing" style={{fontFamily:"'Outfit',sans-serif",fontWeight:600,fontSize:16,
              padding:"16px 44px",background:"transparent",border:"1px solid rgba(0,212,255,0.3)",
              borderRadius:10,color:C.teal,cursor:"pointer",textDecoration:"none",
              transition:"all 0.2s",display:"inline-block"}}
              onMouseEnter={e=>{e.currentTarget.style.background="rgba(0,212,255,0.08)";e.currentTarget.style.borderColor="rgba(0,212,255,0.6)";}}
              onMouseLeave={e=>{e.currentTarget.style.background="transparent";e.currentTarget.style.borderColor="rgba(0,212,255,0.3)";}}>
              See Pricing
            </a>
          </div>

          {/* Stats */}
          <div style={{display:"flex",gap:0,justifyContent:"center",flexWrap:"wrap",
            border:`1px solid ${C.border}`,borderRadius:14,background:C.bg2,
            padding:"24px 0",maxWidth:640,margin:"0 auto"}}>
            {STATS.map((s,i)=>(
              <div key={i} style={{flex:"1 1 140px",textAlign:"center",
                borderRight:i<STATS.length-1?`1px solid ${C.border}`:"none",
                padding:"0 24px"}}>
                <div style={{fontFamily:"'Outfit',sans-serif",fontWeight:800,fontSize:24,
                  color:C.teal,marginBottom:4}}>{s.value}</div>
                <div style={{fontFamily:C.mono,fontSize:9,color:C.textF,letterSpacing:"2px",
                  textTransform:"uppercase"}}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section id="features" style={{padding:"100px 40px",maxWidth:1200,margin:"0 auto"}}>
        <div style={{textAlign:"center",marginBottom:72}}>
          <Chip label="Capabilities"/>
          <h2 style={{fontFamily:"'Outfit',sans-serif",fontWeight:800,
            fontSize:"clamp(28px,4vw,52px)",color:"#fff",marginTop:16,
            letterSpacing:"-1px",lineHeight:1.1}}>
            Everything your business<br/>needs to run smarter
          </h2>
          <p style={{fontFamily:C.mono,fontSize:13,color:C.textD,
            marginTop:16,maxWidth:520,margin:"16px auto 0",lineHeight:1.75}}>
            Built for retail, restaurants, salons, dispensaries, gyms —
            any business with shifts and staff.
          </p>
        </div>
        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(320px,1fr))",gap:16}}>
          {FEATURES.map((f,i)=><FeatureCard key={i} f={f} i={i}/>)}
        </div>
      </section>

      {/* ── DUAL PORTAL CALLOUT ── */}
      <section style={{padding:"80px 40px",background:C.bg2,borderTop:`1px solid ${C.border}`,borderBottom:`1px solid ${C.border}`}}>
        <div style={{maxWidth:1000,margin:"0 auto",display:"grid",gridTemplateColumns:"1fr 1fr",gap:24}}>

          {/* Owner side */}
          <div style={{background:"rgba(245,158,11,0.05)",border:"1px solid rgba(245,158,11,0.2)",
            borderRadius:16,padding:"36px 32px",transition:"all 0.2s"}}
            onMouseEnter={e=>{e.currentTarget.style.borderColor="rgba(245,158,11,0.5)";e.currentTarget.style.background="rgba(245,158,11,0.09)";}}
            onMouseLeave={e=>{e.currentTarget.style.borderColor="rgba(245,158,11,0.2)";e.currentTarget.style.background="rgba(245,158,11,0.05)";}}>
            <div style={{fontFamily:C.mono,fontSize:9,color:C.amber,letterSpacing:"3px",marginBottom:16}}>OWNER / MANAGER PORTAL</div>
            <h3 style={{fontFamily:"'Outfit',sans-serif",fontWeight:800,fontSize:26,color:"#fff",marginBottom:12,lineHeight:1.2}}>
              Your operations command center
            </h3>
            <p style={{fontFamily:C.mono,fontSize:12,color:C.textD,lineHeight:1.8,marginBottom:24}}>
              Full Palantir-grade intelligence on every employee, every shift, every dollar. Ghost hours, behavioral flags, payroll forensics, live camera feeds.
            </p>
            {["Employee risk scores","Ghost hour detection","Live intelligence feed","Payroll fraud engine","Multi-location command","Silent owner alerts"].map(f=>(
              <div key={f} style={{display:"flex",alignItems:"center",gap:8,marginBottom:8}}>
                <span style={{color:C.amber,fontSize:14}}>◆</span>
                <span style={{fontFamily:C.mono,fontSize:11,color:C.textD}}>{f}</span>
              </div>
            ))}
          </div>

          {/* Employee side */}
          <div style={{background:"rgba(16,185,129,0.05)",border:"1px solid rgba(16,185,129,0.2)",
            borderRadius:16,padding:"36px 32px",transition:"all 0.2s"}}
            onMouseEnter={e=>{e.currentTarget.style.borderColor="rgba(16,185,129,0.5)";e.currentTarget.style.background="rgba(16,185,129,0.09)";}}
            onMouseLeave={e=>{e.currentTarget.style.borderColor="rgba(16,185,129,0.2)";e.currentTarget.style.background="rgba(16,185,129,0.05)";}}>
            <div style={{fontFamily:C.mono,fontSize:9,color:C.green,letterSpacing:"3px",marginBottom:16}}>EMPLOYEE PORTAL</div>
            <h3 style={{fontFamily:"'Outfit',sans-serif",fontWeight:800,fontSize:26,color:"#fff",marginBottom:12,lineHeight:1.2}}>
              Your personal work hub
            </h3>
            <p style={{fontFamily:C.mono,fontSize:12,color:C.textD,lineHeight:1.8,marginBottom:24}}>
              A clean, friendly app employees actually enjoy using. Clock in, view schedules, check earnings, swap shifts. Simple, fast, mobile-ready.
            </p>
            {["Live clock-in with timer","Weekly schedule view","Earnings & pay stubs","Shift swap requests","Team messages","Achievement badges"].map(f=>(
              <div key={f} style={{display:"flex",alignItems:"center",gap:8,marginBottom:8}}>
                <span style={{color:C.green,fontSize:14}}>◆</span>
                <span style={{fontFamily:C.mono,fontSize:11,color:C.textD}}>{f}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section id="how-it-works" style={{padding:"100px 40px",maxWidth:1100,margin:"0 auto"}}>
        <div style={{textAlign:"center",marginBottom:72}}>
          <Chip label="Setup"/>
          <h2 style={{fontFamily:"'Outfit',sans-serif",fontWeight:800,
            fontSize:"clamp(28px,4vw,52px)",color:"#fff",marginTop:16,letterSpacing:"-1px"}}>
            Live in under 10 minutes
          </h2>
        </div>
        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(220px,1fr))",gap:0,position:"relative"}}>
          {HOW.map((step,i)=>(
            <div key={i} style={{padding:"32px 28px",textAlign:"center",position:"relative",
              animation:`fadeUp 0.5s ease ${i*0.1}s both`}}>
              {i<HOW.length-1&&(
                <div style={{position:"absolute",top:"52px",right:0,width:"50%",height:1,
                  background:`linear-gradient(90deg,rgba(0,212,255,0.25),transparent)`,
                  transform:"translateX(50%)",zIndex:0}}/>
              )}
              <div style={{width:56,height:56,borderRadius:"50%",
                background:"rgba(0,212,255,0.08)",border:`1.5px solid rgba(0,212,255,0.25)`,
                display:"flex",alignItems:"center",justifyContent:"center",
                margin:"0 auto 20px",position:"relative",zIndex:1}}>
                <span style={{fontFamily:C.mono,fontSize:14,color:C.teal,fontWeight:500}}>{step.n}</span>
              </div>
              <div style={{fontFamily:"'Outfit',sans-serif",fontWeight:700,fontSize:18,
                color:"#fff",marginBottom:10}}>{step.title}</div>
              <div style={{fontFamily:C.mono,fontSize:11,color:C.textD,lineHeight:1.75}}>{step.desc}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── PRICING ── */}
      <section id="pricing" style={{padding:"100px 40px",background:C.bg2,
        borderTop:`1px solid ${C.border}`,borderBottom:`1px solid ${C.border}`}}>
        <div style={{maxWidth:1100,margin:"0 auto"}}>
          <div style={{textAlign:"center",marginBottom:72}}>
            <Chip label="Pricing"/>
            <h2 style={{fontFamily:"'Outfit',sans-serif",fontWeight:800,
              fontSize:"clamp(28px,4vw,52px)",color:"#fff",marginTop:16,letterSpacing:"-1px"}}>
              Simple, transparent pricing
            </h2>
            <p style={{fontFamily:C.mono,fontSize:12,color:C.textD,marginTop:14,letterSpacing:"0.5px"}}>
              14-day free trial. No credit card required. Cancel anytime.
            </p>
          </div>
          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(300px,1fr))",gap:16}}>
            {PRICING.map((plan,i)=>(
              <div key={i} style={{position:"relative",background:plan.highlight?"rgba(245,158,11,0.05)":C.bg3,
                border:`1px solid ${plan.highlight?plan.color+"50":C.border}`,
                borderRadius:14,padding:"36px 32px",
                boxShadow:plan.highlight?`0 0 50px rgba(245,158,11,0.1)`:"none",
                transition:"all 0.2s"}}
                onMouseEnter={e=>{e.currentTarget.style.transform="translateY(-3px)";}}
                onMouseLeave={e=>{e.currentTarget.style.transform="none";}}>
                {plan.highlight&&(
                  <div style={{position:"absolute",top:-13,left:"50%",transform:"translateX(-50%)",
                    fontFamily:C.mono,fontSize:9,color:"#030c14",background:C.amber,
                    padding:"4px 16px",borderRadius:20,letterSpacing:"2px",whiteSpace:"nowrap"}}>
                    MOST POPULAR
                  </div>
                )}
                <div style={{fontFamily:C.mono,fontSize:9,color:plan.color,letterSpacing:"3px",marginBottom:10,textTransform:"uppercase"}}>{plan.name}</div>
                <div style={{display:"flex",alignItems:"baseline",gap:6,marginBottom:6}}>
                  <span style={{fontFamily:"'Outfit',sans-serif",fontWeight:800,fontSize:52,color:"#fff"}}>${plan.price}</span>
                  <span style={{fontFamily:C.mono,fontSize:12,color:C.textD}}>/mo</span>
                </div>
                <div style={{fontFamily:C.mono,fontSize:11,color:C.textD,marginBottom:4}}>{plan.cameras}</div>
                <div style={{fontFamily:C.mono,fontSize:11,color:C.textD,marginBottom:28}}>{plan.locations}</div>
                <div style={{display:"flex",flexDirection:"column",gap:10,marginBottom:32}}>
                  {plan.features.map((f,j)=>(
                    <div key={j} style={{display:"flex",alignItems:"center",gap:10}}>
                      <span style={{color:plan.color,fontSize:13}}>✓</span>
                      <span style={{fontFamily:C.mono,fontSize:11,color:C.textD}}>{f}</span>
                    </div>
                  ))}
                </div>
                <button onClick={goToApp} style={{width:"100%",padding:"14px",borderRadius:8,cursor:"pointer",
                  fontFamily:"'Outfit',sans-serif",fontWeight:700,fontSize:15,
                  background:plan.highlight?C.amber:"transparent",
                  border:`1px solid ${plan.highlight?C.amber:plan.color+"50"}`,
                  color:plan.highlight?"#030c14":plan.color,
                  transition:"all 0.2s"}}
                  onMouseEnter={e=>{if(!plan.highlight){e.currentTarget.style.background=`${plan.color}15`;e.currentTarget.style.borderColor=plan.color;}}}
                  onMouseLeave={e=>{if(!plan.highlight){e.currentTarget.style.background="transparent";e.currentTarget.style.borderColor=`${plan.color}50`;}}}
                >
                  Start Free Trial
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── EMAIL CAPTURE CTA ── */}
      <section style={{padding:"100px 40px",textAlign:"center",position:"relative",overflow:"hidden"}}>
        <div style={{position:"absolute",inset:0,
          background:"radial-gradient(ellipse at center,rgba(0,212,255,0.06) 0%,transparent 70%)",
          pointerEvents:"none"}}/>
        <div style={{position:"relative",maxWidth:620,margin:"0 auto"}}>
          <div style={{display:"flex",justifyContent:"center",marginBottom:28,
            filter:"drop-shadow(0 8px 24px rgba(0,212,255,0.3))"}}>
            <SwirlMark size={64}/>
          </div>
          <h2 style={{fontFamily:"'Outfit',sans-serif",fontWeight:900,
            fontSize:"clamp(28px,4vw,52px)",color:"#fff",
            marginBottom:16,letterSpacing:"-1px",lineHeight:1.1}}>
            Stop losses before they<br/>become habits.
          </h2>
          <p style={{fontFamily:C.mono,fontSize:13,color:C.textD,marginBottom:40,lineHeight:1.75}}>
            Join business owners who use ShiftPro to protect their revenue,
            verify their hours, and run tighter operations — every single shift.
          </p>

          {!submitted?(
            <div style={{display:"flex",gap:10,maxWidth:460,margin:"0 auto",flexWrap:"wrap",justifyContent:"center"}}>
              <input value={email} onChange={e=>setEmail(e.target.value)}
                type="email" placeholder="your@business.com"
                style={{flex:1,minWidth:220,padding:"13px 18px",
                  background:"rgba(255,255,255,0.05)",border:"1px solid rgba(0,212,255,0.25)",
                  borderRadius:8,fontFamily:C.mono,fontSize:13,color:"#fff",outline:"none"}}/>
              <button onClick={()=>{if(email){setSubmitted(true);}}}
                style={{padding:"13px 28px",background:C.teal,border:"none",borderRadius:8,
                  fontFamily:"'Outfit',sans-serif",fontWeight:700,fontSize:15,
                  color:"#030c14",cursor:"pointer",
                  boxShadow:"0 0 24px rgba(0,212,255,0.4)",
                  transition:"all 0.2s",whiteSpace:"nowrap"}}
                onMouseEnter={e=>e.currentTarget.style.boxShadow="0 4px 32px rgba(0,212,255,0.6)"}
                onMouseLeave={e=>e.currentTarget.style.boxShadow="0 0 24px rgba(0,212,255,0.4)"}>
                Request Early Access
              </button>
            </div>
          ):(
            <div style={{fontFamily:C.mono,fontSize:13,color:C.teal,
              background:"rgba(0,212,255,0.08)",border:"1px solid rgba(0,212,255,0.2)",
              borderRadius:10,padding:"16px 32px",display:"inline-block",letterSpacing:"1px"}}>
              ✓ You're on the list — we'll be in touch soon!
            </div>
          )}

          <div style={{display:"flex",gap:12,justifyContent:"center",marginTop:24,flexWrap:"wrap"}}>
            <button onClick={goToApp} style={{fontFamily:"'Outfit',sans-serif",fontWeight:700,fontSize:15,
              padding:"13px 36px",background:"transparent",
              border:"1px solid rgba(0,212,255,0.3)",borderRadius:8,
              color:C.teal,cursor:"pointer",transition:"all 0.2s"}}
              onMouseEnter={e=>{e.currentTarget.style.background="rgba(0,212,255,0.08)";}}
              onMouseLeave={e=>{e.currentTarget.style.background="transparent";}}>
              Launch Demo App →
            </button>
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer style={{background:C.bg2,borderTop:`1px solid ${C.border}`,
        padding:"36px 40px",display:"flex",justifyContent:"space-between",
        alignItems:"center",flexWrap:"wrap",gap:16}}>
        <div style={{display:"flex",alignItems:"center",gap:10}}>
          <SwirlMark size={28}/>
          <span style={{fontFamily:"'Outfit',sans-serif",fontWeight:700,fontSize:16,color:"#fff"}}>
            ShiftPro<span style={{color:C.teal,fontStyle:"italic"}}>.ai</span>
          </span>
        </div>
        <div style={{fontFamily:C.mono,fontSize:10,color:C.textF,letterSpacing:"1.5px"}}>
          © 2025 SHIFTPRO.AI — ALL RIGHTS RESERVED
        </div>
        <div style={{display:"flex",gap:24}}>
          {["Privacy","Terms","Contact"].map(l=>(
            <span key={l} style={{fontFamily:C.mono,fontSize:10,color:C.textD,
              cursor:"pointer",letterSpacing:"1.5px",textTransform:"uppercase",
              transition:"color 0.15s"}}
              onMouseEnter={e=>e.target.style.color=C.teal}
              onMouseLeave={e=>e.target.style.color=C.textD}>{l}</span>
          ))}
        </div>
      </footer>
    </>
  );
}
