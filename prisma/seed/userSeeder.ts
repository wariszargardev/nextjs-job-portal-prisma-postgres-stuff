import bcrypt from "bcryptjs";
import prisma from "@/lib/db/prisma";

export async function seedUsers() {
  const password = await bcrypt.hash("password123", 10);

  const employer = await prisma.user.upsert({
    where: { email: "employer@example.com" },
    update: {},
    create: {
      name: "Acme Employer",
      email: "employer@example.com",
      password,
      role: "EMPLOYER",
    },
  });

  const candidate = await prisma.user.upsert({
    where: { email: "candidate@example.com" },
    update: {},
    create: {
      name: "Jamie Candidate",
      email: "candidate@example.com",
      password,
      role: "CANDIDATE",
    },
  });

  console.log(`Seeded users: ${employer.email}, ${candidate.email}`);
  return { employer, candidate };
}
