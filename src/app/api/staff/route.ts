import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";

const getServiceClient = () => createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(req: NextRequest) {
  const orgId = req.nextUrl.searchParams.get("orgId");
  if (!orgId) return NextResponse.json({ error: "orgId required" }, { status: 400 });

  const sb = getServiceClient();

  const { data: employees, error } = await sb
    .from("users")
    .select("*")
    .eq("org_id", orgId)
    .in("status", ["active", "invited"])
    .in("app_role", ["employee", "supervisor"])
    .order("first_name");

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  if (!employees?.length) return NextResponse.json({ employees: [] });

  // Merge emails from auth.users since public.users has no email column
  const ids = employees.map(e => e.id);
  const { data: { users: authUsers } } = await sb.auth.admin.listUsers({ perPage: 1000 });
  const emailMap: Record<string, string> = {};
  (authUsers || []).forEach(u => { if (ids.includes(u.id)) emailMap[u.id] = u.email || ""; });

  const merged = employees.map(e => ({ ...e, email: emailMap[e.id] || "" }));
  return NextResponse.json({ employees: merged });
}
