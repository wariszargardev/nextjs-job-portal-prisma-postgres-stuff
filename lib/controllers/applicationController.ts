import { NextRequest, NextResponse } from "next/server";
import { Prisma } from "@/lib/generated/prisma/client";
import { requireRole } from "@/lib/auth/requireRole";
import {
  createApplication,
  listApplicationsByCandidate,
  listApplicationsForJob,
  updateApplicationStatus,
} from "@/lib/services/applicationService";
import { toApplicationListResource, toApplicationResource } from "@/lib/resources/applicationResource";
import { applySchema, updateApplicationStatusSchema } from "@/lib/validators/applicationValidator";
import { handlePrismaError } from "@/lib/errors/handlePrismaError";

export async function listMyApplications() {
  try {
    const session = await requireRole(["CANDIDATE"]);
    const applications = await listApplicationsByCandidate(session.user.id);
    return NextResponse.json(toApplicationListResource(applications));
  } catch (e) {
    return handlePrismaError(e);
  }
}

export async function applyToJob(request: NextRequest) {
  try {
    const session = await requireRole(["CANDIDATE"]);

    const body = await request.json();
    const parsed = applySchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { message: "Validation failed", errors: parsed.error.flatten().fieldErrors },
        { status: 422 }
      );
    }

    const application = await createApplication(session.user.id, parsed.data);
    return NextResponse.json(toApplicationResource(application), { status: 201 });
  } catch (e) {
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002") {
      return NextResponse.json({ error: "You've already applied to this job" }, { status: 409 });
    }
    return handlePrismaError(e);
  }
}

export async function listApplicantsForJobHandler(
  request: NextRequest,
  { params }: { params: Promise<{ jobId: string }> }
) {
  try {
    const session = await requireRole(["EMPLOYER"]);
    const { jobId } = await params;
    const applications = await listApplicationsForJob(jobId, session.user.id);
    return NextResponse.json(toApplicationListResource(applications));
  } catch (e) {
    return handlePrismaError(e);
  }
}

export async function updateApplicationStatusHandler(
  request: NextRequest,
  { params }: { params: Promise<{ appId: string }> }
) {
  try {
    const session = await requireRole(["EMPLOYER"]);
    const { appId } = await params;

    const body = await request.json();
    const parsed = updateApplicationStatusSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { message: "Validation failed", errors: parsed.error.flatten().fieldErrors },
        { status: 422 }
      );
    }

    const application = await updateApplicationStatus(appId, session.user.id, parsed.data.status);
    if (!application) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json(toApplicationResource(application));
  } catch (e) {
    return handlePrismaError(e);
  }
}
