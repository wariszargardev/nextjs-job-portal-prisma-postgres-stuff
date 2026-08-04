"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

export function DocumentTypeActions({ id, isActive }: { id: string; isActive: boolean }) {
  const router = useRouter();
  const [togglePending, setTogglePending] = useState(false);
  const [deletePending, setDeletePending] = useState(false);

  async function toggleActive() {
    setTogglePending(true);
    await fetch(`/api/imcrm/document-types/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isActive: !isActive }),
    });
    setTogglePending(false);
    router.refresh();
  }

  async function handleDelete() {
    if (!window.confirm("Delete this document type? This cannot be undone.")) return;
    setDeletePending(true);
    await fetch(`/api/imcrm/document-types/${id}`, { method: "DELETE" });
    setDeletePending(false);
    router.refresh();
  }

  return (
    <div className="flex gap-2">
      <Button variant="outline" size="sm" loading={togglePending} disabled={deletePending} onClick={toggleActive}>
        {isActive ? "Deactivate" : "Activate"}
      </Button>
      <Button variant="destructive" size="sm" loading={deletePending} disabled={togglePending} onClick={handleDelete}>
        Delete
      </Button>
    </div>
  );
}
