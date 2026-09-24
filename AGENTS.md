# iOS Agent Delivery Contract

This repository is an iOS project template. Treat the project's product specification,
README, and architecture documents as source of truth. Do not invent requirements.

## Delivery loop

For every completed, file-changing delivery:

1. Inspect `git status`, existing documentation, current implementation, and relevant issues.
2. Make the smallest coherent change that satisfies the accepted task.
3. Update documentation whose factual state changed: `PROJECT.md`, `PLAN.md`, `TODO.md`,
   `ARCHITECTURE.md`, `DECISIONS.md`, and `CHANGELOG.md`.
4. Run verification appropriate to the change.
5. Review the diff and confirm no unrelated user changes are included.
6. Commit code, tests, build metadata, and documentation together.
7. Push to the configured remote. If no remote exists or push fails, state that clearly.

A task is complete only when its relevant checks have passed or a concrete blocker is recorded.

## Bootstrap requirements

Before the first implementation delivery, create these files if absent:

- `PROJECT.md`, `PLAN.md`, `TODO.md`, `ARCHITECTURE.md`, `DECISIONS.md`, `CHANGELOG.md`
- `VERSIONS_LOCATIONS.md`
- `scripts/verify.sh`
- `opencode.json` (copy from this template repo) — project-local OpenCode agent
  permission config. Read before weakening it; do not broaden `bash`/`edit` scope
  without updating this note.

Check whether a file or directory exists before creating it. Preserve existing user work.

## iOS implementation rules

- Prefer Swift, SwiftUI, Apple frameworks, and XCTest or Swift Testing.
- Keep UI, domain/use-case logic, persistence, external integrations, and platform adapters separate.
- Add dependencies only when an Apple framework cannot reasonably satisfy a product requirement.
- Do not add analytics, telemetry, accounts, network services, tracking, or permissions without explicit authorization.
- Keep production behavior testable through protocols, fakes, and deterministic test seams.
- Simulator checks do not prove camera, photo-library, iCloud, notification, or physical-device behavior.

## Verification and versioning

Discover the workspace/project, schemes, test targets, and existing scripts before choosing commands; never guess a scheme name. Keep `scripts/verify.sh` as the canonical local verification entry point once created.

`VERSIONS_LOCATIONS.md` inventories version and build-number locations. Keep a user-visible marketing version separate from a monotonically increasing build number. Increment the build number once for each completed file-changing delivery; change the marketing version only for an intentional release. Xcode build settings and `Info.plist` values are authoritative.

## Git safety

- Never force-push, rewrite history, destructively reset, or discard unrelated working-tree changes.
- Never commit secrets, signing certificates, provisioning profiles, DerivedData, or simulator artifacts.
- Use one atomic commit per completed delivery.
