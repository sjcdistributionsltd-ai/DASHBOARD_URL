// WorkHive "Game of the week" for SJC Fuel Services staff. Four short games that rotate
// every Monday. Runs entirely on the phone: no data is sent anywhere, personal bests are kept
// on the phone. Nothing runs until a game is opened, and everything stops when it closes.
// Uses whConfetti from celebrate.js when present.
(function () {
  const reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  const css = `
  .whg{position:fixed;inset:0;z-index:9997;background:radial-gradient(ellipse at 50% 0%,#1e3a8a 0%,#0f172a 60%);color:#f1f5f9;display:flex;flex-direction:column;font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",system-ui,sans-serif;opacity:0;transition:opacity .25s;touch-action:manipulation;user-select:none;-webkit-user-select:none}
  .whg.show{opacity:1}
  .whg-top{display:flex;align-items:center;gap:10px;padding:calc(14px + env(safe-area-inset-top)) 16px 10px}
  .whg-title{font-weight:800;font-size:18px;flex:1;display:flex;align-items:center;gap:8px}
  .whg-ib{width:40px;height:40px;border-radius:12px;border:0;background:rgba(255,255,255,.1);color:#fff;font-size:18px;display:grid;place-items:center}
  .whg-hud{display:flex;gap:10px;padding:0 16px 10px}
  .whg-pill{flex:1;background:rgba(255,255,255,.08);border-radius:14px;padding:8px 12px;text-align:center}
  .whg-pill b{display:block;font-size:24px;font-variant-numeric:tabular-nums;line-height:1.1}
  .whg-pill span{font-size:11px;text-transform:uppercase;letter-spacing:.08em;color:#94a3b8;font-weight:700}
  .whg-pill b.bump{animation:whgBump .25s cubic-bezier(.34,1.56,.64,1)}
  .whg-bar{height:6px;margin:0 16px 8px;border-radius:9px;background:rgba(255,255,255,.1);overflow:hidden}
  .whg-bar i{display:block;height:100%;width:100%;background:linear-gradient(90deg,#fbbf24,#f59e0b);transform-origin:left}
  .whg-arena{position:relative;flex:1;overflow:hidden}
  .whg-float{position:absolute;font-weight:900;font-size:20px;pointer-events:none;animation:whgFloat .8s ease-out forwards;text-shadow:0 2px 6px rgba(0,0,0,.4)}
  .whg-start,.whg-end{position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;padding:24px;gap:10px;z-index:5;background:rgba(15,23,42,.72);backdrop-filter:blur(3px)}
  .whg-big{font-size:64px;line-height:1;animation:whgBob 1.8s ease-in-out infinite}
  .whg-h{font:800 28px/1.15 -apple-system,BlinkMacSystemFont,"Segoe UI",system-ui,sans-serif;margin:0}
  .whg-p{color:#94a3b8;font-size:15px;max-width:30ch;margin:0}
  .whg-btn{margin-top:10px;min-width:220px;padding:16px 22px;border:0;border-radius:16px;background:#fbbf24;color:#0f172a;font:800 18px -apple-system,BlinkMacSystemFont,"Segoe UI",system-ui,sans-serif;box-shadow:0 6px 0 #b45309;transition:transform .08s}
  .whg-btn:active{transform:translateY(4px);box-shadow:0 2px 0 #b45309}
  .whg-btn.sec{background:rgba(255,255,255,.1);color:#fff;box-shadow:none;font-size:15px;padding:12px 18px}
  .whg-score{font:900 72px/1 -apple-system,BlinkMacSystemFont,"Segoe UI",system-ui,sans-serif;color:#fbbf24;font-variant-numeric:tabular-nums}
  .whg-best{display:inline-block;background:rgba(16,185,129,.18);color:#6ee7b7;font-weight:800;border-radius:99px;padding:6px 12px;font-size:14px;animation:whgBump .5s cubic-bezier(.34,1.56,.64,1)}
  .whg-cd{font:900 120px/1 -apple-system,BlinkMacSystemFont,"Segoe UI",system-ui,sans-serif;color:#fbbf24;animation:whgCd .8s ease-out}
  /* balloon blitz */
  .whg-bal{position:absolute;left:0;top:0;width:62px;will-change:transform;cursor:pointer}
  .whg-bal svg{display:block;width:100%;height:auto;overflow:visible;filter:drop-shadow(0 6px 8px rgba(0,0,0,.3))}
  .whg-bal.pop svg{animation:whgPop .2s ease-out forwards}
  /* hangman */
  .whg-hm{display:flex;flex-direction:column;align-items:center;padding:6px 16px 16px;gap:14px;height:100%}
  .whg-gauge{width:220px;height:124px;position:relative}
  .whg-gauge svg{width:100%;height:100%;overflow:visible}
  .whg-needle{transform-origin:110px 110px;transition:transform .7s cubic-bezier(.34,1.56,.64,1)}
  .whg-hint{font-size:15px;color:#cbd5e1;text-align:center}
  .whg-hint b{color:#fbbf24}
  .whg-tiles{display:flex;gap:10px;perspective:600px}
  .whg-tile{width:58px;height:70px;position:relative;transform-style:preserve-3d;transition:transform .5s}
  .whg-tile.open{transform:rotateY(180deg)}
  .whg-tile>div{position:absolute;inset:0;border-radius:12px;display:grid;place-items:center;backface-visibility:hidden;font:900 34px -apple-system,BlinkMacSystemFont,"Segoe UI",system-ui,sans-serif}
  .whg-tile .f{background:rgba(255,255,255,.08);border:2px dashed rgba(255,255,255,.2)}
  .whg-tile .b{background:linear-gradient(145deg,#fcd34d,#f59e0b);color:#0f172a;transform:rotateY(180deg);box-shadow:0 6px 0 #b45309}
  .whg-keys{display:grid;grid-template-columns:repeat(7,1fr);gap:6px;width:100%;max-width:380px;margin-top:auto}
  .whg-key{height:46px;border:0;border-radius:10px;background:rgba(255,255,255,.12);color:#fff;font:800 18px -apple-system,BlinkMacSystemFont,"Segoe UI",system-ui,sans-serif;box-shadow:0 3px 0 rgba(0,0,0,.35)}
  .whg-key.ok{background:#10b981;animation:whgBump .3s}
  .whg-key.no{background:#475569;color:#94a3b8;animation:whgShake .35s}
  .whg-key:disabled{opacity:1}
  .whg-lives{font-size:13px;color:#94a3b8}
  /* memory */
  .whg-mem{display:grid;grid-template-columns:repeat(3,1fr);gap:10px;padding:8px 16px 16px;perspective:900px;max-width:400px;margin:0 auto;width:100%}
  .whg-card{aspect-ratio:3/3.6;position:relative;transform-style:preserve-3d;transition:transform .45s cubic-bezier(.3,1.3,.6,1);cursor:pointer}
  .whg-card.up,.whg-card.done{transform:rotateY(180deg)}
  .whg-card>div{position:absolute;inset:0;border-radius:14px;display:grid;place-items:center;backface-visibility:hidden}
  .whg-card .f{background:linear-gradient(145deg,#dc2626,#991b1b);box-shadow:0 5px 0 #7f1d1d;font-size:30px}
  .whg-card .f::after{content:'';position:absolute;inset:7px;border-radius:9px;border:2px solid rgba(251,191,36,.6)}
  .whg-card .b{background:#f8fafc;transform:rotateY(180deg);font-size:44px;box-shadow:0 5px 0 #cbd5e1}
  .whg-card.done .b{animation:whgGlow .6s ease-out;background:#ecfdf5}
  /* go+ grab */
  .whg-pumps{display:grid;grid-template-columns:repeat(3,1fr);gap:14px 12px;padding:10px 20px;max-width:400px;margin:0 auto;width:100%}
  .whg-pump{position:relative;height:150px;display:flex;align-items:flex-end;justify-content:center}
  .whg-pump .base{width:70px;height:78px;border-radius:12px 12px 6px 6px;background:linear-gradient(180deg,#fbbf24,#f59e0b);position:relative;z-index:2;box-shadow:0 5px 0 #b45309;display:grid;place-items:center;font-size:22px;font-weight:900;color:#78350f;padding-top:26px}
  .whg-pump .base::before{content:'';position:absolute;top:10px;left:14px;right:14px;height:18px;border-radius:5px;background:#0f172a;opacity:.85}
  .whg-pop{position:absolute;bottom:40px;left:50%;width:64px;height:44px;margin-left:-32px;border-radius:8px;z-index:3;transform:translateY(30px) scale(.4);opacity:0;transition:transform .18s cubic-bezier(.34,1.56,.64,1),opacity .12s;display:grid;place-items:center;font:900 13px -apple-system,BlinkMacSystemFont,"Segoe UI",system-ui,sans-serif;cursor:pointer}
  .whg-pop.up{transform:translateY(-58px) scale(1);opacity:1}
  .whg-pop.go{background:linear-gradient(135deg,#dc2626,#fbbf24);color:#fff;box-shadow:0 6px 14px rgba(0,0,0,.35)}
  .whg-pop.go::before{content:'GO+';letter-spacing:.04em}
  .whg-pop.spill{background:#334155;font-size:26px}
  .whg-pop.hit{animation:whgHit .25s ease-out forwards}
  .whg-card-week{background:linear-gradient(135deg,rgba(59,130,246,.2),rgba(251,191,36,.14));border:1px solid rgba(96,165,250,.35);border-radius:14px;padding:16px;margin-bottom:16px;display:flex;gap:14px;align-items:center;cursor:pointer}
  .whg-card-week .ic{width:56px;height:56px;border-radius:16px;background:rgba(255,255,255,.1);display:grid;place-items:center;font-size:30px;flex-shrink:0;animation:whgBob 2.2s ease-in-out infinite}
  .whg-card-week b{display:block;font-size:16px}
  .whg-card-week span{font-size:13px;color:var(--muted,#94a3b8)}
  .whg-card-week .go{margin-left:auto;background:#fbbf24;color:#0f172a;font-weight:800;border-radius:12px;padding:10px 14px;font-size:14px;flex-shrink:0}
  .whg-lb{width:100%;max-width:300px;background:rgba(255,255,255,.06);border-radius:14px;padding:10px 14px;margin-top:6px;text-align:left}
  .whg-lb div{display:flex;justify-content:space-between;padding:4px 0;font-size:14px}
  .whg-lb div.me{color:#fbbf24;font-weight:800}
  @keyframes whgBump{0%{transform:scale(1)}40%{transform:scale(1.3)}100%{transform:scale(1)}}
  @keyframes whgFloat{from{opacity:1;transform:translateY(0) scale(1)}to{opacity:0;transform:translateY(-50px) scale(1.3)}}
  @keyframes whgPop{0%{transform:scale(1)}60%{transform:scale(1.4);opacity:.5}100%{transform:scale(1.7);opacity:0}}
  @keyframes whgBob{0%,100%{transform:translateY(0) rotate(-3deg)}50%{transform:translateY(-6px) rotate(3deg)}}
  @keyframes whgCd{from{transform:scale(2);opacity:0}to{transform:scale(1);opacity:1}}
  @keyframes whgShake{0%,100%{transform:translateX(0)}25%{transform:translateX(-5px)}75%{transform:translateX(5px)}}
  @keyframes whgGlow{0%{box-shadow:0 0 0 0 rgba(16,185,129,.9)}100%{box-shadow:0 0 0 16px rgba(16,185,129,0)}}
  @keyframes whgHit{from{transform:translateY(-58px) scale(1);opacity:1}to{transform:translateY(-110px) scale(1.4);opacity:0}}
  @media (prefers-reduced-motion: reduce){.whg-big,.whg-card-week .ic{animation:none}}
  `;
  const st = document.createElement('style'); st.textContent = css; document.head.appendChild(st);

  // ---------- sound (synthesised, no files; can be muted) ----------
  let actx = null, muted = false;
  try { muted = localStorage.getItem('whg_muted') === '1'; } catch (_) {}
  function tone(freqs, dur, type, vol) {
    if (muted) return;
    try {
      actx = actx || new (window.AudioContext || window.webkitAudioContext)();
      const t = actx.currentTime;
      freqs.forEach((f, i) => { const o = actx.createOscillator(), g = actx.createGain(); o.type = type || 'sine'; o.frequency.value = f;
        const s = t + i * dur * .8; g.gain.setValueAtTime(0, s); g.gain.linearRampToValueAtTime(vol || .15, s + .01); g.gain.exponentialRampToValueAtTime(.001, s + dur);
        o.connect(g).connect(actx.destination); o.start(s); o.stop(s + dur + .02); });
    } catch (_) {}
  }
  function pop() {
    if (muted) return;
    try {
      actx = actx || new (window.AudioContext || window.webkitAudioContext)();
      const t = actx.currentTime, len = .1, buf = actx.createBuffer(1, actx.sampleRate * len, actx.sampleRate), d = buf.getChannelData(0);
      for (let i = 0; i < d.length; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / d.length, 5);
      const src = actx.createBufferSource(); src.buffer = buf; const bp = actx.createBiquadFilter(); bp.type = 'bandpass'; bp.frequency.value = 1100 + Math.random() * 700;
      const g = actx.createGain(); g.gain.value = .9; src.connect(bp).connect(g).connect(actx.destination); src.start(t);
    } catch (_) {}
  }
  const SFX = { pop, ding: () => tone([880, 1320], .12), buzz: () => tone([160, 120], .16, 'square', .06), win: () => tone([523, 659, 784, 1047], .16, 'triangle', .14), tick: () => tone([660], .06, 'sine', .08) };
  const buzz = (p) => { try { navigator.vibrate && navigator.vibrate(p); } catch (_) {} };

  // ---------- helpers ----------
  const weekKey = () => { const d = new Date(); const day = (d.getDay() + 6) % 7; d.setDate(d.getDate() - day); return d.toISOString().slice(0, 10); };
  const bestKey = (id) => `whg_best_${id}_${weekKey()}`;
  const getBest = (id) => { try { return +localStorage.getItem(bestKey(id)) || 0; } catch (_) { return 0; } };
  const setBest = (id, v) => { try { localStorage.setItem(bestKey(id), String(v)); } catch (_) {} };
  function floatText(arena, x, y, txt, color) {
    const f = document.createElement('div'); f.className = 'whg-float'; f.textContent = txt; f.style.left = x + 'px'; f.style.top = y + 'px'; f.style.color = color || '#fbbf24';
    arena.appendChild(f); setTimeout(() => f.remove(), 800);
  }
  function bump(el) { el.classList.remove('bump'); void el.offsetWidth; el.classList.add('bump'); }

  // ---------- shell: open a game full screen ----------
  function shell(game, opts) {
    const root = document.createElement('div'); root.className = 'whg';
    root.innerHTML = `<div class="whg-top"><div class="whg-title">${game.icon} ${game.name}</div>
      <button class="whg-ib" data-mute aria-label="Sound">${muted ? '🔇' : '🔊'}</button><button class="whg-ib" data-x aria-label="Close">✕</button></div>
      <div class="whg-hud"></div><div class="whg-bar" hidden><i></i></div><div class="whg-arena"></div>`;
    document.body.appendChild(root); requestAnimationFrame(() => root.classList.add('show'));
    const ctx = { root, hud: root.querySelector('.whg-hud'), bar: root.querySelector('.whg-bar'), arena: root.querySelector('.whg-arena'), alive: true, timers: [], opts: opts || {} };
    ctx.later = (f, ms) => { const t = setTimeout(() => ctx.alive && f(), ms); ctx.timers.push(t); return t; };
    ctx.close = () => { ctx.alive = false; ctx.timers.forEach(clearTimeout); root.classList.remove('show'); setTimeout(() => root.remove(), 250); };
    root.querySelector('[data-x]').onclick = ctx.close;
    root.querySelector('[data-mute]').onclick = (e) => { muted = !muted; e.currentTarget.textContent = muted ? '🔇' : '🔊'; try { localStorage.setItem('whg_muted', muted ? '1' : '0'); } catch (_) {} };
    ctx.start = (fn) => {
      const s = document.createElement('div'); s.className = 'whg-start';
      s.innerHTML = `<div class="whg-big">${game.icon}</div><h2 class="whg-h">${game.name}</h2><p class="whg-p">${game.how}</p>
        <p class="whg-p" style="font-size:13px">Your best this week: <b style="color:#fbbf24">${getBest(game.id) || '–'}</b></p><button class="whg-btn">Play</button>`;
      ctx.arena.appendChild(s);
      s.querySelector('button').onclick = () => {
        s.innerHTML = '<div class="whg-cd">3</div>'; SFX.tick();
        let n = 3; const step = () => { n--; if (!ctx.alive) return; if (n > 0) { s.innerHTML = `<div class="whg-cd">${n}</div>`; SFX.tick(); ctx.later(step, 650); } else { s.innerHTML = '<div class="whg-cd" style="font-size:80px">GO!</div>'; SFX.ding(); ctx.later(() => { s.remove(); fn(); }, 450); } };
        ctx.later(step, 650);
      };
      if (ctx.opts.autostart) ctx.later(() => s.querySelector('button').click(), 300);
    };
    ctx.end = (score, title, sub, again) => {
      const prev = getBest(game.id), best = score > prev; if (best) setBest(game.id, score);
      const e = document.createElement('div'); e.className = 'whg-end';
      const lb = (ctx.opts.board || []).concat([{ n: 'You', s: Math.max(score, prev), me: 1 }]).sort((a, b) => b.s - a.s).slice(0, 4);
      e.innerHTML = `<div class="whg-big">${best ? '🏆' : '🎉'}</div><h2 class="whg-h">${title}</h2><div class="whg-score">${score}</div><p class="whg-p">${sub || ''}</p>
        ${best ? `<div class="whg-best">⭐ New personal best!</div>` : `<p class="whg-p" style="font-size:13px">Your best this week: ${prev}</p>`}
        ${ctx.opts.board ? `<div class="whg-lb"><div style="font-size:11px;color:#94a3b8;text-transform:uppercase;letter-spacing:.08em;font-weight:800">${ctx.opts.boardName || 'Top scores this week'}</div>${lb.map(r => `<div class="${r.me ? 'me' : ''}"><span>${r.n}</span><b>${r.s}</b></div>`).join('')}</div>` : ''}
        <button class="whg-btn">Play again</button><button class="whg-btn sec">Done</button>`;
      ctx.arena.appendChild(e);
      e.querySelector('.whg-btn').onclick = () => { e.remove(); again(); };
      e.querySelector('.whg-btn.sec').onclick = ctx.close;
      SFX.win(); buzz([20, 40, 20]);
      if (best && window.whConfetti) whConfetti(true);
    };
    return ctx;
  }

  // ---------- 1. Balloon Blitz ----------
  const COLS = [['#fcd34d', '#f59e0b'], ['#f87171', '#dc2626'], ['#6ee7b7', '#10b981'], ['#93c5fd', '#3b82f6'], ['#f9a8d4', '#ec4899'], ['#c4b5fd', '#8b5cf6']];
  function balSVG(c, gold) {
    const g = 'b' + Math.random().toString(36).slice(2, 7);
    return `<svg viewBox="0 0 64 110"><defs><radialGradient id="${g}" cx="35%" cy="30%" r="75%"><stop offset="0" stop-color="${gold ? '#fff7cc' : c[0]}"/><stop offset="1" stop-color="${gold ? '#d97706' : c[1]}"/></radialGradient></defs>
      <path d="M32 78 C 29 90, 36 98, 31 110" fill="none" stroke="rgba(255,255,255,.5)" stroke-width="1.4"/><ellipse cx="32" cy="38" rx="28" ry="34" fill="url(#${g})"/>
      <path d="M27 72 L37 72 L32 79 Z" fill="${gold ? '#b45309' : c[1]}"/><ellipse cx="22" cy="24" rx="6" ry="10" fill="rgba(255,255,255,.45)" transform="rotate(-20 22 24)"/>
      ${gold ? '<text x="32" y="46" text-anchor="middle" font-size="22" font-weight="900" fill="#fff">+5</text>' : ''}</svg>`;
  }
  function balloonBlitz(ctx) {
    const G = ctx.opts.seconds || 60;
    ctx.hud.innerHTML = `<div class="whg-pill"><b data-s>0</b><span>Popped</span></div><div class="whg-pill"><b data-t>${G}</b><span>Seconds</span></div><div class="whg-pill"><b data-c>x1</b><span>Combo</span></div>`;
    const S = ctx.hud.querySelector('[data-s]'), T = ctx.hud.querySelector('[data-t]'), C = ctx.hud.querySelector('[data-c]');
    ctx.bar.hidden = false; const barI = ctx.bar.querySelector('i');
    const run = () => {
      let score = 0, combo = 1, lastPop = 0, t0 = performance.now(), lastSpawn = 0, bals = [], lastF = t0;
      const W = () => ctx.arena.clientWidth, H = () => ctx.arena.clientHeight;
      function spawn(now) {
        const el = document.createElement('div'); el.className = 'whg-bal'; const gold = Math.random() < .07;
        const size = gold ? 74 : 54 + Math.random() * 22; el.style.width = size + 'px';
        el.innerHTML = balSVG(COLS[Math.floor(Math.random() * COLS.length)], gold);
        const elapsed = (now - t0) / 1000;
        const b = { el, gold, x: Math.random() * (W() - size), y: H() + 20, vy: (gold ? 70 : 90) + elapsed * 3.2 + Math.random() * 60, ph: Math.random() * 6, size };
        el.addEventListener('pointerdown', (ev) => {
          ev.preventDefault(); if (b.dead) return; b.dead = true;
          const nowp = performance.now(); combo = nowp - lastPop < 600 ? Math.min(combo + 1, 5) : 1; lastPop = nowp;
          const pts = (gold ? 5 : 1) * (combo >= 3 ? 2 : 1); score += pts;
          S.textContent = score; bump(S); C.textContent = 'x' + combo; if (combo >= 3) bump(C);
          floatText(ctx.arena, b.x + size / 2 - 10, b.y, '+' + pts, gold ? '#fde047' : '#fff');
          if (combo === 3) floatText(ctx.arena, b.x - 10, b.y - 30, 'COMBO x2!', '#6ee7b7');
          SFX.pop(); if (gold) SFX.ding(); buzz(gold ? [15, 30, 15] : 8);
          el.classList.add('pop'); setTimeout(() => el.remove(), 220);
        });
        ctx.arena.appendChild(el); bals.push(b);
      }
      function frame(now) {
        if (!ctx.alive) return;
        const el = (now - t0) / 1000, left = Math.max(0, G - el);
        T.textContent = Math.ceil(left); barI.style.transform = `scaleX(${left / G})`;
        const every = Math.max(260, 620 - el * 9);
        if (now - lastSpawn > every) { spawn(now); lastSpawn = now; }
        const dt = Math.min(.05, (now - lastF) / 1000); lastF = now;
        bals = bals.filter(b => { if (b.dead) return false; b.y -= b.vy * dt; b.ph += dt * 2.2;
          const x = b.x + Math.sin(b.ph) * 12; b.el.style.transform = `translate(${x}px,${b.y}px) rotate(${Math.sin(b.ph) * 6}deg)`;
          if (b.y < -b.size * 2) { b.el.remove(); return false; } return true; });
        if (left <= 0) { bals.forEach(b => b.el.remove()); ctx.end(score, "Time's up!", 'balloons popped in ' + G + ' seconds', () => { S.textContent = '0'; C.textContent = 'x1'; run(); }); return; }
        requestAnimationFrame(frame);
      }
      requestAnimationFrame(frame);
    };
    ctx.start(run);
  }

  // ---------- 2. Fuel Gauge Hangman (4-letter forecourt words) ----------
  const WORDS = [['FUEL', 'It goes in the tank'], ['PUMP', 'Where drivers fill up'], ['TILL', 'Where you take payment'], ['WASH', 'The car ___'], ['TYRE', 'Check its pressure'], ['MILK', 'Always in the fridge'], ['CARD', 'Scan the GO+ ___'], ['SHOP', 'Everything inside the forecourt'], ['CASH', 'Notes and coins'], ['COIN', 'A pound is one'], ['MINT', 'A fresh sweet'], ['OPEN', 'We are ___ 24 hours'], ['KEYS', 'Customers sometimes forget these'], ['LANE', 'Pump ___ 4']];
  function hangman(ctx) {
    const LIVES = 6; let round = 0, wins = 0;
    ctx.hud.innerHTML = `<div class="whg-pill"><b data-w>0</b><span>Words</span></div><div class="whg-pill"><b data-l>${LIVES}</b><span>Fuel left</span></div>`;
    const Wn = ctx.hud.querySelector('[data-w]'), Ln = ctx.hud.querySelector('[data-l]');
    const play = () => {
      const pool = WORDS.slice().sort(() => Math.random() - .5); let [word, hint] = ctx.opts.word ? ctx.opts.word : pool[round % pool.length]; round++;
      let lives = LIVES; const found = new Set(); Ln.textContent = lives;
      ctx.arena.innerHTML = `<div class="whg-hm">
        <div class="whg-gauge"><svg viewBox="0 0 220 124">
          <path d="M20 110 A90 90 0 0 1 200 110" fill="none" stroke="rgba(255,255,255,.12)" stroke-width="18" stroke-linecap="round"/>
          <path d="M20 110 A90 90 0 0 1 56 38" fill="none" stroke="#ef4444" stroke-width="18" stroke-linecap="round"/>
          <path d="M164 38 A90 90 0 0 1 200 110" fill="none" stroke="#10b981" stroke-width="18" stroke-linecap="round"/>
          <text x="22" y="100" fill="#fca5a5" font-size="15" font-weight="900">E</text><text x="188" y="100" fill="#6ee7b7" font-size="15" font-weight="900">F</text>
          <text x="110" y="80" text-anchor="middle" font-size="24">⛽</text>
          <g class="whg-needle" style="transform:rotate(90deg)"><line x1="110" y1="110" x2="110" y2="30" stroke="#fbbf24" stroke-width="5" stroke-linecap="round"/></g>
          <circle cx="110" cy="110" r="10" fill="#fbbf24"/></svg></div>
        <div class="whg-hint">Clue: <b>${hint}</b></div>
        <div class="whg-tiles">${[...word].map(c => `<div class="whg-tile" data-c="${c}"><div class="f"></div><div class="b">${c}</div></div>`).join('')}</div>
        <div class="whg-lives">Each wrong letter uses a bit of fuel. Run dry and the word is revealed.</div>
        <div class="whg-keys">${'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('').map(k => `<button class="whg-key" data-k="${k}">${k}</button>`).join('')}</div></div>`;
      const needle = ctx.arena.querySelector('.whg-needle');
      const setNeedle = () => { needle.style.transform = `rotate(${-90 + 180 * (lives / LIVES)}deg)`; };
      requestAnimationFrame(() => requestAnimationFrame(setNeedle));
      const guess = (k, btn) => {
        if (btn.disabled) return; btn.disabled = true;
        if (word.includes(k)) {
          found.add(k); btn.classList.add('ok'); SFX.ding(); buzz(10);
          ctx.arena.querySelectorAll(`.whg-tile[data-c="${k}"]`).forEach((t, i) => setTimeout(() => t.classList.add('open'), i * 120));
          if ([...word].every(c => found.has(c))) { wins++; Wn.textContent = wins; bump(Wn); ctx.later(() => { if (window.whConfetti) whConfetti(false); ctx.end(wins, 'Full tank! ⛽', `You got ${word} with ${lives} of ${LIVES} fuel left`, play); }, 800); }
        } else {
          lives--; Ln.textContent = lives; bump(Ln); btn.classList.add('no'); SFX.buzz(); buzz([30]); setNeedle();
          if (lives <= 0) { ctx.arena.querySelectorAll('.whg-tile').forEach((t, i) => setTimeout(() => t.classList.add('open'), i * 120)); ctx.later(() => ctx.end(wins, 'Out of fuel!', `The word was ${word}. Words solved in a row:`, () => { wins = 0; Wn.textContent = 0; play(); }), 1100); }
        }
      };
      ctx.arena.querySelectorAll('.whg-key').forEach(b => b.onclick = () => guess(b.dataset.k, b));
      ctx.guess = (k) => { const b = ctx.arena.querySelector(`.whg-key[data-k="${k}"]`); if (b) guess(k, b); };
    };
    ctx.start(play);
  }

  // ---------- 3. Memory Match ----------
  const FACES = ['⛽', '🍩', '🥪', '🚗', '🧽', '💳'];
  function memory(ctx) {
    ctx.hud.innerHTML = `<div class="whg-pill"><b data-m>0</b><span>Moves</span></div><div class="whg-pill"><b data-p>0/6</b><span>Pairs</span></div><div class="whg-pill"><b data-t>0s</b><span>Time</span></div>`;
    const M = ctx.hud.querySelector('[data-m]'), P = ctx.hud.querySelector('[data-p]'), T = ctx.hud.querySelector('[data-t]');
    const play = () => {
      const deck = ctx.opts.deck || FACES.concat(FACES).sort(() => Math.random() - .5);
      let open = [], moves = 0, pairs = 0, t0 = Date.now(), lock = false; M.textContent = 0; P.textContent = '0/6';
      ctx.arena.innerHTML = `<div class="whg-mem">${deck.map((f, i) => `<div class="whg-card" data-i="${i}" data-f="${f}"><div class="f">⭐</div><div class="b">${f}</div></div>`).join('')}</div>`;
      const tick = setInterval(() => { if (!ctx.alive) return clearInterval(tick); T.textContent = Math.floor((Date.now() - t0) / 1000) + 's'; }, 250);
      const flip = (c) => {
        if (lock || c.classList.contains('up') || c.classList.contains('done')) return;
        c.classList.add('up'); SFX.tick(); open.push(c);
        if (open.length === 2) {
          moves++; M.textContent = moves; bump(M); lock = true;
          const [a, b] = open;
          if (a.dataset.f === b.dataset.f) {
            ctx.later(() => { a.classList.add('done'); b.classList.add('done'); pairs++; P.textContent = pairs + '/6'; bump(P); SFX.ding(); buzz(12); open = []; lock = false;
              if (pairs === 6) { clearInterval(tick); const secs = Math.floor((Date.now() - t0) / 1000); const score = Math.max(10, 200 - moves * 8 - secs * 2);
                ctx.later(() => ctx.end(score, 'All matched!', `${moves} moves in ${secs} seconds. Score:`, play), 600); } }, 380);
          } else { ctx.later(() => { a.classList.remove('up'); b.classList.remove('up'); open = []; lock = false; SFX.buzz(); }, 800); }
        }
      };
      ctx.arena.querySelectorAll('.whg-card').forEach(c => c.onclick = () => flip(c));
      ctx.flipAt = (i) => flip(ctx.arena.querySelector(`.whg-card[data-i="${i}"]`));
    };
    ctx.start(play);
  }

  // ---------- 4. GO+ Grab ----------
  function goGrab(ctx) {
    const G = ctx.opts.seconds || 30;
    ctx.hud.innerHTML = `<div class="whg-pill"><b data-s>0</b><span>GO+ scans</span></div><div class="whg-pill"><b data-t>${G}</b><span>Seconds</span></div>`;
    const S = ctx.hud.querySelector('[data-s]'), T = ctx.hud.querySelector('[data-t]'); ctx.bar.hidden = false; const barI = ctx.bar.querySelector('i');
    const run = () => {
      let score = 0, t0 = Date.now();
      ctx.arena.innerHTML = `<div class="whg-pumps">${Array.from({ length: 9 }, (_, i) => `<div class="whg-pump" data-i="${i}"><div class="whg-pop"></div><div class="base">${i + 1}</div></div>`).join('')}</div>
        <p class="whg-p" style="text-align:center;margin:12px auto 0">Tap the GO+ cards. Leave the spilled drinks!</p>`;
      const pops = [...ctx.arena.querySelectorAll('.whg-pop')];
      pops.forEach(p => p.addEventListener('pointerdown', (e) => {
        e.preventDefault(); if (!p.classList.contains('up')) return;
        const r = p.getBoundingClientRect(), ar = ctx.arena.getBoundingClientRect();
        if (p.classList.contains('go')) { score++; SFX.ding(); buzz(8); floatText(ctx.arena, r.left - ar.left + 18, r.top - ar.top - 10, '+1'); }
        else { score = Math.max(0, score - 2); SFX.buzz(); buzz([30]); floatText(ctx.arena, r.left - ar.left + 14, r.top - ar.top - 10, '-2', '#f87171'); }
        S.textContent = score; bump(S); p.classList.add('hit'); setTimeout(() => { p.className = 'whg-pop'; }, 250);
      }));
      const spawn = () => {
        if (!ctx.alive) return; const left = G - (Date.now() - t0) / 1000;
        if (left <= 0) { pops.forEach(p => p.className = 'whg-pop'); ctx.end(score, 'Great scanning!', `GO+ cards grabbed in ${G} seconds`, () => { S.textContent = '0'; run(); }); return; }
        const free = pops.filter(p => !p.classList.contains('up')); const p = free[Math.floor(Math.random() * free.length)];
        if (p) { p.className = 'whg-pop ' + (Math.random() < .2 ? 'spill' : 'go'); if (p.classList.contains('spill')) p.textContent = '🥤'; else p.textContent = '';
          requestAnimationFrame(() => p.classList.add('up')); const stay = Math.max(520, 1100 - (G - left) * 18);
          setTimeout(() => { if (p.classList.contains('up') && !p.classList.contains('hit')) p.className = 'whg-pop'; }, stay); }
        ctx.later(spawn, Math.max(300, 650 - (G - left) * 10));
      };
      const clock = () => { if (!ctx.alive) return; const left = Math.max(0, G - (Date.now() - t0) / 1000); T.textContent = Math.ceil(left); barI.style.transform = `scaleX(${left / G})`; if (left > 0) requestAnimationFrame(clock); };
      spawn(); clock();
    };
    ctx.start(run);
  }

  const GAMES = [
    { id: 'blitz', icon: '🎈', name: 'Balloon Blitz', how: 'Pop as many balloons as you can in 60 seconds. Golden ones are worth 5. Pop fast for a combo!', fn: balloonBlitz },
    { id: 'hangman', icon: '⛽', name: 'Fuel Gauge Hangman', how: 'Guess the 4-letter forecourt word before the tank runs dry. 6 wrong letters and you are out of fuel.', fn: hangman },
    { id: 'memory', icon: '🃏', name: 'Memory Match', how: 'Flip the cards and find the 6 forecourt pairs in as few moves as you can.', fn: memory },
    { id: 'goplus', icon: '💳', name: 'GO+ Grab', how: 'GO+ cards pop out of the pumps. Tap them before they vanish, but leave the spilled drinks!', fn: goGrab },
  ];
  // Game of the week: a different game every Monday, same for everyone.
  window.whGameOfWeek = function () { const d = new Date(weekKey()); const wk = Math.floor(d.getTime() / (7 * 864e5)); return GAMES[wk % GAMES.length]; };
  window.whPlayGame = function (id, opts) { const g = GAMES.find(x => x.id === id) || whGameOfWeek(); const ctx = shell(g, opts); g.fn(ctx); return ctx; };

  // Today-tab card. Locked while clocked in, so it never gets in the way of work.
  window.whGameCard = function (host, o) {
    const g = o.game ? GAMES.find(x => x.id === o.game) : whGameOfWeek();
    const el = document.createElement('div'); el.className = 'whg-card-week';
    const best = getBest(g.id);
    const d = new Date(); const daysLeft = 7 - ((d.getDay() + 6) % 7);
    el.innerHTML = o.locked
      ? `<div class="ic">🔒</div><div><b>🎮 Game of the week: ${g.name}</b><span>Unlocks when you clock out. Have a great shift!</span></div>`
      : `<div class="ic">${g.icon}</div><div><b>🎮 Game of the week</b><span>${g.name} · ${best ? 'your best ' + best : 'not played yet'} · new game in ${daysLeft} day${daysLeft > 1 ? 's' : ''}</span></div><div class="go">Play</div>`;
    if (!o.locked) el.onclick = () => whPlayGame(g.id, o.playOpts);
    host.prepend(el); return el;
  };
})();
