import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type SiteDocument = HydratedDocument<Site>;

@Schema({ collection: 'sites', timestamps: true })
export class Site {
  /** Canonical address: lowercase hostname, no scheme, path, port or trailing dot. */
  @Prop({ required: true, unique: true, index: true })
  address!: string;

  @Prop({ required: true })
  title!: string;

  /** Exactly what the author wrote. Sanitised at read time, never before. */
  @Prop({ required: true })
  html!: string;

  /** Sanitised plain text, kept only so search reads prose rather than markup. */
  @Prop({ required: true })
  text!: string;

  @Prop({ type: Types.ObjectId, ref: 'Person', required: true, index: true })
  authorId!: Types.ObjectId;

  @Prop({ required: true, default: () => new Date() })
  publishedAt!: Date;

  @Prop({ required: true, default: 1 })
  revision!: number;

  @Prop({ default: false })
  seeded!: boolean;
}

export const SiteSchema = SchemaFactory.createForClass(Site);

SiteSchema.index(
  { title: 'text', address: 'text', text: 'text' },
  {
    name: 'site_fulltext',
    weights: { address: 8, title: 6, text: 1 },
  },
);
