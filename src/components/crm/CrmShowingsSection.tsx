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
import { formatAccountDate, formatDateInputValue } from "@/lib/consumer/format-date";
import { getMostRecentSunday } from "@/lib/crm/manual-entry-utils";
import {
  deleteShowingAction,
  saveShowingAction,
  type CrmShowingActionState,
} from "@/lib/crm/showing-actions";
import type { CrmShowingRow } from "@/lib/crm/showing-queries";

type CrmShowingsSectionProps = {
  listingId: string;
  listingAddress: string;
  showings: CrmShowingRow[];
};

const initialState: CrmShowingActionState = {};

type ShowingFormState = {
  showingId: string;
  showingDate: string;
  showingTime: string;
  showingLabel: string;
  buyersAgent: string;
  feedback: string;
};

function emptyForm(): ShowingFormState {
  return {
    showingId: "",
    showingDate: formatDateInputValue(new Date()),
    showingTime: "",
    showingLabel: "",
    buyersAgent: "",
    feedback: "",
  };
}

function formFromShowing(showing: CrmShowingRow): ShowingFormState {
  return {
    showingId: showing.id,
    showingDate: formatDateInputValue(showing.showingDate),
    showingTime: showing.showingTime ?? "",
    showingLabel: showing.showingLabel ?? "",
    buyersAgent: showing.buyersAgent ?? "",
    feedback: showing.feedback ?? "",
  };
}

export default function CrmShowingsSection({
  listingId,
  listingAddress,
  showings,
}: CrmShowingsSectionProps) {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<ShowingFormState>(emptyForm);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [state, formAction, pending] = useActionState(saveShowingAction, initialState);

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

  const openEdit = (showing: CrmShowingRow) => {
    setForm(formFromShowing(showing));
    setDeleteError(null);
    setOpen(true);
  };

  const handleClose = () => {
    if (!pending) setOpen(false);
  };

  const handleDelete = async (showingId: string) => {
    setDeleteError(null);
    const result = await deleteShowingAction(listingId, showingId);
    if (result.error) {
      setDeleteError(result.error);
      return;
    }
    setOpen(false);
  };

  return (
    <Paper elevation={0} sx={{ p: 2.5, border: "1px solid", borderColor: "divider" }}>
      <Stack spacing={2}>
        <Stack direction="row" spacing={2} sx={{ alignItems: "center", justifyContent: "space-between" }}>
          <Box>
            <Typography variant="h6">Showings</Typography>
            <Typography variant="body2" color="text.secondary">
              Manual entry for {listingAddress}
            </Typography>
          </Box>
          <Button size="small" variant="outlined" onClick={openCreate}>
            Add showing
          </Button>
        </Stack>

        {deleteError ? <Alert severity="error">{deleteError}</Alert> : null}

        {showings.length === 0 ? (
          <Typography variant="body2" color="text.secondary">
            No showings recorded yet.
          </Typography>
        ) : (
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Date</TableCell>
                  <TableCell>Time</TableCell>
                  <TableCell>Agent</TableCell>
                  <TableCell>Feedback</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {showings.map((showing) => (
                  <TableRow key={showing.id}>
                    <TableCell>{formatAccountDate(showing.showingDate)}</TableCell>
                    <TableCell>{showing.showingTime ?? showing.showingLabel ?? "—"}</TableCell>
                    <TableCell>{showing.buyersAgent ?? "—"}</TableCell>
                    <TableCell sx={{ maxWidth: 240 }}>
                      {showing.feedback ? (
                        <Typography variant="body2" noWrap>
                          {showing.feedback}
                        </Typography>
                      ) : (
                        "—"
                      )}
                    </TableCell>
                    <TableCell align="right">
                      <IconButton size="small" aria-label="Edit showing" onClick={() => openEdit(showing)}>
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

      <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogTitle>{form.showingId ? "Edit showing" : "Add showing"}</DialogTitle>
        <Box component="form" action={formAction}>
          <input type="hidden" name="listingId" value={listingId} />
          {form.showingId ? <input type="hidden" name="showingId" value={form.showingId} /> : null}
          <DialogContent>
            <Stack spacing={2} sx={{ pt: 1 }}>
              <Typography variant="body2" color="text.secondary">
                {listingAddress}
              </Typography>
              <TextField
                label="Showing date"
                name="showingDate"
                type="date"
                value={form.showingDate}
                onChange={(event) => setForm((prev) => ({ ...prev, showingDate: event.target.value }))}
                slotProps={{ inputLabel: { shrink: true } }}
                required
                fullWidth
              />
              <TextField
                label="Showing time"
                name="showingTime"
                value={form.showingTime}
                onChange={(event) => setForm((prev) => ({ ...prev, showingTime: event.target.value }))}
                fullWidth
              />
              <TextField
                label="Label"
                name="showingLabel"
                value={form.showingLabel}
                onChange={(event) => setForm((prev) => ({ ...prev, showingLabel: event.target.value }))}
                fullWidth
              />
              <TextField
                label="Buyer's agent"
                name="buyersAgent"
                value={form.buyersAgent}
                onChange={(event) => setForm((prev) => ({ ...prev, buyersAgent: event.target.value }))}
                fullWidth
              />
              <TextField
                label="Feedback"
                name="feedback"
                value={form.feedback}
                onChange={(event) => setForm((prev) => ({ ...prev, feedback: event.target.value }))}
                multiline
                minRows={3}
                fullWidth
              />
              {state.error ? <Alert severity="error">{state.error}</Alert> : null}
            </Stack>
          </DialogContent>
          <DialogActions sx={{ justifyContent: "space-between", px: 3, pb: 2 }}>
            <Box>
              {form.showingId ? (
                <Button
                  color="error"
                  onClick={() => handleDelete(form.showingId)}
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
                {pending ? "Saving…" : "Save showing"}
              </Button>
            </Stack>
          </DialogActions>
        </Box>
      </Dialog>
    </Paper>
  );
}
