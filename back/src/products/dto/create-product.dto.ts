import {
  IsString,
  IsNumber,
  IsBoolean,
  IsInt,
  IsOptional,
  Min,
  MaxLength,
  IsPositive,
} from 'class-validator';

export class CreateProductDto {
  @IsString()
  @MaxLength(255)
  product_name: string;

  @IsNumber({ maxDecimalPlaces: 2 })
  @IsPositive()
  price: number;

  @IsInt()
  @Min(0)
  stock: number;

  @IsInt()
  id_category: number;

  @IsInt()
  id_point: number;

  @IsBoolean()
  @IsOptional()
  requires_cooking?: boolean = false;
}