<script lang="ts">
  import { CHARACTERS } from '../data/characters';
  import { STATS } from '../data/stats';
  import { STAT_KEYS, type CharacterDef } from '../types';
  import { game } from '../engine/store.svelte';
  import { sfx } from '../audio/sfx';

  let picked = $state<CharacterDef | null>(null);

  /* Potret dipotong via CSS dari lukisan pilih-karakter.png (sumber persegi). */
  function portraitStyle(c: CharacterDef): string {
    const { x, y, w, h } = c.portrait;
    return [
      `background-image: url('./assets/images/pilih-karakter.png')`,
      `background-size: ${(100 / w) * 100}% auto`,
      `background-position: ${(x / (100 - w)) * 100}% ${(y / (100 - h)) * 100}%`,
      `aspect-ratio: ${w} / ${h}`,
    ].join(';');
  }

  function pick(c: CharacterDef) {
    picked = c;
    sfx.open();
  }
</script>

<div class="select-screen">
  <img class="bg" src="./assets/images/opening.png" alt="" />
  <div class="scrim" aria-hidden="true"></div>

  <div class="wrap">
    <header>
      <p class="eyebrow">Sebelum hari pertama</p>
      <h1>Pilih Jati Diri Kepemimpinanmu</h1>
      <p class="sub">
        Bukan sekadar bonus angka — ini gaya bertahan hidupmu selama 30 hari ke depan.
      </p>
    </header>

    <div class="cards">
      {#each CHARACTERS as c, i (c.id)}
        <button
          class="card panel"
          class:active={picked?.id === c.id}
          style="animation-delay: {0.12 + i * 0.14}s"
          onclick={() => pick(c)}
        >
          <div class="portrait" style={portraitStyle(c)}></div>
          <div class="body">
            <h2>{c.name}</h2>
            <p class="role">{c.title}</p>
            <p class="desc">{c.desc}</p>

            <div class="statbars">
              {#each STAT_KEYS as key (key)}
                <div class="statbar" title="{STATS[key].label}: {c.startStats[key]}">
                  <span class="s-icon">{STATS[key].icon}</span>
                  <div class="s-track">
                    <div
                      class="s-fill"
                      style="width: {c.startStats[key]}%; background: var(--c-{key})"
                    ></div>
                  </div>
                </div>
              {/each}
            </div>

            <div class="meta">
              <p class="trait"><strong>Watak</strong> — {c.trait.label}</p>
              <p class="ability">
                <strong>{c.ability.icon} {c.ability.name}</strong> (kartu As, jeda {c.ability
                  .cooldown} hari) — {c.ability.desc}
              </p>
            </div>
            <p class="style-line">{c.playstyle}</p>
          </div>
        </button>
      {/each}
    </div>

    <footer>
      <button class="btn" onclick={() => game.quitToTitle()}>← Kembali</button>
      <button
        class="btn btn-lampu big"
        disabled={!picked}
        onclick={() => picked && game.start(picked.id)}
      >
        {picked ? `Pimpin sebagai ${picked.name} →` : 'Pilih pemimpin dulu'}
      </button>
    </footer>
  </div>
</div>

<style>
  .select-screen {
    position: fixed;
    inset: 0;
    overflow: hidden;
  }

  .bg {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    object-fit: cover;
    filter: blur(3px) brightness(0.6);
    transform: scale(1.04);
  }

  .scrim {
    position: absolute;
    inset: 0;
    background: linear-gradient(180deg, rgba(4, 12, 26, 0.82), rgba(4, 12, 26, 0.55) 30%, rgba(4, 12, 26, 0.88));
  }

  .wrap {
    position: relative;
    height: 100%;
    display: flex;
    flex-direction: column;
    padding: clamp(14px, 3vh, 30px) clamp(14px, 3vw, 40px);
    gap: clamp(10px, 2vh, 22px);
    max-width: 1280px;
    margin: 0 auto;
  }

  header {
    text-align: center;
  }

  header h1 {
    font-size: clamp(24px, 3.6vw, 38px);
    font-weight: 800;
    margin: 6px 0 4px;
  }

  .sub {
    color: var(--busa-redup);
    font-size: 14.5px;
  }

  .cards {
    flex: 1;
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: clamp(10px, 1.6vw, 20px);
    min-height: 0;
  }

  .card {
    display: flex;
    flex-direction: column;
    text-align: left;
    overflow: hidden auto;
    padding: 0;
    transition:
      transform 0.2s ease,
      border-color 0.2s ease,
      box-shadow 0.25s ease;
    animation: float-up 0.7s cubic-bezier(0.2, 0.7, 0.2, 1) both;
  }

  .card:hover {
    transform: translateY(-4px);
    border-color: var(--busa-redup);
  }

  .card.active {
    border-color: var(--lampu);
    box-shadow:
      0 0 0 1px var(--lampu),
      0 14px 50px rgba(245, 184, 65, 0.22);
  }

  .portrait {
    width: 100%;
    background-repeat: no-repeat;
    border-bottom: 1px solid var(--garis-buih);
    flex-shrink: 0;
  }

  .body {
    padding: 14px 16px 16px;
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  h2 {
    font-size: 21px;
    font-weight: 800;
  }

  .role {
    color: var(--lampu);
    font-weight: 700;
    font-size: 12.5px;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    margin-top: -6px;
  }

  .desc {
    font-size: 13.5px;
    color: var(--busa-redup);
  }

  .statbars {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 4px 12px;
    margin: 4px 0;
  }

  .statbar {
    display: flex;
    align-items: center;
    gap: 6px;
  }

  .s-icon {
    font-size: 12px;
    width: 16px;
  }

  .s-track {
    flex: 1;
    height: 5px;
    border-radius: 99px;
    background: rgba(8, 23, 41, 0.7);
    overflow: hidden;
  }

  .s-fill {
    height: 100%;
    border-radius: 99px;
  }

  .meta {
    display: flex;
    flex-direction: column;
    gap: 6px;
    font-size: 12.5px;
    color: var(--busa-redup);
    border-top: 1px dashed var(--garis-buih);
    padding-top: 8px;
  }

  .meta strong {
    color: var(--busa);
  }

  .style-line {
    font-size: 12.5px;
    color: var(--lampu-terang);
    font-style: italic;
  }

  footer {
    display: flex;
    justify-content: center;
    gap: 14px;
  }

  .big {
    font-size: 16px;
    padding: 13px 30px;
  }

  @media (max-width: 900px) {
    .select-screen {
      overflow-y: auto;
    }
    .wrap {
      height: auto;
      min-height: 100%;
    }
    .cards {
      grid-template-columns: 1fr;
    }
    .portrait {
      max-height: 200px;
      background-position-y: 20%;
    }
  }
</style>
