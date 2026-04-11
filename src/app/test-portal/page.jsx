"use client";
import React, { useState, useEffect } from "react";

export default function PortalSettingsTest() {
  const [orgId, setOrgId] = useState("");
  const [getResult, setGetResult] = useState(null);
  const [postResult, setPostResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [testSettings, setTestSettings] = useState({ showEarnings: true });

  // Auto-detect orgId from localStorage
  useEffect(() => {
    try {
      const cached = localStorage.getItem("shiftpro_active_orgid");
      if (cached) setOrgId(cached);
    } catch (e) {}
  }, []);

  const testGet = async () => {
    setLoading(true);
    setGetResult(null);
    try {
      const url = "/api/portal-settings?orgId=" + orgId;
      const r = await fetch(url, { cache: "no-store" });
      const status = r.status;
      const text = await r.text();
      let json = null;
      try { json = JSON.parse(text); } catch (e) {}
      setGetResult({ status, text: text.slice(0, 500), json, url });
    } catch (e) {
      setGetResult({ error: e.message });
    }
    setLoading(false);
  };

  const testPost = async () => {
    setLoading(true);
    setPostResult(null);
    const body = { orgId, portalSettings: testSettings };
    try {
      const r = await fetch("/api/portal-settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const status = r.status;
      const text = await r.text();
      let json = null;
      try { json = JSON.parse(text); } catch (e) {}
      setPostResult({ status, text: text.slice(0, 500), json, sentBody: body });
    } catch (e) {
      setPostResult({ error: e.message });
    }
    setLoading(false);
  };

  const testDirectSupabase = async () => {
    setLoading(true);
    try {
      const { createClient } = await import("@supabase/supabase-js");
      const sb = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
      );
      const { data, error } = await sb
        .from("organizations")
        .select("id, name, portal_settings")
        .eq("id", orgId)
        .single();
      setGetResult({
        source: "direct_supabase_anon_key",
        data,
        error: error ? { message: error.message, details: error.details, hint: error.hint, code: error.code } : null,
      });
    } catch (e) {
      setGetResult({ source: "direct_supabase", error: e.message });
    }
    setLoading(false);
  };

  return (
    <div style={{ fontFamily: "monospace", padding: 40, maxWidth: 800, margin: "0 auto", background: "#111", color: "#eee", minHeight: "100vh" }}>
      <h1 style={{ color: "#e07b00", marginBottom: 8 }}>🔧 Portal Settings Diagnostic</h1>
      <p style={{ color: "#888", marginBottom: 24 }}>This page tests the exact API calls that the employee portal makes.</p>

      {/* Org ID */}
      <div style={{ marginBottom: 24 }}>
        <label style={{ display: "block", color: "#888", fontSize: 11, marginBottom: 4 }}>ORG ID</label>
        <input
          value={orgId}
          onChange={(e) => setOrgId(e.target.value)}
          style={{ width: "100%", padding: "10px", background: "#222", border: "1px solid #333", borderRadius: 6, color: "#eee", fontFamily: "monospace", fontSize: 13 }}
          placeholder="paste your org ID here"
        />
        {orgId && <div style={{ color: "#10b981", fontSize: 11, marginTop: 4 }}>✓ Org ID loaded: {orgId}</div>}
        {!orgId && <div style={{ color: "#ef4444", fontSize: 11, marginTop: 4 }}>⚠ No org ID found in localStorage. Paste it manually.</div>}
      </div>

      {/* Test Settings */}
      <div style={{ marginBottom: 24, padding: 16, background: "#1a1a2e", borderRadius: 8, border: "1px solid #333" }}>
        <div style={{ color: "#888", fontSize: 11, marginBottom: 8 }}>TEST SETTINGS TO SAVE</div>
        <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer" }}>
          <input
            type="checkbox"
            checked={testSettings.showEarnings}
            onChange={(e) => setTestSettings((p) => ({ ...p, showEarnings: e.target.checked }))}
          />
          <span>showEarnings: {String(testSettings.showEarnings)}</span>
        </label>
      </div>

      {/* Action buttons */}
      <div style={{ display: "flex", gap: 8, marginBottom: 24, flexWrap: "wrap" }}>
        <button onClick={testGet} disabled={!orgId || loading}
          style={{ padding: "10px 20px", background: "#2563eb", border: "none", borderRadius: 6, color: "#fff", fontWeight: 700, cursor: "pointer", fontFamily: "monospace" }}>
          1. GET /api/portal-settings
        </button>
        <button onClick={testPost} disabled={!orgId || loading}
          style={{ padding: "10px 20px", background: "#e07b00", border: "none", borderRadius: 6, color: "#fff", fontWeight: 700, cursor: "pointer", fontFamily: "monospace" }}>
          2. POST /api/portal-settings
        </button>
        <button onClick={() => { testPost().then(() => setTimeout(testGet, 500)); }} disabled={!orgId || loading}
          style={{ padding: "10px 20px", background: "#7c3aed", border: "none", borderRadius: 6, color: "#fff", fontWeight: 700, cursor: "pointer", fontFamily: "monospace" }}>
          3. POST then GET (full round-trip)
        </button>
        <button onClick={testDirectSupabase} disabled={!orgId || loading}
          style={{ padding: "10px 20px", background: "#10b981", border: "none", borderRadius: 6, color: "#fff", fontWeight: 700, cursor: "pointer", fontFamily: "monospace" }}>
          4. Direct Supabase query
        </button>
      </div>

      {loading && <div style={{ color: "#e07b00", marginBottom: 16 }}>⏳ Loading...</div>}

      {/* GET Result */}
      {getResult && (
        <div style={{ marginBottom: 16, padding: 16, background: "#1a1a2e", borderRadius: 8, border: "1px solid " + (getResult.error || getResult.status >= 400 ? "#ef4444" : "#10b981") }}>
          <div style={{ color: "#888", fontSize: 11, marginBottom: 8 }}>GET RESULT</div>
          <pre style={{ color: "#eee", fontSize: 12, whiteSpace: "pre-wrap", wordBreak: "break-all" }}>
            {JSON.stringify(getResult, null, 2)}
          </pre>
        </div>
      )}

      {/* POST Result */}
      {postResult && (
        <div style={{ marginBottom: 16, padding: 16, background: "#1a1a2e", borderRadius: 8, border: "1px solid " + (postResult.error || postResult.status >= 400 ? "#ef4444" : "#10b981") }}>
          <div style={{ color: "#888", fontSize: 11, marginBottom: 8 }}>POST RESULT</div>
          <pre style={{ color: "#eee", fontSize: 12, whiteSpace: "pre-wrap", wordBreak: "break-all" }}>
            {JSON.stringify(postResult, null, 2)}
          </pre>
        </div>
      )}

      {/* Instructions */}
      <div style={{ marginTop: 32, padding: 16, background: "#1a1a2e", borderRadius: 8, border: "1px solid #333" }}>
        <div style={{ color: "#e07b00", fontWeight: 700, marginBottom: 8 }}>WHAT TO TEST:</div>
        <ol style={{ color: "#888", fontSize: 13, lineHeight: 2, paddingLeft: 20 }}>
          <li>Click "GET" — should show current settings from database</li>
          <li>Uncheck showEarnings checkbox above, then click "POST" — should show ok:true</li>
          <li>Click "GET" again — should now show showEarnings:false</li>
          <li>If GET always shows defaults, click "Direct Supabase query" — this tells us if the column exists</li>
          <li>Screenshot the results and share them</li>
        </ol>
      </div>
    </div>
  );
}
