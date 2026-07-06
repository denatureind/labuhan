/** Enam indikator pelabuhan — inti seluruh permainan. */
export type StatKey =
  | 'dana'
  | 'reputasi'
  | 'lingkungan'
  | 'sdm'
  | 'infrastruktur'
  | 'komunitas';

export const STAT_KEYS: StatKey[] = [
  'dana',
  'reputasi',
  'lingkungan',
  'sdm',
  'infrastruktur',
  'komunitas',
];

export interface StatMeta {
  key: StatKey;
  label: string;
  icon: string;
  desc: string;
  /** Narasi kegagalan bila indikator ini menyentuh 0. */
  failTitle: string;
  failText: string;
}

/** Perubahan nilai indikator, mis. { dana: +8, lingkungan: -5 } */
export type Effects = Partial<Record<StatKey, number>>;

export type NpcId =
  | 'pak-hendra'
  | 'mbok-sari'
  | 'dr-laut'
  | 'petugas'
  | 'warga'
  | 'narator';

export interface Npc {
  id: NpcId;
  name: string;
  role: string;
  /** Warna aksen kartu dialognya. */
  color: string;
  icon: string;
}

export interface CharacterDef {
  id: 'bahari' | 'citra' | 'rendra';
  name: string;
  title: string;
  desc: string;
  /** Gaya bermain, ditampilkan di kartu pilihan. */
  playstyle: string;
  startStats: Record<StatKey, number>;
  /** Efek pasif tiap pagi — kepribadian yang terus bekerja. */
  trait: { label: string; effects: Effects };
  ability: {
    name: string;
    icon: string;
    desc: string;
    effects: Effects;
    cooldown: number; // hari
  };
  /** Posisi crop potret pada pilih-karakter.png (persen). */
  portrait: { x: number; y: number; w: number; h: number };
}

export interface FacilityAction {
  id: string;
  name: string;
  icon: string;
  desc: string;
  /** Dana yang dibelanjakan (memblokir aksi bila dana tidak cukup + buffer). */
  cost?: number;
  effects: Effects;
  /** 0 = bisa tiap hari (sekali per hari); N = jeda N hari setelah dipakai. */
  cooldown: number;
  /** Aksi sekali pakai sepanjang permainan (pembangunan besar). */
  once?: boolean;
  /** Setelah dipakai, memberi efek pasif harian lewat flag ini. */
  grantsPassive?: PassiveId;
}

export type PassiveId = 'ipal' | 'panel-surya' | 'koperasi';

export interface FacilityDef {
  id: 'dermaga' | 'gudang' | 'kantor' | 'tambak' | 'kapal' | 'pasar';
  name: string;
  icon: string;
  tagline: string;
  sprite: string;
  /** Penempatan di peta (persen terhadap ukuran peta). */
  pos: { x: number; y: number; w: number };
  actions: FacilityAction[];
}

export interface Scenario {
  id: string;
  name: string;
  icon: string;
  /** Efek otomatis tiap pagi selama aktif. */
  dailyEffects: Effects;
  duration: number;
  announce: string;
  endText: string;
  /** Nada visual: badai memicu overlay hujan, dsb. */
  mood: 'good' | 'bad' | 'neutral' | 'storm';
}

export interface Choice {
  label: string;
  /** Petunjuk arah dampak, mis. ['dana+', 'lingkungan-'] — jujur tapi tanpa angka. */
  hints: string[];
  /** Dana yang dibelanjakan; pilihan terkunci bila dana tidak cukup. */
  cost?: number;
  effects: Effects;
  outcome: string;
  setFlag?: string;
  startScenario?: string;
}

export interface EventCard {
  id: string;
  title: string;
  speaker: NpcId;
  text: string;
  choices: Choice[];
  /** 1 = hari 2–10, 2 = hari 11–20, 3 = hari 21–29. */
  phase: 1 | 2 | 3;
  /** Kejadian terjadwal pada hari tertentu (di luar undian). */
  day?: number;
  /** Hanya muncul bila flag ini sudah di-set (kejadian lanjutan). */
  requiresFlag?: string;
}

export interface EndingDef {
  id: 'emas' | 'bisnis' | 'hijau' | 'rakyat' | 'terlupakan';
  title: string;
  icon: string;
  narration: string;
}

export interface ActiveScenario {
  id: string;
  daysLeft: number;
}

export type DayPhase = 'morning' | 'event' | 'manage' | 'summary';

export interface MorningItem {
  icon: string;
  label: string;
  effects: Effects;
}

export interface DayRecord {
  day: number;
  stats: Record<StatKey, number>;
}

export interface GameState {
  day: number; // 1..30
  phase: DayPhase;
  characterId: CharacterDef['id'];
  stats: Record<StatKey, number>;
  /** Jam kerja tersisa hari ini (aksi fasilitas). */
  slots: number;
  /** actionId -> hari tersisa sebelum bisa dipakai lagi. */
  cooldowns: Record<string, number>;
  usedOnce: string[];
  passives: PassiveId[];
  abilityCooldown: number;
  activeScenarios: ActiveScenario[];
  /** Skenario yang sudah pernah terjadi (untuk jadwal). */
  firedScenarios: string[];
  usedEvents: string[];
  currentEventId: string | null;
  flags: Record<string, boolean>;
  history: DayRecord[];
  /** Laporan pagi hari ini (trait + skenario + pasif). */
  morningReport: MorningItem[];
  /** Terisi bila permainan berakhir. */
  over:
    | { kind: 'fail'; stat: StatKey }
    | { kind: 'ending'; endingId: EndingDef['id'] }
    | null;
  seed: number;
  actionsToday: number;
  totalActions: number;
}

/** Satu titik pada jalur kendaraan/kapal — persen posisi di atas panggung peta. */
export interface TrafficPoint {
  x: number;
  y: number;
  /** Jeda diam tambahan (ms) di titik ini, mis. kapal bongkar-muat di dermaga. */
  pauseMs?: number;
  /** Mulai segmen SETELAH titik ini, sprite dibalik horizontal (putar haluan). */
  flipAfter?: boolean;
  /** Sudut putar (derajat) saat tiba di titik ini; berangsur dari sudut titik sebelumnya. */
  rotateDeg?: number;
}

/** Satu kendaraan/kapal yang bergerak sendiri di peta (dekorasi ambient). */
export interface TrafficVehicle {
  id: string;
  sprite: string;
  /** Lebar sprite, persen terhadap lebar panggung. */
  width: number;
  /** Total durasi satu putaran penuh (ms), termasuk waktu ia tak terlihat. */
  cycleMs: number;
  /** Berapa lama (ms) dari cycleMs ia benar-benar terlihat berjalan. */
  driveMs: number;
  /** Offset awal (ms, biasanya negatif) agar kendaraan tidak muncul serentak. */
  delayMs: number;
  /** Efek naik-turun halus (dipakai kapal mengambang). */
  bob?: boolean;
  /** false = tidak dirender/dianimasikan sama sekali. Default true bila kosong. */
  enabled?: boolean;
  /** Titik-titik jalur, berurutan. Minimal 2. */
  points: TrafficPoint[];
}

/** Aset hias statis di peta (bangunan tambahan, orang, properti) — tidak
 * bergerak, tidak bisa diklik, cuma variasi visual. */
export interface DecorItem {
  id: string;
  sprite: string;
  /** Posisi & lebar, persen terhadap panggung — sama seperti fasilitas. */
  x: number;
  y: number;
  w: number;
  rotateDeg?: number;
}

export const SLOTS_PER_DAY = 3;
export const TOTAL_DAYS = 30;
/** Di bawah ini, bar menyala merah dan peringatan muncul. */
export const DANGER_ZONE = 20;
