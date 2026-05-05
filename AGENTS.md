# ForkIt — public documentation

This repository is the **public** home for product specifications, planning, and shared workflow docs. It does not contain application source code.

## For AI assistants and contributors

1. Read [`SPEC.md`](./SPEC.md) for product goals and behavior before planning or implementing changes (implementation happens in the private source tree). The **canonical product** is the **mobile, offline-first** app; an older **Next.js** prototype may exist as an archive and is **not** the architecture of record (see `SPEC.md` legacy note).
2. Keep [`PLAN.md`](../forkit-source/docs/PLAN.md) aligned with real progress when milestones move. Completed **web** milestones live in [`PLAN-legacy-web.md`](../forkit-source/docs/PLAN-legacy-web.md) only.
3. Follow [`SOP.md`](../forkit-source/docs/SOP.md) for milestone steps (research, design, approval, implement, test, verify, mark done).
4. When asking for help or reporting problems, follow [`ESR.md`](../forkit-source/docs/ESR.md).
5. **Security:** this repo is **public** — never commit secrets. Read the umbrella [`SECURITY.md`](../SECURITY.md) and [`AGENTS.md`](../AGENTS.md) (Rule #1). Local secrets belong in [`forkit-secrets/`](../forkit-secrets/README.md) only, not in `forkit/`.
6. **Companion specs (Phase 0):** before implementing the mobile app, read [`schema.md`](../forkit-source/docs/schema.md), [`ux-screens.md`](../forkit-source/docs/ux-screens.md), [`api-integration.md`](../forkit-source/docs/api-integration.md), [`sync-protocol.md`](../forkit-source/docs/sync-protocol.md), and [`recipe-sources.md`](../forkit-source/docs/recipe-sources.md) — indexed from [`SPEC.md`](./SPEC.md).

