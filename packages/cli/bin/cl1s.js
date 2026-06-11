#!/usr/bin/env node
/**
 * cl1s — the AgentAd command surface.
 *
 *   cl1s fetch --placement <id> [--agent] [--endpoint <url>]
 *   cl1s render <ad.json>
 *   cl1s validate <doc.json|doc.yaml>
 *   cl1s spec
 */

import { readFile } from "node:fs/promises";
import { Cl1sClient, renderAd, toAgentView } from "@profullstack/cl1s-sdk";

const args = process.argv.slice(2);
const cmd = args[0];

function flag(name, fallback) {
  const i = args.indexOf(`--${name}`);
  if (i === -1) return fallback;
  const next = args[i + 1];
  return next && !next.startsWith("--") ? next : true;
}

function fail(msg) {
  console.error(`cl1s: ${msg}`);
  process.exit(1);
}

async function main() {
  switch (cmd) {
    case "fetch": {
      const placementId = flag("placement");
      if (!placementId) fail("--placement <id> is required");
      const consumer = flag("agent", false) ? "agent" : "human";
      const client = new Cl1sClient({
        endpoint: flag("endpoint", process.env.CL1S_ENDPOINT),
        placementId,
        consumer,
      });
      const res = await client.requestAds({ count: Number(flag("count", 1)) });
      if (!res.ads?.length) {
        console.log(`(no fill: ${res.no_fill_reason ?? "no_inventory"})`);
        return;
      }
      for (const { ad, impression_token } of res.ads) {
        console.log(consumer === "agent"
          ? JSON.stringify(toAgentView(ad), null, 2)
          : renderAd(ad, { color: process.stdout.isTTY }));
        await client.reportImpression(impression_token, ad.id);
      }
      return;
    }
    case "render": {
      const file = args[1];
      if (!file) fail("usage: cl1s render <ad.json>");
      const ad = JSON.parse(await readFile(file, "utf8"));
      console.log(renderAd(ad, { color: process.stdout.isTTY }));
      return;
    }
    case "validate": {
      const file = args[1];
      if (!file) fail("usage: cl1s validate <doc.json>");
      const { validateDoc } = await import("@profullstack/cl1s-sdk/validate").catch(() => ({}));
      if (!validateDoc) fail("validation requires @profullstack/cl1s-schemas + a validator; see docs/agentad.md");
      return;
    }
    case "spec":
      console.log("AgentAd spec: https://cl1s.tech/spec — schemas: @profullstack/cl1s-schemas");
      return;
    default:
      console.log(`cl1s — CLI advertising network for terminals and agents

Commands:
  fetch --placement <id> [--agent]   request and render an ad
  render <ad.json>                   render an ad document locally
  validate <doc.json>                validate an AgentAd document
  spec                               print spec pointers

Env: CL1S_ENDPOINT (default https://api.cl1s.tech)`);
  }
}

main().catch((err) => fail(err.message));
