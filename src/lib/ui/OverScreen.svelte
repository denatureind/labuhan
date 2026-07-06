<script lang="ts">
  import { game } from '../engine/store.svelte';
  import { ENDINGS, statVerdict } from '../data/endings';
  import { STATS } from '../data/stats';
  import { getCharacter } from '../data/characters';
  import { STAT_KEYS } from '../types';
  import HistoryChart from './HistoryChart.svelte';

  const s = $derived(game.state!);
  const over = $derived(s.over!);
  const character = $derived(getCharacter(s.characterId));

  const fail = $derived(over.kind === 'fail' ? STATS[over.stat] : null);
  const ending = $derived(over.kind === 'ending' ? ENDINGS[over.endingId] : null);

  const isGold = $derived(ending?.id === 'emas');
</script>

<div class="over" class:failed={!!fail} class:gold={isGold}>
  <img class="bg" src="./assets/images/opening.png" alt="" />
  <div class="scrim"></div>

  <div class="content">
    <article class="card panel">
      {#if fail}
        <p class="eyebrow red">Pelabuhan ditutup paksa — hari {s.day}</p>
        <div class="badge">{fail.icon}</div>
        <h1>{fail.failTitle}</h1>
        <p class="narration">{fail.failText}</p>
        <p class="signature">
          {character.name} meninggalkan Muara Harapan pada hari ke-{s.day} dari 30 hari masa
          jabatannya.
        </p>
      {:else if ending}
        <p class="eyebrow">Evaluasi akhir 30 hari · {character.name}</p>
        <div class="badge">{ending.icon}</div>
        <h1>{ending.title}</h1>
        {#if game.freshUnlock}
          <p class="fresh-unlock">
            ★ Gelar baru untuk Galeri Akhir — {game.endingsUnlocked.length} dari {Object.keys(ENDINGS).length} terbuka
          </p>
        {/if}
        <p class="narration">{ending.narration}</p>
      {/if}

      <div class="verdicts">
        {#each STAT_KEYS as k (k)}
          <div class="verdict">
            <span class="v-chip" style="background: var(--c-{k})"></span>
            <span class="v-icon">{STATS[k].icon}</span>
            <span class="v-num">{s.stats[k]}</span>
            <span class="v-text">{statVerdict(k, s.stats[k])}</span>
          </div>
        {/each}
      </div>

      <div class="chart">
        <p class="chart-title">Jejak 30 hari kepemimpinan</p>
        <HistoryChart history={s.history} />
      </div>

      <div class="actions">
        <button class="btn btn-lampu" onclick={() => game.restart()}>⚓ Pimpin Lagi</button>
        <button class="btn" onclick={() => game.quitToTitle()}>Ke Layar Awal</button>
      </div>
    </article>
  </div>
</div>

<style>
  .over {
    position: fixed;
    inset: 0;
    overflow-y: auto;
  }

  .bg {
    position: fixed;
    inset: 0;
    width: 100%;
    height: 100%;
    object-fit: cover;
    filter: blur(4px) brightness(0.55);
  }

  .over.failed .bg {
    filter: blur(5px) brightness(0.3) saturate(0.5);
  }

  .over.gold .bg {
    filter: blur(4px) brightness(0.7) sepia(0.25) saturate(1.2);
  }

  .scrim {
    position: fixed;
    inset: 0;
    background: radial-gradient(ellipse at center 30%, transparent, rgba(4, 12, 26, 0.72));
  }

  .content {
    position: relative;
    min-height: 100%;
    display: grid;
    place-items: center;
    padding: 26px 18px;
  }

  .card {
    width: min(640px, 100%);
    padding: 30px 34px;
    text-align: center;
    animation: float-up 0.7s cubic-bezier(0.2, 0.7, 0.2, 1) both;
  }

  .gold .card {
    border-color: var(--lampu);
    box-shadow:
      0 0 0 1px var(--lampu),
      0 24px 90px rgba(245, 184, 65, 0.25);
  }

  .eyebrow.red {
    color: var(--karang);
  }

  .badge {
    font-size: 64px;
    margin: 14px 0 6px;
    animation: pop-badge 0.8s 0.25s cubic-bezier(0.2, 0.9, 0.3, 1.4) both;
  }

  @keyframes pop-badge {
    from {
      opacity: 0;
      transform: scale(0.3) rotate(-12deg);
    }
    to {
      opacity: 1;
      transform: none;
    }
  }

  h1 {
    font-size: clamp(30px, 5vw, 42px);
    font-weight: 800;
    margin-bottom: 14px;
  }

  .failed h1 {
    color: #ffb4a8;
  }

  .fresh-unlock {
    display: inline-block;
    margin-bottom: 12px;
    font-size: 12.5px;
    font-weight: 800;
    color: var(--lampu-terang);
    border: 1px solid color-mix(in srgb, var(--lampu) 55%, transparent);
    background: rgba(245, 184, 65, 0.1);
    padding: 5px 14px;
    border-radius: 999px;
    animation: pop-badge 0.6s 0.5s cubic-bezier(0.2, 0.9, 0.3, 1.4) both;
  }

  .gold h1 {
    background: linear-gradient(180deg, var(--lampu-terang), #e09a1f);
    -webkit-background-clip: text;
    background-clip: text;
    color: transparent;
  }

  .narration {
    font-size: 15px;
    color: #cfdff5;
    text-align: left;
    text-wrap: pretty;
    margin-bottom: 6px;
  }

  .signature {
    font-size: 13px;
    color: var(--busa-redup);
    font-style: italic;
    margin-top: 10px;
  }

  .verdicts {
    margin: 20px 0 6px;
    display: flex;
    flex-direction: column;
    gap: 7px;
    text-align: left;
    border-top: 1px dashed var(--garis-buih);
    padding-top: 16px;
  }

  .verdict {
    display: flex;
    align-items: baseline;
    gap: 9px;
    font-size: 13px;
  }

  .v-chip {
    width: 8px;
    height: 8px;
    border-radius: 3px;
    flex-shrink: 0;
    align-self: center;
  }

  .v-num {
    font-weight: 800;
    font-variant-numeric: tabular-nums;
    min-width: 26px;
  }

  .v-text {
    color: var(--busa-redup);
  }

  .chart {
    margin-top: 16px;
    border-top: 1px dashed var(--garis-buih);
    padding-top: 14px;
  }

  .chart-title {
    font-size: 11px;
    font-weight: 800;
    letter-spacing: 0.14em;
    text-transform: uppercase;
    color: var(--busa-redup);
    text-align: left;
    margin-bottom: 6px;
  }

  .actions {
    display: flex;
    justify-content: center;
    gap: 12px;
    margin-top: 22px;
    flex-wrap: wrap;
  }
</style>
