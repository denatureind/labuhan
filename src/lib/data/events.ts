import type { EventCard } from '../types';

/**
 * Kartu kejadian. Tiga fase dramatik:
 *  fase 1 (hari 2–10)  — perkenalan, taruhan kecil
 *  fase 2 (hari 11–20) — eskalasi, pilihan mulai menyakitkan
 *  fase 3 (hari 21–29) — krisis, taruhan besar
 * Kejadian ber-`day` terjadwal pasti; ber-`requiresFlag` adalah buntut keputusan lama.
 * Aturan desain: setiap kartu punya minimal satu pilihan tanpa `cost`.
 */
export const EVENTS: EventCard[] = [
  // ───────────────────────── TERJADWAL ─────────────────────────
  {
    id: 'pelantikan',
    day: 1,
    phase: 1,
    title: 'Hari Pelantikan',
    speaker: 'narator',
    text:
      'Sirene kapal menyambut pagi pertamamu sebagai pemimpin Pelabuhan Muara Harapan. Di aula kantor yang catnya mengelupas, tiga wajah menunggumu: Pak Hendra sudah menyodorkan proposal, Mbok Sari membawa sekeranjang ikan asap sebagai salam, dan Dr. Laut memegang map berisi data terumbu. Semua mata bertanya: pemimpin macam apa kau ini?',
    choices: [
      {
        label: 'Gelar syukuran kecil bersama warga kampung',
        hints: ['komunitas+', 'dana-'],
        cost: 3,
        effects: { komunitas: 6, reputasi: 2 },
        outcome:
          'Tikar digelar di halaman kantor, kopi dan pisang goreng beredar. Warga pulang dengan senyum: "Pemimpin baru ini mau duduk di tikar yang sama dengan kami."',
      },
      {
        label: 'Langsung rapat kerja: tak ada waktu untuk seremoni',
        hints: ['infrastruktur+', 'komunitas-'],
        effects: { infrastruktur: 4, sdm: 2, komunitas: -3 },
        outcome:
          'Hari pertama langsung tancap gas: daftar kerusakan disusun, jadwal perbaikan dibagi. Efisien — meski di warung kopi orang berbisik, "Belum sehari sudah sok sibuk, salaman saja tidak."',
      },
      {
        label: 'Undang wartawan lokal meliput visi barumu',
        hints: ['reputasi+', 'dana-'],
        cost: 2,
        effects: { reputasi: 6 },
        outcome:
          'Fotomu terpampang di koran daerah: "NAHKODA BARU MUARA HARAPAN". Nama baik modal awal yang bagus — tinggal membuktikannya.',
      },
    ],
  },
  {
    id: 'peringatan-bmkg',
    day: 10,
    phase: 1,
    title: 'Peringatan Dini BMKG',
    speaker: 'petugas',
    text:
      'Faks dari BMKG masuk pagi-pagi: siklon tropis terpantau di utara, badai musiman diperkirakan menghantam pesisir dalam dua hari dan bertahan lama. "Pelabuhan tetangga sudah mulai mengencangkan ikatan, Pak/Bu. Kita bagaimana?"',
    choices: [
      {
        label: 'Siaga penuh: perkuat tambatan, servis derek, tutup asuransi',
        hints: ['dana-', 'infrastruktur+'],
        cost: 8,
        effects: { infrastruktur: 8, sdm: 2 },
        outcome:
          'Dua hari penuh persiapan: tali ganda di tiap kapal, derek diservis, gudang dilapis terpal. Mahal — tapi saat badai tiba, Muara Harapan sudah pasang kuda-kuda.',
      },
      {
        label: 'Siaga secukupnya, sisanya berdoa',
        hints: ['dana-'],
        cost: 3,
        effects: { infrastruktur: 3 },
        outcome:
          'Persiapan seadanya: ikatan diperiksa, barang penting diungsikan. Sisanya urusan langit. Semoga BMKG salah hitung.',
      },
      {
        label: 'Abaikan — ramalan cuaca sering meleset',
        hints: ['reputasi-'],
        effects: { reputasi: -3 },
        outcome:
          'Kau memilih tak percaya. Para pekerja saling pandang; nelayan tua di dermaga menggeleng pelan sambil menatap langit yang mulai kelabu. Semoga kau benar.',
      },
    ],
  },
  {
    id: 'investor-reklamasi',
    day: 15,
    phase: 2,
    title: 'Tawaran Sang Investor',
    speaker: 'pak-hendra',
    text:
      'Pak Hendra datang membawa tamu berjas dari Jakarta: konsorsium pelabuhan internasional. Tawarannya menggiurkan — suntikan dana raksasa untuk reklamasi dan terminal peti kemas modern. Syaratnya: tiga hektare perairan tempat nelayan biasa menjaring harus diuruk. "Ini kesempatan sekali seumur hidup," bisik Hendra. Di luar jendela, perahu-perahu kecil melintas pelan.',
    choices: [
      {
        label: 'Terima penuh: masa depan tak bisa menunggu',
        hints: ['dana+', 'infrastruktur+', 'lingkungan-', 'komunitas-'],
        effects: { dana: 18, infrastruktur: 10, lingkungan: -10, komunitas: -12 },
        setFlag: 'reklamasi',
        outcome:
          'Kontrak diteken di atas meja rapat yang gemetar oleh tepuk tangan. Alat berat akan datang bulan depan. Dari jendela, kau melihat Mbok Sari berdiri di dermaga, memandangi perairan yang sebentar lagi jadi daratan.',
      },
      {
        label: 'Nego ulang: investasi masuk, tapi zona tangkap nelayan tak disentuh',
        hints: ['dana+', 'reputasi+', 'infrastruktur-'],
        cost: 5,
        effects: { dana: 8, reputasi: 5, komunitas: 3, infrastruktur: 2 },
        outcome:
          'Negosiasi alot sampai larut malam. Investor akhirnya setuju skema lebih kecil: terminal diperluas ke arah darat, perairan aman. Nilainya tak sebesar tawaran awal — tapi kau bisa menatap mata nelayan tanpa berpaling.',
      },
      {
        label: 'Tolak mentah-mentah: laut ini bukan barang dagangan',
        hints: ['komunitas+', 'reputasi-', 'dana-'],
        effects: { komunitas: 8, lingkungan: 4, reputasi: -6, dana: -4 },
        setFlag: 'tolak-investor',
        outcome:
          'Ruangan hening. Sang investor menutup kopernya dengan sopan yang dingin; Pak Hendra menahan kecewa. Sorenya kabar menyebar ke kampung — malam itu, entah dari siapa, sekarung kepiting segar tergeletak di depan pintu kantormu.',
      },
    ],
  },
  {
    id: 'evaluasi-tengah',
    day: 20,
    phase: 2,
    title: 'Evaluasi Paruh Waktu',
    speaker: 'petugas',
    text:
      'Tim evaluasi kementerian datang untuk penilaian tengah periode. Duapuluh hari sudah kau memimpin. Di ruang rapat, mereka membuka laporan dan bertanya datar: "Apa yang ingin Saudara tonjolkan dari kepemimpinan ini — dan apa yang Saudara akui masih gagal?"',
    choices: [
      {
        label: 'Jujur total: paparkan capaian dan borok apa adanya',
        hints: ['reputasi+', 'sdm+'],
        effects: { reputasi: 5, sdm: 4, komunitas: 2 },
        outcome:
          'Kau membuka semua data, termasuk yang memalukan. Ketua tim menutup map: "Jarang ada pemimpin yang berani membuka luka sendiri." Para pekerja yang ikut mendengar diam-diam menegakkan punggung.',
      },
      {
        label: 'Poles laporan: tampilkan yang baik, kubur yang buruk',
        hints: ['reputasi+', 'risiko'],
        effects: { reputasi: 8, sdm: -4 },
        setFlag: 'laporan-palsu',
        outcome:
          'Slide presentasimu gemilang; angka-angka sulit disembunyikan di kolom lampiran. Tim evaluasi manggut-manggut. Beberapa staf yang tahu data asli saling lirik — mereka kini tahu pemimpinnya bisa menyulap angka.',
      },
      {
        label: 'Alihkan fokus: ajak tim tur lapangan seharian',
        hints: ['dana-', 'reputasi+'],
        cost: 4,
        effects: { reputasi: 4, infrastruktur: 2 },
        outcome:
          'Daripada perang angka di ruang rapat, kau ajak mereka naik kapal patroli, mampir ke pasar ikan, makan siang gulai kakap. Evaluasi berubah jadi silaturahmi. Politik lapangan klasik — dan berhasil.',
      },
    ],
  },
  {
    id: 'tanker-kandas',
    day: 25,
    phase: 3,
    title: 'Tanker Kandas di Alur',
    speaker: 'dr-laut',
    text:
      'Subuh buta, kapal tanker pengangkut CPO kandas di alur masuk pelabuhan — tepat di atas gosong karang yang mulai pulih. Lambungnya retak, minyak sawit merembes pelan. Dr. Laut menggebrak meja: "Kalau tak ditangani hari ini juga, seisi teluk tamat!" Sementara di radio, agen kapal menawarkan "uang damai" agar insiden ini tak dilaporkan.',
    choices: [
      {
        label: 'Operasi penyelamatan besar-besaran: kerahkan semua armada',
        hints: ['dana-', 'lingkungan+', 'reputasi+'],
        cost: 12,
        effects: { lingkungan: 8, reputasi: 8, sdm: -3 },
        outcome:
          'Sepanjang hari pelabuhan bahu-membahu: oil boom dibentang, muatan dipindah, kapal ditarik saat pasang. Menjelang magrib tanker terapung kembali. Kru kelelahan — tapi rekaman aksimu beredar luas: Muara Harapan tahu cara menjaga lautnya.',
      },
      {
        label: 'Tangani seperlunya, biarkan pemilik kapal yang repot',
        hints: ['lingkungan-'],
        effects: { lingkungan: -8, reputasi: -3 },
        outcome:
          'Kau kirim satu kapal pandu dan surat teguran. Tanker baru bebas dua hari kemudian — dan selama itu minyak terus merembes ke teluk. Karang yang susah payah pulih kini berselimut lapisan licin.',
      },
      {
        label: 'Terima uang damai, tutup kasusnya',
        hints: ['dana+', 'lingkungan-', 'risiko'],
        effects: { dana: 15, lingkungan: -10 },
        setFlag: 'suap',
        outcome:
          'Amplop tebal berpindah tangan di ruang tertutup. Laporan resmi menulis "insiden ringan tanpa pencemaran". Dr. Laut menatap hasil sampel airnya, lalu menatapmu — dan kau tahu persis arti tatapan itu.',
      },
    ],
  },
  {
    id: 'hari-terakhir',
    day: 30,
    phase: 3,
    title: 'Hari Ketiga Puluh',
    speaker: 'narator',
    text:
      'Pagi terakhir masa kepemimpinanmu. Besok tim evaluasi pusat membacakan penilaian akhir. Di dermaga, orang-orang berkumpul tanpa diminta — buruh, nelayan, pedagang pasar, bahkan Pak Hendra dan Dr. Laut berdiri berdampingan. Mbok Sari maju: "Sebelum semuanya usai, Nak... katakan pada kami, untuk apa semua ini kau kerjakan?"',
    choices: [
      {
        label: '"Untuk masa depan ekonomi anak-cucu kita."',
        hints: ['dana+', 'reputasi+'],
        effects: { dana: 3, reputasi: 3 },
        outcome:
          'Pak Hendra mengangguk paling dulu. "Pelabuhan yang kuat adalah dapur yang ngebul," katamu. Sebagian hadirin bertepuk; sebagian menatap laut, mencerna.',
      },
      {
        label: '"Untuk laut — sebab tanpanya kita bukan siapa-siapa."',
        hints: ['lingkungan+', 'reputasi+'],
        effects: { lingkungan: 3, reputasi: 3 },
        outcome:
          'Dr. Laut tersenyum untuk pertama kalinya minggu ini. Angin membawa aroma garam. "Laut yang sehat," katamu, "adalah warisan yang tak bisa dicetak ulang."',
      },
      {
        label: '"Untuk orang-orang yang berdiri di sini sekarang."',
        hints: ['komunitas+', 'sdm+'],
        effects: { komunitas: 3, sdm: 3 },
        outcome:
          'Mbok Sari mengusap sudut matanya dengan ujung kerudung. Para buruh bersorak. Apa pun kata evaluasi besok, sore ini dermaga terasa hangat.',
      },
    ],
  },

  // ───────────────────────── FASE 1 (hari 2–10) ─────────────────────────
  {
    id: 'kontainer-tak-bertuan',
    phase: 1,
    title: 'Kontainer Tak Bertuan',
    speaker: 'petugas',
    text:
      'Petugas gudang menemukan kontainer tanpa dokumen di sudut dermaga. Isinya kayu ulin gelondongan — hampir pasti hasil pembalakan liar yang mau diselundupkan lewat pelabuhanmu. Tak lama, sebuah nomor tak dikenal menelepon: "Lepaskan kontainer itu, ada terima kasihnya."',
    choices: [
      {
        label: 'Laporkan ke polisi kehutanan',
        hints: ['reputasi+', 'dana-'],
        effects: { reputasi: 6, lingkungan: 3, dana: -2 },
        outcome:
          'Polhut datang menyita muatan. Beritanya masuk koran: pelabuhan kecil berani menolak mafia kayu. Ada biaya administrasi dan saksi-saksi yang harus diurus, tapi tidurmu nyenyak.',
      },
      {
        label: 'Terima "terima kasih"-nya, buka gerbang malam ini',
        hints: ['dana+', 'risiko'],
        effects: { dana: 10, reputasi: -4 },
        setFlag: 'suap',
        outcome:
          'Truk-truk datang tengah malam tanpa lampu. Amplopnya tebal. Tapi beberapa petugas jaga melihat semuanya — dan cerita seperti ini tak pernah benar-benar terkubur.',
      },
      {
        label: 'Diamkan saja di pojok gudang, pura-pura tak tahu',
        hints: ['sdm-'],
        effects: { sdm: -3, reputasi: -2 },
        outcome:
          'Kontainer itu dibiarkan berdebu. Para petugas yang menemukannya kecewa — buat apa lapor kalau ujungnya didiamkan? Pelan-pelan mereka belajar untuk tak peduli.',
      },
    ],
  },
  {
    id: 'sampah-kiriman',
    phase: 1,
    title: 'Sampah Kiriman Musim Barat',
    speaker: 'dr-laut',
    text:
      'Semalam arus membawa "kiriman" dari kota besar di hulu: hamparan sampah plastik menutup pantai timur dan menyangkut di baling-baling kapal. Dr. Laut datang dengan foto-foto: "Ini bukan sampah kita, tapi kalau dibiarkan, teluk kita yang mati."',
    choices: [
      {
        label: 'Kerja bakti besar: kerahkan pekerja dan ajak warga',
        hints: ['dana-', 'lingkungan+', 'komunitas+'],
        cost: 4,
        effects: { lingkungan: 7, komunitas: 4, sdm: -2 },
        outcome:
          'Ratusan tangan turun ke pantai sejak subuh. Menjelang sore, empat truk sampah terangkut dan pantai kembali bernapas. Pekerja pegal-pegal, tapi foto kerja bakti itu jadi kebanggaan kampung.',
      },
      {
        label: 'Sewa jasa angkut, selesai tanpa drama',
        hints: ['dana-', 'lingkungan+'],
        cost: 7,
        effects: { lingkungan: 6 },
        outcome:
          'Kontraktor kebersihan datang dengan ekskavator kecil. Cepat, rapi, tanpa keringat — dan tanpa cerita. Pantai bersih; dompet menipis.',
      },
      {
        label: 'Biarkan — nanti juga dibawa arus balik',
        hints: ['lingkungan-'],
        effects: { lingkungan: -5, reputasi: -2 },
        outcome:
          'Arus memang membawa sebagian sampah pergi — sisanya tenggelam pelan-pelan ke dasar teluk, mengendap di antara karang. Yang tak terlihat bukan berarti hilang.',
      },
    ],
  },
  {
    id: 'diskon-hendra',
    phase: 1,
    title: 'Permintaan Kawan Lama',
    speaker: 'pak-hendra',
    text:
      'Pak Hendra datang membawa oleh-oleh dan senyum lebar. Perusahaan ekspedisinya ingin kontrak sewa gudang setahun — tapi minta tarif "harga kawan", jauh di bawah standar. "Anggap saja investasi hubungan baik. Bisnis di pesisir ini panjang urusannya kalau tak punya kawan."',
    choices: [
      {
        label: 'Beri harga kawan — jaga hubungan',
        hints: ['dana-', 'reputasi+'],
        effects: { dana: -4, reputasi: 4 },
        outcome:
          'Hendra pulang senang dan langsung bercerita ke koleganya betapa "enak diajak kerja sama" pemimpin baru ini. Kas kehilangan selisih sewa, tapi pintu-pintu bisnis lain mulai terbuka.',
      },
      {
        label: 'Tarif tetap sesuai aturan, tanpa kecuali',
        hints: ['dana+', 'reputasi-'],
        effects: { dana: 5, reputasi: -3 },
        outcome:
          '"Jadi begitu ya caranya main," kata Hendra sambil tetap tersenyum — senyum yang tak sampai ke mata. Kas aman, aturan tegak. Tapi kau baru saja membuat pengusaha paling berpengaruh di Muara sedikit tersinggung.',
      },
    ],
  },
  {
    id: 'subsidi-solar',
    phase: 1,
    title: 'Solar untuk Perahu Kecil',
    speaker: 'mbok-sari',
    text:
      'Mbok Sari datang mewakili kelompok nelayan kecil. Harga solar eceran melonjak; banyak perahu memilih tak melaut karena biaya melebihi hasil tangkapan. "Kami tak minta dikasihani, Nak. Cuma minta pelabuhan buka pojok solar bersubsidi seperti zaman dulu."',
    choices: [
      {
        label: 'Buka pos solar bersubsidi untuk nelayan terdaftar',
        hints: ['dana-', 'komunitas+'],
        cost: 6,
        effects: { komunitas: 8 },
        outcome:
          'Antrean jeriken mengular tertib di pos baru. Perahu-perahu kembali melaut sebelum subuh. Di pasar, ikan segar melimpah lagi — dan nama pelabuhan disebut dalam syukur para istri nelayan.',
      },
      {
        label: 'Tolak halus: kas belum memungkinkan',
        hints: ['komunitas-'],
        effects: { komunitas: -5 },
        outcome:
          'Mbok Sari mengangguk pelan, terlalu sopan untuk memaksa. "Ya sudah, Nak. Kami cari jalan sendiri." Kalimat itu lebih berat dari demonstrasi.',
      },
      {
        label: 'Gandeng Pak Hendra jadi sponsor solar',
        hints: ['komunitas+', 'reputasi-'],
        effects: { komunitas: 5, dana: -2, reputasi: -2 },
        outcome:
          'Hendra setuju menanggung separuh biaya — dengan spanduk namanya terpampang besar di pos solar. Nelayan terbantu, meski ada yang berbisik: "Sekarang minyak pun ada tuannya."',
      },
    ],
  },
  {
    id: 'uang-lembur',
    phase: 1,
    title: 'Amplop Lembur yang Tipis',
    speaker: 'warga',
    text:
      'Sekelompok buruh bongkar-muat menghadap sore-sore. Bicaranya sopan tapi jelas: uang lembur tiga bulan terakhir dibayar setengah oleh manajemen lama, dan mereka berharap pemimpin baru meluruskannya. "Kami tak mau ribut, Pak/Bu. Kami cuma mau yang jadi hak kami."',
    choices: [
      {
        label: 'Lunasi semua tunggakan sekarang juga',
        hints: ['dana-', 'sdm+'],
        cost: 7,
        effects: { sdm: 9, komunitas: 2 },
        outcome:
          'Amplop-amplop dibagikan langsung dari tanganmu. Beberapa buruh tua sampai memeriksa isinya dua kali, tak percaya. Esoknya, entah kenapa, bongkar-muat selesai lebih cepat dari biasa.',
      },
      {
        label: 'Cicil bertahap sambil audit dulu',
        hints: ['sdm+', 'dana-'],
        cost: 3,
        effects: { sdm: 4 },
        outcome:
          'Kau janjikan pelunasan bertahap dengan jadwal tertulis. Tak semegah harapan mereka, tapi janji yang ditulis dan ditandatangani lebih berharga daripada janji manis manajemen lama.',
      },
      {
        label: 'Itu utang manajemen lama, bukan urusanku',
        hints: ['sdm-'],
        effects: { sdm: -7 },
        outcome:
          'Wajah-wajah itu mengeras. Mereka pamit dengan sopan yang dingin. Malamnya, di pos jaga, kata "sama saja" terdengar berulang-ulang seperti mantra.',
      },
    ],
  },
  {
    id: 'kunjungan-sekolah',
    phase: 1,
    title: 'Surat dari SD Muara',
    speaker: 'warga',
    text:
      'Sepucuk surat bertulisan tangan rapi datang dari SD Negeri Muara: murid kelas enam ingin belajar tentang pelabuhan untuk tugas IPS. Mereka minta izin berkunjung — gratis tentu saja, sekolah tak punya anggaran. Kepala sekolahnya menambahkan: "Anak-anak ini kelak yang menjaga pelabuhan kita."',
    choices: [
      {
        label: 'Sambut besar-besaran: tur, helm kecil, sesi tanya-jawab',
        hints: ['dana-', 'komunitas+', 'reputasi+'],
        cost: 3,
        effects: { komunitas: 5, reputasi: 4 },
        outcome:
          'Empat puluh bocah berhelm proyek terlalu besar berbaris takjub di dermaga. Seorang anak bertanya kenapa air laut asin; seisi pelabuhan tertawa. Foto kunjungan itu terpajang di ruang guru — dan di hati warga.',
      },
      {
        label: 'Izinkan tur singkat tanpa biaya tambahan',
        hints: ['komunitas+'],
        effects: { komunitas: 3 },
        outcome:
          'Petugas jaga merangkap pemandu dadakan selama sejam. Sederhana, tapi anak-anak pulang dengan cerita. Kadang cukup segitu.',
      },
      {
        label: 'Tolak: pelabuhan bukan tempat wisata anak',
        hints: ['komunitas-'],
        effects: { komunitas: -4, reputasi: -2 },
        outcome:
          'Surat balasanmu singkat dan resmi. Di kampung, penolakan pada anak sekolah dasar adalah jenis berita yang menyebar paling cepat dan dikenang paling lama.',
      },
    ],
  },
  {
    id: 'riset-karang',
    phase: 1,
    title: 'Proposal Transplantasi Karang',
    speaker: 'dr-laut',
    text:
      'Dr. Laut menggelar peta terumbu di mejamu. Gosong karang di mulut teluk — pemecah ombak alami pelabuhan — memutih di tiga titik. Ia mengajukan program transplantasi karang dengan melibatkan nelayan sebagai perawat terumbu. "Ini investasi, bukan biaya. Karang sehat itu tanggul gratis."',
    choices: [
      {
        label: 'Danai penuh programnya',
        hints: ['dana-', 'lingkungan+'],
        cost: 6,
        effects: { lingkungan: 8, komunitas: 2 },
        outcome:
          'Rak-rak besi ditanam, bibit karang diikat satu-satu oleh tangan nelayan yang biasa mengikat jaring. Dr. Laut menyelam memeriksa hasilnya dan muncul sambil mengacungkan jempol tinggi-tinggi.',
      },
      {
        label: 'Danai separuh, sisanya cari sponsor',
        hints: ['dana-', 'lingkungan+'],
        cost: 3,
        effects: { lingkungan: 4 },
        outcome:
          'Program jalan dengan skala setengah. Dr. Laut menulis proposal sponsor sambil menggerutu ilmiah — tapi bibit pertama tetap tertanam, dan itu yang penting.',
      },
      {
        label: 'Tunda: karang tak bisa dimakan',
        hints: ['lingkungan-'],
        effects: { lingkungan: -3, reputasi: -2 },
        outcome:
          '"Karang memang tak bisa dimakan," kata Dr. Laut sambil menggulung petanya, "tapi ikan yang kalian makan tinggal di sana." Ia pamit dengan punggung yang kecewa.',
      },
    ],
  },
  {
    id: 'pungli-gerbang',
    phase: 1,
    title: 'Pungli di Gerbang',
    speaker: 'petugas',
    text:
      'Laporan masuk: sopir-sopir truk mengeluh ada "uang rokok" tak resmi di gerbang masuk — sepuluh ribu di sini, dua puluh ribu di sana. Kecil-kecil, tapi tiap hari, dan kabarnya sebagian petugas gerbang menganggap itu "sudah dari sananya".',
    choices: [
      {
        label: 'Sidak mendadak, pecat yang tertangkap',
        hints: ['reputasi+', 'sdm-'],
        effects: { reputasi: 6, sdm: -4 },
        outcome:
          'Dua petugas tertangkap tangan dan diberhentikan hari itu juga. Sopir-sopir bersorak; sebagian pekerja lain justru gelisah — hukuman tegas tanpa peringatan membuat semua orang merasa diintai.',
      },
      {
        label: 'Benahi sistem: pasang tarif resmi & CCTV, beri peringatan',
        hints: ['dana-', 'reputasi+', 'sdm+'],
        cost: 5,
        effects: { reputasi: 4, sdm: 3 },
        outcome:
          'Papan tarif resmi dipasang besar-besar, CCTV menyala, dan petugas diberi kesempatan memperbaiki diri. Pungli mati pelan-pelan bukan karena takut, tapi karena tak ada lagi ruang gelapnya.',
      },
      {
        label: 'Biarkan — uang rokok pelumas ekonomi',
        hints: ['reputasi-'],
        effects: { reputasi: -5, dana: 2 },
        outcome:
          'Semua berjalan "lancar" seperti biasa. Tapi sopir-sopir punya grup WhatsApp, dan nama Muara Harapan mulai muncul di sana dengan emoji yang tidak menyenangkan.',
      },
    ],
  },
  {
    id: 'lampu-navigasi',
    phase: 1,
    title: 'Lampu Navigasi Padam',
    speaker: 'petugas',
    text:
      'Tiga dari lima lampu suar penuntun alur masuk padam dimakan usia. Malam-malam berkabut begini, kapal masuk mengandalkan feeling dan doa. "Belum ada kejadian sih, Pak/Bu," lapor petugas, lalu menambahkan pelan, "...belum."',
    choices: [
      {
        label: 'Ganti semua dengan lampu LED tenaga surya',
        hints: ['dana-', 'infrastruktur+'],
        cost: 7,
        effects: { infrastruktur: 8, lingkungan: 1 },
        outcome:
          'Lampu-lampu baru menyala terang tanpa biaya listrik bulanan. Nakhoda-nakhoda tua bilang alur Muara sekarang "seperti landasan bandara". Investasi yang menyenangkan semua orang — kecuali bendahara, sesaat.',
      },
      {
        label: 'Perbaiki darurat seadanya',
        hints: ['dana-', 'infrastruktur+'],
        cost: 3,
        effects: { infrastruktur: 4 },
        outcome:
          'Teknisi menyulap lampu bekas dan kabel sisa jadi penerangan darurat. Menyala — kadang berkedip dramatis saat hujan. Cukup untuk sekarang; "sekarang" adalah kata favorit anggaran tipis.',
      },
      {
        label: 'Tunda ke anggaran tahun depan',
        hints: ['infrastruktur-', 'risiko'],
        effects: { infrastruktur: -4, reputasi: -2 },
        outcome:
          'Malam-malam berikutnya, kapal-kapal masuk lebih pelan dan klaksonnya lebih sering. Para nakhoda mulai bertukar cerita tentang alur Muara yang "menantang". Reputasi semacam itu menyebar cepat di radio kapal.',
      },
    ],
  },

  // ───────────────────────── FASE 2 (hari 11–20) ─────────────────────────
  {
    id: 'trawl-liar',
    phase: 2,
    title: 'Trawl di Zona Terlarang',
    speaker: 'mbok-sari',
    text:
      'Mbok Sari datang gemetar menahan marah: dua kapal trawl bermesin besar menyapu zona tangkap nelayan kecil semalaman. Jaring-jaring tradisional rusak digilas, dan dasar laut dikeruk gundul. "Kalau pelabuhan diam, minggu depan mereka bawa empat kapal. Bulan depan, kampung ini makan apa?"',
    choices: [
      {
        label: 'Kejar dan usir dengan kapal patroli, laporkan ke PSDKP',
        hints: ['dana-', 'lingkungan+', 'komunitas+'],
        cost: 5,
        effects: { lingkungan: 6, komunitas: 7, sdm: -2 },
        outcome:
          'Patroli gabungan memergoki trawl itu tengah beroperasi. Satu kapal kabur, satunya digelandang dengan barang bukti. Video pengejarannya direkam nelayan — malam itu seisi kampung menontonnya berulang-ulang sambil bersorak.',
      },
      {
        label: 'Kirim peringatan lewat radio, tanpa konfrontasi',
        hints: ['komunitas+'],
        effects: { komunitas: 2, lingkungan: -2 },
        outcome:
          'Peringatanmu mengudara. Kapal trawl menjauh... beberapa mil, lalu melanjutkan di tempat yang tak terlihat dari menara. Nelayan menghargai niatmu — tapi jaring mereka tetap kosong.',
      },
      {
        label: 'Abaikan: itu wewenang pusat, bukan pelabuhan',
        hints: ['komunitas-', 'lingkungan-'],
        effects: { komunitas: -7, lingkungan: -4 },
        outcome:
          'Secara hukum kau benar; secara apa pun yang lain, tidak. Trawl makin berani mendekat. Di kampung, orang mulai menghitung: sudah berapa kali pelabuhan bilang "bukan wewenang kami".',
      },
    ],
  },
  {
    id: 'tawaran-limbah',
    phase: 2,
    title: 'Kiriman Tengah Malam',
    speaker: 'pak-hendra',
    text:
      'Pak Hendra datang malam-malam, tanpa senyum dagangnya yang biasa. Sebuah pabrik pengolahan di hulu — koleganya — kelebihan limbah cair dan butuh "jalur pembuangan praktis" lewat perairan pelabuhan. Bayarannya per tangki, tunai, rutin tiap minggu. "Tak ada yang perlu tahu. Arus laut itu pelupa," katanya pelan.',
    choices: [
      {
        label: 'Tolak dan ancam laporkan pabriknya',
        hints: ['lingkungan+', 'reputasi+', 'dana-'],
        effects: { lingkungan: 4, reputasi: 4, dana: -3 },
        outcome:
          'Kau menolak di tempat dan menelepon dinas lingkungan esok paginya. Hendra pergi tanpa berjabat tangan. Beberapa kontrak kecil batal minggu itu — harga yang pantas untuk teluk yang tetap hidup.',
      },
      {
        label: 'Terima diam-diam: kas sedang butuh',
        hints: ['dana+', 'lingkungan-', 'risiko'],
        effects: { dana: 12 },
        setFlag: 'dumping',
        startScenario: 'pencemaran-teluk',
        outcome:
          'Truk tangki pertama datang pukul dua pagi, membuang muatannya pelan-pelan di ujung dermaga. Uangnya nyata dan langsung. Lautnya juga nyata — dan laut, kata orang tua dulu, tak pernah benar-benar pelupa.',
      },
    ],
  },
  {
    id: 'demo-debu',
    phase: 2,
    title: 'Demo Debu Batu Bara',
    speaker: 'warga',
    text:
      'Puluhan warga berkumpul di gerbang membawa spanduk dan jemuran yang menghitam. Bongkar-muat batu bara curah minggu ini membuat debu hitam beterbangan ke pemukiman. Anak-anak mulai batuk. "Kami bukan anti pelabuhan," teriak koordinatornya, "kami cuma mau bernapas!"',
    choices: [
      {
        label: 'Hentikan bongkar batu bara sampai ada penutup terpal & penyiraman',
        hints: ['dana-', 'komunitas+', 'lingkungan+'],
        cost: 6,
        effects: { komunitas: 8, lingkungan: 4, dana: -3 },
        outcome:
          'Kau temui massa tanpa pengeras suara, lalu perintahkan bongkar dihentikan sampai standar debu terpenuhi. Kapal menunggu dua hari ekstra dan dendanya tidak kecil — tapi jemuran kampung kembali putih, dan itu jadi cerita yang dibawa pulang.',
      },
      {
        label: 'Janjikan perbaikan bertahap, bongkar jalan terus',
        hints: ['dana+', 'komunitas-'],
        effects: { dana: 4, komunitas: -5, lingkungan: -2 },
        outcome:
          'Massa membubarkan diri dengan setengah hati setelah kau berjanji "akan dikaji". Bongkar-muat jalan terus, kas aman. Tapi kata "dikaji" baru saja masuk daftar kata yang tak dipercaya warga.',
      },
      {
        label: 'Panggil aparat untuk membubarkan demo',
        hints: ['komunitas-', 'reputasi-'],
        effects: { komunitas: -9, reputasi: -4, dana: 4 },
        outcome:
          'Barisan aparat datang; massa bubar tanpa perlawanan — sambil merekam semuanya. Malam itu video "pelabuhan usir warganya sendiri" beredar. Bongkar-muat lancar; kepercayaan tidak.',
      },
    ],
  },
  {
    id: 'wartawan-investigasi',
    phase: 2,
    title: 'Wartawan di Gerbang',
    speaker: 'petugas',
    text:
      'Seorang jurnalis media nasional meminta akses liputan penuh: dapur pelabuhan, pembukuan retribusi, wawancara buruh tanpa didampingi. "Kalau ditolak, saya tetap menulis," katanya kalem, "hanya saja tanpa versi Anda di dalamnya."',
    choices: [
      {
        label: 'Buka semua pintu, dampingi seperlunya',
        hints: ['reputasi+', 'risiko'],
        effects: { reputasi: 6, sdm: 2 },
        outcome:
          'Ia mengubek-ubek selama dua hari dan menemukan yang baik maupun yang belum baik. Artikelnya panjang, adil, dan berjudul "Pelabuhan Kecil yang Tak Takut Ditanya". Kau tak bisa membeli judul seperti itu.',
      },
      {
        label: 'Beri tur terkurasi dan rilis resmi saja',
        hints: ['reputasi+'],
        effects: { reputasi: 2 },
        outcome:
          'Ia mengikuti turmu dengan sopan, memotret yang kau tunjukkan, lalu menulis artikel yang... datar. Aman. Tak ada yang salah — juga tak ada yang diingat pembaca esok harinya.',
      },
      {
        label: 'Tolak: pelabuhan sedang sibuk',
        hints: ['reputasi-'],
        effects: { reputasi: -6 },
        outcome:
          'Artikelnya terbit tiga hari kemudian: "Ada Apa di Muara Harapan? Pelabuhan yang Menutup Pintu". Isinya kumpulan keluhan pihak luar — karena satu-satunya pihak yang menolak bicara adalah kau.',
      },
    ],
  },
  {
    id: 'docking-darurat',
    phase: 2,
    title: 'Kapal Asing Minta Sandar Darurat',
    speaker: 'petugas',
    text:
      'Kapal kargo berbendera asing mengalami kerusakan mesin dan meminta sandar darurat untuk perbaikan — tiga hari, di dermaga utama yang sedang padat jadwal. Konvensi laut mewajibkan pertolongan; jadwal bongkar-muat dan kas berkata lain. Nakhodanya menawarkan bayaran standar, tak lebih.',
    choices: [
      {
        label: 'Terima penuh sesuai etika pelaut',
        hints: ['reputasi+', 'dana-'],
        effects: { reputasi: 7, dana: -5, sdm: 2 },
        outcome:
          'Tiga hari dermaga utama tersita dan dua kapal langgananmu mengalihkan muatan. Saat berlayar pergi, kapal itu mengibarkan bendera "terima kasih" — dan cerita tentang pelabuhan kecil yang memegang etika laut mulai berlayar lebih jauh dari kapalnya.',
      },
      {
        label: 'Terima dengan tarif darurat premium',
        hints: ['dana+', 'reputasi-'],
        effects: { dana: 8, reputasi: -4 },
        outcome:
          'Kau menyebut angka; nakhoda itu menatapmu lama sebelum menandatangani — ia tak punya pilihan, dan kalian berdua tahu itu. Kas terisi. Di dunia pelayaran, cerita tentang "pelabuhan pemerus kapal mogok" juga terisi.',
      },
      {
        label: 'Arahkan ke pelabuhan lain yang lebih lapang',
        hints: ['netral'],
        effects: { reputasi: -2 },
        outcome:
          'Dengan mesin darurat, kapal itu terseok ke pelabuhan sebelah — tiba selamat, untungnya. Jadwalmu aman. Hanya saja, buku catatan para nakhoda mencatat pelabuhan mana yang bilang "maaf, penuh" saat mereka pincang.',
      },
    ],
  },
  {
    id: 'serikat-buruh',
    phase: 2,
    title: 'Kelahiran Serikat Pekerja',
    speaker: 'warga',
    text:
      'Para buruh mengumumkan pembentukan Serikat Pekerja Muara Harapan. Tuntutan pertamanya masuk akal: kontrak tertulis untuk buruh harian dan jaminan kecelakaan kerja. Manajer operasional lama berbisik cemas: "Kalau diakui, nanti mereka minta macam-macam."',
    choices: [
      {
        label: 'Akui serikat, ajak duduk satu meja',
        hints: ['sdm+', 'dana-'],
        cost: 4,
        effects: { sdm: 9, komunitas: 3 },
        outcome:
          'Rapat pertama serikat dan manajemen berlangsung kaku... selama sepuluh menit, sebelum kopi datang dan orang-orang mulai bicara seperti manusia. Kontrak tertulis pertama diteken minggu itu. Pekerja yang merasa aman bekerja dua kali lebih ikhlas.',
      },
      {
        label: 'Tunda pengakuan: pelajari dulu aturannya',
        hints: ['sdm-'],
        effects: { sdm: -4 },
        outcome:
          '"Dipelajari" — kata yang sama yang dipakai manajemen lama bertahun-tahun. Para pengurus serikat mencatat tanggal pertemuan itu baik-baik. Mereka sabar; kesabaran serikat selalu ada bukunya.',
      },
      {
        label: 'Halangi diam-diam: dekati tokoh-tokohnya satu per satu',
        hints: ['sdm-', 'risiko'],
        effects: { sdm: -6, dana: -2 },
        outcome:
          'Amplop dan janji promosi berpindah tangan. Dua tokoh melunak; sisanya justru mengeras dan kini punya bukti pelabuhan main kotor. Api yang kau siram bensin pelan-pelan ini tinggal menunggu angin.',
      },
    ],
  },
  {
    id: 'rob-kampung',
    phase: 2,
    title: 'Rob Merendam Kampung',
    speaker: 'mbok-sari',
    text:
      'Pasang purnama plus gelombang tinggi: banjir rob merendam kampung pesisir selutut. Dapur-dapur padam, anak-anak digendong ke musala di dataran tinggi. Mbok Sari datang basah kuyup: "Pompa dan genset pelabuhan menganggur malam ini, Nak. Kampung cuma pinjam sampai air surut."',
    choices: [
      {
        label: 'Kirim pompa, genset, dan relawan pekerja sekarang',
        hints: ['dana-', 'komunitas+', 'sdm-'],
        cost: 5,
        effects: { komunitas: 10, sdm: -3, reputasi: 3 },
        outcome:
          'Sepanjang malam pompa pelabuhan menderu di gang-gang kampung, pekerja bergantian mengangkut lansia. Subuh-subuh air surut. Tak ada spanduk terima kasih — hanya, sejak hari itu, tak ada satu pun urusan pelabuhan yang tak dibantu warga.',
      },
      {
        label: 'Pinjamkan alat saja, tanpa personel',
        hints: ['komunitas+'],
        effects: { komunitas: 4 },
        outcome:
          'Pompa diantar ke posko lalu ditinggal. Warga mengoperasikannya sebisanya. Terbantu, jelas — tapi yang paling diingat orang saat air naik bukan alatnya, melainkan siapa yang datang.',
      },
      {
        label: 'Tolak: alat harus siaga untuk pelabuhan sendiri',
        hints: ['komunitas-'],
        effects: { komunitas: -8 },
        outcome:
          'Secara prosedur kau tak salah. Malam itu dari menara pandang, lampu-lampu kampung padam satu per satu tergenang — dan pelabuhan berdiri terang benderang di sebelahnya, kering, dan sendirian.',
      },
    ],
  },
  {
    id: 'tender-perbaikan',
    phase: 2,
    title: 'Dua Amplop Penawaran',
    speaker: 'petugas',
    text:
      'Tender perbaikan gudang timur masuk dua penawaran. CV Cahaya Muara: kontraktor lokal, harga wajar, pekerjanya warga kampung sendiri. PT Beton Perkasa: perusahaan kota, lebih murah 30%, tapi reputasinya suka "menyesuaikan" ketebalan beton. Keputusan di tanganmu.',
    choices: [
      {
        label: 'Pilih kontraktor lokal yang jujur',
        hints: ['dana-', 'infrastruktur+', 'komunitas+'],
        cost: 7,
        effects: { infrastruktur: 8, komunitas: 4 },
        outcome:
          'Pekerjaan berjalan tanpa drama: beton sesuai takaran, upah mengalir ke dapur-dapur kampung, dan mandornya melapor tiap sore tanpa diminta. Gudang timur berdiri kokoh — dibangun tangan-tangan yang ikut memilikinya.',
      },
      {
        label: 'Pilih yang murah, awasi ketat',
        hints: ['dana-', 'infrastruktur+', 'risiko'],
        cost: 4,
        effects: { infrastruktur: 5, sdm: -2 },
        outcome:
          'Kau tugaskan dua pengawas melotot ke setiap adukan semen. Hasilnya lumayan — sejauh yang bisa dilihat mata. Pengawasmu lelah, kontraktornya tersinggung, dan entah kenapa kau tetap mengetuk-ngetuk dinding itu setiap lewat.',
      },
    ],
  },
  {
    id: 'penyu-bertelur',
    phase: 2,
    title: 'Penyu di Lahan Perluasan',
    speaker: 'dr-laut',
    text:
      'Dr. Laut berlari masuk tanpa mengetuk: sekawanan penyu sisik — satwa dilindungi — mendarat bertelur di gosong pasir yang masuk rencana perluasan area penumpukan. "Lokasi peneluran seperti ini muncul sekali dalam belasan tahun! Tapi saya tahu petak itu sudah masuk gambar kerjamu."',
    choices: [
      {
        label: 'Batalkan perluasan, jadikan kawasan lindung mini',
        hints: ['lingkungan+', 'reputasi+', 'dana-'],
        effects: { lingkungan: 9, reputasi: 5, dana: -5, infrastruktur: -3 },
        outcome:
          'Petak itu dipagari bambu dan diberi papan: "Zona Peneluran — Harap Senyap". Relawan kampung bergiliran jaga malam. Berita penyu Muara sampai ke media nasional; rencana perluasan kembali ke meja gambar.',
      },
      {
        label: 'Tunda proyek sampai musim penetasan usai',
        hints: ['lingkungan+'],
        effects: { lingkungan: 4, dana: -2 },
        outcome:
          'Kompromi ala birokrat: proyek mundur dua bulan, penyu menetas tenang musim ini. Dr. Laut lega separuh — "Tahun depan mereka kembali ke sini lagi, lalu bagaimana?" Pertanyaan itu kau simpan di laci.',
      },
      {
        label: 'Proyek jalan terus: relokasi telur ke penangkaran',
        hints: ['infrastruktur+', 'lingkungan-'],
        effects: { infrastruktur: 5, lingkungan: -7, reputasi: -3 },
        outcome:
          'Telur-telur dipindah hati-hati ke kotak penetasan; sebagian menetas, sebagian tidak. Perluasan jalan sesuai jadwal. Di jurnalnya, Dr. Laut menulis satu kalimat yang tak ia tunjukkan padamu.',
      },
    ],
  },
  {
    id: 'ikan-mati',
    phase: 2,
    title: 'Ikan Mati Mengambang',
    speaker: 'dr-laut',
    text:
      'Pagi ini permukaan teluk barat dipenuhi ikan mati berperut putih. Warga panik; pembeli di pasar mulai ragu pada semua ikan Muara. Dr. Laut mengambil sampel air: "Butuh uji lab untuk tahu penyebabnya. Tapi begitu hasilnya keluar, apapun isinya, semua orang akan menuntut jawaban darimu."',
    choices: [
      {
        label: 'Uji lab terbuka, umumkan apa pun hasilnya',
        hints: ['dana-', 'reputasi+', 'lingkungan+'],
        cost: 5,
        effects: { reputasi: 6, lingkungan: 5 },
        outcome:
          'Hasil lab keluar tiga hari kemudian dan diumumkan di papan pasar: ledakan alga akibat limbah hulu — bukan dari pelabuhan. Karena kau yang pertama membuka data, orang percaya. Pasar pulih; teluk mulai dipantau rutin.',
      },
      {
        label: 'Bersihkan cepat-cepat sebelum wartawan datang',
        hints: ['lingkungan-', 'risiko'],
        effects: { lingkungan: -4, reputasi: 2 },
        outcome:
          'Bangkai ikan terangkut habis sebelum siang; foto-foto yang sempat beredar dibantah "sudah ditangani". Penyebabnya? Tak pernah dicari. Teluk menyimpan pertanyaannya di dasar — teluk selalu menagih di kemudian hari.',
      },
    ],
  },
  {
    id: 'beasiswa-pelaut',
    phase: 2,
    title: 'Anak Kampung Lolos Akademi',
    speaker: 'mbok-sari',
    text:
      'Kabar gembira mampir: tiga anak nelayan lolos seleksi Akademi Pelayaran di Semarang — pertama kalinya dalam sejarah kampung. Masalahnya klasik: biaya. Mbok Sari datang bukan menuntut, hanya bercerita, dengan mata yang tahu persis apa yang sedang ia lakukan.',
    choices: [
      {
        label: 'Beri beasiswa penuh atas nama pelabuhan',
        hints: ['dana-', 'komunitas+', 'reputasi+'],
        cost: 8,
        effects: { komunitas: 9, reputasi: 4 },
        outcome:
          'Tiga anak itu dilepas seisi kampung di dermaga, menenteng tas kardus dan surat beasiswa berkop pelabuhan. "Kelak mereka pulang bawa ilmu," kata Mbok Sari. Investasi yang baru cair sepuluh tahun lagi — tapi bunganya sudah terasa hari ini.',
      },
      {
        label: 'Fasilitasi pinjaman lunak koperasi',
        hints: ['komunitas+'],
        effects: { komunitas: 4, dana: -2 },
        outcome:
          'Skema pinjaman tanpa bunga disusun; orang tua mereka menandatangani dengan tangan gemetar. Bukan hadiah, tapi jalan — dan kadang jalan lebih dihargai daripada hadiah.',
      },
      {
        label: 'Doakan saja: pendidikan bukan pos anggaran pelabuhan',
        hints: ['komunitas-'],
        effects: { komunitas: -5 },
        outcome:
          'Dua dari tiga anak itu akhirnya berangkat — dibiayai patungan kampung dan gadai perahu. Satu lagi tinggal, membantu bapaknya menjaring. Setiap melihatnya di dermaga, entah kenapa kau berpaling duluan.',
      },
    ],
  },

  // ───────────────────────── FASE 3 (hari 21–29) ─────────────────────────
  {
    id: 'kpk-datang',
    phase: 3,
    requiresFlag: 'suap',
    title: 'Tamu dari Jakarta',
    speaker: 'petugas',
    text:
      'Dua orang berkemeja putih menunjukkan surat tugas KPK: penyelidikan aliran dana tak wajar di pelabuhan — termasuk "uang damai" yang dulu kau terima. Mereka sopan, terlalu sopan. "Kami hanya butuh kejujuran Saudara. Sisanya biar dokumen yang bicara."',
    choices: [
      {
        label: 'Akui semuanya, kembalikan uangnya, terima sanksi',
        hints: ['dana-', 'reputasi-', 'sdm+'],
        effects: { dana: -12, reputasi: -6, sdm: 5, komunitas: 4 },
        outcome:
          'Pengakuanmu mengejutkan bahkan penyidiknya. Uang dikembalikan, teguran keras diterima, dan kau tetap menjabat dengan status "diawasi". Anehnya, di mata pekerja dan warga, pemimpin yang berani mengaku salah justru naik derajat.',
      },
      {
        label: 'Bantah dan rapikan dokumen sebisanya',
        hints: ['risiko', 'reputasi-'],
        effects: { reputasi: -10, sdm: -5, dana: -5 },
        outcome:
          'Dokumen bisa dirapikan; ingatan saksi tidak. Penyelidikan menggantung sebagai awan gelap di atas pelabuhan — setiap tamu berkemeja putih kini membuat seisi kantor menahan napas.',
      },
    ],
  },
  {
    id: 'demo-reklamasi',
    phase: 3,
    requiresFlag: 'reklamasi',
    title: 'Kampung Melawan Reklamasi',
    speaker: 'warga',
    text:
      'Tiang pancang reklamasi pertama tiba — dan kampung pesisir menyambutnya dengan barisan perahu memblokade lokasi. Mbok Sari berdiri di haluan paling depan. Konsorsium menelepon: "Bereskan gangguan itu, atau denda keterlambatan berlaku." Di seberang sana, spanduk bertuliskan: LAUT KAMI BUKAN TANAH KOSONG.',
    choices: [
      {
        label: 'Hentikan proyek: batalkan kontrak, tanggung dendanya',
        hints: ['dana-', 'komunitas+', 'lingkungan+'],
        cost: 10,
        effects: { komunitas: 10, lingkungan: 6, reputasi: -4 },
        outcome:
          'Kau naik ke perahu Mbok Sari dan mengumumkan pembatalan lewat toa. Sorak-sorai menggetarkan air. Dendanya melukai kas dan investor mengamuk di koran ekonomi — tapi malam itu, untuk pertama kalinya sejak kontrak diteken, kau tidur nyenyak.',
      },
      {
        label: 'Nego: kecilkan skala, beri kompensasi nelayan',
        hints: ['dana-', 'komunitas+'],
        cost: 6,
        effects: { komunitas: 3, dana: 2, lingkungan: -3 },
        outcome:
          'Setelah tiga hari mediasi, skala reklamasi dipangkas separuh dan nelayan terdampak dapat kompensasi. Blokade bubar dengan gumaman. Tak ada yang puas penuh — kompromi memang begitu bentuknya.',
      },
      {
        label: 'Proyek jalan terus: masa depan menuntut korban',
        hints: ['dana+', 'komunitas-', 'risiko'],
        effects: { dana: 10, infrastruktur: 5, komunitas: -12, lingkungan: -6 },
        outcome:
          'Dengan pengawalan, tiang pancang pertama menghunjam dasar teluk. Dari menara kau bisa melihat perahu-perahu itu bertahan sampai senja, lalu pulang satu-satu. Ada yang patah hari itu, dan bukan cuma karang.',
      },
    ],
  },
  {
    id: 'ultimatum-serikat',
    phase: 3,
    title: 'Ultimatum Tengah Malam',
    speaker: 'warga',
    text:
      'Pengurus serikat datang tengah malam dengan wajah orang yang sudah lama tak tidur: kenaikan tunjangan risiko atau mogok total 48 jam mulai besok pagi — tepat saat dua kapal besar dijadwalkan sandar. "Kami tak menikmati ini, Pak/Bu. Tapi anggota kami memaksa, dan mereka benar."',
    choices: [
      {
        label: 'Penuhi tuntutan: mereka memang layak',
        hints: ['dana-', 'sdm+'],
        cost: 9,
        effects: { sdm: 10, komunitas: 3 },
        outcome:
          'Kesepakatan diteken pukul tiga pagi di atas meja pos jaga, disaksikan termos kopi. Paginya kedua kapal dilayani kru yang bekerja seperti sedang membalas budi. Mahal? Ya. Tapi mogok yang batal jauh lebih mahal.',
      },
      {
        label: 'Tawar setengah, sisanya bulan depan',
        hints: ['sdm+', 'dana-'],
        cost: 5,
        effects: { sdm: 4 },
        outcome:
          'Serikat menerima dengan syarat tertulis dan saksi. Kepercayaan belum pulih penuh — mereka pernah kenyang janji — tapi angka yang cair hari ini adalah bahasa yang semua orang pahami.',
      },
      {
        label: 'Tolak dan siapkan tenaga pengganti dari luar',
        hints: ['sdm-', 'komunitas-', 'risiko'],
        effects: { sdm: -10, komunitas: -5, dana: -4 },
        outcome:
          'Mogok pecah. Tenaga luar yang kau datangkan tak paham denah gudang, salah menumpuk kontainer, dan dua kapal pergi tanpa bongkar. Di gerbang, buruhmu sendiri menonton kekacauan itu tanpa berkedip.',
      },
    ],
  },
  {
    id: 'pinjam-derek',
    phase: 3,
    title: 'SOS dari Pelabuhan Tetangga',
    speaker: 'petugas',
    text:
      'Pelabuhan Tanjung Sekar — rival abadi sekaligus tetangga terdekat — dihantam kebakaran gudang. Dereknya rusak, antrean kapalnya mengular. Kepala pelabuhannya, yang dulu menyindirmu di rapat provinsi, kini menelepon dengan suara tercekat: "Pinjami kami derek apung tiga hari. Tolong."',
    choices: [
      {
        label: 'Kirim derek beserta operator terbaikmu',
        hints: ['reputasi+', 'dana-'],
        effects: { reputasi: 8, dana: -5, infrastruktur: -2 },
        outcome:
          'Derek apungmu menyeberang teluk sore itu juga. Tiga hari kemudian ia pulang membawa surat terima kasih resmi — dan sekeranjang durian dari kepala pelabuhan yang dulu sinis. Di rapat provinsi berikutnya, ceritanya sudah berbeda.',
      },
      {
        label: 'Sewakan dengan tarif komersial penuh',
        hints: ['dana+', 'reputasi-'],
        effects: { dana: 7, reputasi: -3 },
        outcome:
          'Kontrak sewa diteken dalam keadaan terpaksa. Derek pulang membawa uang, bukan durian. Antar pelabuhan kini berlaku tarif, bukan persaudaraan — dan suatu hari nanti, entah kapan, kau juga akan butuh pertolongan.',
      },
      {
        label: 'Tolak: musim badai begini derek tak boleh keluar',
        hints: ['netral'],
        effects: { reputasi: -4 },
        outcome:
          'Alasanmu masuk akal — badai memang mengintai. Tapi di pesisir, yang diingat orang bukan alasan; yang diingat adalah siapa datang saat asap masih mengepul.',
      },
    ],
  },
  {
    id: 'politisi-kampanye',
    phase: 3,
    title: 'Sang Calon dan Panggungnya',
    speaker: 'pak-hendra',
    text:
      'Pak Hendra mengantar tamu istimewa: calon anggota DPR yang butuh panggung kampanye "merakyat". Ia ingin foto ops di dermaga, membagikan sembako berstiker wajahnya, dan — ini intinya — dukungan terbukamu. Imbalannya: "perhatian khusus" untuk anggaran pelabuhan tahun depan.',
    choices: [
      {
        label: 'Tolak halus: pelabuhan netral, semua calon boleh berkunjung',
        hints: ['reputasi+', 'dana-'],
        effects: { reputasi: 5, dana: -3, komunitas: 2 },
        outcome:
          'Kau persilakan ia berkunjung "sebagaimana warga lainnya" — tanpa panggung, tanpa dukungan. Ia pergi dengan senyum kampanye yang mengeras. Anggaran "perhatian khusus" itu melayang; harga dirimu tidak.',
      },
      {
        label: 'Terima: dukungan ditukar anggaran',
        hints: ['dana+', 'reputasi-', 'risiko'],
        effects: { dana: 10, reputasi: -6, komunitas: -4 },
        setFlag: 'politik',
        outcome:
          'Fotomu bersalaman dengannya terpampang di baliho perempatan. Dana "aspirasi" mengalir cepat. Tapi kini setiap keputusanmu dibaca orang lewat kacamata: "Ini buat pelabuhan, atau buat bos barunya?"',
      },
      {
        label: 'Izinkan acaranya saja, tanpa pernyataan dukungan',
        hints: ['dana+'],
        effects: { dana: 4, reputasi: -2 },
        outcome:
          'Sembako berstiker dibagikan, foto-foto diambil, dan kau berdiri di posisi yang hati-hati: cukup dekat untuk sopan, cukup jauh untuk membantah. Politik memang seni mengatur jarak berdiri.',
      },
    ],
  },
  {
    id: 'pengungsi-pulau',
    phase: 3,
    title: 'Perahu-Perahu dari Pulau Kecil',
    speaker: 'mbok-sari',
    text:
      'Badai menghancurkan dermaga Pulau Serangan di seberang. Pagi ini belasan perahu pengungsi — lansia, anak-anak, ibu hamil — merapat ke Muara Harapan membawa apa yang sempat diselamatkan. Mbok Sari sudah membuka rumahnya. "Pelabuhan punya gudang kosong, Nak. Cuma butuh kata iya darimu."',
    choices: [
      {
        label: 'Buka gudang jadi posko, kerahkan dapur umum',
        hints: ['dana-', 'komunitas+', 'reputasi+'],
        cost: 7,
        effects: { komunitas: 9, reputasi: 5, sdm: -2 },
        outcome:
          'Gudang barat disulap jadi posko dalam tiga jam: terpal jadi sekat, dapur umum mengepul, pekerja pelabuhan menyumbang selimut. Muara Harapan malam itu bukan pelabuhan — ia harapan yang sesungguhnya, sesuai namanya.',
      },
      {
        label: 'Tampung sementara, koordinasikan ke pemda secepatnya',
        hints: ['komunitas+'],
        effects: { komunitas: 4, dana: -2 },
        outcome:
          'Dua hari mereka bernaung sebelum bus-bus pemda datang menjemput. Cukup layak, cukup manusiawi. "Terima kasih sudah tak menutup gerbang," kata seorang bapak tua — kalimat yang entah pujian entah bukan.',
      },
      {
        label: 'Arahkan langsung ke posko kecamatan: pelabuhan bukan pengungsian',
        hints: ['komunitas-', 'reputasi-'],
        effects: { komunitas: -9, reputasi: -5 },
        outcome:
          'Perahu-perahu itu melanjutkan perjalanan tiga kilometer lagi ke posko kecamatan. Semua sesuai prosedur. Berminggu-minggu kemudian, nelayan Muara masih menceritakan pagi itu — pagi ketika pelabuhan menunjuk arah lain kepada orang yang karam.',
      },
    ],
  },
  {
    id: 'gardu-kolaps',
    phase: 3,
    title: 'Gardu Tua di Ujung Tanduk',
    speaker: 'petugas',
    text:
      'Teknisi senior datang dengan wajah pucat: trafo gardu utama sudah bocor olinya dan bisa meledak kapan saja. Kalau gardu tewas, pendingin gudang ikan, lampu alur, dan derek listrik mati semua. Penggantian butuh biaya besar — atau bisa "ditunda dengan doa", istilah teknisi untuk gambling.',
    choices: [
      {
        label: 'Ganti trafo sekarang, berapapun biayanya',
        hints: ['dana-', 'infrastruktur+'],
        cost: 11,
        effects: { infrastruktur: 10, sdm: 2 },
        outcome:
          'Trafo baru terpasang dalam 36 jam kerja maraton. Saat dinyalakan dan dengungnya stabil, seisi ruang teknik bertepuk tangan. Kas terpukul telak — tapi pelabuhan yang gelap gulita akan memukul jauh lebih telak.',
      },
      {
        label: 'Servis besar untuk perpanjang umur setahun',
        hints: ['dana-', 'infrastruktur+', 'risiko'],
        cost: 5,
        effects: { infrastruktur: 4 },
        outcome:
          'Oli diganti, gulungan dibersihkan, sensor suhu dipasang. Teknisi senior menepuk trafo tua itu seperti menepuk kuda yang dipaksa lari setahun lagi. "Kuat, insyaallah. Asal jangan dibebani aneh-aneh."',
      },
      {
        label: 'Tunda: prioritas lain lebih mendesak',
        hints: ['infrastruktur-', 'risiko'],
        effects: { infrastruktur: -6, sdm: -2 },
        outcome:
          'Teknisi itu mengangguk patuh lalu memindahkan meja kerjanya menjauh dari gardu — sungguhan. Setiap dengung aneh kini membuat orang serempak menoleh. Bekerja di samping bom waktu ternyata melelahkan.',
      },
    ],
  },
  {
    id: 'film-dokumenter',
    phase: 3,
    title: 'Kamera dari Luar Negeri',
    speaker: 'dr-laut',
    text:
      'Lembaga konservasi internasional ingin memfilmkan Muara Harapan untuk dokumenter "Pelabuhan dan Laut yang Berbagi Napas" — potret pelabuhan kecil yang berjuang seimbang. Dr. Laut yang mengusulkan lokasinya. Syaratnya satu: akses penuh tanpa sensor, termasuk ke sudut-sudut yang tak kau banggakan.',
    choices: [
      {
        label: 'Terima tanpa syarat: tunjukkan apa adanya',
        hints: ['reputasi+', 'lingkungan+', 'risiko'],
        effects: { reputasi: 7, lingkungan: 4 },
        outcome:
          'Kamera menyorot mangrove muda dan karat derek dengan kejujuran yang sama. Hasilnya justru menyentuh: perjuangan nyata selalu lebih memikat daripada kesempurnaan palsu. Nama Muara Harapan kini dieja dengan benar di festival film Eropa.',
      },
      {
        label: 'Terima dengan daftar area terlarang',
        hints: ['reputasi+'],
        effects: { reputasi: 3 },
        outcome:
          'Film tetap dibuat, indah namun terasa seperti brosur. Sutradaranya pulang dengan sopan dan tak pernah mengirim kabar lagi. Kesempatan jarang mengetuk dua kali dengan kamera yang sama.',
      },
      {
        label: 'Tolak: terlalu berisiko dibuka-buka',
        hints: ['netral'],
        effects: { reputasi: -3, lingkungan: -1 },
        outcome:
          'Tim film memindahkan lokasinya ke pelabuhan lain di timur. Setahun lagi, pelabuhan itu yang akan dikenal dunia sebagai "pelabuhan hijau Indonesia" — padahal mangrovemu lebih tua dan ceritamu lebih layak.',
      },
    ],
  },
  {
    id: 'krisis-air',
    phase: 3,
    title: 'Sumur Kampung Payau',
    speaker: 'warga',
    text:
      'Sumur-sumur kampung mendadak payau dan berbau. Warga menuding pembangunan pelabuhan mengganggu resapan; ahli menduga intrusi air laut musim kemarau. Apapun sebabnya, sore ini ibu-ibu antre air di masjid dan nama pelabuhan disebut-sebut dengan nada yang tidak enak.',
    choices: [
      {
        label: 'Kirim tangki air bersih harian + bor sumur dalam untuk kampung',
        hints: ['dana-', 'komunitas+'],
        cost: 8,
        effects: { komunitas: 9, reputasi: 3 },
        outcome:
          'Truk tangki pelabuhan keliling kampung tiap pagi, dan dua minggu kemudian sumur bor dalam pertama menyembur jernih. Soal siapa yang salah tak lagi diperdebatkan — yang diingat, saat air susah, pelabuhan datang paling awal.',
      },
      {
        label: 'Danai uji independen dulu: salah-benar harus jelas',
        hints: ['reputasi+', 'komunitas-'],
        cost: 4,
        effects: { reputasi: 4, komunitas: -3 },
        outcome:
          'Hasil uji sebulan kemudian: intrusi alami, bukan salah pelabuhan. Kau benar — dan sendirian. Kampung yang kehausan tak pernah menganggap surat hasil lab sebagai air minum.',
      },
      {
        label: 'Bantah keras: jangan jadikan pelabuhan kambing hitam',
        hints: ['komunitas-', 'reputasi-'],
        effects: { komunitas: -8, reputasi: -4 },
        outcome:
          'Konferensi persmu tegas dan datanya rapi. Malamnya, seseorang melempar botol berisi air payau ke gerbang pelabuhan dengan kertas: "MINUM SENDIRI KALAU BERANI." Perang pernyataan dimulai — perang yang tak ada pemenangnya.',
      },
    ],
  },
  {
    id: 'hendra-vs-sari',
    phase: 3,
    title: 'Dua Kepala, Satu Meja',
    speaker: 'narator',
    text:
      'Rapat dengar pendapat memanas: Pak Hendra membanting proposal perluasan terminal ("Ini masa depan!"), Mbok Sari membalas dengan peta zona tangkap turun-temurun ("Ini periuk nasi!"). Keduanya kini menoleh padamu. Ruangan hening. Kipas angin berderit. Semua menunggu satu kata.',
    choices: [
      {
        label: 'Dukung visi Hendra: ekonomi dulu, yang lain menyusul',
        hints: ['dana+', 'komunitas-'],
        effects: { dana: 8, infrastruktur: 4, komunitas: -7 },
        outcome:
          'Hendra menyalamimu erat; proposal jalan. Mbok Sari menggulung petanya pelan-pelan, merapikannya seperti merapikan kain kafan, lalu pamit tanpa menatapmu. Beberapa kemenangan terasa seperti kehilangan.',
      },
      {
        label: 'Dukung Mbok Sari: zona tangkap harga mati',
        hints: ['komunitas+', 'dana-'],
        effects: { komunitas: 8, lingkungan: 3, dana: -5, reputasi: -2 },
        outcome:
          'Mbok Sari menepuk pundakmu dengan tangan yang keriput oleh garam. Hendra tersenyum tipis, mencatat sesuatu di ponselnya — pengusaha selalu punya rencana B, dan biasanya rencana B itu tidak melibatkanmu.',
      },
      {
        label: 'Paksa keduanya duduk kembali: cari titik temu malam ini juga',
        hints: ['sdm-', 'komunitas+', 'reputasi+'],
        cost: 3,
        effects: { komunitas: 4, reputasi: 4, dana: 2, sdm: -3 },
        outcome:
          'Rapat berlanjut sampai lewat tengah malam, ditemani tiga teko kopi dan satu papan tulis penuh coretan. Pukul satu pagi lahir "Skema Koridor": terminal diperluas menjauhi zona tangkap. Semua pulang lelah dan tak ada yang menang — ciri khas kompromi yang adil.',
      },
    ],
  },
  {
    id: 'jaring-hantu',
    phase: 3,
    title: 'Jaring Hantu di Alur Pelayaran',
    speaker: 'dr-laut',
    text:
      'Gulungan jaring raksasa yang dibuang kapal entah siapa tersangkut di alur pelayaran — "jaring hantu" yang menjerat apa saja: baling-baling, penyu, lumba-lumba. Dua kapal nyaris celaka pagi ini. Mengangkatnya butuh penyelam profesional dan penutupan alur setengah hari.',
    choices: [
      {
        label: 'Tutup alur, angkat tuntas hari ini',
        hints: ['dana-', 'lingkungan+', 'infrastruktur+'],
        cost: 6,
        effects: { lingkungan: 7, infrastruktur: 3, dana: -2 },
        outcome:
          'Enam penyelam bekerja empat jam mengangkat dua ton jaring — berikut seekor penyu yang masih hidup, terjerat dan lemas. Video pelepasannya kembali ke laut ditonton ratusan ribu kali. Alur bersih, baling-baling aman, dan penyu itu punya nama sekarang: "Muara".',
      },
      {
        label: 'Pasang pelampung tanda, angkat kalau sempat',
        hints: ['risiko'],
        effects: { infrastruktur: -3, lingkungan: -3 },
        outcome:
          'Pelampung oranye menandai bahaya itu selama berhari-hari. Kapal-kapal memutar; sebagian jaring lepas terbawa arus, menjerat entah apa di perjalanan. "Kalau sempat" — jam berapa tepatnya "sempat" itu datang?',
      },
    ],
  },
  {
    id: 'warisan-mercusuar',
    phase: 3,
    title: 'Mercusuar Tua Muara',
    speaker: 'warga',
    text:
      'Mercusuar peninggalan 1920 di tanjung — penanda pulang para pelaut lima generasi — dinyatakan nyaris roboh. Dinas purbakala angkat tangan soal dana. Pilihan praktis: robohkan demi keselamatan. Tapi bagi kampung, mercusuar itu bukan bangunan; ia kakek yang berdiri menunggu semua orang pulang.',
    choices: [
      {
        label: 'Restorasi penuh dengan dana pelabuhan',
        hints: ['dana-', 'komunitas+', 'reputasi+'],
        cost: 9,
        effects: { komunitas: 8, reputasi: 6, infrastruktur: 2 },
        outcome:
          'Perancah berdiri mengelilingi menara tua itu selama seminggu. Saat lampunya dinyalakan kembali di malam peresmian, klakson semua kapal di teluk berbunyi bersahutan — tak ada yang mengomando. Beberapa hal memang lebih tua dari anggaran.',
      },
      {
        label: 'Amankan seadanya: pagari dan tunggu dana pusat',
        hints: ['netral'],
        effects: { komunitas: -2, dana: -2 },
        outcome:
          'Pagar seng mengelilingi sang kakek tua. Aman, secara hukum. Tiap senja masih ada saja orang berdiri di luar pagar, memandanginya seperti menjenguk kerabat di rumah sakit.',
      },
      {
        label: 'Robohkan: keselamatan di atas nostalgia',
        hints: ['komunitas-'],
        effects: { komunitas: -7, reputasi: -3, dana: -3 },
        outcome:
          'Ekskavator merubuhkannya dalam sehari; puingnya diangkut tiga hari. Secara teknis kau benar — menara itu memang bisa roboh kapan saja. Tapi di pesisir, "secara teknis benar" adalah pembelaan yang paling sepi pendukungnya.',
      },
    ],
  },
];

export function getEvent(id: string): EventCard | undefined {
  return EVENTS.find((e) => e.id === id);
}
