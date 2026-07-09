export const EDITABLE_START = "<!-- email-editable:start -->";
export const EDITABLE_END = "<!-- email-editable:end -->";

export type EmailTemplateLayout = "fragment" | "document";

export function extractEditableContent(
  html: string,
  layout: EmailTemplateLayout,
): string {
  if (layout === "fragment") {
    return html;
  }

  const startIndex = html.indexOf(EDITABLE_START);
  const endIndex = html.indexOf(EDITABLE_END);

  if (startIndex === -1 || endIndex === -1 || endIndex < startIndex) {
    throw new Error(
      "Document template is missing email-editable start/end markers.",
    );
  }

  return html
    .slice(startIndex + EDITABLE_START.length, endIndex)
    .trim();
}

export function spliceEditableContent(
  html: string,
  content: string,
  layout: EmailTemplateLayout,
): string {
  if (layout === "fragment") {
    return content;
  }

  const startIndex = html.indexOf(EDITABLE_START);
  const endIndex = html.indexOf(EDITABLE_END);

  if (startIndex === -1 || endIndex === -1 || endIndex < startIndex) {
    throw new Error(
      "Document template is missing email-editable start/end markers.",
    );
  }

  const before = html.slice(0, startIndex + EDITABLE_START.length);
  const after = html.slice(endIndex);
  const normalized = content.trim();

  return `${before}\n${normalized}\n${after}`;
}

export function hasEditableMarkers(html: string): boolean {
  return html.includes(EDITABLE_START) && html.includes(EDITABLE_END);
}
