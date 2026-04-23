// patched"use client";
import React from "react";
import { SiteNav } from "@/components/SiteNav";

const C = {
  ocean100: "#e8f1f7", ocean200: "#d8e6ef",
  amber500: "#e07b00", ink: "#0a0d1a",
  t1: "#0c1220", t2: "#2c3e50", t3: "#64748b", t4: "#94a3b8",
  border: "#d8e6ef", parchment: "#faf6ee",
};
const ff = {
  display: "'Fraunces','Georgia',serif",
  body: "'Inter',system-ui,sans-serif",
  mono: "'JetBrains Mono','SF Mono',monospace",
};
const GCSS = `
@import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,300;0,9..144,500;0,9..144,700;1,9..144,300&family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@500;600;700&display=swap');
@keyframes fadeIn{from{opacity:0}to{opacity:1}}
*{box-sizing:border-box;margin:0;padding:0}body{-webkit-font-smoothing:antialiased}
a{color:#e07b00;text-decoration:none}a:hover{text-decoration:underline}
`;

const sections = [
  {
    title: "What we collect",
    body: `When you create an account: your name, email address, and business name. When employees join: their name and email. When you use the scheduling features: shift data, clock-in/out times, swap requests, and team messages. When you visit the site: standard server logs (IP address, browser, pages visited). We do not collect payment card data — that is handled directly by our payment processor.`,
  },
  {
    title: "How we use it",
    body: `To provide the service: powering schedules, timesheets, notifications, and messaging. To communicate with you: product updates, billing notices, and support responses. To improve the product: aggregate, anonymized usage patterns (never individual employee data). We do not use your data to train AI models or sell it to advertisers.`,
  },
  {
    title: "Who we share it with",
    body: `We share data only with essential service providers: our cloud infrastructure (Supabase), email delivery (Resend), and payment processing. These providers are bound by data processing agreements. We do not sell, trade, or rent your data to any third party. If we are acquired, your data stays subject to this policy or you will be notified with 30 days to export.`,
  },
  {
    title: "Employee data",
    body: `Employees added to your account are sub-processors under your control. You are responsible for informing your employees that their scheduling and time data is processed through ShiftPro. Employees may request access to their own records by contacting the business owner or emailing us directly.`,
  },
  {
    title: "Data retention",
    body: `Your data is retained while your account is active. If you cancel, your data is kept for 30 days in case you return, then permanently deleted. You can request immediate deletion at any time by emailing hello@shiftpro.ai. Payroll export records are retained for 7 years as required by law.`,
  },
  {
    title: "Security",
    body: `All data is encrypted in transit (TLS 1.2+) and at rest (AES-256). Our database uses Row-Level Security so your data is isolated from other accounts at the query level. We conduct regular security reviews and promptly address vulnerabilities. If a breach affects your data, we will notify you within 72 hours.`,
  },
  {
    title: "Cookies",
    body: `We use only essential cookies: one session cookie to keep you logged in, and one preference cookie for your display settings. We do not use advertising cookies, tracking pixels, or third-party analytics that share data externally. You can disable cookies in your browser but login functionality will be affected.`,
  },
  {
    title: "Your rights",
    body: `You have the right to access, correct, or delete any personal data we hold. You can export all your data from the account settings page. To exercise any of these rights or ask a question, email hello@shiftpro.ai — we respond within 2 business days.`,
  },
  {
    title: "Changes to this policy",
    body: `We'll email account owners at least 14 days before any material changes take effect. The updated date at the top of this page will reflect any revision. Continued use after changes means acceptance.`,
  },
  {
    title: "Contact",
    body: `Privacy questions? Email hello@shiftpro.ai. ShiftPro AI, Inc., Bend, Oregon.`,
  },
];

export default function PrivacyPage() {
  return (
    <div style={{ minHeight: "100vh", background: C.ocean100, fontFamily: ff.body, color: C.t1 }}>
      <style>{GCSS}</style>

      {/* Nav */}
      <SiteNav backLabel="← Back to home" />

      {/* Hero */}
      <div style={{ background: C.parchment, borderBottom: "1px solid #e8dfc8", padding: "60px 32px 52px", textAlign: "center" }}>
        <div style={{ fontFamily: ff.mono, fontSize: 10, letterSpacing: 3, color: C.t3, textTransform: "uppercase", marginBottom: 16, fontWeight: 600 }}>Legal</div>
        <h1 style={{ fontFamily: ff.display, fontSize: "clamp(36px,5vw,64px)", fontWeight: 500, letterSpacing: "-0.035em", lineHeight: 0.95, marginBottom: 16 }}>
          Privacy<br /><span style={{ fontStyle: "italic", fontWeight: 300, color: C.amber500 }}>Policy.</span>
        </h1>
        <p style={{ fontFamily: ff.body, fontSize: 14, color: C.t3, marginTop: 16 }}>
          Last updated: April 2025 · <a href="/terms">Terms of Service</a>
        </p>
      </div>

      {/* Content */}
      <div style={{ maxWidth: 760, margin: "0 auto", padding: "60px 32px 100px", animation: "fadeIn 0.4s" }}>
        <p style={{ fontFamily: ff.body, fontSize: 15.5, color: C.t2, lineHeight: 1.7, marginBottom: 48, padding: "20px 24px", background: "#fff", borderRadius: 4, border: "1px solid " + C.border, borderLeft: "3px solid " + C.amber500 }}>
          The short version: your data is yours. We don't sell it. We don't use it to train AI. You can delete everything and leave anytime.
        </p>

        {sections.map((s, i) => (
          <div key={i} style={{ marginBottom: 40, paddingBottom: 40, borderBottom: i < sections.length - 1 ? "1px solid " + C.border : "none" }}>
            <h2 style={{ fontFamily: ff.display, fontSize: 22, fontWeight: 500, letterSpacing: "-0.015em", color: C.t1, marginBottom: 12 }}>{s.title}</h2>
            <p style={{ fontFamily: ff.body, fontSize: 15, color: C.t2, lineHeight: 1.75 }}>{s.body}</p>
          </div>
        ))}
      </div>

      <footer style={{ borderTop: "1px solid " + C.border, padding: "20px 32px", textAlign: "center", fontFamily: ff.mono, fontSize: 10, color: C.t4, letterSpacing: 1 }}>
        SHIFTPRO AI, INC. · HELLO@SHIFTPRO.AI · © 2025
      </footer>
    </div>
  );
}

