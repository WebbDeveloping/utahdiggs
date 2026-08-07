/** Above-grade level labels in ascending order (Main → Level 4). */
export const ABOVE_GRADE_LEVEL_LABELS = [
  "Main Level",
  "Level 2",
  "Level 3",
  "Level 4",
] as const;

export const LEVEL_MATRIX_FIELD_ID = "q117-2level117";

function parseLevelCount(value: unknown): number {
  if (typeof value === "number" && Number.isFinite(value)) {
    return Math.max(1, Math.min(5, Math.trunc(value)));
  }
  if (typeof value === "string") {
    const map: Record<string, number> = {
      One: 1,
      Two: 2,
      Three: 3,
      Four: 4,
      Five: 5,
      "1": 1,
      "2": 2,
      "3": 3,
      "4": 4,
      "5": 5,
    };
    if (map[value] !== undefined) return map[value];
    const parsed = parseInt(value, 10);
    if (!Number.isNaN(parsed)) return Math.max(1, Math.min(5, parsed));
  }
  return 1;
}

/**
 * Compose MLS level-matrix row labels from hasBasement + levelCount.
 * Level count is total levels including basement when hasBasement is Yes.
 * Yes + 1 soft-floors to Basement + Main Level so a basement-only row never appears.
 */
export function getLevelMatrixRowLabels(values: Record<string, unknown>): string[] {
  const hasBasement = values.hasBasement === "Yes";
  let count = parseLevelCount(values.levelCount);

  if (hasBasement) {
    if (count < 2) count = 2;
    const aboveCount = count - 1;
    return ["Basement", ...ABOVE_GRADE_LEVEL_LABELS.slice(0, aboveCount)];
  }

  return [...ABOVE_GRADE_LEVEL_LABELS.slice(0, count)];
}

/** Drop matrix row keys that are not in the currently visible label set. */
export function pruneLevelMatrixRows(
  matrix: unknown,
  visibleLabels: string[],
): Record<string, Record<string, string | string[]>> | undefined {
  if (!matrix || typeof matrix !== "object" || Array.isArray(matrix)) {
    return undefined;
  }

  const allowed = new Set(visibleLabels);
  const source = matrix as Record<string, Record<string, string | string[]>>;
  const next: Record<string, Record<string, string | string[]>> = {};
  let kept = 0;

  for (const [label, row] of Object.entries(source)) {
    if (!allowed.has(label)) continue;
    next[label] = row;
    kept += 1;
  }

  if (kept === 0) return undefined;
  return next;
}
