import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  // Enable Row Level Security on all tables
  const tables = [
    'photographers',
    'clients',
    'sessions',
    'galleries',
    'photos',
    'payments',
    'contracts',
    'workflows'
  ];

  for (const table of tables) {
    await knex.schema.raw(`ALTER TABLE ${table} ENABLE ROW LEVEL SECURITY`);
  }

  // Create RLS policies for multi-tenant isolation

  // Photographers - can only access their own data
  await knex.schema.raw(`
    CREATE POLICY photographers_tenant_isolation ON photographers
    FOR ALL
    USING (tenant_id = current_setting('app.current_tenant_id')::uuid)
  `);

  // Clients - can only access clients within their tenant
  await knex.schema.raw(`
    CREATE POLICY clients_tenant_isolation ON clients
    FOR ALL
    USING (tenant_id = current_setting('app.current_tenant_id')::uuid)
  `);

  // Sessions - can only access sessions within their tenant
  await knex.schema.raw(`
    CREATE POLICY sessions_tenant_isolation ON sessions
    FOR ALL
    USING (tenant_id = current_setting('app.current_tenant_id')::uuid)
  `);

  // Galleries - can only access galleries within their tenant
  await knex.schema.raw(`
    CREATE POLICY galleries_tenant_isolation ON galleries
    FOR ALL
    USING (tenant_id = current_setting('app.current_tenant_id')::uuid)
  `);

  // Photos - can only access photos within their tenant
  await knex.schema.raw(`
    CREATE POLICY photos_tenant_isolation ON photos
    FOR ALL
    USING (tenant_id = current_setting('app.current_tenant_id')::uuid)
  `);

  // Payments - can only access payments within their tenant
  await knex.schema.raw(`
    CREATE POLICY payments_tenant_isolation ON payments
    FOR ALL
    USING (tenant_id = current_setting('app.current_tenant_id')::uuid)
  `);

  // Contracts - can only access contracts within their tenant
  await knex.schema.raw(`
    CREATE POLICY contracts_tenant_isolation ON contracts
    FOR ALL
    USING (tenant_id = current_setting('app.current_tenant_id')::uuid)
  `);

  // Workflows - can only access workflows within their tenant
  await knex.schema.raw(`
    CREATE POLICY workflows_tenant_isolation ON workflows
    FOR ALL
    USING (tenant_id = current_setting('app.current_tenant_id')::uuid)
  `);

  // Create additional policies for public gallery access
  await knex.schema.raw(`
    CREATE POLICY galleries_public_read ON galleries
    FOR SELECT
    USING (is_public = true AND status = 'published')
  `);

  await knex.schema.raw(`
    CREATE POLICY photos_public_read ON photos
    FOR SELECT
    USING (
      EXISTS (
        SELECT 1 FROM galleries g
        WHERE g.id = photos.gallery_id
        AND g.is_public = true
        AND g.status = 'published'
      )
    )
  `);

  // Create function to set tenant context
  await knex.schema.raw(`
    CREATE OR REPLACE FUNCTION set_tenant_context(tenant_uuid uuid)
    RETURNS void AS $$
    BEGIN
      PERFORM set_config('app.current_tenant_id', tenant_uuid::text, true);
    END;
    $$ LANGUAGE plpgsql SECURITY DEFINER;
  `);

  // Create function to get current tenant
  await knex.schema.raw(`
    CREATE OR REPLACE FUNCTION get_current_tenant()
    RETURNS uuid AS $$
    BEGIN
      RETURN current_setting('app.current_tenant_id', true)::uuid;
    EXCEPTION
      WHEN OTHERS THEN
        RETURN NULL;
    END;
    $$ LANGUAGE plpgsql SECURITY DEFINER;
  `);

  // Create trigger function to automatically set tenant_id
  await knex.schema.raw(`
    CREATE OR REPLACE FUNCTION set_tenant_id()
    RETURNS TRIGGER AS $$
    BEGIN
      IF TG_OP = 'INSERT' THEN
        -- For photographers table, use the provided tenant_id or generate new one
        IF TG_TABLE_NAME = 'photographers' AND (NEW.tenant_id IS NULL OR NEW.tenant_id = '00000000-0000-0000-0000-000000000000'::uuid) THEN
          NEW.tenant_id = uuid_generate_v4();
        ELSIF TG_TABLE_NAME != 'photographers' THEN
          -- For all other tables, use current tenant context
          NEW.tenant_id = get_current_tenant();
          IF NEW.tenant_id IS NULL THEN
            RAISE EXCEPTION 'No tenant context set. Call set_tenant_context() first.';
          END IF;
        END IF;
      END IF;
      RETURN NEW;
    END;
    $$ LANGUAGE plpgsql;
  `);

  // Add tenant_id triggers to all tables except photographers
  const tablesWithTriggers = ['clients', 'sessions', 'galleries', 'photos', 'payments', 'contracts', 'workflows'];

  for (const table of tablesWithTriggers) {
    await knex.schema.raw(`
      CREATE TRIGGER set_tenant_id_trigger
      BEFORE INSERT ON ${table}
      FOR EACH ROW
      EXECUTE FUNCTION set_tenant_id()
    `);
  }

  // Create view for photographer dashboard stats
  await knex.schema.raw(`
    CREATE VIEW photographer_stats AS
    SELECT
      p.id as photographer_id,
      p.tenant_id,
      COUNT(DISTINCT c.id) as total_clients,
      COUNT(DISTINCT s.id) as total_sessions,
      COUNT(DISTINCT g.id) as total_galleries,
      COUNT(DISTINCT ph.id) as total_photos,
      COALESCE(SUM(CASE WHEN pay.status = 'completed' THEN pay.amount ELSE 0 END), 0) as total_revenue
    FROM photographers p
    LEFT JOIN clients c ON c.photographer_id = p.id
    LEFT JOIN sessions s ON s.photographer_id = p.id
    LEFT JOIN galleries g ON g.photographer_id = p.id
    LEFT JOIN photos ph ON ph.photographer_id = p.id
    LEFT JOIN payments pay ON pay.photographer_id = p.id
    WHERE p.tenant_id = get_current_tenant()
    GROUP BY p.id, p.tenant_id
  `);
}

export async function down(knex: Knex): Promise<void> {
  // Drop view
  await knex.schema.raw('DROP VIEW IF EXISTS photographer_stats');

  // Drop triggers
  const tablesWithTriggers = ['clients', 'sessions', 'galleries', 'photos', 'payments', 'contracts', 'workflows'];

  for (const table of tablesWithTriggers) {
    await knex.schema.raw(`DROP TRIGGER IF EXISTS set_tenant_id_trigger ON ${table}`);
  }

  // Drop functions
  await knex.schema.raw('DROP FUNCTION IF EXISTS set_tenant_id()');
  await knex.schema.raw('DROP FUNCTION IF EXISTS get_current_tenant()');
  await knex.schema.raw('DROP FUNCTION IF EXISTS set_tenant_context(uuid)');

  // Drop RLS policies
  const tables = [
    'photographers',
    'clients',
    'sessions',
    'galleries',
    'photos',
    'payments',
    'contracts',
    'workflows'
  ];

  for (const table of tables) {
    await knex.schema.raw(`DROP POLICY IF EXISTS ${table}_tenant_isolation ON ${table}`);
    await knex.schema.raw(`ALTER TABLE ${table} DISABLE ROW LEVEL SECURITY`);
  }

  // Drop additional policies
  await knex.schema.raw('DROP POLICY IF EXISTS galleries_public_read ON galleries');
  await knex.schema.raw('DROP POLICY IF EXISTS photos_public_read ON photos');
}