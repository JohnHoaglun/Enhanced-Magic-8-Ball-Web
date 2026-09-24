# Web Agent Delivery Contract

This repository is the **web** build target for Enhanced Magic 8 Ball. Treat the product
specification, README, and approved visual reference as source of truth. Do not invent
requirements.

## Delivery loop

For every completed, file-changing delivery:

1. Inspect `git status`, existing documentation, current implementation, and relevant issues.
2. Make the smallest coherent change that satisfies the accepted task.
3. Update documentation whose factual state changed: `PROJECT.md`, `PLAN.md`, `TODOS.md`, `SUMMARY.md`.
4. Run verification appropriate to the change (`scripts/verify.sh` once it exists).
5. Review the diff and confirm no unrelated user changes are included.
6. Commit code, tests, and documentation together.
7. Push to the configured remote. If no remote exists or push fails, state that clearly.

A task is complete only when its relevant checks have passed or a concrete blocker is recorded in `PLAN.md`.

## Bootstrap requirements

Before the first implementation delivery, create these files if absent:

- `scripts/verify.sh` — canonical local verification entry point (lint + typecheck + tests)
- Version bump per the versioning rules below (first build: 0.0.0 → 0.0.1)

## Web implementation rules

- Build to the web-app requirements in `Magic 8 Ball -- Product Spec.md`: single viewport,
  portrait-only, dark-only, no scrolling, title-free initial screen, centered phone-like
  layout on wide screens.
- No question input of any kind; no sound; no haptics; no analytics, telemetry, accounts,
  tracking, or runtime network requests.
- Keep the saying catalog as data (bundled JSON theme packs) separate from application code.
  The complete built-in catalog (original 20 + all additional packs) ships with the product.
- Preserve the 50% affirmative / 25% noncommittal / 25% negative weighting: select the
  category by weight, then uniformly from that category's no-repeat deck. Persist deck state
  locally across visits; never expose prior answers or provide a user-facing reset.
- One 1-second rocking-in-place animation before reveal; honor `prefers-reduced-motion` by
  skipping the animation and revealing immediately.
- Keyboard access: Enter and Space activate the focused **Shake the Ball** button; the answer
  is announced for screen readers without a separate visible transcript.
- Keep production behavior testable with deterministic seams (injectable RNG, fake storage).

## Verification and versioning

Discover the existing tooling before choosing commands; never guess a tool or package name.
Keep `scripts/verify.sh` as the canonical local verification entry point once created.

`VERSIONS_LOCATIONS.md` is the canonical version registry. The version is a semantic version,
incremented by exactly +0.0.1 for each file-changing delivery: update every registered
location, grep the repo for the old version, and record the change in `SUMMARY.md`.

## Git safety

- Never force-push, rewrite history, destructively reset, or discard unrelated working-tree changes.
- Never commit secrets, build artifacts, or editor/OS junk files.
- Use one atomic commit per completed delivery.
