"use client";
import { useState } from "react";
import ShiftProApp from "@/components/ShiftProApp";

export default function DemoPage() {
  const [unlocked, setUnlocked] = useState(false);
  const [pw, setPw] = useState("");
  const [err, setErr] = useState(false);

  const attempt = () => {
    if (pw.toLowerCase() === "shiftpro2025") {
      setUnlocked(true);
    } else {
      setErr(true);
      setTimeout(() => setErr(false), 2000);
    }
  };

  if (unlocked) return <ShiftProApp />;

  return (
    <div style={{minHeight:"100vh",background:"linear-gradient(135deg,#0f0c29,#302b63,#24243e)",display:"flex",alignItems:"center",justifyContent:"center",padding:"20px",fontFamily:"sans-serif"}}>
      <div style={{background:"rgba(9,14,26,0.95)",border:"1px solid rgba(99,102,241,0.3)",borderRadius:16,padding:"36px 32px",width:"100%",maxWidth:420,boxShadow:"0 20px 60px rgba(0,0,0,0.5)"}}>
        <div style={{textAlign:"center",marginBottom:28}}>
          <div style={{fontSize:48,marginBottom:12}}>🔒</div>
          <div style={{fontWeight:900,fontSize:28,color:"#fff",marginBottom:6}}>ShiftPro Demo</div>
          <div style={{fontSize:12,color:"rgba(255,255,255,0.4)",letterSpacing:"2px"}}>PRIVATE PREVIEW</div>
        </div>
        <div style={{fontSize:11,color:"rgba(255,255,255,0.4)",letterSpacing:"2px",marginBottom:8}}>ACCESS CODE</div>
        <input
          value={pw}
          onChange={e => { setPw(e.target.value); setErr(false); }}
          onKeyDown={e => e.key === "Enter" && attempt()}
          type="password"
          placeholder="Enter demo password"
          style={{width:"100%",padding:"13px 16px",background:"rgba(255,255,255,0.06)",border:`1px solid ${err ? "rgba(239,68,68,0.6)" : "rgba(99,102,241,0.3)"}`,borderRadius:9,fontSize:16,color:"#fff",outline:"none",marginBottom:err?8:16,letterSpacing:4,boxSizing:"border-box"}}
        />
        {err && <div style={{color:"rgba(239,68,68,0.9)",fontSize:12,marginBottom:12}}>Incorrect password.</div>}
        <button
          onClick={attempt}
          style={{width:"100%",padding:"14px",background:"linear-gradient(135deg,#6366f1,#8b5cf6)",border:"none",borderRadius:9,fontWeight:700,fontSize:15,color:"#fff",cursor:"pointer"}}
        >
          Enter Preview →
        </button>
        <div style={{textAlign:"center",marginTop:16}}>
          <a href="/" style={{color:"rgba(255,255,255,0.25)",fontSize:11,textDecoration:"none"}}>← Back to ShiftPro.ai</a>
        </div>
      </div>
    </div>
  );
}
