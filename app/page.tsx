import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { HomeSearchForm } from "@/components/HomeSearchForm";

export default function Home() {
  return (
    <div className="bg-brand-glow flex flex-1 flex-col">
      <section className="flex flex-1 flex-col items-center justify-center gap-6 px-4 py-24 text-center">
        <h1 className="max-w-2xl text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl">
          Find your next hire, <span className="text-brand-600">or your next job.</span>
        </h1>
        <p className="max-w-xl text-lg text-slate-600">
          A two-sided job marketplace — employers post roles, candidates apply in a click.
        </p>

        <HomeSearchForm />

        <div className="flex flex-wrap items-center justify-center gap-3 text-sm text-slate-500">
          <span>Popular:</span>
          <Link href="/jobs?location=Remote" className="hover:text-brand-600 hover:underline">
            Remote
          </Link>
          <Link href="/jobs?keyword=Engineer" className="hover:text-brand-600 hover:underline">
            Engineering
          </Link>
          <Link href="/jobs?keyword=Design" className="hover:text-brand-600 hover:underline">
            Design
          </Link>
        </div>

        <Link href="/register" className={cn(buttonVariants({ variant: "outline" }), "mt-2")}>
          Post a job as an employer
        </Link>
      </section>
    </div>
  );
}
