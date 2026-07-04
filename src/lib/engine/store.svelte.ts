/**
 * Lapisan reaktif Svelte 5 di atas engine murni (core.ts):
 * memegang GameState, mengoper aksi, autosave, dan sinyal animasi UI.
 */
import type { Choice, Effects, GameState } from '../types';
import {
  newGame,
  beginMorning,
  resolveChoice,
  doAction,
  useAbility,
  endDay,
  nextDay,
  currentEvent,
  dayDeltas,
} from './core';
import { sfx } from '../audio/sfx';

const SAVE_KEY = 'pelabuhan-hijau-save-v1';

export type Screen = 'title' | 'select' | 'game' | 'over';

/** Ledakan delta melayang di HUD setiap kali efek diterapkan. */
export interface DeltaBurst {
  id: number;
  effects: Effects;
}

function netTone(effects: Effects): 'good' | 'bad' | 'mixed' {
  const vals = Object.values(effects);
  const pos = vals.some((v) => v > 0);
  const neg = vals.some((v) => v < 0);
  if (pos && neg) return 'mixed';
  return neg ? 'bad' : 'good';
}

class Game {
  screen = $state<Screen>('title');
  state = $state<GameState | null>(null);
  bursts = $state<DeltaBurst[]>([]);
  /** Fasilitas yang panelnya sedang terbuka. */
  openFacility = $state<string | null>(null);
  hasSave = $state(false);
  #burstId = 0;

  constructor() {
    this.hasSave = !!localStorage.getItem(SAVE_KEY);
  }

  // ── Alur layar ──────────────────────────────────────────────
  toSelect(): void {
    sfx.open();
    this.screen = 'select';
  }

  start(characterId: GameState['characterId']): void {
    this.state = newGame(characterId);
    this.screen = 'game';
    sfx.bell();
    this.save();
  }

  continueGame(): boolean {
    try {
      const raw = localStorage.getItem(SAVE_KEY);
      if (!raw) return false;
      const parsed = JSON.parse(raw) as GameState;
      if (!parsed?.stats || parsed.over) return false;
      this.state = parsed;
      this.screen = 'game';
      sfx.bell();
      return true;
    } catch {
      return false;
    }
  }

  quitToTitle(): void {
    this.screen = 'title';
    this.openFacility = null;
    this.hasSave = !!localStorage.getItem(SAVE_KEY);
  }

  restart(): void {
    localStorage.removeItem(SAVE_KEY);
    this.state = null;
    this.hasSave = false;
    this.screen = 'select';
  }

  // ── Alur dalam hari ─────────────────────────────────────────
  startEventPhase(): void {
    if (!this.state) return;
    sfx.card();
    this.state.phase = this.state.currentEventId ? 'event' : 'manage';
    this.save();
  }

  choose(choice: Choice): Effects {
    if (!this.state) return {};
    const applied = resolveChoice(this.state, choice);
    this.burst(applied);
    sfx[netTone(applied)]();
    this.afterMutation();
    return applied;
  }

  finishEvent(): void {
    if (!this.state) return;
    this.state.phase = 'manage';
    this.save();
  }

  act(actionId: string): { ok: boolean; reason?: string } {
    if (!this.state) return { ok: false };
    const res = doAction(this.state, actionId);
    if (res.ok) {
      this.burst(res.applied);
      sfx[netTone(res.applied)]();
      this.afterMutation();
    }
    return res;
  }

  ability(): { ok: boolean; reason?: string } {
    if (!this.state) return { ok: false };
    const res = useAbility(this.state);
    if (res.ok) {
      this.burst(res.applied);
      sfx.good();
      this.afterMutation();
    }
    return res;
  }

  closeDay(): void {
    if (!this.state) return;
    this.openFacility = null;
    endDay(this.state);
    sfx.wave();
    this.afterMutation();
  }

  toNextDay(): void {
    if (!this.state) return;
    nextDay(this.state);
    sfx.bell();
    this.afterMutation();
  }

  // ── Turunan ─────────────────────────────────────────────────
  get event() {
    return this.state ? currentEvent(this.state) : null;
  }

  get deltas(): Effects {
    return this.state ? dayDeltas(this.state) : {};
  }

  // ── Internal ────────────────────────────────────────────────
  private burst(effects: Effects): void {
    if (Object.keys(effects).length === 0) return;
    const id = ++this.#burstId;
    this.bursts.push({ id, effects });
    setTimeout(() => {
      this.bursts = this.bursts.filter((b) => b.id !== id);
    }, 1900);
  }

  private afterMutation(): void {
    if (!this.state) return;
    if (this.state.over) {
      this.save();
      setTimeout(() => {
        this.screen = 'over';
        if (this.state?.over?.kind === 'fail') sfx.fail();
        else sfx.fanfare();
      }, 900);
      return;
    }
    this.save();
  }

  private save(): void {
    if (!this.state) return;
    try {
      localStorage.setItem(SAVE_KEY, JSON.stringify(this.state));
      this.hasSave = true;
    } catch {
      /* penyimpanan penuh/di-block — abaikan */
    }
  }
}

export const game = new Game();
