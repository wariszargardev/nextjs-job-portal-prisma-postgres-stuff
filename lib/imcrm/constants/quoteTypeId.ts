// imcrm: ported from blanka's QuoteTypeId enum.
// CompanyCar (15) and Business (5) are confirmed against the real `quote_type` snapshot
// (see prisma/seed/imcrm/quoteTypeSeeder.ts).
// TODO(blanka): Corpline has no matching row in that snapshot — 99 is still a guess;
// confirm it (or whether Corpline is only ever a quoteTypeCode under Business, not its
// own quoteTypeId) before relying on it.
export const QuoteTypeId = {
  CompanyCar: 15,
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
