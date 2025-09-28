import { Knex } from 'knex';
import { DatabaseConfig } from './types/database';

const config: { [key: string]: Knex.Config } = {
  development: {
    client: 'postgresql',
    connection: {
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '5432'),
      user: process.env.DB_USER || 'focusflow',
      password: process.env.DB_PASSWORD || 'password',
      database: process.env.DB_NAME || 'focusflow_dev',
      ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false,
    },
    pool: {
      min: 2,
      max: 10,
    },
    migrations: {
      directory: './migrations',
      extension: 'ts',
      tableName: 'knex_migrations',
    },
    seeds: {
      directory: './seeds',
      extension: 'ts',
    },
    debug: process.env.NODE_ENV === 'development' && process.env.DB_DEBUG === 'true',
  },

  test: {
    client: 'postgresql',
    connection: {
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '5432'),
      user: process.env.DB_USER || 'focusflow',
      password: process.env.DB_PASSWORD || 'password',
      database: process.env.DB_NAME || 'focusflow_test',
      ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false,
    },
    pool: {
      min: 1,
      max: 5,
    },
    migrations: {
      directory: './migrations',
      extension: 'ts',
      tableName: 'knex_migrations',
    },
    seeds: {
      directory: './seeds',
      extension: 'ts',
    },
  },

  production: {
    client: 'postgresql',
    connection: {
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '5432'),
      user: process.env.DB_USER || 'focusflow',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'focusflow_prod',
      ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : true,
    },
    pool: {
      min: 5,
      max: 20,
      acquireTimeoutMillis: 60000,
      idle: 10000,
    },
    migrations: {
      directory: './migrations',
      extension: 'ts',
      tableName: 'knex_migrations',
    },
    seeds: {
      directory: './seeds',
      extension: 'ts',
    },
    log: {
      warn(message: string) {
        console.warn(message);
      },
      error(message: string) {
        console.error(message);
      },
    },
  },
};

export default config;