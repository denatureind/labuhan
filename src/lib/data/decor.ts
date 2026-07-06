import type { DecorItem } from '../types';

/**
 * Aset hias statis di peta (bangunan tambahan, orang, properti dekoratif).
 * Ditulis otomatis oleh "🛠️ Edit Tata Letak" (lihat LayoutEditor.svelte) —
 * jangan diedit dengan tangan, perubahan akan tertimpa saat disimpan lagi
 * lewat tool tersebut.
 */
export const DECOR: DecorItem[] = [
  { id: 'dekor-1', sprite: './assets/images/mvp.png', x: 41.1, y: 37.4, w: 4.5, rotateDeg: -5 },
  { id: 'dekor-2', sprite: './assets/images/sedan.png', x: 38.6, y: 35.7, w: 5 },
  { id: 'dekor-3', sprite: './assets/images/truk.png', x: 61.4, y: 61.2, w: 6.5 },
];
