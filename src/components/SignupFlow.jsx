import { useState } from "react";

const O = {
  sans:"'Outfit',sans-serif",
  mono:"'JetBrains Mono',monospace",
  amber:"#f59e0b",
  amberB:"rgba(245,158,11,0.3)",
  green:"#10b981",
  red:"#ef4444",
  textD:"rgba(255,255,255,0.5)",
  textF:"rgba(255,255,255,0.3)",
  bg2:"rgba(9,14,26,0.96)",
  border:"rgba(255,255,255,0.08)",
};

const FONTS = `@import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700;800;900&family=JetBrains+Mono:wght@300;400;500;600&display=swap');
@keyframes fadeUp{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:none}}
@keyframes blink{0%,100%{opacity:1}50%{opacity:0.3}}`;

export default function SignupFlow(){
  const [step,setStep]       = useState(1);
  const [busy,setBusy]       = useState(false);
  const [err,setErr]         = useState("");

  const [bizName,setBizName]   = useState("");
  const [bizType,setBizType]   = useState("Restaurant");
  const [address,setAddress]   = useState("");
  const [empCount,setEmpCount] = useState("1-5");

  const [firstName,setFirstName] = useState("");
  const [lastName,setLastName]   = useState("");
  const [email,setEmail]         = useState("");
  const [pw,setPw]               = useState("");
  const [pw2,setPw2]             = useState("");

  const inputStyle = {
    width:"100%",padding:"12px 14px",
    background:"rgba(255,255,255,0.06)",
    border:"1px solid rgba(245,158,11,0.3)",
    borderRadius:9,fontFamily:O.mono,fontSize:13,
    color:"#fff",outline:"none",boxSizing:"border-box",
  };
  const labelStyle = {
    fontFamily:O.mono,fontSize:9,color:O.textF,
    letterSpacing:"2px",display:"block",marginBottom:6,
  };
  const selectStyle = {
    width:"100%",padding:"12px 14px",
    background:"rgba(9,14,26,0.9)",
    border:"1px solid rgba(245,158,11,0.3)",
    borderRadius:9,fontFamily:O.mono,fontSize:13,
    color:"#fff",outline:"none",cursor:"pointer",
    boxSizing:"border-box",
  };

  const handleSubmit = async() => {
    if(!firstName||!lastName||!email||!pw){setErr("Please fill in all fields.");return;}
    if(pw!==pw2){setErr("Passwords do not match.");return;}
    if(pw.length<8){setErr("Password must be at least 8 characters.");return;}
    setBusy(true);setErr("");
    try{
      const res = await fetch("/api/signup",{
        method:"POST",
        headers:{"Content-Type":"application/json"},
        body:JSON.stringify({email,password:pw,firstName,lastName,bizName,bizType,address,empCount})
      });
      const data = await res.json();
      if(!res.ok) throw new Error(data.error||"Signup failed");
      setStep(3);
      setTimeout(()=>{ window.location.href="/"; },3000);
    }catch(e){
      setErr(e.message||"Something went wrong. Please try again.");
    }finally{setBusy(false);}
  };

  return(
    <div style={{minHeight:"100vh",
      background:"linear-gradient(135deg,#0f0c29,#302b63,#24243e)",
      display:"flex",alignItems:"center",justifyContent:"center",
      fontFamily:O.sans,padding:"20px",position:"relative"}}>

      <style>{FONTS}</style>

      <div style={{position:"absolute",inset:0,
        backgroundImage:"radial-gradient(rgba(99,102,241,0.13) 1px,transparent 1px)",
        backgroundSize:"32px 32px",pointerEvents:"none"}}/>

      <div style={{position:"relative",width:"100%",maxWidth:480,animation:"fadeUp 0.5s ease"}}>

        {/* Logo + header */}
        <div style={{textAlign:"center",marginBottom:28}}>
          <div style={{fontFamily:O.sans,fontWeight:900,fontSize:32,
            color:"#fff",letterSpacing:-1,marginBottom:4}}>
            <span style={{color:O.amber}}>Shift</span>Pro
            <span style={{color:"#38bdf8",fontStyle:"italic",fontWeight:300}}>.ai</span>
          </div>
          <div style={{fontFamily:O.mono,fontSize:9,color:O.textF,letterSpacing:"3px"}}>
            CREATE YOUR ACCOUNT
          </div>
        </div>

        {/* Step indicator */}
        {step < 3 && (
          <div style={{display:"flex",gap:8,justifyContent:"center",marginBottom:24}}>
            {[1,2].map(s=>(
              <div key={s} style={{display:"flex",alignItems:"center",gap:8}}>
                <div style={{width:28,height:28,borderRadius:"50%",
                  background:step>=s?"linear-gradient(135deg,#f59e0b,#f97316)":"rgba(255,255,255,0.08)",
                  border:"1px solid "+(step>=s?"rgba(245,158,11,0.5)":"rgba(255,255,255,0.1)"),
                  display:"flex",alignItems:"center",justifyContent:"center",
                  fontFamily:O.mono,fontSize:11,fontWeight:600,
                  color:step>=s?"#030c14":"rgba(255,255,255,0.3)"}}>
                  {s}
                </div>
                <span style={{fontFamily:O.mono,fontSize:9,
                  color:step===s?O.amber:O.textF,letterSpacing:1}}>
                  {s===1?"BUSINESS":"ACCOUNT"}
                </span>
                {s<2&&<div style={{width:32,height:1,background:"rgba(255,255,255,0.1)"}}/>}
              </div>
            ))}
          </div>
        )}

        <div style={{background:O.bg2,border:"1px solid "+O.amberB,
          borderRadius:16,padding:"28px",boxShadow:"0 20px 60px rgba(0,0,0,0.5)"}}>

          {/* ── STEP 1: Business Info ── */}
          {step===1&&(
            <div>
              <div style={{fontFamily:O.sans,fontWeight:800,fontSize:22,
                color:"#fff",marginBottom:4}}>Tell us about your business</div>
              <div style={{fontFamily:O.mono,fontSize:10,color:O.textD,
                marginBottom:22,letterSpacing:0.5}}>
                We'll set up your workspace in seconds.
              </div>

              <div style={{marginBottom:14}}>
                <label style={labelStyle}>BUSINESS NAME *</label>
                <input value={bizName} onChange={e=>{setBizName(e.target.value);setErr("");}}
                  placeholder="Sea Lion Dockside Bar"
                  style={inputStyle}/>
              </div>

              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,marginBottom:14}}>
                <div>
                  <label style={labelStyle}>BUSINESS TYPE</label>
                  <select value={bizType} onChange={e=>setBizType(e.target.value)} style={selectStyle}>
                    {["Restaurant","Bar","Retail","Hotel","Healthcare","Service","Other"].map(t=>(
                      <option key={t} value={t} style={{background:"#0d1623"}}>{t}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label style={labelStyle}>TEAM SIZE</label>
                  <select value={empCount} onChange={e=>setEmpCount(e.target.value)} style={selectStyle}>
                    {["1-5","6-15","16-30","31-50","50+"].map(t=>(
                      <option key={t} value={t} style={{background:"#0d1623"}}>{t}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div style={{marginBottom:20}}>
                <label style={labelStyle}>LOCATION ADDRESS</label>
                <input value={address} onChange={e=>setAddress(e.target.value)}
                  placeholder="123 Main St, Newport, OR 97365"
                  style={inputStyle}/>
              </div>

              {err&&<div style={{fontFamily:O.mono,fontSize:9,color:O.red,
                marginBottom:12,padding:"8px 10px",
                background:"rgba(239,68,68,0.07)",
                border:"1px solid rgba(239,68,68,0.2)",borderRadius:6}}>{err}</div>}

              <button
                onClick={()=>{
                  if(!bizName){setErr("Business name is required.");return;}
                  setErr("");setStep(2);
                }}
                style={{width:"100%",padding:"14px",
                  background:"linear-gradient(135deg,#f59e0b,#f97316)",
                  border:"none",borderRadius:10,fontFamily:O.sans,fontWeight:700,
                  fontSize:15,color:"#030c14",cursor:"pointer",
                  boxShadow:"0 4px 20px rgba(245,158,11,0.3)"}}>
                Continue →
              </button>
              <div style={{textAlign:"center",marginTop:14}}>
                <a href="/" style={{fontFamily:O.mono,fontSize:9,color:O.textF,
                  letterSpacing:1,textDecoration:"none"}}>
                  Already have an account? Sign in
                </a>
              </div>
            </div>
          )}

          {/* ── STEP 2: Account ── */}
          {step===2&&(
            <div>
              <button onClick={()=>{setStep(1);setErr("");}}
                style={{background:"none",border:"none",color:O.textF,
                  fontFamily:O.mono,fontSize:10,letterSpacing:1,
                  cursor:"pointer",marginBottom:18}}>
                ← BACK
              </button>
              <div style={{fontFamily:O.sans,fontWeight:800,fontSize:22,
                color:"#fff",marginBottom:4}}>Create your account</div>
              <div style={{fontFamily:O.mono,fontSize:10,color:O.textD,
                marginBottom:22,letterSpacing:0.5}}>
                Setting up <span style={{color:O.amber}}>{bizName}</span>
              </div>

              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,marginBottom:14}}>
                {[
                  {l:"FIRST NAME",val:firstName,set:setFirstName,ph:"Alex"},
                  {l:"LAST NAME", val:lastName, set:setLastName, ph:"Rivera"},
                ].map(f=>(
                  <div key={f.l}>
                    <label style={labelStyle}>{f.l}</label>
                    <input value={f.val} onChange={e=>{f.set(e.target.value);setErr("");}}
                      placeholder={f.ph} style={inputStyle}/>
                  </div>
                ))}
              </div>

              <div style={{marginBottom:14}}>
                <label style={labelStyle}>WORK EMAIL</label>
                <input value={email} onChange={e=>{setEmail(e.target.value);setErr("");}}
                  type="email" placeholder="you@yourbusiness.com" style={inputStyle}/>
              </div>

              <div style={{marginBottom:14}}>
                <label style={labelStyle}>PASSWORD</label>
                <input value={pw} onChange={e=>{setPw(e.target.value);setErr("");}}
                  type="password" placeholder="Minimum 8 characters" style={inputStyle}/>
              </div>

              <div style={{marginBottom:err?8:18}}>
                <label style={labelStyle}>CONFIRM PASSWORD</label>
                <input value={pw2} onChange={e=>{setPw2(e.target.value);setErr("");}}
                  onKeyDown={e=>e.key==="Enter"&&handleSubmit()}
                  type="password" placeholder="Re-enter password" style={inputStyle}/>
              </div>

              {err&&<div style={{fontFamily:O.mono,fontSize:9,color:O.red,
                marginBottom:12,padding:"8px 10px",
                background:"rgba(239,68,68,0.07)",
                border:"1px solid rgba(239,68,68,0.2)",borderRadius:6}}>{err}</div>}

              <button onClick={handleSubmit}
                style={{width:"100%",padding:"14px",
                  background:busy?"rgba(245,158,11,0.5)":"linear-gradient(135deg,#f59e0b,#f97316)",
                  border:"none",borderRadius:10,fontFamily:O.sans,fontWeight:700,
                  fontSize:15,color:"#030c14",cursor:busy?"not-allowed":"pointer",
                  boxShadow:"0 4px 20px rgba(245,158,11,0.3)"}}>
                {busy?"Creating your account…":"Create Account & Launch →"}
              </button>

              <div style={{fontFamily:O.sans,fontSize:11,color:O.textF,
                textAlign:"center",marginTop:12,lineHeight:1.6}}>
                By creating an account you agree to our{" "}
                <a href="/about" style={{color:O.textD,textDecoration:"none"}}>Terms of Service</a>
              </div>
            </div>
          )}

          {/* ── STEP 3: Success ── */}
          {step===3&&(
            <div style={{textAlign:"center",padding:"20px 0"}}>
              <div style={{fontSize:56,marginBottom:16}}>🎉</div>
              <div style={{fontFamily:O.sans,fontWeight:800,fontSize:24,
                color:"#fff",marginBottom:8}}>Welcome to ShiftPro!</div>
              <div style={{fontFamily:O.sans,fontSize:15,color:O.textD,
                marginBottom:24,lineHeight:1.7}}>
                <span style={{color:O.amber,fontWeight:700}}>{bizName}</span> is ready.<br/>
                Your command center is being set up…
              </div>
              <div style={{fontFamily:O.mono,fontSize:10,color:O.textD,
                animation:"blink 1.5s infinite",letterSpacing:2}}>
                SIGNING YOU IN…
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
