"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export function ApplyForm({ jobId }: { jobId: string }) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setError(null);

    const formData = new FormData(event.currentTarget);
    const coverNote = formData.get("coverNote");
    const resumeFile = formData.get("resume") as File | null;

    let resumePath: string | undefined;

    if (resumeFile && resumeFile.size > 0) {
      const uploadData = new FormData();
      uploadData.set("resume", resumeFile);

      const uploadResponse = await fetch("/api/upload", { method: "POST", body: uploadData });
      if (!uploadResponse.ok) {
        const body = await uploadResponse.json().catch(() => ({}));
        setPending(false);
        setError(body.error ?? "Could not upload resume");
        return;
      }
      ({ path: resumePath } = await uploadResponse.json());
    }

    const response = await fetch("/api/applications", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ jobId, coverNote: coverNote || undefined, resumePath }),
    });

    setPending(false);

    if (response.status === 409) {
      setError("You've already applied to this job.");
      return;
    }

    if (!response.ok) {
      setError("Something went wrong. Please try again.");
      return;
    }

    router.push("/candidate/applications");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="coverNote">Cover note (optional)</Label>
        <Textarea id="coverNote" name="coverNote" placeholder="Why are you a good fit for this role?" />
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="resume">Resume (PDF or Word, optional)</Label>
        <input
          id="resume"
          name="resume"
          type="file"
          accept=".pdf,.doc,.docx"
          className="text-sm text-slate-700"
        />
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <Button type="submit" loading={pending}>
        {pending ? "Submitting..." : "Submit application"}
      </Button>
    </form>
  );
}
