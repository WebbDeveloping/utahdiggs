import { prisma } from "@/lib/db";

export type CrmShowingRow = {
  id: string;
  showingDate: Date;
  showingTime: string | null;
  showingLabel: string | null;
  buyersAgent: string | null;
  feedback: string | null;
};

export async function getCrmShowings(listingId: string): Promise<CrmShowingRow[]> {
  return prisma.showing.findMany({
    where: { listingId },
    orderBy: [{ showingDate: "desc" }, { createdAt: "desc" }],
    select: {
      id: true,
      showingDate: true,
      showingTime: true,
      showingLabel: true,
      buyersAgent: true,
      feedback: true,
    },
  });
}
