"use client";

import { useActionState, useMemo, useState } from "react";
import CheckCircleOutlinedIcon from "@mui/icons-material/CheckCircleOutlined";
import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import NextLink from "next/link";
import {
  computeCustomPrice,
  getPriceReductionOptions,
  parseMoneyInput,
  type ReductionOption,
} from "@/lib/consumer/price-reduction-options";
import {
  submitPriceReductionAction,
  type SellerRequestFormState,
} from "@/lib/consumer/seller-request-actions";
import { formatCurrency } from "@/lib/crm/format";

type PriceReductionRequestFormProps = {
  listingId: string;
  listPrice: number;
  addressLabel: string;
  hasOpenRequest: boolean;
};

const initialState: SellerRequestFormState = {};

type OptionCardProps = {
  selected: boolean;
  title: string;
  subtitle: string;
  priceLabel?: string;
  onSelect: () => void;
};

function OptionCard({ selected, title, subtitle, priceLabel, onSelect }: OptionCardProps) {
  return (
    <Box
      component="button"
      type="button"
      onClick={onSelect}
      aria-pressed={selected}
      sx={{
        display: "block",
        width: "100%",
        textAlign: "left",
        cursor: "pointer",
        p: 2,
        borderRadius: 2,
        border: "1.5px solid",
        borderColor: selected ? "primary.main" : "divider",
        bgcolor: selected ? "primary.light" : "background.paper",
        color: "text.primary",
        transition: "border-color 0.15s ease, background-color 0.15s ease",
        "&:hover": {
          borderColor: "primary.main",
          bgcolor: selected ? "primary.light" : "rgba(14, 122, 95, 0.06)",
        },
        "&:focus-visible": {
          outline: "2px solid",
          outlineColor: "primary.main",
          outlineOffset: 2,
        },
      }}
    >
      <Stack direction="row" spacing={1.5} sx={{ alignItems: "flex-start" }}>
        <Box
          aria-hidden
          sx={{
            width: 20,
            height: 20,
            mt: 0.25,
            flexShrink: 0,
            borderRadius: "50%",
            border: "2px solid",
            borderColor: selected ? "primary.main" : "divider",
            bgcolor: selected ? "primary.main" : "transparent",
            display: "grid",
            placeItems: "center",
          }}
        >
          {selected ? (
            <Box
              sx={{
                width: 8,
                height: 8,
                borderRadius: "50%",
                bgcolor: "primary.contrastText",
              }}
            />
          ) : null}
        </Box>
        <Stack spacing={0.25} sx={{ flex: 1, minWidth: 0 }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 600, lineHeight: 1.3 }}>
            {title}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {subtitle}
          </Typography>
        </Stack>
        {priceLabel ? (
          <Typography
            variant="h4"
            sx={{
              fontSize: "1.25rem",
              fontWeight: 600,
              color: selected ? "primary.dark" : "text.primary",
              flexShrink: 0,
            }}
          >
            {priceLabel}
          </Typography>
        ) : null}
      </Stack>
    </Box>
  );
}

function dropLabel(listPrice: number, newPrice: number): string {
  const drop = listPrice - newPrice;
  const pct = listPrice > 0 ? Math.round((drop / listPrice) * 100) : 0;
  return `About ${pct}% · saves ${formatCurrency(drop)}`;
}

export default function PriceReductionRequestForm({
  listingId,
  listPrice,
  addressLabel,
  hasOpenRequest,
}: PriceReductionRequestFormProps) {
  const [state, action, pending] = useActionState(
    submitPriceReductionAction,
    initialState,
  );
  const [option, setOption] = useState<ReductionOption>("A");
  const [customRaw, setCustomRaw] = useState("");

  const { optionA, optionB } = useMemo(
    () => getPriceReductionOptions(listPrice),
    [listPrice],
  );

  const customSnapped = useMemo(() => {
    const parsed = parseMoneyInput(customRaw);
    if (parsed == null) return null;
    return computeCustomPrice(parsed);
  }, [customRaw]);

  const selectedPrice =
    option === "A" ? optionA : option === "B" ? optionB : customSnapped;

  const canSubmit =
    selectedPrice != null &&
    selectedPrice < listPrice &&
    !(option === "C" && !customRaw.trim());

  if (state.success) {
    return (
      <Paper variant="outlined" sx={{ p: { xs: 2.5, md: 3 }, maxWidth: 640 }}>
        <Stack spacing={2}>
          <Alert severity="success" icon={<CheckCircleOutlinedIcon />}>
            Your price change request was sent to Blair. You’ll see it in your request history
            with status updates.
          </Alert>
          <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5}>
            <Button component={NextLink} href="/account/seller-requests" variant="contained">
              View request history
            </Button>
            <Button component={NextLink} href="/account" variant="outlined">
              Back to overview
            </Button>
          </Stack>
        </Stack>
      </Paper>
    );
  }

  if (hasOpenRequest) {
    return (
      <Paper variant="outlined" sx={{ p: { xs: 2.5, md: 3 }, maxWidth: 640 }}>
        <Stack spacing={2}>
          <Alert severity="info">
            You already have an open price change request for this listing. We’ll update you
            when it’s complete.
          </Alert>
          <Button
            component={NextLink}
            href="/account/seller-requests"
            variant="outlined"
            sx={{ alignSelf: "flex-start" }}
          >
            View request history
          </Button>
        </Stack>
      </Paper>
    );
  }

  return (
    <Box component="form" action={action} sx={{ maxWidth: 640 }}>
      <input type="hidden" name="listingId" value={listingId} />
      <input type="hidden" name="reductionOption" value={option} />
      <Stack spacing={3}>
        <Paper
          variant="outlined"
          sx={{
            p: { xs: 2.5, md: 3 },
            bgcolor: "background.paper",
          }}
        >
          <Typography
            variant="overline"
            color="text.secondary"
            sx={{ fontWeight: 700, letterSpacing: "0.08em" }}
          >
            Listing
          </Typography>
          <Typography variant="subtitle1" sx={{ fontWeight: 600, mt: 0.5 }}>
            {addressLabel}
          </Typography>
          <Stack
            direction={{ xs: "column", sm: "row" }}
            spacing={{ xs: 0.5, sm: 2 }}
            sx={{ mt: 2, alignItems: { sm: "baseline" } }}
          >
            <Typography variant="body2" color="text.secondary">
              Current list price
            </Typography>
            <Typography
              variant="h3"
              sx={{ fontSize: { xs: "1.75rem", sm: "2rem" }, color: "text.primary" }}
            >
              {formatCurrency(listPrice)}
            </Typography>
          </Stack>
        </Paper>

        <Box>
          <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 0.5 }}>
            Choose a new price
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>
            Suggested cuts round up to the nearest $5,000. Blair will update MLS after review.
          </Typography>
          <Stack spacing={1.25}>
            <OptionCard
              selected={option === "A"}
              title="Option A — stronger cut"
              subtitle={dropLabel(listPrice, optionA)}
              priceLabel={formatCurrency(optionA)}
              onSelect={() => setOption("A")}
            />
            <OptionCard
              selected={option === "B"}
              title="Option B — lighter cut"
              subtitle={dropLabel(listPrice, optionB)}
              priceLabel={formatCurrency(optionB)}
              onSelect={() => setOption("B")}
            />
            <OptionCard
              selected={option === "C"}
              title="Custom amount"
              subtitle="Enter any price below your current list"
              onSelect={() => setOption("C")}
            />
          </Stack>
        </Box>

        {option === "C" ? (
          <TextField
            name="customPrice"
            label="Custom new price"
            value={customRaw}
            onChange={(event) => setCustomRaw(event.target.value)}
            placeholder="e.g. 475000"
            fullWidth
            required
            helperText={
              customSnapped != null
                ? `Will request ${formatCurrency(customSnapped)} after rounding up to $5,000`
                : "Enter an amount below the current list price"
            }
          />
        ) : null}

        <TextField
          name="message"
          label="Note for Blair (optional)"
          multiline
          minRows={3}
          fullWidth
          placeholder="Anything Blair should know about this change…"
        />

        {canSubmit && selectedPrice != null ? (
          <Stack
            direction="row"
            spacing={1.5}
            sx={{
              alignItems: "flex-start",
              p: 2,
              borderRadius: 2,
              bgcolor: "primary.light",
              border: "1px solid",
              borderColor: "primary.main",
            }}
          >
            <CheckCircleOutlinedIcon color="primary" fontSize="small" sx={{ mt: 0.25 }} />
            <Stack spacing={0.25}>
              <Typography variant="subtitle2" sx={{ color: "primary.dark" }}>
                Ready to request
              </Typography>
              <Typography variant="body2" color="text.secondary">
                I want Blair to update MLS from {formatCurrency(listPrice)} to{" "}
                <Box component="span" sx={{ fontWeight: 700, color: "text.primary" }}>
                  {formatCurrency(selectedPrice)}
                </Box>
                .
              </Typography>
            </Stack>
          </Stack>
        ) : null}

        {state.error ? <Alert severity="error">{state.error}</Alert> : null}

        <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5}>
          <Button
            type="submit"
            variant="contained"
            disabled={pending || !canSubmit}
            sx={{ alignSelf: { sm: "flex-start" } }}
          >
            {pending ? "Sending…" : "Submit price change request"}
          </Button>
          <Button
            component={NextLink}
            href="/account"
            variant="outlined"
            sx={{ alignSelf: { sm: "flex-start" } }}
          >
            Cancel
          </Button>
        </Stack>
      </Stack>
    </Box>
  );
}
