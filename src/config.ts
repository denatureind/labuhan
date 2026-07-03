// ============================================================
// PELABUHAN HIJAU v3 — Game Configuration
// ============================================================

import type { Resources, ResourceBarConfig, KarakterMultiplier } from './types/index';

// ------------------------------------------------------------
// DIMENSI & DURASI
// ------------------------------------------------------------

export const GAME_CONFIG = {
  width: 1200,
  height: 900,
  totalHari: 30,

  // Nilai awal semua resource
  resourceAwal: {
    dana: 150,
    reputasi: 50,
    lingkungan: 60,
    sdm: 50,
    infrastruktur: 50,
    komunitas: 55,
  } satisfies Resources,

  // Nilai maksimum per resource
  resourceMaks: {
    dana: 500,
    reputasi: 100,
    lingkungan: 100,
    sdm: 100,
    infrastruktur: 100,
    komunitas: 100,
  } satisfies Resources,

  // Batas game over (jika salah satu resource mencapai nilai ini)
  batasGameOver: {
    dana: 0,
    reputasi: 10,
    lingkungan: 10,
    sdm: 10,
    infrastruktur: 5,
    komunitas: 10,
  } satisfies Resources,
};

// ------------------------------------------------------------
// THRESHOLD ENDING
// Dievaluasi dari prioritas tertinggi (angka terkecil) ke bawah
// ------------------------------------------------------------

export const ENDING_THRESHOLD = {
  // Pelabuhan Emas — semua resource tinggi
  pelabuhan_emas: {
    dana: 250,
    reputasi: 70,
    lingkungan: 70,
    sdm: 65,
    infrastruktur: 65,
    komunitas: 70,
  } satisfies Partial<Resources>,

  // Raja Bisnis — dana sangat tinggi tapi lingkungan & komunitas rendah
  raja_bisnis: {
    dana: 350,
    lingkungan: 40,  // harus DI BAWAH ini
    komunitas: 35,   // harus DI BAWAH ini
  },

  // Pejuang Hijau — lingkungan tinggi tapi dana rendah
  pejuang_hijau: {
    lingkungan: 80,
    dana: 100,       // harus DI BAWAH ini
  },

  // Bapak Rakyat — komunitas & sdm tinggi
  bapak_rakyat: {
    komunitas: 75,
    sdm: 70,
    infrastruktur: 45, // harus DI BAWAH ini
  },

  // Pelabuhan Terlupakan — fallback jika tidak memenuhi ending lain
  pelabuhan_terlupakan: {},
};

// ------------------------------------------------------------
// MULTIPLIER KARAKTER
// 1.0 = efek normal, 1.3 = +30% dari efek kartu/aksi
// Multiplier hanya berlaku untuk efek POSITIF (bonus karakter)
// Efek negatif tetap full tanpa pengurangan
// ------------------------------------------------------------

export const MULTIPLIER_KARAKTER: Record<string, KarakterMultiplier> = {
  // Bahari — nelayan berpengalaman, kuat di lingkungan & komunitas
  bahari: {
    dana: 0.9,
    reputasi: 1.1,
    lingkungan: 1.4,
    sdm: 1.0,
    infrastruktur: 0.9,
    komunitas: 1.3,
  },

  // Citra — manajer muda, kuat di reputasi & infrastruktur
  citra: {
    dana: 1.2,
    reputasi: 1.4,
    lingkungan: 0.9,
    sdm: 1.1,
    infrastruktur: 1.3,
    komunitas: 0.9,
  },

  // Rendra — pengusaha, kuat di dana & sdm
  rendra: {
    dana: 1.4,
    reputasi: 1.0,
    lingkungan: 0.8,
    sdm: 1.3,
    infrastruktur: 1.1,
    komunitas: 0.9,
  },
};

// ------------------------------------------------------------
// WARNA (hex number untuk Phaser graphics)
// Harus dideklarasikan sebelum RESOURCE_BAR_CONFIG
// ------------------------------------------------------------

export const COLORS = {
  // Biru laut
  navy:       0x0D47A1,
  biru:       0x0077B6,
  teal:       0x00B4D8,

  // Hijau alam
  hijau:      0x52B788,
  hijauTua:   0x1B4332,

  // Aksen
  kuning:     0xF9C74F,
  oranye:     0xF4A261,
  merah:      0xE63946,
  ungu:       0x9B5DE5,
  abu:        0x8D99AE,

  // Netral
  putih:      0xFFFFFF,
  hitam:      0x1A1A2E,
  gelapMuda:  0x2B2D42,
  panelBg:    0x16213E,
};

// Versi string (#hex) untuk Phaser Text style
export const TEXT_COLORS = {
  navy:       '#0D47A1',
  biru:       '#0077B6',
  teal:       '#00B4D8',
  hijau:      '#52B788',
  hijauTua:   '#1B4332',
  kuning:     '#F9C74F',
  oranye:     '#F4A261',
  merah:      '#E63946',
  ungu:       '#9B5DE5',
  abu:        '#8D99AE',
  putih:      '#FFFFFF',
  hitam:      '#1A1A2E',
  gelapMuda:  '#2B2D42',
  panelBg:    '#16213E',
};

// ------------------------------------------------------------
// KONFIGURASI 6 RESOURCE BAR (untuk Dashboard)
// ------------------------------------------------------------

export const RESOURCE_BAR_CONFIG: ResourceBarConfig[] = [
  {
    resourceKey: 'dana',
    label: 'Dana',
    ikon: '💰',
    warnaBar: COLORS.kuning,
    maks: 500,
  },
  {
    resourceKey: 'reputasi',
    label: 'Reputasi',
    ikon: '⭐',
    warnaBar: COLORS.oranye,
    maks: 100,
  },
  {
    resourceKey: 'lingkungan',
    label: 'Lingkungan',
    ikon: '🌊',
    warnaBar: COLORS.teal,
    maks: 100,
  },
  {
    resourceKey: 'sdm',
    label: 'SDM',
    ikon: '👷',
    warnaBar: COLORS.hijau,
    maks: 100,
  },
  {
    resourceKey: 'infrastruktur',
    label: 'Infrastruktur',
    ikon: '🏗️',
    warnaBar: COLORS.abu,
    maks: 100,
  },
  {
    resourceKey: 'komunitas',
    label: 'Komunitas',
    ikon: '🤝',
    warnaBar: COLORS.ungu,
    maks: 100,
  },
];

// ------------------------------------------------------------
// PESAN GAME OVER (per resource yang habis)
// ------------------------------------------------------------

export const PESAN_GAME_OVER: Record<string, { judul: string; deskripsi: string }> = {
  dana: {
    judul: 'Pelabuhan Bangkrut!',
    deskripsi: 'Dana operasional habis. Pelabuhan tidak bisa beroperasi lagi.',
  },
  reputasi: {
    judul: 'Kepercayaan Hancur!',
    deskripsi: 'Reputasi pelabuhan jatuh ke titik terendah. Semua mitra kabur.',
  },
  lingkungan: {
    judul: 'Bencana Ekologi!',
    deskripsi: 'Ekosistem laut rusak parah. Pemerintah menutup pelabuhan.',
  },
  sdm: {
    judul: 'Krisis Tenaga Kerja!',
    deskripsi: 'Semua karyawan mengundurkan diri. Pelabuhan tidak bisa dioperasikan.',
  },
  infrastruktur: {
    judul: 'Fasilitas Ambruk!',
    deskripsi: 'Infrastruktur pelabuhan rusak total dan dinyatakan tidak layak operasi.',
  },
  komunitas: {
    judul: 'Pemberontakan Nelayan!',
    deskripsi: 'Nelayan dan warga sekitar memblokir pelabuhan karena merasa dirugikan.',
  },
};
