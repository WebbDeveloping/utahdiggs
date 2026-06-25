import type { Metadata } from "next";
import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Chip from "@mui/material/Chip";
import Container from "@mui/material/Container";
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
import SitePageLayout from "@/components/layout/SitePageLayout";
import MlsDraftDeleteButton from "@/components/account/MlsDraftDeleteButton";
import { getConsumerSession } from "@/lib/auth/consumer-session";
import { getCustomerListings } from "@/lib/consumer/listings-query";
import {
  consumerListingStatusColor,
  formatConsumerListingStatus,
  formatMlsDraftProgress,
  getMlsDraftResumePath,
  isMlsDraft,
} from "@/lib/consumer/mls-draft";
import { formatCurrency } from "@/lib/crm/format";

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
  if (!user) {
    return null;
  }

  const { submitted } = await searchParams;
  const listings = await getCustomerListings(user.id);

  return (
    <SitePageLayout user={user}>
      <Container maxWidth="lg" sx={{ py: { xs: 4, md: 6 } }}>
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
                Track your property submissions and their review status.
              </Typography>
            </Box>
            <Link href="/account/listings/new" style={{ textDecoration: "none" }}>
              <Button variant="contained" startIcon={<AddIcon />}>
                Add listing
              </Button>
            </Link>
          </Stack>

          {submitted ? (
            <Alert severity="success">
              Your listing was submitted successfully. Our team will review it before
              it appears in search. Reference: <strong>{submitted}</strong>
            </Alert>
          ) : null}

          <TableContainer
            component={Paper}
            variant="outlined"
            sx={{ borderRadius: 2 }}
          >
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Property</TableCell>
                  <TableCell align="right">List price</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Submitted</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {listings.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5}>
                      <Stack spacing={2} sx={{ py: 4, alignItems: "center" }}>
                        <Typography color="text.secondary">
                          You haven&apos;t submitted any listings yet.
                        </Typography>
                        <Link href="/account/listings/new" style={{ textDecoration: "none" }}>
                          <Button variant="contained" startIcon={<AddIcon />}>
                            List your home
                          </Button>
                        </Link>
                      </Stack>
                    </TableCell>
                  </TableRow>
                ) : (
                  listings.map((listing) => (
                    <TableRow key={listing.id} hover>
                      <TableCell>
                        <Stack direction="row" spacing={2} sx={{ alignItems: "center" }}>
                          <Box
                            sx={{
                              width: 72,
                              height: 54,
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
                                sx={{
                                  width: "100%",
                                  height: "100%",
                                  objectFit: "cover",
                                }}
                              />
                            ) : null}
                          </Box>
                          <Box>
                            <Typography sx={{ fontWeight: 600 }}>
                              {listing.address}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              {listing.city}, {listing.state}
                            </Typography>
                            {isMlsDraft(listing) ? (
                              <Typography variant="caption" color="text.secondary">
                                {formatMlsDraftProgress(listing.intakeCurrentStep)}
                              </Typography>
                            ) : null}
                          </Box>
                        </Stack>
                      </TableCell>
                      <TableCell align="right">
                        {formatCurrency(listing.listPrice)}
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={formatConsumerListingStatus(listing)}
                          color={consumerListingStatusColor(listing)}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" color="text.secondary">
                          {isMlsDraft(listing)
                            ? listing.intakeUpdatedAt?.toLocaleDateString("en-US", {
                                month: "short",
                                day: "numeric",
                                year: "numeric",
                              }) ?? "—"
                            : (listing.submittedAt ?? listing.createdAt).toLocaleDateString(
                                "en-US",
                                { month: "short", day: "numeric", year: "numeric" },
                              )}
                        </Typography>
                      </TableCell>
                      <TableCell align="right">
                        {isMlsDraft(listing) ? (
                          <Stack direction="row" spacing={1} sx={{ justifyContent: "flex-end" }}>
                            <Link
                              href={getMlsDraftResumePath(listing.id)}
                              style={{ textDecoration: "none" }}
                            >
                              <Button size="small" variant="outlined">
                                Continue form
                              </Button>
                            </Link>
                            <MlsDraftDeleteButton listingId={listing.id} label="Discard" />
                          </Stack>
                        ) : null}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Stack>
      </Container>
    </SitePageLayout>
  );
}
