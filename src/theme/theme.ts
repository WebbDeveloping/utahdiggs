"use client";

import { createTheme } from "@mui/material/styles";
import type {} from "@mui/x-date-pickers/themeAugmentation";

const theme = createTheme({
  palette: {
    mode: "light",
    primary: {
      main: "#0e7a5f",
      light: "#dff0e9",
      dark: "#0a5c47",
      contrastText: "#ffffff",
    },
    text: {
      primary: "#13211c",
      secondary: "#5d6b64",
    },
    background: {
      default: "#f6f4ee",
      paper: "#ffffff",
    },
    divider: "#e3e0d6",
    error: {
      main: "#b4452f",
    },
  },
  shape: {
    borderRadius: 16,
  },
  typography: {
    fontFamily: "var(--font-archivo), system-ui, sans-serif",
    h1: {
      fontFamily: "var(--font-fraunces), Georgia, serif",
      fontWeight: 600,
      lineHeight: 1.1,
      letterSpacing: "-0.01em",
    },
    h2: {
      fontFamily: "var(--font-fraunces), Georgia, serif",
      fontWeight: 600,
      lineHeight: 1.1,
      letterSpacing: "-0.01em",
    },
    h3: {
      fontFamily: "var(--font-fraunces), Georgia, serif",
      fontWeight: 600,
      lineHeight: 1.1,
      letterSpacing: "-0.01em",
    },
    h4: {
      fontFamily: "var(--font-fraunces), Georgia, serif",
      fontWeight: 600,
    },
    body1: {
      lineHeight: 1.6,
    },
    body2: {
      lineHeight: 1.6,
    },
    button: {
      textTransform: "none",
      fontWeight: 600,
    },
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          WebkitFontSmoothing: "antialiased",
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 999,
          padding: "11px 22px",
          fontSize: "0.9375rem",
        },
        outlined: {
          borderColor: "#e3e0d6",
          color: "#13211c",
          "&:hover": {
            borderColor: "#0e7a5f",
            color: "#0e7a5f",
            backgroundColor: "transparent",
          },
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: "rgba(246, 244, 238, 0.82)",
          backdropFilter: "blur(10px)",
          borderBottom: "1px solid #e3e0d6",
          boxShadow: "none",
        },
      },
    },
    MuiContainer: {
      styleOverrides: {
        maxWidthLg: {
          maxWidth: 1120,
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          fontWeight: 600,
          letterSpacing: "0.08em",
          textTransform: "uppercase",
          fontSize: "0.8125rem",
        },
        filled: {
          backgroundColor: "#dff0e9",
          color: "#0e7a5f",
        },
      },
    },
    MuiDateCalendar: {
      styleOverrides: {
        root: {
          width: 320,
          maxWidth: "100%",
        },
      },
    },
    MuiPickerDay: {
      styleOverrides: {
        root: {
          borderRadius: 10,
          "&.Mui-selected": {
            backgroundColor: "#0e7a5f",
            "&:hover, &:focus": {
              backgroundColor: "#0a5c47",
            },
          },
          "&.MuiPickersDay-today": {
            borderColor: "#0e7a5f",
          },
        },
      },
    },
  },
});

export default theme;
