import { Knex } from 'knex';
import bcrypt from 'bcrypt';

export async function seed(knex: Knex): Promise<void> {
  // Deletes ALL existing entries
  await knex('photographers').del();

  // Generate password hash for development
  const passwordHash = await bcrypt.hash('password123', 10);

  const photographers = [
    {
      id: '550e8400-e29b-41d4-a716-446655440001',
      email: 'jane@example.com',
      password_hash: passwordHash,
      first_name: 'Jane',
      last_name: 'Smith',
      business_name: 'Jane Smith Photography',
      phone: '+1-555-0101',
      website: 'https://janesmithphoto.com',
      bio: 'Professional wedding and portrait photographer with 10+ years of experience. Specializing in natural light photography and candid moments.',
      profile_image_url: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=300&h=300&fit=crop&crop=face',
      is_active: true,
      email_verified: true,
      tenant_id: '550e8400-e29b-41d4-a716-446655440001',
      created_at: new Date('2024-01-15T10:00:00Z'),
      updated_at: new Date('2024-01-15T10:00:00Z'),
    },
    {
      id: '550e8400-e29b-41d4-a716-446655440002',
      email: 'mike@example.com',
      password_hash: passwordHash,
      first_name: 'Mike',
      last_name: 'Johnson',
      business_name: 'Mike Johnson Studios',
      phone: '+1-555-0102',
      website: 'https://mikejohnsonstudios.com',
      bio: 'Commercial and event photographer focused on corporate events and brand photography. Available for both studio and on-location shoots.',
      profile_image_url: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=300&h=300&fit=crop&crop=face',
      is_active: true,
      email_verified: true,
      tenant_id: '550e8400-e29b-41d4-a716-446655440002',
      created_at: new Date('2024-01-20T14:30:00Z'),
      updated_at: new Date('2024-01-20T14:30:00Z'),
    },
    {
      id: '550e8400-e29b-41d4-a716-446655440003',
      email: 'sarah@example.com',
      password_hash: passwordHash,
      first_name: 'Sarah',
      last_name: 'Williams',
      business_name: 'Sarah Williams Photography',
      phone: '+1-555-0103',
      website: 'https://sarahwilliamsphoto.com',
      bio: 'Lifestyle and family photographer capturing authentic moments and emotions. Passionate about storytelling through photography.',
      profile_image_url: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=300&h=300&fit=crop&crop=face',
      is_active: true,
      email_verified: false,
      tenant_id: '550e8400-e29b-41d4-a716-446655440003',
      created_at: new Date('2024-02-01T09:15:00Z'),
      updated_at: new Date('2024-02-01T09:15:00Z'),
    },
  ];

  // Inserts seed entries
  await knex('photographers').insert(photographers);
}