import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { CreateVisitDto } from './dto/create-visit.dto';
import { HistoryQueryDto } from './dto/history-query.dto';
import { VisitsService } from './visits.service';

@Controller('visits')
export class VisitsController {
  constructor(private readonly visits: VisitsService) {}

  @Post()
  record(@Body() dto: CreateVisitDto) {
    return this.visits.record(dto);
  }
}

@Controller('history')
export class HistoryController {
  constructor(private readonly visits: VisitsService) {}

  @Get()
  history(@Query() query: HistoryQueryDto) {
    return this.visits.history(query.personId, query.limit ?? 200);
  }
}
