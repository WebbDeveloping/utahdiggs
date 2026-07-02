"use client";

import NextLink from "next/link";
import Button from "@mui/material/Button";
import Stack from "@mui/material/Stack";
import AddIcon from "@mui/icons-material/Add";
import ListOutlinedIcon from "@mui/icons-material/ListOutlined";

type AgreementTemplatePageActionsProps = {
  showAdd?: boolean;
  showList?: boolean;
};

export default function AgreementTemplatePageActions({
  showAdd = true,
  showList = true,
}: AgreementTemplatePageActionsProps) {
  return (
    <Stack direction="row" spacing={1}>
      {showList ? (
        <Button
          component={NextLink}
          href="/crm/agreement-templates"
          variant="outlined"
          startIcon={<ListOutlinedIcon />}
        >
          All templates
        </Button>
      ) : null}
      {showAdd ? (
        <Button
          component={NextLink}
          href="/crm/agreement-templates/new"
          variant="contained"
          startIcon={<AddIcon />}
        >
          Add template
        </Button>
      ) : null}
    </Stack>
  );
}
