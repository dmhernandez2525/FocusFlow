import { Type, Static } from '@sinclair/typebox';
import { UUIDSchema, MetadataSchema, TimestampSchema, SuccessResponseSchema, PaginationQuerySchema, PaginationResponseSchema } from './common';

// Create Customer Schema
export const CreateCustomerBodySchema = Type.Object({
  email: Type.String({
    format: 'email',
    description: 'Customer email address'
  }),
  name: Type.Optional(Type.String({
    minLength: 1,
    maxLength: 255,
    description: 'Customer full name'
  })),
  phone: Type.Optional(Type.String({
    pattern: '^\\+[1-9]\\d{1,14}$',
    description: 'Customer phone number in E.164 format'
  })),
  metadata: Type.Optional(MetadataSchema)
});

// Update Customer Schema
export const UpdateCustomerBodySchema = Type.Object({
  email: Type.Optional(Type.String({ format: 'email' })),
  name: Type.Optional(Type.String({
    minLength: 1,
    maxLength: 255
  })),
  phone: Type.Optional(Type.String({
    pattern: '^\\+[1-9]\\d{1,14}$'
  })),
  metadata: Type.Optional(MetadataSchema)
});

// Customer Response Schema
export const CustomerResponseSchema = Type.Object({
  id: UUIDSchema,
  stripe_customer_id: Type.String(),
  email: Type.String(),
  name: Type.Union([Type.String(), Type.Null()]),
  phone: Type.Union([Type.String(), Type.Null()]),
  metadata: MetadataSchema,
  created_at: TimestampSchema,
  updated_at: TimestampSchema
});

// Query schemas
export const CustomerParamsSchema = Type.Object({
  id: UUIDSchema
});

export const CustomerQuerySchema = Type.Intersect([
  PaginationQuerySchema,
  Type.Object({
    email: Type.Optional(Type.String({ format: 'email' })),
    created_after: Type.Optional(Type.String({ format: 'date-time' })),
    created_before: Type.Optional(Type.String({ format: 'date-time' }))
  })
]);

// Response schemas
export const CreateCustomerResponseSchema = SuccessResponseSchema(CustomerResponseSchema);
export const GetCustomerResponseSchema = SuccessResponseSchema(CustomerResponseSchema);
export const UpdateCustomerResponseSchema = SuccessResponseSchema(CustomerResponseSchema);
export const ListCustomersResponseSchema = SuccessResponseSchema(Type.Object({
  customers: Type.Array(CustomerResponseSchema),
  pagination: PaginationResponseSchema
}));

// Types
export type CreateCustomerBody = Static<typeof CreateCustomerBodySchema>;
export type UpdateCustomerBody = Static<typeof UpdateCustomerBodySchema>;
export type CustomerResponse = Static<typeof CustomerResponseSchema>;
export type CustomerParams = Static<typeof CustomerParamsSchema>;
export type CustomerQuery = Static<typeof CustomerQuerySchema>;