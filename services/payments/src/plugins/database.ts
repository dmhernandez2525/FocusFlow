import fp from 'fastify-plugin';
import postgres from '@fastify/postgres';
import { FastifyInstance } from 'fastify';

export default fp(async function (fastify: FastifyInstance) {
  await fastify.register(postgres, {
    connectionString: fastify.config.DATABASE_URL,
    max: fastify.config.DATABASE_MAX_CONNECTIONS,
    idleTimeoutMillis: fastify.config.DATABASE_IDLE_TIMEOUT,
    connectionTimeoutMillis: fastify.config.DATABASE_CONNECTION_TIMEOUT,
    ssl: fastify.config.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
  });

  // Test database connection
  try {
    await fastify.pg.query('SELECT NOW()');
    fastify.log.info('Database connection established successfully');
  } catch (error) {
    fastify.log.error('Failed to connect to database:', error);
    throw error;
  }

  // Initialize database tables if they don't exist
  await initializeTables(fastify);
});

async function initializeTables(fastify: FastifyInstance): Promise<void> {
  const createTablesSQL = `
    -- Customers table
    CREATE TABLE IF NOT EXISTS customers (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      stripe_customer_id VARCHAR(255) UNIQUE NOT NULL,
      email VARCHAR(255) NOT NULL,
      name VARCHAR(255),
      metadata JSONB DEFAULT '{}',
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );

    -- Payment intents table
    CREATE TABLE IF NOT EXISTS payment_intents (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      stripe_payment_intent_id VARCHAR(255) UNIQUE NOT NULL,
      amount BIGINT NOT NULL,
      currency VARCHAR(3) NOT NULL,
      status VARCHAR(50) NOT NULL,
      customer_id UUID REFERENCES customers(id),
      metadata JSONB DEFAULT '{}',
      idempotency_key VARCHAR(255) UNIQUE NOT NULL,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );

    -- Subscriptions table
    CREATE TABLE IF NOT EXISTS subscriptions (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      stripe_subscription_id VARCHAR(255) UNIQUE NOT NULL,
      customer_id UUID REFERENCES customers(id) NOT NULL,
      status VARCHAR(50) NOT NULL,
      current_period_start TIMESTAMP WITH TIME ZONE NOT NULL,
      current_period_end TIMESTAMP WITH TIME ZONE NOT NULL,
      plan_id VARCHAR(255) NOT NULL,
      metadata JSONB DEFAULT '{}',
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );

    -- Webhook events table
    CREATE TABLE IF NOT EXISTS webhook_events (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      stripe_event_id VARCHAR(255) UNIQUE NOT NULL,
      event_type VARCHAR(100) NOT NULL,
      processed BOOLEAN DEFAULT FALSE,
      processed_at TIMESTAMP WITH TIME ZONE,
      data JSONB NOT NULL,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );

    -- Idempotency table
    CREATE TABLE IF NOT EXISTS idempotency_records (
      key VARCHAR(255) PRIMARY KEY,
      response_body TEXT NOT NULL,
      response_status INTEGER NOT NULL,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      expires_at TIMESTAMP WITH TIME ZONE NOT NULL
    );

    -- Indexes for performance
    CREATE INDEX IF NOT EXISTS idx_payment_intents_customer_id ON payment_intents(customer_id);
    CREATE INDEX IF NOT EXISTS idx_payment_intents_status ON payment_intents(status);
    CREATE INDEX IF NOT EXISTS idx_payment_intents_created_at ON payment_intents(created_at);
    CREATE INDEX IF NOT EXISTS idx_subscriptions_customer_id ON subscriptions(customer_id);
    CREATE INDEX IF NOT EXISTS idx_subscriptions_status ON subscriptions(status);
    CREATE INDEX IF NOT EXISTS idx_webhook_events_processed ON webhook_events(processed);
    CREATE INDEX IF NOT EXISTS idx_webhook_events_event_type ON webhook_events(event_type);
    CREATE INDEX IF NOT EXISTS idx_idempotency_expires_at ON idempotency_records(expires_at);

    -- Function to update updated_at timestamp
    CREATE OR REPLACE FUNCTION update_updated_at_column()
    RETURNS TRIGGER AS $$
    BEGIN
      NEW.updated_at = NOW();
      RETURN NEW;
    END;
    $$ language 'plpgsql';

    -- Triggers for updated_at
    DO $$
    BEGIN
      IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_customers_updated_at') THEN
        CREATE TRIGGER update_customers_updated_at
          BEFORE UPDATE ON customers
          FOR EACH ROW
          EXECUTE FUNCTION update_updated_at_column();
      END IF;

      IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_payment_intents_updated_at') THEN
        CREATE TRIGGER update_payment_intents_updated_at
          BEFORE UPDATE ON payment_intents
          FOR EACH ROW
          EXECUTE FUNCTION update_updated_at_column();
      END IF;

      IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_subscriptions_updated_at') THEN
        CREATE TRIGGER update_subscriptions_updated_at
          BEFORE UPDATE ON subscriptions
          FOR EACH ROW
          EXECUTE FUNCTION update_updated_at_column();
      END IF;
    END
    $$;
  `;

  try {
    await fastify.pg.query(createTablesSQL);
    fastify.log.info('Database tables initialized successfully');
  } catch (error) {
    fastify.log.error('Failed to initialize database tables:', error);
    throw error;
  }
}