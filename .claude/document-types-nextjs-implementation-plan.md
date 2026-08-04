# Document Types Module — Laravel (blanka) → Next.js Port
**Goal:** Rebuild the `document_types` / `quote_type` resolution logic (currently `QuoteDocumentService@getDocumentTypes` in blanka) as a Next.js + Prisma + Postgres module, following the same route → controller → service → resource layering you already use, so the mental model transfers directly from Laravel.

---

## 1. Laravel → Next.js Pattern Mapping

| Laravel (blanka) | Next.js equivalent | Notes |
|---|---|---|
| `Model` (`DocumentType`, `QuoteType`) | Prisma model in `prisma/schema/*.prisma` | Scopes (`active()`, `byQuoteTypeId()`) become query-builder helper functions, since Prisma has no model-scope concept |
| `Route::get(...)` in `api.php` | `app/api/.../route.ts` | Thin wiring only — same rule as your job portal plan |
| `Controller@method` | `lib/controllers/documentTypeController.ts` | Parses request, calls service, shapes via resource |
| `Service` (`QuoteDocumentService`) | `lib/services/documentTypeService.ts` | The only place Prisma is queried — same rule you already follow |
| `Resource` (`DocumentTypeResource::collection`) | `lib/resources/documentTypeResource.ts` | Maps Prisma rows → the exact JSON shape the frontend expects |
| `Enum` (`DocumentTypeCode`, `QuoteTypeId`) | `lib/constants/documentTypeCode.ts`, `lib/constants/quoteTypeId.ts` | Plain TS `as const` objects/enums — no framework support needed |
| `Auth::user()->hasPermissionTo(...)` | `requireRole()` / a `hasPermission()` helper reading from session | Same permission-check point, just moved into the service layer per-call rather than a global gate, since eligibility here is data-dependent (BOR permission changes *which rows* come back, not just *whether* the whole endpoint is callable) |
| `Repository` (`DocumentTypeRepository::businessInsurerName()`) | `lib/repositories/documentTypeRepository.ts` (or a plain function in the service file if it stays small) | Pure lookup/mapping function, no DB call needed if it's just a name-mapping table |
| `$query->when(...)` conditional chains | Build a `where` object incrementally in TS before calling `prisma.documentType.findMany({ where })` | Prisma's `where` is a plain object, so conditions are added with spreads/ternaries instead of a fluent chain |
| `->sortDocumentType()->get()` | `orderBy: [...]` in the same `findMany` call | Custom scope becomes an explicit orderBy array |

---

## 2. Database Schema

```prisma
// prisma/schema/documentType.prisma
model DocumentType {
  id                            BigInt   @id @default(autoincrement())
  code                          String   @unique @db.VarChar(50)
  text                          String   @db.VarChar(100)
  description                   String?
  isActive                      Boolean  @default(true) @map("is_active")
  quoteTypeId                   Int?     @map("quote_type_id")
  quoteType                     QuoteType? @relation(fields: [quoteTypeId], references: [id])
  folderPath                    String?  @map("folder_path")
  acceptedFiles                 String?  @map("accepted_files")
  maxFiles                      Int      @default(1) @map("max_files")
  maxSize                       Int      @default(5) @map("max_size")
  isRequired                    Boolean  @default(false) @map("is_required")
  sendToCustomer                Boolean  @default(false) @map("send_to_customer")
  sortOrder                     Int?     @map("sort_order")
  receiveFromCustomer            Boolean  @default(false) @map("receive_from_customer")
  category                      String   @default("QUOTE") @db.VarChar(50)
  isRequiredForSendPolicy        Boolean  @default(false) @map("is_required_for_send_policy")
  businessTypeOfInsuranceId      BigInt?  @map("business_type_of_insurance_id")
  businessTypeOfCustomer         String?  @db.VarChar(50) @map("business_type_of_customer")
  toolTip                       String?  @map("tool_tip")
  registrationType               String?  @db.VarChar(10) @map("registration_type")
  vehicleUse                    String?  @db.VarChar(10) @map("vehicle_use")
  isRestrictedInternalDocument    Boolean  @default(false) @map("is_restricted_internal_document")

  @@index([isActive])
  @@map("document_types")
}
```

```prisma
// prisma/schema/quoteType.prisma
model QuoteType {
  id        Int      @id @default(autoincrement())
  shortCode String?  @map("short_code") @db.VarChar(10)
  code      String?  @db.VarChar(50)
  text      String?  @db.VarChar(50)
  textAr    String?  @map("text_ar") @db.VarChar(50)
  isActive  Boolean  @default(true) @map("is_active")
  sortOrder Int?     @map("sort_order")
  isDeleted Boolean  @default(false) @map("is_deleted")
  createdAt DateTime @default(now()) @map("created_at")
  updatedAt DateTime @updatedAt @map("updated_at")

  documentTypes DocumentType[]

  @@map("quote_type")
}
```

*(Field names kept 1:1 with the MySQL source via `@map`, so the eventual data migration from MySQL → Postgres doesn't require a rename pass.)*

---

## 3. Constants (Enum Equivalents)

```ts
// lib/constants/documentTypeCode.ts
export const DocumentTypeCode = {
  BAL: "BAL", BAL_BIKE: "BAL_BIKE", BAL_TRVL: "BAL_TRVL", BAL_HOME: "BAL_HOME",
  BAL_HLTH: "BAL_HLTH", BAL_YCHT: "BAL_YCHT", BAL_CYCLE: "BAL_CYCLE",
  BAL_LIFE: "BAL_LIFE", BAL_PET: "BAL_PET", BAL_BS: "BAL_BS",
  BUS_BAL: "BUS_BAL", GM_BOL: "GM_BOL",
  GMQPD: "GMQPD", GMQPDR: "GMQPDR", GMQDPDR: "GMQDPDR", PPR: "PPR",
  CLPD: "CLPD", CLPDR: "CLPDR", CLDPDR: "CLDPDR",
  AUDIT: "AUDIT",
} as const;

export const BOR_ONLY_CODES: string[] = [
  DocumentTypeCode.BAL, DocumentTypeCode.BAL_BIKE, DocumentTypeCode.BAL_TRVL,
  DocumentTypeCode.BAL_HOME, DocumentTypeCode.BAL_HLTH, DocumentTypeCode.BAL_YCHT,
  DocumentTypeCode.BAL_CYCLE, DocumentTypeCode.BAL_LIFE, DocumentTypeCode.BAL_PET,
  DocumentTypeCode.BAL_BS, DocumentTypeCode.BUS_BAL, DocumentTypeCode.GM_BOL,
];
```

```ts
// lib/constants/quoteTypeId.ts
export const QuoteTypeId = {
  CompanyCar: 15,   // confirm actual IDs against quote_type table before wiring — placeholders here
  Business: 5,
  Corpline: 99,
} as const;

export const QuoteTypeCode = {
  CORPLINE: "CORPLINE",
  GroupMedical: "GroupMedical",
} as const;

export const DocumentCategory = {
  QUOTE: "QUOTE",
  MEMBER: "MEMBER",
  ISSUING_DOCUMENTS: "ISSUING_DOCUMENTS",
  SEND_UPDATE: "SEND_UPDATE",
  ENDORSEMENT_DOCUMENTS: "ENDORSEMENT_DOCUMENTS",
} as const;
```

> ⚠️ **Clarify with blanka before wiring:** the real numeric values for `QuoteTypeId::CompanyCar`, `QuoteTypeId::Business`, `QuoteTypeId::Corpline` live in the Laravel enum class — pull those exact values (and confirm whether any others are referenced elsewhere in `getDocumentTypes`) rather than guessing, since a wrong ID silently returns an empty list instead of erroring.

---

## 4. Service Layer — Direct Port of `getDocumentTypes`

```ts
// lib/services/documentTypeService.ts
import { prisma } from "@/lib/db/prisma";
import { Prisma } from "@prisma/client";
import { DocumentTypeCode, BOR_ONLY_CODES } from "@/lib/constants/documentTypeCode";
import { QuoteTypeId, QuoteTypeCode, DocumentCategory } from "@/lib/constants/quoteTypeId";
import { businessInsurerName } from "@/lib/repositories/documentTypeRepository";

type GetDocumentTypesArgs = {
  quoteTypeId: number;
  businessTypeOfInsurance?: number | null;
  businessTypeOfCustomer?: string | null;
  quoteTypeCode?: string | null;
  quote?: { registrationType?: string | null; vehicleUse?: string | null } | null;
  hasBorPermission: boolean; // resolved by the controller from the session, passed in — service stays framework-agnostic
};

export async function getDocumentTypes({
  quoteTypeId,
  businessTypeOfInsurance,
  businessTypeOfCustomer,
  quoteTypeCode,
  quote,
  hasBorPermission,
}: GetDocumentTypesArgs) {
  // --- build the base where clause, mirroring the Laravel ->when() chain ---
  const where: Prisma.DocumentTypeWhereInput = {
    isActive: true,
    category: { notIn: [DocumentCategory.SEND_UPDATE, DocumentCategory.ENDORSEMENT_DOCUMENTS] },
    quoteTypeId,
  };

  if (businessTypeOfInsurance) {
    where.businessTypeOfInsuranceId = businessTypeOfInsurance;
  }

  if (!hasBorPermission) {
    where.code = { notIn: BOR_ONLY_CODES };
  }

  if (businessTypeOfCustomer) {
    const insurerName = businessInsurerName(businessTypeOfInsurance ?? null);
    where.businessTypeOfCustomer = businessTypeOfCustomer;
    // if the Laravel scope does more than an equality match against insurerName, port that condition here explicitly
  }

  if (quoteTypeId === QuoteTypeId.CompanyCar) {
    where.AND = [
      { OR: [{ registrationType: null }, { registrationType: quote?.registrationType ?? undefined }] },
      { OR: [{ vehicleUse: null }, { vehicleUse: quote?.vehicleUse ?? undefined }] },
    ];
  }

  let documentTypes = await prisma.documentType.findMany({
    where,
    orderBy: [{ sortOrder: "asc" }], // confirm exact multi-column order used by sortDocumentType() scope in Laravel
  });

  // --- Business / GroupMedical / CORPLINE special-casing ---
  if (quoteTypeId === QuoteTypeId.Business) {
    let extraCodes: string[] = [];

    if (quoteTypeCode === QuoteTypeCode.GroupMedical) {
      extraCodes = [DocumentTypeCode.GMQPD, DocumentTypeCode.GMQPDR, DocumentTypeCode.GMQDPDR, DocumentTypeCode.PPR];
    } else if (quoteTypeCode === QuoteTypeCode.CORPLINE) {
      extraCodes = [DocumentTypeCode.CLPD, DocumentTypeCode.CLPDR, DocumentTypeCode.CLDPDR, DocumentTypeCode.PPR];

      const hasBalBs = documentTypes.some(
        (d) => d.code === DocumentTypeCode.BAL_BS || d.code === DocumentTypeCode.BUS_BAL
      );
      if (!hasBalBs && hasBorPermission) {
        extraCodes.push(DocumentTypeCode.BAL_BS);
      }
    }

    extraCodes.push(DocumentTypeCode.AUDIT);

    const businessDocumentTypes = await prisma.documentType.findMany({
      where: { isActive: true, quoteTypeId: QuoteTypeId.Business, code: { in: extraCodes } },
      orderBy: [{ sortOrder: "asc" }],
    });

    documentTypes = [...documentTypes, ...businessDocumentTypes];
  }

  // --- split payment documents out ---
  const paymentCodes = paymentDocumentTypesOptions(quoteTypeId);
  const paymentDocuments = documentTypes.filter((d) => paymentCodes.includes(d.code));

  // --- group + order remaining by category ---
  const byCategory = new Map<string, typeof documentTypes>();
  for (const doc of documentTypes) {
    if (!byCategory.has(doc.category)) byCategory.set(doc.category, []);
    byCategory.get(doc.category)!.push(doc);
  }

  const orderedCategories = [DocumentCategory.QUOTE, DocumentCategory.MEMBER, DocumentCategory.ISSUING_DOCUMENTS];
  const orderedDocumentTypesByCategory: Record<string, typeof documentTypes> = {};
  for (const cat of orderedCategories) {
    if (byCategory.has(cat)) orderedDocumentTypesByCategory[cat] = byCategory.get(cat)!;
  }

  return { orderedDocumentTypesByCategory, paymentDocuments };
}

function paymentDocumentTypesOptions(quoteTypeId: number): string[] {
  // port the exact code list from `paymentDocumentTypesOptions($quoteTypeId)` in blanka —
  // pull this function's body from the Laravel service before implementing
  return [];
}
```

> ⚠️ **Clarify with blanka before wiring:** `paymentDocumentTypesOptions()` and the exact multi-column sort used by `sortDocumentType()` aren't in the code you've shared yet — pull both from `QuoteDocumentService` so this isn't guessed.

---

## 5. Resource Shaping

```ts
// lib/resources/documentTypeResource.ts
import type { DocumentType } from "@prisma/client";

export function documentTypeResource(doc: DocumentType) {
  return {
    id: doc.id.toString(),
    code: doc.code,
    text: doc.text,
    description: doc.description,
    folderPath: doc.folderPath,
    acceptedFiles: doc.acceptedFiles,
    maxFiles: doc.maxFiles,
    maxSize: doc.maxSize,
    isRequired: doc.isRequired,
    sendToCustomer: doc.sendToCustomer,
    receiveFromCustomer: doc.receiveFromCustomer,
    category: doc.category,
    toolTip: doc.toolTip,
  };
}

export function documentTypeCollection(docs: DocumentType[]) {
  return docs.map(documentTypeResource);
}
```

*Keep this in sync with the service's `select`/return shape the moment either changes — this is the exact bug the dashboard-project review flagged with `postResource`.*

---

## 6. Controller + Route

```ts
// lib/controllers/documentTypeController.ts
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/authOptions";
import { getDocumentTypes } from "@/lib/services/documentTypeService";
import { documentTypeCollection } from "@/lib/resources/documentTypeResource";
import { handlePrismaError } from "@/lib/errors/handlePrismaError";
import { getQuoteTypeId } from "@/lib/services/quoteTypeService"; // port of ActivitiesService::getQuoteTypeId

export async function getQuoteDocumentsToReceive(req: NextRequest, quoteTypeParam: string) {
  try {
    const session = await getServerSession(authOptions);
    const hasBorPermission = session?.user?.permissions?.includes("BOR_DOCUMENT_UPLOAD") ?? false;

    const { searchParams } = new URL(req.url);
    const category = searchParams.get("category");
    const registrationType = searchParams.get("registration_type");
    const vehicleUse = searchParams.get("vehicle_use");
    // forUmaf param from the Laravel controller — confirm whether it's still used before porting it in

    const quoteTypeId = await getQuoteTypeId(quoteTypeParam);

    const { orderedDocumentTypesByCategory, paymentDocuments } = await getDocumentTypes({
      quoteTypeId,
      hasBorPermission,
      quote: { registrationType, vehicleUse },
    });

    return NextResponse.json({
      documentTypes: Object.fromEntries(
        Object.entries(orderedDocumentTypesByCategory).map(([cat, docs]) => [cat, documentTypeCollection(docs)])
      ),
      paymentDocuments: documentTypeCollection(paymentDocuments),
    });
  } catch (e) {
    return handlePrismaError(e);
  }
}
```

```ts
// app/api/quotes/[quoteType]/document-types/route.ts
import { getQuoteDocumentsToReceive } from "@/lib/controllers/documentTypeController";

export async function GET(req: Request, { params }: { params: { quoteType: string } }) {
  return getQuoteDocumentsToReceive(req as any, params.quoteType);
}
```

---

## 7. BOR's Separate `document-types` Endpoint

You flagged this as an open question earlier — here's the concrete tradeoff for the Next.js port:

- **Consolidate:** one `documentTypeService.getDocumentTypes()` handles both quote-context and BOR-context calls; BOR's route just calls it with different arguments (no `quoteType`, permission flag from BOR's own gate). Pro: one source of truth, matches the "no parallel implementations" rule from your dashboard-project review. Con: the function signature grows a few BOR-specific optional params.
- **Keep separate:** `borDocumentTypeService.ts` wraps the same base query but with its own filtering. Pro: BOR's rules can evolve independently without risking the quote path. Con: duplicate logic to keep in sync — this is exactly the drift pattern the review flagged with `/api/learning`.

**Recommendation:** consolidate into one service, parameterized — same conclusion the review already pushed you toward for the dashboard project, and it avoids recreating the same two-implementations problem here on day one instead of six months in.

---

## 8. Implementation Roadmap

**Phase 1 — Schema & data**
Write `document_types` / `quote_type` Prisma models (above), migrate/seed from a snapshot of the actual MySQL tables so field values match reality, confirm `@map` names are exhaustive.

**Phase 2 — Constants & repository**
Port `DocumentTypeCode`, `QuoteTypeId`, `QuoteTypeCode`, `DocumentCategory`, and `businessInsurerName()` — pull exact values from blanka rather than guessing (flagged above).

**Phase 3 — Service (read path)**
Implement `getDocumentTypes()` exactly as above; unit-test against known blanka outputs for a few real `quoteTypeId`/permission combinations to confirm parity before touching the UI.

**Phase 4 — Resource + controller + route**
Wire the three layers; confirm the JSON shape matches what any existing frontend consumer expects (if this feeds the same UI blanka's Vue/Blade frontend uses, or a new Next.js frontend — confirm which).

**Phase 5 — BOR endpoint**
Implement using the consolidated service (per the recommendation above), with BOR's own permission gate at the controller level.

**Phase 6 — Parity testing**
Run both the Laravel and Next.js endpoints side by side against the same quote records; diff the JSON output field-by-field before cutting over.

---

## 9. Seed Data — `quote_type` Seeder (run first)

`document_types.quote_type_id` is a foreign key into `quote_type`, so this must be seeded **before** the `document_types` seeder in Section 10 — the `connect: { id: ... }` calls there will fail with a `P2025` if the referenced `QuoteType` row doesn't exist yet.

This is the full table (17 rows, no pagination on the source query — confirm it's exhaustive before relying on it, but it reads as complete).

```prisma
// prisma/schema/quoteType.prisma — repeated here for convenience, same model as Section 2
model QuoteType {
  id        Int      @id @default(autoincrement())
  shortCode String?  @map("short_code") @db.VarChar(10)
  code      String?  @db.VarChar(50)
  text      String?  @db.VarChar(50)
  textAr    String?  @map("text_ar") @db.VarChar(50)
  isActive  Boolean  @default(true) @map("is_active")
  sortOrder Int?     @map("sort_order")
  isDeleted Boolean  @default(false) @map("is_deleted")
  createdAt DateTime @default(now()) @map("created_at")
  updatedAt DateTime @updatedAt @map("updated_at")

  documentTypes DocumentType[]

  @@map("quote_type")
}
```

```ts
// prisma/seed/quoteTypeSeeder.ts
//
// Same ID-preservation approach as documentTypeSeeder: explicit IDs (1, 2, 3,
// ..., 102) are carried over from blanka so `document_types.quote_type_id`
// foreign keys resolve correctly, and so this stays comparable for parity
// testing. Run the sequence-realignment step at the end after seeding.

import { PrismaClient, Prisma } from "@prisma/client";

const prisma = new PrismaClient();

type SeedRow = {
  id: number;
  short_code: string;
  code: string;
  text: string;
  text_ar: string | null;
  is_active: number;
  sort_order: number | null;
  is_deleted: number;
  created_at: string;
  updated_at: string;
};

// Full source snapshot — `select * from quote_type;` against blanka (central_afia schema).
const rows: SeedRow[] = [
  { id: 1, short_code: "CAR", code: "Car", text: "Car Insurance", text_ar: "تأمين السيارة", is_active: 1, sort_order: 1, is_deleted: 0, created_at: "2021-01-26T05:41:30Z", updated_at: "2021-01-26T05:41:30Z" },
  { id: 2, short_code: "HOM", code: "Home", text: "Home Insurance", text_ar: "تأمين المنزل", is_active: 1, sort_order: 2, is_deleted: 0, created_at: "2021-01-26T05:41:30Z", updated_at: "2021-01-26T05:41:30Z" },
  { id: 3, short_code: "HEA", code: "Health", text: "Health Insurance", text_ar: "تأمين صحي", is_active: 1, sort_order: 3, is_deleted: 0, created_at: "2021-01-26T05:41:30Z", updated_at: "2021-01-26T05:41:30Z" },
  { id: 4, short_code: "LIF", code: "Life", text: "Life Insurance", text_ar: "التأمين على الحياة", is_active: 1, sort_order: 4, is_deleted: 0, created_at: "2021-01-26T05:41:30Z", updated_at: "2021-01-26T05:41:30Z" },
  { id: 5, short_code: "BUS", code: "Business", text: "Business Insurance", text_ar: "تأمين الأعمال", is_active: 1, sort_order: 5, is_deleted: 0, created_at: "2021-01-26T05:41:30Z", updated_at: "2021-01-26T05:41:30Z" },
  { id: 6, short_code: "BIK", code: "Bike", text: "Bike Insurance", text_ar: "تأمين الدراجة", is_active: 1, sort_order: 6, is_deleted: 0, created_at: "2021-01-26T05:41:30Z", updated_at: "2021-01-26T05:41:30Z" },
  { id: 7, short_code: "YAC", code: "Yacht", text: "Yacht Insurance", text_ar: "تأمين المراكب البحرية", is_active: 1, sort_order: 7, is_deleted: 0, created_at: "2021-01-26T05:41:30Z", updated_at: "2021-01-26T05:41:30Z" },
  { id: 8, short_code: "TRA", code: "Travel", text: "Travel Insurance", text_ar: "تأمين السفر", is_active: 1, sort_order: 8, is_deleted: 0, created_at: "2021-01-26T05:41:30Z", updated_at: "2021-01-26T05:41:30Z" },
  { id: 9, short_code: "PET", code: "Pet", text: "Pet Insurance", text_ar: null, is_active: 1, sort_order: 9, is_deleted: 0, created_at: "2021-01-26T05:41:30Z", updated_at: "2022-09-02T14:20:51Z" },
  { id: 10, short_code: "CYC", code: "Cycle", text: "Cycle Insurance", text_ar: null, is_active: 1, sort_order: 10, is_deleted: 0, created_at: "2021-01-26T05:41:30Z", updated_at: "2021-01-26T05:41:30Z" },
  { id: 11, short_code: "JET", code: "Jetski", text: "Jetski Insure", text_ar: null, is_active: 1, sort_order: 11, is_deleted: 0, created_at: "2021-01-26T05:41:30Z", updated_at: "2021-01-26T05:41:30Z" },
  { id: 12, short_code: "BTC", code: "Business_Trade_Credit", text: "Business Trade Credit Insurance", text_ar: null, is_active: 0, sort_order: null, is_deleted: 0, created_at: "2021-01-26T05:41:30Z", updated_at: "2021-01-26T05:41:30Z" },
  { id: 15, short_code: "COM", code: "CompanyCar", text: "Company Car Insurance", text_ar: null, is_active: 1, sort_order: null, is_deleted: 0, created_at: "2025-04-30T18:31:16Z", updated_at: "2025-04-30T18:31:16Z" },
  { id: 18, short_code: "SAV", code: "Savings", text: "Savings", text_ar: null, is_active: 1, sort_order: null, is_deleted: 0, created_at: "2025-05-29T18:26:55Z", updated_at: "2026-07-30T12:36:18Z" },
  { id: 19, short_code: "CYB", code: "Cyber", text: "Cyber Insurance", text_ar: null, is_active: 1, sort_order: 19, is_deleted: 0, created_at: "2021-01-26T05:41:30Z", updated_at: "2026-07-30T12:36:20Z" },
  { id: 20, short_code: "DEV", code: "Device", text: "Device Insurance", text_ar: null, is_active: 1, sort_order: 20, is_deleted: 0, created_at: "2025-11-11T19:04:27Z", updated_at: "2026-07-30T12:37:27Z" },
  { id: 102, short_code: "GM", code: "Group Medical", text: "Group Medical Insurance", text_ar: null, is_active: 1, sort_order: null, is_deleted: 0, created_at: "2024-08-28T18:17:53Z", updated_at: "2024-08-28T18:17:53Z" },
];

function toPrismaData(row: SeedRow): Prisma.QuoteTypeCreateInput {
  return {
    id: row.id,
    shortCode: row.short_code,
    code: row.code,
    text: row.text,
    textAr: row.text_ar,
    isActive: !!row.is_active,
    sortOrder: row.sort_order,
    isDeleted: !!row.is_deleted,
    createdAt: new Date(row.created_at),
    updatedAt: new Date(row.updated_at),
  };
}

export async function quoteTypeSeeder() {
  console.log(`Seeding ${rows.length} quote_type rows...`);

  for (const row of rows) {
    const data = toPrismaData(row);
    await prisma.quoteType.upsert({
      where: { id: row.id },
      create: data,
      update: data,
    });
  }

  await prisma.$executeRawUnsafe(`
    SELECT setval(
      pg_get_serial_sequence('quote_type', 'id'),
      COALESCE((SELECT MAX(id) FROM quote_type), 1)
    );
  `);

  console.log("quote_type seeding complete.");
}

if (require.main === module) {
  quoteTypeSeeder()
    .catch((e) => {
      console.error(e);
      process.exitCode = 1;
    })
    .finally(async () => {
      await prisma.$disconnect();
    });
}
```

**Two things to flag:**
1. **IDs aren't contiguous** (jumps from 12 → 15 → 18 → 19 → 20 → 102) — this is preserved deliberately, matching the real source table. Don't "clean up" the sequence to be 1–17; other blanka data may reference these exact IDs (e.g. `document_types.quote_type_id`, and possibly `quote.quote_type_id` elsewhere).
2. **`id: 13, 14, 16, 17`** are absent from this result set — likely soft-deleted, inactive-and-filtered, or simply never existed. Worth a quick confirm-query against blanka (`SELECT id FROM quote_type WHERE id IN (13,14,16,17)`) before assuming they're safe to skip entirely, in case anything still references them.

Run order: `quoteTypeSeeder()` → `documentTypeSeeder()` (Section 10) → any application/quote-level seeders that depend on both.

---

## 10. Seed Data — `document_types` Seeder

Seeds `document_types` from a snapshot of real blanka rows (car / `quote_type_id: 1`), so local dev and Preview deployments have realistic data instead of placeholders. Uses `upsert` keyed on the table's actual unique column (`code`), matching the idempotent seeder pattern already used for `userSeeder`/`jobSeeder` elsewhere.

```ts
// prisma/seed/documentTypeSeeder.ts
//
// NOTE ON IDS: Prisma's `id` is `@default(autoincrement())`, but the rows
// below carry their *real* blanka IDs (203, 156, 142, ...) so that side-by-side
// parity testing against the Laravel API (Phase 6 above) can compare responses
// without an ID-remapping step. Because these are explicit inserts, Postgres's
// own sequence for the id column will NOT advance automatically — the
// `setval(...)` call at the end of this file must run once after seeding,
// or a later `create()` without an explicit id can collide with a seeded ID.

import { PrismaClient, Prisma } from "@prisma/client";

const prisma = new PrismaClient();

type SeedRow = {
  id: number;
  code: string;
  text: string;
  description: string | null;
  is_active: number;
  quote_type_id: number | null;
  folder_path: string | null;
  accepted_files: string | null;
  max_files: number;
  max_size: number;
  is_required: number;
  send_to_customer: number;
  sort_order: number | null;
  receive_from_customer: number;
  category: string;
  is_required_for_send_policy: number;
  business_type_of_insurance_id: number | null;
  business_type_of_customer: string | null;
  tool_tip: string | null;
  registration_type: string | null;
  vehicle_use: string | null;
  is_restricted_internal_document: number;
};

// Source snapshot — car (quote_type_id: 1) document types, as pulled from blanka.
// Extend this array with further snapshots (health, home, etc.) as they're provided.
const rows: SeedRow[] = [
  {
    id: 203, code: "OTHERS_CAR", text: "Other documents",
    description: "Please provide any other relevant documents and pictures of the incident, if available.",
    is_active: 1, quote_type_id: 1, folder_path: "car",
    accepted_files: ".pdf,.xlsx,.xls,.docx,.doc,.jpeg,.jpg,.png",
    max_files: 10, max_size: 25, is_required: 0, send_to_customer: 0, sort_order: 4,
    receive_from_customer: 1, category: "QUOTE", is_required_for_send_policy: 0,
    business_type_of_insurance_id: null, business_type_of_customer: null, tool_tip: null,
    registration_type: null, vehicle_use: null, is_restricted_internal_document: 0,
  },
  {
    id: 156, code: "CAR_MULKIY", text: "Vehicle license (Mulkiya) or Dealer invoice copy or VCC (Front & Back)",
    description: "Please upload clear document or picture. If buying a brand new car, please upload the dealer invoice or vehicle clearance certificate.",
    is_active: 1, quote_type_id: 1, folder_path: "car",
    accepted_files: ".pdf,.xlsx,.xls,.docx,.doc,.jpeg,.jpg,.png",
    max_files: 2, max_size: 25, is_required: 1, send_to_customer: 0, sort_order: 2,
    receive_from_customer: 1, category: "QUOTE", is_required_for_send_policy: 0,
    business_type_of_insurance_id: null, business_type_of_customer: null,
    tool_tip: "Upload your Mulkiya showing plate number and car details.",
    registration_type: null, vehicle_use: null, is_restricted_internal_document: 0,
  },
  {
    id: 142, code: "VCP", text: "Vehicle photos (as per format shared by the advisor)",
    description: "", is_active: 0, quote_type_id: 1, folder_path: "car",
    accepted_files: ".jpeg,.jpg,.png",
    max_files: 20, max_size: 25, is_required: 0, send_to_customer: 0, sort_order: 62,
    receive_from_customer: 1, category: "ISSUING_DOCUMENTS", is_required_for_send_policy: 0,
    business_type_of_insurance_id: null, business_type_of_customer: null, tool_tip: null,
    registration_type: null, vehicle_use: null, is_restricted_internal_document: 0,
  },
  {
    id: 129, code: "CPS", text: "Policy Schedule",
    description: "", is_active: 1, quote_type_id: 1, folder_path: "car",
    accepted_files: ".pdf,.xlsx,.xls,.docx,.doc,.jpeg,.jpg,.png",
    max_files: 5, max_size: 2, is_required: 1, send_to_customer: 1, sort_order: 11,
    receive_from_customer: 0, category: "ISSUING_DOCUMENTS", is_required_for_send_policy: 1,
    business_type_of_insurance_id: null, business_type_of_customer: null, tool_tip: null,
    registration_type: null, vehicle_use: null, is_restricted_internal_document: 0,
  },
  {
    id: 118, code: "CPC", text: "Policy Certificate",
    description: "", is_active: 1, quote_type_id: 1, folder_path: "car",
    accepted_files: ".pdf,.xlsx,.xls,.docx,.doc,.jpeg,.jpg,.png",
    max_files: 5, max_size: 2, is_required: 1, send_to_customer: 1, sort_order: 12,
    receive_from_customer: 0, category: "ISSUING_DOCUMENTS", is_required_for_send_policy: 1,
    business_type_of_insurance_id: null, business_type_of_customer: null, tool_tip: null,
    registration_type: null, vehicle_use: null, is_restricted_internal_document: 0,
  },
  {
    id: 20, code: "PHB", text: "Policy Handbook",
    description: null, is_active: 1, quote_type_id: 1, folder_path: "car",
    accepted_files: ".pdf,.xlsx,.docx,.jpeg,.jpg,.png",
    max_files: 5, max_size: 25, is_required: 0, send_to_customer: 1, sort_order: null,
    receive_from_customer: 0, category: "QUOTE", is_required_for_send_policy: 1,
    business_type_of_insurance_id: null, business_type_of_customer: null, tool_tip: null,
    registration_type: null, vehicle_use: null, is_restricted_internal_document: 0,
  },
  {
    id: 17, code: "DL", text: "Driver's license (Front & Back)",
    description: "Please upload your valid UAE Driver's license.",
    is_active: 1, quote_type_id: 1, folder_path: "car",
    accepted_files: ".pdf,.xlsx,.docx,.jpeg,.jpg,.png",
    max_files: 2, max_size: 25, is_required: 1, send_to_customer: 0, sort_order: 1,
    receive_from_customer: 1, category: "QUOTE", is_required_for_send_policy: 0,
    business_type_of_insurance_id: null, business_type_of_customer: null,
    tool_tip: "Upload the front and back of your valid UAE driving license showing the license number.",
    registration_type: null, vehicle_use: null, is_restricted_internal_document: 0,
  },
  {
    id: 4, code: "CEID", text: "Emirates ID (Front & Back)",
    description: "Please upload your valid Emirates ID.",
    is_active: 1, quote_type_id: 1, folder_path: "car",
    accepted_files: ".pdf,.xlsx,.docx,.jpeg,.jpg,.png",
    max_files: 2, max_size: 20, is_required: 1, send_to_customer: 0, sort_order: 3,
    receive_from_customer: 1, category: "QUOTE", is_required_for_send_policy: 0,
    business_type_of_insurance_id: null, business_type_of_customer: null,
    tool_tip: "Upload both sides of your Emirates ID with the residence ID number visible.",
    registration_type: null, vehicle_use: null, is_restricted_internal_document: 0,
  },
];

function toPrismaData(row: SeedRow): Prisma.DocumentTypeCreateInput {
  return {
    id: row.id, // explicit — see ID note at top of file
    code: row.code,
    text: row.text,
    description: row.description,
    isActive: !!row.is_active,
    // quoteType relation: only connect if the referenced QuoteType row already
    // exists (run the quoteTypeSeeder first). Adjust to `quoteTypeId: row.quote_type_id`
    // directly if you'd rather skip relation validation during seeding.
    quoteType: row.quote_type_id
      ? { connect: { id: row.quote_type_id } }
      : undefined,
    folderPath: row.folder_path,
    acceptedFiles: row.accepted_files,
    maxFiles: row.max_files,
    maxSize: row.max_size,
    isRequired: !!row.is_required,
    sendToCustomer: !!row.send_to_customer,
    sortOrder: row.sort_order,
    receiveFromCustomer: !!row.receive_from_customer,
    category: row.category,
    isRequiredForSendPolicy: !!row.is_required_for_send_policy,
    businessTypeOfInsuranceId: row.business_type_of_insurance_id,
    businessTypeOfCustomer: row.business_type_of_customer,
    toolTip: row.tool_tip,
    registrationType: row.registration_type,
    vehicleUse: row.vehicle_use,
    isRestrictedInternalDocument: !!row.is_restricted_internal_document,
  };
}

export async function documentTypeSeeder() {
  console.log(`Seeding ${rows.length} document_types rows...`);

  for (const row of rows) {
    const data = toPrismaData(row);
    await prisma.documentType.upsert({
      where: { code: row.code },
      create: data,
      update: data,
    });
  }

  // Postgres won't know about the explicit IDs above until the sequence is
  // realigned — run this once after any explicit-ID seed batch, or later
  // auto-generated inserts can collide with a seeded ID.
  await prisma.$executeRawUnsafe(`
    SELECT setval(
      pg_get_serial_sequence('document_types', 'id'),
      COALESCE((SELECT MAX(id) FROM document_types), 1)
    );
  `);

  console.log("document_types seeding complete.");
}

// Allow running standalone: `tsx prisma/seed/documentTypeSeeder.ts`
if (require.main === module) {
  documentTypeSeeder()
    .catch((e) => {
      console.error(e);
      process.exitCode = 1;
    })
    .finally(async () => {
      await prisma.$disconnect();
    });
}
```

**Two things to confirm before running this against a real environment:**
1. **`quoteType: { connect: { id: 1 } }`** assumes a `QuoteType` row with id `1` (Car) already exists — run a `quoteTypeSeeder` first, or swap to a plain `quoteTypeId: row.quote_type_id` if you'd rather skip relation validation during seeding.
2. This snapshot only covers **car** (`quote_type_id: 1`). Extend the `rows` array with health/home/etc. snapshots as they're pulled from blanka — the `upsert` keyed on `code` means adding more rows later is additive and safe to re-run.

---

## 11. Admin CRUD — Create / Edit / List Document Types

Everything above is the **read path** (resolving which document types apply to a given quote). This section adds the **management path** — the admin screens for creating, editing, and listing `document_types` rows themselves, following the same layering.

### 9.1 Routes & Pages

```
app/
├── (dashboard)/
│   └── admin/
│       └── document-types/
│           ├── page.tsx                 # listing — table, filters, search
│           ├── new/page.tsx              # create form
│           └── [id]/edit/page.tsx        # edit form
└── api/
    └── document-types/
        ├── route.ts                     # GET (list, paginated+filtered), POST (create)
        └── [id]/route.ts                # GET (one), PATCH (update), DELETE
```

### 9.2 Validator

```ts
// lib/validators/documentTypeValidator.ts
import { z } from "zod";

export const documentTypeSchema = z.object({
  code: z.string().min(2).max(50),
  text: z.string().min(1).max(100),
  description: z.string().optional().nullable(),
  isActive: z.boolean().default(true),
  quoteTypeId: z.number().int().optional().nullable(),
  folderPath: z.string().optional().nullable(),
  acceptedFiles: z.string().optional().nullable(),   // comma-separated ext list, e.g. ".pdf,.png,.jpg"
  maxFiles: z.number().int().min(1).default(1),
  maxSize: z.number().int().min(1).default(5),
  isRequired: z.boolean().default(false),
  sendToCustomer: z.boolean().default(false),
  sortOrder: z.number().int().optional().nullable(),
  receiveFromCustomer: z.boolean().default(false),
  category: z.enum(["QUOTE", "MEMBER", "ISSUING_DOCUMENTS", "SEND_UPDATE", "ENDORSEMENT_DOCUMENTS"]).default("QUOTE"),
  isRequiredForSendPolicy: z.boolean().default(false),
  businessTypeOfInsuranceId: z.number().int().optional().nullable(),
  businessTypeOfCustomer: z.enum(["IBTC", "CBTC"]).optional().nullable(),
  toolTip: z.string().optional().nullable(),
  registrationType: z.string().max(10).optional().nullable(),
  vehicleUse: z.string().max(10).optional().nullable(),
  isRestrictedInternalDocument: z.boolean().default(false),
});

export const documentTypeUpdateSchema = documentTypeSchema.partial();
```

*`code` uniqueness is enforced at the DB level (`@unique`) — the controller catches `P2002` via the shared `handlePrismaError` rather than pre-checking with a separate query.*

### 9.3 Service (Write Path)

```ts
// lib/services/documentTypeAdminService.ts
import { prisma } from "@/lib/db/prisma";
import type { z } from "zod";
import type { documentTypeSchema, documentTypeUpdateSchema } from "@/lib/validators/documentTypeValidator";

const LIST_SELECT = {
  id: true, code: true, text: true, category: true, quoteTypeId: true,
  isActive: true, isRequired: true, sendToCustomer: true, sortOrder: true,
} as const;

export async function listDocumentTypes(params: {
  page: number;
  pageSize: number;
  search?: string;
  category?: string;
  quoteTypeId?: number;
  isActive?: boolean;
}) {
  const { page, pageSize, search, category, quoteTypeId, isActive } = params;

  const where = {
    ...(search ? { OR: [{ code: { contains: search, mode: "insensitive" as const } }, { text: { contains: search, mode: "insensitive" as const } }] } : {}),
    ...(category ? { category } : {}),
    ...(quoteTypeId ? { quoteTypeId } : {}),
    ...(isActive !== undefined ? { isActive } : {}),
  };

  const [total, items] = await Promise.all([
    prisma.documentType.count({ where }),
    prisma.documentType.findMany({
      where,
      select: LIST_SELECT,
      orderBy: [{ sortOrder: "asc" }, { id: "asc" }],
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
  ]);

  return { items, total, page, pageSize };
}

export async function getDocumentTypeById(id: bigint) {
  return prisma.documentType.findUnique({ where: { id } });
}

export async function createDocumentType(data: z.infer<typeof documentTypeSchema>) {
  return prisma.documentType.create({ data });
}

export async function updateDocumentType(id: bigint, data: z.infer<typeof documentTypeUpdateSchema>) {
  return prisma.documentType.update({ where: { id }, data });
}

export async function deleteDocumentType(id: bigint) {
  // No `is_deleted` column on this table (unlike quote_type) — decide whether this needs a soft-delete
  // flag added, or whether a hard delete is acceptable given document_types is a reference/config table
  // rather than transactional data. Flag for blanka team confirmation before wiring DELETE.
  return prisma.documentType.delete({ where: { id } });
}
```

### 9.4 Controller

```ts
// lib/controllers/documentTypeAdminController.ts
import { NextRequest, NextResponse } from "next/server";
import { requireRole } from "@/lib/auth/requireRole";
import { documentTypeSchema, documentTypeUpdateSchema } from "@/lib/validators/documentTypeValidator";
import * as service from "@/lib/services/documentTypeAdminService";
import { documentTypeCollection, documentTypeResource } from "@/lib/resources/documentTypeResource";
import { handlePrismaError } from "@/lib/errors/handlePrismaError";

export async function index(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const page = Number(searchParams.get("page") ?? 1);
    const pageSize = Number(searchParams.get("pageSize") ?? 20);

    const result = await service.listDocumentTypes({
      page,
      pageSize,
      search: searchParams.get("search") ?? undefined,
      category: searchParams.get("category") ?? undefined,
      quoteTypeId: searchParams.get("quoteTypeId") ? Number(searchParams.get("quoteTypeId")) : undefined,
      isActive: searchParams.has("isActive") ? searchParams.get("isActive") === "true" : undefined,
    });

    return NextResponse.json({
      ...result,
      items: documentTypeCollection(result.items),
    });
  } catch (e) {
    return handlePrismaError(e);
  }
}

export async function store(req: NextRequest) {
  try {
    await requireRole(["ADMIN"]); // adjust to whatever role/permission gates config management in your app
    const body = await req.json();
    const parsed = documentTypeSchema.parse(body); // throws ZodError -> caught below, mapped to 422
    const created = await service.createDocumentType(parsed);
    return NextResponse.json(documentTypeResource(created), { status: 201 });
  } catch (e) {
    return handlePrismaError(e);
  }
}

export async function update(req: NextRequest, id: string) {
  try {
    await requireRole(["ADMIN"]);
    const body = await req.json();
    const parsed = documentTypeUpdateSchema.parse(body);
    const updated = await service.updateDocumentType(BigInt(id), parsed);
    return NextResponse.json(documentTypeResource(updated));
  } catch (e) {
    return handlePrismaError(e);
  }
}

export async function destroy(req: NextRequest, id: string) {
  try {
    await requireRole(["ADMIN"]);
    await service.deleteDocumentType(BigInt(id));
    return new NextResponse(null, { status: 204 });
  } catch (e) {
    return handlePrismaError(e);
  }
}
```

*`handlePrismaError` needs one addition beyond the Job Portal version to cover this module: catch `ZodError` and map it to a `422 { message, errors[] }` shape — this is exactly the 400-vs-422 inconsistency the dashboard-project review flagged, so define it once here rather than letting each controller improvise its own.*

### 9.5 Routes

```ts
// app/api/document-types/route.ts
import { index, store } from "@/lib/controllers/documentTypeAdminController";
export const GET = index;
export const POST = store;
```

```ts
// app/api/document-types/[id]/route.ts
import { update, destroy } from "@/lib/controllers/documentTypeAdminController";
export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  return update(req as any, params.id);
}
export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  return destroy(req as any, params.id);
}
```

### 9.6 Listing Page — Feature Checklist

| Feature | Notes |
|---|---|
| Paginated table | code, text, category, quote type, active/required/send-to-customer flags as columns |
| Search | by code or text, server-side via `?search=` |
| Filters | category, quote type, active status — as dropdowns updating `searchParams` |
| Sort | respect `sort_order`; consider a drag-to-reorder control that PATCHes `sortOrder` in bulk, since the Laravel side currently treats it as "arbitrary" — a real ordering UI here would actually improve on the source system |
| Row actions | Edit (→ `[id]/edit`), Delete (confirm dialog, since there's no soft-delete flag on this table yet) |
| Bulk toggle | Optional: bulk "set active/inactive" for a selected set of rows — common need for a reference-data table like this |

### 9.7 Create/Edit Form — Field Groupings

To avoid a single flat 20-field form, group fields the way they conceptually cluster:

- **Identity** — code, text, description
- **Classification** — category, quoteTypeId, businessTypeOfInsuranceId, businessTypeOfCustomer
- **Upload rules** — acceptedFiles, maxFiles, maxSize, folderPath
- **Behavior flags** — isActive, isRequired, sendToCustomer, receiveFromCustomer, isRequiredForSendPolicy, isRestrictedInternalDocument
- **Vehicle-specific** — registrationType, vehicleUse (only show this group when quoteTypeId resolves to CompanyCar, to avoid confusing non-car admins with irrelevant fields)
- **Display** — toolTip, sortOrder

Client-side validation mirrors `documentTypeSchema` (via `zodResolver` if using `react-hook-form`); the server-side parse in the controller remains the actual security boundary.

### 9.8 Roadmap Addition

**Phase 7 — Admin CRUD**
Build listing/search/filter page, create/edit forms with grouped fields, wire validators + `handlePrismaError`'s new Zod-error branch, add role gate for who can manage this reference table (likely a narrower set than "any ADMIN" in a real insurance org — confirm with blanka who currently has access to edit `document_types` in production).

**Phase 8 — Soft-delete decision**
Before shipping DELETE, confirm with blanka whether `document_types` needs an `is_deleted` flag added (matching `quote_type`'s pattern) instead of hard deletes — reference-data tables referenced by historical quotes/policies are usually safer to deactivate than remove.

---

## 12. Open Questions to Confirm Against blanka Before Building

1. Exact numeric values for `QuoteTypeId::CompanyCar`, `::Business`, `::Corpline` (and any other IDs referenced elsewhere in the class).
2. Full code list returned by `paymentDocumentTypesOptions($quoteTypeId)`.
3. Exact column(s) and direction used by the `sortDocumentType()` query scope.
4. Whether `forUmaf` (seen in the controller signature) still affects `getDocumentTypes`, or was a param that's since become dead.
5. Exact logic inside `DocumentTypeRepository::businessInsurerName()` and how `byBusinessTypeOfCustomer` uses its result — the snippet above assumes a simple equality match, which may not be accurate.
6. Whether blanka currently supports create/edit/delete of `document_types` rows at all (admin panel, Nova, direct DB access?) — and if so, which role/permission gates it, so the Next.js RBAC gate matches reality instead of assuming "ADMIN."
7. Whether `document_types` should gain an `is_deleted` soft-delete column (matching `quote_type`) before the Next.js CRUD ships a hard DELETE.

---

**Next step, if useful:** I can generate the actual Prisma migration SQL from the field list you already gave me, or draft the unit tests that compare Next.js output against known blanka responses.
