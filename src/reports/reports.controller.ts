import { Controller, Get, Query } from '@nestjs/common';
import { GetProductsReportsDTO } from './dtos/get-products-reports.dto';
import { GetProductsReportsRequest, ReportsService } from './reports.service';

@Controller('reports')
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Get('products')
  async getProductsReport(@Query() { filters }: GetProductsReportsDTO) {
    const request: GetProductsReportsRequest = { filters };
    return this.reportsService.get(request);
  }
}
