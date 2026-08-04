# Admin guide

For users with the `ADMIN` role. Today `ADMIN` gates a single area: the **imcrm** document-types
module (a port of blanka's `document_types`/`quote_type` reference data), reached via
`/admin/imcrm/**`.

## Getting started

1. Log in at `/login` with an `ADMIN` account (seeded: `admin@example.com` / `password123`).
2. On successful login, admins land on `/admin/imcrm/document-types` directly (see
   `components/forms/LoginForm.tsx`) rather than the marketing homepage.
3. The top navbar shows a "Document types" link whenever you're signed in as `ADMIN`.

## What you can do

| Page | Path | Notes |
|---|---|---|
| List document types | `/admin/imcrm/document-types` | Search by code/text, filter by category, paginated table, active/required stat cards |
| Create | `/admin/imcrm/document-types/new` | Grouped form: identity, classification, upload rules, behavior flags, vehicle-specific (only for the Company Car quote type), display |
| Edit | `/admin/imcrm/document-types/:id/edit` | Same form, code is locked after creation |

Row actions on the list let you toggle a row active/inactive or delete it (hard delete — this
table has no soft-delete flag yet, see the `TODO(blanka)` note in
`lib/imcrm/services/documentTypeAdminService.ts`).

## What "document types" actually are

Reference rows describing which documents a customer must/can upload for a given insurance quote
type (e.g. "Driver's license" for Car), including upload constraints (accepted file types, max
files/size), whether it's required, and which category it displays under (Quote, Member, Issuing
Documents, etc.). The read path that resolves these for an actual quote lives in
`lib/imcrm/services/documentTypeService.ts` and is exposed at
`GET /api/imcrm/quotes/:quoteType/document-types` and `GET /api/imcrm/bor/document-types` — see
`postman/README.md` for the full endpoint list.

## Access rules

- `/admin/**` requires an `ADMIN` session — anyone else visiting these pages is redirected to `/`,
  enforced centrally in `proxy.ts` and again at the `app/admin/imcrm/layout.tsx` level
  (`requireRolePage`) as a second check.
- Not logged in and you hit an `/admin/**` page → redirected to `/login`.

## Known gaps (see the implementation plan for detail)

Several values in `lib/imcrm/constants/quoteTypeId.ts` and
`lib/imcrm/services/documentTypeService.ts` are still placeholders pending confirmation from the
blanka team (`paymentDocumentTypesOptions()`, the exact `sortDocumentType()` column order, the
`Corpline` quote type id). These are flagged inline with `TODO(blanka)` comments — check those
before relying on the affected behavior in production.
