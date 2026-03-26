import { Type } from 'class-transformer';
import { IsInt, IsOptional, IsString, Min } from 'class-validator';

export class FilterProductDto {
  //  Paginación
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  limit?: number = 10;

  // Filtros
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  id_category?: number;

  @IsOptional()
  @IsString()
  search?: string; // búsqueda por nombre

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  id_point?: number;
}