"use client";
import { useState } from "react";

const FONTS = `@import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;600;700;800;900&family=JetBrains+Mono:wght@400;500&family=Nunito:wght@400;600;700;800&display=swap');`;
const GCSS = `
*{box-sizing:border-box;margin:0;padding:0;}
body{background:#071428;font-family:'Outfit',sans-serif;}
@keyframes fadeUp{from{opacity:0;transform:translateY(18px)}to{opacity:1;transform:none}}
@keyframes float{0%,100%{transform:translateY(0)}50%{transform:translateY(-8px)}}
@keyframes pulseG{0%,100%{box-shadow:0 0 0 0 rgba(16,185,129,0.5)}50%{box-shadow:0 0 0 12px rgba(16,185,129,0)}}
`;

const EMPS = [
  {id:1,name:"Jordan Mills",role:"Lead Cashier",avatar:"JM",color:"#6366f1",pin:"1234"},
  {id:2,name:"Priya Kapoor",role:"Floor Associate",avatar:"PK",color:"#8b5cf6",pin:"2345"},
  {id:3,name:"Carlos Reyes",role:"Stock Clerk",avatar:"CR",color:"#14b8a6",pin:"3456"},
  {id:4,name:"Anya Torres",role:"Cashier",avatar:"AT",color:"#f59e0b",pin:"4567"},
  {id:5,name:"Marcus Bell",role:"Security",avatar:"MB",color:"#ef4444",pin:"5678"},
];

function Swirl({size=52}){
  return(
    <svg width={size} height={size} viewBox="0 0 130 130" style={{display:"block",flexShrink:0}}>
      <defs>
        <linearGradient id="eg1" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#10b981"/><stop offset="100%" stopColor="#059669"/>
        </linearGradient>
        <linearGradient id="eg2" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#6ee7b7"/><stop offset="100%" stopColor="#10b981"/>
        </linearGradient>
        <filter id="eglow"><feGaussianBlur stdDeviation="3" result="b"/>
          <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
        </filter>
      </defs>
      <g transform="translate(65,65)">
        <circle cx="0" cy="0" r="57" fill="none" stroke="#10b981" strokeWidth="5" opacity="0.12"/>
        <path d="M -50 14 A 53 53 0 0 1 18 -50 L 11 -33 A 36 36 0 0 0 -33 9 Z" fill="url(#eg1)" opacity="0.95" filter="url(#eglow)"/>
        <path d="M 18 -50 A 53 53 0 0 1 50 16 L 33 11 A 36 36 0 0 0 13 -33 Z" fill="#059669" opacity="0.88"/>
        <path d="M 50 16 A 53 53 0 0 1 -50 14 L -33 9 A 36 36 0 0 0 33 11 Z" fill="#065f46" opacity="0.82"/>
        <path d="M -27 -48 A 55 55 0 0 1 48 -26 L 40 -17 A 44 44 0 0 0 -20 -38 Z" fill="url(#eg2)" opacity="1" filter="url(#eglow)"/>
        <circle cx="0" cy="0" r="20" fill="#10b981" opacity="0.08"/>
        <circle cx="0" cy="0" r="20" fill="none" stroke="#10b981" strokeWidth="1.5" opacity="0.5"/>
        <circle cx="0" cy="0" r="9.5" fill="url(#eg1)" filter="url(#eglow)"/>
        <circle cx="0" cy="0" r="4.5" fill="#fff" opacity="0.92"/>
        <circle cx="0" cy="0" r="2.2" fill="#10b981"/>
        <circle cx="0" cy="-57" r="2.5" fill="#10b981" opacity="0.55"/>
        <circle cx="49.4" cy="-28.5" r="2" fill="#6ee7b7" opacity="0.65"/>
      </g>
    </svg>
  );
}

export default function EmployeeLogin(){
  const [sel,setSel] = useState(null);
  const [pin,setPin] = useState("");
  const [err,setErr] = useState("");
  const [busy,setBusy] = useState(false);

  const doLogin = () => {
    if(!sel){ setErr("Please select your name"); return; }
    const emp = EMPS.find(e=>e.id===sel);
    // Demo: any PIN works
    setBusy(true);
    setTimeout(()=>{ window.location.href="/login?portal=employee"; }, 700);
  };

  return(
    <div style={{minHeight:"100vh",background:"linear-gradient(160deg,#071428 0%,#0d2137 45%,#071428 100%)",
      display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",
      padding:"40px 20px"}}>
      <style>{FONTS}{GCSS}</style>

      {/* Background glow */}
      <div style={{position:"fixed",top:"20%",left:"50%",transform:"translateX(-50%)",
        width:600,height:400,borderRadius:"50%",pointerEvents:"none",
        background:"radial-gradient(ellipse,rgba(16,185,129,0.07) 0%,transparent 70%)"}}/>

      <div style={{position:"relative",width:"100%",maxWidth:420,animation:"fadeUp 0.5s ease"}}>

        {/* Logo */}
        <div style={{textAlign:"center",marginBottom:32}}>
          <div style={{display:"flex",justifyContent:"center",marginBottom:14,
            filter:"drop-shadow(0 0 28px rgba(16,185,129,0.5))",
            animation:"float 5s ease-in-out infinite"}}>
            <Swirl size={72}/>
          </div>
          <div style={{fontFamily:"'Outfit',sans-serif",fontWeight:900,fontSize:28,
            color:"#fff",marginBottom:4,letterSpacing:"-0.5px"}}>
            ShiftPro<span style={{color:"#10b981",fontStyle:"italic"}}>.ai</span>
          </div>
          <div style={{display:"inline-flex",alignItems:"center",gap:8,
            fontFamily:"'JetBrains Mono',monospace",fontSize:10,color:"#10b981",
            letterSpacing:"2px",background:"rgba(16,185,129,0.08)",
            border:"1px solid rgba(16,185,129,0.2)",borderRadius:20,padding:"4px 14px",marginTop:6}}>
            <div style={{width:6,height:6,borderRadius:"50%",background:"#10b981",
              animation:"pulseG 2s infinite"}}/>
            EMPLOYEE PORTAL
          </div>
        </div>

        {/* Login card */}
        <div style={{background:"rgba(255,255,255,0.03)",
          border:"1px solid rgba(16,185,129,0.15)",
          borderRadius:18,padding:"32px 28px",
          boxShadow:"0 20px 60px rgba(0,0,0,0.4)"}}>

          <div style={{fontFamily:"'Nunito',sans-serif",fontWeight:800,fontSize:22,
            color:"#fff",marginBottom:4}}>Welcome back! 👋</div>
          <div style={{fontFamily:"'Nunito',sans-serif",fontSize:14,
            color:"rgba(226,232,240,0.55)",marginBottom:22}}>
            Select your name to clock in
          </div>

          {/* Employee selector */}
          <div style={{display:"flex",flexDirection:"column",gap:8,marginBottom:18}}>
            {EMPS.map(e => (
              <button key={e.id} onClick={()=>{setSel(e.id);setErr("");}}
                style={{padding:"10px 14px",
                  background:sel===e.id?"rgba(16,185,129,0.12)":"rgba(255,255,255,0.03)",
                  border:`1.5px solid ${sel===e.id?"#10b981":"rgba(255,255,255,0.07)"}`,
                  borderRadius:10,cursor:"pointer",display:"flex",alignItems:"center",
                  gap:12,transition:"all 0.15s",textAlign:"left"}}>
                <div style={{width:36,height:36,borderRadius:9,
                  background:e.color+"28",border:`1.5px solid ${e.color}45`,
                  display:"flex",alignItems:"center",justifyContent:"center",
                  fontFamily:"'JetBrains Mono',monospace",fontSize:12,
                  color:e.color,fontWeight:500,flexShrink:0}}>
                  {e.avatar}
                </div>
                <div style={{flex:1}}>
                  <div style={{fontFamily:"'Outfit',sans-serif",fontWeight:600,
                    fontSize:14,color:"#fff"}}>{e.name}</div>
                  <div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:10,
                    color:"rgba(226,232,240,0.4)"}}>{e.role}</div>
                </div>
                {sel===e.id && (
                  <span style={{color:"#10b981",fontSize:16,fontWeight:700}}>✓</span>
                )}
              </button>
            ))}
          </div>

          {/* PIN */}
          <div style={{marginBottom:err?8:18}}>
            <label style={{fontFamily:"'JetBrains Mono',monospace",fontSize:9,
              color:"rgba(226,232,240,0.3)",letterSpacing:"2px",
              display:"block",marginBottom:7,textTransform:"uppercase"}}>
              Your 4-Digit PIN
            </label>
            <input value={pin} onChange={e=>{setPin(e.target.value);setErr("");}}
              onKeyDown={e=>e.key==="Enter"&&doLogin()}
              type="password" maxLength={4} placeholder="••••"
              style={{width:"100%",padding:"13px 16px",
                background:"rgba(255,255,255,0.05)",
                border:"1px solid rgba(16,185,129,0.2)",
                borderRadius:10,fontFamily:"'JetBrains Mono',monospace",
                fontSize:24,color:"#fff",outline:"none",
                letterSpacing:"10px",textAlign:"center",
                transition:"border-color 0.15s"}}
              onFocus={e=>e.target.style.borderColor="rgba(16,185,129,0.5)"}
              onBlur={e=>e.target.style.borderColor="rgba(16,185,129,0.2)"}/>
          </div>

          {err && (
            <div style={{fontFamily:"'Nunito',sans-serif",fontSize:12,
              color:"#ef4444",marginBottom:12}}>{err}</div>
          )}

          {/* Sign in button */}
          <button onClick={doLogin}
            style={{width:"100%",padding:"14px",
              background:"linear-gradient(135deg,#10b981,#059669)",
              border:"none",borderRadius:10,fontFamily:"'Outfit',sans-serif",
              fontWeight:800,fontSize:16,color:"#fff",cursor:"pointer",
              boxShadow:"0 4px 24px rgba(16,185,129,0.35)",
              transition:"all 0.2s",opacity:busy?0.75:1}}
            onMouseEnter={e=>{if(!busy){e.currentTarget.style.transform="translateY(-2px)";e.currentTarget.style.boxShadow="0 8px 32px rgba(16,185,129,0.5)";}}}
            onMouseLeave={e=>{e.currentTarget.style.transform="none";e.currentTarget.style.boxShadow="0 4px 24px rgba(16,185,129,0.35)";}}>
            {busy ? "Signing in…" : "Go to My Work Hub →"}
          </button>

          <p style={{fontFamily:"'JetBrains Mono',monospace",fontSize:9,
            color:"rgba(226,232,240,0.2)",textAlign:"center",
            marginTop:14,letterSpacing:"1px"}}>
            Demo: any PIN works
          </p>
        </div>

        {/* Help text — no mention of owner portal */}
        <div style={{textAlign:"center",marginTop:20}}>
          <p style={{fontFamily:"'Nunito',sans-serif",fontSize:13,
            color:"rgba(226,232,240,0.35)",lineHeight:1.6}}>
            Don't have an account yet?{" "}
            <span onClick={()=>window.location.href="/employee-login"}
              style={{color:"#10b981",cursor:"pointer",textDecoration:"underline"}}>
              Ask your manager to add you
            </span>
          </p>
        </div>

      </div>
    </div>
  );
}
