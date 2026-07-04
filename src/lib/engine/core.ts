/**
 * Inti logika permainan — murni TypeScript, tanpa dependensi UI,
 * sehingga bisa disimulasikan headless (scripts/simulate.ts) dan diuji.
 */
import {
  SLOTS_PER_DAY,
  TOTAL_DAYS,
  STAT_KEYS,
  type Choice,
  type EventCard,
  type Effects,
  type GameState,
  type MorningItem,
  type PassiveId,
  type StatKey,
} from '../types';
import { CHARACTERS, getCharacter } from '../data/characters';
import { FACILITIES, getAction } from '../data/facilities';
import { EVENTS, getEvent } from '../data/events';
import { SCENARIOS, SCENARIO_SCHEDULE } from '../data/scenarios';
import { evaluateEnding } from '../data/endings';
import { mulberry32, pickRandom } from './rng';

const PASSIVE_EFFECTS: Record<PassiveId, { label: string; icon: string; effects: Effects }> = {
  ipal: { label: 'IPAL bekerja', icon: '💧', effects: { lingkungan: 1 } },
  'panel-surya': { label: 'Panel surya menghemat listrik', icon: '☀️', effects: { dana: 1 } },
  koperasi: { label: 'Koperasi pekerja berjalan', icon: '🤲', effects: { sdm: 1 } },
};

export function newGame(characterId: GameState['characterId'], seed = Date.now() % 2 ** 31): GameState {
  const ch = getCharacter(characterId);
  const state: GameState = {
    day: 1,
    phase: 'morning',
    characterId,
    stats: { ...ch.startStats },
    slots: SLOTS_PER_DAY,
    cooldowns: {},
    usedOnce: [],
    passives: [],
    abilityCooldown: 0,
    activeScenarios: [],
    firedScenarios: [],
    usedEvents: [],
    currentEventId: null,
    flags: {},
    history: [{ day: 0, stats: { ...ch.startStats } }],
    morningReport: [],
    over: null,
    seed,
    actionsToday: 0,
    totalActions: 0,
  };
  beginMorning(state);
  return state;
}

function clamp(v: number): number {
  return Math.max(0, Math.min(100, v));
}

/** Di atas ambang ini, kenaikan dihitung separuh — kesempurnaan itu mahal. */
export const SOFTCAP = 80;

/** Terapkan efek ke stats (di-clamp + softcap), kembalikan delta yang benar-benar terjadi. */
export function applyEffects(state: GameState, effects: Effects): Effects {
  const applied: Effects = {};
  for (const key of STAT_KEYS) {
    let d = effects[key];
    if (!d) continue;
    const before = state.stats[key];
    if (d > 0 && before + d > SOFTCAP) {
      const below = Math.max(0, SOFTCAP - before);
      d = below + Math.ceil((d - below) / 2);
    }
    const after = clamp(before + d);
    if (after !== before) applied[key] = after - before;
    state.stats[key] = after;
  }
  checkCritical(state);
  return applied;
}

export function checkCritical(state: GameState): void {
  if (state.over) return;
  for (const key of STAT_KEYS) {
    if (state.stats[key] <= 0) {
      state.over = { kind: 'fail', stat: key };
      // Hari kegagalan ikut tercatat di grafik jejak.
      state.history.push({ day: state.day, stats: { ...state.stats } });
      return;
    }
  }
}

/** Fase dramatik untuk undian kartu kejadian. */
export function dayPhaseOf(day: number): 1 | 2 | 3 {
  return day <= 10 ? 1 : day <= 20 ? 2 : 3;
}

/**
 * Pagi hari: efek pasif karakter, skenario baru & efek harian skenario,
 * pasif bangunan, penurunan cooldown, reset jam kerja, lalu pilih kejadian hari ini.
 */
export function beginMorning(state: GameState): void {
  const report: MorningItem[] = [];
  const ch = getCharacter(state.characterId);

  // Entropi harian: pelabuhan yang beroperasi mengikis dirinya dan lautnya.
  // Tekanannya meningkat mengikuti fase dramatik (volume operasi kian padat).
  const ph = dayPhaseOf(state.day);
  const entropy: Effects =
    ph === 1
      ? { infrastruktur: -1, lingkungan: -1 }
      : ph === 2
        ? { infrastruktur: -2, lingkungan: -1 }
        : { infrastruktur: -2, lingkungan: -2 };
  applyEffects(state, entropy);
  report.push({ icon: '⚙️', label: 'Aus & tekanan operasional', effects: entropy });

  // Watak pemimpin
  applyEffects(state, ch.trait.effects);
  report.push({ icon: '👤', label: ch.trait.label.split(':')[0], effects: ch.trait.effects });

  // Skenario terjadwal dimulai pagi ini
  const scheduledId = SCENARIO_SCHEDULE[state.day];
  if (scheduledId && !state.firedScenarios.includes(scheduledId)) {
    const sc = SCENARIOS[scheduledId];
    state.activeScenarios.push({ id: sc.id, daysLeft: sc.duration });
    state.firedScenarios.push(sc.id);
  }

  // Efek harian semua skenario aktif
  for (const act of [...state.activeScenarios]) {
    const sc = SCENARIOS[act.id];
    applyEffects(state, sc.dailyEffects);
    report.push({ icon: sc.icon, label: sc.name, effects: sc.dailyEffects });
    act.daysLeft -= 1;
  }
  state.activeScenarios = state.activeScenarios.filter((a) => a.daysLeft > 0);

  // Pasif bangunan
  for (const p of state.passives) {
    const pe = PASSIVE_EFFECTS[p];
    applyEffects(state, pe.effects);
    report.push({ icon: pe.icon, label: pe.label, effects: pe.effects });
  }

  // Cooldown turun
  for (const id of Object.keys(state.cooldowns)) {
    state.cooldowns[id] -= 1;
    if (state.cooldowns[id] <= 0) delete state.cooldowns[id];
  }
  if (state.abilityCooldown > 0) state.abilityCooldown -= 1;

  state.slots = SLOTS_PER_DAY;
  state.actionsToday = 0;
  state.morningReport = report;
  state.phase = 'morning';
  state.currentEventId = pickEvent(state)?.id ?? null;
}

/** Pilih kartu kejadian hari ini: terjadwal > buntut keputusan > undian fase. */
function pickEvent(state: GameState): EventCard | null {
  const scripted = EVENTS.find((e) => e.day === state.day);
  if (scripted) return scripted;

  const phase = dayPhaseOf(state.day);
  const eligible = EVENTS.filter(
    (e) =>
      !e.day &&
      e.phase === phase &&
      !state.usedEvents.includes(e.id) &&
      (!e.requiresFlag || state.flags[e.requiresFlag]),
  );
  if (eligible.length === 0) return null;

  const rand = mulberry32(state.seed + state.day * 7919);
  // Kejadian buntut (requiresFlag terpenuhi) selalu diprioritaskan — itulah konsekuensi.
  const followUps = eligible.filter((e) => e.requiresFlag);
  return followUps.length > 0 ? pickRandom(followUps, rand) : pickRandom(eligible, rand);
}

export function currentEvent(state: GameState): EventCard | null {
  return state.currentEventId ? (getEvent(state.currentEventId) ?? null) : null;
}

/** Dana minimal 1 harus tersisa — membelanjakan rupiah terakhir = bangkrut. */
export function canAfford(state: GameState, cost?: number): boolean {
  return !cost || state.stats.dana - cost >= 1;
}

/** Aksi/kemampuan yang diprakarsai sendiri diblokir bila akan menjatuhkan stat ke titik kritis. */
export function wouldBeFatal(state: GameState, effects: Effects, cost = 0): StatKey | null {
  for (const key of STAT_KEYS) {
    const d = (effects[key] ?? 0) - (key === 'dana' ? cost : 0);
    if (d < 0 && state.stats[key] + d <= 0) return key;
  }
  return null;
}

export function resolveChoice(state: GameState, choice: Choice): Effects {
  const total: Effects = { ...choice.effects };
  if (choice.cost) total.dana = (total.dana ?? 0) - choice.cost;
  const applied = applyEffects(state, total);
  if (choice.setFlag) state.flags[choice.setFlag] = true;
  if (choice.startScenario && !state.firedScenarios.includes(choice.startScenario)) {
    const sc = SCENARIOS[choice.startScenario];
    state.activeScenarios.push({ id: sc.id, daysLeft: sc.duration });
    state.firedScenarios.push(sc.id);
  }
  if (state.currentEventId) state.usedEvents.push(state.currentEventId);
  return applied;
}

export type ActionResult =
  | { ok: true; applied: Effects }
  | { ok: false; reason: string };

export function doAction(state: GameState, actionId: string): ActionResult {
  const action = getAction(actionId);
  if (!action) return { ok: false, reason: 'Aksi tidak dikenal.' };
  if (state.slots <= 0) return { ok: false, reason: 'Jam kerja hari ini sudah habis.' };
  if (state.cooldowns[actionId]) return { ok: false, reason: 'Masih dalam masa jeda.' };
  if (action.once && state.usedOnce.includes(actionId))
    return { ok: false, reason: 'Sudah terbangun.' };
  if (!canAfford(state, action.cost)) return { ok: false, reason: 'Dana tidak cukup.' };
  const fatal = wouldBeFatal(state, action.effects, action.cost ?? 0);
  if (fatal) return { ok: false, reason: `Terlalu berisiko: ${fatal} akan jatuh kritis.` };

  const total: Effects = { ...action.effects };
  if (action.cost) total.dana = (total.dana ?? 0) - action.cost;
  const applied = applyEffects(state, total);

  state.slots -= 1;
  state.actionsToday += 1;
  state.totalActions += 1;
  if (action.once) {
    state.usedOnce.push(actionId);
    if (action.grantsPassive) state.passives.push(action.grantsPassive);
  } else if (action.cooldown > 0) {
    state.cooldowns[actionId] = action.cooldown + 1; // +1 karena turun besok pagi
  } else {
    state.cooldowns[actionId] = 1; // sekali per hari
  }
  return { ok: true, applied };
}

export function useAbility(state: GameState): ActionResult {
  const ch = getCharacter(state.characterId);
  if (state.abilityCooldown > 0) return { ok: false, reason: 'Kemampuan masih dalam jeda.' };
  const fatal = wouldBeFatal(state, ch.ability.effects);
  if (fatal) return { ok: false, reason: `Terlalu berisiko: ${fatal} akan jatuh kritis.` };
  const applied = applyEffects(state, ch.ability.effects);
  state.abilityCooldown = ch.ability.cooldown + 1;
  return { ok: true, applied };
}

/** Tutup hari: catat riwayat; hari ke-30 selesai = evaluasi akhir. */
export function endDay(state: GameState): void {
  state.history.push({ day: state.day, stats: { ...state.stats } });
  if (state.day >= TOTAL_DAYS) {
    state.over = { kind: 'ending', endingId: evaluateEnding(state.stats) };
    return;
  }
  state.phase = 'summary';
}

export function nextDay(state: GameState): void {
  state.day += 1;
  beginMorning(state);
}

/** Delta stats hari ini dibanding akhir hari kemarin (untuk layar rangkuman). */
export function dayDeltas(state: GameState): Effects {
  const prev = state.history[state.history.length - 2]?.stats ?? state.history[0].stats;
  const last = state.history[state.history.length - 1].stats;
  const d: Effects = {};
  for (const key of STAT_KEYS) {
    const diff = last[key] - prev[key];
    if (diff !== 0) d[key] = diff;
  }
  return d;
}

export { PASSIVE_EFFECTS };
