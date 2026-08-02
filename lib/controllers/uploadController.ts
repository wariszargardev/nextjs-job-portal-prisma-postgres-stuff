import { NextRequest, NextResponse } from "next/server";
import { requireRole } from "@/lib/auth/requireRole";
import { storeResume } from "@/lib/services/fileService";
import { handlePrismaError } from "@/lib/errors/handlePrismaError";

const MAX_SIZE_BYTES = 5 * 1024 * 1024;
const ALLOWED_TYPES = [
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
];

export async function uploadResume(request: NextRequest) {
  try {
    await requireRole(["CANDIDATE"]);

    const formData = await request.formData();
    const file = formData.get("resume");

    if (!(file instanceof File)) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }
    if (file.size > MAX_SIZE_BYTES) {
      return NextResponse.json({ error: "File is too large (max 5MB)" }, { status: 400 });
    }
    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json({ error: "Only PDF or Word documents are allowed" }, { status: 400 });
    }

    const path = await storeResume(file);
    return NextResponse.json({ path }, { status: 201 });
  } catch (e) {
    return handlePrismaError(e);
  }
}
