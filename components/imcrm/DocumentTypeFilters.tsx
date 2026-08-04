"use client";

import { useState, useTransition, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";

const CATEGORIES = ["QUOTE", "MEMBER", "ISSUING_DOCUMENTS", "SEND_UPDATE", "ENDORSEMENT_DOCUMENTS"];

export function DocumentTypeFilters({
  defaultSearch,
  defaultCategory,
}: {
  defaultSearch?: string;
  defaultCategory?: string;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [search, setSearch] = useState(defaultSearch ?? "");
  const [category, setCategory] = useState(defaultCategory ?? "");

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const params = new URLSearchParams();
    if (search) params.set("search", search);
    if (category) params.set("category", category);
    startTransition(() => {
      router.push(`/admin/imcrm/document-types?${params.toString()}`);
    });
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-wrap gap-3">
      <Input
        placeholder="Search by code or text"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="max-w-xs"
      />
      <Select value={category} onChange={(e) => setCategory(e.target.value)} className="max-w-xs">
        <option value="">All categories</option>
        {CATEGORIES.map((cat) => (
          <option key={cat} value={cat}>
            {cat}
          </option>
        ))}
      </Select>
      <Button type="submit" variant="outline" loading={isPending}>
        Filter
      </Button>
    </form>
  );
}
