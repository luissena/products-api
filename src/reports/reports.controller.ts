import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiQuery,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { GetProductsReportsDTO } from './dtos/get-products-reports.dto';
import { GetProductsReportsRequest, ReportsService } from './reports.service';
import { ProductsReportsResponse } from './responses/get-products-report.response';

@ApiTags('Reports')
@ApiBearerAuth('JWT-auth')
@Controller('reports')
@UseGuards(JwtAuthGuard)
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Get('products')
  @ApiOperation({
    summary: 'Generate comprehensive product reports',
    description:
      'Generate detailed reports about products based on specified filters. Includes price analysis, stock analysis, brand distribution, category analysis, and price range distribution. Requires JWT authentication.',
  })
  @ApiQuery({
    name: 'filters',
    required: false,
    description:
      'Advanced filters using nested object structure. Same format as products endpoint.',
    schema: {
      type: 'object',
      properties: {
        'filters[brand][equal]': { type: 'string', example: 'Apple' },
        'filters[category][equal]': { type: 'string', example: 'Electronics' },
        'filters[price][gt]': { type: 'number', example: 100 },
        'filters[stock][gt]': { type: 'number', example: 0 },
      },
    },
  })
  @ApiOkResponse({
    description: 'Successfully generated product reports',
    type: ProductsReportsResponse,
  })
  @ApiUnauthorizedResponse({
    description: 'Authentication required - JWT token missing or invalid',
    schema: {
      type: 'object',
      properties: {
        statusCode: { type: 'integer', example: 401 },
        message: { type: 'string', example: 'Unauthorized' },
        error: { type: 'string', example: 'Unauthorized' },
      },
    },
  })
  @ApiBadRequestResponse({
    description: 'Invalid filter parameters',
    schema: {
      type: 'object',
      properties: {
        statusCode: { type: 'integer', example: 400 },
        message: { type: 'array', items: { type: 'string' } },
        error: { type: 'string', example: 'Bad Request' },
      },
    },
  })
  async getProductsReport(@Query() { filters }: GetProductsReportsDTO) {
    const request: GetProductsReportsRequest = { filters };
    return this.reportsService.get(request);
  }
}
