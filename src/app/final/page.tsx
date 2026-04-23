"use client";
import React, { useState, useEffect } from "react";
import { SiteNav } from "@/components/SiteNav";

const C = {
  ocean50: "#f4f9fc", ocean100: "#e8f1f7", ocean200: "#d8e6ef", ocean300: "#bed2e0",
  amber500: "#e07b00", amber600: "#c96d00", amber700: "#a85a00",
  ink: "#0a0d1a", t1: "#0c1220", t2: "#2c3e50", t3: "#64748b", t4: "#94a3b8",
  border: "#d8e6ef", danger: "#dc2626", green500: "#22c55e", sage: "#6b7a58",
};
const ff = {
  display: "'Fraunces','Georgia',serif",
  body: "'Inter',system-ui,sans-serif",
  mono: "'JetBrains Mono','SF Mono',monospace",
};
const GCSS = `
@keyframes spin{to{transform:rotate(360deg)}}
@keyframes fadeIn{from{opacity:0}to{opacity:1}}
@keyframes fadeUp{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}
*{box-sizing:border-box;margin:0;padding:0}body{-webkit-font-smoothing:antialiased}
::selection{background:#e07b0033}input:focus{outline:none}
`;

const PLANS = [
  {
    id: "free", name: "Free", price: "$0", period: "forever",
    desc: "Try it with your first location.", limits: "5 employees · 1 location",
    features: ["Drag-and-drop scheduling","Clock in / out","Shift swap requests","Team chat","Mobile app access"],
    cta: "Start free", popular: false,
  },
  {
    id: "starter", name: "Starter", price: "$19", period: "/mo per location",
    desc: "Everything you need for a single operation.", limits: "Unlimited employees",
    features: ["Everything in Free","Unlimited employees","Multi-location support","Payroll export (CSV)","Email notifications","7-day scheduling history"],
    cta: "Start Starter", popular: false,
  },
  {
    id: "pro", name: "Pro", price: "$49", period: "/mo per location",
    desc: "For operators who want it all on autopilot.", limits: "Unlimited everything",
    features: ["Everything in Starter","AI schedule suggestions","Advanced analytics","Priority support","Custom roles & permissions","Full scheduling history","API access"],
    cta: "Start Pro", popular: true,
  },
  {
    id: "enterprise", name: "Enterprise", price: "Custom", period: "let's talk",
    desc: "Multi-brand operators and franchises.", limits: "White-glove onboarding",
    features: ["Everything in Pro","Dedicated account manager","Custom integrations","SSO / SAML","SLA & uptime guarantee","Custom reporting"],
    cta: "Contact us", popular: false,
  },
];

export default function FinalPage() {
  const [step, setStep] = useState<"plan"|"signup">("plan");
  const [selectedPlan, setSelectedPlan] = useState("pro");
  const [email, setEmail] = useState("");
  const [pw, setPw] = useState("");
  const [biz, setBiz] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const [done, setDone] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const e = params.get("email");
      if (e) { setEmail(e); setStep("signup"); }
      setIsMobile(window.innerWidth < 700);
      const h = () => setIsMobile(window.innerWidth < 700);
      window.addEventListener("resize", h);
      return () => window.removeEventListener("resize", h);
    }
  }, []);

  const submit = async (e2?: React.FormEvent) => {
    if (e2) e2.preventDefault();
    if (!email || !pw) { setErr("Email and password are required."); return; }
    if (pw.length < 6) { setErr("Password must be at least 6 characters."); return; }
    setBusy(true); setErr("");
    try {
      const { createClient } = await import("@supabase/supabase-js");
      const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL as string, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string);
      const { error } = await sb.auth.signUp({ email, password: pw, options: { data: { business_name: biz, plan: selectedPlan } } });
      if (error) throw error;
      setDone(true);
    } catch (e3: any) { setErr(e3.message || "Something went wrong."); }
    finally { setBusy(false); }
  };

  const plan = PLANS.find((p) => p.id === selectedPlan)!;

  return (
    <div style={{ minHeight: "100vh", background: C.ocean100, fontFamily: ff.body, color: C.t1 }}>
      <style>{GCSS}</style>
      <SiteNav backLabel="← Back to home" />

      <div style={{ maxWidth: 1200, margin: "0 auto", padding: isMobile ? "30px 20px 80px" : "40px 40px 100px", animation: "fadeIn 0.5s" }}>
        <div style={{ textAlign: "center", marginBottom: isMobile ? 40 : 60 }}>
          <h1 style={{ fontFamily: ff.display, fontSize: isMobile ? 38 : "clamp(48px,5.5vw,72px)", fontWeight: 500, letterSpacing: "-0.04em", lineHeight: 0.95, marginBottom: 16 }}>
            {step === "plan" ? (<>Pick your plan.<br /><span style={{ fontStyle: "italic", fontWeight: 300, color: C.amber500 }}>Start today.</span></>) : (<>Almost there.<br /><span style={{ fontStyle: "italic", fontWeight: 300, color: C.amber500 }}>Let's build.</span></>)}
          </h1>
          <p style={{ fontFamily: ff.body, fontSize: 16, color: C.t3, maxWidth: 480, margin: "0 auto" }}>
            {step === "plan" ? "No credit card required. Upgrade or downgrade anytime." : `You selected the ${plan.name} plan. You can change this later.`}
          </p>
        </div>

        {step === "plan" && (
          <div style={{ animation: "fadeUp 0.5s cubic-bezier(.22,1,.36,1)" }}>
            <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "repeat(4,1fr)", gap: isMobile ? 16 : 20, maxWidth: 1100, margin: "0 auto 40px" }}>
              {PLANS.map((p) => {
                const active = selectedPlan === p.id;
                return (
                  <div key={p.id} onClick={() => setSelectedPlan(p.id)} style={{ position: "relative", background: active ? "#fff" : C.ocean50, border: active ? "2px solid "+C.amber500 : "1.5px solid "+C.border, borderRadius: 4, padding: isMobile ? "24px 20px" : "30px 24px", cursor: "pointer", transition: "all 0.2s", transform: active && p.popular && !isMobile ? "translateY(-8px)" : "none", boxShadow: active ? "0 16px 60px rgba(224,123,0,0.12)" : "0 2px 12px rgba(12,18,32,0.04)" }}>
                    {p.popular && (<div style={{ position: "absolute", top: -13, left: "50%", transform: "translateX(-50%) rotate(-1.5deg)", background: C.amber500, color: "#fff", fontFamily: ff.mono, fontSize: 9, letterSpacing: 2, padding: "4px 14px", fontWeight: 700, textTransform: "uppercase", whiteSpace: "nowrap" }}>MOST POPULAR</div>)}
                    <div style={{ width: 20, height: 20, borderRadius: "50%", border: active ? "2px solid "+C.amber500 : "2px solid "+C.ocean300, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 18, transition: "all 0.15s" }}>
                      {active && <div style={{ width: 10, height: 10, borderRadius: "50%", background: C.amber500 }}/>}
                    </div>
                    <div style={{ fontFamily: ff.mono, fontSize: 10, letterSpacing: 2, color: C.t4, textTransform: "uppercase", marginBottom: 8, fontWeight: 600 }}>{p.name}</div>
                    <div style={{ display: "flex", alignItems: "baseline", gap: 4, marginBottom: 6 }}>
                      <span style={{ fontFamily: ff.display, fontSize: p.id === "enterprise" ? 28 : 40, fontWeight: 500, letterSpacing: "-0.03em", color: C.t1 }}>{p.price}</span>
                      <span style={{ fontFamily: ff.body, fontSize: 13, color: C.t3 }}>{p.period}</span>
                    </div>
                    <div style={{ fontSize: 13, color: C.t3, marginBottom: 18, lineHeight: 1.5 }}>{p.desc}</div>
                    <div style={{ fontFamily: ff.mono, fontSize: 10, color: active ? C.amber600 : C.t4, letterSpacing: 1, marginBottom: 16, fontWeight: 600 }}>{p.limits}</div>
                    <div style={{ borderTop: "1px solid "+(active ? C.amber500+"30" : C.border), paddingTop: 14 }}>
                      {p.features.map((f, i) => (<div key={i} style={{ display: "flex", gap: 8, alignItems: "flex-start", marginBottom: 8 }}><span style={{ color: active ? C.amber500 : C.sage, fontSize: 14, lineHeight: "20px", flexShrink: 0 }}>✓</span><span style={{ fontSize: 12.5, color: C.t2, lineHeight: "20px" }}>{f}</span></div>))}
                    </div>
                  </div>
                );
              })}
            </div>
            <div style={{ textAlign: "center" }}>
              <button onClick={() => { if (selectedPlan === "enterprise") { window.location.href = "mailto:hello@shiftpro.ai?subject=Enterprise%20inquiry"; return; } setStep("signup"); }} style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "16px 40px", background: C.ink, color: "#fff", fontFamily: ff.body, fontWeight: 700, fontSize: 15, borderRadius: 3, border: "none", cursor: "pointer", boxShadow: "0 4px 0 "+C.amber600, letterSpacing: "-0.01em", transition: "transform 0.15s" }} onMouseEnter={(e)=>(e.currentTarget as HTMLElement).style.transform="translateY(-2px)"} onMouseLeave={(e)=>(e.currentTarget as HTMLElement).style.transform="none"}>
                {selectedPlan === "enterprise" ? "Contact us →" : `Continue with ${plan.name} →`}
              </button>
              <div style={{ marginTop: 14, fontFamily: ff.mono, fontSize: 10, color: C.t4, letterSpacing: 1 }}>NO CREDIT CARD · CANCEL ANYTIME</div>
            </div>
          </div>
        )}

        {step === "signup" && !done && (
          <div style={{ maxWidth: 480, margin: "0 auto", animation: "fadeUp 0.5s cubic-bezier(.22,1,.36,1)" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", background: C.ocean50, border: "1px solid "+C.border, borderRadius: 4, padding: "14px 18px", marginBottom: 28 }}>
              <div>
                <div style={{ fontFamily: ff.mono, fontSize: 9, letterSpacing: 2, color: C.t4, textTransform: "uppercase", marginBottom: 3 }}>Selected plan</div>
                <div style={{ fontFamily: ff.display, fontSize: 20, fontWeight: 500, color: C.t1 }}>{plan.name} <span style={{ fontFamily: ff.body, fontSize: 14, color: C.t3, fontWeight: 400 }}>· {plan.price} {plan.period}</span></div>
              </div>
              <button onClick={() => setStep("plan")} style={{ fontFamily: ff.mono, fontSize: 10, letterSpacing: 1, color: C.amber600, background: "none", border: "none", cursor: "pointer", textTransform: "uppercase", fontWeight: 700 }}>Change</button>
            </div>
            <div style={{ background: "#fff", borderRadius: 4, border: "1px solid "+C.border, padding: isMobile ? "28px 22px" : "36px 32px", boxShadow: "0 12px 50px rgba(12,18,32,0.06)" }}>
              <div style={{ marginBottom: 24 }}>
                <div style={{ fontFamily: ff.display, fontSize: 26, fontWeight: 500, letterSpacing: "-0.02em", lineHeight: 1.1 }}>Create your account</div>
                <div style={{ fontFamily: ff.body, fontSize: 13, color: C.t3, marginTop: 6 }}>Set up in the time it takes to pull a shot of espresso.</div>
              </div>
              <form onSubmit={submit}>
                {[{label:"Business name",type:"text",val:biz,set:setBiz,ph:"e.g. The Parlor"},{label:"Email",type:"email",val:email,set:setEmail,ph:"you@business.com"},{label:"Password",type:"password",val:pw,set:setPw,ph:"••••••••••"}].map(({label,type,val,set,ph},i)=>(
                  <div key={i}>
                    <label style={{ display:"block", fontFamily:ff.mono, fontSize:9, letterSpacing:2, color:C.t3, marginBottom:6, textTransform:"uppercase", fontWeight:600 }}>{label}</label>
                    <input type={type} value={val} onChange={(e)=>set(e.target.value)} required={i>0} placeholder={ph}
                      style={{ width:"100%", padding:"13px 14px", background:C.ocean100, border:"1px solid "+C.ocean200, borderRadius:3, color:C.t1, fontSize:14, fontFamily:ff.body, marginBottom:16, transition:"all .15s" }}
                      onFocus={(e)=>{e.currentTarget.style.borderColor=C.amber500;e.currentTarget.style.background="#fff";}}
                      onBlur={(e)=>{e.currentTarget.style.borderColor=C.ocean200;e.currentTarget.style.background=C.ocean100;}}/>
                  </div>
                ))}
                {err && <div style={{ padding:"10px 12px", background:"rgba(239,68,68,0.08)", border:"1px solid rgba(239,68,68,0.22)", borderRadius:3, fontSize:12.5, color:C.danger, marginBottom:16, fontFamily:ff.body }}>{err}</div>}
                <button type="submit" disabled={busy} style={{ width:"100%", padding:"15px", borderRadius:3, border:"none", background:busy?C.ocean300:C.ink, color:"#fff", fontFamily:ff.body, fontWeight:700, fontSize:14.5, cursor:busy?"wait":"pointer", boxShadow:busy?"none":"0 4px 0 "+C.amber600, transition:"all .15s", letterSpacing:"-0.01em", marginBottom:16 }}>
                  {busy ? "Creating account…" : "Create account →"}
                </button>
                <div style={{ textAlign:"center", fontSize:12.5, color:C.t3, fontFamily:ff.body }}>
                  Already have an account? <a href="/" style={{ color:C.amber600, fontWeight:600, textDecoration:"none" }}>Sign in</a>
                </div>
              </form>
            </div>
            <div style={{ textAlign:"center", marginTop:24, fontFamily:ff.mono, fontSize:10, color:C.t4, letterSpacing:1 }}>NO CREDIT CARD · 7-DAY FREE TRIAL · CANCEL ANYTIME</div>
          </div>
        )}

        {done && (
          <div style={{ maxWidth:480, margin:"0 auto", textAlign:"center", animation:"fadeUp 0.5s cubic-bezier(.22,1,.36,1)" }}>
            <div style={{ background:"#fff", borderRadius:4, border:"1px solid "+C.border, padding:isMobile?"40px 24px":"56px 40px", boxShadow:"0 12px 50px rgba(12,18,32,0.06)" }}>
              <div style={{ width:56, height:56, borderRadius:"50%", background:C.green500+"18", display:"flex", alignItems:"center", justifyContent:"center", margin:"0 auto 20px" }}>
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke={C.green500} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
              </div>
              <h2 style={{ fontFamily:ff.display, fontSize:30, fontWeight:500, letterSpacing:"-0.025em", marginBottom:12 }}>You're in.</h2>
              <p style={{ fontFamily:ff.body, fontSize:15, color:C.t3, lineHeight:1.6, marginBottom:28 }}>Check your email for a confirmation link.<br/>Once confirmed, sign in and start building your first schedule.</p>
              <a href="/" style={{ display:"inline-flex", alignItems:"center", gap:6, padding:"14px 32px", background:C.ink, color:"#fff", fontFamily:ff.body, fontWeight:700, fontSize:14, borderRadius:3, textDecoration:"none", boxShadow:"0 4px 0 "+C.amber600, transition:"transform 0.15s" }} onMouseEnter={(e)=>(e.currentTarget as HTMLElement).style.transform="translateY(-2px)"} onMouseLeave={(e)=>(e.currentTarget as HTMLElement).style.transform="none"}>
                Go to sign in →
              </a>
            </div>
          </div>
        )}
      </div>

      <footer style={{ borderTop:"1px solid "+C.border, padding:"24px 32px", textAlign:"center", fontFamily:ff.mono, fontSize:10, color:C.t4, letterSpacing:1 }}>
        SHIFTPRO AI, INC. · HELLO@SHIFTPRO.AI · © 2025
      </footer>
    </div>
  );
}

