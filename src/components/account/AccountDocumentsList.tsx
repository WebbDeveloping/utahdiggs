import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Chip from "@mui/material/Chip";
import Link from "@mui/material/Link";
import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Typography from "@mui/material/Typography";
import NextLink from "next/link";
import { isListingAgreementDocument } from "@/lib/documents/listing-document-kinds";
import { buildListingDocumentsPath } from "@/lib/consumer/listing-documents-path";
import type { CustomerListingDocumentGroup } from "@/lib/consumer/listing-documents-query";
import { buildAccountDocumentHref } from "@/lib/storage/document-access";
import { LISTING_INTAKE_PATH } from "@/lib/consumer/listing-prefill";

type AccountDocumentsListProps = {
  listings: CustomerListingDocumentGroup[];
};

function formatUploadedAt(value: Date | string): string {
  return new Date(value).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export default function AccountDocumentsList({ listings }: AccountDocumentsListProps) {
  if (listings.length === 0) {
    return (
      <Paper variant="outlined" sx={{ p: { xs: 3, sm: 4 }, borderRadius: 2, textAlign: "center" }}>
        <Stack spacing={2} sx={{ alignItems: "center" }}>
          <Typography variant="h6">No documents yet</Typography>
          <Typography color="text.secondary" sx={{ maxWidth: 480 }}>
            Signed listing agreements, MLS paperwork, and other transaction documents will appear
            here as you complete onboarding for each property.
          </Typography>
          <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5}>
            <NextLink href="/account/listings" style={{ textDecoration: "none" }}>
              <Button variant="outlined">View my listings</Button>
            </NextLink>
            <NextLink href={LISTING_INTAKE_PATH} style={{ textDecoration: "none" }}>
              <Button variant="contained">Start a listing</Button>
            </NextLink>
          </Stack>
        </Stack>
      </Paper>
    );
  }

  const totalDocuments = listings.reduce((count, listing) => count + listing.documents.length, 0);

  return (
    <Stack spacing={3}>
      <Typography variant="body2" color="text.secondary">
        {totalDocuments} document{totalDocuments === 1 ? "" : "s"} across{" "}
        {listings.length} propert{listings.length === 1 ? "y" : "ies"}
      </Typography>

      {listings.map((listing) => (
        <Paper key={listing.id} variant="outlined" sx={{ borderRadius: 2, overflow: "hidden" }}>
          <Box
            sx={{
              px: 2.5,
              py: 2,
              borderBottom: "1px solid",
              borderColor: "divider",
              backgroundColor: "background.default",
            }}
          >
            <Stack
              direction={{ xs: "column", sm: "row" }}
              spacing={1.5}
              sx={{ justifyContent: "space-between", alignItems: { sm: "center" } }}
            >
              <Box>
                <Typography sx={{ fontWeight: 600 }}>{listing.address}</Typography>
                <Typography variant="body2" color="text.secondary">
                  {listing.city}, {listing.state} {listing.zip}
                </Typography>
              </Box>
              <NextLink
                href={buildListingDocumentsPath(listing.id)}
                style={{ textDecoration: "none" }}
              >
                <Button size="small" variant="outlined">
                  All documents
                </Button>
              </NextLink>
            </Stack>
          </Box>

          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Name</TableCell>
                  <TableCell>Uploaded</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {listing.documents.map((doc) => (
                  <TableRow key={doc.id} hover>
                    <TableCell>
                      <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
                        <Typography variant="body2">{doc.name}</Typography>
                        {isListingAgreementDocument(doc.name) ? (
                          <Chip label="Listing agreement" size="small" color="primary" />
                        ) : null}
                      </Stack>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" color="text.secondary">
                        {formatUploadedAt(doc.uploadedAt)}
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      <Stack direction="row" spacing={2} sx={{ justifyContent: "flex-end" }}>
                        <Link
                          href={buildAccountDocumentHref(listing.id, doc.id, "view")}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          View
                        </Link>
                        <Link
                          href={buildAccountDocumentHref(listing.id, doc.id, "download")}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          Download
                        </Link>
                      </Stack>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      ))}
    </Stack>
  );
}
