import { applyDecorators } from '@nestjs/common';
import { Transform, TransformFnParams } from 'class-transformer';
import {
  IsDateString,
  IsIn,
  IsInt,
  IsNumber,
  IsString,
  ValidateIf,
} from 'class-validator';
import { ORDER_VALUES } from '../constants';

/**
 * Property decorator that ignores validation if the value is undefined
 *
 * This decorator is useful for optional fields in DTOs where validation
 * should only occur when a value is provided.
 *
 * @constant {PropertyDecorator} IgnoreIfUndefined
 */
export const IgnoreIfUndefined: PropertyDecorator = ValidateIf(
  (_object, value) => value !== undefined,
);

/**
 * Creates a number filter validator decorator
 *
 * Validates that the value is a number and transforms string inputs to integers.
 * Only validates if the value is defined (not undefined).
 *
 * @param {...PropertyDecorator[]} decorators - Additional decorators to apply
 * @returns {PropertyDecorator} Combined decorator for number filtering
 *
 * @example
 * ```typescript
 * class FilterDTO {
 *   @IsNumberFilter()
 *   price?: number;
 * }
 * ```
 */
export function IsNumberFilter(
  ...decorators: PropertyDecorator[]
): PropertyDecorator {
  return applyDecorators(
    IgnoreIfUndefined,
    IsNumber(),
    Transform(({ value }: TransformFnParams) => parseInt(value as string, 10)),
    ...decorators,
  );
}

/**
 * Creates a text filter validator decorator
 *
 * Validates that the value is a string.
 * Only validates if the value is defined (not undefined).
 *
 * @param {...PropertyDecorator[]} decorators - Additional decorators to apply
 * @returns {PropertyDecorator} Combined decorator for text filtering
 *
 * @example
 * ```typescript
 * class FilterDTO {
 *   @IsTextFilter()
 *   name?: string;
 * }
 * ```
 */
export function IsTextFilter(
  ...decorators: PropertyDecorator[]
): PropertyDecorator {
  return applyDecorators(IgnoreIfUndefined, IsString(), ...decorators);
}

/**
 * Creates an integer filter validator decorator
 *
 * Validates that the value is an integer.
 * Only validates if the value is defined (not undefined).
 *
 * @param {...PropertyDecorator[]} decorators - Additional decorators to apply
 * @returns {PropertyDecorator} Combined decorator for integer filtering
 *
 * @example
 * ```typescript
 * class FilterDTO {
 *   @IsIntFilter()
 *   stock?: number;
 * }
 * ```
 */
export function IsIntFilter(
  ...decorators: PropertyDecorator[]
): PropertyDecorator {
  return applyDecorators(IgnoreIfUndefined, IsInt(), ...decorators);
}

/**
 * Creates a date filter validator decorator
 *
 * Validates that the value is a valid date string.
 * Only validates if the value is defined (not undefined).
 *
 * @param {...PropertyDecorator[]} decorators - Additional decorators to apply
 * @returns {PropertyDecorator} Combined decorator for date filtering
 *
 * @example
 * ```typescript
 * class FilterDTO {
 *   @IsDateFilter()
 *   createdAt?: string;
 * }
 * ```
 */
export function IsDateFilter(
  ...decorators: PropertyDecorator[]
): PropertyDecorator {
  return applyDecorators(IgnoreIfUndefined, IsDateString(), ...decorators);
}

/**
 * Creates an order filter validator decorator
 *
 * Validates that the value is one of the allowed order values (ASC, DESC).
 * Only validates if the value is defined (not undefined).
 *
 * @param {...PropertyDecorator[]} decorators - Additional decorators to apply
 * @returns {PropertyDecorator} Combined decorator for order filtering
 *
 * @example
 * ```typescript
 * class FilterDTO {
 *   @IsOrderFilter()
 *   sortOrder?: 'ASC' | 'DESC';
 * }
 * ```
 */
export function IsOrderFilter(
  ...decorators: PropertyDecorator[]
): PropertyDecorator {
  return applyDecorators(IgnoreIfUndefined, IsIn(ORDER_VALUES), ...decorators);
}
