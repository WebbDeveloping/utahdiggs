"use client";

import Box from "@mui/material/Box";
import LinearProgress from "@mui/material/LinearProgress";
import Typography from "@mui/material/Typography";
import { MLS_INPUT_STEP_COUNT } from "@/lib/mls-input/schema";

type MlsInputProgressProps = {
  currentStep: number;
};

export default function MlsInputProgress({ currentStep }: MlsInputProgressProps) {
  const progress = (currentStep / MLS_INPUT_STEP_COUNT) * 100;

  return (
    <Box>
      <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
        <Typography variant="body2" color="text.secondary">
          Step {currentStep} of {MLS_INPUT_STEP_COUNT}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {Math.round(progress)}%
        </Typography>
      </Box>
      <LinearProgress
        variant="determinate"
        value={progress}
        sx={{ height: 8, borderRadius: 1 }}
      />
    </Box>
  );
}
