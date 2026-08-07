"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import Box from "@mui/material/Box";
import Tab from "@mui/material/Tab";
import Tabs from "@mui/material/Tabs";
import CrmListingDocumentsTab from "./CrmListingDocumentsTab";
import CrmMlsIntakePrintView from "./CrmMlsIntakePrintView";
import CrmMlsIntakeView, { type CrmMlsIntakePhoto } from "./CrmMlsIntakeView";
import type { MlsInputStep } from "@/lib/mls-input/schema";

type CrmListingTab = "summary" | "intake" | "print" | "documents";

type ListingDocument = {
  id: string;
  name: string;
  url: string;
  uploadedAt: Date | string;
};

type CrmListingDetailTabsProps = {
  steps: MlsInputStep[];
  intakeData: Record<string, unknown>;
  listing: {
    id: string;
    address: string;
    city: string;
    state: string;
    zip: string;
  };
  photos?: CrmMlsIntakePhoto[];
  documents: ListingDocument[];
  summary: React.ReactNode;
};

function buildTabIds(hasIntake: boolean): CrmListingTab[] {
  const tabs: CrmListingTab[] = ["summary"];
  if (hasIntake) {
    tabs.push("intake", "print");
  }
  tabs.push("documents");
  return tabs;
}

function tabIndexFromParam(
  tab: CrmListingTab | null,
  tabIds: CrmListingTab[],
): number {
  if (!tab) return 0;
  const index = tabIds.indexOf(tab);
  return index >= 0 ? index : 0;
}

const TAB_LABELS: Record<CrmListingTab, string> = {
  summary: "Summary",
  intake: "MLS Intake",
  print: "Print / Export",
  documents: "Documents",
};

export default function CrmListingDetailTabs({
  steps,
  intakeData,
  listing,
  photos = [],
  documents,
  summary,
}: CrmListingDetailTabsProps) {
  const searchParams = useSearchParams();
  const tabParam = searchParams.get("tab") as CrmListingTab | null;
  const hasIntake = Object.keys(intakeData).length > 0;
  const tabIds = useMemo(() => buildTabIds(hasIntake), [hasIntake]);
  const initialTab = useMemo(
    () => tabIndexFromParam(tabParam, tabIds),
    [tabParam, tabIds],
  );
  const [tab, setTab] = useState(initialTab);

  useEffect(() => {
    setTab(initialTab);
  }, [initialTab]);

  const activeId = tabIds[tab] ?? "summary";

  return (
    <Box>
      <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ mb: 3 }}>
        {tabIds.map((id) => (
          <Tab key={id} label={TAB_LABELS[id]} />
        ))}
      </Tabs>

      {activeId === "summary" ? summary : null}
      {activeId === "intake" ? (
        <CrmMlsIntakeView
          steps={steps}
          data={intakeData}
          listing={listing}
          photos={photos}
        />
      ) : null}
      {activeId === "print" ? (
        <CrmMlsIntakePrintView steps={steps} data={intakeData} listing={listing} />
      ) : null}
      {activeId === "documents" ? (
        <CrmListingDocumentsTab listingId={listing.id} documents={documents} />
      ) : null}
    </Box>
  );
}
