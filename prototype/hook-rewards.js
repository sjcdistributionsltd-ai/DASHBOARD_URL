// PROTOTYPE scene driver for the rewards screenshots.
(function () {
  const q = new URLSearchParams(location.search), r = q.get('r');
  const ready = (fn) => { const t = setInterval(() => { if (typeof state !== 'undefined' && state.staff && document.getElementById('app-screen')?.classList.contains('active')) { clearInterval(t); setTimeout(fn, 900); } }, 150); };
  const badgeState = { ontime5: { got: 1 }, goplus: { got: 1, times: 3 }, goplus4: { have: 2, need: 4 }, trained: { got: 1 }, cx5: { got: 1 }, cover: { got: 1, times: 2 },
    early: { got: 1 }, century: { have: 37, need: 100 }, kudos5: { have: 3, need: 5 } };
  const kudo = { from: 'Sarah Mills', tag: 'Covered a shift', msg: 'Thanks for jumping in on Sunday at such short notice. You saved the day and the site ran perfectly!', when: 'Yesterday 18:12', site: 'Shell Winnall' };
  ready(() => {
    if (r === 'shelf') {
      document.querySelector('.tab[data-tab="profile"]').click();
      setTimeout(() => {
        const prof = document.getElementById('tab-profile');
        const hdr = prof.querySelector('.profile-header');
        const holder = document.createElement('div'); hdr.after(holder);
        whRenderShelf(holder, badgeState); whKudoCard(holder, kudo);
        holder.insertBefore(holder.querySelector('.whr-shelf'), holder.firstChild);
        window.scrollTo(0, hdr.offsetTop + hdr.offsetHeight - 70);
      }, 400);
    }
    if (r === 'bday' || r === 'anniv') {
      try { Object.keys(localStorage).filter(k => k.startsWith('wh_bday_seen_')).forEach(k => localStorage.removeItem(k)); } catch (_) {}
      const today = new Date().toLocaleDateString('en-CA', { timeZone: 'Europe/London' });
      if (r === 'bday') state.staff.date_of_birth = '1998' + today.slice(4);
      else { state.staff.date_of_birth = '1998-02-11'; state.staff.start_date = '2025' + today.slice(4); }
      whCheckBirthday(state.staff, state.org, { site: state.site?.name, hold: !!q.get('hold'),
        note: r === 'bday' ? 'Happy birthday Jordan! Hope you have a brilliant day 🎂' : null, from: r === 'bday' ? 'Sarah and the Winnall team' : null });
      if (q.get('auto')) {
        // Simulated taps for the recording: pop balloons that are on screen, the golden one at ~5.5s.
        let t = 0; const iv = setInterval(() => { t += 420;
          const vis = [...document.querySelectorAll('.whb-bal:not(.pop)')].filter(b => { const r = b.getBoundingClientRect(); return r.top > 330 && r.top < 760; });
          const gold = vis.find(b => b.classList.contains('gold'));
          const pick = (t > 5200 && gold) ? gold : vis.filter(b => !b.classList.contains('gold'))[Math.floor(Math.random() * vis.length)];
          if (pick) pick.click();
          if (t > 5200 && gold || t > 12000) { if (!q.get('all')) clearInterval(iv); }
          if (t > 14000) clearInterval(iv);
        }, 420);
      }
      window.scrollTo(0, 0);
    }
    if (r === 'train' || r === 'trainstep') {
      try { Object.keys(localStorage).filter(k => k.startsWith('wh_train_seen_')).forEach(k => localStorage.removeItem(k)); } catch (_) {}
      const prev = { report_date: '2026-09-17', outstanding: ['Age Restricted Sales', 'Fire Safety', 'Fuel Spill Response'] };
      const now = r === 'train' ? { report_date: '2026-09-24', outstanding: [] } : { report_date: '2026-09-24', outstanding: ['Fuel Spill Response'] };
      whTrainingCheck([now, prev], state.staff, { site: state.site?.name || 'Shell Winnall', org: 'SJC Fuel Services', hold: true });
    }
    if (r === 'unlock') whBadgeUnlock('goplus', 'You hit 26.1% GO+ this week at Shell Winnall. Target was 25%. Brilliant!');
    if (r === 'shout') whShoutout(kudo);
    if (r === 'recap') whRecap({ range: '15–21 Sep', site: 'Shell Winnall', name: 'Jordan', hours: 38.5, shifts: 5, streak: 12, goplus: 26.1, target: 25, goplusLast: 23.5, scans: 108,
      quote: 'The lady on the till this morning was so friendly and helpful, best Shell around!', smg: 9.1, badges: ['💳 GO+ Hero', '⏰ On the dot', '🤝 Team player'] },
      { hold: !!q.get('s'), start: +(q.get('s') || 0), dur: 3000 });
  });
})();
