# TEMP 02 — Account as the seller home

> Delete when cutover is done.  
> Parent index: `TEMP-account-first-steps.md`

**Goal:** Sellers use `/login` → `/account`. No portal URLs, no PIN passcodes.

---

## Already done

- [x] Portal PIN auth removed (`src/lib/auth/portal-auth.ts` deleted).
- [x] MLS intake submitted email links to account login (`src/lib/email/templates/mls-intake-submitted.ts` → `accountLoginUrl()`).
- [x] Account app shell + nav at `/account/*` (`src/components/account/AccountAppShell.tsx`).

---

## Emails to update or create

| Email | Status | Action |
|-------|--------|--------|
| MLS intake submitted (seller) | ✅ Uses `/login` | Verify copy says “account” not “portal” |
| Seller welcome / go-live | ❌ Not in app yet | Port from `example-code/.../resend-portal-login.js` — replace portal URL + PIN with `/login` + signup hint |
| Weekly seller report | ❌ Airtable automation | Build Resend template + cron (later phase) |
| Portfolio welcome | ❌ Airtable automation | Same |
| Onboarding (agent notifications) | ✅ CRM links only | No seller portal refs |

### New welcome email must include

- [ ] Link to **`/login`** (existing sellers) or **`/signup`** (new accounts).
- [ ] Property address in subject/body.
- [ ] What they can do in account (showings, offers, traffic, requests).
- [ ] **No** portal URL, **no** 4-digit PIN.
- [ ] Co-seller invite instructions (when co-seller flow exists).

### Trigger welcome email from

- [ ] CRM “Approve listing” / activate listing action (replaces Airtable automation).
- [ ] Optional: CRM “Resend account invite” button (replaces Airtable button + `resend-portal-login.js`).

---

## Portal copy to replace

Search repo for `portal` / `Portal` and update seller-facing text to **account**.

| File | Notes |
|------|-------|
| `src/content/seller-guide.ts` | Multiple “your portal” strings; tab title “Portal Dominance” |
| `src/lib/consumer/listing-validation.ts` | “seller portal access” → account access |
| `src/components/crm/AddListingForm.tsx` | “seller portal” in co-seller description |
| `src/lib/mls-input/schema.ts` | “seller app/portal” in photos help text |
| `src/app/crm/(protected)/contacts/page.tsx` | “Portal sellers”, “Portal” column — rename to Account |
| `src/app/crm/(protected)/listings/[id]/page.tsx` | “portal-slug” label — rename to listing slug / offer URL |

---

## Seller ↔ listing access

- [ ] Confirm `Contact` with role `SELLER` links to listing and email matches consumer user.
- [ ] Co-sellers (up to 3) get same access via contact records + account signup.
- [ ] `/account` queries filter listings by seller contact email (verify in `src/lib/consumer/listings-query.ts`).

---

## Acceptance criteria

- [ ] New active seller receives email with `/login` link only.
- [ ] Seller signs in and lands on `/account` with their listing(s).
- [ ] No UI or email mentions portal URL or PIN.
- [ ] Seller guide reads “account” throughout.
