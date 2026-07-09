import {
  accountLoginUrl,
  accountSignupUrl,
  sendEmail,
} from "@/lib/email/send";
import {
  AGENT_EMAIL,
  BROKERAGE_LINE,
  CONTACT_EMAIL,
  SITE_NAME,
  SITE_URL,
} from "@/lib/seo/site";

export type ListingWelcomeEmailInput = {
  sellerEmail: string;
  sellerName: string;
  address: string;
  city: string;
  state?: string;
  offerFormUrl?: string;
};

function sellerFirstName(name: string): string {
  return name.trim().split(/\s+/)[0] || "Seller";
}

function formatPropertyLine(input: ListingWelcomeEmailInput): string {
  const parts = [input.address, input.city];
  if (input.state) {
    parts.push(input.state);
  }
  return parts.join(", ");
}

function buildListingWelcomeHtml(input: ListingWelcomeEmailInput): string {
  const firstName = sellerFirstName(input.sellerName);
  const propertyLine = formatPropertyLine(input);
  const loginUrl = accountLoginUrl();
  const signupUrl = accountSignupUrl();
  const offerBlock = input.offerFormUrl
    ? `
  <tr>
    <td style="padding:4px 28px 12px;">
      <p style="font-size:13px;color:#475569;line-height:1.65;margin:0;">
        <strong>Offer form:</strong>
        <a href="${input.offerFormUrl}" style="color:#1a3a5c;">${input.offerFormUrl}</a>
      </p>
    </td>
  </tr>`
    : "";

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Your listing is live — ${propertyLine}</title>
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
<body style="margin:0;padding:0;background:#F1F5F9;font-family:'Helvetica Neue',Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#F1F5F9;padding:32px 16px;">
<tr><td align="center">
<table class="email-card" width="600" cellpadding="0" cellspacing="0" border="0" style="max-width:600px;width:100%;background:#ffffff;border-radius:14px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">
  <tr>
    <td class="hdr-td" style="background:#1a3a5c;padding:28px 36px 24px;">
      <table width="100%" cellpadding="0" cellspacing="0" border="0">
        <tr>
          <td valign="middle" align="center">
            <div style="font-size:24px;font-weight:800;color:#ffffff;line-height:1.2;text-align:center;">&#127968; Your Listing Is Live! &#127881;</div>
            <div style="font-size:16px;font-weight:700;color:rgba(255,255,255,0.9);margin-top:8px;text-align:center;">${propertyLine}</div>
          </td>
        </tr>
      </table>
    </td>
  </tr>
  <tr>
    <td class="body-td" style="padding:24px 28px 8px;">
      <p style="font-size:15px;color:#1E293B;line-height:1.65;margin:0 0 14px 0;">Hi <strong>${firstName}</strong> &#8212; exciting news!</p>
      <p style="font-size:15px;color:#1E293B;line-height:1.65;margin:0 0 12px 0;">Your listing just went live. From here on out, you don't have to wonder what's happening &#8212; <strong>it's all in one place.</strong></p>
      <p style="font-size:14px;color:#475569;line-height:1.65;margin:0;">This is your private seller account. Every Sunday evening you'll get a full update on everything that matters:</p>
    </td>
  </tr>
  <tr>
    <td class="feat-td" style="padding:12px 28px 16px;">
      <table width="100%" cellpadding="0" cellspacing="0" border="0">
        <tr><td style="padding-bottom:8px;"><table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#F8FAFC;border:1px solid #E2E8F0;border-radius:10px;padding:12px 14px;"><tr><td width="36" valign="middle" style="padding-right:12px;"><div style="width:34px;height:34px;background:#EFF6FF;border-radius:8px;text-align:center;line-height:34px;font-size:18px;">&#128202;</div></td><td valign="middle"><div style="font-size:13px;font-weight:700;color:#1E293B;margin-bottom:2px;">Online Views &amp; Internet Exposure</div><div style="font-size:12px;color:#64748B;">Zillow, Realtor.com, Redfin, and more &#8212; updated weekly</div></td></tr></table></td></tr>
        <tr><td style="padding-bottom:8px;"><table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#F8FAFC;border:1px solid #E2E8F0;border-radius:10px;padding:12px 14px;"><tr><td width="36" valign="middle" style="padding-right:12px;"><div style="width:34px;height:34px;background:#FFF7ED;border-radius:8px;text-align:center;line-height:34px;font-size:18px;">&#127968;</div></td><td valign="middle"><div style="font-size:13px;font-weight:700;color:#1E293B;margin-bottom:2px;">Showing Activity &amp; Buyer Feedback</div><div style="font-size:12px;color:#64748B;">See who toured and what they said, every week</div></td></tr></table></td></tr>
        <tr><td style="padding-bottom:8px;"><table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#F8FAFC;border:1px solid #E2E8F0;border-radius:10px;padding:12px 14px;"><tr><td width="36" valign="middle" style="padding-right:12px;"><div style="width:34px;height:34px;background:#F0FDF4;border-radius:8px;text-align:center;line-height:34px;font-size:18px;">&#128202;</div></td><td valign="middle"><div style="font-size:13px;font-weight:700;color:#1E293B;margin-bottom:2px;">Local Market Snapshot</div><div style="font-size:12px;color:#64748B;">Market stats, days on market, price trends in your area</div></td></tr></table></td></tr>
        <tr><td><table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#F8FAFC;border:1px solid #E2E8F0;border-radius:10px;padding:12px 14px;"><tr><td width="36" valign="middle" style="padding-right:12px;"><div style="width:34px;height:34px;background:#FDF4FF;border-radius:8px;text-align:center;line-height:34px;font-size:18px;">&#128203;</div></td><td valign="middle"><div style="font-size:13px;font-weight:700;color:#1E293B;margin-bottom:2px;">Your Documents, All in One Place</div><div style="font-size:12px;color:#64748B;">Disclosures, offers, and transaction files &#8212; easy to find, anytime</div></td></tr></table></td></tr>
      </table>
    </td>
  </tr>
  <tr>
    <td class="bkmk-td" style="padding:4px 28px 20px;">
      <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#EFF6FF;border:1px solid #BFDBFE;border-left:3px solid #1a3a5c;border-radius:0 10px 10px 0;padding:14px 16px;">
        <tr><td style="font-size:11px;font-weight:700;letter-spacing:1.2px;text-transform:uppercase;color:#1a3a5c;padding-bottom:6px;">&#128204; &nbsp;Bookmark Your Account</td></tr>
        <tr><td style="font-size:13px;color:#334155;line-height:1.6;">Sign in anytime to track showings, offers, web traffic, and requests. Your account updates automatically every Sunday evening.</td></tr>
      </table>
    </td>
  </tr>
  <tr>
    <td class="cta-td" style="padding:4px 28px 24px;" align="center">
      <table cellpadding="0" cellspacing="0" border="0"><tr><td style="background:#1a3a5c;border-radius:10px;padding:14px 36px;"><a href="${loginUrl}" style="font-size:14px;font-weight:700;color:#ffffff;text-decoration:none;display:block;">Sign In to Your Account &#8594;</a></td></tr></table>
      <div style="font-size:11px;color:#94A3B8;margin-top:10px;">Showings &middot; Offers &middot; Web traffic &middot; Seller requests</div>
    </td>
  </tr>
  <tr>
    <td class="login-td" style="padding:4px 28px 20px;">
      <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#F8FAFC;border:1px solid #E2E8F0;border-radius:10px;padding:14px 16px;">
        <tr><td style="font-size:11px;font-weight:700;letter-spacing:1px;text-transform:uppercase;color:#64748B;padding-bottom:10px;">&#128273; Your Account Access</td></tr>
        <tr><td style="font-size:13px;color:#334155;padding-bottom:8px;"><strong>New to ${SITE_NAME}?</strong> <a href="${signupUrl}" style="color:#1a3a5c;">Create your account</a> with <strong>${input.sellerEmail}</strong></td></tr>
        <tr><td style="font-size:13px;color:#334155;"><strong>Already have an account?</strong> <a href="${loginUrl}" style="color:#1a3a5c;">Sign in</a></td></tr>
      </table>
    </td>
  </tr>
  ${offerBlock}
  <tr><td style="border-top:1px solid #E2E8F0;"></td></tr>
  <tr>
    <td class="footer-td" style="padding:20px 28px 24px;">
      <table width="100%" cellpadding="0" cellspacing="0" border="0">
        <tr><td>
          <div style="font-size:13px;font-weight:700;color:#1E293B;">Blair Allen</div>
          <div style="font-size:12px;color:#64748B;margin-top:2px;">${BROKERAGE_LINE}</div>
          <div style="margin-top:6px;">
            <a href="tel:8013375057" style="font-size:12px;color:#1a3a5c;text-decoration:none;">801.337.5057</a>
            <span style="color:#CBD5E1;margin:0 6px;">&middot;</span>
            <a href="mailto:${AGENT_EMAIL}" style="font-size:12px;color:#1a3a5c;text-decoration:none;">${AGENT_EMAIL}</a>
            <span style="color:#CBD5E1;margin:0 6px;">&middot;</span>
            <a href="${SITE_URL}" style="font-size:12px;color:#1a3a5c;text-decoration:none;">glidere.com</a>
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
}

export async function sendListingWelcomeEmail(
  input: ListingWelcomeEmailInput,
): Promise<void> {
  const propertyLine = formatPropertyLine(input);

  await sendEmail({
    to: input.sellerEmail,
    subject: `Your listing is live — ${propertyLine}`,
    html: buildListingWelcomeHtml(input),
  });
}
