import { cn } from "@/lib/utils";

const CATEGORY_STYLES: Record<string, string> = {
  QUOTE: "bg-blue-100 text-blue-700",
  MEMBER: "bg-purple-100 text-purple-700",
  ISSUING_DOCUMENTS: "bg-amber-100 text-amber-700",
  SEND_UPDATE: "bg-teal-100 text-teal-700",
  ENDORSEMENT_DOCUMENTS: "bg-rose-100 text-rose-700",
};

export function CategoryBadge({ category }: { category: string }) {
  return (
    <span
      className={cn(
        "inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium whitespace-nowrap",
        CATEGORY_STYLES[category] ?? "bg-slate-100 text-slate-700"
      )}
    >
      {category.replaceAll("_", " ")}
    </span>
  );
}
