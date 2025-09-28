import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable('sessions', (table) => {
    // Primary key
    table.uuid('id').primary().defaultTo(knex.raw('uuid_generate_v4()'));

    // Foreign keys
    table.uuid('photographer_id').notNullable().references('id').inTable('photographers').onDelete('CASCADE');
    table.uuid('client_id').notNullable().references('id').inTable('clients').onDelete('CASCADE');

    // Session details
    table.enum('session_type', ['wedding', 'portrait', 'event', 'commercial', 'other']).notNullable();
    table.string('title', 255).notNullable();
    table.text('description').nullable();
    table.timestamptz('scheduled_date').notNullable();
    table.integer('duration_minutes').notNullable().defaultTo(60);
    table.string('location', 500).nullable();

    // Pricing
    table.decimal('price', 10, 2).notNullable().defaultTo(0);
    table.string('currency', 3).notNullable().defaultTo('USD');

    // Status and notes
    table.enum('status', ['pending', 'confirmed', 'in_progress', 'completed', 'cancelled'])
          .defaultTo('pending').notNullable();
    table.text('notes').nullable();

    // Multi-tenancy
    table.uuid('tenant_id').notNullable();

    // Timestamps
    table.timestamps(true, true, true);

    // Indexes
    table.index(['photographer_id'], 'idx_sessions_photographer_id');
    table.index(['client_id'], 'idx_sessions_client_id');
    table.index(['scheduled_date'], 'idx_sessions_scheduled_date');
    table.index(['status'], 'idx_sessions_status');
    table.index(['session_type'], 'idx_sessions_session_type');
    table.index(['tenant_id'], 'idx_sessions_tenant_id');
    table.index(['created_at'], 'idx_sessions_created_at');

    // Composite indexes for common queries
    table.index(['photographer_id', 'status'], 'idx_sessions_photographer_status');
    table.index(['photographer_id', 'scheduled_date'], 'idx_sessions_photographer_scheduled');
  });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTableIfExists('sessions');
}