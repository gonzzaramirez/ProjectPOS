import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { FilterOrderDto } from './dto/filter-order.dto';
import { PaymentMethod, OrderStatus } from '@prisma/client';

@Injectable()
export class OrdersService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateOrderDto) {
    const existing = await this.prisma.order.findUnique({
      where: { uuid: dto.uuid },
    });
    if (existing) {
      return existing;
    }

    for (const item of dto.items) {
      const product = await this.prisma.product.findUnique({
        where: { id_product: item.id_product },
      });
      if (!product) {
        throw new NotFoundException(
          `Producto #${item.id_product} no encontrado`,
        );
      }
      if (product.stock < item.quantity) {
        throw new BadRequestException(
          `Stock insuficiente para "${product.product_name}". Disponible: ${product.stock}, solicitado: ${item.quantity}`,
        );
      }
    }

    return this.prisma.$transaction(async (tx) => {
      const order = await tx.order.create({
        data: {
          uuid: dto.uuid,
          client_name: dto.client_name,
          client_dni: dto.client_dni,
          total: dto.total,
          payment_method: dto.payment_method as PaymentMethod,
          id_point: dto.id_point,
          id_market: dto.id_market,
          items: {
            create: dto.items.map((item) => ({
              quantity: item.quantity,
              price_at_sale: item.price_at_sale,
              id_product: item.id_product,
              id_point: dto.id_point,
              id_market: dto.id_market,
            })),
          },
        },
        include: { items: { include: { product: true } } },
      });

      for (const item of dto.items) {
        await tx.product.update({
          where: { id_product: item.id_product },
          data: { stock: { decrement: item.quantity } },
        });
      }

      return order;
    });
  }

  async findAll(filters: FilterOrderDto) {
    const {
      page = 1,
      limit = 20,
      id_point,
      id_market,
      status,
      date_from,
      date_to,
    } = filters;
    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = {
      ...(id_market && { id_market }),
      ...(id_point && { id_point }),
      ...(status && { status }),
      ...(date_from &&
        date_to && {
          created_at: {
            gte: new Date(date_from),
            lte: new Date(date_to),
          },
        }),
      ...(date_from &&
        !date_to && {
          created_at: { gte: new Date(date_from) },
        }),
      ...(!date_from &&
        date_to && {
          created_at: { lte: new Date(date_to) },
        }),
    };

    const [data, total] = await this.prisma.$transaction([
      this.prisma.order.findMany({
        where,
        skip,
        take: limit,
        include: {
          items: {
            include: {
              product: {
                select: { id_product: true, product_name: true },
              },
            },
          },
        },
        orderBy: { created_at: 'desc' },
      }),
      this.prisma.order.count({ where }),
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
    const order = await this.prisma.order.findUnique({
      where: { id_order: id },
      include: {
        items: {
          include: {
            product: {
              select: { id_product: true, product_name: true, price: true },
            },
          },
        },
      },
    });

    if (!order) {
      throw new NotFoundException(`Pedido #${id} no encontrado`);
    }

    return order;
  }

  async findByUuid(uuid: string) {
    const order = await this.prisma.order.findUnique({
      where: { uuid },
    });
    if (!order) {
      throw new NotFoundException(`Pedido con UUID ${uuid} no encontrado`);
    }
    return order;
  }

  async update(id: number, dto: UpdateOrderDto) {
    await this.findOne(id);

    return this.prisma.order.update({
      where: { id_order: id },
      data: {
        ...(dto.status && { status: dto.status as OrderStatus }),
        ...(dto.client_name && { client_name: dto.client_name }),
        ...(dto.client_dni !== undefined && { client_dni: dto.client_dni }),
      },
      include: {
        items: {
          include: {
            product: {
              select: { id_product: true, product_name: true },
            },
          },
        },
      },
    });
  }

  async markSynced(uuid: string) {
    const order = await this.prisma.order.findUnique({ where: { uuid } });
    if (!order) {
      throw new NotFoundException(`Pedido con UUID ${uuid} no encontrado`);
    }

    return this.prisma.order.update({
      where: { uuid },
      data: { synced: true },
    });
  }

  async remove(id: number) {
    const order = await this.findOne(id);

    if (order.status !== 'Cancelado') {
      throw new ConflictException('Solo se pueden eliminar pedidos cancelados');
    }

    return this.prisma.order.delete({
      where: { id_order: id },
    });
  }

  async getUnsyncedCount(id_point: number, id_market?: number) {
    const count = await this.prisma.order.count({
      where: { id_point, ...(id_market && { id_market }), synced: false },
    });
    return { unsynced_count: count };
  }
}
