// WorkHive rewards for SJC Fuel Services (Shell forecourt) staff: badges, shout-outs and
// the Monday weekly recap. Display-only. Badges are worked out from data the app already
// holds (time_entries, shifts, shell_goplus_weekly, shell_training_rag, shell_smg_responses).
// Shout-outs need one new small table (see the proposal). Needs celebrate.js for confetti.
(function () {
  const reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  const css = `
  .whr-shelf{background:var(--card);border:1px solid var(--border);border-radius:14px;padding:18px 16px;margin-bottom:16px}
  .whr-shelf-h{display:flex;align-items:baseline;justify-content:space-between;margin-bottom:14px}
  .whr-shelf-h h3{margin:0;font-size:17px}
  .whr-shelf-h span{font-size:12px;color:var(--muted);font-weight:600}
  .whr-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:14px 8px}
  .whr-b{display:flex;flex-direction:column;align-items:center;text-align:center;gap:6px}
  .whr-med{width:64px;height:64px;border-radius:50%;display:grid;place-items:center;font-size:28px;position:relative;box-shadow:inset 0 -4px 0 rgba(0,0,0,.18),0 6px 14px rgba(0,0,0,.3)}
  .whr-med::after{content:'';position:absolute;inset:4px;border-radius:50%;border:2px solid rgba(255,255,255,.35)}
  .whr-b.lock .whr-med{background:#273449!important;filter:grayscale(1);opacity:.55;box-shadow:none}
  .whr-b.lock .whr-med::after{border-color:rgba(255,255,255,.08)}
  .whr-n{font-size:12px;font-weight:700;line-height:1.2}
  .whr-s{font-size:10.5px;color:var(--muted);line-height:1.25}
  .whr-bar{width:56px;height:4px;border-radius:9px;background:rgba(255,255,255,.1);overflow:hidden}
  .whr-bar i{display:block;height:100%;background:var(--accent)}
  .whr-x{position:absolute;top:-4px;right:-4px;background:var(--accent);color:#0f172a;font-size:10px;font-weight:800;border-radius:99px;padding:1px 6px;border:2px solid var(--card)}
  .whr-kudo{background:linear-gradient(135deg,rgba(251,191,36,.14),rgba(16,185,129,.1));border:1px solid rgba(251,191,36,.35);border-radius:14px;padding:16px;margin-bottom:16px}
  .whr-kudo .who{display:flex;align-items:center;gap:10px;margin-bottom:8px}
  .whr-kudo .av{width:34px;height:34px;border-radius:50%;background:var(--accent);color:#0f172a;font-weight:800;display:grid;place-items:center;font-size:13px}
  .whr-kudo q{display:block;font-size:15px;line-height:1.45;quotes:'“' '”'}
  .whr-kudo .meta{font-size:11px;color:var(--muted);margin-top:8px}
  /* overlays */
  .whr-ov{position:fixed;inset:0;z-index:9990;background:rgba(2,6,23,.93);backdrop-filter:blur(6px);display:flex;align-items:center;justify-content:center;padding:20px;opacity:0;transition:opacity .25s}
  .whr-ov.show{opacity:1}
  .whr-unlock{text-align:center;color:#f1f5f9;max-width:340px}
  .whr-unlock .whr-med{width:150px;height:150px;font-size:66px;margin:0 auto 22px;transform:scale(.2) rotate(-200deg);transition:transform .8s cubic-bezier(.34,1.56,.64,1);overflow:hidden}
  .whr-ov.show .whr-unlock .whr-med{transform:none}
  .whr-unlock .whr-med::before{content:'';position:absolute;inset:-40%;background:linear-gradient(115deg,transparent 40%,rgba(255,255,255,.55) 50%,transparent 60%);transform:translateX(-100%);animation:whrShine 1.6s .9s ease-in-out}
  .whr-rays{position:absolute;left:50%;top:50%;width:520px;height:520px;margin:-330px 0 0 -260px;background:repeating-conic-gradient(rgba(251,191,36,.13) 0 10deg,transparent 10deg 20deg);border-radius:50%;animation:whrSpin 14s linear infinite;-webkit-mask:radial-gradient(circle,#000 30%,transparent 70%);mask:radial-gradient(circle,#000 30%,transparent 70%);pointer-events:none}
  .whr-eye{font-size:12px;font-weight:800;letter-spacing:.12em;text-transform:uppercase;color:var(--accent)}
  .whr-big{font:800 28px/1.15 -apple-system,system-ui,sans-serif;margin:6px 0 8px}
  .whr-p{color:#94a3b8;font-size:15px;margin:0 0 22px}
  .whr-btn{display:block;width:100%;padding:15px;border:0;border-radius:14px;background:var(--accent);color:#0f172a;font:700 16px -apple-system,system-ui,sans-serif}
  .whr-btn.sec{background:rgba(255,255,255,.08);color:#f1f5f9;margin-top:8px}
  .whr-sheet{width:100%;max-width:420px;background:#1e293b;border:1px solid rgba(255,255,255,.12);border-radius:22px;padding:22px;color:#f1f5f9;transform:translateY(30px);transition:transform .45s cubic-bezier(.34,1.56,.64,1)}
  .whr-ov.show .whr-sheet{transform:none}
  /* recap story */
  .whr-story{position:fixed;inset:0;z-index:9995;color:#fff;display:flex;flex-direction:column;padding:calc(14px + env(safe-area-inset-top)) 20px calc(26px + env(safe-area-inset-bottom));transition:background .6s}
  .whr-segs{display:flex;gap:4px}
  .whr-segs i{flex:1;height:3px;border-radius:3px;background:rgba(255,255,255,.3);overflow:hidden}
  .whr-segs i b{display:block;height:100%;width:0;background:#fff}
  .whr-top{display:flex;align-items:center;gap:10px;margin:14px 0 0;font-size:13px;font-weight:600;opacity:.9}
  .whr-top .av{width:30px;height:30px;border-radius:50%;background:rgba(255,255,255,.25);display:grid;place-items:center;font-weight:800;font-size:12px}
  .whr-slide{flex:1;display:flex;flex-direction:column;justify-content:center;gap:10px}
  .whr-slide>*{animation:whrUp .5s cubic-bezier(.2,.8,.2,1) both}
  .whr-slide>:nth-child(2){animation-delay:.08s}.whr-slide>:nth-child(3){animation-delay:.16s}.whr-slide>:nth-child(4){animation-delay:.24s}.whr-slide>:nth-child(5){animation-delay:.32s}
  .whr-k{font-size:13px;font-weight:800;letter-spacing:.12em;text-transform:uppercase;opacity:.8}
  .whr-hero{font:800 64px/1 -apple-system,system-ui,sans-serif;letter-spacing:-.03em;font-variant-numeric:tabular-nums}
  .whr-t{font:800 30px/1.15 -apple-system,system-ui,sans-serif;letter-spacing:-.01em}
  .whr-d{font-size:16px;opacity:.85;line-height:1.45;max-width:30ch}
  .whr-dots{display:flex;gap:8px;margin-top:8px}
  .whr-dots span{width:40px;height:40px;border-radius:12px;background:rgba(255,255,255,.18);display:grid;place-items:center;font-size:18px}
  .whr-ring{width:190px;height:190px;position:relative;margin:4px 0 8px}
  .whr-ring svg{width:100%;height:100%;transform:rotate(-90deg)}
  .whr-ring .v{position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;font:800 36px/1 -apple-system,system-ui,sans-serif}
  .whr-ring .v small{display:block;font-size:13px;font-weight:600;opacity:.8;margin-top:4px}
  .whr-quote{background:rgba(255,255,255,.14);border-radius:18px;padding:16px 18px;font-size:17px;line-height:1.45}
  .whr-row{display:flex;gap:10px;flex-wrap:wrap}
  .whr-pill{background:rgba(255,255,255,.16);border-radius:99px;padding:8px 14px;font-weight:700;font-size:14px}
  .whr-foot{font-size:12px;opacity:.7;text-align:center}
  @keyframes whrShine{to{transform:translateX(100%)}}
  @keyframes whrSpin{to{transform:rotate(360deg)}}
  @keyframes whrUp{from{opacity:0;transform:translateY(22px)}to{opacity:1;transform:none}}
  @media (prefers-reduced-motion: reduce){.whr-unlock .whr-med{transition:none;transform:none}.whr-rays,.whr-slide>*,.whr-unlock .whr-med::before{animation:none}}
  `;
  const st = document.createElement('style'); st.textContent = css; document.head.appendChild(st);

  const GRAD = {
    amber: 'linear-gradient(145deg,#fcd34d,#f59e0b)', green: 'linear-gradient(145deg,#6ee7b7,#10b981)',
    red: 'linear-gradient(145deg,#fca5a5,#dc2626)', blue: 'linear-gradient(145deg,#93c5fd,#3b82f6)',
    purple: 'linear-gradient(145deg,#c4b5fd,#7c3aed)', teal: 'linear-gradient(145deg,#5eead4,#0d9488)',
  };
  // Forecourt badge rules. `have`/`need` come from existing tables; nothing new is stored.
  window.WH_BADGES = [
    { id: 'ontime5',  e: '⏰', n: 'On the dot',     s: '5 on-time shifts in a row', c: 'green' },
    { id: 'goplus',   e: '💳', n: 'GO+ Hero',       s: 'Hit your GO+ target for a week', c: 'red' },
    { id: 'goplus4',  e: '🏆', n: 'GO+ Legend',     s: 'GO+ target 4 weeks running', c: 'amber' },
    { id: 'trained',  e: '🎓', n: 'Fully trained',  s: 'All RLA training green', c: 'blue' },
    { id: 'cx5',      e: '⭐', n: 'Customer star',  s: 'A 5/5 customer review on your shift', c: 'amber' },
    { id: 'cover',    e: '🤝', n: 'Team player',    s: 'Covered a shift at short notice', c: 'teal' },
    { id: 'early',    e: '🌅', n: 'Early bird',     s: '10 shifts starting before 7am', c: 'purple' },
    { id: 'century',  e: '💯', n: 'Century',        s: '100 shifts worked', c: 'red' },
    { id: 'kudos5',   e: '🙌', n: 'Appreciated',    s: '5 shout-outs from your manager', c: 'green' },
  ];

  window.whRenderShelf = function (host, state) {
    const earned = WH_BADGES.filter(b => (state[b.id] || {}).got).length;
    const el = document.createElement('div'); el.className = 'whr-shelf';
    el.innerHTML = `<div class="whr-shelf-h"><h3>🏅 Your badges</h3><span>${earned} of ${WH_BADGES.length} earned</span></div>
      <div class="whr-grid">${WH_BADGES.map(b => { const s = state[b.id] || {}; const pct = s.need ? Math.round(100 * s.have / s.need) : 0;
        return `<div class="whr-b${s.got ? '' : ' lock'}"><div class="whr-med" style="background:${GRAD[b.c]}">${b.e}${s.times > 1 ? `<span class="whr-x">×${s.times}</span>` : ''}</div>
          <div class="whr-n">${b.n}</div>${s.got ? `<div class="whr-s">${b.s}</div>` : `<div class="whr-bar"><i style="width:${pct}%"></i></div><div class="whr-s">${s.have || 0} of ${s.need}</div>`}</div>`; }).join('')}</div>`;
    host.prepend(el); return el;
  };

  window.whKudoCard = function (host, k) {
    const el = document.createElement('div'); el.className = 'whr-kudo';
    el.innerHTML = `<div class="who"><div class="av">${k.from.split(' ').map(x => x[0]).join('')}</div><div><div style="font-weight:700;font-size:14px">🙌 Shout-out from ${k.from}</div><div style="font-size:12px;color:var(--muted)">${k.tag}</div></div></div>
      <q>${k.msg}</q><div class="meta">${k.when} · seen by your team at ${k.site}</div>`;
    host.prepend(el); return el;
  };

  function overlay(inner, hold) {
    const ov = document.createElement('div'); ov.className = 'whr-ov'; ov.innerHTML = inner;
    document.body.appendChild(ov); requestAnimationFrame(() => ov.classList.add('show'));
    ov.addEventListener('click', (e) => { if (e.target.closest('[data-close]') || e.target === ov) { ov.classList.remove('show'); setTimeout(() => ov.remove(), 250); } });
    return ov;
  }

  window.whBadgeUnlock = function (id, detail) {
    const b = WH_BADGES.find(x => x.id === id);
    try { navigator.vibrate && navigator.vibrate([20, 50, 20, 50, 40]); } catch (_) {}
    overlay(`<div class="whr-unlock" style="position:relative"><div class="whr-rays"></div>
      <div class="whr-med" style="background:${GRAD[b.c]}">${b.e}</div>
      <div class="whr-eye">New badge unlocked</div><div class="whr-big">${b.n}</div>
      <p class="whr-p">${detail || b.s}</p>
      <button class="whr-btn" data-close>Nice one!</button><button class="whr-btn sec" data-close>See all my badges</button></div>`);
    setTimeout(() => window.whConfetti && whConfetti(true), 550);
  };

  window.whShoutout = function (k) {
    try { navigator.vibrate && navigator.vibrate([20, 40, 20]); } catch (_) {}
    overlay(`<div class="whr-sheet">
      <div style="text-align:center;font-size:54px;line-height:1;margin-bottom:6px">🙌</div>
      <div class="whr-eye" style="text-align:center">Shout-out from ${k.from}</div>
      <div class="whr-big" style="text-align:center;font-size:23px">${k.tag}</div>
      <div class="whr-quote" style="background:rgba(255,255,255,.06);margin:12px 0 14px">“${k.msg}”</div>
      <div style="display:flex;justify-content:center;gap:8px;margin-bottom:18px;flex-wrap:wrap">
        <span class="whr-pill" style="background:rgba(16,185,129,.15);color:#6ee7b7">🤝 +1 Team player</span>
        <span class="whr-pill" style="background:rgba(251,191,36,.15);color:#fde68a">🙌 3 of 5 to Appreciated</span></div>
      <button class="whr-btn" data-close>Say thanks back 💛</button><button class="whr-btn sec" data-close>Close</button></div>`);
    setTimeout(() => window.whConfetti && whConfetti(false), 350);
  };

  // Monday recap: a short story of the week. `w` comes from one read-only query per section.
  window.whRecap = function (w, opts) {
    opts = opts || {};
    const slides = [
      { bg: 'linear-gradient(160deg,#f59e0b,#b45309)', html: `<div class="whr-k">Your week · ${w.range}</div><div class="whr-t">Here's how your week went at ${w.site}, ${w.name}</div><div class="whr-hero" data-count="${w.hours}" data-fmt="h">0h</div><div class="whr-d">across ${w.shifts} shifts. Thank you!</div>` },
      { bg: 'linear-gradient(160deg,#10b981,#047857)', html: `<div class="whr-k">Punctuality</div><div class="whr-t">On time, every time</div><div class="whr-dots">${Array.from({ length: w.shifts }, () => '<span>✅</span>').join('')}</div><div class="whr-d">${w.shifts} of ${w.shifts} shifts started on time. Your streak is now <b>🔥 ${w.streak}</b> shifts.</div>` },
      { bg: 'linear-gradient(160deg,#dc2626,#7f1d1d)', html: `<div class="whr-k">GO+</div><div class="whr-t">Target smashed 🎯</div>
          <div class="whr-ring"><svg viewBox="0 0 100 100"><circle cx="50" cy="50" r="42" fill="none" stroke="rgba(255,255,255,.2)" stroke-width="9"/><circle class="arc" cx="50" cy="50" r="42" fill="none" stroke="#fff" stroke-width="9" stroke-linecap="round" stroke-dasharray="264" stroke-dashoffset="264" style="transition:stroke-dashoffset 1.2s cubic-bezier(.2,.8,.2,1)"/></svg><div class="v"><span data-count="${w.goplus}" data-fmt="pct">0%</span><small>target ${w.target}%</small></div></div>
          <div class="whr-d">${w.scans} GO+ scans. Up from ${w.goplusLast}% last week.</div>` },
      { bg: 'linear-gradient(160deg,#2563eb,#1e3a8a)', html: `<div class="whr-k">Customers</div><div class="whr-t">What customers said</div><div class="whr-quote">“${w.quote}”</div><div class="whr-d">${w.site} scored <b>${w.smg}/10</b> for customer satisfaction this week.</div>` },
      { bg: 'linear-gradient(160deg,#7c3aed,#4c1d95)', html: `<div class="whr-k">This week you earned</div><div class="whr-row">${w.badges.map(b => `<span class="whr-pill">${b}</span>`).join('')}</div><div class="whr-t">Have a great week, ${w.name}! 💛</div><button class="whr-btn" style="background:#fff;color:#4c1d95;margin-top:10px" data-close>Let's go</button>` },
    ];
    const root = document.createElement('div'); root.className = 'whr-story';
    root.innerHTML = `<div class="whr-segs">${slides.map(() => '<i><b></b></i>').join('')}</div>
      <div class="whr-top"><div class="av">SJC</div><span>Weekly recap</span><span style="margin-left:auto;font-size:22px" data-close>✕</span></div>
      <div class="whr-slide"></div><div class="whr-foot">Tap to go forward</div>`;
    document.body.appendChild(root);
    const segs = root.querySelectorAll('.whr-segs b'), body = root.querySelector('.whr-slide');
    let i = -1, timer;
    const DUR = opts.dur || 3200;
    function count(el) { const to = parseFloat(el.dataset.count), f = el.dataset.fmt; const fmt = (v) => f === 'pct' ? v.toFixed(1) + '%' : v.toFixed(1) + 'h';
      if (reduce) { el.textContent = fmt(to); return; } const s = performance.now(); (function g(t) { const k = Math.min(1, (t - s) / 1100), e = 1 - Math.pow(1 - k, 3); el.textContent = fmt(to * e); if (k < 1) requestAnimationFrame(g); })(s); }
    function show(n) {
      if (n >= slides.length) { root.remove(); return; }
      i = n; root.style.background = slides[i].bg; body.innerHTML = slides[i].html; body.style.animation = 'none';
      segs.forEach((s, j) => { s.style.transition = 'none'; s.style.width = j < i ? '100%' : '0'; });
      requestAnimationFrame(() => requestAnimationFrame(() => { const s = segs[i]; s.style.transition = `width ${DUR}ms linear`; s.style.width = '100%'; }));
      body.querySelectorAll('[data-count]').forEach(count);
      const arc = body.querySelector('.arc'); if (arc) setTimeout(() => { arc.style.strokeDashoffset = String(264 * (1 - Math.min(1, w.goplus / (w.target * 1.4)))); }, 80);
      if (i === slides.length - 1 && window.whConfetti) setTimeout(() => whConfetti(false), 300);
      clearTimeout(timer); if (!opts.hold) timer = setTimeout(() => show(i + 1), DUR);
    }
    root.addEventListener('click', (e) => { if (e.target.closest('[data-close]')) { clearTimeout(timer); root.remove(); return; } show(i + 1); });
    show(opts.start || 0);
    return root;
  };
})();
