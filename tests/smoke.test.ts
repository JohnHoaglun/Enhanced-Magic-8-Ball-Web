import { describe, expect, it } from "vitest";
import { loadCatalog } from "../src/domain/catalog";
import { createBallEngine, type RNG } from "../src/domain/engine";

function sequenceRng(values: number[]): RNG {
  let i = 0;
  return { nextFloat: () => values[i++ % values.length] };
}

describe("bootstrap smoke", () => {
  it("draws an answer from the catalog", () => {
    const catalog = loadCatalog();
    const engine = createBallEngine({ catalog, rng: sequenceRng([0.1, 0.3]) });
    const all = [
      ...catalog.answers.yes,
      ...catalog.answers.maybe,
      ...catalog.answers.no
    ];
    expect(all).toContain(engine.draw());
  });

  it("persists deck state through storage", () => {
    const catalog = loadCatalog();
    const saved: string[] = [];
    const storage = {
      load: () => (saved.length > 0 ? saved[saved.length - 1] : null),
      save: (value: string) => saved.push(value)
    };
    const first = createBallEngine({
      catalog,
      rng: sequenceRng([0.1, 0.3, 0.9]),
      storage
    });
    first.draw();
    const second = createBallEngine({
      catalog,
      rng: sequenceRng([0.1, 0.3, 0.9]),
      storage
    });
    expect(second.snapshot()).toEqual(first.snapshot());
  });
});
