// src/app/mdt/page.tsx
"use client";

// ════════════════════════════════════════════════════════════════
//  MDT OPERATIONS CONSOLE
//  shiftpro.ai/mdt — AI-powered booking inquiry CRM for
//  Marine Discovery Tours. Reusable engine for LaserDesk later.
// ════════════════════════════════════════════════════════════════

import React, { useEffect, useMemo, useRef, useState } from "react";

// ════════════════════════════════════════════════════════════════
//  DESIGN TOKENS — borrowed from ShiftPro language for cohesion
// ════════════════════════════════════════════════════════════════
const C = {
  // Background — slightly cooler than ShiftPro's amber-warm to evoke water/marine
  bg:        "#f0f6fa",
  bg2:       "#ffffff",
  bg3:       "#e8f1f7",
  surface:   "#ffffff",
  border:    "#dce8f0",
  borderL:   "#eef4f8",
  // Text
  text:      "#0c1220",
  textD:     "#3b475c",
  textF:     "#64748b",
  textE:     "#94a3b8",
  // Accent — Pacific blue + sea-foam teal + amber for Captain
  cyan:      "#0891b2",
  cyanD:     "#0e7490",
  cyanL:     "rgba(8,145,178,0.08)",
  teal:      "#14b8a6",
  amber:     "#e07b00",
  amberD:    "rgba(224,123,0,0.08)",
  // Status
  green:     "#10b981",
  red:       "#dc2626",
  redL:      "rgba(220,38,38,0.07)",
  amberY:    "#f59e0b",
  violet:    "#7c3aed",
  pink:      "#be185d",
  // Shadows
  shadow:    "0 1px 3px rgba(8,18,32,0.04), 0 1px 2px rgba(8,18,32,0.06)",
  shadowL:   "0 12px 30px rgba(8,18,32,0.08)",
  // Type
  display:   "'Fraunces',Georgia,serif",
  sans:      "'Inter',system-ui,-apple-system,sans-serif",
  mono:      "'JetBrains Mono','Menlo',monospace",
};

// ════════════════════════════════════════════════════════════════
//  TYPES
// ════════════════════════════════════════════════════════════════
type Ticket = {
  id: string;
  ticket_number: string;
  subject: string;
  category: string;
  intent: string;
  urgency: string;
  status: string;
  tide_score: number;
  tide_heat: number;
  tide_value: number;
  tide_risk: number;
  extracted: any;
  created_at: string;
  updated_at: string;
  ld_contacts?: { id: string; full_name: string; email: string; phone: string; booking_count: number };
  source: string;
};

type Message = {
  id: string;
  direction: "inbound" | "outbound";
  from_name: string;
  from_email: string;
  subject: string;
  body_text: string;
  channel: string;
  voicemail_url?: string;
  voicemail_transcript?: string;
  delivery_status?: string;
  created_at: string;
};

type Category = { slug: string; display_name: string; emoji: string; color: string };

const COLUMNS = [
  { status: "new",            label: "New",            tagline: "Untriaged"           },
  { status: "awaiting_reply", label: "Awaiting Reply", tagline: "Customer's turn"     },
  { status: "quoted",         label: "Quoted",         tagline: "Quote out"           },
  { status: "booked",         label: "Booked",         tagline: "Confirmed"           },
];

// ════════════════════════════════════════════════════════════════
//  FONT INJECTION (in case the host page hasn't loaded them)
// ════════════════════════════════════════════════════════════════
const FONTS = `
@import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,300;0,9..144,400;0,9..144,600;0,9..144,700;0,9..144,800;1,9..144,300;1,9..144,400;1,9..144,600;1,9..144,700&family=Inter:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600;700&display=swap');

* { box-sizing: border-box }
body { background: ${C.bg}; color: ${C.text}; font-family: ${C.sans}; margin: 0 }

@keyframes mdtFadeIn { from { opacity: 0; transform: translateY(6px) } to { opacity: 1; transform: none } }
@keyframes mdtPulse  { 0%,100% { opacity: 1 } 50% { opacity: .55 } }
@keyframes mdtSlide  { from { transform: translateX(100%) } to { transform: none } }
.mdt-fade { animation: mdtFadeIn .25s cubic-bezier(.22,1,.36,1) }

.mdt-scroll::-webkit-scrollbar { width: 8px; height: 8px }
.mdt-scroll::-webkit-scrollbar-thumb { background: rgba(8,18,32,0.12); border-radius: 4px }
.mdt-scroll::-webkit-scrollbar-track { background: transparent }
`;

// ════════════════════════════════════════════════════════════════
//  PAGE
// ════════════════════════════════════════════════════════════════
export default function MdtPage() {
  const [tickets, setTickets] = useState<Ticket[] | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [filter, setFilter] = useState<{ category?: string; search?: string }>({});
  const [loading, setLoading] = useState(true);

  // Initial load
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [t, c] = await Promise.all([
          fetch("/api/mdt/tickets").then(r => r.ok ? r.json() : { tickets: [] }),
          fetch("/api/mdt/categories").then(r => r.ok ? r.json() : { categories: [] }),
        ]);
        if (!cancelled) {
          setTickets(t.tickets || []);
          setCategories(c.categories || []);
        }
      } catch (e: any) {
        console.warn("[mdt load]", e?.message);
        if (!cancelled) setTickets([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  // Auto-refresh every 30s when no ticket is open
  useEffect(() => {
    if (activeId) return;
    const t = setInterval(async () => {
      try {
        const r = await fetch("/api/mdt/tickets");
        if (r.ok) {
          const data = await r.json();
          setTickets(data.tickets || []);
        }
      } catch (e) {}
    }, 30000);
    return () => clearInterval(t);
  }, [activeId]);

  const filtered = useMemo(() => {
    if (!tickets) return [];
    return tickets.filter(t => {
      if (filter.category && t.category !== filter.category) return false;
      if (filter.search) {
        const q = filter.search.toLowerCase();
        const hay = `${t.ticket_number} ${t.subject} ${t.ld_contacts?.full_name || ""} ${t.ld_contacts?.email || ""}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [tickets, filter]);

  const stats = useMemo(() => {
    const t = tickets || [];
    const open = t.filter(x => !["closed","completed","spam"].includes(x.status));
    const urgent = open.filter(x => x.tide_score >= 70).length;
    const hot = open.filter(x => x.tide_score >= 80).length;
    return { total: open.length, urgent, hot };
  }, [tickets]);

  const onTicketUpdated = (updated: Ticket) => {
    setTickets(prev => (prev || []).map(t => t.id === updated.id ? { ...t, ...updated } : t));
  };

  return (
    <>
      <style>{FONTS}</style>

      <div style={{ minHeight: "100vh", background: C.bg }}>
        <Topbar stats={stats} filter={filter} setFilter={setFilter} categories={categories} />

        <main style={{ padding: "0 24px 40px", maxWidth: 1600, margin: "0 auto" }}>
          {loading ? (
            <LoadingState />
          ) : filtered.length === 0 ? (
            <EmptyState hasTickets={(tickets || []).length > 0} hasFilter={!!(filter.category || filter.search)} />
          ) : (
            <Kanban
              tickets={filtered}
              categories={categories}
              onOpen={setActiveId}
            />
          )}
        </main>

        {activeId && (
          <TicketDrawer
            ticketId={activeId}
            categories={categories}
            onClose={() => setActiveId(null)}
            onUpdated={onTicketUpdated}
          />
        )}
      </div>
    </>
  );
}

// ════════════════════════════════════════════════════════════════
//  TOPBAR
// ════════════════════════════════════════════════════════════════
function Topbar({ stats, filter, setFilter, categories }: any) {
  return (
    <div style={{ background: C.bg2, borderBottom: `1px solid ${C.border}`, position: "sticky", top: 0, zIndex: 50, boxShadow: C.shadow }}>
      <div style={{ maxWidth: 1600, margin: "0 auto", padding: "14px 24px", display: "flex", alignItems: "center", gap: 24, flexWrap: "wrap" }}>
        {/* Brand */}
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <Logo size={32} />
          <div>
            <div style={{ fontFamily: C.display, fontWeight: 700, fontSize: 17, letterSpacing: "-0.01em", color: C.text }}>
              Marine Discovery <span style={{ fontStyle: "italic", color: C.cyan }}>Console</span>
            </div>
            <div style={{ fontFamily: C.mono, fontSize: 9, color: C.textF, letterSpacing: 1.5, textTransform: "uppercase", marginTop: 1 }}>
              Booking Service Agent · Powered by ShiftPro
            </div>
          </div>
        </div>

        {/* Stats pills */}
        <div style={{ display: "flex", gap: 8, marginLeft: 20 }}>
          <StatPill label="Open" value={stats.total} color={C.cyan} />
          <StatPill label="Strong" value={stats.urgent} color={C.amberY} />
          <StatPill label="Hot" value={stats.hot} color={C.red} />
        </div>

        {/* Filter + search */}
        <div style={{ flex: 1, display: "flex", gap: 10, justifyContent: "flex-end", alignItems: "center", minWidth: 200 }}>
          <select
            value={filter.category || ""}
            onChange={e => setFilter((p: any) => ({ ...p, category: e.target.value || undefined }))}
            style={{
              padding: "8px 12px", border: `1px solid ${C.border}`, borderRadius: 8,
              fontFamily: C.sans, fontSize: 13, color: C.textD, background: C.bg2, cursor: "pointer",
            }}>
            <option value="">All categories</option>
            {categories.map((c: Category) => (
              <option key={c.slug} value={c.slug}>{c.emoji} {c.display_name}</option>
            ))}
          </select>
          <input
            placeholder="Search name, email, ticket..."
            value={filter.search || ""}
            onChange={e => setFilter((p: any) => ({ ...p, search: e.target.value || undefined }))}
            style={{
              padding: "8px 14px", border: `1px solid ${C.border}`, borderRadius: 8,
              fontFamily: C.sans, fontSize: 13, color: C.text, background: C.bg2, width: 240, outline: "none",
            }}
            onFocus={e => (e.target.style.borderColor = C.cyan)}
            onBlur={e => (e.target.style.borderColor = C.border)}
          />
        </div>
      </div>
    </div>
  );
}

function StatPill({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div style={{
      display: "inline-flex", alignItems: "center", gap: 6,
      padding: "5px 11px", background: C.bg3, border: `1px solid ${C.border}`, borderRadius: 20,
    }}>
      <span style={{ width: 7, height: 7, borderRadius: "50%", background: color, flexShrink: 0 }} />
      <span style={{ fontFamily: C.mono, fontSize: 10, color: C.textF, letterSpacing: 1, textTransform: "uppercase" }}>{label}</span>
      <span style={{ fontFamily: C.sans, fontWeight: 700, fontSize: 12, color: C.text, fontVariantNumeric: "tabular-nums" }}>{value}</span>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════
//  KANBAN
// ════════════════════════════════════════════════════════════════
function Kanban({ tickets, categories, onOpen }: { tickets: Ticket[]; categories: Category[]; onOpen: (id: string) => void }) {
  const grouped = useMemo(() => {
    const g: Record<string, Ticket[]> = {};
    COLUMNS.forEach(c => { g[c.status] = []; });
    tickets.forEach(t => { (g[t.status] = g[t.status] || []).push(t); });
    // Sort by tide_score within each column, descending
    Object.keys(g).forEach(k => g[k].sort((a, b) => b.tide_score - a.tide_score));
    return g;
  }, [tickets]);

  const catMap = useMemo(() => {
    const m: Record<string, Category> = {};
    categories.forEach(c => { m[c.slug] = c; });
    return m;
  }, [categories]);

  return (
    <div style={{ marginTop: 20, display: "grid", gridTemplateColumns: `repeat(${COLUMNS.length}, 1fr)`, gap: 14 }}>
      {COLUMNS.map(col => (
        <div key={col.status} style={{ minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "baseline", gap: 8, marginBottom: 10, padding: "0 4px" }}>
            <span style={{ fontFamily: C.sans, fontWeight: 700, fontSize: 14, color: C.text }}>{col.label}</span>
            <span style={{ fontFamily: C.mono, fontSize: 11, color: C.textE, fontVariantNumeric: "tabular-nums" }}>{(grouped[col.status] || []).length}</span>
            <span style={{ fontFamily: C.mono, fontSize: 9, color: C.textE, letterSpacing: 1, textTransform: "uppercase", marginLeft: "auto" }}>{col.tagline}</span>
          </div>
          <div className="mdt-scroll" style={{ display: "flex", flexDirection: "column", gap: 8, maxHeight: "calc(100vh - 200px)", overflowY: "auto", paddingRight: 4 }}>
            {(grouped[col.status] || []).map(t => (
              <TicketCard key={t.id} ticket={t} category={catMap[t.category]} onOpen={() => onOpen(t.id)} />
            ))}
            {(grouped[col.status] || []).length === 0 && (
              <div style={{
                fontFamily: C.mono, fontSize: 10, color: C.textE, padding: "20px 12px",
                textAlign: "center", border: `1px dashed ${C.border}`, borderRadius: 10, letterSpacing: 1,
              }}>
                — empty —
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

// ════════════════════════════════════════════════════════════════
//  TICKET CARD
// ════════════════════════════════════════════════════════════════
function TicketCard({ ticket, category, onOpen }: { ticket: Ticket; category?: Category; onOpen: () => void }) {
  const tide = tideLabel(ticket.tide_score);
  const ageLabel = relativeTime(ticket.created_at);
  const partySize = ticket.extracted?.party_size;
  const reqDate = ticket.extracted?.requested_date;

  return (
    <div
      onClick={onOpen}
      className="mdt-fade"
      style={{
        background: C.bg2, border: `1px solid ${C.border}`, borderRadius: 12,
        padding: 14, cursor: "pointer", transition: "all .18s",
        boxShadow: ticket.tide_score >= 80 ? "0 0 0 1px rgba(220,38,38,0.18), 0 4px 12px rgba(220,38,38,0.05)" : C.shadow,
      }}
      onMouseEnter={e => { e.currentTarget.style.borderColor = C.cyan; e.currentTarget.style.transform = "translateY(-1px)"; e.currentTarget.style.boxShadow = C.shadowL; }}
      onMouseLeave={e => { e.currentTarget.style.borderColor = C.border; e.currentTarget.style.transform = "none"; e.currentTarget.style.boxShadow = ticket.tide_score >= 80 ? "0 0 0 1px rgba(220,38,38,0.18), 0 4px 12px rgba(220,38,38,0.05)" : C.shadow; }}
    >
      {/* Top row: ticket number + tide score */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
        <span style={{ fontFamily: C.mono, fontSize: 9, color: C.textE, letterSpacing: 1 }}>{ticket.ticket_number}</span>
        <span style={{
          fontFamily: C.mono, fontSize: 9, fontWeight: 700, padding: "2px 8px",
          borderRadius: 12, color: tide.color, background: tide.color + "15",
          letterSpacing: 0.5,
        }}>
          {tide.label} · {ticket.tide_score}
        </span>
      </div>

      {/* Customer name + category */}
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 5 }}>
        {category && (
          <span style={{ fontSize: 14, lineHeight: 1 }}>{category.emoji}</span>
        )}
        <span style={{ fontFamily: C.sans, fontWeight: 700, fontSize: 13.5, color: C.text, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", flex: 1 }}>
          {ticket.ld_contacts?.full_name || "(no name)"}
        </span>
      </div>

      {/* Subject */}
      <div style={{ fontFamily: C.sans, fontSize: 12, color: C.textD, lineHeight: 1.4, marginBottom: 8, overflow: "hidden", textOverflow: "ellipsis", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" as const }}>
        {ticket.subject}
      </div>

      {/* Footer: extracted facts + age */}
      <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap", fontFamily: C.mono, fontSize: 9, color: C.textF, letterSpacing: 0.5 }}>
        {partySize && <span>👥 {partySize}</span>}
        {reqDate && <span>📅 {prettyDate(reqDate)}</span>}
        {ticket.urgency === "high" && <span style={{ color: C.red, fontWeight: 700 }}>⚡ URGENT</span>}
        {ticket.source === "voicemail" && <span style={{ color: C.violet }}>📞</span>}
        {ticket.source === "fareharbor" && <span style={{ color: C.teal }}>FH</span>}
        <span style={{ marginLeft: "auto" }}>{ageLabel}</span>
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════
//  TICKET DRAWER (right-side detail panel)
// ════════════════════════════════════════════════════════════════
function TicketDrawer({ ticketId, categories, onClose, onUpdated }: any) {
  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [drafts, setDrafts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);

  // Composer state
  const [replyText, setReplyText] = useState("");
  const [replySubject, setReplySubject] = useState("");
  const [showComposer, setShowComposer] = useState(false);

  const cat = categories.find((c: Category) => c.slug === ticket?.category);

  const load = async () => {
    setLoading(true);
    try {
      const r = await fetch(`/api/mdt/tickets/${ticketId}`);
      if (r.ok) {
        const data = await r.json();
        setTicket(data.ticket);
        setMessages(data.messages || []);
        setDrafts(data.drafts || []);
      }
    } catch (e: any) { console.warn("[drawer load]", e?.message); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, [ticketId]);

  const generateDraft = async () => {
    setBusy(true);
    try {
      const r = await fetch("/api/mdt/draft", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ticketId }),
      });
      if (!r.ok) {
        const d = await r.json().catch(() => ({}));
        alert("Draft failed: " + (d.error || r.status));
      } else {
        await load();
        const data = await r.json();
        setReplySubject(data.draft?.subject || "");
        setReplyText(data.draft?.body_text || "");
        setShowComposer(true);
      }
    } finally { setBusy(false); }
  };

  const sendReply = async (draftId?: string) => {
    if (!replySubject.trim() || !replyText.trim()) { alert("Subject and body required."); return; }
    setBusy(true);
    try {
      const r = await fetch("/api/mdt/reply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ticketId, draftId, subject: replySubject, body_text: replyText }),
      });
      if (!r.ok) {
        const d = await r.json().catch(() => ({}));
        alert("Send failed: " + (d.error || r.status));
      } else {
        setReplyText(""); setReplySubject(""); setShowComposer(false);
        await load();
      }
    } finally { setBusy(false); }
  };

  const setStatus = async (newStatus: string) => {
    if (!ticket) return;
    setBusy(true);
    try {
      const r = await fetch(`/api/mdt/tickets/${ticketId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (r.ok) {
        const data = await r.json();
        setTicket(data.ticket);
        if (onUpdated) onUpdated(data.ticket);
      }
    } finally { setBusy(false); }
  };

  return (
    <div
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
      style={{ position: "fixed", inset: 0, background: "rgba(8,18,32,0.45)", backdropFilter: "blur(6px)", zIndex: 100, display: "flex", justifyContent: "flex-end", animation: "mdtFadeIn .2s ease" }}>
      <div
        onClick={e => e.stopPropagation()}
        style={{
          background: C.bg, height: "100vh", width: "min(720px, 96vw)",
          boxShadow: "-20px 0 60px rgba(8,18,32,0.2)",
          display: "flex", flexDirection: "column",
          animation: "mdtSlide .3s cubic-bezier(.22,1,.36,1)",
        }}>
        {/* Header */}
        <div style={{ padding: "16px 20px", borderBottom: `1px solid ${C.border}`, background: C.bg2, display: "flex", alignItems: "center", gap: 12 }}>
          <button onClick={onClose} style={{ background: "transparent", border: "none", padding: "6px 10px", cursor: "pointer", fontSize: 22, color: C.textF, lineHeight: 1 }}>×</button>
          {ticket && (
            <>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 2 }}>
                  <span style={{ fontFamily: C.mono, fontSize: 10, color: C.textE, letterSpacing: 1.2 }}>{ticket.ticket_number}</span>
                  {cat && <span style={{ fontFamily: C.mono, fontSize: 9, padding: "2px 8px", background: cat.color + "15", color: cat.color, borderRadius: 12, fontWeight: 700, letterSpacing: 0.5, textTransform: "uppercase" }}>{cat.emoji} {cat.display_name}</span>}
                  {ticket.urgency === "high" && <span style={{ fontFamily: C.mono, fontSize: 9, color: C.red, fontWeight: 700, letterSpacing: 1 }}>⚡ URGENT</span>}
                </div>
                <div style={{ fontFamily: C.display, fontWeight: 700, fontSize: 18, color: C.text, letterSpacing: "-0.01em", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {ticket.subject}
                </div>
              </div>
              <StatusMenu status={ticket.status} onChange={setStatus} disabled={busy} />
            </>
          )}
        </div>

        {/* Body */}
        <div className="mdt-scroll" style={{ flex: 1, overflowY: "auto", padding: "20px" }}>
          {loading || !ticket ? (
            <div style={{ padding: 40, textAlign: "center", fontFamily: C.mono, fontSize: 11, color: C.textE, letterSpacing: 1 }}>LOADING…</div>
          ) : (
            <>
              <ContactCard ticket={ticket} />
              <ExtractedCard ticket={ticket} />
              <TideCard ticket={ticket} />
              <ThreadView messages={messages} />
              {drafts.filter(d => d.status === "pending").length > 0 && (
                <DraftsList drafts={drafts.filter(d => d.status === "pending")} onUse={(d) => { setReplySubject(d.subject); setReplyText(d.body_text); setShowComposer(true); }} />
              )}
            </>
          )}
        </div>

        {/* Footer composer */}
        {!loading && ticket && (
          <ComposerFooter
            showComposer={showComposer}
            setShowComposer={setShowComposer}
            replyText={replyText}
            setReplyText={setReplyText}
            replySubject={replySubject}
            setReplySubject={setReplySubject}
            onGenerate={generateDraft}
            onSend={() => sendReply()}
            busy={busy}
          />
        )}
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════
//  SUB-COMPONENTS for the drawer
// ════════════════════════════════════════════════════════════════
function ContactCard({ ticket }: { ticket: Ticket }) {
  const c = ticket.ld_contacts;
  if (!c) return null;
  return (
    <div style={{ background: C.bg2, border: `1px solid ${C.border}`, borderRadius: 12, padding: 14, marginBottom: 14 }}>
      <div style={{ fontFamily: C.mono, fontSize: 9, color: C.textE, letterSpacing: 1.5, textTransform: "uppercase", marginBottom: 6 }}>Contact</div>
      <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
        <div style={{ width: 40, height: 40, borderRadius: 10, background: `linear-gradient(135deg, ${C.cyan}, ${C.cyanD})`, color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: C.sans, fontWeight: 700, fontSize: 16 }}>
          {(c.full_name || c.email || "?").slice(0, 1).toUpperCase()}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontFamily: C.sans, fontWeight: 700, fontSize: 14, color: C.text }}>{c.full_name || "(no name)"}</div>
          <div style={{ fontFamily: C.mono, fontSize: 11, color: C.textF }}>{c.email || c.phone || "—"}</div>
        </div>
        {c.booking_count > 0 && (
          <div style={{ padding: "5px 10px", background: C.amberD, borderRadius: 14, fontFamily: C.mono, fontSize: 9, color: C.amber, fontWeight: 700, letterSpacing: 0.5, textTransform: "uppercase" }}>
            ⭐ {c.booking_count} prior booking{c.booking_count > 1 ? "s" : ""}
          </div>
        )}
      </div>
    </div>
  );
}

function ExtractedCard({ ticket }: { ticket: Ticket }) {
  const e = ticket.extracted || {};
  const facts: { label: string; value: string }[] = [];
  if (e.party_size) facts.push({ label: "Party size", value: String(e.party_size) });
  if (e.requested_date) facts.push({ label: "Requested date", value: prettyDate(e.requested_date) });
  if (e.requested_time) facts.push({ label: "Time", value: e.requested_time });
  if (e.budget_hint) facts.push({ label: "Budget hint", value: e.budget_hint });
  if (e.special_requests) facts.push({ label: "Special requests", value: e.special_requests });
  if (e.competitor_mentioned) facts.push({ label: "Competitors", value: "⚠️ Shopping around" });
  if (facts.length === 0) return null;
  return (
    <div style={{ background: C.bg2, border: `1px solid ${C.border}`, borderRadius: 12, padding: 14, marginBottom: 14 }}>
      <div style={{ fontFamily: C.mono, fontSize: 9, color: C.textE, letterSpacing: 1.5, textTransform: "uppercase", marginBottom: 8 }}>What we know</div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 10 }}>
        {facts.map((f, i) => (
          <div key={i}>
            <div style={{ fontFamily: C.mono, fontSize: 9, color: C.textF, letterSpacing: 1, textTransform: "uppercase", marginBottom: 2 }}>{f.label}</div>
            <div style={{ fontFamily: C.sans, fontSize: 13, color: C.text, fontWeight: 600 }}>{f.value}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function TideCard({ ticket }: { ticket: Ticket }) {
  const t = tideLabel(ticket.tide_score);
  return (
    <div style={{ background: C.bg2, border: `1px solid ${C.border}`, borderRadius: 12, padding: 14, marginBottom: 14 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 10 }}>
        <span style={{ fontFamily: C.mono, fontSize: 9, color: C.textE, letterSpacing: 1.5, textTransform: "uppercase" }}>Tide Score™</span>
        <span style={{ fontFamily: C.display, fontSize: 28, fontWeight: 800, color: t.color, lineHeight: 1, fontVariantNumeric: "tabular-nums" }}>{ticket.tide_score}</span>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10 }}>
        <SubScore label="Heat" value={ticket.tide_heat} color={C.red} />
        <SubScore label="Value" value={ticket.tide_value} color={C.amber} />
        <SubScore label="Risk" value={ticket.tide_risk} color={C.violet} />
      </div>
    </div>
  );
}

function SubScore({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 3 }}>
        <span style={{ fontFamily: C.mono, fontSize: 9, color: C.textF, letterSpacing: 1, textTransform: "uppercase" }}>{label}</span>
        <span style={{ fontFamily: C.mono, fontSize: 11, fontWeight: 700, color: C.text, fontVariantNumeric: "tabular-nums" }}>{value}</span>
      </div>
      <div style={{ height: 5, background: C.bg3, borderRadius: 3, overflow: "hidden" }}>
        <div style={{ width: `${value}%`, height: "100%", background: color, transition: "width .3s" }} />
      </div>
    </div>
  );
}

function ThreadView({ messages }: { messages: Message[] }) {
  if (messages.length === 0) {
    return <div style={{ padding: 24, textAlign: "center", fontFamily: C.mono, fontSize: 11, color: C.textE, letterSpacing: 1 }}>NO MESSAGES YET</div>;
  }
  return (
    <div style={{ marginBottom: 14 }}>
      <div style={{ fontFamily: C.mono, fontSize: 9, color: C.textE, letterSpacing: 1.5, textTransform: "uppercase", marginBottom: 8, padding: "0 4px" }}>Thread · {messages.length} message{messages.length !== 1 ? "s" : ""}</div>
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {messages.map(m => (
          <div key={m.id} style={{
            background: m.direction === "outbound" ? C.cyanL : C.bg2,
            border: `1px solid ${m.direction === "outbound" ? "rgba(8,145,178,0.18)" : C.border}`,
            borderRadius: 10, padding: 12,
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6, gap: 10 }}>
              <span style={{ fontFamily: C.sans, fontSize: 12, fontWeight: 700, color: C.text }}>
                {m.direction === "outbound" ? "→ " : "← "}
                {m.from_name || m.from_email || "(no sender)"}
              </span>
              <span style={{ fontFamily: C.mono, fontSize: 9, color: C.textE, letterSpacing: 0.5 }}>
                {m.channel === "voicemail" ? "📞 VOICEMAIL · " : ""}
                {relativeTime(m.created_at).toUpperCase()}
              </span>
            </div>
            {m.channel === "voicemail" && m.voicemail_transcript ? (
              <>
                <div style={{ fontFamily: C.mono, fontSize: 9, color: C.violet, letterSpacing: 1, textTransform: "uppercase", marginBottom: 4 }}>Transcript</div>
                <div style={{ fontFamily: C.sans, fontSize: 13, color: C.textD, lineHeight: 1.55, whiteSpace: "pre-wrap" }}>{m.voicemail_transcript}</div>
                {m.voicemail_url && (
                  <audio controls src={m.voicemail_url} style={{ marginTop: 8, width: "100%", height: 32 }} />
                )}
              </>
            ) : (
              <div style={{ fontFamily: C.sans, fontSize: 13, color: C.textD, lineHeight: 1.55, whiteSpace: "pre-wrap" }}>{m.body_text}</div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function DraftsList({ drafts, onUse }: { drafts: any[]; onUse: (d: any) => void }) {
  return (
    <div style={{ marginBottom: 14 }}>
      <div style={{ fontFamily: C.mono, fontSize: 9, color: C.amber, letterSpacing: 1.5, textTransform: "uppercase", marginBottom: 8, padding: "0 4px", fontWeight: 700 }}>
        ✨ AI Drafts · {drafts.length}
      </div>
      {drafts.map(d => (
        <div key={d.id} style={{ background: "linear-gradient(135deg, rgba(224,123,0,0.06), rgba(224,123,0,0.02))", border: "1px solid rgba(224,123,0,0.2)", borderRadius: 10, padding: 12, marginBottom: 8 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
            <span style={{ fontFamily: C.sans, fontSize: 12, fontWeight: 700, color: C.text }}>Draft suggestion</span>
            <span style={{ fontFamily: C.mono, fontSize: 9, color: C.textF }}>Confidence {d.confidence_score}%</span>
          </div>
          <div style={{ fontFamily: C.sans, fontSize: 13, color: C.textD, lineHeight: 1.5, marginBottom: 8, whiteSpace: "pre-wrap" }}>{d.body_text}</div>
          <button onClick={() => onUse(d)} style={{ padding: "7px 14px", background: C.amber, color: "#fff", border: "none", borderRadius: 7, fontFamily: C.sans, fontWeight: 700, fontSize: 12, cursor: "pointer" }}>
            Use this draft
          </button>
        </div>
      ))}
    </div>
  );
}

function ComposerFooter({ showComposer, setShowComposer, replyText, setReplyText, replySubject, setReplySubject, onGenerate, onSend, busy }: any) {
  if (!showComposer) {
    return (
      <div style={{ borderTop: `1px solid ${C.border}`, background: C.bg2, padding: 12, display: "flex", gap: 8 }}>
        <button onClick={onGenerate} disabled={busy} style={{
          padding: "10px 16px", background: `linear-gradient(135deg, ${C.amber}, #c96800)`, color: "#fff",
          border: "none", borderRadius: 8, fontFamily: C.sans, fontWeight: 700, fontSize: 13, cursor: busy ? "wait" : "pointer",
          boxShadow: "0 4px 14px rgba(224,123,0,0.25)", flex: 1,
        }}>
          {busy ? "Working…" : "✨ Draft AI Reply"}
        </button>
        <button onClick={() => setShowComposer(true)} style={{
          padding: "10px 16px", background: C.bg2, border: `1px solid ${C.border}`, borderRadius: 8,
          fontFamily: C.sans, fontWeight: 600, fontSize: 13, color: C.textD, cursor: "pointer",
        }}>
          Write manually
        </button>
      </div>
    );
  }
  return (
    <div style={{ borderTop: `1px solid ${C.border}`, background: C.bg2, padding: 12 }}>
      <input
        value={replySubject}
        onChange={e => setReplySubject(e.target.value)}
        placeholder="Subject"
        style={{ width: "100%", padding: "8px 12px", border: `1px solid ${C.border}`, borderRadius: 8, fontFamily: C.sans, fontSize: 13, marginBottom: 8, outline: "none", color: C.text, background: C.bg2 }}
      />
      <textarea
        value={replyText}
        onChange={e => setReplyText(e.target.value)}
        placeholder="Type your reply…"
        rows={6}
        style={{ width: "100%", padding: "10px 12px", border: `1px solid ${C.border}`, borderRadius: 8, fontFamily: C.sans, fontSize: 13, lineHeight: 1.55, resize: "vertical", outline: "none", color: C.text, background: C.bg2 }}
      />
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 8 }}>
        <button onClick={onGenerate} disabled={busy} style={{ padding: "7px 12px", background: "transparent", border: `1px solid ${C.border}`, borderRadius: 7, fontFamily: C.sans, fontSize: 12, color: C.textD, cursor: busy ? "wait" : "pointer" }}>
          ✨ {busy ? "…" : "Draft with AI"}
        </button>
        <div style={{ display: "flex", gap: 8 }}>
          <button onClick={() => setShowComposer(false)} style={{ padding: "8px 14px", background: "transparent", border: `1px solid ${C.border}`, borderRadius: 7, fontFamily: C.sans, fontWeight: 600, fontSize: 12, color: C.textD, cursor: "pointer" }}>
            Cancel
          </button>
          <button onClick={onSend} disabled={busy} style={{ padding: "8px 18px", background: `linear-gradient(135deg, ${C.cyan}, ${C.cyanD})`, color: "#fff", border: "none", borderRadius: 7, fontFamily: C.sans, fontWeight: 700, fontSize: 12, cursor: busy ? "wait" : "pointer", boxShadow: "0 4px 12px rgba(8,145,178,0.25)" }}>
            {busy ? "Sending…" : "Send Reply →"}
          </button>
        </div>
      </div>
    </div>
  );
}

function StatusMenu({ status, onChange, disabled }: { status: string; onChange: (s: string) => void; disabled: boolean }) {
  const opts = [
    { value: "new", label: "New" },
    { value: "awaiting_reply", label: "Awaiting Reply" },
    { value: "quoted", label: "Quoted" },
    { value: "booked", label: "Booked" },
    { value: "completed", label: "Completed" },
    { value: "closed", label: "Closed" },
    { value: "spam", label: "Spam" },
  ];
  return (
    <select
      value={status}
      onChange={e => onChange(e.target.value)}
      disabled={disabled}
      style={{
        padding: "8px 10px", border: `1px solid ${C.border}`, borderRadius: 8,
        fontFamily: C.sans, fontWeight: 600, fontSize: 12, color: C.textD, background: C.bg2,
        cursor: disabled ? "wait" : "pointer",
      }}>
      {opts.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
    </select>
  );
}

// ════════════════════════════════════════════════════════════════
//  EMPTY / LOADING / LOGO
// ════════════════════════════════════════════════════════════════
function LoadingState() {
  return (
    <div style={{ padding: "80px 20px", textAlign: "center", fontFamily: C.mono, fontSize: 11, color: C.textE, letterSpacing: 1.5 }}>
      LOADING TICKETS…
    </div>
  );
}

function EmptyState({ hasTickets, hasFilter }: { hasTickets: boolean; hasFilter: boolean }) {
  return (
    <div style={{ padding: "80px 20px", textAlign: "center" }}>
      <div style={{ fontFamily: C.display, fontSize: 28, fontWeight: 700, color: C.text, marginBottom: 8, letterSpacing: "-0.02em" }}>
        {hasFilter ? "Nothing matches that filter." : "All clear."}
      </div>
      <div style={{ fontFamily: C.sans, fontSize: 14, color: C.textF, maxWidth: 380, margin: "0 auto", lineHeight: 1.55 }}>
        {hasTickets
          ? "Try clearing the filter to see open tickets."
          : "When inquiries come in from email, voicemail, or FareHarbor, they'll show up here automatically."}
      </div>
    </div>
  );
}

function Logo({ size = 32 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" style={{ flexShrink: 0 }}>
      <defs>
        <linearGradient id="mdtL" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor={C.cyan} />
          <stop offset="100%" stopColor={C.cyanD} />
        </linearGradient>
      </defs>
      <circle cx="20" cy="20" r="18" fill="url(#mdtL)" />
      <path d="M 8 22 Q 14 17 20 22 T 32 22" stroke="#fff" strokeWidth="2.2" fill="none" strokeLinecap="round" />
      <path d="M 8 27 Q 14 22 20 27 T 32 27" stroke="#fff" strokeWidth="1.6" fill="none" strokeLinecap="round" opacity="0.6" />
    </svg>
  );
}

// ════════════════════════════════════════════════════════════════
//  HELPERS
// ════════════════════════════════════════════════════════════════
function tideLabel(score: number): { label: string; color: string } {
  if (score >= 80) return { label: "🔥 HOT",    color: C.red    };
  if (score >= 65) return { label: "↑ STRONG",  color: C.amberY };
  if (score >= 50) return { label: "→ STEADY",  color: C.cyan   };
  if (score >= 35) return { label: "↓ COOL",    color: C.textF  };
  return                 { label: "○ COLD",    color: C.textE  };
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

function prettyDate(yyyymmdd: string): string {
  try {
    const d = new Date(yyyymmdd + "T12:00:00");
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: d.getFullYear() === new Date().getFullYear() ? undefined : "numeric" });
  } catch (e) { return yyyymmdd; }
}
