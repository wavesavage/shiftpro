import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  try {
    const { email, password, firstName, lastName, bizName, bizType, address, empCount } = await req.json()

    if (!email || !password || !firstName || !lastName || !bizName) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    // 1. Create auth user (email confirmed immediately)
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
    })
    if (authError) return NextResponse.json({ error: authError.message }, { status: 400 })

    // 2. Create organization
    const slug = bizName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
    const { data: org, error: orgError } = await supabase.from('organizations')
      .insert({ name: bizName, slug, plan: 'lite_starter', industry: bizType || 'Other' })
      .select().single()
    if (orgError) return NextResponse.json({ error: orgError.message }, { status: 400 })

    // 3. Create location
    const { data: loc, error: locError } = await supabase.from('locations')
      .insert({
        org_id: org.id,
        name: address || bizName,
        address: address || '',
        timezone: 'America/Los_Angeles',
        active: true,
      })
      .select().single()
    if (locError) return NextResponse.json({ error: locError.message }, { status: 400 })

    // 4. Create user profile
    const initials = ((firstName[0] || '') + (lastName[0] || '')).toUpperCase()
    const { error: userError } = await supabase.from('users').insert({
      id: authData.user!.id,
      org_id: org.id,
      location_id: loc.id,
      first_name: firstName,
      last_name: lastName,
      role: 'Owner',
      app_role: 'owner',
      department: 'Management',
      hourly_rate: 0,
      avatar_initials: initials,
      avatar_color: '#f59e0b',
      status: 'active',
      hire_date: new Date().toISOString().split('T')[0],
    })
    if (userError) return NextResponse.json({ error: userError.message }, { status: 400 })

    return NextResponse.json({ success: true, orgId: org.id })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Signup failed'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
