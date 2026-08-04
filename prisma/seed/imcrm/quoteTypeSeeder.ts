import prisma from "@/lib/db/prisma";
import type { Prisma } from "@/lib/generated/prisma/client";

// imcrm: full `quote_type` snapshot pulled from blanka (central_afia schema) —
// real ids, kept non-contiguous on purpose (12 -> 15 -> 18 -> 19 -> 20 -> 102):
// other blanka data (document_types.quote_type_id, quote.quote_type_id) references
// these exact ids, so don't renumber them to be sequential.
// ids 13, 14, 16, 17 are absent from the source table (soft-deleted/never existed) —
// not seeded here.
// createdAt/updatedAt are intentionally omitted — the schema's @default(now())/@updatedAt
// stamp them with the actual seed time instead of carrying over blanka's historical dates.
const rows: Prisma.QuoteTypeUncheckedCreateInput[] = [
  { id: 1, shortCode: "CAR", code: "Car", text: "Car Insurance", textAr: "تأمين السيارة", isActive: true, sortOrder: 1, isDeleted: false },
  { id: 2, shortCode: "HOM", code: "Home", text: "Home Insurance", textAr: "تأمين المنزل", isActive: true, sortOrder: 2, isDeleted: false },
  { id: 3, shortCode: "HEA", code: "Health", text: "Health Insurance", textAr: "تأمين صحي", isActive: true, sortOrder: 3, isDeleted: false },
  { id: 4, shortCode: "LIF", code: "Life", text: "Life Insurance", textAr: "التأمين على الحياة", isActive: true, sortOrder: 4, isDeleted: false },
  { id: 5, shortCode: "BUS", code: "Business", text: "Business Insurance", textAr: "تأمين الأعمال", isActive: true, sortOrder: 5, isDeleted: false },
  { id: 6, shortCode: "BIK", code: "Bike", text: "Bike Insurance", textAr: "تأمين الدراجة", isActive: true, sortOrder: 6, isDeleted: false },
  { id: 7, shortCode: "YAC", code: "Yacht", text: "Yacht Insurance", textAr: "تأمين المراكب البحرية", isActive: true, sortOrder: 7, isDeleted: false },
  { id: 8, shortCode: "TRA", code: "Travel", text: "Travel Insurance", textAr: "تأمين السفر", isActive: true, sortOrder: 8, isDeleted: false },
  { id: 9, shortCode: "PET", code: "Pet", text: "Pet Insurance", textAr: null, isActive: true, sortOrder: 9, isDeleted: false },
  { id: 10, shortCode: "CYC", code: "Cycle", text: "Cycle Insurance", textAr: null, isActive: true, sortOrder: 10, isDeleted: false },
  { id: 11, shortCode: "JET", code: "Jetski", text: "Jetski Insure", textAr: null, isActive: true, sortOrder: 11, isDeleted: false },
  { id: 12, shortCode: "BTC", code: "Business_Trade_Credit", text: "Business Trade Credit Insurance", textAr: null, isActive: false, sortOrder: null, isDeleted: false },
  { id: 15, shortCode: "COM", code: "CompanyCar", text: "Company Car Insurance", textAr: null, isActive: true, sortOrder: null, isDeleted: false },
  { id: 18, shortCode: "SAV", code: "Savings", text: "Savings", textAr: null, isActive: true, sortOrder: null, isDeleted: false },
  { id: 19, shortCode: "CYB", code: "Cyber", text: "Cyber Insurance", textAr: null, isActive: true, sortOrder: 19, isDeleted: false },
  { id: 20, shortCode: "DEV", code: "Device", text: "Device Insurance", textAr: null, isActive: true, sortOrder: 20, isDeleted: false },
  { id: 102, shortCode: "GM", code: "Group Medical", text: "Group Medical Insurance", textAr: null, isActive: true, sortOrder: null, isDeleted: false },
];

export async function seedQuoteTypes() {
  for (const row of rows) {
    await prisma.quoteType.upsert({
      where: { id: row.id },
      create: row,
      update: row,
    });
  }

  await prisma.$executeRawUnsafe(`
    SELECT setval(
      pg_get_serial_sequence('"QuoteType"', 'id'),
      COALESCE((SELECT MAX(id) FROM "QuoteType"), 1)
    );
  `);

  console.log(`imcrm: seeded ${rows.length} quote_type rows`);
}
