# TEMP 04 — Seed real data (one-time)

> Delete when cutover is done.  
> Parent index: `TEMP-account-first-steps.md`

**Goal:** Populate Postgres with active listings, showings, stats, and offers so `/account` UI can be built and tested against real shapes — **without keeping Airtable as a live feed**.

---

## Important

- This is a **one-time migration**, not ongoing sync.
- After import, **all new data** enters via CRM or email parsers (see `TEMP-01-cutover-plan.md`).
- Safe to run on **local / staging** first; production only when ready to cut over.

---

## Option A — Import from Airtable (recommended for bootstrap)

Script: `scripts/import-airtable.ts`

Imports in FK order:

- Sellers → Listings → Showings → Weekly Stats → Offers → Market Data → Seller Requests → Closing Team

### Prerequisites

- [ ] Postgres running; migrations applied (`npx prisma migrate deploy`).
- [ ] Env vars:
  ```bash
  AIRTABLE_API_KEY=...
  AIRTABLE_BASE_ID=...   # Anna base
  DATABASE_URL=...
  ```

### Run

```bash
npx tsx scripts/import-airtable.ts
```

### Verify after import

- [ ] Active listings count matches Airtable.
- [ ] Sample listing has showings + weekly stats in DB (Prisma Studio or SQL).
- [ ] Seller contact emails match test consumer login.
- [ ] `airtableRecordId` populated on imported rows (traceability only).

### Post-import

- [ ] Do **not** re-run unless resetting DB — script upserts by `airtableRecordId`.
- [ ] Turn off Airtable API access in prod after cutover.

---

## Option B — Manual / CRM only (no Airtable export)

Use if you cannot or will not touch Airtable:

- [ ] Create listings + sellers in CRM.
- [ ] Blair enters showings/stats via CRM (`TEMP-05-crm-manual-entry.md`).
- [ ] Slower but valid for greenfield listings.

---

## Option C — Prisma seed

Check `prisma/seed.ts` for dev fixtures (`prisma/seed-data/mls-test-listings.ts`).

- [ ] Good for local UI dev with fake data.
- [ ] Not a substitute for production cutover data.

---

## Link seeded data to account login

- [ ] Consumer user email must match `Contact.email` where `role = SELLER`.
- [ ] Create test user via `/signup` with same email as imported seller.
- [ ] Sign in at `/login` → confirm listings appear on `/account`.

---

## Acceptance criteria

- [ ] At least one active listing with showings + weekly stats visible in DB.
- [ ] Test seller can sign in and see that listing on `/account`.
- [ ] Team agrees Airtable will not be updated after this point.
