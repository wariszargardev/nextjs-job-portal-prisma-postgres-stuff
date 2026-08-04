# Candidate guide

For users with the `CANDIDATE` role — people looking for a job.

## Getting started

1. Register at `/register`, picking "Candidate" as the role, or log in at `/login` if you
   already have an account.
2. Already-logged-in candidates who visit `/login` or `/register` are redirected to `/`
   automatically (handled centrally in `proxy.ts`).

## What you can do

| Page | Path | Notes |
|---|---|---|
| Browse jobs | `/jobs` | Public — filter by keyword/location |
| Job details | `/jobs/:jobId` | Public |
| Apply to a job | `/jobs/:jobId/apply` | Upload a resume (PDF/DOC/DOCX, ≤5MB) and add a cover note |
| My applications | `/candidate/applications` | Track the status of everything you've applied to |

## Application statuses

`PENDING` → `REVIEWING` → `SHORTLISTED` / `REJECTED` / `HIRED`. Status is set by the employer;
you can't change it yourself.

## Access rules

- `/candidate/**` requires a `CANDIDATE` session — an `EMPLOYER` or `ADMIN` account visiting these
  pages is redirected to `/`, not shown the candidate's data.
- Not logged in and you hit a `/candidate/**` page → redirected to `/login`, then back to the page
  you wanted after signing in.

## API endpoints this role uses

See `postman/README.md` for the full list; the ones relevant here are `GET/POST /api/applications`,
`POST /api/upload`, and the public `GET /api/jobs*` endpoints.
