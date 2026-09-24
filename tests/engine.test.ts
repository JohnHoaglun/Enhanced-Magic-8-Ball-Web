import { describe, expect, it } from "vitest";
import { loadCatalog, type Catalog } from "../src/domain/catalog";
import {
  createBallEngine,
  PERSISTENCE_KEY,
  type RNG,
  type StorageAdapter
} from "../src/domain/engine";

function sequenceRng(values: number[]): RNG {
  let i = 0;
  return { nextFloat: () => values[i++ % values.length] };
}

class MemoryStorage implements StorageAdapter {
  private value: string | null;

  constructor(value: string | null = null) {
    this.value = value;
  }

  load(): string | null {
    return this.value;
  }

  save(next: string): void {
    this.value = next;
  }
}

const tiny: Catalog = {
  id: "tiny",
  name: "tiny",
  answers: { yes: ["y1", "y2"], maybe: ["m1"], no: ["n1"] }
};

const single: Catalog = {
  id: "single",
  name: "single",
  answers: { yes: ["Y"], maybe: ["M"], no: ["N"] }
};

const deck: Catalog = {
  id: "deck",
  name: "deck",
  answers: { yes: ["a", "b", "c", "d"], maybe: ["m1"], no: ["n1"] }
};

describe("catalog", () => {
  it("matches the spec exactly: 42 yes, 28 maybe, 31 no, 101 total", () => {
    const catalog = loadCatalog();
    expect(catalog.id).toBe("all-sayings");
    expect(catalog.name).toBe("Magic 8 Ball — All Sayings");
    expect(catalog.answers.yes).toHaveLength(42);
    expect(catalog.answers.maybe).toHaveLength(28);
    expect(catalog.answers.no).toHaveLength(31);
    const total =
      catalog.answers.yes.length +
      catalog.answers.maybe.length +
      catalog.answers.no.length;
    expect(total).toBe(101);
  });

  it("has no duplicate saying within a category", () => {
    const { yes, maybe, no } = loadCatalog().answers;
    for (const list of [yes, maybe, no]) {
      expect(new Set(list).size).toBe(list.length);
    }
  });

  it("contains exact spec strings with quotes, apostrophes and dashes intact", () => {
    const { yes, maybe, no } = loadCatalog().answers;
    expect(yes).toContain("It is certain");
    expect(yes).toContain("“May the Force be with you.”");
    expect(yes).toContain("Turn it up—this one goes to eleven.");
    expect(maybe).toContain("Do I look like Google?");
    expect(no).toContain("Don’t count on it");
    expect(no).toContain("Don't hold your breath.");
  });
});

describe("category weighting boundaries", () => {
  it("maps the category pick to yes < 0.5, maybe < 0.75, no otherwise", () => {
    const engine = createBallEngine({
      catalog: single,
      rng: sequenceRng([0.49, 0.0, 0.5, 0.0, 0.74, 0.0, 0.75, 0.0, 0.99, 0.0])
    });
    expect(engine.draw()).toBe("Y");
    expect(engine.draw()).toBe("M");
    expect(engine.draw()).toBe("M");
    expect(engine.draw()).toBe("N");
    expect(engine.draw()).toBe("N");
  });
});

describe("no-repeat decks and exhaustion", () => {
  it("draws each saying once, then reshuffles only the exhausted category", () => {
    const engine = createBallEngine({
      catalog: tiny,
      rng: sequenceRng([0.9, 0.49, 0.0, 0.49, 0.5, 0.49, 0.9, 0.0])
    });
    expect(engine.draw()).toBe("y1");
    expect(engine.draw()).toBe("y2");
    expect(engine.snapshot().decks).toEqual({ yes: [], maybe: ["m1"], no: ["n1"] });
    expect(engine.draw()).toBe("y1");
    expect(engine.snapshot().decks).toEqual({ yes: ["y2"], maybe: ["m1"], no: ["n1"] });
  });
});

describe("uniform draw within the deck", () => {
  it("draws the deck position implied by floor(indexFloat * remaining)", () => {
    const engine = createBallEngine({
      catalog: deck,
      rng: sequenceRng([0.9, 0.9, 0.9, 0.49, 0.75, 0.49, 0.25, 0.49, 0.99])
    });
    expect(engine.draw()).toBe("d");
    expect(engine.draw()).toBe("a");
    expect(engine.draw()).toBe("c");
  });
});

describe("persistence", () => {
  it("hydrates a second engine from the same storage", () => {
    const storage = new MemoryStorage();
    const first = createBallEngine({
      catalog: tiny,
      rng: sequenceRng([0.9, 0.49, 0.0]),
      storage
    });
    expect(first.draw()).toBe("y1");
    const after = first.snapshot();
    expect(PERSISTENCE_KEY).toBe("enhanced-magic-8-ball/v1");
    const stored = JSON.parse(storage.load() as string) as {
      v: number;
      decks: Record<string, string[]>;
    };
    expect(stored.v).toBe(1);
    expect(stored.decks.yes).toEqual(["y2"]);
    const second = createBallEngine({
      catalog: tiny,
      rng: sequenceRng([0.49, 0.0]),
      storage
    });
    expect(second.snapshot()).toEqual(after);
    expect(second.draw()).toBe("y2");
  });

  it("falls back to fresh decks when storage is corrupt or missing", () => {
    for (const seed of ["not json {{{", '{"v":2,"decks":{}}']) {
      const engine = createBallEngine({
        catalog: tiny,
        rng: sequenceRng([0.9, 0.49, 0.0]),
        storage: new MemoryStorage(seed)
      });
      expect(engine.snapshot().decks).toEqual({
        yes: ["y1", "y2"],
        maybe: ["m1"],
        no: ["n1"]
      });
      expect(engine.draw()).toBe("y1");
    }
  });

  it("never throws when saving fails or storage is absent", () => {
    const broken: StorageAdapter = {
      load: () => {
        throw new Error("storage unavailable");
      },
      save: () => {
        throw new Error("quota exceeded");
      }
    };
    const throwing = createBallEngine({
      catalog: tiny,
      rng: sequenceRng([0.9, 0.49, 0.0]),
      storage: broken
    });
    expect(throwing.draw()).toBe("y1");
    const bare = createBallEngine({ catalog: tiny, rng: sequenceRng([0.9, 0.49, 0.0]) });
    expect(bare.draw()).toBe("y1");
    expect(bare.snapshot().decks.yes).toEqual(["y2"]);
  });
});
