import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable('contracts', (table) => {
    // Primary key
    table.uuid('id').primary().defaultTo(knex.raw('uuid_generate_v4()'));

    // Foreign keys
    table.uuid('session_id').notNullable().references('id').inTable('sessions').onDelete('CASCADE');
    table.uuid('photographer_id').notNullable().references('id').inTable('photographers').onDelete('CASCADE');
    table.uuid('client_id').notNullable().references('id').inTable('clients').onDelete('CASCADE');

    // Contract details
    table.string('title', 255).notNullable();
    table.text('content').notNullable(); // Contract body/terms
    table.text('terms_and_conditions').notNullable();

    // Pricing
    table.decimal('price', 10, 2).notNullable();
    table.string('currency', 3).notNullable().defaultTo('USD');

    // Status and workflow
    table.enum('status', ['draft', 'sent', 'signed', 'completed', 'cancelled'])
          .defaultTo('draft').notNullable();
    table.timestamptz('sent_at').nullable();
    table.timestamptz('signed_at').nullable();
    table.timestamptz('expires_at').nullable();

    // Digital signature tracking
    table.string('signed_by_client_name', 255).nullable();
    table.string('signed_by_client_ip', 45).nullable(); // IPv6 compatible

    // Multi-tenancy
    table.uuid('tenant_id').notNullable();

    // Timestamps
    table.timestamps(true, true, true);

    // Indexes
    table.index(['session_id'], 'idx_contracts_session_id');
    table.index(['photographer_id'], 'idx_contracts_photographer_id');
    table.index(['client_id'], 'idx_contracts_client_id');
    table.index(['status'], 'idx_contracts_status');
    table.index(['sent_at'], 'idx_contracts_sent_at');
    table.index(['signed_at'], 'idx_contracts_signed_at');
    table.index(['expires_at'], 'idx_contracts_expires_at');
    table.index(['tenant_id'], 'idx_contracts_tenant_id');
    table.index(['created_at'], 'idx_contracts_created_at');

    // Composite indexes for common queries
    table.index(['photographer_id', 'status'], 'idx_contracts_photographer_status');
    table.index(['session_id', 'status'], 'idx_contracts_session_status');
    table.index(['client_id', 'status'], 'idx_contracts_client_status');

    // Unique constraint - one active contract per session
    table.unique(['session_id'], 'unique_contracts_session_id');
  });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTableIfExists('contracts');
}