import prisma from "@/lib/db/prisma";
import type { Job, User } from "@/lib/generated/prisma/client";

export async function seedApplications(candidate: User, jobs: Job[]) {
  const [firstJob] = jobs;
  if (!firstJob) return [];

  const application = await prisma.jobApplication.upsert({
    where: { jobId_candidateId: { jobId: firstJob.id, candidateId: candidate.id } },
    update: {},
    create: {
      jobId: firstJob.id,
      candidateId: candidate.id,
      coverNote: "I'd love to help build this out — see my resume attached.",
    },
  });

  console.log(`Seeded application for ${candidate.email} -> ${firstJob.title}`);
  return [application];
}
