import { cn } from "@/lib/utils";

export function BooleanBadge({ value, trueLabel = "Yes", falseLabel = "No" }: { value: boolean; trueLabel?: string; falseLabel?: string }) {
  return (
    <span
      className={cn(
        "inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium",
        value ? "bg-green-100 text-green-700" : "bg-slate-100 text-slate-500"
      )}
    >
      {value ? trueLabel : falseLabel}
    </span>
  );
}
