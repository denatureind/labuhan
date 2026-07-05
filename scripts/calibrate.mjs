/**
 * Kalibrasi jalur dekorasi: bekukan animasi kendaraan/kapal pada beberapa
 * titik kemajuan lalu screenshot — untuk memastikan sprite duduk di jalan/air.
 * Pakai: node scripts/calibrate.mjs [fraksi ...]  (default 0.15 0.3 0.45)
 */
import { chromium } from 'playwright';

const fractions = process.argv.slice(2).map(Number).filter((x) => x > 0 && x < 1);
const points = fractions.length ? fractions : [0.15, 0.3, 0.45];

// durasi animasi per selector — HARUS cocok dengan GameScreen.svelte
const ANIMS = [
  ['.veh.sedan', 46],
  ['.veh.mvp', 52],
  ['.veh.boxtruck', 61],
  ['.veh.truk', 40],
  ['.ship-track', 84],
  ['.bird-track.b0', 34],
  ['.bird-track.b1', 47],
  ['.bird-track.b2', 41],
];

const b = await chromium.launch({ channel: 'chrome', headless: true });
const p = await b.newPage({ viewport: { width: 1440, height: 900 } });
await p.goto('http://localhost:5199/', { waitUntil: 'networkidle' });
await p.evaluate(() => localStorage.clear());
await p.reload({ waitUntil: 'networkidle' });
await p.getByRole('button', { name: /Mulai Memimpin/ }).click();
await p.waitForTimeout(400);
await p.getByRole('button', { name: /Pak Bahari/ }).click();
await p.getByRole('button', { name: /Pimpin sebagai/ }).click();
await p.waitForTimeout(700);
await p.getByRole('button', { name: /Mulai Hari/ }).click();
await p.waitForTimeout(500);
await p.locator('.choice:enabled').first().click();
await p.waitForTimeout(400);
await p.getByRole('button', { name: /Lanjut Kelola/ }).click();
await p.waitForTimeout(900);

for (const frac of points) {
  const css =
    ANIMS.map(
      ([sel, dur]) =>
        `${sel} { animation-delay: -${(dur * frac).toFixed(1)}s !important; animation-play-state: paused !important; opacity-override: none; }`,
    ).join('\n') + `\n.stage { transition: none !important; }`;
  const handle = await p.addStyleTag({ content: css });
  await p.waitForTimeout(350);
  await p.screenshot({ path: `scripts/shots/cal-${String(frac).replace('.', '')}.png` });
  await handle.evaluate((el) => el.remove());
}

await b.close();
console.log('kalibrasi tersimpan:', points.map((f) => `cal-${String(f).replace('.', '')}.png`).join(', '));
