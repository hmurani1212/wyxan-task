'use client';

import type { SitePage } from '@/lib/types';
import { AlertIcon, BackIcon, PublishIcon, SearchIcon } from './Icons';

export function Nowhere({
  page,
  canGoBack,
  onBack,
  onSearch,
  onPublish,
}: {
  page: SitePage;
  canGoBack: boolean;
  onBack: () => void;
  onSearch: (query: string) => void;
  onPublish: (address: string) => void;
}) {
  return (
    <div className="nowhere">
      <div className="nowhere-inner">
        <p className="eyebrow">
          <AlertIcon /> {page.invalid ? 'That is not an address' : 'No such address'}
        </p>
        <h1 className="nowhere-address">{page.address}</h1>
        <p className="nowhere-copy">
          {page.invalid
            ? 'An address is a hostname and nothing else — no spaces, no paths, no scheme. Try something like tidepool.zz.'
            : 'Nothing has ever been published here. The link that brought you may have been broken, or the page may never have existed at all.'}
        </p>

        <div className="nowhere-actions">
          <button type="button" className="button" onClick={onBack} disabled={!canGoBack}>
            <BackIcon /> Go back
          </button>
          <button
            type="button"
            className="button ghost"
            onClick={() => onSearch(page.address)}
          >
            <SearchIcon /> Search for it
          </button>
          <button
            type="button"
            className="button accent"
            onClick={() => onPublish(page.address)}
          >
            <PublishIcon /> Publish something here
          </button>
        </div>

        <div className="nowhere-note">
          <span className="mono-label">What just happened</span>
          <p>
            This arrival was still recorded as a visit, under your name, with the address that
            failed. History is a record of where you went — including the places that were not
            there.
          </p>
        </div>
      </div>
    </div>
  );
}
