import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type PersonDocument = HydratedDocument<Person>;

@Schema({ collection: 'people', timestamps: true })
export class Person {
  @Prop({ required: true, unique: true, index: true })
  slug!: string;

  @Prop({ required: true })
  name!: string;

  @Prop({ default: '' })
  bio!: string;

  @Prop({ default: false })
  seeded!: boolean;
}

export const PersonSchema = SchemaFactory.createForClass(Person);
