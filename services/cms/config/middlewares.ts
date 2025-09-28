interface CorsConfig {
  origin: string[] | string | boolean;
  maxAge?: number;
  credentials?: boolean;
  methods?: string[];
  headers?: string[];
  exposedHeaders?: string[];
}

interface SecurityConfig {
  contentSecurityPolicy?: {
    useDefaults?: boolean;
    directives?: Record<string, string[]>;
    upgradeInsecureRequests?: boolean;
    reportOnly?: boolean;
  };
  crossOriginEmbedderPolicy?: boolean;
  crossOriginOpenerPolicy?: boolean;
  crossOriginResourcePolicy?: {
    policy?: string;
  };
  dnsPrefetchControl?: {
    allow?: boolean;
  };
  frameguard?: {
    action?: string;
  };
  hidePoweredBy?: boolean;
  hsts?: {
    maxAge?: number;
    includeSubDomains?: boolean;
    preload?: boolean;
  };
  ieNoOpen?: boolean;
  noSniff?: boolean;
  originAgentCluster?: boolean;
  permittedCrossDomainPolicies?: boolean;
  referrerPolicy?: {
    policy?: string;
  };
  xssFilter?: boolean;
}

interface RateLimitConfig {
  windowMs: number;
  max: number;
  message?: string;
  headers?: boolean;
  skipSuccessfulRequests?: boolean;
  skipFailedRequests?: boolean;
  keyGenerator?: (request: { ip: string; user?: { id: string } }) => string;
}

interface MiddlewareConfig {
  name: string;
  config?: CorsConfig | SecurityConfig | RateLimitConfig | Record<string, unknown>;
}

export default ({ env }: { env: (key: string, defaultValue?: string | number | boolean | string[]) => string | number | boolean | string[] }): MiddlewareConfig[] => {
  const isProduction = env('NODE_ENV', 'development') === 'production';
  const allowedOrigins = env('CORS_ALLOWED_ORIGINS', ['http://localhost:3000', 'http://localhost:1337']) as string[];

  return [
    'strapi::logger',
    'strapi::errors',
    {
      name: 'strapi::security',
      config: {
        contentSecurityPolicy: {
          useDefaults: true,
          directives: {
            'connect-src': ["'self'", 'https:'],
            'img-src': [
              "'self'",
              'data:',
              'blob:',
              `https://${env('S3_BUCKET', '')}.s3.${env('AWS_REGION', 'us-east-1')}.amazonaws.com`,
            ],
            'media-src': [
              "'self'",
              'data:',
              'blob:',
              `https://${env('S3_BUCKET', '')}.s3.${env('AWS_REGION', 'us-east-1')}.amazonaws.com`,
            ],
            upgradeInsecureRequests: null,
          },
        },
        crossOriginEmbedderPolicy: false,
        crossOriginOpenerPolicy: false,
        crossOriginResourcePolicy: {
          policy: 'cross-origin',
        },
        dnsPrefetchControl: {
          allow: true,
        },
        frameguard: {
          action: 'deny',
        },
        hidePoweredBy: true,
        hsts: isProduction ? {
          maxAge: 31536000,
          includeSubDomains: true,
          preload: true,
        } : false,
        ieNoOpen: true,
        noSniff: true,
        originAgentCluster: true,
        permittedCrossDomainPolicies: false,
        referrerPolicy: {
          policy: 'same-origin',
        },
        xssFilter: true,
      } as SecurityConfig,
    },
    {
      name: 'strapi::cors',
      config: {
        origin: isProduction ? allowedOrigins : ['*'],
        maxAge: 31536000,
        credentials: true,
        methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'HEAD', 'OPTIONS'],
        headers: [
          'Content-Type',
          'Authorization',
          'Origin',
          'Accept',
          'X-Requested-With',
          'X-HTTP-Method-Override',
        ],
        exposedHeaders: [
          'X-Total-Count',
          'X-Page-Count',
          'X-Page-Size',
          'X-Page-Number',
        ],
      } as CorsConfig,
    },
    'strapi::poweredBy',
    'strapi::query',
    'strapi::body',
    'strapi::session',
    'strapi::favicon',
    'strapi::public',
    {
      name: 'global::rate-limit',
      config: {
        windowMs: env('GLOBAL_RATE_LIMIT_WINDOW', 15 * 60 * 1000) as number, // 15 minutes
        max: env('GLOBAL_RATE_LIMIT_MAX', isProduction ? 100 : 1000) as number,
        message: 'Too many requests from this IP, please try again later.',
        headers: true,
        skipSuccessfulRequests: false,
        skipFailedRequests: false,
        keyGenerator: (request: { ip: string; user?: { id: string } }): string => {
          return request.user?.id ? `user:${request.user.id}` : `ip:${request.ip}`;
        },
      } as RateLimitConfig,
    },
  ];
};