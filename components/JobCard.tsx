import Link from "next/link";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { InitialsAvatar } from "@/components/InitialsAvatar";
import { SaveJobButton } from "@/components/SaveJobButton";
import { formatRelativeDate } from "@/lib/date";
import type { JobWithEmployer } from "@/lib/services/jobService";

export function JobCard({ job }: { job: JobWithEmployer }) {
  return (
    <Card className="relative transition-shadow hover:shadow-md">
      <Link href={`/jobs/${job.id}`} className="absolute inset-0 z-0" aria-label={job.title} />

      <CardHeader className="flex-row items-start gap-4">
        <InitialsAvatar name={job.employer.name} />
        <div className="min-w-0 flex-1">
          <h3 className="truncate font-semibold text-slate-900">{job.title}</h3>
          <p className="truncate text-sm text-slate-500">{job.employer.name}</p>
        </div>
        <div className="relative z-10">
          <SaveJobButton jobId={job.id} />
        </div>
      </CardHeader>

      <CardContent className="flex flex-col gap-3">
        <p className="line-clamp-2 text-sm text-slate-600">{job.description}</p>
        <div className="flex flex-wrap items-center gap-2">
          <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600">
            {job.location}
          </span>
          {job.department && (
            <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600">
              {job.department}
            </span>
          )}
          <span className="ml-auto text-xs text-slate-400">{formatRelativeDate(job.createdAt)}</span>
        </div>
      </CardContent>
    </Card>
  );
}
