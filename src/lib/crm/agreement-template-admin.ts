import { NextResponse } from "next/server";
import { auth } from "@/lib/auth/admin-auth";
import { canManageUsers } from "@/lib/auth/roles";
import { getSessionUser } from "@/lib/crm/access";

export async function requireAgreementTemplateAdmin() {
  const session = await auth();
  const user = getSessionUser(session);

  if (!user || !canManageUsers(user.role)) {
    return {
      user: null,
      response: NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
    };
  }

  return { user, response: null };
}
