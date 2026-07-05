# ForkIt — "Fork it, I'll cook it myself."

ForkIt is a mobile meal-planning app built on a single pun: *fork DoorDash — cook it yourself.* Instead of ordering delivery, you browse recipes, build a cart, generate a grocery list, and cook at home. The app tracks what you save versus what delivery would have cost.

**The emotional arc:** Overwhelmed by "what's for dinner?" → ForkIt makes the decision → you cook it → you feel good about it (and kept $15).

---

## What it does

- **Browse & discover** — Scroll a recipe feed grouped by meal time, cuisine, and curated buckets (Tonight in 30, Comfort Classics, World Kitchen, etc.). Filter by pill (Quick, Healthy, Meatless, Global, Low Carb). Use the Discover tab for a random pick or answer four quick questions to get a filtered list.
- **Community recipes** — Browse recipes shared by other users in the Community section. Tap "Save" to add to your recipes, or tap a card to view full detail. Share your own custom recipes to the community.
- **Cart & grocery list** — Add recipes to a cart like a DoorDash group order. Check out to a combined or per-meal grocery list with checkboxes. Assign cart items to household members.
- **Savings tracking** — Every checkout estimates what delivery would have cost vs. cooking at home. Lifetime savings accumulate in your profile.
- **Cooking log** — Tap "I'm making this" on any recipe to log it to history. Leftovers appear as a banner in Browse so you remember what's already in the fridge.
- **Favorites & custom recipes** — Save recipes you love. Write your own with ingredients and instructions and optionally share them to the community.
- **Household members** — Add named members to assign meals to specific people. Grocery list shows per-member attribution.
- **Offline-first** — All bundled recipes (~600 TheMealDB + 17 AllRecipes picks) work with no internet. Your cart, history, favorites, and custom recipes live on-device. Community content cached locally with 24-hour TTL.

---

## Stack

| Layer | Choice |
|-------|--------|
| Mobile framework | React Native (Expo ~54, managed workflow) |
| Language | TypeScript |
| Local database | Two SQLite files via expo-sqlite ~16: bundled read-only (recipes + community bundle) + user read-write (everything else) |
| Backend | Supabase (community recipes, auth, optional sync) |
| Navigation | React Navigation native-stack + bottom tabs |
| Recipe data | TheMealDB (bundled at build time) + AllRecipes picks (community bundle) + user-generated |

The app is **offline-first**: core features work with no account and no internet. Auth and community features require a connection.

---

## Design direction

**Brand color:** `#E8474C` (bold red) — CTAs, active states, app icon.

**Tone:** Confident, a little cheeky. For regular home cooks who want to stop staring at the fridge. Not a chef's tool — a weeknight dinner tool.

**App icon concept:** A bold stylized fork on brand red — four straight tines, one (off-center, not the middle) standing slightly taller than the rest. Reads as an ordinary fork at any size; the asymmetry is a quiet in-joke, not a gesture. Avoid delivery bags, chef's hats, or crossed knife-and-fork.

See [`DESIGN_BRIEF.md`](./DESIGN_BRIEF.md) for full icon specs, tab bar icon specs, empty states, and color palette.

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
| [`DESIGN_BRIEF.md`](./DESIGN_BRIEF.md) | Brand, icon specs, color palette, empty states |
| [`AGENTS.md`](./AGENTS.md) | AI / contributor workflow for this repo |
| [`privacy-policy.md`](./privacy-policy.md) | Privacy policy |

---

## Roadmap

- **Phases 1–4 ✅** — Offline browse, search, favorites, cart, grocery list, savings, cooking log, leftovers, Discover tab, questionnaire
- **Phase 5a ✅** — Home tab with household menu view and ingredient-efficiency hints
- **Phase 5b ✅** — Magic-link auth (email OTP), session restore, Settings screen, sync engine foundation
- **Phase 6 ✅** — Community recipes (Supabase table, Share to Community, community browse section, weekly export cron, OTA tag overrides)
- **Phase 7 ✅** — Discover tab, visual auth indicator, past grocery lists, navigation polish
- **Phase 8 ✅** — AllRecipes community bundle (17 recipes extracted via Claude + ExtractIt CLI, shipped as `community.bundle.sqlite`)
- **In progress** — Household member assignment (local, no account required): add members in Settings, assign cart items to members, per-member grocery list attribution
- **Remaining** — App Store / Play Store submission

---

## License

GPL-3.0 — see [`LICENSE`](./LICENSE).
Recipe data from [TheMealDB](https://www.themealdb.com/) — see their terms of use.
