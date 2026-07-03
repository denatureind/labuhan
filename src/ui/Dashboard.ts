// ============================================================
// PELABUHAN HIJAU v3 — Dashboard
// Panel kiri: 6 resource bar + nilai + ikon
// Area: x=0–248, y=0–900
// ============================================================

import * as Phaser from 'phaser';
import type { Resources } from '../types/index';
import { RESOURCE_BAR_CONFIG, COLORS, TEXT_COLORS, GAME_CONFIG } from '../config';

const LEBAR_PANEL = 248;
const LEBAR_BAR   = 195;
const TINGGI_BAR  = 16;
const BAR_X       = 27;       // x mulai bar (dan label di atasnya)
const BAR_Y_MULAI = 165;      // y bar pertama
const JARAK_ANTAR = 117;      // jarak antar resource

interface BarElemen {
  bgBar: Phaser.GameObjects.Rectangle;
  isiBar: Phaser.GameObjects.Rectangle;
  teksNilai: Phaser.GameObjects.Text;
  warnaBar: number;
  maks: number;
  key: keyof Resources;
}

export class Dashboard {
  private scene: Phaser.Scene;
  private elemen: BarElemen[] = [];
  private nilaiSebelum: Partial<Resources> = {};

  constructor(scene: Phaser.Scene, _x: number, _y: number) {
    this.scene = scene;
    this.buatPanel();
    this.buatSemuaBar();
  }

  // ----------------------------------------------------------
  // PANEL LATAR
  // ----------------------------------------------------------

  private buatPanel(): void {
    // Ikon Jangkar
    this.scene.add.text(LEBAR_PANEL / 2, 21, '⚓', {
      fontSize: '22px',
      color: TEXT_COLORS.teal,
    }).setOrigin(0.5, 0);

    // Judul Utama
    this.scene.add.text(LEBAR_PANEL / 2, 48, 'LABUHAN', {
      fontSize: '24px',
      color: TEXT_COLORS.putih,
      fontStyle: 'bold',
      letterSpacing: 3,
    }).setOrigin(0.5, 0);

    // Garis pemisah
    this.scene.add.rectangle(LEBAR_PANEL / 2, 87, LEBAR_PANEL - 24, 1, COLORS.teal).setAlpha(0.4);

    // Label "SUMBER DAYA"
    this.scene.add.text(LEBAR_PANEL / 2, 96, 'SUMBER DAYA', {
      fontSize: '12px',
      color: TEXT_COLORS.abu,
      letterSpacing: 1,
    }).setOrigin(0.5, 0);
  }

  // ----------------------------------------------------------
  // BUAT SEMUA BAR (6 resource)
  // Layout per resource: [IKON] LABEL
  //                      [========bar========] nilai
  // ----------------------------------------------------------

  private buatSemuaBar(): void {
    RESOURCE_BAR_CONFIG.forEach((cfg, i) => {
      const y = BAR_Y_MULAI + i * JARAK_ANTAR;

      // Baris atas: ikon + label nama
      this.scene.add.text(BAR_X, y - 27, cfg.ikon, {
        fontSize: '18px',
      }).setOrigin(0, 0.5);

      this.scene.add.text(BAR_X + 27, y - 27, cfg.label.toUpperCase(), {
        fontSize: '13px',
        color: TEXT_COLORS.abu,
        letterSpacing: 0,
      }).setOrigin(0, 0.5);

      // Latar bar
      const bgBar = this.scene.add.rectangle(BAR_X, y, LEBAR_BAR, TINGGI_BAR, COLORS.gelapMuda)
        .setOrigin(0, 0.5);

      // Isi bar
      const isiBar = this.scene.add.rectangle(BAR_X, y, LEBAR_BAR, TINGGI_BAR, cfg.warnaBar)
        .setOrigin(0, 0.5)
        .setAlpha(0.9);

      // Nilai angka di kanan bar
      const teksNilai = this.scene.add.text(BAR_X + LEBAR_BAR + 7, y, '0', {
        fontSize: '16px',
        color: TEXT_COLORS.putih,
        fontStyle: 'bold',
      }).setOrigin(0, 0.5);

      this.elemen.push({
        bgBar, isiBar, teksNilai,
        warnaBar: cfg.warnaBar,
        maks: cfg.maks,
        key: cfg.resourceKey,
      });
    });
  }

  // ----------------------------------------------------------
  // UPDATE — animasi bar + warna kritis
  // ----------------------------------------------------------

  update(resources: Resources): void {
    this.elemen.forEach((el) => {
      const nilai = resources[el.key];
      const nilaiLama = this.nilaiSebelum[el.key] ?? nilai;
      const persen = Math.max(0, Math.min(1, nilai / el.maks));
      const lebarIsi = Math.round(LEBAR_BAR * persen);

      this.scene.tweens.add({
        targets: el.isiBar,
        displayWidth: lebarIsi,
        duration: 400,
        ease: 'Power2',
      });

      // Merah jika kritis (< 20%)
      el.isiBar.setFillStyle(persen < 0.2 ? COLORS.merah : el.warnaBar);

      el.teksNilai.setText(String(Math.round(nilai)));

      if (nilai < nilaiLama) {
        this.scene.tweens.add({
          targets: el.teksNilai,
          alpha: 0.2, yoyo: true, duration: 200, repeat: 1,
        });
        el.teksNilai.setColor(TEXT_COLORS.merah);
        this.scene.time.delayedCall(600, () => el.teksNilai.setColor(TEXT_COLORS.putih));
      } else if (nilai > nilaiLama) {
        el.teksNilai.setColor(TEXT_COLORS.hijau);
        this.scene.time.delayedCall(600, () => el.teksNilai.setColor(TEXT_COLORS.putih));
      }
    });

    this.nilaiSebelum = { ...resources };
  }

  highlight(key: keyof Resources, durasi = 800): void {
    const el = this.elemen.find((e) => e.key === key);
    if (!el) return;
    this.scene.tweens.add({
      targets: [el.bgBar, el.isiBar],
      alpha: 0.4, yoyo: true, duration: durasi / 2, repeat: 1,
    });
  }
}
