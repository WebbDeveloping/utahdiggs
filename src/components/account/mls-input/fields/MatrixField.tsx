"use client";

import Box from "@mui/material/Box";
import Checkbox from "@mui/material/Checkbox";
import FormControlLabel from "@mui/material/FormControlLabel";
import MenuItem from "@mui/material/MenuItem";
import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import type { MlsInputField } from "@/lib/mls-input/schema";
import { getMatrixRowLabels } from "@/lib/mls-input/conditions";

const inputSx = {
  "& .MuiOutlinedInput-root": {
    borderRadius: 1,
    backgroundColor: "background.default",
  },
};

type MatrixValue = Record<string, Record<string, string | string[]>>;

type MatrixFieldProps = {
  field: MlsInputField;
  value?: MatrixValue;
  error?: string;
  allValues: Record<string, unknown>;
  onChange: (value: MatrixValue) => void;
};

export default function MatrixField({
  field,
  value = {},
  error,
  allValues,
  onChange,
}: MatrixFieldProps) {
  const dynamicLabels = field.dynamic?.rowCountFrom
    ? getMatrixRowLabels(field.id, allValues)
    : null;
  const rowLabels = dynamicLabels?.length
    ? dynamicLabels
    : (field.rows ?? []);

  const updateCell = (
    rowLabel: string,
    colId: string,
    cellValue: string | string[],
  ) => {
    onChange({
      ...value,
      [rowLabel]: {
        ...(value[rowLabel] ?? {}),
        [colId]: cellValue,
      },
    });
  };

  return (
    <Stack spacing={1}>
      {field.label ? (
        <Typography variant="subtitle2">
          {field.label}
          {field.required ? " *" : ""}
        </Typography>
      ) : null}
      <TableContainer
        component={Paper}
        elevation={0}
        sx={{ border: "1px solid", borderColor: "divider", overflowX: "auto" }}
      >
        <Table size="small" sx={{ minWidth: 720 }}>
          <TableHead>
            <TableRow>
              <TableCell sx={{ fontWeight: 600, minWidth: 120 }}>Level</TableCell>
              {(field.columns ?? []).map((col) => (
                <TableCell key={col.id} sx={{ fontWeight: 600, minWidth: 100 }}>
                  {col.label}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {rowLabels.map((rowLabel) => (
              <TableRow key={rowLabel}>
                <TableCell sx={{ fontWeight: 500 }}>{rowLabel}</TableCell>
                {(field.columns ?? []).map((col) => {
                  const cellValue = value[rowLabel]?.[col.id];

                  if (col.type === "select" && col.options?.length) {
                    return (
                      <TableCell key={col.id}>
                        <TextField
                          select
                          size="small"
                          fullWidth
                          value={(cellValue as string) ?? ""}
                          onChange={(e) => updateCell(rowLabel, col.id, e.target.value)}
                          sx={inputSx}
                        >
                          <MenuItem value="">—</MenuItem>
                          {col.options.map((opt) => (
                            <MenuItem key={opt} value={opt}>
                              {opt}
                            </MenuItem>
                          ))}
                        </TextField>
                      </TableCell>
                    );
                  }

                  if (col.type === "checkbox") {
                    const checked = Array.isArray(cellValue)
                      ? cellValue.includes("Yes")
                      : cellValue === "Yes";
                    return (
                      <TableCell key={col.id}>
                        <Checkbox
                          checked={checked}
                          onChange={(e) =>
                            updateCell(
                              rowLabel,
                              col.id,
                              e.target.checked ? ["Yes"] : [],
                            )
                          }
                        />
                      </TableCell>
                    );
                  }

                  return (
                    <TableCell key={col.id}>
                      <TextField
                        size="small"
                        fullWidth
                        type={col.type === "number" ? "number" : "text"}
                        value={(cellValue as string) ?? ""}
                        onChange={(e) => updateCell(rowLabel, col.id, e.target.value)}
                        sx={inputSx}
                      />
                    </TableCell>
                  );
                })}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      {error ? (
        <Typography variant="caption" color="error">
          {error}
        </Typography>
      ) : null}
    </Stack>
  );
}
