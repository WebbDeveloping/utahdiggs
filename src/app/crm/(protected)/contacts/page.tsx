import Link from "next/link";
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
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import CrmPageHeader from "@/components/crm/CrmPageHeader";
import LinkButton from "@/components/ui/LinkButton";
import { auth } from "@/lib/auth/admin-auth";
import { requireCrmUser } from "@/lib/crm/access";
import { getCrmContacts } from "@/lib/crm/contact-queries";
import {
  CONTACT_ROLES,
  formatContactRole,
  isPrimaryContactRole,
} from "@/lib/crm/contact-roles";
import type { CrmContactRow } from "@/types/crm-contact";

type CrmContactsPageProps = {
  searchParams: Promise<{ q?: string }>;
};

const inputSx = {
  "& .MuiOutlinedInput-root": {
    borderRadius: 2,
    backgroundColor: "background.default",
  },
};

function ContactListingsCell({ contact }: { contact: CrmContactRow }) {
  const listings = contact.listings;
  const visible = listings.slice(0, 2);
  const remaining = listings.length - visible.length;

  if (listings.length === 0) {
    return (
      <Typography variant="body2" color="text.secondary">
        —
      </Typography>
    );
  }

  return (
    <Stack spacing={0.5}>
      <Typography variant="body2" color="text.secondary">
        {listings.length} listing{listings.length === 1 ? "" : "s"}
      </Typography>
      {visible.map(({ listing }) => (
        <Link
          key={listing.id}
          href={`/crm/listings/${listing.id}`}
          style={{ textDecoration: "none", color: "inherit" }}
        >
          <Typography variant="body2" sx={{ fontWeight: 600 }}>
            {listing.address}
          </Typography>
        </Link>
      ))}
      {remaining > 0 ? (
        <Typography variant="body2" color="text.secondary">
          +{remaining} more
        </Typography>
      ) : null}
    </Stack>
  );
}

function ContactRoleCell({ contact }: { contact: CrmContactRow }) {
  const isPrimary = contact.listings.some((link) =>
    isPrimaryContactRole(link.role),
  );

  return (
    <Chip
      label={isPrimary ? formatContactRole(CONTACT_ROLES.PRIMARY) : formatContactRole(CONTACT_ROLES.CO_SELLER)}
      size="small"
      variant="outlined"
      color={isPrimary ? "primary" : "default"}
    />
  );
}

function ContactPortalCell({ contact }: { contact: CrmContactRow }) {
  const portalSlug = contact.listings[0]?.listing.portalSlug;

  if (!portalSlug) {
    return (
      <Typography variant="body2" color="text.secondary">
        —
      </Typography>
    );
  }

  return (
    <Typography variant="body2" color="text.secondary">
      {portalSlug}
    </Typography>
  );
}

export default async function CrmContactsPage({ searchParams }: CrmContactsPageProps) {
  const { q } = await searchParams;
  const session = await auth();
  const user = requireCrmUser(session);
  const contacts = await getCrmContacts(user, { q });
  const searchQuery = q?.trim() ?? "";

  return (
    <>
      <CrmPageHeader
        title="Contacts"
        description="Portal sellers linked to listings — primary sellers and co-sellers."
      />

      <Paper
        component="form"
        method="get"
        elevation={0}
        sx={{
          p: 2,
          mb: 3,
          border: "1px solid",
          borderColor: "divider",
        }}
      >
        <Stack
          direction={{ xs: "column", sm: "row" }}
          spacing={1.5}
          sx={{ alignItems: { sm: "center" } }}
        >
          <TextField
            name="q"
            label="Search contacts"
            placeholder="Name, email, or phone"
            defaultValue={searchQuery}
            size="small"
            fullWidth
            sx={inputSx}
          />
          <Button type="submit" variant="contained" sx={{ flexShrink: 0 }}>
            Search
          </Button>
          {searchQuery ? (
            <LinkButton href="/crm/contacts" variant="outlined" sx={{ flexShrink: 0 }}>
              Clear
            </LinkButton>
          ) : null}
        </Stack>
      </Paper>

      <TableContainer
        component={Paper}
        elevation={0}
        sx={{ border: "1px solid", borderColor: "divider" }}
      >
        <Table size="medium">
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Phone</TableCell>
              <TableCell>Listings</TableCell>
              <TableCell>Role</TableCell>
              <TableCell>Portal</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {contacts.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6}>
                  <Typography color="text.secondary" sx={{ py: 3, textAlign: "center" }}>
                    {searchQuery
                      ? "No contacts match your search. Try a different name, email, or phone."
                      : "No contacts found. Add a listing with seller details or run npm run db:seed for test data."}
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              contacts.map((contact) => (
                <TableRow key={contact.id} hover>
                  <TableCell>
                    <Typography sx={{ fontWeight: 600 }}>{contact.name}</Typography>
                  </TableCell>
                  <TableCell>
                    <Link href={`mailto:${contact.email}`} style={{ color: "inherit" }}>
                      {contact.email}
                    </Link>
                  </TableCell>
                  <TableCell>{contact.phone || "—"}</TableCell>
                  <TableCell>
                    <ContactListingsCell contact={contact} />
                  </TableCell>
                  <TableCell>
                    <ContactRoleCell contact={contact} />
                  </TableCell>
                  <TableCell>
                    <ContactPortalCell contact={contact} />
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </>
  );
}
