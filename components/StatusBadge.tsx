import { cn } from "@/lib/utils";

const STATUS_STYLES: Record<string, string> = {
  PENDING: "bg-slate-100 text-slate-700",
  REVIEWING: "bg-blue-100 text-blue-700",
  SHORTLISTED: "bg-amber-100 text-amber-700",
  REJECTED: "bg-red-100 text-red-700",
  HIRED: "bg-green-100 text-green-700",
};

export function StatusBadge({ status }: { status: string }) {
  return (
    <span
      className={cn(
        "rounded-full px-2.5 py-0.5 text-xs font-medium",
        STATUS_STYLES[status] ?? "bg-slate-100 text-slate-700"
      )}
    >
      {status}
    </span>
  );
}
