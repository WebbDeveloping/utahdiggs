import { ClosingTeamRole } from "@/generated/prisma/client";
import AddListingForm from "@/components/crm/AddListingForm";
import CrmPageHeader from "@/components/crm/CrmPageHeader";
import { auth } from "@/lib/auth/admin-auth";
import { isAdmin } from "@/lib/auth/roles";
import { getSessionUser } from "@/lib/crm/access";
import { getActiveAgents } from "@/lib/crm/listing-queries";
import { prisma } from "@/lib/db";
import type { ClosingTeamOptions } from "@/types/crm-listing";

async function loadClosingTeamOptions(): Promise<ClosingTeamOptions> {
  const members = await prisma.closingTeamMember.findMany({
    orderBy: { name: "asc" },
    select: { id: true, name: true, company: true, role: true },
  });

  return {
    escrowOfficers: members
      .filter((m) => m.role === ClosingTeamRole.ESCROW_OFFICER)
      .map(({ id, name, company }) => ({ id, name, company })),
    transactionCoordinators: members
      .filter((m) => m.role === ClosingTeamRole.TRANSACTION_COORDINATOR)
      .map(({ id, name, company }) => ({ id, name, company })),
  };
}

export default async function NewListingPage() {
  const session = await auth();
  const user = getSessionUser(session);
  const closingTeam = await loadClosingTeamOptions();
  const agents = user && isAdmin(user.role) ? await getActiveAgents() : [];

  return (
    <>
      <CrmPageHeader
        title="Add listing"
        description="Create a new property listing. Listing slug and offer form URL are generated automatically."
      />
      <AddListingForm
        closingTeam={closingTeam}
        agents={agents}
        showAgentAssignment={Boolean(user && isAdmin(user.role))}
      />
    </>
  );
}
