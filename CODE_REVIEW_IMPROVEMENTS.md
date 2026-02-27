# Codebase Analysis & Main Improvement Plan

## Snapshot
- Stack: Next.js App Router + React 19 + Prisma/PostgreSQL.
- Size: 122 TS/JS source files, ~26k lines in `src`.
- Main risks identified: authentication/session hardening, repeated client auth logic, very large page components, and missing lint/test guardrails.

## Priority 0 (Security & correctness)
1. **Upgrade password hashing from SHA-256 to Argon2 (or bcrypt) with per-password salt**.
   - Current implementation uses direct SHA-256 hashing and equality comparison.
   - Impact: credential database exposure is significantly more dangerous without memory-hard password hashing.

2. **Move session tokens from `localStorage` into HttpOnly secure cookies**.
   - Tokens are currently stored in browser storage and manually attached to `Authorization` headers from many pages.
   - Impact: increased XSS blast radius and duplicated auth plumbing across the app.

3. **Add rate limiting for auth and engagement endpoints** (`/api/auth/login`, `/api/auth/register`, likes/views).
   - Current endpoints have validation but no throttling.
   - Impact: brute-force and spam risks.

## Priority 1 (Architecture & maintainability)
4. **Extract shared auth client into a single hook/service** (`useAuth` + `apiClient`).
   - The same token lookup, `/api/auth/me` checks, and logout cleanup patterns are repeated in many pages.
   - Impact: lower bug risk, smaller components, easier token migration.

5. **Split very large page components into feature modules**.
   - Several pages exceed 800-1500 lines, reducing readability and making regressions easier.
   - Impact: faster onboarding and safer refactors.

6. **Replace broad `any` usage with strict DTO/types + zod validation at API boundaries**.
   - Dynamic `any` patterns exist in routes and parsing logic.
   - Impact: better IDE support and fewer runtime surprises.

## Priority 2 (Performance & operations)
7. **Disable Prisma query logging in production by default**.
   - Prisma client currently initializes with query logging enabled globally.
   - Impact: noisy logs, potential sensitive metadata leakage, and overhead.

8. **Add pagination/cursor support for list endpoints and UI**.
   - Theme lists currently fetch all rows ordered by likes/date.
   - Impact: better scale and lower response times as theme count grows.

9. **Add DB indexes aligned to common filters/sorts**.
   - Consider composite indexes such as `(status, createdAt)` and `(category, likesCount)` based on query patterns.
   - Impact: predictable performance for dashboard/admin browsing.

## Priority 3 (DX, quality, product)
10. **Set up real lint/test pipeline and CI checks**.
    - `npm run lint` currently fails due to missing ESLint installation.
    - Add ESLint + TypeScript strict mode checks + lightweight API route tests.

11. **Consolidate duplicated dashboard logic (`dashboard` vs `creator/dashboard`)**.
    - Similar fetch/mutation workflows can be shared via feature components and hooks.

12. **Formalize upload lifecycle**.
    - Upload DELETE currently acknowledges cleanup but does not remove blob assets.
    - Add actual deletion job/API path and orphan cleanup policy.

## Suggested execution order (4-week practical roadmap)
- **Week 1**: Password hashing migration + cookie sessions + centralized auth helper.
- **Week 2**: Component decomposition for largest pages + typed API schemas.
- **Week 3**: Pagination + DB index updates + production logging policy.
- **Week 4**: CI quality gates + upload lifecycle cleanup + tech debt pass.

## Quick wins (can do immediately)
- Install and configure ESLint CLI migration from `next lint`.
- Add a `src/lib/api-client.ts` helper to remove repeated fetch/header boilerplate.
- Gate Prisma `log: ['query']` behind `NODE_ENV !== 'production'`.
