import type { Metadata } from "next";
import Box from "@mui/material/Box";
import CrmLoginForm from "@/components/crm/CrmLoginForm";

export const metadata: Metadata = {
  title: "Sign in — CRM",
};

export default function CrmLoginPage() {
  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        px: 2,
        py: 4,
        bgcolor: "background.default",
      }}
    >
      <CrmLoginForm />
    </Box>
  );
}
