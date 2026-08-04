import bcrypt from "bcryptjs";
import prisma from "@/lib/db/prisma";

// imcrm: ADMIN is the role gate for the imcrm document-types admin pages/API —
// seed one so there's an account that can actually reach them locally.
export async function seedAdmin() {
  const password = await bcrypt.hash("password123", 10);

  const admin = await prisma.user.upsert({
    where: { email: "admin@example.com" },
    update: {},
    create: {
      name: "imcrm Admin",
      email: "admin@example.com",
      password,
      role: "ADMIN",
    },
  });

  console.log(`imcrm: seeded admin user: ${admin.email}`);
  return admin;
}
