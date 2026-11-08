# The small web — project guide and recording script

Everything you need to understand this project, run it, and narrate a 4–5 minute
recording of it. Read sections 1–6 once so the model is in your head; then record
from section 7, which is timed and tells you exactly what to click and say.

---

## 1. What this is

A small web: ten one-page websites at ten addresses, stored in MongoDB, and the
browser you read them in. The pages are invented; the browser behaviour is the
product.

- **Browser** — Next.js 15 (App Router, rendered on the client), port 3000.
- **Web API** — NestJS 11 + Mongoose, port 4000, mounted under `/api`.
- **Database** — MongoDB, `mongodb://127.0.0.1:27017/smallweb`.
- One npm workspace, one lockfile, one command for each side, one to seed.

The browser is not a shell around an iframe to a real internet. It is the whole
app: an address bar that canonicalises hostnames, a per-person back/forward stack
that restores pages and scroll positions, a visit log that is written on every
arrival, search over the prose, and publishing.

---

## 2. Run it

### Prerequisites

- Node.js 20 or newer, npm 10 or newer.
- MongoDB 6/7 reachable at `127.0.0.1:27017`.

### The four commands

```bash
# 1. MongoDB (pick one)
docker compose up -d mongo          # container, mongo:7, port 27017
# or, with a local install:
#   mongod --dbpath ./.data --port 27017

# 2. dependencies (once)
npm install

# 3. people and pages — deterministic, idempotent
npm run seed                        # keep what you have, replace the seeded rows
npm run seed:reset                  # also deletes every non-seeded page and visit

# 4. both sides, one command
npm run dev                         # API :4000, web :3000
```

Then open <http://localhost:3000>, pick a name, and type `tidepool.zz`.

Run the sides separately if you need to: `npm run dev:api`, `npm run dev:web`.
The API answers alone at <http://localhost:4000/api/health> →
`{"ok":true,"db":"connected"}`. The web app reads `API_URL` (default
`http://127.0.0.1:4000`). Copy `.env.example` to `.env` to point at another Mongo;
`MONGODB_URI` defaults to `mongodb://127.0.0.1:27017/smallweb`.

### What a good seed prints

```
--reset: removed 6 people, 10 sites, 64 visits
seeded 6 people, 10 sites (10 seeded), 64 visits
seeded visits replaced: 0; window: 2026-10-27T18:00:00.000Z + 60 minutes
addresses: tidepool.zz, saltmarsh.zz, lantern.zz, copperwire.zz, rainfall.zz,
  paperlanes.zz, mothbook.zz, harbours.zz, tinners.zz, bellwether.zz
sign in as any of: Maren Oyelaran, Ivo Brekke, Wren Sato, Nadia Falk, Tomas Vey, Osric Bell
```

### Checks

```bash
npm test        # 34 tests: address rules, the sanitiser, seed integrity
npm run build   # API tsc + Next production build
```

`npm test` covers three things that are easy to get subtly wrong: what counts as
the same address, what author HTML is allowed to survive, and whether the seed is
internally consistent (every published page reachable, dead links still dead,
trails the right shape, everything inside the seed hour).

---

## 3. What you are looking at

Top bar, left to right:

- **Back / Forward / Reload / Start page** — real controls with real state.
  Forward is greyed out when there is nothing ahead.
- **Address bar** — accepts an address *or* a few words. `tidepool.zz`,
  `https://Tidepool.zz/` and `Tidepool.zz` all go to the same page. Typing a
  phrase with spaces and pressing Enter runs a search. Suggestions appear for
  pages that exist; a suggestion row "Search the web" appears for a phrase.
- **Search / History / Publish** — three views in the same session, each an entry
  in the back/forward stack.
- **Person chip** — "Browsing as Nadia Falk", with a dropdown to switch. History
  and the back/forward stack belong to the person, not to the tab.

Bottom status bar: current address or view, the author and revision of the page,
how many times **this person** has been here, and the person's totals.

---

## 4. The model

Three collections. Small on purpose.

**`people`** — `slug`, `name`, `bio`, `seeded`. Six seeded.

**`sites`** — `address` (unique), `title`, `html` (exactly what the author wrote),
`text` (plain text, only for search), `authorId`, `publishedAt`, `revision`,
`seeded`. Ten seeded.

**`visits`** — `personId`, `address`, `title`, `outcome` (`found` | `missing`),
`method` (`typed`, `link`, `back`, `forward`, `history`, `search`, `publish`,
`reload`), `at`, `seeded`. Sixty-four seeded.

That is the whole schema. History is a query over `visits`, so it cannot drift
from what actually happened; there is no separate log to keep in sync.

**An address is a hostname.** `apps/api/src/common/address.ts` is the single
place that decides what "the same address" means: lowercase, no scheme, no path,
no query, no fragment, no port, no userinfo, no trailing dot. `isValidAddress`
then requires at least two labels, 1–63 characters each, no edge hyphens, and a
letter-only TLD. So `www.tidepool.zz` is a *different* page from `tidepool.zz`,
and `tide pool` is not an address at all. The same rules are mirrored in the
browser's address bar, so typed, linked, searched and stored forms agree.

---

## 5. Five decisions worth explaining out loud

**1. Pages are stored raw and sanitised on read.**
`apps/api/src/common/html.ts` is one allowlist. No script, no frame, no form, no
event handler, no external asset, no `javascript:` URL. Text-level tags survive
(headings, lists, tables, quotes, code, emphasis) plus a few inline styles.
Surviving links are rewritten to canonical addresses (`data-address`); links that
are not addresses keep their words but lose their `href` and are marked dead.
Sanitising on read means a fix applies to every page ever stored, not just new
ones.

**2. Author HTML is rendered in an iframe with an opaque origin.**
`sandbox="allow-scripts"` and *no* `allow-same-origin`, under a per-render nonce
CSP (`default-src 'none'`, `script-src 'nonce-…'`, no network). The only script
that runs is a ~30-line bridge that reports the document height and hands link
clicks back to the browser chrome as addresses. A sanitiser bypass would still
land in a document that cannot reach this window's DOM, storage or cookies.
Three separate lines — sanitiser, sandbox, CSP — would each have to fail.

The cost, stated plainly: authors get words, structure and a few styles. No
JavaScript, no images, no remote fonts. That is the price of not trusting them.

**3. Back and forward are a per-person stack, not the browser's.**
Each entry keeps the page as it was shown (a snapshot), its scroll offset and
what kind of view it was (page, search, history, publish). Going back restores
that page and that scroll position; it does not re-fetch. The whole trail lives
in `localStorage` under `smallweb.session.v1.<personId>`, so a full page reload
restores the address, the stack and the scroll. Navigating from a back position
truncates the trail ahead — forward is genuinely lost. Sixty entries at most,
oldest trimmed first; history views are re-fetchable, so their rows are not kept
in storage.

**4. Visits are written by the browser, deliberately.**
Every arrival — typed, followed link, back, forward, history jump, search result,
publish, reload — posts a visit. A visit to an address that does not exist is
still a visit, with `outcome: "missing"`, so history is honest about the places
that were not there. Only arrivals count; hovering or typing records nothing.

**5. The seed is deterministic and idempotent.**
Ids are derived from natural keys (`md5("visit:nadia:3:13:paperlanes.zz")`), all
visits fall inside one fixed hour, people and pages are upserted, seeded visits
are replaced wholesale. Running it twice changes nothing; `--reset` is the only
destructive path. That is what makes this walkthrough repeatable, and what makes
"nineteen arrivals for Nadia" a fact rather than a hope.

---

## 6. The seed, by the numbers

Ten addresses, four authors with two pages each:

| address | title | author |
|---|---|---|
| `tidepool.zz` | The tide pool at the end of the lane | Maren Oyelaran |
| `saltmarsh.zz` | Notes from the salt marsh | Maren Oyelaran |
| `lantern.zz` | The lantern keeper's ledger | Ivo Brekke |
| `copperwire.zz` | Copper wire and glass insulators | Ivo Brekke |
| `rainfall.zz` | A small atlas of rain | Wren Sato |
| `paperlanes.zz` | Paper lanes, folded | Wren Sato |
| `mothbook.zz` | Moths of the north stair | Nadia Falk |
| `harbours.zz` | Harbour rules, plainly put | Nadia Falk |
| `tinners.zz` | The tinners' path | Tomas Vey |
| `bellwether.zz` | Bellwether's almanac, 1963 | Osric Bell |

Sixty-four visits across six people, all between 18:00 and 19:00 UTC on the seed
day: **Nadia 19, Ivo 12, Maren 10, Wren 9, Osric 8, Tomas 6**. Nadia's hour
touches all ten published pages and two dead addresses, and includes a history
jump, a search arrival and a repeat typed visit.

Five addresses in the seed were never published, on purpose: `northlight.zz`,
`wireless.zz`, `mothcatchers.zz`, `brinewell.zz`, `theoldpier.zz`. Pages link to
some of them, so the web contains real dead ends.

`bellwether.zz` ends with a section added by "the printer" that contains a live
`<script>`, an image with an `onerror`, and a `javascript:` link. Nothing happens
when you open it — that is the demonstration.

---

## 7. Recording

### Setup, five minutes before

```bash
npm run seed:reset      # pristine: 6 people, 10 sites, 64 visits
npm run dev             # leave this terminal visible for a moment at 0:00
```

- Browser window 1440×900 or larger, one tab, zoom at 100%.
- Everything below assumes you sign in as **Nadia Falk** — her seeded hour is the
  one you can scroll in the History view.
- Have this file open on a second screen or phone; do not read it on camera.
- Record the terminal once, at the start, so the seed counts are on film.

### The script — 4:45

Speak the quoted lines. The bracketed lines are actions, not narration.

**0:00 — What this is (20s)**

> This is a small web: ten pages at ten addresses, in MongoDB, and the browser you
> read them in. Next.js on the front, NestJS behind it, one workspace — one
> command to seed, one to run both sides. The pages are invented. The browser
> behaviour is the product.

**0:20 — The terminal (20s)**

[Show the terminal with `npm run dev` running, then the seed output in a second
tab or above it.]

> The seed is deterministic and idempotent: ids come from natural keys, every
> visit sits inside one fixed hour, so the same command always produces the same
> web. Six people, ten pages, sixty-four visits — Nadia alone accounts for
> nineteen of them.

**0:40 — The model (35s)**

> A site is an address, a title, the raw HTML its author wrote, an author and a
> revision. A visit is a row: person, address, title, outcome — found or missing —
> the method that got you there, and a time. History is a query over those rows,
> so it cannot drift from what happened.
>
> An address here is a hostname and nothing else. One canonicaliser decides what
> "the same address" means, so `https://Tidepool.zz/` typed into the bar,
> `tidepool.zz/` written in a link, and `tidepool.zz` in history all resolve to a
> single page.

**1:15 — A trail four deep (45s)**

[Sign in as Nadia Falk. Type `tidepool.zz`, Enter. Then click, in order:
`saltmarsh.zz`, `rainfall.zz`, `paperlanes.zz`. Four pages deep.]

> Each arrival writes a visit. Nothing is recorded for a page I merely hovered —
> only arrivals count, and the method field says how I arrived: typed, link, back,
> forward, history, search, publish, reload.
>
> The status bar shows the address, who wrote it, and how many times *I* have been
> here, which is a different number for every person.

**2:00 — Back, forward, and forward lost (50s)**

[Press Back twice → `saltmarsh.zz`. Point at the scroll position. Press Forward
twice → `paperlanes.zz`. Then click a new address from the page, then hover
Forward and show it greyed out.]

> Back is not a fresh fetch. The session keeps the page as it was shown, plus its
> scroll offset, so going back returns me to the page I left — at the place I left
> it — not a new copy of it. The trail ahead is intact, so forward works too.
>
> Now I navigate somewhere new from a back position. That truncates the trail
> ahead: forward is disabled. Forward can be lost, and here it actually is.

**2:50 — History (35s)**

[Open **History**. Scroll the list, then click one address from it, e.g.
`harbours.zz`.]

> This is Nadia's hour: nineteen seeded arrivals, plus everything I have just done
> on camera — a dead address, repeat visits, back steps, a history jump. Grouped by
> day, scrollable, and every row jumps back into the browser as a visit.
>
> Switch person with the name chip and it is a completely different trail, because
> history belongs to the person, not to the tab.

**3:25 — Search, and the way back to it (35s)**

[Press Back to leave History. Type `moth` in the address bar, Enter. Open the
third result. Press Back.]

> Search reads the prose, not just the titles: a Mongo text index with address and
> title weighted above body text, and a regex fallback so partial words still
> match. Results carry a snippet from around the first hit.
>
> Back returns to the results themselves — the query, the list, the scroll —
> because a search is an entry in the session like any page.

**4:00 — Publish (35s)**

[Open **Publish**. Address `mynewpage.zz`, a title, one paragraph with a link to
`tidepool.zz`. Submit. Follow the link on the new page. Then submit the same
address again and show the 409 message.]

> Publishing is an address and a page of HTML, authored by whoever is browsing. The
> address is canonicalised on the way in, the title is required, and an address
> that already exists is a conflict — not a silent overwrite. Publishing is an
> arrival too, so it lands in history with its own method.

**4:35 — Nowhere, and containment (50s)**

[Type `brinewell.zz`. Then open `bellwether.zz` and scroll to "Housekeeping,
added by the printer".]

> Nothing was ever published at `brinewell.zz`. It is still a visit, with outcome
> "missing", so history is honest about the places that were not there. I can go
> back, search for it, or publish something at it.
>
> This page contains a script, an image with an `onerror`, and a `javascript:` link
> — on purpose. Author HTML is stored raw but sanitised on every read through a
> single allowlist: no script, no frame, no form, no event handler, no external
> asset; surviving links are rewritten to addresses, and links that are not
> addresses lose their href and are struck through.
>
> It is then rendered in an iframe with `sandbox="allow-scripts"` and **no**
> `allow-same-origin`, under a nonce CSP. The frame has an opaque origin and cannot
> touch the browser's DOM, storage or cookies, even if the sanitiser missed
> something. The cost: authors get words, structure and a few inline styles — no
> JavaScript, no images, no remote fonts.

**5:05 — What is left out (20s)**

> No accounts — a name from a list, as the brief asked. No tabs, bookmarks,
> downloads, images, or real network. Sites are single pages; publishing to a taken
> address is refused rather than versioned, and revisions exist in the schema but
> there is no edit flow in the UI.

That lands at about 5:10 spoken slowly. If you need to trim, drop the terminal beat
(0:20) and the second publish in 4:00 — the required demonstrations are the trail,
back/forward, search and its return, publish, and an address that leads nowhere.

### What the recording must contain

| Requirement | Where in this script |
|---|---|
| A trail at least four deep | 1:15 |
| Back and forward across it | 2:00 |
| Forward lost after navigating from a back position | 2:00 |
| History, per person, scrollable, jumpable | 2:50 |
| Search, and back returning to the results | 3:25 |
| Publish, and a taken address refused | 4:00 |
| An address that leads nowhere | 4:35 |
| Containment of untrusted HTML | 4:35 |
| Commands for both sides and the seed | 0:20 and README |

---

## 8. Where the code is

```
apps/api/src/common/address.ts      what "the same address" means
apps/api/src/common/html.ts         the sanitiser: the containment line
apps/api/src/sites/sites.service.ts page lookup, search, publish (409 on conflict)
apps/api/src/visits/visits.service.ts  write a visit, read a history
apps/api/src/people/people.service.ts  people plus visit/site counts
apps/api/src/seed/                  seed.ts, content/{people,sites,trails}.ts
apps/web/src/components/BrowserApp.tsx  session stack, navigation, restore
apps/web/src/components/PageFrame.tsx   iframe, CSP, bridge, measurement
apps/web/src/components/Toolbar.tsx     address bar, suggestions, views
apps/web/src/lib/session.ts             per-person stack in localStorage
```

API surface, all under `/api`:

| method | path | purpose |
|---|---|---|
| GET | `/health` | `{ ok, db }` |
| GET | `/people` | people with visit and page counts |
| GET | `/sites` | address book for suggestions |
| GET | `/sites/:address` | one page, sanitised; `found: false` or `invalid: true` |
| POST | `/sites` | publish; 400 with field errors, 409 on a taken address |
| GET | `/search?q=` | text index plus regex fallback, with snippets |
| POST | `/visits` | record an arrival |
| GET | `/history?personId=&limit=` | that person's visits and totals |

---

## 9. Honest limits

- No authentication. Picking a name is the whole of identity; anyone can be anyone.
  The brief asked for a name from a list, and this is exactly that.
- No tabs, bookmarks, downloads, images, external fonts or real network.
- A site is one page. Publishing to a taken address is refused; revisions exist in
  the schema and the seed sets them, but there is no edit UI.
- Sessions are per browser, in `localStorage`: a different browser is a different
  back/forward stack, though history on the server is the same.
- Styling was verified through geometry and computed styles; it has not been
  reviewed pixel by pixel on a phone.

---

## 10. Submission checklist

- [ ] Public GitHub repository, with this history as it stands: a sequence of
      coherent commits, not one import of the finished tree.
- [ ] Recording saved as `docs/recording.mp4`, linked from the README's
      **Recording** section.
- [ ] The README's **Run it** section is the canonical answer to "the commands
      needed to run both sides and seed the data".
- [ ] A fresh clone works: `npm install`, `npm run seed`, `npm run dev`.
      Nothing in the repository depends on a file that is git-ignored.
