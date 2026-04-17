# DESIGN_BRIEF.md — ForkIt

Design direction and asset specifications for the ForkIt mobile app.

---

## Brand concept

**ForkIt** is a meal-planning app built on a single pun: *fork DoorDash — cook it yourself.* The tagline is **"Fork it, I'll cook it myself."**

The tone is confident and a little cheeky. It's for people who know delivery is a trap and want the satisfaction (and savings) of cooking. It's not a chef's tool — it's for regular home cooks who want to stop staring at the fridge and just pick something.

The emotional arc is:
> Overwhelmed by "what's for dinner?" → ForkIt makes the decision → you cook it → you feel good about it

---

## Color palette

| Role | Hex | Usage |
|------|-----|-------|
| Primary / brand red | `#E8474C` | CTAs, active states, accents, app icon |
| White | `#FFFFFF` | Backgrounds, card surfaces |
| Near-black | `#111111` | Body text, headings |
| Mid-grey | `#888888` | Secondary text, placeholders |
| Light grey | `#F2F2F2` | Chips, input backgrounds |
| Success green | `#4CAF50` | Checkbox checked state, savings card |
| Savings orange-warm | `#FFF8F0` / `#FFE0B2` | Savings estimate card background/border |

The primary red `#E8474C` is the signature color. It should dominate the app icon.

---

## App icon

### Concept direction

The icon needs to work as a small square glyph on a home screen. It should communicate:
- Cooking / food (not delivery, not restaurant)
- A bit of attitude — the "fork it" energy
- Home, not professional kitchen

**Preferred direction:** A bold fork — but stylized to suggest both the utensil and the "fork" of a decision or a road fork (optional). The fork can be accompanied by a subtle visual pun if it reads clearly at small sizes. Avoid anything that looks like a delivery bag, a box, or a restaurant menu.

**What to avoid:**
- Chef's hat — too formal
- Delivery bag / box — wrong direction entirely
- Plate with food illustration — too detailed for icon sizes
- Knife + fork crossed — generic and overdone

**Mood words:** bold, friendly, a little sarcastic, home kitchen, weeknight dinner

### Platform specifications

| Platform | Size | Format | Notes |
|----------|------|--------|-------|
| iOS App Store | 1024 × 1024 px | PNG, no alpha | Master source; Apple generates all smaller sizes |
| iOS home screen | 60 × 60 pt (@2x = 120px, @3x = 180px) | Generated from master | Rounded by iOS automatically — do NOT pre-round corners |
| Android launcher (legacy) | 48 × 48 dp (up to 192px xxxhdpi) | PNG | |
| Android adaptive icon — foreground | 108 × 108 dp | PNG with transparency | Subject to circular/squircle mask; keep icon centered in safe zone |
| Android adaptive icon — background | 108 × 108 dp | Solid color layer or simple pattern | Safe zone is the inner 72dp circle |

**Safe zone rule for all sizes:** Keep the critical visual content within the center 80% of the canvas. The outer 10% on each edge may be cropped on some launchers.

### Suggested icon treatments

Option A — Bold fork on red:
- Solid `#E8474C` background
- White fork glyph, centered, slightly oversized
- Optional: a subtle fork-in-the-road silhouette baked into the fork tines (one tine curves left, one right)

Option B — Fork + "F" monogram:
- The top of the fork doubles as a stylized capital F
- Red background, white mark
- Clean and legible at 29px (notification icon size)

Option C — Fork breaking a delivery bag:
- More illustrative; riskier at small sizes
- Only pursue if it reads clearly at 60px

Deliver all three as proposals before finalizing.

---

## Tab bar icons

The current app uses emoji placeholders. These need proper vector icons — line-weight consistent, same visual weight across all four, designed as a set.

| Tab | Current placeholder | Concept |
|-----|--------------------|---------| 
| Browse | 🏠 | A simple house or a grid of recipe cards — something that says "discover" |
| Search | 🔍 | Standard magnifying glass — keep it conventional |
| Favorites | ♥ | Heart — filled when active, outlined when inactive |
| Cart | 🛒 | Shopping cart or basket — filled when active, outlined when inactive |

**Specifications:**
- Size: 24 × 24 pt design canvas
- Stroke weight: 1.5–2pt at 24pt size
- Style: Outlined (inactive) / Filled or filled+stroke (active)
- Active color: `#E8474C`
- Inactive color: `#AAAAAA`
- Export: SVG (for React Native vector icon integration) + PNG @1x/2x/3x

---

## Splash / launch screen

Simple and fast — this screen shows for under a second on most devices.

- Background: `#E8474C` (brand red) or white
- Centered app icon or wordmark
- No animation needed for v1

If going with wordmark: **ForkIt** in a bold sans-serif, white on red. Same tagline treatment optional below in a lighter weight.

---

## Empty state illustrations

Each empty state needs a small illustration (not a photograph). Style should be flat, minimal, 2–3 colors from the palette.

| Screen | Empty state trigger | Suggested illustration |
|--------|--------------------|-----------------------|
| Favorites | No saved recipes yet | A heart outline with a fork inside, or a bare plate |
| Cart | Cart is empty | An empty shopping basket with a fork leaning against it |
| Search | No results found | A fork with a question mark, or a magnifying glass finding nothing |
| Grocery list | (shouldn't be empty, but fallback) | A clean blank list with a pencil |

**Specifications:**
- Canvas: 200 × 160 px
- Style: flat vector, 2–3 colors max
- Export: SVG preferred; PNG @2x fallback

---

## Typography (reference — already set in code)

The app uses React Native system fonts (San Francisco on iOS, Roboto on Android). No custom typeface is currently implemented. If a custom font is desired for headings or the wordmark, suggest options — something that feels confident but approachable, not a script or serif.

Current heading weight in use: `fontWeight: '800'` (extra-bold system font).

---

## File delivery

Please deliver:
1. **App icon:** Master 1024px PNG + Android adaptive foreground/background layers as separate PNGs
2. **Tab bar icons:** SVG set (4 icons × 2 states = 8 files) + PNG @1x/2x/3x
3. **Empty state illustrations:** SVG + PNG @2x
4. **Splash screen:** Figma frame or flat PNG @1x
5. **Figma file** (preferred) with all assets organized in labeled frames, using the color styles defined above

If proposing icon direction options, share as low-fidelity sketches or quick Figma frames before investing in polish.

---

## Questions to answer before starting

- Should the wordmark "ForkIt" be one word or two? (Current code uses one word: `ForkIt`)
- Is the tagline "Fork it, I'll cook it myself." to be used in marketing materials, or kept as in-app copy only?
- Any brand comparisons / apps whose visual tone to aim for or avoid?
