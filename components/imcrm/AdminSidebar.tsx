"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [{ href: "/admin/imcrm/document-types", label: "Document types" }];

export function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-56 shrink-0">
      <div className="mb-6 flex items-center gap-2">
        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-900 text-xs font-bold text-white">
          IM
        </span>
        <div className="leading-tight">
          <p className="text-sm font-semibold text-slate-900">imcrm</p>
          <p className="text-xs text-slate-400">Admin</p>
        </div>
      </div>
      <nav className="flex flex-col gap-1">
        {NAV_ITEMS.map((item) => {
          const active = pathname?.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "rounded-md border-l-2 px-3 py-2 text-sm font-medium transition-colors",
                active
                  ? "border-brand-600 bg-brand-50 text-brand-700"
                  : "border-transparent text-slate-600 hover:bg-slate-100"
              )}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
