/**
 * Playtest UI end-to-end dengan Playwright (Chrome sistem):
 * title -> pilih karakter -> beberapa hari penuh (kejadian, aksi fasilitas,
 * kemampuan, akhiri hari) sambil menangkap error konsol + screenshot.
 */
import { chromium } from 'playwright';
import { mkdirSync } from 'node:fs';

const BASE = 'http://localhost:5199/';
const SHOTS = 'scripts/shots';
mkdirSync(SHOTS, { recursive: true });

const errors = [];
const browser = await chromium.launch({ channel: 'chrome', headless: true });
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
page.on('pageerror', (e) => errors.push(`pageerror: ${e.message}`));
page.on('console', (m) => {
  if (m.type() === 'error') errors.push(`console: ${m.text()}`);
});

const shot = (name) => page.screenshot({ path: `${SHOTS}/${name}.png` });

await page.goto(BASE, { waitUntil: 'networkidle' });
await page.waitForTimeout(1200);
await shot('01-title');

// Mulai
await page.getByRole('button', { name: /Mulai Memimpin/ }).click();
await page.waitForTimeout(900);
await shot('02-select');

// Pilih Bu Citra lalu konfirmasi
await page.getByRole('button', { name: /Bu Citra/ }).click();
await page.waitForTimeout(400);
await page.getByRole('button', { name: /Pimpin sebagai/ }).click();
await page.waitForTimeout(1000);
await shot('03-morning-day1');

async function playOneDay(dayIdx) {
  // Laporan pagi -> mulai hari
  const start = page.getByRole('button', { name: /Mulai Hari/ });
  if (await start.isVisible().catch(() => false)) {
    await start.click();
    await page.waitForTimeout(700);
  }

  // Kartu kejadian (bisa tidak ada bila deck habis)
  const choice = page.locator('.choice:enabled').first();
  if (await choice.isVisible().catch(() => false)) {
    if (dayIdx === 1) await shot('04-event-card');
    await choice.click();
    await page.waitForTimeout(700);
    if (dayIdx === 1) await shot('05-event-outcome');
    await page.getByRole('button', { name: /Lanjut Kelola/ }).click();
    await page.waitForTimeout(600);
  }

  if (dayIdx === 1) await shot('06-map-manage');

  // Buka Dermaga, jalankan satu aksi
  await page.getByRole('button', { name: 'Dermaga' }).click();
  await page.waitForTimeout(600);
  if (dayIdx === 1) await shot('07-facility-panel');
  const work = page.locator('.action:not(.off) button.do').first();
  if (await work.isVisible().catch(() => false)) {
    await work.click();
    await page.waitForTimeout(600);
  }
  await page.getByRole('button', { name: 'Tutup panel', exact: true }).first().click();
  await page.waitForTimeout(400);

  // Kemampuan karakter bila tersedia
  const ability = page.locator('.ability-btn:enabled');
  if (await ability.isVisible().catch(() => false)) {
    await ability.click();
    await page.waitForTimeout(500);
  }

  // Akhiri hari
  await page.getByRole('button', { name: /Akhiri Hari/ }).click();
  await page.waitForTimeout(800);
  if (dayIdx === 1) await shot('08-day-summary');
  const next = page.getByRole('button', { name: /Sambut Hari/ });
  if (await next.isVisible().catch(() => false)) {
    await next.click();
    await page.waitForTimeout(800);
  }
}

for (let d = 1; d <= 4; d++) {
  await playOneDay(d);
  console.log(`hari ${d} selesai`);
}
await shot('09-morning-later');

// Uji save/continue: reload -> layar judul -> Lanjutkan Jabatan
await page.goto(BASE, { waitUntil: 'networkidle' });
await page.waitForTimeout(900);
const cont = page.getByRole('button', { name: /Lanjutkan Jabatan/ });
if (await cont.isVisible().catch(() => false)) {
  await cont.click();
  await page.waitForTimeout(900);
  await shot('10-continued');
  console.log('lanjutkan jabatan: OK');
} else {
  errors.push('Tombol "Lanjutkan Jabatan" tidak muncul setelah reload');
}

// Uji layar akhir cepat: suntik state hari-30 via localStorage lalu mainkan penutupan
await page.evaluate(() => {
  const raw = localStorage.getItem('pelabuhan-hijau-save-v1');
  const s = JSON.parse(raw);
  s.day = 30;
  s.phase = 'morning';
  s.currentEventId = 'hari-terakhir';
  s.usedEvents = [];
  s.stats = { dana: 82, reputasi: 84, lingkungan: 81, sdm: 83, infrastruktur: 80, komunitas: 86 };
  s.history = [{ day: 0, stats: s.stats }];
  localStorage.setItem('pelabuhan-hijau-save-v1', JSON.stringify(s));
});
await page.goto(BASE, { waitUntil: 'networkidle' });
await page.waitForTimeout(700);
await page.getByRole('button', { name: /Lanjutkan Jabatan/ }).click();
await page.waitForTimeout(800);
await page.getByRole('button', { name: /Mulai Hari/ }).click();
await page.waitForTimeout(700);
await page.locator('.choice:enabled').first().click();
await page.waitForTimeout(600);
await page.getByRole('button', { name: /Lanjut Kelola/ }).click();
await page.waitForTimeout(500);
await page.getByRole('button', { name: /Akhiri Hari/ }).click();
await page.waitForTimeout(1800);
await shot('11-ending');

const title = await page.locator('h1').first().textContent();
console.log(`layar akhir: "${title?.trim()}"`);

// Uji layar gagal: stat kritis
await page.getByRole('button', { name: /Pimpin Lagi/ }).click();
await page.waitForTimeout(700);
await page.getByRole('button', { name: /Pak Rendra/ }).click();
await page.getByRole('button', { name: /Pimpin sebagai/ }).click();
await page.waitForTimeout(800);
await page.evaluate(() => {
  const raw = localStorage.getItem('pelabuhan-hijau-save-v1');
  const s = JSON.parse(raw);
  // Kejadian bisa mematikan (tanpa pagar pengaman) — set lingkungan rendah
  // lalu paksa kartu 'sampah-kiriman'; pilihan terakhirnya lingkungan −5.
  s.stats.lingkungan = 3;
  s.phase = 'morning';
  s.currentEventId = 'sampah-kiriman';
  s.usedEvents = [];
  localStorage.setItem('pelabuhan-hijau-save-v1', JSON.stringify(s));
});
await page.goto(BASE, { waitUntil: 'networkidle' });
await page.waitForTimeout(700);
await page.getByRole('button', { name: /Lanjutkan Jabatan/ }).click();
await page.waitForTimeout(800);
await page.getByRole('button', { name: /Mulai Hari/ }).click();
await page.waitForTimeout(700);
await page.locator('.choice:enabled').last().click(); // "Biarkan" → lingkungan 3−5 → 0
await page.waitForTimeout(2000);
await shot('12-fail');
const failTitle = await page.locator('h1').first().textContent({ timeout: 8000 });
console.log(`layar gagal: "${failTitle?.trim()}"`);

await browser.close();

if (errors.length) {
  console.log('\n=== ERRORS ===');
  for (const e of errors) console.log(' -', e);
  process.exit(1);
}
console.log('\nPLAYTEST BERSIH — tanpa error konsol.');
