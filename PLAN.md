# Project plan: ForkIt

Milestones and progress tracking. Feature definitions live in `SPEC.md`.

---

## ✅ Milestone 1: Popular Recipe Retrieval

This milestone covers the implementation of the dynamic recipe retrieval feature.

- [x] **Implement Live Recipe Search:**
    - [x] Create a function to fetch popular recipes from an external source.
    - [x] The function should accept a parameter for the number of recipes to retrieve (defaulting to 5).
- [x] **Develop Recipe Display Component:**
    - [x] Create a UI component to display the retrieved recipes.
    - [x] The component should include a text box to show the recipe data.
- [x] **Implement Data Format Conversion:**
    - [x] Add buttons to the display component to copy the recipe data in YAML, JSON, and CSV formats.
    - [x] Ensure the data format matches the headings in `recipes.csv`.
- [x] **Integrate into Main Page:**
    - [x] Add a button or control on the main page to trigger the recipe retrieval.
    - [x] The retrieved data should be stored in-memory for the user session.

---

## ✅ Milestone 2: MVP Setup & Core Data Layer

This milestone covers the initial project setup and the implementation of the core data fetching mechanism.

- [x] Initialize Next.js project with TypeScript and Tailwind CSS.
- [x] Define project specifications and architecture in `SPEC.md`.
- [x] Implement Google Sheets data fetching logic in `src/lib/sheets.ts`.
- [x] Validate incoming data using Zod schemas.
- [x] Refactor data model to align with Schema.org/Recipe standard.
- [x] Create a basic meal list display on the main page (`src/app/page.tsx`).
- [x] Add `BottomNav.tsx` component structure.

---

## ✅ Milestone 3: DoorDash-Style UI/UX

This milestone focuses on building the frontend to mimic the look and feel of the DoorDash application.

- [x] **Implement Theme Categories:**
    - [x] Create a component for horizontally scrolling "Theme" categories (e.g., Italian Night, Quick Bites).
    - [x] Group meals by their "theme" from the sheet data.
- [x] **Develop Meal Cards:**
    - [x] Create a `MealCard.tsx` component that displays a meal's image, name, and description, styled like a DoorDash menu item.
- [x] **Refine Main Page:**
    - [x] Replace the current basic list on `src/app/page.tsx` with the new `Theme` categories and `MealCard` components.

---

## ✅ Milestone 4: Meal Ordering & Grocery List

This milestone introduces the core "ordering" functionality and the generation of the final grocery list.

- [x] **State Management:**
    - [x] Choose and implement a client-side state management solution (Zustand with localStorage persistence) for the shopping cart.
- [x] **Cart Functionality:**
    - [x] Add an "Add to Cart" button/interaction on the `MealCard.tsx` component.
    - [x] Create a `Cart` page (`/cart`) that displays the selected meals with quantity controls.
    - [x] Add a floating cart bar (DoorDash-style) and badge on the bottom nav.
- [x] **Grocery List Generation:**
    - [x] Implement the "Checkout" logic that consolidates ingredients from all meals in the cart into a single grocery list for the Cook.
    - [x] Two views: Combined (deduplicated, with checkboxes) and By Meal (grouped with YouTube links).

---

## ✅ Milestone 5: Group Ordering (MVP)

Real-time group ordering using PartyKit WebSockets. Users start a group session, share a URL, and each participant picks meals into their own labeled cart. The Cook sees a merged view with attribution and checks out to generate a consolidated grocery list.

- [x] **Sharable Sessions:**
    - [x] Generate shareable URL with `nanoid` session IDs (`/?session=UNIQUE_ID`).
    - [x] Share Link / native share sheet (Web Share API on mobile, clipboard on desktop).
    - [x] LAN-aware URL generation (rewrites `localhost` to LAN IP for cross-device sharing).
- [x] **Real-time Cart Sync:**
    - [x] PartyKit WebSocket server (`party/index.ts`) with in-memory group state.
    - [x] React context (`GroupProvider`) with `usePartySocket` for auto-reconnect and re-join.
    - [x] Solo mode (Zustand) and group mode (PartyKit) coexist seamlessly.
- [x] **UI/UX for Group Carts:**
    - [x] Join session modal with name entry (persisted in `sessionStorage`).
    - [x] ShareSession bar with online member pills and Copy/Share Link.
    - [x] MealCard dual-mode: solo vs group cart actions.
    - [x] Group cart page with per-member expandable sections, online indicators, live updates.
    - [x] "Is everyone ready?" confirmation dialog before group checkout.
    - [x] FloatingCartBar and BottomNav show group totals in group mode.
- [x] **Accessibility fixes:**
    - [x] High-contrast text for colorblind users across modal and group UI.
    - [x] Multi-tier clipboard fallback for insecure HTTP contexts (LAN testing).

---

## ✅ Milestone 5.5: Recipe Search & Filter Overhaul

Replaced the non-functional search bar and hidden Dev Tools with a real search-and-discover experience.

- [x] **Expanded mock data:** 10 diverse recipes covering 10 cuisines, 3 meal types, and 6 protein categories.
- [x] **ForkIt! hero button:** Prominent button that fetches 10 random recipes from TheMealDB on each tap, with a spinning fork animation.
- [x] **Functional search bar:** Typing filters loaded recipes instantly; pressing Enter calls the TheMealDB search API.
- [x] **Multi-row filter pills:** Three wrapping pill rows (Cuisine, Meal, Protein) with AND-combined filtering, derived dynamically from loaded data.
- [x] **TheMealDB API integration:** New `searchRecipes`, `filterByCategory`, `filterByArea`, `filterByIngredient` functions.
- [x] **Dev Tools removed:** `RecipeSearch.tsx` and `ThemeCategories.tsx` deleted; new `FilterBar.tsx` and `ForkItButton.tsx` replace them.
- [x] **Accessibility:** High-contrast filter pills (accent red selected, dark text unselected) for colorblind users.

---

## ✅ Milestone 5.5b: Personal Dashboard & Savings

Favorites, cooking history, savings estimates, and real `/account` and `/search` routes.

- [x] **User store:** `forkit-user` persisted Zustand store for favorites, cooking history, and savings ledger.
- [x] **MealCard:** Heart toggle, "Save ~$X" badge vs delivery estimate.
- [x] **Cart checkout:** Savings summary card, `recordCheckout`; "I Made This!" on By Meal tab for history.
- [x] **Account page:** Lifetime savings, meals cooked, weekly streak, favorites grid, cooking journal.
- [x] **Search page:** Dedicated TheMealDB search with FilterBar.

---

## ✅ Milestone 6: "What do you feel like?" Questionnaire

Tinder-style quiz behind the ForkIt button, meal variety from cooking history, and filter auto-apply. *Feature idea credited to Ava (my daughter).*

- [x] **ForkIt gateway:** Tap ForkIt to choose "Surprise me" (random fetch) or "Ask me" (questionnaire); fine-print credit `idea by Ava (my daughter)` under Ask me.
- [x] **QuizModal:** Five steps -- exclude recent cooked meals (if history), meal time, cuisine, protein, vibe; progress dots, Skip, transitions.
- [x] **Recommendation logic:** Quiz sets `FilterBar` filters and fetches fresh random recipes; excluded IDs + banner with "Show anyway."
- [x] **SPEC:** Meal variety principle; Feature 1.4 updated with Ava credit and explicit rules for option–data alignment, Surprise me semantics, and zero-results guardrails.

*Follow-up:* Questionnaire copy and options may be revised in a future iteration, and:

- **Questionnaire/category audit:** Verify every option (meal time, cuisine, protein, vibe) is either derived from actual recipe facets (e.g., `meal_category`, `cuisine_type`, `protein_type`) or mapped directly to them so there are no choices (like \"Snack\") that can’t return results. **Status:** Implemented via quiz label → facet mapping and TheMealDB meal-time bucketing.
- **Zero-results fallback logic:** Implement and verify predictable behavior when quiz filters yield no matches from a fetched batch (for example, relaxing filters in a defined order such as meal time → protein → cuisine while still honoring recent-meal exclusions). **Status:** Implemented in the home page quiz completion flow.
- **Surprise me behavior:** Confirm in code and UX that both the hero **Surprise me** button and each quiz **Surprise me** option act as “All categories, randomly selected” (no extra narrowing beyond the other answers), and document this behavior for future iterations. **Status:** Implemented; documented in Feature 1.4 in `SPEC.md`.

---

## ⬜ Milestone 7: OAuth Sign-In & Cloud User Data

**Soft gate:** The app stays **fully browsable without sign-in** (home, search, cart, group sessions, ForkIt, questionnaire). **Sign-in unlocks** cloud sync of favorites, cooking history, savings ledger, and any future account-only features. No self-hosted passwords; use **Google** and **Apple** OAuth with a managed auth layer (e.g. Auth.js, Clerk, or Supabase Auth). Signed-in data lives in **server-side storage** keyed by provider user id.

- [x] **Research & choose stack:** Settled on Auth.js v5 (NextAuth) with Google first; Apple as a follow-up when dev setup exists.
- [x] **Soft gate UX (in code):** Account page now shows Sign in / Sign out (Google); all main routes remain guest-accessible; only profile sync endpoints require auth.
- [x] **Implement OAuth groundwork (in code):** Auth.js v5 configured with Google provider, `SessionProvider` wrapped in `layout.tsx`, and `/api/auth/[...nextauth]` route wired.
- [x] **Profile API & local merge (in code):** `/api/profile` GET/PUT backed by Prisma `UserProfile` model; `user-store` exposes `toProfilePayload` / `applyProfilePayload`; Account page has “Load from cloud” / “Save current data” buttons.
- [x] **Prisma v7 database wiring:** `prisma.config.ts` supplies datasource URL (loads `.env` then `.env.local`, matching Next); SQLite + `UserProfile` migrations runnable; profile sync API enabled.
- [ ] **Session model:** Confirm final session lifetime / security posture (Auth.js defaults vs explicit config).
- [ ] **Data migration:** On first successful sign-in, merge or upload `forkit-user` localStorage to server; decide conflict strategy (server wins vs prompt); optionally keep local guest cache.
- [ ] **Docs:** README still needs explicit OAuth env vars (`AUTH_SECRET`, `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET`, callback URL); DATABASE_URL + Prisma env precedence are documented.

---

## ✅ Milestone 7.5: Leftovers Board

Always-visible Leftovers card on the ForkIt home grid, surfacing recently cooked meals as reusable options while respecting the meal variety principle.

- [x] **Store extensions:** `user-store` now tracks `leftoversWindowDays` (default 7) and `leftoversHiddenIds`, with actions `setLeftoversWindowDays`, `hideLeftover`, and `clearHiddenLeftovers`. These fields are included in the synced profile payload.
- [x] **Leftovers logic:** `getRecentLeftovers` helper derives unique recent meals from `cookingHistory` within the configured window, minus any hidden ids, sorted newest-first.
- [x] **Leftovers card UI:** New `LeftoversCard` component renders under the FilterBar on the home page when there are leftovers, listing recent cooked meals with dates and an **X** control to remove them from the card.
- [x] **Account settings:** Account page now includes a simple Leftovers settings section to choose the time window (3/5/7/14 days), persisted in `user-store` and honored by the card.
- [x] **Variety alignment:** Leftovers use the same `cookingHistory` source as the questionnaire and exclusion logic, reinforcing the \"we're done with this for a while\" semantics when a user dismisses a leftover.

---

## ⬜ Milestone 8: HomeCook Sheets & Meal Details

Connect Google Sheets as an editorial source of truth for a curated set of HomeCook recipes and add a full-screen meal detail view accessible from any MealCard.

- [ ] **HomeCook Sheet wiring:**
  - [ ] Configure a dedicated tab or sheet for HomeCook recipes and reuse or extend `src/lib/sheets.ts` to fetch rows for this collection.
  - [ ] Validate each row against the existing `Recipe` model (id, name, description, cuisine, meal category, protein, ingredients, YouTube URL, etc.), ignoring or logging rows that fail validation.
- [ ] **homecook tagging & styling:**
  - [ ] Tag all valid HomeCook recipes with a `homecook` flag in the unified recipe model.
  - [ ] Render HomeCook recipes in the standard grids (home, search, ForkIt results) with a subtle but clear distinction (e.g., badge, border, or accent color) so users can see which meals are from their own collection.
- [x] **Meal detail view:**
  - [x] Implement a full-screen meal detail view opened when tapping a MealCard, showing hero image, name, cuisine, meal category, protein, full ingredient list, instructions/notes (when available), YouTube link, and any savings information.
  - [x] Ensure the detail experience works consistently for both HomeCook and TheMealDB/mock recipes, and is responsive on mobile-first layouts.
- [ ] **QA & docs:**
  - [ ] Manually verify mixing HomeCook and non-HomeCook recipes on the home grid, search results, and detail screens.
  - [ ] Update README and/or SPEC notes if any additional environment variables or sheet structure expectations are required to support HomeCook recipes in development.
