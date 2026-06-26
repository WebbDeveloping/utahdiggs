import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { digitsFromPhone, formatPhoneDisplay, formatPhoneInput } from "./phone";

describe("digitsFromPhone", () => {
  it("keeps 10-digit US numbers", () => {
    assert.equal(digitsFromPhone("8015551234"), "8015551234");
    assert.equal(digitsFromPhone("(801) 555-1234"), "8015551234");
  });

  it("strips a leading US country code", () => {
    assert.equal(digitsFromPhone("+1 801 555 1234"), "8015551234");
    assert.equal(digitsFromPhone("18015551234"), "8015551234");
    assert.equal(digitsFromPhone("+18015551234"), "8015551234");
  });
});

describe("formatPhoneInput", () => {
  it("formats standard US numbers", () => {
    assert.equal(formatPhoneInput("8015551234"), "(801) 555-1234");
    assert.equal(formatPhoneInput("(801) 555-1234"), "(801) 555-1234");
  });

  it("formats numbers entered with a US country code", () => {
    assert.equal(formatPhoneInput("+18015551234"), "+1 (801) 555-1234");
    assert.equal(formatPhoneInput("+1 801-555-1234"), "+1 (801) 555-1234");
    assert.equal(formatPhoneInput("18015551234"), "+1 (801) 555-1234");
  });

  it("preserves a lone plus while the user is typing", () => {
    assert.equal(formatPhoneInput("+"), "+");
  });
});

describe("formatPhoneDisplay", () => {
  it("reformats stored values that include a country code", () => {
    assert.equal(formatPhoneDisplay("18015551234"), "+1 (801) 555-1234");
    assert.equal(formatPhoneDisplay("+1 (801) 555-1234"), "+1 (801) 555-1234");
  });
});
