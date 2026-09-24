// WorkHive training celebrations for SJC Fuel Services (Shell RLA mandatory training).
// Reads the two latest shell_training_rag rows the app already has access to. A module that
// was outstanding in the previous report and is gone from the latest one has been completed.
// Each report is celebrated once per phone. Needs celebrate.js (confetti).
(function () {
  const reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  const css = `
  .wht-ov{position:fixed;inset:0;z-index:9992;background:radial-gradient(ellipse at 50% 35%,rgba(30,58,138,.85),rgba(2,6,23,.95));display:flex;align-items:center;justify-content:center;padding:24px;opacity:0;transition:opacity .3s}
  .wht-ov.show{opacity:1}
  .wht-wrap{width:100%;max-width:360px;position:relative;text-align:center}
  .wht-cap{font-size:84px;line-height:1;display:inline-block;position:relative;z-index:2;animation:whtToss 1.5s cubic-bezier(.3,.7,.4,1) both;filter:drop-shadow(0 10px 18px rgba(0,0,0,.4))}
  .wht-cert{margin-top:-18px;background:#fffbeb;color:#422006;border-radius:6px;padding:30px 22px 22px;position:relative;box-shadow:0 0 0 6px #fbbf24,0 0 0 8px #fef3c7,0 24px 60px rgba(0,0,0,.5);transform:translateY(40px) scale(.9);opacity:0;animation:whtCert .6s cubic-bezier(.34,1.56,.64,1) .7s forwards}
  .wht-cert::before{content:'';position:absolute;inset:8px;border:1.5px solid rgba(180,83,9,.35);border-radius:3px;pointer-events:none}
  .wht-eye{font:800 11px/1 -apple-system,system-ui,sans-serif;letter-spacing:.2em;text-transform:uppercase;color:#b45309}
  .wht-name{font:italic 700 30px/1.15 Georgia,"Times New Roman",serif;margin:12px 0 6px}
  .wht-line{font-size:14px;line-height:1.45;color:#78350f;max-width:26ch;margin:0 auto}
  .wht-mods{display:flex;flex-wrap:wrap;gap:6px;justify-content:center;margin:14px 0 4px}
  .wht-mods span{font-size:11px;font-weight:700;background:rgba(16,185,129,.14);color:#047857;border-radius:99px;padding:4px 9px;opacity:0;animation:whtIn .3s ease-out forwards}
  .wht-foot{display:flex;justify-content:space-between;align-items:flex-end;margin-top:16px;font-size:11px;color:#92400e;text-align:left}
  .wht-seal{width:62px;height:62px;border-radius:50%;background:radial-gradient(circle at 35% 30%,#fde68a,#d97706);display:grid;place-items:center;font-size:26px;box-shadow:0 4px 10px rgba(146,64,14,.35);position:relative}
  .wht-seal::after{content:'';position:absolute;inset:5px;border-radius:50%;border:2px dashed rgba(255,255,255,.6)}
  .wht-chip{display:inline-block;margin-top:18px;background:rgba(59,130,246,.18);color:#bfdbfe;font-weight:700;font-size:14px;border-radius:99px;padding:8px 14px;opacity:0;animation:whtIn .4s ease-out 1.4s forwards}
  .wht-btn{display:block;width:100%;margin-top:14px;padding:15px;border:0;border-radius:14px;background:#fbbf24;color:#0f172a;font:700 16px -apple-system,system-ui,sans-serif;opacity:0;animation:whtIn .4s ease-out 1.6s forwards}
  .wht-step{position:fixed;left:16px;right:16px;bottom:calc(96px + env(safe-area-inset-bottom));z-index:9992;background:#1e293b;border:1px solid rgba(16,185,129,.45);border-radius:18px;padding:16px 16px 14px;color:#f1f5f9;box-shadow:0 18px 40px rgba(0,0,0,.45);transform:translateY(140%);transition:transform .5s cubic-bezier(.34,1.56,.64,1)}
  .wht-step.show{transform:none}
  .wht-step .top{display:flex;gap:12px;align-items:center}
  .wht-step .ic{width:44px;height:44px;border-radius:12px;background:linear-gradient(145deg,#6ee7b7,#10b981);display:grid;place-items:center;font-size:22px;flex-shrink:0;animation:whtPop .5s cubic-bezier(.34,1.56,.64,1) .2s both}
  .wht-step b{display:block;font-size:15px}
  .wht-step span{font-size:13px;color:#94a3b8}
  .wht-bar{height:10px;border-radius:99px;background:rgba(255,255,255,.08);margin:14px 0 6px;overflow:hidden}
  .wht-bar i{display:block;height:100%;border-radius:99px;background:linear-gradient(90deg,#10b981,#6ee7b7);transition:width 1s cubic-bezier(.2,.8,.2,1) .5s}
  .wht-meta{display:flex;justify-content:space-between;font-size:12px;color:#94a3b8}
  @keyframes whtToss{0%{transform:translateY(240px) rotate(0) scale(.6);opacity:0}15%{opacity:1}55%{transform:translateY(-160px) rotate(540deg) scale(1)}100%{transform:translateY(0) rotate(720deg) scale(1)}}
  @keyframes whtCert{to{transform:none;opacity:1}}
  @keyframes whtIn{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:none}}
  @keyframes whtPop{from{transform:scale(.3)}to{transform:scale(1)}}
  @media (prefers-reduced-motion: reduce){.wht-cap,.wht-cert,.wht-mods span,.wht-chip,.wht-btn,.wht-step .ic{animation:none;opacity:1;transform:none}.wht-step{transition:none}}
  `;
  const st = document.createElement('style'); st.textContent = css; document.head.appendChild(st);
  const esc = (t) => String(t).replace(/[<>&"]/g, c => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;', '"': '&quot;' }[c]));

  // All training complete: the cap is thrown, the certificate lands, confetti.
  window.whTrainingDone = function (o) {
    try { navigator.vibrate && navigator.vibrate([30, 60, 30, 60, 80]); } catch (_) {}
    const ov = document.createElement('div'); ov.className = 'wht-ov';
    const date = new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
    ov.innerHTML = `<div class="wht-wrap"><div class="wht-cap">🎓</div>
      <div class="wht-cert">
        <div class="wht-eye">Certificate of completion</div>
        <div class="wht-name">${esc(o.fullName)}</div>
        <p class="wht-line">has completed all Shell RLA mandatory training. Nothing outstanding. Brilliant work!</p>
        <div class="wht-mods">${(o.modules || []).map((m, i) => `<span style="animation-delay:${1.2 + i * .12}s">✓ ${esc(m)}</span>`).join('')}</div>
        <div class="wht-foot"><div>${esc(o.site)}<br>${date}</div><div class="wht-seal">⭐</div><div style="text-align:right">${esc(o.org)}<br>Retail Learning Academy</div></div>
      </div>
      <div class="wht-chip">🎓 Fully trained badge unlocked</div>
      <button class="wht-btn">Brilliant, thanks!</button></div>`;
    document.body.appendChild(ov); requestAnimationFrame(() => ov.classList.add('show'));
    setTimeout(() => window.whConfetti && whConfetti(true), 1300);
    const close = () => { ov.classList.remove('show'); setTimeout(() => ov.remove(), 300); };
    ov.querySelector('.wht-btn').onclick = close;
  };

  // One or more modules done but some still to go: a small progress card.
  window.whTrainingStep = function (o) {
    const total = o.doneNow.length + o.left + (o.doneBefore || 0);
    const before = total - o.left - o.doneNow.length, after = total - o.left;
    const el = document.createElement('div'); el.className = 'wht-step'; el.setAttribute('role', 'status');
    el.innerHTML = `<div class="top"><div class="ic">✅</div><div><b>${o.doneNow.length === 1 ? 'Module complete: ' + esc(o.doneNow[0]) : o.doneNow.length + ' modules complete'}</b>
      <span>${o.left === 1 ? "Just 1 to go, you're nearly there!" : o.left + ' to go. Keep it up, ' + esc(o.name) + '!'}</span></div></div>
      <div class="wht-bar"><i style="width:${Math.round(100 * before / total)}%"></i></div>
      <div class="wht-meta"><span>${after} of ${total} done</span><span>Due by month end</span></div>`;
    document.body.appendChild(el);
    requestAnimationFrame(() => { el.classList.add('show'); requestAnimationFrame(() => { el.querySelector('i').style.width = Math.round(100 * after / total) + '%'; }); });
    setTimeout(() => { const r = el.querySelector('.ic').getBoundingClientRect(); window.whConfettiAt && whConfettiAt(r.left + r.width / 2, r.top + r.height / 2, 30); }, 700);
    try { navigator.vibrate && navigator.vibrate([20, 40, 20]); } catch (_) {}
    el.onclick = () => { el.classList.remove('show'); setTimeout(() => el.remove(), 500); };
    if (!o.hold) setTimeout(() => { el.classList.remove('show'); setTimeout(() => el.remove(), 500); }, 6000);
  };

  // Production trigger, called from loadMyTraining() with the two latest rows (newest first).
  window.whTrainingCheck = function (rows, staff, extra) {
    if (!rows || rows.length < 2) return;
    const [now, prev] = rows;
    const out = Array.isArray(now.outstanding) ? now.outstanding : [];
    const was = Array.isArray(prev.outstanding) ? prev.outstanding : [];
    const doneNow = was.filter(m => !out.includes(m));
    if (!doneNow.length) return;
    const key = 'wh_train_seen_' + now.report_date;
    try { if (localStorage.getItem(key)) return; localStorage.setItem(key, '1'); } catch (_) {}
    const base = Object.assign({ name: staff.preferred_name || staff.first_name, fullName: staff.first_name + ' ' + staff.last_name }, extra || {});
    if (!out.length) whTrainingDone(Object.assign(base, { modules: doneNow }));
    else whTrainingStep(Object.assign(base, { doneNow, left: out.length }));
  };
})();
