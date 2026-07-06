/**
 * Preferensi animasi latar (ambient): lalu lintas, kapal, camar, kilau laut,
 * hujan, parallax. Default mengikuti prefers-reduced-motion sistem, tapi bisa
 * di-override pemain lewat tombol di HUD — banyak laptop sekolah menyalakan
 * "kurangi gerakan" tanpa disadari pemiliknya, dan tanpa override itu peta
 * tampak mati total saat demo.
 *
 * Yang TIDAK pernah dimatikan: animasi umpan-balik singkat (delta indikator,
 * kemunculan modal) — justru dulu ikut beku gara-gara aturan pukul-rata di
 * app.css, sampai-sampai angka delta HUD tak pernah terlihat di mesin
 * reduced-motion (animasinya melompat langsung ke opacity 0).
 */
const KEY = 'pelabuhan-hijau-motion-v1';

function initialAmbient(): boolean {
  try {
    const stored = localStorage.getItem(KEY);
    if (stored === 'on') return true;
    if (stored === 'off') return false;
  } catch {
    /* abaikan */
  }
  return !window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

class MotionPref {
  ambient = $state(initialAmbient());

  toggle(): void {
    this.ambient = !this.ambient;
    try {
      localStorage.setItem(KEY, this.ambient ? 'on' : 'off');
    } catch {
      /* abaikan */
    }
  }
}

export const motion = new MotionPref();
