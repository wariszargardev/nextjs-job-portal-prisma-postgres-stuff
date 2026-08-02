import { NextResponse } from "next/server";
import { Prisma } from "@/lib/generated/prisma/client";
import { UnauthorizedError } from "./UnauthorizedError";

export function handlePrismaError(e: unknown) {
  if (e instanceof Prisma.PrismaClientKnownRequestError) {
    if (e.code === "P2002") return NextResponse.json({ error: "Already exists" }, { status: 409 });
    if (e.code === "P2025") return NextResponse.json({ error: "Not found" }, { status: 404 });
    if (e.code === "P2003") return NextResponse.json({ error: "Invalid reference" }, { status: 400 });
  }
  if (e instanceof UnauthorizedError) {
    return NextResponse.json({ error: e.message }, { status: 403 });
  }
  console.error(e);
  return NextResponse.json({ error: "Internal error" }, { status: 500 });
}
