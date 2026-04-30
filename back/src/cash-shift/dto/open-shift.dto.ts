import { IsInt, IsNumber, IsPositive } from 'class-validator';

export class OpenShiftDto {
  @IsNumber({ maxDecimalPlaces: 2 })
  @IsPositive()
  opening_amount: number;

  @IsInt()
  id_user: number;

  @IsInt()
  id_point: number;

  @IsInt()
  id_market: number;
}
