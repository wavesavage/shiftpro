import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  try {
    const { email, firstName, lastName, orgId, locationId, role, department, hourlyRate } = await req.json()
    
    if (!email || !firstName || !lastName) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    // Send invite email via Supabase Auth
    const { data, error } = await supabase.auth.admin.inviteUserByEmail(email, {
      data: {
        first_name: firstName,
        last_name: lastName,
        org_id: orgId,
      },
      redirectTo: 'https://shiftpro.ai'
    })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    // Create placeholder user record
    if (data?.user) {
      const initials = (firstName[0] + (lastName[0] || '')).toUpperCase()
      const colors = ['#6366f1','#8b5cf6','#14b8a6','#f59e0b','#10b981','#3b82f6','#f97316']
      const color = colors[Math.floor(Math.random() * colors.length)]

      await supabase.from('users').upsert({
        id: data.user.id,
        org_id: orgId || null,
        location_id: locationId || null,
        first_name: firstName,
        last_name: lastName,
        role: role || 'Employee',
        app_role: 'employee',
        department: department || 'General',
        hourly_rate: parseFloat(hourlyRate) || 15,
        avatar_initials: initials,
        avatar_color: color,
        status: 'invited',
        hire_date: new Date().toISOString().split('T')[0],
      }, { onConflict: 'id' })
    }

    return NextResponse.json({ success: true, userId: data?.user?.id })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Invite failed'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
