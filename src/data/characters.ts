// ============================================================
// PELABUHAN HIJAU v3 — Data 3 Karakter
// ============================================================

import type { Karakter } from '../types/index';
import { COLORS, MULTIPLIER_KARAKTER } from '../config';

export const DAFTAR_KARAKTER: Karakter[] = [
  // ----------------------------------------------------------
  // BAHARI — Nelayan Berpengalaman
  // Fokus: lingkungan & komunitas
  // ----------------------------------------------------------
  {
    id: 'bahari',
    nama: 'Pak Bahari',
    jabatan: 'Kepala Nelayan & Pengawas Perairan',
    deskripsi:
      'Nelayan senior yang sudah 30 tahun mengarungi perairan Harbor Simulation Nusantara. ' +
      'Ia dipercaya oleh komunitas nelayan dan sangat peduli terhadap kelestarian laut.',
    keahlian: 'Diplomasi komunitas & pemulihan ekosistem laut',
    multiplier: MULTIPLIER_KARAKTER['bahari'],
    skillId: 'musyawarah_nelayan',
    warna: COLORS.teal,
    avatar: 'avatar-bahari.png',
  },

  // ----------------------------------------------------------
  // CITRA — Manajer Muda Berprestasi
  // Fokus: reputasi & infrastruktur
  // ----------------------------------------------------------
  {
    id: 'citra',
    nama: 'Bu Citra',
    jabatan: 'Manajer Operasional Pelabuhan',
    deskripsi:
      'Lulusan terbaik Teknik Kelautan yang baru 3 tahun menjabat namun sudah ' +
      'berhasil memodernisasi sistem administrasi pelabuhan dan menarik mitra baru.',
    keahlian: 'Manajemen fasilitas & peningkatan citra pelabuhan',
    multiplier: MULTIPLIER_KARAKTER['citra'],
    skillId: 'kampanye_reputasi',
    warna: COLORS.oranye,
    avatar: 'avatar-citra.png',
  },

  // ----------------------------------------------------------
  // RENDRA — Pengusaha Pragmatis
  // Fokus: dana & sdm
  // ----------------------------------------------------------
  {
    id: 'rendra',
    nama: 'Pak Rendra',
    jabatan: 'Direktur Pengembangan Bisnis',
    deskripsi:
      'Pengusaha kawakan yang memiliki jaringan luas di industri maritim. ' +
      'Selalu mengutamakan efisiensi dan pertumbuhan finansial demi keberlanjutan pelabuhan.',
    keahlian: 'Ekspansi bisnis & manajemen sumber daya manusia',
    multiplier: MULTIPLIER_KARAKTER['rendra'],
    skillId: 'negosiasi_kontrak',
    warna: COLORS.kuning,
    avatar: 'avatar-rendra.png',
  },
];

// Helper: ambil karakter berdasarkan id
export function getKarakter(id: string): Karakter {
  const karakter = DAFTAR_KARAKTER.find((k) => k.id === id);
  if (!karakter) throw new Error(`Karakter "${id}" tidak ditemukan`);
  return karakter;
}
