import prisma from "@/lib/db/prisma";
import { seedUsers } from "./userSeeder";
import { seedJobs } from "./jobSeeder";
import { seedApplications } from "./applicationSeeder";

async function main() {
  const { employer, candidate } = await seedUsers();
  const jobs = await seedJobs(employer);
  await seedApplications(candidate, jobs);
}

main()
  .catch((e) => {
    console.error(e);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
