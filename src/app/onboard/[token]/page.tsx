// src/app/onboard/[token]/page.tsx
"use client";

// ════════════════════════════════════════════════════════════════
//  CREWPORT — Candidate-facing onboarding portal
//  /onboard/{token}
//  Mobile-first. No login. Possession of the token IS the auth.
// ════════════════════════════════════════════════════════════════

import React, { useEffect, useMemo, useRef, useState } from "react";
import { useParams } from "next/navigation";

// ════════════════════════════════════════════════════════════════
//  TOKENS — match MDT/ShiftPro design but tenant-brand-color aware
// ════════════════════════════════════════════════════════════════
const C = {
  bg: "#f0f6fa", bg2: "#ffffff", bg3: "#e8f1f7",
  border: "#dce8f0", borderL: "#eef4f8",
  text: "#0c1220", textD: "#3b475c", textF: "#64748b", textE: "#94a3b8",
  green: "#10b981", red: "#dc2626", redL: "rgba(220,38,38,0.07)",
  amberY: "#f59e0b", violet: "#7c3aed",
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
@keyframes oFadeIn { from { opacity: 0; transform: translateY(8px) } to { opacity: 1; transform: none } }
@keyframes oSlideRight { from { transform: translateX(20px); opacity: 0 } to { transform: none; opacity: 1 } }
.o-fade { animation: oFadeIn .35s cubic-bezier(.22,1,.36,1) }
.o-slide { animation: oSlideRight .3s cubic-bezier(.22,1,.36,1) }
.o-scroll::-webkit-scrollbar { width: 8px; height: 8px }
.o-scroll::-webkit-scrollbar-thumb { background: rgba(8,18,32,0.12); border-radius: 4px }
input, textarea, select { font-family: ${C.sans} }
input[type="checkbox"] { cursor: pointer }
@media (max-width: 640px) {
  .o-card { padding: 20px !important }
}
`;

// ════════════════════════════════════════════════════════════════
//  TYPES
// ════════════════════════════════════════════════════════════════
type Template = {
  id: string;
  name: string;
  description?: string;
  kind: string;
  form_key?: string;
  file_name?: string;
  custom_schema?: any[];
  download_url?: string | null;
};
type Submission = {
  id: string;
  template_id: string;
  data: any;
  status: "in_progress" | "completed";
  completed_at?: string | null;
};
type OnboardingState = {
  invitation: {
    id: string;
    candidate_name: string;
    candidate_email: string;
    position_name: string;
    status: string;
    completion_pct: number;
    completed_at?: string | null;
    expires_at: string;
  };
  org: { name: string; brand_color: string; logo_url: string | null };
  templates: Template[];
  submissions: Submission[];
};

// ════════════════════════════════════════════════════════════════
//  ROOT
// ════════════════════════════════════════════════════════════════
export default function OnboardPage() {
  const params = useParams<{ token: string }>();
  const token = params?.token || "";

  const [state, setState] = useState<OnboardingState | null>(null);
  const [error, setError] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [done, setDone] = useState(false);

  const load = async () => {
    setLoading(true);
    setError("");
    try {
      const r = await fetch(`/api/onboard/${token}`);
      const data = await r.json();
      if (!r.ok) {
        setError(data.error || "Could not load onboarding");
        return;
      }
      if (data.invitation.status === "completed") {
        setDone(true);
      }
      setState(data);
    } catch (e: any) {
      setError(e?.message || "Network error");
    } finally { setLoading(false); }
  };

  useEffect(() => { if (token) load(); }, [token]);

  if (loading) {
    return <CenteredPanel><div style={{ fontFamily: C.mono, fontSize: 11, color: C.textE, letterSpacing: 1.5 }}>LOADING…</div></CenteredPanel>;
  }
  if (error) {
    return (
      <CenteredPanel>
        <div style={{ fontFamily: C.display, fontSize: 22, fontWeight: 700, color: C.text, marginBottom: 8, letterSpacing: "-0.01em" }}>Hmm, something's off.</div>
        <div style={{ fontFamily: C.sans, fontSize: 14, color: C.textF, lineHeight: 1.55, maxWidth: 360 }}>{error}</div>
        <div style={{ fontFamily: C.sans, fontSize: 13, color: C.textE, marginTop: 18 }}>
          If this link came from your employer, reach out and ask them to send you a fresh one.
        </div>
      </CenteredPanel>
    );
  }
  if (!state) return null;
  if (done) return <SuccessScreen state={state} />;

  return (
    <>
      <style>{FONTS}</style>
      <Wizard token={token} state={state} onReload={load} onDone={() => setDone(true)} />
    </>
  );
}

function CenteredPanel({ children }: { children: React.ReactNode }) {
  return (
    <>
      <style>{FONTS}</style>
      <div style={{ minHeight: "100vh", background: C.bg, display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
        <div className="o-fade o-card" style={{ background: C.bg2, borderRadius: 16, padding: 36, maxWidth: 480, width: "100%", boxShadow: C.shadowL, textAlign: "center" }}>
          {children}
        </div>
      </div>
    </>
  );
}

// ════════════════════════════════════════════════════════════════
//  WIZARD — main onboarding flow
// ════════════════════════════════════════════════════════════════
function Wizard({ token, state, onReload, onDone }: { token: string; state: OnboardingState; onReload: () => void; onDone: () => void }) {
  const brandColor = state.org.brand_color || "#0891b2";

  // Build step list — each template is a step, plus an intro and a final-sign step
  const formSteps = state.templates.map(t => ({
    kind: "form" as const,
    template: t,
    submission: state.submissions.find(s => s.template_id === t.id),
  }));
  const allSteps = [
    { kind: "intro" as const },
    ...formSteps,
    { kind: "review" as const },
    { kind: "sign" as const },
  ];

  const [stepIdx, setStepIdx] = useState(0);

  // If they have any in-progress, jump past intro to first incomplete form
  useEffect(() => {
    if (state.submissions.length > 0) {
      const firstIncomplete = state.templates.findIndex(t => {
        const s = state.submissions.find(x => x.template_id === t.id);
        return !s || s.status !== "completed";
      });
      if (firstIncomplete >= 0) {
        setStepIdx(1 + firstIncomplete);
      } else {
        // All forms complete — go to review
        setStepIdx(1 + state.templates.length);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const total = state.templates.length;
  const completedCount = state.submissions.filter(s => s.status === "completed").length;
  const pct = total > 0 ? Math.round((completedCount / total) * 100) : 0;

  return (
    <div style={{ minHeight: "100vh", background: C.bg }}>
      <BrandHeader org={state.org} candidateName={state.invitation.candidate_name} brandColor={brandColor} pct={pct} />

      <main style={{ maxWidth: 720, margin: "0 auto", padding: "20px 16px 60px" }}>
        {/* Stepper rail */}
        <Stepper steps={allSteps} currentIdx={stepIdx} onJump={setStepIdx} brandColor={brandColor} />

        {/* Active step */}
        <div className="o-slide" key={stepIdx}>
          {allSteps[stepIdx].kind === "intro" && (
            <IntroStep state={state} onContinue={() => setStepIdx(1)} brandColor={brandColor} />
          )}
          {allSteps[stepIdx].kind === "form" && (
            <FormStep
              token={token}
              template={(allSteps[stepIdx] as any).template}
              submission={(allSteps[stepIdx] as any).submission}
              brandColor={brandColor}
              onSaved={async () => { await onReload(); }}
              onContinue={() => setStepIdx(i => Math.min(allSteps.length - 1, i + 1))}
              onBack={() => setStepIdx(i => Math.max(0, i - 1))}
              isFirst={stepIdx === 1}
            />
          )}
          {allSteps[stepIdx].kind === "review" && (
            <ReviewStep state={state} brandColor={brandColor} onJump={setStepIdx} onContinue={() => setStepIdx(i => i + 1)} onBack={() => setStepIdx(i => Math.max(0, i - 1))} />
          )}
          {allSteps[stepIdx].kind === "sign" && (
            <SignStep token={token} state={state} brandColor={brandColor} onComplete={onDone} onBack={() => setStepIdx(i => Math.max(0, i - 1))} />
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}

// ════════════════════════════════════════════════════════════════
//  HEADER — branded with tenant
// ════════════════════════════════════════════════════════════════
function BrandHeader({ org, candidateName, brandColor, pct }: any) {
  return (
    <div style={{ background: C.bg2, borderBottom: `1px solid ${C.border}`, position: "sticky", top: 0, zIndex: 50, boxShadow: C.shadow }}>
      <div style={{ maxWidth: 720, margin: "0 auto", padding: "14px 16px" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 14, flexWrap: "wrap" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, minWidth: 0 }}>
            {org.logo_url ? (
              <img src={org.logo_url} alt="" style={{ height: 32, width: "auto", borderRadius: 6 }} />
            ) : (
              <div style={{ width: 32, height: 32, borderRadius: 8, background: `linear-gradient(135deg, ${brandColor}, ${shadeColor(brandColor, -15)})`, color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: C.display, fontWeight: 700, fontSize: 16 }}>
                {org.name.slice(0, 1).toUpperCase()}
              </div>
            )}
            <div style={{ minWidth: 0 }}>
              <div style={{ fontFamily: C.display, fontWeight: 700, fontSize: 15, letterSpacing: "-0.01em", color: C.text, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{org.name}</div>
              <div style={{ fontFamily: C.mono, fontSize: 9, color: C.textF, letterSpacing: 1.4, textTransform: "uppercase", marginTop: 1 }}>Onboarding · {candidateName.split(" ")[0]}</div>
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ fontFamily: C.mono, fontSize: 10, color: C.textF, letterSpacing: 0.5 }}>{pct}%</span>
            <div style={{ width: 80, height: 5, background: C.bg3, borderRadius: 3, overflow: "hidden" }}>
              <div style={{ width: `${pct}%`, height: "100%", background: brandColor, transition: "width .35s" }} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════
//  STEPPER
// ════════════════════════════════════════════════════════════════
function Stepper({ steps, currentIdx, onJump, brandColor }: any) {
  return (
    <div className="o-scroll" style={{ display: "flex", gap: 6, marginBottom: 20, padding: "4px 2px", overflowX: "auto" }}>
      {steps.map((s: any, i: number) => {
        const active = i === currentIdx;
        const done = (() => {
          if (s.kind === "form") return s.submission?.status === "completed";
          if (s.kind === "intro") return currentIdx > 0;
          return false;
        })();
        const label = s.kind === "intro" ? "Welcome" : s.kind === "review" ? "Review" : s.kind === "sign" ? "Sign" : s.template?.name || "Form";
        return (
          <button
            key={i}
            onClick={() => onJump(i)}
            style={{
              flexShrink: 0,
              padding: "6px 12px",
              background: active ? brandColor : (done ? `${brandColor}15` : C.bg2),
              color: active ? "#fff" : (done ? brandColor : C.textF),
              border: `1px solid ${active ? brandColor : (done ? `${brandColor}30` : C.border)}`,
              borderRadius: 16,
              fontFamily: C.mono, fontSize: 10, fontWeight: 700, letterSpacing: 0.5, textTransform: "uppercase",
              cursor: "pointer", whiteSpace: "nowrap",
              transition: "all .15s",
            }}
          >
            {done && !active ? "✓ " : ""}{label}
          </button>
        );
      })}
    </div>
  );
}

// ════════════════════════════════════════════════════════════════
//  STEP — INTRO
// ════════════════════════════════════════════════════════════════
function IntroStep({ state, onContinue, brandColor }: any) {
  return (
    <Card>
      <div style={{ fontFamily: C.mono, fontSize: 10, color: brandColor, letterSpacing: 1.8, textTransform: "uppercase", marginBottom: 8, fontWeight: 700 }}>Welcome aboard</div>
      <div style={{ fontFamily: C.display, fontSize: 32, fontWeight: 700, color: C.text, letterSpacing: "-0.02em", marginBottom: 12, lineHeight: 1.05 }}>
        Hi {state.invitation.candidate_name.split(" ")[0]}.<br />
        <span style={{ fontStyle: "italic", color: brandColor, fontWeight: 400 }}>Let's get you set up.</span>
      </div>
      <p style={{ fontFamily: C.sans, fontSize: 15, color: C.textD, lineHeight: 1.6, marginBottom: 20 }}>
        We're excited to have you joining {state.org.name} as a <strong>{state.invitation.position_name}</strong>. This onboarding takes about 10–15 minutes and your progress saves automatically.
      </p>

      <div style={{ background: C.bg, border: `1px solid ${C.border}`, borderRadius: 12, padding: 18, marginBottom: 22 }}>
        <div style={{ fontFamily: C.mono, fontSize: 9, color: C.textF, letterSpacing: 1.5, textTransform: "uppercase", fontWeight: 600, marginBottom: 12 }}>What you'll need</div>
        <ul style={{ margin: 0, paddingLeft: 22, fontFamily: C.sans, fontSize: 14, color: C.textD, lineHeight: 1.7 }}>
          <li>Your Social Security number</li>
          <li>Bank routing & account numbers (if direct deposit)</li>
          <li>An emergency contact's name and phone</li>
          <li>About 15 minutes of focus</li>
        </ul>
      </div>

      <div style={{ background: `${brandColor}08`, border: `1px solid ${brandColor}25`, borderRadius: 12, padding: "12px 14px", marginBottom: 22, fontSize: 13, color: C.textD, lineHeight: 1.55 }}>
        <strong style={{ color: C.text }}>Your data is private.</strong> Sensitive info (SSN, account numbers) is encrypted at rest and only your employer can see your final packet.
      </div>

      <PrimaryButton brandColor={brandColor} onClick={onContinue} fullWidth>Get started →</PrimaryButton>
    </Card>
  );
}

// ════════════════════════════════════════════════════════════════
//  STEP — FORM (renders the right form for each kind/form_key)
// ════════════════════════════════════════════════════════════════
function FormStep({ token, template, submission, brandColor, onSaved, onContinue, onBack, isFirst }: any) {
  const [data, setData] = useState<any>(submission?.data || {});
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState("");
  const [savedAt, setSavedAt] = useState<Date | null>(null);

  const isCompleted = submission?.status === "completed";

  const set = (key: string, value: any) => {
    setData((prev: any) => ({ ...prev, [key]: value }));
  };

  // Auto-save with debounce
  const saveTimer = useRef<any>(null);
  const triggerAutoSave = (newData: any) => {
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => save(newData, "in_progress"), 1200);
  };

  const save = async (payload: any, status: "in_progress" | "completed") => {
    setSaving(true);
    setErr("");
    try {
      const r = await fetch(`/api/onboard/${token}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ template_id: template.id, data: payload, status }),
      });
      const result = await r.json();
      if (!r.ok) { setErr(result.error || "Save failed"); return false; }
      setSavedAt(new Date());
      await onSaved();
      return true;
    } catch (e: any) { setErr(e?.message || "Network error"); return false; }
    finally { setSaving(false); }
  };

  const validate = (): string => {
    return validateForm(template, data);
  };

  const handleContinue = async () => {
    const issue = validate();
    if (issue) { setErr(issue); return; }
    const ok = await save(data, "completed");
    if (ok) onContinue();
  };

  return (
    <Card>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12, marginBottom: 18 }}>
        <div>
          <div style={{ fontFamily: C.mono, fontSize: 10, color: brandColor, letterSpacing: 1.5, textTransform: "uppercase", marginBottom: 6, fontWeight: 700 }}>{template.kind.replace(/_/g, " ")}</div>
          <div style={{ fontFamily: C.display, fontSize: 22, fontWeight: 700, color: C.text, letterSpacing: "-0.01em" }}>{template.name}</div>
          {template.description && <div style={{ fontFamily: C.sans, fontSize: 13.5, color: C.textF, marginTop: 6, lineHeight: 1.55 }}>{template.description}</div>}
        </div>
        {isCompleted && <span style={{ padding: "3px 10px", background: C.green + "15", color: C.green, borderRadius: 12, fontFamily: C.mono, fontSize: 9, fontWeight: 700, letterSpacing: 0.5, textTransform: "uppercase", whiteSpace: "nowrap" }}>✓ Done</span>}
      </div>

      <FormBody template={template} data={data} set={set} brandColor={brandColor} triggerAutoSave={triggerAutoSave} />

      {err && <div style={{ marginTop: 14, padding: "10px 14px", background: C.redL, border: "1px solid rgba(220,38,38,0.25)", borderRadius: 10, fontFamily: C.sans, fontSize: 13, color: C.red }}>{err}</div>}

      <div style={{ marginTop: 24, paddingTop: 18, borderTop: `1px solid ${C.borderL}`, display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
        <div style={{ fontFamily: C.mono, fontSize: 10, color: C.textF, letterSpacing: 0.5 }}>
          {saving ? "Saving…" : savedAt ? `Saved · ${savedAt.toLocaleTimeString()}` : "Auto-saves as you type"}
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          {!isFirst && <SecondaryButton onClick={onBack}>← Back</SecondaryButton>}
          <PrimaryButton brandColor={brandColor} onClick={handleContinue} disabled={saving}>
            {saving ? "Saving…" : (isCompleted ? "Continue →" : "Save & Continue →")}
          </PrimaryButton>
        </div>
      </div>
    </Card>
  );
}

// ────────────────────────────────────────────────────────────────
//  Form body — renders the right inputs for each form_key
// ────────────────────────────────────────────────────────────────
function FormBody({ template, data, set, brandColor, triggerAutoSave }: any) {
  const setAndSave = (key: string, value: any) => {
    set(key, value);
    const newData = { ...data, [key]: value };
    triggerAutoSave(newData);
  };

  switch (template.form_key) {
    case "personal_info": return <PersonalInfoForm data={data} set={setAndSave} brandColor={brandColor} />;
    case "emergency_contact": return <EmergencyContactForm data={data} set={setAndSave} brandColor={brandColor} />;
    case "direct_deposit": return <DirectDepositForm data={data} set={setAndSave} brandColor={brandColor} />;
    case "photo_release": return <PhotoReleaseForm data={data} set={setAndSave} brandColor={brandColor} />;
    case "handbook_ack": return <HandbookAckForm data={data} set={setAndSave} brandColor={brandColor} template={template} />;
  }

  // Custom form
  if (template.kind === "custom_form" && Array.isArray(template.custom_schema)) {
    return <CustomFormBody schema={template.custom_schema} data={data} set={setAndSave} />;
  }

  // Attachment / acknowledgment fallback
  if (template.kind === "attachment" || template.kind === "acknowledgment") {
    return (
      <div>
        {template.download_url && (
          <a href={template.download_url} target="_blank" rel="noopener noreferrer" style={{ display: "block", padding: 16, background: C.bg, border: `1.5px solid ${brandColor}40`, borderRadius: 12, fontFamily: C.sans, fontWeight: 600, fontSize: 14, color: brandColor, textDecoration: "none", textAlign: "center", marginBottom: 18 }}>
            📕 View / download document
          </a>
        )}
        {template.kind === "acknowledgment" && (
          <Checkbox checked={!!data.acknowledged} onChange={v => set("acknowledged", v)} label="I have read and understood this document" brandColor={brandColor} />
        )}
      </div>
    );
  }

  return <div style={{ color: C.textF, fontFamily: C.sans, fontSize: 13 }}>This form type is not yet supported in the candidate portal.</div>;
}

// ════════════════════════════════════════════════════════════════
//  BUILT-IN FORMS
// ════════════════════════════════════════════════════════════════
function PersonalInfoForm({ data, set, brandColor }: any) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <Row>
        <Field label="First name" required><Input value={data.first_name || ""} onChange={v => set("first_name", v)} brandColor={brandColor} /></Field>
        <Field label="Middle name"><Input value={data.middle_name || ""} onChange={v => set("middle_name", v)} brandColor={brandColor} /></Field>
        <Field label="Last name" required><Input value={data.last_name || ""} onChange={v => set("last_name", v)} brandColor={brandColor} /></Field>
      </Row>
      <Row>
        <Field label="Date of birth" required><Input type="date" value={data.dob || ""} onChange={v => set("dob", v)} brandColor={brandColor} /></Field>
        <Field label="SSN" required hint="Encrypted at rest"><Input value={data.ssn || ""} onChange={v => set("ssn", v)} placeholder="XXX-XX-XXXX" brandColor={brandColor} /></Field>
      </Row>
      <Field label="Street address" required><Input value={data.address_line1 || ""} onChange={v => set("address_line1", v)} placeholder="123 Bay Blvd" brandColor={brandColor} /></Field>
      <Field label="Apt / unit"><Input value={data.address_line2 || ""} onChange={v => set("address_line2", v)} brandColor={brandColor} /></Field>
      <Row>
        <Field label="City" required><Input value={data.city || ""} onChange={v => set("city", v)} brandColor={brandColor} /></Field>
        <Field label="State" required><Input value={data.state || ""} onChange={v => set("state", v)} placeholder="OR" brandColor={brandColor} /></Field>
        <Field label="ZIP" required><Input value={data.zip || ""} onChange={v => set("zip", v)} brandColor={brandColor} /></Field>
      </Row>
      <Row>
        <Field label="Phone" required><Input type="tel" value={data.phone || ""} onChange={v => set("phone", v)} placeholder="(541) 555-1234" brandColor={brandColor} /></Field>
        <Field label="Personal email" required><Input type="email" value={data.email || ""} onChange={v => set("email", v)} brandColor={brandColor} /></Field>
      </Row>
    </div>
  );
}

function EmergencyContactForm({ data, set, brandColor }: any) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <p style={{ fontFamily: C.sans, fontSize: 13.5, color: C.textF, lineHeight: 1.55, margin: 0 }}>
        Who should we call if there's an emergency on the job? (Spouse, parent, sibling, close friend.)
      </p>
      <Row>
        <Field label="Full name" required><Input value={data.name || ""} onChange={v => set("name", v)} brandColor={brandColor} /></Field>
        <Field label="Relationship" required><Input value={data.relationship || ""} onChange={v => set("relationship", v)} placeholder="Spouse, parent, friend…" brandColor={brandColor} /></Field>
      </Row>
      <Row>
        <Field label="Phone" required><Input type="tel" value={data.phone || ""} onChange={v => set("phone", v)} placeholder="(541) 555-1234" brandColor={brandColor} /></Field>
        <Field label="Alternate phone"><Input type="tel" value={data.alt_phone || ""} onChange={v => set("alt_phone", v)} brandColor={brandColor} /></Field>
      </Row>
      <Field label="Email"><Input type="email" value={data.email || ""} onChange={v => set("email", v)} brandColor={brandColor} /></Field>
      <Field label="Notes" hint="Allergies, medical info to share, etc.">
        <Textarea value={data.notes || ""} onChange={v => set("notes", v)} brandColor={brandColor} rows={3} />
      </Field>
    </div>
  );
}

function DirectDepositForm({ data, set, brandColor }: any) {
  const enrolled = data.enrolled !== false;
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <div style={{ background: C.bg, border: `1px solid ${C.border}`, borderRadius: 10, padding: 14, display: "flex", gap: 10 }}>
        <Checkbox checked={enrolled} onChange={v => set("enrolled", v)} label="I want to enroll in direct deposit" brandColor={brandColor} />
      </div>

      {enrolled ? (
        <>
          <p style={{ fontFamily: C.sans, fontSize: 13, color: C.textF, lineHeight: 1.55, margin: 0 }}>
            Find these on a check or in your bank app. <strong>Routing</strong> is the 9-digit number; <strong>account</strong> is usually 8-12 digits. Both are encrypted at rest.
          </p>
          <Field label="Bank name" required><Input value={data.bank_name || ""} onChange={v => set("bank_name", v)} placeholder="Wells Fargo, Chase, etc." brandColor={brandColor} /></Field>
          <Row>
            <Field label="Routing number" required><Input value={data.routing_number || ""} onChange={v => set("routing_number", v)} placeholder="9 digits" brandColor={brandColor} /></Field>
            <Field label="Account number" required><Input value={data.account_number || ""} onChange={v => set("account_number", v)} brandColor={brandColor} /></Field>
          </Row>
          <Row>
            <Field label="Account type" required>
              <Select value={data.account_type || ""} onChange={v => set("account_type", v)} brandColor={brandColor}>
                <option value="">Select…</option>
                <option value="checking">Checking</option>
                <option value="savings">Savings</option>
              </Select>
            </Field>
            <Field label="Confirm account #" required hint="Type again to verify">
              <Input value={data.account_number_confirm || ""} onChange={v => set("account_number_confirm", v)} brandColor={brandColor} />
            </Field>
          </Row>
        </>
      ) : (
        <div style={{ padding: 14, background: C.bg, border: `1px solid ${C.border}`, borderRadius: 10, fontFamily: C.sans, fontSize: 13, color: C.textF, lineHeight: 1.55 }}>
          You'll be paid by paper check. You can change this later by contacting your manager.
        </div>
      )}
    </div>
  );
}

function PhotoReleaseForm({ data, set, brandColor }: any) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <p style={{ fontFamily: C.sans, fontSize: 13.5, color: C.textD, lineHeight: 1.65, margin: 0 }}>
        From time to time we take photos and video on the job — for marketing, social media, our website. Your call whether we can include you.
      </p>
      <div style={{ background: C.bg, border: `1px solid ${C.border}`, borderRadius: 10, padding: 14, display: "flex", flexDirection: "column", gap: 10 }}>
        <Radio name="release" value="grant" checked={data.release === "grant"} onChange={() => set("release", "grant")} brandColor={brandColor}
          label="✅ Yes — I grant permission" sublabel="My photo/video can be used in marketing materials, social media, and on company websites." />
        <Radio name="release" value="deny" checked={data.release === "deny"} onChange={() => set("release", "deny")} brandColor={brandColor}
          label="🚫 No — please do not use my image" sublabel="I prefer not to be photographed or filmed for marketing purposes." />
      </div>
      <Field label="Notes (optional)" hint="Any specific exceptions?">
        <Textarea value={data.notes || ""} onChange={v => set("notes", v)} brandColor={brandColor} rows={2} placeholder="e.g. OK for group shots but not solo close-ups" />
      </Field>
    </div>
  );
}

function HandbookAckForm({ data, set, brandColor, template }: any) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <p style={{ fontFamily: C.sans, fontSize: 13.5, color: C.textD, lineHeight: 1.6, margin: 0 }}>
        Please read the company handbook carefully. It covers expectations, safety procedures, time off, and the standards we operate by.
      </p>
      {template.download_url ? (
        <a href={template.download_url} target="_blank" rel="noopener noreferrer" style={{ display: "block", padding: 14, background: C.bg, border: `1.5px solid ${brandColor}50`, borderRadius: 12, fontFamily: C.sans, fontWeight: 600, fontSize: 14, color: brandColor, textDecoration: "none", textAlign: "center" }}>
          📘 Download Employee Handbook
        </a>
      ) : (
        <div style={{ padding: 14, background: C.bg, border: `1px dashed ${C.border}`, borderRadius: 10, fontFamily: C.sans, fontSize: 13, color: C.textF, fontStyle: "italic", textAlign: "center" }}>
          Handbook will be provided by your employer.
        </div>
      )}
      <div style={{ background: C.bg, border: `1px solid ${C.border}`, borderRadius: 10, padding: 14 }}>
        <Checkbox
          checked={!!data.acknowledged}
          onChange={v => set("acknowledged", v)}
          brandColor={brandColor}
          label="I confirm that I have received, read, and understand the company handbook, and agree to follow its policies."
        />
      </div>
    </div>
  );
}

function CustomFormBody({ schema, data, set }: any) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      {(schema || []).map((q: any) => (
        <Field key={q.id} label={q.label} required={q.required}>
          {q.type === "textarea" ? (
            <Textarea value={data[q.id] || ""} onChange={v => set(q.id, v)} brandColor="#0891b2" />
          ) : q.type === "select" ? (
            <Select value={data[q.id] || ""} onChange={v => set(q.id, v)} brandColor="#0891b2">
              <option value="">Select…</option>
              {(q.options || []).map((o: string) => <option key={o} value={o}>{o}</option>)}
            </Select>
          ) : q.type === "checkbox" ? (
            <Checkbox checked={!!data[q.id]} onChange={v => set(q.id, v)} label={q.label} brandColor="#0891b2" />
          ) : (
            <Input type={q.type || "text"} value={data[q.id] || ""} onChange={v => set(q.id, v)} brandColor="#0891b2" />
          )}
        </Field>
      ))}
    </div>
  );
}

// ════════════════════════════════════════════════════════════════
//  REVIEW STEP
// ════════════════════════════════════════════════════════════════
function ReviewStep({ state, brandColor, onJump, onContinue, onBack }: any) {
  return (
    <Card>
      <div style={{ fontFamily: C.mono, fontSize: 10, color: brandColor, letterSpacing: 1.5, textTransform: "uppercase", marginBottom: 6, fontWeight: 700 }}>Step ⋅ Review</div>
      <div style={{ fontFamily: C.display, fontSize: 24, fontWeight: 700, color: C.text, letterSpacing: "-0.01em", marginBottom: 8 }}>One last look</div>
      <p style={{ fontFamily: C.sans, fontSize: 14, color: C.textF, lineHeight: 1.55, marginBottom: 20 }}>
        Make sure everything looks right. Tap any item to edit it before signing.
      </p>

      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {state.templates.map((t: Template, i: number) => {
          const sub = state.submissions.find((s: Submission) => s.template_id === t.id);
          const done = sub?.status === "completed";
          return (
            <button
              key={t.id}
              onClick={() => onJump(1 + i)}
              style={{
                background: C.bg2, border: `1px solid ${C.border}`, borderRadius: 10,
                padding: "12px 14px", textAlign: "left", cursor: "pointer",
                display: "flex", alignItems: "center", gap: 12, transition: "all .15s",
              }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = brandColor; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = C.border; }}
            >
              <span style={{ width: 28, height: 28, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", background: done ? C.green + "15" : C.bg3, color: done ? C.green : C.textF, fontFamily: C.mono, fontWeight: 700, fontSize: 13, flexShrink: 0 }}>
                {done ? "✓" : i + 1}
              </span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontFamily: C.sans, fontWeight: 700, fontSize: 13.5, color: C.text }}>{t.name}</div>
                <div style={{ fontFamily: C.mono, fontSize: 10, color: done ? C.green : C.amberY, letterSpacing: 0.5, marginTop: 2 }}>{done ? "Complete" : "Needs attention"}</div>
              </div>
              <span style={{ color: C.textE, fontSize: 18 }}>›</span>
            </button>
          );
        })}
      </div>

      <div style={{ marginTop: 26, display: "flex", justifyContent: "space-between", gap: 8 }}>
        <SecondaryButton onClick={onBack}>← Back</SecondaryButton>
        <PrimaryButton brandColor={brandColor} onClick={onContinue}>Continue to sign →</PrimaryButton>
      </div>
    </Card>
  );
}

// ════════════════════════════════════════════════════════════════
//  SIGN STEP — typed name + drawn signature + ESIGN consent
// ════════════════════════════════════════════════════════════════
function SignStep({ token, state, brandColor, onComplete, onBack }: any) {
  const [typedName, setTypedName] = useState(state.invitation.candidate_name);
  const [signatureData, setSignatureData] = useState<string>("");
  const [agreed, setAgreed] = useState(false);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  const consentText = `By typing my name and providing my signature below, I, ${state.invitation.candidate_name}, agree that this electronic signature has the same legal effect, validity, and enforceability as a handwritten signature, in accordance with the U.S. ESIGN Act and applicable state laws. I confirm that all information I have provided in this onboarding packet is true and accurate to the best of my knowledge, and I authorize ${state.org.name} to use this information for employment and payroll purposes.`;

  const submit = async () => {
    setErr("");
    if (!typedName.trim()) { setErr("Please type your full legal name."); return; }
    if (!signatureData) { setErr("Please draw your signature in the box."); return; }
    if (!agreed) { setErr("Please confirm you agree to the ESIGN consent."); return; }

    setBusy(true);
    try {
      const r = await fetch(`/api/onboard/${token}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          typed_name: typedName.trim(),
          signature_image_data: signatureData,
          consent_text: consentText,
        }),
      });
      const data = await r.json();
      if (!r.ok) { setErr(data.error || "Signing failed"); return; }
      onComplete();
    } catch (e: any) {
      setErr(e?.message || "Network error");
    } finally { setBusy(false); }
  };

  return (
    <Card>
      <div style={{ fontFamily: C.mono, fontSize: 10, color: brandColor, letterSpacing: 1.5, textTransform: "uppercase", marginBottom: 6, fontWeight: 700 }}>Final step ⋅ Sign</div>
      <div style={{ fontFamily: C.display, fontSize: 26, fontWeight: 700, color: C.text, letterSpacing: "-0.01em", marginBottom: 8 }}>Sign your packet</div>
      <p style={{ fontFamily: C.sans, fontSize: 14, color: C.textF, lineHeight: 1.55, marginBottom: 20 }}>
        Your signature confirms everything you've entered is accurate. This is a legally binding e-signature under the ESIGN Act.
      </p>

      <Field label="Type your full legal name" required>
        <Input value={typedName} onChange={setTypedName} brandColor={brandColor} placeholder="First Middle Last" />
      </Field>

      <div style={{ marginTop: 16 }}>
        <label style={{ fontFamily: C.sans, fontSize: 11, fontWeight: 600, color: C.textD, marginBottom: 5, display: "block" }}>
          Draw your signature <span style={{ color: C.red }}>*</span>
        </label>
        <SignaturePad value={signatureData} onChange={setSignatureData} brandColor={brandColor} />
      </div>

      <div style={{ marginTop: 18, padding: 14, background: C.bg, border: `1px solid ${C.border}`, borderRadius: 10, fontFamily: C.sans, fontSize: 12.5, color: C.textD, lineHeight: 1.65, maxHeight: 130, overflowY: "auto" }} className="o-scroll">
        {consentText}
      </div>

      <div style={{ marginTop: 12 }}>
        <Checkbox checked={agreed} onChange={setAgreed} label="I have read and agree to the above. I understand my electronic signature is legally binding." brandColor={brandColor} />
      </div>

      {err && <div style={{ marginTop: 14, padding: "10px 14px", background: C.redL, border: "1px solid rgba(220,38,38,0.25)", borderRadius: 10, fontFamily: C.sans, fontSize: 13, color: C.red }}>{err}</div>}

      <div style={{ marginTop: 22, display: "flex", justifyContent: "space-between", gap: 8 }}>
        <SecondaryButton onClick={onBack} disabled={busy}>← Back</SecondaryButton>
        <PrimaryButton brandColor={brandColor} onClick={submit} disabled={busy}>
          {busy ? "Submitting…" : "Sign & Submit ✓"}
        </PrimaryButton>
      </div>
    </Card>
  );
}

// ════════════════════════════════════════════════════════════════
//  SIGNATURE PAD
// ════════════════════════════════════════════════════════════════
function SignaturePad({ value, onChange, brandColor }: { value: string; onChange: (v: string) => void; brandColor: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const drawing = useRef(false);
  const lastPt = useRef<{ x: number; y: number } | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ratio = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * ratio;
    canvas.height = rect.height * ratio;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.scale(ratio, ratio);
    ctx.lineWidth = 2.2;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.strokeStyle = "#0c1220";
  }, []);

  const getPt = (e: any): { x: number; y: number } => {
    const canvas = canvasRef.current!;
    const rect = canvas.getBoundingClientRect();
    if (e.touches && e.touches[0]) {
      return { x: e.touches[0].clientX - rect.left, y: e.touches[0].clientY - rect.top };
    }
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  };

  const start = (e: any) => {
    e.preventDefault();
    drawing.current = true;
    lastPt.current = getPt(e);
  };
  const move = (e: any) => {
    if (!drawing.current) return;
    e.preventDefault();
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx || !lastPt.current) return;
    const pt = getPt(e);
    ctx.beginPath();
    ctx.moveTo(lastPt.current.x, lastPt.current.y);
    ctx.lineTo(pt.x, pt.y);
    ctx.stroke();
    lastPt.current = pt;
  };
  const end = () => {
    if (!drawing.current) return;
    drawing.current = false;
    lastPt.current = null;
    const canvas = canvasRef.current;
    if (canvas) onChange(canvas.toDataURL("image/png"));
  };

  const clear = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    onChange("");
  };

  return (
    <div>
      <div style={{ background: "#fff", border: `2px solid ${C.border}`, borderRadius: 10, position: "relative", overflow: "hidden", height: 160 }}>
        <canvas
          ref={canvasRef}
          style={{ width: "100%", height: "100%", touchAction: "none", cursor: "crosshair" }}
          onMouseDown={start}
          onMouseMove={move}
          onMouseUp={end}
          onMouseLeave={end}
          onTouchStart={start}
          onTouchMove={move}
          onTouchEnd={end}
        />
        {!value && (
          <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", pointerEvents: "none", fontFamily: C.sans, fontSize: 13, color: C.textE }}>
            Sign here with your finger or mouse
          </div>
        )}
      </div>
      <button onClick={clear} type="button" style={{ marginTop: 6, fontFamily: C.mono, fontSize: 10, color: C.textF, letterSpacing: 0.5, textTransform: "uppercase", background: "transparent", border: "none", cursor: "pointer", padding: "4px 0" }}>
        ✕ Clear
      </button>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════
//  SUCCESS SCREEN
// ════════════════════════════════════════════════════════════════
function SuccessScreen({ state }: { state: OnboardingState }) {
  const brandColor = state.org.brand_color || "#0891b2";
  return (
    <>
      <style>{FONTS}</style>
      <div style={{ minHeight: "100vh", background: C.bg, display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
        <div className="o-fade o-card" style={{ background: C.bg2, borderRadius: 18, padding: 44, maxWidth: 520, width: "100%", boxShadow: C.shadowL, textAlign: "center" }}>
          <div style={{ width: 72, height: 72, borderRadius: "50%", background: `linear-gradient(135deg, ${brandColor}, ${shadeColor(brandColor, -15)})`, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 22px", fontSize: 32, color: "#fff" }}>
            ✓
          </div>
          <div style={{ fontFamily: C.mono, fontSize: 10, color: brandColor, letterSpacing: 1.8, textTransform: "uppercase", fontWeight: 700, marginBottom: 8 }}>You're all set</div>
          <div style={{ fontFamily: C.display, fontSize: 30, fontWeight: 700, color: C.text, letterSpacing: "-0.02em", marginBottom: 12, lineHeight: 1.1 }}>
            Welcome aboard,<br />
            <span style={{ fontStyle: "italic", color: brandColor }}>{state.invitation.candidate_name.split(" ")[0]}.</span>
          </div>
          <p style={{ fontFamily: C.sans, fontSize: 15, color: C.textD, lineHeight: 1.6, marginBottom: 22 }}>
            Your onboarding packet has been submitted to {state.org.name}. They'll be in touch soon with next steps for your first day.
          </p>
          <div style={{ background: C.bg, border: `1px solid ${C.border}`, borderRadius: 10, padding: 14, fontFamily: C.sans, fontSize: 13, color: C.textF, lineHeight: 1.6 }}>
            We've sent a confirmation to <strong style={{ color: C.text }}>{state.invitation.candidate_email}</strong>. Save it for your records.
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}

// ════════════════════════════════════════════════════════════════
//  PRIMITIVES
// ════════════════════════════════════════════════════════════════
function Card({ children }: { children: React.ReactNode }) {
  return (
    <div className="o-card" style={{ background: C.bg2, borderRadius: 16, padding: 30, boxShadow: C.shadow, border: `1px solid ${C.border}` }}>
      {children}
    </div>
  );
}

function PrimaryButton({ onClick, disabled, children, fullWidth, brandColor }: any) {
  return (
    <button onClick={onClick} disabled={disabled} style={{
      padding: "11px 22px",
      width: fullWidth ? "100%" : "auto",
      background: disabled ? "#cbd5e1" : `linear-gradient(135deg, ${brandColor}, ${shadeColor(brandColor, -15)})`,
      color: "#fff", border: "none", borderRadius: 10,
      fontFamily: C.sans, fontWeight: 700, fontSize: 14,
      cursor: disabled ? "wait" : "pointer",
      boxShadow: disabled ? "none" : `0 4px 14px ${brandColor}40`,
      letterSpacing: -0.1,
    }}>
      {children}
    </button>
  );
}

function SecondaryButton({ onClick, disabled, children }: any) {
  return (
    <button onClick={onClick} disabled={disabled} style={{
      padding: "11px 18px", background: "transparent",
      border: `1px solid ${C.border}`, borderRadius: 10,
      fontFamily: C.sans, fontWeight: 600, fontSize: 13.5, color: C.textD,
      cursor: disabled ? "wait" : "pointer",
    }}>
      {children}
    </button>
  );
}

function Field({ label, hint, required, children }: any) {
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

function Input({ value, onChange, type = "text", placeholder, brandColor }: any) {
  return (
    <input type={type} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
      style={{ width: "100%", padding: "10px 12px", border: `1px solid ${C.border}`, borderRadius: 9, fontFamily: C.sans, fontSize: 14, color: C.text, background: C.bg2, outline: "none" }}
      onFocus={e => (e.target.style.borderColor = brandColor)}
      onBlur={e => (e.target.style.borderColor = C.border)}
    />
  );
}

function Textarea({ value, onChange, placeholder, brandColor, rows = 3 }: any) {
  return (
    <textarea value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} rows={rows}
      style={{ width: "100%", padding: "10px 12px", border: `1px solid ${C.border}`, borderRadius: 9, fontFamily: C.sans, fontSize: 14, lineHeight: 1.5, color: C.text, background: C.bg2, outline: "none", resize: "vertical" }}
      onFocus={e => (e.target.style.borderColor = brandColor)}
      onBlur={e => (e.target.style.borderColor = C.border)}
    />
  );
}

function Select({ value, onChange, children, brandColor }: any) {
  return (
    <select value={value} onChange={e => onChange(e.target.value)}
      style={{ width: "100%", padding: "10px 12px", border: `1px solid ${C.border}`, borderRadius: 9, fontFamily: C.sans, fontSize: 14, color: C.text, background: C.bg2, cursor: "pointer", outline: "none" }}>
      {children}
    </select>
  );
}

function Checkbox({ checked, onChange, label, brandColor }: any) {
  return (
    <label style={{ display: "flex", alignItems: "flex-start", gap: 10, cursor: "pointer" }}>
      <input type="checkbox" checked={checked} onChange={e => onChange(e.target.checked)} style={{ marginTop: 3, accentColor: brandColor, width: 16, height: 16, flexShrink: 0 }} />
      <span style={{ fontFamily: C.sans, fontSize: 13.5, color: C.textD, lineHeight: 1.5 }}>{label}</span>
    </label>
  );
}

function Radio({ name, value, checked, onChange, label, sublabel, brandColor }: any) {
  return (
    <label style={{ display: "flex", alignItems: "flex-start", gap: 10, padding: 8, borderRadius: 8, cursor: "pointer", background: checked ? `${brandColor}10` : "transparent", transition: "background .15s" }}>
      <input type="radio" name={name} value={value} checked={checked} onChange={onChange} style={{ marginTop: 4, accentColor: brandColor, width: 16, height: 16, flexShrink: 0 }} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontFamily: C.sans, fontSize: 13.5, fontWeight: 600, color: C.text }}>{label}</div>
        {sublabel && <div style={{ fontFamily: C.sans, fontSize: 12, color: C.textF, marginTop: 2, lineHeight: 1.5 }}>{sublabel}</div>}
      </div>
    </label>
  );
}

function Footer() {
  return (
    <div style={{ padding: "30px 16px 40px", textAlign: "center" }}>
      <div style={{ fontFamily: C.mono, fontSize: 9, color: C.textE, letterSpacing: 1.5, textTransform: "uppercase" }}>
        Powered by <a href="https://shiftpro.ai" style={{ color: C.textE, textDecoration: "none", fontWeight: 700 }}>ShiftPro</a> · Onboarding portal
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════
//  HELPERS
// ════════════════════════════════════════════════════════════════
function shadeColor(hex: string, percent: number): string {
  // simple hex shade — used for gradient end stops
  let h = hex.replace("#", "");
  if (h.length === 3) h = h.split("").map(c => c + c).join("");
  const num = parseInt(h, 16);
  let r = (num >> 16) + Math.round(2.55 * percent);
  let g = ((num >> 8) & 0xff) + Math.round(2.55 * percent);
  let b = (num & 0xff) + Math.round(2.55 * percent);
  r = Math.max(0, Math.min(255, r));
  g = Math.max(0, Math.min(255, g));
  b = Math.max(0, Math.min(255, b));
  return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
}

function validateForm(template: Template, data: any): string {
  const required = (k: string, label: string) => !data[k]?.toString().trim() ? `${label} is required` : "";

  switch (template.form_key) {
    case "personal_info": {
      const checks = [
        required("first_name", "First name"),
        required("last_name", "Last name"),
        required("dob", "Date of birth"),
        required("ssn", "SSN"),
        required("address_line1", "Street address"),
        required("city", "City"),
        required("state", "State"),
        required("zip", "ZIP"),
        required("phone", "Phone"),
        required("email", "Email"),
      ].filter(Boolean);
      if (checks.length > 0) return checks[0];
      // Light SSN format check (not strict)
      if (data.ssn && data.ssn.replace(/\D/g, "").length < 9) return "SSN should be 9 digits";
      return "";
    }
    case "emergency_contact":
      return required("name", "Contact name")
        || required("relationship", "Relationship")
        || required("phone", "Phone");

    case "direct_deposit": {
      if (data.enrolled === false) return "";
      const checks = [
        required("bank_name", "Bank name"),
        required("routing_number", "Routing number"),
        required("account_number", "Account number"),
        required("account_type", "Account type"),
      ].filter(Boolean);
      if (checks.length > 0) return checks[0];
      if (data.routing_number && data.routing_number.replace(/\D/g, "").length !== 9) return "Routing number must be 9 digits";
      if (data.account_number && data.account_number !== data.account_number_confirm) return "Account numbers don't match";
      return "";
    }
    case "photo_release":
      return data.release ? "" : "Please choose a photo release option";

    case "handbook_ack":
      return data.acknowledged ? "" : "Please confirm you've read the handbook";
  }

  if (template.kind === "acknowledgment") {
    return data.acknowledged ? "" : "Please acknowledge to continue";
  }

  if (template.kind === "custom_form" && Array.isArray(template.custom_schema)) {
    for (const q of template.custom_schema) {
      if (q.required && !data[q.id]) return `${q.label} is required`;
    }
  }

  return "";
}
