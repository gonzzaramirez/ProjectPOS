import {
  Controller,
  Get,
  Post,
  Patch,
  Param,
  Query,
  Body,
  ParseIntPipe,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { CashShiftService } from './cash-shift.service';
import { OpenShiftDto } from './dto/open-shift.dto';
import { CloseShiftDto } from './dto/close-shift.dto';
import { FilterShiftDto } from './dto/filter-shift.dto';

@Controller('shifts')
export class CashShiftController {
  constructor(private readonly cashShiftService: CashShiftService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  open(@Body() dto: OpenShiftDto) {
    return this.cashShiftService.open(dto);
  }

  @Get()
  findAll(@Query() filters: FilterShiftDto) {
    return this.cashShiftService.findAll(filters);
  }

  @Get('active')
  getActiveShift(
    @Query('id_point', ParseIntPipe) id_point: number,
    @Query('id_market') id_market?: number,
  ) {
    return this.cashShiftService.getActiveShift(id_point, id_market);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.cashShiftService.findOne(id);
  }

  @Patch(':id/close')
  close(@Param('id', ParseIntPipe) id: number, @Body() dto: CloseShiftDto) {
    return this.cashShiftService.close(id, dto);
  }
}
