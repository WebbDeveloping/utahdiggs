import { prisma } from "@/lib/db";

export const DATABASE_PAGE_SIZE = 50;
const MAX_CELL_LENGTH = 120;

export type DatabaseLinkKind = "listing" | "contact";

export type DatabaseColumn = {
  key: string;
  label: string;
  link?: DatabaseLinkKind;
};

export type DatabaseTableDef = {
  key: string;
  label: string;
  columns: DatabaseColumn[];
};

export const DATABASE_TABLES = [
  {
    key: "listings",
    label: "Listings",
    columns: [
      { key: "id", label: "ID", link: "listing" },
      { key: "address", label: "Address" },
      { key: "city", label: "City" },
      { key: "status", label: "Status" },
      { key: "mlsNumber", label: "MLS #" },
      { key: "onboardingStatus", label: "Onboarding" },
      { key: "createdAt", label: "Created" },
    ],
  },
  {
    key: "contacts",
    label: "Contacts",
    columns: [
      { key: "id", label: "ID", link: "contact" },
      { key: "name", label: "Name" },
      { key: "email", label: "Email" },
      { key: "phone", label: "Phone" },
      { key: "createdAt", label: "Created" },
    ],
  },
  {
    key: "customers",
    label: "Customers",
    columns: [
      { key: "id", label: "ID" },
      { key: "email", label: "Email" },
      { key: "name", label: "Name" },
      { key: "phone", label: "Phone" },
      { key: "createdAt", label: "Created" },
    ],
  },
  {
    key: "users",
    label: "Users",
    columns: [
      { key: "id", label: "ID" },
      { key: "name", label: "Name" },
      { key: "email", label: "Email" },
      { key: "role", label: "Role" },
      { key: "active", label: "Active" },
      { key: "createdAt", label: "Created" },
    ],
  },
  {
    key: "documents",
    label: "Documents",
    columns: [
      { key: "id", label: "ID" },
      { key: "listingId", label: "Listing", link: "listing" },
      { key: "name", label: "Name" },
      { key: "uploadedAt", label: "Uploaded" },
    ],
  },
  {
    key: "offers",
    label: "Offers",
    columns: [
      { key: "id", label: "ID" },
      { key: "listingId", label: "Listing", link: "listing" },
      { key: "status", label: "Status" },
      { key: "offerPrice", label: "Offer price" },
      { key: "buyersAgent", label: "Buyer's agent" },
      { key: "createdAt", label: "Created" },
    ],
  },
  {
    key: "showings",
    label: "Showings",
    columns: [
      { key: "id", label: "ID" },
      { key: "listingId", label: "Listing", link: "listing" },
      { key: "showingDate", label: "Date" },
      { key: "showingTime", label: "Time" },
      { key: "buyersAgent", label: "Buyer's agent" },
      { key: "createdAt", label: "Created" },
    ],
  },
  {
    key: "sell-inquiries",
    label: "Sell inquiries",
    columns: [
      { key: "id", label: "ID" },
      { key: "firstName", label: "First name" },
      { key: "lastName", label: "Last name" },
      { key: "email", label: "Email" },
      { key: "status", label: "Status" },
      { key: "createdAt", label: "Created" },
    ],
  },
  {
    key: "seller-requests",
    label: "Seller requests",
    columns: [
      { key: "id", label: "ID" },
      { key: "listingId", label: "Listing", link: "listing" },
      { key: "sellerName", label: "Seller" },
      { key: "status", label: "Status" },
      { key: "requestSummary", label: "Summary" },
      { key: "newPrice", label: "New price" },
      { key: "reductionOption", label: "Option" },
      { key: "createdAt", label: "Created" },
    ],
  },
  {
    key: "listing-contacts",
    label: "Listing contacts",
    columns: [
      { key: "id", label: "ID" },
      { key: "listingId", label: "Listing", link: "listing" },
      { key: "contactId", label: "Contact", link: "contact" },
      { key: "role", label: "Role" },
      { key: "createdAt", label: "Created" },
    ],
  },
  {
    key: "closing-team",
    label: "Closing team",
    columns: [
      { key: "id", label: "ID" },
      { key: "name", label: "Name" },
      { key: "role", label: "Role" },
      { key: "company", label: "Company" },
      { key: "email", label: "Email" },
      { key: "createdAt", label: "Created" },
    ],
  },
  {
    key: "weekly-stats",
    label: "Weekly stats",
    columns: [
      { key: "id", label: "ID" },
      { key: "listingId", label: "Listing", link: "listing" },
      { key: "weekEnding", label: "Week ending" },
      { key: "lifetimeViews", label: "Lifetime views" },
      { key: "createdAt", label: "Created" },
    ],
  },
  {
    key: "market-data",
    label: "Market data",
    columns: [
      { key: "id", label: "ID" },
      { key: "city", label: "City" },
      { key: "reportDate", label: "Report date" },
      { key: "homesForSale", label: "For sale" },
      { key: "avgHomePrice", label: "Avg price" },
      { key: "createdAt", label: "Created" },
    ],
  },
  {
    key: "listing-intakes",
    label: "Listing intakes",
    columns: [
      { key: "id", label: "ID" },
      { key: "listingId", label: "Listing", link: "listing" },
      { key: "status", label: "Status" },
      { key: "currentStep", label: "Step" },
      { key: "submittedAt", label: "Submitted" },
      { key: "updatedAt", label: "Updated" },
    ],
  },
  {
    key: "agreement-templates",
    label: "Agreement templates",
    columns: [
      { key: "id", label: "ID" },
      { key: "slug", label: "Slug" },
      { key: "displayName", label: "Name" },
      { key: "version", label: "Version" },
      { key: "isActive", label: "Active" },
      { key: "createdAt", label: "Created" },
    ],
  },
  {
    key: "email-templates",
    label: "Email templates",
    columns: [
      { key: "id", label: "ID" },
      { key: "slug", label: "Slug" },
      { key: "displayName", label: "Name" },
      { key: "subject", label: "Subject" },
      { key: "updatedAt", label: "Updated" },
    ],
  },
  {
    key: "email-brand",
    label: "Email brand settings",
    columns: [
      { key: "id", label: "ID" },
      { key: "primaryColor", label: "Primary" },
      { key: "updatedAt", label: "Updated" },
    ],
  },
  {
    key: "agreement-signatures",
    label: "Agreement signatures",
    columns: [
      { key: "id", label: "ID" },
      { key: "listingId", label: "Listing", link: "listing" },
      { key: "customerId", label: "Customer" },
      { key: "signerName", label: "Signer" },
      { key: "signerEmail", label: "Email" },
      { key: "signedAt", label: "Signed" },
    ],
  },
  {
    key: "offer-documents",
    label: "Offer documents",
    columns: [
      { key: "id", label: "ID" },
      { key: "offerId", label: "Offer" },
      { key: "name", label: "Name" },
      { key: "url", label: "URL" },
      { key: "uploadedAt", label: "Uploaded" },
    ],
  },
  {
    key: "email-logs",
    label: "Email logs",
    columns: [
      { key: "id", label: "ID" },
      { key: "trigger", label: "Trigger" },
      { key: "recipient", label: "Recipient" },
      { key: "subject", label: "Subject" },
      { key: "status", label: "Status" },
      { key: "createdAt", label: "Created" },
    ],
  },
] as const satisfies readonly DatabaseTableDef[];

export type DatabaseTableKey = (typeof DATABASE_TABLES)[number]["key"];

export type DatabaseOverviewRow = {
  key: DatabaseTableKey;
  label: string;
  count: number;
};

export type DatabaseCellTone = "default" | "muted" | "id" | "status" | "boolean";

export type DatabaseCell = {
  value: string;
  href?: string;
  tone: DatabaseCellTone;
};

export type DatabaseTablePage = {
  table: DatabaseTableDef;
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
  columns: DatabaseColumn[];
  rows: DatabaseCell[][];
};

const TABLE_BY_KEY = new Map(
  DATABASE_TABLES.map((table) => [table.key, table as DatabaseTableDef]),
);

export function isDatabaseTableKey(value: string): value is DatabaseTableKey {
  return TABLE_BY_KEY.has(value as DatabaseTableKey);
}

export function getDatabaseTableDef(
  key: string,
): DatabaseTableDef | undefined {
  return TABLE_BY_KEY.get(key as DatabaseTableKey);
}

function formatDateValue(value: Date): string {
  const hasTime =
    value.getUTCHours() !== 0 ||
    value.getUTCMinutes() !== 0 ||
    value.getUTCSeconds() !== 0 ||
    value.getUTCMilliseconds() !== 0;

  if (hasTime) {
    return value.toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  }

  return value.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function formatEnumLabel(value: string): string {
  return value
    .split("_")
    .map((part) => part.charAt(0) + part.slice(1).toLowerCase())
    .join(" ");
}

function cellToneFor(column: DatabaseColumn, value: unknown): DatabaseCellTone {
  if (value == null || value === "") {
    return "muted";
  }
  if (typeof value === "boolean") {
    return "boolean";
  }
  if (
    column.key === "id" ||
    column.key.endsWith("Id") ||
    column.link
  ) {
    return "id";
  }
  if (
    column.key === "status" ||
    column.key === "role" ||
    column.key.endsWith("Status") ||
    column.key.endsWith("Role")
  ) {
    return "status";
  }
  return "default";
}

function formatCellValue(column: DatabaseColumn, value: unknown): string {
  if (value == null) {
    return "";
  }

  if (value instanceof Date) {
    return formatDateValue(value);
  }

  if (typeof value === "boolean") {
    return value ? "Yes" : "No";
  }

  if (typeof value === "number") {
    return value.toLocaleString("en-US");
  }

  if (typeof value === "bigint") {
    return value.toString();
  }

  if (typeof value === "object") {
    if (
      "toString" in value &&
      typeof value.toString === "function" &&
      value.constructor?.name === "Decimal"
    ) {
      return value.toString();
    }

    try {
      return JSON.stringify(value);
    } catch {
      return String(value);
    }
  }

  const text = String(value);
  const tone = cellToneFor(column, value);
  const display =
    tone === "status" && /^[A-Z0-9_]+$/.test(text)
      ? formatEnumLabel(text)
      : text;

  if (display.length <= MAX_CELL_LENGTH) {
    return display;
  }

  return `${display.slice(0, MAX_CELL_LENGTH)}…`;
}

function linkHref(kind: DatabaseLinkKind, id: string): string {
  if (kind === "listing") {
    return `/crm/listings/${id}`;
  }
  return `/crm/contacts/${id}`;
}

function mapRows(
  columns: DatabaseColumn[],
  records: Array<Record<string, unknown>>,
): DatabaseCell[][] {
  return records.map((record) =>
    columns.map((column) => {
      const raw = record[column.key];
      const value = formatCellValue(column, raw);
      const href =
        column.link && typeof raw === "string" && raw.length > 0
          ? linkHref(column.link, raw)
          : undefined;

      return {
        value,
        href,
        tone: cellToneFor(column, raw),
      };
    }),
  );
}

function normalizePage(page: number): number {
  if (!Number.isFinite(page) || page < 1) {
    return 1;
  }
  return Math.floor(page);
}

async function fetchTableRecords(
  key: DatabaseTableKey,
  skip: number,
  take: number,
): Promise<{ total: number; records: Array<Record<string, unknown>> }> {
  switch (key) {
    case "listings": {
      const [total, rows] = await Promise.all([
        prisma.listing.count(),
        prisma.listing.findMany({
          skip,
          take,
          orderBy: { createdAt: "desc" },
          select: {
            id: true,
            address: true,
            city: true,
            status: true,
            mlsNumber: true,
            onboardingStatus: true,
            createdAt: true,
          },
        }),
      ]);
      return { total, records: rows as Array<Record<string, unknown>> };
    }
    case "contacts": {
      const [total, rows] = await Promise.all([
        prisma.contact.count(),
        prisma.contact.findMany({
          skip,
          take,
          orderBy: { createdAt: "desc" },
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            createdAt: true,
          },
        }),
      ]);
      return { total, records: rows as Array<Record<string, unknown>> };
    }
    case "customers": {
      const [total, rows] = await Promise.all([
        prisma.customer.count(),
        prisma.customer.findMany({
          skip,
          take,
          orderBy: { createdAt: "desc" },
          select: {
            id: true,
            email: true,
            name: true,
            phone: true,
            createdAt: true,
          },
        }),
      ]);
      return { total, records: rows as Array<Record<string, unknown>> };
    }
    case "users": {
      const [total, rows] = await Promise.all([
        prisma.user.count(),
        prisma.user.findMany({
          skip,
          take,
          orderBy: { createdAt: "desc" },
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
            active: true,
            createdAt: true,
          },
        }),
      ]);
      return { total, records: rows as Array<Record<string, unknown>> };
    }
    case "documents": {
      const [total, rows] = await Promise.all([
        prisma.document.count(),
        prisma.document.findMany({
          skip,
          take,
          orderBy: { uploadedAt: "desc" },
          select: {
            id: true,
            listingId: true,
            name: true,
            uploadedAt: true,
          },
        }),
      ]);
      return { total, records: rows as Array<Record<string, unknown>> };
    }
    case "offers": {
      const [total, rows] = await Promise.all([
        prisma.offer.count(),
        prisma.offer.findMany({
          skip,
          take,
          orderBy: { createdAt: "desc" },
          select: {
            id: true,
            listingId: true,
            status: true,
            offerPrice: true,
            buyersAgent: true,
            createdAt: true,
          },
        }),
      ]);
      return { total, records: rows as Array<Record<string, unknown>> };
    }
    case "showings": {
      const [total, rows] = await Promise.all([
        prisma.showing.count(),
        prisma.showing.findMany({
          skip,
          take,
          orderBy: { createdAt: "desc" },
          select: {
            id: true,
            listingId: true,
            showingDate: true,
            showingTime: true,
            buyersAgent: true,
            createdAt: true,
          },
        }),
      ]);
      return { total, records: rows as Array<Record<string, unknown>> };
    }
    case "sell-inquiries": {
      const [total, rows] = await Promise.all([
        prisma.sellInquiry.count(),
        prisma.sellInquiry.findMany({
          skip,
          take,
          orderBy: { createdAt: "desc" },
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            status: true,
            createdAt: true,
          },
        }),
      ]);
      return { total, records: rows as Array<Record<string, unknown>> };
    }
    case "seller-requests": {
      const [total, rows] = await Promise.all([
        prisma.sellerRequest.count(),
        prisma.sellerRequest.findMany({
          skip,
          take,
          orderBy: { createdAt: "desc" },
          select: {
            id: true,
            listingId: true,
            sellerName: true,
            status: true,
            requestSummary: true,
            newPrice: true,
            reductionOption: true,
            createdAt: true,
          },
        }),
      ]);
      return { total, records: rows as Array<Record<string, unknown>> };
    }
    case "listing-contacts": {
      const [total, rows] = await Promise.all([
        prisma.listingContact.count(),
        prisma.listingContact.findMany({
          skip,
          take,
          orderBy: { createdAt: "desc" },
          select: {
            id: true,
            listingId: true,
            contactId: true,
            role: true,
            createdAt: true,
          },
        }),
      ]);
      return { total, records: rows as Array<Record<string, unknown>> };
    }
    case "closing-team": {
      const [total, rows] = await Promise.all([
        prisma.closingTeamMember.count(),
        prisma.closingTeamMember.findMany({
          skip,
          take,
          orderBy: { createdAt: "desc" },
          select: {
            id: true,
            name: true,
            role: true,
            company: true,
            email: true,
            createdAt: true,
          },
        }),
      ]);
      return { total, records: rows as Array<Record<string, unknown>> };
    }
    case "weekly-stats": {
      const [total, rows] = await Promise.all([
        prisma.weeklyStat.count(),
        prisma.weeklyStat.findMany({
          skip,
          take,
          orderBy: { createdAt: "desc" },
          select: {
            id: true,
            listingId: true,
            weekEnding: true,
            lifetimeViews: true,
            createdAt: true,
          },
        }),
      ]);
      return { total, records: rows as Array<Record<string, unknown>> };
    }
    case "market-data": {
      const [total, rows] = await Promise.all([
        prisma.marketData.count(),
        prisma.marketData.findMany({
          skip,
          take,
          orderBy: { createdAt: "desc" },
          select: {
            id: true,
            city: true,
            reportDate: true,
            homesForSale: true,
            avgHomePrice: true,
            createdAt: true,
          },
        }),
      ]);
      return { total, records: rows as Array<Record<string, unknown>> };
    }
    case "listing-intakes": {
      const [total, rows] = await Promise.all([
        prisma.listingIntake.count(),
        prisma.listingIntake.findMany({
          skip,
          take,
          orderBy: { updatedAt: "desc" },
          select: {
            id: true,
            listingId: true,
            status: true,
            currentStep: true,
            submittedAt: true,
            updatedAt: true,
          },
        }),
      ]);
      return { total, records: rows as Array<Record<string, unknown>> };
    }
    case "agreement-templates": {
      const [total, rows] = await Promise.all([
        prisma.agreementTemplate.count(),
        prisma.agreementTemplate.findMany({
          skip,
          take,
          orderBy: { createdAt: "desc" },
          select: {
            id: true,
            slug: true,
            displayName: true,
            version: true,
            isActive: true,
            createdAt: true,
          },
        }),
      ]);
      return { total, records: rows as Array<Record<string, unknown>> };
    }
    case "email-templates": {
      const [total, rows] = await Promise.all([
        prisma.emailTemplate.count(),
        prisma.emailTemplate.findMany({
          skip,
          take,
          orderBy: { updatedAt: "desc" },
          select: {
            id: true,
            slug: true,
            displayName: true,
            subject: true,
            updatedAt: true,
          },
        }),
      ]);
      return { total, records: rows as Array<Record<string, unknown>> };
    }
    case "email-brand": {
      const [total, rows] = await Promise.all([
        prisma.emailBrandSettings.count(),
        prisma.emailBrandSettings.findMany({
          skip,
          take,
          orderBy: { updatedAt: "desc" },
          select: {
            id: true,
            primaryColor: true,
            updatedAt: true,
          },
        }),
      ]);
      return { total, records: rows as Array<Record<string, unknown>> };
    }
    case "agreement-signatures": {
      const [total, rows] = await Promise.all([
        prisma.agreementSignature.count(),
        prisma.agreementSignature.findMany({
          skip,
          take,
          orderBy: { signedAt: "desc" },
          select: {
            id: true,
            listingId: true,
            customerId: true,
            signerName: true,
            signerEmail: true,
            signedAt: true,
          },
        }),
      ]);
      return { total, records: rows as Array<Record<string, unknown>> };
    }
    case "offer-documents": {
      const [total, rows] = await Promise.all([
        prisma.offerDocument.count(),
        prisma.offerDocument.findMany({
          skip,
          take,
          orderBy: { uploadedAt: "desc" },
          select: {
            id: true,
            offerId: true,
            name: true,
            url: true,
            uploadedAt: true,
          },
        }),
      ]);
      return { total, records: rows as Array<Record<string, unknown>> };
    }
    case "email-logs": {
      const [total, rows] = await Promise.all([
        prisma.emailLog.count(),
        prisma.emailLog.findMany({
          skip,
          take,
          orderBy: { createdAt: "desc" },
          select: {
            id: true,
            trigger: true,
            recipient: true,
            subject: true,
            status: true,
            createdAt: true,
          },
        }),
      ]);
      return { total, records: rows as Array<Record<string, unknown>> };
    }
    default: {
      const _exhaustive: never = key;
      throw new Error(`Unknown database table: ${_exhaustive}`);
    }
  }
}

async function countTable(key: DatabaseTableKey): Promise<number> {
  switch (key) {
    case "listings":
      return prisma.listing.count();
    case "contacts":
      return prisma.contact.count();
    case "customers":
      return prisma.customer.count();
    case "users":
      return prisma.user.count();
    case "documents":
      return prisma.document.count();
    case "offers":
      return prisma.offer.count();
    case "showings":
      return prisma.showing.count();
    case "sell-inquiries":
      return prisma.sellInquiry.count();
    case "seller-requests":
      return prisma.sellerRequest.count();
    case "listing-contacts":
      return prisma.listingContact.count();
    case "closing-team":
      return prisma.closingTeamMember.count();
    case "weekly-stats":
      return prisma.weeklyStat.count();
    case "market-data":
      return prisma.marketData.count();
    case "listing-intakes":
      return prisma.listingIntake.count();
    case "agreement-templates":
      return prisma.agreementTemplate.count();
    case "email-templates":
      return prisma.emailTemplate.count();
    case "email-brand":
      return prisma.emailBrandSettings.count();
    case "agreement-signatures":
      return prisma.agreementSignature.count();
    case "offer-documents":
      return prisma.offerDocument.count();
    case "email-logs":
      return prisma.emailLog.count();
    default: {
      const _exhaustive: never = key;
      throw new Error(`Unknown database table: ${_exhaustive}`);
    }
  }
}

export async function getDatabaseOverview(): Promise<DatabaseOverviewRow[]> {
  return Promise.all(
    DATABASE_TABLES.map(async (table) => ({
      key: table.key,
      label: table.label,
      count: await countTable(table.key),
    })),
  );
}

export async function getDatabaseTablePage(
  key: DatabaseTableKey,
  pageInput: number,
): Promise<DatabaseTablePage> {
  const table = getDatabaseTableDef(key);
  if (!table) {
    throw new Error(`Unknown database table: ${key}`);
  }

  const page = normalizePage(pageInput);
  const skip = (page - 1) * DATABASE_PAGE_SIZE;
  const { total, records } = await fetchTableRecords(
    key,
    skip,
    DATABASE_PAGE_SIZE,
  );
  const totalPages = Math.max(1, Math.ceil(total / DATABASE_PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const needsRefetch = safePage !== page;

  const pageRecords = needsRefetch
    ? (
        await fetchTableRecords(
          key,
          (safePage - 1) * DATABASE_PAGE_SIZE,
          DATABASE_PAGE_SIZE,
        )
      ).records
    : records;

  return {
    table,
    total,
    page: safePage,
    pageSize: DATABASE_PAGE_SIZE,
    totalPages,
    columns: table.columns,
    rows: mapRows(table.columns, pageRecords),
  };
}
