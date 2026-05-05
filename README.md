# ForkIt — "Fork it, I'll cook it myself."

ForkIt is a mobile meal-planning app built on a single pun: *fork DoorDash — cook it yourself.* Instead of ordering delivery, you browse recipes, build a cart, generate a grocery list, and cook at home. The app tracks what you save versus what delivery would have cost.

**The emotional arc:** Overwhelmed by "what's for dinner?" → ForkIt makes the decision → you cook it → you feel good about it (and kept $15).

---

## What it does

- **Browse & discover** — Scroll a recipe feed grouped by meal time and cuisine. Use the Discover tab to get a random pick or answer four quick questions (meal time, cuisine, dietary preference, cook time) to get a filtered list.
- **Cart & grocery list** — Add recipes to a cart like a DoorDash group order. Check out to a combined or per-meal grocery list with checkboxes.
- **Savings tracking** — Every checkout estimates what delivery would have cost vs. cooking at home. Lifetime savings accumulate in your profile.
- **Cooking log** — Tap "I'm making this" on any recipe to log it to history. Leftovers appear as a banner in Browse so you remember what's already in the fridge.
- **Favorites & custom recipes** — Save recipes you love. Write your own with ingredients and instructions.
- **Fully offline** — All bundled recipes work with no internet connection. Your cart, history, favorites, and custom recipes live on-device.

---

## Stack

| Layer | Choice |
|-------|--------|
| Mobile framework | React Native (Expo ~54, managed workflow) |
| Language | TypeScript |
| Database | Two SQLite files via expo-sqlite v15: bundled read-only (recipes) + user read-write (everything else) |
| Navigation | React Navigation native-stack + bottom tabs |
| Recipe data | TheMealDB (bundled at build time) |

The app is **offline-first**: no account required, no backend required for core features. Household sync and auth are planned for a future phase.

---

## Design direction

**Brand color:** `#E8474C` (bold red) — CTAs, active states, app icon.

**Tone:** Confident, a little cheeky. For regular home cooks who want to stop staring at the fridge. Not a chef's tool — a weeknight dinner tool.

**App icon concept:** A bold stylized fork — the utensil, but also a fork-in-the-road decision moment. White on brand red. Avoid delivery bags, chef's hats, or crossed knife-and-fork.

See [`DESIGN_BRIEF.md`](./DESIGN_BRIEF.md) in the source repo for full icon specs, tab bar icon specs, empty state illustrations, and color palette.

---

## Project layout

```
forkit-project/
  forkit/          ← this repo (public): specs, plans, docs
  forkit-source/   ← private repo: React Native app source
  forkit-secrets/  ← local only, never committed: API keys, credentials
```

---

## Documentation

| File | Purpose |
|------|---------|
| [`SPEC.md`](./SPEC.md) | Full product requirements and UX behavior |
| [`PLAN.md`](../forkit-source/docs/PLAN.md) | Milestones and progress checklist |
| [`schema.md`](../forkit-source/docs/schema.md) | SQLite database schema (bundled + user) |
| [`ux-screens.md`](../forkit-source/docs/ux-screens.md) | Navigation tree, screen specs, offline/error states |
| [`api-integration.md`](../forkit-source/docs/api-integration.md) | TheMealDB field mapping, USDA enrichment |
| [`sync-protocol.md`](../forkit-source/docs/sync-protocol.md) | Future household sync design |
| [`SOP.md`](../forkit-source/docs/SOP.md) | How each milestone is run end to end |
| [`ESR.md`](../forkit-source/docs/ESR.md) | Smart-question habits for support and bugs |
| [`AGENTS.md`](./AGENTS.md) | AI / contributor workflow for this repo |
| [`priorities.md`](../forkit-source/docs/priorities.md) | Architecture and feature decision framework |

---

## Roadmap (high level)

- **Phases 1–4 ✅** — Offline browse, search, favorites, cart, grocery list, savings, cooking log, leftovers, Discover tab, questionnaire
- **Phase 5a ✅** — Home tab with household menu view and ingredient-efficiency hints
- **Phase 5b** — Magic-link auth, session restore, Settings screen
- **Phase 6** — Household sync, group cart, App Store / Play Store release

---

## License

GPL-3.0 — see [`LICENSE`](./LICENSE).
Recipe data from [TheMealDB](https://www.themealdb.com/) — see their terms of use.
