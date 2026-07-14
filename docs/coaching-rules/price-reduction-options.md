# Price reduction options

## V1 scope — **in when building Seller requests price flow**

Not required for the first Overview verdict/CTA if the CTA can deep-link to a simple “request price change” message. Full A/B/C calculator is the proper handoff when they act.

## Purpose

Structured ~5% / ~3% / custom drop choices with precomputed prices.

## Rules

See [canonical-thresholds.md](./canonical-thresholds.md) — **Price reduction options**.

| Option | Pricing |
| --- | --- |
| A | `ceil(list × 0.955)` to nearest $5k |
| B | `ceil(list × 0.975)` to nearest $5k |
| C | Custom |

“DOM &gt; 40” on A is copy only.

## Rebuild status

- Phase 1 form shipped: A/B/Custom → `SellerRequest` with `price_reduction`
- E-sign / authorization still future (Phase 2)
