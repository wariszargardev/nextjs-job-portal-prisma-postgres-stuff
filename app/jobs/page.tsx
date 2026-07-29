import Link from "next/link";
import { listPublishedJobs } from "@/lib/services/jobService";
import { JobFilters } from "@/components/JobFilters";
import { JobCard } from "@/components/JobCard";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type SearchParams = { keyword?: string; location?: string; page?: string };

export default async function JobsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;
  const page = Number(params.page ?? "1");

  const { items, total, totalPages } = await listPublishedJobs({
    keyword: params.keyword,
    location: params.location,
    page,
  });

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-6 px-4 py-10">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">Browse jobs</h1>
        <p className="text-sm text-slate-500">
          {total} open role{total === 1 ? "" : "s"}
        </p>
      </div>

      <JobFilters defaultKeyword={params.keyword} defaultLocation={params.location} />

      {items.length === 0 ? (
        <p className="rounded-lg border border-dashed border-slate-300 p-10 text-center text-slate-500">
          No jobs match your search.
        </p>
      ) : (
        <div className="flex flex-col gap-3">
          {items.map((job) => (
            <JobCard key={job.id} job={job} />
          ))}
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
            <Link
              key={p}
              href={{ pathname: "/jobs", query: { ...params, page: p } }}
              className={cn(buttonVariants({ variant: p === page ? "default" : "outline", size: "sm" }))}
            >
              {p}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
