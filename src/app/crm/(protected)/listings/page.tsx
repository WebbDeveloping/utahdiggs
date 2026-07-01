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
import CrmApproveListingButton from "@/components/crm/CrmApproveListingButton";
import CrmPageHeader from "@/components/crm/CrmPageHeader";
import { ListingStatus, IntakeStatus } from "@/generated/prisma/client";
import { auth } from "@/lib/auth/admin-auth";
import { isAdmin } from "@/lib/auth/roles";
import { canApproveListing, requireCrmUser } from "@/lib/crm/access";
import {
  formatCurrency,
  formatListingStatus,
  listingStatusColor,
} from "@/lib/crm/format";
import { formatOnboardingStatus } from "@/lib/consumer/onboarding";
import { getCrmListings, getPendingApprovalListingCount } from "@/lib/crm/listing-queries";

type CrmListingsPageProps = {
  searchParams: Promise<{ created?: string; pin?: string }>;
};

export default async function CrmListingsPage({ searchParams }: CrmListingsPageProps) {
  const { created, pin } = await searchParams;
  const session = await auth();
  const user = requireCrmUser(session);

  const listings = await getCrmListings(user);
  const pendingApprovalCount = await getPendingApprovalListingCount(user);
  const showAssignedColumn = isAdmin(user.role);

  const sortedListings = [...listings].sort((a, b) => {
    if (a.status === ListingStatus.SUBMITTED && b.status !== ListingStatus.SUBMITTED) {
      return -1;
    }
    if (b.status === ListingStatus.SUBMITTED && a.status !== ListingStatus.SUBMITTED) {
      return 1;
    }
    return 0;
  });

  const portalUrl = process.env.NEXT_PUBLIC_PORTAL_URL?.replace(/\/$/, "");

  return (
    <>
      <CrmPageHeader
        title="Listings"
        description="All properties in the CRM."
        action={
          <Link href="/crm/listings/new">
            <Button variant="contained" startIcon={<AddIcon />}>
              Add listing
            </Button>
          </Link>
        }
      />

      {pendingApprovalCount > 0 ? (
        <Alert severity="info" sx={{ mb: 3 }}>
          {pendingApprovalCount} consumer submission{pendingApprovalCount === 1 ? "" : "s"}{" "}
          awaiting review.
        </Alert>
      ) : null}

      {created ? (
        <Alert severity="success" sx={{ mb: 3 }}>
          <Stack spacing={0.5}>
            <Typography>
              Listing created successfully. Portal slug:{" "}
              <strong>{created}</strong>
              {pin ? (
                <>
                  {" "}
                  · Seller PIN: <strong>{pin}</strong>
                </>
              ) : null}
            </Typography>
            {portalUrl ? (
              <Typography variant="body2">
                Portal URL: {portalUrl}/{created}
              </Typography>
            ) : null}
          </Stack>
        </Alert>
      ) : null}

      <TableContainer
        component={Paper}
        elevation={0}
        sx={{ border: "1px solid", borderColor: "divider" }}
      >
        <Table size="medium">
          <TableHead>
            <TableRow>
              <TableCell sx={{ width: 80, pl: 2 }} />
              <TableCell>Address</TableCell>
              <TableCell>City</TableCell>
              <TableCell align="right">List price</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Onboarding</TableCell>
              <TableCell>Source</TableCell>
              {showAssignedColumn ? <TableCell>Assigned agent</TableCell> : null}
              <TableCell>Portal slug</TableCell>
              <TableCell align="right">Offers</TableCell>
              <TableCell align="right">Requests</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {sortedListings.length === 0 ? (
              <TableRow>
                <TableCell colSpan={showAssignedColumn ? 12 : 11}>
                  <Typography color="text.secondary" sx={{ py: 3, textAlign: "center" }}>
                    No listings found. Run <code>npm run db:seed</code> to load test data, or
                    add a listing above.
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              sortedListings.map((listing) => {
                const isDraftIntake =
                  listing.listingIntake?.status === IntakeStatus.DRAFT;
                const showApprove =
                  canApproveListing(user, listing) && !isDraftIntake;

                return (
                <TableRow key={listing.id} hover>
                  <TableCell sx={{ pl: 2 }}>
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
                            display: "block",
                          }}
                        />
                      ) : null}
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Link href={`/crm/listings/${listing.id}`} style={{ textDecoration: "none", color: "inherit" }}>
                      <Typography sx={{ fontWeight: 600 }}>{listing.address}</Typography>
                    </Link>
                    {listing.mlsNumber ? (
                      <Typography variant="body2" color="text.secondary">
                        MLS {listing.mlsNumber}
                      </Typography>
                    ) : null}
                    {isDraftIntake ? (
                      <Typography variant="body2" color="text.secondary">
                        MLS form in progress
                      </Typography>
                    ) : null}
                  </TableCell>
                  <TableCell>
                    {listing.city}, {listing.state}
                  </TableCell>
                  <TableCell align="right">
                    {formatCurrency(listing.listPrice?.toString())}
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={formatListingStatus(listing.status)}
                      color={listingStatusColor(listing.status)}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    {listing.submittedAt ? (
                      <Typography variant="body2" color="text.secondary">
                        Complete
                      </Typography>
                    ) : (
                      <Typography variant="body2" color="text.secondary">
                        {formatOnboardingStatus(listing.onboardingStatus)}
                      </Typography>
                    )}
                  </TableCell>
                  <TableCell>
                    {listing.customerId ? (
                      <Chip label="Consumer" size="small" variant="outlined" color="info" />
                    ) : (
                      <Typography variant="body2" color="text.secondary">
                        CRM
                      </Typography>
                    )}
                  </TableCell>
                  {showAssignedColumn ? (
                    <TableCell>
                      <Typography variant="body2" color="text.secondary">
                        {listing.assignedAgent?.name ??
                          listing.assignedAgent?.email ??
                          "Unassigned"}
                      </Typography>
                    </TableCell>
                  ) : null}
                  <TableCell>
                    <Typography variant="body2" color="text.secondary">
                      {listing.portalSlug}
                    </Typography>
                  </TableCell>
                  <TableCell align="right">{listing._count.offers}</TableCell>
                  <TableCell align="right">{listing._count.sellerRequests}</TableCell>
                  <TableCell align="right">
                    {showApprove ? (
                      <CrmApproveListingButton
                        listingId={listing.id}
                        address={listing.address}
                        portalSlug={listing.portalSlug}
                      />
                    ) : null}
                  </TableCell>
                </TableRow>
              );
              })
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </>
  );
}
