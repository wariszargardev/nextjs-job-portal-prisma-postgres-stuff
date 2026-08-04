import prisma from "@/lib/db/prisma";
import { seedUsers } from "./userSeeder";
import { seedJobs } from "./jobSeeder";
import { seedApplications } from "./applicationSeeder";
import { seedQuoteTypes } from "./imcrm/quoteTypeSeeder";
import { seedDocumentTypes } from "./imcrm/documentTypeSeeder";
import { seedAdmin } from "./imcrm/adminSeeder";

async function main() {
  const { employer, candidate } = await seedUsers();
  const jobs = await seedJobs(employer);
  await seedApplications(candidate, jobs);

  await seedAdmin();
  await seedQuoteTypes();
  await seedDocumentTypes();
}

main()
  .catch((e) => {
    console.error(e);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
