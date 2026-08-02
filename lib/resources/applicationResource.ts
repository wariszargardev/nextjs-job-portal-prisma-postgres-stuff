import type { ApplicationWithRelations } from "@/lib/services/applicationService";

export function toApplicationResource(application: ApplicationWithRelations) {
  return {
    id: application.id,
    status: application.status,
    coverNote: application.coverNote,
    resumePath: application.resumePath,
    job: application.job,
    candidate: application.candidate,
    createdAt: application.createdAt.toISOString(),
    updatedAt: application.updatedAt.toISOString(),
  };
}

export function toApplicationListResource(applications: ApplicationWithRelations[]) {
  return applications.map(toApplicationResource);
}
