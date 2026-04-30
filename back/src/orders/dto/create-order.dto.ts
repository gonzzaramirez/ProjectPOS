import {
  IsString,
  IsInt,
  IsNumber,
  IsIn,
  IsOptional,
  MaxLength,
  ValidateNested,
  IsArray,
  Min,
  IsPositive,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateOrderItemDto {
  @IsInt()
  id_product: number;

  @IsInt()
  @Min(1)
  quantity: number;

  @IsNumber({ maxDecimalPlaces: 2 })
  @IsPositive()
  price_at_sale: number;
}

export class CreateOrderDto {
  @IsString()
  @MaxLength(36)
  uuid: string;

  @IsString()
  @MaxLength(100)
  client_name: string;

  @IsString()
  @IsOptional()
  @MaxLength(20)
  client_dni?: string;

  @IsNumber({ maxDecimalPlaces: 2 })
  @IsPositive()
  total: number;

  @IsIn(['Efectivo', 'Digital'])
  payment_method: string;

  @IsInt()
  id_point: number;

  @IsInt()
  id_market: number;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateOrderItemDto)
  items: CreateOrderItemDto[];
}
