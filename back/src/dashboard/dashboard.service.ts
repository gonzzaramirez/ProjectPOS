import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { DashboardFilterDto } from './dto/dashboard-filter.dto';
import { Prisma, OrderStatus, PaymentMethod } from '@prisma/client';

@Injectable()
export class DashboardService {
  constructor(private readonly prisma: PrismaService) {}

  private buildWhere(filters: DashboardFilterDto): Prisma.OrderWhereInput {
    const { id_point, id_market, date_from, date_to } = filters;

    const dateFilter: Prisma.DateTimeFilter | undefined =
      date_from || date_to
        ? {
            ...(date_from && date_to
              ? { gte: new Date(date_from), lte: new Date(date_to) }
              : date_from
                ? { gte: new Date(date_from) }
                : { lte: new Date(date_to!) }),
          }
        : undefined;

    return {
      status: { notIn: [OrderStatus.Cancelado] },
      ...(id_market && { id_market }),
      ...(id_point && { id_point }),
      ...(dateFilter && { created_at: dateFilter }),
    };
  }

  async getSummary(filters: DashboardFilterDto) {
    const where = this.buildWhere(filters);

    const [orders, cashTotal, digitalTotal] = await Promise.all([
      this.prisma.order.findMany({
        where,
        select: { total: true },
      }),
      this.prisma.order.aggregate({
        where: { ...where, payment_method: PaymentMethod.Efectivo },
        _sum: { total: true },
      }),
      this.prisma.order.aggregate({
        where: { ...where, payment_method: PaymentMethod.Digital },
        _sum: { total: true },
      }),
    ]);

    const total_sales = orders.reduce((sum, o) => sum + o.total, 0);
    const total_orders = orders.length;
    const average_ticket = total_orders > 0 ? total_sales / total_orders : 0;

    return {
      total_sales: Math.round(total_sales * 100) / 100,
      total_orders,
      average_ticket: Math.round(average_ticket * 100) / 100,
      cash_total: Math.round((cashTotal._sum?.total ?? 0) * 100) / 100,
      digital_total: Math.round((digitalTotal._sum?.total ?? 0) * 100) / 100,
    };
  }

  async getBestSellers(filters: DashboardFilterDto) {
    const orderWhere = this.buildWhere(filters);

    const orderIds = (
      await this.prisma.order.findMany({
        where: orderWhere,
        select: { id_order: true },
      })
    ).map((o) => o.id_order);

    if (orderIds.length === 0) {
      return [];
    }

    const bestSellers = await this.prisma.orderItem.groupBy({
      by: ['id_product'],
      where: { id_order: { in: orderIds } },
      _sum: { quantity: true },
      _avg: { price_at_sale: true },
      orderBy: { _sum: { quantity: 'desc' } },
      take: 10,
    });

    const productIds = bestSellers.map((b) => b.id_product);
    const products = await this.prisma.product.findMany({
      where: { id_product: { in: productIds } },
      select: { id_product: true, product_name: true, price: true },
    });

    const productMap = new Map(
      products.map((p) => [
        p.id_product,
        { name: p.product_name, current_price: p.price },
      ]),
    );

    return bestSellers.map((item) => ({
      id_product: item.id_product,
      product_name: productMap.get(item.id_product)?.name ?? 'Desconocido',
      current_price: productMap.get(item.id_product)?.current_price ?? 0,
      total_quantity: item._sum.quantity ?? 0,
      average_price: Math.round((item._avg.price_at_sale ?? 0) * 100) / 100,
    }));
  }
}
