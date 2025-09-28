interface AdminConfig {
  auth: {
    secret: string;
    events: {
      onConnectionReady?: () => void;
      onConnectionError?: (error: Error) => void;
    };
    options: {
      expiresIn: string;
      issuer: string;
      subject: string;
    };
  };
  apiToken: {
    salt: string;
  };
  transfer: {
    token: {
      salt: string;
    };
    remote: {
      enabled: boolean;
      url?: string;
      auth?: {
        type: string;
        secret: string;
      };
    };
  };
  flags: {
    nps: boolean;
    promoteEE: boolean;
  };
  ratelimit: {
    enabled: boolean;
    interval: number;
    max: number;
  };
  url?: string;
  serveAdminPanel: boolean;
  forgotPassword: {
    from: string;
    replyTo: string;
  };
  watchIgnoreFiles: string[];
}

export default ({ env }: { env: (key: string, defaultValue?: string | number | boolean) => string | number | boolean }): AdminConfig => {
  const adminJwtSecret = env('ADMIN_JWT_SECRET', '') as string;
  const apiTokenSalt = env('API_TOKEN_SALT', '') as string;
  const transferTokenSalt = env('TRANSFER_TOKEN_SALT', '') as string;
  const isProduction = env('NODE_ENV', 'development') === 'production';

  if (!adminJwtSecret) {
    throw new Error('ADMIN_JWT_SECRET environment variable is required');
  }

  if (!apiTokenSalt) {
    throw new Error('API_TOKEN_SALT environment variable is required');
  }

  if (!transferTokenSalt) {
    throw new Error('TRANSFER_TOKEN_SALT environment variable is required');
  }

  return {
    auth: {
      secret: adminJwtSecret,
      events: {
        onConnectionReady: (): void => {
          // Admin panel connection established
        },
        onConnectionError: (error: Error): void => {
          throw new Error(`Admin panel connection failed: ${error.message}`);
        },
      },
      options: {
        expiresIn: env('ADMIN_JWT_EXPIRES_IN', '30d') as string,
        issuer: env('ADMIN_JWT_ISSUER', 'focusflow-cms') as string,
        subject: env('ADMIN_JWT_SUBJECT', 'admin') as string,
      },
    },
    apiToken: {
      salt: apiTokenSalt,
    },
    transfer: {
      token: {
        salt: transferTokenSalt,
      },
      remote: {
        enabled: env('TRANSFER_REMOTE_ENABLED', false) as boolean,
        url: env('TRANSFER_REMOTE_URL', undefined) as string | undefined,
        auth: {
          type: 'bearer',
          secret: env('TRANSFER_REMOTE_SECRET', '') as string,
        },
      },
    },
    flags: {
      nps: env('FLAG_NPS', false) as boolean,
      promoteEE: env('FLAG_PROMOTE_EE', false) as boolean,
    },
    ratelimit: {
      enabled: env('ADMIN_RATELIMIT_ENABLED', isProduction) as boolean,
      interval: env('ADMIN_RATELIMIT_INTERVAL', 60000) as number,
      max: env('ADMIN_RATELIMIT_MAX', 5) as number,
    },
    url: env('ADMIN_URL', undefined) as string | undefined,
    serveAdminPanel: env('SERVE_ADMIN_PANEL', true) as boolean,
    forgotPassword: {
      from: env('ADMIN_FORGOT_PASSWORD_FROM', 'noreply@focusflow.com') as string,
      replyTo: env('ADMIN_FORGOT_PASSWORD_REPLY_TO', 'support@focusflow.com') as string,
    },
    watchIgnoreFiles: [
      './admin/src/**',
      './documentation/**',
      './node_modules/**',
      './build/**',
      '.cache/**',
    ],
  };
};