import { Type, Static } from '@sinclair/typebox';
import { UUIDSchema, CurrencySchema, AmountSchema, MetadataSchema, TimestampSchema, SuccessResponseSchema, PaginationQuerySchema, PaginationResponseSchema } from './common';

// Payment Intent Schemas
export const PaymentIntentStatusSchema = Type.Union([
  Type.Literal('requires_payment_method'),
  Type.Literal('requires_confirmation'),
  Type.Literal('requires_action'),
  Type.Literal('processing'),
  Type.Literal('requires_capture'),
  Type.Literal('canceled'),
  Type.Literal('succeeded')
]);

export const CreatePaymentIntentBodySchema = Type.Object({
  amount: AmountSchema,
  currency: CurrencySchema,
  customer_id: Type.Optional(UUIDSchema),
  payment_method_id: Type.Optional(Type.String()),
  confirm: Type.Optional(Type.Boolean({ default: false })),
  capture_method: Type.Optional(Type.Union([
    Type.Literal('automatic'),
    Type.Literal('manual')
  ], { default: 'automatic' })),
  metadata: Type.Optional(MetadataSchema)
});

export const PaymentIntentResponseSchema = Type.Object({
  id: UUIDSchema,
  stripe_payment_intent_id: Type.String(),
  amount: AmountSchema,
  currency: CurrencySchema,
  status: PaymentIntentStatusSchema,
  customer_id: Type.Union([UUIDSchema, Type.Null()]),
  client_secret: Type.Optional(Type.String()),
  metadata: MetadataSchema,
  created_at: TimestampSchema,
  updated_at: TimestampSchema
});

export const UpdatePaymentIntentBodySchema = Type.Object({
  amount: Type.Optional(AmountSchema),
  metadata: Type.Optional(MetadataSchema)
});

export const ConfirmPaymentIntentBodySchema = Type.Object({
  payment_method_id: Type.Optional(Type.String()),
  return_url: Type.Optional(Type.String({ format: 'uri' }))
});

export const CancelPaymentIntentBodySchema = Type.Object({
  cancellation_reason: Type.Optional(Type.Union([
    Type.Literal('duplicate'),
    Type.Literal('fraudulent'),
    Type.Literal('requested_by_customer'),
    Type.Literal('abandoned')
  ]))
});

export const CapturePaymentIntentBodySchema = Type.Object({
  amount_to_capture: Type.Optional(AmountSchema)
});

// Query schemas
export const PaymentIntentParamsSchema = Type.Object({
  id: UUIDSchema
});

export const PaymentIntentQuerySchema = Type.Intersect([
  PaginationQuerySchema,
  Type.Object({
    status: Type.Optional(PaymentIntentStatusSchema),
    customer_id: Type.Optional(UUIDSchema),
    currency: Type.Optional(CurrencySchema),
    amount_gte: Type.Optional(AmountSchema),
    amount_lte: Type.Optional(AmountSchema),
    created_after: Type.Optional(Type.String({ format: 'date-time' })),
    created_before: Type.Optional(Type.String({ format: 'date-time' }))
  })
]);

// Response schemas
export const CreatePaymentIntentResponseSchema = SuccessResponseSchema(PaymentIntentResponseSchema);
export const GetPaymentIntentResponseSchema = SuccessResponseSchema(PaymentIntentResponseSchema);
export const UpdatePaymentIntentResponseSchema = SuccessResponseSchema(PaymentIntentResponseSchema);
export const ListPaymentIntentsResponseSchema = SuccessResponseSchema(Type.Object({
  payment_intents: Type.Array(PaymentIntentResponseSchema),
  pagination: PaginationResponseSchema
}));

// Headers
export const IdempotencyHeaderSchema = Type.Object({
  'idempotency-key': Type.String({
    minLength: 1,
    maxLength: 255,
    description: 'Unique key to ensure idempotent requests'
  })
});

// Types
export type CreatePaymentIntentBody = Static<typeof CreatePaymentIntentBodySchema>;
export type UpdatePaymentIntentBody = Static<typeof UpdatePaymentIntentBodySchema>;
export type ConfirmPaymentIntentBody = Static<typeof ConfirmPaymentIntentBodySchema>;
export type CancelPaymentIntentBody = Static<typeof CancelPaymentIntentBodySchema>;
export type CapturePaymentIntentBody = Static<typeof CapturePaymentIntentBodySchema>;
export type PaymentIntentResponse = Static<typeof PaymentIntentResponseSchema>;
export type PaymentIntentParams = Static<typeof PaymentIntentParamsSchema>;
export type PaymentIntentQuery = Static<typeof PaymentIntentQuerySchema>;
export type IdempotencyHeader = Static<typeof IdempotencyHeaderSchema>;