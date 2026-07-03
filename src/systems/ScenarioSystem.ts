// ============================================================
// PELABUHAN HIJAU v3 — ScenarioSystem
// Mengelola 7 skenario: aktivasi, efek pasif, dan kartu khusus
// ============================================================

import type { Skenario, Resources } from '../types/index';

// ----------------------------------------------------------
// DATA 7 SKENARIO
// ----------------------------------------------------------

const DAFTAR_SKENARIO: Skenario[] = [
  // 1. Musim Panen Ikan — awal game, semua pemain kena
  {
    id: 'musim_panen',
    judul: 'Musim Panen Ikan',
    deskripsi:
      'Ikan berlimpah di perairan Harbor Simulation Nusantara. Nelayan bergembira, ' +
      'tapi pelabuhan harus siap menampung lonjakan hasil tangkapan.',
    hariMulai: 1,
    hariAkhir: 7,
    efekPerHari: { dana: 5, komunitas: 2 },
  },

  // 2. Inspeksi Pemerintah — pertengahan game
  {
    id: 'inspeksi_pemerintah',
    judul: 'Inspeksi Pemerintah',
    deskripsi:
      'Tim inspeksi dinas maritim datang mengevaluasi kondisi pelabuhan. ' +
      'Infrastruktur dan kepatuhan lingkungan jadi sorotan utama.',
    hariMulai: 8,
    hariAkhir: 12,
    efekPerHari: { reputasi: 3 },
    syarat: (r) => r.infrastruktur >= 40,
  },

  // 3. Badai Musiman — cuaca buruk
  {
    id: 'badai_musiman',
    judul: 'Badai Musiman',
    deskripsi:
      'Badai melanda perairan selama beberapa hari. Aktivitas melambat ' +
      'dan infrastruktur berisiko rusak jika tidak dijaga.',
    hariMulai: 10,
    hariAkhir: 14,
    efekPerHari: { dana: -8, infrastruktur: -3, lingkungan: 4 },
  },

  // 4. Investasi Asing — tawaran menggiurkan tapi berisiko
  {
    id: 'investasi_asing',
    judul: 'Tawaran Investasi Asing',
    deskripsi:
      'Perusahaan asing menawarkan investasi besar ke pelabuhan. ' +
      'Dana bisa melimpah, tapi dampak lingkungan dan komunitas perlu dipertimbangkan.',
    hariMulai: 13,
    hariAkhir: 18,
    syarat: (r) => r.reputasi >= 50,
    efekPerHari: { dana: 12, lingkungan: -4, komunitas: -2 },
  },

  // 5. Festival Laut Nusantara — event besar
  {
    id: 'festival_laut',
    judul: 'Festival Laut Nusantara',
    deskripsi:
      'Pelabuhan menjadi tuan rumah festival budaya maritim tahunan. ' +
      'Wisatawan berdatangan dan semua mata tertuju pada Harbor Simulation Nusantara.',
    hariMulai: 17,
    hariAkhir: 22,
    syarat: (r) => r.komunitas >= 55 && r.reputasi >= 45,
    efekPerHari: { dana: 10, reputasi: 5, komunitas: 4 },
  },

  // 6. Pencemaran Limbah — krisis lingkungan
  {
    id: 'pencemaran_limbah',
    judul: 'Pencemaran Limbah',
    deskripsi:
      'Limbah industri terdeteksi di perairan sekitar pelabuhan. ' +
      'Tekanan dari nelayan dan media semakin besar.',
    hariMulai: 19,
    hariAkhir: 25,
    syarat: (r) => r.lingkungan <= 45,
    efekPerHari: { lingkungan: -5, komunitas: -3, reputasi: -2 },
  },

  // 7. Modernisasi Akhir — sprint menuju akhir game
  {
    id: 'modernisasi_akhir',
    judul: 'Proyek Modernisasi Pelabuhan',
    deskripsi:
      'Pemerintah daerah menawarkan program modernisasi pelabuhan ' +
      'di penghujung tahun. Ini kesempatan terakhir untuk meningkatkan semua aspek.',
    hariMulai: 24,
    hariAkhir: 30,
    syarat: (r) => r.infrastruktur >= 50 && r.dana >= 80,
    efekPerHari: { infrastruktur: 3, sdm: 2, reputasi: 2 },
  },
];

// ----------------------------------------------------------
// SCENARIO SYSTEM CLASS
// ----------------------------------------------------------

export class ScenarioSystem {
  private skenarioAktif: Skenario[] = [];
  private hariSekarang = 1;

  // ----------------------------------------------------------
  // UPDATE — dipanggil setiap pergantian hari
  // Aktifkan/nonaktifkan skenario sesuai hari & syarat
  // ----------------------------------------------------------

  updateHari(hari: number, resources: Resources): void {
    this.hariSekarang = hari;

    this.skenarioAktif = DAFTAR_SKENARIO.filter((s) => {
      const dalamRentang = hari >= s.hariMulai && (s.hariAkhir === 0 || hari <= s.hariAkhir);
      const syaratTerpenuhi = !s.syarat || s.syarat(resources, hari);
      return dalamRentang && syaratTerpenuhi;
    });
  }

  // ----------------------------------------------------------
  // EFEK PASIF — akumulasi efek semua skenario aktif hari ini
  // ----------------------------------------------------------

  getEfekPasifHariIni(): Partial<Resources> | null {
    if (this.skenarioAktif.length === 0) return null;

    const total: Partial<Resources> = {};

    this.skenarioAktif.forEach((s) => {
      if (!s.efekPerHari) return;
      (Object.keys(s.efekPerHari) as (keyof Resources)[]).forEach((key) => {
        total[key] = (total[key] ?? 0) + (s.efekPerHari![key] ?? 0);
      });
    });

    return total;
  }

  // ----------------------------------------------------------
  // GETTER
  // ----------------------------------------------------------

  getSkenarioAktif(): Readonly<Skenario[]> {
    return this.skenarioAktif;
  }

  getSkenarioAktifIds(): string[] {
    return this.skenarioAktif.map((s) => s.id);
  }

  isSkenarioAktif(id: string): boolean {
    return this.skenarioAktif.some((s) => s.id === id);
  }

  // ----------------------------------------------------------
  // DESKRIPSI untuk HUD (nama skenario aktif)
  // ----------------------------------------------------------

  getTeksStatusSkenario(): string {
    if (this.skenarioAktif.length === 0) return 'Hari biasa';
    if (this.skenarioAktif.length === 1) return this.skenarioAktif[0].judul;
    return `${this.skenarioAktif[0].judul} +${this.skenarioAktif.length - 1} lainnya`;
  }
}
