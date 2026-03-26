import { Type } from 'class-transformer';
import { IsInt, IsOptional, IsString } from 'class-validator';

export class FilterCategoryDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  id_point?: number;

  @IsOptional()
  @IsString()
  search?: string; // búsqueda por nombre de categoría
}