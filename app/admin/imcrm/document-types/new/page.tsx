import { listActiveQuoteTypes } from "@/lib/imcrm/services/quoteTypeService";
import { DocumentTypeForm } from "@/components/imcrm/DocumentTypeForm";

export default async function NewDocumentTypePage() {
  const quoteTypes = await listActiveQuoteTypes();

  return (
    <div className="flex w-full max-w-2xl flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">New document type</h1>
        <p className="text-sm text-slate-500">Add a reference row for the document-types read path.</p>
      </div>
      <DocumentTypeForm quoteTypes={quoteTypes} />
    </div>
  );
}
