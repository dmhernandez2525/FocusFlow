import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable('photos', (table) => {
    // Primary key
    table.uuid('id').primary().defaultTo(knex.raw('uuid_generate_v4()'));

    // Foreign keys
    table.uuid('gallery_id').notNullable().references('id').inTable('galleries').onDelete('CASCADE');
    table.uuid('photographer_id').notNullable().references('id').inTable('photographers').onDelete('CASCADE');

    // File information
    table.string('filename', 255).notNullable();
    table.string('original_filename', 255).notNullable();
    table.bigInteger('file_size').notNullable(); // in bytes
    table.string('mime_type', 100).notNullable();
    table.integer('width').notNullable();
    table.integer('height').notNullable();

    // URLs for different sizes
    table.string('url', 500).notNullable(); // Original/full size
    table.string('thumbnail_url', 500).notNullable(); // Small thumbnail
    table.string('medium_url', 500).notNullable(); // Medium size for gallery view

    // Metadata (EXIF data, camera settings, etc.)
    table.jsonb('metadata').nullable();

    // Photo status and organization
    table.boolean('is_selected').defaultTo(false).notNullable(); // Client selected
    table.boolean('is_favorite').defaultTo(false).notNullable(); // Photographer favorite
    table.integer('sort_order').defaultTo(0).notNullable();
    table.timestamptz('taken_at').nullable(); // When photo was taken (from EXIF)

    // Multi-tenancy
    table.uuid('tenant_id').notNullable();

    // Timestamps
    table.timestamps(true, true, true);

    // Indexes
    table.index(['gallery_id'], 'idx_photos_gallery_id');
    table.index(['photographer_id'], 'idx_photos_photographer_id');
    table.index(['filename'], 'idx_photos_filename');
    table.index(['is_selected'], 'idx_photos_is_selected');
    table.index(['is_favorite'], 'idx_photos_is_favorite');
    table.index(['sort_order'], 'idx_photos_sort_order');
    table.index(['taken_at'], 'idx_photos_taken_at');
    table.index(['tenant_id'], 'idx_photos_tenant_id');
    table.index(['created_at'], 'idx_photos_created_at');

    // Composite indexes for common queries
    table.index(['gallery_id', 'sort_order'], 'idx_photos_gallery_sort');
    table.index(['gallery_id', 'is_selected'], 'idx_photos_gallery_selected');
    table.index(['photographer_id', 'is_favorite'], 'idx_photos_photographer_favorite');

    // Unique constraint for filename within gallery
    table.unique(['gallery_id', 'filename'], 'unique_photos_gallery_filename');
  });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTableIfExists('photos');
}