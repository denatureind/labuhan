import type { FacilityDef } from '../types';

const IMG = './assets/images';

/**
 * Posisi (pos) dalam persen terhadap peta bg.png (1445×1084) —
 * disetel agar sprite duduk di petak-petak pasir kosong.
 */
export const FACILITIES: FacilityDef[] = [
  {
    id: 'dermaga',
    name: 'Dermaga',
    icon: '⚓',
    tagline: 'Jantung bongkar-muat pelabuhan',
    sprite: `${IMG}/dermaga.png`,
    pos: { x: 71.3, y: 42.9, w: 16.5 },
    actions: [
      {
        id: 'bongkar-ekspres',
        name: 'Bongkar Muat Ekspres',
        icon: '📦',
        desc: 'Genjot ritase bongkar-muat: kapal antre dilayani kilat. Uang masuk deras, tapi pekerja dan derek diperas.',
        effects: { dana: 9, sdm: -4, infrastruktur: -2 },
        cooldown: 1,
      },
      {
        id: 'rawat-dermaga',
        name: 'Perawatan Dermaga & Derek',
        icon: '🔧',
        desc: 'Servis rutin derek, tambal retakan, ganti tali tambat. Mahal, tapi mesin yang sehat adalah nyawa pelabuhan.',
        cost: 6,
        effects: { infrastruktur: 8 },
        cooldown: 1,
      },
      {
        id: 'prioritas-nelayan',
        name: 'Prioritaskan Kapal Nelayan',
        icon: '🛶',
        desc: 'Beri jalur sandar khusus perahu nelayan tradisional. Kapal niaga harus rela antre — pemasukan hari ini berkurang.',
        effects: { komunitas: 7, dana: -3 },
        cooldown: 1,
      },
    ],
  },
  {
    id: 'gudang',
    name: 'Gudang',
    icon: '🏬',
    tagline: 'Logistik dan penyimpanan kargo',
    sprite: `${IMG}/gudang.png`,
    pos: { x: 47.1, y: 26.9, w: 19 },
    actions: [
      {
        id: 'sewa-gudang',
        name: 'Sewakan Ruang Gudang',
        icon: '🗃️',
        desc: 'Sewakan blok gudang ke distributor besar. Kas terisi, tapi pedagang kecil kehilangan tempat menitip barang.',
        effects: { dana: 6, komunitas: -2 },
        cooldown: 1,
      },
      {
        id: 'rawat-gudang',
        name: 'Perbaikan Atap & Rak',
        icon: '🛠️',
        desc: 'Atap bocor dan rak karatan diganti sebelum barang orang rusak dimakan tampias.',
        cost: 5,
        effects: { infrastruktur: 7 },
        cooldown: 1,
      },
      {
        id: 'panel-surya',
        name: 'Pasang Panel Surya',
        icon: '☀️',
        desc: 'Investasi sekali seumur jabatan: atap gudang jadi ladang listrik. Tagihan turun selamanya (+1 Dana tiap pagi).',
        cost: 14,
        effects: { reputasi: 4 },
        cooldown: 0,
        once: true,
        grantsPassive: 'panel-surya',
      },
    ],
  },
  {
    id: 'kantor',
    name: 'Kantor Pelabuhan',
    icon: '🏢',
    tagline: 'Administrasi dan kebijakan',
    sprite: `${IMG}/kantor.png`,
    pos: { x: 45.6, y: 65.7, w: 14 },
    actions: [
      {
        id: 'pelatihan-k3',
        name: 'Pelatihan K3 Pekerja',
        icon: '⛑️',
        desc: 'Latih keselamatan kerja: helm, prosedur, simulasi evakuasi. Pekerja merasa dijaga — dan memang dijaga.',
        cost: 5,
        effects: { sdm: 7, infrastruktur: 2 },
        cooldown: 1,
      },
      {
        id: 'kampanye-humas',
        name: 'Kampanye Humas',
        icon: '📰',
        desc: 'Undang wartawan, rilis capaian, pasang baliho "Pelabuhan Kebanggaan Muara". Citra naik — asal ada isinya.',
        cost: 6,
        effects: { reputasi: 7 },
        cooldown: 1,
      },
      {
        id: 'bangun-ipal',
        name: 'Bangun IPAL',
        icon: '💧',
        desc: 'Instalasi Pengolahan Air Limbah — proyek besar sekali bangun. Air buangan pelabuhan tak lagi mencemari teluk (+1 Lingkungan tiap pagi).',
        cost: 15,
        effects: { lingkungan: 6 },
        cooldown: 0,
        once: true,
        grantsPassive: 'ipal',
      },
      {
        id: 'koperasi',
        name: 'Dirikan Koperasi Pekerja',
        icon: '🤲',
        desc: 'Simpan-pinjam, sembako murah, beasiswa anak buruh. Sekali berdiri, kesejahteraan tumbuh sendiri (+1 SDM tiap pagi).',
        cost: 12,
        effects: { sdm: 6 },
        cooldown: 0,
        once: true,
        grantsPassive: 'koperasi',
      },
    ],
  },
  {
    id: 'tambak',
    name: 'Tambak & Mangrove',
    icon: '🦐',
    tagline: 'Budidaya pesisir dan sabuk hijau',
    sprite: `${IMG}/tambak.png`,
    pos: { x: 30.3, y: 44.7, w: 20 },
    actions: [
      {
        id: 'panen-tambak',
        name: 'Panen Tambak',
        icon: '🦐',
        desc: 'Angkat bandeng dan udang dari petakan. Panen deras mengisi kas, tapi air buangan tambak mengalir ke teluk.',
        effects: { dana: 9, lingkungan: -3 },
        cooldown: 2,
      },
      {
        id: 'restorasi-mangrove',
        name: 'Restorasi Mangrove',
        icon: '🌱',
        desc: 'Tanam kembali sabuk bakau pelindung pantai. Ikan pulang bertelur, abrasi tertahan, warga ikut menanam.',
        cost: 7,
        effects: { lingkungan: 8, komunitas: 2 },
        cooldown: 1,
      },
      {
        id: 'wisata-tambak',
        name: 'Wisata Edukasi Tambak',
        icon: '🎒',
        desc: 'Buka tambak untuk kunjungan sekolah dan wisatawan. Pemasukan tambahan plus nama harum — asal pengunjung tak meninggalkan sampah.',
        effects: { dana: 5, reputasi: 4, lingkungan: -1 },
        cooldown: 2,
      },
    ],
  },
  {
    id: 'kapal',
    name: 'Kapal Patroli',
    icon: '🚤',
    tagline: 'Armada pengawas perairan',
    sprite: `${IMG}/kapal.png`,
    pos: { x: 68.8, y: 65.6, w: 8.5 },
    actions: [
      {
        id: 'patroli-laut',
        name: 'Patroli Perairan',
        icon: '🛥️',
        desc: 'Berkeliling mengusir kapal trawl liar dan pembuang limbah. Laut aman, nelayan kecil merasa dilindungi.',
        cost: 4,
        effects: { lingkungan: 5, komunitas: 2, reputasi: 2 },
        cooldown: 1,
      },
      {
        id: 'bersih-teluk',
        name: 'Operasi Bersih Teluk',
        icon: '🧹',
        desc: 'Kerahkan kapal dan relawan mengangkat sampah plastik serta jaring hantu dari perairan.',
        cost: 5,
        effects: { lingkungan: 7 },
        cooldown: 1,
      },
      {
        id: 'latihan-sar',
        name: 'Latihan SAR Bersama',
        icon: '🛟',
        desc: 'Simulasi penyelamatan bersama Basarnas dan nelayan. Kru makin sigap, publik makin percaya.',
        cost: 4,
        effects: { sdm: 6, reputasi: 4 },
        cooldown: 2,
      },
    ],
  },
  {
    id: 'pasar',
    name: 'Pasar Ikan',
    icon: '🐟',
    tagline: 'Denyut ekonomi rakyat pesisir',
    sprite: `${IMG}/pasar.png`,
    pos: { x: 44.3, y: 53.9, w: 19 },
    actions: [
      {
        id: 'lelang-ikan',
        name: 'Lelang Ikan Besar',
        icon: '🐠',
        desc: 'Gelar lelang terbuka: tengkulak dan restoran kota berebut hasil laut. Retribusi mengalir — permintaan ikan pun melonjak.',
        effects: { dana: 7, lingkungan: -2 },
        cooldown: 1,
      },
      {
        id: 'subsidi-lapak',
        name: 'Subsidi Lapak Nelayan',
        icon: '🧺',
        desc: 'Gratiskan sewa lapak bagi keluarga nelayan sebulan ini. Pasar riuh, dapur mereka tetap ngebul.',
        cost: 6,
        effects: { komunitas: 8 },
        cooldown: 1,
      },
      {
        id: 'festival-bahari',
        name: 'Festival Kuliner Bahari',
        icon: '🎉',
        desc: 'Panggung musik, lomba masak gulai kepala kakap, pasar malam. Seluruh kampung tumpah ruah — panitianya lembur.',
        cost: 8,
        effects: { komunitas: 8, reputasi: 6, sdm: -2 },
        cooldown: 2,
      },
    ],
  },
];

export function getFacility(id: FacilityDef['id']): FacilityDef {
  return FACILITIES.find((f) => f.id === id)!;
}

export function getAction(actionId: string) {
  for (const f of FACILITIES) {
    const a = f.actions.find((x) => x.id === actionId);
    if (a) return a;
  }
  return undefined;
}
