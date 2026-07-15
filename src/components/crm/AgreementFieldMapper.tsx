"use client";

/**
 * Admin PDF field mapper for agreement templates.
 *
 * Workflow:
 * 1. Select a template and load its field map (blob, or bundled default).
 * 2. Choose field type + name, then click the PDF to place coordinates.
 * 3. Preview (debug overlay or filled sample PDF) to verify placement.
 * 4. Save — persists JSON to private Vercel Blob for production fill pipeline.
 * 5. Export JSON — copy bundled backup for version control.
 */

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Chip from "@mui/material/Chip";
import Divider from "@mui/material/Divider";
import FormControl from "@mui/material/FormControl";
import IconButton from "@mui/material/IconButton";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import Paper from "@mui/material/Paper";
import Select from "@mui/material/Select";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import Tooltip from "@mui/material/Tooltip";
import Typography from "@mui/material/Typography";
import AddOutlinedIcon from "@mui/icons-material/AddOutlined";
import DeleteOutlinedIcon from "@mui/icons-material/DeleteOutlined";
import FileDownloadOutlinedIcon from "@mui/icons-material/FileDownloadOutlined";
import RefreshOutlinedIcon from "@mui/icons-material/RefreshOutlined";
import SaveOutlinedIcon from "@mui/icons-material/SaveOutlined";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
import { Document, Page, pdfjs } from "react-pdf";
import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";
import {
  browserClickToPdfCoords,
  createEmptyFieldMap,
  exportFieldMapJson,
  hasFieldMapEntry,
  mergeBundledFieldMapDefaults,
  listFieldMapEntries,
  pdfCoordsToBrowserOverlay,
  removeFieldMapEntry,
  upsertFieldMapEntry,
  type AgreementFieldMap,
  type AgreementFieldMapEntry,
  type AgreementFieldType,
} from "@/lib/signature/agreement-field-map";
import {
  UAR_DATA_FORM_RESIDENTIAL_SLUG,
  UAR_EXCLUSIVE_RIGHT_TO_SELL_SLUG,
} from "@/lib/signature/agreement-template-definitions";

pdfjs.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

type TemplateSummary = {
  slug: string;
  version: string;
  displayName: string;
  revisionLabel: string;
};

type AgreementFieldMapperProps = {
  templates: TemplateSummary[];
  initialSlug: string;
  initialVersion: string;
};

const FIELD_TYPE_COLORS: Record<AgreementFieldType, string> = {
  text: "#d32f2f",
  checkbox: "#2e7d32",
  image: "#7b1fa2",
};

const DEFAULT_IMAGE_SIZE = { width: 48, height: 24 };

function templateKey(template: TemplateSummary): string {
  return `${template.slug}::${template.version}`;
}

export default function AgreementFieldMapper({
  templates,
  initialSlug,
  initialVersion,
}: AgreementFieldMapperProps) {
  const initialTemplate =
    templates.find(
      (entry) => entry.slug === initialSlug && entry.version === initialVersion,
    ) ??
    templates.find((entry) => entry.slug === initialSlug) ??
    templates[0];

  const [selectedKey, setSelectedKey] = useState(
    initialTemplate ? templateKey(initialTemplate) : "",
  );
  const [fieldMap, setFieldMap] = useState<AgreementFieldMap | null>(null);
  const [bundledFieldMap, setBundledFieldMap] = useState<AgreementFieldMap | null>(null);
  const [mapSource, setMapSource] = useState<"bundled" | "blob" | "none" | null>(null);
  const [pdfData, setPdfData] = useState<ArrayBuffer | null>(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [numPages, setNumPages] = useState(0);
  const [selectedField, setSelectedField] = useState<string | null>(null);
  const [newFieldType, setNewFieldType] = useState<AgreementFieldType>("text");
  const [newFieldName, setNewFieldName] = useState("");
  const [status, setStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [addFieldName, setAddFieldName] = useState("");
  const [addFieldType, setAddFieldType] = useState<AgreementFieldType>("text");
  const pageContainerRef = useRef<HTMLDivElement>(null);
  const isMountedRef = useRef(false);
  const loadRequestIdRef = useRef(0);
  const [renderWidth, setRenderWidth] = useState(612);

  const entryKey = (entry: AgreementFieldMapEntry) => `${entry.type}:${entry.name}`;

  const selectFieldEntry = useCallback((entry: AgreementFieldMapEntry) => {
    setSelectedField(`${entry.type}:${entry.name}`);
    setNewFieldName(entry.name);
    setNewFieldType(entry.type);
  }, []);

  const template = useMemo(
    () => templates.find((entry) => templateKey(entry) === selectedKey) ?? templates[0],
    [selectedKey, templates],
  );

  const slug = template?.slug ?? initialSlug;
  const version = template?.version ?? initialVersion;
  const versionQuery = version ? `?version=${encodeURIComponent(version)}` : "";

  const pageHeight = fieldMap?.pageSize.height ?? 792;
  const renderScale = renderWidth / (fieldMap?.pageSize.width ?? 612);

  const entries = useMemo(
    () => (fieldMap ? listFieldMapEntries(fieldMap) : []),
    [fieldMap],
  );

  const pageEntries = useMemo(
    () => entries.filter((entry) => entry.page === pageNumber - 1),
    [entries, pageNumber],
  );

  const selectedEntry = useMemo(
    () => entries.find((entry) => entryKey(entry) === selectedField) ?? null,
    [entries, selectedField],
  );

  const versionMismatch =
    fieldMap && template && fieldMap.version !== template.version;

  const loadTemplate = useCallback(async (nextTemplate: TemplateSummary) => {
    const requestId = ++loadRequestIdRef.current;
    const versionParam = `?version=${encodeURIComponent(nextTemplate.version)}`;

    setLoading(true);
    setError(null);
    setStatus(null);
    setPdfData(null);
    setNumPages(0);

    try {
      const [pdfResponse, mapResponse] = await Promise.all([
        fetch(`/api/crm/agreement-templates/${nextTemplate.slug}/pdf${versionParam}`),
        fetch(`/api/crm/agreement-templates/${nextTemplate.slug}/field-map${versionParam}`),
      ]);

      if (!isMountedRef.current || requestId !== loadRequestIdRef.current) {
        return;
      }

      if (!pdfResponse.ok) {
        throw new Error("Failed to load template PDF.");
      }
      if (!mapResponse.ok) {
        throw new Error("Failed to load field map.");
      }

      const pdfBuffer = await pdfResponse.arrayBuffer();
      const mapPayload = (await mapResponse.json()) as {
        fieldMap: AgreementFieldMap;
        source: "bundled" | "blob" | "none";
        bundledFieldMap: AgreementFieldMap | null;
      };

      if (!isMountedRef.current || requestId !== loadRequestIdRef.current) {
        return;
      }

      setPdfData(pdfBuffer);
      setFieldMap(mapPayload.fieldMap);
      setBundledFieldMap(mapPayload.bundledFieldMap);
      setMapSource(mapPayload.source);
      setPageNumber(1);
      setSelectedField(null);
      setStatus(
        mapPayload.source === "none"
          ? "No saved field map yet — start placing fields."
          : `Loaded field map from ${mapPayload.source}.`,
      );
    } catch (loadError) {
      if (!isMountedRef.current || requestId !== loadRequestIdRef.current) {
        return;
      }

      setFieldMap(createEmptyFieldMap(nextTemplate.slug, nextTemplate.version));
      setBundledFieldMap(null);
      setMapSource("none");
      setError(loadError instanceof Error ? loadError.message : "Failed to load template.");
    } finally {
      if (isMountedRef.current && requestId === loadRequestIdRef.current) {
        setLoading(false);
      }
    }
  }, []);

  const handleDocumentLoadSuccess = useCallback(({ numPages: loadedPages }: { numPages: number }) => {
    queueMicrotask(() => {
      if (isMountedRef.current) {
        setNumPages(loadedPages);
      }
    });
  }, []);

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
      loadRequestIdRef.current += 1;
    };
  }, []);

  useEffect(() => {
    if (template) {
      void loadTemplate(template);
    }
  }, [template, loadTemplate]);

  useEffect(() => {
    const element = pageContainerRef.current;
    if (!element) return;

    const observer = new ResizeObserver((records) => {
      const width = records[0]?.contentRect.width;
      if (width && width > 0 && isMountedRef.current) {
        setRenderWidth(width);
      }
    });

    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  const handlePageClick = (event: React.MouseEvent<HTMLDivElement>) => {
    if (!fieldMap || !newFieldName.trim()) {
      setError("Enter a field name before clicking the PDF.");
      return;
    }

    const rect = event.currentTarget.getBoundingClientRect();
    const clickX = event.clientX - rect.left;
    const clickY = event.clientY - rect.top;
    const { x, y } = browserClickToPdfCoords(clickX, clickY, renderScale, pageHeight);

    const entry: AgreementFieldMapEntry = {
      name: newFieldName.trim(),
      type: newFieldType,
      page: pageNumber - 1,
      x,
      y,
      size: newFieldType === "text" ? 9 : newFieldType === "checkbox" ? 10 : undefined,
      maxWidth: newFieldType === "text" ? 200 : undefined,
      width: newFieldType === "image" ? DEFAULT_IMAGE_SIZE.width : undefined,
      height: newFieldType === "image" ? DEFAULT_IMAGE_SIZE.height : undefined,
    };

    setFieldMap(upsertFieldMapEntry(fieldMap, entry));
    selectFieldEntry(entry);
    setError(null);
    setStatus(`Placed ${entry.name} at (${x}, ${y}).`);
  };

  const updateSelectedEntry = (patch: Partial<AgreementFieldMapEntry>) => {
    if (!fieldMap || !selectedEntry) return;
    setFieldMap(
      upsertFieldMapEntry(fieldMap, {
        ...selectedEntry,
        ...patch,
      }),
    );
  };

  const handleSave = useCallback(async () => {
    if (!fieldMap) return false;
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `/api/crm/agreement-templates/${slug}/field-map${versionQuery}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(fieldMap),
        },
      );
      const payload = (await response.json()) as { error?: string };
      if (!response.ok) {
        throw new Error(payload.error ?? "Failed to save field map.");
      }
      setMapSource("blob");
      setStatus("Field map saved to Vercel Blob.");
      return true;
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "Failed to save.");
      return false;
    } finally {
      setLoading(false);
    }
  }, [fieldMap, slug, versionQuery]);

  const buildFieldEntryAtDefaultPosition = (
    name: string,
    type: AgreementFieldType,
  ): AgreementFieldMapEntry => ({
    name,
    type,
    page: pageNumber - 1,
    x: 72,
    y: Math.round(pageHeight / 2),
    size: type === "text" ? 9 : type === "checkbox" ? 10 : undefined,
    maxWidth: type === "text" ? 200 : undefined,
    width: type === "image" ? DEFAULT_IMAGE_SIZE.width : undefined,
    height: type === "image" ? DEFAULT_IMAGE_SIZE.height : undefined,
  });

  const handleAddField = async (saveAfter: boolean) => {
    if (!fieldMap) return;

    const name = addFieldName.trim();
    if (!name) {
      setError("Enter a field name.");
      return;
    }

    const entry = buildFieldEntryAtDefaultPosition(name, addFieldType);
    if (hasFieldMapEntry(fieldMap, entry)) {
      setError(`A ${addFieldType} field named "${name}" already exists.`);
      return;
    }

    const nextMap = upsertFieldMapEntry(fieldMap, entry);
    setFieldMap(nextMap);
    selectFieldEntry(entry);
    setNewFieldName(name);
    setNewFieldType(addFieldType);
    setAddDialogOpen(false);
    setAddFieldName("");
    setError(null);
    setStatus(
      saveAfter
        ? `Added ${name} on page ${pageNumber} and saving to Blob…`
        : `Added ${name} on page ${pageNumber} at (${entry.x}, ${entry.y}). Adjust coordinates below, then Save.`,
    );

    if (saveAfter) {
      setLoading(true);
      try {
        const response = await fetch(
          `/api/crm/agreement-templates/${slug}/field-map${versionQuery}`,
          {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(nextMap),
          },
        );
        const payload = (await response.json()) as { error?: string };
        if (!response.ok) {
          throw new Error(payload.error ?? "Failed to save field map.");
        }
        setMapSource("blob");
        setStatus(`Added ${name} and saved field map to Vercel Blob.`);
      } catch (saveError) {
        setError(saveError instanceof Error ? saveError.message : "Failed to save.");
      } finally {
        setLoading(false);
      }
    }
  };

  const openAddFieldDialog = () => {
    setAddFieldName(newFieldName);
    setAddFieldType(newFieldType);
    setAddDialogOpen(true);
  };

  const handlePreview = async (mode: "debug" | "fill") => {
    if (!fieldMap) return;
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `/api/crm/agreement-templates/${slug}/preview${versionQuery}`,
        {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fieldMap, mode }),
        },
      );
      if (!response.ok) {
        const payload = (await response.json()) as { error?: string };
        throw new Error(payload.error ?? "Preview failed.");
      }
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      window.open(url, "_blank", "noopener,noreferrer");
      setStatus(mode === "fill" ? "Opened filled preview PDF." : "Opened debug overlay PDF.");
    } catch (previewError) {
      setError(previewError instanceof Error ? previewError.message : "Preview failed.");
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async () => {
    if (!fieldMap) return;
    await navigator.clipboard.writeText(exportFieldMapJson(fieldMap));
    setStatus("Field map JSON copied to clipboard.");
  };

  const handleMergeBundledDefaults = () => {
    if (!fieldMap || !bundledFieldMap) {
      setError("No bundled field map is available for this template.");
      return;
    }

    const { fieldMap: merged, added } = mergeBundledFieldMapDefaults(fieldMap, bundledFieldMap);
    setFieldMap(merged);
    setError(null);
    setStatus(
      added.length > 0
        ? `Added ${added.length} bundled field(s): ${added.map((entry) => `${entry.name} (${entry.type})`).join(", ")}. Save to persist to Blob.`
        : "No missing bundled fields — your map already includes everything from the repo.",
    );
  };

  const handleDelete = (key: string, entry: AgreementFieldMapEntry) => {
    if (!fieldMap) return;
    setFieldMap(removeFieldMapEntry(fieldMap, entry));
    if (selectedField === key) {
      setSelectedField(null);
    }
  };

  return (
    <Stack spacing={2}>
      {error ? <Alert severity="error">{error}</Alert> : null}
      {status ? <Alert severity="success" onClose={() => setStatus(null)}>{status}</Alert> : null}
      {versionMismatch ? (
        <Alert severity="warning">
          Field map version ({fieldMap?.version}) does not match template version ({template?.version}).
        </Alert>
      ) : null}

      <Paper sx={{ p: 2 }}>
        <Stack
          direction={{ xs: "column", md: "row" }}
          spacing={2}
          sx={{ alignItems: { md: "center" }, justifyContent: "space-between" }}
        >
          <FormControl sx={{ minWidth: 320 }} size="small">
            <InputLabel id="template-select-label">Template</InputLabel>
            <Select
              labelId="template-select-label"
              label="Template"
              value={selectedKey}
              onChange={(event) => setSelectedKey(event.target.value)}
            >
              {templates.map((entry) => (
                <MenuItem key={templateKey(entry)} value={templateKey(entry)}>
                  {entry.displayName} ({entry.version})
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <Stack direction="row" spacing={1} sx={{ flexWrap: "wrap", gap: 1 }}>
            {mapSource ? <Chip size="small" label={`Source: ${mapSource}`} /> : null}
            <Button
              size="small"
              startIcon={<RefreshOutlinedIcon />}
              onClick={() => template && void loadTemplate(template)}
              disabled={loading || !template}
            >
              Reload
            </Button>
            <Button
              size="small"
              onClick={handleMergeBundledDefaults}
              disabled={loading || !fieldMap || !bundledFieldMap}
            >
              Add missing bundled fields
            </Button>
            <Button
              size="small"
              startIcon={<SaveOutlinedIcon />}
              variant="contained"
              onClick={() => void handleSave()}
              disabled={loading || !fieldMap}
            >
              Save
            </Button>
            <Button
              size="small"
              startIcon={<VisibilityOutlinedIcon />}
              onClick={() => void handlePreview("debug")}
              disabled={loading || !fieldMap}
            >
              Preview overlay
            </Button>
            {slug === UAR_EXCLUSIVE_RIGHT_TO_SELL_SLUG ||
            slug === UAR_DATA_FORM_RESIDENTIAL_SLUG ? (
              <Button
                size="small"
                startIcon={<VisibilityOutlinedIcon />}
                onClick={() => void handlePreview("fill")}
                disabled={loading || !fieldMap}
              >
                Preview filled
              </Button>
            ) : null}
            <Button
              size="small"
              startIcon={<FileDownloadOutlinedIcon />}
              onClick={() => void handleExport()}
              disabled={!fieldMap}
            >
              Export JSON
            </Button>
          </Stack>
        </Stack>
      </Paper>

      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", lg: "1fr 340px" },
          gap: 2,
          alignItems: "start",
        }}
      >
        <Paper sx={{ p: 2 }}>
          <Stack direction="row" spacing={1} sx={{ mb: 2, alignItems: "center" }}>
            <Button
              size="small"
              disabled={pageNumber <= 1}
              onClick={() => setPageNumber((value) => Math.max(1, value - 1))}
            >
              Previous
            </Button>
            <Typography variant="body2" sx={{ minWidth: 120, textAlign: "center" }}>
              Page {pageNumber} of {numPages || "?"}
            </Typography>
            <Button
              size="small"
              disabled={numPages > 0 && pageNumber >= numPages}
              onClick={() => setPageNumber((value) => value + 1)}
            >
              Next
            </Button>
          </Stack>

          <Box
            ref={pageContainerRef}
            sx={{ position: "relative", width: "100%", bgcolor: "grey.100", borderRadius: 1 }}
          >
            {pdfData ? (
              <Document
                file={pdfData}
                onLoadSuccess={handleDocumentLoadSuccess}
                loading={<Typography sx={{ p: 2 }}>Loading PDF…</Typography>}
              >
                <Box sx={{ position: "relative", display: "inline-block", width: "100%" }}>
                  <Page
                    pageNumber={pageNumber}
                    width={renderWidth}
                    renderTextLayer={false}
                    renderAnnotationLayer={false}
                  />
                  <Box
                    onClick={handlePageClick}
                    sx={{
                      position: "absolute",
                      inset: 0,
                      cursor: newFieldName.trim() ? "crosshair" : "not-allowed",
                    }}
                  >
                    {pageEntries.map((entry) => {
                      const position = pdfCoordsToBrowserOverlay(
                        entry.x,
                        entry.y,
                        renderScale,
                        pageHeight,
                      );
                      const key = entryKey(entry);
                      const isSelected = selectedField === key;
                      const color = FIELD_TYPE_COLORS[entry.type];

                      if (entry.type === "image" && entry.width && entry.height) {
                        const top =
                          position.top - entry.height * renderScale;
                        return (
                          <Tooltip key={key} title={entry.name} arrow placement="top">
                            <Box
                              onClick={(event) => {
                                event.stopPropagation();
                                selectFieldEntry(entry);
                              }}
                              sx={{
                                position: "absolute",
                                left: position.left,
                                top,
                                width: entry.width * renderScale,
                                height: entry.height * renderScale,
                                border: `2px solid ${color}`,
                                bgcolor: isSelected ? `${color}22` : "transparent",
                                pointerEvents: "auto",
                              }}
                            />
                          </Tooltip>
                        );
                      }

                      return (
                        <Tooltip key={key} title={entry.name} arrow placement="top">
                          <Box
                            onClick={(event) => {
                              event.stopPropagation();
                              selectFieldEntry(entry);
                            }}
                            sx={{
                              position: "absolute",
                              left: position.left - 4,
                              top: position.top - 10,
                              width: 10,
                              height: 10,
                              borderRadius: "50%",
                              bgcolor: color,
                              border: isSelected ? "2px solid #000" : "none",
                              pointerEvents: "auto",
                            }}
                          />
                        </Tooltip>
                      );
                    })}
                  </Box>
                </Box>
              </Document>
            ) : (
              <Typography sx={{ p: 2 }}>{loading ? "Loading…" : "No PDF loaded."}</Typography>
            )}
          </Box>
        </Paper>

        <Stack spacing={2}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="subtitle1" sx={{ mb: 1.5, fontWeight: 600 }}>
              Place field
            </Typography>
            <Stack spacing={1.5}>
              <FormControl size="small" fullWidth>
                <InputLabel id="field-type-label">Type</InputLabel>
                <Select
                  labelId="field-type-label"
                  label="Type"
                  value={newFieldType}
                  onChange={(event) => setNewFieldType(event.target.value as AgreementFieldType)}
                >
                  <MenuItem value="text">Text</MenuItem>
                  <MenuItem value="checkbox">Checkbox</MenuItem>
                  <MenuItem value="image">Image (signature / initials)</MenuItem>
                </Select>
              </FormControl>
              <TextField
                size="small"
                label="Field name"
                value={newFieldName}
                onChange={(event) => setNewFieldName(event.target.value)}
                placeholder="e.g. seller1Signature"
                fullWidth
              />
              <Typography variant="caption" color="text.secondary">
                Use stable names like seller1FullName or page1Initials so developers can wire fill
                logic later. Click the PDF to place the field (pdf-lib bottom-left coordinates).
              </Typography>
            </Stack>
          </Paper>

          {selectedEntry ? (
            <Paper sx={{ p: 2 }}>
              <Typography variant="subtitle1" sx={{ mb: 1.5, fontWeight: 600 }}>
                Edit: {selectedEntry.name}
              </Typography>
              <Stack spacing={1.5}>
                <TextField
                  size="small"
                  label="Page (0-indexed)"
                  type="number"
                  value={selectedEntry.page}
                  onChange={(event) =>
                    updateSelectedEntry({ page: Number(event.target.value) })
                  }
                  fullWidth
                />
                <TextField
                  size="small"
                  label="X"
                  type="number"
                  value={selectedEntry.x}
                  onChange={(event) => updateSelectedEntry({ x: Number(event.target.value) })}
                  fullWidth
                />
                <TextField
                  size="small"
                  label="Y"
                  type="number"
                  value={selectedEntry.y}
                  onChange={(event) => updateSelectedEntry({ y: Number(event.target.value) })}
                  fullWidth
                />
                {selectedEntry.type === "text" ? (
                  <>
                    <TextField
                      size="small"
                      label="Font size"
                      type="number"
                      value={selectedEntry.size ?? 9}
                      onChange={(event) =>
                        updateSelectedEntry({ size: Number(event.target.value) })
                      }
                      fullWidth
                    />
                    <TextField
                      size="small"
                      label="Max width"
                      type="number"
                      value={selectedEntry.maxWidth ?? 200}
                      onChange={(event) =>
                        updateSelectedEntry({ maxWidth: Number(event.target.value) })
                      }
                      fullWidth
                    />
                  </>
                ) : null}
                {selectedEntry.type === "image" ? (
                  <>
                    <TextField
                      size="small"
                      label="Width"
                      type="number"
                      value={selectedEntry.width ?? DEFAULT_IMAGE_SIZE.width}
                      onChange={(event) =>
                        updateSelectedEntry({ width: Number(event.target.value) })
                      }
                      fullWidth
                    />
                    <TextField
                      size="small"
                      label="Height"
                      type="number"
                      value={selectedEntry.height ?? DEFAULT_IMAGE_SIZE.height}
                      onChange={(event) =>
                        updateSelectedEntry({ height: Number(event.target.value) })
                      }
                      fullWidth
                    />
                  </>
                ) : null}
              </Stack>
            </Paper>
          ) : null}

          <Paper sx={{ p: 2 }}>
            <Stack
              direction="row"
              sx={{ mb: 1.5, alignItems: "center", justifyContent: "space-between", gap: 1 }}
            >
              <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                Fields ({entries.length})
              </Typography>
              <Button
                size="small"
                startIcon={<AddOutlinedIcon />}
                onClick={openAddFieldDialog}
                disabled={loading || !fieldMap}
              >
                Add field
              </Button>
            </Stack>
            <Typography variant="caption" color="text.secondary" sx={{ display: "block", mb: 1 }}>
              New fields are placed on the current PDF page. Use Save (or Add & save) to persist
              to Blob.
            </Typography>
            <Stack spacing={0.5} divider={<Divider flexItem />}>
              {entries.length === 0 ? (
                <Typography variant="body2" color="text.secondary">
                  No fields mapped yet.
                </Typography>
              ) : (
                entries.map((entry) => {
                  const key = entryKey(entry);
                  return (
                  <Stack
                    key={key}
                    direction="row"
                    sx={{
                      py: 0.5,
                      px: 0.5,
                      borderRadius: 1,
                      alignItems: "center",
                      justifyContent: "space-between",
                      bgcolor: selectedField === key ? "action.selected" : "transparent",
                      cursor: "pointer",
                    }}
                    onClick={() => {
                      selectFieldEntry(entry);
                      setPageNumber(entry.page + 1);
                    }}
                  >
                    <Box>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        {entry.name}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {entry.type} · page {entry.page + 1} · ({entry.x}, {entry.y})
                      </Typography>
                    </Box>
                    <IconButton
                      size="small"
                      aria-label={`Delete ${entry.name}`}
                      onClick={(event) => {
                        event.stopPropagation();
                        handleDelete(key, entry);
                      }}
                    >
                      <DeleteOutlinedIcon fontSize="small" />
                    </IconButton>
                  </Stack>
                  );
                })
              )}
            </Stack>
          </Paper>
        </Stack>
      </Box>

      <Dialog open={addDialogOpen} onClose={() => setAddDialogOpen(false)} fullWidth maxWidth="xs">
        <DialogTitle>Add field</DialogTitle>
        <DialogContent>
          <Stack spacing={1.5} sx={{ pt: 0.5 }}>
            <FormControl size="small" fullWidth>
              <InputLabel id="add-field-type-label">Type</InputLabel>
              <Select
                labelId="add-field-type-label"
                label="Type"
                value={addFieldType}
                onChange={(event) => setAddFieldType(event.target.value as AgreementFieldType)}
              >
                <MenuItem value="text">Text</MenuItem>
                <MenuItem value="checkbox">Checkbox</MenuItem>
                <MenuItem value="image">Image (signature / initials)</MenuItem>
              </Select>
            </FormControl>
            <TextField
              size="small"
              label="Field name"
              value={addFieldName}
              onChange={(event) => setAddFieldName(event.target.value)}
              placeholder="e.g. sqFtOtherExplanation"
              fullWidth
              autoFocus
            />
            <Typography variant="caption" color="text.secondary">
              Places on page {pageNumber} at a default position. Fine-tune X/Y in the editor, or
              click the PDF using Place field.
            </Typography>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAddDialogOpen(false)}>Cancel</Button>
          <Button onClick={() => void handleAddField(false)} disabled={!addFieldName.trim()}>
            Add
          </Button>
          <Button
            variant="contained"
            onClick={() => void handleAddField(true)}
            disabled={loading || !addFieldName.trim()}
          >
            Add & save
          </Button>
        </DialogActions>
      </Dialog>
    </Stack>
  );
}
