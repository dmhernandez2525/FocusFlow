import { Type, Static } from '@sinclair/typebox';
import { TimestampSchema, SuccessResponseSchema } from './common';

// Webhook Event Schema
export const WebhookEventResponseSchema = Type.Object({
  id: Type.String(),
  type: Type.String(),
  processed: Type.Boolean(),
  processed_at: Type.Union([TimestampSchema, Type.Null()]),
  created_at: TimestampSchema
});

// Webhook processing response
export const WebhookProcessResponseSchema = SuccessResponseSchema(Type.Object({
  event_id: Type.String(),
  processed: Type.Boolean(),
  message: Type.String()
}));

// Stripe webhook event types we handle
export const SupportedWebhookEventsSchema = Type.Union([
  Type.Literal('payment_intent.succeeded'),
  Type.Literal('payment_intent.payment_failed'),
  Type.Literal('payment_intent.canceled'),
  Type.Literal('payment_intent.requires_action'),
  Type.Literal('customer.created'),
  Type.Literal('customer.updated'),
  Type.Literal('customer.deleted'),
  Type.Literal('invoice.payment_succeeded'),
  Type.Literal('invoice.payment_failed'),
  Type.Literal('customer.subscription.created'),
  Type.Literal('customer.subscription.updated'),
  Type.Literal('customer.subscription.deleted'),
  Type.Literal('customer.subscription.trial_will_end')
]);

// Headers for webhook requests
export const WebhookHeaderSchema = Type.Object({
  'stripe-signature': Type.String({
    description: 'Stripe webhook signature for verification'
  })
});

// Types
export type WebhookEventResponse = Static<typeof WebhookEventResponseSchema>;
export type SupportedWebhookEvents = Static<typeof SupportedWebhookEventsSchema>;
export type WebhookHeader = Static<typeof WebhookHeaderSchema>;