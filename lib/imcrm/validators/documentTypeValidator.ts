import { z } from "zod";

export const documentTypeSchema = z.object({
  code: z.string().min(2).max(50),
  text: z.string().min(1).max(100),
  description: z.string().optional().nullable(),
  isActive: z.boolean().default(true),
  quoteTypeId: z.number().int().optional().nullable(),
  folderPath: z.string().optional().nullable(),
  acceptedFiles: z.string().optional().nullable(),
  maxFiles: z.number().int().min(1).default(1),
  maxSize: z.number().int().min(1).default(5),
  isRequired: z.boolean().default(false),
  sendToCustomer: z.boolean().default(false),
  sortOrder: z.number().int().optional().nullable(),
  receiveFromCustomer: z.boolean().default(false),
  category: z
    .enum(["QUOTE", "MEMBER", "ISSUING_DOCUMENTS", "SEND_UPDATE", "ENDORSEMENT_DOCUMENTS"])
    .default("QUOTE"),
  isRequiredForSendPolicy: z.boolean().default(false),
  businessTypeOfInsuranceId: z.number().int().optional().nullable(),
  businessTypeOfCustomer: z.enum(["IBTC", "CBTC"]).optional().nullable(),
  toolTip: z.string().optional().nullable(),
  registrationType: z.string().max(10).optional().nullable(),
  vehicleUse: z.string().max(10).optional().nullable(),
  isRestrictedInternalDocument: z.boolean().default(false),
});

export const documentTypeUpdateSchema = documentTypeSchema.partial();

export type CreateDocumentTypeInput = z.infer<typeof documentTypeSchema>;
export type UpdateDocumentTypeInput = z.infer<typeof documentTypeUpdateSchema>;
