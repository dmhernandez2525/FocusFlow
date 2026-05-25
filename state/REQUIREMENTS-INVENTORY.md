# Requirements Inventory

## Context

The repo docs describe a photography/service-business ERP (4 phases, 200+ features). The actual web app has been pivoted to a **productivity/focus app** with:
- Focus timer (Pomodoro)
- Task management
- Distraction blocking
- Demo mode for portfolio showcase

This inventory covers requirements for the **actual implemented scope** plus core infrastructure that all variants need.

---

## Infrastructure & Build

- REQ-001: [Infra] TurboRepo monorepo builds successfully (`turbo build`) (source: README.md)
- REQ-002: [Infra] TypeScript compiles without errors across all packages (source: roadmap/PHASE_1_CORE.md)
- REQ-003: [Infra] CI pipeline runs lint, type-check, tests (source: .github/workflows/ci.yml)
- REQ-004: [Infra] Docker Compose starts all services (source: docker-compose.yml)
- REQ-005: [Infra] Render.yaml valid and deployable (source: render.yaml)
- REQ-006: [Infra] .env.example documents all required env vars (source: .env.example)
- REQ-007: [Infra] Test coverage >= 80% on all metrics (source: CLAUDE.md, jest.config.js)

## Authentication & Auth

- REQ-008: [Auth] Users can register with email/password (source: signup page, Prisma schema)
- REQ-009: [Auth] Users can login with email/password (source: login page, auth.ts)
- REQ-010: [Auth] Protected routes redirect to login (source: middleware.ts)
- REQ-011: [Auth] Demo mode bypasses auth with localStorage flag (source: docs/DEMO_MODE.md)
- REQ-012: [Auth] Demo mode shows demo banner (source: docs/DEMO_MODE.md)

## Dashboard

- REQ-013: [Dashboard] Responsive dashboard layout with sidebar nav (source: dashboard-layout.tsx)
- REQ-014: [Dashboard] Mobile bottom navigation with FAB menu (source: BottomNav.tsx)
- REQ-015: [Dashboard] Dashboard shows productivity stats (tasks, focus time, completion rate) (source: dashboard page)
- REQ-016: [Dashboard] Dashboard has quick action cards linking to focus/tasks (source: dashboard page)
- REQ-017: [Dashboard] Weekly progress chart (source: dashboard page)

## Focus Timer

- REQ-018: [Focus] Pomodoro timer with work/short break/long break modes (source: use-focus-timer.ts)
- REQ-019: [Focus] Start, pause, resume, reset, skip controls (source: TimerControls.tsx)
- REQ-020: [Focus] Visual progress ring with countdown (source: TimerDisplay.tsx)
- REQ-021: [Focus] Session history tracking (completed/skipped) (source: SessionHistory.tsx)
- REQ-022: [Focus] Configurable durations (work, short break, long break) (source: use-focus-timer.ts)
- REQ-023: [Focus] Auto-transition between work and break modes (source: use-focus-timer.ts)
- REQ-024: [Focus] Sessions-before-long-break configurable (source: use-focus-timer.ts)

## Task Management

- REQ-025: [Tasks] Task CRUD (create, read, update status, delete) (source: API routes + tasks page)
- REQ-026: [Tasks] Priority levels: LOW, MEDIUM, HIGH, URGENT (source: Prisma schema, task-utils.ts)
- REQ-027: [Tasks] Status workflow: TODO, IN_PROGRESS, COMPLETED, CANCELLED (source: Prisma schema)
- REQ-028: [Tasks] Filter tasks by status, priority, project, search text (source: TaskList.tsx, task-utils.ts)
- REQ-029: [Tasks] Sort tasks by priority (source: task-utils.ts)
- REQ-030: [Tasks] Task stats summary (total, todo, active, done) (source: TaskList.tsx)
- REQ-031: [Tasks] Due date display with relative formatting (source: task-utils.ts)
- REQ-032: [Tasks] Project grouping for tasks (source: Prisma schema)

## Distraction Blocking

- REQ-033: [Blocker] Default blocklist of common distracting sites (source: distraction-blocker.ts)
- REQ-034: [Blocker] Add/remove sites from blocklist (source: DistractionBlocker.tsx)
- REQ-035: [Blocker] Category grouping of blocked sites (source: distraction-blocker.ts)
- REQ-036: [Blocker] Session-aware blocking (active during focus) (source: distraction-blocker.ts)
- REQ-037: [Blocker] Enable/disable toggle (source: DistractionBlocker.tsx)

## Marketing / Public Pages

- REQ-038: [Public] Marketing homepage with features, testimonials, CTA (source: public page.tsx)
- REQ-039: [Public] About page (source: about/page.tsx)
- REQ-040: [Public] Login page with form (source: login/page.tsx)
- REQ-041: [Public] Signup page with form (source: signup/page.tsx)

## API

- REQ-042: [API] GET /api/tasks - list tasks with filters (source: api/tasks/route.ts)
- REQ-043: [API] POST /api/tasks - create task with validation (source: api/tasks/route.ts)
- REQ-044: [API] PATCH /api/tasks/[id] - update task (source: api/tasks/[id]/route.ts)
- REQ-045: [API] DELETE /api/tasks/[id] - delete task (source: api/tasks/[id]/route.ts)
- REQ-046: [API] GET /api/health - health check (source: api/health/route.ts)

## Payments Service (Backend)

- REQ-047: [Payments] Stripe payment intent CRUD with idempotency (source: payments service)
- REQ-048: [Payments] Customer CRUD (source: payments service)
- REQ-049: [Payments] Subscription management (source: payments service)
- REQ-050: [Payments] Webhook processing with signature verification (source: payments service)
- REQ-051: [Payments] SQL injection prevention on all queries (source: payments routes)
- REQ-052: [Payments] Rate limiting (source: payments security plugin)

## Code Quality

- REQ-053: [Quality] No hardcoded secrets in committed code (source: CLAUDE.md)
- REQ-054: [Quality] All API inputs validated with Zod schemas (source: task routes)
- REQ-055: [Quality] Error handling on all API routes (source: task routes)
- REQ-056: [Quality] No unused imports or dead code (source: eslint config)
