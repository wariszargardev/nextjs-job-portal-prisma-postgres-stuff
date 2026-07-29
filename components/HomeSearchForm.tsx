"use client";

import { useState, useTransition, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export function HomeSearchForm() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [keyword, setKeyword] = useState("");
  const [location, setLocation] = useState("");

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const params = new URLSearchParams();
    if (keyword) params.set("keyword", keyword);
    if (location) params.set("location", location);
    startTransition(() => {
      router.push(`/jobs?${params.toString()}`);
    });
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex w-full max-w-2xl flex-col gap-2 rounded-xl bg-white p-2 shadow-lg sm:flex-row sm:items-center"
    >
      <Input
        placeholder="Job title, keywords"
        value={keyword}
        onChange={(e) => setKeyword(e.target.value)}
        className="border-0 focus-visible:ring-0 sm:flex-1"
      />
      <div className="hidden h-6 w-px bg-slate-200 sm:block" />
      <Input
        placeholder="City or remote"
        value={location}
        onChange={(e) => setLocation(e.target.value)}
        className="border-0 focus-visible:ring-0 sm:flex-1"
      />
      <Button type="submit" size="lg" className="shrink-0" loading={isPending}>
        Find jobs
      </Button>
    </form>
  );
}
