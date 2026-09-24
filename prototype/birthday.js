// WorkHive birthdays and work anniversaries. Plays once on the day, the first time the
// app is opened (remembered on the phone). Uses date_of_birth and start_date, which the
// staff app already loads for the signed-in person. Tap a balloon to pop it.
(function () {
  const reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  const css = `
  .whb-layer{position:fixed;inset:0;z-index:9993;pointer-events:none;overflow:hidden}
  .whb-bal{position:absolute;bottom:-160px;width:64px;pointer-events:auto;cursor:pointer;animation:whbRise var(--d) cubic-bezier(.35,.1,.45,1) var(--delay) forwards;will-change:transform}
  .whb-bal .sway{animation:whbSway var(--sw) ease-in-out infinite alternate;transform-origin:50% 100%}
  .whb-bal svg{display:block;width:100%;height:auto;overflow:visible;filter:drop-shadow(0 8px 10px rgba(0,0,0,.25))}
  .whb-bal.pop{animation:none!important}
  .whb-bal.pop svg{animation:whbPop .22s ease-out forwards}
  .whb-banner{position:fixed;left:16px;right:16px;top:calc(18px + env(safe-area-inset-top));z-index:9994;background:linear-gradient(135deg,#fbbf24,#f59e0b);color:#0f172a;border-radius:20px;padding:16px 18px;box-shadow:0 16px 40px rgba(0,0,0,.35);display:flex;gap:14px;align-items:center;transform:translateY(-140%);transition:transform .6s cubic-bezier(.34,1.56,.64,1)}
  .whb-banner.show{transform:none}
  .whb-banner .cake{font-size:44px;line-height:1;animation:whbBob 1.6s ease-in-out infinite}
  .whb-banner h3{margin:0;font:800 21px/1.15 -apple-system,system-ui,sans-serif}
  .whb-banner p{margin:3px 0 0;font-size:14px;font-weight:600;opacity:.8}
  .whb-banner button{margin-left:auto;background:rgba(15,23,42,.12);border:0;border-radius:99px;width:32px;height:32px;font-size:15px;flex-shrink:0}
  .whb-card{background:linear-gradient(135deg,rgba(251,191,36,.18),rgba(244,114,182,.14));border:1px solid rgba(251,191,36,.4);border-radius:14px;padding:16px;margin-bottom:16px;display:flex;gap:12px;align-items:center}
  .whb-card .e{font-size:34px}
  .whb-card b{display:block;font-size:16px}
  .whb-card span{font-size:13px;color:var(--muted)}
  .whb-hint{position:fixed;left:50%;bottom:calc(110px + env(safe-area-inset-bottom));transform:translateX(-50%);z-index:9994;background:rgba(15,23,42,.85);color:#fff;font-size:13px;font-weight:600;border-radius:99px;padding:8px 14px;opacity:0;transition:opacity .4s}
  .whb-hint.show{opacity:1}
  @keyframes whbRise{to{transform:translateY(calc(-100vh - 220px))}}
  @keyframes whbSway{from{transform:translateX(calc(var(--sx) * -1)) rotate(-6deg)}to{transform:translateX(var(--sx)) rotate(6deg)}}
  @keyframes whbPop{0%{transform:scale(1)}60%{transform:scale(1.35);opacity:.6}100%{transform:scale(1.6);opacity:0}}
  @keyframes whbBob{0%,100%{transform:translateY(0) rotate(-4deg)}50%{transform:translateY(-4px) rotate(4deg)}}
  @media (prefers-reduced-motion: reduce){.whb-banner{transition:none}.whb-banner .cake{animation:none}}
  `;
  const st = document.createElement('style'); st.textContent = css; document.head.appendChild(st);

  // Shell-ish party palette: amber, red, green, blue, pink, purple.
  const COLS = [['#fcd34d', '#f59e0b'], ['#f87171', '#dc2626'], ['#6ee7b7', '#10b981'], ['#93c5fd', '#3b82f6'], ['#f9a8d4', '#ec4899'], ['#c4b5fd', '#8b5cf6']];
  function balloonSVG(c, i) {
    const g = 'g' + i + Math.random().toString(36).slice(2, 6);
    return `<svg viewBox="0 0 64 150"><defs><radialGradient id="${g}" cx="35%" cy="30%" r="75%"><stop offset="0" stop-color="${c[0]}"/><stop offset="1" stop-color="${c[1]}"/></radialGradient></defs>
      <path d="M32 78 C 30 92, 36 104, 30 118 S 34 138, 31 150" fill="none" stroke="rgba(255,255,255,.55)" stroke-width="1.4"/>
      <ellipse cx="32" cy="38" rx="28" ry="34" fill="url(#${g})"/>
      <path d="M27 72 L37 72 L32 79 Z" fill="${c[1]}"/>
      <ellipse cx="22" cy="24" rx="6" ry="10" fill="rgba(255,255,255,.45)" transform="rotate(-20 22 24)"/></svg>`;
  }

  function balloons(n) {
    if (reduce) return;
    const layer = document.createElement('div'); layer.className = 'whb-layer'; document.body.appendChild(layer);
    let left = n;
    for (let i = 0; i < n; i++) {
      const b = document.createElement('div'); b.className = 'whb-bal';
      const size = 48 + Math.random() * 30;
      b.style.cssText = `left:${(i / n) * 92 + Math.random() * 6 - 4}%;width:${size}px;--d:${7 + Math.random() * 4}s;--delay:${Math.random() * 2.2}s;--sw:${1.6 + Math.random()}s;--sx:${8 + Math.random() * 14}px`;
      b.innerHTML = `<div class="sway">${balloonSVG(COLS[i % COLS.length], i)}</div>`;
      b.addEventListener('click', () => {
        try { navigator.vibrate && navigator.vibrate(12); } catch (_) {}
        const r = b.getBoundingClientRect(); b.style.transform = getComputedStyle(b).transform; b.classList.add('pop');
        if (window.whConfettiAt) whConfettiAt(r.left + r.width / 2, r.top + r.width / 2);
        setTimeout(() => b.remove(), 250);
      });
      b.addEventListener('animationend', (e) => { if (e.target === b) { b.remove(); if (--left <= 0) layer.remove(); } });
      layer.appendChild(b);
    }
    setTimeout(() => layer.remove(), 16000);
  }

  // Small confetti burst at a point (for popped balloons).
  window.whConfettiAt = function (x, y) {
    const c = document.createElement('canvas'); c.style.cssText = 'position:fixed;inset:0;pointer-events:none;z-index:9995';
    const dpr = Math.min(2, devicePixelRatio || 1); c.width = innerWidth * dpr; c.height = innerHeight * dpr; document.body.appendChild(c);
    const g = c.getContext('2d'); g.scale(dpr, dpr);
    const ps = Array.from({ length: 22 }, () => { const a = Math.random() * Math.PI * 2, v = 2 + Math.random() * 5; return { x, y, vx: Math.cos(a) * v, vy: Math.sin(a) * v, c: COLS[Math.floor(Math.random() * 6)][0], l: 0 }; });
    (function f() { g.clearRect(0, 0, innerWidth, innerHeight); let alive = 0;
      for (const p of ps) { p.l++; p.vy += .18; p.x += p.vx; p.y += p.vy; const o = 1 - p.l / 50; if (o > 0) { alive++; g.globalAlpha = o; g.fillStyle = p.c; g.fillRect(p.x, p.y, 5, 3); } }
      alive ? requestAnimationFrame(f) : c.remove(); })();
  };

  // kind: 'birthday' | 'anniversary'. years only for anniversaries.
  window.whBirthday = function (o) {
    const bday = o.kind === 'birthday';
    const banner = document.createElement('div'); banner.className = 'whb-banner'; banner.setAttribute('role', 'status');
    banner.innerHTML = bday
      ? `<div class="cake">🎂</div><div><h3>Happy birthday, ${o.name}!</h3><p>Have a brilliant day, from everyone at ${o.org}</p></div><button aria-label="Close">✕</button>`
      : `<div class="cake">🎉</div><div><h3>${o.years} year${o.years > 1 ? 's' : ''} at ${o.org}!</h3><p>Thank you for everything, ${o.name}. Here's to the next one</p></div><button aria-label="Close">✕</button>`;
    document.body.appendChild(banner);
    requestAnimationFrame(() => banner.classList.add('show'));
    banner.querySelector('button').onclick = () => { banner.classList.remove('show'); setTimeout(() => banner.remove(), 600); };
    try { navigator.vibrate && navigator.vibrate([30, 60, 30, 60, 60]); } catch (_) {}
    balloons(bday ? 16 : 12);
    setTimeout(() => window.whConfetti && whConfetti(!bday), 700);
    const hint = document.createElement('div'); hint.className = 'whb-hint'; hint.textContent = '🎈 Tap the balloons to pop them';
    document.body.appendChild(hint); setTimeout(() => hint.classList.add('show'), 1800); setTimeout(() => { hint.classList.remove('show'); setTimeout(() => hint.remove(), 500); }, 6500);
    if (!o.hold) setTimeout(() => { banner.classList.remove('show'); setTimeout(() => banner.remove(), 600); }, 12000);
  };

  // A card that stays on the Today tab all day.
  window.whBirthdayCard = function (host, o) {
    const el = document.createElement('div'); el.className = 'whb-card';
    el.innerHTML = o.kind === 'birthday'
      ? `<div class="e">🎈</div><div><b>It's your birthday, ${o.name}! 🎂</b><span>Enjoy your day. Tap to see the balloons again</span></div>`
      : `<div class="e">🏅</div><div><b>${o.years} year${o.years > 1 ? 's' : ''} with ${o.org} today</b><span>Thank you for ${o.years > 1 ? o.years + ' brilliant years' : 'a brilliant first year'}. Tap for the balloons again</span></div>`;
    el.onclick = () => whBirthday(o);
    host.prepend(el); return el;
  };

  // Production trigger (not used by the screenshots): once per day, on the day.
  window.whCheckBirthday = function (staff, org) {
    const today = new Date().toLocaleDateString('en-CA', { timeZone: 'Europe/London' }), md = today.slice(5);
    const key = 'wh_bday_seen_' + today;
    let seen = false; try { seen = localStorage.getItem(key); } catch (_) {}
    let o = null;
    if (staff.date_of_birth && staff.date_of_birth.slice(5, 10) === md) o = { kind: 'birthday' };
    else if (staff.start_date && staff.start_date.slice(5, 10) === md && staff.start_date.slice(0, 4) < today.slice(0, 4)) o = { kind: 'anniversary', years: +today.slice(0, 4) - +staff.start_date.slice(0, 4) };
    if (!o) return;
    Object.assign(o, { name: staff.preferred_name || staff.first_name, org: org?.name || 'SJC' });
    whBirthdayCard(document.getElementById('tab-today'), o);
    if (!seen) { try { localStorage.setItem(key, '1'); } catch (_) {} setTimeout(() => whBirthday(o), 1200); }
  };
})();
