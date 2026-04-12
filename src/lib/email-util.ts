// Shared email utility — uses Resend API
// Env var: RESEND_API_KEY
import { createClient } from "@supabase/supabase-js";

const sb = () => createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const FROM = "ShiftPro <notifications@shiftpro.ai>";

async function sendEmail(to: string, subject: string, html: string) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) { console.log("[email] RESEND_API_KEY not configured, skipping"); return false; }

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { "Content-Type": "application/json", "Authorization": "Bearer " + apiKey },
      body: JSON.stringify({ from: FROM, to, subject, html }),
    });
    if (!res.ok) {
      const d = await res.json().catch(() => ({}));
      console.error("[email] send failed:", d.message || res.status);
      return false;
    }
    return true;
  } catch (e: any) {
    console.error("[email] error:", e.message);
    return false;
  }
}

function template(title: string, body: string, ctaText?: string, ctaUrl?: string) {
  return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f4f2ef;font-family:'Segoe UI',system-ui,sans-serif">
<div style="max-width:480px;margin:0 auto;padding:24px">
  <div style="background:#0c1220;border-radius:12px 12px 0 0;padding:20px 24px;text-align:center">
    <span style="font-family:monospace;font-size:10px;letter-spacing:3px;color:#e8b84b">SHIFTPRO.AI</span>
  </div>
  <div style="background:#fff;border:1px solid #e2e8f0;border-top:none;border-radius:0 0 12px 12px;padding:28px 24px">
    <h2 style="margin:0 0 12px;font-size:18px;color:#1a1a2e">${title}</h2>
    <div style="font-size:14px;color:#52525b;line-height:1.6;margin-bottom:20px">${body}</div>
    ${ctaText && ctaUrl ? `<a href="${ctaUrl}" style="display:inline-block;padding:12px 28px;background:linear-gradient(135deg,#6366f1,#7c3aed);color:#fff;text-decoration:none;border-radius:8px;font-weight:700;font-size:14px">${ctaText}</a>` : ""}
  </div>
  <div style="text-align:center;padding:16px;font-size:11px;color:#a1a1aa">
    You're receiving this because you're on ShiftPro. <a href="https://shiftpro.ai" style="color:#6366f1">Open ShiftPro</a>
  </div>
</div>
</body>
</html>`;
}

// ── Send to a specific user by ID ──
export async function emailUser(userId: string, subject: string, title: string, body: string, ctaText?: string, ctaUrl?: string) {
  const { data: user } = await sb().from("users").select("email").eq("id", userId).single();
  if (!user?.email) return false;
  return sendEmail(user.email, subject, template(title, body, ctaText, ctaUrl));
}

// ── Send to all managers/owners in an org ──
export async function emailManagers(orgId: string, subject: string, title: string, body: string, ctaText?: string, ctaUrl?: string) {
  const { data: managers } = await sb().from("users").select("email")
    .eq("org_id", orgId).in("app_role", ["owner", "manager"]).eq("status", "active");
  if (!managers || managers.length === 0) return 0;

  let sent = 0;
  const html = template(title, body, ctaText, ctaUrl);
  for (const m of managers) {
    if (m.email && await sendEmail(m.email, subject, html)) sent++;
  }
  return sent;
}

// ── Send to all employees in an org (optionally exclude one) ──
export async function emailOrg(orgId: string, subject: string, title: string, body: string, ctaText?: string, ctaUrl?: string, excludeUserId?: string) {
  const { data: users } = await sb().from("users").select("id, email")
    .eq("org_id", orgId).eq("status", "active");
  if (!users || users.length === 0) return 0;

  const targets = excludeUserId ? users.filter(u => u.id !== excludeUserId) : users;
  let sent = 0;
  const html = template(title, body, ctaText, ctaUrl);
  for (const u of targets) {
    if (u.email && await sendEmail(u.email, subject, html)) sent++;
  }
  return sent;
}
