import { NextRequest, NextResponse } from "next/server";
import { searchListings } from "@/lib/search/listings-query";
import { parseSearchParams } from "@/lib/search/search-params";

export async function GET(request: NextRequest) {
  try {
    const params = Object.fromEntries(request.nextUrl.searchParams.entries());
    const filters = parseSearchParams(params);
    const result = await searchListings(filters);
    return NextResponse.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Search failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
