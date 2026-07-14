"use client";

import { useActionState, useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Chip from "@mui/material/Chip";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import FormControl from "@mui/material/FormControl";
import Grid from "@mui/material/Grid";
import IconButton from "@mui/material/IconButton";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import Paper from "@mui/material/Paper";
import Select from "@mui/material/Select";
import Stack from "@mui/material/Stack";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import AddIcon from "@mui/icons-material/Add";
import CloseIcon from "@mui/icons-material/Close";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import {
  clearMarketDataOverrideAction,
  createMarketDataAction,
  updateMarketDataAction,
  type MarketDataActionState,
} from "@/lib/crm/market-data-actions";
import type { MarketDataAdminRow } from "@/lib/crm/market-data-queries";
import { formatCurrency } from "@/lib/crm/format";

type MarketDataAdminProps = {
  rows: MarketDataAdminRow[];
  cities: string[];
  reportDates: string[];
  /** Most recent report date in the DB (YYYY-MM-DD), if any */
  currentWeekDate: string | null;
  selectedCity: string;
  selectedReportDate: string;
};

const initialState: MarketDataActionState = {};

const inputSx = {
  "& .MuiOutlinedInput-root": {
    borderRadius: 2,
    backgroundColor: "background.default",
  },
};

type FormValues = {
  id?: string;
  city: string;
  reportDate: string;
  homesForSale: string;
  homesForSaleChangePct: string;
  newToMarket: string;
  newToMarketChangePct: string;
  homesSoldCount: string;
  homesSoldChangePct: string;
  avgDom: string;
  domChangePct: string;
  avgHomePrice: string;
  avgHomePriceChangePct: string;
  avgSoldPrice: string;
  avgSoldPriceChangePct: string;
  pricePerSqFt: string;
  pricePerSqFtChangePct: string;
  priceReductionsCount: string;
  priceReductionsChangePct: string;
  soldToListedRatio: string;
  soldToListedChangePct: string;
};

function emptyForm(defaults?: { city?: string; reportDate?: string }): FormValues {
  return {
    city: defaults?.city ?? "",
    reportDate: defaults?.reportDate ?? "",
    homesForSale: "",
    homesForSaleChangePct: "",
    newToMarket: "",
    newToMarketChangePct: "",
    homesSoldCount: "",
    homesSoldChangePct: "",
    avgDom: "",
    domChangePct: "",
    avgHomePrice: "",
    avgHomePriceChangePct: "",
    avgSoldPrice: "",
    avgSoldPriceChangePct: "",
    pricePerSqFt: "",
    pricePerSqFtChangePct: "",
    priceReductionsCount: "",
    priceReductionsChangePct: "",
    soldToListedRatio: "",
    soldToListedChangePct: "",
  };
}

function rowToForm(row: MarketDataAdminRow): FormValues {
  return {
    id: row.id,
    city: row.city,
    reportDate: row.reportDate,
    homesForSale: row.homesForSale?.toString() ?? "",
    homesForSaleChangePct: row.homesForSaleChangePct ?? "",
    newToMarket: row.newToMarket?.toString() ?? "",
    newToMarketChangePct: row.newToMarketChangePct ?? "",
    homesSoldCount: row.homesSoldCount?.toString() ?? "",
    homesSoldChangePct: row.homesSoldChangePct ?? "",
    avgDom: row.avgDom?.toString() ?? "",
    domChangePct: row.domChangePct ?? "",
    avgHomePrice: row.avgHomePrice ?? "",
    avgHomePriceChangePct: row.avgHomePriceChangePct ?? "",
    avgSoldPrice: row.avgSoldPrice ?? "",
    avgSoldPriceChangePct: row.avgSoldPriceChangePct ?? "",
    pricePerSqFt: row.pricePerSqFt ?? "",
    pricePerSqFtChangePct: row.pricePerSqFtChangePct ?? "",
    priceReductionsCount: row.priceReductionsCount?.toString() ?? "",
    priceReductionsChangePct: row.priceReductionsChangePct ?? "",
    soldToListedRatio: row.soldToListedRatio ?? "",
    soldToListedChangePct: row.soldToListedChangePct ?? "",
  };
}

function MetricField({
  name,
  label,
  value,
  onChange,
  error,
  type = "text",
}: {
  name: keyof FormValues;
  label: string;
  value: string;
  onChange: (name: keyof FormValues, value: string) => void;
  error?: string;
  type?: string;
}) {
  return (
    <Grid size={{ xs: 12, sm: 6 }}>
      <TextField
        name={name}
        label={label}
        size="small"
        fullWidth
        type={type}
        value={value}
        onChange={(e) => onChange(name, e.target.value)}
        error={Boolean(error)}
        helperText={error}
        sx={inputSx}
        slotProps={type === "number" ? { htmlInput: { step: "any" } } : undefined}
      />
    </Grid>
  );
}

function MarketDataFormFields({
  values,
  onChange,
  fieldErrors,
}: {
  values: FormValues;
  onChange: (name: keyof FormValues, value: string) => void;
  fieldErrors?: Record<string, string>;
}) {
  return (
    <Grid container spacing={2}>
      <Grid size={{ xs: 12, sm: 6 }}>
        <TextField
          name="city"
          label="City"
          size="small"
          fullWidth
          required
          value={values.city}
          onChange={(e) => onChange("city", e.target.value)}
          error={Boolean(fieldErrors?.city)}
          helperText={fieldErrors?.city}
          sx={inputSx}
        />
      </Grid>
      <Grid size={{ xs: 12, sm: 6 }}>
        <TextField
          name="reportDate"
          label="Report date"
          size="small"
          fullWidth
          required
          type="date"
          value={values.reportDate}
          onChange={(e) => onChange("reportDate", e.target.value)}
          error={Boolean(fieldErrors?.reportDate)}
          helperText={fieldErrors?.reportDate}
          sx={inputSx}
          slotProps={{ inputLabel: { shrink: true } }}
        />
      </Grid>
      <MetricField
        name="homesForSale"
        label="Homes for sale"
        value={values.homesForSale}
        onChange={onChange}
        error={fieldErrors?.homesForSale}
        type="number"
      />
      <MetricField
        name="homesForSaleChangePct"
        label="Homes for sale change %"
        value={values.homesForSaleChangePct}
        onChange={onChange}
        error={fieldErrors?.homesForSaleChangePct}
        type="number"
      />
      <MetricField
        name="newToMarket"
        label="New to market"
        value={values.newToMarket}
        onChange={onChange}
        error={fieldErrors?.newToMarket}
        type="number"
      />
      <MetricField
        name="newToMarketChangePct"
        label="New to market change %"
        value={values.newToMarketChangePct}
        onChange={onChange}
        error={fieldErrors?.newToMarketChangePct}
        type="number"
      />
      <MetricField
        name="homesSoldCount"
        label="Homes sold"
        value={values.homesSoldCount}
        onChange={onChange}
        error={fieldErrors?.homesSoldCount}
        type="number"
      />
      <MetricField
        name="homesSoldChangePct"
        label="Homes sold change %"
        value={values.homesSoldChangePct}
        onChange={onChange}
        error={fieldErrors?.homesSoldChangePct}
        type="number"
      />
      <MetricField
        name="avgDom"
        label="Avg DOM"
        value={values.avgDom}
        onChange={onChange}
        error={fieldErrors?.avgDom}
        type="number"
      />
      <MetricField
        name="domChangePct"
        label="DOM change %"
        value={values.domChangePct}
        onChange={onChange}
        error={fieldErrors?.domChangePct}
        type="number"
      />
      <MetricField
        name="avgHomePrice"
        label="Avg home price"
        value={values.avgHomePrice}
        onChange={onChange}
        error={fieldErrors?.avgHomePrice}
        type="number"
      />
      <MetricField
        name="avgHomePriceChangePct"
        label="Avg home price change %"
        value={values.avgHomePriceChangePct}
        onChange={onChange}
        error={fieldErrors?.avgHomePriceChangePct}
        type="number"
      />
      <MetricField
        name="avgSoldPrice"
        label="Avg sold price"
        value={values.avgSoldPrice}
        onChange={onChange}
        error={fieldErrors?.avgSoldPrice}
        type="number"
      />
      <MetricField
        name="avgSoldPriceChangePct"
        label="Avg sold price change %"
        value={values.avgSoldPriceChangePct}
        onChange={onChange}
        error={fieldErrors?.avgSoldPriceChangePct}
        type="number"
      />
      <MetricField
        name="pricePerSqFt"
        label="Price per sq ft"
        value={values.pricePerSqFt}
        onChange={onChange}
        error={fieldErrors?.pricePerSqFt}
        type="number"
      />
      <MetricField
        name="pricePerSqFtChangePct"
        label="Price per sq ft change %"
        value={values.pricePerSqFtChangePct}
        onChange={onChange}
        error={fieldErrors?.pricePerSqFtChangePct}
        type="number"
      />
      <MetricField
        name="priceReductionsCount"
        label="Price reductions"
        value={values.priceReductionsCount}
        onChange={onChange}
        error={fieldErrors?.priceReductionsCount}
        type="number"
      />
      <MetricField
        name="priceReductionsChangePct"
        label="Price reductions change %"
        value={values.priceReductionsChangePct}
        onChange={onChange}
        error={fieldErrors?.priceReductionsChangePct}
        type="number"
      />
      <MetricField
        name="soldToListedRatio"
        label="Sold-to-listed ratio"
        value={values.soldToListedRatio}
        onChange={onChange}
        error={fieldErrors?.soldToListedRatio}
      />
      <MetricField
        name="soldToListedChangePct"
        label="Sold-to-listed change %"
        value={values.soldToListedChangePct}
        onChange={onChange}
        error={fieldErrors?.soldToListedChangePct}
        type="number"
      />
    </Grid>
  );
}

export default function MarketDataAdmin({
  rows,
  cities,
  reportDates,
  currentWeekDate,
  selectedCity,
  selectedReportDate,
}: MarketDataAdminProps) {
  const router = useRouter();
  const [createOpen, setCreateOpen] = useState(false);
  const [editRow, setEditRow] = useState<MarketDataAdminRow | null>(null);
  const [createValues, setCreateValues] = useState(() =>
    emptyForm({ city: selectedCity, reportDate: selectedReportDate }),
  );
  const [editValues, setEditValues] = useState<FormValues>(emptyForm());
  const [message, setMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const [createState, createAction, createPending] = useActionState(
    createMarketDataAction,
    initialState,
  );
  const [editState, editAction, editPending] = useActionState(
    updateMarketDataAction,
    initialState,
  );

  useEffect(() => {
    if (createState.success) {
      setCreateOpen(false);
      setCreateValues(emptyForm({ city: selectedCity, reportDate: selectedReportDate }));
      setMessage(createState.success);
      router.refresh();
    }
  }, [createState.success, router, selectedCity, selectedReportDate]);

  useEffect(() => {
    if (editState.success) {
      setEditRow(null);
      setMessage(editState.success);
      router.refresh();
    }
  }, [editState.success, router]);

  function updateFilter(city: string, reportDate: string) {
    const params = new URLSearchParams();
    if (city) params.set("city", city);
    if (reportDate) params.set("reportDate", reportDate);
    const qs = params.toString();
    router.push(qs ? `/crm/market-data?${qs}` : "/crm/market-data");
  }

  function handleCreateChange(name: keyof FormValues, value: string) {
    setCreateValues((prev) => ({ ...prev, [name]: value }));
  }

  function handleEditChange(name: keyof FormValues, value: string) {
    setEditValues((prev) => ({ ...prev, [name]: value }));
  }

  function openEdit(row: MarketDataAdminRow) {
    setEditRow(row);
    setEditValues(rowToForm(row));
  }

  function handleClearOverride(id: string) {
    startTransition(async () => {
      setMessage(null);
      const result = await clearMarketDataOverrideAction(id);
      setMessage(result.error ?? result.success ?? null);
      if (!result.error) {
        setEditRow(null);
        router.refresh();
      }
    });
  }

  return (
    <Stack spacing={3}>
      {message ? (
        <Alert
          severity={message.toLowerCase().includes("not") || message.toLowerCase().includes("cannot") || message.toLowerCase().includes("missing") ? "error" : "success"}
          onClose={() => setMessage(null)}
        >
          {message}
        </Alert>
      ) : null}

      <Paper
        elevation={0}
        sx={{ p: 2, border: "1px solid", borderColor: "divider" }}
      >
        <Stack
          direction={{ xs: "column", sm: "row" }}
          spacing={2}
          sx={{ alignItems: { sm: "center" }, justifyContent: "space-between" }}
        >
          <Stack direction={{ xs: "column", sm: "row" }} spacing={2} sx={{ flex: 1 }}>
            <FormControl size="small" sx={{ minWidth: 180 }}>
              <InputLabel id="market-city-filter">City</InputLabel>
              <Select
                labelId="market-city-filter"
                label="City"
                value={selectedCity}
                onChange={(e) => updateFilter(e.target.value, selectedReportDate)}
              >
                <MenuItem value="">All cities</MenuItem>
                {cities.map((city) => (
                  <MenuItem key={city} value={city}>
                    {city}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl size="small" sx={{ minWidth: 180 }}>
              <InputLabel id="market-date-filter">Report week</InputLabel>
              <Select
                labelId="market-date-filter"
                label="Report week"
                value={selectedReportDate}
                onChange={(e) => updateFilter(selectedCity, e.target.value)}
              >
                <MenuItem value="">All weeks</MenuItem>
                {reportDates.map((date) => (
                  <MenuItem key={date} value={date}>
                    <Stack
                      direction="row"
                      spacing={1}
                      sx={{ alignItems: "center", width: "100%" }}
                    >
                      <span>{date}</span>
                      {date === currentWeekDate ? (
                        <Chip size="small" color="primary" label="Current" />
                      ) : null}
                    </Stack>
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            {currentWeekDate ? (
              <Chip
                size="small"
                color="primary"
                variant="outlined"
                label={`Current week · ${currentWeekDate}`}
                onClick={() => updateFilter(selectedCity, currentWeekDate)}
                sx={{ alignSelf: { xs: "flex-start", sm: "center" } }}
              />
            ) : null}
          </Stack>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => {
              setCreateValues(
                emptyForm({ city: selectedCity, reportDate: selectedReportDate }),
              );
              setCreateOpen(true);
            }}
          >
            Add city / week
          </Button>
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
              <TableCell>City</TableCell>
              <TableCell>Report date</TableCell>
              <TableCell align="right">For sale</TableCell>
              <TableCell align="right">Sold</TableCell>
              <TableCell align="right">Avg DOM</TableCell>
              <TableCell align="right">Avg sold</TableCell>
              <TableCell>Status</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8}>
                  <Typography color="text.secondary">
                    No market data rows match these filters.
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              rows.map((row) => (
                <TableRow key={row.id} hover>
                  <TableCell>{row.city}</TableCell>
                  <TableCell>
                    <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
                      <span>{row.reportDate}</span>
                      {row.reportDate === currentWeekDate ? (
                        <Chip size="small" color="primary" label="Current week" />
                      ) : null}
                    </Stack>
                  </TableCell>
                  <TableCell align="right">{row.homesForSale ?? "—"}</TableCell>
                  <TableCell align="right">{row.homesSoldCount ?? "—"}</TableCell>
                  <TableCell align="right">{row.avgDom ?? "—"}</TableCell>
                  <TableCell align="right">
                    {formatCurrency(row.avgSoldPrice)}
                  </TableCell>
                  <TableCell>
                    {row.isManualOverride ? (
                      <Chip size="small" color="warning" label="Override" />
                    ) : (
                      <Chip size="small" variant="outlined" label="Synced" />
                    )}
                  </TableCell>
                  <TableCell align="right">
                    <IconButton
                      aria-label={`Edit ${row.city}`}
                      onClick={() => openEdit(row)}
                      size="small"
                    >
                      <EditOutlinedIcon fontSize="small" />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        fullWidth
        maxWidth="md"
      >
        <DialogTitle sx={{ pr: 6 }}>
          Add market data
          <IconButton
            aria-label="Close"
            onClick={() => setCreateOpen(false)}
            sx={{ position: "absolute", right: 8, top: 8 }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <Box component="form" action={createAction}>
          <DialogContent dividers>
            <Stack spacing={2}>
              {createState.error ? (
                <Alert severity="error">{createState.error}</Alert>
              ) : null}
              <Typography variant="body2" color="text.secondary">
                New rows are saved as manual overrides and will not be overwritten by
                Airtable sync.
              </Typography>
              <MarketDataFormFields
                values={createValues}
                onChange={handleCreateChange}
                fieldErrors={createState.fieldErrors}
              />
            </Stack>
          </DialogContent>
          <DialogActions sx={{ px: 3, py: 2 }}>
            <Button onClick={() => setCreateOpen(false)}>Cancel</Button>
            <Button type="submit" variant="contained" disabled={createPending}>
              {createPending ? "Saving…" : "Create"}
            </Button>
          </DialogActions>
        </Box>
      </Dialog>

      <Dialog
        open={Boolean(editRow)}
        onClose={() => setEditRow(null)}
        fullWidth
        maxWidth="md"
      >
        <DialogTitle sx={{ pr: 6 }}>
          Edit {editRow?.city ?? "market data"}
          <IconButton
            aria-label="Close"
            onClick={() => setEditRow(null)}
            sx={{ position: "absolute", right: 8, top: 8 }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <Box component="form" action={editAction}>
          <input type="hidden" name="id" value={editValues.id ?? ""} />
          <DialogContent dividers>
            <Stack spacing={2}>
              {editState.error ? (
                <Alert severity="error">{editState.error}</Alert>
              ) : null}
              {editRow?.isManualOverride ? (
                <Alert severity="warning">
                  This row is locked as a manual override. Airtable sync will skip it
                  until you clear the override.
                </Alert>
              ) : (
                <Alert severity="info">
                  Saving edits will lock this row so Airtable sync cannot overwrite it.
                </Alert>
              )}
              <MarketDataFormFields
                values={editValues}
                onChange={handleEditChange}
                fieldErrors={editState.fieldErrors}
              />
            </Stack>
          </DialogContent>
          <DialogActions sx={{ px: 3, py: 2, justifyContent: "space-between" }}>
            <Box>
              {editRow?.isManualOverride ? (
                <Button
                  color="warning"
                  disabled={isPending}
                  onClick={() => editRow && handleClearOverride(editRow.id)}
                >
                  {isPending ? "Clearing…" : "Clear override"}
                </Button>
              ) : null}
            </Box>
            <Stack direction="row" spacing={1}>
              <Button onClick={() => setEditRow(null)}>Cancel</Button>
              <Button type="submit" variant="contained" disabled={editPending}>
                {editPending ? "Saving…" : "Save"}
              </Button>
            </Stack>
          </DialogActions>
        </Box>
      </Dialog>
    </Stack>
  );
}
