import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  // Enable UUID extension if not already enabled
  await knex.raw('CREATE EXTENSION IF NOT EXISTS "uuid-ossp"');

  // Enable Row Level Security extension
  await knex.raw('CREATE EXTENSION IF NOT EXISTS "pgcrypto"');

  return knex.schema.createTable('photographers', (table) => {
    // Primary key
    table.uuid('id').primary().defaultTo(knex.raw('uuid_generate_v4()'));

    // Authentication fields
    table.string('email', 255).notNullable().unique();
    table.string('password_hash', 255).notNullable();

    // Profile information
    table.string('first_name', 100).notNullable();
    table.string('last_name', 100).notNullable();
    table.string('business_name', 255).nullable();
    table.string('phone', 20).nullable();
    table.string('website', 255).nullable();
    table.text('bio').nullable();
    table.string('profile_image_url', 500).nullable();

    // Status fields
    table.boolean('is_active').defaultTo(true).notNullable();
    table.boolean('email_verified').defaultTo(false).notNullable();

    // Multi-tenancy
    table.uuid('tenant_id').notNullable().defaultTo(knex.raw('uuid_generate_v4()'));

    // Timestamps
    table.timestamps(true, true, true); // useTimestamps, defaultToNow, useCamelCase

    // Indexes
    table.index(['email'], 'idx_photographers_email');
    table.index(['tenant_id'], 'idx_photographers_tenant_id');
    table.index(['is_active'], 'idx_photographers_is_active');
    table.index(['created_at'], 'idx_photographers_created_at');
  });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTableIfExists('photographers');
}