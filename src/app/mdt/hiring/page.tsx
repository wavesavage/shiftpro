// src/app/mdt/hiring/page.tsx
"use client";

// ════════════════════════════════════════════════════════════════
//  MDT HIRING PORTAL
//  shiftpro.ai/mdt/hiring — Password-gated hiring dashboard
//  Manages candidates, scored interviews, offers, and documents.
// ════════════════════════════════════════════════════════════════

import React, { useEffect, useMemo, useRef, useState } from "react";

const PASSWORD = "boat";
const SESSION_KEY = "mdt-hiring-auth";

// ════════════════════════════════════════════════════════════════
//  DESIGN TOKENS — match MDT console palette
// ════════════════════════════════════════════════════════════════
const C = {
  bg: "#f0f6fa", bg2: "#ffffff", bg3: "#e8f1f7",
  border: "#dce8f0", borderL: "#eef4f8",
  text: "#0c1220", textD: "#3b475c", textF: "#64748b", textE: "#94a3b8",
  cyan: "#0891b2", cyanD: "#0e7490", cyanL: "rgba(8,145,178,0.08)",
  teal: "#14b8a6", amber: "#e07b00", amberD: "rgba(224,123,0,0.08)",
  green: "#10b981", red: "#dc2626", redL: "rgba(220,38,38,0.07)",
  amberY: "#f59e0b", violet: "#7c3aed", pink: "#be185d",
  shadow: "0 1px 3px rgba(8,18,32,0.04), 0 1px 2px rgba(8,18,32,0.06)",
  shadowL: "0 12px 30px rgba(8,18,32,0.08)",
  display: "'Fraunces',Georgia,serif",
  sans: "'Inter',system-ui,-apple-system,sans-serif",
  mono: "'JetBrains Mono','Menlo',monospace",
};

const FONTS = `
@import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,300;0,9..144,400;0,9..144,600;0,9..144,700;0,9..144,800;1,9..144,300;1,9..144,400;1,9..144,600;1,9..144,700&family=Inter:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600;700&display=swap');
* { box-sizing: border-box }
body { background: ${C.bg}; color: ${C.text}; font-family: ${C.sans}; margin: 0 }
@keyframes hFadeIn { from { opacity: 0; transform: translateY(6px) } to { opacity: 1; transform: none } }
@keyframes hShake { 0%,100%{transform:translateX(0)} 20%{transform:translateX(-8px)} 40%{transform:translateX(8px)} 60%{transform:translateX(-6px)} 80%{transform:translateX(6px)} }
@keyframes hSlide { from { transform: translateX(100%) } to { transform: none } }
.h-fade { animation: hFadeIn .25s cubic-bezier(.22,1,.36,1) }
.h-shake { animation: hShake .4s }
.h-scroll::-webkit-scrollbar { width: 8px; height: 8px }
.h-scroll::-webkit-scrollbar-thumb { background: rgba(8,18,32,0.12); border-radius: 4px }
.h-scroll::-webkit-scrollbar-track { background: transparent }
`;

// ════════════════════════════════════════════════════════════════
//  TYPES
// ════════════════════════════════════════════════════════════════
type Position = {
  id: string;
  slug: string;
  display_name: string;
  emoji: string;
  description: string;
  default_pay_rate_cents: number;
  default_pay_unit: string;
  default_employment_type: string;
  interview_questions: { id: string; text: string; hint: string; weight: number }[];
};

type Candidate = {
  id: string;
  full_name: string;
  email: string | null;
  phone: string | null;
  position_id: string | null;
  position_slug: string | null;
  years_experience: number | null;
  certifications: string[] | null;
  source: string | null;
  source_notes: string | null;
  status: string;
  interview_pct: number | null;
  interview_tier: string | null;
  internal_notes: string | null;
  hire_pay_rate_cents: number | null;
  hire_pay_unit: string | null;
  hire_start_date: string | null;
  hire_employment_type: string | null;
  added_by_name: string | null;
  created_at: string;
  updated_at: string;
};

type Interview = {
  id: string;
  candidate_id: string;
  scheduled_at: string | null;
  scheduled_location: string | null;
  scheduled_duration_minutes: number;
  conducted_by_name: string | null;
  conducted_at: string | null;
  confirmation_sent_at: string | null;
  answers: { questionId: string; rating: number; notes: string }[];
  wrapup: { id: string; label: string; checked: boolean }[];
  final_notes: string | null;
  score_total: number | null;
  score_max: number | null;
  score_pct: number | null;
  tier: string | null;
  status: string;
};

type CandidateDoc = {
  id: string;
  name: string;
  category: string;
  file_name: string;
  file_size: number;
  file_type: string;
  storage_path: string;
  notes: string | null;
  uploaded_by_name: string | null;
  created_at: string;
  download_url?: string;
};

const STATUS_COLUMNS = [
  { status: "applied",             label: "Applied",        tagline: "New applicants" },
  { status: "phone_screen",        label: "Phone Screen",   tagline: "Quick chat needed" },
  { status: "interview_scheduled", label: "Scheduled",      tagline: "Confirmed time" },
  { status: "interviewed",         label: "Interviewed",    tagline: "Score in" },
  { status: "offer_sent",          label: "Offer Sent",     tagline: "Awaiting response" },
];

const SIDE_BUCKETS = [
  { status: "hired", label: "Hired",  color: C.green },
  { status: "hold",  label: "Hold",   color: C.amberY },
  { status: "pass",  label: "Pass",   color: C.textF },
];

const WRAPUP_DEFAULT = [
  { id: "w1", label: "Confirmed availability for required schedule", checked: false },
  { id: "w2", label: "Asked about pay expectations", checked: false },
  { id: "w3", label: "Confirmed legal right to work in U.S.", checked: false },
  { id: "w4", label: "Discussed start date", checked: false },
  { id: "w5", label: "Reviewed certifications / licenses required", checked: false },
  { id: "w6", label: "Asked candidate's questions", checked: false },
  { id: "w7", label: "Set expectation for next-step timeline", checked: false },
  { id: "w8", label: "Collected references contact info", checked: false },
  { id: "w9", label: "Confirmed transportation to job site", checked: false },
  { id: "w10", label: "Took clear notes for team review", checked: false },
];

// ════════════════════════════════════════════════════════════════
//  ROOT
// ════════════════════════════════════════════════════════════════
export default function HiringPage() {
  const [unlocked, setUnlocked] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined" && sessionStorage.getItem(SESSION_KEY) === "1") {
      setUnlocked(true);
    }
  }, []);

  return (
    <>
      <style>{FONTS}</style>
      {unlocked ? <Dashboard /> : <PasswordGate onUnlock={() => setUnlocked(true)} />}
    </>
  );
}

// ════════════════════════════════════════════════════════════════
//  PASSWORD GATE
// ════════════════════════════════════════════════════════════════
function PasswordGate({ onUnlock }: { onUnlock: () => void }) {
  const [input, setInput] = useState("");
  const [error, setError] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

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
    <div style={{ minHeight: "100vh", background: `linear-gradient(135deg, ${C.bg} 0%, ${C.bg3} 100%)`, display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
      <div className={error ? "h-shake" : "h-fade"} style={{
        background: C.bg2, borderRadius: 18, padding: "44px 36px", maxWidth: 420, width: "100%",
        boxShadow: "0 24px 60px rgba(8,18,32,0.12)", textAlign: "center",
        border: `1px solid ${error ? C.red : C.border}`,
      }}>
        <div style={{ display: "inline-flex", marginBottom: 18 }}>
          <Logo size={48} />
        </div>
        <div style={{ fontFamily: C.mono, fontSize: 9, color: C.textF, letterSpacing: 1.8, textTransform: "uppercase", marginBottom: 8, fontWeight: 600 }}>
          Marine Discovery · Internal
        </div>
        <div style={{ fontFamily: C.display, fontSize: 26, fontWeight: 700, color: C.text, letterSpacing: "-0.02em", marginBottom: 6 }}>
          Hiring Portal
        </div>
        <div style={{ fontFamily: C.sans, fontSize: 13, color: C.textF, marginBottom: 26, lineHeight: 1.55 }}>
          For owners and managers only. Contains payroll information.
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
          onFocus={e => { if (!error) (e.target.style.borderColor = C.cyan); }}
          onBlur={e => { if (!error) (e.target.style.borderColor = C.border); }}
        />
        {error && (
          <div style={{ marginTop: 10, fontFamily: C.sans, fontSize: 12, color: C.red, fontWeight: 500 }}>
            Incorrect password — try again
          </div>
        )}
        <button onClick={attempt} style={{
          width: "100%", marginTop: 14, padding: "13px",
          background: `linear-gradient(135deg, ${C.cyan}, ${C.cyanD})`, color: "#fff", border: "none",
          borderRadius: 10, fontFamily: C.sans, fontWeight: 700, fontSize: 14, cursor: "pointer",
          letterSpacing: 0.3, boxShadow: "0 6px 18px rgba(8,145,178,0.25)",
        }}>
          Unlock →
        </button>
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════
//  DASHBOARD
// ════════════════════════════════════════════════════════════════
function Dashboard() {
  const [positions, setPositions] = useState<Position[]>([]);
  const [candidates, setCandidates] = useState<Candidate[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [showAdd, setShowAdd] = useState(false);
  const [filter, setFilter] = useState<{ position?: string; search?: string }>({});

  const load = async () => {
    try {
      const r = await fetch("/api/mdt/hiring/candidates");
      if (r.ok) {
        const data = await r.json();
        setPositions(data.positions || []);
        setCandidates(data.candidates || []);
      }
    } catch (e) {
      console.warn("[hiring load]", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const filtered = useMemo(() => {
    if (!candidates) return [];
    return candidates.filter(c => {
      if (filter.position && c.position_slug !== filter.position) return false;
      if (filter.search) {
        const q = filter.search.toLowerCase();
        const hay = `${c.full_name} ${c.email || ""} ${c.phone || ""}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [candidates, filter]);

  const stats = useMemo(() => {
    const all = candidates || [];
    return {
      total: all.length,
      pipeline: all.filter(c => !["hired", "pass", "hold"].includes(c.status)).length,
      hired: all.filter(c => c.status === "hired").length,
    };
  }, [candidates]);

  const onCandidateUpdated = (c: Candidate) => {
    setCandidates(prev => (prev || []).map(x => x.id === c.id ? { ...x, ...c } : x));
  };
  const onCandidateRemoved = (id: string) => {
    setCandidates(prev => (prev || []).filter(x => x.id !== id));
    setActiveId(null);
  };

  const positionMap = useMemo(() => {
    const m: Record<string, Position> = {};
    positions.forEach(p => { m[p.slug] = p; });
    return m;
  }, [positions]);

  return (
    <div style={{ minHeight: "100vh", background: C.bg }}>
      <Topbar
        stats={stats}
        positions={positions}
        filter={filter}
        setFilter={setFilter}
        onAdd={() => setShowAdd(true)}
      />

      <main style={{ padding: "0 24px 40px", maxWidth: 1700, margin: "0 auto" }}>
        {loading ? (
          <LoadingState />
        ) : (candidates || []).length === 0 ? (
          <EmptyState onAdd={() => setShowAdd(true)} />
        ) : (
          <KanbanGrid candidates={filtered} positions={positionMap} onOpen={setActiveId} />
        )}
      </main>

      {activeId && (
        <CandidateDrawer
          candidateId={activeId}
          positions={positions}
          onClose={() => setActiveId(null)}
          onUpdated={onCandidateUpdated}
          onRemoved={onCandidateRemoved}
        />
      )}

      {showAdd && (
        <AddCandidateModal
          positions={positions}
          onClose={() => setShowAdd(false)}
          onCreated={async (id) => {
            setShowAdd(false);
            await load();
            setActiveId(id);
          }}
        />
      )}
    </div>
  );
}

// ════════════════════════════════════════════════════════════════
//  TOPBAR
// ════════════════════════════════════════════════════════════════
function Topbar({ stats, positions, filter, setFilter, onAdd }: any) {
  return (
    <div style={{ background: C.bg2, borderBottom: `1px solid ${C.border}`, position: "sticky", top: 0, zIndex: 50, boxShadow: C.shadow }}>
      <div style={{ maxWidth: 1700, margin: "0 auto", padding: "14px 24px", display: "flex", alignItems: "center", gap: 24, flexWrap: "wrap" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <Logo size={32} />
          <div>
            <div style={{ fontFamily: C.display, fontWeight: 700, fontSize: 17, letterSpacing: "-0.01em", color: C.text }}>
              <a href="/mdt" style={{ color: C.textF, textDecoration: "none", fontWeight: 500 }}>MDT</a>
              <span style={{ color: C.textE, margin: "0 6px", fontWeight: 300 }}>·</span>
              <span style={{ fontStyle: "italic", color: C.cyan }}>Hiring</span>
            </div>
            <div style={{ fontFamily: C.mono, fontSize: 9, color: C.textF, letterSpacing: 1.5, textTransform: "uppercase", marginTop: 1 }}>
              Internal — Owners & Managers
            </div>
          </div>
        </div>

        <div style={{ display: "flex", gap: 8, marginLeft: 20 }}>
          <StatPill label="In Pipeline" value={stats.pipeline} color={C.cyan} />
          <StatPill label="Hired" value={stats.hired} color={C.green} />
          <StatPill label="Total" value={stats.total} color={C.textF} />
        </div>

        <div style={{ flex: 1, display: "flex", gap: 10, justifyContent: "flex-end", alignItems: "center", minWidth: 200, flexWrap: "wrap" }}>
          <select
            value={filter.position || ""}
            onChange={e => setFilter((p: any) => ({ ...p, position: e.target.value || undefined }))}
            style={{ padding: "8px 12px", border: `1px solid ${C.border}`, borderRadius: 8, fontFamily: C.sans, fontSize: 13, color: C.textD, background: C.bg2, cursor: "pointer" }}>
            <option value="">All positions</option>
            {positions.map((p: Position) => (
              <option key={p.slug} value={p.slug}>{p.emoji} {p.display_name}</option>
            ))}
          </select>
          <input
            placeholder="Search name, email, phone..."
            value={filter.search || ""}
            onChange={e => setFilter((p: any) => ({ ...p, search: e.target.value || undefined }))}
            style={{ padding: "8px 14px", border: `1px solid ${C.border}`, borderRadius: 8, fontFamily: C.sans, fontSize: 13, color: C.text, background: C.bg2, width: 220, outline: "none" }}
            onFocus={e => (e.target.style.borderColor = C.cyan)}
            onBlur={e => (e.target.style.borderColor = C.border)}
          />
          <button onClick={onAdd} style={{
            padding: "9px 16px",
            background: `linear-gradient(135deg, ${C.cyan}, ${C.cyanD})`, color: "#fff",
            border: "none", borderRadius: 8, fontFamily: C.sans, fontWeight: 700, fontSize: 13,
            cursor: "pointer", boxShadow: "0 4px 14px rgba(8,145,178,0.25)",
            display: "flex", alignItems: "center", gap: 6, whiteSpace: "nowrap",
          }}>
            <span style={{ fontSize: 16, lineHeight: 1, marginTop: -2 }}>+</span> Add Candidate
          </button>
        </div>
      </div>
    </div>
  );
}

function StatPill({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "5px 11px", background: C.bg3, border: `1px solid ${C.border}`, borderRadius: 20 }}>
      <span style={{ width: 7, height: 7, borderRadius: "50%", background: color }} />
      <span style={{ fontFamily: C.mono, fontSize: 10, color: C.textF, letterSpacing: 1, textTransform: "uppercase" }}>{label}</span>
      <span style={{ fontFamily: C.sans, fontWeight: 700, fontSize: 12, color: C.text, fontVariantNumeric: "tabular-nums" }}>{value}</span>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════
//  KANBAN
// ════════════════════════════════════════════════════════════════
function KanbanGrid({ candidates, positions, onOpen }: { candidates: Candidate[]; positions: Record<string, Position>; onOpen: (id: string) => void }) {
  const grouped = useMemo(() => {
    const g: Record<string, Candidate[]> = {};
    [...STATUS_COLUMNS, ...SIDE_BUCKETS].forEach(c => { g[c.status] = []; });
    candidates.forEach(c => { (g[c.status] = g[c.status] || []).push(c); });
    Object.keys(g).forEach(k => g[k].sort((a, b) => (b.interview_pct || 0) - (a.interview_pct || 0)));
    return g;
  }, [candidates]);

  return (
    <div style={{ marginTop: 20 }}>
      {/* Pipeline columns */}
      <div style={{ display: "grid", gridTemplateColumns: `repeat(${STATUS_COLUMNS.length}, 1fr)`, gap: 14, marginBottom: 24 }}>
        {STATUS_COLUMNS.map(col => (
          <KanbanCol
            key={col.status}
            label={col.label}
            tagline={col.tagline}
            candidates={grouped[col.status] || []}
            positions={positions}
            onOpen={onOpen}
          />
        ))}
      </div>

      {/* Side buckets */}
      <div style={{ borderTop: `1px solid ${C.border}`, paddingTop: 18 }}>
        <div style={{ fontFamily: C.mono, fontSize: 9, color: C.textE, letterSpacing: 1.5, textTransform: "uppercase", marginBottom: 12, fontWeight: 600, paddingLeft: 4 }}>
          Resolved
        </div>
        <div style={{ display: "grid", gridTemplateColumns: `repeat(${SIDE_BUCKETS.length}, 1fr)`, gap: 14 }}>
          {SIDE_BUCKETS.map(b => (
            <KanbanCol
              key={b.status}
              label={b.label}
              tagline=""
              candidates={grouped[b.status] || []}
              positions={positions}
              onOpen={onOpen}
              accentColor={b.color}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

function KanbanCol({ label, tagline, candidates, positions, onOpen, accentColor }: any) {
  return (
    <div style={{ minWidth: 0 }}>
      <div style={{ display: "flex", alignItems: "baseline", gap: 8, marginBottom: 10, padding: "0 4px" }}>
        <span style={{ fontFamily: C.sans, fontWeight: 700, fontSize: 14, color: accentColor || C.text }}>{label}</span>
        <span style={{ fontFamily: C.mono, fontSize: 11, color: C.textE, fontVariantNumeric: "tabular-nums" }}>{candidates.length}</span>
        {tagline && <span style={{ fontFamily: C.mono, fontSize: 9, color: C.textE, letterSpacing: 1, textTransform: "uppercase", marginLeft: "auto" }}>{tagline}</span>}
      </div>
      <div className="h-scroll" style={{ display: "flex", flexDirection: "column", gap: 8, maxHeight: "calc(100vh - 240px)", overflowY: "auto", paddingRight: 4 }}>
        {candidates.map((c: Candidate) => (
          <CandidateCard key={c.id} candidate={c} position={positions[c.position_slug || ""]} onOpen={() => onOpen(c.id)} />
        ))}
        {candidates.length === 0 && (
          <div style={{ fontFamily: C.mono, fontSize: 10, color: C.textE, padding: "20px 12px", textAlign: "center", border: `1px dashed ${C.border}`, borderRadius: 10, letterSpacing: 1 }}>
            — empty —
          </div>
        )}
      </div>
    </div>
  );
}

function CandidateCard({ candidate, position, onOpen }: { candidate: Candidate; position?: Position; onOpen: () => void }) {
  const score = candidate.interview_pct;
  const tier = scoreTier(score);

  return (
    <div onClick={onOpen} className="h-fade"
      style={{
        background: C.bg2, border: `1px solid ${C.border}`, borderRadius: 12,
        padding: 14, cursor: "pointer", transition: "all .18s",
        boxShadow: C.shadow,
      }}
      onMouseEnter={e => { e.currentTarget.style.borderColor = C.cyan; e.currentTarget.style.transform = "translateY(-1px)"; e.currentTarget.style.boxShadow = C.shadowL; }}
      onMouseLeave={e => { e.currentTarget.style.borderColor = C.border; e.currentTarget.style.transform = "none"; e.currentTarget.style.boxShadow = C.shadow; }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
        <span style={{ fontFamily: C.mono, fontSize: 9, color: C.textE, letterSpacing: 1 }}>
          {position?.emoji} {position?.display_name || "—"}
        </span>
        {score !== null && score !== undefined && (
          <span style={{ fontFamily: C.mono, fontSize: 9, fontWeight: 700, padding: "2px 8px", borderRadius: 12, color: tier.color, background: tier.color + "15", letterSpacing: 0.5 }}>
            {tier.label} · {score}%
          </span>
        )}
      </div>
      <div style={{ fontFamily: C.sans, fontWeight: 700, fontSize: 14, color: C.text, marginBottom: 4, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
        {candidate.full_name}
      </div>
      <div style={{ fontFamily: C.mono, fontSize: 10.5, color: C.textF, marginBottom: 6, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
        {candidate.email || candidate.phone || "—"}
      </div>
      <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap", fontFamily: C.mono, fontSize: 9, color: C.textF, letterSpacing: 0.5 }}>
        {candidate.years_experience !== null && <span>{candidate.years_experience}y exp</span>}
        {candidate.certifications && candidate.certifications.length > 0 && <span>📜 {candidate.certifications.length}</span>}
        <span style={{ marginLeft: "auto" }}>{relativeTime(candidate.created_at)}</span>
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════
//  ADD CANDIDATE MODAL
// ════════════════════════════════════════════════════════════════
function AddCandidateModal({ positions, onClose, onCreated }: { positions: Position[]; onClose: () => void; onCreated: (id: string) => void }) {
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [positionSlug, setPositionSlug] = useState(positions[0]?.slug || "");
  const [yearsExperience, setYearsExperience] = useState("");
  const [certifications, setCertifications] = useState("");
  const [source, setSource] = useState("manual");
  const [internalNotes, setInternalNotes] = useState("");
  const [addedBy, setAddedBy] = useState("");

  const submit = async () => {
    setErr("");
    if (!fullName.trim()) { setErr("Full name required"); return; }
    if (!positionSlug) { setErr("Pick a position"); return; }
    setBusy(true);
    try {
      const r = await fetch("/api/mdt/hiring/candidates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          full_name: fullName.trim(),
          email: email.trim() || undefined,
          phone: phone.trim() || undefined,
          position_slug: positionSlug,
          years_experience: yearsExperience || undefined,
          certifications: certifications.trim() ? certifications.split(",").map(s => s.trim()).filter(Boolean) : undefined,
          source,
          internal_notes: internalNotes.trim() || undefined,
          added_by_name: addedBy.trim() || undefined,
        }),
      });
      const data = await r.json();
      if (!r.ok) throw new Error(data.error || `Failed (${r.status})`);
      onCreated(data.candidate.id);
    } catch (e: any) {
      setErr(e?.message || "Save failed");
    } finally { setBusy(false); }
  };

  return (
    <div onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
      style={{ position: "fixed", inset: 0, background: "rgba(8,18,32,0.5)", backdropFilter: "blur(8px)", zIndex: 200, display: "flex", alignItems: "flex-start", justifyContent: "center", padding: "40px 20px", overflowY: "auto", animation: "hFadeIn .2s" }}>
      <div onClick={e => e.stopPropagation()} style={{ background: C.bg2, borderRadius: 16, width: "100%", maxWidth: 580, boxShadow: "0 30px 80px rgba(8,18,32,0.3)" }}>
        <div style={{ padding: "20px 24px 16px", borderBottom: `1px solid ${C.border}`, display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <div>
            <div style={{ fontFamily: C.mono, fontSize: 9, color: C.textF, letterSpacing: 1.5, textTransform: "uppercase", marginBottom: 4 }}>New Candidate</div>
            <div style={{ fontFamily: C.display, fontWeight: 700, fontSize: 22, color: C.text, letterSpacing: "-0.01em" }}>Add to pipeline</div>
          </div>
          <button onClick={onClose} style={{ background: "transparent", border: "none", padding: "4px 10px", cursor: "pointer", fontSize: 24, color: C.textF, lineHeight: 1 }}>×</button>
        </div>

        <div style={{ padding: "20px 24px", maxHeight: "70vh", overflowY: "auto" }} className="h-scroll">
          <Section title="Position">
            <Field label="Applying for" required>
              <Select value={positionSlug} onChange={setPositionSlug}>
                <option value="">Select position…</option>
                {positions.map(p => (
                  <option key={p.slug} value={p.slug}>{p.emoji} {p.display_name}</option>
                ))}
              </Select>
            </Field>
          </Section>

          <Section title="Candidate">
            <Field label="Full name" required>
              <Input value={fullName} onChange={setFullName} placeholder="Sarah Hayes" autoFocus />
            </Field>
            <Row>
              <Field label="Email"><Input type="email" value={email} onChange={setEmail} placeholder="sarah@example.com" /></Field>
              <Field label="Phone"><Input type="tel" value={phone} onChange={setPhone} placeholder="(541) 555-1234" /></Field>
            </Row>
            <Row>
              <Field label="Years experience"><Input type="number" value={yearsExperience} onChange={setYearsExperience} placeholder="5" /></Field>
              <Field label="Certifications" hint="Comma separated"><Input value={certifications} onChange={setCertifications} placeholder="USCG OUPV, CPR" /></Field>
            </Row>
          </Section>

          <Section title="Source">
            <Row>
              <Field label="How they came in">
                <Select value={source} onChange={setSource}>
                  <option value="manual">Manual entry</option>
                  <option value="referral">Referral</option>
                  <option value="craigslist">Craigslist</option>
                  <option value="indeed">Indeed</option>
                  <option value="web_form">Website form</option>
                  <option value="other">Other</option>
                </Select>
              </Field>
              <Field label="Added by" hint="Optional"><Input value={addedBy} onChange={setAddedBy} placeholder="Brendan" /></Field>
            </Row>
            <Field label="Internal notes" hint="Private — only you see this">
              <Textarea rows={3} value={internalNotes} onChange={setInternalNotes} placeholder="Walked into the office Tues afternoon. Seemed sharp." />
            </Field>
          </Section>

          {err && <div style={{ padding: "10px 12px", background: C.redL, border: "1px solid rgba(220,38,38,0.25)", borderRadius: 8, fontFamily: C.sans, fontSize: 12.5, color: C.red }}>{err}</div>}
        </div>

        <div style={{ padding: "14px 24px", borderTop: `1px solid ${C.border}`, background: C.bg, display: "flex", justifyContent: "flex-end", gap: 8 }}>
          <button onClick={onClose} disabled={busy} style={{ padding: "9px 16px", background: "transparent", border: `1px solid ${C.border}`, borderRadius: 8, fontFamily: C.sans, fontWeight: 600, fontSize: 13, color: C.textD, cursor: busy ? "wait" : "pointer" }}>Cancel</button>
          <button onClick={submit} disabled={busy} style={{ padding: "9px 20px", background: `linear-gradient(135deg, ${C.cyan}, ${C.cyanD})`, color: "#fff", border: "none", borderRadius: 8, fontFamily: C.sans, fontWeight: 700, fontSize: 13, cursor: busy ? "wait" : "pointer", boxShadow: "0 4px 14px rgba(8,145,178,0.25)" }}>
            {busy ? "Saving…" : "Add Candidate"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════
//  CANDIDATE DRAWER
// ════════════════════════════════════════════════════════════════
function CandidateDrawer({ candidateId, positions, onClose, onUpdated, onRemoved }: any) {
  const [candidate, setCandidate] = useState<Candidate | null>(null);
  const [interviews, setInterviews] = useState<Interview[]>([]);
  const [documents, setDocuments] = useState<CandidateDoc[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [tab, setTab] = useState<"profile" | "interview" | "documents">("profile");
  const [activeInterview, setActiveInterview] = useState<Interview | null>(null);

  const position = positions.find((p: Position) => p.slug === candidate?.position_slug);

  const load = async () => {
    setLoading(true);
    try {
      const [cRes, iRes, dRes] = await Promise.all([
        fetch("/api/mdt/hiring/candidates").then(r => r.ok ? r.json() : { candidates: [] }),
        fetch(`/api/mdt/hiring/interview?candidate_id=${candidateId}`).then(r => r.ok ? r.json() : { interviews: [] }),
        fetch(`/api/mdt/hiring/documents?candidate_id=${candidateId}`).then(r => r.ok ? r.json() : { documents: [] }),
      ]);
      const c = (cRes.candidates || []).find((x: Candidate) => x.id === candidateId);
      setCandidate(c || null);
      setInterviews(iRes.interviews || []);
      setDocuments(dRes.documents || []);
    } catch (e: any) {
      console.warn("[drawer load]", e?.message);
    } finally { setLoading(false); }
  };

  useEffect(() => { load(); }, [candidateId]);

  const updateCandidate = async (updates: any) => {
    setBusy(true);
    try {
      const r = await fetch(`/api/mdt/hiring/candidates?id=${candidateId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
      });
      const data = await r.json();
      if (!r.ok) { alert("Save failed: " + (data.error || r.status)); return; }
      setCandidate(data.candidate);
      onUpdated(data.candidate);
    } finally { setBusy(false); }
  };

  const deleteCandidate = async () => {
    if (!confirm(`Delete ${candidate?.full_name}? This will also remove their interview records and documents. This cannot be undone.`)) return;
    setBusy(true);
    try {
      const r = await fetch(`/api/mdt/hiring/candidates?id=${candidateId}`, { method: "DELETE" });
      if (r.ok) onRemoved(candidateId);
      else alert("Delete failed");
    } finally { setBusy(false); }
  };

  return (
    <div onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
      style={{ position: "fixed", inset: 0, background: "rgba(8,18,32,0.45)", backdropFilter: "blur(6px)", zIndex: 100, display: "flex", justifyContent: "flex-end", animation: "hFadeIn .2s" }}>
      <div onClick={e => e.stopPropagation()}
        style={{ background: C.bg, height: "100vh", width: "min(820px, 96vw)", boxShadow: "-20px 0 60px rgba(8,18,32,0.2)", display: "flex", flexDirection: "column", animation: "hSlide .3s cubic-bezier(.22,1,.36,1)" }}>
        {/* Header */}
        <div style={{ padding: "16px 20px", borderBottom: `1px solid ${C.border}`, background: C.bg2, display: "flex", alignItems: "center", gap: 12 }}>
          <button onClick={onClose} style={{ background: "transparent", border: "none", padding: "6px 10px", cursor: "pointer", fontSize: 22, color: C.textF, lineHeight: 1 }}>×</button>
          {candidate && (
            <>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 2 }}>
                  {position && <span style={{ fontFamily: C.mono, fontSize: 9, padding: "2px 8px", background: C.cyanL, color: C.cyan, borderRadius: 12, fontWeight: 700, letterSpacing: 0.5, textTransform: "uppercase" }}>{position.emoji} {position.display_name}</span>}
                  <StatusChip status={candidate.status} />
                </div>
                <div style={{ fontFamily: C.display, fontWeight: 700, fontSize: 20, color: C.text, letterSpacing: "-0.01em", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {candidate.full_name}
                </div>
              </div>
              <StatusMenu status={candidate.status} onChange={(s) => updateCandidate({ status: s })} disabled={busy} />
              <button onClick={deleteCandidate} disabled={busy} title="Delete candidate" style={{ background: "transparent", border: `1px solid ${C.border}`, borderRadius: 8, padding: "8px 10px", color: C.red, cursor: busy ? "wait" : "pointer", fontFamily: C.sans, fontSize: 12, fontWeight: 600 }}>Delete</button>
            </>
          )}
        </div>

        {/* Tabs */}
        {candidate && (
          <div style={{ display: "flex", gap: 0, padding: "0 20px", borderBottom: `1px solid ${C.border}`, background: C.bg2 }}>
            <Tab active={tab === "profile"} onClick={() => setTab("profile")} label="Profile" />
            <Tab active={tab === "interview"} onClick={() => setTab("interview")} label={`Interview${interviews.length > 0 ? ` · ${interviews.length}` : ""}`} />
            <Tab active={tab === "documents"} onClick={() => setTab("documents")} label={`Documents${documents.length > 0 ? ` · ${documents.length}` : ""}`} />
          </div>
        )}

        {/* Body */}
        <div className="h-scroll" style={{ flex: 1, overflowY: "auto", padding: "20px" }}>
          {loading || !candidate ? (
            <div style={{ padding: 40, textAlign: "center", fontFamily: C.mono, fontSize: 11, color: C.textE, letterSpacing: 1 }}>LOADING…</div>
          ) : (
            <>
              {tab === "profile" && (
                <ProfileTab candidate={candidate} position={position} positions={positions} onSave={updateCandidate} busy={busy} onSendOffer={load} />
              )}
              {tab === "interview" && (
                <InterviewTab
                  candidate={candidate}
                  position={position}
                  interviews={interviews}
                  activeInterview={activeInterview}
                  setActiveInterview={setActiveInterview}
                  onReload={load}
                />
              )}
              {tab === "documents" && (
                <DocumentsTab candidate={candidate} documents={documents} onReload={load} />
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function Tab({ active, onClick, label }: { active: boolean; onClick: () => void; label: string }) {
  return (
    <button onClick={onClick} style={{
      padding: "12px 16px", background: "transparent", border: "none",
      borderBottom: active ? `2px solid ${C.cyan}` : "2px solid transparent",
      fontFamily: C.sans, fontWeight: active ? 700 : 500, fontSize: 13.5,
      color: active ? C.cyan : C.textF, cursor: "pointer", marginBottom: -1,
    }}>
      {label}
    </button>
  );
}

function StatusChip({ status }: { status: string }) {
  const map: Record<string, { label: string; color: string }> = {
    applied: { label: "Applied", color: C.textF },
    phone_screen: { label: "Phone Screen", color: C.cyan },
    interview_scheduled: { label: "Scheduled", color: C.violet },
    interviewed: { label: "Interviewed", color: C.amberY },
    offer_sent: { label: "Offer Sent", color: C.amber },
    hired: { label: "Hired", color: C.green },
    hold: { label: "Hold", color: C.amberY },
    pass: { label: "Pass", color: C.textF },
  };
  const s = map[status] || { label: status, color: C.textF };
  return (
    <span style={{ fontFamily: C.mono, fontSize: 9, padding: "2px 8px", background: s.color + "15", color: s.color, borderRadius: 12, fontWeight: 700, letterSpacing: 0.5, textTransform: "uppercase" }}>
      {s.label}
    </span>
  );
}

function StatusMenu({ status, onChange, disabled }: { status: string; onChange: (s: string) => void; disabled: boolean }) {
  const opts = [
    { value: "applied", label: "Applied" },
    { value: "phone_screen", label: "Phone Screen" },
    { value: "interview_scheduled", label: "Interview Scheduled" },
    { value: "interviewed", label: "Interviewed" },
    { value: "offer_sent", label: "Offer Sent" },
    { value: "hired", label: "Hired" },
    { value: "hold", label: "Hold" },
    { value: "pass", label: "Pass" },
  ];
  return (
    <select value={status} onChange={e => onChange(e.target.value)} disabled={disabled}
      style={{ padding: "8px 10px", border: `1px solid ${C.border}`, borderRadius: 8, fontFamily: C.sans, fontWeight: 600, fontSize: 12, color: C.textD, background: C.bg2, cursor: disabled ? "wait" : "pointer" }}>
      {opts.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
    </select>
  );
}

// ════════════════════════════════════════════════════════════════
//  PROFILE TAB
// ════════════════════════════════════════════════════════════════
function ProfileTab({ candidate, position, positions, onSave, busy, onSendOffer }: any) {
  const [editing, setEditing] = useState(false);
  const [fullName, setFullName] = useState(candidate.full_name);
  const [email, setEmail] = useState(candidate.email || "");
  const [phone, setPhone] = useState(candidate.phone || "");
  const [positionSlug, setPositionSlug] = useState(candidate.position_slug || "");
  const [yearsExperience, setYearsExperience] = useState(candidate.years_experience?.toString() || "");
  const [certifications, setCertifications] = useState((candidate.certifications || []).join(", "));
  const [internalNotes, setInternalNotes] = useState(candidate.internal_notes || "");

  const save = async () => {
    await onSave({
      full_name: fullName.trim(),
      email: email.trim() || null,
      phone: phone.trim() || null,
      position_slug: positionSlug,
      years_experience: yearsExperience ? parseInt(yearsExperience, 10) : null,
      certifications: certifications.trim() ? certifications.split(",").map(s => s.trim()).filter(Boolean) : null,
      internal_notes: internalNotes.trim() || null,
    });
    setEditing(false);
  };

  return (
    <>
      {/* Contact card */}
      <div style={{ background: C.bg2, border: `1px solid ${C.border}`, borderRadius: 12, padding: 14, marginBottom: 14 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: editing ? 12 : 8 }}>
          <span style={{ fontFamily: C.mono, fontSize: 9, color: C.textE, letterSpacing: 1.5, textTransform: "uppercase" }}>Profile</span>
          {!editing && (
            <button onClick={() => setEditing(true)} style={{ background: "transparent", border: "none", fontFamily: C.mono, fontSize: 10, color: C.cyan, letterSpacing: 1, textTransform: "uppercase", cursor: "pointer", padding: 0 }}>Edit</button>
          )}
        </div>
        {editing ? (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <Field label="Full name"><Input value={fullName} onChange={setFullName} /></Field>
            <Row>
              <Field label="Email"><Input type="email" value={email} onChange={setEmail} /></Field>
              <Field label="Phone"><Input type="tel" value={phone} onChange={setPhone} /></Field>
            </Row>
            <Field label="Position">
              <Select value={positionSlug} onChange={setPositionSlug}>
                {positions.map((p: Position) => <option key={p.slug} value={p.slug}>{p.emoji} {p.display_name}</option>)}
              </Select>
            </Field>
            <Row>
              <Field label="Years experience"><Input type="number" value={yearsExperience} onChange={setYearsExperience} /></Field>
              <Field label="Certifications" hint="Comma separated"><Input value={certifications} onChange={setCertifications} /></Field>
            </Row>
            <Field label="Internal notes" hint="Private"><Textarea rows={3} value={internalNotes} onChange={setInternalNotes} /></Field>
            <div style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}>
              <button onClick={() => setEditing(false)} disabled={busy} style={{ padding: "7px 14px", background: "transparent", border: `1px solid ${C.border}`, borderRadius: 7, fontFamily: C.sans, fontWeight: 600, fontSize: 12, color: C.textD, cursor: busy ? "wait" : "pointer" }}>Cancel</button>
              <button onClick={save} disabled={busy} style={{ padding: "7px 16px", background: `linear-gradient(135deg, ${C.cyan}, ${C.cyanD})`, color: "#fff", border: "none", borderRadius: 7, fontFamily: C.sans, fontWeight: 700, fontSize: 12, cursor: busy ? "wait" : "pointer" }}>{busy ? "Saving…" : "Save"}</button>
            </div>
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 12 }}>
            <ProfileItem label="Email" value={candidate.email || "—"} mono />
            <ProfileItem label="Phone" value={candidate.phone || "—"} mono />
            <ProfileItem label="Experience" value={candidate.years_experience !== null ? `${candidate.years_experience} years` : "—"} />
            <ProfileItem label="Source" value={candidate.source || "—"} />
            {candidate.certifications && candidate.certifications.length > 0 && (
              <div style={{ gridColumn: "1 / -1" }}>
                <div style={{ fontFamily: C.mono, fontSize: 9, color: C.textF, letterSpacing: 1, textTransform: "uppercase", marginBottom: 6 }}>Certifications</div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                  {candidate.certifications.map((c: string, i: number) => (
                    <span key={i} style={{ padding: "3px 10px", background: C.bg3, border: `1px solid ${C.border}`, borderRadius: 14, fontFamily: C.mono, fontSize: 10, color: C.textD }}>{c}</span>
                  ))}
                </div>
              </div>
            )}
            {candidate.internal_notes && (
              <div style={{ gridColumn: "1 / -1" }}>
                <div style={{ fontFamily: C.mono, fontSize: 9, color: C.textF, letterSpacing: 1, textTransform: "uppercase", marginBottom: 4 }}>Notes</div>
                <div style={{ fontFamily: C.sans, fontSize: 13, color: C.textD, lineHeight: 1.5, whiteSpace: "pre-wrap" }}>{candidate.internal_notes}</div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Score summary */}
      {candidate.interview_pct !== null && (
        <div style={{ background: C.bg2, border: `1px solid ${C.border}`, borderRadius: 12, padding: 14, marginBottom: 14 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 8 }}>
            <span style={{ fontFamily: C.mono, fontSize: 9, color: C.textE, letterSpacing: 1.5, textTransform: "uppercase" }}>Interview Score</span>
            <span style={{ fontFamily: C.display, fontSize: 28, fontWeight: 800, color: scoreTier(candidate.interview_pct).color, lineHeight: 1, fontVariantNumeric: "tabular-nums" }}>{candidate.interview_pct}%</span>
          </div>
          <div style={{ height: 6, background: C.bg3, borderRadius: 3, overflow: "hidden" }}>
            <div style={{ width: `${candidate.interview_pct}%`, height: "100%", background: scoreTier(candidate.interview_pct).color, transition: "width .3s" }} />
          </div>
        </div>
      )}

      {/* Hire / offer panel */}
      <OfferPanel candidate={candidate} position={position} onSent={onSendOffer} busy={busy} />

      {/* Onboarding packet panel */}
      <OnboardingPanel candidate={candidate} onSent={onSendOffer} />
    </>
  );
}

function ProfileItem({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div>
      <div style={{ fontFamily: C.mono, fontSize: 9, color: C.textF, letterSpacing: 1, textTransform: "uppercase", marginBottom: 2 }}>{label}</div>
      <div style={{ fontFamily: mono ? C.mono : C.sans, fontSize: mono ? 12 : 13.5, color: C.text, fontWeight: mono ? 500 : 600 }}>{value}</div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════
//  OFFER PANEL
// ════════════════════════════════════════════════════════════════
function OfferPanel({ candidate, position, onSent, busy }: any) {
  const [open, setOpen] = useState(false);
  const [preview, setPreview] = useState<any>(null);
  const [sending, setSending] = useState(false);
  const [err, setErr] = useState("");

  const [payRate, setPayRate] = useState(((candidate.hire_pay_rate_cents || position?.default_pay_rate_cents || 2000) / 100).toFixed(2));
  const [payUnit, setPayUnit] = useState(candidate.hire_pay_unit || position?.default_pay_unit || "hour");
  const [startDate, setStartDate] = useState(candidate.hire_start_date || "");
  const [employmentType, setEmploymentType] = useState(candidate.hire_employment_type || position?.default_employment_type || "seasonal");

  const generatePreview = async () => {
    setErr("");
    setSending(true);
    try {
      const r = await fetch("/api/mdt/hiring/send-offer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          candidate_id: candidate.id,
          pay_rate: payRate,
          pay_unit: payUnit,
          start_date: startDate,
          employment_type: employmentType,
          send: false,
        }),
      });
      const data = await r.json();
      if (!r.ok) throw new Error(data.error || `Failed (${r.status})`);
      setPreview(data.preview);
    } catch (e: any) { setErr(e?.message || "Generation failed"); }
    finally { setSending(false); }
  };

  const sendOffer = async () => {
    if (!confirm(`Send offer letter to ${candidate.email}?`)) return;
    setErr("");
    setSending(true);
    try {
      const r = await fetch("/api/mdt/hiring/send-offer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          candidate_id: candidate.id,
          pay_rate: payRate,
          pay_unit: payUnit,
          start_date: startDate,
          employment_type: employmentType,
          send: true,
        }),
      });
      const data = await r.json();
      if (!r.ok) throw new Error(data.error || `Failed (${r.status})`);
      if (data.queue_reason) {
        alert("Offer letter generated and saved. " + data.queue_reason + "\n\nYou can copy the text below and email it manually until SMTP is configured.");
        setPreview(data.preview);
      } else {
        alert("✅ Offer sent to " + candidate.email);
        setOpen(false);
        setPreview(null);
        if (onSent) onSent();
      }
    } catch (e: any) { setErr(e?.message || "Send failed"); }
    finally { setSending(false); }
  };

  if (!open) {
    return (
      <div style={{ background: "linear-gradient(135deg, rgba(224,123,0,0.06), rgba(224,123,0,0.02))", border: "1px solid rgba(224,123,0,0.2)", borderRadius: 12, padding: 14, marginBottom: 14 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
          <div>
            <div style={{ fontFamily: C.sans, fontWeight: 700, fontSize: 14, color: C.text, marginBottom: 4 }}>Generate offer letter</div>
            <div style={{ fontFamily: C.sans, fontSize: 12, color: C.textF, lineHeight: 1.5 }}>
              {candidate.status === "offer_sent" ? "Offer already sent. Generate again to update." : "Branded offer letter, sent from Captain@marinediscovery.com."}
            </div>
          </div>
          <button onClick={() => setOpen(true)} disabled={!candidate.email} style={{
            padding: "9px 16px",
            background: candidate.email ? `linear-gradient(135deg, ${C.amber}, #c96800)` : C.bg3,
            color: candidate.email ? "#fff" : C.textE, border: "none", borderRadius: 8,
            fontFamily: C.sans, fontWeight: 700, fontSize: 13, cursor: candidate.email ? "pointer" : "not-allowed",
            boxShadow: candidate.email ? "0 4px 14px rgba(224,123,0,0.25)" : "none",
            whiteSpace: "nowrap",
          }}>
            {candidate.email ? "Build offer →" : "Add email first"}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ background: C.bg2, border: `1.5px solid ${C.amber}`, borderRadius: 12, padding: 14, marginBottom: 14 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
        <span style={{ fontFamily: C.mono, fontSize: 9, color: C.amber, letterSpacing: 1.5, textTransform: "uppercase", fontWeight: 700 }}>Offer Letter</span>
        <button onClick={() => { setOpen(false); setPreview(null); }} style={{ background: "transparent", border: "none", fontFamily: C.mono, fontSize: 10, color: C.textF, cursor: "pointer" }}>Close</button>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 14 }}>
        <Row>
          <Field label="Pay rate ($)"><Input type="number" value={payRate} onChange={setPayRate} /></Field>
          <Field label="Per">
            <Select value={payUnit} onChange={setPayUnit}>
              <option value="hour">Hour</option>
              <option value="day">Day</option>
              <option value="trip">Trip</option>
              <option value="salary">Salary (annual)</option>
            </Select>
          </Field>
        </Row>
        <Row>
          <Field label="Start date"><Input type="date" value={startDate} onChange={setStartDate} /></Field>
          <Field label="Employment type">
            <Select value={employmentType} onChange={setEmploymentType}>
              <option value="seasonal">Seasonal</option>
              <option value="full_time">Full time</option>
              <option value="part_time">Part time</option>
              <option value="contract">Contract</option>
            </Select>
          </Field>
        </Row>
      </div>

      <div style={{ display: "flex", justifyContent: "space-between", gap: 8 }}>
        <button onClick={generatePreview} disabled={sending} style={{ padding: "8px 14px", background: "transparent", border: `1px solid ${C.border}`, borderRadius: 7, fontFamily: C.sans, fontWeight: 600, fontSize: 12, color: C.textD, cursor: sending ? "wait" : "pointer" }}>
          {sending ? "Working…" : "Preview"}
        </button>
        <button onClick={sendOffer} disabled={sending} style={{ padding: "8px 18px", background: `linear-gradient(135deg, ${C.amber}, #c96800)`, color: "#fff", border: "none", borderRadius: 7, fontFamily: C.sans, fontWeight: 700, fontSize: 12, cursor: sending ? "wait" : "pointer", boxShadow: "0 4px 12px rgba(224,123,0,0.25)" }}>
          {sending ? "Sending…" : "Send offer →"}
        </button>
      </div>

      {err && <div style={{ marginTop: 10, padding: "8px 12px", background: C.redL, border: "1px solid rgba(220,38,38,0.25)", borderRadius: 8, fontFamily: C.sans, fontSize: 12, color: C.red }}>{err}</div>}

      {preview && (
        <div style={{ marginTop: 14, padding: 14, background: C.bg, border: `1px solid ${C.border}`, borderRadius: 10 }}>
          <div style={{ fontFamily: C.mono, fontSize: 9, color: C.textF, letterSpacing: 1, textTransform: "uppercase", marginBottom: 8 }}>Preview</div>
          <div style={{ fontFamily: C.sans, fontWeight: 700, fontSize: 13, color: C.text, marginBottom: 8 }}>{preview.subject}</div>
          <div style={{ fontFamily: C.sans, fontSize: 12.5, color: C.textD, whiteSpace: "pre-wrap", lineHeight: 1.6, maxHeight: 280, overflowY: "auto" }} className="h-scroll">{preview.body_text}</div>
        </div>
      )}
    </div>
  );
}

// ════════════════════════════════════════════════════════════════
//  ONBOARDING PANEL — sends magic-link onboarding packet to candidate
// ════════════════════════════════════════════════════════════════
function OnboardingPanel({ candidate, onSent }: any) {
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [preview, setPreview] = useState<any>(null);
  const [invitation, setInvitation] = useState<any>(null);
  const [err, setErr] = useState("");
  const [customSubject, setCustomSubject] = useState("");
  const [customBody, setCustomBody] = useState("");

  // Load existing invitation status if present
  useEffect(() => {
    if (!candidate.onboarding_invitation_id) return;
    (async () => {
      try {
        const r = await fetch(`/api/mdt/hiring/onboarding/invitations?id=${candidate.onboarding_invitation_id}`);
        if (r.ok) {
          const data = await r.json();
          setInvitation(data.invitation || null);
        }
      } catch (e) {}
    })();
  }, [candidate.onboarding_invitation_id]);

  const generatePreview = async () => {
    setErr(""); setBusy(true);
    try {
      const r = await fetch("/api/mdt/hiring/send-onboarding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          candidate_id: candidate.id,
          custom_subject: customSubject.trim() || undefined,
          custom_body: customBody.trim() || undefined,
          send: false,
        }),
      });
      const data = await r.json();
      if (!r.ok) throw new Error(data.error || `Failed (${r.status})`);
      setPreview(data.preview);
    } catch (e: any) { setErr(e?.message || "Failed"); }
    finally { setBusy(false); }
  };

  const sendPacket = async () => {
    if (!candidate.email) { setErr("Candidate has no email."); return; }
    if (!confirm(`Send onboarding packet to ${candidate.email}?`)) return;
    setErr(""); setBusy(true);
    try {
      const r = await fetch("/api/mdt/hiring/send-onboarding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          candidate_id: candidate.id,
          custom_subject: customSubject.trim() || undefined,
          custom_body: customBody.trim() || undefined,
          send: true,
        }),
      });
      const data = await r.json();
      if (!r.ok) throw new Error(data.error || `Failed (${r.status})`);
      if (data.queue_reason) {
        alert("Onboarding invitation created. " + data.queue_reason + "\n\nLink: " + data.invitation.link);
      } else {
        alert("✅ Onboarding packet sent to " + candidate.email);
      }
      setOpen(false);
      setPreview(null);
      setInvitation({ ...data.invitation, status: data.sent ? "invited" : "invited" });
      if (onSent) onSent();
    } catch (e: any) { setErr(e?.message || "Failed"); }
    finally { setBusy(false); }
  };

  const copyLink = () => {
    if (!invitation) return;
    const link = `${window.location.origin}/onboard/${invitation.token}`;
    navigator.clipboard.writeText(link);
    alert("Link copied:\n" + link);
  };

  // Has an existing invitation — show status card
  if (invitation && !open) {
    const pct = invitation.completion_pct || 0;
    const status = invitation.status;
    const statusColors: any = {
      invited: { bg: "rgba(8,145,178,0.06)", border: "rgba(8,145,178,0.2)", color: "#0891b2", label: "Invited · awaiting candidate" },
      in_progress: { bg: "rgba(245,158,11,0.08)", border: "rgba(245,158,11,0.25)", color: "#f59e0b", label: `In progress · ${pct}%` },
      completed: { bg: "rgba(16,185,129,0.08)", border: "rgba(16,185,129,0.25)", color: "#10b981", label: "✓ Onboarding complete" },
      expired: { bg: "rgba(220,38,38,0.06)", border: "rgba(220,38,38,0.2)", color: "#dc2626", label: "Expired · resend needed" },
      revoked: { bg: "rgba(100,116,139,0.08)", border: "rgba(100,116,139,0.2)", color: "#64748b", label: "Revoked" },
    };
    const s = statusColors[status] || statusColors.invited;
    return (
      <div style={{ background: s.bg, border: `1px solid ${s.border}`, borderRadius: 12, padding: 14, marginBottom: 14 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8, gap: 10, flexWrap: "wrap" }}>
          <div>
            <div style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 9, color: s.color, letterSpacing: 1.5, textTransform: "uppercase", marginBottom: 4, fontWeight: 700 }}>Onboarding Packet</div>
            <div style={{ fontFamily: "'Inter',sans-serif", fontSize: 13.5, fontWeight: 700, color: "#0c1220" }}>{s.label}</div>
            {invitation.email_sent_at && <div style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 10, color: "#64748b", marginTop: 3 }}>Sent {new Date(invitation.email_sent_at).toLocaleDateString()}</div>}
          </div>
          <div style={{ display: "flex", gap: 6 }}>
            <button onClick={copyLink} style={{ padding: "6px 12px", background: "transparent", border: `1px solid ${s.color}`, borderRadius: 7, fontFamily: "'Inter',sans-serif", fontWeight: 600, fontSize: 11, color: s.color, cursor: "pointer" }}>Copy link</button>
            {(status === "expired" || status === "revoked") && (
              <button onClick={() => setOpen(true)} style={{ padding: "6px 12px", background: s.color, color: "#fff", border: "none", borderRadius: 7, fontFamily: "'Inter',sans-serif", fontWeight: 700, fontSize: 11, cursor: "pointer" }}>Resend</button>
            )}
          </div>
        </div>
        {pct > 0 && pct < 100 && (
          <div style={{ height: 5, background: "rgba(0,0,0,0.05)", borderRadius: 3, overflow: "hidden", marginTop: 4 }}>
            <div style={{ width: `${pct}%`, height: "100%", background: s.color, transition: "width .3s" }} />
          </div>
        )}
      </div>
    );
  }

  if (!open) {
    const canSend = !!candidate.email && (candidate.status === "hired" || candidate.status === "offer_sent");
    return (
      <div style={{ background: "linear-gradient(135deg, rgba(8,145,178,0.06), rgba(8,145,178,0.02))", border: "1px solid rgba(8,145,178,0.2)", borderRadius: 12, padding: 14, marginBottom: 14 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
          <div>
            <div style={{ fontFamily: "'Inter',sans-serif", fontWeight: 700, fontSize: 14, color: "#0c1220", marginBottom: 4 }}>Send onboarding packet</div>
            <div style={{ fontFamily: "'Inter',sans-serif", fontSize: 12, color: "#64748b", lineHeight: 1.5 }}>
              {!candidate.email ? "Add an email first." :
                candidate.status !== "hired" && candidate.status !== "offer_sent"
                  ? "Mark candidate as Offer Sent or Hired first."
                  : "Magic-link packet — they fill out everything online and sign electronically."}
            </div>
          </div>
          <button onClick={() => setOpen(true)} disabled={!canSend} style={{
            padding: "9px 16px",
            background: canSend ? "linear-gradient(135deg, #0891b2, #0e7490)" : "#e8f1f7",
            color: canSend ? "#fff" : "#94a3b8", border: "none", borderRadius: 8,
            fontFamily: "'Inter',sans-serif", fontWeight: 700, fontSize: 13, cursor: canSend ? "pointer" : "not-allowed",
            boxShadow: canSend ? "0 4px 14px rgba(8,145,178,0.25)" : "none",
            whiteSpace: "nowrap",
          }}>
            Send Packet →
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ background: "#fff", border: "1.5px solid #0891b2", borderRadius: 12, padding: 14, marginBottom: 14 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
        <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 9, color: "#0891b2", letterSpacing: 1.5, textTransform: "uppercase", fontWeight: 700 }}>Onboarding Packet</span>
        <button onClick={() => { setOpen(false); setPreview(null); }} style={{ background: "transparent", border: "none", fontFamily: "'JetBrains Mono',monospace", fontSize: 10, color: "#64748b", cursor: "pointer" }}>Close</button>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 12 }}>
        <div>
          <label style={{ fontFamily: "'Inter',sans-serif", fontSize: 11, fontWeight: 600, color: "#3b475c", marginBottom: 5, display: "block" }}>Custom subject (optional)</label>
          <input value={customSubject} onChange={e => setCustomSubject(e.target.value)} placeholder="Leave blank to use default"
            style={{ width: "100%", padding: "9px 12px", border: "1px solid #dce8f0", borderRadius: 8, fontFamily: "'Inter',sans-serif", fontSize: 13, color: "#0c1220", background: "#fff", outline: "none" }} />
        </div>
        <div>
          <label style={{ fontFamily: "'Inter',sans-serif", fontSize: 11, fontWeight: 600, color: "#3b475c", marginBottom: 5, display: "block" }}>Custom welcome message (optional)</label>
          <textarea value={customBody} onChange={e => setCustomBody(e.target.value)} rows={3} placeholder="Personalize the welcome message — leave blank for default."
            style={{ width: "100%", padding: "10px 12px", border: "1px solid #dce8f0", borderRadius: 8, fontFamily: "'Inter',sans-serif", fontSize: 13, lineHeight: 1.5, color: "#0c1220", background: "#fff", outline: "none", resize: "vertical" }} />
        </div>
      </div>

      <div style={{ display: "flex", justifyContent: "space-between", gap: 8 }}>
        <button onClick={generatePreview} disabled={busy} style={{ padding: "8px 14px", background: "transparent", border: "1px solid #dce8f0", borderRadius: 7, fontFamily: "'Inter',sans-serif", fontWeight: 600, fontSize: 12, color: "#3b475c", cursor: busy ? "wait" : "pointer" }}>
          {busy ? "…" : "Preview"}
        </button>
        <button onClick={sendPacket} disabled={busy} style={{ padding: "8px 18px", background: "linear-gradient(135deg, #0891b2, #0e7490)", color: "#fff", border: "none", borderRadius: 7, fontFamily: "'Inter',sans-serif", fontWeight: 700, fontSize: 12, cursor: busy ? "wait" : "pointer", boxShadow: "0 4px 12px rgba(8,145,178,0.25)" }}>
          {busy ? "Sending…" : "Send →"}
        </button>
      </div>

      {err && <div style={{ marginTop: 10, padding: "8px 12px", background: "rgba(220,38,38,0.07)", border: "1px solid rgba(220,38,38,0.25)", borderRadius: 8, fontFamily: "'Inter',sans-serif", fontSize: 12, color: "#dc2626" }}>{err}</div>}

      {preview && (
        <div style={{ marginTop: 14, padding: 14, background: "#f0f6fa", border: "1px solid #dce8f0", borderRadius: 10 }}>
          <div style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 9, color: "#64748b", letterSpacing: 1, textTransform: "uppercase", marginBottom: 6 }}>Preview</div>
          <div style={{ fontFamily: "'Inter',sans-serif", fontWeight: 700, fontSize: 13, color: "#0c1220", marginBottom: 6 }}>{preview.subject}</div>
          <div style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 10, color: "#0891b2", marginBottom: 8 }}>{preview.form_count} forms · packet: {preview.packet_name}</div>
          <div style={{ fontFamily: "'Inter',sans-serif", fontSize: 12.5, color: "#3b475c", whiteSpace: "pre-wrap", lineHeight: 1.6, maxHeight: 220, overflowY: "auto" }}>{preview.body_text}</div>
        </div>
      )}
    </div>
  );
}

// ════════════════════════════════════════════════════════════════
//  INTERVIEW TAB
// ════════════════════════════════════════════════════════════════
function InterviewTab({ candidate, position, interviews, activeInterview, setActiveInterview, onReload }: any) {
  const [busy, setBusy] = useState(false);

  if (!position) {
    return <div style={{ padding: 20, fontFamily: C.sans, fontSize: 13, color: C.textF }}>No position selected. Set a position on the Profile tab.</div>;
  }

  if (activeInterview) {
    return <InterviewForm candidate={candidate} position={position} interview={activeInterview} onSaved={async () => { setActiveInterview(null); await onReload(); }} onCancel={() => setActiveInterview(null)} />;
  }

  const startNew = () => {
    setActiveInterview({
      id: "",
      candidate_id: candidate.id,
      scheduled_at: null,
      scheduled_location: null,
      scheduled_duration_minutes: 45,
      conducted_by_name: null,
      conducted_at: null,
      confirmation_sent_at: null,
      answers: position.interview_questions.map((q: any) => ({ questionId: q.id, rating: 0, notes: "" })),
      wrapup: WRAPUP_DEFAULT.map(w => ({ ...w })),
      final_notes: null,
      score_total: null, score_max: null, score_pct: null, tier: null,
      status: "draft",
    });
  };

  return (
    <>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
        <span style={{ fontFamily: C.mono, fontSize: 9, color: C.textE, letterSpacing: 1.5, textTransform: "uppercase" }}>Interviews · {interviews.length}</span>
        <button onClick={startNew} style={{ padding: "8px 14px", background: `linear-gradient(135deg, ${C.cyan}, ${C.cyanD})`, color: "#fff", border: "none", borderRadius: 8, fontFamily: C.sans, fontWeight: 700, fontSize: 12, cursor: "pointer", boxShadow: "0 4px 12px rgba(8,145,178,0.25)" }}>
          + New Interview
        </button>
      </div>

      {interviews.length === 0 ? (
        <div style={{ padding: "40px 20px", textAlign: "center", border: `1px dashed ${C.border}`, borderRadius: 12, background: C.bg2 }}>
          <div style={{ fontFamily: C.display, fontSize: 18, fontWeight: 700, color: C.text, marginBottom: 6 }}>No interviews yet.</div>
          <div style={{ fontFamily: C.sans, fontSize: 13, color: C.textF, marginBottom: 16 }}>Click "New Interview" to schedule and run a scored interview.</div>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {interviews.map((iv: Interview) => <InterviewCard key={iv.id} interview={iv} onOpen={() => setActiveInterview(iv)} candidate={candidate} onConfirmed={onReload} />)}
        </div>
      )}
    </>
  );
}

function InterviewCard({ interview, onOpen, candidate, onConfirmed }: any) {
  const [sending, setSending] = useState(false);

  const dt = interview.scheduled_at ? new Date(interview.scheduled_at) : null;
  const tier = interview.score_pct !== null ? scoreTier(interview.score_pct) : null;

  const sendConfirm = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!candidate.email) { alert("Candidate has no email. Add one first."); return; }
    if (!interview.scheduled_at || !interview.scheduled_location) { alert("Set a date/time and location before sending the confirmation."); return; }
    if (!confirm(`Send interview confirmation to ${candidate.email}?`)) return;
    setSending(true);
    try {
      const r = await fetch("/api/mdt/hiring/send-confirmation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ interview_id: interview.id, candidate_id: candidate.id }),
      });
      const data = await r.json();
      if (data.queue_reason) {
        alert("Confirmation generated. " + data.queue_reason);
      } else if (r.ok) {
        alert("✅ Confirmation sent.");
        if (onConfirmed) onConfirmed();
      } else {
        alert("Failed: " + (data.error || r.status));
      }
    } finally { setSending(false); }
  };

  return (
    <div onClick={onOpen} style={{ background: C.bg2, border: `1px solid ${C.border}`, borderRadius: 12, padding: 14, cursor: "pointer", transition: "all .15s" }}
      onMouseEnter={e => { e.currentTarget.style.borderColor = C.cyan; }}
      onMouseLeave={e => { e.currentTarget.style.borderColor = C.border; }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 10, marginBottom: 6 }}>
        <div>
          <div style={{ fontFamily: C.sans, fontWeight: 700, fontSize: 14, color: C.text, marginBottom: 3 }}>
            {dt ? dt.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" }) : "Unscheduled"}
            {dt && <span style={{ fontFamily: C.mono, fontWeight: 500, fontSize: 12, color: C.textF, marginLeft: 6 }}>· {dt.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })}</span>}
          </div>
          <div style={{ fontFamily: C.mono, fontSize: 10.5, color: C.textF }}>
            {interview.scheduled_location || "—"}
            {interview.conducted_by_name && ` · with ${interview.conducted_by_name}`}
          </div>
        </div>
        {tier && (
          <span style={{ fontFamily: C.mono, fontSize: 10, fontWeight: 700, padding: "3px 10px", borderRadius: 12, color: tier.color, background: tier.color + "15", letterSpacing: 0.5, whiteSpace: "nowrap" }}>
            {tier.label} · {interview.score_pct}%
          </span>
        )}
      </div>
      <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap", marginTop: 8 }}>
        <span style={{ fontFamily: C.mono, fontSize: 9, padding: "2px 8px", background: interview.status === "completed" ? C.green + "15" : C.amberY + "15", color: interview.status === "completed" ? C.green : C.amberY, borderRadius: 12, fontWeight: 700, letterSpacing: 0.5, textTransform: "uppercase" }}>
          {interview.status === "completed" ? "✓ Completed" : "○ Draft"}
        </span>
        {interview.confirmation_sent_at ? (
          <span style={{ fontFamily: C.mono, fontSize: 9, color: C.green, letterSpacing: 0.5 }}>✓ Confirmation sent</span>
        ) : (
          interview.scheduled_at && interview.scheduled_location && (
            <button onClick={sendConfirm} disabled={sending} style={{ padding: "4px 10px", background: "transparent", border: `1px solid ${C.cyan}`, borderRadius: 12, fontFamily: C.mono, fontSize: 9, color: C.cyan, cursor: sending ? "wait" : "pointer", letterSpacing: 0.5, textTransform: "uppercase", fontWeight: 700 }}>
              {sending ? "Sending…" : "Send confirmation"}
            </button>
          )
        )}
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════
//  INTERVIEW FORM (scored)
// ════════════════════════════════════════════════════════════════
function InterviewForm({ candidate, position, interview, onSaved, onCancel }: any) {
  const [scheduledAt, setScheduledAt] = useState(interview.scheduled_at ? interview.scheduled_at.slice(0, 16) : "");
  const [scheduledLocation, setScheduledLocation] = useState(interview.scheduled_location || "Phone");
  const [duration, setDuration] = useState(interview.scheduled_duration_minutes || 45);
  const [conductedBy, setConductedBy] = useState(interview.conducted_by_name || "");
  const [answers, setAnswers] = useState(interview.answers || []);
  const [wrapup, setWrapup] = useState(interview.wrapup && interview.wrapup.length > 0 ? interview.wrapup : WRAPUP_DEFAULT);
  const [finalNotes, setFinalNotes] = useState(interview.final_notes || "");
  const [busy, setBusy] = useState(false);

  // Score preview (live)
  const livePreview = useMemo(() => {
    let total = 0, max = 0;
    for (const q of position.interview_questions) {
      const a = answers.find((x: any) => x.questionId === q.id);
      const rating = a?.rating || 0;
      if (rating > 0) total += rating * (q.weight || 1);
      max += 3 * (q.weight || 1);
    }
    return { total, max, pct: max > 0 ? Math.round((total / max) * 100) : 0 };
  }, [answers, position]);

  const setRating = (qid: string, rating: number) => {
    setAnswers((prev: any[]) => prev.map(a => a.questionId === qid ? { ...a, rating } : a));
  };
  const setNotes = (qid: string, notes: string) => {
    setAnswers((prev: any[]) => prev.map(a => a.questionId === qid ? { ...a, notes } : a));
  };

  const save = async (status: "draft" | "completed") => {
    setBusy(true);
    try {
      const r = await fetch("/api/mdt/hiring/interview", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: interview.id || undefined,
          candidate_id: candidate.id,
          scheduled_at: scheduledAt ? new Date(scheduledAt).toISOString() : null,
          scheduled_location: scheduledLocation,
          scheduled_duration_minutes: duration,
          conducted_by_name: conductedBy.trim() || null,
          answers,
          wrapup,
          final_notes: finalNotes.trim() || null,
          status,
        }),
      });
      const data = await r.json();
      if (!r.ok) { alert("Save failed: " + (data.error || r.status)); return; }
      onSaved();
    } finally { setBusy(false); }
  };

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
        <button onClick={onCancel} style={{ background: "transparent", border: "none", fontFamily: C.sans, fontSize: 13, color: C.textF, cursor: "pointer", fontWeight: 600, padding: 0 }}>← Back</button>
        <div style={{ display: "flex", gap: 8 }}>
          <button onClick={() => save("draft")} disabled={busy} style={{ padding: "8px 14px", background: "transparent", border: `1px solid ${C.border}`, borderRadius: 7, fontFamily: C.sans, fontWeight: 600, fontSize: 12, color: C.textD, cursor: busy ? "wait" : "pointer" }}>Save draft</button>
          <button onClick={() => save("completed")} disabled={busy} style={{ padding: "8px 16px", background: `linear-gradient(135deg, ${C.green}, #059669)`, color: "#fff", border: "none", borderRadius: 7, fontFamily: C.sans, fontWeight: 700, fontSize: 12, cursor: busy ? "wait" : "pointer", boxShadow: "0 4px 12px rgba(16,185,129,0.25)" }}>
            {busy ? "Saving…" : "Mark complete"}
          </button>
        </div>
      </div>

      {/* Schedule */}
      <div style={{ background: C.bg2, border: `1px solid ${C.border}`, borderRadius: 12, padding: 14, marginBottom: 14 }}>
        <div style={{ fontFamily: C.mono, fontSize: 9, color: C.textE, letterSpacing: 1.5, textTransform: "uppercase", marginBottom: 10 }}>Schedule</div>
        <Row>
          <Field label="Date & time"><Input type="datetime-local" value={scheduledAt} onChange={setScheduledAt} /></Field>
          <Field label="Duration (min)"><Input type="number" value={duration.toString()} onChange={(v) => setDuration(parseInt(v, 10) || 45)} /></Field>
        </Row>
        <Row>
          <Field label="Location" hint="Phone / Zoom / 345 SW Bay Blvd"><Input value={scheduledLocation} onChange={setScheduledLocation} /></Field>
          <Field label="Conducted by"><Input value={conductedBy} onChange={setConductedBy} placeholder="Brendan" /></Field>
        </Row>
      </div>

      {/* Live score preview */}
      <div style={{ background: `linear-gradient(135deg, ${C.cyan}10, ${C.cyan}05)`, border: `1px solid ${C.cyanL}`, borderRadius: 12, padding: 14, marginBottom: 14 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
          <span style={{ fontFamily: C.mono, fontSize: 9, color: C.cyan, letterSpacing: 1.5, textTransform: "uppercase", fontWeight: 700 }}>Live score</span>
          <span style={{ fontFamily: C.display, fontSize: 28, fontWeight: 800, color: scoreTier(livePreview.pct).color, fontVariantNumeric: "tabular-nums", lineHeight: 1 }}>{livePreview.pct}%</span>
        </div>
        <div style={{ height: 6, background: C.bg3, borderRadius: 3, overflow: "hidden", marginTop: 8 }}>
          <div style={{ width: `${livePreview.pct}%`, height: "100%", background: scoreTier(livePreview.pct).color, transition: "width .3s" }} />
        </div>
        <div style={{ fontFamily: C.mono, fontSize: 10, color: C.textF, marginTop: 6 }}>{livePreview.total} / {livePreview.max} weighted</div>
      </div>

      {/* Questions */}
      <div style={{ marginBottom: 14 }}>
        <div style={{ fontFamily: C.mono, fontSize: 9, color: C.textE, letterSpacing: 1.5, textTransform: "uppercase", marginBottom: 10, paddingLeft: 4, fontWeight: 600 }}>
          Scored Questions · {position.interview_questions.length}
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {position.interview_questions.map((q: any, idx: number) => {
            const a = answers.find((x: any) => x.questionId === q.id) || { rating: 0, notes: "" };
            return (
              <div key={q.id} style={{ background: C.bg2, border: `1px solid ${C.border}`, borderRadius: 10, padding: 14 }}>
                <div style={{ display: "flex", gap: 10, marginBottom: 8 }}>
                  <span style={{ fontFamily: C.mono, fontSize: 10, color: C.textF, fontWeight: 600, letterSpacing: 0.5, flexShrink: 0 }}>Q{idx + 1}</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontFamily: C.sans, fontWeight: 600, fontSize: 13.5, color: C.text, lineHeight: 1.5, marginBottom: 4 }}>{q.text}</div>
                    {q.hint && <div style={{ fontFamily: C.sans, fontSize: 11, color: C.textF, lineHeight: 1.5, fontStyle: "italic" }}>💡 {q.hint}</div>}
                  </div>
                  <span style={{ fontFamily: C.mono, fontSize: 9, color: C.textE, padding: "2px 7px", background: C.bg3, borderRadius: 10, letterSpacing: 0.5, height: "fit-content", whiteSpace: "nowrap" }}>×{q.weight}</span>
                </div>
                <div style={{ display: "flex", gap: 6, marginTop: 10 }}>
                  {[
                    { v: 1, label: "Weak",   color: C.red },
                    { v: 2, label: "Good",   color: C.amberY },
                    { v: 3, label: "Strong", color: C.green },
                  ].map(opt => (
                    <button key={opt.v} onClick={() => setRating(q.id, a.rating === opt.v ? 0 : opt.v)} style={{
                      flex: 1, padding: "8px 12px",
                      background: a.rating === opt.v ? opt.color : "transparent",
                      border: `1.5px solid ${a.rating === opt.v ? opt.color : C.border}`,
                      borderRadius: 7,
                      fontFamily: C.sans, fontWeight: 700, fontSize: 12.5,
                      color: a.rating === opt.v ? "#fff" : C.textD,
                      cursor: "pointer", transition: "all .12s",
                    }}>
                      {opt.label}
                    </button>
                  ))}
                </div>
                <textarea
                  value={a.notes}
                  onChange={e => setNotes(q.id, e.target.value)}
                  rows={2}
                  placeholder="Notes (optional)"
                  style={{ width: "100%", marginTop: 8, padding: "8px 10px", border: `1px solid ${C.border}`, borderRadius: 7, fontFamily: C.sans, fontSize: 12, lineHeight: 1.5, color: C.text, background: C.bg, outline: "none", resize: "vertical" }}
                  onFocus={e => (e.target.style.borderColor = C.cyan)}
                  onBlur={e => (e.target.style.borderColor = C.border)}
                />
              </div>
            );
          })}
        </div>
      </div>

      {/* Wrap-up checklist */}
      <div style={{ background: C.bg2, border: `1px solid ${C.border}`, borderRadius: 12, padding: 14, marginBottom: 14 }}>
        <div style={{ fontFamily: C.mono, fontSize: 9, color: C.textE, letterSpacing: 1.5, textTransform: "uppercase", marginBottom: 10, fontWeight: 600 }}>Wrap-up Checklist</div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
          {wrapup.map((w: any, i: number) => (
            <label key={w.id} style={{ display: "flex", gap: 8, alignItems: "flex-start", cursor: "pointer", padding: "6px 8px", borderRadius: 6, background: w.checked ? C.cyanL : "transparent", transition: "background .15s" }}>
              <input type="checkbox" checked={w.checked} onChange={() => setWrapup((prev: any[]) => prev.map((x, j) => j === i ? { ...x, checked: !x.checked } : x))} style={{ marginTop: 3, accentColor: C.cyan, flexShrink: 0 }} />
              <span style={{ fontFamily: C.sans, fontSize: 12.5, color: C.textD, lineHeight: 1.4 }}>{w.label}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Final notes */}
      <div style={{ background: C.bg2, border: `1px solid ${C.border}`, borderRadius: 12, padding: 14, marginBottom: 14 }}>
        <div style={{ fontFamily: C.mono, fontSize: 9, color: C.textE, letterSpacing: 1.5, textTransform: "uppercase", marginBottom: 10, fontWeight: 600 }}>Final Notes</div>
        <Textarea rows={4} value={finalNotes} onChange={setFinalNotes} placeholder="Overall impression, gut check, hire/hold/pass thoughts..." />
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════
//  DOCUMENTS TAB
// ════════════════════════════════════════════════════════════════
function DocumentsTab({ candidate, documents, onReload }: any) {
  const [uploading, setUploading] = useState(false);
  const [err, setErr] = useState("");
  const [category, setCategory] = useState<string>("resume");
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFile = async (file: File) => {
    setErr("");
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      fd.append("candidate_id", candidate.id);
      fd.append("name", file.name);
      fd.append("category", category);
      const r = await fetch("/api/mdt/hiring/documents", { method: "POST", body: fd });
      const data = await r.json();
      if (!r.ok) {
        setErr((data.error || "Upload failed") + (data.hint ? "\n" + data.hint : ""));
      } else {
        await onReload();
      }
    } catch (e: any) { setErr(e?.message || "Upload failed"); }
    finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  const deleteDoc = async (id: string, name: string) => {
    if (!confirm(`Delete ${name}?`)) return;
    const r = await fetch(`/api/mdt/hiring/documents?id=${id}`, { method: "DELETE" });
    if (r.ok) await onReload();
    else alert("Delete failed");
  };

  const grouped = useMemo(() => {
    const g: Record<string, CandidateDoc[]> = {};
    documents.forEach((d: CandidateDoc) => {
      const cat = d.category || "other";
      g[cat] = g[cat] || [];
      g[cat].push(d);
    });
    return g;
  }, [documents]);

  const CATEGORY_ORDER = ["resume", "cover_letter", "license", "certification", "id", "reference", "offer_letter", "other"];
  const CATEGORY_LABELS: Record<string, string> = {
    resume: "Resume", cover_letter: "Cover letter", license: "License", certification: "Certification",
    id: "ID / Documentation", reference: "References", offer_letter: "Offer letter", other: "Other",
  };

  return (
    <>
      <div style={{ background: C.bg2, border: `1.5px dashed ${C.cyan}`, borderRadius: 12, padding: 18, marginBottom: 16, textAlign: "center" }}>
        <div style={{ fontFamily: C.sans, fontWeight: 700, fontSize: 14, color: C.text, marginBottom: 4 }}>Upload a document</div>
        <div style={{ fontFamily: C.sans, fontSize: 12, color: C.textF, marginBottom: 12 }}>PDF, JPG, PNG, DOCX up to 25 MB</div>
        <div style={{ display: "flex", gap: 10, justifyContent: "center", alignItems: "center", flexWrap: "wrap" }}>
          <select value={category} onChange={e => setCategory(e.target.value)} style={{ padding: "8px 12px", border: `1px solid ${C.border}`, borderRadius: 8, fontFamily: C.sans, fontSize: 13, color: C.textD, background: C.bg2, cursor: "pointer" }}>
            {CATEGORY_ORDER.map(c => <option key={c} value={c}>{CATEGORY_LABELS[c]}</option>)}
          </select>
          <input
            ref={fileRef} type="file" disabled={uploading}
            accept=".pdf,.jpg,.jpeg,.png,.webp,.heic,.doc,.docx,.txt,.csv"
            onChange={e => { if (e.target.files && e.target.files[0]) handleFile(e.target.files[0]); }}
            style={{ display: "none" }}
          />
          <button onClick={() => fileRef.current?.click()} disabled={uploading} style={{ padding: "8px 18px", background: `linear-gradient(135deg, ${C.cyan}, ${C.cyanD})`, color: "#fff", border: "none", borderRadius: 8, fontFamily: C.sans, fontWeight: 700, fontSize: 13, cursor: uploading ? "wait" : "pointer", boxShadow: "0 4px 14px rgba(8,145,178,0.25)" }}>
            {uploading ? "Uploading…" : "Choose file"}
          </button>
        </div>
        {err && <div style={{ marginTop: 12, padding: "8px 12px", background: C.redL, border: "1px solid rgba(220,38,38,0.25)", borderRadius: 8, fontFamily: C.sans, fontSize: 12, color: C.red, whiteSpace: "pre-wrap", textAlign: "left" }}>{err}</div>}
      </div>

      {documents.length === 0 ? (
        <div style={{ padding: "30px 20px", textAlign: "center", fontFamily: C.sans, fontSize: 13, color: C.textF }}>
          No documents yet. Upload resumes, licenses, IDs, certifications.
        </div>
      ) : (
        CATEGORY_ORDER.filter(c => grouped[c]).map(c => (
          <div key={c} style={{ marginBottom: 14 }}>
            <div style={{ fontFamily: C.mono, fontSize: 9, color: C.textE, letterSpacing: 1.5, textTransform: "uppercase", marginBottom: 8, paddingLeft: 4, fontWeight: 600 }}>
              {CATEGORY_LABELS[c]} · {grouped[c].length}
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {grouped[c].map(d => (
                <div key={d.id} style={{ background: C.bg2, border: `1px solid ${C.border}`, borderRadius: 10, padding: "10px 12px", display: "flex", alignItems: "center", gap: 12 }}>
                  <div style={{ width: 36, height: 36, borderRadius: 8, background: C.bg3, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, flexShrink: 0 }}>
                    {fileIcon(d.file_type)}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontFamily: C.sans, fontWeight: 600, fontSize: 13, color: C.text, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{d.name}</div>
                    <div style={{ fontFamily: C.mono, fontSize: 10, color: C.textF }}>
                      {(d.file_size / 1024).toFixed(0)} KB · {relativeTime(d.created_at)}
                      {d.uploaded_by_name && ` · ${d.uploaded_by_name}`}
                    </div>
                  </div>
                  {d.download_url && (
                    <a href={d.download_url} target="_blank" rel="noopener noreferrer" style={{ padding: "6px 12px", background: C.cyanL, color: C.cyan, border: `1px solid ${C.cyan}`, borderRadius: 7, fontFamily: C.sans, fontSize: 11, fontWeight: 700, textDecoration: "none", whiteSpace: "nowrap" }}>
                      View →
                    </a>
                  )}
                  <button onClick={() => deleteDoc(d.id, d.name)} style={{ background: "transparent", border: "none", color: C.textE, cursor: "pointer", fontSize: 18, padding: "4px 8px", lineHeight: 1 }}>×</button>
                </div>
              ))}
            </div>
          </div>
        ))
      )}
    </>
  );
}

function fileIcon(type: string): string {
  if (!type) return "📄";
  if (type.startsWith("image/")) return "🖼️";
  if (type.includes("pdf")) return "📕";
  if (type.includes("word") || type.includes("document")) return "📘";
  return "📄";
}

// ════════════════════════════════════════════════════════════════
//  FORM PRIMITIVES (shared)
// ════════════════════════════════════════════════════════════════
function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 20 }}>
      <div style={{ fontFamily: C.mono, fontSize: 9, color: C.textE, letterSpacing: 1.5, textTransform: "uppercase", marginBottom: 10, fontWeight: 600 }}>{title}</div>
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>{children}</div>
    </div>
  );
}
function Field({ label, hint, required, children }: { label: string; hint?: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div style={{ flex: 1, minWidth: 0 }}>
      <label style={{ fontFamily: C.sans, fontSize: 11, fontWeight: 600, color: C.textD, marginBottom: 5, display: "flex", justifyContent: "space-between", gap: 8 }}>
        <span>{label}{required && <span style={{ color: C.red, marginLeft: 3 }}>*</span>}</span>
        {hint && <span style={{ fontFamily: C.mono, fontSize: 10, color: C.textE, fontWeight: 400 }}>{hint}</span>}
      </label>
      {children}
    </div>
  );
}
function Row({ children }: { children: React.ReactNode }) {
  return <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>{children}</div>;
}
function Input({ value, onChange, type = "text", placeholder, autoFocus }: { value: string; onChange: (v: string) => void; type?: string; placeholder?: string; autoFocus?: boolean }) {
  return (
    <input
      type={type} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} autoFocus={autoFocus}
      style={{ width: "100%", padding: "9px 12px", border: `1px solid ${C.border}`, borderRadius: 8, fontFamily: C.sans, fontSize: 13, color: C.text, background: C.bg2, outline: "none" }}
      onFocus={e => (e.target.style.borderColor = C.cyan)}
      onBlur={e => (e.target.style.borderColor = C.border)}
    />
  );
}
function Textarea({ value, onChange, rows = 3, placeholder }: { value: string; onChange: (v: string) => void; rows?: number; placeholder?: string }) {
  return (
    <textarea
      value={value} onChange={e => onChange(e.target.value)} rows={rows} placeholder={placeholder}
      style={{ width: "100%", padding: "10px 12px", border: `1px solid ${C.border}`, borderRadius: 8, fontFamily: C.sans, fontSize: 13, lineHeight: 1.5, color: C.text, background: C.bg2, outline: "none", resize: "vertical" }}
      onFocus={e => (e.target.style.borderColor = C.cyan)}
      onBlur={e => (e.target.style.borderColor = C.border)}
    />
  );
}
function Select({ value, onChange, children }: { value: string; onChange: (v: string) => void; children: React.ReactNode }) {
  return (
    <select value={value} onChange={e => onChange(e.target.value)}
      style={{ width: "100%", padding: "9px 12px", border: `1px solid ${C.border}`, borderRadius: 8, fontFamily: C.sans, fontSize: 13, color: C.text, background: C.bg2, cursor: "pointer", outline: "none" }}>
      {children}
    </select>
  );
}

// ════════════════════════════════════════════════════════════════
//  EMPTY / LOADING / LOGO / HELPERS
// ════════════════════════════════════════════════════════════════
function LoadingState() {
  return <div style={{ padding: "80px 20px", textAlign: "center", fontFamily: C.mono, fontSize: 11, color: C.textE, letterSpacing: 1.5 }}>LOADING CANDIDATES…</div>;
}

function EmptyState({ onAdd }: { onAdd: () => void }) {
  return (
    <div style={{ padding: "80px 20px", textAlign: "center" }}>
      <div style={{ fontFamily: C.display, fontSize: 28, fontWeight: 700, color: C.text, marginBottom: 8, letterSpacing: "-0.02em" }}>No candidates yet.</div>
      <div style={{ fontFamily: C.sans, fontSize: 14, color: C.textF, maxWidth: 400, margin: "0 auto 20px", lineHeight: 1.55 }}>Add your first candidate to start building your hiring pipeline. Captain, naturalist guide, ticket sales — log them as you go.</div>
      <button onClick={onAdd} style={{ padding: "11px 22px", background: `linear-gradient(135deg, ${C.cyan}, ${C.cyanD})`, color: "#fff", border: "none", borderRadius: 9, fontFamily: C.sans, fontWeight: 700, fontSize: 13.5, cursor: "pointer", boxShadow: "0 4px 14px rgba(8,145,178,0.25)" }}>
        + Add a candidate
      </button>
    </div>
  );
}

function Logo({ size = 32 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" style={{ flexShrink: 0 }}>
      <defs>
        <linearGradient id="hiringL" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor={C.cyan} />
          <stop offset="100%" stopColor={C.cyanD} />
        </linearGradient>
      </defs>
      <circle cx="20" cy="20" r="18" fill="url(#hiringL)" />
      <path d="M 8 22 Q 14 17 20 22 T 32 22" stroke="#fff" strokeWidth="2.2" fill="none" strokeLinecap="round" />
      <path d="M 8 27 Q 14 22 20 27 T 32 27" stroke="#fff" strokeWidth="1.6" fill="none" strokeLinecap="round" opacity="0.6" />
    </svg>
  );
}

function scoreTier(pct: number | null | undefined): { label: string; color: string } {
  if (pct === null || pct === undefined) return { label: "—", color: C.textE };
  if (pct >= 80) return { label: "🟢 Top",      color: C.green };
  if (pct >= 55) return { label: "🟡 Consider", color: C.amberY };
  return            { label: "🔴 Pass",          color: C.red };
}

function relativeTime(iso: string): string {
  const d = new Date(iso);
  const diff = Date.now() - d.getTime();
  const mins = Math.round(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m`;
  const hrs = Math.round(mins / 60);
  if (hrs < 24) return `${hrs}h`;
  const days = Math.round(hrs / 24);
  if (days < 7) return `${days}d`;
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}
