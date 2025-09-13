import {
  Controller,
  Delete,
  Get,
  NotFoundException,
  Param,
  Query,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { ProductsService } from './products.service';
import { ListProductsRequest } from './requests/list-products.request';
import { SoftDeleteProductRequest } from './requests/soft-delete-product.request';
import { ListProductsResponse } from './responses/list-products.response';

@ApiTags('Products')
@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

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
  list(@Query() { filters, pagination, order }: ListProductsRequest) {
    console.log(filters);
    return this.productsService.list({
      pagination,
      filters,
      order,
    });
  }

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
