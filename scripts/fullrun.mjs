/**
 * Playthrough alami 30 hari penuh di browser sungguhan — bot sederhana:
 * pilih opsi kejadian pertama yang terjangkau, kerjakan aksi fasilitas
 * bergiliran sampai jam kerja habis, pakai kemampuan bila ada, akhiri hari.
 * Lolos = mencapai layar akhir (ending apa pun) tanpa error konsol.
 */
import { chromium } from 'playwright';

const BASE = 'http://localhost:5199/';
const FACILITIES = ['Dermaga', 'Kantor Pelabuhan', 'Kapal Patroli', 'Tambak & Mangrove', 'Pasar Ikan', 'Gudang'];

const errors = [];
const browser = await chromium.launch({ channel: 'chrome', headless: true });
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
page.on('pageerror', (e) => errors.push(`pageerror: ${e.message}`));
page.on('console', (m) => {
  if (m.type() === 'error') errors.push(`console: ${m.text()}`);
});

const vis = (loc) => loc.isVisible().catch(() => false);

await page.goto(BASE, { waitUntil: 'networkidle' });
await page.evaluate(() => localStorage.clear());
await page.reload({ waitUntil: 'networkidle' });
await page.getByRole('button', { name: /Mulai Memimpin/ }).click();
await page.waitForTimeout(400);
await page.getByRole('button', { name: /Pak Rendra/ }).click();
await page.getByRole('button', { name: /Pimpin sebagai/ }).click();
await page.waitForTimeout(600);

let day = 0;
for (let guard = 0; guard < 40; guard++) {
  // Layar akhir?
  const again = page.getByRole('button', { name: /Pimpin Lagi/ });
  if (await vis(again)) break;

  // Pagi
  const start = page.getByRole('button', { name: /Mulai Hari/ });
  if (await vis(start)) {
    day++;
    await start.click();
    await page.waitForTimeout(320);
  }

  // Kejadian — bila dana menipis, hindari pilihan berbiaya
  const nums = (await page.locator('.gauge .g-num').allTextContents().catch(() => [])).map(Number);
  const dana = nums[0] ?? 50;
  const sdm = nums[3] ?? 50;
  let choice = page.locator('.choice:enabled').first();
  if (dana < 45) {
    const free = page.locator('.choice:enabled').filter({ hasNotText: '💰 −' }).first();
    if (await vis(free)) choice = free;
  }
  if (await vis(choice)) {
    await choice.click();
    await page.waitForTimeout(350);
    const next = page.getByRole('button', { name: /Lanjut Kelola/ });
    if (await vis(next)) await next.click();
    await page.waitForTimeout(280);
  }
  if (await vis(again)) break; // kejadian bisa mematikan

  // Kemampuan (Lobi Kilat memeras SDM — jangan saat buruh lelah)
  const ability = page.locator('.ability-btn:enabled');
  if (sdm >= 45 && (await vis(ability))) {
    await ability.click();
    await page.waitForTimeout(250);
  }

  // Aksi fasilitas bergiliran — saat miskin, dahulukan aksi pemasukan
  let order =
    dana < 45
      ? ['Dermaga', 'Tambak & Mangrove', 'Pasar Ikan', 'Gudang']
      : FACILITIES;
  if (sdm < 40) {
    // Rawat pekerja dulu (K3 di Kantor), dan hindari bongkar ekspres yang memeras SDM
    order = ['Kantor Pelabuhan', ...order.filter((n) => n !== 'Dermaga' && n !== 'Kantor Pelabuhan')];
  }
  for (const name of order) {
    const slotsText = await page.locator('.slots').textContent().catch(() => '');
    if (!slotsText) break;
    const fbtn = page.getByRole('button', { name, exact: false }).first();
    if (!(await vis(fbtn))) continue;
    await fbtn.click({ force: true });
    await page.waitForTimeout(300);
    let work = page.locator('.action:not(.off) button.do').first();
    if (sdm < 40 && name === 'Kantor Pelabuhan') {
      const k3 = page.locator('.action:not(.off)').filter({ hasText: 'K3' }).locator('button.do').first();
      if (await vis(k3)) work = k3;
    } else if (dana < 45) {
      const income = page
        .locator('.action:not(.off)')
        .filter({ hasText: /💰 \+/ })
        .locator('button.do')
        .first();
      if (await vis(income)) work = income;
      else work = page.locator('nonexistent'); // jangan belanja saat miskin
    }
    if (await vis(work)) {
      await work.click();
      await page.waitForTimeout(300);
    }
    const close = page.getByRole('button', { name: 'Tutup panel' }).first();
    if (await vis(close)) await close.click();
    await page.waitForTimeout(220);
    const used = await page.locator('.slot.used').count().catch(() => 0);
    if (used >= 3) break;
  }

  // Akhiri hari
  const end = page.getByRole('button', { name: /Akhiri Hari/ });
  if (await vis(end)) {
    await end.click();
    await page.waitForTimeout(500);
  }
  const dawn = page.getByRole('button', { name: /Sambut Hari/ });
  if (await vis(dawn)) {
    const stats = await page.locator('.value').allTextContents().catch(() => []);
    console.log(`hari ${String(day).padStart(2)}: [${stats.join(' ')}]`);
    await dawn.click();
    await page.waitForTimeout(400);
  }
}

await page.waitForTimeout(1500);
await page.screenshot({ path: 'scripts/shots/13-fullrun-end.png' });
const h1 = await page.locator('h1').first().textContent({ timeout: 5000 }).catch(() => '(tidak ada h1)');
console.log(`\nselesai pada hari ${day} — layar akhir: "${h1?.trim()}"`);

await browser.close();
if (errors.length) {
  console.log('\n=== ERRORS ===');
  for (const e of errors) console.log(' -', e);
  process.exit(1);
}
if (day < 30 && !h1?.match(/Kebangkrutan|Kepercayaan|Ekologi|Pemberontakan|Kecelakaan|Perlawanan/)) {
  console.log('PERINGATAN: berhenti sebelum hari 30 tanpa layar gagal yang dikenal');
  process.exit(1);
}
console.log('FULLRUN BERSIH.');
