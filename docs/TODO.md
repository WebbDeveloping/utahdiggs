# Glidere — To Do

## Product / feature work

- [x] **Buyer commission default** — Make the buyers % in onboarding default to 2.5% (2½ percent).

- [x] **Bulk photo upload for listings** — Add bulk photo upload for a listing, capped at **20 photos max**.

- [x] **"Your market" page** — Slim city snapshot only (inventory / sales / pricing). Not a second coaching engine; Overview keeps price health + CTA. See `docs/coaching-rules/your-market.md`.

- [ ] **Plan offerings + photo tour gating (keep 1% / 1.5%)** — Jul 24 call keeps two plans; do **not** collapse to a single plan until Blair defines offerings.
  - Blair: bullet the seller-facing feature differences (Zoom vs in-home, designer/photographer, etc.).
  - 1% → seller uploads own photos; 1.5% → option to opt in to a professional photo tour.
  - Listing agreement copy may still differ by plan; once selected, plan should not be changeable in the agreement.
  - See also **Photo tour selection after MLS** below.

### Listing agreement (UAR / onboarding e-sign)

- [x] **Buyer-agent compensation tooltip (§2.3)** — Help text explaining the offered buyer-agent commission amount.
- [x] **Flat commission → percentage defaults to 0** — When the seller enters a flat commission amount, clear/zero the percentage field (and vice versa if needed).
- [x] **§2.1 / deny-comp checkbox default unchecked** — `sellerDeniesBuyerCompAgreement` defaults unchecked (lives under §2.3 in the current form).
- [x] **§2.2 tooltip** — Unrepresented buyer fee help text present on section 2.2.

### Branding

- [x] **Utah Digs → Glide RE brand sweep** — No remaining “Utah Digs” / “UtahDigs” in `src/` or `public/`. Brokerage line uses Kelly Right RE.

## Marketing home (signed out)

Signed-out landing page (`HeroSection` / `SavingsCalculatorCard` / `SellInquiryForm` / `SiteHeader` / `SiteFooter`).

- [x] **Savings calculator default home value → ~$700,000** — `HOME_VALUE_DEFAULT` = 700_000.
- [x] **Less rounded corners + more padding** — Calculator + inquiry panels use tighter radius and more padding.
- [x] **Remove Sell / Buy tabs** — Replaced `HeroAddressTabs` with a single **List your home** CTA (+ “See what you’d save”).
- [x] **Remove Buy a home from hero; keep discoverable elsewhere** — Search homes in nav + footer Resources.
- [x] **Right-side calculator tweaks** — Enlarged / centered **What could you save** title; chrome polish.
- [x] **Remove “How soon do you want to sell?”** — Dropped from `SellInquiryForm`; persists `timeline: "Not specified"`.
- [x] **Reorder marketing nav** — How it works → Pricing → FAQ → Search homes → Contact.
- [x] **Kelly Right logo (disclosure)** — Footer shows `/kelly-right-re.png` with brokerage line.

## MLS input form (consumer intake)

UX / field fixes for `/account/listings/new/mls-input`. Spec lives under `prototypes/jot-forms/mls-input/`; generated schema in `src/lib/mls-input/schema.ts`.

### Done (prior pass)

- [x] **Default country to United States** — N/A for current address UI (no country field). Geocoding already scopes to `us`.
- [x] **“Non-standard address?”** — Rewrote label/description; Yes still reveals `directionsRemarks`.
- [x] **Quadrant (NW / NE / SW / SE)** — Hidden from consumer intake.
- [x] **Validation: scroll / focus first error on Next**
- [x] **Solar follow-up questions when Solar = Yes**
- [x] **“None” exclusivity on multi-selects**
- [x] **Photos step label shows `field-44`** — Labeled as “Property photos”.
- [x] **Post-submit redirect to account** — `/account?submitted=1`.

### Owners & address (steps 02–03)

- [x] **Remove “HUD Owned”** — Drop from ownership entity options in `steps/02-primary-owner.yaml` (and schema/validation).
- [x] **Hide house / street direction radios** — Hide `houseNumberDirection` and `streetDirection` from the user form (still available for VA later if needed).
- [x] **Tooltip on N/S & E/W coordinates** — Add tooltip on `coordNorthSouth` / `coordEastWest` explaining Utah grid coords and that values can be approximate.
- [x] **Show listing address on file for confirmation** — Near “Is the OWNER address the SAME as the LISTING address?”, display the address already on file so the seller can confirm it’s correct.
- [x] **Listing price $ prefix** — Ensure currency UI always shows `$` in front of the number for `listingPrice`.
- [x] **Hide listing agreement dates + auto-populate from onboarding**
  - Persist / use `agreementSignedAt` from the Right to Sell listing agreement.
  - Prefill `listingEffectiveDate` = signed date.
  - Prefill `listingExpirationDate` = signed date + 6 months.
  - Hide the whole effective/expiration date section from the consumer form.
- [x] **Hide Listing Type; default ERS** — Hide `listingType`; always default to Exclusive Right to Sell (ERS) (already signed previously).
- [x] **Possession → dropdown** — Change `possession` from free text to select: **Recording**, **Negotiable** (label: “When the buyer may take possession (optional)”).
- [x] **Hide appointment / agent contact block; prefill defaults**
  - Hide from user: Contact Type, Contact for Appointments & Access, Contact Phone 1/2, Listing Agent, Co-Agent, Office Name.
  - Defaults: Contact Type = **Assistant**; Appointment contact = **ALIGNED SHOWINGS**; Phone 1 = Blair’s number; Phone 2 = empty; Listing Agent = **Blair Allen**; Co-Agent = empty; Office Name = **Kelly Right Real Estate**.
- [ ] **Admin page: listing agent / office / showing contact defaults** — CRM settings to edit appointment contact, phones, listing agent, co-agent, and office name used to prefill MLS intake (stop hardcoding forever). See Jul 24 next step.
- [x] **Non-standard address default = No** — Prefill `nonStandardAddress` to **No**.
- [x] **HOA default = No** — Prefill `hoa` to **No** (follow-ups still show when Yes).

### Conditional clear-on-No

- [x] **Clear dependent answers when parent flips to No** — If user selects Yes, fills follow-ups, then switches back to No, clear/uncheck dependents for:
  - Non-standard address → directions
  - HOA → fee / amenities / etc.
  - Solar → ownership / lease fields
  - ADU → ADU detail fields
  - (Same pattern for any similar Yes/No gates)

### Property details (step 05)

- [x] **Year built not required** — Make `yearBuilt` optional in YAML + validation.
- [x] **Hide effective year built** — Hide `effectiveYearBuilt` from consumer form.
- [x] **Hide “No assigned parcel number?”** — Hide `noAssignedParcelNumber` from user form (handle defaults so tax parcel validation still works for VA).
- [ ] **Property type → style options** — _Deferred — needs style option lists per property type._
  - Single Family → home style options (current `q51-styleof51`)
  - Condominium → condo style options
  - Mobile (w/o land) → no style options
  - Recreational / Townhouse / Twin → same as Single Family
- [x] **Hide lot/tax detail fields from user** — Hide: tax parcel number, estimated taxes, frontage, side, back, irregular shape (and related measurements as applicable).
- [x] **Hide lot size (acres) from seller** — Hidden from consumer intake; VA/agent can fill. Water / wire shares remain visible.

### Breakdown by level (step 06)

- [x] **Basement-first levels flow** — Ask “Does the property have a basement?” first; Yes shows type + finished + Basement matrix row; No skips basement fields; level count is total levels (including basement when Yes); matrix labels Basement / Main / Level 2–4.

### Checkbox layout & labels

- [x] **Multi-column checkbox groups** — Render long checkbox lists in columns instead of one vertical stack (match JotForm `form-multiple-column` where it helps).
- [x] **Pool label** — Change “Pool Available?” → “Pool Available? (including HOA)”.

### Utilities, zoning & terms (step 10)

- [x] **Confirm utilities are not pre-selected** — Audit connected utilities / water / telecom defaults; none should be auto-checked on load. Fix if any are.
- [x] **Relax required fields** — Storage and Zoning should not be required for the seller.
- [x] **Energy fields optional** — Environmental certs / energy fields are optional; utilities stay required.
- [x] **Default Terms to Cash + Conventional** — Prefill `q40-typea40` with Cash + Conventional.

### Buyer showings (step 12)

- [x] **Owner-occupied → autofill showing contacts** — Prefill Owner Showing Contact 1/2 from Primary/Secondary seller info when occupancy = Owner Occupied.
- [x] **Owner count drives showing contacts** — Contact 2 only when how-many = Two (conditions + clear-on-One).
- [x] **Hide showing instructions + key box options; set defaults**
  - Showing instructions default: “Call showing service” (or equivalent).
  - Auto-select: **Use Aligned Showings**, **Key box electronic**.
  - Hide the whole instructions / access-options block from the user.

### Title company (step 13)

- [x] **Prime → Steed Title Company** — Replace “Prime Title Co” copy with **Steed Title Company**.
- [x] **Fix broken title question label** — User saw `q207-typea207`; give a clear human label + short info about Steed (why open with them / expedite listing).

### Remarks, photos, signatures (steps 14–16)

- [x] **Remarks tooltip** — Public MLS remarks: buyers see this on MLS / Zillow / Redfin / Realtor.com; short examples of good remarks. Clarify exclusions are **not** public (with short examples of what belongs in each).
- [x] **Photo upload thumbnails** — Show actual image previews instead of a generic photo icon.
- [x] **Signature step: 1 vs 2 sellers** — Secondary signature/initials only when `ownerCount` = Two (`secondary-owner-signature` condition).

### Photo tour (post–MLS submit)

- [ ] **Photo tour selection after MLS** — Move photo/tour choice to **after** MLS intake submit (not a mid-onboarding gate).
  - Seller chooses: upload own photos **or** consent to a professional photo tour.
  - Gate by plan: 1% → self-upload path; 1.5% → allow pro tour opt-in.
  - **No** in-app photographer booking calendar — scheduling stays manual (Blair/ops).

### CRM intake display

- [x] **Readable Inclusions / Exclusions on CRM intake tab** — On `/crm/listings/[id]?tab=intake`, stop dumping raw JSON for inclusions/exclusions (and similar structured fields). Render as a clear include/exclude list for VA copy workflow.

## MLS handoff (VA workflow)

- [x] **MLS Queue page** — `/crm/mls-queue` with submitted intakes, Open intake / Approve, admin VA settings (default Agent + fallback email). Intake-submitted emails route to the configured VA.
- [x] **Easy MLS copy workflow** — Think through a simple way a VA can copy all MLS info and photos from our site into the actual MLS, then get the MLS# back to us.

- [x] **CRM: signed listing agreement easy access** — Make the exclusive right-to-sell (and related docs) easy to open from the listing CRM view (tabbed documents / one-click open).

## Account / seller dashboard

_Deprioritized until listings are live (Jul 24)._ Enrich `/account` overview stats (`AccountDashboardStatsCards` / listing header). Some city averages already exist as chips — deepen the copy and context.

- [ ] **Show seller listing address on account page** — Surface the property address more clearly on the account/dashboard page (beyond the small “Showing performance for…” line / listing switcher). Put it somewhere prominent so sellers can confirm which property they’re looking at.

- [ ] **Days on market — richer context**
  - Under the DOM number, show city average DOM (e.g. “Avg in [city]: 28 days”).
  - Below that, when over average, show a red warning like **“+35 days over average”** (delta = seller DOM − city avg). Mirror under-average in a calmer tone if useful.
  - Today this is mostly a `City avg N` chip — replace/extend with the under-number layout above.

- [ ] **Price reductions — market context** — When data is available, add a line like **“22% of Sandy listings cut price this month”** (city + % of active listings that reduced). Keep existing last-reduced date hint. Gracefully omit if market % isn’t available.

- [ ] **Showings — week-over-week delta** — Under showings last week, compare to the prior week:
  - Equal → “Same as prior week”
  - Up → “+3 more than last week”
  - Down → “−3 from prior week”
  - Needs prior-week showing count in metrics (derive from showings / weekly stats if not already exposed).

- [ ] **Dashboard layout: Recent Showings + Buyer Hotspots** — Larger primary layout boxes for recent showings and buyer hotspots (Blair Jul 24 UI direction).

## Offers

- [ ] **Offer submission** — Figure out a way someone (buyer’s agent) can make an offer on a listing.

## Verification & approval

- [ ] **Homeowner identity verification** — Figure out how to verify the homeowner is who they say they are. Can be done manually by Blair on a video call; may need a way to collect photo ID or similar.

- [x] **Require MLS# on approve** — Approve action and dialog require MLS number before going live.
- [x] **Improve the approve flow** — Replace the simple “approve” button with a better internal review process:
  - Checklist of everything the team needs to verify before approval (listing details, sq ft, owner identity, etc.)

## Won’t do / later (Jul 24)

- Photographer **booking calendar** in-app (manual scheduling instead).
- Deep **buyer search** portal work (basic Search Homes is enough for now).
- Heavy dashboard coaching polish until onboarding + homepage are live and listings are flowing.

## External / Blair-owned

- [ ] **Service offerings bullets** — Blair defines seller-facing 1% vs 1.5% feature list (feeds plan copy + photo tour gating).
- [ ] **Lofty email sequences** — Blair sets up post-onboarding client communication in Lofty (not an app build).
