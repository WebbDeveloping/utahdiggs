# Glide V2 Seller Portal — Feature Inventory

> Source: `prototypes/Design Lab - Glide V2.html`  
> Audience: Seller who has uploaded / listed a property and is tracking performance  
> Compared against: current `utahdigs` Next.js app (as of June 2025 rebuild)

This document lists every user-facing feature in the Glide V2 prototype, then classifies what can be built **now** (schema + infra already exist, or no external data required) vs what **requires further build-out** (missing UI, data feeds, workflows, or third-party integrations).

---

## Prototype structure at a glance

The prototype is a **seller portal dashboard** (not the pre-listing intake flow). After login, the seller sees:

- A **property hero** with live stats and coaching CTAs
- **8 tabs**: This Week's Report · Offers · Showings · Web Traffic · Your Market · Seller Guide · Documents · Seller Requests

The consumer **account area** in the app today (`/account/listings`) only covers submission status and MLS intake — it does **not** yet deliver this post-listing dashboard.

---

## 1. Authentication & routing

| # | Feature | What the seller sees |
|---|---------|---------------------|
| 1.1 | Portal login | Email + 4-digit passcode (last 4 of phone) |
| 1.2 | Sign out | Return to login |
| 1.3 | Individual portal URL | `portal.utahdigs.com/[slug]` per listing |
| 1.4 | Portfolio mode | Multi-listing sellers see all properties at `/portfolio?client=X` |
| 1.5 | Portfolio click-through | `?from=portfolio` bypasses re-login when switching listings |
| 1.6 | Welcome email | Portal link + PIN sent when listing goes active |

---

## 2. Global shell & property header

| # | Feature | What the seller sees |
|---|---------|---------------------|
| 2.1 | Seller greeting | "Hello, {firstName}" + listing status badge (Active, Under Contract, etc.) |
| 2.2 | Property identity | Full address, beds/baths/sqft, MLS context |
| 2.3 | Listing timeline | List date, last updated, "weekly snapshot from Blair" subtitle |
| 2.4 | Active listing badge | "Active Listing · Week N" (weeks since list date) |

### Hero stat row 1 (primary)

| # | Feature | What the seller sees |
|---|---------|---------------------|
| 2.5 | List price | Current price; reduction history if applicable |
| 2.6 | Days on market (DOM) | Days active + city average comparison + color badge (green/amber/red) |
| 2.7 | Showings last week | Count, lifetime total, week-over-week % change |
| 2.8 | New saves last week | Count, lifetime favorites, week-over-week change |
| 2.9 | Web views last week | Count, lifetime views, avg/week, week-over-week change |

### Hero stat row 2 (secondary)

| # | Feature | What the seller sees |
|---|---------|---------------------|
| 2.10 | Avg showings per week | Total showings ÷ weeks active |
| 2.11 | Showings per offer | Ratio with "7–10 per offer" benchmark |
| 2.12 | Price reductions | Count, total $ reduced, last reduction date |
| 2.13 | Days since price drop | Days since last reduction |

### Hero actions & contract state

| # | Feature | What the seller sees |
|---|---------|---------------------|
| 2.14 | Price adjustment CTA bar | Contextual message (DOM + showings + no contract) + button to Seller Requests |
| 2.15 | Under-contract card | Shown when status is Under Contract / Pending: contract price, settlement date, concessions, diligence deadlines, warranty, appraisal deadline, disclosure deadline |

---

## 3. Tab — This Week's Report

| # | Feature | What the seller sees |
|---|---------|---------------------|
| 3.1 | Blair Note | Agent-written weekly coaching note + date |
| 3.2 | Active offer highlight | Top card when an offer is pending/accepted (price, agent, date, vs list) |
| 3.3 | Showings last week chart | Daily bar chart for prior week |
| 3.4 | Where buyers found you chart | Platform breakdown for current week |
| 3.5 | Recent showings | Last few showings with date, agent, feedback snippet; link to full tab |
| 3.6 | Market Signal widget | Views / Saves / Showings each rated (good/neutral/bad) with coaching copy |
| 3.7 | Conversion funnel | Views → Saves → Showings → Offers with counts, rates, and benchmark hints |

---

## 4. Tab — Offers

| # | Feature | What the seller sees |
|---|---------|---------------------|
| 4.1 | Tab badge count | "Offers (N)" on tab label |
| 4.2 | Active offer card | Highlight pending-review offer(s) |
| 4.3 | Offer summary stats | Total offers, avg offer price, last offer date/agent |
| 4.4 | All offers table | Every offer with price, buyer's agent, submitted date, status badge |
| 4.5 | Status badges | Pending Review, Accepted, Declined, Expired, Cancelled |
| 4.6 | vs list price | Dollar and % difference per offer |

---

## 5. Tab — Showings

| # | Feature | What the seller sees |
|---|---------|---------------------|
| 5.1 | Tab badge count | "Showings (N)" on tab label |
| 5.2 | Summary stats | Total, last week, avg/week, showings per offer |
| 5.3 | Showings by week chart | Historical weekly bar chart |
| 5.4 | All showings list | Date, time, buyer's agent, feedback text |

---

## 6. Tab — Web Traffic

| # | Feature | What the seller sees |
|---|---------|---------------------|
| 6.1 | Web views last week | With week-over-week change |
| 6.2 | Total web views | Lifetime count |
| 6.3 | Total saves | Lifetime favorites |
| 6.4 | Views per save | Efficiency ratio + coaching tip |
| 6.5 | Views per showing | Efficiency ratio |
| 6.6 | Views per offer | Efficiency ratio |
| 6.7 | Views by portal | URE, Zillow, Realtor.com, Homes.com, Trulia — this week vs lifetime with bar fill |
| 6.8 | Weekly portal views chart | Multi-week, multi-platform line/bar chart |
| 6.9 | Saves by week chart | Zillow + URE combined weekly saves |

---

## 7. Tab — Your Market

| # | Feature | What the seller sees |
|---|---------|---------------------|
| 7.1 | City snapshot header | "{City} · market snapshot" + report date |
| 7.2 | Market status badge | Overall market mood (e.g. balanced, transitioning) |
| 7.3 | Blair's Take | Auto-generated narrative paragraph from market signals |
| 7.4 | Price reduction insight banner | Green / amber / red based on % of city sellers cutting price; CTA to price request |
| 7.5 | Signal color legend | Working for you / watch / against you / steady |
| 7.6 | Supply & demand cards | Homes for sale, new to market (30d), homes sold (30d) — value + % change + tip |
| 7.7 | Absorption rate | % monthly + Slow / Balanced / Active zone pills + tip |
| 7.8 | Pricing & value cards | Avg list price, avg sold price, price per sqft — each with % change |
| 7.9 | List vs sold price bar | Visual avg list vs avg sold + "cents on the dollar" tip |
| 7.10 | Market pressure cards | Avg DOM, sold:listed ratio — with tips |
| 7.11 | Your listing vs market | Three comparison cards: DOM, list price vs avg sold, $/sqft vs market (with progress bars) |

---

## 8. Tab — Seller Guide

| # | Feature | What the seller sees |
|---|---------|---------------------|
| 8.1 | Seller Success Playbook intro | Static Blair-authored intro |
| 8.2 | What your numbers mean | Explains views, saves, showings, showings-per-offer |
| 8.3 | Sales funnel education | Views → Showings → Offers → SOLD |
| 8.4 | Three levers sellers control | Condition, accessibility, price |
| 8.5 | Preparing your home | Curb appeal, cleaning, staging, quick fixes, what to skip |
| 8.6 | Showing day do's and don'ts | Practical showing prep |
| 8.7 | Buyer/seller psychology | Emotional framing for decisions |
| 8.8 | Marketing overview | Social, portal syndication, direct outreach |
| 8.9 | Quick FAQs | Expandable Q&A (DOM, first offer, lowballs, price cuts, under contract vs sold) |
| 8.10 | Contact footer | Blair phone, email, website |

---

## 9. Tab — Documents

| # | Feature | What the seller sees |
|---|---------|---------------------|
| 9.1 | Transaction documents header | Secure folder overview |
| 9.2 | Agency & listing folder | Listing agreement, marketing consent, MLS input sheet |
| 9.3 | Property disclosures folder | SPCD, lead paint, HOA docs |
| 9.4 | Purchase contracts folder | REPCs, counteroffers with offer-linked status |
| 9.5 | Receipts & notices folder | Earnest money, price reduction notices |
| 9.6 | Closing & settlement folder | Settlement statement, deed (empty until closing) |
| 9.7 | Uploaded by you folder | Seller-submitted docs pending agent organization |
| 9.8 | Upload document | Secure upload; confirmation email + agent notification |

---

## 10. Tab — Seller Requests

| # | Feature | What the seller sees |
|---|---------|---------------------|
| 10.1 | Price reduction options | Option A (~5% drop, recommended), Option B (~3%), Option C (custom) with coaching copy |
| 10.2 | Price reduction submit | Opens authorization form (signature + confirm amount) before MLS update |
| 10.3 | Update description / remarks | Inline textarea → submit to agent |
| 10.4 | Request open house | Date + time picker → submit |
| 10.5 | Send Blair a message | Freeform message |
| 10.6 | Closing team contacts | Title company (escrow officer) + transaction coordinator cards (name, company, phone, email, website) |

---

## 11. Email & background automations

| # | Feature | Trigger |
|---|---------|---------|
| 11.1 | Welcome email | Listing activated → seller gets portal URL + PIN |
| 11.2 | Agent new-listing alert | Listing activated → agent gets offer form URL |
| 11.3 | Monday weekly update | Cron → views, showings, market summary, Blair note |
| 11.4 | Offer submitted | Buyer agent submits → notify agent + seller |
| 11.5 | Co-seller welcome | Co-owner added → portal access email |
| 11.6 | Price reduction submitted | Seller authorizes → notify agent |
| 11.7 | Document uploaded | Seller upload → confirmation + agent alert |

---

## Implementation readiness

Legend:

- **Implement now** — Can ship with existing schema/infra; may need UI work but no blocking external data or major new systems.
- **Partial now** — Shell or read-only version possible; full prototype fidelity needs more work.
- **Requires build-out** — Depends on data ingestion, new forms, workflows, or integrations not yet live.

### Implement now

These features need **portal UI pages** but the backend model, auth, or content already exists (or needs no live feed):

| Area | Features | Why now |
|------|----------|---------|
| Auth & shell | 1.1–1.3, 2.1–2.4 | `PortalSession`, `loginPortalUser`, `portalSlug`, `passcodeHash`, contacts — implemented in `src/lib/auth/portal-auth.ts` + login API |
| Property header (basic) | 2.5, 2.6 (partial), 2.12–2.13 | `Listing` has address, beds/baths/sqft, listPrice, listDate, status, priceReductionDate/Count, marketAvgDom; DOM is calculable |
| Seller Guide | 8.1–8.10 | Static markdown/CMS — no database feeds |
| Closing team | 10.6 | `ClosingTeamMember` + listing relations; seed data exists |
| Seller requests (inline) | 10.3–10.5 | `SellerRequest` model exists; CRM requests page stub exists |
| Documents (basic) | 9.1, 9.7–9.8 (partial) | `Document` model + Vercel Blob upload pattern (consumer photos today) |
| Blair Note (display) | 3.1 | `blairNote` + `blairNoteDate` on `Listing` — needs CRM editor + portal render |
| Offers (display-only) | 4.2–4.6, 3.2 | `Offer` model with status, price, agent, contract fields — works if CRM/agent enters offers |
| Contract card | 2.15 | Contract fields on `Offer` + listing status — display when data present |
| Portal URL generation | 1.6 (partial) | `createListing` generates slug, passcode, offerFormUrl; Resend helper exists |

### Partial now (UI + logic OK, data often empty)

These can be **built and shown** but will display placeholders until feeds or manual CRM entry populate data:

| Area | Features | Gap |
|------|----------|-----|
| Hero performance stats | 2.7–2.11, 2.14 | Needs `WeeklyStat` + `Showing` + `Offer` rows (or manual CRM entry) |
| Dashboard charts | 3.3–3.5, 3.6–3.7 | Chart.js UI portable from prototype; needs weekly/showing/offer data |
| Offers tab shell | 4.1, 4.3–4.4 | UI + DB read; no public `/offer/[slug]` form yet |
| Showings tab shell | 5.1–5.4 | UI + DB read; no Aligned Showings parser yet |
| Web Traffic tab shell | 6.1–6.9 | UI + DB read; no Listtrac parser yet |
| Market tab shell | 7.1–7.2, 7.5–7.10 (listing comparisons) | City cards need `MarketData`; listing-side comparisons work from `Listing` alone |
| Documents folders | 9.2–9.6 | Need `category` on documents or agent-side organization |
| Consumer → portal bridge | — | Account shows submission status only; no link to seller portal when ACTIVE |

### Requires further build-out

These need **new systems, integrations, or workflows** before they match the prototype:

| Area | Features | Blocker |
|------|----------|---------|
| Listtrac web traffic | 2.9, 6.1–6.9, 3.4, 3.6 (views) | Email parser or CSV import → `WeeklyStat` (per-portal view fields exist in schema) |
| Aligned Showings | 2.7, 2.10–2.11, 3.3, 3.5, 5.x, 3.7 (showings) | Email parser or manual CRM entry → `Showing` |
| Boldtrail market data | 2.6 (city avg), 7.3–7.4, 7.6–7.10 | Email parser → `MarketData` (schema ready; parser not wired) |
| Coaching intelligence | 2.14, 3.6, 3.7, 7.3–7.4, 10.1 | Port prototype JS logic to server; depends on stats above |
| Price reduction auth | 10.1–10.2 | E-sign or typed confirmation flow (replaces JotForm `261688727945072`) |
| Public offer form | 4.x intake, 11.4 | `/offer/[slug]` with PDF upload (replaces JotForm `261706179400050`) |
| Document upload (full) | 9.8, 11.7 | Portal-scoped blob upload + PDF types + agent notification |
| Portfolio mode | 1.4–1.5, 11.2 variant | Portfolio page UI + `portfolioGroup` routing + session bypass |
| Co-seller access | — | Invite flow (replaces JotForm `261705955416058`) |
| Email automations | 11.1–11.7 | Templates partially started; need triggers + Monday cron |
| CRM workflows | Offer accept → under contract | Agent updates offer status + contract fields (CRM offers page is "soon") |
| MLS price sync | 10.2 | Form captures intent; agent still updates MLS manually |

---

## Current codebase vs prototype

| Layer | Status |
|-------|--------|
| Postgres schema | **Complete** for listings, contacts, portal sessions, showings, weekly stats, offers, market data, seller requests, documents, closing team |
| Portal UI (`/portal` or subdomain) | **Not started** — only `POST /api/portal/login` |
| Consumer account post-upload | **Basic** — list/submit MLS intake; no performance dashboard |
| CRM | Listings CRUD, approve listing, MLS intake review; offers/offers workflow **stubbed** |
| Data feeds (Listtrac, Aligned, Boldtrail) | **Not wired** — import script exists for Airtable migration |
| Intelligence layer (Market Signal, Blair's Take, price tiers) | **In prototype JS only** — needs port to app |

---

## Suggested build order

If the goal is to give uploaded sellers **something useful quickly**, then expand toward full Glide V2 fidelity:

1. **Portal shell + auth + property header** (listing data only)
2. **Seller Guide** (static) + **Seller Requests** (inline forms) + **Closing team**
3. **Documents** (view + upload) + **Blair Note** (CRM edit + display)
4. **Offers tab** (read-only from CRM) + **contract card**
5. **Manual data entry in CRM** for showings / weekly stats / market data (unblocks charts before parsers)
6. **Data feed parsers** (Listtrac, Aligned, Boldtrail)
7. **Coaching layer** (Market Signal, funnel, Blair's Take, price CTA, price tiers)
8. **Public offer form** + **price reduction authorization**
9. **Portfolio mode** + **email automations** + **Monday cron**

---

## Related docs

- `docs/REBUILD-PLAN.md` — Airtable → Postgres mapping and phased rebuild plan
- `prototypes/Utah-Digs-Portfolio-Workflow.html` — Multi-listing portfolio flow
- `prototypes/Design Lab - Glide V2.html` — Full interactive prototype (4,718 lines)
