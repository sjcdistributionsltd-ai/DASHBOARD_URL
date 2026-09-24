// WorkHive "moments" — clock-in / clock-out celebrations for the staff app.
// Display-only: it is called AFTER a clock event has been saved (or queued), never
// before, and never blocks or delays the save. No library, ~4 KB. Honours the
// phone's "reduce motion" setting (message still shows, no confetti or bounce).
(function () {
  const reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  const css = `
  .whm-scrim{position:fixed;inset:0;z-index:9990;background:radial-gradient(ellipse at 50% 60%,rgba(15,23,42,.55),rgba(15,23,42,.85));opacity:0;transition:opacity .25s;display:flex;align-items:flex-end;justify-content:center;padding:0 16px calc(110px + env(safe-area-inset-bottom))}
  .whm-scrim.show{opacity:1}
  .whm-card{width:100%;max-width:420px;background:#1e293b;border:1px solid rgba(255,255,255,.12);border-radius:22px;padding:26px 22px 20px;text-align:center;color:#f1f5f9;box-shadow:0 20px 60px rgba(0,0,0,.5);transform:translateY(40px) scale(.96);opacity:0;transition:transform .45s cubic-bezier(.34,1.56,.64,1),opacity .3s}
  .whm-scrim.show .whm-card{transform:none;opacity:1}
  .whm-badge{width:88px;height:88px;margin:-70px auto 10px;border-radius:50%;display:grid;place-items:center;box-shadow:0 0 0 8px rgba(30,41,59,1),0 10px 30px rgba(0,0,0,.4)}
  .whm-badge.in{background:linear-gradient(145deg,#34d399,#10b981)}
  .whm-badge.out{background:linear-gradient(145deg,#fcd34d,#f59e0b)}
  .whm-badge svg{width:46px;height:46px}
  .whm-badge path{fill:none;stroke:#fff;stroke-width:6;stroke-linecap:round;stroke-linejoin:round;stroke-dasharray:60;stroke-dashoffset:60;animation:whmDraw .45s .25s ease-out forwards}
  .whm-badge.pop{animation:whmPop .55s cubic-bezier(.34,1.56,.64,1)}
  .whm-wave{font-size:44px;display:inline-block;transform-origin:70% 70%;animation:whmWave 1.4s .2s ease-in-out 2}
  .whm-h{font:800 24px/1.2 -apple-system,system-ui,sans-serif;margin:4px 0 6px;letter-spacing:-.01em}
  .whm-p{color:#94a3b8;font-size:15px;margin:0}
  .whm-stats{display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin:18px 0 4px}
  .whm-stat{background:rgba(255,255,255,.05);border-radius:12px;padding:10px 4px}
  .whm-stat b{display:block;font-size:20px;font-variant-numeric:tabular-nums}
  .whm-stat span{font-size:11px;color:#94a3b8;text-transform:uppercase;letter-spacing:.05em}
  .whm-chips{display:flex;gap:8px;justify-content:center;flex-wrap:wrap;margin-top:14px}
  .whm-chip{font-size:13px;font-weight:700;padding:6px 12px;border-radius:99px;opacity:0;transform:translateY(8px);animation:whmUp .35s ease-out forwards}
  .whm-chip.g{background:rgba(16,185,129,.15);color:#6ee7b7}.whm-chip.a{background:rgba(251,191,36,.15);color:#fde68a}
  .whm-tap{font-size:12px;color:#64748b;margin-top:14px}
  .whm-conf{position:fixed;inset:0;pointer-events:none;z-index:9991}
  .clock-btn{transition:transform .12s ease}
  .clock-btn:active{transform:scale(.96)}
  .clock-btn.whm-press{animation:whmPress .5s ease}
  @keyframes whmDraw{to{stroke-dashoffset:0}}
  @keyframes whmPop{0%{transform:scale(.2)}100%{transform:scale(1)}}
  @keyframes whmWave{0%,100%{transform:rotate(0)}20%{transform:rotate(18deg)}40%{transform:rotate(-10deg)}60%{transform:rotate(14deg)}80%{transform:rotate(-4deg)}}
  @keyframes whmUp{to{opacity:1;transform:none}}
  @keyframes whmPress{0%{box-shadow:0 0 0 0 rgba(16,185,129,.6)}100%{box-shadow:0 0 0 22px rgba(16,185,129,0)}}
  @media (prefers-reduced-motion: reduce){.whm-card,.whm-scrim{transition:none}.whm-badge.pop,.whm-wave,.whm-chip,.clock-btn.whm-press{animation:none}.whm-chip{opacity:1;transform:none}.whm-badge path{animation:none;stroke-dashoffset:0}}
  `;
  const st = document.createElement('style'); st.textContent = css; document.head.appendChild(st);

  const pick = (a) => a[Math.floor(Math.random() * a.length)];
  function greetingIn(name, isDriver) {
    const h = new Date().getHours();
    if (h < 7) return pick([`Morning, early bird ☀️`, `Up with the larks, ${name}!`]);
    if (isDriver) return pick([`Drive safe out there, ${name} 🚐`, `Have a great route, ${name}!`]);
    return pick([`You're in, ${name}! Have a great shift`, `Nice one ${name}, have a good shift!`, `Let's go, ${name} ⛽`]);
  }
  function greetingOut(name) {
    const h = new Date().getHours();
    return h >= 17 ? `Thanks ${name}, enjoy your evening` : h < 12 ? `Thanks ${name}, enjoy the rest of your day` : `Thanks ${name}, great work today`;
  }

  function confetti(big) {
    if (reduce) return;
    const c = document.createElement('canvas'); c.className = 'whm-conf';
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    c.width = innerWidth * dpr; c.height = innerHeight * dpr; document.body.appendChild(c);
    const x = c.getContext('2d'); x.scale(dpr, dpr);
    const cols = ['#fbbf24', '#10b981', '#f1f5f9', '#f59e0b', '#34d399', '#60a5fa'];
    const N = big ? 140 : 60, cx = innerWidth / 2, cy = innerHeight * 0.55;
    const ps = Array.from({ length: N }, () => { const a = -Math.PI / 2 + (Math.random() - .5) * 1.9, v = 6 + Math.random() * (big ? 10 : 7);
      return { x: cx, y: cy, vx: Math.cos(a) * v, vy: Math.sin(a) * v, r: Math.random() * 6.3, vr: (Math.random() - .5) * .3, w: 6 + Math.random() * 5, h: 3 + Math.random() * 4, c: pick(cols), life: 0 }; });
    let t0 = performance.now();
    (function f(t) {
      const dt = Math.min(2, (t - t0) / 16.7); t0 = t;
      x.clearRect(0, 0, innerWidth, innerHeight);
      let alive = 0;
      for (const p of ps) { p.life += dt; p.vy += .25 * dt; p.vx *= .99; p.x += p.vx * dt; p.y += p.vy * dt; p.r += p.vr * dt;
        const o = Math.max(0, 1 - p.life / 110); if (o > 0 && p.y < innerHeight + 20) alive++;
        x.save(); x.globalAlpha = o; x.translate(p.x, p.y); x.rotate(p.r); x.fillStyle = p.c; x.fillRect(-p.w / 2, -p.h / 2, p.w, p.h); x.restore(); }
      alive ? requestAnimationFrame(f) : c.remove();
    })(t0);
  }

  function countUp(el, to, fmt, ms) {
    if (reduce) { el.textContent = fmt(to); return; }
    const s = performance.now();
    (function f(t) { const k = Math.min(1, (t - s) / ms), e = 1 - Math.pow(1 - k, 3); el.textContent = fmt(to * e); if (k < 1) requestAnimationFrame(f); })(s);
  }

  // opts: { kind:'in'|'out', name, isDriver, onTime, earlyMins, streak, shiftCount, workedMins, breakMins, queued }
  window.whCelebrate = function (o) {
    try { navigator.vibrate && navigator.vibrate(o.kind === 'in' ? [18, 60, 18] : [30]); } catch (_) {}
    const milestone = o.shiftCount && [1, 10, 25, 50, 100, 250, 500].includes(o.shiftCount);
    const scrim = document.createElement('div'); scrim.className = 'whm-scrim';
    let body;
    if (o.kind === 'in') {
      const chips = [];
      if (o.queued) chips.push(`<span class="whm-chip a" style="animation-delay:.5s">📶 Saved on this phone, will sync</span>`);
      if (o.onTime) chips.push(`<span class="whm-chip g" style="animation-delay:.6s">✅ ${o.earlyMins > 0 ? o.earlyMins + ' min early' : 'Right on time'}</span>`);
      if (o.streak >= 3) chips.push(`<span class="whm-chip a" style="animation-delay:.75s">🔥 ${o.streak} on-time shifts in a row</span>`);
      if (milestone) chips.push(`<span class="whm-chip a" style="animation-delay:.9s">🎉 ${o.shiftCount === 1 ? 'First shift, welcome aboard!' : o.shiftCount + 'th shift!'}</span>`);
      body = `<div class="whm-badge in pop"><svg viewBox="0 0 48 48"><path d="M12 25 l8 8 l16 -18"/></svg></div>
        <div class="whm-h">${greetingIn(o.name, o.isDriver)}</div>
        <p class="whm-p">Clocked in at ${new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}</p>
        <div class="whm-chips">${chips.join('')}</div>`;
    } else {
      body = `<div class="whm-badge out pop"><span class="whm-wave">👋</span></div>
        <div class="whm-h">${greetingOut(o.name)}</div>
        <p class="whm-p">That's your shift done. See you next time!</p>
        <div class="whm-stats">
          <div class="whm-stat"><b data-k="w">0h 00m</b><span>Worked</span></div>
          <div class="whm-stat"><b data-k="b">0m</b><span>Break</span></div>
          <div class="whm-stat"><b data-k="wk">0.0h</b><span>This week</span></div>
        </div>
        ${o.queued ? '<div class="whm-chips"><span class="whm-chip a" style="animation-delay:.5s">📶 Saved on this phone, will sync</span></div>' : ''}`;
    }
    scrim.innerHTML = `<div class="whm-card" role="status" aria-live="polite">${body}<div class="whm-tap">Tap anywhere to close</div></div>`;
    document.body.appendChild(scrim);
    requestAnimationFrame(() => scrim.classList.add('show'));
    if (o.kind === 'out') {
      const hm = (m) => `${Math.floor(m / 60)}h ${String(Math.round(m % 60)).padStart(2, '0')}m`;
      countUp(scrim.querySelector('[data-k=w]'), o.workedMins || 0, hm, 900);
      countUp(scrim.querySelector('[data-k=b]'), o.breakMins || 0, (m) => Math.round(m) + 'm', 700);
      countUp(scrim.querySelector('[data-k=wk]'), o.weekHours || 0, (h) => h.toFixed(1) + 'h', 1000);
    }
    setTimeout(() => confetti(o.kind === 'in' && milestone), o.kind === 'in' ? 300 : 9e9);
    const close = () => { scrim.classList.remove('show'); setTimeout(() => scrim.remove(), 300); };
    scrim.addEventListener('click', close);
    if (!window.__WHM_HOLD) setTimeout(close, 4200);
  };
})();
