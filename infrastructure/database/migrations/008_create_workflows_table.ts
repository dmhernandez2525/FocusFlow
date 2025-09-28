import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable('workflows', (table) => {
    // Primary key
    table.uuid('id').primary().defaultTo(knex.raw('uuid_generate_v4()'));

    // Foreign key
    table.uuid('photographer_id').notNullable().references('id').inTable('photographers').onDelete('CASCADE');

    // Workflow details
    table.string('name', 255).notNullable();
    table.text('description').nullable();

    // Trigger configuration
    table.enum('trigger_event', [
      'session_created',
      'session_completed',
      'payment_received',
      'contract_signed'
    ]).notNullable();

    // Actions configuration (stored as JSONB for flexibility)
    table.jsonb('actions').notNullable().defaultTo('[]');
    /*
    Actions structure:
    [
      {
        "type": "email",
        "config": {
          "template": "session_confirmation",
          "to": "client",
          "subject": "Your session is confirmed!"
        },
        "delay_minutes": 0
      },
      {
        "type": "sms",
        "config": {
          "message": "Reminder: Your session is tomorrow at {time}",
          "to": "client"
        },
        "delay_minutes": 1440
      }
    ]
    */

    // Status
    table.boolean('is_active').defaultTo(true).notNullable();

    // Multi-tenancy
    table.uuid('tenant_id').notNullable();

    // Timestamps
    table.timestamps(true, true, true);

    // Indexes
    table.index(['photographer_id'], 'idx_workflows_photographer_id');
    table.index(['trigger_event'], 'idx_workflows_trigger_event');
    table.index(['is_active'], 'idx_workflows_is_active');
    table.index(['tenant_id'], 'idx_workflows_tenant_id');
    table.index(['created_at'], 'idx_workflows_created_at');

    // Composite indexes for common queries
    table.index(['photographer_id', 'is_active'], 'idx_workflows_photographer_active');
    table.index(['photographer_id', 'trigger_event'], 'idx_workflows_photographer_trigger');
    table.index(['trigger_event', 'is_active'], 'idx_workflows_trigger_active');
  });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTableIfExists('workflows');
}