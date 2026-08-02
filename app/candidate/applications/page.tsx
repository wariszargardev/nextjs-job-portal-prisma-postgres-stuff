import Link from "next/link";
import { auth } from "@/lib/auth/auth";
import { listApplicationsByCandidate } from "@/lib/services/applicationService";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusBadge } from "@/components/StatusBadge";

const STATUS_ORDER = ["PENDING", "REVIEWING", "SHORTLISTED", "HIRED", "REJECTED"] as const;

export default async function CandidateApplicationsPage() {
  const session = await auth();
  const applications = await listApplicationsByCandidate(session!.user.id);

  const statusCounts = applications.reduce<Record<string, number>>((acc, application) => {
    acc[application.status] = (acc[application.status] ?? 0) + 1;
    return acc;
  }, {});

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-6 px-4 py-10">
      <h1 className="text-2xl font-semibold text-slate-900">My applications</h1>

      {applications.length > 0 && (
        <div className="flex flex-wrap gap-2">
          <span className="rounded-full bg-slate-100 px-3 py-1 text-sm font-medium text-slate-700">
            {applications.length} total
          </span>
          {STATUS_ORDER.filter((status) => statusCounts[status]).map((status) => (
            <span key={status} className="inline-flex items-center gap-1.5 rounded-full bg-slate-50 px-3 py-1 text-sm text-slate-600">
              {statusCounts[status]} <StatusBadge status={status} />
            </span>
          ))}
        </div>
      )}

      {applications.length === 0 ? (
        <p className="rounded-lg border border-dashed border-slate-300 p-10 text-center text-slate-500">
          You haven&apos;t applied to any jobs yet.{" "}
          <Link href="/jobs" className="underline">
            Browse jobs
          </Link>
          .
        </p>
      ) : (
        <div className="flex flex-col gap-3">
          {applications.map((application) => (
            <Card key={application.id}>
              <CardHeader className="flex-row items-start justify-between">
                <div>
                  <CardTitle>
                    <Link href={`/jobs/${application.job.id}`} className="hover:underline">
                      {application.job.title}
                    </Link>
                  </CardTitle>
                  <CardDescription>{application.job.location}</CardDescription>
                </div>
                <StatusBadge status={application.status} />
              </CardHeader>
              {application.coverNote && (
                <CardContent>
                  <p className="text-sm text-slate-600">{application.coverNote}</p>
                </CardContent>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
