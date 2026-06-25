import Box from "@mui/material/Box";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";

type StatCardProps = {
  label: string;
  value: string | number;
  hint?: string;
};

export default function CrmStatCard({ label, value, hint }: StatCardProps) {
  return (
    <Paper
      elevation={0}
      sx={{
        p: 2.5,
        border: "1px solid",
        borderColor: "divider",
        height: "100%",
      }}
    >
      <Typography variant="overline" color="text.secondary" sx={{ letterSpacing: "0.1em" }}>
        {label}
      </Typography>
      <Typography variant="h4" sx={{ mt: 1, fontSize: { xs: "1.75rem", sm: "2rem" } }}>
        {value}
      </Typography>
      {hint ? (
        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.75 }}>
          {hint}
        </Typography>
      ) : null}
    </Paper>
  );
}

export function CrmPlaceholderPanel({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <Paper
      elevation={0}
      sx={{
        p: { xs: 3, sm: 4 },
        border: "1px dashed",
        borderColor: "divider",
        backgroundColor: "background.paper",
      }}
    >
      <Typography variant="h6" sx={{ mb: 1 }}>
        {title}
      </Typography>
      <Typography color="text.secondary">{description}</Typography>
    </Paper>
  );
}
