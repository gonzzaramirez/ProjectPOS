import { Type } from 'class-transformer';
import { IsInt, IsOptional, IsString } from 'class-validator';

export class FilterCategoryDto {
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
  search?: string;
}
