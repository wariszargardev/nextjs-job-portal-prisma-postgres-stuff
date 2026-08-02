"use client";

import { useState, type ChangeEvent } from "react";
import { useRouter } from "next/navigation";
import { Select } from "@/components/ui/select";

const STATUSES = ["PENDING", "REVIEWING", "SHORTLISTED", "REJECTED", "HIRED"];

export function ApplicationStatusSelect({
  applicationId,
  status,
}: {
  applicationId: string;
  status: string;
}) {
  const router = useRouter();
  const [pending, setPending] = useState(false);

  async function handleChange(event: ChangeEvent<HTMLSelectElement>) {
    setPending(true);
    await fetch(`/api/applications/${applicationId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: event.target.value }),
    });
    setPending(false);
    router.refresh();
  }

  return (
    <Select defaultValue={status} onChange={handleChange} disabled={pending} className="w-40">
      {STATUSES.map((s) => (
        <option key={s} value={s}>
          {s}
        </option>
      ))}
    </Select>
  );
}
