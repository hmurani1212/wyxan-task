import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Person, PersonSchema } from './people/person.schema';
import { Site, SiteSchema } from './sites/site.schema';
import { Visit, VisitSchema } from './visits/visit.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Person.name, schema: PersonSchema },
      { name: Site.name, schema: SiteSchema },
      { name: Visit.name, schema: VisitSchema },
    ]),
  ],
  exports: [MongooseModule],
})
export class DatabaseModule {}
