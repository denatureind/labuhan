<script lang="ts">
  import { game } from '../engine/store.svelte';
  import { SCENARIOS } from '../data/scenarios';
  import { STATS } from '../data/stats';
  import { STAT_KEYS, TOTAL_DAYS } from '../types';

  const s = $derived(game.state!);

  /* Skenario yang BARU mulai pagi ini (untuk pengumumannya). */
  const freshScenarios = $derived(
    s.activeScenarios
      .filter((a) => SCENARIOS[a.id].duration === a.daysLeft + 1)
      .map((a) => SCENARIOS[a.id]),
  );

  const phaseLabel = $derived(
    s.day <= 10 ? 'Masa Perkenalan' : s.day <= 20 ? 'Masa Eskalasi' : s.day < 30 ? 'Masa Krisis' : 'Hari Evaluasi',
  );

  /* Enter = Mulai Hari — memangkas klik untuk 30 pagi berturut-turut.
     Dilewati bila fokus sedang di tombol/input agar tak dobel dengan aksi bawaan. */
  function onKey(e: KeyboardEvent) {
    if (e.key !== 'Enter' || e.repeat) return;
    if ((e.target as HTMLElement)?.closest?.('button, input, textarea, select')) return;
    e.preventDefault();
    game.startEventPhase();
  }
</script>

<svelte:window onkeydown={onKey} />

<div class="overlay">
  <div class="card panel">
    <p class="eyebrow">{phaseLabel}</p>
    <h2 class="day">Hari <span>{s.day}</span><small> dari {TOTAL_DAYS}</small></h2>

    {#each freshScenarios as sc (sc.id)}
      <div class="announce {sc.mood}">
        <span class="a-icon">{sc.icon}</span>
        <div>
          <b>{sc.name} · {sc.duration} hari</b>
          <p>{sc.announce}</p>
        </div>
      </div>
    {/each}

    <div class="report">
      <p class="r-title">Laporan pagi</p>
      {#each s.morningReport as item, i (i)}
        <div class="row" style="animation-delay: {0.08 + i * 0.05}s">
          <span class="r-icon">{item.icon}</span>
          <span class="r-label">{item.label}</span>
          <span class="r-chips">
            {#each STAT_KEYS.filter((k) => item.effects[k]) as k (k)}
              <span class="chip {item.effects[k]! > 0 ? 'naik' : 'turun'}">
                {STATS[k].icon}
                {item.effects[k]! > 0 ? '+' : ''}{item.effects[k]}
              </span>
            {/each}
          </span>
        </div>
      {/each}
    </div>

    <button class="btn btn-lampu start" onclick={() => game.startEventPhase()}>
      Mulai Hari →
    </button>
  </div>
</div>

<style>
  .overlay {
    position: absolute;
    inset: 0;
    z-index: 40;
    display: grid;
    place-items: center;
    padding: 20px;
    background: rgba(4, 12, 26, 0.55);
    backdrop-filter: blur(3px);
    animation: fade 0.25s ease both;
  }

  @keyframes fade {
    from {
      opacity: 0;
    }
  }

  .card {
    width: min(520px, 100%);
    max-height: min(84vh, 100%);
    overflow-y: auto;
    padding: 26px 28px 24px;
    text-align: center;
    animation: float-up 0.32s cubic-bezier(0.2, 0.7, 0.2, 1) both;
  }

  .day {
    font-size: 34px;
    font-weight: 800;
    margin: 2px 0 14px;
  }

  .day span {
    color: var(--lampu-terang);
    font-size: 44px;
  }

  .day small {
    font-size: 15px;
    color: var(--busa-redup);
    font-weight: 600;
  }

  .announce {
    display: flex;
    gap: 12px;
    text-align: left;
    padding: 13px 15px;
    border-radius: var(--radius-s);
    border: 1px solid var(--garis-buih);
    background: rgba(8, 23, 41, 0.5);
    margin-bottom: 12px;
    animation: float-up 0.5s 0.1s ease both;
  }

  .announce.storm {
    border-color: color-mix(in srgb, var(--karang) 60%, transparent);
    background: rgba(228, 96, 78, 0.09);
  }

  .announce.good {
    border-color: color-mix(in srgb, var(--bakau) 55%, transparent);
    background: rgba(88, 192, 138, 0.08);
  }

  .a-icon {
    font-size: 26px;
  }

  .announce b {
    font-size: 14px;
  }

  .announce p {
    font-size: 13px;
    color: var(--busa-redup);
    margin-top: 3px;
  }

  .report {
    text-align: left;
    border-top: 1px dashed var(--garis-buih);
    padding-top: 12px;
    display: flex;
    flex-direction: column;
    gap: 7px;
  }

  .r-title {
    font-size: 11px;
    font-weight: 800;
    letter-spacing: 0.14em;
    text-transform: uppercase;
    color: var(--busa-redup);
    margin-bottom: 2px;
  }

  .row {
    display: flex;
    align-items: center;
    gap: 9px;
    font-size: 13.5px;
    animation: float-up 0.4s ease both;
  }

  .r-icon {
    width: 22px;
    text-align: center;
  }

  .r-label {
    flex: 1;
    color: var(--busa-redup);
  }

  .r-chips {
    display: flex;
    gap: 4px;
    flex-wrap: wrap;
    justify-content: flex-end;
  }

  .start {
    margin-top: 18px;
    width: 100%;
    font-size: 16px;
    padding: 13px;
  }
</style>
