import { notFound } from "next/navigation";
import { getDocumentTypeById } from "@/lib/imcrm/services/documentTypeAdminService";
import { listActiveQuoteTypes } from "@/lib/imcrm/services/quoteTypeService";
import { toDocumentTypeResource } from "@/lib/imcrm/resources/documentTypeResource";
import { DocumentTypeForm } from "@/components/imcrm/DocumentTypeForm";

export default async function EditDocumentTypePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const [documentType, quoteTypes] = await Promise.all([
    getDocumentTypeById(BigInt(id)),
    listActiveQuoteTypes(),
  ]);
  if (!documentType) notFound();

  return (
    <div className="flex w-full max-w-2xl flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">Edit document type</h1>
        <p className="text-sm text-slate-500 font-mono">{documentType.code}</p>
      </div>
      <DocumentTypeForm documentType={toDocumentTypeResource(documentType)} quoteTypes={quoteTypes} />
    </div>
  );
}
