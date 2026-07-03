// ============================================================
// PELABUHAN HIJAU v3 — PopupMenu
// Popup saat pemain klik objek peta, tampilkan daftar aksi
// ============================================================

import * as Phaser from 'phaser';
import type { ObjekPeta, Resources } from '../types/index';
import { COLORS, TEXT_COLORS } from '../config';

const LEBAR_POPUP   = 360;
const TINGGI_HEADER = 87;
const TINGGI_AKSI   = 126;
const PADDING       = 15;

export class PopupMenu {
  private scene: Phaser.Scene;
  private kontainer: Phaser.GameObjects.Container;
  private onPilihAksi: (aksiId: string, objekId: string) => void;
  private objekAktif: ObjekPeta | null = null;

  constructor(
    scene: Phaser.Scene,
    onPilihAksi: (aksiId: string, objekId: string) => void,
  ) {
    this.scene = scene;
    this.onPilihAksi = onPilihAksi;
    this.kontainer = scene.add.container(0, 0).setDepth(10);
    this.kontainer.setVisible(false);

    scene.input.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
      if (this.kontainer.visible && !this.hitTest(pointer.x, pointer.y)) {
        this.sembunyikan();
      }
    });
  }

  // ----------------------------------------------------------
  // TAMPILKAN
  // ----------------------------------------------------------

  tampilkan(objek: ObjekPeta, resources: Resources, cooldownSisa: number): void {
    this.objekAktif = objek;
    this.kontainer.removeAll(true);

    const jumlahAksi = cooldownSisa > 0 ? 1 : objek.aksi.length;
    const tinggiTotal = TINGGI_HEADER + jumlahAksi * TINGGI_AKSI + PADDING;

    // Clamp posisi agar tidak overflow kiri (dashboard) atau kanan layar
    const px = Phaser.Math.Clamp(
      objek.x - LEBAR_POPUP / 2,
      250,                          // kiri: jangan masuk area dashboard (0–248)
      1200 - LEBAR_POPUP - 4,       // kanan: jangan keluar layar
    );
    const py = Phaser.Math.Clamp(
      objek.y - tinggiTotal - 20,
      5,
      847 - tinggiTotal,
    );
    this.kontainer.setPosition(px, py);

    // Background & border — koordinat RELATIF terhadap kontainer
    const border = this.buatRect(0, 0, LEBAR_POPUP + 4, tinggiTotal + 4, COLORS.teal, 0, 0.5);
    const bg     = this.buatRect(0, 0, LEBAR_POPUP, tinggiTotal, COLORS.panelBg, 0, 0.97);

    // Strip aksen atas
    const warnaStrip = cooldownSisa > 0 ? COLORS.merah : COLORS.teal;
    const strip = this.buatRect(0, 0, LEBAR_POPUP, 6, warnaStrip, 0, 0.9);

    // Judul
    const judul = this.buatTeks(LEBAR_POPUP / 2, 18, objek.nama, '19px', TEXT_COLORS.putih, 'bold');
    judul.setOrigin(0.5, 0);

    // Deskripsi
    const deskripsi = this.buatTeks(PADDING, 45, objek.deskripsi, '13px', TEXT_COLORS.abu);
    deskripsi.setWordWrapWidth(LEBAR_POPUP - PADDING * 2);
    deskripsi.setOrigin(0, 0);

    // Tombol tutup
    const tombolTutup = this.buatTeks(LEBAR_POPUP - 18, 10, '✕', '18px', TEXT_COLORS.abu);
    tombolTutup.setOrigin(1, 0).setInteractive({ cursor: 'pointer' });
    tombolTutup.on('pointerdown', () => this.sembunyikan());

    // Garis pemisah
    const garis = this.buatRect(PADDING, TINGGI_HEADER - 6, LEBAR_POPUP - PADDING * 2, 1, COLORS.abu, 0, 0.25);

    this.kontainer.add([border, bg, strip, judul, deskripsi, tombolTutup, garis]);

    // Konten aksi atau info cooldown
    if (cooldownSisa > 0) {
      this.renderCooldownInfo(cooldownSisa, TINGGI_HEADER);
    } else {
      objek.aksi.forEach((aksi, i) => {
        this.renderAksi(aksi, objek.id, resources, TINGGI_HEADER + i * TINGGI_AKSI);
      });
    }

    this.kontainer.setVisible(true);
    this.kontainer.setScale(0.88);
    this.scene.tweens.add({
      targets: this.kontainer,
      scaleX: 1, scaleY: 1,
      duration: 140,
      ease: 'Back.easeOut',
    });
  }

  // ----------------------------------------------------------
  // RENDER AKSI
  // ----------------------------------------------------------

  private renderAksi(
    aksi: ObjekPeta['aksi'][number],
    objekId: string,
    resources: Resources,
    offsetY: number,
  ): void {
    const bisaDilakukan = this.cekBiaya(aksi.biaya, resources);
    const warnaTeks = bisaDilakukan ? TEXT_COLORS.putih : TEXT_COLORS.abu;

    const bgAksi = this.buatRect(
      PADDING, offsetY + 6,
      LEBAR_POPUP - PADDING * 2, TINGGI_AKSI - 12,
      COLORS.gelapMuda, 0, bisaDilakukan ? 0.75 : 0.3,
    );

    const labelAksi = this.buatTeks(PADDING + 9, offsetY + 15, aksi.label, '16px', warnaTeks, 'bold');
    labelAksi.setOrigin(0, 0);

    const deskAksi = this.buatTeks(PADDING + 9, offsetY + 39, aksi.deskripsi, '12px', TEXT_COLORS.abu);
    deskAksi.setWordWrapWidth(LEBAR_POPUP - PADDING * 2 - 18);
    deskAksi.setOrigin(0, 0);

    const biayaTeks  = this.formatEfek(aksi.biaya, true);
    const hasilTeks  = this.formatEfek(aksi.hasil, false);
    const efekLabel  = this.buatTeks(
      PADDING + 9, offsetY + 90,
      `${biayaTeks}  →  ${hasilTeks}`,
      '12px', TEXT_COLORS.teal,
    );
    efekLabel.setOrigin(0, 0);

    this.kontainer.add([bgAksi, labelAksi, deskAksi, efekLabel]);

    if (!bisaDilakukan) return;

    bgAksi.setInteractive({ cursor: 'pointer' });
    bgAksi.on('pointerover', () => bgAksi.setAlpha(1));
    bgAksi.on('pointerout',  () => bgAksi.setAlpha(0.75));
    bgAksi.on('pointerdown', () => this.onPilihAksi(aksi.id, objekId));
  }

  // ----------------------------------------------------------
  // INFO COOLDOWN — semua elemen masuk kontainer
  // ----------------------------------------------------------

  private renderCooldownInfo(sisa: number, offsetY: number): void {
    const tCooldown = this.buatTeks(
      LEBAR_POPUP / 2, offsetY + 33,
      `⏳  Cooldown: ${sisa} hari lagi`,
      '16px', TEXT_COLORS.merah,
    );
    tCooldown.setOrigin(0.5, 0);

    const tKembali = this.buatTeks(
      LEBAR_POPUP / 2, offsetY + 66,
      'Kembali hari berikutnya',
      '13px', TEXT_COLORS.abu,
    );
    tKembali.setOrigin(0.5, 0);
  }

  // ----------------------------------------------------------
  // SEMBUNYIKAN
  // ----------------------------------------------------------

  sembunyikan(): void {
    this.scene.tweens.add({
      targets: this.kontainer,
      alpha: 0,
      duration: 120,
      onComplete: () => {
        this.kontainer.setVisible(false).setAlpha(1);
        this.objekAktif = null;
      },
    });
  }

  // ----------------------------------------------------------
  // HELPER FACTORY — buat elemen & langsung tambah ke kontainer
  // ----------------------------------------------------------

  private buatRect(
    x: number, y: number, lebar: number, tinggi: number,
    warna: number, origin: number, alpha: number,
  ): Phaser.GameObjects.Rectangle {
    const rect = this.scene.add.rectangle(x, y, lebar, tinggi, warna)
      .setOrigin(origin)
      .setAlpha(alpha);
    this.kontainer.add(rect);
    return rect;
  }

  private buatTeks(
    x: number, y: number, isi: string,
    size: string, warna: string, style?: string,
  ): Phaser.GameObjects.Text {
    const t = this.scene.add.text(x, y, isi, {
      fontSize: size,
      color: warna,
      fontStyle: style ?? 'normal',
    });
    this.kontainer.add(t);
    return t;
  }

  private cekBiaya(biaya: Partial<Resources>, resources: Resources): boolean {
    return Object.entries(biaya).every(
      ([k, v]) => resources[k as keyof Resources] >= (v ?? 0),
    );
  }

  private formatEfek(efek: Partial<Resources>, isBiaya: boolean): string {
    return Object.entries(efek)
      .map(([k, v]) => `${k} ${isBiaya ? '-' : '+'}${v}`)
      .join(', ');
  }

  private hitTest(px: number, py: number): boolean {
    if (!this.kontainer.visible) return false;
    const { x, y } = this.kontainer;
    return px >= x && px <= x + LEBAR_POPUP && py >= y && py <= y + 675;
  }
}
