import { notFound } from "next/navigation";
import { auth } from "@/lib/auth/auth";
import { getJobByIdForEmployer } from "@/lib/services/jobService";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { JobForm } from "@/components/forms/JobForm";

export default async function EditJobPage({
  params,
}: {
  params: Promise<{ jobId: string }>;
}) {
  const { jobId } = await params;
  const session = await auth();
  const job = await getJobByIdForEmployer(jobId, session!.user.id);
  if (!job) notFound();

  return (
    <div className="mx-auto w-full max-w-2xl px-4 py-10">
      <Card>
        <CardHeader>
          <CardTitle>Edit job</CardTitle>
        </CardHeader>
        <CardContent>
          <JobForm job={job} />
        </CardContent>
      </Card>
    </div>
  );
}
