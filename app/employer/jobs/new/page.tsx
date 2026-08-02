import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { JobForm } from "@/components/forms/JobForm";

export default function NewJobPage() {
  return (
    <div className="mx-auto w-full max-w-2xl px-4 py-10">
      <Card>
        <CardHeader>
          <CardTitle>Post a job</CardTitle>
        </CardHeader>
        <CardContent>
          <JobForm />
        </CardContent>
      </Card>
    </div>
  );
}
