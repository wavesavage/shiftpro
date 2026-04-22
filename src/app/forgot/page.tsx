"use client";
import React, { useState } from "react";

const C = {
  ocean100: "#e8f1f7", ocean200: "#d8e6ef", ocean300: "#bed2e0",
  amber500: "#e07b00", amber600: "#c96d00", amber700: "#a85a00",
  ink: "#0a0d1a", t1: "#0c1220", t2: "#2c3e50", t3: "#64748b", t4: "#94a3b8",
  border: "#d8e6ef", danger: "#dc2626", green500: "#22c55e",
};
const ff = {
  display: "'Fraunces','Georgia',serif",
  body: "'Inter',system-ui,sans-serif",
  mono: "'JetBrains Mono','SF Mono',monospace",
};
const GCSS = `
@import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,300;0,9..144,500;0,9..144,700;1,9..144,300&family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@500;600;700&display=swap');
@keyframes fadeUp{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)}}
*{box-sizing:border-box;margin:0;padding:0}body{-webkit-font-smoothing:antialiased}
`;

export default function ForgotPage() {
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const [err, setErr] = useState("");

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true); setErr("");
    try {
      const { createClient } = await import("@supabase/supabase-js");
      const sb = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL as string,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string
      );
      const { error } = await sb.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      if (error) throw error;
      setDone(true);
    } catch (e2: any) { setErr(e2.message || "Something went wrong."); }
    finally { setBusy(false); }
  };

  return (
    <div style={{ minHeight: "100vh", background: C.ocean100, fontFamily: ff.body, color: C.t1 }}>
      <style>{GCSS}</style>

      {/* Nav */}
      <nav style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "18px 32px", maxWidth: 1300, margin: "0 auto" }}>
        <a href="/" style={{ display: "flex", alignItems: "center", gap: 10, textDecoration: "none", color: C.t1 }}>
          <svg width="36" height="36" viewBox="0 0 36 36" fill="none"><rect width="36" height="36" rx="8" fill={C.ink}/><path d="M18 8c-1.5 4-4 6.5-8 8 4 1.5 6.5 4 8 8 1.5-4 4-6.5 8-8-4-1.5-6.5-4-8-8z" fill={C.amber500} opacity="0.9"/><circle cx="18" cy="18" r="2.5" fill="#fff"/></svg>
          <span style={{ fontFamily: ff.display, fontSize: 22, fontWeight: 500, letterSpacing: "-0.02em" }}>ShiftPro<span style={{ color: C.amber500, fontStyle: "italic" }}>.ai</span></span>
        </a>
        <a href="/" style={{ fontFamily: ff.mono, fontSize: 11, letterSpacing: 2, color: C.t3, textDecoration: "none", textTransform: "uppercase" }}>← Back to home</a>
      </nav>

      <div style={{ maxWidth: 480, margin: "60px auto 100px", padding: "0 20px", animation: "fadeUp 0.5s cubic-bezier(.22,1,.36,1)" }}>
        {!done ? (
          <div style={{ background: "#fff", borderRadius: 4, border: "1px solid " + C.border, padding: "40px 36px", boxShadow: "0 12px 50px rgba(12,18,32,0.06)" }}>
            <div style={{ marginBottom: 28 }}>
              <div style={{ fontFamily: ff.display, fontSize: 32, fontWeight: 500, letterSpacing: "-0.025em", lineHeight: 1.05, marginBottom: 10 }}>
                Forgot your<br /><span style={{ fontStyle: "italic", fontWeight: 300, color: C.amber500 }}>password?</span>
              </div>
              <p style={{ fontFamily: ff.body, fontSize: 14, color: C.t3, lineHeight: 1.55 }}>
                Enter your email and we'll send a reset link. Check your spam folder if it doesn't arrive in a minute.
              </p>
            </div>
            <form onSubmit={submit}>
              <label style={{ display: "block", fontFamily: ff.mono, fontSize: 9, letterSpacing: 2, color: C.t3, marginBottom: 6, textTransform: "uppercase", fontWeight: 600 }}>Email</label>
              <input
                type="email" value={email} onChange={(e) => setEmail(e.target.value)} required
                placeholder="you@business.com"
                style={{ width: "100%", padding: "13px 14px", background: C.ocean100, border: "1px solid " + C.ocean200, borderRadius: 3, color: C.t1, fontSize: 14, fontFamily: ff.body, marginBottom: 18, transition: "all .15s" }}
                onFocus={(e) => { e.currentTarget.style.borderColor = C.amber500; e.currentTarget.style.background = "#fff"; }}
                onBlur={(e) => { e.currentTarget.style.borderColor = C.ocean200; e.currentTarget.style.background = C.ocean100; }}
              />
              {err && <div style={{ padding: "10px 12px", background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.22)", borderRadius: 3, fontSize: 12.5, color: C.danger, marginBottom: 16, fontFamily: ff.body }}>{err}</div>}
              <button type="submit" disabled={busy} style={{ width: "100%", padding: "15px", borderRadius: 3, border: "none", background: busy ? C.ocean300 : C.ink, color: "#fff", fontFamily: ff.body, fontWeight: 700, fontSize: 14.5, cursor: busy ? "wait" : "pointer", boxShadow: busy ? "none" : "0 4px 0 " + C.amber700, transition: "all .15s", marginBottom: 16 }}>
                {busy ? "Sending…" : "Send reset link →"}
              </button>
              <div style={{ textAlign: "center", fontSize: 13, color: C.t3 }}>
                Remember it? <a href="/" style={{ color: C.amber600, fontWeight: 600, textDecoration: "none" }}>Sign in</a>
              </div>
            </form>
          </div>
        ) : (
          <div style={{ background: "#fff", borderRadius: 4, border: "1px solid " + C.border, padding: "48px 36px", textAlign: "center", boxShadow: "0 12px 50px rgba(12,18,32,0.06)" }}>
            <div style={{ width: 52, height: 52, borderRadius: "50%", background: C.green500 + "18", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px" }}>
              <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke={C.green500} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
            </div>
            <div style={{ fontFamily: ff.display, fontSize: 28, fontWeight: 500, letterSpacing: "-0.02em", marginBottom: 10 }}>Check your inbox.</div>
            <p style={{ fontFamily: ff.body, fontSize: 14, color: C.t3, lineHeight: 1.6, marginBottom: 24 }}>
              A reset link is on its way to <strong style={{ color: C.t1 }}>{email}</strong>.<br />It expires in 60 minutes.
            </p>
            <a href="/" style={{ fontFamily: ff.body, fontWeight: 700, fontSize: 14, color: C.amber600, textDecoration: "none" }}>← Back to sign in</a>
          </div>
        )}
      </div>

      <footer style={{ borderTop: "1px solid " + C.border, padding: "20px 32px", textAlign: "center", fontFamily: ff.mono, fontSize: 10, color: C.t4, letterSpacing: 1 }}>
        SHIFTPRO AI, INC. · HELLO@SHIFTPRO.AI · © 2025
      </footer>
    </div>
  );
}

