<script lang="ts">
  import { game } from './lib/engine/store.svelte';
  import { motion } from './lib/engine/motion.svelte';
  import { RELOAD_FLAG_KEY } from './lib/engine/editorStore.svelte';
  import Title from './lib/ui/Title.svelte';
  import CharacterSelect from './lib/ui/CharacterSelect.svelte';
  import GameScreen from './lib/ui/GameScreen.svelte';
  import OverScreen from './lib/ui/OverScreen.svelte';

  // Kelas .no-ambient di <body> membekukan gerak dekoratif (lihat app.css) —
  // dipasang di sini supaya berlaku di semua layar, termasuk layar judul.
  $effect(() => {
    document.body.classList.toggle('no-ambient', !motion.ambient);
  });

  // Setelah "🛠️ Edit Tata Letak" menyimpan & memuat ulang halaman (lihat
  // editorStore.svelte.ts), lanjutkan langsung ke permainan yang tadi
  // berjalan alih-alih kembali ke layar judul.
  if (import.meta.env.DEV && sessionStorage.getItem(RELOAD_FLAG_KEY)) {
    sessionStorage.removeItem(RELOAD_FLAG_KEY);
    game.continueGame();
  }

  // Pramuat gambar-gambar besar agar transisi layar mulus.
  const preload = [
    './assets/images/bg.png',
    './assets/images/opening.png',
    './assets/images/pilih-karakter.png',
    './assets/images/dermaga.png',
    './assets/images/gudang.png',
    './assets/images/kantor.png',
    './assets/images/kapal.png',
    './assets/images/pasar.png',
    './assets/images/tambak.png',
  ];
  for (const src of preload) {
    const img = new Image();
    img.src = src;
  }
</script>

{#if game.screen === 'title'}
  <Title />
{:else if game.screen === 'select'}
  <CharacterSelect />
{:else if game.screen === 'game'}
  <GameScreen />
{:else if game.screen === 'over'}
  <OverScreen />
{/if}
