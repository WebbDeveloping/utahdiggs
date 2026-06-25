import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";

type ListingBlairNoteProps = {
  note: string;
  noteDate: Date | string | null;
};

export default function ListingBlairNote({ note, noteDate }: ListingBlairNoteProps) {
  const formattedDate = noteDate
    ? new Date(noteDate).toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
      })
    : null;

  return (
    <Paper
      variant="outlined"
      sx={{
        p: 2.5,
        borderRadius: 2,
        borderLeft: 4,
        borderLeftColor: "primary.main",
        backgroundColor: "action.hover",
      }}
    >
      <Stack spacing={1.5}>
        <Typography variant="overline" color="primary" sx={{ fontWeight: 700 }}>
          From Blair · Weekly note
          {formattedDate ? ` · ${formattedDate}` : ""}
        </Typography>
        <Typography sx={{ whiteSpace: "pre-wrap", lineHeight: 1.7 }}>{note}</Typography>
      </Stack>
    </Paper>
  );
}
