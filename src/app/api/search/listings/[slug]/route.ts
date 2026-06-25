import { NextRequest, NextResponse } from "next/server";
import { getPublicListingBySlug } from "@/lib/search/listings-query";

type RouteContext = {
  params: Promise<{ slug: string }>;
};

export async function GET(_request: NextRequest, context: RouteContext) {
  try {
    const { slug } = await context.params;
    const listing = await getPublicListingBySlug(slug);

    if (!listing) {
      return NextResponse.json({ error: "Listing not found" }, { status: 404 });
    }

    return NextResponse.json(listing);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to load listing";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
