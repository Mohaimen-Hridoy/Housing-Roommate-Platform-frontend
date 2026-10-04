/**
 * i18n dictionary guard.
 *
 * Three mistakes are easy to make when editing `src/lib/i18n/dictionaries.ts`
 * by hand, and all three are invisible in the editor:
 *
 *   1. A Bangla string pasted into the English `en` object (or vice versa).
 *   2. A key added to `bn` that does not exist in `en`, so it is dead weight.
 *   3. A key duplicated inside one object, where the later value silently wins.
 *
 * TypeScript catches 2 and 3 only when the file is compiled; this script checks
 * all three, reports translation coverage, and exits non-zero on 1-3 so CI or a
 * pre-commit hook can stop a bad edit.
 *
 * Run: npm run i18n:check
 */

import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const here = dirname(fileURLToPath(import.meta.url));
const source = readFileSync(join(here, "..", "src", "lib", "i18n", "dictionaries.ts"), "utf8");

/** Bengali block plus the Bengali digits used inside translated copy. */
const BENGALI = /[\u0980-\u09FF\u09E6-\u09EF]/;

const errors = [];
const notes = [];

/**
 * Extracts `const <name> = { ... }` and pulls `"key": "value"` pairs out of the
 * object body. Values may span lines, so this matches the key and then consumes
 * the string literal that follows.
 */
function extractObject(name) {
  // `const en = {` and `const bn: Partial<Record<...>> = {` both have to match.
  const declaration = new RegExp(`const\\s+${name}\\s*(?::[^=]+)?=\\s*\\{`);
  const found0 = source.match(declaration);
  if (!found0 || found0.index === undefined) {
    errors.push(`Could not find "const ${name}" in dictionaries.ts`);
    return new Map();
  }
  const start = found0.index;
  const open = source.indexOf("{", start);
  if (open === -1) return new Map();

  let depth = 0;
  let end = open;
  for (let i = open; i < source.length; i += 1) {
    const char = source[i];
    if (char === "{") depth += 1;
    else if (char === "}") {
      depth -= 1;
      if (depth === 0) {
        end = i;
        break;
      }
    }
  }
  const body = source.slice(open, end);

  /** @type {Map<string, {value: string, line: number, index: number}>} */
  const found = new Map();
  const entry = /"((?:[^"\\]|\\.)*)"\s*:\s*\n?\s*"((?:[^"\\]|\\.)*)"/g;
  let match;
  while ((match = entry.exec(body)) !== null) {
    const [, key, value] = match;
    const line = source.slice(0, open + match.index).split("\n").length;
    if (found.has(key)) {
      errors.push(`Duplicate key "${key}" in ${name} (lines ${found.get(key).line} and ${line})`);
    }
    found.set(key, { value, line, index: match.index });
  }
  return found;
}

const en = extractObject("en");
const bn = extractObject("bn");

if (en.size === 0) {
  console.error("i18n:check — could not parse the en dictionary.");
  process.exit(1);
}

/* 1. Wrong-language values. */
for (const [key, { value, line }] of en) {
  if (BENGALI.test(value)) {
    errors.push(`en."${key}" (line ${line}) contains Bengali text — English dictionary holds a translation.`);
  }
}
for (const [key, { value, line }] of bn) {
  if (value.trim() === "") {
    errors.push(`bn."${key}" (line ${line}) is empty — delete the entry or fill it in.`);
  }
}

/* 2. Keys in bn that en does not define. These can never be looked up. */
for (const [key, { line }] of bn) {
  if (!en.has(key)) {
    errors.push(`bn."${key}" (line ${line}) has no matching en key, so it is unreachable.`);
  }
}

/* Coverage report. */
const missing = [...en.keys()].filter((key) => !bn.has(key));
const total = en.size;
const covered = total - missing.length;
const percent = total === 0 ? 0 : Math.round((covered / total) * 100);

const groups = new Map();
for (const key of missing) {
  const group = key.split(".")[0];
  groups.set(group, (groups.get(group) ?? 0) + 1);
}

console.log(`i18n:check — ${covered}/${total} keys translated into bn (${percent}%)`);

if (groups.size > 0) {
  const summary = [...groups.entries()]
    .sort((a, b) => b[1] - a[1])
    .map(([group, count]) => `${group}(${count})`)
    .join("  ");
  notes.push(`Still English-only, by group: ${summary}`);
}

if (missing.length > 0 && process.argv.includes("--list")) {
  for (const key of missing) console.log(`  missing: ${key}`);
}

if (notes.length > 0) {
  for (const note of notes) console.log(note);
}

if (errors.length > 0) {
  console.error("");
  for (const error of errors) console.error(`  error: ${error}`);
  console.error(`\ni18n:check failed with ${errors.length} problem(s).`);
  process.exit(1);
}

console.log("i18n:check passed.");