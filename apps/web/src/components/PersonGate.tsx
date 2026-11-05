'use client';

import type { Person } from '@/lib/types';

export function PersonGate({
  people,
  onPick,
}: {
  people: Person[];
  onPick: (person: Person) => void;
}) {
  return (
    <div className="gate">
      <div className="gate-inner">
        <p className="kicker">
          The small web <span className="kicker-dash" /> No accounts, just names
        </p>
        <h1>
          A web of one-page sites,
          <br />
          <em>and a browser to read them in.</em>
        </h1>
        <p className="gate-lede">
          Anyone here can publish a page of HTML at an address of their own. Everyone here can
          browse it. Pick a name — the history you make belongs to that name, and to nobody else.
        </p>

        <div className="gate-people">
          {people.map((person) => (
            <button
              key={person.id}
              type="button"
              className="gate-person"
              onClick={() => onPick(person)}
            >
              <span className="gate-avatar">
                {person.name
                  .split(/\s+/)
                  .slice(0, 2)
                  .map((part) => part[0])
                  .join('')}
              </span>
              <span className="gate-name">{person.name}</span>
              <span className="gate-bio">{person.bio}</span>
              <span className="gate-meta">
                {person.visits} visit{person.visits === 1 ? '' : 's'} in history
                {person.sites > 0 ? ` · ${person.sites} page${person.sites === 1 ? '' : 's'} written` : ''}
              </span>
            </button>
          ))}
        </div>

        {people.length === 0 ? (
          <p className="gate-empty">
            The web is empty. Start the API and run the seed command, then reload this page.
          </p>
        ) : null}

        <p className="gate-foot">
          Ten pages, six people, one hour of history — all invented, and all in MongoDB.
        </p>
      </div>
    </div>
  );
}
