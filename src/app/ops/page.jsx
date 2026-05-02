"use client";
// ════════════════════════════════════════════════════════════════
//  OPERATIONS MANUAL — shiftpro.ai/vault1/ops
//  Self-contained. Own password gate. Won't touch existing vault.
//  Path: src/app/vault1/ops/page.jsx
// ════════════════════════════════════════════════════════════════

import React, { useState, useEffect, useRef } from "react";

// ─────────────────────────────────────────────────────────────
//  PASSWORD — same as MDT hiring portal for consistency
//  Change this string if you want a different password
// ─────────────────────────────────────────────────────────────
const PASSWORD = "boat";
const SESSION_KEY = "ops-manual-auth";

// ─────────────────────────────────────────────────────────────
//  THE DATA — single source of truth. Edit this object as
//  the system evolves. Push, redeploy, done.
// ─────────────────────────────────────────────────────────────
const OPS_DATA = {
  meta: {
    last_updated: "2026-05-01",
    owner: "Brendan",
    notes: "Treat this page as the master operations manual. All passwords, paths, env vars, and procedures live here.",
  },

  public: [
    {
      id: "shiftpro-landing",
      url: "shiftpro.ai",
      label: "Landing Page (public)",
      what: "Marketing page for visitors. Pricing tiers, feature tour, sign-up CTA.",
      file_path: "src/app/page.tsx (session-aware: routes anonymous → landing, authed → app)",
      auth: "none",
      password: null,
      notes: [
        "Background: ocean blue (#e8f1f7). Wrapped in a div with explicit minHeight + background.",
        "Pricing: Free (5 emp / 1 loc), Starter $19/mo per loc, Pro $49/mo per loc, Enterprise custom.",
      ],
    },
    {
      id: "shiftpro-app",
      url: "shiftpro.ai (when logged in)",
      label: "Main app (owner & employee)",
      what: "Full ShiftPro app. Owner gets command center, employees get mobile work hub.",
      file_path: "src/components/ShiftProAppContent.jsx (8000+ lines, mostly owner side)",
      auth: "Supabase email/password auth",
      password: null,
      notes: [
        "Owner login + Employee login modals on landing nav.",
        "Trial banner + Upgrade modal show in-app for free-tier users.",
      ],
    },
    {
      id: "demo",
      url: "shiftpro.ai/demo",
      label: "Demo environment (sales)",
      what: "Public demo with full app + heavy intelligence/fraud features. Share link with prospective clients.",
      file_path: "src/app/demo/page.tsx",
      auth: "Password gate",
      password: "shiftpro2025",
      notes: [
        "Has a 'Back to ShiftPro' link.",
        "Session-only — close browser, asks again.",
      ],
    },
  ],

  internal: [
    {
      id: "vault1",
      url: "shiftpro.ai/vault1",
      label: "Vault 1 — primary password vault",
      what: "Your master encrypted vault. API keys, env values, business secrets.",
      file_path: "src/app/vault1/page.jsx",
      auth: "Master password (encryption key)",
      password: "(your vault1 password — change in Settings inside the vault)",
      notes: [
        "Encrypted client-side; data is unreadable on the server without the password.",
        "Settings tab → change master password (re-encrypts all data).",
      ],
    },
    {
      id: "ops-manual",
      url: "shiftpro.ai/ops",
      label: "Operations Manual (this page)",
      what: "Master internal documentation. Every page, password, env var, and procedure.",
      file_path: "src/app/ops/page.jsx",
      auth: "Password gate",
      password: "boat",
      notes: [
        "Edit OPS_DATA at the top of the file as the system changes.",
        "Print button at top-right for paper backup or PDF save.",
      ],
    },
    {
      id: "vault2",
      url: "shiftpro.ai/vault2",
      label: "Vault 2 — secondary vault",
      what: "Independent second vault. Separate password, separate data, separate encryption.",
      file_path: "src/app/vault2/page.jsx",
      auth: "Master password (separate from vault1)",
      password: "(your vault2 password)",
      notes: [
        "Useful for: separating personal vs business secrets, or backup of the most critical keys.",
      ],
    },
    {
      id: "mdt-console",
      url: "shiftpro.ai/mdt",
      label: "MDT Operations Console (booking AI)",
      what: "AI-powered service agent for Marine Discovery Tours. Reads inbound emails/voicemails, classifies them, scores them with the Tide Score™ algorithm, drafts replies.",
      file_path: "src/app/mdt/page.tsx",
      auth: "Currently URL-public (no auth gate). To make private, add a password gate.",
      password: null,
      notes: [
        "Categories: Sea Life Cruise, Private Group, School Group, Sport Fishing, Wedding, Ashes at Sea.",
        "Reusable engine — will become LaserDesk.ai for other businesses later.",
        "Outbound replies: Captain@ for general public, Groups@ for group/charter categories.",
      ],
    },
    {
      id: "mdt-hiring",
      url: "shiftpro.ai/mdt/hiring",
      label: "MDT Hiring Portal",
      what: "Password-gated hiring dashboard. Candidates, scored interviews, offer letters, document uploads.",
      file_path: "src/app/mdt/hiring/page.tsx",
      auth: "Password gate (sessionStorage)",
      password: "boat",
      notes: [
        "Three positions seeded: Captain, Naturalist Guide / Deckhand, Ticket Kiosk Sales — each with 10 weighted interview questions.",
        "Sends interview confirmations + offer letters from Captain@marinediscovery.com.",
        "Uploads: resumes, licenses, IDs, certifications stored in 'candidate-documents' bucket.",
        "Onboarding Packet button appears once a candidate is marked Hired or Offer Sent.",
      ],
    },
    {
      id: "onboarding",
      url: "shiftpro.ai/onboard/{token}",
      label: "CrewPort Onboarding Portal (candidate-facing)",
      what: "Magic-link landing page where new hires fill out their onboarding packet — personal info, emergency contact, direct deposit, photo release, handbook ack — and sign electronically.",
      file_path: "src/app/onboard/[token]/page.tsx",
      auth: "Magic-link token (no login). 14-day expiry.",
      password: null,
      notes: [
        "Multi-tenant by design — branding/color pulled from org row.",
        "ESIGN-compliant signature: typed legal name + drawn signature + IP/UA/timestamp audit log.",
        "Auto-saves form progress every keystroke (1.2s debounce).",
        "Session 2 will add federal PDFs (W-4, I-9, OR-W-4) and final consolidated PDF generation.",
      ],
    },
  ],

  passwords: [
    { id: "pw-vault1",     label: "Vault 1 master",                       value: "(set by you in /vault1)",   notes: "Master encryption key. If lost, vault1 data is unrecoverable." },
    { id: "pw-vault2",     label: "Vault 2 master",                       value: "(set by you in /vault2)",   notes: "Independent of vault1." },
    { id: "pw-mdt-hiring", label: "MDT Hiring Portal",                    value: "boat",                       notes: "Owners + managers only. Stored as sessionStorage flag." },
    { id: "pw-ops",        label: "Operations Manual (this page)",        value: "boat",                       notes: "Same as MDT hiring for consistency. Change in /vault1/ops/page.jsx PASSWORD const." },
    { id: "pw-demo",       label: "Demo environment",                     value: "shiftpro2025",               notes: "Share with sales prospects." },
    { id: "pw-mdt-old",    label: "Old MDT hiring (Vercel static)",       value: "boat",                       notes: "Original marinediscovery.vercel.app/hiring — being deprecated." },
  ],

  supabase: {
    project_id: "hctwtikvnwclppncocka",
    project_url: "https://hctwtikvnwclppncocka.supabase.co",
    org_id_mdt: "a1d2c3e4-0001-4000-8000-000000000001",
    notes: "MDT is org_id 'a1d2...0001'. New tenants (LaserDesk customers) get new UUIDs.",
    storage_buckets: [
      { name: "candidate-documents",    purpose: "Resumes, licenses, IDs uploaded in /mdt/hiring" },
      { name: "onboarding-documents",   purpose: "Handbook PDFs, onboarding template files, completed packets" },
    ],
  },

  migrations: [
    { num: "01", file: "supabase-mdt-schema.sql",         purpose: "MDT base: orgs, mailboxes, contacts, tickets, messages, drafts, audit, categories" },
    { num: "02", file: "02-manual-entry-migration.sql",    purpose: "Adds payment + manual entry to tickets" },
    { num: "03", file: "03-hiring-migration.sql",          purpose: "Hiring tables: positions, candidates, interviews, candidate_documents" },
    { num: "04", file: "04-onboarding-migration.sql",      purpose: "CrewPort: templates, packets, invitations, submissions, signatures, events" },
  ],

  env_vars: [
    { name: "NEXT_PUBLIC_SUPABASE_URL",         status: "set",         scope: "Public",  notes: "Supabase project URL" },
    { name: "NEXT_PUBLIC_SUPABASE_ANON_KEY",    status: "set",         scope: "Public",  notes: "Supabase anon key — fine to expose" },
    { name: "SUPABASE_SERVICE_ROLE_KEY",        status: "set",         scope: "Server",  notes: "FULL ACCESS to db. Server-only. Never expose." },
    { name: "ANTHROPIC_API_KEY",                status: "set",         scope: "Server",  notes: "MDT classifier + reply drafter use this" },
    { name: "INBOUND_WEBHOOK_SECRET",           status: "set",         scope: "Server",  notes: "Required header X-MDT-Secret on /api/mdt/ingest" },
    { name: "STRIPE_SECRET_KEY",                status: "set",         scope: "Server",  notes: "ShiftPro billing" },
    { name: "STRIPE_WEBHOOK_SECRET",            status: "set",         scope: "Server",  notes: "Stripe → ShiftPro webhook signature verification" },
    { name: "RESEND_API_KEY",                   status: "set",         scope: "Server",  notes: "ShiftPro Pro plan email sender" },
    { name: "NEXT_PUBLIC_VAPID_PUBLIC_KEY",     status: "set",         scope: "Public",  notes: "Push notifications" },
    { name: "VAPID_PRIVATE_KEY",                status: "set",         scope: "Server",  notes: "Push notifications signing" },
    { name: "MDT_SMTP_PASSWORD_CAPTAIN",        status: "PENDING",     scope: "Server",  notes: "Captain@marinediscovery.com SMTP password — UNSET until you provide" },
    { name: "MDT_SMTP_PASSWORD_GROUPS",         status: "PENDING",     scope: "Server",  notes: "Groups@marinediscovery.com SMTP password — UNSET until you provide" },
  ],

  procedures: [
    {
      id: "deploy",
      title: "Deploy a code change",
      steps: [
        "cd ~/Documents/shiftpro-ai",
        "Edit / drop in new file(s)",
        "npm run build  ← if this errors, fix before push",
        "git add -A && git commit -m 'feat: description'",
        "git push  ← Vercel auto-deploys from main",
      ],
    },
    {
      id: "run-migration",
      title: "Run a SQL migration",
      steps: [
        "Open Supabase Dashboard → SQL Editor → New query",
        "Paste full contents of the .sql file",
        "Run",
        "Verify with the SELECT count(*) shown in the file's footer",
        "ALWAYS run migrations in numeric order. 03 must run before 04.",
      ],
    },
    {
      id: "test-mdt-ingest",
      title: "Test MDT inbound ticket creation",
      steps: [
        "curl -X POST https://shiftpro.ai/api/mdt/ingest \\",
        "  -H 'Content-Type: application/json' \\",
        "  -H 'X-MDT-Secret: $INBOUND_WEBHOOK_SECRET' \\",
        "  -d '{\"source\":\"email\",\"from_email\":\"test@example.com\",\"from_name\":\"Test\",\"subject\":\"Wedding inquiry\",\"body_text\":\"30 people, June 15, want a quote\"}'",
        "Then visit /mdt → ticket should appear in 'New' column with category=wedding, score ~75-85",
      ],
    },
    {
      id: "send-onboarding",
      title: "Send onboarding packet to a new hire",
      steps: [
        "Visit /mdt/hiring → enter password 'boat'",
        "Open candidate → mark status as 'Hired' or 'Offer Sent'",
        "Profile tab → scroll to 'Onboarding Packet' card",
        "Click Send Packet → optional custom message → Send",
        "(Until SMTP wired) alert pops up with magic link — paste into webmail manually",
        "Candidate clicks link → /onboard/{token} → fills forms → signs → done",
      ],
    },
    {
      id: "session-stuck",
      title: "Stuck on a /vault1 or /mdt/hiring password screen",
      steps: [
        "These use sessionStorage. Close all browser tabs of that page → reopen.",
        "If still stuck: open browser DevTools (F12) → Application → Session Storage → delete the auth flag.",
        "vault1 / vault2 — keys are 'v1_data' / 'v2_data' (encrypted blobs)",
        "mdt-hiring — flag is 'mdt-hiring-auth'",
        "ops manual — flag is 'ops-manual-auth'",
      ],
    },
  ],

  blockers: [
    {
      id: "smtp",
      severity: "high",
      title: "SMTP credentials for Captain@ + Groups@",
      what: "MDT replies, hiring confirmations, offer letters, and onboarding emails all queue but cannot SEND until these are wired.",
      action: "Get SMTP host/port/user/password from your webmail provider. Update ld_mailboxes rows + set MDT_SMTP_PASSWORD_CAPTAIN / MDT_SMTP_PASSWORD_GROUPS env vars in Vercel.",
    },
    {
      id: "payroll-audit",
      severity: "high",
      title: "Payroll audit before May 10",
      what: "Real payroll runs on the 10th. Half 2 of operations session = read-only audit of payroll module.",
      action: "After Operations Manual ships, audit ShiftProAppContent.jsx payroll section.",
    },
    {
      id: "encryption-onboarding",
      severity: "high-pre-launch",
      title: "Onboarding sensitive field encryption",
      what: "SSN and bank account numbers in /onboard submissions are stored in plaintext JSONB (flagged with contains_sensitive=true but not encrypted at rest).",
      action: "BEFORE selling CrewPort externally → wire Supabase Vault encryption for these fields. Acceptable for MDT internal use today since RLS prevents cross-org reads.",
    },
    {
      id: "voip",
      severity: "medium",
      title: "VOIP provider for voicemail webhook",
      what: "Generic voicemail webhook works today, but no specific provider integration is wired. Tell Claude which VOIP (RingCentral/OpenPhone/Dialpad/etc.) and we wire it.",
      action: "Confirm provider name → next session adds specific webhook adapter.",
    },
    {
      id: "fareharbor",
      severity: "medium",
      title: "FareHarbor inbox integration",
      what: "Decision pending: forwarding rule + Resend inbound, OR IMAP poller. Until decided, FareHarbor inquiries don't auto-create tickets.",
      action: "Pick A or B → next session implements.",
    },
    {
      id: "operator-login",
      severity: "low",
      title: "Operator login for /mdt console",
      what: "/mdt page is currently URL-public. Anyone with the URL can see all tickets. Fine for solo use, not fine for shared team access.",
      action: "Add Supabase auth + RLS policies when there are 2+ operators.",
    },
  ],

  repo: [
    { path: "src/app/page.tsx",                          purpose: "Session-aware root: anonymous → landing, authed → app" },
    { path: "src/components/ShiftProAppContent.jsx",     purpose: "Main app (owner + employee). 8000+ lines." },
    { path: "src/components/ShiftProApp.jsx",            purpose: "Tiny wrapper that re-exports ShiftProAppContent" },
    { path: "src/app/mdt/page.tsx",                      purpose: "MDT Operations Console (kanban + ticket detail)" },
    { path: "src/app/mdt/hiring/page.tsx",               purpose: "MDT Hiring Portal (password gated)" },
    { path: "src/app/onboard/[token]/page.tsx",          purpose: "CrewPort onboarding portal (candidate-facing)" },
    { path: "src/app/vault1/page.jsx",                   purpose: "Encrypted vault 1" },
    { path: "src/app/ops/page.jsx",                     purpose: "This Operations Manual" },
    { path: "src/app/vault2/page.jsx",                   purpose: "Encrypted vault 2" },
    { path: "src/app/api/mdt/*",                         purpose: "MDT API routes: ingest, classify, draft, reply, tickets, manual" },
    { path: "src/app/api/mdt/hiring/*",                  purpose: "Hiring API: candidates, interview, documents, send-confirmation, send-offer, send-onboarding" },
    { path: "src/app/api/mdt/hiring/onboarding/*",       purpose: "Owner-side onboarding mgmt: templates, packets, invitations" },
    { path: "src/app/api/onboard/[token]/route.ts",      purpose: "Public token-gated onboarding API" },
    { path: "src/lib/mdt/classify.ts",                   purpose: "Claude classification engine (Sonnet)" },
    { path: "src/lib/mdt/tideScore.ts",                  purpose: "Proprietary lead-scoring algorithm" },
    { path: "src/lib/auth.ts",                           purpose: "Server-side auth helpers (svcClient, requireAuth)" },
  ],
};

// ════════════════════════════════════════════════════════════════
//  STYLE TOKENS — match vault aesthetic (dark)
// ════════════════════════════════════════════════════════════════
const C = {
  bg:        "#05080f",
  bg2:       "#0b1220",
  bg3:       "#111a2e",
  border:    "#1e2a44",
  text:      "#e8f0ff",
  textD:     "#a6b4d4",
  textF:     "#6b7a99",
  textE:     "#4a5878",
  cyan:      "#22d3ee",
  cyanD:     "#0891b2",
  green:     "#10b981",
  amber:     "#f59e0b",
  red:       "#ef4444",
  violet:    "#a78bfa",
  display:   "'Fraunces',Georgia,serif",
  sans:      "'Inter',system-ui,-apple-system,sans-serif",
  mono:      "'JetBrains Mono','Menlo',monospace",
};

const FONTS = `
@import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,300;0,9..144,400;0,9..144,600;0,9..144,700;0,9..144,800;1,9..144,300;1,9..144,400&family=Inter:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600;700&display=swap');
* { box-sizing: border-box }
body { background: ${C.bg}; color: ${C.text}; font-family: ${C.sans}; margin: 0 }
@keyframes opsFade { from { opacity: 0; transform: translateY(6px) } to { opacity: 1; transform: none } }
@keyframes opsShake { 0%,100%{transform:translateX(0)} 20%{transform:translateX(-8px)} 40%{transform:translateX(8px)} 60%{transform:translateX(-6px)} 80%{transform:translateX(6px)} }
.ops-fade { animation: opsFade .25s cubic-bezier(.22,1,.36,1) }
.ops-shake { animation: opsShake .4s }
.ops-scroll::-webkit-scrollbar { width: 8px; height: 8px }
.ops-scroll::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.08); border-radius: 4px }
.ops-scroll::-webkit-scrollbar-track { background: transparent }
@media print {
  .ops-no-print { display: none !important }
  body, .ops-page { background: #fff !important; color: #000 !important }
  .ops-card { border: 1px solid #ccc !important; break-inside: avoid; background: #fff !important }
  .ops-card * { color: #000 !important }
}
`;

// ════════════════════════════════════════════════════════════════
//  ROOT
// ════════════════════════════════════════════════════════════════
export default function OpsPage() {
  const [unlocked, setUnlocked] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined" && sessionStorage.getItem(SESSION_KEY) === "1") {
      setUnlocked(true);
    }
  }, []);

  return (
    <>
      <style>{FONTS}</style>
      {unlocked ? <Manual /> : <PasswordGate onUnlock={() => setUnlocked(true)} />}
    </>
  );
}

// ════════════════════════════════════════════════════════════════
//  PASSWORD GATE
// ════════════════════════════════════════════════════════════════
function PasswordGate({ onUnlock }) {
  const [input, setInput] = useState("");
  const [error, setError] = useState(false);
  const inputRef = useRef(null);

  const attempt = () => {
    if (input.trim().toLowerCase() === PASSWORD) {
      sessionStorage.setItem(SESSION_KEY, "1");
      setTimeout(() => onUnlock(), 0);
    } else {
      setError(true);
      setInput("");
      setTimeout(() => setError(false), 500);
      inputRef.current?.focus();
    }
  };

  return (
    <div style={{ minHeight: "100vh", background: `radial-gradient(circle at 50% 20%, ${C.bg3}, ${C.bg})`, display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
      <div className={error ? "ops-shake" : "ops-fade"} style={{
        background: C.bg2, borderRadius: 18, padding: "40px 36px", maxWidth: 420, width: "100%",
        boxShadow: "0 24px 60px rgba(0,0,0,0.5)", textAlign: "center",
        border: `1px solid ${error ? C.red : C.border}`,
      }}>
        <div style={{ width: 56, height: 56, borderRadius: 14, margin: "0 auto 16px", background: `linear-gradient(135deg, ${C.cyan}, ${C.cyanD})`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 26 }}>
          📘
        </div>
        <div style={{ fontFamily: C.mono, fontSize: 9, color: C.amber, letterSpacing: 1.8, textTransform: "uppercase", marginBottom: 8, fontWeight: 700, padding: "3px 10px", background: "rgba(245,158,11,0.1)", border: "1px solid rgba(245,158,11,0.3)", borderRadius: 4, display: "inline-block" }}>
          ⚠ Internal Only
        </div>
        <div style={{ fontFamily: C.display, fontSize: 24, fontWeight: 700, color: C.text, letterSpacing: "-0.02em", marginTop: 14, marginBottom: 6 }}>
          Operations Manual
        </div>
        <div style={{ fontFamily: C.sans, fontSize: 13, color: C.textF, marginBottom: 26, lineHeight: 1.55 }}>
          Master reference for every page, password, env var, and procedure across the stack.
        </div>
        <input
          ref={inputRef}
          type="password"
          autoFocus
          value={input}
          onChange={e => { setInput(e.target.value); setError(false); }}
          onKeyDown={e => e.key === "Enter" && attempt()}
          placeholder="Enter password"
          style={{
            width: "100%", padding: "13px 14px",
            border: `1.5px solid ${error ? C.red : C.border}`, borderRadius: 10,
            fontFamily: C.sans, fontSize: 16, color: C.text, background: C.bg,
            textAlign: "center", letterSpacing: 4, outline: "none",
            transition: "border-color .15s",
          }}
          onFocus={e => { if (!error) e.target.style.borderColor = C.cyan; }}
          onBlur={e => { if (!error) e.target.style.borderColor = C.border; }}
        />
        {error && <div style={{ marginTop: 10, fontFamily: C.sans, fontSize: 12, color: C.red, fontWeight: 500 }}>Incorrect password</div>}
        <button onClick={attempt} style={{
          width: "100%", marginTop: 14, padding: "13px",
          background: `linear-gradient(135deg, ${C.cyan}, ${C.cyanD})`, color: "#000", border: "none",
          borderRadius: 10, fontFamily: C.sans, fontWeight: 700, fontSize: 14, cursor: "pointer",
          letterSpacing: 0.3, boxShadow: "0 6px 18px rgba(34,211,238,0.25)",
        }}>
          Unlock →
        </button>
        <div style={{ marginTop: 20, fontFamily: C.mono, fontSize: 10, color: C.textE, letterSpacing: 0.5 }}>
          shiftpro.ai/ops
        </div>
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════
//  MANUAL (after unlock)
// ════════════════════════════════════════════════════════════════
function Manual() {
  const [section, setSection] = useState("overview");
  const [revealedPasswords, setRevealedPasswords] = useState({});
  const [search, setSearch] = useState("");

  const sections = [
    { id: "overview",   label: "Overview",       count: null },
    { id: "pages",      label: "Pages & URLs",   count: OPS_DATA.public.length + OPS_DATA.internal.length },
    { id: "passwords",  label: "Passwords",      count: OPS_DATA.passwords.length },
    { id: "supabase",   label: "Supabase",       count: OPS_DATA.supabase.storage_buckets.length },
    { id: "migrations", label: "Migrations",     count: OPS_DATA.migrations.length },
    { id: "env",        label: "Env Variables",  count: OPS_DATA.env_vars.length },
    { id: "procedures", label: "Procedures",     count: OPS_DATA.procedures.length },
    { id: "blockers",   label: "Blockers",       count: OPS_DATA.blockers.length },
    { id: "repo",       label: "Repo Structure", count: OPS_DATA.repo.length },
  ];

  const lock = () => {
    sessionStorage.removeItem(SESSION_KEY);
    window.location.reload();
  };

  return (
    <div className="ops-page" style={{ minHeight: "100vh", background: C.bg, color: C.text, fontFamily: C.sans }}>
      {/* Header */}
      <div style={{ background: `linear-gradient(135deg, ${C.bg2}, ${C.bg3})`, borderBottom: `1px solid ${C.border}`, padding: "20px 24px" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4, flexWrap: "wrap" }}>
                <span style={{ fontFamily: C.mono, fontSize: 9, color: C.amber, letterSpacing: 1.8, textTransform: "uppercase", padding: "3px 8px", background: "rgba(245,158,11,0.1)", border: "1px solid rgba(245,158,11,0.3)", borderRadius: 4, fontWeight: 700 }}>
                  ⚠ Internal Only
                </span>
                <span style={{ fontFamily: C.mono, fontSize: 10, color: C.textF, letterSpacing: 1.5, textTransform: "uppercase" }}>
                  Updated {OPS_DATA.meta.last_updated}
                </span>
              </div>
              <h1 style={{ fontFamily: C.display, fontSize: 26, fontWeight: 700, color: C.text, letterSpacing: "-0.02em", margin: 0, lineHeight: 1.1 }}>
                ShiftPro <span style={{ fontStyle: "italic", color: C.cyan, fontWeight: 400 }}>Operations Manual</span>
              </h1>
              <p style={{ fontFamily: C.sans, fontSize: 12.5, color: C.textF, margin: "5px 0 0", maxWidth: 580, lineHeight: 1.5 }}>
                Master reference for every page, password, env var, and procedure. Sensitive — keep this tab closed when sharing screen.
              </p>
            </div>
            <div className="ops-no-print" style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              <input
                type="text"
                placeholder="Search…"
                value={search}
                onChange={e => setSearch(e.target.value)}
                style={{ padding: "8px 12px", border: `1px solid ${C.border}`, borderRadius: 8, background: C.bg, color: C.text, fontFamily: C.sans, fontSize: 13, width: 180, outline: "none" }}
                onFocus={e => (e.target.style.borderColor = C.cyan)}
                onBlur={e => (e.target.style.borderColor = C.border)}
              />
              <button onClick={() => window.print()} style={btn}>🖨 Print</button>
              <button onClick={lock} style={btn}>🔒 Lock</button>
            </div>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "20px 24px 60px" }}>
        {/* Section nav */}
        <div className="ops-no-print" style={{ position: "sticky", top: 0, zIndex: 20, background: C.bg, padding: "8px 0", borderBottom: `1px solid ${C.border}`, marginBottom: 18 }}>
          <div className="ops-scroll" style={{ display: "flex", gap: 6, overflowX: "auto", paddingBottom: 4 }}>
            {sections.map(s => (
              <button key={s.id} onClick={() => setSection(s.id)}
                style={{
                  flexShrink: 0, padding: "6px 12px",
                  background: section === s.id ? C.cyan : "transparent",
                  color: section === s.id ? C.bg : C.textD,
                  border: `1px solid ${section === s.id ? C.cyan : C.border}`,
                  borderRadius: 18,
                  fontFamily: C.mono, fontSize: 10, fontWeight: 700, letterSpacing: 0.5, textTransform: "uppercase",
                  cursor: "pointer", whiteSpace: "nowrap",
                }}>
                {s.label}{s.count !== null ? ` · ${s.count}` : ""}
              </button>
            ))}
          </div>
        </div>

        <div className="ops-fade">
          {section === "overview" && <Overview />}
          {section === "pages" && <Pages search={search} />}
          {section === "passwords" && <Passwords revealed={revealedPasswords} setRevealed={setRevealedPasswords} search={search} />}
          {section === "supabase" && <SupabasePanel />}
          {section === "migrations" && <Migrations />}
          {section === "env" && <EnvVars search={search} />}
          {section === "procedures" && <Procedures search={search} />}
          {section === "blockers" && <BlockersPanel search={search} />}
          {section === "repo" && <RepoStructure search={search} />}
        </div>
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════
//  SECTIONS
// ════════════════════════════════════════════════════════════════
function Overview() {
  const totalPages = OPS_DATA.public.length + OPS_DATA.internal.length;
  const totalBlockers = OPS_DATA.blockers.length;
  const highBlockers = OPS_DATA.blockers.filter(b => b.severity.startsWith("high")).length;
  const pendingEnv = OPS_DATA.env_vars.filter(e => e.status === "PENDING").length;

  return (
    <>
      <SectionTitle title="Overview" subtitle="High-level state of the system." />
      <Grid>
        <StatBlock label="Pages built"        value={totalPages}          color={C.cyan}   detail="Public + internal" />
        <StatBlock label="Open blockers"      value={totalBlockers}       color={highBlockers > 0 ? C.amber : C.green}  detail={`${highBlockers} high severity`} />
        <StatBlock label="Pending env vars"   value={pendingEnv}          color={pendingEnv > 0 ? C.amber : C.green}    detail="Mostly SMTP creds" />
        <StatBlock label="DB migrations"       value={OPS_DATA.migrations.length} color={C.violet}                      detail="All idempotent" />
      </Grid>

      <Card title="Note from the operator">
        <p style={{ fontFamily: C.sans, fontSize: 13.5, color: C.textD, lineHeight: 1.65, margin: 0 }}>
          {OPS_DATA.meta.notes}
        </p>
      </Card>

      <Card title="Top priorities right now">
        <ul style={{ fontFamily: C.sans, fontSize: 13.5, color: C.textD, lineHeight: 1.7, margin: 0, paddingLeft: 22 }}>
          <li><strong style={{ color: C.text }}>Payroll audit</strong> before May 10 — bugs found get fixed in the next session.</li>
          <li><strong style={{ color: C.text }}>SMTP credentials</strong> for Captain@ and Groups@ — unblocks all outbound email.</li>
          <li><strong style={{ color: C.text }}>Get ShiftPro to 100% live</strong> this month for paying customers.</li>
          <li>VOIP webhook + FareHarbor integration — unblocks fully automated MDT inbound.</li>
        </ul>
      </Card>
    </>
  );
}

function Pages({ search }) {
  const filterFn = p => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (p.label + p.url + p.what + (p.notes || []).join(" ")).toLowerCase().includes(q);
  };

  const publicPages = OPS_DATA.public.filter(filterFn);
  const internalPages = OPS_DATA.internal.filter(filterFn);

  return (
    <>
      <SectionTitle title="Pages & URLs" subtitle="Every page in the stack, what it does, and how to access it." />

      <SectionGroup label="Public" color={C.cyan}>
        {publicPages.map(p => <PageCard key={p.id} page={p} />)}
        {publicPages.length === 0 && <EmptyHit />}
      </SectionGroup>

      <SectionGroup label="Internal / Operations" color={C.amber}>
        {internalPages.map(p => <PageCard key={p.id} page={p} />)}
        {internalPages.length === 0 && <EmptyHit />}
      </SectionGroup>
    </>
  );
}

function PageCard({ page }) {
  return (
    <Card>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12, marginBottom: 10, flexWrap: "wrap" }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontFamily: C.display, fontSize: 16, fontWeight: 700, color: C.text, marginBottom: 3 }}>{page.label}</div>
          <a href={page.url.startsWith("http") ? page.url : `https://${page.url}`} target="_blank" rel="noopener noreferrer"
            style={{ fontFamily: C.mono, fontSize: 11, color: C.cyan, textDecoration: "none", letterSpacing: 0.3, wordBreak: "break-all" }}>
            {page.url}
          </a>
        </div>
        <span style={{ padding: "3px 9px", background: page.password ? "rgba(245,158,11,0.12)" : "rgba(16,185,129,0.1)", color: page.password ? C.amber : C.green, borderRadius: 12, fontFamily: C.mono, fontSize: 9, fontWeight: 700, letterSpacing: 0.5, textTransform: "uppercase" }}>
          {page.auth}
        </span>
      </div>
      <p style={{ fontFamily: C.sans, fontSize: 13, color: C.textD, lineHeight: 1.55, margin: "0 0 12px" }}>{page.what}</p>
      <FieldRow label="File path"><code style={codeStyle}>{page.file_path}</code></FieldRow>
      {page.password && <FieldRow label="Password"><code style={{ ...codeStyle, color: C.amber, background: "rgba(245,158,11,0.08)", fontWeight: 600 }}>{page.password}</code></FieldRow>}
      {page.notes && page.notes.length > 0 && (
        <div style={{ marginTop: 10, paddingTop: 10, borderTop: `1px solid ${C.border}` }}>
          <ul style={{ fontFamily: C.sans, fontSize: 12.5, color: C.textF, lineHeight: 1.65, margin: 0, paddingLeft: 18 }}>
            {page.notes.map((n, i) => <li key={i}>{n}</li>)}
          </ul>
        </div>
      )}
    </Card>
  );
}

function Passwords({ revealed, setRevealed, search }) {
  const filtered = OPS_DATA.passwords.filter(p =>
    !search || (p.label + p.notes).toLowerCase().includes(search.toLowerCase())
  );

  const toggle = id => setRevealed(prev => ({ ...prev, [id]: !prev[id] }));
  const copy = val => {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(val);
      alert("Copied.");
    }
  };

  return (
    <>
      <SectionTitle title="Passwords" subtitle="Click reveal to view. Copy buttons skip the visual reveal." />
      <Card>
        <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 14px", background: "rgba(239,68,68,0.07)", border: "1px solid rgba(239,68,68,0.25)", borderRadius: 8, marginBottom: 14 }}>
          <span style={{ fontSize: 16 }}>🔒</span>
          <span style={{ fontFamily: C.sans, fontSize: 12.5, color: C.textD, lineHeight: 1.5 }}>
            <strong style={{ color: C.text }}>Sensitive zone.</strong> If sharing screen, scroll past this section first.
          </span>
        </div>

        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 600 }}>
            <thead>
              <tr style={{ borderBottom: `1px solid ${C.border}` }}>
                <th style={thStyle}>What</th>
                <th style={thStyle}>Value</th>
                <th style={thStyle}>Notes</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(p => (
                <tr key={p.id} style={{ borderBottom: `1px solid ${C.border}` }}>
                  <td style={tdStyle}>
                    <span style={{ fontFamily: C.sans, fontWeight: 600, fontSize: 13, color: C.text }}>{p.label}</span>
                  </td>
                  <td style={{ ...tdStyle, minWidth: 240 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
                      <code style={{ fontFamily: C.mono, fontSize: 12, color: revealed[p.id] ? C.amber : C.textE, background: C.bg, padding: "4px 10px", borderRadius: 5, fontWeight: 600, minWidth: 100, display: "inline-block" }}>
                        {revealed[p.id] ? p.value : "•".repeat(Math.min(p.value.length, 12))}
                      </code>
                      <button onClick={() => toggle(p.id)} style={mini}>{revealed[p.id] ? "Hide" : "Reveal"}</button>
                      <button onClick={() => copy(p.value)} style={mini}>Copy</button>
                    </div>
                  </td>
                  <td style={tdStyle}>
                    <span style={{ fontFamily: C.sans, fontSize: 12, color: C.textF, lineHeight: 1.5 }}>{p.notes}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </>
  );
}

function SupabasePanel() {
  return (
    <>
      <SectionTitle title="Supabase" subtitle="Database project + storage buckets." />
      <Card title="Project">
        <FieldRow label="Project ID"><code style={codeStyle}>{OPS_DATA.supabase.project_id}</code></FieldRow>
        <FieldRow label="Project URL"><a href={OPS_DATA.supabase.project_url} target="_blank" rel="noopener noreferrer" style={{ fontFamily: C.mono, fontSize: 12, color: C.cyan, textDecoration: "none" }}>{OPS_DATA.supabase.project_url}</a></FieldRow>
        <FieldRow label="MDT org_id"><code style={codeStyle}>{OPS_DATA.supabase.org_id_mdt}</code></FieldRow>
        <p style={{ fontFamily: C.sans, fontSize: 12.5, color: C.textF, lineHeight: 1.55, margin: "10px 0 0" }}>{OPS_DATA.supabase.notes}</p>
      </Card>

      <Card title="Storage Buckets">
        {OPS_DATA.supabase.storage_buckets.map((b, i) => (
          <div key={b.name} style={{ padding: "10px 0", borderTop: i === 0 ? "none" : `1px solid ${C.border}` }}>
            <div style={{ fontFamily: C.mono, fontSize: 13, color: C.cyan, fontWeight: 700, marginBottom: 3 }}>{b.name}</div>
            <div style={{ fontFamily: C.sans, fontSize: 12.5, color: C.textD, lineHeight: 1.5 }}>{b.purpose}</div>
          </div>
        ))}
      </Card>
    </>
  );
}

function Migrations() {
  return (
    <>
      <SectionTitle title="Database Migrations" subtitle="Run in numeric order. All idempotent — safe to re-run." />
      {OPS_DATA.migrations.map(m => (
        <Card key={m.num}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 6, flexWrap: "wrap" }}>
            <span style={{ fontFamily: C.mono, fontSize: 14, fontWeight: 700, color: C.violet, padding: "4px 12px", background: "rgba(167,139,250,0.1)", borderRadius: 6 }}>#{m.num}</span>
            <code style={{ fontFamily: C.mono, fontSize: 12.5, color: C.text, fontWeight: 600 }}>{m.file}</code>
          </div>
          <p style={{ fontFamily: C.sans, fontSize: 13, color: C.textD, lineHeight: 1.55, margin: 0 }}>{m.purpose}</p>
        </Card>
      ))}
    </>
  );
}

function EnvVars({ search }) {
  const filtered = OPS_DATA.env_vars.filter(e =>
    !search || (e.name + e.notes).toLowerCase().includes(search.toLowerCase())
  );
  return (
    <>
      <SectionTitle title="Environment Variables" subtitle="Set in Vercel project → Settings → Environment Variables." />
      <Card>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 600 }}>
            <thead>
              <tr style={{ borderBottom: `1px solid ${C.border}` }}>
                <th style={thStyle}>Name</th>
                <th style={thStyle}>Status</th>
                <th style={thStyle}>Scope</th>
                <th style={thStyle}>Notes</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(v => (
                <tr key={v.name} style={{ borderBottom: `1px solid ${C.border}` }}>
                  <td style={tdStyle}><code style={{ fontFamily: C.mono, fontSize: 11.5, color: C.text, fontWeight: 600 }}>{v.name}</code></td>
                  <td style={tdStyle}>
                    <span style={{ fontFamily: C.mono, fontSize: 10, fontWeight: 700, padding: "3px 9px", borderRadius: 12, color: v.status === "set" ? C.green : C.amber, background: v.status === "set" ? "rgba(16,185,129,0.1)" : "rgba(245,158,11,0.12)", letterSpacing: 0.5, textTransform: "uppercase" }}>
                      {v.status === "set" ? "✓ Set" : "Pending"}
                    </span>
                  </td>
                  <td style={tdStyle}>
                    <span style={{ fontFamily: C.mono, fontSize: 10, color: v.scope === "Server" ? C.amber : C.cyan, letterSpacing: 0.5, textTransform: "uppercase" }}>{v.scope}</span>
                  </td>
                  <td style={{ ...tdStyle, fontFamily: C.sans, fontSize: 12, color: C.textF, lineHeight: 1.5 }}>{v.notes}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </>
  );
}

function Procedures({ search }) {
  const filtered = OPS_DATA.procedures.filter(p =>
    !search || (p.title + p.steps.join(" ")).toLowerCase().includes(search.toLowerCase())
  );
  return (
    <>
      <SectionTitle title="Common Procedures" subtitle="Step-by-step playbooks for things you do often." />
      {filtered.map(p => (
        <Card key={p.id} title={p.title}>
          <ol style={{ fontFamily: C.mono, fontSize: 12, color: C.textD, lineHeight: 1.8, margin: 0, paddingLeft: 22 }}>
            {p.steps.map((s, i) => (
              <li key={i} style={{ marginBottom: 4 }}>
                {s.startsWith("curl") || s.startsWith("cd") || s.startsWith("npm") || s.startsWith("git") || s.startsWith("cp") || s.startsWith("mkdir")
                  ? <code style={{ background: C.bg, padding: "3px 8px", borderRadius: 4, color: C.cyan, fontFamily: C.mono }}>{s}</code>
                  : <span style={{ color: C.textD }}>{s}</span>
                }
              </li>
            ))}
          </ol>
        </Card>
      ))}
    </>
  );
}

function BlockersPanel({ search }) {
  const filtered = OPS_DATA.blockers.filter(b =>
    !search || (b.title + b.what + b.action).toLowerCase().includes(search.toLowerCase())
  );
  const sevColor = sev => sev.startsWith("high") ? C.red : sev === "medium" ? C.amber : C.textF;

  return (
    <>
      <SectionTitle title="Open Blockers" subtitle="Outstanding items, tagged by severity." />
      {filtered.map(b => {
        const color = sevColor(b.severity);
        return (
          <Card key={b.id}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10, marginBottom: 10, flexWrap: "wrap" }}>
              <div style={{ fontFamily: C.display, fontSize: 16, fontWeight: 700, color: C.text }}>{b.title}</div>
              <span style={{ padding: "3px 10px", background: color + "15", color, borderRadius: 12, fontFamily: C.mono, fontSize: 9, fontWeight: 700, letterSpacing: 0.5, textTransform: "uppercase" }}>
                {b.severity}
              </span>
            </div>
            <p style={{ fontFamily: C.sans, fontSize: 13, color: C.textD, lineHeight: 1.55, margin: "0 0 10px" }}>{b.what}</p>
            <div style={{ paddingTop: 10, borderTop: `1px solid ${C.border}` }}>
              <span style={{ fontFamily: C.mono, fontSize: 9, color: C.textF, letterSpacing: 1.2, textTransform: "uppercase", marginRight: 8 }}>Action:</span>
              <span style={{ fontFamily: C.sans, fontSize: 12.5, color: C.textD, lineHeight: 1.55 }}>{b.action}</span>
            </div>
          </Card>
        );
      })}
    </>
  );
}

function RepoStructure({ search }) {
  const filtered = OPS_DATA.repo.filter(r =>
    !search || (r.path + r.purpose).toLowerCase().includes(search.toLowerCase())
  );
  return (
    <>
      <SectionTitle title="Repository Structure" subtitle="Where things live in the codebase." />
      <Card>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 600 }}>
            <thead>
              <tr style={{ borderBottom: `1px solid ${C.border}` }}>
                <th style={thStyle}>Path</th>
                <th style={thStyle}>Purpose</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(r => (
                <tr key={r.path} style={{ borderBottom: `1px solid ${C.border}` }}>
                  <td style={{ ...tdStyle, fontFamily: C.mono, fontSize: 11, color: C.cyan, wordBreak: "break-all" }}>{r.path}</td>
                  <td style={{ ...tdStyle, fontFamily: C.sans, fontSize: 12.5, color: C.textD, lineHeight: 1.5 }}>{r.purpose}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </>
  );
}

// ════════════════════════════════════════════════════════════════
//  PRIMITIVES
// ════════════════════════════════════════════════════════════════
function SectionTitle({ title, subtitle }) {
  return (
    <div style={{ marginBottom: 18 }}>
      <h2 style={{ fontFamily: C.display, fontSize: 22, fontWeight: 700, color: C.text, letterSpacing: "-0.01em", margin: "0 0 4px" }}>{title}</h2>
      <p style={{ fontFamily: C.sans, fontSize: 13, color: C.textF, margin: 0, lineHeight: 1.55 }}>{subtitle}</p>
    </div>
  );
}

function SectionGroup({ label, color, children }) {
  return (
    <div style={{ marginBottom: 24 }}>
      <div style={{ fontFamily: C.mono, fontSize: 9, color, letterSpacing: 1.8, textTransform: "uppercase", marginBottom: 10, fontWeight: 700, padding: "0 4px" }}>
        {label}
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>{children}</div>
    </div>
  );
}

function Card({ title, children }) {
  return (
    <div className="ops-card" style={{ background: C.bg2, border: `1px solid ${C.border}`, borderRadius: 12, padding: 16, marginBottom: 10 }}>
      {title && <div style={{ fontFamily: C.mono, fontSize: 9, color: C.textE, letterSpacing: 1.8, textTransform: "uppercase", fontWeight: 700, marginBottom: 10 }}>{title}</div>}
      {children}
    </div>
  );
}

function Grid({ children }) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: `repeat(auto-fit, minmax(220px, 1fr))`, gap: 10, marginBottom: 14 }}>
      {children}
    </div>
  );
}

function StatBlock({ label, value, color, detail }) {
  return (
    <div className="ops-card" style={{ background: C.bg2, border: `1px solid ${C.border}`, borderRadius: 12, padding: 14 }}>
      <div style={{ fontFamily: C.mono, fontSize: 9, color: C.textF, letterSpacing: 1.5, textTransform: "uppercase", marginBottom: 6, fontWeight: 600 }}>{label}</div>
      <div style={{ fontFamily: C.display, fontSize: 32, fontWeight: 800, color, lineHeight: 1, fontVariantNumeric: "tabular-nums", marginBottom: 4 }}>{value}</div>
      {detail && <div style={{ fontFamily: C.sans, fontSize: 11, color: C.textF, lineHeight: 1.4 }}>{detail}</div>}
    </div>
  );
}

function FieldRow({ label, children }) {
  return (
    <div style={{ marginBottom: 6 }}>
      <span style={{ fontFamily: C.mono, fontSize: 9, color: C.textF, letterSpacing: 1.2, textTransform: "uppercase", marginRight: 8, fontWeight: 600 }}>{label}:</span>
      {children}
    </div>
  );
}

function EmptyHit() {
  return <div style={{ padding: 18, textAlign: "center", fontFamily: C.mono, fontSize: 11, color: C.textE, letterSpacing: 1, textTransform: "uppercase" }}>— no matches —</div>;
}

const codeStyle = {
  fontFamily: C.mono, fontSize: 11.5, color: C.textD, background: C.bg,
  padding: "3px 8px", borderRadius: 5, display: "inline-block", wordBreak: "break-all",
};

const thStyle = {
  textAlign: "left", padding: "8px 10px",
  fontFamily: C.mono, fontSize: 9, color: C.textF, letterSpacing: 1.2, textTransform: "uppercase", fontWeight: 700,
};

const tdStyle = {
  padding: "10px 10px", verticalAlign: "top",
};

const mini = {
  padding: "3px 8px", background: "transparent",
  border: `1px solid ${C.border}`, borderRadius: 5,
  fontFamily: C.mono, fontSize: 9, color: C.textD, letterSpacing: 0.5, textTransform: "uppercase",
  cursor: "pointer", fontWeight: 600,
};

const btn = {
  padding: "8px 14px", background: "transparent",
  border: `1px solid ${C.border}`, borderRadius: 8,
  color: C.textD, fontFamily: C.sans, fontSize: 12, fontWeight: 600,
  cursor: "pointer", whiteSpace: "nowrap",
};
