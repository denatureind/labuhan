import type { StatKey, StatMeta } from '../types';

export const STATS: Record<StatKey, StatMeta> = {
  dana: {
    key: 'dana',
    label: 'Dana',
    icon: '💰',
    desc: 'Kas pelabuhan — modal untuk hampir semua tindakan.',
    failTitle: 'Kebangkrutan',
    failText:
      'Kas pelabuhan benar-benar kosong. Gaji pekerja tak terbayar, listrik dermaga diputus, dan kapal-kapal mulai dialihkan ke pelabuhan tetangga. Pemerintah pusat menyatakan Muara Harapan pailit dan mengambil alih seluruh asetnya.',
  },
  reputasi: {
    key: 'reputasi',
    label: 'Reputasi',
    icon: '⭐',
    desc: 'Kepercayaan publik dan investor terhadap pelabuhan.',
    failTitle: 'Kehilangan Kepercayaan',
    failText:
      'Pemberitaan buruk bertubi-tubi membuat nama Muara Harapan hancur. Mitra dagang menarik diri satu per satu, izin operasional dibekukan, dan pemerintah pusat mencopotmu tanpa upacara. Pelabuhan ini kini hanya disebut sebagai contoh kegagalan.',
  },
  lingkungan: {
    key: 'lingkungan',
    label: 'Lingkungan',
    icon: '🌊',
    desc: 'Kesehatan laut, terumbu karang, dan kebersihan perairan.',
    failTitle: 'Bencana Ekologi',
    failText:
      'Air teluk berubah keruh kehitaman. Ikan-ikan mati mengambang, terumbu karang memutih, dan bau menyengat tercium sampai ke pemukiman. KLHK menyegel pelabuhan sebagai kawasan darurat ekologi — laut yang menghidupi Muara Harapan telah mati di tanganmu.',
  },
  sdm: {
    key: 'sdm',
    label: 'SDM',
    icon: '👷',
    desc: 'Kondisi fisik, mental, dan loyalitas para pekerja pelabuhan.',
    failTitle: 'Pemberontakan Pekerja',
    failText:
      'Bertahun rasanya dipadatkan dalam sebulan: lembur tanpa henti, upah tersendat, keselamatan diabaikan. Pagi ini seluruh buruh pelabuhan mogok total, memblokade gerbang, dan membakar ban di depan kantor. Operasional lumpuh — pelabuhan ditutup paksa.',
  },
  infrastruktur: {
    key: 'infrastruktur',
    label: 'Infrastruktur',
    icon: '🏗️',
    desc: 'Kelayakan derek, dermaga, gudang, dan bangunan pelabuhan.',
    failTitle: 'Kecelakaan Fatal',
    failText:
      'Derek tua itu akhirnya menyerah — patah saat mengangkat kontainer penuh, menimpa dermaga yang sudah retak. Dua pekerja luka berat. Kementerian Perhubungan menyatakan pelabuhan tidak laik operasi dan mencabut sertifikasinya hari itu juga.',
  },
  komunitas: {
    key: 'komunitas',
    label: 'Komunitas',
    icon: '🤝',
    desc: 'Hubungan dengan warga kampung pesisir dan nelayan tradisional.',
    failTitle: 'Perlawanan Warga',
    failText:
      'Kesabaran kampung pesisir habis. Ratusan perahu nelayan memblokade alur pelayaran, warga menduduki dermaga, dan spanduk "PELABUHAN MILIK RAKYAT" terbentang di gerbang utama. Tak ada kapal bisa masuk atau keluar. Pemerintah menutup pelabuhan demi meredam konflik.',
  },
};
