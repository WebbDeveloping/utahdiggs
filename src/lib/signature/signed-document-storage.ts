import { get, put } from "@vercel/blob";
import {
  buildDocumentPathname,
  getPrivateBlobConfig,
  getPublicBlobConfig,
  getServerDocumentBlobAccess,
  isPublicBlobUrl,
} from "@/lib/storage/blob";

function blobUrlPathname(url: string): string | null {
  try {
    return new URL(url).pathname.replace(/^\//, "");
  } catch {
    return null;
  }
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

export async function fetchSignatureImageBytes(url: string): Promise<Uint8Array> {
  if (isPublicBlobUrl(url)) {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error("Could not fetch signature image.");
    }
    return new Uint8Array(await response.arrayBuffer());
  }

  const privateConfig = getPrivateBlobConfig();
  if (!privateConfig) {
    throw new Error("Private blob configuration is required to fetch signature image.");
  }

  const pathname = blobUrlPathname(url);
  const target = pathname ?? url;
  const result = await get(target, {
    access: "private",
    token: privateConfig.token,
    storeId: privateConfig.storeId,
  });

  if (!result || result.statusCode !== 200 || !result.stream) {
    throw new Error("Could not fetch signature image.");
  }

  return streamToUint8Array(result.stream);
}

export async function uploadSignedAgreementPdf(
  listingId: string,
  pdfBytes: Uint8Array,
): Promise<string> {
  const access = getServerDocumentBlobAccess();
  const blobConfig = getPrivateBlobConfig() ?? getPublicBlobConfig();
  const pathname = buildDocumentPathname(listingId, "uar-listing-agreement-signed.pdf");

  const result = await put(pathname, Buffer.from(pdfBytes), {
    access,
    contentType: "application/pdf",
    addRandomSuffix: false,
    token: blobConfig.token,
    storeId: blobConfig.storeId,
  });

  return result.url;
}

export async function uploadDataFormPdf(
  listingId: string,
  pdfBytes: Uint8Array,
): Promise<string> {
  const access = getServerDocumentBlobAccess();
  const blobConfig = getPrivateBlobConfig() ?? getPublicBlobConfig();
  const pathname = buildDocumentPathname(listingId, "uar-data-form-residential.pdf");

  const result = await put(pathname, Buffer.from(pdfBytes), {
    access,
    contentType: "application/pdf",
    addRandomSuffix: false,
    token: blobConfig.token,
    storeId: blobConfig.storeId,
  });

  return result.url;
}
