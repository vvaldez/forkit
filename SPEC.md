# ForkIt

> **Fork it, I'll cook it myself.** A DoorDash-inspired app that turns the delivery model on its head -- instead of paying someone to bring you food, you use the same slick UX to discover recipes, coordinate meals with your family, and generate grocery lists that save you money.

ForkIt ships as a **native mobile app** (iOS and Android), **offline-first**, with optional online recipe APIs and **user-configured** household sync. There is **no required backend operated by the app author**; users own their data.

## Three Pillars

### 1. The DoorDash Pun (UI/UX Connection)

ForkIt borrows the look, feel, and flow of food delivery apps -- but the punchline is that *you* are the kitchen. Themes replace restaurants. Meals replace menu items. Checkout produces a grocery list, not an order confirmation.

### 2. Anti-Fee / Financially Savvy

Every interaction reinforces the premise: cooking at home saves money. The app should make the user *feel* the savings, not just know about them abstractly.

### 3. Recipe Discovery & Sharing

ForkIt is a tool for finding new meals, learning to cook them (YouTube links, instructions), and coordinating with household members. Shared plans, favorites, and history stay in the family's control via sync they configure—not via infrastructure the developer must run.

**Meal variety is a core principle.** The app should actively steer users toward new dishes and away from repeating the same meals. Recipes cooked in the last 7 days are de-prioritized or hidden from recommendations, and the questionnaire gives users explicit control over what to skip.

---

## Platform & architecture

### Platform

- **Targets:** iOS and Android from a **single cross-platform codebase**. **React Native (Expo managed workflow)** is the chosen framework — TypeScript, `expo-sqlite` for offline SQLite, and `@supabase/supabase-js` for household sync.
- **Posture:** **Offline-first.** Browsing, random discovery from bundled data, favorites, custom recipes, meal history, leftovers, cart, and grocery list generation must work without the internet; online features degrade gracefully.

### High-level architecture

```
App
├── Bundled Recipe DB (SQLite, read-only, ships with the app)
├── Local User DB (SQLite, read-write)
│   ├── Favorites
│   ├── Custom recipes
│   ├── Meal history & “I made this”
│   ├── Leftovers
│   ├── Cart / meal plan state (for grocery list)
│   └── Savings ledger (lifetime estimates)
├── Search layer
│   ├── Local search (always available offline)
│   ├── Live API adapters (TheMealDB / optional Spoonacular, Edamam)
│   └── Ingredient validator (USDA FoodData Central primary; optional Spoonacular fallback)
├── Sync layer (optional, user-configured—see Household)
├── Settings (sync method, API keys in secure storage, export, reset)
└── Export (CSV) + grocery list views
```

**Meal planning / cart / grocery list (v1):** Users add meals to a cart (DoorDash-style). Checkout produces a **consolidated grocery list** with **combined** (deduplicated, checkboxes) and **by-meal** views (grouped, with links back to instructions or video). This is a **ForkIt v1 requirement** and is intentionally broader than a “data export only” MVP.

### Recipe data sources

**Tier 1 — Bundled database (offline):** A read-only SQLite database shipped with the app, seeded from [TheMealDB](https://www.themealdb.com/) (~598 meals). This is the **starter pack** — enough for initial discovery and offline use, not the long-term variety ceiling. Updates ship with app store releases.

**Tier 2 — User recipes (primary variety growth path):** Custom recipes entered or imported by the user are the primary way the catalog grows beyond the starter pack. They are first-class citizens: surfaced in search, questionnaire, favorites, and the menu alongside bundled and API recipes. See [Custom recipes & “HomeCook”](#custom-recipes--homecook).

**Tier 3 — Live APIs (when online):** Search and enrichment can call external APIs. Sensible defaults: **TheMealDB** for discovery; **USDA FoodData Central** for ingredient validation. Optional paid tiers: Spoonacular, Edamam, etc. Keys and endpoints live in **user-configured** settings and **secure device storage**, never hardcoded.

Internal recipe records should remain aligned with **Schema.org/Recipe**-style fields (ingredients, instructions, cuisine, cook time, servings, media links) so APIs, bundled data, and custom entries map cleanly.

### Custom recipes & “HomeCook”

Custom recipes are the **primary variety growth path** — the mechanism by which a household's catalog expands well beyond the ~598-meal starter pack. They must be as frictionless to add as possible.

- **v1 — in-app entry:** Name, ingredients, and instructions are the only required fields. All other fields (cuisine, dietary tags, cook time, servings, YouTube link, photo, notes) are optional. Custom recipes are stored in the **local user SQLite** database and appear on all the same surfaces as bundled/API recipes: search, favorites, questionnaire, and menu.
- **v1 — CSV import:** Import recipes from a CSV file (e.g. a spreadsheet export) directly into `user_recipes`. This is a v1 feature, not a post-v1 add-on, because it is the lowest-friction way to bulk-grow a household's catalog. Column mapping follows the export format defined in [User data & export](#user-data--export).
- **Ingredient validation:** Optional, non-blocking when online (USDA-first; unrecognized ingredients get a soft warning, never a hard block on save).
- **Google Sheets as live source:** Not part of the v1 architecture. CSV export from a Sheet and import via the CSV path above is the supported workflow.

### Search (summary)

Search runs across **user recipes first** (highest rank, always offline), then bundled data (instant, offline), then live API results when online, with de-duplication (e.g. name + ingredients fingerprint). Filters include cuisine, dietary tags, cook time, ingredient include/exclude, and source (bundled / API / my recipes). Random discovery pulls from the bundled + user recipe pool without network.

### User data & export

All user-generated state (favorites, custom recipes, history, leftovers, cart, savings counters) lives in the **local user DB** with small footprint expectations. **CSV export** from Settings includes columns such as: name, source (bundled / api / custom), ingredients (e.g. pipe-separated), instructions, cuisine, dietary tags, date saved, cook time, servings—suitable for spreadsheets.

### Menu view

A DoorDash-style **household menu** surface: tonight’s suggestion, recent meals (e.g. last 7 days), available leftovers (with freshness hints), and upcoming queued meals—consistent with offline-first local data and optional sync.

---

## Household coordination & sync

ForkIt is **local-only by default.** The app is fully functional — browsing, searching, questionnaire, cart, grocery lists, favorites, history, leftovers, savings — without any account or network connection. No configuration is required to use the app.

**Household sync is opt-in.** Users who want to share data across devices or with household members configure sync in Settings by supplying their own Supabase project URL and anon key. Identity within that project uses **email magic-link auth + household invite flows**.

### Auth offline contract

Auth state is only ever required for sync operations. **The app must never gate core functionality on authentication status.** Specifically:

- Browsing, search, questionnaire, cart, checkout, grocery list generation, history, leftovers, savings, and custom recipe entry must all work regardless of whether the user is signed in.
- If a session expires or the device is offline, all local data remains accessible and writable.
- Sync is queued in `sync_outbox` until connectivity and valid auth are both restored. Settings shows sync status (“Sync paused — sign in to resume”) without blocking any other screen.
- The app must never silently clear local data due to an auth failure.

### Supported sync modes (settings)

| Option | Description |
|--------|-------------|
| **None (default)** | Local-only; single device, no household sharing. No setup required. |
| **Supabase (user-supplied, v1)** | User provides their own Supabase project URL + anon key. Enables household sharing, magic-link auth, and invite flows within that project. |
| **Firebase (optional later)** | Alternative adapter if intentionally enabled in future phases. |
| **Self-hosted REST (optional later)** | Advanced adapter for power users or self-hosting needs. |

Exact payloads, conflict rules, and identity are defined in companion doc **`sync-protocol.md`** (see [Companion specifications](#companion-specifications)).

### Real-time group carts vs async sync (tradeoffs)

The **previous** ForkIt web prototype used **PartyKit** for **real-time** multi-device carts (share link, see everyone’s picks update instantly, “is everyone ready?” before checkout).

| Approach | Pros | Cons |
|----------|------|------|
| **Managed realtime (e.g. PartyKit-style)** | Lowest friction for a session; no account; instant mirrors. | Operational burden on whoever runs the service. Hard to square with “zero author-operated infra.” |
| **User-supplied Supabase async sync (canonical v1)** | Zero author ops; user owns their data and project; recoverable auth/invites + clean household boundaries. | Collaboration is **eventual consistency**; “live” cart mirroring is a UX problem (refresh or explicit “sync now”), not a WebSocket guarantee. Requires user to set up a Supabase project. |
| **Hybrid later** | v1 ships with async sync; optional phase 2 can add Supabase Realtime or a documented self-hosted websocket on top of the same synced documents—without rewriting local-first storage. | Phase 1 does not replicate sub-second PartyKit feel without extra work. |

**Product decision for this spec:** **v1 is local-only by default; household sync is opt-in via user-supplied Supabase (async, email magic-link auth, household invites).** Merged grocery lists and attribution (“who picked what”) come from merged synced state after sync rounds, plus clear UX for “ready to shop.”

**Non-binding future note:** If realtime sessions return, they should reuse the same logical data model as sync (not a second source of truth), so Supabase Realtime or a power-user server remains an add-on, not a fork of the architecture.

---

## Personas

- **The User (everyone):** Browses meals, discovers new recipes, adds favorites, picks what they want to eat. Motivated by variety, convenience, and saving money vs. ordering delivery.
- **The Cook (the one who shops and cooks):** Sees the consolidated grocery list, accesses YouTube tutorials, tracks savings. Motivated by efficiency, budget control, and expanding their cooking repertoire.

---

## Features

Milestone numbers below refer to **product intent**, not the archived Next.js codebase. Implementation status lives in `PLAN.md`.

### Pillar 1: DoorDash-style experience

#### Feature 1.1: DoorDash UI/UX (v1)

- Native mobile layout: bottom navigation, horizontal theme categories, meal cards with imagery.
- “Themes” replace restaurants; “meals” replace menu items; tutorial links (e.g. YouTube) on meal detail.
- Full-screen meal detail: hero image, cuisine, category, protein, ingredients, instructions/notes, video link, savings context where applicable.

#### Feature 1.2: Cart & grocery list (v1)

- Add meals to a cart; floating cart / badge mirroring delivery-app patterns.
- Checkout generates a **consolidated grocery list**: combined deduplicated checklist and by-meal grouped view.

#### Feature 1.3: Household meal planning (v1)

- Households that enable sync share favorites, custom recipes, history, leftovers, and planning-related state per **`sync-protocol.md`**.
- Cook sees merged contributions with attribution where the data model supports it; explicit “ready to generate list” flow (exact UX TBD in **`ux-screens.md`**).

#### Feature 1.4: “What do you feel like?” Questionnaire (v1)

*Feature idea credited to Ava (my daughter).*

- ForkIt entry offers **”Surprise me”** (random from bundled + user recipe pool) vs **”Ask me”** (questionnaire).
- One-question-per-screen flow: exclude recent meals, meal time, cuisine, protein, vibe (exact set tunable in UX spec).
- Answers drive filters and recipe fetch; meals cooked in the last **7 days** excluded by default for variety.
- Options must map to **real facets** in data (or explicit mappings) so choices like “Snack” never point at empty sets.
- Per-question **“Surprise me”** = no filter on that dimension. Global **Surprise me** clears narrowing filters and randomizes from the full eligible pool.
- **Zero-results guardrails:** relax filters in a documented order (e.g. meal time → protein → cuisine) and/or show that filters were relaxed, while honoring recent-meal exclusions.
- Quiz copy and internal category strings stay consistent or explicitly mapped.

### Pillar 2: Savings & budget

#### Feature 2.1: Savings tracker (v1)

- After checkout, show delivery-vs-home estimate where data allows (*“~$X on delivery vs ~$Y at home; saved ~$Z”*).
- Configurable markup assumptions; **lifetime savings** persisted locally (and included in sync payload if enabled).

#### Feature 2.2–2.4: Cost per serving, budget themes, weekly planner (proposed)

- As in prior spec: per-serving display, budget-oriented themes, multi-day planner with one grocery pass—scheduled after core v1 mobile ship unless promoted in `PLAN.md`.

### Pillar 3: Discovery & sharing

#### Feature 3.1: Recipe retrieval & search (v1)

- Bundled DB for default and offline; live APIs when online; random, keyword, filters, and ingredient-oriented modes per architecture section.

#### Feature 3.2: Favorites (v1)

- Save recipes (bundled, API, or custom); stored in user DB; sync when configured.

#### Feature 3.3: “I made this!” history (v1)

- One-tap cooking log; feeds variety exclusions, leftovers, and future insights.

#### Feature 3.4–3.6: Notes, share sheet, skill tags (proposed)

- Personal notes, OS share sheet for a recipe card, beginner/intermediate/advanced tagging—post-v1 unless pulled forward.

#### Feature 3.7: Leftovers board (v1)

- Surfaces recent cooked meals in a dedicated UX (card or screen); dismiss per item; window configurable in settings; aligned with meal-variety rules.

#### Feature 3.8: Recipe import from CSV (v1)

- Import recipes from a CSV file into `user_recipes`; minimum viable column set: name, ingredients (pipe-separated), instructions. Full column mapping defined in [Custom recipes & “HomeCook”](#custom-recipes--homecook).
- Google Sheets as a **live** editorial source remains out of scope; CSV export from a Sheet is the supported path.

---

## Companion specifications

Complete these in the **`forkit`** repo **before** or in parallel with implementation spikes (recommended order). They describe **behavior and data shape only** — never put live API keys, tokens, or credentials in any file under `forkit/` ([`../SECURITY.md`](../SECURITY.md); local secrets live in [`../forkit-secrets/`](../forkit-secrets/README.md)).

Use [`priorities.md`](./priorities.md) as the weighted decision framework when evaluating architecture and feature tradeoffs.

1. [`schema.md`](./schema.md) — Bundled vs user SQLite tables, indexes, migrations.
2. [`ux-screens.md`](./ux-screens.md) — Every screen, navigation, empty/offline/error states.
3. [`api-integration.md`](./api-integration.md) — TheMealDB, USDA, optional APIs: endpoints, mapping, rate limits, key storage.
4. [`sync-protocol.md`](./sync-protocol.md) — Sync document model, REST contract, conflict strategy, Firebase/Supabase shapes, triggers.
5. [`recipe-sources.md`](./recipe-sources.md) (lower priority) — How bundled SQLite is built, licensed, and rebundled per release.

---

## Constraints

- **No monetization** in this product vision; personal/household use focus.
- **No author-operated** multi-tenant backend required for core features; optional **user-supplied** sync and API keys only.
- **App stores:** iOS and Android distribution is **in scope** for the mobile product (subject to store policies and the owner’s publishing choices).
- Prefer a **thin, understandable** data layer: two SQLite databases, clear adapters, no unnecessary abstraction depth.
- UI implementation follows React Native / Expo idioms (platform-appropriate components, React Navigation patterns). This spec does not mandate specific component libraries.

## Out of scope (for now)

- Social graph, public feeds, or influencer-style sharing.
- Nutrition tracking as a primary product (ingredient validation may enable hints later).
- **Author-run** global recipe hosting or account system.

ForkIt **does** include **grocery list generation in v1** (see above), even though generic “shopping list product” features may stay minimal until later iterations.

## Open questions

- **Push notifications** for leftovers or “time to shop”?
- Menu / plan board: **read-only vs collaborative edit** under sync?
- **Custom recipes:** always household-visible when sync is on, or device-local option?
---

## Legacy implementation note

An earlier **Next.js + PartyKit + Vercel** prototype explored the same product pillars in the browser. It is **not** the architecture of record for the mobile app; it is archived in `forkit-prototype/` (local only, no active remote) for historical reference. New implementation work should follow this document and the companion specs above.
