# How to ask questions the smart way (ForkIt)

This project follows the spirit of Eric S. Raymond’s *How To Ask Questions The Smart Way*—give enough context that someone (or an agent) can help in one round instead of three. The full essay is here: [catb.org/~esr/faqs/smart-questions.html](https://www.catb.org/~esr/faqs/smart-questions.html).

## Before you ask

- **State the goal** in one sentence (what you want to happen, not only what broke).
- **Say where you are:** OS (this repo assumes **Windows / PowerShell**), Node version if relevant, and whether you’re on `localhost`, LAN IP, or deployed.
- **Show what you already tried** (commands, config changes, branches)—so nobody repeats dead ends.

## What to include when something fails

1. **Expected vs actual:** What did you expect? What happened instead (exact error text or screenshot description)?
2. **Smallest reproduction:** The fewest steps to trigger the issue (clicks, route, API call, env var).
3. **Scope:** Is it dev only, build only, tests only, or production?
4. **Logs:** Relevant terminal output or browser console lines—trim noise, keep the first error and stack.

## What to avoid

- Vague reports (“it doesn’t work”, “the AI was wrong”) with no error message or file.
- Dumping entire files when a **snippet and path** would do.
- Asking others to guess your intent when a short goal sentence would fix it.

## For AI / agent sessions in this repo

- Point to **files or features** (`src/...`, milestone in `PLAN.md`, product spec in `SPEC.md`) when you can.
- If you changed **env** or **dependencies**, say so; see `README.md` for variables.
- One clear **question per thread** for debugging usually gets a faster answer than a bundle of unrelated issues.

Tone here matches the rest of the repo: direct, technical, respectful of everyone’s time.
