import Chip from "@mui/material/Chip";
import Grid from "@mui/material/Grid";
import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Typography from "@mui/material/Typography";
import Link from "next/link";
import { notFound } from "next/navigation";
import CrmPageHeader from "@/components/crm/CrmPageHeader";
import { CrmPlaceholderPanel } from "@/components/crm/CrmStatCard";
import DeleteContactButton from "@/components/crm/DeleteContactButton";
import LinkButton from "@/components/ui/LinkButton";
import { auth } from "@/lib/auth/admin-auth";
import { isAdmin } from "@/lib/auth/roles";
import { requireCrmUser } from "@/lib/crm/access";
import { getCrmContactById } from "@/lib/crm/contact-queries";
import { formatContactRole } from "@/lib/crm/contact-roles";
import {
  formatCurrency,
  formatListingStatus,
  formatScheduledCallAt,
  formatSellerRequestStatus,
  listingStatusColor,
} from "@/lib/crm/format";
import { formatAccountDate } from "@/lib/consumer/format-date";
import {
  formatOnboardingStatus,
  formatServicePlan,
} from "@/lib/consumer/onboarding";

type CrmContactDetailPageProps = {
  params: Promise<{ id: string }>;
};

export default async function CrmContactDetailPage({
  params,
}: CrmContactDetailPageProps) {
  const { id } = await params;
  const session = await auth();
  const user = requireCrmUser(session);
  const contact = await getCrmContactById(user, id);

  if (!contact) {
    notFound();
  }

  const headerDescription = [contact.email, contact.phone || null]
    .filter(Boolean)
    .join(" · ");

  return (
    <>
      <CrmPageHeader
        title={contact.name}
        description={headerDescription}
        action={
          <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
            <LinkButton href="/crm/contacts" variant="outlined" size="small">
              Back to contacts
            </LinkButton>
            {isAdmin(user.role) ? (
              <DeleteContactButton
                contactId={contact.id}
                contactName={contact.name}
                contactEmail={contact.email}
              />
            ) : null}
          </Stack>
        }
      />

      <Stack spacing={3}>
        <Paper elevation={0} sx={{ p: 2.5, border: "1px solid", borderColor: "divider" }}>
          <Stack spacing={2}>
            <Stack direction="row" spacing={1} sx={{ alignItems: "center", flexWrap: "wrap" }}>
              {contact.customer ? (
                <Chip label="Seller portal account" size="small" color="info" variant="outlined" />
              ) : (
                <Chip label="No portal account" size="small" variant="outlined" />
              )}
              <Chip
                label={`${contact.listings.length} listing${contact.listings.length === 1 ? "" : "s"}`}
                size="small"
                variant="outlined"
              />
            </Stack>

            <Grid container spacing={2}>
              <Grid size={{ xs: 12, sm: 6 }}>
                <Typography variant="caption" color="text.secondary">
                  Name
                </Typography>
                <Typography>{contact.name}</Typography>
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <Typography variant="caption" color="text.secondary">
                  Email
                </Typography>
                <Typography>
                  <Link href={`mailto:${contact.email}`} style={{ color: "inherit" }}>
                    {contact.email}
                  </Link>
                </Typography>
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <Typography variant="caption" color="text.secondary">
                  Phone
                </Typography>
                <Typography>{contact.phone || "—"}</Typography>
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <Typography variant="caption" color="text.secondary">
                  Created
                </Typography>
                <Typography>{formatAccountDate(contact.createdAt)}</Typography>
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <Typography variant="caption" color="text.secondary">
                  Last updated
                </Typography>
                <Typography>{formatAccountDate(contact.updatedAt)}</Typography>
              </Grid>
              {contact.customer ? (
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Typography variant="caption" color="text.secondary">
                    Portal profile
                  </Typography>
                  <Typography>
                    {[contact.customer.name, contact.customer.phone]
                      .filter(Boolean)
                      .join(" · ") || "Account exists (no extra profile details)"}
                  </Typography>
                </Grid>
              ) : null}
            </Grid>
          </Stack>
        </Paper>

        <Paper elevation={0} sx={{ p: 2.5, border: "1px solid", borderColor: "divider" }}>
          <Typography variant="h6" sx={{ mb: 0.5 }}>
            Listing activity
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Totals across this contact&apos;s linked listings.
          </Typography>
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, sm: 4 }}>
              <Typography variant="caption" color="text.secondary">
                Showings
              </Typography>
              <Typography variant="h5">{contact.activityTotals.showings}</Typography>
            </Grid>
            <Grid size={{ xs: 12, sm: 4 }}>
              <Typography variant="caption" color="text.secondary">
                Offers
              </Typography>
              <Typography variant="h5">{contact.activityTotals.offers}</Typography>
            </Grid>
            <Grid size={{ xs: 12, sm: 4 }}>
              <Typography variant="caption" color="text.secondary">
                Open requests
              </Typography>
              <Typography variant="h5">{contact.activityTotals.openRequests}</Typography>
            </Grid>
          </Grid>
        </Paper>

        <Paper elevation={0} sx={{ p: 2.5, border: "1px solid", borderColor: "divider" }}>
          <Typography variant="h6" sx={{ mb: 2 }}>
            Listings
          </Typography>
          {contact.listings.length === 0 ? (
            <Typography color="text.secondary">No linked listings.</Typography>
          ) : (
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Property</TableCell>
                    <TableCell>Role</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Price</TableCell>
                    <TableCell>Agent</TableCell>
                    <TableCell>Onboarding</TableCell>
                    <TableCell>Agreement</TableCell>
                    <TableCell>Call</TableCell>
                    <TableCell align="right">Activity</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {contact.listings.map(({ role, listing }) => (
                    <TableRow key={listing.id} hover>
                      <TableCell>
                        <Link
                          href={`/crm/listings/${listing.id}`}
                          style={{ textDecoration: "none", color: "inherit" }}
                        >
                          <Typography variant="body2" sx={{ fontWeight: 600 }}>
                            {listing.address}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {listing.city}, {listing.state} {listing.zip}
                          </Typography>
                        </Link>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={formatContactRole(role)}
                          size="small"
                          variant="outlined"
                          color={role === "PRIMARY" ? "primary" : "default"}
                        />
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={formatListingStatus(listing.status)}
                          size="small"
                          color={listingStatusColor(listing.status)}
                        />
                      </TableCell>
                      <TableCell>{formatCurrency(listing.listPrice)}</TableCell>
                      <TableCell>
                        {listing.assignedAgent?.name ??
                          listing.assignedAgent?.email ??
                          "—"}
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {formatOnboardingStatus(listing.onboardingStatus)}
                        </Typography>
                        {listing.servicePlan ? (
                          <Typography variant="caption" color="text.secondary">
                            {formatServicePlan(listing.servicePlan)}
                          </Typography>
                        ) : null}
                      </TableCell>
                      <TableCell>
                        {listing.agreementSignedAt
                          ? formatAccountDate(listing.agreementSignedAt)
                          : "—"}
                      </TableCell>
                      <TableCell>
                        {formatScheduledCallAt(listing.scheduledCallAt)}
                      </TableCell>
                      <TableCell align="right">
                        <Typography variant="body2" color="text.secondary">
                          {listing.showingCount} show · {listing.offerCount} offer ·{" "}
                          {listing.openRequestCount} req
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </Paper>

        <Paper elevation={0} sx={{ p: 2.5, border: "1px solid", borderColor: "divider" }}>
          <Typography variant="h6" sx={{ mb: 2 }}>
            Seller requests
          </Typography>
          {contact.requests.length === 0 ? (
            <Typography color="text.secondary">No seller requests found.</Typography>
          ) : (
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Submitted</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Property</TableCell>
                    <TableCell>Summary</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {contact.requests.map((request) => (
                    <TableRow key={request.id} hover>
                      <TableCell>{formatAccountDate(request.submittedAt)}</TableCell>
                      <TableCell>
                        {formatSellerRequestStatus(request.status)}
                      </TableCell>
                      <TableCell>
                        <Link
                          href={`/crm/listings/${request.listingId}`}
                          style={{ color: "inherit" }}
                        >
                          {request.propertyAddress}
                        </Link>
                      </TableCell>
                      <TableCell>
                        {request.requestSummary || request.message || "—"}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </Paper>

        <Paper elevation={0} sx={{ p: 2.5, border: "1px solid", borderColor: "divider" }}>
          <Typography variant="h6" sx={{ mb: 2 }}>
            Agreements
          </Typography>
          {contact.agreements.length === 0 ? (
            <Typography color="text.secondary">No signed agreements found.</Typography>
          ) : (
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Signed</TableCell>
                    <TableCell>Signer</TableCell>
                    <TableCell>Listing</TableCell>
                    <TableCell>Version</TableCell>
                    <TableCell>Document</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {contact.agreements.map((agreement) => (
                    <TableRow key={agreement.id} hover>
                      <TableCell>{formatAccountDate(agreement.signedAt)}</TableCell>
                      <TableCell>
                        <Typography variant="body2">{agreement.signerName}</Typography>
                        <Typography variant="caption" color="text.secondary">
                          {agreement.signerEmail}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Link
                          href={`/crm/listings/${agreement.listingId}`}
                          style={{ color: "inherit" }}
                        >
                          {agreement.listingAddress}
                        </Link>
                      </TableCell>
                      <TableCell>{agreement.agreementVersion}</TableCell>
                      <TableCell>
                        {agreement.signedDocumentUrl ? (
                          <Link
                            href={agreement.signedDocumentUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            View PDF
                          </Link>
                        ) : (
                          "—"
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </Paper>

        <Stack spacing={2}>
          <Typography variant="h6">More contact tools</Typography>
          <Typography variant="body2" color="text.secondary">
            These sections are not implemented yet and will be available soon.
          </Typography>
          <CrmPlaceholderPanel
            title="Email history — coming soon"
            description="Sent emails to this contact will appear here soon."
          />
          <CrmPlaceholderPanel
            title="Contact notes — coming soon"
            description="Agent notes and call logs for this person are coming soon."
          />
          <CrmPlaceholderPanel
            title="Tasks and follow-ups — coming soon"
            description="Assignments and reminders for this contact are coming soon."
          />
          <CrmPlaceholderPanel
            title="Preferences and tags — coming soon"
            description="Preferred contact method, tags, and lead source are coming soon."
          />
        </Stack>
      </Stack>
    </>
  );
}
