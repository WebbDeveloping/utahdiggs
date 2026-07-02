# TEMP 01 — Cutover plan

> Delete when cutover is done.  
> Parent index: `TEMP-account-first-steps.md`

**Goal:** Define how we move from Airtable + old portal to `/account` + Postgres with **no ongoing Airtable dependency**.

---

## Decision (recommended)

| Option | Description | Verdict |
|--------|-------------|---------|
| **A** | Airtable keeps feeding data during transition; app reads Airtable + Postgres | ❌ Rejected — plan is no Airtable |
| **B** | Parsers + CRM write **straight to Postgres**; Airtable retired | ✅ **Chosen** |

**One-time exception:** Run `scripts/import-airtable.ts` once to seed dev/staging (see `TEMP-04-seed-real-data.md`). That is migration, not an ongoing feed.

---

## What replaces each Airtable role

| Today (Airtable) | After cutover |
|------------------|---------------|
| Listings / sellers | CRM creates listings in Postgres |
| Showings | CRM manual entry → later Aligned email parser |
| Weekly Stats (Listtrac) | CRM manual entry → later Listtrac parser |
| Market Data (Boldtrail) | CRM manual entry → later Boldtrail parser |
| Offers | `/offer/[slug]` form + CRM review |
| Seller Requests | In-app forms on `/account` |
| Welcome / weekly emails | Resend templates + cron (port from `example-code/airtable-automations/`) |
| Portal PIN login | `/login` → `/account` (consumer auth) |

---

## Cutover checklist

### Before turning off Airtable

- [ ] All **active listings** exist in Postgres with correct seller contacts.
- [ ] Sellers can **sign in** at `/login` and see their listing(s) at `/account`.
- [ ] **Welcome email** sends account link (not portal URL + PIN) — see `TEMP-02-account-as-seller-home.md`.
- [ ] At least one data path works for showings/stats: **CRM manual entry** or **email parser** — see `TEMP-05-crm-manual-entry.md`.
- [ ] **Public offer form** live at `/offer/[slug]` (or interim: Blair enters offers in CRM only).
- [ ] Historical data seeded if needed — see `TEMP-04-seed-real-data.md`.

### Cutover day

- [ ] Stop Zapier → Airtable (new listings flow to CRM/Postgres only).
- [ ] Disable Airtable automations (welcome, weekly email, portfolio, etc.).
- [ ] Point seller communications to `/account` (update any printed/MLS materials if needed).
- [ ] Redirect or retire `portal.utahdigs.com`.

### After cutover

- [ ] Monitor Resend + parser logs (`EmailLog` table when parsers exist).
- [ ] Archive Airtable base (read-only backup); do not sync back.
- [ ] Remove `AIRTABLE_*` env vars from production once import is done.

---

## Open questions to resolve

- [ ] **Cutover date:** _______________
- [ ] **Active listing count at cutover:** _______________
- [ ] **Lofty → CRM:** Zapier rewired to API/webhook, or manual CRM entry until then?
- [ ] **Portfolio sellers:** Same cutover or phased?

---

## Related docs

- `docs/REBUILD-PLAN.md` — full phased rebuild
- `prototypes/Utah-Digs-Stack-Flow.html` — current Airtable data flows (reference only)
