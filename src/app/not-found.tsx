"use client";
import React, { useEffect, useState } from "react";
import { SiteNav } from "@/components/SiteNav";

const C = {
  ocean100: "#e8f1f7", amber500: "#e07b00", amber600: "#c96d00",
  ink: "#0a0d1a", t1: "#0c1220", t3: "#64748b", t4: "#94a3b8", border: "#d8e6ef",
};
const ff = {
  display: "'Fraunces','Georgia',serif",
  body: "'Inter',system-ui,sans-serif",
  mono: "'JetBrains Mono','SF Mono',monospace",
};
const GCSS = `
@import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,300;0,9..144,500;0,9..144,700;1,9..144,300&family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@500;600;700&display=swap');
@keyframes fadeUp{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}
@keyframes drift{0%,100%{transform:translateY(0)}50%{transform:translateY(-8px)}}
*{box-sizing:border-box;margin:0;padding:0}body{-webkit-font-smoothing:antialiased}
`;

export default function NotFound() {
  const [count, setCount] = useState(10);
  useEffect(() => {
    const t = setInterval(() => setCount(c => {
      if (c <= 1) { clearInterval(t); window.location.href = "/"; return 0; }
      return c - 1;
    }), 1000);
    return () => clearInterval(t);
  }, []);

  return (
    <div style={{ minHeight: "100vh", background: C.ocean100, fontFamily: ff.body, color: C.t1, display: "flex", flexDirection: "column" }}>
      <style>{GCSS}</style>

      {/* Nav */}
      <SiteNav />

      {/* Center content */}
      <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: "40px 20px" }}>
        <div style={{ textAlign: "center", animation: "fadeUp 0.6s cubic-bezier(.22,1,.36,1)" }}>

          {/* Floating 404 */}
          <div style={{ fontFamily: ff.display, fontSize: "clamp(100px,20vw,180px)", fontWeight: 700, letterSpacing: "-0.05em", lineHeight: 1, color: C.t1, animation: "drift 4s ease-in-out infinite", marginBottom: 8 }}>
            4<span style={{ color: C.amber500, fontStyle: "italic", fontWeight: 300 }}>0</span>4
          </div>

          <div style={{ fontFamily: ff.mono, fontSize: 11, letterSpacing: 3, color: C.t3, marginBottom: 20, textTransform: "uppercase", fontWeight: 600 }}>
            Page not found
          </div>

          <p style={{ fontFamily: ff.body, fontSize: 16, color: C.t3, lineHeight: 1.6, maxWidth: 360, margin: "0 auto 36px" }}>
            This shift got cancelled. The page you're looking for doesn't exist or was moved.
          </p>

          <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
            <a href="/"
              style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "14px 28px", background: C.ink, color: "#fff", fontFamily: ff.body, fontWeight: 700, fontSize: 14, borderRadius: 3, textDecoration: "none", boxShadow: "0 4px 0 " + C.amber600, transition: "transform .15s" }}
              onMouseEnter={(e) => (e.currentTarget as HTMLElement).style.transform = "translateY(-2px)"}
              onMouseLeave={(e) => (e.currentTarget as HTMLElement).style.transform = "none"}
            >
              Back to home →
            </a>
            <a href="mailto:hello@shiftpro.ai"
              style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "14px 28px", background: "transparent", color: C.t1, fontFamily: ff.body, fontWeight: 600, fontSize: 14, borderRadius: 3, textDecoration: "none", border: "1.5px solid " + C.border, transition: "all .15s" }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.borderColor = C.t1; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.borderColor = C.border; }}
            >
              Contact support
            </a>
          </div>

          <div style={{ marginTop: 36, fontFamily: ff.mono, fontSize: 10, color: C.t4, letterSpacing: 1 }}>
            Redirecting to home in {count}s
          </div>
        </div>
      </div>

      <footer style={{ borderTop: "1px solid " + C.border, padding: "20px 32px", textAlign: "center", fontFamily: ff.mono, fontSize: 10, color: C.t4, letterSpacing: 1 }}>
        SHIFTPRO AI, INC. · HELLO@SHIFTPRO.AI · © 2025
      </footer>
    </div>
  );
}

