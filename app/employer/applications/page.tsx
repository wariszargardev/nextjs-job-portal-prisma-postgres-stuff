import Link from "next/link";
import { auth } from "@/lib/auth/auth";
import { listJobsByEmployer } from "@/lib/services/jobService";
import { listApplicationsForJob } from "@/lib/services/applicationService";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ApplicationStatusSelect } from "@/components/ApplicationStatusSelect";

export default async function EmployerApplicationsPage({
  searchParams,
}: {
  searchParams: Promise<{ jobId?: string }>;
}) {
  const { jobId } = await searchParams;
  const session = await auth();

  if (!jobId) {
    const jobs = await listJobsByEmployer(session!.user.id);
    return (
      <div className="mx-auto flex w-full max-w-3xl flex-col gap-6 px-4 py-10">
        <h1 className="text-2xl font-semibold text-slate-900">Applications</h1>

        {jobs.length === 0 ? (
          <p className="rounded-lg border border-dashed border-slate-300 p-10 text-center text-slate-500">
            Post a job before you can review applicants.
          </p>
        ) : (
          <>
            <p className="text-sm text-slate-500">Pick a job to see its applicants.</p>
            <div className="flex flex-col gap-2">
              {jobs.map((job) => (
                <Link
                  key={job.id}
                  href={`/employer/applications?jobId=${job.id}`}
                  className="rounded-lg border border-slate-200 bg-white p-4 hover:bg-slate-50"
                >
                  {job.title}
                </Link>
              ))}
            </div>
          </>
        )}
      </div>
    );
  }

  const applications = await listApplicationsForJob(jobId, session!.user.id);

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-6 px-4 py-10">
      <h1 className="text-2xl font-semibold text-slate-900">Applicants</h1>

      {applications.length === 0 ? (
        <p className="rounded-lg border border-dashed border-slate-300 p-10 text-center text-slate-500">
          No applications yet for this job.
        </p>
      ) : (
        <div className="flex flex-col gap-3">
          {applications.map((application) => (
            <Card key={application.id}>
              <CardHeader className="flex-row items-start justify-between">
                <div>
                  <CardTitle>{application.candidate.name}</CardTitle>
                  <CardDescription>{application.candidate.email}</CardDescription>
                </div>
                <ApplicationStatusSelect applicationId={application.id} status={application.status} />
              </CardHeader>
              <CardContent className="flex flex-col gap-2">
                {application.coverNote && (
                  <p className="text-sm text-slate-600">{application.coverNote}</p>
                )}
                {application.resumePath && <p className="text-sm text-slate-500">Resume on file</p>}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
