import Box from "@mui/material/Box";
import Grid from "@mui/material/Grid";
import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import AccountEmptyState from "@/components/account/AccountEmptyState";
import AccountShowingsList from "@/components/account/AccountShowingsList";
import ListingBlairNote from "@/components/account/listing-detail/ListingBlairNote";
import { formatAccountDate, formatAccountNumber } from "@/lib/consumer/format-date";
import type { WeeklyReportData } from "@/types/consumer-account-data";

type AccountWeeklyReportProps = {
  report: WeeklyReportData;
  multiListing: boolean;
};

export default function AccountWeeklyReport({ report, multiListing }: AccountWeeklyReportProps) {
  const hasContent =
    report.listings.some((listing) => listing.blairNote) ||
    report.statsByListing.length > 0 ||
    report.recentShowings.length > 0;

  if (!hasContent) {
    return (
      <AccountEmptyState
        title="Your weekly report isn't ready yet"
        description="Once your listing is active, this page will combine Blair's note, web traffic, and recent showing activity."
        hint="Reports typically update weekly after your listing goes live."
      />
    );
  }

  return (
    <Stack spacing={4}>
      {report.listings.map((listing) =>
        listing.blairNote ? (
          <Box key={listing.id}>
            {multiListing ? (
              <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
                {listing.address}, {listing.city}
              </Typography>
            ) : null}
            <ListingBlairNote note={listing.blairNote} noteDate={listing.blairNoteDate} />
          </Box>
        ) : null,
      )}

      {report.statsByListing.length > 0 ? (
        <Paper variant="outlined" sx={{ p: 2.5, borderRadius: 2 }}>
          <Typography variant="h6" sx={{ mb: 2 }}>
            Latest web traffic
          </Typography>
          <Grid container spacing={2}>
            {report.statsByListing.map((stat) => (
              <Grid key={stat.id} size={{ xs: 12, md: 6 }}>
                <Stack spacing={1}>
                  <Typography sx={{ fontWeight: 600 }}>{stat.listingAddress}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Week ending {formatAccountDate(stat.weekEnding)} ·{" "}
                    {formatAccountNumber(stat.listtracTotal30d)} Listtrac views (30d) ·{" "}
                    {formatAccountNumber(stat.lifetimeViews)} lifetime views
                  </Typography>
                </Stack>
              </Grid>
            ))}
          </Grid>
        </Paper>
      ) : null}

      <Box>
        <Typography variant="h6" sx={{ mb: 2 }}>
          Showings this week
        </Typography>
        <AccountShowingsList showings={report.recentShowings} multiListing={multiListing} />
      </Box>
    </Stack>
  );
}
