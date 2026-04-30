import { IsOptional, IsInt } from 'class-validator';
import { Type } from 'class-transformer';

export class FilterUserDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  id_point?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  id_market?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  role?: number;
}
