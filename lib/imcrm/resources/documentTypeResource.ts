import type { DocumentType } from "@/lib/generated/prisma/client";

export function toDocumentTypeResource(doc: DocumentType) {
  return {
    id: doc.id.toString(),
    code: doc.code,
    text: doc.text,
    description: doc.description,
    isActive: doc.isActive,
    quoteTypeId: doc.quoteTypeId,
    folderPath: doc.folderPath,
    acceptedFiles: doc.acceptedFiles,
    maxFiles: doc.maxFiles,
    maxSize: doc.maxSize,
    isRequired: doc.isRequired,
    sendToCustomer: doc.sendToCustomer,
    receiveFromCustomer: doc.receiveFromCustomer,
    category: doc.category,
    isRequiredForSendPolicy: doc.isRequiredForSendPolicy,
    businessTypeOfInsuranceId: doc.businessTypeOfInsuranceId?.toString() ?? null,
    businessTypeOfCustomer: doc.businessTypeOfCustomer,
    toolTip: doc.toolTip,
    registrationType: doc.registrationType,
    vehicleUse: doc.vehicleUse,
    isRestrictedInternalDocument: doc.isRestrictedInternalDocument,
    sortOrder: doc.sortOrder,
  };
}

export function toDocumentTypeListResource(docs: DocumentType[]) {
  return docs.map(toDocumentTypeResource);
}
