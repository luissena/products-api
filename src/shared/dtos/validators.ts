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

export const IgnoreIfUndefined: PropertyDecorator = ValidateIf(
  (_object, value) => value !== undefined,
);

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

export function IsTextFilter(
  ...decorators: PropertyDecorator[]
): PropertyDecorator {
  return applyDecorators(IgnoreIfUndefined, IsString(), ...decorators);
}

export function IsIntFilter(
  ...decorators: PropertyDecorator[]
): PropertyDecorator {
  return applyDecorators(IgnoreIfUndefined, IsInt(), ...decorators);
}

export function IsDateFilter(
  ...decorators: PropertyDecorator[]
): PropertyDecorator {
  return applyDecorators(IgnoreIfUndefined, IsDateString(), ...decorators);
}

export function IsOrderFilter(
  ...decorators: PropertyDecorator[]
): PropertyDecorator {
  return applyDecorators(IgnoreIfUndefined, IsIn(ORDER_VALUES), ...decorators);
}
