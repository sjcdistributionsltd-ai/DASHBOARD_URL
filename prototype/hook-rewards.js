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
    if (r === 'unlock') whBadgeUnlock('goplus', 'You hit 26.1% GO+ this week at Shell Winnall. Target was 25%. Brilliant!');
    if (r === 'shout') whShoutout(kudo);
    if (r === 'recap') whRecap({ range: '15–21 Sep', site: 'Shell Winnall', name: 'Jordan', hours: 38.5, shifts: 5, streak: 12, goplus: 26.1, target: 25, goplusLast: 23.5, scans: 108,
      quote: 'The lady on the till this morning was so friendly and helpful, best Shell around!', smg: 9.1, badges: ['💳 GO+ Hero', '⏰ On the dot', '🤝 Team player'] },
      { hold: !!q.get('s'), start: +(q.get('s') || 0), dur: 3000 });
  });
})();
