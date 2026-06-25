import Box from "@mui/material/Box";
import Grid from "@mui/material/Grid";
import Link from "@mui/material/Link";
import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import type { ConsumerClosingTeamMember } from "@/types/consumer-listing-detail";

type ClosingTeamCardsProps = {
  escrowOfficer: ConsumerClosingTeamMember | null;
  transactionCoordinator: ConsumerClosingTeamMember | null;
};

function TeamMemberCard({
  title,
  member,
}: {
  title: string;
  member: ConsumerClosingTeamMember;
}) {
  return (
    <Paper variant="outlined" sx={{ p: 2.5, borderRadius: 2, height: "100%" }}>
      <Stack spacing={1}>
        <Typography variant="overline" color="text.secondary">
          {title}
        </Typography>
        <Typography variant="h6" sx={{ fontSize: "1rem", fontWeight: 700 }}>
          {member.name}
        </Typography>
        {member.company ? (
          <Typography variant="body2" color="text.secondary">
            {member.company}
          </Typography>
        ) : null}
        {member.phone ? (
          <Link href={`tel:${member.phone.replace(/\D/g, "")}`} underline="hover">
            {member.phone}
          </Link>
        ) : null}
        {member.email ? (
          <Link href={`mailto:${member.email}`} underline="hover">
            {member.email}
          </Link>
        ) : null}
        {member.website ? (
          <Link href={member.website} target="_blank" rel="noopener noreferrer" underline="hover">
            Website
          </Link>
        ) : null}
      </Stack>
    </Paper>
  );
}

export default function ClosingTeamCards({
  escrowOfficer,
  transactionCoordinator,
}: ClosingTeamCardsProps) {
  if (!escrowOfficer && !transactionCoordinator) {
    return (
      <Typography variant="body2" color="text.secondary">
        Closing team contacts will appear here once your listing is under contract.
      </Typography>
    );
  }

  return (
    <Box>
      <Typography variant="h6" sx={{ mb: 2 }}>
        Closing team
      </Typography>
      <Grid container spacing={2}>
        {escrowOfficer ? (
          <Grid size={{ xs: 12, md: 6 }}>
            <TeamMemberCard title="Title / escrow officer" member={escrowOfficer} />
          </Grid>
        ) : null}
        {transactionCoordinator ? (
          <Grid size={{ xs: 12, md: 6 }}>
            <TeamMemberCard title="Transaction coordinator" member={transactionCoordinator} />
          </Grid>
        ) : null}
      </Grid>
    </Box>
  );
}
