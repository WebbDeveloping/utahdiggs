"use client";

import Box from "@mui/material/Box";
import HomeOutlinedIcon from "@mui/icons-material/HomeOutlined";
import { useState } from "react";

type ListingThumbnailProps = {
  photoUrl?: string | null;
  alt: string;
  width?: number;
  height?: number;
};

export default function ListingThumbnail({
  photoUrl,
  alt,
  width = 64,
  height = 48,
}: ListingThumbnailProps) {
  const [failed, setFailed] = useState(false);
  const showPhoto = Boolean(photoUrl) && !failed;

  return (
    <Box
      sx={{
        width,
        height,
        borderRadius: 1,
        overflow: "hidden",
        flexShrink: 0,
        backgroundColor: "action.hover",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      {showPhoto ? (
        <Box
          component="img"
          src={photoUrl!}
          alt={alt}
          onError={() => setFailed(true)}
          sx={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
        />
      ) : (
        <HomeOutlinedIcon sx={{ color: "text.disabled", fontSize: Math.round(width * 0.44) }} />
      )}
    </Box>
  );
}
