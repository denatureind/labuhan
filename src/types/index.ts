// ============================================================
// PELABUHAN HIJAU v3 — Type Definitions
// ============================================================

// ------------------------------------------------------------
// 6 RESOURCE UTAMA
// ------------------------------------------------------------

export interface Resources {
  dana: number;           // 0–500  (juta Rp) — modal operasional
  reputasi: number;       // 0–100  — kepercayaan publik & mitra
  lingkungan: number;     // 0–100  — kesehatan ekosistem laut
  sdm: number;            // 0–100  — kualitas & loyalitas karyawan
  infrastruktur: number;  // 0–100  — kondisi fasilitas pelabuhan
  komunitas: number;      // 0–100  — hubungan dengan nelayan & warga
}

// ------------------------------------------------------------
// KARAKTER (dipilih saat CharacterSelectScene)
// ------------------------------------------------------------

export type KarakterId = 'bahari' | 'citra' | 'rendra';

export interface KarakterMultiplier {
  dana: number;
  reputasi: number;
  lingkungan: number;
  sdm: number;
  infrastruktur: number;
  komunitas: number;
}

export interface Karakter {
  id: KarakterId;
  nama: string;
  jabatan: string;
  deskripsi: string;
  keahlian: string;          // keahlian utama yang ditampilkan di UI
  multiplier: KarakterMultiplier;  // pengali efek per resource (1.0 = normal)
  skillId: string;           // skill aktif bawaan karakter
  warna: number;             // warna hex untuk UI karakter
  avatar: string;            // nama file gambar di public/assets/images/
}

// ------------------------------------------------------------
// SKILL AKTIF
// ------------------------------------------------------------

export interface Skill {
  id: string;
  nama: string;
  deskripsi: string;
  cooldownHari: number;        // berapa hari setelah dipakai bisa aktif lagi
  effect: Partial<Resources>;  // efek langsung saat skill diaktifkan
  syarat?: Partial<Resources>; // resource minimum agar skill bisa dipakai
}

export interface SkillState {
  skillId: string;
  cooldownSisa: number;        // sisa hari cooldown (0 = siap dipakai)
}

// ------------------------------------------------------------
// KARTU KEJADIAN
// ------------------------------------------------------------

export interface PilihanKartu {
  label: string;
  deskripsi: string;
  efek: Partial<Resources>;
  eduFakta?: string;           // fakta edukatif yang muncul setelah pilih
}

export interface KartuKejadian {
  id: string;
  judul: string;
  deskripsi: string;
  npc?: 'hendra' | 'sari' | 'laut' | null;
  pilihan: [PilihanKartu, PilihanKartu, PilihanKartu?];
  syarat?: (resources: Resources, hari: number) => boolean;
  skenarioId?: string;         // kartu milik skenario tertentu (opsional)
}

// ------------------------------------------------------------
// OBJEK INTERAKTIF DI PETA
// ------------------------------------------------------------

export type ObjekTipe =
  | 'dermaga'
  | 'gudang'
  | 'kantor'
  | 'tambak'
  | 'kapal'
  | 'pasar'
  | 'kargo';

export interface ObjekPeta {
  id: string;
  tipe: ObjekTipe;
  nama: string;
  deskripsi: string;
  x: number;
  y: number;
  lebar: number;
  tinggi: number;
  flipX?: boolean;            // membalik gambar secara horizontal (kiri-kanan)
  rotasi?: number;            // memutar gambar sekian derajat (contoh: 15 atau -30)
  aksi: AksiObjek[];          // daftar aksi yang bisa dilakukan di objek ini
}

export interface DekorasiPeta {
  id: string;
  gambar: string;             // nama key gambar yang dimuat di BootScene (contoh: 'img-mobil')
  x: number;
  y: number;
  lebar: number;
  tinggi: number;
  flipX?: boolean;            // membalik gambar (opsional)
  rotasi?: number;            // memutar gambar (opsional)
}

export interface AksiObjek {
  id: string;
  label: string;
  deskripsi: string;
  biaya: Partial<Resources>;   // resource yang dibutuhkan
  hasil: Partial<Resources>;   // resource yang didapat
  cooldownHari?: number;
}

// ------------------------------------------------------------
// SKENARIO
// ------------------------------------------------------------

export interface Skenario {
  id: string;
  judul: string;
  deskripsi: string;
  hariMulai: number;           // hari skenario mulai aktif
  hariAkhir: number;           // hari skenario berakhir (0 = sampai selesai)
  syarat?: (resources: Resources, hari: number) => boolean;
  efekPerHari?: Partial<Resources>;  // efek pasif selama skenario aktif
  kartuIds?: string[];          // kartu khusus yang di-unlock skenario ini
}

// ------------------------------------------------------------
// GAME STATE
// ------------------------------------------------------------

export interface GameState {
  hari: number;                 // 1–30
  resources: Resources;
  karakterId: KarakterId;
  skillState: SkillState;
  skenarioAktifIds: string[];
  logHarian: LogHarian[];
  objekCooldown: Record<string, number>;  // objekId → sisa hari cooldown
}

export interface LogHarian {
  hari: number;
  kartuId?: string;
  pilihanIndex?: number;
  aksiObjekId?: string;
  skillDipakai?: boolean;
  sebelum: Resources;
  sesudah: Resources;
}

// ------------------------------------------------------------
// ENDING
// ------------------------------------------------------------

export type EndingId =
  | 'pelabuhan_emas'      // semua resource tinggi
  | 'raja_bisnis'         // dana sangat tinggi, lingkungan/komunitas rendah
  | 'pejuang_hijau'       // lingkungan tinggi, dana rendah
  | 'bapak_rakyat'        // komunitas & sdm tinggi, infrastruktur rendah
  | 'pelabuhan_terlupakan'; // semua resource rendah

export interface EndingData {
  id: EndingId;
  judul: string;
  deskripsi: string;
  warna: number;
  syarat: (resources: Resources) => boolean;
  prioritas: number;  // semakin rendah angka = semakin diprioritaskan jika overlap
}

// ------------------------------------------------------------
// UI HELPERS
// ------------------------------------------------------------

export interface ResourceBarConfig {
  resourceKey: keyof Resources;
  label: string;
  ikon: string;           // emoji atau karakter unicode
  warnaBar: number;
  maks: number;           // nilai maksimum (dana=500, sisanya=100)
}
