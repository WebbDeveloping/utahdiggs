#!/usr/bin/env node
/**
 * Validates MLS input YAML spec structure.
 * Run: node prototypes/jot-forms/mls-input/scripts/validate.mjs
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");

function loadYamlLike(filePath) {
  return fs.readFileSync(filePath, "utf8");
}

function countFields(stepText) {
  return (stepText.match(/^\s+- id:/gm) || []).length;
}

function main() {
  const formPath = path.join(ROOT, "form.yaml");
  const stepsDir = path.join(ROOT, "steps");
  const optionsDir = path.join(ROOT, "options");
  const errors = [];
  const warnings = [];

  if (!fs.existsSync(formPath)) {
    console.error("Missing form.yaml");
    process.exit(1);
  }

  const formText = loadYamlLike(formPath);
  const stepRefs = [...formText.matchAll(/file: (steps\/[^\n]+)/g)].map((m) => m[1]);

  if (stepRefs.length !== 16) {
    errors.push(`Expected 16 steps in form.yaml, found ${stepRefs.length}`);
  }

  let totalFields = 0;
  const fieldIds = new Set();

  for (const ref of stepRefs) {
    const stepPath = path.join(ROOT, ref);
    if (!fs.existsSync(stepPath)) {
      errors.push(`Missing step file: ${ref}`);
      continue;
    }
    const text = loadYamlLike(stepPath);
    if (!/^\s*id:/m.test(text)) errors.push(`${ref}: missing step id`);
    if (!/^\s*title:/m.test(text)) errors.push(`${ref}: missing step title`);
    if (!/^\s*fields:/m.test(text)) errors.push(`${ref}: missing fields section`);

    const count = countFields(text);
    totalFields += count;
    if (count === 0) warnings.push(`${ref}: no fields defined`);

    for (const m of text.matchAll(/^\s+- id: (.+)$/gm)) {
      const id = m[1].trim();
      if (fieldIds.has(id)) warnings.push(`Duplicate field id: ${id}`);
      fieldIds.add(id);
    }

    for (const m of text.matchAll(/\$ref: (options\/[^\n]+)/g)) {
      const optPath = path.join(ROOT, m[1].trim());
      if (!fs.existsSync(optPath)) {
        errors.push(`${ref}: missing option file ${m[1].trim()}`);
      }
    }
  }

  const optionCount = fs.existsSync(optionsDir)
    ? fs.readdirSync(optionsDir).filter((f) => f.endsWith(".yaml")).length
    : 0;

  if (!fs.existsSync(path.join(ROOT, "conditions.yaml"))) {
    errors.push("Missing conditions.yaml");
  }

  if (!fs.existsSync(path.join(ROOT, "raw", "mls-input.txt"))) {
    warnings.push("Missing raw/mls-input.txt archive");
  } else {
    const rawSize = fs.statSync(path.join(ROOT, "raw", "mls-input.txt")).size;
    if (rawSize < 1000) warnings.push("raw/mls-input.txt appears empty or truncated");
  }

  const todoCount = (formText.match(/id: TODO/g) || []).length +
    stepRefs.reduce((sum, ref) => {
      const p = path.join(ROOT, ref);
      return sum + (fs.existsSync(p) ? (loadYamlLike(p).match(/id: TODO/g) || []).length : 0);
    }, 0);

  console.log("MLS Input YAML Validation");
  console.log("=========================");
  console.log(`Steps:   ${stepRefs.length}`);
  console.log(`Fields:  ${totalFields}`);
  console.log(`Options: ${optionCount}`);
  console.log(`TODO IDs: ${todoCount} (early steps missing JotForm IDs in source)`);

  if (warnings.length) {
    console.log("\nWarnings:");
    warnings.forEach((w) => console.log(`  - ${w}`));
  }

  if (errors.length) {
    console.log("\nErrors:");
    errors.forEach((e) => console.log(`  - ${e}`));
    process.exit(1);
  }

  console.log("\nValidation passed.");
}

main();
