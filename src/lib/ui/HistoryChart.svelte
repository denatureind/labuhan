<script lang="ts">
  /**
   * Jejak 30 hari: enam garis indikator.
   * Spesifikasi mark: garis 2px, grid samar, label langsung berupa ikon
   * di ujung garis (identitas tak pernah cuma warna), tooltip hari saat hover.
   */
  import { STATS } from '../data/stats';
  import { STAT_KEYS, type DayRecord, type StatKey } from '../types';

  let { history }: { history: DayRecord[] } = $props();

  const W = 560;
  const H = 190;
  const PAD = { l: 30, r: 34, t: 10, b: 22 };
  const iw = W - PAD.l - PAD.r;
  const ih = H - PAD.t - PAD.b;

  const days = $derived(history.map((h) => h.day));
  const maxDay = $derived(Math.max(1, days[days.length - 1]));

  function x(day: number): number {
    return PAD.l + (day / maxDay) * iw;
  }

  function y(v: number): number {
    return PAD.t + (1 - v / 100) * ih;
  }

  function path(key: StatKey): string {
    return history.map((h, i) => `${i === 0 ? 'M' : 'L'}${x(h.day).toFixed(1)},${y(h.stats[key]).toFixed(1)}`).join(' ');
  }

  let hoverIdx = $state<number | null>(null);

  function onMove(e: MouseEvent) {
    const svg = e.currentTarget as SVGSVGElement;
    const rect = svg.getBoundingClientRect();
    const px = ((e.clientX - rect.left) / rect.width) * W;
    const day = ((px - PAD.l) / iw) * maxDay;
    let best = 0;
    let bestDist = Infinity;
    history.forEach((h, i) => {
      const d = Math.abs(h.day - day);
      if (d < bestDist) {
        bestDist = d;
        best = i;
      }
    });
    hoverIdx = best;
  }

  const hover = $derived(hoverIdx !== null ? history[hoverIdx] : null);
</script>

<div class="chart-wrap">
  <svg
    viewBox="0 0 {W} {H}"
    role="img"
    aria-label="Grafik enam indikator selama {maxDay} hari"
    onmousemove={onMove}
    onmouseleave={() => (hoverIdx = null)}
  >
    <!-- zona kritis ≤20 -->
    <rect x={PAD.l} y={y(20)} width={iw} height={y(0) - y(20)} fill="rgba(228,96,78,0.07)" />

    <!-- grid samar -->
    {#each [0, 50, 100] as g (g)}
      <line x1={PAD.l} y1={y(g)} x2={PAD.l + iw} y2={y(g)} class="grid" />
      <text x={PAD.l - 6} y={y(g) + 3.5} class="tick" text-anchor="end">{g}</text>
    {/each}
    {#each [1, 10, 20, 30].filter((d) => d <= maxDay) as d (d)}
      <text x={x(d)} y={H - 6} class="tick" text-anchor="middle">{d}</text>
    {/each}

    <!-- garis data -->
    {#each STAT_KEYS as key (key)}
      <path d={path(key)} class="line" style="stroke: var(--c-{key})" />
      <text x={x(maxDay) + 5} y={y(history[history.length - 1].stats[key]) + 4} class="end-icon">
        {STATS[key].icon}
      </text>
    {/each}

    <!-- crosshair -->
    {#if hover}
      <line x1={x(hover.day)} y1={PAD.t} x2={x(hover.day)} y2={PAD.t + ih} class="crosshair" />
      {#each STAT_KEYS as key (key)}
        <circle cx={x(hover.day)} cy={y(hover.stats[key])} r="3" style="fill: var(--c-{key})" class="dot" />
      {/each}
    {/if}
  </svg>

  {#if hover}
    <div class="tip" style="left: {(x(hover.day) / W) * 100}%">
      <b>{hover.day === 0 ? 'Awal' : `Hari ${hover.day}`}</b>
      {#each STAT_KEYS as key (key)}
        <span><i style="background: var(--c-{key})"></i>{hover.stats[key]}</span>
      {/each}
    </div>
  {/if}
</div>

<style>
  .chart-wrap {
    position: relative;
  }

  svg {
    width: 100%;
    height: auto;
    display: block;
  }

  .grid {
    stroke: rgba(157, 180, 211, 0.16);
    stroke-width: 1;
  }

  .tick {
    font-size: 9px;
    fill: var(--busa-redup);
    font-family: var(--font-body);
  }

  .line {
    fill: none;
    stroke-width: 2;
    stroke-linejoin: round;
    stroke-linecap: round;
  }

  .end-icon {
    font-size: 10px;
  }

  .crosshair {
    stroke: rgba(234, 244, 255, 0.35);
    stroke-width: 1;
    stroke-dasharray: 3 3;
  }

  .dot {
    stroke: var(--laut-dalam);
    stroke-width: 1.5;
  }

  .tip {
    position: absolute;
    top: -6px;
    transform: translateX(-50%);
    display: flex;
    align-items: center;
    gap: 7px;
    font-size: 11px;
    font-weight: 700;
    padding: 4px 10px;
    border-radius: 99px;
    background: rgba(8, 23, 41, 0.95);
    border: 1px solid var(--garis-buih);
    white-space: nowrap;
    pointer-events: none;
    font-variant-numeric: tabular-nums;
  }

  .tip i {
    display: inline-block;
    width: 7px;
    height: 7px;
    border-radius: 50%;
    margin-right: 3px;
  }

  .tip span {
    display: inline-flex;
    align-items: center;
  }
</style>
