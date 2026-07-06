import type { TrafficVehicle } from '../types';

/**
 * Membangun keyframes Web Animations API dari titik-titik jalur sebuah
 * TrafficVehicle. Semua posisi memakai `left`/`top` persen — sama seperti
 * `pos` fasilitas — supaya jalur tidak melenceng di layar sempit/lebar
 * (beda dari versi lama yang mencampur `%` awal dengan jarak `vw`/`vh`).
 *
 * Dua transform dipakai bersama untuk mengarahkan sprite:
 * - `flipAfter` (cermin horizontal, scaleX(-1)) — dibuat sebagai sentakan
 *   cepat (TURN_MS) tepat di titik belokan, bukan melar sepanjang segmen
 *   (yang bikin sprite terlihat "menggepeng" pelan-pelan saat berjalan).
 * - `rotateDeg` (derajat, per titik) — berangsur mulus dari sudut titik
 *   sebelumnya ke sudut titik ini sepanjang satu segmen, cocok untuk jalan
 *   yang melengkung. Karena sprite adalah render isometrik dari satu sudut
 *   kamera tetap, sudut besar bisa terlihat aneh (seperti rebah) — sudut
 *   kecil/menengah biasanya masih wajar. Coba lewat "▶ Pratinjau Jalur" di
 *   editor untuk menilai sendiri, tak ada aturan pasti mana yang masih pas.
 */
const TURN_MS = 350;

export function buildTrafficFrames(v: TrafficVehicle): Keyframe[] {
  const { points, driveMs } = v;
  const n = points.length;
  const totalPause = points.slice(0, n - 1).reduce((s, p) => s + (p.pauseMs ?? 0), 0);
  const segMs = Math.max(driveMs - totalPause, 1) / Math.max(n - 1, 1);
  const turnMs = Math.min(TURN_MS, segMs / 3);

  type Stop = { t: number; x: number; y: number; rot: number; arriveFlip: boolean; departFlip: boolean };
  const stops: Stop[] = [
    { t: 0, x: points[0].x, y: points[0].y, rot: points[0].rotateDeg ?? 0, arriveFlip: false, departFlip: false },
  ];
  let flip = false;
  let t = 0;
  for (let i = 1; i < n; i++) {
    const arriveFlip = flip;
    if (points[i - 1].flipAfter) flip = true;
    t += segMs;
    const rot = points[i].rotateDeg ?? 0;
    stops.push({ t, x: points[i].x, y: points[i].y, rot, arriveFlip, departFlip: flip });
    if (i < n - 1 && points[i].pauseMs) {
      t += points[i].pauseMs!;
      stops.push({ t, x: points[i].x, y: points[i].y, rot, arriveFlip: flip, departFlip: flip });
    }
  }

  const fadeMs = Math.min(600, driveMs * 0.04);
  const first = stops[0];
  const last = stops[stops.length - 1];

  const frames: Keyframe[] = [];
  const push = (ms: number, s: { x: number; y: number; rot: number }, flipNow: boolean, opacity: number) => {
    frames.push({
      offset: Math.min(Math.max(ms / v.cycleMs, 0), 1),
      left: `${s.x}%`,
      top: `${s.y}%`,
      opacity,
      transform: `${flipNow ? 'scaleX(-1) ' : ''}rotate(${s.rot}deg)`,
    });
  };

  push(0, first, first.departFlip, 0);
  push(fadeMs, first, first.departFlip, 1);
  for (const s of stops.slice(1, -1)) {
    if (s.arriveFlip !== s.departFlip) {
      // Sentakan cermin singkat tepat di titik belokan, bukan sepanjang segmen.
      push(s.t - turnMs, s, s.arriveFlip, 1);
      push(s.t, s, s.departFlip, 1);
    } else {
      push(s.t, s, s.departFlip, 1);
    }
  }
  push(Math.max(last.t - fadeMs, fadeMs), last, last.departFlip, 1);
  push(last.t, last, last.departFlip, 0);
  if (v.cycleMs > last.t) push(v.cycleMs, last, last.departFlip, 0);

  return frames;
}
