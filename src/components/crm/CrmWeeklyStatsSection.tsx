"use client";

import { useActionState, useEffect, useState } from "react";
import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import Grid from "@mui/material/Grid";
import IconButton from "@mui/material/IconButton";
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
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import { formatAccountDate, formatAccountNumber, formatDateInputValue } from "@/lib/consumer/format-date";
import { getMostRecentSunday } from "@/lib/crm/manual-entry-utils";
import {
  deleteWeeklyStatAction,
  saveWeeklyStatAction,
  type CrmWeeklyStatActionState,
} from "@/lib/crm/weekly-stat-actions";
import type { CrmWeeklyStatRow } from "@/lib/crm/weekly-stat-queries";

type CrmWeeklyStatsSectionProps = {
  listingId: string;
  listingAddress: string;
  stats: CrmWeeklyStatRow[];
};

const initialState: CrmWeeklyStatActionState = {};

type WeeklyStatFormState = {
  weeklyStatId: string;
  weekEnding: string;
  listtracTotal30d: string;
  ureViews30d: string;
  zillowViews30d: string;
  realtorViews30d: string;
  homesViews30d: string;
  truliaViews30d: string;
  ureFavoritesCumulative: string;
  lifetimeViews: string;
};

function emptyForm(): WeeklyStatFormState {
  return {
    weeklyStatId: "",
    weekEnding: formatDateInputValue(getMostRecentSunday()),
    listtracTotal30d: "",
    ureViews30d: "",
    zillowViews30d: "",
    realtorViews30d: "",
    homesViews30d: "",
    truliaViews30d: "",
    ureFavoritesCumulative: "",
    lifetimeViews: "",
  };
}

function stringify(value: number | null | undefined): string {
  return value == null ? "" : String(value);
}

function formFromStat(stat: CrmWeeklyStatRow): WeeklyStatFormState {
  return {
    weeklyStatId: stat.id,
    weekEnding: formatDateInputValue(stat.weekEnding),
    listtracTotal30d: stringify(stat.listtracTotal30d),
    ureViews30d: stringify(stat.ureViews30d),
    zillowViews30d: stringify(stat.zillowViews30d),
    realtorViews30d: stringify(stat.realtorViews30d),
    homesViews30d: stringify(stat.homesViews30d),
    truliaViews30d: stringify(stat.truliaViews30d),
    ureFavoritesCumulative: stringify(stat.ureFavoritesCumulative),
    lifetimeViews: stringify(stat.lifetimeViews),
  };
}

export default function CrmWeeklyStatsSection({
  listingId,
  listingAddress,
  stats,
}: CrmWeeklyStatsSectionProps) {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<WeeklyStatFormState>(emptyForm);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [state, formAction, pending] = useActionState(saveWeeklyStatAction, initialState);

  useEffect(() => {
    if (state.success) {
      setOpen(false);
    }
  }, [state.success]);

  const openCreate = () => {
    setForm(emptyForm());
    setDeleteError(null);
    setOpen(true);
  };

  const openEdit = (stat: CrmWeeklyStatRow) => {
    setForm(formFromStat(stat));
    setDeleteError(null);
    setOpen(true);
  };

  const handleClose = () => {
    if (!pending) setOpen(false);
  };

  const handleDelete = async (weeklyStatId: string) => {
    setDeleteError(null);
    const result = await deleteWeeklyStatAction(listingId, weeklyStatId);
    if (result.error) {
      setDeleteError(result.error);
      return;
    }
    setOpen(false);
  };

  const updateField = (field: keyof WeeklyStatFormState, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <Paper elevation={0} sx={{ p: 2.5, border: "1px solid", borderColor: "divider" }}>
      <Stack spacing={2}>
        <Stack direction="row" spacing={2} sx={{ alignItems: "center", justifyContent: "space-between" }}>
          <Box>
            <Typography variant="h6">Weekly traffic stats</Typography>
            <Typography variant="body2" color="text.secondary">
              Manual Listtrac entry for {listingAddress}
            </Typography>
          </Box>
          <Button size="small" variant="outlined" onClick={openCreate}>
            Add week
          </Button>
        </Stack>

        {deleteError ? <Alert severity="error">{deleteError}</Alert> : null}

        {stats.length === 0 ? (
          <Typography variant="body2" color="text.secondary">
            No weekly stats recorded yet.
          </Typography>
        ) : (
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Week ending</TableCell>
                  <TableCell>Listtrac total</TableCell>
                  <TableCell>Lifetime views</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {stats.map((stat) => (
                  <TableRow key={stat.id}>
                    <TableCell>{formatAccountDate(stat.weekEnding)}</TableCell>
                    <TableCell>{formatAccountNumber(stat.listtracTotal30d)}</TableCell>
                    <TableCell>{formatAccountNumber(stat.lifetimeViews)}</TableCell>
                    <TableCell align="right">
                      <IconButton size="small" aria-label="Edit weekly stat" onClick={() => openEdit(stat)}>
                        <EditOutlinedIcon fontSize="small" />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Stack>

      <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
        <DialogTitle>{form.weeklyStatId ? "Edit weekly stats" : "Add weekly stats"}</DialogTitle>
        <Box component="form" action={formAction}>
          <input type="hidden" name="listingId" value={listingId} />
          <DialogContent>
            <Stack spacing={2} sx={{ pt: 1 }}>
              <Typography variant="body2" color="text.secondary">
                {listingAddress}
              </Typography>
              <TextField
                label="Week ending"
                name="weekEnding"
                type="date"
                value={form.weekEnding}
                onChange={(event) => updateField("weekEnding", event.target.value)}
                slotProps={{ inputLabel: { shrink: true } }}
                required
                fullWidth
              />
              <Grid container spacing={2}>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    label="Listtrac total (30d)"
                    name="listtracTotal30d"
                    value={form.listtracTotal30d}
                    onChange={(event) => updateField("listtracTotal30d", event.target.value)}
                    fullWidth
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    label="Lifetime views"
                    name="lifetimeViews"
                    value={form.lifetimeViews}
                    onChange={(event) => updateField("lifetimeViews", event.target.value)}
                    fullWidth
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    label="URE views"
                    name="ureViews30d"
                    value={form.ureViews30d}
                    onChange={(event) => updateField("ureViews30d", event.target.value)}
                    fullWidth
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    label="Zillow views"
                    name="zillowViews30d"
                    value={form.zillowViews30d}
                    onChange={(event) => updateField("zillowViews30d", event.target.value)}
                    fullWidth
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    label="Realtor.com views"
                    name="realtorViews30d"
                    value={form.realtorViews30d}
                    onChange={(event) => updateField("realtorViews30d", event.target.value)}
                    fullWidth
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    label="Homes.com views"
                    name="homesViews30d"
                    value={form.homesViews30d}
                    onChange={(event) => updateField("homesViews30d", event.target.value)}
                    fullWidth
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    label="Trulia views"
                    name="truliaViews30d"
                    value={form.truliaViews30d}
                    onChange={(event) => updateField("truliaViews30d", event.target.value)}
                    fullWidth
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    label="URE favorites (cumulative)"
                    name="ureFavoritesCumulative"
                    value={form.ureFavoritesCumulative}
                    onChange={(event) => updateField("ureFavoritesCumulative", event.target.value)}
                    fullWidth
                  />
                </Grid>
              </Grid>
              {state.error ? <Alert severity="error">{state.error}</Alert> : null}
            </Stack>
          </DialogContent>
          <DialogActions sx={{ justifyContent: "space-between", px: 3, pb: 2 }}>
            <Box>
              {form.weeklyStatId ? (
                <Button
                  color="error"
                  onClick={() => handleDelete(form.weeklyStatId)}
                  disabled={pending}
                >
                  Delete
                </Button>
              ) : null}
            </Box>
            <Stack direction="row" spacing={1}>
              <Button onClick={handleClose} disabled={pending}>
                Cancel
              </Button>
              <Button type="submit" variant="contained" disabled={pending}>
                {pending ? "Saving…" : "Save weekly stats"}
              </Button>
            </Stack>
          </DialogActions>
        </Box>
      </Dialog>
    </Paper>
  );
}
