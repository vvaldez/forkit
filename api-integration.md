# ForkIt — API integration reference

Companion to [`SPEC.md`](./SPEC.md) and [`schema.md`](./schema.md). Documents external HTTP APIs the mobile app may call, request/response expectations, mapping into the app’s canonical recipe model, offline behavior, keys, and errors.

---

## Canonical base URL

| API | Base URL |
|-----|----------|
| TheMealDB | `https://www.themealdb.com/api/json/v1/1` |

TheMealDB **v1** path uses `/api/json/v1/1` (no API key in URL for the public free tier).

---

## TheMealDB — endpoints used (v1)

All responses are JSON with a top-level `meals` key: either an **array** of meal objects or **`null`** when empty. Always branch on `meals == null` before indexing.

### 1. Random meal

- **URL:** `GET {BASE}/random.php`
- **Returns:** `{ "meals": [ { ...single meal... } ] }` or `{ "meals": null }` on rare failure.
- **Use:** “Surprise me” / ForkIt random batch when **online** and not reading from bundled DB only.
- **Mobile note:** The legacy web app requested **multiple** random meals by firing **parallel** `random.php` requests (`count` times). That maximizes variety but increases battery and data use. Acceptable for explicit user action; consider **sequential** or **capped concurrency** (e.g. 3 at a time) on cellular. **Offline:** use bundled SQLite random selection instead—no network call.

### 2. Search by name

- **URL:** `GET {BASE}/search.php?s={query}`
- **Encoding:** `encodeURIComponent` on `query`.
- **Returns:** `{ "meals": [ ... ] }` or `{ "meals": null }` if no hits.
- **Use:** Search screen live API leg when online.

### 3. Filter list (ids only) + lookup (full detail)

The filter endpoint returns **abbreviated** meal objects (typically `strMeal`, `strMealThumb`, `idMeal` only). Full ingredients/instructions require **per-id lookup**.

| Filter type | URL pattern |
|-------------|-------------|
| By category | `GET {BASE}/filter.php?c={category}` (e.g. `Seafood`) |
| By area (cuisine) | `GET {BASE}/filter.php?a={area}` (e.g. `Canadian`) |
| By main ingredient | `GET {BASE}/filter.php?i={ingredient}` (e.g. `chicken_breast`) — spaces often as `_` per API docs |

**Lookup full meal:**

- **URL:** `GET {BASE}/lookup.php?i={idMeal}`
- **Returns:** `{ "meals": [ { ...full meal... } ] }` or null.

**Recommended client flow (parity with legacy `filterAndLookup`):**

1. `filter.php` with limit N (e.g. slice first 12 `idMeal` values).
2. For each id, `lookup.php?i=` (legacy used `Promise.all` — **fan-out**). On mobile, **throttle** concurrent lookups (e.g. max 4) to avoid spikes; **cache** results in optional `api_recipe_cache` per [`schema.md`](./schema.md).

### 4. Error handling

- Network failure, timeout, non-200: return empty list to UI; **do not** crash. Log internally / crash reporting only.
- Malformed JSON: treat as failure, empty list.
- **Offline:** skip TheMealDB entirely; search layer uses bundled + local user recipes only.

---

## Field mapping — TheMealDB meal → app / `schema.md` (`recipes` + `recipe_ingredients`)

Meal object fields follow TheMealDB naming (`strMeal`, `idMeal`, `strIngredient1` … `strIngredient20`, `strMeasure1` … `strMeasure20`, etc.).

| App / schema field | TheMealDB source | Rules |
|--------------------|------------------|--------|
| `id` | `idMeal` | Required string. |
| `name` | `strMeal` | |
| `description` | _(none)_ | Empty string acceptable for v1. |
| `cuisine_area` | `strArea` | |
| `category_raw` | `strCategory` | e.g. Beef, Chicken, Dessert. |
| `dietary_tags` | `strTags` | As returned (may be null/empty). |
| `meal_time_bucket` | Derived from `strCategory` | Rule (apply in order, case-insensitive trim): `breakfast` → `Breakfast`. `pasta`, `vegetarian`, `vegan` → `Lunch`. `dessert`, `starter`, `side`, `miscellaneous` → `Snacks`. Everything else → `Dinner`. **Bundled ETL and live API mapping must use identical rules.** |
| `protein_display` | `strCategory` | v1: mirror raw category for filter parity with old `protein_type` field. |
| `youtube_url` | `strYoutube` | May be empty. |
| `image_url` | `strMealThumb` | |
| `instructions` | `strInstructions` | |
| `ingredients_text` | `strIngredient{i}` + `strMeasure{i}` | For each i in 1..20: if ingredient non-empty after trim, line = `trim(measure) + " " + trim(ingredient)` trimmed; join segments with `"; "` for denormalized string (legacy `Recipe.ingredients`). |
| `recipe_ingredients.line_text` | Same pairs | One row per non-empty ingredient line; `sort_order` = i. |
| Nutritional numeric strings | _(none in API)_ | Leave NULL / empty in schema reserved columns. |

**Bundled ETL** must apply the identical `meal_time_bucket` rules above so offline rows match online API mapping. The `Lunch` bucket is produced by Pasta, Vegetarian, and Vegan categories — these are the only TheMealDB categories that reliably represent lighter midday meals. All four buckets (`Breakfast`, `Lunch`, `Dinner`, `Snacks`) will have non-zero rows in the bundled DB.

---

## USDA FoodData Central (ingredient validation, v1)

**Purpose:** Optional **non-blocking** validation when the device is **online** ([`SPEC.md`](./SPEC.md): soft warning, user can still save).

**Official docs:** [https://fdc.nal.usda.gov/api-guide.html](https://fdc.nal.usda.gov/api-guide.html)

**Typical flows (high level — exact paths follow current USDA API version):**

1. **Search foods** — text query from user ingredient line → list of foods with `fdcId`.
2. **Food detail** — `fdcId` → nutrients / description for display or stored `usda_fdc_id` on `user_recipe_ingredients`.

**API key:** User obtains a **free** Data.gov key for FDC; stored only in **secure device storage** (Keychain / Keystore / platform vault), never in repo or plain backup.

**Rate limits:** Respect USDA guidance; debounce validation calls (e.g. 300–500 ms after typing stops); cache `fdcId` per normalized ingredient string in a small local LRU.

**Offline:** validation skipped; `usda_fdc_id` and `validation_warning` unchanged unless cleared by user.

---

## Optional APIs (post-v1 or power user)

| API | Role | Keys |
|-----|------|------|
| Spoonacular | Richer search / ingredient fallback | User-supplied; secure storage |
| Edamam | Recipe / nutrition search | User-supplied; secure storage |

Document endpoints when first integrated in a revision of this file. Until then, **no hard dependency** in v1 core flows.

---

## Offline detection & fallback

| State | Behavior |
|-------|----------|
| No route / airplane | Treat as offline; TheMealDB and USDA not called. |
| Timeout / DNS failure | Same as offline for that request; show inline “Can’t reach network” where relevant. |
| Search | Merge: **local bundled FTS + user_recipes** first; if online, merge API results and **de-dupe** by `(name normalized, ingredients fingerprint)` per [`SPEC.md`](./SPEC.md); boost custom matches. |

---

## Retries & backoff

- **Idempotent GETs:** safe to retry with exponential backoff (e.g. 0.5s, 1s, 2s) max 2 retries for filter+lookup storms.
- **Do not** retry endlessly on 4xx (except 429 — respect `Retry-After` if present, else backoff).

---

## Security

- **Never** embed API keys in source, bundled assets, or **this public docs repo**. Follow the umbrella [`SECURITY.md`](../SECURITY.md): optional keys (USDA, Spoonacular, Edamam) belong in **secure device storage** at runtime and in **[`forkit-secrets/`](../forkit-secrets/README.md)** on your machine for local dev notes — not in committed Markdown.
- **TheMealDB** public tier: no secret in URL.
- **USDA / Spoonacular / Edamam:** read from secure storage into memory only for request construction; clear from logs and crash reports.

---

## Version history (this document)

| Doc version | Notes |
|-------------|--------|
| 1 | Initial Phase 0 companion; TheMealDB parity with legacy `recipes.ts`. |
| 2 | Added Lunch bucket rule (pasta, vegetarian, vegan → Lunch); noted all four buckets will have non-zero bundled rows. |
