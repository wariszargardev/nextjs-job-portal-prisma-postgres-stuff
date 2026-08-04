# CLAUDE.md

Project guidance for working in this repo.

## What this is

A Next.js + Prisma + Postgres two-sided job portal (employers post jobs, candidates apply), plus an
**imcrm** module: a port of blanka's (Laravel) `document_types` / `quote_type` resolution logic,
kept deliberately separate from the job-portal code since it's being migrated from a different
system. See `.claude/document-types-nextjs-implementation-plan.md` for the original port plan.

## Layering convention

Both the job-portal and imcrm code follow the same layers, mirroring Laravel's
route → controller → service → resource → validator split so the mental model transfers directly:

- `app/api/**/route.ts` — thin wiring only, exports `GET`/`POST`/etc. from a controller function.
- `lib/controllers/*.ts` (imcrm: `lib/imcrm/controllers/*.ts`) — parses the request, calls the
  service, shapes the response via a resource, catches errors via `handlePrismaError`.
- `lib/services/*.ts` (imcrm: `lib/imcrm/services/*.ts`) — the only place Prisma is queried.
- `lib/resources/*.ts` (imcrm: `lib/imcrm/resources/*.ts`) — maps Prisma rows to the JSON shape
  returned to the frontend (BigInt fields are stringified here).
- `lib/validators/*.ts` (imcrm: `lib/imcrm/validators/*.ts`) — Zod schemas.
- Prisma schema: `prisma/schema/*.prisma` (imcrm models in `prisma/schema/imcrm/*.prisma`),
  multi-file schema, no `@@map`/`@map` — table/column names match model/field names 1:1.
- Seeds: `prisma/seed/*.ts`, run via `prisma/seed/index.ts` (imcrm seeders in `prisma/seed/imcrm/`).

## imcrm namespacing

Everything imcrm-related is namespaced and kept separate from core job-portal code:
`lib/imcrm/**`, `app/api/imcrm/**`, `app/admin/imcrm/**`, `prisma/schema/imcrm/**`,
`prisma/seed/imcrm/**`, `components/imcrm/**`. New imcrm work should follow this same pattern
rather than mixing into the top-level `lib/`/`app/api/` folders.

## Auth

- Roles: `EMPLOYER`, `CANDIDATE`, `ADMIN` (`prisma/schema/enums.prisma`). `ADMIN` currently only
  gates the imcrm admin section.
- **Central middleware is `proxy.ts` at the repo root** (Next.js 16 renamed `middleware.ts` to
  `proxy.ts` — this is not a typo). It is the single place that decides, per path, whether a page
  route needs a session and/or a specific role:
  - `/login`, `/register` — guest-only; an already-authenticated user is redirected to `/`.
  - `/employer/**` → requires role `EMPLOYER`.
  - `/candidate/**` → requires role `CANDIDATE`.
  - `/admin/**` → requires role `ADMIN`.
  - Unauthenticated visits to a protected prefix redirect to `/login?callbackUrl=<path>`.
    Wrong-role visits redirect to `/`.
  - When adding a new protected page prefix, add it to `ROLE_PATH_PREFIXES` (or
    `GUEST_ONLY_PATHS`) **and** to the `matcher` array in the same file — both are required for
    the redirect to actually fire.
- API routes (`app/api/**`) are **not** covered by `proxy.ts` — redirecting a JSON client to an
  HTML login page isn't useful. They gate access themselves via `requireRole()`
  (`lib/auth/requireRole.ts`), which throws `UnauthorizedError` → `handlePrismaError` → `403 JSON`.
- Server components that need a role gate outside `proxy.ts`'s matcher use `requireRolePage()`
  (`lib/auth/requireRolePage.ts`), which **redirects** instead of throwing — use this, not
  `requireRole()`, in any `page.tsx`/`layout.tsx`.

## Dev environment note

This machine's Application Control policy blocks the native `@next/swc-win32-x64-msvc` binary, so
Turbopack (Next's default) cannot start. `dev` and `build` scripts in `package.json` both pass
`--webpack` for this reason — keep that flag if you touch those scripts.

## Standing instructions (do these automatically, not just when re-asked)

- **Whenever an API endpoint is added, removed, or its params/body/auth requirement changes**,
  update `postman/Afia-Job-Portal.postman_collection.json` and `postman/README.md`'s endpoint
  table to match, in the same change. Re-validate the collection JSON parses
  (`node -e "JSON.parse(require('fs').readFileSync('postman/Afia-Job-Portal.postman_collection.json'))"`)
  before considering the task done.
- Seeded test accounts (password `password123` for all): `admin@example.com` (ADMIN),
  `employer@example.com` (EMPLOYER), `candidate@example.com` (CANDIDATE).
