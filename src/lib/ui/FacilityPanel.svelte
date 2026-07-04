<script lang="ts">
  import { game } from '../engine/store.svelte';
  import { getFacility } from '../data/facilities';
  import { STATS } from '../data/stats';
  import { STAT_KEYS, type FacilityAction } from '../types';
  import { canAfford, wouldBeFatal } from '../engine/core';
  import { sfx } from '../audio/sfx';

  let { facilityId }: { facilityId: string } = $props();

  const s = $derived(game.state!);
  const facility = $derived(getFacility(facilityId as never));

  let note = $state('');

  function close() {
    game.openFacility = null;
    sfx.close();
  }

  function status(a: FacilityAction): { ok: boolean; label?: string } {
    if (a.once && s.usedOnce.includes(a.id)) return { ok: false, label: '✓ Terbangun' };
    if (s.cooldowns[a.id]) return { ok: false, label: `Jeda ${s.cooldowns[a.id]} hari` };
    if (s.slots <= 0) return { ok: false, label: 'Jam kerja habis' };
    if (!canAfford(s, a.cost)) return { ok: false, label: 'Dana kurang' };
    const fatal = wouldBeFatal(s, a.effects, a.cost ?? 0);
    if (fatal) return { ok: false, label: `${STATS[fatal].icon} terlalu kritis` };
    return { ok: true };
  }

  function run(a: FacilityAction) {
    const res = game.act(a.id);
    if (!res.ok && res.reason) {
      note = res.reason;
      setTimeout(() => (note = ''), 2000);
    }
  }
</script>

<aside class="drawer panel" aria-label="Panel {facility.name}">
  <header>
    <img class="thumb" src={facility.sprite} alt="" />
    <div class="head-text">
      <h2>{facility.icon} {facility.name}</h2>
      <p>{facility.tagline}</p>
    </div>
    <button class="close" onclick={close} aria-label="Tutup panel">✕</button>
  </header>

  <div class="slots-line">
    Jam kerja tersisa hari ini:
    <b>{s.slots}</b>
    {#if note}<span class="note">{note}</span>{/if}
  </div>

  <div class="actions">
    {#each facility.actions as a (a.id)}
      {@const st = status(a)}
      <div class="action" class:off={!st.ok}>
        <div class="a-head">
          <span class="a-icon">{a.icon}</span>
          <b>{a.name}</b>
          {#if a.once}<span class="once">sekali bangun</span>{/if}
        </div>
        <p class="a-desc">{a.desc}</p>
        <div class="a-foot">
          <div class="a-chips">
            {#if a.cost}<span class="chip turun">💰 −{a.cost}</span>{/if}
            {#each STAT_KEYS.filter((k) => a.effects[k]) as k (k)}
              <span class="chip {a.effects[k]! > 0 ? 'naik' : 'turun'}">
                {STATS[k].icon}
                {a.effects[k]! > 0 ? '+' : ''}{a.effects[k]}
              </span>
            {/each}
            {#if !a.once && a.cooldown > 0}
              <span class="chip">🔁 jeda {a.cooldown} hari</span>
            {/if}
          </div>
          {#if st.ok}
            <button class="btn do" onclick={() => run(a)}>Kerjakan</button>
          {:else}
            <span class="blocked">{st.label}</span>
          {/if}
        </div>
      </div>
    {/each}
  </div>
</aside>

<button class="scrim" onclick={close} aria-label="Tutup panel"></button>

<style>
  .scrim {
    position: absolute;
    inset: 0;
    z-index: 34;
    background: rgba(4, 12, 26, 0.35);
    cursor: default;
    animation: fade 0.25s ease both;
  }

  @keyframes fade {
    from {
      opacity: 0;
    }
  }

  .drawer {
    position: absolute;
    top: 96px;
    right: 14px;
    bottom: 78px;
    z-index: 35;
    width: min(400px, calc(100vw - 28px));
    display: flex;
    flex-direction: column;
    overflow: hidden;
    animation: slide-in 0.35s cubic-bezier(0.2, 0.7, 0.2, 1) both;
  }

  @keyframes slide-in {
    from {
      opacity: 0;
      transform: translateX(40px);
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
    padding: 14px 16px 10px;
    border-bottom: 1px solid var(--garis-buih);
    background: rgba(8, 23, 41, 0.4);
  }

  .thumb {
    width: 62px;
    height: 62px;
    object-fit: contain;
    filter: drop-shadow(0 4px 10px rgba(2, 8, 20, 0.5));
  }

  .head-text {
    flex: 1;
  }

  h2 {
    font-size: 18px;
    font-weight: 800;
  }

  .head-text p {
    font-size: 12.5px;
    color: var(--busa-redup);
  }

  .close {
    width: 34px;
    height: 34px;
    border-radius: 50%;
    border: 1px solid var(--garis-buih);
    background: rgba(8, 23, 41, 0.6);
    font-size: 14px;
    flex-shrink: 0;
  }

  .close:hover {
    border-color: var(--karang);
    color: var(--karang);
  }

  .slots-line {
    padding: 8px 16px;
    font-size: 12.5px;
    color: var(--busa-redup);
    border-bottom: 1px solid var(--garis-buih);
    display: flex;
    gap: 6px;
    align-items: center;
  }

  .slots-line b {
    color: var(--lampu-terang);
  }

  .note {
    color: var(--karang);
    font-weight: 700;
    margin-left: auto;
  }

  .actions {
    flex: 1;
    overflow-y: auto;
    padding: 12px 14px 14px;
    display: flex;
    flex-direction: column;
    gap: 10px;
  }

  .action {
    border: 1px solid var(--garis-buih);
    border-radius: var(--radius-s);
    padding: 12px 14px;
    background: rgba(8, 23, 41, 0.45);
    transition: border-color 0.2s ease;
  }

  .action:hover:not(.off) {
    border-color: var(--busa-redup);
  }

  .action.off {
    opacity: 0.62;
  }

  .a-head {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 14px;
  }

  .once {
    font-size: 10px;
    font-weight: 800;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: var(--lampu);
    border: 1px solid color-mix(in srgb, var(--lampu) 55%, transparent);
    padding: 2px 7px;
    border-radius: 99px;
    margin-left: auto;
  }

  .a-desc {
    font-size: 12.5px;
    color: var(--busa-redup);
    margin: 5px 0 9px;
  }

  .a-foot {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 8px;
  }

  .a-chips {
    display: flex;
    flex-wrap: wrap;
    gap: 4px;
  }

  .do {
    padding: 7px 16px;
    font-size: 13px;
    background: linear-gradient(180deg, var(--lampu-terang), var(--lampu));
    border-color: var(--lampu);
    color: #3a2603;
    flex-shrink: 0;
  }

  .blocked {
    font-size: 11.5px;
    font-weight: 800;
    color: var(--busa-redup);
    white-space: nowrap;
    border: 1px dashed var(--garis-buih);
    padding: 5px 10px;
    border-radius: 99px;
    flex-shrink: 0;
  }
</style>
