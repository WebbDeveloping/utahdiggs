# DOM badge

## V1 scope — **in**

Color the Overview (and listing) DOM chip using the ratio model in [canonical-thresholds.md](./canonical-thresholds.md). `domBadgeColor` in `listing-stats.ts` already matches.

## Purpose

At-a-glance: DOM vs city average.

## Rules

| Condition | Color |
| --- | --- |
| No market avg | Neutral |
| DOM ≤ avg | Green |
| DOM ≤ **1.25 ×** avg | Amber |
| Above | Red |

## Outputs

- Colored chip / badge next to DOM
- Optional “City avg: N days”

## Rebuild status

- Helper wired; polish label copy as needed

## Historical

Prototype absolute +27-day gap and Your Market 1.19× / 1.50× — superseded.
