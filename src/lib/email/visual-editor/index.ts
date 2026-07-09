import type { EmailTemplateLayout } from "@/lib/email/visual-editor/markers";
import {
  extractEditableContent,
  hasEditableMarkers,
  spliceEditableContent,
} from "@/lib/email/visual-editor/markers";
import {
  isHtmlBlockVariable,
  prepareHtmlForEditor,
  serializeEditorHtml,
  styleDocumentEditableHtml,
} from "@/lib/email/visual-editor/merge-html";

export {
  EDITABLE_END,
  EDITABLE_START,
  extractEditableContent,
  hasEditableMarkers,
  spliceEditableContent,
  type EmailTemplateLayout,
} from "@/lib/email/visual-editor/markers";

export {
  HTML_BLOCK_VARIABLE_NAMES,
  isHtmlBlockVariable,
  prepareHtmlForEditor,
  serializeEditorHtml,
  styleDocumentEditableHtml,
} from "@/lib/email/visual-editor/merge-html";

export {
  MergeVariableBlock,
  MergeVariableCommands,
  MergeVariableInline,
  createEmailEditorExtensions,
  type MergeVariableAttrs,
} from "@/lib/email/visual-editor/extensions";

/**
 * Pull the editable region and convert merge tokens into TipTap-friendly HTML.
 */
export function htmlBodyToEditorContent(
  htmlBody: string,
  layout: EmailTemplateLayout,
): string {
  const editable = extractEditableContent(htmlBody, layout);
  return prepareHtmlForEditor(editable);
}

/**
 * Convert TipTap HTML back into a full template htmlBody.
 */
export function editorContentToHtmlBody(
  editorHtml: string,
  htmlBody: string,
  layout: EmailTemplateLayout,
): string {
  let content = serializeEditorHtml(editorHtml);
  if (layout === "document") {
    content = styleDocumentEditableHtml(content);
  }
  return spliceEditableContent(htmlBody, content, layout);
}

export function canUseVisualEditor(
  htmlBody: string,
  layout: EmailTemplateLayout,
): boolean {
  if (layout === "fragment") {
    return true;
  }
  return hasEditableMarkers(htmlBody);
}
