import {
  IsString,
  IsInt,
  IsOptional,
  IsIn,
  MaxLength,
  MinLength,
} from 'class-validator';

export class CreateUserDto {
  @IsString()
  @MaxLength(100)
  user: string;

  @IsString()
  @MinLength(6)
  password: string;

  @IsString()
  @IsOptional()
  @MinLength(4)
  @MaxLength(6)
  pin?: string;

  @IsIn(['Admin', 'Cajero'])
  @IsOptional()
  role?: string;

  @IsInt()
  id_point: number;

  @IsInt()
  id_market: number;
}
