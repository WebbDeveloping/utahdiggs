# TEMP 03 — Wire placeholder pages to Postgres

> Delete when cutover is done.  
> Parent index: `TEMP-account-first-steps.md`

**Goal:** Replace “coming soon” panels with read-only queries. Empty states are OK until CRM or parsers add data.

---

## Placeholder pages today

| Route | File | Prisma models |
|-------|------|---------------|
| `/account` (dashboard) | `src/app/account/(protected)/(app)/page.tsx` | `Listing`, aggregates from related tables |
| `/account/showings` | `.../showings/page.tsx` | `Showing` |
| `/account/offers` | `.../offers/page.tsx` | `Offer` |
| `/account/web-traffic` | `.../web-traffic/page.tsx` | `WeeklyStat` |
| `/account/this-weeks-report` | `.../this-weeks-report/page.tsx` | `WeeklyStat`, `Showing`, `Listing.blairNote` |
| `/account/your-market` | `.../your-market/page.tsx` | `MarketData` |
| `/account/seller-requests` | `.../seller-requests/page.tsx` | `SellerRequest` (read first; write in later pass) |

Shared placeholder component: `src/components/account/AccountPlaceholderPanel.tsx`

---

## Implementation checklist

### 1. Consumer query layer

Add query helpers under `src/lib/consumer/` (pattern: `listings-query.ts`, `listing-detail-query.ts`):

- [ ] `showings-query.ts` — showings for seller’s listing IDs, ordered by date desc.
- [ ] `offers-query.ts` — offers for seller’s listings.
- [ ] `weekly-stats-query.ts` — latest + history per listing.
- [ ] `market-data-query.ts` — by city (match listing `city` or configured market).
- [ ] `seller-requests-query.ts` — requests for seller’s listings.

All queries must:

- [ ] Scope by `getConsumerSession()` user email → seller contacts → listing IDs.
- [ ] Never leak other sellers’ data.

### 2. Page updates

- [ ] **Showings** — table or cards: date, time, agent, feedback.
- [ ] **Offers** — list: price, status, agent, submitted date (read-only).
- [ ] **Web traffic** — latest `WeeklyStat`: portal view columns, lifetime views, week ending.
- [ ] **This week’s report** — composite: stats + recent showings + Blair Note.
- [ ] **Your market** — city stats from `MarketData` (9 Boldtrail fields).
- [ ] **Dashboard** — summary counts: showings, offers, views (reuse queries).

### 3. Empty states

- [ ] Keep friendly empty copy when no rows (not “coming soon”).
- [ ] Optional: “Data updates weekly” for traffic/market tabs.

### 4. UI components

- [ ] Reuse MUI patterns from `AccountDashboard`, `MyListingsSection`, `PropertyCard`.
- [ ] Port chart ideas from `prototypes/Design Lab - Glide V2.html` only when data exists.

---

## Schema reference

- `Showing` — `prisma/schema.prisma` (~line 286)
- `WeeklyStat` — ~line 307
- `Offer` — ~line 343
- `MarketData` — search schema for city weekly fields
- `SellerRequest` — seller request enum + status

Stats helpers already exist: `src/lib/consumer/listing-stats.ts` (DOM, offer vs list formatting).

---

## Depends on

- Listings + seller contacts in Postgres (`TEMP-04-seed-real-data.md` or CRM).
- Optional: CRM manual data for demos (`TEMP-05-crm-manual-entry.md`).

---

## Acceptance criteria

- [ ] Each tab loads without error when DB has zero rows (empty state).
- [ ] Each tab shows real rows when data exists for that seller.
- [ ] No tab shows “coming soon” placeholder.
