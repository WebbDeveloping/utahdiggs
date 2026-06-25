"use client";

import { useId, useMemo, useState } from "react";
import Box from "@mui/material/Box";
import Slider from "@mui/material/Slider";
import Typography from "@mui/material/Typography";
import {
  calculateSavings,
  formatCurrency,
  formatHomeValueSlider,
  HOME_VALUE_DEFAULT,
  HOME_VALUE_MAX,
  HOME_VALUE_MIN,
  HOME_VALUE_STEP,
  SAVINGS_PLANS,
  type SavingsPlanId,
} from "@/lib/marketing/savings-calculator";

const planOptions = Object.values(SAVINGS_PLANS);

export default function SavingsCalculatorCard() {
  const baseId = useId();
  const sliderLabelId = `${baseId}-home-value-label`;
  const [homeValue, setHomeValue] = useState(HOME_VALUE_DEFAULT);
  const [plan, setPlan] = useState<SavingsPlanId>("virtual");

  const selectedPlan = SAVINGS_PLANS[plan];
  const result = useMemo(
    () => calculateSavings(homeValue, selectedPlan.rate),
    [homeValue, selectedPlan.rate],
  );

  return (
    <Box
      id="calc"
      sx={{
        backgroundColor: "background.paper",
        borderRadius: { xs: 3, md: 4 },
        border: "1px solid",
        borderColor: "divider",
        boxShadow: "0 1px 2px rgba(19, 33, 28, 0.06), 0 12px 30px rgba(19, 33, 28, 0.07)",
        p: { xs: 2.5, md: 3.75 },
      }}
    >
      <Typography variant="h3" sx={{ fontSize: { xs: "1.25rem", md: "1.375rem" }, mb: 0.5 }}>
        What could you save?
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2.5 }}>
        Estimate your savings vs. a traditional 3% listing fee.
      </Typography>

      <Box sx={{ mb: 2 }}>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "baseline",
            mb: 1,
          }}
        >
          <Typography
            component="label"
            id={sliderLabelId}
            htmlFor={`${baseId}-home-value-slider`}
            variant="body2"
            sx={{ fontWeight: 600, fontSize: "0.8125rem" }}
          >
            Estimated home value
          </Typography>
          <Typography
            sx={{
              fontFamily: "var(--font-fraunces), Georgia, serif",
              fontSize: "1.375rem",
              fontWeight: 600,
              color: "primary.dark",
            }}
          >
            {formatHomeValueSlider(homeValue)}
          </Typography>
        </Box>

        <Slider
          id={`${baseId}-home-value-slider`}
          value={homeValue}
          onChange={(_, value) => setHomeValue(value as number)}
          min={HOME_VALUE_MIN}
          max={HOME_VALUE_MAX}
          step={HOME_VALUE_STEP}
          aria-labelledby={sliderLabelId}
          sx={{
            color: "primary.main",
            height: 8,
            py: 0.5,
            "& .MuiSlider-rail": {
              opacity: 1,
              backgroundColor: "primary.light",
            },
            "& .MuiSlider-track": {
              border: "none",
            },
            "& .MuiSlider-thumb": {
              width: 26,
              height: 26,
              backgroundColor: "primary.main",
              border: "3px solid #fff",
              boxShadow: "0 1px 2px rgba(19, 33, 28, 0.06), 0 12px 30px rgba(19, 33, 28, 0.07)",
              "&:hover, &.Mui-focusVisible": {
                boxShadow: "0 0 0 8px rgba(14, 122, 95, 0.16)",
              },
            },
          }}
        />

        <Box sx={{ display: "flex", justifyContent: "space-between", mt: 0.5 }}>
          <Typography variant="caption" color="text.secondary">
            $350K
          </Typography>
          <Typography variant="caption" color="text.secondary">
            $2M+
          </Typography>
        </Box>
      </Box>

      <Box sx={{ mb: 2 }}>
        <Typography
          component="legend"
          variant="body2"
          sx={{ fontWeight: 600, fontSize: "0.8125rem", mb: 1 }}
        >
          Glide plan
        </Typography>
        <Box
          role="radiogroup"
          aria-label="Glide plan"
          sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 1.25 }}
        >
          {planOptions.map((option) => {
            const selected = plan === option.id;
            return (
              <Box
                key={option.id}
                component="label"
                sx={{
                  cursor: "pointer",
                  display: "block",
                }}
              >
                <input
                  type="radio"
                  name={`${baseId}-plan`}
                  value={option.id}
                  checked={selected}
                  onChange={() => setPlan(option.id)}
                  style={{
                    position: "absolute",
                    opacity: 0,
                    pointerEvents: "none",
                  }}
                />
                <Box
                  sx={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 0.25,
                    py: 1.75,
                    px: 1.25,
                    borderRadius: 3,
                    border: "1.5px solid",
                    borderColor: selected ? "primary.main" : "divider",
                    backgroundColor: selected ? "primary.light" : "background.paper",
                    boxShadow: selected ? "0 0 0 3px rgba(223, 240, 233, 0.8)" : "none",
                    transition: "border-color 0.15s ease, background-color 0.15s ease, box-shadow 0.15s ease",
                    "&:hover": {
                      borderColor: "primary.main",
                    },
                  }}
                >
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    {option.label}
                  </Typography>
                  <Typography
                    sx={{
                      fontFamily: "var(--font-fraunces), Georgia, serif",
                      fontSize: "1.375rem",
                      fontWeight: 600,
                      lineHeight: 1,
                      color: selected ? "primary.dark" : "text.secondary",
                    }}
                  >
                    {option.rate * 100}%
                  </Typography>
                </Box>
              </Box>
            );
          })}
        </Box>
      </Box>

      <Box
        sx={{
          mt: 0.75,
          py: 2.25,
          px: 2,
          borderRadius: 3,
          backgroundColor: "primary.light",
          textAlign: "center",
        }}
      >
        <Typography
          sx={{
            fontFamily: "var(--font-fraunces), Georgia, serif",
            fontSize: { xs: "1.75rem", md: "2.125rem" },
            fontWeight: 600,
            color: "primary.dark",
            lineHeight: 1.1,
          }}
        >
          {formatCurrency(result.savings)}
        </Typography>
        <Typography variant="caption" color="text.secondary" sx={{ display: "block", mt: 0.5 }}>
          You&apos;d pay {formatCurrency(result.fee)} vs. {formatCurrency(result.traditionalFee)} at 3%
        </Typography>
      </Box>
    </Box>
  );
}
