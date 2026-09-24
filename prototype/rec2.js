// usage: node rec2.js <query> <out> <mode:still|video> [secs] [waitms]
const { chromium } = require('playwright');
const fs = require('fs'), path = require('path');
const [,, qs, outp, mode, secs = '6', waitms = '4200'] = process.argv;
const PUB = process.env.WORKHIVE_PUBLIC || '../workhive/public', H = __dirname;
const ENH = ['enhance-staff.js', 'celebrate.js', 'rewards.js', 'hook-rewards.js'].map(f => fs.readFileSync(path.join(H, f), 'utf8')).join('\n');
(async () => {
  const b = await chromium.launch();
  const o = { viewport: { width: 390, height: 844 }, deviceScaleFactor: mode === 'video' ? 1 : 2, serviceWorkers: 'block', timezoneId: 'Europe/London' };
  if (mode === 'video') o.recordVideo = { dir: path.join(H, 'vid-tmp'), size: { width: 390, height: 844 } };
  const ctx = await b.newContext(o);
  await ctx.addInitScript({ path: path.join(H, 'fixtures-staff.js') });
  await ctx.route('**/*', async (route) => {
    const u = new URL(route.request().url());
    if (u.hostname === 'app.local') {
      if (u.pathname === '/__enhance.js') return route.fulfill({ contentType: 'application/javascript', body: ENH });
      const fp = path.join(PUB, u.pathname); if (!fs.existsSync(fp)) return route.fulfill({ status: 404, body: '' });
      let body = fs.readFileSync(fp);
      if (u.pathname.endsWith('.html')) { const x = body.toString(); const i = x.lastIndexOf('</body>'); body = Buffer.from(x.slice(0, i) + '<script src="/__enhance.js" defer></script>' + x.slice(i)); }
      return route.fulfill({ body, contentType: u.pathname.endsWith('.html') ? 'text/html' : undefined });
    }
    if (u.pathname.endsWith('supabase.js')) return route.fulfill({ contentType: 'application/javascript', body: fs.readFileSync(path.join(H, 'mock-supabase.js')) });
    return route.fulfill({ status: 200, contentType: 'application/json', body: '{}' });
  });
  const page = await ctx.newPage();
  page.on('pageerror', e => { if (!/replace/.test(e.message)) console.error('PAGEERR', e.message.slice(0, 200)); });
  await page.goto('http://app.local/app.html?scene=hero&' + qs, { waitUntil: 'domcontentloaded' });
  if (mode === 'video') { await page.waitForTimeout(+secs * 1000); const v = page.video(); await ctx.close(); await v.saveAs(outp + '.webm'); await v.delete(); }
  else { await page.waitForTimeout(+waitms); await page.screenshot({ path: outp + '.png' }); await ctx.close(); }
  await b.close();
})();
