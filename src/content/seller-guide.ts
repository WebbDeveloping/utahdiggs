export type SellerGuideSection = {
  title: string;
  intro?: string;
  paragraphs?: string[];
  callout?: { title: string; text: string };
  cards?: { title: string; body: string }[];
  faqs?: { question: string; answer: string }[];
  doItems?: string[];
  dontItems?: string[];
  columns?: { title: string; paragraphs: string[]; callout?: string }[];
};

export const sellerGuideIntro = {
  label: "From Blair · Your Seller Success Playbook",
  text: "This page breaks down exactly what the numbers in your account mean — and the proven principles behind selling your home for the most money, in the least time, with the least stress. I've sold hundreds of homes. Here's what I know works.",
};

export const sellerGuideSections: SellerGuideSection[] = [
  {
    title: "What Your Numbers Actually Mean",
    cards: [
      {
        title: "Web Views",
        body: "How many times buyers clicked on your listing across Zillow, UtahRealEstate.com, Realtor.com, and Homes.com. Think of this as your listing's foot traffic — the top of the funnel. Strong views with low showings often means pricing or photos aren't pulling buyers in the door.",
      },
      {
        title: "Saves / Favorites",
        body: "Buyers who bookmarked your home — a strong buyer-intent signal. Most buyers save several homes before touring. High saves indicate demand. If saves don't convert to showings within 1–2 weeks, pricing may be the barrier.",
      },
      {
        title: "Showings",
        body: "Buyers physically walking through your home. Industry data shows 5+ showings per week in the first two weeks often correlates with offers at or above list price. Below that, the market is sending a message.",
      },
      {
        title: "Showings Per Offer",
        body: "In a healthy market, expect 7–10 showings per offer. Hit 10+ showings with no contract? The market is often signaling that price is the issue.",
      },
    ],
  },
  {
    title: "The Formula: Views → Showings → Offers → SOLD",
    intro:
      "Every sale follows a predictable funnel. Your account tracks every stage in real time. When one stage underperforms, we know exactly where to look — and what to do about it.",
    callout: {
      title: "The real talk",
      text: "Buyers don't just make offers. They research deeply, compare multiple homes, and when they walk through yours, they already like it. When a showing doesn't convert to an offer, we can usually fix it.",
    },
  },
  {
    title: "The 3 Things You Control as a Seller",
    intro:
      "You can't control the market, interest rates, or what other homes are doing. But you have complete power over three levers — and together, they determine everything.",
    cards: [
      {
        title: "Condition",
        body: "Staging, cleanliness, minor repairs, curb appeal, smell, and declutter. Buyers are emotional — don't give them reasons to walk away.",
      },
      {
        title: "Accessibility",
        body: "Say yes to every showing, every time. Restricting access is one of the most common — and costly — seller mistakes.",
      },
      {
        title: "Price",
        body: "Price overcomes every objection. Watch for 10+ showings with no offers, fewer than 8 showings in 2 weeks, or 21+ days on market with no contract.",
      },
    ],
    callout: {
      title: "The tough truth",
      text: "Sometimes a targeted condition fix creates more perceived value than a large price cut. But when the data says it's time, price is often the answer. I track this every week and I'll tell you straight.",
    },
  },
  {
    title: "Preparing Your Home for Sale",
    intro:
      "Homes that show well sell faster and for more money. Your listing gets one shot at a buyer's first impression — make it count.",
    cards: [
      {
        title: "Curb Appeal — The 30-Second Test",
        body: "Fresh lawn, swept walkways, a freshened front door, and clean house numbers. Remove yard clutter before every showing.",
      },
      {
        title: "Clean Like It's Never Been Cleaned",
        body: "Deep clean all surfaces, floors, windows, and appliances. Eliminate odors — pets, cooking, and smoke kill deals faster than almost anything else.",
      },
      {
        title: "Declutter & Stage",
        body: "Remove personal photos, collections, and excess furniture. Aim for hotel-clean, hotel-simple. Professionally staged homes often sell faster and for more.",
      },
      {
        title: "High-ROI Quick Fixes",
        body: "Fresh neutral paint, new light fixtures, updated cabinet hardware, fresh caulk, and new outlet covers often pay back at sale.",
      },
    ],
    callout: {
      title: "What to skip",
      text: "Major kitchen remodels, bathroom gut jobs, and any project that takes more than 2–3 weeks. The timeline risk often outweighs the value gain.",
    },
  },
  {
    title: "Showing Day: What to Do (and NOT Do)",
    intro: "The moment a buyer walks in, the clock is ticking. Here's how to set the stage for success.",
    doItems: [
      "Leave the house — buyers need space to imagine themselves living there.",
      "Say yes to every showing — accommodating an inconvenient time could produce your offer.",
      "Declutter and stage — neutral, spacious, and fresh-smelling.",
      "Lock up valuables — jewelry, medications, documents, and small electronics.",
    ],
    dontItems: [
      "Don't be there — hovering creates pressure that kills deals.",
      "Don't restrict access — flexibility is a competitive advantage.",
      "Don't leave personal clutter — buyers need to see their future home.",
      "Don't take feedback personally — it's free market research.",
    ],
  },
  {
    title: "The Psychology of Buyers (And Sellers)",
    columns: [
      {
        title: "The Buyer's Mind",
        paragraphs: [
          "A buyer scheduled a showing because they like your home. But once inside, they often look for reasons not to buy — that's human nature on big decisions.",
          "Every loose handle, dated fixture, or strong smell becomes ammunition for hesitation.",
        ],
        callout:
          "Your job: eliminate objections before they voice them. Stage it. Fix it. Price it right.",
      },
      {
        title: "The Seller's Mind",
        paragraphs: [
          "You've lived here and built memories — that's natural. You may feel the market should recognize what you've put in.",
          "Your home is worth exactly what a buyer is willing to pay for it today — not what Zillow says or what you paid.",
        ],
        callout:
          "That's power. When you understand what drives value, you can act on it — and we do this together every week.",
      },
    ],
  },
  {
    title: "How We're Marketing Your Home",
    intro:
      "This isn't a list-it-and-pray strategy. We run a full-stack marketing machine behind your property — and you can see the results in your account every week.",
    cards: [
      {
        title: "Social Media",
        body: "Instagram, Facebook, and TikTok campaigns targeting active buyers in your price range, location, and property type.",
      },
      {
        title: "Major Listing Sites",
        body: "Syndicated to Zillow, Realtor.com, Homes.com, UtahRealEstate.com, Redfin, and dozens of additional sites with professional photos and optimized copy.",
      },
      {
        title: "Direct Outreach",
        body: "Text, email, and call campaigns to our buyer database, active buyer agents, and relocation networks.",
      },
    ],
  },
  {
    title: "Quick FAQs",
    faqs: [
      {
        question: "How long will it take to sell my home?",
        answer:
          "In the greater Salt Lake area, correctly priced homes often sell in 20–35 days. Overpriced homes can sit much longer and ultimately sell for less than they would have at the right price from day one.",
      },
      {
        question: "Should I accept the first offer I get?",
        answer:
          "Not necessarily — but don't dismiss it either. The first offer often comes from the most motivated buyer. We analyze price, terms, financing, contingencies, and timeline together before you decide.",
      },
      {
        question: "What if I get a lowball offer?",
        answer:
          "Counter it. Every offer is an opening to a conversation. Most homes sell within a few percent of list price — an offer below asking is often a negotiating starting point.",
      },
      {
        question: "When is it time to reduce the price?",
        answer:
          "When the data tells us. Strong views but low showings may mean photos or price need attention. Showings but no offers after 8–10 tours often means the price-to-value equation isn't working.",
      },
      {
        question: 'What does "under contract" mean vs. "sold"?',
        answer:
          "Under contract means we've accepted an offer and are in the inspection/financing period. Sold means we've closed — money has changed hands and keys are handed over.",
      },
    ],
  },
];

export const sellerGuideContact = {
  phone: "(801) 337-5057",
  phoneHref: "tel:8013375057",
  email: "Blair@UtahDigs.com",
  website: "https://utahdigs.com",
};
