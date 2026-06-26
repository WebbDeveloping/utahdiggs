"use client";

import { useActionState, useRef, useState } from "react";
import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import CircularProgress from "@mui/material/CircularProgress";
import FormControl from "@mui/material/FormControl";
import FormHelperText from "@mui/material/FormHelperText";
import Grid from "@mui/material/Grid";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import Paper from "@mui/material/Paper";
import Select from "@mui/material/Select";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import UploadFileOutlinedIcon from "@mui/icons-material/UploadFileOutlined";
import { upload } from "@vercel/blob/client";
import PhoneTextField from "@/components/ui/PhoneTextField";
import { formatCurrency } from "@/lib/crm/format";
import { submitOfferAction } from "@/lib/offer/submit-action";
import {
  buildOfferDocumentPathname,
  MAX_DOCUMENT_BYTES,
} from "@/lib/storage/blob";
import {
  FINANCING_TYPE_OPTIONS,
  type OfferFormListing,
  type OfferSubmissionState,
} from "@/types/offer";

const PDF_ACCEPT = "application/pdf";
const MAX_DOCUMENT_MB = Math.round(MAX_DOCUMENT_BYTES / (1024 * 1024));

const inputSx = {
  "& .MuiOutlinedInput-root": {
    borderRadius: 2,
    backgroundColor: "background.default",
  },
};

type OfferSubmissionFormProps = {
  listing: OfferFormListing;
};

type PdfUploadFieldProps = {
  label: string;
  listingId: string;
  portalSlug: string;
  fieldName: "offerContractUrl" | "preApprovalUrl";
  value: string | null;
  onChange: (url: string | null) => void;
  error?: string;
};

function PdfUploadField({
  label,
  listingId,
  portalSlug,
  fieldName,
  value,
  onChange,
  error,
}: PdfUploadFieldProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const handleFileSelect = async (files: FileList | null) => {
    const file = files?.[0];
    if (!file) return;

    setUploadError(null);
    setUploading(true);
    onChange(null);

    try {
      if (file.type !== PDF_ACCEPT) {
        setUploadError("Only PDF files are allowed.");
        return;
      }
      if (file.size > MAX_DOCUMENT_BYTES) {
        setUploadError(`Each file must be under ${MAX_DOCUMENT_MB} MB.`);
        return;
      }

      const pathname = buildOfferDocumentPathname(listingId, file.name);
      const result = await upload(pathname, file, {
        access: "public",
        handleUploadUrl: `/api/offer/${portalSlug}/upload`,
      });

      onChange(result.url);
    } catch (err) {
      console.error(err);
      setUploadError("Upload failed. Please try again.");
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  return (
    <Stack spacing={1}>
      <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
        {label}
      </Typography>
      <input
        ref={inputRef}
        type="file"
        accept={PDF_ACCEPT}
        hidden
        onChange={(e) => handleFileSelect(e.target.files)}
      />
      <Button
        variant="outlined"
        startIcon={
          uploading ? (
            <CircularProgress size={18} />
          ) : value ? (
            <UploadFileOutlinedIcon color="success" />
          ) : (
            <UploadFileOutlinedIcon />
          )
        }
        disabled={uploading}
        onClick={() => inputRef.current?.click()}
        sx={{ alignSelf: "flex-start" }}
      >
        {uploading ? "Uploading…" : value ? "Replace PDF" : "Choose PDF"}
      </Button>
      {value ? (
        <Typography variant="caption" color="success.main">
          PDF uploaded successfully.
        </Typography>
      ) : null}
      {uploadError ? <Alert severity="error">{uploadError}</Alert> : null}
      {error ? <FormHelperText error>{error}</FormHelperText> : null}
      <input type="hidden" name={fieldName} value={value ?? ""} />
    </Stack>
  );
}

function formatAddress(listing: OfferFormListing): string {
  return `${listing.address}, ${listing.city}, ${listing.state} ${listing.zip}`;
}

export default function OfferSubmissionForm({ listing }: OfferSubmissionFormProps) {
  const [state, formAction, pending] = useActionState<
    OfferSubmissionState,
    FormData
  >(submitOfferAction, {});

  const [offerContractUrl, setOfferContractUrl] = useState<string | null>(null);
  const [preApprovalUrl, setPreApprovalUrl] = useState<string | null>(null);
  const [financingType, setFinancingType] = useState("");

  if (state.success) {
    return (
      <Paper variant="outlined" sx={{ p: 4, borderRadius: 2 }}>
        <Alert severity="success" sx={{ mb: 2 }}>
          Offer submitted successfully.
        </Alert>
        <Typography variant="h5" sx={{ mb: 1 }}>
          Thank you
        </Typography>
        <Typography color="text.secondary">
          Your offer has been submitted. The listing agent will review it.
        </Typography>
      </Paper>
    );
  }

  const fieldErrors = state.fieldErrors ?? {};
  const canSubmit =
    offerContractUrl != null &&
    preApprovalUrl != null &&
    financingType !== "" &&
    !pending;

  return (
    <Box component="form" action={formAction}>
      <input type="hidden" name="portalSlug" value={listing.portalSlug} />
      <input type="hidden" name="financingType" value={financingType} />
      <input
        type="text"
        name="website"
        tabIndex={-1}
        autoComplete="off"
        aria-hidden
        style={{ position: "absolute", left: "-9999px", opacity: 0 }}
      />

      <Stack spacing={4}>
        {state.error ? <Alert severity="error">{state.error}</Alert> : null}

        <Paper variant="outlined" sx={{ p: 3, borderRadius: 2 }}>
          <Typography variant="overline" color="text.secondary">
            Property
          </Typography>
          <Typography variant="h6" sx={{ mt: 0.5 }}>
            {formatAddress(listing)}
          </Typography>
          <Stack direction="row" spacing={3} sx={{ mt: 1, flexWrap: "wrap" }}>
            <Typography variant="body2" color="text.secondary">
              List price: {formatCurrency(listing.listPrice)}
            </Typography>
            {listing.mlsNumber ? (
              <Typography variant="body2" color="text.secondary">
                MLS #{listing.mlsNumber}
              </Typography>
            ) : null}
          </Stack>
        </Paper>

        <Paper variant="outlined" sx={{ p: 3, borderRadius: 2 }}>
          <Typography variant="h6" sx={{ mb: 2 }}>
            Buyer&apos;s agent
          </Typography>
          <Grid container spacing={2}>
            <Grid size={{ xs: 12 }}>
              <TextField
                name="buyersAgent"
                label="Agent name"
                required
                fullWidth
                size="small"
                sx={inputSx}
                error={Boolean(fieldErrors.buyersAgent)}
                helperText={fieldErrors.buyersAgent}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                name="buyerAgentEmail"
                label="Agent email"
                type="email"
                required
                fullWidth
                size="small"
                sx={inputSx}
                error={Boolean(fieldErrors.buyerAgentEmail)}
                helperText={fieldErrors.buyerAgentEmail}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <PhoneTextField
                name="buyerAgentPhone"
                label="Agent phone"
                required
                fullWidth
                size="small"
                sx={inputSx}
                error={Boolean(fieldErrors.buyerAgentPhone)}
                helperText={fieldErrors.buyerAgentPhone}
              />
            </Grid>
          </Grid>
        </Paper>

        <Paper variant="outlined" sx={{ p: 3, borderRadius: 2 }}>
          <Typography variant="h6" sx={{ mb: 0.5 }}>
            Buyer
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Optional — include if known at time of offer.
          </Typography>
          <Grid container spacing={2}>
            <Grid size={{ xs: 12 }}>
              <TextField
                name="buyerName"
                label="Buyer name"
                fullWidth
                size="small"
                sx={inputSx}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                name="buyerEmail"
                label="Buyer email"
                type="email"
                fullWidth
                size="small"
                sx={inputSx}
                error={Boolean(fieldErrors.buyerEmail)}
                helperText={fieldErrors.buyerEmail}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <PhoneTextField
                name="buyerPhone"
                label="Buyer phone"
                fullWidth
                size="small"
                sx={inputSx}
              />
            </Grid>
          </Grid>
        </Paper>

        <Paper variant="outlined" sx={{ p: 3, borderRadius: 2 }}>
          <Typography variant="h6" sx={{ mb: 2 }}>
            Offer terms
          </Typography>
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                name="offerPrice"
                label="Offer price"
                required
                fullWidth
                size="small"
                sx={inputSx}
                placeholder="525000"
                error={Boolean(fieldErrors.offerPrice)}
                helperText={fieldErrors.offerPrice}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                name="earnestMoney"
                label="Earnest money"
                fullWidth
                size="small"
                sx={inputSx}
                placeholder="5000"
                error={Boolean(fieldErrors.earnestMoney)}
                helperText={fieldErrors.earnestMoney}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <FormControl fullWidth size="small" error={Boolean(fieldErrors.financingType)}>
                <InputLabel id="financing-type-label">Financing type</InputLabel>
                <Select
                  labelId="financing-type-label"
                  label="Financing type"
                  required
                  value={financingType}
                  onChange={(e) => setFinancingType(e.target.value)}
                  displayEmpty
                  sx={inputSx}
                >
                  <MenuItem value="" disabled>
                    Select financing
                  </MenuItem>
                  {FINANCING_TYPE_OPTIONS.map((option) => (
                    <MenuItem key={option} value={option}>
                      {option}
                    </MenuItem>
                  ))}
                </Select>
                {fieldErrors.financingType ? (
                  <FormHelperText>{fieldErrors.financingType}</FormHelperText>
                ) : null}
              </FormControl>
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                name="closingDate"
                label="Closing date"
                type="date"
                fullWidth
                size="small"
                sx={inputSx}
                slotProps={{ inputLabel: { shrink: true } }}
                error={Boolean(fieldErrors.closingDate)}
                helperText={fieldErrors.closingDate}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                name="inspectionPeriod"
                label="Inspection period"
                fullWidth
                size="small"
                sx={inputSx}
                placeholder="e.g. 10 days"
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                name="appraisalGap"
                label="Appraisal gap coverage"
                fullWidth
                size="small"
                sx={inputSx}
                placeholder="e.g. $10,000"
              />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <TextField
                name="contingencies"
                label="Contingencies"
                fullWidth
                multiline
                minRows={2}
                size="small"
                sx={inputSx}
              />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <TextField
                name="additionalTerms"
                label="Additional terms"
                fullWidth
                multiline
                minRows={2}
                size="small"
                sx={inputSx}
              />
            </Grid>
          </Grid>
        </Paper>

        <Paper variant="outlined" sx={{ p: 3, borderRadius: 2 }}>
          <Typography variant="h6" sx={{ mb: 2 }}>
            Documents
          </Typography>
          <Stack spacing={3}>
            <PdfUploadField
              label="Offer contract (REPC) *"
              listingId={listing.id}
              portalSlug={listing.portalSlug}
              fieldName="offerContractUrl"
              value={offerContractUrl}
              onChange={setOfferContractUrl}
              error={fieldErrors.offerContractUrl}
            />
            <PdfUploadField
              label="Pre-approval letter *"
              listingId={listing.id}
              portalSlug={listing.portalSlug}
              fieldName="preApprovalUrl"
              value={preApprovalUrl}
              onChange={setPreApprovalUrl}
              error={fieldErrors.preApprovalUrl}
            />
          </Stack>
        </Paper>

        <Button
          type="submit"
          variant="contained"
          size="large"
          disabled={!canSubmit}
          sx={{ alignSelf: "flex-start" }}
        >
          {pending ? "Submitting…" : "Submit offer"}
        </Button>
      </Stack>
    </Box>
  );
}
