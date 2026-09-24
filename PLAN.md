# Plan: Enhanced Magic 8 Ball

## BLOCKER
- None.

## Strategy
Deliver the **web** build target of the product spec as a fully offline static PWA.

Approved decisions (user-approved 2026-09-23):
- Build target: web app, working branch `dev`.
- Stack: **Vite + vanilla TypeScript** (no framework). CSS owns the visual experience; pure TypeScript owns the deterministic engine.
- Offline: **static PWA with service worker** (`vite-plugin-pwa`, Workbox precache). No CDN, no runtime API calls, no third-party fonts, no analytics/telemetry, no question input.
- Source of truth: `Magic 8 Ball -- Product Spec.md` + approved idle-state PNG.
- Testing: Vitest (node for engine, jsdom for UI state), `tsc --noEmit` typecheck, production build, external-request scan over `dist`. No Playwright for v1 — visual acceptance is manual against the approved reference plus jsdom structural assertions.
- Single file-changing delivery for v0.0.1: bootstrap + lanes + composition land as one atomic commit on `dev`, per the repo delivery contract.

### File layout (pinned)
```
index.html                 app shell (build)
package.json               deps/scripts (build)
tsconfig.json              TS config (build)
vite.config.ts             Vite + PWA config (build)
src/main.ts                entry: engine wiring, timing, SW registration (build)
src/ui.ts                  pure state machine + render (lane U)
src/styles/main.css        layout, ball, window, buttons, animation (lane U)
src/domain/engine.ts       BallEngine (lane E; stub at bootstrap)
src/domain/catalog.ts      catalog loader/validation (lane E; stub at bootstrap)
src/data/catalog.json      full catalog (lane E; stub at bootstrap)
public/icon.svg            custom 8-ball icon (lane I)
scripts/verify.sh          canonical verification entry point (build)
scripts/check-no-external-urls.mjs  dist scan for external URLs (build)
tests/engine.test.ts       engine deterministic tests (lane E)
tests/ui.test.ts           UI state machine tests (lane U)
```

### Pinned contracts (frozen at bootstrap; lanes may not change them)
1. **Catalog schema** (`src/data/catalog.json`):
   ```json
   { "id": "all-sayings", "name": "Magic 8 Ball — All Sayings",
     "answers": { "yes": ["…"], "maybe": ["…"], "no": ["…"] } }
   ```
   - Canonical display strings, original capitalization preserved. Movie-line sayings keep their decorative curly quotes in the display string; movie titles are NOT included in JSON (metadata only, never displayed).
   - Expected counts (spec): yes 49, maybe 22, no 33 = 104 sayings total. Engine test asserts exact expected multiset from the spec, so any missing/duplicated/mis-categorized saying fails the build.
2. **Engine API** (`src/domain/engine.ts`):
   ```ts
   export type OutcomeCategory = "yes" | "maybe" | "no";
   export interface RNG { nextFloat(): number } // [0, 1)
   export interface StorageAdapter { load(): string | null; save(value: string): void }
   export interface EngineSnapshot { decks: Record<OutcomeCategory, string[]> }
   export interface BallEngine { draw(): string; snapshot(): EngineSnapshot }
   export function createBallEngine(opts: { catalog: Catalog; rng: RNG; storage?: StorageAdapter }): BallEngine
   ```
   - `Catalog` type: `{ id: string; name: string; answers: Record<OutcomeCategory, string[]> }` exported from `src/domain/catalog.ts`.
   - Invariants: category chosen first at 50/25/25 via rng; uniform draw over the selected category's remaining deck; when a category deck is empty, reshuffle ONLY that category, then draw; state persists atomically through the adapter; NO history, NO reset API, NO question parameter anywhere.
   - Persistence: one storage key `enhanced-magic-8-ball/v1`, JSON `{"v":1,"decks":{...}}`. Malformed/missing/corrupt data → fresh shuffled decks from catalog (never throw to the UI).
3. **UI state machine** (`src/ui.ts`):
   - `type UiState = { mode: "idle" } | { mode: "shaking" } | { mode: "revealed"; answer: string }`
   - `createBallUi(handlers: { onState: (s: UiState) => void })` returning `{ shake(): void; reveal(answer: string): void; askAgain(): void }` — pure transitions: shake only from idle, reveal only from shaking, askAgain only from revealed. Duplicate shakes are no-ops.
   - Timing (owned by `main.ts`): normal motion delay exactly 1000 ms; `window.matchMedia("(prefers-reduced-motion: reduce)")` → 0 ms delay. Exactly one draw per activation; button disabled while shaking.
4. **Accessibility**: native `<button>`s; Shake label toggles `Shake the Ball` ↔ `Shaking`; `Ask Again` button exists only in revealed state; answer announced via a visually-hidden `aria-live="polite"` region (never a visible transcript).
5. **Offline**: `vite-plugin-pwa` precaches all built assets (catalog is bundled into JS — no runtime fetch); SW generated at build; `sw.js` registered in `main.ts`.
6. **Visual**: dark-only, single viewport, no scroll, portrait-only; on wide screens a centered phone-like column (max-width 480 px); glossy CSS 8-ball (no bitmap ball); flat classic-blue downward-triangle answer window via `clip-path`, white text, no glow, window expands to fit wrapped text; 1-second rocking-in-place keyframe (rotate ±6° around bottom pivot), disabled under reduced motion.
7. **Icon** (`public/icon.svg`): glossy black sphere, white circle emblem, black "8", NO answer window; referenced by manifest + `<link rel="icon">` + apple-touch-icon.
8. **Ratio gate**: test lines ≤ 75% of production lines (global cap) measured before the v0.0.1 commit.

## Parallelization Decision
Multi-step task with three genuinely independent implementation parts after bootstrap:
- **Lane E** (catalog + engine): owns `src/data/catalog.json`, `src/domain/*`, `tests/engine.test.ts`.
- **Lane U** (UI): owns `src/ui.ts`, `src/styles/main.css`, `tests/ui.test.ts`.
- **Lane I** (icon): owns `public/icon.svg`.
No shared files between lanes: the engine stub (`src/domain/*`), UI contract, HTML shell, and PWA config are pinned by bootstrap before dispatch, and lane U consumes the engine API without touching engine files. Lane I touches only `public/` (index.html is build-owned). All three are dispatched in parallel to `smarter` instances via the task tool (separate GX10 pool) — never to extra `build` instances. Wave 2 composition (integration, offline check, gates, version bump, atomic commit) is sequential and owned by `build` because it depends on live results from all lanes.

## Lane Map
| Wave | Lane | Scope | Stop Condition | Dependencies |
|---|---|---|---|---|
| 0 | build (solo — single global pass: pinned shared surfaces) | Plan docs commit; Vite+TS+PWA scaffold; engine stub; verify.sh; typecheck+stub tests green | `scripts/verify.sh` exits 0 on the shell app | approved plan |
| 1 | `smarter` E | Full 104-saying catalog JSON (exact spec strings); real `createBallEngine` (50/25/25, per-category no-repeat decks, atomic persistence, corrupt-storage fallback); deterministic tests (fixed-RNG category/draw/exhaustion/persistence, exact catalog multiset) | `tests/engine.test.ts` green under `vitest`; catalog counts 49/22/33 | Wave 0 contracts |
| 1 | `smarter` U | `src/ui.ts` state machine per contract; `src/styles/main.css` per visual contract; `src/main.ts` wiring (engine, 1000 ms / reduced-motion 0 ms, SW register, live region, focus/labels); `tests/ui.test.ts` (transitions, duplicate-shake no-op, reveal/askAgain, reduced-motion immediate) | `tests/ui.test.ts` green; `tsc --noEmit` clean | Wave 0 contracts + stub engine |
| 1 | `smarter` I | `public/icon.svg` per icon contract (glossy black 8-ball, white 8 emblem, no window) | File exists, valid SVG, referenced by existing manifest/html (no html edits) | Wave 0 (manifest links already in place) |
| 2 | build (solo — sequential on live lane results) | Compose; run verify.sh; offline check (SW precache audit + no external URLs in dist); longest-saying wrapping check; ratio gate; docs; version 0.0.1; atomic commit + push `origin/dev` | verify.sh exit 0, dist scan clean, ratio ≤ 75%, commit pushed | Waves 1 E+U+I |

## Shared-Surface Inventory
| Lane Pair | Shared Surface | Contract / Owner | Owner or Pinned Location |
|---|---|---|---|
| U ↔ E | Engine API (`draw()`, types) | Pinned contract #2; stub provided at bootstrap; E implements, U consumes read-only | `PLAN.md` §contracts; `src/domain/engine.ts` |
| U ↔ E | Catalog data shape | Pinned contract #1; U never reads JSON directly — engine only | `PLAN.md` §contracts; `src/data/catalog.json` |
| E ↔ (tests) | RNG + storage seams | Injected interfaces per contract #2; tests own fakes | `PLAN.md` §contracts |
| U ↔ build (main.ts) | UI state contract | Pinned contract #3; build owns `main.ts` timing, U owns `ui.ts` transitions | `PLAN.md` §contracts |
| I ↔ build | Icon paths/manifest | Build owns manifest + html links at bootstrap; I owns only `public/icon.svg` | `PLAN.md` §contracts |
| All ↔ build | verify.sh + version/docs | Build owns `scripts/`, docs, version registry — no lane touches them | `PLAN.md` §contracts |

Unowned shared surfaces: none.
