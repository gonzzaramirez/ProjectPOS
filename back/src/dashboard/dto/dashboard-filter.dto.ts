import { Type } from 'class-transformer';
import { IsInt, IsOptional, IsString } from 'class-validator';

export class DashboardFilterDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  id_point?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  id_market?: number;

  @IsOptional()
  @IsString()
  date_from?: string;

  @IsOptional()
  @IsString()
  date_to?: string;
}
