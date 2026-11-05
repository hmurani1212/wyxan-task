import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { canonicalizeAddress } from '../common/address';
import { Person, PersonDocument } from '../people/person.schema';
import { CreateVisitDto } from './dto/create-visit.dto';
import { Visit, VisitDocument } from './visit.schema';

export interface VisitRecord {
  id: string;
  address: string;
  title: string;
  outcome: 'found' | 'missing';
  method: string;
  at: string;
}

export interface HistoryStats {
  total: number;
  addresses: number;
  firstVisitAt: string | null;
  lastVisitAt: string | null;
}

export interface HistoryResponse {
  visits: VisitRecord[];
  stats: HistoryStats;
}

@Injectable()
export class VisitsService {
  constructor(
    @InjectModel(Visit.name) private readonly visits: Model<VisitDocument>,
    @InjectModel(Person.name) private readonly people: Model<PersonDocument>,
  ) {}

  async record(dto: CreateVisitDto): Promise<VisitRecord> {
    const person = await this.people.findById(dto.personId).select('_id').lean();
    if (!person) {
      throw new BadRequestException({
        message: 'Unknown person.',
        errors: { personId: 'Unknown person.' },
      });
    }

    const address = canonicalizeAddress(dto.address);
    const visit = await this.visits.create({
      personId: person._id,
      address,
      title: (dto.title ?? '').slice(0, 160),
      outcome: dto.outcome,
      method: dto.method,
      at: new Date(),
      seeded: false,
    });

    return {
      id: String(visit._id),
      address: visit.address,
      title: visit.title,
      outcome: visit.outcome,
      method: visit.method,
      at: visit.at.toISOString(),
    };
  }

  async history(personId: string, limit = 200): Promise<HistoryResponse> {
    if (!Types.ObjectId.isValid(personId)) {
      throw new BadRequestException({
        message: 'Unknown person.',
        errors: { personId: 'Unknown person.' },
      });
    }

    const person = await this.people.findById(personId).select('_id').lean();
    if (!person) {
      throw new BadRequestException({
        message: 'Unknown person.',
        errors: { personId: 'Unknown person.' },
      });
    }

    const [visits, stats] = await Promise.all([
      this.visits
        .find({ personId: person._id })
        .sort({ at: -1, _id: -1 })
        .limit(Math.min(Math.max(limit, 1), 500))
        .lean(),
      this.visits.aggregate<{ total: number; addresses: string[]; first: Date; last: Date }>([
        { $match: { personId: person._id } },
        {
          $group: {
            _id: null,
            total: { $sum: 1 },
            addresses: { $addToSet: '$address' },
            first: { $min: '$at' },
            last: { $max: '$at' },
          },
        },
      ]),
    ]);

    const summary = stats[0];
    return {
      visits: visits.map((visit) => ({
        id: String(visit._id),
        address: visit.address,
        title: visit.title,
        outcome: visit.outcome,
        method: visit.method,
        at: new Date(visit.at).toISOString(),
      })),
      stats: {
        total: summary?.total ?? 0,
        addresses: summary?.addresses?.length ?? 0,
        firstVisitAt: summary?.first ? new Date(summary.first).toISOString() : null,
        lastVisitAt: summary?.last ? new Date(summary.last).toISOString() : null,
      },
    };
  }
}
