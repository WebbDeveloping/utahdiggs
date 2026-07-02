import { z } from "zod";
import {
  buildUarAgreementPrefill,
  UAR_BUYER_AGENT_PERCENT_OPTIONS,
} from "@/content/uar-listing-agreement";
import type { ServicePlan } from "@/generated/prisma/client";
import type { UarAgreementFormValues } from "@/types/uar-agreement";

const multipleOwnersSchema = z.enum(["YES", "NO"]);
const disputeMediationSchema = z.enum(["SHALL", "MAY AT THE OPTION OF THE PARTIES"]);
const attachmentTermsSchema = z.enum(["ARE", "ARE NOT"]);
const firptaStatusSchema = z.enum(["IS", "IS NOT"]);

export const uarAgreementFormSchema = z
  .object({
    multipleOwners: multipleOwnersSchema,
    seller1FirstName: z.string().trim().min(1, "Seller first name is required."),
    seller1LastName: z.string().trim().min(1, "Seller last name is required."),
    seller2FirstName: z.string().trim(),
    seller2LastName: z.string().trim(),
    propertyAddress: z.string().trim().min(1, "Property address is required."),
    propertyUnit: z.string().trim(),
    propertyCity: z.string().trim().min(1, "City is required."),
    propertyState: z.string().trim().min(2, "State is required."),
    propertyZip: z.string().trim().min(5, "Zip code is required."),
    buyerAgentPercent: z.enum(UAR_BUYER_AGENT_PERCENT_OPTIONS, {
      message: "Buyer agent compensation is required.",
    }),
    buyerAgentDollar: z.string().trim(),
    sellerDeniesBuyerCompAgreement: z.boolean(),
    disputeMediation: disputeMediationSchema,
    sqFtSources: z.array(z.string()),
    sqFtOther: z.string().trim(),
    attachmentTerms: attachmentTermsSchema,
    firptaStatus: firptaStatusSchema,
    sellerEmail: z.string().trim().email("A valid seller email is required."),
    seller1Phone: z.string().trim(),
    seller2Email: z.string().trim(),
    seller2Phone: z.string().trim(),
    seller1SignatureUrl: z.string().trim().min(1, "Seller signature is required."),
    seller1InitialsUrl: z.string().trim().min(1, "Seller initials are required."),
    seller2SignatureUrl: z.string().trim(),
    seller2InitialsUrl: z.string().trim(),
    signatureMethod: z.enum(["draw", "type"]),
    signedDate: z.string().trim().min(1, "Signed date is required."),
  })
  .superRefine((values, ctx) => {
    if (values.multipleOwners !== "YES") return;

    if (!values.seller2FirstName.trim()) {
      ctx.addIssue({
        code: "custom",
        path: ["seller2FirstName"],
        message: "Second seller first name is required.",
      });
    }
    if (!values.seller2LastName.trim()) {
      ctx.addIssue({
        code: "custom",
        path: ["seller2LastName"],
        message: "Second seller last name is required.",
      });
    }
    if (!values.seller2SignatureUrl.trim()) {
      ctx.addIssue({
        code: "custom",
        path: ["seller2SignatureUrl"],
        message: "Second seller signature is required.",
      });
    }
    if (!values.seller2InitialsUrl.trim()) {
      ctx.addIssue({
        code: "custom",
        path: ["seller2InitialsUrl"],
        message: "Second seller initials are required.",
      });
    }
    if (!values.seller2Email.trim()) {
      ctx.addIssue({
        code: "custom",
        path: ["seller2Email"],
        message: "Second seller email is required.",
      });
    } else if (!z.string().email().safeParse(values.seller2Email).success) {
      ctx.addIssue({
        code: "custom",
        path: ["seller2Email"],
        message: "A valid second seller email is required.",
      });
    }
    if (!values.seller2Phone.trim()) {
      ctx.addIssue({
        code: "custom",
        path: ["seller2Phone"],
        message: "Second seller phone is required.",
      });
    }
  });

export type ParsedUarAgreementForm = z.infer<typeof uarAgreementFormSchema>;

function readBoolean(formData: FormData, name: string): boolean {
  return formData.get(name)?.toString() === "on";
}

function readStringArray(formData: FormData, name: string): string[] {
  return formData
    .getAll(name)
    .map((value) => value.toString().trim())
    .filter(Boolean);
}

export function parseUarAgreementFormData(formData: FormData): {
  values?: UarAgreementFormValues;
  fieldErrors?: Record<string, string>;
} {
  const raw = {
    multipleOwners: formData.get("multipleOwners")?.toString().trim(),
    seller1FirstName: formData.get("seller1FirstName")?.toString(),
    seller1LastName: formData.get("seller1LastName")?.toString(),
    seller2FirstName: formData.get("seller2FirstName")?.toString() ?? "",
    seller2LastName: formData.get("seller2LastName")?.toString() ?? "",
    propertyAddress: formData.get("propertyAddress")?.toString(),
    propertyUnit: formData.get("propertyUnit")?.toString() ?? "",
    propertyCity: formData.get("propertyCity")?.toString(),
    propertyState: formData.get("propertyState")?.toString(),
    propertyZip: formData.get("propertyZip")?.toString(),
    buyerAgentPercent: formData.get("buyerAgentPercent")?.toString(),
    buyerAgentDollar: formData.get("buyerAgentDollar")?.toString() ?? "",
    sellerDeniesBuyerCompAgreement: readBoolean(formData, "sellerDeniesBuyerCompAgreement"),
    disputeMediation: formData.get("disputeMediation")?.toString().trim(),
    sqFtSources: readStringArray(formData, "sqFtSources"),
    sqFtOther: formData.get("sqFtOther")?.toString() ?? "",
    attachmentTerms: formData.get("attachmentTerms")?.toString().trim(),
    firptaStatus: formData.get("firptaStatus")?.toString().trim(),
    sellerEmail: formData.get("sellerEmail")?.toString(),
    seller1Phone: formData.get("seller1Phone")?.toString() ?? "",
    seller2Email: formData.get("seller2Email")?.toString() ?? "",
    seller2Phone: formData.get("seller2Phone")?.toString() ?? "",
    seller1SignatureUrl: formData.get("seller1SignatureUrl")?.toString(),
    seller1InitialsUrl: formData.get("seller1InitialsUrl")?.toString(),
    seller2SignatureUrl: formData.get("seller2SignatureUrl")?.toString() ?? "",
    seller2InitialsUrl: formData.get("seller2InitialsUrl")?.toString() ?? "",
    signatureMethod: formData.get("signatureMethod")?.toString().trim(),
    signedDate: formData.get("signedDate")?.toString(),
  };

  const parsed = uarAgreementFormSchema.safeParse(raw);
  if (parsed.success) {
    return { values: parsed.data };
  }

  const fieldErrors: Record<string, string> = {};
  for (const issue of parsed.error.issues) {
    const key = issue.path[0]?.toString();
    if (key && !fieldErrors[key]) {
      fieldErrors[key] = issue.message;
    }
  }

  return { fieldErrors };
}

export function buildDefaultUarAgreementFormValues(input: {
  address: string;
  city: string;
  state: string;
  zip: string;
  sellerEmail: string;
  sellerPhone?: string;
  sellerFirstName?: string;
  sellerLastName?: string;
}): UarAgreementFormValues {
  const today = new Date().toISOString().slice(0, 10);

  return {
    multipleOwners: "NO",
    seller1FirstName: input.sellerFirstName ?? "",
    seller1LastName: input.sellerLastName ?? "",
    seller2FirstName: "",
    seller2LastName: "",
    propertyAddress: input.address,
    propertyUnit: "",
    propertyCity: input.city,
    propertyState: input.state,
    propertyZip: input.zip,
    buyerAgentPercent: "1.5",
    buyerAgentDollar: "",
    sellerDeniesBuyerCompAgreement: false,
    disputeMediation: "MAY AT THE OPTION OF THE PARTIES",
    sqFtSources: [],
    sqFtOther: "",
    attachmentTerms: "ARE NOT",
    firptaStatus: "IS NOT",
    sellerEmail: input.sellerEmail,
    seller1Phone: input.sellerPhone ?? "",
    seller2Email: "",
    seller2Phone: "",
    seller1SignatureUrl: "",
    seller1InitialsUrl: "",
    seller2SignatureUrl: "",
    seller2InitialsUrl: "",
    signatureMethod: "draw",
    signedDate: today,
  };
}

export function getUarAgreementPrefillForPlan(
  plan: ServicePlan,
  listing: {
    address: string;
    city: string;
    state: string;
    zip: string;
    sellerEmail: string;
  },
) {
  return buildUarAgreementPrefill({
    ...listing,
    servicePlan: plan,
  });
}
