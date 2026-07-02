const DEFAULT_FALLBACK = "/account";

/**
 * Returns a safe same-origin relative redirect path.
 * Rejects protocol-relative URLs, absolute URLs, and malformed paths.
 */
export function getSafeRedirectPath(
  input: string | null | undefined,
  fallback = DEFAULT_FALLBACK,
): string {
  if (!input) {
    return fallback;
  }

  const trimmed = input.trim();

  if (
    !trimmed.startsWith("/") ||
    trimmed.startsWith("//") ||
    trimmed.includes("://") ||
    trimmed.includes("\\")
  ) {
    return fallback;
  }

  return trimmed;
}

export function appendNextParam(path: string, next: string | null | undefined): string {
  const safeNext = getSafeRedirectPath(next, "");
  if (!safeNext) {
    return path;
  }

  const separator = path.includes("?") ? "&" : "?";
  return `${path}${separator}next=${encodeURIComponent(safeNext)}`;
}

export function isListingFlowRedirect(next: string | null | undefined): boolean {
  const safe = getSafeRedirectPath(next, "");
  return safe.includes("/account/listings/new") || safe.includes("/sell/inquiry");
}
