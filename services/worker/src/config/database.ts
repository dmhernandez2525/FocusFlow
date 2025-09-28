import knex from 'knex';
import type { Knex } from 'knex';

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error('DATABASE_URL environment variable is required');
}

export const db: Knex = knex({
  client: 'pg',
  connection: databaseUrl,
  pool: {
    min: 2,
    max: 10,
  },
  searchPath: ['public'],
});