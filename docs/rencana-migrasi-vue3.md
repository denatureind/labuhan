# LABUHAN / Pelabuhan Hijau v3 — Step 1 Audit & Step 2 Architecture Plan

Status: **APPROVED — go for Vue 3 migration.** No Vue code has been written yet;
that starts in a future execution session (Sonnet-driven, per §2.8). Decisions on
all flagged items are recorded in §D below.
Prepared: 2026-07-03, by Fable 5 (planning session). Execution driver: Sonnet (later sessions).
Source of truth for all numbers: the Phaser prototype source in `src/` (read in full, 18/18 files).

---

## OUTCOME SUMMARY

The migration is low-risk and well-scoped. The LABUHAN prototype already implements
nearly all of the v3 spec — 6 indicators with tuned values, 3 leaders with multiplier
profiles + active skills, 7 interactive facilities (spec lists 6), 9 event cards,
7 multi-day scenarios, instant-fail thresholds, and all 5 endings with narrative text.
All of it lives in plain TypeScript data/classes with zero Phaser-specific game logic,
so it ports to Pinia almost verbatim.

**12 flags** need a decision or a later balance pass (§C). The most important:

1. Spec requires **instant** critical-threshold game-over; prototype only checks at
   day-close and after cards. The Vue design centralizes all mutations to fix this.
2. **Pak Rendra's SDM profile contradicts the spec** (prototype rewards his SDM gains
   ×1.3; spec says he exploits workers). → deep-reasoner.
3. The NPC trio (Pak Hendra / Mbok Sari / Dr. Laut) exists **only as an unused type
   field** — zero cards use them, no portrait art. Not conflated with the 3 leaders
   (separate ids), just unimplemented.
4. Four "free lunch" actions/choices violate the no-cost-free-option rule. → balance pass.
5. Only 9 event cards for 29 card-days. → content phase.

---

## STEP 1 — ASSET & DATA AUDIT

### A1. Asset inventory — game images (`public/assets/images/`, 17 files)

| File | Loaded as (BootScene) | Used by | Status |
|---|---|---|---|
| `bg.png` | `img-bg` | GameScene map background (1200×900 aerial cartoon harbor) | **used** |
| `opening.png` | `img-opening` | MenuScene full-screen background (night harbor, "KANTOR PELABUHAN") | **used** |
| `pilih-karakter.png` | `img-pilih-karakter` | CharacterSelectScene full-screen background — **the 3 leader cards (portraits, names, bios, stat bars) are baked into this image**; the scene only overlays invisible hit-areas + highlight borders | **used** |
| `pilih-karakter2.png` | — | not loaded anywhere | unused variant (keep as alternate) |
| `dermaga.png` | `img-dermaga` | Facility sprite: Dermaga Utama | **used** |
| `gudang.png` | `img-gudang` | Facility sprite: Gudang Logistik | **used** |
| `kantor.png` | `img-kantor` | Facility sprite: Kantor Admin | **used** |
| `tambak.png` | `img-tambak` | Facility sprite: Tambak Nelayan | **used** |
| `tambak1.png`, `tambak2.png` | — | not loaded anywhere | unused variants (keep as alternates) |
| `kapal.png` | `img-kapal` | Facility sprite: Kapal Patroli | **used** |
| `kargo.png` | `img-kargo` | Facility sprite: Kapal Kargo (7th facility) | **used** |
| `pasar.png` | `img-pasar` | Facility sprite: Pasar Ikan | **used** |
| `mvp.png` | `img-mobil` | Map decoration (MPV car) | **used** |
| `sedan.png` | `img-sedan` | Map decoration | **used** |
| `truk.png` | `img-truk` | Map decoration | **used** |
| `box.png` | `img-box` | Map decoration (box van) | **used** |

Referenced but **missing from disk**: `avatar-bahari.png`, `avatar-citra.png`,
`avatar-rendra.png` — declared in `src/data/characters.ts` (`avatar:` field) but never
loaded or drawn; portraits exist only baked into `pilih-karakter.png`. Also missing:
`public/vite.svg` (favicon referenced by `index.html` → 404).

### A2. Asset inventory — Kenney Watercraft Kit 2.1 (`public/assets/`)

`Models/` (47 models × FBX/GLB/OBJ + colormap textures), `Previews/` (46 PNG renders),
`Preview.png`, `License.txt` (CC0, credit optional). **None of it is referenced by any
code.** It is 3D source material, presumably the origin of the facility sprites.
Recommendation: keep in repo as art source, but move out of `public/` (→ `art-source/`)
so ~250 files stop shipping into every production build. No audio assets exist anywhere;
the prototype has no audio.

### A3. Visual/UX target (derived from art files + scene code; **no screenshots were
actually attached to the brief** — this is verified against the real assets instead)

- Game map: bright isometric-cartoon harbor aerial (`bg.png`), facility PNGs positioned
  over it, 50 shimmering additive ripple ovals animating on the water, and a brown
  multiply-blend **pollution overlay whose opacity = `max(0, (80 − lingkungan)/80 × 0.85)`**.
- HUD: left 320px black gradient panel with LABUHAN branding + 6 animated resource bars
  (bar turns red below 20% of max; value text flashes green/red on change); bottom
  gradient strip with "Hari X / 30", "AKHIRI HARI →" (green), "⚡ SKILL" (purple) and
  skill status text.
- Dark navy palette (`#16213E` panels, `#1A1A2E` bg) with teal `#00B4D8` / yellow
  `#F9C74F` accents; menu buttons already imitate Tailwind (Emerald-500 primary,
  Slate-800 outline, Rose-500 close) — DOM/Tailwind replication is straightforward.
- Facility popup: 360px dark panel, accent strip, per-action cost→result line,
  disabled state when unaffordable, cooldown notice; event card: centered 520px modal
  over 75% black overlay, yellow border, 2–3 choice buttons with effect preview.

### A4. Extracted data — core numbers (from `src/config.ts`, verified)

| Indikator | Awal | Maks | Kritis (game over jika ≤) | Bar color |
|---|---|---|---|---|
| 💰 Dana | **150** | 500 | **0** | kuning `#F9C74F` |
| ⭐ Reputasi | **50** | 100 | **10** | oranye `#F4A261` |
| 🌊 Lingkungan | **60** | 100 | **10** | teal `#00B4D8` |
| 👷 SDM | **50** | 100 | **10** | hijau `#52B788` |
| 🏗️ Infrastruktur | **50** | 100 | **5** | abu `#8D99AE` |
| 🤝 Komunitas | **55** | 100 | **10** | ungu `#9B5DE5` |

Duration: 30 days. Game-over check order = dana, reputasi, lingkungan, sdm,
infrastruktur, komunitas (first hit wins). Per-indicator failure narratives exist
(`PESAN_GAME_OVER`): Pelabuhan Bangkrut / Kepercayaan Hancur / Bencana Ekologi /
Krisis Tenaga Kerja / Fasilitas Ambruk / Pemberontakan Nelayan.

### A5. Extracted data — 3 leaders (`characters.ts`, `config.ts`, `SkillSystem.ts`)

Multipliers scale **positive effects only** (from cards, facility results, skills —
NOT scenario passives, NOT costs, NOT negative effects):

| Multiplier | dana | reputasi | lingkungan | sdm | infrastruktur | komunitas |
|---|---|---|---|---|---|---|
| Pak Bahari (Kepala Nelayan & Pengawas Perairan) | 0.9 | 1.1 | **1.4** | 1.0 | 0.9 | **1.3** |
| Bu Citra (Manajer Operasional Pelabuhan) | 1.2 | **1.4** | 0.9 | 1.1 | **1.3** | 0.9 |
| Pak Rendra (Direktur Pengembangan Bisnis) | **1.4** | 1.0 | 0.8 | **1.3** | 1.1 | 0.9 |

| Skill (1 per leader) | Efek dasar | Efektif (× own multiplier) | Cooldown | Syarat |
|---|---|---|---|---|
| Musyawarah Nelayan (Bahari) | +20 komunitas, +10 lingkungan | +26 kom, +14 ling | 5 hari | — |
| Kampanye Reputasi (Citra) | +25 reputasi, −10 dana | +35 rep, −10 dana | 4 hari | dana ≥ 10 |
| Negosiasi Kontrak (Rendra) | +40 dana, −15 reputasi | +56 dana, −15 rep | 6 hari | — |

### A6. Extracted data — 7 facilities & 14 actions (`mapObjects.ts`)

Cooldown is **per facility** (one use locks BOTH of its actions). Costs are paid in
full; results get the leader multiplier (positive parts). Action available only if every
cost can be paid (`resource ≥ biaya`). Positions are stage coordinates (1200×900).

| Fasilitas (pos x,y) | Aksi | Biaya | Hasil | CD |
|---|---|---|---|---|
| Kapal Patroli (1077,116) | Patroli Perairan | 15 dana | +18 ling, +8 rep | 2 |
| | Aksi Bersih Laut | 20 dana, 8 sdm | +25 ling, +10 kom, +12 rep | 4 |
| Gudang Logistik (750,128) | Optimasi Penyimpanan | 15 dana, 5 sdm | +12 infra, +20 dana | 3 |
| | Sewakan Ruang Gudang | 5 infra | +25 dana, +8 kom | 2 |
| Pasar Ikan (445,174) | Festival Ikan | 30 dana | +50 dana, +15 kom, +18 rep | 6 |
| | Digitalisasi Pasar | 25 dana, 10 sdm | +12 kom, +15 rep, +20 dana | 5 |
| Dermaga Utama (923,365) | Perbaiki Dermaga | 25 dana | +15 infra, +5 rep | 3 |
| | Tambah Shift Kerja | 10 dana, 8 sdm | +30 dana, +5 rep | 2 |
| Tambak Nelayan (308,378) | Bantu Pemasaran | 12 dana | +18 kom, +7 rep | 3 |
| | Edukasi Budidaya | 18 dana, 5 rep | +12 kom, +15 ling, +8 sdm | 4 |
| Kantor Admin (517,385) | Pelatihan Staf | 20 dana | +20 sdm, +8 rep | 4 |
| | Lobi Mitra Baru | 10 dana, 5 rep | +35 dana, +10 rep | 5 |
| Kapal Kargo (1035,456) | Bongkar Muatan | 10 sdm | +40 dana, −5 infra | 3 |
| | Inspeksi Ketat | 10 dana | +15 rep, +5 ling | 4 |

Plus 4 non-interactive decorations (mvp/sedan/truk/box) with tuned positions.
**Note:** the spec lists 6 facilities; the prototype has 7 (Kapal split into Patroli +
Kargo). Recommendation: **keep all 7** — Kapal Kargo carries `bongkar_muat`, the main
Dana engine; merging would change tuned balance.

### A7. Extracted data — 9 event cards (`events.ts`)

One random card per day (from day 2; see flag F6), each card appears at most once per
run, filtered by its condition. Effects go through the leader multiplier (positive parts).

| Kartu | Syarat muncul | Pilihan → efek |
|---|---|---|
| Penemuan Limbah Ilegal | hari ≥ 3 | Tindak Tegas: +20 dana +10 ling −10 rep · Uang Damai: +50 dana −25 ling −15 kom · Bina & Edukasi: −10 dana +15 rep +5 ling |
| Protes Nelayan Lokal | komunitas < 50 | Kompensasi: −30 dana +25 kom +10 rep · Bubarkan Paksa: −30 kom −15 rep −10 sdm · Janji Manis: −10 kom −5 rep |
| Tawaran Investor Gelap | — | Tolak: +15 ling +10 kom −10 dana · Terima: +80 dana −35 ling −20 kom |
| Kerusakan Derek Utama | infrastruktur < 40 | Teknisi Ahli: −40 dana +20 infra · Staf Lokal: −10 dana +5 infra −15 sdm |
| Wartawan Investigasi | — | Sambut Terbuka: +20 rep +10 sdm ⚠️gratis · Sogok: −30 dana +10 rep −15 kom · Usir: −25 rep −10 kom |
| Peringatan Badai Besar | hari ≥ 10 | Hentikan Operasi: −40 dana +10 sdm +5 infra · Paksa Buka: +60 dana −30 infra −25 sdm −15 rep |
| Kontainer Mencurigakan | — | Lapor Polisi: +20 rep −15 dana +5 kom · Jual Diam-diam: +70 dana −35 rep −20 sdm |
| Wabah Demam Pekerja | sdm < 60 | Klinik & Liburkan: −45 dana +30 sdm +10 rep · Paksa Lembur: +20 dana −40 sdm −15 kom |
| Inspeksi Pusat | hari ≥ 15 | Sambut Transparan: +15 rep +10 sdm ⚠️gratis · Palsukan Dokumen: −10 dana +10 rep −25 sdm −15 ling · Suap Auditor: −60 dana +30 rep −20 kom |
| Tawaran Bantuan LSM | — | Terima Alat: +35 ling +15 infra −30 kom · Tolak: +25 kom +10 rep −15 ling |

(3 cards carry `eduFakta` educational blurbs shown in data; UI does not yet display them.)

### A8. Extracted data — 7 running scenarios (`ScenarioSystem.ts`)

Active when `hariMulai ≤ hari ≤ hariAkhir` AND condition holds (re-checked **every
day** — a scenario can drop out mid-window). Daily effects of all active scenarios are
summed and applied once at day-close **without** the leader multiplier.

| Skenario | Hari | Syarat (dicek harian) | Efek per hari |
|---|---|---|---|
| Musim Panen Ikan | 1–7 | — | +5 dana, +2 kom |
| Inspeksi Pemerintah | 8–12 | infra ≥ 40 | +3 rep |
| Badai Musiman | 10–14 | — | −8 dana, −3 infra, +4 ling |
| Tawaran Investasi Asing | 13–18 | rep ≥ 50 | +12 dana, −4 ling, −2 kom |
| Festival Laut Nusantara | 17–22 | kom ≥ 55 dan rep ≥ 45 | +10 dana, +5 rep, +4 kom |
| Pencemaran Limbah | 19–25 | ling ≤ 45 | −5 ling, −3 kom, −2 rep |
| Proyek Modernisasi | 24–30 | infra ≥ 50 dan dana ≥ 80 | +3 infra, +2 sdm, +2 rep |

### A9. Extracted data — ending thresholds & priority (`config.ts`, `ResourceSystem.ts`)

Evaluated at close of day 30, first match wins, in this order:

1. **Pelabuhan Emas** — dana ≥ 250 AND rep ≥ 70 AND ling ≥ 70 AND sdm ≥ 65 AND infra ≥ 65 AND kom ≥ 70
2. **Raja Bisnis** — dana ≥ 350 AND ling < 40 AND kom < 35
3. **Pejuang Hijau** — ling ≥ 80 AND dana < 100
4. **Bapak Rakyat** — kom ≥ 75 AND sdm ≥ 70 AND infra < 45
5. **Pelabuhan Terlupakan** — fallback (everything else)

Full narrative content for all 5 endings + game-over screen exists in `EndingScene.ts`
(`KONTEN_ENDING`: judul, subjudul, narasi, pesan moral, colors, icon) — port verbatim.

### A10. Extracted rules (engine behavior worth preserving exactly)

- Positive deltas: `round(delta × multiplier)`; negative deltas: applied in full.
- Values clamp to `[0, maks]` after every change.
- Facility action = pay costs in full (no multiplier), then add results (with
  multiplier); cooldown locks the facility.
- Cooldown ticking happens at day-close **before** scenario effects; a CD-2 action used
  on day N is available again on day N+2.
- Day-close order: tick cooldowns → summed scenario effects → game-over check →
  (day 30? → ending) → day+1 → recompute active scenarios → draw daily card.
- Card pool: not-yet-shown + condition-satisfied, uniform random.
- Game restart ("Coba Lagi") returns to leader select, full reset.
- No save/load, no audio, single-session runs. (Keep parity; Capacitor phase may add persistence later.)

### C. FLAGS (issues found during audit)

- **F1 — Leaders vs NPCs: not conflated, but NPCs are vaporware.** Leader ids
  (`bahari|citra|rendra`) and card-NPC ids (`hendra|sari|laut`) are separate types.
  However **no card sets `npc`**, the UI never renders an NPC, and no NPC art exists.
  Spec wants the trio as recurring faces. → content + art phase.
- **F2 — Rendra vs spec.** Spec: "memeras SDM, pekerja cepat lelah, risiko mogok".
  Prototype: sdm multiplier **1.3** (his SDM *gains* are amplified — the opposite
  flavor). Note multipliers cannot express "negative pressure" (negatives never scale).
  → deep-reasoner balance session; numbers preserved as-is until then.
- **F3 — Free-lunch violations** (spec: every action must trade something):
  `festival_ikan` (net +20 dana, +15 kom, +18 rep, nothing down), `lobi_mitra` (net
  +25 dana, +5 rep), Bahari's skill (no cost — arguably the spec's "kartu As", but the
  other two skills do have costs), card choices `berita_viral`/"Sambut Terbuka" and
  `audit_mendadak`/"Sambut Transparan" (+rep +sdm, zero cost). Borderline:
  `optimasi_gudang` (net-positive dana AND infra, only −5 sdm). → deep-reasoner/Codex.
- **F4 — Game-over timing.** Prototype checks only at day-close and after card
  resolution; a facility action or skill can leave an indicator ≤ threshold and play
  continues until "Akhiri Hari". Spec: **instant**, "tidak menunggu akhir hari".
  Vue design fixes this (spec override, §Step 2.4).
- **F5 — Content volume.** 9 cards for 29 card-days; pool exhausts by mid-game →
  card-less days. Spec wants a daily dilemma + 4-phase dramatic arc (hari 1–10 /
  11–20 / 21–29 / 30) + symbolic day-30 closing event. → content phase (target ±30 cards).
- **F6 — Day 1 has no card** (cards are drawn on day transition only). Plan follows
  the spec (card every day incl. day 1); flagged since it changes prototype feel.
- **F7 — World naming.** Prototype says "Harbor Simulation Nusantara" everywhere
  (menu subtitle, scenario/ending narratives, Bahari's bio, **baked into
  pilih-karakter.png art**). Spec: port = "Pelabuhan Muara Harapan". Recommendation:
  keep LABUHAN as the game title, adopt "Muara Harapan" in all text data; regenerating
  the baked select-screen art is optional/later.
- **F8 — Dead references.** `avatar-*.png` fields point to non-existent files (drop
  the field or leave null); `/vite.svg` favicon missing (replace with a real icon).
- **F9 — `berita_viral` conditional effect** is described in a comment ("if reputation
  high it rises further, if low it backfires") but implemented as static +20 rep.
  Recommendation: keep static, delete comment (conditional effects = new mechanic
  beyond spec).
- **F10 — Displayed vs applied numbers.** Popups/cards show base values while applied
  gains are multiplied. Vue plan: display leader-adjusted (effective) values.
- **F11 — Kenney pack ships in build.** Move `Models/`, `Previews/`, `Preview.png` out
  of `public/` → `art-source/` (keep `License.txt` with it).
- **F12 — "Cara Bermain" copy bug**: says "hindari resource menyentuh nol" but real
  thresholds are 10/10/10/5/10 and 0 only for Dana. Fix text in Vue.

### D. DECISIONS (go/no-go review, 2026-07-03)

Migration **approved as planned**. Per-flag rulings:

- **F6 — decided: yes, draw a card on day 1 too.** Follow the v3 spec's daily-dilemma
  loop, not the old prototype's quiet start. No further review needed on this point.
- **Kapal Kargo / 7 vs 6 facilities — decided: keep all 7.** Kargo stays a separate
  action set, not merged into the spec's 6 named locations — it's the main Dana
  engine (`bongkar_muat`) and merging would disturb tuned balance (see §A6).
- **F7 — decided.** Keep **"LABUHAN"** as the game title. Adopt **"Muara Harapan"**
  as the in-game port name across all text/data (menu subtitle, narratives, bios).
  Regenerating the baked `pilih-karakter.png` select-screen art is **deferred to a
  later task**, not part of this migration.
- **F1 (leaders vs NPCs) — decided: acknowledged, no action now.** The Hendra/Sari/
  Laut NPC trio remains unimplemented vaporware until a later content phase (art +
  card content), per §2.7.
- **F2 (Pak Rendra SDM contradiction) — decided: do not fix now.** Carry this into
  the deep-reasoner balance session (§2.7) as the **top reconciliation item**.
  Preserve the current multiplier numbers (§A5) unchanged until that session rules.

---

## STEP 2 — VUE 3 ARCHITECTURE (no component code yet)

### 2.0 Stack & repo prep (execution session M0)

- `git init` first — **the repo is not under version control** (needed for safety and
  for /code-review ultra later).
- Deps: `vue`, `pinia`, `@vitejs/plugin-vue`, `tailwindcss` + `@tailwindcss/vite`;
  remove `phaser`. Keep TypeScript strict, keep Vite.
- Move current `src/` → `legacy-phaser/src/` (reference during migration; delete only
  after parity sign-off). Move Kenney pack out of `public/` (F11). Game images stay at
  `public/assets/images/` (paths unchanged → zero asset churn).
- Comments in all new code: **Bahasa Indonesia**.

### 2.1 Folder structure

```
src/
├── assets/                  # ikon/font lokal bila perlu (gambar tetap di public/)
├── components/
│   ├── hud/    IndicatorPanel.vue, IndicatorBar.vue, DayCounter.vue,
│   │           SkillButton.vue, ScenarioBanner.vue
│   ├── map/    HarborMap.vue, FacilityHotspot.vue, DecorItem.vue,
│   │           PollutionOverlay.vue, FloatingTextLayer.vue
│   ├── modals/ FacilityActionMenu.vue, EventCardModal.vue, HowToPlayModal.vue
│   └── ui/     BaseButton.vue          # satu tombol generik saja
├── composables/
│   ├── useImagePreload.ts   # preload 14 gambar → % progres untuk splash
│   └── useStageScale.ts     # panggung 1200×900 di-scale ke viewport (ganti Phaser Scale.FIT)
├── data/
│   ├── config.ts            # nilai awal/maks/kritis — angka §A4 persis
│   ├── leaders.ts           # 3 pemimpin (§A5)
│   ├── skills.ts            # 3 skill (§A5)
│   ├── facilities.ts        # 7 fasilitas + aksi + koordinat (§A6) + dekorasi
│   ├── events.ts            # 9 kartu (§A7)
│   ├── scenarios.ts         # 7 skenario (§A8)
│   └── endings.ts           # threshold + konten naratif + pesan game over (§A9)
│                            # + fungsi murni: cekKritis(), evaluasiEnding()
├── stores/
│   └── gameStore.ts         # useGameStore — satu-satunya pemilik state game
├── types/
│   └── index.ts
├── views/
│   ├── MenuView.vue         # ← MenuScene
│   ├── LeaderSelectView.vue # ← CharacterSelectScene
│   ├── GameView.vue         # ← GameScene
│   └── EndingView.vue       # ← EndingScene
├── App.vue                  # splash preload (← BootScene) + v-if per fase
├── main.ts                  # createApp + Pinia + import CSS Tailwind
└── style.css                # @import tailwind + palet warna lama sbg @theme tokens
```

No vue-router (4 screens, linear flow) — screen switching via `fase` in the store.
Palette from `COLORS` (§A4) becomes Tailwind theme tokens with the same names.
Map hotspots keep the tuned 1200×900 coordinates verbatim via the stage-scale wrapper.

### 2.2 TypeScript interfaces (`src/types/index.ts`)

```ts
// 6 indikator — angka awal/maks/kritis persis prototipe (lihat data/config.ts)
export interface Indicators {
  dana: number;           // 0–500 (juta Rp), kritis ≤ 0
  reputasi: number;       // 0–100, kritis ≤ 10
  lingkungan: number;     // 0–100, kritis ≤ 10
  sdm: number;            // 0–100, kritis ≤ 10
  infrastruktur: number;  // 0–100, kritis ≤ 5
  komunitas: number;      // 0–100, kritis ≤ 10
}

export type LeaderId = 'bahari' | 'citra' | 'rendra';
export type NpcId    = 'hendra' | 'sari' | 'laut';   // NPC kartu — BUKAN pemimpin (F1)

export interface Leader {
  id: LeaderId;
  nama: string;             // "Pak Bahari" dst.
  jabatan: string;
  deskripsi: string;
  keahlian: string;
  multiplier: Record<keyof Indicators, number>; // hanya efek POSITIF yang dikali
  skillId: string;
  warna: string;            // token warna Tailwind (dari palet lama)
}

export interface Skill {
  id: string;
  nama: string;
  deskripsi: string;
  cooldownHari: number;
  efek: Partial<Indicators>;
  syarat?: Partial<Indicators>;    // minimum indikator agar bisa dipakai
}

export type FacilityType =
  | 'dermaga' | 'gudang' | 'kantor' | 'tambak' | 'kapal' | 'pasar'
  | 'kargo';  // fasilitas ke-7 dari prototipe — dipertahankan (lihat §A6)

export interface FacilityAction {
  id: string;
  label: string;
  deskripsi: string;
  biaya: Partial<Indicators>;      // dibayar penuh, tanpa multiplier
  hasil: Partial<Indicators>;      // bagian positif dikali multiplier pemimpin
  cooldownHari?: number;           // cooldown SATU FASILITAS (bukan per aksi)
}

export interface Facility {
  id: string;
  tipe: FacilityType;
  nama: string;
  deskripsi: string;
  x: number; y: number; lebar: number; tinggi: number;  // koordinat panggung 1200×900
  flipX?: boolean; rotasi?: number;
  gambar: string;                  // path /assets/images/…
  aksi: FacilityAction[];
}

export interface CardChoice {
  label: string;
  deskripsi: string;
  efek: Partial<Indicators>;
  eduFakta?: string;               // ditampilkan setelah memilih (belum ada di UI lama)
}

export interface EventCard {
  id: string;
  judul: string;
  deskripsi: string;
  npc?: NpcId | null;
  pilihan: CardChoice[];           // 2–3 pilihan
  syarat?: (i: Indicators, hari: number) => boolean;
  skenarioId?: string;             // kartu milik skenario tertentu (opsional)
}

export interface RunningScenario {
  id: string;
  judul: string;
  deskripsi: string;
  hariMulai: number;
  hariAkhir: number;               // 0 = sampai game selesai
  syarat?: (i: Indicators, hari: number) => boolean;  // dicek ulang tiap hari
  efekPerHari?: Partial<Indicators>;                  // TANPA multiplier
  kartuIds?: string[];
}

export type EndingId =
  | 'pelabuhan_emas' | 'raja_bisnis' | 'pejuang_hijau'
  | 'bapak_rakyat' | 'pelabuhan_terlupakan';

export type GamePhase = 'menu' | 'pilih-pemimpin' | 'main' | 'ending';

export interface GameOverInfo {
  indikator: keyof Indicators;
  judul: string;
  deskripsi: string;
  hari: number;
}

export interface DayLog {
  hari: number;
  kartuId?: string;
  pilihanIndex?: number;
  aksiId?: string;
  skillDipakai?: boolean;
  sebelum: Indicators;
  sesudah: Indicators;
}

export interface GameState {
  fase: GamePhase;
  hari: number;                    // 1–30
  indicators: Indicators;
  leaderId: LeaderId | null;
  skillCooldownSisa: number;       // 0 = siap
  facilityCooldowns: Record<string, number>;  // facilityId → sisa hari
  kartuAktif: EventCard | null;    // modal dilema yang sedang terbuka
  kartuSelesaiIds: string[];       // kartu sekali-per-run
  skenarioAktifIds: string[];
  logHarian: DayLog[];
  gameOver: GameOverInfo | null;
  endingId: EndingId | null;
}
```

Rename map vs prototype: `Resources→Indicators`, `Karakter→Leader`,
`ObjekPeta→Facility`, `KartuKejadian→EventCard`, `Skenario→RunningScenario`,
`LogHarian→DayLog`. Field names stay Indonesian so the data files port by copy-paste.

### 2.3 Pinia store (`useGameStore`) — shape

**State:** exactly `GameState` above.

**Getters** (names indicative):
- `leader`, `skill` — resolved objects from data by id.
- `skenarioAktif: RunningScenario[]` — resolved from ids.
- `persen(key)` — value/max for bars; `hampirKritis(key)` — <20% warning (bar merah).
- `alasanSkillTerkunci: string | null` — cooldown / syarat message (null = ready).
- `bisaBayar(biaya): boolean` — every cost key affordable.
- `efekEfektif(efek): Partial<Indicators>` — leader-adjusted preview for UI (F10).
- `sisaCooldownFasilitas(id): number`.

**Actions:**
- `keMenu()`, `mulaiPilihPemimpin()`, `mulaiPermainan(leaderId)` — reset state, set
  fase `'main'`, hari 1, activate scenarios, **draw day-1 card** (spec, F6).
- `jalankanAksi(facilityId, aksiId)` — guard (cooldown, biaya); build **one atomic net
  effect** = (−biaya penuh) + (hasil, positif × multiplier); apply via `_terapkan`;
  set facility cooldown; log; floating feedback.
- `gunakanSkill()` — guard via `alasanSkillTerkunci`; apply efek (× multiplier on
  positives); set `skillCooldownSisa`; log.
- `pilihKartu(index)` — apply choice efek (× multiplier on positives); mark card done;
  close modal; log.
- `akhiriHari()` — port of prototype order (§A10), with instant-check integration:
  1. guard: kartuAktif harus null;
  2. tick skill + facility cooldowns;
  3. sum active-scenario effects → apply once via `_terapkan` (no multiplier);
  4. if game over → stop (fase `'ending'`);
  5. if hari === 30 → `endingId = evaluasiEnding(indicators)`, fase `'ending'`;
  6. else hari++; recompute `skenarioAktifIds` (windows + syarat);
  7. draw daily card (random from unused + syarat-satisfied) → `kartuAktif`.
- `_terapkan(efek, pakaiMultiplier)` — **private single mutation path**: per key,
  round/scale positives if multiplied, add, clamp to [0, maks]; afterwards run
  `cekKritis()`; if tripped → set `gameOver` (+ hari), fase `'ending'`. Every mutation
  in the game goes through this one function — that is what makes the spec's
  instant-fail guarantee hold everywhere (F4).

RNG: replace `Phaser.Math.Between` with a tiny `acakInt(min,max)` util (same
distribution). Scenario effects stay **aggregated-then-applied-once** (prototype
parity — avoids order-dependent mid-sum deaths when a drain and a gain overlap).
Atomic net application per action also prevents false "transient zero" deaths (pay-30
then gain-50 is one net step, matching prototype outcomes; the only behavior change vs
prototype is the earlier check timing, which the spec mandates).

### 2.4 Critical-threshold & ending design

```ts
// data/endings.ts — fungsi murni, gampang diuji
export function cekKritis(i: Indicators): (keyof Indicators) | null {
  // urutan tetap: dana, reputasi, lingkungan, sdm, infrastruktur, komunitas
  // kembalikan indikator pertama yang ≤ batas kritisnya (§A4), else null
}

export function evaluasiEnding(i: Indicators): EndingId {
  // prioritas persis prototipe (§A9):
  // emas → raja_bisnis → pejuang_hijau → bapak_rakyat → pelabuhan_terlupakan
}
```

- `cekKritis` runs inside `_terapkan` after **every** clamp — facility actions, skills,
  card choices, scenario ticks. First tripped indicator picks the failure narrative
  (`PESAN_GAME_OVER` verbatim) and records the day. EndingView renders either a failure
  screen (game over) or one of the 5 titles with the final 6-bar summary, exactly like
  `EndingScene`.
- Day-30 sequence preserved: day-30 scenario effects land **before** evaluation, and a
  critical hit on day 30 is still a failure, not an ending.

### 2.5 Scene → Vue mapping

| Phaser | Vue | Notes |
|---|---|---|
| BootScene | App.vue splash + `useImagePreload` | same LABUHAN anchor + progress bar look |
| MenuScene | MenuView + HowToPlayModal | buttons already Tailwind-styled by design; fix F12 copy |
| CharacterSelectScene | LeaderSelectView | bg image + 3 absolutely-positioned hotspots (tuned rects 330×495 at x 71/435/799, y≈266/274/261) + colored border highlight + start button |
| GameScene | GameView (HarborMap, IndicatorPanel, DayCounter, ScenarioBanner, SkillButton, FacilityActionMenu, EventCardModal, PollutionOverlay, FloatingTextLayer) | ripples → CSS keyframes; pollution overlay → div `mix-blend-mode: multiply`, opacity formula §A3; drag-to-position dev mode **dropped** (reason: CSS positioning + devtools replace it) |
| EndingScene | EndingView | 5+1 content records ported verbatim |
| Dashboard / PopupMenu / EventCard (classes) | hud/modals components | logic moves to store; components stay dumb |
| ResourceSystem / SkillSystem / ScenarioSystem | gameStore + data/endings.ts | pure rules, ported 1:1 |

### 2.6 Intentional changes vs prototype (each with reason)

1. Instant critical check on every mutation — **spec override** (F4).
2. Daily card drawn on day 1 too — **spec core loop** (F6; reviewer may veto).
3. Port name "Muara Harapan" in text data — **spec naming** (F7; art regen optional).
4. UI shows leader-adjusted effect values — fixes display/applied mismatch (F10).
5. `eduFakta` shown after choosing (small toast/panel) — data exists, spec's edu goal;
   zero new data required.
6. Boot drag-design mode, dead `avatar` field, dead favicon ref — dropped/fixed (F8).
7. Kenney pack out of `public/` (F11). Everything else — every number in §A4–A9 —
   ports unchanged.

### 2.7 Open items routed onward (NOT for the build sessions)

- deep-reasoner (Opus): **F2 Rendra/SDM reconciliation is the top item, per §D
  approval decision** (numbers preserved as-is until this session); then F3
  free-lunch actions; snowball
  risk of positive scenario drips (musim_panen + festival_laut + modernisasi_akhir +
  festival_ikan + lobi_mitra all net-positive); ending reachability tuning (emas needs
  dana ≥ 250 AND five ≥ 65–70 bars; raja_bisnis needs kom < 35 which is hard to reach
  *downward* from 55 without deliberate self-harm); pacing of the 4-phase dramatic arc.
- Content phase (with fast-worker): card pool 9 → ±30 with day-phase gating, NPC trio
  on cards (F1), morning announcements, symbolic day-30 closing card.
- Codex adversarial review: exploit loops after balance lock.

### 2.8 Execution milestones for the Sonnet driver (after approval)

1. **M0** — git init; deps swap (Vue/Pinia/Tailwind in, Phaser out); move `src/` →
   `legacy-phaser/`; relocate Kenney pack; fresh scaffold (`index.html`, `main.ts`,
   `App.vue`, Tailwind theme with §A4 palette).
2. **M1** — `types/` + all `data/` files ported (copy numbers, rename types; Bahasa
   comments). Gate: numbers diff-checked against legacy files.
3. **M2** — `gameStore` + `endings.ts` rules + `useStageScale`/`useImagePreload`.
   Gate: a scripted 30-day simulation in the store reproduces prototype outcomes
   (same seed decisions → same end values, modulo the instant-check change).
4. **M3** — views/components per §2.5, visual parity with the art.
5. **M4** — QA pass against §2.6 list + F-flags; then balance/content sessions.

**Plan approved 2026-07-03 (§D). Nothing below `docs/` and memory notes was created;
no Vue code has been written. Before execution begins: `git init` + an initial commit
of the current Phaser prototype as a rollback point (done as part of this approval —
see repo history). Execution (Phase 1 / M0 onward) continues in a future Sonnet-driven
session, delegating to deep-reasoner and fast-worker as designed in §2.7–2.8.**
