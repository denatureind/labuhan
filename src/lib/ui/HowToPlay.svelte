<script lang="ts">
  import { sfx } from '../audio/sfx';

  let { onclose }: { onclose: () => void } = $props();

  function close() {
    sfx.close();
    onclose();
  }

  function onKey(e: KeyboardEvent) {
    if (e.key === 'Escape') close();
  }

  const sections = [
    {
      icon: '⚓',
      title: 'Tujuan',
      text: 'Pimpin Pelabuhan Muara Harapan selama 30 hari. Enam indikator (0–100) mengukur nasibmu: Dana, Reputasi, Lingkungan, SDM, Infrastruktur, Komunitas. Satu saja menyentuh nol — kapan pun — pelabuhan ditutup paksa hari itu juga.',
    },
    {
      icon: '🌅',
      title: 'Setiap pagi',
      text: 'Laporan pagi menerapkan efek otomatis: watak pemimpinmu, skenario musiman yang sedang berjalan, bangunan pasif yang sudah kau dirikan, dan aus operasional harian — yang kian berat menjelang akhir masa jabatan.',
    },
    {
      icon: '🃏',
      title: 'Satu dilema per hari',
      text: 'Sebuah kejadian menuntut keputusan: 2–3 pilihan, semuanya berdampak ke beberapa indikator sekaligus. Tak ada opsi gratis — dan pilihan di kartu inilah yang bisa menjatuhkan indikator sampai nol. Keputusan kotor bisa kembali menagih berhari-hari kemudian.',
    },
    {
      icon: '🏗️',
      title: 'Kelola pelabuhan',
      text: 'Kau punya 3 jam kerja per hari untuk aksi di enam fasilitas peta (klik bangunannya). Tiap aksi punya jeda pakai-ulang; tiga pembangunan sekali-jadi (IPAL, panel surya, koperasi) memberi efek pasif setiap pagi selamanya. Aksi yang kau prakarsai sendiri tidak akan menjatuhkanmu ke nol — sistem menolaknya bila terlalu berisiko.',
    },
    {
      icon: '✨',
      title: 'Kartu As',
      text: 'Setiap pemimpin punya satu kemampuan andalan dengan jeda 5 hari. Simpan untuk momen genting — memakainya sembarangan berarti tak memilikinya saat badai tiba.',
    },
    {
      icon: '📉',
      title: 'Hukum-hukum Muara',
      text: 'Di atas 80, setiap kenaikan hanya dihitung separuh — kesempurnaan itu mahal. Strip barometer di atas layar membocorkan cuaca buruk yang mendekat: bersiap sebelum badai selalu lebih murah daripada memperbaiki sesudahnya.',
    },
    {
      icon: '🏁',
      title: 'Hari ke-30',
      text: 'Bila bertahan, evaluasi pusat membaca seluruh jejakmu dan memberi satu dari lima gelar akhir. Tidak ada satu jalan yang benar — gelarmu adalah cermin siapa yang kau bela. Progres tersimpan otomatis.',
    },
  ];
</script>

<svelte:window onkeydown={onKey} />

<div class="overlay" role="dialog" aria-modal="true" aria-label="Cara bermain">
  <button class="backdrop" onclick={close} aria-label="Tutup panduan"></button>
  <div class="card panel">
    <header>
      <p class="eyebrow">Panduan Nahkoda</p>
      <h2>Cara Bermain</h2>
      <button class="close" onclick={close} aria-label="Tutup panduan">✕</button>
    </header>

    <div class="sections">
      {#each sections as sec, i (i)}
        <section style="animation-delay: {0.06 + i * 0.05}s">
          <span class="s-icon">{sec.icon}</span>
          <div>
            <h3>{sec.title}</h3>
            <p>{sec.text}</p>
          </div>
        </section>
      {/each}
    </div>

    <button class="btn btn-lampu start" onclick={close}>Siap Memimpin</button>
  </div>
</div>

<style>
  .overlay {
    position: fixed;
    inset: 0;
    z-index: 50;
    display: grid;
    place-items: center;
    padding: 22px;
    animation: fade 0.3s ease both;
  }

  @keyframes fade {
    from {
      opacity: 0;
    }
  }

  .backdrop {
    position: absolute;
    inset: 0;
    background: rgba(4, 12, 26, 0.68);
    backdrop-filter: blur(4px);
    cursor: default;
  }

  .card {
    position: relative;
    width: min(620px, 100%);
    max-height: min(86vh, 100%);
    display: flex;
    flex-direction: column;
    padding: 24px 28px 22px;
    animation: float-up 0.45s cubic-bezier(0.2, 0.7, 0.2, 1) both;
  }

  header {
    position: relative;
    text-align: center;
    margin-bottom: 14px;
  }

  h2 {
    font-size: 30px;
    font-weight: 800;
    margin-top: 2px;
  }

  .close {
    position: absolute;
    top: -4px;
    right: -8px;
    width: 34px;
    height: 34px;
    border-radius: 50%;
    border: 1px solid var(--garis-buih);
    background: rgba(8, 23, 41, 0.6);
    font-size: 14px;
  }

  .close:hover {
    border-color: var(--karang);
    color: var(--karang);
  }

  .sections {
    overflow-y: auto;
    display: flex;
    flex-direction: column;
    gap: 13px;
    padding-right: 6px;
  }

  section {
    display: flex;
    gap: 12px;
    text-align: left;
    animation: float-up 0.4s ease both;
  }

  .s-icon {
    font-size: 22px;
    width: 30px;
    flex-shrink: 0;
    text-align: center;
    margin-top: 1px;
  }

  h3 {
    font-size: 14.5px;
    font-weight: 800;
    margin-bottom: 2px;
  }

  section p {
    font-size: 13px;
    color: var(--busa-redup);
  }

  .start {
    margin-top: 16px;
    width: 100%;
  }
</style>
