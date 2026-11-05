import type {
  FieldErrors,
  HistoryResponse,
  Person,
  PublishPayload,
  SearchResponse,
  SitePage,
  SiteSummary,
  VisitMethod,
  VisitOutcome,
} from './types';

export class ApiError extends Error {
  readonly status: number;
  readonly fields: FieldErrors;

  constructor(message: string, status: number, fields: FieldErrors = {}) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.fields = fields;
  }
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(path, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...(init?.headers ?? {}),
    },
    cache: 'no-store',
  });

  const body = await response.json().catch(() => null);

  if (!response.ok) {
    const payload = body as { message?: unknown; errors?: FieldErrors } | null;
    const message =
      typeof payload?.message === 'string'
        ? payload.message
        : Array.isArray(payload?.message)
          ? payload.message.join(', ')
          : `The web answered ${response.status}.`;
    throw new ApiError(message, response.status, payload?.errors ?? {});
  }

  return body as T;
}

export const api = {
  people(): Promise<Person[]> {
    return request<Person[]>('/api/people');
  },

  sites(): Promise<SiteSummary[]> {
    return request<SiteSummary[]>('/api/sites');
  },

  async site(address: string, personId?: string): Promise<SitePage> {
    const query = personId ? `?personId=${encodeURIComponent(personId)}` : '';
    const response = await fetch(`/api/sites/${encodeURIComponent(address)}${query}`, {
      cache: 'no-store',
    });
    const body = (await response.json().catch(() => null)) as SitePage | null;

    if (response.status === 404 && body) return body;
    if (!response.ok) {
      throw new ApiError(
        (body as unknown as { message?: string })?.message ?? 'That address could not be loaded.',
        response.status,
      );
    }
    return body as SitePage;
  },

  search(query: string): Promise<SearchResponse> {
    return request<SearchResponse>(`/api/search?q=${encodeURIComponent(query)}`);
  },

  publish(payload: PublishPayload): Promise<SitePage> {
    return request<SitePage>('/api/sites', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  recordVisit(payload: {
    personId: string;
    address: string;
    title: string;
    outcome: VisitOutcome;
    method: VisitMethod;
  }): Promise<{ id: string; at: string }> {
    return request('/api/visits', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  history(personId: string, limit = 200): Promise<HistoryResponse> {
    return request<HistoryResponse>(
      `/api/history?personId=${encodeURIComponent(personId)}&limit=${limit}`,
    );
  },
};
