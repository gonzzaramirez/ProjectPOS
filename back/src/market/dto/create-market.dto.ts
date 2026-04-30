import { IsString, IsOptional, MaxLength, IsObject } from 'class-validator';

export class CreateMarketDto {
  @IsString()
  @MaxLength(150)
  name: string;

  @IsString()
  @MaxLength(100)
  slug: string;

  @IsOptional()
  @IsObject()
  flags?: Record<string, unknown>;
}
