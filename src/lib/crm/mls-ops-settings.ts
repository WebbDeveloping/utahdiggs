import { UserRole } from "@/generated/prisma/client";
import { prisma } from "@/lib/db";
import { defaultAgentNotificationEmail } from "@/lib/email/agent-notification";

export type MlsOpsSettingsData = {
  defaultVaUserId: string | null;
  fallbackEmail: string | null;
  preferAssignedAgent: boolean;
  defaultVaUser: {
    id: string;
    name: string | null;
    email: string;
    active: boolean;
  } | null;
};

const EMPTY_SETTINGS: MlsOpsSettingsData = {
  defaultVaUserId: null,
  fallbackEmail: null,
  preferAssignedAgent: false,
  defaultVaUser: null,
};

/** Env default for MLS intake notification emails (not the CRM login user). */
export function mlsVaNotificationEmailFromEnv(): string {
  const fromMlsEnv = process.env.MLS_VA_NOTIFICATION_EMAIL?.trim();
  if (fromMlsEnv) {
    return fromMlsEnv;
  }
  return defaultAgentNotificationEmail();
}

export async function getMlsOpsSettings(): Promise<MlsOpsSettingsData> {
  const row = await prisma.mlsOpsSettings.findUnique({
    where: { id: "default" },
    select: {
      defaultVaUserId: true,
      fallbackEmail: true,
      preferAssignedAgent: true,
      defaultVaUser: {
        select: { id: true, name: true, email: true, active: true },
      },
    },
  });

  if (!row) {
    return EMPTY_SETTINGS;
  }

  return {
    defaultVaUserId: row.defaultVaUserId,
    fallbackEmail: row.fallbackEmail,
    preferAssignedAgent: row.preferAssignedAgent,
    defaultVaUser: row.defaultVaUser,
  };
}

export async function getDefaultMlsVaUserId(): Promise<string | null> {
  const row = await prisma.mlsOpsSettings.findUnique({
    where: { id: "default" },
    select: { defaultVaUserId: true },
  });
  return row?.defaultVaUserId ?? null;
}

export type UpsertMlsOpsSettingsInput = {
  defaultVaUserId: string | null;
  fallbackEmail: string | null;
  preferAssignedAgent?: boolean;
};

export async function upsertMlsOpsSettings(
  input: UpsertMlsOpsSettingsInput,
): Promise<MlsOpsSettingsData> {
  const row = await prisma.mlsOpsSettings.upsert({
    where: { id: "default" },
    create: {
      id: "default",
      defaultVaUserId: input.defaultVaUserId,
      fallbackEmail: input.fallbackEmail,
      preferAssignedAgent: input.preferAssignedAgent ?? false,
    },
    update: {
      defaultVaUserId: input.defaultVaUserId,
      fallbackEmail: input.fallbackEmail,
      ...(input.preferAssignedAgent !== undefined
        ? { preferAssignedAgent: input.preferAssignedAgent }
        : {}),
    },
    select: {
      defaultVaUserId: true,
      fallbackEmail: true,
      preferAssignedAgent: true,
      defaultVaUser: {
        select: { id: true, name: true, email: true, active: true },
      },
    },
  });

  return {
    defaultVaUserId: row.defaultVaUserId,
    fallbackEmail: row.fallbackEmail,
    preferAssignedAgent: row.preferAssignedAgent,
    defaultVaUser: row.defaultVaUser,
  };
}

export async function seedMlsOpsSettings(): Promise<void> {
  await prisma.mlsOpsSettings.upsert({
    where: { id: "default" },
    create: {
      id: "default",
      defaultVaUserId: null,
      fallbackEmail: null,
      preferAssignedAgent: false,
    },
    update: {},
  });
}

export async function resolveMlsIntakeNotificationEmail(
  listingId?: string | null,
): Promise<string> {
  const settings = await getMlsOpsSettings();

  if (settings.preferAssignedAgent && listingId) {
    const listing = await prisma.listing.findUnique({
      where: { id: listingId },
      select: {
        assignedAgent: {
          select: { email: true, active: true },
        },
      },
    });
    if (listing?.assignedAgent?.active && listing.assignedAgent.email) {
      return listing.assignedAgent.email;
    }
  }

  const dbFallback = settings.fallbackEmail?.trim();
  if (dbFallback) {
    return dbFallback;
  }

  // Env default — not the CRM Agent user's email (that user is for queue access only).
  return mlsVaNotificationEmailFromEnv();
}

export async function assertActiveAgentUserId(
  userId: string | null,
): Promise<string | null> {
  if (!userId) {
    return null;
  }

  const agent = await prisma.user.findFirst({
    where: { id: userId, role: UserRole.AGENT, active: true },
    select: { id: true },
  });

  if (!agent) {
    throw new Error("Selected MLS VA must be an active agent.");
  }

  return agent.id;
}
