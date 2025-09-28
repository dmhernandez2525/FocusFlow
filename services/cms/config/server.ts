interface ServerConfig {
  host: string;
  port: number;
  app: {
    keys: string[];
  };
  webhooks: {
    populateRelations: boolean;
    defaultHeaders?: Record<string, string>;
  };
  url: string;
  proxy: boolean;
  cron: {
    enabled: boolean;
  };
  dirs: {
    public: string;
  };
  emitErrors: boolean;
  logger: {
    level: string;
    exposeInContext: boolean;
    requests: boolean;
  };
}

export default ({ env }: { env: (key: string, defaultValue?: string | number | boolean | string[]) => string | number | boolean | string[] }): ServerConfig => {
  const appKeys = env('APP_KEYS', []) as string[];

  if (!appKeys || appKeys.length === 0) {
    throw new Error('APP_KEYS environment variable is required and must contain at least one key');
  }

  const publicUrl = env('PUBLIC_URL', 'http://localhost:1337') as string;
  const isProduction = env('NODE_ENV', 'development') === 'production';

  return {
    host: env('HOST', '0.0.0.0') as string,
    port: env('PORT', 1337) as number,
    app: {
      keys: appKeys,
    },
    webhooks: {
      populateRelations: env('WEBHOOKS_POPULATE_RELATIONS', false) as boolean,
      defaultHeaders: {
        'Authorization': `Bearer ${env('WEBHOOK_SECRET', '')}`,
      },
    },
    url: publicUrl,
    proxy: env('IS_PROXIED', isProduction) as boolean,
    cron: {
      enabled: env('CRON_ENABLED', true) as boolean,
    },
    dirs: {
      public: './public',
    },
    emitErrors: !isProduction,
    logger: {
      level: env('LOG_LEVEL', isProduction ? 'info' : 'debug') as string,
      exposeInContext: true,
      requests: env('LOG_REQUESTS', !isProduction) as boolean,
    },
  };
};