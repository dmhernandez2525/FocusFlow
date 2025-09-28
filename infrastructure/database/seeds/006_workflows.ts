import { Knex } from 'knex';

export async function seed(knex: Knex): Promise<void> {
  // Deletes ALL existing entries
  await knex('workflows').del();

  const workflows = [
    // Jane Smith's workflows (tenant 1)
    {
      id: 'cc0e8400-e29b-41d4-a716-446655440001',
      photographer_id: '550e8400-e29b-41d4-a716-446655440001',
      name: 'Wedding Booking Confirmation',
      description: 'Automated workflow when a wedding session is created and confirmed',
      trigger_event: 'session_created',
      actions: [
        {
          type: 'email',
          config: {
            template: 'wedding_confirmation',
            to: 'client',
            subject: 'Your Wedding Photography is Confirmed!',
            include_contract: true
          },
          delay_minutes: 0
        },
        {
          type: 'email',
          config: {
            template: 'pre_wedding_reminder',
            to: 'client',
            subject: 'Your Wedding is Coming Up - Important Details'
          },
          delay_minutes: 10080 // 1 week before
        },
        {
          type: 'sms',
          config: {
            message: 'Hi {client_name}! This is Jane from Jane Smith Photography. Just a friendly reminder that your wedding is tomorrow at {session_time}. Looking forward to capturing your special day!',
            to: 'client'
          },
          delay_minutes: 1440 // 1 day before
        }
      ],
      is_active: true,
      tenant_id: '550e8400-e29b-41d4-a716-446655440001',
      created_at: new Date('2024-01-16T08:00:00Z'),
      updated_at: new Date('2024-01-16T08:00:00Z'),
    },
    {
      id: 'cc0e8400-e29b-41d4-a716-446655440002',
      photographer_id: '550e8400-e29b-41d4-a716-446655440001',
      name: 'Session Completion Follow-up',
      description: 'Automated follow-up when any session is marked as completed',
      trigger_event: 'session_completed',
      actions: [
        {
          type: 'create_gallery',
          config: {
            gallery_name: '{session_title} - Gallery',
            status: 'draft',
            password_protected: true,
            download_enabled: false
          },
          delay_minutes: 0
        },
        {
          type: 'email',
          config: {
            template: 'session_completed_thank_you',
            to: 'client',
            subject: 'Thank You - Your Photos Are Being Processed!',
            estimated_delivery: '2 weeks'
          },
          delay_minutes: 60 // 1 hour after completion
        },
        {
          type: 'email',
          config: {
            template: 'gallery_ready_notification',
            to: 'client',
            subject: 'Your Photos Are Ready! 📸',
            include_gallery_link: true
          },
          delay_minutes: 20160 // 2 weeks after completion
        }
      ],
      is_active: true,
      tenant_id: '550e8400-e29b-41d4-a716-446655440001',
      created_at: new Date('2024-01-16T08:30:00Z'),
      updated_at: new Date('2024-02-15T14:20:00Z'),
    },
    // Mike Johnson's workflows (tenant 2)
    {
      id: 'cc0e8400-e29b-41d4-a716-446655440003',
      photographer_id: '550e8400-e29b-41d4-a716-446655440002',
      name: 'Corporate Payment Processing',
      description: 'Handles corporate client payment confirmations and delivery',
      trigger_event: 'payment_received',
      actions: [
        {
          type: 'email',
          config: {
            template: 'payment_confirmation_corporate',
            to: 'client',
            subject: 'Payment Received - Project Timeline Confirmed',
            include_invoice: true,
            include_timeline: true
          },
          delay_minutes: 0
        },
        {
          type: 'email',
          config: {
            template: 'project_update_corporate',
            to: 'client',
            subject: 'Project Update - Photos in Progress'
          },
          delay_minutes: 2880 // 2 days after payment
        }
      ],
      is_active: true,
      tenant_id: '550e8400-e29b-41d4-a716-446655440002',
      created_at: new Date('2024-01-21T10:00:00Z'),
      updated_at: new Date('2024-01-21T10:00:00Z'),
    },
    {
      id: 'cc0e8400-e29b-41d4-a716-446655440004',
      photographer_id: '550e8400-e29b-41d4-a716-446655440002',
      name: 'Contract Signature Follow-up',
      description: 'Actions to take when a contract is digitally signed',
      trigger_event: 'contract_signed',
      actions: [
        {
          type: 'email',
          config: {
            template: 'contract_signed_confirmation',
            to: 'client',
            subject: 'Contract Signed - We\'re All Set!',
            include_signed_contract: true,
            include_next_steps: true
          },
          delay_minutes: 0
        },
        {
          type: 'email',
          config: {
            template: 'session_preparation_guide',
            to: 'client',
            subject: 'Preparing for Your Photo Session'
          },
          delay_minutes: 1440 // 1 day after signing
        },
        {
          type: 'request_payment',
          config: {
            payment_type: 'deposit',
            amount_percentage: 50,
            due_date_days: 7,
            description: 'Session deposit as per signed contract'
          },
          delay_minutes: 60 // 1 hour after signing
        }
      ],
      is_active: true,
      tenant_id: '550e8400-e29b-41d4-a716-446655440002',
      created_at: new Date('2024-01-21T10:30:00Z'),
      updated_at: new Date('2024-01-21T10:30:00Z'),
    },
    // Sarah Williams' workflows (tenant 3)
    {
      id: 'cc0e8400-e29b-41d4-a716-446655440005',
      photographer_id: '550e8400-e29b-41d4-a716-446655440003',
      name: 'Lifestyle Session Welcome',
      description: 'Welcome sequence for new lifestyle and family photography clients',
      trigger_event: 'session_created',
      actions: [
        {
          type: 'email',
          config: {
            template: 'lifestyle_session_welcome',
            to: 'client',
            subject: 'Welcome! Let\'s Plan Your Perfect Photo Session',
            include_preparation_guide: true,
            include_wardrobe_guide: true
          },
          delay_minutes: 0
        },
        {
          type: 'email',
          config: {
            template: 'session_reminder_with_tips',
            to: 'client',
            subject: 'Your Session is Tomorrow - Final Tips & Weather Update'
          },
          delay_minutes: 1440 // 1 day before
        },
        {
          type: 'sms',
          config: {
            message: 'Hi {client_name}! Sarah here 😊 Excited for your session in a few hours at {session_time}. See you soon!',
            to: 'client'
          },
          delay_minutes: -120 // 2 hours before session
        }
      ],
      is_active: true,
      tenant_id: '550e8400-e29b-41d4-a716-446655440003',
      created_at: new Date('2024-02-01T12:00:00Z'),
      updated_at: new Date('2024-02-01T12:00:00Z'),
    },
    {
      id: 'cc0e8400-e29b-41d4-a716-446655440006',
      photographer_id: '550e8400-e29b-41d4-a716-446655440003',
      name: 'Maternity Session Special Care',
      description: 'Special workflow for maternity sessions with extra care and attention',
      trigger_event: 'session_completed',
      actions: [
        {
          type: 'email',
          config: {
            template: 'maternity_session_thank_you',
            to: 'client',
            subject: 'What a Beautiful Session! 💕',
            personal_message: 'It was such an honor to capture this special time in your lives. Your love and excitement for your little one shines through in every photo!'
          },
          delay_minutes: 30
        },
        {
          type: 'create_gallery',
          config: {
            gallery_name: '{client_name} - Expecting {due_date}',
            status: 'draft',
            password_protected: false,
            download_enabled: true,
            watermark_enabled: false
          },
          delay_minutes: 0
        },
        {
          type: 'email',
          config: {
            template: 'maternity_gallery_ready',
            to: 'client',
            subject: 'Your Maternity Photos Are Here! 🤱✨',
            include_gallery_link: true,
            include_print_guide: true
          },
          delay_minutes: 10080 // 1 week for faster maternity delivery
        }
      ],
      is_active: true,
      tenant_id: '550e8400-e29b-41d4-a716-446655440003',
      created_at: new Date('2024-02-01T12:30:00Z'),
      updated_at: new Date('2024-02-01T12:30:00Z'),
    },
    // Inactive workflow example
    {
      id: 'cc0e8400-e29b-41d4-a716-446655440007',
      photographer_id: '550e8400-e29b-41d4-a716-446655440001',
      name: 'Old Birthday Reminder Workflow',
      description: 'Deprecated workflow for birthday reminders',
      trigger_event: 'session_created',
      actions: [
        {
          type: 'email',
          config: {
            template: 'birthday_reminder',
            to: 'client',
            subject: 'Happy Birthday Reminder!'
          },
          delay_minutes: 525600 // 1 year
        }
      ],
      is_active: false,
      tenant_id: '550e8400-e29b-41d4-a716-446655440001',
      created_at: new Date('2023-12-01T10:00:00Z'),
      updated_at: new Date('2024-01-15T16:30:00Z'),
    },
  ];

  // Inserts seed entries
  await knex('workflows').insert(workflows);
}