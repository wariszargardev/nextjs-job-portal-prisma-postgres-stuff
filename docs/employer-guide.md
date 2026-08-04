# Employer guide

For users with the `EMPLOYER` role — companies hiring through the portal.

## Getting started

1. Register at `/register`, picking "Employer" as the role, or log in at `/login`.
2. Already-logged-in employers who visit `/login` or `/register` are redirected to `/`
   automatically (handled centrally in `proxy.ts`).

## What you can do

| Page | Path | Notes |
|---|---|---|
| My jobs | `/employer/jobs` | List of jobs you've posted, with published/draft counts and total applicants |
| Post a job | `/employer/jobs/new` | Title, description, location, department, publish toggle |
| Edit a job | `/employer/jobs/:jobId/edit` | Same fields, can unpublish/publish or delete |
| Applicants | `/employer/applications?jobId=:jobId` | Review applicants and change their status |

## Managing applications

Set an applicant's status: `PENDING` → `REVIEWING` → `SHORTLISTED` / `REJECTED` / `HIRED`. Only
the job's owner can view its applicants or change statuses — another employer's jobs aren't
visible to you.

## Access rules

- `/employer/**` requires an `EMPLOYER` session — a `CANDIDATE` or `ADMIN` account visiting these
  pages is redirected to `/`.
- Not logged in and you hit an `/employer/**` page → redirected to `/login`, then back to the page
  you wanted after signing in.
- The API layer enforces job ownership independently of the UI (see `lib/services/jobService.ts`
  and `lib/services/applicationService.ts`) — you can't edit or view another employer's data even
  by calling the API directly.

## API endpoints this role uses

See `postman/README.md` for the full list; the ones relevant here are the `POST`/`PATCH`/`DELETE`
`/api/jobs*` endpoints, `GET /api/jobs/:jobId/applications`, and
`PATCH /api/applications/:appId`.
