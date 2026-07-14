# Coaching rules

Product brief + thresholds for seller “price health” coaching in the Next.js account portal.

The old Glide / Design Lab prototype is a **historical guide only** — do not port every widget or its exact thresholds. Goal: help sellers see how the home is selling and, when it isn’t, steer them toward a **price reduction**.

## Product goal

One question: **Is this list price working?**

If demand is soft (few showings / no pending offers / aging past the market) → price is likely too high → recommend a reduction until the home is priced to sell. Other numbers only explain **why**.

## Information architecture

**Overview (`/account`) is the main page.** Sellers should not need other nav items to learn whether to cut price.

| Surface | Role |
| --- | --- |
| **Overview** | Verdict + CTA + core stats + pending offer highlight + recent showings + light market teaser + listings roster |
| **Offers / Showings / Web traffic** | Full lists and charts (depth) |
| **Your market** | Simple city snapshot (+ optional listing-vs-city). **Not** a second coaching engine |
| **Seller requests** | Actions (price change, open house, message, …) |
| **Documents / Seller guide** | Files and education |
| **This week’s report** | Prefer **folding into Overview**; don’t keep two dashboards |

Details: [overview-and-pages.md](./overview-and-pages.md)

## Build this first

1. `src/lib/consumer/coaching-rules.ts` — pure price-health rules from [canonical-thresholds.md](./canonical-thresholds.md)
2. Overview: verdict + one price CTA + core stats (+ DOM color)
3. Pending-offer highlight + recent showings strip
4. Your Market: keep/simplify numbers (no tip/badge rainbow)
5. Price reduction A/B/C options when ready to act (request flow)

## Do **not** build as separate widgets (v1)

| Prototype idea | Why skip |
| --- | --- |
| Market Signal + rating dots | Same story as verdict + core stats |
| Conversion funnel widget | Education → Seller Guide only |
| Separate days-since urgency card | Fold suppress logic into CTA; show last reduction as a plain stat |
| Dual hero + inline price CTAs | **One** CTA on Overview |
| Your Market status badge, Blair’s Take, per-card tips, absorption zones, list-vs-sold coaching bar, city price-cut banner CTA | Duplicate / noise |
| Views-per-save / showing / offer chips on Overview | Analyst ratios → Web traffic depth only |
| Blair Note **generation** | **Deferred** — display stored note if present |

Archived prototype notes remain in the feature files below for history; **scope flags** say what to build.

## Canonical decisions (read first)

→ **[canonical-thresholds.md](./canonical-thresholds.md)** — vocabulary, price-health verdict, DOM color, CTA gates

## Feature / archive index

| Doc | Role for v1 |
| --- | --- |
| [overview-and-pages.md](./overview-and-pages.md) | **What goes where** (Overview vs depth pages) |
| [canonical-thresholds.md](./canonical-thresholds.md) | **Build defaults** |
| [price-adjustment-cta.md](./price-adjustment-cta.md) | **In scope** — one Overview CTA (via price-health verdict) |
| [dom-badge.md](./dom-badge.md) | **In scope** — color on DOM stat |
| [days-since-price-drop.md](./days-since-price-drop.md) | **Logic only** — CTA suppress; no separate urgency widget |
| [market-signal.md](./market-signal.md) | **Out of scope** as a widget (archive) |
| [conversion-funnel.md](./conversion-funnel.md) | **Out of scope** as a widget (archive) |
| [your-market.md](./your-market.md) | **Slim** — numbers + optional compare; no coaching stack |
| [price-reduction-options.md](./price-reduction-options.md) | **In scope** when building request flow |
| [blair-note.md](./blair-note.md) | Display ok; **generation deferred** |
| [seller-guide-benchmarks.md](./seller-guide-benchmarks.md) | Keep Guide aligned with canonical |

## Sources

| Source | Role |
| --- | --- |
| [`prototypes/Design Lab - Glide V2.html`](../../prototypes/Design%20Lab%20-%20Glide%20V2.html) | Historical UX only |
| [`src/content/seller-guide.ts`](../../src/content/seller-guide.ts) | Stakeholder verbal benchmarks |
| [`src/lib/consumer/listing-stats.ts`](../../src/lib/consumer/listing-stats.ts) | Existing DOM ratio helper |

## Out of scope here

MLS intake form show/hide (`conditions.yaml` / `src/lib/mls-input/conditions.ts`) is form UX, not performance coaching.
