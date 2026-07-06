<script lang="ts">
  /** Lapisan cuaca: hujan badai (canvas ringan) & kilau cerah musim baik. */
  import { motion } from '../engine/motion.svelte';

  let { storm = false, sunny = false }: { storm?: boolean; sunny?: boolean } = $props();

  let canvas = $state<HTMLCanvasElement | null>(null);

  $effect(() => {
    if (!storm || !canvas) return;
    const cv = canvas;
    const ctx = cv.getContext('2d');
    if (!ctx) return;

    let raf = 0;
    let running = true;
    const resize = () => {
      cv.width = window.innerWidth;
      cv.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    // Mengikuti toggle animasi latar (reaktif: badai langsung reda/turun saat diubah).
    const N = motion.ambient ? 130 : 0;
    const drops = Array.from({ length: N }, () => ({
      x: Math.random() * cv.width,
      y: Math.random() * cv.height,
      len: 9 + Math.random() * 14,
      speed: 9 + Math.random() * 8,
    }));

    const draw = () => {
      if (!running) return;
      ctx.clearRect(0, 0, cv.width, cv.height);
      ctx.strokeStyle = 'rgba(190, 215, 245, 0.34)';
      ctx.lineWidth = 1.1;
      ctx.beginPath();
      for (const d of drops) {
        ctx.moveTo(d.x, d.y);
        ctx.lineTo(d.x - d.len * 0.28, d.y + d.len);
        d.x -= d.speed * 0.28;
        d.y += d.speed;
        if (d.y > cv.height) {
          d.y = -20;
          d.x = Math.random() * (cv.width + 80);
        }
      }
      ctx.stroke();
      raf = requestAnimationFrame(draw);
    };
    draw();

    return () => {
      running = false;
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', resize);
    };
  });
</script>

{#if storm}
  <div class="storm-tint" aria-hidden="true"></div>
  <canvas bind:this={canvas} class="rain" aria-hidden="true"></canvas>
{:else if sunny}
  <div class="sun-glow" aria-hidden="true"></div>
{/if}

<style>
  .storm-tint {
    position: absolute;
    inset: 0;
    z-index: 20;
    pointer-events: none;
    background: linear-gradient(180deg, rgba(30, 44, 70, 0.42), rgba(16, 26, 46, 0.3));
    animation: lightning 7s ease-in-out infinite;
  }

  @keyframes lightning {
    0%,
    92%,
    96%,
    100% {
      box-shadow: none;
    }
    93%,
    95% {
      box-shadow: inset 0 0 220px 40px rgba(220, 235, 255, 0.35);
    }
  }

  .rain {
    position: absolute;
    inset: 0;
    z-index: 21;
    pointer-events: none;
  }

  .sun-glow {
    position: absolute;
    inset: 0;
    z-index: 20;
    pointer-events: none;
    background: radial-gradient(ellipse 70% 50% at 50% 0%, rgba(255, 214, 130, 0.16), transparent);
  }
</style>
