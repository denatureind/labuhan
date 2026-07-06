<script lang="ts">
  import { game } from '../engine/store.svelte';
  import { motion } from '../engine/motion.svelte';
  import { STATS } from '../data/stats';
  import { SCENARIOS, SCENARIO_SCHEDULE } from '../data/scenarios';
  import { getCharacter } from '../data/characters';
  import { STAT_KEYS, TOTAL_DAYS, DANGER_ZONE } from '../types';
  import { isMuted, toggleMute, sfx } from '../audio/sfx';

  let muted = $state(isMuted());
  const s = $derived(game.state!);

  /* Perubahan bersih HARI INI per indikator: nilai sekarang dibanding catatan
     akhir hari kemarin (atau nilai awal karakter di hari pertama). Melengkapi
     delta melayang yang cuma tampil ~2 detik — pemain bisa lihat "apa yang
     bocor hari ini" kapan pun tanpa menunggu rangkuman malam. */
  const trendBase = $derived(
    s.history.length > 0
      ? s.history[s.history.length - 1].stats
      : getCharacter(s.characterId).startStats,
  );

  /* Strip pasang-surut: 30 hari sebagai barometer — badai terjadwal terlihat samar
     sebelum tiba, seperti barometer yang turun. */
  type TideDay = { day: number; mood: 'calm' | 'good' | 'storm' | 'bad' };
  const tide: TideDay[] = (() => {
    const days: TideDay[] = [];
    const moodAt: Record<number, TideDay['mood']> = {};
    for (const [startStr, id] of Object.entries(SCENARIO_SCHEDULE)) {
      const start = Number(startStr);
      const sc = SCENARIOS[id];
      for (let d = start; d < start + sc.duration; d++) {
        moodAt[d] = sc.mood === 'storm' ? 'storm' : sc.mood === 'good' ? 'good' : 'bad';
      }
    }
    for (let d = 1; d <= TOTAL_DAYS; d++) days.push({ day: d, mood: moodAt[d] ?? 'calm' });
    return days;
  })();

  function onMute() {
    muted = toggleMute();
    sfx.click();
  }

  /** Delta melayang terbaru per indikator. */
  const floats = $derived(
    STAT_KEYS.map((key) => {
      for (let i = game.bursts.length - 1; i >= 0; i--) {
        const v = game.bursts[i].effects[key];
        if (v) return { key, id: game.bursts[i].id, v };
      }
      return null;
    }).filter((x) => x !== null),
  );
</script>

<header class="hud">
  <div class="tide" role="img" aria-label="Peta arus 30 hari; hari ke-{s.day}">
    {#each tide as t (t.day)}
      <div
        class="tick {t.mood}"
        class:past={t.day < s.day}
        class:today={t.day === s.day}
        title="Hari {t.day}{t.mood === 'storm' ? ' — perkiraan cuaca buruk' : ''}"
      ></div>
    {/each}
  </div>

  <div class="bar">
    <div class="day-stamp">
      <span class="d-label">Hari</span>
      <span class="d-num">{s.day}<span class="d-total">/{TOTAL_DAYS}</span></span>
    </div>

    <div class="gauges">
      {#each STAT_KEYS as key (key)}
        {@const v = s.stats[key]}
        {@const trend = v - trendBase[key]}
        <div
          class="gauge"
          class:danger={v <= DANGER_ZONE}
          title="{STATS[key].label}: {v}/100 — {STATS[key].desc}{trend !== 0
            ? ` (hari ini ${trend > 0 ? '+' : ''}${trend})`
            : ''}"
        >
          <span class="g-icon">{STATS[key].icon}</span>
          <div class="g-body">
            <div class="g-top">
              <span class="g-label">{STATS[key].label}</span>
              {#if trend !== 0}
                <span class="g-trend {trend > 0 ? 'naik' : 'turun'}">
                  {trend > 0 ? '▲' : '▼'}{Math.abs(trend)}
                </span>
              {/if}
              <span class="g-num">{v}</span>
            </div>
            <div class="g-track">
              <div class="g-fill" style="width: {v}%; background: var(--c-{key})"></div>
            </div>
          </div>
          {#each floats.filter((f) => f.key === key) as f (f.id)}
            <span class="float {f.v > 0 ? 'naik' : 'turun'}">{f.v > 0 ? '+' : ''}{f.v}</span>
          {/each}
        </div>
      {/each}
    </div>

    <div class="right">
      {#each s.activeScenarios as act (act.id)}
        {@const sc = SCENARIOS[act.id]}
        <span
          class="scenario {sc.mood}"
          title="{sc.name} — {act.daysLeft} hari lagi. Efek harian otomatis."
        >
          {sc.icon}<b>{act.daysLeft}</b>
        </span>
      {/each}
      <button
        class="icon-btn"
        onclick={() => {
          motion.toggle();
          sfx.click();
        }}
        aria-label={motion.ambient ? 'Matikan animasi latar' : 'Nyalakan animasi latar'}
        title={motion.ambient
          ? 'Animasi latar menyala — klik untuk hemat gerak'
          : 'Animasi latar mati (hemat gerak) — klik untuk menyalakan'}
      >
        {motion.ambient ? '💫' : '💤'}
      </button>
      <button class="icon-btn" onclick={onMute} aria-label={muted ? 'Nyalakan suara' : 'Senyapkan'}>
        {muted ? '🔇' : '🔊'}
      </button>
    </div>
  </div>
</header>

<style>
  .hud {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    z-index: 30;
    display: flex;
    flex-direction: column;
  }

  /* ── Strip pasang-surut ── */
  .tide {
    display: flex;
    gap: 2px;
    padding: 5px 8px 4px;
    background: linear-gradient(180deg, rgba(4, 12, 26, 0.85), rgba(4, 12, 26, 0.55));
  }

  .tick {
    flex: 1;
    height: 6px;
    border-radius: 2px;
    background: rgba(157, 180, 211, 0.22);
    transition: background 0.3s;
  }

  .tick.storm {
    background: repeating-linear-gradient(
      -45deg,
      rgba(228, 96, 78, 0.7),
      rgba(228, 96, 78, 0.7) 3px,
      rgba(228, 96, 78, 0.18) 3px,
      rgba(228, 96, 78, 0.18) 6px
    );
  }

  .tick.bad {
    background: rgba(228, 96, 78, 0.28);
  }

  .tick.good {
    background: rgba(88, 192, 138, 0.4);
  }

  .tick.past {
    background: rgba(245, 184, 65, 0.75);
  }

  .tick.today {
    background: var(--lampu-terang);
    box-shadow: 0 0 8px 1px rgba(255, 217, 122, 0.9);
  }

  /* ── Baris utama ── */
  .bar {
    display: flex;
    align-items: stretch;
    gap: 10px;
    padding: 8px 12px 10px;
    background: linear-gradient(180deg, rgba(4, 12, 26, 0.55), transparent);
  }

  .day-stamp {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 4px 14px;
    border-radius: var(--radius-s);
    background: linear-gradient(180deg, var(--laut-panel), var(--laut-dalam));
    border: 1px solid var(--garis-buih);
    box-shadow: var(--shadow-panel);
    min-width: 74px;
  }

  .d-label {
    font-size: 10px;
    letter-spacing: 0.22em;
    text-transform: uppercase;
    color: var(--lampu);
    font-weight: 800;
  }

  .d-num {
    font-family: var(--font-display);
    font-size: 26px;
    font-weight: 800;
    line-height: 1;
  }

  .d-total {
    font-size: 13px;
    color: var(--busa-redup);
    font-weight: 600;
  }

  .gauges {
    flex: 1;
    display: grid;
    grid-template-columns: repeat(6, minmax(0, 1fr));
    gap: 8px;
  }

  .gauge {
    position: relative;
    display: flex;
    align-items: center;
    gap: 7px;
    padding: 6px 10px;
    border-radius: var(--radius-s);
    background: linear-gradient(180deg, rgba(22, 52, 90, 0.92), rgba(15, 41, 71, 0.92));
    border: 1px solid var(--garis-buih);
    box-shadow: var(--shadow-panel);
    min-width: 0;
  }

  .gauge.danger {
    border-color: var(--karang);
    animation: danger-pulse 1.1s ease-in-out infinite;
  }

  @keyframes danger-pulse {
    0%,
    100% {
      box-shadow: 0 0 0 0 rgba(228, 96, 78, 0.55);
    }
    50% {
      box-shadow: 0 0 0 5px rgba(228, 96, 78, 0);
    }
  }

  .g-icon {
    font-size: 16px;
  }

  .g-body {
    flex: 1;
    min-width: 0;
  }

  .g-top {
    display: flex;
    justify-content: space-between;
    align-items: baseline;
    gap: 4px;
  }

  .g-label {
    font-size: 10.5px;
    font-weight: 700;
    letter-spacing: 0.04em;
    text-transform: uppercase;
    color: var(--busa-redup);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .g-num {
    font-size: 13.5px;
    font-weight: 800;
    font-variant-numeric: tabular-nums;
  }

  .g-trend {
    font-size: 10px;
    font-weight: 800;
    font-variant-numeric: tabular-nums;
    white-space: nowrap;
  }

  .g-trend.naik {
    color: var(--bakau);
  }

  .g-trend.turun {
    color: var(--karang);
  }

  .g-track {
    height: 5px;
    margin-top: 3px;
    border-radius: 99px;
    background: rgba(8, 23, 41, 0.8);
    overflow: hidden;
  }

  .g-fill {
    height: 100%;
    border-radius: 99px;
    transition: width 0.55s cubic-bezier(0.2, 0.7, 0.2, 1);
  }

  .float {
    position: absolute;
    top: -4px;
    right: 8px;
    font-size: 15px;
    font-weight: 800;
    animation: float-delta 1.8s ease-out forwards;
    pointer-events: none;
    text-shadow: 0 2px 8px rgba(2, 8, 20, 0.9);
  }

  .float.naik {
    color: var(--bakau);
  }

  .float.turun {
    color: var(--karang);
  }

  @keyframes float-delta {
    0% {
      opacity: 0;
      transform: translateY(6px) scale(0.8);
    }
    15% {
      opacity: 1;
      transform: translateY(-6px) scale(1.15);
    }
    75% {
      opacity: 1;
    }
    100% {
      opacity: 0;
      transform: translateY(-30px) scale(1);
    }
  }

  .right {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .scenario {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    font-size: 16px;
    padding: 6px 10px;
    border-radius: var(--radius-s);
    border: 1px solid var(--garis-buih);
    background: linear-gradient(180deg, rgba(22, 52, 90, 0.92), rgba(15, 41, 71, 0.92));
    box-shadow: var(--shadow-panel);
  }

  .scenario b {
    font-size: 12px;
    color: var(--busa-redup);
  }

  .scenario.storm {
    border-color: var(--karang);
  }

  .scenario.good {
    border-color: var(--bakau);
  }

  .icon-btn {
    width: 40px;
    height: 40px;
    border-radius: var(--radius-s);
    font-size: 17px;
    background: linear-gradient(180deg, rgba(22, 52, 90, 0.92), rgba(15, 41, 71, 0.92));
    border: 1px solid var(--garis-buih);
  }

  @media (max-width: 1050px) {
    .gauges {
      grid-template-columns: repeat(3, 1fr);
    }
    .g-label {
      display: none;
    }
  }
</style>
