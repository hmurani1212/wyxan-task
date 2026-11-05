import { IsIn, IsMongoId, IsOptional, IsString, Length } from 'class-validator';
import { VISIT_METHODS, VISIT_OUTCOMES, VisitMethod, VisitOutcome } from '../visit.schema';

export class CreateVisitDto {
  @IsMongoId()
  personId!: string;

  @IsString()
  @Length(1, 253)
  address!: string;

  @IsOptional()
  @IsString()
  @Length(0, 160)
  title?: string;

  @IsIn(VISIT_METHODS as unknown as string[])
  method!: VisitMethod;

  @IsIn(VISIT_OUTCOMES as unknown as string[])
  outcome!: VisitOutcome;
}
