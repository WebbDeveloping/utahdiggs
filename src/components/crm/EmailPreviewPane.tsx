"use client";

import { useState } from "react";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import ToggleButton from "@mui/material/ToggleButton";
import ToggleButtonGroup from "@mui/material/ToggleButtonGroup";
import Typography from "@mui/material/Typography";
import ComputerOutlinedIcon from "@mui/icons-material/ComputerOutlined";
import PhoneIphoneOutlinedIcon from "@mui/icons-material/PhoneIphoneOutlined";
import SendOutlinedIcon from "@mui/icons-material/SendOutlined";

type DeviceMode = "desktop" | "mobile";

type EmailPreviewPaneProps = {
  previewHtml: string | null;
  previewSubject: string | null;
  previewLoading: boolean;
  adminEmail: string;
  onSendTest: (to: string) => Promise<void>;
  testSending: boolean;
};

const PREVIEW_WIDTHS: Record<DeviceMode, number> = {
  desktop: 600,
  mobile: 375,
};

export default function EmailPreviewPane({
  previewHtml,
  previewSubject,
  previewLoading,
  adminEmail,
  onSendTest,
  testSending,
}: EmailPreviewPaneProps) {
  const [deviceMode, setDeviceMode] = useState<DeviceMode>("desktop");
  const [testEmail, setTestEmail] = useState(adminEmail);

  return (
    <Box sx={{ display: "flex", flexDirection: "column", minHeight: 520 }}>
      <Box
        sx={{
          px: 2,
          py: 1.25,
          borderBottom: 1,
          borderColor: "divider",
          bgcolor: "background.paper",
        }}
      >
        <Stack
          direction={{ xs: "column", sm: "row" }}
          spacing={1.5}
          sx={{
            alignItems: { xs: "stretch", sm: "center" },
            justifyContent: "space-between",
          }}
        >
          <Box sx={{ minWidth: 0 }}>
            {previewSubject ? (
              <Typography variant="body2" color="text.secondary" noWrap>
                Subject: {previewSubject}
              </Typography>
            ) : (
              <Typography variant="body2" color="text.secondary">
                {previewLoading ? "Rendering preview…" : "Preview"}
              </Typography>
            )}
          </Box>
          <ToggleButtonGroup
            size="small"
            exclusive
            value={deviceMode}
            aria-label="Preview device"
            onChange={(_event, value: DeviceMode | null) => {
              if (value) setDeviceMode(value);
            }}
          >
            <ToggleButton value="desktop" aria-label="Desktop preview">
              <ComputerOutlinedIcon fontSize="small" sx={{ mr: 0.5 }} />
              Desktop
            </ToggleButton>
            <ToggleButton value="mobile" aria-label="Mobile preview">
              <PhoneIphoneOutlinedIcon fontSize="small" sx={{ mr: 0.5 }} />
              Mobile
            </ToggleButton>
          </ToggleButtonGroup>
        </Stack>

        <Stack
          direction={{ xs: "column", sm: "row" }}
          spacing={1}
          sx={{ mt: 1.25, alignItems: { xs: "stretch", sm: "center" } }}
        >
          <TextField
            label="Test recipient"
            value={testEmail}
            onChange={(event) => setTestEmail(event.target.value)}
            size="small"
            fullWidth
            sx={{ maxWidth: { sm: 360 } }}
          />
          <Button
            variant="outlined"
            startIcon={<SendOutlinedIcon />}
            onClick={() => void onSendTest(testEmail)}
            disabled={testSending || !testEmail.trim()}
          >
            {testSending ? "Sending…" : "Send test email"}
          </Button>
        </Stack>
      </Box>

      <Box
        sx={{
          flex: 1,
          bgcolor: "grey.100",
          p: 2,
          display: "flex",
          justifyContent: "center",
          alignItems: "flex-start",
        }}
      >
        {previewHtml ? (
          <Box
            sx={{
              width: "100%",
              maxWidth: PREVIEW_WIDTHS[deviceMode],
              border: deviceMode === "mobile" ? 2 : 0,
              borderColor: deviceMode === "mobile" ? "grey.400" : "transparent",
              borderRadius: deviceMode === "mobile" ? 3 : 0,
              overflow: "hidden",
              bgcolor: "background.default",
              boxShadow: deviceMode === "mobile" ? 2 : 0,
              transition: "max-width 0.2s ease",
            }}
          >
            <Box
              component="iframe"
              title="Email preview"
              srcDoc={previewHtml}
              sx={{
                width: "100%",
                minHeight: deviceMode === "mobile" ? 640 : 520,
                border: 0,
                display: "block",
                bgcolor: "background.default",
              }}
            />
          </Box>
        ) : (
          <Box sx={{ p: 3, width: "100%" }}>
            <Typography color="text.secondary">
              {previewLoading ? "Loading preview…" : "No preview available."}
            </Typography>
          </Box>
        )}
      </Box>
    </Box>
  );
}
