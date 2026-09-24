# Enhanced Magic 8 Ball

## Purpose
A web-based digital Magic 8 Ball that preserves the classic ritual: the user privately thinks of a yes-or-no question, shakes the ball via an on-screen button, and receives one randomly selected answer from the full curated saying catalog. The question is never collected and never influences the outcome. Build target: **web app** (the product spec also defines mobile-app and AI-skill formats for possible later targets).

## Source of Truth
- `Magic 8 Ball -- Product Spec.md` — complete product requirements
- `Magic 8 Ball -- Approved Idle UI Concept.png` — approved idle-state visual reference
- `README.md` — web experience summary
- `AGENTS.md` (repo) — web agent delivery contract

## Architecture
- **Format:** Web app — single viewport, portrait-only, dark-only, no scroll, title-free initial screen; centered phone-like layout on wide screens
- **Interaction:** Ask → Shake (visible, keyboard-accessible button) → 1-second rocking animation → blue triangular answer window reveal → Ask Again (returns to initial screen with no reset animation)
- **Randomness:** Select outcome category at 50% affirmative / 25% noncommittal / 25% negative, then uniformly from that category's no-repeat deck; decks reshuffle only after exhaustion; deck state persisted locally across visits, never exposed to the user
- **Catalog:** Bundled JSON theme packs (original 20 + Sarcastic, Surfer, Sports, Weather, Tech, Movie-Inspired, and Rock-Inspired packs); sayings kept separate from application code; full catalog enabled by default with no theme selector at launch
- **Offline:** Fully functional after initial load; catalog, artwork, and deck state stored locally (e.g. localStorage); no runtime network requests
- **Constraints:** No question input, no sound, no haptics, no analytics/telemetry/accounts, no visible answer history or disclaimer text; honor `prefers-reduced-motion`; screen-reader announcement of the answer
- **Stack:** Undecided — to be determined in PLAN.md during the plan phase (static web app, no backend)

## Status
**Version:** 0.0.0
**Phase:** Pre-plan. Product spec and visual direction are complete; implementation has not started.

## Repository
Source of truth: https://github.com/JohnHoaglun/Enhanced-Magic-8-Ball-Web
Branch: `main`

## Credentials
N/A — no credentials required (offline app, no network services)
