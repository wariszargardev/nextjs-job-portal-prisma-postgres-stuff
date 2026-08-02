import Link from "next/link";
import { auth } from "@/lib/auth/auth";
import { listJobsByEmployerWithApplicantCount } from "@/lib/services/jobService";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { JobActions } from "@/components/JobActions";

export default async function EmployerJobsPage() {
  const session = await auth();
  const jobs = await listJobsByEmployerWithApplicantCount(session!.user.id);

  const publishedCount = jobs.filter((job) => job.isPublished).length;
  const totalApplicants = jobs.reduce((sum, job) => sum + job.applicantCount, 0);

  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col gap-6 px-4 py-10">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-slate-900">My jobs</h1>
        <Link href="/employer/jobs/new" className={cn(buttonVariants())}>
          Post a job
        </Link>
      </div>

      {jobs.length > 0 && (
        <div className="grid grid-cols-3 gap-3">
          <div className="rounded-lg border border-slate-200 bg-white p-4 text-center">
            <p className="text-2xl font-semibold text-slate-900">{jobs.length}</p>
            <p className="text-sm text-slate-500">Jobs posted</p>
          </div>
          <div className="rounded-lg border border-slate-200 bg-white p-4 text-center">
            <p className="text-2xl font-semibold text-slate-900">{publishedCount}</p>
            <p className="text-sm text-slate-500">Published</p>
          </div>
          <div className="rounded-lg border border-slate-200 bg-white p-4 text-center">
            <p className="text-2xl font-semibold text-brand-600">{totalApplicants}</p>
            <p className="text-sm text-slate-500">Total applicants</p>
          </div>
        </div>
      )}

      {jobs.length === 0 ? (
        <p className="rounded-lg border border-dashed border-slate-300 p-10 text-center text-slate-500">
          You haven&apos;t posted any jobs yet.
        </p>
      ) : (
        <div className="flex flex-col gap-3">
          {jobs.map((job) => (
            <Card key={job.id}>
              <CardHeader className="flex-row items-start justify-between">
                <div>
                  <CardTitle>{job.title}</CardTitle>
                  <CardDescription>
                    {job.location} · {job.isPublished ? "Published" : "Draft"}
                  </CardDescription>
                </div>
                <JobActions jobId={job.id} isPublished={job.isPublished} />
              </CardHeader>
              <CardContent className="flex flex-wrap items-center gap-3">
                <Link
                  href={`/employer/jobs/${job.id}/edit`}
                  className={cn(buttonVariants({ variant: "outline", size: "sm" }))}
                >
                  Edit
                </Link>
                <Link
                  href={`/employer/applications?jobId=${job.id}`}
                  className={cn(buttonVariants({ variant: "outline", size: "sm" }))}
                >
                  View applicants
                </Link>
                <span className="rounded-full bg-brand-50 px-2.5 py-1 text-xs font-medium text-brand-700">
                  {job.applicantCount} applicant{job.applicantCount === 1 ? "" : "s"}
                </span>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
