import Link from "next/link";
import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Typography from "@mui/material/Typography";
import CrmPageHeader from "@/components/crm/CrmPageHeader";
import { auth } from "@/lib/auth/admin-auth";
import { requireCrmUser } from "@/lib/crm/access";
import { formatCallTimeOnly } from "@/lib/consumer/call-datetime";
import {
  getUpcomingCalls,
  groupUpcomingCallsByDay,
} from "@/lib/crm/call-queries";

export default async function CrmUpcomingCallsPage() {
  const session = await auth();
  const user = requireCrmUser(session);
  const calls = await getUpcomingCalls(user, { days: 14 });
  const groupedCalls = groupUpcomingCallsByDay(calls);

  return (
    <>
      <CrmPageHeader
        title="Upcoming calls"
        description="Scheduled seller onboarding calls for the next 14 days."
      />

      {groupedCalls.length === 0 ? (
        <Paper
          elevation={0}
          sx={{
            p: { xs: 3, sm: 4 },
            border: "1px dashed",
            borderColor: "divider",
          }}
        >
          <Typography variant="h6" sx={{ mb: 1 }}>
            No upcoming calls scheduled
          </Typography>
          <Typography color="text.secondary">
            When sellers schedule onboarding calls, they will appear here grouped by day.
          </Typography>
        </Paper>
      ) : (
        <Stack spacing={3}>
          {groupedCalls.map((group) => (
            <Stack key={group.dateKey} spacing={1.5}>
              <Typography variant="h6" sx={{ fontSize: "1.1rem" }}>
                {group.dateLabel}
              </Typography>
              <TableContainer
                component={Paper}
                elevation={0}
                sx={{ border: "1px solid", borderColor: "divider" }}
              >
                <Table size="medium">
                  <TableHead>
                    <TableRow>
                      <TableCell>Time</TableCell>
                      <TableCell>Property</TableCell>
                      <TableCell>Seller</TableCell>
                      <TableCell>Agent</TableCell>
                      <TableCell>Notes</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {group.calls.map((call) => (
                      <TableRow key={call.id} hover>
                        <TableCell sx={{ whiteSpace: "nowrap" }}>
                          {formatCallTimeOnly(call.scheduledCallAt)}
                        </TableCell>
                        <TableCell>
                          <Link
                            href={`/crm/listings/${call.id}`}
                            style={{ textDecoration: "none", color: "inherit" }}
                          >
                            <Typography sx={{ fontWeight: 600 }}>{call.address}</Typography>
                          </Link>
                          <Typography variant="body2" color="text.secondary">
                            {call.city}, {call.state}
                          </Typography>
                        </TableCell>
                        <TableCell>{call.sellerName}</TableCell>
                        <TableCell>
                          <Typography variant="body2" color="text.secondary">
                            {call.assignedAgentName ?? "Unassigned"}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography
                            variant="body2"
                            color="text.secondary"
                            sx={{
                              maxWidth: 240,
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              whiteSpace: "nowrap",
                            }}
                          >
                            {call.callNotes ?? "—"}
                          </Typography>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Stack>
          ))}
        </Stack>
      )}
    </>
  );
}
