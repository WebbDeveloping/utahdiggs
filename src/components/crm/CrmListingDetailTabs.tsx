"use client";

import { useState } from "react";
import Box from "@mui/material/Box";
import Tab from "@mui/material/Tab";
import Tabs from "@mui/material/Tabs";
import CrmMlsIntakePrintView from "./CrmMlsIntakePrintView";
import CrmMlsIntakeView from "./CrmMlsIntakeView";
import type { MlsInputStep } from "@/lib/mls-input/schema";

type CrmListingDetailTabsProps = {
  steps: MlsInputStep[];
  intakeData: Record<string, unknown>;
  listing: {
    address: string;
    city: string;
    state: string;
    zip: string;
  };
  summary: React.ReactNode;
};

export default function CrmListingDetailTabs({
  steps,
  intakeData,
  listing,
  summary,
}: CrmListingDetailTabsProps) {
  const [tab, setTab] = useState(0);
  const hasIntake = Object.keys(intakeData).length > 0;

  return (
    <Box>
      <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ mb: 3 }}>
        <Tab label="Summary" />
        {hasIntake ? <Tab label="MLS Intake" /> : null}
        {hasIntake ? <Tab label="Print / Export" /> : null}
      </Tabs>

      {tab === 0 ? summary : null}
      {hasIntake && tab === 1 ? (
        <CrmMlsIntakeView steps={steps} data={intakeData} />
      ) : null}
      {hasIntake && tab === 2 ? (
        <CrmMlsIntakePrintView steps={steps} data={intakeData} listing={listing} />
      ) : null}
    </Box>
  );
}
