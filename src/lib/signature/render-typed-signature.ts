export const SIGNATURE_CANVAS_WIDTH = 310;
export const SIGNATURE_CANVAS_HEIGHT = 114;

const MIN_FONT_SIZE = 24;
const MAX_FONT_SIZE = 56;
const HORIZONTAL_PADDING = 16;

async function loadFont(fontFamily: string, fontSize: number): Promise<void> {
  await document.fonts.load(`${fontSize}px ${fontFamily}`);
}

function measureTextWidth(
  ctx: CanvasRenderingContext2D,
  text: string,
): number {
  return ctx.measureText(text).width;
}

export async function renderTypedSignatureToBlob(
  text: string,
  fontFamily: string,
  width = SIGNATURE_CANVAS_WIDTH,
  height = SIGNATURE_CANVAS_HEIGHT,
): Promise<Blob> {
  const trimmed = text.trim();
  if (trimmed.length < 2) {
    throw new Error("Signature text is too short.");
  }

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) {
    throw new Error("Could not create signature canvas.");
  }

  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, width, height);
  ctx.fillStyle = "#000000";
  ctx.textBaseline = "middle";

  let fontSize = MAX_FONT_SIZE;
  await loadFont(fontFamily, fontSize);
  ctx.font = `${fontSize}px ${fontFamily}`;

  const maxWidth = width - HORIZONTAL_PADDING * 2;
  while (fontSize > MIN_FONT_SIZE && measureTextWidth(ctx, trimmed) > maxWidth) {
    fontSize -= 2;
    await loadFont(fontFamily, fontSize);
    ctx.font = `${fontSize}px ${fontFamily}`;
  }

  const textWidth = measureTextWidth(ctx, trimmed);
  const x = (width - textWidth) / 2;
  const y = height / 2;
  ctx.fillText(trimmed, x, y);

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) resolve(blob);
        else reject(new Error("Could not render signature image."));
      },
      "image/png",
    );
  });
}
