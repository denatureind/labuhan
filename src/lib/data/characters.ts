import type { CharacterDef } from '../types';

export const CHARACTERS: CharacterDef[] = [
  {
    id: 'bahari',
    name: 'Pak Bahari',
    title: 'Nelayan Senior',
    desc: 'Tiga puluh tahun mengarungi perairan Muara. Warga kampung pesisir menganggapnya bapak sendiri, dan laut baginya bukan sumber daya — melainkan rumah.',
    playstyle:
      'Kuat menjaga Lingkungan & Komunitas. Dipercaya rakyat, tapi harus kerja ekstra keras mencari Dana.',
    startStats: {
      dana: 42,
      reputasi: 50,
      lingkungan: 68,
      sdm: 55,
      infrastruktur: 48,
      komunitas: 68,
    },
    trait: {
      label: 'Anak Kampung: tiap pagi Komunitas +1, namun Dana −1 (ia sulit menagih pada rakyat sendiri).',
      effects: { komunitas: 1, dana: -1 },
    },
    ability: {
      name: 'Rembug Pesisir',
      icon: '🛶',
      desc: 'Duduk bersama warga dan nelayan semalam suntuk. Komunitas +10, Lingkungan +6.',
      effects: { komunitas: 10, lingkungan: 6 },
      cooldown: 5,
    },
    portrait: { x: 10.5, y: 22, w: 17, h: 13.5 },
  },
  {
    id: 'citra',
    name: 'Bu Citra',
    title: 'Manajer Muda',
    desc: 'Lulusan terbaik Teknik Kelautan yang pulang kampung membawa mimpi besar: menjadikan Muara Harapan pelabuhan modern yang diperhitungkan dunia.',
    playstyle:
      'Kuat di Reputasi & Infrastruktur. Cepat berkembang, tapi mudah dicap "orang luar" oleh warga lokal.',
    startStats: {
      dana: 55,
      reputasi: 66,
      lingkungan: 50,
      sdm: 52,
      infrastruktur: 66,
      komunitas: 42,
    },
    trait: {
      label: 'Wajah Baru: tiap pagi Reputasi +1, namun Komunitas −1 (warga masih menaruh curiga).',
      effects: { reputasi: 1, komunitas: -1 },
    },
    ability: {
      name: 'Gebrakan Modernisasi',
      icon: '📐',
      desc: 'Kerahkan tim teknis untuk pembenahan kilat. Infrastruktur +10, Reputasi +6.',
      effects: { infrastruktur: 10, reputasi: 6 },
      cooldown: 5,
    },
    portrait: { x: 38.5, y: 23, w: 17, h: 13.5 },
  },
  {
    id: 'rendra',
    name: 'Pak Rendra',
    title: 'Direktur Bisnis',
    desc: 'Pengusaha kawakan dengan jaringan luas di industri maritim. Baginya pelabuhan adalah mesin uang — dan mesin harus dipacu, bukan dielus.',
    playstyle:
      'Jago mencari Dana dengan cepat. Risikonya: pekerja diperas, dan kesabaran mereka ada batasnya.',
    startStats: {
      dana: 70,
      reputasi: 58,
      lingkungan: 46,
      sdm: 44,
      infrastruktur: 56,
      komunitas: 46,
    },
    trait: {
      label: 'Tangan Besi: tiap pagi Dana +1, namun SDM −1 (target harian yang tak kenal ampun).',
      effects: { dana: 1, sdm: -1 },
    },
    ability: {
      name: 'Lobi Kilat',
      icon: '📞',
      desc: 'Satu telepon ke kolega lama, kontrak gemuk cair seketika. Dana +14, tapi SDM −4 (lembur mendadak).',
      effects: { dana: 14, sdm: -4 },
      cooldown: 5,
    },
    portrait: { x: 69.5, y: 22, w: 17, h: 13.5 },
  },
];

export function getCharacter(id: CharacterDef['id']): CharacterDef {
  return CHARACTERS.find((c) => c.id === id)!;
}
