import { BadRequestException, ConflictException, Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { canonicalizeAddress, parseAddress } from '../common/address';
import { makeSnippet, renderAuthorHtml } from '../common/html';
import { Person, PersonDocument } from '../people/person.schema';
import { Visit, VisitDocument } from '../visits/visit.schema';
import { PublishSiteDto } from './dto/publish-site.dto';
import { Site, SiteDocument } from './site.schema';

export interface SiteAuthor {
  id: string;
  name: string;
}

export interface SiteStats {
  visits: number;
  firstVisitAt: string | null;
  lastVisitAt: string | null;
}

export interface SitePage {
  found: boolean;
  address: string;
  invalid?: boolean;
  title?: string;
  html?: string;
  author?: SiteAuthor;
  publishedAt?: string;
  revision?: number;
  stats?: SiteStats;
}

export interface SearchResult {
  address: string;
  title: string;
  snippet: string;
  author: string;
  publishedAt: string;
}

export interface SearchResponse {
  query: string;
  results: SearchResult[];
  total: number;
  tookMs: number;
}

const SEARCH_LIMIT = 30;
const escapeRegex = (value: string) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

@Injectable()
export class SitesService {
  private readonly logger = new Logger(SitesService.name);

  constructor(
    @InjectModel(Site.name) private readonly sites: Model<SiteDocument>,
    @InjectModel(Person.name) private readonly people: Model<PersonDocument>,
    @InjectModel(Visit.name) private readonly visits: Model<VisitDocument>,
  ) {}

  /** Address book for the address bar: every page that exists, nothing more. */
  async list(): Promise<Array<{ address: string; title: string }>> {
    const rows = await this.sites.find().sort({ address: 1 }).select('address title').lean();
    return rows.map((row) => ({ address: row.address, title: row.title }));
  }

  /**
   * One page, sanitised on the way out. A missing page is not an API failure:
   * the browser has a state for it, so the response describes what was asked
   * for either way.
   */
  async findByAddress(input: string, personId?: string): Promise<SitePage> {
    const { address, valid } = parseAddress(input);
    if (!valid) {
      return { found: false, address: address || String(input ?? ''), invalid: true };
    }

    const site = await this.sites.findOne({ address }).lean();
    if (!site) return { found: false, address };

    const { html } = renderAuthorHtml(site.html);
    const author = await this.people.findById(site.authorId).select('name').lean();

    let stats: SiteStats | undefined;
    if (personId && Types.ObjectId.isValid(personId)) {
      const [row] = await this.visits.aggregate<{ visits: number; first: Date; last: Date }>([
        { $match: { personId: new Types.ObjectId(personId), address } },
        { $group: { _id: null, visits: { $sum: 1 }, first: { $min: '$at' }, last: { $max: '$at' } } },
      ]);
      stats = {
        visits: row?.visits ?? 0,
        firstVisitAt: row?.first ? new Date(row.first).toISOString() : null,
        lastVisitAt: row?.last ? new Date(row.last).toISOString() : null,
      };
    }

    return {
      found: true,
      address: site.address,
      title: site.title,
      html,
      author: { id: String(site.authorId), name: author?.name ?? 'Unknown' },
      publishedAt: new Date(site.publishedAt).toISOString(),
      revision: site.revision,
      stats,
    };
  }

  async publish(dto: PublishSiteDto): Promise<SitePage> {
    const { address, valid } = parseAddress(dto.address);
    if (!valid) {
      throw new BadRequestException({
        message: 'That is not an address. Use a hostname such as tidepool.zz.',
        errors: { address: 'Use a hostname such as tidepool.zz.' },
      });
    }

    const title = dto.title.trim();
    if (!title) {
      throw new BadRequestException({
        message: 'A page needs a title.',
        errors: { title: 'A page needs a title.' },
      });
    }

    const person = await this.people.findById(dto.personId).select('_id').lean();
    if (!person) {
      throw new BadRequestException({
        message: 'Unknown publisher.',
        errors: { personId: 'Unknown publisher.' },
      });
    }

    const { text } = renderAuthorHtml(dto.html);
    if (!text) {
      throw new BadRequestException({
        message: 'After removing markup, that page has no readable text.',
        errors: { html: 'Write something readable — scripts and styles alone are stripped.' },
      });
    }

    const taken = await this.sites.exists({ address });
    if (taken) {
      throw new ConflictException({
        message: `${address} is already taken.`,
        errors: { address: `${address} is already taken.` },
      });
    }

    try {
      await this.sites.create({
        address,
        title,
        html: dto.html,
        text,
        authorId: person._id,
        publishedAt: new Date(),
        revision: 1,
        seeded: false,
      });
    } catch (error) {
      if ((error as { code?: number }).code === 11000) {
        throw new ConflictException({
          message: `${address} is already taken.`,
          errors: { address: `${address} is already taken.` },
        });
      }
      throw error;
    }

    this.logger.log(`published ${address} (${title})`);
    return this.findByAddress(address, dto.personId);
  }

  /**
   * Full text across every page, weighted so an address or title wins over a
   * passing mention in prose. Mongo's text index is used when it can match;
   * a regex pass catches partial words the stemmer refuses.
   */
  async search(query: string, personId?: string): Promise<SearchResponse> {
    const q = (query ?? '').trim();
    const started = Date.now();
    if (!q) return { query: q, results: [], total: 0, tookMs: 0 };

    let rows: Array<Site & { score?: number }> = [];

    try {
      rows = await this.sites
        .find({ $text: { $search: q } }, { score: { $meta: 'textScore' } })
        .sort({ score: { $meta: 'textScore' } })
        .limit(SEARCH_LIMIT)
        .lean();
    } catch (error) {
      this.logger.warn(`text search failed for "${q}": ${(error as Error).message}`);
    }

    if (rows.length === 0) {
      const terms = q
        .split(/\s+/)
        .filter(Boolean)
        .slice(0, 5)
        .map((term) => new RegExp(escapeRegex(term), 'i'));
      rows = await this.sites
        .find({
          $and: terms.map((term) => ({
            $or: [{ address: term }, { title: term }, { text: term }],
          })),
        })
        .sort({ address: 1 })
        .limit(SEARCH_LIMIT)
        .lean();
    }

    const authorIds = [...new Set(rows.map((row) => String(row.authorId)))];
    const authors = await this.people
      .find({ _id: { $in: authorIds } })
      .select('name')
      .lean();
    const names = new Map(authors.map((author) => [String(author._id), author.name]));

    const results = rows.map((row) => ({
      address: row.address,
      title: row.title,
      snippet: makeSnippet(row.text, q),
      author: names.get(String(row.authorId)) ?? 'Unknown',
      publishedAt: new Date(row.publishedAt).toISOString(),
    }));

    return { query: q, results, total: results.length, tookMs: Date.now() - started };
  }

  /** Used by the seed only. */
  async addressExists(address: string): Promise<boolean> {
    return Boolean(await this.sites.exists({ address: canonicalizeAddress(address) }));
  }
}
