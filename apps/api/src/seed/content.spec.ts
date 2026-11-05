import { isValidAddress } from '../common/address';
import { renderAuthorHtml } from '../common/html';
import { PEOPLE } from './content/people';
import { SITES } from './content/sites';
import { TRAILS } from './content/trails';

const addresses = SITES.map((site) => site.address);
const slugs = new Set(PEOPLE.map((person) => person.slug));
const hrefs = (html: string) => [...html.matchAll(/href="([^"]+)"/g)].map((match) => match[1]);

describe('seed sites', () => {
  it('has ten pages at ten valid, unique addresses', () => {
    expect(SITES).toHaveLength(10);
    expect(new Set(addresses).size).toBe(10);
    for (const address of addresses) expect(isValidAddress(address)).toBe(true);
  });

  it('credits every author to a seeded person', () => {
    for (const site of SITES) expect(slugs.has(site.author)).toBe(true);
    const perAuthor = new Map<string, number>();
    for (const site of SITES) perAuthor.set(site.author, (perAuthor.get(site.author) ?? 0) + 1);
    expect([...perAuthor.values()].filter((count) => count > 1).length).toBeGreaterThanOrEqual(2);
  });

  it('gives every page real prose and several links to wander through', () => {
    for (const site of SITES) {
      const { text } = renderAuthorHtml(site.html);
      expect(text.split(/\s+/).length).toBeGreaterThan(120);
      const links = hrefs(site.html).filter(
        (href) => !href.startsWith('#') && !href.startsWith('javascript:'),
      );
      expect(links.length).toBeGreaterThanOrEqual(2);
      for (const href of links) expect(isValidAddress(href)).toBe(true);
    }
  });

  it('contains links to addresses that were never published', () => {
    const dead = SITES.flatMap((site) => hrefs(site.html)).filter(
      (href) => isValidAddress(href) && !addresses.includes(href),
    );
    expect(new Set(dead).size).toBeGreaterThanOrEqual(3);
  });

  it('links enough that every site is reachable from the others', () => {
    const graph = new Map(
      SITES.map((site) => [
        site.address,
        hrefs(site.html).filter((href) => addresses.includes(href)),
      ]),
    );
    for (const start of addresses) {
      const seen = new Set([start]);
      const queue = [start];
      while (queue.length > 0) {
        const current = queue.shift() as string;
        for (const next of graph.get(current) ?? []) {
          if (!seen.has(next)) {
            seen.add(next);
            queue.push(next);
          }
        }
      }
      expect(seen.size).toBe(addresses.length);
    }
  });

  it('contains at least one piece of hostile markup to prove containment', () => {
    const hostile = SITES.flatMap((site) => [site.html]).join('\n');
    expect(hostile).toMatch(/onerror|onclick|javascript:|<script/i);
  });
});

describe('seed trails', () => {
  const methods = new Set([
    'typed',
    'link',
    'back',
    'forward',
    'history',
    'search',
    'publish',
    'reload',
  ]);

  it('belongs to known people and stays inside one hour', () => {
    for (const trail of TRAILS) {
      expect(slugs.has(trail.person)).toBe(true);
      expect(trail.steps.length).toBeGreaterThan(3);
      for (const step of trail.steps) {
        expect(isValidAddress(step.address)).toBe(true);
        expect(methods.has(step.method)).toBe(true);
        expect(step.minute).toBeGreaterThanOrEqual(0);
        expect(step.minute).toBeLessThan(60);
      }
    }
  });

  it('has repeat visits, a long trail, and someone who went nearly everywhere', () => {
    const perPerson = TRAILS.map((trail) => new Set(trail.steps.map((step) => step.address)));
    expect(perPerson.some((visited) => visited.size >= 9)).toBe(true);

    const allSteps = TRAILS.flatMap((trail) => trail.steps);
    const visitsPerAddress = new Map<string, number>();
    for (const step of allSteps) {
      visitsPerAddress.set(step.address, (visitsPerAddress.get(step.address) ?? 0) + 1);
    }
    expect([...visitsPerAddress.values()].some((count) => count > 3)).toBe(true);
    expect(TRAILS.length).toBeGreaterThanOrEqual(4);
    expect(allSteps.length).toBeGreaterThanOrEqual(40);
  });

  it('walks backwards and forwards, and records arrivals that led nowhere', () => {
    const allSteps = TRAILS.flatMap((trail) => trail.steps);
    expect(allSteps.some((step) => step.method === 'back')).toBe(true);
    expect(allSteps.some((step) => step.method === 'forward')).toBe(true);
    expect(allSteps.some((step) => !addresses.includes(step.address))).toBe(true);
  });
});
