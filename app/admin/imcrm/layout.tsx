import type { ReactNode } from "react";
import { requireRolePage } from "@/lib/auth/requireRolePage";
import { AdminSidebar } from "@/components/imcrm/AdminSidebar";

export default async function ImcrmAdminLayout({ children }: { children: ReactNode }) {
  await requireRolePage(["ADMIN"]);

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-1 gap-8 px-4 py-10">
      <AdminSidebar />
      <div className="min-w-0 flex-1">{children}</div>
    </div>
  );
}
