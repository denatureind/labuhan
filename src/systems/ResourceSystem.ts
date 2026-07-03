// ============================================================
// PELABUHAN HIJAU v3 — ResourceSystem
// Mengelola 6 resource, clamp batas, apply multiplier karakter,
// deteksi game over, dan evaluasi ending
// ============================================================

import type {
  Resources,
  KarakterId,
  KarakterMultiplier,
  EndingId,
} from '../types/index';
import {
  GAME_CONFIG,
  ENDING_THRESHOLD,
  MULTIPLIER_KARAKTER,
  PESAN_GAME_OVER,
} from '../config';

export interface HasilGameOver {
  terjadi: boolean;
  resourcePenyebab?: keyof Resources;
  judul?: string;
  deskripsi?: string;
}

export interface HasilEnding {
  id: EndingId;
  judul: string;
  deskripsi: string;
  warna: number;
}

export class ResourceSystem {
  private resources: Resources;
  private karakterId: KarakterId;
  private multiplier: KarakterMultiplier;

  constructor(karakterId: KarakterId) {
    this.karakterId = karakterId;
    this.multiplier = MULTIPLIER_KARAKTER[karakterId];
    // Salin nilai awal agar tidak mutasi konstanta
    this.resources = { ...GAME_CONFIG.resourceAwal };
  }

  // ----------------------------------------------------------
  // GETTER
  // ----------------------------------------------------------

  getResources(): Readonly<Resources> {
    return { ...this.resources };
  }

  getNilai(key: keyof Resources): number {
    return this.resources[key];
  }

  // ----------------------------------------------------------
  // TERAPKAN EFEK (dari kartu, aksi, skill, skenario)
  // Efek positif dikalikan multiplier karakter
  // Efek negatif dibiarkan penuh (tidak dikurangi)
  // ----------------------------------------------------------

  terapkanEfek(efek: Partial<Resources>): void {
    const keys = Object.keys(efek) as (keyof Resources)[];
    keys.forEach((key) => {
      const delta = efek[key] ?? 0;
      if (delta > 0) {
        // Bonus — dikalikan multiplier karakter
        const faktor = this.multiplier[key] ?? 1;
        this.resources[key] += Math.round(delta * faktor);
      } else {
        // Penalti — langsung diterapkan tanpa perubahan
        this.resources[key] += delta;
      }
      this.clamp(key);
    });
  }

  // Terapkan efek tanpa multiplier (misal: efek pasif skenario)
  terapkanEfekLangsung(efek: Partial<Resources>): void {
    const keys = Object.keys(efek) as (keyof Resources)[];
    keys.forEach((key) => {
      this.resources[key] += efek[key] ?? 0;
      this.clamp(key);
    });
  }

  // ----------------------------------------------------------
  // CLAMP — pastikan nilai tidak keluar batas min/maks
  // ----------------------------------------------------------

  private clamp(key: keyof Resources): void {
    const maks = GAME_CONFIG.resourceMaks[key];
    this.resources[key] = Math.max(0, Math.min(maks, this.resources[key]));
  }

  private clampSemua(): void {
    const keys = Object.keys(this.resources) as (keyof Resources)[];
    keys.forEach((k) => this.clamp(k));
  }

  // ----------------------------------------------------------
  // OVERRIDE LANGSUNG (untuk load save / reset)
  // ----------------------------------------------------------

  setResources(data: Resources): void {
    this.resources = { ...data };
    this.clampSemua();
  }

  // ----------------------------------------------------------
  // CEK GAME OVER
  // Kembalikan resource pertama yang menyentuh batas bawah
  // ----------------------------------------------------------

  cekGameOver(): HasilGameOver {
    const batas = GAME_CONFIG.batasGameOver;
    const keys = Object.keys(batas) as (keyof Resources)[];

    for (const key of keys) {
      if (this.resources[key] <= batas[key]) {
        const pesan = PESAN_GAME_OVER[key];
        return {
          terjadi: true,
          resourcePenyebab: key,
          judul: pesan?.judul ?? 'Game Over',
          deskripsi: pesan?.deskripsi ?? 'Pelabuhan tidak bisa dilanjutkan.',
        };
      }
    }

    return { terjadi: false };
  }

  // ----------------------------------------------------------
  // EVALUASI ENDING (dipanggil di hari ke-30)
  // Urutan prioritas: emas → raja_bisnis → pejuang_hijau →
  //                   bapak_rakyat → terlupakan
  // ----------------------------------------------------------

  evaluasiEnding(): EndingId {
    const r = this.resources;
    const t = ENDING_THRESHOLD;

    // Pelabuhan Emas — semua resource di atas threshold
    if (
      r.dana >= t.pelabuhan_emas.dana! &&
      r.reputasi >= t.pelabuhan_emas.reputasi! &&
      r.lingkungan >= t.pelabuhan_emas.lingkungan! &&
      r.sdm >= t.pelabuhan_emas.sdm! &&
      r.infrastruktur >= t.pelabuhan_emas.infrastruktur! &&
      r.komunitas >= t.pelabuhan_emas.komunitas!
    ) {
      return 'pelabuhan_emas';
    }

    // Raja Bisnis — dana sangat tinggi, lingkungan & komunitas rendah
    if (
      r.dana >= t.raja_bisnis.dana! &&
      r.lingkungan < t.raja_bisnis.lingkungan! &&
      r.komunitas < t.raja_bisnis.komunitas!
    ) {
      return 'raja_bisnis';
    }

    // Pejuang Hijau — lingkungan tinggi, dana rendah
    if (
      r.lingkungan >= t.pejuang_hijau.lingkungan! &&
      r.dana < t.pejuang_hijau.dana!
    ) {
      return 'pejuang_hijau';
    }

    // Bapak Rakyat — komunitas & sdm tinggi, infrastruktur rendah
    if (
      r.komunitas >= t.bapak_rakyat.komunitas! &&
      r.sdm >= t.bapak_rakyat.sdm! &&
      r.infrastruktur < t.bapak_rakyat.infrastruktur!
    ) {
      return 'bapak_rakyat';
    }

    // Pelabuhan Terlupakan — fallback
    return 'pelabuhan_terlupakan';
  }

  // ----------------------------------------------------------
  // UTILITAS — persentase resource (0.0–1.0) untuk bar UI
  // ----------------------------------------------------------

  getPersentase(key: keyof Resources): number {
    const maks = GAME_CONFIG.resourceMaks[key];
    return Math.max(0, Math.min(1, this.resources[key] / maks));
  }

  // Ringkasan semua persentase sekaligus
  getRingkasanPersentase(): Record<keyof Resources, number> {
    const keys = Object.keys(this.resources) as (keyof Resources)[];
    return Object.fromEntries(
      keys.map((k) => [k, this.getPersentase(k)]),
    ) as Record<keyof Resources, number>;
  }

  // ----------------------------------------------------------
  // DEBUG — log ke console (dihapus saat production)
  // ----------------------------------------------------------

  debugLog(label = ''): void {
    const r = this.resources;
    console.log(
      `[ResourceSystem${label ? ' ' + label : ''}]`,
      `Dana:${r.dana}`,
      `Rep:${r.reputasi}`,
      `Ling:${r.lingkungan}`,
      `SDM:${r.sdm}`,
      `Infra:${r.infrastruktur}`,
      `Kom:${r.komunitas}`,
      `[karakter:${this.karakterId}]`,
    );
  }
}
