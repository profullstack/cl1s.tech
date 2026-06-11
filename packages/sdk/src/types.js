/**
 * Type-only module documenting the AgentAd shapes the SDK works with.
 * Authoritative definitions live in @cl1s/schemas (JSON Schema).
 *
 * @typedef {Object} Ad
 * @property {string} id
 * @property {string} format
 * @property {string} title
 * @property {string} [body]
 * @property {string} url
 * @property {string} [cta]
 * @property {{ sponsored: true, label: string, advertiser_name?: string }} disclosure
 * @property {Record<string, unknown>} [machine_readable]
 *
 * @typedef {Object} AdResponse
 * @property {string} request_id
 * @property {Array<{ ad: Ad, impression_token: string, rendered?: string }>} ads
 * @property {string} [no_fill_reason]
 */

export {};
