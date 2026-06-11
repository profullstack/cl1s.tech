/**
 * @profullstack/cl1s-web — landing site for cl1s.tech (Hono).
 * Serves a single marketing page describing the AgentAd standard and the network.
 */

import { Hono } from "hono";
import { serve } from "@hono/node-server";
import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const app = new Hono();

app.get("/", async (c) => {
  const html = await readFile(join(__dirname, "..", "public", "index.html"), "utf8");
  return c.html(html);
});

app.get("/healthz", (c) => c.json({ ok: true }));

const port = Number(process.env.PORT ?? 3000);

if (import.meta.url === `file://${process.argv[1]}`) {
  serve({ fetch: app.fetch, port });
  console.log(`cl1s web listening on http://localhost:${port}`);
}

export default app;
