// ============================================================
// PELABUHAN HIJAU v3 — EventCard UI
// Pop-up untuk menampilkan Dilema Harian setelah akhiri hari
// ============================================================

import * as Phaser from 'phaser';
import type { KartuKejadian, PilihanKartu, Resources } from '../types/index';
import { COLORS, TEXT_COLORS } from '../config';

export class EventCard {
  private scene: Phaser.Scene;
  private kontainer: Phaser.GameObjects.Container;
  private bgOverlay: Phaser.GameObjects.Rectangle;
  private onPilihAksi!: (pilihan: PilihanKartu, index: number) => void;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
    
    // Latar gelap di belakang kartu
    this.bgOverlay = scene.add.rectangle(600, 450, 1200, 900, 0x000000, 0.75)
      .setDepth(40)
      .setVisible(false)
      .setInteractive(); // blokir klik ke peta

    this.kontainer = scene.add.container(600, 450).setDepth(50).setVisible(false);
  }

  tampilkan(kartu: KartuKejadian, onSelesai: (pilihan: PilihanKartu, index: number) => void): void {
    this.onPilihAksi = onSelesai;
    this.kontainer.removeAll(true);

    const lebar = 520;
    const padding = 30;
    
    // Hitung tinggi berdasarkan jumlah pilihan
    const tinggi = 240 + (kartu.pilihan.length * 105);

    // Background & Border
    const border = this.scene.add.rectangle(0, 0, lebar + 4, tinggi + 4, COLORS.kuning).setAlpha(0.6);
    const bg = this.scene.add.rectangle(0, 0, lebar, tinggi, COLORS.panelBg).setAlpha(0.98);

    // Ikon & Judul
    const ikon = this.scene.add.text(0, -tinggi/2 + padding, '📰', { fontSize: '32px' }).setOrigin(0.5, 0);
    const judul = this.scene.add.text(0, -tinggi/2 + padding + 45, kartu.judul, {
      fontSize: '22px', color: TEXT_COLORS.kuning, fontStyle: 'bold'
    }).setOrigin(0.5, 0);

    // Deskripsi
    const deskripsi = this.scene.add.text(0, -tinggi/2 + padding + 85, kartu.deskripsi, {
      fontSize: '15px', color: TEXT_COLORS.putih, wordWrap: { width: lebar - 60 }, align: 'center', lineSpacing: 4
    }).setOrigin(0.5, 0);

    this.kontainer.add([border, bg, ikon, judul, deskripsi]);

    // Render Pilihan
    let startY = -tinggi/2 + padding + 165;
    
    kartu.pilihan.forEach((pilihan, i) => {
      if (!pilihan) return;
      
      const btnBg = this.scene.add.rectangle(0, startY, lebar - 45, 85, COLORS.gelapMuda)
        .setOrigin(0.5, 0)
        .setInteractive({ cursor: 'pointer' });

      const btnJudul = this.scene.add.text(-lebar/2 + 40, startY + 12, pilihan.label, {
        fontSize: '17px', color: TEXT_COLORS.putih, fontStyle: 'bold'
      });
      
      const btnDesk = this.scene.add.text(-lebar/2 + 40, startY + 36, pilihan.deskripsi, {
        fontSize: '13px', color: TEXT_COLORS.abu, wordWrap: { width: lebar - 80 }
      });

      const efekTeks = this.scene.add.text(-lebar/2 + 40, startY + 60, this.formatEfek(pilihan.efek), {
        fontSize: '12px', color: TEXT_COLORS.teal
      });

      // Efek Hover
      btnBg.on('pointerover', () => border.setFillStyle(COLORS.teal));
      btnBg.on('pointerout', () => border.setFillStyle(COLORS.kuning));
      
      // Klik eksekusi
      btnBg.on('pointerdown', () => this.pilihAksi(pilihan, i));

      this.kontainer.add([btnBg, btnJudul, btnDesk, efekTeks]);
      startY += 95;
    });

    // Animasi Masuk
    this.bgOverlay.setVisible(true).setAlpha(0);
    this.kontainer.setVisible(true).setScale(0.8).setAlpha(0);

    this.scene.tweens.add({ targets: this.bgOverlay, alpha: 0.75, duration: 250 });
    this.scene.tweens.add({ targets: this.kontainer, scale: 1, alpha: 1, duration: 300, ease: 'Back.easeOut' });
  }

  private pilihAksi(pilihan: PilihanKartu, index: number): void {
    this.scene.tweens.add({
      targets: [this.kontainer, this.bgOverlay],
      alpha: 0,
      duration: 200,
      onComplete: () => {
        this.kontainer.setVisible(false);
        this.bgOverlay.setVisible(false);
        this.onPilihAksi(pilihan, index);
      }
    });
  }

  private formatEfek(efek: Partial<Resources>): string {
    return Object.entries(efek)
      .map(([k, v]) => `${k.toUpperCase()} ${(v as number) > 0 ? '+' : ''}${v}`)
      .join('  |  ');
  }
}