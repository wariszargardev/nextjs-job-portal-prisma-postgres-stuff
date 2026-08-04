import prisma from "@/lib/db/prisma";
import { Prisma } from "@/lib/generated/prisma/client";
import type { CreateDocumentTypeInput, UpdateDocumentTypeInput } from "@/lib/imcrm/validators/documentTypeValidator";

export type ListDocumentTypesFilter = {
  page?: number;
  pageSize?: number;
  search?: string;
  category?: string;
  quoteTypeId?: number;
  isActive?: boolean;
};

const DEFAULT_PAGE_SIZE = 20;

export async function listDocumentTypes(filter: ListDocumentTypesFilter = {}) {
  const { page = 1, pageSize = DEFAULT_PAGE_SIZE, search, category, quoteTypeId, isActive } = filter;

  const where: Prisma.DocumentTypeWhereInput = {
    ...(search
      ? {
          OR: [
            { code: { contains: search, mode: "insensitive" } },
            { text: { contains: search, mode: "insensitive" } },
          ],
        }
      : {}),
    ...(category ? { category } : {}),
    ...(quoteTypeId ? { quoteTypeId } : {}),
    ...(isActive !== undefined ? { isActive } : {}),
  };

  const [total, items] = await Promise.all([
    prisma.documentType.count({ where }),
    prisma.documentType.findMany({
      where,
      orderBy: [{ sortOrder: "asc" }, { id: "asc" }],
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
  ]);

  return { items, total, page, pageSize, totalPages: Math.max(1, Math.ceil(total / pageSize)) };
}

export async function getDocumentTypeStats() {
  const [total, active, required] = await Promise.all([
    prisma.documentType.count(),
    prisma.documentType.count({ where: { isActive: true } }),
    prisma.documentType.count({ where: { isRequired: true } }),
  ]);

  return { total, active, required };
}

export async function getDocumentTypeById(id: bigint) {
  return prisma.documentType.findUnique({ where: { id } });
}

export async function createDocumentType(data: CreateDocumentTypeInput) {
  return prisma.documentType.create({ data });
}

export async function updateDocumentType(id: bigint, data: UpdateDocumentTypeInput) {
  return prisma.documentType.update({ where: { id }, data });
}

// imcrm: document_types has no is_deleted flag (unlike quote_type) — this is a hard delete.
// TODO(blanka): confirm whether this reference table needs a soft-delete flag before
// DELETE is exposed against real quote/policy history.
export async function deleteDocumentType(id: bigint) {
  return prisma.documentType.delete({ where: { id } });
}
