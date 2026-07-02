# TEMP — Account cutover: do these first

> **Delete this file when the cutover is done.**  
> Constraint: **No Airtable** as an ongoing system. Postgres + this app is the source of truth.

---

## Phase 1 — Do these first (detailed checklists)

Each item has its own file:

| # | Step | File |
|---|------|------|
| 1 | Cutover plan | [`TEMP-01-cutover-plan.md`](./TEMP-01-cutover-plan.md) |
| 2 | Account as seller home | [`TEMP-02-account-as-seller-home.md`](./TEMP-02-account-as-seller-home.md) |
| 3 | Wire account pages to DB | [`TEMP-03-wire-account-pages.md`](./TEMP-03-wire-account-pages.md) |
| 4 | Seed real data (one-time) | [`TEMP-04-seed-real-data.md`](./TEMP-04-seed-real-data.md) |
| 5 | CRM manual entry | [`TEMP-05-crm-manual-entry.md`](./TEMP-05-crm-manual-entry.md) |

**Order:** 1 → 2 → 4 (or 5) → 3 → 5 (if not already) → then later phases below.

Note: Step 4 uses `import-airtable.ts` **once** for bootstrap only — not a live Airtable feed.

---

## 0. Decisions to lock in (before building)

- [ ] **New listing flow:** Lofty/Zapier (or manual CRM entry) creates listings in Postgres — not Airtable.
- [ ] **Seller access:** Email + password via `/login` → `/account` (portal PIN auth is gone).
- [ ] **Data feeds:** Aligned Showings, Listtrac, Boldtrail emails → dedicated Gmail inbox → parsers → Postgres.
- [ ] **Offer intake:** Public `/offer/[slug]` form in this app (replaces JotForm + Airtable Offers table).
- [ ] **Cutover date:** When active sellers stop using Airtable-backed portal links.

---

## 1. Account foundation (seller-facing)

Already working: auth, onboarding, MLS intake, listings list, documents (partial).

Still needed:

- [ ] **Replace all “portal” copy** with “account” (`seller-guide.ts`, CRM forms, MLS intake text, validation messages).
- [ ] **Welcome / go-live emails** point sellers to `/account` (verify Resend templates — MLS intake email already uses `accountLoginUrl`).
- [ ] **Listing ↔ seller linking** — confirm every active listing has a `Contact` with role SELLER whose email matches a consumer account (or invite flow).
- [ ] **Co-seller access** — invite flow so up to 3 co-sellers can sign in (replaces JotForm co-seller form).
- [ ] **Portfolio mode** — multi-listing sellers routed to a portfolio view (if still required).

---

## 2. CRM as source of truth (agent-facing)

Postgres replaces Airtable for all ops Blair/team do today in Anna base.

- [ ] **New listing in CRM** — create listing + seller contact + generate `slug`, offer form URL (no Airtable sync).
- [ ] **Approve / activate listing** — status workflow that triggers seller welcome email.
- [ ] **Blair Note** — CRM editor + display on account dashboard.
- [ ] **Offers workflow** — CRM page to review offers, update status, fill contract fields (not “coming soon”).
- [ ] **Manual data entry (interim)** — CRM forms to add/edit:
  - Showings (`Showing`)
  - Weekly traffic stats (`WeeklyStat`)
  - Market data by city (`MarketData`)
  - Seller requests (`SellerRequest`)
- [ ] **Closing team** — assign/display on listing detail.
- [ ] **Documents** — upload/organize by category for seller view.

---

## 3. Wire account UI to Postgres (replace placeholders)

These pages exist but show “coming soon”. Build read-only views first; write actions later.

- [ ] **Dashboard** — hero stats from `Listing` + counts from `Showing`, `Offer`, `WeeklyStat`.
- [ ] **Showings** (`/account/showings`) — list by seller’s listings.
- [ ] **Offers** (`/account/offers`) — list with status, price, agent.
- [ ] **Web traffic** (`/account/web-traffic`) — latest `WeeklyStat` per listing.
- [ ] **This week’s report** (`/account/this-weeks-report`) — weekly summary from stats + showings + Blair Note.
- [ ] **Your market** (`/account/your-market`) — city cards from `MarketData`.
- [ ] **Seller requests** (`/account/seller-requests`) — submit + track inline (price change, status update, etc.).
- [ ] **Seller guide** — static content OK; update “portal” → “account” language.

---

## 4. Forms that replace JotForm (no Airtable)

- [ ] **Public offer form** — `/offer/[slug]` with PDF upload → `Offer` + `OfferDocument` + agent notification.
- [ ] **Price reduction authorization** — typed confirmation or e-sign → `SellerRequest` or dedicated model.
- [ ] **Document / photo upload** — seller-scoped blob storage + agent notification.

---

## 5. Email inbox setup (outside code — do in parallel with §2–3)

Do **after** parser specs exist (save sample `.eml` files from each vendor first).

- [ ] Create dedicated Gmail inbox for automation (e.g. `automation@…` or `+aligned`, `+listtrac`, `+boldtrail` aliases).
- [ ] Forward vendor emails into that inbox:
  - **Aligned Showings** — confirmation, daily report, feedback
  - **Listtrac** — weekly traffic report
  - **Boldtrail** — weekly market report (8 cities)
- [ ] Gmail labels per feed (mirrors old `Automation/Anna/…` pattern).
- [ ] Google Cloud project + Gmail API OAuth (service account or user consent — pick one approach).
- [ ] Store credentials in env (`GOOGLE_*` vars in `.env.example`).

---

## 6. Email parsers → Postgres (code)

Build parsers only after §3 UI exists (so data has somewhere to land).

- [ ] **Parser framework** — fetch unread labeled mail, parse, upsert, mark processed, log errors (`EmailLog` model exists).
- [ ] **Listing matcher** — map email address/subject/body → `Listing` by address or MLS id (document edge cases).
- [ ] **Aligned Showings parser** → `Showing` (create/update; feedback matched by agent + address).
- [ ] **Listtrac parser** → `WeeklyStat` (one row per listing per week).
- [ ] **Boldtrail parser** → `MarketData` (port logic from `boldtrail_market_parser.py`; 9 stats × 8 cities).
- [ ] **Cron jobs** — Sunday stats refresh; Monday seller weekly email (Resend).

---

## 7. Email automations (Resend)

Replace Airtable automation scripts in `example-code/airtable-automations/`.

- [ ] Seller welcome email (account link, not portal PIN).
- [ ] Blair “new listing active” notification (offer form URL).
- [ ] Weekly seller report email (solo + portfolio variants).
- [ ] Offer received / accepted notifications.
- [ ] Document upload / seller request notifications to agent.

---

## 8. Retire old stack (after cutover)

- [ ] Stop Zapier → Airtable flows.
- [ ] Disable Airtable automations (welcome, weekly email, portfolio detect, etc.).
- [ ] Retire JotForm forms once in-app replacements are live.
- [ ] Remove or archive `scripts/import-airtable.ts` (one-time migration only — not ongoing).
- [ ] Update `portal.utahdigs.com` DNS to redirect to `/account` or deprecate subdomain.

---

## Suggested order (no Airtable)

1. **Phase 1** — [`TEMP-01`](./TEMP-01-cutover-plan.md) through [`TEMP-05`](./TEMP-05-crm-manual-entry.md)
2. **§2 CRM workflows** — listings, offers, Blair Note (beyond manual entry)
3. **§4 public offer form**
4. Save sample emails → **§5 inbox setup** → **§6 parsers**
5. **§7 automations** once data pipeline is reliable
6. **§8 retire** old tools

**Email inbox setup is step 5, not step 1.** Foundation + CRM + UI must exist first so parsed data isn’t written into a void.

---

## Already done (recent work)

- Portal PIN auth removed; `slug` renamed on listings.
- Consumer account routes, onboarding, MLS intake, basic listings/documents.
- Prisma schema ready: `Showing`, `WeeklyStat`, `Offer`, `MarketData`, `SellerRequest`, `EmailLog`.
- Resend helper + MLS intake email uses `/login` account link.
