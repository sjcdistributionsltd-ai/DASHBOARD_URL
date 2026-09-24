// Renders low-bridge.html to an MP4 that WhatsApp can play, frame by frame.
// usage: node render.js [out.mp4] [fps]          (needs ffmpeg with libx264; set FFMPEG=/path if not on PATH)
//        node render.js --stills 1.5,3,6 [prefix] (PNG stills at those seconds, for checking)
const { chromium } = require('playwright');
const { spawn } = require('child_process');
const path = require('path');

const PAGE = 'file://' + path.join(__dirname, 'low-bridge.html') + '?still';
const FFMPEG = process.env.FFMPEG || 'ffmpeg';

async function withPage(fn) {
  const b = await chromium.launch();
  const page = await b.newPage({ viewport: { width: 1080, height: 1080 } });
  page.on('pageerror', (e) => console.error('PAGEERR', e.message));
  await page.goto(PAGE);
  await page.evaluate(() => document.fonts.ready);
  try { await fn(page); } finally { await b.close(); }
}
const frame = (page, t) => page.evaluate((t) => { window.renderAt(t); return document.getElementById('c').toDataURL('image/png').split(',')[1]; }, t);

(async () => {
  const args = process.argv.slice(2);
  if (args[0] === '--stills') {
    const times = args[1].split(',').map(Number), prefix = args[2] || 'still';
    await withPage(async (page) => {
      for (const t of times) require('fs').writeFileSync(`${prefix}-${t}.png`, Buffer.from(await frame(page, t), 'base64'));
    });
    return;
  }
  const out = args[0] || path.join(__dirname, 'low-bridge.mp4');
  const fps = +(args[1] || 30);
  await withPage(async (page) => {
    const total = Math.round((await page.evaluate(() => window.DURATION)) * fps);
    const ff = spawn(FFMPEG, ['-y', '-loglevel', 'error', '-f', 'image2pipe', '-framerate', String(fps), '-i', '-',
      '-c:v', 'libx264', '-profile:v', 'high', '-pix_fmt', 'yuv420p', '-crf', '23', '-preset', 'slow',
      '-movflags', '+faststart', out], { stdio: ['pipe', 'inherit', 'inherit'] });
    const done = new Promise((res, rej) => ff.on('close', (c) => (c ? rej(new Error('ffmpeg exited ' + c)) : res())));
    for (let i = 0; i < total; i++) {
      const buf = Buffer.from(await frame(page, i / fps), 'base64');
      if (!ff.stdin.write(buf)) await new Promise((r) => ff.stdin.once('drain', r));
    }
    ff.stdin.end();
    await done;
    console.log(`wrote ${out} (${total} frames at ${fps} fps)`);
  });
})();
