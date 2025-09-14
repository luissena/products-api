import { CacheInterceptor, CacheTTL } from '@nestjs/cache-manager';
import {
  Controller,
  Delete,
  Get,
  NotFoundException,
  Param,
  Query,
  UseInterceptors,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiTags,
  ApiTooManyRequestsResponse,
} from '@nestjs/swagger';
import { RateLimitResponse } from '../shared/responses/rate-limit.response';
import { ProductsService } from './products.service';
import { ListProductsRequest } from './requests/list-products.request';
import { SoftDeleteProductRequest } from './requests/soft-delete-product.request';
import { ListProductsResponse } from './responses/list-products.response';

/**
 * Products Controller
 *
 * This controller handles HTTP requests related to product management.
 * It provides endpoints for listing products with advanced filtering,
 * pagination, sorting, and soft deletion operations.
 *
 * @class ProductsController
 */
@ApiTags('Products')
@Controller('products')
export class ProductsController {
  /**
   * Creates an instance of ProductsController
   *
   * @param {ProductsService} productsService - Service for product-related business logic
   */
  constructor(private readonly productsService: ProductsService) {}

  /**
   * Lists products with advanced filtering, pagination, and sorting capabilities
   *
   * This endpoint supports complex filtering using nested query parameters,
   * configurable pagination, and sorting by any product field. The response
   * includes both the product data and pagination metadata.
   *
   * @returns {Promise<Object>} Paginated list of products with metadata
   * @returns {Product[]} returns.results - Array of product entities
   * @returns {Object} returns.pagination - Pagination metadata
   * @returns {number} returns.pagination.total - Total number of products matching filters
   * @returns {number} returns.pagination.skip - Number of records skipped
   * @returns {number} returns.pagination.limit - Number of records returned
   */
  @Get()
  @ApiOperation({
    summary: 'List products with advanced filtering and pagination',
    description:
      'Retrieve a paginated list of products with advanced filtering capabilities. Use nested query parameters for filters, pagination, and sorting.',
  })
  @ApiQuery({
    name: 'filters',
    required: false,
    description:
      'Advanced filters using nested object structure. Example: filters[brand][equal]=Apple&filters[price][gt]=100',
    schema: {
      type: 'object',
      properties: {
        'filters[brand][equal]': { type: 'string', example: 'Apple' },
        'filters[brand][gt]': { type: 'string', example: 'A' },
        'filters[brand][gte]': { type: 'string', example: 'A' },
        'filters[brand][lt]': { type: 'string', example: 'Z' },
        'filters[brand][lte]': { type: 'string', example: 'Z' },
        'filters[name][equal]': { type: 'string', example: 'iPhone 15 Pro' },
        'filters[name][gt]': { type: 'string', example: 'iPhone' },
        'filters[model][equal]': { type: 'string', example: 'iPhone 15 Pro' },
        'filters[category][equal]': { type: 'string', example: 'Electronics' },
        'filters[color][equal]': {
          type: 'string',
          example: 'Natural Titanium',
        },
        'filters[price][equal]': { type: 'number', example: 999.99 },
        'filters[price][gt]': { type: 'number', example: 100 },
        'filters[price][gte]': { type: 'number', example: 100 },
        'filters[price][lt]': { type: 'number', example: 1000 },
        'filters[price][lte]': { type: 'number', example: 1000 },
        'filters[stock][equal]': { type: 'number', example: 50 },
        'filters[stock][gt]': { type: 'number', example: 0 },
        'filters[stock][gte]': { type: 'number', example: 0 },
        'filters[stock][lt]': { type: 'number', example: 100 },
        'filters[stock][lte]': { type: 'number', example: 100 },
        'filters[currency][equal]': { type: 'string', example: 'USD' },
        'filters[createdAt][equal]': {
          type: 'string',
          format: 'date-time',
          example: '2024-01-15T10:30:00.000Z',
        },
        'filters[createdAt][gt]': {
          type: 'string',
          format: 'date-time',
          example: '2024-01-01T00:00:00.000Z',
        },
        'filters[createdAt][gte]': {
          type: 'string',
          format: 'date-time',
          example: '2024-01-01T00:00:00.000Z',
        },
        'filters[createdAt][lt]': {
          type: 'string',
          format: 'date-time',
          example: '2024-12-31T23:59:59.999Z',
        },
        'filters[createdAt][lte]': {
          type: 'string',
          format: 'date-time',
          example: '2024-12-31T23:59:59.999Z',
        },
      },
    },
  })
  @ApiQuery({
    name: 'pagination',
    required: false,
    description: 'Pagination parameters',
    schema: {
      type: 'object',
      properties: {
        'pagination[skip]': {
          type: 'number',
          default: 0,
          minimum: 0,
          description: 'Number of records to skip',
        },
        'pagination[limit]': {
          type: 'number',
          default: 5,
          minimum: 1,
          maximum: 5,
          description: 'Number of records to return (max: 5)',
        },
      },
    },
  })
  @ApiQuery({
    name: 'order',
    required: false,
    description: 'Sorting parameters',
    schema: {
      type: 'object',
      properties: {
        'order[sku]': {
          type: 'string',
          enum: ['ASC', 'DESC'],
          description: 'Sort by SKU in ascending or descending order',
        },
      },
    },
  })
  @ApiOkResponse({
    description: 'Successfully retrieved products list',
    type: ListProductsResponse,
  })
  @ApiBadRequestResponse({
    description: 'Invalid filter parameters or pagination values',
    schema: {
      type: 'object',
      properties: {
        statusCode: { type: 'integer', example: 400 },
        message: { type: 'array', items: { type: 'string' } },
        error: { type: 'string', example: 'Bad Request' },
      },
    },
  })
  @ApiTooManyRequestsResponse({
    type: RateLimitResponse,
  })
  @UseInterceptors(CacheInterceptor)
  @CacheTTL(1000 * 60 * 60 * 24)
  list(@Query() { filters, pagination, order }: ListProductsRequest) {
    return this.productsService.list({
      pagination,
      filters,
      order,
    });
  }

  /**
   * Soft deletes a product by its ID
   *
   * This endpoint marks a product as deleted by setting its deletedAt timestamp.
   * The product will not appear in future queries but remains in the database
   * for audit purposes. Returns a success message or throws NotFoundException
   * if the product doesn't exist.
   *
   * @param {SoftDeleteProductRequest} params - Request parameters
   * @param {string} params.id - The UUID of the product to soft delete
   * @returns {Promise<Object>} Success message
   * @returns {string} returns.message - Success message confirming deletion
   * @throws {NotFoundException} When product with the given ID is not found
   */
  @Delete(':id')
  @ApiOperation({
    summary: 'Soft delete a product',
    description:
      'Mark a product as deleted by setting the deletedAt timestamp. The product will not appear in future queries but remains in the database.',
  })
  @ApiParam({
    name: 'id',
    description: 'Product UUID identifier',
    type: 'string',
    format: 'uuid',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiOkResponse({
    description: 'Product successfully soft deleted',
    schema: {
      type: 'object',
      properties: {
        message: {
          type: 'string',
          example: 'Product soft deleted successfully',
        },
      },
    },
  })
  @ApiTooManyRequestsResponse({
    type: RateLimitResponse,
  })
  @ApiNotFoundResponse({
    description: 'Product not found',
    schema: {
      type: 'object',
      properties: {
        statusCode: { type: 'integer', example: 404 },
        message: { type: 'string', example: 'Product not found' },
        error: { type: 'string', example: 'Not Found' },
      },
    },
  })
  @ApiBadRequestResponse({
    description: 'Invalid product ID format',
    schema: {
      type: 'object',
      properties: {
        statusCode: { type: 'integer', example: 400 },
        message: { type: 'string', example: 'id must be a UUID' },
        error: { type: 'string', example: 'Bad Request' },
      },
    },
  })
  async softDelete(@Param() { id }: SoftDeleteProductRequest) {
    const result = await this.productsService.softDelete(id);

    if (result === 0) {
      throw new NotFoundException('Product not found');
    }

    return {
      message: 'Product soft deleted successfully',
    };
  }
}
