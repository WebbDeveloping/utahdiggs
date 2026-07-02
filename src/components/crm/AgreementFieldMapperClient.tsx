"use client";

import dynamic from "next/dynamic";
import Typography from "@mui/material/Typography";

type TemplateSummary = {
  slug: string;
  version: string;
  displayName: string;
  revisionLabel: string;
};

type AgreementFieldMapperClientProps = {
  templates: TemplateSummary[];
  initialSlug: string;
  initialVersion: string;
};

const AgreementFieldMapper = dynamic(() => import("@/components/crm/AgreementFieldMapper"), {
  ssr: false,
  loading: () => <Typography color="text.secondary">Loading field mapper…</Typography>,
});

export default function AgreementFieldMapperClient(props: AgreementFieldMapperClientProps) {
  return <AgreementFieldMapper {...props} />;
}
