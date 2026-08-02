import { listJobs, createJobHandler } from "@/lib/controllers/jobController";

export const GET = listJobs;
export const POST = createJobHandler;
