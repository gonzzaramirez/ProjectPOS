import { IsIn, IsOptional, IsString, MaxLength } from 'class-validator';

export class UpdateOrderDto {
  @IsIn(['Pendiente', 'Preparado', 'Entregado', 'Cancelado'])
  @IsOptional()
  status?: string;

  @IsString()
  @IsOptional()
  @MaxLength(100)
  client_name?: string;

  @IsString()
  @IsOptional()
  @MaxLength(20)
  client_dni?: string;
}
