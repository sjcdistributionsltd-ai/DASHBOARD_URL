(function(){
  const t = (off, h, m=0) => { const d = new Date(); d.setDate(d.getDate()+off); d.setHours(h, m, 0, 0); return d.toISOString(); };
  const ds = (off) => { const d = new Date(); d.setDate(d.getDate()+off); return d.toISOString().slice(0,10); };
  const ORG = '8079fd73-262c-4b48-bbe8-ad4dad70170f';
  const sites = [
    { id: 'si-1', name: 'Shell Winnall', code: 'WIN', is_active: true, organisation_id: ORG },
    { id: 'si-2', name: 'Shell Chandlers Ford', code: 'CHF', is_active: true, organisation_id: ORG },
    { id: 'si-3', name: 'Shell Eastleigh', code: 'EAS', is_active: true, organisation_id: ORG },
    { id: 'si-4', name: 'Shell Ropley', code: 'ROP', is_active: true, organisation_id: ORG },
  ];
  const org = { id: ORG, name: 'SJC Fuel Services', plan: 'pro', plan_status: 'active', is_comp: true, pay_basis: 'clocked', is_shell_forecourt: true, rtw_grace_days: 14 };
  const people = [['Priya','Shah',0],['Tom','Baker',0],['Amira','Khan',1],['Dan','Reid',1],['Chloe','Price',2],['Sam','Hughes',2],['Leah','Moss',3],['Omar','Farah',3],['Jordan','Ellis',0],['Ben','Cole',1]];
  const staffRows = people.map(([f,l,s],i) => ({ id: 'p'+i, first_name: f, last_name: l, site_id: sites[s].id, site: { name: sites[s].name }, is_active: true, organisation_id: ORG, role: { name: 'Staff', level: 'staff' } }));
  const me = { id: 'own-1', first_name: 'Scott', last_name: 'Calder', email: 'owner@example.com', organisation_id: ORG, site_id: null, role_id: 'r-own', role: { name: 'Owner', level: 'owner' }, organisation: org, site: null };
  const openClocks = staffRows.slice(0,6).map((p,i) => ({ id: 'te'+i, staff_id: p.id, clock_in_at: t(0, 6 + i, 3*i), staff: { first_name: p.first_name, last_name: p.last_name, site_id: p.site_id, site: p.site } }));
  const shiftsToday = staffRows.map((p,i) => ({ id: 'sh'+i, staff_id: p.id, site_id: p.site_id, start_at: t(0, 6 + (i%8)), end_at: t(0, 14 + (i%8)), status: i === 8 ? 'scheduled' : 'accepted', staff: { first_name: p.first_name, last_name: p.last_name } }));
  const has = (st, m, col) => st.filters.some(([k, a]) => k === m && (!col || a[0] === col));
  window.__FIX = {
    tables: {
      staff: (st) => has(st, 'eq', 'auth_user_id') ? [me] : staffRows,
      organisations: [org], sites, departments: [{ id: 'd1', name: 'Forecourt' }],
      time_entries: (st) => has(st, 'is', 'clock_out_at') ? openClocks : (st.filters.some(([k,a]) => k==='eq' && a[1]==='pending') ? Array.from({length: 7}, (_, i) => ({ id: 'pe'+i })) : openClocks),
      holiday_requests: (st) => st.filters.some(([k,a]) => k==='eq' && a[1]==='pending') ? [{ id: 'hr1' }, { id: 'hr2' }] : [],
      shifts: (st) => st.filters.some(([k,a]) => k==='eq' && a[1]==='open') ? [{ id: 'o1' }, { id: 'o2' }, { id: 'o3' }] : shiftsToday,
      documents: [], announcements: [], sjc_job_runs: [],
    },
    rpc: {},
  };
})();
