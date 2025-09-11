import { applyDecorators } from '@nestjs/common';
import { Transform } from 'class-transformer';
import {
  IsDateString,
  IsIn,
  IsInt,
  IsNumber,
  IsString,
  ValidateIf,
  ValidationArguments,
  ValidationOptions,
  registerDecorator,
} from 'class-validator';
import { ORDER_VALUES } from '../constants';

export const IgnoreIfUndefined = ValidateIf(
  (_object, value) => value !== undefined,
);

export function IsNumberFilter(
  ...decorators: Array<ClassDecorator | MethodDecorator | PropertyDecorator>
) {
  return applyDecorators(
    IgnoreIfUndefined,
    IsNumber(),
    Transform((params) => parseInt(params.value)),
    ...decorators,
  );
}

export function IsTextFilter(
  ...decorators: Array<ClassDecorator | MethodDecorator | PropertyDecorator>
) {
  return applyDecorators(IgnoreIfUndefined, IsString(), ...decorators);
}

export function IsIntFilter(
  ...decorators: Array<ClassDecorator | MethodDecorator | PropertyDecorator>
) {
  return applyDecorators(IgnoreIfUndefined, IsInt(), ...decorators);
}

export function IsDateFilter(
  ...decorators: Array<ClassDecorator | MethodDecorator | PropertyDecorator>
) {
  return applyDecorators(IgnoreIfUndefined, IsDateString(), ...decorators);
}

export function IsOrderFilter(
  ...decorators: Array<ClassDecorator | MethodDecorator | PropertyDecorator>
) {
  return applyDecorators(IgnoreIfUndefined, IsIn(ORDER_VALUES), ...decorators);
}

export function IsGreaterThanDate(
  property: string,
  validationOptions?: ValidationOptions,
) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      name: 'IsGreaterThanDate',
      target: object.constructor,
      propertyName: propertyName,
      constraints: [property],
      options: validationOptions,
      validator: {
        validate(value: any, args: ValidationArguments) {
          const [relatedPropertyName] = args.constraints;
          const relatedValue = args.object[relatedPropertyName];

          return new Date(value) > new Date(relatedValue);
        },
      },
    });
  };
}

export function IsLessThanDate(
  property: string,
  validationOptions?: ValidationOptions,
) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      name: 'IsLessThanDate',
      target: object.constructor,
      propertyName: propertyName,
      constraints: [property],
      options: validationOptions,
      validator: {
        validate(value: any, args: ValidationArguments) {
          const [relatedPropertyName] = args.constraints;
          const relatedValue = args.object[relatedPropertyName];

          return new Date(value) < new Date(relatedValue);
        },
      },
    });
  };
}
