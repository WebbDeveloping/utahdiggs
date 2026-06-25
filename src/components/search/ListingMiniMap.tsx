"use client";

import { useEffect } from "react";
import { MapContainer, Marker, TileLayer, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import Box from "@mui/material/Box";
import { createPriceIcon } from "@/lib/search/map-icons";

type ListingMiniMapProps = {
  latitude: number;
  longitude: number;
  price: number | null;
};

function MapCenter({ center }: { center: [number, number] }) {
  const map = useMap();
  useEffect(() => {
    map.setView(center, 15);
  }, [center, map]);
  return null;
}

export default function ListingMiniMap({
  latitude,
  longitude,
  price,
}: ListingMiniMapProps) {
  const center: [number, number] = [latitude, longitude];

  return (
    <Box sx={{ height: 320, borderRadius: 3, overflow: "hidden" }}>
      <MapContainer
        center={center}
        zoom={15}
        style={{ width: "100%", height: "100%" }}
        scrollWheelZoom={false}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <MapCenter center={center} />
        <Marker position={center} icon={createPriceIcon(price, true)} />
      </MapContainer>
    </Box>
  );
}
