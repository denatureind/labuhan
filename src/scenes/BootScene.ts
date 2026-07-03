// ============================================================
// PELABUHAN HIJAU v3 — BootScene
// Preload aset, lalu pindah ke MenuScene
// ============================================================

import * as Phaser from 'phaser';
import { COLORS, TEXT_COLORS } from '../config';

export class BootScene extends Phaser.Scene {
  private teksLoading!: Phaser.GameObjects.Text;
  private barLatar!: Phaser.GameObjects.Rectangle;
  private barIsi!: Phaser.GameObjects.Rectangle;

  constructor() {
    super({ key: 'BootScene' });
  }

  preload(): void {
    this.buatTampilanLoading();

    // Pantau progres loading aset
    this.load.on('progress', (nilai: number) => {
      this.barIsi.setDisplaySize(Math.round(450 * nilai), 15);
      this.teksLoading.setText(`Memuat... ${Math.round(nilai * 100)}%`);
    });

    // Aset gambar (jika ada di public/assets/images/)
    
    // Memuat aset fasilitas pelabuhan (Kenney)
    this.load.image('img-bg', '/assets/images/bg.png');
    this.load.image('img-dermaga', '/assets/images/dermaga.png');
    this.load.image('img-gudang', '/assets/images/gudang.png');
    this.load.image('img-kantor', '/assets/images/kantor.png');
    this.load.image('img-tambak', '/assets/images/tambak.png');
    this.load.image('img-kapal', '/assets/images/kapal.png');
    this.load.image('img-pasar', '/assets/images/pasar.png');
    this.load.image('img-kargo', '/assets/images/kargo.png');
    this.load.image('img-mobil', '/assets/images/mvp.png'); 
    this.load.image('img-sedan', '/assets/images/sedan.png'); // Aset mobil sedan
    this.load.image('img-truk', '/assets/images/truk.png');   // Aset truk
    this.load.image('img-box', '/assets/images/box.png');     // Aset mobil box
    this.load.image('img-opening', '/assets/images/opening.png'); // Aset background menu
    this.load.image('img-pilih-karakter', '/assets/images/pilih-karakter.png'); // Aset background pilih karakter
  }

  create(): void {
    this.teksLoading.setText('Siap!');

    // Tween bar loading ke penuh lalu pindah scene
    this.tweens.add({
      targets: this.barIsi,
      displayWidth: 450,
      duration: 300,
      ease: 'Power2',
      onComplete: () => {
        this.time.delayedCall(400, () => {
          this.cameras.main.fadeOut(500, 0, 0, 0);
          this.cameras.main.once('camerafadeoutcomplete', () => {
            this.scene.start('MenuScene');
          });
        });
      },
    });
  }

  // ----------------------------------------------------------
  // TAMPILAN LOADING
  // ----------------------------------------------------------

  private buatTampilanLoading(): void {
    // Latar
    this.add.rectangle(600, 450, 1200, 900, COLORS.hitam);

    // Logo / judul
    this.add.text(600, 345, '⚓', { fontSize: '72px' }).setOrigin(0.5);

    this.add.text(600, 438, 'LABUHAN', {
      fontSize: '33px',
      color: TEXT_COLORS.teal,
      fontStyle: 'bold',
      letterSpacing: 4,
    }).setOrigin(0.5);

    this.add.text(600, 480, 'Harbor Simulation Nusantara', {
      fontSize: '19px',
      color: TEXT_COLORS.abu,
      fontStyle: 'italic',
    }).setOrigin(0.5);

    // Bar loading — latar
    this.barLatar = this.add.rectangle(600, 570, 450, 15, COLORS.gelapMuda).setOrigin(0.5);

    // Bar loading — isi
    this.barIsi = this.add.rectangle(375, 570, 0, 15, COLORS.teal).setOrigin(0, 0.5);

    // Teks persen
    this.teksLoading = this.add.text(600, 595, 'Memuat... 0%', {
      fontSize: '15px',
      color: TEXT_COLORS.abu,
    }).setOrigin(0.5, 0);
  }
}
