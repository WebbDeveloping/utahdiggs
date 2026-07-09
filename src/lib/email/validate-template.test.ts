import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { validateEmailTemplate } from "@/lib/email/validate-template";

describe("validateEmailTemplate", () => {
  it("returns no issues for valid template", () => {
    const result = validateEmailTemplate(
      "<p>Hi {{firstName}}</p>",
      "Hello {{firstName}}",
      ["firstName"],
    );

    assert.deepEqual(result.warnings, []);
    assert.deepEqual(result.errors, []);
  });

  it("warns about unknown variables", () => {
    const result = validateEmailTemplate(
      "<p>{{unknownVar}}</p>",
      "Subject",
      ["firstName"],
    );

    assert.ok(
      result.warnings.some((warning) => warning.includes("unknownVar")),
    );
  });

  it("warns about unused defined variables", () => {
    const result = validateEmailTemplate(
      "<p>Hello</p>",
      "Subject",
      ["firstName", "lastName"],
    );

    assert.ok(
      result.warnings.some((warning) => warning.includes("firstName")),
    );
    assert.ok(
      result.warnings.some((warning) => warning.includes("lastName")),
    );
  });

  it("errors on unclosed merge variable", () => {
    const result = validateEmailTemplate(
      "<p>Hi {{firstName</p>",
      "Subject",
      ["firstName"],
    );

    assert.equal(result.errors.length, 1);
    assert.match(result.errors[0], /unclosed/i);
  });
});
