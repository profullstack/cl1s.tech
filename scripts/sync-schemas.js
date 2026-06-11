/**
 * Resync the AgentAd schemas from their canonical home in LogicSRC.
 *
 * Canonical source: @logicsrc/schemas (github.com/profullstack/logicsrc).
 * These files are mirrored here until @logicsrc/schemas is published to npm,
 * at which point this package should depend on it and drop the copies.
 *
 * Usage: LOGICSRC=../logicsrc node scripts/sync-schemas.js
 */

import { readdir, copyFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { dirname, join, resolve } from "node:path";

const here = dirname(fileURLToPath(import.meta.url));
const dest = join(here, "..", "packages/schemas/schemas");
const logicsrc = resolve(here, "..", process.env.LOGICSRC ?? "../logicsrc");
const src = join(logicsrc, "packages/schemas/schemas");

const files = (await readdir(src)).filter((f) => f.startsWith("agentad-") && f.endsWith(".schema.json"));
if (!files.length) {
  console.error(`No agentad-*.schema.json found in ${src}`);
  process.exit(1);
}
for (const f of files) {
  await copyFile(join(src, f), join(dest, f));
  console.log(`synced ${f}`);
}
console.log(`\nSynced ${files.length} schema(s) from ${src}`);
