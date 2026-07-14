# Canonical thresholds (build against these)

Primary rules for **price health** coaching. Prototype numbers are not sacred; Seller Guide language + this file win.

Implement in `src/lib/consumer/coaching-rules.ts`.

## Shared vocabulary

| Term | Meaning |
| --- | --- |
| **Active / pending offers** | Count of `Offer` rows with status **`PENDING_REVIEW`**. Used for CTA hide and Overview highlight. Do **not** use denormalized `Listing.activeOffers` unless sync is proven current. |
| **Offers submitted** | All `Offer` rows for the listing (any status). Useful for totals / depth pages — not required for v1 verdict. |
| **Last week** | Latest usable `weekly_stats` window (skip empty trailing weeks). |
| **Market avg DOM** | City avg from market / listing data. If missing → **null** (neutral). **Do not invent 45.** |

### Active offers (old vs new)

| Era | Meaning |
| --- | --- |
| Prototype | Airtable listing field **`Active Offers`** (maintained outside the portal). |
| App (canonical) | Live count of **`PENDING_REVIEW`** offers. |

## Price health verdict (primary)

One Overview verdict. Drives copy + whether the price CTA shows.

### Gates that force “not asking for a cut”

Treat as **On pace** (no price CTA) when any of:

- Listing status is Under Contract, Pending, Closed, or Cancelled
- Active (`PENDING_REVIEW`) offers ≥ **1**
- Days since last price reduction **&lt; 19** (fresh cut — don’t nag again yet)

### Otherwise score

| Verdict | When | CTA |
| --- | --- | --- |
| **Price review** | Status Active, 0 pending offers, not in fresh-cut window, **and** (DOM ≥ **21** **or** lifetime showings ≥ **10**) | Show “Request a price change” |
| **Watch** | Status Active, 0 pending offers, not Price review, **and** (DOM ≥ **12** **or** soft recent showings — e.g. DOM ≥ 14 and showings last week ≤ **2**) | No CTA; short “keep an eye on traffic / feedback” |
| **On pace** | Everyone else (early listing, or converting) | No CTA |

**Why line** (examples): “28 days on market, 12 showings, no pending offers” / “Offer pending — focus on terms” / “Reduced 5 days ago — giving the new price time to work.”

Aligned with Seller Guide watch signs (21+ DOM / 10+ showings with no contract). Not the prototype’s DOM ≥ 12-only CTA.

## DOM vs market (one color model)

| Condition | Color |
| --- | --- |
| No market avg | Neutral / default |
| DOM ≤ avg | Green / success |
| DOM ≤ **1.25 ×** avg | Amber / warning |
| DOM > **1.25 ×** avg | Red / error |

Use on Overview DOM chip (and optional Your Market listing-vs-city DOM). Same bands everywhere.

## Price reduction (context only on Overview)

| Fact | Show on Overview? |
| --- | --- |
| Reduction count + last date | Yes, as plain stats when count &gt; 0 |
| Separate 19/27 amber/red “days since drop” card | **No** — use &lt;19 only to **suppress** Price review CTA |

## Price reduction options (Seller requests — when built)

| Option | Rule |
| --- | --- |
| A (~5%) | `ceil(list × 0.955)` to nearest **$5,000** |
| B (~3%) | `ceil(list × 0.975)` to nearest **$5,000** |
| C | Custom |
| “DOM &gt; 40” on Option A | Copy only — do not hide A by DOM |

## Explicitly out of scope for v1 rules module

Do **not** implement as product requirements from the prototype archive:

- Market Signal Weak / On Track / Strong tables + dots
- Conversion funnel % benchmarks widget
- Your Market MoM border / absorption / status-badge scoring
- Blair Note generation templates

(Seller Guide may still mention educational funnel / showings heuristics.)

## Deferred

**Blair Note generation** — display stored `blairNote` only. See [blair-note.md](./blair-note.md).

## Seller Guide

When changing a verdict gate number in code, update Guide copy in the same PR if the verbal benchmark changes.
