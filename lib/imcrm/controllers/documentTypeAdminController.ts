import { NextRequest, NextResponse } from "next/server";
import { requireRole } from "@/lib/auth/requireRole";
import { documentTypeSchema, documentTypeUpdateSchema } from "@/lib/imcrm/validators/documentTypeValidator";
import * as service from "@/lib/imcrm/services/documentTypeAdminService";
import { toDocumentTypeResource, toDocumentTypeListResource } from "@/lib/imcrm/resources/documentTypeResource";
import { handlePrismaError } from "@/lib/errors/handlePrismaError";

export async function index(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = Number(searchParams.get("page") ?? "1");
    const pageSize = Number(searchParams.get("pageSize") ?? "20");

    const result = await service.listDocumentTypes({
      page,
      pageSize,
      search: searchParams.get("search") ?? undefined,
      category: searchParams.get("category") ?? undefined,
      quoteTypeId: searchParams.get("quoteTypeId") ? Number(searchParams.get("quoteTypeId")) : undefined,
      isActive: searchParams.has("isActive") ? searchParams.get("isActive") === "true" : undefined,
    });

    return NextResponse.json({ ...result, items: toDocumentTypeListResource(result.items) });
  } catch (e) {
    return handlePrismaError(e);
  }
}

export async function show(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const documentType = await service.getDocumentTypeById(BigInt(id));
    if (!documentType) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json(toDocumentTypeResource(documentType));
  } catch (e) {
    return handlePrismaError(e);
  }
}

export async function store(request: NextRequest) {
  try {
    await requireRole(["ADMIN"]);

    const body = await request.json();
    const parsed = documentTypeSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { message: "Validation failed", errors: parsed.error.flatten().fieldErrors },
        { status: 422 }
      );
    }

    const created = await service.createDocumentType(parsed.data);
    return NextResponse.json(toDocumentTypeResource(created), { status: 201 });
  } catch (e) {
    return handlePrismaError(e);
  }
}

export async function update(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireRole(["ADMIN"]);
    const { id } = await params;

    const body = await request.json();
    const parsed = documentTypeUpdateSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { message: "Validation failed", errors: parsed.error.flatten().fieldErrors },
        { status: 422 }
      );
    }

    const updated = await service.updateDocumentType(BigInt(id), parsed.data);
    return NextResponse.json(toDocumentTypeResource(updated));
  } catch (e) {
    return handlePrismaError(e);
  }
}

export async function destroy(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireRole(["ADMIN"]);
    const { id } = await params;

    await service.deleteDocumentType(BigInt(id));
    return new NextResponse(null, { status: 204 });
  } catch (e) {
    return handlePrismaError(e);
  }
}
