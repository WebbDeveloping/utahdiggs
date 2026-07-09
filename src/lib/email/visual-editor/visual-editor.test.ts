import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  EDITABLE_END,
  EDITABLE_START,
  canUseVisualEditor,
  editorContentToHtmlBody,
  extractEditableContent,
  htmlBodyToEditorContent,
  prepareHtmlForEditor,
  serializeEditorHtml,
  spliceEditableContent,
  styleDocumentEditableHtml,
} from "@/lib/email/visual-editor";

describe("extractEditableContent / spliceEditableContent", () => {
  it("returns the full body for fragment layouts", () => {
    const html = "<h2>Hello</h2><p>{{name}}</p>";
    assert.equal(extractEditableContent(html, "fragment"), html);
    assert.equal(spliceEditableContent(html, "<p>Updated</p>", "fragment"), "<p>Updated</p>");
  });

  it("extracts and splices document editable regions", () => {
    const shell = `<table>
${EDITABLE_START}
<p>Hi {{firstName}}</p>
${EDITABLE_END}
<footer>end</footer>
</table>`;

    assert.equal(extractEditableContent(shell, "document"), "<p>Hi {{firstName}}</p>");

    const next = spliceEditableContent(shell, "<p>Hi {{firstName}} — updated</p>", "document");
    assert.match(next, /<p>Hi \{\{firstName\}\} — updated<\/p>/);
    assert.match(next, /<footer>end<\/footer>/);
    assert.ok(next.includes(EDITABLE_START));
    assert.ok(next.includes(EDITABLE_END));
  });

  it("throws when document markers are missing", () => {
    assert.throws(
      () => extractEditableContent("<p>no markers</p>", "document"),
      /missing email-editable/,
    );
  });
});

describe("prepareHtmlForEditor / serializeEditorHtml", () => {
  it("converts inline merge vars to spans and back", () => {
    const prepared = prepareHtmlForEditor("<p>Hi {{firstName}}</p>");
    assert.equal(
      prepared,
      '<p>Hi <span data-merge-var="firstName" data-merge-kind="inline"></span></p>',
    );
    assert.equal(serializeEditorHtml(prepared), "<p>Hi {{firstName}}</p>");
  });

  it("converts standalone block merge vars to divs and back", () => {
    const html = "<h2>Title</h2>\n{{offerBlock}}\n<p>After</p>";
    const prepared = prepareHtmlForEditor(html);
    assert.match(prepared, /data-merge-var="offerBlock"/);
    assert.match(prepared, /data-merge-kind="block"/);
    assert.equal(
      serializeEditorHtml(prepared).replace(/\s+/g, ""),
      "<h2>Title</h2>{{offerBlock}}<p>After</p>",
    );
  });

  it("unwraps paragraphs that only contain a block merge chip", () => {
    const fromTipTap =
      '<p>Hello</p><p><div data-merge-var="notesBlock" data-merge-kind="block"></div></p>';
    assert.equal(serializeEditorHtml(fromTipTap), "<p>Hello</p>{{notesBlock}}");
  });

  it("does not turn brand tokens inside style attributes into chips", () => {
    const html =
      '<p style="color:{{brandText}};">Hi {{firstName}}</p>';
    const prepared = prepareHtmlForEditor(html);
    assert.equal(
      prepared,
      '<p>Hi <span data-merge-var="firstName" data-merge-kind="inline"></span></p>',
    );
    assert.doesNotMatch(prepared, /brandText/);
  });
});

describe("htmlBodyToEditorContent / editorContentToHtmlBody", () => {
  it("round-trips a fragment with merge variables", () => {
    const html =
      "<h2>{{subjectPrefix}}</h2><p><strong>Name:</strong> {{name}}</p>\n{{messageLine}}";
    const editorHtml = htmlBodyToEditorContent(html, "fragment");
    const restored = editorContentToHtmlBody(editorHtml, html, "fragment");
    assert.equal(restored.replace(/\s+/g, ""), html.replace(/\s+/g, ""));
    assert.match(restored, /\{\{subjectPrefix\}\}/);
    assert.match(restored, /\{\{messageLine\}\}/);
  });

  it("round-trips a document editable region and preserves the shell", () => {
    const html = `<!DOCTYPE html><html><body>
<table>
<tr><td>header</td></tr>
${EDITABLE_START}
<p>Hi {{firstName}},</p>
<p>Your call is at {{callTime}}.</p>
${EDITABLE_END}
{{notesBlock}}
<tr><td>footer</td></tr>
</table>
</body></html>`;

    const editorHtml = htmlBodyToEditorContent(html, "document");
    assert.match(editorHtml, /data-merge-var="firstName"/);
    assert.doesNotMatch(editorHtml, /header/);

    const restored = editorContentToHtmlBody(editorHtml, html, "document");
    assert.match(restored, /<td>header<\/td>/);
    assert.match(restored, /\{\{firstName\}\}/);
    assert.match(restored, /\{\{notesBlock\}\}/);
    assert.match(restored, /color:\{\{brandText\}\}/);
  });
});

describe("styleDocumentEditableHtml", () => {
  it("adds brand text styles to bare paragraphs", () => {
    const styled = styleDocumentEditableHtml("<p>Hello</p>");
    assert.match(styled, /color:\{\{brandText\}\}/);
  });
});

describe("canUseVisualEditor", () => {
  it("allows fragments always and documents only with markers", () => {
    assert.equal(canUseVisualEditor("<p>x</p>", "fragment"), true);
    assert.equal(canUseVisualEditor("<p>x</p>", "document"), false);
    assert.equal(
      canUseVisualEditor(
        `${EDITABLE_START}<p>x</p>${EDITABLE_END}`,
        "document",
      ),
      true,
    );
  });
});
