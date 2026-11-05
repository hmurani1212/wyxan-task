'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { api, ApiError } from '@/lib/api';
import { parseAddress, resolveOmnibox } from '@/lib/address';
import { formatDate } from '@/lib/format';
import {
  type BrowserSession,
  type Entry,
  type PublishDraft,
  loadSession,
  newEntry,
  readActivePersonId,
  saveSession,
  welcomeEntry,
  writeActivePersonId,
} from '@/lib/session';
import type { FieldErrors, Person, SitePage, SiteSummary, VisitMethod } from '@/lib/types';
import { HistoryView } from './HistoryView';
import { AlertIcon, CloseIcon } from './Icons';
import { Nowhere } from './Nowhere';
import { PageFrame } from './PageFrame';
import { PersonGate } from './PersonGate';
import { PublishView } from './PublishView';
import { SearchView } from './SearchView';
import { StatusBar } from './StatusBar';
import { Toolbar } from './Toolbar';
import { Welcome } from './Welcome';

const pageTitle = (page: SitePage) =>
  page.found ? page.title ?? page.address : 'No such address';

export function BrowserApp({
  initialPeople,
  initialSites,
}: {
  initialPeople: Person[];
  initialSites: SiteSummary[];
}) {
  const [people, setPeople] = useState<Person[]>(initialPeople);
  const [sites, setSites] = useState<SiteSummary[]>(initialSites);
  const [person, setPerson] = useState<Person | null>(null);
  const [session, setSession] = useState<BrowserSession>({ entries: [], index: -1 });
  const [loading, setLoading] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [publishError, setPublishError] = useState<string | null>(null);
  const [publishFields, setPublishFields] = useState<FieldErrors>({});
  const [toast, setToast] = useState<{ id: number; text: string } | null>(null);
  const [ready, setReady] = useState(false);
  const [frameHeight, setFrameHeight] = useState(0);

  const sessionRef = useRef<BrowserSession>({ entries: [], index: -1 });
  const personRef = useRef<Person | null>(null);
  const navSeq = useRef(0);
  const pendingScroll = useRef<{ id: string; y: number } | null>(null);
  const saveTimer = useRef<number | undefined>(undefined);
  const scrollTimer = useRef<number | undefined>(undefined);
  const toastTimer = useRef<number | undefined>(undefined);
  const booted = useRef(false);
  const addressInputRef = useRef<HTMLInputElement | null>(null);

  const current = session.entries[session.index];

  const showToast = useCallback((text: string) => {
    if (toastTimer.current) window.clearTimeout(toastTimer.current);
    setToast({ id: Date.now(), text });
    toastTimer.current = window.setTimeout(() => setToast(null), 4200);
  }, []);

  useEffect(() => {
    return () => {
      if (toastTimer.current) window.clearTimeout(toastTimer.current);
    };
  }, []);

  const persistNow = useCallback(() => {
    const activePerson = personRef.current;
    if (!activePerson) return;
    saveSession(activePerson.id, sessionRef.current);
  }, []);

  const persistSoon = useCallback(() => {
    if (saveTimer.current) window.clearTimeout(saveTimer.current);
    saveTimer.current = window.setTimeout(() => {
      saveTimer.current = undefined;
      persistNow();
    }, 250);
  }, [persistNow]);

  const applySession = useCallback(
    (next: BrowserSession) => {
      sessionRef.current = next;
      setSession(next);
      persistSoon();
    },
    [persistSoon],
  );

  const patchEntry = useCallback(
    (id: string, patch: Partial<Entry>) => {
      const active = sessionRef.current;
      const entries = active.entries.map((entry) =>
        entry.id === id ? { ...entry, ...patch } : entry,
      );
      applySession({ ...active, entries });
    },
    [applySession],
  );

  const pushEntry = useCallback(
    (entry: Entry) => {
      const active = sessionRef.current;
      // A new navigation ends the forward trail: what was ahead is lost.
      const kept = active.entries.slice(0, active.index + 1);
      const entries = [...kept, entry].slice(-60);
      applySession({ entries, index: entries.length - 1 });
      pendingScroll.current = { id: entry.id, y: 0 };
    },
    [applySession],
  );

  const recordVisit = useCallback((page: SitePage, method: VisitMethod) => {
    const activePerson = personRef.current;
    if (!activePerson) return;
    api
      .recordVisit({
        personId: activePerson.id,
        address: page.address,
        title: page.title ?? '',
        outcome: page.found ? 'found' : 'missing',
        method,
      })
      .catch(() => undefined);
  }, []);

  const loadSearchInto = useCallback(
    async (entryId: string, query: string) => {
      try {
        const response = await api.search(query);
        patchEntry(entryId, {
          results: response.results,
          searchMeta: { total: response.total, tookMs: response.tookMs },
          error: undefined,
        });
      } catch {
        patchEntry(entryId, { error: 'Search failed. Is the API running?' });
      }
    },
    [patchEntry],
  );

  const loadEntry = useCallback(
    async (entryId: string, address: string, method: VisitMethod, record = true) => {
      const seq = ++navSeq.current;
      const parsed = parseAddress(address);
      let page: SitePage;
      if (!parsed.valid) {
        page = { found: false, address: parsed.address || address, invalid: true };
      } else {
        try {
          page = await api.site(parsed.address, personRef.current?.id);
        } catch {
          if (seq === navSeq.current) showToast('The web did not answer. Is the API running?');
          return;
        }
      }
      if (seq !== navSeq.current) return;
      patchEntry(entryId, {
        address: page.address,
        title: pageTitle(page),
        page,
        error: undefined,
      });
      if (record) recordVisit(page, method);
    },
    [patchEntry, recordVisit, showToast],
  );

  const loadHistoryInto = useCallback(
    async (entryId: string) => {
      const activePerson = personRef.current;
      if (!activePerson) return;
      setLoading(true);
      try {
        const history = await api.history(activePerson.id);
        patchEntry(entryId, { history });
      } catch {
        patchEntry(entryId, { error: 'Could not read history. Is the API running?' });
      } finally {
        setLoading(false);
      }
    },
    [patchEntry],
  );

  const openAddress = useCallback(
    async (
      raw: string,
      method: VisitMethod,
      options: { replaceEntryId?: string; replaceWelcome?: boolean } = {},
    ) => {
      const trimmed = raw.trim();
      if (!trimmed) return;
      const seq = ++navSeq.current;
      const parsed = parseAddress(trimmed);
      setLoading(true);

      let page: SitePage;
      if (!parsed.valid) {
        page = { found: false, address: parsed.address || trimmed, invalid: true };
      } else {
        try {
          page = await api.site(parsed.address, personRef.current?.id);
        } catch {
          if (seq === navSeq.current) {
            setLoading(false);
            showToast('The web did not answer. Is the API running?');
          }
          return;
        }
      }
      if (seq !== navSeq.current) return;
      setLoading(false);

      const snapshot = newEntry({
        kind: 'page',
        address: page.address,
        title: pageTitle(page),
        page,
      });

      if (options.replaceEntryId) {
        patchEntry(options.replaceEntryId, { ...snapshot, id: options.replaceEntryId });
      } else if (options.replaceWelcome) {
        const active = sessionRef.current;
        const entry = active.entries[active.index];
        if (entry && entry.kind === 'welcome' && active.entries.length === 1) {
          patchEntry(entry.id, { ...snapshot, id: entry.id });
        } else {
          pushEntry(snapshot);
        }
      } else {
        pushEntry(snapshot);
      }

      recordVisit(page, method);
    },
    [patchEntry, pushEntry, recordVisit, showToast],
  );

  const runSearch = useCallback(
    async (rawQuery: string, options: { replaceEntryId?: string } = {}) => {
      const query = rawQuery.trim();
      if (!query) return;
      const seq = ++navSeq.current;
      const entry = newEntry({ kind: 'search', title: `Search: ${query}`, query });
      const entryId = options.replaceEntryId ?? entry.id;

      if (options.replaceEntryId) {
        patchEntry(options.replaceEntryId, { ...entry, id: options.replaceEntryId });
      } else {
        pushEntry(entry);
      }

      setLoading(true);
      try {
        const response = await api.search(query);
        if (seq !== navSeq.current) return;
        patchEntry(entryId, {
          results: response.results,
          searchMeta: { total: response.total, tookMs: response.tookMs },
          error: undefined,
        });
      } catch {
        if (seq === navSeq.current) {
          patchEntry(entryId, { error: 'Search failed. Is the API running?' });
        }
      } finally {
        if (seq === navSeq.current) setLoading(false);
      }
    },
    [patchEntry, pushEntry],
  );

  const goBack = useCallback(() => {
    const active = sessionRef.current;
    if (active.index <= 0) return;
    const index = active.index - 1;
    const entry = active.entries[index];
    if (!entry) return;
    applySession({ ...active, index });
    pendingScroll.current = { id: entry.id, y: entry.scrollY };

    if (entry.kind === 'page') {
      if (entry.page) recordVisit(entry.page, 'back');
      else if (entry.address) void loadEntry(entry.id, entry.address, 'back');
    } else if (entry.kind === 'search' && !entry.results && entry.query) {
      void loadSearchInto(entry.id, entry.query);
    } else if (entry.kind === 'history') {
      void loadHistoryInto(entry.id);
    }
  }, [applySession, loadEntry, loadHistoryInto, loadSearchInto, recordVisit]);

  const goForward = useCallback(() => {
    const active = sessionRef.current;
    if (active.index >= active.entries.length - 1) return;
    const index = active.index + 1;
    const entry = active.entries[index];
    if (!entry) return;
    applySession({ ...active, index });
    pendingScroll.current = { id: entry.id, y: entry.scrollY };

    if (entry.kind === 'page') {
      if (entry.page) recordVisit(entry.page, 'forward');
      else if (entry.address) void loadEntry(entry.id, entry.address, 'forward');
    } else if (entry.kind === 'search' && !entry.results && entry.query) {
      void loadSearchInto(entry.id, entry.query);
    } else if (entry.kind === 'history') {
      void loadHistoryInto(entry.id);
    }
  }, [applySession, loadEntry, loadHistoryInto, loadSearchInto, recordVisit]);

  const openSearch = useCallback(() => {
    pushEntry(newEntry({ kind: 'search', title: 'Search', query: '' }));
  }, [pushEntry]);

  const openHistory = useCallback(() => {
    const entry = newEntry({ kind: 'history', title: 'History' });
    pushEntry(entry);
    void loadHistoryInto(entry.id);
  }, [loadHistoryInto, pushEntry]);

  const openHome = useCallback(() => {
    pushEntry(welcomeEntry());
  }, [pushEntry]);

  const openPublish = useCallback(
    (draft?: PublishDraft) => {
      setPublishError(null);
      setPublishFields({});
      pushEntry(newEntry({ kind: 'publish', title: 'Publish a page', draft }));
    },
    [pushEntry],
  );

  const publishAt = useCallback(
    (address: string) => {
      openPublish({
        address: parseAddress(address).address,
        title: '',
        html: '',
      });
    },
    [openPublish],
  );

  const publishAbout = useCallback(
    (query: string) => {
      openPublish({ address: '', title: query.slice(0, 140), html: '' });
    },
    [openPublish],
  );

  const reload = useCallback(() => {
    const active = sessionRef.current;
    const entry = active.entries[active.index];
    if (!entry || entry.kind !== 'page' || !entry.address) return;
    void loadEntry(entry.id, entry.address, 'reload');
  }, [loadEntry]);

  const submitPublish = useCallback(
    async (draft: PublishDraft) => {
      const activePerson = personRef.current;
      if (!activePerson) return;
      setPublishing(true);
      setPublishError(null);
      setPublishFields({});
      try {
        const page = await api.publish({ ...draft, personId: activePerson.id });
        pushEntry(
          newEntry({
            kind: 'page',
            address: page.address,
            title: pageTitle(page),
            page,
          }),
        );
        recordVisit(page, 'publish');
        setSites((previous) =>
          previous.some((site) => site.address === page.address)
            ? previous
            : [...previous, { address: page.address, title: page.title ?? page.address }].sort(
                (a, b) => a.address.localeCompare(b.address),
              ),
        );
        showToast(`Published ${page.address}`);
      } catch (error) {
        if (error instanceof ApiError) {
          setPublishError(error.message);
          setPublishFields(error.fields);
        } else {
          setPublishError('Publishing failed. Is the API running?');
        }
      } finally {
        setPublishing(false);
      }
    },
    [pushEntry, recordVisit, showToast],
  );

  const switchPerson = useCallback(
    (next: Person) => {
      if (personRef.current?.id === next.id) return;
      persistNow();

      personRef.current = next;
      setPerson(next);
      writeActivePersonId(next.id);

      const restored = loadSession(next.id);
      const nextSession: BrowserSession = restored ?? {
        entries: [welcomeEntry()],
        index: 0,
      };
      sessionRef.current = nextSession;
      setSession(nextSession);
      const entry = nextSession.entries[nextSession.index];
      if (entry) pendingScroll.current = { id: entry.id, y: entry.scrollY };

      setPublishError(null);
      setPublishFields({});

      if (entry?.kind === 'page' && entry.address && !entry.page) {
        void loadEntry(entry.id, entry.address, 'reload', false);
      } else if (entry?.kind === 'history') {
        void loadHistoryInto(entry.id);
      }

      showToast(`Browsing as ${next.name}`);
    },
    [loadEntry, loadHistoryInto, persistNow, showToast],
  );

  const handleLink = useCallback(
    (address: string) => {
      void openAddress(address, 'link');
    },
    [openAddress],
  );

  const handleDeadLink = useCallback(() => {
    showToast('That link is not an address, so there is nowhere to go.');
  }, [showToast]);

  const onOmniboxSubmit = useCallback(
    (value: string) => {
      const intent = resolveOmnibox(value);
      if (!intent) return;
      if (intent.kind === 'address') void openAddress(intent.address, 'typed');
      else void runSearch(intent.query);
    },
    [openAddress, runSearch],
  );

  // Boot: who is browsing, and where were they?
  useEffect(() => {
    if (booted.current) return;
    booted.current = true;
    let cancelled = false;

    (async () => {
      let list = initialPeople;
      if (list.length === 0) {
        try {
          list = await api.people();
        } catch {
          list = [];
        }
      }
      if (cancelled) return;
      setPeople(list);

      if (initialSites.length === 0) {
        try {
          setSites(await api.sites());
        } catch {
          // Suggestions are a convenience; the address bar works without them.
        }
      }

      const savedId = readActivePersonId();
      const saved = list.find((candidate) => candidate.id === savedId) ?? null;

      if (saved) {
        personRef.current = saved;
        setPerson(saved);
        const restored = loadSession(saved.id);
        const nextSession: BrowserSession = restored ?? {
          entries: [welcomeEntry()],
          index: 0,
        };
        sessionRef.current = nextSession;
        setSession(nextSession);
        const entry = nextSession.entries[nextSession.index];
        if (entry) pendingScroll.current = { id: entry.id, y: entry.scrollY };

        const go = new URLSearchParams(window.location.search).get('go');
        if (go) {
          window.history.replaceState({}, '', window.location.pathname);
          void openAddress(go, 'typed', { replaceWelcome: true });
        } else if (entry?.kind === 'page' && entry.address) {
          // A reload of the app is a reload of the page, not a step back to a cache.
          void loadEntry(entry.id, entry.address, 'reload', false);
        } else if (entry?.kind === 'history') {
          void loadHistoryInto(entry.id);
        }
      }

      setReady(true);
    })();

    return () => {
      cancelled = true;
    };
    // Boot runs once; the callbacks it uses are stable.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Scroll positions belong to entries, and entries survive a reload.
  useEffect(() => {
    const onScroll = () => {
      const entry = sessionRef.current.entries[sessionRef.current.index];
      if (!entry) return;
      // While a restore is in flight the page is still growing, so the clamp at
      // the bottom of a short document must not be mistaken for where you were.
      if (pendingScroll.current?.id === entry.id) return;
      entry.scrollY = window.scrollY;
      if (scrollTimer.current) return;
      scrollTimer.current = window.setTimeout(() => {
        scrollTimer.current = undefined;
        persistNow();
      }, 400);
    };
    const abandonRestore = () => {
      pendingScroll.current = null;
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('wheel', abandonRestore, { passive: true });
    window.addEventListener('touchmove', abandonRestore, { passive: true });
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('wheel', abandonRestore);
      window.removeEventListener('touchmove', abandonRestore);
    };
  }, [persistNow]);

  // A page's height arrives from inside the frame, after the page itself. Keep
  // re-applying the remembered offset until the document stops growing.
  useEffect(() => {
    const restore = () => {
      const entry = sessionRef.current.entries[sessionRef.current.index];
      const pending = pendingScroll.current;
      if (!entry || !pending || pending.id !== entry.id) return;
      window.scrollTo(0, pending.y);
      const timer = window.setTimeout(() => {
        if (pendingScroll.current?.id === entry.id) {
          window.scrollTo(0, pendingScroll.current.y);
          pendingScroll.current = null;
        }
      }, 450);
      return () => window.clearTimeout(timer);
    };
    return restore();
  }, [current?.id, frameHeight]);

  const persist = persistNow;
  useEffect(() => {
    const onHide = () => persist();
    const onVisibility = () => {
      if (document.visibilityState === 'hidden') persist();
    };
    window.addEventListener('pagehide', onHide);
    document.addEventListener('visibilitychange', onVisibility);
    return () => {
      window.removeEventListener('pagehide', onHide);
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, [persist]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.altKey && event.key === 'ArrowLeft') {
        event.preventDefault();
        goBack();
      } else if (event.altKey && event.key === 'ArrowRight') {
        event.preventDefault();
        goForward();
      } else if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        addressInputRef.current?.focus();
        addressInputRef.current?.select();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [goBack, goForward]);

  if (!ready) {
    return (
      <div className="boot">
        <span className="wordmark">The small web</span>
        <span className="boot-line" aria-hidden="true" />
      </div>
    );
  }

  if (!person) {
    return <PersonGate people={people} onPick={switchPerson} />;
  }

  const canBack = session.index > 0;
  const canForward = session.index >= 0 && session.index < session.entries.length - 1;
  const address = current?.kind === 'page' ? current.address ?? '' : '';
  const query = current?.kind === 'search' ? current?.query ?? '' : '';

  const tone =
    current?.kind === 'page'
      ? current.page?.found
        ? 'ok'
        : 'bad'
      : current?.kind === 'search'
        ? 'active'
        : current?.kind === 'publish'
          ? 'start'
          : 'neutral';

  const statusLabel =
    current?.kind === 'page'
      ? current.page?.found
        ? 'published'
        : current.page?.invalid
          ? 'invalid address'
          : 'nowhere'
      : current?.kind === 'search'
        ? 'search'
        : current?.kind === 'history'
          ? 'history'
          : current?.kind === 'publish'
            ? 'draft'
            : 'start';

  return (
    <div className="app">
      <div className="app-head">
        <span className="wordmark">The small web</span>
        <span className="app-head-meta">
          ten pages · one hour of history · no accounts, only names
        </span>
      </div>

      <div className="chrome">
        <Toolbar
          person={person}
          people={people}
          onSwitchPerson={switchPerson}
          entryKind={current?.kind ?? 'welcome'}
          address={address}
          query={query}
          suggestions={sites}
          canBack={canBack}
          canForward={canForward}
          busy={loading}
          onBack={goBack}
          onForward={goForward}
          onReload={reload}
          onHome={openHome}
          onOmniboxSubmit={onOmniboxSubmit}
          onOpenSearch={openSearch}
          onOpenHistory={openHistory}
          onOpenPublish={() => openPublish()}
          addressInputRef={addressInputRef}
        />

        <div className="tabstrip">
          <span className={`tab-dot ${tone}`} aria-hidden="true" />
          <span className="tab-title">{current?.title ?? 'New page'}</span>
          {current?.kind === 'page' && current.address ? (
            <span className="tab-address">{current.address}</span>
          ) : null}
          <span className={`tab-status ${tone}`}>{statusLabel}</span>
          {loading ? <span className="tab-loading" aria-label="Loading" /> : null}
        </div>

        <main className="area" aria-live="polite">
          {!current ? <p className="muted pad">Nothing open.</p> : null}

          {current?.kind === 'welcome' ? (
            <Welcome
              person={person}
              suggestions={sites}
              onOpen={(next) => void openAddress(next, 'typed')}
              onSearch={openSearch}
              onHistory={openHistory}
              onPublish={() => openPublish()}
            />
          ) : null}

          {current?.kind === 'search' ? (
            <SearchView
              key={current.id}
              entry={current}
              busy={loading}
              onSearch={(next) => void runSearch(next)}
              onOpen={(next) => void openAddress(next, 'search')}
              onPublish={publishAbout}
            />
          ) : null}

          {current?.kind === 'history' ? (
            <HistoryView
              entry={current}
              person={person}
              busy={loading}
              onJump={(next) => void openAddress(next, 'history')}
              onRefresh={() => void loadHistoryInto(current.id)}
            />
          ) : null}

          {current?.kind === 'publish' ? (
            <PublishView
              key={current.id}
              person={person}
              initialDraft={current.draft}
              busy={publishing}
              error={publishError}
              fieldErrors={publishFields}
              onSubmit={submitPublish}
              onDraftChange={(draft) => {
                const active = sessionRef.current;
                const entry = active.entries[active.index];
                if (entry && entry.id === current.id) {
                  entry.draft = draft;
                  persistSoon();
                }
              }}
            />
          ) : null}

          {current?.kind === 'page' ? (
            current.page ? (
              current.page.found ? (
                <article className="sheet">
                  <div className="sheet-meta">
                    <span className="sheet-author">{current.page.author?.name}</span>
                    <span>{formatDate(current.page.publishedAt)}</span>
                    <span>revision {current.page.revision}</span>
                    <span className="sheet-address">{current.page.address}</span>
                  </div>
                  <PageFrame
                    page={current.page}
                    onNavigate={handleLink}
                    onDeadLink={handleDeadLink}
                    onHeight={setFrameHeight}
                  />
                </article>
              ) : (
                <Nowhere
                  page={current.page}
                  canGoBack={canBack}
                  onBack={goBack}
                  onSearch={(text) => void runSearch(text)}
                  onPublish={publishAt}
                />
              )
            ) : (
              <div className="page-skeleton" aria-label="Loading page">
                <span className="skeleton-line wide" />
                <span className="skeleton-line" />
                <span className="skeleton-line" />
                <span className="skeleton-line short" />
                <p className="muted">{current.address} — asking the web…</p>
              </div>
            )
          ) : null}
        </main>

        <StatusBar
          entry={current}
          person={person}
          index={session.index}
          count={session.entries.length}
        />
      </div>

      {toast ? (
        <div className="toast" role="status" key={toast.id}>
          <AlertIcon />
          <span>{toast.text}</span>
          <button
            type="button"
            className="toast-close"
            onClick={() => setToast(null)}
            aria-label="Dismiss"
          >
            <CloseIcon />
          </button>
        </div>
      ) : null}
    </div>
  );
}
