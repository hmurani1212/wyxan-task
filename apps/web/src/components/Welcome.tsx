'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { formatTime, greeting, relativeDay } from '@/lib/format';
import type { HistoryResponse, Person, SiteSummary } from '@/lib/types';
import { ArrowRightIcon, HistoryIcon, PublishIcon, SearchIcon } from './Icons';

export function Welcome({
  person,
  suggestions,
  onOpen,
  onSearch,
  onHistory,
  onPublish,
}: {
  person: Person;
  suggestions: SiteSummary[];
  onOpen: (address: string) => void;
  onSearch: () => void;
  onHistory: () => void;
  onPublish: () => void;
}) {
  const [history, setHistory] = useState<HistoryResponse | null>(null);

  useEffect(() => {
    let cancelled = false;
    api
      .history(person.id, 8)
      .then((result) => {
        if (!cancelled) setHistory(result);
      })
      .catch(() => undefined);
    return () => {
      cancelled = true;
    };
  }, [person.id]);

  const recent = (history?.visits ?? []).slice(0, 5);
  const waysIn = suggestions.slice(0, 3);

  return (
    <div className="welcome">
      <header className="welcome-head">
        <p className="eyebrow">Start page</p>
        <h1>
          {greeting()}, {person.name.split(' ')[0]}.
          <br />
          <em>The web is small. Walk all of it.</em>
        </h1>
        <p className="welcome-lede">
          Type an address in the bar above, or follow a link inside a page. Back and forward work
          the way you expect, and every arrival is written down under your name.
        </p>
      </header>

      <div className="welcome-grid">
        <section className="welcome-card">
          <h2>
            <span className="card-icon">
              <HistoryIcon />
            </span>
            Where you have been
          </h2>
          {recent.length === 0 ? (
            <p className="muted">Nothing yet. Your first address will appear here.</p>
          ) : (
            <ul className="recent-list">
              {recent.map((visit) => (
                <li key={visit.id}>
                  <button
                    type="button"
                    className="recent-row"
                    onClick={() => onOpen(visit.address)}
                    title={`Open ${visit.address}`}
                  >
                    <span className="recent-time">{formatTime(visit.at)}</span>
                    <span className="recent-main">
                      <span className="recent-address">{visit.address}</span>
                      <span className="recent-title">
                        {visit.title || 'No such address'}
                      </span>
                    </span>
                    <ArrowRightIcon className="recent-arrow" />
                  </button>
                </li>
              ))}
            </ul>
          )}
          <div className="welcome-card-foot">
            <button type="button" className="link-button" onClick={onHistory}>
              All of your history
            </button>
            {history?.stats.lastVisitAt ? (
              <span className="muted small">last arrival {relativeDay(history.stats.lastVisitAt)}</span>
            ) : null}
          </div>
        </section>

        <section className="welcome-card">
          <h2>
            <span className="card-icon">
              <SearchIcon />
            </span>
            Ways in
          </h2>
          <p className="muted">
            Three addresses to begin with. Every page links to others, and some links lead nowhere
            at all.
          </p>
          <ul className="ways-list">
            {waysIn.map((site) => (
              <li key={site.address}>
                <button type="button" className="way-row" onClick={() => onOpen(site.address)}>
                  <span className="way-address">{site.address}</span>
                  <span className="way-title">{site.title}</span>
                </button>
              </li>
            ))}
          </ul>
          <div className="welcome-card-foot">
            <button type="button" className="link-button" onClick={onSearch}>
              Search the whole web
            </button>
            <button type="button" className="link-button" onClick={onPublish}>
              <PublishIcon /> Publish a page
            </button>
          </div>
        </section>
      </div>

      <p className="welcome-hint">
        Shortcuts: <kbd>Alt</kbd> + <kbd>←</kbd> / <kbd>→</kbd> for back and forward,{' '}
        <kbd>Ctrl</kbd> + <kbd>K</kbd> for the address bar.
      </p>
    </div>
  );
}
