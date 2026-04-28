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

- [x] **Build real bundled DB** — 598 recipes, 6,332 ingredient lines; all 4 buckets non-zero (Breakfast 15, Lunch 99, Dinner 291, Snacks 193); `BUNDLED_CONTENT_VERSION = '1.0.1'`.
- [x] DoorDash-style **browse** (themes / cards) backed by bundled data.
- [x] **Search** (local-first) + **random discovery** from bundled DB.
- [x] **Favorites** and **custom recipe** CRUD in user DB.
- [x] **Full-screen meal detail** (ingredients, instructions, video link).
- [ ] **Ingredient validation** path (USDA when online; soft warnings offline) — deferred; not required for core offline UX.

---

## Phase 3: Cart, grocery list, savings

- [x] **Cart** with native-friendly patterns (tab bar badge, Add to Cart on MealDetail + ghost "+" on Browse/Search cards, inline stepper).
- [x] **Checkout → grocery list** (combined + by-meal segmented views, local checkbox state).
- [x] **Savings estimate** + **lifetime savings** in user DB (`savings_totals` upsert, checkout snapshot in `checkout_events.payload_json`).
- [x] Migration 002: `UNIQUE INDEX` on `cart_lines(source, recipe_key, COALESCE(member_id,''))` + `checkout_events` index.
- [x] `cart_lines.member_id` column retained for Phase 5 group cart (NULL = single-user; no Phase 3 behaviour change).

---

## Phase 4: Questionnaire & variety

### Decisions locked

| Decision | Choice |
|----------|--------|
| Migration 003 | Add `source TEXT` + `recipe_key TEXT` (nullable) to `leftovers` table — required for chip → MealDetail navigation |
| “I'm making this” placement | Below cart stepper, above YouTube button on MealDetail; amber/green color (not brand red) |
| “I'm making this” state | Becomes muted “Cooked today” chip after tap; disabled (not hidden) if already logged within 4 hrs; no undo |
| YouTube intercept | Bottom sheet once per `(source, recipe_key)` — “Yes, I'm making this” / “Just watching”; auto-log on subsequent taps; key stored in `app_kv` |
| Double-log guard | Skip `meal_history` insert if a row exists for same recipe within last 4 hours |
| Leftover expiry | Default 3 days, range 1–7, stored in `app_kv` as `leftover_expiry_days`; adjustable in Settings (Phase 6 surface) |
| Leftovers card in Browse | Full-width, first item in `listData` as `type: 'leftovers'`; warm yellow `#FFF3CD`; max 5 chips with “+N more” overflow; `useFocusEffect` refresh |
| Questionnaire entry | **5th “Discover” tab** (not a FAB) — equal billing, one-tap access to Surprise me, natural hook for leftover → questionnaire pre-filter in Phase 5 |
| Questionnaire questions | 4 questions: **Meal time → Cuisine → Dietary preference → Cook time** |
| Cook time buckets | Quick (<30 min) · Medium (30–60 min) · I've got time (60+ min) · Surprise me |
| Cuisine options | Loaded dynamically: `SELECT DISTINCT cuisine_area FROM recipes` — never hardcoded |
| Dietary options | Loaded dynamically from `dietary_tags` values in bundled DB |
| Zero-results relaxation order | Cook time → Dietary → Cuisine → Meal time → any non-recently-cooked; each relaxation shows inline message |
| Questionnaire state | Passed via stack params `{ step, answers }` — no context, no cleanup needed |
| 7-day exclusion | Recipes in `meal_history` within last 7 days excluded from Surprise me and questionnaire results |
| Build order | Migration 003 → “I'm making this” → Leftovers in Browse → Discover tab + Questionnaire |

### Tasks

- [x] **Migration 003** — add `source TEXT` + `recipe_key TEXT` to `leftovers`; nullable to avoid breaking existing rows.
- [x] **”I'm making this”** on MealDetail — logs `meal_history` + `leftovers` in one tap; YouTube intercept bottom sheet; `app_kv` auto-log preference; double-log guard.
- [x] **Leftovers card** in Browse — `useFocusEffect` query, dismissible chips, full-width banner above bucket sections.
- [ ] **Discover tab** — `DiscoverScreen.tsx` exists but not wired into tab navigator; carry to Phase 7.
- [x] **Questionnaire flow** — 4-question one-per-screen flow; dynamic option loading; zero-results relaxation with inline messaging; result screen with filter chips + “Try different filters” CTA.
- [x] **`leftover_expiry_days` setting** — written to `app_kv` on first use (default 3); Settings screen exposes 1–7 stepper.

---

## Phase 5: Menu & household sync

> **Phase 5a and 5b are complete and merged.** Original Phase 5 scope was split: 5a = offline features (no backend), 5b = auth-only (no sync). Full household sync moved to Phase 8.

### Phase 5a — complete ✓
- [x] **Migration 004** — `household_members` table (sync-ready schema), soft-delete columns (`is_deleted`) on favorites, meal_history, leftovers, cart_lines, user_recipes; `sync_outbox` table.
- [x] **Migration 005** — `saved_recipe_snapshots` table; `upsertSnapshot`/`getSnapshot` helpers; 4-tier `resolveRecipe` waterfall (custom → live → snapshot → warn).
- [x] **Household menu** (`HomeScreen`) — tonight, recent meals, active leftovers, cart queue.
- [x] **Ingredient-efficiency hint card** on CartScreen — word-overlap scoring, dismissible, persisted in `app_kv`.
- [x] **Browse editorial buckets** — DoorDash-style pill filters + 6 horizontal bucket rows + cuisine grid → `CuisineDetailScreen`.

### Phase 5b — complete ✓
- [x] **Migration 006** — `sync_device`, `user_recipe_tags` tables; `published_community_id` + `author_display_name` on `user_recipes` (Phase 6 prep).
- [x] **Email OTP auth** — `AuthContext` with Supabase client, `expo-secure-store` session persistence, `sendOtp`/`verifyOtp`/`signOut`.
- [x] **SettingsScreen** — sign-in (email → 8-digit OTP), leftover expiry stepper (app_kv), sync coming-soon placeholder.
- [x] **Gear icon** in Browse + Home headers → Settings.
- [x] **app.json** — `scheme: "forkit"`, `expo-secure-store` plugin.

### Deferred to Phase 8
- [ ] **Household invite/create/join** flow
- [ ] **Supabase sync path** (outbox push/pull, conflict resolution)
- [ ] **Group cart** — wire `cart_lines.member_id` per household member

---

## Phase 6: Community recipes, polish, release

### Community recipes (new in Phase 6)

Architecture decisions locked by planning review (2026-04-18):

- **Storage:** Author-operated shared Supabase project (`community_recipes` table). Not user-supplied Supabase — community is multi-tenant by definition.
- **Publish flow:** Instant publish from any `user_recipes` row via "Share to Community" button. Reactive moderation: flag column + threshold-based hiding. No pre-review queue.
- **Consumption:** New "Community" section in Browse. App queries Supabase, caches in `community_recipe_cache` table in user DB (24-hour TTL). Offline: shows last cache with staleness banner.
- **Saving:** User taps "Save to My Recipes" → inserts copy into `user_recipes` with `published_community_id` back-reference. Source stays `'custom'` to avoid touching every `source IN (...)` check.
- **Attribution:** `author_user_id` + `author_display_name` (denormalized at publish). Author can edit/delete until another user has saved it; after that, "Withdraw" hides it from community but leaves saved copies intact.
- **Resilience:** GitHub Actions weekly cron exports `community_recipes` to `forkit/community-recipes-export.json`. Format = CSV import format so the existing CSV importer can ingest it with no new code. If Supabase unreachable >30 days, show one-time Settings banner. This is the fork/handoff artifact.

Schema additions needed before Phase 6 starts:
- User DB: add `published_community_id TEXT NULL` + `author_display_name TEXT NULL` to `user_recipes` (add in Phase 5b migration)
- User DB: add `community_recipe_cache` table (Phase 6)
- User DB: add `user_recipe_tags (recipe_id, bucket_slug)` table (Phase 5b migration — needed for custom recipe bucket membership)

### Kitchen bucket metadata (do before next bundled DB rebuild)

Current Browse hardcodes bucket rules as SQL WHERE clauses in TypeScript. Planned move to data-driven:

- **Bundled DB:** Add `recipe_tag_rules (bucket_slug PK, display_name, rule_sql, sort_order)` and `recipe_bucket_membership (recipe_id, bucket_slug)` tables. ETL evaluates rules at build time and materializes memberships. Browse queries `JOIN recipe_bucket_membership` instead of inline WHERE.
- **OTA sidecar:** `assets/recipe_tag_overrides.json` — map of `recipe_id → [bucket_slug]`. Loader on app start applies to a `recipe_tag_overrides` table in user DB. Allows bucket additions via Expo OTA without an app store release.
- **Community/custom recipes:** Author picks buckets at publish/create time from the canonical slug vocabulary. Stored in `user_recipe_tags`.
- **Adding a new bucket:** (1) Add row to `recipe_tag_rules` seed, (2) rebuild bundled DB, (3) optionally backfill via OTA sidecar before release.

### Phase 6 checklist
- [x] **CSV export** from Settings per `SPEC.md`.
- [x] **Community Supabase table** + Share to Community button on MealDetail
- [x] **Community browse section** in Browse tab + `community_recipe_cache` user DB table (migration 007)
- [x] **GitHub Actions weekly export** cron → `community-recipes-export.json` + `scripts/export-community-recipes.js`
- [ ] **`recipe_tag_rules` + `recipe_bucket_membership`** in bundled DB + ETL update — deferred
- [x] **OTA sidecar** `assets/recipe_tag_overrides.json` + migration 008 `recipe_tag_overrides` table
- [x] **`user_recipe_tags`** table — shipped in migration 006
- [x] **Privacy policy** — `forkit/privacy-policy.md`; app.json bundle IDs added (`com.forkit.mobile`)
- [ ] Store listing assets (icon, screenshots, description) — owner-driven
- [ ] **Test matrix** (offline flights, sync conflict spot checks, API rate-limit behavior).
- [ ] **App Store / Play** submission (owner-driven).

---

## Phase 7: Polish, navigation & history — complete ✓

- [x] **Discover tab** replaces Search tab; Search moved to stack screen (pushed from Browse 🔍 icon)
- [x] **Visual auth indicator** — green dot on ⚙️ gear icon in Browse + Home headers when signed in
- [x] **UX fixes**: raw DB error → friendly message; GroceryList Done → Home tab; questionnaire empty → "Try different filters"
- [x] **Past grocery lists** screen — `PastGroceryListsScreen`, wired in Settings → Data
- [x] **Dead code** — `MenuScreen.tsx` deleted
- [ ] **CSV import** — `expo-document-picker`, Settings import row — deferred
- [ ] **Data-driven Browse buckets** (`recipe_tag_rules` + `recipe_bucket_membership` in bundled DB ETL) — deferred
- [ ] **YouTube → Recipe** extraction (Supabase Edge Function) — deferred (tracked as future premium feature)

---

## Phase 8: Community bundle — complete ✓

- [x] **ExtractIt** (`forkit-secrets/extractit/`) — Node.js CLI that fetches YouTube transcripts via innertube API, extracts recipes with Claude Haiku, outputs CSV. Run: `node extract.js`. Config: `config.yaml`.
- [x] **`scripts/build-community-db.js`** — reads all CSVs from `forkit-secrets/extractit/output/`, builds `assets/community.bundle.sqlite` (same schema as main bundle + attribution columns).
- [x] **`assets/community.bundle.sqlite`** — 17 AllRecipes recipes, `content_version 1.0.0`.
- [x] **`src/db/communityBundled.ts`** — open/version-check mirror of `bundled.ts`.
- [x] **`DatabaseContext`** — opens `communityDb` in parallel; `useCommunityDb()` hook.
- [x] **`resolveRecipe`** — `'community_bundle'` source type added; optional `communityDb` param.
- [x] **BrowseScreen** — "AllRecipes Picks" horizontal bucket from `communityDb`; navigates with `source: 'community_bundle'`.
- [x] **MealDetailScreen** — passes `communityDb` to `resolveRecipe`.

---

## Future (non-blocking)

- [ ] **Browse pill customization in Settings** — let users reorder or swap the 6 browse filter pills (Quick, Healthy, Comfort, Meatless, Global, Low Carb) for personal preference. Store order/selection in `app_kv`. Defer until Settings screen exists (Phase 5b). See `priorities.md` core tenets: Healthy is always a default pill and cannot be removed.
- [ ] **Editorial "Kitchen" buckets (Browse Option D)** — curated collections that map multiple cuisine+category combinations into hero cards with editorial descriptions (e.g. "Quick Weeknight", "Comfort Food"); fold in once recipe volume increases or Spoonacular tags enable richer filtering. Pill accuracy for "Healthy" and "Low Carb" also improves with Spoonacular `healthScore`/carb enrichment — plan that pass before promoting these pills as accurate.
- [ ] **Realtime collaboration** on top of synced documents (Firestore listeners, Supabase Realtime, or self-hosted WS)—see `SPEC.md` household section.
- [ ] **Google Sheets → import** pipeline for custom recipes (post-v1).
- [ ] **"What can I make with this ingredient?"** (medium priority) — reverse ingredient lookup: tap any ingredient on GroceryList or MealDetail to see all recipes it appears in.
  - **DB decision:** No new field needed. Query `recipes.ingredients_text LIKE '%<keyword>%'` at runtime — zero schema changes, sub-millisecond on local SQLite at current scale (~598 recipes). Upgrade to ETL index table later if precision becomes a complaint.
  - **Keyword extraction:** Strip leading quantity + unit from `line_text` via regex before the LIKE query (e.g. `"1 cup flour"` → `"flour"`). No NLP needed.
  - **Entry points:** `MealDetailScreen` ingredient lines (currently static `<Text>`) + `GroceryListScreen` ingredient text (currently checkbox-only).
  - **UI:** Bottom sheet titled "Recipes with [ingredient]" — same card style as Search results; excludes recipes cooked in last 7 days; limit 30; navigate to MealDetail on tap.
  - **Scope:** Bundled + community bundle recipes only (`ingredients_text` exists on both). Custom recipes excluded.
- [x] **Past grocery lists / order history** — shipped in Phase 7; `PastGroceryListsScreen` reads `checkout_events`.
- [ ] Features marked **proposed** in `SPEC.md` (weekly planner, budget themes, share sheet enhancements, skill tags).
