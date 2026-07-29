import { notFound } from "next/navigation";
import Link from "next/link";
import { auth } from "@/lib/auth/auth";
import { getPublishedJobById } from "@/lib/services/jobService";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default async function JobDetailPage({
  params,
}: {
  params: Promise<{ jobId: string }>;
}) {
  const { jobId } = await params;
  const job = await getPublishedJobById(jobId);
  if (!job) notFound();

  const session = await auth();
  const canApply = session?.user?.role === "CANDIDATE";

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-6 px-4 py-10">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">{job.title}</CardTitle>
          <CardDescription>
            {job.employer.name} · {job.location}
            {job.department ? ` · ${job.department}` : ""}
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <p className="whitespace-pre-wrap text-slate-700">{job.description}</p>

          {canApply ? (
            <Link href={`/jobs/${job.id}/apply`} className={cn(buttonVariants(), "w-fit")}>
              Apply now
            </Link>
          ) : session?.user ? (
            <p className="text-sm text-slate-500">Only candidates can apply to jobs.</p>
          ) : (
            <Link
              href={`/login?callbackUrl=/jobs/${job.id}`}
              className={cn(buttonVariants(), "w-fit")}
            >
              Sign in to apply
            </Link>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
