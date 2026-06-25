import bcrypt from "bcryptjs";
import { cookies } from "next/headers";
import { prisma } from "@/lib/db";

export const PORTAL_SESSION_COOKIE = "utahdigs_portal_session";
const SESSION_TTL_DAYS = 30;

function sessionExpiry(): Date {
  const expires = new Date();
  expires.setDate(expires.getDate() + SESSION_TTL_DAYS);
  return expires;
}

export function derivePasscodeFromPhone(phone: string): string {
  const digits = phone.replace(/\D/g, "");
  return digits.slice(-4);
}

export async function hashPasscode(passcode: string): Promise<string> {
  return bcrypt.hash(passcode, 10);
}

export async function verifyPasscode(
  passcode: string,
  passcodeHash: string,
): Promise<boolean> {
  return bcrypt.compare(passcode, passcodeHash);
}

export async function createPortalSession(contactId: string, listingId: string) {
  const token = crypto.randomUUID();
  const expiresAt = sessionExpiry();

  await prisma.portalSession.create({
    data: {
      token,
      contactId,
      listingId,
      expiresAt,
    },
  });

  return { token, expiresAt };
}

export async function getPortalSession(token: string) {
  const session = await prisma.portalSession.findUnique({
    where: { token },
    include: {
      contact: true,
      listing: true,
    },
  });

  if (!session || session.expiresAt < new Date()) {
    if (session) {
      await prisma.portalSession.delete({ where: { id: session.id } });
    }
    return null;
  }

  return session;
}

export async function getPortalSessionFromCookies() {
  const cookieStore = await cookies();
  const token = cookieStore.get(PORTAL_SESSION_COOKIE)?.value;
  if (!token) return null;
  return getPortalSession(token);
}

export async function destroyPortalSession(token: string) {
  await prisma.portalSession.deleteMany({ where: { token } });
}

export type PortalLoginInput = {
  slug: string;
  email: string;
  passcode: string;
};

export type PortalLoginResult =
  | { ok: true; contactId: string; listingId: string; token: string; expiresAt: Date }
  | { ok: false; error: string };

export async function loginPortalUser(
  input: PortalLoginInput,
): Promise<PortalLoginResult> {
  const email = input.email.trim().toLowerCase();
  const passcode = input.passcode.trim();
  const slug = input.slug.trim().toLowerCase();

  if (!email || !passcode || !slug) {
    return { ok: false, error: "Email, passcode, and listing slug are required." };
  }

  const listing = await prisma.listing.findUnique({
    where: { portalSlug: slug },
    include: {
      contacts: {
        include: { contact: true },
      },
    },
  });

  if (!listing) {
    return { ok: false, error: "Listing not found." };
  }

  const passcodeOk = await verifyPasscode(passcode, listing.passcodeHash);
  if (!passcodeOk) {
    return { ok: false, error: "Email or passcode is incorrect." };
  }

  const matchedContact = listing.contacts.find(
    (lc) => lc.contact.email.toLowerCase() === email,
  );

  if (!matchedContact) {
    return { ok: false, error: "Email or passcode is incorrect." };
  }

  const { token, expiresAt } = await createPortalSession(
    matchedContact.contactId,
    listing.id,
  );

  return {
    ok: true,
    contactId: matchedContact.contactId,
    listingId: listing.id,
    token,
    expiresAt,
  };
}

export async function generateListingPasscodeHash(
  primaryContactPhone: string,
): Promise<{ passcode: string; passcodeHash: string }> {
  const passcode = derivePasscodeFromPhone(primaryContactPhone);
  const passcodeHash = await hashPasscode(passcode);
  return { passcode, passcodeHash };
}
