import { cn } from "@/lib/utils";

export function InitialsAvatar({ name, className }: { name: string; className?: string }) {
  const initials = name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0]?.toUpperCase())
    .join("");

  return (
    <span
      className={cn(
        "flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-brand-100 text-sm font-semibold text-brand-700",
        className
      )}
    >
      {initials || "?"}
    </span>
  );
}
