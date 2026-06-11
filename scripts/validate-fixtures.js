/**
 * Validate the AgentAd fixtures against their JSON Schemas.
 * Run: pnpm run validate:fixtures
 */

import { readFile, readdir } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import Ajv from "ajv/dist/2020.js";
import addFormats from "ajv-formats";
import { parse as parseYaml } from "yaml";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const schemasDir = join(root, "packages/schemas/schemas");
const fixturesDir = join(root, "packages/schemas/fixtures");

const ajv = new Ajv({ allErrors: true, strict: false });
addFormats(ajv);

// Register every schema by $id so $ref across files resolves.
const schemaFiles = (await readdir(schemasDir)).filter((f) => f.endsWith(".json"));
const byType = new Map();
for (const f of schemaFiles) {
  const schema = JSON.parse(await readFile(join(schemasDir, f), "utf8"));
  ajv.addSchema(schema);
  const constType = schema.properties?.type?.const;
  if (constType) byType.set(constType, schema.$id);
}

let failed = 0;
const fixtures = (await readdir(fixturesDir)).filter((f) => /\.(ya?ml|json)$/.test(f));
for (const f of fixtures) {
  const raw = await readFile(join(fixturesDir, f), "utf8");
  const doc = f.endsWith(".json") ? JSON.parse(raw) : parseYaml(raw);
  const schemaId = byType.get(doc.type);
  if (!schemaId) {
    console.error(`✗ ${f}: no schema for type "${doc.type}"`);
    failed++;
    continue;
  }
  const validate = ajv.getSchema(schemaId);
  if (validate(doc)) {
    console.log(`✓ ${f} (${doc.type})`);
  } else {
    console.error(`✗ ${f}:`, ajv.errorsText(validate.errors, { separator: "\n   " }));
    failed++;
  }
}

if (failed) {
  console.error(`\n${failed} fixture(s) failed validation`);
  process.exit(1);
}
console.log(`\nAll ${fixtures.length} fixtures valid.`);
