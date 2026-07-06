/**
 * Diagnosis gerak ambient: dua screenshot berjarak 2 dtk di-diff per piksel,
 * plus dump computed style animasi — dijalankan dua kali:
 * dengan prefers-reduced-motion: no-preference DAN reduce.
 */
import { chromium } from 'playwright';

const SELECTORS = ['.veh.sedan', '.veh.truk', '.ship-track', '.bird-track.b0', '.sea-drift', '.facility.bob'];

async function runCheck(browser, reducedMotion) {
  const ctx = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    reducedMotion,
  });
  const p = await ctx.newPage();
  const errors = [];
  p.on('pageerror', (e) => errors.push(e.message));
  p.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });

  await p.goto('http://localhost:5199/', { waitUntil: 'networkidle' });
  await p.evaluate(() => localStorage.clear());
  await p.reload({ waitUntil: 'networkidle' });
  await p.getByRole('button', { name: /Mulai Memimpin/ }).click();
  await p.waitForTimeout(300);
  await p.getByRole('button', { name: /Pak Bahari/ }).click();
  await p.getByRole('button', { name: /Pimpin sebagai/ }).click();
  await p.waitForTimeout(600);
  await p.getByRole('button', { name: /Mulai Hari/ }).click();
  await p.waitForTimeout(400);
  await p.locator('.choice:enabled').first().click();
  await p.waitForTimeout(300);
  await p.getByRole('button', { name: /Lanjut Kelola/ }).click();
  await p.waitForTimeout(900);

  console.log(`\n========== prefers-reduced-motion: ${reducedMotion} ==========`);

  // 1) Computed animation properties + jumlah animasi yang benar2 berjalan
  const styles = await p.evaluate((sels) => {
    const out = {};
    for (const sel of sels) {
      const el = document.querySelector(sel);
      if (!el) { out[sel] = 'ELEMEN TIDAK ADA'; continue; }
      const cs = getComputedStyle(el);
      out[sel] = `name=${cs.animationName} dur=${cs.animationDuration} state=${cs.animationPlayState} iter=${cs.animationIterationCount}`;
    }
    out['document.getAnimations()'] = document.getAnimations().length + ' animasi aktif';
    out['matchMedia reduce'] = String(matchMedia('(prefers-reduced-motion: reduce)').matches);
    return out;
  }, SELECTORS);
  for (const [k, v] of Object.entries(styles)) console.log('  ', k.padEnd(28), v);

  // 2) Dua screenshot berjarak 2 dtk, clip area peta (hindari HUD & bilah bawah)
  const clip = { x: 0, y: 110, width: 1440, height: 640 };
  const shot1 = (await p.screenshot({ clip })).toString('base64');
  await p.waitForTimeout(2000);
  const shot2 = (await p.screenshot({ clip })).toString('base64');

  // 3) Diff per piksel di dalam browser (canvas)
  const diff = await p.evaluate(async ([b1, b2]) => {
    const load = (b64) =>
      new Promise((res) => {
        const img = new Image();
        img.onload = () => res(img);
        img.src = 'data:image/png;base64,' + b64;
      });
    const [i1, i2] = await Promise.all([load(b1), load(b2)]);
    const cv = document.createElement('canvas');
    cv.width = i1.width;
    cv.height = i1.height;
    const g = cv.getContext('2d', { willReadFrequently: true });
    g.drawImage(i1, 0, 0);
    const d1 = g.getImageData(0, 0, cv.width, cv.height).data;
    g.clearRect(0, 0, cv.width, cv.height);
    g.drawImage(i2, 0, 0);
    const d2 = g.getImageData(0, 0, cv.width, cv.height).data;
    let changed = 0;
    for (let i = 0; i < d1.length; i += 4) {
      if (
        Math.abs(d1[i] - d2[i]) > 8 ||
        Math.abs(d1[i + 1] - d2[i + 1]) > 8 ||
        Math.abs(d1[i + 2] - d2[i + 2]) > 8
      )
        changed++;
    }
    const total = d1.length / 4;
    return { changed, total, pct: ((changed / total) * 100).toFixed(2) };
  }, [shot1, shot2]);
  console.log(`   diff piksel (2 dtk):        ${diff.changed.toLocaleString()} dari ${diff.total.toLocaleString()} berubah (${diff.pct}%)`);

  // 4) Bukti posisi: boundingBox sebelum/sesudah
  const pos = async (sel) => {
    const b = await p.locator(sel).boundingBox().catch(() => null);
    return b ? `${Math.round(b.x)},${Math.round(b.y)}` : 'null';
  };
  const before = {};
  for (const s of ['.veh.sedan', '.ship-track', '.bird-track.b0']) before[s] = await pos(s);
  await p.waitForTimeout(2000);
  for (const s of ['.veh.sedan', '.ship-track', '.bird-track.b0'])
    console.log(`   posisi ${s.padEnd(16)} ${before[s]} -> ${await pos(s)}`);

  if (errors.length) console.log('   ERRORS:', errors.join('; '));
  await ctx.close();
  return diff;
}

const browser = await chromium.launch({ channel: 'chrome', headless: true });
const normal = await runCheck(browser, 'no-preference');
const reduced = await runCheck(browser, 'reduce');
await browser.close();

console.log('\n========== KESIMPULAN ==========');
console.log(`no-preference: ${normal.pct}% piksel berubah — ${Number(normal.pct) > 0.5 ? 'GERAK NYATA' : 'STATIS'}`);
console.log(`reduce:        ${reduced.pct}% piksel berubah — ${Number(reduced.pct) > 0.5 ? 'GERAK NYATA' : 'STATIS'}`);
