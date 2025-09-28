import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  // Create additional performance indexes for complex queries

  // Multi-table query indexes
  await knex.schema.raw(`
    CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_sessions_photographer_date_status
    ON sessions (photographer_id, scheduled_date, status)
  `);

  await knex.schema.raw(`
    CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_photos_gallery_taken_at
    ON photos (gallery_id, taken_at)
    WHERE taken_at IS NOT NULL
  `);

  await knex.schema.raw(`
    CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_payments_amount_status
    ON payments (amount, status)
    WHERE status = 'completed'
  `);

  // Text search indexes for better search performance
  await knex.schema.raw(`
    CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_clients_name_search
    ON clients USING gin(to_tsvector('english', first_name || ' ' || last_name))
  `);

  await knex.schema.raw(`
    CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_sessions_title_search
    ON sessions USING gin(to_tsvector('english', title))
  `);

  await knex.schema.raw(`
    CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_galleries_title_search
    ON galleries USING gin(to_tsvector('english', title))
  `);

  // Partial indexes for active records only
  await knex.schema.raw(`
    CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_photographers_active_email
    ON photographers (email)
    WHERE is_active = true
  `);

  await knex.schema.raw(`
    CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_clients_active_photographer
    ON clients (photographer_id)
    WHERE is_active = true
  `);

  // JSONB indexes for metadata queries
  await knex.schema.raw(`
    CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_photos_metadata_camera
    ON photos USING gin((metadata->'camera'))
  `);

  await knex.schema.raw(`
    CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_workflows_actions_type
    ON workflows USING gin(actions)
  `);

  // Time-based partitioning preparation indexes
  await knex.schema.raw(`
    CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_sessions_scheduled_date_month
    ON sessions (date_trunc('month', scheduled_date))
  `);

  await knex.schema.raw(`
    CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_payments_paid_at_month
    ON payments (date_trunc('month', paid_at))
    WHERE paid_at IS NOT NULL
  `);

  // Covering indexes for common SELECT queries
  await knex.schema.raw(`
    CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_sessions_photographer_cover
    ON sessions (photographer_id)
    INCLUDE (title, scheduled_date, status, price)
  `);

  await knex.schema.raw(`
    CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_galleries_session_cover
    ON galleries (session_id)
    INCLUDE (title, status, is_public, cover_photo_url)
  `);
}

export async function down(knex: Knex): Promise<void> {
  // Drop all the additional indexes
  const indexes = [
    'idx_sessions_photographer_date_status',
    'idx_photos_gallery_taken_at',
    'idx_payments_amount_status',
    'idx_clients_name_search',
    'idx_sessions_title_search',
    'idx_galleries_title_search',
    'idx_photographers_active_email',
    'idx_clients_active_photographer',
    'idx_photos_metadata_camera',
    'idx_workflows_actions_type',
    'idx_sessions_scheduled_date_month',
    'idx_payments_paid_at_month',
    'idx_sessions_photographer_cover',
    'idx_galleries_session_cover'
  ];

  for (const index of indexes) {
    await knex.schema.raw(`DROP INDEX IF EXISTS ${index}`);
  }
}