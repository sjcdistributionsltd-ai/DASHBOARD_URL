// PROTOTYPE scene driver for the games screenshots/videos (simulated taps).
(function () {
  const q = new URLSearchParams(location.search), g = q.get('g'); if (!g) return;
  const board = [{ n: 'Priya', s: 0 }, { n: 'Tom', s: 0 }, { n: 'Amira', s: 0 }];
  const ready = (fn) => { const t = setInterval(() => { if (typeof state !== 'undefined' && state.staff && document.getElementById('app-screen')?.classList.contains('active')) { clearInterval(t); setTimeout(fn, 700); } }, 150); };
  const tap = (el) => el && el.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true, cancelable: true }));
  ready(() => {
    if (g === 'card' || g === 'locked') {
      const today = document.getElementById('tab-today');
      whGameCard(today, { game: 'blitz', locked: g === 'locked' });
      window.scrollTo(0, 0); return;
    }
    const opts = { autostart: !!q.get('auto'), boardName: 'Shell Winnall top scores this week' };
    if (g === 'blitz') { opts.seconds = +(q.get('s') || 60); opts.board = [{ n: 'Priya', s: 41 }, { n: 'Tom', s: 33 }, { n: 'Amira', s: 27 }]; }
    if (g === 'goplus') { opts.seconds = +(q.get('s') || 30); opts.board = [{ n: 'Priya', s: 24 }, { n: 'Dan', s: 19 }, { n: 'Chloe', s: 17 }]; }
    if (g === 'hangman') { opts.word = ['TILL', 'Where you take payment']; opts.board = [{ n: 'Tom', s: 6 }, { n: 'Leah', s: 4 }, { n: 'Omar', s: 3 }]; }
    if (g === 'memory') { opts.deck = ['⛽','🍩','🥪','🚗','🧽','💳','🍩','⛽','💳','🥪','🧽','🚗']; opts.board = [{ n: 'Chloe', s: 142 }, { n: 'Sam', s: 128 }, { n: 'Ben', s: 110 }]; }
    const ctx = whPlayGame(g, opts);
    if (!q.get('auto')) return;
    const startDelay = 3300;
    if (g === 'blitz') setTimeout(() => { const iv = setInterval(() => { if (!ctx.alive) return clearInterval(iv);
      const vis = [...ctx.arena.querySelectorAll('.whg-bal:not(.pop)')].filter(b => { const r = b.getBoundingClientRect(); return r.top > 200 && r.top < 460; });
      const pick = vis.find(b => b.querySelector('text')) || vis[Math.floor(Math.random() * vis.length)]; tap(pick);
      if (ctx.arena.querySelector('.whg-end')) clearInterval(iv); }, 330); }, startDelay);
    if (g === "goplus" && !q.get("noauto")) setTimeout(() => { const iv = setInterval(() => { if (!ctx.alive) return clearInterval(iv);
      const up = [...ctx.arena.querySelectorAll('.whg-pop.up.go:not(.hit)')]; if (up.length && Math.random() < .85) tap(up[0]);
      if (ctx.arena.querySelector('.whg-end')) clearInterval(iv); }, 380); }, startDelay);
    if (g === 'hangman') { const seq = ['E', 'T', 'A', 'L', 'O', 'I']; seq.forEach((k, i) => setTimeout(() => ctx.guess && ctx.guess(k), startDelay + 900 + i * 850)); }
    if (g === 'memory') { const seq = [0, 1, 2, 5, 0, 7, 1, 6, 3, 9, 4, 10, 2, 11, 5, 8, 2, 9, 3, 11]; seq.forEach((i, n) => setTimeout(() => ctx.flipAt && ctx.flipAt(i), startDelay + 700 + n * 560 + Math.floor(n / 2) * 300)); }
  });
})();
