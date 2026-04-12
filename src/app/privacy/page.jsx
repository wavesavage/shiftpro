"use client";

export default function PrivacyPage() {
  const S = {
    page: { minHeight: "100vh", background: "#f9f8f6", fontFamily: "'Segoe UI', system-ui, sans-serif", color: "#1a1a2e" },
    header: { background: "#0c1220", padding: "40px 24px", textAlign: "center" },
    logo: { fontFamily: "monospace", fontSize: 10, letterSpacing: 3, color: "#e8b84b", marginBottom: 8 },
    title: { fontSize: 28, fontWeight: 800, color: "#fff", margin: 0 },
    date: { fontSize: 12, color: "#64748b", marginTop: 8 },
    content: { maxWidth: 720, margin: "0 auto", padding: "40px 24px 80px", lineHeight: 1.8, fontSize: 15 },
    h2: { fontSize: 20, fontWeight: 700, color: "#1a1a2e", marginTop: 36, marginBottom: 12 },
    h3: { fontSize: 16, fontWeight: 700, color: "#1a1a2e", marginTop: 24, marginBottom: 8 },
    p: { color: "#374151", marginBottom: 14 },
    ul: { paddingLeft: 24, color: "#374151", marginBottom: 14 },
    link: { color: "#6366f1", textDecoration: "none" },
    back: { display: "inline-block", marginBottom: 24, padding: "8px 16px", background: "#6366f1", color: "#fff", borderRadius: 8, textDecoration: "none", fontSize: 13, fontWeight: 600 },
    table: { width: "100%", borderCollapse: "collapse", marginBottom: 14, fontSize: 14 },
    th: { textAlign: "left", padding: "10px 12px", background: "#f1f5f9", borderBottom: "2px solid #e2e8f0", fontWeight: 700, fontSize: 13 },
    td: { padding: "10px 12px", borderBottom: "1px solid #e2e8f0", fontSize: 13 },
  };

  return (
    <div style={S.page}>
      <div style={S.header}>
        <div style={S.logo}>SHIFTPRO.AI</div>
        <h1 style={S.title}>Privacy Policy</h1>
        <div style={S.date}>Last Updated: April 11, 2026</div>
      </div>
      <div style={S.content}>
        <a href="/" style={S.back}>← Back to ShiftPro</a>

        <h2 style={S.h2}>1. Introduction</h2>
        <p style={S.p}>Bayscapes Management Enterprises ("we," "us," "our") operates ShiftPro.ai. This Privacy Policy explains how we collect, use, store, and protect your information when you use our workforce management platform.</p>
        <p style={S.p}>We are committed to protecting your privacy and handling your data responsibly. By using ShiftPro.ai, you consent to the practices described in this policy.</p>

        <h2 style={S.h2}>2. Information We Collect</h2>
        <h3 style={S.h3}>2.1 Information You Provide</h3>
        <table style={S.table}>
          <thead>
            <tr><th style={S.th}>Data Type</th><th style={S.th}>Examples</th><th style={S.th}>Purpose</th></tr>
          </thead>
          <tbody>
            <tr><td style={S.td}>Account Information</td><td style={S.td}>Name, email, password</td><td style={S.td}>Authentication & account management</td></tr>
            <tr><td style={S.td}>Employee Profiles</td><td style={S.td}>Name, phone, role, department, hire date, pay rate</td><td style={S.td}>Workforce management</td></tr>
            <tr><td style={S.td}>Documents</td><td style={S.td}>ID copies, W-4s, certifications</td><td style={S.td}>Employee file management</td></tr>
            <tr><td style={S.td}>Messages</td><td style={S.td}>Chat messages between staff and managers</td><td style={S.td}>Team communication</td></tr>
            <tr><td style={S.td}>Schedule Data</td><td style={S.td}>Shifts, availability, time-off requests</td><td style={S.td}>Scheduling & time tracking</td></tr>
            <tr><td style={S.td}>Clock Events</td><td style={S.td}>Clock in/out times, break times</td><td style={S.td}>Time tracking & payroll</td></tr>
          </tbody>
        </table>

        <h3 style={S.h3}>2.2 Information Collected Automatically</h3>
        <ul style={S.ul}>
          <li><strong>Device information:</strong> Browser type, operating system, screen size</li>
          <li><strong>Usage data:</strong> Pages visited, features used, timestamps</li>
          <li><strong>Location data:</strong> GPS coordinates when geofencing is enabled for clock-in (only with employee consent)</li>
          <li><strong>Push notification tokens:</strong> Device identifiers for sending notifications</li>
        </ul>

        <h2 style={S.h2}>3. How We Use Your Information</h2>
        <ul style={S.ul}>
          <li>Providing and operating the ShiftPro.ai service</li>
          <li>Managing employee schedules, time tracking, and communication</li>
          <li>Sending notifications about schedule changes, shift swaps, and messages</li>
          <li>Processing payments for subscription plans</li>
          <li>Improving the Service and developing new features</li>
          <li>Responding to support requests</li>
          <li>Complying with legal obligations</li>
        </ul>
        <p style={S.p}>We do <strong>not</strong> sell your personal information to third parties. We do <strong>not</strong> use your data for advertising. We do <strong>not</strong> share employee data with anyone other than the employer who manages their account.</p>

        <h2 style={S.h2}>4. Data Storage & Security</h2>
        <p style={S.p}>Your data is stored on secure cloud infrastructure provided by Supabase (PostgreSQL databases) and Vercel (application hosting), both located in the United States. We implement industry-standard security measures including:</p>
        <ul style={S.ul}>
          <li>Encryption in transit (TLS/HTTPS)</li>
          <li>Encryption at rest for databases and file storage</li>
          <li>Row-level security policies on database tables</li>
          <li>Service role key separation (server-side only)</li>
          <li>Rate limiting on all API endpoints</li>
          <li>Input sanitization to prevent XSS attacks</li>
          <li>Automatic session timeout after 8 hours of inactivity</li>
        </ul>

        <h2 style={S.h2}>5. Data Sharing</h2>
        <p style={S.p}>We share your information only with:</p>
        <ul style={S.ul}>
          <li><strong>Your employer</strong> (for employees) — your employer can see your schedule, clock events, documents, and messages sent through ShiftPro</li>
          <li><strong>Service providers</strong> — Supabase (database), Vercel (hosting), Resend (email delivery), Upstash (caching). These providers process data on our behalf under data processing agreements</li>
          <li><strong>Legal requirements</strong> — if required by law, subpoena, or court order</li>
        </ul>

        <h2 style={S.h2}>6. Data Retention</h2>
        <p style={S.p}>We retain your data as long as your account is active. Employee documents are permanent records and are retained even if an employee is deactivated, as employers may need them for tax and compliance purposes. Upon account deletion request, we will delete your data within 30 days, except where retention is required by law.</p>

        <h2 style={S.h2}>7. Your Rights</h2>
        <p style={S.p}>Depending on your location, you may have the right to:</p>
        <ul style={S.ul}>
          <li><strong>Access</strong> — request a copy of your personal data</li>
          <li><strong>Correction</strong> — update inaccurate information</li>
          <li><strong>Deletion</strong> — request deletion of your data</li>
          <li><strong>Portability</strong> — receive your data in a machine-readable format</li>
          <li><strong>Opt-out</strong> — disable push notifications or email notifications</li>
          <li><strong>Withdraw consent</strong> — for location tracking (geofencing)</li>
        </ul>
        <p style={S.p}>To exercise any of these rights, contact us at <a href="mailto:privacy@shiftpro.ai" style={S.link}>privacy@shiftpro.ai</a>.</p>

        <h2 style={S.h2}>8. Location Data</h2>
        <p style={S.p}>ShiftPro uses GPS location data <strong>only</strong> when geofencing is enabled by an employer for clock-in verification. Location data is checked in real-time and is <strong>not stored</strong> — we only verify whether the employee is within the designated radius at the time of clock-in. Employees are informed when geofencing is active.</p>

        <h2 style={S.h2}>9. Cookies & Local Storage</h2>
        <p style={S.p}>ShiftPro uses browser localStorage to store session data, preferences (theme, time format), and notification state. We do not use third-party tracking cookies. We do not use analytics tracking or advertising pixels.</p>

        <h2 style={S.h2}>10. Children's Privacy</h2>
        <p style={S.p}>ShiftPro is intended for use by adults age 16 and older in a professional employment context. We do not knowingly collect information from children under 16. If we discover such data has been collected, we will delete it promptly.</p>

        <h2 style={S.h2}>11. California Privacy Rights (CCPA)</h2>
        <p style={S.p}>California residents have additional rights under the CCPA, including the right to know what data we collect, the right to delete data, and the right to opt out of data sales. As stated above, we do not sell personal information. To submit a CCPA request, contact <a href="mailto:privacy@shiftpro.ai" style={S.link}>privacy@shiftpro.ai</a>.</p>

        <h2 style={S.h2}>12. Changes to This Policy</h2>
        <p style={S.p}>We may update this Privacy Policy periodically. Material changes will be communicated via email or in-app notification. The "Last Updated" date at the top reflects the most recent revision.</p>

        <h2 style={S.h2}>13. Contact Us</h2>
        <p style={S.p}>For privacy-related questions or requests:</p>
        <p style={S.p}>
          Bayscapes Management Enterprises<br/>
          345 SW Bay Blvd, Newport, OR 97365<br/>
          <a href="mailto:privacy@shiftpro.ai" style={S.link}>privacy@shiftpro.ai</a>
        </p>
      </div>
    </div>
  );
}
