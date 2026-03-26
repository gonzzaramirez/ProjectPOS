import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { FilterProductDto } from './dto/filter-product.dto';

@Injectable()
export class ProductsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createProductDto: CreateProductDto) {
    await this.validateCategoryExists(createProductDto.id_category);

    return this.prisma.product.create({
      data: createProductDto,
      include: { category: true },
    });
  }

  async findAll(filters: FilterProductDto) {
    const { page = 1, limit = 10, id_category, search, id_point } = filters;
    const skip = (page - 1) * limit;

    const where = {
      ...(id_category && { id_category }),
      ...(id_point && { id_point }),
      ...(search && {
        product_name: {
          contains: search,
          mode: 'insensitive' as const,
        },
      }),
    };
    const [data, total] = await this.prisma.$transaction([
      this.prisma.product.findMany({
        where,
        skip,
        take: limit,
        include: { category: true },
        orderBy: { product_name: 'asc' },
      }),
      this.prisma.product.count({ where }),
    ]);

    return {
      data,
      meta: {
        total,
        page,
        limit,
        last_page: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: number) {
    const product = await this.prisma.product.findUnique({
      where: { id_product: id },
      include: { category: true },
    });

    if (!product) {
      throw new NotFoundException(`Producto #${id} no encontrado`);
    }

    return product;
  }

  async update(id: number, dto: UpdateProductDto) {
    await this.findOne(id); // valida existencia

    if (dto.id_category) {
      await this.validateCategoryExists(dto.id_category);
    }

    return this.prisma.product.update({
      where: { id_product: id },
      data: dto,
      include: { category: true },
    });
  }

  async remove(id: number) {
    await this.findOne(id); // valida existencia

    return this.prisma.product.delete({
      where: { id_product: id },
    });
  }

  //  DESCONTAR STOCK 
  async decrementStock(id_product: number, quantity: number) {
    const product = await this.findOne(id_product);
 
    if (product.stock < quantity) {
      throw new BadRequestException(
        `Stock insuficiente para "${product.product_name}". ` +
          `Disponible: ${product.stock}, solicitado: ${quantity}`,
      );
    }
 
    return this.prisma.product.update({
      where: { id_product },
      data: { stock: { decrement: quantity } },
    });
  }


  // HELPER
  
  private async validateCategoryExists(id_category: number) {
    const category = await this.prisma.category.findUnique({
      where: { id_category },
    });

    if (!category) {
      throw new NotFoundException(`Categoría #${id_category} no encontrada`);
    }
  }
}
