/**
 * @cl1s/api — AgentAd ad-serving reference service (Hono).
 *
 * In-memory reference implementation of the AgentAd network endpoints:
 *   POST /v1/ads          fill a placement (agentad.ad_request -> agentad.ad_response)
 *   POST /v1/impressions  confirm a display
 *   POST /v1/clicks       record a click/conversion
 *   GET  /v1/healthz
 *
 * Not production storage — swap the in-memory maps for a real datastore.
 */

import { Hono } from "hono";
import { serve } from "@hono/node-server";
import { randomUUID } from "node:crypto";

const app = new Hono();

/** Seed inventory. In production this comes from advertiser campaigns. */
const ADS = [
  {
    type: "agentad.ad",
    version: "0.1",
    id: "deploy-faster-railway",
    advertiser_did: "railway.coinpay",
    format: "markdown",
    title: "Ship your CLI to production in 60 seconds",
    body: "Railway deploys any Node, Bun, or Go service straight from your terminal.",
    url: "https://railway.app/?ref=cl1s",
    cta: "Deploy now",
    disclosure: { sponsored: true, label: "Sponsored", advertiser_name: "Railway" },
    machine_readable: { product: "railway", category: "infrastructure", install: "npm i -g @railway/cli" },
    targeting: { surfaces: ["cli", "agent"], keywords: ["deploy", "hosting", "infrastructure"] },
    pricing: { model: "cpc", bid: 0.4, currency: "USDC" },
  },
];

const impressions = new Map(); // impression_token -> { ad_id, click_token }
const events = [];

function matches(ad, req) {
  const surfaces = ad.targeting?.surfaces;
  if (surfaces && req.consumer && !surfaces.includes(req.consumer === "agent" ? "agent" : "cli")) {
    return false;
  }
  const wanted = req.context?.keywords;
  if (wanted?.length && ad.targeting?.keywords?.length) {
    return wanted.some((k) => ad.targeting.keywords.includes(k));
  }
  return true;
}

app.post("/v1/ads", async (c) => {
  const req = await c.req.json().catch(() => null);
  if (!req || req.type !== "agentad.ad_request" || !req.placement_id) {
    return c.json({ type: "agentad.ad_response", version: "0.1", request_id: randomUUID(), ads: [], no_fill_reason: "invalid_request" }, 400);
  }
  const count = Math.min(req.count ?? 1, 10);
  const filled = ADS.filter((ad) => matches(ad, req)).slice(0, count);
  const request_id = randomUUID();
  const ads = filled.map((ad) => {
    const impression_token = randomUUID();
    impressions.set(impression_token, { ad_id: ad.id, click_token: randomUUID() });
    return { ad, impression_token };
  });
  return c.json({
    type: "agentad.ad_response",
    version: "0.1",
    request_id,
    ads,
    ...(ads.length ? {} : { no_fill_reason: "no_inventory" }),
  });
});

app.post("/v1/impressions", async (c) => {
  const ev = await c.req.json().catch(() => null);
  if (!ev?.impression_token || !impressions.has(ev.impression_token)) {
    return c.json({ ok: false, error: "unknown_impression_token" }, 400);
  }
  const rec = impressions.get(ev.impression_token);
  events.push({ kind: "impression", ad_id: rec.ad_id, at: new Date().toISOString() });
  return c.json({ ok: true, click_token: rec.click_token });
});

app.post("/v1/clicks", async (c) => {
  const ev = await c.req.json().catch(() => null);
  if (!ev?.ad_id) return c.json({ ok: false, error: "missing_ad_id" }, 400);
  events.push({ kind: "click", ad_id: ev.ad_id, action: ev.action ?? "click", at: new Date().toISOString() });
  return c.json({ ok: true });
});

app.get("/v1/healthz", (c) => c.json({ ok: true, ads: ADS.length, events: events.length }));

const port = Number(process.env.PORT ?? 8787);

if (import.meta.url === `file://${process.argv[1]}`) {
  serve({ fetch: app.fetch, port });
  console.log(`cl1s api listening on http://localhost:${port}`);
}

export default app;
