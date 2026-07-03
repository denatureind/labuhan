// ============================================================
// PELABUHAN HIJAU v3 — MenuScene
// Layar utama: judul, tombol mulai, cara bermain, kredit
// ============================================================

import * as Phaser from 'phaser';
import { COLORS, TEXT_COLORS } from '../config';

export class MenuScene extends Phaser.Scene {
  private panelCara!: Phaser.GameObjects.Container;

  constructor() {
    super({ key: 'MenuScene' });
  }

  create(): void {
    this.buatBackground();
    this.buatJudul();
    this.buatTombol();
    this.buatPanelCaraBermain();
    this.buatKredit();

    this.cameras.main.fadeIn(600, 0, 0, 0);
  }

  // ----------------------------------------------------------
  // BACKGROUND
  // ----------------------------------------------------------

  private buatBackground(): void {
    // Menggunakan gambar background opening.png
    this.add.image(600, 450, 'img-opening')
      .setOrigin(0.5)
      .setDisplaySize(1200, 900); // Memastikan ukurannya pas penuh satu layar
  }

  // ----------------------------------------------------------
  // JUDUL
  // ----------------------------------------------------------

  private buatJudul(): void {
    // Ikon jangkar
    this.add.text(600, 82, '⚓', { fontSize: '60px' }).setOrigin(0.5);

    // Nama game
    this.add.text(600, 162, 'LABUHAN', {
      fontSize: '48px',
      color: TEXT_COLORS.putih,
      fontStyle: 'bold',
      letterSpacing: 4,
    }).setOrigin(0.5);

    // Subjudul
    this.add.text(600, 222, 'Harbor Simulation Nusantara', {
      fontSize: '24px',
      color: TEXT_COLORS.teal,
      fontStyle: 'italic',
    }).setOrigin(0.5);

    // Tagline
    this.add.text(600, 261, 'Kelola pelabuhan, jaga laut, sejahterakan rakyat', {
      fontSize: '16px',
      color: TEXT_COLORS.abu,
    }).setOrigin(0.5);

    // Garis dekoratif
    this.add.rectangle(600, 294, 300, 1, COLORS.teal).setAlpha(0.4);
  }

  // ----------------------------------------------------------
  // TOMBOL UTAMA
  // ----------------------------------------------------------

  private buatTombol(): void {
    // --- TOMBOL MULAI BERMAIN (Modern Tailwind 'Emerald' Button) ---
    const wadahMulai = this.add.container(600, 380);

    // Hit Area Interaktif (Transparan)
    const hitAreaMulai = this.add.rectangle(0, 0, 320, 64, 0x000000, 0)
      .setInteractive({ cursor: 'pointer' });

    // Latar dengan Rounded Corners (Graphics)
    const bgMulai = this.add.graphics();
    const drawBgMulai = (warna: number) => {
      bgMulai.clear();
      // Drop shadow lembut (Tailwind shadow-lg)
      bgMulai.fillStyle(0x000000, 0.15);
      bgMulai.fillRoundedRect(-160, -32 + 8, 320, 64, 16);
      // Latar utama
      bgMulai.fillStyle(warna, 1);
      bgMulai.fillRoundedRect(-160, -32, 320, 64, 16);
    };
    drawBgMulai(0x10B981); // Emerald 500

    const teksMulai = this.add.text(0, 0, 'MULAI BERMAIN', {
      fontFamily: 'system-ui, -apple-system, sans-serif',
      fontSize: '20px',
      color: '#ffffff',
      fontStyle: '700',
      letterSpacing: 2
    }).setOrigin(0.5);

    wadahMulai.add([bgMulai, teksMulai, hitAreaMulai]);

    // Efek Hover Modern (Scale Up + Lighter Color)
    hitAreaMulai.on('pointerover', () => {
      drawBgMulai(0x34D399); // Emerald 400 (Lebih cerah)
      this.tweens.add({ targets: wadahMulai, scale: 1.04, duration: 200, ease: 'Cubic.easeOut' });
    });
    hitAreaMulai.on('pointerout', () => {
      drawBgMulai(0x10B981); // Emerald 500
      this.tweens.add({ targets: wadahMulai, scale: 1, duration: 200, ease: 'Cubic.easeOut' });
    });
    hitAreaMulai.on('pointerdown', () => {
      this.tweens.add({ targets: wadahMulai, scale: 0.96, duration: 100, ease: 'Cubic.easeOut' });
      this.time.delayedCall(150, () => {
        this.cameras.main.fadeOut(400, 0, 0, 0);
        this.cameras.main.once('camerafadeoutcomplete', () => {
          this.scene.start('CharacterSelectScene');
        });
      });
    });

    // --- TOMBOL CARA BERMAIN (Modern Tailwind 'Slate/Outline' Button) ---
    const wadahCara = this.add.container(600, 465);

    const hitAreaCara = this.add.rectangle(0, 0, 240, 56, 0x000000, 0)
      .setInteractive({ cursor: 'pointer' });

    const bgCara = this.add.graphics();
    const drawBgCara = (fillWarna: number, fillAlpha: number, borderWarna: number) => {
      bgCara.clear();
      // Fill transparansi gelap
      bgCara.fillStyle(fillWarna, fillAlpha);
      bgCara.fillRoundedRect(-120, -28, 240, 56, 14);
      // Stroke tipis modern
      bgCara.lineStyle(2, borderWarna, 1);
      bgCara.strokeRoundedRect(-120, -28, 240, 56, 14);
    };
    drawBgCara(0x1E293B, 0.7, 0x334155); // Slate 800 background, Slate 700 border

    const teksCara = this.add.text(0, 0, 'Cara Bermain', {
      fontFamily: 'system-ui, -apple-system, sans-serif',
      fontSize: '17px',
      color: '#94A3B8', // Slate 400
      fontStyle: '600',
      letterSpacing: 1
    }).setOrigin(0.5);

    wadahCara.add([bgCara, teksCara, hitAreaCara]);

    hitAreaCara.on('pointerover', () => {
      drawBgCara(0x334155, 0.9, 0x475569); // Slate 700 background
      teksCara.setColor('#F8FAFC'); // Slate 50
      this.tweens.add({ targets: wadahCara, scale: 1.04, duration: 200, ease: 'Cubic.easeOut' });
    });
    hitAreaCara.on('pointerout', () => {
      drawBgCara(0x1E293B, 0.7, 0x334155);
      teksCara.setColor('#94A3B8');
      this.tweens.add({ targets: wadahCara, scale: 1, duration: 200, ease: 'Cubic.easeOut' });
    });
    hitAreaCara.on('pointerdown', () => {
      this.tweens.add({ targets: wadahCara, scale: 0.96, duration: 100, ease: 'Cubic.easeOut' });
      this.time.delayedCall(150, () => {
        this.tweens.add({ targets: wadahCara, scale: 1, duration: 100 });
        this.togglePanelCara();
      });
    });
  }

  // ----------------------------------------------------------
  // PANEL CARA BERMAIN
  // ----------------------------------------------------------

  private buatPanelCaraBermain(): void {
    this.panelCara = this.add.container(600, 450).setDepth(5).setVisible(false);

    const lebar = 750;
    const tinggi = 510;

    // --- MODERN TAILWIND MODAL BACKGROUND ---
    const bg = this.add.graphics();
    // Soft Shadow
    bg.fillStyle(0x000000, 0.3);
    bg.fillRoundedRect(-lebar / 2 + 10, -tinggi / 2 + 10, lebar, tinggi, 24);
    // Latar Dark Mode Modern
    bg.fillStyle(0x0F172A, 0.98); // Slate 900
    bg.fillRoundedRect(-lebar / 2, -tinggi / 2, lebar, tinggi, 24);
    // Garis Tepi Tipis
    bg.lineStyle(1, 0x334155, 1); // Slate 700
    bg.strokeRoundedRect(-lebar / 2, -tinggi / 2, lebar, tinggi, 24);

    const judul = this.add.text(0, -tinggi / 2 + 40, 'Cara Bermain', {
      fontFamily: 'system-ui, -apple-system, sans-serif',
      fontSize: '28px',
      color: '#38BDF8', // Tailwind Sky 400
      fontStyle: '800',
    }).setOrigin(0.5, 0);

    const garisJudul = this.add.rectangle(0, -tinggi / 2 + 85, lebar - 120, 1, 0x334155);

    const isi =
      '1.  Pilih pemimpin pelabuhan — setiap karakter punya keahlian unik\n\n' +
      '2.  Klik objek di peta untuk melakukan aksi (dermaga, gudang, kapal, dll)\n\n' +
      '3.  Gunakan skill aktif (tombol ⚡) untuk efek besar saat kritis\n\n' +
      '4.  Tekan "Akhiri Hari" setelah selesai beraktivitas\n\n' +
      '5.  Kelola 6 resource: Dana 💰 Reputasi ⭐ Lingkungan 🌊\n' +
      '    SDM 👷 Infrastruktur 🏗 Komunitas 🤝\n\n' +
      '6.  Hindari resource menyentuh nol — game berakhir!\n\n' +
      '7.  Capai hari ke-30 dengan strategi terbaik untuk ending emas 🏆';

    const teksIsi = this.add.text(0, -tinggi / 2 + 115, isi, {
      fontFamily: 'system-ui, -apple-system, sans-serif',
      fontSize: '17px',
      color: '#CBD5E1', // Slate 300
      wordWrap: { width: lebar - 120 },
      lineSpacing: 8,
      align: 'left',
    }).setOrigin(0.5, 0);

    // --- TOMBOL TUTUP MODAL (Modern 'Rose' Button) ---
    const wadahTutup = this.add.container(0, tinggi / 2 - 50);
    const hitAreaTutup = this.add.rectangle(0, 0, 160, 48, 0x000000, 0)
      .setInteractive({ cursor: 'pointer' });
      
    const bgTutup = this.add.graphics();
    const drawBgTutup = (warna: number) => {
      bgTutup.clear();
      bgTutup.fillStyle(warna, 1);
      bgTutup.fillRoundedRect(-80, -24, 160, 48, 12);
    };
    drawBgTutup(0xF43F5E); // Rose 500

    const teksTutup = this.add.text(0, 0, 'Tutup', {
      fontFamily: 'system-ui, -apple-system, sans-serif',
      fontSize: '16px',
      color: '#FFFFFF',
      fontStyle: '600',
      letterSpacing: 1
    }).setOrigin(0.5);

    wadahTutup.add([bgTutup, teksTutup, hitAreaTutup]);

    hitAreaTutup.on('pointerover', () => drawBgTutup(0xFB7185)); // Rose 400
    hitAreaTutup.on('pointerout', () => drawBgTutup(0xF43F5E));
    hitAreaTutup.on('pointerdown', () => this.togglePanelCara());

    this.panelCara.add([bg, judul, garisJudul, teksIsi, wadahTutup]);
  }

  private togglePanelCara(): void {
    const tampil = !this.panelCara.visible;
    this.panelCara.setVisible(tampil);
    if (tampil) {
      this.panelCara.setAlpha(0).setScale(0.9);
      this.tweens.add({
        targets: this.panelCara,
        alpha: 1, scaleX: 1, scaleY: 1,
        duration: 200,
        ease: 'Back.easeOut',
      });
    }
  }

  // ----------------------------------------------------------
  // KREDIT
  // ----------------------------------------------------------

  private buatKredit(): void {
    this.add.text(600, 855, 'FIKSI 2026  •  Bidang Game Digital  •  Kategori Rencana Usaha', {
      fontSize: '13px',
      color: TEXT_COLORS.abu,
      letterSpacing: 1,
    }).setOrigin(0.5);

    this.add.text(600, 832, 'Phaser.js v4  +  TypeScript  +  Vite', {
      fontSize: '12px',
      color: '#2B2D42',
    }).setOrigin(0.5);
  }
}
