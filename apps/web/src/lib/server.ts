import type { Person, SiteSummary } from './types';

const API_URL = process.env.API_URL ?? 'http://127.0.0.1:4000';

/**
 * The people are the only thing rendered on the server: the browser shell is a
 * client machine, but the cast should be there in the first paint.
 */
export async function getPeople(): Promise<Person[]> {
  try {
    const response = await fetch(`${API_URL}/api/people`, { cache: 'no-store' });
    if (!response.ok) return [];
    return (await response.json()) as Person[];
  } catch {
    return [];
  }
}

/** The addresses that already exist, for the start page and the address bar. */
export async function getSites(): Promise<SiteSummary[]> {
  try {
    const response = await fetch(`${API_URL}/api/sites`, { cache: 'no-store' });
    if (!response.ok) return [];
    return (await response.json()) as SiteSummary[];
  } catch {
    return [];
  }
}
