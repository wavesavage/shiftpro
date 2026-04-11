"use client";
import React, { useState, useEffect } from "react";

export default function DocumentsTest() {
  const [userId, setUserId] = useState("");
  const [orgId, setOrgId] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    try { const o = localStorage.getItem("shiftpro_active_orgid"); if (o) setOrgId(o); } catch (e) {}
  }, []);

  const log = (label, data) => setResults(p => [...p, { label, data, time: new Date().toLocaleTimeString() }]);
  const clear = () => setResults([]);

  const testList = async () => {
    setLoading(true);
    try {
      const r = await fetch(`/api/documents?userId=${userId}&_t=${Date.now()}`, { cache: "no-store" });
      const d = await r.json();
      log("GET /api/documents", { status: r.status, count: d.documents?.length || 0, documents: (d.documents || []).map(doc => ({ id: doc.id, name: doc.name, category: doc.category, file_name: doc.file_name, file_size: doc.file_size, uploaded_by: doc.uploaded_by, storage_path: doc.storage_path, created_at: doc.created_at })) });
    } catch (e) { log("GET ERROR", { error: e.message }); }
    setLoading(false);
  };

  const testUpload = async () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".pdf,.jpg,.jpeg,.png,.doc,.docx";
    input.onchange = async (e) => {
      const file = e.target.files?.[0];
      if (!file) return;
      setLoading(true);
      try {
        const fd = new FormData();
        fd.append("file", file);
        fd.append("userId", userId);
        fd.append("orgId", orgId);
        fd.append("name", "Test Document - " + file.name);
        fd.append("category", "other");
        fd.append("notes", "Uploaded via diagnostic test page");
        const r = await fetch("/api/documents", { method: "POST", body: fd });
        const d = await r.json();
        log("POST /api/documents", { status: r.status, ok: r.ok, document: d.document ? { id: d.document.id, name: d.document.name, storage_path: d.document.storage_path } : null, error: d.error || null });
      } catch (e) { log("UPLOAD ERROR", { error: e.message }); }
      setLoading(false);
    };
    input.click();
  };

  const testDownload = async () => {
    setLoading(true);
    try {
      const r = await fetch(`/api/documents?userId=${userId}&_t=${Date.now()}`, { cache: "no-store" });
      const d = await r.json();
      const doc = d.documents?.[0];
      if (!doc) { log("DOWNLOAD", { error: "No documents found" }); setLoading(false); return; }
      const r2 = await fetch(`/api/documents?userId=${userId}&action=download&docId=${doc.id}`);
      const d2 = await r2.json();
      log("DOWNLOAD " + doc.name, { status: r2.status, hasUrl: !!d2.url, url: d2.url?.slice(0, 80) + "...", error: d2.error || null });
      if (d2.url) window.open(d2.url, "_blank");
    } catch (e) { log("DOWNLOAD ERROR", { error: e.message }); }
    setLoading(false);
  };

  const testStorageBucket = async () => {
    setLoading(true);
    try {
      const { createClient } = await import("@supabase/supabase-js");
      const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
      const { data, error } = await sb.storage.from("employee-documents").list(userId, { limit: 10 });
      log("STORAGE BUCKET LIST", { files: (data || []).map(f => ({ name: f.name, size: f.metadata?.size })), error: error?.message || null });
    } catch (e) { log("STORAGE ERROR", { error: e.message }); }
    setLoading(false);
  };

  const testDbTable = async () => {
    setLoading(true);
    try {
      const { createClient } = await import("@supabase/supabase-js");
      const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
      const { data, error } = await sb.from("employee_documents").select("id, name, category, file_name, storage_path, uploaded_by, created_at").eq("user_id", userId).order("created_at", { ascending: false }).limit(10);
      log("DB TABLE QUERY", { rows: data?.length || 0, data, error: error ? { message: error.message, hint: error.hint, code: error.code } : null });
    } catch (e) { log("DB ERROR", { error: e.message }); }
    setLoading(false);
  };

  return (
    <div style={{ fontFamily: "monospace", padding: 40, maxWidth: 900, margin: "0 auto", background: "#111", color: "#eee", minHeight: "100vh" }}>
      <h1 style={{ color: "#0891b2", marginBottom: 8 }}>📁 Documents System Diagnostic</h1>
      <p style={{ color: "#888", marginBottom: 24 }}>Tests upload, download, storage, and database for employee documents.</p>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 24 }}>
        <div>
          <label style={{ display: "block", color: "#888", fontSize: 11, marginBottom: 4 }}>EMPLOYEE USER ID *</label>
          <input value={userId} onChange={e => setUserId(e.target.value)}
            style={{ width: "100%", padding: 10, background: "#222", border: "1px solid #333", borderRadius: 6, color: "#eee", fontFamily: "monospace", fontSize: 12 }}
            placeholder="paste employee UUID here" />
        </div>
        <div>
          <label style={{ display: "block", color: "#888", fontSize: 11, marginBottom: 4 }}>ORG ID</label>
          <input value={orgId} onChange={e => setOrgId(e.target.value)}
            style={{ width: "100%", padding: 10, background: "#222", border: "1px solid #333", borderRadius: 6, color: "#eee", fontFamily: "monospace", fontSize: 12 }}
            placeholder="auto-loaded from localStorage" />
        </div>
      </div>

      <div style={{ display: "flex", gap: 8, marginBottom: 24, flexWrap: "wrap" }}>
        <button onClick={testList} disabled={!userId || loading} style={{ padding: "10px 16px", background: "#2563eb", border: "none", borderRadius: 6, color: "#fff", fontWeight: 700, cursor: "pointer", fontFamily: "monospace", fontSize: 12 }}>1. List Documents</button>
        <button onClick={testUpload} disabled={!userId || loading} style={{ padding: "10px 16px", background: "#e07b00", border: "none", borderRadius: 6, color: "#fff", fontWeight: 700, cursor: "pointer", fontFamily: "monospace", fontSize: 12 }}>2. Test Upload</button>
        <button onClick={testDownload} disabled={!userId || loading} style={{ padding: "10px 16px", background: "#10b981", border: "none", borderRadius: 6, color: "#fff", fontWeight: 700, cursor: "pointer", fontFamily: "monospace", fontSize: 12 }}>3. Download First Doc</button>
        <button onClick={testStorageBucket} disabled={!userId || loading} style={{ padding: "10px 16px", background: "#7c3aed", border: "none", borderRadius: 6, color: "#fff", fontWeight: 700, cursor: "pointer", fontFamily: "monospace", fontSize: 12 }}>4. Check Storage Bucket</button>
        <button onClick={testDbTable} disabled={!userId || loading} style={{ padding: "10px 16px", background: "#0891b2", border: "none", borderRadius: 6, color: "#fff", fontWeight: 700, cursor: "pointer", fontFamily: "monospace", fontSize: 12 }}>5. Check DB Table</button>
        <button onClick={clear} style={{ padding: "10px 16px", background: "#333", border: "none", borderRadius: 6, color: "#888", fontWeight: 700, cursor: "pointer", fontFamily: "monospace", fontSize: 12 }}>Clear</button>
      </div>

      {loading && <div style={{ color: "#e07b00", marginBottom: 16 }}>⏳ Running...</div>}

      {results.map((r, i) => (
        <div key={i} style={{ marginBottom: 12, padding: 16, background: "#1a1a2e", borderRadius: 8, border: "1px solid " + (JSON.stringify(r.data).includes("error") && !JSON.stringify(r.data).includes("null") ? "#ef4444" : "#10b981") }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
            <span style={{ color: "#888", fontSize: 11 }}>{r.label}</span>
            <span style={{ color: "#555", fontSize: 10 }}>{r.time}</span>
          </div>
          <pre style={{ color: "#eee", fontSize: 11, whiteSpace: "pre-wrap", wordBreak: "break-all", margin: 0 }}>
            {JSON.stringify(r.data, null, 2)}
          </pre>
        </div>
      ))}

      <div style={{ marginTop: 32, padding: 16, background: "#1a1a2e", borderRadius: 8, border: "1px solid #333" }}>
        <div style={{ color: "#0891b2", fontWeight: 700, marginBottom: 8 }}>HOW TO TEST:</div>
        <ol style={{ color: "#888", fontSize: 12, lineHeight: 2, paddingLeft: 20 }}>
          <li>Get an employee UUID from Staff tab → click employee → copy their ID from the URL or drawer</li>
          <li>Paste it in the Employee User ID field</li>
          <li>Click "List Documents" — shows all docs for that employee</li>
          <li>Click "Test Upload" — select a file to upload to that employee's record</li>
          <li>Click "List Documents" again — new doc should appear</li>
          <li>Click "Download First Doc" — should open the file in a new tab</li>
          <li>Click "Check Storage Bucket" — shows raw files in Supabase Storage</li>
          <li>Click "Check DB Table" — shows raw database records</li>
        </ol>
      </div>
    </div>
  );
}
