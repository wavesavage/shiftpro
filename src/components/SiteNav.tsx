"use client";
import React from "react";

// ═══════════════════════════════════════════════════════════════
// SHARED SITENAV — ShiftPro.ai
// Import this in every page for consistent branding.
// Usage:
//   import { SiteNav } from "@/components/SiteNav";
//   <SiteNav backLabel="← Back to home" backHref="/" />
// ═══════════════════════════════════════════════════════════════

const GCSS_NAV = `
@import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,300;0,9..144,500;0,9..144,700;1,9..144,300&family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@500;600;700&display=swap');
`;

function SwirlMark({ size = 56 }: { size?: number }) {
  const uid = "sm" + Math.random().toString(36).slice(2, 6);
  return (
    <svg
      width={size} height={size} viewBox="0 0 130 130"
      xmlns="http://www.w3.org/2000/svg"
      style={{ flexShrink: 0, overflow: "visible", display: "block" }}
    >
      <defs>
        <linearGradient id={uid + "g1"} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%"   stopColor="#00d4ff"/>
          <stop offset="100%" stopColor="#0066cc"/>
        </linearGradient>
        <linearGradient id={uid + "g2"} x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%"   stopColor="#f59e0b"/>
          <stop offset="100%" stopColor="#fbbf24"/>
        </linearGradient>
        <linearGradient id={uid + "g3"} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%"   stopColor="#38bdf8"/>
          <stop offset="100%" stopColor="#0ea5e9"/>
        </linearGradient>
        <filter id={uid + "gl"}>
          <feGaussianBlur stdDeviation="2" result="b"/>
          <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
        </filter>
      </defs>
      <g transform="translate(65,65)">
        <circle cx="0" cy="0" r="57" fill="none" stroke="rgba(0,212,255,0.15)" strokeWidth="7"/>
        <path d="M -50 14 A 53 53 0 0 1 18 -50 L 11 -33 A 36 36 0 0 0 -33 9 Z"
          fill={"url(#"+uid+"g1)"} opacity="0.95" filter={"url(#"+uid+"gl)"}/>
        <path d="M 18 -50 A 53 53 0 0 1 50 16 L 33 11 A 36 36 0 0 0 13 -33 Z"
          fill="#1e7fd4" opacity="0.9"/>
        <path d="M 50 16 A 53 53 0 0 1 -50 14 L -33 9 A 36 36 0 0 0 33 11 Z"
          fill="#0c4fa0" opacity="0.85"/>
        <path d="M -27 -48 A 55 55 0 0 1 48 -26 L 40 -17 A 44 44 0 0 0 -20 -38 Z"
          fill={"url(#"+uid+"g2)"} opacity="1" filter={"url(#"+uid+"gl)"}/>
        <circle cx="0" cy="0" r="20" fill="rgba(14,165,233,0.12)"/>
        <circle cx="0" cy="0" r="20" fill="none" stroke={"url(#"+uid+"g3)"} strokeWidth="1.5" opacity="0.65"/>
        <circle cx="0" cy="0" r="9.5" fill={"url(#"+uid+"g1)"} filter={"url(#"+uid+"gl)"}/>
        <circle cx="0" cy="0" r="4.5" fill="#fff" opacity="0.92"/>
        <circle cx="0" cy="0" r="2.2" fill="#00d4ff"/>
      </g>
    </svg>
  );
}

interface SiteNavProps {
  /** Optional right-side label. Defaults to nothing (just the logo). */
  backLabel?: string;
  backHref?: string;
  /** Optional right-side slot — pass any React node for custom right content */
  right?: React.ReactNode;
}

export function SiteNav({ backLabel, backHref = "/", right }: SiteNavProps) {
  return (
    <>
      <style>{GCSS_NAV}</style>
      <nav style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "16px 32px", maxWidth: 1320, margin: "0 auto",
      }}>
        {/* Logo — identical to landing page */}
        <a
          href="/"
          style={{ display: "flex", alignItems: "center", gap: 13, textDecoration: "none", color: "#0c1220", flexShrink: 0 }}
        >
          <SwirlMark size={56} />
          <div style={{ display: "flex", flexDirection: "column", lineHeight: 1 }}>
            <span style={{
              fontFamily: "'Fraunces','Georgia',serif",
              fontWeight: 700, fontSize: 30, color: "#0c1220", letterSpacing: "-0.03em",
            }}>
              ShiftPro<span style={{ color: "#e07b00", fontStyle: "italic", fontWeight: 400 }}>.ai</span>
            </span>
            <span style={{
              fontFamily: "'JetBrains Mono','SF Mono',monospace",
              fontSize: 9, color: "#64748b", letterSpacing: 2.2, marginTop: 4, fontWeight: 500,
            }}>
              EST. BEND, OR · 2025
            </span>
          </div>
        </a>

        {/* Right slot */}
        {right ?? (backLabel && (
          <a
            href={backHref}
            style={{
              fontFamily: "'JetBrains Mono','SF Mono',monospace",
              fontSize: 11, letterSpacing: 2, color: "#64748b",
              textDecoration: "none", textTransform: "uppercase",
            }}
          >
            {backLabel}
          </a>
        ))}
      </nav>
    </>
  );
}

