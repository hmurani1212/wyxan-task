/**
 * Addresses are hostnames and nothing else: `tidepool.zz`.
 *
 * A visitor may type `https://Tidepool.zz/`, an author may write
 * `href="tidepool.zz/"`, and both mean the same page. Canonicalisation is the
 * single place that decides what "the same address" means, so links, the
 * address bar, search results and history all agree.
 */
export const MAX_ADDRESS_LENGTH = 253;
export const MAX_LABEL_LENGTH = 63;

const LABEL = /^[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?$/;

/**
 * Turns anything a person or an author might write into the address we store.
 * Never throws: an unusable input comes back as a string that fails
 * `isValidAddress`, so the caller can decide what a broken address means.
 */
export function canonicalizeAddress(input: unknown): string {
  if (typeof input !== 'string') return '';

  let raw = input.trim().toLowerCase();
  if (!raw) return '';

  // A scheme and an authority are noise: only the host is the address.
  raw = raw.replace(/^[a-z][a-z0-9+.-]*:\/\//, '');
  raw = raw.replace(/^\/\//, '');
  raw = raw.split('#')[0];
  raw = raw.split('?')[0];
  raw = raw.split('/')[0];
  raw = raw.replace(/^.*@/, ''); // strip userinfo
  raw = raw.replace(/:\d+$/, ''); // strip a port
  raw = raw.replace(/\.$/, ''); // fully qualified trailing dot
  raw = raw.replace(/\s+/g, '');

  return raw;
}

/** At least two labels, each 1-63 characters, no edge hyphens. */
export function isValidAddress(input: unknown): boolean {
  const address = typeof input === 'string' ? input : '';
  if (!address || address.length > MAX_ADDRESS_LENGTH) return false;
  if (address !== canonicalizeAddress(address)) return false;

  const labels = address.split('.');
  if (labels.length < 2) return false;
  if (!labels.every((label) => label.length <= MAX_LABEL_LENGTH && LABEL.test(label))) return false;

  // The small web has made-up TLDs, but they are still letters.
  return /^[a-z]{2,}$/.test(labels[labels.length - 1]);
}

export function parseAddress(input: unknown): { address: string; valid: boolean } {
  const address = canonicalizeAddress(input);
  return { address, valid: isValidAddress(address) };
}

/** Addresses are hostnames, so `www.tidepool.zz` is a different page. */
export function addressHostname(address: string): string {
  return canonicalizeAddress(address);
}
