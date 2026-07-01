import type { ServicePlan } from "@/generated/prisma/client";

export function getListingAgreementContent(plan: ServicePlan): {
  title: string;
  sections: { heading: string; body: string }[];
} {
  const planLabel = plan === "FULL_SERVICE" ? "Full Service (1.5%)" : "Virtual (1%)";
  const planFee =
    plan === "FULL_SERVICE"
      ? "1.5% of the final sale price or $4,500, whichever is greater"
      : "1% of the final sale price or $4,500, whichever is greater";

  return {
    title: "Glide RE Listing Agreement",
    sections: [
      {
        heading: "Agreement overview",
        body: `This Listing Agreement ("Agreement") is entered into between you ("Seller") and Glide RE ("Broker") for the sale of your property under the ${planLabel} plan.`,
      },
      {
        heading: "Services provided",
        body:
          plan === "FULL_SERVICE"
            ? "Broker will list your property on the WFRMLS, syndicate to major portals, coordinate professional photography, provide staging consultation, an on-site agent visit, and offer management support."
            : "Broker will list your property on the WFRMLS, syndicate to major portals, coordinate listing photos, and provide offer management support via phone and chat.",
      },
      {
        heading: "Compensation",
        body: `Seller agrees to pay Broker a listing fee of ${planFee} upon successful closing of the sale.`,
      },
      {
        heading: "Term and authorization",
        body: "Seller authorizes Broker to market the property, place a sign if applicable, schedule showings, and present offers. This Agreement remains in effect until the property is sold, the listing is cancelled, or either party provides written notice.",
      },
      {
        heading: "Seller representations",
        body: "Seller represents that they have authority to list the property, that information provided is accurate, and that they will cooperate with showings and required disclosures.",
      },
      {
        heading: "Placeholder notice",
        body: "This is placeholder agreement text for development purposes. Final legal language will be provided by Glide RE before production use.",
      },
    ],
  };
}
