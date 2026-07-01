"use client";

import { useCallback, useEffect, useRef, useState, type SyntheticEvent } from "react";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Stack from "@mui/material/Stack";
import Tab from "@mui/material/Tab";
import Tabs from "@mui/material/Tabs";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import SignatureCanvas from "react-signature-canvas";
import {
  renderTypedSignatureToBlob,
  SIGNATURE_CANVAS_HEIGHT,
  SIGNATURE_CANVAS_WIDTH,
} from "@/lib/signature/render-typed-signature";
import { uploadSignatureBlob } from "@/lib/signature/signature-upload";
import { dancingScript } from "@/theme/fonts";

type SignatureMode = "draw" | "type";

type SignatureFieldProps = {
  label?: string;
  value?: string;
  required?: boolean;
  error?: string;
  listingId?: string;
  signerName?: string;
  documentBlobAccess?: "public" | "private";
  onChange: (url: string) => void;
};

const TYPE_DEBOUNCE_MS = 600;

export default function SignatureField({
  label,
  value,
  required,
  error,
  listingId,
  signerName,
  documentBlobAccess = "public",
  onChange,
}: SignatureFieldProps) {
  const sigRef = useRef<SignatureCanvas | null>(null);
  const previewCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const typeDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const uploadGenerationRef = useRef(0);

  const [mode, setMode] = useState<SignatureMode>("draw");
  const [typedName, setTypedName] = useState(signerName ?? "");
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  const signatureFontFamily = dancingScript.style.fontFamily;

  const cancelPendingWork = useCallback(() => {
    uploadGenerationRef.current += 1;
    if (typeDebounceRef.current) {
      clearTimeout(typeDebounceRef.current);
      typeDebounceRef.current = null;
    }
    setUploading(false);
  }, []);

  const uploadBlob = useCallback(
    async (blob: Blob) => {
      const generation = ++uploadGenerationRef.current;
      setUploading(true);
      setUploadError(null);

      try {
        const url = await uploadSignatureBlob(blob, listingId, documentBlobAccess);
        if (generation !== uploadGenerationRef.current) return;
        onChange(url);
      } catch (err) {
        if (generation !== uploadGenerationRef.current) return;
        console.error("Signature upload failed:", err);
        setUploadError("Could not save your signature. Please try again.");
      } finally {
        if (generation === uploadGenerationRef.current) {
          setUploading(false);
        }
      }
    },
    [documentBlobAccess, listingId, onChange],
  );

  const uploadDrawnSignature = useCallback(async () => {
    if (!sigRef.current || sigRef.current.isEmpty()) return;
    const dataUrl = sigRef.current.getCanvas().toDataURL("image/png");
    const blob = await fetch(dataUrl).then((r) => r.blob());
    await uploadBlob(blob);
  }, [uploadBlob]);

  const drawTypedPreview = useCallback(
    async (text: string) => {
      const canvas = previewCanvasRef.current;
      if (!canvas) return;

      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      ctx.clearRect(0, 0, SIGNATURE_CANVAS_WIDTH, SIGNATURE_CANVAS_HEIGHT);
      const trimmed = text.trim();
      if (trimmed.length < 2) return;

      try {
        const blob = await renderTypedSignatureToBlob(
          trimmed,
          signatureFontFamily,
          SIGNATURE_CANVAS_WIDTH,
          SIGNATURE_CANVAS_HEIGHT,
        );
        const bitmap = await createImageBitmap(blob);
        ctx.drawImage(bitmap, 0, 0);
        bitmap.close();
      } catch (err) {
        console.error("Signature preview failed:", err);
      }
    },
    [signatureFontFamily],
  );

  const uploadTypedSignature = useCallback(
    async (text: string) => {
      const trimmed = text.trim();
      if (trimmed.length < 2) {
        onChange("");
        return;
      }

      try {
        const blob = await renderTypedSignatureToBlob(
          trimmed,
          signatureFontFamily,
          SIGNATURE_CANVAS_WIDTH,
          SIGNATURE_CANVAS_HEIGHT,
        );
        await uploadBlob(blob);
      } catch (err) {
        console.error("Typed signature upload failed:", err);
        setUploadError("Could not save your signature. Please try again.");
      }
    },
    [onChange, signatureFontFamily, uploadBlob],
  );

  const scheduleTypedUpload = useCallback(
    (text: string) => {
      if (typeDebounceRef.current) {
        clearTimeout(typeDebounceRef.current);
      }

      typeDebounceRef.current = setTimeout(() => {
        void uploadTypedSignature(text);
      }, TYPE_DEBOUNCE_MS);
    },
    [uploadTypedSignature],
  );

  const resetSignature = useCallback(() => {
    cancelPendingWork();
    onChange("");
    setUploadError(null);
    sigRef.current?.clear();
    setTypedName(signerName ?? "");

    const canvas = previewCanvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext("2d");
      ctx?.clearRect(0, 0, SIGNATURE_CANVAS_WIDTH, SIGNATURE_CANVAS_HEIGHT);
    }
  }, [cancelPendingWork, onChange, signerName]);

  const handleModeChange = (_: SyntheticEvent, nextMode: SignatureMode) => {
    if (nextMode === mode) return;
    resetSignature();
    setMode(nextMode);

    if (nextMode === "type") {
      const name = signerName?.trim() ?? "";
      if (name.length >= 2) {
        void drawTypedPreview(name);
        scheduleTypedUpload(name);
      }
    }
  };

  const handleTypedNameChange = (text: string) => {
    setTypedName(text);
    onChange("");
    setUploadError(null);
    cancelPendingWork();
    scheduleTypedUpload(text);
  };

  const handleClear = () => {
    resetSignature();
  };

  useEffect(() => {
    if (mode !== "type" || typedName.trim().length < 2) return;
    void drawTypedPreview(typedName);
  }, [drawTypedPreview, mode, typedName]);

  useEffect(() => {
    return () => {
      if (typeDebounceRef.current) {
        clearTimeout(typeDebounceRef.current);
      }
    };
  }, []);

  const borderColor = error || uploadError ? "error.main" : "divider";

  return (
    <Stack spacing={1} className={dancingScript.className}>
      {label ? (
        <Typography variant="subtitle2">
          {label}
          {required ? " *" : ""}
        </Typography>
      ) : null}

      <Tabs
        value={mode}
        onChange={handleModeChange}
        sx={{ minHeight: 36, mb: 0.5 }}
      >
        <Tab label="Draw" value="draw" sx={{ minHeight: 36, py: 0.5 }} />
        <Tab label="Type" value="type" sx={{ minHeight: 36, py: 0.5 }} />
      </Tabs>

      {mode === "type" ? (
        <TextField
          size="small"
          fullWidth
          placeholder="Type your full name"
          value={typedName}
          onChange={(event) => handleTypedNameChange(event.target.value)}
          sx={{ maxWidth: SIGNATURE_CANVAS_WIDTH }}
        />
      ) : null}

      <Box
        sx={{
          border: "1px solid",
          borderColor,
          borderRadius: 1,
          bgcolor: "background.paper",
          display: "inline-block",
          width: SIGNATURE_CANVAS_WIDTH,
          height: SIGNATURE_CANVAS_HEIGHT,
          overflow: "hidden",
        }}
      >
        {mode === "draw" ? (
          <SignatureCanvas
            ref={sigRef}
            penColor="black"
            canvasProps={{
              width: SIGNATURE_CANVAS_WIDTH,
              height: SIGNATURE_CANVAS_HEIGHT,
              style: { display: "block" },
            }}
            onEnd={() => void uploadDrawnSignature()}
          />
        ) : (
          <Box
            component="canvas"
            ref={previewCanvasRef}
            width={SIGNATURE_CANVAS_WIDTH}
            height={SIGNATURE_CANVAS_HEIGHT}
            sx={{ display: "block", width: SIGNATURE_CANVAS_WIDTH, height: SIGNATURE_CANVAS_HEIGHT }}
          />
        )}
      </Box>

      <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
        <Button size="small" onClick={handleClear} disabled={uploading}>
          Clear
        </Button>
        {uploading ? (
          <Typography variant="body2" color="text.secondary">
            Saving…
          </Typography>
        ) : value ? (
          <Typography variant="body2" color="success.main">
            Signature saved
          </Typography>
        ) : null}
      </Stack>

      {uploadError || error ? (
        <Typography variant="caption" color="error">
          {uploadError ?? error}
        </Typography>
      ) : null}
    </Stack>
  );
}
