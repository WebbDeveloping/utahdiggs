"use server";

import bcrypt from "bcryptjs";
import { AuthError } from "next-auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { getSafeRedirectPath } from "@/lib/auth/safe-redirect";
import { signIn, signOut } from "@/lib/auth/consumer-auth";
import {
  normalizeEmail,
  validateEmail,
  validateSignupPasswords,
} from "@/lib/consumer/validation";

function getRedirectTarget(formData: FormData): string {
  return getSafeRedirectPath(formData.get("next")?.toString());
}

export type ConsumerAuthState = {
  error?: string;
  fieldErrors?: {
    name?: string;
    email?: string;
    password?: string;
    confirmPassword?: string;
  };
};

export async function consumerLoginAction(
  _prev: ConsumerAuthState,
  formData: FormData,
): Promise<ConsumerAuthState> {
  const email = normalizeEmail(formData.get("email")?.toString() ?? "");
  const password = formData.get("password")?.toString() ?? "";

  const emailError = validateEmail(email);
  if (emailError) {
    return { fieldErrors: { email: emailError } };
  }

  if (!password) {
    return { fieldErrors: { password: "Password is required." } };
  }

  const redirectTo = getRedirectTarget(formData);

  try {
    await signIn("consumer-credentials", {
      email,
      password,
      redirectTo,
    });
  } catch (error) {
    if (error instanceof AuthError) {
      return { error: "Invalid email or password." };
    }
    throw error;
  }

  redirect(redirectTo);
}

export async function consumerSignupAction(
  _prev: ConsumerAuthState,
  formData: FormData,
): Promise<ConsumerAuthState> {
  const name = formData.get("name")?.toString().trim() ?? "";
  const email = normalizeEmail(formData.get("email")?.toString() ?? "");
  const password = formData.get("password")?.toString() ?? "";
  const confirmPassword = formData.get("confirmPassword")?.toString() ?? "";

  const fieldErrors: ConsumerAuthState["fieldErrors"] = {};

  const emailError = validateEmail(email);
  if (emailError) {
    fieldErrors.email = emailError;
  }

  const passwordError = validateSignupPasswords(password, confirmPassword);
  if (passwordError) {
    fieldErrors.password = passwordError;
  }

  if (Object.keys(fieldErrors).length > 0) {
    return { fieldErrors };
  }

  const existing = await prisma.customer.findUnique({ where: { email } });
  if (existing) {
    return { error: "An account with this email already exists." };
  }

  const passwordHash = await bcrypt.hash(password, 10);

  await prisma.customer.create({
    data: {
      email,
      passwordHash,
      name: name || null,
    },
  });

  const redirectTo = getRedirectTarget(formData);

  try {
    await signIn("consumer-credentials", {
      email,
      password,
      redirectTo,
    });
  } catch (error) {
    if (error instanceof AuthError) {
      return { error: "Account created but sign-in failed. Please try logging in." };
    }
    throw error;
  }

  redirect(redirectTo);
}

export async function consumerSignOutAction() {
  await signOut({ redirectTo: "/" });
}
