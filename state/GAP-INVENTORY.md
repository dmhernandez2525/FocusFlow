# Gap Inventory - RIP Prime Cycle 1

## Tier A (Critical) - Fix First

- [ ] GAP-001: [Tier A] Login/signup forms have no onSubmit handlers
  - **Requirement:** REQ-008, REQ-009
  - **Current state:** Forms render but submit does nothing (login/page.tsx, signup/page.tsx)
  - **Expected state:** Forms submit credentials, show loading/error states
  - **Evidence:** No onSubmit handler on form elements. Buttons are type="submit" but form has no handler.
  - **Consensus:** 4/4 verifiers flagged

- [ ] GAP-002: [Tier A] No error boundaries in app
  - **Requirement:** Discovered
  - **Current state:** No error.tsx files exist anywhere
  - **Expected state:** Root and dashboard layouts should have error boundaries
  - **Evidence:** Unhandled component error = white screen
  - **Consensus:** 3/4 verifiers flagged

- [ ] GAP-003: [Tier A] API routes don't handle malformed JSON
  - **Requirement:** REQ-054, REQ-055
  - **Current state:** request.json() can throw before try/catch (api/tasks/route.ts:83)
  - **Expected state:** Malformed JSON returns 400, not 500
  - **Evidence:** Verifier-2 finding #2
  - **Consensus:** 3/4 verifiers flagged

## Tier B (Important) - Fix Second

- [ ] GAP-004: [Tier B] Dashboard stats are hardcoded
  - **Requirement:** REQ-015, REQ-017
  - **Current state:** All numbers are literals in JSX (dashboard/page.tsx)
  - **Expected state:** Stats should be dynamic (even if from local state for demo)
  - **Consensus:** 4/4 verifiers flagged

- [ ] GAP-005: [Tier B] Tasks page uses hardcoded initial data, no API integration
  - **Requirement:** REQ-025
  - **Current state:** INITIAL_TASKS array in tasks/page.tsx, changes lost on refresh
  - **Expected state:** Tasks persist (at minimum in localStorage for demo mode)
  - **Consensus:** 4/4 verifiers flagged

- [ ] GAP-006: [Tier B] Missing loading/error states on dashboard and tasks pages
  - **Requirement:** Discovered
  - **Current state:** Pages render immediately with static data
  - **Expected state:** Loading skeletons and error states for data fetching
  - **Consensus:** 3/4 verifiers flagged

- [ ] GAP-007: [Tier B] Demo mode not checked in middleware
  - **Requirement:** REQ-011
  - **Current state:** Middleware redirects /dashboard to /login even in demo mode
  - **Expected state:** Demo mode (env var) should bypass auth in middleware
  - **Consensus:** 3/4 verifiers flagged

- [ ] GAP-008: [Tier B] Missing pages: /analytics, /blocker, /settings referenced in nav
  - **Requirement:** REQ-013
  - **Current state:** Nav links to these routes but pages don't exist (404)
  - **Expected state:** At minimum stub pages
  - **Consensus:** 2/4 verifiers flagged, confirmed by code review

- [ ] GAP-009: [Tier B] API error responses don't log errors server-side
  - **Requirement:** REQ-055
  - **Current state:** catch blocks return generic 500 with no logging
  - **Expected state:** console.error with context for debugging
  - **Consensus:** 2/4 verifiers flagged

## Tier C (Completeness) - Fix Last

- [ ] GAP-010: [Tier C] Demo <img> tags should use next/image
  - **Requirement:** Discovered
  - **Current state:** 4 build warnings about <img> in demo pages
  - **Expected state:** Use next/image Image component
  - **Consensus:** Build output shows warnings

- [ ] GAP-011: [Tier C] Unused env vars in env.ts schema (REDIS_URL, SMTP_*, SENTRY_DSN)
  - **Requirement:** REQ-006
  - **Current state:** env.ts validates vars never used in code
  - **Expected state:** Only validate what's actually used
  - **Consensus:** 1/4 verifiers flagged, confirmed

- [ ] GAP-012: [Tier C] API response shape inconsistency (GET vs POST /api/tasks)
  - **Requirement:** REQ-042, REQ-043
  - **Current state:** GET returns {tasks}, POST returns {message, task}
  - **Expected state:** Consistent response shapes
  - **Consensus:** 1/4 verifiers flagged
