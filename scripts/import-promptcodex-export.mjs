// Imports a full PromptCodex export (folders, prompts, tags, global variables,
// projects, services) into data/promptcodex-library.json.
//
// Base64 images (project hero/icon, custom service icons) are extracted to
// public/library/ and replaced with public URLs so the JSON stays diffable.
// Nothing is dropped: every other field is kept verbatim.
//
// Usage: node scripts/import-promptcodex-export.mjs <export.json>
//        npm run build:catalog
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const input = process.argv[2];
if (!input) {
  console.error("Usage: node scripts/import-promptcodex-export.mjs <export.json>");
  process.exit(1);
}

const data = JSON.parse(readFileSync(path.resolve(input), "utf8"));
if (!Array.isArray(data.prompts)) {
  console.error("Not a PromptCodex export: missing prompts[]");
  process.exit(1);
}

const assetDir = path.join(root, "public", "library");
mkdirSync(assetDir, { recursive: true });

function sniffExt(buffer) {
  if (buffer[0] === 0x89 && buffer[1] === 0x50) return "png";
  if (buffer[0] === 0xff && buffer[1] === 0xd8) return "jpg";
  if (buffer.subarray(8, 12).toString() === "WEBP") return "webp";
  if (buffer.subarray(0, 6).toString() === "GIF89a") return "gif";
  return "bin";
}

let extracted = 0;
function extract(entity, field, kind, role) {
  const base64 = entity[field];
  if (typeof base64 !== "string" || !base64) return entity;
  const buffer = Buffer.from(base64, "base64");
  const name = `${kind}-${String(entity.id).toLowerCase()}-${role}.${sniffExt(buffer)}`;
  writeFileSync(path.join(assetDir, name), buffer);
  extracted += 1;
  const rest = { ...entity };
  delete rest[field];
  return { ...rest, [field.replace(/Base64$/, "Url")]: `/library/${name}` };
}

const projects = (data.projects ?? []).map((project) =>
  extract(extract(project, "heroImageBase64", "project", "hero"), "iconImageBase64", "project", "icon"),
);
const services = (data.services ?? []).map((service) =>
  extract(service, "customIconBase64", "service", "icon"),
);

const library = {
  version: data.version,
  exportDate: data.exportDate,
  folders: data.folders ?? [],
  globalVariables: data.globalVariables ?? [],
  projects,
  services,
  tags: data.tags ?? [],
  prompts: data.prompts,
};

const target = path.join(root, "data", "promptcodex-library.json");
writeFileSync(target, `${JSON.stringify(library, null, 2)}\n`);

const counts = Object.fromEntries(
  ["folders", "globalVariables", "projects", "services", "tags", "prompts"].map((key) => [
    key,
    library[key].length,
  ]),
);
console.log(`Wrote ${path.relative(root, target)}`, counts, `images extracted: ${extracted}`);
