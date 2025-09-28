import knex, { Knex } from 'knex';
import config from '../knexfile';

let db: Knex | null = null;

/**
 * Get database connection instance
 * @param environment - Environment to connect to (development, test, production)
 * @returns Knex instance
 */
export function getDatabase(environment?: string): Knex {
  const env = environment || process.env.NODE_ENV || 'development';

  if (!db) {
    const dbConfig = config[env];
    if (!dbConfig) {
      throw new Error(`Database configuration not found for environment: ${env}`);
    }
    db = knex(dbConfig);
  }

  return db;
}

/**
 * Close database connection
 */
export async function closeDatabase(): Promise<void> {
  if (db) {
    await db.destroy();
    db = null;
  }
}

/**
 * Set tenant context for Row Level Security
 * @param tenantId - UUID of the tenant
 */
export async function setTenantContext(tenantId: string): Promise<void> {
  const database = getDatabase();
  await database.raw('SELECT set_tenant_context(?)', [tenantId]);
}

/**
 * Get current tenant context
 * @returns Current tenant ID or null
 */
export async function getCurrentTenant(): Promise<string | null> {
  const database = getDatabase();
  const result = await database.raw('SELECT get_current_tenant() as tenant_id');
  return result.rows[0]?.tenant_id || null;
}

/**
 * Execute a function within a tenant context
 * @param tenantId - UUID of the tenant
 * @param fn - Function to execute
 * @returns Result of the function
 */
export async function withTenantContext<T>(
  tenantId: string,
  fn: () => Promise<T>
): Promise<T> {
  await setTenantContext(tenantId);
  try {
    return await fn();
  } finally {
    // Clear tenant context after execution
    const database = getDatabase();
    await database.raw('SELECT set_config(?, ?, true)', [
      'app.current_tenant_id',
      '',
      true
    ]);
  }
}

/**
 * Execute database operations within a transaction
 * @param fn - Function to execute within transaction
 * @returns Result of the function
 */
export async function withTransaction<T>(
  fn: (trx: Knex.Transaction) => Promise<T>
): Promise<T> {
  const database = getDatabase();
  return database.transaction(fn);
}

/**
 * Execute database operations within a transaction and tenant context
 * @param tenantId - UUID of the tenant
 * @param fn - Function to execute within transaction and tenant context
 * @returns Result of the function
 */
export async function withTenantTransaction<T>(
  tenantId: string,
  fn: (trx: Knex.Transaction) => Promise<T>
): Promise<T> {
  const database = getDatabase();
  return database.transaction(async (trx) => {
    await trx.raw('SELECT set_tenant_context(?)', [tenantId]);
    try {
      return await fn(trx);
    } finally {
      await trx.raw('SELECT set_config(?, ?, true)', [
        'app.current_tenant_id',
        '',
        true
      ]);
    }
  });
}

/**
 * Health check for database connection
 * @returns Promise that resolves if database is healthy
 */
export async function healthCheck(): Promise<{ status: string; timestamp: Date }> {
  try {
    const database = getDatabase();
    await database.raw('SELECT 1');
    return {
      status: 'healthy',
      timestamp: new Date()
    };
  } catch (error) {
    throw new Error(`Database health check failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Get database statistics for a tenant
 * @param tenantId - UUID of the tenant
 * @returns Statistics object
 */
export async function getTenantStats(tenantId: string): Promise<{
  photographers: number;
  clients: number;
  sessions: number;
  galleries: number;
  photos: number;
  payments: number;
  contracts: number;
  workflows: number;
}> {
  const database = getDatabase();

  const [
    photographersCount,
    clientsCount,
    sessionsCount,
    galleriesCount,
    photosCount,
    paymentsCount,
    contractsCount,
    workflowsCount
  ] = await Promise.all([
    database('photographers').where({ tenant_id: tenantId }).count('* as count'),
    database('clients').where({ tenant_id: tenantId }).count('* as count'),
    database('sessions').where({ tenant_id: tenantId }).count('* as count'),
    database('galleries').where({ tenant_id: tenantId }).count('* as count'),
    database('photos').where({ tenant_id: tenantId }).count('* as count'),
    database('payments').where({ tenant_id: tenantId }).count('* as count'),
    database('contracts').where({ tenant_id: tenantId }).count('* as count'),
    database('workflows').where({ tenant_id: tenantId }).count('* as count')
  ]);

  return {
    photographers: parseInt(photographersCount[0].count as string),
    clients: parseInt(clientsCount[0].count as string),
    sessions: parseInt(sessionsCount[0].count as string),
    galleries: parseInt(galleriesCount[0].count as string),
    photos: parseInt(photosCount[0].count as string),
    payments: parseInt(paymentsCount[0].count as string),
    contracts: parseInt(contractsCount[0].count as string),
    workflows: parseInt(workflowsCount[0].count as string)
  };
}

/**
 * Run migrations programmatically
 * @param direction - 'latest' or 'rollback'
 * @returns Migration result
 */
export async function runMigrations(direction: 'latest' | 'rollback' = 'latest'): Promise<[number, string[]]> {
  const database = getDatabase();

  if (direction === 'latest') {
    return database.migrate.latest();
  } else {
    return database.migrate.rollback();
  }
}

/**
 * Get migration status
 * @returns Array of migration files and their status
 */
export async function getMigrationStatus(): Promise<Array<{
  name: string;
  batch: number | null;
  migration_time: Date | null;
}>> {
  const database = getDatabase();
  const [completed, pending] = await database.migrate.list();

  return [
    ...completed.map((name: string, index: number) => ({
      name,
      batch: index + 1,
      migration_time: new Date() // This would need to be fetched from knex_migrations table for actual time
    })),
    ...pending.map((name: string) => ({
      name,
      batch: null,
      migration_time: null
    }))
  ];
}

/**
 * Run seeds programmatically
 * @returns Seed result
 */
export async function runSeeds(): Promise<[string[]]> {
  const database = getDatabase();
  return database.seed.run();
}