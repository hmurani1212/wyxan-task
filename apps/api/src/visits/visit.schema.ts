import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type VisitDocument = HydratedDocument<Visit>;

export const VISIT_METHODS = [
  'typed',
  'link',
  'back',
  'forward',
  'history',
  'search',
  'publish',
  'reload',
] as const;

export type VisitMethod = (typeof VISIT_METHODS)[number];

export const VISIT_OUTCOMES = ['found', 'missing'] as const;

export type VisitOutcome = (typeof VISIT_OUTCOMES)[number];

@Schema({ collection: 'visits', timestamps: true })
export class Visit {
  @Prop({ type: Types.ObjectId, ref: 'Person', required: true, index: true })
  personId!: Types.ObjectId;

  @Prop({ required: true })
  address!: string;

  @Prop({ default: '' })
  title!: string;

  @Prop({ type: String, required: true, enum: VISIT_OUTCOMES })
  outcome!: VisitOutcome;

  @Prop({ type: String, required: true, enum: VISIT_METHODS })
  method!: VisitMethod;

  @Prop({ required: true, index: true })
  at!: Date;

  @Prop({ default: false })
  seeded!: boolean;
}

export const VisitSchema = SchemaFactory.createForClass(Visit);

VisitSchema.index({ personId: 1, at: -1 });
VisitSchema.index({ personId: 1, address: 1, at: -1 });
