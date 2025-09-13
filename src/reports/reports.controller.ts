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
import { ReportsService } from './reports.service';
import { GetProductsReportRequest } from './requests/get-products-report.request';
import { ProductsReportsResponse } from './responses/get-products-report.response';

/**
 * Reports Controller
 *
 * This controller handles HTTP requests related to product reporting and analytics.
 * It provides endpoints for generating comprehensive product reports with advanced
 * filtering capabilities. All endpoints require JWT authentication.
 *
 * @class ReportsController
 */
@ApiTags('Reports')
@ApiBearerAuth('JWT-auth')
@Controller('reports')
@UseGuards(JwtAuthGuard)
export class ReportsController {
  /**
   * Creates an instance of ReportsController
   *
   * @param {ReportsService} reportsService - Service for report generation and analytics
   */
  constructor(private readonly reportsService: ReportsService) {}

  /**
   * Generates comprehensive product reports with advanced filtering
   *
   * This endpoint creates detailed reports about products including statistics
   * for deleted and active products, price analysis, and percentage calculations.
   * Reports can be filtered using the same advanced filtering system as the
   * products listing endpoint. Requires JWT authentication.
   *
   * @returns {Promise<GetProductsReportsResponse>} Comprehensive product report with statistics
   * @returns {ProductGroupStats} returns.deletedProducts - Statistics for deleted products
   * @returns {ProductGroupStats} returns.notDeletedProducts - Statistics for active products
   */
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
  async getProductsReport(@Query() { filters }: GetProductsReportRequest) {
    return this.reportsService.get({ filters });
  }
}
