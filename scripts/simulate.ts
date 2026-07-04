/**
 * Simulasi headless untuk uji keseimbangan: beberapa bot dengan strategi berbeda
 * memainkan 30 hari penuh. Harapan desain:
 *  - bot "seimbang" umumnya selamat sampai hari 30;
 *  - bot "serakah uang" kaya tapi jatuh di sisi sosial/ekologi (atau tamat);
 *  - bot "pasif" terseret arus dan sering tamat di fase krisis.
 * Jalankan: npm run simulate
 */
import type { Choice, GameState, StatKey } from '../src/lib/types';
import { STAT_KEYS } from '../src/lib/types';
import {
  newGame,
  currentEvent,
  resolveChoice,
  doAction,
  useAbility,
  endDay,
  nextDay,
} from '../src/lib/engine/core';
import { FACILITIES } from '../src/lib/data/facilities';
import { getCharacter } from '../src/lib/data/characters';
import { canAfford, wouldBeFatal } from '../src/lib/engine/core';
import { ENDINGS } from '../src/lib/data/endings';
import { STATS } from '../src/lib/data/stats';

type Strategy = 'seimbang' | 'serakah' | 'pasif' | 'hijau';

const ALL_ACTIONS = FACILITIES.flatMap((f) => f.actions);

function availableActions(s: GameState) {
  return ALL_ACTIONS.filter(
    (a) =>
      !s.cooldowns[a.id] &&
      !(a.once && s.usedOnce.includes(a.id)) &&
      canAfford(s, a.cost) &&
      !wouldBeFatal(s, a.effects, a.cost ?? 0),
  );
}

/** Nilai sebuah kumpulan efek untuk strategi tertentu, dengan bobot kebutuhan. */
function scoreEffects(s: GameState, effects: Record<string, number | undefined>, strat: Strategy): number {
  let score = 0;
  for (const key of STAT_KEYS) {
    const d = effects[key] ?? 0;
    if (!d) continue;
    const v = s.stats[key];
    // Makin rendah stat, makin berharga kenaikannya (dan makin sakit penurunannya)
    const need = v <= 15 ? 5 : v <= 25 ? 3.2 : v <= 40 ? 1.8 : v <= 60 ? 1 : v <= 80 ? 0.6 : 0.25;
    let w = need;
    if (strat === 'serakah') w *= key === 'dana' ? 3 : 0.5;
    if (strat === 'hijau') w *= key === 'lingkungan' ? 3 : key === 'komunitas' ? 1.4 : 0.6;
    score += d * w;
  }
  return score;
}

function pickChoice(s: GameState, choices: Choice[], strat: Strategy): Choice {
  const affordable = choices.filter((c) => canAfford(s, c.cost));
  const pool = affordable.length ? affordable : choices;
  if (strat === 'pasif') return pool[pool.length - 1]; // selalu pilih opsi terakhir (biasanya "abaikan")
  let best = pool[0];
  let bestScore = -Infinity;
  for (const c of pool) {
    const eff = { ...c.effects, dana: (c.effects.dana ?? 0) - (c.cost ?? 0) };
    const sc = scoreEffects(s, eff, strat);
    if (sc > bestScore) {
      bestScore = sc;
      best = c;
    }
  }
  return best;
}

function runOne(character: 'bahari' | 'citra' | 'rendra', strat: Strategy, seed: number) {
  const s = newGame(character, seed);
  while (!s.over) {
    // fase kejadian
    const ev = currentEvent(s);
    if (ev) resolveChoice(s, pickChoice(s, ev.choices, strat));
    if (s.over) break;

    // fase kelola: pakai kemampuan bila layak, lalu 3 aksi terbaik
    if (s.abilityCooldown === 0 && strat !== 'pasif') {
      const ab = getCharacter(s.characterId).ability;
      if (!wouldBeFatal(s, ab.effects) && scoreEffects(s, ab.effects, strat) > 4) useAbility(s);
    }
    if (s.over) break;

    let guard = 0;
    while (s.slots > 0 && guard++ < 10) {
      if (strat === 'pasif') break;
      const opts = availableActions(s);
      if (!opts.length) break;
      let best = opts[0];
      let bestScore = -Infinity;
      for (const a of opts) {
        const eff = { ...a.effects, dana: (a.effects.dana ?? 0) - (a.cost ?? 0) };
        const sc = scoreEffects(s, eff, strat);
        if (sc > bestScore) {
          bestScore = sc;
          best = a;
        }
      }
      if (bestScore <= 0) break; // tak ada aksi yang berfaedah
      const res = doAction(s, best.id);
      if (!res.ok) break;
      if (s.over) break;
    }
    if (s.over) break;

    endDay(s);
    if (s.over) break;
    nextDay(s);
  }
  return s;
}

function fmtStats(stats: Record<StatKey, number>): string {
  return STAT_KEYS.map((k) => `${STATS[k].icon}${String(stats[k]).padStart(3)}`).join(' ');
}

const strategies: Strategy[] = ['seimbang', 'serakah', 'hijau', 'pasif'];
const chars = ['bahari', 'citra', 'rendra'] as const;
const RUNS = 12;

console.log('=== SIMULASI KESEIMBANGAN — 30 HARI ===\n');
for (const strat of strategies) {
  console.log(`--- Strategi: ${strat.toUpperCase()} ---`);
  for (const ch of chars) {
    let survived = 0;
    const endings: Record<string, number> = {};
    const fails: Record<string, number> = {};
    let lastState: GameState | null = null;
    let sumDay = 0;
    for (let i = 0; i < RUNS; i++) {
      const s = runOne(ch, strat, 1000 + i * 137);
      lastState = s;
      if (s.over?.kind === 'ending') {
        survived++;
        sumDay += 30;
        endings[s.over.endingId] = (endings[s.over.endingId] ?? 0) + 1;
      } else if (s.over?.kind === 'fail') {
        sumDay += s.day;
        fails[s.over.stat] = (fails[s.over.stat] ?? 0) + 1;
      }
    }
    const endStr = Object.entries(endings)
      .map(([k, v]) => `${ENDINGS[k as keyof typeof ENDINGS].icon}${k}×${v}`)
      .join(' ');
    const failStr = Object.entries(fails)
      .map(([k, v]) => `†${k}×${v}`)
      .join(' ');
    console.log(
      `${ch.padEnd(7)} selamat ${String(survived).padStart(2)}/${RUNS}  rerata-hari ${(sumDay / RUNS).toFixed(1).padStart(4)}  ${endStr} ${failStr}`,
    );
    if (lastState) console.log(`        contoh akhir: ${fmtStats(lastState.stats)}`);
  }
  console.log('');
}
