import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePointDto } from './dto/create-point.dto';
import { UpdatePointDto } from './dto/update-point.dto';

@Injectable()
export class PointService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createPointDto: CreatePointDto) {
    await this.validateNoDuplicateName(createPointDto.point, undefined, createPointDto.id_market);

    return this.prisma.point.create({
      data: createPointDto,
      include: {
        _count: { select: { users: true, categories: true, products: true } },
        market: { select: { id_market: true, name: true, slug: true } },
      },
    });
  }

  async findAll(id_market?: number) {
    return this.prisma.point.findMany({
      where: { active: true, ...(id_market && { id_market }) },
      include: {
        _count: { select: { users: true, categories: true, products: true } },
        market: { select: { id_market: true, name: true, slug: true } },
      },
      orderBy: { point: 'asc' },
    });
  }

  async findOne(id: number) {
    const point = await this.prisma.point.findUnique({
      where: { id_point: id },
      include: {
        _count: { select: { users: true, categories: true, products: true } },
        market: { select: { id_market: true, name: true, slug: true } },
      },
    });

    if (!point || !point.active) {
      throw new NotFoundException(`Punto de venta #${id} no encontrado`);
    }

    return point;
  }

  async update(id: number, dto: UpdatePointDto) {
    await this.findOne(id);

    if (dto.point) {
      await this.validateNoDuplicateName(dto.point, id, dto.id_market);
    }

    return this.prisma.point.update({
      where: { id_point: id },
      data: dto,
      include: {
        _count: { select: { users: true, categories: true, products: true } },
        market: { select: { id_market: true, name: true, slug: true } },
      },
    });
  }

  async remove(id: number) {
    await this.findOne(id);

    return this.prisma.point.update({
      where: { id_point: id },
      data: { active: false },
    });
  }

  private async validateNoDuplicateName(name: string, excludeId?: number, id_market?: number) {
    const duplicate = await this.prisma.point.findFirst({
      where: {
        point: { equals: name, mode: 'insensitive' },
        ...(id_market && { id_market }),
        ...(excludeId && { NOT: { id_point: excludeId } }),
      },
    });

    if (duplicate) {
      throw new ConflictException(
        `Ya existe un punto de venta con el nombre "${name}" en este market.`,
      );
    }
  }
}
