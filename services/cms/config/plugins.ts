interface S3ProviderOptions {
  s3Options: {
    credentials: {
      accessKeyId: string;
      secretAccessKey: string;
    };
    region: string;
    endpoint?: string;
    params: {
      Bucket: string;
      ACL?: string;
    };
    s3ForcePathStyle?: boolean;
    signatureVersion?: string;
  };
  baseUrl?: string;
  rootPath?: string;
}

interface UploadConfig {
  config: {
    provider: string;
    providerOptions: S3ProviderOptions;
    actionOptions: {
      upload: {
        ACL?: string;
      };
      uploadStream: {
        ACL?: string;
      };
      delete: Record<string, unknown>;
    };
    sizeLimit: number;
    breakpoints?: Record<string, number>;
  };
}

interface EmailConfig {
  config: {
    provider: string;
    providerOptions: {
      apiKey: string;
    };
    settings: {
      defaultFrom: string;
      defaultReplyTo: string;
      testAddress?: string;
    };
  };
}

interface UsersPermissionsConfig {
  config: {
    jwt: {
      expiresIn: string;
    };
    ratelimit: {
      interval: number;
      max: number;
    };
  };
}

interface I18nConfig {
  config: {
    locales: string[];
    defaultLocale: string;
  };
}

interface PluginsConfig {
  upload: UploadConfig;
  email: EmailConfig;
  'users-permissions': UsersPermissionsConfig;
  i18n: I18nConfig;
}

export default ({ env }: { env: (key: string, defaultValue?: string | number | boolean) => string | number | boolean }): PluginsConfig => {
  const awsAccessKeyId = env('AWS_ACCESS_KEY_ID', '') as string;
  const awsSecretAccessKey = env('AWS_SECRET_ACCESS_KEY', '') as string;
  const awsRegion = env('AWS_REGION', 'us-east-1') as string;
  const s3Bucket = env('S3_BUCKET', '') as string;
  const sendgridApiKey = env('SENDGRID_API_KEY', '') as string;

  if (!awsAccessKeyId) {
    throw new Error('AWS_ACCESS_KEY_ID environment variable is required');
  }

  if (!awsSecretAccessKey) {
    throw new Error('AWS_SECRET_ACCESS_KEY environment variable is required');
  }

  if (!s3Bucket) {
    throw new Error('S3_BUCKET environment variable is required');
  }

  const isProduction = env('NODE_ENV', 'development') === 'production';

  return {
    upload: {
      config: {
        provider: 'aws-s3',
        providerOptions: {
          s3Options: {
            credentials: {
              accessKeyId: awsAccessKeyId,
              secretAccessKey: awsSecretAccessKey,
            },
            region: awsRegion,
            endpoint: env('S3_ENDPOINT', undefined) as string | undefined,
            params: {
              Bucket: s3Bucket,
              ACL: env('S3_ACL', 'public-read') as string,
            },
            s3ForcePathStyle: env('S3_FORCE_PATH_STYLE', false) as boolean,
            signatureVersion: 'v4',
          },
          baseUrl: env('S3_BASE_URL', undefined) as string | undefined,
          rootPath: env('S3_ROOT_PATH', 'uploads') as string,
        },
        actionOptions: {
          upload: {
            ACL: env('S3_ACL', 'public-read') as string,
          },
          uploadStream: {
            ACL: env('S3_ACL', 'public-read') as string,
          },
          delete: {},
        },
        sizeLimit: env('UPLOAD_SIZE_LIMIT', 10 * 1024 * 1024) as number, // 10MB default
        breakpoints: {
          xlarge: 1920,
          large: 1000,
          medium: 750,
          small: 500,
          xsmall: 64,
        },
      },
    },
    email: {
      config: {
        provider: 'sendgrid',
        providerOptions: {
          apiKey: sendgridApiKey,
        },
        settings: {
          defaultFrom: env('FROM_EMAIL', 'noreply@focusflow.com') as string,
          defaultReplyTo: env('REPLY_TO_EMAIL', 'support@focusflow.com') as string,
          testAddress: env('TEST_EMAIL', undefined) as string | undefined,
        },
      },
    },
    'users-permissions': {
      config: {
        jwt: {
          expiresIn: env('JWT_EXPIRES_IN', '7d') as string,
        },
        ratelimit: {
          interval: env('AUTH_RATELIMIT_INTERVAL', 60000) as number,
          max: env('AUTH_RATELIMIT_MAX', isProduction ? 3 : 10) as number,
        },
      },
    },
    i18n: {
      config: {
        locales: ['en', 'fr', 'es', 'de'],
        defaultLocale: env('DEFAULT_LOCALE', 'en') as string,
      },
    },
  };
};