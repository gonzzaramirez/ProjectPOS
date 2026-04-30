import {
  IsInt,
  IsNumber,
  IsPositive,
  MaxLength,
  IsString,
} from 'class-validator';

export class CreateWithdrawalDto {
  @IsNumber({ maxDecimalPlaces: 2 })
  @IsPositive()
  amount: number;

  @IsString()
  @MaxLength(255)
  reason: string;

  @IsInt()
  id_user: number;

  @IsInt()
  id_point: number;

  @IsInt()
  id_market: number;

  @IsInt()
  id_shift: number;
}
