-- Database initialization script for FocusFlow
-- This script runs when the PostgreSQL container starts for the first time

-- Create additional databases for different environments if needed
CREATE DATABASE focusflow_test;

-- Create extensions that might be needed
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Grant privileges to the focusflow user
GRANT ALL PRIVILEGES ON DATABASE focusflow_dev TO focusflow;
GRANT ALL PRIVILEGES ON DATABASE focusflow_test TO focusflow;

-- Set default privileges for future objects
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO focusflow;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO focusflow;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON FUNCTIONS TO focusflow;