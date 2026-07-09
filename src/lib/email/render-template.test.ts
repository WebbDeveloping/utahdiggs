import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { brandThemeToVars } from "@/lib/email/email-brand-config";
import {
  interpolateTemplate,
  renderEmailContent,
} from "@/lib/email/render-template";
import {
  getEmailTemplateDefinition,
  isValidEmailTemplateSlug,
  listEmailTemplateDefinitions,
} from "@/lib/email/template-definitions";
import {
  extractEditableContent,
  spliceEditableContent,
} from "@/lib/email/visual-editor";

describe("interpolateTemplate", () => {
  it("replaces known variables", () => {
    const result = interpolateTemplate("Hello {{firstName}} — {{address}}", {
      firstName: "Jane",
      address: "123 Main St",
    });
    assert.equal(result, "Hello Jane — 123 Main St");
  });

  it("replaces missing variables with empty strings", () => {
    const result = interpolateTemplate("Hi {{name}}, {{missing}}", {
      name: "Alex",
    });
    assert.equal(result, "Hi Alex, ");
  });

  it("leaves HTML blocks intact when provided as variables", () => {
    const result = interpolateTemplate("<p>{{notesBlock}}</p>", {
      notesBlock: "<strong>Notes</strong>",
    });
    assert.equal(result, "<p><strong>Notes</strong></p>");
  });
});

describe("brand theme variables", () => {
  it("interpolates brand tokens into template HTML", () => {
    const vars = brandThemeToVars({
      primaryColor: "#112233",
      pageBackground: "#AABBCC",
      cardBackground: "#DDEEFF",
      bodyTextColor: "#010203",
      mutedTextColor: "#040506",
      linkColor: "#070809",
      accentBackground: "#0A0B0C",
      buttonRadius: "12px",
    });

    const result = interpolateTemplate(
      '<div style="background:{{brandPrimary}};border-radius:{{brandButtonRadius}};">{{brandText}}</div>',
      vars,
    );

    assert.match(result, /background:#112233/);
    assert.match(result, /border-radius:12px/);
    assert.match(result, />#010203</);
  });
});

describe("renderEmailContent", () => {
  it("renders subject and html together", () => {
    const rendered = renderEmailContent(
      "New offer: {{address}}, {{city}}",
      "<h2>{{buyerName}}</h2>",
      {
        address: "123 Main St",
        city: "Provo",
        buyerName: "Alex Buyer",
      },
    );

    assert.equal(rendered.subject, "New offer: 123 Main St, Provo");
    assert.equal(rendered.html, "<h2>Alex Buyer</h2>");
  });
});

describe("email template definitions", () => {
  it("includes all known transactional templates", () => {
    const slugs = listEmailTemplateDefinitions().map((definition) => definition.slug);
    assert.deepEqual(slugs, [
      "listing-inquiry",
      "mls-intake-submitted",
      "onboarding-call-scheduled",
      "onboarding-call-confirmation",
      "offer-submitted",
      "listing-activated",
      "listing-assigned",
      "listing-welcome",
    ]);
  });

  it("validates slugs", () => {
    assert.equal(isValidEmailTemplateSlug("listing-welcome"), true);
    assert.equal(isValidEmailTemplateSlug("unknown-template"), false);
  });

  it("provides sample data for previews", () => {
    const definition = getEmailTemplateDefinition("listing-welcome");
    assert.ok(definition);
    assert.match(definition.sampleData.propertyLine, /Provo/);
    assert.match(definition.defaultHtmlBody, /{{firstName}}/);
  });

  it("marks designed templates as documents with editable regions", () => {
    const welcome = getEmailTemplateDefinition("listing-welcome");
    const confirmation = getEmailTemplateDefinition("onboarding-call-confirmation");
    const inquiry = getEmailTemplateDefinition("listing-inquiry");
    assert.equal(welcome?.layout, "document");
    assert.equal(confirmation?.layout, "document");
    assert.equal(inquiry?.layout, "fragment");
    assert.match(welcome?.defaultHtmlBody ?? "", /email-editable:start/);
    assert.match(confirmation?.defaultHtmlBody ?? "", /email-editable:end/);
  });

  it("round-trips designed template editable regions through extract/splice", () => {
    for (const slug of ["listing-welcome", "onboarding-call-confirmation"] as const) {
      const definition = getEmailTemplateDefinition(slug);
      assert.ok(definition);
      const editable = extractEditableContent(definition.defaultHtmlBody, "document");
      assert.match(editable, /\{\{firstName\}\}/);
      const spliced = spliceEditableContent(
        definition.defaultHtmlBody,
        editable,
        "document",
      );
      assert.match(spliced, /email-editable:start/);
      assert.match(spliced, /\{\{firstName\}\}/);
      assert.ok(spliced.includes("email-card") || spliced.includes("Your call is scheduled"));
    }
  });
});
