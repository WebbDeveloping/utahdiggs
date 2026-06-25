const UTAH_VIEWBOX = "-114.05,36.99,-109.04,42.01";

export type GeocodeCoords = {
  latitude: number;
  longitude: number;
};

export async function geocodeAddress(
  query: string,
): Promise<GeocodeCoords | null> {
  const url = new URL("https://nominatim.openstreetmap.org/search");
  url.searchParams.set("q", query);
  url.searchParams.set("format", "json");
  url.searchParams.set("limit", "1");
  url.searchParams.set("countrycodes", "us");
  url.searchParams.set("viewbox", UTAH_VIEWBOX);

  const response = await fetch(url.toString(), {
    headers: {
      "User-Agent": "GlideRE-Geocode/1.0 (contact@glidere.com)",
      Accept: "application/json",
    },
  });

  if (!response.ok) {
    return null;
  }

  const data = (await response.json()) as Array<{ lat: string; lon: string }>;
  if (!data.length) {
    return null;
  }

  return {
    latitude: parseFloat(data[0].lat),
    longitude: parseFloat(data[0].lon),
  };
}
