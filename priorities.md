# ForkIt — weighted project priorities

This file is the canonical framework for prioritizing features and architecture decisions.
It complements [`SPEC.md`](./SPEC.md): `SPEC.md` defines behavior, this file defines tradeoff weighting.

## Precedence and gates

1. **Security gate (hard stop):** Any option that violates [`../SECURITY.md`](../SECURITY.md) is rejected regardless of score.
2. **Weighted scoring:** Surviving options are scored by the weighted model below.
3. **Simplicity tie-break (Rule #3):** If scores are within `0.05`, choose the simpler option to implement and maintain.

This ordering reflects umbrella [`AGENTS.md`](../AGENTS.md) philosophy:
Rule #1 safety, then Rule #2 efficiency, then Rule #3 simplicity/reuse.

## Weighted dimensions (v1 baseline)

Weights sum to **1.00**.

| Dimension | Weight | Why it matters |
|-----------|--------|----------------|
| Safety and trust (Rule #1) | 0.22 | Protects reputation and users; no secrets in repos or unsafe data handling. |
| Offline reliability and data integrity | 0.18 | Core product promise in [`SPEC.md`](./SPEC.md): local-first and usable without network. |
| Shared household value | 0.18 | Enables shared favorites/history/leftovers/group planning outcomes. |
| Low ops burden | 0.16 | Keeps infra and maintenance costs low for sustained development. |
| Grocery efficiency and bulk reuse | 0.12 | Supports practical meal planning and shopping value. |
| Variety outcomes | 0.08 | Enforces meal diversity and avoids repetitive suggestions. |
| Delivery speed (Rule #2) | 0.04 | Keeps iteration velocity healthy without violating safety. |
| Simplicity and reuse (Rule #3) | 0.02 | Favors fewer moving parts and reuse of proven patterns. |

## Scoring method

For each option:

1. Assign each dimension a score from `0` to `5`.
2. Compute:

`total = Σ(weight_i * (score_i / 5))`

`total` is between `0.00` and `1.00`.

### Interpretation

- `>= 0.75`: strong candidate
- `0.60 - 0.74`: viable with tradeoffs
- `< 0.60`: usually defer or redesign

## Example scoring (architecture)

Comparison requested in planning discussions:

- Option A: **Supabase managed backend + email magic-link + household invite**
- Option B: **Google Sheets primary backend + ad hoc sharing**

| Dimension | Weight | A Score | A Weighted | B Score | B Weighted |
|-----------|--------|---------|------------|---------|------------|
| Safety and trust | 0.22 | 4.0 | 0.176 | 2.0 | 0.088 |
| Offline reliability and data integrity | 0.18 | 4.0 | 0.144 | 2.0 | 0.072 |
| Shared household value | 0.18 | 4.5 | 0.162 | 2.0 | 0.072 |
| Low ops burden | 0.16 | 4.0 | 0.128 | 3.5 | 0.112 |
| Grocery efficiency and bulk reuse | 0.12 | 4.0 | 0.096 | 2.5 | 0.060 |
| Variety outcomes | 0.08 | 4.0 | 0.064 | 2.5 | 0.040 |
| Delivery speed | 0.04 | 3.5 | 0.028 | 3.0 | 0.024 |
| Simplicity and reuse | 0.02 | 3.5 | 0.014 | 3.0 | 0.012 |
| **Total** | **1.00** |  | **0.812** |  | **0.480** |

Result: Option A is clearly preferred.

## Review cadence

- Revisit weights **at each phase boundary** in [`PLAN.md`](./PLAN.md) or at least monthly during active development.
- Trigger immediate review when either occurs:
  - New regulatory/security constraint
  - Major product pivot (for example, sync model change)
  - Repeated roadmap conflicts where this model feels wrong

## Change log

| Date | Change | Reason |
|------|--------|--------|
| 2026-04-15 | Initial weighted model created | Establish one canonical decision framework across product, security, and architecture tradeoffs. |
