"use client";

import { useActionState, useEffect, useState } from "react";
import CheckCircleOutlinedIcon from "@mui/icons-material/CheckCircleOutlined";
import AccessTimeOutlinedIcon from "@mui/icons-material/AccessTimeOutlined";
import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import CircularProgress from "@mui/material/CircularProgress";
import Divider from "@mui/material/Divider";
import Grid from "@mui/material/Grid";
import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import { StaticDatePicker } from "@mui/x-date-pickers/StaticDatePicker";
import dayjs, { type Dayjs } from "dayjs";
import {
  formatCallDateForEmail,
  getCallSlotTime,
} from "@/lib/consumer/call-datetime";
import {
  getCallAvailabilityAction,
  scheduleOnboardingCallAction,
} from "@/lib/consumer/onboarding-actions";
import {
  CALL_TIME_SLOTS,
  formatSelectedSlot,
  formatTimeLabel,
  type CallTimeSlot,
} from "@/lib/consumer/call-time-slots";

type OnboardingCallFormProps = {
  listingId: string;
  address: string;
  city: string;
  title: string;
  description: string;
  scheduledCallAt: Date | null;
  callNotes: string | null;
  actions?: React.ReactNode;
};

export default function OnboardingCallForm({
  listingId,
  address,
  city,
  title,
  description,
  scheduledCallAt,
  callNotes: existingNotes,
  actions,
}: OnboardingCallFormProps) {
  const [state, formAction, pending] = useActionState(scheduleOnboardingCallAction, {});
  const [selectedDate, setSelectedDate] = useState<Dayjs | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [availableSlots, setAvailableSlots] = useState<CallTimeSlot[]>([...CALL_TIME_SLOTS]);
  const [loadingSlots, setLoadingSlots] = useState(false);

  useEffect(() => {
    if (!selectedDate) {
      setAvailableSlots([...CALL_TIME_SLOTS]);
      return;
    }

    let cancelled = false;
    const dateStr = selectedDate.format("YYYY-MM-DD");

    setLoadingSlots(true);
    void getCallAvailabilityAction(dateStr).then((result) => {
      if (cancelled) return;
      setAvailableSlots(result.slots);
      setLoadingSlots(false);
    });

    return () => {
      cancelled = true;
    };
  }, [selectedDate]);

  useEffect(() => {
    if (selectedTime && !availableSlots.includes(selectedTime as CallTimeSlot)) {
      setSelectedTime(null);
    }
  }, [availableSlots, selectedTime]);

  const availableSlotSet = new Set(availableSlots);

  const handleDateChange = (date: Dayjs | null) => {
    setSelectedDate(date);
  };

  if (scheduledCallAt) {
    const confirmedSlot = getCallSlotTime(scheduledCallAt);

    return (
      <Stack spacing={4}>
        <Grid container spacing={{ xs: 4, md: 6 }} sx={{ alignItems: "flex-start" }}>
          <Grid size={{ xs: 12, md: 5 }}>
            <CallContextPanel
              address={address}
              city={city}
              title={title}
              description={description}
              selectedDate={dayjs(scheduledCallAt)}
              selectedTime={confirmedSlot}
              confirmed
            />
          </Grid>
          <Grid size={{ xs: 12, md: 7 }}>
            <Paper variant="outlined" sx={{ p: { xs: 2.5, md: 3 } }}>
              <Alert severity="success" icon={<CheckCircleOutlinedIcon />}>
                Call requested for {formatCallDateForEmail(scheduledCallAt)}. We&apos;ll confirm
                by email.
                {existingNotes ? (
                  <Typography variant="body2" sx={{ mt: 1 }}>
                    Your notes: {existingNotes}
                  </Typography>
                ) : null}
              </Alert>
            </Paper>
          </Grid>
        </Grid>
        {actions}
      </Stack>
    );
  }

  return (
    <Stack spacing={4}>
      <Box component="form" action={formAction}>
        <input type="hidden" name="listingId" value={listingId} />
        <input
          type="hidden"
          name="callDate"
          value={selectedDate ? selectedDate.format("YYYY-MM-DD") : ""}
        />
        <input type="hidden" name="callTime" value={selectedTime ?? ""} />

        <Grid container spacing={{ xs: 4, md: 6 }} sx={{ alignItems: "flex-start" }}>
          <Grid size={{ xs: 12, md: 5 }}>
            <CallContextPanel
              address={address}
              city={city}
              title={title}
              description={description}
              selectedDate={selectedDate}
              selectedTime={selectedTime}
            />
          </Grid>

          <Grid size={{ xs: 12, md: 7 }}>
            <Paper
              variant="outlined"
              sx={{
                overflow: "hidden",
                bgcolor: "background.paper",
              }}
            >
              {state.error ? (
                <Alert severity="error" sx={{ borderRadius: 0 }}>
                  {state.error}
                </Alert>
              ) : null}

              <Box
                sx={{
                  display: "grid",
                  gridTemplateColumns: { xs: "1fr", sm: "auto 1fr" },
                  alignItems: { sm: "start" },
                }}
              >
                <Box sx={{ pt: 1, pl: { xs: 0, sm: 1 }, justifySelf: { sm: "start" } }}>
                  <StaticDatePicker
                    displayStaticWrapperAs="desktop"
                    disablePast
                    value={selectedDate}
                    onChange={handleDateChange}
                    slotProps={{
                      actionBar: { actions: [] },
                      toolbar: { hidden: true },
                    }}
                    sx={{
                      width: 320,
                      maxWidth: "100%",
                      "& .MuiPickersCalendarHeader-root": {
                        px: 1,
                      },
                    }}
                  />

                  {state.fieldErrors?.callDate ? (
                    <Typography variant="caption" color="error" sx={{ px: 2, display: "block" }}>
                      {state.fieldErrors.callDate}
                    </Typography>
                  ) : null}
                </Box>

                <Box
                  sx={{
                    minWidth: { sm: 200 },
                    borderTop: { xs: 1, sm: 0 },
                    borderLeft: { xs: 0, sm: 1 },
                    borderColor: "divider",
                    px: { xs: 2.5, sm: 2.5 },
                    py: { xs: 2.5, sm: 2 },
                    maxHeight: { xs: "none", sm: 380 },
                    overflowY: { xs: "visible", sm: "auto" },
                  }}
                >
                  <Stack spacing={1.5}>
                    <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
                      <AccessTimeOutlinedIcon fontSize="small" color="action" />
                      <Typography variant="subtitle2">Time</Typography>
                      {loadingSlots ? <CircularProgress size={14} /> : null}
                    </Stack>
                    <Typography variant="caption" color="text.secondary">
                      Mountain Time
                    </Typography>

                    {!selectedDate ? (
                      <Typography variant="body2" color="text.secondary">
                        Select a date to see available times.
                      </Typography>
                    ) : selectedDate && availableSlots.length === 0 ? (
                      <Typography variant="body2" color="text.secondary">
                        No times available on this date. Please choose another date.
                      </Typography>
                    ) : (
                      <Stack spacing={0.75}>
                        {CALL_TIME_SLOTS.map((slot) => {
                          const isSelected = selectedTime === slot;
                          const isDisabled = Boolean(selectedDate && !availableSlotSet.has(slot));

                          return (
                            <Button
                              key={slot}
                              type="button"
                              fullWidth
                              variant={isSelected ? "contained" : "outlined"}
                              disabled={isDisabled || loadingSlots}
                              onClick={() => setSelectedTime(slot)}
                              sx={{
                                py: 0.875,
                                px: 1.5,
                                minWidth: 0,
                                borderColor: "divider",
                                fontSize: "0.875rem",
                                ...(isSelected
                                  ? {}
                                  : {
                                      color: "text.primary",
                                      "&:hover:not(:disabled)": {
                                        borderColor: "primary.main",
                                        bgcolor: "primary.light",
                                      },
                                    }),
                              }}
                            >
                              {formatTimeLabel(slot)}
                            </Button>
                          );
                        })}
                      </Stack>
                    )}

                    {state.fieldErrors?.callTime ? (
                      <Typography variant="caption" color="error">
                        {state.fieldErrors.callTime}
                      </Typography>
                    ) : null}
                  </Stack>
                </Box>
              </Box>

              <Divider />

              <Box sx={{ p: { xs: 2.5, md: 3 } }}>
                <Stack spacing={3}>
                  <TextField
                    name="callNotes"
                    label="Notes (optional)"
                    multiline
                    minRows={3}
                    fullWidth
                    placeholder="Anything you'd like us to know before the call?"
                  />

                  <Stack direction="row" spacing={2} sx={{ justifyContent: "flex-end" }}>
                    <Button
                      type="submit"
                      variant="contained"
                      disabled={pending || !selectedDate || !selectedTime || loadingSlots}
                    >
                      {pending ? "Saving…" : "Request call"}
                    </Button>
                  </Stack>
                </Stack>
              </Box>
            </Paper>
          </Grid>
        </Grid>
      </Box>
      {actions}
    </Stack>
  );
}

type CallContextPanelProps = {
  address: string;
  city: string;
  title: string;
  description: string;
  selectedDate: Dayjs | null;
  selectedTime: string | null;
  confirmed?: boolean;
};

function CallContextPanel({
  address,
  city,
  title,
  description,
  selectedDate,
  selectedTime,
  confirmed = false,
}: CallContextPanelProps) {
  const hasSelection = selectedDate && selectedTime;

  return (
    <Stack spacing={3}>
      <Stack spacing={1}>
        <Typography variant="overline" color="text.secondary">
          {address}, {city}
        </Typography>
        <Typography variant="h1" sx={{ fontSize: { xs: "2rem", md: "2.5rem" } }}>
          {title}
        </Typography>
        <Typography color="text.secondary">{description}</Typography>
      </Stack>

      <Stack spacing={0.5}>
        <Typography variant="body2" color="text.secondary">
          Onboarding call · 30 min · Mountain Time
        </Typography>
        <Typography variant="body2" color="text.secondary">
          We&apos;ll confirm by email.
        </Typography>
      </Stack>

      {hasSelection ? (
        <Stack
          direction="row"
          spacing={1.5}
          sx={{
            alignItems: "flex-start",
            p: 2,
            borderRadius: 2,
            bgcolor: confirmed ? "primary.light" : "background.paper",
            border: "1px solid",
            borderColor: confirmed ? "primary.main" : "divider",
          }}
        >
          <CheckCircleOutlinedIcon
            fontSize="small"
            color={confirmed ? "primary" : "action"}
            sx={{ mt: 0.25 }}
          />
          <Stack spacing={0.25}>
            <Typography variant="subtitle2">
              {confirmed ? "Call requested" : "Your selection"}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {formatSelectedSlot(selectedDate, selectedTime)}
            </Typography>
          </Stack>
        </Stack>
      ) : null}
    </Stack>
  );
}
