# Utah Digs — Functionality Inventory & Rebuild Plan

> Reference for rebuilding the seller portal and backend on **Vercel Postgres + your own CRM + your own forms** — without Airtable, Zapier, or JotForm.
>
> Source material: `prototypes/Design Lab - Glide V2.html`, `prototypes/Utah-Digs-Stack-Flow.html`, `prototypes/info.txt`, `prototypes/Utah-Digs-Portfolio-Workflow.html`

---

## Current architecture (what exists today)

| Layer | Today | Your target |
|---|---|---|
| Marketing site | Next.js in `src/` (V1, no backend) | Same repo, keep building |
| Seller portal | Static HTML at portal.utahdigs.com | Next.js `src/app/portal/` |
| Database | Airtable "Anna" base | Vercel Postgres |
| CRM source | Lofty CRM → Zapier → Airtable | Your CRM → API → Postgres |
| Forms | JotForm (offers, co-sellers, uploads, price auth) | Your forms → API → Postgres |
| Email | Resend (via Airtable automations) | Resend (via your app / cron jobs) |
| Traffic data | Listtrac weekly email → Airtable | Email parser or manual import → Postgres |
| Showings | Aligned Showings email → Airtable | Email parser or API → Postgres |
| Market data | Boldtrail email → Python parser → Airtable | Email parser or manual import → Postgres |

---

## Airtable tables → Postgres equivalents

These are the tables currently used by the live portal prototype. Field names are preserved as-is so you can map data during migration.

### 1. `listings`

**Purpose:** Core record for each property. Portal auth, hero stats, routing, and most tabs read from here.

| Field | Type (approx) | Used for |
|---|---|---|
| Address | text | Property header |
| City, State, Zip | text | Header, market tab filter |
| List Price | number | Dashboard, offers comparison |
| Beds, Baths, Sqft | text/number | Property details |
| MLS Number | text | Display |
| List Date | date | DOM calculation |
| Status | enum | Active, Under Contract, Pending, Closed, Cancelled |
| Portal Slug | text | URL routing (`portal.utahdigs.com/[slug]`) |
| Passcode | text | Login PIN (last 4 of phone) |
| Sellers | link → sellers | Auth email verification |
| Offer Form URL | url | MLS agent remarks link (auto-generated today) |
| Blair Note | long text | Weekly coaching note on dashboard |
| Blair Note Date | date | When note was written |
| Latest Views | number | Hero stat (denormalized) |
| Latest Saves | number | Hero stat |
| Latest Showings | number | Hero stat (showings tab uses live count instead) |
| Price Reduction Date | date | CTA / coaching |
| Price Reduction Count | number | Dashboard card |
| Active Offers | number | Tab badge (offers tab uses live count instead) |
| Market Avg DOM | number | DOM vs market comparison |
| Escrow Officer | link → closing_team | Seller Requests tab contact |
| Transaction Coordinator | link → closing_team | Seller Requests tab contact |
| Co-Seller 1/2/3 Email | email | Co-owner portal access |
| Portfolio Group | text | Multi-listing portfolio routing |

**Rebuild:** Your CRM creates/updates this row when a listing goes active. App generates `portal_slug` + `passcode` + `offer_form_url` on create.

---

### 2. `sellers`

**Purpose:** Seller identity for login and welcome emails.

| Field | Used for |
|---|---|
| Name | Display, auth |
| Email | Login verification |
| Phone | Passcode source (last 4 digits) |

**Rebuild:** CRM owns contacts. Link sellers to listings via a join table (`listing_sellers`).

---

### 3. `showings`

**Purpose:** Showings tab — date, agent, feedback, week-over-week stats.

| Field | Used for |
|---|---|
| Listing | FK → listings |
| Showing Date | Sort, stats, charts |
| Showing Time | Table display |
| Showing Label | Formatted date display |
| Buyer's Agent | Table display |
| Feedback | Agent feedback text |

**Source today:** Aligned Showings emails (confirmation, daily report, feedback) → Airtable.

**Rebuild:** Email ingestion service or manual CRM entry. Match feedback to showing by agent name + address.

---

### 4. `weekly_stats`

**Purpose:** Web Traffic tab, hero views/saves, conversion funnel, weekly charts.

| Field | Used for |
|---|---|
| Listing | FK → listings |
| Week Ending | Sort, chart labels |
| Listtrac Total (30d) | Total views (rolling 30d cumulative) |
| URE Views (30d) | UtahRealEstate.com |
| Zillow Views (30d) | Zillow |
| Realtor.com Views (30d) | Realtor.com |
| Homes.com Views (30d) | Homes.com |
| Trulia Views (30d) | Trulia |
| URE Favorites (cumulative) | Saves/favorites |
| Lifetime Views | All-time views |

**Logic note:** Portal computes *this week's* views by subtracting previous week's cumulative values.

**Source today:** Listtrac weekly email → Airtable (Sunday evening).

**Rebuild:** Cron job + email parser, or CSV upload in CRM admin. Cannot generate this data yourself — depends on Listtrac.

---

### 5. `offers`

**Purpose:** Offers tab, contract hero when Under Contract.

| Field | Used for |
|---|---|
| Listing | FK → listings |
| Submitted Date | Sort, display |
| Offer Price | Display, vs list price |
| Buyer's Agent | Display |
| Financing Type | Display |
| Status | Pending Review, Accepted, Declined, Expired, Cancelled |
| Contract Price | Under-contract hero (may differ from offer) |
| Settlement Date | Contract card |
| Seller Concessions | Contract card |
| Buyer Due Diligence Deadline | Contract card |
| Home Warranty | Contract card |
| Financing/Appraisal Deadline | Contract card |
| Seller Disclosure Deadline | Contract card |

**Source today:** JotForm offer submission (partially wired). Blair manually updates status to Accepted.

**Rebuild:** Your offer intake form → API → Postgres. PDF storage (S3/Vercel Blob). Email notifications via Resend.

---

### 6. `market_data`

**Purpose:** "Your Market" tab — city-level stats, Blair's Take, absorption rate, coaching.

| Field | Used for |
|---|---|
| City | Filter by listing city |
| Report Date | "Updated …" label |
| Homes For Sale | Stat card |
| Homes For Sale Change Pct | Trend |
| New To Market | Stat card |
| New To Market Change Pct | Trend |
| Homes Sold Count | Stat card |
| Homes Sold Change Pct | Trend |
| Avg DOM | Stat card |
| DOM Change Pct | Trend |
| Avg Home Price | Stat card |
| Avg Home Price Change Pct | Trend |
| Avg Sold Price | Stat card |
| Avg Sold Price Change Pct | Trend |
| Price Per Sq Ft | Stat card |
| Price Per Sq Ft Change Pct | Trend |
| Price Reductions Count | Banner + stat |
| Price Reductions Change Pct | Trend |
| Sold To Listed Ratio | Absorption rate |
| Sold To Listed Change Pct | Trend |

**Source today:** Boldtrail weekly market report email → `boldtrail_market_parser.py` → Airtable. 8 cities.

**Rebuild:** Keep the parser; point output at Postgres instead of Airtable. Sunday cron to process new reports. Cannot generate Boldtrail data yourself.

---

### 7. `seller_requests`

**Purpose:** Inline portal requests (description update, open house, message to Blair).

| Field | Used for |
|---|---|
| Seller Name | From logged-in seller |
| Seller Email | From logged-in seller |
| Property Address | From listing |
| Submitted | Timestamp |
| Status | New (default) |
| Request Summary | Auto-generated label |
| Update Types | Description-Remarks, Open House (multi-select) |
| Message | Free text |
| Open House Date/Time | Open house requests |

**Rebuild:** Portal POST → API → Postgres. Notify Blair via email. No external form needed.

---

### 8. `closing_team`

**Purpose:** Escrow officer and transaction coordinator contact cards.

| Field | Used for |
|---|---|
| Name | Display + initials avatar |
| Role | Escrow Officer / Transaction Coordinator |
| Type | Color coding |
| Company | Display |
| Phone | Click-to-call |
| Email | Click-to-email |
| Website | Link |

**Defaults today:** Spencer Steed (escrow), Erin White (TC). Overridable per listing.

**Rebuild:** Seed table in Postgres. CRM or admin UI to assign per listing.

---

## JotForm forms → your form replacements

These are the external forms referenced in prototypes. You will replace all of them with pages in your app or CRM.

| Current form | ID | Purpose | Your replacement |
|---|---|---|---|
| Seller Requests (general) | `261687718662976` | Misc seller requests with prefilled name/address | **Already inline in portal** — keep as native UI (description, open house, message) |
| Photo upload | `261691528757975` | Seller uploads listing photos | CRM or portal upload page + Vercel Blob/S3 |
| Document upload | `261690316727966` | Seller uploads transaction docs | Portal Documents tab upload |
| Price reduction authorization | `261688727945072` | Signature + current/new price | Portal price reduction flow with e-sign or typed confirmation |
| Offer submission | `261706179400050` | Buyer's agent submits offer (16 fields + 2 PDFs) | Public `/offer/[listing-slug]` form in your app |
| Co-seller access | `261705955416058` | Add 1–6 co-owners to portal | Portal or CRM co-seller invite flow |
| MLS listing intake (marketing site) | `261498349657980` | New seller completes MLS input form | CRM onboarding flow or `/list` page on marketing site |

---

## Portal features — summary

### Authentication & routing

- **Individual portal:** `portal.utahdigs.com/[slug]` — email + passcode login
- **Portfolio mode:** `portal.utahdigs.com/portfolio?client=X` — multi-listing sellers see all properties; click-through bypasses login (`?from=portfolio`)
- **Routing logic:** If seller has multiple active listings → portfolio page; otherwise individual portal + welcome email

**Rebuild:** Session-based auth in Next.js. Hash passcodes in DB. Portfolio = query listings by seller/contact ID.

---

### Tab 1 — Dashboard / Weekly performance

- Hero stat boxes: views, saves, showings (with week-over-week change)
- DOM vs market average badge
- Blair Note (manual coaching text + date)
- Market Signal widget (good/bad vs last week)
- Conversion funnel (views → saves → showings → offers)
- Price reduction CTA bar (appears based on DOM + showings + no accepted offer)
- Coaching tips driven by stat thresholds

**Rebuild:** All computed in app from `listings`, `weekly_stats`, `showings`, `offers`. Blair Note = CRM text field or admin editor. "AI notes" mentioned in info.txt appear to be Blair Note + computed coaching — no separate AI table found in prototype.

---

### Tab 2 — Offers

- Active offer highlight card
- All offers table with status badges
- Contract card when status is Under Contract / Pending (dates, concessions, deadlines)
- Offer count on tab button

**Rebuild:** Your offer form writes to `offers`. Admin/CRM updates status to Accepted and fills contract fields.

---

### Tab 3 — Showings

- Recent showings table with feedback
- Stats: total, this week vs last week, avg per week
- Showings chart over time
- Funnel integration

**Rebuild:** Depends on Aligned Showings data ingestion (see limitations below).

---

### Tab 4 — Web Traffic

- Per-portal breakdown (URE, Zillow, Realtor.com, Homes.com, Trulia)
- Weekly views chart
- Views per save, views per showing, views per offer ratios
- Lifetime vs this-week counts

**Rebuild:** Depends on Listtrac data ingestion (see limitations below).

---

### Tab 5 — Your Market

- City-filtered market snapshot from `market_data`
- Blair's Take (auto-generated text from market signal scores)
- Absorption rate zone pills
- Price reduction banner (green/amber/red based on % of sellers cutting price)
- 9 stat cards with week-over-week change and coaching tips

**Rebuild:** Boldtrail parser → Postgres. Blair's Take = app logic (already in prototype JS — port to server or client).

---

### Tab 6 — Seller Guide

- Static educational content (how to read stats, prep home, etc.)

**Rebuild:** Markdown or CMS page. No database needed.

---

### Tab 7 — Documents

- Listing agreements, MLS input, authorization forms
- Upload new documents (currently JotForm)

**Rebuild:** File storage + `documents` table (listing_id, name, url, uploaded_at, uploaded_by). Your upload UI.

---

### Tab 8 — Seller Requests

- Price reduction options (calculated tiers with coaching copy)
- Price auth form (currently JotForm with signature)
- Inline: description update, open house request, message Blair
- Closing team contacts (escrow + TC)
- Contact Blair / title company info

**Rebuild:** Native forms → `seller_requests` table. Price reduction = your form with confirmation step. Closing team from `closing_team` table.

---

## Email automations (currently via Airtable + Resend)

| Trigger | Recipient | Content |
|---|---|---|
| New listing created | Seller | Portal link + PIN + co-seller form link |
| New listing created | Blair (agent) | New listing alert + offer form URL for MLS |
| Every Monday | Seller | Weekly update (views, showings, market, Blair note) |
| Offer submitted | Blair | Full offer details + PDFs |
| Offer submitted | Seller | "Offer received" notification |
| Co-seller added | Co-seller | Portal welcome (pending in current stack) |
| Price reduction submitted | Blair | Authorization details |

**Rebuild:** Resend stays. Trigger from your app on record create + Vercel Cron for Monday emails.

---

## Rebuild plan (phased)

### Phase 0 — Foundation
- [ ] Vercel Postgres + Drizzle or Prisma
- [ ] Schema for all 8 tables above (+ `documents`, `listing_sellers`, `users`)
- [ ] Next.js API routes / server actions pattern
- [ ] Resend integration

### Phase 1 — Your CRM (replaces Lofty + Zapier + Airtable create flow)
- [ ] Contacts (sellers) CRUD
- [ ] Listings CRUD with status workflow
- [ ] On "listing active": generate slug, passcode, offer form URL
- [ ] Send welcome + agent notification emails
- [ ] Portfolio group logic (multi-listing detection)

### Phase 2 — Portal core (replaces portal HTML + Airtable reads)
- [ ] Auth (email + passcode → session)
- [ ] Dashboard with listing data
- [ ] Seller Guide (static)
- [ ] Seller Requests (inline forms → DB)
- [ ] Closing team display
- [ ] Portfolio page + routing

### Phase 3 — Your forms (replaces JotForm)
- [ ] Public offer intake form + PDF upload
- [ ] Price reduction authorization flow
- [ ] Document + photo upload
- [ ] Co-seller invite flow
- [ ] MLS listing intake (marketing → CRM)

### Phase 4 — Data feeds (hardest part)
- [ ] Listtrac email parser → `weekly_stats`
- [ ] Aligned Showings email parser → `showings`
- [ ] Boldtrail email parser → `market_data` (port existing Python script)
- [ ] Sunday stats refresh + Monday email cron

### Phase 5 — Intelligence layer
- [ ] Blair Note editor in CRM
- [ ] Auto coaching copy (port prototype logic)
- [ ] Blair's Take / market signal (port prototype logic)
- [ ] Optional: LLM-generated weekly summary from stats (replacing manual "AI notes")

### Phase 6 — Migration & cutover
- [ ] Export Airtable → import Postgres
- [ ] Point portal.utahdigs.com at new Next.js app
- [ ] Retire Airtable, Zapier, JotForm

---

## What you can build yourself vs. what depends on third parties

### Fully yours to build
- CRM (contacts, listings, transactions)
- Portal UI and all tabs
- Auth, routing, portfolio logic
- All forms (offers, uploads, price reduction, co-seller)
- Seller request intake
- Email automations (Resend)
- Blair Note / coaching copy logic
- Document storage
- Market data *display* (once data is in DB)

### Depends on external services (data in, not replaceable)
| Service | What it provides | Alternative if unavailable |
|---|---|---|
| **Listtrac** | Listing traffic by portal (views, saves) | Manual CSV upload in CRM; or skip Web Traffic tab |
| **Aligned Showings** | Showing confirmations + agent feedback | Manual entry in CRM; or integrate if they offer API |
| **Boldtrail** | City market reports (9 stats × 8 cities) | Manual entry; different report provider; or scrape/parse another source |
| **MLS** | Listing syndication, offer links in remarks | Cannot replace — still need MLS for go-live |
| **Resend** (or similar) | Transactional email delivery | Any email API (SendGrid, Postmark, etc.) |

### Partially automatable / may need manual steps
| Flow | Why |
|---|---|
| Offer → Accepted → Under Contract | Blair confirms final terms today via email; needs CRM workflow |
| Co-seller access | Currently manual approval before welcome email |
| Weekly Blair Note | Manual write today; could later be AI-assisted from stats |
| Price reduction → MLS update | Form captures intent; agent still submits to MLS manually |

### Security fix (required in rebuild)
Current portal exposes Airtable API token in client-side JavaScript. Your rebuild **must** keep all DB/API access server-side.

---

## Suggested Postgres table list (quick reference)

```
contacts          (sellers, co-sellers, agents)
listings
listing_contacts  (many-to-many, role: primary/co-seller)
showings
weekly_stats
offers
market_data
seller_requests
closing_team
documents
email_log         (optional — track sent automations)
```

---

## Open questions to decide before building

1. **Passcode auth** — keep PIN-only or add magic links / optional password?
2. **Offer PDFs** — where stored? (Vercel Blob, S3, Cloudflare R2)
3. **E-sign for price reductions** — typed name OK or need DocuSign/HelloSign?
4. **Listtrac / Boldtrail / Aligned** — keep email parsing or negotiate API access?
5. **Multi-tenant** — one brokerage (Utah Digs) or white-label for others later?

---

*Last updated: June 2026 — based on prototype inventory in this repo.*
