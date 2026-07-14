"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth/admin-auth";
import {
  canEditMlsOpsSettings,
  requireCrmUser,
} from "@/lib/crm/access";
import {
  assertActiveAgentUserId,
  upsertMlsOpsSettings,
} from "@/lib/crm/mls-ops-settings";

export type MlsOpsSettingsActionState = {
  error?: string;
  success?: boolean;
  clearedOverride?: boolean;
};

function isValidEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

export async function saveMlsOpsSettingsAction(
  _prev: MlsOpsSettingsActionState,
  formData: FormData,
): Promise<MlsOpsSettingsActionState> {
  const session = await auth();
  const user = requireCrmUser(session);

  if (!canEditMlsOpsSettings(user)) {
    return { error: "Only admins can update MLS ops settings." };
  }

  const clearOverride = formData.get("clearOverride") === "1";
  const defaultVaUserIdRaw = String(formData.get("defaultVaUserId") ?? "").trim();
  const fallbackEmailRaw = clearOverride
    ? ""
    : String(formData.get("fallbackEmail") ?? "").trim();

  try {
    const defaultVaUserId = await assertActiveAgentUserId(
      defaultVaUserIdRaw || null,
    );

    if (fallbackEmailRaw && !isValidEmail(fallbackEmailRaw)) {
      return { error: "Fallback email is not valid." };
    }

    await upsertMlsOpsSettings({
      defaultVaUserId,
      fallbackEmail: fallbackEmailRaw || null,
    });
  } catch (err) {
    return {
      error: err instanceof Error ? err.message : "Failed to save settings.",
    };
  }

  revalidatePath("/crm/mls-queue");
  return {
    success: true,
    clearedOverride: clearOverride || !fallbackEmailRaw,
  };
}
