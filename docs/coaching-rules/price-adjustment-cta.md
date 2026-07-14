# Price adjustment CTA

## V1 scope — **in**

One Overview CTA when price-health verdict is **Price review**. See [canonical-thresholds.md](./canonical-thresholds.md) and [overview-and-pages.md](./overview-and-pages.md).

Do **not** ship a second *coaching* nudge elsewhere that repeats Price review. A permanent Active-listing button to the same form is allowed.

## Purpose

Prompt sellers to request a price change when the listing isn’t converting. Active listings also get a permanent Overview entry to the same flow.

## Inputs

| Input | Meaning |
| --- | --- |
| DOM | From list date |
| Lifetime showings | Total showings |
| Pending offers | `PENDING_REVIEW` count |
| Last price reduction date | Suppress window (&lt; 19 days) |
| Listing status | Must be Active for Price review |

## Rules

Show CTA only when verdict = **Price review** (Active, 0 pending offers, not in fresh-cut window, DOM ≥ 21 or showings ≥ 10).

## Outputs

- Headline / body: price may be high; N days, M showings, no pending offers
- Button → Seller requests / price flow

## Rebuild status

- Overview price-health verdict + coaching CTA when **Price review**
- Permanent Overview “Request a price change” button when listing is **Active**
- Both deep-link to `/account/seller-requests/price-change` (Phase 1 A/B/Custom form)
- Permanent button is a deliberate addition beyond the single coaching CTA

## Historical

Prototype used DOM ≥ 12 only and dual hero/inline CTAs — superseded.
