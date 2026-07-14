export type HowItWorksSectionId =
  | "purpose"
  | "journey"
  | "roles"
  | "approve"
  | "after-live"
  | "status"
  | "glossary";

export type HowItWorksNavItem = {
  id: HowItWorksSectionId;
  label: string;
};

export const HOW_IT_WORKS_NAV: HowItWorksNavItem[] = [
  { id: "purpose", label: "Purpose" },
  { id: "journey", label: "The journey" },
  { id: "roles", label: "Who does what" },
  { id: "approve", label: "Go-live checklist" },
  { id: "after-live", label: "After go-live" },
  { id: "status", label: "Live vs coming soon" },
  { id: "glossary", label: "Glossary" },
];

export type JourneyStep = {
  step: number;
  title: string;
  owner: "Seller" | "Team" | "Both";
  body: string;
  where?: string;
};

export const JOURNEY_STEPS: JourneyStep[] = [
  {
    step: 1,
    title: "Seller inquires and creates an account",
    owner: "Seller",
    body: "Someone reaches out from the website or is invited in. They create a seller account so they can finish onboarding and see their listing later.",
    where: "Public site → Signup",
  },
  {
    step: 2,
    title: "Choose a plan",
    owner: "Seller",
    body: "Virtual (1%) for the core listing toolkit, or Full Service (1.5%) for extras like staging consult, on-site visit, pro photo tour, and a secure MLS lock box.",
    where: "Seller onboarding → Plan",
  },
  {
    step: 3,
    title: "Sign the listing agreement",
    owner: "Seller",
    body: "They review and e-sign the exclusive right-to-sell agreement for their chosen plan. This unlocks the rest of onboarding.",
    where: "Seller onboarding → Agreement",
  },
  {
    step: 4,
    title: "Schedule the onboarding call",
    owner: "Both",
    body: "The seller picks a time. That call shows up under Upcoming calls so the team can prepare and show up.",
    where: "CRM → Upcoming calls",
  },
  {
    step: 5,
    title: "Add photos",
    owner: "Seller",
    body: "They upload photos or request a professional tour (included with Full Service). The MLS needs at least 2 exterior and 3 interior photos to go live.",
    where: "Seller onboarding → Photos",
  },
  {
    step: 6,
    title: "Complete MLS listing intake",
    owner: "Seller",
    body: "The long WFRMLS-style form (~20–25 minutes). When they submit, the listing moves into review — it is not live yet.",
    where: "Seller app → MLS intake",
  },
  {
    step: 7,
    title: "Team enters the listing in Matrix",
    owner: "Team",
    body: "Submitted intakes land in the MLS Queue. A VA or agent copies details into Matrix (print / export helpers on the listing help with this).",
    where: "CRM → MLS Queue",
  },
  {
    step: 8,
    title: "Approve and go live",
    owner: "Team",
    body: "Run the go-live checklist, confirm the listing is live in Matrix, and enter the MLS#. That turns the listing Active and opens the seller dashboard.",
    where: "CRM → Listing → Approve",
  },
  {
    step: 9,
    title: "Coach through the market, then close",
    owner: "Both",
    body: "Sellers watch price health, showings, and traffic. They can send requests (price change, open house, etc.). The team supports until the home sells and closes.",
    where: "Seller Overview + CRM listings",
  },
];

export type RoleCard = {
  role: string;
  focus: string;
  responsibilities: string[];
};

export const ROLE_CARDS: RoleCard[] = [
  {
    role: "Seller",
    focus: "Their home and decisions",
    responsibilities: [
      "Finish onboarding (plan, agreement, call, photos, MLS form)",
      "Keep photos and details accurate",
      "Watch Overview after go-live and respond to offers / requests",
    ],
  },
  {
    role: "MLS VA / Agent",
    focus: "Intake → Matrix → Active",
    responsibilities: [
      "Work the MLS Queue",
      "Enter listings in Matrix carefully",
      "Complete the approve checklist and enter the MLS#",
    ],
  },
  {
    role: "Listing agent (Blair)",
    focus: "Seller relationship & strategy",
    responsibilities: [
      "Onboarding calls and pricing guidance",
      "Optional Blair Note on a listing",
      "Negotiation and offer conversations",
    ],
  },
  {
    role: "Admin",
    focus: "Team and tools",
    responsibilities: [
      "Manage team access",
      "Agreement and email templates",
      "Market data and other Settings tools",
    ],
  },
];

export const APPROVE_CHECKLIST = [
  "Listing details match intake (address, beds, baths, sqft)",
  "Photos meet MLS minimum (2 exterior + 3 interior)",
  "Public remarks reviewed",
  "Owner identity verified (manual / Zoom for now)",
  "Entered and live in Matrix",
  "MLS# entered in CRM → listing becomes Active",
] as const;

export const AFTER_LIVE_POINTS = [
  {
    title: "Seller Overview first",
    body: "After Active, sellers should land on Overview. It answers one question: is this list price working? (On pace / Watch / Price review) with one clear next step.",
  },
  {
    title: "Depth tabs are detail pages",
    body: "Offers, showings, web traffic, your market, documents, and seller requests go deeper. They should not replace Overview as the coaching home.",
  },
  {
    title: "Some data arrives from outside tools",
    body: "Showings, traffic, and market snapshots may stay empty until those feeds are connected or imported. That is expected — not a broken listing.",
  },
] as const;

export type StatusItem = {
  label: string;
  state: "live" | "soon";
  note: string;
};

export const STATUS_ITEMS: StatusItem[] = [
  {
    label: "Seller onboarding + MLS intake",
    state: "live",
    note: "Plan, agreement, call, photos, and full intake form",
  },
  {
    label: "CRM listings + MLS Queue + approve",
    state: "live",
    note: "Review intake, enter Matrix, approve with MLS#",
  },
  {
    label: "Upcoming calls",
    state: "live",
    note: "Onboarding calls scheduled by sellers",
  },
  {
    label: "Seller Overview & portal tabs",
    state: "live",
    note: "Active after go-live; coaching still evolving",
  },
  {
    label: "CRM Offers workflow",
    state: "soon",
    note: "Nav exists; full offer handling still in progress",
  },
  {
    label: "CRM Seller requests",
    state: "soon",
    note: "Nav exists; ops queue still in progress",
  },
  {
    label: "Productized owner ID verification",
    state: "soon",
    note: "Today: verify manually (e.g. Zoom) before approve",
  },
];

export type GlossaryItem = {
  term: string;
  definition: string;
};

export const GLOSSARY: GlossaryItem[] = [
  {
    term: "MLS intake",
    definition:
      "The long seller form with WFRMLS-style property details. Draft until they submit; then it waits for the team.",
  },
  {
    term: "MLS Queue",
    definition:
      "CRM list of submitted intakes ready for Matrix entry and approval.",
  },
  {
    term: "Matrix",
    definition:
      "The MLS system where the team officially enters and publishes the listing.",
  },
  {
    term: "Submitted",
    definition: "Seller finished intake. Not live on the MLS yet.",
  },
  {
    term: "Active",
    definition:
      "Approved in CRM with an MLS#. Live on the MLS; seller dashboard coaching becomes available.",
  },
  {
    term: "Virtual vs Full Service",
    definition:
      "Virtual = 1% core listing. Full Service = 1.5% plus staging consult, agent visit, pro photos, and secure lock box.",
  },
  {
    term: "On pace / Watch / Price review",
    definition:
      "Price-health labels on the seller Overview that signal how the list price is performing.",
  },
];
