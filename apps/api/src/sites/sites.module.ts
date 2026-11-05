import { Module } from '@nestjs/common';
import { DatabaseModule } from '../database.module';
import { SearchController, SitesController } from './sites.controller';
import { SitesService } from './sites.service';

@Module({
  imports: [DatabaseModule],
  controllers: [SitesController, SearchController],
  providers: [SitesService],
  exports: [SitesService],
})
export class SitesModule {}
