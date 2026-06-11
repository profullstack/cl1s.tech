# AgentAd Standard

AgentAd is the open contract behind **cl1s.tech**: a way to serve advertising to
command-line tools and AI agents that is *disclosed*, *agent-readable*, and
*terminal-native*.

AgentAd is defined canonically in **[LogicSRC](https://github.com/profullstack/logicsrc)**
(`@logicsrc/schemas`, `docs/agentad.md`) as a core primitive family. cl1s.tech is the
first hosted network built on AgentAd and **re-exports** those schemas via
`@profullstack/cl1s-schemas`; schema `$id`s resolve under `https://schemas.logicsrc.com/`.
External tools may consume the AgentAd contracts directly.

## Principles

1. **Disclosure is mandatory.** Every ad carries a `disclosure.sponsored: true`
   flag and a visible label. Humans see `[Sponsored]`; agents receive the flag in
   structured form. An AgentAd unit must never be presentable as organic output.
2. **Agent-readable.** Ads may carry a `machine_readable` payload so an autonomous
   agent can reason about the offer instead of scraping rendered text.
3. **Terminal-native formats.** `text`, `markdown`, `ansi`, `banner`, `json`.
4. **Publisher control.** Placements declare accepted formats, dimensions,
   frequency caps, and category blocks.

## Primitives

| Type | Schema | Purpose |
| --- | --- | --- |
| `agentad.ad` | `agentad-ad.schema.json` | A single ad unit |
| `agentad.placement` | `agentad-placement.schema.json` | A slot in a CLI/agent |
| `agentad.ad_request` | `agentad-ad-request.schema.json` | Request to fill a placement |
| `agentad.ad_response` | `agentad-ad-response.schema.json` | Filled ads + tracking tokens |
| `agentad.impression` | `agentad-impression.schema.json` | Confirmed display |
| `agentad.click` | `agentad-click.schema.json` | Click / conversion |
| `agentad.campaign` | `agentad-campaign.schema.json` | Advertiser campaign |

Schemas are re-exported from `@profullstack/cl1s-schemas` (canonical:
`@logicsrc/schemas`) and identified under `https://schemas.logicsrc.com/`.

## Serving flow

```
publisher (CLI/agent)            cl1s network                 advertiser
        |                             |                            |
        |  POST /v1/ads  (ad_request) |                            |
        | --------------------------> |  match targeting/budget    |
        |  ad_response (+ tokens)     | <------------------------- |
        | <-------------------------- |                            |
   render + disclose                  |                            |
        |  POST /v1/impressions       |                            |
        | --------------------------> |                            |
        |  POST /v1/clicks (on action)|                            |
        | --------------------------> |                            |
```

## Human vs. agent consumers

The `consumer` field on a request changes how an ad is delivered:

- `human` → rendered string with an `[Sponsored]` header (see `renderAd`).
- `agent` → structured view via `toAgentView`, e.g.

```json
{
  "sponsored": true,
  "advertiser": "Railway",
  "title": "Ship your CLI to production in 60 seconds",
  "url": "https://railway.app/?ref=cl1s",
  "data": { "product": "railway", "install": "npm i -g @railway/cli" }
}
```

## Quick start

```bash
pnpm install
pnpm run validate:fixtures      # validate AgentAd docs against schemas
pnpm run dev:api                # ad-serving reference service on :8787
CL1S_ENDPOINT=http://localhost:8787 node packages/cli/bin/cl1s.js \
  fetch --placement cli-footer-slot
```

## Versioning

Documents carry a `version` (currently `0.1`). Breaking changes to a schema bump
the minor version until `1.0`, after which AgentAd follows semantic versioning.
