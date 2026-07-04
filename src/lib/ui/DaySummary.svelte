<script lang="ts">
  import { game } from '../engine/store.svelte';
  import { STATS } from '../data/stats';
  import { STAT_KEYS, DANGER_ZONE } from '../types';

  const s = $derived(game.state!);
  const deltas = $derived(game.deltas);
  const warnings = $derived(STAT_KEYS.filter((k) => s.stats[k] <= DANGER_ZONE));
</script>

<div class="overlay">
  <div class="card panel">
    <p class="eyebrow">Hari {s.day} usai</p>
    <h2>Matahari terbenam di Muara</h2>

    <div class="rows">
      {#each STAT_KEYS as k (k)}
        {@const d = deltas[k] ?? 0}
        <div class="row" class:warn={s.stats[k] <= DANGER_ZONE}>
          <span class="icon">{STATS[k].icon}</span>
          <span class="label">{STATS[k].label}</span>
          <div class="track">
            <div class="fill" style="width: {s.stats[k]}%; background: var(--c-{k})"></div>
          </div>
          <span class="value">{s.stats[k]}</span>
          <span class="delta {d > 0 ? 'naik' : d < 0 ? 'turun' : ''}">
            {d > 0 ? `+${d}` : d < 0 ? d : '·'}
          </span>
        </div>
      {/each}
    </div>

    {#if warnings.length > 0}
      <div class="alert">
        ⚠️ {warnings.map((k) => STATS[k].label).join(', ')} di zona kritis — sentuh nol dan
        pelabuhan ditutup paksa.
      </div>
    {/if}

    <button class="btn btn-lampu next" onclick={() => game.toNextDay()}>
      🌅 Sambut Hari ke-{s.day + 1}
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
    background: linear-gradient(180deg, rgba(30, 22, 48, 0.72), rgba(4, 12, 26, 0.85));
    backdrop-filter: blur(4px);
    animation: dusk 0.7s ease both;
  }

  @keyframes dusk {
    from {
      opacity: 0;
    }
  }

  .card {
    width: min(480px, 100%);
    padding: 24px 26px;
    animation: float-up 0.5s cubic-bezier(0.2, 0.7, 0.2, 1) both;
  }

  h2 {
    font-size: 24px;
    font-weight: 800;
    margin: 4px 0 16px;
  }

  .rows {
    display: flex;
    flex-direction: column;
    gap: 9px;
  }

  .row {
    display: grid;
    grid-template-columns: 24px 96px 1fr 30px 36px;
    align-items: center;
    gap: 9px;
    font-size: 13px;
    padding: 3px 6px;
    border-radius: 7px;
  }

  .row.warn {
    background: rgba(228, 96, 78, 0.1);
    box-shadow: inset 0 0 0 1px rgba(228, 96, 78, 0.4);
  }

  .label {
    color: var(--busa-redup);
    font-weight: 700;
  }

  .track {
    height: 7px;
    border-radius: 99px;
    background: rgba(8, 23, 41, 0.85);
    overflow: hidden;
  }

  .fill {
    height: 100%;
    border-radius: 99px;
    transition: width 0.7s cubic-bezier(0.2, 0.7, 0.2, 1);
  }

  .value {
    text-align: right;
    font-weight: 800;
    font-variant-numeric: tabular-nums;
  }

  .delta {
    text-align: right;
    font-weight: 800;
    font-variant-numeric: tabular-nums;
    color: var(--busa-redup);
  }

  .delta.naik {
    color: var(--bakau);
  }

  .delta.turun {
    color: var(--karang);
  }

  .alert {
    margin-top: 14px;
    font-size: 12.5px;
    font-weight: 700;
    color: #ffb4a8;
    border: 1px solid color-mix(in srgb, var(--karang) 55%, transparent);
    background: rgba(228, 96, 78, 0.1);
    padding: 10px 13px;
    border-radius: var(--radius-s);
  }

  .next {
    width: 100%;
    margin-top: 16px;
    font-size: 15.5px;
    padding: 13px;
  }
</style>
