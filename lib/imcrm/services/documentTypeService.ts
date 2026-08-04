import prisma from "@/lib/db/prisma";
import { Prisma } from "@/lib/generated/prisma/client";
import type { DocumentType } from "@/lib/generated/prisma/client";
import { DocumentTypeCode, BOR_ONLY_CODES } from "@/lib/imcrm/constants/documentTypeCode";
import { QuoteTypeId, QuoteTypeCode, DocumentCategory } from "@/lib/imcrm/constants/quoteTypeId";
import { businessInsurerName } from "@/lib/imcrm/repositories/documentTypeRepository";

// imcrm: direct port of blanka's QuoteDocumentService@getDocumentTypes.
type GetDocumentTypesArgs = {
  quoteTypeId: number;
  businessTypeOfInsurance?: number | null;
  businessTypeOfCustomer?: string | null;
  quoteTypeCode?: string | null;
  quote?: { registrationType?: string | null; vehicleUse?: string | null } | null;
  hasBorPermission: boolean;
};

export async function getDocumentTypes({
  quoteTypeId,
  businessTypeOfInsurance,
  businessTypeOfCustomer,
  quoteTypeCode,
  quote,
  hasBorPermission,
}: GetDocumentTypesArgs) {
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
    // TODO(blanka): businessInsurerName() lookup below is currently a no-op placeholder —
    // confirm whether byBusinessTypeOfCustomer does more than an equality match.
    businessInsurerName(businessTypeOfInsurance ?? null);
    where.businessTypeOfCustomer = businessTypeOfCustomer;
  }

  if (quoteTypeId === QuoteTypeId.CompanyCar) {
    where.AND = [
      { OR: [{ registrationType: null }, { registrationType: quote?.registrationType ?? undefined }] },
      { OR: [{ vehicleUse: null }, { vehicleUse: quote?.vehicleUse ?? undefined }] },
    ];
  }

  // TODO(blanka): confirm the exact multi-column order used by the sortDocumentType() scope.
  let documentTypes = await prisma.documentType.findMany({
    where,
    orderBy: [{ sortOrder: "asc" }, { id: "asc" }],
  });

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
      orderBy: [{ sortOrder: "asc" }, { id: "asc" }],
    });

    documentTypes = [...documentTypes, ...businessDocumentTypes];
  }

  const paymentCodes = paymentDocumentTypesOptions(quoteTypeId);
  const paymentDocuments = documentTypes.filter((d) => paymentCodes.includes(d.code));

  const byCategory = new Map<string, DocumentType[]>();
  for (const doc of documentTypes) {
    if (!byCategory.has(doc.category)) byCategory.set(doc.category, []);
    byCategory.get(doc.category)!.push(doc);
  }

  const orderedCategories: string[] = [DocumentCategory.QUOTE, DocumentCategory.MEMBER, DocumentCategory.ISSUING_DOCUMENTS];
  const orderedDocumentTypesByCategory: Record<string, DocumentType[]> = {};
  for (const cat of orderedCategories) {
    if (byCategory.has(cat)) orderedDocumentTypesByCategory[cat] = byCategory.get(cat)!;
  }

  return { orderedDocumentTypesByCategory, paymentDocuments };
}

// TODO(blanka): port the exact code list from paymentDocumentTypesOptions($quoteTypeId)
// in QuoteDocumentService — currently returns nothing, so no documents are split into
// the payment bucket.
function paymentDocumentTypesOptions(_quoteTypeId: number): string[] {
  return [];
}
