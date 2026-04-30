import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateWithdrawalDto } from './dto/create-withdrawal.dto';
import { FilterWithdrawalDto } from './dto/filter-withdrawal.dto';

@Injectable()
export class WithdrawalService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateWithdrawalDto) {
    const shift = await this.prisma.cashShift.findUnique({
      where: { id_shift: dto.id_shift },
    });

    if (!shift) {
      throw new NotFoundException(`Turno #${dto.id_shift} no encontrado`);
    }

    if (shift.status !== 'Abierto') {
      throw new BadRequestException(
        'No se pueden registrar retiros en un turno cerrado',
      );
    }

    return this.prisma.withdrawal.create({
      data: {
        amount: dto.amount,
        reason: dto.reason,
        id_user: dto.id_user,
        id_point: dto.id_point,
        id_market: dto.id_market,
        id_shift: dto.id_shift,
      },
      include: {
        user: { select: { id: true, user: true, role: true } },
        point: { select: { id_point: true, point: true, tag: true } },
        shift: { select: { id_shift: true, status: true } },
      },
    });
  }

  async findAll(filters: FilterWithdrawalDto) {
    const { id_point, id_market, id_shift, date_from, date_to } = filters;

    const where: Record<string, unknown> = {
      ...(id_market && { id_market }),
      ...(id_point && { id_point }),
      ...(id_shift && { id_shift }),
      ...(date_from &&
        date_to && {
          created_at: {
            gte: new Date(date_from),
            lte: new Date(date_to),
          },
        }),
    };

    return this.prisma.withdrawal.findMany({
      where,
      include: {
        user: { select: { id: true, user: true, role: true } },
        point: { select: { id_point: true, point: true, tag: true } },
      },
      orderBy: { created_at: 'desc' },
    });
  }

  async findOne(id: number) {
    const withdrawal = await this.prisma.withdrawal.findUnique({
      where: { id_withdrawal: id },
      include: {
        user: { select: { id: true, user: true, role: true } },
        point: { select: { id_point: true, point: true, tag: true } },
        shift: { select: { id_shift: true, status: true, opened_at: true } },
      },
    });

    if (!withdrawal) {
      throw new NotFoundException(`Retiro #${id} no encontrado`);
    }

    return withdrawal;
  }
}
