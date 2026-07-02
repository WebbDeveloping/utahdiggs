-- CreateTable
CREATE TABLE "AgreementTemplate" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "version" TEXT NOT NULL,
    "displayName" TEXT NOT NULL,
    "revisionLabel" TEXT,
    "blobPathname" TEXT NOT NULL,
    "localFilename" TEXT,
    "contentHash" TEXT,
    "byteSize" INTEGER,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AgreementTemplate_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "AgreementTemplate_slug_idx" ON "AgreementTemplate"("slug");

-- CreateIndex
CREATE INDEX "AgreementTemplate_isActive_idx" ON "AgreementTemplate"("isActive");

-- CreateIndex
CREATE UNIQUE INDEX "AgreementTemplate_slug_version_key" ON "AgreementTemplate"("slug", "version");

-- Seed existing templates from agreement-template-definitions + manifest
INSERT INTO "AgreementTemplate" (
    "id",
    "slug",
    "version",
    "displayName",
    "revisionLabel",
    "blobPathname",
    "localFilename",
    "contentHash",
    "byteSize",
    "isActive",
    "createdAt",
    "updatedAt"
) VALUES
(
    'seed_uar_exclusive_right_to_sell',
    'uar-exclusive-right-to-sell',
    '2024-11-05',
    'Exclusive Right to Sell Listing Agreement & Agency Disclosure',
    'UAR Form 8 — Revised 11.5.2024',
    'templates/agreements/uar-exclusive-right-to-sell-2024-11-05.pdf',
    'Exclusive Right to Sell Listing Agreement - UAR.pdf',
    '177186c76af6956e195d519312638cf66a6d488d973ba94a74bd984aa49b4d81',
    143573,
    true,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
),
(
    'seed_uar_data_form_residential',
    'uar-data-form-residential',
    '2024-11-05',
    'Data Form — Residential',
    'URE Data Form — Residential',
    'templates/agreements/uar-data-form-residential-2024-11-05.pdf',
    'Data Form - Residential - URE.pdf',
    '171642f74c453f185a4354c4753fa775850ec0f19d6758006065122b0cc13d84',
    330712,
    true,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
);
