export interface Person {
  id: string;
  slug: string;
  name: string;
  bio: string;
  visits: number;
  sites: number;
  lastVisitAt: string | null;
}

export interface SiteStats {
  visits: number;
  firstVisitAt: string | null;
  lastVisitAt: string | null;
}

export interface SitePage {
  found: boolean;
  address: string;
  invalid?: boolean;
  title?: string;
  html?: string;
  author?: { id: string; name: string };
  publishedAt?: string;
  revision?: number;
  stats?: SiteStats;
}

export interface SearchResult {
  address: string;
  title: string;
  snippet: string;
  author: string;
  publishedAt: string;
}

export interface SearchResponse {
  query: string;
  results: SearchResult[];
  total: number;
  tookMs: number;
}

export type VisitMethod =
  | 'typed'
  | 'link'
  | 'back'
  | 'forward'
  | 'history'
  | 'search'
  | 'publish'
  | 'reload';

export type VisitOutcome = 'found' | 'missing';

export interface VisitRecord {
  id: string;
  address: string;
  title: string;
  outcome: VisitOutcome;
  method: VisitMethod;
  at: string;
}

export interface HistoryStats {
  total: number;
  addresses: number;
  firstVisitAt: string | null;
  lastVisitAt: string | null;
}

export interface HistoryResponse {
  visits: VisitRecord[];
  stats: HistoryStats;
}

export interface SiteSummary {
  address: string;
  title: string;
}

export interface PublishPayload {
  address: string;
  title: string;
  html: string;
  personId: string;
}

export interface FieldErrors {
  [field: string]: string;
}
