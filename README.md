# The small web

Ten one-page websites at ten addresses, and the browser you read them in.

Next.js (browser) + NestJS (web API) + MongoDB, in one npm workspace.

## Run it

```bash
# 1. MongoDB, listening on 127.0.0.1:27017
docker compose up -d mongo
#    or, with a local install:
#    mongod --dbpath ./.data --port 27017

# 2. install
npm install

# 3. someone to browse as, pages to browse
npm run seed            # repeatable and idempotent
npm run seed:reset      # same, plus removes every non-seeded page and visit

# 4. both sides
npm run dev             # api :4000, web :3000
```

Open <http://localhost:3000>, pick a name, type `tidepool.zz`.

Individually: `npm run dev:api`, `npm run dev:web`. The API alone answers on
<http://localhost:4000/api/health>; the web app reads `API_URL` (default
`http://127.0.0.1:4000`).

Environment: copy `.env.example` to `.env` if Mongo is somewhere else.
`MONGODB_URI` defaults to `mongodb://127.0.0.1:27017/smallweb`.

Tests: `npm test` (address canonicalisation, the sanitiser, seed integrity).

## The shape of it

```
apps/api   NestJS: addresses, sites, people, visits, search, seed
apps/web   Next.js: the browser shell, rendered on the client
```

- **An address is a hostname.** One canonicaliser (`apps/api/src/common/address.ts`,
  mirrored for the address bar) decides what "the same address" means. Stored,
  linked, searched and typed forms all reduce to `tidepool.zz`.
- **Pages are stored raw, sanitised on read.** `apps/api/src/common/html.ts` is the
  single allowlist: no script, no frame, no form, no event handler, no external
  asset. Links are rewritten to canonical addresses (`data-address`), and links
  that are not addresses are struck of their href and marked dead.
- **Author HTML is rendered in a sandboxed iframe without `allow-same-origin`**,
  under a nonce CSP, sized by a tiny bridge script. Sanitiser + sandbox + CSP are
  three separate lines that would each have to fail.
- **A visit is a row**: person, address, title, outcome (`found` / `missing`),
  method (`typed`, `link`, `back`, `forward`, `history`, `search`, `publish`,
  `reload`) and time. History is a query over visits, so it cannot drift from what
  happened.
- **Back and forward are a stack per person**, kept in `localStorage` with page
  snapshots, scroll offsets and the full forward trail. Going back to a page
  restores the page that was left, not a fresh fetch. Navigating from a back
  position discards what was ahead — forward is lost, as it should be.
- **Search** runs over a Mongo text index (address and title weighted above
  prose), with a regex fallback for partial words, and returns a snippet around
  the first match.

The seed is deterministic (ids derived from natural keys, fixed timestamps) and
idempotent (upsert by slug/address, seeded visits replaced). `--reset` is the
only destructive path.
