<script lang="ts">
  import { game } from './lib/engine/store.svelte';
  import Title from './lib/ui/Title.svelte';
  import CharacterSelect from './lib/ui/CharacterSelect.svelte';
  import GameScreen from './lib/ui/GameScreen.svelte';
  import OverScreen from './lib/ui/OverScreen.svelte';

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
