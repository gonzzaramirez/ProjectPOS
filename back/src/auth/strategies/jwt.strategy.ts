import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { UsersService } from '../../users/users.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly configService: ConfigService,
    private readonly usersService: UsersService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_SECRET') || 'change-me',
    });
  }

  async validate(payload: { sub: number; user: string; role: string; id_market: number }) {
    const user = await this.usersService.findOne(payload.sub);
    if (!user || !user.active) {
      throw new UnauthorizedException('Usuario inactivo o no encontrado');
    }
    return { id: payload.sub, user: payload.user, role: payload.role, id_market: payload.id_market };
  }
}
