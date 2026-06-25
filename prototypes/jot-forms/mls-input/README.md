# MLS Input Form Spec

Structured YAML specification for the Utah Digs MLS listing intake form, converted from the original JotForm prototype.

**Live JotForm:** [261498349657980](https://form.jotform.com/261498349657980)

**Original raw dump:** [`raw/mls-input.txt`](raw/mls-input.txt)

## Overview

| | |
|---|---|
| Estimated time | 20–25 minutes |
| Steps | 16 |
| Save & resume | Yes (JotForm native; preserve in rebuild) |
| Fields | ~110 across all steps |

## File layout

```
form.yaml           # Form metadata and step index
conditions.yaml     # Show/hide and dynamic field rules
steps/              # One YAML file per wizard step
options/            # Shared checkbox/radio option lists ($ref from steps)
raw/mls-input.txt   # Original monolithic dump (reference only)
scripts/            # Conversion and validation utilities
```

## Steps

| # | File | Title |
|---|------|-------|
| 01 | `steps/01-owners.yaml` | Owners |
| 02 | `steps/02-primary-owner.yaml` | Primary Owner |
| 03 | `steps/03-listing-address-schools.yaml` | Listing Address & Schools |
| 04 | `steps/04-hoa-solar.yaml` | HOA & Solar |
| 05 | `steps/05-property-details.yaml` | Property Details |
| 06 | `steps/06-level-breakdown.yaml` | Breakdown By Level |
| 07 | `steps/07-interior-systems.yaml` | Interior Systems |
| 08 | `steps/08-exterior-parking.yaml` | Exterior & Parking |
| 09 | `steps/09-pool-roof-yard.yaml` | Pool, Roof & Yard |
| 10 | `steps/10-utilities-zoning-terms.yaml` | Utilities, Zoning & Terms |
| 11 | `steps/11-personal-property.yaml` | Personal Property / Conveyances |
| 12 | `steps/12-buyer-showings.yaml` | Buyer Showings |
| 13 | `steps/13-title-company.yaml` | Title Company |
| 14 | `steps/14-remarks.yaml` | Remarks |
| 15 | `steps/15-photos.yaml` | Photos |
| 16 | `steps/16-signature.yaml` | Signature |

> **Note:** The source dump labeled two sections as "Slide 9". They are split here into steps 09 (pool/roof/yard) and 10 (utilities/zoning/terms).

## Field schema

Each field in a step file uses:

```yaml
- id: q33-flooring
  label: Flooring
  type: checkbox          # text | textarea | radio | checkbox | matrix | file | signature | content | ...
  required: true
  jotform:
    id: 33
    name: q33_flooring[]
  $ref: options/q33-flooring.yaml   # large option lists
```

- `jotform.id` / `jotform.name` — preserved for migration from JotForm submissions
- `status: hidden-in-jotform` — field was hidden in scraped HTML; see `conditions.yaml`
- `$ref` — points to shared options under `options/`

## Dynamic logic

See [`conditions.yaml`](conditions.yaml) for:

- Level matrix row count (`levelCount` → `q117-2level117`)
- Pool features when pool = Yes
- Garage/carport capacity when parking types selected
- Owner vs tenant showing contact flows
- Alternate title company when Prime Title declined
- Secondary owner signature when two owners

## Known gaps

Documented in `form.yaml` → `gaps` and `conditions.yaml` → `knownGaps`:

1. **Agent-only WFRMLS Matrix fields** (listing dates, agent IDs, BAC, listing type, dual/VAR rate) are intentionally omitted — Utah Digs staff enter these when submitting to MLS.
2. **Steps 1–4 and newly added WFRMLS fields** lack JotForm field IDs in the dump (`jotform.id: TODO`).

## WFRMLS coverage (spec update)

Fields added to align with [WFRMLS Form B](https://pscdocs.utah.gov/gas/16docs/1605715/290527ExAWFR_MLSResListInputForm11-29-2016.pdf) seller requirements:

| Step | Added fields |
|------|--------------|
| 02 Primary Owner | Secondary owner name, phone, email (conditional) |
| 03 Listing Address | Listing address, county, quadrant, short sale, non-standard address + directions |
| 04 HOA & Solar | HOA fee/month, HOA contact (conditional) |
| 05 Property Details | Construction status, tax parcel #, P.U.D. type, effective year built; style now required |
| 06 Level Breakdown | Basement finished |
| 07 Interior Systems | Window coverings, amenities; accessibility & interior special features surfaced |
| 08 Exterior & Parking | Exterior special features surfaced; driveway now required |
| 09 Pool, Roof & Yard | Lot facts, animals/pets |
| 10 Utilities & Terms | Water, telecommunications, environmental certs; storage/zoning/terms now required |
| 14 Remarks | HOA remarks (conditional), exclusions remarks |

## Regenerating from raw

```bash
node prototypes/jot-forms/mls-input/scripts/convert.mjs
node prototypes/jot-forms/mls-input/scripts/validate.mjs
```

## Next steps (implementation)

This spec is reference material for replacing JotForm per [REBUILD-PLAN.md](../../docs/REBUILD-PLAN.md) Phase 3. A follow-up can generate TypeScript types from these YAML files and build a multi-step React form.
