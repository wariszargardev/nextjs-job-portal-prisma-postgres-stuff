import prisma from "@/lib/db/prisma";
import { Prisma } from "@/lib/generated/prisma/client";
import type { JobFilter, Paginated } from "@/lib/models/types";
import type { CreateJobInput, UpdateJobInput } from "@/lib/validators/jobValidator";
import { UnauthorizedError } from "@/lib/errors/UnauthorizedError";

export const JOB_SELECT = {
  id: true,
  title: true,
  description: true,
  location: true,
  department: true,
  isPublished: true,
  employerId: true,
  createdAt: true,
  updatedAt: true,
  employer: { select: { id: true, name: true } },
} satisfies Prisma.JobSelect;

export type JobWithEmployer = Prisma.JobGetPayload<{ select: typeof JOB_SELECT }>;

const DEFAULT_PER_PAGE = 10;

export async function listPublishedJobs(filter: JobFilter = {}): Promise<Paginated<JobWithEmployer>> {
  const { keyword, location, page = 1, perPage = DEFAULT_PER_PAGE } = filter;

  const where: Prisma.JobWhereInput = {
    isPublished: true,
    ...(keyword
      ? {
          OR: [
            { title: { contains: keyword, mode: "insensitive" } },
            { description: { contains: keyword, mode: "insensitive" } },
          ],
        }
      : {}),
    ...(location ? { location: { contains: location, mode: "insensitive" } } : {}),
  };

  const [total, items] = await Promise.all([
    prisma.job.count({ where }),
    prisma.job.findMany({
      where,
      select: JOB_SELECT,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * perPage,
      take: perPage,
    }),
  ]);

  return { items, total, page, perPage, totalPages: Math.max(1, Math.ceil(total / perPage)) };
}

export async function getPublishedJobById(id: string): Promise<JobWithEmployer | null> {
  const job = await prisma.job.findUnique({ where: { id }, select: JOB_SELECT });
  if (!job || !job.isPublished) return null;
  return job;
}

export async function listJobsByEmployer(employerId: string): Promise<JobWithEmployer[]> {
  return prisma.job.findMany({
    where: { employerId },
    select: JOB_SELECT,
    orderBy: { createdAt: "desc" },
  });
}

export type JobWithApplicantCount = JobWithEmployer & { applicantCount: number };

export async function listJobsByEmployerWithApplicantCount(
  employerId: string
): Promise<JobWithApplicantCount[]> {
  const jobs = await prisma.job.findMany({
    where: { employerId },
    select: { ...JOB_SELECT, _count: { select: { applications: true } } },
    orderBy: { createdAt: "desc" },
  });

  return jobs.map(({ _count, ...job }) => ({ ...job, applicantCount: _count.applications }));
}

export async function getJobByIdForEmployer(id: string, employerId: string): Promise<JobWithEmployer | null> {
  return prisma.job.findFirst({ where: { id, employerId }, select: JOB_SELECT });
}

export async function createJob(employerId: string, data: CreateJobInput): Promise<JobWithEmployer> {
  return prisma.job.create({
    data: { ...data, employerId },
    select: JOB_SELECT,
  });
}

export async function updateJob(
  jobId: string,
  employerId: string,
  data: UpdateJobInput
): Promise<JobWithEmployer | null> {
  const existing = await prisma.job.findUnique({ where: { id: jobId } });
  if (!existing) return null;
  if (existing.employerId !== employerId) {
    throw new UnauthorizedError("You don't own this job");
  }

  return prisma.job.update({ where: { id: jobId }, data, select: JOB_SELECT });
}

export async function deleteJob(jobId: string, employerId: string): Promise<boolean> {
  const existing = await prisma.job.findUnique({ where: { id: jobId } });
  if (!existing) return false;
  if (existing.employerId !== employerId) {
    throw new UnauthorizedError("You don't own this job");
  }

  await prisma.job.delete({ where: { id: jobId } });
  return true;
}
