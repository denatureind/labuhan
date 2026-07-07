import type { DecorItem } from '../types';

/**
 * Aset hias statis di peta (bangunan tambahan, orang, properti dekoratif).
 * Ditulis otomatis oleh "🛠️ Edit Tata Letak" (lihat LayoutEditor.svelte) —
 * jangan diedit dengan tangan, perubahan akan tertimpa saat disimpan lagi
 * lewat tool tersebut.
 */
export const DECOR: DecorItem[] = [
  { id: 'dekor-1', sprite: './assets/images/mvp.png', x: 41.1, y: 37.4, w: 4.5 },
  { id: 'dekor-2', sprite: './assets/images/sedan.png', x: 38.6, y: 35.7, w: 5 },
  { id: 'dekor-3', sprite: './assets/images/truk.png', x: 61.5, y: 39.1, w: 6.5, rotateDeg: -10 },
  { id: 'dekor-4', sprite: './assets/images/kapal nelayan2png.png', x: 53.8, y: 82.1, w: 9.5 },
  { id: 'dekor-5', sprite: './assets/images/mvp.png', x: 31.9, y: 58, w: 5 },
  { id: 'dekor-6', sprite: './assets/images/box.png', x: 52.8, y: 58.6, w: 5.5 },
  { id: 'dekor-7', sprite: './assets/images/kargo2.png', x: 75.7, y: 38.7, w: 10, rotateDeg: 5 },
];
