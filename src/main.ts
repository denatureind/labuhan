// ============================================================
// PELABUHAN HIJAU v3 — Titik Masuk Utama (Entry Point)
// Engine: Phaser + TypeScript + Vite
// ============================================================

import * as Phaser from 'phaser';
import { BootScene } from './scenes/BootScene';
import { MenuScene } from './scenes/MenuScene';
import { CharacterSelectScene } from './scenes/CharacterSelectScene';
import { GameScene } from './scenes/GameScene';
import { EndingScene } from './scenes/EndingScene';

// Konfigurasi utama game
const config: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  width: 1200,
  height: 900,
  parent: 'game-container',
  backgroundColor: '#1A1A2E',
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },
  scene: [
    BootScene,
    MenuScene,
    CharacterSelectScene,
    GameScene,
    EndingScene
  ],
};

// Inisialisasi Game
new Phaser.Game(config);