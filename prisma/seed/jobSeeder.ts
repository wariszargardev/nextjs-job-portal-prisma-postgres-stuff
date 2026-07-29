import prisma from "@/lib/db/prisma";
import type { User } from "@/lib/generated/prisma/client";

export async function seedJobs(employer: User) {
  const jobs = await Promise.all(
    [
      {
        title: "Senior Frontend Engineer",
        description: "Build and maintain our customer-facing React app.",
        location: "Remote",
        department: "Engineering",
      },
      {
        title: "Product Designer",
        description: "Own the end-to-end design of our core workflows.",
        location: "New York, NY",
        department: "Design",
      },
      {
        title: "Backend Engineer (Node.js)",
        description: "Design and scale our Prisma/Postgres data layer.",
        location: "Remote",
        department: "Engineering",
      },
    ].map((job) =>
      prisma.job.create({
        data: { ...job, employerId: employer.id },
      })
    )
  );

  console.log(`Seeded ${jobs.length} jobs for ${employer.email}`);
  return jobs;
}
