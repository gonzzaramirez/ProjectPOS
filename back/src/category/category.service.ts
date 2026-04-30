import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { FilterCategoryDto } from './dto/filter-category.dto';

@Injectable()
export class CategoryService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createCategoryDto: CreateCategoryDto) {
    await this.validateNoDuplicateName(
      createCategoryDto.category,
      createCategoryDto.id_market,
    );

    return this.prisma.category.create({
      data: createCategoryDto,
      include: { _count: { select: { products: true } } },
    });
  }

  async findAll(filters: FilterCategoryDto) {
    const { id_point, id_market, search } = filters;

    const where = {
      ...(id_market && { id_market }),
      ...(id_point && { id_point }),
      ...(search && {
        category: {
          contains: search,
          mode: 'insensitive' as const,
        },
      }),
    };

    return this.prisma.category.findMany({
      where,
      orderBy: { category: 'asc' },
      include: {
        _count: { select: { products: true } },
      },
    });
  }

  async findOne(id: number) {
    const category = await this.prisma.category.findUnique({
      where: { id_category: id },
      include: {
        products: {
          select: {
            id_product: true,
            product_name: true,
            price: true,
            stock: true,
          },
          orderBy: { product_name: 'asc' },
        },
        _count: { select: { products: true } },
      },
    });

    if (!category) {
      throw new NotFoundException(`Categoría #${id} no encontrada`);
    }

    return category;
  }

  async update(id: number, dto: UpdateCategoryDto) {
    const existing = await this.findOne(id);

    if (dto.category && dto.category !== existing.category) {
      const marketId = dto.id_market ?? existing.id_market;
      await this.validateNoDuplicateName(dto.category, marketId, id);
    }

    return this.prisma.category.update({
      where: { id_category: id },
      data: dto,
      include: { _count: { select: { products: true } } },
    });
  }

  async remove(id: number) {
    const category = await this.findOne(id);

    if (category._count.products > 0) {
      throw new ConflictException(
        `No se puede eliminar la categoría "${category.category}" ` +
          `porque tiene ${category._count.products} producto(s) asociado(s).`,
      );
    }

    return this.prisma.category.delete({
      where: { id_category: id },
    });
  }

  /* Validar categorias duplicadas */
  private async validateNoDuplicateName(
    name: string,
    id_market: number,
    excludeId?: number,
  ) {
    const duplicate = await this.prisma.category.findFirst({
      where: {
        category: { equals: name, mode: 'insensitive' },
        id_market,
        ...(excludeId && { NOT: { id_category: excludeId } }),
      },
    });

    if (duplicate) {
      throw new ConflictException(
        `Ya existe una categoría con el nombre "${name}" en este market.`,
      );
    }
  }
}
