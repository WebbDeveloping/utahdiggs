import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Chip from "@mui/material/Chip";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import AddIcon from "@mui/icons-material/Add";
import HomeWorkOutlinedIcon from "@mui/icons-material/HomeWorkOutlined";
import Link from "next/link";
import MlsDraftDeleteButton from "@/components/account/MlsDraftDeleteButton";
import { formatCurrency } from "@/lib/crm/format";
import {
  consumerListingStatusColor,
  formatConsumerListingStatus,
  formatMlsDraftProgress,
  getMlsDraftResumePath,
  isMlsDraft,
} from "@/lib/consumer/mls-draft";
import type { CustomerListingSummary } from "@/types/consumer-listing";

type MyListingsSectionProps = {
  listings: CustomerListingSummary[];
};

export default function MyListingsSection({ listings }: MyListingsSectionProps) {
  const recentListings = listings.slice(0, 3);

  return (
    <Card variant="outlined" sx={{ height: "100%" }}>
      <CardContent>
        <Stack spacing={2}>
          <Stack direction="row" spacing={1.5} sx={{ alignItems: "center" }}>
            <HomeWorkOutlinedIcon color="action" />
            <Typography variant="h6">My listings</Typography>
            {listings.length > 0 ? (
              <Chip label={listings.length} size="small" color="primary" />
            ) : null}
          </Stack>

          {listings.length === 0 ? (
            <Stack spacing={2}>
              <Typography variant="body2" color="text.secondary">
                List your home with Glide RE and track submissions here.
              </Typography>
              <Link href="/account/listings/new" style={{ textDecoration: "none", alignSelf: "flex-start" }}>
                <Button variant="contained" startIcon={<AddIcon />}>
                  List your home
                </Button>
              </Link>
            </Stack>
          ) : (
            <Stack spacing={2}>
              {recentListings.map((listing) => (
                <Stack key={listing.id} spacing={0.5}>
                  <Stack
                    direction="row"
                    spacing={2}
                    sx={{ alignItems: "center" }}
                  >
                    <Box
                      sx={{
                        width: 64,
                        height: 48,
                        borderRadius: 1,
                        overflow: "hidden",
                        flexShrink: 0,
                        backgroundColor: "action.hover",
                      }}
                    >
                      {listing.primaryPhotoUrl ? (
                        <Box
                          component="img"
                          src={listing.primaryPhotoUrl}
                          alt={listing.address}
                          sx={{ width: "100%", height: "100%", objectFit: "cover" }}
                        />
                      ) : null}
                    </Box>
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Typography variant="body2" sx={{ fontWeight: 600 }} noWrap>
                        {listing.address}
                      </Typography>
                      <Typography variant="caption" color="text.secondary" noWrap>
                        {listing.city}, {listing.state} ·{" "}
                        {formatCurrency(listing.listPrice)}
                      </Typography>
                    </Box>
                    <Chip
                      label={formatConsumerListingStatus(listing)}
                      color={consumerListingStatusColor(listing)}
                      size="small"
                    />
                  </Stack>
                  {isMlsDraft(listing) ? (
                    <Stack direction="row" spacing={1} sx={{ pl: "80px", alignItems: "center" }}>
                      <Typography variant="caption" color="text.secondary">
                        {formatMlsDraftProgress(listing.intakeCurrentStep)}
                      </Typography>
                      <Link href={getMlsDraftResumePath(listing.id)} style={{ textDecoration: "none" }}>
                        <Button size="small" variant="text" sx={{ minWidth: 0, py: 0 }}>
                          Continue
                        </Button>
                      </Link>
                      <MlsDraftDeleteButton
                        listingId={listing.id}
                        label="Discard"
                        variant="text"
                        size="small"
                      />
                    </Stack>
                  ) : null}
                </Stack>
              ))}

              <Stack direction="row" spacing={1}>
                <Link href="/account/listings" style={{ textDecoration: "none" }}>
                  <Button size="small">View all</Button>
                </Link>
                <Link href="/account/listings/new" style={{ textDecoration: "none" }}>
                  <Button size="small" startIcon={<AddIcon />}>
                    Add listing
                  </Button>
                </Link>
              </Stack>
            </Stack>
          )}
        </Stack>
      </CardContent>
    </Card>
  );
}
