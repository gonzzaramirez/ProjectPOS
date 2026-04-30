import { Type } from 'class-transformer';
import { IsInt, IsOptional, IsString, IsIn, Min } from 'class-validator';

export class FilterOrderDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  limit?: number = 20;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  id_point?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  id_market?: number;

  @IsOptional()
  @IsIn(['Pendiente', 'Preparado', 'Entregado', 'Cancelado'])
  status?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  id_shift?: number;

  @IsOptional()
  @IsString()
  date_from?: string;

  @IsOptional()
  @IsString()
  date_to?: string;
}
