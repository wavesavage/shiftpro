"use client";

export default function TermsPage() {
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
  };

  return (
    <div style={S.page}>
      <div style={S.header}>
        <div style={S.logo}>SHIFTPRO.AI</div>
        <h1 style={S.title}>Terms of Service</h1>
        <div style={S.date}>Last Updated: April 11, 2026</div>
      </div>
      <div style={S.content}>
        <a href="/" style={S.back}>← Back to ShiftPro</a>

        <h2 style={S.h2}>1. Acceptance of Terms</h2>
        <p style={S.p}>By accessing or using ShiftPro.ai ("the Service"), operated by Bayscapes Management Enterprises ("we," "us," or "our"), you agree to be bound by these Terms of Service. If you do not agree, do not use the Service.</p>

        <h2 style={S.h2}>2. Description of Service</h2>
        <p style={S.p}>ShiftPro.ai is a workforce management platform that provides shift scheduling, time tracking, employee communication, document management, and related tools for shift-based businesses. The Service is provided on a subscription basis with free and paid tiers.</p>

        <h2 style={S.h2}>3. Account Registration</h2>
        <p style={S.p}>You must provide accurate, complete information when creating an account. You are responsible for maintaining the security of your account credentials and for all activities that occur under your account. You must notify us immediately of any unauthorized use.</p>

        <h2 style={S.h2}>4. Acceptable Use</h2>
        <p style={S.p}>You agree not to:</p>
        <ul style={S.ul}>
          <li>Use the Service for any unlawful purpose</li>
          <li>Attempt to gain unauthorized access to any part of the Service</li>
          <li>Upload malicious code, viruses, or harmful content</li>
          <li>Interfere with or disrupt the Service's infrastructure</li>
          <li>Use the Service to harass, abuse, or harm others</li>
          <li>Resell, sublicense, or redistribute the Service without authorization</li>
          <li>Scrape, crawl, or use automated means to access the Service</li>
        </ul>

        <h2 style={S.h2}>5. Subscription & Billing</h2>
        <h3 style={S.h3}>5.1 Free Tier</h3>
        <p style={S.p}>The Starter plan is free and includes basic features for a single location. We reserve the right to modify free tier limitations at any time.</p>
        <h3 style={S.h3}>5.2 Paid Plans</h3>
        <p style={S.p}>Paid subscriptions are billed monthly or annually as selected. All fees are non-refundable except as required by law. We may change pricing with 30 days notice.</p>
        <h3 style={S.h3}>5.3 Cancellation</h3>
        <p style={S.p}>You may cancel your subscription at any time. Access continues until the end of the current billing period. No partial refunds are provided for unused time.</p>

        <h2 style={S.h2}>6. Data Ownership</h2>
        <p style={S.p}>You retain ownership of all data you input into the Service, including employee information, schedules, documents, and messages. We do not claim ownership of your content. You grant us a limited license to process your data solely to operate and improve the Service.</p>

        <h2 style={S.h2}>7. Employee Data</h2>
        <p style={S.p}>As an employer using ShiftPro, you are responsible for ensuring that your use of the Service complies with all applicable employment laws, including wage and hour regulations, record-keeping requirements, and employee privacy laws in your jurisdiction.</p>

        <h2 style={S.h2}>8. Uptime & Availability</h2>
        <p style={S.p}>We strive for 99.9% uptime but do not guarantee uninterrupted access. The Service may be temporarily unavailable due to maintenance, updates, or circumstances beyond our control. We are not liable for losses resulting from downtime.</p>

        <h2 style={S.h2}>9. Limitation of Liability</h2>
        <p style={S.p}>To the maximum extent permitted by law, ShiftPro.ai and its operators shall not be liable for any indirect, incidental, special, consequential, or punitive damages, including lost profits, data loss, or business interruption, arising from your use of the Service. Our total liability shall not exceed the amount you paid us in the 12 months preceding the claim.</p>

        <h2 style={S.h2}>10. Disclaimer of Warranties</h2>
        <p style={S.p}>The Service is provided "as is" and "as available" without warranties of any kind, express or implied, including warranties of merchantability, fitness for a particular purpose, or non-infringement.</p>

        <h2 style={S.h2}>11. Indemnification</h2>
        <p style={S.p}>You agree to indemnify and hold harmless ShiftPro.ai, its operators, employees, and affiliates from any claims, damages, or expenses arising from your use of the Service or violation of these Terms.</p>

        <h2 style={S.h2}>12. Termination</h2>
        <p style={S.p}>We may suspend or terminate your account at any time for violation of these Terms, with or without notice. Upon termination, your right to use the Service ceases immediately. We will provide a reasonable opportunity to export your data.</p>

        <h2 style={S.h2}>13. Changes to Terms</h2>
        <p style={S.p}>We may update these Terms at any time. Material changes will be communicated via email or in-app notification at least 30 days before taking effect. Continued use after changes constitutes acceptance.</p>

        <h2 style={S.h2}>14. Governing Law</h2>
        <p style={S.p}>These Terms are governed by the laws of the State of Oregon, United States. Any disputes shall be resolved in the courts of Lincoln County, Oregon.</p>

        <h2 style={S.h2}>15. Contact</h2>
        <p style={S.p}>For questions about these Terms, contact us at:</p>
        <p style={S.p}>
          Bayscapes Management Enterprises<br/>
          345 SW Bay Blvd, Newport, OR 97365<br/>
          <a href="mailto:support@shiftpro.ai" style={S.link}>support@shiftpro.ai</a>
        </p>
      </div>
    </div>
  );
}
