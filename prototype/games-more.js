// WorkHive arcade: 11 more forecourt games on top of games.js (15 in total), plus the Arcade
// screen and the weekly featured game. Same rules as games.js: runs only on the phone,
// nothing runs until a game is opened, everything stops when it closes.
(function () {
  const { shell, SFX, tone, buzz, floatText, bump, getBest, GAMES, register } = window.WHG;
  const reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  const FONT = '-apple-system,BlinkMacSystemFont,"Segoe UI",system-ui,sans-serif';
  const css = `
  .wx-steer{position:absolute;left:0;right:0;bottom:0;display:flex;gap:12px;padding:10px 16px calc(14px + env(safe-area-inset-bottom))}
  .wx-steer button{flex:1;height:84px;border:0;border-radius:20px;background:rgba(255,255,255,.12);color:#fff;font:900 34px ${FONT};box-shadow:0 5px 0 rgba(0,0,0,.35)}
  .wx-steer button.on{background:#fbbf24;color:#0f172a;transform:translateY(3px);box-shadow:0 2px 0 rgba(0,0,0,.35)}
  .wx-shelf{padding:8px 14px 0;max-width:420px;margin:0 auto}
  .wx-row{display:grid;grid-template-columns:repeat(4,1fr);gap:8px;padding:10px 8px 6px;background:linear-gradient(180deg,rgba(255,255,255,.04),rgba(255,255,255,.02));border-bottom:10px solid #92400e;border-radius:6px 6px 2px 2px;box-shadow:0 6px 0 #78350f;margin-bottom:16px}
  .wx-slot{aspect-ratio:1;border-radius:12px;border:2px dashed rgba(255,255,255,.18);display:grid;place-items:center;font-size:34px;position:relative}
  .wx-slot .ghost{opacity:.22;filter:grayscale(1)}
  .wx-slot.full{border-style:solid;border-color:rgba(16,185,129,.5);background:rgba(16,185,129,.1)}
  .wx-slot.bad{animation:wxShake .35s;border-color:#ef4444;background:rgba(239,68,68,.15)}
  .wx-basket{display:flex;align-items:center;justify-content:center;gap:14px;margin-top:6px}
  .wx-next{width:96px;height:96px;border-radius:24px;background:rgba(251,191,36,.15);border:2px solid rgba(251,191,36,.5);display:grid;place-items:center;font-size:56px;animation:wxIn .3s cubic-bezier(.34,1.56,.64,1)}
  .wx-fly{position:fixed;z-index:10000;font-size:40px;pointer-events:none;transition:transform .32s cubic-bezier(.3,.8,.4,1)}
  .wx-order{display:flex;align-items:center;gap:12px;margin:4px 16px 10px;background:#f8fafc;color:#0f172a;border-radius:16px;padding:12px 14px;position:relative;box-shadow:0 6px 0 #cbd5e1;animation:wxIn .35s cubic-bezier(.34,1.56,.64,1)}
  .wx-order .cust{font-size:40px}
  .wx-order b{display:block;font-size:20px}
  .wx-order span{font-size:14px;color:#475569}
  .wx-pat{position:absolute;left:12px;right:12px;bottom:6px;height:5px;border-radius:9px;background:#e2e8f0;overflow:hidden}
  .wx-pat i{display:block;height:100%;background:#10b981;transform-origin:left}
  .wx-cupwrap{display:flex;justify-content:center;margin:6px 0 10px}
  .wx-cup{width:110px;height:130px;border:5px solid #e2e8f0;border-top:0;border-radius:0 0 26px 26px;display:flex;flex-direction:column-reverse;overflow:hidden;position:relative;background:rgba(255,255,255,.04);transition:transform .3s}
  .wx-cup.hide{opacity:.15}
  .wx-cup.tip{transform:rotate(-70deg) translateX(-30px);opacity:0;transition:transform .5s,opacity .5s}
  .wx-layer{height:0;transition:height .35s cubic-bezier(.3,1.3,.6,1)}
  .wx-ings{display:grid;grid-template-columns:repeat(3,1fr);gap:8px;padding:0 16px;max-width:420px;margin:0 auto}
  .wx-ing{height:64px;border:0;border-radius:14px;background:rgba(255,255,255,.12);color:#fff;font:800 13px ${FONT};display:flex;flex-direction:column;align-items:center;justify-content:center;gap:2px;box-shadow:0 4px 0 rgba(0,0,0,.35)}
  .wx-ing i{font-style:normal;font-size:24px}
  .wx-ing:active{transform:translateY(3px);box-shadow:0 1px 0 rgba(0,0,0,.35)}
  .wx-serve{display:block;margin:10px auto 0;width:calc(100% - 32px);max-width:388px;height:56px;border:0;border-radius:16px;background:#10b981;color:#fff;font:900 19px ${FONT};box-shadow:0 5px 0 #047857}
  .wx-pump{margin:4px auto 0;width:250px;background:linear-gradient(180deg,#fbbf24,#f59e0b);border-radius:22px 22px 10px 10px;padding:16px;box-shadow:0 8px 0 #b45309}
  .wx-lcd{background:#0b1220;border-radius:10px;padding:10px 14px;font:700 13px ui-monospace,Menlo,monospace;color:#86efac}
  .wx-lcd .big{font-size:40px;letter-spacing:.04em;display:block;text-align:right;color:#bbf7d0;text-shadow:0 0 12px rgba(134,239,172,.5)}
  .wx-lcd .row{display:flex;justify-content:space-between;margin-top:4px;color:#4ade80}
  .wx-target{text-align:center;font-size:18px;margin:14px 0 4px}
  .wx-target b{color:#fbbf24;font-size:26px}
  .wx-hold{display:block;margin:14px auto 0;width:200px;height:200px;border-radius:50%;border:0;background:radial-gradient(circle at 35% 30%,#34d399,#047857);color:#fff;font:900 20px ${FONT};box-shadow:0 8px 0 #065f46,0 0 0 8px rgba(16,185,129,.15);touch-action:none}
  .wx-hold.on{transform:translateY(5px) scale(.97);box-shadow:0 3px 0 #065f46,0 0 0 14px rgba(16,185,129,.25)}
  .wx-hold:disabled{filter:grayscale(.7);opacity:.6}
  .wx-res{text-align:center;font:900 22px ${FONT};min-height:30px;margin-top:10px}
  .wx-till{margin:0 16px;background:#f8fafc;color:#0f172a;border-radius:16px;padding:12px 16px;box-shadow:0 6px 0 #cbd5e1}
  .wx-till .l{display:flex;justify-content:space-between;font-size:15px;padding:2px 0}
  .wx-till .l b{font-variant-numeric:tabular-nums}
  .wx-till .due{font-size:22px;border-top:2px dashed #cbd5e1;margin-top:6px;padding-top:6px}
  .wx-tray{margin:12px 16px 8px;min-height:64px;border-radius:14px;background:rgba(255,255,255,.06);border:2px dashed rgba(255,255,255,.15);display:flex;flex-wrap:wrap;gap:4px;padding:8px;align-content:flex-start}
  .wx-money{display:grid;grid-template-columns:repeat(5,1fr);gap:8px;padding:0 16px;max-width:420px;margin:0 auto}
  .wx-m{border:0;display:grid;place-items:center;font:900 13px ${FONT};color:#1f2937;box-shadow:0 4px 0 rgba(0,0,0,.35);height:58px}
  .wx-m.note{grid-column:span 1;border-radius:8px;height:58px}
  .wx-m.coin{border-radius:50%;aspect-ratio:1;height:auto}
  .wx-m.gold{background:radial-gradient(circle at 35% 30%,#fde68a,#d97706)}
  .wx-m.silver{background:radial-gradient(circle at 35% 30%,#f8fafc,#94a3b8)}
  .wx-m.copper{background:radial-gradient(circle at 35% 30%,#fdba74,#9a3412);color:#fff}
  .wx-m.n10{background:linear-gradient(135deg,#fdba74,#ea580c);color:#fff}
  .wx-m.n5{background:linear-gradient(135deg,#99f6e4,#0d9488);color:#fff}
  .wx-chip{font:800 11px ${FONT};padding:6px 8px;border-radius:99px;animation:wxIn .25s}
  .wx-acts{display:flex;gap:8px;padding:10px 16px 0;max-width:420px;margin:0 auto}
  .wx-acts button{flex:1;height:52px;border:0;border-radius:14px;font:900 16px ${FONT}}
  .wx-slots,.wx-tiles{display:flex;justify-content:center;gap:7px;flex-wrap:wrap;padding:0 12px}
  .wx-slots{margin:26px 0 22px}
  .wx-sl{width:44px;height:54px;border-radius:10px;border-bottom:4px solid rgba(255,255,255,.3);display:grid;place-items:center;font:900 26px ${FONT}}
  .wx-t{width:48px;height:56px;border:0;border-radius:12px;background:linear-gradient(145deg,#fcd34d,#f59e0b);color:#0f172a;font:900 26px ${FONT};box-shadow:0 5px 0 #b45309;transition:transform .15s,opacity .15s}
  .wx-t.used{opacity:.15;transform:scale(.85)}
  .wx-slots.ok .wx-sl{color:#6ee7b7;animation:wxPop .4s}
  .wx-slots.bad{animation:wxShake .4s}
  .wx-q{margin:6px 16px 0;font:800 21px/1.3 ${FONT};text-align:center;min-height:84px;display:flex;align-items:center;justify-content:center;animation:wxIn .3s}
  .wx-opts{display:grid;gap:10px;padding:14px 16px;max-width:420px;margin:0 auto}
  .wx-opt{min-height:58px;border:0;border-radius:14px;background:rgba(255,255,255,.1);color:#fff;font:700 17px ${FONT};text-align:left;padding:10px 16px;box-shadow:0 4px 0 rgba(0,0,0,.35);animation:wxIn .3s both}
  .wx-opt.ok{background:#10b981}.wx-opt.no{background:#dc2626;animation:wxShake .35s}
  .wx-ring{width:70px;height:70px;margin:0 auto;position:relative}
  .wx-ring svg{transform:rotate(-90deg)}
  .wx-ring b{position:absolute;inset:0;display:grid;place-items:center;font:900 22px ${FONT}}
  .wx-wash{position:relative;margin:10px auto 0;touch-action:none}
  .wx-wash canvas{position:absolute;inset:0;border-radius:18px}
  .wx-bub{position:absolute;pointer-events:none;font-size:22px;animation:wxBub 1s ease-out forwards}
  .wx-lane{display:grid;grid-template-columns:repeat(4,1fr);gap:10px;padding:6px 16px}
  .wx-bay{height:150px;border-radius:14px;background:rgba(255,255,255,.05);border:2px solid rgba(255,255,255,.1);display:flex;flex-direction:column;align-items:center;justify-content:flex-end;padding:8px 4px;position:relative}
  .wx-bay .p{position:absolute;top:8px;font-size:22px}
  .wx-bay .car{font-size:40px;transition:transform .35s}
  .wx-bay .fuel{width:80%;height:8px;border-radius:9px;background:rgba(255,255,255,.1);overflow:hidden;margin-top:4px}
  .wx-bay .fuel i{display:block;height:100%;width:0;background:#10b981}
  .wx-bay.pay{border-color:#fbbf24;background:rgba(251,191,36,.12);animation:wxPulse .8s infinite}
  .wx-bay.pay::after{content:'💷 Tap to pay';position:absolute;bottom:-24px;font:800 11px ${FONT};color:#fbbf24;white-space:nowrap}
  .wx-queue{display:flex;gap:8px;padding:34px 16px 8px;min-height:120px;flex-wrap:wrap;align-content:flex-start}
  .wx-qcar{width:62px;height:70px;border-radius:14px;background:rgba(255,255,255,.08);display:flex;flex-direction:column;align-items:center;justify-content:center;font-size:34px;animation:wxIn .3s cubic-bezier(.34,1.56,.64,1)}
  .wx-qcar .pt{width:44px;height:5px;border-radius:9px;background:rgba(255,255,255,.15);overflow:hidden;margin-top:4px}
  .wx-qcar .pt i{display:block;height:100%;background:#fbbf24}
  .wx-qcar.shake{animation:wxShake .35s}
  .wx-stack{position:absolute;left:0;right:0;bottom:0;top:0;overflow:hidden}
  .wx-crate{position:absolute;height:34px;border-radius:4px;background:repeating-linear-gradient(90deg,#b45309 0 22px,#92400e 22px 24px);border:2px solid #78350f;box-shadow:inset 0 3px 0 rgba(255,255,255,.18)}
  .wx-crate.fall{transition:transform 1s cubic-bezier(.5,0,1,1),opacity 1s;opacity:0}
  .wx-simon{display:grid;grid-template-columns:1fr 1fr;gap:14px;padding:14px 22px;max-width:380px;margin:0 auto}
  .wx-sp{aspect-ratio:1;border:0;border-radius:26px;display:grid;place-items:center;font-size:52px;opacity:.45;transition:opacity .12s,transform .12s;box-shadow:0 7px 0 rgba(0,0,0,.35)}
  .wx-sp.lit{opacity:1;transform:scale(1.05);filter:brightness(1.3)}
  .wx-msg{text-align:center;font:900 22px ${FONT};margin-top:8px;min-height:30px}
  .wx-arc{position:fixed;inset:0;z-index:9996;background:radial-gradient(ellipse at 50% 0%,#1e3a8a,#0f172a 60%);color:#fff;overflow:auto;padding:calc(16px + env(safe-area-inset-top)) 16px 30px;font-family:${FONT};opacity:0;transition:opacity .25s}
  .wx-arc.show{opacity:1}
  .wx-arc h2{font-size:26px;margin:0}
  .wx-feat{margin:14px 0;border-radius:20px;padding:18px;background:linear-gradient(135deg,#dc2626,#f59e0b);box-shadow:0 8px 0 #7f1d1d;display:flex;gap:14px;align-items:center;cursor:pointer}
  .wx-feat .ic{font-size:54px;animation:wxBob 2s ease-in-out infinite}
  .wx-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:10px}
  .wx-gt{border:0;border-radius:16px;background:rgba(255,255,255,.08);color:#fff;padding:12px 6px;display:flex;flex-direction:column;align-items:center;gap:4px;font:700 12px ${FONT};box-shadow:0 4px 0 rgba(0,0,0,.3);animation:wxIn .35s both}
  .wx-gt i{font-style:normal;font-size:32px}
  .wx-gt small{color:#94a3b8;font-weight:600}
  @keyframes wxShake{0%,100%{transform:translateX(0)}25%{transform:translateX(-6px)}75%{transform:translateX(6px)}}
  @keyframes wxIn{from{opacity:0;transform:translateY(12px) scale(.9)}to{opacity:1;transform:none}}
  @keyframes wxPop{50%{transform:scale(1.25)}}
  @keyframes wxBub{from{opacity:1;transform:translateY(0) scale(.6)}to{opacity:0;transform:translateY(-40px) scale(1.3)}}
  @keyframes wxPulse{50%{box-shadow:0 0 0 6px rgba(251,191,36,.25)}}
  @keyframes wxBob{0%,100%{transform:translateY(0) rotate(-4deg)}50%{transform:translateY(-6px) rotate(4deg)}}
  `;
  const st = document.createElement('style'); st.textContent = css; document.head.appendChild(st);
  const shuffle = (a) => { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
  const pill = (k, label, v) => `<div class="whg-pill"><b data-${k}>${v}</b><span>${label}</span></div>`;
  const secs = (ms) => (ms / 1000).toFixed(2) + 's';
  const tap = (el, fn) => el.addEventListener('pointerdown', (e) => { e.preventDefault(); fn(e); });
  function bag(key, n) { let b = []; try { b = JSON.parse(localStorage.getItem(key) || '[]'); } catch (_) {} if (!b.length) b = shuffle([...Array(n).keys()]); const i = b.shift(); try { localStorage.setItem(key, JSON.stringify(b)); } catch (_) {} return i; }

  // ---------- 5. Forecourt Racer ----------
  function racer(ctx) {
    const LAPS = ctx.opts.laps || 3;
    ctx.hud.innerHTML = pill('l', 'Lap', `1/${LAPS}`) + pill('t', 'Time', '0.00') + pill('b', 'Best lap', '–');
    const L = ctx.hud.querySelector('[data-l]'), T = ctx.hud.querySelector('[data-t]'), B = ctx.hud.querySelector('[data-b]');
    const run = () => {
      ctx.arena.innerHTML = '<canvas style="display:block;margin:0 auto"></canvas><div class="wx-steer"><button data-d="-1" aria-label="Steer left">◀</button><button data-d="1" aria-label="Steer right">▶</button></div>';
      const cv = ctx.arena.querySelector('canvas'), dpr = Math.min(2, devicePixelRatio || 1);
      const W = Math.min(ctx.arena.clientWidth, 420), H = ctx.arena.clientHeight - 112;
      cv.width = W * dpr; cv.height = H * dpr; cv.style.width = W + 'px'; cv.style.height = H + 'px';
      const g = cv.getContext('2d'); g.scale(dpr, dpr);
      const m = 10, TW = Math.min(84, W * .22), R = 70;
      const outer = { x: m, y: m, w: W - 2 * m, h: H - 2 * m, r: R }, inner = { x: m + TW, y: m + TW, w: W - 2 * m - 2 * TW, h: H - 2 * m - 2 * TW, r: 26 };
      const inRR = (p, r) => { const x = Math.max(r.x + r.r, Math.min(p.x, r.x + r.w - r.r)), y = Math.max(r.y + r.r, Math.min(p.y, r.y + r.h - r.r));
        if (p.x < r.x || p.x > r.x + r.w || p.y < r.y || p.y > r.y + r.h) return false; return (p.x - x) ** 2 + (p.y - y) ** 2 <= r.r * r.r || (p.x >= r.x + r.r && p.x <= r.x + r.w - r.r) || (p.y >= r.y + r.r && p.y <= r.y + r.h - r.r); };
      const rr = (r, fill, stroke, lw) => { g.beginPath(); g.roundRect(r.x, r.y, r.w, r.h, r.r); if (fill) { g.fillStyle = fill; g.fill(); } if (stroke) { g.lineWidth = lw || 2; g.strokeStyle = stroke; g.stroke(); } };
      const cx = W / 2, cy = H / 2, mid = m + TW / 2;
      const wps = [[mid, cy], [mid + 10, mid + 30], [cx, mid], [W - mid - 10, mid + 30], [W - mid, cy], [W - mid - 10, H - mid - 30], [cx, H - mid], [mid + 10, H - mid - 30]].map(([x, y]) => ({ x, y }));
      const cones = [wps[2], wps[5], wps[7]].map((p, i) => ({ x: p.x + (i - 1) * 14, y: p.y + (i === 1 ? -10 : 8), hit: 0 }));
      const car = { x: mid, y: cy + 40, a: -Math.PI / 2, v: 0 };
      let steer = 0, lap = 1, cps = 0, t0 = performance.now(), lapStart = t0, best = 0, lastF = t0, wp = 1, done = false, skid = [];
      const vmax = Math.max(170, H * .42);
      ctx.arena.querySelectorAll('.wx-steer button').forEach(b => {
        const d = +b.dataset.d; const on = (e) => { e.preventDefault(); steer = d; b.classList.add('on'); }; const off = () => { if (steer === d) steer = 0; b.classList.remove('on'); };
        b.addEventListener('pointerdown', on); b.addEventListener('pointerup', off); b.addEventListener('pointerleave', off); b.addEventListener('pointercancel', off);
      });
      const key = (e) => { if (e.key === 'ArrowLeft') steer = e.type === 'keydown' ? -1 : 0; if (e.key === 'ArrowRight') steer = e.type === 'keydown' ? 1 : 0; };
      addEventListener('keydown', key); addEventListener('keyup', key);
      function draw() {
        g.fillStyle = '#166534'; g.fillRect(0, 0, W, H);
        for (let i = 0; i < 40; i++) { g.fillStyle = 'rgba(0,0,0,.06)'; g.fillRect((i * 97) % W, (i * 53) % H, 3, 3); }
        rr(outer, '#374151'); rr(outer, null, '#ef4444', 5); g.setLineDash([12, 12]); rr(outer, null, '#f8fafc', 5); g.setLineDash([]);
        const cl = { x: m + TW / 2, y: m + TW / 2, w: W - 2 * m - TW, h: H - 2 * m - TW, r: R - TW / 2 };
        g.setLineDash([14, 14]); rr(cl, null, 'rgba(255,255,255,.45)', 2); g.setLineDash([]);
        rr(inner, '#cbd5e1'); rr({ x: inner.x + 8, y: inner.y + 8, w: inner.w - 16, h: inner.h - 16, r: 18 }, '#fbbf24', '#dc2626', 6);
        g.fillStyle = '#dc2626'; g.font = `900 ${Math.min(18, inner.w / 7)}px ${FONT}`; g.textAlign = 'center'; g.fillText('FORECOURT', cx, cy - inner.h * .28);
        const pw = Math.min(26, inner.w / 6);
        [[-1, -1], [1, -1], [-1, 1], [1, 1]].forEach(([sx, sy]) => { const px = cx + sx * inner.w * .2, py = cy + sy * inner.h * .16;
          g.fillStyle = '#f8fafc'; g.beginPath(); g.roundRect(px - pw / 2, py - pw * .7, pw, pw * 1.4, 5); g.fill(); g.fillStyle = '#0f172a'; g.fillRect(px - pw / 2 + 4, py - pw * .5, pw - 8, pw * .4);
          g.fillStyle = '#16a34a'; g.fillRect(px + pw / 2, py - 2, 4, 10); });
        g.fillStyle = '#e2e8f0'; g.fillRect(cx - inner.w * .18, cy + inner.h * .3, inner.w * .36, 16); g.fillStyle = '#0f172a'; g.font = `800 10px ${FONT}`; g.fillText('SHOP', cx, cy + inner.h * .3 + 12);
        for (let i = 0; i < 8; i++) { g.fillStyle = (i % 2) ? '#fff' : '#111'; g.fillRect(m + (i % 4) * TW / 4, cy - 6 + Math.floor(i / 4) * 6, TW / 4, 6); }
        skid.forEach(s => { g.fillStyle = `rgba(0,0,0,${s.o})`; g.fillRect(s.x - 2, s.y - 2, 4, 4); });
        cones.forEach(c => { if (c.hit > 1.2) return; g.save(); g.translate(c.x, c.y - c.hit * 40); g.rotate(c.hit * 6); g.fillStyle = '#f97316'; g.beginPath(); g.moveTo(0, -10); g.lineTo(8, 8); g.lineTo(-8, 8); g.closePath(); g.fill(); g.fillStyle = '#fff'; g.fillRect(-5, 0, 10, 3); g.restore(); });
        g.save(); g.translate(car.x, car.y); g.rotate(car.a + Math.PI / 2);
        g.fillStyle = 'rgba(0,0,0,.35)'; g.beginPath(); g.roundRect(-10, -15, 22, 34, 6); g.fill();
        g.fillStyle = '#dc2626'; g.beginPath(); g.roundRect(-11, -17, 22, 34, 7); g.fill();
        g.fillStyle = '#fbbf24'; g.fillRect(-2, -17, 4, 34);
        g.fillStyle = '#0f172a'; g.beginPath(); g.roundRect(-8, -9, 16, 9, 3); g.fill(); g.fillRect(-8, 6, 16, 5);
        g.fillStyle = '#111'; [[-13, -11], [9, -11], [-13, 6], [9, 6]].forEach(([x, y]) => g.fillRect(x, y, 4, 7));
        g.restore();
      }
      function frame(now) {
        if (!ctx.alive || done) return;
        const dt = Math.min(.04, (now - lastF) / 1000); lastF = now;
        let s = steer;
        if (ctx.opts.autopilot) { const w = wps[wp]; let d = Math.atan2(w.y - car.y, w.x - car.x) - car.a; d = Math.atan2(Math.sin(d), Math.cos(d)); s = Math.max(-1, Math.min(1, d * 2.2)); if (Math.hypot(w.x - car.x, w.y - car.y) < 42) wp = (wp + 1) % wps.length; }
        const vt = vmax * (ctx.opts.autopilot ? .8 : 1) * (1 - Math.abs(s) * .18);
        car.v += (vt - car.v) * Math.min(1, dt * 1.6);
        car.a += s * 2.9 * dt * Math.min(1, car.v / 80);
        const nx = car.x + Math.cos(car.a) * car.v * dt, ny = car.y + Math.sin(car.a) * car.v * dt;
        const np = { x: nx, y: ny };
        if (!inRR(np, outer) || inRR(np, inner)) { car.v *= -.35; SFX.buzz(); buzz(25); floatText(ctx.arena, car.x - 20, car.y - 30, 'Bump!', '#f87171'); }
        else { car.x = nx; car.y = ny; }
        if (Math.abs(s) > .6 && car.v > 120) { skid.push({ x: car.x, y: car.y, o: .25 }); }
        skid.forEach(k => k.o -= dt * .12); skid = skid.filter(k => k.o > 0).slice(-160);
        cones.forEach(c => { if (!c.hit && Math.hypot(c.x - car.x, c.y - car.y) < 16) { c.hit = .01; car.v *= .5; SFX.buzz(); floatText(ctx.arena, c.x - 20, c.y - 30, 'Cone!', '#fb923c'); } if (c.hit) c.hit += dt * 1.5; });
        const ang = Math.atan2(car.y - cy, car.x - cx);
        const bands = [-Math.PI / 2, 0, Math.PI / 2];
        if (cps < 3 && Math.abs(Math.atan2(Math.sin(ang - bands[cps]), Math.cos(ang - bands[cps]))) < .35) cps++;
        if (cps === 3 && car.x < m + TW + 4 && car.y < cy && car.y > cy - 40) {
          const lt = now - lapStart; lapStart = now; cps = 0; if (!best || lt < best) { best = lt; B.textContent = secs(lt); bump(B); }
          SFX.ding(); buzz([15, 30, 15]); floatText(ctx.arena, W / 2 - 60, H / 2 - 20, lap === LAPS ? 'FINISH!' : `Lap ${lap}: ${secs(lt)}`, '#fde047');
          if (lap === LAPS) { done = true; const total = now - t0; removeEventListener('keydown', key); removeEventListener('keyup', key); ctx.later(() => ctx.end(Math.round(total), 'Chequered flag! 🏁', `${LAPS} laps · best lap ${secs(best)}`, () => { L.textContent = `1/${LAPS}`; B.textContent = '–'; run(); }, { lower: true, fmt: secs }), 600); }
          else { lap++; L.textContent = `${lap}/${LAPS}`; bump(L); }
        }
        T.textContent = ((now - t0) / 1000).toFixed(2);
        draw(); requestAnimationFrame(frame);
      }
      draw(); requestAnimationFrame(frame);
    };
    ctx.start(run);
  }

  // ---------- 6. Shelf Stacker ----------
  const STOCK = ['🥤', '🍫', '🥪', '🧃', '🍪', '🥛', '🍟', '🍬', '🧀', '🍌', '🥐', '🍩'];
  function shelves(ctx) {
    ctx.hud.innerHTML = pill('f', 'Filled', '0/12') + pill('t', 'Time', '0.00');
    const F = ctx.hud.querySelector('[data-f]'), T = ctx.hud.querySelector('[data-t]');
    const run = () => {
      const layout = shuffle(STOCK), order = shuffle(STOCK); let n = 0, pen = 0; const t0 = performance.now();
      ctx.arena.innerHTML = `<div class="wx-shelf">${[0, 1, 2].map(r => `<div class="wx-row">${layout.slice(r * 4, r * 4 + 4).map(it => `<div class="wx-slot" data-it="${it}"><span class="ghost">${it}</span></div>`).join('')}</div>`).join('')}
        <div class="wx-basket"><span style="font-size:15px;color:#94a3b8;font-weight:700">Next item →</span><div class="wx-next"></div></div>
        <p class="whg-p" style="text-align:center;margin:10px auto 0">Tap the right space on the shelf. Wrong space = 2 second penalty.</p></div>`;
      const next = ctx.arena.querySelector('.wx-next');
      const show = () => { next.textContent = order[n] || ''; next.style.animation = 'none'; void next.offsetWidth; next.style.animation = ''; };
      show(); F.textContent = '0/12';
      const tick = () => { if (!ctx.alive || n >= 12) return; T.textContent = ((performance.now() - t0 + pen) / 1000).toFixed(2); requestAnimationFrame(tick); }; tick();
      const place = (slot) => {
        if (n >= 12 || slot.classList.contains('full')) return;
        if (slot.dataset.it === order[n]) {
          const a = next.getBoundingClientRect(), b = slot.getBoundingClientRect();
          const fly = document.createElement('div'); fly.className = 'wx-fly'; fly.textContent = order[n]; fly.style.left = a.left + a.width / 2 - 20 + 'px'; fly.style.top = a.top + a.height / 2 - 24 + 'px';
          document.body.appendChild(fly); requestAnimationFrame(() => { fly.style.transform = `translate(${b.left - a.left + (b.width - a.width) / 2}px,${b.top - a.top + (b.height - a.height) / 2}px)`; });
          setTimeout(() => { fly.remove(); slot.classList.add('full'); slot.innerHTML = slot.dataset.it; }, 320);
          n++; F.textContent = n + '/12'; bump(F); SFX.ding(); buzz(8); show();
          if (n === 12) { const total = performance.now() - t0 + pen; T.textContent = (total / 1000).toFixed(2); ctx.later(() => { window.whConfetti && whConfetti(false); ctx.end(Math.round(total), 'Shelves full! 🛒', pen ? `Including ${pen / 1000}s of penalties` : 'No mistakes!', run, { lower: true, fmt: secs }); }, 500); }
        } else { pen += 2000; slot.classList.remove('bad'); void slot.offsetWidth; slot.classList.add('bad'); SFX.buzz(); buzz(30); const r = slot.getBoundingClientRect(), ar = ctx.arena.getBoundingClientRect(); floatText(ctx.arena, r.left - ar.left + 6, r.top - ar.top, '+2s', '#f87171'); }
      };
      ctx.arena.querySelectorAll('.wx-slot').forEach(s => tap(s, () => place(s)));
      ctx.auto = () => { const s = [...ctx.arena.querySelectorAll('.wx-slot:not(.full)')]; const right = s.find(x => x.dataset.it === order[n]); place(Math.random() < .12 ? s[Math.floor(Math.random() * s.length)] : right); };
    };
    ctx.start(run);
  }

  // ---------- 7. Coffee Rush ----------
  const ING = { cup: ['🥤', 'Cup', '#e2e8f0'], shot: ['☕', 'Espresso', '#78350f'], water: ['💧', 'Hot water', '#93c5fd'], milk: ['🥛', 'Milk', '#f5f5f4'], foam: ['☁️', 'Foam', '#fffbeb'], choc: ['🍫', 'Chocolate', '#451a03'] };
  const DRINKS = [['Espresso', ['shot']], ['Americano', ['shot', 'water']], ['Latte', ['shot', 'milk']], ['Cappuccino', ['shot', 'milk', 'foam']], ['Hot chocolate', ['choc', 'milk']], ['Mocha', ['shot', 'choc', 'milk']], ['Flat white', ['shot', 'shot', 'milk']]];
  const CUST = ['🧑', '👩', '👨‍🦰', '👵', '🧔', '👷', '👩‍🦱', '🧑‍🦳'];
  function coffee(ctx) {
    const G = ctx.opts.seconds || 60;
    ctx.hud.innerHTML = pill('s', 'Served', '0') + pill('t', 'Seconds', G);
    const S = ctx.hud.querySelector('[data-s]'), T = ctx.hud.querySelector('[data-t]'); ctx.bar.hidden = false; const barI = ctx.bar.querySelector('i');
    const run = () => {
      let served = 0, cur, got = [], cupIn = false, t0 = Date.now(), patT, over = false;
      ctx.arena.innerHTML = `<div class="wx-ordwrap"></div><div class="wx-cupwrap"><div class="wx-cup hide"></div></div>
        <div class="wx-ings">${Object.entries(ING).map(([k, v]) => `<button class="wx-ing" data-k="${k}"><i>${v[0]}</i>${v[1]}</button>`).join('')}</div><button class="wx-serve">Serve ☕</button>`;
      const ow = ctx.arena.querySelector('.wx-ordwrap'), cup = ctx.arena.querySelector('.wx-cup');
      const order = () => { cur = DRINKS[Math.floor(Math.random() * DRINKS.length)]; got = []; cupIn = false; cup.className = 'wx-cup hide'; cup.innerHTML = '';
        ow.innerHTML = `<div class="wx-order"><div class="cust">${CUST[Math.floor(Math.random() * CUST.length)]}</div><div><b>${cur[0]}</b><span>${cur[1].map(k => ING[k][0]).join(' + ')}</span></div><div class="wx-pat"><i></i></div></div>`;
        const pi = ow.querySelector('.wx-pat i'); pi.style.transition = 'none'; pi.style.transform = 'scaleX(1)'; requestAnimationFrame(() => requestAnimationFrame(() => { pi.style.transition = 'transform 9s linear, background 9s'; pi.style.transform = 'scaleX(0)'; pi.style.background = '#ef4444'; }));
        clearTimeout(patT); patT = ctx.later(() => { if (over) return; floatText(ctx.arena, 140, 10, 'Too slow! 😤', '#f87171'); SFX.buzz(); order(); }, 9000); };
      const add = (k) => { if (over) return;
        if (k === 'cup') { if (cupIn) return; cupIn = true; cup.className = 'wx-cup'; SFX.tick(); return; }
        if (!cupIn) { floatText(ctx.arena, 150, 150, 'Cup first!', '#fbbf24'); SFX.buzz(); return; }
        if (got.length >= 4) return; got.push(k); const l = document.createElement('div'); l.className = 'wx-layer'; l.style.background = ING[k][2]; cup.appendChild(l); requestAnimationFrame(() => l.style.height = (k === 'foam' ? 22 : 30) + 'px'); SFX.tick(); buzz(5); };
      const serve = () => { if (over || !cupIn) return;
        const want = cur[1].slice().sort().join(), have = got.slice().sort().join();
        if (want === have) { served++; S.textContent = served; bump(S); SFX.ding(); buzz(12); floatText(ctx.arena, 150, 20, '😊 Thanks!', '#6ee7b7'); order(); }
        else { cup.className = 'wx-cup tip'; SFX.buzz(); buzz(30); floatText(ctx.arena, 140, 150, 'Wrong drink!', '#f87171'); ctx.later(() => { got = []; cupIn = false; cup.className = 'wx-cup hide'; cup.innerHTML = ''; }, 500); } };
      ctx.arena.querySelectorAll('.wx-ing').forEach(b => tap(b, () => add(b.dataset.k)));
      tap(ctx.arena.querySelector('.wx-serve'), serve);
      order();
      const clock = () => { if (!ctx.alive) return; const left = Math.max(0, G - (Date.now() - t0) / 1000); T.textContent = Math.ceil(left); barI.style.transform = `scaleX(${left / G})`;
        if (left <= 0) { over = true; ctx.end(served, 'Rush over! ☕', `drinks served in ${G} seconds`, () => { S.textContent = 0; run(); }); return; } requestAnimationFrame(clock); }; clock();
      ctx.auto = () => { if (!cupIn) return add('cup'); if (got.length < cur[1].length) return add(cur[1][got.length]); serve(); };
    };
    ctx.start(run);
  }

  // ---------- 8. Fuel Up (stop on the exact amount) ----------
  function fuelUp(ctx) {
    const ROUNDS = 5;
    ctx.hud.innerHTML = pill('r', 'Round', `1/${ROUNDS}`) + pill('s', 'Score', '0');
    const Rr = ctx.hud.querySelector('[data-r]'), S = ctx.hud.querySelector('[data-s]');
    const run = () => {
      let round = 0, score = 0;
      const next = () => {
        round++; Rr.textContent = `${round}/${ROUNDS}`; const target = [10, 15, 20, 25, 30, 40, 50][Math.floor(Math.random() * 7)] + (Math.random() < .5 ? 0 : .5);
        ctx.arena.innerHTML = `<div class="wx-pump"><div class="wx-lcd">SALE £<span class="big" data-p>0.00</span><div class="row"><span>LITRES <b data-l>0.00</b></span><span>£1.45/L</span></div></div></div>
          <div class="wx-target">Stop on exactly <b>£${target.toFixed(2)}</b></div>
          <button class="wx-hold">HOLD<br>TO FILL ⛽</button><div class="wx-res"></div>`;
        const P = ctx.arena.querySelector('[data-p]'), Lt = ctx.arena.querySelector('[data-l]'), btn = ctx.arena.querySelector('.wx-hold'), res = ctx.arena.querySelector('.wx-res');
        let amt = 0, holding = false, tStart = 0, last = 0, done = false, raf;
        const loop = (now) => { if (!holding || !ctx.alive) return; const held = (now - tStart) / 1000, dt = (now - last) / 1000; last = now;
          amt += dt * Math.min(9, .8 + held * held * 1.6); P.textContent = amt.toFixed(2); Lt.textContent = (amt / 1.45).toFixed(2); if (Math.floor(amt * 4) !== Math.floor((amt - dt) * 4)) SFX.tick(); raf = requestAnimationFrame(loop); };
        const down = (e) => { e && e.preventDefault(); if (done) return; holding = true; btn.classList.add('on'); tStart = last = performance.now(); buzz(10); raf = requestAnimationFrame(loop); };
        const up = () => { if (!holding || done) return; holding = false; done = true; btn.classList.remove('on'); btn.disabled = true; cancelAnimationFrame(raf);
          const diff = Math.round(Math.abs(amt - target) * 100), pts = Math.max(0, 100 - diff * 2); score += pts; S.textContent = score; bump(S);
          res.innerHTML = diff === 0 ? '🎯 Spot on! +100' : `${diff}p ${amt > target ? 'over' : 'under'} · +${pts}`; res.style.color = diff === 0 ? '#fde047' : diff < 20 ? '#6ee7b7' : '#fca5a5';
          if (diff === 0) { SFX.win(); window.whConfetti && whConfetti(false); } else if (pts) SFX.ding(); else SFX.buzz();
          ctx.later(() => round < ROUNDS ? next() : ctx.end(score, 'Pumps off! ⛽', `out of ${ROUNDS * 100} points`, () => { S.textContent = 0; run(); }), 1500); };
        btn.addEventListener('pointerdown', down); btn.addEventListener('pointerup', up); btn.addEventListener('pointerleave', up); btn.addEventListener('pointercancel', up);
        ctx.auto = () => { down(); const need = target; const chk = () => { if (amt >= need - .02 - Math.random() * .06) up(); else ctx.later(chk, 16); }; chk(); };
      };
      next();
    };
    ctx.start(run);
  }

  // ---------- 9. Till Change ----------
  const MONEY = [[1000, '£10', 'note n10'], [500, '£5', 'note n5'], [200, '£2', 'coin gold'], [100, '£1', 'coin gold'], [50, '50p', 'coin silver'], [20, '20p', 'coin silver'], [10, '10p', 'coin silver'], [5, '5p', 'coin silver'], [2, '2p', 'coin copper'], [1, '1p', 'coin copper']];
  function till(ctx) {
    const G = ctx.opts.seconds || 60;
    ctx.hud.innerHTML = pill('s', 'Customers', '0') + pill('t', 'Seconds', G);
    const S = ctx.hud.querySelector('[data-s]'), T = ctx.hud.querySelector('[data-t]'); ctx.bar.hidden = false; const barI = ctx.bar.querySelector('i');
    const run = () => {
      let served = 0, due = 0, given = [], t0 = Date.now(), over = false;
      ctx.arena.innerHTML = `<div class="wx-till"></div><div class="wx-tray"></div>
        <div class="wx-money">${MONEY.map(([v, l, c]) => `<button class="wx-m ${c}" data-v="${v}">${l}</button>`).join('')}</div>
        <div class="wx-acts"><button data-u style="background:rgba(255,255,255,.12);color:#fff">↩ Undo</button><button data-g style="background:#10b981;color:#fff;box-shadow:0 4px 0 #047857">Give change</button></div>`;
      const tl = ctx.arena.querySelector('.wx-till'), tray = ctx.arena.querySelector('.wx-tray');
      const fmt = (p) => '£' + (p / 100).toFixed(2);
      const cust = () => { const price = 50 + Math.floor(Math.random() * 1900); const paid = [500, 1000, 2000].find(n => n > price); due = paid - price; given = [];
        tl.innerHTML = `<div class="l"><span>🛒 Total</span><b>${fmt(price)}</b></div><div class="l"><span>💷 Customer pays</span><b>${fmt(paid)}</b></div><div class="l due"><span>Change to give</span><b style="color:#16a34a">${fmt(due)}</b></div>`; tray.innerHTML = '<span style="color:#64748b;font-size:13px;margin:auto">Tap the coins and notes</span>'; };
      const render = () => { const tot = given.reduce((a, b) => a + b, 0); tray.innerHTML = given.map(v => { const m = MONEY.find(x => x[0] === v); return `<span class="wx-chip ${m[2].replace('note', '').replace('coin', '')}" style="background:${m[2].includes('gold') ? '#fbbf24' : m[2].includes('copper') ? '#c2410c' : m[2].includes('silver') ? '#cbd5e1' : m[2].includes('n10') ? '#ea580c' : '#0d9488'};color:${m[2].includes('silver') || m[2].includes('gold') ? '#1f2937' : '#fff'}">${m[1]}</span>`; }).join('') + `<span style="margin-left:auto;align-self:center;font-weight:900;color:${tot === due ? '#6ee7b7' : '#fff'}">${fmt(tot)}</span>`; };
      const add = (v) => { if (over) return; given.push(v); render(); SFX.tick(); buzz(5); };
      const give = () => { if (over) return; const tot = given.reduce((a, b) => a + b, 0);
        if (tot === due) { served++; S.textContent = served; bump(S); SFX.ding(); buzz(12); floatText(ctx.arena, 140, 30, '😊 Cheers!', '#6ee7b7'); cust(); }
        else { SFX.buzz(); buzz(30); floatText(ctx.arena, 120, 120, tot > due ? 'Too much!' : 'Not enough!', '#f87171'); tray.classList.remove('bad'); } };
      ctx.arena.querySelectorAll('.wx-m').forEach(b => tap(b, () => add(+b.dataset.v)));
      tap(ctx.arena.querySelector('[data-u]'), () => { given.pop(); render(); });
      tap(ctx.arena.querySelector('[data-g]'), give);
      cust();
      const clock = () => { if (!ctx.alive) return; const left = Math.max(0, G - (Date.now() - t0) / 1000); T.textContent = Math.ceil(left); barI.style.transform = `scaleX(${left / G})`;
        if (left <= 0) { over = true; ctx.end(served, 'Till closed! 💷', `customers given the right change in ${G} seconds`, () => { S.textContent = 0; run(); }); return; } requestAnimationFrame(clock); }; clock();
      ctx.auto = () => { const tot = given.reduce((a, b) => a + b, 0); if (tot === due) return give(); const c = MONEY.find(m => m[0] <= due - tot); add(c[0]); };
    };
    ctx.start(run);
  }

  // ---------- 10. Word Scramble ----------
  const SCR = [
    'DIESEL', 'PETROL', 'COFFEE', 'TROLLEY', 'RECEIPT', 'CHILLER', 'COUNTER', 'BARCODE', 'SHELVES', 'SNACKS',
    'DRINKS', 'WIPERS', 'BATTERY', 'LITRES', 'NOZZLE', 'CANOPY', 'KIOSK', 'PASTRY', 'CRISPS', 'TOFFEE',
    'LOTTERY', 'CHANGE', 'WALLET', 'PARKING', 'TRAFFIC', 'ENGINE', 'BRAKES', 'MIRROR', 'GARAGE', 'MANAGER',
    'UNIFORM', 'POSTER', 'WINDOW', 'BUCKET', 'SPONGE', 'MUFFIN', 'BISCUIT', 'CANDLE', 'FLOWERS', 'CHARGER',
    'TICKET', 'DONUTS', 'SAUSAGE', 'CHEESE', 'BANANA', 'ORANGE', 'CUSTARD', 'KETTLE'
  ];
  function scramble(ctx) {
    const G = ctx.opts.seconds || 60;
    ctx.hud.innerHTML = pill('s', 'Words', '0') + pill('t', 'Seconds', G);
    const S = ctx.hud.querySelector('[data-s]'), T = ctx.hud.querySelector('[data-t]'); ctx.bar.hidden = false; const barI = ctx.bar.querySelector('i');
    const run = () => {
      let score = 0, word = '', picked = [], t0 = Date.now(), over = false;
      ctx.arena.innerHTML = `<p class="whg-p" style="text-align:center;margin:10px auto 0">Unscramble the forecourt word</p><div class="wx-slots"></div><div class="wx-tiles"></div>
        <div class="wx-acts"><button data-c style="background:rgba(255,255,255,.12);color:#fff">Clear</button><button data-k style="background:rgba(255,255,255,.12);color:#fff">Skip ⏭</button></div>`;
      const sl = ctx.arena.querySelector('.wx-slots'), tl = ctx.arena.querySelector('.wx-tiles');
      const nextW = () => { word = ctx.opts.words ? ctx.opts.words[score % ctx.opts.words.length] : SCR[bag('whg_scr_bag', SCR.length)]; let mix; do { mix = shuffle([...word]); } while (mix.join('') === word); picked = [];
        sl.className = 'wx-slots'; sl.innerHTML = [...word].map(() => '<div class="wx-sl"></div>').join(''); tl.innerHTML = mix.map((c, i) => `<button class="wx-t" data-i="${i}">${c}</button>`).join('');
        tl.querySelectorAll('.wx-t').forEach(b => tap(b, () => pick(b))); };
      const draw = () => { sl.querySelectorAll('.wx-sl').forEach((s, i) => s.textContent = picked[i] ? picked[i].textContent : ''); };
      const pick = (b) => { if (over || b.classList.contains('used')) return; b.classList.add('used'); picked.push(b); draw(); SFX.tick(); buzz(5);
        if (picked.length === word.length) { const g = picked.map(p => p.textContent).join('');
          if (g === word) { sl.classList.add('ok'); score++; S.textContent = score; bump(S); SFX.ding(); buzz(12); ctx.later(nextW, 550); }
          else { sl.classList.add('bad'); SFX.buzz(); buzz(30); ctx.later(() => { picked.forEach(p => p.classList.remove('used')); picked = []; sl.className = 'wx-slots'; draw(); }, 450); } } };
      tap(ctx.arena.querySelector('[data-c]'), () => { picked.forEach(p => p.classList.remove('used')); picked = []; draw(); });
      tap(ctx.arena.querySelector('[data-k]'), () => { floatText(ctx.arena, 130, 60, word, '#94a3b8'); nextW(); });
      nextW();
      const clock = () => { if (!ctx.alive) return; const left = Math.max(0, G - (Date.now() - t0) / 1000); T.textContent = Math.ceil(left); barI.style.transform = `scaleX(${left / G})`;
        if (left <= 0) { over = true; ctx.end(score, 'Time! 🔤', `words unscrambled in ${G} seconds`, () => { S.textContent = 0; run(); }); return; } requestAnimationFrame(clock); }; clock();
      ctx.auto = () => { const c = word[picked.length]; const b = [...tl.querySelectorAll('.wx-t:not(.used)')].find(x => x.textContent === c); if (b) pick(b); };
    };
    ctx.start(run);
  }

  // ---------- 11. Forecourt Quiz ----------
  const QUIZ = [
    ['What colour is the petrol (unleaded) pump nozzle at most UK forecourts?', 'Green', ['Black', 'Red', 'Blue']],
    ['What colour is the diesel pump nozzle at most UK forecourts?', 'Black', ['Green', 'Yellow', 'White']],
    ['E10 petrol contains up to 10% of what?', 'Ethanol', ['Water', 'Diesel', 'Oil']],
    ['Challenge 25 means you ask for ID if a customer looks under…', '25', ['18', '21', '30']],
    ['How old must someone be to buy alcohol in the UK?', '18', ['16', '17', '21']],
    ['How old must someone be to buy a National Lottery ticket?', '18', ['16', '17', '21']],
    ['How old must someone be to buy tobacco in the UK?', '18', ['16', '17', '21']],
    ['What is the minimum legal tyre tread depth for a car in the UK?', '1.6mm', ['1mm', '2.5mm', '3mm']],
    ['What is the national speed limit for cars on a UK motorway?', '70 mph', ['60 mph', '80 mph', '75 mph']],
    ['What is the usual speed limit in a built-up area?', '30 mph', ['20 mph', '40 mph', '25 mph']],
    ['In Great Britain, a new car needs its first MOT when it is how old?', '3 years', ['1 year', '2 years', '5 years']],
    ['A customer put petrol in a diesel car. What should they NOT do?', 'Start the engine', ['Call for help', 'Push it clear', 'Tell the cashier']],
    ['AdBlue is used in which vehicles?', 'Diesel', ['Petrol', 'Electric', 'Motorbikes']],
    ['Which is the odd one out?', 'Hammer', ['Unleaded', 'Diesel', 'Super unleaded']],
    ['Winnall is part of which city?', 'Winchester', ['Southampton', 'Portsmouth', 'Salisbury']],
    ['Chandlers Ford is next to which town?', 'Eastleigh', ['Andover', 'Fareham', 'Romsey']],
    ['How many pence are in £1?', '100', ['10', '50', '1000']],
    ['How many days are in a leap year?', '366', ['365', '364', '367']],
    ['Which planet is known as the Red Planet?', 'Mars', ['Venus', 'Jupiter', 'Saturn']],
    ['How many sides does a hexagon have?', '6', ['5', '7', '8']],
    ['What is the capital of Scotland?', 'Edinburgh', ['Glasgow', 'Aberdeen', 'Dundee']],
    ['Which ocean is the largest?', 'Pacific', ['Atlantic', 'Indian', 'Arctic']],
    ['How many minutes are in 3 hours?', '180', ['120', '160', '200']],
    ['What do bees make?', 'Honey', ['Milk', 'Jam', 'Syrup']],
    ['Which of these is a fruit?', 'Tomato', ['Carrot', 'Potato', 'Onion']],
    ['What is 25% of £40?', '£10', ['£8', '£12', '£15']],
    ['Change from £20 for a £13.50 sale?', '£6.50', ['£7.50', '£6.00', '£5.50']],
    ['How many litres are in a gallon (roughly)?', '4.5', ['2', '3.2', '6']],
    ['Which gas do plants take in from the air?', 'Carbon dioxide', ['Oxygen', 'Helium', 'Nitrogen']],
    ['What is frozen water called?', 'Ice', ['Steam', 'Fog', 'Dew']],
    ['Which month has the fewest days?', 'February', ['April', 'June', 'November']],
    ['What is the chemical symbol for gold?', 'Au', ['Ag', 'Go', 'Gd']],
  ];
  function quiz(ctx) {
    const N = 10, PER = 10;
    ctx.hud.innerHTML = pill('q', 'Question', `1/${N}`) + pill('s', 'Score', '0');
    const Q = ctx.hud.querySelector('[data-q]'), S = ctx.hud.querySelector('[data-s]');
    const run = () => {
      const picks = []; while (picks.length < N) { const i = bag('whg_quiz_bag', QUIZ.length); if (!picks.includes(i)) picks.push(i); }
      let qi = 0, score = 0, right = 0;
      const ask = () => { const [q, a, wrong] = QUIZ[picks[qi]]; Q.textContent = `${qi + 1}/${N}`; const opts = shuffle([a, ...wrong]); let t0 = Date.now(), answered = false;
        ctx.arena.innerHTML = `<div class="wx-ring"><svg width="70" height="70"><circle cx="35" cy="35" r="30" fill="none" stroke="rgba(255,255,255,.12)" stroke-width="7"/><circle class="arc" cx="35" cy="35" r="30" fill="none" stroke="#fbbf24" stroke-width="7" stroke-linecap="round" stroke-dasharray="188.5" stroke-dashoffset="0"/></svg><b>${PER}</b></div>
          <div class="wx-q">${q}</div><div class="wx-opts">${opts.map((o, i) => `<button class="wx-opt" style="animation-delay:${i * .06}s" data-o="${o}">${['A', 'B', 'C', 'D'][i]}. ${o}</button>`).join('')}</div>`;
        const arc = ctx.arena.querySelector('.arc'), num = ctx.arena.querySelector('.wx-ring b');
        const finish = (btn) => { if (answered) return; answered = true; const ok = btn && btn.dataset.o === a; const left = Math.max(0, PER - (Date.now() - t0) / 1000);
          ctx.arena.querySelectorAll('.wx-opt').forEach(b => { if (b.dataset.o === a) b.classList.add('ok'); else if (b === btn) b.classList.add('no'); });
          if (ok) { right++; const pts = 10 + Math.round(left); score += pts; S.textContent = score; bump(S); SFX.ding(); buzz(12); floatText(ctx.arena, 160, 40, '+' + pts, '#6ee7b7'); } else { SFX.buzz(); buzz(30); }
          ctx.later(() => { qi++; qi < N ? ask() : ctx.end(score, `${right} out of ${N} right!`, 'Points (faster answers score more)', () => { S.textContent = 0; run(); }); }, 1200); };
        ctx.arena.querySelectorAll('.wx-opt').forEach(b => tap(b, () => finish(b)));
        const tick = () => { if (!ctx.alive || answered) return; const left = Math.max(0, PER - (Date.now() - t0) / 1000); num.textContent = Math.ceil(left); arc.style.strokeDashoffset = 188.5 * (1 - left / PER); arc.style.stroke = left < 3 ? '#ef4444' : '#fbbf24'; if (left <= 0) finish(null); else requestAnimationFrame(tick); }; tick();
        ctx.auto = () => { const bs = [...ctx.arena.querySelectorAll('.wx-opt')]; finish(Math.random() < .8 ? bs.find(b => b.dataset.o === a) : bs[0]); };
      };
      ask();
    };
    ctx.start(run);
  }

  // ---------- 12. Car Wash ----------
  function carWash(ctx) {
    ctx.hud.innerHTML = pill('c', 'Clean', '0%') + pill('t', 'Time', '0.00');
    const C = ctx.hud.querySelector('[data-c]'), T = ctx.hud.querySelector('[data-t]');
    const run = () => {
      const W = Math.min(ctx.arena.clientWidth - 24, 380), H = Math.round(W * .62);
      ctx.arena.innerHTML = `<p class="whg-p" style="text-align:center;margin:8px auto 4px">Scrub off all the mud! 🧽</p><div class="wx-wash" style="width:${W}px;height:${H}px">
        <svg viewBox="0 0 200 124" width="${W}" height="${H}" style="position:absolute;inset:0"><rect x="0" y="0" width="200" height="124" rx="14" fill="#0ea5e9" opacity=".25"/>
        <path d="M22 78 Q24 58 46 54 L70 34 Q80 26 100 26 L130 26 Q146 26 156 40 L168 54 Q186 58 184 78 L184 88 L22 88 Z" fill="#dc2626"/>
        <path d="M76 38 Q84 32 100 32 L110 32 L110 54 L62 54 Z M116 32 L128 32 Q142 32 150 44 L156 54 L116 54 Z" fill="#bae6fd"/><rect x="30" y="70" width="14" height="6" rx="3" fill="#fde047"/><rect x="170" y="70" width="10" height="6" rx="3" fill="#fca5a5"/>
        <circle cx="58" cy="90" r="15" fill="#111"/><circle cx="58" cy="90" r="7" fill="#9ca3af"/><circle cx="148" cy="90" r="15" fill="#111"/><circle cx="148" cy="90" r="7" fill="#9ca3af"/><rect x="96" y="60" width="14" height="3" rx="1.5" fill="#7f1d1d"/></svg><canvas></canvas></div>`;
      const box = ctx.arena.querySelector('.wx-wash'), cv = box.querySelector('canvas'), dpr = Math.min(2, devicePixelRatio || 1);
      cv.width = W * dpr; cv.height = H * dpr; cv.style.width = W + 'px'; cv.style.height = H + 'px';
      const g = cv.getContext('2d'); g.scale(dpr, dpr);
      g.fillStyle = '#6b4423'; g.fillRect(0, 0, W, H);
      for (let i = 0; i < 260; i++) { g.fillStyle = ['#5b3a1e', '#7c5230', '#4a2f17', '#8a5a33'][i % 4]; g.beginPath(); g.arc(Math.random() * W, Math.random() * H, 4 + Math.random() * 14, 0, 7); g.fill(); }
      g.fillStyle = 'rgba(255,255,255,.08)'; g.font = `900 ${W / 11}px ${FONT}`; g.textAlign = 'center'; g.fillText('CLEAN ME', W / 2, H / 2 + 10);
      g.globalCompositeOperation = 'destination-out';
      const t0 = performance.now(); let done = false, last = null, pct = 0;
      const scrub = (x, y) => { if (done) return; g.beginPath(); if (last) { g.lineWidth = 46; g.lineCap = 'round'; g.moveTo(last.x, last.y); g.lineTo(x, y); g.stroke(); } g.arc(x, y, 23, 0, 7); g.fill(); last = { x, y };
        if (Math.random() < .25) { const b = document.createElement('div'); b.className = 'wx-bub'; b.textContent = '🫧'; b.style.left = x - 10 + 'px'; b.style.top = y - 10 + 'px'; box.appendChild(b); setTimeout(() => b.remove(), 1000); } };
      const pos = (e) => { const r = cv.getBoundingClientRect(); return { x: e.clientX - r.left, y: e.clientY - r.top }; };
      cv.addEventListener('pointerdown', (e) => { e.preventDefault(); cv.setPointerCapture(e.pointerId); last = null; const p = pos(e); scrub(p.x, p.y); SFX.tick(); });
      cv.addEventListener('pointermove', (e) => { if (e.buttons || e.pointerType === 'touch') { const p = pos(e); scrub(p.x, p.y); } });
      cv.addEventListener('pointerup', () => last = null);
      const measure = () => { if (!ctx.alive || done) return; const d = g.getImageData(0, 0, cv.width, cv.height).data; let clear = 0, n = 0; for (let i = 3; i < d.length; i += 4 * 97) { n++; if (d[i] < 40) clear++; }
        pct = Math.round(clear / n * 100); C.textContent = pct + '%'; T.textContent = ((performance.now() - t0) / 1000).toFixed(2);
        if (pct >= 92) { done = true; const total = performance.now() - t0; g.clearRect(0, 0, W, H); SFX.win(); ctx.later(() => ctx.end(Math.round(total), 'Sparkling! ✨', 'time to wash the car', run, { lower: true, fmt: secs }), 700); return; }
        ctx.later(measure, 200); };
      measure();
      let ax = 0, ay = 0, dir = 1; ctx.auto = () => { if (last === null) { ax = 10; ay = 12; } ax += dir * 34; if (ax > W - 10 || ax < 10) { dir *= -1; ay += 30; if (ay > H) ay = 12 + Math.random() * 20; } scrub(ax, ay); };
    };
    ctx.start(run);
  }

  // ---------- 13. Queue Buster ----------
  const CARS = ['🚗', '🚙', '🚕', '🛻', '🚐', '🏎️'];
  function queue(ctx) {
    const G = ctx.opts.seconds || 60;
    ctx.hud.innerHTML = pill('s', 'Served', '0') + pill('t', 'Seconds', G);
    const S = ctx.hud.querySelector('[data-s]'), T = ctx.hud.querySelector('[data-t]'); ctx.bar.hidden = false; const barI = ctx.bar.querySelector('i');
    const run = () => {
      let served = 0, t0 = Date.now(), over = false, q = [];
      ctx.arena.innerHTML = `<div class="wx-lane">${[1, 2, 3, 4].map(i => `<div class="wx-bay" data-b="${i}"><span class="p">⛽ ${i}</span></div>`).join('')}</div>
        <div class="wx-queue"></div><p class="whg-p" style="text-align:center;margin:0 auto">Tap a waiting car to send it to a free pump. When it's full, tap the pump to take payment.</p>`;
      const bays = [...ctx.arena.querySelectorAll('.wx-bay')].map(el => ({ el, car: null, full: false })), qel = ctx.arena.querySelector('.wx-queue');
      const renderQ = () => { qel.innerHTML = ''; q.forEach(c => { const d = document.createElement('div'); d.className = 'wx-qcar'; d.innerHTML = `${c.e}<div class="pt"><i style="width:${Math.max(0, c.p * 100)}%;background:${c.p < .3 ? '#ef4444' : '#fbbf24'}"></i></div>`; tap(d, () => send(c, d)); c.d = d; qel.appendChild(d); }); };
      const send = (c, d) => { if (over) return; const b = bays.find(x => !x.car); if (!b) { d.classList.remove('shake'); void d.offsetWidth; d.classList.add('shake'); SFX.buzz(); return; }
        q = q.filter(x => x !== c); b.car = c; b.full = false; b.el.insertAdjacentHTML('beforeend', `<div class="car">${c.e}</div><div class="fuel"><i></i></div>`); SFX.tick(); buzz(6);
        const fi = b.el.querySelector('.fuel i'); fi.style.transition = 'none'; requestAnimationFrame(() => { fi.style.transition = `width ${c.f}ms linear`; fi.style.width = '100%'; });
        ctx.later(() => { if (b.car === c) { b.full = true; b.el.classList.add('pay'); SFX.ding(); } }, c.f); renderQ(); };
      bays.forEach(b => tap(b.el, () => { if (!b.full || over) return; const car = b.el.querySelector('.car'); car.style.transform = 'translateY(-120px)'; b.full = false; b.el.classList.remove('pay'); served++; S.textContent = served; bump(S); SFX.win(); buzz(10);
        const r = b.el.getBoundingClientRect(), ar = ctx.arena.getBoundingClientRect(); floatText(ctx.arena, r.left - ar.left + 10, r.top - ar.top + 30, '😊 +1', '#6ee7b7');
        ctx.later(() => { b.car = null; b.el.innerHTML = `<span class="p">⛽ ${b.el.dataset.b}</span>`; }, 350); }));
      let lastSpawn = 0;
      const loop = () => { if (!ctx.alive) return; const el = (Date.now() - t0) / 1000, left = Math.max(0, G - el); T.textContent = Math.ceil(left); barI.style.transform = `scaleX(${left / G})`;
        if (left <= 0) { over = true; ctx.end(served, 'Rush hour over! 🚗', `cars filled and paid in ${G} seconds`, () => { S.textContent = 0; run(); }); return; }
        const every = Math.max(1100, 2400 - el * 30); if (Date.now() - lastSpawn > every && q.length < 7) { lastSpawn = Date.now(); q.push({ e: CARS[Math.floor(Math.random() * CARS.length)], p: 1, f: 2200 + Math.random() * 1800 }); renderQ(); }
        let changed = false; q.forEach(c => { c.p -= .0025; if (c.d) { const i = c.d.querySelector('.pt i'); i.style.width = Math.max(0, c.p * 100) + '%'; i.style.background = c.p < .3 ? '#ef4444' : '#fbbf24'; } });
        const gone = q.filter(c => c.p <= 0); if (gone.length) { q = q.filter(c => c.p > 0); changed = true; SFX.buzz(); floatText(ctx.arena, 40, 190, '😠 Drove off', '#f87171'); }
        if (changed) renderQ(); requestAnimationFrame(loop); };
      loop();
      ctx.auto = () => { const pay = bays.find(b => b.full); if (pay) return pay.el.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true })); if (q[0] && bays.some(b => !b.car)) send(q[0], q[0].d); };
    };
    ctx.start(run);
  }

  // ---------- 14. Crate Stack ----------
  function stack(ctx) {
    ctx.hud.innerHTML = pill('s', 'Crates', '0') + pill('p', 'Perfect', '0');
    const S = ctx.hud.querySelector('[data-s]'), P = ctx.hud.querySelector('[data-p]');
    const run = () => {
      ctx.arena.innerHTML = '<div class="wx-stack"></div><p class="whg-p" style="position:absolute;left:0;right:0;bottom:14px;text-align:center;margin:0 auto">Tap anywhere to drop the crate</p>';
      const box = ctx.arena.querySelector('.wx-stack'), W = box.clientWidth, H = box.clientHeight, CH = 34;
      let top = { x: W / 2 - 80, w: 160 }, level = 0, score = 0, perfect = 0, cur, dir = 1, speed = 150, off = 0, over = false, lastF = performance.now();
      const mk = (x, w, lvl, cls) => { const d = document.createElement('div'); d.className = 'wx-crate' + (cls ? ' ' + cls : ''); d.style.left = x + 'px'; d.style.width = w + 'px'; d.style.bottom = (60 + lvl * CH - off) + 'px'; box.appendChild(d); return d; };
      mk(top.x, top.w, 0).style.background = '#475569';
      const spawn = () => { level++; cur = { x: 0, w: top.w, el: null }; cur.el = mk(0, top.w, level); dir = 1; speed = 150 + level * 12; };
      spawn();
      const frame = (now) => { if (!ctx.alive || over) return; const dt = Math.min(.04, (now - lastF) / 1000); lastF = now; cur.x += dir * speed * dt; if (cur.x + cur.w > W) { cur.x = W - cur.w; dir = -1; } if (cur.x < 0) { cur.x = 0; dir = 1; } cur.el.style.left = cur.x + 'px'; requestAnimationFrame(frame); };
      requestAnimationFrame(frame);
      const drop = () => { if (over) return;
        let dx = cur.x - top.x; if (Math.abs(dx) < 5) { dx = 0; cur.x = top.x; perfect++; P.textContent = perfect; bump(P); floatText(ctx.arena, W / 2 - 40, H - 120 - Math.min(level, 8) * CH, 'PERFECT!', '#fde047'); SFX.win(); }
        const ov = cur.w - Math.abs(dx);
        if (ov <= 0) { over = true; cur.el.classList.add('fall'); cur.el.style.transform = 'translateY(400px) rotate(40deg)'; SFX.buzz(); buzz([40, 30, 40]); ctx.later(() => ctx.end(score, 'Timber! 📦', 'crates stacked', () => { S.textContent = 0; P.textContent = 0; run(); }), 900); return; }
        if (dx) { const cutX = dx > 0 ? top.x + top.w : cur.x, cutW = Math.abs(dx); const piece = mk(cutX, cutW, level, ''); piece.style.opacity = .9; requestAnimationFrame(() => { piece.classList.add('fall'); piece.style.transform = `translateY(300px) rotate(${dx > 0 ? 50 : -50}deg)`; }); setTimeout(() => piece.remove(), 1000); SFX.ding(); }
        const nx = dx > 0 ? cur.x : top.x; cur.el.style.left = nx + 'px'; cur.el.style.width = ov + 'px'; top = { x: nx, w: ov }; score++; S.textContent = score; bump(S); buzz(10);
        if (60 + (level + 1) * CH - off > H * .55) { off += CH; box.querySelectorAll('.wx-crate').forEach(c => { c.style.transition = 'bottom .3s'; c.style.bottom = (parseFloat(c.style.bottom) - CH) + 'px'; }); }
        spawn(); };
      tap(ctx.arena, drop);
      ctx.auto = () => { if (Math.abs(cur.x - top.x) < 8 + Math.random() * 18) drop(); };
    };
    ctx.start(run);
  }

  // ---------- 15. Pump Simon ----------
  const PADS = [['#dc2626', '⛽', 330], ['#f59e0b', '💳', 392], ['#16a34a', '🛒', 494], ['#2563eb', '☕', 587]];
  function simon(ctx) {
    ctx.hud.innerHTML = pill('r', 'Round', '0') + pill('b', 'Best', getBest('simon') || '–');
    const Rr = ctx.hud.querySelector('[data-r]');
    const run = () => {
      let seq = [], idx = 0, accept = false, over = false;
      ctx.arena.innerHTML = `<div class="wx-msg">Watch the pumps…</div><div class="wx-simon">${PADS.map((p, i) => `<button class="wx-sp" data-i="${i}" style="background:${p[0]}">${p[1]}</button>`).join('')}</div><p class="whg-p" style="text-align:center;margin:10px auto 0">Repeat the pattern. It gets one longer each round.</p>`;
      const pads = [...ctx.arena.querySelectorAll('.wx-sp')], msg = ctx.arena.querySelector('.wx-msg');
      const flash = (i, ms) => { pads[i].classList.add('lit'); tone([PADS[i][2]], (ms || 380) / 1000, 'triangle', .16); setTimeout(() => pads[i].classList.remove('lit'), ms || 380); };
      const play = () => { accept = false; msg.textContent = 'Watch the pumps…'; msg.style.color = '#fff'; seq.push(Math.floor(Math.random() * 4)); Rr.textContent = seq.length; bump(Rr);
        const gap = Math.max(260, 560 - seq.length * 20); seq.forEach((p, i) => ctx.later(() => flash(p, gap * .7), 600 + i * gap)); ctx.later(() => { accept = true; idx = 0; msg.textContent = 'Your turn!'; msg.style.color = '#fbbf24'; }, 600 + seq.length * gap); };
      pads.forEach((p, i) => tap(p, () => { if (!accept || over) return; flash(i, 200); buzz(6);
        if (i !== seq[idx]) { over = true; accept = false; SFX.buzz(); buzz([40, 30, 40]); msg.textContent = 'Oops! Wrong pump'; msg.style.color = '#f87171'; ctx.later(() => ctx.end(seq.length - 1, 'Game over! ⛽', 'rounds remembered', () => run()), 900); return; }
        idx++; if (idx === seq.length) { accept = false; SFX.ding(); msg.textContent = '✓ Nice!'; msg.style.color = '#6ee7b7'; ctx.later(play, 700); } }));
      play();
      ctx.auto = () => { if (accept) pads[seq[idx]].dispatchEvent(new PointerEvent('pointerdown', { bubbles: true })); };
    };
    ctx.start(run);
  }

  [
    { id: 'racer', icon: '🏎️', name: 'Forecourt Racer', how: 'Race 3 laps round the forecourt. Hold ◀ ▶ to steer, miss the cones and pumps. Fastest time wins.', fn: racer },
    { id: 'shelves', icon: '🛒', name: 'Shelf Stacker', how: 'Fill all 12 spaces on the shelves as fast as you can. Wrong space costs 2 seconds.', fn: shelves },
    { id: 'coffee', icon: '☕', name: 'Coffee Rush', how: 'Make each drink to order before the customer gets fed up. Cup first, then the right ingredients.', fn: coffee },
    { id: 'fuelup', icon: '⛽', name: 'Fuel Up', how: 'Hold to fill and let go on the exact amount. It speeds up the longer you hold! 5 rounds.', fn: fuelUp },
    { id: 'till', icon: '💷', name: 'Till Change', how: 'Give each customer the right change with notes and coins. How many can you serve in 60 seconds?', fn: till },
    { id: 'scramble', icon: '🔤', name: 'Word Scramble', how: 'Unscramble forecourt words. A new set every time you play.', fn: scramble },
    { id: 'quiz', icon: '❓', name: 'Forecourt Quiz', how: '10 quick questions. Faster answers score more points.', fn: quiz },
    { id: 'wash', icon: '🧽', name: 'Car Wash', how: 'Scrub the mud off the car as fast as you can. Rub your finger all over it!', fn: carWash },
    { id: 'queue', icon: '🚗', name: 'Queue Buster', how: 'Send cars to free pumps, then take payment when they are full. Keep the queue moving!', fn: queue },
    { id: 'stack', icon: '📦', name: 'Crate Stack', how: 'Drop each crate on the stack. Anything hanging over falls off. How high can you go?', fn: stack },
    { id: 'simon', icon: '🔴', name: 'Pump Simon', how: 'Watch the pumps light up, then repeat the pattern. One longer every round.', fn: simon },
  ].forEach(register);

  // ---------- weekly featured game + Arcade ----------
  const weekNo = () => { const d = new Date(); const day = (d.getDay() + 6) % 7; d.setDate(d.getDate() - day); d.setHours(0, 0, 0, 0); return Math.floor(d.getTime() / (7 * 864e5)); };
  // The featured game changes every Monday and has the SJC-wide leaderboard. All 15 are always in the Arcade.
  window.whGameOfWeek = function () { return GAMES[weekNo() % GAMES.length]; };
  window.whArcade = function (opts) {
    opts = opts || {}; const feat = opts.featured ? GAMES.find(g => g.id === opts.featured) : whGameOfWeek();
    const a = document.createElement('div'); a.className = 'wx-arc';
    const d = new Date(); const daysLeft = 7 - ((d.getDay() + 6) % 7);
    a.innerHTML = `<div style="display:flex;align-items:center;gap:10px"><h2 style="flex:1">🎮 SJC Arcade</h2><button class="whg-ib" data-x>✕</button></div>
      <div class="wx-feat" data-g="${feat.id}"><div class="ic">${feat.icon}</div><div style="flex:1"><div style="font-size:12px;font-weight:800;letter-spacing:.1em;text-transform:uppercase;opacity:.85">⭐ Game of the week · ${daysLeft} day${daysLeft > 1 ? 's' : ''} left</div>
        <div style="font-size:23px;font-weight:900;margin:2px 0">${feat.name}</div><div style="font-size:14px;opacity:.9">${opts.pos ? `You're <b>${opts.pos}</b> on the SJC leaderboard` : 'Top the SJC leaderboard this week!'}</div></div><div style="background:#fff;color:#b91c1c;font-weight:900;border-radius:12px;padding:10px 14px">Play</div></div>
      <div style="font-size:12px;font-weight:800;letter-spacing:.1em;text-transform:uppercase;color:#94a3b8;margin:18px 0 10px">All ${GAMES.length} games</div>
      <div class="wx-grid">${GAMES.map((g, i) => { const b = getBest(g.id); return `<button class="wx-gt" data-g="${g.id}" style="animation-delay:${i * .03}s"><i>${g.icon}</i>${g.name}<small>${b ? 'Best ' + (['racer', 'shelves', 'wash'].includes(g.id) ? (b / 1000).toFixed(2) + 's' : b) : 'Not played'}</small></button>`; }).join('')}</div>`;
    document.body.appendChild(a); requestAnimationFrame(() => a.classList.add('show'));
    a.querySelector('[data-x]').onclick = () => { a.classList.remove('show'); setTimeout(() => a.remove(), 250); };
    a.querySelectorAll('[data-g]').forEach(b => b.onclick = () => whPlayGame(b.dataset.g, opts.playOpts ? opts.playOpts(b.dataset.g) : {}));
    return a;
  };
})();
