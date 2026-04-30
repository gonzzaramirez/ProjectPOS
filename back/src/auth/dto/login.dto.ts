import { IsString, MaxLength, MinLength, IsOptional } from 'class-validator';

export class LoginDto {
  @IsString()
  @MaxLength(100)
  user: string;

  @IsString()
  @IsOptional()
  @MinLength(4)
  password?: string;

  @IsString()
  @IsOptional()
  @MinLength(4)
  @MaxLength(6)
  pin?: string;
}
