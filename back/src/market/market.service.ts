import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateMarketDto } from './dto/create-market.dto';
import { UpdateMarketDto } from './dto/update-market.dto';

@Injectable()
export class MarketService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateMarketDto) {
    await this.validateNoDuplicateSlug(dto.slug);

    return this.prisma.market.create({
      data: {
        name: dto.name,
        slug: dto.slug,
        flags: (dto.flags ?? {}) as Prisma.InputJsonValue,
      },
      include: {
        _count: { select: { points: true, users: true } },
      },
    });
  }

  async findAll() {
    return this.prisma.market.findMany({
      where: { active: true },
      include: {
        _count: { select: { points: true, users: true } },
      },
      orderBy: { name: 'asc' },
    });
  }

  async findOne(id: number) {
    const market = await this.prisma.market.findUnique({
      where: { id_market: id },
      include: {
        _count: { select: { points: true, users: true, categories: true, products: true } },
      },
    });

    if (!market || !market.active) {
      throw new NotFoundException(`Market #${id} no encontrado`);
    }

    return market;
  }

  async findBySlug(slug: string) {
    const market = await this.prisma.market.findUnique({
      where: { slug },
    });

    if (!market || !market.active) {
      throw new NotFoundException(`Market con slug \"${slug}\" no encontrado`);
    }

    return market;
  }

  async update(id: number, dto: UpdateMarketDto) {
    await this.findOne(id);

    if (dto.slug) {
      await this.validateNoDuplicateSlug(dto.slug, id);
    }

    const updateData: Record<string, unknown> = {};
    if (dto.name !== undefined) updateData.name = dto.name;
    if (dto.slug !== undefined) updateData.slug = dto.slug;
    if (dto.flags !== undefined) updateData.flags = dto.flags;

    return this.prisma.market.update({
      where: { id_market: id },
      data: updateData as any,
      include: {
        _count: { select: { points: true, users: true } },
      },
    });
  }

  async remove(id: number) {
    await this.findOne(id);

    return this.prisma.market.update({
      where: { id_market: id },
      data: { active: false },
    });
  }

  private async validateNoDuplicateSlug(slug: string, excludeId?: number) {
    const duplicate = await this.prisma.market.findFirst({
      where: {
        slug: { equals: slug, mode: 'insensitive' },
        ...(excludeId && { NOT: { id_market: excludeId } }),
      },
    });

    if (duplicate) {
      throw new ConflictException(
        `Ya existe un market con el slug \"${slug}\".`,
      );
    }
  }
}