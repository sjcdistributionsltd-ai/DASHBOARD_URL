// PROTOTYPE — WorkHive staff app enhancement layer (additive, read-only; no schema or write-path changes).
(function () {
  const scene = new URLSearchParams(location.search).get('scene') || 'hero';
  const css = `
  .offline-banner{position:static!important;margin:12px 16px 0}
  .wh-hero{position:relative;overflow:hidden}
  .wh-shiftline{display:flex;align-items:center;gap:10px;padding:10px 12px;border-radius:12px;margin:0 0 14px;font-size:14px;font-weight:600;text-align:left}
  .wh-shiftline.late{background:rgba(239,68,68,.14);color:#fca5a5;border:1px solid rgba(239,68,68,.35)}
  .wh-shiftline.soon{background:rgba(251,191,36,.12);color:#fde68a;border:1px solid rgba(251,191,36,.35)}
  .wh-shiftline.on{background:rgba(16,185,129,.12);color:#6ee7b7;border:1px solid rgba(16,185,129,.35)}
  .wh-shiftline small{display:block;font-weight:500;color:var(--muted);font-size:12px;margin-top:1px}
  .wh-prog{height:8px;border-radius:99px;background:rgba(255,255,255,.08);overflow:hidden;margin:6px 0 4px}
  .wh-prog>i{display:block;height:100%;background:linear-gradient(90deg,var(--green),#34d399);border-radius:99px}
  .wh-progmeta{display:flex;justify-content:space-between;font-size:11px;color:var(--muted);margin-bottom:14px}
  .wh-sync{display:inline-flex;align-items:center;gap:6px;font-size:12px;font-weight:600;padding:5px 10px;border-radius:99px;margin-top:12px}
  .wh-sync.ok{background:rgba(16,185,129,.12);color:#6ee7b7}
  .wh-sync.wait{background:rgba(251,191,36,.14);color:#fde68a}
  .wh-fresh{font-size:11px;color:var(--muted);text-align:center;margin:-6px 0 12px}
  .wh-sheet-bg{position:fixed;inset:0;background:rgba(2,6,23,.6);z-index:9998;backdrop-filter:blur(2px)}
  .wh-sheet{position:fixed;left:0;right:0;bottom:0;z-index:9999;background:var(--bg-2);border-radius:20px 20px 0 0;padding:10px 20px calc(24px + env(safe-area-inset-bottom));border-top:1px solid var(--border);box-shadow:0 -10px 40px rgba(0,0,0,.4)}
  .wh-grab{width:40px;height:5px;border-radius:9px;background:rgba(255,255,255,.2);margin:0 auto 16px}
  .wh-map{height:150px;border-radius:14px;background:radial-gradient(circle at 38% 55%,rgba(59,130,246,.25) 0 46px,transparent 47px),repeating-linear-gradient(0deg,rgba(255,255,255,.04) 0 1px,transparent 1px 22px),repeating-linear-gradient(90deg,rgba(255,255,255,.04) 0 1px,transparent 1px 22px),#0b1220;position:relative;margin:12px 0 14px;border:1px solid var(--border)}
  .wh-pin{position:absolute;font-size:26px;transform:translate(-50%,-100%)}
  .wh-ptr{display:flex;align-items:center;justify-content:center;gap:8px;height:52px;color:var(--accent);font-size:13px;font-weight:600}
  .wh-ptr .sp{width:18px;height:18px;border:2.5px solid rgba(251,191,36,.25);border-top-color:var(--accent);border-radius:50%;animation:whspin .8s linear infinite}
  @keyframes whspin{to{transform:rotate(360deg)}}
  .wh-cached{display:flex;align-items:center;gap:8px;font-size:12px;color:var(--muted);background:rgba(148,163,184,.08);border:1px solid var(--border);border-radius:10px;padding:8px 12px;margin-bottom:12px}
  .wh-badge-new{font-size:10px;font-weight:800;background:var(--accent);color:#0f172a;border-radius:6px;padding:1px 6px;margin-left:6px;vertical-align:middle}
  `;
  const st = document.createElement('style'); st.textContent = css; document.head.appendChild(st);
  const fmt = (d) => new Date(d).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
  const dur = (ms) => { ms = Math.abs(ms); const h = Math.floor(ms / 36e5), m = Math.floor(ms % 36e5 / 6e4); return (h ? h + 'h ' : '') + m + 'm'; };

  function ready(fn) { const t = setInterval(() => { if (document.getElementById('app-screen')?.classList.contains('active') && window.state?.staff !== undefined || (typeof state !== 'undefined' && state.staff)) { clearInterval(t); setTimeout(fn, 600); } }, 150); }

  ready(async () => {
    // Defer the profile nudge so it never covers the clock button (show it on the Profile tab instead).
    const hideNudge = () => document.querySelectorAll('body > div').forEach(d => { if (/Complete your profile/.test(d.textContent) && d.offsetHeight < 200) d.style.display = 'none'; });
    hideNudge(); setInterval(hideNudge, 200);
    // Offline banner sits in the page flow instead of floating over other banners.
    const ob = document.getElementById('offline-banner'); document.querySelector('.app-header').after(ob);
    const today = document.getElementById('tab-today');
    const clock = document.querySelector('.clock-card');
    clock.classList.add('wh-hero');
    today.insertBefore(clock, today.firstElementChild.nextElementSibling.nextElementSibling);
    clock.querySelector('p').style.display = 'none';

    // Shift context from data the app already loads (no extra query in production — reuse loadNextShift rows).
    const { data: shifts } = await sb.from('shifts').select('*').eq('staff_id', state.staff.id);
    const now = Date.now();
    const shift = (shifts || []).find(s => new Date(s.end_at) > now);
    const line = document.createElement('div'); line.className = 'wh-shiftline';
    clock.insertBefore(line, clock.firstChild);
    const prog = document.createElement('div'); prog.innerHTML = '<div class="wh-prog"><i></i></div><div class="wh-progmeta"><span></span><span></span></div>';
    clock.insertBefore(prog, clock.querySelector('#clock-btn'));
    const sync = document.createElement('div'); sync.style.textAlign = 'center';
    clock.appendChild(sync);
    const fresh = document.createElement('div'); fresh.className = 'wh-fresh'; fresh.textContent = 'Updated just now · pull down to refresh';
    clock.after(fresh);

    if (scene === 'clocked' || scene === 'offline') {
      state.currentClock = { id: scene === 'offline' ? undefined : 'te1', idempotency_key: 'k1', clock_in_at: new Date(new Date(shift.start_at).getTime() + 3 * 6e4).toISOString() };
      renderClockedIn();
      if (scene === 'offline') { document.getElementById('offline-banner')?.classList.add('show'); }
    }
    const tick = () => {
      const s = new Date(shift.start_at).getTime(), e = new Date(shift.end_at).getTime(), n = Date.now();
      const where = `${fmt(shift.start_at)}–${fmt(shift.end_at)} · ${shift.site?.name || ''} · ${shift.department?.name || ''}`;
      if (state.currentClock) {
        const el = n - new Date(state.currentClock.clock_in_at).getTime();
        const hh = String(Math.floor(el / 36e5)).padStart(2, '0'), mm = String(Math.floor(el % 36e5 / 6e4)).padStart(2, '0'), ss = String(Math.floor(el % 6e4 / 1e3)).padStart(2, '0');
        document.getElementById('big-time').textContent = `${hh}:${mm}:${ss}`;
        document.getElementById('big-time').style.fontSize = '48px';
        line.className = 'wh-shiftline on'; line.innerHTML = `<span style="font-size:20px">🟢</span><span>On shift · ${dur(e - n)} to go<small>${where}</small></span>`;
        prog.style.display = '';
        const pct = Math.min(100, Math.max(0, (n - s) / (e - s) * 100));
        prog.querySelector('i').style.width = pct + '%';
        const sp = prog.querySelectorAll('.wh-progmeta span'); sp[0].textContent = 'Clocked in ' + fmt(state.currentClock.clock_in_at); sp[1].textContent = 'Break due ' + fmt(s + 4 * 36e5) + ' · ends ' + fmt(e);
      } else {
        prog.style.display = 'none';
        const bt = document.getElementById('big-time'); bt.style.fontSize = '';
        if (window.__whDone) { line.className = 'wh-shiftline on'; line.innerHTML = `<span style="font-size:20px">✅</span><span>Shift complete, see you next time<small>${where}</small></span>`; bt.textContent = new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }); }
        else if (n > s) { line.className = 'wh-shiftline late'; line.innerHTML = `<span style="font-size:20px">⏰</span><span>Your shift started ${dur(n - s)} ago<small>${where}</small></span>`; }
        else { line.className = 'wh-shiftline soon'; line.innerHTML = `<span style="font-size:20px">🕑</span><span>Shift starts in ${dur(s - n)}<small>${where}</small></span>`; }
      }
    };
    tick(); setInterval(tick, 1000);
    if (scene === 'offline') {
      sync.innerHTML = '<span class="wh-sync wait">⏳ 1 clock-in saved on this phone — syncs automatically</span>';
    } else {
      sync.innerHTML = '<span class="wh-sync ok">✓ All clock events synced</span>';
    }

    if (scene === 'geofence') {
      const bg = document.createElement('div'); bg.className = 'wh-sheet-bg';
      const sh = document.createElement('div'); sh.className = 'wh-sheet';
      sh.innerHTML = `<div class="wh-grab"></div>
        <div style="font-size:18px;font-weight:800">📍 You're 420 m from ${shift.site.name}</div>
        <div style="color:var(--muted);font-size:14px;margin-top:4px">Your manager will see this clock-in was outside the site area. You can still clock in — just add a quick note.</div>
        <div class="wh-map"><span class="wh-pin" style="left:38%;top:55%">⛽</span><span class="wh-pin" style="left:74%;top:34%">🧍</span></div>
        <div style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:12px">
          ${['Parking up', 'Delivery run', 'GPS is wrong', 'Other'].map((t, i) => `<span style="padding:8px 12px;border-radius:99px;font-size:13px;font-weight:600;border:1px solid ${i === 0 ? 'var(--accent)' : 'var(--border)'};background:${i === 0 ? 'rgba(251,191,36,.14)' : 'transparent'};color:${i === 0 ? 'var(--accent)' : 'var(--text)'}">${t}</span>`).join('')}
        </div>
        <button class="btn" style="margin-bottom:8px">⏱️ Clock in anyway</button>
        <button class="btn secondary">Try location again</button>`;
      document.body.append(bg, sh);
    }

    if (scene === 'rota') {
      document.querySelector('.tab[data-tab="rota"]').click();
      await new Promise(r => setTimeout(r, 700));
      const rota = document.getElementById('tab-rota');
      const ptr = document.createElement('div'); ptr.className = 'wh-ptr'; ptr.innerHTML = '<span class="sp"></span> Refreshing…';
      const cached = document.createElement('div'); cached.className = 'wh-cached';
      cached.innerHTML = '⚡ <span style="flex:1">Shown instantly from this phone · saved 14:02</span><span style="color:var(--accent);font-weight:700">Live</span>';
      rota.prepend(cached); rota.prepend(ptr);
      window.scrollTo(0, 0);
    }
  });
})();
