# Demo Mode Architecture

## Overview

Demo mode allows the FocusFlow photography ERP platform to be showcased without requiring real authentication, database connections, or payment processing. This is essential for portfolio demonstrations, investor presentations, and allowing potential customers to explore the platform.

## How It Works

### Environment Variable

```env
NEXT_PUBLIC_DEMO_MODE=true
```

When this environment variable is set to `true`, the application operates in demo mode.

### Architecture Flow

```
+---------------------------------------------------------------------+
|                        Marketing Pages                               |
|  (Homepage, Features, Pricing, About - Always the same)             |
+---------------------------------------------------------------------+
                                |
                                | User clicks "Sign In" or "Get Started"
                                v
+---------------------------------------------------------------------+
|                    Auth Pages (/login, /signup)                      |
|                                                                      |
|  +-------------------------+    +-------------------------+          |
|  |  DEMO_MODE=false        |    |  DEMO_MODE=true         |          |
|  |  Show NextAuth Forms    |    |  Show Role Selector     |          |
|  +-------------------------+    +-------------------------+          |
+---------------------------------------------------------------------+
                                |
                                | User selects role
                                v
+---------------------------------------------------------------------+
|                    Demo Experience Pages                             |
|                                                                      |
|  /demo/dashboard   - Photographer view (galleries, clients, etc.)   |
|  /demo/assistant   - Assistant view (bookings, communications)      |
|  /demo/admin       - Studio admin view (team, reports, settings)    |
+---------------------------------------------------------------------+
```

## Demo Roles

FocusFlow supports three demo roles, each with different access levels and views:

| Role | Description | Access |
|------|-------------|--------|
| **Photographer** | Primary user of the platform | Full access to galleries, clients, sessions, booking, and analytics |
| **Assistant** | Studio assistant/coordinator | Bookings, client communications, scheduling, session management |
| **Admin** | Studio owner/manager | Team management, financial reports, settings, plus all other features |

## Key Components

### 1. Auth Pages (`/app/(auth)/login/page.tsx`, `/app/(auth)/signup/page.tsx`)

When `NEXT_PUBLIC_DEMO_MODE=true`:
- Shows role selection UI instead of authentication forms
- Stores selected role in localStorage
- Redirects to appropriate demo page based on role

```tsx
// Check if demo mode is enabled
const DEMO_MODE_ENABLED = process.env.NEXT_PUBLIC_DEMO_MODE === 'true';

if (DEMO_MODE_ENABLED) {
  // Show role selection
  return <DemoRoleSelector />;
}

// Normal authentication flow
return <LoginForm />;
```

### 2. Demo Data (`/lib/demo-data.ts`)

Contains all mock data for the demo experience:
- `demoUsers` - Role-specific demo user profiles
- `demoGalleries` - Sample photo galleries
- `demoClients` - Sample client records
- `demoSessions` - Sample photography sessions
- `demoPayments` - Sample payment records
- `demoMetrics` - Dashboard analytics
- `demoTeamMembers` - Team member data for admin view

### 3. Demo Context (`/contexts/demo-context.tsx`)

Provides demo state and data to components:
- `isDemo` - Whether demo mode is active
- `user` - Current demo user
- Demo data getters (galleries, clients, sessions, etc.)
- Action handlers (toggles, filters, etc.)

### 4. Demo Layout (`/app/demo/layout.tsx`)

Wraps all demo pages with:
- Role-aware navigation
- Role switcher for easy role changes
- Demo mode indicator
- Exit demo button

### 5. Demo Pages

| Path | Role | Description |
|------|------|-------------|
| `/demo/dashboard` | Photographer | Main dashboard with revenue, sessions, galleries |
| `/demo/galleries` | All | Photo gallery management |
| `/demo/assistant` | Assistant | Task-focused view with pending actions |
| `/demo/admin` | Admin | Team performance and studio management |
| `/demo/sessions` | All | Session/booking management |
| `/demo/clients` | All | Client relationship management |

## Render Deployment

The `render.yaml` configures deployment with demo mode enabled:

```yaml
services:
  - type: web
    name: focusflow-site
    runtime: docker
    envVars:
      # Demo mode - enables the app without real auth
      - key: NEXT_PUBLIC_DEMO_MODE
        value: "true"
```

## Security Considerations

1. **No Real Data**: Demo mode uses only mock data from `demo-data.ts`
2. **No Real Transactions**: Payment processing is simulated
3. **No Real Auth**: Authentication is bypassed, no real user accounts
4. **Environment Isolation**: Production deployments should set `NEXT_PUBLIC_DEMO_MODE=false`
5. **localStorage Only**: Demo role is stored in browser localStorage, not persisted

## Enabling/Disabling Demo Mode

### Local Development

```bash
# Enable demo mode
NEXT_PUBLIC_DEMO_MODE=true pnpm dev

# Disable demo mode (normal operation)
NEXT_PUBLIC_DEMO_MODE=false pnpm dev
# or simply:
pnpm dev
```

### Production (Render)

Update the `NEXT_PUBLIC_DEMO_MODE` environment variable in `render.yaml` or the Render dashboard:

```yaml
# Demo/showcase deployment
- key: NEXT_PUBLIC_DEMO_MODE
  value: "true"

# Production deployment
- key: NEXT_PUBLIC_DEMO_MODE
  value: "false"
```

## Adding Demo Mode to New Features

When adding new authenticated features:

1. Check if demo mode is enabled:
   ```tsx
   const isDemoMode = process.env.NEXT_PUBLIC_DEMO_MODE === 'true';
   ```

2. Provide mock data for demo mode:
   ```tsx
   const data = isDemoMode ? DEMO_DATA : await fetchRealData();
   ```

3. Disable real API calls in demo mode:
   ```tsx
   if (!isDemoMode) {
     await api.createSession(sessionData);
   }
   ```

4. Add appropriate mock data to `/lib/demo-data.ts`

## File Structure

```
services/web/src/
|-- app/
|   |-- (auth)/
|   |   |-- login/page.tsx       # Demo-aware login
|   |   |-- signup/page.tsx      # Demo-aware signup
|   |-- demo/
|       |-- layout.tsx           # Demo layout with role switcher
|       |-- dashboard/page.tsx   # Photographer dashboard
|       |-- galleries/page.tsx   # Gallery management
|       |-- assistant/page.tsx   # Assistant dashboard
|       |-- admin/page.tsx       # Admin dashboard
|       |-- sessions/            # Session pages
|       |-- clients/             # Client pages
|-- contexts/
|   |-- demo-context.tsx         # Demo state management
|-- lib/
    |-- demo-data.ts             # Mock data definitions
```

## Testing Demo Mode

```bash
# Run with demo mode enabled
NEXT_PUBLIC_DEMO_MODE=true pnpm dev

# Build with demo mode
NEXT_PUBLIC_DEMO_MODE=true pnpm build

# Run tests (if applicable)
pnpm test
```

## Troubleshooting

### Role not persisting after page refresh
The demo role is stored in localStorage. Check that:
- localStorage is available (not in incognito mode with restrictions)
- The key `focusflow-demo-role` exists in localStorage

### Demo mode not activating
Verify that:
- `NEXT_PUBLIC_DEMO_MODE` is set to exactly `"true"` (string)
- The environment variable is available at build time (for Next.js)
- Clear browser cache and rebuild if needed
