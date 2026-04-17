# Milestone standard operating procedure (SOP)

## Principles

- **Be explicit:** state intent clearly—in names, docs, plans, and configuration—so the next reader (human or agent) does not have to guess.
- **Be efficient:** avoid redundant work and duplicate sources of truth (the same value in two files, two docs, or two parallel processes). Prefer one canonical place and wire consumers to it.
- **Be observable:** every async boundary, error path, and background operation must emit a `console.error` / `console.warn` / `console.log` so that nothing fails silently. Unknown activity without a log entry is a bug. Catch blocks must always log the error before swallowing or rethrowing it.

This extends step 1 below: research should reduce duplicated effort, not repeat it.

## Development environment

- **Dev machine:** Windows (PowerShell) is common for this project; mobile toolchains may also use macOS for iOS builds (store submission, simulators).
- **Mobile testing:** Physical devices and emulators/simulators for **iOS** and **Android**; network toggles for offline-first behavior.
- **Target delivery:** **App Store and Google Play** (or equivalent distribution) for the **native mobile** app described in [`SPEC.md`](./SPEC.md). There is **no** requirement for a publicly hosted web app operated by the author; optional **user-configured** sync backends (Firebase, Supabase, self-hosted REST) are documented in companion specs, not implied to be hosted by the ForkIt maintainer.

The **legacy** Next.js + Vercel prototype used LAN + public web hosting for testing; see [`PLAN-legacy-web.md`](./PLAN-legacy-web.md) if you still maintain that archive.

Keep these constraints in mind when choosing tools, writing scripts, and configuring build pipelines. Anything that only works on one OS without a documented alternative should be flagged.

## Milestone workflow

For each milestone, follow these steps in order:

1. **Research & discovery:** Before designing, research the existing codebase and any relevant libraries or APIs. Understand the current state and options; weigh pros and cons so work is not duplicated and recommendations are informed.
2. **Design & propose:** From that research, produce a design and implementation plan.
3. **Discussion & approval:** Review the plan with the project owner. Do not implement until they approve.
4. **Implement:** Build the approved design in code.
5. **Update docs:** If the milestone introduces new setup steps, dependencies, environment variables, or dev workflow changes, update `README.md` before moving to testing.
6. **Test:** Add automated tests (e.g. unit or integration) for new behavior and run the full test suite to catch regressions.
7. **Review & verify:** When implementation and tests are done, tell the project owner so they can run the app, manually verify, and give feedback.
8. **Mark as done:** After they confirm they are satisfied, mark the milestone complete in `PLAN.md`.
9. **Branch:** Create a feature branch before any commits — never commit directly to `main` or `master`. Name it after the phase or feature (e.g. `phase/1-data-layer`, `feat/search-screen`, `fix/migration-runner`).
10. **Commit:** Stage all milestone changes and create a single descriptive commit on the feature branch. If multiple commits were made during implementation, squash them into one commit per milestone before opening a PR.
11. **Pull request:** Open a PR from the feature branch into `main`/`master`. The PR title should match the milestone. Do not merge or push to `main` directly — the project owner merges.
