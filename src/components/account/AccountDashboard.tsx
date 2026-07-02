import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import MlsDraftBanner from "@/components/account/MlsDraftBanner";
import MyListingsSection from "@/components/account/MyListingsSection";
import AccountDashboardStatsCards from "@/components/account/AccountDashboardStatsCards";
import { getMlsDrafts } from "@/lib/consumer/mls-draft";
import type { AccountDashboardStats } from "@/types/consumer-account-data";
import type { CustomerListingSummary } from "@/types/consumer-listing";

type AccountDashboardProps = {
  user: {
    id: string;
    email: string;
    name?: string | null;
  };
  listings: CustomerListingSummary[];
  stats: AccountDashboardStats;
  draftSaved?: boolean;
};

export default function AccountDashboard({
  user,
  listings,
  stats,
  draftSaved = false,
}: AccountDashboardProps) {
  const displayName = user.name?.trim() || user.email;
  const mlsDrafts = getMlsDrafts(listings);

  return (
    <Stack spacing={4}>
      <Box>
        <Typography variant="h1" sx={{ fontSize: { xs: "2rem", md: "2.5rem" }, mb: 1 }}>
          Welcome back{displayName ? `, ${displayName.split(" ")[0]}` : ""}
        </Typography>
        <Typography color="text.secondary">{user.email}</Typography>
      </Box>

      {draftSaved ? (
        <Alert severity="success">
          Your MLS listing progress was saved. Use the section below to continue anytime.
        </Alert>
      ) : null}

      {mlsDrafts.length > 0 ? <MlsDraftBanner drafts={mlsDrafts} /> : null}

      <AccountDashboardStatsCards stats={stats} />

      <MyListingsSection listings={listings} />
    </Stack>
  );
}
