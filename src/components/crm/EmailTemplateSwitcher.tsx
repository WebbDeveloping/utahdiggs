"use client";

import NextLink from "next/link";
import { useRouter } from "next/navigation";
import Button from "@mui/material/Button";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import Select from "@mui/material/Select";
import Stack from "@mui/material/Stack";
import type { SelectChangeEvent } from "@mui/material/Select";
import ArrowBackOutlinedIcon from "@mui/icons-material/ArrowBackOutlined";

type TemplateOption = {
  slug: string;
  displayName: string;
};

type EmailTemplateSwitcherProps = {
  currentSlug: string;
  templates: TemplateOption[];
};

export default function EmailTemplateSwitcher({
  currentSlug,
  templates,
}: EmailTemplateSwitcherProps) {
  const router = useRouter();

  function handleChange(event: SelectChangeEvent) {
    const nextSlug = event.target.value;
    if (nextSlug && nextSlug !== currentSlug) {
      router.push(`/crm/email-templates/${nextSlug}`);
    }
  }

  return (
    <Stack
      direction={{ xs: "column", sm: "row" }}
      spacing={1.5}
      sx={{ alignItems: { sm: "center" } }}
    >
      <FormControl size="small" sx={{ minWidth: { xs: "100%", sm: 260 } }}>
        <InputLabel id="email-template-switcher-label">Template</InputLabel>
        <Select
          labelId="email-template-switcher-label"
          id="email-template-switcher"
          label="Template"
          value={currentSlug}
          onChange={handleChange}
        >
          {templates.map((template) => (
            <MenuItem key={template.slug} value={template.slug}>
              {template.displayName}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
      <Button
        component={NextLink}
        href="/crm/email-templates"
        size="small"
        variant="outlined"
        startIcon={<ArrowBackOutlinedIcon />}
      >
        All templates
      </Button>
    </Stack>
  );
}
