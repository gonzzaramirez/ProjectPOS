import { Controller, Get, Query } from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { DashboardFilterDto } from './dto/dashboard-filter.dto';

@Controller('dashboard')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('summary')
  getSummary(@Query() filters: DashboardFilterDto) {
    return this.dashboardService.getSummary(filters);
  }

  @Get('best-sellers')
  getBestSellers(@Query() filters: DashboardFilterDto) {
    return this.dashboardService.getBestSellers(filters);
  }
}
