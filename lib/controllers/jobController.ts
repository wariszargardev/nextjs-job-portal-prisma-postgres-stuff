import { NextRequest, NextResponse } from "next/server";
import {
  listPublishedJobs,
  getPublishedJobById,
  createJob,
  updateJob,
  deleteJob,
} from "@/lib/services/jobService";
import { toJobListResource, toJobResource } from "@/lib/resources/jobResource";
import { handlePrismaError } from "@/lib/errors/handlePrismaError";
import { requireRole } from "@/lib/auth/requireRole";
import { createJobSchema, updateJobSchema } from "@/lib/validators/jobValidator";

export async function listJobs(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const keyword = searchParams.get("keyword") ?? undefined;
    const location = searchParams.get("location") ?? undefined;
    const page = Number(searchParams.get("page") ?? "1");
    const perPage = Number(searchParams.get("perPage") ?? "10");

    const result = await listPublishedJobs({ keyword, location, page, perPage });

    return NextResponse.json({ ...result, items: toJobListResource(result.items) });
  } catch (e) {
    return handlePrismaError(e);
  }
}

export async function getJob(
  _request: NextRequest,
  { params }: { params: Promise<{ jobId: string }> }
) {
  try {
    const { jobId } = await params;
    const job = await getPublishedJobById(jobId);
    if (!job) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json(toJobResource(job));
  } catch (e) {
    return handlePrismaError(e);
  }
}

export async function createJobHandler(request: NextRequest) {
  try {
    const session = await requireRole(["EMPLOYER"]);

    const body = await request.json();
    const parsed = createJobSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { message: "Validation failed", errors: parsed.error.flatten().fieldErrors },
        { status: 422 }
      );
    }

    const job = await createJob(session.user.id, parsed.data);
    return NextResponse.json(toJobResource(job), { status: 201 });
  } catch (e) {
    return handlePrismaError(e);
  }
}

export async function updateJobHandler(
  request: NextRequest,
  { params }: { params: Promise<{ jobId: string }> }
) {
  try {
    const session = await requireRole(["EMPLOYER"]);
    const { jobId } = await params;

    const body = await request.json();
    const parsed = updateJobSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { message: "Validation failed", errors: parsed.error.flatten().fieldErrors },
        { status: 422 }
      );
    }

    const job = await updateJob(jobId, session.user.id, parsed.data);
    if (!job) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json(toJobResource(job));
  } catch (e) {
    return handlePrismaError(e);
  }
}

export async function deleteJobHandler(
  _request: NextRequest,
  { params }: { params: Promise<{ jobId: string }> }
) {
  try {
    const session = await requireRole(["EMPLOYER"]);
    const { jobId } = await params;

    const deleted = await deleteJob(jobId, session.user.id);
    if (!deleted) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return new NextResponse(null, { status: 204 });
  } catch (e) {
    return handlePrismaError(e);
  }
}
