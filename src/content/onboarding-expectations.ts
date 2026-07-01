export type OnboardingExpectationModule = {
  id: string;
  title: string;
  body: string;
};

export const ONBOARDING_EXPECTATIONS: OnboardingExpectationModule[] = [
  {
    id: "after-sign",
    title: "What happens after you sign",
    body: "Once you sign your listing agreement, we'll review your property details and photos. Our team prepares your MLS listing and coordinates any remaining items before go-live.",
  },
  {
    id: "timeline",
    title: "Timeline to go live on the MLS",
    body: "Most sellers go live within a few business days after completing the MLS intake form and onboarding call. Full Service listings may include a professional photo tour, which we schedule after your agreement is signed.",
  },
  {
    id: "showings-offers",
    title: "How showings and offers work",
    body: "Buyers' agents schedule showings through the MLS. When an offer comes in, we'll notify you immediately. You'll review offers in your seller dashboard and we'll help you evaluate each one.",
  },
  {
    id: "full-service",
    title: "Full Service extras",
    body: "Full Service includes a staging consultation, an on-site visit from one of our agents, a secure MLS lock box, and a professional photo tour. We'll coordinate these after your onboarding call.",
  },
  {
    id: "dashboard",
    title: "Your seller dashboard after go-live",
    body: "Once your listing is active, you'll get weekly performance updates — views, saves, showings, and offers — plus tools to request price changes, upload documents, and message our team.",
  },
];
