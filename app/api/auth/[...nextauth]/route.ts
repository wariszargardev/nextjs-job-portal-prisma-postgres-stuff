import { NextRequest, NextResponse } from "next/server";
import { handlers } from "@/lib/auth/auth";
import { rateLimit } from "@/lib/rateLimit";

export const GET = handlers.GET;

export async function POST(request: NextRequest) {
  const isCredentialsSignIn = request.nextUrl.pathname.includes("callback/credentials");

  if (isCredentialsSignIn) {
    const ip = request.headers.get("x-forwarded-for") ?? "unknown";
    const allowed = rateLimit(`auth:${ip}`, 10, 60_000);
    if (!allowed) {
      return NextResponse.json({ error: "Too many attempts. Try again later." }, { status: 429 });
    }
  }

  return handlers.POST(request);
}
