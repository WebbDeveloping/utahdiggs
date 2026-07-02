import type { UarAgreementResolvedValues } from "@/types/uar-agreement";

export const RIGHT_TO_SELL_AGREEMENT_TITLE =
  "EXCLUSIVE RIGHT TO SELL LISTING AGREEMENT & AGENCY DISCLOSURE";

export const RIGHT_TO_SELL_FIXED_FEES = {
  krFeePercent: "2.5",
  krFeeDollar: "0",
  ubFeePercent: "1.5",
  ubFeeDollar: "0",
} as const;

export const RIGHT_TO_SELL_BUYER_AGENT_PERCENT_OPTIONS = [
  "0",
  "1",
  "1.5",
  "2",
  "2.5",
  "3",
  "3.5",
] as const;

export const RIGHT_TO_SELL_SQFT_SOURCE_OPTIONS = [
  "County Records",
  "Appraisal",
  "Building Plans",
] as const;

export const SELLER_DENIES_BUYER_COMP_LABEL =
  "Seller does not authorize the Company to enter into a written compensation agreement with a buyer's brokerage.";

export type RightToSellFieldId =
  | "multipleOwners"
  | "seller1Name"
  | "seller2Name"
  | "seller2Contact"
  | "propertyAddress"
  | "listingEndDate"
  | "buyerAgentPercent"
  | "buyerAgentDollarOr"
  | "sellerDeniesBuyerCompAgreement"
  | "disputeMediation"
  | "sqFtSources"
  | "attachmentTerms"
  | "firptaStatus"
  | "seller1Signature"
  | "seller1Initials"
  | "seller2Signature"
  | "seller2Initials"
  | "sellerEmail"
  | "signedDate";

export type RightToSellDocumentBlock =
  | { type: "text"; content: string }
  | { type: "field"; fieldId: RightToSellFieldId };

export function computeListingEndDate(signedDate: string): string {
  const date = new Date(`${signedDate}T12:00:00`);
  if (Number.isNaN(date.getTime())) return "";

  date.setMonth(date.getMonth() + 6);
  return date.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

/** Static document structure matching the Jotform field order. */
export const RIGHT_TO_SELL_DOCUMENT_BLOCKS: RightToSellDocumentBlock[] = [
  {
    type: "text",
    content:
      "THIS IS A LEGALLY BINDING AGREEMENT - READ CAREFULLY BEFORE SIGNING DESIGNATED AGENCY BROKERAGE",
  },
  {
    type: "text",
    content: `THIS EXCLUSIVE RIGHT TO SELL LISTING AGREEMENT & AGENCY DISCLOSURE ("Listing Agreement") is entered into between Kelly Right Real Estate of Utah, LLC (the "Company"), BLAIR ALLEN as the authorized agent for the Company (the "Seller's Agent") and (the "Seller"):`,
  },
  { type: "field", fieldId: "multipleOwners" },
  { type: "field", fieldId: "seller1Name" },
  { type: "field", fieldId: "seller2Name" },
  { type: "field", fieldId: "seller2Contact" },
  {
    type: "text",
    content: `1.TERM OF LISTING. Seller hereby grants to the Company the exclusive right to sell, lease, or exchange real property owned by the Seller and described as: (the "Property")`,
  },
  { type: "field", fieldId: "propertyAddress" },
  { type: "field", fieldId: "listingEndDate" },
  { type: "text", content: "2. BROKERAGE COMPENSATION." },
  {
    type: "text",
    content: `2.1 Seller's Brokerage Fee. If, during the Listing Period, the Company, the Seller's Agent, the Seller, another real estate
agent, or anyone else locates a party who is ready, willing and able to buy, lease or exchange (collectively "acquire") the Property, or
any part thereof, at the listing price and terms stated on the Data Form, or any other price and terms to which the Seller may agree in
writing, the Seller has negotiated with and agrees to pay to the Company a brokerage fee in the amount of 2.5% and $ 0
of such gross acquisition price (the "Brokerage Fee").`,
  },
  {
    type: "text",
    content: `2.2 Seller's Brokerage Fee with an Unrepresented Buyer. If a buyer is not represented by a brokerage, the Seller and
the Company agree that the Company may have additional liability and responsibilities in the transaction. Seller agrees that 1.5%
and $0 of the gross acquisition price shall be added to the Brokerage Fee.`,
  },
  {
    type: "text",
    content: `2.3 Authorization to Offer Compensation to Buyer's Brokerage. The Company is authorized to advertise or otherwise communicate that the Seller and/or the Company is offering to pay compensation to a buyer's brokerage in an amount up to:`,
  },
  { type: "field", fieldId: "buyerAgentPercent" },
  { type: "field", fieldId: "buyerAgentDollarOr" },
  {
    type: "text",
    content: ` of the gross acquisition price. If no amount is entered, then the Company is not authorized to advertise or
otherwise communicate that Seller and/or the Company is offering to pay compensation to a buyer's brokerage. Unless checked below,
the Company may enter into a written compensation agreement to pay a buyer's brokerage not to exceed the authorized amount in this
Section 2.3. If the Company agrees to a written compensation agreement to pay a buyer's brokerage, then the Seller agrees that the
Brokerage Fee will be increased by the amount agreed to in the written compensation agreement.`,
  },
  { type: "field", fieldId: "sellerDeniesBuyerCompAgreement" },
  {
    type: "text",
    content: `2.4 Seller's Brokerage Fee Due and Payable. The Brokerage Fee, unless otherwise agreed in writing by the Seller and the Company, shall be due and payable from the Seller's proceeds on: (a) If a purchase, the date of recording of the closing documents for the acquisition of the Property ("Closing"); (b) If a lease, the effective date of the lease; and (c) if an option, the date consideration for the option agreement is paid. If within the Listing Period, or any extension of the Listing Period, the Property is withdrawn from sale, transferred, conveyed, leased, rented, or made unmarketable by a voluntary act of Seller, without the written consent of the Company; or if the sale is prevented by default of the Seller, the Brokerage Fee shall be immediately due and payable to the Company. BROKERAGE FEES ARE FULLY NEGOTIABLE AND ARE NOT SET BY LAW, ANY BOARD OR ASSOCIATION OF REALTORS®, MULTIPLE LISTING SERVICE (the "MLS"), OR IN ANY MANNER OTHER THAN BETWEEN THE COMPANY AND`,
  },
  {
    type: "text",
    content: `3. PROTECTION PERIOD. If within 3 months after the termination or expiration of this listing agreement, the Property is acquired by any party to whom the Property was offered or shown by the Company, the Seller's Agent, the Seller, the party's representative, or another real estate agent during the Listing Period, or any extension of the Listing Period, the Seller agrees to pay to the Company the Brokerage Fee stated in Section 2, unless the Seller is obligated to pay a Brokerage Fee on such acquisition to another brokerage based on another valid listing agreement entered into after the expiration or termination date of this Listing Agreement.`,
  },
  {
    type: "text",
    content: `4. SELLER WARRANTIES/DISCLOSURES. The Seller warrants to the Company that the individuals or entity listed above as the "Seller" represents all of the record owners of the Property. The Seller warrants that Seller has marketable title and an established right to sell, lease or exchange the Property. The Seller agrees to execute the necessary documents of conveyance. The Seller agrees to furnish buyer with good and marketable title, and to pay at Settlement, for a policy of title insurance in accordance with the terms of any real estate purchase contract entered into between buyer and Seller. The Seller agrees to fully inform the Seller's Agent regarding the Seller's knowledge of the condition of the Property. Upon signing of this Listing Agreement, the Seller agrees to personally complete and sign a Utah Association of REALTORS® ("UAR")-approved Seller's Property Condition Disclosure form and a Wire Fraud Alert Disclosure. The Seller agrees to indemnify and hold harmless the Seller's Agent and the Company against any claims that may arise from: (a) The Seller providing incorrect or inaccurate information regarding the Property; (b)The Seller failing to disclose material information regarding the Property, including, but not limited to, the condition of all appliances; the condition of heating, plumbing, and electrical fixtures and equipment; sewer problems; moisture or other problems in the roof or foundation; the availability and location of utilities; and the location of property lines; and (c) Any injuries resulting from any unsafe conditions within the Property.`,
  },
  { type: "text", content: "5. AGENCY RELATIONSHIPS" },
  {
    type: "text",
    content: `5.1 Duties of a Seller's Agent. By signing this Listing Agreement, the Seller designates the Seller's Agent and the Principal/Branch Broker for the Company (the "Broker"), as agents for the Seller to locate a buyer for the Property. The Seller authorizes the Seller's Agent or the Broker to appoint another agent in the Company to also represent the Seller in the event the Seller's Agent or the Broker will be unavailable to service the Seller. As agents for the Seller, they have fiduciary duties to the Seller that include loyalty, obedience, full disclosure, confidentiality, reasonable care, and any other duties required by law.`,
  },
  {
    type: "text",
    content: `5.2 Duties of a Limited Agent. The Seller understands that the Seller's Agent and the Broker may now, or in the future, be agents for a buyer who may wish to negotiate a purchase of the Property. Then the Seller's Agent and the Broker may be acting as Limited Agents - representing both the Seller and buyer at the same time. A Limited Agent has fiduciary duties to both the Seller and the buyer as required by law. However, some of those duties are "limited" because the agent cannot provide to both parties undivided loyalty, confidentiality and disclosure. For this reason, the Limited Agent is bound by a further duty of neutrality. Being neutral, the Limited Agent may not disclose to either party information likely to weaken the bargaining position of the other – for example, the highest price the buyer will offer, or the lowest price the Seller will accept. However, the Limited Agent will be required to disclose information given to the agent in confidence by the other party if failure to disclose such information would be a material misrepresentation regarding the Property or regarding the ability of the parties to fulfill their obligations. The Seller is advised that neither the Seller nor the buyer is required to accept a limited agency situation in the Company, and each party is entitled to be represented by its own agent. In the event a limited agency situation arises, the Seller's Agent and the Broker, as applicable, may only act as Limited Agents based upon a separate Limited Agency Consent Agreement signed by the Seller and buyer.`,
  },
  {
    type: "text",
    content: `6. PROFESSIONAL ADVICE. The Company and the Seller's Agent are trained in the marketing of real estate. Neither the Company nor its agents are trained or licensed to provide the Seller or any prospective buyer with legal or tax advice, or with technical advice regarding the physical condition of the Property. The Seller is advised not to rely on the Company, or any agents of the Company, for a determination regarding the physical or legal condition of the Property. If the Seller desires advice regarding: (a) Past or present compliance with zoning and building code requirements; (b) Legal or tax matters; (c) The physical condition of the Property; (d) This Listing Agreement; or (e) Any transaction for the acquisition of the Property, the Seller's Agent and the Company strongly recommend that the Seller obtain such independent advice. If the Seller fails to do so, the Seller is acting contrary to the advice of the Company. Any recommendations for third-party services made by the Company or the Seller's Agent do not guarantee the Seller's satisfaction in the use of those third-party services and should not be seen as a warranty of any kind as to the level of service that will be provided by the third parties. The Seller is advised that it is up to the Seller in the Seller's sole discretion to choose third-party services that meet the needs of the Seller and not to rely on any recommendations given by the Company or the Seller's Agent.`,
  },
  {
    type: "text",
    content: `7. DISPUTE RESOLUTION. The parties agree that any dispute, arising prior to or after a Closing, related to this Listing Agreement`,
  },
  { type: "field", fieldId: "disputeMediation" },
  {
    type: "text",
    content: `, first be submitted to mediation. If no box is checked, then the parties agree that "may at the option of the parties" shall be the default option. Mediation is a process in which the parties meet with an impartial person who helps to resolve the dispute informally and confidentially. Mediators cannot impose binding decisions. The parties to the dispute must agree before any settlement is binding. The parties will jointly appoint an acceptable mediator and share equally in the cost of such mediation. If mediation fails, any other remedies available at law shall apply. Nothing in this Section 7 prohibits any party from seeking emergency legal or equitable relief, pending mediation.`,
  },
  {
    type: "text",
    content: `8. ATTORNEY FEES/GOVERNING LAW/CLASS ACTION WAIVER. Except as provided in Section 7, in case of the employment of an attorney in any matter arising out of this Listing Agreement solely between the Company and the Seller, the prevailing party shall be entitled to receive from the other party all costs and attorney fees, whether the matter is resolved through court action or otherwise. If, through no fault of the Company, any litigation arises out of the Seller's employment of the Company under this Listing Agreement (whether before or after a Closing), the Seller agrees to indemnify the Company and the Seller's Agent from all costs and attorney fees incurred by the Company and/or the Seller's Agent in pursuing and/or defending such action. This Listing Agreement shall be governed and construed in accordance with the laws of the State of Utah. The Seller forfeits any and all rights to participate in any class action against the Company. In particular, the Seller agrees not to be a representative or member of any class of claimants or act as a private attorney general in litigation, arbitration, or administrative proceeding with respect to any claim arising out of this Listing Agreement.`,
  },
  {
    type: "text",
    content: `9. ADVERTISING/SELLER AUTHORIZATIONS. The Seller authorizes the Company and the Seller's Agent to advertise the
Property for sale through any printed and/or electronic media deemed necessary and appropriate by the Seller's Agent and the
Company, including, but not limited to, each MLS in which the Company participates. The Seller agrees that any advertising the Seller
intends to conduct, including print and/or electronic media, shall first be approved in writing by the Seller's Agent. The Seller further
agrees that the Seller's Agent and the Company are authorized to:


(a) Disclose to the MLS after Closing, the final terms and sales price for the Property consistent with the requirements of the
MLS;
(b) Disclose to the MLS the square footage of the Property as obtained from (check applicable box):`,
  },
  { type: "field", fieldId: "sqFtSources" },
  {
    type: "text",
    content: `(c) Obtain financial information from any lender or other party holding a lien or interest on the Property;
(d) Have keys to the Property, if applicable;
(e) Have an MLS or local board of Realtors® approved/endorsed security key-box installed on the Property. If the Seller authorizes the Broker, or Seller's Agent, to install a non-MLS or local board of Realtors® approved/endorsed security key-box on the Property, Seller acknowledges that it may not provide the same level of security as board of Realtors® approved/endorsed security key-box;
(f) Hold Open-Houses at the Property; the MLS or local
(g) Place for sale, sold, or other similar signs ("Signs") on the Property (i.e., the only Signs on the Property shall be that of the Company);
(h) Order a Preliminary Title Report on the Property;
(i) Order a Home Warranty Plan, if applicable;
(j) Communicate with the Seller for the purpose of soliciting real estate related goods and services during and after the term of the Listing Agreement; and
(k) Place the Earnest Money Deposit into an interest-bearing trust account with interest paid to the Utah Association of Realtors® Housing Opportunity Fund (UARHOF) to assist in creating affordable housing throughout the state.`,
  },
  {
    type: "text",
    content: `10. PERSONAL PROPERTY. The Seller acknowledges that the Company has discussed with the Seller the safeguarding of
personal property and valuables located within the Property. The Seller acknowledges that the Company is not an insurer against the
loss of or damage to personal property. The Seller agrees to hold the Company harmless from any loss or damage that might result
from any authorizations given in Section 9.`,
  },
  {
    type: "text",
    content: `11. ATTACHMENT. A UAR-approved Seller's Property Condition Disclosure form, the Data Form and a Wire Fraud Alert Disclosure are incorporated into this Listing Agreement by this reference. There ARE /ARE NOT (checked below) additional terms contained in an Addendum attached to this Listing Agreement. If an Addendum is attached, the terms of that Addendum are incorporated into this Listing Agreement by this reference.`,
  },
  { type: "field", fieldId: "attachmentTerms" },
  {
    type: "text",
    content: `12. FOREIGN INVESTMENT IN REAL PROPERTY TAX ACT ("FIRPTA"). The sale or other disposition of a U.S. real property interest by a foreign person is subject to income tax withholding under FIRPTA. A "foreign person" may include a non-resident alien individual, foreign corporation, foreign partnership, foreign trust and foreign estate. Seller warrants and represents to the Company and to the Seller's Agent, that Seller a "foreign person" as defined by the Internal Revenue Code and its associated regulations. If Seller is not a foreign person, Seller agrees, upon request, to deliver a certification to Buyer at closing, stating that Seller is not a foreign person. This certification shall be in the form then required by FIRPTA. If FIRPTA applies to you as Seller, you are advised that the Buyer or other qualified substitute may be legally required to withhold a substantial percentage of the total purchase price for the Property at closing and remit that amount to the IRS. If Seller is a foreign person as defined above, and Seller does not have a US Taxpayer Identification number, Seller agrees to prepare to apply for a US Taxpayer Identification number.`,
  },
  { type: "field", fieldId: "firptaStatus" },
  {
    type: "text",
    content: `13. EQUAL HOUSING OPPORTUNITY. The Seller and the Company shall comply with Federal, State, and local fair housing laws.`,
  },
  {
    type: "text",
    content: `14. ELECTRONIC TRANSMISSION & COUNTERPARTS. Electronic transmission (including email and fax) of a signed copy of
this Listing Agreement and any addenda, and the retransmission of any signed electronic transmission, shall be the same as delivery of
an original. This Listing Agreement and any addenda may be executed in counterparts.`,
  },
  {
    type: "text",
    content: `15. DUE-ON-SALE. Certain types of transactions may trigger what is commonly referred to as a "due-on-sale" clause. A "due-on sale" clause typically states that the Seller's lender or mortgagee may call the loan due and payable in full if the Seller participates in certain types of transactions. These types of transactions may include, but are not limited to, transactions where: (a) The sale of the property does not result in the underlying debt being paid in full; (b) The parties enter into a seller-financed transaction; (c) A lease option agreement is entered into; or (d) Any other unauthorized transfer of title to the Property has occurred without the lender's consent. The Seller understands that if any underlying encumbrances or mortgages on the Property contain a "due-on-sale clause," and the "due-on-sale" clause is triggered, the lender may call the entire unpaid balance of the loan immediately due.`,
  },
  {
    type: "text",
    content: `16. ENTIRE AGREEMENT. This Listing Agreement, including a UAR-approved Seller's Property Condition Disclosure form, Data Form, a Wire Fraud Alert Disclosure, and any additional addendum, contain the entire agreement between the parties relating to the subject matter of this Listing Agreement. This Listing Agreement may not be modified or amended except in writing signed by the
parties hereto. If any provision of this Listing Agreement is declared by a court of competent jurisdiction to be invalid, illegal, or unenforceable, such provision shall be severed from this Listing Agreement and the other provisions shall remain in full force and effect to the fullest extent possible.`,
  },
  { type: "text", content: "CANCELLATION:" },
  { type: "text", content: "17. CANCELLATION OF THIS AGREEMENT:" },
  {
    type: "text",
    content: `Seller may only cancel the listing agreement under to following conditions:
1- There are no current active offers on the property
2- The property is not under contract or pending to be sold
3- Seller agrees to pay commission on any sale initiated and procured via advertising from the MLS, syndicated sites or advertising created and distributed by Utah Digs | Blair Allen | Kelly Right Real Estate`,
  },
  {
    type: "text",
    content: "THE UNDERSIGNED hereby agree to the terms of this Listing Agreement.",
  },
  { type: "field", fieldId: "seller1Signature" },
  { type: "field", fieldId: "seller1Initials" },
  { type: "field", fieldId: "seller2Signature" },
  { type: "field", fieldId: "seller2Initials" },
  { type: "field", fieldId: "sellerEmail" },
  { type: "field", fieldId: "signedDate" },
];

function formatCheckbox(checked: boolean, label: string): string {
  return `${checked ? "[X]" : "[ ]"} ${label}`;
}

function renderFieldForPdf(fieldId: RightToSellFieldId, values: UarAgreementResolvedValues): string {
  switch (fieldId) {
    case "multipleOwners":
      return `Is there more than one owner? ${values.multipleOwners}`;
    case "seller1Name":
      return `"SELLER" Name 1: ${values.seller1FirstName} ${values.seller1LastName}`.trim();
    case "seller2Name":
      if (values.multipleOwners !== "YES") return "";
      return `"SELLER" Name 2: ${values.seller2FirstName} ${values.seller2LastName}`.trim();
    case "seller2Contact":
      if (values.multipleOwners !== "YES") return "";
      return `Seller 2 contact: ${values.seller2AddressPhone}`;
    case "propertyAddress":
      return `Property Listing Address: ${values.propertyFullAddress}`;
    case "listingEndDate":
      return `at the listing price and terms stated on the attached property data form (the "Data Form"), or at such other price and terms to which the Seller may agree in writing. This Listing Agreement is effective as of the date it is signed by all parties and ENDS at 5:00 P.M. (Mountain Time) on ${values.listingEndDate} which is 6 months from the signed date of this contract (the "Listing Period" In the event this Listing Agreement expires while the Property is under contract to be sold, the Company and Seller mutually agree that the Listing Period shall automatically extend until the under-contract transaction closes or is cancelled.`;
    case "buyerAgentPercent":
      return `% BUYER AGENT Compensation Offered: ${values.buyerAgentPercent}%`;
    case "buyerAgentDollarOr":
      return values.buyerAgentDollar.trim()
        ? `$ BUYER AGENT COMPENSATION OFFERED: ${values.buyerAgentDollar.trim()}`
        : "OR $ BUYER AGENT COMPENSATION OFFERED: (none entered)";
    case "sellerDeniesBuyerCompAgreement":
      return formatCheckbox(
        values.sellerDeniesBuyerCompAgreement,
        SELLER_DENIES_BUYER_COMP_LABEL,
      );
    case "disputeMediation":
      return [
        formatCheckbox(values.disputeMediation === "SHALL", "SHALL"),
        formatCheckbox(
          values.disputeMediation === "MAY AT THE OPTION OF THE PARTIES",
          "MAY AT THE OPTION OF THE PARTIES",
        ),
      ].join("  ");
    case "sqFtSources": {
      const options = [...RIGHT_TO_SELL_SQFT_SOURCE_OPTIONS];
      const lines = options.map((option) =>
        formatCheckbox(values.sqFtSources.includes(option), option),
      );
      if (values.sqFtOther.trim()) {
        lines.push(formatCheckbox(true, `Other: ${values.sqFtOther.trim()}`));
      } else {
        lines.push(formatCheckbox(false, "Other"));
      }
      return `Where did you obtain your square footage measurements?\n${lines.join("\n")}`;
    }
    case "attachmentTerms":
      return [
        formatCheckbox(values.attachmentTerms === "ARE", "ARE"),
        formatCheckbox(values.attachmentTerms === "ARE NOT", "ARE NOT"),
      ].join("  ");
    case "firptaStatus":
      return [
        formatCheckbox(values.firptaStatus === "IS", "IS"),
        formatCheckbox(values.firptaStatus === "IS NOT", "IS NOT"),
      ].join("  ");
    case "seller1Signature":
      return "Seller 1 SIGNATURE: [signed electronically]";
    case "seller1Initials":
      return "Seller 1 INITIALS: [signed electronically]";
    case "seller2Signature":
      if (values.multipleOwners !== "YES") return "";
      return "Seller 2 SIGNATURE: [signed electronically]";
    case "seller2Initials":
      if (values.multipleOwners !== "YES") return "";
      return "Seller 2 INITIALS: [signed electronically]";
    case "sellerEmail":
      return `Seller Email: ${values.sellerEmail}`;
    case "signedDate":
      return `Date: ${values.signedDate}`;
    default:
      return "";
  }
}

/** Returns flat paragraph strings for PDF rendering. */
export function buildRightToSellAgreementParagraphs(
  values: UarAgreementResolvedValues,
): string[] {
  const paragraphs: string[] = [];

  for (const block of RIGHT_TO_SELL_DOCUMENT_BLOCKS) {
    if (block.type === "text") {
      paragraphs.push(block.content);
      continue;
    }

    const rendered = renderFieldForPdf(block.fieldId, values);
    if (rendered.trim()) {
      paragraphs.push(rendered);
    }
  }

  return paragraphs;
}

export function buildRightToSellAgreementDocument(
  values: UarAgreementResolvedValues,
): string {
  return buildRightToSellAgreementParagraphs(values).join("\n\n");
}
