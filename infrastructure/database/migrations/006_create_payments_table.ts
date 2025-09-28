import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable('payments', (table) => {
    // Primary key
    table.uuid('id').primary().defaultTo(knex.raw('uuid_generate_v4()'));

    // Foreign keys
    table.uuid('session_id').notNullable().references('id').inTable('sessions').onDelete('CASCADE');
    table.uuid('photographer_id').notNullable().references('id').inTable('photographers').onDelete('CASCADE');
    table.uuid('client_id').notNullable().references('id').inTable('clients').onDelete('CASCADE');

    // Payment details
    table.decimal('amount', 10, 2).notNullable();
    table.string('currency', 3).notNullable().defaultTo('USD');
    table.enum('payment_method', ['stripe', 'paypal', 'bank_transfer', 'cash', 'check']).notNullable();

    // External payment system integration
    table.string('payment_intent_id', 255).nullable(); // Stripe PaymentIntent ID or similar

    // Status and timing
    table.enum('status', ['pending', 'processing', 'completed', 'failed', 'cancelled', 'refunded'])
          .defaultTo('pending').notNullable();
    table.timestamptz('paid_at').nullable();

    // Additional information
    table.string('description', 500).nullable();
    table.jsonb('metadata').nullable(); // Store additional payment gateway data

    // Multi-tenancy
    table.uuid('tenant_id').notNullable();

    // Timestamps
    table.timestamps(true, true, true);

    // Indexes
    table.index(['session_id'], 'idx_payments_session_id');
    table.index(['photographer_id'], 'idx_payments_photographer_id');
    table.index(['client_id'], 'idx_payments_client_id');
    table.index(['status'], 'idx_payments_status');
    table.index(['payment_method'], 'idx_payments_payment_method');
    table.index(['payment_intent_id'], 'idx_payments_payment_intent_id');
    table.index(['paid_at'], 'idx_payments_paid_at');
    table.index(['tenant_id'], 'idx_payments_tenant_id');
    table.index(['created_at'], 'idx_payments_created_at');

    // Composite indexes for common queries
    table.index(['photographer_id', 'status'], 'idx_payments_photographer_status');
    table.index(['session_id', 'status'], 'idx_payments_session_status');
    table.index(['client_id', 'status'], 'idx_payments_client_status');
  });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTableIfExists('payments');
}