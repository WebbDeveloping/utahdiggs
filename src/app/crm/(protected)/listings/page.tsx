import Alert from "@mui/material/Alert";
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
import { prisma } from "@/lib/db";
import {
  formatCurrency,
  formatListingStatus,
  listingStatusColor,
} from "@/lib/crm/format";

type CrmListingsPageProps = {
  searchParams: Promise<{ created?: string; pin?: string }>;
};

export default async function CrmListingsPage({ searchParams }: CrmListingsPageProps) {
  const { created, pin } = await searchParams;

  const listings = await prisma.listing.findMany({
    orderBy: [{ status: "asc" }, { updatedAt: "desc" }],
    select: {
      id: true,
      address: true,
      city: true,
      state: true,
      listPrice: true,
      status: true,
      portalSlug: true,
      mlsNumber: true,
      listDate: true,
      customerId: true,
      listingIntake: { select: { status: true } },
      _count: {
        select: {
          offers: true,
          sellerRequests: true,
        },
      },
    },
  });

  const submittedCount = listings.filter(
    (listing) => listing.status === ListingStatus.SUBMITTED,
  ).length;

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

      {submittedCount > 0 ? (
        <Alert severity="info" sx={{ mb: 3 }}>
          {submittedCount} consumer submission{submittedCount === 1 ? "" : "s"} awaiting
          review.
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
              <TableCell>Address</TableCell>
              <TableCell>City</TableCell>
              <TableCell align="right">List price</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Source</TableCell>
              <TableCell>Portal slug</TableCell>
              <TableCell align="right">Offers</TableCell>
              <TableCell align="right">Requests</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {sortedListings.length === 0 ? (
              <TableRow>
                <TableCell colSpan={9}>
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
                const canApprove =
                  listing.status === ListingStatus.SUBMITTED && !isDraftIntake;

                return (
                <TableRow key={listing.id} hover>
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
                    {listing.customerId ? (
                      <Chip label="Consumer" size="small" variant="outlined" color="info" />
                    ) : (
                      <Typography variant="body2" color="text.secondary">
                        CRM
                      </Typography>
                    )}
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" color="text.secondary">
                      {listing.portalSlug}
                    </Typography>
                  </TableCell>
                  <TableCell align="right">{listing._count.offers}</TableCell>
                  <TableCell align="right">{listing._count.sellerRequests}</TableCell>
                  <TableCell align="right">
                    {canApprove ? (
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
