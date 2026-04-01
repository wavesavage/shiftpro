"use client";
import { useState } from "react";

const FONTS = `@import url('https://fonts.googleapis.com/css2?family=Outfit:wght@700;800;900&family=JetBrains+Mono:wght@400;500&display=swap');`;

export default function DemoPage() {
  const [unlocked, setUnlocked] = useState(false);
  const [pw, setPw]             = useState("");
  const [err, setErr]           = useState(false);
  const [shake, setShake]       = useState(false);

  const attempt = () => {
    if (pw.toLowerCase() === "shift") {
      setUnlocked(true);
    } else {
      setErr(true);
      setShake(true);
      setTimeout(() => { setShake(false); setErr(false); }, 700);
    }
  };

  if (unlocked) {
    // Redirect to main app — demo users log in with their own credentials
    if (typeof window !== "undefined") window.location.href = "/";
    return null;
  }

  return (
    <>
      <style>{FONTS}{`
        *{box-sizing:border-box;margin:0;padding:0;}
        body{background:#05080f;}
        @keyframes fadeUp{from{opacity:0;transform:translateY(18px)}to{opacity:1;transform:none}}
        @keyframes shake{0%,100%{transform:translateX(0)}20%,60%{transform:translateX(-8px)}40%,80%{transform:translateX(8px)}}
        @keyframes blink{0%,100%{opacity:1}50%{opacity:0.3}}
        @keyframes pulse{0%,100%{opacity:0.6}50%{opacity:1}}
      `}</style>
      <div style={{minHeight:"100vh",
        background:"linear-gradient(135deg,#0f0c29,#302b63,#24243e)",
        display:"flex",alignItems:"center",justifyContent:"center",
        fontFamily:"'Outfit',sans-serif",padding:"20px",position:"relative"}}>

        {/* Grid background */}
        <div style={{position:"absolute",inset:0,
          backgroundImage:"radial-gradient(rgba(99,102,241,0.13) 1px,transparent 1px)",
          backgroundSize:"32px 32px",pointerEvents:"none"}}/>

        <div style={{position:"relative",width:"100%",maxWidth:420,
          animation:shake?"shake 0.5s ease":"fadeUp 0.5s ease"}}>

          {/* Logo */}
          <div style={{textAlign:"center",marginBottom:32}}>
            <div style={{fontFamily:"'Outfit',sans-serif",fontWeight:900,
              fontSize:36,color:"#fff",letterSpacing:-1,marginBottom:6}}>
              <span style={{color:"#f59e0b"}}>Shift</span>Pro
              <span style={{color:"#38bdf8",fontStyle:"italic",fontWeight:300}}>.ai</span>
            </div>
            <div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:9,
              color:"rgba(255,255,255,0.3)",letterSpacing:"3px"}}>
              LIVE DEMO ACCESS
            </div>
          </div>

          <div style={{background:"rgba(9,14,26,0.96)",
            border:"1px solid rgba(245,158,11,0.25)",
            borderRadius:16,padding:"30px 28px",
            boxShadow:"0 20px 60px rgba(0,0,0,0.5)"}}>

            <div style={{textAlign:"center",marginBottom:24}}>
              <div style={{fontSize:40,marginBottom:12}}>🔐</div>
              <div style={{fontFamily:"'Outfit',sans-serif",fontWeight:800,
                fontSize:20,color:"#fff",marginBottom:6}}>
                Demo Access
              </div>
              <div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:10,
                color:"rgba(255,255,255,0.35)",lineHeight:1.7}}>
                Enter the demo password to explore ShiftPro with a live tour.
              </div>
            </div>

            <div style={{marginBottom:14}}>
              <div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:9,
                color:"rgba(255,255,255,0.35)",letterSpacing:"2px",
                display:"block",marginBottom:6}}>ACCESS CODE</div>
              <input
                value={pw}
                onChange={e=>{setPw(e.target.value);setErr(false);}}
                onKeyDown={e=>e.key==="Enter"&&attempt()}
                type="password"
                placeholder="Enter demo password"
                style={{width:"100%",padding:"12px 14px",
                  background:"rgba(255,255,255,0.06)",
                  border:"1px solid "+(err?"rgba(239,68,68,0.5)":"rgba(245,158,11,0.3)"),
                  borderRadius:9,fontFamily:"'JetBrains Mono',monospace",
                  fontSize:14,color:"#fff",outline:"none",
                  boxSizing:"border-box",
                  transition:"border-color 0.2s"}}/>
              {err&&(
                <div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:9,
                  color:"#ef4444",marginTop:6,letterSpacing:1}}>
                  Invalid access code. Try again.
                </div>
              )}
            </div>

            <button
              onClick={attempt}
              style={{width:"100%",padding:"13px",
                background:"linear-gradient(135deg,#f59e0b,#f97316)",
                border:"none",borderRadius:10,
                fontFamily:"'Outfit',sans-serif",fontWeight:700,fontSize:15,
                color:"#030c14",cursor:"pointer",
                boxShadow:"0 4px 20px rgba(245,158,11,0.3)",
                transition:"transform 0.1s"}}
              onMouseEnter={e=>e.currentTarget.style.transform="translateY(-1px)"}
              onMouseLeave={e=>e.currentTarget.style.transform="none"}>
              Enter Demo →
            </button>

            <div style={{marginTop:20,textAlign:"center",
              fontFamily:"'JetBrains Mono',monospace",fontSize:9,
              color:"rgba(255,255,255,0.2)",lineHeight:1.7}}>
              Want your own account?{" "}
              <a href="/signup" style={{color:"rgba(245,158,11,0.5)",textDecoration:"none"}}>
                Sign up free →
              </a>
            </div>
          </div>

          <div style={{textAlign:"center",marginTop:20,
            fontFamily:"'JetBrains Mono',monospace",fontSize:8,
            color:"rgba(255,255,255,0.15)",letterSpacing:"1.5px"}}>
            SHIFTPRO.AI · WORKFORCE INTELLIGENCE
          </div>
        </div>
      </div>
    </>
  );
}
