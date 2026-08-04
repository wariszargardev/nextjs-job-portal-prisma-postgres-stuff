import Link from "next/link";
import { listDocumentTypes, getDocumentTypeStats } from "@/lib/imcrm/services/documentTypeAdminService";
import { Card, CardContent } from "@/components/ui/card";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { DocumentTypeFilters } from "@/components/imcrm/DocumentTypeFilters";
import { DocumentTypeActions } from "@/components/imcrm/DocumentTypeActions";
import { CategoryBadge } from "@/components/imcrm/CategoryBadge";
import { BooleanBadge } from "@/components/imcrm/BooleanBadge";

export default async function DocumentTypesPage({
  searchParams,
}: {
  searchParams: Promise<{ search?: string; category?: string; page?: string }>;
}) {
  const { search, category, page } = await searchParams;
  const currentPage = page ? Number(page) : 1;

  const [result, stats] = await Promise.all([
    listDocumentTypes({ search, category, page: currentPage }),
    getDocumentTypeStats(),
  ]);

  function pageHref(targetPage: number) {
    const params = new URLSearchParams();
    if (search) params.set("search", search);
    if (category) params.set("category", category);
    params.set("page", String(targetPage));
    return `/admin/imcrm/document-types?${params.toString()}`;
  }

  return (
    <div className="flex w-full max-w-5xl flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Document types</h1>
          <p className="text-sm text-slate-500">Reference data behind blanka&apos;s quote document uploads</p>
        </div>
        <Link href="/admin/imcrm/document-types/new" className={cn(buttonVariants())}>
          New document type
        </Link>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <div className="rounded-lg border border-slate-200 bg-white p-4 text-center">
          <p className="text-2xl font-semibold text-slate-900">{stats.total}</p>
          <p className="text-sm text-slate-500">Total</p>
        </div>
        <div className="rounded-lg border border-slate-200 bg-white p-4 text-center">
          <p className="text-2xl font-semibold text-green-700">{stats.active}</p>
          <p className="text-sm text-slate-500">Active</p>
        </div>
        <div className="rounded-lg border border-slate-200 bg-white p-4 text-center">
          <p className="text-2xl font-semibold text-brand-600">{stats.required}</p>
          <p className="text-sm text-slate-500">Required</p>
        </div>
      </div>

      <DocumentTypeFilters defaultSearch={search} defaultCategory={category} />

      {result.items.length === 0 ? (
        <p className="rounded-lg border border-dashed border-slate-300 p-10 text-center text-slate-500">
          {search || category ? "No document types match these filters." : "No document types yet."}
        </p>
      ) : (
        <Card>
          <CardContent className="overflow-x-auto p-0">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-slate-200 text-slate-500">
                <tr>
                  <th className="px-4 py-3 font-medium">Code</th>
                  <th className="px-4 py-3 font-medium">Text</th>
                  <th className="px-4 py-3 font-medium">Category</th>
                  <th className="px-4 py-3 font-medium">Quote type</th>
                  <th className="px-4 py-3 font-medium">Active</th>
                  <th className="px-4 py-3 font-medium">Required</th>
                  <th className="px-4 py-3 font-medium"></th>
                </tr>
              </thead>
              <tbody>
                {result.items.map((doc) => (
                  <tr key={doc.id.toString()} className="border-b border-slate-100 last:border-0 hover:bg-slate-50">
                    <td className="px-4 py-3 font-mono text-xs text-slate-600">{doc.code}</td>
                    <td className="px-4 py-3">
                      <Link
                        href={`/admin/imcrm/document-types/${doc.id}/edit`}
                        className="font-medium text-slate-900 hover:text-brand-600 hover:underline"
                      >
                        {doc.text}
                      </Link>
                    </td>
                    <td className="px-4 py-3">
                      <CategoryBadge category={doc.category} />
                    </td>
                    <td className="px-4 py-3 text-slate-600">{doc.quoteTypeId ?? "—"}</td>
                    <td className="px-4 py-3">
                      <BooleanBadge value={doc.isActive} />
                    </td>
                    <td className="px-4 py-3">
                      <BooleanBadge value={doc.isRequired} />
                    </td>
                    <td className="px-4 py-3">
                      <DocumentTypeActions id={doc.id.toString()} isActive={doc.isActive} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>
      )}

      {result.totalPages > 1 && (
        <div className="flex items-center justify-center gap-3 text-sm text-slate-500">
          <Link
            href={pageHref(Math.max(1, result.page - 1))}
            aria-disabled={result.page <= 1}
            className={cn(
              buttonVariants({ variant: "outline", size: "sm" }),
              result.page <= 1 && "pointer-events-none opacity-50"
            )}
          >
            Previous
          </Link>
          <span>
            Page {result.page} of {result.totalPages}
          </span>
          <Link
            href={pageHref(Math.min(result.totalPages, result.page + 1))}
            aria-disabled={result.page >= result.totalPages}
            className={cn(
              buttonVariants({ variant: "outline", size: "sm" }),
              result.page >= result.totalPages && "pointer-events-none opacity-50"
            )}
          >
            Next
          </Link>
        </div>
      )}
    </div>
  );
}
