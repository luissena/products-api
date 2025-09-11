import { Transform } from 'class-transformer';
import { IsInt, IsOptional, IsPositive, Max } from 'class-validator';
import { IPaginationInput } from '../../shared/interfaces/pagination.interface';
import {
  LIST_PRODUCTS_DEFAULT_LIMIT,
  LIST_PRODUCTS_DEFAULT_SKIP,
  LIST_PRODUCTS_MAX_LIMIT,
} from '../constants';

export class ListProductsPaginationDTO implements IPaginationInput {
  @IsInt()
  @Transform(({ value }) => {
    if (value != null) return Number(value);
    return LIST_PRODUCTS_DEFAULT_SKIP;
  })
  @IsOptional()
  skip: number = LIST_PRODUCTS_DEFAULT_SKIP;

  @IsInt()
  @Transform(({ value }) => {
    if (value != null) return Number(value);
    return LIST_PRODUCTS_DEFAULT_LIMIT;
  })
  @Max(LIST_PRODUCTS_MAX_LIMIT)
  @IsPositive()
  @IsOptional()
  limit: number = LIST_PRODUCTS_DEFAULT_LIMIT;
}
