import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { ACCESS_COOKIE_NAME } from "@/lib/auth";

const protectedPrefixes = ["/dashboard", "/upload", "/api/upload", "/api/contracts", "/api/parse-contract", "/api/notifications"];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const isProtected = protectedPrefixes.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`));

  if (!isProtected) {
    return NextResponse.next();
  }

  const hasAccess = request.cookies.get(ACCESS_COOKIE_NAME)?.value === "1";

  if (hasAccess) {
    return NextResponse.next();
  }

  if (pathname.startsWith("/api/")) {
    return NextResponse.json({ error: "Payment required" }, { status: 402 });
  }

  const url = request.nextUrl.clone();
  url.pathname = "/unlock";
  return NextResponse.redirect(url);
}

export const config = {
  matcher: ["/dashboard/:path*", "/upload/:path*", "/api/:path*"]
};
