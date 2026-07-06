<script lang="ts">
  import { game } from '../engine/store.svelte';
  import { NPCS } from '../data/npcs';
  import { STATS } from '../data/stats';
  import { STAT_KEYS, type Choice, type Effects } from '../types';
  import { canAfford } from '../engine/core';

  const s = $derived(game.state!);
  const event = $derived(game.event);
  const npc = $derived(event ? NPCS[event.speaker] : null);

  let chosen = $state<Choice | null>(null);
  let applied = $state<Effects>({});

  function choose(c: Choice) {
    if (chosen) return;
    applied = game.choose(c);
    chosen = c;
  }

  /* Petunjuk arah dampak — jujur, tanpa angka. */
  function hintChips(c: Choice): { icon: string; dir: 'naik' | 'turun' | 'tanda' }[] {
    return c.hints.map((h) => {
      if (h === 'risiko') return { icon: '⚠️', dir: 'tanda' };
      if (h === 'netral') return { icon: '➖', dir: 'tanda' };
      const key = h.slice(0, -1) as (typeof STAT_KEYS)[number];
      const dir = h.endsWith('+') ? 'naik' : 'turun';
      return { icon: STATS[key]?.icon ?? '❔', dir };
    });
  }

  /* Angka 1–3 = pilih; Enter = lanjut setelah memilih. Dilewati bila fokus
     di tombol/input agar tak dobel dengan aksi bawaan browser. */
  function onKey(e: KeyboardEvent) {
    if (e.repeat || !event) return;
    if ((e.target as HTMLElement)?.closest?.('button, input, textarea, select')) return;
    if (!chosen && ['1', '2', '3'].includes(e.key)) {
      const c = event.choices[Number(e.key) - 1];
      if (c && canAfford(s, c.cost)) {
        e.preventDefault();
        choose(c);
      }
    } else if (chosen && e.key === 'Enter') {
      e.preventDefault();
      game.finishEvent();
    }
  }
</script>

<svelte:window onkeydown={onKey} />

{#if event && npc}
  <div class="overlay">
    <article class="card panel" style="--npc: {npc.color}">
      <header>
        <div class="medallion" title={npc.role}>
          <span>{npc.icon}</span>
        </div>
        <div class="who">
          <b>{npc.name}</b>
          {#if npc.role}<small>{npc.role}</small>{/if}
        </div>
        <span class="day-tag">Hari {s.day}</span>
      </header>

      <h2>{event.title}</h2>
      <p class="text">{event.text}</p>

      {#if !chosen}
        <div class="choices">
          {#each event.choices as c, i (i)}
            {@const affordable = canAfford(s, c.cost)}
            <button
              class="choice"
              disabled={!affordable}
              onclick={() => choose(c)}
              style="animation-delay: {0.06 + i * 0.06}s"
            >
              <span class="c-key" aria-hidden="true">{i + 1}</span>
              <span class="c-label">
                {c.label}
                {#if c.cost}
                  <span class="cost" class:short={!affordable}>💰 −{c.cost}</span>
                {/if}
              </span>
              <span class="c-hints">
                {#each hintChips(c) as h, j (j)}
                  <span class="hint {h.dir}">
                    {h.icon}{h.dir === 'naik' ? '▲' : h.dir === 'turun' ? '▼' : ''}
                  </span>
                {/each}
              </span>
              {#if !affordable}<span class="lock">Dana tidak cukup</span>{/if}
            </button>
          {/each}
        </div>
        <p class="footnote">Tak ada pilihan yang gratis — pilih yang bisa kau pertanggungjawabkan.</p>
      {:else}
        <div class="outcome">
          <p class="o-choice">➤ {chosen.label}</p>
          <p class="o-text">{chosen.outcome}</p>
          <div class="o-chips">
            {#each STAT_KEYS.filter((k) => applied[k]) as k (k)}
              <span class="chip {applied[k]! > 0 ? 'naik' : 'turun'}">
                {STATS[k].icon}
                {STATS[k].label}
                {applied[k]! > 0 ? '+' : ''}{applied[k]}
              </span>
            {/each}
            {#if Object.keys(applied).length === 0}
              <span class="chip">Tidak ada perubahan angka — kali ini.</span>
            {/if}
          </div>
          <button class="btn btn-lampu next" onclick={() => game.finishEvent()}>
            Lanjut Kelola Pelabuhan →
          </button>
        </div>
      {/if}
    </article>
  </div>
{/if}

<style>
  .overlay {
    position: absolute;
    inset: 0;
    z-index: 40;
    display: grid;
    place-items: center;
    padding: 20px;
    background: rgba(4, 12, 26, 0.6);
    backdrop-filter: blur(3px);
    animation: fade 0.22s ease both;
  }

  @keyframes fade {
    from {
      opacity: 0;
    }
  }

  .card {
    width: min(600px, 100%);
    max-height: min(88vh, 100%);
    overflow-y: auto;
    padding: 22px 26px 24px;
    border-top: 4px solid var(--npc);
    animation: deal 0.35s cubic-bezier(0.2, 0.7, 0.2, 1) both;
  }

  @keyframes deal {
    from {
      opacity: 0;
      transform: translateY(26px) rotate(0.8deg) scale(0.98);
    }
    to {
      opacity: 1;
      transform: none;
    }
  }

  header {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-bottom: 14px;
  }

  .medallion {
    width: 46px;
    height: 46px;
    border-radius: 50%;
    display: grid;
    place-items: center;
    font-size: 22px;
    background: color-mix(in srgb, var(--npc) 22%, var(--laut-malam));
    border: 2px solid var(--npc);
    box-shadow: 0 0 16px color-mix(in srgb, var(--npc) 35%, transparent);
    flex-shrink: 0;
  }

  .who {
    flex: 1;
    display: flex;
    flex-direction: column;
    line-height: 1.3;
  }

  .who b {
    font-size: 15px;
  }

  .who small {
    color: var(--busa-redup);
    font-size: 12px;
  }

  .day-tag {
    font-size: 11.5px;
    font-weight: 800;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    color: var(--busa-redup);
    border: 1px solid var(--garis-buih);
    padding: 4px 10px;
    border-radius: 999px;
  }

  h2 {
    font-size: 24px;
    font-weight: 800;
    margin-bottom: 8px;
  }

  .text {
    font-size: 14.5px;
    color: #cfdff5;
    margin-bottom: 18px;
  }

  .choices {
    display: flex;
    flex-direction: column;
    gap: 9px;
  }

  .choice {
    position: relative;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    width: 100%;
    text-align: left;
    padding: 13px 16px;
    border-radius: var(--radius-s);
    background: rgba(8, 23, 41, 0.55);
    border: 1px solid var(--garis-buih);
    font-size: 14px;
    font-weight: 600;
    transition:
      border-color 0.18s ease,
      background 0.18s ease,
      transform 0.18s ease;
    animation: float-up 0.45s ease both;
  }

  .choice:hover:not(:disabled) {
    border-color: var(--lampu);
    background: rgba(245, 184, 65, 0.07);
    transform: translateX(4px);
  }

  .choice:disabled {
    opacity: 0.55;
    cursor: not-allowed;
  }

  .c-key {
    flex-shrink: 0;
    width: 20px;
    height: 20px;
    display: grid;
    place-items: center;
    font-size: 11px;
    font-weight: 800;
    color: var(--busa-redup);
    border: 1px solid var(--garis-buih);
    border-radius: 5px;
    background: rgba(8, 23, 41, 0.75);
  }

  .choice:hover:not(:disabled) .c-key {
    color: var(--lampu-terang);
    border-color: var(--lampu);
  }

  .c-label {
    flex: 1;
  }

  .cost {
    display: inline-block;
    margin-left: 8px;
    font-size: 12px;
    font-weight: 800;
    color: var(--c-dana);
    white-space: nowrap;
  }

  .cost.short {
    color: var(--karang);
  }

  .c-hints {
    display: flex;
    gap: 4px;
    flex-shrink: 0;
    flex-wrap: wrap;
    justify-content: flex-end;
  }

  .hint {
    font-size: 12px;
    padding: 3px 7px;
    border-radius: 999px;
    background: rgba(8, 23, 41, 0.75);
    border: 1px solid var(--garis-buih);
  }

  .hint.naik {
    border-color: color-mix(in srgb, var(--bakau) 50%, transparent);
  }

  .hint.turun {
    border-color: color-mix(in srgb, var(--karang) 50%, transparent);
  }

  .lock {
    position: absolute;
    right: 10px;
    bottom: -7px;
    font-size: 10.5px;
    font-weight: 800;
    color: var(--karang);
    background: var(--laut-malam);
    padding: 1px 8px;
    border-radius: 99px;
    border: 1px solid var(--karang);
  }

  .footnote {
    margin-top: 14px;
    font-size: 12px;
    color: var(--busa-redup);
    text-align: center;
    font-style: italic;
  }

  /* ── Hasil pilihan ── */
  .outcome {
    animation: float-up 0.4s ease both;
  }

  .o-choice {
    font-weight: 800;
    font-size: 13.5px;
    color: var(--lampu-terang);
    margin-bottom: 8px;
  }

  .o-text {
    font-size: 14.5px;
    color: #cfdff5;
    border-left: 3px solid var(--npc);
    padding-left: 14px;
    margin-bottom: 14px;
  }

  .o-chips {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
    margin-bottom: 16px;
  }

  .o-chips .chip {
    font-size: 13px;
    padding: 5px 11px;
    animation: pop 0.35s cubic-bezier(0.2, 0.7, 0.3, 1.4) both;
  }

  .o-chips .chip:nth-child(2) {
    animation-delay: 0.08s;
  }
  .o-chips .chip:nth-child(3) {
    animation-delay: 0.16s;
  }
  .o-chips .chip:nth-child(4) {
    animation-delay: 0.24s;
  }

  @keyframes pop {
    from {
      opacity: 0;
      transform: scale(0.6);
    }
    to {
      opacity: 1;
      transform: scale(1);
    }
  }

  .next {
    width: 100%;
  }
</style>
