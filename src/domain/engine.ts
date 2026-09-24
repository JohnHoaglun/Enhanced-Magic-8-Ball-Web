import type { Catalog, OutcomeCategory } from "./catalog";

export interface RNG {
  nextFloat(): number;
}

export interface StorageAdapter {
  load(): string | null;
  save(value: string): void;
}

export interface EngineSnapshot {
  decks: Record<OutcomeCategory, string[]>;
}

export interface BallEngine {
  draw(): string;
  snapshot(): EngineSnapshot;
}

const STORAGE_KEY = "enhanced-magic-8-ball/v1";

interface PersistedState {
  v: number;
  decks: Record<OutcomeCategory, string[]>;
}

function shuffle<T>(items: T[], rng: RNG): T[] {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(rng.nextFloat() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function pickCategory(rng: RNG): OutcomeCategory {
  const r = rng.nextFloat();
  if (r < 0.5) return "yes";
  if (r < 0.75) return "maybe";
  return "no";
}

function isPersistedState(value: unknown, catalog: Catalog): value is PersistedState {
  if (typeof value !== "object" || value === null) return false;
  const candidate = value as Partial<PersistedState>;
  if (candidate.v !== 1 || typeof candidate.decks !== "object" || candidate.decks === null) {
    return false;
  }
  const decks = candidate.decks;
  return (Object.keys(catalog.answers) as OutcomeCategory[]).every((category) => {
    const deck = decks[category];
    if (!Array.isArray(deck) || deck.some((s) => typeof s !== "string")) return false;
    const allowed = new Set(catalog.answers[category]);
    if (new Set(deck).size !== deck.length) return false;
    return deck.every((s) => allowed.has(s));
  });
}

export function createBallEngine(opts: {
  catalog: Catalog;
  rng: RNG;
  storage?: StorageAdapter;
}): BallEngine {
  const { catalog, rng, storage } = opts;

  let decks: Record<OutcomeCategory, string[]> | null = null;

  if (storage) {
    try {
      const raw = storage.load();
      if (raw !== null) {
        const parsed: unknown = JSON.parse(raw);
        if (isPersistedState(parsed, catalog)) {
          decks = parsed.decks;
        }
      }
    } catch {
      decks = null;
    }
  }
  if (decks === null) {
    decks = {
      yes: shuffle(catalog.answers.yes, rng),
      maybe: shuffle(catalog.answers.maybe, rng),
      no: shuffle(catalog.answers.no, rng)
    };
  }

  function persist(): void {
    if (!storage) return;
    const state: PersistedState = {
      v: 1,
      decks: { yes: [...decks!.yes], maybe: [...decks!.maybe], no: [...decks!.no] }
    };
    try {
      storage.save(JSON.stringify(state));
    } catch {
      // Storage unavailable (e.g. private mode) — the ball must still work.
    }
  }
  persist();

  function draw(): string {
    const category = pickCategory(rng);
    if (decks![category].length === 0) {
      decks![category] = shuffle(catalog.answers[category], rng);
    }
    const index = Math.floor(rng.nextFloat() * decks![category].length);
    const answer = decks![category].splice(index, 1)[0];
    persist();
    return answer;
  }

  function snapshot(): EngineSnapshot {
    return {
      decks: { yes: [...decks!.yes], maybe: [...decks!.maybe], no: [...decks!.no] }
    };
  }

  return { draw, snapshot };
}

export const PERSISTENCE_KEY = STORAGE_KEY;
