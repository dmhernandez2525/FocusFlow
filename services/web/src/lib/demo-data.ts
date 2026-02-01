// Demo data for FocusFlow Photography ERP Platform
// This data is used to showcase the platform's features without requiring authentication

export interface DemoPhoto {
  id: string
  url: string
  thumbnailUrl: string
  title: string
  width: number
  height: number
  selected: boolean
  favorited: boolean
}

export interface DemoGallery {
  id: string
  name: string
  coverImage: string
  photoCount: number
  viewCount: number
  status: 'published' | 'draft' | 'expired'
  createdAt: string
  expiresAt: string | null
  accessCode: string
  isDownloadable: boolean
  photos: DemoPhoto[]
}

export interface DemoClient {
  id: string
  name: string
  email: string
  phone: string
  avatarUrl: string | null
  lifecycleStage: 'prospect' | 'lead' | 'customer' | 'repeat'
  totalSpent: number
  sessionsCount: number
  lastSessionDate: string | null
  tags: string[]
  notes: string
}

export interface DemoSession {
  id: string
  clientId: string
  clientName: string
  sessionType: string
  date: string
  time: string
  duration: number
  location: string
  status: 'inquiry' | 'booked' | 'confirmed' | 'completed' | 'cancelled'
  totalAmount: number
  depositAmount: number
  depositPaid: boolean
  balancePaid: boolean
  contractSigned: boolean
}

export interface DemoPayment {
  id: string
  clientName: string
  sessionId: string
  amount: number
  type: 'deposit' | 'final_payment' | 'full_payment'
  status: 'pending' | 'completed' | 'failed' | 'refunded'
  date: string
  method: string
}

export interface DemoMetrics {
  totalRevenue: number
  revenueChange: number
  activeSessions: number
  upcomingThisWeek: number
  totalClients: number
  newClientsThisMonth: number
  galleryViews: number
  galleryViewsChange: number
  pendingInvoices: number
  overdueAmount: number
}

// Sample photos using placeholder images
const createDemoPhotos = (galleryId: string, count: number): DemoPhoto[] => {
  const categories = ['portrait', 'wedding', 'nature', 'urban', 'event']
  const category = categories[parseInt(galleryId.slice(-1)) % categories.length]

  return Array.from({ length: count }, (_, i) => ({
    id: `${galleryId}-photo-${i + 1}`,
    url: `https://picsum.photos/seed/${galleryId}-${i}/1200/800`,
    thumbnailUrl: `https://picsum.photos/seed/${galleryId}-${i}/400/300`,
    title: `${category.charAt(0).toUpperCase() + category.slice(1)} Photo ${i + 1}`,
    width: 1200,
    height: 800,
    selected: i < 5,
    favorited: i % 3 === 0,
  }))
}

export const demoGalleries: DemoGallery[] = [
  {
    id: 'gallery-1',
    name: 'Johnson Wedding - Reception',
    coverImage: 'https://picsum.photos/seed/wedding1/800/600',
    photoCount: 156,
    viewCount: 324,
    status: 'published',
    createdAt: '2026-01-15',
    expiresAt: '2026-04-15',
    accessCode: 'JOHNSON2026',
    isDownloadable: true,
    photos: createDemoPhotos('gallery-1', 24),
  },
  {
    id: 'gallery-2',
    name: 'Martinez Family Portrait Session',
    coverImage: 'https://picsum.photos/seed/family1/800/600',
    photoCount: 48,
    viewCount: 89,
    status: 'published',
    createdAt: '2026-01-20',
    expiresAt: '2026-03-20',
    accessCode: 'MARTINEZ26',
    isDownloadable: true,
    photos: createDemoPhotos('gallery-2', 18),
  },
  {
    id: 'gallery-3',
    name: 'Corporate Headshots - TechStart Inc',
    coverImage: 'https://picsum.photos/seed/corporate1/800/600',
    photoCount: 32,
    viewCount: 156,
    status: 'published',
    createdAt: '2026-01-22',
    expiresAt: null,
    accessCode: 'TECHSTART',
    isDownloadable: false,
    photos: createDemoPhotos('gallery-3', 16),
  },
  {
    id: 'gallery-4',
    name: 'Smith Engagement Session',
    coverImage: 'https://picsum.photos/seed/engagement1/800/600',
    photoCount: 72,
    viewCount: 45,
    status: 'draft',
    createdAt: '2026-01-28',
    expiresAt: null,
    accessCode: 'SMITH2026',
    isDownloadable: true,
    photos: createDemoPhotos('gallery-4', 20),
  },
  {
    id: 'gallery-5',
    name: 'Davis Newborn Session',
    coverImage: 'https://picsum.photos/seed/newborn1/800/600',
    photoCount: 64,
    viewCount: 0,
    status: 'draft',
    createdAt: '2026-01-30',
    expiresAt: null,
    accessCode: 'DAVIS2026',
    isDownloadable: true,
    photos: createDemoPhotos('gallery-5', 16),
  },
]

export const demoClients: DemoClient[] = [
  {
    id: 'client-1',
    name: 'Sarah Johnson',
    email: 'sarah.johnson@email.com',
    phone: '(555) 123-4567',
    avatarUrl: 'https://i.pravatar.cc/150?u=sarah',
    lifecycleStage: 'repeat',
    totalSpent: 8500,
    sessionsCount: 4,
    lastSessionDate: '2026-01-15',
    tags: ['wedding', 'vip', 'referral-source'],
    notes: 'Referred 3 new clients. Prefers natural lighting.',
  },
  {
    id: 'client-2',
    name: 'Michael Martinez',
    email: 'michael.m@email.com',
    phone: '(555) 234-5678',
    avatarUrl: 'https://i.pravatar.cc/150?u=michael',
    lifecycleStage: 'customer',
    totalSpent: 1200,
    sessionsCount: 1,
    lastSessionDate: '2026-01-20',
    tags: ['family', 'outdoor'],
    notes: 'Annual family portraits. Kids ages 5 and 8.',
  },
  {
    id: 'client-3',
    name: 'TechStart Inc',
    email: 'hr@techstart.com',
    phone: '(555) 345-6789',
    avatarUrl: null,
    lifecycleStage: 'repeat',
    totalSpent: 4800,
    sessionsCount: 2,
    lastSessionDate: '2026-01-22',
    tags: ['corporate', 'headshots', 'bulk'],
    notes: 'Quarterly headshot sessions for new employees.',
  },
  {
    id: 'client-4',
    name: 'Emily & James Smith',
    email: 'emily.smith@email.com',
    phone: '(555) 456-7890',
    avatarUrl: 'https://i.pravatar.cc/150?u=emily',
    lifecycleStage: 'lead',
    totalSpent: 500,
    sessionsCount: 1,
    lastSessionDate: '2026-01-28',
    tags: ['engagement', 'wedding-prospect'],
    notes: 'Wedding date: June 2026. Interested in full package.',
  },
  {
    id: 'client-5',
    name: 'Amanda Davis',
    email: 'amanda.d@email.com',
    phone: '(555) 567-8901',
    avatarUrl: 'https://i.pravatar.cc/150?u=amanda',
    lifecycleStage: 'customer',
    totalSpent: 950,
    sessionsCount: 1,
    lastSessionDate: '2026-01-30',
    tags: ['newborn', 'first-time-parent'],
    notes: 'Baby born January 25. Milestone package interest.',
  },
  {
    id: 'client-6',
    name: 'Robert Chen',
    email: 'robert.chen@email.com',
    phone: '(555) 678-9012',
    avatarUrl: 'https://i.pravatar.cc/150?u=robert',
    lifecycleStage: 'prospect',
    totalSpent: 0,
    sessionsCount: 0,
    lastSessionDate: null,
    tags: ['event', 'corporate'],
    notes: 'Inquired about company anniversary event.',
  },
]

export const demoSessions: DemoSession[] = [
  {
    id: 'session-1',
    clientId: 'client-1',
    clientName: 'Sarah Johnson',
    sessionType: 'Wedding Reception',
    date: '2026-01-15',
    time: '14:00',
    duration: 360,
    location: 'Grand Ballroom, Hilton Downtown',
    status: 'completed',
    totalAmount: 3500,
    depositAmount: 1000,
    depositPaid: true,
    balancePaid: true,
    contractSigned: true,
  },
  {
    id: 'session-2',
    clientId: 'client-2',
    clientName: 'Michael Martinez',
    sessionType: 'Family Portrait',
    date: '2026-01-20',
    time: '10:00',
    duration: 120,
    location: 'City Park, East Pavilion',
    status: 'completed',
    totalAmount: 650,
    depositAmount: 200,
    depositPaid: true,
    balancePaid: true,
    contractSigned: true,
  },
  {
    id: 'session-3',
    clientId: 'client-3',
    clientName: 'TechStart Inc',
    sessionType: 'Corporate Headshots',
    date: '2026-01-22',
    time: '09:00',
    duration: 240,
    location: 'TechStart HQ, Conference Room A',
    status: 'completed',
    totalAmount: 2400,
    depositAmount: 800,
    depositPaid: true,
    balancePaid: true,
    contractSigned: true,
  },
  {
    id: 'session-4',
    clientId: 'client-4',
    clientName: 'Emily & James Smith',
    sessionType: 'Engagement Session',
    date: '2026-01-28',
    time: '16:00',
    duration: 90,
    location: 'Riverside Gardens',
    status: 'completed',
    totalAmount: 500,
    depositAmount: 150,
    depositPaid: true,
    balancePaid: true,
    contractSigned: true,
  },
  {
    id: 'session-5',
    clientId: 'client-5',
    clientName: 'Amanda Davis',
    sessionType: 'Newborn Session',
    date: '2026-01-30',
    time: '11:00',
    duration: 180,
    location: 'Studio A',
    status: 'completed',
    totalAmount: 950,
    depositAmount: 300,
    depositPaid: true,
    balancePaid: false,
    contractSigned: true,
  },
  {
    id: 'session-6',
    clientId: 'client-4',
    clientName: 'Emily & James Smith',
    sessionType: 'Wedding',
    date: '2026-06-15',
    time: '12:00',
    duration: 480,
    location: 'Vineyard Estate',
    status: 'booked',
    totalAmount: 5500,
    depositAmount: 1500,
    depositPaid: true,
    balancePaid: false,
    contractSigned: true,
  },
  {
    id: 'session-7',
    clientId: 'client-2',
    clientName: 'Michael Martinez',
    sessionType: 'Family Portrait',
    date: '2026-02-15',
    time: '10:00',
    duration: 120,
    location: 'Studio B',
    status: 'confirmed',
    totalAmount: 650,
    depositAmount: 200,
    depositPaid: true,
    balancePaid: false,
    contractSigned: true,
  },
  {
    id: 'session-8',
    clientId: 'client-6',
    clientName: 'Robert Chen',
    sessionType: 'Corporate Event',
    date: '2026-03-10',
    time: '18:00',
    duration: 300,
    location: 'Chen Industries HQ',
    status: 'inquiry',
    totalAmount: 3200,
    depositAmount: 1000,
    depositPaid: false,
    balancePaid: false,
    contractSigned: false,
  },
]

export const demoPayments: DemoPayment[] = [
  {
    id: 'payment-1',
    clientName: 'Sarah Johnson',
    sessionId: 'session-1',
    amount: 1000,
    type: 'deposit',
    status: 'completed',
    date: '2025-12-01',
    method: 'Credit Card',
  },
  {
    id: 'payment-2',
    clientName: 'Sarah Johnson',
    sessionId: 'session-1',
    amount: 2500,
    type: 'final_payment',
    status: 'completed',
    date: '2026-01-20',
    method: 'Bank Transfer',
  },
  {
    id: 'payment-3',
    clientName: 'Michael Martinez',
    sessionId: 'session-2',
    amount: 650,
    type: 'full_payment',
    status: 'completed',
    date: '2026-01-18',
    method: 'Credit Card',
  },
  {
    id: 'payment-4',
    clientName: 'TechStart Inc',
    sessionId: 'session-3',
    amount: 2400,
    type: 'full_payment',
    status: 'completed',
    date: '2026-01-22',
    method: 'Invoice',
  },
  {
    id: 'payment-5',
    clientName: 'Emily & James Smith',
    sessionId: 'session-4',
    amount: 500,
    type: 'full_payment',
    status: 'completed',
    date: '2026-01-25',
    method: 'Credit Card',
  },
  {
    id: 'payment-6',
    clientName: 'Amanda Davis',
    sessionId: 'session-5',
    amount: 300,
    type: 'deposit',
    status: 'completed',
    date: '2026-01-28',
    method: 'Credit Card',
  },
  {
    id: 'payment-7',
    clientName: 'Emily & James Smith',
    sessionId: 'session-6',
    amount: 1500,
    type: 'deposit',
    status: 'completed',
    date: '2026-01-30',
    method: 'Credit Card',
  },
]

export const demoMetrics: DemoMetrics = {
  totalRevenue: 15850,
  revenueChange: 23.5,
  activeSessions: 3,
  upcomingThisWeek: 1,
  totalClients: 6,
  newClientsThisMonth: 2,
  galleryViews: 614,
  galleryViewsChange: 12.3,
  pendingInvoices: 2,
  overdueAmount: 650,
}

export const demoChartData = [
  { month: 'Aug', revenue: 8200 },
  { month: 'Sep', revenue: 11500 },
  { month: 'Oct', revenue: 9800 },
  { month: 'Nov', revenue: 14200 },
  { month: 'Dec', revenue: 12100 },
  { month: 'Jan', revenue: 15850 },
]

export const demoUser = {
  id: 'demo-user',
  name: 'Demo Photographer',
  email: 'demo@focusflow.app',
  businessName: 'Demo Photography Studio',
  avatarUrl: 'https://i.pravatar.cc/150?u=demo',
  subscriptionTier: 'professional' as const,
  subscriptionStatus: 'active' as const,
}

// Session types offered
export const sessionTypes = [
  { id: 'wedding', name: 'Wedding', duration: 480, basePrice: 3500 },
  { id: 'engagement', name: 'Engagement Session', duration: 90, basePrice: 500 },
  { id: 'portrait', name: 'Portrait Session', duration: 60, basePrice: 350 },
  { id: 'family', name: 'Family Portrait', duration: 120, basePrice: 650 },
  { id: 'newborn', name: 'Newborn Session', duration: 180, basePrice: 950 },
  { id: 'headshots', name: 'Professional Headshots', duration: 60, basePrice: 250 },
  { id: 'corporate', name: 'Corporate Event', duration: 240, basePrice: 2400 },
  { id: 'maternity', name: 'Maternity Session', duration: 90, basePrice: 450 },
]

// Available time slots for booking
export const availableTimeSlots = [
  '09:00', '10:00', '11:00', '13:00', '14:00', '15:00', '16:00', '17:00'
]
