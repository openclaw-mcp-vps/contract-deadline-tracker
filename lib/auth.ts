import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export const ACCESS_COOKIE_NAME = "cdt_paid";

export async function hasPaidAccess() {
  const cookieStore = await cookies();
  return cookieStore.get(ACCESS_COOKIE_NAME)?.value === "1";
}

export function grantPaidAccessCookie(response: NextResponse) {
  response.cookies.set(ACCESS_COOKIE_NAME, "1", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30
  });
}
