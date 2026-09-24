(function(){
  // Shift that ended 3 minutes ago, so clocking out now is on time.
  const s = window.__FIX.tables.shifts[0];
  const end = new Date(Date.now() - 3*60000);
  s.end_at = end.toISOString(); s.start_at = new Date(end.getTime() - 8.5*3600000).toISOString();
})();
