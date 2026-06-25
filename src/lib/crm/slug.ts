import { prisma } from "@/lib/db";

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export async function generateUniquePortalSlug(
  address: string,
  city: string,
): Promise<string> {
  let base = slugify(`${address}-${city}`);
  if (!base) base = "listing";

  let slug = base;
  let counter = 2;

  while (await prisma.listing.findUnique({ where: { portalSlug: slug } })) {
    slug = `${base}-${counter}`;
    counter++;
  }

  return slug;
}
