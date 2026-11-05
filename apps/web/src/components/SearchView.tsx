'use client';

import { useState } from 'react';
import type { Entry } from '@/lib/session';
import { formatDate } from '@/lib/format';
import { PublishIcon, SearchIcon } from './Icons';

const escapeRegExp = (value: string) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

function Highlight({ text, query }: { text: string; query: string }) {
  const terms = query
    .toLowerCase()
    .split(/[^\p{L}\p{N}]+/u)
    .filter((term) => term.length > 1);
  if (terms.length === 0) return <>{text}</>;

  const pattern = new RegExp(`(${terms.map(escapeRegExp).join('|')})`, 'gi');
  return (
    <>
      {text.split(pattern).map((part, index) =>
        terms.includes(part.toLowerCase()) ? (
          <mark key={index}>{part}</mark>
        ) : (
          <span key={index}>{part}</span>
        ),
      )}
    </>
  );
}

const EXAMPLE_QUERIES = ['moth', 'rain gauge', 'harbour rules', 'insulator'];

export function SearchView({
  entry,
  busy,
  onSearch,
  onOpen,
  onPublish,
}: {
  entry: Entry;
  busy: boolean;
  onSearch: (query: string) => void;
  onOpen: (address: string) => void;
  onPublish: (query: string) => void;
}) {
  const [value, setValue] = useState(entry.query ?? '');
  const query = entry.query ?? '';
  const results = entry.results;

  return (
    <div className="panel">
      <header className="panel-head">
        <p className="eyebrow">Search</p>
        <h1>Every word on every page.</h1>
        <p className="panel-lede">
          Titles, addresses and prose are all indexed. Search chooses between pages; it does not
          just match the title.
        </p>
      </header>

      <form
        className="search-form"
        onSubmit={(event) => {
          event.preventDefault();
          if (value.trim()) onSearch(value.trim());
        }}
      >
        <SearchIcon className="search-glyph" />
        <input
          className="search-input"
          value={value}
          onChange={(event) => setValue(event.target.value)}
          placeholder="e.g. anemone, folded map, tide tables"
          aria-label="Search query"
          autoFocus
        />
        <button type="submit" className="button accent" disabled={!value.trim() || busy}>
          Search
        </button>
      </form>

      {!query ? (
        <div className="search-empty">
          <p className="muted">Try one of these:</p>
          <div className="chip-row">
            {EXAMPLE_QUERIES.map((example) => (
              <button
                key={example}
                type="button"
                className="chip-button"
                onClick={() => {
                  setValue(example);
                  onSearch(example);
                }}
              >
                {example}
              </button>
            ))}
          </div>
        </div>
      ) : null}

      {query ? (
        <div className="search-meta">
          <span>
            {busy && !results
              ? 'Searching the web…'
              : `${results?.length ?? 0} page${(results?.length ?? 0) === 1 ? '' : 's'} found`}
          </span>
          {entry.searchMeta ? <span className="muted">{entry.searchMeta.tookMs} ms</span> : null}
        </div>
      ) : null}

      {results && results.length > 0 ? (
        <ol className="results">
          {results.map((result) => (
            <li key={result.address}>
              <button type="button" className="result" onClick={() => onOpen(result.address)}>
                <span className="result-address">{result.address}</span>
                <span className="result-title">{result.title}</span>
                <span className="result-snippet">
                  <Highlight text={result.snippet} query={query} />
                </span>
                <span className="result-meta">
                  {result.author} · {formatDate(result.publishedAt)}
                </span>
              </button>
            </li>
          ))}
        </ol>
      ) : null}

      {query && !busy && results && results.length === 0 ? (
        <div className="search-empty">
          <h2>Nothing on this web says that yet.</h2>
          <p className="muted">
            There are only ten pages in here, so most questions have no answer. You could write one.
          </p>
          <button type="button" className="button accent" onClick={() => onPublish(query)}>
            <PublishIcon /> Publish a page about &ldquo;{query}&rdquo;
          </button>
        </div>
      ) : null}

      {entry.error ? <p className="form-error">{entry.error}</p> : null}
    </div>
  );
}
