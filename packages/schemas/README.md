# @profullstack/cl1s-schemas

AgentAd JSON schemas consumed by the cl1s.tech network (SDK, CLI, API).

## Canonical source

**AgentAd is defined in [LogicSRC](https://github.com/profullstack/logicsrc)** as a
core primitive family (`docs/agentad.md`, `@logicsrc/schemas`). The schema files in
this package are an exact mirror — note the `$id`s resolve to
`https://schemas.logicsrc.com/agentad-*.schema.json`.

They are vendored here only because `@logicsrc/schemas` is not yet published to npm.
Once it is, this package will depend on it and re-export instead of carrying copies:

```js
// future
export { default as ad } from "@logicsrc/schemas/agentad-ad" with { type: "json" };
```

To resync from a local logicsrc checkout:

```bash
cp ../../../logicsrc/packages/schemas/schemas/agentad-*.schema.json schemas/
```

## Schemas

| Export | Type | File |
| --- | --- | --- |
| `./ad` | `agentad.ad` | `agentad-ad.schema.json` |
| `./placement` | `agentad.placement` | `agentad-placement.schema.json` |
| `./ad-request` | `agentad.ad_request` | `agentad-ad-request.schema.json` |
| `./ad-response` | `agentad.ad_response` | `agentad-ad-response.schema.json` |
| `./impression` | `agentad.impression` | `agentad-impression.schema.json` |
| `./click` | `agentad.click` | `agentad-click.schema.json` |
| `./campaign` | `agentad.campaign` | `agentad-campaign.schema.json` |
