import prisma from "@/lib/db/prisma";
import { Prisma } from "@/lib/generated/prisma/client";
import type { ApplyInput } from "@/lib/validators/applicationValidator";
import { UnauthorizedError } from "@/lib/errors/UnauthorizedError";

export const APPLICATION_SELECT = {
  id: true,
  jobId: true,
  candidateId: true,
  status: true,
  coverNote: true,
  resumePath: true,
  createdAt: true,
  updatedAt: true,
  job: { select: { id: true, title: true, location: true, employerId: true } },
  candidate: { select: { id: true, name: true, email: true } },
} satisfies Prisma.JobApplicationSelect;

export type ApplicationWithRelations = Prisma.JobApplicationGetPayload<{
  select: typeof APPLICATION_SELECT;
}>;

export async function createApplication(
  candidateId: string,
  data: ApplyInput
): Promise<ApplicationWithRelations> {
  return prisma.jobApplication.create({
    data: {
      jobId: data.jobId,
      candidateId,
      coverNote: data.coverNote,
      resumePath: data.resumePath,
    },
    select: APPLICATION_SELECT,
  });
}

export async function listApplicationsByCandidate(
  candidateId: string
): Promise<ApplicationWithRelations[]> {
  return prisma.jobApplication.findMany({
    where: { candidateId },
    select: APPLICATION_SELECT,
    orderBy: { createdAt: "desc" },
  });
}

export async function listApplicationsForJob(
  jobId: string,
  employerId: string
): Promise<ApplicationWithRelations[]> {
  const job = await prisma.job.findUnique({ where: { id: jobId }, select: { employerId: true } });
  if (!job) return [];
  if (job.employerId !== employerId) {
    throw new UnauthorizedError("You don't own this job");
  }

  return prisma.jobApplication.findMany({
    where: { jobId },
    select: APPLICATION_SELECT,
    orderBy: { createdAt: "desc" },
  });
}

export async function updateApplicationStatus(
  applicationId: string,
  employerId: string,
  status: Prisma.JobApplicationUpdateInput["status"]
): Promise<ApplicationWithRelations | null> {
  const existing = await prisma.jobApplication.findUnique({
    where: { id: applicationId },
    select: { job: { select: { employerId: true } } },
  });
  if (!existing) return null;
  if (existing.job.employerId !== employerId) {
    throw new UnauthorizedError("You don't own this job");
  }

  return prisma.jobApplication.update({
    where: { id: applicationId },
    data: { status },
    select: APPLICATION_SELECT,
  });
}
