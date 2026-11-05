/**
 * The same rules the API applies, kept here so the address bar can decide
 * between "go to this address" and "search for this" without a round trip.
 * The server is still the authority: it canonicalises again on arrival.
 */
const LABEL = /^[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?$/;

export function canonicalizeAddress(input: string): string {
  if (typeof input !== 'string') return '';
  let raw = input.trim().toLowerCase();
  if (!raw) return '';

  raw = raw.replace(/^[a-z][a-z0-9+.-]*:\/\//, '');
  raw = raw.replace(/^\/\//, '');
  raw = raw.split('#')[0];
  raw = raw.split('?')[0];
  raw = raw.split('/')[0];
  raw = raw.replace(/^.*@/, '');
  raw = raw.replace(/:\d+$/, '');
  raw = raw.replace(/\.$/, '');
  raw = raw.replace(/\s+/g, '');
  return raw;
}

export function isValidAddress(input: string): boolean {
  const address = typeof input === 'string' ? input : '';
  if (!address || address.length > 253) return false;
  if (address !== canonicalizeAddress(address)) return false;
  const labels = address.split('.');
  if (labels.length < 2) return false;
  if (!labels.every((label) => label.length <= 63 && LABEL.test(label))) return false;
  return /^[a-z]{2,}$/.test(labels[labels.length - 1]);
}

export function parseAddress(input: string): { address: string; valid: boolean } {
  const address = canonicalizeAddress(input);
  return { address, valid: isValidAddress(address) };
}

export type OmniboxIntent =
  | { kind: 'address'; address: string }
  | { kind: 'search'; query: string };

/**
 * A browser's address bar is also a search box. The rule here is deliberately
 * simple and explainable: something with a dot in it is an address; anything
 * else is a question for the web.
 */
export function resolveOmnibox(input: string): OmniboxIntent | null {
  const raw = input.trim();
  if (!raw) return null;

  const explicitScheme = /^[a-z][a-z0-9+.-]*:\/\//i.test(raw);
  const address = canonicalizeAddress(raw);

  if (explicitScheme) return { kind: 'address', address };
  if (/\s/.test(raw)) return { kind: 'search', query: raw };
  if (address.includes('.') && isValidAddress(address)) return { kind: 'address', address };
  if (!address.includes('.')) return { kind: 'search', query: raw };
  return { kind: 'address', address };
}
