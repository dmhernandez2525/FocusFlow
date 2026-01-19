# Phase 2: Industry Edition & Advanced Features

## Overview

Expand FocusFlow with industry-specific features for tattoo/piercing shops, advanced inventory management, online booking, and comprehensive analytics.

**Duration:** 5-6 weeks
**Goal:** Industry-leading tattoo shop management with compliance features

---

## Milestones

### M1: Digital Waivers & Consent (Week 1)

- [ ] Waiver template builder
- [ ] E-signature capture (canvas-based)
- [ ] Pre-built waiver templates:
  - Tattoo consent
  - Piercing consent
  - Medical history
  - Photo release
  - Minor consent (parental)
- [ ] Timestamped audit trail
- [ ] IP address logging
- [ ] Digital waiver storage
- [ ] Searchable waiver archive

**Waiver Flow:**
```
Client arrives → Tablet/phone waiver → E-sign →
Automatic storage → Linked to appointment
```

**Acceptance Criteria:**
- Waivers signed digitally with timestamp
- Signatures captured and stored
- Audit trail complete and searchable

### M2: Age Verification & ID Scanning (Week 1-2)

- [ ] ID photo upload interface
- [ ] ID type selection (Driver's license, Passport, etc.)
- [ ] ID number and expiry capture
- [ ] Age calculation from DOB
- [ ] Minor detection with parental consent flow
- [ ] ID verification logging for compliance
- [ ] Retention period management

**Compliance Features:**
| Feature | Purpose |
|---------|---------|
| ID capture | Health department compliance |
| Age verify | Legal requirement for tattoo |
| Audit log | Inspection readiness |
| Retention | Auto-delete after legal period |

**Acceptance Criteria:**
- IDs captured and stored securely
- Age calculated and verified
- Minor consent workflow works

### M3: Commission & Revenue Splitting (Week 2)

- [ ] Commission rate per staff member
- [ ] Commission calculation:
  - Percentage of service
  - Flat fee per service
  - Tiered rates
- [ ] Booth rental management
- [ ] 1099 contractor reporting
- [ ] Tip tracking and distribution
- [ ] Payout reports
- [ ] Revenue split dashboard

**Commission Models:**
| Model | Description |
|-------|-------------|
| Percentage | 50/50, 60/40, 70/30 splits |
| Flat fee | Fixed amount per service |
| Tiered | Higher % at higher revenue |
| Booth rental | Weekly/monthly flat fee |

**Acceptance Criteria:**
- Commissions calculated accurately
- Multiple commission models supported
- Payout reports exportable

### M4: Inventory Management (Week 2-3)

- [ ] Product catalog management
- [ ] Category organization
- [ ] Stock tracking:
  - Quantity on hand
  - Reorder levels
  - Low stock alerts
- [ ] Ink lot/batch tracking (tattoo-specific)
- [ ] Needle and supply tracking
- [ ] Jewelry inventory (piercing):
  - Size, gauge, material
  - Auto-suggest based on piercing type
- [ ] Vendor management
- [ ] Purchase order creation
- [ ] Cost tracking and margins

**Tattoo-Specific Inventory:**
| Item | Tracking |
|------|----------|
| Ink | Lot number, manufacturer, color |
| Needles | Configuration, gauge, count |
| Supplies | Cups, barriers, gloves |
| Aftercare | Retail products |

**Acceptance Criteria:**
- Products tracked with quantities
- Low stock alerts trigger
- Ink lots traceable to clients

### M5: Online Booking Widget (Week 3-4)

- [ ] Embeddable booking widget
- [ ] Branded booking page
- [ ] Service selection
- [ ] Staff selection (or auto-assign)
- [ ] Date/time picker
- [ ] Deposit collection via Stripe
- [ ] Confirmation and reminders
- [ ] Cancellation/reschedule flow
- [ ] Integration with Instagram bio link

**Booking Widget Features:**
| Feature | Description |
|---------|-------------|
| Branding | Custom colors, logo |
| Services | Filter by category, staff |
| Availability | Real-time calendar sync |
| Deposits | Configurable amounts |
| Policies | Cancellation terms display |

**Acceptance Criteria:**
- Widget embeds on external sites
- Bookings sync to main calendar
- Deposits collected successfully

### M6: SMS Notifications (Week 4)

- [ ] SMS provider integration (Twilio/Vonage)
- [ ] Appointment reminders
- [ ] Confirmation messages
- [ ] Custom messages
- [ ] Two-way messaging
- [ ] Opt-in/opt-out management
- [ ] Message templates
- [ ] Delivery tracking

**SMS Triggers:**
| Trigger | Timing |
|---------|--------|
| Confirmation | Immediately on booking |
| Reminder | 24 hours before |
| Reminder | 2 hours before |
| Follow-up | 24 hours after |
| Review request | 3 days after |

**Acceptance Criteria:**
- SMS sends on schedule
- Delivery tracked
- Opt-out respected

### M7: Aftercare System (Week 4-5)

- [ ] Aftercare instruction templates
- [ ] Auto-send after appointment
- [ ] Service-specific instructions:
  - Tattoo aftercare
  - Piercing aftercare by type
- [ ] Email and SMS delivery
- [ ] Follow-up reminders:
  - Touch-up scheduling
  - Healing check-in
- [ ] Aftercare product recommendations

**Acceptance Criteria:**
- Instructions sent automatically
- Templates customizable
- Follow-ups scheduled correctly

### M8: Advanced Analytics (Week 5)

- [ ] Revenue dashboards:
  - By day/week/month/year
  - By staff member
  - By service type
  - By client segment
- [ ] Client analytics:
  - New vs returning
  - Lifetime value
  - Booking patterns
- [ ] Staff performance:
  - Revenue per artist
  - Bookings per day
  - Average ticket size
- [ ] Business health:
  - Utilization rate
  - No-show rate
  - Cancellation rate
- [ ] Scheduled report delivery

**Acceptance Criteria:**
- Dashboards load quickly
- Data accurate and real-time
- Reports exportable

### M9: Portfolio Integration (Week 5-6)

- [ ] Artist portfolio pages
- [ ] Style categorization:
  - Traditional
  - Japanese
  - Blackwork
  - Realism
  - etc.
- [ ] Before/after galleries
- [ ] Photo upload from appointment
- [ ] Client photo consent tracking
- [ ] Instagram sync (read portfolio)
- [ ] Public portfolio sharing

**Acceptance Criteria:**
- Portfolio pages display work
- Photos linked to consents
- Public sharing works

### M10: Multi-Location Support (Week 6)

- [ ] Multiple business locations
- [ ] Location-specific:
  - Staff assignments
  - Services
  - Inventory
  - Settings
- [ ] Cross-location reporting
- [ ] Location switcher in UI
- [ ] Location-aware booking

**Acceptance Criteria:**
- Multiple locations manageable
- Data isolated correctly
- Reports aggregate properly

---

## Technical Requirements

### SMS Provider

| Provider | Best For |
|----------|----------|
| Twilio | Reliability, global reach |
| Vonage | Competitive pricing |
| MessageBird | European compliance |

### Compliance Standards

| Standard | Requirement |
|----------|-------------|
| PCI DSS | Payment card security |
| HIPAA | If storing medical info |
| State regs | Waiver retention periods |
| TCPA | SMS consent |

### Performance Targets

| Metric | Target |
|--------|--------|
| Widget load | <1s |
| Booking submit | <2s |
| Report generation | <5s |
| SMS delivery | <10s |

---

## Pricing Tiers (Updated)

| Tier | Price | Features |
|------|-------|----------|
| Starter | $49/mo | 1 location, 3 staff, basic features |
| Growth | $99/mo | 1 location, unlimited staff, full features |
| Professional | $199/mo | 3 locations, API access, priority support |
| Enterprise | Custom | Unlimited locations, white-label, SLA |

---

## Definition of Done

- [ ] All milestones complete
- [ ] Digital waivers with e-signatures
- [ ] Age verification logging
- [ ] Commission tracking accurate
- [ ] Inventory management functional
- [ ] Online booking widget live
- [ ] SMS notifications working
- [ ] Aftercare system operational
- [ ] Analytics dashboards complete
- [ ] Portfolio pages functional
- [ ] Multi-location support working
- [ ] 85%+ test coverage
- [ ] Performance targets met
- [ ] Documentation complete
