"use client";

import { useSyncExternalStore, type MouseEvent } from "react";
import { cn } from "@/lib/utils";

const STORAGE_KEY = "savedJobs";
const listeners = new Set<() => void>();

function readSavedJobs(): string[] {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "[]");
  } catch {
    return [];
  }
}

function writeSavedJobs(jobIds: string[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(jobIds));
  listeners.forEach((listener) => listener());
}

function subscribe(onStoreChange: () => void) {
  listeners.add(onStoreChange);
  return () => listeners.delete(onStoreChange);
}

function getServerSnapshot() {
  return false;
}

export function SaveJobButton({ jobId }: { jobId: string }) {
  const saved = useSyncExternalStore(subscribe, () => readSavedJobs().includes(jobId), getServerSnapshot);

  function toggle(event: MouseEvent<HTMLButtonElement>) {
    event.preventDefault();
    event.stopPropagation();

    const current = readSavedJobs();
    const next = current.includes(jobId)
      ? current.filter((id) => id !== jobId)
      : [...current, jobId];

    writeSavedJobs(next);
  }

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={saved ? "Unsave job" : "Save job"}
      aria-pressed={saved}
      className="rounded-full p-1.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-brand-600"
    >
      <svg
        className={cn("h-5 w-5", saved && "text-brand-600")}
        viewBox="0 0 24 24"
        fill={saved ? "currentColor" : "none"}
        stroke="currentColor"
        strokeWidth="2"
      >
        <path
          d="M6 3h12a1 1 0 0 1 1 1v17l-7-4-7 4V4a1 1 0 0 1 1-1Z"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </button>
  );
}
