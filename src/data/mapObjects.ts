// ============================================================
// PELABUHAN HIJAU v3 — Data Objek Interaktif Peta
// Area peta: x 240–1185, y 150–840 (sisi kiri untuk dashboard)
// ============================================================

import type { ObjekPeta, DekorasiPeta } from '../types/index';

export const DAFTAR_OBJEK_PETA: ObjekPeta[] = [
  // ----------------------------------------------------------
  // KAPAL PATROLI — y: 116 (Paling Belakang/Atas Layar)
  // ----------------------------------------------------------
  {
    id: 'kapal_patroli',
    tipe: 'kapal',
    nama: 'Kapal Patroli',
    deskripsi: 'Kapal pengawas perairan dan kebersihan laut sekitar pelabuhan.',
    x: 1077, y: 116,
    lebar: 150, tinggi: 130,
    rotasi: 0,
    aksi: [
      {
        id: 'patroli_laut',
        label: 'Patroli Perairan',
        deskripsi: 'Lakukan patroli untuk mencegah penangkapan ikan ilegal.',
        biaya: { dana: 15 },
        hasil: { lingkungan: 18, reputasi: 8 },
        cooldownHari: 2,
      },
      {
        id: 'bersih_laut',
        label: 'Aksi Bersih Laut',
        deskripsi: 'Kerahkan kapal untuk membersihkan sampah di perairan.',
        biaya: { dana: 20, sdm: 8 },
        hasil: { lingkungan: 25, komunitas: 10, reputasi: 12 },
        cooldownHari: 4,
      },
    ],
  },

  // ----------------------------------------------------------
  // GUDANG LOGISTIK — y: 128
  // ----------------------------------------------------------
  {
    id: 'gudang_logistik',
    tipe: 'gudang',
    nama: 'Gudang Logistik',
    deskripsi: 'Tempat penyimpanan barang sementara sebelum didistribusikan.',
    x: 750, y: 128,
    lebar: 350, tinggi: 300,
    rotasi: 1,
    aksi: [
      {
        id: 'optimasi_gudang',
        label: 'Optimasi Penyimpanan',
        deskripsi: 'Tata ulang sistem gudang untuk kapasitas lebih besar.',
        biaya: { dana: 15, sdm: 5 },
        hasil: { infrastruktur: 12, dana: 20 },
        cooldownHari: 3,
      },
      {
        id: 'sewa_gudang',
        label: 'Sewakan Ruang Gudang',
        deskripsi: 'Sewakan sebagian gudang ke pedagang lokal.',
        biaya: { infrastruktur: 5 },
        hasil: { dana: 25, komunitas: 8 },
        cooldownHari: 2,
      },
    ],
  },

  // ----------------------------------------------------------
  // PASAR IKAN — y: 174
  // ----------------------------------------------------------
  {
    id: 'pasar_ikan',
    tipe: 'pasar',
    nama: 'Pasar Ikan',
    deskripsi: 'Pusat jual beli hasil tangkapan nelayan dan produk laut.',
    x: 445, y: 174,
    lebar: 360, tinggi: 350,
    rotasi: -3,
    aksi: [
      {
        id: 'festival_ikan',
        label: 'Festival Ikan',
        deskripsi: 'Selenggarakan festival kuliner laut untuk menarik wisatawan.',
        biaya: { dana: 30 },
        hasil: { dana: 50, komunitas: 15, reputasi: 18 },
        cooldownHari: 6,
      },
      {
        id: 'digitalisasi_pasar',
        label: 'Digitalisasi Pasar',
        deskripsi: 'Buat sistem jual beli online untuk nelayan lokal.',
        biaya: { dana: 25, sdm: 10 },
        hasil: { komunitas: 12, reputasi: 15, dana: 20 },
        cooldownHari: 5,
      },
    ],
  },

  // ----------------------------------------------------------
  // DERMAGA UTAMA — y: 365
  // ----------------------------------------------------------
  {
    id: 'dermaga_utama',
    tipe: 'dermaga',
    nama: 'Dermaga Utama',
    deskripsi: 'Dermaga bongkar muat kapal barang utama pelabuhan.',
    x: 923, y: 365,
    lebar: 300, tinggi: 285,
    rotasi: -2,
    aksi: [
      {
        id: 'perbaiki_dermaga',
        label: 'Perbaiki Dermaga',
        deskripsi: 'Perbaiki kerusakan ringan untuk meningkatkan kapasitas bongkar muat.',
        biaya: { dana: 25 },
        hasil: { infrastruktur: 15, reputasi: 5 },
        cooldownHari: 3,
      },
      {
        id: 'tambah_shift',
        label: 'Tambah Shift Kerja',
        deskripsi: 'Buka shift malam untuk menambah pendapatan, tapi SDM perlu ekstra.',
        biaya: { dana: 10, sdm: 8 },
        hasil: { dana: 30, reputasi: 5 },
        cooldownHari: 2,
      },
    ],
  },

  // ----------------------------------------------------------
  // TAMBAK NELAYAN — y: 378
  // ----------------------------------------------------------
  {
    id: 'tambak_nelayan',
    tipe: 'tambak',
    nama: 'Tambak Nelayan',
    deskripsi: 'Area budidaya ikan milik nelayan lokal di tepi pelabuhan.',
    x: 308, y: 378,
    lebar: 390, tinggi: 400,
    rotasi: 0,
    aksi: [
      {
        id: 'bantu_tambak',
        label: 'Bantu Pemasaran',
        deskripsi: 'Bantu nelayan memasarkan hasil tambak ke kota.',
        biaya: { dana: 12 },
        hasil: { komunitas: 18, reputasi: 7 },
        cooldownHari: 3,
      },
      {
        id: 'edukasi_nelayan',
        label: 'Edukasi Budidaya',
        deskripsi: 'Undang ahli kelautan untuk edukasi teknik ramah lingkungan.',
        biaya: { dana: 18, reputasi: 5 },
        hasil: { komunitas: 12, lingkungan: 15, sdm: 8 },
        cooldownHari: 4,
      },
    ],
  },

  // ----------------------------------------------------------
  // KANTOR ADMINISTRASI — y: 515 (Paling Depan/Bawah Layar)
  // ----------------------------------------------------------
  {
    id: 'kantor_admin',
    tipe: 'kantor',
    nama: 'Kantor Admin',
    deskripsi: 'Pusat pengelolaan administrasi dan hubungan mitra pelabuhan.',
    x: 517, y: 385,
    lebar: 405, tinggi: 432,
    rotasi: 14,
    aksi: [
      {
        id: 'pelatihan_staf',
        label: 'Pelatihan Staf',
        deskripsi: 'Tingkatkan kompetensi karyawan melalui workshop intensif.',
        biaya: { dana: 20 },
        hasil: { sdm: 20, reputasi: 8 },
        cooldownHari: 4,
      },
      {
        id: 'lobi_mitra',
        label: 'Lobi Mitra Baru',
        deskripsi: 'Hubungi calon mitra bisnis untuk menambah pendapatan.',
        biaya: { dana: 10, reputasi: 5 },
        hasil: { dana: 35, reputasi: 10 },
        cooldownHari: 5,
      },
    ],
  },

  // ----------------------------------------------------------
  // KAPAL KARGO — y: 536 (Paling Depan Layar / Bawah)
  // ----------------------------------------------------------
  {
    id: 'kapal_kargo',
    tipe: 'kargo',
    nama: 'Kapal Kargo',
    deskripsi: 'Kapal pengangkut barang skala besar antar pulau.',
    x: 1035, y: 456,
    lebar: 220, tinggi: 215, // Sesuaikan angka ini nanti jika gambarnya kekecilan/kebesaran
    rotasi: 0,
    aksi: [
      {
        id: 'bongkar_muat',
        label: 'Bongkar Muatan',
        deskripsi: 'Turunkan muatan dari kapal kargo untuk mendapatkan dana.',
        biaya: { sdm: 10 },
        hasil: { dana: 40, infrastruktur: -5 },
        cooldownHari: 3,
      },
      {
        id: 'inspeksi_kargo',
        label: 'Inspeksi Ketat',
        deskripsi: 'Periksa muatan untuk mencegah barang ilegal masuk.',
        biaya: { dana: 10 },
        hasil: { reputasi: 15, lingkungan: 5 },
        cooldownHari: 4,
      },
    ],
  },
];

// ============================================================
// DAFTAR ELEMEN DEKORASI (MATI / NON-INTERAKTIF)
// ============================================================

export const DAFTAR_DEKORASI: DekorasiPeta[] = [
  {
    id: 'mobil_merah_1',
    gambar: 'img-mobil', // Memanggil gambar yang di-load di BootScene
    x: 596, y: 525,      // Posisi di area kosong
    lebar: 90, tinggi: 90,
    rotasi: 0,
    flipX: false
  },
  {
    id: 'mobil_sedan_1',
    gambar: 'img-sedan', // Memanggil gambar sedan
    x: 650, y: 550,      // Silakan atur posisinya via drag & drop nanti
    lebar: 90, tinggi: 90,
    rotasi: 0,
    flipX: false
  },
  {
    id: 'truk_barang_1',
    gambar: 'img-truk',  // Memanggil gambar truk
    x: 720, y: 500,
    lebar: 130, tinggi: 100, // Truk biasanya lebih besar dari mobil biasa
    rotasi: 0,
    flipX: true          // Contoh jika Anda ingin truknya menghadap arah sebaliknya
  },
  {
    id: 'mobil_box_1',
    gambar: 'img-box',   // Memanggil gambar mobil box
    x: 616, y: 214,      // Silakan atur posisinya via drag & drop
    lebar: 110, tinggi: 95,
    rotasi: 0,
    flipX: false
  },
];
