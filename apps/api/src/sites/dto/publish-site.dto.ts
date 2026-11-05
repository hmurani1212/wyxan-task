import { Transform } from 'class-transformer';
import { IsMongoId, IsString, Length } from 'class-validator';

export class PublishSiteDto {
  @IsString()
  @Length(1, 253)
  address!: string;

  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  @IsString()
  @Length(1, 140)
  title!: string;

  @IsString()
  @Length(1, 100_000)
  html!: string;

  @IsMongoId()
  personId!: string;
}
