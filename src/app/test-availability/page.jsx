"use client";
import React, { useState, useEffect } from "react";

export default function TestAvailability() {
  const [userId, setUserId] = useState("");
  const [orgId, setOrgId] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    try {
      const o = localStorage.getItem("shiftpro_active_orgid");
      if (o) setOrgId(o);
      // Try to get user ID from cached session
      const keys = Object.keys(localStorage).filter(k => k.startsWith("shiftpro_cached_emp_"));
      if (keys.length > 0) {
        const cached = JSON.parse(localStorage.getItem(keys[0]));
        if (cached?.id) setUserId(cached.id);
      }
    } catch (e) {}
  }, []);

  const log = (label, data, isError) => {
    setResults(p => [{ label, data, time: new Date().toLocaleTimeString(), isError }, ...p]);
  };

  // Step 1: Load current availability from API
  const testLoad = async () => {
    setLoading(true);
    try {
      const r = await fetch(`/api/availability?userId=${userId}&_t=${Date.now()}`);
      const d = await r.json();
      log("1. LOAD from API", {
        status: r.status,
        count: d.availability?.length || 0,
        raw: d.availability || d.error || "empty",
      }, !r.ok);
    } catch (e) {
      log("1. LOAD from API", { error: e.message }, true);
    }
    setLoading(false);
  };

  // Step 2: Save test data — Mon=available custom hours, Tue=available all day, Wed=unavailable
  const testSave = async () => {
    setLoading(true);
    try {
      const testRows = [
        { day_of_week: "Mon", status: "available", recurring: true, avail_from: 10, avail_to: 18 },
        { day_of_week: "Tue", status: "available", recurring: true, avail_from: null, avail_to: null },
        { day_of_week: "Wed", status: "unavailable", recurring: true, avail_from: null, avail_to: null },
        { day_of_week: "Thu", status: "available", recurring: true, avail_from: 14, avail_to: 22 },
        { day_of_week: "Fri", status: "available", recurring: true, avail_from: null, avail_to: null },
      ];

      log("2a. SAVING these rows", testRows);

      const r = await fetch("/api/availability", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, orgId, rows: testRows }),
      });
      const d = await r.json();
      log("2b. SAVE result", { status: r.status, response: d }, !r.ok);
    } catch (e) {
      log("2b. SAVE result", { error: e.message }, true);
    }
    setLoading(false);
  };

  // Step 3: Re-load after save to verify persistence
  const testVerify = async () => {
    setLoading(true);
    try {
      const r = await fetch(`/api/availability?userId=${userId}&_t=${Date.now()}`);
      const d = await r.json();

      const summary = (d.availability || []).map(a => ({
        day: a.day_of_week,
        status: a.status,
        from: a.avail_from,
        to: a.avail_to,
        allDay: a.avail_from === null && a.avail_to === null,
      }));

      // Check expectations
      const mon = summary.find(s => s.day === "Mon");
      const tue = summary.find(s => s.day === "Tue");
      const thu = summary.find(s => s.day === "Thu");

      const checks = {
        "Mon has from=10": mon?.from === 10,
        "Mon has to=18": mon?.to === 18,
        "Mon allDay=false": mon?.allDay === false,
        "Tue allDay=true": tue?.allDay === true,
        "Tue from=null": tue?.from === null,
        "Thu has from=14": thu?.from === 14,
        "Thu has to=22": thu?.to === 22,
      };

      const allPass = Object.values(checks).every(Boolean);

      log("3. VERIFY after reload", {
        status: r.status,
        allTestsPass: allPass ? "✅ ALL PASS" : "❌ SOME FAILED",
        checks,
        data: summary,
      }, !allPass);
    } catch (e) {
      log("3. VERIFY after reload", { error: e.message }, true);
    }
    setLoading(false);
  };

  // Step 4: Direct Supabase check via service role
  const testDirect = async () => {
    setLoading(true);
    try {
      const r = await fetch(`/api/availability?userId=${userId}&direct=true&_t=${Date.now()}`);
      const d = await r.json();
      log("4. DIRECT DB query", {
        status: r.status,
        data: d,
      }, !r.ok);
    } catch (e) {
      log("4. DIRECT DB query", { error: e.message }, true);
    }
    setLoading(false);
  };

  return (
    <div style={{ fontFamily: "monospace", padding: 40, maxWidth: 900, margin: "0 auto", background: "#111", color: "#eee", minHeight: "100vh" }}>
      <h1 style={{ color: "#e8b84b", marginBottom: 8 }}>📋 Availability Diagnostic</h1>
      <p style={{ color: "#888", fontSize: 12, marginBottom: 24 }}>Tests the full save → load → verify cycle for availability data</p>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 24 }}>
        <div>
          <label style={{ display: "block", color: "#888", fontSize: 11, marginBottom: 4 }}>USER ID</label>
          <input value={userId} onChange={e => setUserId(e.target.value)}
            style={{ width: "100%", padding: 10, background: "#222", border: "1px solid #333", borderRadius: 6, color: "#eee", fontFamily: "monospace", fontSize: 12 }}
            placeholder="paste employee UUID" />
        </div>
        <div>
          <label style={{ display: "block", color: "#888", fontSize: 11, marginBottom: 4 }}>ORG ID</label>
          <input value={orgId} onChange={e => setOrgId(e.target.value)}
            style={{ width: "100%", padding: 10, background: "#222", border: "1px solid #333", borderRadius: 6, color: "#eee", fontFamily: "monospace", fontSize: 12 }} />
        </div>
      </div>

      <div style={{ display: "flex", gap: 8, marginBottom: 24, flexWrap: "wrap" }}>
        <button onClick={testLoad} disabled={loading || !userId} style={{ padding: "10px 16px", background: "#2563eb", border: "none", borderRadius: 6, color: "#fff", fontWeight: 700, cursor: "pointer", fontFamily: "monospace", fontSize: 12, opacity: !userId ? 0.4 : 1 }}>
          1. Load Current
        </button>
        <button onClick={testSave} disabled={loading || !userId} style={{ padding: "10px 16px", background: "#e07b00", border: "none", borderRadius: 6, color: "#fff", fontWeight: 700, cursor: "pointer", fontFamily: "monospace", fontSize: 12, opacity: !userId ? 0.4 : 1 }}>
          2. Save Test Data
        </button>
        <button onClick={testVerify} disabled={loading || !userId} style={{ padding: "10px 16px", background: "#10b981", border: "none", borderRadius: 6, color: "#fff", fontWeight: 700, cursor: "pointer", fontFamily: "monospace", fontSize: 12, opacity: !userId ? 0.4 : 1 }}>
          3. Verify Persistence
        </button>
        <button onClick={testDirect} disabled={loading || !userId} style={{ padding: "10px 16px", background: "#7c3aed", border: "none", borderRadius: 6, color: "#fff", fontWeight: 700, cursor: "pointer", fontFamily: "monospace", fontSize: 12, opacity: !userId ? 0.4 : 1 }}>
          4. Direct DB Check
        </button>
      </div>

      <div style={{ background: "#1a1a2e", border: "1px solid #333", borderRadius: 8, padding: 16, marginBottom: 24, fontSize: 11, color: "#888" }}>
        <strong style={{ color: "#e8b84b" }}>Test plan:</strong><br />
        Step 1 — Load what's currently in the DB<br />
        Step 2 — Save: Mon=10am-6pm, Tue=All Day, Wed=Off, Thu=2pm-10pm, Fri=All Day<br />
        Step 3 — Reload and verify Mon has from=10/to=18, Tue has null/null (All Day), Thu has from=14/to=22<br />
        Step 4 — Raw DB query to see exactly what's stored<br />
        <br />
        If Step 2 shows an error → the API save route is broken<br />
        If Step 3 shows values don't match → data isn't persisting correctly
      </div>

      {loading && <div style={{ color: "#e07b00", marginBottom: 16 }}>⏳ Running...</div>}

      {results.map((r, i) => (
        <div key={i} style={{ marginBottom: 8, padding: 12, background: "#1a1a2e", borderRadius: 8, border: "1px solid " + (r.isError ? "#ef4444" : "#10b981") }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
            <span style={{ color: r.isError ? "#ef4444" : "#10b981", fontSize: 11, fontWeight: 700 }}>{r.label}</span>
            <span style={{ color: "#555", fontSize: 10 }}>{r.time}</span>
          </div>
          <pre style={{ color: "#eee", fontSize: 11, whiteSpace: "pre-wrap", wordBreak: "break-all", margin: 0 }}>
            {JSON.stringify(r.data, null, 2)}
          </pre>
        </div>
      ))}
    </div>
  );
}
