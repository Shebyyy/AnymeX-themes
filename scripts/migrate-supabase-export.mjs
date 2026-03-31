#!/usr/bin/env node
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const inputArg = process.argv[2];
if (!inputArg) {
  console.error("Usage: node scripts/migrate-supabase-export.mjs <path-to-export.json>");
  process.exit(1);
}

const root = process.cwd();
const inputPath = path.isAbsolute(inputArg) ? inputArg : path.join(root, inputArg);
const outDir = path.join(root, "data");
const outPath = path.join(outDir, "db.json");

const emptyDb = {
  User: [],
  PasswordReset: [],
  SessionToken: [],
  Theme: [],
  ThemeLike: [],
  ThemeView: [],
  AppSettings: [],
};

function normalizeExport(raw) {
  // Supported formats:
  // 1) { User: [...], Theme: [...] }
  // 2) { tables: { User: [...], Theme: [...] } }
  // 3) { data: { User: [...], Theme: [...] } }
  const tables = raw.tables || raw.data || raw;
  const normalized = { ...emptyDb };
  for (const key of Object.keys(emptyDb)) {
    if (Array.isArray(tables?.[key])) {
      normalized[key] = tables[key];
    }
  }
  return normalized;
}

const content = await readFile(inputPath, "utf8");
const parsed = JSON.parse(content);
const normalized = normalizeExport(parsed);

await mkdir(outDir, { recursive: true });
await writeFile(outPath, JSON.stringify(normalized, null, 2), "utf8");

const totals = Object.entries(normalized)
  .map(([k, v]) => `${k}: ${Array.isArray(v) ? v.length : 0}`)
  .join(", ");

console.log(`Migration file created: ${path.relative(root, outPath)}`);
console.log(`Rows imported -> ${totals}`);
console.log("Next: commit data/db.json to your GitHub repo (this is now your DB).");

