'use client';

import { useEffect, useRef, useState } from 'react';
import type { Person, SiteSummary } from '@/lib/types';
import type { EntryKind } from '@/lib/session';
import { resolveOmnibox } from '@/lib/address';
import {
  BackIcon,
  ChevronDownIcon,
  ForwardIcon,
  GlobeIcon,
  HistoryIcon,
  HomeIcon,
  PublishIcon,
  ReloadIcon,
  SearchIcon,
} from './Icons';

interface ToolbarProps {
  person: Person;
  people: Person[];
  onSwitchPerson: (person: Person) => void;
  entryKind: EntryKind;
  address: string;
  query: string;
  suggestions: SiteSummary[];
  canBack: boolean;
  canForward: boolean;
  busy: boolean;
  onBack: () => void;
  onForward: () => void;
  onReload: () => void;
  onHome: () => void;
  onOmniboxSubmit: (value: string) => void;
  onOpenSearch: () => void;
  onOpenHistory: () => void;
  onOpenPublish: () => void;
  addressInputRef: React.RefObject<HTMLInputElement | null>;
}

function initials(name: string): string {
  return name
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('');
}

export function Toolbar({
  person,
  people,
  onSwitchPerson,
  entryKind,
  address,
  query,
  suggestions,
  canBack,
  canForward,
  busy,
  onBack,
  onForward,
  onReload,
  onHome,
  onOmniboxSubmit,
  onOpenSearch,
  onOpenHistory,
  onOpenPublish,
  addressInputRef,
}: ToolbarProps) {
  const externalValue = entryKind === 'page' ? address : entryKind === 'search' ? query : '';
  const entryKey = `${entryKind}|${address}|${query}`;

  const [value, setValue] = useState(externalValue);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(-1);
  const previousKey = useRef(entryKey);
  const barRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    if (previousKey.current === entryKey) return;
    previousKey.current = entryKey;
    setValue(externalValue);
    setOpen(false);
    setActive(-1);
  }, [entryKey, externalValue]);

  useEffect(() => {
    const onPointerDown = (event: MouseEvent) => {
      if (barRef.current && !barRef.current.contains(event.target as Node)) setOpen(false);
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) setMenuOpen(false);
    };
    document.addEventListener('mousedown', onPointerDown);
    return () => document.removeEventListener('mousedown', onPointerDown);
  }, []);

  const trimmed = value.trim().toLowerCase();
  const matches = trimmed
    ? suggestions
        .filter(
          (site) =>
            site.address.includes(trimmed) || site.title.toLowerCase().includes(trimmed),
        )
        .slice(0, 6)
    : [];
  const intent = resolveOmnibox(value);
  const showSearchRow = intent?.kind === 'search';
  const rowCount = matches.length + (showSearchRow ? 1 : 0);

  const submit = (raw?: string) => {
    const chosen = raw ?? (active >= 0 && matches[active] ? matches[active].address : value);
    if (!chosen || !chosen.trim()) return;
    setOpen(false);
    setActive(-1);
    onOmniboxSubmit(chosen);
  };

  return (
    <div className="toolbar">
      <div className="toolbar-nav" role="group" aria-label="Navigation">
        <button
          type="button"
          className="icon-button"
          onClick={onBack}
          disabled={!canBack}
          aria-label="Back"
          title="Back (Alt+Left)"
        >
          <BackIcon />
        </button>
        <button
          type="button"
          className="icon-button"
          onClick={onForward}
          disabled={!canForward}
          aria-label="Forward"
          title="Forward (Alt+Right)"
        >
          <ForwardIcon />
        </button>
        <button
          type="button"
          className="icon-button"
          onClick={onReload}
          disabled={entryKind !== 'page'}
          aria-label="Reload"
          title="Reload this page"
        >
          <ReloadIcon />
        </button>
        <button
          type="button"
          className="icon-button"
          onClick={onHome}
          aria-label="Start page"
          title="Start page"
        >
          <HomeIcon />
        </button>
      </div>

      <div className="address-wrap" ref={barRef}>
        <form
          className={`address-bar${open ? ' is-open' : ''}`}
          onSubmit={(event) => {
            event.preventDefault();
            submit();
          }}
          role="search"
        >
          <span className="address-glyph" aria-hidden="true">
            <GlobeIcon />
          </span>
          <input
            ref={addressInputRef}
            className="address-input"
            value={value}
            onChange={(event) => {
              setValue(event.target.value);
              setOpen(true);
              setActive(-1);
            }}
            onFocus={() => setOpen(true)}
            onKeyDown={(event) => {
              if (event.key === 'ArrowDown') {
                event.preventDefault();
                setOpen(true);
                setActive((index) => Math.min(index + 1, rowCount - 1));
              } else if (event.key === 'ArrowUp') {
                event.preventDefault();
                setActive((index) => Math.max(index - 1, -1));
              } else if (event.key === 'Escape') {
                setOpen(false);
                setActive(-1);
                (event.target as HTMLInputElement).blur();
              }
            }}
            placeholder="Type an address, e.g. tidepool.zz — or a few words to search"
            aria-label="Address bar"
            autoComplete="off"
            spellCheck={false}
            inputMode="url"
          />
          <button type="submit" className="address-go" aria-label="Go" title="Go">
            <span className="address-go-key">↵</span>
          </button>
        </form>

        {open && rowCount > 0 ? (
          <div className="omnibox" role="listbox" aria-label="Suggestions">
            {matches.map((site, index) => (
              <button
                key={site.address}
                type="button"
                role="option"
                aria-selected={active === index}
                className={`omnibox-row${active === index ? ' active' : ''}`}
                onMouseEnter={() => setActive(index)}
                onMouseDown={(event) => event.preventDefault()}
                onClick={() => submit(site.address)}
              >
                <GlobeIcon className="omnibox-icon" />
                <span className="omnibox-main">
                  <span className="omnibox-address">{site.address}</span>
                  <span className="omnibox-title">{site.title}</span>
                </span>
              </button>
            ))}
            {showSearchRow ? (
              <button
                type="button"
                role="option"
                aria-selected={active === matches.length}
                className={`omnibox-row${active === matches.length ? ' active' : ''}`}
                onMouseEnter={() => setActive(matches.length)}
                onMouseDown={(event) => event.preventDefault()}
                onClick={() => submit(value)}
              >
                <SearchIcon className="omnibox-icon" />
                <span className="omnibox-main">
                  <span className="omnibox-address">Search the web</span>
                  <span className="omnibox-title">
                    for &ldquo;{value.trim()}&rdquo;
                  </span>
                </span>
              </button>
            ) : null}
          </div>
        ) : null}
      </div>

      <div className="toolbar-actions">
        <button
          type="button"
          className={`text-button${entryKind === 'search' ? ' is-current' : ''}`}
          onClick={onOpenSearch}
          title="Search every page"
        >
          <SearchIcon />
          <span>Search</span>
        </button>
        <button
          type="button"
          className={`text-button${entryKind === 'history' ? ' is-current' : ''}`}
          onClick={onOpenHistory}
          title="Your history"
        >
          <HistoryIcon />
          <span>History</span>
        </button>
        <button
          type="button"
          className={`text-button publish${entryKind === 'publish' ? ' is-current' : ''}`}
          onClick={onOpenPublish}
          title="Publish a page"
        >
          <PublishIcon />
          <span>Publish</span>
        </button>
      </div>

      <div className="person-menu" ref={menuRef}>
        <button
          type="button"
          className="person-chip"
          onClick={() => setMenuOpen((isOpen) => !isOpen)}
          aria-haspopup="listbox"
          aria-expanded={menuOpen}
          title="Switch person"
        >
          <span className="person-avatar">{initials(person.name)}</span>
          <span className="person-name">{person.name.split(' ')[0]}</span>
          <ChevronDownIcon className="person-chevron" />
        </button>
        {menuOpen ? (
          <div className="person-dropdown" role="listbox" aria-label="Browse as">
            <p className="dropdown-label">Browsing as</p>
            {people.map((candidate) => (
              <button
                key={candidate.id}
                type="button"
                role="option"
                aria-selected={candidate.id === person.id}
                className={`person-option${candidate.id === person.id ? ' active' : ''}`}
                onClick={() => {
                  setMenuOpen(false);
                  onSwitchPerson(candidate);
                }}
              >
                <span className="person-avatar small">{initials(candidate.name)}</span>
                <span className="person-option-main">
                  <span className="person-option-name">{candidate.name}</span>
                  <span className="person-option-meta">
                    {candidate.visits} visit{candidate.visits === 1 ? '' : 's'} ·{' '}
                    {candidate.sites} page{candidate.sites === 1 ? '' : 's'} written
                  </span>
                </span>
              </button>
            ))}
            <p className="dropdown-footnote">History belongs to the person, not the browser.</p>
          </div>
        ) : null}
      </div>

      {busy ? <span className="toolbar-busy" aria-hidden="true" /> : null}
    </div>
  );
}
