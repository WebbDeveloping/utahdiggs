import type { Metadata } from "next";
import {
  DEFAULT_DESCRIPTION,
  DEFAULT_TITLE,
  OG_IMAGES,
  SITE_NAME,
  SITE_URL,
} from "@/lib/seo/site";

export type PageMetadataOptions = {
  title: string;
  description?: string;
  path?: string;
  ogImage?: string;
  noIndex?: boolean;
  /** When true, title is used as-is without the site template suffix. */
  absoluteTitle?: boolean;
};

function resolveOgImage(path?: string): string {
  return path ?? OG_IMAGES.default;
}

function buildOgImageUrl(imagePath: string): string {
  return imagePath.startsWith("http") ? imagePath : `${SITE_URL}${imagePath}`;
}

function buildPageUrl(path?: string): string | undefined {
  if (!path) return undefined;
  return `${SITE_URL}${path.startsWith("/") ? path : `/${path}`}`;
}

export function createPageMetadata(options: PageMetadataOptions): Metadata {
  const description = options.description ?? DEFAULT_DESCRIPTION;
  const ogImagePath = resolveOgImage(options.ogImage);
  const ogImageUrl = buildOgImageUrl(ogImagePath);
  const pageUrl = buildPageUrl(options.path);

  const displayTitle = options.absoluteTitle
    ? options.title
    : `${options.title} — ${SITE_NAME}`;

  const title: Metadata["title"] = options.absoluteTitle
    ? { absolute: options.title }
    : options.title;

  const metadata: Metadata = {
    title,
    description,
    ...(pageUrl ? { alternates: { canonical: pageUrl } } : {}),
    ...(options.noIndex
      ? { robots: { index: false, follow: false } }
      : {}),
    openGraph: {
      title: displayTitle,
      description,
      siteName: SITE_NAME,
      locale: "en_US",
      type: "website",
      ...(pageUrl ? { url: pageUrl } : {}),
      images: [{ url: ogImageUrl, alt: displayTitle }],
    },
    twitter: {
      card: "summary_large_image",
      title: displayTitle,
      description,
      images: [ogImageUrl],
    },
  };

  return metadata;
}

export function createRootMetadata(): Metadata {
  const ogImageUrl = buildOgImageUrl(OG_IMAGES.default);

  return {
    metadataBase: new URL(SITE_URL),
    title: {
      default: DEFAULT_TITLE,
      template: `%s — ${SITE_NAME}`,
    },
    description: DEFAULT_DESCRIPTION,
    openGraph: {
      title: DEFAULT_TITLE,
      description: DEFAULT_DESCRIPTION,
      siteName: SITE_NAME,
      locale: "en_US",
      type: "website",
      url: SITE_URL,
      images: [{ url: ogImageUrl, alt: DEFAULT_TITLE }],
    },
    twitter: {
      card: "summary_large_image",
      title: DEFAULT_TITLE,
      description: DEFAULT_DESCRIPTION,
      images: [ogImageUrl],
    },
  };
}
