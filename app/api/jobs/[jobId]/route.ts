import { getJob, updateJobHandler, deleteJobHandler } from "@/lib/controllers/jobController";

export const GET = getJob;
export const PATCH = updateJobHandler;
export const DELETE = deleteJobHandler;
