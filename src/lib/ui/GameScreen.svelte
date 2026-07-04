<script lang="ts">
  import { game } from '../engine/store.svelte';
  import { FACILITIES } from '../data/facilities';
  import { SCENARIOS } from '../data/scenarios';
  import { getCharacter } from '../data/characters';
  import { SLOTS_PER_DAY } from '../types';
  import Hud from './Hud.svelte';
  import MorningReport from './MorningReport.svelte';
  import EventCard from './EventCard.svelte';
  import FacilityPanel from './FacilityPanel.svelte';
  import DaySummary from './DaySummary.svelte';
  import WeatherFX from './WeatherFX.svelte';
  import { sfx } from '../audio/sfx';

  const s = $derived(game.state!);
  const character = $derived(getCharacter(s.characterId));
  const stormActive = $derived(s.activeScenarios.some((a) => SCENARIOS[a.id].mood === 'storm'));
  const goodActive = $derived(s.activeScenarios.some((a) => SCENARIOS[a.id].mood === 'good'));

  let abilityNote = $state('');

  function onAbility() {
    const res = game.ability();
    if (!res.ok && res.reason) {
      abilityNote = res.reason;
      setTimeout(() => (abilityNote = ''), 2200);
      sfx.bad();
    }
  }

  function openFacility(id: string) {
    if (s.phase !== 'manage') return;
    game.openFacility = id;
    sfx.open();
  }

  /* Parallax halus mengikuti kursor */
  let mx = $state(0);
  let my = $state(0);
  function onMove(e: MouseEvent) {
    mx = (e.clientX / window.innerWidth - 0.5) * 2;
    my = (e.clientY / window.innerHeight - 0.5) * 2;
  }
</script>

<svelte:window onmousemove={onMove} />

<div class="game" class:storm={stormActive}>
  <!-- ── Panggung peta ── -->
  <div class="stage-clip">
    <div class="stage" style="transform: translate(calc(-50% + {mx * -0.6}%), calc(-50% + {my * -0.6}%))">
      <img class="map" src="./assets/images/bg.png" alt="Peta Pelabuhan Muara Harapan" />
      <div class="sea-shimmer" aria-hidden="true"></div>

      {#each FACILITIES as f (f.id)}
        <button
          class="facility"
          class:bob={f.id === 'kapal'}
          class:disabled={s.phase !== 'manage'}
          style="left: {f.pos.x}%; top: {f.pos.y}%; width: {f.pos.w}%"
          onclick={() => openFacility(f.id)}
          title={f.name}
        >
          <img src={f.sprite} alt={f.name} draggable="false" />
          <span class="plate"><span>{f.icon}</span>{f.name}</span>
        </button>
      {/each}

      <!-- dekorasi hidup -->
      <img class="deco truck" src="./assets/images/truk.png" alt="" aria-hidden="true" />
      <img class="deco ship" src="./assets/images/kargo.png" alt="" aria-hidden="true" />
    </div>
  </div>

  <WeatherFX storm={stormActive} sunny={goodActive} />
  <Hud />

  <!-- ── Bilah bawah ── -->
  <footer class="bottom">
    <div class="who panel">
      <span class="who-icon">{character.ability.icon}</span>
      <div class="who-body">
        <b>{character.name}</b>
        <button
          class="ability-btn"
          disabled={s.abilityCooldown > 0 || s.phase !== 'manage'}
          onclick={onAbility}
          title={character.ability.desc}
        >
          {character.ability.name}
          {#if s.abilityCooldown > 0}<span class="cd">{s.abilityCooldown}h</span>{/if}
        </button>
      </div>
      {#if abilityNote}<span class="note">{abilityNote}</span>{/if}
    </div>

    {#if s.phase === 'manage'}
      <div class="day-controls">
        <div class="slots panel" title="Jam kerja: tiap aksi fasilitas memakai satu">
          {#each Array(SLOTS_PER_DAY) as _, i (i)}
            <span class="slot" class:used={i >= s.slots}>⏱</span>
          {/each}
        </div>
        <button class="btn btn-lampu" onclick={() => game.closeDay()}>🌙 Akhiri Hari</button>
      </div>
    {/if}
  </footer>

  <!-- ── Lapisan fase ── -->
  {#if s.phase === 'morning'}
    <MorningReport />
  {:else if s.phase === 'event'}
    <EventCard />
  {:else if s.phase === 'summary'}
    <DaySummary />
  {/if}

  {#if game.openFacility}
    <FacilityPanel facilityId={game.openFacility} />
  {/if}
</div>

<style>
  .game {
    position: fixed;
    inset: 0;
    overflow: hidden;
    background: var(--laut-malam);
  }

  .stage-clip {
    position: absolute;
    inset: 0;
    overflow: hidden;
  }

  /* Peta menutupi layar penuh dengan rasio asli 1445×1084 */
  .stage {
    position: absolute;
    left: 50%;
    top: 50%;
    width: max(103vw, 137.3vh);
    aspect-ratio: 1445 / 1084;
    transition: transform 0.6s cubic-bezier(0.2, 0.7, 0.2, 1);
  }

  .map {
    width: 100%;
    height: 100%;
    object-fit: cover;
    user-select: none;
    -webkit-user-drag: none;
  }

  .game.storm .map {
    filter: saturate(0.65) brightness(0.75) contrast(1.05);
  }

  .map {
    transition: filter 1.2s ease;
  }

  .sea-shimmer {
    position: absolute;
    inset: 0;
    background:
      radial-gradient(ellipse 30% 12% at 78% 40%, rgba(255, 255, 255, 0.18), transparent),
      radial-gradient(ellipse 24% 10% at 88% 70%, rgba(255, 255, 255, 0.14), transparent),
      radial-gradient(ellipse 26% 10% at 68% 88%, rgba(255, 255, 255, 0.12), transparent);
    animation: shimmer 5.5s ease-in-out infinite;
    pointer-events: none;
    mix-blend-mode: overlay;
  }

  /* ── Fasilitas ── */
  .facility {
    position: absolute;
    transform: translate(-50%, -55%);
    transition: transform 0.22s cubic-bezier(0.2, 0.7, 0.2, 1);
    filter: drop-shadow(0 10px 18px rgba(2, 8, 20, 0.35));
  }

  .facility:hover:not(.disabled) {
    transform: translate(-50%, -55%) scale(1.06) translateY(-4px);
    z-index: 5;
  }

  .facility:hover:not(.disabled) img {
    filter: brightness(1.1) drop-shadow(0 0 14px rgba(245, 184, 65, 0.55));
  }

  .facility.disabled {
    cursor: default;
  }

  .facility img {
    width: 100%;
    transition: filter 0.2s ease;
    user-select: none;
    -webkit-user-drag: none;
  }

  .facility.bob {
    animation: bob 4.5s ease-in-out infinite;
  }

  .plate {
    position: absolute;
    left: 50%;
    bottom: 4%;
    transform: translateX(-50%);
    display: inline-flex;
    align-items: center;
    gap: 5px;
    white-space: nowrap;
    padding: 4px 12px;
    font-size: 12.5px;
    font-weight: 800;
    letter-spacing: 0.02em;
    color: var(--busa);
    background: rgba(8, 23, 41, 0.82);
    border: 1px solid var(--garis-buih);
    border-radius: 999px;
    backdrop-filter: blur(4px);
    opacity: 0;
    translate: 0 6px;
    transition:
      opacity 0.2s ease,
      translate 0.2s ease;
    pointer-events: none;
    box-shadow: var(--shadow-panel);
  }

  .facility:hover:not(.disabled) .plate,
  .facility:focus-visible .plate {
    opacity: 1;
    translate: 0 0;
  }

  /* Truk pengangkut hilir-mudik di jalan pelabuhan */
  .deco.truck {
    position: absolute;
    width: 4.6%;
    left: 30%;
    top: 41%;
    animation: drive 26s linear infinite;
    pointer-events: none;
  }

  @keyframes drive {
    0%,
    100% {
      offset: none;
      transform: translate(0, 0);
      opacity: 0;
    }
    4% {
      opacity: 1;
    }
    46% {
      transform: translate(21vw, 10.2vw);
      opacity: 1;
    }
    50% {
      opacity: 0;
    }
    54% {
      transform: translate(21vw, 10.2vw) scaleX(-1);
      opacity: 1;
    }
    96% {
      transform: translate(0, 0) scaleX(-1);
      opacity: 1;
    }
  }

  /* Kapal kargo berlayar pelan di laut lepas */
  .deco.ship {
    position: absolute;
    width: 9%;
    left: 88%;
    top: 78%;
    animation: sail 60s linear infinite;
    pointer-events: none;
    filter: drop-shadow(0 8px 14px rgba(2, 8, 20, 0.3));
  }

  @keyframes sail {
    0% {
      transform: translate(6vw, 14vh);
      opacity: 0;
    }
    6% {
      opacity: 1;
    }
    48% {
      transform: translate(-4vw, -28vh);
      opacity: 1;
    }
    50% {
      transform: translate(-4vw, -28vh) scaleX(-1);
      opacity: 1;
    }
    94% {
      opacity: 1;
    }
    100% {
      transform: translate(6vw, 14vh) scaleX(-1);
      opacity: 0;
    }
  }

  /* ── Bilah bawah ── */
  .bottom {
    position: absolute;
    left: 0;
    right: 0;
    bottom: 0;
    z-index: 30;
    display: flex;
    align-items: flex-end;
    justify-content: space-between;
    padding: 14px 16px;
    gap: 12px;
    pointer-events: none;
    background: linear-gradient(0deg, rgba(4, 12, 26, 0.5), transparent);
  }

  .bottom > * {
    pointer-events: auto;
  }

  .who {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 9px 14px;
    position: relative;
  }

  .who-icon {
    font-size: 24px;
  }

  .who-body {
    display: flex;
    flex-direction: column;
    gap: 3px;
  }

  .who-body b {
    font-size: 13px;
  }

  .ability-btn {
    font-size: 12.5px;
    font-weight: 700;
    color: var(--lampu-terang);
    padding: 4px 10px;
    border-radius: 999px;
    border: 1px solid color-mix(in srgb, var(--lampu) 55%, transparent);
    background: rgba(245, 184, 65, 0.1);
    transition: all 0.2s ease;
  }

  .ability-btn:hover:not(:disabled) {
    background: rgba(245, 184, 65, 0.22);
    box-shadow: 0 0 14px rgba(245, 184, 65, 0.3);
  }

  .ability-btn:disabled {
    opacity: 0.45;
    cursor: not-allowed;
    border-color: var(--garis-buih);
    color: var(--busa-redup);
  }

  .cd {
    margin-left: 5px;
    font-size: 11px;
    color: var(--busa-redup);
  }

  .note {
    position: absolute;
    bottom: calc(100% + 8px);
    left: 0;
    white-space: nowrap;
    font-size: 12px;
    font-weight: 700;
    color: var(--karang);
    background: rgba(8, 23, 41, 0.92);
    border: 1px solid var(--karang);
    padding: 6px 12px;
    border-radius: var(--radius-s);
    animation: float-up 0.25s ease both;
  }

  .day-controls {
    display: flex;
    align-items: center;
    gap: 10px;
  }

  .slots {
    display: flex;
    gap: 6px;
    padding: 10px 14px;
    font-size: 15px;
  }

  .slot {
    transition:
      opacity 0.3s,
      filter 0.3s;
  }

  .slot.used {
    opacity: 0.25;
    filter: grayscale(1);
  }
</style>
