// ============================================================
// PELABUHAN HIJAU v3 — Data Kartu Kejadian (Dilema Harian)
// ============================================================

import type { KartuKejadian } from '../types/index';

export const DAFTAR_KEJADIAN: KartuKejadian[] = [
  {
    id: 'limbah_ilegal',
    judul: 'Penemuan Limbah Ilegal',
    deskripsi: 'Pagi ini, petugas kebersihan menemukan sebuah kapal kargo membuang limbah minyak diam-diam di dekat area tambak nelayan. Jika dibiarkan, tambak bisa mati. Apa tindakan Anda?',
    pilihan: [
      {
        label: 'Tindak Tegas & Denda',
        deskripsi: 'Laporkan ke otoritas maritim dan jatuhkan denda maksimal.',
        efek: { dana: 20, lingkungan: 10, reputasi: -10 },
        eduFakta: 'Ketegasan hukum menjaga ekosistem, namun kadang membuat beberapa mitra bisnis menjauh.'
      },
      {
        label: 'Terima "Uang Damai"',
        deskripsi: 'Tutup mata dan terima suap dari kapten kapal agar masalah selesai cepat.',
        efek: { dana: 50, lingkungan: -25, komunitas: -15 },
        eduFakta: 'Korupsi memberi untung instan, tapi menghancurkan alam dan kepercayaan rakyat selamanya.'
      },
      {
        label: 'Bina & Edukasi',
        deskripsi: 'Beri peringatan keras dan wajibkan kapten mengikuti penyuluhan.',
        efek: { dana: -10, reputasi: 15, lingkungan: 5 },
      }
    ],
    syarat: (r, hari) => hari >= 3
  },
  {
    id: 'demo_nelayan',
    judul: 'Protes Nelayan Lokal',
    deskripsi: 'Sekelompok nelayan memblokir gerbang pelabuhan. Mereka menuntut kompensasi karena kapal besar merusak jaring mereka malam tadi.',
    pilihan: [
      {
        label: 'Berikan Kompensasi Penuh',
        deskripsi: 'Bayar ganti rugi jaring dari kas pelabuhan.',
        efek: { dana: -30, komunitas: 25, reputasi: 10 }
      },
      {
        label: 'Bubarkan Paksa',
        deskripsi: 'Panggil petugas keamanan untuk membubarkan protes.',
        efek: { komunitas: -30, reputasi: -15, sdm: -10 }
      },
      {
        label: 'Janji Manis (Tunda)',
        deskripsi: 'Berikan janji investigasi tanpa uang ganti rugi.',
        efek: { komunitas: -10, reputasi: -5 }
      }
    ],
    syarat: (r, hari) => r.komunitas < 50
  },
  {
    id: 'investor_nakal',
    judul: 'Tawaran Investor Gelap',
    deskripsi: 'Seorang investor kaya menawarkan suntikan dana besar untuk pelabuhan, dengan syarat mereka diizinkan mereklamasi area terumbu karang di muara.',
    pilihan: [
      {
        label: 'Tolak Mentah-mentah',
        deskripsi: 'Terumbu karang lebih berharga dari sekadar uang.',
        efek: { lingkungan: 15, komunitas: 10, dana: -10 }
      },
      {
        label: 'Terima Tawaran',
        deskripsi: 'Ambil dananya, reklamasi perairan.',
        efek: { dana: 80, lingkungan: -35, komunitas: -20 }
      }
    ]
  },
  {
    id: 'mesin_rusak',
    judul: 'Kerusakan Derek Utama',
    deskripsi: 'Mesin derek (crane) utama di dermaga mogok parah karena kurang perawatan. Aktivitas bongkar muat terhenti total!',
    pilihan: [
      {
        label: 'Panggil Teknisi Ahli',
        deskripsi: 'Bayar mahal agar selesai hari ini juga.',
        efek: { dana: -40, infrastruktur: 20 }
      },
      {
        label: 'Suruh Staf Lokal Akali',
        deskripsi: 'Gunakan peralatan seadanya. Murah tapi berbahaya.',
        efek: { dana: -10, infrastruktur: 5, sdm: -15 }
      }
    ],
    syarat: (r) => r.infrastruktur < 40
  },
  {
    id: 'berita_viral',
    judul: 'Wartawan Investigasi',
    deskripsi: 'Seorang wartawan meminta izin meliput langsung fasilitas pelabuhan untuk artikel nasional. Ini bisa jadi promosi atau petaka.',
    pilihan: [
      {
        label: 'Sambut Terbuka',
        deskripsi: 'Berikan akses penuh. Jika kita bersih, tak perlu takut.',
        // Jika reputasi tinggi makin naik, jika rendah malah hancur
        efek: { reputasi: 20, sdm: 10 }
      },
      {
        label: 'Sogok Wartawan',
        deskripsi: 'Bayar dia agar menulis hal yang baik-baik saja.',
        efek: { dana: -30, reputasi: 10, komunitas: -15 }
      },
      {
        label: 'Usir dari Pelabuhan',
        deskripsi: 'Kita tidak butuh media mencampuri urusan kita.',
        efek: { reputasi: -25, komunitas: -10 }
      }
    ]
  },
  {
    id: 'badai_besar',
    judul: 'Peringatan Badai Besar',
    deskripsi: 'BMKG mengeluarkan peringatan badai esktrem yang akan menghantam pesisir. Operasional bongkar muat kapal sangat berisiko hari ini.',
    pilihan: [
      {
        label: 'Hentikan Operasi',
        deskripsi: 'Tutup pelabuhan sementara. Aman, tapi kita merugi besar.',
        efek: { dana: -40, sdm: 10, infrastruktur: 5 }
      },
      {
        label: 'Paksa Tetap Buka',
        deskripsi: 'Kejar target! Biarkan kapal tetap merapat walau bahaya.',
        efek: { dana: 60, infrastruktur: -30, sdm: -25, reputasi: -15 }
      }
    ],
    syarat: (r, hari) => hari >= 10 // Badai muncul setelah hari ke-10
  },
  {
    id: 'penyelundupan',
    judul: 'Kontainer Mencurigakan',
    deskripsi: 'Petugas gudang menemukan satu kontainer berisi barang selundupan tak bertuan. Apa yang harus kita lakukan?',
    pilihan: [
      {
        label: 'Lapor Polisi',
        deskripsi: 'Jadilah warga negara yang baik. Kita kehilangan waktu operasional.',
        efek: { reputasi: 20, dana: -15, komunitas: 5 }
      },
      {
        label: 'Jual Diam-diam',
        deskripsi: 'Sita barangnya dan jadikan pemasukan tambahan untuk kas pelabuhan.',
        efek: { dana: 70, reputasi: -35, sdm: -20 },
        eduFakta: 'Praktik ilegal di pelabuhan akan menghancurkan integritas tim dalam jangka panjang.'
      }
    ]
  },
  {
    id: 'wabah_penyakit',
    judul: 'Wabah Demam Pekerja',
    deskripsi: 'Banyak pekerja dermaga tumbang karena demam parah. Produktivitas pelabuhan menurun drastis pagi ini.',
    pilihan: [
      {
        label: 'Buka Klinik & Liburkan',
        deskripsi: 'Fokus pada pemulihan. Bayar penuh biaya medis mereka.',
        efek: { dana: -45, sdm: 30, reputasi: 10 }
      },
      {
        label: 'Paksa Lembur Sisa Staf',
        deskripsi: 'Ganti yang sakit dengan pekerja sisa yang harus bekerja ekstra keras.',
        efek: { dana: 20, sdm: -40, komunitas: -15 }
      }
    ],
    syarat: (r) => r.sdm < 60 // Hanya muncul jika SDM sedang tidak optimal
  },
  {
    id: 'audit_mendadak',
    judul: 'Inspeksi Pusat',
    deskripsi: 'Tim auditor dari pemerintah pusat datang tanpa pemberitahuan untuk mengecek standar kelayakan dan lingkungan pelabuhan.',
    pilihan: [
      {
        label: 'Sambut Transparan',
        deskripsi: 'Biarkan mereka melihat semuanya. Kejujuran dihargai.',
        efek: { reputasi: 15, sdm: 10 }
      },
      {
        label: 'Palsukan Dokumen',
        deskripsi: 'Suruh staf begadang memalsukan laporan kelayakan.',
        efek: { dana: -10, reputasi: 10, sdm: -25, lingkungan: -15 }
      },
      {
        label: 'Suap Auditor',
        deskripsi: 'Beri mereka "uang saku" agar laporan dinilai sempurna.',
        efek: { dana: -60, reputasi: 30, komunitas: -20 }
      }
    ],
    syarat: (r, hari) => hari >= 15 // Muncul di paruh akhir game
  },
  {
    id: 'lsm_lingkungan',
    judul: 'Tawaran Bantuan LSM',
    deskripsi: 'Sebuah LSM Lingkungan menawarkan alat pembersih limbah canggih secara gratis, tapi mereka meminta hak mengatur operasional nelayan lokal.',
    pilihan: [
      {
        label: 'Terima Alatnya',
        deskripsi: 'Alat itu sangat kita butuhkan untuk laut yang lebih bersih.',
        efek: { lingkungan: 35, infrastruktur: 15, komunitas: -30 }
      },
      {
        label: 'Tolak Tawaran',
        deskripsi: 'Kita harus melindungi kebebasan nelayan lokal kita.',
        efek: { komunitas: 25, reputasi: 10, lingkungan: -15 }
      }
    ]
  }
];