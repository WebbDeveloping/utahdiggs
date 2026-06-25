import { ClosingTeamRole } from "@/generated/prisma/client";
import AddListingForm from "@/components/crm/AddListingForm";
import CrmPageHeader from "@/components/crm/CrmPageHeader";
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
  const closingTeam = await loadClosingTeamOptions();

  return (
    <>
      <CrmPageHeader
        title="Add listing"
        description="Create a new property listing. Portal slug, seller PIN, and offer form URL are generated automatically."
      />
      <AddListingForm closingTeam={closingTeam} />
    </>
  );
}
