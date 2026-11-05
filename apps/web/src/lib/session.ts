import type { HistoryResponse, SearchResult, SitePage } from './types';

/**
 * A session is the tab's back/forward stack. It belongs to a person, it
 * survives a reload, and it is stored beside — not instead of — the visits the
 * server records. Visits are the permanent record; this is the working state.
 */
export type EntryKind = 'page' | 'search' | 'history' | 'publish' | 'welcome';

export interface PublishDraft {
  address: string;
  title: string;
  html: string;
}

export interface Entry {
  id: string;
  kind: EntryKind;
  title: string;
  address?: string;
  /** Snapshot of the page as it was shown; this is what back/forward restores. */
  page?: SitePage;
  query?: string;
  results?: SearchResult[];
  searchMeta?: { total: number; tookMs: number };
  history?: HistoryResponse;
  draft?: PublishDraft;
  error?: string;
  scrollY: number;
  at: number;
}

export interface BrowserSession {
  entries: Entry[];
  index: number;
}

const PERSON_KEY = 'smallweb.person.v1';
const SESSION_PREFIX = 'smallweb.session.v1.';
const MAX_ENTRIES = 60;

export function newId(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) return crypto.randomUUID();
  return `e-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

export function newEntry(partial: Omit<Entry, 'id' | 'scrollY' | 'at'> & Partial<Entry>): Entry {
  return {
    id: newId(),
    scrollY: 0,
    at: Date.now(),
    ...partial,
  };
}

export function welcomeEntry(): Entry {
  return newEntry({ kind: 'welcome', title: 'A small web' });
}

export function loadSession(personId: string): BrowserSession | null {
  try {
    const raw = localStorage.getItem(SESSION_PREFIX + personId);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as BrowserSession;
    if (!parsed || !Array.isArray(parsed.entries) || parsed.entries.length === 0) return null;
    if (typeof parsed.index !== 'number' || parsed.index < 0) return null;
    const index = Math.min(parsed.index, parsed.entries.length - 1);
    const entries = parsed.entries
      .filter((entry) => entry && typeof entry.id === 'string' && typeof entry.kind === 'string')
      .map((entry) => ({ ...entry, scrollY: Number(entry.scrollY) || 0 }));
    if (entries.length === 0) return null;
    return { entries: entries.slice(-MAX_ENTRIES), index: Math.min(index, entries.length - 1) };
  } catch {
    return null;
  }
}

export function saveSession(personId: string, session: BrowserSession): void {
  try {
    const entries = session.entries.slice(-MAX_ENTRIES).map((entry) => {
      // Dashboards are cheap to fetch again; cached pages are what back needs.
      if (entry.kind === 'history') return { ...entry, history: undefined };
      return entry;
    });
    const index = Math.min(session.index, entries.length - 1);
    localStorage.setItem(
      SESSION_PREFIX + personId,
      JSON.stringify({ entries, index: Math.max(index, 0) }),
    );
  } catch {
    // Storage full or blocked: the session still works in memory.
  }
}

export function readActivePersonId(): string | null {
  try {
    return localStorage.getItem(PERSON_KEY);
  } catch {
    return null;
  }
}

export function writeActivePersonId(personId: string): void {
  try {
    localStorage.setItem(PERSON_KEY, personId);
  } catch {
    // ignore
  }
}

export function truncate(session: BrowserSession): BrowserSession {
  const entries = session.entries.slice(-MAX_ENTRIES);
  return { entries, index: Math.min(session.index, entries.length - 1) };
}
