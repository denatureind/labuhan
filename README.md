# Pelabuhan Hijau: Muara Harapan

Game simulasi-naratif berbahasa Indonesia: kamu memimpin pelabuhan kecil di pesisir
selama **30 hari operasional**, menyeimbangkan enam indikator (Dana, Reputasi,
Lingkungan, SDM, Infrastruktur, Komunitas) di persimpangan kepentingan bisnis, laut,
dan warga. Satu indikator menyentuh nol = pelabuhan ditutup paksa hari itu juga.

## Menjalankan

```bash
npm install
npm run dev      # buka http://localhost:5173
```

| Perintah | Fungsi |
|---|---|
| `npm run dev` | server pengembangan |
| `npm run build` | build produksi ke `dist/` |
| `npm run preview` | sajikan hasil build |
| `npm run check` | pemeriksaan tipe (svelte-check) |
| `npm run simulate` | simulasi keseimbangan headless: 4 strategi bot × 3 karakter × 12 run |
| `node scripts/playtest.mjs` | playtest UI end-to-end via Playwright (butuh `npm run dev` di port 5199) |
| `node scripts/fullrun.mjs` | bot memainkan 30 hari penuh secara alami di browser (port 5199) |

## Arsitektur

- **Svelte 5 (runes) + TypeScript + Vite.** Tanpa framework game — DOM/CSS untuk
  seluruh presentasi, WebAudio untuk efek suara sintesis (tanpa file audio).
- `src/lib/engine/core.ts` — logika murni tanpa UI (bisa diuji headless):
  efek & softcap, entropi harian bertingkat, cooldown, skenario multi-hari,
  undian kartu per fase, deteksi kritis, evaluasi ending.
- `src/lib/engine/store.svelte.ts` — lapisan reaktif: fase harian, autosave
  localStorage, sinyal animasi HUD.
- `src/lib/data/` — seluruh konten (3 karakter, 6 fasilitas × 3–4 aksi,
  ~40 kartu kejadian dalam 3 fase dramatik + kejadian terjadwal & kartu buntut
  berbasis flag, 8 skenario, 5 ending + 6 narasi kegagalan).
- `src/lib/ui/` — layar: judul, pilih karakter, peta pelabuhan interaktif,
  kartu kejadian, panel fasilitas, rangkuman harian, layar akhir (dengan grafik
  jejak 30 hari), efek cuaca.

## Desain inti

- **Trade-off nyata:** hampir tiap aksi/pilihan menaikkan sebagian indikator dan
  menurunkan yang lain; aksi yang diprakarsai sendiri tak boleh membunuhmu
  (diblokir), tapi **kartu kejadian bisa** — keputusan buruk berakibat fatal.
- **Dunia bergerak sendiri:** entropi pagi (aus operasional) meningkat per fase,
  skenario terjadwal (panen ikan, badai, sorotan media) memberi efek otomatis
  harian; strip "barometer" di atas HUD membocorkan cuaca buruk yang mendekat.
- **Keseimbangan tervalidasi:** `npm run simulate` — bot seimbang selamat dan
  meraih ending baik, bot serakah berakhir "Raja Bisnis", bot pasif tamat di
  fase eskalasi/krisis.

Aset peta & sprite dari prototipe sebelumnya; model 3D Kenney.nl (CC0).
