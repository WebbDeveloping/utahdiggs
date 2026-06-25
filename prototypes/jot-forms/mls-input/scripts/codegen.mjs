#!/usr/bin/env node
/**
 * Generate TypeScript from MLS input YAML spec.
 * Run: npm run mls-input:codegen
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { parse } from "yaml";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const OUT = path.resolve(ROOT, "../../../src/lib/mls-input");

function readYaml(filePath) {
  return parse(fs.readFileSync(filePath, "utf8"));
}

function normalizeOptions(options) {
  if (!options) return [];
  return options.map((o) => {
    if (typeof o === "string") return o;
    if (o && typeof o === "object") {
      return o.value === "other" ? "Other" : (o.label ?? o.value ?? "Other");
    }
    return String(o);
  });
}

function hasOtherOption(options) {
  if (!options) return false;
  return options.some(
    (o) => typeof o === "object" && o !== null && (o.value === "other" || o.allowText),
  );
}

function resolveField(field, root) {
  if (field.$ref) {
    const optPath = path.join(ROOT, field.$ref);
    const opt = readYaml(optPath);
    const rawOptions = opt.options ?? [];
    return {
      ...field,
      label: field.label ?? opt.label,
      options: normalizeOptions(rawOptions),
      otherText: hasOtherOption(rawOptions),
    };
  }
  if (field.options) {
    return {
      ...field,
      options: normalizeOptions(field.options),
      otherText: hasOtherOption(field.options),
    };
  }
  return field;
}

function loadSteps() {
  const form = readYaml(path.join(ROOT, "form.yaml"));
  return form.steps.map((stepRef, index) => {
    const stepPath = path.join(ROOT, stepRef.file);
    const step = readYaml(stepPath);
    const fields = (step.fields ?? []).map((f) => resolveField(f, ROOT));
    return {
      order: index + 1,
      id: step.id,
      title: step.title,
      intro: step.intro ?? null,
      fields,
    };
  });
}

function esc(str) {
  return JSON.stringify(str);
}

function zodForField(field) {
  const { id, type, required, options, rows, columns } = field;
  const req = required === true;

  switch (type) {
    case "content":
      return null;
    case "fullname":
      return req
        ? `z.object({ first: z.string().min(1, "First name is required"), last: z.string().min(1, "Last name is required") })`
        : `z.object({ first: z.string(), last: z.string() }).optional()`;
    case "address":
      return req
        ? `z.object({ street: z.string().min(1, "Street is required"), city: z.string().min(1, "City is required"), state: z.string().min(1, "State is required"), zip: z.string().min(1, "ZIP is required") })`
        : `z.object({ street: z.string(), city: z.string(), state: z.string(), zip: z.string() }).optional()`;
    case "phone":
      return req ? `z.string().min(7, "Phone is required")` : `z.string().optional()`;
    case "email":
      return req
        ? `z.string().email("Valid email is required")`
        : `z.string().email().optional().or(z.literal(""))`;
    case "currency":
    case "number":
      return req ? `z.string().min(1, "Required")` : `z.string().optional()`;
    case "textarea":
    case "text":
    case "select":
      return req ? `z.string().min(1, "Required")` : `z.string().optional()`;
    case "radio":
      if (options?.length && !field.otherText) {
        const vals = options.map((o) => esc(o)).join(", ");
        return req
          ? `z.enum([${vals}] as const, { message: "Required" })`
          : `z.enum([${vals}] as const).optional()`;
      }
      return req ? `z.string().min(1, "Required")` : `z.string().optional()`;
    case "checkbox":
      return req
        ? `z.array(z.string()).min(1, "Select at least one")`
        : `z.array(z.string()).optional()`;
    case "matrix": {
      const colShape = (columns ?? [])
        .map((c) => {
          if (c.type === "checkbox") return `${esc(c.id)}: z.array(z.string()).optional()`;
          if (c.type === "select" && c.options?.length) {
            const vals = c.options.map((o) => esc(o)).join(", ");
            return `${esc(c.id)}: z.enum([${vals}] as const).optional()`;
          }
          return `${esc(c.id)}: z.string().optional()`;
        })
        .join(", ");
      const rowShape = `z.record(z.string(), z.object({ ${colShape} }).partial())`;
      return req ? rowShape : `${rowShape}.optional()`;
    }
    case "file":
      return req
        ? `z.array(z.object({ name: z.string(), url: z.string().url() })).min(1, "Upload at least one file")`
        : `z.array(z.object({ name: z.string(), url: z.string().url() })).optional()`;
    case "signature":
      return req ? `z.string().url("Signature is required")` : `z.string().url().optional().or(z.literal(""))`;
    default:
      return req ? `z.string().min(1, "Required")` : `z.string().optional()`;
  }
}

function tsTypeForField(field) {
  const { type } = field;
  switch (type) {
    case "content":
      return null;
    case "fullname":
      return "{ first: string; last: string }";
    case "address":
      return "{ street: string; city: string; state: string; zip: string }";
    case "checkbox":
      return "string[]";
    case "matrix":
      return "Record<string, Record<string, string | string[]>>";
    case "file":
      return "Array<{ name: string; url: string }>";
    case "signature":
      return "string";
    default:
      return "string";
  }
}

function generateSchema(steps) {
  const fieldTypes = [];
  for (const step of steps) {
    for (const field of step.fields) {
      const ts = tsTypeForField(field);
      if (ts) fieldTypes.push(`  ${JSON.stringify(field.id)}?: ${ts};`);
    }
  }

  const stepsJson = JSON.stringify(
    steps.map((s) => ({
      order: s.order,
      id: s.id,
      title: s.title,
      intro: s.intro,
      fields: s.fields.map((f) => {
        const { jotform, $ref, ...rest } = f;
        return rest;
      }),
    })),
    null,
    2,
  );

  return `// AUTO-GENERATED by prototypes/jot-forms/mls-input/scripts/codegen.mjs — do not edit manually

export type MlsInputFieldType =
  | "text"
  | "textarea"
  | "radio"
  | "checkbox"
  | "select"
  | "number"
  | "currency"
  | "email"
  | "phone"
  | "fullname"
  | "address"
  | "matrix"
  | "file"
  | "signature"
  | "content";

export type MlsInputMatrixColumn = {
  id: string;
  label: string;
  type: string;
  options?: string[];
};

export type MlsInputField = {
  id: string;
  label?: string;
  type: MlsInputFieldType;
  required?: boolean;
  options?: string[];
  placeholder?: string;
  description?: string;
  content?: string;
  status?: string;
  rows?: string[];
  columns?: MlsInputMatrixColumn[];
  dynamic?: {
    rowCountFrom?: string;
    rowLabels?: string[];
  };
  otherText?: boolean;
  multiple?: boolean;
  min?: number;
  max?: number;
  default?: number;
};

export type MlsInputStep = {
  order: number;
  id: string;
  title: string;
  intro?: string | null;
  fields: MlsInputField[];
};

export type MlsInputFormValues = {
${fieldTypes.join("\n")}
  inquiryId?: string;
  photos?: Array<{ name: string; url: string }>;
};

export const MLS_INPUT_STEPS: MlsInputStep[] = ${stepsJson};

export const MLS_INPUT_STEP_COUNT = MLS_INPUT_STEPS.length;

export function getMlsInputStep(order: number): MlsInputStep | undefined {
  return MLS_INPUT_STEPS.find((s) => s.order === order);
}

export function getAllMlsFieldIds(): string[] {
  const ids: string[] = [];
  for (const step of MLS_INPUT_STEPS) {
    for (const field of step.fields) {
      if (field.type !== "content") ids.push(field.id);
    }
  }
  return ids;
}

export function getFieldById(fieldId: string): MlsInputField | undefined {
  for (const step of MLS_INPUT_STEPS) {
    const field = step.fields.find((f) => f.id === fieldId);
    if (field) return field;
  }
  return undefined;
}
`;
}

function generateValidation(steps) {
  const stepSchemas = steps.map((step) => {
    const shape = [];
    for (const field of step.fields) {
      const z = zodForField(field);
      if (z) shape.push(`    ${JSON.stringify(field.id)}: ${z},`);
    }
    return `export const step${step.order}Schema = z.object({\n${shape.join("\n")}\n});`;
  });

  const allShape = [];
  for (const step of steps) {
    for (const field of step.fields) {
      const z = zodForField(field);
      if (z) allShape.push(`  ${JSON.stringify(field.id)}: ${z},`);
    }
  }

  return `// AUTO-GENERATED by prototypes/jot-forms/mls-input/scripts/codegen.mjs — do not edit manually
import { z } from "zod";
import { MLS_INPUT_STEPS } from "./schema";
import { isFieldVisible } from "./conditions";

${stepSchemas.join("\n\n")}

export const fullMlsInputSchema = z.object({
${allShape.join("\n")}
  inquiryId: z.string().optional(),
  photos: z.array(z.object({ name: z.string(), url: z.string().url() })).optional(),
});

export type FullMlsInputValues = z.infer<typeof fullMlsInputSchema>;

const stepSchemas = [
${steps.map((s) => `  step${s.order}Schema`).join(",\n")}
] as const;

export function validateMlsInputStep(
  stepOrder: number,
  values: Record<string, unknown>,
): { success: true } | { success: false; fieldErrors: Record<string, string> } {
  const schema = stepSchemas[stepOrder - 1];
  if (!schema) return { success: true };

  const visibleShape: Record<string, z.ZodTypeAny> = {};
  const step = MLS_INPUT_STEPS[stepOrder - 1];
  if (!step) return { success: true };

  for (const field of step.fields) {
    if (field.type === "content") continue;
    if (!isFieldVisible(field.id, values)) continue;
    const fieldSchema = (schema.shape as Record<string, z.ZodTypeAny>)[field.id];
    if (fieldSchema) visibleShape[field.id] = fieldSchema;
  }

  const result = z.object(visibleShape).safeParse(values);
  if (result.success) return { success: true };

  const fieldErrors: Record<string, string> = {};
  for (const issue of result.error.issues) {
    const key = issue.path[0];
    if (typeof key === "string" && !fieldErrors[key]) {
      fieldErrors[key] = issue.message;
    }
  }
  return { success: false, fieldErrors };
}

export function validateFullMlsInput(
  values: Record<string, unknown>,
): { success: true; data: FullMlsInputValues } | { success: false; fieldErrors: Record<string, string> } {
  const visibleShape: Record<string, z.ZodTypeAny> = {};
  for (const [key, schema] of Object.entries(fullMlsInputSchema.shape)) {
    if (key === "inquiryId" || key === "photos") {
      visibleShape[key] = schema;
      continue;
    }
    if (isFieldVisible(key, values)) {
      visibleShape[key] = schema;
    }
  }

  const result = z.object(visibleShape).safeParse(values);
  if (result.success) return { success: true, data: result.data as FullMlsInputValues };

  const fieldErrors: Record<string, string> = {};
  for (const issue of result.error.issues) {
    const key = issue.path[0];
    if (typeof key === "string" && !fieldErrors[key]) {
      fieldErrors[key] = issue.message;
    }
  }
  return { success: false, fieldErrors };
}
`;
}

function generateConditions() {
  const conditions = readYaml(path.join(ROOT, "conditions.yaml"));

  return `// AUTO-GENERATED by prototypes/jot-forms/mls-input/scripts/codegen.mjs — do not edit manually

export type ConditionWhen = {
  field?: string;
  equals?: string;
  includes?: string;
  all?: Array<{ field: string; equals?: string; includes?: string }>;
};

export type ConditionRule = {
  id: string;
  description?: string;
  when?: ConditionWhen;
  all?: Array<{ field: string; equals?: string; includes?: string }>;
  show?: string[];
  dynamic?: {
    field: string;
    rowCountFrom: string;
    rowLabels: string[];
  };
};

export const MLS_CONDITION_RULES: ConditionRule[] = ${JSON.stringify(conditions.rules, null, 2)};

const HIDDEN_BY_DEFAULT = new Set<string>(${JSON.stringify(
    (() => {
      const steps = loadSteps();
      const hidden = [];
      for (const step of steps) {
        for (const field of step.fields) {
          if (field.status === "hidden-in-jotform") hidden.push(field.id);
        }
      }
      return hidden;
    })(),
  )});

function getFieldValue(values: Record<string, unknown>, fieldId: string): unknown {
  return values[fieldId];
}

function matchesCondition(
  cond: { field: string; equals?: string; includes?: string },
  values: Record<string, unknown>,
): boolean {
  const val = getFieldValue(values, cond.field);
  if (cond.equals !== undefined) return val === cond.equals;
  if (cond.includes !== undefined) {
    if (Array.isArray(val)) return val.includes(cond.includes);
    return false;
  }
  return false;
}

function matchesWhen(when: ConditionWhen, values: Record<string, unknown>): boolean {
  if (when.all?.length) {
    return when.all.every((c) => matchesCondition(c, values));
  }
  if (when.field) {
    return matchesCondition(
      { field: when.field, equals: when.equals, includes: when.includes },
      values,
    );
  }
  return false;
}

function ruleMatches(rule: ConditionRule, values: Record<string, unknown>): boolean {
  if (rule.when) return matchesWhen(rule.when, values);
  if (rule.all) return rule.all.every((c) => matchesCondition(c, values));
  return false;
}

const shownByRules = new Map<string, Set<string>>();

for (const rule of MLS_CONDITION_RULES) {
  if (!rule.show) continue;
  const key = JSON.stringify(rule.when ?? rule.all ?? {});
  if (!shownByRules.has(key)) shownByRules.set(key, new Set());
  for (const id of rule.show) shownByRules.get(key)!.add(id);
}

export function isFieldVisible(fieldId: string, values: Record<string, unknown>): boolean {
  if (!HIDDEN_BY_DEFAULT.has(fieldId)) return true;

  for (const rule of MLS_CONDITION_RULES) {
    if (!rule.show?.includes(fieldId)) continue;
    if (ruleMatches(rule, values)) return true;
  }
  return false;
}

export function getMatrixRowCount(
  matrixFieldId: string,
  values: Record<string, unknown>,
): number {
  const rule = MLS_CONDITION_RULES.find((r) => r.dynamic?.field === matrixFieldId);
  if (!rule?.dynamic) return 1;

  const countVal = getFieldValue(values, rule.dynamic.rowCountFrom);
  const labels = rule.dynamic.rowLabels ?? [];
  if (typeof countVal === "string") {
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
    if (map[countVal] !== undefined) return Math.min(map[countVal], labels.length);
    const parsed = parseInt(countVal, 10);
    if (!Number.isNaN(parsed)) return Math.min(parsed, labels.length);
  }
  if (typeof countVal === "number") return Math.min(countVal, labels.length);
  return 1;
}

export function getMatrixRowLabels(
  matrixFieldId: string,
  values: Record<string, unknown>,
): string[] {
  const rule = MLS_CONDITION_RULES.find((r) => r.dynamic?.field === matrixFieldId);
  const labels = rule?.dynamic?.rowLabels ?? [];
  const count = getMatrixRowCount(matrixFieldId, values);
  return labels.slice(0, count);
}
`;
}

function main() {
  fs.mkdirSync(OUT, { recursive: true });
  const steps = loadSteps();
  fs.writeFileSync(path.join(OUT, "schema.ts"), generateSchema(steps));
  fs.writeFileSync(path.join(OUT, "validation.ts"), generateValidation(steps));
  fs.writeFileSync(path.join(OUT, "conditions.ts"), generateConditions());
  console.log(`Generated MLS input code to ${OUT}`);
  console.log(`  ${steps.length} steps, ${steps.reduce((n, s) => n + s.fields.length, 0)} fields`);
}

main();
