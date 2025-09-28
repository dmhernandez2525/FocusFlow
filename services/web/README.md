# FocusFlow Web Application

A Next.js 15.5.4 application built with TypeScript, Tailwind CSS, and ShadCN UI components.

## Features

- **Next.js 15.5.4** with App Router and React 19
- **TypeScript** with strict mode configuration
- **Tailwind CSS** for styling with ShadCN UI components
- **NextAuth.js** for authentication
- **Prisma** for database management
- **Turbopack** for fast development builds
- **Docker** support for production deployment

## Getting Started

### Prerequisites

- Node.js 20.0.0 or later
- pnpm 9.0.0 or later
- PostgreSQL database

### Installation

1. Install dependencies:
```bash
pnpm install
```

2. Set up environment variables:
```bash
cp .env.example .env.local
```
Edit `.env.local` with your actual values.

3. Set up the database:
```bash
pnpm db:push
```

4. Start the development server:
```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Scripts

- `pnpm dev` - Start development server with Turbopack
- `pnpm build` - Build for production
- `pnpm start` - Start production server
- `pnpm lint` - Run ESLint
- `pnpm type-check` - Run TypeScript type checking
- `pnpm test` - Run tests
- `pnpm test:watch` - Run tests in watch mode
- `pnpm test:coverage` - Run tests with coverage

## Project Structure

```
src/
├── app/                    # App Router pages and layouts
│   ├── (auth)/            # Authentication pages
│   ├── (dashboard)/       # Dashboard pages
│   ├── (public)/          # Public pages
│   ├── api/               # API routes
│   ├── globals.css        # Global styles
│   └── layout.tsx         # Root layout
├── components/            # React components
│   ├── layouts/          # Layout components
│   └── ui/               # UI components (ShadCN)
├── lib/                  # Utilities and configurations
├── hooks/                # Custom React hooks
└── types/                # TypeScript type definitions
```

## Authentication

The application uses NextAuth.js with support for:
- Email/password authentication
- Google OAuth
- JWT sessions
- Prisma adapter

## Database

Uses Prisma with PostgreSQL for data persistence. See the `@focusflow/types` package for schema definitions.

## Deployment

### Docker

Build and run with Docker:

```bash
docker build -t focusflow-web .
docker run -p 3000:3000 focusflow-web
```

### Environment Variables

Required environment variables:
- `DATABASE_URL` - PostgreSQL connection string
- `NEXTAUTH_SECRET` - NextAuth.js secret key
- `NEXTAUTH_URL` - Application URL
- `GOOGLE_CLIENT_ID` - Google OAuth client ID
- `GOOGLE_CLIENT_SECRET` - Google OAuth client secret

## Contributing

1. Follow TypeScript strict mode guidelines
2. Use ESLint and Prettier for code formatting
3. Write tests for new features
4. Follow the existing project structure
5. No `console.log`, `any` types, or `TODO` comments in production code