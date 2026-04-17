# Project plan: ForkIt (mobile)

Milestones and progress tracking for the **native mobile** product. Feature definitions and architecture live in [`SPEC.md`](./SPEC.md).

The **completed Next.js web prototype** checklist is archived in [`PLAN-legacy-web.md`](./PLAN-legacy-web.md) for historical reference only.

---

## Phase 0: Companion specs (before app scaffold)

Author the documents listed in [`SPEC.md` § Companion specifications](./SPEC.md#companion-specifications):

- [x] **`schema.md`** — Bundled + user SQLite schema, migrations.
- [x] **`ux-screens.md`** — Navigation, screens, offline/error states.
- [x] **`api-integration.md`** — TheMealDB, USDA, optional APIs, limits, secure key storage.
- [x] **`sync-protocol.md`** — Sync model, REST contract, conflicts, Firebase/Supabase mapping.
- [x] **`recipe-sources.md`** (can lag) — Building and licensing the bundled DB.

---

## Phase 1: App scaffold & data shell

- [x] Choose **React Native (Expo managed workflow)**; mobile app repo is `forkit-source/` with remote `https://github.com/vvaldez/forkit-source.git`.
- [x] Implement **read-only bundled SQLite** loader and **read-write user SQLite** with migrations from `schema.md`.
- [x] Ship a **dev-only** recipe count / smoke screen proving offline open and query.

---

## Phase 2: Core offline UX

- [x] **Build real bundled DB** — 598 recipes, 6,332 ingredient lines; all 4 buckets non-zero (Breakfast 15, Lunch 99, Dinner 291, Snacks 193); `BUNDLED_CONTENT_VERSION = '1.0.0'`.
- [x] DoorDash-style **browse** (themes / cards) backed by bundled data.
- [x] **Search** (local-first) + **random discovery** from bundled DB.
- [x] **Favorites** and **custom recipe** CRUD in user DB.
- [ ] **Ingredient validation** path (USDA when online; soft warnings offline).
- [x] **Full-screen meal detail** (ingredients, instructions, video link).
- [ ] Implement **email magic-link auth** and session restore for v1 sharing roadmap.
- [ ] Implement **household invite/create/join** flow as the access boundary for shared data.

---

## Phase 3: Cart, grocery list, savings

- [ ] **Cart** with native-friendly patterns (tab bar, floating summary).
- [ ] **Checkout → grocery list** (combined + by-meal views).
- [ ] **Savings estimate** + **lifetime savings** in user DB.

---

## Phase 4: Questionnaire & variety

- [ ] ForkIt **Surprise me / Ask me** entry and **questionnaire** flow per Feature 1.4 in `SPEC.md`.
- [ ] **Cooking history** (“I made this”) driving **7-day exclusion** and quiz behavior.
- [ ] **Leftovers** surface + settings (window, dismissals).

---

## Phase 5: Menu & household sync

- [ ] **Household menu** view (tonight, recent, leftovers, queue)—per `SPEC.md` and `ux-screens.md`.
- [ ] **Settings — sync setup:** Supabase URL + anon key entry (user-supplied project); connection validation; session/household status display; invite controls. Secure key storage per `SECURITY.md`; never committed.
- [ ] Implement **Supabase sync path** per `sync-protocol.md` (user-supplied project, async pull/push, outbox retry); optional adapter support later.
- [ ] **Merged household state** for cart / grocery where spec requires attribution after sync.

---

## Phase 6: Polish, export, release

- [ ] **CSV export** from Settings per `SPEC.md`.
- [ ] Store listing assets, privacy policy, crash/analytics choices.
- [ ] **Test matrix** (offline flights, sync conflict spot checks, API rate-limit behavior).
- [ ] **App Store / Play** submission (owner-driven).

---

## Future (non-blocking)

- [ ] **Realtime collaboration** on top of synced documents (Firestore listeners, Supabase Realtime, or self-hosted WS)—see `SPEC.md` household section.
- [ ] **Google Sheets → import** pipeline for custom recipes (post-v1).
- [ ] Features marked **proposed** in `SPEC.md` (weekly planner, budget themes, share sheet enhancements, skill tags).
