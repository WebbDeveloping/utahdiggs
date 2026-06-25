"use server";

import bcrypt from "bcryptjs";
import { AuthError } from "next-auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { signIn } from "@/lib/auth/consumer-auth";
import { getConsumerSession } from "@/lib/auth/consumer-session";
import { buildListingPrefillPath, normalizeInquiryState } from "@/lib/consumer/listing-prefill";
import {
  normalizeEmail,
  validateEmail,
  validateSignupPasswords,
} from "@/lib/consumer/validation";
import { parseSellInquiryFormData } from "@/lib/consumer/sell-inquiry-validation";

export type SellInquiryState = {
  error?: string;
  fieldErrors?: Record<string, string>;
};

export async function checkSellInquiryEmailAction(
  email: string,
): Promise<{ exists: boolean }> {
  const normalized = normalizeEmail(email);
  const emailError = validateEmail(normalized);
  if (emailError) {
    return { exists: false };
  }

  const customer = await prisma.customer.findUnique({
    where: { email: normalized },
    select: { id: true },
  });

  return { exists: Boolean(customer) };
}

export async function completeSellInquiryAction(
  _prev: SellInquiryState,
  formData: FormData,
): Promise<SellInquiryState> {
  const { input, fieldErrors } = parseSellInquiryFormData(formData);
  if (Object.keys(fieldErrors).length > 0) {
    return { fieldErrors };
  }

  const session = await getConsumerSession();
  const password = formData.get("password")?.toString() ?? "";
  const confirmPassword = formData.get("confirmPassword")?.toString() ?? "";
  const emailExists = formData.get("emailExists")?.toString() === "true";
  const normalizedState = normalizeInquiryState(input.state);
  const fullName = `${input.firstName} ${input.lastName}`.trim();

  let customerId: string;

  if (session) {
    customerId = session.id;

    await prisma.customer.update({
      where: { id: customerId },
      data: {
        name: fullName,
        phone: input.phone,
      },
    });
  } else if (emailExists) {
    if (!password) {
      return { fieldErrors: { password: "Password is required." } };
    }

    const customer = await prisma.customer.findUnique({
      where: { email: input.email },
    });

    if (!customer?.passwordHash) {
      return { error: "Invalid email or password." };
    }

    const valid = await bcrypt.compare(password, customer.passwordHash);
    if (!valid) {
      return { fieldErrors: { password: "Invalid email or password." } };
    }

    customerId = customer.id;

    await prisma.customer.update({
      where: { id: customerId },
      data: {
        name: fullName,
        phone: customer.phone?.trim() ? customer.phone : input.phone,
      },
    });

    try {
      await signIn("consumer-credentials", {
        email: input.email,
        password,
        redirect: false,
      });
    } catch (error) {
      if (error instanceof AuthError) {
        return { fieldErrors: { password: "Invalid email or password." } };
      }
      throw error;
    }
  } else {
    const passwordError = validateSignupPasswords(password, confirmPassword);
    if (passwordError) {
      return { fieldErrors: { password: passwordError } };
    }

    const existing = await prisma.customer.findUnique({
      where: { email: input.email },
    });

    if (existing) {
      return {
        error: "An account with this email already exists. Sign in to continue.",
      };
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const customer = await prisma.customer.create({
      data: {
        email: input.email,
        passwordHash,
        name: fullName,
        phone: input.phone,
      },
    });

    customerId = customer.id;

    try {
      await signIn("consumer-credentials", {
        email: input.email,
        password,
        redirect: false,
      });
    } catch (error) {
      if (error instanceof AuthError) {
        return { error: "Account created but sign-in failed. Please try logging in." };
      }
      throw error;
    }
  }

  const inquiry = await prisma.sellInquiry.create({
    data: {
      customerId,
      firstName: input.firstName,
      lastName: input.lastName,
      email: input.email,
      phone: input.phone,
      streetAddress: input.streetAddress,
      city: input.city,
      state: normalizedState,
      zip: input.zip,
      timeline: input.timeline,
    },
  });

  redirect(
    buildListingPrefillPath({
      streetAddress: input.streetAddress,
      city: input.city,
      state: normalizedState,
      zip: input.zip,
      inquiryId: inquiry.id,
    }),
  );
}

export async function completeLoggedInSellInquiryAction(
  _prev: SellInquiryState,
  formData: FormData,
): Promise<SellInquiryState> {
  const session = await getConsumerSession();
  if (!session) {
    return { error: "You must be signed in to continue." };
  }

  const { input, fieldErrors } = parseSellInquiryFormData(formData);
  if (Object.keys(fieldErrors).length > 0) {
    return { fieldErrors };
  }

  const normalizedState = normalizeInquiryState(input.state);
  const fullName = `${input.firstName} ${input.lastName}`.trim();

  await prisma.customer.update({
    where: { id: session.id },
    data: {
      name: fullName,
      phone: input.phone,
    },
  });

  const inquiry = await prisma.sellInquiry.create({
    data: {
      customerId: session.id,
      firstName: input.firstName,
      lastName: input.lastName,
      email: input.email,
      phone: input.phone,
      streetAddress: input.streetAddress,
      city: input.city,
      state: normalizedState,
      zip: input.zip,
      timeline: input.timeline,
    },
  });

  redirect(
    buildListingPrefillPath({
      streetAddress: input.streetAddress,
      city: input.city,
      state: normalizedState,
      zip: input.zip,
      inquiryId: inquiry.id,
    }),
  );
}
