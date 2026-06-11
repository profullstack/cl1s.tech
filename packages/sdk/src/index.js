/**
 * @profullstack/cl1s-sdk — AgentAd client for CLI tools and AI agents.
 *
 * Fetches ads for a registered placement, renders them for humans or agents,
 * and reports impression/click events back to the network.
 */

const DEFAULT_ENDPOINT = "https://api.cl1s.tech";

/**
 * @typedef {Object} Cl1sOptions
 * @property {string} [endpoint] Ad network base URL.
 * @property {string} placementId Registered placement id.
 * @property {string} [publisherDid] Publisher DID for attribution.
 * @property {"human"|"agent"} [consumer] Who reads the ad. Defaults to "human".
 * @property {typeof fetch} [fetch] Custom fetch implementation.
 */

export class Cl1sClient {
  /** @param {Cl1sOptions} options */
  constructor(options) {
    if (!options?.placementId) throw new Error("cl1s: placementId is required");
    this.endpoint = (options.endpoint ?? DEFAULT_ENDPOINT).replace(/\/$/, "");
    this.placementId = options.placementId;
    this.publisherDid = options.publisherDid;
    this.consumer = options.consumer ?? "human";
    this._fetch = options.fetch ?? globalThis.fetch;
    if (!this._fetch) throw new Error("cl1s: no fetch available; pass options.fetch");
  }

  /**
   * Request ads to fill this placement.
   * @param {{ context?: object, format?: string, count?: number }} [opts]
   * @returns {Promise<import("./types.js").AdResponse>}
   */
  async requestAds(opts = {}) {
    const body = {
      type: "agentad.ad_request",
      version: "0.1",
      placement_id: this.placementId,
      publisher_did: this.publisherDid,
      consumer: this.consumer,
      context: opts.context,
      format_override: opts.format,
      count: opts.count ?? 1,
    };
    const res = await this._fetch(`${this.endpoint}/v1/ads`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(body),
    });
    if (!res.ok) throw new Error(`cl1s: ad request failed (${res.status})`);
    return res.json();
  }

  /** Confirm an ad was displayed. */
  async reportImpression(impressionToken, adId) {
    return this._post("/v1/impressions", {
      type: "agentad.impression",
      version: "0.1",
      impression_token: impressionToken,
      ad_id: adId,
      placement_id: this.placementId,
      consumer: this.consumer,
      occurred_at: new Date().toISOString(),
    });
  }

  /** Record a click/conversion. */
  async reportClick(clickToken, adId, action = "click") {
    return this._post("/v1/clicks", {
      type: "agentad.click",
      version: "0.1",
      click_token: clickToken,
      ad_id: adId,
      placement_id: this.placementId,
      action,
      consumer: this.consumer,
      occurred_at: new Date().toISOString(),
    });
  }

  async _post(path, payload) {
    const res = await this._fetch(`${this.endpoint}${path}`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(payload),
    });
    return res.ok;
  }
}

/**
 * Render an ad as a disclosed, terminal-friendly string.
 * Always prepends the sponsored label so the unit is never mistaken for organic output.
 * @param {import("./types.js").Ad} ad
 * @param {{ width?: number, color?: boolean }} [opts]
 */
export function renderAd(ad, opts = {}) {
  const width = opts.width ?? 80;
  const label = ad.disclosure?.label ?? "Sponsored";
  const dim = opts.color ? "\x1b[2m" : "";
  const reset = opts.color ? "\x1b[0m" : "";
  const rule = "─".repeat(Math.min(width, 80));
  const lines = [
    `${dim}${rule}${reset}`,
    `${dim}[${label}]${reset} ${ad.title}`,
  ];
  if (ad.body) lines.push(ad.body);
  if (ad.cta && ad.url) lines.push(`${ad.cta} → ${ad.url}`);
  else if (ad.url) lines.push(ad.url);
  lines.push(`${dim}${rule}${reset}`);
  return lines.join("\n");
}

/**
 * Agent-native view of an ad: the structured payload plus an explicit disclosure flag,
 * so an autonomous agent can decide whether and how to surface it.
 * @param {import("./types.js").Ad} ad
 */
export function toAgentView(ad) {
  return {
    sponsored: true,
    advertiser: ad.disclosure?.advertiser_name,
    title: ad.title,
    body: ad.body,
    url: ad.url,
    cta: ad.cta,
    data: ad.machine_readable ?? null,
  };
}

export default Cl1sClient;
