import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { UsersService } from '../users/users.service';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async login(dto: LoginDto) {
    const user = await this.usersService.findByUsername(dto.user);

    if (!user || !user.active) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    if (user.role === 'Cajero') {
      if (!dto.pin) {
        throw new BadRequestException('El PIN es requerido para cajeros');
      }
      const pinValid = await this.usersService.validatePin(user, dto.pin);
      if (!pinValid) {
        throw new UnauthorizedException('PIN incorrecto');
      }
    } else {
      if (!dto.password) {
        throw new BadRequestException(
          'La contraseña es requerida para administradores',
        );
      }
      const passValid = await this.usersService.validatePassword(
        user,
        dto.password,
      );
      if (!passValid) {
        throw new UnauthorizedException('Contraseña incorrecta');
      }
    }

    const payload = { sub: user.id, user: user.user, role: user.role, id_market: user.id_market };

    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: user.id,
        user: user.user,
        role: user.role,
        id_point: user.id_point,
        point: user.point,
        id_market: user.id_market,
        market: user.market,
      },
    };
  }
}
