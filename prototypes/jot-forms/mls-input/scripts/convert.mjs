#!/usr/bin/env node
/**
 * Converts raw mls-input.txt into structured YAML spec files.
 * Run: node prototypes/jot-forms/mls-input/scripts/convert.mjs
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const RAW_PATH = path.join(ROOT, "raw", "mls-input.txt");

const SLIDE_RE = /(?:^|\n)\s*slide\s*:?\s*(\d+)\s*:?\s*/gi;

function yamlQuote(str) {
  if (str == null) return '""';
  const s = String(str);
  if (
    s === "" ||
    /[:#\[\]{}&,*?|>!'"%@`]/.test(s) ||
    /^\s|\s$/.test(s) ||
    /^(true|false|null|yes|no|on|off|\d+)$/i.test(s)
  ) {
    return JSON.stringify(s);
  }
  return s;
}

function toYaml(value, indent = 0) {
  const pad = "  ".repeat(indent);
  if (value == null) return `${pad}null`;
  if (typeof value === "boolean" || typeof value === "number") {
    return `${pad}${value}`;
  }
  if (typeof value === "string") {
    if (value.includes("\n")) {
      return `${pad}|\n${value
        .split("\n")
        .map((line) => `${pad}  ${line}`)
        .join("\n")}`;
    }
    return `${pad}${yamlQuote(value)}`;
  }
  if (Array.isArray(value)) {
    if (value.length === 0) return `${pad}[]`;
    return value
      .map((item) => {
        if (item && typeof item === "object" && !Array.isArray(item)) {
          const lines = toYaml(item, indent + 1).split("\n");
          lines[0] = `${pad}- ${lines[0].trimStart()}`;
          return lines.join("\n");
        }
        return `${pad}- ${typeof item === "string" ? yamlQuote(item) : item}`;
      })
      .join("\n");
  }
  if (typeof value === "object") {
    return Object.entries(value)
      .filter(([, v]) => v !== undefined)
      .map(([key, val]) => {
        if (key === "$ref") {
          return `${pad}$ref: ${yamlQuote(val)}`;
        }
        if (Array.isArray(val) || (val && typeof val === "object")) {
          return `${pad}${key}:\n${toYaml(val, indent + 1)}`;
        }
        if (typeof val === "string" && val.includes("\n")) {
          return `${pad}${key}:\n${toYaml(val, indent + 1)}`;
        }
        return `${pad}${key}: ${typeof val === "string" ? yamlQuote(val) : val}`;
      })
      .join("\n");
  }
  return `${pad}${value}`;
}

function writeYaml(filePath, data) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, `${toYaml(data)}\n`, "utf8");
}

function slugify(label) {
  return label
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 48);
}

function decodeHtml(s) {
  return s
    .replace(/&quot;/g, '"')
    .replace(/&amp;/g, "&")
    .replace(/&nbsp;/g, " ");
}

function extractJotformIdFromLi(liHtml) {
  const m = liHtml.match(/\bid="id_(\d+)"/);
  return m ? Number(m[1]) : null;
}

function extractLabel(liHtml) {
  const patterns = [
    /<span[^>]*id="label_\d+"[^>]*>([^<]+)/,
    /<label[^>]*id="label_\d+"[^>]*>([^<]+)/,
    /<label[^>]*class="form-label[^"]*"[^>]*id="label_\d+"[^>]*for="[^"]*">([^<]+)/,
  ];
  for (const re of patterns) {
    const m = liHtml.match(re);
    if (m) return decodeHtml(m[1].replace(/\s+/g, " ").trim());
  }
  return null;
}

function extractControlType(liHtml) {
  const m = liHtml.match(/data-type="control_([^"]+)"/);
  if (!m) return null;
  const map = {
    checkbox: "checkbox",
    radio: "radio",
    matrix: "matrix",
    text: "content",
    textarea: "textarea",
    fullname: "fullname",
    phone: "phone",
    email: "email",
    textbox: "text",
    spinner: "number",
    fileupload: "file",
    signature: "signature",
    pagebreak: "pagebreak",
    button: "button",
  };
  return map[m[1]] || m[1];
}

function extractName(html) {
  const m = html.match(/name="(q\d+[^"]*)"/);
  return m ? m[1] : null;
}

function extractOptions(html, inputType) {
  const options = [];
  const re =
    inputType === "radio"
      ? /<input[^>]*type="radio"[^>]*value="([^"]*)"[^>]*>[\s\S]*?<label[^>]*>([^<]*)<\/label>/gi
      : /<input[^>]*type="checkbox"[^>]*value="([^"]*)"[^>]*>[\s\S]*?<label[^>]*>([^<]*)<\/label>/gi;
  let match;
  while ((match = re.exec(html)) !== null) {
    const value = decodeHtml(match[1]);
    const label = decodeHtml(match[2].trim());
    if (value === "other" || label === "Other") {
      if (!options.some((o) => o?.value === "other")) {
        options.push({ value: "other", label: "Other", allowText: true });
      }
    } else if (value && label) {
      options.push(value);
    }
  }
  return options;
}

function isRequired(html) {
  return /jf-required|validate\[required\]/.test(html);
}

function isHidden(html) {
  return /always-hidden|form-field-hidden/.test(html);
}

function extractMatrix(liHtml) {
  const columns = [];
  const colRe = /<label id="label_\d+_col_\d+">([^<]+)<\/label>/g;
  let m;
  while ((m = colRe.exec(liHtml)) !== null) {
    const label = m[1].trim();
    const col = { id: slugify(label), label };
    if (/bedroom/i.test(label)) {
      col.type = "select";
      col.options = ["0", "1", "2", "3", "4", "5", "6", "7"];
    } else if (/bath/i.test(label)) {
      col.type = "select";
      col.options = ["0", "1", "2", "3", "4", "5", "6"];
    } else if (/master|living|laundry|fireplace/i.test(label)) {
      col.type = "checkbox";
    } else if (/square/i.test(label)) {
      col.type = "number";
    } else {
      col.type = "text";
    }
    columns.push(col);
  }

  const rows = [];
  const rowRe = /<label id="label_\d+_row_\d+">([^<]+)<\/label>/g;
  while ((m = rowRe.exec(liHtml)) !== null) {
    rows.push(m[1].trim());
  }

  return { columns, rows, dynamic: /data-dynamic="true"/.test(liHtml) };
}

function fieldIdFromName(name, jotformId) {
  if (!name) return `field-${jotformId}`;
  const base = name.replace(/\[\].*$/, "").replace(/\[.*$/, "");
  return slugify(base);
}

function attachOptions(field, options, optionFiles) {
  if (!options.length) return field;
  if (options.length >= 8) {
    const optFile = `options/${field.id}.yaml`;
    field.$ref = optFile;
    optionFiles.set(optFile, { label: field.label, options });
  } else {
    field.options = options;
  }
  return field;
}

function buildFieldFromLi(li) {
  const type = extractControlType(li);
  if (!type || type === "pagebreak" || type === "button") return null;

  const jotformId = extractJotformIdFromLi(li);
  const name = extractName(li);
  const label = extractLabel(li);

  const field = {
    id: fieldIdFromName(name, jotformId),
    type,
    jotform: jotformId ? { id: jotformId, ...(name ? { name } : {}) } : name ? { name } : undefined,
  };

  if (label) field.label = label;
  if (isRequired(li)) field.required = true;
  if (isHidden(li)) field.status = "hidden-in-jotform";

  if (type === "checkbox" || type === "radio") {
    field._options = extractOptions(li, type);
  } else if (type === "matrix") {
    const matrix = extractMatrix(li);
    field.columns = matrix.columns;
    if (matrix.dynamic) {
      field.dynamic = {
        rowCountFrom: "levelCount",
        rowLabels: matrix.rows.length
          ? matrix.rows
          : ["Main Level", "Basement", "Second Story", "Third Story", "Fourth Story"],
      };
    } else if (matrix.rows.length) {
      field.rows = matrix.rows;
    }
  } else if (type === "content") {
    const textMatch = li.match(/<div id="text_\d+"[\s\S]*?>([\s\S]*?)<\/div>/);
    if (textMatch) {
      field.content = decodeHtml(
        textMatch[1]
          .replace(/<br\s*\/?>/gi, "\n")
          .replace(/<\/p>\s*<p[^>]*>/gi, "\n\n")
          .replace(/<[^>]+>/g, "")
          .replace(/\s+\n/g, "\n")
          .trim(),
      );
    }
    delete field.label;
  } else if (type === "number") {
    const min = li.match(/data-spinnermin="(\d+)"/);
    const max = li.match(/data-spinnermax="(\d+)"/);
    const def = li.match(/data-defaultvalue="(\d+)"/);
    if (min) field.min = Number(min[1]);
    if (max) field.max = Number(max[1]);
    if (def) field.default = Number(def[1]);
  } else if (type === "textarea") {
    const hint = li.match(/placeholder="([^"]+)"/);
    if (hint) field.placeholder = decodeHtml(hint[1]);
  } else if (type === "file") {
    field.multiple = true;
  }

  return field;
}

function parseLiFields(html) {
  const fields = [];
  const liRe = /<li\b[\s\S]*?data-type="control_[^"]+"[\s\S]*?<\/li>/g;
  let match;
  while ((match = liRe.exec(html)) !== null) {
    const field = buildFieldFromLi(match[0]);
    if (field) fields.push(field);
  }
  return fields;
}

function parseStandaloneBlocks(html, plainLabels = []) {
  const fields = [];

  const radioBlocks = [...html.matchAll(/<div class="form-multiple-column"[^>]*role="radiogroup"[\s\S]*?<\/div>/g)];
  for (let i = 0; i < radioBlocks.length; i++) {
    const content = radioBlocks[i][0];
    const name = extractName(content);
    const options = extractOptions(content, "radio");
    const labelBefore = plainLabels
      .filter((l) => l && !l.includes("<") && l !== "Style of property")
      .find((l) => l.endsWith("*") || /type/i.test(l))
      ?.replace(/\*$/, "")
      .trim();
    const label = labelBefore || (name === "q11_propertyType" ? "Property type" : fieldIdFromName(name, null));
    fields.push({
      id: fieldIdFromName(name, null),
      label,
      type: "radio",
      required: isRequired(content) || labelBefore?.endsWith("*"),
      jotform: name ? { name, ...(name.startsWith("q11") ? { id: 11 } : {}) } : { id: "TODO" },
      _options: options,
    });
  }

  const checkboxBlocks = [...html.matchAll(/<div class="form-multiple-column"[^>]*role="group"[\s\S]*?<\/div>/g)];
  for (const block of checkboxBlocks) {
    const content = block[0];
    const name = extractName(content);
    const options = extractOptions(content, "checkbox");
    const label = name?.includes("q26")
      ? "Basement / Lower Level Type"
      : plainLabels.find((l) => l === "Style of property") || fieldIdFromName(name, null);
    fields.push({
      id: fieldIdFromName(name, null),
      label,
      type: "checkbox",
      _options: options,
      jotform: name ? { name, ...(name.includes("q26") ? { id: 26 } : {}) } : { id: "TODO" },
    });
  }

  return fields;
}

function plainTextLabels(slideContent) {
  return slideContent
    .split("\n")
    .map((l) => l.trim())
    .filter((l) => l && !l.startsWith("<") && !l.startsWith("Rows"));
}

function splitSlides(content) {
  const markers = [];
  let m;
  SLIDE_RE.lastIndex = 0;
  while ((m = SLIDE_RE.exec(content)) !== null) {
    markers.push({ num: m[1], index: m.index, end: m.index + m[0].length });
  }

  const header = markers.length ? content.slice(0, markers[0].index).trim() : content.trim();
  const slides = {};
  for (let i = 0; i < markers.length; i++) {
    const { num, end } = markers[i];
    const nextStart = markers[i + 1]?.index ?? content.length;
    const text = content.slice(end, nextStart).trim();
    const key = slides[num] ? `${num}b` : num;
    slides[key] = text;
  }
  return { header, slides };
}

function finalizeFields(fields, optionFiles) {
  return fields
    .filter((f) => f && f.type !== "pagebreak")
    .map((f) => {
      const out = { ...f };
      if (out._options) {
        attachOptions(out, out._options, optionFiles);
        delete out._options;
      }
      return out;
    });
}

function dedupeFields(fields) {
  const byKey = new Map();
  for (const f of fields) {
    const key = f.jotform?.name?.replace(/\[\].*$/, "") || f.jotform?.id?.toString() || f.id;
    const existing = byKey.get(key);
    if (!existing) {
      byKey.set(key, f);
      continue;
    }
    // Prefer field with jotform id and human label
    const score = (x) =>
      (x.jotform?.id && x.jotform.id !== "TODO" ? 4 : 0) +
      (x.label && !x.label.startsWith("q") ? 2 : 0) +
      (x.required ? 1 : 0);
    byKey.set(key, score(f) >= score(existing) ? f : existing);
  }
  return [...byKey.values()];
}

const STEP_DEFS = [
  {
    file: "01-owners.yaml",
    id: "owners",
    title: "Owners",
    sourceSlide: "1",
    build(fields) {
      return [
        {
          id: "ownersIntro",
          type: "content",
          content:
            "If there are more than 2 owners or you need to sign for an entity (LLC, Partnership etc), Please select 1 owner and reply to the email you receive when this information is submitted.\n\nOnce this form is complete and we have your email, we can then send the form to the other parties for their signature and/or will collect the operating agreements etc. verifying proof of ownership and/or the right to sign as an officer for the entity prior to placing the property on the MLS.",
        },
        {
          id: "ownerCount",
          label: "How Many Owners Of The Property?",
          type: "radio",
          required: true,
          options: ["One", "Two"],
          jotform: { id: "TODO", name: "q_ownerCount" },
        },
      ];
    },
  },
  {
    file: "02-primary-owner.yaml",
    id: "primary-owner",
    title: "Primary Owner",
    sourceSlide: "1",
    build() {
      return [
        {
          id: "primaryOwnerName",
          label: "Primary Owner Name",
          type: "fullname",
          required: true,
          jotform: { id: "TODO", name: "q_primaryOwnerName" },
        },
        {
          id: "primaryOwnerPhone",
          label: "Primary Owner Phone Number",
          type: "phone",
          required: true,
          placeholder: "(000) 000-0000",
          jotform: { id: "TODO", name: "q_primaryOwnerPhone" },
        },
        {
          id: "primaryOwnerEmail",
          label: "Primary Owner Email",
          type: "email",
          required: true,
          placeholder: "example@example.com",
          jotform: { id: "TODO", name: "q_primaryOwnerEmail" },
        },
      ];
    },
  },
  {
    file: "03-listing-address-schools.yaml",
    id: "listing-address-schools",
    title: "Listing Address & Schools",
    sourceSlide: "3",
    build() {
      return [
        {
          id: "ownerAddressSameAsListing",
          label: "Is the OWNER address the SAME as the LISTING address?",
          type: "radio",
          required: true,
          jotform: { id: "TODO" },
        },
        {
          id: "ownerAddress",
          label: "Owner Address",
          type: "address",
          required: true,
          jotform: { id: "TODO" },
        },
        {
          id: "listingCoordinates",
          label: "Approximate North / South & East / West Coordinates Of Listing",
          type: "text",
          placeholder: "ex: 2100 S 1300 E",
          jotform: { id: "TODO" },
        },
        {
          id: "listingPrice",
          label: "Listing Price",
          type: "currency",
          required: true,
          placeholder: "e.g., $500,000",
          jotform: { id: "TODO" },
        },
        {
          id: "schools",
          label: "Schools",
          type: "matrix",
          required: true,
          rows: ["School District", "Elementary School", "Junior High/Middle School", "High School"],
          columns: [{ id: "name", label: "NAME", type: "text" }],
          jotform: { id: "TODO" },
        },
      ];
    },
  },
  {
    file: "04-hoa-solar.yaml",
    id: "hoa-solar",
    title: "HOA & Solar",
    sourceSlide: "4",
    build() {
      return [
        {
          id: "hoa",
          label: "Is the property in an HOA?",
          type: "radio",
          required: true,
          jotform: { id: "TODO" },
        },
        {
          id: "shortTermRentals",
          label: "Are Short Term Rentals Allowed?",
          type: "radio",
          jotform: { id: "TODO" },
        },
        {
          id: "solar",
          label: "Does the property have solar?",
          type: "radio",
          required: true,
          jotform: { id: "TODO" },
        },
      ];
    },
  },
  { file: "05-property-details.yaml", id: "property-details", title: "Property Details", sourceSlide: "5", parse: true },
  {
    file: "06-level-breakdown.yaml",
    id: "level-breakdown",
    title: "Breakdown By Level",
    sourceSlide: "6",
    intro:
      "We apologize that this section may be difficult via a mobile device.\n\nHowever, this is how the MLS distributes and formats your information. The more accurate this information, the more buyers you will reach.\n\n(If you don't have the approximate square feet per level, just leave blank and we can look it up for you. We do need the other information filled out accurately)\n\nEx: Basement + Main Level + Second Story = 3 Levels\nEx: Multi Level could be 3 or 4 depending on the basement.",
    parse: true,
    extra() {
      return [
        {
          id: "levelCount",
          label: "How Many Levels In The Property?",
          type: "radio",
          required: true,
          jotform: { id: "TODO" },
        },
      ];
    },
  },
  { file: "07-interior-systems.yaml", id: "interior-systems", title: "Interior Systems", sourceSlide: "7", parse: true },
  { file: "08-exterior-parking.yaml", id: "exterior-parking", title: "Exterior & Parking", sourceSlide: "8", parse: true },
  { file: "09-pool-roof-yard.yaml", id: "pool-roof-yard", title: "Pool, Roof & Yard", sourceSlide: "9", parse: true },
  { file: "10-utilities-zoning-terms.yaml", id: "utilities-zoning-terms", title: "Utilities, Zoning & Terms", sourceSlide: "9b", parse: true },
  { file: "11-personal-property.yaml", id: "personal-property", title: "Personal Property / Conveyances", sourceSlide: "10", parse: true },
  { file: "12-buyer-showings.yaml", id: "buyer-showings", title: "Buyer Showings", sourceSlide: "11", parse: true },
  { file: "13-title-company.yaml", id: "title-company", title: "Title Company", sourceSlide: "12", parse: true },
  { file: "14-remarks.yaml", id: "remarks", title: "Remarks", sourceSlide: "13", parse: true },
  { file: "15-photos.yaml", id: "photos", title: "Photos", sourceSlide: "14", parse: true },
  { file: "16-signature.yaml", id: "signature", title: "Signature", sourceSlide: "15", parse: true },
];

function parseSlide(slideContent, optionFiles) {
  const labels = plainTextLabels(slideContent);
  const fromLi = parseLiFields(slideContent);
  const fromBlocks = parseStandaloneBlocks(slideContent, labels);

  const liNames = new Set(fromLi.map((f) => f.jotform?.name?.replace(/\[\].*$/, "")).filter(Boolean));
  const blocksFiltered = fromBlocks.filter((f) => {
    const name = f.jotform?.name?.replace(/\[\].*$/, "");
    return name && !liNames.has(name);
  });

  let fields = dedupeFields([...blocksFiltered, ...fromLi]);

  if (fields.length === 0 && labels.length) {
    for (const label of labels) {
      if (label.endsWith("*") || label.includes("?")) {
        fields.push({
          id: slugify(label.replace(/\*$/, "")),
          label: label.replace(/\*$/, "").trim(),
          type: "radio",
          required: label.endsWith("*"),
          jotform: { id: "TODO" },
        });
      }
    }
  }

  return finalizeFields(fields, optionFiles);
}

function main() {
  const content = fs.readFileSync(RAW_PATH, "utf8");
  const { header, slides } = splitSlides(content);
  const optionFiles = new Map();
  const allSteps = [];

  // Fix step 02 source slide
  STEP_DEFS.find((s) => s.id === "primary-owner").sourceSlide = "2";

  for (const def of STEP_DEFS) {
    const slideContent = slides[def.sourceSlide] || "";
    let fields = [];

    if (def.build) {
      fields = def.build(slideContent);
    }
    if (def.parse) {
      const parsed = parseSlide(slideContent, optionFiles);
      const extras = def.extra ? def.extra() : [];
      fields = dedupeFields([...extras, ...parsed, ...fields]);
    }

    if (def.id === "property-details") {
      const hasYear = fields.some((f) => f.id === "yearBuilt");
      if (!hasYear) {
        fields.push(
          { id: "yearBuilt", label: "Year Built", type: "select", required: true, jotform: { id: "TODO" } },
          {
            id: "lotSize",
            label: "Lot Size",
            type: "text",
            required: true,
            placeholder: "e.g., .23",
            description: "What size is the parcel?",
            jotform: { id: "TODO" },
          },
          {
            id: "livingSqft",
            label: "Approximate Total Living Square Footage",
            type: "number",
            required: true,
            jotform: { id: "TODO" },
          },
        );
      }
    }

    if (def.id === "personal-property") {
      const pp = fields.find((f) => f.jotform?.name?.startsWith("q19") || f.id === "q19-typea19");
      if (pp) {
        pp.label = "Personal Property / Conveyances";
        pp.description = "Select all items included with the sale.";
        pp.jotform = { id: 19, name: "q19_typeA19[]" };
        if (!pp.$ref) {
          const opts = extractOptions(slideContent, "checkbox");
          attachOptions(pp, opts, optionFiles);
        }
      }
    }

    fields = finalizeFields(fields, optionFiles);

    const step = {
      id: def.id,
      title: def.title,
      ...(def.intro ? { intro: def.intro } : {}),
      fields,
    };

    writeYaml(path.join(ROOT, "steps", def.file), step);
    allSteps.push({
      order: def.file.slice(0, 2),
      id: def.id,
      file: `steps/${def.file}`,
      title: def.title,
    });
  }

  for (const [optFile, data] of optionFiles) {
    writeYaml(path.join(ROOT, optFile), data);
  }

  const headerLines = header.split("\n").map((l) => l.trim()).filter(Boolean);
  writeYaml(path.join(ROOT, "form.yaml"), {
    id: "mls-input",
    title: headerLines[0] || "MLS Input Form",
    jotformId: "261498349657980",
    jotformUrl: "https://form.jotform.com/261498349657980",
    estimatedMinutes: "15-20",
    saveAndResume: true,
    instructions: headerLines.slice(1),
    steps: allSteps,
    gaps: [
      "Secondary owner name, phone, and email fields are not in the source dump (only secondary signature on step 16).",
      "Interior Special Features, Accessibility, and Exterior Special Features are hidden in JotForm HTML — see conditions.yaml.",
      "Early steps (1-4) lack JotForm field IDs in the source dump; marked TODO for migration mapping.",
    ],
  });

  let totalFields = 0;
  for (const s of allSteps) {
    const text = fs.readFileSync(path.join(ROOT, s.file), "utf8");
    totalFields += (text.match(/^\s+- id:/gm) || []).length;
  }

  console.log(`Wrote ${allSteps.length} steps, ${optionFiles.size} option files, ~${totalFields} fields.`);
}

main();
