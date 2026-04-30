import { IsString, MaxLength, IsInt } from 'class-validator';

export class CreatePointDto {
  @IsString()
  @MaxLength(100)
  point: string;

  @IsString()
  @MaxLength(50)
  tag: string;

  @IsInt()
  id_market: number;
}
