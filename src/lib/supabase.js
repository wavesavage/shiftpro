// ============================================================
// src/lib/supabase.js
// ShiftPro — Supabase client + all data functions
// Install: npm install @supabase/supabase-js
// ============================================================

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL  = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON);

// ============================================================
// AUTH
// ============================================================

// Sign up a new employee (called by owner during onboarding)
export async function signUpEmployee({ email, password, firstName, lastName,
  role, department, hourlyRate, orgId, locationId, pin }) {
  // 1. Create auth user
  const { data: authData, error: authErr } = await supabase.auth.signUp({
    email, password,
    options: { data: { first_name: firstName, last_name: lastName } }
  });
  if (authErr) throw authErr;

  // 2. Create user profile
  const { error: profileErr } = await supabase.from('users').insert({
    id:               authData.user.id,
    org_id:           orgId,
    location_id:      locationId,
    first_name:       firstName,
    last_name:        lastName,
    role:             role || 'employee',
    app_role:         'employee',
    hourly_rate:      hourlyRate || 15,
    department:       department || '',
    pin:              pin || '0000',
    avatar_initials:  (firstName[0] + lastName[0]).toUpperCase(),
    avatar_color:     randomAvatarColor(),
  });
  if (profileErr) throw profileErr;
  return authData.user;
}

// Owner / manager login
export async function signIn(email, password) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw error;
  return data;
}

// Sign out
export async function signOut() {
  await supabase.auth.signOut();
}

// Get current session
export async function getSession() {
  const { data } = await supabase.auth.getSession();
  return data.session;
}

// Get current user profile from our users table
export async function getMyProfile() {
  const { data, error } = await supabase
    .from('users')
    .select('*, locations(name, address, timezone)')
    .eq('id', (await supabase.auth.getUser()).data.user?.id)
    .single();
  if (error) throw error;
  return data;
}

// Get all employees for an org (owner/manager)
export async function getOrgEmployees(orgId) {
  const { data, error } = await supabase
    .from('users')
    .select('*, locations(name)')
    .eq('org_id', orgId)
    .eq('status', 'active')
    .order('first_name');
  if (error) throw error;
  return data;
}

// ============================================================
// TIME CLOCK
// ============================================================

// Record a clock event (clock_in | break_start | break_end | clock_out)
export async function recordClockEvent({ userId, orgId, locationId, shiftId, eventType }) {
  const { data, error } = await supabase.from('clock_events').insert({
    user_id:     userId,
    org_id:      orgId,
    location_id: locationId,
    shift_id:    shiftId || null,
    event_type:  eventType,
    occurred_at: new Date().toISOString(),
  }).select().single();
  if (error) throw error;
  return data;
}

// Get today's clock events for a user
export async function getTodayClockEvents(userId) {
  const today = new Date();
  const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate()).toISOString();
  const endOfDay   = new Date(today.getFullYear(), today.getMonth(), today.getDate()+1).toISOString();

  const { data, error } = await supabase
    .from('clock_events')
    .select('*')
    .eq('user_id', userId)
    .gte('occurred_at', startOfDay)
    .lt('occurred_at', endOfDay)
    .order('occurred_at', { ascending: true });
  if (error) throw error;
  return data || [];
}

// Get current clock status for a user
export async function getClockStatus(userId) {
  const events = await getTodayClockEvents(userId);
  if (!events.length) return { clocked: false, onBreak: false, clockedAt: null };

  const last = events[events.length - 1];
  return {
    clocked:   last.event_type !== 'clock_out',
    onBreak:   last.event_type === 'break_start',
    clockedAt: events.find(e => e.event_type === 'clock_in')?.occurred_at || null,
    events,
  };
}

// Get time history for an employee (last N days)
export async function getTimeHistory(userId, days = 14) {
  const since = new Date();
  since.setDate(since.getDate() - days);

  const { data, error } = await supabase
    .from('clock_events')
    .select('*')
    .eq('user_id', userId)
    .gte('occurred_at', since.toISOString())
    .order('occurred_at', { ascending: false });
  if (error) throw error;
  return data || [];
}

// Get timecard summary (owner view — all employees)
export async function getTimecardSummary(orgId, weekStart) {
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekEnd.getDate() + 7);

  const { data, error } = await supabase
    .from('clock_events')
    .select('*, users(first_name, last_name, hourly_rate, role)')
    .eq('org_id', orgId)
    .gte('occurred_at', weekStart)
    .lt('occurred_at', weekEnd.toISOString())
    .order('occurred_at');
  if (error) throw error;
  return data || [];
}

// ============================================================
// SCHEDULE
// ============================================================

// Get schedule for a week
export async function getWeekSchedule(orgId, weekStart) {
  const { data, error } = await supabase
    .from('shifts')
    .select('*, users(first_name, last_name, role, avatar_initials, avatar_color), locations(name)')
    .eq('org_id', orgId)
    .eq('week_start', weekStart)
    .order('start_hour');
  if (error) throw error;
  return data || [];
}

// Get MY schedule (employee view)
export async function getMySchedule(userId, weeksAhead = 2) {
  const today = new Date();
  const future = new Date();
  future.setDate(future.getDate() + (weeksAhead * 7));

  const { data, error } = await supabase
    .from('shifts')
    .select('*, locations(name)')
    .eq('user_id', userId)
    .gte('shift_date', today.toISOString().split('T')[0])
    .lte('shift_date', future.toISOString().split('T')[0])
    .order('shift_date');
  if (error) throw error;
  return data || [];
}

// Create a shift
export async function createShift({ orgId, locationId, userId, weekStart,
  dayOfWeek, shiftDate, startHour, endHour, roleLabel, createdBy }) {
  const { data, error } = await supabase.from('shifts').insert({
    org_id:      orgId,
    location_id: locationId,
    user_id:     userId,
    week_start:  weekStart,
    day_of_week: dayOfWeek,
    shift_date:  shiftDate,
    start_hour:  startHour,
    end_hour:    endHour,
    role_label:  roleLabel,
    status:      'scheduled',
    created_by:  createdBy,
  }).select().single();
  if (error) throw error;
  return data;
}

// Publish a week's schedule (status → published, triggers notifications)
export async function publishWeekSchedule(orgId, weekStart) {
  const { error } = await supabase
    .from('shifts')
    .update({ status: 'published' })
    .eq('org_id', orgId)
    .eq('week_start', weekStart)
    .eq('status', 'scheduled');
  if (error) throw error;
}

// Employee confirms their shift
export async function confirmShift(shiftId) {
  const { error } = await supabase
    .from('shifts')
    .update({ status: 'confirmed', confirmed_at: new Date().toISOString() })
    .eq('id', shiftId);
  if (error) throw error;
}

// Delete a shift
export async function deleteShift(shiftId) {
  const { error } = await supabase.from('shifts').delete().eq('id', shiftId);
  if (error) throw error;
}

// ============================================================
// SWAP REQUESTS
// ============================================================

export async function createSwapRequest({ orgId, fromUserId, toUserId, shiftId, note }) {
  const { data, error } = await supabase.from('swap_requests').insert({
    org_id:       orgId,
    from_user_id: fromUserId,
    to_user_id:   toUserId,
    shift_id:     shiftId,
    from_note:    note,
  }).select().single();
  if (error) throw error;
  return data;
}

export async function getPendingSwaps(orgId) {
  const { data, error } = await supabase
    .from('swap_requests')
    .select('*, from_user:users!from_user_id(first_name,last_name), to_user:users!to_user_id(first_name,last_name), shifts(*)')
    .eq('org_id', orgId)
    .eq('status', 'pending')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data || [];
}

export async function reviewSwap(swapId, approved, reviewerId, note) {
  const { error } = await supabase
    .from('swap_requests')
    .update({
      status:       approved ? 'approved' : 'denied',
      manager_note: note,
      reviewed_by:  reviewerId,
      reviewed_at:  new Date().toISOString(),
    })
    .eq('id', swapId);
  if (error) throw error;
}

// ============================================================
// ACHIEVEMENTS
// ============================================================

// Check and award achievements after clock-out
export async function checkAndAwardAchievements(userId, orgId) {
  const awarded = [];

  // Get clock history for streak calculation
  const history = await getTimeHistory(userId, 120);

  // Calculate current streak (consecutive days with full shifts)
  const streak = calculateAttendanceStreak(history);

  // Get already earned achievements
  const { data: earned } = await supabase
    .from('user_achievements')
    .select('achievement_id, achievements(key)')
    .eq('user_id', userId);
  const earnedKeys = (earned || []).map(e => e.achievements?.key);

  // Check streak achievements
  const streakBadges = [
    { key: 'streak_7',  threshold: 7  },
    { key: 'streak_30', threshold: 30 },
    { key: 'streak_90', threshold: 90 },
  ];

  for (const badge of streakBadges) {
    if (streak >= badge.threshold && !earnedKeys.includes(badge.key)) {
      const { data: ach } = await supabase
        .from('achievements').select('id').eq('key', badge.key).single();
      if (ach) {
        await supabase.from('user_achievements').insert({
          user_id: userId, achievement_id: ach.id
        });
        awarded.push(badge.key);
      }
    }
  }

  // Check on-time badge (need punctuality data — simplified for now)
  if (streak >= 30 && !earnedKeys.includes('always_on_time')) {
    const { data: ach } = await supabase
      .from('achievements').select('id').eq('key', 'always_on_time').single();
    if (ach) {
      await supabase.from('user_achievements').insert({
        user_id: userId, achievement_id: ach.id
      });
      awarded.push('always_on_time');
    }
  }

  return { streak, awarded };
}

// Calculate consecutive attendance streak from clock events
export function calculateAttendanceStreak(clockEvents) {
  if (!clockEvents.length) return 0;

  // Group by date
  const days = {};
  for (const ev of clockEvents) {
    const d = ev.occurred_at.split('T')[0];
    if (!days[d]) days[d] = [];
    days[d].push(ev.event_type);
  }

  // Walk backward from today counting consecutive days with both clock_in + clock_out
  let streak = 0;
  const today = new Date();

  for (let i = 0; i < 120; i++) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const key = d.toISOString().split('T')[0];

    // Skip today if still in progress
    if (i === 0) {
      const todayEvents = days[key] || [];
      if (todayEvents.includes('clock_in') && !todayEvents.includes('clock_out')) continue;
    }

    const dayEvents = days[key] || [];
    const complete = dayEvents.includes('clock_in') && dayEvents.includes('clock_out');

    if (complete) {
      streak++;
    } else {
      // Only break streak if this was a scheduled work day
      // For now, any missing day breaks it
      if (i > 0) break;
    }
  }

  return streak;
}

// Get employee achievements
export async function getMyAchievements(userId) {
  const { data, error } = await supabase
    .from('user_achievements')
    .select('*, achievements(*)')
    .eq('user_id', userId)
    .order('earned_at', { ascending: false });
  if (error) return [];
  return data || [];
}

// ============================================================
// LEADERBOARD
// ============================================================

export async function getLeaderboard(orgId) {
  // Get all employees with their stats
  const { data: employees } = await supabase
    .from('users')
    .select('id, first_name, last_name, role, avatar_initials, avatar_color, hourly_rate')
    .eq('org_id', orgId)
    .eq('status', 'active');

  if (!employees) return [];

  // For each employee, get their streak and achievement count
  const leaderboard = await Promise.all(employees.map(async (emp) => {
    const history = await getTimeHistory(emp.id, 120);
    const streak  = calculateAttendanceStreak(history);

    const { data: achievements } = await supabase
      .from('user_achievements')
      .select('id')
      .eq('user_id', emp.id);

    const thisWeekStart = getMonday(new Date()).toISOString().split('T')[0];
    const { data: weekEvents } = await supabase
      .from('clock_events')
      .select('occurred_at')
      .eq('user_id', emp.id)
      .gte('occurred_at', thisWeekStart);

    // Calculate week hours from events
    const weekHours = calculateHoursFromEvents(weekEvents || []);

    return {
      ...emp,
      name: emp.first_name + ' ' + emp.last_name,
      streak,
      achievements: achievements?.length || 0,
      weekHours: weekHours.toFixed(1),
      score: Math.min(100, streak * 2 + (achievements?.length || 0) * 5),
    };
  }));

  return leaderboard.sort((a, b) => b.score - a.score);
}

// ============================================================
// MESSAGES
// ============================================================

export async function getMyMessages(userId, orgId) {
  const { data, error } = await supabase
    .from('messages')
    .select('*, from_user:users!from_id(first_name, last_name, avatar_initials)')
    .eq('org_id', orgId)
    .or(`to_id.eq.${userId},to_id.is.null`)
    .order('created_at', { ascending: false });
  if (error) return [];
  return data || [];
}

export async function sendMessage({ orgId, fromId, toId, subject, body }) {
  const { error } = await supabase.from('messages').insert({
    org_id: orgId, from_id: fromId,
    to_id: toId || null, subject, body
  });
  if (error) throw error;
}

export async function markMessageRead(messageId) {
  await supabase.from('messages').update({ read: true }).eq('id', messageId);
}

// ============================================================
// REALTIME SUBSCRIPTIONS
// ============================================================

// Subscribe to real-time clock events (owner sees live clock-ins)
export function subscribeToClockEvents(orgId, callback) {
  return supabase
    .channel('clock-events-' + orgId)
    .on('postgres_changes', {
      event: 'INSERT',
      schema: 'public',
      table: 'clock_events',
      filter: 'org_id=eq.' + orgId,
    }, callback)
    .subscribe();
}

// Subscribe to schedule changes
export function subscribeToSchedule(orgId, callback) {
  return supabase
    .channel('schedule-' + orgId)
    .on('postgres_changes', {
      event: '*',
      schema: 'public',
      table: 'shifts',
      filter: 'org_id=eq.' + orgId,
    }, callback)
    .subscribe();
}

// ============================================================
// HELPERS
// ============================================================

function getMonday(date) {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  d.setDate(diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

function calculateHoursFromEvents(events) {
  let hours = 0;
  let clockInTime = null;
  let breakStartTime = null;

  const sorted = [...events].sort((a, b) =>
    new Date(a.occurred_at) - new Date(b.occurred_at)
  );

  for (const ev of sorted) {
    const t = new Date(ev.occurred_at);
    if (ev.event_type === 'clock_in')    clockInTime = t;
    if (ev.event_type === 'break_start') breakStartTime = t;
    if (ev.event_type === 'break_end' && breakStartTime) {
      hours -= (t - breakStartTime) / 3600000;
      breakStartTime = null;
    }
    if (ev.event_type === 'clock_out' && clockInTime) {
      hours += (t - clockInTime) / 3600000;
      clockInTime = null;
    }
  }
  return Math.max(0, hours);
}

const AVATAR_COLORS = [
  '#6366f1','#8b5cf6','#14b8a6','#f59e0b',
  '#10b981','#3b82f6','#f97316','#ef4444',
];
function randomAvatarColor() {
  return AVATAR_COLORS[Math.floor(Math.random() * AVATAR_COLORS.length)];
}

// Format week start for Supabase queries
export function getMondayStr(date = new Date()) {
  return getMonday(date).toISOString().split('T')[0];
}
