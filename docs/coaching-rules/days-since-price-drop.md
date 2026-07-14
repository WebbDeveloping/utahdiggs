# Days since price drop

## V1 scope — **logic only**

Use days-since last reduction to **suppress** Price review CTA when **&lt; 19** days. On Overview, show reduction **count + last date** as plain stats — **no** separate amber/red urgency card.

See [canonical-thresholds.md](./canonical-thresholds.md).

## Purpose

After a cut, don’t immediately push another cut; later, reductions remain visible as facts.

## Rules (canonical)

| Days since last drop | Behavior |
| --- | --- |
| **&lt; 19** | Suppress price CTA |
| **19+** | CTA allowed if other Price review gates pass |
| No reduction | No suppress |

## Rebuild status

- Fields + `daysSince` exist
- Wire suppress into `coaching-rules`; skip prototype urgency widget

## Historical

Prototype DOM ≥ 12 cards + 19/27 colored borders — not building as a standalone widget.
