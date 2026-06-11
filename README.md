# cl1s.tech

**An open advertising network for the command line and AI agents.**

cl1s.tech serves ads to CLI tools and autonomous agents using the **AgentAd**
standard — every unit is *disclosed*, *agent-readable*, and *terminal-native*.
It is maintained by Profullstack, Inc. as an open standard; cl1s.tech is the first
hosted network built on it.

> No dark patterns: an AgentAd unit always declares itself sponsored, so neither a
> human at a prompt nor an AI agent can mistake it for organic output.

## Monorepo

```txt
packages/
  schemas   @profullstack/cl1s-schemas — AgentAd JSON schemas + fixtures
  sdk       @profullstack/cl1s-sdk     — fetch, render, and track ads from any CLI/agent
  cli       @profullstack/cl1s-cli     — the `cl1s` command surface
apps/
  api       @profullstack/cl1s-api     — Hono ad-serving reference service
  web       @profullstack/cl1s-web     — landing site
docs/
  agentad.md              — the AgentAd standard
scripts/
  validate-fixtures.js    — schema validation
```

## Quick start

```bash
pnpm install
pnpm run validate:fixtures        # validate AgentAd docs against schemas

# terminal 1 — ad-serving reference API
pnpm run dev:api                  # http://localhost:8787

# terminal 2 — request an ad as a CLI user
CL1S_ENDPOINT=http://localhost:8787 node packages/cli/bin/cl1s.js \
  fetch --placement cli-footer-slot

# …or as an agent (structured JSON output)
CL1S_ENDPOINT=http://localhost:8787 node packages/cli/bin/cl1s.js \
  fetch --placement cli-footer-slot --agent
```

## Embedding the SDK

```js
import { Cl1sClient, renderAd, toAgentView } from "@profullstack/cl1s-sdk";

const cl1s = new Cl1sClient({ placementId: "cli-footer-slot" });
const { ads } = await cl1s.requestAds({ context: { keywords: ["deploy"] } });

for (const { ad, impression_token } of ads) {
  console.log(renderAd(ad, { color: true })); // always shows [Sponsored]
  await cl1s.reportImpression(impression_token, ad.id);
}
```

## The AgentAd standard

AgentAd is defined canonically in
[LogicSRC](https://github.com/profullstack/logicsrc) (`@logicsrc/schemas`);
cl1s.tech re-exports it via [`packages/schemas`](packages/schemas)
(`@profullstack/cl1s-schemas`). Schema `$id`s resolve under
`https://schemas.logicsrc.com/`. See [`docs/agentad.md`](docs/agentad.md).

## License

MIT © Profullstack, Inc.
