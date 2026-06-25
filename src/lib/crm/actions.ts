"use server";

import { AuthError } from "next-auth";
import { redirect } from "next/navigation";
import { signIn } from "@/lib/auth/admin-auth";

export type CrmLoginState = {
  error?: string;
};

export async function crmLoginAction(
  _prev: CrmLoginState,
  formData: FormData,
): Promise<CrmLoginState> {
  try {
    await signIn("credentials", {
      email: formData.get("email"),
      password: formData.get("password"),
      redirectTo: "/crm",
    });
  } catch (error) {
    if (error instanceof AuthError) {
      return { error: "Invalid email or password." };
    }
    throw error;
  }

  redirect("/crm");
}
