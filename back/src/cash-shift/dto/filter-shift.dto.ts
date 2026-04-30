import { Type } from 'class-transformer';
import { IsInt, IsOptional, IsIn, IsString } from 'class-validator';

export class FilterShiftDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  id_point?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  id_market?: number;

  @IsOptional()
  @IsIn(['Abierto', 'Cerrado'])
  status?: string;

  @IsOptional()
  @IsString()
  date_from?: string;

  @IsOptional()
  @IsString()
  date_to?: string;
}
