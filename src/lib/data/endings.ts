import type { EndingDef, StatKey } from '../types';

export const ENDINGS: Record<EndingDef['id'], EndingDef> = {
  emas: {
    id: 'emas',
    title: 'Pelabuhan Emas',
    icon: '🥇',
    narration:
      'Tiga puluh hari yang nyaris mustahil. Kas sehat, laut jernih, pekerja bangga, dan kampung pesisir menyebut namamu dalam doa. Menteri datang sendiri membacakan surat penghargaan: Muara Harapan ditetapkan sebagai percontohan pelabuhan berkelanjutan nasional. Di ujung dermaga, Mbok Sari menyalamimu sambil berbisik, "Laut tidak pernah lupa pada orang yang menjaganya." Inilah kepemimpinan yang akan dikenang berpuluh tahun.',
  },
  bisnis: {
    id: 'bisnis',
    title: 'Raja Bisnis',
    icon: '💼',
    narration:
      'Angka-angka itu memukau: kas melimpah, kontrak antre, investor bertepuk tangan di ballroom hotel. Muara Harapan resmi jadi mesin uang paling efisien di pesisir utara. Tapi di balik gemerlap itu, air teluk makin keruh dan kampung nelayan makin sunyi — anak-anak mudanya pergi, tak ada lagi ikan yang bisa dijaring dekat pantai. Kau menang besar, tapi entah untuk siapa. Pak Hendra mengangkat gelas untukmu; Mbok Sari tak datang.',
  },
  hijau: {
    id: 'hijau',
    title: 'Pejuang Hijau',
    icon: '🌱',
    narration:
      'Teluk Muara kini sebening kaca. Mangrove merimbun, penyu kembali bertelur di gosong pasir, dan Dr. Laut menerbitkan jurnal yang membuat namamu dikutip di konferensi internasional. Tapi kas pelabuhan tipis, derek tua merintih, dan investor sudah lama berpaling ke pelabuhan sebelah. Kau menyelamatkan laut dengan harga yang mahal. "Setidaknya," katamu memandang air yang jernih, "ada yang tak bisa dibeli uang." Laut setuju. Bank tidak.',
  },
  rakyat: {
    id: 'rakyat',
    title: 'Bapak Rakyat',
    icon: '🤝',
    narration:
      'Di warung kopi, namamu disebut dengan hormat. Buruh pulang tepat waktu, nelayan punya jalur sandar sendiri, dan tak ada anak kampung yang putus sekolah tahun ini. Muara Harapan mungkin bukan pelabuhan tercanggih — dereknya tua, sistemnya manual, kapal besar enggan mampir. Dunia luar menyebutnya kuno. Tapi setiap sore, ketika perahu-perahu pulang dan pasar riuh oleh tawa, kau tahu pelabuhan ini kaya dengan caranya sendiri.',
  },
  terlupakan: {
    id: 'terlupakan',
    title: 'Pelabuhan Terlupakan',
    icon: '🌫️',
    narration:
      'Tiga puluh hari berlalu tanpa bencana — juga tanpa cerita. Kau menghindari semua risiko, menyenangkan semua pihak secukupnya, dan tak pernah berdiri untuk apa pun. Laporan evaluasi pusat hanya setebal dua halaman; kolom "capaian menonjol" dibiarkan kosong. Pelabuhan tetap beroperasi, orang-orang tetap bekerja, dan perlahan-lahan, seperti kabut pagi di muara, namamu menghilang dari percakapan. Selamat: kau bertahan. Hanya itu.',
  },
};

/**
 * Evaluasi akhir hari ke-30, urutan prioritas:
 * Emas (semua tinggi) > Raja Bisnis > Pejuang Hijau > Bapak Rakyat > Terlupakan.
 */
export function evaluateEnding(stats: Record<StatKey, number>): EndingDef['id'] {
  const s = stats;
  if (Math.min(...Object.values(s)) >= 70) return 'emas';
  if (s.dana >= 70 && (s.lingkungan < 50 || s.komunitas < 50 || s.sdm < 50)) return 'bisnis';
  if (s.lingkungan >= 70 && s.dana < 50) return 'hijau';
  if (s.komunitas >= 70 && s.sdm >= 50 && (s.infrastruktur < 50 || s.dana < 50)) return 'rakyat';
  // Profil dominan tanpa ambang gagal — pilih poros terkuat yang menonjol jelas.
  const bisnisScore = s.dana;
  const hijauScore = s.lingkungan;
  const rakyatScore = (s.komunitas + s.sdm) / 2;
  const best = Math.max(bisnisScore, hijauScore, rakyatScore);
  if (best >= 78) {
    if (best === bisnisScore) return 'bisnis';
    if (best === hijauScore) return 'hijau';
    return 'rakyat';
  }
  return 'terlupakan';
}

/** Catatan evaluasi per indikator untuk layar akhir. */
export function statVerdict(key: StatKey, v: number): string {
  const tier = v >= 70 ? 2 : v >= 40 ? 1 : 0;
  const table: Record<StatKey, [string, string, string]> = {
    dana: [
      'Kas nyaris kandas — pelabuhan hidup dari hari ke hari.',
      'Keuangan cukup untuk bertahan, belum untuk bermimpi.',
      'Kas gemuk; auditor pusat sampai mengecek dua kali.',
    ],
    reputasi: [
      'Nama Muara Harapan jadi bahan sindiran di berita.',
      'Publik menilai biasa saja — tak dibenci, tak dibanggakan.',
      'Media menyebut Muara Harapan pelabuhan panutan.',
    ],
    lingkungan: [
      'Teluk sakit: air keruh, ikan menjauh, karang memutih.',
      'Laut masih bernapas, meski sesekali terbatuk.',
      'Perairan jernih — penyu dan camar kembali pulang.',
    ],
    sdm: [
      'Pekerja letih dan getir; loyalitas tinggal ampas.',
      'Buruh datang, bekerja, pulang — setianya sebatas slip gaji.',
      'Kru pelabuhan solid, terlatih, dan bangga pada seragamnya.',
    ],
    infrastruktur: [
      'Derek berderit menunggu roboh; dermaga penuh tambalan.',
      'Fasilitas berfungsi, dengan doa dan sedikit karat.',
      'Peralatan prima — pelabuhan sebelah datang studi banding.',
    ],
    komunitas: [
      'Di kampung pesisir, "pelabuhan" sudah jadi kata lain untuk musuh.',
      'Warga dan pelabuhan hidup berdampingan, saling menjaga jarak.',
      'Pelabuhan dan kampung sudah seperti satu keluarga besar.',
    ],
  };
  return table[key][tier];
}
