import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Person, PersonDocument } from './person.schema';
import { Site } from '../sites/site.schema';
import { Visit } from '../visits/visit.schema';

export interface PersonSummary {
  id: string;
  slug: string;
  name: string;
  bio: string;
  visits: number;
  sites: number;
  lastVisitAt: string | null;
}

@Injectable()
export class PeopleService {
  constructor(
    @InjectModel(Person.name) private readonly people: Model<PersonDocument>,
    @InjectModel(Visit.name) private readonly visits: Model<Visit>,
    @InjectModel(Site.name) private readonly sites: Model<Site>,
  ) {}

  async list(): Promise<PersonSummary[]> {
    const [people, visitStats, siteStats] = await Promise.all([
      this.people.find().sort({ name: 1 }).lean(),
      this.visits.aggregate<{ _id: Types.ObjectId; visits: number; lastVisitAt: Date }>([
        { $group: { _id: '$personId', visits: { $sum: 1 }, lastVisitAt: { $max: '$at' } } },
      ]),
      this.sites.aggregate<{ _id: Types.ObjectId; sites: number }>([
        { $group: { _id: '$authorId', sites: { $sum: 1 } } },
      ]),
    ]);

    const byVisits = new Map(visitStats.map((row) => [String(row._id), row]));
    const bySites = new Map(siteStats.map((row) => [String(row._id), row.sites]));

    return people.map((person) => {
      const stats = byVisits.get(String(person._id));
      return {
        id: String(person._id),
        slug: person.slug,
        name: person.name,
        bio: person.bio ?? '',
        visits: stats?.visits ?? 0,
        sites: bySites.get(String(person._id)) ?? 0,
        lastVisitAt: stats?.lastVisitAt ? new Date(stats.lastVisitAt).toISOString() : null,
      };
    });
  }
}
