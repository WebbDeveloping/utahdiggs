import fs from "fs";
import path from "path";

const DEMO_SOURCE_DIR = path.join(
  process.cwd(),
  "example-code/demo-real-estate-images",
);
const PUBLIC_SEED_DIR = path.join(process.cwd(), "public/seed-photos");

const PHOTO_LABELS = [
  "Front exterior",
  "Back exterior",
  "Living room",
  "Kitchen",
  "Primary bedroom",
] as const;

export function getAppBaseUrl(): string {
  return (
    process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "") ??
    "http://localhost:3000"
  );
}

function ensureDir(dir: string): void {
  fs.mkdirSync(dir, { recursive: true });
}

function copyIfExists(source: string, dest: string): boolean {
  if (!fs.existsSync(source)) return false;
  ensureDir(path.dirname(dest));
  fs.copyFileSync(source, dest);
  return true;
}

export type SeedPhoto = { name: string; url: string };

export function copySeedPhotos(
  portalSlug: string,
  imageNumbers: number[],
): { photos: SeedPhoto[]; copied: number; missing: number } {
  const baseUrl = getAppBaseUrl();
  const destDir = path.join(PUBLIC_SEED_DIR, portalSlug);
  const photos: SeedPhoto[] = [];
  let copied = 0;
  let missing = 0;

  imageNumbers.forEach((num, index) => {
    const filename = `${num}.png`;
    const source = path.join(DEMO_SOURCE_DIR, filename);
    const dest = path.join(destDir, filename);
    const label = PHOTO_LABELS[index] ?? `Photo ${index + 1}`;

    if (copyIfExists(source, dest)) {
      copied += 1;
      photos.push({
        name: label,
        url: `${baseUrl}/seed-photos/${portalSlug}/${filename}`,
      });
    } else {
      missing += 1;
      photos.push({
        name: label,
        url: `https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=1200&q=80&sig=${portalSlug}-${num}`,
      });
    }
  });

  if (missing > 0) {
    console.warn(
      `  [seed-photos] ${portalSlug}: ${missing} demo image(s) missing from ${DEMO_SOURCE_DIR}; using fallback URLs`,
    );
  }

  return { photos, copied, missing };
}

export function copySignaturePhoto(): { url: string; copied: boolean } {
  const baseUrl = getAppBaseUrl();
  const dest = path.join(PUBLIC_SEED_DIR, "signature.png");
  const source = path.join(DEMO_SOURCE_DIR, "1.png");

  const copied = copyIfExists(source, dest);
  if (!copied) {
    console.warn(
      `  [seed-photos] signature.png not copied (source missing); using fallback URL`,
    );
  }

  return {
    url: copied
      ? `${baseUrl}/seed-photos/signature.png`
      : "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=400&q=80",
    copied,
  };
}
