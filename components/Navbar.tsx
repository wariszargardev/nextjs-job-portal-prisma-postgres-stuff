import Link from "next/link";
import { auth } from "@/lib/auth/auth";
import { SignOutButton } from "@/components/SignOutButton";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export async function Navbar() {
  const session = await auth();

  return (
    <header className="sticky top-0 z-10 border-b border-slate-200 bg-white/95 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2 font-semibold text-slate-900">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-600 text-sm font-bold text-white">
            AI
          </span>
          <span className="hidden sm:inline">Afia Insurance Job Portal</span>
        </Link>

        <nav className="flex items-center gap-5 text-sm font-medium text-slate-600">
          <Link href="/jobs" className="hover:text-brand-600">
            Browse jobs
          </Link>

          {session?.user ? (
            <>
              {session.user.role === "EMPLOYER" ? (
                <Link href="/employer/jobs" className="hover:text-brand-600">
                  My jobs
                </Link>
              ) : session.user.role === "ADMIN" ? (
                <Link href="/admin/imcrm/document-types" className="hover:text-brand-600">
                  Document types
                </Link>
              ) : (
                <Link href="/candidate/applications" className="hover:text-brand-600">
                  My applications
                </Link>
              )}
              <div className="flex items-center gap-2">
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-100 text-xs font-semibold text-brand-700">
                  {session.user.name?.slice(0, 1).toUpperCase()}
                </span>
                <span className="hidden text-slate-500 sm:inline">{session.user.name}</span>
              </div>
              <SignOutButton />
            </>
          ) : (
            <>
              <Link href="/login" className="hover:text-brand-600">
                Sign in
              </Link>
              <Link href="/register" className={cn(buttonVariants({ size: "sm" }))}>
                Register
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
