#!/usr/bin/env node
import { mkdir, writeFile } from "node:fs/promises";
import { readFile } from "node:fs/promises";
import path from "node:path";

async function loadEnvLocal() {
  const envPath = path.join(process.cwd(), ".env.local");
  try {
    const content = await readFile(envPath, "utf8");
    for (const rawLine of content.split(/\r?\n/)) {
      const line = rawLine.trim();
      if (!line || line.startsWith("#")) continue;
      const idx = line.indexOf("=");
      if (idx < 0) continue;
      const key = line.slice(0, idx).trim();
      let value = line.slice(idx + 1).trim();
      if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
        value = value.slice(1, -1);
      }
      if (!(key in process.env)) {
        process.env[key] = value;
      }
    }
  } catch {
    // no .env.local; allow shell env vars
  }
}

await loadEnvLocal();

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY =
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error(
    "Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local",
  );
  process.exit(1);
}

async function fetchTable(table) {
  const url = `${SUPABASE_URL.replace(/\/$/, "")}/rest/v1/${encodeURIComponent(table)}?select=*`;
  const response = await fetch(url, {
    headers: {
      apikey: SUPABASE_SERVICE_ROLE_KEY,
      Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
      Accept: "application/json",
    },
  });
  if (!response.ok) {
    const text = await response.text();
    throw new Error(`REST fetch failed for ${table}: ${response.status} ${text}`);
  }
  const data = await response.json();
  return Array.isArray(data) ? data : [];
}

const TABLES = [
  "User",
  "PasswordReset",
  "SessionToken",
  "Theme",
  "ThemeLike",
  "ThemeView",
  "AppSettings",
];

const db = {
  User: [],
  PasswordReset: [],
  SessionToken: [],
  Theme: [],
  ThemeLike: [],
  ThemeView: [],
  AppSettings: [],
};

for (const table of TABLES) {
  try {
    db[table] = await fetchTable(table);
  } catch (error) {
    console.error(`Failed reading table ${table}:`, error.message);
    process.exit(1);
  }
}

const outDir = path.join(process.cwd(), "data");
const outPath = path.join(outDir, "db.json");
await mkdir(outDir, { recursive: true });
await writeFile(outPath, JSON.stringify(db, null, 2), "utf8");

const counts = TABLES.map((t) => `${t}:${db[t].length}`).join(", ");
console.log(`Wrote ${path.relative(process.cwd(), outPath)}`);
console.log(`Counts -> ${counts}`);

