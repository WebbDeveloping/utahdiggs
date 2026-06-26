"use server";

import bcrypt from "bcryptjs";
import { revalidatePath } from "next/cache";
import { UserRole } from "@/generated/prisma/client";
import { auth } from "@/lib/auth/admin-auth";
import { canManageUsers } from "@/lib/auth/roles";
import { getSessionUser } from "@/lib/crm/access";
import { prisma } from "@/lib/db";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MIN_PASSWORD_LENGTH = 8;

export type CrmUserActionState = {
  error?: string;
  success?: string;
  fieldErrors?: Record<string, string>;
};

async function requireAdminSession() {
  const session = await auth();
  const user = getSessionUser(session);
  if (!user || !canManageUsers(user.role)) {
    throw new Error("Unauthorized");
  }
  return user;
}

async function countOtherActiveAdmins(excludeUserId: string) {
  return prisma.user.count({
    where: {
      role: UserRole.ADMIN,
      active: true,
      id: { not: excludeUserId },
    },
  });
}

function asString(value: FormDataEntryValue | null): string {
  return typeof value === "string" ? value.trim() : "";
}

export async function getCrmUsers() {
  await requireAdminSession();
  return prisma.user.findMany({
    orderBy: [{ active: "desc" }, { name: "asc" }, { email: "asc" }],
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      active: true,
      createdAt: true,
    },
  });
}

export async function createCrmUserAction(
  _prev: CrmUserActionState,
  formData: FormData,
): Promise<CrmUserActionState> {
  try {
    await requireAdminSession();
  } catch {
    return { error: "You are not authorized to manage users." };
  }

  const fieldErrors: Record<string, string> = {};
  const name = asString(formData.get("name"));
  const email = asString(formData.get("email")).toLowerCase();
  const password = asString(formData.get("password"));
  const roleRaw = asString(formData.get("role"));

  if (!name) fieldErrors.name = "Name is required.";
  if (!email) fieldErrors.email = "Email is required.";
  else if (!EMAIL_RE.test(email)) fieldErrors.email = "Enter a valid email address.";
  if (!password) fieldErrors.password = "Password is required.";
  else if (password.length < MIN_PASSWORD_LENGTH) {
    fieldErrors.password = `Password must be at least ${MIN_PASSWORD_LENGTH} characters.`;
  }

  const role =
    roleRaw === UserRole.ADMIN || roleRaw === UserRole.AGENT
      ? roleRaw
      : null;
  if (!role) fieldErrors.role = "Select a valid role.";

  if (Object.keys(fieldErrors).length > 0 || !role) {
    return { fieldErrors };
  }

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return { fieldErrors: { email: "A user with this email already exists." } };
  }

  const passwordHash = await bcrypt.hash(password, 10);
  await prisma.user.create({
    data: { name, email, passwordHash, role, active: true },
  });

  revalidatePath("/crm/users");
  return { success: "User created successfully." };
}

export async function updateCrmUserRoleAction(
  userId: string,
  role: UserRole,
): Promise<CrmUserActionState> {
  const admin = await requireAdminSession();

  if (role !== UserRole.ADMIN && role !== UserRole.AGENT) {
    return { error: "Invalid role." };
  }

  const target = await prisma.user.findUnique({ where: { id: userId } });
  if (!target) {
    return { error: "User not found." };
  }

  if (
    target.role === UserRole.ADMIN &&
    role === UserRole.AGENT &&
    target.active
  ) {
    const otherAdmins = await countOtherActiveAdmins(userId);
    if (otherAdmins === 0) {
      return { error: "Cannot demote the last active admin." };
    }
  }

  if (userId === admin.id && role !== UserRole.ADMIN) {
    return { error: "You cannot change your own role." };
  }

  await prisma.user.update({
    where: { id: userId },
    data: { role },
  });

  revalidatePath("/crm/users");
  return { success: "Role updated." };
}

export async function setCrmUserActiveAction(
  userId: string,
  active: boolean,
): Promise<CrmUserActionState> {
  const admin = await requireAdminSession();

  const target = await prisma.user.findUnique({ where: { id: userId } });
  if (!target) {
    return { error: "User not found." };
  }

  if (userId === admin.id && !active) {
    return { error: "You cannot deactivate your own account." };
  }

  if (!active && target.role === UserRole.ADMIN && target.active) {
    const otherAdmins = await countOtherActiveAdmins(userId);
    if (otherAdmins === 0) {
      return { error: "Cannot deactivate the last active admin." };
    }
  }

  await prisma.user.update({
    where: { id: userId },
    data: { active },
  });

  revalidatePath("/crm/users");
  return { success: active ? "User reactivated." : "User deactivated." };
}

export async function resetCrmUserPasswordAction(
  userId: string,
  password: string,
): Promise<CrmUserActionState> {
  await requireAdminSession();

  if (password.length < MIN_PASSWORD_LENGTH) {
    return {
      error: `Password must be at least ${MIN_PASSWORD_LENGTH} characters.`,
    };
  }

  const target = await prisma.user.findUnique({ where: { id: userId } });
  if (!target) {
    return { error: "User not found." };
  }

  const passwordHash = await bcrypt.hash(password, 10);
  await prisma.user.update({
    where: { id: userId },
    data: { passwordHash },
  });

  revalidatePath("/crm/users");
  return { success: "Password updated." };
}
