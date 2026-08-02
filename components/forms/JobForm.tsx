"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { JobWithEmployer } from "@/lib/services/jobService";

export function JobForm({ job }: { job?: JobWithEmployer }) {
  const router = useRouter();
  const [errors, setErrors] = useState<Record<string, string[] | undefined>>({});
  const [pending, setPending] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setErrors({});

    const formData = new FormData(event.currentTarget);
    const department = formData.get("department");

    const payload = {
      title: formData.get("title"),
      description: formData.get("description"),
      location: formData.get("location"),
      department: department ? department : undefined,
      isPublished: formData.get("isPublished") === "on",
    };

    const url = job ? `/api/jobs/${job.id}` : "/api/jobs";
    const method = job ? "PATCH" : "POST";

    const response = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    setPending(false);

    if (response.status === 422) {
      const { errors: fieldErrors } = await response.json();
      setErrors(fieldErrors ?? {});
      return;
    }

    if (!response.ok) {
      setErrors({ form: ["Something went wrong. Please try again."] });
      return;
    }

    router.push("/employer/jobs");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="title">Title</Label>
        <Input id="title" name="title" defaultValue={job?.title} required />
        {errors.title && <p className="text-sm text-red-600">{errors.title[0]}</p>}
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="description">Description</Label>
        <Textarea id="description" name="description" defaultValue={job?.description} required />
        {errors.description && <p className="text-sm text-red-600">{errors.description[0]}</p>}
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="location">Location</Label>
        <Input id="location" name="location" defaultValue={job?.location} required />
        {errors.location && <p className="text-sm text-red-600">{errors.location[0]}</p>}
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="department">Department (optional)</Label>
        <Input id="department" name="department" defaultValue={job?.department ?? ""} />
      </div>

      <label className="flex items-center gap-2 text-sm text-slate-700">
        <input type="checkbox" name="isPublished" defaultChecked={job?.isPublished ?? true} />
        Published (visible to candidates)
      </label>

      {errors.form && <p className="text-sm text-red-600">{errors.form[0]}</p>}

      <Button type="submit" loading={pending}>
        {pending ? "Saving..." : job ? "Save changes" : "Post job"}
      </Button>
    </form>
  );
}
