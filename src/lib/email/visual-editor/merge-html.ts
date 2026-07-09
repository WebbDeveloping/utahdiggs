const VARIABLE_PATTERN = /\{\{(\w+)\}\}/g;

/** Variables that inject HTML blocks rather than plain text. */
export const HTML_BLOCK_VARIABLE_NAMES = new Set([
  "preferredDateLine",
  "messageLine",
  "agreementLine",
  "notesLine",
  "tourLine",
  "notesBlock",
  "offerBlock",
]);

export function isHtmlBlockVariable(name: string): boolean {
  return HTML_BLOCK_VARIABLE_NAMES.has(name);
}

/**
 * Convert `{{vars}}` into data-attribute markers TipTap can parse as atoms.
 * Standalone block variables become divs; everything else becomes inline spans.
 * Inline style attributes are stripped (TipTap does not preserve them; document
 * templates re-apply brand styles on serialize).
 */
export function prepareHtmlForEditor(html: string): string {
  // Remove style attrs so brand tokens inside them are not turned into chips.
  let prepared = html.replace(/\sstyle="[^"]*"/gi, "");

  // Standalone block vars on their own line / between block boundaries.
  prepared = prepared.replace(
    /(^|>)\s*\{\{(\w+)\}\}\s*(?=<|$)/gm,
    (match, prefix: string, name: string) => {
      if (!isHtmlBlockVariable(name)) {
        return match;
      }
      return `${prefix}<div data-merge-var="${name}" data-merge-kind="block"></div>`;
    },
  );

  prepared = prepared.replace(VARIABLE_PATTERN, (_match, name: string) => {
    if (isHtmlBlockVariable(name)) {
      return `<div data-merge-var="${name}" data-merge-kind="block"></div>`;
    }
    return `<span data-merge-var="${name}" data-merge-kind="inline"></span>`;
  });

  return prepared;
}

/**
 * Convert TipTap HTML (with merge markers) back to `{{var}}` template tokens.
 */
export function serializeEditorHtml(html: string): string {
  let serialized = html;

  // TipTap may wrap a lone block chip in a paragraph.
  serialized = serialized.replace(
    /<p>\s*<div data-merge-var="(\w+)"[^>]*>[\s\S]*?<\/div>\s*<\/p>/gi,
    (_match, name: string) => `{{${name}}}`,
  );

  serialized = serialized.replace(
    /<(div|span) data-merge-var="(\w+)"[^>]*>[\s\S]*?<\/\1>/gi,
    (_match, _tag: string, name: string) => `{{${name}}}`,
  );

  // Self-closing / empty forms from prepareHtmlForEditor
  serialized = serialized.replace(
    /<(div|span) data-merge-var="(\w+)"[^>]*\/?>/gi,
    (_match, _tag: string, name: string) => `{{${name}}}`,
  );

  return serialized.trim();
}

/**
 * Apply email-friendly inline styles when splicing document body content.
 * Fragment templates keep TipTap HTML as-is.
 */
export function styleDocumentEditableHtml(html: string): string {
  let styled = html;

  styled = styled.replace(
    /<p(?![^>]*style=)/gi,
    '<p style="font-size:15px;color:{{brandText}};line-height:1.65;margin:0 0 12px;"',
  );

  styled = styled.replace(
    /<h2(?![^>]*style=)/gi,
    '<h2 style="font-size:18px;font-weight:600;color:{{brandText}};margin:0 0 12px;"',
  );

  styled = styled.replace(
    /<a (?![^>]*style=)/gi,
    '<a style="color:{{brandLink}};" ',
  );

  return styled;
}
