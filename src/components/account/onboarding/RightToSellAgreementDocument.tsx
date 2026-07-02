"use client";

import Box from "@mui/material/Box";
import Checkbox from "@mui/material/Checkbox";
import FormControl from "@mui/material/FormControl";
import FormControlLabel from "@mui/material/FormControlLabel";
import FormGroup from "@mui/material/FormGroup";
import FormLabel from "@mui/material/FormLabel";
import MenuItem from "@mui/material/MenuItem";
import Radio from "@mui/material/Radio";
import RadioGroup from "@mui/material/RadioGroup";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import SignatureField from "@/components/account/mls-input/fields/SignatureField";
import {
  RIGHT_TO_SELL_AGREEMENT_TITLE,
  RIGHT_TO_SELL_DOCUMENT_BLOCKS,
  RIGHT_TO_SELL_BUYER_AGENT_PERCENT_OPTIONS,
  RIGHT_TO_SELL_SQFT_SOURCE_OPTIONS,
  SELLER_DENIES_BUYER_COMP_LABEL,
  computeListingEndDate,
  type RightToSellFieldId,
} from "@/content/right-to-sell-agreement";
import type { BlobAccess } from "@/lib/storage/blob";
import type { UarAgreementFormValues } from "@/types/uar-agreement";

const documentTextSx = {
  fontSize: "12pt",
  lineHeight: 1.6,
  whiteSpace: "pre-line" as const,
};

type RightToSellAgreementDocumentProps = {
  listingId: string;
  form: UarAgreementFormValues;
  fieldErrors?: Record<string, string>;
  documentBlobAccess: BlobAccess;
  onUpdateField: <K extends keyof UarAgreementFormValues>(
    key: K,
    value: UarAgreementFormValues[K],
  ) => void;
  onToggleSqFtSource: (source: string, checked: boolean) => void;
};

function fieldError(
  fieldErrors: Record<string, string> | undefined,
  key: string,
): string | undefined {
  return fieldErrors?.[key];
}

function DocumentText({ children }: { children: string }) {
  return (
    <Typography component="p" variant="body2" sx={documentTextSx}>
      {children}
    </Typography>
  );
}

export default function RightToSellAgreementDocument({
  listingId,
  form,
  fieldErrors,
  documentBlobAccess,
  onUpdateField,
  onToggleSqFtSource,
}: RightToSellAgreementDocumentProps) {
  const showSeller2 = form.multipleOwners === "YES";
  const listingEndDate = computeListingEndDate(form.signedDate);

  const renderField = (fieldId: RightToSellFieldId) => {
    switch (fieldId) {
      case "multipleOwners":
        return (
          <FormControl
            key={fieldId}
            required
            error={Boolean(fieldError(fieldErrors, "multipleOwners"))}
            sx={{ my: 1.5 }}
          >
            <FormLabel required sx={{ fontWeight: 600, color: "text.primary", mb: 0.5 }}>
              Is there more than one owner?*
            </FormLabel>
            <RadioGroup
              row
              name="multipleOwners"
              value={form.multipleOwners}
              onChange={(event) =>
                onUpdateField(
                  "multipleOwners",
                  event.target.value as UarAgreementFormValues["multipleOwners"],
                )
              }
            >
              <FormControlLabel value="YES" control={<Radio />} label="YES" />
              <FormControlLabel value="NO" control={<Radio />} label="NO" />
            </RadioGroup>
          </FormControl>
        );

      case "seller1Name":
        return (
          <Stack key={fieldId} spacing={1} sx={{ my: 1.5 }}>
            <FormLabel required sx={{ fontWeight: 600, color: "text.primary" }}>
              &quot;SELLER&quot; Name 1*
            </FormLabel>
            <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
              <TextField
                name="seller1FirstName"
                label="First Name"
                value={form.seller1FirstName}
                onChange={(event) => onUpdateField("seller1FirstName", event.target.value)}
                required
                fullWidth
                error={Boolean(fieldError(fieldErrors, "seller1FirstName"))}
                helperText={fieldError(fieldErrors, "seller1FirstName")}
              />
              <TextField
                name="seller1LastName"
                label="Last Name"
                value={form.seller1LastName}
                onChange={(event) => onUpdateField("seller1LastName", event.target.value)}
                required
                fullWidth
                error={Boolean(fieldError(fieldErrors, "seller1LastName"))}
                helperText={fieldError(fieldErrors, "seller1LastName")}
              />
            </Stack>
          </Stack>
        );

      case "seller2Name":
        if (!showSeller2) return null;
        return (
          <Stack key={fieldId} spacing={1} sx={{ my: 1.5 }}>
            <FormLabel sx={{ fontWeight: 600, color: "text.primary" }}>
              &quot;SELLER&quot; Name 2
            </FormLabel>
            <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
              <TextField
                name="seller2FirstName"
                label="First Name"
                value={form.seller2FirstName}
                onChange={(event) => onUpdateField("seller2FirstName", event.target.value)}
                required
                fullWidth
                error={Boolean(fieldError(fieldErrors, "seller2FirstName"))}
                helperText={fieldError(fieldErrors, "seller2FirstName")}
              />
              <TextField
                name="seller2LastName"
                label="Last Name"
                value={form.seller2LastName}
                onChange={(event) => onUpdateField("seller2LastName", event.target.value)}
                required
                fullWidth
                error={Boolean(fieldError(fieldErrors, "seller2LastName"))}
                helperText={fieldError(fieldErrors, "seller2LastName")}
              />
            </Stack>
          </Stack>
        );

      case "seller2Contact":
        if (!showSeller2) return null;
        return (
          <Stack key={fieldId} spacing={1} sx={{ my: 1.5 }}>
            <FormLabel sx={{ fontWeight: 600, color: "text.primary" }}>
              Seller 2 contact
            </FormLabel>
            <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
              <TextField
                name="seller2Email"
                label="Email"
                type="email"
                value={form.seller2Email}
                onChange={(event) => onUpdateField("seller2Email", event.target.value)}
                required
                fullWidth
                error={Boolean(fieldError(fieldErrors, "seller2Email"))}
                helperText={fieldError(fieldErrors, "seller2Email")}
              />
              <TextField
                name="seller2Phone"
                label="Phone"
                type="tel"
                value={form.seller2Phone}
                onChange={(event) => onUpdateField("seller2Phone", event.target.value)}
                required
                fullWidth
                error={Boolean(fieldError(fieldErrors, "seller2Phone"))}
                helperText={fieldError(fieldErrors, "seller2Phone")}
              />
            </Stack>
          </Stack>
        );

      case "propertyAddress":
        return (
          <Stack key={fieldId} spacing={1} sx={{ my: 1.5 }}>
            <FormLabel required sx={{ fontWeight: 600, color: "text.primary" }}>
              Property Listing Address*
            </FormLabel>
            <TextField
              name="propertyAddress"
              label="Street Address"
              value={form.propertyAddress}
              onChange={(event) => onUpdateField("propertyAddress", event.target.value)}
              required
              fullWidth
              error={Boolean(fieldError(fieldErrors, "propertyAddress"))}
              helperText={fieldError(fieldErrors, "propertyAddress")}
            />
            <TextField
              name="propertyUnit"
              label="Unit Number"
              value={form.propertyUnit}
              onChange={(event) => onUpdateField("propertyUnit", event.target.value)}
              fullWidth
            />
            <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
              <TextField
                name="propertyCity"
                label="City"
                value={form.propertyCity}
                onChange={(event) => onUpdateField("propertyCity", event.target.value)}
                required
                fullWidth
                error={Boolean(fieldError(fieldErrors, "propertyCity"))}
                helperText={fieldError(fieldErrors, "propertyCity")}
              />
              <TextField
                name="propertyState"
                label="State"
                value={form.propertyState}
                onChange={(event) => onUpdateField("propertyState", event.target.value)}
                required
                fullWidth
                sx={{ maxWidth: { sm: 120 } }}
                error={Boolean(fieldError(fieldErrors, "propertyState"))}
                helperText={fieldError(fieldErrors, "propertyState")}
              />
              <TextField
                name="propertyZip"
                label="Zip Code"
                value={form.propertyZip}
                onChange={(event) => onUpdateField("propertyZip", event.target.value)}
                required
                fullWidth
                sx={{ maxWidth: { sm: 140 } }}
                error={Boolean(fieldError(fieldErrors, "propertyZip"))}
                helperText={fieldError(fieldErrors, "propertyZip")}
              />
            </Stack>
          </Stack>
        );

      case "listingEndDate":
        return (
          <DocumentText key={fieldId}>
            {`at the listing price and terms stated on the attached property data form (the "Data Form"), or at such other price and terms to which the Seller may agree in writing. This Listing Agreement is effective as of the date it is signed by all parties and ENDS at 5:00 P.M. (Mountain Time) on ${listingEndDate || "(End Date)"} which is 6 months from the signed date of this contract (the "Listing Period" In the event this Listing Agreement expires while the Property is under contract to be sold, the Company and Seller mutually agree that the Listing Period shall automatically extend until the under-contract transaction closes or is cancelled.`}
          </DocumentText>
        );

      case "buyerAgentPercent":
        return (
          <TextField
            key={fieldId}
            select
            name="buyerAgentPercent"
            label="% BUYER AGENT Compensation Offered*"
            value={form.buyerAgentPercent}
            onChange={(event) => onUpdateField("buyerAgentPercent", event.target.value)}
            required
            fullWidth
            sx={{ my: 1.5, maxWidth: 400 }}
            error={Boolean(fieldError(fieldErrors, "buyerAgentPercent"))}
            helperText={fieldError(fieldErrors, "buyerAgentPercent")}
          >
            {RIGHT_TO_SELL_BUYER_AGENT_PERCENT_OPTIONS.map((option) => (
              <MenuItem key={option} value={option}>
                {option}
              </MenuItem>
            ))}
          </TextField>
        );

      case "buyerAgentDollarOr":
        return (
          <Stack key={fieldId} spacing={1} sx={{ my: 1.5 }}>
            <Typography variant="h6" sx={{ fontWeight: 700 }}>
              OR
            </Typography>
            <TextField
              name="buyerAgentDollar"
              label="$ BUYER AGENT COMPENSATION OFFERED"
              value={form.buyerAgentDollar}
              onChange={(event) => onUpdateField("buyerAgentDollar", event.target.value)}
              placeholder="e.g., $10,000"
              fullWidth
              sx={{ maxWidth: 400 }}
            />
          </Stack>
        );

      case "sellerDeniesBuyerCompAgreement":
        return (
          <FormControlLabel
            key={fieldId}
            control={
              <Checkbox
                name="sellerDeniesBuyerCompAgreement"
                checked={form.sellerDeniesBuyerCompAgreement}
                onChange={(event) =>
                  onUpdateField("sellerDeniesBuyerCompAgreement", event.target.checked)
                }
              />
            }
            label={SELLER_DENIES_BUYER_COMP_LABEL}
            sx={{ my: 1, alignItems: "flex-start", mx: 0 }}
          />
        );

      case "disputeMediation":
        return (
          <FormGroup key={fieldId} sx={{ my: 1 }}>
            <FormControlLabel
              control={
                <Checkbox
                  checked={form.disputeMediation === "SHALL"}
                  onChange={(event) =>
                    onUpdateField(
                      "disputeMediation",
                      event.target.checked ? "SHALL" : "MAY AT THE OPTION OF THE PARTIES",
                    )
                  }
                />
              }
              label="SHALL"
            />
            <FormControlLabel
              control={
                <Checkbox
                  checked={form.disputeMediation === "MAY AT THE OPTION OF THE PARTIES"}
                  onChange={(event) =>
                    onUpdateField(
                      "disputeMediation",
                      event.target.checked ? "MAY AT THE OPTION OF THE PARTIES" : "SHALL",
                    )
                  }
                />
              }
              label="MAY AT THE OPTION OF THE PARTIES"
            />
          </FormGroup>
        );

      case "sqFtSources":
        return (
          <FormControl key={fieldId} component="fieldset" sx={{ my: 1.5 }}>
            <FormLabel component="legend" sx={{ fontWeight: 600, color: "text.primary", mb: 1 }}>
              Where did you obtain your square footage measurements?
            </FormLabel>
            <FormGroup>
              {RIGHT_TO_SELL_SQFT_SOURCE_OPTIONS.map((option) => (
                <FormControlLabel
                  key={option}
                  control={
                    <Checkbox
                      name="sqFtSources"
                      value={option}
                      checked={form.sqFtSources.includes(option)}
                      onChange={(event) => onToggleSqFtSource(option, event.target.checked)}
                    />
                  }
                  label={option}
                />
              ))}
            </FormGroup>
            <Box sx={{ display: "flex", flexDirection: "row", gap: 1, alignItems: "center", mt: 0.5 }}>
              <Checkbox
                checked={Boolean(form.sqFtOther.trim())}
                onChange={(event) => {
                  if (!event.target.checked) onUpdateField("sqFtOther", "");
                }}
              />
              <TextField
                name="sqFtOther"
                label="Other"
                value={form.sqFtOther}
                onChange={(event) => onUpdateField("sqFtOther", event.target.value)}
                placeholder="Please type another option here"
                fullWidth
                size="small"
              />
            </Box>
          </FormControl>
        );

      case "attachmentTerms":
        return (
          <FormGroup key={fieldId} sx={{ my: 1.5 }}>
            <FormControlLabel
              control={
                <Checkbox
                  checked={form.attachmentTerms === "ARE"}
                  onChange={(event) =>
                    onUpdateField("attachmentTerms", event.target.checked ? "ARE" : "ARE NOT")
                  }
                />
              }
              label="ARE"
            />
            <FormControlLabel
              control={
                <Checkbox
                  checked={form.attachmentTerms === "ARE NOT"}
                  onChange={(event) =>
                    onUpdateField("attachmentTerms", event.target.checked ? "ARE NOT" : "ARE")
                  }
                />
              }
              label="ARE NOT"
            />
          </FormGroup>
        );

      case "firptaStatus":
        return (
          <FormGroup key={fieldId} sx={{ my: 1.5 }}>
            <FormControlLabel
              control={
                <Checkbox
                  checked={form.firptaStatus === "IS"}
                  onChange={(event) =>
                    onUpdateField("firptaStatus", event.target.checked ? "IS" : "IS NOT")
                  }
                />
              }
              label="IS"
            />
            <FormControlLabel
              control={
                <Checkbox
                  checked={form.firptaStatus === "IS NOT"}
                  onChange={(event) =>
                    onUpdateField("firptaStatus", event.target.checked ? "IS NOT" : "IS")
                  }
                />
              }
              label="IS NOT"
            />
          </FormGroup>
        );

      case "seller1Signature":
        return (
          <SignatureField
            key={fieldId}
            label="Seller 1 SIGNATURE*"
            value={form.seller1SignatureUrl}
            listingId={listingId}
            signerName={`${form.seller1FirstName} ${form.seller1LastName}`.trim()}
            documentBlobAccess={documentBlobAccess}
            required
            error={fieldError(fieldErrors, "seller1SignatureUrl")}
            onChange={(url) => onUpdateField("seller1SignatureUrl", url)}
            onModeChange={(mode) => onUpdateField("signatureMethod", mode)}
          />
        );

      case "seller1Initials":
        return (
          <SignatureField
            key={fieldId}
            label="Seller 1 INITIALS*"
            value={form.seller1InitialsUrl}
            listingId={listingId}
            signerName={`${form.seller1FirstName.charAt(0)}${form.seller1LastName.charAt(0)}`.trim()}
            documentBlobAccess={documentBlobAccess}
            required
            error={fieldError(fieldErrors, "seller1InitialsUrl")}
            onChange={(url) => onUpdateField("seller1InitialsUrl", url)}
          />
        );

      case "seller2Signature":
        if (!showSeller2) return null;
        return (
          <SignatureField
            key={fieldId}
            label="Seller 2 SIGNATURE"
            value={form.seller2SignatureUrl}
            listingId={listingId}
            signerName={`${form.seller2FirstName} ${form.seller2LastName}`.trim()}
            documentBlobAccess={documentBlobAccess}
            required
            error={fieldError(fieldErrors, "seller2SignatureUrl")}
            onChange={(url) => onUpdateField("seller2SignatureUrl", url)}
          />
        );

      case "seller2Initials":
        if (!showSeller2) return null;
        return (
          <SignatureField
            key={fieldId}
            label="Seller 2 INITIALS"
            value={form.seller2InitialsUrl}
            listingId={listingId}
            signerName={`${form.seller2FirstName.charAt(0)}${form.seller2LastName.charAt(0)}`.trim()}
            documentBlobAccess={documentBlobAccess}
            required
            error={fieldError(fieldErrors, "seller2InitialsUrl")}
            onChange={(url) => onUpdateField("seller2InitialsUrl", url)}
          />
        );

      case "sellerEmail":
        return (
          <TextField
            key={fieldId}
            name="sellerEmail"
            label="Seller Email*"
            type="email"
            value={form.sellerEmail}
            onChange={(event) => onUpdateField("sellerEmail", event.target.value)}
            required
            fullWidth
            sx={{ my: 1.5, maxWidth: 400 }}
            error={Boolean(fieldError(fieldErrors, "sellerEmail"))}
            helperText={fieldError(fieldErrors, "sellerEmail") ?? "example@example.com"}
          />
        );

      case "signedDate":
        return (
          <TextField
            key={fieldId}
            name="signedDate"
            label="Date*"
            type="date"
            value={form.signedDate}
            onChange={(event) => onUpdateField("signedDate", event.target.value)}
            required
            fullWidth
            slotProps={{ inputLabel: { shrink: true } }}
            sx={{ my: 1.5, maxWidth: 240 }}
            error={Boolean(fieldError(fieldErrors, "signedDate"))}
            helperText={fieldError(fieldErrors, "signedDate")}
          />
        );

      default:
        return null;
    }
  };

  return (
    <Box>
      <Typography variant="h6" sx={{ mb: 2, fontWeight: 700 }}>
        {RIGHT_TO_SELL_AGREEMENT_TITLE}
      </Typography>
      <Stack spacing={1.5}>
        {RIGHT_TO_SELL_DOCUMENT_BLOCKS.map((block, index) => {
          if (block.type === "text") {
            const isBoldHeader =
              block.content.startsWith("THIS IS A LEGALLY BINDING") ||
              block.content.startsWith("CANCELLATION:") ||
              block.content.startsWith("17. CANCELLATION");
            return (
              <Typography
                key={`text-${index}`}
                component="p"
                variant="body2"
                sx={{
                  ...documentTextSx,
                  fontWeight: isBoldHeader ? 700 : 400,
                }}
              >
                {block.content}
              </Typography>
            );
          }

          return (
            <Box key={`field-${block.fieldId}-${index}`}>{renderField(block.fieldId)}</Box>
          );
        })}
      </Stack>
    </Box>
  );
}
