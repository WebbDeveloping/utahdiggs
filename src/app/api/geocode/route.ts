import { NextRequest, NextResponse } from "next/server";
import type { GeocodeResult } from "@/types/public-listing";

const cache = new Map<string, GeocodeResult>();

const UTAH_VIEWBOX = "-114.05,36.99,-109.04,42.01";

export async function GET(request: NextRequest) {
  const q = request.nextUrl.searchParams.get("q")?.trim();

  if (!q) {
    return NextResponse.json({ error: "Missing query parameter q" }, { status: 400 });
  }

  const cacheKey = q.toLowerCase();
  const cached = cache.get(cacheKey);
  if (cached) {
    return NextResponse.json(cached);
  }

  try {
    const url = new URL("https://nominatim.openstreetmap.org/search");
    url.searchParams.set("q", q);
    url.searchParams.set("format", "json");
    url.searchParams.set("limit", "1");
    url.searchParams.set("countrycodes", "us");
    url.searchParams.set("viewbox", UTAH_VIEWBOX);
    url.searchParams.set("bounded", "0");

    const response = await fetch(url.toString(), {
      headers: {
        "User-Agent": "GlideRE-PropertySearch/1.0 (contact@glidere.com)",
        Accept: "application/json",
      },
      next: { revalidate: 86400 },
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: "Geocoding service unavailable" },
        { status: 502 },
      );
    }

    const data = (await response.json()) as Array<{
      lat: string;
      lon: string;
      boundingbox: [string, string, string, string];
      display_name: string;
    }>;

    if (!data.length) {
      return NextResponse.json({ error: "Location not found" }, { status: 404 });
    }

    const result: GeocodeResult = {
      lat: parseFloat(data[0].lat),
      lng: parseFloat(data[0].lon),
      bbox: [
        parseFloat(data[0].boundingbox[2]),
        parseFloat(data[0].boundingbox[0]),
        parseFloat(data[0].boundingbox[3]),
        parseFloat(data[0].boundingbox[1]),
      ],
      displayName: data[0].display_name,
    };

    cache.set(cacheKey, result);
    return NextResponse.json(result);
  } catch {
    return NextResponse.json({ error: "Geocoding failed" }, { status: 500 });
  }
}
