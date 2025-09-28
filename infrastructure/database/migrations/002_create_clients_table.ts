import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable('clients', (table) => {
    // Primary key
    table.uuid('id').primary().defaultTo(knex.raw('uuid_generate_v4()'));

    // Foreign key to photographer
    table.uuid('photographer_id').notNullable().references('id').inTable('photographers').onDelete('CASCADE');

    // Contact information
    table.string('email', 255).notNullable();
    table.string('first_name', 100).notNullable();
    table.string('last_name', 100).notNullable();
    table.string('phone', 20).nullable();

    // Address information
    table.string('address', 255).nullable();
    table.string('city', 100).nullable();
    table.string('state', 50).nullable();
    table.string('zip_code', 20).nullable();
    table.string('country', 100).nullable();

    // Client management
    table.text('notes').nullable();
    table.enum('preferred_contact_method', ['email', 'phone', 'text']).defaultTo('email').notNullable();
    table.boolean('is_active').defaultTo(true).notNullable();

    // Multi-tenancy
    table.uuid('tenant_id').notNullable();

    // Timestamps
    table.timestamps(true, true, true);

    // Indexes
    table.index(['photographer_id'], 'idx_clients_photographer_id');
    table.index(['email'], 'idx_clients_email');
    table.index(['tenant_id'], 'idx_clients_tenant_id');
    table.index(['is_active'], 'idx_clients_is_active');
    table.index(['created_at'], 'idx_clients_created_at');

    // Composite index for photographer + email uniqueness
    table.unique(['photographer_id', 'email'], 'unique_clients_photographer_email');
  });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTableIfExists('clients');
}