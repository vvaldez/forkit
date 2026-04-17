# ForkIt — public documentation

This repository is the **public** home for product specifications, planning, and shared workflow docs. It does not contain application source code.

## For AI assistants and contributors

1. Read [`SPEC.md`](./SPEC.md) for product goals and behavior before planning or implementing changes (implementation happens in the private source tree). The **canonical product** is the **mobile, offline-first** app; an older **Next.js** prototype may exist as an archive and is **not** the architecture of record (see `SPEC.md` legacy note).
2. Keep [`PLAN.md`](./PLAN.md) aligned with real progress when milestones move. Completed **web** milestones live in [`PLAN-legacy-web.md`](./PLAN-legacy-web.md) only.
3. Follow [`SOP.md`](./SOP.md) for milestone steps (research, design, approval, implement, test, verify, mark done).
4. When asking for help or reporting problems, follow [`ESR.md`](./ESR.md).
5. **Security:** this repo is **public** — never commit secrets. Read the umbrella [`SECURITY.md`](../SECURITY.md) and [`AGENTS.md`](../AGENTS.md) (Rule #1). Local secrets belong in [`forkit-secrets/`](../forkit-secrets/README.md) only, not in `forkit/`.
6. **Companion specs (Phase 0):** before implementing the mobile app, read [`schema.md`](./schema.md), [`ux-screens.md`](./ux-screens.md), [`api-integration.md`](./api-integration.md), [`sync-protocol.md`](./sync-protocol.md), and [`recipe-sources.md`](./recipe-sources.md) — indexed from [`SPEC.md`](./SPEC.md).

