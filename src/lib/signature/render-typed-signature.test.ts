import assert from "node:assert/strict";
import { test } from "node:test";
import {
  renderTypedSignatureToBlob,
  SIGNATURE_CANVAS_HEIGHT,
  SIGNATURE_CANVAS_WIDTH,
} from "./render-typed-signature";

test("renderTypedSignatureToBlob rejects short text", async () => {
  await assert.rejects(
    () =>
      renderTypedSignatureToBlob(
        "A",
        "Dancing Script",
        SIGNATURE_CANVAS_WIDTH,
        SIGNATURE_CANVAS_HEIGHT,
      ),
    /too short/,
  );
});
