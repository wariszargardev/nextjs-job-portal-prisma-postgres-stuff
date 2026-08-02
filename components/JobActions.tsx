"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

export function JobActions({ jobId, isPublished }: { jobId: string; isPublished: boolean }) {
  const router = useRouter();
  const [togglePending, setTogglePending] = useState(false);
  const [deletePending, setDeletePending] = useState(false);

  async function togglePublish() {
    setTogglePending(true);
    await fetch(`/api/jobs/${jobId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isPublished: !isPublished }),
    });
    setTogglePending(false);
    router.refresh();
  }

  async function handleDelete() {
    if (!window.confirm("Delete this job? This cannot be undone.")) return;
    setDeletePending(true);
    await fetch(`/api/jobs/${jobId}`, { method: "DELETE" });
    setDeletePending(false);
    router.refresh();
  }

  return (
    <div className="flex gap-2">
      <Button variant="outline" size="sm" loading={togglePending} disabled={deletePending} onClick={togglePublish}>
        {isPublished ? "Unpublish" : "Publish"}
      </Button>
      <Button variant="destructive" size="sm" loading={deletePending} disabled={togglePending} onClick={handleDelete}>
        Delete
      </Button>
    </div>
  );
}
