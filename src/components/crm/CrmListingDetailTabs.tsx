"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import Box from "@mui/material/Box";
import Tab from "@mui/material/Tab";
import Tabs from "@mui/material/Tabs";
import CrmMlsIntakePrintView from "./CrmMlsIntakePrintView";
import CrmMlsIntakeView, { type CrmMlsIntakePhoto } from "./CrmMlsIntakeView";
import type { MlsInputStep } from "@/lib/mls-input/schema";

type CrmListingTab = "summary" | "intake" | "print";

type CrmListingDetailTabsProps = {
  steps: MlsInputStep[];
  intakeData: Record<string, unknown>;
  listing: {
    address: string;
    city: string;
    state: string;
    zip: string;
  };
  photos?: CrmMlsIntakePhoto[];
  summary: React.ReactNode;
};

function tabIndexFromParam(
  tab: CrmListingTab | null,
  hasIntake: boolean,
): number {
  if (!hasIntake) return 0;
  if (tab === "intake") return 1;
  if (tab === "print") return 2;
  return 0;
}

export default function CrmListingDetailTabs({
  steps,
  intakeData,
  listing,
  photos = [],
  summary,
}: CrmListingDetailTabsProps) {
  const searchParams = useSearchParams();
  const tabParam = searchParams.get("tab") as CrmListingTab | null;
  const hasIntake = Object.keys(intakeData).length > 0;
  const initialTab = useMemo(
    () => tabIndexFromParam(tabParam, hasIntake),
    [tabParam, hasIntake],
  );
  const [tab, setTab] = useState(initialTab);

  useEffect(() => {
    setTab(initialTab);
  }, [initialTab]);

  return (
    <Box>
      <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ mb: 3 }}>
        <Tab key="summary" label="Summary" />
        {hasIntake ? <Tab key="intake" label="MLS Intake" /> : null}
        {hasIntake ? <Tab key="print" label="Print / Export" /> : null}
      </Tabs>

      {tab === 0 ? summary : null}
      {hasIntake && tab === 1 ? (
        <CrmMlsIntakeView
          steps={steps}
          data={intakeData}
          listing={listing}
          photos={photos}
        />
      ) : null}
      {hasIntake && tab === 2 ? (
        <CrmMlsIntakePrintView steps={steps} data={intakeData} listing={listing} />
      ) : null}
    </Box>
  );
}
