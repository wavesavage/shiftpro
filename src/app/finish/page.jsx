"use client";
import React, { useState, useEffect, useCallback } from "react";

const STORAGE_KEY = "shiftpro_launch_checklist";

const DEFAULT_SECTIONS = [
  {
    id: "critical",
    title: "🚀 Critical — Must Pass Before Launch",
    color: "#1a9e6e",
    items: [
      { id: "c1", text: "Employee Login Flow", detail: "Create test employee, send invite, set password, login, verify portal loads", status: "✅ Built" },
      { id: "c2", text: "Clock In / Out", detail: "Clock in, verify timer, take break, clock out, check clock_events", status: "✅ Built" },
      { id: "c3", text: "Geofencing", detail: "Set lat/lng for Sea Lion Dockside, test from correct + wrong location", status: "✅ Built" },
      { id: "c4", text: "Schedule Builder (Weekly)", detail: "Create shifts, switch weeks, verify employees see them", status: "✅ Built" },
      { id: "c5", text: "Schedule Builder (Monthly)", detail: "Click day cells to add shifts, navigate months, verify cards display", status: "✅ Built" },
      { id: "c6", text: "Shift Swap: Post", detail: "Employee posts shift for swap, verify it appears for coworkers", status: "✅ Built" },
      { id: "c7", text: "Shift Swap: Claim", detail: "Second employee claims swap, verify status changes to claimed", status: "✅ Built" },
      { id: "c8", text: "Shift Swap: Approve", detail: "Manager approves, verify shift.user_id reassigned to claimer", status: "✅ Built" },
      { id: "c9", text: "Messaging: Employee → Manager", detail: "Employee sends message, verify owner sees it in notifications + message center", status: "✅ Built" },
      { id: "c10", text: "Messaging: Manager → Employee", detail: "Owner replies, verify employee sees reply in Messages tab", status: "✅ Built" },
      { id: "c11", text: "Documents: Employee Upload", detail: "Upload PDF from employee portal, verify list + download works", status: "✅ Built" },
      { id: "c12", text: "Documents: Owner Upload", detail: "Upload doc to employee file from drawer, verify employee sees it", status: "✅ Built" },
      { id: "c13", text: "Portal Settings", detail: "Toggle Estimated Earnings OFF, refresh employee portal, verify hidden", status: "✅ Built" },
      { id: "c14", text: "Notifications: Persist", detail: "Dismiss with X, refresh page, verify they stay dismissed", status: "✅ Built" },
      { id: "c15", text: "Time Off Request", detail: "Employee submits, manager approves/denies, verify status updates", status: "✅ Built" },
      { id: "c16", text: "Password Reset", detail: "Click Forgot Password, receive email, set new password, login", status: "✅ Built" },
      { id: "c17", text: "Location Switching", detail: "Switch between locations, verify correct employees load", status: "✅ Built" },
      { id: "c18", text: "Blackout Calendar", detail: "Add dates, verify they appear, remove one, verify removal", status: "✅ Built" },
      { id: "c19", text: "24h Military Time", detail: "Toggle ON, verify header clock + schedule times change", status: "✅ Built" },
      { id: "c20", text: "Dark Mode", detail: "Toggle ON, verify UI inverts, images normal, toggle OFF", status: "✅ Built" },
      { id: "c21", text: "Push Notifications", detail: "Test page passes all 6 steps, real notifications arrive", status: "✅ Built" },
    ]
  },
  {
    id: "week1",
    title: "⚡ Week 1 — Important",
    color: "#e07b00",
    items: [
      { id: "w1", text: "Mobile Responsiveness", detail: "Test on iPhone + Android: login, clock in, schedule, messages, documents", status: "⚠️ Partial" },
      { id: "w2", text: "Error Handling", detail: "Test with airplane mode, slow connection, expired session, invalid inputs", status: "⚠️ Partial" },
      { id: "w3", text: "Stripe Billing", detail: "Integrate Stripe for Pro ($39.99/mo) and Enterprise plans", status: "❌ Not Built" },
      { id: "w4", text: "Email Notifications", detail: "Send email when: shift posted, swap claimed, schedule published", status: "❌ Not Built" },
      { id: "w5", text: "Rate Limiting", detail: "Add rate limits to API routes to prevent abuse", status: "❌ Not Built" },
      { id: "w6", text: "Input Sanitization", detail: "Sanitize all user inputs to prevent XSS attacks", status: "❌ Not Built" },
      { id: "w7", text: "Session Timeout", detail: "Auto-logout after 8 hours of inactivity", status: "❌ Not Built" },
      { id: "w8", text: "Terms of Service", detail: "Draft ToS and Privacy Policy, add to /final signup page", status: "❌ Not Built" },
      { id: "w9", text: "Loading States", detail: "Add skeleton loaders to all tabs that load data", status: "⚠️ Partial" },
      { id: "w10", text: "Browser Testing", detail: "Test Safari, Firefox, Chrome, Edge — check layout issues", status: "⚠️ Partial" },
      { id: "w11", text: "Backup Verification", detail: "Verify Supabase daily backups enabled and test restore", status: "⚠️ Partial" },
    ]
  },
  {
    id: "roadmap",
    title: "🗺️ Post-Launch Roadmap",
    color: "#6366f1",
    items: [
      { id: "r1", text: "Pay Stub Generation", detail: "Generate PDF pay stubs from timesheet data, deliver to employee documents", status: "High" },
      { id: "r2", text: "QuickBooks Integration", detail: "Sync hours + payroll data with QBO", status: "High" },
      { id: "r3", text: "Employee Mobile App", detail: "Expo React Native app for iOS/Android", status: "High" },
      { id: "r4", text: "Recurring Shift Templates", detail: "Save a week as template, apply to future weeks with one click", status: "Medium" },
      { id: "r5", text: "Reporting Dashboard", detail: "Intelligence tab: labor cost trends, attendance rates, overtime", status: "Medium" },
      { id: "r6", text: "Multi-Timezone Support", detail: "Each location can have its own timezone", status: "Medium" },
      { id: "r7", text: "Audit Log", detail: "Track all changes: who edited shifts, approved swaps, updated profiles", status: "Medium" },
      { id: "r8", text: "Role-Based Permissions", detail: "Supervisor role with limited access (no payroll, no deactivate)", status: "Low" },
      { id: "r9", text: "Custom Branding", detail: "Let businesses add their logo and brand colors", status: "Low" },
      { id: "r10", text: "Onboarding Wizard", detail: "Step-by-step setup for new businesses", status: "Medium" },
      { id: "r11", text: "Shift Conflict Detection", detail: "Warn when scheduling overlapping shifts or exceeding availability", status: "Medium" },
      { id: "r12", text: "Tip Tracking", detail: "Track and distribute tips by shift for tipped employees", status: "Low" },
      { id: "r13", text: "Labor Forecasting", detail: "AI-powered scheduling suggestions based on historical patterns", status: "Low" },
    ]
  }
];

export default function FinishPage() {
  const [sections, setSections] = useState(null);
  const [checked, setChecked] = useState({});
  const [notes, setNotes] = useState({});
  const [editingNote, setEditingNote] = useState(null);
  const [noteText, setNoteText] = useState("");
  const [addingTo, setAddingTo] = useState(null);
  const [newItemText, setNewItemText] = useState("");
  const [newItemDetail, setNewItemDetail] = useState("");
  const [expandedSection, setExpandedSection] = useState("critical");

  // Load from localStorage
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const saved = JSON.parse(raw);
        setSections(saved.sections || DEFAULT_SECTIONS);
        setChecked(saved.checked || {});
        setNotes(saved.notes || {});
      } else {
        setSections(DEFAULT_SECTIONS);
      }
    } catch (e) {
      setSections(DEFAULT_SECTIONS);
    }
  }, []);

  // Auto-save
  const save = useCallback((s, c, n) => {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify({ sections: s, checked: c, notes: n, savedAt: new Date().toISOString() })); } catch (e) {}
  }, []);

  useEffect(() => {
    if (sections) save(sections, checked, notes);
  }, [sections, checked, notes, save]);

  const toggleCheck = (id) => {
    setChecked(p => {
      const updated = { ...p, [id]: !p[id] };
      return updated;
    });
  };

  const saveNote = (id) => {
    setNotes(p => ({ ...p, [id]: noteText }));
    setEditingNote(null);
    setNoteText("");
  };

  const addItem = (sectionId) => {
    if (!newItemText.trim()) return;
    const id = "custom_" + Date.now();
    setSections(prev => prev.map(s =>
      s.id === sectionId
        ? { ...s, items: [...s.items, { id, text: newItemText.trim(), detail: newItemDetail.trim() || "Custom item", status: "❌ Not Built" }] }
        : s
    ));
    setNewItemText("");
    setNewItemDetail("");
    setAddingTo(null);
  };

  const removeItem = (sectionId, itemId) => {
    if (!confirm("Remove this item?")) return;
    setSections(prev => prev.map(s =>
      s.id === sectionId ? { ...s, items: s.items.filter(i => i.id !== itemId) } : s
    ));
  };

  const resetAll = () => {
    if (!confirm("Reset entire checklist to defaults? This clears all checkmarks, notes, and custom items.")) return;
    setSections(DEFAULT_SECTIONS);
    setChecked({});
    setNotes({});
  };

  if (!sections) return (
    <div style={{ minHeight: "100vh", background: "#0c1220", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ color: "#e8b84b", fontFamily: "'JetBrains Mono', monospace", fontSize: 14 }}>Loading checklist...</div>
    </div>
  );

  const totalItems = sections.reduce((s, sec) => s + sec.items.length, 0);
  const checkedCount = Object.values(checked).filter(Boolean).length;
  const pct = totalItems > 0 ? Math.round((checkedCount / totalItems) * 100) : 0;

  return (
    <div style={{ minHeight: "100vh", background: "#0c1220", fontFamily: "'Segoe UI', system-ui, sans-serif", color: "#e2e8f0" }}>
      {/* Header */}
      <div style={{ background: "linear-gradient(135deg, #0c1220 0%, #1a1a2e 100%)", borderBottom: "1px solid rgba(232,184,75,0.15)", padding: "0 24px", position: "sticky", top: 0, zIndex: 100 }}>
        <div style={{ maxWidth: 900, margin: "0 auto", padding: "20px 0" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
            <div>
              <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 9, color: "#e8b84b", letterSpacing: 3, textTransform: "uppercase", marginBottom: 4 }}>ShiftPro.ai</div>
              <div style={{ fontSize: 24, fontWeight: 800, color: "#fff" }}>Launch Checklist</div>
            </div>
            <div style={{ textAlign: "right" }}>
              <div style={{ fontSize: 36, fontWeight: 800, color: pct === 100 ? "#10b981" : "#e8b84b" }}>{pct}%</div>
              <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, color: "#64748b" }}>{checkedCount}/{totalItems} complete</div>
            </div>
          </div>
          {/* Progress bar */}
          <div style={{ height: 6, background: "rgba(255,255,255,0.06)", borderRadius: 3, overflow: "hidden" }}>
            <div style={{ height: "100%", width: pct + "%", background: pct === 100 ? "linear-gradient(90deg, #10b981, #2dd4bf)" : "linear-gradient(90deg, #e8b84b, #f59e0b)", borderRadius: 3, transition: "width 0.5s ease" }} />
          </div>
        </div>
      </div>

      {/* Sections */}
      <div style={{ maxWidth: 900, margin: "0 auto", padding: "24px 24px 80px" }}>
        {sections.map(section => {
          const sectionChecked = section.items.filter(i => checked[i.id]).length;
          const sectionTotal = section.items.length;
          const isExpanded = expandedSection === section.id;
          const sectionPct = sectionTotal > 0 ? Math.round((sectionChecked / sectionTotal) * 100) : 0;

          return (
            <div key={section.id} style={{ marginBottom: 16 }}>
              {/* Section header */}
              <button onClick={() => setExpandedSection(isExpanded ? null : section.id)}
                style={{ width: "100%", padding: "16px 20px", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: isExpanded ? "14px 14px 0 0" : 14, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "space-between", transition: "all 0.2s" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <div style={{ width: 4, height: 32, background: section.color, borderRadius: 2 }} />
                  <div style={{ textAlign: "left" }}>
                    <div style={{ fontSize: 16, fontWeight: 700, color: "#fff" }}>{section.title}</div>
                    <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, color: "#64748b", marginTop: 2 }}>{sectionChecked}/{sectionTotal} complete</div>
                  </div>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  {sectionPct === 100 && <span style={{ fontSize: 10, color: "#10b981", background: "rgba(16,185,129,0.1)", padding: "3px 10px", borderRadius: 10, fontWeight: 700 }}>COMPLETE</span>}
                  <div style={{ width: 60, height: 4, background: "rgba(255,255,255,0.06)", borderRadius: 2 }}>
                    <div style={{ height: "100%", width: sectionPct + "%", background: section.color, borderRadius: 2, transition: "width 0.3s" }} />
                  </div>
                  <span style={{ color: "#64748b", fontSize: 16, transition: "transform 0.2s", transform: isExpanded ? "rotate(180deg)" : "none" }}>▼</span>
                </div>
              </button>

              {/* Section items */}
              {isExpanded && (
                <div style={{ border: "1px solid rgba(255,255,255,0.06)", borderTop: "none", borderRadius: "0 0 14px 14px", overflow: "hidden" }}>
                  {section.items.map((item, idx) => {
                    const isDone = checked[item.id];
                    const hasNote = notes[item.id];
                    return (
                      <div key={item.id} style={{ padding: "14px 20px", borderBottom: idx < section.items.length - 1 ? "1px solid rgba(255,255,255,0.04)" : "none", background: isDone ? "rgba(16,185,129,0.03)" : "transparent", transition: "background 0.2s" }}>
                        <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
                          {/* Checkbox */}
                          <button onClick={() => toggleCheck(item.id)}
                            style={{ width: 24, height: 24, borderRadius: 6, border: isDone ? "none" : "2px solid rgba(255,255,255,0.15)", background: isDone ? section.color : "transparent", cursor: "pointer", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", marginTop: 1, transition: "all 0.15s" }}>
                            {isDone && <span style={{ color: "#fff", fontSize: 14, fontWeight: 700 }}>✓</span>}
                          </button>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ fontSize: 14, fontWeight: 600, color: isDone ? "#64748b" : "#fff", textDecoration: isDone ? "line-through" : "none", transition: "all 0.2s" }}>{item.text}</div>
                            <div style={{ fontSize: 12, color: "#64748b", marginTop: 2 }}>{item.detail}</div>
                            {hasNote && (
                              <div style={{ marginTop: 6, padding: "6px 10px", background: "rgba(232,184,75,0.06)", border: "1px solid rgba(232,184,75,0.15)", borderRadius: 6, fontSize: 11, color: "#e8b84b" }}>📝 {hasNote}</div>
                            )}
                            {editingNote === item.id && (
                              <div style={{ marginTop: 8, display: "flex", gap: 6 }}>
                                <input value={noteText} onChange={e => setNoteText(e.target.value)} placeholder="Add a note..."
                                  autoFocus onKeyDown={e => e.key === "Enter" && saveNote(item.id)}
                                  style={{ flex: 1, padding: "6px 10px", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 6, color: "#fff", fontSize: 12, outline: "none", fontFamily: "inherit" }} />
                                <button onClick={() => saveNote(item.id)} style={{ padding: "6px 12px", background: section.color, border: "none", borderRadius: 6, color: "#fff", fontSize: 11, fontWeight: 700, cursor: "pointer" }}>Save</button>
                                <button onClick={() => setEditingNote(null)} style={{ padding: "6px 10px", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 6, color: "#64748b", fontSize: 11, cursor: "pointer" }}>✕</button>
                              </div>
                            )}
                          </div>
                          {/* Status badge */}
                          <div style={{ display: "flex", alignItems: "center", gap: 6, flexShrink: 0 }}>
                            <span style={{ fontSize: 10, fontFamily: "'JetBrains Mono', monospace", padding: "3px 8px", borderRadius: 6, fontWeight: 600,
                              background: item.status.includes("Built") ? "rgba(16,185,129,0.1)" : item.status.includes("Partial") ? "rgba(224,123,0,0.1)" : item.status.includes("High") ? "rgba(239,68,68,0.1)" : item.status.includes("Medium") ? "rgba(224,123,0,0.1)" : item.status.includes("Low") ? "rgba(99,102,241,0.1)" : "rgba(239,68,68,0.1)",
                              color: item.status.includes("Built") ? "#10b981" : item.status.includes("Partial") ? "#e07b00" : item.status.includes("High") ? "#ef4444" : item.status.includes("Medium") ? "#e07b00" : item.status.includes("Low") ? "#6366f1" : "#ef4444",
                            }}>{item.status}</span>
                            <button onClick={() => { setEditingNote(item.id); setNoteText(notes[item.id] || ""); }}
                              style={{ padding: "3px 6px", background: "none", border: "none", color: "#64748b", cursor: "pointer", fontSize: 12 }} title="Add note">📝</button>
                            {item.id.startsWith("custom_") && (
                              <button onClick={() => removeItem(section.id, item.id)}
                                style={{ padding: "3px 6px", background: "none", border: "none", color: "#ef4444", cursor: "pointer", fontSize: 12 }} title="Remove">✕</button>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}

                  {/* Add item */}
                  {addingTo === section.id ? (
                    <div style={{ padding: "14px 20px", background: "rgba(255,255,255,0.02)" }}>
                      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                        <input value={newItemText} onChange={e => setNewItemText(e.target.value)} placeholder="Item name..."
                          autoFocus onKeyDown={e => e.key === "Enter" && addItem(section.id)}
                          style={{ padding: "8px 12px", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, color: "#fff", fontSize: 13, outline: "none", fontFamily: "inherit" }} />
                        <input value={newItemDetail} onChange={e => setNewItemDetail(e.target.value)} placeholder="Details / what to test..."
                          onKeyDown={e => e.key === "Enter" && addItem(section.id)}
                          style={{ padding: "8px 12px", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, color: "#fff", fontSize: 12, outline: "none", fontFamily: "inherit" }} />
                        <div style={{ display: "flex", gap: 8 }}>
                          <button onClick={() => addItem(section.id)} style={{ padding: "8px 16px", background: section.color, border: "none", borderRadius: 8, color: "#fff", fontSize: 12, fontWeight: 700, cursor: "pointer" }}>Add Item</button>
                          <button onClick={() => setAddingTo(null)} style={{ padding: "8px 16px", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, color: "#64748b", fontSize: 12, cursor: "pointer" }}>Cancel</button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <button onClick={() => setAddingTo(section.id)}
                      style={{ width: "100%", padding: "12px 20px", background: "rgba(255,255,255,0.02)", border: "none", borderTop: "1px solid rgba(255,255,255,0.04)", color: "#64748b", fontSize: 12, cursor: "pointer", fontFamily: "inherit", textAlign: "left" }}>
                      + Add item to {section.title.split("—")[0].trim()}
                    </button>
                  )}
                </div>
              )}
            </div>
          );
        })}

        {/* Footer */}
        <div style={{ marginTop: 32, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, color: "#475569" }}>
            Last saved: {new Date().toLocaleString()}
          </div>
          <button onClick={resetAll}
            style={{ padding: "6px 14px", background: "rgba(239,68,68,0.06)", border: "1px solid rgba(239,68,68,0.15)", borderRadius: 8, fontFamily: "'JetBrains Mono', monospace", fontSize: 10, color: "#ef4444", cursor: "pointer" }}>
            Reset Checklist
          </button>
        </div>
      </div>
    </div>
  );
}
