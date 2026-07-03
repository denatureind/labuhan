// ============================================================
// PELABUHAN HIJAU v3 — EndingScene
// Menampilkan 5 ending + kondisi game over
// ============================================================

import * as Phaser from 'phaser';
import type { EndingId, Resources } from '../types/index';
import { COLORS, TEXT_COLORS, GAME_CONFIG } from '../config';

// ----------------------------------------------------------
// DATA KONTEN SETIAP ENDING
// ----------------------------------------------------------

interface EndingKonten {
  judul: string;
  subjudul: string;
  narasi: string;
  pesanAkhir: string;
  warnaBg: number;
  warnaAksen: number;
  ikon: string;
}

const KONTEN_ENDING: Record<EndingId | 'game_over', EndingKonten> = {
  pelabuhan_emas: {
    judul: 'PELABUHAN EMAS',
    subjudul: 'Harbor Simulation Nusantara Bersinar',
    narasi:
      'Selamat! Di bawah kepemimpinanmu, Pelabuhan Harbor Simulation Nusantara berhasil ' +
      'menyeimbangkan pertumbuhan ekonomi, kesejahteraan nelayan, dan ' +
      'kelestarian laut. Kisah suksesmu menjadi inspirasi pelabuhan ' +
      'hijau di seluruh Nusantara.',
    pesanAkhir: 'Triple Bottom Line tercapai — Profit, Planet, dan People.',
    warnaBg: 0x1B3A2D,
    warnaAksen: COLORS.kuning,
    ikon: '🏆',
  },

  raja_bisnis: {
    judul: 'RAJA BISNIS',
    subjudul: 'Profit di Atas Segalanya',
    narasi:
      'Pelabuhan Harbor Simulation Nusantara kini menjadi mesin uang yang menggiurkan. ' +
      'Namun laut yang dulu jernih kini mulai keruh, dan suara nelayan ' +
      'lokal semakin tenggelam di balik deru mesin industri. ' +
      'Apakah ini benar-benar kemajuan?',
    pesanAkhir: 'Keberhasilan sejati bukan hanya soal angka di neraca.',
    warnaBg: 0x2A1B0E,
    warnaAksen: COLORS.oranye,
    ikon: '💼',
  },

  pejuang_hijau: {
    judul: 'PEJUANG HIJAU',
    subjudul: 'Laut yang Terjaga',
    narasi:
      'Perairanmu adalah yang terbersih di provinsi. Para peneliti kelautan ' +
      'berdatangan untuk mempelajari keberhasilan konservasi Harbor Simulation Nusantara. ' +
      'Meski kas sedikit menipis, warisan lingkungan yang kamu tinggalkan ' +
      'tak ternilai harganya.',
    pesanAkhir: 'Bumi yang sehat adalah warisan terbaik untuk generasi berikutnya.',
    warnaBg: 0x0A2A1F,
    warnaAksen: COLORS.teal,
    ikon: '🌊',
  },

  bapak_rakyat: {
    judul: 'BAPAK RAKYAT',
    subjudul: 'Pelabuhan Milik Semua',
    narasi:
      'Harbor Simulation Nusantara bukan sekadar pelabuhan — ia adalah rumah. ' +
      'Nelayan bangga, karyawan loyal, dan warga merasa dilibatkan. ' +
      'Meski infrastruktur belum sempurna, rasa kebersamaan yang ' +
      'kamu bangun adalah fondasi yang paling kuat.',
    pesanAkhir: 'Komunitas yang kuat adalah aset yang tak bisa dibeli uang.',
    warnaBg: 0x1A1A3E,
    warnaAksen: COLORS.ungu,
    ikon: '🤝',
  },

  pelabuhan_terlupakan: {
    judul: 'PELABUHAN TERLUPAKAN',
    subjudul: 'Muara yang Pudar',
    narasi:
      'Harbor Simulation Nusantara berjalan — tapi tanpa arah yang jelas. ' +
      'Potensi besar yang ada tidak pernah dioptimalkan. ' +
      'Tidak ada yang benar-benar rusak, tapi tidak ada yang ' +
      'benar-benar berhasil. Masih ada waktu untuk mencoba lagi.',
    pesanAkhir: 'Setiap keputusan kecil membentuk masa depan yang besar.',
    warnaBg: 0x1A1A2E,
    warnaAksen: COLORS.abu,
    ikon: '🌫️',
  },

  game_over: {
    judul: 'GAME OVER',
    subjudul: 'Pelabuhan Tidak Bisa Dilanjutkan',
    narasi: '', // diisi dinamis dari data penyebab
    pesanAkhir: 'Setiap kegagalan adalah pelajaran. Coba lagi dengan strategi berbeda.',
    warnaBg: 0x1A0A0A,
    warnaAksen: COLORS.merah,
    ikon: '💔',
  },
};

// ----------------------------------------------------------
// ENDING SCENE
// ----------------------------------------------------------

export class EndingScene extends Phaser.Scene {
  private endingId!: EndingId | 'game_over';
  private resources?: Resources;
  private penyebab?: string;
  private judulGameOver?: string;
  private deskripsiGameOver?: string;
  private hariTerakhir?: number;

  constructor() {
    super({ key: 'EndingScene' });
  }

  init(data: {
    endingId: EndingId | 'game_over';
    resources?: Resources;
    penyebab?: string;
    judul?: string;
    deskripsi?: string;
    hari?: number;
  }): void {
    this.endingId = data.endingId ?? 'pelabuhan_terlupakan';
    this.resources = data.resources;
    this.penyebab = data.penyebab;
    this.judulGameOver = data.judul;
    this.deskripsiGameOver = data.deskripsi;
    this.hariTerakhir = data.hari;
  }

  create(): void {
    const konten = KONTEN_ENDING[this.endingId];

    this.buatBackground(konten);
    this.buatKontenUtama(konten);

    if (this.resources) {
      this.buatRingkasanResource(this.resources);
    }

    this.buatTombolAksi();

    // Fade in
    this.cameras.main.fadeIn(800, 0, 0, 0);

    // Animasi elemen masuk
    this.time.delayedCall(400, () => this.animasiMasuk());
  }

  // ----------------------------------------------------------
  // BACKGROUND
  // ----------------------------------------------------------

  private buatBackground(konten: EndingKonten): void {
    // Latar utama gelap sesuai ending
    this.add.rectangle(600, 450, 1200, 900, konten.warnaBg);

    // Gradient aksen atas
    this.add.rectangle(600, 0, 1200, 270, konten.warnaAksen)
      .setOrigin(0.5, 0)
      .setAlpha(0.08);

    // Garis aksen atas
    this.add.rectangle(600, 4, 1200, 6, konten.warnaAksen).setAlpha(0.8);

    // Pola titik dekoratif (grid sederhana dari fillRect)
    for (let col = 0; col < 16; col++) {
      for (let row = 0; row < 12; row++) {
        this.add.rectangle(col * 79 + 15, row * 79 + 15, 2, 2, konten.warnaAksen)
          .setAlpha(0.06);
      }
    }
  }

  // ----------------------------------------------------------
  // KONTEN UTAMA
  // ----------------------------------------------------------

  private buatKontenUtama(konten: EndingKonten): void {
    // Ikon besar
    this.add.text(600, 90, konten.ikon, {
      fontSize: '78px',
    }).setOrigin(0.5).setName('ikon');

    // Judul ending
    this.add.text(600, 192, konten.judul, {
      fontSize: '42px',
      color: '#' + konten.warnaAksen.toString(16).padStart(6, '0'),
      fontStyle: 'bold',
      letterSpacing: 3,
    }).setOrigin(0.5).setName('judul');

    // Subjudul
    this.add.text(600, 246, konten.subjudul, {
      fontSize: '21px',
      color: TEXT_COLORS.abu,
      fontStyle: 'italic',
    }).setOrigin(0.5).setName('subjudul');

    // Garis pemisah
    this.add.rectangle(600, 282, 450, 1, konten.warnaAksen).setAlpha(0.4);

    // Narasi (game over pakai deskripsi dinamis)
    const teksNarasi =
      this.endingId === 'game_over'
        ? (this.deskripsiGameOver ?? konten.narasi)
        : konten.narasi;

    this.add.text(600, 300, teksNarasi, {
      fontSize: '18px',
      color: TEXT_COLORS.putih,
      wordWrap: { width: 780 },
      lineSpacing: 6,
      align: 'center',
    }).setOrigin(0.5, 0).setName('narasi');

    // Game over: info hari bertahan
    if (this.endingId === 'game_over' && this.hariTerakhir) {
      this.add.text(600, 427, `Bertahan hingga hari ke-${this.hariTerakhir} dari ${GAME_CONFIG.totalHari}`, {
        fontSize: '16px',
        color: TEXT_COLORS.merah,
        fontStyle: 'italic',
      }).setOrigin(0.5, 0);

      if (this.judulGameOver) {
        this.add.text(600, 454, `Penyebab: ${this.judulGameOver}`, {
          fontSize: '16px',
          color: TEXT_COLORS.oranye,
        }).setOrigin(0.5, 0);
      }
    }

    // Pesan akhir / moral
    this.add.rectangle(600, 495, 840, 60, 0x000000).setAlpha(0.3);
    this.add.text(600, 495, `"${konten.pesanAkhir}"`, {
      fontSize: '16px',
      color: '#' + konten.warnaAksen.toString(16).padStart(6, '0'),
      fontStyle: 'italic',
      wordWrap: { width: 780 },
      align: 'center',
    }).setOrigin(0.5).setName('pesan');
  }

  // ----------------------------------------------------------
  // RINGKASAN 6 RESOURCE (hanya untuk ending normal, bukan game over)
  // ----------------------------------------------------------

  private buatRingkasanResource(resources: Resources): void {
    const keys: (keyof Resources)[] = [
      'dana', 'reputasi', 'lingkungan', 'sdm', 'infrastruktur', 'komunitas',
    ];
    const ikon: Record<string, string> = {
      dana: '💰', reputasi: '⭐', lingkungan: '🌊',
      sdm: '👷', infrastruktur: '🏗', komunitas: '🤝',
    };
    const maks: Record<string, number> = {
      dana: 500, reputasi: 100, lingkungan: 100,
      sdm: 100, infrastruktur: 100, komunitas: 100,
    };
    const warnaBar: Record<string, number> = {
      dana: COLORS.kuning, reputasi: COLORS.oranye, lingkungan: COLORS.teal,
      sdm: COLORS.hijau, infrastruktur: COLORS.abu, komunitas: COLORS.ungu,
    };

    const startX = 142;
    const startY = 555;
    const lebarBar = 135;
    const kolomW = 165;

    this.add.text(600, 537, 'KONDISI AKHIR', {
      fontSize: '13px',
      color: TEXT_COLORS.abu,
      letterSpacing: 2,
    }).setOrigin(0.5, 0);

    keys.forEach((key, i) => {
      const col = i % 3;
      const row = Math.floor(i / 3);
      const x = startX + col * kolomW;
      const y = startY + row * 57;

      const nilai = resources[key];
      const persen = Math.min(1, nilai / maks[key]);
      const lebarIsi = Math.round(lebarBar * persen);
      const warnaAktif = persen < 0.2 ? COLORS.merah : warnaBar[key];

      // Ikon + label
      this.add.text(x, y, `${ikon[key]} ${key.toUpperCase()}`, {
        fontSize: '12px',
        color: TEXT_COLORS.abu,
      }).setOrigin(0, 0);

      // Bar latar
      this.add.rectangle(x, y + 21, lebarBar, 12, COLORS.gelapMuda).setOrigin(0, 0);
      // Bar isi
      this.add.rectangle(x, y + 21, lebarIsi, 12, warnaAktif).setOrigin(0, 0).setAlpha(0.9);
      // Nilai
      this.add.text(x + lebarBar + 6, y + 21, String(Math.round(nilai)), {
        fontSize: '12px',
        color: TEXT_COLORS.putih,
      }).setOrigin(0, 0);
    });
  }

  // ----------------------------------------------------------
  // TOMBOL AKSI (Main Menu & Coba Lagi)
  // ----------------------------------------------------------

  private buatTombolAksi(): void {
    const yTombol = 810;

    // Tombol Coba Lagi
    const bgUlang = this.add.rectangle(420, yTombol, 255, 63, COLORS.hijau)
      .setOrigin(0.5)
      .setInteractive({ cursor: 'pointer' });
    this.add.text(420, yTombol, '↺  COBA LAGI', {
      fontSize: '19px',
      color: TEXT_COLORS.putih,
      fontStyle: 'bold',
    }).setOrigin(0.5);

    bgUlang.on('pointerover', () => bgUlang.setAlpha(0.8));
    bgUlang.on('pointerout', () => bgUlang.setAlpha(1));
    bgUlang.on('pointerdown', () => {
      this.cameras.main.fadeOut(400, 0, 0, 0);
      this.cameras.main.once('camerafadeoutcomplete', () => {
        this.scene.start('CharacterSelectScene');
      });
    });

    // Tombol Main Menu
    const bgMenu = this.add.rectangle(780, yTombol, 255, 63, COLORS.navy)
      .setOrigin(0.5)
      .setInteractive({ cursor: 'pointer' });
    this.add.text(780, yTombol, '⌂  MENU UTAMA', {
      fontSize: '19px',
      color: TEXT_COLORS.putih,
      fontStyle: 'bold',
    }).setOrigin(0.5);

    bgMenu.on('pointerover', () => bgMenu.setAlpha(0.8));
    bgMenu.on('pointerout', () => bgMenu.setAlpha(1));
    bgMenu.on('pointerdown', () => {
      this.cameras.main.fadeOut(400, 0, 0, 0);
      this.cameras.main.once('camerafadeoutcomplete', () => {
        this.scene.start('MenuScene');
      });
    });
  }

  // ----------------------------------------------------------
  // ANIMASI ELEMEN MASUK
  // ----------------------------------------------------------

  private animasiMasuk(): void {
    const namaElemen = ['ikon', 'judul', 'subjudul', 'narasi', 'pesan'];
    namaElemen.forEach((nama, i) => {
      const obj = this.children.getByName(nama) as Phaser.GameObjects.GameObject;
      if (!obj) return;
      const go = obj as Phaser.GameObjects.Text;
      go.setAlpha(0).setY(go.y + 30);
      this.tweens.add({
        targets: go,
        alpha: 1,
        y: go.y - 30,
        duration: 400,
        delay: i * 120,
        ease: 'Power2',
      });
    });
  }
}
