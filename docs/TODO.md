# Utah Digs — To Do

## Product / feature work

- [x] **Buyer commission default** — Make the buyers % in onboarding default to 2.5% (2½ percent).

- [ ] **Bulk photo upload for listings** — Add bulk photo upload for a listing, capped at **20 photos max**.

- [x] **"Your market" page** — Slim city snapshot only (inventory / sales / pricing). Not a second coaching engine; Overview keeps price health + CTA. See `docs/coaching-rules/your-market.md`.

- [ ] **Single plan only** — Remove the two different plan options; think through what the one plan should be and update onboarding accordingly.
  - Note: If we keep 1%, they do a Zoom call. If they do 1.5%, Blair goes to their house.
  - Note: At 1.5%, they might also get an interior designer and photographer.
  - Note: Listing agreements would also differ by plan. Once they select a plan, they should not be able to change it in the agreement.

## MLS input form (consumer intake)

UX / field fixes for `/account/listings/new/mls-input`.

- [x] **Default country to United States** — N/A for current address UI (no country field). Geocoding already scopes to `us` (`countrycodes=us`).

- [x] **“Non-standard address? (See directions)”** — Rewrote label/description; Yes still reveals `directionsRemarks`.

- [x] **Quadrant (NW / NE / SW / SE)** — Removed from consumer MLS intake (hidden). VA/agent fills at MLS entry time.

- [x] **Validation: scroll / focus first error on Next** — On failed Next/Submit, scroll/focus first invalid field and list missing labels near the action buttons.

- [ ] **Solar follow-up questions when Solar = Yes** — Today “Does the property have solar?” is Yes/No only (HOA already has conditional follow-ups; solar does not). When **Yes**, show additional fields. Recommended starter set (Utah / UAR solar guidance + MLS practicality):
  - **Ownership** (required): Owned / Leased / Power Purchase Agreement (PPA) — must-have.
  - **If Leased or PPA** (dynamic): solar company name; approx. monthly payment; remaining term / expiration; is the agreement transferable to buyer?
  - **Useful for all Yes answers**: year installed; system size (kW) if known; battery storage? (Yes/No/Unknown); any loan or lien (e.g. PACE / UCC)? (Yes/No/Unknown); documents available to upload later? (Yes/No).
  - Keep seller burden light; agents can chase nuances. Mirror the existing HOA conditional pattern in `conditions.yaml`.

- [x] **“None” exclusivity on multi-selects** — Selecting `"None"` clears other options; selecting any other option clears `"None"`.

- [x] **Photos step label shows `field-44`** — Labeled as “Property photos” (id unchanged for mapping).

- [x] **Post-submit redirect to account** — Redirects to `/account?submitted=1` with success banner on the dashboard.

## MLS handoff (VA workflow)

- [x] **MLS Queue page** — `/crm/mls-queue` with submitted intakes, Open intake / Approve, admin VA settings (default Agent + fallback email). Intake-submitted emails route to the configured VA.
- [ ] **Easy MLS copy workflow** — Think through a simple way a VA can copy all MLS info and photos from our site into the actual MLS, then get the MLS# back to us.

## Offers

- [ ] **Offer submission** — Figure out a way someone (buyer’s agent) can make an offer on a listing.

## Verification & approval

- [ ] **Homeowner identity verification** — Figure out how to verify the homeowner is who they say they are. Can be done manually by Blair on a video call; may need a way to collect photo ID or similar.

- [x] **Require MLS# on approve** — Approve action and dialog require MLS number before going live.
- [ ] **Improve the approve flow** — Replace the simple “approve” button with a better internal review process:
  - Checklist of everything the team needs to verify before approval (listing details, sq ft, owner identity, etc.)
