import { Knex } from 'knex';

export async function seed(knex: Knex): Promise<void> {
  // Delete existing entries
  await knex('payments').del();
  await knex('contracts').del();

  // Insert contracts first
  const contracts = [
    // Contract for completed anniversary session
    {
      id: 'aa0e8400-e29b-41d4-a716-446655440001',
      session_id: '770e8400-e29b-41d4-a716-446655440002',
      photographer_id: '550e8400-e29b-41d4-a716-446655440001',
      client_id: '660e8400-e29b-41d4-a716-446655440002',
      title: 'Anniversary Portrait Session Agreement',
      content: `This agreement is between Jane Smith Photography and Robert & Mary Brown for a 2-hour anniversary portrait session.

SERVICES PROVIDED:
- 2 hour portrait session at Golden Gate Park
- Professional editing of selected images
- Online gallery with download rights
- 25 high-resolution edited images

DELIVERABLES:
- Images delivered within 2 weeks of session
- Online gallery access for 6 months
- Print release included

CLIENT RESPONSIBILITIES:
- Arrive on time and prepared
- Follow photographer's direction
- Payment due before session date`,
      terms_and_conditions: `Payment is due in full before the session date. Cancellations within 48 hours are subject to 50% cancellation fee. Weather-related rescheduling is complimentary. Copyright remains with photographer, but print release is included.`,
      price: 450.00,
      currency: 'USD',
      status: 'signed',
      sent_at: new Date('2024-01-19T10:00:00Z'),
      signed_at: new Date('2024-01-22T14:30:00Z'),
      expires_at: new Date('2024-03-19T23:59:59Z'),
      signed_by_client_name: 'Robert Brown',
      signed_by_client_ip: '192.168.1.100',
      tenant_id: '550e8400-e29b-41d4-a716-446655440001',
      created_at: new Date('2024-01-19T09:30:00Z'),
      updated_at: new Date('2024-01-22T14:30:00Z'),
    },
    // Contract for completed headshots session
    {
      id: 'aa0e8400-e29b-41d4-a716-446655440002',
      session_id: '770e8400-e29b-41d4-a716-446655440004',
      photographer_id: '550e8400-e29b-41d4-a716-446655440002',
      client_id: '660e8400-e29b-41d4-a716-446655440004',
      title: 'Corporate Headshots Agreement',
      content: `This agreement is between Mike Johnson Studios and TechCorp for executive team headshots.

SERVICES PROVIDED:
- On-location headshot photography for 15 executives
- Professional studio lighting setup
- Same-day preview and selection
- Professional retouching of selected images
- High-resolution files delivered

DELIVERABLES:
- 2-3 retouched headshots per person
- Images delivered within 1 week
- Commercial usage rights included
- Multiple format options (web, print, LinkedIn)

USAGE RIGHTS:
- Corporate use for website, marketing, and internal materials
- Individual use for professional profiles and LinkedIn`,
      terms_and_conditions: `Payment terms: 50% deposit required to book, balance due within 30 days of delivery. Commercial usage rights included. Images may be used by photographer for portfolio purposes with client approval.`,
      price: 1800.00,
      currency: 'USD',
      status: 'signed',
      sent_at: new Date('2024-01-26T11:00:00Z'),
      signed_at: new Date('2024-01-29T16:45:00Z'),
      expires_at: new Date('2024-02-25T23:59:59Z'),
      signed_by_client_name: 'David Miller',
      signed_by_client_ip: '10.0.0.15',
      tenant_id: '550e8400-e29b-41d4-a716-446655440002',
      created_at: new Date('2024-01-26T10:30:00Z'),
      updated_at: new Date('2024-01-29T16:45:00Z'),
    },
    // Contract for upcoming wedding
    {
      id: 'aa0e8400-e29b-41d4-a716-446655440003',
      session_id: '770e8400-e29b-41d4-a716-446655440001',
      photographer_id: '550e8400-e29b-41d4-a716-446655440001',
      client_id: '660e8400-e29b-41d4-a716-446655440001',
      title: 'Wedding Photography Agreement',
      content: `This agreement is between Jane Smith Photography and Emily Davis for wedding photography services.

SERVICES PROVIDED:
- 8 hours of wedding day coverage
- Ceremony and reception photography
- Getting ready photos for bride
- Family and bridal party portraits
- Reception candids and formal shots
- Professional editing and color correction

DELIVERABLES:
- 400+ edited high-resolution images
- Online gallery with download rights
- USB drive with all images
- Print release for personal use
- Images delivered within 4 weeks

TIMELINE:
- Getting ready: 10:00 AM
- Ceremony: 2:00 PM
- Reception: 6:00 PM - 10:00 PM`,
      terms_and_conditions: `Payment schedule: $1000 deposit to book, $1250 due 30 days before wedding, $1250 due on wedding day. Cancellation policy: deposits are non-refundable. Weather contingency plans will be discussed. Overtime rates apply for coverage beyond 8 hours.`,
      price: 3500.00,
      currency: 'USD',
      status: 'signed',
      sent_at: new Date('2024-01-17T14:00:00Z'),
      signed_at: new Date('2024-01-20T11:30:00Z'),
      expires_at: new Date('2024-06-14T23:59:59Z'),
      signed_by_client_name: 'Emily Davis',
      signed_by_client_ip: '203.0.113.42',
      tenant_id: '550e8400-e29b-41d4-a716-446655440001',
      created_at: new Date('2024-01-17T13:30:00Z'),
      updated_at: new Date('2024-01-20T11:30:00Z'),
    },
  ];

  await knex('contracts').insert(contracts);

  // Insert payments
  const payments = [
    // Completed payment for anniversary session
    {
      id: 'bb0e8400-e29b-41d4-a716-446655440001',
      session_id: '770e8400-e29b-41d4-a716-446655440002',
      photographer_id: '550e8400-e29b-41d4-a716-446655440001',
      client_id: '660e8400-e29b-41d4-a716-446655440002',
      amount: 450.00,
      currency: 'USD',
      payment_method: 'stripe',
      payment_intent_id: 'pi_1aBcDe2FgHiJkLmN',
      status: 'completed',
      paid_at: new Date('2024-01-25T09:15:00Z'),
      description: 'Anniversary Portrait Session - Full Payment',
      metadata: {
        stripe_charge_id: 'ch_1aBcDe2FgHiJkLmN',
        stripe_customer_id: 'cus_aBcDeFgHiJkLmN',
        payment_method_type: 'card',
        last4: '4242'
      },
      tenant_id: '550e8400-e29b-41d4-a716-446655440001',
      created_at: new Date('2024-01-25T09:15:00Z'),
      updated_at: new Date('2024-01-25T09:15:00Z'),
    },
    // Partial payments for headshots session
    {
      id: 'bb0e8400-e29b-41d4-a716-446655440002',
      session_id: '770e8400-e29b-41d4-a716-446655440004',
      photographer_id: '550e8400-e29b-41d4-a716-446655440002',
      client_id: '660e8400-e29b-41d4-a716-446655440004',
      amount: 900.00,
      currency: 'USD',
      payment_method: 'stripe',
      payment_intent_id: 'pi_2CdEfG3HiJkLmNoP',
      status: 'completed',
      paid_at: new Date('2024-01-30T14:20:00Z'),
      description: 'Corporate Headshots - 50% Deposit',
      metadata: {
        stripe_charge_id: 'ch_2CdEfG3HiJkLmNoP',
        stripe_customer_id: 'cus_CdEfGhIjKlMnOp',
        payment_method_type: 'card',
        last4: '5555'
      },
      tenant_id: '550e8400-e29b-41d4-a716-446655440002',
      created_at: new Date('2024-01-30T14:20:00Z'),
      updated_at: new Date('2024-01-30T14:20:00Z'),
    },
    {
      id: 'bb0e8400-e29b-41d4-a716-446655440003',
      session_id: '770e8400-e29b-41d4-a716-446655440004',
      photographer_id: '550e8400-e29b-41d4-a716-446655440002',
      client_id: '660e8400-e29b-41d4-a716-446655440004',
      amount: 900.00,
      currency: 'USD',
      payment_method: 'stripe',
      payment_intent_id: 'pi_3EfGhI4JkLmNoPqR',
      status: 'completed',
      paid_at: new Date('2024-03-15T11:30:00Z'),
      description: 'Corporate Headshots - Final Payment',
      metadata: {
        stripe_charge_id: 'ch_3EfGhI4JkLmNoPqR',
        stripe_customer_id: 'cus_CdEfGhIjKlMnOp',
        payment_method_type: 'card',
        last4: '5555'
      },
      tenant_id: '550e8400-e29b-41d4-a716-446655440002',
      created_at: new Date('2024-03-15T11:30:00Z'),
      updated_at: new Date('2024-03-15T11:30:00Z'),
    },
    // Wedding payments (deposit and scheduled payments)
    {
      id: 'bb0e8400-e29b-41d4-a716-446655440004',
      session_id: '770e8400-e29b-41d4-a716-446655440001',
      photographer_id: '550e8400-e29b-41d4-a716-446655440001',
      client_id: '660e8400-e29b-41d4-a716-446655440001',
      amount: 1000.00,
      currency: 'USD',
      payment_method: 'stripe',
      payment_intent_id: 'pi_4GhIjK5LmNoPqRsT',
      status: 'completed',
      paid_at: new Date('2024-01-21T16:45:00Z'),
      description: 'Wedding Photography - Booking Deposit',
      metadata: {
        stripe_charge_id: 'ch_4GhIjK5LmNoPqRsT',
        stripe_customer_id: 'cus_EfGhIjKlMnOpQr',
        payment_method_type: 'card',
        last4: '1234'
      },
      tenant_id: '550e8400-e29b-41d4-a716-446655440001',
      created_at: new Date('2024-01-21T16:45:00Z'),
      updated_at: new Date('2024-01-21T16:45:00Z'),
    },
    // Maternity session payment
    {
      id: 'bb0e8400-e29b-41d4-a716-446655440005',
      session_id: '770e8400-e29b-41d4-a716-446655440006',
      photographer_id: '550e8400-e29b-41d4-a716-446655440003',
      client_id: '660e8400-e29b-41d4-a716-446655440006',
      amount: 400.00,
      currency: 'USD',
      payment_method: 'stripe',
      payment_intent_id: 'pi_5IjKlM6NoPqRsTuV',
      status: 'completed',
      paid_at: new Date('2024-02-15T13:00:00Z'),
      description: 'Maternity Photography Session',
      metadata: {
        stripe_charge_id: 'ch_5IjKlM6NoPqRsTuV',
        stripe_customer_id: 'cus_GhIjKlMnOpQrSt',
        payment_method_type: 'card',
        last4: '9876'
      },
      tenant_id: '550e8400-e29b-41d4-a716-446655440003',
      created_at: new Date('2024-02-15T13:00:00Z'),
      updated_at: new Date('2024-02-15T13:00:00Z'),
    },
    // Pending payment for upcoming event
    {
      id: 'bb0e8400-e29b-41d4-a716-446655440006',
      session_id: '770e8400-e29b-41d4-a716-446655440005',
      photographer_id: '550e8400-e29b-41d4-a716-446655440002',
      client_id: '660e8400-e29b-41d4-a716-446655440005',
      amount: 600.00,
      currency: 'USD',
      payment_method: 'stripe',
      payment_intent_id: 'pi_6KlMnO7PqRsTuVwX',
      status: 'pending',
      paid_at: null,
      description: 'Product Launch Event Photography - Deposit',
      metadata: {
        payment_method_type: 'card',
        last4: '4321'
      },
      tenant_id: '550e8400-e29b-41d4-a716-446655440002',
      created_at: new Date('2024-02-10T10:30:00Z'),
      updated_at: new Date('2024-02-10T10:30:00Z'),
    },
  ];

  await knex('payments').insert(payments);
}