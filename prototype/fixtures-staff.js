(function(){
  const day = (off, h, m=0) => { const d = new Date(); d.setDate(d.getDate()+off); d.setHours(h, m, 0, 0); return d.toISOString(); };
  const dstr = (off) => { const d = new Date(); d.setDate(d.getDate()+off); return d.toISOString().slice(0,10); };
  const site = { name: 'Shell Winnall', code: 'WIN', lat: 51.07, lng: -1.30, geofence_radius_m: 150, geofence_strict: false };
  const staff = { id: 'st-1', first_name: 'Jordan', last_name: 'Ellis', email: 'demo@example.com', phone: '07700900000', job_title: 'Customer Service Assistant', start_date: '2025-03-01', organisation_id: 'org-1', site_id: 'site-1', department_id: 'd1', role_id: 'r1', auth_user_id: 'auth-1', geofence_exempt: true,
    role: { name: 'Staff', level: 'staff' }, site, department: { name: 'Forecourt', emoji: '⛽' },
    organisation: { name: 'SJC Fuel Services', plan: 'pro', plan_status: 'active', rtw_grace_days: 14, rtw_gate_enabled: false } };
  const shifts = [
    { id: 's1', staff_id: 'st-1', start_at: day(0, 14), end_at: day(0, 22), break_minutes: 30, status: 'accepted', site, department: { name: 'Forecourt', emoji: '⛽' } },
    { id: 's2', staff_id: 'st-1', start_at: day(1, 6), end_at: day(1, 14), break_minutes: 30, status: 'scheduled', site, department: { name: 'Forecourt', emoji: '⛽' } },
    { id: 's3', staff_id: 'st-1', start_at: day(3, 14), end_at: day(3, 22), break_minutes: 30, status: 'scheduled', site, department: { name: 'Forecourt', emoji: '⛽' } },
  ];
  window.__FIX = {
    tables: {
      staff_with_pii: [staff], staff: [staff],
      shifts, time_entries: [], sickness_episodes: [],
      holiday_balances: [{ staff_id: 'st-1', entitlement_hours: 224, remaining_hours: 132, taken_hours: 68, booked_hours: 24 }],
      holiday_requests: [{ id: 'h1', start_date: dstr(21), end_date: dstr(25), status: 'approved', hours: 40, created_at: day(-10, 9) },
                         { id: 'h2', start_date: dstr(48), end_date: dstr(48), status: 'pending', hours: 8, created_at: day(-1, 9) }],
      shell_goplus_weekly: [{ week_ending: dstr(-3), site_id: 'site-1', txns: 412, goplus_txns: 97, penetration: 23.5, points_to_cash: 4 }, { week_ending: dstr(-10), site_id: 'site-1', txns: 380, goplus_txns: 80, penetration: 21.0 }],
      shell_training_rag: [{ report_date: dstr(-2), outstanding: 1, due_soon: 2 }],
      channel_members: [{ channel_id: 'c1', last_read_at: day(-1, 9) }],
      messages: [{ id: 'm1' }, { id: 'm2' }],
      payslips: [], contracts: [], form_templates: [], form_submissions: [], org_resources: [],
    },
    rpc: {
      my_pending_acks: [], my_rtw_status: { ok: true, status: 'verified' }, my_recent_announcements: [],
      site_roster: [
        { first_name: 'Jordan', last_name: 'Ellis', start_at: day(0, 14), end_at: day(0, 22), department: 'Forecourt', is_me: true },
        { first_name: 'Priya', last_name: 'Shah', start_at: day(0, 6), end_at: day(0, 14), department: 'Forecourt' },
        { first_name: 'Tom', last_name: 'Baker', start_at: day(0, 10), end_at: day(0, 18), department: 'Deli2Go' },
        { first_name: 'Amira', last_name: 'Khan', start_at: day(0, 18), end_at: day(0, 23), department: 'Forecourt' },
      ],
    },
  };
})();
