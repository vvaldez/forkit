# ForkIt — bundled recipe database sourcing

Companion to [`SPEC.md`](./SPEC.md) and [`schema.md`](./schema.md). Describes how the **read-only bundled** SQLite asset is produced, licensed, updated, and shipped with the mobile app.

---

## 1. Goals

- Ship a **self-contained** offline catalog so Home, random discovery, and local search work **without network**.
- Keep **legal clarity**: only bundle data whose license permits redistribution inside an app binary.
- Match **TheMealDB field semantics** where the catalog is derived from TheMealDB so [`api-integration.md`](./api-integration.md) mapping rules apply consistently online and offline.

---

## 2. Primary source (v1): TheMealDB as starter pack

**TheMealDB** (~598 meals) is the **starter pack** — the initial offline catalog that ships with the app. It is not the long-term variety ceiling; user-added recipes are the primary growth path (see [`SPEC.md` § Custom recipes & "HomeCook"](./SPEC.md#custom-recipes--homecook)).

Verify [TheMealDB's license/terms](https://www.themealdb.com/api.php) before each release for any change. Supporter status may be required for commercial app store use.

**Approach:**

1. **Export** a snapshot of meals (categories, areas, full meal details via `lookup.php` or bulk export scripts maintained in the mobile app build repo).
2. **Normalize** each meal into [`schema.md`](./schema.md) `recipes` + `recipe_ingredients` rows using the **same** `meal_time_bucket` rules as live API mapping.
3. **Write** `recipes.bundle.sqlite` with `bundle_meta` (`content_version`, `attribution` text crediting TheMealDB).
4. **Bundle** the file as an RN/Expo asset copied at build time.

**Catalog size:** ~598 meals at current TheMealDB free tier. Images stored as URLs only (network load when online) to keep bundle size small. Offline thumbnails are a future option if bundle size budget allows.

---

## 3. Alternative / supplemental sources

| Source | Role | Caution |
|--------|------|--------|
| Kaggle Recipe1M+ etc. | Larger variety | License per dataset; heavy ETL |
| Curated manual JSON | Editorial control | Labor cost |

Any non-TheMealDB source must still map into the same `recipes` / `recipe_ingredients` schema.

---

## 4. ETL pipeline (conceptual)

1. **Ingest** raw meal JSON.
2. **Validate** required fields (`id`, `name`, at least one ingredient or instructions).
3. **Transform** → `meal_time_bucket`, `ingredients_text`, ingredient rows.
4. **Dedupe** by `id`.
5. **FTS** optional build step creating FTS5 virtual table statements in same sqlite.
6. **Output** single `.sqlite` file + `content_version` semver.

---

## 5. Rebuild & release cadence

- **Per app store release** when recipes need refresh, or **quarterly** maintenance—whichever product prefers.
- **Changelog:** bump `bundle_meta.content_version`; mention in app release notes (“500 new recipes”).

---

## 6. Licensing & attribution

- Store `bundle_meta.attribution` with required text (e.g. “Meal data © TheMealDB …”).
- In-app **Settings → About** should surface the same string plus links where required.

---

## 7. Open decisions

- Maximum bundle size acceptable for cellular download of app update.
- Whether to include **only** English-language meals or multi-language rows (TheMealDB supports multiple str fields in some variants—confirm API version used).

---

## 8. Security (ETL and keys)

If build-time ETL calls APIs that require keys, supply them via environment variables or **[`forkit-secrets/`](../forkit-secrets/README.md)** — never commit real keys into **`forkit/`** or public tooling ([`../SECURITY.md`](../SECURITY.md)).

---

## Version history (this document)

| Doc version | Notes |
|-------------|--------|
| 1 | Initial Phase 0 companion. |
