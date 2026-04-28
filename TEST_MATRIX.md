# ForkIt — Pre-submission test matrix

Manual smoke tests to run on a real device (EAS build) before App Store / Play Store submission. Mark each row **Pass**, **Fail**, or **Skip** (with reason).

Use an **EAS development build** for all tests — Expo Go cannot exercise custom URI schemes (auth deep links), secure store, or the bundled SQLite copy strategy accurately.

Run the iOS and Android columns independently; note the OS version tested.

---

## 1. First launch & database init

| # | Test | iOS | Android |
|---|------|-----|---------|
| 1.1 | Fresh install: app opens without crash | | |
| 1.2 | Browse loads recipe cards (confirms bundled DB copied from asset) | | |
| 1.3 | Browse shows "AllRecipes Picks" horizontal row (community bundle loaded) | | |
| 1.4 | Kill and relaunch: app opens without re-copying bundled DB (version check works) | | |
| 1.5 | Uninstall + reinstall: fresh DB, no leftover user data | | |

## 2. Browse

| # | Test | iOS | Android |
|---|------|-----|---------|
| 2.1 | All 6 pill filters (Quick, Healthy, Comfort, Meatless, Global, Low Carb) are tappable and filter the visible rows | | |
| 2.2 | Horizontal bucket rows scroll independently | | |
| 2.3 | Cuisine grid opens `CuisineDetailScreen` with correct recipes | | |
| 2.4 | Community bucket ("AllRecipes Picks") is present and tappable | | |
| 2.5 | Leftovers card appears after logging a meal via "I'm making this" (test with 2.6 first) | | |
| 2.6 | Leftovers card shows correct chip count; "+N more" overflow fires at >5 | | |
| 2.7 | Dismissing a leftover chip removes it from the card | | |
| 2.8 | Gear icon navigates to Settings | | |
| 2.9 | Green dot on gear icon appears when signed in, absent when signed out | | |

## 3. Search

| # | Test | iOS | Android |
|---|------|-----|---------|
| 3.1 | Search opened via Browse 🔍 icon (not a tab) | | |
| 3.2 | Typing returns results within ~300 ms (debounced) | | |
| 3.3 | Clearing query resets results | | |
| 3.4 | "Surprise me" random button returns a recipe each tap | | |
| 3.5 | No crash on empty query or single character | | |

## 4. Meal detail

| # | Test | iOS | Android |
|---|------|-----|---------|
| 4.1 | Bundled recipe: name, ingredients, instructions, image all render | | |
| 4.2 | Community bundle recipe (`source: community_bundle`): same fields render | | |
| 4.3 | Custom recipe: renders with no image and no YouTube link gracefully | | |
| 4.4 | "Add to Cart" button increments cart badge on tab bar | | |
| 4.5 | Cart stepper (−/+) on MealDetail adjusts quantity | | |
| 4.6 | YouTube link opens browser / YouTube app | | |
| 4.7 | "I'm making this" tap: YouTube intercept bottom sheet appears on first tap | | |
| 4.8 | Bottom sheet "Yes, I'm making this" logs meal and closes sheet | | |
| 4.9 | Bottom sheet "Just watching" does NOT log meal | | |
| 4.10 | Second "I'm making this" tap within 4 hrs: button shows "Cooked today" and is disabled | | |
| 4.11 | Second "I'm making this" tap outside 4 hrs: allowed to log again | | |
| 4.12 | "Share to Community" button visible when signed in | | |
| 4.13 | "Share to Community" hidden (or shows sign-in prompt) when signed out | | |
| 4.14 | Favorite toggle persists across app restarts | | |

## 5. Cart & checkout

| # | Test | iOS | Android |
|---|------|-----|---------|
| 5.1 | Add multiple recipes; CartScreen shows all with correct quantities | | |
| 5.2 | Ingredient-efficiency hint card appears (first time with overlapping ingredients) | | |
| 5.3 | Hint card dismissed: does not reappear after restart (`app_kv` persisted) | | |
| 5.4 | Remove item from cart; tab badge decrements | | |
| 5.5 | Empty cart: shows empty state, no crash | | |
| 5.6 | Checkout → GroceryListScreen opens with combined + by-meal segments | | |
| 5.7 | Checkbox state persists while screen is open | | |
| 5.8 | Savings estimate shown on checkout | | |
| 5.9 | "Done" on GroceryList navigates to Home tab (not Browse) | | |
| 5.10 | Completed checkout appears in Past Grocery Lists | | |

## 6. Favorites & custom recipes

| # | Test | iOS | Android |
|---|------|-----|---------|
| 6.1 | Favorite a bundled recipe; appears in Favorites tab | | |
| 6.2 | Unfavorite; disappears from Favorites tab | | |
| 6.3 | Favorite card navigates to MealDetail with correct recipe | | |
| 6.4 | "Add custom recipe" opens form | | |
| 6.5 | Create custom recipe with name + ingredients; appears in Favorites | | |
| 6.6 | Edit custom recipe; changes persist | | |
| 6.7 | Delete custom recipe; removed from Favorites | | |
| 6.8 | Custom recipe MealDetail renders all entered fields | | |

## 7. Discover & questionnaire

| # | Test | iOS | Android |
|---|------|-----|---------|
| 7.1 | Discover tab is 5th tab and tappable | | |
| 7.2 | "Surprise me" on Discover returns a result not cooked in last 7 days | | |
| 7.3 | Questionnaire: Meal time step shows options | | |
| 7.4 | Questionnaire: Cuisine step options loaded dynamically (not hardcoded) | | |
| 7.5 | Questionnaire: Dietary step options loaded dynamically | | |
| 7.6 | Questionnaire: Cook time step shows 4 buckets | | |
| 7.7 | Results screen shows matching recipes with filter chips | | |
| 7.8 | "Try different filters" CTA on results returns to questionnaire | | |
| 7.9 | Zero results: inline relaxation message shown (not blank screen) | | |
| 7.10 | Questionnaire result taps through to MealDetail correctly | | |

## 8. Home screen

| # | Test | iOS | Android |
|---|------|-----|---------|
| 8.1 | Home shows "Tonight" suggestion | | |
| 8.2 | Recent meals section reflects `meal_history` | | |
| 8.3 | Active leftovers shown | | |
| 8.4 | Cart queue shown when cart is non-empty | | |
| 8.5 | Gear icon navigates to Settings | | |
| 8.6 | Green dot on gear icon tracks auth state | | |

## 9. Settings & data

| # | Test | iOS | Android |
|---|------|-----|---------|
| 9.1 | Settings opens from gear icon | | |
| 9.2 | Sign in: enter email, receive OTP (requires EAS build + network) | | |
| 9.3 | Enter correct OTP: session established, gear dot turns green | | |
| 9.4 | Enter incorrect OTP: error shown, not signed in | | |
| 9.5 | Sign out: session cleared, gear dot disappears | | |
| 9.6 | Leftover expiry stepper: adjustable 1–7; persists after restart | | |
| 9.7 | CSV export: produces a file without crash | | |
| 9.8 | Past Grocery Lists: shows previous checkouts | | |
| 9.9 | Past Grocery List detail: shows correct ingredients for that checkout | | |

## 10. Offline behavior

Run all tests below with **airplane mode on** (Wi-Fi + cellular off):

| # | Test | iOS | Android |
|---|------|-----|---------|
| 10.1 | Browse loads (bundled DB) | | |
| 10.2 | Search works | | |
| 10.3 | MealDetail opens for bundled recipe | | |
| 10.4 | MealDetail opens for community bundle recipe | | |
| 10.5 | "I'm making this" logs offline (no network call needed) | | |
| 10.6 | Cart + checkout + grocery list complete offline | | |
| 10.7 | Favorites read/write offline | | |
| 10.8 | Custom recipe create offline | | |
| 10.9 | Community browse section shows cached data (or staleness banner, not crash) | | |
| 10.10 | Auth sign-in attempt offline: shows a network error, not crash | | |

## 11. Edge cases & regression

| # | Test | iOS | Android |
|---|------|-----|---------|
| 11.1 | Add same recipe to cart twice: quantity increments, no duplicate row | | |
| 11.2 | Very long recipe name does not overflow UI | | |
| 11.3 | Recipe with no image: placeholder shown, no crash | | |
| 11.4 | Recipe with no YouTube URL: button hidden or disabled | | |
| 11.5 | Recipe with no ingredients: detail renders without crash | | |
| 11.6 | Back navigation from every screen returns to expected parent | | |
| 11.7 | App backgrounded for 5+ min and resumed: no crash or stale state | | |
| 11.8 | Rapid tab switching: no duplicate DB queries or crashes | | |
| 11.9 | Leftover expiry: item with `expiry_date` in the past not shown as active | | |
| 11.10 | `DevSmokeScreen` file exists but is NOT wired into AppNavigator — confirm no route reaches it in production build | | |

---

## Pre-submission checklist (owner-driven, not code)

- [ ] App Store Connect app record created; `ascAppId` filled in `eas.json`
- [ ] Apple Developer team ID filled in `eas.json`
- [ ] Google Play service account JSON at `forkit-secrets/play-store-service-account.json`
- [ ] Store listing copy written (description, keywords, category)
- [ ] Screenshots captured: 6.5" iPhone, 12.9" iPad, Android phone
- [ ] App icon reviewed (current `assets/icon.png` is 1024×1024 — confirm it is the final branded icon, not the Expo placeholder)
- [ ] Splash screen reviewed (`assets/splash-icon.png`)
- [ ] Age rating questionnaire completed in App Store Connect + Play Console
- [ ] Privacy policy URL from `forkit/privacy-policy.md` entered in both stores
- [ ] GitHub Actions secrets added: `SUPABASE_URL` + `SUPABASE_SERVICE_KEY` (for community export cron)
- [ ] `DevSmokeScreen` removed or gated behind a dev-only flag before production build
