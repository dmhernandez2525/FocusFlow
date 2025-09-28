import { Type, Static } from '@sinclair/typebox';

// Common types
export const UUIDSchema = Type.String({
  format: 'uuid',
  description: 'UUID v4 identifier'
});

export const CurrencySchema = Type.String({
  pattern: '^[A-Z]{3}$',
  description: 'ISO 4217 currency code (e.g., USD, EUR)'
});

export const AmountSchema = Type.Integer({
  minimum: 1,
  maximum: 99999999,
  description: 'Amount in smallest currency unit (e.g., cents for USD)'
});

export const MetadataSchema = Type.Record(Type.String(), Type.String(), {
  description: 'Key-value pairs for storing additional information'
});

export const TimestampSchema = Type.String({
  format: 'date-time',
  description: 'ISO 8601 timestamp'
});

// Error response schemas
export const ErrorResponseSchema = Type.Object({
  error: Type.Object({
    type: Type.String(),
    message: Type.String(),
    code: Type.Optional(Type.String()),
    details: Type.Optional(Type.Unknown())
  }),
  timestamp: TimestampSchema,
  path: Type.String(),
  requestId: Type.String()
});

export const ValidationErrorResponseSchema = Type.Object({
  error: Type.Object({
    type: Type.Literal('validation_error'),
    message: Type.String(),
    validation: Type.Array(Type.Object({
      instancePath: Type.String(),
      schemaPath: Type.String(),
      keyword: Type.String(),
      params: Type.Record(Type.String(), Type.Unknown()),
      message: Type.String()
    }))
  }),
  timestamp: TimestampSchema,
  path: Type.String(),
  requestId: Type.String()
});

// Success response wrapper
export const SuccessResponseSchema = <T extends Record<string, unknown>>(dataSchema: T) =>
  Type.Object({
    data: dataSchema,
    timestamp: TimestampSchema,
    requestId: Type.String()
  });

// Pagination schemas
export const PaginationQuerySchema = Type.Object({
  page: Type.Optional(Type.Integer({ minimum: 1, default: 1 })),
  limit: Type.Optional(Type.Integer({ minimum: 1, maximum: 100, default: 20 })),
  sort: Type.Optional(Type.String({ default: 'created_at' })),
  order: Type.Optional(Type.Union([Type.Literal('asc'), Type.Literal('desc')], { default: 'desc' }))
});

export const PaginationResponseSchema = Type.Object({
  page: Type.Integer(),
  limit: Type.Integer(),
  total: Type.Integer(),
  totalPages: Type.Integer(),
  hasNext: Type.Boolean(),
  hasPrev: Type.Boolean()
});

export type ErrorResponse = Static<typeof ErrorResponseSchema>;
export type ValidationErrorResponse = Static<typeof ValidationErrorResponseSchema>;
export type PaginationQuery = Static<typeof PaginationQuerySchema>;
export type PaginationResponse = Static<typeof PaginationResponseSchema>;