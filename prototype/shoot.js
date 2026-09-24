// usage: node shoot.js <page> <fixtures.js> <out.png> [enhance.js] [w] [h] [actions.js]
const { chromium } = require('playwright');
const fs = require('fs'); const path = require('path');
const [,, pagePath, fixtures, out, enhance, w = '390', h = '844', actions] = process.argv;
const PUB = process.env.WORKHIVE_PUBLIC || '../workhive/public';
const H = __dirname;
(async () => {
  const b = await chromium.launch();
  const ctx = await b.newContext({ viewport: { width: +w, height: +h }, deviceScaleFactor: 2, serviceWorkers: 'block', timezoneId: 'Europe/London' });
  await ctx.addInitScript({ path: path.resolve(H, fixtures) });
  await ctx.addInitScript(() => { try { localStorage.setItem('wh_install_dismissed', String(Date.now())); localStorage.setItem('wh_notif_gate_dismissed', String(Date.now())); } catch(e){} });
  await ctx.route('**/*', async (route) => {
    const u = new URL(route.request().url());
    if (u.hostname === 'app.local') {
      if (u.pathname === '/__enhance.js' && enhance) return route.fulfill({ contentType: 'application/javascript', body: fs.readFileSync(path.resolve(H, enhance)) });
      let p = u.pathname === '/' ? '/index.html' : u.pathname;
      const fp = path.join(PUB, p);
      if (!fs.existsSync(fp)) return route.fulfill({ status: 404, body: '' });
      let body = fs.readFileSync(fp);
      if (p.endsWith('.html') && enhance) { const x = body.toString(); const i = x.lastIndexOf('</body>'); body = Buffer.from(x.slice(0, i) + '<script src="/__enhance.js" defer></script>' + x.slice(i)); }
      return route.fulfill({ body, contentType: p.endsWith('.html') ? 'text/html' : undefined });
    }
    if (u.pathname.includes('supabase-js') || u.pathname.endsWith('supabase.js')) return route.fulfill({ contentType: 'application/javascript', body: fs.readFileSync(path.join(H, 'mock-supabase.js')) });
    if (u.hostname.includes('fonts.g')) return route.continue().catch(()=>route.abort());
    if (u.hostname.includes('cdn.jsdelivr') || u.hostname.includes('cdnjs')) return route.continue().catch(()=>route.abort());
    return route.fulfill({ status: 200, contentType: 'application/json', body: '{}' });
  });
  const page = await ctx.newPage();
  page.on('pageerror', e => console.error('PAGEERR', e.message.slice(0, 200)));
  page.on('dialog', d => d.dismiss());
  await page.goto('http://app.local/' + pagePath, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(2500);
  if (actions) await require(path.resolve(H, actions))(page);
  await page.screenshot({ path: out, fullPage: false });
  await b.close();
})();
