# FocusFlow CMS

A production-ready Strapi v5.23.1 Content Management System for FocusFlow, built with TypeScript and PostgreSQL.

## Features

- **Strapi v5.23.1** with Document Service API
- **TypeScript** with strict mode configuration
- **PostgreSQL 17.6** database support
- **AWS S3** file upload integration
- **Multi-tenant** data isolation ready
- **Production-ready** configuration
- **Docker** containerization
- **Rate limiting** and security middleware
- **CORS** configuration
- **SendGrid** email integration

## Prerequisites

- Node.js 20.x or higher
- PostgreSQL 17.6
- AWS S3 bucket (for file uploads)
- SendGrid account (for emails)

## Installation

### 1. Environment Setup

Copy the environment file and configure your settings:

```bash
cp .env.example .env
```

### 2. Required Environment Variables

Update the following critical environment variables in your `.env` file:

```bash
# Security (REQUIRED)
ADMIN_JWT_SECRET=your-super-secret-admin-jwt-key-here
API_TOKEN_SALT=your-api-token-salt-here
TRANSFER_TOKEN_SALT=your-transfer-token-salt-here
APP_KEYS=key1,key2,key3,key4

# Database (REQUIRED)
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_NAME=focusflow_cms
DATABASE_USERNAME=postgres
DATABASE_PASSWORD=your-database-password

# AWS S3 (REQUIRED)
AWS_ACCESS_KEY_ID=your-aws-access-key-id
AWS_SECRET_ACCESS_KEY=your-aws-secret-access-key
S3_BUCKET=your-s3-bucket-name

# Email (OPTIONAL)
SENDGRID_API_KEY=your-sendgrid-api-key
```

### 3. Database Setup

Create the PostgreSQL database:

```sql
CREATE DATABASE focusflow_cms;
CREATE USER strapi WITH PASSWORD 'your-database-password';
GRANT ALL PRIVILEGES ON DATABASE focusflow_cms TO strapi;
```

### 4. Install Dependencies

```bash
npm install
```

### 5. Run Development Server

```bash
npm run dev
```

The CMS will be available at `http://localhost:1337/admin`

## Production Deployment

### Docker Deployment

1. Build the Docker image:

```bash
docker build -t focusflow-cms .
```

2. Run the container:

```bash
docker run -d \
  --name focusflow-cms \
  -p 1337:1337 \
  --env-file .env \
  focusflow-cms
```

### Manual Deployment

1. Build the application:

```bash
npm run build
```

2. Start the production server:

```bash
npm start
```

## Configuration

### Database Configuration

The database configuration supports:
- Connection pooling with configurable min/max connections
- SSL connections for production
- Schema-based multi-tenancy
- Connection timeout and retry settings

### Security Features

- Helmet.js security headers
- CORS configuration
- Rate limiting (global and admin-specific)
- JWT authentication
- Input validation
- SQL injection protection

### File Upload Configuration

AWS S3 integration with:
- Multiple breakpoint generation
- ACL control
- Region and endpoint configuration
- Path customization
- Size limits

### Email Configuration

SendGrid integration for:
- Admin forgot password
- User notifications
- System alerts

## Scripts

```bash
# Development
npm run dev                 # Start development server
npm run build              # Build for production
npm start                  # Start production server

# Quality Assurance
npm run lint               # Run ESLint
npm run lint:fix           # Fix ESLint errors
npm run type-check         # TypeScript type checking
npm test                   # Run tests
npm run test:watch         # Run tests in watch mode
npm run test:coverage      # Run tests with coverage

# Utilities
npm run clean              # Clean build artifacts
npm run export             # Export data
npm run import             # Import data
```

## API Usage

### Document Service API (Strapi v5.23.1)

This CMS uses the new Document Service API instead of the deprecated Entity Service:

```typescript
// Example: Get documents
const documents = await strapi.documents('api::article.article').findMany({
  fields: ['title', 'content'],
  populate: ['author'],
  locale: 'en',
});

// Example: Create document
const document = await strapi.documents('api::article.article').create({
  data: {
    title: 'My Article',
    content: 'Article content...',
  },
  locale: 'en',
});
```

### Content Types

The CMS is configured for multi-tenant content with:
- Locale support (en, fr, es, de)
- User permissions
- Role-based access control
- Document versioning

## Monitoring

### Health Check

The application includes a health check endpoint:

```bash
curl http://localhost:1337/_health
```

### Logging

Structured logging with configurable levels:
- Development: `debug` level with request logging
- Production: `info` level without request logging

## Security Considerations

1. **Environment Variables**: Never commit `.env` files
2. **Database**: Use strong passwords and enable SSL in production
3. **S3**: Configure proper bucket policies and ACLs
4. **JWT**: Use strong, unique secrets
5. **Rate Limiting**: Adjust limits based on your traffic patterns
6. **CORS**: Restrict origins in production

## Multi-Tenant Support

The CMS is prepared for multi-tenant architecture:
- Schema-based isolation
- Tenant-specific configurations
- Isolated file storage paths
- Tenant context in API requests

## Troubleshooting

### Common Issues

1. **Database Connection Errors**
   - Verify PostgreSQL is running
   - Check connection credentials
   - Ensure database exists

2. **S3 Upload Errors**
   - Verify AWS credentials
   - Check bucket permissions
   - Validate region settings

3. **Build Errors**
   - Clear cache: `npm run clean`
   - Reinstall dependencies: `rm -rf node_modules && npm install`
   - Check TypeScript errors: `npm run type-check`

### Development Tips

1. Use `npm run dev` for hot reload during development
2. Check logs in the console for detailed error messages
3. Use `npm run type-check` to catch TypeScript issues early
4. Test API endpoints with the built-in documentation

## Contributing

1. Follow TypeScript strict mode requirements
2. No `any` types allowed
3. No `console.log` statements in production code
4. No empty functions or TODO comments
5. Include proper error handling
6. Write tests for new features

## License

MIT License - see LICENSE file for details.

## Support

For support and questions:
- Email: support@focusflow.com
- Documentation: [Strapi v5 Documentation](https://docs.strapi.io/developer-docs/latest/getting-started/introduction.html)
- Issues: Create an issue in the project repository