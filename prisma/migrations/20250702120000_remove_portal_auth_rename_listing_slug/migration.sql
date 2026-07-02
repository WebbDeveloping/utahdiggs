-- Drop Blair PIN portal sessions
DROP TABLE IF EXISTS "PortalSession";

-- Remove passcode column (PIN login)
ALTER TABLE "Listing" DROP COLUMN "passcodeHash";

-- Rename public URL slug (still used for /homes and /offer routes)
ALTER TABLE "Listing" RENAME COLUMN "portalSlug" TO "listingSlug";
