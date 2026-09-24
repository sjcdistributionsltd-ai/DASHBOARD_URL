// usage: node record.js <scene> <outprefix> <fixtures,comma,list> <enhance.js> <mode:video|still>
const { chromium } = require('playwright');
const fs = require('fs'); const path = require('path');
const [,, scene, outp, fixtures, enhance, mode] = process.argv;
const PUB = process.env.WORKHIVE_PUBLIC || '../workhive/public', H = __dirname;
(async () => {
  const b = await chromium.launch();
  const opts = { viewport: { width: 390, height: 844 }, deviceScaleFactor: mode === 'video' ? 1 : 2, serviceWorkers: 'block', timezoneId: 'Europe/London',
    geolocation: { latitude: 51.07, longitude: -1.30, accuracy: 10 }, permissions: ['geolocation'] };
  if (mode === 'video') opts.recordVideo = { dir: path.join(H, 'vid-tmp'), size: { width: 390, height: 844 } };
  const ctx = await b.newContext(opts);
  for (const f of fixtures.split(',')) await ctx.addInitScript({ path: path.resolve(H, f) });
  await ctx.addInitScript((still) => { if (still) window.__WHM_HOLD = 1; }, mode !== 'video');
  await ctx.route('**/*', async (route) => {
    const u = new URL(route.request().url());
    if (u.hostname === 'app.local') {
      if (u.pathname === '/__enhance.js') return route.fulfill({ contentType: 'application/javascript', body: fs.readFileSync(path.resolve(H, enhance)) });
      const fp = path.join(PUB, u.pathname);
      if (!fs.existsSync(fp)) return route.fulfill({ status: 404, body: '' });
      let body = fs.readFileSync(fp);
      if (u.pathname.endsWith('.html')) { const x = body.toString(); const i = x.lastIndexOf('</body>'); body = Buffer.from(x.slice(0, i) + '<script src="/__enhance.js" defer></script>' + x.slice(i)); }
      return route.fulfill({ body, contentType: u.pathname.endsWith('.html') ? 'text/html' : undefined });
    }
    if (u.pathname.endsWith('supabase.js')) return route.fulfill({ contentType: 'application/javascript', body: fs.readFileSync(path.join(H, 'mock-supabase.js')) });
    return route.fulfill({ status: 200, contentType: 'application/json', body: '{}' });
  });
  const page = await ctx.newPage();
  page.on('pageerror', e => { if (!/replace/.test(e.message)) console.error('PAGEERR', e.message.slice(0, 200)); });
  page.on('dialog', d => d.accept());
  await page.goto('http://app.local/app.html?scene=' + (scene === 'out' ? 'clocked' : 'hero') + (scene === 'milestone' ? '&m=1' : ''), { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(3200);
  if (scene === 'out') await page.evaluate(() => { state.currentClock.clock_in_at = new Date(Date.now() - (8*60+42)*60000).toISOString(); });
  await page.waitForTimeout(600);
  await page.click('#clock-btn');
  if (mode === 'video') {
    await page.waitForTimeout(5200);
    const v = page.video(); await ctx.close(); await v.saveAs(outp + '.webm'); await v.delete();
  } else {
    await page.waitForTimeout(scene === 'out' ? 1400 : 1100);
    await page.screenshot({ path: outp + '.png' });
    await ctx.close();
  }
  await b.close();
})();
