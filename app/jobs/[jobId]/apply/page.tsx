import { notFound, redirect } from "next/navigation";
import { auth } from "@/lib/auth/auth";
import { getPublishedJobById } from "@/lib/services/jobService";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ApplyForm } from "@/components/forms/ApplyForm";

export default async function ApplyPage({
  params,
}: {
  params: Promise<{ jobId: string }>;
}) {
  const { jobId } = await params;
  const job = await getPublishedJobById(jobId);
  if (!job) notFound();

  const session = await auth();
  if (!session?.user) redirect(`/login?callbackUrl=/jobs/${jobId}/apply`);
  if (session.user.role !== "CANDIDATE") redirect(`/jobs/${jobId}`);

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-6 px-4 py-10">
      <Card>
        <CardHeader>
          <CardTitle>Apply to {job.title}</CardTitle>
          <CardDescription>
            {job.employer.name} · {job.location}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ApplyForm jobId={job.id} />
        </CardContent>
      </Card>
    </div>
  );
}
