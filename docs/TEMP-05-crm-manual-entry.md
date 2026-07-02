# TEMP 05 — CRM manual entry (interim data path)

> Delete when cutover is done.  
> Parent index: `TEMP-account-first-steps.md`

**Goal:** Blair can enter showings, weekly traffic, and market data in CRM **before** email parsers exist. Unblocks `/account` dashboard immediately.

---

## Why this comes before parsers

- Email parsers need inbox setup + parser code (weeks).
- Account UI needs rows to render (`TEMP-03-wire-account-pages.md`).
- CRM entry is the **fastest no-Airtable path** to real seller-facing data.

---

## What to build in CRM

### Showings (`Showing`)

**Route (suggested):** `/crm/listings/[id]/showings` or section on listing detail page.

Fields to expose:

- Showing date, time, label
- Buyer's agent name
- Feedback (text)

Actions:

- [ ] Add showing
- [ ] Edit showing (especially feedback)
- [ ] Delete showing (optional)

Reference model: `prisma/schema.prisma` → `Showing`

---

### Weekly traffic stats (`WeeklyStat`)

**Route (suggested):** `/crm/listings/[id]/stats` or “Weekly stats” tab.

Fields (match Listtrac email columns):

- Week ending date
- Listtrac total (30d), URE/Zillow/Realtor/Homes/Trulia views
- URE favorites cumulative, lifetime views

Actions:

- [ ] Add week record
- [ ] Edit latest week (corrections)

Reference model: `WeeklyStat`

---

### Market data (`MarketData`)

**Route (suggested):** `/crm/market-data` (global, not per listing).

Fields: 9 Boldtrail stats × city (8 cities).

Actions:

- [ ] Add/update city row for week ending date

Reference: `docs/airtable/tables/` market data docs; port field names from import script.

---

### Offers (if public form not ready)

CRM offers page is currently stubbed. Minimum for account display:

- [ ] List offers per listing
- [ ] Set status, offer price, buyer agent
- [ ] Contract fields when accepted

---

## Server actions / queries

Follow existing CRM patterns:

- `src/lib/crm/listing-queries.ts`
- `src/lib/crm/listing-actions.ts`
- `src/lib/crm/create-listing.ts`

Add:

- [ ] `src/lib/crm/showing-queries.ts` + `showing-actions.ts`
- [ ] `src/lib/crm/weekly-stat-queries.ts` + `weekly-stat-actions.ts`
- [ ] `src/lib/crm/market-data-queries.ts` + `market-data-actions.ts`

---

## UX notes

- [ ] Default week ending to most recent Sunday.
- [ ] Show listing address on all forms (avoid wrong-listing entry).
- [ ] After save, seller sees data on `/account` on next load (no cache busting needed if SSR).

---

## When parsers go live

- [ ] Parsers upsert same tables — CRM entry remains for corrections/overrides.
- [ ] Document which fields parsers own vs manual-only (e.g. Blair Note always manual).

---

## Acceptance criteria

- [ ] Blair can add a showing for a listing in &lt; 2 minutes.
- [ ] Blair can add weekly stats for a listing.
- [ ] Seller refreshes `/account/showings` and `/account/web-traffic` and sees the new data.
