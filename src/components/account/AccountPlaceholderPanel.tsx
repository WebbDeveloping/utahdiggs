import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";

type AccountPlaceholderPanelProps = {
  title: string;
  description: string;
};

export default function AccountPlaceholderPanel({
  title,
  description,
}: AccountPlaceholderPanelProps) {
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
