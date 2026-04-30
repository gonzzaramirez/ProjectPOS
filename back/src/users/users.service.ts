import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { Prisma, Role } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const SALT_ROUNDS = 10;

type UserWithPoint = Prisma.UserGetPayload<{ include: { point: true, market: true } }>;

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateUserDto) {
    await this.validateNoDuplicateUser(dto.user, undefined, dto.id_market);

    const data: Prisma.UserCreateInput = {
      user: dto.user,
      password: await bcrypt.hash(dto.password, SALT_ROUNDS),
      role: (dto.role as Role) ?? 'Cajero',
      point: { connect: { id_point: dto.id_point } },
      market: { connect: { id_market: dto.id_market } },
    };

    if (dto.pin) {
      data.pin = await bcrypt.hash(dto.pin, SALT_ROUNDS);
    }

    return this.prisma.user.create({
      data,
      select: this.userSelect(),
    });
  }

  async findAll(id_point?: number, id_market?: number) {
    return this.prisma.user.findMany({
      where: {
        active: true,
        ...(id_market && { id_market }),
        ...(id_point && { id_point }),
      },
      select: this.userSelect(),
      orderBy: { user: 'asc' },
    });
  }

  async findOne(id: number) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: this.userSelect(),
    });

    if (!user || !user.active) {
      throw new NotFoundException(`Usuario #${id} no encontrado`);
    }

    return user;
  }

  async findByUsername(username: string): Promise<UserWithPoint | null> {
    return this.prisma.user.findFirst({
      where: {
        user: username,
        active: true,
      },
      include: { point: true, market: true },
    });
  }

  async update(id: number, dto: UpdateUserDto) {
    await this.findOne(id);

    if (dto.user) {
      await this.validateNoDuplicateUser(dto.user, id, dto.id_market);
    }

    const data: Prisma.UserUpdateInput = {};

    if (dto.user) data.user = dto.user;
    if (dto.role) data.role = dto.role as Role;
    if (dto.id_point) data.point = { connect: { id_point: dto.id_point } };
    if (dto.id_market) data.market = { connect: { id_market: dto.id_market } };
    if (dto.password)
      data.password = await bcrypt.hash(dto.password, SALT_ROUNDS);
    if (dto.pin) data.pin = await bcrypt.hash(dto.pin, SALT_ROUNDS);

    return this.prisma.user.update({
      where: { id },
      data,
      select: this.userSelect(),
    });
  }

  async remove(id: number) {
    await this.findOne(id);

    return this.prisma.user.update({
      where: { id },
      data: { active: false },
      select: this.userSelect(),
    });
  }

  async validatePin(user: UserWithPoint, pin: string): Promise<boolean> {
    if (!user.pin) return false;
    return bcrypt.compare(pin, user.pin);
  }

  async validatePassword(
    user: UserWithPoint,
    password: string,
  ): Promise<boolean> {
    return bcrypt.compare(password, user.password);
  }

  private userSelect() {
    return {
      id: true,
      user: true,
      role: true,
      active: true,
      id_point: true,
      id_market: true,
      created_at: true,
      point: { select: { id_point: true, point: true, tag: true } },
      market: { select: { id_market: true, name: true, slug: true } },
    };
  }

  private async validateNoDuplicateUser(username: string, excludeId?: number, id_market?: number) {
    const duplicate = await this.prisma.user.findFirst({
      where: {
        user: username,
        ...(id_market && { id_market }),
      },
    });

    if (duplicate && duplicate.id !== excludeId) {
      throw new ConflictException(
        `Ya existe un usuario con el nombre "${username}" en este market.`,
      );
    }
  }
}
