"use client";

import { useEffect, useMemo } from "react";
import { MapContainer, Marker, TileLayer, useMap, useMapEvents } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { hasValidMapCoordinates } from "@/lib/search/format";
import { createPriceIcon } from "@/lib/search/map-icons";
import type { PublicListing } from "@/types/public-listing";

type SearchMapProps = {
  listings: PublicListing[];
  center: [number, number];
  zoom: number;
  highlightedId: string | null;
  onBoundsChange: (bbox: string) => void;
  onMarkerClick: (id: string) => void;
  onMarkerHover: (id: string | null) => void;
};

function MapEvents({ onBoundsChange }: { onBoundsChange: (bbox: string) => void }) {
  useMapEvents({
    moveend: (event) => {
      const bounds = event.target.getBounds();
      const west = bounds.getWest();
      const south = bounds.getSouth();
      const east = bounds.getEast();
      const north = bounds.getNorth();
      onBoundsChange(`${west},${south},${east},${north}`);
    },
  });
  return null;
}

function MapCenterUpdater({
  center,
  zoom,
}: {
  center: [number, number];
  zoom: number;
}) {
  const map = useMap();

  useEffect(() => {
    map.setView(center, zoom, { animate: true });
  }, [center, map, zoom]);

  return null;
}

export default function SearchMap({
  listings,
  center,
  zoom,
  highlightedId,
  onBoundsChange,
  onMarkerClick,
  onMarkerHover,
}: SearchMapProps) {
  const markers = useMemo(
    () => listings.filter(hasValidMapCoordinates),
    [listings],
  );

  return (
    <MapContainer
      center={center}
      zoom={zoom}
      style={{ width: "100%", height: "100%" }}
      scrollWheelZoom
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <MapCenterUpdater center={center} zoom={zoom} />
      <MapEvents onBoundsChange={onBoundsChange} />
      {markers.map((listing) => (
        <Marker
          key={listing.id}
          position={[listing.latitude, listing.longitude]}
          icon={createPriceIcon(listing.listPrice, highlightedId === listing.id)}
          eventHandlers={{
            click: () => onMarkerClick(listing.id),
            mouseover: () => onMarkerHover(listing.id),
            mouseout: () => onMarkerHover(null),
          }}
        />
      ))}
    </MapContainer>
  );
}
