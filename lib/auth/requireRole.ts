import { auth } from "@/lib/auth/auth";
import { UnauthorizedError } from "@/lib/errors/UnauthorizedError";
import type { Role } from "@/lib/generated/prisma/client";

export async function requireRole(roles: Role[]) {
  const session = await auth();
  if (!session?.user || !roles.includes(session.user.role)) {
    throw new UnauthorizedError();
  }
  return session;
}
