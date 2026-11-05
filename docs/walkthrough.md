# Walkthrough — narration script

Aim for 4–5 minutes. The recording must show: a trail four deep, back and forward
across it, a search and a return to its results, a publish, an address that leads
nowhere. Say the model, how back/forward hold, how the HTML is contained, and what
was left out.

Before recording: `npm run seed:reset` for a clean, fixed history, then
`npm run dev`. Pick **Nadia Falk** on camera, so her seeded hour is there to scroll.

---

**0:00 — What this is (20s)**

> This is a small web: ten pages at ten addresses, in MongoDB, and the browser you
> read them in. Next.js on the front, NestJS behind it, one workspace, one command
> to seed and one to run both. The pages are invented; the browser behaviour is the
> product.

**0:20 — The model (35s)**

> A site is an address, a title, raw author HTML, an author and a revision. An
> address is a hostname and nothing else — one canonicaliser decides what "the same
> address" means, so `https://Tidepool.zz/` typed, `tidepool.zz/` written in a link,
> and `tidepool.zz` in history all resolve to one page.
> A visit is a row: person, address, title, outcome — found or missing — the method
> that got you there, and a time. History is a query over visits, not a separate
> list that can drift out of step.

**0:55 — A trail four deep (50s)**

Type `tidepool.zz`. Follow `saltmarsh.zz`, then `rainfall.zz`, then `paperlanes.zz`
— four pages deep. Point at the status bar: it shows the address, the author, and
how many times *you* have been here.

> Each arrival writes a visit. Nothing is recorded for a page I merely hovered;
> only arrivals count, and the method says how I arrived.

**1:45 — Back, forward, and forward lost (55s)**

Press back twice — you are at `saltmarsh.zz`. Look at the restored scroll position.

> Back is not a fresh fetch. The session keeps the page as it was shown, plus the
> scroll offset, so going back returns you to the page you left, not a new copy of
> it. The forward trail is intact — watch.

Press forward twice — back to `paperlanes.zz`. Now click a link from here (a new
address), then press forward again: disabled.

> Navigating from a back position truncates the trail ahead. That is what "forward
> can be lost" means, and it is deliberate.

**2:40 — History (35s)**

Open History. Scroll the list; jump into an address from it (e.g. `harbours.zz`).

> This is Nadia's hour: nineteen seeded arrivals, plus everything I have done on
> camera — a dead address, repeat visits, back steps and history jumps. It is
> scrollable, grouped by day, and every row jumps back into the browser. Switch
> person from the name chip and it is a different trail, because history belongs to
> the person, not the tab. The seed ships sixty-four visits across the six people,
> all inside one hour.

**3:15 — Search, and a return to its results (40s)**

Search `moth`. Open the third result. Press back.

> Search reads the prose, not just titles: Mongo's text index with address and
> title weighted above body text, and a regex fallback for partial words. Back
> returns to the results themselves — the query, the list, the scroll — because a
> search is an entry in the session like any page.

**3:55 — Publish (40s)**

Publish `mynewpage.zz` with a paragraph and a link to `tidepool.zz`. Submit. The new
page opens at its address; follow the link.

> Publishing is an address and a page of HTML, authored by whoever is browsing. The
> address is canonicalised on the way in, the title is required, and an address that
> exists is a 409, not a silent overwrite. This arrival is a visit too.

**4:35 — Nowhere, and containment (35s)**

Type `brinewell.zz`.

> Nothing was ever published here. It is still a visit — with outcome "missing" — so
> history is honest about the places that were not there. From here I can go back,
> search for it, or publish something at it.

Open `bellwether.zz` and scroll to the housekeeping section.

> That page contains a script, an image with an `onerror`, and a `javascript:` link —
> on purpose. Author HTML is stored raw but sanitised on every read through one
> allowlist: no script, no frame, no form, no event handler, no external asset;
> surviving links are rewritten to addresses. It is then rendered in an iframe with
> `sandbox="allow-scripts"` and **no** `allow-same-origin`, under a nonce CSP, so
> the frame has an opaque origin and cannot touch this window even if the sanitiser
> missed something. The cost: authors get words, structure and a few inline styles —
> no JavaScript, no images, no remote fonts.

**5:10 — What is left out (15s)**

> No accounts — a name from a list, as the brief asked. No tabs, bookmarks,
> downloads, images, or real network. Sites are single pages; publishing a taken
> address is refused rather than versioned. Revisions exist in the schema and the
> seed sets them, but there is no edit flow in the UI. The seed is deterministic and
> idempotent, so this exact walk can be walked again.
