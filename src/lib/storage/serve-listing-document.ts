import { isPublicBlobUrl, servePrivateBlob } from "@/lib/storage/blob";

const PDF_EXTENSION = /\.pdf$/i;

const IMAGE_CONTENT_TYPES: Record<string, string> = {
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  png: "image/png",
  webp: "image/webp",
};

export type DocumentDispositionMode = "view" | "download";

function blobUrlPathname(url: string): string | null {
  try {
    return new URL(url).pathname.replace(/^\//, "");
  } catch {
    return null;
  }
}

function extensionFromValue(value: string): string | null {
  const match = value.match(/\.([a-z0-9]+)(?:\?|$)/i);
  return match?.[1]?.toLowerCase() ?? null;
}

async function streamToUint8Array(stream: ReadableStream<Uint8Array>): Promise<Uint8Array> {
  const reader = stream.getReader();
  const chunks: Uint8Array[] = [];

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    if (value) chunks.push(value);
  }

  const total = chunks.reduce((sum, chunk) => sum + chunk.length, 0);
  const result = new Uint8Array(total);
  let offset = 0;

  for (const chunk of chunks) {
    result.set(chunk, offset);
    offset += chunk.length;
  }

  return result;
}

export function getDocumentContentType(name: string, url: string): string {
  for (const value of [name, url]) {
    if (PDF_EXTENSION.test(value)) {
      return "application/pdf";
    }

    const extension = extensionFromValue(value);
    if (extension && IMAGE_CONTENT_TYPES[extension]) {
      return IMAGE_CONTENT_TYPES[extension];
    }
  }

  return "application/octet-stream";
}

export function buildContentDisposition(
  mode: DocumentDispositionMode,
  filename: string,
): string {
  const safeName = filename.replace(/[^\w\s.-]/g, "_").trim() || "document";
  const type = mode === "download" ? "attachment" : "inline";
  return `${type}; filename="${safeName}"`;
}

export function parseDocumentDisposition(
  value: string | null,
): DocumentDispositionMode {
  return value === "attachment" ? "download" : "view";
}

export async function fetchListingDocumentBytes(url: string): Promise<Uint8Array> {
  if (isPublicBlobUrl(url)) {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error("Could not fetch document.");
    }
    return new Uint8Array(await response.arrayBuffer());
  }

  const pathname = blobUrlPathname(url);
  const target = pathname ?? url;
  const result = await servePrivateBlob(target);

  if (!result || result.statusCode !== 200 || !result.stream) {
    throw new Error("Could not fetch document.");
  }

  return streamToUint8Array(result.stream);
}

export async function resolveListingDocumentResponse(input: {
  url: string;
  name: string;
  mode: DocumentDispositionMode;
}): Promise<{
  body: Uint8Array;
  contentType: string;
  contentDisposition: string;
}> {
  const body = await fetchListingDocumentBytes(input.url);

  return {
    body,
    contentType: getDocumentContentType(input.name, input.url),
    contentDisposition: buildContentDisposition(input.mode, input.name),
  };
}
