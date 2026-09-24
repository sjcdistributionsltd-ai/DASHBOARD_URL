// PROTOTYPE hook — in production this is two lines inside toggleClock():
//   after renderClockedIn()  → whCelebrate({kind:'in', ...})
//   after renderClockedOut() → whCelebrate({kind:'out', ...})
(function () {
  const scene = new URLSearchParams(location.search).get('scene') || '';
  const css = `
  #tab-today > .card-block, #tab-today > .wh-fresh{animation:whmIn .45s cubic-bezier(.2,.8,.2,1) both}
  #tab-today > :nth-child(2){animation-delay:.05s}#tab-today > :nth-child(3){animation-delay:.1s}#tab-today > :nth-child(4){animation-delay:.15s}#tab-today > :nth-child(5){animation-delay:.2s}#tab-today > :nth-child(6){animation-delay:.25s}
  .tab.active .icon{animation:whmBounce .45s cubic-bezier(.34,1.56,.64,1)}
  @keyframes whmIn{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:none}}
  @keyframes whmBounce{0%{transform:scale(.7)}60%{transform:scale(1.18)}100%{transform:scale(1)}}
  @media (prefers-reduced-motion: reduce){#tab-today > *{animation:none!important}.tab.active .icon{animation:none}}`;
  const st = document.createElement('style'); st.textContent = css; document.head.appendChild(st);
  let pending = null;
  document.addEventListener('click', (e) => {
    const b = e.target.closest('#clock-btn'); if (!b) return;
    b.classList.remove('whm-press'); void b.offsetWidth; b.classList.add('whm-press');
    pending = { clock: state.currentClock ? Object.assign({}, state.currentClock) : null, at: Date.now() };
  }, true);
  const wrap = (name, kind) => { const orig = window[name]; window[name] = function () { const r = orig.apply(this, arguments);
    if (pending && Date.now() - pending.at < 60000) {
      const p = pending; pending = null;
      const name = state.staff?.preferred_name || state.staff?.first_name || '';
      const queued = !navigator.onLine;
      if (kind === 'in') {
        const shift = (window.__FIX.tables.shifts || [])[0];
        const early = shift ? Math.round((new Date(shift.start_at) - Date.now()) / 60000) : 0;
        whCelebrate({ kind, name, onTime: early >= 0, earlyMins: early, streak: 5, shiftCount: new URLSearchParams(location.search).get('m') ? 100 : 37, queued });
      } else {
        window.__whDone = true;
        const worked = p.clock ? (Date.now() - new Date(p.clock.clock_in_at)) / 60000 - 30 : 0;
        whCelebrate({ kind, name, workedMins: worked, breakMins: 30, weekHours: 30.2, queued });
      }
    } return r; }; };
  wrap('renderClockedIn', 'in'); wrap('renderClockedOut', 'out');
})();
