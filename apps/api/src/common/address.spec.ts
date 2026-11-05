import { canonicalizeAddress, isValidAddress, parseAddress, addressHostname } from './address';

describe('canonicalizeAddress', () => {
  it('lowercases and trims', () => {
    expect(canonicalizeAddress('  TidePool.ZZ  ')).toBe('tidepool.zz');
  });

  it('drops a scheme, a port, a path, a query and a fragment', () => {
    expect(canonicalizeAddress('https://tidepool.zz:8080/notes?page=2#top')).toBe('tidepool.zz');
    expect(canonicalizeAddress('http://tidepool.zz/')).toBe('tidepool.zz');
    expect(canonicalizeAddress('//tidepool.zz/')).toBe('tidepool.zz');
  });

  it('drops userinfo and a fully-qualified trailing dot', () => {
    expect(canonicalizeAddress('someone@tidepool.zz')).toBe('tidepool.zz');
    expect(canonicalizeAddress('tidepool.zz.')).toBe('tidepool.zz');
  });

  it('removes whitespace so a pasted address still resolves', () => {
    expect(canonicalizeAddress(' tide pool . zz ')).toBe('tidepool.zz');
  });

  it('returns an empty string for non-strings and empty input', () => {
    expect(canonicalizeAddress(undefined)).toBe('');
    expect(canonicalizeAddress(null)).toBe('');
    expect(canonicalizeAddress(42)).toBe('');
    expect(canonicalizeAddress('   ')).toBe('');
  });

  it('is idempotent', () => {
    const once = canonicalizeAddress('HTTPS://Tidepool.zz/a/b');
    expect(canonicalizeAddress(once)).toBe(once);
  });
});

describe('isValidAddress', () => {
  it('accepts hostnames with at least two labels', () => {
    expect(isValidAddress('tidepool.zz')).toBe(true);
    expect(isValidAddress('a-b.c-d.zz')).toBe(true);
    expect(isValidAddress('1tide.zz')).toBe(true);
  });

  it('rejects anything that is not a bare hostname', () => {
    expect(isValidAddress('localhost')).toBe(false);
    expect(isValidAddress('tidepool.zz/path')).toBe(false);
    expect(isValidAddress('tidepool.zz?x=1')).toBe(false);
    expect(isValidAddress('https://tidepool.zz')).toBe(false);
    expect(isValidAddress('tide_pool.zz')).toBe(false);
    expect(isValidAddress('-tidepool.zz')).toBe(false);
    expect(isValidAddress('tidepool-.zz')).toBe(false);
    expect(isValidAddress('tidepool..zz')).toBe(false);
    expect(isValidAddress('tidepool.123')).toBe(false);
    expect(isValidAddress('tidepool.z')).toBe(false);
    expect(isValidAddress('')).toBe(false);
  });

  it('rejects over-long addresses and labels', () => {
    expect(isValidAddress(`${'a'.repeat(64)}.zz`)).toBe(false);
    expect(isValidAddress(`${Array.from({ length: 60 }, () => 'abcd').join('.')}.zz`)).toBe(false);
  });
});

describe('parseAddress', () => {
  it('reports the canonical form alongside validity', () => {
    expect(parseAddress('HTTPS://Tidepool.zz/notes')).toEqual({
      address: 'tidepool.zz',
      valid: true,
    });
    expect(parseAddress('not an address')).toEqual({
      address: 'notanaddress',
      valid: false,
    });
  });

  it('is what addressHostname exposes', () => {
    expect(addressHostname('https://Tidepool.zz/x')).toBe('tidepool.zz');
  });
});
