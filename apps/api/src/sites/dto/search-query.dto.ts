import { IsOptional, IsString, Length } from 'class-validator';

export class SearchQueryDto {
  @IsString()
  @Length(1, 120)
  q!: string;

  @IsOptional()
  @IsString()
  personId?: string;
}
