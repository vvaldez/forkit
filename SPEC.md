# ForkIt

> **Fork it, I'll cook it myself.** A DoorDash-inspired app that turns the delivery model on its head -- instead of paying someone to bring you food, you use the same slick UX to discover recipes, coordinate meals with your family, and generate grocery lists that save you money.

## Three Pillars

### 1. The DoorDash Pun (UI/UX Connection)

ForkIt borrows the look, feel, and flow of food delivery apps -- but the punchline is that *you* are the kitchen. Themes replace restaurants. Meals replace menu items. Checkout produces a grocery list, not an order confirmation.

### 2. Anti-Fee / Financially Savvy

Every interaction reinforces the premise: cooking at home saves money. The app should make the user *feel* the savings, not just know about them abstractly.

### 3. Recipe Discovery & Sharing

ForkIt is a tool for finding new meals, learning to cook them (YouTube links, instructions), and sharing the experience with family. Group ordering turns meal planning into a collaborative activity.

**Meal variety is a core principle.** The app should actively steer users toward new dishes and away from repeating the same meals. Recipes cooked in the last 7 days are de-prioritized or hidden from recommendations, and the questionnaire gives users explicit control over what to skip.

---

## Technical Stack

- **Framework:** Next.js (App Router)
- **Styling:** Tailwind CSS (mobile-optimized to mimic DoorDash UI)
- **Recipe data (current):** [TheMealDB](https://www.themealdb.com/) API for live recipes plus curated **mock data** in-repo for first paint and offline-friendly demos. The in-app `Recipe` shape aligns with `Schema.org/Recipe`-style fields (`ingredients`, `instructions`, macros, etc.).
- **Recipe data (HomeCook):** Google Sheets acts as an editorial source of truth for a subset of curated \"homecook\" recipes. Rows are validated against the unified `Recipe` model (id, name, description, cuisine, meal category, protein, ingredients, YouTube URL, etc.); only valid rows are surfaced in the app, tagged with a `homecook` flag and rendered with a distinct card accent to differentiate them from TheMealDB and mock recipes.
- **State:** Zustand (client-side cart) + PartyKit (real-time group ordering)
- **Auth (planned -- Milestone 7):** OAuth sign-in (Google, Apple). **Soft gate:** browse and use the app without an account; sign-in unlocks **cloud sync** of favorites, cooking history, savings, and other account features. No first-party password storage; sessions via auth library. Server-side user data keyed by provider identity.
- **Deployment Target:** Vercel (PWA enabled for native iOS/Android feel)

---

## Personas

- **The User (everyone):** Browses meals, discovers new recipes, adds favorites, picks what they want to eat. Motivated by variety, convenience, and saving money vs. ordering delivery.
- **The Cook (the one who shops and cooks):** Sees the consolidated grocery list, accesses YouTube tutorials, tracks savings. Motivated by efficiency, budget control, and expanding their cooking repertoire.

---

## Features

### Pillar 1: DoorDash-Style Experience

#### Feature 1.1: DoorDash UI/UX (Built -- Milestones 2-3)

- Edge-to-edge mobile layout, bottom navigation, horizontal scrolling theme categories, meal cards with images.
- "Themes" (e.g., Italian Night, Quick Bites, Healthy) replace restaurants.
- "Meals" replace menu items; each includes a YouTube recipe video link.
- Progressive Web App for native feel on iOS/Android.

#### Feature 1.2: Cart & Checkout (Built -- Milestone 4)

- Add meals to a cart. Floating cart bar and badge on the bottom nav mirror the DoorDash experience.
- "Checking out" generates a consolidated grocery list (combined and by-meal views with checkboxes).

#### Feature 1.3: Group Ordering (Built -- Milestone 5)

- Generate a shareable URL to send to family/friends.
- Each person picks meals into their own labeled cart via real-time WebSocket sync (PartyKit).
- The Cook sees a merged view with attribution and can check out to generate a consolidated grocery list.
- "Is everyone ready?" confirmation before checkout.

#### Feature 1.4: "What do you feel like?" Questionnaire (Built -- Milestone 6)

*This feature was Ava (my daughter)'s idea.*

- The ForkIt button offers two paths: "Surprise me" (random fetch) or "Ask me" (opens the questionnaire).
- Tinder-style, one-question-per-screen quiz with 5 screens: exclude recent meals, meal time, cuisine, protein, vibe.
- Answers auto-set the home page filters and trigger a fresh recipe fetch.
- Meals cooked in the last 7 days are automatically excluded from results to promote variety.
- Questionnaire options (for meal time, cuisine, protein, and vibe) must either be derived from real recipe facets (e.g., `meal_category`, `cuisine_type`, `protein_type`) or mapped directly to them so valid-looking choices (like \"Snack\") never point at non-existent categories.
- For each quiz question, choosing **\"Surprise me\"** is treated as **All** for that dimension (no filter applied) so it cannot accidentally over-narrow results.
- The ForkIt **Surprise me** button clears all active filters and fetches a fresh random batch; it must never add extra filtering that would reduce the pool of possible meals.
- Quiz-driven filtering should avoid dead-ends: if a particular combination of quiz answers yields zero matches from a fetched batch, the app should relax filters in a predictable order (e.g., meal time → protein → cuisine) and/or clearly indicate when filters were relaxed, while still honoring the meal variety exclusions.
- Visible copy in the quiz (e.g., \"snack\" vs \"snacks\") and internal category strings (e.g., `Snack` vs `Snacks`) must be kept consistent or explicitly mapped so questionnaire selections always correspond to reachable filters.

### Pillar 2: Savings & Budget

#### Feature 2.1: Savings Tracker (Built -- Milestone 5.5b)

- After checkout, show an estimate: *"This meal would cost ~$X on DoorDash. You're making it for ~$Y. You saved $Z."*
- Uses average delivery markup estimates (configurable per meal or globally).
- Accumulates a running "lifetime savings" counter persisted in localStorage.
- Reinforces the anti-fee message every time you cook.

#### Feature 2.2: Cost-Per-Serving Estimates (Proposed)

- Display an estimated cost per serving on each MealCard.
- Can be a manual field on the recipe record (e.g. sheet or CMS in the future), or estimated from ingredient data.
- Lets users compare meals by value, not just taste.

#### Feature 2.3: Budget-Friendly Themes (Proposed)

- Add theme categories like "Under $5/serving" or "Budget Week" that filter by cost data.
- Makes it easy to plan a cheap week of meals.

#### Feature 2.4: Weekly Meal Planner (Proposed)

- Plan meals for the whole week in one go.
- Generates a single consolidated grocery list for the week.
- Helps avoid impulse buying, reduces food waste, and keeps spending predictable.

### Pillar 3: Discovery & Sharing

#### Feature 3.1: Popular Recipe Retrieval (Built -- Milestones 1, 5.5)

- Fetch recipes from **TheMealDB** (random, search, filters) and from **mock data** for the default home load.
- Search, ForkIt random batch, and filter pills on the home and search pages.

#### Feature 3.2: Favorites Collection (Built -- Milestone 5.5b)

- Heart/save recipes to a personal "My Recipes" list.
- Persisted in localStorage via Zustand. Makes re-cooking easy.

#### Feature 3.3: "I Made This!" History (Built -- Milestone 5.5b)

- Track which recipes you've cooked with a single tap.
- Over time, the app can surface patterns ("You love Italian!") and suggest new recipes in cuisines you enjoy.

#### Feature 3.4: Recipe Notes (Proposed)

- Add personal notes to any recipe ("kids loved this," "use less salt next time").
- Stored locally. Visible when you revisit the recipe.

#### Feature 3.5: Share a Meal (Proposed)

- Share a single recipe card via the native share sheet (Web Share API).
- Beyond group ordering -- send a friend a recipe you think they'd like.

#### Feature 3.6: Cooking Skill Progression (Proposed)

- Tag recipes as beginner, intermediate, or advanced.
- Track your progression from simple to complex dishes.
- Suggest recipes that stretch your skills just enough.

#### Feature 3.7: Leftovers Board (Proposed)

- Always-on \"Leftovers\" meal card on the ForkIt home grid that behaves like a special meal.
- Instead of ingredients, this card aggregates **recently cooked meals** (e.g. last 7 days, configurable in settings) as sub-items you can see and manage.
- Each sub-item links back to the original recipe (or its history entry) and has an **X** control to mark it as \"fully eaten\" and remove it from the Leftovers view.
- The Leftovers card should respect the **meal variety** principle: it makes it easy to reuse ingredients across days, but also lets you explicitly say \"we're done with this\" so the questionnaire and recommendations can avoid it.
- The time window (e.g. 3 / 5 / 7 days) and which cooked meals qualify (all vs only specific themes/proteins) should be user-configurable in a simple settings section on the Account page.

#### Feature 3.8: HomeCook Recipes from Google Sheets (Proposed)

- Use a dedicated Google Sheet as the canonical list of HomeCook recipes curated by the user.
- Each row must conform to the existing `Recipe` data model (including stable id, name, description, cuisine, meal category, protein, ingredients text, and YouTube tutorial link); rows that fail validation are ignored and can be surfaced in dev tooling for cleanup.
- HomeCook recipes flow through the same discovery surfaces as other recipes (home grid, search, ForkIt, questionnaire) but carry a `homecook` tag and are rendered with a subtle visual distinction (badge, border, or accent) so users can immediately see which meals come from their own collection.

#### Feature 3.9: Full-Screen Meal Detail View (Proposed)

- Tapping any MealCard (HomeCook or external) opens a dedicated, full-screen detail view focused on that meal.
- The detail view shows a large hero image, meal name, cuisine, meal category, protein, full ingredient list, any available instructions or notes, the YouTube link, and relevant savings information where applicable.
- This view becomes the primary place to \"read\" a recipe before cooking, and is consistent across data sources so users always get a complete per-meal picture from a single tap.

---

## Constraints

- Strictly for personal use (no App Store deployment, no monetization).
- Keep the data layer understandable: external API + mock today; optional future sheet or CMS for custom meals without over-engineering.
- All components must be responsive-first (looks and behaves like a phone app on desktop).
- Do not use heavy external UI libraries; stick to pure Tailwind CSS for custom styling.
