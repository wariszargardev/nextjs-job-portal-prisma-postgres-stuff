import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth/auth";
import { getDocumentTypes } from "@/lib/imcrm/services/documentTypeService";
import { getQuoteTypeId } from "@/lib/imcrm/services/quoteTypeService";
import { hasBorPermission } from "@/lib/imcrm/auth/hasBorPermission";
import { toDocumentTypeListResource } from "@/lib/imcrm/resources/documentTypeResource";
import { handlePrismaError } from "@/lib/errors/handlePrismaError";

function toResponse(result: Awaited<ReturnType<typeof getDocumentTypes>>) {
  return {
    documentTypes: Object.fromEntries(
      Object.entries(result.orderedDocumentTypesByCategory).map(([cat, docs]) => [cat, toDocumentTypeListResource(docs)])
    ),
    paymentDocuments: toDocumentTypeListResource(result.paymentDocuments),
  };
}

// imcrm: read path for a given quote — ported from blanka's getQuoteDocumentsToReceive.
export async function getQuoteDocumentsToReceive(
  request: NextRequest,
  { params }: { params: Promise<{ quoteType: string }> }
) {
  try {
    const { quoteType } = await params;
    const session = await auth();

    const { searchParams } = new URL(request.url);
    const businessTypeOfInsurance = searchParams.get("businessTypeOfInsurance");
    const businessTypeOfCustomer = searchParams.get("businessTypeOfCustomer");
    const quoteTypeCode = searchParams.get("quoteTypeCode");
    const registrationType = searchParams.get("registrationType");
    const vehicleUse = searchParams.get("vehicleUse");

    const quoteTypeId = await getQuoteTypeId(quoteType);
    if (quoteTypeId === null) {
      return NextResponse.json({ error: "Unknown quote type" }, { status: 404 });
    }

    const result = await getDocumentTypes({
      quoteTypeId,
      businessTypeOfInsurance: businessTypeOfInsurance ? Number(businessTypeOfInsurance) : null,
      businessTypeOfCustomer,
      quoteTypeCode,
      quote: { registrationType, vehicleUse },
      hasBorPermission: hasBorPermission(session),
    });

    return NextResponse.json(toResponse(result));
  } catch (e) {
    return handlePrismaError(e);
  }
}

// imcrm: BOR's separate document-types endpoint (see plan §7) — same service, consolidated,
// gated by its own permission check rather than the quote-context session check above.
export async function getBorDocumentTypes(request: NextRequest) {
  try {
    const session = await auth();
    if (!hasBorPermission(session)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const quoteTypeIdParam = searchParams.get("quoteTypeId");
    if (!quoteTypeIdParam) {
      return NextResponse.json({ error: "quoteTypeId is required" }, { status: 422 });
    }

    const result = await getDocumentTypes({
      quoteTypeId: Number(quoteTypeIdParam),
      businessTypeOfInsurance: searchParams.get("businessTypeOfInsurance")
        ? Number(searchParams.get("businessTypeOfInsurance"))
        : null,
      businessTypeOfCustomer: searchParams.get("businessTypeOfCustomer"),
      quoteTypeCode: searchParams.get("quoteTypeCode"),
      hasBorPermission: true,
    });

    return NextResponse.json(toResponse(result));
  } catch (e) {
    return handlePrismaError(e);
  }
}
