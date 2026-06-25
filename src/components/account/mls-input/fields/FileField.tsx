"use client";

import { useRef, useState } from "react";
import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import CircularProgress from "@mui/material/CircularProgress";
import IconButton from "@mui/material/IconButton";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import AddIcon from "@mui/icons-material/Add";
import DeleteOutlinedIcon from "@mui/icons-material/DeleteOutlined";
import ImageOutlinedIcon from "@mui/icons-material/ImageOutlined";
import { upload } from "@vercel/blob/client";
import {
  ALLOWED_PHOTO_TYPES,
  buildPhotoPathname,
  MAX_PHOTO_BYTES,
  MAX_PHOTO_COUNT,
} from "@/lib/storage/blob";

const PHOTO_ACCEPT = ALLOWED_PHOTO_TYPES.join(",");
const MAX_PHOTO_MB = Math.round(MAX_PHOTO_BYTES / (1024 * 1024));

type PhotoItem = { name: string; url: string };

type FileFieldProps = {
  label?: string;
  value?: PhotoItem[];
  error?: string;
  multiple?: boolean;
  onChange: (value: PhotoItem[]) => void;
};

function photoNameFromFile(filename: string): string {
  const base = filename.replace(/\.[^.]+$/, "");
  return base.replace(/[-_]+/g, " ").trim() || "Photo";
}

export default function FileField({
  label,
  value = [],
  error,
  multiple = true,
  onChange,
}: FileFieldProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const handleFiles = async (files: FileList | null) => {
    if (!files?.length) return;
    setUploadError(null);
    setUploading(true);

    const next = [...value];
    try {
      for (const file of Array.from(files)) {
        if (next.length >= MAX_PHOTO_COUNT) break;
        if (!(ALLOWED_PHOTO_TYPES as readonly string[]).includes(file.type)) {
          setUploadError(`Only JPEG, PNG, and WebP images are allowed.`);
          continue;
        }
        if (file.size > MAX_PHOTO_BYTES) {
          setUploadError(`Each photo must be under ${MAX_PHOTO_MB} MB.`);
          continue;
        }
        const pathname = buildPhotoPathname(file.name);
        const result = await upload(pathname, file, {
          access: "public",
          handleUploadUrl: "/api/account/uploads",
        });
        next.push({ name: photoNameFromFile(file.name), url: result.url });
      }
      onChange(multiple ? next : next.slice(-1));
    } catch (err) {
      console.error(err);
      setUploadError("Upload failed. Please try again.");
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  return (
    <Stack spacing={1.5}>
      {label ? <Typography variant="subtitle2">{label}</Typography> : null}
      <input
        ref={inputRef}
        type="file"
        accept={PHOTO_ACCEPT}
        multiple={multiple}
        hidden
        onChange={(e) => handleFiles(e.target.files)}
      />
      <Button
        variant="outlined"
        startIcon={uploading ? <CircularProgress size={18} /> : <AddIcon />}
        disabled={uploading}
        onClick={() => inputRef.current?.click()}
      >
        {uploading ? "Uploading…" : "Upload photos"}
      </Button>
      {uploadError ? <Alert severity="error">{uploadError}</Alert> : null}
      {value.length > 0 ? (
        <Stack spacing={1}>
          {value.map((photo, index) => (
            <Box
              key={photo.url}
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 1.5,
                p: 1.5,
                border: "1px solid",
                borderColor: "divider",
                borderRadius: 1,
              }}
            >
              <ImageOutlinedIcon color="action" />
              <TextField
                size="small"
                label="Photo name"
                value={photo.name}
                onChange={(e) => {
                  const updated = [...value];
                  updated[index] = { ...photo, name: e.target.value };
                  onChange(updated);
                }}
                sx={{ flex: 1 }}
              />
              <IconButton
                aria-label="Remove photo"
                onClick={() => onChange(value.filter((_, i) => i !== index))}
              >
                <DeleteOutlinedIcon />
              </IconButton>
            </Box>
          ))}
        </Stack>
      ) : null}
      {error ? (
        <Typography variant="caption" color="error">
          {error}
        </Typography>
      ) : null}
    </Stack>
  );
}
