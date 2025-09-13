import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { GetProductsReportsDTO } from './dtos/get-products-reports.dto';
import { GetProductsReportsRequest, ReportsService } from './reports.service';

@Controller('reports')
@UseGuards(JwtAuthGuard)
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Get('products')
  async getProductsReport(@Query() { filters }: GetProductsReportsDTO) {
    const request: GetProductsReportsRequest = { filters };
    return this.reportsService.get(request);
  }
}
