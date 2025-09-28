import { Type, Static } from '@sinclair/typebox';
import { UUIDSchema, MetadataSchema, TimestampSchema, SuccessResponseSchema, PaginationQuerySchema, PaginationResponseSchema } from './common';

// Subscription Status Schema
export const SubscriptionStatusSchema = Type.Union([
  Type.Literal('incomplete'),
  Type.Literal('incomplete_expired'),
  Type.Literal('trialing'),
  Type.Literal('active'),
  Type.Literal('past_due'),
  Type.Literal('canceled'),
  Type.Literal('unpaid'),
  Type.Literal('paused')
]);

// Create Subscription Schema
export const CreateSubscriptionBodySchema = Type.Object({
  customer_id: UUIDSchema,
  price_id: Type.String({
    description: 'Stripe price ID'
  }),
  payment_method_id: Type.Optional(Type.String()),
  trial_period_days: Type.Optional(Type.Integer({ minimum: 0, maximum: 730 })),
  proration_behavior: Type.Optional(Type.Union([
    Type.Literal('create_prorations'),
    Type.Literal('none'),
    Type.Literal('always_invoice')
  ], { default: 'create_prorations' })),
  metadata: Type.Optional(MetadataSchema)
});

// Update Subscription Schema
export const UpdateSubscriptionBodySchema = Type.Object({
  price_id: Type.Optional(Type.String()),
  proration_behavior: Type.Optional(Type.Union([
    Type.Literal('create_prorations'),
    Type.Literal('none'),
    Type.Literal('always_invoice')
  ])),
  metadata: Type.Optional(MetadataSchema)
});

// Cancel Subscription Schema
export const CancelSubscriptionBodySchema = Type.Object({
  cancel_at_period_end: Type.Optional(Type.Boolean({ default: true })),
  cancellation_details: Type.Optional(Type.Object({
    comment: Type.Optional(Type.String({ maxLength: 500 })),
    feedback: Type.Optional(Type.Union([
      Type.Literal('too_expensive'),
      Type.Literal('missing_features'),
      Type.Literal('switched_service'),
      Type.Literal('unused'),
      Type.Literal('customer_service'),
      Type.Literal('too_complex'),
      Type.Literal('low_quality'),
      Type.Literal('other')
    ]))
  }))
});

// Subscription Response Schema
export const SubscriptionResponseSchema = Type.Object({
  id: UUIDSchema,
  stripe_subscription_id: Type.String(),
  customer_id: UUIDSchema,
  status: SubscriptionStatusSchema,
  current_period_start: TimestampSchema,
  current_period_end: TimestampSchema,
  plan_id: Type.String(),
  cancel_at_period_end: Type.Boolean(),
  canceled_at: Type.Union([TimestampSchema, Type.Null()]),
  trial_start: Type.Union([TimestampSchema, Type.Null()]),
  trial_end: Type.Union([TimestampSchema, Type.Null()]),
  metadata: MetadataSchema,
  created_at: TimestampSchema,
  updated_at: TimestampSchema
});

// Query schemas
export const SubscriptionParamsSchema = Type.Object({
  id: UUIDSchema
});

export const SubscriptionQuerySchema = Type.Intersect([
  PaginationQuerySchema,
  Type.Object({
    status: Type.Optional(SubscriptionStatusSchema),
    customer_id: Type.Optional(UUIDSchema),
    plan_id: Type.Optional(Type.String()),
    created_after: Type.Optional(Type.String({ format: 'date-time' })),
    created_before: Type.Optional(Type.String({ format: 'date-time' }))
  })
]);

// Response schemas
export const CreateSubscriptionResponseSchema = SuccessResponseSchema(SubscriptionResponseSchema);
export const GetSubscriptionResponseSchema = SuccessResponseSchema(SubscriptionResponseSchema);
export const UpdateSubscriptionResponseSchema = SuccessResponseSchema(SubscriptionResponseSchema);
export const CancelSubscriptionResponseSchema = SuccessResponseSchema(SubscriptionResponseSchema);
export const ListSubscriptionsResponseSchema = SuccessResponseSchema(Type.Object({
  subscriptions: Type.Array(SubscriptionResponseSchema),
  pagination: PaginationResponseSchema
}));

// Types
export type CreateSubscriptionBody = Static<typeof CreateSubscriptionBodySchema>;
export type UpdateSubscriptionBody = Static<typeof UpdateSubscriptionBodySchema>;
export type CancelSubscriptionBody = Static<typeof CancelSubscriptionBodySchema>;
export type SubscriptionResponse = Static<typeof SubscriptionResponseSchema>;
export type SubscriptionParams = Static<typeof SubscriptionParamsSchema>;
export type SubscriptionQuery = Static<typeof SubscriptionQuerySchema>;