import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";

type AccountEmptyStateProps = {
  title: string;
  description: string;
  hint?: string;
};

export default function AccountEmptyState({
  title,
  description,
  hint,
}: AccountEmptyStateProps) {
  return (
    <Paper
      variant="outlined"
      sx={{
        p: { xs: 3, sm: 4 },
        borderRadius: 2,
        backgroundColor: "background.paper",
      }}
    >
      <Stack spacing={1}>
        <Typography variant="h6">{title}</Typography>
        <Typography color="text.secondary">{description}</Typography>
        {hint ? (
          <Typography variant="body2" color="text.secondary">
            {hint}
          </Typography>
        ) : null}
      </Stack>
    </Paper>
  );
}
