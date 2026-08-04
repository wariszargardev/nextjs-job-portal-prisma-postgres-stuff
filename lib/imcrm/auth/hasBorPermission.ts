import type { Session } from "next-auth";

// imcrm: blanka gates BOR-only document types with `Auth::user()->hasPermissionTo("BOR_DOCUMENT_UPLOAD")`,
// a permission this app doesn't model yet (roles only: EMPLOYER/CANDIDATE/ADMIN).
// TODO(blanka): replace with a real permission check once this app has one — until then,
// ADMIN is treated as the closest equivalent so the BOR-only codes aren't exposed to everyone.
export function hasBorPermission(session: Session | null): boolean {
  return session?.user?.role === "ADMIN";
}
