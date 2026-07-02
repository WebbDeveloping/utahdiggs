import type { Metadata } from "next";
import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Chip from "@mui/material/Chip";
import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Typography from "@mui/material/Typography";
import AddIcon from "@mui/icons-material/Add";
import Link from "next/link";
import ListingThumbnail from "@/components/account/ListingThumbnail";
import MlsDraftDeleteButton from "@/components/account/MlsDraftDeleteButton";
import { getConsumerSession } from "@/lib/auth/consumer-session";
import { getCustomerListings } from "@/lib/consumer/listings-query";
import {
  consumerListingStatusColor,
  formatConsumerListingStatus,
  formatListingProgressLabel,
  getListingResumePath,
  isMlsDraft,
  isOnboardingListing,
} from "@/lib/consumer/mls-draft";
import { formatCurrency } from "@/lib/crm/format";
import { buildListingDocumentsPath } from "@/lib/consumer/listing-documents-path";
import { LISTING_INTAKE_PATH } from "@/lib/consumer/listing-prefill";

export const metadata: Metadata = {
  title: "My listings — Glide RE",
};

type AccountListingsPageProps = {
  searchParams: Promise<{ submitted?: string }>;
};

export default async function AccountListingsPage({
  searchParams,
}: AccountListingsPageProps) {
  const user = await getConsumerSession();
  if (!user) return null;

  const { submitted } = await searchParams;
  const listings = await getCustomerListings(user.id);

  return (
    <Stack spacing={4}>
      <Stack
        direction={{ xs: "column", sm: "row" }}
        spacing={2}
        sx={{ justifyContent: "space-between", alignItems: { sm: "center" } }}
      >
        <Box>
          <Typography variant="h1" sx={{ fontSize: { xs: "2rem", md: "2.5rem" }, mb: 1 }}>
            My listings
          </Typography>
          <Typography color="text.secondary">
            Track onboarding progress, view your listing dashboard, and manage documents.
          </Typography>
        </Box>
        <Link href={LISTING_INTAKE_PATH} style={{ textDecoration: "none" }}>
          <Button variant="contained" startIcon={<AddIcon />}>
            Add listing
          </Button>
        </Link>
      </Stack>

      {submitted ? (
        <Alert severity="success">
          Your MLS intake was submitted successfully. Our team will review it before it goes
          live. Reference: <strong>{submitted}</strong>
        </Alert>
      ) : null}

      <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: 2 }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Property</TableCell>
              <TableCell align="right">List price</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Updated</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {listings.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5}>
                  <Stack spacing={2} sx={{ py: 4, alignItems: "center" }}>
                    <Typography color="text.secondary">
                      You haven&apos;t started any listings yet.
                    </Typography>
                    <Link href={LISTING_INTAKE_PATH} style={{ textDecoration: "none" }}>
                      <Button variant="contained" startIcon={<AddIcon />}>
                        List your home
                      </Button>
                    </Link>
                  </Stack>
                </TableCell>
              </TableRow>
            ) : (
              listings.map((listing) => {
                const inProgress = isMlsDraft(listing) || isOnboardingListing(listing);
                const progressLabel = formatListingProgressLabel(listing);

                return (
                  <TableRow key={listing.id} hover>
                    <TableCell>
                      <Stack direction="row" spacing={2} sx={{ alignItems: "center" }}>
                        <ListingThumbnail
                          photoUrl={listing.primaryPhotoUrl}
                          alt={listing.address}
                          width={72}
                          height={54}
                        />
                        <Box>
                          <Typography sx={{ fontWeight: 600 }}>{listing.address}</Typography>
                          <Typography variant="body2" color="text.secondary">
                            {listing.city}, {listing.state}
                          </Typography>
                          {progressLabel ? (
                            <Typography variant="caption" color="text.secondary">
                              {progressLabel}
                            </Typography>
                          ) : null}
                        </Box>
                      </Stack>
                    </TableCell>
                    <TableCell align="right">{formatCurrency(listing.listPrice)}</TableCell>
                    <TableCell>
                      <Chip
                        label={formatConsumerListingStatus(listing)}
                        color={consumerListingStatusColor(listing)}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" color="text.secondary">
                        {(listing.submittedAt ??
                          listing.intakeUpdatedAt ??
                          listing.createdAt
                        ).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      {inProgress ? (
                        <Stack direction="row" spacing={1} sx={{ justifyContent: "flex-end" }}>
                          <Link
                            href={getListingResumePath(listing)}
                            style={{ textDecoration: "none" }}
                          >
                            <Button size="small" variant="outlined">
                              Continue
                            </Button>
                          </Link>
                          <Link
                            href={buildListingDocumentsPath(listing.id)}
                            style={{ textDecoration: "none" }}
                          >
                            <Button size="small" variant="text">
                              Documents
                            </Button>
                          </Link>
                          {isMlsDraft(listing) ? (
                            <MlsDraftDeleteButton listingId={listing.id} label="Discard" />
                          ) : null}
                        </Stack>
                      ) : (
                        <Link
                          href={`/account/listings/${listing.id}`}
                          style={{ textDecoration: "none" }}
                        >
                          <Button size="small" variant="outlined">
                            View
                          </Button>
                        </Link>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Stack>
  );
}
