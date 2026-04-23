// patched"use client";
import React from "react";

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
    title: "1. Acceptance of Terms",
    body: `By accessing or using ShiftPro.ai ("Service"), you agree to be bound by these Terms of Service. If you do not agree, please do not use the Service. These terms apply to all users including business owners and employees.`,
  },
  {
    title: "2. Description of Service",
    body: `ShiftPro.ai provides workforce scheduling, time tracking, shift management, and team communication tools for small and medium-sized businesses. Features vary by subscription plan. We reserve the right to modify or discontinue features with reasonable notice.`,
  },
  {
    title: "3. Accounts and Registration",
    body: `You must provide accurate information when creating an account. You are responsible for maintaining the security of your credentials. Notify us immediately at hello@shiftpro.ai if you suspect unauthorized account access. One account per business entity unless under an Enterprise agreement.`,
  },
  {
    title: "4. Subscription Plans and Billing",
    body: `Paid plans are billed monthly per location. Your subscription renews automatically at the end of each billing period. You may cancel at any time; access continues through the end of the paid period. We do not provide prorated refunds for partial months. Pricing is subject to change with 30 days advance notice.`,
  },
  {
    title: "5. Free Trial",
    body: `New accounts receive a 7-day free trial with access to paid features. No credit card is required for the trial. At the end of the trial, you may choose a plan or revert to the free tier. We do not auto-charge without a card on file.`,
  },
  {
    title: "6. Data and Privacy",
    body: `Your data belongs to you. We do not sell your employee or business data to third parties. See our Privacy Policy for full details on how we collect, use, and protect your information. You may export or request deletion of your data at any time.`,
  },
  {
    title: "7. Acceptable Use",
    body: `You agree not to use the Service for unlawful purposes, to harass or harm others, to attempt unauthorized access to our systems, or to reverse-engineer any part of the platform. Violation of these terms may result in immediate account termination.`,
  },
  {
    title: "8. Uptime and Service Availability",
    body: `We target 99.9% uptime for paid plans but do not guarantee uninterrupted service. Scheduled maintenance is communicated in advance. We are not liable for losses resulting from service interruptions beyond our reasonable control.`,
  },
  {
    title: "9. Limitation of Liability",
    body: `ShiftPro AI, Inc. is not liable for indirect, incidental, or consequential damages arising from your use of the Service. Our total liability to you shall not exceed the fees paid in the 12 months preceding the claim. Some jurisdictions do not allow these limitations; in such cases, liability is limited to the maximum extent permitted by law.`,
  },
  {
    title: "10. Termination",
    body: `You may terminate your account at any time via the account settings page. We may terminate or suspend your account for violations of these terms, with or without notice. Upon termination, your data is retained for 30 days before deletion, during which you may request an export.`,
  },
  {
    title: "11. Changes to Terms",
    body: `We may update these Terms from time to time. Material changes will be communicated via email to the account owner at least 14 days before taking effect. Continued use of the Service after changes constitutes acceptance of the new terms.`,
  },
  {
    title: "12. Contact",
    body: `Questions about these Terms? Email us at hello@shiftpro.ai. We're real people and we respond.`,
  },
];

export default function TermsPage() {
  return (
    <div style={{ minHeight: "100vh", background: C.ocean100, fontFamily: ff.body, color: C.t1 }}>
      <style>{GCSS}</style>

      {/* Nav */}
      <SiteNav backLabel="← Back to home" />

      {/* Hero */}
      <div style={{ background: C.parchment, borderBottom: "1px solid #e8dfc8", padding: "60px 32px 52px", textAlign: "center" }}>
        <div style={{ fontFamily: ff.mono, fontSize: 10, letterSpacing: 3, color: C.t3, textTransform: "uppercase", marginBottom: 16, fontWeight: 600 }}>Legal</div>
        <h1 style={{ fontFamily: ff.display, fontSize: "clamp(36px,5vw,64px)", fontWeight: 500, letterSpacing: "-0.035em", lineHeight: 0.95, marginBottom: 16 }}>
          Terms of<br /><span style={{ fontStyle: "italic", fontWeight: 300, color: C.amber500 }}>Service.</span>
        </h1>
        <p style={{ fontFamily: ff.body, fontSize: 14, color: C.t3, marginTop: 16 }}>
          Last updated: April 2025 · <a href="/privacy">Privacy Policy</a>
        </p>
      </div>

      {/* Content */}
      <div style={{ maxWidth: 760, margin: "0 auto", padding: "60px 32px 100px", animation: "fadeIn 0.4s" }}>
        <p style={{ fontFamily: ff.body, fontSize: 15.5, color: C.t2, lineHeight: 1.7, marginBottom: 48, padding: "20px 24px", background: "#fff", borderRadius: 4, border: "1px solid " + C.border, borderLeft: "3px solid " + C.amber500 }}>
          Plain language summary: you own your data, we don't sell it, you can cancel anytime, no surprise charges. The full details are below.
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

