import { prisma } from "@/lib/db";

export type CrmWeeklyStatRow = {
  id: string;
  weekEnding: Date;
  listtracTotal30d: number | null;
  ureViews30d: number | null;
  zillowViews30d: number | null;
  realtorViews30d: number | null;
  homesViews30d: number | null;
  truliaViews30d: number | null;
  ureFavoritesCumulative: number | null;
  lifetimeViews: number | null;
};

export async function getCrmWeeklyStats(listingId: string): Promise<CrmWeeklyStatRow[]> {
  return prisma.weeklyStat.findMany({
    where: { listingId },
    orderBy: { weekEnding: "desc" },
    select: {
      id: true,
      weekEnding: true,
      listtracTotal30d: true,
      ureViews30d: true,
      zillowViews30d: true,
      realtorViews30d: true,
      homesViews30d: true,
      truliaViews30d: true,
      ureFavoritesCumulative: true,
      lifetimeViews: true,
    },
  });
}
