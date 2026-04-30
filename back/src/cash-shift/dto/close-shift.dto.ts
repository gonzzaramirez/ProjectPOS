import { IsNumber, IsPositive } from 'class-validator';

export class CloseShiftDto {
  @IsNumber({ maxDecimalPlaces: 2 })
  @IsPositive()
  closing_amount: number;
}
