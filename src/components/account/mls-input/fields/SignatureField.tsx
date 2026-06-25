"use client";

import { useCallback, useRef } from "react";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import SignatureCanvas from "react-signature-canvas";
import { upload } from "@vercel/blob/client";

type SignatureFieldProps = {
  label?: string;
  value?: string;
  required?: boolean;
  error?: string;
  onChange: (url: string) => void;
};

export default function SignatureField({
  label,
  value,
  required,
  error,
  onChange,
}: SignatureFieldProps) {
  const sigRef = useRef<SignatureCanvas | null>(null);
  const uploadingRef = useRef(false);

  const uploadSignature = useCallback(async () => {
    if (!sigRef.current || sigRef.current.isEmpty() || uploadingRef.current) return;
    uploadingRef.current = true;
    try {
      const dataUrl = sigRef.current.getCanvas().toDataURL("image/png");
      const blob = await fetch(dataUrl).then((r) => r.blob());
      const file = new File([blob], "signature.png", { type: "image/png" });
      const result = await upload(file.name, file, {
        access: "public",
        handleUploadUrl: "/api/account/uploads",
      });
      onChange(result.url);
    } catch (err) {
      console.error("Signature upload failed:", err);
    } finally {
      uploadingRef.current = false;
    }
  }, [onChange]);

  return (
    <Stack spacing={1}>
      {label ? (
        <Typography variant="subtitle2">
          {label}
          {required ? " *" : ""}
        </Typography>
      ) : null}
      <Box
        sx={{
          border: "1px solid",
          borderColor: error ? "error.main" : "divider",
          borderRadius: 1,
          bgcolor: "background.paper",
          display: "inline-block",
        }}
      >
        <SignatureCanvas
          ref={sigRef}
          penColor="black"
          canvasProps={{
            width: 310,
            height: 114,
            style: { display: "block" },
          }}
          onEnd={uploadSignature}
        />
      </Box>
      <Stack direction="row" spacing={1}>
        <Button
          size="small"
          onClick={() => {
            sigRef.current?.clear();
            onChange("");
          }}
        >
          Clear
        </Button>
        {value ? (
          <Typography variant="body2" color="success.main">
            Signature saved
          </Typography>
        ) : null}
      </Stack>
      {error ? (
        <Typography variant="caption" color="error">
          {error}
        </Typography>
      ) : null}
    </Stack>
  );
}
