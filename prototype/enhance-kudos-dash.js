// PROTOTYPE — manager side of shout-outs on the dashboard (Live attendance + Who's in rows).
(function () {
  const css = `
  .wk-thank{margin-left:10px;padding:5px 10px;border-radius:99px;border:1px solid var(--border-strong);background:#fff;font:600 12px inherit;font-family:inherit;color:var(--text);cursor:pointer}
  .wk-thank:hover{border-color:var(--amber-2);background:#fffbeb}
  .wk-ov{position:fixed;inset:0;background:rgba(15,23,42,.45);backdrop-filter:blur(3px);z-index:9998;display:flex;align-items:flex-start;justify-content:center;padding-top:9vh}
  .wk-m{width:540px;background:#fff;border-radius:16px;box-shadow:0 30px 80px rgba(15,23,42,.35);padding:24px}
  .wk-chips{display:flex;gap:8px;flex-wrap:wrap;margin:16px 0 12px}
  .wk-chip{padding:8px 12px;border-radius:99px;border:1px solid var(--border-strong);font-size:13px;font-weight:600;background:#fff}
  .wk-chip.on{background:#fffbeb;border-color:var(--amber-2);color:#92400e}
  .wk-m textarea{width:100%;min-height:84px;border:1px solid var(--border-strong);border-radius:10px;padding:10px 12px;font:inherit;font-size:14px}
  .wk-row{display:flex;align-items:center;gap:10px;margin-top:12px;font-size:14px}
  .wk-sw{width:40px;height:22px;border-radius:99px;background:var(--green);position:relative}.wk-sw::after{content:'';position:absolute;right:3px;top:3px;width:16px;height:16px;border-radius:50%;background:#fff}
  .wk-prev{margin-top:14px;border:1px dashed var(--border-strong);border-radius:12px;padding:12px;background:var(--card-2);font-size:13px;color:var(--muted)}
  .wk-btns{display:flex;gap:8px;justify-content:flex-end;margin-top:18px}
  .wk-b{padding:9px 16px;border-radius:10px;border:1px solid var(--border-strong);background:#fff;font:inherit;font-size:14px;font-weight:600}
  .wk-b.pri{background:#f59e0b;border-color:#f59e0b;color:#0f172a}
  .wk-tally{display:flex;gap:10px;flex-wrap:wrap}
  .wk-tally div{flex:1;min-width:150px;background:var(--card-2);border:1px solid var(--border);border-radius:12px;padding:12px 14px}
  .wk-tally b{display:block;font-size:22px}
  .wk-tally span{font-size:12px;color:var(--muted)}`;
  const st = document.createElement('style'); st.textContent = css; document.head.appendChild(st);
  const wait = (fn) => { const t = setInterval(() => { const el = document.getElementById('live-attendance'); if (el && el.children.length > 1) { clearInterval(t); setTimeout(fn, 400); } }, 150); };
  wait(() => {
    document.querySelectorAll('#org-banners > *').forEach(b => { if (/two-step/i.test(b.textContent)) b.style.display = 'none'; });
    document.querySelectorAll('#live-attendance > div').forEach(row => {
      const right = row.lastElementChild; const b = document.createElement('button'); b.className = 'wk-thank'; b.textContent = '🙌 Thank'; right.appendChild(b);
    });
    const ov = document.createElement('div'); ov.className = 'wk-ov';
    ov.innerHTML = `<div class="wk-m">
      <div style="font-size:19px;font-weight:700">🙌 Send Priya Shah a shout-out</div>
      <div style="color:var(--muted);font-size:14px;margin-top:4px">Shell Winnall · on shift now since 06:00</div>
      <div class="wk-chips">
        <span class="wk-chip on">🤝 Covered a shift</span><span class="wk-chip">⭐ Great with customers</span><span class="wk-chip">💳 GO+ star</span>
        <span class="wk-chip">✨ Spotless site</span><span class="wk-chip">📦 Smashed the delivery</span><span class="wk-chip">💪 Went the extra mile</span></div>
      <textarea>Thanks for jumping in on Sunday at such short notice. You saved the day and the site ran perfectly!</textarea>
      <div class="wk-row"><span class="wk-sw"></span><span>Also show it on the Winnall team's Today screen</span></div>
      <div class="wk-prev">Priya gets a push notification and a celebration in the app. Counts towards her <b>🤝 Team player</b> and <b>🙌 Appreciated</b> badges.</div>
      <div class="wk-btns"><button class="wk-b">Cancel</button><button class="wk-b pri">Send shout-out 🙌</button></div>
    </div>`;
    if (new URLSearchParams(location.search).get('k') === 'modal') document.body.appendChild(ov);
  });
})();
