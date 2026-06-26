import { redirect } from "next/navigation";
import CrmPageHeader from "@/components/crm/CrmPageHeader";
import CrmUserManagement from "@/components/crm/CrmUserManagement";
import { auth } from "@/lib/auth/admin-auth";
import { canManageUsers } from "@/lib/auth/roles";
import { getSessionUser } from "@/lib/crm/access";
import { getCrmUsers } from "@/lib/crm/user-actions";

export default async function CrmUsersPage() {
  const session = await auth();
  const user = getSessionUser(session);

  if (!user || !canManageUsers(user.role)) {
    redirect("/crm");
  }

  const users = await getCrmUsers();

  return (
    <>
      <CrmPageHeader
        title="Team"
        description="Manage CRM users — admins and listing agents."
      />
      <CrmUserManagement users={users} currentUserId={user.id} />
    </>
  );
}
