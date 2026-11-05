import '../config/env';
import 'reflect-metadata';
import { createHash } from 'crypto';
import mongoose, { Model, Types } from 'mongoose';
import { renderAuthorHtml } from '../common/html';
import { Person, PersonSchema } from '../people/person.schema';
import { Site, SiteSchema } from '../sites/site.schema';
import { Visit, VisitSchema } from '../visits/visit.schema';
import { PEOPLE } from './content/people';
import { SITES } from './content/sites';
import { TRAILS } from './content/trails';

/**
 * Seed the small web.
 *
 * Deterministic: every person, site and visit has an id derived from its
 * natural key, every visit has a fixed timestamp, and the same command always
 * produces the same web at the same addresses.
 *
 * Idempotent: people and sites are upserted by their natural key, and seeded
 * visits are replaced rather than appended, so running it twice does not
 * double anything. `--reset` additionally removes every non-seeded site and
 * visit, which is the only destructive path.
 */
const MONGODB_URI = process.env.MONGODB_URI ?? 'mongodb://127.0.0.1:27017/smallweb';
const SEED_START = new Date(process.env.SEED_TIME ?? '2026-10-27T18:00:00.000Z');
const RESET = process.argv.includes('--reset');

function seedId(key: string): Types.ObjectId {
  return new Types.ObjectId(createHash('md5').update(key).digest('hex').slice(0, 24));
}

async function main() {
  const connection = await mongoose
    .createConnection(MONGODB_URI, { serverSelectionTimeoutMS: 8000 })
    .asPromise();

  const PersonModel: Model<Person> = connection.model(Person.name, PersonSchema);
  const SiteModel: Model<Site> = connection.model(Site.name, SiteSchema);
  const VisitModel: Model<Visit> = connection.model(Visit.name, VisitSchema);

  if (RESET) {
    const [people, sites, visits] = await Promise.all([
      PersonModel.deleteMany({}),
      SiteModel.deleteMany({}),
      VisitModel.deleteMany({}),
    ]);
    console.log(
      `--reset: removed ${people.deletedCount} people, ${sites.deletedCount} sites, ${visits.deletedCount} visits`,
    );
  }

  // People first: authors are referenced by slug so the content stays readable.
  for (const person of PEOPLE) {
    await PersonModel.updateOne(
      { slug: person.slug },
      {
        $set: {
          slug: person.slug,
          name: person.name,
          bio: person.bio,
          seeded: true,
          updatedAt: SEED_START,
        },
        $setOnInsert: { _id: seedId(`person:${person.slug}`), createdAt: SEED_START },
      },
      { upsert: true, timestamps: false, setDefaultsOnInsert: true },
    );
  }

  const people = await PersonModel.find().lean();
  const peopleBySlug = new Map(people.map((person) => [person.slug, person]));

  // Sites: the raw author HTML is stored; sanitising happens on every read.
  const titles = new Map<string, string>();
  for (const site of SITES) {
    const author = peopleBySlug.get(site.author);
    if (!author) throw new Error(`Seed site ${site.address} has unknown author ${site.author}`);

    const { text } = renderAuthorHtml(site.html);
    if (!text) throw new Error(`Seed site ${site.address} has no readable text`);

    const publishedAt = new Date(site.publishedAt);
    await SiteModel.updateOne(
      { address: site.address },
      {
        $set: {
          address: site.address,
          title: site.title,
          html: site.html,
          text,
          authorId: author._id,
          publishedAt,
          revision: 1,
          seeded: true,
          updatedAt: publishedAt,
        },
        $setOnInsert: { _id: seedId(`site:${site.address}`), createdAt: publishedAt },
      },
      { upsert: true, timestamps: false, setDefaultsOnInsert: true },
    );
    titles.set(site.address, site.title);
  }

  // Visits: seeded visits are a snapshot, so replace them wholesale.
  const replaced = await VisitModel.deleteMany({ seeded: true });
  const visits: Array<Record<string, unknown>> = [];
  for (const trail of TRAILS) {
    const person = peopleBySlug.get(trail.person);
    if (!person) throw new Error(`Seed trail has unknown person ${trail.person}`);

    trail.steps.forEach((step, index) => {
      const at = new Date(SEED_START.getTime() + step.minute * 60_000);
      visits.push({
        _id: seedId(`visit:${trail.person}:${index}:${step.minute}:${step.address}`),
        personId: person._id,
        address: step.address,
        title: titles.get(step.address) ?? '',
        outcome: titles.has(step.address) ? 'found' : 'missing',
        method: step.method,
        at,
        seeded: true,
        createdAt: at,
        updatedAt: at,
      });
    });
  }
  if (visits.length > 0) {
    await VisitModel.collection.insertMany(visits, { ordered: true });
  }

  await Promise.all([PersonModel.syncIndexes(), SiteModel.syncIndexes(), VisitModel.syncIndexes()]);

  const [personCount, siteCount, visitCount, addressCount] = await Promise.all([
    PersonModel.countDocuments(),
    SiteModel.countDocuments(),
    VisitModel.countDocuments(),
    SiteModel.countDocuments({ seeded: true }),
  ]);

  console.log(
    `seeded ${personCount} people, ${siteCount} sites (${addressCount} seeded), ${visitCount} visits`,
  );
  console.log(
    `seeded visits replaced: ${replaced.deletedCount}; window: ${SEED_START.toISOString()} + 60 minutes`,
  );
  console.log(`addresses: ${SITES.map((site) => site.address).join(', ')}`);
  console.log('sign in as any of: ' + PEOPLE.map((person) => person.name).join(', '));

  await connection.close();
}

main().catch(async (error) => {
  console.error('seed failed:', error);
  await mongoose.disconnect().catch(() => undefined);
  process.exit(1);
});
