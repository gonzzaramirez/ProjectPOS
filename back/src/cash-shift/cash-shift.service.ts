import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { OpenShiftDto } from './dto/open-shift.dto';
import { CloseShiftDto } from './dto/close-shift.dto';
import { FilterShiftDto } from './dto/filter-shift.dto';

@Injectable()
export class CashShiftService {
  constructor(private readonly prisma: PrismaService) {}

  async open(dto: OpenShiftDto) {
    const openShift = await this.prisma.cashShift.findFirst({
      where: { id_point: dto.id_point, id_market: dto.id_market, status: 'Abierto' },
    });

    if (openShift) {
      throw new ConflictException(
        `Ya existe un turno abierto para el punto de venta #${dto.id_point}`,
      );
    }

    return this.prisma.cashShift.create({
      data: {
        opening_amount: dto.opening_amount,
        id_user: dto.id_user,
        id_point: dto.id_point,
        id_market: dto.id_market,
      },
      include: {
        user: { select: { id: true, user: true, role: true } },
        point: { select: { id_point: true, point: true, tag: true } },
      },
    });
  }

  async close(id: number, dto: CloseShiftDto) {
    const shift = await this.findOne(id);

    if (shift.status !== 'Abierto') {
      throw new ConflictException('Este turno ya está cerrado');
    }

    const orders = await this.prisma.order.findMany({
      where: {
        id_point: shift.id_point,
        created_at: {
          gte: shift.opened_at,
          lte: new Date(),
        },
        status: { notIn: ['Cancelado'] },
      },
      select: { total: true, payment_method: true },
    });

    const total_sales_cash = orders
      .filter((o) => o.payment_method === 'Efectivo')
      .reduce((sum, o) => sum + o.total, 0);

    const total_sales_digital = orders
      .filter((o) => o.payment_method === 'Digital')
      .reduce((sum, o) => sum + o.total, 0);

    const withdrawals = await this.prisma.withdrawal.findMany({
      where: { id_shift: id },
      select: { amount: true },
    });

    const total_withdrawals = withdrawals.reduce((sum, w) => sum + w.amount, 0);

    const expected_in_drawer =
      shift.opening_amount + total_sales_cash - total_withdrawals;

    return this.prisma.cashShift.update({
      where: { id_shift: id },
      data: {
        closed_at: new Date(),
        closing_amount: dto.closing_amount,
        total_sales_cash,
        total_sales_digital,
        total_withdrawals,
        expected_in_drawer,
        status: 'Cerrado',
      },
      include: {
        user: { select: { id: true, user: true, role: true } },
        point: { select: { id_point: true, point: true, tag: true } },
        withdrawals: true,
      },
    });
  }

  async findAll(filters: FilterShiftDto) {
    const { id_point, id_market, status, date_from, date_to } = filters;

    const where: Record<string, unknown> = {
      ...(id_market && { id_market }),
      ...(id_point && { id_point }),
      ...(status && { status }),
      ...(date_from &&
        date_to && {
          opened_at: {
            gte: new Date(date_from),
            lte: new Date(date_to),
          },
        }),
    };

    return this.prisma.cashShift.findMany({
      where,
      include: {
        user: { select: { id: true, user: true, role: true } },
        point: { select: { id_point: true, point: true, tag: true } },
        _count: { select: { withdrawals: true } },
      },
      orderBy: { opened_at: 'desc' },
    });
  }

  async findOne(id: number) {
    const shift = await this.prisma.cashShift.findUnique({
      where: { id_shift: id },
      include: {
        user: { select: { id: true, user: true, role: true } },
        point: { select: { id_point: true, point: true, tag: true } },
        withdrawals: true,
      },
    });

    if (!shift) {
      throw new NotFoundException(`Turno #${id} no encontrado`);
    }

    return shift;
  }

  async getActiveShift(id_point: number, id_market?: number) {
    const shift = await this.prisma.cashShift.findFirst({
      where: { id_point, ...(id_market && { id_market }), status: 'Abierto' },
      include: {
        user: { select: { id: true, user: true, role: true } },
        withdrawals: true,
      },
    });

    if (!shift) {
      throw new NotFoundException(
        `No hay turno abierto para el punto de venta #${id_point}`,
      );
    }

    return shift;
  }
}
