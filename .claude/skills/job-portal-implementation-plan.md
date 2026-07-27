# Job Portal — Implementation Plan
**Stack:** Next.js 14+ (App Router) · TypeScript · Prisma ORM · PostgreSQL · NextAuth.js · Zod · Tailwind + shadcn/ui · Vercel + Neon/Vercel Postgres

This plan consolidates the three earlier blueprints into one buildable spec, and bakes in the lessons from the Prisma/Supabase dashboard project review (thin routes, one real implementation per resource, wired validators, shared error handling, auth gates from day one — not bolted on later).

---

## 1. Decisions Locked In

| Decision | Choice | Why |
|---|---|---|
| ORM | **Prisma** | You already know it from the dashboard project; multi-file schema pattern carries over directly. |
| Roles | **EMPLOYER / CANDIDATE** | Two-sided marketplace — peer actor types with different dashboards, not a privilege hierarchy. |
| DB host | **Neon** (via Vercel integration) or Vercel Postgres | Both are serverless Postgres that pair natively with Vercel deploys. |
| Auth | **NextAuth.js (Auth.js) v5, Credentials Provider** | Matches blueprint #3; email+password now, OAuth can be added later without a rewrite. |
| File storage | **Local filesystem in dev → Azure Blob (or Vercel Blob) in prod** | Vercel's filesystem is read-only/ephemeral at runtime, so local storage cannot survive to production — this is a hard constraint, not a preference. Build the storage interface behind `file.service.ts` from day one so swapping the backend is a one-file change. |

---

## 2. Folder Structure

```
prisma/
├── schema/
│   ├── enums.prisma          # Role, AppStatus
│   ├── user.prisma
│   ├── job.prisma
│   └── application.prisma
├── seed/
│   ├── userSeeder.ts
│   ├── jobSeeder.ts
│   └── applicationSeeder.ts
└── migrations/

src/
├── app/
│   ├── (public)/
│   │   ├── page.tsx                    # landing
│   │   └── jobs/
│   │       ├── page.tsx                # browse + filter (Server Component)
│   │       └── [jobId]/page.tsx        # job detail + apply CTA
│   ├── (auth)/
│   │   ├── login/page.tsx
│   │   └── register/page.tsx           # role selector: employer | candidate
│   ├── (dashboard)/
│   │   ├── employer/
│   │   │   ├── jobs/page.tsx           # manage own listings
│   │   │   ├── jobs/[jobId]/edit/page.tsx
│   │   │   └── applications/page.tsx   # review applicants, update status
│   │   └── candidate/
│   │       └── applications/page.tsx   # my applications + status
│   └── api/
│       ├── auth/[...nextauth]/route.ts
│       ├── jobs/route.ts               # GET (list), POST (create, employer only)
│       ├── jobs/[jobId]/route.ts       # GET, PATCH, DELETE
│       ├── applications/route.ts       # GET (mine), POST (apply)
│       ├── applications/[appId]/route.ts   # PATCH status (employer only)
│       └── upload/route.ts             # resume upload
│
├── lib/
│   ├── db/
│   │   └── prisma.ts                   # PrismaClient + @prisma/adapter-pg, cached on globalThis
│   ├── auth/
│   │   ├── authOptions.ts              # NextAuth config
│   │   └── requireRole.ts              # session + role guard, used in every mutating route
│   ├── controllers/
│   │   ├── jobController.ts
│   │   └── applicationController.ts
│   ├── services/
│   │   ├── jobService.ts
│   │   ├── applicationService.ts
│   │   └── fileService.ts
│   ├── validators/
│   │   ├── jobValidator.ts             # Zod schemas
│   │   └── applicationValidator.ts
│   ├── resources/
│   │   ├── jobResource.ts              # response shaping — kept in sync with service selects
│   │   └── applicationResource.ts
│   ├── errors/
│   │   └── handlePrismaError.ts        # single P2002/P2003/P2025 → HTTP status mapper
│   └── models/
│       └── types.ts                    # PublicJob, JobWithEmployer, filter types
│
└── components/
    ├── forms/                          # JobForm, ApplyForm, LoginForm
    └── ui/                             # shadcn/ui primitives
```

**Rule carried over from the architecture review:** every resource gets exactly **one** implementation of route → controller → service. No parallel/experimental routes living next to the real ones — if you want a scratch space, put it outside `app/api/` entirely (e.g. a local `/scratch` script, never a shipped route).

---

## 3. Database Schema

```prisma
// prisma/schema/enums.prisma
enum Role {
  EMPLOYER
  CANDIDATE
}

enum AppStatus {
  PENDING
  REVIEWING
  SHORTLISTED
  REJECTED
  HIRED
}
```

```prisma
// prisma/schema/user.prisma
model User {
  id           String   @id @default(cuid())
  email        String   @unique
  password     String
  name         String
  role         Role
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt

  jobs         Job[]              @relation("EmployerJobs")
  applications JobApplication[]   @relation("CandidateApplications")
}
```

```prisma
// prisma/schema/job.prisma
model Job {
  id           String   @id @default(cuid())
  title        String
  description  String
  location     String
  department   String?
  isPublished  Boolean  @default(true)
  employerId   String
  employer     User     @relation("EmployerJobs", fields: [employerId], references: [id], onDelete: Cascade)
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt

  applications JobApplication[]

  @@index([location])
  @@index([isPublished])
}
```

```prisma
// prisma/schema/application.prisma
model JobApplication {
  id          String    @id @default(cuid())
  jobId       String
  job         Job       @relation(fields: [jobId], references: [id], onDelete: Cascade)
  candidateId String
  candidate   User      @relation("CandidateApplications", fields: [candidateId], references: [id], onDelete: Cascade)
  status      AppStatus @default(PENDING)
  coverNote   String?
  resumePath  String?
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt

  @@unique([jobId, candidateId])   // one application per candidate per job
}
```

---

## 4. Auth & Authorization

- **NextAuth v5, Credentials Provider.** Passwords hashed with `bcrypt` before insert; never stored or logged in plaintext.
- **Session callback** embeds `id` and `role` into the JWT/session so every server component and route handler can read it without a DB round-trip.
- **`requireRole()` helper** — every mutating route calls this first:

```ts
// lib/auth/requireRole.ts
export async function requireRole(roles: Role[]) {
  const session = await getServerSession(authOptions);
  if (!session || !roles.includes(session.user.role)) {
    throw new UnauthorizedError();
  }
  return session;
}
```

- **Ownership checks, not just role checks.** Role tells you an employer *can* edit jobs; it doesn't tell you they own *this* job. `jobService.updateJob` must verify `job.employerId === session.user.id` before writing — this is the gap the architecture review flagged (no auth check reaches this deep in the older project) and it's the most common real-world bug in RBAC systems, so bake it into the service layer, not just the controller.
- Middleware (`middleware.ts`) redirects unauthenticated users away from `(dashboard)` routes at the edge, before the page even renders — belt-and-braces alongside the server-side check.

---

## 5. Request Lifecycle (applies to every resource)

```
route.ts        → wires HTTP verb to a controller export, nothing else
controller.ts   → parses request, runs Zod validator, calls requireRole/ownership check,
                   calls service, catches errors via handlePrismaError, shapes response via resource
service.ts      → the only place Prisma is called; explicit `select`, no `include *`
resource.ts     → maps Prisma result → public JSON shape (kept in sync with service select — this is
                   where the old project's stale postResource bug came from; update both together)
```

**Shared error mapper** (`lib/errors/handlePrismaError.ts`) — one function, used in every controller's catch block:
```ts
export function handlePrismaError(e: unknown) {
  if (e instanceof Prisma.PrismaClientKnownRequestError) {
    if (e.code === "P2002") return NextResponse.json({ error: "Already exists" }, { status: 409 });
    if (e.code === "P2025") return NextResponse.json({ error: "Not found" }, { status: 404 });
    if (e.code === "P2003") return NextResponse.json({ error: "Invalid reference" }, { status: 400 });
  }
  if (e instanceof UnauthorizedError) return NextResponse.json({ error: e.message }, { status: 403 });
  console.error(e);
  return NextResponse.json({ error: "Internal error" }, { status: 500 });
}
```

**Validators are mandatory, not optional.** Every POST/PATCH route runs its Zod schema before the controller does anything else — this directly fixes the "validator built but ignored" issue from the review.

---

## 6. Feature Checklist

| Area | Feature | Notes |
|---|---|---|
| Auth | Register/login, role selection at signup | Candidates and employers use the same form, role picked at registration |
| Auth | RBAC middleware + server-side guard | Both layers, not just one |
| Jobs | Browse (public, Server Component, paginated) | SSR for SEO/perf |
| Jobs | Filter by keyword + location | Client Component, updates `searchParams`, page re-fetches server-side |
| Jobs | Job detail page | Dynamic route, includes Apply button (candidates only) |
| Jobs | Employer CRUD (create/edit/delete/publish toggle) | Ownership-checked |
| Applications | Apply with cover note + resume upload | One application per job per candidate (DB-enforced via `@@unique`) |
| Applications | Candidate: view own applications + status | |
| Applications | Employer: view applicants per job, update status | Status transitions can stay unrestricted initially (PENDING→any); add a state-machine guard later if needed |
| Files | Resume upload | Local disk in dev, Azure Blob or Vercel Blob in prod — swap only inside `fileService.ts` |

---

## 7. Phased Build Order

**Phase 0 — Foundation**
Repo scaffold, Tailwind + shadcn/ui, Prisma schema + first migration, seed script, `lib/db/prisma.ts`, `.env.example`.

**Phase 1 — Auth**
NextAuth config, register/login pages, `requireRole`, middleware, session-aware navbar.

**Phase 2 — Jobs (read path)**
Public browse + detail pages, `jobService.list/get`, filter UI.

**Phase 3 — Jobs (write path)**
Employer dashboard CRUD, ownership checks, validators, resource shaping.

**Phase 4 — Applications**
Apply flow, file upload (local), candidate "my applications" view.

**Phase 5 — Employer review flow**
Applicant list per job, status update, `@@unique` constraint handling (friendly "already applied" message).

**Phase 6 — Hardening**
Shared error mapper wired everywhere, loading/error boundaries, empty states, basic rate limiting on `/api/auth`.

**Phase 7 — Production file storage + deploy**
Swap `fileService` to Vercel Blob (simplest, same-vendor) or Azure Blob; deploy.

---

## 8. Deployment to Vercel

1. **Provision Postgres.** In the Vercel dashboard → Storage → create a **Neon** or **Vercel Postgres** database (both are one click from the project's Storage tab). This auto-populates `DATABASE_URL` (and `DIRECT_URL` if using Prisma's connection pooling pattern) as project env vars.
2. **Prisma + serverless Postgres.** Use `@prisma/adapter-pg` (as in your dashboard project) or Prisma Accelerate if you want pooled connections at the edge — either avoids the "too many connections" failure mode serverless functions are prone to with a naive Prisma client.
3. **Env vars in Vercel:** `DATABASE_URL`, `NEXTAUTH_SECRET`, `NEXTAUTH_URL` (your production domain), plus blob storage credentials once Phase 7 lands. Set these under Project Settings → Environment Variables for Production, Preview, and Development separately.
4. **Migrations on deploy.** Add a `postinstall` or Vercel Build Command step: `prisma generate && prisma migrate deploy`. `migrate deploy` (not `migrate dev`) is the one safe to run against a live database — it only applies already-created migration files, never generates new ones interactively.
5. **Connect GitHub repo to Vercel** for automatic deploys on push; every PR gets its own Preview deployment with its own env-var scope, which is useful for testing schema changes before they hit `main`.
6. **Seed production carefully.** Don't run your dev seeder against prod. If you want demo data live, gate it behind a one-time script you run manually via `vercel env pull` + local `tsx` against the prod `DATABASE_URL`.
7. **Post-deploy smoke test:** register as employer, post a job, register as candidate, apply, confirm the employer dashboard shows the applicant.

---

## 9. What Not to Repeat From the Dashboard Project

Straight from the architecture review — apply these from the start instead of retrofitting later:

- Don't let a second "learning"/experimental route exist next to the real one for the same resource.
- Wire validators into controllers immediately; don't build them and then hand-roll checks anyway.
- Keep `resource.ts` shapes in sync with `service.ts` selects the moment either changes — a stale resource silently drops fields.
- Write `handlePrismaError` once, on day one, and import it everywhere — don't let four controllers grow four slightly different versions of the same catch block.
- Auth/ownership checks belong in the service layer, not just the controller — every mutation route should be un-callable by the wrong user from the very first commit, not patched in during hardening.

---

**Next step, if useful:** I can generate the actual Prisma schema files, the `requireRole`/`handlePrismaError` helpers, and a starter `jobService.ts` + `jobController.ts` pair as real code to drop into the repo.
