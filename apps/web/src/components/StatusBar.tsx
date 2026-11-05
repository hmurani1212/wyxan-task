'use client';

import type { Entry } from '@/lib/session';
import type { Person } from '@/lib/types';

function relative(date: string | null | undefined): string {
  if (!date) return 'never';
  const then = new Date(date).getTime();
  const now = Date.now();
  const minutes = Math.round((now - then) / 60_000);
  if (minutes < 1) return 'just now';
  if (minutes < 60) return `${minutes} min ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours} hr ago`;
  const days = Math.round(hours / 24);
  if (days < 30) return `${days} day${days === 1 ? '' : 's'} ago`;
  return new Date(date).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

export function StatusBar({
  entry,
  person,
  index,
  count,
}: {
  entry: Entry | undefined;
  person: Person;
  index: number;
  count: number;
}) {
  const page = entry?.kind === 'page' ? entry.page : undefined;

  let left: React.ReactNode = <span className="status-muted">Start page</span>;
  if (page) {
    left = (
      <>
        <span className="status-address">{page.address}</span>
        <span className={`status-dot ${page.found ? 'ok' : 'bad'}`} aria-hidden="true" />
        <span className="status-muted">
          {page.found ? `by ${page.author?.name ?? 'unknown'}` : page.invalid ? 'invalid address' : 'never published'}
        </span>
        {page.found && page.stats ? (
          <span className="status-muted">
            {page.stats.visits === 0
              ? 'first visit'
              : `${page.stats.visits} visit${page.stats.visits === 1 ? '' : 's'} by you · last ${relative(page.stats.lastVisitAt)}`}
          </span>
        ) : null}
      </>
    );
  } else if (entry?.kind === 'search') {
    left = (
      <>
        <span className="status-address">search</span>
        {entry.query ? (
          <span className="status-muted">&ldquo;{entry.query}&rdquo;</span>
        ) : (
          <span className="status-muted">no query yet</span>
        )}
        {entry.searchMeta ? (
          <span className="status-muted">
            {entry.searchMeta.total} result{entry.searchMeta.total === 1 ? '' : 's'}
          </span>
        ) : null}
      </>
    );
  } else if (entry?.kind === 'history') {
    left = (
      <>
        <span className="status-address">history</span>
        <span className="status-muted">{person.name}</span>
      </>
    );
  } else if (entry?.kind === 'publish') {
    left = (
      <>
        <span className="status-address">publish</span>
        <span className="status-muted">an address and a page of HTML</span>
      </>
    );
  }

  return (
    <div className="statusbar">
      <div className="statusbar-left">{left}</div>
      <div className="statusbar-right">
        <span>{person.name}</span>
        <span className="status-sep" aria-hidden="true" />
        <span>
          {count === 0 ? 'no session' : `${index + 1} / ${count} in session`}
        </span>
      </div>
    </div>
  );
}
