-- Database initialization script for PostgreSQL
-- This script sets up the initial database structure and configurations

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_stat_statements";

-- Create enum types for better type safety
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'payment_intent_status') THEN
        CREATE TYPE payment_intent_status AS ENUM (
            'requires_payment_method',
            'requires_confirmation',
            'requires_action',
            'processing',
            'requires_capture',
            'canceled',
            'succeeded'
        );
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'subscription_status') THEN
        CREATE TYPE subscription_status AS ENUM (
            'incomplete',
            'incomplete_expired',
            'trialing',
            'active',
            'past_due',
            'canceled',
            'unpaid',
            'paused'
        );
    END IF;
END
$$;

-- Performance and security configurations
ALTER SYSTEM SET shared_preload_libraries = 'pg_stat_statements';
ALTER SYSTEM SET log_statement = 'mod';
ALTER SYSTEM SET log_min_duration_statement = 1000;
ALTER SYSTEM SET log_connections = on;
ALTER SYSTEM SET log_disconnections = on;

-- Set timezone
SET timezone = 'UTC';

-- Grant necessary permissions to the application user
GRANT CONNECT ON DATABASE payment_service TO payment_user;
GRANT USAGE ON SCHEMA public TO payment_user;
GRANT CREATE ON SCHEMA public TO payment_user;

-- Performance monitoring view
CREATE OR REPLACE VIEW payment_service_stats AS
SELECT
    schemaname,
    tablename,
    attname,
    n_distinct,
    correlation
FROM pg_stats
WHERE schemaname = 'public';

-- Index monitoring view
CREATE OR REPLACE VIEW index_usage AS
SELECT
    schemaname,
    tablename,
    indexname,
    idx_tup_read,
    idx_tup_fetch,
    idx_scan
FROM pg_stat_user_indexes
WHERE schemaname = 'public'
ORDER BY idx_scan DESC;

-- Grant access to monitoring views
GRANT SELECT ON payment_service_stats TO payment_user;
GRANT SELECT ON index_usage TO payment_user;