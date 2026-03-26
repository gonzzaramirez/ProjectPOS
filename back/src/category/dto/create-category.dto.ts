import { IsString, IsInt, IsOptional, MaxLength } from 'class-validator';

export class CreateCategoryDto {
  @IsString()
  @MaxLength(100)
  category: string;

  @IsString()
  @IsOptional()
  description: string;

  @IsInt()
  id_point: number;
}