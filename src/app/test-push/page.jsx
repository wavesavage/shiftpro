"use client";
import React, { useState, useEffect } from "react";

export default function PushTest() {
  const [results, setResults] = useState([]);
  const [userId, setUserId] = useState("");
  const [orgId, setOrgId] = useState("");
  const [loading, setLoading] = useState(false);
  const [swReg, setSwReg] = useState(null);
  const [permission, setPermission] = useState("unknown");
  const [subscription, setSubscription] = useState(null);

  useEffect(() => {
    try { const o = localStorage.getItem("shiftpro_active_orgid"); if (o) setOrgId(o); } catch (e) {}
    if ("Notification" in window) setPermission(Notification.permission);
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.getRegistration().then(reg => {
        if (reg) { setSwReg(reg); log("SW", { status: "already registered", scope: reg.scope }); }
      });
    }
  }, []);

  const log = (label, data) => setResults(p => [{ label, data, time: new Date().toLocaleTimeString() }, ...p]);

  const testRegisterSW = async () => {
    setLoading(true);
    try {
      const reg = await navigator.serviceWorker.register("/sw.js");
      setSwReg(reg);
      log("Register SW", { status: "success", scope: reg.scope });
    } catch (e) { log("Register SW", { error: e.message }); }
    setLoading(false);
  };

  const testRequestPermission = async () => {
    setLoading(true);
    try {
      const result = await Notification.requestPermission();
      setPermission(result);
      log("Request Permission", { result });
    } catch (e) { log("Request Permission", { error: e.message }); }
    setLoading(false);
  };

  const testGetVapid = async () => {
    setLoading(true);
    try {
      const r = await fetch("/api/push?action=vapid");
      const d = await r.json();
      log("GET VAPID Key", { status: r.status, publicKey: d.publicKey ? d.publicKey.slice(0, 30) + "..." : "MISSING", hasKey: !!d.publicKey });
    } catch (e) { log("GET VAPID Key", { error: e.message }); }
    setLoading(false);
  };

  const testSubscribe = async () => {
    setLoading(true);
    try {
      if (!swReg) throw new Error("Service worker not registered");
      const vapidRes = await fetch("/api/push?action=vapid");
      const { publicKey } = await vapidRes.json();
      if (!publicKey) throw new Error("No VAPID public key from API");

      const padding = "=".repeat((4 - publicKey.length % 4) % 4);
      const base64 = (publicKey + padding).replace(/-/g, "+").replace(/_/g, "/");
      const raw = atob(base64);
      const arr = new Uint8Array(raw.length);
      for (let i = 0; i < raw.length; i++) arr[i] = raw.charCodeAt(i);

      const sub = await swReg.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: arr });
      setSubscription(sub);

      // Save to API
      const saveRes = await fetch("/api/push", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "subscribe", userId: userId || "test-user", subscription: sub.toJSON(), role: "owner" }),
      });
      const saveData = await saveRes.json();
      log("Subscribe + Save", { status: saveRes.status, ok: saveData.ok, endpoint: sub.endpoint.slice(0, 60) + "..." });
    } catch (e) { log("Subscribe", { error: e.message }); }
    setLoading(false);
  };

  const testSendPush = async () => {
    setLoading(true);
    try {
      const r = await fetch("/api/push", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "send",
          targetUserId: userId || "test-user",
          title: "🔔 ShiftPro Test",
          message: "Push notifications are working! " + new Date().toLocaleTimeString(),
          url: "/test-push",
          tag: "test-" + Date.now(),
        }),
      });
      const d = await r.json();
      log("Send Push", { status: r.status, sent: d.sent, failed: d.failed, error: d.error || null });
    } catch (e) { log("Send Push", { error: e.message }); }
    setLoading(false);
  };

  const testSendToOrg = async () => {
    setLoading(true);
    try {
      const r = await fetch("/api/push", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "send",
          targetOrgId: orgId,
          title: "📢 ShiftPro Announcement",
          message: "Test org-wide notification at " + new Date().toLocaleTimeString(),
          tag: "org-test-" + Date.now(),
        }),
      });
      const d = await r.json();
      log("Send to Org", { status: r.status, sent: d.sent, failed: d.failed, error: d.error || null });
    } catch (e) { log("Send to Org", { error: e.message }); }
    setLoading(false);
  };

  return (
    <div style={{ fontFamily: "monospace", padding: 40, maxWidth: 900, margin: "0 auto", background: "#111", color: "#eee", minHeight: "100vh" }}>
      <h1 style={{ color: "#e8b84b", marginBottom: 8 }}>🔔 Push Notifications Diagnostic</h1>

      {/* Status indicators */}
      <div style={{ display: "flex", gap: 12, marginBottom: 24, flexWrap: "wrap" }}>
        <div style={{ padding: "8px 14px", borderRadius: 8, background: "serviceWorker" in (typeof navigator !== "undefined" ? navigator : {}) ? "#065f46" : "#7f1d1d", fontSize: 12 }}>
          SW Support: {"serviceWorker" in (typeof navigator !== "undefined" ? navigator : {}) ? "✅" : "❌"}
        </div>
        <div style={{ padding: "8px 14px", borderRadius: 8, background: swReg ? "#065f46" : "#78350f", fontSize: 12 }}>
          SW Registered: {swReg ? "✅" : "⏳"}
        </div>
        <div style={{ padding: "8px 14px", borderRadius: 8, background: permission === "granted" ? "#065f46" : permission === "denied" ? "#7f1d1d" : "#78350f", fontSize: 12 }}>
          Permission: {permission}
        </div>
        <div style={{ padding: "8px 14px", borderRadius: 8, background: subscription ? "#065f46" : "#78350f", fontSize: 12 }}>
          Subscribed: {subscription ? "✅" : "❌"}
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 24 }}>
        <div>
          <label style={{ display: "block", color: "#888", fontSize: 11, marginBottom: 4 }}>USER ID</label>
          <input value={userId} onChange={e => setUserId(e.target.value)}
            style={{ width: "100%", padding: 10, background: "#222", border: "1px solid #333", borderRadius: 6, color: "#eee", fontFamily: "monospace", fontSize: 12 }}
            placeholder="paste user UUID" />
        </div>
        <div>
          <label style={{ display: "block", color: "#888", fontSize: 11, marginBottom: 4 }}>ORG ID</label>
          <input value={orgId} onChange={e => setOrgId(e.target.value)}
            style={{ width: "100%", padding: 10, background: "#222", border: "1px solid #333", borderRadius: 6, color: "#eee", fontFamily: "monospace", fontSize: 12 }} />
        </div>
      </div>

      <div style={{ display: "flex", gap: 8, marginBottom: 24, flexWrap: "wrap" }}>
        <button onClick={testRegisterSW} disabled={loading} style={{ padding: "10px 16px", background: "#2563eb", border: "none", borderRadius: 6, color: "#fff", fontWeight: 700, cursor: "pointer", fontFamily: "monospace", fontSize: 12 }}>1. Register SW</button>
        <button onClick={testRequestPermission} disabled={loading} style={{ padding: "10px 16px", background: "#7c3aed", border: "none", borderRadius: 6, color: "#fff", fontWeight: 700, cursor: "pointer", fontFamily: "monospace", fontSize: 12 }}>2. Request Permission</button>
        <button onClick={testGetVapid} disabled={loading} style={{ padding: "10px 16px", background: "#0891b2", border: "none", borderRadius: 6, color: "#fff", fontWeight: 700, cursor: "pointer", fontFamily: "monospace", fontSize: 12 }}>3. Get VAPID Key</button>
        <button onClick={testSubscribe} disabled={loading || !swReg || permission !== "granted"} style={{ padding: "10px 16px", background: "#e07b00", border: "none", borderRadius: 6, color: "#fff", fontWeight: 700, cursor: "pointer", fontFamily: "monospace", fontSize: 12, opacity: (!swReg || permission !== "granted") ? 0.4 : 1 }}>4. Subscribe</button>
        <button onClick={testSendPush} disabled={loading || !subscription} style={{ padding: "10px 16px", background: "#10b981", border: "none", borderRadius: 6, color: "#fff", fontWeight: 700, cursor: "pointer", fontFamily: "monospace", fontSize: 12, opacity: !subscription ? 0.4 : 1 }}>5. Send Test Push</button>
        <button onClick={testSendToOrg} disabled={loading || !orgId} style={{ padding: "10px 16px", background: "#ef4444", border: "none", borderRadius: 6, color: "#fff", fontWeight: 700, cursor: "pointer", fontFamily: "monospace", fontSize: 12, opacity: !orgId ? 0.4 : 1 }}>6. Send to Org</button>
      </div>

      {loading && <div style={{ color: "#e07b00", marginBottom: 16 }}>⏳ Running...</div>}

      {results.map((r, i) => (
        <div key={i} style={{ marginBottom: 8, padding: 12, background: "#1a1a2e", borderRadius: 8, border: "1px solid " + (JSON.stringify(r.data).includes('"error"') && !JSON.stringify(r.data).includes("null") ? "#ef4444" : "#10b981") }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
            <span style={{ color: "#888", fontSize: 11 }}>{r.label}</span>
            <span style={{ color: "#555", fontSize: 10 }}>{r.time}</span>
          </div>
          <pre style={{ color: "#eee", fontSize: 11, whiteSpace: "pre-wrap", wordBreak: "break-all", margin: 0 }}>
            {JSON.stringify(r.data, null, 2)}
          </pre>
        </div>
      ))}

      <div style={{ marginTop: 32, padding: 16, background: "#1a1a2e", borderRadius: 8, border: "1px solid #333" }}>
        <div style={{ color: "#e8b84b", fontWeight: 700, marginBottom: 8 }}>SETUP STEPS:</div>
        <ol style={{ color: "#888", fontSize: 12, lineHeight: 2.2, paddingLeft: 20 }}>
          <li>Run <code style={{ color: "#e8b84b" }}>npx web-push generate-vapid-keys</code> in your repo</li>
          <li>Add keys to .env.local: NEXT_PUBLIC_VAPID_PUBLIC_KEY and VAPID_PRIVATE_KEY</li>
          <li>Add keys to Vercel env vars too</li>
          <li>Run <code style={{ color: "#e8b84b" }}>npm install web-push</code></li>
          <li>Deploy, then come here and run tests 1→6 in order</li>
          <li>You should see a native push notification pop up on step 5</li>
        </ol>
      </div>
    </div>
  );
}
