import type { Config } from '@strapi/strapi';

interface DatabaseConfig {
  connection: {
    client: string;
    connection: {
      host: string;
      port: number;
      database: string;
      user: string;
      password: string;
      ssl: boolean | {
        rejectUnauthorized: boolean;
        ca?: string;
        cert?: string;
        key?: string;
      };
      timezone: string;
      charset: string;
      schema: string;
    };
    pool: {
      min: number;
      max: number;
      acquireTimeoutMillis: number;
      createTimeoutMillis: number;
      destroyTimeoutMillis: number;
      idleTimeoutMillis: number;
      reapIntervalMillis: number;
      createRetryIntervalMillis: number;
    };
    migrations: {
      tableName: string;
      directory: string;
    };
    acquireConnectionTimeout: number;
    useNullAsDefault: boolean;
    debug: boolean;
  };
}

const truthy = (value: string | number | boolean): boolean =>
  value === true || value === 'true' || value === '1';

const parseDatabaseUrl = (databaseUrl: string) => {
  const parsed = new URL(databaseUrl);

  return {
    host: parsed.hostname,
    port: parsed.port ? Number(parsed.port) : 5432,
    database: decodeURIComponent(parsed.pathname.replace(/^\//, '')),
    user: decodeURIComponent(parsed.username),
    password: decodeURIComponent(parsed.password),
    sslMode: parsed.searchParams.get('sslmode'),
  };
};

export default ({ env }: { env: (key: string, defaultValue?: string | number | boolean) => string | number | boolean }): DatabaseConfig => {
  const databaseUrl = env('DATABASE_URL', '') as string;
  const databaseFromUrl = databaseUrl ? parseDatabaseUrl(databaseUrl) : undefined;
  const sslConfig = truthy(env('DATABASE_SSL', false)) || Boolean(databaseFromUrl?.sslMode);

  return {
    connection: {
      client: 'postgres',
      connection: {
        host: databaseFromUrl?.host ?? env('DATABASE_HOST', 'localhost') as string,
        port: databaseFromUrl?.port ?? env('DATABASE_PORT', 5432) as number,
        database: databaseFromUrl?.database ?? env('DATABASE_NAME', 'focusflow_cms') as string,
        user: databaseFromUrl?.user ?? env('DATABASE_USERNAME', 'postgres') as string,
        password: databaseFromUrl?.password ?? env('DATABASE_PASSWORD', '') as string,
        ssl: sslConfig ? {
          rejectUnauthorized: truthy(env('DATABASE_SSL_REJECT_UNAUTHORIZED', false)),
          ca: env('DATABASE_SSL_CA', undefined) as string | undefined,
          cert: env('DATABASE_SSL_CERT', undefined) as string | undefined,
          key: env('DATABASE_SSL_KEY', undefined) as string | undefined,
        } : false,
        timezone: 'UTC',
        charset: 'utf8',
        schema: env('DATABASE_SCHEMA', 'public') as string,
      },
      pool: {
        min: env('DATABASE_POOL_MIN', 2) as number,
        max: env('DATABASE_POOL_MAX', 20) as number,
        acquireTimeoutMillis: env('DATABASE_POOL_ACQUIRE_TIMEOUT', 60000) as number,
        createTimeoutMillis: env('DATABASE_POOL_CREATE_TIMEOUT', 30000) as number,
        destroyTimeoutMillis: env('DATABASE_POOL_DESTROY_TIMEOUT', 5000) as number,
        idleTimeoutMillis: env('DATABASE_POOL_IDLE_TIMEOUT', 30000) as number,
        reapIntervalMillis: env('DATABASE_POOL_REAP_INTERVAL', 1000) as number,
        createRetryIntervalMillis: env('DATABASE_POOL_CREATE_RETRY_INTERVAL', 200) as number,
      },
      migrations: {
        tableName: 'strapi_migrations',
        directory: './database/migrations',
      },
      acquireConnectionTimeout: env('DATABASE_CONNECTION_TIMEOUT', 60000) as number,
      useNullAsDefault: true,
      debug: env('NODE_ENV', 'development') === 'development' && env('DATABASE_DEBUG', false) as boolean,
    },
  };
};
