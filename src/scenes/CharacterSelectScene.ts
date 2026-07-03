// ============================================================
// PELABUHAN HIJAU v3 — CharacterSelectScene
// Pemain memilih satu dari 3 karakter sebelum game dimulai
// ============================================================

import * as Phaser from 'phaser';
import type { Karakter, KarakterId } from '../types/index';
import { DAFTAR_KARAKTER } from '../data/characters';
import { COLORS, TEXT_COLORS } from '../config';

const LEBAR_KARTU = 330;
const TINGGI_KARTU = 495;
const KARTU_Y = 195;
const KARTU_X_MULAI = 45;
const JARAK_KARTU = 22;

export class CharacterSelectScene extends Phaser.Scene {
  private karakterDipilih: KarakterId | null = null;
  private grupKartu: Phaser.GameObjects.Container[] = [];
  private tombolMulai!: Phaser.GameObjects.Container;

  constructor() {
    super({ key: 'CharacterSelectScene' });
  }

  create(): void {
    this.buatBackground();
    this.buatKartuKarakter();
    this.buatTombolMulai();
  }

  // ----------------------------------------------------------
  // BACKGROUND
  // ----------------------------------------------------------

  private buatBackground(): void {
    // Menggunakan gambar background yang baru ditambahkan
    this.add.image(600, 450, 'img-pilih-karakter')
      .setOrigin(0.5)
      .setDisplaySize(1200, 900); // Memastikan gambar memenuhi layar
  }

  // ----------------------------------------------------------
  // KARTU KARAKTER (3 kartu)
  // ----------------------------------------------------------

  private buatKartuKarakter(): void {
    const POSISI_KARTU = [
      { x: 71, y: 266 },   // Posisi Karakter 1 (Pak Bahari)
      { x: 435, y: 274 },  // Posisi Karakter 2 (Bu Citra)
      { x: 799, y: 261 }   // Posisi Karakter 3 (Pak Rendra)
    ];

    DAFTAR_KARAKTER.forEach((karakter, indeks) => {
      const pos = POSISI_KARTU[indeks];
      const kontainer = this.buatSatuKartu(karakter, pos.x, pos.y);
      this.grupKartu.push(kontainer);
    });
  }

  private buatSatuKartu(karakter: Karakter, x: number, y: number): Phaser.GameObjects.Container {
    const kontainer = this.add.container(x, y);

    // Panel transparan (Alpha 0) hanya sebagai area klik (hit area)
    // Karena background gambar Anda sudah ada desain kotaknya
    const panel = this.add.rectangle(0, 0, LEBAR_KARTU, TINGGI_KARTU, 0x000000, 0)
      .setOrigin(0, 0)
      .setInteractive({ cursor: 'pointer' });

    // Garis tepi (stroke) untuk efek highlight saat hover & klik
    const border = this.add.graphics();
    border.lineStyle(4, COLORS.putih, 1);
    border.strokeRect(0, 0, LEBAR_KARTU, TINGGI_KARTU);
    border.setAlpha(0); // Sembunyikan defaultnya

    // Kumpulkan semua elemen ke kontainer
    kontainer.add([
      border, panel
    ]);

    // Interaksi klik kartu
    panel.on('pointerdown', () => this.pilihKarakter(karakter.id, indeks(kontainer)));
    panel.on('pointerover', () => {
      if (this.karakterDipilih !== karakter.id) {
        border.setAlpha(0.4); // Munculkan garis putih tipis saat hover
      }
    });
    panel.on('pointerout', () => {
      if (this.karakterDipilih !== karakter.id) {
        border.setAlpha(0); // Sembunyikan lagi
      }
    });

    // --- FITUR DRAG & DROP DEBUG ---
    // Tarik konten teks kartu ini dengan mouse untuk mengepaskan posisinya ke gambar background
    this.input.setDraggable(panel);
    panel.on('drag', (pointer: Phaser.Input.Pointer) => {
      kontainer.x += pointer.position.x - pointer.prevPosition.x;
      kontainer.y += pointer.position.y - pointer.prevPosition.y;
    });
    panel.on('dragend', () => {
      console.log(`📍 Posisi Pas [${karakter.nama}] -> x: ${Math.round(kontainer.x)}, y: ${Math.round(kontainer.y)}`);
    });

    // Simpan referensi border & panel di data kontainer untuk highlight
    kontainer.setData('border', border);
    kontainer.setData('panel', panel);
    kontainer.setData('karakterId', karakter.id);
    kontainer.setData('warnaKarakter', karakter.warna);

    return kontainer;

    function indeks(k: Phaser.GameObjects.Container): number {
      return DAFTAR_KARAKTER.findIndex((c) => c.id === k.getData('karakterId'));
    }
  }

  // ----------------------------------------------------------
  // TOMBOL MULAI (muncul setelah karakter dipilih)
  // ----------------------------------------------------------

  private buatTombolMulai(): void {
    this.tombolMulai = this.add.container(600, 810);

    const bg = this.add.rectangle(0, 0, 330, 66, COLORS.hijau)
      .setOrigin(0.5)
      .setInteractive({ cursor: 'pointer' });

    const teks = this.add.text(0, 0, 'MULAI PETUALANGAN  →', {
      fontSize: '19px',
      color: TEXT_COLORS.putih,
      fontStyle: 'bold',
      letterSpacing: 1,
    }).setOrigin(0.5);

    bg.on('pointerover', () => bg.setFillStyle(COLORS.hijauTua));
    bg.on('pointerout', () => bg.setFillStyle(COLORS.hijau));
    bg.on('pointerdown', () => this.mulaiGame());

    this.tombolMulai.add([bg, teks]);
    this.tombolMulai.setAlpha(0); // tersembunyi dulu
  }

  // ----------------------------------------------------------
  // LOGIKA PEMILIHAN KARAKTER
  // ----------------------------------------------------------

  private pilihKarakter(id: KarakterId, _indeks: number): void {
    this.karakterDipilih = id;

    // Reset semua kartu ke tampilan normal
    this.grupKartu.forEach((kontainer) => {
      const border = kontainer.getData('border') as Phaser.GameObjects.Graphics;
      border.setAlpha(0);
    });

    // Highlight kartu yang dipilih
    const kartuDipilih = this.grupKartu.find(
      (k) => k.getData('karakterId') === id,
    );
    if (kartuDipilih) {
      const border = kartuDipilih.getData('border') as Phaser.GameObjects.Graphics;
      const warna = kartuDipilih.getData('warnaKarakter') as number;
      border.clear();
      border.lineStyle(5, warna, 1); // Buat garis kotak tebal dengan warna karakter
      border.strokeRect(0, 0, LEBAR_KARTU, TINGGI_KARTU);
      border.setAlpha(1);
    }

    // Tampilkan tombol mulai dengan fade in
    this.tweens.add({
      targets: this.tombolMulai,
      alpha: 1,
      duration: 300,
      ease: 'Power2',
    });
  }

  private mulaiGame(): void {
    if (!this.karakterDipilih) return;

    // Fade out lalu pindah ke GameScene dengan data karakter
    this.cameras.main.fadeOut(400, 0, 0, 0);
    this.cameras.main.once('camerafadeoutcomplete', () => {
      this.scene.start('GameScene', { karakterId: this.karakterDipilih });
    });
  }
}
