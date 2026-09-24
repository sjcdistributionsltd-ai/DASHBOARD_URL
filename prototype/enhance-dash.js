// PROTOTYPE — WorkHive manager/owner dashboard enhancement layer (additive; no schema or write-path changes).
(function () {
  const scene = new URLSearchParams(location.search).get('scene') || 'overview';
  const css = `
  .wx-fresh{display:inline-flex;align-items:center;gap:6px;font-size:12px;font-weight:600;color:var(--muted);background:var(--card);border:1px solid var(--border);border-radius:99px;padding:5px 10px}
  .wx-fresh i{width:8px;height:8px;border-radius:50%;background:var(--green);box-shadow:0 0 0 3px rgba(22,163,74,.18)}
  .wx-fixed{position:relative}
  .wx-fixed{overflow:visible!important}.wx-fixed::after{content:'✓ fixed';position:absolute;top:-9px;right:12px;border:1px solid rgba(22,163,74,.35);background:#f0fdf4!important;font-size:10px;font-weight:800;text-transform:uppercase;letter-spacing:.04em;background:rgba(22,163,74,.1);color:var(--green);border-radius:6px;padding:2px 6px}
  .wx-attn{display:flex;gap:10px;flex-wrap:wrap;margin:0 0 18px}
  .wx-attn a{display:flex;align-items:center;gap:8px;background:var(--card);border:1px solid var(--border);border-left:4px solid var(--amber-2);border-radius:10px;padding:10px 14px;font-size:13px;font-weight:600;color:var(--text);text-decoration:none;box-shadow:var(--shadow-sm)}
  .wx-attn a.red{border-left-color:var(--red)} .wx-attn a.blue{border-left-color:var(--blue)}
  .wx-attn b{font-size:15px}
  .wx-kbd{font:600 11px ui-monospace,monospace;border:1px solid var(--border-strong);border-bottom-width:2px;border-radius:5px;padding:1px 5px;color:var(--muted);background:var(--card-2)}
  .wx-ov{position:fixed;inset:0;background:rgba(15,23,42,.45);backdrop-filter:blur(3px);z-index:9998;display:flex;align-items:flex-start;justify-content:center;padding-top:12vh}
  .wx-pal{width:640px;background:#fff;border-radius:16px;box-shadow:0 30px 80px rgba(15,23,42,.35);overflow:hidden;border:1px solid var(--border)}
  .wx-pal input{width:100%;border:0;border-bottom:1px solid var(--border);padding:18px 20px;font-size:17px;outline:none;font-family:inherit}
  .wx-grp{font-size:11px;font-weight:800;letter-spacing:.06em;text-transform:uppercase;color:var(--subtle);padding:12px 20px 4px}
  .wx-it{display:flex;align-items:center;gap:12px;padding:10px 20px;font-size:14px;color:var(--text)}
  .wx-it.sel{background:rgba(22,163,74,.08);box-shadow:inset 3px 0 0 var(--green)}
  .wx-it .ic{width:30px;height:30px;border-radius:8px;background:var(--card-2);display:flex;align-items:center;justify-content:center;font-size:16px;border:1px solid var(--border)}
  .wx-it .sub{color:var(--muted);font-size:12px} .wx-it .r{margin-left:auto;display:flex;gap:4px;align-items:center;color:var(--subtle);font-size:12px}
  .wx-it mark{background:rgba(251,191,36,.35);color:inherit;border-radius:3px;padding:0 1px}
  .wx-foot{display:flex;gap:16px;padding:10px 20px;border-top:1px solid var(--border);font-size:12px;color:var(--muted);background:var(--card-2)}
  .wx-tools{display:flex;gap:8px;align-items:center;margin:0 0 12px}
  .wx-tools input{flex:1;max-width:320px;padding:8px 12px;border:1px solid var(--border-strong);border-radius:10px;font:inherit;font-size:14px}
  .wx-chip{padding:7px 12px;border-radius:99px;border:1px solid var(--border-strong);font-size:13px;font-weight:600;background:#fff;color:var(--text)}
  .wx-chip.on{background:rgba(22,163,74,.1);border-color:var(--green);color:var(--green)}
  .wx-btn{padding:8px 14px;border-radius:10px;border:1px solid var(--border-strong);background:#fff;font:inherit;font-size:13px;font-weight:600;color:var(--text)}
  .wx-btn.pri{background:var(--green);color:#fff;border-color:var(--green)} .wx-btn.red{background:var(--red);color:#fff;border-color:var(--red)}
  th.wx-sort{cursor:pointer;user-select:none} th.wx-sort span{color:var(--green);margin-left:4px}
  .wx-modal{width:520px;background:#fff;border-radius:16px;box-shadow:0 30px 80px rgba(15,23,42,.35);padding:24px}
  .wx-modal textarea{width:100%;min-height:80px;border:1px solid var(--border-strong);border-radius:10px;padding:10px 12px;font:inherit;font-size:14px;margin-top:10px}
  .wx-toast{position:fixed;left:50%;bottom:28px;transform:translateX(-50%);background:#0f172a;color:#fff;padding:12px 16px;border-radius:12px;font-size:14px;display:flex;gap:16px;align-items:center;z-index:9999;box-shadow:0 10px 30px rgba(0,0,0,.3)}
  .wx-toast button{background:none;border:0;color:var(--amber);font-weight:700;font:inherit;font-weight:700;cursor:pointer}
  `;
  const st = document.createElement('style'); st.textContent = css; document.head.appendChild(st);
  const wait = (fn) => { const t = setInterval(() => { const v = document.getElementById('stat-approvals'); if (v && v.textContent.trim() !== '' && document.getElementById('live-now-meta')?.textContent) { clearInterval(t); setTimeout(fn, 400); } }, 150); };
  wait(async () => {
    // hide the MFA nag + floating bubbles for a cleaner shot
    document.querySelectorAll('#org-banners > *').forEach(b => { if (/two-step/i.test(b.textContent)) b.style.display = 'none'; });

    // 1. KPI fix: head:true returns `count`, not rows.
    const [{ count: ts }, { count: hol }, { count: open }] = await Promise.all([
      sb.from('time_entries').select('id', { count: 'exact', head: true }).eq('status', 'pending'),
      sb.from('holiday_requests').select('id', { count: 'exact', head: true }).eq('status', 'pending'),
      sb.from('shifts').select('id', { count: 'exact', head: true }).eq('status', 'open'),
    ]);
    const ap = document.getElementById('stat-approvals'); ap.textContent = (ts || 0) + (hol || 0); ap.closest('.stat')?.classList.add('wx-fixed');
    const os = document.getElementById('stat-open-shifts'); os.textContent = open || 0; os.closest('.stat')?.classList.add('wx-fixed');
    const ac = document.getElementById('approvals-count'); if (ac) { ac.textContent = (ts || 0) + (hol || 0); ac.style.display = 'inline-block'; }

    // 2. Freshness pill + keyboard hint in the header.
    const hdr = document.getElementById('site-pill').parentElement;
    const fresh = document.createElement('span'); fresh.className = 'wx-fresh'; fresh.innerHTML = '<i></i> Live · updated 12s ago';
    hdr.prepend(fresh);

    // 3. "Needs attention" strip, one line per actionable item, each deep-linking to a panel (#approvals etc.).
    const grid = document.querySelector('#panel-overview .stat-grid');
    const attn = document.createElement('div'); attn.className = 'wx-attn';
    attn.innerHTML = `
      <a href="#approvals" class="red">✅ <b>${ts}</b> timesheets + <b>${hol}</b> holidays to approve →</a>
      <a href="#cash">🏦 Cash banking: <b>Chandlers Ford</b> not banked yesterday →</a>
      <a href="#checks">🧾 <b>2</b> EOD checks flagged at Eastleigh →</a>
      <a href="#rota" class="blue">📅 <b>${open}</b> open shifts this week →</a>`;
    grid.before(attn);

    if (scene === 'palette') {
      const ov = document.createElement('div'); ov.className = 'wx-ov';
      const it = (ic, t, sub, r, sel) => `<div class="wx-it${sel ? ' sel' : ''}"><div class="ic">${ic}</div><div><div>${t}</div>${sub ? `<div class="sub">${sub}</div>` : ''}</div><div class="r">${r || ''}</div></div>`;
      ov.innerHTML = `<div class="wx-pal"><input value="cash">
        <div class="wx-grp">Go to</div>
        ${it('🏦', '<mark>Cash</mark> Banking', 'Owner · Shell forecourt', '<span class="wx-kbd">G</span><span class="wx-kbd">C</span>', true)}
        ${it('📊', 'Daily Recon', '<mark>cash</mark> vs till vs bank', '')}
        ${it('💷', '<mark>Cash</mark>flow', 'Bank CSV upload', '')}
        <div class="wx-grp">Actions</div>
        ${it('⬇️', 'Export <mark>cash</mark> banking CSV — September', '', '<span class="wx-kbd">↵</span>')}
        ${it('➕', 'Record a <mark>cash</mark> banking for today', 'Shell Winnall', '')}
        <div class="wx-grp">People</div>
        ${it('👤', 'Chloe Price', 'Shell Eastleigh · last did <mark>cash</mark> up 23 Sep', '')}
        <div class="wx-foot"><span><span class="wx-kbd">↑</span> <span class="wx-kbd">↓</span> move</span><span><span class="wx-kbd">↵</span> open</span><span><span class="wx-kbd">?</span> all shortcuts</span><span style="margin-left:auto">Only panels you can open are shown</span></div>
      </div>`;
      document.body.appendChild(ov);
    }

    if (scene === 'table') {
      // Generic table enhancer: filter, sort, CSV — applied to any <table> in a panel.
      const tbl = [...document.querySelectorAll('#panel-overview table')].find(t => t.offsetParent) || document.querySelector('#panel-overview table');
      if (tbl) {
        const card = tbl.closest('.card-block');
        const tools = document.createElement('div'); tools.className = 'wx-tools';
        tools.innerHTML = `<input placeholder="🔍 Filter staff, site, role…" value="">
          <span class="wx-chip on">All (10)</span><span class="wx-chip">On now (6)</span><span class="wx-chip">Not in yet (1)</span>
          <span style="margin-left:auto"></span><button class="wx-btn">⬇️ Export CSV</button><button class="wx-btn">🖨️ Print</button>`;
        tbl.before(tools);
        const ths = tbl.querySelectorAll('th'); ths.forEach((th, i) => { th.classList.add('wx-sort'); if (i === 0) th.innerHTML += '<span>▲</span>'; else th.innerHTML += '<span style="color:var(--subtle)">↕</span>'; });
        card.scrollIntoView({ block: 'start' }); window.scrollBy(0, -20);
        document.querySelector('.main')?.scrollTo?.(0, card.offsetTop - 20);
      }
    }

    if (scene === 'confirm') {
      const ov = document.createElement('div'); ov.className = 'wx-ov';
      ov.innerHTML = `<div class="wx-modal">
        <div style="font-size:19px;font-weight:700">Reject Priya Shah's timesheet?</div>
        <div style="color:var(--muted);font-size:14px;margin-top:4px">Wed 23 Sep · Shell Winnall · 06:02 → 14:41 (8h 39m vs 8h scheduled)</div>
        <div style="display:flex;gap:8px;flex-wrap:wrap;margin-top:16px">
          <span class="wx-chip on">Clocked out late</span><span class="wx-chip">Not on rota</span><span class="wx-chip">Wrong site</span><span class="wx-chip">Duplicate</span>
        </div>
        <textarea>Clocked out 41 min after shift end with no overtime agreed — please add a note if you stayed on.</textarea>
        <div style="font-size:12px;color:var(--muted);margin-top:6px">Priya gets a notification with this reason. You can undo for 10 seconds.</div>
        <div style="display:flex;gap:8px;justify-content:flex-end;margin-top:18px"><button class="wx-btn">Cancel <span class="wx-kbd">Esc</span></button><button class="wx-btn red">Reject timesheet</button></div>
      </div>`;
      document.body.appendChild(ov);
      const t = document.createElement('div'); t.className = 'wx-toast'; t.innerHTML = '✅ Approved Tom Baker · 8h 00m <button>Undo</button>';
      document.body.appendChild(t);
    }
  });
})();
