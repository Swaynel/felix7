import { withSession } from "supertokens-node/nextjs";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { ensureSuperTokensInit } from "../config/backend";

export async function proxy(request: NextRequest) {
  const requestHeaders = new Headers(request.headers);
  requestHeaders.delete("x-user-id");

  function next() {
    return NextResponse.next({ request: { headers: requestHeaders } });
  }

  if (request.nextUrl.pathname.startsWith("/api/auth")) {
    return next();
  }

  try {
    ensureSuperTokensInit();
  } catch {
    if (request.nextUrl.pathname.startsWith("/api/")) {
      return NextResponse.json({ error: "Authentication is not configured" }, { status: 503 });
    }
    return NextResponse.redirect(new URL("/auth", request.url));
  }

  return withSession(request, async (err, session) => {
    if (err) return NextResponse.json({ error: "session error" }, { status: 500 });
    if (!session) {
      if (request.nextUrl.pathname.startsWith("/api/")) {
        return new NextResponse("Authentication required", { status: 401 });
      }
      return NextResponse.redirect(new URL("/auth", request.url));
    }

    const response = next();
    response.headers.set("x-user-id", session.getUserId());
    return response;
  });
}

export const config = {
  matcher: [
    "/api/download/:path*",
    "/api/orders/:path*",
    "/api/admin/:path*",
    "/api/upload-signature",
    "/admin/:path*",
  ],
};
