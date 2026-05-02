import { NextResponse } from "next/server";
import { consumeAccessToken } from "@/lib/database";
import { grantPaidAccessCookie } from "@/lib/auth";

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as { token?: string } | null;
  const token = body?.token?.trim();

  if (!token) {
    return NextResponse.json({ error: "token is required" }, { status: 400 });
  }

  const email = await consumeAccessToken(token);
  if (!email) {
    return NextResponse.json({ error: "Token is invalid or already used" }, { status: 400 });
  }

  const response = NextResponse.json({ ok: true, email });
  grantPaidAccessCookie(response);
  return response;
}
