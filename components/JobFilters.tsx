"use client";

import { useState, useTransition, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export function JobFilters({
  defaultKeyword,
  defaultLocation,
}: {
  defaultKeyword?: string;
  defaultLocation?: string;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [keyword, setKeyword] = useState(defaultKeyword ?? "");
  const [location, setLocation] = useState(defaultLocation ?? "");

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
    <form onSubmit={handleSubmit} className="flex flex-wrap gap-3">
      <Input
        placeholder="Keyword (title or description)"
        value={keyword}
        onChange={(e) => setKeyword(e.target.value)}
        className="max-w-xs"
      />
      <Input
        placeholder="Location"
        value={location}
        onChange={(e) => setLocation(e.target.value)}
        className="max-w-xs"
      />
      <Button type="submit" variant="outline" loading={isPending}>
        Filter
      </Button>
    </form>
  );
}
