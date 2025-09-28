import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable('galleries', (table) => {
    // Primary key
    table.uuid('id').primary().defaultTo(knex.raw('uuid_generate_v4()'));

    // Foreign keys
    table.uuid('session_id').notNullable().references('id').inTable('sessions').onDelete('CASCADE');
    table.uuid('photographer_id').notNullable().references('id').inTable('photographers').onDelete('CASCADE');

    // Gallery details
    table.string('title', 255).notNullable();
    table.text('description').nullable();
    table.string('cover_photo_url', 500).nullable();

    // Access control
    table.boolean('is_public').defaultTo(false).notNullable();
    table.boolean('password_protected').defaultTo(false).notNullable();
    table.string('gallery_password', 255).nullable();
    table.timestamptz('expires_at').nullable();

    // Gallery settings
    table.boolean('download_enabled').defaultTo(true).notNullable();
    table.boolean('watermark_enabled').defaultTo(false).notNullable();

    // Status
    table.enum('status', ['draft', 'published', 'archived']).defaultTo('draft').notNullable();

    // Multi-tenancy
    table.uuid('tenant_id').notNullable();

    // Timestamps
    table.timestamps(true, true, true);

    // Indexes
    table.index(['session_id'], 'idx_galleries_session_id');
    table.index(['photographer_id'], 'idx_galleries_photographer_id');
    table.index(['status'], 'idx_galleries_status');
    table.index(['is_public'], 'idx_galleries_is_public');
    table.index(['expires_at'], 'idx_galleries_expires_at');
    table.index(['tenant_id'], 'idx_galleries_tenant_id');
    table.index(['created_at'], 'idx_galleries_created_at');

    // Composite indexes
    table.index(['photographer_id', 'status'], 'idx_galleries_photographer_status');
    table.index(['session_id', 'status'], 'idx_galleries_session_status');
  });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTableIfExists('galleries');
}