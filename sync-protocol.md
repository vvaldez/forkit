# ForkIt — sync layer protocol

Companion to [`SPEC.md`](./SPEC.md) § Household coordination & sync and [`schema.md`](./schema.md). Defines the **logical sync contract** with **user-supplied Supabase as the canonical v1 backend**, while keeping room for optional adapter parity later (Firebase, self-hosted REST) without rewriting core app logic.

**v1 posture:** App is **local-only by default.** Household sync is opt-in: the user supplies their own Supabase project URL + anon key in Settings. Within that project, identity uses **email magic-link auth + household invites**.

**Auth offline contract:** Sync requires auth. Core app functionality (browse, search, questionnaire, cart, grocery list, history, leftovers, custom recipes) must never be gated on auth state. Expired sessions or offline states queue sync and surface status in Settings; they never block the local UX or clear local data.

---

## 1. What syncs (v1 payload)

These entities are **eligible** for bidirectional sync when household sharing is enabled. All use logical recipe keys per `schema.md`.

| Entity | Scope | Notes |
|--------|--------|--------|
| `favorites` | Per household | `source` + `recipe_key` + `saved_at`. |
| `user_recipes` + `user_recipe_ingredients` | Per household | Full custom recipe content. |
| `meal_history` | Per household | Cooking log. |
| `leftovers` | Per household | Active rows; `hidden` flag syncs. |
| `cart_lines` | Per household | Enables merged grocery + **attribution** (`member_id`). |
| `household_members` | Per household | Roster for display and `member_id` integrity. |
| `savings_totals` | Per household | Single aggregate row; optional per-device then merge—**recommend** one household row. |
| `checkout_events` | Optional v1 | Include if “shared ledger” desired; else device-local only—**recommend sync** for transparency. |
| `app_kv` | Selective | Only keys needed cross-device (e.g. `leftovers_window_days`, `delivery_markup_default`). **Exclude** device-specific secrets. |

**Device-local only (not synced by default):** secure vault copies of API keys, OS-specific prefs, debug flags.

---

## 2. Identity

- **Auth identity:** Supabase Auth user id (`auth.uid`) from email magic-link sign-in, within the user's own Supabase project.
- **No auth required for local use:** `device_id` and local `household_members` rows exist regardless of auth state. Auth is only required to push/pull with the remote Supabase project.
- **Invite flow:** Household owner generates invite code/link; recipient signs in and joins `household_id`.
- **`device_id`:** Stable UUID created on first launch (`sync_device.device_id`) for outbox/retry telemetry. Present even in local-only mode.
- **`household_id`:** Shared opaque id or UUID for the household boundary. NULL when sync is not configured.
- **`member_id`:** Equals `household_members.id` for humans; each signed-in user has one canonical member row. Unauthenticated users have a device-local member row with `is_self = 1` for local cart attribution.

---

## 3. Conflict resolution

**Default policy:** **Last-write-wins (LWW)** per document/row using **`updated_at` monotonic clock** (server timestamp preferred when available).

- Each syncable row carries `updated_at` (INTEGER ms) and optional `updated_by_device_id`.
- On push: if remote `updated_at` > local, **server wins** unless local has un-pushed pending changes flagged in `sync_outbox`—then **surface conflict UI** (rare): “Keep mine” / “Use theirs” for that document.

**Custom recipes:** LWW on `user_recipes` row as a whole; ingredient list replaced atomically on loss to avoid torn reads.

**Future:** optional CRDT / merge for cart lines (not required v1).

---

## 4. Triggers & frequency

- On **app foreground** (debounced 2s): pull then push pending outbox.
- On **local mutation** of sync-eligible table: enqueue `sync_outbox` row; debounced push (e.g. 5s batching).
- **Manual:** Settings → “Sync now” button.
- **Backoff:** exponential on repeated failures; cap at 15 min between attempts unless user taps Sync now.

---

## 5. REST API contract (self-hosted, post-v1 optional adapter)

**Base:** user-configured `https://example.com/forkit-sync/v1` (HTTPS required).

**Headers:**

- `Authorization: Bearer <household_token>` (opaque token created at server setup), or `X-Household-Key` + `X-Device-Id` — pick one model and document in server README; below assumes `Authorization`.

**Endpoints (conceptual):**

| Method | Path | Body | Purpose |
|--------|------|------|---------|
| `GET` | `/snapshot` | — | Returns full household document JSON (below) or 304 with `ETag`. |
| `PUT` | `/snapshot` | JSON body | Full or partial merge from client (server applies LWW). |
| `POST` | `/events` | Array of incremental ops | Optional fine-grained; v1 may use snapshot-only for simplicity. |

**Snapshot JSON shape (example):**

```json
{
  "household_id": "string",
  "schema_version": 1,
  "updated_at": 1710000000000,
  "members": [],
  "favorites": [],
  "user_recipes": [],
  "meal_history": [],
  "leftovers": [],
  "cart_lines": [],
  "savings_totals": { "lifetime_saved_usd": 0, "updated_at": 0 },
  "app_kv": []
}
```

Arrays contain objects matching **column names** in [`schema.md`](./schema.md) (snake_case JSON keys). Server validates types and strips unknown keys.

**Failure:** 4xx/5xx → client keeps local DB, logs error, shows Settings message; **never** wipe local data automatically.

---

## 6. Firebase (user-provided project)

**Model:** Firestore (recommended) or Realtime DB.

**Suggested Firestore layout:**

- Collection `households/{householdId}` — document with `updated_at`, `schema_version`.
- Subcollections or maps:
  - `members`, `favorites`, `user_recipes` (nested `ingredients` array), `meal_history`, `leftovers`, `cart_lines`, `kv` (small docs or single merged doc).

**Client:** Firebase SDK with user-pasted **google-services** / plist config (app stores may require disclosure). Sync adapter maps Firestore docs ↔ SQLite rows.

**Security rules:** User responsibility; document template rules (“only household members with shared secret”) in a future `docs/` snippet for self-hosters.

---

## 7. Supabase (user-provided) — v1 canonical sync backend

**This is the implementation to build first.** Section 5 (self-hosted REST) and section 6 (Firebase) are optional post-v1 adapters.

**Model:** Postgres tables mirroring the SQLite schema (normalized tables: `members`, `favorites`, `user_recipes`, `meal_history`, `leftovers`, `cart_lines`, …) with `household_id` column on each row.

**Client:** `@supabase/supabase-js` with URL + anon key supplied by the user; **RLS** policies are user’s responsibility (template rules to be documented).

**Mapping:** 1:1 with [`schema.md`](./schema.md) column names where possible to keep the adapter thin. Note: all mutable syncable rows carry `updated_at` (required for LWW — see `leftovers` and `cart_lines` in `schema.md`).

---

## 8. Sync failure UX

- Settings shows **last success** timestamps (`sync_device`).
- **Outbox** retries; if max attempts exceeded, badge **“Sync paused”** with reason (auth, network, schema mismatch).
- **Schema mismatch:** if remote `schema_version` > app supports, block push and prompt app update.

---

## 9. Security transport

- TLS only; certificate pinning optional for enterprise users—not required v1.
- No sync of raw **third-party API keys** in snapshot JSON; keys stay on device secure storage.

## 10. Credentials and repositories

Firebase, Supabase, and self-hosted sync credentials are **user-supplied** and must **never** be committed into `forkit/`, `forkit-source/`, or pasted into public issues. Same rule as [`../SECURITY.md`](../SECURITY.md) and [`../AGENTS.md`](../AGENTS.md) Rule #1. Example env files for **local** testing belong under **[`forkit-secrets/`](../forkit-secrets/README.md)** at the umbrella root, not beside these specs.

---

## Version history (this document)

| Doc version | Notes |
|-------------|--------|
| 1 | Initial Phase 0 companion. |
| 2 | Clarified v1 canonical backend (Supabase, user-supplied); labeled section 5 post-v1 optional; added auth offline contract and local-only default posture. |
