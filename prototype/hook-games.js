// PROTOTYPE scene driver for the games screenshots/videos (simulated taps).
(function () {
  const q = new URLSearchParams(location.search), g = q.get('g'); if (!g) return;
  const ready = (fn) => { const t = setInterval(() => { if (typeof state !== 'undefined' && state.staff && document.getElementById('app-screen')?.classList.contains('active')) { clearInterval(t); setTimeout(fn, 700); } }, 150); };
  const tap = (el) => el && el.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true, cancelable: true }));
  ready(() => {
    if (g === 'card' || g === 'locked') { whGameCard(document.getElementById('tab-today'), { game: q.get('game') || 'racer', locked: g === 'locked', pos: '4th of 31' }); window.scrollTo(0, 0); return; }
    if (g === 'arcade') { whArcade({ featured: 'racer', pos: '4th of 31', playOpts: (id) => whSampleBoard(id) }); return; }
    const opts = Object.assign({ autostart: !!q.get('auto') }, whSampleBoard(g));
    if (q.get('s')) opts.seconds = +q.get('s');
    if (q.get('laps')) opts.laps = +q.get('laps');
    if (g === 'hangman') opts.word = ['TILL', 'Where you take payment'];
    if (g === 'memory') opts.deck = ['⛽','🍩','🥪','🚗','🧽','💳','🍩','⛽','💳','🥪','🧽','🚗'];
    if (g === 'racer' && q.get('auto')) opts.autopilot = true;
    const ctx = whPlayGame(g, opts);
    if (!q.get('auto') || q.get('noauto')) return;
    const startDelay = 3300;
    if (g === 'blitz') setTimeout(() => { const iv = setInterval(() => { if (!ctx.alive) return clearInterval(iv);
      const vis = [...ctx.arena.querySelectorAll('.whg-bal:not(.pop)')].filter(b => { const r = b.getBoundingClientRect(); return r.top > 200 && r.top < 460; });
      const pick = vis.find(b => b.querySelector('text')) || vis[Math.floor(Math.random() * vis.length)]; tap(pick);
      if (ctx.arena.querySelector('.whg-end')) clearInterval(iv); }, 330); }, startDelay);
    if (g === 'goplus') setTimeout(() => { const iv = setInterval(() => { if (!ctx.alive) return clearInterval(iv);
      const up = [...ctx.arena.querySelectorAll('.whg-pop.up.go:not(.hit)')]; if (up.length && Math.random() < .85) tap(up[0]);
      if (ctx.arena.querySelector('.whg-end')) clearInterval(iv); }, 380); }, startDelay);
    if (g === 'hangman') { ['E', 'T', 'A', 'L', 'O', 'I'].forEach((k, i) => setTimeout(() => ctx.guess && ctx.guess(k), startDelay + 900 + i * 850)); }
    if (g === 'memory') { [0, 1, 2, 5, 0, 7, 1, 6, 3, 9, 4, 10, 2, 11, 5, 8, 2, 9, 3, 11].forEach((i, n) => setTimeout(() => ctx.flipAt && ctx.flipAt(i), startDelay + 700 + n * 560 + Math.floor(n / 2) * 300)); }
    const EVERY = { shelves: 480, coffee: 360, till: 260, scramble: 330, quiz: 1700, wash: 35, queue: 320, stack: 30, simon: 420, fuelup: 2900 };
    if (EVERY[g]) setTimeout(() => { const iv = setInterval(() => { if (!ctx.alive || ctx.arena.querySelector('.whg-end')) return clearInterval(iv); try { ctx.auto && ctx.auto(); } catch (_) {} }, EVERY[g]); if (g === 'fuelup') ctx.auto && ctx.auto(); }, startDelay + (g === 'fuelup' ? 300 : 500));
  });
})();
