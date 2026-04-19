# ForkIt — database schema (SQLite)

Companion to [`SPEC.md`](./SPEC.md). Defines the **bundled** (read-only) and **user** (read-write) SQLite databases for the mobile app. Implementation may use one connection with `ATTACH DATABASE` or two files; **foreign keys cannot span unattached files**, so cross-database references are **logical** (`source` + `recipe_key` pattern).

---

## Conventions

- **Privacy:** User tables may hold personal notes and household data. Treat app backups and exports per your own policy; this document defines structure only — **no real credentials or secrets** in committed artifacts ([`../SECURITY.md`](../SECURITY.md)).
- **Timestamps:** `INTEGER` Unix milliseconds (UTC) unless noted.
- **IDs:** `TEXT` UUIDs (lowercase) for user-generated rows; **external recipe ids** (e.g. TheMealDB `idMeal`) remain `TEXT` as returned by the API.
- **Recipe identity (logical):** A recipe anywhere in the app is addressed by **`(source, recipe_key)`** where:
  - `source` ∈ `bundled` | `api` | `custom`
  - `recipe_key` = bundled/API external id, or `user_recipes.id` for custom.
- **Migrations (user DB):** Table `schema_migrations` with a single row `version INTEGER PRIMARY KEY` applied monotonically. App code runs sequential migration scripts on startup.
- **Bundled DB updates:** Shipped as a replaceable app asset (`recipes.bundle.sqlite` or similar). **No in-app migration** of bundled schema required if version bumps replace the whole file; document bundled `schema_version` in a `meta` table inside the bundle.

---

## A. Bundled database (read-only)

Opened with immutable or read-only flags. Populated at build time per [`recipe-sources.md`](./recipe-sources.md).

### Table: `bundle_meta`

| Column | Type | Notes |
|--------|------|--------|
| `key` | TEXT PK | e.g. `schema_version`, `content_version`, `attribution` |
| `value` | TEXT | Version string or JSON snippet |

### Table: `recipes`

Canonical offline catalog row. Maps to the same **conceptual** fields as API-mapped recipes in [`api-integration.md`](./api-integration.md).

| Column | Type | Notes |
|--------|------|--------|
| `id` | TEXT PK | Stable id from source (e.g. TheMealDB `idMeal`). |
| `name` | TEXT NOT NULL | |
| `description` | TEXT | Short blurb; may be empty. |
| `cuisine_area` | TEXT | Maps from TheMealDB `strArea`. |
| `category_raw` | TEXT | Original `strCategory` (e.g. Beef, Dessert). |
| `dietary_tags` | TEXT | Pipe- or comma-separated tags if present (`strTags`). |
| `meal_time_bucket` | TEXT NOT NULL | `Breakfast` \| `Lunch` \| `Dinner` \| `Snacks` — **must** follow bucketing rules in `api-integration.md` (parity with legacy `toMealTimeBucket`). |
| `protein_display` | TEXT | UX-facing protein/theme label; v1 may mirror `category_raw` or derived facet. |
| `youtube_url` | TEXT | |
| `image_url` | TEXT | |
| `instructions` | TEXT | |
| `ingredients_text` | TEXT | Denormalized `"; "` join for fast display + FTS; optional if only `recipe_ingredients` used. |
| `cook_time_min` | INTEGER NULL | If unknown from source, NULL. |
| `servings` | TEXT NULL | Free text or small int as string. |
| `calories_per_serving` | TEXT NULL | Reserved for future nutrition. |
| `protein_grams` | TEXT NULL | Reserved. |
| `fat_grams` | TEXT NULL | Reserved. |
| `carb_grams` | TEXT NULL | Reserved. |

**Indexes:** `CREATE INDEX idx_recipes_cuisine ON recipes(cuisine_area);`, `CREATE INDEX idx_recipes_meal_bucket ON recipes(meal_time_bucket);`, optional **FTS5** virtual table on `name`, `ingredients_text`, `instructions` (implementation choice).

### Table: `recipe_ingredients`

Normalized lines for grocery dedupe, future nutrition, and optional USDA id attachment.

| Column | Type | Notes |
|--------|------|--------|
| `id` | INTEGER PK AUTOINCREMENT | |
| `recipe_id` | TEXT NOT NULL | FK → `recipes.id` **within bundled DB only**. |
| `sort_order` | INTEGER NOT NULL | 1-based line order. |
| `line_text` | TEXT NOT NULL | Single line as shown to user (`"1 cup Rice"`). |
| `quantity` | TEXT NULL | Parsed later optional. |
| `unit` | TEXT NULL | Parsed later optional. |
| `usda_fdc_id` | INTEGER NULL | Populated only if ETL enriches. |

**Index:** `CREATE INDEX idx_ri_recipe ON recipe_ingredients(recipe_id, sort_order);`

---

## B. User database (read-write)

### Table: `schema_migrations`

| Column | Type | Notes |
|--------|------|--------|
| `version` | INTEGER PK | Monotonic migration id. |

### Table: `app_kv`

Key-value preferences (string payloads, often JSON).

| Column | Type | Notes |
|--------|------|--------|
| `key` | TEXT PK | e.g. `questionnaire_last_filters`, `delivery_markup_default`, `leftovers_window_days`. |
| `value` | TEXT NOT NULL | |

### Table: `favorites`

| Column | Type | Notes |
|--------|------|--------|
| `id` | INTEGER PK AUTOINCREMENT | |
| `source` | TEXT NOT NULL | `bundled` \| `api` \| `custom`. |
| `recipe_key` | TEXT NOT NULL | External id or `user_recipes.id`. |
| `saved_at` | INTEGER NOT NULL | |
| `updated_at` | INTEGER NOT NULL DEFAULT 0 | Added migration 004; required for sync LWW. |
| `is_deleted` | INTEGER NOT NULL DEFAULT 0 | Added migration 004; soft-delete for sync. |
| **UNIQUE** | (`source`, `recipe_key`) | |

**Index:** `saved_at` for “recent favorites” if needed.

### Table: `user_recipes`

Custom recipes (`source = custom`).

| Column | Type | Notes |
|--------|------|--------|
| `id` | TEXT PK | UUID. |
| `name` | TEXT NOT NULL | |
| `cuisine` | TEXT | |
| `dietary_tags` | TEXT | Optional multi-tag string. |
| `instructions` | TEXT NOT NULL | |
| `cook_time_min` | INTEGER NULL | |
| `servings` | TEXT NULL | |
| `youtube_url` | TEXT | |
| `image_local_uri` | TEXT NULL | App-scoped file path or content URI. |
| `notes` | TEXT NULL | |
| `created_at` | INTEGER NOT NULL | |
| `updated_at` | INTEGER NOT NULL | |
| `is_deleted` | INTEGER NOT NULL DEFAULT 0 | Added migration 004; soft-delete for sync. |
| `published_community_id` | TEXT NULL | Added migration 006; UUID of remote `community_recipes` row if shared. |
| `author_display_name` | TEXT NULL | Added migration 006; denormalized author label set at publish time. |

### Table: `user_recipe_ingredients`

| Column | Type | Notes |
|--------|------|--------|
| `id` | INTEGER PK AUTOINCREMENT | |
| `user_recipe_id` | TEXT NOT NULL | Logical FK → `user_recipes.id`. |
| `sort_order` | INTEGER NOT NULL | |
| `line_text` | TEXT NOT NULL | User-entered line. |
| `usda_fdc_id` | INTEGER NULL | Set when validation matches. |
| `validation_warning` | TEXT NULL | Soft warning message; save still allowed. |

**Index:** `(user_recipe_id, sort_order)`.

### Table: `meal_history` (“I made this”)

| Column | Type | Notes |
|--------|------|--------|
| `id` | INTEGER PK AUTOINCREMENT | |
| `source` | TEXT NOT NULL | `bundled` \| `api` \| `custom`. |
| `recipe_key` | TEXT NOT NULL | |
| `recipe_name` | TEXT NOT NULL | Denormalized name for display without re-resolving. |
| `cooked_at` | INTEGER NOT NULL | |
| `servings` | INTEGER NULL | |
| `notes` | TEXT NULL | |
| `updated_at` | INTEGER NOT NULL DEFAULT 0 | Added migration 004; required for sync LWW. |
| `is_deleted` | INTEGER NOT NULL DEFAULT 0 | Added migration 004; soft-delete for sync. |

**Indexes:** `cooked_at DESC` for variety exclusions and leftovers.

### Table: `leftovers`

Rows represent **trackable leftover items** derived from history or manual entry (SPEC: name, quantity, freshness).

| Column | Type | Notes |
|--------|------|--------|
| `id` | TEXT PK | UUID. |
| `name` | TEXT NOT NULL | Display label. |
| `quantity` | TEXT NULL | Free text (e.g. “2 servings”). |
| `created_at` | INTEGER NOT NULL | |
| `expires_at` | INTEGER NULL | Hint for UI. |
| `source_meal_history_id` | INTEGER NULL | Logical link to `meal_history.id` if created from a cook event. |
| `source` | TEXT NULL | Added migration 003; recipe source for chip → MealDetail navigation. |
| `recipe_key` | TEXT NULL | Added migration 003; recipe key for chip → MealDetail navigation. |
| `hidden` | INTEGER NOT NULL DEFAULT 0 | 1 = dismissed from board. |
| `updated_at` | INTEGER NOT NULL | Required for LWW conflict resolution during sync. |
| `is_deleted` | INTEGER NOT NULL DEFAULT 0 | Added migration 004; soft-delete for sync. |

### Table: `cart_lines`

Current cart for grocery checkout. **Attribution** for household: optional `member_id` referencing `household_members.id` (NULL = current device user / anonymous).

| Column | Type | Notes |
|--------|------|--------|
| `id` | TEXT PK | UUID. |
| `source` | TEXT NOT NULL | |
| `recipe_key` | TEXT NOT NULL | |
| `quantity` | INTEGER NOT NULL DEFAULT 1 | Servings / copies of meal card. |
| `member_id` | TEXT NULL | FK → `household_members.id`. |
| `added_at` | INTEGER NOT NULL | |
| `updated_at` | INTEGER NOT NULL | |
| `is_deleted` | INTEGER NOT NULL DEFAULT 0 | Added migration 004; soft-delete for sync. |

**Index:** `(member_id, source, recipe_key)` for merges.

### Table: `checkout_events`

Optional normalized log for savings and history; alternatively store only aggregates in `app_kv`.

| Column | Type | Notes |
|--------|------|--------|
| `id` | TEXT PK | **UUID** — caller must generate (e.g. `nanoid()` or `crypto.randomUUID()`). No DEFAULT; missing id will fail insertion. |
| `checked_out_at` | INTEGER NOT NULL | |
| `estimated_delivery_total` | REAL NULL | |
| `estimated_home_total` | REAL NULL | |
| `saved_total` | REAL NULL | |
| `payload_json` | TEXT NULL | Snapshot of line ids for by-meal grocery replay. |

### Table: `savings_totals`

| Column | Type | Notes |
|--------|------|--------|
| `id` | INTEGER PK CHECK (id = 1) | Single row table pattern. |
| `lifetime_saved_usd` | REAL NOT NULL DEFAULT 0 | |
| `updated_at` | INTEGER NOT NULL | |

### Table: `household_members`

Local roster for display and cart attribution. Synced per [`sync-protocol.md`](./sync-protocol.md).
Rebuilt in migration 004 — schema below reflects actual DDL.

| Column | Type | Notes |
|--------|------|--------|
| `id` | TEXT PK | UUID. |
| `household_id` | TEXT NOT NULL | Shared opaque id from sync backend. |
| `user_id` | TEXT NULL | Supabase `auth.users.id` once linked. |
| `display_name` | TEXT NOT NULL | |
| `role` | TEXT NOT NULL DEFAULT ‘member’ | `owner` or `member`; enforced in app code. |
| `joined_at` | INTEGER NOT NULL | |
| `updated_at` | INTEGER NOT NULL | LWW sync field. |
| `is_deleted` | INTEGER NOT NULL DEFAULT 0 | Soft-delete for sync. |

**Index:** `household_id` (filtered on `is_deleted = 0`).

### Table: `sync_device`

Registration record for this install. Rebuilt in migration 006.

| Column | Type | Notes |
|--------|------|--------|
| `id` | TEXT PK | UUID generated on first register. |
| `device_name` | TEXT NOT NULL | Human-readable (e.g. "iPhone 15"). |
| `platform` | TEXT NOT NULL | `ios` \| `android`. |
| `registered_at` | INTEGER NOT NULL | |
| `last_seen_at` | INTEGER NOT NULL | Updated on each app foreground. |

### Table: `sync_outbox`

Write-ahead log for changes pending push to remote. Created in migration 004.

| Column | Type | Notes |
|--------|------|--------|
| `id` | TEXT PK | UUID. |
| `table_name` | TEXT NOT NULL | e.g. `favorites`, `user_recipes`. |
| `row_id` | TEXT NOT NULL | PK of the changed row. |
| `operation` | TEXT NOT NULL | `upsert` or `delete`. |
| `payload` | TEXT NOT NULL | JSON snapshot of the row at write time. |
| `status` | TEXT NOT NULL DEFAULT ‘pending’ | `pending` \| `inflight` \| `failed`. |
| `created_at` | INTEGER NOT NULL | |
| `attempts` | INTEGER NOT NULL DEFAULT 0 | |

**Index:** `(status, created_at)` for flush ordering.

### Table: `saved_recipe_snapshots`

Full copy of a bundled or API recipe written once (INSERT OR IGNORE) at the moment the user first favorites or cooks it. Ensures favorites and meal history remain resolvable if the bundled DB is later rebuilt and the recipe is removed. Created in migration 005.

| Column | Type | Notes |
|--------|------|--------|
| `id` | TEXT PK | Matches `recipe_key`. |
| `source` | TEXT NOT NULL | `bundled` \| `api`. |
| `recipe_key` | TEXT NOT NULL | External recipe id. |
| `name` | TEXT NOT NULL | |
| `description` | TEXT NULL | |
| `cuisine_area` | TEXT NULL | |
| `category_raw` | TEXT NULL | |
| `dietary_tags` | TEXT NULL | |
| `meal_time_bucket` | TEXT NOT NULL | |
| `protein_display` | TEXT NULL | |
| `youtube_url` | TEXT NULL | |
| `image_url` | TEXT NULL | |
| `instructions` | TEXT NULL | |
| `ingredients_text` | TEXT NULL | |
| `cook_time_min` | INTEGER NULL | |
| `servings` | TEXT NULL | |
| `snapshotted_at` | INTEGER NOT NULL | |
| `updated_at` | INTEGER NOT NULL | |
| **UNIQUE** | (`source`, `recipe_key`) | One snapshot per recipe; never overwritten. |

**Index:** `(source, recipe_key)`.

### Table: `user_recipe_tags`

Bucket/tag membership for custom and community recipes. Created in migration 006.

| Column | Type | Notes |
|--------|------|--------|
| `recipe_key` | TEXT NOT NULL | FK → `user_recipes.id`. |
| `tag` | TEXT NOT NULL | Bucket slug (e.g. `tonightIn30`, `healthy`). |
| `created_at` | INTEGER NOT NULL | |
| **PRIMARY KEY** | (`recipe_key`, `tag`) | |

### Table: `community_recipe_cache`

Local cache of community recipes fetched from remote Supabase. TTL = 24 hours. Created in migration 007.

| Column | Type | Notes |
|--------|------|--------|
| `id` | TEXT PK | UUID (local cache row id). |
| `community_id` | TEXT NOT NULL | Remote `community_recipes.id` (UUID). |
| `name` | TEXT NOT NULL | |
| `description` | TEXT NULL | |
| `cuisine_area` | TEXT NULL | |
| `dietary_tags` | TEXT NULL | |
| `meal_time_bucket` | TEXT NOT NULL | |
| `instructions` | TEXT NULL | |
| `ingredients_text` | TEXT NULL | |
| `cook_time_min` | INTEGER NULL | |
| `servings` | TEXT NULL | |
| `image_url` | TEXT NULL | |
| `youtube_url` | TEXT NULL | |
| `author_user_id` | TEXT NOT NULL | Remote Supabase user id. |
| `author_display_name` | TEXT NOT NULL | |
| `flag_count` | INTEGER NOT NULL DEFAULT 0 | Recipes with `flag_count >= 5` hidden client-side. |
| `cached_at` | INTEGER NOT NULL | Unix ms; stale after 24 hrs. |
| **UNIQUE** | (`community_id`) | |

**Index:** `cached_at DESC`.

---

### Table: `api_recipe_cache`

Stores previously fetched API recipe payloads for offline display after first view. Populated lazily; never synced.

| Column | Type | Notes |
|--------|------|-------|
| `recipe_key` | TEXT PK | TheMealDB `idMeal` or equivalent external id. |
| `payload_json` | TEXT NOT NULL | Full mapped recipe JSON (same shape as `recipes` row + ingredient lines). |
| `fetched_at` | INTEGER NOT NULL | Unix ms; use for cache eviction if size grows. |

---

## CSV import format

Used by the v1 CSV import feature (SPEC Feature 3.8). Importers must accept this exact header row; unknown columns are ignored.

| Column header | Required | Maps to | Notes |
|---------------|----------|---------|-------|
| `name` | Yes | `user_recipes.name` | |
| `ingredients` | Yes | `user_recipe_ingredients.line_text` (split on `\|`) | Pipe-separated lines, e.g. `1 cup rice\|2 tbsp oil` |
| `instructions` | Yes | `user_recipes.instructions` | Multi-line OK; newlines preserved |
| `cuisine` | No | `user_recipes.cuisine` | Free text |
| `dietary_tags` | No | `user_recipes.dietary_tags` | Comma-separated |
| `cook_time_min` | No | `user_recipes.cook_time_min` | Integer string; ignored if non-numeric |
| `servings` | No | `user_recipes.servings` | Free text |
| `youtube_url` | No | `user_recipes.youtube_url` | |
| `notes` | No | `user_recipes.notes` | |

**Duplicate handling:** if a row's `name` exactly matches an existing `user_recipes.name`, the importer skips it and logs a warning — no silent overwrite.

---

## CSV export (logical view)

Export rows do not require a separate table; build from `favorites`, `user_recipes` (+ ingredients), and optionally bundled/API resolution for display names. Column set matches the CSV import format above plus `source` and `date_saved`.

---

## Implementation notes

1. **Resolve recipe display:** Join `favorites` / `cart_lines` to bundled DB for `bundled`, to TheMealDB lookup or cache for `api` if not in bundle, and to `user_recipes` for `custom`.
2. **API cache (optional):** Add table `api_recipe_cache` (`recipe_key` PK, `payload_json`, `fetched_at`) if offline display of previously fetched API meals is required without re-fetch.
3. **FTS:** If FTS5 is used on user DB for custom recipe search, mirror fields from `user_recipes` + ingredient lines.

---

## Version history (this document)

| Doc version | Notes |
|-------------|--------|
| 1 | Initial Phase 0 companion. |
| 2 | Added `updated_at` to `leftovers`; UUID note to `checkout_events.id`; `api_recipe_cache` table; CSV import column mapping table. |
| 3 | Synced to migrations 003–007: `leftovers` source/recipe_key columns; soft-delete (`is_deleted`) on 5 tables; rebuilt `household_members` and `sync_outbox`; new `sync_device`, `saved_recipe_snapshots`, `user_recipe_tags`, `community_recipe_cache` tables; community columns on `user_recipes`. |
