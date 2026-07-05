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

  function onKey(e: KeyboardEvent) {
    if (e.key === 'Escape' && game.openFacility) {
      game.openFacility = null;
      sfx.close();
    }
  }
</script>

<svelte:window onmousemove={onMove} onkeydown={onKey} />

<div class="game" class:storm={stormActive}>
  <!-- ── Panggung peta ── -->
  <div class="stage-clip">
    <div class="stage" style="transform: translate(calc(-50% + {mx * -0.6}%), calc(-50% + {my * -0.6}%))">
      <img class="map" src="./assets/images/bg.png" alt="Peta Pelabuhan Muara Harapan" />
      <div class="sea-shimmer" aria-hidden="true"></div>
      <div class="sea-drift" aria-hidden="true"></div>

      <!-- Lalu lintas darat: di bawah bangunan agar teroklusi wajar -->
      <div class="traffic" aria-hidden="true">
        <img class="veh sedan" src="./assets/images/sedan.png" alt="" />
        <img class="veh mvp" src="./assets/images/mvp.png" alt="" />
        <img class="veh boxtruck" src="./assets/images/box.png" alt="" />
        <img class="veh truk" src="./assets/images/truk.png" alt="" />
      </div>

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

      <!-- Kapal kargo: singgah ke dermaga lalu berlayar pergi -->
      <div class="ship-track" aria-hidden="true">
        <img class="ship-img" src="./assets/images/kargo.png" alt="" />
      </div>

      <!-- Camar menyeberangi peta -->
      <div class="birds" aria-hidden="true">
        <span class="bird-track b0"><svg viewBox="0 0 26 10"><path d="M1 8 Q 7 1 13 8 Q 19 1 25 8" /></svg></span>
        <span class="bird-track b1"><svg viewBox="0 0 26 10"><path d="M1 8 Q 7 1 13 8 Q 19 1 25 8" /></svg></span>
        <span class="bird-track b2"><svg viewBox="0 0 26 10"><path d="M1 8 Q 7 1 13 8 Q 19 1 25 8" /></svg></span>
      </div>
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

  /* Lapisan kilau kedua: fase & tempo beda + hanyut pelan, biar air terasa berarus */
  .sea-drift {
    position: absolute;
    inset: 0;
    background:
      radial-gradient(ellipse 20% 8% at 86% 24%, rgba(255, 255, 255, 0.13), transparent),
      radial-gradient(ellipse 24% 9% at 93% 55%, rgba(255, 255, 255, 0.11), transparent),
      radial-gradient(ellipse 18% 7% at 74% 94%, rgba(255, 255, 255, 0.12), transparent),
      radial-gradient(ellipse 13% 6% at 22% 96%, rgba(255, 255, 255, 0.1), transparent),
      radial-gradient(ellipse 12% 5% at 63% 74%, rgba(255, 255, 255, 0.09), transparent);
    animation:
      shimmer 8.5s ease-in-out -3s infinite,
      sea-drift 26s ease-in-out infinite alternate;
    pointer-events: none;
    mix-blend-mode: overlay;
  }

  @keyframes sea-drift {
    from {
      transform: translate(0, 0);
    }
    to {
      transform: translate(0.7%, 0.4%);
    }
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

  /* ── Lalu lintas darat ─────────────────────────────────────────
     Sprite kendaraan menghadap barat-daya (kiri-bawah). Jalan isometrik
     punya dua keluarga arah; perjalanan ke tenggara memakai scaleX(-1).
     Tiap kendaraan: fade-in di satu tepi, melintas, fade-out di tepi lain,
     lalu menunggu (bagian sisa siklus) sebelum muncul lagi. */
  .traffic {
    position: absolute;
    inset: 0;
    pointer-events: none;
  }

  .veh {
    position: absolute;
    opacity: 0;
    filter: drop-shadow(0 5px 8px rgba(2, 8, 20, 0.3));
  }

  /* Jalur A (timur-laut → barat-daya, lewat simpang tengah) */
  .veh.sedan {
    width: 3.4%;
    left: 60%;
    top: 20.8%;
    animation: drive-sw 46s linear -9s infinite;
  }

  @keyframes drive-sw {
    0% {
      transform: translate(0, 0);
      opacity: 0;
    }
    3% {
      opacity: 1;
    }
    52% {
      transform: translate(-34vw, 17vw);
      opacity: 1;
    }
    56% {
      transform: translate(-37vw, 18.5vw);
      opacity: 0;
    }
    100% {
      transform: translate(-37vw, 18.5vw);
      opacity: 0;
    }
  }

  /* Jalur B (barat-laut → tenggara, jalan yang sama dipakai dua kendaraan
     dengan fase & tempo berbeda) */
  .veh.mvp {
    width: 3.7%;
    left: 28%;
    top: 26.5%;
    animation: drive-se 52s linear -31s infinite;
  }

  .veh.boxtruck {
    width: 4.1%;
    left: 28%;
    top: 27.3%; /* lajur sebelah, agar tak menumpuk persis dengan mvp */
    animation: drive-se 61s linear -4s infinite;
  }

  @keyframes drive-se {
    0% {
      transform: translate(0, 0) scaleX(-1);
      opacity: 0;
    }
    4% {
      opacity: 1;
    }
    55% {
      transform: translate(33vw, 16.5vw) scaleX(-1);
      opacity: 1;
    }
    59% {
      transform: translate(36vw, 18vw) scaleX(-1);
      opacity: 0;
    }
    100% {
      transform: translate(36vw, 18vw) scaleX(-1);
      opacity: 0;
    }
  }

  /* Jalur C (jalan angkut tepi tapak, menuju pesisir) */
  .veh.truk {
    width: 4.6%;
    left: 21.5%;
    top: 49%;
    animation: drive-haul 40s linear -20s infinite;
  }

  @keyframes drive-haul {
    0% {
      transform: translate(0, 0) scaleX(-1);
      opacity: 0;
    }
    5% {
      opacity: 1;
    }
    48% {
      transform: translate(23vw, 11.5vw) scaleX(-1);
      opacity: 1;
    }
    53% {
      transform: translate(26vw, 13vw) scaleX(-1);
      opacity: 0;
    }
    100% {
      transform: translate(26vw, 13vw) scaleX(-1);
      opacity: 0;
    }
  }

  /* ── Kapal kargo: datang dari laut lepas, sandar di dermaga, pergi lagi ── */
  .ship-track {
    position: absolute;
    width: 9%;
    left: 93%;
    top: 71%;
    animation: sail-visit 84s linear infinite;
    pointer-events: none;
    opacity: 0;
  }

  .ship-img {
    width: 100%;
    animation: bob 6s ease-in-out infinite;
    filter: drop-shadow(0 8px 14px rgba(2, 8, 20, 0.3));
  }

  @keyframes sail-visit {
    0% {
      transform: translate(0, 0);
      opacity: 0;
    }
    5% {
      opacity: 1;
    }
    /* berlayar mendekat ke sisi air dermaga */
    28% {
      transform: translate(-24.5vw, -3.6vw);
      opacity: 1;
    }
    /* sandar — bongkar muat (bob jalan terus lewat .ship-img) */
    54% {
      transform: translate(-24.5vw, -3.6vw);
      opacity: 1;
    }
    /* putar haluan */
    56% {
      transform: translate(-24.5vw, -3.6vw) scaleX(-1);
      opacity: 1;
    }
    /* berlayar pergi */
    93% {
      transform: translate(0, 0) scaleX(-1);
      opacity: 1;
    }
    97% {
      transform: translate(1.5vw, 0.5vw) scaleX(-1);
      opacity: 0;
    }
    100% {
      transform: translate(1.5vw, 0.5vw) scaleX(-1);
      opacity: 0;
    }
  }

  /* ── Camar ──────────────────────────────────────────────────── */
  .birds {
    position: absolute;
    inset: 0;
    pointer-events: none;
    z-index: 8;
  }

  .bird-track {
    position: absolute;
    opacity: 0;
  }

  .bird-track svg {
    width: 100%;
    fill: none;
    stroke: rgba(18, 32, 54, 0.55);
    stroke-width: 2.4;
    stroke-linecap: round;
    transform-origin: 50% 62%;
    animation: flap 0.85s ease-in-out infinite;
  }

  .bird-track.b0 {
    width: 1.7%;
    left: -3%;
    top: 33%;
    animation: fly-e 34s linear infinite;
  }

  .bird-track.b1 {
    width: 1.15%;
    left: 6%;
    top: 5%;
    animation: fly-e2 47s linear -19s infinite;
  }

  .bird-track.b1 svg {
    animation-duration: 0.7s;
    stroke-width: 2.8;
  }

  .bird-track.b2 {
    width: 1.4%;
    left: 102%;
    top: 10%;
    animation: fly-w 41s linear -28s infinite;
  }

  .bird-track.b2 svg {
    transform: scaleX(-1);
    animation: flap-rev 1s ease-in-out infinite;
  }

  @keyframes flap {
    0%,
    100% {
      transform: scaleY(1);
    }
    50% {
      transform: scaleY(0.5);
    }
  }

  @keyframes flap-rev {
    0%,
    100% {
      transform: scaleX(-1) scaleY(1);
    }
    50% {
      transform: scaleX(-1) scaleY(0.5);
    }
  }

  @keyframes fly-e {
    0% {
      transform: translate(0, 0);
      opacity: 0;
    }
    5% {
      opacity: 0.9;
    }
    72% {
      opacity: 0.9;
    }
    78% {
      transform: translate(76vw, -8vw);
      opacity: 0;
    }
    100% {
      transform: translate(76vw, -8vw);
      opacity: 0;
    }
  }

  @keyframes fly-e2 {
    0% {
      transform: translate(0, 0);
      opacity: 0;
    }
    6% {
      opacity: 0.85;
    }
    64% {
      opacity: 0.85;
    }
    70% {
      transform: translate(68vw, 9vw);
      opacity: 0;
    }
    100% {
      transform: translate(68vw, 9vw);
      opacity: 0;
    }
  }

  @keyframes fly-w {
    0% {
      transform: translate(0, 0);
      opacity: 0;
    }
    5% {
      opacity: 0.85;
    }
    68% {
      opacity: 0.85;
    }
    74% {
      transform: translate(-80vw, 12vw);
      opacity: 0;
    }
    100% {
      transform: translate(-80vw, 12vw);
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
