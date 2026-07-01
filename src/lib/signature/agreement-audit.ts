import { createHash } from "node:crypto";
import type { ServicePlan } from "@/generated/prisma/client";
import { getListingAgreementContent } from "@/content/listing-agreement";

export const LISTING_AGREEMENT_VERSION = "listing-agreement-v1";

export function hashListingAgreementContent(plan: ServicePlan): string {
  const content = getListingAgreementContent(plan);
  const payload = JSON.stringify({ version: LISTING_AGREEMENT_VERSION, ...content });
  return createHash("sha256").update(payload).digest("hex");
}

export async function getRequestAuditContext(): Promise<{
  ipAddress: string | null;
  userAgent: string | null;
}> {
  const { headers } = await import("next/headers");
  const headersList = await headers();
  const forwarded = headersList.get("x-forwarded-for");
  const ipAddress =
    forwarded?.split(",")[0]?.trim() ?? headersList.get("x-real-ip") ?? null;
  const userAgent = headersList.get("user-agent");

  return { ipAddress, userAgent };
}
