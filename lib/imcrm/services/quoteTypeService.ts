import prisma from "@/lib/db/prisma";

// imcrm: ported from blanka's ActivitiesService::getQuoteTypeId — resolves the
// `[quoteType]` route param (e.g. "car") to the numeric quote_type id.
export async function getQuoteTypeId(quoteTypeParam: string): Promise<number | null> {
  const quoteType = await prisma.quoteType.findFirst({
    where: {
      isActive: true,
      isDeleted: false,
      OR: [
        { code: { equals: quoteTypeParam, mode: "insensitive" } },
        { shortCode: { equals: quoteTypeParam, mode: "insensitive" } },
      ],
    },
    select: { id: true },
  });

  return quoteType?.id ?? null;
}

export async function listActiveQuoteTypes() {
  return prisma.quoteType.findMany({
    where: { isActive: true, isDeleted: false },
    orderBy: [{ sortOrder: "asc" }, { id: "asc" }],
    select: { id: true, text: true },
  });
}
