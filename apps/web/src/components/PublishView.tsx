'use client';

import { useState } from 'react';
import type { PublishDraft } from '@/lib/session';
import type { FieldErrors, Person } from '@/lib/types';
import { AlertIcon, PublishIcon } from './Icons';

const STARTER = `<h1>A page of my own</h1>
<p>This address did not exist an hour ago. Now it does, and what I write here is what anybody
who types it will read.</p>
<h2>Things worth knowing</h2>
<ul>
  <li>Links are written as bare addresses: <a href="tidepool.zz">tidepool.zz</a>.</li>
  <li>A link to an address that was never published still works. It leads nowhere.</li>
  <li>There is no script, no image, and no stylesheet from outside. Just words.</li>
</ul>
<blockquote>The small web is small on purpose.</blockquote>`;

export function PublishView({
  person,
  initialDraft,
  busy,
  error,
  fieldErrors,
  onSubmit,
  onDraftChange,
}: {
  person: Person;
  initialDraft?: PublishDraft;
  busy: boolean;
  error: string | null;
  fieldErrors: FieldErrors;
  onSubmit: (draft: PublishDraft) => void;
  onDraftChange: (draft: PublishDraft) => void;
}) {
  const [draft, setDraft] = useState<PublishDraft>(initialDraft ?? { address: '', title: '', html: '' });
  const [localErrors, setLocalErrors] = useState<FieldErrors>({});

  const update = (patch: Partial<PublishDraft>) => {
    const next = { ...draft, ...patch };
    setDraft(next);
    onDraftChange(next);
  };

  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    const next: FieldErrors = {};
    if (!draft.address.trim()) next.address = 'An address is required.';
    if (!draft.title.trim()) next.title = 'A title is required.';
    if (!draft.html.trim()) next.html = 'A page needs some HTML in it.';
    setLocalErrors(next);
    if (Object.keys(next).length > 0) return;
    onSubmit({ ...draft, address: draft.address.trim(), title: draft.title.trim() });
  };

  const errors = { ...localErrors, ...fieldErrors };

  return (
    <div className="panel">
      <header className="panel-head">
        <p className="eyebrow">Publish</p>
        <h1>Put a page on the web.</h1>
        <p className="panel-lede">
          An address and a page of HTML. Publishing as <strong>{person.name}</strong>. The address
          becomes yours the moment it is taken, and the page is readable by everyone.
        </p>
      </header>

      {error ? (
        <p className="form-error">
          <AlertIcon /> {error}
        </p>
      ) : null}

      <form className="publish-form" onSubmit={submit} noValidate>
        <div className="field-row">
          <label className="field">
            <span className="field-label">
              Address <span className="field-hint">a hostname, e.g. mynewpage.zz</span>
            </span>
            <input
              className="field-input mono"
              value={draft.address}
              onChange={(event) => update({ address: event.target.value })}
              placeholder="something.zz"
              spellCheck={false}
              autoCapitalize="none"
              autoCorrect="off"
              aria-invalid={Boolean(errors.address)}
            />
            {errors.address ? <span className="field-error">{errors.address}</span> : null}
          </label>

          <label className="field">
            <span className="field-label">
              Title <span className="field-hint">what the tab and the history will say</span>
            </span>
            <input
              className="field-input"
              value={draft.title}
              onChange={(event) => update({ title: event.target.value })}
              placeholder="A page about something"
              maxLength={140}
              aria-invalid={Boolean(errors.title)}
            />
            {errors.title ? <span className="field-error">{errors.title}</span> : null}
          </label>
        </div>

        <label className="field">
          <span className="field-label">
            The page, in HTML
            <span className="field-hint">
              {draft.html.length.toLocaleString('en-GB')} / 100,000 characters
            </span>
          </span>
          <textarea
            className="field-textarea"
            value={draft.html}
            onChange={(event) => update({ html: event.target.value })}
            placeholder={'<h1>A title</h1>\n<p>And a paragraph.</p>'}
            rows={16}
            spellCheck={false}
            aria-invalid={Boolean(errors.html)}
          />
          {errors.html ? <span className="field-error">{errors.html}</span> : null}
        </label>

        <div className="publish-actions">
          <button type="submit" className="button accent" disabled={busy}>
            <PublishIcon /> {busy ? 'Publishing…' : 'Publish to the web'}
          </button>
          <button
            type="button"
            className="button ghost"
            onClick={() => update({ html: STARTER })}
            disabled={busy}
          >
            Use a starting page
          </button>
          <span className="publish-note">
            Scripts, forms, frames, event handlers, external images and stylesheets are removed on
            the way in.
          </span>
        </div>
      </form>

      <details className="publish-details">
        <summary>What an author can still write</summary>
        <p>
          Headings, paragraphs, lists, quotes, tables, code, emphasis, links and a small set of
          inline styles. Every page is rendered inside a sandboxed frame with its own origin, so
          even markup that slipped past the allowlist could not reach this browser&rsquo;s screen.
          The cost: no JavaScript, no forms, no images, no remote fonts. A page is words and
          structure.
        </p>
      </details>
    </div>
  );
}
