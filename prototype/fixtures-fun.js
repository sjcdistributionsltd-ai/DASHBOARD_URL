(function(){
  // Shift starting in 2 minutes so the clock-in counts as on time.
  const s = window.__FIX.tables.shifts[0];
  const st = new Date(Date.now() + 2*60000); st.setSeconds(0,0);
  s.start_at = st.toISOString(); s.end_at = new Date(st.getTime() + 8*3600000).toISOString();
})();
