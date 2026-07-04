<script lang="ts">
  import { game } from '../engine/store.svelte';
  import { sfx, isMuted, toggleMute } from '../audio/sfx';

  let muted = $state(isMuted());

  function onMute() {
    muted = toggleMute();
    sfx.click();
  }
</script>

<div class="title-screen">
  <img class="bg" src="./assets/images/opening.png" alt="" />
  <div class="beam" aria-hidden="true"></div>
  <div class="vignette" aria-hidden="true"></div>

  <main class="content">
    <p class="eyebrow rise" style="animation-delay: 0.15s">Simulasi Pelabuhan Nusantara</p>
    <h1 class="logo rise" style="animation-delay: 0.3s">
      <span class="logo-top">Pelabuhan Hijau</span>
      <span class="logo-main">Muara Harapan</span>
    </h1>
    <p class="tagline rise" style="animation-delay: 0.5s">
      Tiga puluh hari memimpin di persimpangan tiga arus:
      bisnis yang menuntut, laut yang berbisik, dan rakyat yang berharap.
    </p>

    <div class="actions rise" style="animation-delay: 0.68s">
      <button class="btn btn-lampu" onclick={() => game.toSelect()}>⚓ Mulai Memimpin</button>
      {#if game.hasSave}
        <button
          class="btn"
          onclick={() => {
            if (!game.continueGame()) game.toSelect();
          }}>Lanjutkan Jabatan</button
        >
      {/if}
    </div>

    <p class="hint rise" style="animation-delay: 0.85s">
      Jaga enam indikator tetap hidup — satu saja menyentuh titik kritis, pelabuhan ditutup.
    </p>
  </main>

  <button class="mute" onclick={onMute} aria-label={muted ? 'Nyalakan suara' : 'Matikan suara'}>
    {muted ? '🔇' : '🔊'}
  </button>
  <p class="credit">Aset 3D: Kenney.nl (CC0)</p>
</div>

<style>
  .title-screen {
    position: fixed;
    inset: 0;
    overflow: hidden;
    display: grid;
    place-items: center;
  }

  .bg {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    object-fit: cover;
    object-position: center bottom;
  }

  /* Sapuan sinar mercusuar — pelan, hidup */
  .beam {
    position: absolute;
    inset: -30%;
    background: conic-gradient(
      from 0deg at 82% 58%,
      transparent 0deg,
      rgba(255, 226, 150, 0.14) 8deg,
      transparent 20deg
    );
    animation: sweep 14s linear infinite;
    mix-blend-mode: screen;
  }

  @keyframes sweep {
    to {
      transform: rotate(360deg);
    }
  }

  .vignette {
    position: absolute;
    inset: 0;
    background:
      radial-gradient(ellipse at center 42%, transparent 30%, rgba(4, 12, 26, 0.72) 100%),
      linear-gradient(180deg, rgba(4, 12, 26, 0.35), transparent 30%, transparent 62%, rgba(4, 12, 26, 0.8));
  }

  .content {
    position: relative;
    text-align: center;
    padding: 24px;
    max-width: 720px;
    transform: translateY(-4vh);
  }

  .rise {
    animation: float-up 0.9s cubic-bezier(0.2, 0.7, 0.2, 1) both;
  }

  .logo {
    display: flex;
    flex-direction: column;
    margin: 14px 0 18px;
    text-shadow: 0 4px 30px rgba(2, 8, 20, 0.9);
  }

  .logo-top {
    font-size: clamp(22px, 3.4vw, 34px);
    font-weight: 600;
    letter-spacing: 0.34em;
    text-transform: uppercase;
    color: var(--lampu-terang);
    margin-left: 0.34em; /* imbangi letter-spacing agar tetap sumbu tengah */
  }

  .logo-main {
    font-size: clamp(44px, 8vw, 84px);
    font-weight: 800;
    letter-spacing: -0.01em;
    background: linear-gradient(180deg, #ffffff, #b7d3f5);
    -webkit-background-clip: text;
    background-clip: text;
    color: transparent;
  }

  .tagline {
    color: var(--busa-redup);
    font-size: clamp(15px, 1.8vw, 17.5px);
    max-width: 52ch;
    margin: 0 auto 30px;
    text-wrap: balance;
  }

  .actions {
    display: flex;
    gap: 14px;
    justify-content: center;
    flex-wrap: wrap;
  }

  .actions .btn {
    font-size: 16.5px;
    padding: 14px 30px;
  }

  .hint {
    margin-top: 26px;
    font-size: 13px;
    color: var(--busa-redup);
    opacity: 0.85;
  }

  .mute {
    position: absolute;
    top: 18px;
    right: 18px;
    font-size: 20px;
    width: 44px;
    height: 44px;
    border-radius: 50%;
    background: rgba(8, 23, 41, 0.55);
    border: 1px solid var(--garis-buih);
    backdrop-filter: blur(6px);
  }

  .credit {
    position: absolute;
    bottom: 12px;
    right: 16px;
    font-size: 11px;
    color: rgba(234, 244, 255, 0.4);
  }
</style>
