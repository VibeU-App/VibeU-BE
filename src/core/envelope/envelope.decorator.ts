import { applyDecorators, Type } from '@nestjs/common';
import { ApiExtraModels, ApiResponse, getSchemaPath } from '@nestjs/swagger';
import { Envelope } from './envelope.interface';
import { ApiProperty } from '@nestjs/swagger';

/**
 * Concrete DTO class for Swagger to document the envelope structure.
 */
export class BaseEnvelopeDto<T> implements Envelope<T> {
  @ApiProperty({ example: 200 })
  statusCode: number;

  @ApiProperty({ example: 'Success' })
  message: string;

  data: T;

  @ApiProperty({ example: null, nullable: true })
  metadata: any;
}

/**
 * Swagger helper for successful requests (200 OK) returning data.
 */
export const ApiOkResponseEnvelope = <TModel extends Type<any>>(
  model: TModel,
  options?: { description?: string },
) => {
  return applyDecorators(
    ApiExtraModels(BaseEnvelopeDto, model),
    ApiResponse({
      status: 200,
      description: options?.description ?? 'Success',
      schema: {
        allOf: [
          { $ref: getSchemaPath(BaseEnvelopeDto) },
          {
            properties: {
              data: { $ref: getSchemaPath(model) },
            },
          },
        ],
      },
    }),
  );
};

/**
 * Swagger helper for successful requests (200 OK) returning data: null.
 */
export const ApiOkResponseEnvelopeNull = (options?: {
  description?: string;
}) => {
  return applyDecorators(
    ApiExtraModels(BaseEnvelopeDto),
    ApiResponse({
      status: 200,
      description: options?.description ?? 'Success',
      schema: {
        allOf: [
          { $ref: getSchemaPath(BaseEnvelopeDto) },
          {
            properties: {
              data: { type: 'object', default: null, nullable: true },
            },
          },
        ],
      },
    }),
  );
};

/**
 * Swagger helper for created requests (201 Created) returning data.
 */
export const ApiCreatedResponseEnvelope = <TModel extends Type<any>>(
  model: TModel,
  options?: { description?: string },
) => {
  return applyDecorators(
    ApiExtraModels(BaseEnvelopeDto, model),
    ApiResponse({
      status: 201,
      description: options?.description ?? 'Created successfully',
      schema: {
        allOf: [
          { $ref: getSchemaPath(BaseEnvelopeDto) },
          {
            properties: {
              data: { $ref: getSchemaPath(model) },
            },
          },
        ],
      },
    }),
  );
};

/**
 * Swagger helper for created requests (201 Created) returning data: null.
 */
export const ApiCreatedResponseEnvelopeNull = (options?: {
  description?: string;
}) => {
  return applyDecorators(
    ApiExtraModels(BaseEnvelopeDto),
    ApiResponse({
      status: 201,
      description: options?.description ?? 'Created successfully',
      schema: {
        allOf: [
          { $ref: getSchemaPath(BaseEnvelopeDto) },
          {
            properties: {
              data: { type: 'object', default: null, nullable: true },
            },
          },
        ],
      },
    }),
  );
};
