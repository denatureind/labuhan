import type { TrafficVehicle } from '../types';

const IMG = './assets/images';

/**
 * Dekorasi ambient yang bergerak sendiri di peta (mobil + kapal kargo).
 * Ditulis otomatis oleh "🛠️ Edit Tata Letak" (lihat LayoutEditor.svelte) —
 * jangan diedit dengan tangan, perubahan akan tertimpa saat disimpan lagi
 * lewat tool tersebut. Buka mode edit itu untuk mengubah jalurnya.
 */
export const TRAFFIC: TrafficVehicle[] = [
  {
    id: 'sedan',
    sprite: `${IMG}/sedan.png`,
    width: 3.4,
    cycleMs: 46000,
    driveMs: 25000,
    delayMs: -9000,
    points: [
      { x: 33.2, y: 15.4 },
      { x: 6.7, y: 33.8 },
    ],
  },
  {
    id: 'mvp',
    sprite: `${IMG}/mvp.png`,
    width: 3.7,
    cycleMs: 52000,
    driveMs: 6000,
    delayMs: -31000,
    points: [
      { x: 29.9, y: 18.8 },
      { x: 10.1, y: 33 },
    ],
  },
  {
    id: 'boxtruck',
    sprite: `${IMG}/box.png`,
    width: 4.1,
    cycleMs: 61000,
    driveMs: 34000,
    delayMs: -4000,
    points: [
      { x: 26.8, y: 31.9 },
      { x: 14.4, y: 42.3 },
    ],
  },
  {
    id: 'truk',
    sprite: `${IMG}/truk.png`,
    width: 4.6,
    cycleMs: 58000,
    driveMs: 32000,
    delayMs: -46000,
    points: [
      { x: 55.6, y: 26.6, pauseMs: 8000 },
      { x: 41.5, y: 38.8, pauseMs: 2500 },
    ],
  },
  {
    id: 'kargo',
    sprite: `${IMG}/kargo.png`,
    width: 9,
    cycleMs: 84000,
    driveMs: 80000,
    delayMs: 0,
    bob: true,
    points: [
      { x: 96.1, y: 24.5, pauseMs: 21000 },
      { x: 76.8, y: 46.3 },
    ],
  },
  {
    id: 'custom-1',
    sprite: `${IMG}/Desain tanpa judul.png`,
    width: 4,
    cycleMs: 50000,
    driveMs: 28000,
    delayMs: 0,
    points: [
      { x: 22.4, y: 27 },
      { x: 51.3, y: 45.7 },
    ],
  },
  {
    id: 'custom-2',
    sprite: `${IMG}/kapal nelayan1.png`,
    width: 4,
    cycleMs: 50000,
    driveMs: 28000,
    delayMs: 0,
    points: [
      { x: 62.4, y: 45.1, pauseMs: 1000 },
      { x: 97.4, y: 74.5, pauseMs: 1000 },
    ],
  },
  {
    id: 'custom-3',
    sprite: `${IMG}/kapal nelayan 3.png`,
    width: 4,
    cycleMs: 50000,
    driveMs: 47000,
    delayMs: 0,
    points: [
      { x: 66.9, y: 85 },
      { x: 98.4, y: 41.9 },
    ],
  },
];
