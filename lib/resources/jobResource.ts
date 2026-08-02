import type { JobWithEmployer } from "@/lib/services/jobService";

export function toJobResource(job: JobWithEmployer) {
  return {
    id: job.id,
    title: job.title,
    description: job.description,
    location: job.location,
    department: job.department,
    isPublished: job.isPublished,
    employer: job.employer,
    createdAt: job.createdAt.toISOString(),
    updatedAt: job.updatedAt.toISOString(),
  };
}

export function toJobListResource(jobs: JobWithEmployer[]) {
  return jobs.map(toJobResource);
}
