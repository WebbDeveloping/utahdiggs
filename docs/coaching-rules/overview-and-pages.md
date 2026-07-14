# Overview vs depth pages

How coaching and performance UI is split in the account portal. Overview is the main experience.

## Overview (`/account`)

For the **active / selected** listing (listing switcher if multi-listing):

| Block | Content |
| --- | --- |
| Price health | Verdict: **On pace** / **Watch** / **Price review** + one sentence why ([canonical-thresholds.md](./canonical-thresholds.md)) |
| Price CTA | Coaching “Request a price change” when **Price review**; permanent Active-listing button to the same form |
| Core stats | List price, DOM (± city avg color), showings (last week + total), pending offers count, views / saves (simple) |
| Reductions (light) | Count + last drop date if any — plain facts, not a second urgency widget |
| Pending offer | If any `PENDING_REVIEW`: price, agent, vs list |
| Recent showings | Last few rows + “See all showings” |
| Market teaser | 2–3 city figures (e.g. avg DOM, avg sold) + link to Your market |
| My listings / intake | Roster + MLS intake banners as today |
| Blair Note | Optional: show stored note if present — **no generation in v1** |

Sellers should answer “is my price working?” **without leaving Overview**.

## Depth pages

| Page | Purpose | Do **not** add |
| --- | --- | --- |
| **Offers** | Full offer history, statuses, vs list | Price coaching widgets / second CTA |
| **Showings** | Full log, feedback, optional weekly chart | Market Signal duplicate |
| **Web traffic** | Views/saves by source, charts, optional efficiency ratios | Overview-level coaching |
| **Your market** | City snapshot numbers; optional listing-vs-city compare | Status badge, tip rainbow, absorption coaching UI, city price-cut banner CTA |
| **Seller requests** | Price change / open house / message / description | — |
| **Documents** | Files | — |
| **Seller guide** | Static education (funnel explained here) | Live computed widgets |
| **This week’s report** | Prefer merge into Overview | A second full dashboard |
| **My listings / listing detail** | Roster / per-listing shell; detail may mirror Overview for that listing | Competing coaching systems |

## Multi-listing

Overview focuses on one listing at a time (default active listing + switcher). My listings remains the roster, not a second coaching dashboard.
