// ============================================================
// PELABUHAN HIJAU v3 — GameScene
// Gameplay utama: peta interaktif, kartu kejadian, skill, skenario
// ============================================================

import * as Phaser from 'phaser';
import type { KarakterId, Resources, ObjekPeta, LogHarian } from '../types/index';
import { COLORS, TEXT_COLORS, GAME_CONFIG } from '../config';
import { ResourceSystem } from '../systems/ResourceSystem';
import { SkillSystem } from '../systems/SkillSystem';
import { ScenarioSystem } from '../systems/ScenarioSystem';
import { Dashboard } from '../ui/Dashboard';
import { PopupMenu } from '../ui/PopupMenu';
import { EventCard } from '../ui/EventCard';
import { DAFTAR_KEJADIAN } from '../data/events';
import { DAFTAR_OBJEK_PETA, DAFTAR_DEKORASI } from '../data/mapObjects';

export class GameScene extends Phaser.Scene {
  // Sistem utama
  private resourceSystem!: ResourceSystem;
  private skillSystem!: SkillSystem;
  private scenarioSystem!: ScenarioSystem;

  // UI
  private dashboard!: Dashboard;
  private popupMenu!: PopupMenu;
  private eventCard!: EventCard;

  // State
  private hari = 1;
  private karakterId!: KarakterId;
  private logHarian: LogHarian[] = [];
  private idKejadianSelesai: Set<string> = new Set();
  private objekCooldown: Record<string, number> = {};
  private sedangKartu = false;

  // Elemen peta
  private grupObjek: Phaser.GameObjects.Container[] = [];
  
  // Efek visual dinamis
  private overlayPolusi!: Phaser.GameObjects.Rectangle;

  // HUD elemen
  private teksHari!: Phaser.GameObjects.Text;
  private tombolSkill!: Phaser.GameObjects.Container;
  private teksSkillInfo!: Phaser.GameObjects.Text;
  private tombolAkhiriHari!: Phaser.GameObjects.Container;

  constructor() {
    super({ key: 'GameScene' });
  }

  init(data: { karakterId: KarakterId }): void {
    this.karakterId = data.karakterId ?? 'bahari';
    this.hari = 1;
    this.logHarian = [];
    this.idKejadianSelesai.clear();
    this.objekCooldown = {};
    this.sedangKartu = false;
  }

  create(): void {
    // Inisialisasi sistem
    this.resourceSystem = new ResourceSystem(this.karakterId);
    this.skillSystem = new SkillSystem(this.karakterId);
    this.scenarioSystem = new ScenarioSystem();

    // Bangun tampilan
    this.buatBackground();
    this.buatPeta();
    this.buatHUD();

    // Dashboard 6 bar (area kiri)
    this.dashboard = new Dashboard(this, 0, 0);

    // Popup menu (tersembunyi sampai objek diklik)
    this.popupMenu = new PopupMenu(this, (aksiId, objekId) => {
      this.prosesAksiObjek(aksiId, objekId);
    });

    // Kartu Kejadian UI
    this.eventCard = new EventCard(this);

    // Aktifkan skenario hari pertama
    this.scenarioSystem.updateHari(this.hari, this.resourceSystem.getResources());

    // Update tampilan awal
    this.refreshHUD();
    this.dashboard.update(this.resourceSystem.getResources());

    // Fade in scene
    this.cameras.main.fadeIn(500, 0, 0, 0);
  }

  // ----------------------------------------------------------
  // BACKGROUND & PETA
  // ----------------------------------------------------------

  private buatBackground(): void {
    // Gambar Latar Belakang Peta (bg.png)
    // Dikembalikan ke tengah agar full 1200x900 dan laut kanan tidak terpotong
    this.add.image(600, 450, 'img-bg').setOrigin(0.5);

    // Overlay Polusi Laut (Warna kecoklatan suram)
    // Berada tepat di atas background untuk memberi efek air laut yang tercemar dan langit berkabut
    this.overlayPolusi = this.add.rectangle(600, 450, 1200, 900, 0x4a4a11)
      .setBlendMode(Phaser.BlendModes.MULTIPLY)
      .setAlpha(0); // Awalnya 0 (bersih)

    // --- ANIMASI AIR LAUT ---
    // Membuat efek riak ombak / kilauan air yang muncul tenggelam secara acak
    for (let i = 0; i < 50; i++) {
      const x = Phaser.Math.Between(0, 1200);
      const y = Phaser.Math.Between(0, 900);
      const lebar = Phaser.Math.Between(30, 80);

      // Membuat bentuk oval pipih berwarna putih
      const ripple = this.add.ellipse(x, y, lebar, 4, 0xffffff)
        .setAlpha(0)
        .setBlendMode(Phaser.BlendModes.ADD); // Memberikan efek bercahaya menyatu dengan air

      this.tweens.add({
        targets: ripple,
        alpha: Phaser.Math.FloatBetween(0.05, 0.25), // Transparansi rendah agar halus dan tidak menutupi daratan
        scaleX: 1.3,
        duration: Phaser.Math.Between(2000, 4000), // Kecepatan ombak (2-4 detik)
        yoyo: true,
        repeat: -1,
        delay: Phaser.Math.Between(0, 4000),
        ease: 'Sine.easeInOut'
      });
    }

    // Panel HUD kiri (dashboard) — Menggunakan efek Gradasi (Gradient)
    // Kiri gelap pekat untuk membaca teks, memudar halus (transparan) ke arah kanan
    const panelKiri = this.add.graphics();
    panelKiri.fillGradientStyle(0x000000, 0x000000, 0x000000, 0x000000, 0.95, 0, 0.95, 0);
    panelKiri.fillRect(0, 0, 320, 900);

    // Panel HUD bawah — Menggunakan efek Gradasi memudar ke atas
    const panelBawah = this.add.graphics();
    panelBawah.fillGradientStyle(0x000000, 0x000000, 0x000000, 0x000000, 0, 0, 0.95, 0.95);
    panelBawah.fillRect(0, 800, 1200, 100);
  }

  private buatPeta(): void {
    // Buat daftar antrean render
    const antreanRender: { y: number, render: () => void }[] = [];

    // Masukkan bangunan interaktif ke antrean
    DAFTAR_OBJEK_PETA.forEach((objek) => {
      antreanRender.push({
        y: objek.y,
        render: () => this.grupObjek.push(this.buatObjekPeta(objek))
      });
    });

    // Masukkan elemen dekorasi ke antrean
    DAFTAR_DEKORASI.forEach((dek) => {
      antreanRender.push({
        y: dek.y,
        render: () => {
          const gambar = this.add.image(dek.x, dek.y, dek.gambar).setOrigin(0.5);
          gambar.setDisplaySize(dek.lebar, dek.tinggi);
          if (dek.flipX) gambar.setFlipX(true);
          if (dek.rotasi) gambar.setAngle(dek.rotasi);

          // --- FITUR MODE DESAIN (DRAG & DROP) UNTUK DEKORASI ---
          // Memungkinkan Anda menarik mobil dengan mouse untuk mencari kordinat
          gambar.setInteractive({ cursor: 'pointer' });
          this.input.setDraggable(gambar);
          gambar.on('drag', (pointer: Phaser.Input.Pointer) => {
            gambar.x = pointer.x;
            gambar.y = pointer.y;
          });
          gambar.on('dragend', () => {
            console.log(`✅ Copy ke mapObjects.ts -> dekorasi id: '${dek.id}', x: ${Math.round(gambar.x)}, y: ${Math.round(gambar.y)}`);
          });
        }
      });
    });

    // Urutkan berdasarkan nilai Y terkecil (atas) ke terbesar (bawah) lalu gambar ke layar
    antreanRender.sort((a, b) => a.y - b.y).forEach(item => item.render());
  }

  private buatObjekPeta(objek: ObjekPeta): Phaser.GameObjects.Container {
    const kontainer = this.add.container(objek.x, objek.y);

    // Shadow sedikit di bawah objek
    this.add.rectangle(4, 4, objek.lebar, objek.tinggi, 0x000000)
      .setOrigin(0.5).setAlpha(0.3);

    // Gambar objek dari aset Kenney
    const gambar = this.add.image(0, 0, `img-${objek.tipe}`)
      .setOrigin(0.5)
      .setInteractive({ cursor: 'pointer', pixelPerfect: true }); // pixelPerfect mengabaikan area transparan

    // Bebaskan ukuran: Gunakan lebar & tinggi dari mapObjects.ts agar bisa disesuaikan
    gambar.setDisplaySize(objek.lebar, objek.tinggi);

    // Balik arah gambar (mirror) dengan aman menggunakan fitur bawaan Phaser
    if (objek.flipX) {
      gambar.setFlipX(true);
    }

    // Putar gambar (rotasi derajat) untuk menyesuaikan sudut perspektif background
    if (objek.rotasi) {
      gambar.setAngle(objek.rotasi);
    }

    // Hover Tooltip (Teks kontras kuning-hitam yang hanya muncul saat di-hover)
    const hoverLabel = this.add.text(0, -objek.tinggi / 2 - 15, objek.nama.toUpperCase(), {
      fontSize: '14px',
      color: '#1A1A2E',
      backgroundColor: '#F9C74F',
      fontStyle: 'bold',
      padding: { x: 10, y: 5 }
    }).setOrigin(0.5).setVisible(false).setDepth(20);

    kontainer.add([gambar, hoverLabel]);
    kontainer.setData('objekId', objek.id);
    kontainer.setData('gambar', gambar);

    // Hover
    gambar.on('pointerover', () => {
      const isCooldown = (this.objekCooldown[objek.id] ?? 0) > 0;
      gambar.setTint(isCooldown ? 0xffaaaa : 0xdddddd);
      hoverLabel.setVisible(true);
    });
    gambar.on('pointerout', () => {
      const isCooldown = (this.objekCooldown[objek.id] ?? 0) > 0;
      if (isCooldown) gambar.setTint(0xff6666);
      else gambar.clearTint();
      hoverLabel.setVisible(false);
    });

    // Klik → buka popup menu (Diubah ke pointerup agar tidak bentrok dengan drag)
    gambar.on('pointerup', (pointer: Phaser.Input.Pointer) => {
      if (pointer.getDuration() > 250) return; // Abaikan jika kursor ditahan lama (sedang nge-drag)
      if (this.sedangKartu) return;
      
      // Animasi pop saat diklik (mengecil lalu kembali)
      this.tweens.add({
        targets: kontainer,
        scaleX: 0.9, scaleY: 0.9,
        duration: 100, yoyo: true
      });
      
      this.bukaPopupObjek(objek);
    });

    // --- FITUR MODE DESAIN (DRAG & DROP) ---
    // Membantu Anda mencari koordinat X dan Y dengan mudah
    this.input.setDraggable(gambar);
    gambar.on('drag', (pointer: Phaser.Input.Pointer) => {
      // Bangunan akan mengikuti secara persis ke mana kursor mouse bergerak
      kontainer.x = pointer.x;
      kontainer.y = pointer.y;
    });
    gambar.on('dragend', () => {
      console.log(`✅ Copy ke mapObjects.ts -> id: '${objek.id}', x: ${Math.round(kontainer.x)}, y: ${Math.round(kontainer.y)}`);
    });

    return kontainer;
  }

  // ----------------------------------------------------------
  // HUD (header hari + tombol skill + tombol akhiri hari)
  // ----------------------------------------------------------

  private buatHUD(): void {
    // Teks hari
    this.teksHari = this.add.text(600, 870, '', {
      fontSize: '18px',
      color: TEXT_COLORS.putih,
      fontStyle: 'bold',
    }).setOrigin(0.5);

    // Info skill
    this.teksSkillInfo = this.add.text(930, 870, '', {
      fontSize: '13px',
      color: TEXT_COLORS.abu,
    }).setOrigin(0.5);

    // Tombol skill
    this.tombolSkill = this.buatTombol(1122, 822, 138, 48, '⚡ SKILL', COLORS.ungu, () => {
      this.gunakanSkill();
    });

    // Tombol akhiri hari
    this.tombolAkhiriHari = this.buatTombol(495, 822, 225, 48, 'AKHIRI HARI →', COLORS.hijau, () => {
      this.akhiriHari();
    });
  }

  private buatTombol(
    x: number, y: number, lebar: number, tinggi: number,
    teks: string, warna: number,
    onKlik: () => void,
  ): Phaser.GameObjects.Container {
    const kontainer = this.add.container(x, y);

    const bg = this.add.rectangle(0, 0, lebar, tinggi, warna)
      .setOrigin(0.5)
      .setInteractive({ cursor: 'pointer' });

    const label = this.add.text(0, 0, teks, {
      fontSize: '16px',
      color: TEXT_COLORS.putih,
      fontStyle: 'bold',
    }).setOrigin(0.5);

    bg.on('pointerover', () => bg.setAlpha(0.8));
    bg.on('pointerout', () => bg.setAlpha(1));
    bg.on('pointerdown', onKlik);

    kontainer.add([bg, label]);
    return kontainer;
  }

  private refreshHUD(): void {
    this.teksHari.setText(`Hari ${this.hari} / ${GAME_CONFIG.totalHari}`);

    const skill = this.skillSystem.getSkill();
    const alasan = this.skillSystem.alasanTidakBisa(this.resourceSystem.getResources());

    if (alasan) {
      this.teksSkillInfo.setText(alasan).setColor(TEXT_COLORS.merah);
      (this.tombolSkill.getAt(0) as Phaser.GameObjects.Rectangle).setFillStyle(COLORS.abu);
    } else {
      this.teksSkillInfo.setText(`${skill.nama} siap!`).setColor(TEXT_COLORS.hijau);
      (this.tombolSkill.getAt(0) as Phaser.GameObjects.Rectangle).setFillStyle(COLORS.ungu);
    }

    // Tandai objek yang sedang cooldown
    this.grupObjek.forEach((k) => {
      const id = k.getData('objekId') as string;
      const gambar = k.getData('gambar') as Phaser.GameObjects.Image;
      if ((this.objekCooldown[id] ?? 0) > 0) {
        gambar.setTint(0xff6666); // Warnai gambar menjadi kemerahan saat cooldown
      } else {
        gambar.clearTint();
      }
    });

    // --- UPDATE VISUAL POLUSI ---
    // Semakin rendah nilai Lingkungan, kabut polusi kecoklatan akan semakin pekat menutupi game
    const lingkungan = this.resourceSystem.getResources().lingkungan;
    const alphaPolusi = Math.max(0, (80 - lingkungan) / 80 * 0.85); 
    
    this.tweens.killTweensOf(this.overlayPolusi);
    this.tweens.add({
      targets: this.overlayPolusi,
      alpha: alphaPolusi,
      duration: 1000 // Berubah perlahan secara halus
    });
  }

  // ----------------------------------------------------------
  // POPUP MENU OBJEK
  // ----------------------------------------------------------

  private bukaPopupObjek(objek: ObjekPeta): void {
    const cooldown = this.objekCooldown[objek.id] ?? 0;
    this.popupMenu.tampilkan(
      objek,
      this.resourceSystem.getResources(),
      cooldown,
    );
  }

  private prosesAksiObjek(aksiId: string, objekId: string): void {
    const objek = DAFTAR_OBJEK_PETA.find((o) => o.id === objekId);
    if (!objek) return;
    const aksi = objek.aksi.find((a) => a.id === aksiId);
    if (!aksi) return;

    const sebelum = this.resourceSystem.getResources();

    // Kurangi biaya
    this.resourceSystem.terapkanEfekLangsung(
      Object.fromEntries(
        Object.entries(aksi.biaya).map(([k, v]) => [k, -(v as number)]),
      ) as Partial<Resources>,
    );

    // Tambah hasil dengan multiplier
    this.resourceSystem.terapkanEfek(aksi.hasil);

    // Set cooldown objek
    if (aksi.cooldownHari) {
      this.objekCooldown[objekId] = aksi.cooldownHari;
    }

    const sesudah = this.resourceSystem.getResources();
    this.catatLog({ aksiObjekId: aksiId, sebelum, sesudah });

    // Munculkan teks melayang (Floating Text) sebagai feedback visual
    let offsetY = 0;
    Object.entries(aksi.hasil).forEach(([k, v]) => {
      if ((v as number) > 0) {
        this.time.delayedCall(offsetY * 250, () => {
          this.munculkanFloatingText(objek.x, objek.y - 30, `+${v} ${k.toUpperCase()}`, TEXT_COLORS.hijau);
        });
        offsetY++;
      }
    });
    Object.entries(aksi.biaya).forEach(([k, v]) => {
      if ((v as number) > 0) {
        this.time.delayedCall(offsetY * 250, () => {
          this.munculkanFloatingText(objek.x, objek.y - 30, `-${v} ${k.toUpperCase()}`, TEXT_COLORS.merah);
        });
        offsetY++;
      }
    });

    this.popupMenu.sembunyikan();
    this.refreshSetelahAksi();
  }

  // ----------------------------------------------------------
  // SKILL AKTIF
  // ----------------------------------------------------------

  private gunakanSkill(): void {
    const sebelum = this.resourceSystem.getResources();
    const efek = this.skillSystem.aktifkan(sebelum);
    if (!efek) return;

    this.resourceSystem.terapkanEfek(efek);
    const sesudah = this.resourceSystem.getResources();
    this.catatLog({ skillDipakai: true, sebelum, sesudah });

    this.refreshSetelahAksi();

    // Animasi kilat singkat
    this.cameras.main.flash(200, 155, 89, 229);
  }

  // ----------------------------------------------------------
  // AKHIRI HARI
  // ----------------------------------------------------------

  private akhiriHari(): void {
    if (this.sedangKartu) return;

    // Tick cooldown skill & objek
    this.skillSystem.tickHari();
    Object.keys(this.objekCooldown).forEach((id) => {
      if (this.objekCooldown[id] > 0) this.objekCooldown[id]--;
    });

    // Efek pasif skenario aktif
    const efekSkenario = this.scenarioSystem.getEfekPasifHariIni();
    if (efekSkenario) {
      this.resourceSystem.terapkanEfekLangsung(efekSkenario);
    }

    // Cek game over
    const gameOver = this.resourceSystem.cekGameOver();
    if (gameOver.terjadi) {
      this.cameras.main.fadeOut(600, 0, 0, 0);
      this.cameras.main.once('camerafadeoutcomplete', () => {
        this.scene.start('EndingScene', {
          endingId: 'game_over',
          penyebab: gameOver.resourcePenyebab,
          judul: gameOver.judul,
          deskripsi: gameOver.deskripsi,
          hari: this.hari,
          log: this.logHarian,
        });
      });
      return;
    }

    // Cek hari terakhir
    if (this.hari >= GAME_CONFIG.totalHari) {
      const endingId = this.resourceSystem.evaluasiEnding();
      this.cameras.main.fadeOut(600, 0, 0, 0);
      this.cameras.main.once('camerafadeoutcomplete', () => {
        this.scene.start('EndingScene', {
          endingId,
          resources: this.resourceSystem.getResources(),
          log: this.logHarian,
        });
      });
      return;
    }

    // Lanjut ke hari berikutnya
    this.hari++;
    this.scenarioSystem.updateHari(this.hari, this.resourceSystem.getResources());

    // Animasi pergantian hari
    this.cameras.main.flash(300, 13, 71, 161, true);

    // Cek apakah ada kartu dilema harian untuk hari ini
    const kejadian = this.dapatkanKejadianAcak();
    
    if (kejadian) {
      this.sedangKartu = true;
      // Tunda sedikit agar animasi layar berkedip pergantian hari selesai dulu
      this.time.delayedCall(400, () => {
        const sebelum = this.resourceSystem.getResources();
        
        this.eventCard.tampilkan(kejadian, (pilihan, index) => {
          this.resourceSystem.terapkanEfek(pilihan.efek);
          const sesudah = this.resourceSystem.getResources();
          this.catatLog({ kartuId: kejadian.id, pilihanIndex: index, sebelum, sesudah });
          
          this.idKejadianSelesai.add(kejadian.id);
          this.sedangKartu = false;
          this.refreshSetelahAksi();
          this.cekGameOverSetelahKartu();
        });
      });
    } else {
      this.refreshSetelahAksi();
    }
  }

  private dapatkanKejadianAcak() {
    // Ambil kejadian yang belum pernah muncul & memenuhi syarat
    const valid = DAFTAR_KEJADIAN.filter(k => 
      !this.idKejadianSelesai.has(k.id) &&
      (!k.syarat || k.syarat(this.resourceSystem.getResources(), this.hari))
    );
    
    if (valid.length === 0) return null;
    
    // Acak kejadian
    const index = Phaser.Math.Between(0, valid.length - 1);
    return valid[index];
  }

  private cekGameOverSetelahKartu() {
    const gameOver = this.resourceSystem.cekGameOver();
    if (gameOver.terjadi) {
      this.cameras.main.fadeOut(600, 0, 0, 0);
      this.cameras.main.once('camerafadeoutcomplete', () => {
        this.scene.start('EndingScene', { endingId: 'game_over', penyebab: gameOver.resourcePenyebab, judul: gameOver.judul, deskripsi: gameOver.deskripsi, hari: this.hari, log: this.logHarian });
      });
    }
  }

  // ----------------------------------------------------------
  // REFRESH UI
  // ----------------------------------------------------------

  private refreshSetelahAksi(): void {
    this.dashboard.update(this.resourceSystem.getResources());
    this.refreshHUD();
  }

  // ----------------------------------------------------------
  // EFEK VISUAL TAMBAHAN
  // ----------------------------------------------------------

  private munculkanFloatingText(x: number, y: number, teks: string, warna: string): void {
    const txt = this.add.text(x, y, teks, {
      fontSize: '20px',
      color: warna,
      fontStyle: 'bold',
      stroke: '#000000',
      strokeThickness: 4,
    }).setOrigin(0.5).setDepth(100);

    this.tweens.add({
      targets: txt,
      y: y - 60,
      alpha: 0,
      duration: 2000,
      ease: 'Cubic.easeOut',
      onComplete: () => txt.destroy()
    });
  }

  // ----------------------------------------------------------
  // LOG
  // ----------------------------------------------------------

  private catatLog(data: Partial<LogHarian> & { sebelum: Resources; sesudah: Resources }): void {
    this.logHarian.push({
      hari: this.hari,
      sebelum: data.sebelum,
      sesudah: data.sesudah,
      kartuId: data.kartuId,
      pilihanIndex: data.pilihanIndex,
      aksiObjekId: data.aksiObjekId,
      skillDipakai: data.skillDipakai ?? false,
    });
  }
}
