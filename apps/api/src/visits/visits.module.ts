import { Module } from '@nestjs/common';
import { DatabaseModule } from '../database.module';
import { HistoryController, VisitsController } from './visits.controller';
import { VisitsService } from './visits.service';

@Module({
  imports: [DatabaseModule],
  controllers: [VisitsController, HistoryController],
  providers: [VisitsService],
  exports: [VisitsService],
})
export class VisitsModule {}
