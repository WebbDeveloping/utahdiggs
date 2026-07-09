import {
  AGENT_EMAIL,
  BROKERAGE_LINE,
  SITE_NAME,
  SITE_URL,
} from "@/lib/seo/site";

export type EmailTemplateVariable = {
  name: string;
  description: string;
  example: string;
};

export type EmailTemplateLayout = "fragment" | "document";

export type EmailTemplateDefinition = {
  slug: string;
  displayName: string;
  description: string;
  recipientLabel: string;
  layout: EmailTemplateLayout;
  defaultSubject: string;
  defaultHtmlBody: string;
  variables: EmailTemplateVariable[];
  sampleData: Record<string, string>;
};

const LISTING_WELCOME_HTML = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Your listing is live — {{propertyLine}}</title>
<style>
  @media only screen and (max-width:600px) {
    .email-card    { width:100% !important; border-radius:0 !important; }
    .hdr-td        { padding:20px 20px 18px !important; }
    .body-td       { padding:20px 16px 16px !important; }
    .feat-td       { padding:0 16px 16px !important; }
    .bkmk-td       { padding:0 16px 16px !important; }
    .cta-td        { padding:16px 16px 20px !important; }
    .login-td      { padding:4px 16px 16px !important; }
    .footer-td     { padding:16px 16px 20px !important; }
  }
</style>
</head>
<body style="margin:0;padding:0;background:{{brandPageBg}};font-family:'Helvetica Neue',Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:{{brandPageBg}};padding:32px 16px;">
<tr><td align="center">
<table class="email-card" width="600" cellpadding="0" cellspacing="0" border="0" style="max-width:600px;width:100%;background:{{brandCardBg}};border-radius:14px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">
  <tr>
    <td class="hdr-td" style="background:{{brandPrimary}};padding:28px 36px 24px;">
      <table width="100%" cellpadding="0" cellspacing="0" border="0">
        <tr>
          <td valign="middle" align="center">
            <div style="font-size:24px;font-weight:800;color:#ffffff;line-height:1.2;text-align:center;">&#127968; Your Listing Is Live! &#127881;</div>
            <div style="font-size:16px;font-weight:700;color:rgba(255,255,255,0.9);margin-top:8px;text-align:center;">{{propertyLine}}</div>
          </td>
        </tr>
      </table>
    </td>
  </tr>
  <tr>
    <td class="body-td" style="padding:24px 28px 8px;">
<!-- email-editable:start -->
      <p style="font-size:15px;color:{{brandText}};line-height:1.65;margin:0 0 14px 0;">Hi <strong>{{firstName}}</strong> &#8212; exciting news!</p>
      <p style="font-size:15px;color:{{brandText}};line-height:1.65;margin:0 0 12px 0;">Your listing just went live. From here on out, you don't have to wonder what's happening &#8212; <strong>it's all in one place.</strong></p>
      <p style="font-size:14px;color:{{brandMuted}};line-height:1.65;margin:0;">This is your private seller account. Every Sunday evening you'll get a full update on everything that matters:</p>
<!-- email-editable:end -->
    </td>
  </tr>
  <tr>
    <td class="feat-td" style="padding:12px 28px 16px;">
      <table width="100%" cellpadding="0" cellspacing="0" border="0">
        <tr><td style="padding-bottom:8px;"><table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#F8FAFC;border:1px solid #E2E8F0;border-radius:10px;padding:12px 14px;"><tr><td width="36" valign="middle" style="padding-right:12px;"><div style="width:34px;height:34px;background:{{brandAccentBg}};border-radius:8px;text-align:center;line-height:34px;font-size:18px;">&#128202;</div></td><td valign="middle"><div style="font-size:13px;font-weight:700;color:{{brandText}};margin-bottom:2px;">Online Views &amp; Internet Exposure</div><div style="font-size:12px;color:{{brandMuted}};">Zillow, Realtor.com, Redfin, and more &#8212; updated weekly</div></td></tr></table></td></tr>
        <tr><td style="padding-bottom:8px;"><table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#F8FAFC;border:1px solid #E2E8F0;border-radius:10px;padding:12px 14px;"><tr><td width="36" valign="middle" style="padding-right:12px;"><div style="width:34px;height:34px;background:#FFF7ED;border-radius:8px;text-align:center;line-height:34px;font-size:18px;">&#127968;</div></td><td valign="middle"><div style="font-size:13px;font-weight:700;color:{{brandText}};margin-bottom:2px;">Showing Activity &amp; Buyer Feedback</div><div style="font-size:12px;color:{{brandMuted}};">See who toured and what they said, every week</div></td></tr></table></td></tr>
        <tr><td style="padding-bottom:8px;"><table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#F8FAFC;border:1px solid #E2E8F0;border-radius:10px;padding:12px 14px;"><tr><td width="36" valign="middle" style="padding-right:12px;"><div style="width:34px;height:34px;background:#F0FDF4;border-radius:8px;text-align:center;line-height:34px;font-size:18px;">&#128202;</div></td><td valign="middle"><div style="font-size:13px;font-weight:700;color:{{brandText}};margin-bottom:2px;">Local Market Snapshot</div><div style="font-size:12px;color:{{brandMuted}};">Market stats, days on market, price trends in your area</div></td></tr></table></td></tr>
        <tr><td><table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#F8FAFC;border:1px solid #E2E8F0;border-radius:10px;padding:12px 14px;"><tr><td width="36" valign="middle" style="padding-right:12px;"><div style="width:34px;height:34px;background:#FDF4FF;border-radius:8px;text-align:center;line-height:34px;font-size:18px;">&#128203;</div></td><td valign="middle"><div style="font-size:13px;font-weight:700;color:{{brandText}};margin-bottom:2px;">Your Documents, All in One Place</div><div style="font-size:12px;color:{{brandMuted}};">Disclosures, offers, and transaction files &#8212; easy to find, anytime</div></td></tr></table></td></tr>
      </table>
    </td>
  </tr>
  <tr>
    <td class="bkmk-td" style="padding:4px 28px 20px;">
      <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:{{brandAccentBg}};border:1px solid #BFDBFE;border-left:3px solid {{brandPrimary}};border-radius:0 10px 10px 0;padding:14px 16px;">
        <tr><td style="font-size:11px;font-weight:700;letter-spacing:1.2px;text-transform:uppercase;color:{{brandPrimary}};padding-bottom:6px;">&#128204; &nbsp;Bookmark Your Account</td></tr>
        <tr><td style="font-size:13px;color:#334155;line-height:1.6;">Sign in anytime to track showings, offers, web traffic, and requests. Your account updates automatically every Sunday evening.</td></tr>
      </table>
    </td>
  </tr>
  <tr>
    <td class="cta-td" style="padding:4px 28px 24px;" align="center">
      <table cellpadding="0" cellspacing="0" border="0"><tr><td style="background:{{brandPrimary}};border-radius:{{brandButtonRadius}};padding:14px 36px;"><a href="{{loginUrl}}" style="font-size:14px;font-weight:700;color:#ffffff;text-decoration:none;display:block;">Sign In to Your Account &#8594;</a></td></tr></table>
      <div style="font-size:11px;color:#94A3B8;margin-top:10px;">Showings &middot; Offers &middot; Web traffic &middot; Seller requests</div>
    </td>
  </tr>
  <tr>
    <td class="login-td" style="padding:4px 28px 20px;">
      <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#F8FAFC;border:1px solid #E2E8F0;border-radius:10px;padding:14px 16px;">
        <tr><td style="font-size:11px;font-weight:700;letter-spacing:1px;text-transform:uppercase;color:{{brandMuted}};padding-bottom:10px;">&#128273; Your Account Access</td></tr>
        <tr><td style="font-size:13px;color:#334155;padding-bottom:8px;"><strong>New to {{siteName}}?</strong> <a href="{{signupUrl}}" style="color:{{brandLink}};">Create your account</a> with <strong>{{sellerEmail}}</strong></td></tr>
        <tr><td style="font-size:13px;color:#334155;"><strong>Already have an account?</strong> <a href="{{loginUrl}}" style="color:{{brandLink}};">Sign in</a></td></tr>
      </table>
    </td>
  </tr>
  {{offerBlock}}
  <tr><td style="border-top:1px solid #E2E8F0;"></td></tr>
  <tr>
    <td class="footer-td" style="padding:20px 28px 24px;">
      <table width="100%" cellpadding="0" cellspacing="0" border="0">
        <tr><td>
          <div style="font-size:13px;font-weight:700;color:{{brandText}};">Blair Allen</div>
          <div style="font-size:12px;color:{{brandMuted}};margin-top:2px;">{{brokerageLine}}</div>
          <div style="margin-top:6px;">
            <a href="tel:8013375057" style="font-size:12px;color:{{brandLink}};text-decoration:none;">801.337.5057</a>
            <span style="color:#CBD5E1;margin:0 6px;">&middot;</span>
            <a href="mailto:{{agentEmail}}" style="font-size:12px;color:{{brandLink}};text-decoration:none;">{{agentEmail}}</a>
            <span style="color:#CBD5E1;margin:0 6px;">&middot;</span>
            <a href="{{siteUrl}}" style="font-size:12px;color:{{brandLink}};text-decoration:none;">glidere.com</a>
          </div>
        </td></tr>
      </table>
    </td>
  </tr>
</table>
</td></tr>
</table>
</body>
</html>`;

const ONBOARDING_CALL_CONFIRMATION_HTML = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Onboarding call scheduled</title>
</head>
<body style="margin:0;padding:0;background:{{brandPageBg}};font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:{{brandPageBg}};padding:32px 16px;">
<tr><td align="center">
<table width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:{{brandCardBg}};border-radius:12px;overflow:hidden;border:1px solid #e2e8f0;">
<tr>
  <td style="background:{{brandPrimary}};padding:28px 28px 24px;">
    <p style="margin:0;font-size:12px;letter-spacing:0.12em;text-transform:uppercase;color:#94a3b8;">{{siteName}}</p>
    <h1 style="margin:8px 0 0;font-size:22px;font-weight:600;color:#ffffff;">Your call is scheduled</h1>
  </td>
</tr>
<tr>
  <td style="padding:24px 28px 8px;">
<!-- email-editable:start -->
    <p style="font-size:15px;color:{{brandText}};line-height:1.65;margin:0 0 12px;">Hi {{firstName}},</p>
    <p style="font-size:15px;color:{{brandText}};line-height:1.65;margin:0 0 12px;">
      Your onboarding call for <strong>{{propertyLine}}</strong> is scheduled for:
    </p>
    <p style="font-size:16px;color:{{brandPrimary}};font-weight:600;margin:0 0 16px;">{{callTime}}</p>
    <p style="font-size:14px;color:{{brandMuted}};line-height:1.65;margin:0;">
      On this 30-minute call, we&apos;ll walk through your listing details, answer questions, and help you get ready for MLS intake.
    </p>
<!-- email-editable:end -->
  </td>
</tr>
{{notesBlock}}
<tr>
  <td style="padding:16px 28px 28px;">
    <a href="{{onboardingUrl}}" style="display:inline-block;background:{{brandPrimary}};color:#ffffff;text-decoration:none;font-size:14px;font-weight:600;padding:12px 20px;border-radius:{{brandButtonRadius}};">View onboarding checklist</a>
  </td>
</tr>
</table>
</td></tr>
</table>
</body>
</html>`;

export const EMAIL_TEMPLATE_DEFINITIONS: EmailTemplateDefinition[] = [
  {
    slug: "listing-inquiry",
    displayName: "Listing inquiry",
    description: "Sent to the assigned agent when a buyer requests a tour or more info.",
    recipientLabel: "Assigned agent",
    layout: "fragment",
    defaultSubject: "{{subjectPrefix}}: {{address}}, {{city}}",
    defaultHtmlBody: `
      <h2>{{subjectPrefix}}</h2>
      <p><strong>Property:</strong> {{address}}, {{city}}, {{state}}</p>
      <p><strong>Name:</strong> {{name}}</p>
      <p><strong>Email:</strong> <a href="mailto:{{email}}">{{email}}</a></p>
      <p><strong>Phone:</strong> {{phone}}</p>
      {{preferredDateLine}}
      {{messageLine}}
    `.trim(),
    variables: [
      { name: "subjectPrefix", description: "Tour request or Info request", example: "Tour request" },
      { name: "address", description: "Property street address", example: "123 Main St" },
      { name: "city", description: "Property city", example: "Salt Lake City" },
      { name: "state", description: "Property state", example: "UT" },
      { name: "name", description: "Inquirer name", example: "Jane Buyer" },
      { name: "email", description: "Inquirer email", example: "jane@example.com" },
      { name: "phone", description: "Inquirer phone", example: "801-555-0100" },
      { name: "preferredDateLine", description: "Optional HTML block for tour preferred date", example: "" },
      { name: "messageLine", description: "Optional HTML block for buyer message", example: "" },
    ],
    sampleData: {
      subjectPrefix: "Tour request",
      address: "123 Main St",
      city: "Salt Lake City",
      state: "UT",
      name: "Jane Buyer",
      email: "jane@example.com",
      phone: "801-555-0100",
      preferredDateLine: "<p><strong>Preferred date:</strong> Saturday, July 12</p>",
      messageLine: "<p><strong>Message:</strong><br>We'd love to see the backyard.</p>",
    },
  },
  {
    slug: "mls-intake-submitted",
    displayName: "MLS intake submitted",
    description: "Sent to the assigned agent when a seller completes the full MLS intake form.",
    recipientLabel: "Assigned agent",
    layout: "fragment",
    defaultSubject: "Ready for Matrix entry: {{address}}, {{city}}",
    defaultHtmlBody: `
      <h2>Ready for Matrix entry</h2>
      <p><strong>{{sellerName}}</strong> submitted the full MLS intake form.</p>
      <p><strong>Property:</strong> {{address}}, {{city}}, {{state}}</p>
      <p><strong>Action required:</strong> Enter this listing in WFRMLS Matrix.</p>
      <p><a href="{{detailUrl}}">CRM listing summary</a></p>
      <p><a href="{{intakeUrl}}">MLS Intake form (copy fields for Matrix)</a></p>
      {{agreementLine}}
    `.trim(),
    variables: [
      { name: "sellerName", description: "Seller full name", example: "John Smith" },
      { name: "address", description: "Property street address", example: "456 Oak Ave" },
      { name: "city", description: "Property city", example: "Provo" },
      { name: "state", description: "Property state", example: "UT" },
      { name: "detailUrl", description: "CRM listing summary URL", example: "https://glidere.com/crm/listings/abc123" },
      { name: "intakeUrl", description: "CRM MLS intake tab URL", example: "https://glidere.com/crm/listings/abc123?tab=intake" },
      { name: "agreementLine", description: "Optional HTML link to signed agreement PDF", example: "" },
    ],
    sampleData: {
      sellerName: "John Smith",
      address: "456 Oak Ave",
      city: "Provo",
      state: "UT",
      detailUrl: "https://glidere.com/crm/listings/sample-id",
      intakeUrl: "https://glidere.com/crm/listings/sample-id?tab=intake",
      agreementLine: '<p><a href="https://glidere.com/crm/listings/sample-id/documents/doc1">Signed right-to-sell agreement (PDF)</a></p>',
    },
  },
  {
    slug: "onboarding-call-scheduled",
    displayName: "Onboarding call scheduled",
    description: "Sent to the assigned agent when a seller schedules an onboarding call.",
    recipientLabel: "Assigned agent",
    layout: "fragment",
    defaultSubject: "New seller onboarding: {{address}}, {{city}}",
    defaultHtmlBody: `
      <h2>New seller onboarding</h2>
      <p><strong>{{sellerName}}</strong> scheduled an onboarding call.</p>
      <p><strong>Property:</strong> {{address}}, {{city}}, {{state}}</p>
      <p><strong>Plan:</strong> {{servicePlan}}</p>
      <p><strong>Call time:</strong> {{callTime}}</p>
      {{notesLine}}
      <p><strong>Completed so far:</strong></p>
      <ul>
        <li>Listing agreement signed ({{agreementDate}})</li>
        <li>{{photoCount}} photo(s) uploaded</li>
        {{tourLine}}
      </ul>
      <p><a href="{{detailUrl}}">View in CRM</a></p>
    `.trim(),
    variables: [
      { name: "sellerName", description: "Seller full name", example: "Sarah Jones" },
      { name: "address", description: "Property street address", example: "789 Pine Rd" },
      { name: "city", description: "Property city", example: "Draper" },
      { name: "state", description: "Property state", example: "UT" },
      { name: "servicePlan", description: "Selected service plan label", example: "Full service" },
      { name: "callTime", description: "Formatted call date/time", example: "Monday, July 14 at 2:00 PM MT" },
      { name: "notesLine", description: "Optional HTML block for seller call notes", example: "" },
      { name: "agreementDate", description: "Agreement signed date", example: "July 8, 2026" },
      { name: "photoCount", description: "Number of photos uploaded", example: "5" },
      { name: "tourLine", description: "Optional HTML list item for pro photo tour", example: "" },
      { name: "detailUrl", description: "CRM listing URL", example: "https://glidere.com/crm/listings/sample-id" },
    ],
    sampleData: {
      sellerName: "Sarah Jones",
      address: "789 Pine Rd",
      city: "Draper",
      state: "UT",
      servicePlan: "Full service",
      callTime: "Monday, July 14 at 2:00 PM MT",
      notesLine: "<p><strong>Seller notes:</strong> Prefer afternoon calls.</p>",
      agreementDate: "July 8, 2026",
      photoCount: "5",
      tourLine: "<li>Professional photo tour requested</li>",
      detailUrl: "https://glidere.com/crm/listings/sample-id",
    },
  },
  {
    slug: "onboarding-call-confirmation",
    displayName: "Onboarding call confirmation",
    description: "Sent to the seller confirming their onboarding call is scheduled.",
    recipientLabel: "Seller",
    layout: "document",
    defaultSubject: "Your onboarding call is scheduled — {{address}}",
    defaultHtmlBody: ONBOARDING_CALL_CONFIRMATION_HTML,
    variables: [
      { name: "siteName", description: "Site brand name", example: SITE_NAME },
      { name: "firstName", description: "Seller first name", example: "Sarah" },
      { name: "propertyLine", description: "Full property address line", example: "789 Pine Rd, Draper, UT" },
      { name: "callTime", description: "Formatted call date/time", example: "Monday, July 14 at 2:00 PM MT" },
      { name: "notesBlock", description: "Optional HTML block for seller notes", example: "" },
      { name: "onboardingUrl", description: "Onboarding checklist URL", example: "https://glidere.com/account/onboarding/sample-id" },
    ],
    sampleData: {
      siteName: SITE_NAME,
      firstName: "Sarah",
      propertyLine: "789 Pine Rd, Draper, UT",
      callTime: "Monday, July 14 at 2:00 PM MT",
      notesBlock: `
  <tr>
    <td style="padding:4px 28px 12px;">
      <p style="font-size:13px;color:#475569;line-height:1.65;margin:0;">
        <strong>Your notes:</strong> Prefer afternoon calls.
      </p>
    </td>
  </tr>`.trim(),
      onboardingUrl: "https://glidere.com/account/onboarding/sample-id",
    },
  },
  {
    slug: "offer-submitted",
    displayName: "Offer submitted",
    description: "Sent to the assigned agent when a buyer submits an offer.",
    recipientLabel: "Assigned agent",
    layout: "fragment",
    defaultSubject: "New offer: {{address}}, {{city}}",
    defaultHtmlBody: `
      <h2>New offer submitted</h2>
      <p><strong>Property:</strong> {{address}}, {{city}}, {{state}}</p>
      <p><strong>Offer price:</strong> {{offerPrice}}</p>
      <p><strong>Buyer:</strong> {{buyerName}}</p>
      <p><strong>Buyer's agent:</strong> {{buyersAgent}}</p>
      <p><a href="{{detailUrl}}">Review in CRM</a></p>
    `.trim(),
    variables: [
      { name: "address", description: "Property street address", example: "123 Main St" },
      { name: "city", description: "Property city", example: "Salt Lake City" },
      { name: "state", description: "Property state", example: "UT" },
      { name: "offerPrice", description: "Formatted offer price", example: "$525,000" },
      { name: "buyerName", description: "Buyer name", example: "Alex Buyer" },
      { name: "buyersAgent", description: "Buyer's agent name", example: "Chris Agent" },
      { name: "detailUrl", description: "CRM listing URL", example: "https://glidere.com/crm/listings/sample-id" },
    ],
    sampleData: {
      address: "123 Main St",
      city: "Salt Lake City",
      state: "UT",
      offerPrice: "$525,000",
      buyerName: "Alex Buyer",
      buyersAgent: "Chris Agent",
      detailUrl: "https://glidere.com/crm/listings/sample-id",
    },
  },
  {
    slug: "listing-activated",
    displayName: "Listing activated",
    description: "Sent to the assigned agent when a listing goes live (Listtrac/Aligned reminder).",
    recipientLabel: "Assigned agent",
    layout: "fragment",
    defaultSubject: "Listing live — add to Listtrac + Aligned: {{address}}, {{city}}",
    defaultHtmlBody: `
      <h2>Listing is live</h2>
      <p><strong>{{sellerName}}</strong></p>
      <p><strong>Property:</strong> {{address}}, {{city}}, {{state}}</p>
      <p><strong>MLS#:</strong> {{mlsNumber}}</p>
      <p><strong>Action required:</strong> Add this to Listtrac and Aligned Showings.</p>
      <p><a href="{{detailUrl}}">View in CRM</a></p>
    `.trim(),
    variables: [
      { name: "sellerName", description: "Seller full name", example: "John Smith" },
      { name: "address", description: "Property street address", example: "456 Oak Ave" },
      { name: "city", description: "Property city", example: "Provo" },
      { name: "state", description: "Property state", example: "UT" },
      { name: "mlsNumber", description: "MLS number or placeholder", example: "1234567" },
      { name: "detailUrl", description: "CRM listing URL", example: "https://glidere.com/crm/listings/sample-id" },
    ],
    sampleData: {
      sellerName: "John Smith",
      address: "456 Oak Ave",
      city: "Provo",
      state: "UT",
      mlsNumber: "1234567",
      detailUrl: "https://glidere.com/crm/listings/sample-id",
    },
  },
  {
    slug: "listing-assigned",
    displayName: "Listing assigned",
    description: "Sent to an agent when they are assigned a listing.",
    recipientLabel: "Assigned agent",
    layout: "fragment",
    defaultSubject: "Listing assigned: {{address}}, {{city}}",
    defaultHtmlBody: `
      <h2>Hi {{greeting}},</h2>
      <p>You have been assigned a new listing:</p>
      <p><strong>{{address}}</strong>, {{city}}, {{state}}</p>
      <p><a href="{{detailUrl}}">Open in CRM</a></p>
    `.trim(),
    variables: [
      { name: "greeting", description: "Agent name or 'there'", example: "Blair" },
      { name: "address", description: "Property street address", example: "456 Oak Ave" },
      { name: "city", description: "Property city", example: "Provo" },
      { name: "state", description: "Property state", example: "UT" },
      { name: "detailUrl", description: "CRM listing URL", example: "https://glidere.com/crm/listings/sample-id" },
    ],
    sampleData: {
      greeting: "Blair",
      address: "456 Oak Ave",
      city: "Provo",
      state: "UT",
      detailUrl: "https://glidere.com/crm/listings/sample-id",
    },
  },
  {
    slug: "listing-welcome",
    displayName: "Listing welcome",
    description: "Sent to the seller when their listing goes live on the MLS.",
    recipientLabel: "Seller",
    layout: "document",
    defaultSubject: "Your listing is live — {{propertyLine}}",
    defaultHtmlBody: LISTING_WELCOME_HTML,
    variables: [
      { name: "propertyLine", description: "Full property address line", example: "456 Oak Ave, Provo, UT" },
      { name: "firstName", description: "Seller first name", example: "John" },
      { name: "loginUrl", description: "Account login URL", example: "https://glidere.com/login" },
      { name: "signupUrl", description: "Account signup URL", example: "https://glidere.com/signup" },
      { name: "siteName", description: "Site brand name", example: SITE_NAME },
      { name: "sellerEmail", description: "Seller email address", example: "john@example.com" },
      { name: "offerBlock", description: "Optional HTML block for offer form link", example: "" },
      { name: "brokerageLine", description: "Brokerage footer line", example: BROKERAGE_LINE },
      { name: "agentEmail", description: "Agent contact email", example: AGENT_EMAIL },
      { name: "siteUrl", description: "Public site URL", example: SITE_URL },
    ],
    sampleData: {
      propertyLine: "456 Oak Ave, Provo, UT",
      firstName: "John",
      loginUrl: "https://glidere.com/login",
      signupUrl: "https://glidere.com/signup",
      siteName: SITE_NAME,
      sellerEmail: "john@example.com",
      offerBlock: "",
      brokerageLine: BROKERAGE_LINE,
      agentEmail: AGENT_EMAIL,
      siteUrl: SITE_URL,
    },
  },
];

const definitionBySlug = new Map(
  EMAIL_TEMPLATE_DEFINITIONS.map((definition) => [definition.slug, definition]),
);

export function isValidEmailTemplateSlug(slug: string): boolean {
  return definitionBySlug.has(slug);
}

export function getEmailTemplateDefinition(
  slug: string,
): EmailTemplateDefinition | null {
  return definitionBySlug.get(slug) ?? null;
}

export function listEmailTemplateDefinitions(): EmailTemplateDefinition[] {
  return EMAIL_TEMPLATE_DEFINITIONS;
}
