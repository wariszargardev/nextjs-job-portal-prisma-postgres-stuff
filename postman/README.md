# Postman collection

Import both files into Postman:

- `Afia-Job-Portal.postman_collection.json`
- `Afia-Job-Portal.postman_environment.json` (select it as the active environment)

## Auth flow (cookie-session, not a bearer token)

This app uses NextAuth credentials + JWT session **cookies**, not a bearer token — so there's no
`Authorization` header to set. Instead, run these once per role before calling protected endpoints:

1. **Auth > Get CSRF Token** — stores `{{csrfToken}}`
2. **Auth > Login as Admin / Employer / Candidate** — signs in; Postman's cookie jar then holds
   the session cookie for `{{baseUrl}}`, so every later request in the same run is authenticated
   as that user until you log in as someone else or hit **Auth > Sign Out**.
3. **Auth > Get Session** — sanity-check which user/role is currently active.

## All endpoints

| Method | Path | Auth | Notes |
|---|---|---|---|
| GET | `/api/auth/csrf`, `/api/auth/session`, `/api/auth/[...nextauth]` | — | NextAuth built-ins |
| POST | `/api/auth/callback/credentials`, `/api/auth/signout` | — | NextAuth built-ins |
| GET | `/api/jobs` | Public | list published jobs — `keyword`, `location`, `page`, `perPage` |
| GET | `/api/jobs/:jobId` | Public | one published job |
| POST | `/api/jobs` | EMPLOYER | create job |
| PATCH | `/api/jobs/:jobId` | EMPLOYER (owner) | update job |
| DELETE | `/api/jobs/:jobId` | EMPLOYER (owner) | delete job |
| GET | `/api/jobs/:jobId/applications` | EMPLOYER (owner) | list applicants for a job |
| GET | `/api/applications` | CANDIDATE | list my applications |
| POST | `/api/applications` | CANDIDATE | apply to a job |
| PATCH | `/api/applications/:appId` | EMPLOYER (owner of the job) | update application status |
| POST | `/api/upload` | CANDIDATE | upload resume, multipart `resume` field, PDF/DOC/DOCX ≤5MB |
| GET | `/api/imcrm/quotes/:quoteType/document-types` | Public (BOR-only codes filtered unless ADMIN) | read path — resolves document types for a quote |
| GET | `/api/imcrm/bor/document-types` | ADMIN | BOR's consolidated read path — `quoteTypeId` required |
| GET | `/api/imcrm/document-types` | ADMIN | admin list — `page`, `pageSize`, `search`, `category`, `quoteTypeId`, `isActive` |
| POST | `/api/imcrm/document-types` | ADMIN | admin create |
| GET | `/api/imcrm/document-types/:id` | ADMIN | admin show |
| PATCH | `/api/imcrm/document-types/:id` | ADMIN | admin update |
| DELETE | `/api/imcrm/document-types/:id` | ADMIN | admin delete (hard delete) |

Seeded accounts (all password `password123`): `admin@example.com`, `employer@example.com`, `candidate@example.com`.
