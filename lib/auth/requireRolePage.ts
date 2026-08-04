import { redirect } from "next/navigation";
import { auth } from "@/lib/auth/auth";
import type { Role } from "@/lib/generated/prisma/client";

// Page-level counterpart to requireRole(): server components can't return a 403 JSON
// response, so redirect instead of throwing UnauthorizedError into the error boundary.
export async function requireRolePage(roles: Role[]) {
  const session = await auth();
  if (!session?.user) redirect("/login");
  if (!roles.includes(session.user.role)) redirect("/");
  return session;
}
