# Phase 1: Core ERP Platform

## Overview

Build the foundational ERP platform with appointment scheduling, client management, payment processing, and basic reporting.

**Duration:** 5-6 weeks
**Goal:** Functional scheduling and payment platform for service businesses

---

## Milestones

### M1: TurboRepo Foundation (Week 1)

- [ ] Initialize TurboRepo monorepo
- [ ] Create apps/web (Next.js 15)
- [ ] Create apps/api (Fastify)
- [ ] Create shared packages:
  - @ff/db (Prisma ORM)
  - @ff/auth (NextAuth)
  - @ff/ui (shadcn/ui components)
  - @ff/utils (shared utilities)
- [ ] Configure TypeScript paths
- [ ] Set up CI/CD pipeline

**Project Structure:**
```
focusflow/
├── apps/
│   ├── web/        # Next.js 15
│   └── api/        # Fastify
├── packages/
│   ├── db/         # Prisma
│   ├── auth/       # NextAuth
│   ├── ui/         # shadcn/ui
│   └── utils/      # Helpers
└── turbo.json
```

**Acceptance Criteria:**
- `turbo dev` starts all services
- `turbo build` builds all packages
- TypeScript compiles without errors

### M2: Database & Authentication (Week 1-2)

- [ ] Set up Prisma in packages/db
- [ ] Implement core schema:
  - Business, Staff, Client
  - Appointment, Service
  - Product, Waiver
- [ ] Configure Neon/Supabase PostgreSQL
- [ ] Set up NextAuth in packages/auth
- [ ] Implement auth providers:
  - Email magic link
  - Google OAuth
- [ ] Create protected route middleware
- [ ] Implement role-based access control

**Acceptance Criteria:**
- Users can register and login
- Multi-tenant business isolation
- Staff roles properly enforced

### M3: Dashboard Layout & Navigation (Week 2)

- [ ] Implement responsive dashboard layout
- [ ] Create navigation sidebar
- [ ] Build top bar with user menu
- [ ] Set up shadcn/ui component library
- [ ] Create common components:
  - DataTable
  - Forms
  - Modals
  - Alerts/Toasts
- [ ] Implement dark/light mode

**Acceptance Criteria:**
- Dashboard renders on mobile/desktop
- Navigation works across all pages
- Components follow design system

### M4: Appointment Scheduling (Week 2-3)

- [ ] Build calendar component (day/week/month views)
- [ ] Appointment CRUD operations
- [ ] Service management
- [ ] Staff availability/scheduling
- [ ] Buffer time between appointments
- [ ] Drag-and-drop rescheduling
- [ ] Appointment status workflow:
  - Scheduled → Confirmed → In Progress → Completed

**Calendar Features:**
| View | Features |
|------|----------|
| Day | Hourly grid, staff columns |
| Week | Multi-staff comparison |
| Month | Overview with counts |
| List | Filterable appointments |

**Acceptance Criteria:**
- Staff can create/edit appointments
- Calendar shows all bookings accurately
- Status changes work correctly

### M5: Client Management (Week 3-4)

- [ ] Client profile pages
- [ ] Contact information management
- [ ] Appointment history display
- [ ] Notes and preferences
- [ ] Search and filtering
- [ ] Client tags/segments
- [ ] Quick client creation from appointment

**Client Profile Sections:**
| Section | Data |
|---------|------|
| Basic Info | Name, email, phone, DOB |
| History | Past appointments, spending |
| Notes | Free-form notes |
| Preferences | Service preferences, allergies |
| Documents | Signed waivers |

**Acceptance Criteria:**
- Client profiles created and editable
- History visible and accurate
- Search returns correct results

### M6: Staff Management (Week 4)

- [ ] Staff profile pages
- [ ] Role assignment (Owner/Manager/Artist/Receptionist)
- [ ] Service assignments
- [ ] Schedule management
- [ ] Working hours configuration
- [ ] Time-off requests
- [ ] Commission rate configuration

**Acceptance Criteria:**
- Staff can be added/edited
- Services assigned to staff
- Schedules display correctly

### M7: Payment Processing (Week 4-5)

- [ ] Stripe Connect integration
- [ ] Deposit collection at booking
- [ ] Point of sale interface
- [ ] Multiple payment methods
- [ ] Split payments
- [ ] Tip handling
- [ ] Receipt generation
- [ ] Refund processing

**Payment Flows:**
| Flow | Description |
|------|-------------|
| Deposit | Collect at booking, apply to final |
| Checkout | Full payment at service completion |
| Split | Multiple payment methods |
| Tip | Add tip during checkout |

**Acceptance Criteria:**
- Stripe payments processed successfully
- Deposits collected and tracked
- POS records all sales

### M8: Basic Reporting (Week 5-6)

- [ ] Dashboard KPI widgets:
  - Today's appointments
  - Revenue (daily/weekly/monthly)
  - New clients
  - Staff utilization
- [ ] Sales reports by date range
- [ ] Revenue by staff member
- [ ] Service popularity
- [ ] Client retention metrics
- [ ] Export to CSV

**Acceptance Criteria:**
- Dashboard shows accurate KPIs
- Reports filter by date range
- Export works correctly

### M9: Notifications (Week 5-6)

- [ ] Email notifications (Resend):
  - Appointment confirmation
  - Reminders (24h, 2h before)
  - Cancellation notices
- [ ] In-app notifications
- [ ] Notification preferences
- [ ] Template customization

**Acceptance Criteria:**
- Confirmation emails sent on booking
- Reminders sent on schedule
- Users can manage preferences

### M10: MVP Polish (Week 6)

- [ ] Mobile responsiveness testing
- [ ] Performance optimization
- [ ] Error handling and logging
- [ ] Loading states and skeletons
- [ ] Accessibility audit
- [ ] Test coverage (80%+)
- [ ] Documentation

**Acceptance Criteria:**
- <2s page load times
- Works on mobile devices
- No critical accessibility issues

---

## Technical Requirements

### Performance Targets

| Metric | Target |
|--------|--------|
| Page load | <2s |
| API response | <200ms |
| Calendar render | <500ms |
| Search results | <300ms |

### Dependencies

```json
{
  "next": "^15.0.0",
  "typescript": "^5.0.0",
  "tailwindcss": "^4.0.0",
  "@tanstack/react-query": "^5.0.0",
  "react-hook-form": "^7.0.0",
  "zod": "^3.0.0",
  "fastify": "^4.0.0",
  "prisma": "^5.0.0",
  "stripe": "^14.0.0",
  "resend": "^3.0.0"
}
```

### Database Hosting

| Option | Best For |
|--------|----------|
| Neon | Serverless, auto-scaling |
| Supabase | Real-time, built-in auth |
| Railway | Simple deployment |

---

## Definition of Done

- [ ] All milestones complete
- [ ] TurboRepo monorepo functional
- [ ] Authentication working
- [ ] Calendar scheduling operational
- [ ] Client management complete
- [ ] Stripe payments processing
- [ ] Basic reports accurate
- [ ] Email notifications sending
- [ ] 80%+ test coverage
- [ ] Mobile responsive
- [ ] Documentation updated
