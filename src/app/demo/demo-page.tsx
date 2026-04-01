"use client";
import { useState } from "react";
import ShiftProApp from "@/components/ShiftProApp";

const FONTS = `@import url('https://fonts.googleapis.com/css2?family=Outfit:wght@700;800;900&family=JetBrains+Mono:wght@400;500&display=swap');`;

export default function DemoPage() {
  const [unlocked, setUnlocked] = useState(false);
  const [pw, setPw] = useState("");
  const [err, setErr] = useState(false);
  const [shake, setShake] = useState(false);

  const attempt = () => {
    if (pw.toLowerCase() === "shiftpro2025") {
      setUnlocked(true);
    } else {
      setErr(true);
      setShake(true);
      setTimeout(() => setShake(false), 600);
    }
  };

  if (unlocked) return <ShiftProApp />;

  return (
    <>
      <style>{FONTS}{`
        *{box-sizing:border-box;margin:0;padding:0;}
        body{background:#05080f;}
        @keyframes fadeUp{from{opacity:0;transform:translateY(18px)}to{opacity:1;transform:none}}
        @keyframes shake{0%,100%{transform:translateX(0)}20%,60%{transform:translateX(-8px)}40%,80%{transform:translateX(8px)}}
        @keyframes blink{0%,100%{opacity:1}50%{opacity:0.3}}
      `}</style>
      <div style={{minHeight:"100vh",
        background:"linear-gradient(135deg,#0f0c29,#302b63,#24243e)",
        display:"flex",alignItems:"center",justifyContent:"center",
        fontFamily:"'Outfit',sans-serif",padding:"20px"}}>
        <div style={{position:"absolute",inset:0,
          backgroundImage:"radial-gradient(rgba(99,102,241,0.13) 1px,transparent 1px)",
          backgroundSize:"32px 32px",pointerEvents:"none"}}/>
        <div style={{position:"relative",width:"100%",maxWidth:420,
          animation:shake?"shake 0.5s ease":"fadeUp 0.5s ease"}}>
          <div style={{textAlign:"center",marginBottom:32}}>
            <div style={{fontSize:52,marginBottom:14}}>🔒</div>
            <div style={{fontFamily:"'Outfit',sans-serif",fontWeight:900,
              fontSize:30,color:"#fff",marginBottom:8,letterSpacing:"-0.5px"}}>
              ShiftPro Demo
            </div>
            <div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:10,
              color:"rgba(255,255,255,0.35)",letterSpacing:"3px",marginBottom:6}}>
              PRIVATE PREVIEW
            </div>
            <div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:9,
              color:"rgba(99,102,241,0.7)",letterSpacing:"1.5px"}}>
              Full workforce intelligence suite
            </div>
          </div>
          <div style={{background:"rgba(9,14,26,0.95)",
            border:"1px solid rgba(99,102,241,0.25)",
            borderRadius:18,padding:"30px 28px",
            boxShadow:"0 20px 60px rgba(0,0,0,0.5)"}}>
            <div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:9,
              color:"rgba(255,255,255,0.35)",letterSpacing:"2px",marginBottom:8}}>
              ACCESS CODE
            </div>
            <input value={pw}
              onChange={e=>{setPw(e.target.value);setErr(false);}}
              onKeyDown={e=>e.key==="Enter"&&attempt()}
              type="password"
              placeholder="Enter demo password"
              style={{width:"100%",padding:"13px 16px",
                background:"rgba(255,255,255,0.06)",
                border:"1px solid "+(err?"rgba(239,68,68,0.5)":"rgba(99,102,241,0.25)"),
                borderRadius:9,fontFamily:"'JetBrains Mono',monospace",
                fontSize:16,color:"#fff",outline:"none",
                marginBottom:err?8:16,letterSpacing:4,boxSizing:"border-box",
                transition:"border-color 0.2s"}}/>
            {err&&(
              <div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:10,
                color:"rgba(239,68,68,0.8)",marginBottom:12,letterSpacing:1}}>
                Incorrect password. Try again.
              </div>
            )}
            <button onClick={attempt}
              style={{width:"100%",padding:"14px",
                background:"linear-gradient(135deg,#6366f1,#8b5cf6)",
                border:"none",borderRadius:9,
                fontFamily:"'Outfit',sans-serif",fontWeight:700,fontSize:15,
                color:"#fff",cursor:"pointer",
                boxShadow:"0 4px 20px rgba(99,102,241,0.35)",
                transition:"all 0.2s"}}
              onMouseEnter={e=>e.currentTarget.style.transform="translateY(-2px)"}
              onMouseLeave={e=>e.currentTarget.style.transform="none"}>
              Enter Preview →
            </button>
            <div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:9,
              color:"rgba(255,255,255,0.18)",textAlign:"center",
              marginTop:14,letterSpacing:1}}>
              For authorized preview only
            </div>
          </div>
          <div style={{textAlign:"center",marginTop:18}}>
            <a href="/" style={{fontFamily:"'JetBrains Mono',monospace",fontSize:10,
              color:"rgba(255,255,255,0.25)",letterSpacing:1,textDecoration:"none"}}
              onMouseEnter={e=>e.target.style.color="rgba(255,255,255,0.5)"}
              onMouseLeave={e=>e.target.style.color="rgba(255,255,255,0.25)"}>
              ← Back to ShiftPro.ai
            </a>
          </div>
        </div>
      </div>
    </>
  );
}
