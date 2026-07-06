# Arsitektur — Pelabuhan Hijau: Muara Harapan

Dokumen ini untuk maintainer yang sudah fasih Vue 3 Composition API tapi belum
pernah menyentuh Svelte. Fokusnya: peta cepat "kalau mau ubah X, buka file Y",
bukan tutorial Svelte dari nol.

---

## 1. Runes Svelte 5 ↔ Vue Composition API

Svelte 5 mengganti sistem reaktivitas lamanya (`let x = 1` otomatis reaktif,
`$:` untuk computed) dengan **runes** — fungsi-fungsi khusus berawalan `$` yang
mirip fungsi Vue Composition API, tapi tanpa `.value`.

| Svelte 5 rune | Padanan Vue 3 | Beda penting |
|---|---|---|
| `let x = $state(0)` | `const x = ref(0)` | Svelte: akses langsung `x`, tulis `x = 1`. Vue: butuh `x.value`. Kompiler Svelte yang menyuntikkan reaktivitasnya, bukan proxy `.value`. |
| `let x = $state({a: 1})` | `const x = reactive({a: 1})` | Sama-sama deep reactive untuk objek/array. |
| `const y = $derived(x * 2)` | `const y = computed(() => x.value * 2)` | Svelte: tulis ekspresi langsung, bukan fungsi. Untuk logika multi-baris ada `$derived.by(() => {...})`. |
| `$effect(() => { ... })` | `watchEffect(() => { ... })` | Sama-sama auto-tracking dependency + cleanup via return function. Jalan setelah DOM update (mirip `watchEffect` dengan `flush: 'post'`). |
| `let { foo } = $props()` | `defineProps<{foo: string}>()` | Deklarasi ada di dalam `<script>`, bukan makro terpisah. |
| `class Foo { x = $state(0) }` | `reactive()` class / Pinia store | Rune bisa dipakai sebagai field class biasa — inilah dasar `store.svelte.ts` di proyek ini (lihat §2). |
| `{#if}...{:else if}...{/if}` | `v-if` / `v-else-if` | Sintaks blok, bukan atribut. |
| `{#each items as item (item.id)}` | `v-for="item in items" :key="item.id"` | Key ditulis dalam kurung setelah alias, bukan atribut. |
| `onclick={fn}` | `@click="fn"` | Svelte 5 pakai atribut event standar DOM (`onclick`), bukan sintaks `on:click` dari Svelte 4. |
| `bind:this={el}` | `ref` template + `ref<HTMLElement>()` | Cara ambil referensi elemen DOM mentah. |

**Poin paling penting untuk developer Vue:** file `.svelte` yang berisi `$state`
langsung di top-level `<script>` (bukan di dalam class) **hanya reaktif di
dalam file `.svelte` itu sendiri** — mirip `ref()` lokal di dalam satu komponen.
Untuk state yang dibagi ke banyak komponen (seperti seluruh state permainan di
proyek ini), rune-nya dipindah ke **file `.svelte.ts`** (ekstensi khusus yang
memberi tahu kompiler Svelte "proses file ini juga untuk runes", meski
isinya TypeScript biasa, bukan komponen). Lihat `src/lib/engine/store.svelte.ts`
— ini setara `defineStore()` Pinia, tapi ditulis sebagai class dengan field
`$state` dan diekspor sebagai singleton instance (`export const game = new Game()`).

---

## 2. Peta file `src/` — di mana harus mengubah apa

```
src/
├── main.ts                  Entry point (setara main.ts Vue) — mount App.svelte ke #app
├── App.svelte                Router kasar: switch 4 layar berdasar game.screen
├── app.css                   Design tokens (warna, font, radius) sebagai CSS var
│
└── lib/
    ├── types.ts               SEMUA tipe TypeScript inti + konstanta (SLOTS_PER_DAY,
    │                          TOTAL_DAYS, DANGER_ZONE). Baca ini dulu sebelum yang lain.
    │
    ├── data/                  ISI PERMAINAN — hampir semua "tuning" ada di sini,
    │   │                      bukan di engine/. Semua data statis, tanpa logika.
    │   ├── stats.ts             Metadata 6 indikator: label, ikon, teks kegagalan.
    │   ├── characters.ts        3 karakter: startStats, trait pasif harian,
    │   │                        kemampuan (ability) + cooldown, crop portrait.
    │   ├── facilities.ts        6 fasilitas + aksi-aksinya (biaya, efek, cooldown,
    │   │                        posisi %x/%y di peta). ← edit di sini untuk ubah
    │   │                        biaya/efek/cooldown sebuah aksi. Posisinya sendiri
    │   │                        jangan diedit dengan tangan — pakai "🛠️ Edit Tata
    │   │                        Letak" (lihat bawah).
    │   ├── traffic.ts           Jalur mobil + kapal kargo ambient (titik-titik %x/%y
    │   │                        + waktu). Ditulis otomatis oleh "🛠️ Edit Tata
    │   │                        Letak" — jangan edit dengan tangan.
    │   ├── events.ts            ~40 kartu kejadian (dilema harian) + 6 kejadian
    │   │                        terjadwal (field `day`). ← edit/tambah kartu di sini.
    │   ├── scenarios.ts         8 skenario multi-hari (badai, panen ikan, dst)
    │   │                        + jadwal SCENARIO_SCHEDULE (hari mulai → id).
    │   ├── endings.ts           5 ending + fungsi evaluateEnding() (aturan
    │   │                        threshold) + statVerdict() (teks per-indikator
    │   │                        di layar akhir).
    │   └── npcs.ts              4 tokoh (Pak Hendra, Mbok Sari, Dr. Laut, dst):
    │                            nama, warna aksen kartu, ikon.
    │
    ├── engine/                LOGIKA — murni TypeScript, TIDAK ADA import Svelte,
    │   │                      TIDAK ADA akses DOM. Bisa dijalankan headless
    │   │                      (lihat scripts/simulate.ts).
    │   ├── core.ts              Jantung permainan: newGame, beginMorning,
    │   │                        resolveChoice, doAction, useAbility, endDay,
    │   │                        nextDay. Semua fungsi murni: (state, input) → efek,
    │   │                        memutasi `state` secara langsung (lihat §4 soal ini).
    │   ├── rng.ts                RNG seeded (mulberry32) supaya undian kartu
    │   │                        deterministik dari `state.seed` — save/load
    │   │                        tidak mengubah kartu yang "seharusnya" muncul.
    │   ├── store.svelte.ts       Lapisan reaktif: bungkus core.ts dengan $state,
    │   │                        trigger SFX, autosave ke localStorage, kelola
    │   │                        transisi layar. Ini satu-satunya file yang
    │   │                        dipakai langsung oleh komponen UI.
    │   ├── traffic.ts            buildTrafficFrames(): ubah titik-titik data/traffic.ts
    │   │                        jadi keyframes Web Animations API (posisi %, bukan
    │   │                        vw/vh — lihat §4h soal kenapa itu penting).
    │   └── editorStore.svelte.ts State "🛠️ Edit Tata Letak" (dev-only): salinan kerja
    │                            facilities/traffic yang bisa diseret bebas, plus
    │                            saveFacilities()/saveTraffic() yang POST ke endpoint
    │                            vite.config.ts. Lihat §6.
    │
    ├── audio/
    │   └── sfx.ts               Semua bunyi disintesis via WebAudio (osilator +
    │                            noise buffer) — tidak ada file .mp3/.wav. Tambah
    │                            bunyi baru = tambah fungsi baru di objek `sfx`.
    │
    └── ui/                    KOMPONEN — masing-masing 1 layar/panel.
        ├── Title.svelte          Layar judul.
        ├── CharacterSelect.svelte Pilih 1 dari 3 karakter.
        ├── GameScreen.svelte     Kontainer utama saat bermain: render peta,
        │                        HUD, dan switch antar sub-layar berdasar
        │                        game.state.phase (lihat §3).
        ├── Hud.svelte            Strip atas: 6 gauge indikator + strip
        │                        "barometer" 30 hari + badge skenario aktif.
        ├── MorningReport.svelte  Modal laporan pagi (fase 'morning').
        ├── EventCard.svelte      Modal kartu dilema (fase 'event').
        ├── FacilityPanel.svelte  Drawer aksi fasilitas (dibuka dari peta saat
        │                        fase 'manage').
        ├── DaySummary.svelte     Modal rangkuman akhir hari (fase 'summary').
        ├── WeatherFX.svelte      Overlay hujan (canvas) / kilau cerah.
        ├── HistoryChart.svelte   Grafik SVG 6-garis di layar akhir.
        ├── OverScreen.svelte     Layar akhir (ending atau kegagalan).
        └── LayoutEditor.svelte   Panel "🛠️ Edit Tata Letak" (dev-only, lihat §6).
```

**Skenario ubah-konten yang sering:**

- *Tambah kartu kejadian baru* → `data/events.ts`, tambahkan objek baru ke
  array `EVENTS`. Beri `phase: 1|2|3` untuk kartu undian biasa, atau `day: N`
  untuk kartu terjadwal pasti, atau `requiresFlag: 'nama-flag'` untuk kartu
  buntut yang hanya muncul setelah pilihan tertentu (lihat `setFlag` di
  `Choice`).
- *Ubah biaya/efek aksi fasilitas* → `data/facilities.ts`, field `cost` dan
  `effects` pada objek `FacilityAction`.
- *Ubah kapan badai/panen terjadi* → `data/scenarios.ts`, objek
  `SCENARIO_SCHEDULE` (hari mulai → id skenario).
- *Ubah ambang batas ending* → `data/endings.ts`, fungsi `evaluateEnding()`.
- *Ubah kesulitan keseluruhan* → `engine/core.ts`, konstanta `SOFTCAP` (baris
  ~63) dan objek `entropy` di dalam `beginMorning()` (aus harian yang meningkat
  per fase).

---

## 3. Alur data satu siklus hari

Setiap hari berjalan lewat 4 sub-layar yang disimpan sebagai
`state.phase: 'morning' | 'event' | 'manage' | 'summary'`. `GameScreen.svelte`
membaca `phase` ini dan me-render komponen yang sesuai secara kondisional
(mirip `<component :is="...">` di Vue, tapi ditulis sebagai `{#if}` berantai).

```
┌─────────────────────────────────────────────────────────────────────┐
│  nextDay(state)                              [engine/core.ts]        │
│    └─ beginMorning(state):                                           │
│         1. terapkan entropi harian (aus infrastruktur/lingkungan)     │
│         2. terapkan trait pasif karakter (mis. Rendra: dana+1,sdm−1)  │
│         3. mulai skenario baru bila SCENARIO_SCHEDULE[day] cocok      │
│         4. terapkan efek harian semua skenario aktif, kurangi sisa hari│
│         5. terapkan efek pasif bangunan (IPAL, panel surya, koperasi) │
│         6. kurangi semua cooldown aksi & cooldown kemampuan           │
│         7. reset slots ke 3, pilih kartu kejadian hari ini            │
│              (pickEvent: terjadwal > buntut-flag > undian ber-seed)   │
│         → state.phase = 'morning'                                    │
└─────────────────────────────────────────────────────────────────────┘
        │  ditampilkan oleh MorningReport.svelte (baca state.morningReport)
        │  tombol "Mulai Hari" → game.startEventPhase()   [store.svelte.ts]
        ▼
┌─────────────────────────────────────────────────────────────────────┐
│  phase = 'event'  (dilewati kalau currentEventId null)                │
│  EventCard.svelte menampilkan kartu dari currentEvent(state)          │
│  Pemain klik pilihan → game.choose(choice)                           │
│    └─ resolveChoice(state, choice)            [engine/core.ts]       │
│         terapkan effects, set flag, mulai skenario (startScenario)    │
│  tombol "Lanjut Kelola" → game.finishEvent() → phase = 'manage'       │
└─────────────────────────────────────────────────────────────────────┘
        ▼
┌─────────────────────────────────────────────────────────────────────┐
│  phase = 'manage'  (bebas urutan; berlanjut sampai pemain klik        │
│    "Akhiri Hari" — slots habis hanya memblokir aksi baru, fase tetap) │
│  Peta (GameScreen.svelte) → klik fasilitas → buka FacilityPanel       │
│  Pemain klik "Kerjakan" pada satu aksi → game.act(actionId)           │
│    └─ doAction(state, actionId)               [engine/core.ts]       │
│         validasi (slot/cooldown/dana/fatal) → terapkan efek →        │
│         slots−1, set cooldown aksi                                   │
│  Kemampuan karakter kapan saja → game.ability() → useAbility(state)   │
│  tombol "Akhiri Hari" → game.closeDay()                               │
│    └─ endDay(state): catat history; jika day==30 → state.over=ending  │
│                       jika belum → phase = 'summary'                  │
└─────────────────────────────────────────────────────────────────────┘
        ▼
┌─────────────────────────────────────────────────────────────────────┐
│  phase = 'summary'  → DaySummary.svelte (pakai dayDeltas(state))      │
│  tombol "Sambut Hari ke-N+1" → game.toNextDay() → nextDay(state)      │
│  ...kembali ke atas...                                                │
│                                                                        │
│  Kapan pun state.over terisi (fail atau ending hari-30) →             │
│  store.svelte.ts men-set screen='over' (dengan jeda 900ms utk SFX)   │
│  → App.svelte merender OverScreen.svelte, bukan GameScreen lagi       │
└─────────────────────────────────────────────────────────────────────┘
```

Yang perlu diingat: **`engine/core.ts` tidak pernah tahu soal Svelte**. Semua
fungsi di sana menerima `state: GameState` (objek data biasa) dan
memutasinya langsung — mirip fungsi util yang menerima `reactive()` object di
Vue dan mengubah propertinya. `store.svelte.ts` adalah satu-satunya jembatan:
ia memegang `state = $state<GameState|null>(null)`, memanggil fungsi-fungsi
`core.ts` itu, lalu menambahkan efek samping UI (bunyi, animasi delta,
autosave). Untuk setiap **mutasi** state, komponen `.svelte` selalu lewat
method di `game` (singleton `store.svelte.ts`) — tidak pernah memanggil fungsi
pengubah `core.ts` langsung. Pengecualiannya dua predikat baca-saja,
`canAfford()` dan `wouldBeFatal()`, yang di-impor langsung dari `core.ts` oleh
`EventCard.svelte` dan `FacilityPanel.svelte` semata untuk menghitung status
tombol (aktif/terkunci).

---

## 4. Hal yang mengejutkan bagi developer Vue

**a) Mutasi langsung pada objek `$state` itu wajar, bukan anti-pattern.**
Di Vue, mengubah properti `reactive()` juga sah (`state.foo = 1`), tapi budaya
Vue sering mendorong pola immutable/action-based (Pinia actions, Vuex mutations).
Di Svelte 5, mutasi langsung adalah **cara utama** — lihat `core.ts`:
`state.stats[key] = after`, `state.slots -= 1`, dst. Kompiler Svelte melacak
mutasi properti individual (fine-grained reactivity, mirip Vue), jadi ini
efisien, bukan sekadar "boleh tapi jelek".

**b) Tidak ada `.value` di mana pun.** Kalau menemukan bug "kok tidak reaktif",
penyebab di Svelte 5 biasanya berbeda dari Vue: bukan lupa `.value`, melainkan
**destructuring yang memutus reaktivitas**. Contoh:
```ts
const { day } = game.state!;  // ❌ day adalah snapshot beku, bukan reaktif
```
```ts
const day = $derived(game.state!.day);  // ✅ re-derive tiap kali state.day berubah
```
Pola ini muncul berulang di komponen `ui/*.svelte` — cari `const s = $derived(game.state!)`
di awal tiap komponen; itu sengaja dipakai supaya `s.stats`, `s.day`, dst tetap
reaktif.

**c) `$derived` untuk nilai turunan sederhana, bukan `$effect`.** Developer Vue
kadang refleks pakai `watchEffect` untuk apa saja. Di proyek ini, `$effect`
**hanya** dipakai sekali — di `WeatherFX.svelte` — untuk kasus yang memang
butuh side-effect imperatif (setup/teardown canvas animation loop, event
listener resize). Semua turunan nilai murni (delta hari ini, event NPC yang
sedang bicara, dsb) pakai `$derived`, setara memilih `computed()` daripada
`watchEffect` + variabel manual di Vue — pilihan yang sama tepatnya berlaku
di kedua framework, Svelte hanya lebih ringkas menuliskannya.

**d) Props dengan default pakai destructuring biasa, bukan `withDefaults`.**
Vue 3 + `<script setup>` butuh `withDefaults(defineProps<...>(), {...})` untuk
default value. Svelte 5 cukup:
```ts
let { storm = false, sunny = false }: { storm?: boolean; sunny?: boolean } = $props();
```
(nilai default seperti ini hanya dipakai di `WeatherFX.svelte`; komponen lain
seperti `FacilityPanel.svelte` juga destructuring `$props()`, tapi tanpa default).

**e) Tidak ada file `.vue` tunggal dengan 3 blok — tapi strukturnya mirip.**
File `.svelte` juga punya `<script>`, markup, dan `<style>` dalam satu file,
urutannya sama seperti `.vue` (script → template → style). `<style>` di
`.svelte` **ter-scope otomatis ke komponen** tanpa perlu atribut `scoped`
(beda dari Vue yang butuh `<style scoped>` eksplisit).

**f) State lintas-komponen sebagai class + singleton, bukan Pinia/Vuex store
resmi.** Svelte tidak (belum) punya "state management library resmi" sekelas
Pinia. Pola yang dipakai di sini — `store.svelte.ts` sebagai class dengan
field `$state` diekspor sebagai satu instance (`export const game = new Game()`)
— adalah idiom umum komunitas Svelte 5, fungsinya setara Pinia store dengan
`state`, `getters` (di sini: `get event()`, `get deltas()`), dan `actions`
(method biasa: `choose()`, `act()`, dst).

**g) Reaktivitas dalam `Array`/`Object` di dalam `$state` itu deep, sama seperti
`reactive()` Vue** — push/pop/assign properti semua terlacak. `state.activeScenarios.push(...)`
di `core.ts` bekerja karena `state` aslinya dibungkus `$state` di `store.svelte.ts`
sebelum dioper ke fungsi-fungsi `core.ts` (meski `core.ts` sendiri, sebagai
TypeScript murni, tidak "tahu" itu proxy reaktif — ia hanya melihat objek
biasa, persis seperti fungsi util Vue yang menerima `reactive()` object apa
adanya).

---

## 5. Menjalankan verifikasi

Tidak ada test runner "resmi" di proyek ini (tidak ada Vitest/Jest dengan unit
test per fungsi). Verifikasi dilakukan lewat kombinasi type-check, simulasi
headless, dan Playwright end-to-end, semuanya sebagai skrip di `scripts/` —
kalau di dunia Vue biasa terpisah jadi `vue-tsc` + Vitest + Cypress, di sini
ketiganya lebih ad-hoc tapi perannya sama.

### 5.1 Perintah yang tersedia

| Perintah | Apa yang dilakukan |
|---|---|
| `npm run check` | `svelte-check` — type-check semua `.ts`/`.svelte`, setara `vue-tsc --noEmit`. Cepat (hitungan detik). |
| `npm run simulate` | Menjalankan `scripts/simulate.ts` lewat `vite-node` (headless, tanpa browser sama sekali). Memainkan 4 strategi bot × 3 karakter × 12 kali, tiap kali satu permainan 30-hari penuh, memakai **hanya** `engine/core.ts` + `data/` — tidak ada UI, tidak ada Svelte yang terlibat. Mencetak tingkat kelangsungan hidup, distribusi ending, dan penyebab kegagalan. Bentuk normalnya: bot "seimbang" lolos 12/12 (campuran ending rakyat/emas), bot "serakah" selalu berakhir 💼bisnis, bot "pasif" selalu mati sebelum hari ke-30. Kalau pola ini bergeser setelah perubahanmu, itu tandanya keseimbangan permainan ikut berubah. |
| `node scripts/playtest.mjs` | Uji end-to-end Playwright: membuka Chrome sungguhan (`channel: 'chrome'`, headless), mengklik tombol asli selama 4 hari, menguji save/lanjut setelah reload halaman, memaksa satu ending hari-30 dan satu pilihan event fatal, lalu **gagal kalau ada error konsol apa pun**. Menulis screenshot ke `scripts/shots/`. **Butuh dev server sudah jalan** (lihat di bawah). |
| `node scripts/fullrun.mjs` | Bot memainkan satu run 30-hari **secara alami** lewat browser sungguhan (bukan lewat `engine/core.ts` langsung seperti `simulate`), mencetak statistik hari-per-hari. Butuh dev server jalan juga. Lebih lambat (~2–4 menit). |
| `node scripts/calibrate.mjs [fraksi...]` | Membekukan animasi ambient di peta (lalu lintas jalan, kunjungan kapal ke dermaga, burung) pada fraksi progres tertentu lalu memotret layarnya — dipakai untuk menyetel jalur dekorasi di `GameScreen.svelte`. |
| `node scripts/motion-diag.mjs` | Membandingkan dua frame berjarak 2 detik (pixel diff) dan membaca style animasi terkomputasi di kedua kondisi `prefers-reduced-motion` — dipakai kalau ada laporan "tidak ada yang bergerak" (game memang sengaja membekukan semua animasi saat reduced-motion aktif, lihat `app.css`). |
| `npm run build` | Build produksi ke `dist/`; lanjutkan dengan `npm run preview` untuk menyajikannya secara lokal. |

`playtest.mjs` dan `fullrun.mjs` menembak `http://localhost:5199` — dev server
harus dinyalakan manual di terminal terpisah dan dibiarkan tetap hidup selama
skrip itu berjalan:

```
npx vite --port 5199 --strictPort
```

`--strictPort` membuatnya gagal jelas (bukan diam-diam pindah port) kalau 5199
sudah dipakai proses lain. Folder `scripts/shots/` sudah masuk `.gitignore`,
jadi tidak perlu dibersihkan manual sebelum commit.

### 5.2 Jenis perubahan → verifikasi minimum

| Jenis perubahan | Verifikasi minimum |
|---|---|
| Angka di `data/` (efek, biaya, cooldown, jadwal skenario, ambang ending) | `check` + `simulate` — **wajib**, karena keseimbangan bisa bergeser; `playtest` kalau sempat. |
| `engine/core.ts` atau `types.ts` | `check` + `simulate` + `playtest`. |
| Komponen `ui/*.svelte` atau `store.svelte.ts` | `check` + `playtest` (`simulate` tidak menyentuh UI sama sekali). |
| Teks/copy saja (string literal) | `check` + `simulate` — output `simulate` harus **identik** dengan sebelum perubahan; itu buktinya tidak ada logika yang ikut tersentuh. |
| Dekorasi ambient di `GameScreen.svelte` | `check` + `calibrate`/`motion-diag` untuk cek visual, + `playtest` untuk memastikan tidak ada error konsol. |
| Sebelum setor/deploy | semua di atas, ditambah `npm run build`. |

---

## 6. "🛠️ Edit Tata Letak" — menyusun posisi bangunan & jalur kendaraan

Tombol ini muncul di pojok kanan-atas `GameScreen.svelte` **hanya saat
`npm run dev`** (dijaga oleh `import.meta.env.DEV`, jadi tidak pernah ikut ke
build produksi). Dibuat karena posisi bangunan/jalur kendaraan di peta adalah
hal yang jauh lebih mudah disusun dengan mata lewat seret-dan-lepas daripada
menebak angka persen secara manual di kode.

**Cara pakai:**

1. `npm run dev`, mainkan sampai masuk peta (fase `manage`).
2. Klik **🛠️ Edit Tata Letak**. Semua bangunan dapat diseret langsung di peta;
   angka x/y/lebar di panel kanan ikut berubah live (atau ketik langsung di
   kotak angkanya untuk presisi).
3. Pilih satu kendaraan/kapal di baris "Jalur Kendaraan & Kapal", lalu klik di
   atas peta untuk menambah titik di ujung jalurnya. Titik yang sudah ada bisa
   diseret, atau dipilih lalu digeser dengan tombol panah (Shift = lompatan
   lebih besar), Delete untuk menghapus. Tombol **▶ Pratinjau Jalur** memutar
   sekali animasinya di tempat untuk mengecek kecepatan/waktu.
4. **💾 Simpan** menulis perubahan langsung ke `data/facilities.ts` atau
   `data/traffic.ts` lewat endpoint dev-only di `vite.config.ts`
   (`layoutEditorPlugin`), lalu memuat ulang halaman.

**Kenapa halaman dimuat ulang setelah Simpan:** menulis file itu memicu Vite
HMR, dan di proyek ini rantai importnya berujung me-remount seluruh `App`
(App.svelte mengimpor Title/CharacterSelect/GameScreen/OverScreen sekaligus).
Daripada melawan itu, `editorStore.svelte.ts` sengaja menyimpan draf ke
`sessionStorage` lalu memanggil `location.reload()` sendiri setelah Simpan
berhasil — hasilnya lebih pasti (memuat definisi baru apa adanya) dan draf +
kendaraan yang sedang dipilih otomatis dipulihkan setelah reload (lihat
`RELOAD_FLAG_KEY` di `App.svelte`, yang juga memanggil `game.continueGame()`
supaya permainan yang sedang berjalan tidak ikut kembali ke layar judul).

**Model data jalur (`TrafficVehicle`/`TrafficPoint` di `types.ts`):** tiap
kendaraan adalah daftar titik `{x, y}` (persen terhadap panggung peta — satuan
yang **sama** dengan `pos` fasilitas), bukan lagi jarak `vw`/`vh` seperti versi
lama. Ini bukan cuma soal kemudahan edit — versi lama mencampur posisi awal
dalam `%` dengan jarak tempuh dalam `vw`/`vh`, padahal lebar panggung sendiri
adalah `max(103vw, 137.3vh)`: di jendela sempit/tinggi (137.3vh menang), jarak
`vw` tetap tapi panggung jadi jauh lebih lebar dari 100vw, sehingga kendaraan
berhenti jauh sebelum sampai ke jalan yang dituju. Memakai `%` untuk titik
jalur (dianimasikan lewat Web Animations API di `engine/traffic.ts`, bukan
`@keyframes` CSS tetap) membuat jalur konsisten di semua ukuran layar.
