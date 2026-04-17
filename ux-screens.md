# ForkIt — UI/UX screen specification

Companion to [`SPEC.md`](./SPEC.md) and [`schema.md`](./schema.md). Text-first description of screens, navigation, and states so mobile UI is not improvised during implementation. **Framework-agnostic** (Flutter or React Native): use native patterns for lists, sheets, and navigation.

---

## Navigation model (v1)

- **Bottom tabs (4–5):** e.g. **Home** (browse + menu), **Search**, **Cart**, **Account** (profile, history, favorites entry, settings link). Exact icons/labels TBD; keep parity with DoorDash-style muscle memory.
- **Stack overlays:** Recipe detail, custom recipe editor, questionnaire flow, checkout / grocery list, full-screen modals from Home (ForkIt gateway).
- **Back:** OS back gesture returns from stacks to tabs; preserve scroll position where reasonable.

---

## 1. Home / menu (DoorDash-style)

**Purpose:** Primary discovery + household menu cues per [`SPEC.md`](./SPEC.md) menu view: themes, meal cards, tonight / recent / leftovers entry points as space allows.

**Data:** Bundled `recipes` (+ optional API refresh when online); `meal_history`, `leftovers`, `app_kv` for questionnaire filters; themes from facet grouping or static config.

**Layout:**

- Top: search affordance (navigates to Search tab or inline bar).
- Horizontal **theme** scroller (Italian Night, Quick Bites, etc.) — maps to cuisine / category / curated tags.
- Vertical **meal cards** (image, name, cuisine, savings hint if enabled).
- **ForkIt** primary action: opens **gateway** (Surprise me vs Ask me questionnaire).
- **Leftovers** entry: card or chip when `leftovers` has visible rows (per SPEC).

**Empty states:**

- No bundled rows (should not happen): “No recipes on device — update the app.”
- Filters yield zero: show SPEC zero-results relaxation messaging + CTA to clear filters.

**Offline:** Fully functional from bundled DB; disable or badge network-only actions.

**Errors:** Toast/snackbar for transient load issues; never blank screen without explanation.

---

## 2. Random discovery (ForkIt “Surprise me”)

**Purpose:** One-tap variety from **bundled** random selection offline; optional online TheMealDB `random.php` batch when connected (per product tuning).

**Flow:** User taps Surprise me → replaces or appends card grid → optional short loading indicator.

**Empty / offline:** Bundled path always returns results if DB non-empty.

---

## 3. Questionnaire (“Ask me”)

**Purpose:** Five-step flow per [`SPEC.md`](./SPEC.md) Feature 1.4 (meal time, cuisine, protein, vibe, recent exclusions). **Credit:** “Idea by Ava” fine print where appropriate.

**Layout:** Full-screen stepper, progress dots, Skip, **Surprise me** per step = no filter on that dimension.

**Exit:** Applies filters to Home data source; persists last answers in `app_kv` if useful.

**Offline:** Works against bundled + local facets; live API merge when online.

**Zero results:** Show relaxation banner per SPEC (which filters were relaxed).

---

## 4. Search

**Purpose:** Keyword + pills (cuisine, meal bucket, protein) AND-combined; results merged: **local first** (bundled FTS + `user_recipes`), then **TheMealDB** when online.

**Layout:** Search field, filter chips, results list, tap → Recipe detail.

**Offline:** Hide or disable “Live API” badge; results from SQLite only; inline hint “Showing saved recipes only — connect for more.”

**Empty:** “No matches” + suggest clearing filters or Surprise me.

**Errors:** Subtext under bar for network failure; keep local results visible.

---

## 5. Recipe detail

**Purpose:** Full-screen meal read: hero image, name, cuisine, meal bucket, protein, ingredients (list from `recipe_ingredients` or `ingredients_text` / custom lines), instructions, YouTube open-in-app/browser, savings snippet if available, favorite toggle, “Add to cart”, “I made this” when post-cook.

**Sources:**

- **Bundled:** load by `(bundled, id)`.
- **API:** detail from cache or lookup; same layout.
- **Custom:** `user_recipes` + `user_recipe_ingredients`; show validation warnings non-blocking.

**Offline:** All three modes allowed if data local; API-only without cache may show “Connect to refresh.”

---

## 6. Custom recipe entry / edit

**Purpose:** Form per [`SPEC.md`](./SPEC.md): name (required), ingredients lines (required), instructions (required), optional cuisine, dietary tags, servings, cook time, notes, photo.

**Validation:** When online, optional USDA line validation; warnings inline; **Save** always enabled.

**Success:** Navigate back to detail or list; row in `user_recipes`.

---

## 7. Favorites (“My recipes”)

**Purpose:** Grid/list of favorited items from `favorites` resolved against bundled/API/custom.

**Empty:** “No saved recipes yet” + CTA to Home.

**Offline:** Full list if references resolvable locally; API-only favorites may show placeholder until cache or network.

---

## 8. Meal history

**Purpose:** Chronological `meal_history` with filters (date range); tap opens recipe detail if resolvable.

**Empty:** “No meals logged yet” + hint to use “I made this” on checkout or detail.

---

## 9. Leftovers tracker

**Purpose:** List `leftovers` where `hidden = 0`; dismiss control; optional edit quantity; links to source recipe when `source_meal_history_id` set.

**Settings shortcut:** Link to Account for window days (stored in `app_kv` per SPEC).

**Empty:** Hide section or show “No leftovers tracked.”

---

## 10. Cart

**Purpose:** Lines from `cart_lines`; quantity steppers; per-member grouping when household + sync shows multiple contributors; floating summary / tab badge.

**Empty:** “Your cart is empty” + link Home.

**Offline:** Full CRUD local.

---

## 11. Checkout / grocery list

**Purpose:** After confirm: **Combined** view (deduped ingredients, checkboxes) and **By meal** view (grouped by recipe, YouTube links). Attribution footer when `member_id` present.

**Actions:** Share sheet export of list text (optional v1); navigate Cook through checkboxes.

**Offline:** Allowed (ingredients from local recipe data only).

---

## 12. Account hub

**Purpose:** Aggregates **lifetime savings** (`savings_totals`), streaks/stats (derived from `meal_history`), shortcuts to Favorites, History, Leftovers settings, **Settings**, **Export CSV**.

**Sign-in:** Optional. The Account hub — savings, history, favorites shortcuts — is fully accessible without an account. Sign-in (email magic-link, within the user's own Supabase project) is only required to enable household sync. When not signed in, a "Set up household sync" CTA links to Settings.

---

## 13. Settings

**Purpose:** Sync setup (Supabase URL + anon key entry — user supplies their own project); session status and household invite/join controls once connected; optional future advanced sync adapters; **API keys** for optional paid recipe tiers; **Export CSV**; **Reset local data** (destructive confirm); Leftovers window; markup assumptions for savings.

**Sync setup flow:** URL + anon key fields → “Connect” → magic-link sign-in → household create or join via invite code.

**Auth offline contract (UX):** If session is expired or device is offline, all screens except sync controls remain fully functional. Settings shows “Sync paused — sign in to resume” with a retry button. No other screen shows an auth error or is blocked.

**Keys:** Never show full secret in plain text after save — mask with reveal toggle.

---

## 14. Sync setup (Settings sub-screen)

**Purpose:** Guide the user through connecting their own Supabase project. Accessed from Settings when sync is not yet configured.

**Layout / flow:**

1. **Entry:** Two fields — "Supabase project URL" and "Anon key." Masked anon key field with reveal toggle. "Learn how to get these" help link (docs/FAQ).
2. **Connect:** Taps "Connect" → app validates the URL + key by making a lightweight test request to Supabase. Success → proceed to sign-in. Failure → inline error ("Could not reach project — check URL and key").
3. **Sign-in prompt:** Email input → "Send magic link." Confirmation state: "Check your email — tap the link to sign in." Cancel returns to fields without clearing them.
4. **Deep-link return:** Magic-link opens app → session established → proceed to household setup.

**Offline:** "Connect" disabled with tooltip "Connect to the internet to set up sync." Local-only use is unaffected.

**Error states:** Invalid URL format (inline, before submit); network failure on connect; magic-link expired (re-send option).

---

## 15. Sign-in / magic-link

**Purpose:** Standalone sign-in screen for returning users whose session has expired while sync is configured.

**Layout:** Email field pre-filled with stored address (editable). "Send magic link" button. "Use without signing in" text link — dismisses to previous screen, sync remains paused.

**States:** Idle → Sending → "Link sent — check your email" (with countdown to re-send, e.g. 60s) → deep-link return → session restored → Settings sync status updates.

**Offline:** Button disabled; "No internet connection — sign in when you're back online." App remains fully usable.

---

## 16. Household create

**Purpose:** First-time setup after sign-in when no household exists yet.

**Layout:** Single text field: "Household name" (e.g. "The Garcias"). "Create" button. Optional: skip to solo use (no household, sync of personal data only across own devices).

**Success:** Household created in Supabase; `household_id` stored in `sync_device`; app navigates to invite screen (below) or directly to Home with a "Share invite" nudge banner.

---

## 17. Household invite / join

**Purpose:** Two entry points — owner shares a code; recipient joins.

**Share (owner):** Displays a short invite code + "Share" button (OS share sheet with a deep link). Code expires after 48 hours; "Generate new code" if expired.

**Join (recipient):** Accessed from Settings → "Join a household." Single field for invite code. "Join" → validates against Supabase → success shows household name + member count → confirm join.

**Error states:** Expired code (prompt to request a new one); already a member of a different household (offer to leave first, with warning that local attribution data will re-link).

---

## 18. Sync status (Settings section)

**Purpose:** At-a-glance sync health within the Settings screen. Always visible once sync is configured.

**Layout (inline section within Settings):**

- "Last synced: [relative time]" or "Never" if first sync pending.
- Status badge: **Synced** (green) / **Syncing…** (spinner) / **Sync paused** (amber) / **Error** (red).
- "Sync now" button — triggers immediate pull + push cycle.
- Expandable detail row on error: reason string (auth expired, network, schema mismatch) + appropriate CTA (sign in / retry / update app).

**Sync paused state:** Displayed when session is expired or network unavailable. "Sign in to resume" CTA opens screen 15. All other Settings rows and all app features remain accessible.

**Schema mismatch:** If remote `schema_version` > app supports, block push and show "Update the app to continue syncing" — never auto-wipe local data.

---

## Global patterns

- **Loading:** Skeleton cards on first paint; avoid blocking full-screen spinners except checkout math <300ms acceptable.
- **Accessibility:** Minimum touch targets, readable contrast on filters (legacy web had colorblind-friendly pills—carry intent forward).
- **Deep links:** Optional post-v1; not required for Phase 1.

---

## Version history (this document)

| Doc version | Notes |
|-------------|--------|
| 1 | Initial Phase 0 companion. |
| 2 | Added screens 14–18: sync setup, magic-link sign-in, household create, household invite/join, sync status. Reflects local-only default + user-supplied Supabase model and auth offline contract. |
