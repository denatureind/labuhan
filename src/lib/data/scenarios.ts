import type { Scenario } from '../types';

export const SCENARIOS: Record<string, Scenario> = {
  'panen-ikan': {
    id: 'panen-ikan',
    name: 'Musim Panen Ikan',
    icon: '🐟',
    dailyEffects: { dana: 3, komunitas: 2 },
    duration: 3,
    announce:
      'Arus hangat membawa gerombolan ikan ke perairan Muara! Perahu-perahu pulang sarat muatan, pasar riuh sejak subuh. Selama musim ini pelabuhan kecipratan rezeki tiap hari.',
    endText: 'Gerombolan ikan bergerak menjauh mengikuti arus. Musim panen usai.',
    mood: 'good',
  },
  'kapal-wisata': {
    id: 'kapal-wisata',
    name: 'Kapal Wisata Singgah',
    icon: '🛳️',
    dailyEffects: { dana: 4, reputasi: 2, lingkungan: -2 },
    duration: 2,
    announce:
      'Sebuah kapal wisata memilih Muara Harapan sebagai persinggahan! Turis turun berbelanja dan berfoto. Uang dan nama harum mengalir — sayangnya, sampah dan air limbah kapal ikut mengalir juga.',
    endText: 'Kapal wisata mengangkat sauh, meninggalkan dermaga yang kembali sepi.',
    mood: 'good',
  },
  'badai-musiman': {
    id: 'badai-musiman',
    name: 'Badai Musiman',
    icon: '🌧️',
    dailyEffects: { infrastruktur: -5, dana: -3 },
    duration: 3,
    announce:
      'Badai yang diperingatkan BMKG tiba. Angin kencang menghantam derek, gelombang menampar dermaga, dan bongkar-muat nyaris lumpuh. Setiap hari badai bertahan, pelabuhan berdarah.',
    endText: 'Langit akhirnya terang. Badai berlalu, menyisakan kerusakan yang harus dibenahi.',
    mood: 'storm',
  },
  'angin-timur': {
    id: 'angin-timur',
    name: 'Musim Angin Timur',
    icon: '🌬️',
    dailyEffects: { komunitas: -3, dana: -2 },
    duration: 3,
    announce:
      'Angin timur bertiup kencang berhari-hari. Perahu kecil tak berani melaut — dapur keluarga nelayan mulai dingin, dan mereka menoleh ke pelabuhan berharap uluran tangan.',
    endText: 'Angin timur mereda. Perahu-perahu kembali berani menembus ombak.',
    mood: 'bad',
  },
  'badai-besar': {
    id: 'badai-besar',
    name: 'Badai Besar & Banjir Rob',
    icon: '⛈️',
    dailyEffects: { infrastruktur: -6, dana: -4, sdm: -2 },
    duration: 4,
    announce:
      'Ini bukan badai biasa. Siklon tropis di Laut Jawa mengirim gelombang setinggi atap dan rob menggenangi separuh pelabuhan. Pekerja bertaruh nyawa menambatkan kapal. Bertahanlah.',
    endText: 'Setelah empat hari mencekam, laut kembali tenang. Muara Harapan masih berdiri.',
    mood: 'storm',
  },
  'sorotan-media': {
    id: 'sorotan-media',
    name: 'Sorotan Media Nasional',
    icon: '📺',
    dailyEffects: { reputasi: -3 },
    duration: 3,
    announce:
      'Stasiun TV nasional menurunkan tim liputan investigasi ke Muara Harapan. Setiap retakan dermaga, setiap keluhan buruh, setiap noda minyak di air — semuanya masuk kamera.',
    endText: 'Tim liputan angkat kaki. Beritanya tayang, dan hidup berjalan lagi.',
    mood: 'bad',
  },
  'pencemaran-teluk': {
    id: 'pencemaran-teluk',
    name: 'Pencemaran Teluk',
    icon: '🛢️',
    dailyEffects: { lingkungan: -4, reputasi: -2 },
    duration: 4,
    announce:
      'Limbah yang dibuang diam-diam itu mulai menampakkan wujudnya: lapisan berminyak di permukaan teluk, ikan menghilang dari perairan dangkal. Warga mulai bertanya-tanya.',
    endText: 'Arus laut perlahan mengencerkan cemaran. Teluk mulai pulih — kali ini.',
    mood: 'bad',
  },
  'gelombang-solidaritas': {
    id: 'gelombang-solidaritas',
    name: 'Gelombang Solidaritas',
    icon: '🤝',
    dailyEffects: { komunitas: 3, sdm: 2 },
    duration: 3,
    announce:
      'Kabar keputusanmu membela rakyat kecil menyebar dari warung ke warung. Warga bergantian mengirim kopi dan nasi bungkus ke pos jaga. Kampung dan pelabuhan sedang jatuh cinta.',
    endText: 'Riuh solidaritas mereda, tapi hangatnya masih terasa.',
    mood: 'good',
  },
};

/** Jadwal skenario tetap: hari -> id skenario yang dimulai pagi itu. */
export const SCENARIO_SCHEDULE: Record<number, string> = {
  3: 'panen-ikan',
  8: 'kapal-wisata',
  12: 'badai-musiman',
  17: 'angin-timur',
  22: 'badai-besar',
  24: 'sorotan-media',
};
