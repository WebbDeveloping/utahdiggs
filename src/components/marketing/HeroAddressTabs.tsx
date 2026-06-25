"use client";

import { FormEvent, SyntheticEvent, useId, useState } from "react";
import { useRouter } from "next/navigation";
import SearchIcon from "@mui/icons-material/Search";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Link from "@mui/material/Link";
import Tab from "@mui/material/Tab";
import Tabs from "@mui/material/Tabs";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";

type TabKey = "sell" | "buy";

const tabs: { key: TabKey; label: string }[] = [
  { key: "sell", label: "Sell your home" },
  { key: "buy", label: "Buy a home" },
];

export default function HeroAddressTabs() {
  const router = useRouter();
  const baseId = useId();
  const [activeTab, setActiveTab] = useState<TabKey>("sell");
  const [sellAddress, setSellAddress] = useState("");
  const [buyAddress, setBuyAddress] = useState("");
  const [sellError, setSellError] = useState(false);
  const [buyError, setBuyError] = useState(false);

  function handleTabChange(_: SyntheticEvent, value: TabKey) {
    setActiveTab(value);
  }

  function handleSellSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmed = sellAddress.trim();
    if (!trimmed) {
      setSellError(true);
      return;
    }
    setSellError(false);
    router.push(`/sell/inquiry?address=${encodeURIComponent(trimmed)}`);
  }

  function handleBuySubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmed = buyAddress.trim();
    if (!trimmed) {
      setBuyError(true);
      return;
    }
    setBuyError(false);
    router.push(`/search?text=${encodeURIComponent(trimmed)}`);
  }

  return (
    <Box sx={{ width: "100%", maxWidth: 560 }}>
      <Tabs
        value={activeTab}
        onChange={handleTabChange}
        aria-label="Home search tabs"
        sx={{
          minHeight: 44,
          mb: 0,
          "& .MuiTabs-indicator": {
            display: "none",
          },
          "& .MuiTabs-flexContainer": {
            gap: 0.5,
          },
        }}
      >
        {tabs.map((tab) => (
          <Tab
            key={tab.key}
            value={tab.key}
            label={tab.label}
            id={`${baseId}-tab-${tab.key}`}
            aria-controls={`${baseId}-panel-${tab.key}`}
            sx={{
              minHeight: 44,
              px: 2.5,
              py: 1,
              fontSize: "0.9375rem",
              fontWeight: 600,
              textTransform: "none",
              borderRadius: "12px 12px 0 0",
              color: "text.secondary",
              "&.Mui-selected": {
                color: "primary.main",
                backgroundColor: "background.paper",
              },
            }}
          />
        ))}
      </Tabs>

      <Box
        role="tabpanel"
        id={`${baseId}-panel-sell`}
        aria-labelledby={`${baseId}-tab-sell`}
        hidden={activeTab !== "sell"}
        sx={{
          backgroundColor: "background.paper",
          borderRadius: activeTab === "sell" ? "0 16px 16px 16px" : "16px",
          boxShadow: "0 4px 24px rgba(19, 33, 28, 0.08)",
          border: "1px solid",
          borderColor: "divider",
          p: { xs: 2, sm: 2.5 },
        }}
      >
        <Box component="form" onSubmit={handleSellSubmit} noValidate>
          <Box
            sx={{
              display: "flex",
              flexDirection: { xs: "column", sm: "row" },
              gap: 1.5,
              alignItems: { xs: "stretch", sm: "flex-start" },
            }}
          >
            <TextField
              fullWidth
              name="sell-address"
              placeholder="Enter your address"
              value={sellAddress}
              onChange={(e) => {
                setSellAddress(e.target.value);
                if (sellError) setSellError(false);
              }}
              error={sellError}
              helperText={sellError ? "Please enter your address" : " "}
              autoComplete="street-address"
              slotProps={{
                formHelperText: { sx: { mx: 0, minHeight: 20 } },
              }}
              sx={{
                flex: 1,
                "& .MuiOutlinedInput-root": {
                  borderRadius: 3,
                  backgroundColor: "background.default",
                },
              }}
            />
            <Button
              type="submit"
              variant="contained"
              color="primary"
              size="large"
              sx={{
                minWidth: { xs: "100%", sm: 120 },
                height: 56,
                flexShrink: 0,
              }}
            >
              Submit
            </Button>
          </Box>
        </Box>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
          Not sure how much your home is worth?{" "}
          <Link href="#pricing" underline="hover" color="primary" sx={{ fontWeight: 600 }}>
            See our pricing
          </Link>
        </Typography>
      </Box>

      <Box
        role="tabpanel"
        id={`${baseId}-panel-buy`}
        aria-labelledby={`${baseId}-tab-buy`}
        hidden={activeTab !== "buy"}
        sx={{
          backgroundColor: "background.paper",
          borderRadius: activeTab === "buy" ? "16px 0 16px 16px" : "16px",
          boxShadow: "0 4px 24px rgba(19, 33, 28, 0.08)",
          border: "1px solid",
          borderColor: "divider",
          p: { xs: 2, sm: 2.5 },
        }}
      >
        <Box component="form" onSubmit={handleBuySubmit} noValidate>
          <Box
            sx={{
              display: "flex",
              flexDirection: { xs: "column", sm: "row" },
              gap: 1.5,
              alignItems: { xs: "stretch", sm: "flex-start" },
            }}
          >
            <TextField
              fullWidth
              name="buy-address"
              placeholder="Address, city, neighborhood, zip"
              value={buyAddress}
              onChange={(e) => {
                setBuyAddress(e.target.value);
                if (buyError) setBuyError(false);
              }}
              error={buyError}
              helperText={buyError ? "Please enter an address or location" : " "}
              autoComplete="off"
              slotProps={{
                formHelperText: { sx: { mx: 0, minHeight: 20 } },
              }}
              sx={{
                flex: 1,
                "& .MuiOutlinedInput-root": {
                  borderRadius: 3,
                  backgroundColor: "background.default",
                },
              }}
            />
            <Button
              type="submit"
              variant="contained"
              color="primary"
              aria-label="Search homes"
              sx={{
                minWidth: { xs: "100%", sm: 56 },
                width: { sm: 56 },
                height: 56,
                flexShrink: 0,
                p: 0,
              }}
            >
              <SearchIcon />
            </Button>
          </Box>
        </Box>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
          Talk to your dedicated agent about buying a home.{" "}
          <Link href="#contact" underline="hover" color="primary" sx={{ fontWeight: 600 }}>
            Get in touch
          </Link>
        </Typography>
      </Box>
    </Box>
  );
}
