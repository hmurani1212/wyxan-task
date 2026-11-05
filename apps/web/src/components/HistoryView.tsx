'use client';

import type { Entry } from '@/lib/session';
import { dayKey, dayLabel, formatDate, formatTime, METHOD_LABEL, METHOD_TONE } from '@/lib/format';
import type { Person, VisitRecord } from '@/lib/types';
import { ReloadIcon } from './Icons';

function groupByDay(visits: VisitRecord[]): Array<{ key: string; label: string; visits: VisitRecord[] }> {
  const groups: Array<{ key: string; label: string; visits: VisitRecord[] }> = [];
  for (const visit of visits) {
    const key = dayKey(visit.at);
    const last = groups[groups.length - 1];
    if (last && last.key === key) last.visits.push(visit);
    else groups.push({ key, label: dayLabel(visit.at), visits: [visit] });
  }
  return groups;
}

export function HistoryView({
  entry,
  person,
  busy,
  onJump,
  onRefresh,
}: {
  entry: Entry;
  person: Person;
  busy: boolean;
  onJump: (address: string) => void;
  onRefresh: () => void;
}) {
  const history = entry.history;
  const groups = groupByDay(history?.visits ?? []);

  return (
    <div className="panel">
      <header className="panel-head">
        <p className="eyebrow">History</p>
        <h1>{person.name}&rsquo;s trail.</h1>
        <p className="panel-lede">
          Every arrival, in order, including the ones that led nowhere. It belongs to this name and
          survives switching away.
        </p>
        <div className="history-stats">
          <span>
            <strong>{history?.stats.total ?? person.visits}</strong> visits
          </span>
          <span>
            <strong>{history?.stats.addresses ?? 0}</strong> addresses
          </span>
          <span>
            since <strong>{formatDate(history?.stats.firstVisitAt)}</strong>
          </span>
          <button type="button" className="link-button" onClick={onRefresh} disabled={busy}>
            <ReloadIcon /> refresh
          </button>
        </div>
      </header>

      {!history && busy ? <p className="muted">Reading the record…</p> : null}

      {history && history.visits.length === 0 ? (
        <p className="muted">No visits yet. Type an address to begin your trail.</p>
      ) : null}

      <div className="history-groups">
        {groups.map((group) => (
          <section key={group.key} className="history-day">
            <h2 className="history-day-label">{group.label}</h2>
            <ul className="history-list">
              {group.visits.map((visit) => (
                <li key={visit.id}>
                  <button
                    type="button"
                    className={`history-row${visit.outcome === 'missing' ? ' missing' : ''}`}
                    onClick={() => onJump(visit.address)}
                    title={`Open ${visit.address}`}
                  >
                    <span className="history-time">{formatTime(visit.at)}</span>
                    <span className="history-main">
                      <span className="history-title">
                        {visit.title || (visit.outcome === 'missing' ? 'No such address' : visit.address)}
                      </span>
                      <span className="history-address">{visit.address}</span>
                    </span>
                    <span className={`method-badge ${METHOD_TONE[visit.method] ?? 'neutral'}`}>
                      {METHOD_LABEL[visit.method] ?? visit.method}
                    </span>
                    {visit.outcome === 'missing' ? (
                      <span className="outcome-badge">nowhere</span>
                    ) : null}
                  </button>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>

      {history && history.visits.length > 0 ? (
        <p className="history-foot">
          Showing the most recent {history.visits.length} of {history.stats.total} visits.
        </p>
      ) : null}
    </div>
  );
}
