"use client";
import { useState, useEffect } from "react";

const FONTS = `@import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800;900&family=JetBrains+Mono:wght@400;500&family=Nunito:wght@400;600;700;800&display=swap');`;
const GCSS = `
*{box-sizing:border-box;margin:0;padding:0;}html{scroll-behavior:smooth;}
body{background:#05080f;font-family:'Outfit',sans-serif;color:#e2e8f0;overflow-x:hidden;}
::-webkit-scrollbar{width:4px;}::-webkit-scrollbar-thumb{background:rgba(0,212,255,0.2);border-radius:2px;}
@keyframes fadeUp{from{opacity:0;transform:translateY(28px)}to{opacity:1;transform:none}}
@keyframes fadeIn{from{opacity:0}to{opacity:1}}
@keyframes float{0%,100%{transform:translateY(0)}50%{transform:translateY(-10px)}}
@keyframes pulse{0%,100%{box-shadow:0 0 0 0 rgba(0,212,255,0.5)}50%{box-shadow:0 0 0 14px rgba(0,212,255,0)}}
@keyframes pulseG{0%,100%{box-shadow:0 0 0 0 rgba(16,185,129,0.5)}50%{box-shadow:0 0 0 14px rgba(16,185,129,0)}}
@keyframes slideL{from{opacity:0;transform:translateX(40px)}to{opacity:1;transform:none}}
@keyframes slideR{from{opacity:0;transform:translateX(-40px)}to{opacity:1;transform:none}}

/* ── RESPONSIVE ── */
.sp-split{display:flex;flex:1;position:relative;min-height:0;margin-top:0;}
.sp-half{flex:1;display:flex;flex-direction:column;justify-content:center;cursor:pointer;position:relative;overflow:hidden;transition:background 0.5s;}
.sp-half-l{align-items:flex-end;padding-right:12%;padding-left:60px;padding-top:80px;}
.sp-half-r{align-items:flex-start;padding-left:12%;padding-right:60px;padding-top:80px;}
.sp-content-l{position:relative;text-align:right;animation:slideR 0.7s ease;}
.sp-content-r{position:relative;animation:slideL 0.7s ease;}
.sp-nav{padding:0 40px;}
.sp-section-pad{padding:90px 40px;}
.sp-hero-pad{padding:120px 40px 80px;}
.sp-footer-pad{padding:24px 40px;}
.sp-grid-3{display:grid;grid-template-columns:repeat(auto-fit,minmax(310px,1fr));gap:13px;}
.sp-grid-2{display:grid;grid-template-columns:1fr 1fr;gap:24px;}
.sp-grid-4{display:grid;grid-template-columns:repeat(auto-fit,minmax(130px,1fr));gap:10px;}
.sp-steps{display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:0;}
.sp-pricing{display:grid;grid-template-columns:repeat(auto-fit,minmax(260px,1fr));gap:13px;}
.sp-perks{display:grid;grid-template-columns:repeat(auto-fit,minmax(300px,1fr));gap:13px;}

@media(max-width:768px){
  .sp-split{flex-direction:column;}
  .sp-half{flex:none;min-height:50vh;padding-top:20px !important;}
  .sp-half-l{align-items:center !important;padding-right:24px !important;padding-left:24px !important;text-align:center;}
  .sp-half-r{align-items:center !important;padding-left:24px !important;padding-right:24px !important;text-align:center;}
  .sp-content-l{text-align:center !important;}
  .sp-content-r{text-align:center !important;}
  .sp-nav{padding:0 20px !important;}
  .sp-section-pad{padding:60px 20px !important;}
  .sp-hero-pad{padding:90px 20px 60px !important;}
  .sp-footer-pad{padding:20px !important;}
  .sp-grid-2{grid-template-columns:1fr !important;}
  .sp-grid-4{grid-template-columns:repeat(2,1fr) !important;}
  .sp-steps{grid-template-columns:1fr 1fr !important;}
  .sp-pricing{grid-template-columns:1fr !important;}
  .sp-perks{grid-template-columns:1fr !important;}
  .sp-hide-mobile{display:none !important;}
}
@media(max-width:480px){
  .sp-steps{grid-template-columns:1fr !important;}
  .sp-grid-4{grid-template-columns:1fr 1fr !important;}
  .sp-grid-3{grid-template-columns:1fr !important;}
}
`;

const C={
  bg:"#05080f",bg2:"#090e1a",bg3:"#0e1525",
  teal:"#00d4ff",amber:"#f59e0b",green:"#10b981",red:"#ef4444",purple:"#a78bfa",
  text:"#e2e8f0",textD:"rgba(226,232,240,0.55)",textF:"rgba(226,232,240,0.22)",
  border:"rgba(255,255,255,0.06)",mono:"'JetBrains Mono',monospace",
  sans:"'Outfit',sans-serif",body:"'Nunito',sans-serif",
};

function Swirl({size=44,c1="#00d4ff",c2="#0066cc",c3="#0c4fa0",accent="#f59e0b"}){
  const id=c1.replace("#","");
  return(
    <svg width={size} height={size} viewBox="0 0 130 130" style={{display:"block",overflow:"visible",flexShrink:0}}>
      <defs>
        <linearGradient id={"g1"+id} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor={c1}/><stop offset="100%" stopColor={c2}/>
        </linearGradient>
        <linearGradient id={"g2"+id} x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor={accent}/><stop offset="100%" stopColor={c1}/>
        </linearGradient>
        <filter id={"gf"+id}><feGaussianBlur stdDeviation="3" result="b"/>
          <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
        </filter>
      </defs>
      <g transform="translate(65,65)">
        <circle cx="0" cy="0" r="57" fill="none" stroke={c1} strokeWidth="5" opacity="0.12"/>
        <path d="M -50 14 A 53 53 0 0 1 18 -50 L 11 -33 A 36 36 0 0 0 -33 9 Z" fill={"url(#g1"+id+")"} opacity="0.95" filter={"url(#gf"+id+")"}/>
        <path d="M 18 -50 A 53 53 0 0 1 50 16 L 33 11 A 36 36 0 0 0 13 -33 Z" fill={c2} opacity="0.88"/>
        <path d="M 50 16 A 53 53 0 0 1 -50 14 L -33 9 A 36 36 0 0 0 33 11 Z" fill={c3} opacity="0.82"/>
        <path d="M -27 -48 A 55 55 0 0 1 48 -26 L 40 -17 A 44 44 0 0 0 -20 -38 Z" fill={"url(#g2"+id+")"} opacity="1" filter={"url(#gf"+id+")"}/>
        <circle cx="0" cy="0" r="20" fill={c1} opacity="0.08"/>
        <circle cx="0" cy="0" r="20" fill="none" stroke={c1} strokeWidth="1.5" opacity="0.5"/>
        <circle cx="0" cy="0" r="9.5" fill={"url(#g1"+id+")"} filter={"url(#gf"+id+")"}/>
        <circle cx="0" cy="0" r="4.5" fill="#fff" opacity="0.92"/>
        <circle cx="0" cy="0" r="2.2" fill={c1}/>
        <circle cx="0" cy="-57" r="2.5" fill={c1} opacity="0.55"/>
        <circle cx="49.4" cy="-28.5" r="2" fill={accent} opacity="0.65"/>
      </g>
    </svg>
  );
}

function Logo({size=36}){
  return(
    <div style={{display:"flex",alignItems:"center",gap:11,cursor:"pointer"}}>
      <Swirl size={size}/>
      <div>
        <div style={{fontFamily:C.sans,fontWeight:800,fontSize:size*.56,color:"#fff",lineHeight:1}}>
          ShiftPro<span style={{color:C.teal,fontStyle:"italic"}}>.ai</span>
        </div>
        <div style={{fontFamily:C.mono,fontSize:7,color:C.teal+"55",letterSpacing:"2.5px",marginTop:1}}>WORKFORCE INTELLIGENCE</div>
      </div>
    </div>
  );
}

// ══ ENTRY CHOOSER ══════════════════════════════
function Entry({onChoose}){
  const [hov,setHov]=useState(null);
  return(
    <div style={{minHeight:"100vh",background:C.bg,display:"flex",flexDirection:"column",overflow:"hidden"}}>
      {/* Top bar — minimal, centered logo only */}
      <div style={{padding:"20px 40px",display:"flex",justifyContent:"center",
        position:"absolute",top:0,left:0,right:0,zIndex:30}}>
        <Logo/>
      </div>
      <div className="sp-split">
        {/* Seamless center blend line */}
        <div style={{position:"absolute",top:0,bottom:0,left:"50%",
          transform:"translateX(-50%)",width:1,zIndex:10,pointerEvents:"none",
          background:"linear-gradient(to bottom,transparent 0%,rgba(255,255,255,0.06) 30%,rgba(255,255,255,0.06) 70%,transparent 100%)"}}/>

        {/* LEFT — EMPLOYER */}
        <div onClick={()=>onChoose("employer")}
          onMouseEnter={()=>setHov("employer")} onMouseLeave={()=>setHov(null)}
          className="sp-half sp-half-l"
          style={{background:hov==="employer"?"rgba(245,158,11,0.05)":"transparent"}}>
          <div style={{position:"absolute",top:"50%",right:"18%",width:420,height:420,
            borderRadius:"50%",transform:"translateY(-50%)",pointerEvents:"none",
            background:`radial-gradient(ellipse,rgba(245,158,11,${hov==="employer"?0.11:0.04}) 0%,transparent 70%)`,
            transition:"all 0.4s"}}/>
          <div style={{position:"absolute",right:0,top:"8%",bottom:"8%",width:1,
            background:"linear-gradient(to bottom,transparent,rgba(255,255,255,0.07),transparent)"}}/>
          <div className="sp-content-l">
            <div style={{display:"flex",justifyContent:"flex-end",marginBottom:18}}>
              <Swirl size={76} c1="#f59e0b" c2="#f97316" c3="#b45309" accent="#fde68a"/>
            </div>
            <div style={{fontFamily:C.mono,fontSize:9,color:C.amber,letterSpacing:"3px",
              marginBottom:10,textTransform:"uppercase"}}>For Business Owners</div>
            <h2 style={{fontFamily:C.sans,fontWeight:900,
              fontSize:"clamp(30px,4vw,58px)",color:"#fff",lineHeight:1.05,
              letterSpacing:"-1.5px",marginBottom:14}}>
              I'm an<br/>
              <span style={{background:"linear-gradient(135deg,#f59e0b,#f97316)",
                WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent",
                backgroundClip:"text"}}>Employer</span>
            </h2>
            <p style={{fontFamily:C.mono,fontSize:11,color:C.textD,lineHeight:1.7,
              maxWidth:320,marginLeft:"auto",marginBottom:22}}>
              Manage your team, monitor operations, detect issues and run a smarter business
            </p>
            <div style={{display:"inline-flex",alignItems:"center",gap:10,
              padding:"11px 26px",borderRadius:50,
              background:hov==="employer"?C.amber:"transparent",
              border:`1.5px solid ${hov==="employer"?C.amber:"rgba(245,158,11,0.4)"}`,
              color:hov==="employer"?"#030c14":C.amber,
              fontFamily:C.sans,fontWeight:700,fontSize:14,transition:"all 0.25s",
              boxShadow:hov==="employer"?"0 0 28px rgba(245,158,11,0.45)":"none"}}>
              Operations Center <span style={{fontSize:17}}>→</span>
            </div>
          </div>
        </div>

        {/* RIGHT — EMPLOYEE */}
        <div onClick={()=>onChoose("employee")}
          onMouseEnter={()=>setHov("employee")} onMouseLeave={()=>setHov(null)}
          className="sp-half sp-half-r"
          style={{background:hov==="employee"?"rgba(16,185,129,0.05)":"transparent"}}>
          <div style={{position:"absolute",top:"50%",left:"18%",width:420,height:420,
            borderRadius:"50%",transform:"translateY(-50%)",pointerEvents:"none",
            background:`radial-gradient(ellipse,rgba(16,185,129,${hov==="employee"?0.11:0.04}) 0%,transparent 70%)`,
            transition:"all 0.4s"}}/>
          <div className="sp-content-r">
            <div style={{marginBottom:18}}>
              <Swirl size={76} c1="#10b981" c2="#059669" c3="#065f46" accent="#6ee7b7"/>
            </div>
            <div style={{fontFamily:C.mono,fontSize:9,color:C.green,letterSpacing:"3px",
              marginBottom:10,textTransform:"uppercase"}}>For Employees</div>
            <h2 style={{fontFamily:C.sans,fontWeight:900,
              fontSize:"clamp(30px,4vw,58px)",color:"#fff",lineHeight:1.05,
              letterSpacing:"-1.5px",marginBottom:14}}>
              I'm an<br/>
              <span style={{background:"linear-gradient(135deg,#10b981,#38bdf8)",
                WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent",
                backgroundClip:"text"}}>Employee</span>
            </h2>
            <p style={{fontFamily:C.mono,fontSize:11,color:C.textD,lineHeight:1.7,
              maxWidth:320,marginBottom:22}}>
              Clock in fast, own your schedule, track your pay — all from your phone
            </p>
            <div style={{display:"inline-flex",alignItems:"center",gap:10,
              padding:"11px 26px",borderRadius:50,
              background:hov==="employee"?C.green:"transparent",
              border:`1.5px solid ${hov==="employee"?C.green:"rgba(16,185,129,0.4)"}`,
              color:hov==="employee"?"#030c14":C.green,
              fontFamily:C.sans,fontWeight:700,fontSize:14,transition:"all 0.25s",
              boxShadow:hov==="employee"?"0 0 28px rgba(16,185,129,0.45)":"none"}}>
              Work Smarter <span style={{fontSize:17}}>→</span>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}

// ══ EMPLOYER LANDING ═══════════════════════════
function EmployerPage({onBack,onSignIn}){
  const [navSolid,setNavSolid]=useState(false);
  const [email,setEmail]=useState("");
  const [sent,setSent]=useState(false);
  useEffect(()=>{const h=()=>setNavSolid(window.scrollY>60);window.addEventListener("scroll",h);return()=>window.removeEventListener("scroll",h);},[]);

  const FEATS=[
    {icon:"👁️",title:"24/7 AI Monitoring",desc:"Your cameras become intelligent — detecting theft, behavioral anomalies, and incidents the moment they happen.",c:C.teal},
    {icon:"💸",title:"Payroll Fraud Detection",desc:"Cross-reference clocked hours against camera-verified presence. Ghost hours flagged automatically with dollar values.",c:C.amber},
    {icon:"📊",title:"Employee Intelligence",desc:"Every employee gets a reliability score, risk level, productivity rating, and behavioral timeline — every shift.",c:C.purple},
    {icon:"📅",title:"Smart Scheduling",desc:"Drag-and-drop weekly schedule builder with daily, weekly and monthly views. Shift swaps handled in-app.",c:C.green},
    {icon:"🔔",title:"Silent Owner Alerts",desc:"Critical alerts go to your phone only — invisible to employees. Ghost hours, voids, no-shows, camera mismatches.",c:C.red},
    {icon:"📍",title:"Multi-Location Command",desc:"Own 3 stores or 30 — see every location in one dashboard. Drill into any site in seconds.",c:"#38bdf8"},
  ];

  const PLANS=[
    {name:"Starter",price:79,cameras:"Up to 4 cameras",locs:"1 location",
      addLoc:"$49/additional location",
      feats:["Shift scheduling & time clock","Employee portal & My Growth","Swap & time-off requests","Payroll tracking & export","Email alerts","Documents & W-2 vault"],
      c:C.teal,hot:false},
    {name:"Growth",price:179,cameras:"Up to 16 cameras",locs:"3 locations",
      addLoc:"$49/additional location",
      feats:["Everything in Starter","AI workforce intelligence","Payroll fraud forensics","Multi-location command center","SMS + push notifications","Benchmarks & analytics","HR enforcement suite"],
      c:C.amber,hot:true},
    {name:"Professional",price:349,cameras:"Unlimited cameras",locs:"Unlimited locations",
      addLoc:null,
      feats:["Everything in Growth","Camera AI integration","Full RBAC access control","API access & webhooks","White-label option","QuickBooks / ADP / Gusto sync","Priority support & onboarding"],
      c:C.purple,hot:false},
    {name:"Enterprise",price:599,cameras:"Unlimited + custom AI",locs:"Unlimited + custom",
      addLoc:null,
      feats:["Everything in Professional","Dedicated onboarding specialist","Custom AI model training","SLA guarantee","Annual contract pricing","Direct ADP / Paychex integration","Multi-brand / franchise support"],
      c:"#f43f5e",hot:false},
  ];

  return(
    <div style={{minHeight:"100vh",background:C.bg}}>
      <nav style={{position:"fixed",top:0,left:0,right:0,zIndex:200,height:62,
        background:navSolid?"rgba(5,8,15,0.97)":"transparent",
        borderBottom:navSolid?`1px solid ${C.border}`:"none",
        backdropFilter:navSolid?"blur(20px)":"none",transition:"all 0.3s",
        padding:"0 40px",display:"flex",alignItems:"center",justifyContent:"space-between",flexWrap:"wrap",gap:8}}>
        <button onClick={onBack} style={{background:"none",border:"none",cursor:"pointer"}}><Logo/></button>
        <div style={{display:"flex",alignItems:"center",gap:28}}>
          {["Features","Pricing"].map(item=>(
            <a key={item} href={`#el-${item.toLowerCase()}`}
              className="sp-hide-mobile"
              style={{fontFamily:C.mono,fontSize:11,color:C.textD,textDecoration:"none",
                letterSpacing:"1.5px",textTransform:"uppercase",transition:"color 0.2s"}}
              onMouseEnter={e=>e.target.style.color=C.amber}
              onMouseLeave={e=>e.target.style.color=C.textD}>{item}</a>
          ))}
          <button onClick={onSignIn} style={{fontFamily:C.sans,fontWeight:700,fontSize:14,
            padding:"9px 22px",background:C.amber,border:"none",borderRadius:8,
            color:"#030c14",cursor:"pointer",boxShadow:"0 0 18px rgba(245,158,11,0.4)",
            transition:"all 0.2s"}}
            onMouseEnter={e=>e.currentTarget.style.transform="translateY(-2px)"}
            onMouseLeave={e=>e.currentTarget.style.transform="none"}>Sign In →</button>
        </div>
      </nav>

      {/* HERO */}
      <section style={{minHeight:"100vh",display:"flex",alignItems:"center",justifyContent:"center",
        padding:"120px 40px 80px",position:"relative",overflow:"hidden"}}>
        <div style={{position:"absolute",inset:0,opacity:0.03,
          backgroundImage:`linear-gradient(${C.amber} 1px,transparent 1px),linear-gradient(90deg,${C.amber} 1px,transparent 1px)`,
          backgroundSize:"52px 52px",pointerEvents:"none"}}/>
        <div style={{position:"absolute",top:"30%",left:"50%",transform:"translate(-50%,-50%)",
          width:900,height:600,borderRadius:"50%",pointerEvents:"none",
          background:"radial-gradient(ellipse,rgba(245,158,11,0.07) 0%,transparent 70%)"}}/>
        <div style={{position:"relative",textAlign:"center",maxWidth:860,animation:"fadeUp 0.7s ease"}}>
          <div style={{display:"inline-flex",alignItems:"center",gap:10,marginBottom:26,
            fontFamily:C.mono,fontSize:10,color:C.amber,letterSpacing:"2px",
            background:"rgba(245,158,11,0.08)",border:"1px solid rgba(245,158,11,0.2)",
            borderRadius:20,padding:"5px 16px"}}>
            <div style={{width:7,height:7,borderRadius:"50%",background:C.amber,animation:"pulse 2s infinite"}}/>
            AI-POWERED BUSINESS INTELLIGENCE
          </div>
          <div style={{display:"flex",justifyContent:"center",marginBottom:26,
            filter:"drop-shadow(0 0 40px rgba(245,158,11,0.45))",animation:"float 6s ease-in-out infinite"}}>
            <Swirl size={88} c1="#f59e0b" c2="#f97316" c3="#b45309" accent="#fde68a"/>
          </div>
          <h1 style={{fontFamily:C.sans,fontWeight:900,fontSize:"clamp(34px,6vw,72px)",
            lineHeight:1.06,letterSpacing:"-2px",color:"#fff",marginBottom:20}}>
            Run your business<br/>
            <span style={{background:"linear-gradient(135deg,#f59e0b,#f97316)",
              WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent",backgroundClip:"text"}}>
              like you never sleep.
            </span>
          </h1>
          <p style={{fontFamily:C.mono,fontSize:14,lineHeight:1.85,color:C.textD,
            maxWidth:560,margin:"0 auto 40px"}}>
            ShiftPro gives you real-time AI intelligence on every employee, every shift,
            every dollar — so you always know what's happening, even when you're not there.
          </p>
          <div style={{display:"flex",gap:12,justifyContent:"center",flexWrap:"wrap",marginBottom:56}}>
            <button onClick={onSignIn} style={{fontFamily:C.sans,fontWeight:800,fontSize:16,
              padding:"15px 42px",background:C.amber,border:"none",borderRadius:10,
              color:"#030c14",cursor:"pointer",boxShadow:"0 0 32px rgba(245,158,11,0.45)",
              transition:"all 0.2s"}}
              onMouseEnter={e=>{e.currentTarget.style.transform="translateY(-3px)";e.currentTarget.style.boxShadow="0 8px 44px rgba(245,158,11,0.6)";}}
              onMouseLeave={e=>{e.currentTarget.style.transform="none";e.currentTarget.style.boxShadow="0 0 32px rgba(245,158,11,0.45)";}}>
              Start Free Trial →
            </button>
            <a href="#el-features" style={{fontFamily:C.sans,fontWeight:600,fontSize:16,
              padding:"15px 42px",background:"transparent",
              border:"1px solid rgba(245,158,11,0.3)",borderRadius:10,
              color:C.amber,cursor:"pointer",textDecoration:"none",
              transition:"all 0.2s",display:"inline-block"}}
              onMouseEnter={e=>e.currentTarget.style.background="rgba(245,158,11,0.08)"}
              onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
              See How It Works
            </a>
          </div>
          <div style={{display:"flex",justifyContent:"center",gap:0,flexWrap:"wrap",
            border:`1px solid ${C.border}`,borderRadius:14,background:C.bg2,
            padding:"20px 0",maxWidth:620,margin:"0 auto",overflowX:"auto"}}>
            {[["99.7%","Uptime SLA"],["< 2s","Alert Speed"],["Any Camera","RTSP/ONVIF"],["ROI","Day One"]].map(([v,l],i)=>(
              <div key={i} style={{flex:"1 1 130px",textAlign:"center",
                borderRight:i<3?`1px solid ${C.border}`:"none",padding:"0 18px"}}>
                <div style={{fontFamily:C.sans,fontWeight:800,fontSize:20,color:C.amber,marginBottom:2}}>{v}</div>
                <div style={{fontFamily:C.mono,fontSize:8,color:C.textF,letterSpacing:"2px",textTransform:"uppercase"}}>{l}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section id="el-features" style={{padding:"90px 40px",maxWidth:1200,margin:"0 auto"}}>
        <div style={{textAlign:"center",marginBottom:60}}>
          <h2 style={{fontFamily:C.sans,fontWeight:800,fontSize:"clamp(26px,4vw,50px)",
            color:"#fff",letterSpacing:"-1px",lineHeight:1.1}}>
            The intelligence layer your<br/>business has been missing
          </h2>
        </div>
        <div className="sp-grid-3">
          {FEATS.map((f,i)=>(
            <div key={i} style={{background:C.bg2,border:`1px solid ${C.border}`,borderRadius:13,
              padding:"26px 24px",transition:"all 0.25s",animation:`fadeUp 0.5s ease ${i*0.07}s both`}}
              onMouseEnter={e=>{e.currentTarget.style.borderColor=f.c+"40";e.currentTarget.style.transform="translateY(-3px)";e.currentTarget.style.background=C.bg3;}}
              onMouseLeave={e=>{e.currentTarget.style.borderColor=C.border;e.currentTarget.style.transform="none";e.currentTarget.style.background=C.bg2;}}>
              <div style={{fontSize:28,marginBottom:12}}>{f.icon}</div>
              <div style={{fontFamily:C.sans,fontWeight:700,fontSize:17,color:"#fff",marginBottom:7}}>{f.title}</div>
              <div style={{fontFamily:C.mono,fontSize:11,color:C.textD,lineHeight:1.8}}>{f.desc}</div>
            </div>
          ))}
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section style={{padding:"70px 40px",background:C.bg2,
        borderTop:`1px solid ${C.border}`,borderBottom:`1px solid ${C.border}`}}>
        <div style={{maxWidth:960,margin:"0 auto"}}>
          <h2 style={{fontFamily:C.sans,fontWeight:800,fontSize:"clamp(22px,3vw,42px)",
            color:"#fff",textAlign:"center",letterSpacing:"-1px",marginBottom:52}}>
            Live in under 10 minutes
          </h2>
          <div className="sp-steps">
            {[
              {n:"01",t:"Connect Cameras",d:"Any RTSP or ONVIF camera. Zero rip-and-replace."},
              {n:"02",t:"Add Your Team",d:"Employees see a scheduling app. You see everything else."},
              {n:"03",t:"Define Zones",d:"Tag key areas. The AI learns what normal looks like."},
              {n:"04",t:"Watch & Act",d:"Real-time alerts on your phone. Run from anywhere."},
            ].map((s,i)=>(
              <div key={i} style={{padding:"26px 22px",textAlign:"center",position:"relative"}}>
                {i<3&&<div style={{position:"absolute",top:"42px",right:0,width:"50%",height:1,
                  background:"linear-gradient(90deg,rgba(245,158,11,0.2),transparent)",
                  transform:"translateX(50%)"}}/>}
                <div style={{width:50,height:50,borderRadius:"50%",
                  background:"rgba(245,158,11,0.08)",border:"1.5px solid rgba(245,158,11,0.22)",
                  display:"flex",alignItems:"center",justifyContent:"center",
                  margin:"0 auto 14px",position:"relative",zIndex:1}}>
                  <span style={{fontFamily:C.mono,fontSize:12,color:C.amber}}>{s.n}</span>
                </div>
                <div style={{fontFamily:C.sans,fontWeight:700,fontSize:16,color:"#fff",marginBottom:7}}>{s.t}</div>
                <div style={{fontFamily:C.mono,fontSize:11,color:C.textD,lineHeight:1.7}}>{s.d}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PRICING */}
      <section id="el-pricing" style={{padding:"90px 40px",maxWidth:1100,margin:"0 auto"}}>
        <div style={{textAlign:"center",marginBottom:56}}>
          <h2 style={{fontFamily:C.sans,fontWeight:800,fontSize:"clamp(22px,3vw,42px)",
            color:"#fff",letterSpacing:"-1px",marginBottom:10}}>Simple, transparent pricing</h2>
          <p style={{fontFamily:C.mono,fontSize:12,color:C.textD}}>14-day free trial · No credit card required · Average customer recovers $3,200+/yr in payroll losses</p>
        </div>
        <div className="sp-pricing">
          {PLANS.map((plan,i)=>(
            <div key={i} style={{position:"relative",
              background:plan.hot?"rgba(245,158,11,0.05)":C.bg2,
              border:`1px solid ${plan.hot?plan.c+"50":C.border}`,
              borderRadius:13,padding:"32px 28px",
              boxShadow:plan.hot?"0 0 44px rgba(245,158,11,0.1)":"none",
              transition:"all 0.2s"}}
              onMouseEnter={e=>e.currentTarget.style.transform="translateY(-3px)"}
              onMouseLeave={e=>e.currentTarget.style.transform="none"}>
              {plan.hot&&<div style={{position:"absolute",top:-12,left:"50%",
                transform:"translateX(-50%)",fontFamily:C.mono,fontSize:9,
                color:"#030c14",background:C.amber,padding:"3px 14px",
                borderRadius:20,letterSpacing:"2px",whiteSpace:"nowrap"}}>MOST POPULAR</div>}
              <div style={{fontFamily:C.mono,fontSize:9,color:plan.c,
                letterSpacing:"3px",marginBottom:9,textTransform:"uppercase"}}>{plan.name}</div>
              <div style={{display:"flex",alignItems:"baseline",gap:5,marginBottom:4}}>
                <span style={{fontFamily:C.sans,fontWeight:800,fontSize:48,color:"#fff"}}>${plan.price}</span>
                <span style={{fontFamily:C.mono,fontSize:12,color:C.textD}}>/mo</span>
              </div>
              <div style={{fontFamily:C.mono,fontSize:11,color:C.textD,marginBottom:2}}>{plan.cameras}</div>
              <div style={{fontFamily:C.mono,fontSize:11,color:C.textD,marginBottom:plan.addLoc?2:22}}>{plan.locs}</div>
              {plan.addLoc&&(
                <div style={{fontFamily:C.mono,fontSize:10,color:plan.c,
                  background:plan.c+"14",border:"1px solid "+plan.c+"30",
                  borderRadius:4,padding:"3px 8px",marginBottom:18,
                  display:"inline-block"}}>
                  + {plan.addLoc}
                </div>
              )}
              <div style={{display:"flex",flexDirection:"column",gap:8,marginBottom:26}}>
                {plan.feats.map((f,j)=>(
                  <div key={j} style={{display:"flex",alignItems:"center",gap:8}}>
                    <span style={{color:plan.c,fontSize:12}}>✓</span>
                    <span style={{fontFamily:C.mono,fontSize:11,color:C.textD}}>{f}</span>
                  </div>
                ))}
              </div>
              <button onClick={onSignIn} style={{width:"100%",padding:"12px",borderRadius:8,cursor:"pointer",
                fontFamily:C.sans,fontWeight:700,fontSize:14,
                background:plan.hot?C.amber:"transparent",
                border:`1px solid ${plan.hot?C.amber:plan.c+"50"}`,
                color:plan.hot?"#030c14":plan.c,transition:"all 0.2s"}}
                onMouseEnter={e=>{if(!plan.hot)e.currentTarget.style.background=plan.c+"15";}}
                onMouseLeave={e=>{if(!plan.hot)e.currentTarget.style.background="transparent";}}>
                {plan.name==="Enterprise"?"Contact Sales →":"Start Free Trial →"}
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section style={{padding:"70px 40px",textAlign:"center",background:C.bg2,
        borderTop:`1px solid ${C.border}`}}>
        <h2 style={{fontFamily:C.sans,fontWeight:900,fontSize:"clamp(24px,4vw,50px)",
          color:"#fff",marginBottom:12,letterSpacing:"-1px",lineHeight:1.1}}>
          Stop losses before they<br/>become habits.
        </h2>
        <p style={{fontFamily:C.mono,fontSize:13,color:C.textD,marginBottom:32,lineHeight:1.75}}>
          Join business owners protecting their revenue every shift.
        </p>
        {!sent?(
          <div style={{display:"flex",gap:10,maxWidth:420,margin:"0 auto 14px",
            flexWrap:"wrap",justifyContent:"center"}}>
            <input value={email} onChange={e=>setEmail(e.target.value)} type="email"
              placeholder="your@business.com"
              style={{flex:1,minWidth:190,padding:"12px 16px",
                background:"rgba(255,255,255,0.05)",border:"1px solid rgba(245,158,11,0.25)",
                borderRadius:8,fontFamily:C.mono,fontSize:13,color:"#fff",outline:"none"}}/>
            <button onClick={()=>{if(email)setSent(true);}}
              style={{padding:"12px 22px",background:C.amber,border:"none",borderRadius:8,
                fontFamily:C.sans,fontWeight:700,fontSize:14,color:"#030c14",cursor:"pointer",
                boxShadow:"0 0 18px rgba(245,158,11,0.4)",whiteSpace:"nowrap"}}>
              Request Demo
            </button>
          </div>
        ):(
          <div style={{fontFamily:C.mono,fontSize:13,color:C.amber,
            background:"rgba(245,158,11,0.08)",border:"1px solid rgba(245,158,11,0.2)",
            borderRadius:10,padding:"13px 26px",display:"inline-block",marginBottom:14}}>
            ✓ We will reach out soon!
          </div>
        )}
        <div>
          <button onClick={onSignIn} style={{fontFamily:C.sans,fontWeight:700,fontSize:14,
            padding:"11px 30px",background:"transparent",
            border:"1px solid rgba(245,158,11,0.3)",borderRadius:8,color:C.amber,
            cursor:"pointer",transition:"all 0.2s"}}
            onMouseEnter={e=>e.currentTarget.style.background="rgba(245,158,11,0.08)"}
            onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
            Launch Demo App →
          </button>
        </div>
      </section>

      <footer style={{background:C.bg,borderTop:`1px solid ${C.border}`,padding:"24px 40px",
        display:"flex",justifyContent:"space-between",alignItems:"center",flexWrap:"wrap",gap:12}}>
        <button onClick={onBack} style={{background:"none",border:"none",cursor:"pointer"}}><Logo size={30}/></button>
        <div style={{fontFamily:C.mono,fontSize:9,color:C.textF,letterSpacing:"1.5px"}}>© 2025 SHIFTPRO.AI</div>
        <div style={{display:"flex",gap:18}}>
          {["Privacy","Terms","Contact"].map(l=>(
            <span key={l} style={{fontFamily:C.mono,fontSize:9,color:C.textD,cursor:"pointer",
              letterSpacing:"1.5px",textTransform:"uppercase",transition:"color 0.15s"}}
              onMouseEnter={e=>e.target.style.color=C.amber}
              onMouseLeave={e=>e.target.style.color=C.textD}>{l}</span>
          ))}
        </div>
      </footer>
    </div>
  );
}

// ══ EMPLOYEE LANDING ═══════════════════════════
function EmployeePage({onSignIn}){
  const [showJoin,setShowJoin]=useState(false);

  const PERKS=[
    {icon:"⚡",title:"Know Before Everyone Else",desc:"Your schedule drops the instant your manager publishes it. Instant notification, zero waiting around, zero confusion about when you work.",c:C.green},
    {icon:"📲",title:"Clock In. Done.",desc:"One tap. Your shift starts. Hours tracked automatically with zero paperwork. Accurate, transparent, and always in your pocket.",c:"#38bdf8"},
    {icon:"💰",title:"Know Exactly What You've Earned",desc:"Real-time pay estimates, hours worked, and full pay stub history. You should always know your number — now you do.",c:C.amber},
    {icon:"🔄",title:"Own Your Schedule",desc:"Need to swap? Want time off? Flag your availability? Do it all from the app in under 30 seconds. Your manager gets the request instantly.",c:C.purple},
    {icon:"🏆",title:"Level Up at Work",desc:"Build streaks, earn achievement badges, and climb performance tiers. Show up consistently and get recognized for it — automatically.",c:C.amber},
    {icon:"📡",title:"Always in the Know",desc:"Manager announcements, schedule changes, policy updates — everything hits your app directly. No more 'I didn't know about that.'",c:C.green},
  ];

  if(showJoin) return(
    <div style={{minHeight:"100vh",background:"linear-gradient(135deg,#f0fdf4,#ecfdf5)",
      display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:"40px 20px"}}>
      <div style={{background:"#fff",borderRadius:20,padding:"40px 34px",width:"100%",maxWidth:420,
        boxShadow:"0 20px 60px rgba(0,0,0,0.08)",animation:"fadeUp 0.4s ease"}}>
        <button onClick={()=>setShowJoin(false)} style={{background:"none",border:"none",
          fontFamily:C.body,fontSize:14,color:"#6b7280",cursor:"pointer",marginBottom:18,
          display:"flex",alignItems:"center",gap:6}}>← Back</button>
        <div style={{textAlign:"center",marginBottom:24}}>
          <Swirl size={52} c1="#10b981" c2="#059669" c3="#065f46" accent="#6ee7b7"/>
          <div style={{fontFamily:C.sans,fontWeight:800,fontSize:22,color:"#0f172a",marginTop:10,marginBottom:4}}>
            Join Your Team on ShiftPro
          </div>
          <div style={{fontFamily:C.body,fontSize:13,color:"#6b7280",lineHeight:1.6}}>
            Your employer will send you an invite — check your email or texts.
          </div>
        </div>
        <div style={{background:"#f0fdf4",border:"1px solid #bbf7d0",borderRadius:12,padding:"16px",marginBottom:22}}>
          <div style={{fontFamily:C.sans,fontWeight:700,fontSize:14,color:"#065f46",marginBottom:8}}>
            📩 How to get started:
          </div>
          {["Your manager adds you to ShiftPro","You receive an invite via email or text","Click the link to set your PIN","Start using your Work Hub right away"].map((s,i)=>(
            <div key={i} style={{display:"flex",alignItems:"flex-start",gap:10,marginBottom:7}}>
              <div style={{width:22,height:22,borderRadius:"50%",background:C.green,
                display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
                <span style={{fontFamily:C.mono,fontSize:10,color:"#fff",fontWeight:600}}>{i+1}</span>
              </div>
              <span style={{fontFamily:C.body,fontSize:13,color:"#374151",lineHeight:1.5}}>{s}</span>
            </div>
          ))}
        </div>
        <div style={{textAlign:"center",paddingTop:16,borderTop:"1px solid #f3f4f6"}}>
          <div style={{fontFamily:C.body,fontSize:13,color:"#6b7280",marginBottom:12}}>
            Already have an account?
          </div>
          <button onClick={onSignIn} style={{width:"100%",padding:"13px",
            background:"linear-gradient(135deg,#10b981,#059669)",border:"none",
            borderRadius:10,fontFamily:C.sans,fontWeight:700,fontSize:15,
            color:"#fff",cursor:"pointer",boxShadow:"0 4px 20px rgba(16,185,129,0.3)",
            transition:"all 0.2s"}}
            onMouseEnter={e=>e.currentTarget.style.transform="translateY(-2px)"}
            onMouseLeave={e=>e.currentTarget.style.transform="none"}>
            Sign In to My Work Hub →
          </button>
        </div>
      </div>
    </div>
  );

  return(
    <div style={{minHeight:"100vh",background:"linear-gradient(160deg,#071428 0%,#0d2137 45%,#071428 100%)"}}>
      <nav style={{padding:"18px 40px",display:"flex",alignItems:"center",justifyContent:"space-between"}}>
        <div><Logo/></div>
        <button onClick={onSignIn} style={{fontFamily:C.sans,fontWeight:700,fontSize:14,
          padding:"9px 22px",background:"linear-gradient(135deg,#10b981,#059669)",
          border:"none",borderRadius:8,color:"#fff",cursor:"pointer",
          boxShadow:"0 0 18px rgba(16,185,129,0.4)"}}>Sign In</button>
      </nav>

      <section style={{padding:"40px 40px 80px",textAlign:"center",maxWidth:700,margin:"0 auto"}}>
        <div style={{display:"flex",justifyContent:"center",marginBottom:22,
          filter:"drop-shadow(0 0 32px rgba(16,185,129,0.5))",animation:"float 5s ease-in-out infinite"}}>
          <Swirl size={86} c1="#10b981" c2="#059669" c3="#065f46" accent="#6ee7b7"/>
        </div>
        <div style={{display:"inline-flex",alignItems:"center",gap:10,marginBottom:18,
          fontFamily:C.mono,fontSize:10,color:C.green,letterSpacing:"2px",
          background:"rgba(16,185,129,0.08)",border:"1px solid rgba(16,185,129,0.2)",
          borderRadius:20,padding:"5px 16px"}}>
          <div style={{width:6,height:6,borderRadius:"50%",background:C.green,animation:"pulseG 2s infinite"}}/>
          BUILT FOR PEOPLE WHO SHOW UP
        </div>
        <h1 style={{fontFamily:C.sans,fontWeight:900,fontSize:"clamp(32px,6vw,66px)",
          lineHeight:1.07,letterSpacing:"-2px",color:"#fff",marginBottom:16}}>
          Work smarter,<br/>
          <span style={{background:"linear-gradient(135deg,#10b981,#38bdf8)",
            WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent",
            backgroundClip:"text"}}>not harder.</span>
        </h1>
        <p style={{fontFamily:C.body,fontSize:16,lineHeight:1.82,
          color:"rgba(226,232,240,0.68)",marginBottom:34,maxWidth:500,margin:"0 auto 34px"}}>
          Take control of your work life. Know your schedule before anyone else does, clock in with one tap, and always know exactly what you've earned. ShiftPro puts you in the driver's seat.
        </p>
        <div style={{display:"flex",gap:12,justifyContent:"center",flexWrap:"wrap"}}>
          <button onClick={()=>setShowJoin(true)} style={{fontFamily:C.sans,fontWeight:800,fontSize:15,
            padding:"14px 38px",background:"linear-gradient(135deg,#10b981,#059669)",
            border:"none",borderRadius:10,color:"#fff",cursor:"pointer",
            boxShadow:"0 0 28px rgba(16,185,129,0.4)",transition:"all 0.2s"}}
            onMouseEnter={e=>{e.currentTarget.style.transform="translateY(-3px)";}}
            onMouseLeave={e=>{e.currentTarget.style.transform="none";}}>
            Get Started →
          </button>
          <button onClick={onSignIn} style={{fontFamily:C.sans,fontWeight:600,fontSize:15,
            padding:"14px 38px",background:"transparent",
            border:"1px solid rgba(16,185,129,0.3)",borderRadius:10,
            color:C.green,cursor:"pointer",transition:"all 0.2s"}}
            onMouseEnter={e=>e.currentTarget.style.background="rgba(16,185,129,0.08)"}
            onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
            Sign In
          </button>
        </div>
      </section>

      <section style={{padding:"50px 40px 90px",maxWidth:1100,margin:"0 auto"}}>
        <h2 style={{fontFamily:C.sans,fontWeight:800,fontSize:"clamp(22px,3vw,42px)",
          color:"#fff",letterSpacing:"-1px",textAlign:"center",marginBottom:12}}>
          Built for people who hustle
        </h2>
        <p style={{fontFamily:C.body,fontSize:15,color:"rgba(226,232,240,0.6)",
          textAlign:"center",marginBottom:44,lineHeight:1.7}}>
          Six ways ShiftPro puts you in control of your work life — starting day one.
        </p>
        <div className="sp-perks">
          {PERKS.map((p,i)=>(
            <div key={i} style={{background:"rgba(255,255,255,0.03)",
              border:"1px solid rgba(16,185,129,0.1)",borderRadius:13,
              padding:"24px 22px",transition:"all 0.25s",
              animation:`fadeUp 0.5s ease ${i*0.07}s both`}}
              onMouseEnter={e=>{e.currentTarget.style.background="rgba(16,185,129,0.07)";e.currentTarget.style.borderColor="rgba(16,185,129,0.28)";e.currentTarget.style.transform="translateY(-3px)";}}
              onMouseLeave={e=>{e.currentTarget.style.background="rgba(255,255,255,0.03)";e.currentTarget.style.borderColor="rgba(16,185,129,0.1)";e.currentTarget.style.transform="none";}}>
              <div style={{fontSize:26,marginBottom:10}}>{p.icon}</div>
              <div style={{fontFamily:C.sans,fontWeight:700,fontSize:16,color:"#fff",marginBottom:7}}>{p.title}</div>
              <div style={{fontFamily:C.body,fontSize:13,color:"rgba(226,232,240,0.58)",lineHeight:1.75}}>{p.desc}</div>
            </div>
          ))}
        </div>

        <div style={{textAlign:"center",marginTop:60,padding:"44px 28px",
          background:"rgba(16,185,129,0.05)",border:"1px solid rgba(16,185,129,0.14)",
          borderRadius:16}}>
          <h3 style={{fontFamily:C.sans,fontWeight:800,fontSize:"clamp(20px,3vw,36px)",
            color:"#fff",marginBottom:12,letterSpacing:"-0.5px"}}>Ready to take control?</h3>
          <p style={{fontFamily:C.body,fontSize:15,color:"rgba(226,232,240,0.6)",
            marginBottom:26,lineHeight:1.7}}>
            Your employer adds you to ShiftPro — then the power is in your hands. Already set up? Jump straight in.
          </p>
          <div style={{display:"flex",gap:12,justifyContent:"center",flexWrap:"wrap"}}>
            <button onClick={()=>setShowJoin(true)} style={{fontFamily:C.sans,fontWeight:800,fontSize:14,
              padding:"13px 32px",background:"linear-gradient(135deg,#10b981,#059669)",
              border:"none",borderRadius:10,color:"#fff",cursor:"pointer",
              boxShadow:"0 4px 22px rgba(16,185,129,0.3)",transition:"all 0.2s"}}
              onMouseEnter={e=>e.currentTarget.style.transform="translateY(-2px)"}
              onMouseLeave={e=>e.currentTarget.style.transform="none"}>
              How Do I Join? →
            </button>
            <button onClick={onSignIn} style={{fontFamily:C.sans,fontWeight:600,fontSize:14,
              padding:"13px 32px",background:"transparent",
              border:"1px solid rgba(16,185,129,0.3)",borderRadius:10,
              color:C.green,cursor:"pointer",transition:"all 0.2s"}}
              onMouseEnter={e=>e.currentTarget.style.background="rgba(16,185,129,0.08)"}
              onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
              Sign In
            </button>
          </div>
        </div>
      </section>

      <footer style={{background:"rgba(0,0,0,0.25)",borderTop:"1px solid rgba(255,255,255,0.06)",
        padding:"22px 40px",display:"flex",justifyContent:"space-between",
        alignItems:"center",flexWrap:"wrap",gap:12}}>
        <Logo size={30}/>
        <div style={{fontFamily:C.mono,fontSize:9,color:C.textF,letterSpacing:"1.5px"}}>© 2025 SHIFTPRO.AI</div>
        <div style={{fontFamily:C.mono,fontSize:9,color:C.textF,letterSpacing:"1.5px"}}>Are you an employer? <span onClick={()=>window.location.href="/"} style={{color:C.green,cursor:"pointer",textDecoration:"underline"}}>Visit our business page</span></div>
      </footer>
    </div>
  );
}

// ══ ROOT ════════════════════════════════════════
export default function ShiftProSite(){
  const [screen,setScreen]=useState("entry");
  const goToOwnerApp=()=>{ window.location.href="/login"; };
  const goToEmployeeApp=()=>{ window.location.href="/employee-login"; };
  return(
    <>
      <style>{FONTS}{GCSS}</style>
      {screen==="entry" && <Entry onChoose={setScreen}/>}
      {screen==="employer" && <EmployerPage onBack={()=>setScreen("entry")} onSignIn={goToOwnerApp}/>}
      {screen==="employee" && <EmployeePage onSignIn={goToEmployeeApp}/>}
    </>
  );
}
